import{t as L,C as h,g as S,f as e}from"./index-HrCilPJ3.js";import{getDocs as w,query as $,orderBy as T,limit as A}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let v=[],u=[],b=[],x=[],k=[],B=[],E=[],M="vat";async function G(n,i){const r=new Date,l=new Date(r.getFullYear(),r.getMonth(),1).toISOString().split("T")[0],c=L();n.innerHTML=`
    <!-- Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="vz-from" value="${l}" />
      </div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="vz-to" value="${c}" />
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة الإقرار</button>
        <button class="btn btn-primary" onclick="VZ.reload()">🔄 تحديث البيانات</button>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex; border-bottom:2px solid var(--border-soft); background:var(--bg-1); padding:0 16px;">
      <button class="vz-tab active" id="vzt-vat"      onclick="VZ.tab('vat')">📊 إقرار VAT</button>
      <button class="vz-tab"        id="vzt-zakat"    onclick="VZ.tab('zakat')">🕌 الزكاة</button>
      <button class="vz-tab"        id="vzt-income"   onclick="VZ.tab('income')">💼 ضريبة الدخل</button>
      <button class="vz-tab"        id="vzt-invoices" onclick="VZ.tab('invoices')">📋 سجل الفواتير الضريبي</button>
    </div>

    <div class="page-content" id="vz-body" style="padding:24px;">
      <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>

    <style>
      .vz-tab { padding:14px 20px; border:none; background:none; cursor:pointer;
        font-weight:600; color:var(--text-2); border-bottom:3px solid transparent;
        margin-bottom:-2px; font-size:13px; transition:all 0.2s; }
      .vz-tab.active, .vz-tab:hover { color:var(--brand); border-bottom-color:var(--brand); }
      .tax-section { background:var(--bg-1); border:1px solid var(--border); border-radius:12px;
        padding:20px; margin-bottom:20px; }
      .tax-row { display:flex; justify-content:space-between; align-items:center;
        padding:10px 0; border-bottom:1px solid var(--border-soft); font-size:14px; }
      .tax-row:last-child { border-bottom:none; }
      .tax-row.total { font-weight:700; font-size:16px; padding-top:14px; }
      .tax-row.payable { background:var(--bg-2); border-radius:8px; padding:12px 16px;
        margin-top:12px; font-weight:700; font-size:17px; }
      .tax-badge-due { background:rgba(239,68,68,0.15); color:var(--bad);
        padding:4px 12px; border-radius:20px; font-size:13px; }
      .tax-badge-refund { background:rgba(34,197,94,0.15); color:var(--good);
        padding:4px 12px; border-radius:20px; font-size:13px; }
    </style>
  `,document.getElementById("vz-from").addEventListener("change",()=>VZ.reload()),document.getElementById("vz-to").addEventListener("change",()=>VZ.reload()),await Z()}async function Z(){const n=document.getElementById("vz-from")?.value||"",i=document.getElementById("vz-to")?.value||"";try{const[r,l,c,t,d,g,f]=await Promise.all([w($(h.salesInvoices(),T("createdAt","desc"),A(1e3))),w($(h.purchaseInvoices(),T("createdAt","desc"),A(1e3))),w($(h.salesReturns(),T("createdAt","desc"),A(1e3))),w($(h.purchaseReturns(),T("createdAt","desc"),A(1e3))),w($(h.expenses(),T("date","desc"),A(1e3))),S(h.products()),S(h.stockByWarehouse())]);v=r.docs.map(s=>({id:s.id,...s.data()})),u=l.docs.map(s=>({id:s.id,...s.data()})),b=c.docs.map(s=>({id:s.id,...s.data()})),x=t.docs.map(s=>({id:s.id,...s.data()})),k=d.docs.map(s=>({id:s.id,...s.data()})),B=g,E=f;const a=(s,z="date")=>s.filter(y=>{const m=y[z]||(y.createdAt?.toDate?y.createdAt.toDate().toISOString().split("T")[0]:"");return(!n||m>=n)&&(!i||m<=i)});v=a(v,"date"),u=a(u,"date"),b=a(b,"date"),x=a(x,"date"),k=a(k,"date"),D()}catch(r){const l=document.getElementById("vz-body");l&&(l.innerHTML=`<div class="alert bad">${r.message}</div>`)}}function D(){switch(M){case"vat":N();break;case"zakat":O();break;case"income":P();break;case"invoices":R();break}}function N(){const n=document.getElementById("vz-from")?.value||"",i=document.getElementById("vz-to")?.value||"",r=v.filter(o=>o.status!=="cancelled").reduce((o,p)=>o+(p.totalVat||0),0),l=v.filter(o=>o.status!=="cancelled").reduce((o,p)=>o+(p.subtotal||0),0),c=b.reduce((o,p)=>o+(p.totalVat||0),0),t=b.reduce((o,p)=>o+(p.subtotal||0),0),d=Math.max(0,r-c),g=u.filter(o=>o.status!=="cancelled").reduce((o,p)=>o+(p.totalVat||0),0),f=u.filter(o=>o.status!=="cancelled").reduce((o,p)=>o+(p.subtotal||0),0),a=x.reduce((o,p)=>o+(p.totalVat||0),0),s=x.reduce((o,p)=>o+(p.subtotal||0),0),z=Math.max(0,g-a),y=d-z,m=y>0,V=y<0,I=document.getElementById("vz-body");I&&(I.innerHTML=`
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">إقرار ضريبة القيمة المضافة (VAT Return)</h2>
        <p style="color:var(--text-2); margin-top:4px;">الفترة: ${n} إلى ${i}</p>
        <p style="color:var(--text-2); font-size:12px;">معدل الضريبة: 15% | الجهة: هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
      </div>

      <!-- Output Tax Section -->
      <div class="tax-section">
        <h3 style="color:var(--brand); font-size:15px; margin-bottom:16px; font-weight:700;">
          📤 الجزء الأول: ضريبة المخرجات (Output VAT)
        </h3>
        <div class="tax-row">
          <span>عدد فواتير المبيعات</span>
          <span class="mono font-bold">${v.filter(o=>o.status!=="cancelled").length} فاتورة</span>
        </div>
        <div class="tax-row">
          <span>إجمالي المبيعات (قبل VAT)</span>
          <span class="mono">${e(l)}</span>
        </div>
        <div class="tax-row">
          <span>يخصم: مردودات المبيعات (قبل VAT)</span>
          <span class="mono text-bad">- ${e(t)}</span>
        </div>
        <div class="tax-row total">
          <span>صافي ضريبة المخرجات (15%)</span>
          <span class="mono text-bad">${e(d)}</span>
        </div>
      </div>

      <!-- Input Tax Section -->
      <div class="tax-section">
        <h3 style="color:var(--good); font-size:15px; margin-bottom:16px; font-weight:700;">
          📥 الجزء الثاني: ضريبة المدخلات (Input VAT)
        </h3>
        <div class="tax-row">
          <span>عدد فواتير المشتريات</span>
          <span class="mono font-bold">${u.filter(o=>o.status!=="cancelled").length} فاتورة</span>
        </div>
        <div class="tax-row">
          <span>إجمالي المشتريات (قبل VAT)</span>
          <span class="mono">${e(f)}</span>
        </div>
        <div class="tax-row">
          <span>يخصم: مردودات المشتريات (قبل VAT)</span>
          <span class="mono text-bad">- ${e(s)}</span>
        </div>
        <div class="tax-row total">
          <span>صافي ضريبة المدخلات المستردة (15%)</span>
          <span class="mono text-good">${e(z)}</span>
        </div>
      </div>

      <!-- Net VAT -->
      <div class="tax-section" style="border:2px solid ${m?"var(--bad)":"var(--good)"};">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700;">
          ⚖️ صافي الضريبة المستحقة
        </h3>
        <div class="tax-row">
          <span>صافي ضريبة المخرجات</span>
          <span class="mono">${e(d)}</span>
        </div>
        <div class="tax-row">
          <span>( - ) صافي ضريبة المدخلات القابلة للاسترداد</span>
          <span class="mono text-good">- ${e(z)}</span>
        </div>
        <div class="tax-row payable">
          <span>${m?"💰 الضريبة المستحقة الدفع لـ ZATCA":V?"💚 مبلغ مسترد من ZATCA":"✓ الحساب متوازن"}</span>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="mono" style="font-size:20px; color:${m?"var(--bad)":"var(--good)"};">
              ${e(Math.abs(y))}
            </span>
            <span class="${m?"tax-badge-due":"tax-badge-refund"}">
              ${m?"مستحق":V?"مسترد":"متوازن"}
            </span>
          </div>
        </div>
      </div>

      <!-- ZATCA Filing Info -->
      <div class="tax-section" style="background:rgba(99,102,241,0.05); border-color:var(--indigo);">
        <h3 style="color:var(--indigo); font-size:14px; margin-bottom:12px;">
          📡 معلومات رفع الإقرار على منصة ZATCA Fatoora
        </h3>
        <div style="font-size:13px; line-height:1.8; color:var(--text-1);">
          <p>• موعد تقديم الإقرار: اليوم الثلاثين من الشهر التالي للفترة الضريبية</p>
          <p>• رابط المنصة: <strong>fatoora.zatca.gov.sa</strong></p>
          <p>• غرامة التأخير: 5% - 25% من مبلغ الضريبة المستحقة</p>
          <p>• يجب مطابقة هذا الإقرار مع سجلات ZATCA eInvoicing Phase 2</p>
        </div>
      </div>
    </div>
  `)}function O(){const n=document.getElementById("vz-body");if(!n)return;const i={};E.forEach(a=>{i[a.productId]=(i[a.productId]||0)+(a.qty||0)});const r=B.reduce((a,s)=>a+(i[s.id]||0)*(s.costPrice||0),0),l=v.filter(a=>a.status!=="cancelled").reduce((a,s)=>a+(s.subtotal||0),0)-b.reduce((a,s)=>a+(s.subtotal||0),0),c=k.reduce((a,s)=>a+(s.amount||0),0),t=u.filter(a=>a.status!=="cancelled").reduce((a,s)=>a+(s.subtotal||0),0)-x.reduce((a,s)=>a+(s.subtotal||0),0),d=Math.max(0,r+l-c-t),f=d*.025;n.innerHTML=`
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">🕌 حساب الزكاة</h2>
        <p style="color:var(--text-2); margin-top:4px;">معدل الزكاة: 2.5% من وعاء الزكاة الصافي</p>
        <p style="color:var(--text-2); font-size:12px;">تُطبَّق على المنشآت المملوكة للمواطنين السعوديين</p>
      </div>

      <div class="tax-section">
        <h3 style="color:var(--brand); font-size:15px; margin-bottom:16px; font-weight:700;">
          📦 عناصر وعاء الزكاة
        </h3>
        <div class="tax-row">
          <span>قيمة المخزون بسعر التكلفة (+)</span>
          <span class="mono text-good">${e(r)}</span>
        </div>
        <div class="tax-row">
          <span>صافي الإيرادات خلال الفترة (+)</span>
          <span class="mono text-good">${e(l)}</span>
        </div>
        <div class="tax-row">
          <span>المشتريات خلال الفترة (-)</span>
          <span class="mono text-bad">- ${e(t)}</span>
        </div>
        <div class="tax-row">
          <span>المصروفات التشغيلية (-)</span>
          <span class="mono text-bad">- ${e(c)}</span>
        </div>
        <div class="tax-row total">
          <span>وعاء الزكاة الصافي</span>
          <span class="mono" style="font-size:17px;">${e(d)}</span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--warn);">
        <div class="tax-row payable" style="border-radius:8px;">
          <div>
            <div style="font-size:16px; font-weight:700;">💰 الزكاة المستحقة (2.5%)</div>
            <div style="font-size:12px; color:var(--text-2); margin-top:4px;">
              ${e(d)} × 2.5%
            </div>
          </div>
          <span class="mono" style="font-size:24px; color:var(--warn);">${e(f)}</span>
        </div>
      </div>

      <div class="tax-section" style="font-size:13px; line-height:1.8; color:var(--text-2);">
        <h4 style="color:var(--text-1); margin-bottom:8px;">📌 ملاحظات مهمة:</h4>
        <p>• هذا حساب تقديري مبسط. يجب مراجعة محاسب قانوني معتمد لحساب الزكاة الدقيق.</p>
        <p>• تُحسب الزكاة بشكل سنوي في نهاية السنة المالية بعد اكتمال الحول.</p>
        <p>• تقديم إقرار الزكاة عبر منصة: <strong>zatca.gov.sa</strong></p>
        <p>• موعد تقديم الإقرار: خلال 120 يوماً من نهاية السنة المالية.</p>
      </div>
    </div>
  `}function P(){const n=document.getElementById("vz-body");if(!n)return;const i=v.filter(a=>a.status!=="cancelled").reduce((a,s)=>a+(s.subtotal||0),0)-b.reduce((a,s)=>a+(s.subtotal||0),0),r=u.filter(a=>a.status!=="cancelled").reduce((a,s)=>a+(s.subtotal||0),0)-x.reduce((a,s)=>a+(s.subtotal||0),0),l=k.reduce((a,s)=>a+(s.amount||0),0),c=i-r,t=c-l,d=.2,g=Math.max(0,t),f=g*d;n.innerHTML=`
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">💼 ضريبة الدخل</h2>
        <p style="color:var(--text-2); margin-top:4px;">معدل الضريبة: 20% على صافي الربح (للمساهمين غير السعوديين)</p>
      </div>

      <div class="tax-section">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700; color:var(--brand);">
          📊 قائمة الدخل المختصرة
        </h3>
        <div class="tax-row">
          <span>إيرادات المبيعات (الصافي بعد المردودات)</span>
          <span class="mono text-good">${e(i)}</span>
        </div>
        <div class="tax-row">
          <span>( - ) تكلفة المشتريات (الصافي بعد المردودات)</span>
          <span class="mono text-bad">- ${e(r)}</span>
        </div>
        <div class="tax-row total">
          <span>مجمل الربح (Gross Profit)</span>
          <span class="mono" style="color:${c>=0?"var(--good)":"var(--bad)"};">
            ${e(c)}
          </span>
        </div>
        <div class="tax-row">
          <span>( - ) المصروفات التشغيلية</span>
          <span class="mono text-bad">- ${e(l)}</span>
        </div>
        <div class="tax-row total" style="font-size:17px;">
          <span>صافي الربح (Net Profit)</span>
          <span class="mono" style="color:${t>=0?"var(--good)":"var(--bad)"};">
            ${e(t)}
          </span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--indigo);">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700; color:var(--indigo);">
          🧮 احتساب الضريبة
        </h3>
        <div class="tax-row">
          <span>الدخل الخاضع للضريبة</span>
          <span class="mono">${e(g)}</span>
        </div>
        <div class="tax-row">
          <span>معدل ضريبة الدخل</span>
          <span class="mono">20%</span>
        </div>
        <div class="tax-row payable">
          <span style="font-size:16px; font-weight:700;">💰 ضريبة الدخل المستحقة</span>
          <span class="mono" style="font-size:22px; color:var(--indigo);">${e(f)}</span>
        </div>
      </div>

      <div class="tax-section" style="background:rgba(99,102,241,0.05);">
        <h4 style="color:var(--brand); margin-bottom:8px; font-size:14px;">⚖️ الإطار القانوني السعودي:</h4>
        <div style="font-size:12px; line-height:1.9; color:var(--text-2);">
          <p>• <strong>المواطنون السعوديون وشركاء الخليج:</strong> يخضعون للزكاة (2.5%) فقط — لا ضريبة دخل</p>
          <p>• <strong>المساهمون الأجانب:</strong> يخضعون لضريبة دخل 20% على نصيبهم من الأرباح</p>
          <p>• <strong>الشركات المختلطة:</strong> يُحسب كل جزء بحسب نسبة الملكية</p>
          <p>• تقديم الإقرار عبر: <strong>zatca.gov.sa → نظام أسأل</strong></p>
          <p>• الموعد النهائي: 120 يوماً من نهاية السنة المالية</p>
        </div>
      </div>
    </div>
  `}function R(){const n=document.getElementById("vz-body");if(!n)return;const i=[...v.filter(t=>t.status!=="cancelled").map(t=>({...t,direction:"صادر (مبيعات)",vatSign:1})),...u.filter(t=>t.status!=="cancelled").map(t=>({...t,direction:"وارد (مشتريات)",vatSign:-1,customerName:t.supplierName})),...b.map(t=>({...t,direction:"مردود مبيعات (دائن)",vatSign:-1,number:t.number||t.id.slice(0,8),customerName:t.customerName})),...x.map(t=>({...t,direction:"مردود مشتريات (مدين)",vatSign:1,number:t.number||t.id.slice(0,8),customerName:t.supplierName}))].sort((t,d)=>(t.date||"")>(d.date||"")?-1:1),r=v.filter(t=>t.status!=="cancelled").reduce((t,d)=>t+(d.totalVat||0),0)-b.reduce((t,d)=>t+(d.totalVat||0),0),l=u.filter(t=>t.status!=="cancelled").reduce((t,d)=>t+(d.totalVat||0),0)-x.reduce((t,d)=>t+(d.totalVat||0),0),c=r-l;n.innerHTML=`
    <div class="kpi-grid mb-20" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card"><div class="status-bar bad"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مخرجات (مبيعات)</div>
          <div class="kpi-value mono text-bad">${e(Math.max(0,r))}</div></div></div>
      <div class="kpi-card"><div class="status-bar good"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مدخلات (مشتريات)</div>
          <div class="kpi-value mono text-good">${e(Math.max(0,l))}</div></div></div>
      <div class="kpi-card"><div class="status-bar ${c>0?"warn":"good"}"></div>
        <div class="kpi-content"><div class="kpi-label">صافي الضريبة المستحقة / (المستردة)</div>
          <div class="kpi-value mono" style="color:${c>0?"var(--warn)":"var(--good)"};">
            ${e(Math.abs(c))} ${c>0?"مستحق":"مسترد"}
          </div></div></div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>رقم المستند</th><th>التاريخ</th><th>النوع</th>
            <th>الطرف الآخر</th><th>المجموع قبل VAT</th>
            <th>مبلغ VAT</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>
            ${i.map(t=>`
              <tr>
                <td class="mono text-indigo">${t.number||"—"}</td>
                <td class="dim">${t.date||"—"}</td>
                <td>
                  <span class="badge ${t.direction.includes("مبيعات")?"bad":"good"}" style="font-size:10px;">
                    ${t.direction}
                  </span>
                </td>
                <td class="font-semibold">${t.customerName||t.supplierName||"—"}</td>
                <td class="mono">${e(t.subtotal||0)}</td>
                <td class="mono ${t.vatSign>0?"text-bad":"text-good"}">
                  ${t.vatSign>0?"+ ":"- "}${e(t.totalVat||0)}
                </td>
                <td class="mono font-bold">${e(t.totalWithVat||0)}</td>
              </tr>`).join("")}
            ${i.length===0?'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد فواتير أو إشعارات في الفترة المحددة</td></tr>':""}
          </tbody>
        </table>
      </div>
    </div>
  `}window.VZ={tab(n){M=n,document.querySelectorAll(".vz-tab").forEach(i=>i.classList.remove("active")),document.getElementById(`vzt-${n}`)?.classList.add("active"),D()},async reload(){const n=document.getElementById("vz-body");n&&(n.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>'),await Z()}};export{G as render};
