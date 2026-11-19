import{g as gt,C as ot,d as Yt,a as Vt,u as te,c as ee,f as F,b as wt,e as oe}from"./index-CF9GFeRJ.js";import{orderBy as Nt,getDoc as ie,doc as re}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let rt=[],ct=[],Ct=[],Dt=[],Kt=[],Bt=[],Jt=[],Lt=[],Et={},Q=new Map,$t=null,G=null,O={name:"شركة نظم الإمداد المتطوره",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"ينبع الصناعية — حي غرناطة"},w={supplierId:"",productId:"",dateFrom:"",dateTo:"",trend:"all",search:"",activeTab:"purchases-report",profitSort:"qty-sold",sortCol:"totalAmount",sortDir:"desc",quickFilter:"all"};async function ge(I,A){$t=A,I.innerHTML=`
    <!-- Top Tab Navigation & Actions Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button id="sph-tab-report" class="btn btn-primary" onclick="window.sphSwitchTab('purchases-report')" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <span>📑</span> تقرير مشتريات الأصناف ومقارنة الموردين الأفقية
        </button>
        <button id="sph-tab-profit" class="btn btn-secondary" onclick="window.sphSwitchTab('sales-profit')" style="display:flex; align-items:center; gap:6px; font-weight:700; border:1px solid #d97706;">
          <span>💎</span> تحليل الطلب والمبيعات والأرباح للأصناف
        </button>
        <button id="sph-tab-compare" class="btn btn-secondary" onclick="window.sphSwitchTab('product-compare')" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <span>🔍</span> البحث بالصنف وحاسبة الوفر والترسية
        </button>
      </div>

      <div class="no-print" style="display:flex; gap:8px;">
        <button id="sph-main-excel-btn" class="btn" onclick="window.exportSupplierPurchasesExcel()" title="تصدير تقرير إكسل مطور بتنسيقات احترافية وتبويبات ملونة" style="background:#047857; color:#ffffff; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(4,120,87,0.25); border:1px solid #065f46;">
          <span>📊</span> تصدير Excel مطور
        </button>
        <button id="sph-main-royal-print-btn" class="btn" onclick="window.sphTriggerActivePrint()" style="background:#1e1b4b; color:#f8fafc; border:1px solid #d97706; display:flex; align-items:center; gap:6px; font-weight:800; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          <span>👑</span> طباعة ملكي PDF
        </button>
      </div>
    </div>

    <!-- Filter Bar for Purchases Report (Tab 1) -->
    <div id="sph-filterbar-report" class="filterbar no-print" style="margin-bottom:16px; padding:12px 16px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Supplier Selector -->
      <div class="filter-select-group" style="min-width:240px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">المورد *</label>
        <select id="sph-filter-sup" class="input" onchange="window.sphOnFilterChange()">
          <option value="">🏢 كل الموردين (عرض الأصناف والموردين جنباً إلى جنب)</option>
        </select>
      </div>

      <!-- Optional Product Selector -->
      <div class="filter-select-group" style="min-width:200px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">الصنف (اختياري)</label>
        <select id="sph-filter-prod" class="input" onchange="window.sphOnFilterChange()">
          <option value="">📦 كل الأصناف</option>
        </select>
      </div>

      <!-- Date From -->
      <div class="filter-select-group" style="width:130px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">من تاريخ</label>
        <input type="date" id="sph-filter-date-from" class="input" onchange="window.sphOnFilterChange()" />
      </div>

      <!-- Date To -->
      <div class="filter-select-group" style="width:130px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">إلى تاريخ</label>
        <input type="date" id="sph-filter-date-to" class="input" onchange="window.sphOnFilterChange()" />
      </div>

      <!-- Price Trend Filter -->
      <div class="filter-select-group" style="width:180px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">تصفية التعدد والحركة</label>
        <select id="sph-filter-trend" class="input" onchange="window.sphOnFilterChange()">
          <option value="all">كل الحركات السعرية</option>
          <option value="multi-sup">🔄 أصناف متعددة الموردين فقط</option>
          <option value="up">🔺 أصناف ارتفع سعرها</option>
          <option value="down">🔻 أصناف انخفض سعرها</option>
          <option value="stable">⚪ أسعار مستقرة</option>
        </select>
      </div>

      <!-- Instant Search Filter -->
      <div class="filter-select-group" style="min-width:180px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">بحث سريع</label>
        <input type="text" id="sph-filter-search" class="input" placeholder="اسم الصنف، المورد، الكود…" oninput="window.sphOnFilterChange()" />
      </div>

      <!-- Quick Reset Button -->
      <div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" title="إعادة ضبط الفلاتر">
          🔄 مسح الفلاتر
        </button>
      </div>
    </div>

    <!-- Filter Bar for Product Single Comparison (Tab 2) -->
    <div id="sph-filterbar-compare" class="filterbar no-print hidden" style="margin-bottom:16px; padding:12px 16px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Instant Search Input -->
      <div class="filter-select-group" style="min-width:240px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">🔍 ابحث بالصنف أو الكود مباشرة</label>
        <input type="text" id="sph-compare-search" class="input" placeholder="اكتب اسم الصنف للبحث الفوري…" oninput="window.sphOnCompareSearch(this.value)" />
      </div>

      <!-- Product Dropdown -->
      <div class="filter-select-group" style="min-width:280px; flex:1.2;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">اختر الصنف من القائمة *</label>
        <select id="sph-compare-prod" class="input" onchange="window.sphOnCompareProductChange(this.value)">
          <option value="">-- اختر الصنف لتتبع الأسعار والموردين --</option>
        </select>
      </div>

      <!-- Supplier Filter (Optional) -->
      <div class="filter-select-group" style="min-width:180px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">تصفية مورد محدد (اختياري)</label>
        <select id="sph-compare-sup" class="input" onchange="window.sphRenderCompareView()">
          <option value="">كل الموردين المتاحين</option>
        </select>
      </div>

      <!-- Desired Quantity for Savings Calculator -->
      <div class="filter-select-group" style="width:140px;">
        <label style="font-size:11px; font-weight:700; color:#d97706; margin-bottom:4px; display:block;">💡 كمية الشراء المستهدفة</label>
        <input type="number" id="sph-calc-qty" class="input" value="50" min="1" step="1" oninput="window.sphRenderCompareView()" />
      </div>

      <!-- Print Product Comparison -->
      <div>
        <button class="btn" onclick="window.printRoyalProductCompare()" style="background:#1e1b4b; color:#f8fafc; border:1px solid #d97706; display:flex; align-items:center; gap:6px; font-weight:800;">
          <span>👑</span> طباعة مقارنة الصنف PDF
        </button>
      </div>
    </div>

    <!-- Main Dynamic Content Container -->
    <div id="sph-main-content" class="page-content">
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:12px;">⏳</div>
        <div style="font-size:16px; font-weight:700;">جارٍ استخراج وتجميع بيانات المشتريات وتقلبات الأسعار…</div>
      </div>
    </div>

    <!-- History Detail Modal -->
    <div id="sph-modal" class="modal-overlay hidden" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.7); z-index:9999; align-items:center; justify-content:center; padding:16px;">
      <div class="modal-content" style="background:var(--bg-card, #fff); border-radius:14px; max-width:900px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:1px solid var(--border-soft);">
        <div style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 id="sph-modal-title" style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">سجل فواتير الصنف</h3>
          <button class="btn btn-secondary" onclick="window.sphCloseModal()" style="padding:4px 10px;">✕ إغلاق</button>
        </div>
        <div id="sph-modal-body" style="padding:20px;"></div>
      </div>
    </div>
  `,await ae(),le(),xt()}async function ae(){try{const[I,A,n,r,e,o,p,f,m]=await Promise.all([gt(ot.products(),[Nt("name")]).catch(()=>[]),gt(ot.suppliers(),[Nt("name")]).catch(()=>[]),gt(ot.purchaseInvoices(),[Nt("date","desc")]).catch(()=>[]),gt(ot.salesInvoices(),[Nt("date","desc")]).catch(()=>[]),gt(ot.quotations(),[Nt("date","desc")]).catch(()=>[]),gt(ot.stockByWarehouse?ot.stockByWarehouse():"stockByWarehouse").catch(()=>[]),gt(ot.deliveryNotes?ot.deliveryNotes():"deliveryNotes").catch(()=>[]),gt(ot.salesReturns?ot.salesReturns():"salesReturns").catch(()=>[]),gt(ot.purchaseReturns?ot.purchaseReturns():"purchaseReturns").catch(()=>[])]);rt=I||[],ct=A||[],Ct=(n||[]).filter(z=>z.status!=="cancelled"),Dt=(r||[]).filter(z=>z.status!=="cancelled"),Kt=e||[],Bt=(p||[]).filter(z=>z.status!=="cancelled"),Jt=(f||[]).filter(z=>z.status!=="cancelled"),Lt=(m||[]).filter(z=>z.status!=="cancelled"),Et={},(o||[]).forEach(z=>{z.productId&&(Et[z.productId]=(Et[z.productId]||0)+(parseFloat(z.qty)||0))}),ne();try{const z=await ie(re(Yt,`companies/${Vt}/settings`,"company"));if(z.exists()){const C=z.data();O={name:C.name||C.nameAr||C.legalName||"شركة نظم الإمداد المتطوره",crNumber:C.crNumber||C.cr||"7054969006",vatNumber:C.vatNumber||"314996148100003",phone:C.phone||"0549141648",email:C.email||"Nuzmalamdad@gmail.com",address:C.address||[C.street,C.district,C.city].filter(Boolean).join(" — ")||"ينبع الصناعية — حي غرناطة"};try{localStorage.setItem("idham_company",JSON.stringify(O))}catch{}}}catch(z){console.warn("Could not load company settings:",z)}try{const z=sessionStorage.getItem("sph_active_rfq");z&&(G=JSON.parse(z))}catch{}}catch(I){console.warn("Error loading supplier price, sales and stock data:",I)}}function ne(){const I=document.getElementById("sph-filter-sup"),A=document.getElementById("sph-filter-prod"),n=document.getElementById("sph-compare-prod"),r=document.getElementById("sph-compare-sup"),e={};Ct.forEach(o=>{const p=o.supplierId||"unknown";e[p]=(e[p]||0)+1}),I&&(I.innerHTML='<option value="">🏢 كل الموردين (عرض الأصناف والموردين جنباً إلى جنب)</option>'+ct.map(o=>{const p=e[o.id]||0;return`<option value="${o.id}">${o.name} ${p>0?`(${p} فاتورة)`:""}</option>`}).join("")),A&&(A.innerHTML='<option value="">📦 كل الأصناف</option>'+rt.map(o=>`<option value="${o.id}">${o.name} (${o.unit||"كرتون"})</option>`).join("")),n&&(n.innerHTML='<option value="">-- اختر الصنف لتتبع الأسعار والموردين --</option>'+rt.map(o=>`<option value="${o.id}">${o.name} (${o.unit||"كرتون"})</option>`).join(""),rt.length>0&&(n.value=rt[0].id)),r&&(r.innerHTML='<option value="">كل الموردين المتاحين</option>'+ct.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""))}function ht(I=!1){const{supplierId:A,productId:n,dateFrom:r,dateTo:e,trend:o,search:p}=w,f=new Map(rt.map(l=>[l.id,l])),m=new Map(ct.map(l=>[l.id,l])),z=new Map;Ct.forEach(l=>{if(A&&l.supplierId!==A)return;const u=l.date||l.invoiceDate||"";if(r&&u&&u<r||e&&u&&u>e)return;const $=l.supplierId||"",N=l.supplierName||($?m.get($)?.name:"")||"مورد عام";(l.lines||l.items||[]).forEach(S=>{const x=S.productId||"",a=S.productName||S.name||(x?f.get(x)?.name:"")||"صنف غير معروف",s=x?f.get(x):rt.find(U=>U.name===a);if(n&&x!==n&&(!s||s.id!==n))return;const d=parseFloat(S.unitPrice!==void 0?S.unitPrice:S.price||0),t=parseFloat(S.qty!==void 0?S.qty:S.quantity||1),b=parseFloat(S.total!==void 0?S.total:t*d),T=S.unit||s?.unit||"كرتون",E=S.sku||s?.sku||"—";if(p){const U=p.trim().toLowerCase();if(!`${a} ${E} ${N}`.toLowerCase().includes(U))return}const M=x||a;z.has(M)||z.set(M,{productId:x||s?.id||"",productName:a,sku:E,unit:T,suppliersMap:new Map});const H=z.get(M),v=$||N;H.suppliersMap.has(v)||H.suppliersMap.set(v,{supplierId:$,supplierName:N,invoices:[]}),H.suppliersMap.get(v).invoices.push({date:u,invoiceNumber:l.number||l.invoiceNumber||(l.id?l.id.slice(0,8):"—"),invoiceId:l.id||"",unitPrice:d,qty:t,total:b,unit:T})})});const C=[];if(z.forEach(l=>{const u=[];let $=0,N=0,S=0;const x=[];if(l.suppliersMap.forEach(k=>{k.invoices.sort((mt,yt)=>(mt.date||"").localeCompare(yt.date||""));const R=k.invoices.length,Z=k.invoices.map(mt=>mt.unitPrice),q=Z[0]||0,P=Z[R-1]||0,J=Math.min(...Z),D=Math.max(...Z),Y=P-q,it=q>0?Y/q*100:0,K=k.invoices.reduce((mt,yt)=>mt+yt.qty,0),W=k.invoices.reduce((mt,yt)=>mt+yt.total,0),V=K>0?W/K:P;$+=K,N+=W,S+=R,x.push(...Z);let X="stable";Y>.01?X="up":Y<-.01&&(X="down"),u.push({supplierId:k.supplierId,supplierName:k.supplierName,purchaseCount:R,initialPrice:q,latestPrice:P,minPrice:J,maxPrice:D,avgPrice:V,priceDiff:Y,priceDiffPct:it,movement:X,totalQty:K,totalAmount:W,latestDate:k.invoices[R-1]?.date||"",invoices:k.invoices})}),u.length===0)return;u.sort((k,R)=>k.latestPrice-R.latestPrice||k.avgPrice-R.avgPrice);const a=Math.min(...x),s=Math.max(...x),d=s-a;if(o==="multi-sup"&&u.length<=1||o==="up"&&!u.some(k=>k.movement==="up")||o==="down"&&!u.some(k=>k.movement==="down")||o==="stable"&&!u.some(k=>k.movement==="stable"))return;const t=$>0?N/$:u[0]?.latestPrice||0,b=l.productId,T=(l.productName||"").trim().toLowerCase(),E=(l.sku||"").trim(),M=b?f.get(b):rt.find(k=>k.name===l.productName);let H=new Set,v=0,U=0,_=0;Dt.forEach(k=>{const R=k.date||k.invoiceDate||"";if(r&&R&&R<r||e&&R&&R>e)return;const Z=k.lines||k.items||[];let q=!1;Z.forEach(P=>{const J=P.productId||"",D=(P.productName||P.name||"").trim().toLowerCase(),Y=(P.sku||"").trim();if(b&&J===b||E&&E!=="—"&&Y&&Y===E||D&&D===T){q=!0;const K=parseFloat(P.qty!==void 0?P.qty:P.quantity||0),W=parseFloat(P.unitPrice!==void 0?P.unitPrice:P.price||0),V=parseFloat(P.discount||0),X=Math.max(0,K*W-V),mt=parseFloat(P.averageCost||P.costPrice||0)||t||parseFloat(M?.costPrice||0);v+=K,U+=X,_+=K*mt}}),q&&H.add(k.id||k.number||Math.random())});let B=0;Bt.forEach(k=>{if(k.status==="cancelled"||k.status==="converted_to_invoice")return;const R=k.date||k.deliveryDate||"";if(r&&R&&R<r||e&&R&&R>e)return;const Z=k.lines||k.items||[];let q=!1;Z.forEach(P=>{const J=P.productId||"",D=(P.productName||P.name||"").trim().toLowerCase(),Y=(P.sku||"").trim();if(b&&J===b||E&&E!=="—"&&Y&&Y===E||D&&D===T){q=!0;const K=parseFloat(P.qty!==void 0?P.qty:P.quantity||0),W=parseFloat(P.unitPrice!==void 0?P.unitPrice:P.price||0),V=K*W,X=parseFloat(P.costPrice||0)||t||parseFloat(M?.costPrice||0);B+=K,U+=V,_+=K*X}}),q&&H.add(k.id||k.number||Math.random())});let c=0;Jt.forEach(k=>{if(k.status==="cancelled")return;const R=k.date||k.returnDate||"";if(r&&R&&R<r||e&&R&&R>e)return;(k.lines||k.items||[]).forEach(q=>{const P=q.productId||"",J=(q.productName||q.name||"").trim().toLowerCase(),D=(q.sku||"").trim();if(b&&P===b||E&&E!=="—"&&D&&D===E||J&&J===T){const it=parseFloat(q.qty!==void 0?q.qty:q.quantity||0),K=parseFloat(q.unitPrice!==void 0?q.unitPrice:q.price||0),W=it*K,V=parseFloat(q.costPrice||0)||t||parseFloat(M?.costPrice||0);c+=it,U=Math.max(0,U-W),_=Math.max(0,_-it*V)}})});const L=Math.max(0,v+B-c);let Rt=0,kt=0;Lt.forEach(k=>{if(k.status==="cancelled")return;const R=k.date||k.returnDate||"";if(r&&R&&R<r||e&&R&&R>e)return;(k.lines||k.items||[]).forEach(q=>{const P=q.productId||"",J=(q.productName||q.name||"").trim().toLowerCase(),D=(q.sku||"").trim();if(b&&P===b||E&&E!=="—"&&D&&D===E||J&&J===T){const it=parseFloat(q.qty!==void 0?q.qty:q.quantity||0),K=parseFloat(q.unitPrice!==void 0?q.unitPrice:q.price||0);Rt+=it,kt+=it*K}})});const St=Math.max(0,$-Rt),Tt=Math.max(0,N-kt),vt=H.size,It=U-_,pt=U>0?It/U*100:0,Ft=L>0?U/L:M?.price||0;let at=new Set,Mt=0;Kt.forEach(k=>{const R=k.date||k.quotationDate||"";if(r&&R&&R<r||e&&R&&R>e)return;const Z=k.lines||k.items||[];let q=!1;Z.forEach(P=>{const J=P.productId||"",D=(P.productName||P.name||"").trim().toLowerCase(),Y=(P.sku||"").trim();if(b&&J===b||E&&E!=="—"&&Y&&Y===E||D&&D===T){q=!0;const K=parseFloat(P.qty!==void 0?P.qty:P.quantity||0);Mt+=K}}),q&&at.add(k.id||k.number||Math.random())});const _t=at.size,jt=vt+_t,nt=St>0?L/St*100:0;let ft={type:"normal",label:"اعتيادي",icon:"⚪",color:"#64748b",bg:"#f1f5f9",border:"#cbd5e1"};L===0?ft={type:"stagnant",label:"راكد / لم يُبع",icon:"⚠️",color:"#b45309",bg:"#fef3c7",border:"#fde68a"}:L>0&&pt>=15&&(nt>=40||vt>=3||It>=300)?ft={type:"golden",label:"صنف ذهبي",icon:"🌟",color:"#92400e",bg:"#fef9c3",border:"#facc15"}:nt>=50||vt>=5?ft={type:"fast",label:"سريع الدوران",icon:"⚡",color:"#0369a1",bg:"#e0f2fe",border:"#bae6fd"}:pt>=20&&(ft={type:"high-margin",label:"عالي الهامش",icon:"💎",color:"#0f766e",bg:"#ccfbf1",border:"#99f6e4"});const ut=Et[b]!==void 0?Et[b]:M?._totalQty!==void 0?M._totalQty:M?.totalQty!==void 0?M.totalQty:M?.stockQty||0;!I&&w.quickFilter&&w.quickFilter!=="all"&&(w.quickFilter==="stockout"&&ut>0||w.quickFilter==="low-stock"&&(ut<=0||ut>=10)||w.quickFilter==="has-savings"&&(u.length<=1||d<=0)||w.quickFilter==="fast-moving"&&ft.type!=="fast"&&ft.type!=="golden"||w.quickFilter==="stagnant"&&L>0)||C.push({productKey:l.productId||l.productName,productId:l.productId,productName:l.productName,sku:l.sku,unit:l.unit,suppliers:u,suppliersCount:u.length,totalQty:St,purchasedQty:$,purchaseReturnsQty:Rt,totalAmount:Tt,spendPurchaseReturns:kt,totalPurchases:S,minPrice:a,maxPrice:s,priceSpread:d,avgPurchasePrice:t,salesInvoiceCount:vt,qtySold:L,qtySoldInvoices:v,qtyDeliveredDN:B,qtySalesReturns:c,salesRevenue:U,costOfSales:_,grossProfit:It,marginPct:pt,avgSellingPrice:Ft,quotationsCount:_t,qtyQuoted:Mt,demandCount:jt,sellThroughRate:nt,commercialBadge:ft,currentStock:ut})}),w.activeTab==="purchases-report"){const l=w.sortCol||"totalAmount",$=(w.sortDir||"desc")==="asc"?1:-1;C.sort((N,S)=>l==="productName"?$*(N.productName||"").localeCompare(S.productName||"","ar"):l==="minPrice"?$*(N.minPrice-S.minPrice):l==="maxPrice"?$*(N.maxPrice-S.maxPrice):l==="totalQty"?$*(N.totalQty-S.totalQty):l==="qtySold"?$*(N.qtySold-S.qtySold):l==="currentStock"?$*(N.currentStock-S.currentStock):$*(N.totalAmount-S.totalAmount))}else C.sort((l,u)=>u.totalAmount-l.totalAmount);return C}function xt(){const I=document.getElementById("sph-main-content");if(!I)return;const A=ht(!0),n=ct.find(t=>t.id===w.supplierId),r=n?n.name:"كل الموردين (عرض إجمالي مجمع)",e=A.length,o=A.filter(t=>t.currentStock<=0).length,p=A.filter(t=>t.currentStock>0&&t.currentStock<10).length,f=A.filter(t=>t.suppliersCount>1&&t.priceSpread>0).length,m=A.filter(t=>t.commercialBadge.type==="fast"||t.commercialBadge.type==="golden").length,z=A.filter(t=>t.qtySold===0).length,C=w.quickFilter==="all"?A:A.filter(t=>w.quickFilter==="stockout"?t.currentStock<=0:w.quickFilter==="low-stock"?t.currentStock>0&&t.currentStock<10:w.quickFilter==="has-savings"?t.suppliersCount>1&&t.priceSpread>0:w.quickFilter==="fast-moving"?t.commercialBadge.type==="fast"||t.commercialBadge.type==="golden":w.quickFilter==="stagnant"?t.qtySold===0:!0),l=C.reduce((t,b)=>t+b.totalAmount,0),u=C.reduce((t,b)=>t+b.totalQty,0),$=C.reduce((t,b)=>t+b.qtySold,0),N=C.reduce((t,b)=>t+b.currentStock,0),S=C.reduce((t,b)=>t+b.totalPurchases,0),x=C.length,a=C.filter(t=>t.suppliersCount>1).length,s=C.filter(t=>t.suppliers.some(b=>b.movement==="up")).length;C.filter(t=>t.suppliers.some(b=>b.movement==="down")).length;const d=t=>w.sortCol!==t?'<span style="opacity:0.35; margin-right:3px; font-size:10px;" title="ترتيب">⇅</span>':w.sortDir==="asc"?'<span style="color:#d97706; margin-right:3px; font-size:11px; font-weight:900;" title="مرتب تصاعدياً من الأقل للأعلى">▲</span>':'<span style="color:#d97706; margin-right:3px; font-size:11px; font-weight:900;" title="مرتب تنازلياً من الأعلى للأقل">▼</span>';if(C.length===0){I.innerHTML=`
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🔍</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">لا توجد مشتريات مطابقة لمعايير الفلترة المحددة</div>
        <div style="font-size:12.5px; margin-top:6px;">يرجى تجربة تعديل المورد، الصنف، النطاق الزمني، أو تصفية الحركة.</div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" style="margin-top:16px;">🔄 تفريغ الفلاتر وعرض الكل</button>
      </div>
    `,zt();return}I.innerHTML=`
    <!-- Executive KPI Summary Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <!-- Total Spend -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #faf5ff 0%, #ffffff 100%); border-radius:12px; border:1px solid #e9d5ff; border-top:3px solid #7c3aed;">
        <div style="font-size:11px; color:#6b21a8; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>إجمالي المشتريات</span>
          <span style="font-size:14px;">💰</span>
        </div>
        <div class="mono font-bold" style="font-size:18.5px; color:#581c87; margin-top:4px;">${F(l)}</div>
        <div style="font-size:10px; color:#a855f7; margin-top:2px;">الفترة المحددة</div>
      </div>

      <!-- Total Purchased Quantities -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); border-radius:12px; border:1px solid #bae6fd; border-top:3px solid #0284c7;">
        <div style="font-size:11px; color:#0369a1; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>حركة التوريد والمبيعات</span>
          <span style="font-size:14px;">🔄</span>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span style="background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bae6fd;">
            📥 وارد: ${u.toLocaleString("en-US")}
          </span>
          <span style="background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bbf7d0;">
            🛒 مباع: ${$.toLocaleString("en-US")}
          </span>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">الكميات الإجمالية للحركة</div>
      </div>

      <!-- Total Inventory Stock Balance -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border-radius:12px; border:1px solid #bbf7d0; border-top:3px solid #16a34a;">
        <div style="font-size:11px; color:#15803d; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>رصيد المخزون الفعلي</span>
          <span style="font-size:14px;">📦</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#16a34a; margin-top:4px;">${N.toLocaleString("en-US")}</div>
        <div style="font-size:10px; color:#059669; margin-top:2px;">مطابق 100% للمستودعات والأصناف</div>
      </div>

      <!-- Unique Products Count -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-radius:12px; border:1px solid #e2e8f0; border-top:3px solid #475569;">
        <div style="font-size:11px; color:#334155; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>الأصناف المشتراة</span>
          <span style="font-size:14px;">🏷️</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#1e293b; margin-top:4px;">${x}</div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">صنفاً مجمّعاً في التقرير</div>
      </div>

      <!-- Multi-Supplier items count -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #fffbeb 0%, #ffffff 100%); border-radius:12px; border:1px solid #fde68a; border-top:3px solid #d97706;">
        <div style="font-size:11px; color:#92400e; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>أصناف متعددة الموردين</span>
          <span style="font-size:14px;">⚖️</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#b45309; margin-top:4px;">${a}</div>
        <div style="font-size:10px; color:#d97706; margin-top:2px;">مشتراة من أكثر من مورد لمقارنة السعر</div>
      </div>

      <!-- Price Increases & Decreases -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); border-radius:12px; border:1px solid #fecaca; border-top:3px solid ${s>0?"#dc2626":"#16a34a"};">
        <div style="font-size:11px; color:#991b1b; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>حركة وتقلبات الأسعار</span>
          <span style="font-size:14px;">📊</span>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span style="background:#fee2e2; color:#b91c1c; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #fca5a5;">
            🔺 ${s} ارتفاع
          </span>
          <span style="background:#f0fdf4; color:#15803d; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bbf7d0;">
            🟢 ${x-s} وفر وثبات
          </span>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">مقارنة بآخر سعر شراء سابق</div>
      </div>
    </div>

    <!-- Smart Quick Filter Pills & Auto-Select Bar -->
    <div class="no-print" style="margin-bottom:14px; padding:10px 16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:800; color:var(--text-1); margin-left:4px;">🎯 تصفية سريعة:</span>
        
        <button class="btn btn-sm ${w.quickFilter==="all"?"btn-primary":"btn-secondary"}" onclick="window.sphSetQuickFilter('all')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px;">
          كل الأصناف (${e})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('stockout')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${w.quickFilter==="stockout"?"#dc2626":"#fef2f2"}; color:${w.quickFilter==="stockout"?"#fff":"#dc2626"}; border:1px solid #fca5a5;">
          🔴 نافد المخزون (${o})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('low-stock')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${w.quickFilter==="low-stock"?"#d97706":"#fffbeb"}; color:${w.quickFilter==="low-stock"?"#fff":"#b45309"}; border:1px solid #fde68a;">
          🟡 رصيد منخفض (${p})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('has-savings')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${w.quickFilter==="has-savings"?"#16a34a":"#f0fdf4"}; color:${w.quickFilter==="has-savings"?"#fff":"#15803d"}; border:1px solid #bbf7d0;">
          🟢 فرص وفر أسعار (${f})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('fast-moving')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${w.quickFilter==="fast-moving"?"#0284c7":"#f0f9ff"}; color:${w.quickFilter==="fast-moving"?"#fff":"#0369a1"}; border:1px solid #bae6fd;">
          ⚡ سريع الدوران والطلب (${m})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('stagnant')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${w.quickFilter==="stagnant"?"#475569":"#f8fafc"}; color:${w.quickFilter==="stagnant"?"#fff":"#475569"}; border:1px solid #cbd5e1;">
          ⚠️ أصناف راكدة (${z})
        </button>
      </div>

      <!-- 1-Click Auto Select Stockout Button -->
      <div>
        <button class="btn btn-sm" onclick="window.sphAutoSelectStockout()" style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color:#ffffff; font-weight:900; font-size:11.5px; padding:6px 14px; border:none; border-radius:8px; box-shadow:0 2px 8px rgba(220,38,38,0.3); display:inline-flex; align-items:center; gap:6px; cursor:pointer;" title="تحديد جميع الأصناف التي رصيدها صفر واقتراح كميات الشراء فوراً">
          <span>⚡</span>
          <span>طلب تسعير لكل الأصناف النافذة (Stockout RFQ)</span>
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card" style="overflow:hidden; border-radius:12px; border:1px solid var(--border-soft);">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
            📋 مصفوفة مشتريات الأصناف ومقارنة الموردين الأفقية — <span style="color:#6366f1;">${r}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            انقر على أسهم رأس أي عمود للترتيب الفوري من الأعلى للأدنى والعكس. حدد الأصناف بالـ Checkbox لإصدار طلب عرض سعر رسمي فوري للموردين.
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <!-- Top Action Button when items selected -->
          <div id="sph-top-rfq-actions"></div>
          <span class="badge" style="font-size:12px; font-weight:700; background:var(--bg-2);">
            ${C.length} صنفاً مجمعاً
          </span>
        </div>
      </div>

      <div class="table-container" style="max-height:720px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; width:100%;">
          <thead style="position:sticky; top:0; z-index:2; background:var(--bg-card);">
            <tr>
              <th style="width:36px; text-align:center;">
                <input type="checkbox" id="sph-select-all" onchange="window.sphToggleSelectAll(this.checked)" title="تحديد جميع الأصناف لطلب عرض السعر" style="cursor:pointer; width:15px; height:15px; accent-color:#d97706;" />
              </th>
              <th style="width:32px; text-align:center;">#</th>
              <th style="min-width:180px; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('productName')" title="انقر للترتيب بالاسم">
                الصنف والوحدة ${d("productName")}
              </th>
              <th style="min-width:320px;">الموردين والأسعار (المقارنة المباشرة — تحت كل مورد سعره)</th>
              <th style="width:85px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('minPrice')" title="انقر للترتيب بأدنى سعر">
                أدنى سعر 🥇 ${d("minPrice")}
              </th>
              <th style="width:90px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('maxPrice')" title="انقر للترتيب بأعلى سعر">
                أعلى سعر 🔺 ${d("maxPrice")}
              </th>
              <th style="width:75px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('totalQty')" title="انقر للترتيب بالكمية المشتراة">
                المشتراة 📥 ${d("totalQty")}
              </th>
              <th style="width:75px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('qtySold')" title="انقر للترتيب بالكمية المباعة">
                المباعة 🛒 ${d("qtySold")}
              </th>
              <th style="width:90px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('currentStock')" title="انقر للترتيب برصيد المخزون الفعلي">
                المخزون المتبقي 📦 ${d("currentStock")}
              </th>
              <th style="width:105px; text-align:center;" title="الكمية المطلوبة لتسعير أو توريد الصنف">
                كمية الطلب ✍️
              </th>
              <th style="width:110px; text-align:left; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('totalAmount')" title="انقر للترتيب بإجمالي المشتريات">
                إجمالي المشتريات 💰 ${d("totalAmount")}
              </th>
              <th style="width:65px; text-align:center;" class="no-print">الفواتير</th>
            </tr>
          </thead>
          <tbody>
            ${C.map((t,b)=>{const T=Q.has(t.productKey),E=Q.get(t.productKey)?.reqQty||(t.totalQty>0?Math.round(t.totalQty/(t.suppliers[0]?.purchaseCount||1)):50)||50;let M="#16a34a",H="#f0fdf4",v="#bbf7d0",U="متوفر";return t.currentStock<=0?(M="#dc2626",H="#fef2f2",v="#fecaca",U="نافد 0"):t.currentStock<10&&(M="#d97706",H="#fffbeb",v="#fde68a",U="منخفض"),`
                <tr id="sph-row-${t.productKey}" style="${T?"background:#fefce8 !important; border-right:4px solid #d97706;":""}">
                  <!-- Checkbox Selection -->
                  <td style="text-align:center; vertical-align:middle;">
                    <input type="checkbox" class="sph-row-checkbox" data-prod-key="${t.productKey}" ${T?"checked":""} onchange="window.sphToggleItemSelection('${t.productKey}', this.checked)" style="cursor:pointer; width:16px; height:16px; accent-color:#d97706;" />
                  </td>

                  <!-- Rank -->
                  <td class="mono font-bold" style="text-align:center; color:var(--text-3); font-size:11px;">${b+1}</td>
                  
                  <!-- Product Name, SKU, Unit, Sales & Profit Performance -->
                  <td>
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                      <a href="javascript:void(0)" onclick="window.sphNavigateToProductCompare('${t.productId}')" style="font-weight:800; color:#1e1b4b; font-size:12.5px; text-decoration:none;" title="🔍 انقر للمقارنة وحاسبة الترسية">
                        ${t.productName}
                      </a>
                      ${t.suppliersCount>1?`
                        <span class="badge" style="background:#fef3c7; color:#92400e; font-size:9.5px; font-weight:800; padding:1px 6px; border:1px solid #fde68a; border-radius:4px;">
                          🔄 ${t.suppliersCount} موردين
                        </span>
                      `:""}
                      <span class="badge" style="background:${t.commercialBadge.bg}; color:${t.commercialBadge.color}; border:1px solid ${t.commercialBadge.border}; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:4px;" title="التصنيف التجاري وسرعة الطلب">
                        ${t.commercialBadge.icon} ${t.commercialBadge.label}
                      </span>
                    </div>
                    <div style="font-size:10px; color:var(--text-3); margin-top:2px;">
                      كود: <b class="mono">${t.sku||"—"}</b> | الوحدة: <b style="color:#6366f1;">${t.unit}</b>
                    </div>
                    <!-- Performance Quick Strip -->
                    <div style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:2px 8px; margin-top:4px; font-size:9.5px;">
                      <span>🛒 مبيعات: <b class="mono font-bold" style="color:#0284c7;">${t.qtySold}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>📋 طلب: <b class="mono font-bold" style="color:#6366f1;">${t.demandCount}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>💰 إيراد: <b class="mono font-bold" style="color:#1e1b4b;">${F(t.salesRevenue)}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>📈 ربح: <b class="mono font-bold" style="color:${t.grossProfit>=0?"#16a34a":"#dc2626"};">${F(t.grossProfit)} (${t.marginPct.toFixed(1)}%)</b></span>
                    </div>
                  </td>

                  <!-- Suppliers side-by-side with prices underneath! -->
                  <td style="padding:8px 10px;">
                    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:stretch;">
                      ${t.suppliers.map((_,B)=>{const c=B===0&&t.suppliersCount>1,L=B===t.suppliers.length-1&&t.suppliersCount>1&&_.latestPrice>t.suppliers[0].latestPrice;return`
                          <div style="background:${c?"#f0fdf4":"#f8fafc"}; border:1.5px solid ${c?"#86efac":"#cbd5e1"}; border-radius:8px; padding:6px 10px; min-width:140px; flex:1; max-width:240px; box-shadow:${c?"0 1px 4px rgba(16,185,129,0.15)":"none"};">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; gap:4px;">
                              <span style="font-size:10.5px; font-weight:800; color:${c?"#166534":"#1e1b4b"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${_.supplierName}">
                                ${c?"🥇 ":""}${_.supplierName}
                              </span>
                              ${c?'<span class="badge good" style="font-size:8.5px; padding:0 4px; font-weight:800;">الأرخص</span>':""}
                              ${L?'<span class="badge bad" style="font-size:8.5px; padding:0 4px; font-weight:800;">الأعلى</span>':""}
                            </div>
                            
                            <!-- Price underneath supplier -->
                            <div class="mono font-bold" style="font-size:14px; color:${c?"#15803d":"#1e1b4b"}; margin:2px 0;">
                              ${F(_.latestPrice)}
                            </div>

                            <!-- Purchase frequency, latest date and price trend -->
                            <div style="font-size:9px; color:#64748b; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:2px; margin-top:2px; gap:4px; flex-wrap:wrap;">
                              <span>${_.purchaseCount} مرات (${_.totalQty})</span>
                              ${_.latestDate?`<span style="color:#0284c7; font-weight:700;" title="تاريخ آخر فاتورة شراء من هذا المورد">📅 ${oe(_.latestDate)}</span>`:""}
                              ${_.priceDiff!==0?`
                                <span style="font-weight:700; color:${_.priceDiff>0?"#dc2626":"#16a34a"};">
                                  ${_.priceDiff>0?"🔺 +":"🔻 "}${_.priceDiffPct.toFixed(1)}%
                                </span>
                              `:'<span style="color:#94a3b8;">مستقر</span>'}
                            </div>
                          </div>
                        `}).join("")}
                    </div>
                  </td>

                  <!-- Lowest Price -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#16a34a;">
                    ${F(t.minPrice)}
                  </td>

                  <!-- Highest Price + Savings -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:${t.priceSpread>0?"#dc2626":"#475569"};">
                    ${F(t.maxPrice)}
                    ${t.priceSpread>0?`
                      <div style="font-size:9.5px; color:#059669; font-weight:800; margin-top:2px;">وفر ${F(t.priceSpread)}</div>
                    `:""}
                  </td>

                  <!-- 1. الكمية المشتراة -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#1e1b4b;">
                    ${t.purchasedQty!==void 0?t.purchasedQty:t.totalQty}
                    <div style="font-size:9px; color:#64748b;">${t.unit}</div>
                    ${t.purchaseReturnsQty>0?`
                      <div style="font-size:8.5px; color:#dc2626; margin-top:1px; font-weight:700;" title="تم إرجاعها للمورد بموجب إشعار مدين / مردود مشتريات">
                        ↩️ مرتجع: -${t.purchaseReturnsQty}
                      </div>
                      <div style="font-size:8.5px; color:#059669; font-weight:800;" title="صافي المشتريات الفعلي">
                        صافي: ${t.totalQty}
                      </div>
                    `:""}
                  </td>

                  <!-- 2. الكمية المباعة والمسلمة -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#0284c7;">
                    ${t.qtySold}
                    <div style="font-size:9px; color:#64748b;">${t.unit}</div>
                    ${t.qtyDeliveredDN>0?`
                      <div style="font-size:8.5px; color:#2563eb; background:#eff6ff; border:1px solid #bfdbfe; border-radius:3px; padding:1px 3px; margin-top:2px; font-weight:700;" title="تم تسليمه للعميل بسند استلام / تسليم بضاعة (DN)">
                        📦 ${t.qtyDeliveredDN} بسند تسليم
                      </div>
                    `:""}
                    ${t.qtySalesReturns>0?`
                      <div style="font-size:8.5px; color:#dc2626; margin-top:1px;" title="مرتجع من العميل">
                        (مرتجع: -${t.qtySalesReturns})
                      </div>
                    `:""}
                  </td>

                  <!-- 3. المخزون المتبقي الفعلي -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:13px; color:${M};">
                      ${t.currentStock}
                    </div>
                    <span class="badge" style="background:${H}; color:${M}; border:1px solid ${v}; font-size:9px; font-weight:800; padding:1px 5px; border-radius:4px; display:inline-block; margin-top:1px;">
                      ${U}
                    </span>
                  </td>

                  <!-- 4. خانة كتابة الكمية المطلوبة لعرض السعر -->
                  <td style="text-align:center;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:3px;">
                      <input type="number" class="input" min="1" step="1" value="${E}" style="width:65px; text-align:center; height:28px; font-size:11.5px; font-weight:800; padding:2px; border-color:${T?"#d97706":"var(--border-soft)"}; background:${T?"#fffbeb":"#fff"};" oninput="window.sphUpdateReqQty('${t.productKey}', this.value)" title="حدد الكمية المطلوبة لعرض السعر" />
                      <span style="font-size:9.5px; color:#64748b;">${t.unit}</span>
                    </div>
                  </td>

                  <!-- Total Spend -->
                  <td class="mono font-bold" style="text-align:left; font-size:12.5px; color:#1e1b4b;">
                    ${F(t.totalAmount)}
                  </td>

                  <!-- Actions -->
                  <td style="text-align:center;" class="no-print">
                    <button class="btn btn-secondary" onclick="window.sphOpenProductAllInvoicesModal('${encodeURIComponent(JSON.stringify(t))}')" style="padding:3px 8px; font-size:11px; font-weight:700;" title="عرض سجل كافة الفواتير">
                      👁️ الفواتير
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
          <tfoot style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
            <tr>
              <td colspan="3" style="text-align:right; padding:10px 14px; font-size:12.5px; color:var(--text-0);">
                الإجمالي العام للمشتريات والمخزون المعروض:
              </td>
              <td style="padding:10px 14px; font-size:11.5px; color:#4338ca;">
                مجموع التوريدات: <b>${S}</b> فاتورة عبر كافة الموردين
              </td>
              <td colspan="2"></td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#1e1b4b;">
                ${u.toLocaleString("en-US")}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#0284c7;">
                ${$.toLocaleString("en-US")}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#059669;">
                ${N.toLocaleString("en-US")}
              </td>
              <td></td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; color:#1e1b4b; padding:10px 14px;">
                ${F(l)}
              </td>
              <td class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- RFQ Sticky Action Bar Wrapper -->
      <div id="sph-rfq-bar-wrapper"></div>
    </div>
  `,zt()}function zt(){const I=Q.size,A=document.getElementById("sph-top-rfq-actions");A&&(I>0?A.innerHTML=`
        <button class="btn" onclick="window.sphOpenActionModal()" style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%); color:#ffffff; font-weight:900; font-size:12.5px; padding:7px 16px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(217, 119, 6, 0.45); cursor:pointer;">
          <span style="font-size:15px;">👑</span>
          <span>خيارات وإرسال عرض السعر (${I} أصناف) 🚀</span>
        </button>
      `:A.innerHTML=`
        <span style="font-size:11.5px; color:#92400e; background:#fffbeb; border:1px solid #fde68a; padding:5px 12px; border-radius:8px; display:inline-flex; align-items:center; gap:6px;">
          <span>💡</span> حدد صنفاً أو اكتب كمية لإصدار عرض السعر
        </span>
      `);const n=document.getElementById("sph-rfq-bar-wrapper");n&&(I===0?n.innerHTML=`
        <div style="margin-top:14px; padding:10px 16px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; color:#475569; font-size:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">💡</span>
            <span><b>طلب تسعير وعرض أسعار فوري (RFQ):</b> حدد الأصناف المراد طلب تسعيرها من خلال مربعات الاختيار (☑️) واكتب الكمية المطلوبة لإصدار وطباعة طلب عرض سعر معتمد للموردين بضغطة واحدة.</span>
          </div>
          <button class="btn btn-secondary" onclick="window.sphToggleSelectAll(true)" style="font-size:11.5px; font-weight:700; padding:4px 12px; cursor:pointer;">
            ☑️ تحديد كل الأصناف المعروضة
          </button>
        </div>
      `:n.innerHTML="");let r=document.getElementById("sph-floating-rfq-bar");if(I===0){r&&r.remove();return}r||(r=document.createElement("div"),r.id="sph-floating-rfq-bar",document.body.appendChild(r));let e=0,o=0;Q.forEach(p=>{const f=parseFloat(p.reqQty)||0;e+=f,p.priceSpread>0&&(o+=f*p.priceSpread)}),r.style.cssText="position:fixed !important; bottom:20px !important; left:0 !important; right:0 !important; margin:0 auto !important; width:fit-content !important; max-width:min(1100px, 96vw) !important; z-index:99998 !important; background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important; color:#ffffff !important; padding:10px 22px !important; border-radius:14px !important; border:1.5px solid #d97706 !important; box-shadow:0 14px 40px rgba(0,0,0,0.55), 0 0 20px rgba(217,119,6,0.35) !important; display:flex !important; align-items:center !important; justify-content:space-between !important; gap:16px !important; flex-wrap:nowrap !important; backdrop-filter:blur(16px) !important; transform:none !important; transition:none !important; pointer-events:auto !important; user-select:none !important;",r.innerHTML=`
    <!-- Left side: Summary & Savings -->
    <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
      <div style="background:#d97706; color:#ffffff; padding:5px 12px; border-radius:8px; font-weight:900; font-size:12.5px; display:flex; align-items:center; gap:6px;">
        <span>📋</span>
        <span>تم تحديد <b>${I}</b> أصناف</span>
      </div>
      <div style="font-size:12px; color:#e0e7ff; white-space:nowrap;">
        الكميات: <b class="mono" style="color:#fde68a; font-size:13.5px;">${e.toLocaleString("en-US")}</b>
      </div>
      ${o>0?`
        <div style="font-size:11.5px; color:#86efac; font-weight:800; background:rgba(22,163,74,0.25); border:1px solid rgba(134,239,172,0.4); padding:3px 10px; border-radius:6px; white-space:nowrap;" title="إجمالي الوفر المالي المتحقق عند الشراء من المورد الأرخص">
          💰 وفر: ${F(o)}
        </div>
      `:""}
    </div>

    <!-- Right side: Executive Actions -->
    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
      <!-- Direct Save/Update RFQ in System -->
      <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:${G?"#059669":"#d97706"}; color:#ffffff; font-weight:800; font-size:12px; padding:7px 14px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); white-space:nowrap;" title="حفظ أو تحديث الأصناف في سجل طلبات عروض أسعار الموردين بالنظام">
        <span>💾</span>
        <span>${G?`تحديث الطلب (${G.number})`:`حفظ الطلب بالنظام (${I})`}</span>
      </button>

      <!-- Royal Print RFQ Direct -->
      <button class="btn" onclick="window.printRoyalSupplierRfq()" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:800; font-size:12px; padding:7px 13px; border:1px solid rgba(255,255,255,0.3); border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;" title="طباعة المستند الرسمي PDF لشركة نظم الإمداد المتطوره">
        <span>🖨️</span>
        <span>طباعة PDF</span>
      </button>

      <!-- Open Action Modal -->
      <button class="btn" onclick="window.sphOpenActionModal()" style="background:#4f46e5; color:#ffffff; font-weight:800; font-size:12px; padding:7px 14px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
        <span>👑</span>
        <span>خيارات الإرسال</span>
      </button>

      <!-- Save to RFQ Module -->
      <button class="btn" onclick="window.saveRfqAndNavigate()" style="background:#0284c7; color:#ffffff; font-weight:800; font-size:12px; padding:7px 12px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;" title="الانتقال لشاشة طلبات أسعار الموردين">
        <span>🚀</span>
        <span>شاشة RFQ</span>
      </button>

      <!-- Copy WhatsApp Text -->
      <button class="btn" onclick="window.copyRfqWhatsAppText()" style="background:#16a34a; color:#ffffff; font-weight:800; font-size:12px; padding:7px 12px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
        <span>💬</span>
        <span>واتساب</span>
      </button>

      <!-- Clear Selection -->
      <button class="btn" onclick="window.sphClearRfqSelection()" style="background:transparent; color:#94a3b8; font-weight:700; font-size:11.5px; padding:7px 10px; border:none; cursor:pointer; white-space:nowrap;">
        <span>❌</span>
        <span>إلغاء</span>
      </button>
    </div>
  `}function qt(){const I=document.getElementById("sph-main-content");if(!I)return;const A=document.getElementById("sph-compare-prod")?.value||rt[0]?.id||"",n=rt.find(d=>d.id===A),r=document.getElementById("sph-compare-sup")?.value||"",e=parseFloat(document.getElementById("sph-calc-qty")?.value)||50;if(!n){I.innerHTML=`
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">📦</div>
        <div style="font-size:15px; font-weight:700;">يرجى اختيار صنف من القائمة أعلاه لمقارنة أسعار الموردين</div>
      </div>
    `;return}const o=[];if(Ct.forEach(d=>{r&&d.supplierId!==r||(d.lines||d.items||[]).forEach(t=>{(t.productId===A||t.productName===n.name||t.name===n.name)&&o.push({date:d.date||d.invoiceDate||"",invoiceNumber:d.number||d.invoiceNumber||(d.id?d.id.slice(0,8):"—"),supplierId:d.supplierId,supplierName:d.supplierName||ct.find(b=>b.id===d.supplierId)?.name||"مورد",unit:t.unit||n.unit||"كرتون",qty:parseFloat(t.qty||t.quantity||1),unitPrice:parseFloat(t.unitPrice||t.price||0),total:parseFloat(t.total||(t.qty||1)*(t.unitPrice||0))})})}),o.sort((d,t)=>(d.date||"").localeCompare(t.date||"")),!o.length){I.innerHTML=`
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">🔍</div>
        <div style="font-size:15px; font-weight:700;">لا توجد فواتير شراء مسجلة لهذا الصنف (${n.name})</div>
        <div style="font-size:12px; margin-top:4px;">سعر التكلفة الحالي المسجل في بطاقة الصنف: <b>${F(n.costPrice||n.purchasePrice||0)}</b></div>
      </div>
    `;return}const p=o.map(d=>d.unitPrice),f=Math.min(...p),m=Math.max(...p),z=o[o.length-1].unitPrice,C=p.reduce((d,t)=>d+t,0)/p.length,l={};o.forEach(d=>{l[d.supplierName]||(l[d.supplierName]={name:d.supplierName,prices:[],count:0,totalQty:0,totalAmount:0}),l[d.supplierName].prices.push(d.unitPrice),l[d.supplierName].count+=1,l[d.supplierName].totalQty+=d.qty,l[d.supplierName].totalAmount+=d.total});const u=Object.values(l).map(d=>({name:d.name,minPrice:Math.min(...d.prices),maxPrice:Math.max(...d.prices),avgPrice:d.prices.reduce((t,b)=>t+b,0)/d.prices.length,lastPrice:d.prices[d.prices.length-1],totalPurchasedQty:d.totalQty,totalPurchasedAmount:d.totalAmount,purchasesCount:d.count})).sort((d,t)=>d.lastPrice-t.lastPrice||d.avgPrice-t.avgPrice),$=u[0],N=$.lastPrice||$.avgPrice,S=u[u.length-1],a=(S?S.lastPrice||S.avgPrice:N)-N,s=a*e;I.innerHTML=`
    <!-- Product Header Strip -->
    <div class="card" style="padding:14px 20px; margin-bottom:16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #6366f1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <div style="font-size:16px; font-weight:800; color:var(--text-0);">📦 ${n.name}</div>
        <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
          كود الصنف: <b class="mono">${n.sku||"—"}</b> | الوحدة: <b style="color:#6366f1;">${n.unit||"كرتون"}</b> | سعر التكلفة المعتمد: <b class="mono">${F(n.costPrice||0)}</b>
        </div>
      </div>
      <div style="display:flex; gap:16px; align-items:center;">
        <span class="badge" style="font-size:12.5px; font-weight:800; background:#eef2ff; color:#3730a3; padding:4px 10px;">
          🏢 ${u.length} موردين معتمدين
        </span>
        <span class="badge" style="font-size:12.5px; font-weight:800; background:#ecfdf5; color:#065f46; padding:4px 10px;">
          📑 ${o.length} فاتورة شراء
        </span>
      </div>
    </div>

    <!-- Smart Purchasing Decision Recommendation Banner -->
    ${u.length>1?`
      <div class="card" style="padding:16px 20px; margin-bottom:16px; background:linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%); border:1.5px solid #86efac; border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; box-shadow:0 2px 8px rgba(16,185,129,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="font-size:36px;">💡</div>
          <div>
            <div style="font-size:14px; font-weight:900; color:#166534;">
              توصية الشراء الذكي: الترسية على المورد الأفضل سعراً [ 🥇 ${$.name} ]
            </div>
            <div style="font-size:12px; color:#15803d; margin-top:3px;">
              سعر الوحدة الحالي: <b>${F(N)}</b> | وفر فوري قدره <b>${F(a)}</b> لكل ${n.unit||"كرتون"} مقارنة بالمورد [ ${S.name} ].
            </div>
          </div>
        </div>
        <div style="background:#fff; padding:10px 18px; border-radius:10px; border:1px solid #bbf7d0; text-align:left;">
          <div style="font-size:10px; color:#475569; font-weight:700;">الوفر المالي الصافي لشراء ${e} ${n.unit||"كرتون"}:</div>
          <div class="mono font-bold" style="font-size:20px; color:#16a34a;">${F(s)}</div>
        </div>
      </div>
    `:""}

    <!-- KPI Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">آخر سعر شراء مسجل</div>
        <div class="mono font-bold" style="font-size:20px; color:#6366f1; margin-top:4px;">${F(z)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">بتاريخ: ${o[o.length-1].date||"—"}</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#10B981; font-weight:700;">أقل سعر شراء تاريخي (الأفضل)</div>
        <div class="mono font-bold" style="font-size:20px; color:#10B981; margin-top:4px;">${F(f)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">وفر: ${F(m-f)} عن أعلى سعر</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#EF4444; font-weight:700;">أعلى سعر شراء تاريخي</div>
        <div class="mono font-bold" style="font-size:20px; color:#EF4444; margin-top:4px;">${F(m)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">فارق تذبذب: ${((m-f)/(f||1)*100).toFixed(1)}%</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#8b5cf6; font-weight:700;">أفضل مورد سعراً</div>
        <div class="font-bold" style="font-size:16px; color:#8b5cf6; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          🥇 ${$?.name||"—"}
        </div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">بآخر سعر: <b>${F($?.lastPrice||0)}</b></div>
      </div>
    </div>

    <!-- Visual Bars & Detailed Supplier Ranking -->
    <div style="display:grid; grid-template-columns:1.1fr 1.3fr; gap:16px; margin-bottom:16px;">
      
      <!-- Price Trend Bar Chart -->
      <div class="card" style="padding:18px;">
        <h4 style="margin:0 0 16px; font-size:13.5px; font-weight:800; color:var(--text-0);">
          📈 تدرج أسعار الشراء عبر فواتير المشتريات (آخر ${Math.min(12,o.length)} حركة):
        </h4>
        <div style="display:flex; height:160px; align-items:flex-end; gap:14px; padding:0 10px 10px; border-bottom:1px solid var(--border-soft);">
          ${o.slice(-12).map(d=>{const t=m>0?d.unitPrice/m*100:50,b=d.unitPrice===f,T=d.unitPrice===m,E=b?"#10B981":T?"#EF4444":"#6366f1";return`
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;">
                <div class="mono font-bold" style="font-size:9.5px; color:${E}; margin-bottom:4px;">${d.unitPrice}</div>
                <div style="width:100%; max-width:24px; height:${Math.max(15,t)}%; background:${E}; border-radius:4px 4px 0 0;" title="${d.supplierName} - ${d.date}"></div>
                <div class="mono dim" style="font-size:8.5px; margin-top:6px; white-space:nowrap; transform:rotate(-25deg); transform-origin:top right;">${(d.date||"").slice(5)}</div>
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Complete Supplier Comparison Ranking Table -->
      <div class="card" style="padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-size:13.5px; font-weight:800; color:var(--text-0);">
            🏆 مصفوفة مقارنة كافة الموردين للصنف:
          </h4>
          <span style="font-size:11px; color:#d97706; font-weight:700;">كمية الحساب: ${e} ${n.unit||"كرتون"}</span>
        </div>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:200px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr>
                <th>المورد</th>
                <th style="text-align:left;">آخر سعر</th>
                <th style="text-align:left;">أقل سعر</th>
                <th style="text-align:center;">الفارق عن الأرخص</th>
                <th style="text-align:left;">تكلفة ${e} وحدة</th>
                <th style="text-align:center;">الفواتير</th>
              </tr>
            </thead>
            <tbody>
              ${u.map((d,t)=>{const b=(d.lastPrice||d.avgPrice)-N,T=(d.lastPrice||d.avgPrice)*e;return`
                  <tr style="${t===0?"background:#f0fdf4;":""}">
                    <td>
                      ${t===0?"🥇 ":t===1?"🥈 ":t===2?"🥉 ":""}
                      <b>${d.name}</b>
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${F(d.lastPrice)}</td>
                    <td class="mono font-bold text-good" style="text-align:left;">${F(d.minPrice)}</td>
                    <td style="text-align:center;">
                      ${t===0?'<span class="badge good font-bold">🥇 الأوفر (أساس)</span>':`<span class="badge bad font-bold">+${F(b)}</span>`}
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">
                      ${F(T)}
                    </td>
                    <td class="mono" style="text-align:center;">${d.purchasesCount}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Full History Table for Product -->
    <div class="card">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
          📑 سجل فواتير الشراء التاريخية للصنف: <span style="color:#6366f1;">${n.name}</span>
        </h3>
        <span class="badge" style="font-size:12px;">${o.length} فاتورة مسجلة</span>
      </div>

      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:110px;">رقم الفاتورة</th>
              <th>المورد</th>
              <th style="width:90px;">الوحدة</th>
              <th style="width:90px; text-align:center;">الكمية</th>
              <th style="width:110px; text-align:left;">سعر الوحدة</th>
              <th style="width:120px; text-align:left;">إجمالي البند</th>
              <th style="width:110px; text-align:center;">مقارنة بالمتوسط</th>
            </tr>
          </thead>
          <tbody>
            ${o.map(d=>{const t=C>0?(d.unitPrice-C)/C*100:0,b=t>2,T=t<-2;return`
                <tr>
                  <td class="mono dim">${d.date||"—"}</td>
                  <td class="mono font-bold" style="color:#6366f1;">${d.invoiceNumber}</td>
                  <td class="font-bold">${d.supplierName}</td>
                  <td>${d.unit}</td>
                  <td class="mono" style="text-align:center;">${d.qty}</td>
                  <td class="mono font-bold" style="text-align:left; font-size:13px;">${F(d.unitPrice)}</td>
                  <td class="mono font-bold" style="text-align:left;">${F(d.total)}</td>
                  <td style="text-align:center;">
                    ${T?`<span class="badge good">وفر ${Math.abs(t).toFixed(1)}%</span>`:b?`<span class="badge bad">أعلى ${t.toFixed(1)}%</span>`:'<span class="badge neutral">مطابق</span>'}
                  </td>
                </tr>
              `}).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function At(){const I=document.getElementById("sph-main-content");if(!I)return;const A=ht(),n=ct.find(a=>a.id===w.supplierId),r=n?n.name:"كافة الموردين (عرض مجمّع شامل)",e=w.profitSort||"qty-sold";if(A.length===0){I.innerHTML=`
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🔍</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">لا توجد بيانات مشتريات مطابقة للفلترة الحالية</div>
        <div style="font-size:12.5px; margin-top:6px;">يرجى تجربة تعديل الفلاتر أو المورد المختار.</div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" style="margin-top:16px;">🔄 تفريغ الفلاتر وعرض الكل</button>
      </div>
    `;return}const o=[...A];e==="qty-sold"?o.sort((a,s)=>s.qtySold-a.qtySold||s.grossProfit-a.grossProfit):e==="demand"?o.sort((a,s)=>s.demandCount-a.demandCount||s.qtySold-a.qtySold):e==="gross-profit"?o.sort((a,s)=>s.grossProfit-a.grossProfit||s.marginPct-a.marginPct):e==="margin"?o.sort((a,s)=>s.marginPct-a.marginPct||s.grossProfit-a.grossProfit):e==="golden"?o.sort((a,s)=>{const d=a.commercialBadge.type==="golden"?2:a.commercialBadge.type==="fast"||a.commercialBadge.type==="high-margin"?1:0;return(s.commercialBadge.type==="golden"?2:s.commercialBadge.type==="fast"||s.commercialBadge.type==="high-margin"?1:0)-d||s.grossProfit-a.grossProfit}):e==="stagnant"&&o.sort((a,s)=>a.qtySold-s.qtySold||s.totalQty-a.totalQty);const p=o.reduce((a,s)=>a+s.totalAmount,0),f=o.reduce((a,s)=>a+s.totalQty,0),m=o.reduce((a,s)=>a+s.qtySold,0),z=o.reduce((a,s)=>a+s.salesRevenue,0),C=o.reduce((a,s)=>a+s.grossProfit,0);o.reduce((a,s)=>a+s.costOfSales,0);const l=z>0?C/z*100:0,u=f>0?m/f*100:0,$=o.filter(a=>a.qtySold===0).length,N=o.filter(a=>a.commercialBadge.type==="golden").length,S=[...o].sort((a,s)=>s.qtySold-a.qtySold)[0],x=[...o].sort((a,s)=>s.grossProfit-a.grossProfit)[0];[...o].sort((a,s)=>s.demandCount-a.demandCount)[0],I.innerHTML=`
    <!-- Executive KPI Summary Strip for Sales & Profitability -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <!-- Total Sales Revenue -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #0284c7;">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي إيراد المبيعات (صافي)</div>
        <div class="mono font-bold" style="font-size:20px; color:#0284c7; margin-top:4px;">${F(z)}</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">مبيعات الأصناف المعروضة</div>
      </div>

      <!-- Gross Profit -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #10b981;">
        <div style="font-size:11px; color:#059669; font-weight:700;">مجمل الأرباح المحققة 📈</div>
        <div class="mono font-bold" style="font-size:20px; color:#10b981; margin-top:4px;">${F(C)}</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">الإيراد - تكلفة البضاعة</div>
      </div>

      <!-- Profit Margin % -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #8b5cf6;">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">متوسط هامش الربح الإجمالي</div>
        <div class="mono font-bold" style="font-size:20px; color:#8b5cf6; margin-top:4px;">${l.toFixed(1)}%</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">العائد الموزون على المبيعات</div>
      </div>

      <!-- Quantities & Sell-Through -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #f59e0b;">
        <div style="font-size:11px; color:#d97706; font-weight:700;">الكميات المباعة ومعدل التصريف</div>
        <div class="mono font-bold" style="font-size:19px; color:#d97706; margin-top:4px;">${m.toLocaleString("en-US")} <span style="font-size:12px; font-weight:600; color:var(--text-2);">/ ${f.toLocaleString("en-US")}</span></div>
        <div style="font-size:10.5px; color:#059669; font-weight:700; margin-top:2px;">نسبة التصريف: ${u.toFixed(1)}%</div>
      </div>

      <!-- Top Sold Product -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #6366f1;">
        <div style="font-size:11px; color:#4338ca; font-weight:700;">🥇 الأكثر مبيعاً بالكمية</div>
        <div style="font-size:13px; font-weight:800; color:var(--text-0); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${S?.productName||"—"}">
          ${S?.productName||"—"}
        </div>
        <div class="mono font-bold" style="font-size:11.5px; color:#6366f1; margin-top:2px;">
          ${S?.qtySold||0} ${S?.unit||"كرتون"} (${F(S?.salesRevenue||0)})
        </div>
      </div>

      <!-- Top Profit Product -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #059669;">
        <div style="font-size:11px; color:#047857; font-weight:700;">💎 الأكثر ربحية بالريال</div>
        <div style="font-size:13px; font-weight:800; color:var(--text-0); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${x?.productName||"—"}">
          ${x?.productName||"—"}
        </div>
        <div class="mono font-bold" style="font-size:11.5px; color:#059669; margin-top:2px;">
          ربح: ${F(x?.grossProfit||0)} (${(x?.marginPct||0).toFixed(1)}%)
        </div>
      </div>
    </div>

    <!-- Quick Sorting & Filter Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:var(--bg-card); padding:10px 16px; border-radius:10px; border:1px solid var(--border-soft);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:800; color:var(--text-1);">⚡ الترتيب والتصفية السريعة:</span>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-sm ${e==="qty-sold"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('qty-sold')" style="font-weight:700; font-size:11px;">
          🔥 الأكثر كمية مبيعة
        </button>
        <button class="btn btn-sm ${e==="demand"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('demand')" style="font-weight:700; font-size:11px;">
          📋 الأكثر طلباً (فواتير + عروض)
        </button>
        <button class="btn btn-sm ${e==="gross-profit"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('gross-profit')" style="font-weight:700; font-size:11px;">
          💰 الأكثر ربحية (ر.س)
        </button>
        <button class="btn btn-sm ${e==="margin"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('margin')" style="font-weight:700; font-size:11px;">
          📊 الأعلى هامش ربح %
        </button>
        <button class="btn btn-sm ${e==="golden"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('golden')" style="font-weight:700; font-size:11px;">
          🌟 الأصناف الذهبية (${N})
        </button>
        <button class="btn btn-sm ${e==="stagnant"?"btn-primary":"btn-secondary"}" onclick="window.sphSetProfitSort('stagnant')" style="font-weight:700; font-size:11px;">
          ⚠️ الأصناف الراكدة (${$})
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card" style="overflow:hidden; border-radius:12px; border:1px solid var(--border-soft);">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
            💎 مصفوفة تحليل الطلب والمبيعات والأرباح — <span style="color:#6366f1;">${r}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            تجميع دقيق لمعدلات طلب الأصناف ومبيعاتها الفعلية ومقارنة تكلفة الشراء بسعر البيع لاستخراج الربحية الصافية.
          </div>
        </div>
        <span class="badge" style="font-size:12px; font-weight:700; background:var(--bg-2);">
          ${o.length} صنفاً مشمولاً بالتحليل
        </span>
      </div>

      <div class="table-container" style="max-height:700px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; width:100%;">
          <thead style="position:sticky; top:0; z-index:2; background:var(--bg-card);">
            <tr>
              <th style="width:35px; text-align:center;">#</th>
              <th style="min-width:180px;">الصنف والكود</th>
              <th style="width:110px; text-align:center;">التصنيف التجاري</th>
              <th style="width:130px; text-align:center;">المشتريات والتكلفة</th>
              <th style="width:110px; text-align:center;">حركة الطلب 📋</th>
              <th style="width:140px; text-align:center;">المبيعات والتصريف 🛒</th>
              <th style="width:130px; text-align:left;">إيراد المبيعات</th>
              <th style="width:120px; text-align:left;">مجمل الربح (ر.س)</th>
              <th style="width:95px; text-align:center;">الهامش %</th>
              <th style="min-width:160px; text-align:right;">أرخص مورد متاح</th>
              <th style="min-width:170px;" class="no-print">التوصية التجارية 💡</th>
            </tr>
          </thead>
          <tbody>
            ${o.map((a,s)=>{const d=a.grossProfit>0?"#16a34a":a.grossProfit<0?"#dc2626":"#64748b",t=Math.min(100,Math.max(0,a.sellThroughRate)),b=t>=50?"#10b981":t>=20?"#0284c7":"#f59e0b",T=a.suppliers[0];let E="⚪ أداء اعتيادي متوازن",M="color:#475569;";return a.qtySold===0?(E="⚠️ صنف راكد لم يُبع. نشّط تسويقه أو اعمله ضمن عروض ترويجية لتفادي حبس السيولة.",M="color:#b45309; font-weight:700;"):a.grossProfit<0?(E="🚨 خسارة! يباع بأقل من تكلفة الشراء. ارفع سعر البيع فوراً.",M="color:#dc2626; font-weight:800;"):a.commercialBadge.type==="golden"?(E=`🌟 صنف ذهبي عالي الربحية! ثبّت كمياته واشترِ من [${T?.supplierName||"الأرخص"}] لتعظيم الأرباح.`,M="color:#92400e; font-weight:700;"):a.commercialBadge.type==="fast"?(E=`⚡ سريع الدوران! تصريف ${a.sellThroughRate.toFixed(0)}%. تفاوض لخفض التكلفة مقابل كميات أكبر.`,M="color:#0369a1; font-weight:700;"):a.commercialBadge.type==="high-margin"&&(E=`💎 هامش ممتاز (${a.marginPct.toFixed(1)}%). ركّز المناديب على زيادة توزيعه.`,M="color:#0f766e; font-weight:700;"),`
                <tr>
                  <td class="mono font-bold" style="text-align:center; color:var(--text-3); font-size:11px;">${s+1}</td>
                  
                  <!-- Product Name & Unit -->
                  <td>
                    <div style="font-weight:800; color:#1e1b4b; font-size:12.5px;">
                      <a href="javascript:void(0)" onclick="window.sphNavigateToProductCompare('${a.productId}')" style="color:#1e1b4b; text-decoration:none;" title="🔍 انقر لمقارنة الموردين وحاسبة الترسية">
                        ${a.productName}
                      </a>
                    </div>
                    <div style="font-size:10px; color:var(--text-3); margin-top:2px;">
                      كود: <b class="mono">${a.sku||"—"}</b> | الوحدة: <b style="color:#6366f1;">${a.unit}</b>
                    </div>
                  </td>

                  <!-- Commercial Badge -->
                  <td style="text-align:center;">
                    <span class="badge" style="background:${a.commercialBadge.bg}; color:${a.commercialBadge.color}; border:1px solid ${a.commercialBadge.border}; font-weight:800; font-size:10px; padding:3px 8px; border-radius:6px; display:inline-block;">
                      ${a.commercialBadge.icon} ${a.commercialBadge.label}
                    </span>
                  </td>

                  <!-- Purchases & Unit Cost -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:12px;">${a.totalQty} ${a.unit}</div>
                    <div style="font-size:9.5px; color:#64748b; margin-top:2px;">متوسط: <b>${F(a.avgPurchasePrice)}</b></div>
                    <div style="font-size:9.5px; color:#64748b;">إجمالي: <b class="mono">${F(a.totalAmount)}</b></div>
                  </td>

                  <!-- Demand Frequency -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:13.5px; color:#6366f1;">${a.demandCount}</div>
                    <div style="font-size:9.5px; color:#64748b; margin-top:2px;">
                      ${a.salesInvoiceCount} فاتورة بيع
                    </div>
                    <div style="font-size:9px; color:#94a3b8;">
                      ${a.quotationsCount} عرض أسعار
                    </div>
                  </td>

                  <!-- Sales & Sell-Through Progress -->
                  <td style="text-align:center; padding:8px 10px;">
                    <div class="mono font-bold" style="font-size:13px; color:#0284c7;">
                      ${a.qtySold} ${a.unit}
                    </div>
                    <div style="background:#e2e8f0; border-radius:4px; height:5px; width:100%; margin:4px 0; overflow:hidden;">
                      <div style="background:${b}; height:100%; width:${t}%;"></div>
                    </div>
                    <div style="font-size:9.5px; color:#475569; font-weight:700;">
                      تصريف: <span class="mono">${a.sellThroughRate.toFixed(1)}%</span>
                    </div>
                  </td>

                  <!-- Sales Revenue -->
                  <td class="mono font-bold" style="text-align:left; font-size:12.5px; color:#1e1b4b;">
                    ${F(a.salesRevenue)}
                    <div style="font-size:9.5px; color:#64748b; font-weight:400; margin-top:2px;">متوسط بيع: ${F(a.avgSellingPrice)}</div>
                  </td>

                  <!-- Gross Profit -->
                  <td class="mono font-bold" style="text-align:left; font-size:13px; color:${d};">
                    ${F(a.grossProfit)}
                  </td>

                  <!-- Margin % -->
                  <td style="text-align:center;">
                    <span class="badge" style="background:${a.marginPct>=20?"#dcfce7":a.marginPct>=10?"#e0f2fe":a.marginPct>0?"#fef3c7":"#fee2e2"}; color:${a.marginPct>=20?"#15803d":a.marginPct>=10?"#0369a1":a.marginPct>0?"#92400e":"#b91c1c"}; font-size:11px; font-weight:800; font-family:'IBM Plex Mono', monospace; padding:2px 6px; border-radius:4px;">
                      ${a.marginPct.toFixed(1)}%
                    </span>
                  </td>

                  <!-- Cheapest Supplier & Savings -->
                  <td style="text-align:right;">
                    <div style="font-weight:800; font-size:11px; color:#166534; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${T?.supplierName||""}">
                      🥇 ${T?.supplierName||"—"}
                    </div>
                    <div class="mono font-bold" style="font-size:11.5px; color:#15803d; margin-top:1px;">
                      ${F(a.minPrice)}
                    </div>
                    ${a.priceSpread>0?`
                      <div style="font-size:9px; color:#059669; font-weight:700;">وفر ${F(a.priceSpread)} عن الأعلى</div>
                    `:""}
                  </td>

                  <!-- Commercial Recommendation -->
                  <td style="font-size:10px; line-height:1.35; ${M}" class="no-print">
                    ${E}
                  </td>
                </tr>
              `}).join("")}
          </tbody>
          <tfoot style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
            <tr>
              <td colspan="3" style="text-align:right; padding:10px 14px; font-size:12.5px; color:var(--text-0);">
                الإجمالي العام للأصناف المعروضة:
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px;">
                ${f.toLocaleString("en-US")}
                <div style="font-size:10px; color:#64748b;">${F(p)}</div>
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px; color:#6366f1;">
                ${o.reduce((a,s)=>a+s.demandCount,0)} طلب
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px; color:#0284c7;">
                ${m.toLocaleString("en-US")}
                <div style="font-size:9.5px; color:#059669;">تصريف ${u.toFixed(1)}%</div>
              </td>
              <td class="mono font-bold" style="text-align:left; font-size:13px; color:#1e1b4b; padding:10px 14px;">
                ${F(z)}
              </td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; color:#10b981; padding:10px 14px;">
                ${F(C)}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#8b5cf6;">
                ${l.toFixed(1)}%
              </td>
              <td colspan="2" class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `}function le(){window.sphSwitchTab=n=>{w.activeTab=n;const r=document.getElementById("sph-tab-report"),e=document.getElementById("sph-tab-profit"),o=document.getElementById("sph-tab-compare"),p=document.getElementById("sph-filterbar-report"),f=document.getElementById("sph-filterbar-compare");n!=="purchases-report"&&document.getElementById("sph-floating-rfq-bar")?.remove(),[r,e,o].forEach(m=>{m&&(m.classList.remove("btn-primary"),m.classList.add("btn-secondary"))}),n==="purchases-report"?(r?.classList.add("btn-primary"),r?.classList.remove("btn-secondary"),p?.classList.remove("hidden"),f?.classList.add("hidden"),xt()):n==="sales-profit"?(e?.classList.add("btn-primary"),e?.classList.remove("btn-secondary"),p?.classList.remove("hidden"),f?.classList.add("hidden"),At()):(o?.classList.add("btn-primary"),o?.classList.remove("btn-secondary"),f?.classList.remove("hidden"),p?.classList.add("hidden"),qt())},window.sphSetProfitSort=n=>{w.profitSort=n,At()},window.sphSortTab1=n=>{w.sortCol===n?w.sortDir=w.sortDir==="asc"?"desc":"asc":(w.sortCol=n,w.sortDir=n==="productName"?"asc":"desc"),xt()},window.sphSetQuickFilter=n=>{w.quickFilter=n,xt()},window.sphAutoSelectStockout=()=>{const r=ht(!0).filter(e=>e.currentStock<=0);if(r.length===0){alert("رائع! لا توجد أي أصناف نافذة من المخزون حالياً.");return}r.forEach(e=>{const p=Q.get(e.productKey)?.reqQty||(e.totalQty>0?Math.round(e.totalQty/(e.suppliers[0]?.purchaseCount||1)):50)||50;Q.set(e.productKey,{productKey:e.productKey,productId:e.productId,productName:e.productName,sku:e.sku,unit:e.unit,reqQty:p,currentStock:e.currentStock,minPrice:e.minPrice,priceSpread:e.priceSpread||0,bestSupplier:e.suppliers[0]?.supplierName||""})}),w.quickFilter="stockout",xt()},window.sphToggleItemSelection=(n,r)=>{const e=ht(),o=e.find(m=>m.productKey===n);if(!o)return;if(r){const z=Q.get(n)?.reqQty||(o.totalQty>0?Math.round(o.totalQty/(o.suppliers[0]?.purchaseCount||1)):50)||50;Q.set(n,{productKey:o.productKey,productId:o.productId,productName:o.productName,sku:o.sku,unit:o.unit,reqQty:z,currentStock:o.currentStock,minPrice:o.minPrice,priceSpread:o.priceSpread||0,bestSupplier:o.suppliers[0]?.supplierName||""})}else Q.delete(n);const p=document.querySelector(`.sph-row-checkbox[data-prod-key="${n}"]`);if(p){p.checked=r;const m=p.closest("tr");m&&(r?(m.style.setProperty("background","#fefce8","important"),m.style.borderRight="4px solid #d97706"):(m.style.removeProperty("background"),m.style.borderRight=""))}const f=document.getElementById("sph-select-all");if(f){const m=e.length>0&&e.every(C=>Q.has(C.productKey)),z=e.some(C=>Q.has(C.productKey));f.checked=m,f.indeterminate=!m&&z}zt()},window.sphToggleSelectAll=n=>{const r=ht();n?r.forEach(e=>{const p=Q.get(e.productKey)?.reqQty||(e.totalQty>0?Math.round(e.totalQty/(e.suppliers[0]?.purchaseCount||1)):50)||50;Q.set(e.productKey,{productKey:e.productKey,productId:e.productId,productName:e.productName,sku:e.sku,unit:e.unit,reqQty:p,currentStock:e.currentStock,minPrice:e.minPrice,priceSpread:e.priceSpread||0,bestSupplier:e.suppliers[0]?.supplierName||""})}):Q.clear(),xt()},window.sphUpdateReqQty=(n,r)=>{const e=Math.max(1,parseFloat(r)||1);if(Q.has(n)){const p=Q.get(n);p.reqQty=e}else{const f=ht().find(m=>m.productKey===n);f&&Q.set(n,{productKey:f.productKey,productId:f.productId,productName:f.productName,sku:f.sku,unit:f.unit,reqQty:e,currentStock:f.currentStock,minPrice:f.minPrice,priceSpread:f.priceSpread||0,bestSupplier:f.suppliers[0]?.supplierName||""})}const o=document.querySelector(`.sph-row-checkbox[data-prod-key="${n}"]`);if(o){o.checked=!0;const p=o.closest("tr");p&&(p.style.setProperty("background","#fefce8","important"),p.style.borderRight="4px solid #d97706")}zt()},window.sphClearRfqSelection=()=>{Q.clear(),G=null;try{sessionStorage.removeItem("sph_active_rfq")}catch{}xt()},window.saveOrUpdateRfqToSystem=async(n=!1,r=!1)=>{if(Q.size===0)return n||alert("يرجى تحديد صنف واحد على الأقل أولاً لإصدار أو تحديث طلب التسعير."),null;const e=Array.from(Q.values()),o=new Date().toISOString().slice(0,10),p=e.map(m=>({productId:m.productId||"",productName:m.productName,sku:m.sku||"",unit:m.unit||"Carton",qty:parseFloat(m.reqQty)||1,packQty:1,notes:`أفضل مورد سابق: ${m.bestSupplier||"—"} | أدنى سعر: ${m.minPrice||0} ر.س`,offeredPrice:0})),f=e.reduce((m,z)=>m+(parseFloat(z.reqQty)||0),0);if(!r&&G&&G.id)try{const m={lines:p,items:p,itemCount:e.length,totalRequestedQuantity:f,updatedAt:new Date().toISOString(),updatedBy:$t?.name||$t?.email||"المشتريات"};await te(ot.purchaseRequests(),G.id,m),G.itemCount=e.length;try{sessionStorage.setItem("sph_active_rfq",JSON.stringify(G))}catch{}return zt(),n||(window.showToast?window.showToast(`✅ تم تحديث طلب التسعير [${G.number}] بنجاح ليصبح (${e.length}) أصناف!`,"success",4e3):alert(`✅ تم تحديث طلب عرض الأسعار الحالي برقم [${G.number}] بنجاح ليصبح (${e.length}) أصناف!`)),G.number}catch(m){console.warn("Could not update existing RFQ, will create new instead:",m)}try{const m=`RFQ-${o.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,z={number:m,rfqNumber:m,date:o,requestDate:o,supplierId:"general",supplierName:"طلب تسعير عام للموردين",targetDate:"",status:"draft",type:"supplier_rfq",itemCount:e.length,totalRequestedQuantity:f,lines:p,items:p,notes:"تم إنشاء طلب التسعير من شاشة مصفوفة مشتريات الأصناف ومقارنة الموردين",createdBy:$t?.name||$t?.email||"المشتريات",createdAt:new Date().toISOString()},C=await ee(ot.purchaseRequests(),z);G={id:C?.id||C,number:m,itemCount:e.length};try{sessionStorage.setItem("sph_active_rfq",JSON.stringify(G))}catch{}return zt(),n||(window.showToast?window.showToast(`✅ تم حفظ طلب التسعير الجديد برقم [${m}] (${e.length} صنف)!`,"success",4e3):alert(`✅ تم حفظ طلب عرض الأسعار الجديد برقم [${m}] بنجاح في سجل طلبات الشراء بالنظام! (${e.length} صنف)`)),m}catch(m){return console.error("Error saving RFQ:",m),n||alert("تعذر حفظ الطلب في النظام: "+(m.message||m)),null}},window.printRoyalSupplierRfq=async()=>{if(Q.size===0){alert("يرجى تحديد صنف واحد على الأقل لإصدار وطباعة طلب عرض السعر.");return}const n=await window.saveOrUpdateRfqToSystem(!0,!1);if(!n){alert("تعذر حفظ وتأكيد رقم الطلب في النظام قبل الطباعة.");return}const r=Array.from(Q.values());O||(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})();const e=new Date().toISOString().slice(0,10),o=r.length,p=r.reduce((m,z)=>m+(parseFloat(z.reqQty)||0),0),f=window.open("","_blank");if(!f){alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");return}f.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>طلب عرض أسعار توريد — ${n} — ${O.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 11px; line-height: 1.4; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 290mm; margin: 0 auto; background: #fff; border: 1.5px solid #0f172a; border-radius: 8px; padding: 16px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .royal-title-box h1 { font-size: 19px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
    .royal-title-box h2 { font-size: 12px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 4px; }
    .co-meta { text-align: left; font-size: 10.5px; color: #334155; }
    .co-meta b { color: #0f172a; }
    
    .rfq-info-strip { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-bottom: 12px; }
    .info-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; }
    .info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
    .info-row:last-child { margin-bottom: 0; }
    .supplier-fill-box { border: 1.5px dashed #d97706; background: #fffbeb; border-radius: 6px; padding: 8px 12px; }

    .instructions-bar { background: #eff6ff; border-right: 4px solid #2563eb; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10.5px; color: #1e40af; }

    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1.5px solid #0f172a; font-size: 10px; }
    .royal-table thead { display: table-header-group !important; }
    .royal-table thead tr { background: #0f172a !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 7px 6px; font-size: 9.5px; font-weight: 800; text-align: center; border: 1px solid #334155; }
    .royal-table tbody tr { border-bottom: 1px solid #cbd5e1; page-break-inside: avoid !important; break-inside: avoid !important; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 6px 6px; text-align: center; border: 1px solid #cbd5e1; color: #0f172a; }
    .royal-table tbody td.desc { text-align: right; }
    .royal-table .supplier-cell { background: #fff !important; border: 1.5px dashed #64748b; }

    .conditions-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 9.5px; color: #334155; }
    .conditions-box ul { padding-right: 18px; margin-top: 4px; }
    .conditions-box li { margin-bottom: 2px; }

    .signatures-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; page-break-inside: avoid !important; break-inside: avoid !important; }
    .sig-card { border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; background: #fff; min-height: 80px; }
    .sig-title { font-weight: 800; color: #0f172a; font-size: 10.5px; margin-bottom: 6px; }
    .sig-line { font-size: 9.5px; color: #475569; margin-top: 6px; }

    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }

    @media print {
      body { background: #fff; padding: 0; font-size: 10px; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #0f172a !important; box-shadow: none !important; padding: 4px !important; max-width: 100% !important; border-radius: 0 !important; }
      tr, .sig-card, .info-card, .supplier-fill-box { page-break-inside: avoid !important; break-inside: avoid !important; }
      @page { size: A4 portrait; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()" style="background:#0f172a; color:#fff;">🖨️ طباعة المستند الرسمي (Ctrl+P)</button>
    <button class="btn" onclick="window.close()" style="background:#ef4444; color:#fff;">إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>${O.name||"شركة نظم الإمداد المتطوره"}</h1>
        <h2>طلب عرض أسعار توريد (Request For Quotation - RFQ)</h2>
        <div class="gold-pill">وثيقة استدراج أسعار رسمية معتمدة</div>
      </div>
      <div class="co-meta">
        <div><b>رقم الطلب:</b> <span class="mono font-bold" style="color:#d97706; font-size:12.5px;">${n}</span></div>
        <div><b>التاريخ:</b> ${e}</div>
        <div><b>س.ت:</b> <span class="mono font-bold">${O.crNumber||"7054969006"}</span></div>
        <div><b>الرقم الضريبي:</b> <span class="mono font-bold">${O.vatNumber||"314996148100003"}</span></div>
        <div><b>جوال / هاتف:</b> <span class="mono font-bold">${O.phone||"0549141648"}</span></div>
      </div>
    </div>

    <div class="rfq-info-strip">
      <div class="supplier-fill-box">
        <div class="info-row">
          <span><b>المكرم السادة الموردين:</b></span>
          <span style="color:#64748b;">(شركة / مؤسسة: ____________________________________)</span>
        </div>
        <div class="info-row" style="margin-top:4px;">
          <span><b>عناية السيد:</b> _________________________</span>
          <span><b>هاتف / جوال:</b> _________________________</span>
        </div>
      </div>
      <div class="info-card">
        <div class="info-row">
          <span>عدد الأصناف المطلوبة:</span>
          <b class="mono font-bold">${o} صنف</b>
        </div>
        <div class="info-row">
          <span>إجمالي الكميات:</span>
          <b class="mono font-bold" style="color:#0f172a;">${p.toLocaleString("en-US")} وحدة</b>
        </div>
        <div class="info-row">
          <span>الموقع / المستودع:</b></span>
          <span>مستودعات شركة نظم الإمداد المتطوره — ينبع</span>
        </div>
      </div>
    </div>

    <div class="instructions-bar">
      📌 <b>تنبيه هام للسادة الموردين:</b> يرجى التكرم بتعبئة الأسعار المقترحة للوحدة وموعد التوريد وتوضيح أي شروط إضافية، وإعادة إرسال هذا النموذج بعد توقيعه وختمه رسمياً لاعتماده والبدء بإصدار أمر الشراء.
    </div>

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:30px;">م</th>
          <th style="width:90px;">كود الصنف</th>
          <th style="width:220px;">اسم الصنف والبيان التفصيلي</th>
          <th style="width:65px;">الوحدة</th>
          <th style="width:85px;">الكمية المطلوبة</th>
          <th style="width:110px;">سعر الوحدة المقترح<br/>(غير شامل الضريبة)</th>
          <th style="width:65px;">ضريبة %</th>
          <th style="width:115px;">الإجمالي المقترح<br/>(شامل الضريبة)</th>
          <th style="width:110px;">مدة التوريد وملاحظات</th>
        </tr>
      </thead>
      <tbody>
        ${r.map((m,z)=>`
          <tr>
            <td class="mono font-bold">${z+1}</td>
            <td class="mono font-bold" style="color:#475569;">${m.sku||"—"}</td>
            <td class="desc">
              <div class="font-bold" style="font-size:11px;">${m.productName}</div>
            </td>
            <td><b>${m.unit}</b></td>
            <td class="mono font-bold" style="font-size:12px; color:#0f172a; background:#f0fdf4;">${m.reqQty}</td>
            <td class="supplier-cell mono" style="font-size:11px; color:#475569;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ر.س ]</td>
            <td class="mono">15%</td>
            <td class="supplier-cell mono" style="font-size:11px; color:#475569;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ر.س ]</td>
            <td class="supplier-cell" style="font-size:9.5px; color:#64748b;"></td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a;">
        <tr>
          <td colspan="4" style="text-align:right; padding:6px 10px;">إجمالي بنود طلب التسعير:</td>
          <td class="mono font-bold" style="font-size:12px; color:#0f172a;">${p.toLocaleString("en-US")}</td>
          <td colspan="4" style="text-align:left; padding:6px 10px; color:#64748b; font-size:9.5px;">(يُدون الإجمالي الكلي المقترح من واقع تسعير المورد)</td>
        </tr>
      </tfoot>
    </table>

    <div class="conditions-box">
      <b>📋 الشروط والأحكام العامة للتوريد:</b>
      <ul>
        <li>الأسعار المقدمة يجب أن تكون شاملة لكافة تكاليف الشحن والتوصيل والتفريغ بمستودعات ${O.name||"شركة نظم الإمداد المتطوره"}.</li>
        <li>صلاحية عرض السعر المقدم يجب ألا تقل عن (15) يوماً تقويمياً من تاريخ تقديمه.</li>
        <li>يجب أن تكون المنتجات الغذائية مطابقة لكافة اشتراطات الهيئة العامة للغذاء والدواء (SFDA) مع توفر مدة صلاحية لا تقل عن ثلثي المدة الكلية.</li>
        <li>في حال الترسية والاعتماد، سيتم إصدار أمر شراء رسمي (PO) مرتبط بهذا العرض.</li>
      </ul>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ جهة إصدار الطلب — ${O.name||"شركة نظم الإمداد المتطوره"}</div>
        <div class="sig-line">مسؤول المشتريات: ___________________________</div>
        <div class="sig-line">التوقيع والاعتماد: ___________________________</div>
        <div class="sig-line">التاريخ: ${e}</div>
      </div>

      <div class="sig-card" style="border-color:#d97706; background:#fffbeb;">
        <div class="sig-title" style="color:#b45309;">✍️ اعتماد وقبول المورد (المفوض بالتسعير)</div>
        <div class="sig-line">اسم المفوض: _______________________________</div>
        <div class="sig-line">التوقيع وختم المورد الرسمي: __________________</div>
        <div class="sig-line">مدة صلاحية الأسعار: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`),f.document.close()},window.copyRfqWhatsAppText=()=>{if(Q.size===0){alert("يرجى تحديد صنف واحد على الأقل.");return}const n=Array.from(Q.values()),r=new Date().toISOString().slice(0,10),e=G?.number||`RFQ-${r.replace(/-/g,"")}-${Math.floor(100+Math.random()*900)}`;let o=`*طلب عرض أسعار توريد (RFQ)* 📦
`;o+=`*${O.name||"شركة نظم الإمداد المتطوره"}*
`,o+=`رقم الطلب: ${e}
`,o+=`التاريخ: ${r}
`,o+=`س.ت: ${O.crNumber||"7054969006"} | الرقم الضريبي: ${O.vatNumber||"314996148100003"}
`,o+=`جوال / هاتف: ${O.phone||"0549141648"}
`,o+=`------------------------------------
`,o+=`السادة الموردين الكرام،
`,o+=`يرجى التكرم بتسعير الأصناف والكميات المطلوبة أدناه مع بيان مدة التوريد وصلاحية الأسعار:

`,n.forEach((p,f)=>{o+=`${f+1}) *${p.productName}*
`,o+=`   - الكمية المطلوبة: *${p.reqQty}* ${p.unit}
`,p.sku&&p.sku!=="—"&&(o+=`   - كود الصنف: ${p.sku}
`)}),o+=`
------------------------------------
`,o+=`📍 التسليم: مستودعات ${O.name||"شركة نظم الإمداد المتطوره"} — ينبع
`,o+=`شاكرين ومقدرين حسن وسرعة تعاونكم.
`,o+=`*إدارة المشتريات — ${O.name||"شركة نظم الإمداد المتطوره"}*`,navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(o).then(()=>{alert(`✅ تم نسخ نص طلب عرض الأسعار بنجاح!
يمكنك الآن لصقه مباشرة في محادثة الواتساب مع المورد.`)}).catch(()=>{prompt("يرجى نسخ النص التالي:",o)}):prompt("يرجى نسخ النص التالي:",o)},window.saveRfqToSystem=async()=>await window.saveOrUpdateRfqToSystem(!1,!1),window.sphCloseActionModal=()=>{const n=document.getElementById("sph-action-modal");n&&(n.classList.remove("active"),n.classList.add("hidden"),n.style.display="none")},window.saveRfqAndNavigate=async()=>{if(Q.size===0){alert("يرجى تحديد صنف واحد على الأقل.");return}await window.saveOrUpdateRfqToSystem(!0,!1)&&(window.sphCloseActionModal(),location.hash="#purchase-requests")},window.transferToSalesQuotations=()=>{if(Q.size===0){alert("يرجى تحديد صنف واحد على الأقل.");return}const r=Array.from(Q.values()).map(e=>({productId:e.productId||"",productName:e.productName,unit:e.unit||"Carton",qty:parseFloat(e.reqQty)||1,price:e.minPrice>0?Math.round(e.minPrice*1.15*100)/100:0}));try{sessionStorage.setItem("idham_prefilled_quote_lines",JSON.stringify(r))}catch{}window.sphCloseActionModal(),alert(`✅ تم تجهيز (${r.length}) أصناف بنجاح لعرض السعر!
جاري الانتقال لشاشة عروض أسعار المبيعات...`),location.hash="#quotations"},window.sphOpenActionModal=()=>{if(Q.size===0){alert("يرجى تحديد صنف واحد على الأقل أولاً بالـ Checkbox.");return}const n=Array.from(Q.values()),r=n.length,e=n.reduce((f,m)=>f+(parseFloat(m.reqQty)||0),0);let o=document.getElementById("sph-action-modal");o||(o=document.createElement("div"),o.id="sph-action-modal",o.className="modal-overlay active",document.body.appendChild(o)),o.style.cssText="position:fixed; inset:0; background:rgba(15,23,42,0.75); z-index:999999; display:flex !important; align-items:center; justify-content:center; padding:16px; opacity:1 !important; visibility:visible !important; pointer-events:auto !important; backdrop-filter:blur(4px);",o.classList.add("active"),o.classList.remove("hidden"),o.onclick=f=>{f.target===o&&window.sphCloseActionModal()};const p=G?`
      <div style="background:#ecfdf5; border:1.5px solid #86efac; border-radius:10px; padding:10px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="font-size:12px; color:#166534; font-weight:800; display:flex; align-items:center; gap:6px;">
          <span>🟢</span>
          <span>الطلب محفوظ ومسجل بالنظام برقم: <b class="mono" style="color:#0f172a; font-size:13px;">${G.number}</b> (يحتوي حالياً على ${r} أصناف)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:#059669; color:#fff; font-size:11.5px; font-weight:800; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <span>💾</span> <span>تحديث التعديلات الحالية</span>
          </button>
          <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, true)" style="background:#d97706; color:#fff; font-size:11.5px; font-weight:800; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <span>➕</span> <span>حفظ كطلب جديد برقم جديد</span>
          </button>
        </div>
      </div>
    `:`
      <div style="background:#fefce8; border:1.5px solid #fde047; border-radius:10px; padding:10px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="font-size:12px; color:#854d0e; font-weight:800; display:flex; align-items:center; gap:6px;">
          <span>🟡</span>
          <span>مسودة طلب تسعير جديدة — تم تحديد ${r} أصناف (لم تُحفظ بعد في سجل مشتريات النظام)</span>
        </div>
        <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:#d97706; color:#fff; font-size:11.5px; font-weight:800; padding:5px 14px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
          <span>💾</span> <span>حفظ الطلب الآن بالنظام</span>
        </button>
      </div>
    `;o.innerHTML=`
      <div class="modal modal-lg" onclick="event.stopPropagation()" style="max-width:860px; width:100%; border-radius:16px; overflow:hidden; border:1px solid var(--border-soft); box-shadow:0 25px 70px rgba(0,0,0,0.45); animation:modalIn 0.2s ease;">
        <div class="modal-header" style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#ffffff; padding:16px 22px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 class="modal-title" style="color:#ffffff; font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px;">
              <span>👑</span>
              <span>خيارات إصدار وإرسال طلب عرض الأسعار للمشتريات (RFQ)</span>
            </h3>
            <div style="font-size:11.5px; color:#e0e7ff; margin-top:2px;">
              تم تحديد <b style="color:#fde68a;">${r}</b> أصناف بإجمالي كميات <b style="color:#fde68a;">${e.toLocaleString("en-US")}</b>
            </div>
          </div>
          <button class="modal-close" onclick="window.sphCloseActionModal()" style="color:#ffffff; opacity:0.8; font-size:22px; cursor:pointer; background:none; border:none;">×</button>
        </div>

        <div class="modal-body" style="padding:18px 22px; max-height:75vh; overflow-y:auto; background:var(--bg-1);">
          <!-- Dynamic Persistence Status Banner -->
          ${p}

          <!-- 4 Executive Action Cards -->
          <div style="margin-bottom:18px;">
            <div style="font-size:12.5px; font-weight:800; color:var(--text-1); margin-bottom:10px;">اختر الإجراء أو طريقة الإرسال المناسبة:</div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:12px;">
              <!-- 1. Royal PDF -->
              <div onclick="window.printRoyalSupplierRfq()" style="background:#fff; border:1.5px solid #d97706; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(217,119,6,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">👑</div>
                <div style="font-size:13px; font-weight:900; color:#92400e;">طباعة PDF ملكية رسمية</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">وثيقة استدراج أسعار معتمدة باسم شركة نظم الإمداد المتطوره مع حفظ تلقائي فوري بالنظام.</div>
                <button class="btn" style="background:#d97706; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">🖨️ فتح المستند الملكي</button>
              </div>

              <!-- 2. Transfer to RFQ Module -->
              <div onclick="window.saveRfqAndNavigate()" style="background:#fff; border:1.5px solid #4f46e5; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(79,70,229,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">🚀</div>
                <div style="font-size:13px; font-weight:900; color:#3730a3;">شاشة طلبات التسعير (RFQ)</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">حفظ أو تحديث الطلب فوراً والانتقال لشاشة RFQ لمتابعة عروض الموردين وإدخال الأسعار.</div>
                <button class="btn" style="background:#4f46e5; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">📦 حفظ وفتح شاشة RFQ</button>
              </div>

              <!-- 3. WhatsApp Direct Text -->
              <div onclick="window.copyRfqWhatsAppText()" style="background:#fff; border:1.5px solid #16a34a; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(22,163,74,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">💬</div>
                <div style="font-size:13px; font-weight:900; color:#166534;">إرسال فوري بالواتساب</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">نسخ رسالة منسقة وجاهزة باسم شركة نظم الإمداد المتطوره للإرسال المباشر للمورد.</div>
                <button class="btn" style="background:#16a34a; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">📋 نسخ نص الواتساب</button>
              </div>

              <!-- 4. Transfer to Sales Quotations -->
              <div onclick="window.transferToSalesQuotations()" style="background:#fff; border:1.5px solid #0284c7; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(2,132,199,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">📑</div>
                <div style="font-size:13px; font-weight:900; color:#075985;">عرض سعر بيع للعملاء</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">تجهيز الأصناف والكميات كعرض سعر بيع للعملاء (المشترين) والانتقال لشاشة عروض الأسعار.</div>
                <button class="btn" style="background:#0284c7; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">💼 تجهيز عرض سعر مبيعات</button>
              </div>
            </div>
          </div>

          <!-- Review Selected Items Table -->
          <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--border-soft); border-radius:10px;">
            <div style="padding:10px 16px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:800; color:var(--text-1);">📋 مراجعة وتعديل كميات الأصناف المحددة:</span>
              <button onclick="window.sphClearRfqSelection(); window.sphCloseActionModal();" style="background:none; border:none; color:#dc2626; font-size:11px; font-weight:700; cursor:pointer;">❌ تفريغ التحديد بالكامل</button>
            </div>
            <div style="max-height:260px; overflow-y:auto;">
              <table class="data-dense" style="margin:0; width:100%;">
                <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>اسم الصنف</th>
                    <th style="width:80px; text-align:center;">الوحدة</th>
                    <th style="width:90px; text-align:center;">المخزون الحالي</th>
                    <th style="width:150px;">أفضل مورد سابق</th>
                    <th style="width:110px; text-align:center;">الكمية المطلوبة ✍️</th>
                    <th style="width:40px; text-align:center;">حذف</th>
                  </tr>
                </thead>
                <tbody>
                  ${n.map((f,m)=>`
                    <tr>
                      <td style="text-align:center; color:var(--text-3);">${m+1}</td>
                      <td>
                        <div style="font-weight:800; font-size:12px; color:#1e1b4b;">${f.productName}</div>
                        ${f.sku&&f.sku!=="—"?`<div style="font-size:9.5px; color:var(--text-3);">كود: ${f.sku}</div>`:""}
                      </td>
                      <td style="text-align:center; font-size:11px; color:var(--text-2);">${f.unit}</td>
                      <td style="text-align:center;" class="mono font-bold">${f.currentStock}</td>
                      <td style="font-size:11px; color:#475569;">
                        <div>${f.bestSupplier||"—"}</div>
                        <div class="mono" style="font-size:10px; color:#16a34a; font-weight:700;">أدنى سعر: ${F(f.minPrice)}</div>
                      </td>
                      <td style="text-align:center;">
                        <input type="number" class="input" min="1" step="1" value="${f.reqQty}" 
                               style="width:75px; text-align:center; height:28px; font-weight:900; color:#d97706; border:1.5px solid #d97706; background:#fffbeb; border-radius:6px;"
                               onchange="window.sphUpdateReqQty('${f.productKey}', this.value); window.sphOpenActionModal();" />
                      </td>
                      <td style="text-align:center;">
                        <button onclick="window.sphToggleItemSelection('${f.productKey}', false); window.sphOpenActionModal();" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;" title="إزالة من القائمة">🗑️</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding:12px 20px; background:#fff; border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:var(--text-2);">
            💡 يمكنك تعديل أي كمية مباشرة في الجدول أعلاه وسيتم تحديثها فوراً في المستند وطلب التسعير.
          </div>
          <button class="btn btn-secondary" onclick="window.sphCloseActionModal()">إغلاق</button>
        </div>
      </div>
    `,o.classList.add("active"),o.classList.remove("hidden"),o.style.display="flex"},window.sphOnCompareSearch=n=>{const r=document.getElementById("sph-compare-prod");if(!r)return;const e=(n||"").trim().toLowerCase(),o=rt.filter(p=>{const f=(p.name||"").toLowerCase().includes(e),m=(p.sku||"").toLowerCase().includes(e);return f||m});r.innerHTML=`<option value="">-- نتائج البحث (${o.length} صنف) --</option>`+o.map(p=>`<option value="${p.id}">${p.name} (${p.unit||"كرتون"})</option>`).join(""),o.length>0&&(r.value=o[0].id,qt())},window.sphNavigateToProductCompare=n=>{window.sphSwitchTab("product-compare");const r=document.getElementById("sph-compare-prod");r&&n&&(r.value=n,qt())},window.sphOnFilterChange=()=>{w.supplierId=document.getElementById("sph-filter-sup")?.value||"",w.productId=document.getElementById("sph-filter-prod")?.value||"",w.dateFrom=document.getElementById("sph-filter-date-from")?.value||"",w.dateTo=document.getElementById("sph-filter-date-to")?.value||"",w.trend=document.getElementById("sph-filter-trend")?.value||"all",w.search=document.getElementById("sph-filter-search")?.value||"",w.activeTab==="sales-profit"?At():xt()},window.sphResetFilters=()=>{w.supplierId="",w.productId="",w.dateFrom="",w.dateTo="",w.trend="all",w.search="";const n=document.getElementById("sph-filter-sup"),r=document.getElementById("sph-filter-prod"),e=document.getElementById("sph-filter-date-from"),o=document.getElementById("sph-filter-date-to"),p=document.getElementById("sph-filter-trend"),f=document.getElementById("sph-filter-search");n&&(n.value=""),r&&(r.value=""),e&&(e.value=""),o&&(o.value=""),p&&(p.value="all"),f&&(f.value=""),w.activeTab==="sales-profit"?At():xt()},window.sphOnCompareProductChange=n=>{qt()},window.sphRenderCompareView=()=>{qt()},window.sphTriggerActivePrint=()=>{w.activeTab==="product-compare"?window.printRoyalProductCompare():w.activeTab==="sales-profit"?window.printRoyalSalesProfitability():window.printRoyalSupplierPurchases()},window.sphOpenProductAllInvoicesModal=n=>{try{const r=JSON.parse(decodeURIComponent(n)),e=document.getElementById("sph-modal"),o=document.getElementById("sph-modal-title"),p=document.getElementById("sph-modal-body");if(!e||!p)return;o.innerHTML=`
        <div style="font-size:14px;">
          <span>📦 ${r.productName}</span> 
          <span style="color:#6366f1; margin:0 8px;">—</span> 
          <span style="color:#4338ca;">(${r.suppliersCount} موردين)</span>
        </div>
      `;const f=[];r.suppliers.forEach(l=>{l.invoices.forEach(u=>{f.push({...u,supplierName:l.supplierName})})}),f.sort((l,u)=>(u.date||"").localeCompare(l.date||""));const m=[];Lt.forEach(l=>{l.status!=="cancelled"&&(l.lines||l.items||[]).forEach(u=>{(r.productId&&u.productId===r.productId||r.sku&&r.sku!=="—"&&u.sku===r.sku||u.productName&&u.productName===r.productName)&&m.push({number:l.number||"مرتجع",date:l.date||"",supplierName:l.supplierName||"المورد",qty:parseFloat(u.qty||0),price:parseFloat(u.unitPrice||0),total:parseFloat(u.total||u.qty*u.unitPrice||0)})})});const z=[];Bt.forEach(l=>{l.status!=="cancelled"&&(l.lines||l.items||[]).forEach(u=>{(r.productId&&u.productId===r.productId||r.sku&&r.sku!=="—"&&u.sku===r.sku||u.productName&&u.productName===r.productName)&&z.push({number:l.number||"سند تسليم",date:l.date||"",customerName:l.customerName||"العميل",qty:parseFloat(u.qty||0),price:parseFloat(u.unitPrice||0),total:parseFloat(u.total||u.qty*u.unitPrice||0)})})});const C=[];Dt.forEach(l=>{l.status!=="cancelled"&&(l.lines||l.items||[]).forEach(u=>{(r.productId&&u.productId===r.productId||r.sku&&r.sku!=="—"&&u.sku===r.sku||u.productName&&u.productName===r.productName)&&C.push({number:l.number||l.invoiceNumber||"فاتورة",date:l.date||"",customerName:l.customerName||"العميل",qty:parseFloat(u.qty||0),price:parseFloat(u.unitPrice||0),total:parseFloat(u.total||u.qty*u.unitPrice||0)})})}),p.innerHTML=`
        <!-- KPI Summary Ribbon -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:8px;">
          <div><div style="font-size:10px; color:var(--text-3);">المشتراة الإجمالية:</div><b class="mono font-bold" style="color:#1e1b4b;">${r.purchasedQty||r.totalQty} ${r.unit}</b></div>
          ${m.length>0?`<div><div style="font-size:10px; color:#dc2626;">المرتجع للمورد:</div><b class="mono font-bold" style="color:#dc2626;">-${r.purchaseReturnsQty||m.reduce((l,u)=>l+u.qty,0)} ${r.unit}</b></div>`:""}
          <div><div style="font-size:10px; color:#0284c7;">المباعة والمسلّمة:</div><b class="mono font-bold" style="color:#0284c7;">${r.qtySold} ${r.unit}</b></div>
          <div><div style="font-size:10px; color:#059669;">المخزون بالمستودع:</div><b class="mono font-bold" style="color:${r.currentStock>0?"#16a34a":"#dc2626"};">${r.currentStock} ${r.unit}</b></div>
          <div><div style="font-size:10px; color:var(--text-3);">صافي قيمة الشراء:</div><b class="mono font-bold" style="color:#1e1b4b;">${F(r.totalAmount)}</b></div>
        </div>

        <!-- 1. Purchase Invoices Section -->
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
            <span>📥</span> فواتير التوريد من الموردين (${f.length} فاتورة)
          </h4>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0; width:100%;">
              <thead>
                <tr>
                  <th style="width:30px; text-align:center;">#</th>
                  <th>التاريخ</th>
                  <th>رقم الفاتورة</th>
                  <th>المورد</th>
                  <th style="text-align:center;">الكمية</th>
                  <th style="text-align:left;">سعر الوحدة</th>
                  <th style="text-align:left;">إجمالي الفاتورة</th>
                </tr>
              </thead>
              <tbody>
                ${f.map((l,u)=>`
                  <tr>
                    <td class="mono" style="text-align:center; color:var(--text-3);">${u+1}</td>
                    <td class="mono font-bold">${l.date||"—"}</td>
                    <td class="mono font-bold" style="color:#6366f1;">${l.invoiceNumber}</td>
                    <td class="font-bold" style="color:#1e1b4b;">${l.supplierName}</td>
                    <td class="mono font-bold" style="text-align:center;">${l.qty}</td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${F(l.unitPrice)}</td>
                    <td class="mono font-bold" style="text-align:left;">${F(l.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Purchase Returns Section (if any) -->
        ${m.length>0?`
          <div style="margin-bottom:16px; background:#fff5f5; border:1px solid #fed7d7; border-radius:8px; padding:10px;">
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#c53030; display:flex; align-items:center; gap:6px;">
              <span>↩️</span> مرتجعات المشتريات المعادة للموردين (إشعارات مدينة - خصم من المخزون والتكلفة)
            </h4>
            <table class="data-dense" style="margin:0; width:100%; background:#fff;">
              <thead>
                <tr style="background:#fed7d7; color:#742a2a;">
                  <th>#</th><th>التاريخ</th><th>رقم السند</th><th>المورد</th><th style="text-align:center;">الكمية المرتجعة</th><th style="text-align:left;">سعر الوحدة</th><th style="text-align:left;">المبلغ المسترد</th>
                </tr>
              </thead>
              <tbody>
                ${m.map((l,u)=>`
                  <tr>
                    <td class="mono" style="text-align:center;">${u+1}</td>
                    <td class="mono font-bold">${l.date||"—"}</td>
                    <td class="mono font-bold" style="color:#e53e3e;">${l.number}</td>
                    <td class="font-bold">${l.supplierName}</td>
                    <td class="mono font-bold" style="text-align:center; color:#e53e3e;">-${l.qty}</td>
                    <td class="mono" style="text-align:left;">${F(l.price)}</td>
                    <td class="mono font-bold" style="text-align:left; color:#e53e3e;">-${F(l.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `:""}

        <!-- 3. Delivery Notes Section (if any) -->
        ${z.length>0?`
          <div style="margin-bottom:16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:10px;">
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#0369a1; display:flex; align-items:center; gap:6px;">
              <span>📦</span> سندات تسليم البضاعة للعملاء (أذون صرف وتسليم فورية خفضت رصيد المستودع)
            </h4>
            <table class="data-dense" style="margin:0; width:100%; background:#fff;">
              <thead>
                <tr style="background:#e0f2fe; color:#0369a1;">
                  <th>#</th><th>التاريخ</th><th>رقم السند</th><th>العميل المستلم</th><th style="text-align:center;">الكمية المسلّمة</th><th style="text-align:left;">سعر الوحدة</th><th style="text-align:left;">إجمالي القيمة</th>
                </tr>
              </thead>
              <tbody>
                ${z.map((l,u)=>`
                  <tr>
                    <td class="mono" style="text-align:center;">${u+1}</td>
                    <td class="mono font-bold">${l.date||"—"}</td>
                    <td class="mono font-bold" style="color:#0284c7;">${l.number}</td>
                    <td class="font-bold">${l.customerName}</td>
                    <td class="mono font-bold" style="text-align:center; color:#0284c7;">${l.qty}</td>
                    <td class="mono" style="text-align:left;">${F(l.price)}</td>
                    <td class="mono font-bold" style="text-align:left;">${F(l.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `:""}

        <!-- 4. Sales Invoices Section (if any) -->
        ${C.length>0?`
          <div>
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
              <span>🛒</span> فواتير المبيعات الصادرة للعملاء (${C.length} فاتورة)
            </h4>
            <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0; width:100%;">
                <thead>
                  <tr>
                    <th>#</th><th>التاريخ</th><th>رقم الفاتورة</th><th>العميل</th><th style="text-align:center;">الكمية المباعة</th><th style="text-align:left;">سعر البيع</th><th style="text-align:left;">إجمالي القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  ${C.map((l,u)=>`
                    <tr>
                      <td class="mono" style="text-align:center;">${u+1}</td>
                      <td class="mono font-bold">${l.date||"—"}</td>
                      <td class="mono font-bold" style="color:#059669;">${l.number}</td>
                      <td class="font-bold">${l.customerName}</td>
                      <td class="mono font-bold" style="text-align:center; color:#059669;">${l.qty}</td>
                      <td class="mono" style="text-align:left;">${F(l.price)}</td>
                      <td class="mono font-bold" style="text-align:left;">${F(l.total)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        `:""}
      `,e.style.display="flex",e.classList.remove("hidden")}catch(r){console.warn("Modal open error:",r)}},window.sphCloseModal=()=>{const n=document.getElementById("sph-modal");n&&(n.style.display="none",n.classList.add("hidden"))};async function I(){return window.ExcelJS?window.ExcelJS:new Promise((n,r)=>{if(document.querySelector('script[src*="exceljs"]')&&window.ExcelJS)return n(window.ExcelJS);const o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js",o.onload=()=>{window.ExcelJS?n(window.ExcelJS):r(new Error("ExcelJS not initialized"))},o.onerror=()=>{const p=document.createElement("script");p.src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js",p.onload=()=>{window.ExcelJS?n(window.ExcelJS):r(new Error("ExcelJS fallback failed"))},p.onerror=()=>r(new Error("تعذر تحميل مكتبة ExcelJS")),document.head.appendChild(p)},document.head.appendChild(o)})}function A(n,r,e,o){if(!window.XLSX){alert("تعذر تحميل مكتبة تصدير الإكسل.");return}const p=window.XLSX.utils.book_new(),f=n.map((s,d)=>({م:d+1,"كود الصنف":s.sku||"—","اسم الصنف":s.productName,الوحدة:s.unit||"—","عدد الموردين":s.suppliersCount,"أرخص مورد":s.suppliers[0]?.supplierName||"—","أقل سعر":Number(s.minPrice.toFixed(2)),"أعلى سعر":Number(s.maxPrice.toFixed(2)),"فارق السعر (الوفر)":Number(s.priceSpread.toFixed(2)),"نسبة التفاوت %":s.minPrice>0?Number((s.priceSpread/s.minPrice*100).toFixed(1)):0,"إجمالي الكمية":Number(s.totalQty.toFixed(2)),"إجمالي القيمة":Number(s.totalAmount.toFixed(2)),"الموردين والأسعار":s.suppliers.map(t=>`${t.supplierName}: ${t.latestPrice.toFixed(2)} ر.س (${t.purchaseCount} فواتير)`).join(" | ")})),m=window.XLSX.utils.json_to_sheet(f);window.XLSX.utils.book_append_sheet(p,m,"مصفوفة الأصناف والموردين");const z=[];let C=1;n.forEach(s=>{s.suppliers.forEach(d=>{z.push({م:C++,"كود الصنف":s.sku||"—","اسم الصنف":s.productName,الوحدة:s.unit||"—","اسم المورد":d.supplierName,"السعر الأول":Number(d.initialPrice.toFixed(2)),"السعر الأحدث":Number(d.latestPrice.toFixed(2)),"فارق السعر":Number(d.priceDiff.toFixed(2)),"نسبة التغير %":Number(d.priceDiffPct.toFixed(1)),"حركة السعر":d.movement==="up"?"ارتفاع":d.movement==="down"?"انخفاض":"مستقر","أدنى سعر":Number(d.minPrice.toFixed(2)),"أعلى سعر":Number(d.maxPrice.toFixed(2)),"متوسط السعر":Number(d.avgPrice.toFixed(2)),"عدد الفواتير":d.purchaseCount,"إجمالي الكمية":Number(d.totalQty.toFixed(2)),"إجمالي القيمة":Number(d.totalAmount.toFixed(2))})})});const l=window.XLSX.utils.json_to_sheet(z);window.XLSX.utils.book_append_sheet(p,l,"تحليل تقلبات الأسعار والوفر");const u=r.map((s,d)=>({م:d+1,"تاريخ الفاتورة":s.date,"رقم الفاتورة":s.invoiceNumber,"اسم المورد":s.supplierName,"كود الصنف":s.sku||"—","اسم الصنف":s.productName,الوحدة:s.unit||"—",الكمية:Number(s.qty.toFixed(2)),"سعر الوحدة":Number(s.unitPrice.toFixed(2)),"إجمالي القيمة":Number(s.total.toFixed(2))})),$=window.XLSX.utils.json_to_sheet(u);window.XLSX.utils.book_append_sheet(p,$,"سجل الفواتير التفصيلية");const N=e.map((s,d)=>({م:d+1,"اسم المورد":s.supplierName,"عدد الفواتير":s.invoicesCount,"عدد الأصناف":s.productsCount,"إجمالي الكميات":Number(s.totalQty.toFixed(2)),"إجمالي القيمة":Number(s.totalAmount.toFixed(2)),"نسبة المشاركة %":Number(s.sharePct.toFixed(2)),"أعلى صنف توريداً":s.topProduct})),S=window.XLSX.utils.json_to_sheet(N);window.XLSX.utils.book_append_sheet(p,S,"تحليل مشتريات الموردين");const x=n.map((s,d)=>({م:d+1,"كود الصنف":s.sku||"—","اسم الصنف":s.productName,الوحدة:s.unit||"—","التصنيف التجاري":`${s.commercialBadge.icon} ${s.commercialBadge.label}`,"عدد مرات الطلب":s.demandCount,"الكمية المشتراة":Number(s.totalQty.toFixed(2)),"متوسط سعر الشراء":Number(s.avgPurchasePrice.toFixed(2)),"إجمالي المشتريات":Number(s.totalAmount.toFixed(2)),"الكمية المباعة":Number(s.qtySold.toFixed(2)),"نسبة التصريف %":Number(s.sellThroughRate.toFixed(1)),"متوسط سعر البيع":Number(s.avgSellingPrice.toFixed(2)),"إجمالي إيراد المبيعات":Number(s.salesRevenue.toFixed(2)),"مجمل الربح (ر.س)":Number(s.grossProfit.toFixed(2)),"هامش الربح %":Number(s.marginPct.toFixed(1)),"أرخص مورد":s.suppliers[0]?.supplierName||"—","أدنى سعر توريد":Number(s.minPrice.toFixed(2))})),a=window.XLSX.utils.json_to_sheet(x);window.XLSX.utils.book_append_sheet(p,a,"تحليل المبيعات والربحية والطلب"),window.XLSX.writeFile(p,o),window.showToast&&window.showToast("تم تصدير ملف الإكسل بنجاح بـ 5 تبويبات شاملة تحليل الأرباح والطلب!","success")}window.exportSupplierPurchasesExcel=async()=>{const n=document.getElementById("sph-main-excel-btn"),r=n?n.innerHTML:"";n&&(n.disabled=!0,n.innerHTML="<span>⏳</span> جاري تجهيز وتنسيق ملف Excel المطور...");try{let B=function(i,g,h,st,y,j={}){i.mergeCells(g,h,st,y);for(let tt=g;tt<=st;tt++)for(let et=h;et<=y;et++){const dt=i.getCell(tt,et);tt===g&&et===h&&j.value!==void 0&&(dt.value=j.value),j.font&&(dt.font=j.font),j.fill&&(dt.fill=j.fill),j.alignment&&(dt.alignment=j.alignment),j.border&&(dt.border=j.border)}},c=function(i,g={}){g.value!==void 0&&(i.value=g.value),g.font&&(i.font=g.font),g.fill&&(i.fill=g.fill),g.alignment&&(i.alignment=g.alignment),g.border&&(i.border=g.border),g.numFmt&&(i.numFmt=g.numFmt)};const e=ht();if(!e||!e.length){alert("لا توجد بيانات متاحة للتصدير وفق معايير التصفية الحالية.");return}const o=[],{supplierId:p,productId:f,dateFrom:m,dateTo:z,search:C}=w,l=new Map(rt.map(i=>[i.id,i])),u=new Map(ct.map(i=>[i.id,i.name]));Ct.forEach(i=>{const g=i.date||i.invoiceDate||"";if(m&&g<m||z&&g>z)return;const h=i.supplierId||"",st=i.supplierName||u.get(h)||"مورد عام";p&&h!==p||(i.lines||i.items||[]).forEach(y=>{const j=y.productId||"",tt=y.productName||y.name||"صنف بدون اسم",et=j?l.get(j):rt.find(Qt=>Qt.name===tt);if(f&&j!==f&&(!et||et.id!==f))return;const dt=parseFloat(y.unitPrice!==void 0?y.unitPrice:y.price||0),Ut=parseFloat(y.qty!==void 0?y.qty:y.quantity||1),Gt=parseFloat(y.total!==void 0?y.total:Ut*dt),Zt=y.unit||et?.unit||"كرتون",Ht=y.sku||et?.sku||"—";if(C){const Qt=C.trim().toLowerCase();if(!`${tt} ${Ht} ${st}`.toLowerCase().includes(Qt))return}o.push({date:g,invoiceNumber:i.number||i.invoiceNumber||(i.id?i.id.slice(0,8):"—"),supplierName:st,sku:Ht,productName:tt,unit:Zt,qty:Ut,unitPrice:dt,total:Gt})})}),o.sort((i,g)=>(g.date||"").localeCompare(i.date||""));const $=new Map;let N=0,S=0;o.forEach(i=>{N+=i.total,S+=i.qty,$.has(i.supplierName)||$.set(i.supplierName,{supplierName:i.supplierName,invoicesSet:new Set,productsMap:new Map,totalQty:0,totalAmount:0});const g=$.get(i.supplierName);g.invoicesSet.add(i.invoiceNumber),g.totalQty+=i.qty,g.totalAmount+=i.total,g.productsMap.set(i.productName,(g.productsMap.get(i.productName)||0)+i.total)});const x=Array.from($.values()).map(i=>{let g="—",h=0;i.productsMap.forEach((y,j)=>{y>h&&(h=y,g=j)});const st=N>0?i.totalAmount/N*100:0;return{supplierName:i.supplierName,invoicesCount:i.invoicesSet.size,productsCount:i.productsMap.size,totalQty:i.totalQty,totalAmount:i.totalAmount,sharePct:st,topProduct:g!=="—"?`${g} (${h.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س)`:"—"}});x.sort((i,g)=>g.totalAmount-i.totalAmount);const a=w.supplierId?(ct.find(i=>i.id===w.supplierId)?.name||"مورد").replace(/[/\\?%*:|"<>]/g,"_"):"كافة_الموردين",s=new Date().toISOString().split("T")[0],d=`تقرير_مشتريات_وتقلبات_أسعار_الموردين_${a}_${s}.xlsx`;try{await I()}catch(i){console.warn("ExcelJS load failed, falling back to SheetJS:",i)}if(!window.ExcelJS){A(e,o,x,d);return}const t=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),b=t.name||t.businessName||"مؤسسة ادهام للمواد الغذائية",T=new Date().toLocaleString("ar-SA",{dateStyle:"medium",timeStyle:"short"}),E=w.supplierId?ct.find(i=>i.id===w.supplierId)?.name||"مورد محدد":"كافة الموردين",M=w.dateFrom||w.dateTo?`من: ${w.dateFrom||"البداية"} إلى: ${w.dateTo||"اليوم"}`:"كامل الفترات التاريخية",H=new window.ExcelJS.Workbook;H.creator="مؤسسة ادهام للمواد الغذائية - IDHAM ERP",H.lastModifiedBy=$t?.name||"IDHAM ERP",H.created=new Date,H.modified=new Date;const v={top:{style:"thin",color:{argb:"FFE2E8F0"}},left:{style:"thin",color:{argb:"FFE2E8F0"}},bottom:{style:"thin",color:{argb:"FFE2E8F0"}},right:{style:"thin",color:{argb:"FFE2E8F0"}}},U={top:{style:"medium",color:{argb:"FF0F172A"}},left:{style:"thin",color:{argb:"FF94A3B8"}},bottom:{style:"medium",color:{argb:"FF0F172A"}},right:{style:"thin",color:{argb:"FF94A3B8"}}},_={top:{style:"thin",color:{argb:"FF94A3B8"}},left:{style:"thin",color:{argb:"FFE2E8F0"}},bottom:{style:"double",color:{argb:"FF0F172A"}},right:{style:"thin",color:{argb:"FFE2E8F0"}}},L=H.addWorksheet("مصفوفة الأصناف والموردين",{properties:{tabColor:{argb:"FF1E3A8A"}},views:[{rightToLeft:!0,state:"frozen",xSplit:0,ySplit:6}]});[6,14,34,10,13,26,14,14,16,14,15,20,48].forEach((i,g)=>{L.getColumn(g+1).width=i}),L.getRow(1).height=32,B(L,1,1,1,13,{value:`${b} — تقرير مشتريات الأصناف ومقارنة أسعار الموردين الأفقية`,font:{name:"Calibri",size:14,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF1E3A8A"}},alignment:{horizontal:"center",vertical:"middle"}}),L.getRow(2).height=20,B(L,2,1,2,13,{value:`المورد: ${E} | نطاق الفواتير: ${M} | وقت التصدير: ${T}`,font:{name:"Calibri",size:10,color:{argb:"FF334155"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFF1F5F9"}},alignment:{horizontal:"center",vertical:"middle"}}),L.getRow(3).height=10;const kt=e.reduce((i,g)=>i+(g.totalAmount||0),0),St=e.reduce((i,g)=>i+(g.totalQty||0),0),Tt=e.filter(i=>i.suppliersCount>1).length;L.getRow(4).height=26,B(L,4,1,4,3,{value:`💰 إجمالي المشتريات: ${kt.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س`,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF1E3A8A"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFDBEAFE"}},alignment:{horizontal:"center",vertical:"middle"},border:v}),B(L,4,4,4,6,{value:`📦 إجمالي الأصناف: ${e.length} صنف`,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF065F46"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFDCFCE7"}},alignment:{horizontal:"center",vertical:"middle"},border:v}),B(L,4,7,4,9,{value:`📊 إجمالي الكميات: ${St.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}`,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF92400E"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF3C7"}},alignment:{horizontal:"center",vertical:"middle"},border:v}),B(L,4,10,4,13,{value:`🤝 أصناف متعددة الموردين: ${Tt} صنف (فرص تفاوض ووفر)`,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF581C87"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFF3E8FF"}},alignment:{horizontal:"center",vertical:"middle"},border:v}),L.getRow(5).height=10;const vt=L.getRow(6);vt.height=30,["م","كود الصنف","اسم الصنف","الوحدة","عدد الموردين","أرخص مورد (الأفضل سعراً)","أقل سعر مسجل","أعلى سعر مسجل","فارق السعر (الوفر)","نسبة التفاوت %","إجمالي الكمية","إجمالي القيمة (ر.س)","تفاصيل الموردين والأسعار المعروضة"].forEach((i,g)=>{c(vt.getCell(g+1),{value:i,font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF1E3A8A"}},alignment:{horizontal:"center",vertical:"middle",wrapText:!0},border:U})});let pt=7;e.forEach((i,g)=>{const h=L.getRow(pt);h.height=22;const y=g%2===1?{type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}}:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}},j=i.suppliers.map(dt=>`${dt.supplierName}: ${dt.latestPrice.toFixed(2)} ر.س (${dt.purchaseCount} فواتير)`).join(" | "),tt=i.minPrice>0?i.priceSpread/i.minPrice*100:0,et=i.suppliers[0]?.supplierName||"—";c(h.getCell(1),{value:g+1,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(2),{value:i.sku||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(3),{value:i.productName,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF0F172A"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(4),{value:i.unit||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(5),{value:i.suppliersCount,font:{name:"Calibri",size:10,bold:i.suppliersCount>1,color:{argb:i.suppliersCount>1?"FF1D4ED8":"FF334155"}},alignment:{horizontal:"center",vertical:"middle"},fill:i.suppliersCount>1?{type:"pattern",pattern:"solid",fgColor:{argb:"FFEFF6FF"}}:y,border:v,numFmt:"#,##0"}),c(h.getCell(6),{value:et,font:{name:"Calibri",size:10,bold:!0,color:{argb:"FF065F46"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(7),{value:Number(i.minPrice.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF047857"}},alignment:{horizontal:"center",vertical:"middle"},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFECFDF5"}},border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(8),{value:Number(i.maxPrice.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FFB91C1C"}},alignment:{horizontal:"center",vertical:"middle"},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF2F2"}},border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(9),{value:Number(i.priceSpread.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FFB45309"}},alignment:{horizontal:"center",vertical:"middle"},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF3C7"}},border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(10),{value:Number(tt.toFixed(1)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'0.0"%"'}),c(h.getCell(11),{value:Number(i.totalQty.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(12),{value:Number(i.totalAmount.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF1E3A8A"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(13),{value:j,font:{name:"Calibri",size:9.5,color:{argb:"FF334155"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),pt++});const Ft=L.getRow(pt);Ft.height=26,B(L,pt,1,pt,10,{value:"الإجمالي العام لكافة الأصناف الموردة",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(Ft.getCell(11),{value:{formula:`SUM(K7:K${pt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(Ft.getCell(12),{value:{formula:`SUM(L7:L${pt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'}),c(Ft.getCell(13),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_});const at=H.addWorksheet("تحليل تقلبات الأسعار والوفر",{properties:{tabColor:{argb:"FFD97706"}},views:[{rightToLeft:!0,state:"frozen",xSplit:0,ySplit:4}]});[6,14,32,10,26,13,13,13,13,13,13,13,13,12,14,18].forEach((i,g)=>{at.getColumn(g+1).width=i}),at.getRow(1).height=30,B(at,1,1,1,16,{value:`${b} — تحليل تقلبات أسعار التوريد وحركة الأسعار بين الموردين`,font:{name:"Calibri",size:13,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFD97706"}},alignment:{horizontal:"center",vertical:"middle"}}),at.getRow(2).height=20,B(at,2,1,2,16,{value:`المورد: ${E} | نطاق الفواتير: ${M} | وقت التصدير: ${T}`,font:{name:"Calibri",size:10,color:{argb:"FF92400E"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF3C7"}},alignment:{horizontal:"center",vertical:"middle"}}),at.getRow(3).height=10;const _t=at.getRow(4);_t.height=28,["م","كود الصنف","اسم الصنف","الوحدة","اسم المورد","السعر الأول","السعر الأحدث","فارق السعر","نسبة التغير %","حركة السعر","أدنى سعر تاريخي","أعلى سعر تاريخي","متوسط السعر","عدد الفواتير","إجمالي الكمية","إجمالي القيمة (ر.س)"].forEach((i,g)=>{c(_t.getCell(g+1),{value:i,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFD97706"}},alignment:{horizontal:"center",vertical:"middle",wrapText:!0},border:U})});let nt=5,ft=1;e.forEach(i=>{i.suppliers.forEach(g=>{const h=at.getRow(nt);h.height=22;const y=ft%2===0?{type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}}:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}};let j="⚪ مستقر",tt=y,et="FF475569";g.movement==="up"?(j="🔺 ارتفاع",tt={type:"pattern",pattern:"solid",fgColor:{argb:"FFFEE2E2"}},et="FFDC2626"):g.movement==="down"&&(j="🔻 انخفاض",tt={type:"pattern",pattern:"solid",fgColor:{argb:"FFDCFCE7"}},et="FF16A34A"),c(h.getCell(1),{value:ft,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(2),{value:i.sku||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(3),{value:i.productName,font:{name:"Calibri",size:10,bold:!0,color:{argb:"FF0F172A"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(4),{value:i.unit||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(5),{value:g.supplierName,font:{name:"Calibri",size:10,bold:!0,color:{argb:"FF1E293B"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(6),{value:Number(g.initialPrice.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(7),{value:Number(g.latestPrice.toFixed(2)),font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(8),{value:Number(g.priceDiff.toFixed(2)),font:{name:"Calibri",size:10,bold:!0,color:{argb:g.priceDiff>0?"FFDC2626":g.priceDiff<0?"FF16A34A":"FF475569"}},alignment:{horizontal:"center",vertical:"middle"},fill:tt,border:v,numFmt:"+#,##0.00;-#,##0.00;0.00"}),c(h.getCell(9),{value:Number(g.priceDiffPct.toFixed(1)),font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'0.0"%"'}),c(h.getCell(10),{value:j,font:{name:"Calibri",size:10,bold:!0,color:{argb:et}},alignment:{horizontal:"center",vertical:"middle"},fill:tt,border:v}),c(h.getCell(11),{value:Number(g.minPrice.toFixed(2)),font:{name:"Calibri",size:10,color:{argb:"FF047857"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(12),{value:Number(g.maxPrice.toFixed(2)),font:{name:"Calibri",size:10,color:{argb:"FFB91C1C"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(13),{value:Number(g.avgPrice.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(14),{value:g.purchaseCount,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0"}),c(h.getCell(15),{value:Number(g.totalQty.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(16),{value:Number(g.totalAmount.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF92400E"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),nt++,ft++})});const ut=at.getRow(nt);ut.height=26,B(at,nt,1,nt,13,{value:"الإجمالي العام لكافة سجلات الموردين والأصناف",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(ut.getCell(14),{value:{formula:`SUM(N5:N${nt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0"}),c(ut.getCell(15),{value:{formula:`SUM(O5:O${nt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(ut.getCell(16),{value:{formula:`SUM(P5:P${nt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'});const k=H.addWorksheet("سجل الفواتير التفصيلية",{properties:{tabColor:{argb:"FF059669"}},views:[{rightToLeft:!0,state:"frozen",xSplit:0,ySplit:4}]});[6,14,16,26,14,32,10,14,15,18].forEach((i,g)=>{k.getColumn(g+1).width=i}),k.getRow(1).height=30,B(k,1,1,1,10,{value:`${b} — سجل بنود فواتير الشراء التفصيلية المشمولة بالتقرير`,font:{name:"Calibri",size:13,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF059669"}},alignment:{horizontal:"center",vertical:"middle"}}),k.getRow(2).height=20,B(k,2,1,2,10,{value:`المورد: ${E} | نطاق الفواتير: ${M} | عدد البنود المسجلة: ${o.length} بند`,font:{name:"Calibri",size:10,color:{argb:"FF065F46"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFD1FAE5"}},alignment:{horizontal:"center",vertical:"middle"}}),k.getRow(3).height=10;const Z=k.getRow(4);Z.height=28,["م","تاريخ الفاتورة","رقم الفاتورة","اسم المورد","كود الصنف","اسم الصنف","الوحدة","الكمية المشتراة","سعر الوحدة (ر.س)","إجمالي البند (ر.س)"].forEach((i,g)=>{c(Z.getCell(g+1),{value:i,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF059669"}},alignment:{horizontal:"center",vertical:"middle",wrapText:!0},border:U})});let P=5;o.forEach((i,g)=>{const h=k.getRow(P);h.height=22;const y=g%2===1?{type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}}:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}};c(h.getCell(1),{value:g+1,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(2),{value:i.date||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(3),{value:i.invoiceNumber,font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(4),{value:i.supplierName,font:{name:"Calibri",size:10,bold:!0,color:{argb:"FF1E293B"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(5),{value:i.sku||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(6),{value:i.productName,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF0F172A"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(7),{value:i.unit||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(8),{value:Number(i.qty.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(9),{value:Number(i.unitPrice.toFixed(2)),font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(10),{value:Number(i.total.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF065F46"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),P++});const J=k.getRow(P);J.height=26,B(k,P,1,P,7,{value:"الإجمالي العام لكافة بنود الفواتير التفصيلية",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(J.getCell(8),{value:{formula:`SUM(H5:H${P-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(J.getCell(9),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(J.getCell(10),{value:{formula:`SUM(J5:J${P-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'});const D=H.addWorksheet("تحليل مشتريات الموردين",{properties:{tabColor:{argb:"FF7C3AED"}},views:[{rightToLeft:!0,state:"frozen",xSplit:0,ySplit:4}]});[6,28,14,16,16,20,16,36].forEach((i,g)=>{D.getColumn(g+1).width=i}),D.getRow(1).height=30,B(D,1,1,1,8,{value:`${b} — التحليل التجميعي لحصص ومشتريات الموردين`,font:{name:"Calibri",size:13,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF7C3AED"}},alignment:{horizontal:"center",vertical:"middle"}}),D.getRow(2).height=20,B(D,2,1,2,8,{value:`إجمالي عدد الموردين المشمولين: ${x.length} مورد | وقت التصدير: ${T}`,font:{name:"Calibri",size:10,color:{argb:"FF5B21B6"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFEDE9FE"}},alignment:{horizontal:"center",vertical:"middle"}}),D.getRow(3).height=10;const it=D.getRow(4);it.height=28,["م","اسم المورد","عدد الفواتير","عدد الأصناف الموردة","إجمالي الكميات الموردة","إجمالي قيمة المشتريات (ر.س)","نسبة المشاركة من الإجمالي %","أعلى صنف توريداً وقيمة"].forEach((i,g)=>{c(it.getCell(g+1),{value:i,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF7C3AED"}},alignment:{horizontal:"center",vertical:"middle",wrapText:!0},border:U})});let W=5;x.forEach((i,g)=>{const h=D.getRow(W);h.height=22;const y=g%2===1?{type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}}:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}};c(h.getCell(1),{value:g+1,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(2),{value:i.supplierName,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF4C1D95"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(3),{value:i.invoicesCount,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0"}),c(h.getCell(4),{value:i.productsCount,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0"}),c(h.getCell(5),{value:Number(i.totalQty.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(6),{value:Number(i.totalAmount.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF7C3AED"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(7),{value:Number(i.sharePct.toFixed(2)),font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'0.00"%"'}),c(h.getCell(8),{value:i.topProduct,font:{name:"Calibri",size:9.5,color:{argb:"FF334155"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),W++});const V=D.getRow(W);V.height=26,B(D,W,1,W,2,{value:"الإجمالي العام لكافة الموردين",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(V.getCell(3),{value:{formula:`SUM(C5:C${W-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0"}),c(V.getCell(4),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(V.getCell(5),{value:{formula:`SUM(E5:E${W-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(V.getCell(6),{value:{formula:`SUM(F5:F${W-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'}),c(V.getCell(7),{value:"100.00%",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(V.getCell(8),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_});const X=H.addWorksheet("تحليل المبيعات والربحية والطلب",{properties:{tabColor:{argb:"FF0D9488"}},views:[{rightToLeft:!0,state:"frozen",xSplit:0,ySplit:4}]});[6,14,32,10,16,16,15,16,18,15,14,16,18,16,14,24,16].forEach((i,g)=>{X.getColumn(g+1).width=i}),X.getRow(1).height=30,B(X,1,1,1,17,{value:`${b} — تحليل حركة الطلب والمبيعات والأرباح التقديرية لأصناف الموردين`,font:{name:"Calibri",size:13,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0D9488"}},alignment:{horizontal:"center",vertical:"middle"}}),X.getRow(2).height=20,B(X,2,1,2,17,{value:`المورد: ${E} | النطاق الزمني: ${M} | عدد الأصناف المشمولة: ${e.length} صنف | وقت التصدير: ${T}`,font:{name:"Calibri",size:10,color:{argb:"FF115E59"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FFCCFBF1"}},alignment:{horizontal:"center",vertical:"middle"}}),X.getRow(3).height=10;const yt=X.getRow(4);yt.height=28,["م","كود الصنف","اسم الصنف","الوحدة","التصنيف التجاري","مرات الطلب","الكمية المشتراة","متوسط سعر الشراء","إجمالي المشتريات (ر.س)","الكمية المباعة","نسبة التصريف %","متوسط سعر البيع","إجمالي إيراد المبيعات (ر.س)","مجمل الربح (ر.س)","هامش الربح %","أرخص مورد متاح","أدنى سعر توريد (ر.س)"].forEach((i,g)=>{c(yt.getCell(g+1),{value:i,font:{name:"Calibri",size:10,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0D9488"}},alignment:{horizontal:"center",vertical:"middle",wrapText:!0},border:U})});let bt=5;e.forEach((i,g)=>{const h=X.getRow(bt);h.height=22;const y=g%2===1?{type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}}:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}},j=i.grossProfit>=0?{argb:"FF15803D"}:{argb:"FFDC2626"};c(h.getCell(1),{value:g+1,font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(2),{value:i.sku||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(3),{value:i.productName,font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF0F172A"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(4),{value:i.unit||"—",font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(5),{value:`${i.commercialBadge.icon} ${i.commercialBadge.label}`,font:{name:"Calibri",size:9.5,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v}),c(h.getCell(6),{value:i.demandCount,font:{name:"Calibri",size:10,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0"}),c(h.getCell(7),{value:Number(i.totalQty.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(8),{value:Number(i.avgPurchasePrice.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(9),{value:Number(i.totalAmount.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(10),{value:Number(i.qtySold.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF0369A1"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:"#,##0.00"}),c(h.getCell(11),{value:Number(i.sellThroughRate.toFixed(1)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'0.0"%"'}),c(h.getCell(12),{value:Number(i.avgSellingPrice.toFixed(2)),font:{name:"Calibri",size:10},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(13),{value:Number(i.salesRevenue.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:{argb:"FF1E293B"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(14),{value:Number(i.grossProfit.toFixed(2)),font:{name:"Calibri",size:10.5,bold:!0,color:j},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),c(h.getCell(15),{value:Number(i.marginPct.toFixed(1)),font:{name:"Calibri",size:10,bold:!0,color:j},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'0.0"%"'}),c(h.getCell(16),{value:i.suppliers[0]?.supplierName||"—",font:{name:"Calibri",size:9.5,bold:!0,color:{argb:"FF166534"}},alignment:{horizontal:"right",vertical:"middle"},fill:y,border:v}),c(h.getCell(17),{value:Number(i.minPrice.toFixed(2)),font:{name:"Calibri",size:10,bold:!0,color:{argb:"FF166534"}},alignment:{horizontal:"center",vertical:"middle"},fill:y,border:v,numFmt:'#,##0.00 "ر.س"'}),bt++});const lt=X.getRow(bt);lt.height=26,B(X,bt,1,bt,6,{value:"الإجمالي العام لكافة الأصناف المحللة",font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_}),c(lt.getCell(7),{value:{formula:`SUM(G5:G${bt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(lt.getCell(8),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(lt.getCell(9),{value:{formula:`SUM(I5:I${bt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'}),c(lt.getCell(10),{value:{formula:`SUM(J5:J${bt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:"#,##0.00"}),c(lt.getCell(11),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(lt.getCell(12),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(lt.getCell(13),{value:{formula:`SUM(M5:M${bt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'}),c(lt.getCell(14),{value:{formula:`SUM(N5:N${bt-1})`},font:{name:"Calibri",size:11,bold:!0,color:{argb:"FFFFFFFF"}},fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},alignment:{horizontal:"center",vertical:"middle"},border:_,numFmt:'#,##0.00 "ر.س"'}),c(lt.getCell(15),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(lt.getCell(16),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_}),c(lt.getCell(17),{value:"",fill:{type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},border:_});const Wt=await H.xlsx.writeBuffer(),Xt=new Blob([Wt],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),Ot=window.URL.createObjectURL(Xt),Pt=document.createElement("a");Pt.href=Ot,Pt.download=d,document.body.appendChild(Pt),Pt.click(),document.body.removeChild(Pt),setTimeout(()=>window.URL.revokeObjectURL(Ot),1e4),window.showToast&&window.showToast("تم تصدير ملف الإكسل المطور بنجاح بـ 5 تبويبات ملونة وتنسيقات احترافية!","success",4e3)}catch(e){console.error("Export Excel Error:",e),alert("حدث خطأ أثناء تصدير ملف الإكسل: "+(e.message||e))}finally{n&&(n.disabled=!1,n.innerHTML=r)}},window.printRoyalProductCompare=()=>{const n=document.getElementById("sph-compare-prod")?.value,r=rt.find(x=>x.id===n);if(!r){alert("يرجى اختيار صنف أولاً لإتمام الطباعة الملكية.");return}const e=parseFloat(document.getElementById("sph-calc-qty")?.value)||50,o=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),p=[];Ct.forEach(x=>{(x.lines||x.items||[]).forEach(a=>{(a.productId===r.id||a.productName===r.name||a.name===r.name)&&p.push({date:x.date||x.invoiceDate||"",invoiceNumber:x.number||x.invoiceNumber||(x.id?x.id.slice(0,8):"—"),supplierName:x.supplierName||"مورد",unitPrice:parseFloat(a.unitPrice||a.price||0),qty:parseFloat(a.qty||1),total:parseFloat(a.total||(a.qty||1)*(a.unitPrice||0))})})}),p.sort((x,a)=>(x.date||"").localeCompare(a.date||"")),p.map(x=>x.unitPrice);const f={};p.forEach(x=>{f[x.supplierName]||(f[x.supplierName]={name:x.supplierName,prices:[],count:0,totalQty:0,totalAmount:0}),f[x.supplierName].prices.push(x.unitPrice),f[x.supplierName].count+=1,f[x.supplierName].totalQty+=x.qty,f[x.supplierName].totalAmount+=x.total});const m=Object.values(f).map(x=>({name:x.name,minPrice:Math.min(...x.prices),maxPrice:Math.max(...x.prices),avgPrice:x.prices.reduce((a,s)=>a+s,0)/x.prices.length,lastPrice:x.prices[x.prices.length-1],totalPurchasedQty:x.totalQty,totalPurchasedAmount:x.totalAmount,purchasesCount:x.count})).sort((x,a)=>x.lastPrice-a.lastPrice||x.avgPrice-a.avgPrice),z=m[0],C=z?z.lastPrice||z.avgPrice:0,l=m[m.length-1],$=(l?l.lastPrice||l.avgPrice:C)-C,N=$*e,S=window.open("","_blank");if(!S){alert("يرجى السماح بالنوافذ المنبثقة.");return}S.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>بطاقة مقارنة أسعار الموردين والترسية الشرائية — ${r.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', sans-serif; background: #f8fafc; color: #0f172a; padding: 16px; font-size: 11px; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 287mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 14px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 8px; margin-bottom: 10px; }
    .royal-title-box h1 { font-size: 18px; font-weight: 900; color: #1e1b4b; }
    .royal-title-box h2 { font-size: 11px; font-weight: 700; color: #d97706; }
    .co-meta { text-align: left; font-size: 10px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .prod-strip { background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 6px; padding: 8px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
    .rec-box { background: #ecfdf5; border: 1.5px solid #86efac; border-radius: 6px; padding: 8px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1.5px solid #1e1b4b; font-size: 10px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px; font-size: 9.5px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 5px; text-align: center; border: 1px solid #e2e8f0; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 6px; padding: 6px 10px; background: #fafafa; min-height: 55px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9.5px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8.5px; color: #64748b; }
    @page { size: A4 landscape; margin: 6mm 8mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; border-radius: 0 !important; }
      tr, .sig-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>
  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>بطاقة مقارنة أسعار الموردين والترسية الشرائية</h1>
        <h2>PRODUCT CROSS-SUPPLIER PRICING & PROCUREMENT DECISION</h2>
      </div>
      <div class="co-meta">
        <div><b>${O.name||o.name||"شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${O.crNumber||o.crNumber||"7054969006"}</b></span> | الرقم الضريبي: <span class="mono"><b>${O.vatNumber||o.vatNumber||"314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="prod-strip">
      <div>الصنف: <b style="font-size:13px; color:#1e1b4b;">${r.name}</b></div>
      <div>كود الصنف: <b class="mono">${r.sku||"—"}</b></div>
      <div>الوحدة: <b style="color:#6366f1;">${r.unit||"كرتون"}</b></div>
      <div>التكلفة المسجلة: <b class="mono">${F(r.costPrice||0)}</b></div>
      <div>سعر البيع: <b class="mono" style="color:#16a34a;">${F(r.price||0)}</b></div>
    </div>

    ${z?`
      <div class="rec-box">
        <div>
          <div style="font-weight:900; color:#166534; font-size:12.5px;">💡 قرار الترسية الموصى به: المورد [ ${z.name} ]</div>
          <div style="color:#15803d; font-size:10.5px;">أفضل سعر حالي: <b>${F(C)}</b> | وفر قدره <b>${F($)}</b> لكل وحدة مقارنة بالمورد [ ${l?.name||"—"} ].</div>
        </div>
        <div style="text-align:left; background:#fff; padding:6px 12px; border-radius:6px; border:1px solid #bbf7d0;">
          <div style="font-size:9.5px; color:#475569; font-weight:700;">الوفر المتوقع لكمية ${e} ${r.unit||"كرتون"}:</div>
          <div class="mono font-bold" style="font-size:16px; color:#16a34a;">${F(N)}</div>
        </div>
      </div>
    `:""}

    <table class="royal-table">
      <thead>
        <tr>
          <th>ترتيب المورد</th>
          <th>اسم المورد</th>
          <th>آخر سعر مسجل</th>
          <th>أقل سعر</th>
          <th>أعلى سعر</th>
          <th>متوسط السعر</th>
          <th>الفارق عن الأرخص</th>
          <th>تكلفة ${e} وحدة</th>
          <th>عدد الفواتير</th>
          <th>إجمالي الكميات المشتراة</th>
        </tr>
      </thead>
      <tbody>
        ${m.map((x,a)=>`
          <tr style="${a===0?"background:#f0fdf4;":""}">
            <td class="font-bold">${a===0?"🥇 الأفضل":a===1?"🥈 الثاني":a===2?"🥉 الثالث":`#${a+1}`}</td>
            <td class="font-bold" style="text-align:right;">${x.name}</td>
            <td class="mono font-bold">${F(x.lastPrice)}</td>
            <td class="mono text-good">${F(x.minPrice)}</td>
            <td class="mono text-bad">${F(x.maxPrice)}</td>
            <td class="mono">${F(x.avgPrice)}</td>
            <td class="font-bold" style="color:${a===0?"#16a34a":"#dc2626"};">
              ${a===0?"سعر الأساس":`+${F(x.lastPrice-C)}`}
            </td>
            <td class="mono font-bold">${F(x.lastPrice*e)}</td>
            <td class="mono">${x.purchasesCount}</td>
            <td class="mono font-bold">${x.totalPurchasedQty}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ توصية مسؤول المشتريات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ تدقيق الإدارة المالية:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الترسية والشراء:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`),S.document.close()},window.printRoyalSupplierPurchases=()=>{const n=ht();if(!n.length){alert("لا توجد بيانات للطباعة.");return}const r=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),e=ct.find($=>$.id===w.supplierId),o=e?e.name:"كافة الموردين (عرض مصفوفة الموردين الأفقية)",p=n.reduce(($,N)=>$+N.totalAmount,0),f=n.reduce(($,N)=>$+N.totalQty,0),m=n.reduce(($,N)=>$+N.totalPurchases,0),z=n.length,C=n.filter($=>$.suppliersCount>1).length,l=typeof wt=="function"?wt(p):"",u=window.open("","_blank");if(!u){alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");return}u.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>مصفوفة مشتريات الأصناف ومقارنة الموردين — ${o}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 10.5px; line-height: 1.35; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 290mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .royal-title-box h1 { font-size: 17px; font-weight: 900; color: #1e1b4b; margin-bottom: 1px; }
    .royal-title-box h2 { font-size: 10.5px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; margin-top: 3px; }
    .co-meta { text-align: left; font-size: 9.5px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .filter-meta-bar { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
    .filter-meta-bar strong { color: #1e1b4b; font-weight: 800; }
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; background: #fff; text-align: center; }
    .kpi-box .lbl { font-size: 8.5px; color: #64748b; font-weight: 700; margin-bottom: 1px; }
    .kpi-box .val { font-size: 12.5px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }
    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; font-size: 9.5px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px 4px; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 5px 4px; text-align: center; border: 1px solid #e2e8f0; color: #1e293b; }
    .royal-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .sup-print-pill { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 5px; margin: 2px; text-align: right; font-size: 8.5px; }
    .sup-print-pill.cheapest { background: #ecfdf5; border-color: #86efac; color: #166534; font-weight: 800; }
    .tafqeet-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 5px 10px; margin-bottom: 10px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; }
    .tafqeet-box b { color: #1e40af; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 5px; padding: 5px 8px; background: #fafafa; min-height: 50px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8px; color: #64748b; }
    @page { size: A4 landscape; margin: 5mm 6mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; padding: 4px !important; }
      tr, .kpi-box, .sig-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة التقرير / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>مصفوفة مشتريات الأصناف ومقارنة الموردين الأفقية</h1>
        <h2>CROSS-SUPPLIER HORIZONTAL PURCHASE & PRICING MATRIX</h2>
        <span class="gold-pill">👑 تقرير ملكي — تحت كل مورد سعره وتفاصيله</span>
      </div>
      <div class="co-meta">
        <div><b>${O.name||r.name||"شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${O.crNumber||r.crNumber||"7054969006"}</b></span> | الضريبي: <span class="mono"><b>${O.vatNumber||r.vatNumber||"314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="filter-meta-bar">
      <div>المورد المختار: <strong>${o}</strong></div>
      <div>الفترة: <strong>${w.dateFrom||"من البداية"}</strong> إلى <strong>${w.dateTo||"حتى تاريخه"}</strong></div>
      <div>عدد الأصناف: <strong class="mono">${n.length} صنف</strong> | متعددة الموردين: <strong class="mono">${C} صنف</strong></div>
      <div>وقت الطباعة: <strong class="mono">${new Date().toLocaleDateString("ar-SA")}</strong></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="lbl">إجمالي المشتريات</div>
        <div class="val" style="color:#1e1b4b;">${F(p)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">إجمالي الكميات</div>
        <div class="val" style="color:#0284c7;">${f.toLocaleString("en-US")}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">الأصناف المشتراة</div>
        <div class="val" style="color:#8b5cf6;">${z}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">أصناف متعددة الموردين 🔄</div>
        <div class="val" style="color:#d97706;">${C}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">حركات التوريد</div>
        <div class="val" style="color:#10b981;">${m}</div>
      </div>
    </div>

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:25px;">م</th>
          <th style="width:160px;">الصنف والبيان</th>
          <th>الموردين والأسعار (المقارنة المباشرة — كل مورد وتحته سعره)</th>
          <th style="width:65px;">أدنى سعر 🥇</th>
          <th style="width:75px;">أعلى سعر 🔺</th>
          <th style="width:50px;">الكمية</th>
          <th style="width:85px;">إجمالي القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${n.map(($,N)=>`
          <tr>
            <td class="mono font-bold">${N+1}</td>
            <td class="desc">
              <div class="font-bold">${$.productName}</div>
              <div style="font-size:8px; color:#64748b;">الوحدة: ${$.unit} ${$.sku&&$.sku!=="—"?`| كود: ${$.sku}`:""}</div>
            </td>
            <td style="text-align:right;">
              ${$.suppliers.map((S,x)=>`
                <div class="sup-print-pill ${x===0&&$.suppliersCount>1?"cheapest":""}">
                  <div><b>${x===0&&$.suppliersCount>1?"🥇 ":""}${S.supplierName}</b></div>
                  <div class="mono font-bold" style="font-size:10px;">${F(S.latestPrice)} (${S.purchaseCount} مرّة)</div>
                </div>
              `).join("")}
            </td>
            <td class="mono font-bold text-good">${F($.minPrice)}</td>
            <td class="mono font-bold" style="color:${$.priceSpread>0?"#dc2626":"#475569"};">
              ${F($.maxPrice)}
              ${$.priceSpread>0?`<div style="font-size:7.5px; color:#059669;">وفر ${F($.priceSpread)}</div>`:""}
            </td>
            <td class="mono font-bold">${$.totalQty}</td>
            <td class="mono font-bold" style="text-align:left;">${F($.totalAmount)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #1e1b4b;">
        <tr>
          <td colspan="2" style="text-align:right; padding:5px 8px;">المجموع الإجمالي:</td>
          <td style="text-align:right; font-size:9.5px; color:#4338ca;">توريدات: ${m} فاتورة</td>
          <td colspan="2"></td>
          <td class="mono font-bold">${f.toLocaleString("en-US")}</td>
          <td class="mono font-bold" style="text-align:left; color:#1e1b4b; font-size:11px;">
            ${F(p)}
          </td>
        </tr>
      </tfoot>
    </table>

    <div class="tafqeet-box">
      <div>✍️ المبلغ الإجمالي بالحروف: <b>${l}</b></div>
      <div>عدد البنود التحليلية: <b class="mono">${n.length} صنف</b></div>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ إعداد المشتريات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ مراجعة الحسابات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الإدارة:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`),u.document.close()},window.printRoyalSalesProfitability=()=>{const n=ht();if(!n.length){alert("لا توجد بيانات للطباعة.");return}const r=w.profitSort||"qty-sold",e=[...n];r==="qty-sold"?e.sort((t,b)=>b.qtySold-t.qtySold||b.grossProfit-t.grossProfit):r==="demand"?e.sort((t,b)=>b.demandCount-t.demandCount||b.qtySold-t.qtySold):r==="gross-profit"?e.sort((t,b)=>b.grossProfit-t.grossProfit||b.marginPct-t.marginPct):r==="margin"?e.sort((t,b)=>b.marginPct-t.marginPct||b.grossProfit-t.grossProfit):r==="golden"?e.sort((t,b)=>{const T=t.commercialBadge.type==="golden"?2:t.commercialBadge.type==="fast"||t.commercialBadge.type==="high-margin"?1:0;return(b.commercialBadge.type==="golden"?2:b.commercialBadge.type==="fast"||b.commercialBadge.type==="high-margin"?1:0)-T||b.grossProfit-t.grossProfit}):r==="stagnant"&&e.sort((t,b)=>t.qtySold-b.qtySold||b.totalQty-t.totalQty);const o=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),p=ct.find(t=>t.id===w.supplierId),f=p?p.name:"كافة الموردين (عرض تحليلي مجمع للأصناف)",m=e.reduce((t,b)=>t+b.totalAmount,0),z=e.reduce((t,b)=>t+b.totalQty,0),C=e.reduce((t,b)=>t+b.qtySold,0),l=e.reduce((t,b)=>t+b.salesRevenue,0),u=e.reduce((t,b)=>t+b.grossProfit,0),$=l>0?u/l*100:0,N=z>0?C/z*100:0,S=e.reduce((t,b)=>t+b.demandCount,0),x=[...e].filter(t=>t.qtySold>0).sort((t,b)=>b.grossProfit-t.grossProfit||b.qtySold-t.qtySold).slice(0,5),a=typeof wt=="function"?wt(l):"",s=typeof wt=="function"?wt(u):"",d=window.open("","_blank");if(!d){alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");return}d.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير تحليل الطلب والمبيعات والأرباح — ${f}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 10px; line-height: 1.35; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 292mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .royal-title-box h1 { font-size: 16.5px; font-weight: 900; color: #1e1b4b; margin-bottom: 1px; }
    .royal-title-box h2 { font-size: 10px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; margin-top: 3px; }
    .co-meta { text-align: left; font-size: 9.5px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .filter-meta-bar { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
    .filter-meta-bar strong { color: #1e1b4b; font-weight: 800; }
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; background: #fff; text-align: center; }
    .kpi-box .lbl { font-size: 8.5px; color: #64748b; font-weight: 700; margin-bottom: 1px; }
    .kpi-box .val { font-size: 12px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }
    
    /* Top 5 Showcase Strip */
    .top-performers-box { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; }
    .top-performers-title { font-weight: 900; color: #92400e; font-size: 10px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
    .top-performers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .performer-card { background: #fff; border: 1px solid #fef08a; border-radius: 5px; padding: 4px 6px; }
    .performer-rank { font-size: 8.5px; font-weight: 800; color: #b45309; }
    .performer-name { font-size: 9.5px; font-weight: 800; color: #1e1b4b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .performer-stats { font-size: 8.5px; color: #475569; margin-top: 1px; }

    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; font-size: 9px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px 4px; font-size: 8.5px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 4px 4px; text-align: center; border: 1px solid #e2e8f0; color: #1e293b; }
    .royal-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .badge-print { display: inline-block; padding: 1px 4px; border-radius: 3px; font-size: 8px; font-weight: 800; }
    .tafqeet-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; font-size: 9.5px; display: flex; justify-content: space-between; align-items: center; }
    .tafqeet-box b { color: #1e40af; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 5px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 5px; padding: 4px 6px; background: #fafafa; min-height: 48px; display: flex; flex-direction: column; justify-content: space-between; font-size: 8.5px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8px; color: #64748b; }
    @page { size: A4 landscape; margin: 5mm 6mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; padding: 4px !important; }
      tr, .kpi-box, .sig-card, .performer-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة التقرير / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>تقرير تحليل الطلب والمبيعات وهامش الربحية لأصناف الموردين</h1>
        <h2>SUPPLIER PRODUCTS DEMAND, SALES TURNOVER & PROFITABILITY REPORT</h2>
        <span class="gold-pill">👑 تقرير تنفيذي معتمد — الربحية ومعدلات التصريف وسرعة الدوران</span>
      </div>
      <div class="co-meta">
        <div><b>${O.name||o.name||"شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${O.crNumber||o.crNumber||"7054969006"}</b></span> | الضريبي: <span class="mono"><b>${O.vatNumber||o.vatNumber||"314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="filter-meta-bar">
      <div>المورد المختار: <strong>${f}</strong></div>
      <div>الفترة المحددة: <strong>${w.dateFrom||"من البداية"}</strong> إلى <strong>${w.dateTo||"حتى تاريخه"}</strong></div>
      <div>الأصناف المشمولة: <strong class="mono">${e.length} صنف</strong> | إجمالي حركات الطلب: <strong class="mono">${S} حركة</strong></div>
      <div>تاريخ وتوقيت الطباعة: <strong class="mono">${new Date().toLocaleString("ar-SA")}</strong></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="lbl">إجمالي تكلفة المشتريات</div>
        <div class="val" style="color:#1e1b4b;">${F(m)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">إجمالي إيراد المبيعات (صافي)</div>
        <div class="val" style="color:#0284c7;">${F(l)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">مجمل الأرباح المحققة 📈</div>
        <div class="val" style="color:#10b981;">${F(u)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">متوسط هامش الربح %</div>
        <div class="val" style="color:#8b5cf6;">${$.toFixed(1)}%</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">نسبة تصريف المخزون %</div>
        <div class="val" style="color:#d97706;">${N.toFixed(1)}% (${C}/${z})</div>
      </div>
    </div>

    ${x.length>0?`
      <!-- Top 5 Golden Performers Strip -->
      <div class="top-performers-box">
        <div class="top-performers-title">
          <span>🌟 لوحة الشرف للأصناف الذهبية الأكثر مبيعاً وربحية:</span>
        </div>
        <div class="top-performers-grid">
          ${x.map((t,b)=>`
            <div class="performer-card">
              <div class="performer-rank">${b===0?"🥇 الأول":b===1?"🥈 الثاني":b===2?"🥉 الثالث":`#${b+1}`}</div>
              <div class="performer-name" title="${t.productName}">${t.productName}</div>
              <div class="performer-stats">
                مباع: <b>${t.qtySold}</b> ${t.unit} | ربح: <b style="color:#059669;">${F(t.grossProfit)}</b>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `:""}

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:25px;">م</th>
          <th style="width:160px;">الصنف والبيان</th>
          <th style="width:65px;">التصنيف</th>
          <th style="width:70px;">الكمية المشتراة</th>
          <th style="width:65px;">متوسط الشراء</th>
          <th style="width:55px;">مرات الطلب</th>
          <th style="width:70px;">الكمية المباعة</th>
          <th style="width:55px;">التصريف %</th>
          <th style="width:75px;">إيراد المبيعات</th>
          <th style="width:75px;">مجمل الربح</th>
          <th style="width:50px;">الهامش %</th>
          <th style="width:110px;">أرخص مورد متاح</th>
        </tr>
      </thead>
      <tbody>
        ${e.map((t,b)=>`
          <tr>
            <td class="mono font-bold">${b+1}</td>
            <td class="desc">
              <div class="font-bold">${t.productName}</div>
              <div style="font-size:7.5px; color:#64748b;">الوحدة: ${t.unit} ${t.sku&&t.sku!=="—"?`| كود: ${t.sku}`:""}</div>
            </td>
            <td>
              <span class="badge-print" style="background:${t.commercialBadge.bg}; color:${t.commercialBadge.color}; border:1px solid ${t.commercialBadge.border};">
                ${t.commercialBadge.icon} ${t.commercialBadge.label}
              </span>
            </td>
            <td class="mono font-bold">${t.totalQty}</td>
            <td class="mono">${F(t.avgPurchasePrice)}</td>
            <td class="mono font-bold" style="color:#6366f1;">${t.demandCount}</td>
            <td class="mono font-bold" style="color:#0284c7;">${t.qtySold}</td>
            <td class="mono font-bold" style="color:${t.sellThroughRate>=50?"#166534":"#475569"};">${t.sellThroughRate.toFixed(1)}%</td>
            <td class="mono font-bold" style="text-align:left;">${F(t.salesRevenue)}</td>
            <td class="mono font-bold" style="text-align:left; color:${t.grossProfit>=0?"#16a34a":"#dc2626"};">${F(t.grossProfit)}</td>
            <td class="mono font-bold" style="color:${t.marginPct>=20?"#16a34a":"#475569"};">${t.marginPct.toFixed(1)}%</td>
            <td style="text-align:right; font-size:8px;">
              <b>${t.suppliers[0]?.supplierName||"—"}</b>
              <div class="mono" style="color:#16a34a; font-size:8px;">${F(t.minPrice)}</div>
            </td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #1e1b4b;">
        <tr>
          <td colspan="3" style="text-align:right; padding:5px 8px;">الإجمالي العام:</td>
          <td class="mono font-bold">${z.toLocaleString("en-US")}</td>
          <td></td>
          <td class="mono font-bold" style="color:#6366f1;">${S}</td>
          <td class="mono font-bold" style="color:#0284c7;">${C.toLocaleString("en-US")}</td>
          <td class="mono font-bold">${N.toFixed(1)}%</td>
          <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${F(l)}</td>
          <td class="mono font-bold" style="text-align:left; color:#10b981;">${F(u)}</td>
          <td class="mono font-bold" style="color:#8b5cf6;">${$.toFixed(1)}%</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="tafqeet-box">
      <div>✍️ إيراد المبيعات بالحروف: <b>${a||"—"}</b></div>
      <div>صافي مجمل الربح: <b style="color:#15803d;">${s||"—"}</b></div>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ إعداد مسؤول المشتريات والمبيعات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ مراجعة وتدقيق الإدارة المالية:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الإدارة العامة:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`),d.document.close()}}export{ge as render};
