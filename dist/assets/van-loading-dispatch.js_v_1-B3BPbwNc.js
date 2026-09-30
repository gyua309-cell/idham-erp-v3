import{t as I,g as v,a as y,f as r,o as M,u as P,d as C,C as S}from"./index-DaYejt0r.js";import{orderBy as j,doc as q,getDoc as R,setDoc as T}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const m=(...t)=>window.showToast?.(...t)??console.log(...t),A=(...t)=>window.showConfirm?.(...t)??Promise.resolve(!0);async function k(t,o,n,e={}){try{const a=q(C,`companies/${S}/warehouseStock/${t}_${o}`),d=await R(a),s=d.exists()&&d.data().qty||0;await T(a,{warehouseId:t,productId:o,qty:s+n,updatedAt:new Date,...e},{merge:!0})}catch(a){console.warn("adjustStock:",a)}}let c=[],H=[],D=[],E=[],w=[],i=[];async function J(t,o){await Q(t)}async function Q(t){t||(t=document.getElementById("main-content")),t&&(t.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #10B981, #059669); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
            🚚
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">تحميل وجرد سيارات مندوبي التوزيع (Van Dispatch)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">إذونات التحميل الصباحية • جرد المتبقي المسائي • تسوية مبيعات ومرتجعات السيارات</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.openNewDispatchModal()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:9px 18px; border-radius:10px; background:linear-gradient(135deg, #10B981, #059669);">
            <span>➕</span> <span>إذن تحميل صباحي جديد</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:20px;">
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">إجمالي إرساليات اليوم</div>
          <div class="mono font-bold" id="stat-dispatch-count" style="font-size:22px; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">سيارات قيد التوزيع (في الميدان)</div>
          <div class="mono font-bold text-warn" id="stat-active-vans" style="font-size:22px; margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">تمت التسوية والجرد المسائي</div>
          <div class="mono font-bold text-good" id="stat-reconciled-count" style="font-size:22px; margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">إجمالي قيمة بضاعة الميدان المحملة</div>
          <div class="mono font-bold" id="stat-total-dispatched-val" style="font-size:22px; color:#6366F1; margin-top:4px;">0.00 ر.س</div>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="card" style="padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); margin-bottom:16px; background:var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; gap:10px; align-items:center; flex:1; min-width:280px;">
            <input type="text" id="dispatch-search" class="form-control" placeholder="🔍 ابحث برقم الإذن، اسم المندوب، أو لوحة الشاحنة…" style="max-width:340px;" oninput="window.filterDispatches()" />
            <select id="dispatch-status-filter" class="form-control" style="max-width:180px;" onchange="window.filterDispatches()">
              <option value="">كل الحالات</option>
              <option value="out">قيد التوزيع (في الميدان)</option>
              <option value="reconciled">تمت التسوية والجرد</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.refreshDispatchList()">🔄 تحديث</button>
        </div>
      </div>

      <!-- Dispatches Table -->
      <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="max-height:550px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12.5px;">
            <thead>
              <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                <th style="width:110px;">رقم الإذن</th>
                <th style="width:100px;">التاريخ</th>
                <th>المندوب / السائق</th>
                <th>المركبة / اللوحة</th>
                <th>المستودع المصدر</th>
                <th style="width:90px; text-align:center;">عدد الأصناف</th>
                <th style="width:90px; text-align:center;">إجمالي الكراتين</th>
                <th style="width:120px; text-align:left;">قيمة التحميل</th>
                <th style="width:110px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="dispatches-tbody">
              <tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-2);">⏳ جارٍ تحميل أذونات التحميل…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══════════ NEW DISPATCH MODAL ═══════════ -->
    <div class="modal-overlay" id="dispatch-modal" style="display:none;" onclick="if(event.target===this)window.closeDispatchModal()">
      <div class="modal modal-xl" style="max-width:1050px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">🚚 إذن تحميل سيارة توزيع صباحي جديد</h3>
          <button class="modal-close" onclick="window.closeDispatchModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);">
          
          <div class="card" style="padding:16px; border-radius:12px; margin-bottom:14px; background:var(--bg-card);">
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">رقم إذن التحميل</label>
                <input type="text" id="disp-number" class="form-control mono font-bold" readonly style="background:var(--bg-2); color:var(--brand);" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">تاريخ الإرسالية *</label>
                <input type="date" id="disp-date" class="form-control mono font-bold" value="${I()}" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المستودع المصدر *</label>
                <select id="disp-warehouse" class="form-control font-bold"></select>
              </div>
            </div>

            <div class="grid-3 gap-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المندوب المسؤول *</label>
                <select id="disp-rep" class="form-control font-bold"></select>
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">لوحة المركبة / رقمها</label>
                <input type="text" id="disp-vehicle" class="form-control font-bold mono" placeholder="مثال: ABC 1234" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">خط السير المستهدف</label>
                <input type="text" id="disp-route" class="form-control" placeholder="مثال: خط وسط المدينة / البقالات" />
              </div>
            </div>
          </div>

          <!-- Items Selection Section -->
          <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <strong style="font-size:13px; color:var(--text-0);">📋 البضاعة المحملة بالسيارة</strong>
              <div style="width:340px;">
                <input type="text" id="disp-product-search" class="form-control" placeholder="🔍 ابحث عن صنف لإضافته للسيارة..." oninput="window.searchDispatchProducts(this.value)" />
                <div id="disp-product-results" class="autocomplete-results hidden" style="position:relative; max-height:180px; overflow-y:auto; z-index:10;"></div>
              </div>
            </div>

            <div class="table-container" style="max-height:260px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-3);">
                    <th style="width:30px;">#</th>
                    <th>اسم الصنف</th>
                    <th style="width:80px;">الوحدة</th>
                    <th style="width:90px; text-align:center;">كمية التحميل</th>
                    <th style="width:100px; text-align:left;">سعر البيع</th>
                    <th style="width:110px; text-align:left;">إجمالي القيمة</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody id="disp-lines-tbody">
                  <tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding:10px 14px; background:var(--bg-2); border-radius:10px;">
              <div>
                <span style="font-size:12px; color:var(--text-2);">إجمالي الأصناف: </span>
                <b id="disp-total-items-count" class="mono">0 صنف</b>
                <span style="margin:0 8px; color:var(--border-soft);">|</span>
                <span style="font-size:12px; color:var(--text-2);">إجمالي الكراتين: </span>
                <b id="disp-total-qty-count" class="mono">0</b>
              </div>
              <div>
                <span style="font-size:13px; font-weight:800; color:var(--text-0);">إجمالي قيمة البضاعة: </span>
                <span id="disp-total-val" class="mono font-bold" style="font-size:16px; color:var(--brand);">0.00 ر.س</span>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeDispatchModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveDispatch()" style="padding:8px 22px; font-weight:800; background:linear-gradient(135deg,#10B981,#059669);">
            💾 حفظ واعتماد خروج السيارة
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ EVENING RECONCILIATION MODAL ═══════════ -->
    <div class="modal-overlay" id="recon-modal" style="display:none;" onclick="if(event.target===this)window.closeReconModal()">
      <div class="modal modal-xl" style="max-width:1050px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">⚖️ تسوية وجرد متبقي سيارة التوزيع المسائي</h3>
          <button class="modal-close" onclick="window.closeReconModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);" id="recon-modal-body">
          <!-- Dynamic Content -->
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeReconModal()">إغلاق</button>
          <button class="btn btn-primary" id="save-recon-btn" onclick="window.saveReconciliation()" style="padding:8px 22px; font-weight:800;">
            💾 اعتماد التسوية وإعادة المتبقي للمستودع
          </button>
        </div>
      </div>
    </div>
  `,await b())}async function b(){try{const[t,o,n,e]=await Promise.all([v(y.vanDispatches(),[j("createdAt","desc")]).catch(()=>[]),v(y.salesReps()).catch(()=>[]),v(y.warehouses()).catch(()=>[]),v(y.products()).catch(()=>[])]);c=t,H=[],D=o,E=n,w=e,B(c),O()}catch(t){console.error("loadDispatchInitialData error:",t),m("خطأ في تحميل البيانات: "+t.message,"error")}}function O(){const t=c.length,o=c.filter(d=>d.status==="out").length,n=c.filter(d=>d.status==="reconciled").length,e=c.filter(d=>d.status==="out").reduce((d,s)=>d+(s.totalValue||0),0),a=d=>document.getElementById(d);a("stat-dispatch-count")&&(a("stat-dispatch-count").textContent=t),a("stat-active-vans")&&(a("stat-active-vans").textContent=o),a("stat-reconciled-count")&&(a("stat-reconciled-count").textContent=n),a("stat-total-dispatched-val")&&(a("stat-total-dispatched-val").textContent=r(e))}function B(t){const o=document.getElementById("dispatches-tbody");if(o){if(!t.length){o.innerHTML='<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أذونات تحميل مسجلة</td></tr>';return}o.innerHTML=t.map(n=>{const e=n.status==="out";return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="mono font-bold" style="color:var(--brand);">${n.dispatchNumber||n.id}</td>
        <td class="mono">${n.date||"—"}</td>
        <td class="font-bold" style="color:var(--text-0);">${n.repName||"—"}</td>
        <td>${n.vehiclePlate?`🚚 ${n.vehiclePlate}`:"—"}</td>
        <td style="color:var(--text-2);">${n.warehouseName||"—"}</td>
        <td style="text-align:center;" class="mono">${(n.lines||[]).length}</td>
        <td style="text-align:center;" class="mono font-bold">${n.totalQty||0}</td>
        <td style="text-align:left;" class="mono font-bold text-good">${r(n.totalValue||0)}</td>
        <td style="text-align:center;">
          ${e?'<span class="badge warn" style="font-size:11px; padding:3px 8px;">⏳ في الميدان</span>':'<span class="badge good" style="font-size:11px; padding:3px 8px;">✅ تمت التسوية</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn btn-secondary btn-sm" onclick="window.printDispatch('${n.id}')" title="طباعة إذن التحميل">🖨️</button>
            ${e?`
              <button class="btn btn-primary btn-sm" style="background:#6366F1; font-size:11px; padding:3px 8px;" onclick="window.openReconciliationModal('${n.id}')">⚖️ جرد مسائي</button>
            `:`
              <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="window.viewReconciliationSummary('${n.id}')">👁️ التقرير</button>
            `}
          </div>
        </td>
      </tr>
    `}).join("")}}window.filterDispatches=()=>{const t=document.getElementById("dispatch-search")?.value.toLowerCase().trim()||"",o=document.getElementById("dispatch-status-filter")?.value||"",n=c.filter(e=>{const a=!t||(e.dispatchNumber||"").toLowerCase().includes(t)||(e.repName||"").toLowerCase().includes(t)||(e.vehiclePlate||"").toLowerCase().includes(t),d=!o||e.status===o;return a&&d});B(n)};window.refreshDispatchList=b;window.openNewDispatchModal=()=>{i=[];const o=new Date().toISOString().slice(0,10).replace(/-/g,""),n=Math.floor(Math.random()*900)+100;document.getElementById("disp-number").value=`DSP-${o}-${n}`,document.getElementById("disp-date").value=I(),document.getElementById("disp-route").value="";const e=document.getElementById("disp-warehouse");e&&(e.innerHTML='<option value="">— اختر المستودع المصدر —</option>'+E.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""));const a=document.getElementById("disp-rep");a&&(a.innerHTML='<option value="">— اختر المندوب —</option>'+D.map(s=>`<option value="${s.id}" data-name="${s.name||s.fullName||""}">${s.name||s.fullName||s.id}</option>`).join(""));const d=document.getElementById("disp-vehicle");d&&(d.value=""),f(),document.getElementById("dispatch-modal").style.display="flex"};window.closeDispatchModal=()=>{document.getElementById("dispatch-modal").style.display="none"};window.searchDispatchProducts=t=>{const o=document.getElementById("disp-product-results");if(!o)return;if(t=(t||"").toLowerCase().trim(),!t){o.classList.add("hidden");return}const n=w.filter(e=>(e.name||"").toLowerCase().includes(t)||(e.sku||"").toLowerCase().includes(t)).slice(0,10);if(!n.length){o.innerHTML='<div style="padding:10px; color:var(--text-2); font-size:11.5px; text-align:center;">لا توجد أصناف مطابقة</div>',o.classList.remove("hidden");return}o.innerHTML=n.map(e=>`
    <div class="autocomplete-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between;" onclick="window.addDispatchProduct('${e.id}')">
      <div><b>${e.name}</b> <span style="font-size:11px; color:var(--text-2);">(${e.sku||"—"})</span></div>
      <b class="mono text-good">${r(e.sellingPrice||0)}</b>
    </div>
  `).join(""),o.classList.remove("hidden")};window.addDispatchProduct=t=>{const o=w.find(e=>e.id===t);if(!o)return;const n=i.find(e=>e.productId===t);n?n.qty+=1:i.push({productId:o.id,productName:o.name,sku:o.sku||"",unit:o.unit||"كرتون",qty:10,sellingPrice:o.sellingPrice||0}),document.getElementById("disp-product-search").value="",document.getElementById("disp-product-results").classList.add("hidden"),f()};function f(){const t=document.getElementById("disp-lines-tbody");if(!t)return;let o=0,n=0;i.length?t.innerHTML=i.map((e,a)=>{const d=e.qty*e.sellingPrice;return o+=e.qty,n+=d,`
        <tr style="border-bottom:1px solid var(--border-soft);">
          <td style="text-align:center; color:var(--text-2); font-size:11px;">${a+1}</td>
          <td class="font-bold">${e.productName}</td>
          <td style="color:var(--text-2);">${e.unit}</td>
          <td style="text-align:center;">
            <input type="number" class="form-control mono font-bold" style="width:75px; height:28px; text-align:center;" value="${e.qty}" min="1" onchange="window.updateDispLine(${a}, 'qty', this.value)" />
          </td>
          <td class="mono">${r(e.sellingPrice)}</td>
          <td class="mono font-bold text-good">${r(d)}</td>
          <td style="text-align:center;">
            <button class="btn btn-ghost sm" style="color:var(--bad);" onclick="window.removeDispLine(${a})">✕</button>
          </td>
        </tr>
      `}).join(""):t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>',document.getElementById("disp-total-items-count").textContent=`${i.length} صنف`,document.getElementById("disp-total-qty-count").textContent=o,document.getElementById("disp-total-val").textContent=r(n)}window.updateDispLine=(t,o,n)=>{i[t]&&(i[t][o]=parseFloat(n)||0,f())};window.removeDispLine=t=>{i.splice(t,1),f()};window.saveDispatch=async()=>{const t=document.getElementById("disp-warehouse"),o=document.getElementById("disp-rep"),n=document.getElementById("disp-vehicle"),e=t?.value,a=t?.options[t.selectedIndex]?.text||"",d=o?.value,s=o?.options[o?.selectedIndex],l=s?.dataset?.name||s?.text||"",x=(n?.value||"").trim(),h=document.getElementById("disp-route")?.value.trim()||"",p=document.getElementById("disp-number")?.value,_=document.getElementById("disp-date")?.value;if(!e){m("يرجى اختيار المستودع المصدر","error");return}if(!d){m("يرجى اختيار المندوب المسؤول","error");return}if(!i.length){m("يرجى إضافة صنف واحد على الأقل","error");return}const z=i.reduce((u,g)=>u+g.qty,0),L=i.reduce((u,g)=>u+g.qty*g.sellingPrice,0);try{const u={dispatchNumber:p,date:_,warehouseId:e,warehouseName:a,repId:d,repName:l,vehiclePlate:x,route:h,lines:i,totalQty:z,totalValue:L,status:"out",createdAt:new Date().toISOString()},g=await M(y.vanDispatches(),u);for(const $ of i)await k(e,$.productId,-$.qty,{type:"van_dispatch_out",sourceId:g,documentNumber:p,notes:`تحميل سيارة مندوب: ${l} (${x})`}).catch(N=>console.warn("adjustStock:",N));window.closeDispatchModal(),m(`✅ تم اعتماد إذن التحميل ${p} وخروج الشاحنة بنجاح`,"success"),await b()}catch(u){m("خطأ في الحفظ: "+u.message,"error"),console.error(u)}};window.openReconciliationModal=async t=>{const o=c.find(e=>e.id===t);if(!o)return;const n=document.getElementById("recon-modal-body");n&&(window._activeReconDispatch=o,n.innerHTML=`
    <div class="card" style="padding:14px; margin-bottom:14px; background:var(--bg-card); border-radius:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b style="color:var(--brand); font-size:15px;">${o.dispatchNumber}</b> — <span style="font-weight:700;">المندوب: ${o.repName}</span> (${o.vehiclePlate})
          <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">تاريخ التحميل: ${o.date} • المستودع: ${o.warehouseName}</div>
        </div>
        <span class="badge warn">جرد وتسوية نهاية اليوم</span>
      </div>
    </div>

    <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
      <div style="margin-bottom:8px; font-weight:800; font-size:13px;">📦 أدخل الكميات الفعلية المتبقية في السيارة:</div>
      <div class="table-container" style="max-height:300px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; font-size:12px;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th>اسم الصنف</th>
              <th style="width:90px; text-align:center;">المحمّل صباحاً</th>
              <th style="width:100px; text-align:center; color:#10B981;">المتبقي بالسيارة</th>
              <th style="width:90px; text-align:center; color:var(--brand);">المباع فعلياً</th>
              <th style="width:100px; text-align:center; color:#EF4444;">التوالف</th>
              <th style="width:110px; text-align:left;">إجمالي مبيعات البند</th>
            </tr>
          </thead>
          <tbody>
            ${(o.lines||[]).map((e,a)=>`
              <tr style="border-bottom:1px solid var(--border-soft);">
                <td class="font-bold">${e.productName}</td>
                <td style="text-align:center;" class="mono font-bold">${e.qty}</td>
                <td style="text-align:center;">
                  <input type="number" id="recon-return-${a}" class="form-control mono font-bold" style="width:80px; height:28px; text-align:center; color:#10B981;" value="0" min="0" max="${e.qty}" oninput="window.calcReconRow(${a}, ${e.qty}, ${e.sellingPrice})" />
                </td>
                <td style="text-align:center;">
                  <span id="recon-sold-${a}" class="mono font-bold text-brand">${e.qty}</span>
                </td>
                <td style="text-align:center;">
                  <input type="number" id="recon-damage-${a}" class="form-control mono font-bold" style="width:75px; height:28px; text-align:center; color:#EF4444;" value="0" min="0" oninput="window.calcReconRow(${a}, ${e.qty}, ${e.sellingPrice})" />
                </td>
                <td style="text-align:left;">
                  <span id="recon-row-val-${a}" class="mono font-bold text-good">${r(e.qty*e.sellingPrice)}</span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,document.getElementById("recon-modal").style.display="flex")};window.closeReconModal=()=>{document.getElementById("recon-modal").style.display="none"};window.calcReconRow=(t,o,n)=>{const e=parseFloat(document.getElementById(`recon-return-${t}`)?.value)||0,a=parseFloat(document.getElementById(`recon-damage-${t}`)?.value)||0,d=Math.max(0,o-e-a),s=document.getElementById(`recon-sold-${t}`),l=document.getElementById(`recon-row-val-${t}`);s&&(s.textContent=d),l&&(l.textContent=r(d*n))};window.saveReconciliation=async()=>{const t=window._activeReconDispatch;if(t&&await A("هل تريد اعتماد التسوية وإعادة البضاعة المتبقية لمستودع "+t.warehouseName+"؟","تأكيد التسوية"))try{let o=0,n=0,e=0,a=0;const d=(t.lines||[]).map((s,l)=>{const x=parseFloat(document.getElementById(`recon-return-${l}`)?.value)||0,h=parseFloat(document.getElementById(`recon-damage-${l}`)?.value)||0,p=Math.max(0,s.qty-x-h);return o+=x,n+=h,e+=p,a+=p*s.sellingPrice,{...s,returnedQty:x,damagedQty:h,soldQty:p,soldAmount:p*s.sellingPrice}});for(const s of d)s.returnedQty>0&&await k(t.warehouseId,s.productId,+s.returnedQty,{type:"van_dispatch_return",sourceId:t.id,documentNumber:t.dispatchNumber,notes:`إرجاع متبقي جرد سيارة: ${t.repName}`}).catch(l=>console.warn(l));await P(y.vanDispatches(),t.id,{status:"reconciled",reconLines:d,totalReturnedQty:o,totalDamagedQty:n,totalSoldQty:e,totalSalesVal:a,reconciledAt:new Date().toISOString()}),window.closeReconModal(),m("✅ تمت التسوية وإعادة المتبقي للمستودع بنجاح","success"),await b()}catch(o){alert("خطأ: "+o.message)}};window.printDispatch=t=>{const o=c.find(e=>e.id===t);if(!o)return;const n=window.open("","_blank");n.document.write(`
    <html dir="rtl">
      <head>
        <title>إذن تحميل سيارة ${o.dispatchNumber}</title>
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 24px; color: #111; }
          .header { text-align:center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #999; padding: 8px; text-align: right; }
          th { background: #f0f0f0; }
          .mono { font-family: monospace; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>شركة إدهام للمواد الغذائية</h2>
          <h3>إذن تحميل وتسليم بضاعة لسيارة توزيع (${o.dispatchNumber})</h3>
          <p>التاريخ: ${o.date} | المستودع: ${o.warehouseName} | المندوب: ${o.repName} | اللوحة: ${o.vehiclePlate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>الوحدة</th>
              <th>الكمية المسلمة</th>
              <th>سعر البيع</th>
              <th>إجمالي القيمة</th>
            </tr>
          </thead>
          <tbody>
            ${(o.lines||[]).map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>${e.productName}</td>
                <td>${e.unit}</td>
                <td class="mono">${e.qty}</td>
                <td class="mono">${r(e.sellingPrice)}</td>
                <td class="mono">${r(e.qty*e.sellingPrice)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="margin-top: 40px; display:flex; justify-content:space-between;">
          <div>توقيع أمين المستودع: _________________</div>
          <div>توقيع المندوب المستلم: _________________</div>
        </div>
      </body>
    </html>
  `),n.document.close(),n.print()};export{J as render};
