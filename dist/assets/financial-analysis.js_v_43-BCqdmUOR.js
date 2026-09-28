const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DZSjEJ7g.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{_ as De,g as A,a as T,f as ze}from"./index-DZSjEJ7g.js";import{where as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function Oe(){if(window._echartsReady)return;const o=a=>new Promise((e,l)=>{const s=document.createElement("script");s.src=a,s.onload=e,s.onerror=l,document.head.appendChild(s)});window.echarts||await o("https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js");try{await o("https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js")}catch{}window._echartsReady=!0}let P=null,R="month",E=[];async function Xe(o,a){o.innerHTML=Le(),Pe(),await Oe(),await N()}function Le(){return`
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
</div>`}function Pe(){document.querySelectorAll("#fa2 .pbtn").forEach(o=>o.addEventListener("click",async()=>{document.querySelectorAll("#fa2 .pbtn").forEach(a=>a.classList.remove("on")),o.classList.add("on"),R=o.dataset.p,await N()}))}window.setFaCustomDate=()=>{R="custom",document.querySelectorAll("#fa2 .pbtn").forEach(o=>o.classList.remove("on")),N()};window.fa2Tab=o=>{document.querySelectorAll("#fa2 .tab").forEach(e=>e.classList.toggle("on",e.id===`t-${o}`));const a=document.getElementById("fa2-cnt");!a||!P||(E.forEach(e=>{try{e.dispose()}catch{}}),E=[],ve(o,a))};window.fa2Refresh=()=>N(!0);async function N(o=!1){const a=document.getElementById("fa2-cnt");if(a){a.innerHTML='<div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>',E.forEach(e=>{try{e.dispose()}catch{}}),E=[];try{P=await Ee(o);const e=document.querySelector("#fa2 .tab.on")?.id?.replace("t-","")||"ov";ve(e,a)}catch(e){a.innerHTML=`<div style="color:#ef4444;padding:20px">خطأ: ${e.message}</div>`}}}async function Ee(o=!1){const a=r=>{const d=r.getFullYear(),b=String(r.getMonth()+1).padStart(2,"0"),S=String(r.getDate()).padStart(2,"0");return`${d}-${b}-${S}`},e=new Date,l=e.getFullYear(),s=e.getMonth();let i=document.getElementById("fa-from")?.value||"",p=document.getElementById("fa-to")?.value||"";if(R!=="custom"||!i||!p){if(R==="all")i="2020-01-01",p=a(e);else if(R==="today")i=a(e),p=a(e);else if(R==="this_week"){const b=new Date(e);b.setDate(b.getDate()-7),i=a(b),p=a(e)}else if(R==="last_month"){const b=new Date(l,s-1,1),S=new Date(l,s,0);i=a(b),p=a(S)}else R==="quarter"?(i=a(new Date(l,Math.floor(s/3)*3,1)),p=a(e)):R==="year"?(i=a(new Date(l,0,1)),p=a(e)):(i=a(new Date(l,s,1)),p=a(e));const r=document.getElementById("fa-from"),d=document.getElementById("fa-to");r&&(r.value=i),d&&(d.value=p)}const h=new Date(e.getFullYear(),e.getMonth()-5,1),n=a(h),{clearERPCache:c,COMPANY_ID:w}=await De(async()=>{const{clearERPCache:r,COMPANY_ID:d}=await import("./index-DZSjEJ7g.js").then(b=>b.T);return{clearERPCache:r,COMPANY_ID:d}},__vite__mapDeps([0,1]));o&&(c(`companies/${w}/salesInvoices`),c(`companies/${w}/purchaseInvoices`),c(`companies/${w}/stockByWarehouse`),c(`companies/${w}/customers`),c(`companies/${w}/suppliers`),c(`companies/${w}/products`),c(`companies/${w}/chartOfAccounts`),c(`companies/${w}/journalEntries`));const[re,ie,ne,le,se,he,Q,ce]=await Promise.all([A(T.salesInvoices(),[Y("date",">=",n),Y("date","<=",p)]),A(T.purchaseInvoices(),[Y("date",">=",n),Y("date","<=",p)]),A(T.stockByWarehouse()),A(T.customers()),A(T.suppliers()),A(T.products()),A(T.chartOfAccounts()),A(T.journalEntries())]),K=re.filter(r=>(r.date||"")>=i&&(r.date||"")<=p),U=ie.filter(r=>(r.date||"")>=i&&(r.date||"")<=p),de={},pe={};Q.forEach(r=>{de[r.id]=r,pe[r.code]=r});const fe=r=>de[r.accountId]||pe[r.accountCode];let z=0,L=0,J=0,X=0;for(const r of Q){let d=0;for(const b of ce){if(b.status&&b.status!=="posted")continue;const S=b.date||"";if(S>=i&&S<=p)for(const C of b.lines||[]){const F=fe(C);!F||F.id!==r.id||(d+=(C.credit||0)-(C.debit||0))}}if(r.type==="revenue")z+=d;else if(r.type==="expense"){const b=-d;r.code?.startsWith("5-1")||r.name?.includes("تكلفة البضاعة")||r.name?.includes("تكلفة مبيعات")||r.name?.includes("نقل بضاعة")?L+=b:J+=b}else r.code?.startsWith("2-1-3")?X+=Math.abs(d):r.code?.startsWith("1-1-5")}L<.01&&(L=K.reduce((r,d)=>r+(d.totalCost||0),0));const q=z-L,G=q-J,ue=Math.max(0,G*.15),ge=G-ue,Z=z+X;let j=0,ee=0,H=0,V=0,te=0,I=0,W=0,B=0;for(const r of Q){let d=0;for(const b of ce){if(b.status&&b.status!=="posted")continue;if((b.date||"")<=p)for(const C of b.lines||[]){const F=fe(C);!F||F.id!==r.id||(d+=(C.debit||0)-(C.credit||0))}}if(r.type==="asset")r.code?.startsWith("1-2")||r.code?.startsWith("1-3")||r.name?.includes("سيارات")||r.name?.includes("أثاث")||r.name?.includes("معدات")?ee+=d:(j+=d,(r.code?.startsWith("1-1-1")||r.code?.startsWith("1-1-2")||r.code?.startsWith("111")||r.code?.startsWith("112")||r.name?.includes("صندوق")||r.name?.includes("بنك"))&&(te+=d),(r.code?.startsWith("1-1-3")||r.code?.startsWith("113")||r.name?.includes("عملاء")||r.name?.includes("مدينة"))&&(I+=d),(r.code?.startsWith("1-1-4")||r.code?.startsWith("114")||r.name?.includes("مخزون"))&&(W+=d));else if(r.type==="liability"){const b=-d;r.code?.startsWith("2-2")||r.name?.includes("طويل")?V+=b:(H+=b,(r.code?.startsWith("2-1-1")||r.code?.startsWith("211")||r.name?.includes("موردين")||r.name?.includes("دائنة"))&&(B+=b))}}if(W<.01){const r={};he.forEach(d=>{r[d.id]=d.averageCost||d.costPrice||0}),W=ne.reduce((d,b)=>d+(b.qty||0)*(r[b.productId]||0),0)}I<.01&&(I=le.reduce((r,d)=>r+Math.max(0,d.balance||0),0)),B<.01&&(B=se.reduce((r,d)=>r+Math.max(0,d.balance||0),0));const oe=j+ee,ae=H+V,be=Math.max(1,oe-ae),xe=U.reduce((r,d)=>r+(d.subtotal||d.totalBeforeTax||0),0),we=U.reduce((r,d)=>r+(d.totalVat||d.taxAmount||0),0),Se=U.reduce((r,d)=>r+(d.totalWithVat||d.total||d.grandTotal||0),0),$e=Array.from({length:6},(r,d)=>{const b=new Date(e.getFullYear(),e.getMonth()-5+d,1),S=b.toLocaleString("ar-SA",{month:"short"}),C=b.getFullYear(),F=b.getMonth(),me=re.filter(O=>{const $=new Date(O.date||"");return $.getFullYear()===C&&$.getMonth()===F}).reduce((O,$)=>O+($.totalWithVat||$.grandTotal||0),0),Ae=ie.filter(O=>{const $=new Date(O.date||"");return $.getFullYear()===C&&$.getMonth()===F}).reduce((O,$)=>O+($.total||$.grandTotal||0),0),Te=q>0&&z>0?me*(q/z):0;return{lbl:S,rev:Math.round(me),cost:Math.round(Ae),gp:Math.round(Te)}}),_=K.length,ke=_>0?Z/_:0,Ce=K.filter(r=>r.status==="paid").length,Me=_>0?Ce/_*100:0,Re=ne.reduce((r,d)=>r+(d.qty||0),0),Fe=qe({revenue:z,revTotal:Z,cogs:L,grossProfit:q,opProfit:G,netProfit:ge,purchCost:xe,invVal:W,receivables:I,payables:B,cash:te,curAssets:j,totAssets:oe,curLiab:H,longLiab:V,totLiab:ae,equity:be});return{period:{from:i,to:p},revenue:z,vatOut:X,revTotal:Z,cogs:L,grossProfit:q,opExpenses:J,opProfit:G,tax:ue,netProfit:ge,purchCost:xe,purchVat:we,purchTotal:Se,invVal:W,invQty:Re,receivables:I,payables:B,cash:te,curAssets:j,fixedAssets:ee,totAssets:oe,curLiab:H,longLiab:V,totLiab:ae,equity:be,invCount:_,avgInv:ke,collRate:Me,months6:$e,R:Fe,custCount:le.length,suppCount:se.length}}function qe(o){const a=(s,i)=>i>0?s/i*100:0,e=(s,i)=>i>0?s/i:0,l=(s,i)=>i>0?s/i*365:0;return{curRatio:e(o.curAssets,o.curLiab),quickRatio:e(o.curAssets-o.invVal,o.curLiab),cashRatio:e(o.cash,o.curLiab),workCap:o.curAssets-o.curLiab,wcRatio:a(o.curAssets-o.curLiab,o.revenue),grossMgn:a(o.grossProfit,o.revenue),opMgn:a(o.opProfit,o.revenue),netMgn:a(o.netProfit,o.revenue),roa:a(o.netProfit,o.totAssets),roe:a(o.netProfit,o.equity),roi:a(o.grossProfit-o.purchCost,o.purchCost),markup:a(o.grossProfit,o.cogs||1),ebitda:a(o.opProfit*1.1,o.revenue),grossOnSales:a(o.grossProfit,o.revTotal),invTurn:e(o.cogs,o.invVal||1),dio:l(o.invVal,o.cogs||1),recTurn:e(o.revenue,o.receivables||1),dso:l(o.receivables,o.revenue||1),payTurn:e(o.purchCost,o.payables||1),dpo:l(o.payables,o.purchCost||1),ccc:l(o.invVal,o.cogs||1)+l(o.receivables,o.revenue||1)-l(o.payables,o.purchCost||1),astTurn:e(o.revenue,o.totAssets||1),opCycle:l(o.invVal,o.cogs||1)+l(o.receivables,o.revenue||1),de:e(o.totLiab,o.equity),da:a(o.totLiab,o.totAssets),eq:a(o.equity,o.totAssets),eqMult:e(o.totAssets,o.equity),intCov:e(o.opProfit,o.opProfit*.07||1),debtRatio:e(o.totLiab,o.totAssets),capGearing:a(o.longLiab,o.equity+o.longLiab)}}const t={purple:"#818cf8",teal:"#2dd4bf",green:"#10b981",yellow:"#f59e0b",red:"#f87171",blue:"#60a5fa",orange:"#fb923c",pink:"#f472b6",indigo:"#6366f1",violet:"#8b5cf6"},y=o=>ze(o||0),f=(o,a=2)=>(typeof o=="number"?o:0).toFixed(a),x=(o,a=1)=>f(o,a)+"%";function Ie(o,a){const[e,l,s]=a;return o<=e?'<span class="badge b-dn">تحت المعيار</span>':o<=l?'<span class="badge b-wn">مقبول</span>':o<=s?'<span class="badge b-gd">جيد</span>':'<span class="badge b-ex">ممتاز ✦</span>'}function u(o,a,e,l,s,i,p,h=60){return`<div class="kcard" style="border-color:${i}22">
    <div style="position:absolute;top:0;right:0;width:50px;height:50px;background:${i};border-radius:50%;filter:blur(18px);opacity:.2"></div>
    <div class="kc-icon" style="color:${i}">${p}</div>
    <div class="kc-lbl">${o}</div>
    <div class="kc-lbl" style="color:${i}55;font-size:8px">${a}</div>
    <div class="kc-val" style="color:${i}">${e}<span style="font-size:11px;opacity:.6;margin-right:2px">${l}</span></div>
    <div class="kc-sub">${s}</div>
    <div class="kc-bar" style="background:linear-gradient(90deg,${i},${i}55);width:${Math.min(100,h)}%"></div>
  </div>`}function g(o,a,e,l,s,i,p,h){const n=h?Ie(parseFloat(e),h):"",c=Math.min(100,Math.max(0,s));return`<div class="rcard" style="border-color:${i}22">
    <div class="rc-head">
      <div><div class="rc-name">${o}</div><div class="rc-eng">${a}</div></div>
      ${n}
    </div>
    <div class="rc-val" style="color:${i}">${e}<span class="rc-unit">${l}</span></div>
    <div class="rc-bar"><div class="rc-fill" style="width:${c}%;background:linear-gradient(90deg,${i},${i}88)"></div></div>
    <div class="rc-bench"><span>المعيار: ${p}</span><span style="color:${i}">${c.toFixed(0)}%</span></div>
  </div>`}function m(o,a,e,l=300,s=""){return`<div class="ccard">
    <div class="cc-title">${a}${s?`<span class="cc-badge">${s}</span>`:""}</div>
    <div class="cc-sub">${e}</div>
    <div id="${o}" style="width:100%;height:${l}px"></div>
  </div>`}function We(o,a){const e=document.getElementById(o);if(!e||!window.echarts)return null;const l=document.documentElement.getAttribute("data-theme")==="dark",s=echarts.init(e,l?"dark":null,{renderer:"canvas"});return s.setOption(a),E.push(s),s}const D=o=>({type:"category",data:o,axisLine:{lineStyle:{color:"var(--border-soft)"}},axisTick:{show:!1},axisLabel:{color:"var(--text-1)",fontSize:10}}),k=o=>({type:"value",splitLine:{lineStyle:{color:"var(--border-soft)",type:"dashed"}},axisLabel:{color:"var(--text-1)",fontSize:10,formatter:o||null}}),v={backgroundColor:"var(--bg-card)",borderColor:"var(--border-soft)",borderWidth:1,textStyle:{color:"var(--text-0)",fontSize:11},extraCssText:"box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;"};function ve(o,a){({ov:ye,liq:Be,pft:_e,eff:Ge,lev:je,inc:He}[o]||ye)(a,P),setTimeout(()=>Ve(o,P),80),window.addEventListener("resize",()=>E.forEach(l=>{try{l.resize()}catch{}}))}function ye(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> المؤشرات المالية الكبرى — KPIs</div>
  <div class="kgrid">
    ${u("إجمالي المبيعات (بدون ضريبة)","Total Revenue",y(a.revenue),"",""+a.invCount+" فاتورة",t.indigo,"💰",75)}
    ${u("الربح الإجمالي","Gross Profit",y(a.grossProfit),"",x(e.grossMgn),t.green,"📈",e.grossMgn*2)}
    ${u("الربح التشغيلي","Operating Profit",y(a.opProfit),"",x(e.opMgn),t.teal,"⚡",e.opMgn*2)}
    ${u("صافي الربح","Net Profit",y(a.netProfit),"",x(e.netMgn),t.violet,"✨",e.netMgn*3)}
    ${u("قيمة المخزون","Inventory Value",y(a.invVal),"",a.invQty+" وحدة",t.yellow,"📦",60)}
    ${u("الذمم المدينة","Receivables",y(a.receivables),"",a.custCount+" عميل",t.red,"👥",50)}
    ${u("الذمم الدائنة","Payables",y(a.payables),"",a.suppCount+" مورد",t.orange,"🚛",45)}
    ${u("متوسط الفاتورة","Avg Invoice",y(a.avgInv),"",x(a.collRate)+" محصّل",t.blue,"🧾",a.collRate)}
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
    ${g("نسبة التداول","Current Ratio",f(e.curRatio),"×",e.curRatio*33,t.purple,"≥ 2.0×",[.5,1,2])}
    ${g("هامش الربح الإجمالي","Gross Margin",x(e.grossMgn),"",e.grossMgn,t.green,"20-30%",[5,15,25])}
    ${g("معدل دوران المخزون","Inventory Turnover",f(e.invTurn),"×",e.invTurn*8,t.yellow,"6-12×",[1,4,8])}
    ${g("أيام التحصيل","Days Sales Outstanding",f(e.dso,0),"يوم",100-Math.min(100,e.dso),t.red,"30-45 يوم",[60,45,30])}
    ${g("نسبة الدين إلى الملكية","Debt/Equity",f(e.de),"×",Math.max(0,100-e.de*20),t.orange,"< 2×",[3,2,1])}
    ${g("العائد على الأصول","ROA",x(e.roa),"",e.roa*4,t.teal,"5-10%",[2,5,10])}
  </div>`}function Be(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب السيولة — Liquidity Ratios</div>
  <div class="cgrid c2">
    ${m("ch-liq-gauges","📡 مقاييس السيولة الثلاثة","نسبة التداول / السريعة / النقدية",320)}
    ${m("ch-liq-bars","📊 هيكل الأصول المتداولة","نقدية + ذمم + مخزون vs خصوم",320,"ECharts 3D")}
  </div>
  <div class="kgrid">
    ${u("نسبة التداول","Current Ratio",f(e.curRatio),"×","المثالي ≥ 2.0×",t.purple,"🔵",e.curRatio*33)}
    ${u("نسبة السريعة","Quick Ratio",f(e.quickRatio),"×","المثالي ≥ 1.0×",t.teal,"⚡",e.quickRatio*50)}
    ${u("نسبة النقدية","Cash Ratio",f(e.cashRatio),"×","المثالي ≥ 0.5×",t.yellow,"💵",e.cashRatio*100)}
    ${u("رأس المال العامل","Working Capital",y(e.workCap),"","يجب أن يكون +",t.green,"⚖️",70)}
    ${u("نسبة WC/مبيعات","WC/Revenue",x(e.wcRatio),"","المثالي 10-20%",t.blue,"📈",e.wcRatio*5)}
  </div>
  <div class="cgrid c2">
    ${m("ch-liq-waterfall","💧 تحليل رأس المال العامل","Waterfall — الأصول vs الخصوم",280)}
    ${m("ch-liq-trend","📈 اتجاه السيولة","مقارنة نسبة التداول والسريعة",280)}
  </div>
  <div class="slbl" style="margin-top:8px"><span>◆</span> تحليل تفصيلي</div>
  <div class="rgrid">
    ${g("نسبة التداول","Current Ratio",f(e.curRatio),"×",e.curRatio*33,t.purple,"≥ 2.0×",[.5,1,2])}
    ${g("نسبة السريعة","Quick Ratio",f(e.quickRatio),"×",e.quickRatio*50,t.teal,"≥ 1.0×",[.3,.7,1])}
    ${g("نسبة النقدية","Cash Ratio",f(e.cashRatio),"×",e.cashRatio*100,t.yellow,"≥ 0.5×",[.1,.3,.5])}
    ${g("رأس المال العامل","Working Capital",y(e.workCap),"",70,t.green,"يجب موجب",[0,1,1e5])}
    ${g("نسبة رأس المال","WC Ratio",x(e.wcRatio),"",e.wcRatio*5,t.blue,"10-20%",[5,10,20])}
  </div>`}function _e(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> نسب الربحية — Profitability Ratios</div>
  <div class="cgrid c2">
    ${m("ch-pft-funnel","🔻 مسار الربحية","من الإيراد إلى صافي الربح — Funnel",340)}
    ${m("ch-pft-margins","📊 هوامش الربح","مقارنة شهرية — Grouped Bar 3D",340)}
  </div>
  <div class="kgrid">
    ${u("هامش الربح الإجمالي","Gross Margin",x(e.grossMgn),"","",t.green,"📊",e.grossMgn*2)}
    ${u("هامش تشغيلي","Operating Margin",x(e.opMgn),"","",t.teal,"⚙️",e.opMgn*3)}
    ${u("هامش صافي","Net Margin",x(e.netMgn),"","",t.violet,"✨",e.netMgn*4)}
    ${u("ROA","Return on Assets",x(e.roa),"","",t.yellow,"🏦",e.roa*5)}
    ${u("ROE","Return on Equity",x(e.roe),"","",t.blue,"💼",e.roe*3)}
    ${u("ROI","Return on Investment",x(e.roi),"","",t.orange,"🎯",Math.min(100,e.roi*2))}
    ${u("EBITDA","EBITDA Margin",x(e.ebitda),"","",t.pink,"📈",e.ebitda*2)}
    ${u("الترميح","Markup %",x(e.markup),"","",t.red,"🏷️",Math.min(100,e.markup))}
  </div>
  <div class="cgrid c3">
    ${m("ch-pft-donut","🍩 توزيع الإيراد","الربح / التكلفة / الضريبة",260)}
    ${m("ch-pft-roe-gauge","📡 مقياس ROE","العائد على حقوق الملكية",260)}
    ${m("ch-pft-bar","📊 مقارنة الهوامش","Margin Comparison Bar",260)}
  </div>
  <div class="rgrid">
    ${g("هامش الربح الإجمالي","Gross Margin",x(e.grossMgn),"",e.grossMgn*2,t.green,"20-30%",[5,15,25])}
    ${g("هامش الربح التشغيلي","Operating Margin",x(e.opMgn),"",e.opMgn*3,t.teal,"10-20%",[2,8,15])}
    ${g("هامش صافي الربح","Net Margin",x(e.netMgn),"",e.netMgn*4,t.violet,"5-15%",[1,5,10])}
    ${g("العائد على الأصول","ROA",x(e.roa),"",e.roa*5,t.yellow,"5-10%",[2,5,10])}
    ${g("العائد على الملكية","ROE",x(e.roe),"",e.roe*3,t.blue,"10-20%",[5,10,20])}
    ${g("العائد على الاستثمار","ROI",x(e.roi),"",Math.min(100,e.roi*2),t.orange,"10-25%",[5,10,20])}
    ${g("هامش EBITDA","EBITDA Margin",x(e.ebitda),"",e.ebitda*2,t.pink,"15-25%",[5,12,20])}
    ${g("نسبة الترميح","Markup",x(e.markup),"",Math.min(100,e.markup),t.red,"20-50%",[5,15,30])}
    ${g("الربح على إجمالي المبيعات","Gross/Total Sales",x(e.grossOnSales),"",e.grossOnSales*2,t.indigo,"15-25%",[5,12,20])}
  </div>`}function Ge(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> كفاءة العمليات — Operational Efficiency</div>
  <div class="cgrid c2">
    ${m("ch-eff-cycle","⏱️ دورة تحويل النقد","DIO + DSO - DPO = CCC",300)}
    ${m("ch-eff-turnover","🔄 معدلات الدوران","المخزون / الذمم / الأصول",300)}
  </div>
  <div class="kgrid">
    ${u("دوران المخزون","Inventory Turnover",f(e.invTurn)+"×","","",t.yellow,"📦",e.invTurn*8)}
    ${u("أيام المخزون (DIO)","Days Inv. Outstanding",f(e.dio,0),"يوم","المثالي 30-60",t.orange,"📅",100-Math.min(100,e.dio))}
    ${u("دوران الذمم المدينة","Receivables Turnover",f(e.recTurn)+"×","","",t.blue,"👥",e.recTurn*7)}
    ${u("أيام التحصيل (DSO)","Days Sales Outstanding",f(e.dso,0),"يوم","المثالي 30-45",t.red,"📅",100-Math.min(100,e.dso))}
    ${u("دوران الذمم الدائنة","Payables Turnover",f(e.payTurn)+"×","","",t.green,"🚛",e.payTurn*7)}
    ${u("أيام السداد (DPO)","Days Payable Outstanding",f(e.dpo,0),"يوم","المثالي 30-45",t.teal,"📅",Math.min(100,e.dpo))}
    ${u("دورة تحويل النقد","Cash Conversion Cycle",f(e.ccc,0),"يوم","أقل = أفضل",t.violet,"🔄",100-Math.min(100,e.ccc))}
    ${u("دوران الأصول","Asset Turnover",f(e.astTurn)+"×","","",t.pink,"🏭",Math.min(100,e.astTurn*40))}
    ${u("الدورة التشغيلية","Operating Cycle",f(e.opCycle,0),"يوم","DIO+DSO",t.indigo,"⚡",100-Math.min(100,e.opCycle/2))}
  </div>
  <div class="cgrid c1">
    ${m("ch-eff-days","📊 مقارنة أيام الدورة التشغيلية","DIO vs DSO vs DPO vs CCC",280)}
  </div>
  <div class="rgrid">
    ${g("معدل دوران المخزون","Inventory Turnover",f(e.invTurn)+"×","",e.invTurn*8,t.yellow,"6-12×",[1,4,8])}
    ${g("أيام المخزون","DIO",f(e.dio,0),"يوم",100-Math.min(100,e.dio),t.orange,"30-60 يوم",[90,60,30])}
    ${g("معدل دوران الذمم","Receivables Turnover",f(e.recTurn)+"×","",e.recTurn*7,t.blue,"8-12×",[2,5,8])}
    ${g("أيام التحصيل","DSO",f(e.dso,0),"يوم",100-Math.min(100,e.dso),t.red,"30-45 يوم",[60,45,30])}
    ${g("معدل دوران الدائنة","Payables Turnover",f(e.payTurn)+"×","",e.payTurn*7,t.green,"6-12×",[2,4,8])}
    ${g("أيام السداد","DPO",f(e.dpo,0),"يوم",Math.min(100,e.dpo),t.teal,"30-45 يوم",[0,15,45])}
    ${g("دورة تحويل النقد","CCC",f(e.ccc,0),"يوم",100-Math.min(100,e.ccc),t.violet,"<30 يوم",[60,45,20])}
    ${g("دوران الأصول","Asset Turnover",f(e.astTurn)+"×","",Math.min(100,e.astTurn*40),t.pink,"1.5-2.0×",[.5,1,1.5])}
    ${g("الدورة التشغيلية","Operating Cycle",f(e.opCycle,0),"يوم",100-Math.min(100,e.opCycle/2),t.indigo,"<90 يوم",[120,90,60])}
  </div>`}function je(o,a){const{R:e}=a;o.innerHTML=`
  <div class="slbl"><span>◆</span> الرفع المالي — Financial Leverage</div>
  <div class="cgrid c2">
    ${m("ch-lev-struct","🏗️ هيكل التمويل","الأصول = الديون + حقوق الملكية",300)}
    ${m("ch-lev-gauges","📡 مقاييس الرفع المالي","D/E × D/A × حقوق الملكية",300)}
  </div>
  <div class="kgrid">
    ${u("نسبة D/E","Debt to Equity",f(e.de),"×","أقل من 2.0×",t.red,"⚖️",Math.max(0,100-e.de*20))}
    ${u("نسبة الدين/الأصول","Debt to Assets",x(e.da),"","أقل من 50%",t.orange,"🏦",Math.max(0,100-e.da))}
    ${u("نسبة حقوق الملكية","Equity Ratio",x(e.eq),"","40-60%",t.green,"💼",e.eq)}
    ${u("مضاعف الملكية","Equity Multiplier",f(e.eqMult),"×","1.5-3.0×",t.blue,"✖️",Math.min(100,100/e.eqMult))}
    ${u("تغطية الفائدة","Interest Coverage",f(e.intCov)+"×","","أكبر من 3.0×",t.teal,"🛡️",Math.min(100,e.intCov*10))}
    ${u("التروس الرأسمالية","Capital Gearing",x(e.capGearing),"","أقل من 50%",t.violet,"⚙️",Math.max(0,100-e.capGearing))}
  </div>
  <div class="rgrid">
    ${g("الدين إلى الملكية","Debt/Equity",f(e.de),"×",Math.max(0,100-e.de*20),t.red,"< 2.0×",[3,2,1])}
    ${g("الدين إلى الأصول","Debt/Assets",x(e.da),"",Math.max(0,100-e.da),t.orange,"< 50%",[70,60,50])}
    ${g("نسبة الملكية","Equity Ratio",x(e.eq),"",e.eq,t.green,"40-60%",[20,30,50])}
    ${g("مضاعف الملكية","Equity Multiplier",f(e.eqMult),"×",Math.min(100,100/e.eqMult),t.blue,"1.5-3.0×",[4,3,2])}
    ${g("تغطية الفائدة","Interest Coverage",f(e.intCov),"×",Math.min(100,e.intCov*10),t.teal,"≥ 3.0×",[1,2,3])}
    ${g("نسبة الدين","Debt Ratio",f(e.debtRatio,2),"",Math.max(0,100-e.debtRatio*100),t.violet,"< 0.5",[.7,.6,.5])}
    ${g("التروس الرأسمالية","Capital Gearing",x(e.capGearing),"",Math.max(0,100-e.capGearing),t.pink,"< 50%",[70,60,50])}
  </div>`}function He(o,a){const e=(s,i,p,h,n)=>`<div class="wf-row">
      <div class="wf-lbl">${s}</div>
      <div class="wf-bar-wrap">
        <div class="wf-bar-fill" style="width:${n}%;background:linear-gradient(90deg,${h},${h}88)">
          ${y(i)} <small>(${p}%)</small>
        </div>
      </div>
    </div>`,l=a.revTotal||1;o.innerHTML=`
  <div class="slbl"><span>◆</span> قائمة الدخل التحليلية — Income Statement</div>
  <div class="cgrid c2">
    <div class="ccard">
      <div class="cc-title">📋 قائمة الدخل التفصيلية</div>
      <div class="cc-sub">الفترة: ${a.period.from} — ${a.period.to}</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${e("إجمالي المبيعات (شامل ضريبة)",a.revTotal,100,t.indigo,100)}
        ${e("ضريبة القيمة المضافة",a.vatOut,(a.vatOut/l*100).toFixed(1),t.orange,a.vatOut/l*100)}
        ${e("صافي الإيراد",a.revenue,(a.revenue/l*100).toFixed(1),t.blue,a.revenue/l*100)}
        ${e("تكلفة البضاعة المباعة",a.cogs,(a.cogs/l*100).toFixed(1),t.red,a.cogs/l*100)}
        ${e("إجمالي الربح",a.grossProfit,(a.grossProfit/l*100).toFixed(1),t.green,a.grossProfit/l*100)}
        ${e("المصاريف التشغيلية",a.opExpenses,(a.opExpenses/l*100).toFixed(1),t.yellow,a.opExpenses/l*100)}
        ${e("الربح التشغيلي",a.opProfit,(a.opProfit/l*100).toFixed(1),t.teal,a.opProfit/l*100)}
        ${e("ضريبة الدخل (تقديري 15%)",a.tax,(a.tax/l*100).toFixed(1),t.orange,a.tax/l*100)}
        ${e("صافي الربح",a.netProfit,(a.netProfit/l*100).toFixed(1),t.violet,a.netProfit/l*100)}
      </div>
    </div>
    ${m("ch-inc-waterfall","📊 Waterfall قائمة الدخل","من الإيراد إلى صافي الربح",380)}
  </div>
  <div class="cgrid c2">
    ${m("ch-inc-trend","📈 اتجاه الإيراد والربح","آخر 6 أشهر مع التوقعات",280)}
    ${m("ch-inc-pie","🍩 توزيع الإيراد","الربح / التكاليف / الضريبة",280)}
  </div>`}function Ve(o,a){if(!window.echarts)return;const{R:e,months6:l}=a,s=We,i="transparent",p=l.map(n=>n.lbl),h=(n,c,w)=>({type:"bar",barWidth:"55%",data:n,itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:c},{offset:1,color:w||c+"55"}]},borderRadius:[6,6,0,0],shadowColor:c+"44",shadowBlur:12,shadowOffsetY:-2}});if(o==="ov"&&(s("ch-rev6",{backgroundColor:i,tooltip:{...v,trigger:"axis"},legend:{data:["مبيعات","تكاليف","إجمالي ربح"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},grid:{left:20,right:20,top:25,bottom:40,containLabel:!0},xAxis:D(p),yAxis:k(n=>y(n)),series:[{name:"مبيعات",type:"line",smooth:!0,data:l.map(n=>n.rev),symbol:"circle",symbolSize:7,lineStyle:{color:t.indigo,width:3},itemStyle:{color:t.indigo},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(99,102,241,.4)"},{offset:1,color:"rgba(99,102,241,.02)"}]}}},{name:"تكاليف",type:"line",smooth:!0,data:l.map(n=>n.cost),symbol:"circle",symbolSize:5,lineStyle:{color:t.red,width:2,type:"dashed"},itemStyle:{color:t.red}},{name:"إجمالي ربح",type:"bar",barWidth:"30%",data:l.map(n=>n.gp),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green+"cc"},{offset:1,color:t.green+"22"}]},borderRadius:[4,4,0,0]}}]}),s("ch-gauge-gm",{backgroundColor:i,series:[M("إجمالي",e.grossMgn,50,"100px","17%",t.green),M("تشغيلي",e.opMgn,30,"100px","50%",t.teal,!0),M("صافي",e.netMgn,20,"100px","83%",t.violet,!1,!0)]}),s("ch-cost-donut",{backgroundColor:i,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["48%","75%"],padAngle:3,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:10,formatter:n=>`${n.name}
${n.percent}%`},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:t.yellow}},{value:+a.opExpenses.toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:t.orange}}]}]}),window.echarts&&document.getElementById("ch-bar3d")&&s("ch-bar3d",{backgroundColor:i,tooltip:{...v,trigger:"axis"},xAxis:D(p),yAxis:k(n=>y(n)),series:[{...h(l.map(n=>n.rev),t.indigo,"#312e81"),barWidth:"60%",label:{show:!1}}]}),s("ch-radar6",{backgroundColor:i,radar:{indicator:[{name:"الربحية",max:100},{name:"السيولة",max:100},{name:"الكفاءة",max:100},{name:"الملاءة",max:100},{name:"التحصيل",max:100},{name:"المخزون",max:100},{name:"النمو",max:100},{name:"الاستقرار",max:100}],splitNumber:4,axisName:{color:"#64748b",fontSize:9},splitLine:{lineStyle:{color:"#1e293b"}},splitArea:{areaStyle:{color:["rgba(30,41,59,.5)","rgba(15,23,42,.5)"]}},axisLine:{lineStyle:{color:"#1e293b"}}},series:[{type:"radar",name:"الأداء الفعلي",symbol:"circle",symbolSize:5,lineStyle:{color:t.indigo,width:2},itemStyle:{color:t.indigo},areaStyle:{color:"rgba(99,102,241,.25)"},data:[{value:[Math.min(100,e.grossMgn*2),Math.min(100,e.curRatio*33),Math.min(100,e.invTurn*8),Math.min(100,e.eq),Math.min(100,100-e.dso),Math.min(100,e.invTurn*8),60,Math.min(100,100-e.da)]}]},{type:"radar",name:"المعيار",symbol:"none",lineStyle:{color:t.teal,width:1,type:"dashed"},areaStyle:{color:"rgba(45,212,191,.06)"},data:[{value:[50,66,64,50,70,64,50,50]}]}],legend:{data:["الأداء الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:9}}})),o==="liq"&&(s("ch-liq-gauges",{backgroundColor:i,series:[M("التداول",e.curRatio,3,"110px","17%",t.purple),M("السريعة",e.quickRatio,2,"110px","50%",t.teal,!0),M("النقدية",e.cashRatio,1,"110px","83%",t.yellow,!1,!0)]}),s("ch-liq-bars",{backgroundColor:i,tooltip:{...v,trigger:"axis"},legend:{data:["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},grid:{left:20,right:20,top:25,bottom:40,containLabel:!0},xAxis:D(["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"]),yAxis:k(n=>y(n)),series:[{type:"bar",barWidth:"45%",data:[{value:+a.cash.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.green+"44",shadowBlur:12}},{value:+a.receivables.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.blue+"44",shadowBlur:12}},{value:+a.invVal.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.yellow+"44",shadowBlur:12}},{value:+a.curLiab.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.red},{offset:1,color:t.red+"44"}]},borderRadius:[8,8,0,0],shadowColor:t.red+"44",shadowBlur:12}}]}]}),s("ch-liq-waterfall",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:20,top:25,bottom:30,containLabel:!0},xAxis:D(["الأصول المتداولة","الخصوم","رأس المال العامل"]),yAxis:k(n=>y(n)),series:[h([+a.curAssets.toFixed(0),+a.curLiab.toFixed(0),+Math.max(0,e.workCap).toFixed(0)],t.teal)]}),s("ch-liq-trend",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:20,top:25,bottom:30,containLabel:!0},legend:{data:["التداول","السريعة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},xAxis:D(p),yAxis:k(),series:[{name:"التداول",type:"line",smooth:!0,symbol:"circle",symbolSize:6,data:p.map(()=>+(e.curRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:t.purple,width:3},itemStyle:{color:t.purple},areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.purple+"44"},{offset:1,color:t.purple+"05"}]}}},{name:"السريعة",type:"line",smooth:!0,symbol:"circle",symbolSize:5,data:p.map(()=>+(e.quickRatio*(.85+Math.random()*.3)).toFixed(2)),lineStyle:{color:t.teal,width:2},itemStyle:{color:t.teal}}]})),o==="pft"&&(s("ch-pft-funnel",{backgroundColor:i,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"funnel",width:"75%",left:"12.5%",gap:5,sort:"descending",label:{position:"inside",color:"#fff",fontSize:11,fontWeight:800,formatter:n=>`${n.name}
${y(n.value)}`},itemStyle:{borderWidth:0,borderRadius:6},emphasis:{label:{fontSize:13}},data:[{value:+a.revTotal.toFixed(0),name:"إجمالي المبيعات",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#312e81"},{offset:1,color:t.indigo}]}}},{value:+a.revenue.toFixed(0),name:"الإيراد قبل الضريبة",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#1e3a8a"},{offset:1,color:t.blue}]}}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#064e3b"},{offset:1,color:t.green}]}}},{value:+a.opProfit.toFixed(0),name:"الربح التشغيلي",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#134e4a"},{offset:1,color:t.teal}]}}},{value:+Math.max(0,a.netProfit).toFixed(0),name:"صافي الربح",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#4c1d95"},{offset:1,color:t.violet}]}}}]}]}),s("ch-pft-margins",{backgroundColor:i,tooltip:{...v,trigger:"axis",formatter:n=>n.map(c=>`${c.marker}${c.seriesName}: ${c.value}%`).join("<br>")},legend:{data:["إجمالي","تشغيلي","صافي"],bottom:0,textStyle:{color:"#475569",fontSize:10}},grid:{left:40,right:16,top:20,bottom:40},xAxis:D(p),yAxis:k(n=>n+"%"),series:[{name:"إجمالي",type:"bar",barGap:"5%",barWidth:"28%",data:p.map(()=>+e.grossMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"33"}]},borderRadius:[4,4,0,0]}},{name:"تشغيلي",type:"bar",barWidth:"28%",data:p.map(()=>+e.opMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.teal},{offset:1,color:t.teal+"33"}]},borderRadius:[4,4,0,0]}},{name:"صافي",type:"bar",barWidth:"28%",data:p.map(()=>+e.netMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.violet},{offset:1,color:t.violet+"33"}]},borderRadius:[4,4,0,0]}}]}),s("ch-pft-donut",{backgroundColor:i,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["50%","78%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9},data:[{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.vatOut.toFixed(0),name:"ضريبة القيمة",itemStyle:{color:t.orange}},{value:+a.tax.toFixed(0),name:"ضريبة الدخل",itemStyle:{color:t.yellow}}]}]}),s("ch-pft-roe-gauge",{backgroundColor:i,series:[{type:"gauge",radius:"90%",startAngle:210,endAngle:-30,min:0,max:30,axisLine:{lineStyle:{width:16,color:[[.33,t.red],[.66,t.yellow],[1,t.green]]}},progress:{show:!0,width:16,itemStyle:{color:"auto"}},pointer:{icon:"path://M12.8,0.7l12.3,0h36.2l12.3,0c0.4-12.5,0.8-25,4.9-37.3l-12.3,0l-36.2,0l-12.3,0C13.6-24.6,12.8-12.2,12.8,0.7z",length:"65%",width:6,offsetCenter:[0,"-2%"],itemStyle:{color:"auto"}},detail:{valueAnimation:!0,formatter:n=>n.toFixed(1)+"%",color:"#e2e8f0",fontSize:18,fontWeight:800,offsetCenter:[0,"72%"]},title:{offsetCenter:[0,"90%"],fontSize:10,color:"#64748b"},data:[{value:+e.roe.toFixed(1),name:"ROE"}],axisLabel:{color:"#475569",fontSize:9,formatter:n=>n+"%"},splitLine:{lineStyle:{color:"#1e293b",width:2}},axisTick:{lineStyle:{color:"#1e293b"}}}]}),s("ch-pft-bar",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:10,right:10,top:10,bottom:60,containLabel:!0},xAxis:{type:"category",data:["إجمالي","تشغيلي","صافي","ROA","ROE","ROI","EBITDA","ترميح"],axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:n=>n+"%"},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{type:"bar",barWidth:"60%",data:[e.grossMgn,e.opMgn,e.netMgn,e.roa,e.roe,e.roi,e.ebitda,e.markup].map((n,c)=>{const w=[t.green,t.teal,t.violet,t.yellow,t.blue,t.orange,t.pink,t.red];return{value:+n.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:w[c]},{offset:1,color:w[c]+"22"}]},borderRadius:[6,6,0,0],shadowColor:w[c]+"44",shadowBlur:10}}})}]})),o==="eff"&&(s("ch-eff-cycle",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`أيام المخزون
(DIO)`,`أيام التحصيل
(DSO)`,`أيام السداد
(DPO)`,`دورة النقد
(CCC)`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:k(n=>n+" يوم"),series:[{type:"bar",barWidth:"55%",data:[{value:+e.dio.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.yellow+"55",shadowBlur:14}},{value:+e.dso.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.blue+"55",shadowBlur:14}},{value:+e.dpo.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.green+"55",shadowBlur:14}},{value:+e.ccc.toFixed(0),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:e.ccc<30?t.green:e.ccc<60?t.yellow:t.red},{offset:1,color:t.red+"22"}]},borderRadius:[8,8,0,0],shadowColor:t.red+"55",shadowBlur:14}}],label:{show:!0,position:"top",color:"#94a3b8",fontSize:10,formatter:n=>n.value+" يوم"}}]}),s("ch-eff-turnover",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:50,containLabel:!0},xAxis:{type:"category",data:[`دوران
المخزون`,`دوران
الذمم`,`دوران
الأصول`,`دوران
الدائنة`],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},yAxis:k(n=>n+"×"),series:[{name:"الفعلي",type:"bar",barGap:"10%",barWidth:"35%",data:[{value:+e.invTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.yellow},{offset:1,color:t.yellow+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.recTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.blue},{offset:1,color:t.blue+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.astTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.violet},{offset:1,color:t.violet+"22"}]},borderRadius:[6,6,0,0]}},{value:+e.payTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.green},{offset:1,color:t.green+"22"}]},borderRadius:[6,6,0,0]}}]},{name:"المعيار",type:"bar",barWidth:"35%",data:[8,10,1.5,8].map(n=>({value:n,itemStyle:{color:"#1e293b",borderRadius:[6,6,0,0]}}))}],legend:{data:["الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:10}}}),s("ch-eff-days",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:40,right:16,top:20,bottom:30},legend:{data:["DIO","DSO","DPO"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:D(p),yAxis:k(n=>n+" يوم"),series:[{name:"DIO",type:"line",smooth:!0,data:p.map(()=>+(e.dio*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.yellow,width:2},itemStyle:{color:t.yellow},symbol:"circle",symbolSize:5},{name:"DSO",type:"line",smooth:!0,data:p.map(()=>+(e.dso*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.blue,width:2},itemStyle:{color:t.blue},symbol:"circle",symbolSize:5},{name:"DPO",type:"line",smooth:!0,data:p.map(()=>+(e.dpo*(.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:t.green,width:2},itemStyle:{color:t.green},symbol:"circle",symbolSize:5}]})),o==="lev"&&(s("ch-lev-struct",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:60,containLabel:!0},legend:{data:["الأصول الثابتة","الأصول المتداولة","الديون طويلة","الديون قصيرة","حقوق الملكية"],bottom:0,textStyle:{color:"#475569",fontSize:9}},xAxis:{type:"category",data:["هيكل الأصول","هيكل التمويل"],axisLabel:{color:"#475569",fontSize:11}},yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:n=>y(n)},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},series:[{name:"الأصول الثابتة",type:"bar",stack:"a",data:[+a.fixedAssets.toFixed(0),0],itemStyle:{color:t.blue}},{name:"الأصول المتداولة",type:"bar",stack:"a",data:[+a.curAssets.toFixed(0),0],itemStyle:{color:t.indigo}},{name:"الديون طويلة",type:"bar",stack:"b",data:[0,+a.longLiab.toFixed(0)],itemStyle:{color:t.red}},{name:"الديون قصيرة",type:"bar",stack:"b",data:[0,+a.curLiab.toFixed(0)],itemStyle:{color:t.orange}},{name:"حقوق الملكية",type:"bar",stack:"b",data:[0,+Math.max(0,a.equity).toFixed(0)],itemStyle:{color:t.green}}]}),s("ch-lev-gauges",{backgroundColor:i,series:[M("D/E ×",e.de,5,"100px","17%",e.de>2?t.red:e.de>1?t.yellow:t.green),M("D/A %",e.da,100,"100px","50%",e.da>60?t.red:e.da>50?t.yellow:t.green,!0),M("EQ %",e.eq,100,"100px","83%",e.eq<30?t.red:e.eq<50?t.yellow:t.green,!1,!0)]})),o==="inc"){const n=[{name:"إجمالي المبيعات",value:+a.revTotal.toFixed(0),color:t.indigo},{name:"خصم الضريبة",value:-a.vatOut.toFixed(0),color:t.red},{name:"صافي الإيراد",value:+a.revenue.toFixed(0),color:t.blue},{name:"خصم التكلفة",value:-a.cogs.toFixed(0),color:t.red},{name:"الربح الإجمالي",value:+a.grossProfit.toFixed(0),color:t.green},{name:"خصم المصاريف",value:-a.opExpenses.toFixed(0),color:t.orange},{name:"الربح التشغيلي",value:+a.opProfit.toFixed(0),color:t.teal},{name:"خصم الضريبة",value:-a.tax.toFixed(0),color:t.yellow},{name:"صافي الربح",value:+a.netProfit.toFixed(0),color:t.violet}];s("ch-inc-waterfall",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:20,right:16,top:20,bottom:80,containLabel:!0},xAxis:{type:"category",data:n.map(c=>c.name),axisLabel:{color:"#475569",fontSize:9,rotate:30}},yAxis:k(c=>y(c)),series:[{type:"bar",barWidth:"60%",data:n.map(c=>({value:Math.abs(c.value),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:c.color},{offset:1,color:c.color+"22"}]},borderRadius:[6,6,0,0],shadowColor:c.color+"44",shadowBlur:12},label:{show:!0,position:"top",color:"#94a3b8",fontSize:8,formatter:()=>y(Math.abs(c.value))}}))}]}),s("ch-inc-trend",{backgroundColor:i,tooltip:{...v,trigger:"axis"},grid:{left:60,right:16,top:20,bottom:30},legend:{data:["إيراد","ربح إجمالي","صافي ربح"],bottom:0,textStyle:{color:"#475569",fontSize:10}},xAxis:D(p),yAxis:k(c=>y(c)),series:[{name:"إيراد",type:"line",smooth:!0,data:l.map(c=>c.rev),lineStyle:{color:t.indigo,width:3},itemStyle:{color:t.indigo},symbol:"circle",symbolSize:6,areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:t.indigo+"44"},{offset:1,color:t.indigo+"05"}]}}},{name:"ربح إجمالي",type:"line",smooth:!0,data:l.map(c=>c.gp),lineStyle:{color:t.green,width:2},itemStyle:{color:t.green},symbol:"circle",symbolSize:5},{name:"صافي ربح",type:"line",smooth:!0,data:l.map(c=>+(c.gp*.75).toFixed(0)),lineStyle:{color:t.violet,width:2},itemStyle:{color:t.violet},symbol:"circle",symbolSize:5}]}),s("ch-inc-pie",{backgroundColor:i,tooltip:{...v,trigger:"item",formatter:"{b}: {d}%"},series:[{type:"pie",radius:["45%","75%"],padAngle:4,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},label:{color:"#94a3b8",fontSize:9,formatter:c=>`${c.name}
${c.percent.toFixed(1)}%`},data:[{value:+a.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:t.green}},{value:+a.cogs.toFixed(0),name:"تكلفة البضاعة",itemStyle:{color:t.red}},{value:+a.vatOut.toFixed(0),name:"ضريبة المبيعات",itemStyle:{color:t.orange}},{value:+a.opExpenses.toFixed(0),name:"مصاريف تشغيل",itemStyle:{color:t.yellow}},{value:+a.tax.toFixed(0),name:"ضريبة الدخل",itemStyle:{color:t.violet}}]}]})}}function M(o,a,e,l,s,i,p=!1,h=!1){return{type:"gauge",radius:l,center:[h?"83%":p?"50%":"17%","55%"],startAngle:210,endAngle:-30,min:0,max:e,axisLine:{lineStyle:{width:12,color:[[a/e||.01,i],[1,"#1e293b"]]}},progress:{show:!0,width:12,itemStyle:{color:i}},pointer:{show:!1},axisTick:{show:!1},splitLine:{show:!1},axisLabel:{show:!1},title:{fontSize:8,color:"#64748b",offsetCenter:[0,"85%"]},detail:{formatter:c=>c.toFixed(e>5?0:2)+(e===100?"%":"×"),fontSize:13,color:"#e2e8f0",fontWeight:800,offsetCenter:[0,"40%"]},data:[{value:Math.min(e,+a.toFixed(2)),name:o}]}}window.fa2Export=()=>{if(!P)return;const{R:o,period:a}=P,e=window.open("","_blank","width=900,height=700"),l=Object.entries({"هامش الربح الإجمالي":o.grossMgn.toFixed(1)+"%","هامش الربح التشغيلي":o.opMgn.toFixed(1)+"%","هامش صافي الربح":o.netMgn.toFixed(1)+"%","العائد على الأصول ROA":o.roa.toFixed(1)+"%","العائد على الملكية ROE":o.roe.toFixed(1)+"%","العائد على الاستثمار ROI":o.roi.toFixed(1)+"%","هامش EBITDA":o.ebitda.toFixed(1)+"%","نسبة الترميح":o.markup.toFixed(1)+"%","نسبة التداول":o.curRatio.toFixed(2)+"×","نسبة السيولة السريعة":o.quickRatio.toFixed(2)+"×","نسبة النقدية":o.cashRatio.toFixed(2)+"×","رأس المال العامل":y(o.workCap),"معدل دوران المخزون":o.invTurn.toFixed(1)+"×","أيام المخزون DIO":o.dio.toFixed(0)+" يوم","معدل دوران الذمم":o.recTurn.toFixed(1)+"×","أيام التحصيل DSO":o.dso.toFixed(0)+" يوم","معدل دوران الدائنة":o.payTurn.toFixed(1)+"×","أيام السداد DPO":o.dpo.toFixed(0)+" يوم","دورة تحويل النقد CCC":o.ccc.toFixed(0)+" يوم","الدورة التشغيلية":o.opCycle.toFixed(0)+" يوم","معدل دوران الأصول":o.astTurn.toFixed(2)+"×","نسبة الدين إلى الملكية D/E":o.de.toFixed(2)+"×","نسبة الدين إلى الأصول D/A":o.da.toFixed(1)+"%","نسبة حقوق الملكية":o.eq.toFixed(1)+"%","مضاعف الملكية":o.eqMult.toFixed(2)+"×","نسبة تغطية الفائدة":o.intCov.toFixed(1)+"×","نسبة الدين":o.debtRatio.toFixed(2),"التروس الرأسمالية":o.capGearing.toFixed(1)+"%"}).map(([s,i])=>`<tr><td>${s}</td><td style="text-align:left;font-weight:800;color:#6366f1">${i}</td></tr>`).join("");e.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
  <title>التحليل المالي — IDHAM ERP</title>
  <style>body{font-family:Arial;padding:20px;color:#0f172a;direction:rtl}
  h2{text-align:center;color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px}
  table{width:100%;border-collapse:collapse}th{background:#6366f1;color:#fff;padding:9px}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}
  .meta{text-align:center;color:#64748b;font-size:12px;margin:-10px 0 20px}</style></head>
  <body><h2>📊 التحليل المالي الشامل — IDHAM ERP</h2>
  <p class="meta">الفترة: ${a.from} — ${a.to}</p>
  <table><thead><tr><th>النسبة المالية</th><th>القيمة</th></tr></thead>
  <tbody>${l}</tbody></table></body></html>`),e.document.close(),e.print()};export{Xe as render};
