const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-3Bsn2yrt.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as J,a as b,f as a,F as K,_ as Q}from"./index-3Bsn2yrt.js";import{e as X}from"./excel-zCoXiaxq.js";import{orderBy as Z,getDocs as w,query as S,where as B}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let M=[],C=null,r=[],f=null;const _=()=>new Date().toISOString().slice(0,10),tt=()=>`${new Date().getFullYear()}-01-01`;async function ut(e,o){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="filter-select-group" style="min-width:260px;">
        <label>اختر المورد *</label>
        <select id="stmt-sup-select" class="input" onchange="window.onSupplierSelectChange(this.value)">
          <option value="">-- اختر المورد لعرض الكشف --</option>
        </select>
      </div>

      <div class="filter-date-group">
        <label>من تاريخ</label>
        <input type="date" id="stmt-sup-from" class="input" value="${tt()}" onchange="window.reloadSupplierStatement()" />
      </div>

      <div class="filter-date-group">
        <label>إلى تاريخ</label>
        <input type="date" id="stmt-sup-to" class="input" value="${_()}" onchange="window.reloadSupplierStatement()" />
      </div>

      <div class="filter-select-group">
        <label>نوع الحركة</label>
        <select id="stmt-sup-type-filter" class="input" onchange="window.filterSupplierStatementType(this.value)">
          <option value="all">كل الحركات</option>
          <option value="purchase">فواتير مشتريات فقط</option>
          <option value="payment">سندات صرف فقط</option>
          <option value="receipt">سندات قبض (استرداد) فقط</option>
          <option value="return">مردودات شراء فقط</option>
          <option value="journal">قيود اليومية والافتتاحية فقط</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.exportSupplierStatementExcel()">📊 Excel</button>
        <button class="btn btn-secondary" style="color:#25D366;" onclick="window.shareSupplierStatementWhatsApp()">💬 واتساب</button>
        <button class="btn btn-secondary" onclick="window.printSupplierConfirmationLetter()">📑 مصادقة رصيد</button>
        <button class="btn btn-primary" onclick="window.printSupplierStatement()">🖨️ طباعة كشف الحساب</button>
      </div>
    </div>

    <div class="page-content" id="supplier-statement-content">
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);" id="stmt-sup-empty-placeholder">
        <div style="font-size:44px; margin-bottom:12px;">📊</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">يرجى اختيار مورد لعرض كشف الحساب وتحليل المستحقات</div>
        <div style="font-size:12px; margin-top:4px;">سيتم جلب كافة فواتير المشتريات وسندات الصرف وسندات القبض ومردودات الشراء آلياً</div>
      </div>
    </div>

    <!-- Drill-down Modal -->
    <div class="modal-overlay" id="doc-sup-preview-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="doc-sup-modal-title">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('doc-sup-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="doc-sup-modal-body" style="padding:20px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('doc-sup-preview-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,await et(),ot()}async function et(){try{M=await J(b.suppliers(),[Z("name")]);const e=document.getElementById("stmt-sup-select");if(!e)return;e.innerHTML='<option value="">-- اختر المورد لعرض الكشف --</option>'+M.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),C&&(e.value=C,await window.reloadSupplierStatement())}catch(e){console.warn("Error loading suppliers for statement:",e)}}async function nt(e,o,l){const s=M.find(n=>n.id===e)||await K("suppliers",e).catch(()=>null);if(f=s,!s)return null;const i=(s.name||"").trim().toLowerCase(),v=await w(S(b.chartOfAccounts(),B("sourceEntityId","==",e))).catch(()=>({docs:[]})),y=new Set,c=new Set;v.docs.forEach(n=>{c.add(n.id),n.data().code&&y.add(n.data().code)});const[m,N,F,H,W]=await Promise.all([w(S(b.purchaseInvoices(),B("supplierId","==",e))).catch(()=>({docs:[]})),w(S(b.expenses?b.expenses():"expenses",B("targetId","==",e))).catch(()=>({docs:[]})),w(S(b.receipts?b.receipts():"receipts",B("targetId","==",e))).catch(()=>({docs:[]})),w(S(b.purchaseReturns?b.purchaseReturns():"purchaseReturns",B("supplierId","==",e))).catch(()=>({docs:[]})),w(b.journalEntries()).catch(()=>({docs:[]}))]);let g=[];m.docs.forEach(n=>{const t=n.data();if(t.status==="cancelled")return;const d=t.date||t.invoiceDate||"",p=parseFloat(t.totalWithVat||t.grandTotal||t.total||0);g.push({id:n.id,docNumber:t.number||t.invoiceNumber||n.id.slice(0,8),date:d,type:"purchase",typeLabel:"فاتورة مشتريات",typeBadge:'<span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:700;">فاتورة مشتريات</span>',description:t.notes||`شراء بضاعة ومواد غذائية (فاتورة ${t.number||""})`,debit:0,credit:p,raw:t})}),N.docs.forEach(n=>{const t=n.data();if(t.status==="cancelled")return;const d=t.date||"",p=parseFloat(t.amount||0);g.push({id:n.id,docNumber:t.number||t.voucherNumber||n.id.slice(0,8),date:d,type:"payment",typeLabel:"سند صرف",typeBadge:'<span class="badge good" style="font-weight:700;">سند صرف نقدي/بنكي</span>',description:t.notes||t.description||`سداد دفعة من الحساب (${t.paymentMethod||"تحويل بنكي"})`,debit:p,credit:0,raw:t})}),F.docs.forEach(n=>{const t=n.data();if(t.status==="cancelled"||t.entityType&&t.entityType!=="supplier")return;const d=t.date||"",p=parseFloat(t.amount||0);g.push({id:n.id,docNumber:t.number||t.voucherNumber||`RV-${n.id.slice(0,6).toUpperCase()}`,date:d,type:"receipt",typeLabel:"سند قبض من مورد",typeBadge:'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); font-weight:700;">💵 سند قبض من مورد</span>',description:t.notes?`سند قبض من المورد — ${t.notes} (${t.sourceName||(t.method==="cash"?"نقدي":"بنكي")})`:`قبض/استرداد دفعة من المورد (${t.sourceName||"نقدي/بنكي"})`,debit:0,credit:p,raw:t})}),H.docs.forEach(n=>{const t=n.data();if(t.status==="cancelled")return;const d=t.date||"",p=parseFloat(t.totalWithVat||t.total||0);g.push({id:n.id,docNumber:t.number||t.returnNumber||n.id.slice(0,8),date:d,type:"return",typeLabel:"مردودات شراء",typeBadge:'<span class="badge warn" style="font-weight:700;">مردود شراء</span>',description:t.reason||t.notes||"مرتجع بضاعة للمورد",debit:p,credit:0,raw:t})}),W.docs.forEach(n=>{const t=n.data();if(t.status==="cancelled"||t.isReversed)return;const d=(t.sourceType||"").toLowerCase(),p=(t.refType||"").toLowerCase(),h=(t.description||"").toLowerCase(),Y=t.auto===!0||d==="purchase"||d==="purchaseinvoice"||d==="purchase_invoice"||d==="expense"||d==="supplierpayment"||d==="purchase_return"||d==="purchasereturn"||d==="sales"||d==="salesinvoice"||d==="receipt"||d==="salesreturn"||p.includes("purchase")||p.includes("invoice")||p.includes("expense")||p.includes("return")||p.includes("receipt")||h.includes("فاتورة")||h.includes("مشتريات")||h.includes("سند صرف")||h.includes("سند قبض")||h.includes("مرتجع")||t.sourceId&&(m.docs.some(u=>u.id===t.sourceId)||N.docs.some(u=>u.id===t.sourceId)||F.docs.some(u=>u.id===t.sourceId)),U=h.includes("افتتاحي")||d==="opening"||p==="opening";Y&&!U||(t.lines||[]).forEach((u,G)=>{const T=u.accountId,L=u.accountCode,z=(u.accountName||"").trim().toLowerCase();if(T&&c.has(T)||L&&y.has(L)||i&&z&&(z===i||z.includes(i)||i.includes(z))){const j=parseFloat(u.debit||0),P=parseFloat(u.credit||0);if(j===0&&P===0)return;const O=(t.description||"").includes("افتتاحي")||(u.note||"").includes("افتتاحي")||t.sourceType==="opening";g.push({id:`${n.id}_${G}`,docNumber:t.entryNumber||t.number||n.id.slice(0,8),date:t.date||"",type:"journal",typeLabel:O?"قيد رصيد افتتاحي":"قيد يومية",typeBadge:O?'<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⚖️ قيد افتتاحى</span>':'<span class="badge" style="background:#f3e8ff; color:#7e22ce; font-weight:700;">📝 قيد تسوية/يومية</span>',description:t.description||u.note||u.accountName||"قيد محاسبي مرحل",debit:j,credit:P,raw:t})}})}),g.sort((n,t)=>(n.date||"").localeCompare(t.date||""));let D=0;const x=[];g.forEach(n=>{o&&n.date<o?D+=n.credit-n.debit:(!l||n.date<=l)&&x.push(n)});let E=D;x.forEach(n=>{E+=n.credit-n.debit,n.balanceAfter=E});const q=g.filter(n=>n.type==="purchase"||n.type==="journal"&&n.credit>0).map(n=>({date:n.date,amount:n.credit,remaining:n.credit})).reverse();let k=Math.max(0,E),$={d0_30:0,d31_60:0,d61_90:0,d90_plus:0};const V=new Date;for(const n of q){if(k<=0)break;const t=Math.min(k,n.remaining),d=new Date(n.date||_()),p=Math.max(0,Math.floor((V-d)/(1e3*60*60*24)));p<=30?$.d0_30+=t:p<=60?$.d31_60+=t:p<=90?$.d61_90+=t:$.d90_plus+=t,k-=t}let I=0;g.forEach(n=>{I+=n.credit-n.debit});const A=Math.round(I*100)/100;return s.id&&Math.abs((s.balance||0)-A)>.009&&(Q(async()=>{const{update:n}=await import("./index-3Bsn2yrt.js").then(t=>t.T);return{update:n}},__vite__mapDeps([0,1])).then(({update:n})=>{n("suppliers",s.id,{balance:A}).catch(()=>{})}),s.balance=A),{supplier:s,fromDate:o,toDate:l,openingBalance:D,closingBalance:E,transactions:x,allFiltered:x,totalDebit:x.reduce((n,t)=>n+t.debit,0),totalCredit:x.reduce((n,t)=>n+t.credit,0),aging:$}}function R(e){const o=document.getElementById("supplier-statement-content");if(!o||!e)return;const l=e.supplier,s=e.closingBalance>0;o.innerHTML=`
    <!-- Top Summary & Aging Cards -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">الرصيد الافتتاحي</div>
        <div class="mono" style="font-size:17px; font-weight:800; margin-top:4px;">${a(e.openingBalance)}</div>
      </div>
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي المشتريات (دائن)</div>
        <div class="mono font-bold" style="font-size:17px; color:var(--brand); margin-top:4px;">+ ${a(e.totalCredit)}</div>
      </div>
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي السدادات (مدين)</div>
        <div class="mono font-bold" style="font-size:17px; color:#10B981; margin-top:4px;">- ${a(e.totalDebit)}</div>
      </div>
      <div class="card" style="padding:14px; background:${s?"rgba(239,68,68,0.06)":"rgba(16,185,129,0.06)"}; border:1.5px solid ${s?"#EF4444":"#10B981"}; border-radius:12px;">
        <div style="font-size:11px; color:${s?"#EF4444":"#10B981"}; font-weight:800;">
          ${s?"المستحق النهائي للمورد (دائن)":e.closingBalance<0?"رصيد المورد (مدين لصالحنا)":"الرصيد المتبقي"}
        </div>
        <div class="mono font-bold" style="font-size:20px; color:${s?"#EF4444":"#10B981"}; margin-top:4px;">
          ${e.closingBalance<0?`(${a(Math.abs(e.closingBalance))}) مدين`:a(Math.abs(e.closingBalance))}
        </div>
      </div>
    </div>

    <!-- Aging of Payables Bar -->
    <div class="card mb-16" style="padding:14px 18px; border-radius:12px; background:var(--bg-card);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:800; font-size:13px; color:var(--text-0);">⏳ تحليل أعمار مستحقات المورد (Payables Aging):</div>
        <div style="font-size:11px; color:var(--text-2);">محسوبة بنظام الوارد أولاً يصرف أولاً FIFO</div>
      </div>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 حديث (0 - 30 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${a(e.aging.d0_30)}</div>
        </div>
        <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 متوسط (31 - 60 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${a(e.aging.d31_60)}</div>
        </div>
        <div style="background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخر (61 - 90 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${a(e.aging.d61_90)}</div>
        </div>
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">🔴 مستحق فوراً (+90 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${a(e.aging.d90_plus)}</div>
        </div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="card">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">
            📑 حركات كشف حساب: ${l.name}
          </h3>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
            الفترة من ${e.fromDate||"البداية"} إلى ${e.toDate||"اليوم"}
          </div>
        </div>
        <span class="badge" style="font-size:12px;">${e.transactions.length} حركة</span>
      </div>

      <div class="table-container">
        <table class="data-dense" id="stmt-sup-table">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:120px;">نوع الحركة</th>
              <th style="width:110px;">رقم المستند</th>
              <th>البيان والتفاصيل</th>
              <th style="width:110px; text-align:left;">مدين (سداد/مرتجع)</th>
              <th style="width:110px; text-align:left;">دائن (مشتريات/استرداد)</th>
              <th style="width:120px; text-align:left;">الرصيد التراكمي</th>
              <th style="width:50px; text-align:center;">معاينة</th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening balance row -->
            <tr style="background:var(--bg-2); font-weight:700;">
              <td class="mono">${e.fromDate||"—"}</td>
              <td><span class="badge neutral">رصيد سابق</span></td>
              <td class="mono">—</td>
              <td>رصيد ما قبل فترة الكشف</td>
              <td class="mono" style="text-align:left;">—</td>
              <td class="mono" style="text-align:left;">—</td>
              <td class="mono" style="text-align:left; color:var(--brand);">${a(e.openingBalance)}</td>
              <td style="text-align:center;">—</td>
            </tr>

            ${e.transactions.map(i=>`
              <tr>
                <td class="mono dim">${i.date||"—"}</td>
                <td>${i.typeBadge}</td>
                <td class="mono font-bold" style="color:var(--brand);">${i.docNumber}</td>
                <td style="font-size:12px;">${i.description}</td>
                <td class="mono font-bold" style="text-align:left; color:${i.debit>0?"#10B981":"var(--text-dim)"};">
                  ${i.debit>0?a(i.debit):"—"}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${i.credit>0?"var(--brand)":"var(--text-dim)"};">
                  ${i.credit>0?a(i.credit):"—"}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${i.balanceAfter>0?"#EF4444":"#10B981"};">
                  ${i.balanceAfter<0?`(${a(Math.abs(i.balanceAfter))}) مدين`:a(i.balanceAfter)}
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-icon sm btn-ghost" onclick="window.previewSupplierDoc('${i.type}', '${i.id}')" title="معاينة تفاصيل المستند">👁️</button>
                </td>
              </tr>
            `).join("")}

            <!-- Summary Totals Row -->
            <tr style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
              <td colspan="4" style="text-align:center;">الإجمالي الكلي للحركات والرصيد الختامي</td>
              <td class="mono font-bold" style="text-align:left; color:#10B981;">${a(e.totalDebit)}</td>
              <td class="mono font-bold" style="text-align:left; color:var(--brand);">${a(e.totalCredit)}</td>
              <td class="mono font-bold" style="text-align:left; color:${s?"#EF4444":"#10B981"}; font-size:14px;">
                ${e.closingBalance<0?`(${a(Math.abs(e.closingBalance))}) مدين`:a(e.closingBalance)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function ot(){window.selectSupplierForStmt=async e=>{C=e;const o=document.getElementById("stmt-sup-select");o&&(o.value=e),await window.reloadSupplierStatement()},window.onSupplierSelectChange=async e=>{C=e,await window.reloadSupplierStatement()},window.reloadSupplierStatement=async()=>{const e=document.getElementById("stmt-sup-select")?.value;if(!e){document.getElementById("supplier-statement-content").innerHTML=`
        <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
          <div style="font-size:44px; margin-bottom:12px;">📊</div>
          <div style="font-size:16px; font-weight:700;">يرجى اختيار مورد لعرض كشف الحساب</div>
        </div>
      `;return}const o=document.getElementById("stmt-sup-from")?.value||"",l=document.getElementById("stmt-sup-to")?.value||"";document.getElementById("supplier-statement-content").innerHTML=`
      <div style="text-align:center; padding:60px;"><span class="spin"></span> جاري جلب وتحليل حركات المورد...</div>
    `;const s=await nt(e,o,l);r=s,R(s)},window.filterSupplierStatementType=e=>{r&&(e==="all"?r.transactions=r.allFiltered:r.transactions=r.allFiltered.filter(o=>o.type===e),R(r))},window.previewSupplierDoc=(e,o)=>{const l=r?.allFiltered?.find(c=>c.id===o);if(!l)return;const s=document.getElementById("doc-sup-modal-title"),i=document.getElementById("doc-sup-modal-body");s.textContent=`${l.typeLabel} — ${l.docNumber}`;const v=l.raw||{};let y=`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; background:var(--bg-2); padding:12px; border-radius:8px; font-size:12.5px;">
        <div><span style="color:var(--text-3);">التاريخ:</span> <b class="mono">${l.date}</b></div>
        <div><span style="color:var(--text-3);">المورد:</span> <b>${f?.name||"—"}</b></div>
        <div><span style="color:var(--text-3);">المبلغ:</span> <b class="mono font-bold text-brand">${a(l.debit||l.credit)}</b></div>
        <div><span style="color:var(--text-3);">البيان:</span> <span>${l.description}</span></div>
      </div>
    `;if(e==="purchase"&&(v.lines||v.items)){const c=v.lines||v.items||[];y+=`
        <div style="font-weight:700; font-size:13px; margin-bottom:8px;">📦 الأصناف المشتراة بالفاتورة:</div>
        <table class="data-dense" style="margin:0;">
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="width:70px; text-align:center;">الكمية</th>
              <th style="width:90px; text-align:left;">سعر الوحدة</th>
              <th style="width:90px; text-align:left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${c.map(m=>`
              <tr>
                <td>${m.productName||m.name}</td>
                <td class="mono" style="text-align:center;">${m.qty||m.quantity||1} ${m.unit||""}</td>
                <td class="mono" style="text-align:left;">${a(m.unitPrice||m.price||0)}</td>
                <td class="mono font-bold" style="text-align:left;">${a(m.total||(m.qty||1)*(m.unitPrice||0))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}else e==="journal"&&v.lines&&(y+=`
        <div style="font-weight:700; font-size:13px; margin-bottom:8px;">⚖️ بنود وسطور القيد المحاسبي:</div>
        <table class="data-dense" style="margin:0;">
          <thead>
            <tr>
              <th>الحساب</th>
              <th style="width:110px; text-align:left;">مدين</th>
              <th style="width:110px; text-align:left;">دائن</th>
              <th>البيان الفرعي</th>
            </tr>
          </thead>
          <tbody>
            ${(v.lines||[]).map(c=>`
              <tr>
                <td><b>${c.accountCode?`<span class="mono" style="color:#6366f1;">${c.accountCode}</span> `:""}${c.accountName||"—"}</b></td>
                <td class="mono font-bold" style="text-align:left; color:${c.debit>0?"#10B981":"var(--text-dim)"};">${c.debit>0?a(c.debit):"—"}</td>
                <td class="mono font-bold" style="text-align:left; color:${c.credit>0?"var(--brand)":"var(--text-dim)"};">${c.credit>0?a(c.credit):"—"}</td>
                <td style="font-size:11px; color:var(--text-2);">${c.note||c.subDescription||"—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `);i.innerHTML=y,openModal("doc-sup-preview-modal")},window.shareSupplierStatementWhatsApp=()=>{if(!r||!f){alert("يرجى اختيار المورد أولاً");return}const e=f,o=(e.phone||"").replace(/[^0-9]/g,""),l=o.startsWith("0")?"966"+o.slice(1):o.startsWith("966")?o:"966"+o,s=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",i=`سعادة المورد المحترم / ${e.name}
تحية طيبة من ${s} 🌿

نرفق لكم ملخص كشف الحساب:
• الفترة: من ${r.fromDate||"البداية"} إلى ${r.toDate||_()}
• إجمالي المشتريات: ${a(r.totalCredit)}
• إجمالي المسدد: ${a(r.totalDebit)}
• الرصيد المستحق لكم: ${a(r.closingBalance)}

شاكرين حسن تعاونكم معنا!`;window.open(`https://api.whatsapp.com/send?phone=${l}&text=${encodeURIComponent(i)}`,"_blank")},window.printSupplierConfirmationLetter=()=>{if(!r||!f){alert("يرجى اختيار المورد أولاً");return}const e=f,o=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",vatNumber:"310000000000003"},l=window.open("","_blank");l.document.write(`
      <html dir="rtl">
        <head>
          <title>خطاب مصادقة رصيد مورد - ${e.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">${o.name}</h2>
            <div style="font-size:12px; color:#666;">الرقم الضريبي: ${o.vatNumber||"—"}</div>
            <h3 style="margin-top:15px; color:#4338CA;">خطاب مصادقة ومطابقة رصيد مورد</h3>
          </div>

          <p><b>السادة المحترمون / شركة: ${e.name}</b></p>
          <p>تحية طيبة وبعد،،،</p>
          <p>
            في إطار المراجعة الدورية للحسابات والمطابقة المحاسبية بين الطرفين، نرجو التكرم بالإحاطة بأن رصيد حسابكم المسجل في دفاترنا كما في تاريخ <b>${r.toDate||_()}</b> هو كالتالي:
          </p>

          <div class="box">
            <div>• الرصيد المستحق لكم في دفاترنا: <b>${a(r.closingBalance)}</b></div>
            <div>• إجمالي مسحوبات ومشتريات الفترة: <b>${a(r.totalCredit)}</b></div>
            <div>• إجمالي السدادات والحوالات المنفذة: <b>${a(r.totalDebit)}</b></div>
          </div>

          <p>نرجو التكرم بمطابقة الرصيد مع دفاتركم وإعادة توقيع وختم هذا الخطاب بالمصادقة أو إشعارنا بأي فروقات إن وجدت.</p>

          <div class="signatures">
            <div>
              <div>عن / ${o.name}</div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
            <div>
              <div>عن / ${e.name} (المورد)</div>
              <div class="sig-line">المصادقة والختم الرسمي</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };<\/script>
        </body>
      </html>
    `),l.document.close()},window.printSupplierStatement=()=>{window.print()},window.exportSupplierStatementExcel=()=>{if(!r)return;const e=r.transactions.map(o=>({التاريخ:o.date,"نوع الحركة":o.typeLabel,"رقم المستند":o.docNumber,البيان:o.description,"مدين (سداد)":o.debit,"دائن (مشتريات)":o.credit,"الرصيد التراكمي":o.balanceAfter}));X(e,`كشف_حساب_مورد_${f?.name||"المورد"}`)}}export{ut as render};
