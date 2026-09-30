import{g as n}from"./index-BfKDPs3D.js";import{orderBy as d}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let s=[],l=[],c=[];async function u(t,i){const a=t||document.getElementById("main-content");a&&(a.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #8B5CF6, #6D28D9); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(139,92,246,0.25);">
            🔍
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">تتبع التشغيلات واللوت وسحب المنتجات (Batch Traceability)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">التتبع الشامل للسلامة الغذائية • مسار اللوت من المورد للعميل • محاكي الاستدعاء والسحب الفوري</p>
          </div>
        </div>
      </div>

      <!-- Search Box -->
      <div class="card" style="padding:16px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); margin-bottom:20px;">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <div style="flex:1; min-width:280px;">
            <label style="font-size:11.5px; font-weight:700; color:var(--text-1); margin-bottom:4px; display:block;">أدخل رقم التشغيلة (Batch/Lot Number) أو باركود الصنف:</label>
            <input type="text" id="trace-search-input" class="form-control mono font-bold" placeholder="مثال: LOT-2026-A12 أو اسم المنتج…" oninput="window.performLotSearch(this.value)" />
          </div>
          <button class="btn btn-primary" onclick="window.performLotSearch(document.getElementById('trace-search-input').value)" style="margin-top:20px; background:#8B5CF6;">
            🔍 تتبع الدفعة كاملة
          </button>
        </div>
      </div>

      <!-- Trace Results Timeline & Matrix -->
      <div id="trace-results-container">
        <div class="card" style="padding:40px; text-align:center; border-radius:14px; background:var(--bg-card); border:1px dashed var(--border-soft); color:var(--text-2);">
          <div style="font-size:36px; margin-bottom:8px;">📦</div>
          <b style="font-size:15px; color:var(--text-0);">محرك تتبع اللوت جاهز</b>
          <p style="margin:4px 0 0; font-size:12px;">ابحث بأي رقم تشغيلة لعرض شجرة التوريد والمبيعات وقائمة العملاء المستلمين</p>
        </div>
      </div>

    </div>
  `,await p())}async function p(){try{const[t,i,a]=await Promise.all([n("purchaseInvoices",[d("date","desc")]).catch(()=>[]),n("salesInvoices",[d("date","desc")]).catch(()=>[]),n("products").catch(()=>[])]);s=t,l=i,c=a}catch(t){console.error("loadTraceData error:",t)}}window.performLotSearch=t=>{t=(t||"").trim().toLowerCase();const i=document.getElementById("trace-results-container");if(!i)return;if(!t){i.innerHTML=`
      <div class="card" style="padding:40px; text-align:center; border-radius:14px; background:var(--bg-card); border:1px dashed var(--border-soft); color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">📦</div>
        <b style="font-size:15px; color:var(--text-0);">محرك تتبع اللوت جاهز</b>
        <p style="margin:4px 0 0; font-size:12px;">ابحث بأي رقم تشغيلة لعرض شجرة التوريد والمبيعات وقائمة العملاء المستلمين</p>
      </div>
    `;return}const a=[];s.forEach(e=>{(e.lines||[]).forEach(r=>{((r.batchNumber||"").toLowerCase().includes(t)||(r.productName||"").toLowerCase().includes(t))&&a.push({...e,matchedLine:r})})});const o=[];l.forEach(e=>{(e.lines||[]).forEach(r=>{((r.batchNumber||"").toLowerCase().includes(t)||(r.productName||"").toLowerCase().includes(t))&&o.push({...e,matchedLine:r})})}),i.innerHTML=`
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      
      <!-- Inbound Source Card -->
      <div class="card" style="padding:18px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
        <h4 style="margin:0 0 12px; font-size:14px; font-weight:800; color:var(--brand); display:flex; align-items:center; gap:8px;">
          <span>📥</span> <span>مصدر التوريد والاستلام (Purchases)</span>
        </h4>

        ${a.length?`
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${a.map(e=>`
              <div style="padding:10px 12px; background:var(--bg-2); border-radius:8px; border:1px solid var(--border-soft);">
                <div style="display:flex; justify-content:space-between;">
                  <b class="mono" style="color:var(--brand);">${e.number||e.id}</b>
                  <span class="mono" style="font-size:11.5px;">${e.date}</span>
                </div>
                <div style="font-size:12px; margin-top:4px;">المورد: <b>${e.supplierName}</b></div>
                <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">الصنف: ${e.matchedLine.productName} | الكمية: <b>${e.matchedLine.qty}</b> | لوت: <b>${e.matchedLine.batchNumber||"—"}</b></div>
              </div>
            `).join("")}
          </div>
        `:'<div style="color:var(--text-2); font-size:12px; padding:16px; text-align:center;">لم يتم العثور على فواتير شراء مطابقة</div>'}
      </div>

      <!-- Outbound Customers & Recall Card -->
      <div class="card" style="padding:18px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-size:14px; font-weight:800; color:#EF4444; display:flex; align-items:center; gap:8px;">
            <span>📤</span> <span>العملاء المستلمون وسحب المنتج (Recall)</span>
          </h4>
          <span class="badge" style="background:rgba(239,68,68,0.1); color:#EF4444;">${o.length} عملاء</span>
        </div>

        ${o.length?`
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${o.map(e=>`
              <div style="padding:10px 12px; background:var(--bg-2); border-radius:8px; border:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div class="font-bold" style="color:var(--text-0);">${e.customerName||"عميل نقدي"}</div>
                  <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">فاتورة: ${e.number||e.id} • الكمية: <b>${e.matchedLine.qty}</b></div>
                </div>
                <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="alert('جاري إشعار العميل لاسترداد الدفعة...')">📞 تواصل للاسترداد</button>
              </div>
            `).join("")}
          </div>
        `:'<div style="color:var(--text-2); font-size:12px; padding:16px; text-align:center;">لم يتم توزيع هذه الدفعة لعملاء بعد</div>'}
      </div>

    </div>
  `};export{u as render};
