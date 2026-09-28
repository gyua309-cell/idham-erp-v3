import{g as l,a as n,f as g}from"./index-DZSjEJ7g.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let y=[],w=[],I=[],E=[],B=[],S=[],c=[];async function j(a,o){const s=a||document.getElementById("main-content");s&&(s.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Top Title Strip -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #0EA5E9, #0284C7); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(14,165,233,0.25);">
            ⚖️
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">ميزان حركة المخزون الكمي والقيمي (Stock Balance Sheet)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">رصيد أول المدة • الوارد والمشتريات • المنصرف والمبيعات • رصيد آخر المدة والتقييم الدفتري</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ طباعة الميزان</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📦 إجمالي القيمة الدفترية للمخزون</div>
          <div id="kpi-total-val" class="mono font-bold text-brand" style="font-size:20px;">0.00 ر.س</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📥 إجمالي حركة الوارد (كميات)</div>
          <div id="kpi-in-qty" class="mono font-bold text-good" style="font-size:20px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📤 إجمالي حركة المنصرف (كميات)</div>
          <div id="kpi-out-qty" class="mono font-bold text-bad" style="font-size:20px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">🏷️ إجمالي الأصناف النشطة</div>
          <div id="kpi-product-count" class="mono font-bold" style="font-size:20px; color:var(--text-0);">0</div>
        </div>
      </div>

      <!-- Controls & Search Strip -->
      <div class="card mb-16" style="padding:14px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:240px;">
          <input type="text" id="stock-search" class="form-control" placeholder="🔍 بحث باسم الصنف أو البار كود..." style="width:100%; border-radius:8px;" oninput="window._filterStockBalance()" />
        </div>
      </div>

      <!-- Balance Table -->
      <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="max-height:600px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px; width:100%;">
            <thead>
              <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                <th style="padding:10px 14px;">اسم الصنف</th>
                <th style="width:90px;">الوحدة</th>
                <th style="width:90px; text-align:center;">رصيد أول</th>
                <th style="width:90px; text-align:center; color:#10B981;">الوارد (+)</th>
                <th style="width:90px; text-align:center; color:#EF4444;">المنصرف (-)</th>
                <th style="width:100px; text-align:center; color:var(--brand);">رصيد آخر</th>
                <th style="width:110px; text-align:left;">متوسط التكلفة</th>
                <th style="width:130px; text-align:left; color:var(--brand);">إجمالي القيمة الدفترية</th>
              </tr>
            </thead>
            <tbody id="stock-balance-tbody">
              <tr><td colspan="8" style="text-align:center; padding:35px; color:var(--text-2);">⏳ جارٍ احتساب وتوليد ميزان حركة المخزون…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,window._filterStockBalance=M,await z())}async function z(){try{const[a,o,s,i,p,x]=await Promise.all([l(n.products?n.products():"products").catch(()=>[]),l(n.stockByWarehouse?n.stockByWarehouse():"stockByWarehouse").catch(()=>[]),l(n.salesInvoices?n.salesInvoices():"salesInvoices").catch(()=>[]),l(n.purchaseInvoices?n.purchaseInvoices():"purchaseInvoices").catch(()=>[]),l(n.stockTransfers?n.stockTransfers():"stockTransfers").catch(()=>[]),l(n.stockTransactions?n.stockTransactions():"stockTransactions").catch(()=>[])]);y=a,w=o,I=s,E=i,B=p,S=x,c=[...y],T()}catch(a){console.error("loadMovementData error:",a)}}function M(){const a=(document.getElementById("stock-search")?.value||"").toLowerCase().trim();a?c=y.filter(o=>o.name&&o.name.toLowerCase().includes(a)||o.code&&String(o.code).toLowerCase().includes(a)||o.barcode&&String(o.barcode).toLowerCase().includes(a)):c=[...y],T()}function T(){const a=document.getElementById("stock-balance-tbody");if(!a)return;if(!c.length){a.innerHTML='<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أصناف مطابقة للبحث</td></tr>';return}const o={};w.forEach(t=>{const e=t.productId||t.id;o[e]||(o[e]=0),o[e]+=Number(t.quantity||t.qty||0)});const s={},i={};I.forEach(t=>{t.status!=="cancelled"&&(t.items||t.lines||[]).forEach(e=>{const r=e.productId||e.id,d=Number(e.quantity||e.qty||0);r&&d>0&&(i[r]=(i[r]||0)+d)})}),E.forEach(t=>{t.status!=="cancelled"&&(t.items||t.lines||[]).forEach(e=>{const r=e.productId||e.id,d=Number(e.quantity||e.qty||0);r&&d>0&&(s[r]=(s[r]||0)+d)})}),S.forEach(t=>{const e=t.productId,r=Number(t.quantity||t.qty||0);!e||r===0||(t.type==="in"||t.type==="purchase"?s[e]=(s[e]||0)+Math.abs(r):(t.type==="out"||t.type==="sale")&&(i[e]=(i[e]||0)+Math.abs(r)))});let p=0,x=0,f=0;const L=c.map(t=>{const e=Number(t.avgCostPrice||t.costPrice||t.purchasePrice||0),r=o[t.id]!==void 0?o[t.id]:Number(t.currentStock||t.stock||0),d=s[t.id]||0,u=i[t.id]||0,q=Math.max(0,r-d+u),k=r*e;return p+=k,x+=d,f+=u,`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px; font-weight:700; color:var(--text-0);">${t.name||"—"}</td>
        <td style="color:var(--text-2);">${t.unit||"حبة"}</td>
        <td style="text-align:center;" class="mono">${q}</td>
        <td style="text-align:center;" class="mono font-bold text-good">+${d}</td>
        <td style="text-align:center;" class="mono font-bold text-bad">-${u}</td>
        <td style="text-align:center;" class="mono font-bold text-brand">${r}</td>
        <td class="mono" dir="ltr">${g(e)}</td>
        <td class="mono font-bold text-brand" dir="ltr">${g(k)}</td>
      </tr>
    `}).join("");a.innerHTML=L;const b=document.getElementById("kpi-total-val"),v=document.getElementById("kpi-in-qty"),m=document.getElementById("kpi-out-qty"),h=document.getElementById("kpi-product-count");b&&(b.innerText=g(p)),v&&(v.innerText=x.toLocaleString()),m&&(m.innerText=f.toLocaleString()),h&&(h.innerText=c.length.toLocaleString())}export{j as render};
