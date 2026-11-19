const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{_ as Gt,g as F,C as A,f as Vt}from"./index-CF9GFeRJ.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function jt(){if(window._echartsReady)return;const o=a=>new Promise((t,s)=>{const c=document.createElement("script");c.src=a,c.onload=t,c.onerror=s,document.head.appendChild(c)});window.echarts||await o("https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js");try{await o("https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js")}catch{}window._echartsReady=!0}let L=null,D="month",q=[];async function ce(o,a){o.innerHTML=Ht(),Yt(),await jt(),await K()}function Ht(){return`
<div id="fa2" style="display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg-0);color:var(--text-0);">

<style>
/* ── Header ── */
#fa2 .fa-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;
  background:var(--bg-card);border-bottom:1px solid var(--border-soft);flex-shrink:0;flex-wrap:wrap;gap:12px;box-shadow:0 2px 10px rgba(0,0,0,0.02)}
#fa2 .fa-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--brand),#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;
  box-shadow:0 4px 14px rgba(99,102,241,.3)}
#fa2 .fa-htitle{font-size:18px;font-weight:900;color:var(--text-0);margin:0}
#fa2 .fa-hsub{font-size:11px;color:var(--text-2);margin:2px 0 0}

/* Period buttons & Inputs */
#fa2 .pgrp{display:flex;background:var(--bg-2);border-radius:8px;border:1px solid var(--border-soft);overflow:hidden;padding:2px}
#fa2 .pbtn{padding:5px 12px;border:none;background:transparent;color:var(--text-1);font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;border-radius:6px}
#fa2 .pbtn.on{background:var(--brand);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.3)}
#fa2 .hbtn{padding:6px 14px;border-radius:8px;border:1px solid var(--border-soft);background:var(--bg-2);color:var(--text-1);font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap}
#fa2 .hbtn:hover{background:var(--bg-card);color:var(--text-0)}
#fa2 .hbtn.primary{background:var(--brand);color:#fff;border-color:var(--brand)}

/* Tabs */
#fa2 .tabs{display:flex;padding:0 16px;background:var(--bg-card);border-bottom:2px solid var(--border-soft);flex-shrink:0;overflow-x:auto;scrollbar-width:none;gap:4px}
#fa2 .tab{padding:10px 18px;border:none;background:transparent;color:var(--text-2);cursor:pointer;font-size:12px;font-weight:800;font-family:inherit;white-space:nowrap;display:flex;align-items:center;gap:6px;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:all .15s;letter-spacing:.3px}
#fa2 .tab:hover{color:var(--text-0)}
#fa2 .tab.on{color:var(--brand);border-bottom-color:var(--brand);background:var(--bg-2);border-radius:8px 8px 0 0}

/* Content */
#fa2 .content{flex:1;overflow-y:auto;padding:16px;background:var(--bg-0)}
/* Loading */
#fa2 .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;gap:16px;color:var(--text-2)}
#fa2 .spinner{width:44px;height:44px;border:3px solid var(--border-soft);border-top-color:var(--brand);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* KPI Grid */
#fa2 .kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-bottom:16px}
#fa2 .kcard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:16px;position:relative;overflow:hidden;cursor:default;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .kcard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.06)}
#fa2 .kcard::before{content:"";position:absolute;top:0;right:0;width:60px;height:60px;border-radius:50%;filter:blur(20px);opacity:.15}
#fa2 .kc-lbl{font-size:10px;font-weight:800;color:var(--text-2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
#fa2 .kc-val{font-size:20px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1;margin-bottom:4px;color:var(--text-0)}
#fa2 .kc-sub{font-size:10.5px;color:var(--text-2);margin-bottom:6px}
#fa2 .kc-bar{height:4px;border-radius:2px;margin-top:6px;opacity:.8}
#fa2 .kc-icon{position:absolute;top:10px;left:10px;font-size:26px;opacity:.12}
#fa2 .kc-trend{font-size:10px;font-weight:800;margin-top:2px}

/* Chart cards */
#fa2 .cgrid{display:grid;gap:14px;margin-bottom:16px}
#fa2 .cgrid.c2{grid-template-columns:1fr 1fr}
#fa2 .cgrid.c3{grid-template-columns:1fr 1fr 1fr}
#fa2 .cgrid.c1{grid-template-columns:1fr}
@media(max-width:950px){#fa2 .cgrid.c2,#fa2 .cgrid.c3{grid-template-columns:1fr}}
#fa2 .ccard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:18px;position:relative;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .cc-title{font-size:13px;font-weight:900;color:var(--text-0);margin-bottom:2px;display:flex;align-items:center;gap:7px}
#fa2 .cc-sub{font-size:10px;color:var(--text-2);margin-bottom:12px}
#fa2 .cc-badge{font-size:9.5px;padding:3px 9px;border-radius:10px;background:rgba(99,102,241,.12);color:var(--brand);font-weight:800;margin-right:auto}

/* Ratio cards */
#fa2 .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-bottom:16px}
#fa2 .rcard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .rc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#fa2 .rc-name{font-size:12px;font-weight:800;color:var(--text-0)}
#fa2 .rc-eng{font-size:9.5px;color:var(--text-2);margin-top:1px}
#fa2 .rc-val{font-size:26px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1;color:var(--text-0)}
#fa2 .rc-unit{font-size:12px;font-weight:600;opacity:.6;margin-right:3px}
#fa2 .rc-bar{height:6px;background:var(--bg-2);border-radius:4px;overflow:hidden;margin:8px 0}
#fa2 .rc-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,1,.36,1)}
#fa2 .rc-bench{display:flex;justify-content:space-between;font-size:9.5px;color:var(--text-2)}
#fa2 .badge{font-size:9.5px;font-weight:800;padding:3px 9px;border-radius:10px}
#fa2 .b-ex{background:rgba(16,185,129,.15);color:#10b981}
#fa2 .b-gd{background:rgba(99,102,241,.15);color:#6366f1}
#fa2 .b-wn{background:rgba(245,158,11,.15);color:#f59e0b}
#fa2 .b-dn{background:rgba(239,68,68,.15);color:#ef4444}

/* Section label */
#fa2 .slbl{font-size:11px;font-weight:900;color:var(--text-1);text-transform:uppercase;letter-spacing:.8px;
  padding:8px 0 12px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--border-soft);margin-bottom:14px}
#fa2 .slbl span{color:var(--brand)}

/* Waterfall */
#fa2 .wf-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
#fa2 .wf-lbl{font-size:11px;color:var(--text-1);width:160px;flex-shrink:0;text-align:right}
#fa2 .wf-bar-wrap{flex:1;height:26px;background:var(--bg-2);border-radius:6px;overflow:hidden;position:relative}
#fa2 .wf-bar-fill{height:100%;border-radius:6px;position:absolute;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;transition:width .8s cubic-bezier(.22,1,.36,1)}
</style>

<!-- Header -->
<div class="fa-hdr">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="fa-logo">📊</div>
    <div>
      <div class="fa-htitle">التحليل المالي الشامل</div>
      <div class="fa-hsub">30+ نسبة مالية • ECharts GL 3D • بيانات حية ومطابقة للفترات</div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    
    <!-- Date Range Inputs -->
    <div style="display:flex;align-items:center;gap:8px;background:var(--bg-2);padding:4px 10px;border-radius:8px;border:1px solid var(--border-soft);">
      <div style="display:flex;align-items:center;gap:5px;">
        <label style="font-size:11px;font-weight:800;color:var(--text-2);">من:</label>
        <input type="date" id="fa-from" class="mono font-bold" style="padding:4px 8px;font-size:11.5px;width:125px;border-radius:6px;border:1px solid var(--border-soft);background:var(--bg-card);color:var(--text-0);" onchange="window.setFaCustomDate()" />
      </div>
      <div style="display:flex;align-items:center;gap:5px;">
        <label style="font-size:11px;font-weight:800;color:var(--text-2);">إلى:</label>
        <input type="date" id="fa-to" class="mono font-bold" style="padding:4px 8px;font-size:11.5px;width:125px;border-radius:6px;border:1px solid var(--border-soft);background:var(--bg-card);color:var(--text-0);" onchange="window.setFaCustomDate()" />
      </div>
    </div>

    <!-- Quick Period Buttons -->
    <div class="pgrp">
      <button class="pbtn" data-p="all">كل الفترات</button>
      <button class="pbtn" data-p="today">اليوم</button>
      <button class="pbtn" data-p="this_week">آخر 7 أيام</button>
      <button class="pbtn on" data-p="month">هذا الشهر</button>
      <button class="pbtn" data-p="last_month">الشهر الماضي</button>
      <button class="pbtn" data-p="quarter">الربع</button>
      <button class="pbtn" data-p="year">هذه السنة</button>
    </div>

    <button class="hbtn" onclick="window.fa2Export()">📄 PDF</button>
    <button class="hbtn primary" onclick="window.fa2Refresh()">🔄 تحديث</button>
  </div>
