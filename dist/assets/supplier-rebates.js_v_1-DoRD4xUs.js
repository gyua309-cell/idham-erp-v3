import{g as v,a as u,u as E,o as k,r as $,f as c}from"./index-CnctmNGr.js";import{e as R}from"./excel-zCoXiaxq.js";import{orderBy as f}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[],y=[],h=[];const d=()=>new Date().getFullYear();async function j(e,t){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="reb-search" class="input" placeholder="🔍 بحث في اتفاقيات البونص..." oninput="window.filterRebates(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>السنة المالية</label>
        <select id="reb-year-filter" onchange="window.filterRebates()">
          <option value="${d()}">${d()}</option>
          <option value="${d()-1}">${d()-1}</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportRebatesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openRebateModal()">+ إضافة هدف وبونص سنوي لمورد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي اتفاقيات البونص السنوية</div>
          <div class="mono" id="reb-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1.5px solid rgba(16,185,129,0.3); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">💰 إجمالي البونص المكتسب حتى الآن</div>
          <div class="mono" id="reb-kpi-earned" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي المشتريات المحققة</div>
          <div class="mono" id="reb-kpi-achieved" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">أهداف المشتريات السنوية المستهدفة</div>
          <div class="mono" id="reb-kpi-target" style="font-size:18px; font-weight:900; color:#F59E0B; margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Rebates Visual Progress Cards -->
      <div id="reb-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;"></div>
    </div>

    <!-- Rebate Modal -->
    <div class="modal-overlay" id="rebate-modal">
      <div class="modal modal-lg" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title" id="reb-modal-title">➕ إضافة اتفاقية بونص وهدف سنوي</h3>
          <button class="modal-close" onclick="closeModal('rebate-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="reb-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المستهدف *</label>
              <select id="reb-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>السنة المالية *</label>
              <input type="number" id="reb-year" class="input mono" value="${d()}" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>قيمة المشتريات السنوية المستهدفة (ر.س) *</label>
              <input type="number" id="reb-target-val" class="input mono" placeholder="100000" min="1000" />
            </div>
            <div class="form-group">
              <label>نسبة البونص / الحافز السنوي (Rebate %) *</label>
              <input type="number" id="reb-pct" class="input mono" placeholder="3.0" min="0.1" max="25" step="0.1" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>شروط استحقاق البونص وطريقة التسوية</label>
            <input type="text" id="reb-terms" class="input" placeholder="مثال: يصرف كخصم نقدي في نهاية السنة المالية أو بضاعة مجانية..." />
          </div>

          <div class="form-group">
            <label>ملاحظات إضافية</label>
            <textarea id="reb-notes" class="input" rows="2" placeholder="أي تفاصيل خاصة بالاتفاقية..."></textarea>
          </div>

          <div id="reb-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rebate-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveRebate()">💾 حفظ الاتفاقية</button>
        </div>
      </div>
    </div>
  `,await g(),C()}async function g(){try{const[e,t,a]=await Promise.all([v(u.supplierRebates?u.supplierRebates():"supplierRebates",[f("createdAt","desc")]).catch(()=>[]),v(u.suppliers(),[f("name")]).catch(()=>[]),v(u.purchaseInvoices()).catch(()=>[])]);b=e,y=t,h=a.filter(o=>o.status!=="cancelled"),z(),w(),I()}catch(e){console.warn("Error loading supplier rebates data:",e)}}function x(e,t){return h.filter(o=>o.supplierId===e&&(o.date||"").startsWith(String(t))).reduce((o,r)=>o+parseFloat(r.totalWithVat||r.total||0),0)}function w(){const e=parseInt(document.getElementById("reb-year-filter")?.value)||d(),t=b.filter(i=>(parseInt(i.year)||d())===e);let a=0,o=0,r=0;t.forEach(i=>{const l=x(i.supplierId,e),s=parseFloat(i.targetValue)||1,m=parseFloat(i.rebatePct)||0;a+=s,o+=l,r+=l*(m/100)});const n=(i,l)=>{const s=document.getElementById(i);s&&(s.textContent=l)};n("reb-kpi-total",t.length),n("reb-kpi-earned",c(r)),n("reb-kpi-achieved",c(o)),n("reb-kpi-target",c(a))}function z(){const e=document.getElementById("reb-sup-id");e&&(e.innerHTML='<option value="">-- اختر المورد --</option>'+y.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}function I(e=b){const t=document.getElementById("reb-cards-grid");if(!t)return;const a=parseInt(document.getElementById("reb-year-filter")?.value)||d(),o=e.filter(r=>(parseInt(r.year)||d())===a);if(!o.length){t.innerHTML=`
      <div class="card" style="grid-column:1/-1; padding:48px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🎯</div>
        <div style="font-size:16px; font-weight:700;">لا توجد اتفاقيات بونص سنوية مسجلة لعام ${a}</div>
        <div style="font-size:12px; margin-top:4px;">انقر على "+ إضافة هدف وبونص سنوي لمورد" لتوثيق أهداف التوريد والحوافز</div>
      </div>
    `;return}t.innerHTML=o.map(r=>{const n=x(r.supplierId,a),i=parseFloat(r.targetValue)||1e5,l=parseFloat(r.rebatePct)||3,s=Math.min(100,Math.round(n/i*100)),m=n*(l/100),B=i*(l/100),p=n>=i;return`
      <div class="card" style="padding:18px; border:1.5px solid ${p?"rgba(16,185,129,0.4)":"var(--border-soft)"}; background:${p?"rgba(16,185,129,0.03)":"var(--bg-card)"}; border-radius:14px; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div>
            <div style="font-weight:800; font-size:15px; color:var(--text-0);">${r.supplierName}</div>
            <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">اتفاقية بونص عام ${r.year||a} • نسبة الحافز: <b style="color:#10B981;">${l}%</b></div>
          </div>
          <span class="badge" style="background:${p?"#10B981":"#6366F1"}18; color:${p?"#10B981":"var(--brand)"}; font-weight:800; font-size:11px;">
            ${p?"🎉 تم تحقيق الهدف!":`إنجاز ${s}%`}
          </span>
        </div>

        <!-- Progress Bar -->
        <div style="margin:8px 0 14px;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
            <span>المحقق: <b class="mono text-brand">${c(n)}</b></span>
            <span>الهدف: <b class="mono">${c(i)}</b></span>
          </div>
          <div style="height:10px; background:var(--bg-2); border-radius:10px; overflow:hidden; border:1px solid var(--border-soft);">
            <div style="height:100%; width:${s}%; background:${p?"#10B981":"linear-gradient(to left, #6366F1, #8B5CF6)"}; border-radius:10px; transition:width 0.3s;"></div>
          </div>
        </div>

        <!-- Incentive Calculations Matrix -->
        <div style="background:var(--bg-2); border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div><span style="color:var(--text-3);">البونص المكتسب حالياً:</span></div>
          <div style="text-align:left;"><b class="mono font-bold text-good" style="font-size:13px;">+ ${c(m)}</b></div>
          <div><span style="color:var(--text-3);">البونص عند اكتمال الهدف:</span></div>
          <div style="text-align:left;"><b class="mono font-bold" style="font-size:13px; color:var(--brand);">${c(B)}</b></div>
        </div>

        ${r.terms?`
          <div style="font-size:11.5px; color:var(--text-2); margin-bottom:12px; line-height:1.4;">
            <b>الشروط:</b> ${r.terms}
          </div>
        `:""}

        <!-- Actions -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:10px; border-top:1px dashed var(--border-soft);">
          <button class="btn btn-secondary btn-sm" onclick="window.editRebate('${r.id}')">✏️ تعديل</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteRebate('${r.id}')" title="حذف">🗑️</button>
        </div>
      </div>
    `}).join("")}function C(){window.filterRebates=()=>{const e=(document.getElementById("reb-search")?.value||"").trim().toLowerCase(),t=parseInt(document.getElementById("reb-year-filter")?.value)||d(),a=b.filter(o=>{const r=!e||(o.supplierName||"").toLowerCase().includes(e)||(o.terms||"").toLowerCase().includes(e),n=(parseInt(o.year)||d())===t;return r&&n});w(),I(a)},window.openRebateModal=()=>{document.getElementById("reb-edit-id").value="",document.getElementById("reb-modal-title").textContent="➕ إضافة اتفاقية بونص وهدف سنوي",document.getElementById("reb-sup-id").value="",document.getElementById("reb-year").value=d(),document.getElementById("reb-target-val").value="100000",document.getElementById("reb-pct").value="3.0",document.getElementById("reb-terms").value="خصم سنوي مباشر من الرصيد أو بضاعة مجانية",document.getElementById("reb-notes").value="",document.getElementById("reb-modal-err").classList.add("hidden"),openModal("rebate-modal")},window.saveRebate=async()=>{const e=document.getElementById("reb-modal-err");e.classList.add("hidden");const t=document.getElementById("reb-sup-id").value,a=y.find(l=>l.id===t),o=parseFloat(document.getElementById("reb-target-val").value)||0,r=parseFloat(document.getElementById("reb-pct").value)||0,n=document.getElementById("reb-edit-id").value;if(!t){e.textContent="يرجى اختيار المورد",e.classList.remove("hidden");return}if(!o){e.textContent="يرجى إدخال قيمة الهدف السنوي",e.classList.remove("hidden");return}const i={supplierId:t,supplierName:a?a.name:"مورد",year:parseInt(document.getElementById("reb-year").value)||d(),targetValue:o,rebatePct:r,terms:document.getElementById("reb-terms").value.trim(),notes:document.getElementById("reb-notes").value.trim()};try{n?await E("supplierRebates",n,i):await k("supplierRebates",i),closeModal("rebate-modal"),await g()}catch(l){e.textContent=l.message,e.classList.remove("hidden")}},window.editRebate=e=>{const t=b.find(a=>a.id===e);t&&(document.getElementById("reb-edit-id").value=t.id,document.getElementById("reb-modal-title").textContent="✏️ تعديل اتفاقية البونص: "+t.supplierName,document.getElementById("reb-sup-id").value=t.supplierId||"",document.getElementById("reb-year").value=t.year||d(),document.getElementById("reb-target-val").value=t.targetValue||"",document.getElementById("reb-pct").value=t.rebatePct||"",document.getElementById("reb-terms").value=t.terms||"",document.getElementById("reb-notes").value=t.notes||"",document.getElementById("reb-modal-err").classList.add("hidden"),openModal("rebate-modal"))},window.deleteRebate=async e=>{if(confirm("هل أنت متأكد من حذف هذه الاتفاقية؟"))try{await $("supplierRebates",e),await g()}catch(t){alert("فشل الحذف: "+t.message)}},window.exportRebatesExcel=()=>{const e=parseInt(document.getElementById("reb-year-filter")?.value)||d(),t=b.map(a=>{const o=x(a.supplierId,a.year||e),r=o*((a.rebatePct||0)/100);return{المورد:a.supplierName,السنة:a.year||e,"الهدف السنوي":a.targetValue||0,"المشتريات المحققة":o,"نسبة الحافز %":a.rebatePct||0,"البونص المكتسب":r,الشروط:a.terms||"—"}});R(t)}}export{j as render};
