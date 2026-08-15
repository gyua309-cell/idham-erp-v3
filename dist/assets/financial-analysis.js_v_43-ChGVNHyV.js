const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{_ as Fe,g as F,C as A,f as Ae}from"./index-HrCilPJ3.js";import{where as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function Te(){if(window._echartsReady)return;const o=a=>new Promise((e,i)=>{const s=document.createElement("script");s.src=a,s.onload=e,s.onerror=i,document.head.appendChild(s)});window.echarts||await o("https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js");try{await o("https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js")}catch{}window._echartsReady=!0}let P=null,te="month",L=[];async function Ke(o,a){o.innerHTML=Oe(),ze(),await Te(),await oe()}function Oe(){return`
<div id="fa2" style="display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg-0)">

<style>
/* ── Header ── */
#fa2 .fa-hdr{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;
  background:linear-gradient(135deg,#0f172a,#1e1b4b);border-bottom:1px solid #312e81;flex-shrink:0;flex-wrap:wrap;gap:8px}
#fa2 .fa-logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 0 20px rgba(99,102,241,.5),0 0 40px rgba(139,92,246,.2)}
#fa2 .fa-htitle{font-size:17px;font-weight:900;color:#e0e7ff;margin:0}
#fa2 .fa-hsub{font-size:10px;color:#818cf8;margin:2px 0 0}
/* Period buttons */
#fa2 .pgrp{display:flex;background:#1e1b4b;border-radius:8px;border:1px solid #312e81;overflow:hidden}
#fa2 .pbtn{padding:5px 14px;border:none;background:transparent;color:#818cf8;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
#fa2 .pbtn.on{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.4)}
#fa2 .hbtn{padding:6px 12px;border-radius:8px;border:1px solid #312e81;background:#1e1b4b;color:#a5b4fc;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:all .15s;white-space:nowrap}
#fa2 .hbtn:hover{background:#312e81;color:#e0e7ff}
#fa2 .hbtn.primary{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border-color:#6366f1}
/* Tabs */
#fa2 .tabs{display:flex;padding:0 12px;background:#0f172a;border-bottom:2px solid #1e293b;flex-shrink:0;overflow-x:auto;scrollbar-width:none;gap:0}
#fa2 .tab{padding:9px 16px;border:none;background:transparent;color:#64748b;cursor:pointer;font-size:11px;font-weight:800;font-family:inherit;white-space:nowrap;display:flex;align-items:center;gap:6px;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;letter-spacing:.3px}
#fa2 .tab:hover{color:#94a3b8}
#fa2 .tab.on{color:#818cf8;border-bottom-color:#6366f1;background:rgba(99,102,241,.08)}
/* Content */
#fa2 .content{flex:1;overflow-y:auto;padding:12px}
/* Loading */
#fa2 .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;gap:16px;color:#64748b}
#fa2 .spinner{width:44px;height:44px;border:3px solid #1e293b;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* KPI Grid */
#fa2 .kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:14px}
#fa2 .kcard{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid #1e293b;border-radius:14px;padding:14px;position:relative;overflow:hidden;cursor:default;transition:transform .2s,box-shadow .2s}
#fa2 .kcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}
#fa2 .kcard::before{content:"";position:absolute;top:0;right:0;width:60px;height:60px;border-radius:50%;filter:blur(20px);opacity:.3}
#fa2 .kc-lbl{font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
#fa2 .kc-val{font-size:20px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1;margin-bottom:4px}
#fa2 .kc-sub{font-size:10px;color:#475569;margin-bottom:6px}
#fa2 .kc-bar{height:3px;border-radius:2px;margin-top:6px;opacity:.6}
#fa2 .kc-icon{position:absolute;top:10px;left:10px;font-size:26px;opacity:.08}
#fa2 .kc-trend{font-size:10px;font-weight:800;margin-top:2px}
/* Chart cards */
#fa2 .cgrid{display:grid;gap:12px;margin-bottom:14px}
#fa2 .cgrid.c2{grid-template-columns:1fr 1fr}
#fa2 .cgrid.c3{grid-template-columns:1fr 1fr 1fr}
#fa2 .cgrid.c1{grid-template-columns:1fr}
@media(max-width:950px){#fa2 .cgrid.c2,#fa2 .cgrid.c3{grid-template-columns:1fr}}
#fa2 .ccard{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid #1e293b;border-radius:14px;padding:16px;position:relative;overflow:hidden}
#fa2 .ccard::after{content:"";position:absolute;top:-30px;left:-30px;width:80px;height:80px;border-radius:50%;opacity:.04;filter:blur(20px);background:#6366f1}
#fa2 .cc-title{font-size:12px;font-weight:900;color:#e2e8f0;margin-bottom:2px;display:flex;align-items:center;gap:7px}
#fa2 .cc-sub{font-size:9px;color:#475569;margin-bottom:12px}
#fa2 .cc-badge{font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(99,102,241,.2);color:#818cf8;font-weight:800;margin-right:auto}
/* Ratio cards */
#fa2 .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-bottom:14px}
#fa2 .rcard{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid #1e293b;border-radius:12px;padding:14px}
#fa2 .rc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#fa2 .rc-name{font-size:11px;font-weight:800;color:#94a3b8}
#fa2 .rc-eng{font-size:9px;color:#475569;margin-top:1px}
#fa2 .rc-val{font-size:28px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1}
#fa2 .rc-unit{font-size:12px;font-weight:600;opacity:.6;margin-right:3px}
#fa2 .rc-bar{height:6px;background:#0f172a;border-radius:4px;overflow:hidden;margin:8px 0}
#fa2 .rc-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,1,.36,1)}
#fa2 .rc-bench{display:flex;justify-content:space-between;font-size:9px;color:#475569}
#fa2 .badge{font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px}
#fa2 .b-ex{background:rgba(16,185,129,.15);color:#10b981}
#fa2 .b-gd{background:rgba(99,102,241,.15);color:#818cf8}
#fa2 .b-wn{background:rgba(245,158,11,.15);color:#f59e0b}
#fa2 .b-dn{background:rgba(239,68,68,.15);color:#ef4444}
/* Section label */
#fa2 .slbl{font-size:10px;font-weight:900;color:#475569;text-transform:uppercase;letter-spacing:.8px;
  padding:6px 0 10px;display:flex;align-items:center;gap:7px;border-bottom:1px solid #1e293b;margin-bottom:12px}
#fa2 .slbl span{color:#6366f1}
/* Waterfall */
#fa2 .wf-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
#fa2 .wf-lbl{font-size:11px;color:#94a3b8;width:160px;flex-shrink:0;text-align:right}
#fa2 .wf-bar-wrap{flex:1;height:26px;background:#0f172a;border-radius:6px;overflow:hidden;position:relative}
#fa2 .wf-bar-fill{height:100%;border-radius:6px;position:absolute;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;transition:width .8s cubic-bezier(.22,1,.36,1)}
</style>

<!-- Header -->
<div class="fa-hdr">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="fa-logo">📊</div>
    <div>
      <div class="fa-htitle">التحليل المالي الشامل</div>
      <div class="fa-hsub">30+ نسبة مالية • ECharts GL 3D • بيانات حية من Firestore</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <div class="pgrp">
      <button class="pbtn on" data-p="month">هذا الشهر</button>
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
</div>`}function ze(){document.querySelectorAll("#fa2 .pbtn").forEach(o=>o.addEventListener("click",async()=>{document.querySelectorAll("#fa2 .pbtn").forEach(a=>a.classList.remove("on")),o.classList.add("on"),te=o.dataset.p,await oe()}))}window.fa2Tab=o=>{document.querySelectorAll("#fa2 .tab").forEach(e=>e.classList.toggle("on",e.id===`t-${o}`));const a=document.getElementById("fa2-cnt");!a||!P||(L.forEach(e=>{try{e.dispose()}catch{}}),L=[],xe(o,a))};window.fa2Refresh=()=>oe(!0);async function oe(o=!1){const a=document.getElementById("fa2-cnt");if(a){a.innerHTML='<div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>',L.forEach(e=>{try{e.dispose()}catch{}}),L=[];try{P=await De(o);const e=document.querySelector("#fa2 .tab.on")?.id?.replace("t-","")||"ov";xe(e,a)}catch(e){a.innerHTML=`<div style="color:#ef4444;padding:20px">خطأ: ${e.message}</div>`}}}async function De(o=!1){const a=l=>{const d=l.getFullYear(),b=String(l.getMonth()+1).padStart(2,"0"),k=String(l.getDate()).padStart(2,"0");return`${d}-${b}-${k}`},e=new Date,i=e.getFullYear(),s=e.getMonth();let n=te==="year"?new Date(i,0,1):te==="quarter"?new Date(i,Math.floor(s/3)*3,1):new Date(i,s,1);const x=a(n),h=a(e),{clearERPCache:r,COMPANY_ID:c}=await Fe(async()=>{const{clearERPCache:l,COMPANY_ID:d}=await import("./index-HrCilPJ3.js").then(b=>b.N);return{clearERPCache:l,COMPANY_ID:d}},__vite__mapDeps([0,1]));o&&(r(`companies/${c}/salesInvoices`),r(`companies/${c}/purchaseInvoices`),r(`companies/${c}/stockByWarehouse`),r(`companies/${c}/customers`),r(`companies/${c}/suppliers`),r(`companies/${c}/products`),r(`companies/${c}/chartOfAccounts`),r(`companies/${c}/journalEntries`));const[$,G,ae,re,ie,me,N,le]=await Promise.all([F(A.salesInvoices(),[Y("date",">=",x),Y("date","<=",h)]),F(A.purchaseInvoices(),[Y("date",">=",x),Y("date","<=",h)]),F(A.stockByWarehouse()),F(A.customers()),F(A.suppliers()),F(A.products()),F(A.chartOfAccounts()),F(A.journalEntries())]),ne={},se={};N.forEach(l=>{ne[l.id]=l,se[l.code]=l});const ce=l=>ne[l.accountId]||se[l.accountCode];let O=0,D=0,Q=0,K=0;for(const l of N){let d=0;for(const b of le){if(b.status&&b.status!=="posted")continue;const k=b.date||"";if(k>=x&&k<=h)for(const C of b.lines||[]){const R=ce(C);!R||R.id!==l.id||(d+=(C.credit||0)-(C.debit||0))}}if(l.type==="revenue")O+=d;else if(l.type==="expense"){const b=-d;l.code?.startsWith("5-1")||l.name?.includes("تكلفة البضاعة")||l.name?.includes("تكلفة مبيعات")||l.name?.includes("نقل بضاعة")?D+=b:Q+=b}else l.code?.startsWith("2-1-3")?K+=Math.abs(d):l.code?.startsWith("1-1-5")}D<.01&&(D=$.reduce((l,d)=>l+(d.totalCost||0),0));const E=O-D,_=E-Q,de=Math.max(0,_*.15),pe=_-de,U=O+K;let j=0,J=0,H=0,V=0,X=0,q=0,I=0,W=0;for(const l of N){let d=0;for(const b of le){if(b.status&&b.status!=="posted")continue;if((b.date||"")<=h)for(const C of b.lines||[]){const R=ce(C);!R||R.id!==l.id||(d+=(C.debit||0)-(C.credit||0))}}if(l.type==="asset")l.code?.startsWith("1-2")||l.code?.startsWith("1-3")||l.name?.includes("سيارات")||l.name?.includes("أثاث")||l.name?.includes("معدات")?J+=d:(j+=d,l.code?.startsWith("1-1-1")&&(X+=d),l.code?.startsWith("1-1-2")&&(q+=d),l.code?.startsWith("1-1-4")&&(I+=d));else if(l.type==="liability"){const b=-d;l.code?.startsWith("2-2")||l.name?.includes("طويل")?V+=b:(H+=b,l.code?.startsWith("2-1-1")&&(W+=b))}}if(I<.01){const l={};me.forEach(d=>{l[d.id]=d.averageCost||d.costPrice||0}),I=ae.reduce((d,b)=>d+(b.qty||0)*(l[b.productId]||0),0)}q<.01&&(q=re.reduce((l,d)=>l+Math.max(0,d.balance||0),0)),W<.01&&(W=ie.reduce((l,d)=>l+Math.max(0,d.balance||0),0));const Z=j+J,ee=H+V,fe=Math.max(1,Z-ee),ue=G.reduce((l,d)=>l+(d.subtotal||d.totalBeforeTax||0),0),ye=G.reduce((l,d)=>l+(d.totalVat||d.taxAmount||0),0),he=G.reduce((l,d)=>l+(d.totalWithVat||d.total||d.grandTotal||0),0),ve=Array.from({length:6},(l,d)=>{const b=new Date(e.getFullYear(),e.getMonth()-5+d,1),k=b.toLocaleString("ar-SA",{month:"short"}),C=b.getFullYear(),R=b.getMonth(),ge=$.filter(z=>{const w=new Date(z.date||"");return w.getFullYear()===C&&w.getMonth()===R}).reduce((z,w)=>z+(w.totalWithVat||w.grandTotal||0),0),Me=G.filter(z=>{const w=new Date(z.date||"");return w.getFullYear()===C&&w.getMonth()===R}).reduce((z,w)=>z+(w.total||w.grandTotal||0),0),Re=E>0&&O>0?ge*(E/O):0;return{lbl:k,rev:Math.round(ge),cost:Math.round(Me),gp:Math.round(Re)}}),B=$.length,we=B>0?U/B:0,Se=$.filter(l=>l.status==="paid").length,$e=B>0?Se/B*100:0,Ce=ae.reduce((l,d)=>l+(d.qty||0),0),ke=Pe({revenue:O,revTotal:U,cogs:D,grossProfit:E,opProfit:_,netProfit:pe,purchCost:ue,invVal:I,receivables:q,payables:W,cash:X,curAssets:j,totAssets:Z,curLiab:H,longLiab:V,totLiab:ee,equity:fe});return{period:{from:x,to:h},revenue:O,vatOut:K,revTotal:U,cogs:D,grossProfit:E,opExpenses:Q,opProfit:_,tax:de,netProfit:pe,purchCost:ue,purchVat:ye,purchTotal:he,invVal:I,invQty:Ce,receivables:q,payables:W,cash:X,curAssets:j,fixedAssets:J,totAssets:Z,curLiab:H,longLiab:V,totLiab:ee,equity:fe,invCount:B,avgInv:we,collRate:$e,months6:ve,R:ke,custCount:re.length,suppCount:ie.length}}function Pe(o){const a=(s,n)=>n>0?s/n*100:0,e=(s,n)=>n>0?s/n:0,i=(s,n)=>n>0?s/n*365:0;return{curRatio:e(o.curAssets,o.curLiab),quickRatio:e(o.curAssets-o.invVal,o.curLiab),cashRatio:e(o.cash,o.curLiab),workCap:o.curAssets-o.curLiab,wcRatio:a(o.curAssets-o.curLiab,o.revenue),grossMgn:a(o.grossProfit,o.revenue),opMgn:a(o.opProfit,o.revenue),netMgn:a(o.netProfit,o.revenue),roa:a(o.netProfit,o.totAssets),roe:a(o.netProfit,o.equity),roi:a(o.grossProfit-o.purchCost,o.purchCost),markup:a(o.grossProfit,o.cogs||1),ebitda:a(o.opProfit*1.1,o.revenue),grossOnSales:a(o.grossProfit,o.revTotal),invTurn:e(o.cogs,o.invVal||1),dio:i(o.invVal,o.cogs||1),recTurn:e(o.revenue,o.receivables||1),dso:i(o.receivables,o.revenue||1),payTurn:e(o.purchCost,o.payables||1),dpo:i(o.payables,o.purchCost||1),ccc:i(o.invVal,o.cogs||1)+i(o.receivables,o.revenue||1)-i(o.payables,o.purchCost||1),astTurn:e(o.revenue,o.totAssets||1),opCycle:i(o.invVal,o.cogs||1)+i(o.receivables,o.revenue||1),de:e(o.totLiab,o.equity),da:a(o.totLiab,o.totAssets),eq:a(o.equity,o.totAssets),eqMult:e(o.totAssets,o.equity),intCov:e(o.opProfit,o.opProfit*.07||1),debtRatio:e(o.totLiab,o.totAssets),capGearing:a(o.longLiab,o.equity+o.longLiab)}}const t={purple:"#818cf8",teal:"#2dd4bf",green:"#10b981",yellow:"#f59e0b",red:"#f87171",blue:"#60a5fa",orange:"#fb923c",pink:"#f472b6",indigo:"#6366f1",violet:"#8b5cf6"},y=o=>Ae(o||0),p=(o,a=2)=>(typeof o=="number"?o:0).toFixed(a),g=(o,a=1)=>p(o,a)+"%";function Le(o,a){const[e,i,s]=a;return o<=e?'<span class="badge b-dn">تحت المعيار</span>':o<=i?'<span class="badge b-wn">مقبول</span>':o<=s?'<span class="badge b-gd">جيد</span>':'<span class="badge b-ex">ممتاز ✦</span>'}function f(o,a,e,i,s,n,x,h=60){return`<div class="kcard" style="border-color:${n}22">
    <div style="position:absolute;top:0;right:0;width:50px;height:50px;background:${n};border-radius:50%;filter:blur(18px);opacity:.2"></div>
    <div class="kc-icon" style="color:${n}">${x}</div>
    <div class="kc-lbl">${o}</div>
    <div class="kc-lbl" style="color:${n}55;font-size:8px">${a}</div>
    <div class="kc-val" style="color:${n}">${e}<span style="font-size:11px;opacity:.6;margin-right:2px">${i}</span></div>
    <div class="kc-sub">${s}</div>
    <div class="kc-bar" style="background:linear-gradient(90deg,${n},${n}55);width:${Math.min(100,h)}%"></div>
  </div>`}function u(o,a,e,i,s,n,x,h){const r=h?Le(parseFloat(e),h):"",c=Math.min(100,Math.max(0,s));return`<div class="rcard" style="border-color:${n}22">
    <div class="rc-head">
      <div><div class="rc-name">${o}</div><div class="rc-eng">${a}</div></div>
      ${r}
    </div>
    <div class="rc-val" style="color:${n}">${e}<span class="rc-unit">${i}</span></div>
    <div class="rc-bar"><div class="rc-fill" style="width:${c}%;background:linear-gradient(90deg,${n},${n}88)"></div></div>
    <div class="rc-bench"><span>المعيار: ${x}</span><span style="color:${n}">${c.toFixed(0)}%</span></div>
  </div>`}function m(o,a,e,i=300,s=""){return`<div class="ccard">
    <div class="cc-title">${a}${s?`<span class="cc-badge">${s}</span>`:""}</div>
    <div class="cc-sub">${e}</div>
    <div id="${o}" style="width:100%;height:${i}px"></div>
  </div>`}function Ee(o,a){const e=document.getElementById(o);if(!e||!window.echarts)return null;const i=echarts.init(e,"dark",{renderer:"canvas"});return i.setOption(a),L.push(i),i}const T=o=>({type:"category",data:o,axisLine:{lineStyle:{color:"#1e293b"}},axisTick:{show:!1},axisLabel:{color:"#475569",fontSize:9}}),S=o=>({type:"value",splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}},axisLabel:{color:"#475569",fontSize:9,formatter:o||null}}),v={backgroundColor:"#1e1b4b",borderColor:"#312e81",borderWidth:1,textStyle:{color:"#e2e8f0",fontSize:11}};function xe(o,a){({ov:be,liq:qe,pft:Ie,eff:We,lev:Be,inc:Ge}[o]||be)(a,P),setTimeout(()=>_e(o,P),80),window.addEventListener("resize",()=>L.forEach(i=>{try{i.resize()}catch{}}))}function be(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> المؤشرات المالية الكبرى — KPIs</div>
  <div class="kgrid">
    ${f("إجمالي المبيعات (بدون ضريبة)","Total Revenue",y(a.revenue),"",""+a.invCount+" فاتورة",t.indigo,"💰",75)}
    ${f("الربح الإجمالي","Gross Profit",y(a.grossProfit),"",g(e.grossMgn),t.green,"📈",e.grossMgn*2)}
    ${f("الربح التشغيلي","Operating Profit",y(a.opProfit),"",g(e.opMgn),t.teal,"⚡",e.opMgn*2)}
    ${f("صافي الربح","Net Profit",y(a.netProfit),"",g(e.netMgn),t.violet,"✨",e.netMgn*3)}
    ${f("قيمة المخزون","Inventory Value",y(a.invVal),"",a.invQty+" وحدة",t.yellow,"📦",60)}
    ${f("الذمم المدينة","Receivables",y(a.receivables),"",a.custCount+" عميل",t.red,"👥",50)}
    ${f("الذمم الدائنة","Payables",y(a.payables),"",a.suppCount+" مورد",t.orange,"🚛",45)}
    ${f("متوسط الفاتورة","Avg Invoice",y(a.avgInv),"",g(a.collRate)+" محصّل",t.blue,"🧾",a.collRate)}
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
    ${u("نسبة التداول","Current Ratio",p(e.curRatio),"×",e.curRatio*33,t.purple,"≥ 2.0×",[.5,1,2])}
    ${u("هامش الربح الإجمالي","Gross Margin",g(e.grossMgn),"",e.grossMgn,t.green,"20-30%",[5,15,25])}
    ${u("معدل دوران المخزون","Inventory Turnover",p(e.invTurn),"×",e.invTurn*8,t.yellow,"6-12×",[1,4,8])}
    ${u("أيام التحصيل","Days Sales Outstanding",p(e.dso,0),"يوم",100-Math.min(100,e.dso),t.red,"30-45 يوم",[60,45,30])}
    ${u("نسبة الدين إلى الملكية","Debt/Equity",p(e.de),"×",Math.max(0,100-e.de*20),t.orange,"< 2×",[3,2,1])}
    ${u("العائد على الأصول","ROA",g(e.roa),"",e.roa*4,t.teal,"5-10%",[2,5,10])}
  </div>`}function qe(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب السيولة — Liquidity Ratios</div>
  <div class="cgrid c2">
    ${m("ch-liq-gauges","📡 مقاييس السيولة الثلاثة","نسبة التداول / السريعة / النقدية",320)}
    ${m("ch-liq-bars","📊 هيكل الأصول المتداولة","نقدية + ذمم + مخزون vs خصوم",320,"ECharts 3D")}
  </div>
  <div class="kgrid">
    ${f("نسبة التداول","Current Ratio",p(e.curRatio),"×","المثالي ≥ 2.0×",t.purple,"🔵",e.curRatio*33)}
    ${f("نسبة السريعة","Quick Ratio",p(e.quickRatio),"×","المثالي ≥ 1.0×",t.teal,"⚡",e.quickRatio*50)}
    ${f("نسبة النقدية","Cash Ratio",p(e.cashRatio),"×","المثالي ≥ 0.5×",t.yellow,"💵",e.cashRatio*100)}
    ${f("رأس المال العامل","Working Capital",y(e.workCap),"","يجب أن يكون +",t.green,"⚖️",70)}
    ${f("نسبة WC/مبيعات","WC/Revenue",g(e.wcRatio),"","المثالي 10-20%",t.blue,"📈",e.wcRatio*5)}
  </div>
  <div class="cgrid c2">
    ${m("ch-liq-waterfall","💧 تحليل رأس المال العامل","Waterfall — الأصول vs الخصوم",280)}
    ${m("ch-liq-trend","📈 اتجاه السيولة","مقارنة نسبة التداول والسريعة",280)}
  </div>
  <div class="slbl" style="margin-top:8px"><span>◆</span> تحليل تفصيلي</div>
  <div class="rgrid">
    ${u("نسبة التداول","Current Ratio",p(e.curRatio),"×",e.curRatio*33,t.purple,"≥ 2.0×",[.5,1,2])}
    ${u("نسبة السريعة","Quick Ratio",p(e.quickRatio),"×",e.quickRatio*50,t.teal,"≥ 1.0×",[.3,.7,1])}
    ${u("نسبة النقدية","Cash Ratio",p(e.cashRatio),"×",e.cashRatio*100,t.yellow,"≥ 0.5×",[.1,.3,.5])}
    ${u("رأس المال العامل","Working Capital",y(e.workCap),"",70,t.green,"يجب موجب",[0,1,1e5])}
    ${u("نسبة رأس المال","WC Ratio",g(e.wcRatio),"",e.wcRatio*5,t.blue,"10-20%",[5,10,20])}
  </div>`}function Ie(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب الربحية — Profitability Ratios</div>
  <div class="cgrid c2">
    ${m("ch-pft-funnel","🔻 مسار الربحية","من الإيراد إلى صافي الربح — Funnel",340)}
    ${m("ch-pft-margins","📊 هوامش الربح","مقارنة شهرية — Grouped Bar 3D",340)}
  </div>
  <div class="kgrid">
    ${f("هامش الربح الإجمالي","Gross Margin",g(e.grossMgn),"","",t.green,"📊",e.grossMgn*2)}
    ${f("هامش تشغيلي","Operating Margin",g(e.opMgn),"","",t.teal,"⚙️",e.opMgn*3)}
    ${f("هامش صافي","Net Margin",g(e.netMgn),"","",t.violet,"✨",e.netMgn*4)}
    ${f("ROA","Return on Assets",g(e.roa),"","",t.yellow,"🏦",e.roa*5)}
    ${f("ROE","Return on Equity",g(e.roe),"","",t.blue,"💼",e.roe*3)}
    ${f("ROI","Return on Investment",g(e.roi),"","",t.orange,"🎯",Math.min(100,e.roi*2))}
    ${f("EBITDA","EBITDA Margin",g(e.ebitda),"","",t.pink,"📈",e.ebitda*2)}
    ${f("الترميح","Markup %",g(e.markup),"","",t.red,"🏷️",Math.min(100,e.markup))}
  </div>
  <div class="cgrid c3">
    ${m("ch-pft-donut","🍩 توزيع الإيراد","الربح / التكلفة / الضريبة",260)}
    ${m("ch-pft-roe-gauge","📡 مقياس ROE","العائد على حقوق الملكية",260)}
    ${m("ch-pft-bar","📊 مقارنة الهوامش","Margin Comparison Bar",260)}
  </div>
  <div class="rgrid">
    ${u("هامش الربح الإجمالي","Gross Margin",g(e.grossMgn),"",e.grossMgn*2,t.green,"20-30%",[5,15,25])}
    ${u("هامش الربح التشغيلي","Operating Margin",g(e.opMgn),"",e.opMgn*3,t.teal,"10-20%",[2,8,15])}
    ${u("هامش صافي الربح","Net Margin",g(e.netMgn),"",e.netMgn*4,t.violet,"5-15%",[1,5,10])}
    ${u("العائد على الأصول","ROA",g(e.roa),"",e.roa*5,t.yellow,"5-10%",[2,5,10])}
    ${u("العائد على الملكية","ROE",g(e.roe),"",e.roe*3,t.blue,"10-20%",[5,10,20])}
    ${u("العائد على الاستثمار","ROI",g(e.roi),"",Math.min(100,e.roi*2),t.orange,"10-25%",[5,10,20])}
    ${u("هامش EBITDA","EBITDA Margin",g(e.ebitda),"",e.ebitda*2,t.pink,"15-25%",[5,12,20])}
    ${u("نسبة الترميح","Markup",g(e.markup),"",Math.min(100,e.markup),t.red,"20-50%",[5,15,30])}
    ${u("الربح على إجمالي المبيعات","Gross/Total Sales",g(e.grossOnSales),"",e.grossOnSales*2,t.indigo,"15-25%",[5,12,20])}
  </div>`}function We(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> كفاءة العمليات — Operational Efficiency</div>
  <div class="cgrid c2">
    ${m("ch-eff-cycle","⏱️ دورة تحويل النقد","DIO + DSO - DPO = CCC",300)}
    ${m("ch-eff-turnover","🔄 معدلات الدوران","المخزون / الذمم / الأصول",300)}
  </div>
  <div class="kgrid">
    ${f("دوران المخزون","Inventory Turnover",p(e.invTurn)+"×","","",t.yellow,"📦",e.invTurn*8)}
    ${f("أيام المخزون (DIO)","Days Inv. Outstanding",p(e.dio,0),"يوم","المثالي 30-60",t.orange,"📅",100-Math.min(100,e.dio))}
    ${f("دوران الذمم المدينة","Receivables Turnover",p(e.recTurn)+"×","","",t.blue,"👥",e.recTurn*7)}
    ${f("أيام التحصيل (DSO)","Days Sales Outstanding",p(e.dso,0),"يوم","المثالي 30-45",t.red,"📅",100-Math.min(100,e.dso))}
    ${f("دوران الذمم الدائنة","Payables Turnover",p(e.payTurn)+"×","","",t.green,"🚛",e.payTurn*7)}
    ${f("أيام السداد (DPO)","Days Payable Outstanding",p(e.dpo,0),"يوم","المثالي 30-45",t.teal,"📅",Math.min(100,e.dpo))}
    ${f("دورة تحويل النقد","Cash Conversion Cycle",p(e.ccc,0),"يوم","أقل = أفضل",t.violet,"🔄",100-Math.min(100,e.ccc))}
    ${f("دوران الأصول","Asset Turnover",p(e.astTurn)+"×","","",t.pink,"🏭",Math.min(100,e.astTurn*40))}
    ${f("الدورة التشغيلية","Operating Cycle",p(e.opCycle,0),"يوم","DIO+DSO",t.indigo,"⚡",100-Math.min(100,e.opCycle/2))}
  </div>
  <div class="cgrid c1">
    ${m("ch-eff-days","📊 مقارنة أيام الدورة التشغيلية","DIO vs DSO vs DPO vs CCC",280)}
  </div>
  <div class="rgrid">
    ${u("معدل دوران المخزون","Inventory Turnover",p(e.invTurn)+"×","",e.invTurn*8,t.yellow,"6-12×",[1,4,8])}
    ${u("أيام المخزون","DIO",p(e.dio,0),"يوم",100-Math.min(100,e.dio),t.orange,"30-60 يوم",[90,60,30])}
    ${u("معدل دوران الذمم","Receivables Turnover",p(e.recTurn)+"×","",e.recTurn*7,t.blue,"8-12×",[2,5,8])}
    ${u("أيام التحصيل","DSO",p(e.dso,0),"يوم",100-Math.min(100,e.dso),t.red,"30-45 يوم",[60,45,30])}
    ${u("معدل دوران الدائنة","Payables Turnover",p(e.payTurn)+"×","",e.payTurn*7,t.green,"6-12×",[2,4,8])}
    ${u("أيام السداد","DPO",p(e.dpo,0),"يوم",Math.min(100,e.dpo),t.teal,"30-45 يوم",[0,15,45])}
    ${u("دورة تحويل النقد","CCC",p(e.ccc,0),"يوم",100-Math.min(100,e.ccc),t.violet,"<30 يوم",[60,45,20])}
    ${u("دوران الأصول","Asset Turnover",p(e.astTurn)+"×","",Math.min(100,e.astTurn*40),t.pink,"1.5-2.0×",[.5,1,1.5])}
    ${u("الدورة التشغيلية","Operating Cycle",p(e.opCycle,0),"يوم",100-Math.min(100,e.opCycle/2),t.indigo,"<90 يوم",[120,90,60])}
  </div>`}function Be(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> الرفع المالي — Financial Leverage</div>
  <div class="cgrid c2">
    ${m("ch-lev-struct","🏗️ هيكل التمويل","الأصول = الديون + حقوق الملكية",300)}
    ${m("ch-lev-gauges","📡 مقاييس الرفع المالي","D/E × D/A × حقوق الملكية",300)}
  </div>
  <div class="kgrid">
    ${f("نسبة D/E","Debt to Equity",p(e.de),"×","أقل من 2.0×",t.red,"⚖️",Math.max(0,100-e.de*20))}
    ${f("نسبة الدين/الأصول","Debt to Assets",g(e.da),"","أقل من 50%",t.orange,"🏦",Math.max(0,100-e.da))}
    ${f("نسبة حقوق الملكية","Equity Ratio",g(e.eq),"","40-60%",t.green,"💼",e.eq)}
    ${f("مضاعف الملكية","Equity Multiplier",p(e.eqMult),"×","1.5-3.0×",t.blue,"✖️",Math.min(100,100/e.eqMult))}
    ${f("تغطية الفائدة","Interest Coverage",p(e.intCov)+"×","","أكبر من 3.0×",t.teal,"🛡️",Math.min(100,e.intCov*10))}
    ${f("التروس الرأسمالية","Capital Gearing",g(e.capGearing),"","أقل من 50%",t.violet,"⚙️",Math.max(0,100-e.capGearing))}
  </div>
  <div class="rgrid">
    ${u("الدين إلى الملكية","Debt/Equity",p(e.de),"×",Math.max(0,100-e.de*20),t.red,"< 2.0×",[3,2,1])}
    ${u("الدين إلى الأصول","Debt/Assets",g(e.da),"",Math.max(0,100-e.da),t.orange,"< 50%",[70,60,50])}
    ${u("نسبة الملكية","Equity Ratio",g(e.eq),"",e.eq,t.green,"40-60%",[20,30,50])}
    ${u("مضاعف الملكية","Equity Multiplier",p(e.eqMult),"×",Math.min(100,100/e.eqMult),t.blue,"1.5-3.0×",[4,3,2])}
    ${u("تغطية الفائدة","Interest Coverage",p(e.intCov),"×",Math.min(100,e.intCov*10),t.teal,"≥ 3.0×",[1,2,3])}
    ${u("نسبة الدين","Debt Ratio",p(e.debtRatio,2),"",Math.max(0,100-e.debtRatio*100),t.violet,"< 0.5",[.7,.6,.5])}
    ${u("التروس الرأسمالية","Capital Gearing",g(e.capGearing),"",Math.max(0,100-e.capGearing),t.pink,"< 50%",[70,60,50])}
  </div>`}function Ge(o,a){const e=(s,n,x,h,r)=>`<div class="wf-row">
      <div class="wf-lbl">${s}</div>
      <div class="wf-bar-wrap">
        <div class="wf-bar-fill" style="width:${r}%;background:linear-gradient(90deg,${h},${h}88)">
          ${y(n)} <small>(${x}%)</small>
        </div>
      </div>
    </div>`,i=a.revTotal||1;o.innerHTML=`
  <div class="slbl"><span>◆</span> قائمة الدخل التحليلية — Income Statement</div>
  <div class="cgrid c2">
    <div class="ccard">
      <div class="cc-title">📋 قائمة الدخل التفصيلية</div>
      <div class="cc-sub">الفترة: ${a.period.from} — ${a.period.to}</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${e("إجمالي المبيعات (شامل ضريبة)",a.revTotal,100,t.indigo,100)}
        ${e("ضريبة القيمة المضافة",a.vatOut,(a.vatOut/i*100).toFixed(1),t.orange,a.vatOut/i*100)}
        ${e("صافي الإيراد",a.revenue,(a.revenue/i*100).toFixed(1),t.blue,a.revenue/i*100)}
        ${e("تكلفة البضاعة المباعة",a.cogs,(a.cogs/i*100).toFixed(1),t.red,a.cogs/i*100)}
        ${e("إجمالي الربح",a.grossProfit,(a.grossProfit/i*100).toFixed(1),t.green,a.grossProfit/i*100)}
        ${e("المصاريف التشغيلية",a.opExpenses,(a.opExpenses/i*100).toFixed(1),t.yellow,a.opExpenses/i*100)}
        ${e("الربح التشغيلي",a.opProfit,(a.opProfit/i*100).toFixed(1),t.teal,a.opProfit/i*100)}
        ${e("ضريبة الدخل (تقديري 15%)",a.tax,(a.tax/i*100).toFixed(1),t.orange,a.tax/i*100)}
        ${e("صافي الربح",a.netProfit,(a.netProfit/i*100).toFixed(1),t.violet,a.netProfit/i*100)}
      </div>
    </div>
    ${m("ch-inc-waterfall","📊 Waterfall قائمة الدخل","من الإيراد إلى صافي الربح",380)}
  </div>
  <div class="cgrid c2">
    ${m("ch-inc-trend","📈 اتجاه الإيراد والربح","آخر 6 أشهر مع التوقعات",280)}
    ${m("ch-inc-pie","🍩 توزيع الإيراد","الربح / التكاليف / الضريبة",280)}
  </div>`}function _e(o,a){if(!window.echarts)return;const{R:e,months6:i}=a,s=Ee,n="transparent",x=i.map(r=>r.lbl),h=(r,c,$)=>({type:"bar",barWidth:"55%",data:r,itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:c},{offset:1,color:$||c+"55"}]},borderRadius:[6,6,0,0],shadowColor:c+"44",shadowBlur:12,shadowOffsetY:-2}});if(o==="ov"&&(s("ch-rev6",{backgroundColor:n,tooltip:{...v,trigger:"axis"},legend:{data:["مبيعات","تكاليف","إجمالي ربح"],bottom:0,textStyle:{color:"#475569",fontSize:10}},grid:{left:60,right:16,top:20,bottom:40},xAxis:T(x),yAxis:S(r=>y(r)),series:[{name:"مبيعات",type:"line",smooth:!0,data:i.map(r=>r.rev),symbol:"circle",symbolSize:7,lineStyle:{color:t.indigo,width:3},itemStyle:{color:t.indigo},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(99,102,241,.4)"},{offset:1,color:"rgba(99,102,241,.02)"}]}}},{name:"تكاليف",type:"line",smooth:!0,data:i.map(r=>r.cost),symbol:"circle",symbolSize:5,lineStyle:{color:t.red,width:2,type:"dashed"},itemStyle:{color:t.red}},{name:"إجمالي ربح",type:"bar",barWidth:"30%",data:i.map(r=>r.gp),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green+"cc"},{offset:1,color:t.green+"22"}]},borderRadius:[4,4,0,0]}}]}),s("ch-gauge-gm",{backgroundColor:n,series:[M("إجمالي",e.grossMgn,50,"100px","17%",t.green),M("تشغيلي",e.opMgn,30,"100px","50%",t.teal,!0),M("صافي",e.netMgn,20,"100px","83%",t.violet,!1,!0)]}),s("ch-cost-donut",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["48%","75%"],padAngle:3,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:10,formatter:r=>`${r.name}
${r.percent}%`},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:t.yellow}},{value:+a.opExpenses.toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:t.orange}}]}]}),window.echarts&&document.getElementById("ch-bar3d")&&s("ch-bar3d",{backgroundColor:n,tooltip:{...v,trigger:"axis"},xAxis:T(x),yAxis:S(r=>y(r)),series:[{...h(i.map(r=>r.rev),t.indigo,"#312e81"),barWidth:"60%",label:{show:!1}}]}),s("ch-radar6",{backgroundColor:n,radar:{indicator:[{name:"الربحية",max:100},{name:"السيولة",max:100},{name:"الكفاءة",max:100},{name:"الملاءة",max:100},{name:"التحصيل",max:100},{name:"المخزون",max:100},{name:"النمو",max:100},{name:"الاستقرار",max:100}],splitNumber:4,axisName:{color:"#64748b",fontSize:9},splitLine:{lineStyle:{color:"#1e293b"}},splitArea:{areaStyle:{color:["rgba(30,41,59,.5)","rgba(15,23,42,.5)"]}},axisLine:{lineStyle:{color:"#1e293b"}}},series:[{type:"radar",name:"الأداء الفعلي",symbol:"circle",symbolSize:5,lineStyle:{color:t.indigo,width:2},itemStyle:{color:t.indigo},areaStyle:{color:"rgba(99,102,241,.25)"},data:[{value:[Math.min(100,e.grossMgn*2),Math.min(100,e.curRatio*33),Math.min(100,e.invTurn*8),Math.min(100,e.eq),Math.min(100,100-e.dso),Math.min(100,e.invTurn*8),60,Math.min(100,100-e.da)]}]},{type:"radar",name:"المعيار",symbol:"none",lineStyle:{color:t.teal,width:1,type:"dashed"},areaStyle:{color:"rgba(45,212,191,.06)"},data:[{value:[50,66,64,50,70,64,50,50]}]}],legend:{data:["الأداء الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:9}}})),o==="liq"&&(s("ch-liq-gauges",{backgroundColor:n,series:[M("التداول",e.curRatio,3,"110px","17%",t.purple),M("السريعة",e.quickRatio,2,"110px","50%",t.teal,!0),M("النقدية",e.cashRatio,1,"110px","83%",t.yellow,!1,!0)]}),s("ch-liq-bars",{backgroundColor:n,tooltip:{...v,trigger:"axis"},legend:{data:["الأصول المتداولة","الخصوم المتداولة"],bottom:0,textStyle:{color:"#475569",fontSize:10}},grid:{left:16,right:16,top:20,bottom:40},xAxis:T(["النقدية","الذمم المدينة","المخزون","المجموع","الخصوم المتداولة"]),yAxis:S(r=>y(r)),series:[{type:"bar",barWidth:"55%",data:[{value:+a.cash.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.green+"44",shadowBlur:12}},{value:+a.receivables.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.blue+"44",shadowBlur:12}},{value:+a.invVal.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.yellow+"44",shadowBlur:12}},{value:+a.curAssets.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.indigo},{offset:1,color:t.indigo+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.indigo+"44",shadowBlur:12}},{value:+a.curLiab.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.red},{offset:1,color:t.red+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.red+"44",shadowBlur:12}}]}]}),s("ch-liq-waterfall",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:60,right:16,top:20,bottom:30},xAxis:T(["الأصول المتداولة","الخصوم","رأس المال العامل"]),yAxis:S(r=>y(r)),series:[h([+a.curAssets.toFixed(0),+a.curLiab.toFixed(0),+Math.max(0,e.workCap).toFixed(0)],t.teal)]}),s("ch-liq-trend",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:40,right:16,top:20,bottom:30},legend:{data:["التداول","السريعة"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:T(x),yAxis:S(),series:[{name:"التداول",type:"line",smooth:!0,symbol:"circle",symbolSize:6,data:x.map(()=>+(e.curRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:t.purple,width:3},itemStyle:{color:t.purple},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.purple+"44"},{offset:1,color:t.purple+"05"}]}}},{name:"السريعة",type:"line",smooth:!0,symbol:"circle",symbolSize:5,data:x.map(()=>+(e.quickRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:t.teal,width:2},itemStyle:{color:t.teal}}]})),o==="pft"&&(s("ch-pft-funnel",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"funnel",width:"75%",left:"12.5%",gap:5,sort:"descending",label:{position:"inside",color:"#fff",fontSize:11,fontWeight:800,formatter:r=>`${r.name}
${y(r.value)}`},itemStyle:{borderWidth:0,borderRadius:6},emphasis:{label:{fontSize:13}},data:[{value:+a.revTotal.toFixed(0),name:"إجمالي المبيعات",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#312e81"},{offset:1,color:t.indigo}]}}},{value:+a.revenue.toFixed(0),name:"الإيراد قبل الضريبة",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#1e3a8a"},{offset:1,color:t.blue}]}}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#064e3b"},{offset:1,color:t.green}]}}},{value:+a.opProfit.toFixed(0),name:"الربح التشغيلي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#134e4a"},{offset:1,color:t.teal}]}}},{value:+Math.max(0,a.netProfit).toFixed(0),name:"صافي الربح",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#4c1d95"},{offset:1,color:t.violet}]}}}]}]}),s("ch-pft-margins",{backgroundColor:n,tooltip:{...v,trigger:"axis",formatter:r=>r.map(c=>`${c.marker}${c.seriesName}: ${c.value}%`).join("<br>")},legend:{data:["إجمالي","تشغيلي","صافي"],bottom:0,textStyle:{color:"#475569",fontSize:10}},grid:{left:40,right:16,top:20,bottom:40},xAxis:T(x),yAxis:S(r=>r+"%"),series:[{name:"إجمالي",type:"bar",barGap:"5%",barWidth:"28%",data:x.map(()=>+e.grossMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"33"}]},borderRadius:[4,4,0,0]}},{name:"تشغيلي",type:"bar",barWidth:"28%",data:x.map(()=>+e.opMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.teal},{offset:1,color:t.teal+"33"}]},borderRadius:[4,4,0,0]}},{name:"صافي",type:"bar",barWidth:"28%",data:x.map(()=>+e.netMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.violet},{offset:1,color:t.violet+"33"}]},borderRadius:[4,4,0,0]}}]}),s("ch-pft-donut",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["50%","78%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:t.orange}},{value:+a.tax.toFixed(0),name:"ضريبة الدخل",itemStyle:{color:t.yellow}}]}]}),s("ch-pft-roe-gauge",{backgroundColor:n,series:[{type:"gauge",radius:"90%",startAngle:210,endAngle:-30,min:0,max:30,axisLine:{lineStyle:{width:16,color:[[.33,t.red],[.66,t.yellow],[1,t.green]]}},progress:{show:!0,width:16,itemStyle:{color:"auto"}},pointer:{icon:"path://M12.8,0.7l12.3,0h36.2l12.3,0c0.4-12.5,0.8-25,4.9-37.3l-12.3,0l-36.2,0l-12.3,0C13.6-24.6,12.8-12.2,12.8,0.7z",length:"65%",width:6,offsetCenter:[0,"-2%"],itemStyle:{color:"auto"}},detail:{valueAnimation:!0,formatter:r=>r.toFixed(1)+"%",color:"#e2e8f0",fontSize:18,fontWeight:800,offsetCenter:[0,"72%"]},title:{offsetCenter:[0,"90%"],fontSize:10,color:"#64748b"},data:[{value:+e.roe.toFixed(1),name:"ROE"}],axisLabel:{color:"#475569",fontSize:9,formatter:r=>r+"%"},splitLine:{lineStyle:{color:"#1e293b",width:2}},axisTick:{lineStyle:{color:"#1e293b"}}}]}),s("ch-pft-bar",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:10,right:10,top:10,bottom:60,containLabel:!0},xAxis:{type:"category",data:["إجمالي","تشغيلي","صافي","ROA","ROE","ROI","EBITDA","ترميح"],axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:r=>r+"%"},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{type:"bar",barWidth:"60%",data:[e.grossMgn,e.opMgn,e.netMgn,e.roa,e.roe,e.roi,e.ebitda,e.markup].map((r,c)=>{const $=[t.green,t.teal,t.violet,t.yellow,t.blue,t.orange,t.pink,t.red];return{value:+r.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:$[c]},{offset:1,color:$[c]+"22"}]},borderRadius:[6,6,0,0],shadowColor:$[c]+"44",shadowBlur:10}}})}]})),o==="eff"&&(s("ch-eff-cycle",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`أيام المخزون
(DIO)`,`أيام التحصيل
(DSO)`,`أيام السداد
(DPO)`,`دورة النقد
(CCC)`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:S(r=>r+" يوم"),series:[{type:"bar",barWidth:"55%",data:[{value:+e.dio.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.yellow+"55",shadowBlur:14}},{value:+e.dso.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.blue+"55",shadowBlur:14}},{value:+e.dpo.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.green+"55",shadowBlur:14}},{value:+e.ccc.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.ccc<30?t.green:e.ccc<60?t.yellow:t.red},{offset:1,color:t.red+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.red+"55",shadowBlur:14}}],label:{show:!0,position:"top",color:"#94a3b8",fontSize:10,formatter:r=>r.value+" يوم"}}]}),s("ch-eff-turnover",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`دوران
المخزون`,`دوران
الذمم`,`دوران
الأصول`,`دوران
الدائنة`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:S(r=>r+"×"),series:[{name:"الفعلي",type:"bar",barGap:"10%",barWidth:"35%",data:[{value:+e.invTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.recTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.astTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.violet},{offset:1,color:t.violet+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.payTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"22"}]},borderRadius:[6,6,0,0]}}]},{name:"المعيار",type:"bar",barWidth:"35%",data:[8,10,1.5,8].map(r=>({value:r,itemStyle:{color:"#1e293b",borderRadius:[6,6,0,0]}}))}],legend:{data:["الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:10}}}),s("ch-eff-days",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:40,right:16,top:20,bottom:30},legend:{data:["DIO","DSO","DPO"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:T(x),yAxis:S(r=>r+" يوم"),series:[{name:"DIO",type:"line",smooth:!0,data:x.map(()=>+(e.dio*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.yellow,width:2},itemStyle:{color:t.yellow},symbol:"circle",symbolSize:5},{name:"DSO",type:"line",smooth:!0,data:x.map(()=>+(e.dso*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.blue,width:2},itemStyle:{color:t.blue},symbol:"circle",symbolSize:5},{name:"DPO",type:"line",smooth:!0,data:x.map(()=>+(e.dpo*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.green,width:2},itemStyle:{color:t.green},symbol:"circle",symbolSize:5}]})),o==="lev"&&(s("ch-lev-struct",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:60,containLabel:!0},legend:{data:["الأصول الثابتة","الأصول المتداولة","الديون طويلة","الديون قصيرة","حقوق الملكية"],bottom:0,textStyle:{color:"#475569",fontSize:9}},xAxis:{type:"category",data:["هيكل الأصول","هيكل التمويل"],axisLabel:{color:"#475569",fontSize:11}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:r=>y(r)},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{name:"الأصول الثابتة",type:"bar",stack:"a",data:[+a.fixedAssets.toFixed(0),0],itemStyle:{color:t.blue}},{name:"الأصول المتداولة",type:"bar",stack:"a",data:[+a.curAssets.toFixed(0),0],itemStyle:{color:t.indigo}},{name:"الديون طويلة",type:"bar",stack:"b",data:[0,+a.longLiab.toFixed(0)],itemStyle:{color:t.red}},{name:"الديون قصيرة",type:"bar",stack:"b",data:[0,+a.curLiab.toFixed(0)],itemStyle:{color:t.orange}},{name:"حقوق الملكية",type:"bar",stack:"b",data:[0,+Math.max(0,a.equity).toFixed(0)],itemStyle:{color:t.green}}]}),s("ch-lev-gauges",{backgroundColor:n,series:[M("D/E ×",e.de,5,"100px","17%",e.de>2?t.red:e.de>1?t.yellow:t.green),M("D/A %",e.da,100,"100px","50%",e.da>60?t.red:e.da>50?t.yellow:t.green,!0),M("EQ %",e.eq,100,"100px","83%",e.eq<30?t.red:e.eq<50?t.yellow:t.green,!1,!0)]})),o==="inc"){const r=[{name:"إجمالي المبيعات",value:+a.revTotal.toFixed(0),color:t.indigo},{name:"خصم الضريبة",value:-a.vatOut.toFixed(0),color:t.red},{name:"صافي الإيراد",value:+a.revenue.toFixed(0),color:t.blue},{name:"خصم التكلفة",value:-a.cogs.toFixed(0),color:t.red},{name:"الربح الإجمالي",value:+a.grossProfit.toFixed(0),color:t.green},{name:"خصم المصاريف",value:-a.opExpenses.toFixed(0),color:t.orange},{name:"الربح التشغيلي",value:+a.opProfit.toFixed(0),color:t.teal},{name:"خصم الضريبة",value:-a.tax.toFixed(0),color:t.yellow},{name:"صافي الربح",value:+a.netProfit.toFixed(0),color:t.violet}];s("ch-inc-waterfall",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:80,containLabel:!0},xAxis:{type:"category",data:r.map(c=>c.name),axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:S(c=>y(c)),series:[{type:"bar",barWidth:"60%",data:r.map(c=>({value:Math.abs(c.value),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:c.color},{offset:1,color:c.color+"22"}]},borderRadius:[6,6,0,0],shadowColor:c.color+"44",shadowBlur:12},label:{show:!0,position:"top",color:"#94a3b8",fontSize:8,formatter:()=>y(Math.abs(c.value))}}))}]}),s("ch-inc-trend",{backgroundColor:n,tooltip:{...v,trigger:"axis"},grid:{left:60,right:16,top:20,bottom:30},legend:{data:["إيراد","ربح إجمالي","صافي ربح"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:T(x),yAxis:S(c=>y(c)),series:[{name:"إيراد",type:"line",smooth:!0,data:i.map(c=>c.rev),lineStyle:{color:t.indigo,width:3},itemStyle:{color:t.indigo},symbol:"circle",symbolSize:6,areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.indigo+"44"},{offset:1,color:t.indigo+"05"}]}}},{name:"ربح إجمالي",type:"line",smooth:!0,data:i.map(c=>c.gp),lineStyle:{color:t.green,width:2},itemStyle:{color:t.green},symbol:"circle",symbolSize:5},{name:"صافي ربح",type:"line",smooth:!0,data:i.map(c=>+(c.gp*.75).toFixed(0)),lineStyle:{color:t.violet,width:2},itemStyle:{color:t.violet},symbol:"circle",symbolSize:5}]}),s("ch-inc-pie",{backgroundColor:n,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["45%","75%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9,formatter:c=>`${c.name}
${c.percent.toFixed(1)}%`},data:[{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.vatOut.toFixed(0),name:"ضريبة المبيعات",itemStyle:{color:t.orange}},{value:+a.opExpenses.toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:t.yellow}},{value:+a.tax.toFixed(0),name:"ضريبة الدخل",itemStyle:{color:t.violet}}]}]})}}function M(o,a,e,i,s,n,x=!1,h=!1){return{type:"gauge",radius:i,center:[h?"83%":x?"50%":"17%","55%"],startAngle:210,endAngle:-30,min:0,max:e,axisLine:{lineStyle:{width:12,color:[[a/e||.01,n],[1,"#1e293b"]]}},progress:{show:!0,width:12,itemStyle:{color:n}},pointer:{show:!1},axisTick:{show:!1},splitLine:{show:!1},axisLabel:{show:!1},title:{fontSize:8,color:"#64748b",offsetCenter:[0,"85%"]},detail:{formatter:c=>c.toFixed(e>5?0:2)+(e===100?"%":"×"),fontSize:13,color:"#e2e8f0",fontWeight:800,offsetCenter:[0,"40%"]},data:[{value:Math.min(e,+a.toFixed(2)),name:o}]}}window.fa2Export=()=>{if(!P)return;const{R:o,period:a}=P,e=window.open("","_blank","width=900,height=700"),i=Object.entries({"هامش الربح الإجمالي":o.grossMgn.toFixed(1)+"%","هامش الربح التشغيلي":o.opMgn.toFixed(1)+"%","هامش صافي الربح":o.netMgn.toFixed(1)+"%","العائد على الأصول ROA":o.roa.toFixed(1)+"%","العائد على الملكية ROE":o.roe.toFixed(1)+"%","العائد على الاستثمار ROI":o.roi.toFixed(1)+"%","هامش EBITDA":o.ebitda.toFixed(1)+"%","نسبة الترميح":o.markup.toFixed(1)+"%","نسبة التداول":o.curRatio.toFixed(2)+"×","نسبة السيولة السريعة":o.quickRatio.toFixed(2)+"×","نسبة النقدية":o.cashRatio.toFixed(2)+"×","رأس المال العامل":y(o.workCap),"معدل دوران المخزون":o.invTurn.toFixed(1)+"×","أيام المخزون DIO":o.dio.toFixed(0)+" يوم","معدل دوران الذمم":o.recTurn.toFixed(1)+"×","أيام التحصيل DSO":o.dso.toFixed(0)+" يوم","معدل دوران الدائنة":o.payTurn.toFixed(1)+"×","أيام السداد DPO":o.dpo.toFixed(0)+" يوم","دورة تحويل النقد CCC":o.ccc.toFixed(0)+" يوم","الدورة التشغيلية":o.opCycle.toFixed(0)+" يوم","معدل دوران الأصول":o.astTurn.toFixed(2)+"×","نسبة الدين إلى الملكية D/E":o.de.toFixed(2)+"×","نسبة الدين إلى الأصول D/A":o.da.toFixed(1)+"%","نسبة حقوق الملكية":o.eq.toFixed(1)+"%","مضاعف الملكية":o.eqMult.toFixed(2)+"×","نسبة تغطية الفائدة":o.intCov.toFixed(1)+"×","نسبة الدين":o.debtRatio.toFixed(2),"التروس الرأسمالية":o.capGearing.toFixed(1)+"%"}).map(([s,n])=>`<tr><td>${s}</td><td style="text-align:left;font-weight:800;color:#6366f1">${n}</td></tr>`).join("");e.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
  <title>التحليل المالي — IDHAM ERP</title>
  <style>body{font-family:Arial;padding:20px;color:#0f172a;direction:rtl}
  h2{text-align:center;color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px}
  table{width:100%;border-collapse:collapse}th{background:#6366f1;color:#fff;padding:9px}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}
  .meta{text-align:center;color:#64748b;font-size:12px;margin:-10px 0 20px}</style></head>
  <body><h2>📊 التحليل المالي الشامل — IDHAM ERP</h2>
  <p class="meta">الفترة: ${a.from} — ${a.to}</p>
  <table><thead><tr><th>النسبة المالية</th><th>القيمة</th></tr></thead>
  <tbody>${i}</tbody></table></body></html>`),e.document.close(),e.print()};export{Ke as render};
