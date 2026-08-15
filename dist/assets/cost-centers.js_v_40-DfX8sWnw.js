const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{g as f,C as u,f as r,u as x,n as P,r as W,_ as j}from"./index-HrCilPJ3.js";import{orderBy as B}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{s as D}from"./coa-connector-Bwq94sQ7.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[],w=[],L=[],q=[],V=[],O=[],C="dashboard",$="",F="";const N=()=>new Date().toISOString().slice(0,10),M=()=>{const e=new Date;return e.setMonth(e.getMonth()-1),e.toISOString().slice(0,10)};async function lt(e,t){e.innerHTML=X(),await k(),switchTab("dashboard")}function X(){return`
  <!-- Filter Bar -->
  <div class="filterbar no-print">
    <div class="date-range-group">
      <label>من</label>
      <input type="date" id="cc-from" class="input" value="${M()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div class="date-range-group">
      <label>إلى</label>
      <input type="date" id="cc-to" class="input" value="${N()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div style="margin-right:auto; display:flex; gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="ccExportPDF()">📄 تصدير PDF</button>
      <button class="btn btn-primary" onclick="openCCModal()">＋ مركز تكلفة جديد</button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div style="display:flex; gap:4px; padding:12px 20px 0; border-bottom:1px solid var(--border-soft); background:var(--bg-1); flex-wrap:wrap;">
    ${h("dashboard","📊","لوحة التحكم")}
    ${h("vehicles","🚐","السيارات والمخازن")}
    ${h("profit","💰","تقرير الربحية")}
    ${h("compare","📈","مقارنة الأداء")}
    ${h("inventory","📦","حركة المخزون")}
    ${h("allocation","⚖️","توزيع المصاريف")}
    ${h("breakeven","⚡","نقطة التعادل")}
    ${h("manage","⚙️","إدارة مراكز التكلفة")}
  </div>

  <!-- Tab Content -->
  <div id="cc-tab-content" class="page-content" style="padding:20px;">
    <div class="page-loading"><div class="loading-spinner"></div></div>
  </div>

  <!-- Cost Center Modal -->
  <div class="modal-overlay" id="cc-modal">
    <div class="modal" style="max-width:560px;">
      <div class="modal-header">
        <h3 class="modal-title" id="cc-modal-title">➕ مركز تكلفة جديد</h3>
        <button class="modal-close" onclick="closeModal('cc-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:24px;">
        <input type="hidden" id="cc-edit-id">
        <div class="form-group mb-12">
          <label>كود مركز التكلفة <span class="req">*</span></label>
          <input type="text" id="cc-code" class="input mono" placeholder="CC-VEH-001">
        </div>
        <div class="form-group mb-12">
          <label>الاسم <span class="req">*</span></label>
          <input type="text" id="cc-name" class="input" placeholder="سيارة أحمد — خط الرياض">
        </div>
        <div class="form-group mb-12">
          <label>النوع</label>
          <select id="cc-type" class="input" onchange="ccTypeToggle()">
            <option value="vehicle">🚐 سيارة توزيع</option>
            <option value="warehouse">🏭 مخزن</option>
            <option value="department">🏢 قسم إداري</option>
            <option value="general">📌 عام</option>
          </select>
        </div>
        <div id="cc-vehicle-fields">
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>اسم السائق</label>
              <input type="text" id="cc-driver" class="input" placeholder="أحمد محمد">
            </div>
            <div class="form-group">
              <label>رقم اللوحة</label>
              <input type="text" id="cc-plate" class="input mono" placeholder="ب ج د 1234">
            </div>
          </div>
          <div class="form-group mb-12">
            <label>رقم/اسم السيارة</label>
            <input type="text" id="cc-vehicle-id" class="input" placeholder="ديانا — VAN-001">
          </div>
          <div class="form-group mb-12">
            <label>إنشاء مخزن سيارة تلقائياً</label>
            <label class="checkbox-label">
              <input type="checkbox" id="cc-auto-warehouse" checked>
              <span>إنشاء مخزن سيارة مرتبط تلقائياً عند الحفظ</span>
            </label>
          </div>
        </div>
        <div class="form-group mb-12">
          <label>المصروفات الثابتة الشهرية (ر.س)</label>
          <input type="number" id="cc-fixed-cost" class="input mono" placeholder="0" min="0">
        </div>
        <div class="form-group mb-12">
          <label>نسبة التوزيع من المصاريف غير المباشرة (%)</label>
          <input type="number" id="cc-alloc-pct" class="input mono" placeholder="تلقائي (حسب المبيعات)" min="0" max="100">
        </div>
        <div class="form-group">
          <label>ملاحظات</label>
          <input type="text" id="cc-notes" class="input" placeholder="أي معلومات إضافية">
        </div>
        <div id="cc-modal-err" class="alert bad hidden mt-12"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('cc-modal')">إلغاء</button>
        <button class="btn btn-primary" id="cc-save-btn" onclick="saveCostCenter()">💾 حفظ</button>
      </div>
    </div>
  </div>`}function h(e,t,s){return`<button class="tab-btn" id="tab-btn-${e}" onclick="switchTab('${e}')"
    style="padding:8px 14px; border:none; background:transparent; cursor:pointer;
    font-size:13px; color:var(--text-2); border-bottom:2px solid transparent;
    display:flex; align-items:center; gap:6px; white-space:nowrap;">
    <span>${t}</span><span>${s}</span>
  </button>`}async function k(){const[e,t]=await Promise.all([f(u.costCenters()).catch(()=>[]),f(u.warehouses(),[B("name")]).catch(()=>[])]);b=e.sort((d,i)=>(d.code||"").localeCompare(i.code||"")),w=t,$=document.getElementById("cc-from")?.value||M(),F=document.getElementById("cc-to")?.value||N();const[s,a,n,l]=await Promise.all([f(u.expenses(),[B("date","desc")]).catch(()=>[]),f(u.salesInvoices(),[B("date","desc")]).catch(()=>[]),f(u.stockTransactions(),[B("date","desc")]).catch(()=>[]),f(u.products()).catch(()=>[])]);L=s,q=a,V=n,O=l}function T(e){return e?e>=$&&e<=F:!0}function K(){const e={};return w.forEach(t=>{t.costCenterId&&(e[t.id]=t.costCenterId)}),e}function g(){const e=K(),t={};O.forEach(o=>{t[o.id]=parseFloat(o.costPrice||o.purchasePrice||0)});const s={},a={};q.filter(o=>T(o.date)&&o.status!=="cancelled").forEach(o=>{const c=o.costCenterId||o.warehouseId&&e[o.warehouseId]||"NONE";s[c]=(s[c]||0)+(parseFloat(o.total)||0);let p=0;(o.items||o.lines||[]).forEach(v=>{const m=parseFloat(v.qty||v.quantity||0),y=parseFloat(v.costPrice||v.purchasePrice||t[v.productId||v.id]||0);p+=m*y}),a[c]=(a[c]||0)+p});const n={};L.filter(o=>T(o.date)).forEach(o=>{const c=o.costCenterId||"NONE";n[c]=(n[c]||0)+(parseFloat(o.amount)||0)});const l={},d={},i={};return V.filter(o=>T(o.date)).forEach(o=>{const c=o.warehouseId||o.toWarehouseId||o.fromWarehouseId,p=c&&e[c]||o.costCenterId||"NONE";o.type==="transfer_in"&&(l[p]=(l[p]||0)+(parseFloat(o.quantity)||0)),o.type==="sale"&&(d[p]=(d[p]||0)+(parseFloat(o.quantity)||0)),o.type==="transfer_out"&&(i[p]=(i[p]||0)+(parseFloat(o.quantity)||0))}),b.map(o=>{const c=s[o.id]||0,p=a[o.id]||0,v=n[o.id]||0,m=parseFloat(o.fixedCost||0);return{cc:o,sales:c,cogs:p,grossProfit:c-p,expenses:v,fixed:m,profit:c-p-v-m,loaded:l[o.id]||0,sold:d[o.id]||0,returned:i[o.id]||0,waste:Math.max(0,(l[o.id]||0)-(d[o.id]||0)-(i[o.id]||0))}})}window.switchTab=e=>{C=e,document.querySelectorAll(".tab-btn").forEach(s=>{s.style.borderBottomColor="transparent",s.style.color="var(--text-2)",s.style.fontWeight="400"});const t=document.getElementById(`tab-btn-${e}`);t&&(t.style.borderBottomColor="var(--primary)",t.style.color="var(--primary)",t.style.fontWeight="700"),I(e)};window.ccRefresh=async()=>{$=document.getElementById("cc-from")?.value||M(),F=document.getElementById("cc-to")?.value||N(),await k(),I(C)};function I(e){const t=document.getElementById("cc-tab-content");if(t)switch(e){case"dashboard":t.innerHTML=_();break;case"vehicles":t.innerHTML=G();break;case"profit":t.innerHTML=U();break;case"compare":t.innerHTML=J();break;case"inventory":t.innerHTML=Q();break;case"allocation":t.innerHTML=Y();break;case"breakeven":t.innerHTML=Z();break;case"manage":t.innerHTML=tt();break;default:t.innerHTML=_()}}function _(){const e=g();if(e.length===0)return`<div class="alert info" style="margin:40px auto; max-width:500px; text-align:center;">
      <p style="font-size:18px; margin-bottom:12px;">🏁 لا توجد مراكز تكلفة بعد</p>
      <p>اضغط <strong>"مركز تكلفة جديد"</strong> لإضافة سيارة أو مخزن كمركز تكلفة</p>
    </div>`;const t=e.reduce((i,o)=>i+o.sales,0),s=e.reduce((i,o)=>i+o.cogs,0),a=e.reduce((i,o)=>i+o.expenses+o.fixed,0),n=t-s-a,l=e.reduce((i,o)=>i+o.waste,0),d=e.map(({cc:i,sales:o,cogs:c,expenses:p,fixed:v,profit:m,waste:y,loaded:E,sold:et})=>{const S=w.find(A=>A.costCenterId===i.id&&A.type==="Vehicle"),H=o>0?(m/o*100).toFixed(1):"0.0",R=E>0?(y/E*100).toFixed(1):"0.0",z=m>=0?"#10b981":"#ef4444";return`
    <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:14px; padding:18px; position:relative; overflow:hidden;">
      <div style="position:absolute; top:0; right:0; width:4px; height:100%; background:${z};"></div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <div style="font-size:15px; font-weight:700; color:var(--text-0);">${i.type==="vehicle"?"🚐":"🏭"} ${i.name}</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
            ${i.driverName?`👤 ${i.driverName}`:""}
            ${i.plateNumber?` • ${i.plateNumber}`:""}
            ${S?` • مخزن: ${S.name}`:""}
          </div>
        </div>
        <span class="mono" style="font-size:10px; background:var(--bg-3); padding:3px 8px; border-radius:20px; color:var(--text-2);">${i.code}</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:10px;">
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المبيعات</div>
          <div style="font-size:12px; font-weight:700; color:var(--text-0); margin-top:2px;">${r(o)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">التكلفة</div>
          <div style="font-size:12px; font-weight:700; color:#8b5cf6; margin-top:2px;">${r(c)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المصاريف</div>
          <div style="font-size:12px; font-weight:700; color:#f59e0b; margin-top:2px;">${r(p+v)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">الربح</div>
          <div style="font-size:12px; font-weight:700; color:${z}; margin-top:2px;">${r(m)}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11px; background:${z}22; color:${z}; padding:3px 10px; border-radius:20px; font-weight:600;">
          هامش ${H}%
        </span>
        ${y>0?`<span style="font-size:11px; background:#ef444422; color:#ef4444; padding:3px 10px; border-radius:20px;">⚠️ فاقد ${R}%</span>`:""}
        <span style="font-size:11px; background:var(--bg-3); color:var(--text-2); padding:3px 10px; border-radius:20px; margin-right:auto; cursor:pointer;"
          onclick="switchTab('profit')">تفاصيل →</span>
      </div>
    </div>`}).join("");return`
  <!-- KPI Strip -->
  <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px;">
    <div class="kpi-card sales">
      <div class="kpi-label">إجمالي المبيعات</div>
      <div class="kpi-value">${r(t)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #8b5cf6;">
      <div class="kpi-label">تكلفة البضاعة المباعة</div>
      <div class="kpi-value" style="color:#8b5cf6;">${r(s)}</div>
    </div>
    <div class="kpi-card purchases">
      <div class="kpi-label">إجمالي المصاريف</div>
      <div class="kpi-value">${r(a)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid ${n>=0?"#10b981":"#ef4444"};">
      <div class="kpi-label">صافي الربح</div>
      <div class="kpi-value" style="color:${n>=0?"#10b981":"#ef4444"};">${r(n)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #f59e0b;">
      <div class="kpi-label">إجمالي الفاقد (وحدة)</div>
      <div class="kpi-value" style="color:#f59e0b;">${l.toLocaleString()}</div>
    </div>
  </div>

  <!-- CC Cards -->
  <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px;">
    ${d||'<div class="alert info">لا توجد بيانات في هذه الفترة</div>'}
  </div>`}function G(){const e=b.filter(a=>a.type==="vehicle"),t=w.filter(a=>a.type==="Vehicle");return e.length===0&&t.length===0?`<div class="alert info" style="margin:40px auto;max-width:500px;text-align:center;">
      <p style="font-size:18px;margin-bottom:12px;">🚐 لا توجد سيارات مسجلة</p>
      <p>اضغط <strong>"مركز تكلفة جديد"</strong> واختر نوع "سيارة توزيع" لإضافة سيارتك الأولى</p>
      <button class="btn btn-primary mt-12" onclick="openCCModal()">＋ إضافة سيارة</button>
    </div>`:`
  <div class="card mb-16">
    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
      <h3>🚐 سيارات التوزيع كمراكز تكلفة</h3>
      <button class="btn btn-primary btn-sm" onclick="openCCModal()">＋ إضافة سيارة</button>
    </div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr>
          <th>الكود</th><th>الاسم</th><th>السائق</th><th>اللوحة</th><th>رقم السيارة</th>
          <th>المخزن المرتبط</th><th>التكلفة الثابتة</th><th>إجراءات</th>
        </tr></thead>
        <tbody>${e.map(a=>{const n=w.find(l=>l.costCenterId===a.id&&l.type==="Vehicle");return`<tr>
      <td><span class="mono" style="color:var(--primary);">${a.code}</span></td>
      <td style="font-weight:600;">🚐 ${a.name}</td>
      <td>${a.driverName||"—"}</td>
      <td class="mono">${a.plateNumber||"—"}</td>
      <td>${a.vehicleId||"—"}</td>
      <td>${n?`<span style="color:#10b981;">✅ ${n.name}</span>`:`<span style="color:#f59e0b;">⚠️ لا يوجد <button class="btn btn-sm btn-secondary" onclick="createVehicleWarehouse('${a.id}')">إنشاء</button></span>`}</td>
      <td>${r(a.fixedCost||0)}/شهر</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${a.id}')">✏️</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;" onclick="deleteCostCenter('${a.id}','${a.name}')">🗑️</button>
      </td>
    </tr>`}).join("")||'<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد سيارات</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3>🔄 سندات التحميل والإرجاع</h3></div>
    <div class="card-body" style="padding:16px;">
      <p style="color:var(--text-2);margin-bottom:12px;">لتحميل بضاعة على سيارة أو إرجاعها، استخدم شاشة <strong>تحويل المخزون</strong>:</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid var(--border-soft);">
          <div style="font-size:20px;margin-bottom:6px;">📤</div>
          <div style="font-weight:700;margin-bottom:4px;">تحميل للسيارة</div>
          <div style="font-size:12px;color:var(--text-2);">من: المخزن الرئيسي → إلى: مخزن السيارة</div>
          <a href="#stock-transfer" style="display:block;margin-top:8px;font-size:12px;color:var(--primary);">فتح تحويل المخزون ←</a>
        </div>
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid var(--border-soft);">
          <div style="font-size:20px;margin-bottom:6px;">📥</div>
          <div style="font-weight:700;margin-bottom:4px;">جرد راجع من السيارة</div>
          <div style="font-size:12px;color:var(--text-2);">من: مخزن السيارة → إلى: المخزن الرئيسي</div>
          <a href="#stock-transfer" style="display:block;margin-top:8px;font-size:12px;color:var(--primary);">فتح تحويل المخزون ←</a>
        </div>
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid #ef444433;">
          <div style="font-size:20px;margin-bottom:6px;">⚠️</div>
          <div style="font-weight:700;margin-bottom:4px;">تسجيل فاقد/تالف</div>
          <div style="font-size:12px;color:var(--text-2);">البضاعة المحمّلة - المباعة - المرتجعة = الفاقد</div>
          <button class="btn btn-sm" style="margin-top:8px;background:#ef444422;color:#ef4444;" onclick="switchTab('inventory')">عرض تقرير الفاقد</button>
        </div>
      </div>
    </div>
  </div>`}function U(){const e=g(),t=e.map(({cc:a,sales:n,cogs:l,grossProfit:d,expenses:i,fixed:o,profit:c})=>{const p=n>0?(c/n*100).toFixed(1):"—",v=c>=0?"color:#10b981;":"color:#ef4444;";return`<tr>
      <td><span class="mono" style="color:var(--primary);">${a.code}</span></td>
      <td style="font-weight:600;">${a.type==="vehicle"?"🚐":"🏭"} ${a.name}</td>
      <td>${a.driverName||"—"}</td>
      <td class="mono">${r(n)}</td>
      <td class="mono" style="color:#8b5cf6;">${r(l)}</td>
      <td class="mono font-bold" style="color:#10b981;">${r(d)}</td>
      <td class="mono" style="color:#f59e0b;">${r(i)}</td>
      <td class="mono" style="color:#a855f7;">${r(o)}</td>
      <td class="mono font-bold" style="${v}">${r(c)}</td>
      <td><span style="font-size:12px;padding:3px 10px;border-radius:20px;${v}background:${c>=0?"#10b98122":"#ef444422"};font-weight:700;">${p}%</span></td>
    </tr>`}).join(""),s=e.reduce((a,n)=>({sales:a.sales+n.sales,cogs:a.cogs+n.cogs,gp:a.gp+n.grossProfit,exp:a.exp+n.expenses,fixed:a.fixed+n.fixed,profit:a.profit+n.profit}),{sales:0,cogs:0,gp:0,exp:0,fixed:0,profit:0});return`
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:18px;font-weight:700;">💰 تقرير ربحية مراكز التكلفة التفصيلي</h2>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="ccExportPDF()">📄 PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="ccExportExcel()">📊 Excel</button>
    </div>
  </div>
  <div class="table-container">
    <table class="data-dense" id="profit-table">
      <thead><tr>
        <th>الكود</th><th>مركز التكلفة</th><th>المسؤول</th>
        <th>المبيعات</th><th>تكلفة البضاعة (COGS)</th><th>مجمل الربح</th>
        <th>المصاريف المباشرة</th><th>التكلفة الثابتة</th><th>صافي الربح</th><th>هامش الربح</th>
      </tr></thead>
      <tbody>
        ${t||'<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد بيانات في هذه الفترة</td></tr>'}
      </tbody>
      <tfoot>
        <tr style="background:var(--bg-3);font-weight:700;">
          <td colspan="3" style="padding:10px;">الإجمالي</td>
          <td class="mono">${r(s.sales)}</td>
          <td class="mono" style="color:#8b5cf6;">${r(s.cogs)}</td>
          <td class="mono" style="color:#10b981;">${r(s.gp)}</td>
          <td class="mono" style="color:#f59e0b;">${r(s.exp)}</td>
          <td class="mono" style="color:#a855f7;">${r(s.fixed)}</td>
          <td class="mono font-bold" style="${s.profit>=0?"color:#10b981":"color:#ef4444"}">${r(s.profit)}</td>
          <td>—</td>
        </tr>
      </tfoot>
    </table>
  </div>`}function J(){const e=g().sort((n,l)=>l.profit-n.profit);if(e.length===0)return'<div class="alert info">لا توجد بيانات</div>';const t=Math.max(...e.map(n=>n.sales),1),s=Math.max(...e.map(n=>Math.abs(n.profit)),1);return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">📈 مقارنة أداء مراكز التكلفة</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;">
    ${e.map(({cc:n,sales:l,profit:d,waste:i})=>{const o=Math.round(l/t*100),c=Math.round(Math.abs(d)/s*100),p=d>=0?"#10b981":"#ef4444";return`
    <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-weight:700;">${n.type==="vehicle"?"🚐":"🏭"} ${n.name}</span>
        <span style="font-size:11px;color:var(--text-2);">${n.driverName||n.code}</span>
      </div>
      <div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>المبيعات</span><span>${r(l)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${o}%;height:100%;background:var(--primary);border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      <div style="margin-bottom:4px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>الربح / الخسارة</span><span style="color:${p};font-weight:700;">${r(d)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${c}%;height:100%;background:${p};border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      ${i>0?`<div style="font-size:11px;color:#ef4444;margin-top:4px;">⚠️ فاقد: ${i.toLocaleString()} وحدة</div>`:""}
    </div>`}).join("")}
  </div>`}function Q(){return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">📦 حركة المخزون لكل سيارة</h2>
  <div class="alert info mb-16" style="font-size:12px;">
    الفاقد = البضاعة المحمّلة − المباعة − المرتجعة. نسبة فاقد أكثر من 5% تستوجب المراجعة.
  </div>
  <div class="table-container">
    <table class="data-dense" id="inventory-table">
      <thead><tr>
        <th>الكود</th><th>السيارة</th><th>السائق</th>
        <th>المحمّل (وحدة)</th><th>المباع</th><th>المرتجع</th>
        <th>الفاقد</th><th>نسبة الفاقد</th>
      </tr></thead>
      <tbody>${g().filter(s=>s.cc.type==="vehicle"||s.loaded>0).map(({cc:s,loaded:a,sold:n,returned:l,waste:d})=>{const i=a>0?(d/a*100).toFixed(1):"0.0",o=parseFloat(i)>5?"#ef4444":parseFloat(i)>2?"#f59e0b":"#10b981";return`<tr>
      <td><span class="mono">${s.code}</span></td>
      <td style="font-weight:600;">🚐 ${s.name}</td>
      <td>${s.driverName||"—"}</td>
      <td class="mono">${a.toLocaleString()}</td>
      <td class="mono" style="color:#10b981;">${n.toLocaleString()}</td>
      <td class="mono" style="color:#8b5cf6;">${l.toLocaleString()}</td>
      <td class="mono" style="color:${o};font-weight:700;">${d.toLocaleString()}</td>
      <td><span style="padding:3px 10px;border-radius:20px;background:${o}22;color:${o};font-weight:700;">${i}%</span></td>
    </tr>`}).join("")||'<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد حركات مخزنية لسيارات في هذه الفترة</td></tr>'}</tbody>
    </table>
  </div>`}function Y(){const e=L.filter(d=>T(d.date)&&!d.costCenterId),t=e.reduce((d,i)=>d+(parseFloat(i.amount)||0),0),s=b.filter(d=>d.type==="vehicle"),a=g(),n=a.reduce((d,i)=>d+i.sales,0),l=s.map(d=>{const i=a.find(m=>m.cc.id===d.id)||{},o=n>0?(i.sales||0)/n:1/(s.length||1),p=(d.allocPct?parseFloat(d.allocPct)/100:null)??o,v=t*p;return`<tr>
      <td style="font-weight:600;">🚐 ${d.name}</td>
      <td class="mono">${r(i.sales||0)}</td>
      <td class="mono">${(o*100).toFixed(1)}%</td>
      <td><input type="number" class="input mono" style="width:80px;height:28px;padding:2px 6px;font-size:12px;"
        value="${d.allocPct||""}" placeholder="تلقائي" min="0" max="100"
        onchange="updateAllocPct('${d.id}', this.value)" /></td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${r(v)}</td>
    </tr>`}).join("");return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">⚖️ تقرير المصاريف الموزّعة</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
    <div class="kpi-card">
      <div class="kpi-label">المصاريف غير المباشرة (بدون مركز تكلفة)</div>
      <div class="kpi-value" style="color:#8b5cf6;">${r(t)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">${e.length} مصروف</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">أسلوب التوزيع الافتراضي</div>
      <div style="font-size:14px;font-weight:700;margin-top:8px;">حسب حجم المبيعات لكل سيارة</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:2px;">يمكنك تحديد نسبة يدوية في الجدول</div>
    </div>
  </div>
  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>مركز التكلفة</th><th>المبيعات</th><th>الحصة حسب المبيعات</th>
        <th>نسبة يدوية %</th><th>المبلغ الموزّع</th>
      </tr></thead>
      <tbody>${l||'<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد سيارات مسجلة</td></tr>'}</tbody>
    </table>
  </div>
  <div class="alert info mt-12" style="font-size:12px;">
    💡 لإضافة مصروف على مركز تكلفة مباشرة، افتح شاشة <strong>المصروفات</strong> واختر مركز التكلفة من القائمة.
  </div>`}function Z(){return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;">⚡ تقرير نقطة التعادل (Break-even Analysis)</h2>
  <div class="alert info mb-16" style="font-size:12px;">
    نقطة التعادل = التكاليف الثابتة ÷ هامش المساهمة (1 − نسبة التكاليف المتغيرة للمبيعات)
  </div>
  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>السيارة</th><th>التكاليف الثابتة</th><th>نسبة التكاليف المتغيرة</th>
        <th>نقطة التعادل</th><th>المبيعات الفعلية</th><th>الفجوة</th><th>الحالة</th>
      </tr></thead>
      <tbody>${g().map(({cc:s,sales:a,expenses:n,fixed:l})=>{const d=l,i=a>0?(n/a).toFixed(3):0,o=1-parseFloat(i),c=o>0?d/o:null,p=c!==null?r(c):"—",v=c!==null?a-c:null,m=v!==null?r(Math.abs(v)):"—",y=v===null?"":v>=0?"color:#10b981;":"color:#ef4444;",E=v===null?"—":v>=0?"✅ فوق نقطة التعادل":"❌ أقل من نقطة التعادل";return`<tr>
      <td style="font-weight:600;">🚐 ${s.name}</td>
      <td class="mono">${r(d)}</td>
      <td class="mono">${(parseFloat(i)*100).toFixed(1)}%</td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${p}</td>
      <td class="mono">${r(a)}</td>
      <td class="mono" style="${y}font-weight:700;">${m}</td>
      <td style="${y}font-size:12px;">${E}</td>
    </tr>`}).join("")||'<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد بيانات</td></tr>'}</tbody>
    </table>
  </div>`}function tt(){return`
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:18px;font-weight:700;">⚙️ إدارة مراكز التكلفة</h2>
    <button class="btn btn-primary" onclick="openCCModal()">＋ مركز تكلفة جديد</button>
  </div>
  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>الكود</th><th>الاسم</th><th>المسؤول</th><th>اللوحة</th>
        <th>المخزن المرتبط</th><th>التكلفة الثابتة/شهر</th><th>الحالة</th><th>إجراءات</th>
      </tr></thead>
      <tbody>${b.map(t=>{const s=w.find(n=>n.costCenterId===t.id),a={vehicle:"🚐 سيارة",warehouse:"🏭 مخزن",department:"🏢 قسم",general:"📌 عام"};return`<tr>
      <td><span class="mono" style="color:var(--primary);">${t.code}</span></td>
      <td style="font-weight:600;">${a[t.type]||t.type} ${t.name}</td>
      <td>${t.driverName||"—"}</td>
      <td class="mono">${t.plateNumber||"—"}</td>
      <td>${s?`<span style="color:#10b981;font-size:12px;">✅ ${s.name}</span>`:"—"}</td>
      <td class="mono">${r(t.fixedCost||0)}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${t.isActive!==!1?"#10b98122":"#ef444422"};color:${t.isActive!==!1?"#10b981":"#ef4444"};">${t.isActive!==!1?"نشط":"معطل"}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${t.id}')">✏️ تعديل</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;margin-right:4px;" onclick="deleteCostCenter('${t.id}','${t.name}')">🗑️</button>
      </td>
    </tr>`}).join("")||'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد مراكز تكلفة مسجلة</td></tr>'}</tbody>
    </table>
  </div>`}window.openCCModal=(e=null)=>{const t=e?b.find(s=>s.id===e):null;document.getElementById("cc-edit-id").value=t?.id||"",document.getElementById("cc-modal-title").textContent=t?"✏️ تعديل مركز تكلفة":"➕ مركز تكلفة جديد",document.getElementById("cc-code").value=t?.code||"",document.getElementById("cc-name").value=t?.name||"",document.getElementById("cc-type").value=t?.type||"vehicle",document.getElementById("cc-driver").value=t?.driverName||"",document.getElementById("cc-plate").value=t?.plateNumber||"",document.getElementById("cc-vehicle-id").value=t?.vehicleId||"",document.getElementById("cc-fixed-cost").value=t?.fixedCost||"",document.getElementById("cc-alloc-pct").value=t?.allocPct||"",document.getElementById("cc-notes").value=t?.notes||"",document.getElementById("cc-auto-warehouse").checked=!0,document.getElementById("cc-modal-err").classList.add("hidden"),ccTypeToggle(),openModal("cc-modal")};window.ccTypeToggle=()=>{const e=document.getElementById("cc-type")?.value,t=document.getElementById("cc-vehicle-fields");t&&(t.style.display=e==="vehicle"?"block":"none")};window.saveCostCenter=async()=>{const e=document.getElementById("cc-modal-err");e.classList.add("hidden");const t=document.getElementById("cc-edit-id").value,s=document.getElementById("cc-code").value.trim().toUpperCase(),a=document.getElementById("cc-name").value.trim(),n=document.getElementById("cc-type").value;if(!s){e.textContent="يرجى إدخال كود مركز التكلفة",e.classList.remove("hidden");return}if(!a){e.textContent="يرجى إدخال اسم مركز التكلفة",e.classList.remove("hidden");return}const l={code:s,name:a,type:n,driverName:document.getElementById("cc-driver").value.trim(),plateNumber:document.getElementById("cc-plate").value.trim(),vehicleId:document.getElementById("cc-vehicle-id").value.trim(),fixedCost:parseFloat(document.getElementById("cc-fixed-cost").value)||0,allocPct:parseFloat(document.getElementById("cc-alloc-pct").value)||null,notes:document.getElementById("cc-notes").value.trim(),isActive:!0},d=document.getElementById("cc-save-btn");d.disabled=!0,d.textContent="جارٍ الحفظ…";try{let i=t;if(t)await x("costCenters",t,l),showToast("✅ تم تحديث مركز التكلفة","success");else if(i=await P(u.costCenters(),l),showToast("✅ تم إنشاء مركز التكلفة","success"),n==="vehicle"&&document.getElementById("cc-auto-warehouse").checked){const o={barcodePrefix:s,name:`مخزن سيارة — ${a}`,type:"Vehicle",storageTemperature:"ambient",isActive:!0,manager:l.driverName,costCenterId:i,driverName:l.driverName,plateNumber:l.plateNumber,notes:"مخزن سيارة توزيع — تم إنشاؤه تلقائياً",allowNegative:!1,requireBatch:!1,requireExpiry:!1,requireSerial:!1},c=await P(u.warehouses(),o);try{const p=await D("warehouses",c,o.name,{type:"Vehicle"});p&&await x("warehouses",c,p)}catch(p){console.warn("Failed to sync vehicle warehouse to COA:",p.message)}await x("costCenters",i,{warehouseId:c}),showToast(`✅ تم إنشاء مخزن السيارة: ${o.name}`,"success")}closeModal("cc-modal"),await k(),I(C)}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{d.disabled=!1,d.textContent="💾 حفظ"}};window.deleteCostCenter=async(e,t)=>{if(await window.showConfirm(`هل تريد حذف مركز التكلفة "${t}"؟
سيتم إلغاء ربطه بالمخزن فقط ولن تُحذف الحركات.`,"حذف مركز التكلفة"))try{await W("costCenters",e),showToast("تم الحذف","success"),await k(),I(C)}catch(s){showToast(s.message,"error")}};window.createVehicleWarehouse=async e=>{const t=b.find(a=>a.id===e);if(!t)return;const s={barcodePrefix:t.code,name:`مخزن سيارة — ${t.name}`,type:"Vehicle",storageTemperature:"ambient",isActive:!0,manager:t.driverName||"",costCenterId:e,driverName:t.driverName||"",plateNumber:t.plateNumber||"",notes:"مخزن سيارة توزيع — تم إنشاؤه تلقائياً",allowNegative:!1,requireBatch:!1,requireExpiry:!1,requireSerial:!1};try{const a=await P(u.warehouses(),s);try{const n=await D("warehouses",a,s.name,{type:"Vehicle"});n&&await x("warehouses",a,n)}catch(n){console.warn("Failed to sync vehicle warehouse to COA:",n.message)}await x("costCenters",e,{warehouseId:a}),showToast("✅ تم إنشاء مخزن السيارة","success"),await k(),I(C)}catch(a){showToast(a.message,"error")}};window.updateAllocPct=async(e,t)=>{try{await x("costCenters",e,{allocPct:parseFloat(t)||null})}catch{}};window.ccExportPDF=async()=>{const{exportPDF:e}=await j(async()=>{const{exportPDF:s}=await import("./index-HrCilPJ3.js").then(a=>a.O);return{exportPDF:s}},__vite__mapDeps([0,1])),t=g();e({title:"تقرير ربحية مراكز التكلفة",subtitle:`الفترة: ${$} — ${F}`,headers:["مركز التكلفة","السائق","المبيعات","المصاريف","التكلفة الثابتة","صافي الربح","هامش الربح"],rows:t.map(({cc:s,sales:a,expenses:n,fixed:l,profit:d})=>[s.name,s.driverName||"—",r(a),r(n),r(l),r(d),a>0?`${(d/a*100).toFixed(1)}%`:"—"]),filename:`مراكز_التكلفة_${$}`,orientation:"landscape"})};window.ccExportExcel=async()=>{const{exportXLSX:e}=await j(async()=>{const{exportXLSX:s}=await import("./index-HrCilPJ3.js").then(a=>a.O);return{exportXLSX:s}},__vite__mapDeps([0,1])),t=g();e({filename:`مراكز_التكلفة_${$}`,title:"تقرير ربحية مراكز التكلفة",headers:["مركز التكلفة","الكود","السائق","المبيعات","المصاريف المباشرة","التكلفة الثابتة","صافي الربح"],rows:t.map(({cc:s,sales:a,expenses:n,fixed:l,profit:d})=>[s.name,s.code,s.driverName||"",a,n,l,d])})};async function ct(){return b.length>0?b:(await f(u.costCenters()).catch(()=>[])).sort((t,s)=>(t.code||"").localeCompare(s.code||""))}function pt(e=""){return b.map(t=>`<option value="${t.id}" ${t.id===e?"selected":""}>${t.code} — ${t.name}</option>`).join("")}export{pt as costCenterSelect,ct as getCostCenters,lt as render};
