const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-T8P1GM2w.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as M,a as P,f as i,_ as X,u as S,o as W,r as ct}from"./index-T8P1GM2w.js";import{orderBy as R}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{s as at}from"./coa-connector-BkSx3WB1.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let k=[],L=[],U=[],K=[],st=[],Q=[],A="dashboard",E="",B="";const Z=()=>new Date().toISOString().slice(0,10),J=()=>{const e=new Date;return e.setMonth(e.getMonth()-1),e.toISOString().slice(0,10)};async function Et(e,t){window.switchTab=G,e.innerHTML=pt(),await _(),G("dashboard")}function pt(){return`
  <!-- Filter Bar -->
  <div class="filterbar no-print">
    <div class="date-range-group">
      <label>من</label>
      <input type="date" id="cc-from" class="input" value="${J()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div class="date-range-group">
      <label>إلى</label>
      <input type="date" id="cc-to" class="input" value="${Z()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div style="margin-right:auto; display:flex; gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="ccExportPDF()">📄 تصدير PDF</button>
      <button class="btn btn-primary" onclick="openCCModal()">＋ مركز تكلفة جديد</button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div style="display:flex; gap:4px; padding:12px 20px 0; border-bottom:1px solid var(--border-soft); background:var(--bg-1); flex-wrap:wrap;">
    ${I("dashboard","📊","لوحة التحكم")}
    ${I("vehicles","🚐","السيارات والمخازن")}
    ${I("profit","💰","تقرير الربحية")}
    ${I("compare","📈","مقارنة الأداء")}
    ${I("inventory","📦","حركة المخزون")}
    ${I("allocation","⚖️","توزيع المصاريف")}
    ${I("breakeven","⚡","نقطة التعادل")}
    ${I("invoice-perf","🧾","أداء الفواتير")}
    ${I("manage","⚙️","إدارة مراكز التكلفة")}
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
  </div>`}function I(e,t,s){return`<button class="tab-btn" id="tab-btn-${e}" onclick="switchTab('${e}')"
    style="padding:8px 14px; border:none; background:transparent; cursor:pointer;
    font-size:13px; color:var(--text-2); border-bottom:2px solid transparent;
    display:flex; align-items:center; gap:6px; white-space:nowrap;">
    <span>${t}</span><span>${s}</span>
  </button>`}async function _(){const[e,t]=await Promise.all([M(P.costCenters()).catch(()=>[]),M(P.warehouses(),[R("name")]).catch(()=>[])]);k=e.sort((g,d)=>(g.code||"").localeCompare(d.code||"")),L=t,E=document.getElementById("cc-from")?.value||J(),B=document.getElementById("cc-to")?.value||Z();const[s,o,n,p]=await Promise.all([M(P.expenses(),[R("date","desc")]).catch(()=>[]),M(P.salesInvoices(),[R("date","desc")]).catch(()=>[]),M(P.stockTransactions(),[R("date","desc")]).catch(()=>[]),M(P.products()).catch(()=>[])]);U=s,K=o,st=n,Q=p}function j(e){return e?e>=E&&e<=B:!0}function it(){const e={};return L.forEach(t=>{t.costCenterId&&(e[t.id]=t.costCenterId)}),e}function N(){const e=it(),t={};Q.forEach(a=>{t[a.id]=parseFloat(a.costPrice||a.purchasePrice||0)});const s={},o={};K.filter(a=>j(a.date)&&a.status!=="cancelled").forEach(a=>{const c=a.costCenterId||a.warehouseId&&e[a.warehouseId]||"NONE",m=parseFloat(a.subtotal||a.totalBeforeVat||a.totalExcludingVat||0)||Math.max(0,parseFloat(a.total||0)-parseFloat(a.vatAmount||a.taxAmount||a.vat||0));s[c]=(s[c]||0)+m;let b=0;(a.items||a.lines||[]).forEach(x=>{const v=parseFloat(x.qty||x.quantity||0),w=parseFloat(x.costPrice||x.purchasePrice||t[x.productId||x.id]||0);b+=v*w}),o[c]=(o[c]||0)+b});const n={};U.filter(a=>j(a.date)).forEach(a=>{const c=a.costCenterId||"NONE";n[c]=(n[c]||0)+(parseFloat(a.amount)||0)});const p={},g={},d={};return st.filter(a=>j(a.date)).forEach(a=>{const c=a.warehouseId||a.toWarehouseId||a.fromWarehouseId,m=c&&e[c]||a.costCenterId||"NONE",b=parseFloat(a.quantity||a.qty||0);a.type==="transfer_in"&&(p[m]=(p[m]||0)+b),a.type==="sale"&&(g[m]=(g[m]||0)+b),a.type==="transfer_out"&&(d[m]=(d[m]||0)+b)}),k.map(a=>{const c=s[a.id]||0,m=o[a.id]||0,b=n[a.id]||0,x=parseFloat(a.fixedCost||0);return{cc:a,sales:c,cogs:m,grossProfit:c-m,expenses:b,fixed:x,profit:c-m-b-x,loaded:p[a.id]||0,sold:g[a.id]||0,returned:d[a.id]||0,waste:Math.max(0,(p[a.id]||0)-(g[a.id]||0)-(d[a.id]||0))}})}function G(e){A=e,document.querySelectorAll(".tab-btn").forEach(s=>{s.style.borderBottomColor="transparent",s.style.color="var(--text-2)",s.style.fontWeight="400"});const t=document.getElementById(`tab-btn-${e}`);t&&(t.style.borderBottomColor="var(--primary)",t.style.color="var(--primary)",t.style.fontWeight="700"),q(e)}window.ccRefresh=async()=>{E=document.getElementById("cc-from")?.value||J(),B=document.getElementById("cc-to")?.value||Z(),await _(),q(A)};function q(e){const t=document.getElementById("cc-tab-content");if(t)switch(e){case"dashboard":t.innerHTML=ot();break;case"vehicles":t.innerHTML=gt();break;case"profit":t.innerHTML=xt();break;case"compare":t.innerHTML=ht();break;case"inventory":t.innerHTML=bt();break;case"allocation":t.innerHTML=vt();break;case"breakeven":t.innerHTML=yt();break;case"manage":t.innerHTML=ut();break;case"invoice-perf":t.innerHTML=ft();break;default:t.innerHTML=ot()}}function ot(){const e=N();if(e.length===0)return`<div class="alert info" style="margin:40px auto; max-width:500px; text-align:center;">
      <p style="font-size:18px; margin-bottom:12px;">🏁 لا توجد مراكز تكلفة بعد</p>
      <p>اضغط <strong>"مركز تكلفة جديد"</strong> لإضافة سيارة أو مخزن كمركز تكلفة</p>
    </div>`;const t=e.reduce((d,a)=>d+a.sales,0),s=e.reduce((d,a)=>d+a.cogs,0),o=e.reduce((d,a)=>d+a.expenses+a.fixed,0),n=t-s-o,p=e.reduce((d,a)=>d+a.waste,0),g=e.map(({cc:d,sales:a,cogs:c,expenses:m,fixed:b,profit:x,waste:v,loaded:w,sold:z})=>{const r=L.find(O=>O.costCenterId===d.id&&O.type==="Vehicle"),h=a>0?(x/a*100).toFixed(1):"0.0",$=w>0?(v/w*100).toFixed(1):"0.0",T=x>=0?"#10b981":"#ef4444";return`
    <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:14px; padding:18px; position:relative; overflow:hidden;">
      <div style="position:absolute; top:0; right:0; width:4px; height:100%; background:${T};"></div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <div style="font-size:15px; font-weight:700; color:var(--text-0);">${d.type==="vehicle"?"🚐":"🏭"} ${d.name}</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
            ${d.driverName?`👤 ${d.driverName}`:""}
            ${d.plateNumber?` • ${d.plateNumber}`:""}
            ${r?` • مخزن: ${r.name}`:""}
          </div>
        </div>
        <span class="mono" style="font-size:10px; background:var(--bg-3); padding:3px 8px; border-radius:20px; color:var(--text-2);">${d.code}</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:10px;">
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المبيعات</div>
          <div style="font-size:12px; font-weight:700; color:var(--text-0); margin-top:2px;">${i(a)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">التكلفة</div>
          <div style="font-size:12px; font-weight:700; color:#8b5cf6; margin-top:2px;">${i(c)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المصاريف</div>
          <div style="font-size:12px; font-weight:700; color:#f59e0b; margin-top:2px;">${i(m+b)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">الربح</div>
          <div style="font-size:12px; font-weight:700; color:${T}; margin-top:2px;">${i(x)}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11px; background:${T}22; color:${T}; padding:3px 10px; border-radius:20px; font-weight:600;">
          هامش ${h}%
        </span>
        ${v>0?`<span style="font-size:11px; background:#ef444422; color:#ef4444; padding:3px 10px; border-radius:20px;">⚠️ فاقد ${$}%</span>`:""}
        <span style="font-size:11px; background:var(--bg-3); color:var(--text-2); padding:3px 10px; border-radius:20px; margin-right:auto; cursor:pointer;"
          onclick="goToCCDetail('${d.id}')">تفاصيل →</span>
      </div>
    </div>`}).join("");return`
  <!-- KPI Strip -->
  <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px;">
    <div class="kpi-card sales">
      <div class="kpi-label">إجمالي المبيعات</div>
      <div class="kpi-value">${i(t)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #8b5cf6;">
      <div class="kpi-label">تكلفة البضاعة المباعة</div>
      <div class="kpi-value" style="color:#8b5cf6;">${i(s)}</div>
    </div>
    <div class="kpi-card purchases">
      <div class="kpi-label">إجمالي المصاريف</div>
      <div class="kpi-value">${i(o)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid ${n>=0?"#10b981":"#ef4444"};">
      <div class="kpi-label">صافي الربح</div>
      <div class="kpi-value" style="color:${n>=0?"#10b981":"#ef4444"};">${i(n)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #f59e0b;">
      <div class="kpi-label">إجمالي الفاقد (وحدة)</div>
      <div class="kpi-value" style="color:#f59e0b;">${p.toLocaleString()}</div>
    </div>
  </div>

  <!-- CC Cards -->
  <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px;">
    ${g||'<div class="alert info">لا توجد بيانات في هذه الفترة</div>'}
  </div>`}function gt(){const e=k.filter(o=>o.type==="vehicle"),t=L.filter(o=>o.type==="Vehicle");return e.length===0&&t.length===0?`<div class="alert info" style="margin:40px auto;max-width:500px;text-align:center;">
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
        <tbody>${e.map(o=>{const n=L.find(p=>p.costCenterId===o.id&&p.type==="Vehicle");return`<tr>
      <td><span class="mono" style="color:var(--primary);">${o.code}</span></td>
      <td style="font-weight:600;">🚐 ${o.name}</td>
      <td>${o.driverName||"—"}</td>
      <td class="mono">${o.plateNumber||"—"}</td>
      <td>${o.vehicleId||"—"}</td>
      <td>${n?`<span style="color:#10b981;">✅ ${n.name}</span>`:`<span style="color:#f59e0b;">⚠️ لا يوجد <button class="btn btn-sm btn-secondary" onclick="createVehicleWarehouse('${o.id}')">إنشاء</button></span>`}</td>
      <td>${i(o.fixedCost||0)}/شهر</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${o.id}')">✏️</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;" onclick="deleteCostCenter('${o.id}','${o.name}')">🗑️</button>
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
  </div>`}function xt(){const e=N(),t=e.map(({cc:o,sales:n,cogs:p,grossProfit:g,expenses:d,fixed:a,profit:c})=>{const m=n>0?(c/n*100).toFixed(1):"—",b=c>=0?"color:#10b981;":"color:#ef4444;";return`<tr>
      <td><span class="mono" style="color:var(--primary);">${o.code}</span></td>
      <td style="font-weight:600;">${o.type==="vehicle"?"🚐":"🏭"} ${o.name}</td>
      <td>${o.driverName||"—"}</td>
      <td class="mono">${i(n)}</td>
      <td class="mono" style="color:#8b5cf6;">${i(p)}</td>
      <td class="mono font-bold" style="color:#10b981;">${i(g)}</td>
      <td class="mono" style="color:#f59e0b;">${i(d)}</td>
      <td class="mono" style="color:#a855f7;">${i(a)}</td>
      <td class="mono font-bold" style="${b}">${i(c)}</td>
      <td><span style="font-size:12px;padding:3px 10px;border-radius:20px;${b}background:${c>=0?"#10b98122":"#ef444422"};font-weight:700;">${m}%</span></td>
    </tr>`}).join(""),s=e.reduce((o,n)=>({sales:o.sales+n.sales,cogs:o.cogs+n.cogs,gp:o.gp+n.grossProfit,exp:o.exp+n.expenses,fixed:o.fixed+n.fixed,profit:o.profit+n.profit}),{sales:0,cogs:0,gp:0,exp:0,fixed:0,profit:0});return`
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
          <td class="mono">${i(s.sales)}</td>
          <td class="mono" style="color:#8b5cf6;">${i(s.cogs)}</td>
          <td class="mono" style="color:#10b981;">${i(s.gp)}</td>
          <td class="mono" style="color:#f59e0b;">${i(s.exp)}</td>
          <td class="mono" style="color:#a855f7;">${i(s.fixed)}</td>
          <td class="mono font-bold" style="${s.profit>=0?"color:#10b981":"color:#ef4444"}">${i(s.profit)}</td>
          <td>—</td>
        </tr>
      </tfoot>
    </table>
  </div>`}function Y(){const e=it(),t={};Q.forEach(o=>{t[o.id]=parseFloat(o.costPrice||o.purchasePrice||0)});const s=[];return K.filter(o=>j(o.date)&&o.status!=="cancelled").forEach(o=>{const n=o.costCenterId||o.warehouseId&&e[o.warehouseId]||null,p=k.find(x=>x.id===n),g=parseFloat(o.subtotal||o.totalBeforeVat||o.totalExcludingVat||0)||Math.max(0,parseFloat(o.total||0)-parseFloat(o.vatAmount||o.taxAmount||o.vat||0)),d=o.items||o.lines||[];let a=0;const c=d.map(x=>{const v=parseFloat(x.qty||x.quantity||0),w=parseFloat(x.unitPrice||x.price||0),z=parseFloat(x.costPrice||x.purchasePrice||t[x.productId||x.id]||0),r=Math.round(v*w*100)/100,h=Math.round(v*z*100)/100,$=Math.round((r-h)*100)/100;return a+=h,{name:x.name||x.productName||"—",qty:v,unitPrice:w,costPrice:z,lineTotal:r,lineCost:h,lineProfit:$,lineMargin:r>0?($/r*100).toFixed(1):"0.0"}}),m=Math.round((g-a)*100)/100,b=g>0?(m/g*100).toFixed(1):"0.0";s.push({id:o.id||o.invoiceNumber,number:o.invoiceNumber||o.id||"—",date:o.date||"—",customerName:o.customerName||o.clientName||"—",ccId:n,cc:p,ccName:p?p.name:"بدون مركز تكلفة",driverName:p&&p.driverName||"—",sales:g,cogs:Math.round(a*100)/100,grossProfit:m,margin:b,items:c})}),s}window.toggleInvoiceRows=e=>{const t=document.getElementById(`inv-detail-${e}`);t&&(t.style.display=t.style.display==="none"?"":"none")};function ft(){const e=Y();if(!e.length)return`<div class="alert info" style="margin:40px auto;max-width:500px;text-align:center;">
      <p style="font-size:18px;margin-bottom:8px;">🧾 لا توجد فواتير في هذه الفترة</p>
      <p style="color:var(--text-2);">جرّب توسيع نطاق التاريخ من الفلتر أعلاه</p>
    </div>`;const t=e.reduce((l,f)=>l+f.sales,0);e.reduce((l,f)=>l+f.cogs,0);const s=e.reduce((l,f)=>l+f.grossProfit,0),o=t>0?(s/t*100).toFixed(1):"0.0",n=[...e].sort((l,f)=>f.grossProfit-l.grossProfit),p=n[0],g=n[n.length-1],d={};e.forEach(l=>{l.items.forEach(f=>{const u=f.name;d[u]||(d[u]={name:u,qty:0,sales:0,cost:0,profit:0}),d[u].qty+=f.qty,d[u].sales+=f.lineTotal,d[u].cost+=f.lineCost,d[u].profit+=f.lineProfit})});const a=Object.values(d),c=[...a].sort((l,f)=>f.profit-l.profit),m=[...a].sort((l,f)=>f.sales-l.sales),b=c[0],x=m[0],v={};e.forEach(l=>{const f=l.customerName;v[f]||(v[f]={name:f,sales:0,cost:0,profit:0,count:0}),v[f].sales+=l.sales,v[f].cost+=l.cogs,v[f].profit+=l.grossProfit,v[f].count+=1});const z=[...Object.values(v)].sort((l,f)=>f.sales-l.sales),r=z[0],h=`
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-bottom:24px;">
    <!-- الفواتير المتميزة -->
    <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.02));border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:14px;position:relative;">
      <div style="font-size:11px;color:#10b981;font-weight:700;margin-bottom:6px;">🏆 أعلى فاتورة ربحاً</div>
      <div style="font-size:16px;font-weight:800;color:var(--text-0);">${i(p.grossProfit)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">فاتورة: ${p.number} • ${p.ccName}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">العميل: ${p.customerName}</div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.02));border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#ef4444;font-weight:700;margin-bottom:6px;">⚠️ أقل فاتورة ربحاً</div>
      <div style="font-size:16px;font-weight:800;color:var(--text-0);">${i(g.grossProfit)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">فاتورة: ${g.number} • ${g.ccName}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">العميل: ${g.customerName}</div>
    </div>

    <!-- الأصناف المتميزة -->
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.02));border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#6366f1;font-weight:700;margin-bottom:6px;">📈 الصنف الأعلى ربحية</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${b?b.name:""}">${b?b.name:"—"}</div>
      <div style="font-size:12px;font-weight:700;color:#10b981;margin-top:4px;">ربح: ${b?i(b.profit):"0"}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">مبيعات: ${b?i(b.sales):"0"}</div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#f59e0b;font-weight:700;margin-bottom:6px;">📊 الصنف الأكثر مبيعاً (قيمة)</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${x?x.name:""}">${x?x.name:"—"}</div>
      <div style="font-size:12px;font-weight:700;color:var(--primary);margin-top:4px;">مبيعات: ${x?i(x.sales):"0"}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">الكمية المباعة: ${x?x.qty:"0"} وحدة</div>
    </div>

    <!-- العميل الأكثر سحباً -->
    <div style="background:linear-gradient(135deg,rgba(168,85,247,0.1),rgba(168,85,247,0.02));border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#a855f7;font-weight:700;margin-bottom:6px;">👤 العميل الأعلى سحباً</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${r?r.name:""}">${r?r.name:"—"}</div>
      <div style="font-size:12px;font-weight:700;color:#10b981;margin-top:4px;">مسحوبات: ${r?i(r.sales):"0"}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">عدد الفواتير: ${r?r.count:"0"}</div>
    </div>
  </div>`,$=[["all","كل المناديب والمراكز"],...k.map(l=>[l.id,`${l.type==="vehicle"?"🚐":"🏭"} ${l.name}`]),["NONE","بدون مركز تكلفة"]].map(([l,f])=>`<option value="${l}">${f}</option>`).join(""),T=c.map(l=>{const f=l.sales>0?(l.profit/l.sales*100).toFixed(1):"0.0",u=l.profit>=0?"color:#10b981;":"color:#ef4444;";return`<tr>
      <td style="font-weight:600;">📦 ${l.name}</td>
      <td class="mono">${l.qty.toLocaleString()}</td>
      <td class="mono">${i(l.sales)}</td>
      <td class="mono" style="color:#8b5cf6;">${i(l.cost)}</td>
      <td class="mono font-bold" style="${u}">${i(l.profit)}</td>
      <td><span style="font-size:11.5px;padding:3px 9px;border-radius:12px;background:${l.profit>=0?"#10b98118":"#ef444418"};${u}font-weight:700;">${f}%</span></td>
    </tr>`}).join(""),O=z.slice(0,15).map(l=>{const f=l.sales>0?(l.profit/l.sales*100).toFixed(1):"0.0",u=l.profit>=0?"color:#10b981;":"color:#ef4444;";return`<tr>
      <td style="font-weight:600;">👤 ${l.name}</td>
      <td class="mono">${l.count}</td>
      <td class="mono">${i(l.sales)}</td>
      <td class="mono" style="color:#8b5cf6;">${i(l.cost)}</td>
      <td class="mono font-bold" style="${u}">${i(l.profit)}</td>
      <td><span style="font-size:11.5px;padding:3px 9px;border-radius:12px;background:${l.profit>=0?"#10b98118":"#ef444418"};${u}font-weight:700;">${f}%</span></td>
    </tr>`}).join(""),D={};e.forEach(l=>{const f=l.ccId||"NONE";D[f]||(D[f]={ccName:l.ccName,driverName:l.driverName,invoices:[]}),D[f].invoices.push(l)});const nt=Object.entries(D).map(([l,f])=>{const u=f.invoices.reduce((y,F)=>y+F.sales,0);f.invoices.reduce((y,F)=>y+F.cogs,0);const V=f.invoices.reduce((y,F)=>y+F.grossProfit,0),rt=u>0?(V/u*100).toFixed(1):"0.0",H=V>=0?"#10b981":"#ef4444",dt=f.invoices.map((y,F)=>{const tt=parseFloat(y.margin)>=20?"#10b981":parseFloat(y.margin)>=0?"#f59e0b":"#ef4444",lt=y.items.map(C=>`
        <tr style="background:var(--bg-1);font-size:11px;">
          <td style="padding:5px 8px;padding-right:24px;color:var(--text-1);">${C.name}</td>
          <td style="padding:5px 8px;text-align:center;">${C.qty}</td>
          <td style="padding:5px 8px;text-align:left;">${i(C.unitPrice)}</td>
          <td style="padding:5px 8px;text-align:left;color:#8b5cf6;">${i(C.costPrice)}</td>
          <td style="padding:5px 8px;text-align:left;">${i(C.lineTotal)}</td>
          <td style="padding:5px 8px;text-align:left;color:#8b5cf6;">${i(C.lineCost)}</td>
          <td style="padding:5px 8px;text-align:left;color:${parseFloat(C.lineMargin)>=0?"#10b981":"#ef4444"};font-weight:700;">${i(C.lineProfit)}</td>
          <td style="padding:5px 8px;text-align:center;">
            <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${parseFloat(C.lineMargin)>=0?"#10b98122":"#ef444422"};color:${parseFloat(C.lineMargin)>=0?"#10b981":"#ef4444"};">${C.lineMargin}%</span>
          </td>
        </tr>`).join(""),et=`${l}_${F}`.replace(/[^a-zA-Z0-9_]/g,"_");return`
        <tr style="cursor:pointer;border-bottom:1px solid var(--border-soft);" onclick="toggleInvoiceRows('${et}')">
          <td style="padding:8px;"><span class="mono" style="color:var(--primary);font-size:11px;">${y.number}</span></td>
          <td style="padding:8px;font-size:11.5px;">${y.date}</td>
          <td style="padding:8px;font-size:11.5px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${y.customerName}">${y.customerName}</td>
          <td style="padding:8px;text-align:left;font-size:12px;">${i(y.sales)}</td>
          <td style="padding:8px;text-align:left;font-size:12px;color:#8b5cf6;">${i(y.cogs)}</td>
          <td style="padding:8px;text-align:left;font-size:12px;font-weight:700;color:${parseFloat(y.margin)>=0?"#10b981":"#ef4444"};">${i(y.grossProfit)}</td>
          <td style="padding:8px;text-align:center;">
            <span style="font-size:11px;padding:3px 8px;border-radius:12px;background:${tt}22;color:${tt};font-weight:700;">${y.margin}%</span>
          </td>
          <td style="padding:8px;text-align:center;font-size:11px;color:var(--text-2);">${y.items.length} أصناف ▾</td>
        </tr>
        <tr id="inv-detail-${et}" style="display:none;">
          <td colspan="8" style="padding:0;background:var(--bg-0);">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);font-size:10px;color:var(--text-2);">
                  <th style="padding:5px 8px;padding-right:24px;text-align:right;font-weight:600;">الصنف</th>
                  <th style="padding:5px 8px;text-align:center;font-weight:600;">الكمية</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">سعر البيع</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">التكلفة</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">إجمالي البيع</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">إجمالي التكلفة</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">الربح</th>
                  <th style="padding:5px 8px;text-align:center;font-weight:600;">الهامش</th>
                </tr>
              </thead>
              <tbody>${lt}</tbody>
            </table>
          </td>
        </tr>`}).join("");return`
    <div class="cc-inv-section" data-ccid="${l}" style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <div style="background:var(--bg-3);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-soft);flex-wrap:wrap;gap:8px;">
        <div>
          <span style="font-size:14px;font-weight:700;">${f.ccName}</span>
          ${f.driverName!=="—"?`<span style="font-size:11px;color:var(--text-2);margin-right:8px;">👤 المندوب: ${f.driverName}</span>`:""}
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--text-2);">${f.invoices.length} فاتورة</span>
          <span style="font-size:12px;font-weight:700;color:var(--primary);">المبيعات (صافي): ${i(u)}</span>
          <span style="font-size:12px;font-weight:700;color:${H};">مجمل الربح: ${i(V)}</span>
          <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${H}22;color:${H};font-weight:700;">هامش: ${rt}%</span>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:680px;" class="data-dense">
          <thead>
            <tr style="background:var(--bg-3);font-size:11px;color:var(--text-2);">
              <th style="padding:8px;text-align:right;font-weight:600;">رقم الفاتورة</th>
              <th style="padding:8px;text-align:right;font-weight:600;">التاريخ</th>
              <th style="padding:8px;text-align:right;font-weight:600;">العميل</th>
              <th style="padding:8px;text-align:left;font-weight:600;">المبيعات (صافي)</th>
              <th style="padding:8px;text-align:left;font-weight:600;">التكلفة (COGS)</th>
              <th style="padding:8px;text-align:left;font-weight:600;">مجمل الربح</th>
              <th style="padding:8px;text-align:center;font-weight:600;">هامش %</th>
              <th style="padding:8px;text-align:center;font-weight:600;">الأصناف</th>
            </tr>
          </thead>
          <tbody>${dt}</tbody>
        </table>
      </div>
    </div>`}).join("");return`
  <!-- Header Action Panel -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--border-soft);padding-bottom:14px;">
    <div>
      <h2 style="font-size:18px;font-weight:700;margin:0;">🧾 تقرير أداء مبيعات وربحية مراكز التكلفة</h2>
      <div style="font-size:12px;color:var(--text-2);margin-top:2px;">
        الفترة: ${E} إلى ${B} | مبيعات صافية (بدون ضريبة): <span style="font-weight:700;color:var(--primary);">${i(t)}</span> | ربح: <span style="font-weight:700;color:#10b981;">${i(s)}</span> (${o}%)
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <select id="inv-perf-filter" class="input" style="height:32px;font-size:12px;width:180px;"
        onchange="filterInvPerfSections(this.value)">
        ${$}
      </select>
      <button class="btn btn-secondary btn-sm" onclick="printInvoicePerfReport()" style="display:inline-flex;align-items:center;gap:6px;">
        🖨️ طباعة ومعاينة التقرير
      </button>
      <button class="btn btn-secondary btn-sm" onclick="exportInvoicePerfExcel()" style="display:inline-flex;align-items:center;gap:6px;">
        📊 تصدير إكسل
      </button>
    </div>
  </div>

  <!-- Quick KPIs Grid -->
  ${h}

  <!-- Analysis Tables Sections (Products and Customers Side by Side) -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;flex-wrap:wrap;">
    <!-- الأصناف الأكثر مبيعاً وربحية -->
    <div class="card" style="padding:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:2px solid var(--primary);padding-bottom:6px;">
        📦 تحليل أداء وربحية الأصناف
      </div>
      <div class="table-container" style="max-height:350px;overflow-y:auto;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>المبيعات</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
            </tr>
          </thead>
          <tbody>
            ${T||'<tr><td colspan="6" style="text-align:center;padding:12px;color:var(--text-2);">لا توجد بيانات للأصناف</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- العملاء الأكثر سحباً وربحية -->
    <div class="card" style="padding:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:2px solid #a855f7;padding-bottom:6px;">
        👤 تحليل مسحوبات وربحية العملاء (أعلى 15 عميل)
      </div>
      <div class="table-container" style="max-height:350px;overflow-y:auto;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الفواتير</th>
              <th>المبيعات</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
            </tr>
          </thead>
          <tbody>
            ${O||'<tr><td colspan="6" style="text-align:center;padding:12px;color:var(--text-2);">لا توجد بيانات للعملاء</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Detailed Invoices Sections by cost center -->
  <div style="font-weight:700;font-size:14px;margin-bottom:14px;border-bottom:2px solid var(--border-soft);padding-bottom:6px;">
    📋 تفاصيل الفواتير والأصناف والمناديب
  </div>
  <div id="inv-perf-sections">
    ${nt||'<div class="alert info">لا توجد بيانات فواتير</div>'}
  </div>
  
  <style>
    .data-dense th { background: var(--bg-3) !important; color: var(--text-2); padding: 8px 10px; font-size: 11px; }
    .data-dense td { padding: 6px 10px; font-size: 12px; }
    .data-dense tbody tr:hover { background: var(--bg-1); }
  </style>`}window.filterInvPerfSections=function(e){document.querySelectorAll(".cc-inv-section").forEach(t=>{t.style.display=e==="all"||t.dataset.ccid===e?"":"none"})};window.goToCCDetail=function(e){G("invoice-perf"),setTimeout(()=>{const t=document.getElementById("inv-perf-filter");t&&(t.value=e,filterInvPerfSections(e))},80)};window.toggleInvoiceRows=function(e){const t=document.getElementById(`inv-detail-${e}`);t&&(t.style.display=t.style.display==="none"?"":"none")};window.printInvoicePerfReport=()=>{const e=Y();if(!e.length){window.showToast?.("لا توجد بيانات للطباعة في هذه الفترة","warn");return}const t=mt(e),s=window.open("","_blank");s&&(s.document.write(t),s.document.close(),s.focus(),s.onload=function(){s.print()})};window.exportInvoicePerfExcel=async()=>{const{exportXLSX:e}=await X(async()=>{const{exportXLSX:o}=await import("./index-T8P1GM2w.js").then(n=>n.U);return{exportXLSX:o}},__vite__mapDeps([0,1])),t=Y();if(!t.length){window.showToast?.("لا توجد بيانات للتصدير","warn");return}const s=[];t.forEach(o=>{o.items.forEach(n=>{s.push([o.number,o.date,o.ccName,o.driverName,o.customerName,n.name,n.qty,n.unitPrice,n.lineTotal,n.costPrice,n.lineCost,n.lineProfit,n.lineMargin+"%"])})}),e({filename:`أداء_الفواتير_${E}_إلى_${B}`,title:"تقرير مبيعات وربحية مراكز التكلفة التفصيلي",headers:["رقم الفاتورة","التاريخ","مركز التكلفة","المندوب/السائق","العميل","الصنف","الكمية","سعر البيع","إجمالي البيع","سعر التكلفة","إجمالي التكلفة","صافي الربح","هامش الربح %"],rows:s})};function mt(e){const t=e.reduce((r,h)=>r+h.sales,0);e.reduce((r,h)=>r+h.cogs,0);const s=e.reduce((r,h)=>r+h.grossProfit,0),o=t>0?(s/t*100).toFixed(1):"0.0",p=[...e].sort((r,h)=>h.grossProfit-r.grossProfit)[0],g={};e.forEach(r=>{r.items.forEach(h=>{const $=h.name;g[$]||(g[$]={name:$,qty:0,sales:0,cost:0,profit:0}),g[$].qty+=h.qty,g[$].sales+=h.lineTotal,g[$].cost+=h.lineCost,g[$].profit+=h.lineProfit})});const d=Object.values(g).sort((r,h)=>h.profit-r.profit),a=d[0],c=Object.values(g).sort((r,h)=>h.sales-r.sales)[0],m={};e.forEach(r=>{const h=r.customerName;m[h]||(m[h]={name:h,sales:0,cost:0,profit:0,count:0}),m[h].sales+=r.sales,m[h].cost+=r.cogs,m[h].profit+=r.grossProfit,m[h].count+=1});const b=Object.values(m).sort((r,h)=>h.sales-r.sales),x=b[0],v=d.map((r,h)=>`
    <tr>
      <td>${h+1}</td>
      <td style="text-align:right;">${r.name}</td>
      <td>${r.qty.toLocaleString()}</td>
      <td>${i(r.sales)}</td>
      <td>${i(r.cost)}</td>
      <td style="font-weight:700;color:${r.profit>=0?"#16a34a":"#dc2626"}">${i(r.profit)}</td>
      <td>${(r.sales>0?r.profit/r.sales*100:0).toFixed(1)}%</td>
    </tr>`).join(""),w=b.slice(0,15).map((r,h)=>`
    <tr>
      <td>${h+1}</td>
      <td style="text-align:right;">${r.name}</td>
      <td>${r.count}</td>
      <td>${i(r.sales)}</td>
      <td>${i(r.cost)}</td>
      <td style="font-weight:700;color:${r.profit>=0?"#16a34a":"#dc2626"}">${i(r.profit)}</td>
      <td>${(r.sales>0?r.profit/r.sales*100:0).toFixed(1)}%</td>
    </tr>`).join(""),z=e.map((r,h)=>`
    <tr>
      <td>${h+1}</td>
      <td>${r.number}</td>
      <td>${r.date}</td>
      <td style="text-align:right;">${r.customerName}</td>
      <td style="text-align:right;">${r.ccName}</td>
      <td>${i(r.sales)}</td>
      <td>${i(r.cogs)}</td>
      <td style="font-weight:700;color:${r.grossProfit>=0?"#16a34a":"#dc2626"}">${i(r.grossProfit)}</td>
      <td>${r.margin}%</td>
    </tr>`).join("");return`<html dir="rtl" lang="ar"><head><meta charset="UTF-8">
  <title>تقرير أداء مراكز التكلفة ومبيعات المناديب التفصيلي</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1f2937; direction: rtl; font-size: 12px; background: #fff; }
    .hdr { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #5b3ec2; padding-bottom: 12px; }
    .hdr h1 { margin: 0; color: #5b3ec2; font-size: 22px; }
    .hdr p { margin: 4px 0 0; color: #6b7280; font-size: 12px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
    .meta-box label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 4px; }
    .meta-box span { font-weight: 700; font-size: 14px; }
    
    /* KPIs style */
    .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .kpi.green { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .kpi.blue { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .kpi.purple { background: #faf5ff; border-color: #e9d5ff; color: #6b21a8; }
    .kpi.yellow { background: #fffbeb; border-color: #fde68a; color: #854d0e; }
    .kpi-title { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
    .kpi-val { font-size: 16px; font-weight: 800; }
    .kpi-desc { font-size: 10px; color: #6b7280; margin-top: 2px; }
    
    h2 { font-size: 14px; border-bottom: 2px solid #5b3ec2; padding-bottom: 6px; margin: 25px 0 10px; color: #5b3ec2; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    th { background: #5b3ec2; color: #fff; padding: 6px 8px; text-align: center; font-weight: 600; }
    td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: center; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 1cm; }
      .page-break { page-break-before: always; }
    }
  </style></head><body>
  <div class="hdr">
    <h1>📈 تقرير مبيعات وربحية مراكز التكلفة والمناديب التفصيلي الشامل</h1>
    <p>إدهام للمواد الغذائية — نظام ERP</p>
  </div>

  <div class="meta">
    <div class="meta-box"><label>فترة التقرير</label><span>من ${E} إلى ${B}</span></div>
    <div class="meta-box"><label>مبيعات صافية (بدون ضريبة)</label><span style="color:#5b3ec2;">${i(t)}</span></div>
    <div class="meta-box"><label>صافي ربح الفواتير</label><span style="color:#16a34a;">${i(s)} (${o}%)</span></div>
  </div>

  <div class="kpis">
    <div class="kpi green">
      <div class="kpi-title">🏆 أعلى فاتورة ربحاً</div>
      <div class="kpi-val">${i(p?p.grossProfit:0)}</div>
      <div class="kpi-desc">${p?p.number:"—"} • ${p?p.customerName:"—"}</div>
    </div>
    <div class="kpi blue">
      <div class="kpi-title">📊 الصنف الأكثر مبيعاً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${c?c.name:"—"}</div>
      <div class="kpi-desc">مبيعات: ${c?i(c.sales):"0"}</div>
    </div>
    <div class="kpi purple">
      <div class="kpi-title">📈 الصنف الأعلى ربحاً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${a?a.name:"—"}</div>
      <div class="kpi-desc">صافي الربح: ${a?i(a.profit):"0"}</div>
    </div>
    <div class="kpi yellow">
      <div class="kpi-title">👤 العميل الأكثر سحباً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${x?x.name:"—"}</div>
      <div class="kpi-desc">مسحوبات: ${x?i(x.sales):"0"}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">🧾 عدد الفواتير</div>
      <div class="kpi-val">${e.length}</div>
      <div class="kpi-desc">فاتورة مبيعات مُرحّلة</div>
    </div>
  </div>

  <h2>📦 أولاً: مبيعات وربحية الأصناف بالتفصيل</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th style="text-align:right;">الصنف</th>
        <th>الكمية المباعة</th>
        <th>إجمالي المبيعات (صافي)</th>
        <th>إجمالي التكلفة (COGS)</th>
        <th>صافي الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${v}</tbody>
  </table>

  <div class="page-break"></div>

  <h2>👤 ثانياً: مسحوبات وربحية العملاء (أعلى 15 عميل)</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th style="text-align:right;">العميل</th>
        <th>عدد الفواتير</th>
        <th>إجمالي المسحوبات (صافي)</th>
        <th>إجمالي التكلفة</th>
        <th>صافي الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${w}</tbody>
  </table>

  <h2>🧾 ثالثاً: أداء مبيعات وربحية الفواتير</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>رقم الفاتورة</th>
        <th>التاريخ</th>
        <th style="text-align:right;">العميل</th>
        <th style="text-align:right;">مركز التكلفة</th>
        <th>المبيعات (صافي)</th>
        <th>التكلفة</th>
        <th>مجمل الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${z}</tbody>
  </table>

  <div class="footer">
    <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA",{dateStyle:"full"})}</span>
    <span>نظام إدهام ERP — إدارة مراكز التكلفة</span>
  </div>
  </body></html>`}function ht(){const e=N().sort((n,p)=>p.profit-n.profit);if(e.length===0)return'<div class="alert info">لا توجد بيانات</div>';const t=Math.max(...e.map(n=>n.sales),1),s=Math.max(...e.map(n=>Math.abs(n.profit)),1);return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">📈 مقارنة أداء مراكز التكلفة</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;">
    ${e.map(({cc:n,sales:p,profit:g,waste:d})=>{const a=Math.round(p/t*100),c=Math.round(Math.abs(g)/s*100),m=g>=0?"#10b981":"#ef4444";return`
    <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-weight:700;">${n.type==="vehicle"?"🚐":"🏭"} ${n.name}</span>
        <span style="font-size:11px;color:var(--text-2);">${n.driverName||n.code}</span>
      </div>
      <div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>المبيعات</span><span>${i(p)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${a}%;height:100%;background:var(--primary);border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      <div style="margin-bottom:4px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>الربح / الخسارة</span><span style="color:${m};font-weight:700;">${i(g)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${c}%;height:100%;background:${m};border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      ${d>0?`<div style="font-size:11px;color:#ef4444;margin-top:4px;">⚠️ فاقد: ${d.toLocaleString()} وحدة</div>`:""}
    </div>`}).join("")}
  </div>`}function bt(){return`
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
      <tbody>${N().filter(s=>s.cc.type==="vehicle"||s.loaded>0).map(({cc:s,loaded:o,sold:n,returned:p,waste:g})=>{const d=o>0?(g/o*100).toFixed(1):"0.0",a=parseFloat(d)>5?"#ef4444":parseFloat(d)>2?"#f59e0b":"#10b981";return`<tr>
      <td><span class="mono">${s.code}</span></td>
      <td style="font-weight:600;">🚐 ${s.name}</td>
      <td>${s.driverName||"—"}</td>
      <td class="mono">${o.toLocaleString()}</td>
      <td class="mono" style="color:#10b981;">${n.toLocaleString()}</td>
      <td class="mono" style="color:#8b5cf6;">${p.toLocaleString()}</td>
      <td class="mono" style="color:${a};font-weight:700;">${g.toLocaleString()}</td>
      <td><span style="padding:3px 10px;border-radius:20px;background:${a}22;color:${a};font-weight:700;">${d}%</span></td>
    </tr>`}).join("")||'<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد حركات مخزنية لسيارات في هذه الفترة</td></tr>'}</tbody>
    </table>
  </div>`}function vt(){const e=U.filter(a=>j(a.date)&&!a.costCenterId),t=e.reduce((a,c)=>a+(parseFloat(c.amount)||0),0),s={};e.forEach(a=>{const c=a.accountName||a.notes||"أخرى";s[c]||(s[c]=0),s[c]+=parseFloat(a.amount)||0});const o=Object.entries(s).sort((a,c)=>c[1]-a[1]).map(([a,c])=>`<tr><td style="padding:5px 10px;font-size:12px;">${a}</td><td class="mono" style="padding:5px 10px;font-size:12px;color:#8b5cf6;">${i(c)}</td></tr>`).join(""),n=k.filter(a=>a.type==="vehicle"),p=N(),g=p.reduce((a,c)=>a+c.sales,0),d=n.map(a=>{const c=p.find(w=>w.cc.id===a.id)||{},m=g>0?(c.sales||0)/g:1/(n.length||1),x=(a.allocPct?parseFloat(a.allocPct)/100:null)??m,v=t*x;return`<tr>
      <td style="font-weight:600;">🚐 ${a.name}</td>
      <td class="mono">${i(c.sales||0)}</td>
      <td class="mono">${(m*100).toFixed(1)}%</td>
      <td><input type="number" class="input mono" style="width:80px;height:28px;padding:2px 6px;font-size:12px;"
        value="${a.allocPct||""}" placeholder="تلقائي" min="0" max="100"
        onchange="updateAllocPct('${a.id}', this.value)" /></td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${i(v)}</td>
    </tr>`}).join("");return`
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">⚖️ تقرير المصاريف الموزّعة</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
    <div class="kpi-card" style="border-right:3px solid #8b5cf6;">
      <div class="kpi-label">المصاريف غير المباشرة (رواتب وعمومية)</div>
      <div class="kpi-value" style="color:#8b5cf6;">${i(t)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">${e.length} مصروف — مُوزَّعة تلقائياً على مراكز التكلفة</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">أسلوب التوزيع الافتراضي</div>
      <div style="font-size:14px;font-weight:700;margin-top:8px;">حسب حجم المبيعات لكل مركز</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:2px;">يمكنك تحديد نسبة يدوية في الجدول أدناه</div>
    </div>
  </div>

  ${o?`
  <div class="card mb-16" style="padding:14px 16px;">
    <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:var(--text-1);">📋 تفصيل المصاريف غير المباشرة (الرواتب والعموميات)</div>
    <div style="overflow-x:auto;max-height:200px;overflow-y:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:var(--bg-3);font-size:11px;">
          <th style="padding:6px 10px;text-align:right;font-weight:600;">نوع المصروف</th>
          <th style="padding:6px 10px;text-align:left;font-weight:600;">المبلغ</th>
        </tr></thead>
        <tbody>${o}</tbody>
      </table>
    </div>
  </div>`:""}

  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>مركز التكلفة</th><th>المبيعات</th><th>الحصة حسب المبيعات</th>
        <th>نسبة يدوية %</th><th>المبلغ الموزّع</th>
      </tr></thead>
      <tbody>${d||'<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد سيارات مسجلة</td></tr>'}</tbody>
    </table>
  </div>
  <div class="alert info mt-12" style="font-size:12px;">
    💡 لإضافة مصروف على مركز تكلفة مباشرة، افتح شاشة <strong>المصروفات</strong> واختر مركز التكلفة من القائمة.
  </div>`}function yt(){return`
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
      <tbody>${N().map(({cc:s,sales:o,cogs:n,expenses:p,fixed:g})=>{const d=g,a=o>0?((n+p)/o).toFixed(3):0,c=1-parseFloat(a),m=c>0?d/c:null,b=m!==null?i(m):"—",x=m!==null?o-m:null,v=x!==null?i(Math.abs(x)):"—",w=x===null?"":x>=0?"color:#10b981;":"color:#ef4444;",z=x===null?"—":x>=0?"✅ فوق نقطة التعادل":"❌ أقل من نقطة التعادل";return`<tr>
      <td style="font-weight:600;">🚐 ${s.name}</td>
      <td class="mono">${i(d)}</td>
      <td class="mono">${(parseFloat(a)*100).toFixed(1)}%</td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${b}</td>
      <td class="mono">${i(o)}</td>
      <td class="mono" style="${w}font-weight:700;">${v}</td>
      <td style="${w}font-size:12px;">${z}</td>
    </tr>`}).join("")||'<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد بيانات</td></tr>'}</tbody>
    </table>
  </div>`}function ut(){return`
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
      <tbody>${k.map(t=>{const s=L.find(n=>n.costCenterId===t.id),o={vehicle:"🚐 سيارة",warehouse:"🏭 مخزن",department:"🏢 قسم",general:"📌 عام"};return`<tr>
      <td><span class="mono" style="color:var(--primary);">${t.code}</span></td>
      <td style="font-weight:600;">${o[t.type]||t.type} ${t.name}</td>
      <td>${t.driverName||"—"}</td>
      <td class="mono">${t.plateNumber||"—"}</td>
      <td>${s?`<span style="color:#10b981;font-size:12px;">✅ ${s.name}</span>`:"—"}</td>
      <td class="mono">${i(t.fixedCost||0)}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${t.isActive!==!1?"#10b98122":"#ef444422"};color:${t.isActive!==!1?"#10b981":"#ef4444"};">${t.isActive!==!1?"نشط":"معطل"}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${t.id}')">✏️ تعديل</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;margin-right:4px;" onclick="deleteCostCenter('${t.id}','${t.name}')">🗑️</button>
      </td>
    </tr>`}).join("")||'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد مراكز تكلفة مسجلة</td></tr>'}</tbody>
    </table>
  </div>`}window.openCCModal=(e=null)=>{const t=e?k.find(s=>s.id===e):null;document.getElementById("cc-edit-id").value=t?.id||"",document.getElementById("cc-modal-title").textContent=t?"✏️ تعديل مركز تكلفة":"➕ مركز تكلفة جديد",document.getElementById("cc-code").value=t?.code||"",document.getElementById("cc-name").value=t?.name||"",document.getElementById("cc-type").value=t?.type||"vehicle",document.getElementById("cc-driver").value=t?.driverName||"",document.getElementById("cc-plate").value=t?.plateNumber||"",document.getElementById("cc-vehicle-id").value=t?.vehicleId||"",document.getElementById("cc-fixed-cost").value=t?.fixedCost||"",document.getElementById("cc-alloc-pct").value=t?.allocPct||"",document.getElementById("cc-notes").value=t?.notes||"",document.getElementById("cc-auto-warehouse").checked=!0,document.getElementById("cc-modal-err").classList.add("hidden"),ccTypeToggle(),openModal("cc-modal")};window.ccTypeToggle=()=>{const e=document.getElementById("cc-type")?.value,t=document.getElementById("cc-vehicle-fields");t&&(t.style.display=e==="vehicle"?"block":"none")};window.saveCostCenter=async()=>{const e=document.getElementById("cc-modal-err");e.classList.add("hidden");const t=document.getElementById("cc-edit-id").value,s=document.getElementById("cc-code").value.trim().toUpperCase(),o=document.getElementById("cc-name").value.trim(),n=document.getElementById("cc-type").value;if(!s){e.textContent="يرجى إدخال كود مركز التكلفة",e.classList.remove("hidden");return}if(!o){e.textContent="يرجى إدخال اسم مركز التكلفة",e.classList.remove("hidden");return}const p={code:s,name:o,type:n,driverName:document.getElementById("cc-driver").value.trim(),plateNumber:document.getElementById("cc-plate").value.trim(),vehicleId:document.getElementById("cc-vehicle-id").value.trim(),fixedCost:parseFloat(document.getElementById("cc-fixed-cost").value)||0,allocPct:parseFloat(document.getElementById("cc-alloc-pct").value)||null,notes:document.getElementById("cc-notes").value.trim(),isActive:!0},g=document.getElementById("cc-save-btn");g.disabled=!0,g.textContent="جارٍ الحفظ…";try{let d=t;if(t)await S("costCenters",t,p),showToast("✅ تم تحديث مركز التكلفة","success");else if(d=await W(P.costCenters(),p),showToast("✅ تم إنشاء مركز التكلفة","success"),n==="vehicle"&&document.getElementById("cc-auto-warehouse").checked){const a={barcodePrefix:s,name:`مخزن سيارة — ${o}`,type:"Vehicle",storageTemperature:"ambient",isActive:!0,manager:p.driverName,costCenterId:d,driverName:p.driverName,plateNumber:p.plateNumber,notes:"مخزن سيارة توزيع — تم إنشاؤه تلقائياً",allowNegative:!1,requireBatch:!1,requireExpiry:!1,requireSerial:!1},c=await W(P.warehouses(),a);try{const m=await at("warehouses",c,a.name,{type:"Vehicle"});m&&await S("warehouses",c,m)}catch(m){console.warn("Failed to sync vehicle warehouse to COA:",m.message)}await S("costCenters",d,{warehouseId:c}),showToast(`✅ تم إنشاء مخزن السيارة: ${a.name}`,"success")}closeModal("cc-modal"),await _(),q(A)}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{g.disabled=!1,g.textContent="💾 حفظ"}};window.deleteCostCenter=async(e,t)=>{if(await window.showConfirm(`هل تريد حذف مركز التكلفة "${t}"؟
سيتم إلغاء ربطه بالمخزن فقط ولن تُحذف الحركات.`,"حذف مركز التكلفة"))try{await ct("costCenters",e),showToast("تم الحذف","success"),await _(),q(A)}catch(s){showToast(s.message,"error")}};window.createVehicleWarehouse=async e=>{const t=k.find(o=>o.id===e);if(!t)return;const s={barcodePrefix:t.code,name:`مخزن سيارة — ${t.name}`,type:"Vehicle",storageTemperature:"ambient",isActive:!0,manager:t.driverName||"",costCenterId:e,driverName:t.driverName||"",plateNumber:t.plateNumber||"",notes:"مخزن سيارة توزيع — تم إنشاؤه تلقائياً",allowNegative:!1,requireBatch:!1,requireExpiry:!1,requireSerial:!1};try{const o=await W(P.warehouses(),s);try{const n=await at("warehouses",o,s.name,{type:"Vehicle"});n&&await S("warehouses",o,n)}catch(n){console.warn("Failed to sync vehicle warehouse to COA:",n.message)}await S("costCenters",e,{warehouseId:o}),showToast("✅ تم إنشاء مخزن السيارة","success"),await _(),q(A)}catch(o){showToast(o.message,"error")}};window.updateAllocPct=async(e,t)=>{try{await S("costCenters",e,{allocPct:parseFloat(t)||null})}catch{}};window.ccExportPDF=async()=>{const{exportPDF:e}=await X(async()=>{const{exportPDF:s}=await import("./index-T8P1GM2w.js").then(o=>o.U);return{exportPDF:s}},__vite__mapDeps([0,1])),t=N();e({title:"تقرير ربحية مراكز التكلفة",subtitle:`الفترة: ${E} — ${B}`,headers:["مركز التكلفة","السائق","المبيعات","المصاريف","التكلفة الثابتة","صافي الربح","هامش الربح"],rows:t.map(({cc:s,sales:o,expenses:n,fixed:p,profit:g})=>[s.name,s.driverName||"—",i(o),i(n),i(p),i(g),o>0?`${(g/o*100).toFixed(1)}%`:"—"]),filename:`مراكز_التكلفة_${E}`,orientation:"landscape"})};window.ccExportExcel=async()=>{const{exportXLSX:e}=await X(async()=>{const{exportXLSX:s}=await import("./index-T8P1GM2w.js").then(o=>o.U);return{exportXLSX:s}},__vite__mapDeps([0,1])),t=N();e({filename:`مراكز_التكلفة_${E}`,title:"تقرير ربحية مراكز التكلفة",headers:["مركز التكلفة","الكود","السائق","المبيعات","المصاريف المباشرة","التكلفة الثابتة","صافي الربح"],rows:t.map(({cc:s,sales:o,expenses:n,fixed:p,profit:g})=>[s.name,s.code,s.driverName||"",o,n,p,g])})};async function Nt(){return k.length>0?k:(await M(P.costCenters()).catch(()=>[])).sort((t,s)=>(t.code||"").localeCompare(s.code||""))}function Ft(e=""){return k.map(t=>`<option value="${t.id}" ${t.id===e?"selected":""}>${t.code} — ${t.name}</option>`).join("")}export{Ft as costCenterSelect,Nt as getCostCenters,Et as render};
