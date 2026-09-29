const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BgjRa7f-.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{t as C,g as f,a as r,f as h,_ as A,l as w,o as L,e as M,r as Q}from"./index-BgjRa7f-.js";import{orderBy as b,query as _,getDocs as P}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let E=[],u=[],y=[],x=[];async function D(o,t){o.innerHTML=`
    <div class="filterbar no-print">
      <div style="margin-right:auto; display:flex; gap:12px;">
        <button class="btn btn-secondary" onclick="openClosingModal()">🔒 إقفال فترة مخزنية</button>
        <button class="btn btn-primary" onclick="openCountModal()">+ جلسة جرد جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">عمليات الجرد والقفلات المخزنية</h1>
        <p class="page-subtitle">مطابقة المخزون الفعلي مع الدفتري وإغلاق الحسابات الجارية</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الجرد</th>
                <th>المستودع الجاري</th>
                <th>عدد الأصناف</th>
                <th>قيمة العجز (ر.س)</th>
                <th>قيمة الزيادة (ر.س)</th>
                <th>الحالة</th>
                <th style="width:120px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="count-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Counting Modal -->
    <div class="modal-overlay" id="count-modal">
      <div class="modal modal-xl" style="max-height:85vh; overflow-y:auto;">
        <div class="modal-header">
          <h3 class="modal-title">جلسة جرد وتسوية جديدة</h3>
          <button class="modal-close" onclick="closeModal('count-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="count-id" />
          
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group"><label>تاريخ الجرد *</label><input type="date" id="count-date" class="input" value="${C()}" /></div>
            <div class="form-group"><label>نوع الجرد *</label>
              <select id="count-type" class="input">
                <option value="periodic">جرد دوري (Periodic Count)</option>
                <option value="random">جرد مفاجئ (Random/Cycle Count)</option>
                <option value="annual">جرد سنوي ختامي (Annual Count)</option>
              </select>
            </div>
            <div class="form-group"><label>المستودع المراد جرده *</label><select id="count-wh" class="input" onchange="loadWhProductsForCount()"></select></div>
          </div>

          <div class="alert info mb-16">يرجى إدخال الكمية الفعلية لكل صنف في العمود "الكمية الفعلية". سيقوم النظام باحتساب الفروق آلياً.</div>

          <div class="table-container" style="max-height:300px; overflow-y:auto; border:1px solid var(--border-soft); margin-bottom:16px;">
            <table class="data-dense" style="margin:0;">
              <thead style="position:sticky; top:0; background:var(--bg-2); z-index:10;">
                <tr>
                  <th>كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الكمية الدفترية</th>
                  <th style="width:120px;">الكمية الفعلية *</th>
                  <th>الفارق</th>
                  <th>التكلفة الدفترية</th>
                  <th>قيمة الفارق المالي</th>
                </tr>
              </thead>
              <tbody id="count-items-tbody">
                <tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>
              </tbody>
            </table>
          </div>

          <div class="form-group"><label>ملاحظات الجرد / لجنة الجرد</label><textarea id="count-notes" class="input" rows="2"></textarea></div>
          <div id="count-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('count-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePhysicalCount()" id="save-count-btn">اعتماد الجرد والتسوية المالية</button>
        </div>
      </div>
    </div>

    <!-- Closing Period Modal -->
    <div class="modal-overlay" id="closing-modal">
      <div class="modal modal-sm">
        <div class="modal-header"><h3 class="modal-title">إقفال فترة مخزنية</h3><button class="modal-close" onclick="closeModal('closing-modal')">×</button></div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>اختر شهر الإقفال *</label>
            <input type="month" id="closing-month" class="input" value="${C().substring(0,7)}" />
          </div>
          <div class="alert warn">تنبيــه: إقفال الفترة يمنع أي عمليات إضافة أو صرف أو تسوية مخزنية مؤرخة في هذا الشهر نهائياً.</div>
          <div id="closing-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('closing-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="submitPeriodClosing()" id="save-closing-btn">إقفال الفترة الآن</button>
        </div></div>
    </div>
  `,await Promise.all([H(),$()])}async function H(){E=await f(r.products(),[b("sku")]),u=await f(r.warehouses(),[b("name")]),y=await f(r.chartOfAccounts(),[b("code")]),document.getElementById("count-wh").innerHTML='<option value="">اختر المستودع...</option>'+u.map(o=>`<option value="${o.id}">${o.name}</option>`).join("")}async function $(){const o=document.getElementById("count-tbody");if(o)try{const t=_(r.physicalCounts(),b("createdAt","desc"));if(x=(await P(t)).docs.map(e=>({id:e.id,...e.data()})),x.length===0){o.innerHTML='<tr><td colspan="8" style="text-align:center;padding:24px;">لا توجد جلسات جرد سابقة</td></tr>';return}const s={periodic:"جرد دوري",random:"جرد مفاجئ",annual:"جرد سنوي ختامي"};o.innerHTML=x.map(e=>`
      <tr>
        <td>${e.date}</td>
        <td><span class="badge neutral">${s[e.type]||e.type}</span></td>
        <td><strong>${e.warehouseName}</strong></td>
        <td class="mono font-bold">${e.items.length}</td>
        <td class="mono text-bad font-bold">${h(e.totalLoss||0)}</td>
        <td class="mono text-good font-bold">${h(e.totalGain||0)}</td>
        <td><span class="badge ${e.status==="posted"?"good":"warn"}">${e.status==="posted"?"معتمد ومرحل":"مسودة"}</span></td>
        <td>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCountDetail('${e.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCount('${e.id}')" title="حذف">🗑️</button>
        </td>
      </tr>
    `).join("")}catch(t){o.innerHTML=`<tr><td colspan="8" class="text-bad">خطأ في التحميل: ${t.message}</td></tr>`}}let p=[];window.loadWhProductsForCount=async()=>{const o=document.getElementById("count-wh").value,t=document.getElementById("count-items-tbody");if(!o){t.innerHTML='<tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>';return}t.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const{getStockForWarehouse:d}=await A(async()=>{const{getStockForWarehouse:a}=await import("./index-BgjRa7f-.js").then(i=>i.T);return{getStockForWarehouse:a}},__vite__mapDeps([0,1])),s=await d(o),e={};s.forEach(a=>e[a.productId]=a.qty),p=E.map(a=>{const i=e[a.id]||0;return{id:a.id,sku:a.sku,name:a.name,bookQty:i,cost:a.costPrice||0,actualQty:i}}),B()}catch(d){t.innerHTML=`<tr><td colspan="7" class="text-bad" style="text-align:center;">${d.message}</td></tr>`}};function B(){const o=document.getElementById("count-items-tbody");o.innerHTML=p.map((t,d)=>{const s=t.actualQty-t.bookQty,e=s*t.cost;return`
      <tr>
        <td class="mono font-bold">${t.sku}</td>
        <td><strong>${t.name}</strong></td>
        <td class="mono font-bold">${w(t.bookQty)}</td>
        <td>
          <input type="number" class="input mono count-input" style="height:28px; padding:2px 8px; font-size:12px; font-weight:bold;" 
            value="${t.actualQty}" min="0" onchange="updateCountLine(${d}, this.value)" />
        </td>
        <td class="mono font-bold ${s>0?"text-good":s<0?"text-bad":""}">
          ${s>0?`+${w(s)}`:s<0?w(s):"0"}
        </td>
        <td class="mono dim">${h(t.cost)}</td>
        <td class="mono font-bold ${e>0?"text-good":e<0?"text-bad":""}">
          ${h(e)}
        </td>
      </tr>
    `}).join("")}window.updateCountLine=(o,t)=>{p[o].actualQty=parseFloat(t)||0,B()};window.openCountModal=()=>{document.getElementById("count-wh").value="",document.getElementById("count-items-tbody").innerHTML='<tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>',document.getElementById("count-notes").value="",document.getElementById("count-error").classList.add("hidden"),openModal("count-modal")};window.savePhysicalCount=async()=>{const o=document.getElementById("count-error");o.classList.add("hidden");const t=document.getElementById("count-wh").value,d=document.getElementById("count-date").value,s=document.getElementById("count-type").value;if(!t||!d){o.textContent="الرجاء تحديد التاريخ والمستودع",o.classList.remove("hidden");return}const e=document.getElementById("save-count-btn");e.disabled=!0;try{let a=0,i=0;const T=p.map(n=>{const k=n.actualQty-n.bookQty,m=k*n.cost;return m<0?a+=Math.abs(m):i+=m,{productId:n.id,sku:n.sku,name:n.name,bookQty:n.bookQty,actualQty:n.actualQty,variance:k,cost:n.cost,varianceCost:m}}),I=await L(r.physicalCounts(),{date:d,type:s,warehouseId:t,warehouseName:u.find(n=>n.id===t)?.name,items:T,totalLoss:a,totalGain:i,notes:document.getElementById("count-notes").value.trim(),status:"posted"}),c=i-a,l=y.find(n=>n.code==="120")||{id:"INV_STOCK",code:"120",name:"مخزون مستودع المواد الغذائية"},g=y.find(n=>n.code==="506")||{id:"VAR_LOSS",code:"506",name:"خسائر فروقات جرد مخزنية"},v=y.find(n=>n.code==="406")||{id:"VAR_GAIN",code:"406",name:"أرباح وإيرادات تسويات جردية"};c<0?await M({date:d,description:`قيد تسوية عجز جرد مستودع ${u.find(n=>n.id===t)?.name}`,sourceType:"physical_count",sourceId:I,lines:[{accountId:g.id,accountCode:g.code,accountName:g.name,debit:Math.abs(c),credit:0,note:"إثبات عجز الجرد"},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:0,credit:Math.abs(c),note:"تخفيض المخزون بالفروق الفعيلة"}]}):c>0&&await M({date:d,description:`قيد تسوية زيادة جرد مستودع ${u.find(n=>n.id===t)?.name}`,sourceType:"physical_count",sourceId:I,lines:[{accountId:l.id,accountCode:l.code,accountName:l.name,debit:c,credit:0,note:"زيادة المخزون بالفروق الفعيلة"},{accountId:v.id,accountCode:v.code,accountName:v.name,debit:0,credit:c,note:"إثبات أرباح تسوية جردية"}]}),showToast("تم اعتماد الجرد وترحيل القيود المحاسبية بنجاح","success"),closeModal("count-modal"),await $()}catch(a){o.textContent=a.message,o.classList.remove("hidden")}finally{e.disabled=!1}};window.deleteCount=async o=>{if(confirm("هل تريد بالتأكيد حذف سجل الجرد؟"))try{await Q("physicalCounts",o),showToast("تم حذف الجرد","success"),await $()}catch(t){showToast(t.message,"error")}};window.openClosingModal=()=>{document.getElementById("closing-error").classList.add("hidden"),openModal("closing-modal")};window.submitPeriodClosing=async()=>{const o=document.getElementById("closing-error");o.classList.add("hidden");const t=document.getElementById("closing-month").value;if(!t){o.textContent="يرجى تحديد الشهر",o.classList.remove("hidden");return}const d=document.getElementById("save-closing-btn");d.disabled=!0;try{await L(r.settings(),{type:"period_closing",period:t,closedAt:C(),status:"closed"}),showToast(`تم إقفال الفترة المخزنية لـ ${t} بنجاح`,"success"),closeModal("closing-modal")}catch(s){o.textContent=s.message,o.classList.remove("hidden")}finally{d.disabled=!1}};export{D as render};
