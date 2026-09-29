import{g as x,a as p,f as c,o as L,u as E}from"./index-3Bsn2yrt.js";import{e as I}from"./excel-zCoXiaxq.js";import{orderBy as h}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let i=[],m=[],f="customers",r={redeemRate:.5};const B=()=>new Date().toISOString().slice(0,10);async function j(t,o){t.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="loy-search" class="input" placeholder="🔍 بحث عن عميل..." oninput="window.filterLoyalty(this.value)" />
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-primary btn-sm" id="loy-tab-custs" onclick="window.switchLoyaltyTab('customers')">👥 أرصدة العملاء</button>
        <button class="btn btn-secondary btn-sm" id="loy-tab-hist" onclick="window.switchLoyaltyTab('history')">📜 سجل الحركات</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.openLoyaltyAdjustModal()">🎁 منح نقاط بونص / تسوية</button>
        <button class="btn btn-secondary" onclick="window.exportLoyaltyExcel()">📊 Excel</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي النقاط النشطة</div>
          <div class="mono" id="loy-kpi-active" style="font-size:22px; font-weight:900; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">القيمة المالية المتاحة للخصم</div>
          <div class="mono" id="loy-kpi-val" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(59,130,246,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">إجمالي النقاط المكتسبة</div>
          <div class="mono" id="loy-kpi-earned" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">النقاط المستبدلة بخصومات</div>
          <div class="mono" id="loy-kpi-redeemed" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="loy-content-area"></div>
    </div>

    <!-- Adjust / Redeem Modal -->
    <div class="modal-overlay" id="loyalty-modal">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <h3 class="modal-title" id="loy-modal-title">🎁 منح نقاط ولاء / تسوية</h3>
          <button class="modal-close" onclick="closeModal('loyalty-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="form-group mb-12">
            <label>العميل *</label>
            <select id="loy-modal-cust" class="input">
              <option value="">-- اختر العميل --</option>
            </select>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="loy-modal-type" class="input" onchange="window.onLoyTypeChange()">
                <option value="bonus">🎁 إضافة نقاط بونص ومكافأة</option>
                <option value="redeem">💸 استبدال نقاط بخصم نقدي</option>
                <option value="adjustment">⚖️ تسوية رصيد نقاط</option>
              </select>
            </div>
            <div class="form-group">
              <label>عدد النقاط *</label>
              <input type="number" id="loy-modal-points" class="input mono" placeholder="100" min="1" oninput="window.updateLoyValPreview()" />
            </div>
          </div>

          <div id="loy-val-preview" style="background:rgba(99,102,241,0.06); padding:10px 14px; border-radius:8px; margin-bottom:12px; font-size:12.5px; color:var(--brand); font-weight:700;">
            القيمة المعادلة: 0.00 ر.س
          </div>

          <div class="form-group">
            <label>البيان / سبب المنح أو الاستبدال *</label>
            <input type="text" id="loy-modal-notes" class="input" placeholder="مثال: مكافأة سداد نقدي مبكر..." />
          </div>

          <div id="loy-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('loyalty-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveLoyaltyTx()">💾 تأكيد وحفظ</button>
        </div>
      </div>
    </div>
  `,await w(),$()}async function w(){try{const[t,o]=await Promise.all([x(p.customers(),[h("name")]).catch(()=>[]),x(p.loyaltyTransactions?p.loyaltyTransactions():"loyaltyTransactions",[h("date","desc")]).catch(()=>[])]);i=t,m=o,k(),P(),u()}catch(t){console.warn("Failed to load loyalty data:",t)}}function P(){const t=i.reduce((n,l)=>n+(parseInt(l.loyaltyPointsEarned)||parseInt(l.loyaltyPoints)||0),0),o=i.reduce((n,l)=>n+(parseInt(l.loyaltyPointsRedeemed)||0),0),e=i.reduce((n,l)=>n+(parseInt(l.loyaltyPoints)||0),0),a=e*r.redeemRate,s=(n,l)=>{const d=document.getElementById(n);d&&(d.textContent=l)};s("loy-kpi-active",e.toLocaleString()),s("loy-kpi-val",c(a)),s("loy-kpi-earned",t.toLocaleString()),s("loy-kpi-redeemed",o.toLocaleString())}function k(){const t=document.getElementById("loy-modal-cust");t&&(t.innerHTML='<option value="">-- اختر العميل --</option>'+i.map(o=>`<option value="${o.id}">${o.name} (رصيده: ${o.loyaltyPoints||0} نقطة)</option>`).join(""))}function u(t=i){const o=document.getElementById("loy-content-area");o&&(f==="customers"?o.innerHTML=`
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th style="text-align:left;">إجمالي النقاط المكتسبة</th>
                <th style="text-align:left;">النقاط المستبدلة</th>
                <th style="text-align:left;">رصيد النقاط الحالي</th>
                <th style="text-align:left;">القيمة بالريال</th>
                <th style="text-align:center;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(e=>{const a=parseInt(e.loyaltyPoints)||0,s=parseInt(e.loyaltyPointsEarned)||a,n=parseInt(e.loyaltyPointsRedeemed)||0,l=a*r.redeemRate;return`
                  <tr>
                    <td class="font-bold">${e.name}</td>
                    <td class="mono dim">${e.phone||"—"}</td>
                    <td>${e.zone||"—"}</td>
                    <td>${e.repName||"—"}</td>
                    <td class="mono" style="text-align:left;">${s.toLocaleString()}</td>
                    <td class="mono" style="text-align:left; color:#F59E0B;">${n.toLocaleString()}</td>
                    <td class="mono font-bold" style="text-align:left; font-size:14px; color:var(--brand);">${a.toLocaleString()}</td>
                    <td class="mono font-bold" style="text-align:left; color:#10B981;">${c(l)}</td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary btn-sm" onclick="window.quickRewardCustomer('${e.id}')" style="font-size:11px; padding:3px 8px;">
                        🎁 مكافأة
                      </button>
                    </td>
                  </tr>
                `}).join("")}
              ${t.length?"":'<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا يوجد عملاء</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `:o.innerHTML=`
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:105px;">التاريخ</th>
                <th>العميل</th>
                <th>نوع الحركة</th>
                <th style="text-align:left;">النقاط</th>
                <th style="text-align:left;">القيمة المعادلة</th>
                <th>البيان والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${m.map(e=>{const a=e.points>0;return`
                  <tr>
                    <td class="mono dim">${e.date||"—"}</td>
                    <td class="font-semibold">${e.customerName}</td>
                    <td>
                      <span class="badge ${a?"good":"warn"}">
                        ${e.type==="bonus"?"🎁 مكافأة بونص":e.type==="invoice"?"🧾 شراء فاتورة":"💸 استبدال خصم"}
                      </span>
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:${a?"var(--good)":"#F59E0B"};">
                      ${a?"+":""}${e.points}
                    </td>
                    <td class="mono" style="text-align:left;">${c(Math.abs(e.points)*r.redeemRate)}</td>
                    <td style="font-size:12px; color:var(--text-2);">${e.notes||"—"}</td>
                  </tr>
                `}).join("")}
              ${m.length?"":'<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات نقاط مسجلة</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `)}function $(){window.switchLoyaltyTab=t=>{f=t,document.getElementById("loy-tab-custs")?.classList.toggle("btn-primary",t==="customers"),document.getElementById("loy-tab-custs")?.classList.toggle("btn-secondary",t!=="customers"),document.getElementById("loy-tab-hist")?.classList.toggle("btn-primary",t==="history"),document.getElementById("loy-tab-hist")?.classList.toggle("btn-secondary",t!=="history"),u()},window.filterLoyalty=t=>{t=(t||"").trim().toLowerCase();const o=i.filter(e=>!t||(e.name||"").toLowerCase().includes(t)||(e.phone||"").includes(t));u(o)},window.openLoyaltyAdjustModal=(t="")=>{document.getElementById("loy-modal-cust").value=t,document.getElementById("loy-modal-type").value="bonus",document.getElementById("loy-modal-points").value="100",document.getElementById("loy-modal-notes").value="",document.getElementById("loy-modal-err").classList.add("hidden"),window.updateLoyValPreview(),openModal("loyalty-modal")},window.quickRewardCustomer=t=>{window.openLoyaltyAdjustModal(t)},window.updateLoyValPreview=()=>{const o=(parseFloat(document.getElementById("loy-modal-points")?.value)||0)*r.redeemRate,e=document.getElementById("loy-val-preview");e&&(e.textContent=`القيمة المعادلة: ${c(o)}`)},window.saveLoyaltyTx=async()=>{const t=document.getElementById("loy-modal-err");t.classList.add("hidden");const o=document.getElementById("loy-modal-cust").value,e=i.find(y=>y.id===o);let a=parseInt(document.getElementById("loy-modal-points").value)||0;const s=document.getElementById("loy-modal-type").value,n=document.getElementById("loy-modal-notes").value.trim();if(!o){t.textContent="يرجى اختيار العميل",t.classList.remove("hidden");return}if(a<=0){t.textContent="الرجاء إدخال عدد نقاط أكبر من 0",t.classList.remove("hidden");return}if(!n){t.textContent="الرجاء كتابة البيان وسبب الحركة",t.classList.remove("hidden");return}const l=parseInt(e.loyaltyPoints)||0;let d=a;if(s==="redeem"){if(a>l){t.textContent=`رصيد نقاط العميل (${l}) غير كافٍ للاستبدال`,t.classList.remove("hidden");return}d=-a}const v=l+d,g=(parseInt(e.loyaltyPointsEarned)||l)+(d>0?d:0),b=(parseInt(e.loyaltyPointsRedeemed)||0)+(d<0?Math.abs(d):0);try{await L("loyaltyTransactions",{customerId:o,customerName:e.name,date:B(),type:s,points:d,notes:n}),await E("customers",o,{loyaltyPoints:v,loyaltyPointsEarned:g,loyaltyPointsRedeemed:b}),e.loyaltyPoints=v,e.loyaltyPointsEarned=g,e.loyaltyPointsRedeemed=b,closeModal("loyalty-modal"),await w()}catch(y){t.textContent=y.message,t.classList.remove("hidden")}},window.exportLoyaltyExcel=()=>{const t=i.map(o=>({العميل:o.name,الهاتف:o.phone,المنطقة:o.zone,"النقاط المكتسبة":o.loyaltyPointsEarned||o.loyaltyPoints||0,"النقاط المستبدلة":o.loyaltyPointsRedeemed||0,"الرصيد الحالي":o.loyaltyPoints||0,"القيمة المالية":(o.loyaltyPoints||0)*r.redeemRate}));I(t)}}export{j as render};