</div>

<!-- Tabs -->
<div class="tabs" id="fa2-tabs">
  <button class="tab on" id="t-ov"   onclick="fa2Tab('ov')">🏠 لوحة المؤشرات</button>
  <button class="tab"    id="t-liq"  onclick="fa2Tab('liq')">💧 السيولة</button>
  <button class="tab"    id="t-pft"  onclick="fa2Tab('pft')">💰 الربحية</button>
  <button class="tab"    id="t-eff"  onclick="fa2Tab('eff')">⚙️ كفاءة العمليات</button>
  <button class="tab"    id="t-lev"  onclick="fa2Tab('lev')">⚖️ الرفع المالي</button>
  <button class="tab"    id="t-inc"  onclick="fa2Tab('inc')">📋 قائمة الدخل</button>
</div>

<!-- Content -->
<div class="content" id="fa2-cnt">
  <div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>
</div>
</div>`}function Yt(){document.querySelectorAll("#fa2 .pbtn").forEach(o=>o.addEventListener("click",async()=>{document.querySelectorAll("#fa2 .pbtn").forEach(a=>a.classList.remove("on")),o.classList.add("on"),D=o.dataset.p,await K()}))}window.setFaCustomDate=()=>{D="custom",document.querySelectorAll("#fa2 .pbtn").forEach(o=>o.classList.remove("on")),K()};window.fa2Tab=o=>{document.querySelectorAll("#fa2 .tab").forEach(t=>t.classList.toggle("on",t.id===`t-${o}`));const a=document.getElementById("fa2-cnt");!a||!L||(q.forEach(t=>{try{t.dispose()}catch{}}),q=[],Mt(o,a))};window.fa2Refresh=()=>K(!0);async function K(o=!1){const a=document.getElementById("fa2-cnt");if(a){a.innerHTML='<div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>',q.forEach(t=>{try{t.dispose()}catch{}}),q=[];try{L=await Nt(o);const t=document.querySelector("#fa2 .tab.on")?.id?.replace("t-","")||"ov";Mt(t,a)}catch(t){a.innerHTML=`<div style="color:#ef4444;padding:20px">خطأ: ${t.message}</div>`}}}async function Nt(o=!1){const a=r=>{const i=r.getFullYear(),u=String(r.getMonth()+1).padStart(2,"0"),$=String(r.getDate()).padStart(2,"0");return`${i}-${u}-${$}`},t=new Date,s=t.getFullYear(),c=t.getMonth();let n=document.getElementById("fa-from")?.value||"",p=document.getElementById("fa-to")?.value||"";if(D!=="custom"||!n||!p){if(D==="all")n="2020-01-01",p=a(t);else if(D==="today")n=a(t),p=a(t);else if(D==="this_week"){const u=new Date(t);u.setDate(u.getDate()-7),n=a(u),p=a(t)}else if(D==="last_month"){const u=new Date(s,c-1,1),$=new Date(s,c,0);n=a(u),p=a($)}else D==="quarter"?(n=a(new Date(s,Math.floor(c/3)*3,1)),p=a(t)):D==="year"?(n=a(new Date(s,0,1)),p=a(t)):(n=a(new Date(s,c,1)),p=a(t));const r=document.getElementById("fa-from"),i=document.getElementById("fa-to");r&&(r.value=n),i&&(i.value=p)}const S=new Date(t.getFullYear(),t.getMonth()-5,1);a(S);const{clearERPCache:l,COMPANY_ID:d}=await Gt(async()=>{const{clearERPCache:r,COMPANY_ID:i}=await import("./index-CF9GFeRJ.js").then(u=>u.T);return{clearERPCache:r,COMPANY_ID:i}},__vite__mapDeps([0,1]));o&&(l(`companies/${d}/salesInvoices`),l(`companies/${d}/purchaseInvoices`),l(`companies/${d}/salesReturns`),l(`companies/${d}/stockByWarehouse`),l(`companies/${d}/customers`),l(`companies/${d}/suppliers`),l(`companies/${d}/products`),l(`companies/${d}/chartOfAccounts`),l(`companies/${d}/journalEntries`));const[k,lt,Ct,st,ct,dt,kt,U,pt]=await Promise.all([F(A.salesInvoices()),F(A.purchaseInvoices()),F(A.salesReturns()),F(A.stockByWarehouse()),F(A.customers()),F(A.suppliers()),F(A.products()),F(A.chartOfAccounts()),F(A.journalEntries())]),I=k.filter(r=>{if(r.status==="cancelled"||r.status==="void")return!1;const i=r.date||(r.createdAt?.toDate?r.createdAt.toDate().toISOString().split("T")[0]:"");return i>=n&&i<=p}),J=lt.filter(r=>{if(r.status==="cancelled"||r.status==="void")return!1;const i=r.date||(r.createdAt?.toDate?r.createdAt.toDate().toISOString().split("T")[0]:"");return i>=n&&i<=p}),ut=(Ct||[]).filter(r=>{if(r.status==="cancelled"||r.status==="void")return!1;const i=r.date||(r.createdAt?.toDate?r.createdAt.toDate().toISOString().split("T")[0]:"");return i>=n&&i<=p}),ft={},gt={};U.forEach(r=>{ft[r.id]=r,gt[r.code]=r});const bt=r=>ft[r.accountId]||gt[r.accountCode];let X=0,Z=0,tt=0,W=0;for(const r of U){let i=0;for(const u of pt){if(u.status&&u.status!=="posted"&&u.status!=="مرحل"&&u.status!=="مرحّل")continue;const $=u.date||"";if($>=n&&$<=p)for(const M of u.lines||[]){const R=bt(M);!R||R.id!==r.id||(i+=(M.credit||0)-(M.debit||0))}}if(r.type==="revenue")X+=i;else if(r.type==="expense"){const u=-i;r.code?.startsWith("5-1")||r.name?.includes("تكلفة البضاعة")||r.name?.includes("تكلفة مبيعات")||r.name?.includes("نقل بضاعة")?Z+=u:tt+=u}else r.code?.startsWith("2-1-3")?W+=Math.abs(i):r.code?.startsWith("1-1-5")}const Rt=I.reduce((r,i)=>r+(i.subtotal!==void 0?i.subtotal:i.totalBeforeTax||(i.totalWithVat?i.totalWithVat/1.15:i.total||0)),0),Ft=ut.reduce((r,i)=>r+(i.subtotal!==void 0?i.subtotal:i.totalBeforeTax||(i.totalWithVat?i.totalWithVat/1.15:i.total||0)),0),At=Math.max(0,Rt-Ft),Tt=I.reduce((r,i)=>r+(i.totalVat||i.vatAmount||0),0);let H=I.reduce((r,i)=>r+(i.totalCost||0),0)-ut.reduce((r,i)=>r+(i.totalCost||0),0);H=Math.max(0,H);const B=X>.01?X:At;let _=Z>.01?Z:H;_<.01&&B>0&&(_=H),W<.01&&(W=Tt);const et=B-_,Y=et-tt,xt=Math.max(0,Y*.15),mt=Y-xt,ot=B+W;let z=0,at=0,N=0,Q=0,G=0,P=0,E=0,V=0,yt=0;for(const r of U){let i=0;for(const u of pt){if(u.status&&u.status!=="posted"&&u.status!=="مرحل"&&u.status!=="مرحّل")continue;if((u.date||"")<=p)for(const M of u.lines||[]){const R=bt(M);!R||R.id!==r.id||(i+=(M.debit||0)-(M.credit||0))}}if(r.type==="asset")r.code?.startsWith("1-2")||r.code?.startsWith("1-3")||r.name?.includes("سيارات")||r.name?.includes("أثاث")||r.name?.includes("معدات")||r.name?.includes("عقارات")?at+=i:(z+=i,r.code?.startsWith("1-1-1")||r.name?.includes("صندوق")||r.name?.includes("بنك")||r.name?.includes("مصرف")?G+=i:r.code?.startsWith("1-1-2")||r.name?.includes("عملاء")&&!r.name?.includes("مورد")?P+=i:r.code?.startsWith("1-1-4")||r.name?.includes("مخزون")?E+=i:yt+=i);else if(r.type==="liability"){const u=-i;r.code?.startsWith("2-2")||r.name?.includes("طويل")?Q+=u:(N+=u,(r.code?.startsWith("2-1-1")||r.name?.includes("موردين")||r.name?.includes("دائنة"))&&(V+=u))}}if(E<.01){const r={};kt.forEach(i=>{r[i.id]=i.averageCost||i.costPrice||0}),E=st.reduce((i,u)=>i+(u.qty||0)*(r[u.productId]||0),0)}const ht=ct.reduce((r,i)=>r+Math.max(0,i.balance||0),0);P<.01&&ht>0&&(P=ht);const vt=dt.reduce((r,i)=>r+Math.max(0,i.balance||0),0);V<.01&&vt>0&&(V=vt),z<G+P+E&&(z=Math.max(z,G+P+E+yt));const rt=z+at,it=N+Q,wt=Math.max(1,rt-it),St=J.reduce((r,i)=>r+(i.subtotal||i.totalBeforeTax||0),0),Dt=J.reduce((r,i)=>r+(i.totalVat||i.taxAmount||0),0),Ot=J.reduce((r,i)=>r+(i.totalWithVat||i.total||i.grandTotal||0),0),zt=Array.from({length:6},(r,i)=>{const u=new Date(t.getFullYear(),t.getMonth()-5+i,1),$=u.toLocaleString("ar-SA",{month:"short"}),M=u.getFullYear(),R=u.getMonth(),nt=k.filter(h=>{if(h.status==="cancelled"||h.status==="void")return!1;const w=new Date(h.date||"");return w.getFullYear()===M&&w.getMonth()===R}).reduce((h,w)=>h+(w.totalWithVat||w.grandTotal||0),0),Wt=k.filter(h=>{if(h.status==="cancelled"||h.status==="void")return!1;const w=new Date(h.date||"");return w.getFullYear()===M&&w.getMonth()===R}).reduce((h,w)=>h+(w.totalCost||0),0),Bt=lt.filter(h=>{if(h.status==="cancelled"||h.status==="void")return!1;const w=new Date(h.date||"");return w.getFullYear()===M&&w.getMonth()===R}).reduce((h,w)=>h+(w.total||w.grandTotal||0),0),_t=Math.max(0,nt>0?nt/1.15-Wt:0);return{lbl:$,rev:Math.round(nt),cost:Math.round(Bt),gp:Math.round(_t)}}),j=I.length,Pt=j>0?ot/j:0,Et=I.filter(r=>r.status==="paid").length,Lt=j>0?Et/j*100:0,qt=st.reduce((r,i)=>r+(i.qty||0),0),It=Qt({revenue:B,revTotal:ot,cogs:_,grossProfit:et,opProfit:Y,netProfit:mt,purchCost:St,invVal:E,receivables:P,payables:V,cash:G,curAssets:z,totAssets:rt,curLiab:N,longLiab:Q,totLiab:it,equity:wt});return{period:{from:n,to:p},revenue:B,vatOut:W,revTotal:ot,cogs:_,grossProfit:et,opExpenses:tt,opProfit:Y,tax:xt,netProfit:mt,purchCost:St,purchVat:Dt,purchTotal:Ot,invVal:E,invQty:qt,receivables:P,payables:V,cash:G,curAssets:z,fixedAssets:at,totAssets:rt,curLiab:N,longLiab:Q,totLiab:it,equity:wt,invCount:j,avgInv:Pt,collRate:Lt,months6:zt,R:It,custCount:ct.length,suppCount:dt.length}}function Qt(o){const a=(c,n)=>n>0?c/n*100:0,t=(c,n)=>n>0?c/n:0,s=(c,n)=>n>0?c/n*365:0;return{curRatio:t(o.curAssets,o.curLiab),quickRatio:t(o.curAssets-o.invVal,o.curLiab),cashRatio:t(o.cash,o.curLiab),workCap:o.curAssets-o.curLiab,wcRatio:a(o.curAssets-o.curLiab,o.revenue),grossMgn:a(o.grossProfit,o.revenue),opMgn:a(o.opProfit,o.revenue),netMgn:a(o.netProfit,o.revenue),roa:a(o.netProfit,o.totAssets),roe:a(o.netProfit,o.equity),roi:a(o.grossProfit-o.purchCost,o.purchCost),markup:a(o.grossProfit,o.cogs||1),ebitda:a(o.opProfit*1.1,o.revenue),grossOnSales:a(o.grossProfit,o.revTotal),invTurn:t(o.cogs,o.invVal||1),dio:s(o.invVal,o.cogs||1),recTurn:t(o.revenue,o.receivables||1),dso:s(o.receivables,o.revenue||1),payTurn:t(o.purchCost,o.payables||1),dpo:s(o.payables,o.purchCost||1),ccc:s(o.invVal,o.cogs||1)+s(o.receivables,o.revenue||1)-s(o.payables,o.purchCost||1),astTurn:t(o.revenue,o.totAssets||1),opCycle:s(o.invVal,o.cogs||1)+s(o.receivables,o.revenue||1),de:t(o.totLiab,o.equity),da:a(o.totLiab,o.totAssets),eq:a(o.equity,o.totAssets),eqMult:t(o.totAssets,o.equity),intCov:t(o.opProfit,o.opProfit*.07||1),debtRatio:t(o.totLiab,o.totAssets),capGearing:a(o.longLiab,o.equity+o.longLiab)}}const e={purple:"#818cf8",teal:"#2dd4bf",green:"#10b981",yellow:"#f59e0b",red:"#f87171",blue:"#60a5fa",orange:"#fb923c",pink:"#f472b6",indigo:"#6366f1",violet:"#8b5cf6"},y=o=>Vt(o||0),f=(o,a=2)=>(typeof o=="number"?o:0).toFixed(a),x=(o,a=1)=>f(o,a)+"%";function Kt(o,a){const[t,s,c]=a;return o<=t?'<span class="badge b-dn">تحت المعيار</span>':o<=s?'<span class="badge b-wn">مقبول</span>':o<=c?'<span class="badge b-gd">جيد</span>':'<span class="badge b-ex">ممتاز ✦</span>'}function g(o,a,t,s,c,n,p,S=60){return`<div class="kcard" style="border-color:${n}22">
    <div style="position:absolute;top:0;right:0;width:50px;height:50px;background:${n};border-radius:50%;filter:blur(18px);opacity:.2"></div>
    <div class="kc-icon" style="color:${n}">${p}</div>
    <div class="kc-lbl">${o}</div>
    <div class="kc-lbl" style="color:${n}55;font-size:8px">${a}</div>
    <div class="kc-val" style="color:${n}">${t}<span style="font-size:11px;opacity:.6;margin-right:2px">${s}</span></div>
    <div class="kc-sub">${c}</div>
    <div class="kc-bar" style="background:linear-gradient(90deg,${n},${n}55);width:${Math.min(100,S)}%"></div>
  </div>`}function b(o,a,t,s,c,n,p,S){const l=S?Kt(parseFloat(t),S):"",d=Math.min(100,Math.max(0,c));return`<div class="rcard" style="border-color:${n}22">
    <div class="rc-head">
      <div><div class="rc-name">${o}</div><div class="rc-eng">${a}</div></div>
      ${l}
    </div>
    <div class="rc-val" style="color:${n}">${t}<span class="rc-unit">${s}</span></div>
    <div class="rc-bar"><div class="rc-fill" style="width:${d}%;background:linear-gradient(90deg,${n},${n}88)"></div></div>
    <div class="rc-bench"><span>المعيار: ${p}</span><span style="color:${n}">${d.toFixed(0)}%</span></div>
  </div>`}function m(o,a,t,s=300,c=""){return`<div class="ccard">
    <div class="cc-title">${a}${c?`<span class="cc-badge">${c}</span>`:""}</div>
    <div class="cc-sub">${t}</div>
    <div id="${o}" style="width:100%;height:${s}px"></div>
  </div>`}function Ut(o,a){const t=document.getElementById(o);if(!t||!window.echarts)return null;const s=document.documentElement.getAttribute("data-theme")==="dark",c=echarts.init(t,s?"dark":null,{renderer:"canvas"});return c.setOption(a),q.push(c),c}const O=o=>({type:"category",data:o,axisLine:{lineStyle:{color:"var(--border-soft)"}},axisTick:{show:!1},axisLabel:{color:"var(--text-1)",fontSize:10}}),C=o=>({type:"value",splitLine:{lineStyle:{color:"var(--border-soft)",type:"dashed"}},axisLabel:{color:"var(--text-1)",fontSize:10,formatter:o||null}}),v={backgroundColor:"var(--bg-card)",borderColor:"var(--border-soft)",borderWidth:1,textStyle:{color:"var(--text-0)",fontSize:11},extraCssText:"box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;"};function Mt(o,a){({ov:$t,liq:Jt,pft:Xt,eff:Zt,lev:te,inc:ee}[o]||$t)(a,L),setTimeout(()=>oe(o,L),80),window.addEventListener("resize",()=>q.forEach(s=>{try{s.resize()}catch{}}))}function $t(o,a){const{R:t}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> المؤشرات المالية الكبرى — KPIs</div>
  <div class="kgrid">
    ${g("إجمالي المبيعات (بدون ضريبة)","Total Revenue",y(a.revenue),"",""+a.invCount+" فاتورة",e.indigo,"💰",75)}
    ${g("الربح الإجمالي","Gross Profit",y(a.grossProfit),"",x(t.grossMgn)+" هامش ربح",e.green,"📈",Math.min(100,t.grossMgn*15))}
    ${g("الربح التشغيلي","Operating Profit",y(a.opProfit),"",x(t.opMgn),e.teal,"⚡",Math.min(100,Math.abs(t.opMgn)*5))}
    ${g("صافي الربح","Net Profit",y(a.netProfit),"",x(t.netMgn),e.violet,"✨",Math.min(100,Math.abs(t.netMgn)*5))}
    ${g("قيمة المخزون","Inventory Value",y(a.invVal),"",a.invQty+" وحدة",e.yellow,"📦",60)}
    ${g("الذمم المدينة (العملاء)","Receivables",y(a.receivables),"",a.custCount+" عميل",e.blue,"👥",50)}
    ${g("الذمم الدائنة (الموردين)","Payables",y(a.payables),"",a.suppCount+" مورد",e.orange,"🚛",45)}
    ${g("النقدية بالبنوك والصناديق","Cash & Banks",y(a.cash),"","سيولة متاحة",e.teal,"💵",40)}
  </div>

  <div class="slbl"><span>◆</span> الرسوم البيانية — Analytics</div>
  <div class="cgrid c2">
    ${m("ch-rev6","📊 اتجاه المبيعات والأرباح","آخر 6 أشهر — area chart احترافي",300)}
    ${m("ch-gauge-gm","📡 مقاييس الربحية","مقياس ثلاثي — هامش إجمالي / تشغيلي / صافي",300)}
  </div>
  <div class="cgrid c3">
    ${m("ch-cost-donut","🍩 هيكل التكاليف","توزيع الربح والتكاليف",240)}
    ${m("ch-bar3d","📦 مبيعات 3D","أعمدة ثلاثية الأبعاد شهرية",240)}
    ${m("ch-radar6","🕸️ الأداء الشامل","مقارنة 8 مؤشرات مع المعيار",240)}
  </div>

  <div class="slbl"><span>◆</span> ملخص النسب الرئيسية</div>
  <div class="rgrid">
    ${b("نسبة التداول","Current Ratio",f(t.curRatio),"×",t.curRatio*33,e.purple,"≥ 2.0×",[.5,1,2])}
    ${b("هامش الربح الإجمالي","Gross Margin",x(t.grossMgn),"",Math.min(100,t.grossMgn*15),e.green,"4-10% (جملة)",[2,4,7])}
    ${b("معدل دوران المخزون","Inventory Turnover",f(t.invTurn),"×",t.invTurn*8,e.yellow,"6-12×",[1,4,8])}
    ${b("أيام التحصيل","Days Sales Outstanding",f(t.dso,0),"يوم",100-Math.min(100,t.dso),e.red,"30-45 يوم",[60,45,30])}
    ${b("نسبة الدين إلى الملكية","Debt/Equity",f(t.de),"×",Math.max(0,100-t.de*20),e.orange,"< 2×",[3,2,1])}
    ${b("العائد على الأصول","ROA",x(t.roa),"",t.roa*4,e.teal,"5-10%",[2,5,10])}
  </div>`}function Jt(o,a){const{R:t}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب السيولة — Liquidity Ratios</div>
  <div class="cgrid c2">
    ${m("ch-liq-gauges","📡 مقاييس السيولة الثلاثة","نسبة التداول / السريعة / النقدية",320)}
    ${m("ch-liq-bars","📊 هيكل الأصول المتداولة","نقدية + ذمم + مخزون vs خصوم",320,"ECharts 3D")}
  </div>
  <div class="kgrid">
    ${g("نسبة التداول","Current Ratio",f(t.curRatio),"×","المثالي ≥ 2.0×",e.purple,"🔵",t.curRatio*33)}
    ${g("نسبة السريعة","Quick Ratio",f(t.quickRatio),"×","المثالي ≥ 1.0×",e.teal,"⚡",t.quickRatio*50)}
    ${g("نسبة النقدية","Cash Ratio",f(t.cashRatio),"×","المثالي ≥ 0.5×",e.yellow,"💵",t.cashRatio*100)}
    ${g("رأس المال العامل","Working Capital",y(t.workCap),"","يجب أن يكون +",e.green,"⚖️",70)}
    ${g("نسبة WC/مبيعات","WC/Revenue",x(t.wcRatio),"","المثالي 10-20%",e.blue,"📈",t.wcRatio*5)}
  </div>
  <div class="cgrid c2">
    ${m("ch-liq-waterfall","💧 تحليل رأس المال العامل","Waterfall — الأصول vs الخصوم",280)}
    ${m("ch-liq-trend","📈 اتجاه السيولة","مقارنة نسبة التداول والسريعة",280)}
  </div>
  <div class="slbl" style="margin-top:8px"><span>◆</span> تحليل تفصيلي</div>
  <div class="rgrid">
    ${b("نسبة التداول","Current Ratio",f(t.curRatio),"×",t.curRatio*33,e.purple,"≥ 2.0×",[.5,1,2])}
    ${b("نسبة السريعة","Quick Ratio",f(t.quickRatio),"×",t.quickRatio*50,e.teal,"≥ 1.0×",[.3,.7,1])}
    ${b("نسبة النقدية","Cash Ratio",f(t.cashRatio),"×",t.cashRatio*100,e.yellow,"≥ 0.5×",[.1,.3,.5])}
    ${b("رأس المال العامل","Working Capital",y(t.workCap),"",70,e.green,"يجب موجب",[0,1,1e5])}
    ${b("نسبة رأس المال","WC Ratio",x(t.wcRatio),"",t.wcRatio*5,e.blue,"10-20%",[5,10,20])}
  </div>`}function Xt(o,a){const{R:t}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب الربحية — Profitability Ratios</div>
  <div class="cgrid c2">
    ${m("ch-pft-funnel","🔻 مسار الربحية","من الإيراد إلى صافي الربح — Funnel",340)}
    ${m("ch-pft-margins","📊 هوامش الربح","مقارنة شهرية — Grouped Bar 3D",340)}
  </div>
  <div class="kgrid">
    ${g("هامش الربح الإجمالي","Gross Margin",x(t.grossMgn),"","",e.green,"📊",t.grossMgn*2)}
    ${g("هامش تشغيلي","Operating Margin",x(t.opMgn),"","",e.teal,"⚙️",t.opMgn*3)}
    ${g("هامش صافي","Net Margin",x(t.netMgn),"","",e.violet,"✨",t.netMgn*4)}
    ${g("ROA","Return on Assets",x(t.roa),"","",e.yellow,"🏦",t.roa*5)}
    ${g("ROE","Return on Equity",x(t.roe),"","",e.blue,"💼",t.roe*3)}
    ${g("ROI","Return on Investment",x(t.roi),"","",e.orange,"🎯",Math.min(100,t.roi*2))}
    ${g("EBITDA","EBITDA Margin",x(t.ebitda),"","",e.pink,"📈",t.ebitda*2)}
    ${g("الترميح","Markup %",x(t.markup),"","",e.red,"🏷️",Math.min(100,t.markup))}
  </div>
  <div class="cgrid c3">
    ${m("ch-pft-donut","🍩 توزيع الإيراد","الربح / التكلفة / الضريبة",260)}
    ${m("ch-pft-roe-gauge","📡 مقياس ROE","العائد على حقوق الملكية",260)}
    ${m("ch-pft-bar","📊 مقارنة الهوامش","Margin Comparison Bar",260)}
  </div>
  <div class="rgrid">
    ${b("هامش الربح الإجمالي","Gross Margin",x(t.grossMgn),"",Math.min(100,t.grossMgn*15),e.green,"4-10% (جملة)",[2,4,7])}
    ${b("هامش الربح التشغيلي","Operating Margin",x(t.opMgn),"",Math.min(100,Math.abs(t.opMgn)*5),e.teal,"1-5%",[0,2,4])}
    ${b("هامش صافي الربح","Net Margin",x(t.netMgn),"",Math.min(100,Math.abs(t.netMgn)*5),e.violet,"1-4%",[0,1.5,3])}
    ${b("العائد على الأصول","ROA",x(t.roa),"",t.roa*5,e.yellow,"5-10%",[2,5,10])}
    ${b("العائد على الملكية","ROE",x(t.roe),"",t.roe*3,e.blue,"10-20%",[5,10,20])}
    ${b("العائد على الاستثمار","ROI",x(t.roi),"",Math.min(100,t.roi*2),e.orange,"10-25%",[5,10,20])}
    ${b("هامش EBITDA","EBITDA Margin",x(t.ebitda),"",t.ebitda*2,e.pink,"5-15%",[2,5,10])}
    ${b("نسبة الترميح","Markup",x(t.markup),"",Math.min(100,t.markup*12),e.red,"4-12%",[2,4,8])}
    ${b("الربح على إجمالي المبيعات","Gross/Total Sales",x(t.grossOnSales),"",t.grossOnSales*2,e.indigo,"4-10%",[2,4,8])}
  </div>`}function Zt(o,a){const{R:t}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> كفاءة العمليات — Operational Efficiency</div>
  <div class="cgrid c2">
    ${m("ch-eff-cycle","⏱️ دورة تحويل النقد","DIO + DSO - DPO = CCC",300)}
    ${m("ch-eff-turnover","🔄 معدلات الدوران","المخزون / الذمم / الأصول",300)}
  </div>
  <div class="kgrid">
    ${g("دوران المخزون","Inventory Turnover",f(t.invTurn)+"×","","",e.yellow,"📦",t.invTurn*8)}
    ${g("أيام المخزون (DIO)","Days Inv. Outstanding",f(t.dio,0),"يوم","المثالي 30-60",e.orange,"📅",100-Math.min(100,t.dio))}
    ${g("دوران الذمم المدينة","Receivables Turnover",f(t.recTurn)+"×","","",e.blue,"👥",t.recTurn*7)}
    ${g("أيام التحصيل (DSO)","Days Sales Outstanding",f(t.dso,0),"يوم","المثالي 30-45",e.red,"📅",100-Math.min(100,t.dso))}
    ${g("دوران الذمم الدائنة","Payables Turnover",f(t.payTurn)+"×","","",e.green,"🚛",t.payTurn*7)}
    ${g("أيام السداد (DPO)","Days Payable Outstanding",f(t.dpo,0),"يوم","المثالي 30-45",e.teal,"📅",Math.min(100,t.dpo))}
    ${g("دورة تحويل النقد","Cash Conversion Cycle",f(t.ccc,0),"يوم","أقل = أفضل",e.violet,"🔄",100-Math.min(100,t.ccc))}
    ${g("دوران الأصول","Asset Turnover",f(t.astTurn)+"×","","",e.pink,"🏭",Math.min(100,t.astTurn*40))}
    ${g("الدورة التشغيلية","Operating Cycle",f(t.opCycle,0),"يوم","DIO+DSO",e.indigo,"⚡",100-Math.min(100,t.opCycle/2))}
  </div>
  <div class="cgrid c1">
    ${m("ch-eff-days","📊 مقارنة أيام الدورة التشغيلية","DIO vs DSO vs DPO vs CCC",280)}
  </div>
  <div class="rgrid">
    ${b("معدل دوران المخزون","Inventory Turnover",f(t.invTurn)+"×","",t.invTurn*8,e.yellow,"6-12×",[1,4,8])}
    ${b("أيام المخزون","DIO",f(t.dio,0),"يوم",100-Math.min(100,t.dio),e.orange,"30-60 يوم",[90,60,30])}
    ${b("معدل دوران الذمم","Receivables Turnover",f(t.recTurn)+"×","",t.recTurn*7,e.blue,"8-12×",[2,5,8])}
    ${b("أيام التحصيل","DSO",f(t.dso,0),"يوم",100-Math.min(100,t.dso),e.red,"30-45 يوم",[60,45,30])}
    ${b("معدل دوران الدائنة","Payables Turnover",f(t.payTurn)+"×","",t.payTurn*7,e.green,"6-12×",[2,4,8])}
    ${b("أيام السداد","DPO",f(t.dpo,0),"يوم",Math.min(100,t.dpo),e.teal,"30-45 يوم",[0,15,45])}
    ${b("دورة تحويل النقد","CCC",f(t.ccc,0),"يوم",100-Math.min(100,t.ccc),e.violet,"<30 يوم",[60,45,20])}
    ${b("دوران الأصول","Asset Turnover",f(t.astTurn)+"×","",Math.min(100,t.astTurn*40),e.pink,"1.5-2.0×",[.5,1,1.5])}
    ${b("الدورة التشغيلية","Operating Cycle",f(t.opCycle,0),"يوم",100-Math.min(100,t.opCycle/2),e.indigo,"<90 يوم",[120,90,60])}
  </div>`}function te(o,a){const{R:t}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> الرفع المالي — Financial Leverage</div>
  <div class="cgrid c2">
    ${m("ch-lev-struct","🏗️ هيكل التمويل","الأصول = الديون + حقوق الملكية",300)}
    ${m("ch-lev-gauges","📡 مقاييس الرفع المالي","D/E × D/A × حقوق الملكية",300)}
  </div>
  <div class="kgrid">
    ${g("نسبة D/E","Debt to Equity",f(t.de),"×","أقل من 2.0×",e.red,"⚖️",Math.max(0,100-t.de*20))}
    ${g("نسبة الدين/الأصول","Debt to Assets",x(t.da),"","أقل من 50%",e.orange,"🏦",Math.max(0,100-t.da))}
    ${g("نسبة حقوق الملكية","Equity Ratio",x(t.eq),"","40-60%",e.green,"💼",t.eq)}
    ${g("مضاعف الملكية","Equity Multiplier",f(t.eqMult),"×","1.5-3.0×",e.blue,"✖️",Math.min(100,100/t.eqMult))}
    ${g("تغطية الفائدة","Interest Coverage",f(t.intCov)+"×","","أكبر من 3.0×",e.teal,"🛡️",Math.min(100,t.intCov*10))}
    ${g("التروس الرأسمالية","Capital Gearing",x(t.capGearing),"","أقل من 50%",e.violet,"⚙️",Math.max(0,100-t.capGearing))}
  </div>
  <div class="rgrid">
    ${b("الدين إلى الملكية","Debt/Equity",f(t.de),"×",Math.max(0,100-t.de*20),e.red,"< 2.0×",[3,2,1])}
    ${b("الدين إلى الأصول","Debt/Assets",x(t.da),"",Math.max(0,100-t.da),e.orange,"< 50%",[70,60,50])}
    ${b("نسبة الملكية","Equity Ratio",x(t.eq),"",t.eq,e.green,"40-60%",[20,30,50])}
    ${b("مضاعف الملكية","Equity Multiplier",f(t.eqMult),"×",Math.min(100,100/t.eqMult),e.blue,"1.5-3.0×",[4,3,2])}
    ${b("تغطية الفائدة","Interest Coverage",f(t.intCov),"×",Math.min(100,t.intCov*10),e.teal,"≥ 3.0×",[1,2,3])}
    ${b("نسبة الدين","Debt Ratio",f(t.debtRatio,2),"",Math.max(0,100-t.debtRatio*100),e.violet,"< 0.5",[.7,.6,.5])}
    ${b("التروس الرأسمالية","Capital Gearing",x(t.capGearing),"",Math.max(0,100-t.capGearing),e.pink,"< 50%",[70,60,50])}
  </div>`}function ee(o,a){const t=(c,n,p,S,l)=>`<div class="wf-row">
      <div class="wf-lbl">${c}</div>
      <div class="wf-bar-wrap">
        <div class="wf-bar-fill" style="width:${l}%;background:linear-gradient(90deg,${S},${S}88)">
          ${y(n)} <small>(${p}%)</small>
        </div>
      </div>
    </div>`,s=a.revTotal||1;o.innerHTML=`
  <div class="slbl"><span>◆</span> قائمة الدخل التحليلية — Income Statement</div>
  <div class="cgrid c2">
    <div class="ccard">
      <div class="cc-title">📋 قائمة الدخل التفصيلية</div>
      <div class="cc-sub">الفترة: ${a.period.from} — ${a.period.to}</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${t("إجمالي المبيعات (شامل ضريبة)",a.revTotal,100,e.indigo,100)}
        ${t("ضريبة القيمة المضافة",a.vatOut,(a.vatOut/s*100).toFixed(1),e.orange,a.vatOut/s*100)}
        ${t("صافي الإيراد",a.revenue,(a.revenue/s*100).toFixed(1),e.blue,a.revenue/s*100)}
        ${t("تكلفة البضاعة المباعة",a.cogs,(a.cogs/s*100).toFixed(1),e.red,a.cogs/s*100)}
        ${t("إجمالي الربح",a.grossProfit,(a.grossProfit/s*100).toFixed(1),e.green,a.grossProfit/s*100)}
        ${t("المصاريف التشغيلية",a.opExpenses,(a.opExpenses/s*100).toFixed(1),e.yellow,a.opExpenses/s*100)}
        ${t("الربح التشغيلي",a.opProfit,(a.opProfit/s*100).toFixed(1),e.teal,a.opProfit/s*100)}
        ${t("ضريبة الدخل (تقديري 15%)",a.tax,(a.tax/s*100).toFixed(1),e.orange,a.tax/s*100)}
        ${t("صافي الربح",a.netProfit,(a.netProfit/s*100).toFixed(1),e.violet,a.netProfit/s*100)}
      </div>
    </div>
    ${m("ch-inc-waterfall","📊 Waterfall قائمة الدخل","من الإيراد إلى صافي الربح",380)}
  </div>
  <div class="cgrid c2">
    ${m("ch-inc-trend","📈 اتجاه الإيراد والربح","آخر 6 أشهر مع التوقعات",280)}
    ${m("ch-inc-pie","🍩 توزيع الإيراد","الربح / التكاليف / الضريبة",280)}
  </div>`}function oe(o,a){if(!window.echarts)return;const{R:t,months6:s}=a,c=Ut,n="transparent",p=s.map(l=>l.lbl),S=(l,d,k)=>({type:"bar",barWidth:"55%",data:l,itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:d},{offset:1,color:k||d+"55"}]},borderRadius:[6,6,0,0],shadowColor:d+"44",shadowBlur:12,shadowOffsetY:-2}});if(o==="ov"&&(c("ch-rev6",{backgroundColor:n,tooltip:{...v,trigger:"axis"},legend:{data:["مبيعات","تكاليف","إجمالي ربح"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},grid:{left:20,right:20,top:25,bottom:40,containLabel:!0},xAxis:O(p),yAxis:C(l=>y(l)),series:[{name:"مبيعات",type:"line",smooth:!0,data:s.map(l=>l.rev),symbol:"circle",symbolSize:7,lineStyle:{color:e.indigo,width:3},itemStyle:{color:e.indigo},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(99,102,241,.4)"},{offset:1,color:"rgba(99,102,241,.02)"}]}}},{name:"تكاليف",type:"line",smooth:!0,data:s.map(l=>l.cost),symbol:"circle",symbolSize:5,lineStyle:{color:e.red,width:2,type:"dashed"},itemStyle:{color:e.red}},{name:"إجمالي ربح",type:"bar",barWidth:"30%",data:s.map(l=>l.gp),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.green+"cc"},{offset:1,color:e.green+"22"}]},borderRadius:[4,4,0,0]}}]}),c("ch-gauge-gm",{backgroundColor:n,series:[T("إجمالي",t.grossMgn,50,"100px","17%",e.green),T("تشغيلي",t.opMgn,30,"100px","50%",e.teal,!0),T("صافي",t.netMgn,20,"100px","83%",e.violet,!1,!0)]}),c("ch-cost-donut",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["48%","75%"],padAngle:3,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:10,formatter:l=>`${l.name}
${l.percent}%`},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:e.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:e.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:e.yellow}},{value:+a.opExpenses.toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:e.orange}}]}]}),window.echarts&&document.getElementById("ch-bar3d")&&c("ch-bar3d",{backgroundColor:n,tooltip:{...v,trigger:"axis"},xAxis:O(p),yAxis:C(l=>y(l)),series:[{...S(s.map(l=>l.rev),e.indigo,"#312e81"),barWidth:"60%",label:{show:!1}}]}),c("ch-radar6",{backgroundColor:n,radar:{indicator:[{name:"الربحية",max:100},{name:"السيولة",max:100},{name:"الكفاءة",max:100},{name:"الملاءة",max:100},{name:"التحصيل",max:100},{name:"المخزون",max:100},{name:"النمو",max:100},{name:"الاستقرار",max:100}],splitNumber:4,axisName:{color:"#64748b",fontSize:9},splitLine:{lineStyle:{color:"#1e293b"}},splitArea:{areaStyle:{color:["rgba(30,41,59,.5)","rgba(15,23,42,.5)"]}},axisLine:{lineStyle:{color:"#1e293b"}}},series:[{type:"radar",name:"الأداء الفعلي",symbol:"circle",symbolSize:5,lineStyle:{color:e.indigo,width:2},itemStyle:{color:e.indigo},areaStyle:{color:"rgba(99,102,241,.25)"},data:[{value:[Math.min(100,t.grossMgn*2),Math.min(100,t.curRatio*33),Math.min(100,t.invTurn*8),Math.min(100,t.eq),Math.min(100,100-t.dso),Math.min(100,t.invTurn*8),60,Math.min(100,100-t.da)]}]},{type:"radar",name:"المعيار",symbol:"none",lineStyle:{color:e.teal,width:1,type:"dashed"},areaStyle:{color:"rgba(45,212,191,.06)"},data:[{value:[50,66,64,50,70,64,50,50]}]}],legend:{data:["الأداء الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:9}}})),o==="liq"&&(c("ch-liq-gauges",{backgroundColor:n,series:[T("التداول",t.curRatio,3,"110px","17%",e.purple),T("السريعة",t.quickRatio,2,"110px","50%",e.teal,!0),T("النقدية",t.cashRatio,1,"110px","83%",e.yellow,!1,!0)]}),c("ch-liq-bars",{backgroundColor:n,tooltip:{...v,trigger:"axis"},legend:{data:["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},grid:{left:20,right:20,top:25,bottom:40,containLabel:!0},xAxis:O(["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"]),yAxis:C(l=>y(l)),series:[{type:"bar",barWidth:"45%",data:[{value:+a.cash.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.green},{offset:1,color:e.green+"44"}]},borderRadius:[8,8,0,0],shadowColor:e.green+"44",shadowBlur:12}},{value:+a.receivables.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.blue},{offset:1,color:e.blue+"44"}]},borderRadius:[8,8,0,0],shadowColor:e.blue+"44",shadowBlur:12}},{value:+a.invVal.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.yellow},{offset:1,color:e.yellow+"44"}]},borderRadius:[8,8,0,0],shadowColor:e.yellow+"44",shadowBlur:12}},{value:+a.curLiab.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.red},{offset:1,color:e.red+"44"}]},borderRadius:[8,8,0,0],shadowColor:e.red+"44",shadowBlur:12}}]}]}),c("ch-liq-waterfall",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:20,top:25,bottom:30,containLabel:!0},xAxis:O(["الأصول المتداولة","الخصوم","رأس المال العامل"]),yAxis:C(l=>y(l)),series:[S([+a.curAssets.toFixed(0),+a.curLiab.toFixed(0),+Math.max(0,t.workCap).toFixed(0)],e.teal)]}),c("ch-liq-trend",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:20,top:25,bottom:30,containLabel:!0},legend:{data:["التداول","السريعة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},xAxis:O(p),yAxis:C(),series:[{name:"التداول",type:"line",smooth:!0,symbol:"circle",symbolSize:6,data:p.map(()=>+(t.curRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:e.purple,width:3},itemStyle:{color:e.purple},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.purple+"44"},{offset:1,color:e.purple+"05"}]}}},{name:"السريعة",type:"line",smooth:!0,symbol:"circle",symbolSize:5,data:p.map(()=>+(t.quickRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:e.teal,width:2},itemStyle:{color:e.teal}}]})),o==="pft"&&(c("ch-pft-funnel",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"funnel",width:"75%",left:"12.5%",gap:5,sort:"descending",label:{position:"inside",color:"#fff",fontSize:11,fontWeight:800,formatter:l=>`${l.name}
${y(l.value)}`},itemStyle:{borderWidth:0,borderRadius:6},emphasis:{label:{fontSize:13}},data:[{value:+a.revTotal.toFixed(0),name:"إجمالي المبيعات",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#312e81"},{offset:1,color:e.indigo}]}}},{value:+a.revenue.toFixed(0),name:"الإيراد قبل الضريبة",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#1e3a8a"},{offset:1,color:e.blue}]}}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#064e3b"},{offset:1,color:e.green}]}}},{value:+a.opProfit.toFixed(0),name:"الربح التشغيلي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#134e4a"},{offset:1,color:e.teal}]}}},{value:+Math.max(0,a.netProfit).toFixed(0),name:"صافي الربح",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#4c1d95"},{offset:1,color:e.violet}]}}}]}]}),c("ch-pft-margins",{backgroundColor:n,tooltip:{...v,trigger:"axis",formatter:l=>l.map(d=>`${d.marker}${d.seriesName}: ${d.value}%`).join("<br>")},legend:{data:["إجمالي","تشغيلي","صافي"],bottom:0,textStyle:{color:"#475569",fontSize:10}},grid:{left:40,right:16,top:20,bottom:40},xAxis:O(p),yAxis:C(l=>l+"%"),series:[{name:"إجمالي",type:"bar",barGap:"5%",barWidth:"28%",data:p.map(()=>+t.grossMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.green},{offset:1,color:e.green+"33"}]},borderRadius:[4,4,0,0]}},{name:"تشغيلي",type:"bar",barWidth:"28%",data:p.map(()=>+t.opMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.teal},{offset:1,color:e.teal+"33"}]},borderRadius:[4,4,0,0]}},{name:"صافي",type:"bar",barWidth:"28%",data:p.map(()=>+t.netMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.violet},{offset:1,color:e.violet+"33"}]},borderRadius:[4,4,0,0]}}]}),c("ch-pft-donut",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["50%","78%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:e.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:e.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:e.orange}},{value:+a.tax.toFixed(0),name:"ضريبة الدخل",itemStyle:{color:e.yellow}}]}]}),c("ch-pft-roe-gauge",{backgroundColor:n,series:[{type:"gauge",radius:"90%",startAngle:210,endAngle:-30,min:0,max:30,axisLine:{lineStyle:{width:16,color:[[.33,e.red],[.66,e.yellow],[1,e.green]]}},progress:{show:!0,width:16,itemStyle:{color:"auto"}},pointer:{icon:"path://M12.8,0.7l12.3,0h36.2l12.3,0c0.4-12.5,0.8-25,4.9-37.3l-12.3,0l-36.2,0l-12.3,0C13.6-24.6,12.8-12.2,12.8,0.7z",length:"65%",width:6,offsetCenter:[0,"-2%"],itemStyle:{color:"auto"}},detail:{valueAnimation:!0,formatter:l=>l.toFixed(1)+"%",color:"#e2e8f0",fontSize:18,fontWeight:800,offsetCenter:[0,"72%"]},title:{offsetCenter:[0,"90%"],fontSize:10,color:"#64748b"},data:[{value:+t.roe.toFixed(1),name:"ROE"}],axisLabel:{color:"#475569",fontSize:9,formatter:l=>l+"%"},splitLine:{lineStyle:{color:"#1e293b",width:2}},axisTick:{lineStyle:{color:"#1e293b"}}}]}),c("ch-pft-bar",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:10,right:10,top:10,bottom:60,containLabel:!0},xAxis:{type:"category",data:["إجمالي","تشغيلي","صافي","ROA","ROE","ROI","EBITDA","ترميح"],axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:l=>l+"%"},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{type:"bar",barWidth:"60%",data:[t.grossMgn,t.opMgn,t.netMgn,t.roa,t.roe,t.roi,t.ebitda,t.markup].map((l,d)=>{const k=[e.green,e.teal,e.violet,e.yellow,e.blue,e.orange,e.pink,e.red];return{value:+l.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:k[d]},{offset:1,color:k[d]+"22"}]},borderRadius:[6,6,0,0],shadowColor:k[d]+"44",shadowBlur:10}}})}]})),o==="eff"&&(c("ch-eff-cycle",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`أيام المخزون
(DIO)`,`أيام التحصيل
(DSO)`,`أيام السداد
(DPO)`,`دورة النقد
(CCC)`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:C(l=>l+" يوم"),series:[{type:"bar",barWidth:"55%",data:[{value:+t.dio.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.yellow},{offset:1,color:e.yellow+"22"}]},borderRadius:[8,8,0,0],shadowColor:e.yellow+"55",shadowBlur:14}},{value:+t.dso.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.blue},{offset:1,color:e.blue+"22"}]},borderRadius:[8,8,0,0],shadowColor:e.blue+"55",shadowBlur:14}},{value:+t.dpo.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.green},{offset:1,color:e.green+"22"}]},borderRadius:[8,8,0,0],shadowColor:e.green+"55",shadowBlur:14}},{value:+t.ccc.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.ccc<30?e.green:t.ccc<60?e.yellow:e.red},{offset:1,color:e.red+"22"}]},borderRadius:[8,8,0,0],shadowColor:e.red+"55",shadowBlur:14}}],label:{show:!0,position:"top",color:"#94a3b8",fontSize:10,formatter:l=>l.value+" يوم"}}]}),c("ch-eff-turnover",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`دوران
المخزون`,`دوران
الذمم`,`دوران
الأصول`,`دوران
الدائنة`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:C(l=>l+"×"),series:[{name:"الفعلي",type:"bar",barGap:"10%",barWidth:"35%",data:[{value:+t.invTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.yellow},{offset:1,color:e.yellow+"22"}]},borderRadius:[6,6,0,0]}},{value:+t.recTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.blue},{offset:1,color:e.blue+"22"}]},borderRadius:[6,6,0,0]}},{value:+t.astTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.violet},{offset:1,color:e.violet+"22"}]},borderRadius:[6,6,0,0]}},{value:+t.payTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.green},{offset:1,color:e.green+"22"}]},borderRadius:[6,6,0,0]}}]},{name:"المعيار",type:"bar",barWidth:"35%",data:[8,10,1.5,8].map(l=>({value:l,itemStyle:{color:"#1e293b",borderRadius:[6,6,0,0]}}))}],legend:{data:["الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:10}}}),c("ch-eff-days",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:40,right:16,top:20,bottom:30},legend:{data:["DIO","DSO","DPO"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:O(p),yAxis:C(l=>l+" يوم"),series:[{name:"DIO",type:"line",smooth:!0,data:p.map(()=>+(t.dio*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:e.yellow,width:2},itemStyle:{color:e.yellow},symbol:"circle",symbolSize:5},{name:"DSO",type:"line",smooth:!0,data:p.map(()=>+(t.dso*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:e.blue,width:2},itemStyle:{color:e.blue},symbol:"circle",symbolSize:5},{name:"DPO",type:"line",smooth:!0,data:p.map(()=>+(t.dpo*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:e.green,width:2},itemStyle:{color:e.green},symbol:"circle",symbolSize:5}]})),o==="lev"&&(c("ch-lev-struct",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:60,containLabel:!0},legend:{data:["الأصول الثابتة","الأصول المتداولة","الديون طويلة","الديون قصيرة","حقوق الملكية"],bottom:0,textStyle:{color:"#475569",fontSize:9}},xAxis:{type:"category",data:["هيكل الأصول","هيكل التمويل"],axisLabel:{color:"#475569",fontSize:11}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:l=>y(l)},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{name:"الأصول الثابتة",type:"bar",stack:"a",data:[+a.fixedAssets.toFixed(0),0],itemStyle:{color:e.blue}},{name:"الأصول المتداولة",type:"bar",stack:"a",data:[+a.curAssets.toFixed(0),0],itemStyle:{color:e.indigo}},{name:"الديون طويلة",type:"bar",stack:"b",data:[0,+a.longLiab.toFixed(0)],itemStyle:{color:e.red}},{name:"الديون قصيرة",type:"bar",stack:"b",data:[0,+a.curLiab.toFixed(0)],itemStyle:{color:e.orange}},{name:"حقوق الملكية",type:"bar",stack:"b",data:[0,+Math.max(0,a.equity).toFixed(0)],itemStyle:{color:e.green}}]}),c("ch-lev-gauges",{backgroundColor:n,series:[T("D/E ×",t.de,5,"100px","17%",t.de>2?e.red:t.de>1?e.yellow:e.green),T("D/A %",t.da,100,"100px","50%",t.da>60?e.red:t.da>50?e.yellow:e.green,!0),T("EQ %",t.eq,100,"100px","83%",t.eq<30?e.red:t.eq<50?e.yellow:e.green,!1,!0)]})),o==="inc"){const l=[{name:"إجمالي المبيعات",value:+a.revTotal.toFixed(0),color:e.indigo},{name:"خصم الضريبة",value:-a.vatOut.toFixed(0),color:e.red},{name:"صافي الإيراد",value:+a.revenue.toFixed(0),color:e.blue},{name:"خصم التكلفة",value:-a.cogs.toFixed(0),color:e.red},{name:"الربح الإجمالي",value:+a.grossProfit.toFixed(0),color:e.green},{name:"خصم المصاريف",value:-a.opExpenses.toFixed(0),color:e.orange},{name:"الربح التشغيلي",value:+a.opProfit.toFixed(0),color:e.teal},{name:"خصم الضريبة",value:-a.tax.toFixed(0),color:e.yellow},{name:"صافي الربح",value:+a.netProfit.toFixed(0),color:e.violet}];c("ch-inc-waterfall",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:80,containLabel:!0},xAxis:{type:"category",data:l.map(d=>d.name),axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:C(d=>y(d)),series:[{type:"bar",barWidth:"60%",data:l.map(d=>({value:Math.abs(d.value),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:d.color},{offset:1,color:d.color+"22"}]},borderRadius:[6,6,0,0],shadowColor:d.color+"44",shadowBlur:12},label:{show:!0,position:"top",color:"#94a3b8",fontSize:8,formatter:()=>y(Math.abs(d.value))}}))}]}),c("ch-inc-trend",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:60,right:16,top:20,bottom:30},legend:{data:["إيراد","ربح إجمالي","صافي ربح"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:O(p),yAxis:C(d=>y(d)),series:[{name:"إيراد",type:"line",smooth:!0,data:s.map(d=>d.rev),lineStyle:{color:e.indigo,width:3},itemStyle:{color:e.indigo},symbol:"circle",symbolSize:6,areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.indigo+"44"},{offset:1,color:e.indigo+"05"}]}}},{name:"ربح إجمالي",type:"line",smooth:!0,data:s.map(d=>d.gp),lineStyle:{color:e.green,width:2},itemStyle:{color:e.green},symbol:"circle",symbolSize:5},{name:"صافي ربح",type:"line",smooth:!0,data:s.map(d=>+(d.gp*.75).toFixed(0)),lineStyle:{color:e.violet,width:2},itemStyle:{color:e.violet},symbol:"circle",symbolSize:5}]}),c("ch-inc-pie",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["45%","75%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9,formatter:d=>`${d.name}
${d.percent.toFixed(1)}%`},data:[{value:+Math.max(0,a.grossProfit).toFixed(0),name:"الربح الإجمالي",itemStyle:{color:e.green}},{value:+Math.max(0,a.cogs).toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:e.red}},{value:+Math.max(0,a.vatOut).toFixed(0),name:"ضريبة المبيعات",itemStyle:{color:e.orange}},{value:+Math.max(0,a.opExpenses).toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:e.yellow}},{value:+Math.max(0,a.tax).toFixed(0),name:"ضريبة الدخل",itemStyle:{color:e.violet}}]}]})}}function T(o,a,t,s,c,n,p=!1,S=!1){return{type:"gauge",radius:s,center:[S?"83%":p?"50%":"17%","55%"],startAngle:210,endAngle:-30,min:0,max:t,axisLine:{lineStyle:{width:12,color:[[a/t||.01,n],[1,"#1e293b"]]}},progress:{show:!0,width:12,itemStyle:{color:n}},pointer:{show:!1},axisTick:{show:!1},splitLine:{show:!1},axisLabel:{show:!1},title:{fontSize:8,color:"#64748b",offsetCenter:[0,"85%"]},detail:{formatter:d=>d.toFixed(t>5?0:2)+(t===100?"%":"×"),fontSize:13,color:"#e2e8f0",fontWeight:800,offsetCenter:[0,"40%"]},data:[{value:Math.min(t,+a.toFixed(2)),name:o}]}}window.fa2Export=()=>{if(!L)return;const{R:o,period:a}=L,t=window.open("","_blank","width=900,height=700"),s=Object.entries({"هامش الربح الإجمالي":o.grossMgn.toFixed(1)+"%","هامش الربح التشغيلي":o.opMgn.toFixed(1)+"%","هامش صافي الربح":o.netMgn.toFixed(1)+"%","العائد على الأصول ROA":o.roa.toFixed(1)+"%","العائد على الملكية ROE":o.roe.toFixed(1)+"%","العائد على الاستثمار ROI":o.roi.toFixed(1)+"%","هامش EBITDA":o.ebitda.toFixed(1)+"%","نسبة الترميح":o.markup.toFixed(1)+"%","نسبة التداول":o.curRatio.toFixed(2)+"×","نسبة السيولة السريعة":o.quickRatio.toFixed(2)+"×","نسبة النقدية":o.cashRatio.toFixed(2)+"×","رأس المال العامل":y(o.workCap),"معدل دوران المخزون":o.invTurn.toFixed(1)+"×","أيام المخزون DIO":o.dio.toFixed(0)+" يوم","معدل دوران الذمم":o.recTurn.toFixed(1)+"×","أيام التحصيل DSO":o.dso.toFixed(0)+" يوم","معدل دوران الدائنة":o.payTurn.toFixed(1)+"×","أيام السداد DPO":o.dpo.toFixed(0)+" يوم","دورة تحويل النقد CCC":o.ccc.toFixed(0)+" يوم","الدورة التشغيلية":o.opCycle.toFixed(0)+" يوم","معدل دوران الأصول":o.astTurn.toFixed(2)+"×","نسبة الدين إلى الملكية D/E":o.de.toFixed(2)+"×","نسبة الدين إلى الأصول D/A":o.da.toFixed(1)+"%","نسبة حقوق الملكية":o.eq.toFixed(1)+"%","مضاعف الملكية":o.eqMult.toFixed(2)+"×","نسبة تغطية الفائدة":o.intCov.toFixed(1)+"×","نسبة الدين":o.debtRatio.toFixed(2),"التروس الرأسمالية":o.capGearing.toFixed(1)+"%"}).map(([c,n])=>`<tr><td>${c}</td><td style="text-align:left;font-weight:800;color:#6366f1">${n}</td></tr>`).join("");t.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
  <title>التحليل المالي — IDHAM ERP</title>
  <style>body{font-family:Arial;padding:20px;color:#0f172a;direction:rtl}
  h2{text-align:center;color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px}
  table{width:100%;border-collapse:collapse}th{background:#6366f1;color:#fff;padding:9px}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}
  .meta{text-align:center;color:#64748b;font-size:12px;margin:-10px 0 20px}</style></head>
  <body><h2>📊 التحليل المالي الشامل — IDHAM ERP</h2>
  <p class="meta">الفترة: ${a.from} — ${a.to}</p>
  <table><thead><tr><th>النسبة المالية</th><th>القيمة</th></tr></thead>
  <tbody>${s}</tbody></table></body></html>`),t.document.close(),t.print()};export{ce as render};
