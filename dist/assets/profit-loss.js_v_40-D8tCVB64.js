import{t as H,C as B,g as Y,f,s as J}from"./index-CF9GFeRJ.js";import{e as K}from"./excel-DM5XZHtQ.js";import{getDocs as N}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let c={sales:null,returns:null,accounts:null,jes:null,loadedAt:null},F=null;async function lt(r,u){const m=J(),x=H();r.innerHTML=`
    <div class="filterbar" style="display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:12px 16px; background:var(--bg-1); border-bottom:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2);">من</label>
          <input type="date" id="pl-from" value="${m}" class="form-input" style="padding:5px 8px; font-size:13px; border-radius:6px;" />
        </div>
        <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2);">إلى</label>
          <input type="date" id="pl-to" value="${x}" class="form-input" style="padding:5px 8px; font-size:13px; border-radius:6px;" />
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="pl-presets" style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="today" onclick="setPlPreset('today')" style="font-size:11px; padding:4px 8px;">اليوم</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn active" data-preset="month" onclick="setPlPreset('month')" style="font-size:11px; padding:4px 8px; font-weight:700; background:var(--surface-2);">هذا الشهر</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="last_month" onclick="setPlPreset('last_month')" style="font-size:11px; padding:4px 8px;">الشهر السابق</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="quarter" onclick="setPlPreset('quarter')" style="font-size:11px; padding:4px 8px;">الربع الحالي</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="year" onclick="setPlPreset('year')" style="font-size:11px; padding:4px 8px;">هذه السنة</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="all" onclick="setPlPreset('all')" style="font-size:11px; padding:4px 8px;">كل الفترات</button>
      </div>

      <!-- Action buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <span id="pl-loading-badge" style="display:none; font-size:11px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportProfitLossExcel()" style="font-size:12px; font-weight:600;"><i class="fas fa-file-excel"></i> تصدير Excel</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.print()" style="font-size:12px; font-weight:600;"><i class="fas fa-print"></i> طباعة</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="loadProfitLoss(true)" style="font-size:12px; font-weight:600;"><i class="fas fa-sync-alt"></i> تحديث</button>
      </div>
    </div>

    <div class="page-content" style="padding:24px 16px;">
      <div class="page-header" style="text-align:center; margin-bottom:24px;">
        <h1 class="page-title" style="font-size:24px; font-weight:800; margin-bottom:6px;">قائمة الأرباح والخسائر (Income Statement)</h1>
        <p class="page-subtitle" id="pl-period" style="font-size:13px; color:var(--text-2); font-weight:600;">الفترة من ${m} إلى ${x}</p>
      </div>

      <div style="max-width:850px; margin:0 auto;">
        <!-- Net Profit KPI Banner -->
        <div class="card mb-24" style="background:linear-gradient(135deg, var(--surface-1), var(--bg-1)); border:1.5px solid var(--border); border-radius:14px; box-shadow:var(--shadow-sm);">
          <div class="card-body" style="padding:28px; text-align:center;">
            <div class="section-label mb-8" style="font-size:13px; font-weight:700; color:var(--text-2); letter-spacing:0.5px;">صافي الربح / الخسارة التشغيلية</div>
            <div class="mono font-bold" style="font-size:38px; line-height:1.2;" id="pl-net-profit">—</div>
            <div style="display:flex; justify-content:center; gap:20px; margin-top:12px; font-size:12px; color:var(--text-2);">
              <span id="pl-profit-margin" style="font-weight:700;">هامش صافي الربح: 0%</span>
              <span>•</span>
              <span id="pl-gross-margin" style="font-weight:700;">هامش مجمل الربح: 0%</span>
            </div>
          </div>
        </div>

        <!-- Income Statement Financial Table -->
        <div class="card" style="border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden;">
          <div class="card-header" style="padding:14px 18px; background:var(--surface-1); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0;">تفاصيل الحسابات الختامية</h3>
            <span id="pl-stats-badge" style="font-size:11px; color:var(--text-3); font-weight:600;"></span>
          </div>
          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <tbody>
                <!-- REVENUE SECTION -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-indigo" style="padding:10px 16px; font-size:13px;">1. الإيرادات والمبيعات</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">إجمالي إيراد المبيعات (بدون VAT)</td>
                  <td class="mono font-bold text-right" id="pl-gross-sales" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px;" class="text-bad">يخصم: مردودات المبيعات والخصومات</td>
                  <td class="mono text-bad text-right" id="pl-sales-returns" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(16, 185, 129, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">صافي المبيعات (Net Revenue)</td>
                  <td class="mono font-bold text-good text-right" id="pl-net-sales" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- COST OF GOODS SOLD -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-warn" style="padding:10px 16px; font-size:13px;">2. تكلفة المبيعات (COGS)</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">تكلفة البضاعة المباعة (المشتريات/المخزون)</td>
                  <td class="mono text-right" id="pl-cogs" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(99, 102, 241, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">مجمل الربح (Gross Profit)</td>
                  <td class="mono font-bold text-indigo text-right" id="pl-gross-profit" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- OPERATING EXPENSES -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-bad" style="padding:10px 16px; font-size:13px;">3. المصروفات التشغيلية والعمومية</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">مصروفات عُملات المناديب والتوزيع</td>
                  <td class="mono text-right" id="pl-exp-comm" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">مصروفات رواتب وإيجارات ومصروفات عامة</td>
                  <td class="mono text-right" id="pl-exp-general" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(239, 68, 68, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">إجمالي المصروفات التشغيلية</td>
                  <td class="mono font-bold text-bad text-right" id="pl-total-expenses" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- NET PROFIT -->
                <tr style="background:var(--surface-1); border-top:2px solid var(--border);">
                  <td class="font-heading font-bold" style="padding:14px 16px; font-size:15px; color:var(--text-1);">صافي الربح / (الخسارة) قبل الضريبة</td>
                  <td class="mono font-bold text-right" style="padding:14px 16px; font-size:17px;" id="pl-final-net">0.00 ر.س</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detailed Operating Expenses Drill-down -->
        <div class="card mt-24" id="pl-exp-breakdown-card" style="border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; margin-top:20px;">
          <div class="card-header" style="padding:12px 18px; background:var(--surface-1); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <h4 style="font-size:14px; font-weight:700; margin:0; color:var(--text-1);"><i class="fas fa-list-ul"></i> تفصيل حسابات المصروفات الفعلية للفترة</h4>
            <span id="pl-exp-count" style="font-size:11px; color:var(--text-2); font-weight:600;">0 حساب</span>
          </div>
          <div class="table-container" style="max-height:350px; overflow-y:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); font-size:12px; color:var(--text-2);">
                  <th style="padding:8px 16px; text-align:right;">كود الحساب</th>
                  <th style="padding:8px 16px; text-align:right;">اسم الحساب</th>
                  <th style="padding:8px 16px; text-align:left;">المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody id="pl-exp-tbody">
                <tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted);">لا توجد مصروفات مسجلة في هذه الفترة</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;const i=r.querySelector("#pl-from"),l=r.querySelector("#pl-to");i&&i.addEventListener("change",()=>I(!1)),l&&l.addEventListener("change",()=>I(!1)),window.loadProfitLoss=I,window.setPlPreset=Q,window.exportProfitLossExcel=U,await I(!1)}function Q(r){const u=document.getElementById("pl-from"),m=document.getElementById("pl-to");if(!u||!m)return;const x=new Date,i=x.getFullYear(),l=x.getMonth(),a=n=>{const y=n.getFullYear(),h=String(n.getMonth()+1).padStart(2,"0"),v=String(n.getDate()).padStart(2,"0");return`${y}-${h}-${v}`};let e="",p=a(x);if(r==="today")e=p;else if(r==="month")e=a(new Date(i,l,1));else if(r==="last_month"){const n=new Date(i,l,0),y=new Date(n.getFullYear(),n.getMonth(),1);e=a(y),p=a(n)}else if(r==="quarter"){const n=Math.floor(l/3)*3;e=a(new Date(i,n,1))}else r==="year"?e=a(new Date(i,0,1)):r==="all"&&(e="2026-01-01",p=a(x));u.value=e,m.value=p,document.querySelectorAll(".pl-preset-btn").forEach(n=>{n.dataset.preset===r?(n.style.fontWeight="700",n.style.background="var(--surface-2)"):(n.style.fontWeight="normal",n.style.background="transparent")}),I(!1)}async function I(r=!1){const u=document.getElementById("pl-loading-badge");u&&(u.style.display="inline");let m=document.getElementById("pl-from")?.value,x=document.getElementById("pl-to")?.value;const i=e=>{if(!e)return"";if(e=String(e).trim(),/^\d{4}-\d{2}-\d{2}$/.test(e))return e;const p=e.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(p)return`${p[3]}-${p[2].padStart(2,"0")}-${p[1].padStart(2,"0")}`;const n=new Date(e);return isNaN(n.getTime())?e:n.toISOString().split("T")[0]};let l=i(m)||"2026-01-01",a=i(x)||H();if(l&&a&&l>a){const e=l;l=a,a=e,document.getElementById("pl-from")&&(document.getElementById("pl-from").value=l),document.getElementById("pl-to")&&(document.getElementById("pl-to").value=a)}try{if(r||!c.sales||!c.returns||!c.jes||!c.accounts){const[t,o,s,b]=await Promise.all([N(B.salesInvoices()),N(B.salesReturns()),N(B.journalEntries()),Y(B.chartOfAccounts())]);c.sales=t.docs.map(d=>({id:d.id,...d.data()})),c.returns=o.docs.map(d=>({id:d.id,...d.data()})),c.jes=s.docs.map(d=>({id:d.id,...d.data()})),c.accounts=Array.isArray(b)?b:[],c.loadedAt=Date.now()}const e=c.sales.filter(t=>{if(t.status==="cancelled"||t.status==="void")return!1;const o=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),s=i(o);return s>=l&&s<=a}),p=c.returns.filter(t=>{if(t.status==="cancelled"||t.status==="void")return!1;const o=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),s=i(o);return s>=l&&s<=a}),n=c.jes.filter(t=>{if(t.status==="cancelled"||t.status==="void"||t.status==="draft")return!1;const o=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),s=i(o);return s>=l&&s<=a}),y={},h={},v={},P={};let E=0;for(const t of n)for(const o of t.lines||[]){const s=o.accountCode||"",b=o.accountId||"",d=parseFloat(o.debit)||0,M=parseFloat(o.credit)||0;s&&(y[s]=(y[s]||0)+d,h[s]=(h[s]||0)+M),b&&(v[b]=(v[b]||0)+d,P[b]=(P[b]||0)+M),(s.startsWith("5-1-")&&!s.startsWith("5-1-1")||s==="4-2-4"||(o.accountName||"").includes("خصم مكتسب"))&&(E+=d-M)}let $=0,D=0;const z=[];for(const t of c.accounts){if(t.type!=="expense"||t.code?.startsWith("5-1-")||t.code==="4-2-4"||t.name?.includes("خصم مكتسب"))continue;const s=t.code&&y[t.code]||t.id&&v[t.id]||0,b=t.code&&h[t.code]||t.id&&P[t.id]||0,d=s-b;d<=.005||(z.push({code:t.code||"—",name:t.name||"مصروف",amount:d}),t.name.includes("عمولة")||t.name.includes("توزيع")||t.name.includes("مندوب")||t.name.includes("مناديب")?$+=d:D+=d)}z.sort((t,o)=>o.amount-t.amount);const C=e.reduce((t,o)=>t+(o.subtotal!=null?o.subtotal:o.total||0),0),O=p.reduce((t,o)=>t+(o.subtotal!=null?o.subtotal:o.total||0),0),w=C-O,T=E,k=w-T,A=$+D,S=k-A,G=w>0?S/w*100:0,_=w>0?k/w*100:0;F={from:l,to:a,grossSales:C,returnAmount:O,netSales:w,cogs:T,grossProfit:k,commExpense:$,generalExp:D,totalExp:A,netProfit:S,margin:G,grossMargin:_,detailedExpenses:z,salesCount:e.length,returnsCount:p.length};const q=document.getElementById("pl-period");q&&(q.textContent=`الفترة من ${l} إلى ${a}`);const R=document.getElementById("pl-stats-badge");R&&(R.textContent=`${e.length} فاتورة مبيعات | ${p.length} مردود مبيعات`);const g=(t,o)=>{const s=document.getElementById(t);s&&(s.textContent=o)};g("pl-gross-sales",f(C)),g("pl-sales-returns",`- ${f(O)}`),g("pl-net-sales",f(w)),g("pl-cogs",f(T)),g("pl-gross-profit",f(k)),g("pl-exp-comm",f($)),g("pl-exp-general",f(D)),g("pl-total-expenses",f(A)),g("pl-final-net",f(S));const W=document.getElementById("pl-final-net");W&&(W.className=`mono font-bold text-right ${S>=0?"text-good":"text-bad"}`);const L=document.getElementById("pl-net-profit");L&&(L.textContent=f(S),L.className=`mono font-bold ${S>=0?"text-good":"text-bad"}`),g("pl-profit-margin",`هامش صافي الربح: ${G.toFixed(1)}%`),g("pl-gross-margin",`هامش مجمل الربح: ${_.toFixed(1)}%`);const j=document.getElementById("pl-exp-tbody"),V=document.getElementById("pl-exp-count");V&&(V.textContent=`${z.length} حساب`),j&&(z.length===0?j.innerHTML='<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted);">لا توجد مصروفات مسجلة في هذه الفترة</td></tr>':j.innerHTML=z.map(t=>`
          <tr style="border-bottom:1px solid var(--border);">
            <td class="mono" style="padding:8px 16px; font-size:12px; color:var(--text-2);">${t.code}</td>
            <td style="padding:8px 16px; font-size:13px; font-weight:600; color:var(--text-1);">${t.name}</td>
            <td class="mono text-left font-bold" style="padding:8px 16px; font-size:13px; color:var(--text-bad);">${f(t.amount)}</td>
          </tr>
        `).join(""))}catch(e){console.error("[Profit-Loss Error]",e),window.showToast?.("خطأ في احتساب الأرباح والخسائر: "+e.message,"error")}finally{u&&(u.style.display="none")}}async function U(){if(!F){window.showToast?.("يرجى تحميل التقرير أولاً","warn");return}const{from:r,to:u,grossSales:m,returnAmount:x,netSales:i,cogs:l,grossProfit:a,commExpense:e,generalExp:p,totalExp:n,netProfit:y,margin:h,detailedExpenses:v}=F,P=[["1. الإيرادات والمبيعات",""],["إجمالي إيراد المبيعات (بدون VAT)",m],["يخصم: مردودات المبيعات والخصومات",-x],["صافي المبيعات (Net Revenue)",i],["",""],["2. تكلفة المبيعات (COGS)",""],["تكلفة البضاعة المباعة (المشتريات/المخزون)",l],["مجمل الربح (Gross Profit)",a],["",""],["3. المصروفات التشغيلية والعمومية",""],["مصروفات عُملات المناديب والتوزيع",e],["مصروفات رواتب وإيجارات ومصروفات عامة",p],["إجمالي المصروفات التشغيلية",n],["",""],["4. النتيجة الختامية",""],["صافي الربح / (الخسارة) قبل الضريبة",y],["هامش صافي الربح (%)",`${h.toFixed(2)}%`],["",""],["=== تفصيل حسابات المصروفات ===",""],...v.map(E=>[`${E.code} - ${E.name}`,E.amount])];await K({title:`قائمة_الأرباح_والخسائر_${r}_إلى_${u}`,headers:["البند المحاسبي","المبلغ (ر.س)"],rows:P,colWidths:[45,20]})}export{U as exportProfitLossExcel,I as loadProfitLoss,lt as render,Q as setPlPreset};
