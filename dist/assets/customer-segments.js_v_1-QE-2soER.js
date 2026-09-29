import{g as b,a as g,u as w,o as $,r as C,f}from"./index-CEMoTDyX.js";import{e as P}from"./excel-zCoXiaxq.js";import{orderBy as E}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let r=[],x=[],p=[],m="all";const d=[{id:"vip_platinum",label:"🥇 شريحة البلاتيني (VIP)",desc:"كبار العملاء بأعلى مسحوبات شهرية وسداد ممتاز",color:"#8B5CF6",minSales:15e3},{id:"gold",label:"🥈 الشريحة الذهبية",desc:"عملاء منتظمون بمسحوبات شهرية مرتفعة",color:"#F59E0B",minSales:8e3},{id:"silver",label:"🥉 الشريحة الفضية",desc:"عملاء نشطون بمسحوبات متوسطة",color:"#3B82F6",minSales:3e3},{id:"retail_regular",label:"🏪 شريحة التجزئة العادية",desc:"مطاعم وبقالات بمسحوبات اعتيادية ونقدية",color:"#10B981",minSales:0},{id:"at_risk",label:"⚠️ في دائرة الخطر (منقطع)",desc:"عملاء لم يسجلوا أي مسحوبات منذ أكثر من 30 يوماً",color:"#EF4444",minSales:0},{id:"new_client",label:"🌱 عملاء جدد",desc:"عملاء تم تسجيلهم حديثاً في آخر 30 يوماً",color:"#06B6D4",minSales:0}];async function W(l,e){l.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="seg-search" class="input" placeholder="🔍 بحث عن عميل داخل الشريحة..." oninput="window.filterSegmentCustomers(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الشريحة</label>
        <select id="seg-select-filter" onchange="window.selectSegment(this.value)">
          <option value="all">كل الشرائح</option>
          ${d.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-primary" style="background:#25D366; border-color:#25D366;" onclick="window.openWhatsAppCampaignModal()">
          💬 إطلاق حملة واتساب للشرائح
        </button>
        <button class="btn btn-secondary" onclick="window.openPromotionsModal()">
          🎁 عروض وبونص الشرائح
        </button>
        <button class="btn btn-secondary" onclick="window.autoAnalyzeAndSegment()">⚡ تحليل وتقييم الشرائح التلقائي</button>
        <button class="btn btn-secondary" onclick="window.exportSegmentsExcel()">📊 تصدير Excel</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Segments Grid Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:20px;" id="seg-cards-grid"></div>

      <!-- Customers in Segment Table -->
      <div class="card">
        <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);" id="seg-table-title">👥 قائمة العملاء</h3>
          <span class="badge" id="seg-cust-count">0 عميل</span>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th style="text-align:left;">إجمالي مسحوبات الشهر</th>
                <th style="text-align:left;">الرصيد الحالي</th>
                <th style="text-align:center;">الشريحة الحالية</th>
                <th style="text-align:center;">تغيير الشريحة</th>
                <th style="text-align:center;">واتساب</th>
              </tr>
            </thead>
            <tbody id="seg-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحليل الشرائح...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- WhatsApp Campaign Modal -->
    <div class="modal-overlay" id="wa-campaign-modal">
      <div class="modal modal-lg" style="max-width:750px;">
        <div class="modal-header">
          <h3 class="modal-title">💬 إطلاق حملة رسائل واتساب للشريحة</h3>
          <button class="modal-close" onclick="closeModal('wa-campaign-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>الشريحة المستهدفة *</label>
              <select id="wa-camp-seg" class="input" onchange="window.updateWACampaignPreview()">
                ${d.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>نوع القالب *</label>
              <select id="wa-camp-template" class="input" onchange="window.onWACampTemplateChange()">
                <option value="promo">🎁 عرض ترويجي وخصم خاص</option>
                <option value="reorder">🔔 تذكير بتجديد الطلبية والنواقص</option>
                <option value="at_risk_recovery">❤️ عروض خاصة لاستعادة العملاء المنقطعين</option>
                <option value="debt_reminder">⚖️ تذكير بمطابقة الرصيد والسداد</option>
                <option value="custom">✏️ نص مخصص</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-12">
            <label>نص الرسالة (يمكن استخدام المتغيرات: {اسم_العميل}، {اسم_الشركة}) *</label>
            <textarea id="wa-camp-text" class="input" rows="4" oninput="window.updateWACampaignPreview()"></textarea>
          </div>

          <div style="font-weight:700; font-size:12.5px; color:var(--text-1); margin-bottom:8px;">
            👥 العملاء المستهدفون في هذه الحملة (<span id="wa-target-count">0</span> عميل):
          </div>
          <div class="table-container" style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>الجوال</th>
                  <th>المندوب</th>
                  <th style="width:100px; text-align:center;">إرسال</th>
                </tr>
              </thead>
              <tbody id="wa-targets-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('wa-campaign-modal')">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Tiered Promotions Modal -->
    <div class="modal-overlay" id="promotions-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title">🎁 عروض وبونص الشرائح (Promotion Rules)</h3>
          <button class="modal-close" onclick="closeModal('promotions-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="card mb-16" style="padding:16px; background:var(--bg-2); border:1px solid var(--border-soft);">
            <div style="font-weight:800; font-size:13px; color:var(--brand); margin-bottom:10px;">➕ إضافة عرض ترويجي جديد لشريحة:</div>
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label>الشريحة *</label>
                <select id="promo-seg" class="input">
                  ${d.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label>عنوان العرض *</label>
                <input type="text" id="promo-title" class="input" placeholder="مثال: خصم 3% إضافي" />
              </div>
              <div class="form-group">
                <label>نسبة الخصم %</label>
                <input type="number" id="promo-discount-pct" class="input mono" placeholder="3" min="0" max="50" step="0.5" />
              </div>
            </div>
            <div class="form-group mb-12">
              <label>تفاصيل ووصف البونص الترويجي</label>
              <input type="text" id="promo-desc" class="input" placeholder="مثال: احصل على كرتون شطة مجاناً عند شراء 10 كراتين زيت..." />
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.savePromotionRule()">💾 حفظ وتفعيل العرض</button>
          </div>

          <div style="font-weight:800; font-size:13px; color:var(--text-0); margin-bottom:8px;">العروض النشطة المربوطة بالشرائح:</div>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الشريحة</th>
                  <th>العرض</th>
                  <th>الخصم %</th>
                  <th>التفاصيل</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="promo-rules-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('promotions-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,await S(),_()}async function S(){try{const[l,e,t]=await Promise.all([b(g.customers(),[E("name")]).catch(()=>[]),b(g.salesInvoices()).catch(()=>[]),b(g.segmentPromotions?g.segmentPromotions():"segmentPromotions").catch(()=>[])]);r=l,x=e,p=t,v(),u()}catch(l){console.warn("Failed to load segments data:",l)}}function h(l){const e=new Date;e.setDate(e.getDate()-30);const t=e.toISOString().slice(0,10);return x.filter(a=>a.customerId===l&&(a.date||"")>=t&&a.status!=="cancelled").reduce((a,n)=>a+parseFloat(n.totalWithVat||n.total||0),0)}function v(){const l=document.getElementById("seg-cards-grid");l&&(l.innerHTML=d.map(e=>{const t=r.filter(a=>(a.segment||"retail_regular")===e.id).length,o=m===e.id;return`
      <div class="card" onclick="window.selectSegment('${e.id}')" style="padding:14px; border:1.5px solid ${o?e.color:"var(--border-soft)"}; background:${o?e.color+"10":"var(--bg-card)"}; border-radius:12px; cursor:pointer; transition:all 0.2s;">
        <div style="font-weight:800; font-size:13px; color:${e.color}; margin-bottom:4px;">${e.label}</div>
        <div style="font-size:11px; color:var(--text-2); height:32px; overflow:hidden; line-height:1.4;">${e.desc}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-soft);">
          <span style="font-size:11px; color:var(--text-3);">العملاء:</span>
          <span class="mono font-bold" style="font-size:16px; color:var(--text-0);">${t}</span>
        </div>
      </div>
    `}).join(""))}function u(l=r){const e=document.getElementById("seg-tbody"),t=document.getElementById("seg-cust-count"),o=document.getElementById("seg-table-title");if(!e)return;let a=l;if(m!=="all"){a=l.filter(s=>(s.segment||"retail_regular")===m);const n=d.find(s=>s.id===m);o&&(o.textContent=`👥 عملاء ${n?.label||"الشريحة"}`)}else o&&(o.textContent="👥 كل العملاء والشرائح");if(t&&(t.textContent=`${a.length} عميل`),!a.length){e.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا يوجد عملاء في هذه الشريحة</td></tr>';return}e.innerHTML=a.map(n=>{const s=n.segment||"retail_regular",i=d.find(c=>c.id===s)||d[3],y=h(n.id);return`
      <tr>
        <td class="font-bold">${n.name}</td>
        <td class="mono dim">${n.phone||"—"}</td>
        <td>${n.zone||"—"}</td>
        <td>${n.repName||"—"}</td>
        <td class="mono font-bold" style="text-align:left; color:var(--brand);">${f(y)}</td>
        <td class="mono font-bold" style="text-align:left; color:${(n.balance||0)>0?"var(--bad)":"var(--good)"};">${f(n.balance||0)}</td>
        <td style="text-align:center;">
          <span class="badge" style="background:${i.color}18; color:${i.color}; font-weight:800; font-size:11px;">
            ${i.label}
          </span>
        </td>
        <td style="text-align:center;">
          <select class="input" style="height:30px; font-size:11.5px; padding:2px 6px; width:130px;" onchange="window.changeCustomerSegment('${n.id}', this.value)">
            ${d.map(c=>`<option value="${c.id}" ${c.id===s?"selected":""}>${c.label}</option>`).join("")}
          </select>
        </td>
        <td style="text-align:center;">
          ${n.phone?`
            <button class="btn btn-icon sm" style="color:#25D366;" onclick="window.quickSegmentWhatsApp('${n.phone}', '${n.name.replace(/'/g,"\\'")}', '${i.label}')" title="محادثة واتساب">💬</button>
          `:"—"}
        </td>
      </tr>
    `}).join("")}function _(){window.selectSegment=e=>{m=e;const t=document.getElementById("seg-select-filter");t&&(t.value=e),v(),u()},window.filterSegmentCustomers=e=>{e=(e||"").trim().toLowerCase();const t=r.filter(o=>!e||(o.name||"").toLowerCase().includes(e)||(o.phone||"").includes(e)||(o.zone||"").toLowerCase().includes(e));u(t)},window.changeCustomerSegment=async(e,t)=>{try{await w("customers",e,{segment:t});const o=r.find(a=>a.id===e);o&&(o.segment=t),v(),u()}catch(o){alert("فشل تحديث الشريحة: "+o.message)}},window.quickSegmentWhatsApp=(e,t,o)=>{const a=e.replace(/[^0-9]/g,""),n=a.startsWith("0")?"966"+a.slice(1):a.startsWith("966")?a:"966"+a,s=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",i=`مرحباً ${t}، عميلنا المميز في (${o}) لدى ${s} 🌿

نود إفادتكم بتوفر عروض وأسعار خاصة لطلبياتكم القادمة. يسعدنا خدمتكم دائماً!`;window.open(`https://api.whatsapp.com/send?phone=${n}&text=${encodeURIComponent(i)}`,"_blank")},window.openWhatsAppCampaignModal=()=>{document.getElementById("wa-camp-seg").value=m!=="all"?m:"vip_platinum",window.onWACampTemplateChange(),openModal("wa-campaign-modal")},window.onWACampTemplateChange=()=>{const e=document.getElementById("wa-camp-template").value,t=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية";let o="";e==="promo"?o=`مرحباً {اسم_العميل}، يسعدنا في ${t} أن نقدم لكم عروضاً وخصومات حصرية على قائمة المواد الغذائية والتغليف لهذا الأسبوع! تواصل معنا لتأكيد طلبيتك بأفضل الأسعار.`:e==="reorder"?o=`مرحباً {اسم_العميل}، نود الاطمئنان على احتياجاتكم من المواد الغذائية والتوريدات الدورية لدى ${t}. هل ترغبون في جدولة زيارة المندوب اليوم؟`:e==="at_risk_recovery"?o=`مرحباً {اسم_العميل}، افتقدنا تعاملكم معنا في ${t} ❤️ يسعدنا تقديم خصم خاص واستثنائي بنسبة 5% على أول طلبية قادمة لتشريفنا بخدمتكم مجدداً!`:e==="debt_reminder"&&(o=`مرحباً {اسم_العميل}، نرجو التكرم بمراجعة ملخص كشف الحساب المسجل لدى ${t} لجدولة السداد ومطابقة الرصيد. شاكرين حسن تعاونكم معنا.`),document.getElementById("wa-camp-text").value=o,window.updateWACampaignPreview()},window.updateWACampaignPreview=()=>{const e=document.getElementById("wa-camp-seg").value,t=document.getElementById("wa-camp-text").value,o=r.filter(n=>(n.segment||"retail_regular")===e);document.getElementById("wa-target-count").textContent=o.length;const a=document.getElementById("wa-targets-tbody");if(a){if(!o.length){a.innerHTML='<tr><td colspan="4" style="text-align:center; padding:16px; color:var(--text-2);">لا يوجد عملاء في هذه الشريحة</td></tr>';return}a.innerHTML=o.map(n=>{const s=t.replace(/\{اسم_العميل\}/g,n.name).replace(/\{اسم_الشركة\}/g,window.ERP_COMPANY?.name||"مؤسسة إدهام"),i=(n.phone||"").replace(/[^0-9]/g,""),c=`https://api.whatsapp.com/send?phone=${i.startsWith("0")?"966"+i.slice(1):i.startsWith("966")?i:"966"+i}&text=${encodeURIComponent(s)}`;return`
        <tr>
          <td class="font-bold">${n.name}</td>
          <td class="mono dim">${n.phone||"—"}</td>
          <td>${n.repName||"—"}</td>
          <td style="text-align:center;">
            ${n.phone?`
              <a href="${c}" target="_blank" class="btn btn-sm" style="background:#25D366; color:#fff; text-decoration:none; padding:3px 10px; font-size:11px; border-radius:6px; display:inline-block;">
                💬 إرسال
              </a>
            `:'<span style="font-size:11px; color:var(--text-3);">بلا هاتف</span>'}
          </td>
        </tr>
      `}).join("")}},window.openPromotionsModal=()=>{l(),openModal("promotions-modal")},window.savePromotionRule=async()=>{const e=document.getElementById("promo-seg").value,t=document.getElementById("promo-title").value.trim(),o=parseFloat(document.getElementById("promo-discount-pct").value)||0,a=document.getElementById("promo-desc").value.trim();if(!t){alert("يرجى كتابة عنوان العرض");return}const n={segmentId:e,segmentName:d.find(s=>s.id===e)?.label||e,title:t,discountPct:o,description:a,status:"active"};try{await $("segmentPromotions",n),p=await b(g.segmentPromotions?g.segmentPromotions():"segmentPromotions").catch(()=>[]),document.getElementById("promo-title").value="",document.getElementById("promo-discount-pct").value="",document.getElementById("promo-desc").value="",l()}catch(s){alert("فشل الحفظ: "+s.message)}},window.deletePromotionRule=async e=>{if(confirm("هل تريد حذف هذا العرض الترويجي؟"))try{await C("segmentPromotions",e),p=p.filter(t=>t.id!==e),l()}catch(t){alert("فشل الحذف: "+t.message)}};function l(){const e=document.getElementById("promo-rules-tbody");if(e){if(!p.length){e.innerHTML='<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد عروض بونص مسجلة بعد</td></tr>';return}e.innerHTML=p.map(t=>`
      <tr>
        <td class="font-bold">${t.segmentName||t.segmentId}</td>
        <td style="color:var(--brand); font-weight:700;">${t.title}</td>
        <td class="mono font-bold" style="color:var(--good);">${t.discountPct}%</td>
        <td style="font-size:11.5px; color:var(--text-2);">${t.description||"—"}</td>
        <td>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deletePromotionRule('${t.id}')">✕</button>
        </td>
      </tr>
    `).join("")}}window.autoAnalyzeAndSegment=async()=>{if(!confirm("هل تريد تشغيل الخوارزمية الذكية لتصنيف العملاء آلياً حسب حجم المسحوبات في آخر 30 يوماً؟"))return;let e=0;const t=new Date;for(const o of r){const a=h(o.id);let n="retail_regular";a>=15e3?n="vip_platinum":a>=8e3?n="gold":a>=3e3?n="silver":a===0&&(!o.createdAt||t-new Date(o.createdAt.seconds*1e3)>30*864e5)&&(n="at_risk"),o.segment!==n&&(await w("customers",o.id,{segment:n}),o.segment=n,e++)}alert(`✅ تم اكتمال التحليل وتحديث شرائح ${e} عميل تلقائياً!`),v(),u()},window.exportSegmentsExcel=()=>{const e=r.map(t=>({"اسم العميل":t.name,الهاتف:t.phone,المنطقة:t.zone,المندوب:t.repName,الشريحة:d.find(o=>o.id===(t.segment||"retail_regular"))?.label||t.segment,"الرصيد الحالي":t.balance||0,"مسحوبات الشهر":h(t.id)}));P(e)}}export{W as render};
