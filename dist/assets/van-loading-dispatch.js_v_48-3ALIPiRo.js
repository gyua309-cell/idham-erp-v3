import{t as R,g as D,C as k,f as x,y as Y,c as X,z as C,k as j,u as O,l as H,d as J,a as U}from"./index-CF9GFeRJ.js";import{orderBy as Z,collection as G,query as B,where as P,getDocs as S}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const z=(...e)=>window.showToast?.(...e)??console.log(...e),tt=(...e)=>window.showConfirm?.(...e)??Promise.resolve(!0);let _=[],T=[],N=[],V=[],v=[],q=new Map,M=null;async function A(e,t){const a=/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|عمرو|احمد|عوض|السيد/i.test(t||""),n=a?"1-1-4-1-02":"1-1-4-1";try{const o=G(J,`companies/${U}/chartOfAccounts`);if(e){const p=B(o,P("sourceEntityId","==",e)),c=await S(p);if(!c.empty){const s=c.docs[0],b=s.data();return{code:b.code,id:s.id,name:b.name}}}const d=B(o,P("parentCode","==",n)),m=(await S(d)).docs.map(p=>({id:p.id,...p.data()})),i=(t||"").trim().toLowerCase();for(const p of m){const c=(p.name||"").toLowerCase();if(c===i||c.includes(i)||i.includes(c))return{code:p.code,id:p.id,name:p.name}}return a?{code:"1-1-4-1-02",id:"Sk02PGbhDhvVPQtKmkq6",name:"مخزون سيارات التوزيع"}:{code:"1-1-4-1-01",id:"wh_coa_W5uANJjMgfFh2p3xU4bT",name:"مخزون المستودع الرئيسى"}}catch(o){console.warn("[getWarehouseInventoryAccount] COA lookup failed:",o.message)}return{code:a?"1-1-4-1-02":"1-1-4-1-01",id:a?"Sk02PGbhDhvVPQtKmkq6":"wh_coa_W5uANJjMgfFh2p3xU4bT",name:a?"مخزون سيارات التوزيع":"مخزون المستودع الرئيسى"}}async function et(){try{const e=G(J,`companies/${U}/chartOfAccounts`),t=B(e,P("code","==","5-1-10")),a=await S(t);if(!a.empty){const d=a.docs[0].data();return{id:a.docs[0].id,code:d.code,name:d.name}}const n=B(e,P("code","==","5-2-2")),o=await S(n);if(!o.empty){const d=o.docs[0].data();return{id:o.docs[0].id,code:d.code,name:d.name}}}catch(e){console.warn("getDamageExpenseAccount:",e)}return{id:"LwGr9VldJ6MD8ds1WO3l",code:"5-1-10",name:"خسائر وتوالف مخزنية وبضاعة تالفة"}}async function ct(e,t){await ot(e)}async function ot(e){e||(e=document.getElementById("main-content")),e&&(e.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:linear-gradient(135deg, #10B981, #059669); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
            🚚
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">تحميل وجرد سيارات مندوبي التوزيع (Van Dispatch)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">إذونات التحميل الصباحية • جرد المتبقي والتوالف المسائي • قيود وحركات مخزنية مؤتمتة بالكامل</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.openNewDispatchModal()" style="display:flex; align-items:center; gap:8px; font-weight:800; padding:10px 20px; border-radius:10px; background:linear-gradient(135deg, #10B981, #059669); box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            <span style="font-size:16px;">➕</span> <span>إذن تحميل صباحي جديد</span>
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
                <th style="width:95px;">التاريخ</th>
                <th>المندوب / السائق</th>
                <th>المركبة / اللوحة</th>
                <th>المستودع المصدر</th>
                <th>مخزن السيارة</th>
                <th style="width:85px; text-align:center;">عدد الأصناف</th>
                <th style="width:85px; text-align:center;">إجمالي الكراتين</th>
                <th style="width:115px; text-align:left;">قيمة التحميل</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:160px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="dispatches-tbody">
              <tr><td colspan="11" style="text-align:center; padding:30px; color:var(--text-2);">⏳ جارٍ تحميل أذونات التحميل…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══════════ NEW DISPATCH MODAL ═══════════ -->
    <div class="modal-overlay" id="dispatch-modal" onclick="if(event.target===this)window.closeDispatchModal()">
      <div class="modal modal-xl" style="max-width:1080px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">🚚</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">إذن تحميل سيارة توزيع صباحي جديد</h3>
              <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-2);">يخصم من المستودع المصدر ويضاف لعهدة ومخزن سيارة المندوب مع قيد محاسبي تلقائي</p>
            </div>
          </div>
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
                <input type="date" id="disp-date" class="form-control mono font-bold" value="${R()}" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المستودع المصدر (الصرف) *</label>
                <select id="disp-warehouse" class="form-control font-bold" onchange="window.onSourceWarehouseChange(this.value)"></select>
              </div>
            </div>

            <div class="grid-3 gap-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المندوب المسؤول *</label>
                <select id="disp-rep" class="form-control font-bold" onchange="window.onDispRepChange(this.value)"></select>
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

            <!-- Auto Warehouse Link Indicator Badge -->
            <div id="disp-rep-wh-badge" style="margin-top:12px; padding:8px 12px; border-radius:8px; font-size:12px; display:none; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:var(--good);">
            </div>
          </div>

          <!-- Items Selection Section -->
          <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13.5px; color:var(--text-0);">📋 البضاعة المحملة بالسيارة</strong>
              <div style="position:relative; width:380px;">
                <input type="text" id="disp-product-search" class="form-control" placeholder="🔍 ابحث بالاسم أو الباركود لإضافة صنف للسيارة..." oninput="window.searchDispatchProducts(this.value)" autocomplete="off" />
                <div id="disp-product-results" class="autocomplete-results hidden" style="position:absolute; top:100%; right:0; left:0; max-height:220px; overflow-y:auto; z-index:100; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.18);"></div>
              </div>
            </div>

            <div class="table-container" style="max-height:280px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-3);">
                    <th style="width:30px;">#</th>
                    <th>اسم الصنف</th>
                    <th style="width:70px;">الوحدة</th>
                    <th style="width:85px; text-align:center;">المتاح بالمصدر</th>
                    <th style="width:100px; text-align:center;">كمية التحميل</th>
                    <th style="width:90px; text-align:left;">سعر التكلفة</th>
                    <th style="width:95px; text-align:left;">سعر البيع</th>
                    <th style="width:110px; text-align:left;">إجمالي البيع</th>
                    <th style="width:35px;"></th>
                  </tr>
                </thead>
                <tbody id="disp-lines-tbody">
                  <tr><td colspan="9" style="text-align:center; padding:25px; color:var(--text-2);">لم يتم إضافة أصناف بعد — استخدم مربع البحث أعلاه لاختيار الأصناف</td></tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding:12px 16px; background:var(--bg-2); border-radius:10px; flex-wrap:wrap; gap:10px;">
              <div>
                <span style="font-size:12px; color:var(--text-2);">عدد الأصناف: </span>
                <b id="disp-total-items-count" class="mono">0 صنف</b>
                <span style="margin:0 8px; color:var(--border-soft);">|</span>
                <span style="font-size:12px; color:var(--text-2);">إجمالي الكراتين/القطع: </span>
                <b id="disp-total-qty-count" class="mono font-bold" style="color:var(--brand);">0</b>
              </div>
              <div style="display:flex; gap:18px; align-items:center;">
                <div>
                  <span style="font-size:12px; color:var(--text-2);">إجمالي التكلفة: </span>
                  <span id="disp-total-cost" class="mono font-bold" style="font-size:14px; color:var(--text-1);">0.00 ر.س</span>
                </div>
                <div>
                  <span style="font-size:13px; font-weight:800; color:var(--text-0);">إجمالي قيمة البضاعة: </span>
                  <span id="disp-total-val" class="mono font-bold" style="font-size:17px; color:var(--brand);">0.00 ر.س</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeDispatchModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-dispatch-btn" onclick="window.saveDispatch()" style="padding:9px 24px; font-weight:800; background:linear-gradient(135deg,#10B981,#059669); box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            💾 حفظ واعتماد خروج السيارة (نقل مخزني وقيد تلقائي)
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ EVENING RECONCILIATION MODAL ═══════════ -->
    <div class="modal-overlay" id="recon-modal" onclick="if(event.target===this)window.closeReconModal()">
      <div class="modal modal-xl" style="max-width:1100px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">⚖️</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">تسوية وجرد متبقي وتوالف سيارة التوزيع المسائي</h3>
              <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-2);">إعادة المتبقي للمستودع الرئيسي وإثبات التوالف وإقفال مبيعات اليومية آلياً</p>
            </div>
          </div>
          <button class="modal-close" onclick="window.closeReconModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);" id="recon-modal-body">
          <!-- Dynamic Content -->
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeReconModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-recon-btn" onclick="window.saveReconciliation()" style="padding:9px 24px; font-weight:800; background:linear-gradient(135deg, #6366F1, #4F46E5);">
            💾 اعتماد التسوية وإعادة المتبقي للمستودع (قيود وحركات آلية)
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ VIEW RECONCILIATION SUMMARY MODAL ═══════════ -->
    <div class="modal-overlay" id="recon-view-modal" onclick="if(event.target===this)window.closeReconViewModal()">
      <div class="modal modal-lg" style="max-width:900px; width:95%; max-height:90vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">📊 تقرير تسوية جرد سيارة التوزيع المسائية</h3>
          <button class="modal-close" onclick="window.closeReconViewModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);" id="recon-view-body">
          <!-- Dynamic Content -->
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeReconViewModal()">إغلاق</button>
          <button class="btn btn-secondary" id="print-recon-summary-btn" onclick="window.printCurrentReconciliation()">🖨️ طباعة تقرير التسوية</button>
        </div>
      </div>
    </div>
  `,await Q())}async function Q(){try{const[e,t,a,n]=await Promise.all([D(k.vanDispatches(),[Z("createdAt","desc")]).catch(async()=>D(k.vanDispatches()).catch(()=>[])),D(k.salesReps()).catch(()=>[]),D(k.warehouses()).catch(()=>[]),D(k.products()).catch(()=>[])]);_=e||[],_.sort((o,d)=>new Date(d.createdAt||0)-new Date(o.createdAt||0)),T=t||[],N=a||[],V=n||[],K(_),at()}catch(e){console.error("loadDispatchInitialData error:",e),z("خطأ في تحميل البيانات: "+e.message,"error")}}function at(){const e=_.length,t=_.filter(d=>d.status==="out").length,a=_.filter(d=>d.status==="reconciled").length,n=_.filter(d=>d.status==="out").reduce((d,l)=>d+(l.totalValue||0),0),o=d=>document.getElementById(d);o("stat-dispatch-count")&&(o("stat-dispatch-count").textContent=e),o("stat-active-vans")&&(o("stat-active-vans").textContent=t),o("stat-reconciled-count")&&(o("stat-reconciled-count").textContent=a),o("stat-total-dispatched-val")&&(o("stat-total-dispatched-val").textContent=x(n))}function K(e){const t=document.getElementById("dispatches-tbody");if(t){if(!e.length){t.innerHTML='<tr><td colspan="11" style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أذونات تحميل مسجلة حتى الآن</td></tr>';return}t.innerHTML=e.map(a=>{const n=a.status==="out";return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="mono font-bold" style="color:var(--brand);">${a.dispatchNumber||a.id}</td>
        <td class="mono">${a.date||"—"}</td>
        <td class="font-bold" style="color:var(--text-0);">${a.repName||"—"}</td>
        <td>${a.vehiclePlate?`🚚 ${a.vehiclePlate}`:"—"}</td>
        <td style="color:var(--text-2); font-size:12px;">${a.warehouseName||"—"}</td>
        <td style="color:var(--brand); font-size:12px; font-weight:700;">${a.destWarehouseName||"—"}</td>
        <td style="text-align:center;" class="mono">${(a.lines||[]).length}</td>
        <td style="text-align:center;" class="mono font-bold">${a.totalQty||0}</td>
        <td style="text-align:left;" class="mono font-bold text-good">${x(a.totalValue||0)}</td>
        <td style="text-align:center;">
          ${n?'<span class="badge warn" style="font-size:11px; padding:3px 8px;">⏳ في الميدان</span>':'<span class="badge good" style="font-size:11px; padding:3px 8px;">✅ تمت التسوية</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.printDispatch('${a.id}')" title="طباعة إذن التحميل">🖨️ إذن</button>
            ${n?`
              <button class="btn btn-primary btn-sm" style="background:#6366F1; font-size:11px; padding:3px 8px; font-weight:700;" onclick="window.openReconciliationModal('${a.id}')">⚖️ جرد مسائي</button>
            `:`
              <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="window.viewReconciliationSummary('${a.id}')">👁️ التقرير</button>
              <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="window.printReconciliation('${a.id}')" title="طباعة تقرير التسوية">🖨️ تسوية</button>
            `}
          </div>
        </td>
      </tr>
    `}).join("")}}window.filterDispatches=()=>{const e=document.getElementById("dispatch-search")?.value.toLowerCase().trim()||"",t=document.getElementById("dispatch-status-filter")?.value||"",a=_.filter(n=>{const o=!e||(n.dispatchNumber||"").toLowerCase().includes(e)||(n.repName||"").toLowerCase().includes(e)||(n.vehiclePlate||"").toLowerCase().includes(e),d=!t||n.status===t;return o&&d});K(a)};window.refreshDispatchList=Q;window.openNewDispatchModal=async()=>{v=[];const t=new Date().toISOString().slice(0,10).replace(/-/g,""),a=Math.floor(Math.random()*900)+100,n=document.getElementById("disp-number"),o=document.getElementById("disp-date"),d=document.getElementById("disp-route"),l=document.getElementById("disp-vehicle"),m=document.getElementById("disp-rep-wh-badge");n&&(n.value=`DSP-${t}-${a}`),o&&(o.value=R()),d&&(d.value=""),l&&(l.value=""),m&&(m.style.display="none");const i=document.getElementById("disp-warehouse");if(i){const c=N.find(s=>s.id==="W5uANJjMgfFh2p3xU4bT"||(s.type||"").toLowerCase()==="main"||s.name.includes("الرئيس"));i.innerHTML=N.filter(s=>(s.type||"").toLowerCase()!=="vehicle").map(s=>`<option value="${s.id}" ${c&&c.id===s.id?"selected":""}>${s.name}</option>`).join(""),i.options.length||(i.innerHTML=N.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")),M=i.value}const p=document.getElementById("disp-rep");p&&(p.innerHTML='<option value="">— اختر المندوب المسند له التحميل —</option>'+T.map(c=>`<option value="${c.id}" data-name="${c.name||c.fullName||""}">${c.name||c.fullName||c.id}</option>`).join("")),await window.onSourceWarehouseChange(M),L(),window.openModal("dispatch-modal")};window.closeDispatchModal=()=>{window.closeModal("dispatch-modal")};window.onSourceWarehouseChange=async e=>{if(M=e||document.getElementById("disp-warehouse")?.value,q.clear(),M)try{const t=await Y(M);for(const a of t)q.set(a.productId,a.qty||0)}catch(t){console.warn("Could not fetch warehouse stock:",t)}L()};window.onDispRepChange=e=>{const t=T.find(l=>l.id===e),a=document.getElementById("disp-vehicle"),n=document.getElementById("disp-rep-wh-badge");if(!t){a&&(a.value=""),n&&(n.style.display="none");return}const o=t.vehiclePlate||t.vehicle||"";a&&(a.value=o);let d=null;if(t.assignedWarehouseId&&(d=N.find(l=>l.id===t.assignedWarehouseId)),!d){const l=(t.name||t.fullName||"").trim();d=N.find(m=>(m.name||"").includes(l)&&(m.type||"").toLowerCase()==="vehicle")}n&&(d?(n.innerHTML=`🚚 <b>مخزن سيارة المندوب المرتبط:</b> ${d.name} <span class="badge good" style="margin-right:6px; font-size:11px;">مربوط وجاهز للأتمتة التامة</span>`,n.style.display="block"):(n.innerHTML='⚠️ <span style="color:var(--warn); font-weight:700;">تنبيه:</span> لا يوجد مخزن سيارة مرتبط بهذا المندوب. سيتم ربطه آلياً بمخزن سيارات التوزيع.',n.style.display="block"))};window.searchDispatchProducts=e=>{const t=document.getElementById("disp-product-results");if(!t)return;if(e=(e||"").toLowerCase().trim(),!e){t.classList.add("hidden");return}const a=V.filter(n=>(n.name||"").toLowerCase().includes(e)||(n.sku||"").toLowerCase().includes(e)||(n.barcode||"").toLowerCase().includes(e)).slice(0,10);if(!a.length){t.innerHTML='<div style="padding:12px; color:var(--text-2); font-size:12px; text-align:center;">لا توجد أصناف مطابقة للبحث</div>',t.classList.remove("hidden");return}t.innerHTML=a.map(n=>{const o=q.get(n.id)||0,d=o>0?"text-good":"text-bad";return`
      <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;" onclick="window.addDispatchProduct('${n.id}')">
        <div>
          <b style="color:var(--text-0);">${n.name}</b> 
          <span style="font-size:11px; color:var(--text-2); margin-right:6px;">(${n.unit||"كرتون"} - ${n.sku||"—"})</span>
        </div>
        <div style="display:flex; gap:14px; align-items:center;">
          <span style="font-size:11.5px; color:var(--text-2);">المتاح: <b class="mono ${d}">${o}</b></span>
          <b class="mono text-good">${x(n.sellingPrice||n.priceRetail||0)}</b>
        </div>
      </div>
    `}).join(""),t.classList.remove("hidden")};window.addDispatchProduct=e=>{const t=V.find(m=>m.id===e);if(!t)return;const a=parseFloat(t.averageCost||t.costPrice||t.purchasePrice||0)||Math.round(parseFloat(t.sellingPrice||t.priceRetail||0)*.7*100)/100||1,n=parseFloat(t.sellingPrice||t.priceRetail||0)||0,o=v.find(m=>m.productId===e);o?o.qty+=1:v.push({productId:t.id,productName:t.name,sku:t.sku||"",unit:t.unit||"كرتون",qty:10,costPrice:a,sellingPrice:n});const d=document.getElementById("disp-product-search"),l=document.getElementById("disp-product-results");d&&(d.value=""),l&&l.classList.add("hidden"),L()};function L(){const e=document.getElementById("disp-lines-tbody");if(!e)return;let t=0,a=0,n=0;v.length?e.innerHTML=v.map((i,p)=>{const c=i.qty*i.sellingPrice,s=i.qty*i.costPrice;t+=i.qty,a+=c,n+=s;const b=q.get(i.productId)||0,h=i.qty>b;return`
        <tr style="border-bottom:1px solid var(--border-soft); ${h?"background:rgba(239,68,68,0.05);":""}">
          <td style="text-align:center; color:var(--text-2); font-size:11px;">${p+1}</td>
          <td class="font-bold">${i.productName}</td>
          <td style="color:var(--text-2);">${i.unit}</td>
          <td style="text-align:center;" class="mono font-bold ${b>0?"text-good":"text-bad"}">
            ${b}
          </td>
          <td style="text-align:center;">
            <input type="number" class="form-control mono font-bold" style="width:80px; height:28px; text-align:center; ${h?"border-color:var(--bad); color:var(--bad);":""}" value="${i.qty}" min="1" onchange="window.updateDispLine(${p}, 'qty', this.value)" />
          </td>
          <td class="mono font-bold" style="color:var(--text-2);">${x(i.costPrice)}</td>
          <td class="mono font-bold">${x(i.sellingPrice)}</td>
          <td class="mono font-bold text-good">${x(c)}</td>
          <td style="text-align:center;">
            <button class="btn btn-ghost sm" style="color:var(--bad); padding:2px 6px;" onclick="window.removeDispLine(${p})">✕</button>
          </td>
        </tr>
      `}).join(""):e.innerHTML='<tr><td colspan="9" style="text-align:center; padding:25px; color:var(--text-2);">لم يتم إضافة أصناف بعد — استخدم مربع البحث أعلاه لاختيار الأصناف</td></tr>';const o=document.getElementById("disp-total-items-count"),d=document.getElementById("disp-total-qty-count"),l=document.getElementById("disp-total-cost"),m=document.getElementById("disp-total-val");o&&(o.textContent=`${v.length} صنف`),d&&(d.textContent=t),l&&(l.textContent=x(n)),m&&(m.textContent=x(a))}window.updateDispLine=(e,t,a)=>{v[e]&&(v[e][t]=parseFloat(a)||0,L())};window.removeDispLine=e=>{v.splice(e,1),L()};window.saveDispatch=async()=>{const e=document.getElementById("save-dispatch-btn"),t=document.getElementById("disp-warehouse"),a=document.getElementById("disp-rep"),n=document.getElementById("disp-vehicle"),o=t?.value,d=t?.options[t.selectedIndex]?.text||"",l=a?.value,m=a?.options[a?.selectedIndex],i=m?.dataset?.name||m?.text||"",p=(n?.value||"").trim(),c=document.getElementById("disp-route")?.value.trim()||"",s=document.getElementById("disp-number")?.value,b=document.getElementById("disp-date")?.value;if(!o){z("يرجى اختيار المستودع المصدر","error");return}if(!l){z("يرجى اختيار المندوب المسؤول","error");return}if(!v.length){z("يرجى إضافة صنف واحد على الأقل للسيارة","error");return}for(const u of v)if((u.qty||0)<=0){z(`الكمية المدخلة للصنف ${u.productName} غير صحيحة`,"error");return}const h=T.find(u=>u.id===l);let g=h?.assignedWarehouseId||null,r=g?N.find(u=>u.id===g):null;r||(r=N.find(u=>(u.name||"").includes(i)&&(u.type||"").toLowerCase()==="vehicle"),r&&(g=r.id));const I=r?r.name:`مخزن سيارة المندوب ${i}`,y=v.reduce((u,$)=>u+$.qty,0),f=v.reduce((u,$)=>u+$.qty*$.sellingPrice,0),w=v.reduce((u,$)=>u+$.qty*($.costPrice||0),0);e&&(e.disabled=!0,e.innerHTML="⏳ جارٍ الحفظ وإجراء القيود والحركات المخزنية…");try{const u={dispatchNumber:s,date:b,warehouseId:o,warehouseName:d,destWarehouseId:g,destWarehouseName:I,repId:l,repName:i,vehiclePlate:p,route:c,lines:v,totalQty:y,totalValue:f,totalCost:Math.round(w*100)/100,status:"out",createdAt:new Date().toISOString()},$=await X(k.vanDispatches(),u);for(const E of v)await C(o,E.productId,-E.qty,{type:"van_dispatch_out",sourceId:$,documentNumber:s,notes:`إذن تحميل صباحي: صرف بضاعة لسيارة المندوب ${i} (${p||""})`}),g&&await C(g,E.productId,+E.qty,{type:"van_dispatch_in",sourceId:$,documentNumber:s,notes:`استلام تحميل بضاعة بالسيارة - إذن ${s}`});let F=null;if(w>.001)try{const E=await A(o,d),W=await A(g,I);F=await j({entryNumber:`JE-${s}`,date:b||R(),description:`إذن تحميل صباحي ${s} — نقل بضاعة من ${d} إلى ${I}`,sourceType:"vanDispatch",sourceId:$,costCenterId:h?.costCenterId||null,lines:[{accountId:W.id,accountCode:W.code,accountName:W.name,debit:Math.round(w*100)/100,credit:0,note:`استلام مخزون بسيارة المندوب ${i}`},{accountId:E.id,accountCode:E.code,accountName:E.name,debit:0,credit:Math.round(w*100)/100,note:`صرف مخزون من ${d} للسيارة`}]}),await O(k.vanDispatches(),$,{journalEntryId:F})}catch(E){console.warn("[saveDispatch] Auto JE failed:",E.message)}H(k.vanDispatches().path),window.closeDispatchModal(),z(`✅ تم اعتماد إذن التحميل ${s} وتحديث المخزون والقيد المحاسبي بنجاح`,"success",4e3),await Q()}catch(u){z("خطأ في الحفظ: "+u.message,"error"),console.error(u)}finally{e&&(e.disabled=!1,e.innerHTML="💾 حفظ واعتماد خروج السيارة (نقل مخزني وقيد تلقائي)")}};window.openReconciliationModal=async e=>{const t=_.find(n=>n.id===e);if(!t)return;const a=document.getElementById("recon-modal-body");a&&(window._activeReconDispatch=t,a.innerHTML=`
    <div class="card" style="padding:14px; margin-bottom:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <b style="color:var(--brand); font-size:16px;">${t.dispatchNumber}</b> — <span style="font-weight:800; font-size:14px;">المندوب: ${t.repName}</span> (${t.vehiclePlate||"بدون لوحة"})
          <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
            تاريخ التحميل: <b class="mono">${t.date}</b> • المستودع المصدر: <b>${t.warehouseName}</b> • مخزن السيارة: <b>${t.destWarehouseName||"مخزن السيارة"}</b>
          </div>
        </div>
        <span class="badge warn" style="font-size:12px; padding:4px 10px;">جرد وتسوية نهاية اليوم</span>
      </div>
    </div>

    <div class="card" style="padding:16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="margin-bottom:10px; font-weight:800; font-size:13.5px; color:var(--text-0);">📦 أدخل الكميات الفعلية المتبقية والتوالف في السيارة:</div>
      <div class="table-container" style="max-height:320px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
        <table class="data-dense" style="margin:0; font-size:12px;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th>اسم الصنف</th>
              <th style="width:85px; text-align:center;">المحمّل صباحاً</th>
              <th style="width:110px; text-align:center; color:#10B981;">المتبقي العائد للمستودع</th>
              <th style="width:95px; text-align:center; color:#EF4444;">التوالف</th>
              <th style="width:95px; text-align:center; color:var(--brand);">المباع فعلياً</th>
              <th style="width:115px; text-align:left;">إجمالي مبيعات البند</th>
            </tr>
          </thead>
          <tbody>
            ${(t.lines||[]).map((n,o)=>`
              <tr style="border-bottom:1px solid var(--border-soft);">
                <td class="font-bold">${n.productName} <span style="font-size:11px; color:var(--text-2);">(${n.unit})</span></td>
                <td style="text-align:center;" class="mono font-bold">${n.qty}</td>
                <td style="text-align:center;">
                  <input type="number" id="recon-return-${o}" class="form-control mono font-bold" style="width:85px; height:28px; text-align:center; color:#10B981; border-color:#10B981;" value="0" min="0" max="${n.qty}" oninput="window.calcReconRow(${o})" />
                </td>
                <td style="text-align:center;">
                  <input type="number" id="recon-damage-${o}" class="form-control mono font-bold" style="width:80px; height:28px; text-align:center; color:#EF4444; border-color:#EF4444;" value="0" min="0" max="${n.qty}" oninput="window.calcReconRow(${o})" />
                </td>
                <td style="text-align:center;">
                  <span id="recon-sold-${o}" class="mono font-bold text-brand" style="font-size:13px;">${n.qty}</span>
                </td>
                <td style="text-align:left;">
                  <span id="recon-row-val-${o}" class="mono font-bold text-good">${x(n.qty*n.sellingPrice)}</span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Realtime Summary Row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-top:14px; padding:12px; background:var(--bg-2); border-radius:10px;">
        <div>
          <span style="font-size:11px; color:var(--text-2);">إجمالي المحمّل صباحاً:</span>
          <div class="mono font-bold" style="font-size:15px;">${t.totalQty} كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:#10B981;">إجمالي المرتجع للمستودع:</span>
          <div class="mono font-bold" id="recon-sum-return" style="font-size:15px; color:#10B981;">0 كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:#EF4444;">إجمالي التوالف:</span>
          <div class="mono font-bold" id="recon-sum-damage" style="font-size:15px; color:#EF4444;">0 كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--brand);">إجمالي المباع فعلياً:</span>
          <div class="mono font-bold" id="recon-sum-sold" style="font-size:15px; color:var(--brand);">${t.totalQty} كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--text-0);">إجمالي المبيعات التقديرية:</span>
          <div class="mono font-bold text-good" id="recon-sum-val" style="font-size:15px;">${x(t.totalValue)}</div>
        </div>
      </div>
    </div>
  `,window.openModal("recon-modal"))};window.closeReconModal=()=>{window.closeModal("recon-modal")};window.calcReconRow=e=>{const t=window._activeReconDispatch;if(!t)return;const a=t.lines||[];let n=0,o=0,d=0,l=0;a.forEach((s,b)=>{const h=document.getElementById(`recon-return-${b}`),g=document.getElementById(`recon-damage-${b}`),r=document.getElementById(`recon-sold-${b}`),I=document.getElementById(`recon-row-val-${b}`);let y=parseFloat(h?.value)||0,f=parseFloat(g?.value)||0;y+f>s.qty&&(b===e&&z(`مجموع المرتجع والتالف للصنف ${s.productName} لا يمكن أن يتجاوز المحمل (${s.qty})`,"warn"),y=Math.min(y,s.qty),f=Math.max(0,Math.min(f,s.qty-y)),h&&(h.value=y),g&&(g.value=f));const w=Math.max(0,s.qty-y-f),u=w*s.sellingPrice;r&&(r.textContent=w),I&&(I.textContent=x(u)),n+=y,o+=f,d+=w,l+=u});const m=document.getElementById("recon-sum-return"),i=document.getElementById("recon-sum-damage"),p=document.getElementById("recon-sum-sold"),c=document.getElementById("recon-sum-val");m&&(m.textContent=`${n} كرتون`),i&&(i.textContent=`${o} كرتون`),p&&(p.textContent=`${d} كرتون`),c&&(c.textContent=x(l))};window.saveReconciliation=async()=>{const e=window._activeReconDispatch;if(!e)return;const t=document.getElementById("save-recon-btn");if(await tt(`هل أنت متأكد من اعتماد تسوية إذن التحميل ${e.dispatchNumber} وإعادة البضاعة المتبقية لمستودع ${e.warehouseName}؟`,"تأكيد التسوية المسائية")){t&&(t.disabled=!0,t.innerHTML="⏳ جارٍ تسوية المخزون وإجراء القيود المحاسبية…");try{let a=0,n=0,o=0,d=0,l=0,m=0;const i=(e.lines||[]).map((r,I)=>{const y=parseFloat(document.getElementById(`recon-return-${I}`)?.value)||0,f=parseFloat(document.getElementById(`recon-damage-${I}`)?.value)||0,w=Math.max(0,r.qty-y-f),u=r.costPrice||0;return a+=y,n+=f,o+=w,d+=w*r.sellingPrice,l+=y*u,m+=f*u,{...r,returnedQty:y,damagedQty:f,soldQty:w,soldAmount:w*r.sellingPrice}}),p=e.destWarehouseId,c=e.warehouseId;for(const r of i)r.returnedQty>0&&(p&&await C(p,r.productId,-r.returnedQty,{type:"van_return_out",sourceId:e.id,documentNumber:e.dispatchNumber,notes:`إرجاع متبقي جرد مسائي من سيارة: ${e.repName}`}),await C(c,r.productId,+r.returnedQty,{type:"van_return_in",sourceId:e.id,documentNumber:e.dispatchNumber,notes:`استلام مرتجع جرد مسائي من سيارة: ${e.repName}`})),r.damagedQty>0&&await C(p||c,r.productId,-r.damagedQty,{type:"inventory_damage",sourceId:e.id,documentNumber:e.dispatchNumber,notes:`تسوية توالف سيارة التوزيع: ${e.repName} (${r.damagedQty} ${r.unit})`});let s=null,b=null;const h=await A(c,e.warehouseName),g=await A(p,e.destWarehouseName);if(l>.001)try{s=await j({entryNumber:`JE-RET-${e.dispatchNumber}`,date:R(),description:`تسوية مرتجع جرد مسائي ${e.dispatchNumber} — من سيارة ${e.repName} إلى ${e.warehouseName}`,sourceType:"vanReconciliationReturn",sourceId:e.id,lines:[{accountId:h.id,accountCode:h.code,accountName:h.name,debit:Math.round(l*100)/100,credit:0,note:"إعادة بضاعة متبقية للمستودع الرئيسي"},{accountId:g.id,accountCode:g.code,accountName:g.name,debit:0,credit:Math.round(l*100)/100,note:`تخفيض عهدة سيارة المندوب ${e.repName}`}]})}catch(r){console.warn("Return JE Error:",r)}if(m>.001)try{const r=await et();b=await j({entryNumber:`JE-DAM-${e.dispatchNumber}`,date:R(),description:`إثبات توالف بضاعة جرد مسائي ${e.dispatchNumber} — سيارة ${e.repName}`,sourceType:"vanReconciliationDamage",sourceId:e.id,lines:[{accountId:r.id,accountCode:r.code,accountName:r.name,debit:Math.round(m*100)/100,credit:0,note:"خسائر وتوالف بضاعة سيارة التوزيع"},{accountId:g.id,accountCode:g.code,accountName:g.name,debit:0,credit:Math.round(m*100)/100,note:"تخفيض مخزون السيارة للتالف"}]})}catch(r){console.warn("Damage JE Error:",r)}await O(k.vanDispatches(),e.id,{status:"reconciled",reconLines:i,totalReturnedQty:a,totalDamagedQty:n,totalSoldQty:o,totalSalesVal:d,totalReturnedCost:Math.round(l*100)/100,totalDamagedCost:Math.round(m*100)/100,returnJEId:s,damageJEId:b,reconciledAt:new Date().toISOString()}),H(k.vanDispatches().path),window.closeReconModal(),z(`✅ تمت التسوية بنجاح: تم إرجاع ${a} كرتون للمستودع وإجراء القيود المحاسبية الآلية`,"success",4e3),await Q()}catch(a){z("خطأ في اعتماد التسوية: "+a.message,"error"),console.error(a)}finally{t&&(t.disabled=!1,t.innerHTML="💾 اعتماد التسوية وإعادة المتبقي للمستودع (قيود وحركات آلية)")}}};window.viewReconciliationSummary=e=>{const t=_.find(o=>o.id===e);if(!t)return;window._currentViewingRecon=t;const a=document.getElementById("recon-view-body");if(!a)return;const n=t.reconLines||t.lines||[];a.innerHTML=`
    <div class="card" style="padding:16px; margin-bottom:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h4 style="margin:0; font-size:16px; font-weight:900; color:var(--brand);">${t.dispatchNumber}</h4>
          <div style="font-size:12.5px; color:var(--text-1); margin-top:4px;">
            المندوب: <b>${t.repName}</b> • اللوحة: <b>${t.vehiclePlate||"—"}</b> • التاريخ: <b>${t.date}</b>
          </div>
          <div style="font-size:12px; color:var(--text-2); margin-top:2px;">
            المستودع المصدر: <b>${t.warehouseName}</b> • مخزن السيارة: <b>${t.destWarehouseName||"مخزن السيارة"}</b>
          </div>
        </div>
        <span class="badge good" style="font-size:12px; padding:4px 10px;">✅ تمت التسوية والجرد</span>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; margin-bottom:14px;">
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-2);">المحمّل صباحاً</div>
        <div class="mono font-bold" style="font-size:17px; margin-top:2px;">${t.totalQty||0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:#10B981;">المرتجع للمستودع</div>
        <div class="mono font-bold text-good" style="font-size:17px; margin-top:2px;">${t.totalReturnedQty||0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:#EF4444;">التوالف</div>
        <div class="mono font-bold text-bad" style="font-size:17px; margin-top:2px;">${t.totalDamagedQty||0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--brand);">المباع بالميدان</div>
        <div class="mono font-bold" style="font-size:17px; margin-top:2px; color:var(--brand);">${t.totalSoldQty||0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-0); font-weight:700;">إجمالي المبيعات</div>
        <div class="mono font-bold text-good" style="font-size:17px; margin-top:2px;">${x(t.totalSalesVal||0)}</div>
      </div>
    </div>

    <!-- Items Detail Table -->
    <div class="card" style="padding:0; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft); overflow:hidden; margin-bottom:14px;">
      <div class="table-container" style="max-height:260px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; font-size:12px;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th>#</th>
              <th>الصنف</th>
              <th style="width:70px;">الوحدة</th>
              <th style="text-align:center;">المحمّل</th>
              <th style="text-align:center; color:#10B981;">المرتجع</th>
              <th style="text-align:center; color:#EF4444;">التالف</th>
              <th style="text-align:center; color:var(--brand);">المباع</th>
              <th style="text-align:left;">إجمالي البيع</th>
            </tr>
          </thead>
          <tbody>
            ${n.map((o,d)=>`
              <tr style="border-bottom:1px solid var(--border-soft);">
                <td style="color:var(--text-2); text-align:center;">${d+1}</td>
                <td class="font-bold">${o.productName}</td>
                <td style="color:var(--text-2);">${o.unit}</td>
                <td style="text-align:center;" class="mono font-bold">${o.qty}</td>
                <td style="text-align:center;" class="mono font-bold text-good">${o.returnedQty||0}</td>
                <td style="text-align:center;" class="mono font-bold text-bad">${o.damagedQty||0}</td>
                <td style="text-align:center;" class="mono font-bold" style="color:var(--brand);">${o.soldQty!==void 0?o.soldQty:o.qty}</td>
                <td style="text-align:left;" class="mono font-bold text-good">${x(o.soldAmount!==void 0?o.soldAmount:o.qty*o.sellingPrice)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Linked Accounting Entries -->
    <div class="card" style="padding:12px 16px; background:var(--bg-2); border-radius:10px; border:1px solid var(--border-soft); font-size:12px;">
      <div style="font-weight:800; margin-bottom:6px; color:var(--text-0);">📑 القيود المحاسبية التلقائية المرتبطة:</div>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div>إذن التحميل الصباحي: <b class="mono" style="color:var(--brand);">${t.journalEntryId?"JE-"+t.dispatchNumber:"—"}</b></div>
        <div>تسوية المرتجع: <b class="mono text-good">${t.returnJEId?"JE-RET-"+t.dispatchNumber:"—"}</b></div>
        <div>تسوية التوالف: <b class="mono text-bad">${t.damageJEId?"JE-DAM-"+t.dispatchNumber:"—"}</b></div>
      </div>
    </div>
  `,window.openModal("recon-view-modal")};window.closeReconViewModal=()=>{window.closeModal("recon-view-modal")};window.printCurrentReconciliation=()=>{window._currentViewingRecon&&window.printReconciliation(window._currentViewingRecon.id)};window.printDispatch=e=>{const t=_.find(n=>n.id===e);if(!t)return;const a=window.open("","_blank");a.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>إذن تحميل سيارة ${t.dispatchNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #111; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .meta-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 6px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #777; padding: 7px 10px; text-align: right; }
          th { background: #f2f2f2; font-weight: bold; }
          .mono { font-family: monospace; font-weight: bold; }
          .totals { margin-top: 14px; text-align: left; font-size: 13.5px; font-weight: bold; }
          .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0 0 4px;">شركة إدهام للمواد الغذائية</h2>
          <h3 style="margin:0 0 6px; color:#059669;">إذن صرف وتحميل بضاعة لسيارة توزيع (Morning Dispatch)</h3>
          <p style="margin:0; font-size:12.5px; color:#555;">رقم الإذن: <b class="mono">${t.dispatchNumber}</b> | التاريخ: <b class="mono">${t.date}</b></p>
        </div>

        <div class="meta-grid">
          <div class="meta-box"><b>المستودع المصدر:</b> ${t.warehouseName}</div>
          <div class="meta-box"><b>مخزن السيارة المستلم:</b> ${t.destWarehouseName||"مخزن سيارة المندوب"}</div>
          <div class="meta-box"><b>المندوب المسؤول:</b> ${t.repName}</div>
          <div class="meta-box"><b>المركبة / اللوحة:</b> ${t.vehiclePlate||"—"}</div>
          ${t.route?`<div class="meta-box" style="grid-column: span 2;"><b>خط السير المستهدف:</b> ${t.route}</div>`:""}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">#</th>
              <th>اسم الصنف</th>
              <th style="width:80px;">الوحدة</th>
              <th style="width:90px; text-align:center;">الكمية المسلمة</th>
              <th style="width:110px; text-align:left;">سعر البيع</th>
              <th style="width:120px; text-align:left;">إجمالي القيمة</th>
            </tr>
          </thead>
          <tbody>
            ${(t.lines||[]).map((n,o)=>`
              <tr>
                <td style="text-align:center;">${o+1}</td>
                <td><b>${n.productName}</b></td>
                <td>${n.unit}</td>
                <td style="text-align:center;" class="mono">${n.qty}</td>
                <td style="text-align:left;" class="mono">${x(n.sellingPrice)}</td>
                <td style="text-align:left;" class="mono">${x(n.qty*n.sellingPrice)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <span>إجمالي الأصناف: <b class="mono">${(t.lines||[]).length}</b></span>
          <span style="margin:0 15px;">|</span>
          <span>إجمالي الكراتين المحملة: <b class="mono">${t.totalQty}</b></span>
          <span style="margin:0 15px;">|</span>
          <span>إجمالي قيمة البضاعة: <b class="mono">${x(t.totalValue)}</b></span>
        </div>

        <div class="signatures">
          <div>
            <div>توقيع أمين المستودع (المسلّم):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع مسؤول الحركة / الرقابة:</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المندوب (المستلم للعهدة):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
        </div>
      </body>
    </html>
  `),a.document.close(),setTimeout(()=>a.print(),300)};window.printReconciliation=e=>{const t=_.find(o=>o.id===e);if(!t)return;const a=t.reconLines||t.lines||[],n=window.open("","_blank");n.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير تسوية وجرد سيارة ${t.dispatchNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #111; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .meta-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 6px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #777; padding: 6px 8px; text-align: right; }
          th { background: #f2f2f2; font-weight: bold; }
          .mono { font-family: monospace; font-weight: bold; }
          .totals { margin-top: 14px; text-align: left; font-size: 13px; font-weight: bold; }
          .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0 0 4px;">شركة إدهام للمواد الغذائية</h2>
          <h3 style="margin:0 0 6px; color:#4F46E5;">تقرير جرد وتسوية متبقي وتوالف سيارة التوزيع (Evening Reconciliation)</h3>
          <p style="margin:0; font-size:12.5px; color:#555;">إذن التحميل: <b class="mono">${t.dispatchNumber}</b> | التاريخ: <b class="mono">${t.date}</b></p>
        </div>

        <div class="meta-grid">
          <div class="meta-box"><b>المندوب:</b> ${t.repName}</div>
          <div class="meta-box"><b>لوحة الشاحنة:</b> ${t.vehiclePlate||"—"}</div>
          <div class="meta-box"><b>المستودع المصدر:</b> ${t.warehouseName}</div>
          <div class="meta-box"><b>مخزن السيارة:</b> ${t.destWarehouseName||"مخزن السيارة"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:25px; text-align:center;">#</th>
              <th>اسم الصنف</th>
              <th style="width:65px;">الوحدة</th>
              <th style="width:75px; text-align:center;">المحمّل</th>
              <th style="width:80px; text-align:center;">المرتجع للمستودع</th>
              <th style="width:70px; text-align:center;">التوالف</th>
              <th style="width:75px; text-align:center;">المباع</th>
              <th style="width:90px; text-align:left;">سعر البيع</th>
              <th style="width:110px; text-align:left;">إجمالي المباع</th>
            </tr>
          </thead>
          <tbody>
            ${a.map((o,d)=>`
              <tr>
                <td style="text-align:center;">${d+1}</td>
                <td><b>${o.productName}</b></td>
                <td>${o.unit}</td>
                <td style="text-align:center;" class="mono">${o.qty}</td>
                <td style="text-align:center;" class="mono">${o.returnedQty||0}</td>
                <td style="text-align:center;" class="mono">${o.damagedQty||0}</td>
                <td style="text-align:center;" class="mono"><b>${o.soldQty!==void 0?o.soldQty:o.qty}</b></td>
                <td style="text-align:left;" class="mono">${x(o.sellingPrice)}</td>
                <td style="text-align:left;" class="mono"><b>${x(o.soldAmount!==void 0?o.soldAmount:o.qty*o.sellingPrice)}</b></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <span>المحمّل: <b class="mono">${t.totalQty}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>المرتجع: <b class="mono" style="color:#059669;">${t.totalReturnedQty||0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>التوالف: <b class="mono" style="color:#dc2626;">${t.totalDamagedQty||0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>المباع: <b class="mono">${t.totalSoldQty||0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>إجمالي المبيعات: <b class="mono">${x(t.totalSalesVal||0)}</b></span>
        </div>

        <div class="signatures">
          <div>
            <div>توقيع أمين المستودع (المستلم للمرتجع):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المحاسب المالي (المطابق للقيود):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المندوب:</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
        </div>
      </body>
    </html>
  `),n.document.close(),setTimeout(()=>n.print(),300)};export{ct as render};
