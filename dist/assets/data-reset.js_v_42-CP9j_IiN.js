const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BgjRa7f-.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{_ as $,C as L,d as i}from"./index-BgjRa7f-.js";import{collection as m,getDocs as u,query as _,limit as B,writeBatch as h}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const I=["journalEntries","salesInvoices","purchaseInvoices","salesReturns","purchaseReturns","stockByWarehouse","stockTransactions","cashTransactions","bankTransactions","expenses","quotations","cheques","purchaseRequests","products"];async function q(a){a.innerHTML=M(),A()}function M(){return`
  <div class="page-content" style="max-width:700px;margin:0 auto;">
    <div class="page-header" style="margin-bottom:24px;">
      <h1 class="page-title" style="color:var(--danger);">🗑️ تصفير البيانات وقاعدة البيانات</h1>
      <p class="page-subtitle">
        يحذف هذا الأمر جميع الفواتير، القيود، والأصناف بالكامل،
        مع <strong>الإبقاء الكامل</strong> على الفئات والمستودعات والعملاء والموردين وشجرة الحسابات والتهيئة.
      </p>
    </div>

    <div class="card" style="border:2px solid var(--danger);border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:var(--danger);margin-bottom:16px;">⚠️ البيانات التي ستُحذف:</h3>
      <ul style="line-height:2;color:var(--text-1);padding-right:20px;">
        <li>📋 فواتير المبيعات وفواتير الشراء ومردوداتها</li>
        <li>📒 القيود المحاسبية اليومية بالكامل</li>
        <li>🏷️ كتالوج الأصناف (المنتجات) بالكامل</li>
        <li>📦 أرصدة المخازن وحركات المخزون</li>
        <li>💰 حركات الصناديق النقدية والبنوك</li>
        <li>🧾 المصروفات وعروض الأسعار والشيكات</li>
      </ul>
    </div>

    <div class="card" style="border:2px solid var(--success-text,#16a34a);border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:var(--success-text,#16a34a);margin-bottom:16px;">✅ البيانات التي ستُبقى:</h3>
      <ul style="line-height:2;color:var(--text-1);padding-right:20px;">
        <li>🏷️ فئات الأصناف والمستودعات والمخازن</li>
        <li>🤝 الشركاء (العملاء + الموردين)</li>
        <li>📊 شجرة الحسابات وقوائم الأسعار</li>
        <li>👥 مندوبي المبيعات والموظفين</li>
        <li>🏦 الصناديق والبنوك (يُعاد رصيدها لصفر)</li>
        <li>⚙️ إعدادات الشركة والمستخدمين</li>
      </ul>
    </div>

    <div style="background:var(--bg-2);border-radius:8px;padding:16px;margin-bottom:24px;">
      <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-weight:600;">
        <input type="checkbox" id="reset-confirm-check" style="width:18px;height:18px;accent-color:var(--danger);">
        أفهم أن هذا الإجراء <strong style="color:var(--danger);">لا يمكن التراجع عنه</strong> وأريد المتابعة
      </label>
    </div>

    <div style="text-align:center;">
      <button id="reset-btn" class="btn" disabled
        style="background:var(--danger);color:#fff;padding:14px 40px;font-size:16px;font-weight:700;border-radius:8px;opacity:0.5;cursor:not-allowed;">
        🗑️ تصفير البيانات الآن
      </button>
    </div>

    <div id="reset-progress" class="hidden" style="margin-top:24px;">
      <div style="background:var(--bg-2);border-radius:8px;padding:20px;">
        <div id="reset-progress-text" style="font-size:14px;color:var(--text-2);margin-bottom:12px;">جارٍ التصفير...</div>
        <div style="background:var(--bg-3);border-radius:4px;height:8px;overflow:hidden;">
          <div id="reset-progress-bar" style="background:var(--danger);height:100%;width:0%;transition:width 0.3s;"></div>
        </div>
        <div id="reset-log" style="margin-top:12px;max-height:200px;overflow-y:auto;font-family:monospace;font-size:12px;color:var(--text-2);"></div>
      </div>
    </div>

    <div id="reset-done" class="hidden" style="margin-top:24px;text-align:center;padding:24px;background:var(--bg-2);border-radius:12px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h3 style="color:var(--success-text,#16a34a);">تم التصفير بنجاح!</h3>
      <p style="color:var(--text-2);">البرنامج الآن جاهز للعمل من جديد</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:16px;">🔄 تحديث الصفحة</button>
    </div>
  </div>`}function A(){const a=document.getElementById("reset-confirm-check"),n=document.getElementById("reset-btn");if(console.log("[DataReset] attachEvents initialized:",{check:a,btn:n}),!a||!n){console.error("[DataReset] Checkbox or Button elements not found!");return}const p=()=>{const r=a.checked;console.log("[DataReset] Confirm checkbox state:",r),n.disabled=!r,n.style.opacity=r?"1":"0.5",n.style.cursor=r?"pointer":"not-allowed"};a.addEventListener("change",p),a.addEventListener("click",p),n.addEventListener("click",r=>{console.log("[DataReset] Reset button clicked!"),r.preventDefault(),O().catch(c=>{console.error("[DataReset] performReset uncaught error:",c)})})}async function O(){console.log("[DataReset] performReset execution started...");const a=document.getElementById("reset-btn"),n=document.getElementById("reset-progress"),p=document.getElementById("reset-progress-bar"),r=document.getElementById("reset-progress-text"),c=document.getElementById("reset-log"),b=document.getElementById("reset-done");if(!a||!n||!p||!r||!c||!b){console.error("[DataReset] One or more progress/log elements not found!"),alert("حدث خطأ في تحميل عناصر الصفحة");return}a.disabled=!0,n.classList.remove("hidden"),b.classList.add("hidden"),c.innerHTML="";const t=e=>{console.log(`[DataReset Log] ${e}`),c.innerHTML+=`<div style="margin-bottom:4px;">${e}</div>`,c.scrollTop=c.scrollHeight},g=(e,s)=>{p.style.width=e+"%",r.textContent=s};let l=L;try{const{COMPANY_ID:e}=await $(async()=>{const{COMPANY_ID:s}=await import("./index-BgjRa7f-.js").then(v=>v.S);return{COMPANY_ID:s}},__vite__mapDeps([0,1]));e&&(l=e)}catch(e){console.warn("[DataReset] Failed to load live COMPANY_ID, falling back:",e)}console.log("[DataReset] Resetting data for company ID:",l),t(`🚀 بدء عملية التصفير للشركة: ${l}...`);try{const e=I.length+3;let s=0;for(const o of I){g(Math.round(s/e*100),`جارٍ حذف: ${o}...`),t(`⌛ جارٍ مسح مجموعة: ${o}...`);const d=m(i,`companies/${l}/${o}`);let w=0;for(;;){const k=await u(_(d,B(400)));if(k.empty)break;const R=h(i);k.docs.forEach(C=>R.delete(C.ref)),await R.commit(),w+=k.docs.length}t(`✅ ${o}: تم حذف ${w} سجل`),s++}g(Math.round(s/e*100),"إعادة رصيد الصناديق لصفر..."),t("⌛ جارٍ تصفير أرصدة الصناديق...");const v=m(i,`companies/${l}/cashBoxes`),x=await u(v);if(x.empty)t("ℹ️ لا توجد صناديق نقدية لتصفيرها");else{const o=h(i);x.docs.forEach(d=>o.update(d.ref,{balance:0})),await o.commit(),t(`✅ تم تصفير أرصدة ${x.docs.length} صندوق نقدي`)}s++,g(Math.round(s/e*100),"إعادة رصيد البنوك لصفر..."),t("⌛ جارٍ تصفير أرصدة الحسابات البنكية...");const D=m(i,`companies/${l}/bankAccounts`),y=await u(D);if(y.empty)t("ℹ️ لا توجد حسابات بنكية لتصفيرها");else{const o=h(i);y.docs.forEach(d=>o.update(d.ref,{balance:0})),await o.commit(),t(`✅ تم تصفير أرصدة ${y.docs.length} حساب بنكي`)}s++,g(Math.round(s/e*100),"إعادة رصيد شجرة الحسابات لصفر..."),t("⌛ جارٍ تصفير أرصدة شجرة الحسابات...");const E=m(i,`companies/${l}/chartOfAccounts`),f=await u(E);if(f.empty)t("ℹ️ لا توجد حسابات في شجرة الحسابات لتصفيرها");else{const o=h(i);f.docs.forEach(d=>o.update(d.ref,{balance:0,totalDebit:0,totalCredit:0})),await o.commit(),t(`✅ تم تصفير أرصدة ${f.docs.length} حساب في شجرة الحسابات`)}s++,g(100,"اكتمل التصفير!"),t("🎉 تم تصفير كل البيانات التشغيلية وقاعدة البيانات بنجاح"),b.classList.remove("hidden"),a.style.display="none"}catch(e){t(`❌ خطأ: ${e.message}`),r.textContent="حدث خطأ أثناء التصفير",r.style.color="var(--danger)",a.disabled=!1}}export{q as render};
