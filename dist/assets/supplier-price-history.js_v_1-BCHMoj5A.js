import{g as y,a as f,f as d}from"./index-DaYejt0r.js";import{e as N}from"./excel-zCoXiaxq.js";import{orderBy as b}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let l=[],h=[],$=[],u=null;async function Q(i,s){i.innerHTML=`
    <div class="filterbar no-print">
      <div class="filter-select-group" style="min-width:280px;">
        <label>اختر الصنف لتتبع أسعار الشراء التاريخية *</label>
        <select id="price-hist-prod" class="input" onchange="window.onPriceHistoryProductChange(this.value)">
          <option value="">-- اختر الصنف لتتبع الأسعار --</option>
        </select>
      </div>

      <div class="filter-select-group">
        <label>المورد (اختياري)</label>
        <select id="price-hist-sup" class="input" onchange="window.reloadPriceHistory()">
          <option value="">كل الموردين</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportPriceHistoryExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.printPriceHistory()">🖨️ طباعة التقرير</button>
      </div>
    </div>

    <div class="page-content" id="price-history-content">
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:44px; margin-bottom:12px;">📈</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">يرجى اختيار صنف لعرض حركة أسعار الشراء التاريخية</div>
        <div style="font-size:12px; margin-top:4px;">يقوم النظام بمسح كافة فواتير المشتريات وتحليل أسعار الشراء وتقلبات السوق لكل صنف</div>
      </div>
    </div>
  `,await M(),C()}async function M(){try{const[i,s,o]=await Promise.all([y(f.products(),[b("name")]).catch(()=>[]),y(f.suppliers(),[b("name")]).catch(()=>[]),y(f.purchaseInvoices(),[b("date","desc")]).catch(()=>[])]);l=i,h=s,$=o.filter(r=>r.status!=="cancelled"),F()}catch(i){console.warn("Error loading price history data:",i)}}function F(){const i=document.getElementById("price-hist-prod"),s=document.getElementById("price-hist-sup");i&&(i.innerHTML='<option value="">-- اختر الصنف لتتبع الأسعار --</option>'+l.map(o=>`<option value="${o.id}">${o.name} (${o.unit||"حبة"})</option>`).join(""),l.length>0&&(i.value=l[0].id,u=l[0].id,window.reloadPriceHistory())),s&&(s.innerHTML='<option value="">كل الموردين</option>'+h.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""))}function z(i,s=""){const o=[],r=l.find(e=>e.id===i);return $.forEach(e=>{s&&e.supplierId!==s||(e.lines||e.items||[]).forEach(a=>{(a.productId===i||r&&(a.productName===r.name||a.name===r.name))&&o.push({date:e.date||e.invoiceDate||"",invoiceNumber:e.number||e.invoiceNumber||e.id.slice(0,8),supplierId:e.supplierId,supplierName:e.supplierName||h.find(c=>c.id===e.supplierId)?.name||"مورد",unit:a.unit||r?.unit||"كرتون",qty:parseFloat(a.qty||a.quantity||1),unitPrice:parseFloat(a.unitPrice||a.price||0),total:parseFloat(a.total||(a.qty||1)*(a.unitPrice||0))})})}),o.sort((e,a)=>(e.date||"").localeCompare(a.date||"")),o}function I(i){const s=document.getElementById("price-history-content");if(!s)return;const o=l.find(t=>t.id===i),r=document.getElementById("price-hist-sup")?.value||"",e=z(i,r);if(!o)return;if(!e.length){s.innerHTML=`
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">🔍</div>
        <div style="font-size:15px; font-weight:700;">لا توجد فواتير شراء مسجلة لهذا الصنف (${o.name})</div>
        <div style="font-size:12px; margin-top:4px;">سعر التكلفة الحالي المسجل في بطاقة الصنف: <b>${d(o.costPrice||o.purchasePrice||0)}</b></div>
      </div>
    `;return}const a=e.map(t=>t.unitPrice),c=Math.min(...a),p=Math.max(...a),H=e[e.length-1].unitPrice,v=a.reduce((t,n)=>t+n,0)/a.length,m={};e.forEach(t=>{m[t.supplierName]||(m[t.supplierName]={name:t.supplierName,prices:[],count:0,totalQty:0}),m[t.supplierName].prices.push(t.unitPrice),m[t.supplierName].count+=1,m[t.supplierName].totalQty+=t.qty});const P=Object.values(m).map(t=>({name:t.name,minPrice:Math.min(...t.prices),maxPrice:Math.max(...t.prices),avgPrice:t.prices.reduce((n,x)=>n+x,0)/t.prices.length,lastPrice:t.prices[t.prices.length-1],totalPurchasedQty:t.totalQty})).sort((t,n)=>t.avgPrice-n.avgPrice),E=P[0];s.innerHTML=`
    <!-- Top Price KPI Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">آخر سعر شراء مسجل</div>
        <div class="mono font-bold" style="font-size:20px; color:var(--brand); margin-top:4px;">${d(H)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">بتاريخ: ${e[e.length-1].date}</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#10B981; font-weight:700;">أقل سعر شراء تاريخي (الأفضل)</div>
        <div class="mono font-bold" style="font-size:20px; color:#10B981; margin-top:4px;">${d(c)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">وفر: ${d(p-c)} عن أعلى سعر</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#EF4444; font-weight:700;">أعلى سعر شراء تاريخي</div>
        <div class="mono font-bold" style="font-size:20px; color:#EF4444; margin-top:4px;">${d(p)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">فارق تذبذب: ${((p-c)/c*100).toFixed(1)}%</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--indigo); font-weight:700;">متوسط سعر الشراء العام</div>
        <div class="mono font-bold" style="font-size:20px; color:var(--indigo); margin-top:4px;">${d(v)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">أفضل مورد: <b>${E?.name||"—"}</b></div>
      </div>
    </div>

    <!-- Visual Trend & Supplier Comparison Grid -->
    <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:16px; margin-bottom:16px;">
      
      <!-- Visual Price Fluctuation Bars -->
      <div class="card" style="padding:18px;">
        <h4 style="margin:0 0 16px; font-size:13.5px; font-weight:800; color:var(--text-0);">
          📈 تدرج أسعار الشراء عبر فواتير المشتريات (آخر ${Math.min(12,e.length)} حركة):
        </h4>
        <div style="display:flex; height:160px; align-items:flex-end; gap:14px; padding:0 10px 10px; border-bottom:1px solid var(--border-soft);">
          ${e.slice(-12).map(t=>{const n=p>0?t.unitPrice/p*100:50,x=t.unitPrice===c,g=t.unitPrice===p,w=x?"#10B981":g?"#EF4444":"var(--brand)";return`
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;">
                <div class="mono font-bold" style="font-size:9.5px; color:${w}; margin-bottom:4px;">${t.unitPrice}</div>
                <div style="width:100%; max-width:24px; height:${Math.max(15,n)}%; background:${w}; border-radius:4px 4px 0 0;" title="${t.supplierName} - ${t.date}"></div>
                <div class="mono dim" style="font-size:8.5px; margin-top:6px; white-space:nowrap; transform:rotate(-25deg); transform-origin:top right;">${t.date.slice(5)}</div>
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Supplier Comparison Ranking -->
      <div class="card" style="padding:18px;">
        <h4 style="margin:0 0 12px; font-size:13.5px; font-weight:800; color:var(--text-0);">
          🏆 ترتيب الموردين الأفضل سعراً لهذا الصنف:
        </h4>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:160px; overflow-y:auto;">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr>
                <th>المورد</th>
                <th style="text-align:left;">متوسط السعر</th>
                <th style="text-align:left;">أقل سعر</th>
                <th style="text-align:center;">إجمالي الكميات</th>
              </tr>
            </thead>
            <tbody>
              ${P.map((t,n)=>`
                <tr>
                  <td>
                    ${n===0?"🥇 ":n===1?"🥈 ":""}<b>${t.name}</b>
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:var(--brand);">${d(t.avgPrice)}</td>
                  <td class="mono font-bold text-good" style="text-align:left;">${d(t.minPrice)}</td>
                  <td class="mono" style="text-align:center;">${t.totalPurchasedQty}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Complete Transaction History Table -->
    <div class="card">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
          📑 سجل فواتير الشراء التاريخية للصنف: <span style="color:var(--brand);">${o.name}</span>
        </h3>
        <span class="badge" style="font-size:12px;">${e.length} فاتورة مسجلة</span>
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
            ${e.map(t=>{const n=v>0?(t.unitPrice-v)/v*100:0,x=n>2,g=n<-2;return`
                <tr>
                  <td class="mono dim">${t.date||"—"}</td>
                  <td class="mono font-bold" style="color:var(--brand);">${t.invoiceNumber}</td>
                  <td class="font-bold">${t.supplierName}</td>
                  <td>${t.unit}</td>
                  <td class="mono" style="text-align:center;">${t.qty}</td>
                  <td class="mono font-bold" style="text-align:left; font-size:13px;">${d(t.unitPrice)}</td>
                  <td class="mono font-bold" style="text-align:left;">${d(t.total)}</td>
                  <td style="text-align:center;">
                    ${g?`<span class="badge good">وفر ${Math.abs(n).toFixed(1)}%</span>`:x?`<span class="badge bad">أعلى ${n.toFixed(1)}%</span>`:'<span class="badge neutral">مطابق</span>'}
                  </td>
                </tr>
              `}).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function C(){window.onPriceHistoryProductChange=i=>{u=i,window.reloadPriceHistory()},window.reloadPriceHistory=()=>{const i=document.getElementById("price-hist-prod")?.value||u;i&&I(i)},window.printPriceHistory=()=>{window.print()},window.exportPriceHistoryExcel=()=>{if(!u)return;const i=l.find(r=>r.id===u),o=z(u).map(r=>({الصنف:i?.name||"صنف",التاريخ:r.date,"رقم الفاتورة":r.invoiceNumber,المورد:r.supplierName,الوحدة:r.unit,الكمية:r.qty,"سعر الشراء":r.unitPrice,الإجمالي:r.total}));N(o,`تاريخ_أسعار_${i?.name||"الصنف"}`)}}export{Q as render};
