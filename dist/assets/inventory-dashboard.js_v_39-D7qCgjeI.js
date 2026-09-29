import{g as m,a as x,h as j,f as p,y as M,l as b}from"./index-CnctmNGr.js";import{orderBy as z,limit as q}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[],D=[],E=[],A=[],f=[],S=[],v={},$=!1;async function mt(e,t){$=!0,L(),e.innerHTML=T(),R();try{if(await B(),!$)return;_()}catch(a){if(console.error("[InventoryDash]",a),!$)return;const o=document.getElementById("dash-skeleton"),r=document.getElementById("dash-main");o&&(o.style.display="none"),r&&(r.style.display="block",r.innerHTML=`<div class="alert bad" style="margin:24px"><strong>خطأ في تحميل البيانات:</strong> ${a.message}</div>`)}}const P=(e,t=document)=>[...t.querySelectorAll(e)];function L(){Object.values(v).forEach(e=>{try{e.destroy()}catch{}}),v={}}function R(){if(document.getElementById("inv-dash-styles"))return;const e=document.createElement("style");e.id="inv-dash-styles",e.textContent=`
    .idash-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
    @media(max-width:1100px){.idash-kpi-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.idash-kpi-row{grid-template-columns:1fr}}
    .idash-kpi{border-radius:14px;padding:20px 22px;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;box-shadow:0 4px 20px rgba(0,0,0,.18);transition:transform .15s,box-shadow .15s;cursor:default}
    .idash-kpi:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.28)}
    .idash-kpi::before{content:'';position:absolute;inset:0;opacity:.12;background:radial-gradient(ellipse at 80% -20%,#fff 0%,transparent 60%);pointer-events:none}
    .idash-kpi-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;background:rgba(255,255,255,.18)}
    .idash-kpi-body{flex:1;min-width:0}
    .idash-kpi-label{font-size:12px;font-weight:600;opacity:.85;margin-bottom:4px;color:#fff}
    .idash-kpi-value{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;color:#fff;line-height:1.1;word-break:break-all}
    .idash-kpi-sub{font-size:11px;opacity:.7;color:#fff;margin-top:3px}
    .idash-kpi.blue{background:linear-gradient(135deg,#1a73e8,#0052cc)}
    .idash-kpi.teal{background:linear-gradient(135deg,#00897b,#005c52)}
    .idash-kpi.green{background:linear-gradient(135deg,#2e7d32,#1b5e20)}
    .idash-kpi.purple{background:linear-gradient(135deg,#6a1b9a,#4a148c)}
    .idash-alert-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
    @media(max-width:1100px){.idash-alert-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.idash-alert-row{grid-template-columns:1fr}}
    .idash-alert-card{border-radius:12px;padding:16px 18px;display:flex;align-items:center;gap:14px;border:1.5px solid transparent;background:var(--bg-2);transition:transform .15s}
    .idash-alert-card:hover{transform:translateY(-2px)}
    .idash-alert-card .ac-icon{font-size:28px;flex-shrink:0}
    .idash-alert-card .ac-body{flex:1}
    .idash-alert-card .ac-count{font-size:26px;font-weight:800;line-height:1}
    .idash-alert-card .ac-label{font-size:11px;color:var(--text-2);margin-top:2px}
    .idash-alert-card.red{border-color:#e53935}.idash-alert-card.red .ac-count{color:#e53935}
    .idash-alert-card.orange{border-color:#fb8c00}.idash-alert-card.orange .ac-count{color:#fb8c00}
    .idash-alert-card.darkred{border-color:#b71c1c}.idash-alert-card.darkred .ac-count{color:#b71c1c}
    .idash-alert-card.gray{border-color:#757575}.idash-alert-card.gray .ac-count{color:#9e9e9e}
    .idash-charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
    @media(max-width:900px){.idash-charts-grid{grid-template-columns:1fr}}
    .idash-chart-card{background:var(--bg-2);border:1px solid var(--border-soft);border-radius:14px;padding:20px}
    .idash-chart-title{font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:8px}
    .idash-chart-wrap{position:relative;height:240px}
    .idash-section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;margin-top:24px}
    .idash-section-hdr h3{font-size:15px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:8px;margin:0}
    .idash-tbl-wrap{background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;margin-bottom:4px}
    .idash-tbl-wrap .table-container{max-height:320px;overflow-y:auto}
    .abc-a{background:#1565c0;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .abc-b{background:#2e7d32;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .abc-c{background:#616161;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-x{background:#00695c;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-y{background:#e65100;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-z{background:#b71c1c;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-urgent{background:#b71c1c;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-warn{background:#e65100;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-ok{background:#1b5e20;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    @keyframes skeleton-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
    .sk-block{border-radius:8px;background:linear-gradient(90deg,var(--bg-2) 25%,var(--bg-3) 50%,var(--bg-2) 75%);background-size:600px 100%;animation:skeleton-shimmer 1.4s infinite linear}
    .sk-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
    .sk-kpi{height:96px;border-radius:14px}
    .sk-alert-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
    .sk-alert{height:72px;border-radius:12px}
    .sk-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
    .sk-chart{height:280px;border-radius:14px}
    .sk-table{height:220px;border-radius:12px;margin-bottom:20px}
    @media(max-width:1100px){.sk-kpi-row,.sk-alert-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:900px){.sk-chart-row{grid-template-columns:1fr}}
    @media(max-width:600px){.sk-kpi-row,.sk-alert-row{grid-template-columns:1fr}}
    .idash-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:900px){.idash-2col{grid-template-columns:1fr}}
    .progress-bar-wrap{background:var(--bg-3);border-radius:4px;height:6px;min-width:60px}
    .progress-bar-fill{height:100%;border-radius:4px;transition:width .5s ease}
  `,document.head.appendChild(e)}function T(){return`<div class="page-content" style="padding:20px 24px" dir="rtl">
    <div class="page-header" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="page-title" style="margin:0">📦 لوحة ذكاء المخزون</h1>
          <p class="page-subtitle" style="margin:4px 0 0;color:var(--text-2);font-size:13px">تحليلات ABC/XYZ · مؤشرات الدوران · الرواكد · تواريخ الانتهاء</p>
        </div>
        <button class="btn btn-secondary" id="idash-refresh-btn" style="gap:6px;display:flex;align-items:center">🔄 تحديث البيانات</button>
      </div>
    </div>
    <div id="dash-skeleton">
      <div class="sk-kpi-row"><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div></div>
      <div class="sk-alert-row"><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div></div>
      <div class="sk-chart-row"><div class="sk-block sk-chart"></div><div class="sk-block sk-chart"></div></div>
      <div class="sk-chart-row"><div class="sk-block sk-chart"></div><div class="sk-block sk-chart"></div></div>
      <div class="sk-block sk-table"></div><div class="sk-block sk-table"></div>
    </div>
    <div id="dash-main" style="display:none"></div>
  </div>`}async function B(){const[e,t,a,o]=await Promise.all([m(x.products()),m(x.categories()),m(x.warehouses()),m(x.stockByWarehouse())]);h=e,D=t,E=a,A=o,f=await m(x.stockTransactions(),[z("createdAt","desc"),q(500)]),S=await m(x.salesInvoices(),[z("createdAt","desc"),q(300)])}function _(){const e=document.getElementById("dash-skeleton"),t=document.getElementById("dash-main");if(!e||!t)return;const a=F(),o=Y(a),r=Z(a),s=O(a,o.totalCostValue),d=V(),n=X(a),l=H(a),i=W(),c=G(a),u=U(),I=J();t.innerHTML=Q(o)+K(r)+tt()+et(s)+at(d)+`<div class="idash-2col">${ot(l)}${rt(n)}</div>`+st(i),e.style.display="none",t.style.display="block",requestAnimationFrame(()=>{dt(c),nt(i),it(I),ct(u)}),document.getElementById("idash-refresh-btn")?.addEventListener("click",async()=>{const g=document.getElementById("idash-refresh-btn");g&&(g.disabled=!0,g.textContent="⏳ جاري التحديث..."),e.style.display="block",t.style.display="none",L();try{j(),await B(),$&&_()}catch(N){window.showToast?.("فشل التحديث: "+N.message,"error"),e.style.display="none",t.style.display="block",g&&(g.disabled=!1,g.textContent="🔄 تحديث البيانات")}}),P("[data-csv-export]").forEach(g=>g.addEventListener("click",()=>lt(g.dataset.csvExport)))}function F(){const e={};return A.forEach(t=>{e[t.productId]||(e[t.productId]={total:0,wh:{}}),e[t.productId].total+=t.qty||0,e[t.productId].wh[t.warehouseId]=(e[t.productId].wh[t.warehouseId]||0)+(t.qty||0)}),e}function Y(e){let t=0,a=0,o=0;return h.forEach(r=>{const s=e[r.id]?.total||0;t+=s*(r.costPrice||r.averageCost||r.purchasePrice||0),a+=s*(r.sellingPrice||r.salePrice||r.priceRetail||r.price||0),o+=s}),{totalCostValue:t,totalSaleValue:a,totalQty:o,expectedProfitPct:t>0?(a-t)/t*100:0,expectedProfitAbs:a-t}}function Z(e){const t=new Date;t.setHours(0,0,0,0);const a=new Date(t);a.setDate(t.getDate()+30);const o=new Date(t);o.setDate(t.getDate()-90);let r=0,s=0,d=0,n=0;h.forEach(c=>{const u=e[c.id]?.total||0;u>0&&c.reorderLevel&&u<=c.reorderLevel&&r++});const l=new Set;f.forEach(c=>{if(!c.expiryDate||!c.batchNumber||l.has(c.batchNumber))return;l.add(c.batchNumber);const u=new Date(c.expiryDate);isNaN(u)||(e[c.productId]?.total||0)<=0||(u<t?d++:u<=a&&s++)});const i=new Set;return f.forEach(c=>{if(!c.createdAt)return;(c.createdAt?.toDate?c.createdAt.toDate():new Date(c.createdAt))>=o&&i.add(c.productId)}),h.forEach(c=>{(e[c.id]?.total||0)>0&&!i.has(c.id)&&n++}),{lowStock:r,nearExpiry:s,expired:d,dormant:n}}function O(e,t){const a=h.map(r=>{const s=e[r.id]?.total||0,d=r.costPrice||r.averageCost||0;return{id:r.id,sku:r.sku||"—",name:r.name||"—",qty:s,value:s*d,cost:d,catName:D.find(n=>n.id===r.categoryId)?.name||"—"}}).sort((r,s)=>s.value-r.value);let o=0;return a.map(r=>{o+=r.value;const s=t>0?o/t*100:0;return{...r,cls:s<=80?"A":s<=95?"B":"C"}})}function V(){const e={};return f.forEach(t=>{if(!t.productId||!t.createdAt||t.type!=="sale_out"&&t.type!=="sales_out")return;const a=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);if(isNaN(a))return;const o=a.getFullYear()+"-"+String(a.getMonth()+1).padStart(2,"0");e[t.productId]||(e[t.productId]={}),e[t.productId][o]=(e[t.productId][o]||0)+Math.abs(t.qtyChange||0)}),S.forEach(t=>{if(!t.createdAt)return;const a=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);if(isNaN(a))return;const o=a.getFullYear()+"-"+String(a.getMonth()+1).padStart(2,"0");(t.lines||[]).forEach(r=>{r.productId&&(e[r.productId]||(e[r.productId]={}),e[r.productId][o]=(e[r.productId][o]||0)+(r.qty||0))})}),h.map(t=>{const a=Object.values(e[t.id]||{}),o=a.length;if(o<2)return{id:t.id,sku:t.sku||"—",name:t.name||"—",cv:null,cls:o===0?"Z":"Y",avg:a[0]||0,months:o};const r=a.reduce((n,l)=>n+l,0)/o,s=Math.sqrt(a.reduce((n,l)=>n+(l-r)**2,0)/o),d=r>0?s/r*100:999;return{id:t.id,sku:t.sku||"—",name:t.name||"—",cv:d,cls:d<=50?"X":d<=100?"Y":"Z",avg:r,months:o}}).sort((t,a)=>(t.cv??999)-(a.cv??999))}function X(e){const t=new Date;t.setHours(0,0,0,0);const a=new Date(t);a.setDate(t.getDate()+30);const o=new Set,r=[];return f.forEach(s=>{if(!s.expiryDate||!s.batchNumber)return;const d=s.productId+"_"+s.batchNumber;if(o.has(d))return;o.add(d);const n=new Date(s.expiryDate);if(isNaN(n)||n<t||n>a)return;const l=e[s.productId]?.total||0;if(l<=0)return;const i=h.find(c=>c.id===s.productId);r.push({sku:i?.sku||s.sku||"—",name:i?.name||s.productName||"—",batch:s.batchNumber,expiryDate:s.expiryDate,daysLeft:Math.ceil((n-t)/864e5),qty:l,productId:s.productId})}),r.sort((s,d)=>s.daysLeft-d.daysLeft)}function H(e){const t=new Date;t.setDate(t.getDate()-90),t.setHours(0,0,0,0);const a={};return f.forEach(o=>{if(!o.productId||!o.createdAt)return;const r=o.createdAt?.toDate?o.createdAt.toDate():new Date(o.createdAt);isNaN(r)||(!a[o.productId]||r>a[o.productId])&&(a[o.productId]=r)}),h.filter(o=>{if((e[o.id]?.total||0)<=0)return!1;const s=a[o.id];return!s||s<t}).map(o=>{const r=e[o.id]?.total||0,s=a[o.id],d=o.costPrice||o.averageCost||0;return{id:o.id,sku:o.sku||"—",name:o.name||"—",qty:r,cost:d,value:r*d,daysSince:s?Math.floor((Date.now()-s.getTime())/864e5):null}}).sort((o,r)=>(r.daysSince??9999)-(o.daysSince??9999))}function W(){const e={};return S.forEach(t=>(t.lines||[]).forEach(a=>{a.productId&&(e[a.productId]=(e[a.productId]||0)+(a.qty||0))})),f.forEach(t=>{t.type!=="sale_out"&&t.type!=="sales_out"||!t.productId||(e[t.productId]=(e[t.productId]||0)+Math.abs(t.qtyChange||0))}),h.filter(t=>e[t.id]>0).map(t=>({id:t.id,sku:t.sku||"—",name:t.name||"—",qtySold:e[t.id]||0,revenue:(e[t.id]||0)*(t.salePrice||0),cost:(e[t.id]||0)*(t.costPrice||t.averageCost||0)})).sort((t,a)=>a.qtySold-t.qtySold).slice(0,20)}function G(e){const t={};h.forEach(o=>{const r=e[o.id]?.total||0,s=o.costPrice||o.averageCost||0,d=D.find(n=>n.id===o.categoryId)?.name||"غير مصنف";t[d]=(t[d]||0)+r*s});const a=Object.entries(t).sort((o,r)=>r[1]-o[1]);return{labels:a.map(o=>o[0]),data:a.map(o=>o[1])}}function U(){const e={};E.forEach(a=>{e[a.id]={name:a.name||a.id,value:0,qty:0}}),A.forEach(a=>{e[a.warehouseId]||(e[a.warehouseId]={name:a.warehouseId,value:0,qty:0});const o=h.find(s=>s.id===a.productId),r=o&&(o.costPrice||o.averageCost)||0;e[a.warehouseId].value+=(a.qty||0)*r,e[a.warehouseId].qty+=a.qty||0});const t=Object.values(e).filter(a=>a.value>0);return{labels:t.map(a=>a.name),values:t.map(a=>a.value)}}function J(){const e=new Date,t=[];for(let o=5;o>=0;o--){const r=new Date(e.getFullYear(),e.getMonth()-o,1);t.push({key:r.getFullYear()+"-"+String(r.getMonth()+1).padStart(2,"0"),label:r.toLocaleDateString("ar-SA",{month:"short",year:"2-digit"}),out:0,in:0})}const a=Object.fromEntries(t.map((o,r)=>[o.key,r]));return f.forEach(o=>{if(!o.createdAt)return;const r=o.createdAt?.toDate?o.createdAt.toDate():new Date(o.createdAt);if(isNaN(r))return;const s=r.getFullYear()+"-"+String(r.getMonth()+1).padStart(2,"0"),d=a[s];if(d===void 0)return;const n=Math.abs(o.qtyChange||0);(o.qtyChange||0)<0?t[d].out+=n:t[d].in+=n}),t}const w=(e,t)=>`<tr><td colspan="${e}" style="text-align:center;color:var(--text-2);padding:24px">${t}</td></tr>`,k=(e,t)=>`<div class="idash-section-hdr"><h3>${e}</h3><button class="btn btn-secondary" style="font-size:11px;padding:5px 12px" data-csv-export="${t}">⬇ تصدير CSV</button></div>`;function Q(e){const t=(a,o,r,s,d)=>`<div class="idash-kpi ${a}"><div class="idash-kpi-icon">${o}</div><div class="idash-kpi-body"><div class="idash-kpi-label">${r}</div><div class="idash-kpi-value">${s}</div><div class="idash-kpi-sub">${d}</div></div></div>`;return`<div class="idash-kpi-row">
    ${t("blue","💰","إجمالي قيمة المخزون (سعر البيع)",p(e.totalSaleValue,!0),"القيمة بأسعار البيع الحالية")}
    ${t("teal","🏷️","إجمالي تكلفة المخزون",p(e.totalCostValue,!0),"إجمالي رأس المال المُستثمر في المخزون")}
    ${t("green","📈","الأرباح المتوقعة من المخزون",M(e.expectedProfitPct),p(e.expectedProfitAbs,!0)+" هامش ربح صافٍ")}
    ${t("purple","📦","عدد الأصناف الإجمالي",h.length.toLocaleString("ar-SA"),"إجمالي الكميات: "+b(e.totalQty)+" وحدة")}
  </div>`}function K(e){const t=(a,o,r,s)=>`<div class="idash-alert-card ${a}"><div class="ac-icon">${o}</div><div class="ac-body"><div class="ac-count">${r}</div><div class="ac-label">${s}</div></div></div>`;return`<div class="idash-alert-row">
    ${t("red","🔴",e.lowStock,"أصناف أقل من حد إعادة الطلب")}
    ${t("orange","🟠",e.nearExpiry,"أصناف قريبة الانتهاء (30 يوم)")}
    ${t("darkred","⛔",e.expired,"أصناف منتهية الصلاحية")}
    ${t("gray","💤",e.dormant,"أصناف راكدة +90 يوم")}
  </div>`}function tt(){const e=(t,a,o)=>`<div class="idash-chart-card"><div class="idash-chart-title">${t} ${a}</div><div class="idash-chart-wrap"><canvas id="${o}"></canvas></div></div>`;return`<div class="idash-charts-grid">
    ${e("🍩","توزيع المخزون حسب الفئة","chart-category")}
    ${e("🏆","أعلى 10 أصناف مبيعًا (بالكمية)","chart-top-movers")}
    ${e("📊","معدل دوران المخزون الشهري","chart-turnover")}
    ${e("🏭","مقارنة قيمة المخازن","chart-warehouse")}
  </div>`}function et(e){const t=e.filter(n=>n.cls==="A"),a=e.filter(n=>n.cls==="B"),o=e.filter(n=>n.cls==="C"),r=e.reduce((n,l)=>n+l.value,0),s=`<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
    <span class="abc-a">A — ${t.length} صنف · ${p(t.reduce((n,l)=>n+l.value,0),!0)}</span>
    <span class="abc-b">B — ${a.length} صنف · ${p(a.reduce((n,l)=>n+l.value,0),!0)}</span>
    <span class="abc-c">C — ${o.length} صنف · ${p(o.reduce((n,l)=>n+l.value,0),!0)}</span>
  </div>`,d=e.slice(0,100).map(n=>{const l=r>0?n.value/r*100:0,i=n.cls==="A"?"#1565c0":n.cls==="B"?"#2e7d32":"#616161";return`<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${n.sku}</td>
      <td><strong>${n.name}</strong><br><span style="font-size:10px;color:var(--text-2)">${n.catName}</span></td>
      <td class="mono">${b(n.qty)}</td>
      <td class="mono">${p(n.value,!0)}</td>
      <td><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.min(l*5,100)}%;background:${i}"></div></div>
          <span style="font-size:10px;color:var(--text-2)">${l.toFixed(1)}%</span></td>
      <td><span class="abc-${n.cls.toLowerCase()}">${n.cls}</span></td>
    </tr>`}).join("");return window._dashABCData=e,k("🔬 تحليل ABC — تصنيف الأصناف حسب القيمة المالية","abc")+`<p style="font-size:12px;color:var(--text-2);margin-bottom:10px">الفئة A: تشكل 80% من القيمة · B: 80–95% · C: الباقي</p>${s}
    <div class="idash-tbl-wrap"><div class="table-container"><table class="data-dense">
      <thead><tr><th>الكود</th><th>اسم الصنف</th><th>الكمية</th><th>القيمة</th><th>نسبة القيمة</th><th>التصنيف</th></tr></thead>
      <tbody>${d||w(6,"لا توجد أصناف")}</tbody>
    </table></div></div>`}function at(e){const t=e.filter(d=>d.cls==="X"),a=e.filter(d=>d.cls==="Y"),o=e.filter(d=>d.cls==="Z"),r=`<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
    <span class="xyz-x">X — ${t.length} صنف (طلب منتظم)</span>
    <span class="xyz-y">Y — ${a.length} صنف (طلب متغير)</span>
    <span class="xyz-z">Z — ${o.length} صنف (طلب غير منتظم)</span>
  </div>`,s=e.slice(0,80).map(d=>`<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${d.sku}</td>
      <td><strong>${d.name}</strong></td>
      <td class="mono">${b(d.avg)}</td>
      <td class="mono">${d.cv!==null?d.cv.toFixed(1)+"%":"لا بيانات"}</td>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${d.months} شهر</td>
      <td><span class="xyz-${d.cls.toLowerCase()}">${d.cls}</span></td>
    </tr>`).join("");return window._dashXYZData=e,k("📐 تحليل XYZ — تصنيف الأصناف حسب انتظام الطلب","xyz")+`<p style="font-size:12px;color:var(--text-2);margin-bottom:10px">X: معامل التباين ≤50% · Y: 50–100% · Z: أكثر من 100%</p>${r}
    <div class="idash-tbl-wrap" style="margin-bottom:20px"><div class="table-container"><table class="data-dense">
      <thead><tr><th>الكود</th><th>اسم الصنف</th><th>متوسط الطلب/شهر</th><th>معامل التباين (CV)</th><th>عدد الأشهر</th><th>التصنيف</th></tr></thead>
      <tbody>${s||w(6,"لا توجد بيانات كافية")}</tbody>
    </table></div></div>`}function ot(e){const t=e.slice(0,50).map(a=>{const o=a.daysSince!==null?a.daysSince+" يوم":"لم يتحرك قط",r=(a.daysSince??999)>180?"color:var(--bad);font-weight:700":"";return`<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${a.sku}</td>
      <td><strong>${a.name}</strong></td>
      <td class="mono">${b(a.qty)}</td>
      <td class="mono">${p(a.value,!0)}</td>
      <td class="mono" style="${r}">${o}</td>
    </tr>`}).join("");return window._dashSlowData=e,`<div>${k("💤 الأصناف الراكدة (+90 يوم بدون حركة)","slow")}
    <div class="idash-tbl-wrap"><div class="table-container" style="max-height:260px"><table class="data-dense">
      <thead><tr><th>الكود</th><th>الصنف</th><th>الكمية</th><th>القيمة</th><th>آخر حركة</th></tr></thead>
      <tbody>${t||w(5,"لا توجد أصناف راكدة ✅")}</tbody>
    </table></div></div></div>`}function rt(e){const t=e.map(a=>{const o=a.daysLeft<=7?"exp-urgent":a.daysLeft<=15?"exp-warn":"exp-ok";return`<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${a.sku}</td>
      <td><strong>${a.name}</strong><br><span style="font-size:10px;color:var(--text-2)">دفعة: ${a.batch}</span></td>
      <td class="mono">${b(a.qty)}</td>
      <td class="mono">${a.expiryDate}</td>
      <td><span class="${o}">${a.daysLeft} يوم</span></td>
    </tr>`}).join("");return window._dashExpiryData=e,`<div>${k("⚠️ الأصناف قريبة الانتهاء (خلال 30 يوم)","expiry")}
    <div class="idash-tbl-wrap"><div class="table-container" style="max-height:260px"><table class="data-dense">
      <thead><tr><th>الكود</th><th>الصنف / الدفعة</th><th>الكمية</th><th>تاريخ الانتهاء</th><th>المتبقي</th></tr></thead>
      <tbody>${t||w(5,"لا توجد أصناف قريبة الانتهاء ✅")}</tbody>
    </table></div></div></div>`}function st(e){const t=e[0]?.qtySold||1,a=e.map((o,r)=>{const s=o.qtySold/t*100,d=r===0?"🥇":r===1?"🥈":r===2?"🥉":"#"+(r+1),n=o.revenue-o.cost;return`<tr>
      <td style="font-size:14px;text-align:center">${d}</td>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${o.sku}</td>
      <td><strong>${o.name}</strong></td>
      <td class="mono">${b(o.qtySold)}</td>
      <td class="mono">${p(o.revenue,!0)}</td>
      <td class="mono" style="color:var(--good)">${p(n,!0)}</td>
      <td><div class="progress-bar-wrap" style="min-width:80px"><div class="progress-bar-fill" style="width:${s}%;background:#1a73e8"></div></div></td>
    </tr>`}).join("");return window._dashTopData=e,k("🏆 أعلى الأصناف مبيعًا (حسب الكمية)","top")+`<div class="idash-tbl-wrap" style="margin-bottom:32px"><div class="table-container"><table class="data-dense">
      <thead><tr><th style="width:40px">#</th><th>الكود</th><th>اسم الصنف</th><th>الكمية المباعة</th><th>الإيراد</th><th>الربح</th><th>النسبة</th></tr></thead>
      <tbody>${a||w(7,"لا توجد بيانات مبيعات")}</tbody>
    </table></div></div>`}const y=["#1a73e8","#00897b","#e65100","#6a1b9a","#c62828","#2e7d32","#0277bd","#ad1457","#37474f","#f57f17","#00695c","#283593"],C=()=>{const e=getComputedStyle(document.documentElement);return{tc:e.getPropertyValue("--text-2").trim()||"#888",gc:e.getPropertyValue("--border-soft").trim()||"#333"}};function dt(e){const t=document.getElementById("chart-category");if(!t)return;const{tc:a}=C(),o=t.getContext("2d"),r=e.labels.map((s,d)=>window.createVolumetricGradient(o,y[d%y.length],"doughnut"));v["chart-category"]=new Chart(t,{type:"doughnut",data:{labels:e.labels,datasets:[{data:e.data,backgroundColor:r,borderWidth:2,borderColor:document.body.classList.contains("theme-light")?"#fff":"rgba(0,0,0,0.2)",hoverOffset:10}]},options:{responsive:!0,maintainAspectRatio:!1,animation:{animateRotate:!0,duration:900},cutout:"68%",borderRadius:4,plugins:{legend:{position:"right",rtl:!0,labels:{color:document.body.classList.contains("theme-light")?"#0F172A":a,font:{size:11,family:"Tajawal",weight:"600"},boxWidth:12,padding:8}},tooltip:{callbacks:{label:s=>{const d=e.data.reduce((l,i)=>l+i,0),n=d>0?(s.raw/d*100).toFixed(1):0;return` ${s.label}: ${p(s.raw,!0)} (${n}%)`}}}}}})}function nt(e){const t=document.getElementById("chart-top-movers");if(!t)return;const{tc:a,gc:o}=C(),r=e.slice(0,10),s=t.getContext("2d"),d=r.map((c,u)=>window.createVolumetricGradient(s,y[u%y.length],"bar")),n=document.body.classList.contains("theme-light"),l=n?"#0F172A":"#475569",i=n?"#0F172A":a;v["chart-top-movers"]=new Chart(t,{type:"bar",data:{labels:r.map(c=>c.name.length>15?c.name.slice(0,15)+"…":c.name),datasets:[{label:"الكمية المباعة",data:r.map(c=>c.qtySold),backgroundColor:d,borderRadius:8,borderSkipped:!1}]},options:{responsive:!0,maintainAspectRatio:!1,animation:{duration:800},plugins:{legend:{display:!1},tooltip:{callbacks:{label:c=>` ${b(c.raw)} وحدة`}}},scales:{x:{ticks:{color:i,font:{size:10,family:"Tajawal",weight:"600"}},grid:{display:!1},border:{color:l}},y:{ticks:{color:i,font:{size:10,family:"JetBrains Mono",weight:"600"}},grid:{color:n?"rgba(15, 23, 42, 0.15)":o},beginAtZero:!0,border:{color:l}}}}})}function it(e){const t=document.getElementById("chart-turnover");if(!t)return;const{tc:a,gc:o}=C(),r=t.getContext("2d"),s=document.body.classList.contains("theme-light"),d=s?"#0F172A":"#475569",n=s?"#0F172A":a,l=r.createLinearGradient(0,0,0,300);l.addColorStop(0,"rgba(229,57,53,0.4)"),l.addColorStop(1,"rgba(229,57,53,0.0)");const i=r.createLinearGradient(0,0,0,300);i.addColorStop(0,"rgba(26,115,232,0.35)"),i.addColorStop(1,"rgba(26,115,232,0.0)"),v["chart-turnover"]=new Chart(t,{type:"line",data:{labels:e.map(c=>c.label),datasets:[{label:"الصادر",data:e.map(c=>c.out),borderColor:"#e53935",backgroundColor:l,borderWidth:3,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:7},{label:"الوارد",data:e.map(c=>c.in),borderColor:"#1a73e8",backgroundColor:i,borderWidth:3,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:7}]},options:{responsive:!0,maintainAspectRatio:!1,animation:{duration:1e3},plugins:{legend:{labels:{color:n,font:{size:11,family:"Tajawal",weight:"600"}}},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${b(c.raw)} وحدة`}}},scales:{x:{ticks:{color:n,font:{size:11,family:"Tajawal",weight:"600"}},grid:{display:!1},border:{color:d}},y:{ticks:{color:n,font:{size:10,family:"JetBrains Mono",weight:"600"}},grid:{color:s?"rgba(15, 23, 42, 0.15)":o},beginAtZero:!0,border:{color:d}}}}})}function ct(e){const t=document.getElementById("chart-warehouse");if(!t)return;const{tc:a,gc:o}=C(),r=t.getContext("2d"),s=e.labels.map((i,c)=>window.createVolumetricGradient(r,y[c%y.length],"horizontalBar")),d=document.body.classList.contains("theme-light"),n=d?"#0F172A":"#475569",l=d?"#0F172A":a;v["chart-warehouse"]=new Chart(t,{type:"bar",data:{labels:e.labels,datasets:[{label:"قيمة المخزون",data:e.values,backgroundColor:s,borderRadius:8,borderSkipped:!1}]},options:{indexAxis:"y",responsive:!0,maintainAspectRatio:!1,animation:{duration:900},plugins:{legend:{display:!1},tooltip:{callbacks:{label:i=>` ${p(i.raw,!0)}`}}},scales:{x:{ticks:{color:l,font:{size:10,family:"JetBrains Mono",weight:"600"},callback:i=>p(i,!0)},grid:{color:d?"rgba(15, 23, 42, 0.15)":o},beginAtZero:!0,border:{color:n}},y:{ticks:{color:l,font:{size:11,family:"Tajawal",weight:"600"}},grid:{display:!1},border:{color:n}}}}})}function lt(e){const t=new Date().toISOString().split("T")[0];let a=[],o="";if(e==="abc"&&window._dashABCData)o=`abc-analysis-${t}.csv`,a=[["الكود","اسم الصنف","الفئة","الكمية","التكلفة","القيمة","التصنيف"],...window._dashABCData.map(i=>[i.sku,i.name,i.catName,i.qty,i.cost,i.value,i.cls])];else if(e==="xyz"&&window._dashXYZData)o=`xyz-analysis-${t}.csv`,a=[["الكود","اسم الصنف","متوسط الطلب/شهر","معامل التباين","عدد الأشهر","التصنيف"],...window._dashXYZData.map(i=>[i.sku,i.name,i.avg?.toFixed(2)||0,i.cv!==null?i.cv.toFixed(1)+"%":"N/A",i.months,i.cls])];else if(e==="slow"&&window._dashSlowData)o=`slow-movers-${t}.csv`,a=[["الكود","اسم الصنف","الكمية","القيمة","أيام بدون حركة"],...window._dashSlowData.map(i=>[i.sku,i.name,i.qty,i.value,i.daysSince??"N/A"])];else if(e==="expiry"&&window._dashExpiryData)o=`near-expiry-${t}.csv`,a=[["الكود","اسم الصنف","رقم الدفعة","تاريخ الانتهاء","أيام متبقية","الكمية"],...window._dashExpiryData.map(i=>[i.sku,i.name,i.batch,i.expiryDate,i.daysLeft,i.qty])];else if(e==="top"&&window._dashTopData)o=`top-movers-${t}.csv`,a=[["الكود","اسم الصنف","الكمية المباعة","الإيراد","التكلفة","الربح"],...window._dashTopData.map(i=>[i.sku,i.name,i.qtySold,i.revenue,i.cost,i.revenue-i.cost])];else{window.showToast?.("لا توجد بيانات للتصدير","warn");return}const s="\uFEFF"+a.map(i=>i.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(",")).join(`\r
`),d=new Blob([s],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(d),l=Object.assign(document.createElement("a"),{href:n,download:o});document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(n),window.showToast?.(`تم تصدير الملف: ${o}`,"success")}export{mt as render};
