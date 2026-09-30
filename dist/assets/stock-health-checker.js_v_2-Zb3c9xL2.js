import{d as l,C as p,A as z}from"./index-BfKDPs3D.js";import{query as w,collection as y,where as v,getDocs as k,updateDoc as g,doc as m,serverTimestamp as x}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let S=!1;function I(t){return{Piece:"حبة",Carton:"كرتون",Box:"بوكس",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[t]||t||"وحدة"}async function $(){if(!S){S=!0;try{const t=document.getElementById("stock-operations-alert-banner");let r=[];try{const o=w(y(l,`companies/${p}/salesInvoices`),v("stockStatus","==","pending_deduction"));r=(await k(o)).docs.map(i=>({id:i.id,...i.data()}))}catch(o){console.warn("[StockHealthChecker] sales query warn:",o.message)}let e=[];try{const o=w(y(l,`companies/${p}/stockTransfers`),v("stockStatus","in",["pending_transfer_out","failed_transfer_out","failed_transfer_in"]));e=(await k(o)).docs.map(i=>({id:i.id,...i.data()}))}catch(o){console.warn("[StockHealthChecker] transfer query warn:",o.message)}if(r.length===0&&e.length===0){t&&(t.style.display="none",t.innerHTML="",t.className="");return}const a=[];for(const o of e){const s=await T(o);s.isSafelyCancelled?g(m(l,`companies/${p}/stockTransfers`,o.id),{stockStatus:"cancelled",stockUpdatedAt:x()}).catch(()=>{}):s.isFullyExecuted?g(m(l,`companies/${p}/stockTransfers`,o.id),{stockStatus:"completed",stockUpdatedAt:x()}).catch(()=>{}):s.isDeductedInTransit?g(m(l,`companies/${p}/stockTransfers`,o.id),{stockStatus:"in_transit_deducted",stockUpdatedAt:x()}).catch(()=>{}):a.push(o)}const n=[];for(const o of r)(await N(o)).hasSaleOut?g(m(l,`companies/${p}/salesInvoices`,o.id),{stockStatus:"completed",stockUpdatedAt:x()}).catch(()=>{}):n.push(o);const c=n.length+a.length;if(c===0){t&&(t.style.display="none",t.innerHTML="",t.className="");return}if(!t)return;t.className="stock-operations-alert-box",t.style.display="flex",t.innerHTML=`
      <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:280px;">
        <div class="alert-icon-box">
          ⚠️
        </div>
        <div>
          <div class="alert-title">
            تنبيه حركات مخزنية معلقة (${c} عملية بحاجة للمراجعة والمزامنة)
          </div>
          <div class="alert-desc">
            ${n.length>0?`• يوجد <strong style="color:inherit; font-weight:800;">${n.length}</strong> فواتير مبيعات لم تكتمل مزامنتها. `:""}
            ${a.length>0?`• يوجد <strong style="color:inherit; font-weight:800;">${a.length}</strong> أوامر تحويل مخزني بحاجة للتأكد والمزامنة.`:""}
          </div>
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <button class="alert-btn" onclick="window.openStockHealthModal()" title="انقر لعرض التفاصيل والشرح وحالة كل عملية قبل المزامنة">
          <span>📋</span> <span>عرض التفاصيل والشرح والمزامنة</span>
        </button>
      </div>
    `,window._pendingStockIssues={sales:n,transfers:a}}catch(t){console.warn("[StockHealthChecker] Check error:",t.message)}finally{S=!1}}}async function T(t){try{const r=t.number||"",e=w(y(l,`companies/${p}/stockTransactions`),v("documentNumber","==",r));let n=(await k(e)).docs.map(d=>d.data());if(n.length===0&&t.id){const d=w(y(l,`companies/${p}/stockTransactions`),v("sourceId","==",t.id));n=(await k(d)).docs.map(f=>f.data())}const c=n.some(d=>d.type==="transfer_out"),o=n.some(d=>d.type==="transfer_in"),s=n.some(d=>d.type==="transfer_cancel"),i=t.status==="received"&&c&&o||c&&o,b=t.status==="cancelled"||s,h=t.status==="in_transit"&&c;return{txsCount:n.length,hasOut:c,hasIn:o,hasCancel:s,isFullyExecuted:i,isSafelyCancelled:b,isDeductedInTransit:h}}catch(r){return console.warn("[StockHealthChecker] inspect transfer err:",r),{error:r.message}}}async function N(t){try{const r=t.invoiceNumber||t.number||t.id,e=w(y(l,`companies/${p}/stockTransactions`),v("documentNumber","==",r)),n=(await k(e)).docs.map(o=>o.data());return{hasSaleOut:n.some(o=>o.type==="sale_out"),txsCount:n.length}}catch(r){return console.warn("[StockHealthChecker] inspect sale err:",r),{error:r.message}}}window.openStockHealthModal=async()=>{const t=window._pendingStockIssues||{sales:[],transfers:[]};let r=document.getElementById("stock-health-modal");r&&r.remove();const e=document.createElement("div");e.id="stock-health-modal",e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.backgroundColor="rgba(15, 23, 42, 0.7)",e.style.backdropFilter="blur(4px)",e.style.zIndex="99999",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.direction="rtl",e.innerHTML=`
    <div style="background:var(--bg-1,#ffffff); color:var(--text-0,#0f172a); border:1px solid var(--border,#cbd5e1); border-radius:16px; max-width:820px; width:95%; padding:35px; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.3);">
      <div style="font-size:36px; animation:spin 1s infinite linear; margin-bottom:14px;">⏳</div>
      <h3 style="margin:0 0 8px; font-size:18px; font-weight:800;">جارٍ الفحص الذكي للعمليات المخزنية المعلقة…</h3>
      <p style="margin:0; font-size:13px; color:var(--text-muted,#64748b);">يتم التحقق من الحركات الفعلية في كروت الأصناف للتأكد من عدم تكرار الخصم…</p>
    </div>
  `,document.body.appendChild(e);const a=await Promise.all((t.transfers||[]).map(s=>T(s))),n=await Promise.all((t.sales||[]).map(s=>N(s))),c=(t.transfers||[]).map((s,i)=>{const b=a[i]||{},h=(s.lines||[]).map(f=>`
      <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed var(--border-soft,#e2e8f0); font-size:12px;">
        <span style="font-weight:700;">• ${f.productName||"صنف"}</span>
        <span class="mono font-bold" style="color:var(--brand,#4f46e5);">${f.qty} ${I(f.selectedUnit||f.unit)}</span>
      </div>
    `).join("");let d="",u="";return b.isSafelyCancelled?(d=`
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#334155; line-height:1.6;">
          <div style="font-weight:800; color:#475569; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>🚫</span> <span>التشخيص الفعلي: أمر التحويل ملغى ومسترجع المخزون مسبقاً</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم إلغاء أمر التحويل مسبقاً واسترجاع كمياته بالكامل إلى المستودع المصدر (${s.fromWarehouseName||"المستودع المصدر"}). سبب ظهور التنبيه هو بقاء علامة المزامنة السحابية معلقة. <strong>الضغط على الزر سيؤكد إغلاق التنبيه نهائياً دون المساس بأي رصيد.</strong>
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-tr-${s.id}" onclick="window.healSingleTransferStock('${s.id}')" style="background:#475569; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ إغلاق التنبيه
        </button>
      `):b.isFullyExecuted?(d=`
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#14532d; line-height:1.6;">
          <div style="font-weight:800; color:#15803d; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>✅</span> <span>التشخيص الفعلي: الحركات المخزنية منفذة ومكتملة بالكامل</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم التأكد من سجلات المخازن: الكميات <strong>مخصومة فعلياً</strong> من المستودع المصدر (${s.fromWarehouseName||"المصدر"}) و<strong>مودعة فعلياً</strong> في المستودع المستلم (${s.toWarehouseName||"المستلم"}). سبب التنبيه هو تعذر تحديث علامة المزامنة السحابية فقط. <strong>الضغط على الزر سيعتمد إغلاق التنبيه بأمان 100% دون أي تكرار للخصم.</strong>
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-tr-${s.id}" onclick="window.healSingleTransferStock('${s.id}')" style="background:#15803d; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ اعتماد إغلاق التنبيه (آمن 100%)
        </button>
      `):b.isDeductedInTransit?(d=`
        <div style="background:#fffbeb; border:1.5px solid #fcd34d; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#78350f; line-height:1.6;">
          <div style="font-weight:800; color:#b45309; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>🚚</span> <span>التشخيص الفعلي: البضاعة قيد النقل (مخصومة من المصدر وبانتظار الاستلام)</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم خصم البضاعة من (${s.fromWarehouseName}) وهي قيد النقل للوجهة (${s.toWarehouseName}). الضغط على الزر سيثبت حالة المستند كـ "قيد النقل" ليزول التنبيه بانتظار تأكيد استلامها.
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-tr-${s.id}" onclick="window.healSingleTransferStock('${s.id}')" style="background:#b45309; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          🚚 تثبيت قيد النقل
        </button>
      `):(d=`
        <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#7f1d1d; line-height:1.6;">
          <div style="font-weight:800; color:#991b1b; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>⚠️</span> <span>التشخيص الفعلي: بضاعة معلقة لم يتم خصمها من المصدر</span>
          </div>
          <div>
            <strong>الشرح:</strong> انقطع الاتصال أثناء حفظ التحويل ولم تُسجل حركة الخصم في المستودع المصدر (${s.fromWarehouseName}). <strong>الضغط على الزر سيقوم بتنفيذ الخصم الفعلي بدقة وتحديث الأرصدة.</strong>
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-tr-${s.id}" onclick="window.healSingleTransferStock('${s.id}')" style="background:#dc2626; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ⚡ تنفيذ الخصم والمزامنة الآن
        </button>
      `),`
      <div style="background:var(--bg-0,#f8fafc); border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-soft,#e2e8f0); padding-bottom:10px;">
          <div>
            <span style="font-weight:900; font-size:14.5px; color:var(--text-0,#0f172a);">📦 أمر تحويل: ${s.number||s.id}</span>
            <span style="font-size:12px; color:var(--text-muted,#64748b); margin-right:10px;">📅 ${s.date||""}</span>
            <span style="font-size:11px; padding:2px 8px; border-radius:6px; background:#e0e7ff; color:#3730a3; font-weight:700; margin-right:6px;">
              حالة المستند: ${s.status==="received"?"تم الاستلام":s.status==="cancelled"?"ملغى":"قيد النقل"}
            </span>
          </div>
          <div>
            ${u}
          </div>
        </div>

        <div style="font-size:12.5px; color:var(--text-2,#334155); margin-top:8px;">
          <strong>المسار:</strong> من <span style="color:#0369a1; font-weight:700;">${s.fromWarehouseName||"المستودع المصدر"}</span> ➔ إلى <span style="color:#059669; font-weight:700;">${s.toWarehouseName||"المستودع المستلم"}</span>
          ${s.createdByName?` <span style="color:var(--text-muted,#64748b); font-size:11.5px;">(أنشئ بواسطة: ${s.createdByName})</span>`:""}
        </div>

        <div style="margin-top:8px; background:var(--bg-1,#ffffff); border:1px solid var(--border-soft,#e2e8f0); border-radius:8px; padding:8px 12px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted,#64748b); margin-bottom:4px;">الأصناف المحولة:</div>
          ${h||'<div style="font-size:12px; color:#94a3b8;">لا توجد أصناف</div>'}
        </div>

        ${d}
      </div>
    `}).join(""),o=(t.sales||[]).map((s,i)=>{const b=n[i]||{},h=(s.lines||[]).map(f=>`${f.name||f.productName||"صنف"} (${f.qty} ${I(f.selectedUnit||f.unit)})`).join(" ، ");let d="",u="";return b.hasSaleOut?(d=`
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#14532d; line-height:1.6;">
          <div style="font-weight:800; color:#15803d; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>✅</span> <span>التشخيص الفعلي: بضاعة الفاتورة مخصومة بالفعل من كرت الصنف</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم فحص سجلات المخزن: أصناف هذه الفاتورة <strong>مخصومة فعلياً</strong> من المستودع/السيارة. سبب التنبيه هو تعذر تحديث علامة المزامنة السحابية فقط. <strong>الضغط على الزر سيعتمد المزامنة بأمان 100% دون تكرار الخصم.</strong>
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-sale-${s.id}" onclick="window.healSingleSaleStock('${s.id}')" style="background:#15803d; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ اعتماد إغلاق التنبيه
        </button>
      `):(d=`
        <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#7f1d1d; line-height:1.6;">
          <div style="font-weight:800; color:#991b1b; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>⚠️</span> <span>التشخيص الفعلي: فاتورة مبيعات معلقة لم يكتمل خصمها</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم حفظ الفاتورة لكن تعذر خصم كمياتها من المستودع/السيارة بسبب ضعف الاتصال أثناء البيع. <strong>الضغط على الزر سيقوم بتنفيذ الخصم الآن بدقة.</strong>
          </div>
        </div>
      `,u=`
        <button class="btn btn-sm" id="btn-sync-sale-${s.id}" onclick="window.healSingleSaleStock('${s.id}')" style="background:#dc2626; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ⚡ تنفيذ الخصم والمزامنة الآن
        </button>
      `),`
      <div style="background:var(--bg-0,#f8fafc); border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-soft,#e2e8f0); padding-bottom:10px;">
          <div>
            <span style="font-weight:900; font-size:14.5px; color:var(--text-0,#0f172a);">🧾 فاتورة مبيعات: ${s.invoiceNumber||s.number||s.id}</span>
            <span style="font-size:12px; color:var(--text-muted,#64748b); margin-right:10px;">📅 ${s.date||""}</span>
          </div>
          <div>
            ${u}
          </div>
        </div>

        <div style="font-size:12.5px; color:var(--text-2,#334155); margin-top:8px;">
          <strong>العميل:</strong> ${s.customerName||"عميل نقدي"} ${s.repName?`| <strong>المندوب:</strong> ${s.repName}`:""}
        </div>

        <div style="margin-top:8px; font-size:12px; color:#0284c7; background:var(--bg-1,#ffffff); border:1px solid var(--border-soft,#e2e8f0); border-radius:8px; padding:8px 12px;">
          <strong>الأصناف:</strong> ${h||"لا توجد بنود"}
        </div>

        ${d}
      </div>
    `}).join("");e.innerHTML=`
    <div style="background:var(--bg-1,#ffffff); color:var(--text-0,#0f172a); border:1px solid var(--border,#cbd5e1); border-radius:16px; max-width:820px; width:95%; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
      
      <!-- Modal Header -->
      <div style="padding:16px 22px; border-bottom:1px solid var(--border,#e2e8f0); display:flex; justify-content:space-between; align-items:center; background:var(--bg-0,#f8fafc);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">🛡️</span>
          <div>
            <h3 style="margin:0; font-size:16.5px; font-weight:900; color:var(--text-0,#0f172a);">تشخيص وتفاصيل العمليات المخزنية المعلقة</h3>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-muted,#64748b);">فحص حالة كروت الأصناف والتأكد من الحركات الفعلية قبل المزامنة لمنع أي تكرار</p>
          </div>
        </div>
        <button style="background:none; border:none; color:var(--text-muted,#64748b); font-size:22px; font-weight:700; cursor:pointer; padding:4px 8px; border-radius:8px;" onclick="document.getElementById('stock-health-modal').remove()">✕</button>
      </div>

      <!-- Modal Body -->
      <div style="padding:20px 22px; overflow-y:auto; flex:1;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:12px 16px; margin-bottom:18px; font-size:12.5px; color:#1e40af; line-height:1.5;">
          💡 <strong>نظام الحماية الذكي:</strong> تم فحص قاعدة البيانات للتأكد مما إذا كانت الكميات مخصومة أو مستلمة بالفعل في سجلات كرت الصنف، لتتمكن من اعتماد المزامنة أو إغلاق التنبيهات بأمان تام ودون أي قلق من تكرار الحركات.
        </div>

        ${c?`<div style="font-weight:900; font-size:14px; color:#d97706; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span>🔄</span> <span>أوامر تحويل مخزني (${t.transfers.length})</span></div>${c}`:""}
        ${o?`<div style="font-weight:900; font-size:14px; color:#dc2626; margin-top:14px; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span>🧾</span> <span>فواتير مبيعات معلقة (${t.sales.length})</span></div>${o}`:""}
      </div>

      <!-- Modal Footer -->
      <div style="padding:14px 22px; border-top:1px solid var(--border,#e2e8f0); display:flex; justify-content:space-between; align-items:center; background:var(--bg-0,#f8fafc); flex-wrap:wrap; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('stock-health-modal').remove()" style="font-weight:700; padding:8px 18px; border-radius:8px;">إغلاق النافذة</button>
        <button class="btn btn-primary btn-sm" id="btn-heal-all-master" onclick="window.healAllPendingStockIssues()" style="background:#4f46e5; font-weight:800; padding:8px 20px; border-radius:8px;">
          ⚡ معالجة وتحديث كافة العمليات المعلقة (فحص ذكي وآمن)
        </button>
      </div>

    </div>
  `};window.healSingleTransferStock=async t=>{const e=(window._pendingStockIssues||{transfers:[]}).transfers.find(n=>n.id===t);if(!e)return;const a=document.getElementById(`btn-sync-tr-${t}`);a&&(a.disabled=!0,a.textContent="جاري المعالجة…");try{const n=await T(e);if(n.isSafelyCancelled)await g(m(l,`companies/${p}/stockTransfers`,t),{stockStatus:"cancelled",stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تم إغلاق تنبيه أمر التحويل الملغى ${e.number||t}`,"success");else if(n.isFullyExecuted)await g(m(l,`companies/${p}/stockTransfers`,t),{stockStatus:"completed",stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تم اعتماد المزامنة للتحويل ${e.number||t} بنجاح دون المساس بالأرصدة`,"success");else if(n.isDeductedInTransit)await g(m(l,`companies/${p}/stockTransfers`,t),{stockStatus:"in_transit_deducted",stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تم تثبيت حالة قيد النقل للتحويل ${e.number||t}`,"success");else{const c=[],o=e.fromWarehouseId;for(const i of e.lines||[]){const b=i.altUnit&&i.unitFactor>1&&i.selectedUnit===i.altUnit?i.unitFactor:1,h=i.effectiveQty!==void 0?i.effectiveQty:(parseFloat(i.qty)||0)*b;n.hasOut||c.push({warehouseId:o,productId:i.productId,qtyDelta:-h,metadata:{date:e.date||new Date().toISOString().slice(0,10),type:"transfer_out",sourceType:"stockTransfer",sourceId:e.id,documentNumber:e.number,productName:i.productName,notes:`مزامنة تحويل معلق إلى ${e.toWarehouseName} (${i.qty})`}})}c.length>0&&await z(c);const s=e.status==="received"?"completed":"in_transit_deducted";await g(m(l,`companies/${p}/stockTransfers`,t),{stockStatus:s,stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تمت مزامنة وخصم مخزون أمر التحويل ${e.number||t} بنجاح`,"success")}await $(),document.getElementById("stock-health-modal")&&window.openStockHealthModal()}catch(n){window.showToast&&window.showToast(`❌ فشلت المزامنة: ${n.message}`,"error"),a&&(a.disabled=!1,a.textContent="⚡ إعادة المحاولة")}};window.healSingleSaleStock=async t=>{const e=(window._pendingStockIssues||{sales:[]}).sales.find(n=>n.id===t);if(!e)return;const a=document.getElementById(`btn-sync-sale-${t}`);a&&(a.disabled=!0,a.textContent="جاري الفحص…");try{if((await N(e)).hasSaleOut)await g(m(l,`companies/${p}/salesInvoices`,t),{stockStatus:"completed",stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تم اعتماد المزامنة للفاتورة ${e.invoiceNumber||e.number||t} دون تكرار الخصم`,"success");else{const c=(e.lines||[]).filter(o=>o.productId&&o.qty).map(o=>{const s=o.altUnit&&o.unitFactor>1&&o.selectedUnit===o.altUnit&&parseFloat(o.unitFactor)||1,i=(parseFloat(o.qty)||0)*s;return{warehouseId:e.warehouseId,productId:o.productId,qtyDelta:-i,metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:e.invoiceNumber||e.number||e.id,documentNumber:e.invoiceNumber||e.number||e.id,invoiceNumber:e.invoiceNumber||e.number||e.id,allowNegative:!0,productName:o.name||o.productName||"",notes:`خصم ذاتي معلق — فاتورة ${e.invoiceNumber||e.number||e.id}`}}});c.length>0&&await z(c),await g(m(l,`companies/${p}/salesInvoices`,t),{stockStatus:"completed",stockUpdatedAt:x()}),window.showToast&&window.showToast(`✅ تم خصم المخزون بنجاح للفاتورة ${e.invoiceNumber||e.number||e.id}`,"success")}await $(),document.getElementById("stock-health-modal")&&window.openStockHealthModal()}catch(n){window.showToast&&window.showToast(`❌ فشلت المزامنة: ${n.message}`,"error"),a&&(a.disabled=!1,a.textContent="⚡ إعادة المحاولة")}};window.healAllPendingStockIssues=async()=>{const t=document.getElementById("btn-heal-all-master");t&&(t.disabled=!0,t.textContent="جارٍ الفحص والمعالجة…");const r=window._pendingStockIssues||{sales:[],transfers:[]};for(const a of r.sales||[])await window.healSingleSaleStock(a.id);for(const a of r.transfers||[])await window.healSingleTransferStock(a.id);const e=document.getElementById("stock-health-modal");e&&e.remove(),window.showToast&&window.showToast("✅ تمت معالجة وتحديث كافة العمليات المعلقة بأمان تام!","success")};window.checkStockOperationsHealth=$;export{$ as checkStockOperationsHealth};
