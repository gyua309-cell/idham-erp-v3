import{g as b,a as g,u as E,o as z,r as D,f as h}from"./index-CEMoTDyX.js";import{e as R}from"./excel-zCoXiaxq.js";import{orderBy as B}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let c=[],L=[],k=[],M=[],y="kanban",m=[];const u=[{id:"new",label:"🎯 عميل مستهدف",color:"#6366F1",bg:"rgba(99,102,241,0.08)"},{id:"contacted",label:"📞 تم التواصل / زيارة",color:"#3B82F6",bg:"rgba(59,130,246,0.08)"},{id:"quoted",label:"📄 أُرسل عرض سعر",color:"#F59E0B",bg:"rgba(245,158,11,0.08)"},{id:"negotiation",label:"🤝 مرحلة التفاوض",color:"#8B5CF6",bg:"rgba(139,92,246,0.08)"},{id:"won",label:"✅ تم التعاقد والتعميد",color:"#10B981",bg:"rgba(16,185,129,0.08)"},{id:"lost",label:"❌ غير مهتم / ملغي",color:"#EF4444",bg:"rgba(239,68,68,0.08)"}];async function Q(a,t){a.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="crm-search" class="input" placeholder="🔍 بحث في العملاء والمتابعات..." oninput="window.filterLeads(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="crm-rep-filter" onchange="window.filterLeads()">
          <option value="">كل المناديب</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النشاط</label>
        <select id="crm-type-filter" onchange="window.filterLeads()">
          <option value="">كل الأنشطة</option>
          <option value="مطعم">مطعم</option>
          <option value="بقالة">بقالة / سوبرماركت</option>
          <option value="كافيه">كافيه / مقهى</option>
          <option value="إعاشة">شركة إعاشة وتوريد</option>
          <option value="فندق">فندق / ضيافة</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-secondary btn-sm" id="crm-btn-kanban" onclick="window.setCRMView('kanban')">📊 كانبان</button>
        <button class="btn btn-secondary btn-sm" id="crm-btn-table" onclick="window.setCRMView('table')">☰ جدول</button>
        <button class="btn btn-primary btn-sm" id="crm-btn-ai" onclick="window.setCRMView('ai-predict')" style="background:linear-gradient(135deg, #6366F1, #8B5CF6); border:none;">
          🔮 التنبؤ الذكي بالطلبيات
        </button>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportCRMExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openLeadModal()">+ إضافة فرصة بيعية / عميل</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الفرص البيعية</div>
          <div class="mono" id="crm-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد التفاوض والعروض</div>
          <div class="mono" id="crm-kpi-pipeline" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">🔔 طلبات متوقعة حان موعدها</div>
          <div class="mono" id="crm-kpi-due-orders" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">المبيعات الشهرية المتوقعة</div>
          <div class="mono" id="crm-kpi-val" style="font-size:18px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Container for Kanban / Table / AI Predictions -->
      <div id="crm-view-container"></div>
    </div>

    <!-- Lead Modal -->
    <div class="modal-overlay" id="lead-modal">
      <div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title" id="lead-modal-title">➕ إضافة فرصة بيعية جديدة</h3>
          <button class="modal-close" onclick="closeModal('lead-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="lead-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>اسم المنشأة / العميل *</label>
              <input type="text" id="lead-name" class="input" placeholder="مثال: مطاعم بيت الشواية" />
            </div>
            <div class="form-group">
              <label>الشخص المسؤول / جهة الاتصال</label>
              <input type="text" id="lead-contact" class="input" placeholder="أ/ محمد المدير التنفيذي" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>رقم الجوال *</label>
              <input type="text" id="lead-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>نوع النشاط</label>
              <select id="lead-type" class="input">
                <option value="مطعم">مطعم</option>
                <option value="بقالة">بقالة / سوبرماركت</option>
                <option value="كافيه">كافيه / مقهى</option>
                <option value="إعاشة">شركة إعاشة وتوريد</option>
                <option value="فندق">فندق / ضيافة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div class="form-group">
              <label>المنطقة / الحي</label>
              <input type="text" id="lead-zone" class="input" placeholder="ينبع الصناعية" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المندوب المسؤول</label>
              <select id="lead-rep" class="input">
                <option value="">-- اختر المندوب --</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبيعات المتوقعة شهرياً</label>
              <input type="number" id="lead-val" class="input mono" placeholder="5000" min="0" />
            </div>
            <div class="form-group">
              <label>مرحلة المتابعة</label>
              <select id="lead-stage" class="input">
                ${u.map(e=>`<option value="${e.id}">${e.label}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>موعد المتابعة القادم</label>
              <input type="date" id="lead-next-date" class="input" />
            </div>
            <div class="form-group">
              <label>أهم الأصناف المطلوبة</label>
              <input type="text" id="lead-items" class="input" placeholder="أرز، زيت، تغليف، بهارات..." />
            </div>
          </div>

          <div class="form-group">
            <label>ملاحظات وسجل المحادثة</label>
            <textarea id="lead-notes" class="input" rows="3" placeholder="تفاصيل الزيارة أو متطلبات العميل..."></textarea>
          </div>

          <div id="lead-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('lead-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveLead()">💾 حفظ البيانات</button>
        </div>
      </div>
    </div>
  `,await x(),O()}async function x(){try{const[a,t,e,n]=await Promise.all([b(g.customerLeads?g.customerLeads():"customerLeads").catch(()=>[]),b(g.salesReps?g.salesReps():"salesReps",[B("name")]).catch(()=>[]),b(g.customers(),[B("name")]).catch(()=>[]),b(g.salesInvoices(),[B("date","desc")]).catch(()=>[])]);c=a,L=t,k=e,M=n,V(),j(),C(),f()}catch(a){console.warn("Failed to load CRM data:",a)}}function V(){const a=new Date;m=[],k.forEach(t=>{const e=M.filter(i=>(i.customerId===t.id||i.customerName===t.name)&&i.status!=="cancelled");if(e.length<2)return;const n=[...e].sort((i,s)=>(i.date||"").localeCompare(s.date||""));let o=0;for(let i=1;i<n.length;i++){const s=new Date(n[i-1].date),p=new Date(n[i].date),F=Math.max(1,Math.floor((p-s)/(1e3*60*60*24)));o+=F}const d=Math.max(3,Math.round(o/(n.length-1))),l=n[n.length-1],r=new Date(l.date),w=Math.floor((a-r)/(1e3*60*60*24)),I=new Date(r);I.setDate(I.getDate()+d);const v={};e.forEach(i=>{(i.lines||i.items||[]).forEach(s=>{const p=s.name||s.productName;p&&(v[p]||(v[p]={name:p,qty:0,count:0,unitPrice:s.unitPrice||s.price||0}),v[p].qty+=parseFloat(s.qty||s.quantity||1),v[p].count+=1)})});const P=Object.values(v).sort((i,s)=>s.count-i.count).slice(0,3),T=e.reduce((i,s)=>i+parseFloat(s.totalWithVat||s.total||0),0)/e.length;let $="normal";w>=d?$="due_today":w>=d-2&&($="upcoming"),m.push({customerId:t.id,customerName:t.name,customerPhone:t.phone||"",zone:t.zone||"—",repName:t.repName||"—",avgIntervalDays:d,daysSinceLastOrder:w,lastOrderDate:l.date,nextExpectedDateStr:I.toISOString().slice(0,10),avgInvoiceVal:T,topItems:P,urgency:$})}),m.sort((t,e)=>{const n=o=>o==="due_today"?3:o==="upcoming"?2:1;return n(e.urgency)-n(t.urgency)||e.daysSinceLastOrder-t.daysSinceLastOrder})}function C(){c.filter(o=>o.stage==="won");const a=c.filter(o=>o.stage==="quoted"||o.stage==="negotiation"||o.stage==="contacted"),t=c.reduce((o,d)=>o+(parseFloat(d.expectedMonthlyValue)||0),0),e=m.filter(o=>o.urgency==="due_today").length,n=(o,d)=>{const l=document.getElementById(o);l&&(l.textContent=d)};n("crm-kpi-total",c.length),n("crm-kpi-pipeline",a.length),n("crm-kpi-due-orders",e),n("crm-kpi-val",h(t))}function j(){const a=document.getElementById("crm-rep-filter"),t=document.getElementById("lead-rep"),e=L.map(n=>`<option value="${n.id}">${n.name}</option>`).join("");a&&(a.innerHTML='<option value="">كل المناديب</option>'+e),t&&(t.innerHTML='<option value="">-- اختر المندوب --</option>'+e)}function f(a=c){const t=document.getElementById("crm-view-container");t&&(y==="kanban"?A(t,a):y==="table"?S(t,a):y==="ai-predict"&&N(t))}function N(a){const t=m.filter(e=>e.urgency==="due_today").length;a.innerHTML=`
    <div style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.03)); border:1.5px solid rgba(99,102,241,0.25); border-radius:14px; padding:16px 20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--brand); display:flex; align-items:center; gap:8px;">
            <span>🔮 محرك التنبؤ الذكي بالطلبيات (AI Replenishment Engine)</span>
          </h3>
          <p style="margin:4px 0 0; font-size:12px; color:var(--text-2);">
            يقوم النظام بتحليل دورات الشراء ومعدلات استهلاك كل عميل، وينبهك تلقائياً بمواعيد إعادة الطلب قبل نفاذ المخزون لديهم.
          </p>
        </div>
        <span class="badge" style="background:#6366F1; color:#fff; font-weight:800; font-size:12px; padding:6px 14px; border-radius:20px;">
          🔔 ${t} عميل حان موعد طلبهم اليوم
        </span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:14px;">
      ${m.map(e=>{const n=e.urgency==="due_today",o=e.urgency==="upcoming",d=n?"#EF4444":o?"#F59E0B":"#10B981",l=n?"🔥 حان موعد الطلب اليوم!":o?"⏳ متوقع خلال يومين":"🟢 تم التوريد مؤخراً";return`
          <div class="card" style="padding:16px; border:1.5px solid ${n?"rgba(239,68,68,0.3)":"var(--border-soft)"}; background:${n?"rgba(239,68,68,0.02)":"var(--bg-card)"}; border-radius:14px; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
              <div>
                <div style="font-weight:800; font-size:15px; color:var(--text-0);">${e.customerName}</div>
                <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">📍 ${e.zone} • 🚗 ${e.repName}</div>
              </div>
              <span class="badge" style="background:${d}18; color:${d}; font-weight:800; font-size:10.5px;">
                ${l}
              </span>
            </div>

            <!-- Pattern Metrics -->
            <div style="background:var(--bg-2); border-radius:8px; padding:10px 12px; margin:8px 0; font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div><span style="color:var(--text-3);">دورة الشراء:</span> <b>كل ${e.avgIntervalDays} أيام</b></div>
              <div><span style="color:var(--text-3);">آخر طلب:</span> <b class="mono">${e.daysSinceLastOrder} يوم مضت</b></div>
              <div><span style="color:var(--text-3);">تاريخ آخر فاتورة:</span> <span class="mono">${e.lastOrderDate}</span></div>
              <div><span style="color:var(--text-3);">متوسط الفاتورة:</span> <b class="mono text-good">${h(e.avgInvoiceVal)}</b></div>
            </div>

            <!-- Top Recommended Products -->
            <div style="font-size:11.5px; margin:6px 0 12px;">
              <div style="font-weight:700; color:var(--text-1); margin-bottom:4px;">📦 الأصناف الأكثر استهلاكاً المتوقعة:</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                ${e.topItems.map(r=>`
                  <span style="background:rgba(99,102,241,0.08); color:var(--brand); border-radius:6px; padding:2px 8px; font-size:11px; font-weight:600;">
                    ${r.name}
                  </span>
                `).join("")}
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div style="display:flex; gap:8px; margin-top:auto; padding-top:10px; border-top:1px dashed var(--border-soft);">
              ${e.customerPhone?`
                <button class="btn btn-secondary btn-sm" style="flex:1; font-size:11.5px;" onclick="window.sendReorderWhatsApp('${e.customerPhone}', '${e.customerName.replace(/'/g,"\\'")}', '${e.topItems.map(r=>r.name).join("، ")}')">
                  💬 تذكير واتساب
                </button>
              `:""}
              <button class="btn btn-primary btn-sm" style="flex:1; font-size:11.5px;" onclick="window.createProposedInvoice('${e.customerId}')">
                ⚡ إنشاء فاتورة مقترحة
              </button>
            </div>
          </div>
        `}).join("")}
      ${m.length?"":'<div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--text-2);">يلزم توفر فواتير مبيعات سابقة لحساب دورة التنبؤ بالطلب</div>'}
    </div>
  `}function A(a,t){a.innerHTML=`
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; overflow-x:auto; padding-bottom:16px;">
      ${u.map((e,n)=>{const o=t.filter(d=>(d.stage||"new")===e.id);return o.reduce((d,l)=>d+(parseFloat(l.expectedMonthlyValue)||0),0),`
          <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; padding:12px; display:flex; flex-direction:column; min-height:450px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:2px solid ${e.color}; margin-bottom:12px;">
              <div style="font-weight:800; font-size:13px; color:var(--text-0);">${e.label}</div>
              <span class="badge" style="background:${e.bg}; color:${e.color}; font-weight:800;">${o.length}</span>
            </div>
            
            <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:600px;">
              ${o.map(d=>`
                <div class="card" style="padding:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); cursor:pointer; transition:transform 0.2s;" onclick="window.editLead('${d.id}')">
                  <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
                    <div style="font-weight:800; font-size:13px; color:var(--text-0);">${d.name}</div>
                    <span class="badge neutral" style="font-size:9.5px;">${d.activityType||"مطعم"}</span>
                  </div>
                  <div style="font-size:11.5px; color:var(--text-2); margin-bottom:6px;">👤 ${d.contactPerson||d.phone||"—"}</div>
                  
                  ${d.expectedMonthlyValue?`
                    <div class="mono" style="font-size:12px; font-weight:700; color:var(--brand); margin-bottom:6px;">
                      💵 ${h(d.expectedMonthlyValue)} / شهر
                    </div>
                  `:""}

                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-3); border-top:1px dashed var(--border-soft); padding-top:6px; margin-top:6px;">
                    <span>📍 ${d.zone||"—"}</span>
                    <span>🚗 ${d.repName||"—"}</span>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div style="display:flex; gap:6px; margin-top:10px;" onclick="event.stopPropagation()">
                    ${d.phone?`
                      <button class="btn btn-sm btn-secondary" style="flex:1; font-size:11px; padding:4px;" onclick="window.chatLeadWhatsApp('${d.phone}', '${d.name.replace(/'/g,"\\'")}')" title="محادثة واتساب">
                        💬 واتساب
                      </button>
                    `:""}
                    ${n<u.length-2?`
                      <button class="btn btn-sm btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="window.advanceLeadStage('${d.id}', '${u[n+1].id}')" title="تقديم للمرحلة التالية">
                        ➔
                      </button>
                    `:""}
                  </div>

                  ${d.stage!=="won"?`
                    <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:8px; font-size:11px; background:rgba(16,185,129,0.08); color:#10B981; border-color:rgba(16,185,129,0.2);" onclick="event.stopPropagation(); window.convertLeadToCustomer('${d.id}')">
                      ✨ تحويل لعميل دائم
                    </button>
                  `:""}
                </div>
              `).join("")}
              ${o.length?"":'<div style="text-align:center; padding:32px 8px; color:var(--text-3); font-size:12px;">لا يوجد عملاء في هذه المرحلة</div>'}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function S(a,t){a.innerHTML=`
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>اسم العميل / المنشأة</th>
              <th>المسؤول</th>
              <th>الهاتف</th>
              <th>النشاط</th>
              <th>المنطقة</th>
              <th>المندوب</th>
              <th style="text-align:left;">المتوقع شهرياً</th>
              <th style="text-align:center;">المرحلة</th>
              <th style="text-align:center;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>{const n=u.find(o=>o.id===e.stage)||u[0];return`
                <tr>
                  <td class="font-bold">${e.name}</td>
                  <td>${e.contactPerson||"—"}</td>
                  <td class="mono dim">${e.phone||"—"}</td>
                  <td><span class="badge neutral">${e.activityType||"مطعم"}</span></td>
                  <td>${e.zone||"—"}</td>
                  <td>${e.repName||"—"}</td>
                  <td class="mono font-bold" style="text-align:left;">${h(e.expectedMonthlyValue||0)}</td>
                  <td style="text-align:center;"><span class="badge" style="background:${n.bg}; color:${n.color}; font-weight:700;">${n.label}</span></td>
                  <td>
                    <div class="row-actions" style="justify-content:center;">
                      ${e.phone?`<button class="btn btn-icon sm" style="color:#25D366;" onclick="window.chatLeadWhatsApp('${e.phone}', '${e.name.replace(/'/g,"\\'")}')" title="محادثة واتساب">💬</button>`:""}
                      ${e.stage!=="won"?`<button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertLeadToCustomer('${e.id}')" title="تحويل لعميل دائم">✨</button>`:""}
                      <button class="btn btn-icon sm btn-ghost" onclick="window.editLead('${e.id}')" title="تعديل">✏️</button>
                      <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteLead('${e.id}')" title="حذف">🗑️</button>
                    </div>
                  </td>
                </tr>
              `}).join("")}
            ${t.length?"":'<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد فرص بيعية مسجلة</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `}function O(){window.setCRMView=a=>{y=a,document.getElementById("crm-btn-kanban")?.classList.toggle("btn-primary",a==="kanban"),document.getElementById("crm-btn-kanban")?.classList.toggle("btn-secondary",a!=="kanban"),document.getElementById("crm-btn-table")?.classList.toggle("btn-primary",a==="table"),document.getElementById("crm-btn-table")?.classList.toggle("btn-secondary",a!=="table"),document.getElementById("crm-btn-ai")?.classList.toggle("btn-primary",a==="ai-predict"),document.getElementById("crm-btn-ai")?.classList.toggle("btn-secondary",a!=="ai-predict"),f()},window.filterLeads=()=>{const a=(document.getElementById("crm-search")?.value||"").trim().toLowerCase(),t=document.getElementById("crm-rep-filter")?.value||"",e=document.getElementById("crm-type-filter")?.value||"",n=c.filter(o=>{const d=!a||(o.name||"").toLowerCase().includes(a)||(o.phone||"").includes(a)||(o.contactPerson||"").toLowerCase().includes(a),l=!t||o.repId===t,r=!e||o.activityType===e;return d&&l&&r});f(n)},window.chatLeadWhatsApp=(a,t)=>{const e=a.replace(/[^0-9]/g,""),n=e.startsWith("0")?"966"+e.slice(1):e.startsWith("966")?e:"966"+e,o=`مرحباً ${t}، نتشرف بالتواصل معكم من مؤسسة إدهام للمواد الغذائية بخصوص توريد احتياجاتكم...`;window.open(`https://api.whatsapp.com/send?phone=${n}&text=${encodeURIComponent(o)}`,"_blank")},window.sendReorderWhatsApp=(a,t,e)=>{const n=a.replace(/[^0-9]/g,""),o=n.startsWith("0")?"966"+n.slice(1):n.startsWith("966")?n:"966"+n,d=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",l=`مرحباً ${t}، حياكم الله من ${d} 🌿

نود الاطمئنان على احتياجاتكم من الأصناف المعتادة (${e||"المواد الغذائية والتغليف"}). هل ترغبون في إرسال المندوب لتسليم طلبيتكم المعتادة اليوم؟

شاكرين ومقدرين تعاملكم معنا!`;window.open(`https://api.whatsapp.com/send?phone=${o}&text=${encodeURIComponent(l)}`,"_blank")},window.createProposedInvoice=a=>{window.navigate&&(window.navigate("sales-invoices"),setTimeout(()=>{if(window.openInvoiceModal){window.openInvoiceModal();const t=k.find(e=>e.id===a);t&&window.selectCustomer&&window.selectCustomer(t.id,t.name,t.creditLimit||0,t.balance||0)}},300))},window.advanceLeadStage=async(a,t)=>{try{await E("customerLeads",a,{stage:t});const e=c.find(n=>n.id===a);e&&(e.stage=t),C(),f()}catch(e){alert("فشل تحديث المرحلة: "+e.message)}},window.openLeadModal=()=>{document.getElementById("lead-edit-id").value="",document.getElementById("lead-modal-title").textContent="➕ إضافة فرصة بيعية جديدة",document.getElementById("lead-name").value="",document.getElementById("lead-contact").value="",document.getElementById("lead-phone").value="",document.getElementById("lead-type").value="مطعم",document.getElementById("lead-zone").value="",document.getElementById("lead-rep").value="",document.getElementById("lead-val").value="",document.getElementById("lead-stage").value="new",document.getElementById("lead-next-date").value="",document.getElementById("lead-items").value="",document.getElementById("lead-notes").value="",document.getElementById("lead-modal-err").classList.add("hidden"),openModal("lead-modal")},window.saveLead=async()=>{const a=document.getElementById("lead-modal-err");a.classList.add("hidden");const t=document.getElementById("lead-name").value.trim(),e=document.getElementById("lead-phone").value.trim(),n=document.getElementById("lead-rep").value,o=L.find(r=>r.id===n),d=document.getElementById("lead-edit-id").value;if(!t){a.textContent="يرجى كتابة اسم المنشأة / العميل",a.classList.remove("hidden");return}if(!e){a.textContent="يرجى إدخال رقم الجوال",a.classList.remove("hidden");return}const l={name:t,contactPerson:document.getElementById("lead-contact").value.trim(),phone:e,activityType:document.getElementById("lead-type").value,zone:document.getElementById("lead-zone").value.trim(),repId:n||null,repName:o?o.name:"",expectedMonthlyValue:parseFloat(document.getElementById("lead-val").value)||0,stage:document.getElementById("lead-stage").value,nextFollowUpDate:document.getElementById("lead-next-date").value,interestedItems:document.getElementById("lead-items").value.trim(),notes:document.getElementById("lead-notes").value.trim()};try{d?await E("customerLeads",d,l):await z("customerLeads",l),closeModal("lead-modal"),await x()}catch(r){a.textContent=r.message,a.classList.remove("hidden")}},window.editLead=a=>{const t=c.find(e=>e.id===a);t&&(document.getElementById("lead-edit-id").value=t.id,document.getElementById("lead-modal-title").textContent="✏️ تعديل الفرصة البيعية — "+t.name,document.getElementById("lead-name").value=t.name||"",document.getElementById("lead-contact").value=t.contactPerson||"",document.getElementById("lead-phone").value=t.phone||"",document.getElementById("lead-type").value=t.activityType||"مطعم",document.getElementById("lead-zone").value=t.zone||"",document.getElementById("lead-rep").value=t.repId||"",document.getElementById("lead-val").value=t.expectedMonthlyValue||"",document.getElementById("lead-stage").value=t.stage||"new",document.getElementById("lead-next-date").value=t.nextFollowUpDate||"",document.getElementById("lead-items").value=t.interestedItems||"",document.getElementById("lead-notes").value=t.notes||"",document.getElementById("lead-modal-err").classList.add("hidden"),openModal("lead-modal"))},window.deleteLead=async a=>{if(confirm("هل أنت متأكد من حذف هذه الفرصة البيعية؟"))try{await D("customerLeads",a),await x()}catch(t){alert("فشل الحذف: "+t.message)}},window.convertLeadToCustomer=async a=>{const t=c.find(e=>e.id===a);if(t&&confirm(`هل تريد تحويل العميل المحتمل "${t.name}" إلى عميل دائم بالدليل المحاسبي؟`))try{const e=await z("customers",{name:t.name,phone:t.phone,contactPerson:t.contactPerson||"",zone:t.zone||"",repId:t.repId||null,repName:t.repName||"",type:"retail",priceList:"retail",creditLimit:0,balance:0,notes:`تم تحويله من CRM — نشاط: ${t.activityType||"مطعم"}`});await E("customerLeads",a,{stage:"won",convertedCustomerId:e}),alert(`✅ تم تحويل "${t.name}" بنجاح إلى دليل العملاء!`),await x()}catch(e){alert("فشل التحويل: "+e.message)}},window.exportCRMExcel=()=>{const a=c.map(t=>({المنشأة:t.name,المسؤول:t.contactPerson,الهاتف:t.phone,النشاط:t.activityType,المنطقة:t.zone,المندوب:t.repName,"المبيعات المتوقعة":t.expectedMonthlyValue||0,المرحلة:u.find(e=>e.id===t.stage)?.label||t.stage,"المتابعة القادمة":t.nextFollowUpDate||"—"}));R(a)}}export{Q as render};
