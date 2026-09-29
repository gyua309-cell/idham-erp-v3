import{s as S,t as T,d as A,C as B,g as k,a as E,f,b as J,c as Z}from"./index-ClmVJz2W.js";import{collection as R,getDocs as K,where as U}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function dt(i,n){const u=n?.displayName||"مدير النظام";i.innerHTML=`
    <!-- New Advanced Dashboard Hero -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${u} 👋</h1>
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
        <input type="date" id="dash-from" value="${S()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <span style="color:var(--text-2); font-size:12px;">إلى</span>
        <input type="date" id="dash-to" value="${T()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="margin-right:8px; border-radius:8px; padding:6px 16px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`,window.dashSetRange=s=>{const o=T(),h=new Date;if(document.querySelectorAll(".quick-filter-btn").forEach(d=>d.classList.remove("active")),event&&event.target&&event.target.classList.add("active"),s==="today")document.getElementById("dash-from").value=o,document.getElementById("dash-to").value=o;else if(s==="week"){const d=new Date(h);d.setDate(h.getDate()-h.getDay()+1),document.getElementById("dash-from").value=d.toISOString().split("T")[0],document.getElementById("dash-to").value=o}else if(s==="month")document.getElementById("dash-from").value=S(),document.getElementById("dash-to").value=o;else if(s==="last_month"){const d=new Date(h.getFullYear(),h.getMonth()-1,1),v=new Date(h.getFullYear(),h.getMonth(),0);document.getElementById("dash-from").value=d.toISOString().split("T")[0],document.getElementById("dash-to").value=v.toISOString().split("T")[0]}loadDashboard()},window.loadDashboard=async()=>{const s=document.getElementById("dash-from")?.value||S(),o=document.getElementById("dash-to")?.value||T();await j(s,o)},await j(S(),T())}async function j(i,n){const u=document.getElementById("dash-content");if(!u)return;u.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>';let s=[],o=[],h=[],d=[],v=[],w=[],q=[],y=[];const b=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"";u.innerHTML=`
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
    </div>`;try{const t=R(A,`companies/${B}/collections`),e=R(A,`companies/${B}/journalEntries`),r=R(A,`companies/${B}/chartOfAccounts`),[g,c,x,V,G,Q,Y,_]=await Promise.all([K(R(A,`companies/${B}/salesInvoices`)).then(a=>a.docs.map(p=>({id:p.id,...p.data()}))).catch(a=>(console.warn(a),[])),k(E.purchaseInvoices()).catch(a=>(console.warn(a),[])),k(E.stockByWarehouse()).catch(a=>(console.warn(a),[])),k(E.receipts()).catch(a=>(console.warn(a),[])),k(e,[U("status","==","posted")]).catch(a=>(console.warn(a),[])),k(r).catch(a=>(console.warn(a),[])),k(t).catch(a=>(console.warn(a),[])),k(E.products()).catch(a=>(console.warn(a),[]))]);s=g,o=c,d=V,v=Y,w=G,q=Q,y=_,h=x.filter(a=>a.stockStatus==="out"||a.stockStatus==="low").slice(0,10),s=s.filter(a=>{const p=b(a);return(!i||p>=i)&&(!n||p<=n)}),o=o.filter(a=>{const p=b(a);return(!i||p>=i)&&(!n||p<=n)}),d=d.filter(a=>{const p=b(a);return(!i||p>=i)&&(!n||p<=n)}),v=v.filter(a=>{const p=b(a);return(!i||p>=i)&&(!n||p<=n)})}catch(t){console.error("Dashboard fetch error",t)}const $=s.filter(t=>t.status!=="cancelled").reduce((t,e)=>t+(e.totalWithVat||e.total||0),0),C=s.filter(t=>t.status!=="cancelled").length,F=C>0?$/C:0,l=s.filter(t=>t.status!=="cancelled"),m={};y.forEach(t=>{m[t.id]=parseFloat(t.costPrice||t.purchasePrice||0)});let D=0,I=0;l.forEach(t=>{const e=parseFloat(t.subtotal||t.totalWithoutVat||t.netTotal||(t.totalWithVat?t.totalWithVat/1.15:0));D+=e;let r=t.totalCost;if(r!=null)I+=parseFloat(r);else{let g=0;(t.items||t.lines||[]).forEach(c=>{const x=parseFloat(c.qty||c.quantity||0),V=parseFloat(c.averageCost||c.costPrice||c.purchasePrice||m[c.productId||c.id]||0);g+=x*V}),I+=g}}),I===0&&w.length>0&&w.filter(t=>t.type==="salesCOGS"||t.sourceType==="salesCOGS"||t.description&&t.description.includes("تكلفة بضاعة")).forEach(t=>{I+=parseFloat(t.totalDebit||t.amount||0)});const O=D-I,P=D>0?(O/D*100).toFixed(1):"0.0";let W=d.filter(t=>t.entityType==="customer"||!t.entityType||t.type==="receipt").reduce((t,e)=>t+(e.amount||0),0);l.forEach(t=>{const e=(t.paymentMethod||"").toLowerCase();if(e==="cash"||e==="نقدي"||e==="partial"||e==="جزئي"){const r=parseFloat(t.paidAmount||0);r>0&&(d.some(c=>c.invoiceId===t.id||c.invoiceNumber===t.invoiceNumber)||(W+=r))}});const H=Math.max(0,$-W);o.filter(t=>t.status!=="cancelled").reduce((t,e)=>{const r=parseFloat(e.subtotal||e.totalBeforeTax||e.totalWithoutVat||0),g=parseFloat(e.totalWithVat||e.total||e.grandTotal||0);return t+(r>0?r:g/1.15)},0),o.filter(t=>t.status!=="cancelled").reduce((t,e)=>t+(e.totalWithVat||e.total||e.grandTotal||0),0);const z={};s.forEach(t=>{let e=t.repName||t.repId;(!e||e==="بدون مندوب"||e==="المندوب الرئيسي")&&(e="المستودع الرئيسي (مبيعات مباشرة)"),z[e]=(z[e]||0)+(t.totalWithVat||t.total||0)});const L=Object.entries(z).sort(([,t],[,e])=>e-t).slice(0,5),N=s.slice(0,8);u.innerHTML=`
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${M("💰","إجمالي المبيعات",f($),`بدون ضريبة: ${f(D)}`,"sales","")}
        ${M("🧾","عدد الفواتير",C.toLocaleString("ar"),`متوسط الفاتورة: ${f(F)}`,"invoices","")}
        ${M("✅","المبالغ المحصلة",f(W),`المتبقي: ${f(H)}`,"receipts","")}
        ${M("📈","مجمل الربح",f(O),`هامش الربح: ${P}%`,"profit",O>=0?"up":"down")}
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
                <span class="text-2" style="font-size:12px;">الفترة: ${i} — ${n}</span>
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
            ${L.length===0?`
              <div class="empty-state" style="padding:40px 0;">
                <div class="empty-icon">🚚</div>
                <h3>لا توجد مبيعات</h3>
                <button class="btn btn-secondary btn-sm mt-12" onclick="window.seedDemoData()">تحميل بيانات تجريبية 🌾</button>
              </div>`:L.map(([t,e],r)=>{const g=L[0][1],c=g>0?e/g*100:0,x=["#E58A2B","#00B4D8","#2DD4BF","#6366F1","#A855F7"];return`
                <div style="margin-bottom:20px;">
                  <div class="flex items-center justify-between mb-8" style="font-size:13px;">
                    <span class="font-heading font-semibold" style="color:#fff;">
                      <span style="display:inline-block; width:20px; height:20px; text-align:center; background:rgba(255,255,255,0.1); border-radius:50%; line-height:20px; margin-left:6px; font-size:11px;">${r+1}</span>
                      ${t}
                    </span>
                    <span class="mono font-bold" style="color:${x[r]}">${f(e)}</span>
                  </div>
                  <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.05);">
                    <div class="fill" style="width:${c}%; background:${x[r]}; border-radius:4px; box-shadow: 0 0 10px ${x[r]}80;"></div>
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
              ${N.length===0?`
                <tr><td colspan="7" style="text-align:center;color:var(--text-2);padding:40px;">
                  <div class="empty-icon" style="font-size:36px;margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة</div>
                </td></tr>`:N.map(t=>`
                <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                  <td class="mono text-indigo font-bold">#${t.number||t.id.slice(0,8)}</td>
                  <td class="font-semibold" style="color:var(--text-0);">${t.customerName||"عميل نقدي"}</td>
                  <td class="dim">${t.repName||"—"}</td>
                  <td class="dim">${J(t.createdAt)}</td>
                  <td><span class="badge ${t.paymentMethod==="cash"?"good":"warn"}">${t.paymentMethod==="cash"?"نقدي":"آجل"}</span></td>
                  <td>${Z(t.status||"pending")}</td>
                  <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${f(t.totalWithVat)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,X(s,i,n)}function M(i,n,u,s,o,h,d="up"){const v=d==="up"?"↑":"↓";return`
    <div class="kpi-card ${{sales:"g-blue",invoices:"g-purple",receipts:"g-green",purchases:"g-orange"}[o]||"g-blue"}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${i}</div>
        <div class="trend-badge">${v} ${h}</div>
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${n}</div>
        <div class="kpi-value mono">${u}</div>
        <div class="kpi-sub">${s}</div>
      </div>
    </div>`}function X(i,n,u){const s=document.getElementById("sales-chart");if(!s||typeof Chart>"u")return;const o={},h=new Date(n),d=new Date(u);for(let l=new Date(h);l<=d;l.setDate(l.getDate()+1)){const m=l.toISOString().split("T")[0];o[m]=0}i.forEach(l=>{const m=l.createdAt?.toDate?l.createdAt.toDate().toISOString().split("T")[0]:l.date||"";o[m]!==void 0&&(o[m]+=l.totalWithVat||0)});const v=Object.keys(o).map(l=>l.slice(5)),w=Object.values(o),y=s.getContext("2d").createLinearGradient(0,0,0,300);y.addColorStop(0,"rgba(99, 102, 241, 0.45)"),y.addColorStop(.5,"rgba(99, 102, 241, 0.15)"),y.addColorStop(1,"rgba(99, 102, 241, 0.0)");const b=document.body.classList.contains("theme-light"),$=b?"#0F172A":"#9CA3AF",C=b?"rgba(15, 23, 42, 0.15)":"rgba(150, 150, 150, 0.1)",F=b?"#0F172A":"#475569";new Chart(s,{type:"line",data:{labels:v,datasets:[{label:"المبيعات اليومية (ر.س)",data:w,borderColor:"#6366F1",backgroundColor:y,borderWidth:3,pointBackgroundColor:"#6366F1",pointBorderColor:b?"#FFFFFF":"#121620",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"Tajawal",size:14},bodyFont:{family:"JetBrains Mono",size:14},padding:12,cornerRadius:8,displayColors:!1}},scales:{y:{beginAtZero:!0,grid:{color:C,drawBorder:!0,borderColor:F},ticks:{color:$,font:{family:"JetBrains Mono",weight:"600"}}},x:{grid:{display:!1},ticks:{color:$,font:{family:"Tajawal",size:11,weight:"600"}},border:{color:F}}}}})}export{dt as render};
