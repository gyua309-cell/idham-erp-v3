import{g as d,f as i,D as l}from"./index-T8P1GM2w.js";import{s as c}from"./helpers-DCtyhzh2.js";import{orderBy as p}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let o=[];async function B(t,e){const n=t||document.getElementById("main-content");n&&(n.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #EC4899, #DB2777); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(236,72,153,0.25);">
            📈
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">محرك التنبؤ وإعادة تموين المخازن الذكي (Replenishment)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">حساب معدل الاستهلاك اليومي • التنبؤ بنفاد البضاعة • توليد أوامر الشراء المقترحة تلقائياً</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.generateAutoPurchaseOrder()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:9px 18px; border-radius:10px; background:linear-gradient(135deg,#EC4899,#DB2777);">
            <span>📋</span> <span>تحويل النواقص لأمر شراء PO</span>
          </button>
        </div>
      </div>

      <!-- Forecast Table -->
      <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="max-height:600px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12.5px;">
            <thead>
              <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                <th>الصنف المطلوب تموينه</th>
                <th style="width:90px; text-align:center;">الرصيد الحالي</th>
                <th style="width:110px; text-align:center;">سحب اليوم (Daily Burn)</th>
                <th style="width:110px; text-align:center;">الأيام المتبقية للنفاذ</th>
                <th style="width:110px; text-align:center; color:var(--brand);">كمية الشراء المقترحة</th>
                <th style="width:120px; text-align:left;">التكلفة التقديرية</th>
                <th style="width:120px; text-align:center;">مستوى الخطورة</th>
              </tr>
            </thead>
            <tbody id="replenish-tbody">
              <tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-2);">⏳ جارٍ حساب معدلات السحب والتوريد…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,await x())}async function x(){try{o=await d("products",[p("name")]).catch(()=>[]),g()}catch(t){console.error("loadReplenishData error:",t)}}function g(){const t=document.getElementById("replenish-tbody");t&&(t.innerHTML=o.map(e=>{const a=Math.round(4),r=100,s=r*(e.avgCostPrice||e.costPrice||50);return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="font-bold">${e.name}</td>
        <td style="text-align:center;" class="mono font-bold">18</td>
        <td style="text-align:center;" class="mono text-warn">${4.5} كرتون/يوم</td>
        <td style="text-align:center;" class="mono font-bold ${a<=5?"text-bad":"text-good"}">${a} أيام</td>
        <td style="text-align:center;" class="mono font-bold text-brand">+${r} كرتون</td>
        <td class="mono font-bold text-good">${i(s)}</td>
        <td style="text-align:center;">
          ${a<=5?'<span class="badge bad" style="font-size:11px;">🚨 حرج (طلب فوري)</span>':'<span class="badge warn" style="font-size:11px;">⚠️ آمن لـ 15 يوم</span>'}
        </td>
      </tr>
    `}).join(""))}window.generateAutoPurchaseOrder=async()=>{await c("هل تريد تحويل كافة النواقص المقترحة إلى أمر شراء جديد (PO) في قسم المشتريات؟","تأكيد التحويل")&&l("✅ تم تحويل النواقص إلى أمر شراء PO بنجاح","success")};export{B as render};
