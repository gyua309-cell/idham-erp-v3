import fs from 'fs';

const fileContent = `// ============================================================
// IDHAM ERP — Promissory Notes Module (سندات الأمر)
// نظام الأوراق التجارية السعودي — المرسوم الملكي م/37
// ============================================================
import { COLS, create, update, getAll,
         query, where, orderBy, getDocs, getDoc, doc, collection,
         db, COMPANY_ID, updateDoc } from "../utils/db.js";
import { formatCurrency } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

// ─── Patch COLS for promissoryNotes ──────────────────────────
function getPN_COL() {
  return collection(db, "companies/" + COMPANY_ID + "/promissoryNotes");
}

// ─── Constants ───────────────────────────────────────────────
const STATUS_LABELS = {
  active:    { label: "نشط",   color: "good",    icon: "🟢" },
  paid:      { label: "مسدد",  color: "neutral", icon: "✅" },
  overdue:   { label: "متأخر", color: "bad",     icon: "🔴" },
  cancelled: { label: "ملغي",  color: "neutral", icon: "⛔" },
};

let cachedNotes  = [];
let _currentUser = null;

// ─── Arabic Number to Words ───────────────────────────────────
function numberToArabicWords(n) {
  if (!n || isNaN(n)) return "صفر ريال سعودي";
  const ones = ["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة",
    "عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر",
    "سبعة عشر","ثمانية عشر","تسعة عشر"];
  const tens = ["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
  const hundreds = ["","مئة","مئتان","ثلاثمئة","أربعمئة","خمسمئة","ستمئة","سبعمئة","ثمانمئة","تسعمئة"];
  const thousands = ["","ألف","ألفان","ثلاثة آلاف","أربعة آلاف","خمسة آلاف","ستة آلاف",
    "سبعة آلاف","ثمانية آلاف","تسعة آلاف"];
  const num  = Math.floor(Math.abs(n));
  const fils = Math.round((Math.abs(n) - num) * 100);
  function belowThousand(x) {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    const t = Math.floor(x/10), o = x%10;
    return o === 0 ? tens[t] : ones[o] + " و" + tens[t];
  }
  function convert(x) {
    if (x === 0) return "صفر";
    let r = "";
    const th = Math.floor(x/1000), rem = x%1000;
    const h = Math.floor(rem/100), rv = rem%100;
    if (th > 0) { r += th < 10 ? thousands[th] : belowThousand(th)+" ألف"; if (h>0||rv>0) r += " و"; }
    if (h  > 0) { r += hundreds[h]; if (rv>0) r += " و"; }
    if (rv > 0) r += belowThousand(rv);
    return r;
  }
  const mills = Math.floor(num/1000000), rem = num%1000000;
  let result = "";
  if (mills > 0) result += convert(mills)+" مليون ";
  result += convert(rem);
  let final = result.trim()+" ريال سعودي";
  if (fils > 0) final += " و"+convert(fils)+" هللة";
  return final + " لا غير";
}

// ─── Auto Number ──────────────────────────────────────────────
async function generateNoteNumber() {
  const year = new Date().getFullYear();
  try {
    const snap = await getDocs(query(getPN_COL(), orderBy("noteNumber","desc")));
    const matching = snap.docs.map(d=>d.data().noteNumber||"").filter(x=>x.startsWith("PN-" + year + "-"));
    const seq = matching.length > 0
      ? (parseInt((matching[0].split("-")[3]||"0"))||0) + 1 : 1;
    return "PN-" + year + "-" + String(seq).padStart(4,"0");
  } catch { return "PN-" + year + "-0001"; }
}

// ─── Hijri approx ────────────────────────────────────────────
function toHijriApprox(isoDate) {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"}).format(new Date(isoDate));
  } catch { return isoDate; }
}

// ─── Render ───────────────────────────────────────────────────
export async function render(container, user) {
  _currentUser = user;
  container.innerHTML = \`
    <div class="filterbar" style="flex-wrap:wrap;gap:8px;">
      <div class="search-bar" style="max-width:240px;">
        <input type="text" id="pn-search" class="input" placeholder="🔍  بحث…" oninput="filterNotes()"/>
      </div>
      <div class="filter-select-group"><label>الحالة</label>
        <select id="pn-status-filter" onchange="filterNotes()">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="overdue">متأخر</option>
          <option value="due_soon">مستحق قريباً (7 أيام)</option>
          <option value="paid">مسدد</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export excel" onclick="exportNotesExcel()" title="تصدير كشف سندات الأمر"><span>📊</span> تصدير Excel</button>
        <button class="btn-export print" onclick="window.print()">🖨️ طباعة</button>
        <button class="btn btn-primary" onclick="openNewNoteModal()">📜 + إصدار سند أمر</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">سندات الأمر (Promissory Notes)</h1>
          <p class="page-subtitle" id="pn-count">جاري التحميل…</p>
        </div>
      </div>
      <div class="kpi-grid" id="pn-kpis" style="margin-bottom:20px;"></div>
      <div class="card"><div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>رقم السند</th><th>العميل</th><th>المبلغ الأصل</th><th>المسدد / المتبقي</th>
            <th>تاريخ الإصدار</th><th>الاستحقاق</th><th>الحالة</th>
            <th style="text-align:center;">الإجراءات</th>
          </tr></thead>
          <tbody id="pn-tbody">
            <tr><td colspan="8" style="text-align:center;padding:32px;"><div class="sk" style="height:14px;width:60%;margin:auto;"></div></td></tr>
          </tbody>
        </table>
      </div></div>
    </div>
    <div id="pn-modal" style="display:none;" class="modal-overlay" onclick="if(event.target===this)closePnModal()">
      <div class="modal-box" style="max-width:620px;width:94vw;">
        <div class="modal-header">
          <h2 class="modal-title" id="pn-modal-title">📜 إصدار سند أمر جديد</h2>
          <button class="modal-close" onclick="closePnModal()">✕</button>
        </div>
        <div class="modal-body" id="pn-modal-body"></div>
      </div>
    </div>\`;

  injectStyles();
  window.filterNotes        = filterNotes;
  window.openNewNoteModal   = openNewNoteModal;
  window.closePnModal       = closePnModal;
  window.savePnNote         = savePnNote;
  window.markNoteAsPaid     = markNoteAsPaid;
  window.payPartialNote     = payPartialNote;
  window.cancelNote         = cancelNote;
  window.printNote          = printNote;
  window.viewNote           = viewNote;
  window.exportNotesExcel   = exportNotesExcel;
  window.searchPnCustomer   = searchPnCustomer;
  window.selectPnCustomer   = selectPnCustomer;
  window.updateAmountWords  = updateAmountWords;
  window.toggleDueDate      = toggleDueDate;
  await loadNotes();
}

function injectStyles() {
  if (document.getElementById("pn-styles")) return;
  const s = document.createElement("style"); s.id = "pn-styles";
  s.innerHTML = \`
    .pn-sb { padding:2px 9px; border-radius:10px; font-size:11px; font-weight:700; }
    .pn-active    { background:rgba(16,185,129,.12); color:#059669; }
    .pn-paid      { background:rgba(107,114,128,.12); color:#6B7280; }
    .pn-overdue   { background:rgba(239,68,68,.12); color:#DC2626; }
    .pn-cancelled { background:rgba(107,114,128,.12); color:#9CA3AF; }
    .pn-ac-item { padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border); }
    .pn-ac-item:hover { background:var(--bg-2); }
  \`;
  document.head.appendChild(s);
}

// ─── Load ─────────────────────────────────────────────────────
async function loadNotes() {
  try {
    const snap = await getDocs(query(getPN_COL(), orderBy("createdAt","desc")));
    cachedNotes = snap.docs.map(d=>({id:d.id,...d.data()}));
    const today = new Date().toISOString().slice(0,10);
    cachedNotes.forEach(n=>{
      const remaining = n.amount - (n.paidAmount || 0);
      if (remaining <= 0 && n.status !== "cancelled") {
        n.status = "paid";
      } else if (n.status==="active" && n.dueDate && n.dueDate!=="لدى الاطلاع" && n.dueDate<today) {
        n.status = "overdue";
      }
    });
    renderKPIs(); filterNotes();
  } catch(e) {
    document.getElementById("pn-tbody").innerHTML =
      \`<tr><td colspan="8" style="text-align:center;color:var(--text-bad);">\${e.message}</td></tr>\`;
  }
}

function renderKPIs() {
  const active  = cachedNotes.filter(n=>n.status==="active");
  const overdue = cachedNotes.filter(n=>n.status==="overdue");
  const paid    = cachedNotes.filter(n=>n.status==="paid");
  
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().slice(0,10);
  const next7Str = next7Days.toISOString().slice(0,10);
  
  const dueSoon = cachedNotes.filter(n => 
    (n.status === "active" || n.status === "overdue") &&
    n.dueDate && n.dueDate !== "لدى الاطلاع" &&
    n.dueDate >= todayStr && n.dueDate <= next7Str
  );

  const tA = active.reduce((s,n)=>s+((n.amount||0) - (n.paidAmount||0)),0);
  const tO = overdue.reduce((s,n)=>s+((n.amount||0) - (n.paidAmount||0)),0);

  document.getElementById("pn-kpis").innerHTML = \`
    <div class="inv-kpi-card"><div class="inv-kpi-val">\${active.length+overdue.length}</div><div class="inv-kpi-label">سندات قيد التحصيل</div></div>
    <div class="inv-kpi-card" style="border-color:var(--brand);"><div class="inv-kpi-val" style="color:var(--brand);">\${formatCurrency(tA)}</div><div class="inv-kpi-label">المتبقي للتسديد</div></div>
    <div class="inv-kpi-card" style="border-color:#EF4444;"><div class="inv-kpi-val" style="color:#EF4444;">\${overdue.length}</div><div class="inv-kpi-label">متأخرة — \${formatCurrency(tO)}</div></div>
    <div class="inv-kpi-card" style="border-color:#F59E0B;"><div class="inv-kpi-val" style="color:#F59E0B;">\${dueSoon.length}</div><div class="inv-kpi-label">مستحقة خلال 7 أيام</div></div>
    <div class="inv-kpi-card"><div class="inv-kpi-val" style="color:#10B981;">\${paid.length}</div><div class="inv-kpi-label">سندات مكتملة</div></div>\`;
}

function filterNotes() {
  const q  = (document.getElementById("pn-search")?.value||"").toLowerCase();
  const st = document.getElementById("pn-status-filter")?.value||"";
  
  const todayStr = new Date().toISOString().slice(0,10);
  const next7Days = new Date();
  next7Days.setDate(new Date().getDate() + 7);
  const next7Str = next7Days.toISOString().slice(0,10);

  let list = cachedNotes;
  if (st === "due_soon") {
    list = list.filter(n => (n.status === "active" || n.status === "overdue") && n.dueDate && n.dueDate !== "لدى الاطلاع" && n.dueDate >= todayStr && n.dueDate <= next7Str);
  } else if (st) {
    list = list.filter(n=>n.status===st);
  }

  if (q)  list = list.filter(n=>(n.noteNumber||"").toLowerCase().includes(q)||(n.customerName||"").includes(q));
  const lbl = document.getElementById("pn-count");
  if (lbl) lbl.textContent = \`\${list.length} سند\`;

  document.getElementById("pn-tbody").innerHTML = list.length===0
    ? \`<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد سندات مطابقة</td></tr>\`
    : list.map(n=>{
        const s=STATUS_LABELS[n.status]||STATUS_LABELS.active;
        const paid = n.paidAmount || 0;
        const rem = (n.amount || 0) - paid;
        return \`<tr>
          <td class="mono font-bold" style="color:var(--brand);cursor:pointer;" onclick="viewNote('\${n.id}')">\${n.noteNumber}</td>
          <td><strong>\${n.customerName||"—"}</strong></td>
          <td class="mono font-bold">\${formatCurrency(n.amount||0)}</td>
          <td class="mono">
            <span style="color:#10B981;font-size:11px;">\${formatCurrency(paid)}</span> / 
            <strong style="color:\${rem > 0 ? "#DC2626" : "#6B7280"};">\${formatCurrency(rem)}</strong>
          </td>
          <td class="mono dim">\${n.issueDate||"—"}</td>
          <td class="mono dim">\${n.dueDate||"—"}</td>
          <td><span class="pn-sb pn-\${n.status}">\${s.icon} \${s.label}</span></td>
          <td style="text-align:center;">
            <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">
              <button class="btn btn-icon sm btn-ghost" onclick="printNote('\${n.id}')" title="طباعة">🖨️</button>
              \${(n.status==="active"||n.status==="overdue")?\`
              <button class="btn btn-icon sm" style="background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.25);" onclick="payPartialNote('\${n.id}')" title="تسديد كلي أو جزئي">💳 تسديد</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="cancelNote('\${n.id}')" title="إلغاء السند">⛔</button>\`:""}
            </div>
          </td>
        </tr>\`;
      }).join("");
}

// ─── New Note Modal ───────────────────────────────────────────
async function openNewNoteModal(prefillId=null, prefillName=null) {
  let companyCity="ينبع", companyName="شركة نظم الإمداد الحديثة", companyCR="4700124180";
  try {
    const compSnap = await getDoc(doc(db,"companies",COMPANY_ID));
    if (compSnap.exists()) {
      const d=compSnap.data()||{};
      companyCity = d.city||d.cityAr||companyCity;
      companyName = d.name||d.nameAr||companyName;
      companyCR   = d.crNumber||d.commercialRegistration||companyCR;
    }
  } catch{}
  const noteNum = await generateNoteNumber();
  const today   = new Date().toISOString().slice(0,10);
  document.getElementById("pn-modal-title").textContent = "📜 إصدار سند أمر جديد";
  document.getElementById("pn-modal-body").innerHTML = \`
    <form id="pn-form" onsubmit="savePnNote(event)" autocomplete="off">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label">رقم السند (تلقائي)</label>
          <input class="input" id="pn-num" value="\${noteNum}" readonly style="background:var(--bg-2);"/>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الإصدار *</label>
          <input class="input" type="date" id="pn-issue-date" value="\${today}" required/>
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">العميل (المدين) *</label>
          <div style="position:relative;">
            <input class="input" id="pn-cust-search" placeholder="🔍 ابحث عن عميل…" oninput="searchPnCustomer(this.value)" autocomplete="off" value="\${prefillName||""}"/>
            <div id="pn-cust-dd" style="position:absolute;top:100%;right:0;left:0;background:var(--bg-1);border:1px solid var(--border);border-radius:8px;z-index:200;max-height:200px;overflow-y:auto;display:none;box-shadow:var(--shadow);"></div>
          </div>
          <input type="hidden" id="pn-cust-id" value="\${prefillId||""}"/>
          <input type="hidden" id="pn-cust-cl" value="0"/>
          <input type="hidden" id="pn-cust-bal" value="0"/>
          <div id="pn-credit-bar" style="margin-top:6px;display:none;"></div>
        </div>
        <div class="form-group">
          <label class="form-label">رقم الهوية / السجل التجاري للعميل</label>
          <input class="input" id="pn-cust-id-num" placeholder="اختياري"/>
        </div>
        <div class="form-group">
          <label class="form-label">المبلغ (رقماً) *</label>
          <input class="input" type="number" id="pn-amount" min="1" step="0.01" placeholder="0.00" required oninput="updateAmountWords()"/>
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">المبلغ كتابةً (تلقائي)</label>
          <input class="input" id="pn-amount-words" readonly style="background:var(--bg-2);font-size:12px;" placeholder="—"/>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input class="input" type="date" id="pn-due-date" style="flex:1;"/>
            <label style="white-space:nowrap;font-size:12px;display:flex;align-items:center;gap:4px;">
              <input type="checkbox" id="pn-on-demand" onchange="toggleDueDate(this)"/> لدى الاطلاع
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">مدينة الإصدار</label>
          <input class="input" id="pn-issue-city" value="\${companyCity}"/>
        </div>
        <div class="form-group">
          <label class="form-label">مدينة الوفاء</label>
          <input class="input" id="pn-pay-city" value="\${companyCity}"/>
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">ملاحظات / بيان السبب</label>
          <textarea class="input" id="pn-notes" rows="2" style="resize:vertical;" placeholder="مرتبط بفاتورة رقم … إلخ"></textarea>
        </div>
      </div>
      <input type="hidden" id="pn-company-name" value="\${companyName}"/>
      <input type="hidden" id="pn-company-cr"   value="\${companyCR}"/>
      <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
        <button type="button" class="btn btn-secondary" onclick="closePnModal()">إلغاء</button>
        <button type="submit" class="btn btn-primary">📜 إصدار السند</button>
      </div>
    </form>\`;
  if (prefillId) {
    try {
      const cs = await getDoc(doc(db, "companies/" + COMPANY_ID + "/customers", prefillId));
      if (cs.exists()) {
        const c=cs.data();
        document.getElementById("pn-cust-id-num").value=c.idNumber||c.crNumber||"";
        document.getElementById("pn-cust-cl").value=c.creditLimit||0;
        document.getElementById("pn-cust-bal").value=c.balance||0;
        renderCreditBar(c.creditLimit||0,c.balance||0,0);
      }
    } catch{}
  }
  document.getElementById("pn-modal").style.display="flex";
}

function toggleDueDate(cb) {
  const inp=document.getElementById("pn-due-date");
  inp.disabled=cb.checked; if(cb.checked) inp.value="";
}
function updateAmountWords() {
  const v=parseFloat(document.getElementById("pn-amount")?.value||0);
  const w=document.getElementById("pn-amount-words");
  if(w) w.value=v>0?numberToArabicWords(v):"";
  const cl=parseFloat(document.getElementById("pn-cust-cl")?.value||0);
  const bal=parseFloat(document.getElementById("pn-cust-bal")?.value||0);
  renderCreditBar(cl,bal,v);
}
function renderCreditBar(cl,bal,amt) {
  const bar=document.getElementById("pn-credit-bar"); if(!bar) return;
  if(cl<=0){bar.style.display="none";return;}
  const total=bal+amt, pct=Math.min((total/cl)*100,100), over=total>cl;
  bar.style.display="block";
  bar.innerHTML=\`
    <div style="font-size:11px;color:\${over?"#DC2626":"var(--text-2)"};margin-bottom:4px;">
      \${over?"⚠️ تجاوز حد الائتمان!":"📊 الائتمان المستخدم"} \${formatCurrency(total)} / \${formatCurrency(cl)}
    </div>
    <div style="height:6px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
      <div style="height:100%;width:\${pct}%;background:\${over?"#EF4444":pct>80?"#F59E0B":"#10B981"};border-radius:4px;transition:.3s;"></div>
    </div>\`;
}
async function searchPnCustomer(q) {
  const dd=document.getElementById("pn-cust-dd");
  if(!q){dd.style.display="none";return;}
  try {
    const snap=await getDocs(collection(db, "companies/" + COMPANY_ID + "/customers"));
    const m=snap.docs.map(d=>({id:d.id,...d.data()}))
      .filter(c=>(c.name||"").includes(q)||(c.phone||"").includes(q)).slice(0,8);
    if(!m.length){dd.style.display="none";return;}
    dd.innerHTML=m.map(c=>\`
      <div class="pn-ac-item"
           onclick="selectPnCustomer('\${c.id}','\${(c.name||"").replace(/'/g,"\\\\'")}', '\${c.idNumber||c.crNumber||""}',\${c.creditLimit||0},\${c.balance||0})">
        <strong>\${c.name}</strong>
        <span class="dim" style="font-size:11px;"> | حد: \${formatCurrency(c.creditLimit||0)} | رصيد: \${formatCurrency(c.balance||0)}</span>
      </div>\`).join("");
    dd.style.display="block";
  } catch{}
}
function selectPnCustomer(id,name,idNum,cl,bal) {
  document.getElementById("pn-cust-search").value=name;
  document.getElementById("pn-cust-id").value=id;
  document.getElementById("pn-cust-id-num").value=idNum;
  document.getElementById("pn-cust-cl").value=cl;
  document.getElementById("pn-cust-bal").value=bal;
  document.getElementById("pn-cust-dd").style.display="none";
  renderCreditBar(cl,bal,parseFloat(document.getElementById("pn-amount")?.value||0));
}

// ─── Save ─────────────────────────────────────────────────────
async function savePnNote(e) {
  e.preventDefault();
  const btn=e.submitter; if(btn){btn.disabled=true;btn.textContent="⏳ جاري الحفظ…";}
  try {
    const customerId=document.getElementById("pn-cust-id").value;
    const customerName=document.getElementById("pn-cust-search").value;
    if(!customerId) throw new Error("يرجى اختيار عميل من القائمة");
    const amount=parseFloat(document.getElementById("pn-amount").value);
    if(!amount||amount<=0) throw new Error("يرجى إدخال مبلغ صحيح");
    const onDemand=document.getElementById("pn-on-demand").checked;
    const dueDate=onDemand?"لدى الاطلاع":(document.getElementById("pn-due-date").value||"لدى الاطلاع");
    const note={
      noteNumber:       document.getElementById("pn-num").value,
      customerId, customerName,
      customerIdNumber: document.getElementById("pn-cust-id-num").value,
      companyName:      document.getElementById("pn-company-name").value,
      companyCR:        document.getElementById("pn-company-cr").value,
      amount, 
      paidAmount:       0,
      amountInWords:    numberToArabicWords(amount),
      issueDate: document.getElementById("pn-issue-date").value,
      dueDate,
      issueCity:  document.getElementById("pn-issue-city").value,
      paymentCity:document.getElementById("pn-pay-city").value,
      notes:      document.getElementById("pn-notes").value,
      status:     "active",
      createdBy:  _currentUser?.displayName||_currentUser?.name||"النظام",
      createdAt:  new Date().toISOString(),
    };
    // Save to Firestore using create() helper
    await create(getPN_COL(), note);
    // Update customer promissoryBalance
    try {
      const cs=await getDoc(doc(db,"companies/" + COMPANY_ID + "/customers",customerId));
      if(cs.exists()){
        await updateDoc(doc(db,"companies/" + COMPANY_ID + "/customers",customerId),{
          promissoryBalance: (cs.data().promissoryBalance||0)+amount
        });
      }
    } catch{}
    closePnModal(); await loadNotes();
    if(confirm("✅ تم إصدار السند بنجاح!\\nهل تريد طباعته الآن؟")) {
      const saved=cachedNotes.find(n=>n.noteNumber===note.noteNumber);
      if(saved) printNote(saved.id);
    }
  } catch(err){ alert("❌ "+err.message); }
  finally { if(btn){btn.disabled=false;btn.textContent="📜 إصدار السند";} }
}

// ─── Mark Paid ────────────────────────────────────────────────
async function markNoteAsPaid(id) {
  const n=cachedNotes.find(x=>x.id===id); if(!n) return;
  const rem = n.amount - (n.paidAmount || 0);
  if(!confirm("✅ تأكيد التسديد الكامل لسند الأمر رقم " + n.noteNumber + "\\nالمبلغ المتبقي: " + formatCurrency(rem) + "\\nللعميل: " + n.customerName)) return;
  try {
    await updateDoc(doc(db,"companies/" + COMPANY_ID + "/promissoryNotes",id),{
      status:"paid",
      paidAmount: n.amount,
      paidDate:new Date().toISOString().slice(0,10)
    });
    try {
      const cs=await getDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId));
      if(cs.exists()) await updateDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId),{promissoryBalance:Math.max(0,(cs.data().promissoryBalance||0)-rem)});
    } catch{}
    await loadNotes();
  } catch(err){alert("❌ "+err.message);}
}

// ─── Pay Partial ──────────────────────────────────────────────
async function payPartialNote(id) {
  const n=cachedNotes.find(x=>x.id===id); if(!n) return;
  const paidAlready = n.paidAmount || 0;
  const rem = n.amount - paidAlready;
  
  const val = prompt("💳 تسجيل تسديد لسند الأمر رقم: " + n.noteNumber + "\\nأصل المبلغ: " + formatCurrency(n.amount) + "\\nالمسدد سابقاً: " + formatCurrency(paidAlready) + "\\nالمتبقي الحالي: " + formatCurrency(rem) + "\\n\\nأدخل مبلغ الدفعة المسددة الان:", rem);
  if (val === null) return;
  const payVal = parseFloat(val);
  if (isNaN(payVal) || payVal <= 0) {
    alert("يرجى إدخال مبلغ صحيح أكبر من صفر.");
    return;
  }
  if (payVal > rem) {
    alert("مبلغ الدفعة أكبر من المبلغ المتبقي (" + formatCurrency(rem) + ").");
    return;
  }

  const newPaid = paidAlready + payVal;
  const newStatus = (newPaid >= n.amount) ? "paid" : "active";

  try {
    await updateDoc(doc(db,"companies/" + COMPANY_ID + "/promissoryNotes",id),{
      paidAmount: newPaid,
      status: newStatus,
      paidDate: new Date().toISOString().slice(0,10)
    });
    // Update customer promissory balance by reducing by the paid amount
    try {
      const cs=await getDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId));
      if(cs.exists()){
        const oldBal = cs.data().promissoryBalance || 0;
        await updateDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId),{
          promissoryBalance: Math.max(0, oldBal - payVal)
        });
      }
    } catch{}
    await loadNotes();
    alert("✅ تم تسديد مبلغ " + formatCurrency(payVal) + " بنجاح.");
  } catch(err){
    alert("❌ "+err.message);
  }
}

// ─── Cancel ───────────────────────────────────────────────────
async function cancelNote(id) {
  const n=cachedNotes.find(x=>x.id===id); if(!n) return;
  if(!confirm("⛔ إلغاء سند رقم " + n.noteNumber + "؟")) return;
  const unPaid = n.amount - (n.paidAmount || 0);
  try {
    await updateDoc(doc(db,"companies/" + COMPANY_ID + "/promissoryNotes",id),{status:"cancelled"});
    try {
      const cs=await getDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId));
      if(cs.exists()) await updateDoc(doc(db,"companies/" + COMPANY_ID + "/customers",n.customerId),{promissoryBalance:Math.max(0,(cs.data().promissoryBalance||0)-unPaid)});
    } catch{}
    await loadNotes();
  } catch(err){alert("❌ "+err.message);}
}

// ─── View Details ─────────────────────────────────────────────
function viewNote(id) {
  const n=cachedNotes.find(x=>x.id===id); if(!n) return;
  const s=STATUS_LABELS[n.status]||STATUS_LABELS.active;
  const paid = n.paidAmount || 0;
  const rem = n.amount - paid;

  document.getElementById("pn-modal-title").textContent="📜 " + n.noteNumber;
  document.getElementById("pn-modal-body").innerHTML=\`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;">
      <div><span class="dim">رقم السند:</span> <strong>\${n.noteNumber}</strong></div>
      <div><span class="dim">الحالة:</span> <span class="pn-sb pn-\${n.status}">\${s.icon} \${s.label}</span></div>
      <div><span class="dim">العميل:</span> <strong>\${n.customerName}</strong></div>
      <div><span class="dim">هوية/سجل:</span> \${n.customerIdNumber||"—"}</div>
      <div><span class="dim">المبلغ الأساسي:</span> <strong style="color:var(--brand);">\${formatCurrency(n.amount)}</strong></div>
      <div><span class="dim">المسدد / المتبقي:</span> <strong style="color:#10B981;">\${formatCurrency(paid)}</strong> / <strong style="color:\${rem > 0 ? "#DC2626":"#6B7280"};">\${formatCurrency(rem)}</strong></div>
      <div><span class="dim">تاريخ الإصدار:</span> \${n.issueDate}</div>
      <div><span class="dim">الاستحقاق:</span> \${n.dueDate}</div>
      <div><span class="dim">مدينة الإصدار:</span> \${n.issueCity}</div>
      <div><span class="dim">مدينة الوفاء:</span> \${n.paymentCity}</div>
      <div style="grid-column:1/-1;"><span class="dim">المبلغ كتابةً:</span> <em>\${n.amountInWords}</em></div>
      \${n.notes?\`<div style="grid-column:1/-1;"><span class="dim">ملاحظات:</span> \${n.notes}</div>\`:""}
    </div>
    <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closePnModal()">إغلاق</button>
      <button class="btn btn-primary" onclick="closePnModal();printNote('\${id}')">🖨️ طباعة السند</button>
    </div>\`;
  document.getElementById("pn-modal").style.display="flex";
}
function closePnModal(){ document.getElementById("pn-modal").style.display="none"; }

// ─── Export Excel ─────────────────────────────────────────────
async function exportNotesExcel() {
  if (!cachedNotes || cachedNotes.length === 0) {
    alert("لا توجد سندات أمر لتصديرها.");
    return;
  }

  const headers = [
    "رقم السند", "العميل", "رقم الهوية / السجل", "المبلغ الأصل", "المبلغ المسدد", 
    "المبلغ المتبقي", "تاريخ الإصدار", "تاريخ الاستحقاق", "مدينة الإصدار", "مدينة الوفاء", 
    "الحالة", "ملاحظات"
  ];

  const rows = cachedNotes.map(n => {
    const s = STATUS_LABELS[n.status]?.label || n.status;
    const paid = n.paidAmount || 0;
    const rem = n.amount - paid;
    return [
      n.noteNumber || "",
      n.customerName || "",
      n.customerIdNumber || "",
      n.amount || 0,
      paid,
      rem,
      n.issueDate || "",
      n.dueDate || "",
      n.issueCity || "",
      n.paymentCity || "",
      s,
      n.notes || ""
    ];
  });

  const colWidths = [15, 25, 18, 14, 14, 14, 14, 14, 14, 14, 12, 25];

  await exportToExcel({
    title: "كشف_سندات_الأمر",
    headers,
    rows,
    colWidths,
    user: _currentUser?.displayName || _currentUser?.name || "النظام"
  });
}

// ─── Print ────────────────────────────────────────────────────
async function printNote(id) {
  const n=cachedNotes.find(x=>x.id===id); if(!n) return;
  let stampB64="";
  try {
    const r=await fetch("/icons/company-stamp.png");
    const blob=await r.blob();
    stampB64=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(blob);});
  } catch{}
  const hijri=toHijriApprox(n.issueDate);
  const paid = n.paidAmount || 0;
  const rem = n.amount - paid;

  const html=\`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><title>سند الأمر — \${n.noteNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Arial','Tahoma',sans-serif;background:#fff;color:#111;direction:rtl;padding:20px;font-size:13px;}
.doc{max-width:720px;margin:0 auto;border:2px solid #333;border-radius:8px;padding:28px 32px;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #444;padding-bottom:16px;margin-bottom:16px;}
.doc-title{font-size:26px;font-weight:900;letter-spacing:1px;}
.sec{background:#333;color:#fff;padding:8px 14px;border-radius:6px;font-size:14px;font-weight:700;margin:16px 0 10px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;}
.f{display:flex;gap:6px;align-items:baseline;font-size:13px;}
.fl{color:#555;white-space:nowrap;min-width:120px;}
.fv{font-weight:700;}
.amt{border:1px solid #aaa;border-radius:6px;padding:10px 14px;background:#f9f9f9;margin:10px 0;}
.pledge{border:1px dashed #555;border-radius:8px;padding:14px 18px;background:#fafafa;margin:16px 0;line-height:1.9;}
.sigs{display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;gap:20px;}
.sig{text-align:center;min-width:160px;}
.sigline{border-top:1px solid #333;margin-top:10px;padding-top:6px;font-size:11px;color:#555;}
.stamp{width:120px;height:120px;object-fit:contain;opacity:.85;}
.footer{text-align:center;font-size:10px;color:#888;border-top:1px solid #ddd;margin-top:20px;padding-top:10px;}
@media print{body{padding:4px;}}
</style></head>
<body><div class="doc">
  <div class="hdr">
    <div>
      <div class="doc-title">سند لأمر</div>
      <div style="font-size:13px;color:#555;margin-top:4px;">رقم السند: <strong>\${n.noteNumber}</strong></div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:15px;font-weight:800;">\${n.companyName}</div>
      <div style="font-size:11px;color:#555;">س.ت: \${n.companyCR}</div>
      <div style="font-size:11px;color:#555;">المملكة العربية السعودية</div>
    </div>
  </div>
  <div class="sec">تفاصيل السند</div>
  <div class="g2">
    <div class="f"><span class="fl">تاريخ الإنشاء :</span><span class="fv">\${hijri} هـ — الموافق \${n.issueDate} م</span></div>
    <div class="f"><span class="fl">مدينة الإصدار :</span><span class="fv">\${n.issueCity}، المملكة العربية السعودية</span></div>
    <div class="f"><span class="fl">مدينة الوفاء :</span><span class="fv">\${n.paymentCity}، المملكة العربية السعودية</span></div>
    <div class="f"><span class="fl">تاريخ الاستحقاق :</span><span class="fv">\${n.dueDate}</span></div>
  </div>
  <div class="amt">
    <div class="f"><span class="fl">قيمة السند رقماً :</span><span class="fv">\${Number(n.amount).toLocaleString("ar-SA")} ريال سعودي لا غير</span></div>
    <div class="f" style="margin-top:6px;"><span class="fl">قيمة السند كتابةً :</span><span class="fv">\${n.amountInWords}</span></div>
    \${paid > 0 ? \`<div class="f" style="margin-top:6px;color:#10B981;"><span class="fl">المبلغ المسدد :</span><span class="fv">\${Number(paid).toLocaleString("ar-SA")} ريال</span></div>
    <div class="f" style="margin-top:2px;color:#DC2626;"><span class="fl">المبلغ المتبقي :</span><span class="fv">\${Number(rem).toLocaleString("ar-SA")} ريال</span></div>\` : ''}
  </div>
  <div class="sec">تفاصيل المدين (العميل)</div>
  <div class="g2">
    <div class="f"><span class="fl">الاسم :</span><span class="fv">\${n.customerName}</span></div>
    <div class="f"><span class="fl">رقم الهوية/السجل :</span><span class="fv">\${n.customerIdNumber||"—"}</span></div>
  </div>
  <div class="sec">تفاصيل الدائن (الشركة)</div>
  <div class="g2">
    <div class="f"><span class="fl">الاسم :</span><span class="fv">\${n.companyName}</span></div>
    <div class="f"><span class="fl">رقم السجل التجاري :</span><span class="fv">\${n.companyCR}</span></div>
  </div>
  <div class="pledge">
    أتعهد بأن أدفع لأمر <strong>\${n.companyName}</strong> دون قيد أو شرط مبلغاً وقدره
    (<strong>\${Number(n.amount).toLocaleString("ar-SA")}</strong>) ريال سعودي وفق البيانات المذكورة أعلاه.
    <br/>
    ولحامل هذا السند حق الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
    \${n.notes?\`<br/><em style="color:#555;">ملاحظة: \${n.notes}</em>\`:""}
  </div>
  <div class="sigs">
    <div class="sig">
      <div style="height:70px;border-bottom:1px dashed #ccc;width:160px;"></div>
      <div class="sigline">توقيع المدين<br/><strong>\${n.customerName}</strong></div>
    </div>
    <div class="sig">
      \${stampB64?\`<img src="\${stampB64}" class="stamp" alt="ختم الشركة"/>\`:\`<div style="height:100px;width:100px;border:1px dashed #ccc;border-radius:50%;margin:auto;"></div>\`}
      <div class="sigline">ختم وتوقيع الدائن<br/><strong>\${n.companyName}</strong></div>
    </div>
  </div>
  <div class="footer">تاريخ الإصدار: \${n.issueDate} م — رقم السند: \${n.noteNumber} — \${n.companyName}</div>
</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),400);};<\/script>
</body></html>\`;
  const w=window.open("","_blank","width=800,height=900");
  if(w){w.document.write(html);w.document.close();}
  else alert("يرجى السماح بالنوافذ المنبثقة.");
}

export { openNewNoteModal };
`;

fs.writeFileSync("e:/ادهام للمواد الغذائية/js/modules/promissory-notes.js", fileContent, "utf8");
console.log("Built clean promissory-notes.js");
