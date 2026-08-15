import{s as B,t as E,C as I,d as q,a as L,g as H,f as b,b as et,c as at}from"./index-HrCilPJ3.js";import{query as S,limit as O,collection as V,where as st,getDocs as k}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function ht(d,i){const h=i?.displayName||"مدير النظام";d.innerHTML=`
    <!-- New Advanced Dashboard Hero -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${h} 👋</h1>
        <p>إليك ملخص أداء شركتك والتحليلات المالية المباشرة</p>
      </div>
      <div class="hero-actions">
        <div class="quick-filters" style="margin:0; border:none; background:transparent;">
          <button class="quick-filter-btn" onclick="dashSetRange('today')">اليوم</button>
          <button class="quick-filter-btn" onclick="dashSetRange('week')">الأسبوع</button>
          <button class="quick-filter-btn active" onclick="dashSetRange('month')">هذا الشهر</button>
          <button class="quick-filter-btn" onclick="dashSetRange('last_month')">الشهر الماضي</button>
        </div>
        <div style="width:1px; height:24px; background:var(--border-soft); margin:0 8px;"></div>
        <input type="date" id="dash-from" value="${B()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <span style="color:var(--text-2); font-size:12px;">إلى</span>
        <input type="date" id="dash-to" value="${E()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="margin-right:8px; border-radius:8px; padding:6px 16px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`,window.dashSetRange=s=>{const o=E(),l=new Date;if(document.querySelectorAll(".quick-filter-btn").forEach(r=>r.classList.remove("active")),event&&event.target&&event.target.classList.add("active"),s==="today")document.getElementById("dash-from").value=o,document.getElementById("dash-to").value=o;else if(s==="week"){const r=new Date(l);r.setDate(l.getDate()-l.getDay()+1),document.getElementById("dash-from").value=r.toISOString().split("T")[0],document.getElementById("dash-to").value=o}else if(s==="month")document.getElementById("dash-from").value=B(),document.getElementById("dash-to").value=o;else if(s==="last_month"){const r=new Date(l.getFullYear(),l.getMonth()-1,1),u=new Date(l.getFullYear(),l.getMonth(),0);document.getElementById("dash-from").value=r.toISOString().split("T")[0],document.getElementById("dash-to").value=u.toISOString().split("T")[0]}loadDashboard()},window.loadDashboard=async()=>{const s=document.getElementById("dash-from")?.value||B(),o=document.getElementById("dash-to")?.value||E();await Q(s,o)},await Q(B(),E())}async function Q(d,i){const h=document.getElementById("dash-content");if(!h)return;h.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>';let s=[],o=[],l=[],r=[],u=[],m=[],j=[],y=[];const g=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"";h.innerHTML=`
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${[1,2,3,4].map(()=>`
          <div class="kpi-card" style="min-height:110px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div>
            <div class="skeleton" style="width:80%;height:22px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:50%;height:12px;"></div>
          </div>`).join("")}
      </div>
      <div class="content-grid-sidebar mb-24">
        <div class="card" style="border-radius:16px;min-height:280px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:280px;border-radius:16px;"></div>
        </div>
        <div class="card" style="border-radius:16px;min-height:280px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:280px;border-radius:16px;"></div>
        </div>
      </div>
    </div>`;try{const t=S(I.salesInvoices(),O(5e3)),a=S(I.purchaseInvoices(),O(5e3)),n=S(I.receipts(),O(5e3)),v=S(V(q,`companies/${L}/collections`),O(5e3)),C=S(V(q,`companies/${L}/journalEntries`),st("status","==","posted")),D=V(q,`companies/${L}/chartOfAccounts`),[_,J,Z,K,U,X,tt,T]=await Promise.all([k(t).catch(e=>(console.warn(e),{docs:[]})),k(a).catch(e=>(console.warn(e),{docs:[]})),H(I.stockByWarehouse()).catch(e=>(console.warn(e),[])),k(n).catch(e=>(console.warn(e),{docs:[]})),k(C).catch(e=>(console.warn(e),{docs:[]})),k(D).catch(e=>(console.warn(e),{docs:[]})),k(v).catch(e=>(console.warn(e),{docs:[]})),H(I.products()).catch(e=>(console.warn(e),[]))]);s=_.docs.map(e=>({id:e.id,...e.data()})),o=J.docs.map(e=>({id:e.id,...e.data()})),r=K.docs.map(e=>({id:e.id,...e.data()})),u=tt.docs.map(e=>({id:e.id,...e.data()})),m=U.docs.map(e=>e.data()),j=X.docs.map(e=>({id:e.id,...e.data()})),y=Array.isArray(T)?T:T.docs?T.docs.map(e=>({id:e.id,...e.data()})):[],l=Z.filter(e=>e.stockStatus==="out"||e.stockStatus==="low").slice(0,10),s=s.filter(e=>{const p=g(e);return(!d||p>=d)&&(!i||p<=i)}),o=o.filter(e=>{const p=g(e);return(!d||p>=d)&&(!i||p<=i)}),r=r.filter(e=>{const p=g(e);return(!d||p>=d)&&(!i||p<=i)}),u=u.filter(e=>{const p=g(e);return(!d||p>=d)&&(!i||p<=i)})}catch(t){console.error("Dashboard fetch error",t)}const x=s.filter(t=>t.status!=="cancelled").reduce((t,a)=>t+(a.totalWithVat||a.total||0),0),w=s.filter(t=>t.status!=="cancelled").length,F=w>0?x/w:0,c=s.filter(t=>t.status!=="cancelled"),f={};y.forEach(t=>{f[t.id]=parseFloat(t.costPrice||t.purchasePrice||0)});let $=0,A=0;c.forEach(t=>{const a=parseFloat(t.subtotal||t.totalWithoutVat||t.netTotal||(t.totalWithVat?t.totalWithVat/1.15:0));$+=a,(t.items||t.lines||[]).forEach(n=>{const v=parseFloat(n.qty||n.quantity||0),C=parseFloat(n.costPrice||n.purchasePrice||f[n.productId||n.id]||0);A+=v*C})}),A===0&&m.length>0&&m.filter(t=>t.type==="salesCOGS"||t.sourceType==="salesCOGS"||t.description&&t.description.includes("تكلفة بضاعة")).forEach(t=>{A+=parseFloat(t.totalDebit||t.amount||0)});const M=$-A,G=$>0?(M/$*100).toFixed(1):"0.0",N=r.filter(t=>t.entityType==="customer"||!t.entityType||t.type==="receipt").reduce((t,a)=>t+(a.amount||0),0),Y=Math.max(0,x-N);o.filter(t=>t.status!=="cancelled").reduce((t,a)=>{const n=parseFloat(a.subtotal||a.totalBeforeTax||a.totalWithoutVat||0),v=parseFloat(a.totalWithVat||a.total||a.grandTotal||0);return t+(n>0?n:v/1.15)},0),o.filter(t=>t.status!=="cancelled").reduce((t,a)=>t+(a.totalWithVat||a.total||a.grandTotal||0),0);const W={};s.forEach(t=>{let a=t.repName||t.repId;(!a||a==="بدون مندوب"||a==="المندوب الرئيسي")&&(a="المستودع الرئيسي (مبيعات مباشرة)"),W[a]=(W[a]||0)+(t.totalWithVat||t.total||0)});const z=Object.entries(W).sort(([,t],[,a])=>a-t).slice(0,5),P=s.slice(0,8);h.innerHTML=`
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${R("💰","إجمالي المبيعات",b(x),`بدون ضريبة: ${b($)}`,"sales","")}
        ${R("🧾","عدد الفواتير",w.toLocaleString("ar"),`متوسط الفاتورة: ${b(F)}`,"invoices","")}
        ${R("✅","المبالغ المحصلة",b(N),`المتبقي: ${b(Y)}`,"receipts","")}
        ${R("📈","مجمل الربح",b(M),`هامش الربح: ${G}%`,"profit",M>=0?"up":"down")}
      </div>

      <!-- Charts & Top Reps Row -->
      <div class="content-grid-sidebar mb-24">
        <!-- Daily Sales Chart Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:20px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:36px; height:36px; font-size:18px; border-radius:8px;">📈</div>
              <div>
                <h3 style="font-size:16px;font-family:var(--font-heading);color:var(--text-0);">تحليل المبيعات اليومية</h3>
                <span class="text-2" style="font-size:12px;">الفترة: ${d} — ${i}</span>
              </div>
            </div>
          </div>
          <div class="card-body" style="padding:24px;">
            <div class="chart-container" style="height:280px;position:relative;">
              <canvas id="sales-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Top Sales Reps Ranking Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:20px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:36px; height:36px; font-size:18px; border-radius:8px;">🏆</div>
              <h3 style="font-size:16px;font-family:var(--font-heading);color:var(--text-0);">نخبة المناديب</h3>
            </div>
          </div>
          <div class="card-body" style="padding:20px;">
            ${z.length===0?`
              <div class="empty-state" style="padding:40px 0;">
                <div class="empty-icon">🚚</div>
                <h3>لا توجد مبيعات</h3>
                <button class="btn btn-secondary btn-sm mt-12" onclick="window.seedDemoData()">تحميل بيانات تجريبية 🌾</button>
              </div>`:z.map(([t,a],n)=>{const v=z[0][1],C=v>0?a/v*100:0,D=["#E58A2B","#00B4D8","#2DD4BF","#6366F1","#A855F7"];return`
                <div style="margin-bottom:20px;">
                  <div class="flex items-center justify-between mb-8" style="font-size:13px;">
                    <span class="font-heading font-semibold" style="color:#fff;">
                      <span style="display:inline-block; width:20px; height:20px; text-align:center; background:rgba(255,255,255,0.1); border-radius:50%; line-height:20px; margin-left:6px; font-size:11px;">${n+1}</span>
                      ${t}
                    </span>
                    <span class="mono font-bold" style="color:${D[n]}">${b(a)}</span>
                  </div>
                  <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.05);">
                    <div class="fill" style="width:${C}%; background:${D[n]}; border-radius:4px; box-shadow: 0 0 10px ${D[n]}80;"></div>
                  </div>
                </div>`}).join("")}
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table (Full Width) -->
      <div class="card mb-24" style="border-radius:16px;">
        <div class="card-header" style="padding:20px;">
          <h3 style="font-size:16px;font-family:var(--font-heading);">🧾 الفواتير صدارة النظام</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigate('sales-invoices')">عرض السجل الكامل</button>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>الرقم المرجعي</th>
                <th>العميل</th>
                <th>المندوب</th>
                <th>التاريخ</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th style="text-align:left;">المبلغ الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${P.length===0?`
                <tr><td colspan="7" style="text-align:center;color:var(--text-2);padding:40px;">
                  <div class="empty-icon" style="font-size:36px;margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة</div>
                </td></tr>`:P.map(t=>`
                <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                  <td class="mono text-indigo font-bold">#${t.number||t.id.slice(0,8)}</td>
                  <td class="font-semibold" style="color:var(--text-0);">${t.customerName||"عميل نقدي"}</td>
                  <td class="dim">${t.repName||"—"}</td>
                  <td class="dim">${et(t.createdAt)}</td>
                  <td><span class="badge ${t.paymentMethod==="cash"?"good":"warn"}">${t.paymentMethod==="cash"?"نقدي":"آجل"}</span></td>
                  <td>${at(t.status||"pending")}</td>
                  <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${b(t.totalWithVat)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,ot(s,d,i)}function R(d,i,h,s,o,l,r="up"){const u=r==="up"?"↑":"↓";return`
    <div class="kpi-card ${{sales:"g-blue",invoices:"g-purple",receipts:"g-green",purchases:"g-orange"}[o]||"g-blue"}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${d}</div>
        <div class="trend-badge">${u} ${l}</div>
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${i}</div>
        <div class="kpi-value mono">${h}</div>
        <div class="kpi-sub">${s}</div>
      </div>
    </div>`}function ot(d,i,h){const s=document.getElementById("sales-chart");if(!s||typeof Chart>"u")return;const o={},l=new Date(i),r=new Date(h);for(let c=new Date(l);c<=r;c.setDate(c.getDate()+1)){const f=c.toISOString().split("T")[0];o[f]=0}d.forEach(c=>{const f=c.createdAt?.toDate?c.createdAt.toDate().toISOString().split("T")[0]:c.date||"";o[f]!==void 0&&(o[f]+=c.totalWithVat||0)});const u=Object.keys(o).map(c=>c.slice(5)),m=Object.values(o),y=s.getContext("2d").createLinearGradient(0,0,0,300);y.addColorStop(0,"rgba(99, 102, 241, 0.45)"),y.addColorStop(.5,"rgba(99, 102, 241, 0.15)"),y.addColorStop(1,"rgba(99, 102, 241, 0.0)");const g=document.body.classList.contains("theme-light"),x=g?"#0F172A":"#9CA3AF",w=g?"rgba(15, 23, 42, 0.15)":"rgba(150, 150, 150, 0.1)",F=g?"#0F172A":"#475569";new Chart(s,{type:"line",data:{labels:u,datasets:[{label:"المبيعات اليومية (ر.س)",data:m,borderColor:"#6366F1",backgroundColor:y,borderWidth:3,pointBackgroundColor:"#6366F1",pointBorderColor:g?"#FFFFFF":"#121620",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"Tajawal",size:14},bodyFont:{family:"JetBrains Mono",size:14},padding:12,cornerRadius:8,displayColors:!1}},scales:{y:{beginAtZero:!0,grid:{color:w,drawBorder:!0,borderColor:F},ticks:{color:x,font:{family:"JetBrains Mono",weight:"600"}}},x:{grid:{display:!1},ticks:{color:x,font:{family:"Tajawal",size:11,weight:"600"}},border:{color:F}}}}})}export{ht as render};
