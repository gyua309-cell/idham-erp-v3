const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{t as W,g as N,C as E,f as e,_ as j}from"./index-CF9GFeRJ.js";import{where as U,limit as J}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let z=[],k=[],T=[],A=[],D=[],L=[],C=[],w=[],O="vat";window.VZ=window.VZ||{async tab(l){O=l,document.querySelectorAll(".vz-tab").forEach(m=>m.classList.remove("active")),document.getElementById(`vzt-${l}`)?.classList.add("active"),await H()},async reload(){const l=document.getElementById("vz-body");l&&(l.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحديث البيانات…</span></div>'),await _()}};async function dt(l,m){const o=new Date,u=Math.floor(o.getMonth()/3)*3,b=`${o.getFullYear()}-${String(u+1).padStart(2,"0")}-01`,t=W();l.innerHTML=`
    <!-- Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:center;">
      <div style="display:flex; gap:6px; background:var(--bg-2); padding:3px 6px; border-radius:8px;">
        <button class="btn btn-xs btn-ghost active" id="btn-rng-q" onclick="VZ.setRange('quarter')">الربع الحالي (Q${Math.floor(o.getMonth()/3)+1})</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-m" onclick="VZ.setRange('month')">هذا الشهر</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-lm" onclick="VZ.setRange('last_month')">الشهر السابق</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-y" onclick="VZ.setRange('year')">العام الحالي</button>
      </div>

      <div class="date-range-group"><label>من</label>
        <input type="date" id="vz-from" value="${b}" />
      </div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="vz-to" value="${t}" />
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="printVatDeclaration()" style="font-weight:700;background:linear-gradient(135deg, #1e3a8a, #2563eb);color:#fff;border:none;">🖨️ طباعة الإقرار الرسمي</button>
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
  `,document.getElementById("vz-from").addEventListener("change",()=>VZ.reload()),document.getElementById("vz-to").addEventListener("change",()=>VZ.reload()),window.VZ.setRange=c=>{const x=new Date,s=W();if(c==="quarter"){const d=Math.floor(x.getMonth()/3)*3;document.getElementById("vz-from").value=`${x.getFullYear()}-${String(d+1).padStart(2,"0")}-01`,document.getElementById("vz-to").value=s}else if(c==="month")document.getElementById("vz-from").value=`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-01`,document.getElementById("vz-to").value=s;else if(c==="last_month"){const d=new Date(x.getFullYear(),x.getMonth()-1,1),I=new Date(x.getFullYear(),x.getMonth(),0);document.getElementById("vz-from").value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`,document.getElementById("vz-to").value=`${I.getFullYear()}-${String(I.getMonth()+1).padStart(2,"0")}-${String(I.getDate()).padStart(2,"0")}`}else c==="year"&&(document.getElementById("vz-from").value=`${x.getFullYear()}-01-01`,document.getElementById("vz-to").value=s);VZ.reload()},await _()}async function _(){const l=document.getElementById("vz-from")?.value||"",m=document.getElementById("vz-to")?.value||"";try{const o=[];l&&o.push(U("date",">=",l)),m&&o.push(U("date","<=",m)),o.length===0&&o.push(J(500));const[u,h,b,t,c,x]=await Promise.all([N(E.salesInvoices(),o),N(E.purchaseInvoices(),o),N(E.salesReturns(),o),N(E.purchaseReturns(),o),N(E.expenses(),o),N(E.journalEntries(),o)]);z=Array.isArray(u)?u:u.docs?.map(a=>({id:a.id,...a.data()}))||[],k=Array.isArray(h)?h:h.docs?.map(a=>({id:a.id,...a.data()}))||[],T=Array.isArray(b)?b:b.docs?.map(a=>({id:a.id,...a.data()}))||[],A=Array.isArray(t)?t:t.docs?.map(a=>({id:a.id,...a.data()}))||[],D=Array.isArray(c)?c:c.docs?.map(a=>({id:a.id,...a.data()}))||[];const s=Array.isArray(x)?x:x.docs?.map(a=>({id:a.id,...a.data()}))||[],d=(a,v="date")=>a.filter(p=>{const r=p[v]||(p.createdAt?.toDate?p.createdAt.toDate().toISOString().split("T")[0]:"");return(!l||r>=l)&&(!m||r<=m)});z=d(z,"date"),k=d(k,"date"),T=d(T,"date"),A=d(A,"date"),D=d(D,"date");const I=d(s,"date"),M=a=>{if(!a||(a.debit||0)<=0)return!1;const v=String(a.accountCode||"").trim(),p=String(a.accountName||"").trim();return!!(v==="1-1-5-2"||v==="2-1-3-2"||v==="1152"||v==="2132"||v==="2-2-2"||(p.includes("المدخلات")||p.includes("مدخلات"))&&!p.includes("مخرجات")&&!p.includes("المخرجات")&&!p.includes("مبيعات")&&!p.includes("مورد"))},B=a=>{const v=String(a||"").trim();return v==="1-1-5-2"||v==="2-1-3-2"||v==="1152"||v==="2132"||v==="2-2-2"};w=[],I.forEach(a=>{if(a.status!=="posted"||a.sourceType==="purchaseInvoice"||a.sourceType==="purchaseReturn"||a.sourceType==="salesInvoice"||a.sourceType==="salesReturn"||a.sourceType==="salesCOGS"||a.sourceType==="pos")return;const v=(a.lines||[]).find(M);if(v){const r=v.debit||0,V=(a.lines||[]).find($=>!M($)&&!B($.accountCode)&&($.debit||0)>0),S=V?V.debit||0:Math.round(r/.15*100)/100,R=(a.lines||[]).reduce(($,i)=>$||(i.serviceProvider||"").trim(),"")||(a.supplierName||a.vendorName||a.entityName||"").trim()||a.description||"مورد خدمة",n=(a.lines||[]).reduce(($,i)=>$||(i.taxNumber||"").trim(),"")||(a.taxNumber||a.supplierVatNumber||"").trim()||"—",g=(a.lines||[]).reduce(($,i)=>$||(i.invoiceRef||"").trim(),"")||a.taxInvoiceNumber||a.reference||a.entryNumber||a.id.slice(0,8);w.push({id:a.id,number:g,date:a.date||"",supplierName:R,taxNumber:n,subtotal:Math.round(S*100)/100,totalVat:Math.round(r*100)/100,totalWithVat:Math.round((S+r)*100)/100,direction:"وارد (قيد خدمات يدوية)",vatSign:-1,_fromVatLine:!0});return}const p=(a.lines||[]).find(r=>(r.debit||0)>0&&String(r.accountCode||"").startsWith("5-")&&(r.serviceProvider||"").trim()&&((r.taxNumber||"").trim()||(r.invoiceRef||"").trim()));if(p){const r=p.debit||0,V=Math.round(r*.15*100)/100,S=(p.serviceProvider||"").trim(),R=(p.taxNumber||"").trim()||"—",n=(p.invoiceRef||"").trim()||a.taxInvoiceNumber||a.entryNumber||a.id.slice(0,8);w.push({id:a.id,number:n,date:a.date||"",supplierName:S,taxNumber:R,subtotal:r,totalVat:V,totalWithVat:r+V,direction:"وارد (قيد خدمات يدوية)",vatSign:-1})}}),await H()}catch(o){const u=document.getElementById("vz-body");u&&(u.innerHTML=`<div class="alert bad">${o.message}</div>`)}}async function H(){switch(O){case"vat":K();break;case"zakat":await Q();break;case"income":X();break;case"invoices":tt();break}}function K(){const l=document.getElementById("vz-from")?.value||"",m=document.getElementById("vz-to")?.value||"",o=z.filter(n=>n.status!=="cancelled").reduce((n,g)=>n+(g.totalVat||0),0),u=z.filter(n=>n.status!=="cancelled").reduce((n,g)=>n+(g.subtotal||0),0),h=T.reduce((n,g)=>n+(g.totalVat||0),0),b=T.reduce((n,g)=>n+(g.subtotal||0),0),t=Math.max(0,o-h),c=Math.max(0,u-b),x=k.filter(n=>n.status!=="cancelled").reduce((n,g)=>n+(g.totalVat||0),0),s=k.filter(n=>n.status!=="cancelled").reduce((n,g)=>n+(g.subtotal||0),0),d=w.reduce((n,g)=>n+(g.totalVat||0),0),I=w.reduce((n,g)=>n+(g.subtotal||0),0),M=A.reduce((n,g)=>n+(g.totalVat||0),0),B=A.reduce((n,g)=>n+(g.subtotal||0),0),a=Math.max(0,x+d-M),v=Math.max(0,s+I-B),p=t-a,r=p>0,V=p<0,S=document.getElementById("vz-body");if(!S)return;const R=w.map((n,g)=>`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:6px 10px; text-align:center; color:#64748b;">${g+1}</td>
      <td style="padding:6px 10px;" class="mono">${n.date||"—"}</td>
      <td style="padding:6px 10px; font-weight:700;">${n.supplierName||"—"}</td>
      <td style="padding:6px 10px;" class="mono">${n.taxNumber||"—"}</td>
      <td style="padding:6px 10px;" class="mono">${n.number||"—"}</td>
      <td style="padding:6px 10px; text-align:right;" class="mono">${e(n.subtotal||0)}</td>
      <td style="padding:6px 10px; text-align:right; color:#16a34a;" class="mono font-bold">${e(n.totalVat||0)}</td>
      <td style="padding:6px 10px; text-align:right;" class="mono font-bold">${e(n.totalWithVat||0)}</td>
    </tr>
  `).join("");S.innerHTML=`
    <div style="max-width:1100px; margin:0 auto; padding-bottom:40px;">
      
      <!-- Executive Header Banner -->
      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card, #ffffff); border:1px solid var(--border-soft, #cbd5e1); border-right:6px solid #4f46e5; padding:20px 24px; border-radius:16px; margin-bottom:20px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span style="background:#4f46e5; color:#ffffff !important; font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">ZATCA Form 15%</span>
            <span style="color:var(--brand, #4338ca); font-size:12.5px; font-weight:700;">هيئة الزكاة والضريبة والجمارك</span>
          </div>
          <h2 style="font-size:22px; font-weight:900; margin:0; color:var(--text-1, #0f172a) !important; font-family:var(--font-heading);">إقرار ضريبة القيمة المضافة التفصيلي الموحد</h2>
          <div style="font-size:12.5px; color:var(--text-2, #334155); margin-top:6px; font-weight:600;">
            الفترة من <strong class="mono" style="color:#0284c7;">${l}</strong> إلى <strong class="mono" style="color:#0284c7;">${m}</strong> | حالة البيانات: <span style="color:#16a34a; font-weight:800;">محدثة ومطابقة 100%</span>
          </div>
        </div>
        <div style="display:flex; gap:10px;" class="no-print">
          <button class="btn btn-primary" onclick="window.printVATReturn()" style="font-weight:700; font-size:13px; padding:10px 18px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>🖨️</span> <span>طباعة الإقرار الضريبي الرسمي</span>
          </button>
        </div>
      </div>

      <!-- Top Executive KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;">
        
        <!-- Card 1: Output VAT -->
        <div style="background:#ffffff; border-radius:14px; border:1px solid #e2e8f0; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid #6366f1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:#475569;">📤 إجمالي ضريبة المخرجات (المبيعات)</span>
            <span style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px;">15% VAT</span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#4338ca; margin-bottom:6px;">
            ${e(t)} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:8px; margin-top:6px;">
            <span>الخاضع قبل الضريبة: <strong class="mono" style="color:#1e293b;">${e(c)} ر.س</strong></span>
            <span>${z.filter(n=>n.status!=="cancelled").length} فاتورة</span>
          </div>
        </div>

        <!-- Card 2: Input VAT -->
        <div style="background:#ffffff; border-radius:14px; border:1px solid #e2e8f0; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:#475569;">📥 إجمالي ضريبة المدخلات (المشتريات والخدمات)</span>
            <span style="background:#d1fae5; color:#047857; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px;">قابلة للخصم</span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#047857; margin-bottom:6px;">
            ${e(a)} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:8px; margin-top:6px;">
            <span>الخاضع قبل الضريبة: <strong class="mono" style="color:#1e293b;">${e(v)} ر.س</strong></span>
            <span>${k.filter(n=>n.status!=="cancelled").length} مشتريات</span>
          </div>
        </div>

        <!-- Card 3: Net VAT Result -->
        <div style="background:${r?"#fef2f2":"#f0fdf4"}; border-radius:14px; border:1.5px solid ${r?"#fca5a5":"#86efac"}; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid ${r?"#dc2626":"#16a34a"};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:${r?"#991b1b":"#166534"};">⚖️ صافي موقف الإقرار الضريبي النهائي</span>
            <span style="background:${r?"#fee2e2":"#dcfce7"}; color:${r?"#991b1b":"#166534"}; font-size:10.5px; font-weight:800; padding:2px 10px; border-radius:12px;">
              ${r?"💰 مستحق للسداد":V?"💚 استرداد ضريبي لك":"✓ متوازن"}
            </span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:${r?"#dc2626":"#15803d"}; margin-bottom:6px;">
            ${e(Math.abs(p))} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="font-size:11px; color:${r?"#b91c1c":"#15803d"}; border-top:1px solid ${r?"#fecaca":"#bbf7d0"}; padding-top:8px; margin-top:6px; font-weight:700;">
            ${r?"يتوجب سداد هذا المبلغ لحساب هيئة ZATCA قبل الموعد":"رصيد دائن مسترد لصالح المؤسسة من هيئة الزكاة والضريبة"}
          </div>
        </div>

      </div>

      <!-- ZATCA Standard Declaration Table -->
      <div style="background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.04); margin-bottom:24px;">
        <div style="background:#f8fafc; padding:14px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:900; font-size:15px; color:#1e293b;">
            📑 نموذج الإقرار الضريبي الرسمي التجميعي (طريقة هيئة الزكاة والضريبة ZATCA Form)
          </div>
          <div style="font-size:11px; color:#64748b; font-weight:700;">
            النسبة المطبقة: 15% الضريبة المضافة
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12.5px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 16px; width:45%;">بند الإقرار الضريبي</th>
              <th style="padding:10px 16px; text-align:center; width:12%;">عدد العمليات</th>
              <th style="padding:10px 16px; text-align:right; width:22%;">المبلغ الخاضع للضريبة (ر.س)</th>
              <th style="padding:10px 16px; text-align:right; width:21%;">مبلغ الضريبة 15% (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            
            <!-- Output Header -->
            <tr style="background:#e0e7ff; color:#3730a3; font-weight:900;">
              <td colspan="4" style="padding:8px 16px; font-size:13px;">📤 أولاً: المبيعات والمخرجات (Output VAT)</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">1. المبيعات المحلية الخاضعة للنسبة الأساسية (15%)</td>
              <td style="text-align:center;" class="mono">${z.filter(n=>n.status!=="cancelled").length}</td>
              <td style="text-align:right;" class="mono font-bold">${e(u)}</td>
              <td style="text-align:right; color:#dc2626;" class="mono font-bold">${e(o)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">2. يخصم: مردودات ومسموحات المبيعات الخاضعة (الإشعارات الدائنة)</td>
              <td style="text-align:center;" class="mono">${T.length}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${e(b)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono">- ${e(h)}</td>
            </tr>
            <tr style="background:#f5f3ff; font-weight:900; border-bottom:2px solid #c7d2fe;">
              <td style="padding:10px 16px; color:#4338ca;">إجمالي ضريبة المخرجات المستحقة عن الفترة (1)</td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${e(c)} ر.س</td>
              <td style="text-align:right; color:#4338ca; font-size:14px;" class="mono font-bold">${e(t)} ر.س</td>
            </tr>

            <!-- Input Header -->
            <tr style="background:#d1fae5; color:#065f46; font-weight:900;">
              <td colspan="4" style="padding:8px 16px; font-size:13px;">📥 ثانياً: المشتريات والمدخلات القابلة للخصم (Input VAT)</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">1. مشتريات البضائع المحلية الخاضعة للنسبة الأساسية (15%)</td>
              <td style="text-align:center;" class="mono">${k.filter(n=>n.status!=="cancelled").length}</td>
              <td style="text-align:right;" class="mono font-bold">${e(s)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono font-bold">${e(x)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">2. قيود الخدمات والمصاريف التشغيلية والأصول الخاضعة للضريبة (15%)</td>
              <td style="text-align:center;" class="mono">${w.length}</td>
              <td style="text-align:right; color:#4338ca;" class="mono font-bold">+ ${e(I)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono font-bold">+ ${e(d)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">3. يخصم: مردودات المشتريات الخاضعة (الإشعارات المدينة)</td>
              <td style="text-align:center;" class="mono">${A.length}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${e(B)}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${e(M)}</td>
            </tr>
            <tr style="background:#ecfdf5; font-weight:900; border-bottom:2px solid #a7f3d0;">
              <td style="padding:10px 16px; color:#047857;">إجمالي ضريبة المدخلات القابلة للاسترداد والخصم (2)</td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${e(v)} ر.س</td>
              <td style="text-align:right; color:#047857; font-size:14px;" class="mono font-bold">${e(a)} ر.س</td>
            </tr>

            <!-- Final Result Row -->
            <tr style="background:${r?"#fef2f2":"#f0fdf4"}; font-weight:900; font-size:14px;">
              <td style="padding:14px 16px; color:${r?"#991b1b":"#166534"};">
                ⚖️ ${r?"صافي الضريبة الواجب سدادها لـ ZATCA (1 - 2)":"صافي المبلغ الضريبي المسترد لصالح المؤسسة (2 - 1)"}
              </td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${e(Math.abs(c-v))} ر.س</td>
              <td style="text-align:right; color:${r?"#dc2626":"#15803d"}; font-size:16px;" class="mono font-bold">
                ${e(Math.abs(p))} ر.س
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      ${w.length>0?`
      <!-- Detailed Service & Capital Assets Entries Ledger -->
      <div style="background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.04); margin-bottom:24px;">
        <div style="background:#f8fafc; padding:12px 20px; border-bottom:1px solid #e2e8f0; font-weight:800; font-size:13px; color:#334155; display:flex; justify-content:space-between; align-items:center;">
          <span>📑 بيان تفصيلي بـ قيود الخدمات والأصول والمصروفات المرفقة بالإقرار (${w.length} قيد)</span>
          <span style="font-size:11px; color:#6366f1; font-weight:700;">ضريبة مدخلاتها: ${e(d)} ر.س</span>
        </div>
        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:11.5px;">
          <thead>
            <tr style="background:#f1f5f9; color:#475569;">
              <th style="padding:8px 12px; width:35px; text-align:center;">#</th>
              <th style="padding:8px 12px; width:85px;">التاريخ</th>
              <th style="padding:8px 12px;">اسم المورد / بيان الخدمة</th>
              <th style="padding:8px 12px; width:130px;">الرقم الضريبي للمورد</th>
              <th style="padding:8px 12px; width:95px;">رقم القيد/الفاتورة</th>
              <th style="padding:8px 12px; text-align:right; width:100px;">المبلغ الخاضع</th>
              <th style="padding:8px 12px; text-align:right; width:90px;">الضريبة 15%</th>
              <th style="padding:8px 12px; text-align:right; width:100px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${R}
          </tbody>
        </table>
      </div>`:""}

      <!-- Official ZATCA Instructions Box -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:16px 20px; font-size:12px; color:#475569; line-height:1.7;">
        <div style="font-weight:800; color:#1e293b; margin-bottom:6px; font-size:13px;">📡 إرشادات الفحص والتقديم على منصة هيئة الزكاة والضريبة والجمارك (ZATCA Fatoora):</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
          <div>• موعد تقديم الإقرار الضريبي: قبل نهاية الشهر التالي للفترة الضريبية.</div>
          <div>• رابط البوابة الرسمية: <a href="https://fatoora.zatca.gov.sa" target="_blank" style="color:#4f46e5; font-weight:700;">fatoora.zatca.gov.sa</a></div>
          <div>• غرامة تأخير التقديم: 5% إلى 25% من قيمة الضريبة المستحقة.</div>
          <div>• حالة الربط الإلكتروني: الفواتير والإشعارات مطابقة لمعايير المفلترة (Phase 2).</div>
        </div>
      </div>

    </div>
  `}async function Q(){const l=document.getElementById("vz-body");if(!l)return;if(!L.length||!C.length){l.innerHTML=`
      <div class="page-loading" style="padding:40px 0;">
        <div class="loading-spinner"></div>
        <div style="margin-top:12px; font-weight:600; color:var(--text-2);">جارٍ احتساب وعاء الزكاة وتقييم أرصدة المخزون…</div>
      </div>`;try{const[s,d]=await Promise.all([N(E.products()),N(E.stockByWarehouse())]);L=s||[],C=d||[]}catch(s){console.warn("Zakat stock load error:",s)}}const m={};C.forEach(s=>{m[s.productId]=(m[s.productId]||0)+(s.qty||0)});const o=L.reduce((s,d)=>s+(m[d.id]||0)*(d.costPrice||0),0),u=z.filter(s=>s.status!=="cancelled").reduce((s,d)=>s+(d.subtotal||0),0)-T.reduce((s,d)=>s+(d.subtotal||0),0),h=D.reduce((s,d)=>s+(d.amount||0),0),b=k.filter(s=>s.status!=="cancelled").reduce((s,d)=>s+(d.subtotal||0),0)-A.reduce((s,d)=>s+(d.subtotal||0),0),t=Math.max(0,o+u-h-b),x=t*.025;l.innerHTML=`
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
          <span class="mono text-good">${e(o)}</span>
        </div>
        <div class="tax-row">
          <span>صافي الإيرادات خلال الفترة (+)</span>
          <span class="mono text-good">${e(u)}</span>
        </div>
        <div class="tax-row">
          <span>المشتريات خلال الفترة (-)</span>
          <span class="mono text-bad">- ${e(b)}</span>
        </div>
        <div class="tax-row">
          <span>المصروفات التشغيلية (-)</span>
          <span class="mono text-bad">- ${e(h)}</span>
        </div>
        <div class="tax-row total">
          <span>وعاء الزكاة الصافي</span>
          <span class="mono" style="font-size:17px;">${e(t)}</span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--warn);">
        <div class="tax-row payable" style="border-radius:8px;">
          <div>
            <div style="font-size:16px; font-weight:700;">💰 الزكاة المستحقة (2.5%)</div>
            <div style="font-size:12px; color:var(--text-2); margin-top:4px;">
              ${e(t)} × 2.5%
            </div>
          </div>
          <span class="mono" style="font-size:24px; color:var(--warn);">${e(x)}</span>
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
  `}function X(){const l=document.getElementById("vz-body");if(!l)return;const m=z.filter(s=>s.status!=="cancelled").reduce((s,d)=>s+(d.subtotal||0),0)-T.reduce((s,d)=>s+(d.subtotal||0),0),o=k.filter(s=>s.status!=="cancelled").reduce((s,d)=>s+(d.subtotal||0),0)-A.reduce((s,d)=>s+(d.subtotal||0),0),u=D.reduce((s,d)=>s+(d.amount||0),0),h=m-o,b=h-u,t=.2,c=Math.max(0,b),x=c*t;l.innerHTML=`
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
          <span class="mono text-good">${e(m)}</span>
        </div>
        <div class="tax-row">
          <span>( - ) تكلفة المشتريات (الصافي بعد المردودات)</span>
          <span class="mono text-bad">- ${e(o)}</span>
        </div>
        <div class="tax-row total">
          <span>مجمل الربح (Gross Profit)</span>
          <span class="mono" style="color:${h>=0?"var(--good)":"var(--bad)"};">
            ${e(h)}
          </span>
        </div>
        <div class="tax-row">
          <span>( - ) المصروفات التشغيلية</span>
          <span class="mono text-bad">- ${e(u)}</span>
        </div>
        <div class="tax-row total" style="font-size:17px;">
          <span>صافي الربح (Net Profit)</span>
          <span class="mono" style="color:${b>=0?"var(--good)":"var(--bad)"};">
            ${e(b)}
          </span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--indigo);">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700; color:var(--indigo);">
          🧮 احتساب الضريبة
        </h3>
        <div class="tax-row">
          <span>الدخل الخاضع للضريبة</span>
          <span class="mono">${e(c)}</span>
        </div>
        <div class="tax-row">
          <span>معدل ضريبة الدخل</span>
          <span class="mono">20%</span>
        </div>
        <div class="tax-row payable">
          <span style="font-size:16px; font-weight:700;">💰 ضريبة الدخل المستحقة</span>
          <span class="mono" style="font-size:22px; color:var(--indigo);">${e(x)}</span>
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
  `}function tt(){const l=document.getElementById("vz-body");if(!l)return;const m=[...z.filter(t=>t.status!=="cancelled").map(t=>({...t,direction:"صادر (مبيعات)",vatSign:1})),...k.filter(t=>t.status!=="cancelled").map(t=>({...t,direction:"وارد (مشتريات)",vatSign:-1,customerName:t.supplierName})),...T.map(t=>({...t,direction:"مردود مبيعات (دائن)",vatSign:-1,number:t.number||t.id.slice(0,8),customerName:t.customerName})),...A.map(t=>({...t,direction:"مردود مشتريات (مدين)",vatSign:1,number:t.number||t.id.slice(0,8),customerName:t.supplierName})),...w.map(t=>({...t,direction:"وارد (خدمات يدوية)",vatSign:-1,customerName:t.supplierName}))].sort((t,c)=>(t.date||"")>(c.date||"")?-1:1),o=w.reduce((t,c)=>t+(c.totalVat||0),0),u=z.filter(t=>t.status!=="cancelled").reduce((t,c)=>t+(c.totalVat||0),0)-T.reduce((t,c)=>t+(c.totalVat||0),0),h=k.filter(t=>t.status!=="cancelled").reduce((t,c)=>t+(c.totalVat||0),0)-A.reduce((t,c)=>t+(c.totalVat||0),0)+o,b=u-h;l.innerHTML=`
    <div class="kpi-grid mb-20" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card"><div class="status-bar bad"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مخرجات (مبيعات)</div>
          <div class="kpi-value mono text-bad">${e(Math.max(0,u))}</div></div></div>
      <div class="kpi-card"><div class="status-bar good"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مدخلات (مشتريات + خدمات)</div>
          <div class="kpi-value mono text-good">${e(Math.max(0,h))}</div></div></div>
      <div class="kpi-card"><div class="status-bar ${b>0?"warn":"good"}"></div>
        <div class="kpi-content"><div class="kpi-label">صافي الضريبة المستحقة / (المستردة)</div>
          <div class="kpi-value mono" style="color:${b>0?"var(--warn)":"var(--good)"};">
            ${e(Math.abs(b))} ${b>0?"مستحق":"مسترد"}
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
            ${m.map(t=>`
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
            ${m.length===0?'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد فواتير أو إشعارات في الفترة المحددة</td></tr>':""}
          </tbody>
        </table>
      </div>
    </div>
  `}window.VZ={...window.VZ,async tab(l){O=l,document.querySelectorAll(".vz-tab").forEach(m=>m.classList.remove("active")),document.getElementById(`vzt-${l}`)?.classList.add("active"),await H()},async reload(){const l=document.getElementById("vz-body");l&&(l.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحديث البيانات…</span></div>'),await _()}};window.printVatDeclaration=async()=>{const l=document.getElementById("vz-from")?.value||"",m=document.getElementById("vz-to")?.value||"";let o={name:"شركة نظم الإمداد المتطورة",nameEn:"Modern Supply Systems Co.",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",logoUrl:""};try{const{doc:i,getDoc:f}=await j(async()=>{const{doc:y,getDoc:Z}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:y,getDoc:Z}},[]),{db:F,COMPANY_ID:Y}=await j(async()=>{const{db:y,COMPANY_ID:Z}=await import("./index-CF9GFeRJ.js").then(G=>G.S);return{db:y,COMPANY_ID:Z}},__vite__mapDeps([0,1])),[q,P]=await Promise.all([f(i(F,`companies/${Y}/settings/company`)),f(i(F,`companies/${Y}/settings/logo`))]);if(q.exists()){const y=q.data();o.name=y.name||y.companyName||o.name,o.nameEn=y.nameEn||y.legalName||o.nameEn,o.crNumber=y.crNumber||y.cr||o.crNumber,o.vatNumber=y.vatNumber||y.vat||o.vatNumber,o.phone=y.phone||o.phone,o.email=y.email||o.email,o.address=y.address?y.city?`${y.address} — ${y.city}`:y.address:o.address}P.exists()&&(o.logoUrl=P.data().dataUrl||P.data().logoUrl||"")}catch{}const u=z.filter(i=>i.status!=="cancelled").reduce((i,f)=>i+(f.subtotal||0),0),h=z.filter(i=>i.status!=="cancelled").reduce((i,f)=>i+(f.totalVat||0),0),b=T.reduce((i,f)=>i+(f.subtotal||0),0),t=T.reduce((i,f)=>i+(f.totalVat||0),0),c=Math.max(0,u-b),x=Math.max(0,h-t),s=k.filter(i=>i.status!=="cancelled").reduce((i,f)=>i+(f.subtotal||0),0),d=k.filter(i=>i.status!=="cancelled").reduce((i,f)=>i+(f.totalVat||0),0),I=w.reduce((i,f)=>i+(f.subtotal||0),0),M=w.reduce((i,f)=>i+(f.totalVat||0),0),B=A.reduce((i,f)=>i+(f.subtotal||0),0),a=A.reduce((i,f)=>i+(f.totalVat||0),0),v=Math.max(0,s+I-B),p=Math.max(0,d+M-a),r=x-p,V=r>0,S=r<0,R=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"});let n="";w.length>0&&(n=w.map((i,f)=>`
      <tr>
        <td style="text-align:center;font-family:monospace;color:#64748b;">${f+1}</td>
        <td style="font-family:monospace;white-space:nowrap;">${i.date||"—"}</td>
        <td style="font-weight:700;color:#0f172a;">${i.supplierName||"مورد خدمة"}</td>
        <td style="font-family:monospace;color:#475569;">${i.taxNumber||"—"}</td>
        <td style="font-family:monospace;color:#4338ca;font-weight:700;">#${i.number||"—"}</td>
        <td style="text-align:right;font-family:monospace;">${e(i.subtotal||0)} ر.س</td>
        <td style="text-align:right;font-family:monospace;font-weight:700;color:#16a34a;">${e(i.totalVat||0)} ر.س</td>
        <td style="text-align:right;font-family:monospace;font-weight:800;">${e(i.totalWithVat||0)} ر.س</td>
      </tr>
    `).join(""));const g=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>إقرار ضريبة القيمة المضافة - ${o.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 4mm 6mm 4mm 6mm; }
    * { 
      box-sizing: border-box; margin: 0; padding: 0; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body { font-family: 'Tajawal', sans-serif; background: #ffffff !important; color: #0f172a; line-height: 1.25; font-size: 9.5px; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    
    .vat-card { max-width: 100%; margin: 0 auto; background: #ffffff !important; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
    
    /* Company Header - Royal Blue */
    .company-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%) !important;
      color: #ffffff !important; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .company-title h1 { font-size: 18px; font-weight: 900; margin-bottom: 1px; letter-spacing: -0.3px; color: #ffffff !important; }
    .company-title h2 { font-size: 9.5px; font-weight: 500; color: #cbd5e1 !important; margin-bottom: 4px; font-family: sans-serif; }
    .company-meta { font-size: 9.5px; color: #f8fafc !important; display: flex; flex-wrap: wrap; gap: 12px; }
    .company-meta span { display: inline-flex; align-items: center; gap: 3px; color: #ffffff !important; }
    .company-meta strong { color: #fef08a !important; font-weight: 700; }
    .header-logo { width: 60px; height: 60px; background: #ffffff !important; border-radius: 10px; padding: 4px; display: flex; align-items: center; justify-content: center; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .header-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Doc Title Banner */
    .doc-banner {
      background: #f8fafc !important; border-bottom: 1px solid #e2e8f0; padding: 8px 18px; display: flex; justify-content: space-between; align-items: center;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .doc-badge {
      display: inline-flex; align-items: center; gap: 6px; background: #1e3a8a !important; color: #ffffff !important; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 11px;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .doc-period { font-size: 10.5px; color: #334155; font-weight: 700; }

    .content-pad { padding: 10px 18px; }

    /* Tables */
    .section-title {
      font-size: 11px; font-weight: 800; margin: 8px 0 4px 0; display: flex; align-items: center; gap: 5px;
    }
    .section-title.output { color: #1e40af; }
    .section-title.input { color: #047857; }
    .section-title.summary { color: #0f172a; }

    .tax-table {
      width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9.5px; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; page-break-inside: avoid;
    }
    .tax-table th { background: #f1f5f9 !important; color: #1e293b; font-weight: 800; text-align: right; padding: 4px 8px; border-bottom: 1px solid #cbd5e1; font-size: 9.5px; -webkit-print-color-adjust: exact !important; }
    .tax-table td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 9.5px; }
    .tax-table tr:last-child td { border-bottom: none; }
    .tax-table tr.total-row { background: #f8fafc !important; font-weight: 900; font-size: 10px; border-top: 2px solid #cbd5e1; -webkit-print-color-adjust: exact !important; }

    /* Result Box */
    .result-box {
      border: 2px solid ${V?"#ef4444":"#16a34a"} !important; border-radius: 8px; padding: 8px 14px; background: ${V?"#fef2f2":"#f0fdf4"} !important; display: flex; justify-content: space-between; align-items: center; margin: 8px 0; page-break-inside: avoid;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .result-label { font-size: 11.5px; font-weight: 800; color: ${V?"#991b1b":"#166534"}; }
    .result-desc { font-size: 9.5px; color: #475569; margin-top: 1px; }
    .result-amount { font-size: 18px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; color: ${V?"#dc2626":"#15803d"}; }

    /* Signatures */
    .signatures {
      margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; page-break-inside: avoid;
    }
    .sig-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; background: #fafafa !important; -webkit-print-color-adjust: exact !important; }
    .sig-title { font-weight: 800; font-size: 9.5px; color: #1e3a8a; margin-bottom: 18px; }
    .sig-line { border-top: 1px dotted #94a3b8; padding-top: 2px; font-size: 8.5px; color: #64748b; }

    @media print {
      html, body { height: 100%; overflow: hidden; background: #fff !important; }
      .vat-card { border: none; box-shadow: none; }
      .no-print { display: none !important; }
      tr, .tax-table, .result-box, .signatures { page-break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="vat-card">
    <!-- Header -->
    <div class="company-header">
      <div class="company-title">
        <h1>${o.name}</h1>
        <h2>${o.nameEn}</h2>
        <div class="company-meta">
          <span>🏛️ س.ت: <strong class="mono">${o.crNumber}</strong></span>
          <span>🏷️ الرقم الضريبي: <strong class="mono">${o.vatNumber}</strong></span>
          <span>📍 ${o.address}</span>
          <span>📞 ${o.phone}</span>
        </div>
      </div>
      <div class="header-logo">
        ${o.logoUrl?`<img src="${o.logoUrl}" alt="شعار الشركة" />`:'<div style="font-weight:900;font-size:24px;color:#1e3a8a;">MSS</div>'}
      </div>
    </div>

    <!-- Doc Banner -->
    <div class="doc-banner">
      <div class="doc-badge">
        <span>📋 إقرار ضريبة القيمة المضافة الرسمي (ZATCA VAT Return)</span>
      </div>
      <div class="doc-period">
        الفترة الضريبية: <strong class="mono">${l||"—"}</strong> إلى <strong class="mono">${m||"—"}</strong>
        <span style="margin-right:12px;font-size:10px;color:#64748b;">(تاريخ الاستخراج: ${R})</span>
      </div>
    </div>

    <div class="content-pad">
      <!-- Output Tax Table -->
      <div class="section-title output">
        <span>📤 الجزء الأول: ضريبة المخرجات (Output VAT) — المبيعات والإيرادات</span>
      </div>
      <table class="tax-table">
        <thead>
          <tr>
            <th style="width:50%;">البيان والتفاصيل</th>
            <th style="width:15%;text-align:center;">عدد العمليات</th>
            <th style="width:18%;text-align:right;">المبلغ الخاضع للضريبة (ر.س)</th>
            <th style="width:17%;text-align:right;">مبلغ الضريبة 15% (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. إجمالي مبيعات البضائع والخدمات الخاضعة للنسبة الأساسية (15%)</td>
            <td style="text-align:center;" class="mono">${z.filter(i=>i.status!=="cancelled").length}</td>
            <td style="text-align:right;" class="mono font-bold">${e(u)}</td>
            <td style="text-align:right;color:#dc2626;" class="mono font-bold">${e(h)}</td>
          </tr>
          <tr>
            <td>2. يخصم: مردودات ومسموحات المبيعات الخاضعة للضريبة</td>
            <td style="text-align:center;" class="mono">${T.length}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${e(b)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono">- ${e(t)}</td>
          </tr>
          <tr class="total-row">
            <td>صافي ضريبة المخرجات المستحقة (1)</td>
            <td style="text-align:center;">—</td>
            <td style="text-align:right;" class="mono">${e(c)} ر.س</td>
            <td style="text-align:right;color:#dc2626;" class="mono font-bold">${e(x)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <!-- Input Tax Table -->
      <div class="section-title input">
        <span>📥 الجزء الثاني: ضريبة المدخلات (Input VAT) — المشتريات والخدمات والقيود</span>
      </div>
      <table class="tax-table">
        <thead>
          <tr>
            <th style="width:50%;">البيان والتفاصيل</th>
            <th style="width:15%;text-align:center;">عدد العمليات</th>
            <th style="width:18%;text-align:right;">المبلغ الخاضع للضريبة (ر.س)</th>
            <th style="width:17%;text-align:right;">الضريبة المستردة 15% (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. إجمالي مشتريات البضائع المحلية الخاضعة للنسبة الأساسية (15%)</td>
            <td style="text-align:center;" class="mono">${k.filter(i=>i.status!=="cancelled").length}</td>
            <td style="text-align:right;" class="mono font-bold">${e(s)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">${e(d)}</td>
          </tr>
          <tr>
            <td>2. قيود الخدمات والمصاريف التشغيلية الخاضعة (قيود اليومية وخدمات الموردين)</td>
            <td style="text-align:center;" class="mono">${w.length}</td>
            <td style="text-align:right;color:#4338ca;" class="mono font-bold">+ ${e(I)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">+ ${e(M)}</td>
          </tr>
          <tr>
            <td>3. يخصم: مردودات المشتريات الخاضعة للضريبة</td>
            <td style="text-align:center;" class="mono">${A.length}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${e(B)}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${e(a)}</td>
          </tr>
          <tr class="total-row">
            <td>صافي ضريبة المدخلات القابلة للاسترداد (2)</td>
            <td style="text-align:center;">—</td>
            <td style="text-align:right;" class="mono">${e(v)} ر.س</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">${e(p)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <!-- Result Box -->
      <div class="result-box">
        <div>
          <div class="result-label">
            ${V?"⚠️ صافي الضريبة المستحقة للسداد لهيئة الزكاة والضريبة والجمارك (Net VAT Payable)":S?"💚 صافي الضريبة القابلة للاسترداد أو التدوير من الهيئة (Net VAT Refundable)":"✓ الحساب متوازن تماماً (Zero Balance)"}
          </div>
          <div class="result-desc">
            (صافي ضريبة المخرجات: ${e(x)} ر.س) - (صافي ضريبة المدخلات: ${e(p)} ر.س)
          </div>
        </div>
        <div class="result-amount">
          ${e(Math.abs(r))} ر.س
        </div>
      </div>

      ${w.length>0?`
      <!-- Supporting Service Entries Table -->
      <div class="section-title summary" style="font-size:12px;margin-top:14px;">
        <span>📑 سجل قيود الخدمات والمصاريف الضريبية المرفقة بالإقرار:</span>
      </div>
      <table class="tax-table" style="font-size:10.5px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="width:30px;text-align:center;">#</th>
            <th style="width:80px;">التاريخ</th>
            <th>اسم المورد / مقدم الخدمة</th>
            <th style="width:130px;">الرقم الضريبي للمورد</th>
            <th style="width:90px;">رقم الفاتورة</th>
            <th style="width:95px;text-align:right;">المبلغ الخاضع</th>
            <th style="width:85px;text-align:right;">الضريبة 15%</th>
            <th style="width:95px;text-align:right;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${n}
        </tbody>
      </table>`:""}

      <!-- Signatures -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">إعداد: المحاسب المالي</div>
          <div class="sig-line">التوقيع والتاريخ</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">مراجعة: المدير المالي / المستشار الضريبي</div>
          <div class="sig-line">التوقيع والاعتماد</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">الاعتماد والختم الرسمي للمنشأة</div>
          <div class="sig-line">ختم الشركة المعتمد</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,$=window.open("","_blank","width=920,height=950");if(!$){window.showToast?.("يرجى السماح بالنوافذ المنبثقة لطباعة الإقرار","warn");return}$.document.open(),$.document.write(g),$.document.close(),setTimeout(()=>{$.focus(),$.print()},400)};window.printVATReturn=window.printVatDeclaration;export{dt as render};
