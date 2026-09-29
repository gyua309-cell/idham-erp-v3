import{g as z,a as S,b as K,f as g}from"./index-CEMoTDyX.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let j=[],T={},I={},C={},b="date",$="desc";async function at(r){r.innerHTML=Q(),J(),await q()}function Q(){const r=new Date,e=r.toISOString().split("T")[0];return`
  <div id="rtc-module" style="display:flex; flex-direction:column; gap:16px; background:var(--bg-0); color:var(--text-0); min-height:100%; padding:4px;">
    
    <style>
      #rtc-module .rtc-card {
        background: var(--bg-card);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      #rtc-module .rtc-kpi {
        position: relative;
        overflow: hidden;
        border-radius: 16px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 120px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.04);
      }
      #rtc-module .rtc-kpi-bg-icon {
        position: absolute;
        top: 10px;
        left: 12px;
        font-size: 42px;
        opacity: 0.12;
        pointer-events: none;
      }
      #rtc-module .rtc-pbtn {
        padding: 6px 14px;
        border: none;
        background: transparent;
        color: var(--text-1);
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.15s ease;
      }
      #rtc-module .rtc-pbtn.active {
        background: var(--brand);
        color: #ffffff;
        box-shadow: 0 2px 10px rgba(99,102,241,0.3);
      }
      #rtc-module .rtc-btn {
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
        border: 1px solid var(--border-soft);
        background: var(--bg-2);
        color: var(--text-0);
      }
      #rtc-module .rtc-btn-primary {
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #ffffff;
        border-color: #d97706;
        box-shadow: 0 4px 14px rgba(217,119,6,0.3);
      }
      #rtc-module .rtc-btn-primary:hover {
        background: linear-gradient(135deg, #b45309, #92400e);
      }
      #rtc-module table th {
        background: var(--bg-2);
        color: var(--text-1);
        font-size: 11.5px;
        font-weight: 900;
        padding: 12px;
        border-bottom: 2px solid var(--border-soft);
        user-select: none;
      }
      #rtc-module table th.sortable {
        cursor: pointer;
        transition: background 0.15s ease;
      }
      #rtc-module table th.sortable:hover {
        background: var(--bg-3, var(--border-soft));
        color: var(--text-0);
      }
      #rtc-module table td {
        padding: 12px;
        border-bottom: 1px solid var(--border-soft);
      }
      #rtc-module table tr:hover td {
        background: var(--bg-2);
      }
    </style>

    <!-- Header Toolbar -->
    <div class="rtc-card" style="padding:16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg,#f59e0b,#d97706); display:flex; align-items:center; justify-content:center; font-size:24px; color:#fff; box-shadow:0 4px 18px rgba(245,158,11,0.35);">
          ⚡
        </div>
        <div>
          <h1 style="font-size:19px; font-weight:900; margin:0; color:var(--text-0); display:flex; align-items:center; gap:8px;">
            الشاشة اللحظية لتكلفة المبيعات
            <span style="font-size:11px; padding:3px 10px; border-radius:20px; background:rgba(245,158,11,0.15); color:#d97706; border:1px solid rgba(245,158,11,0.3); font-weight:800;">مباشرة وبدقة الفواتير</span>
          </h1>
          <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;">
            احتساب مباشر لحظي للمبيعات (بدون ضريبة) وتكلفة الشراء الفعلية والأرباح الصافية لكل فاتورة وبند
          </p>
        </div>
      </div>

      <!-- Controls & Date Filters -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
        <!-- Date Inputs -->
        <div style="display:flex; align-items:center; gap:8px; background:var(--bg-2); padding:5px 12px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-2);">من:</span>
            <input type="date" id="rtc-from" value="${new Date(r.getFullYear(),r.getMonth(),1).toISOString().split("T")[0]}" style="background:var(--bg-card); color:var(--text-0); font-size:11.5px; font-weight:800; padding:5px 8px; border-radius:8px; border:1px solid var(--border-soft);" />
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-2);">إلى:</span>
            <input type="date" id="rtc-to" value="${e}" style="background:var(--bg-card); color:var(--text-0); font-size:11.5px; font-weight:800; padding:5px 8px; border-radius:8px; border:1px solid var(--border-soft);" />
          </div>
        </div>

        <!-- Quick Ranges -->
        <div style="display:flex; background:var(--bg-2); padding:3px; border-radius:12px; border:1px solid var(--border-soft);">
          <button class="rtc-pbtn" data-p="today">اليوم</button>
          <button class="rtc-pbtn" data-p="week">آخر 7 أيام</button>
          <button class="rtc-pbtn active" data-p="month">هذا الشهر</button>
          <button class="rtc-pbtn" data-p="all">كل الفترات</button>
        </div>

        <button id="rtc-refresh-btn" class="rtc-btn">🔄 تحديث</button>
        <button id="rtc-print-btn" class="rtc-btn rtc-btn-primary">🖨️ طباعة التقرير</button>
      </div>
    </div>

    <!-- 4 Glowing KPI Cards Grid (Side-by-Side) -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
      
      <!-- Card 1: Live Revenue -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.03)); border:1px solid rgba(99,102,241,0.3);">
        <div class="rtc-kpi-bg-icon">🧾</div>
        <div style="font-size:11px; font-weight:900; color:#6366f1; text-transform:uppercase; letter-spacing:0.5px;">المبيعات اللحظية (بدون ضريبة)</div>
        <div id="rtc-kpi-sales" style="font-size:23px; font-weight:900; color:#4f46e5; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div id="rtc-kpi-sales-count" style="font-size:11px; font-weight:800; color:var(--text-2);">0 فاتورة بيع</div>
      </div>

      <!-- Card 2: COGS (Purchase Cost) -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(244,63,94,0.12), rgba(225,29,72,0.03)); border:1px solid rgba(244,63,94,0.3);">
        <div class="rtc-kpi-bg-icon">📦</div>
        <div style="font-size:11px; font-weight:900; color:#f43f5e; text-transform:uppercase; letter-spacing:0.5px;">تكلفة المبيعات (سعر الشراء)</div>
        <div id="rtc-kpi-cost" style="font-size:23px; font-weight:900; color:#e11d48; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div style="font-size:11px; font-weight:800; color:#f43f5e;">سعر شراء البضاعة المباعة</div>
      </div>

      <!-- Card 3: Live Gross Profit -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.03)); border:1px solid rgba(16,185,129,0.3);">
        <div class="rtc-kpi-bg-icon">💰</div>
        <div style="font-size:11px; font-weight:900; color:#10b981; text-transform:uppercase; letter-spacing:0.5px;">مجمل الربح الصافي اللحظي</div>
        <div id="rtc-kpi-profit" style="font-size:23px; font-weight:900; color:#059669; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div style="font-size:11px; font-weight:800; color:#10b981;">صافي الربح قبل المصروفات</div>
      </div>

      <!-- Card 4: Profit Margin % -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.03)); border:1px solid rgba(245,158,11,0.3);">
        <div class="rtc-kpi-bg-icon">📊</div>
        <div style="font-size:11px; font-weight:900; color:#f59e0b; text-transform:uppercase; letter-spacing:0.5px;">نسبة هامش الربح الموزون</div>
        <div id="rtc-kpi-margin" style="font-size:23px; font-weight:900; color:#d97706; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00%</div>
        <div style="font-size:11px; font-weight:800; color:#f59e0b;">معدل الربحية المباشر</div>
      </div>

    </div>

    <!-- Threshold Color Guide Bar -->
    <div class="rtc-card" style="padding:10px 16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:between; gap:16px; font-size:11px; font-weight:800;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:12px;">🎨 دليل ألوان الربحية:</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.25);">
          <span>🔴 أقل من 6%: ضعيف / منخفض</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(245,158,11,0.12); color:#d97706; border:1px solid rgba(245,158,11,0.25);">
          <span>🟡 من 6% إلى أقل من 10%: متوسط / مقبول</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(16,185,129,0.12); color:#10b981; border:1px solid rgba(16,185,129,0.25);">
          <span>🟢 10% فأكثر: ممتاز / مرتفع</span>
        </div>
      </div>
    </div>

    <!-- Search & Records Count -->
    <div class="rtc-card" style="padding:12px 16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:260px;">
        <span style="font-size:14px; opacity:0.6;">🔍</span>
        <input type="text" id="rtc-search" placeholder="بحث برقم الفاتورة أو اسم العميل أو المندوب..." style="width:100%; background:transparent; border:none; outline:none; font-size:12px; font-weight:800; color:var(--text-0);" />
      </div>
      <div id="rtc-records-count" style="font-size:12px; font-weight:900; color:var(--text-2);">
        عرض 0 فاتورة مطابقة
      </div>
    </div>

    <!-- Invoices Breakdown Table Card -->
    <div class="rtc-card" style="overflow:hidden;">
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">#</th>
              <th class="sortable" data-sort="number">رقم الفاتورة <span id="rtc-sort-number">⇅</span></th>
              <th class="sortable" data-sort="date">التاريخ والوقت <span id="rtc-sort-date">⇣</span></th>
              <th class="sortable" data-sort="customer">العميل / المندوب <span id="rtc-sort-customer">⇅</span></th>
              <th class="sortable" data-sort="salesNet" style="text-align:left;">المبيعات (بدون VAT) <span id="rtc-sort-salesNet">⇅</span></th>
              <th class="sortable" data-sort="cost" style="text-align:left;">تكلفة الشراء (COGS) <span id="rtc-sort-cost">⇅</span></th>
              <th class="sortable" data-sort="profit" style="text-align:left;">مجمل الربح <span id="rtc-sort-profit">⇅</span></th>
              <th class="sortable" data-sort="marginPct" style="text-align:center;">نسبة الربح % <span id="rtc-sort-marginPct">⇅</span></th>
              <th style="text-align:center;">التفاصيل</th>
            </tr>
          </thead>
          <tbody id="rtc-tbody" style="font-weight:700;">
            <tr>
              <td colspan="9" style="padding:40px; text-align:center; color:var(--text-2);">
                <div style="font-size:24px; margin-bottom:8px;">🔄</div>
                <div>جارٍ تحميل فواتير المبيعات واحتساب تكلفة الشراء اللحظية...</div>
              </td>
            </tr>
          </tbody>
          <tfoot id="rtc-tfoot" style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border-soft);">
            <!-- Populated dynamically -->
          </tfoot>
        </table>
      </div>
    </div>

  </div>
  `}function J(){const r=document.getElementById("rtc-from"),e=document.getElementById("rtc-to");r?.addEventListener("change",()=>{L("custom"),v()}),e?.addEventListener("change",()=>{L("custom"),v()}),document.querySelectorAll("#rtc-module .rtc-pbtn").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.p;L(i),W(i),v()})}),document.querySelectorAll("#rtc-module th.sortable").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.sort;b===i?$=$==="asc"?"desc":"asc":(b=i,$="desc"),U(),v()})}),document.getElementById("rtc-search")?.addEventListener("input",()=>{v()}),document.getElementById("rtc-refresh-btn")?.addEventListener("click",async()=>{await q(!0)}),document.getElementById("rtc-print-btn")?.addEventListener("click",()=>{window.print()})}function U(){["number","date","customer","salesNet","cost","profit","marginPct"].forEach(e=>{const o=document.getElementById(`rtc-sort-${e}`);o&&(e===b?(o.innerText=$==="asc"?"⇡":"⇣",o.style.color="#d97706"):(o.innerText="⇅",o.style.color="var(--text-2)"))})}function L(r){document.querySelectorAll("#rtc-module .rtc-pbtn").forEach(e=>{e.dataset.p===r?e.classList.add("active"):e.classList.remove("active")})}function W(r){const e=new Date,o=a=>{const y=a.getFullYear(),x=String(a.getMonth()+1).padStart(2,"0"),m=String(a.getDate()).padStart(2,"0");return`${y}-${x}-${m}`},i=document.getElementById("rtc-from"),c=document.getElementById("rtc-to");if(!(!i||!c))if(r==="today")i.value=o(e),c.value=o(e);else if(r==="week"){const a=new Date(e);a.setDate(a.getDate()-7),i.value=o(a),c.value=o(e)}else r==="month"?(i.value=o(new Date(e.getFullYear(),e.getMonth(),1)),c.value=o(e)):r==="all"&&(i.value="2020-01-01",c.value=o(e))}async function q(r=!1){try{const[e,o,i,c]=await Promise.all([z(S.salesInvoices()),z(S.products()),z(S.customers()),z(S.users())]);j=e.filter(a=>a.status!=="cancelled"),T={},o.forEach(a=>{T[a.id]=a}),I={},i.forEach(a=>{I[a.id]=a}),C={},c.forEach(a=>{C[a.id]=a}),v()}catch(e){console.error("Error loading sales cost data:",e);const o=document.getElementById("rtc-tbody");o&&(o.innerHTML=`<tr><td colspan="9" style="padding:20px; text-align:center; color:#ef4444; font-weight:800;">خطأ في تحميل البيانات: ${e.message}</td></tr>`)}}function M(r){return r<6?{bg:"rgba(239,68,68,0.15)",color:"#ef4444",border:"rgba(239,68,68,0.3)",text:r.toFixed(1)+"%"}:r<10?{bg:"rgba(245,158,11,0.15)",color:"#d97706",border:"rgba(245,158,11,0.3)",text:r.toFixed(1)+"%"}:{bg:"rgba(16,185,129,0.15)",color:"#10b981",border:"rgba(16,185,129,0.3)",text:r.toFixed(1)+"%"}}function v(){const r=document.getElementById("rtc-from")?.value||"",e=document.getElementById("rtc-to")?.value||"",o=(document.getElementById("rtc-search")?.value||"").trim().toLowerCase(),c=j.filter(t=>{const s=t.date||"";if(r&&s<r||e&&s>e)return!1;if(o){const d=(t.number||t.invoiceNumber||"").toLowerCase(),n=(t.customerName||I[t.customerId]?.name||"").toLowerCase(),p=(t.createdByName||t.repName||C[t.createdBy]?.name||"").toLowerCase();if(!d.includes(o)&&!n.includes(o)&&!p.includes(o))return!1}return!0}).map(t=>{const s=t.number||t.invoiceNumber||t.id,d=t.date||"",n=t.customerName||I[t.customerId]?.name||"عميل عام",p=t.createdByName||t.repName||C[t.createdBy]?.name||"المبيعات";let l=0,u=0;const _=(t.lines||[]).map(f=>{const B=parseFloat(f.qty)||0,F=parseFloat(f.unitPrice||f.price)||0,V=parseFloat(f.discount)||0,k=f.subtotal!==void 0?parseFloat(f.subtotal):B*F-V,P=f.productId?T[f.productId]:null,A=parseFloat(f.costPrice||f.purchasePrice||P?.averageCost||P?.costPrice||0),N=B*A,H=k-N,Y=k>0?H/k*100:0;return l+=k,u+=N,{productName:f.productName||P?.name||f.productId,qty:B,unitPrice:F,lineSubtotal:k,unitCost:A,lineTotalCost:N,lineProfit:H,lineMargin:Y}});l<=0&&(l=parseFloat(t.subtotal||t.totalBeforeTax||0)),u<=0&&t.totalCost&&(u=parseFloat(t.totalCost));const D=l-u,O=l>0?D/l*100:0;return{inv:t,invNum:s,dateStr:d,custName:n,repName:p,invSalesNet:l,invCostSum:u,invProfit:D,invMarginPct:O,linesDetail:_}});c.sort((t,s)=>{let d,n;b==="number"?(d=t.invNum,n=s.invNum):b==="date"?(d=t.dateStr,n=s.dateStr):b==="customer"?(d=t.custName,n=s.custName):b==="salesNet"?(d=t.invSalesNet,n=s.invSalesNet):b==="cost"?(d=t.invCostSum,n=s.invCostSum):b==="profit"?(d=t.invProfit,n=s.invProfit):b==="marginPct"?(d=t.invMarginPct,n=s.invMarginPct):(d=t.dateStr,n=s.dateStr);let p=0;return typeof d=="number"&&typeof n=="number"?p=d-n:p=String(d||"").localeCompare(String(n||"")),$==="asc"?p:-p});let a=0,y=0,x=0;const m=document.getElementById("rtc-tbody");if(!m)return;if(c.length===0){m.innerHTML='<tr><td colspan="9" style="padding:40px; text-align:center; color:var(--text-2);">لا توجد فواتير مبيعات مطابقة للفترة المحددة</td></tr>',R(0,0,0,0);return}let h="";c.forEach((t,s)=>{a+=t.invSalesNet,y+=t.invCostSum,x+=t.invProfit;const d=`rtc-row-${s}`,n=`rtc-detail-${s}`,p=M(t.invMarginPct);h+=`
    <tr id="${d}">
      <td style="text-align:center; color:var(--text-2); font-family:monospace;">${s+1}</td>
      <td style="font-family:monospace; font-weight:900; color:#d97706;">${t.invNum}</td>
      <td style="color:var(--text-2); font-family:monospace;">${K(t.dateStr||t.inv.createdAt)}</td>
      <td>
        <div style="font-weight:900; color:var(--text-0);">${t.custName}</div>
        <div style="font-size:10px; color:var(--text-2); font-weight:400;">المندوب: ${t.repName}</div>
      </td>
      <td style="text-align:left; font-family:monospace; font-weight:900; color:var(--text-0);">${g(t.invSalesNet)}</td>
      <td style="text-align:left; font-family:monospace; font-weight:800; color:#e11d48;">${g(t.invCostSum)}</td>
      <td style="text-align:left; font-family:monospace; font-weight:900; color:${t.invProfit>=0?"#059669":"#e11d48"};">${g(t.invProfit)}</td>
      <td style="text-align:center;">
        <span style="padding:4px 12px; border-radius:20px; font-size:11.5px; font-weight:900; background:${p.bg}; color:${p.color}; border:1px solid ${p.border}; box-shadow:0 2px 8px ${p.color}22;">
          ${p.text}
        </span>
      </td>
      <td style="text-align:center;">
        <button onclick="window.toggleRtcDetail('${n}')" style="padding:4px 10px; border-radius:8px; font-size:10.5px; font-weight:800; border:1px solid var(--border-soft); background:var(--bg-2); color:var(--text-0); cursor:pointer;">
          🔍 التفاصيل
        </button>
      </td>
    </tr>

    <!-- Collapsible Detail Row -->
    <tr id="${n}" style="display:none; background:var(--bg-2);">
      <td colspan="9" style="padding:14px;">
        <div style="background:var(--bg-card); border-radius:12px; padding:14px; border:1px solid var(--border-soft);">
          <div style="font-size:12px; font-weight:900; color:var(--text-0); margin-bottom:8px;">
            📦 أصناف الفاتورة وحساب التكلفة المباشرة (سعر الشراء):
          </div>
          <table style="width:100%; text-align:right; font-size:11px; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-1);">
                <th style="padding:8px;">اسم الصنف</th>
                <th style="padding:8px; text-align:center;">الكمية</th>
                <th style="padding:8px; text-align:left;">سعر البيع (بدون VAT)</th>
                <th style="padding:8px; text-align:left;">إجمالي المبيعات</th>
                <th style="padding:8px; text-align:left;">سعر الشراء (التكلفة)</th>
                <th style="padding:8px; text-align:left;">إجمالي التكلفة</th>
                <th style="padding:8px; text-align:left;">الربح الصافي</th>
                <th style="padding:8px; text-align:center;">نسبة الربح %</th>
              </tr>
            </thead>
            <tbody>
              ${t.linesDetail.map(l=>{const u=M(l.lineMargin);return`
                <tr style="border-bottom:1px solid var(--border-soft);">
                  <td style="padding:8px; font-weight:800; color:var(--text-0);">${l.productName}</td>
                  <td style="padding:8px; text-align:center; font-family:monospace; font-weight:800;">${l.qty}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace;">${g(l.unitPrice)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:var(--text-0);">${g(l.lineSubtotal)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; color:#f43f5e;">${g(l.unitCost)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:#e11d48;">${g(l.lineTotalCost)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:${l.lineProfit>=0?"#059669":"#e11d48"};">${g(l.lineProfit)}</td>
                  <td style="padding:8px; text-align:center;">
                    <span style="padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:900; background:${u.bg}; color:${u.color}; border:1px solid ${u.border};">
                      ${u.text}
                    </span>
                  </td>
                </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
    `}),m.innerHTML=h;const w=document.getElementById("rtc-tfoot"),G=a>0?x/a*100:0,E=M(G);w&&(w.innerHTML=`
    <tr>
      <td colspan="4" style="padding:14px; text-align:right; font-weight:900;">الإجمالي التراكمي بالفترة المحددة:</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:#d97706; font-size:13px;">${g(a)}</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:#e11d48; font-size:13px;">${g(y)}</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:${x>=0?"#059669":"#e11d48"}; font-size:13px;">${g(x)}</td>
      <td style="padding:14px; text-align:center;">
        <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:900; background:${E.bg}; color:${E.color}; border:1px solid ${E.border};">
          ${E.text}
        </span>
      </td>
      <td style="padding:14px;"></td>
    </tr>
    `),R(a,y,x,c.length)}function R(r,e,o,i){const c=r>0?o/r*100:0,a=document.getElementById("rtc-kpi-sales"),y=document.getElementById("rtc-kpi-sales-count"),x=document.getElementById("rtc-kpi-cost"),m=document.getElementById("rtc-kpi-profit"),h=document.getElementById("rtc-kpi-margin"),w=document.getElementById("rtc-records-count");a&&(a.innerHTML=`${g(r)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`),y&&(y.innerText=`${i} فاتورة بيع`),x&&(x.innerHTML=`${g(e)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`),m&&(m.innerHTML=`${g(o)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`),h&&(h.innerText=`${c.toFixed(1)}%`),w&&(w.innerText=`عرض ${i} فاتورة مطابقة`)}window.toggleRtcDetail=function(r){const e=document.getElementById(r);e&&(e.style.display=e.style.display==="none"?"table-row":"none")};export{at as render};
