// ============================================================
// IDHAM ERP — Promissory Notes Module (سندات الأمر)
// نظام الأوراق التجارية السعودي — المرسوم الملكي م/37
// ============================================================
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, where, orderBy, getDocs, getDoc, doc } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// ─── Constants ───────────────────────────────────────────────
const STATUS_LABELS = {
  active:    { label: "نشط",    color: "good",    icon: "🟢" },
  paid:      { label: "مسدد",   color: "neutral",  icon: "✅" },
  overdue:   { label: "متأخر",  color: "bad",      icon: "🔴" },
  cancelled: { label: "ملغي",   color: "neutral",  icon: "⛔" },
};

let cachedNotes   = [];
let _filterStatus = "";
let _filterCust   = "";
let _currentUser  = null;

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

  const num = Math.floor(Math.abs(n));
  const fils = Math.round((Math.abs(n) - num) * 100);

  function belowThousand(x) {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10), o = x % 10;
    if (o === 0) return tens[t];
    return ones[o] + " و" + tens[t];
  }

  function convert(x) {
    if (x === 0) return "صفر";
    let result = "";
    const th = Math.floor(x / 1000);
    const rem = x % 1000;
    const h = Math.floor(rem / 100);
    const r = rem % 100;

    if (th > 0) {
      result += (th < 10 ? thousands[th] : belowThousand(th) + " ألف");
      if (h > 0 || r > 0) result += " و";
    }
    if (h > 0) {
      result += hundreds[h];
      if (r > 0) result += " و";
    }
    if (r > 0) result += belowThousand(r);
    return result;
  }

  const millions = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  let result = "";
  if (millions > 0) result += convert(millions) + " مليون ";
  result += convert(remainder);

  let final = result.trim() + " ريال سعودي";
  if (fils > 0) final += " و" + convert(fils) + " هللة";
  final += " لا غير";
  return final;
}

// ─── Auto Number Generator ────────────────────────────────────
async function generateNoteNumber() {
  const year = new Date().getFullYear();
  const snap = await getDocs(
    query(COLS.promissoryNotes(),
      where("noteNumber", ">=", `PN-${year}-`),
      where("noteNumber", "<=", `PN-${year}-z`),
      orderBy("noteNumber", "desc")
    )
  );
  let seq = 1;
  if (!snap.empty) {
    const last = snap.docs[0].data().noteNumber;
    const parts = (last || "").split("-");
    const lastSeq = parseInt(parts[parts.length - 1] || "0", 10);
    seq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;
  }
  return `PN-${year}-${String(seq).padStart(4, "0")}`;
}

// ─── Render ───────────────────────────────────────────────────
export async function render(container, user) {
  _currentUser = user;

  container.innerHTML = `
    <div class="filterbar" style="flex-wrap:wrap; gap:8px;">
      <div class="search-bar" style="max-width:240px;">
        <input type="text" id="pn-search" class="input" placeholder="🔍  بحث بالعميل أو رقم السند…" oninput="filterNotes()"/>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="pn-status-filter" onchange="filterNotes()">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="overdue">متأخر</option>
          <option value="paid">مسدد</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-export print" onclick="window.print()">🖨️ طباعة</button>
        <button class="btn btn-secondary" style="background:#0284c7; color:#fff; border-color:#0284c7; font-weight:800;" onclick="openGoodsReceiptAckFromPn()" title="إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها مرتبط بسند لأمر">📜 إقرار استلام بضاعة وسند لأمر</button>
        <button class="btn btn-secondary" style="border-color:#0284c7; color:#38bdf8;" onclick="openTrustReceiptFromPn()" title="إصدار سند أمانة وعهدة مالية (م/79)">🛡️ سند أمانة وعهدة</button>
        <button class="btn btn-secondary" style="border-color:#4338ca; color:#a5b4fc;" onclick="openDebtAcknowledgmentFromPn()" title="إصدار نموذج إقرار مديونية وتعهد بالتزام السداد">⚖️ إقرار مديونية وتعهد سداد</button>
        <button class="btn btn-primary" onclick="openNewNoteModal()">📜 + إصدار سند أمر جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">سندات الأمر</h1>
          <p class="page-subtitle" id="pn-count">جاري التحميل…</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid" id="pn-kpis" style="margin-bottom:20px;"></div>

      <!-- Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="pn-table">
            <thead><tr>
              <th>رقم السند</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>تاريخ الإصدار</th>
              <th>تاريخ الاستحقاق</th>
              <th>الحالة</th>
              <th style="text-align:center;">الإجراءات</th>
            </tr></thead>
            <tbody id="pn-tbody">
              <tr><td colspan="7" style="text-align:center;padding:32px;">
                <div class="sk" style="height:14px;width:60%;margin:auto;"></div>
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: New / Edit Note -->
    <div id="pn-modal" style="display:none; position:fixed; inset:0; z-index:1050; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;" class="modal-overlay" onclick="if(event.target===this)closePnModal()">
      <div class="modal" style="max-width:650px; width:94vw; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; border-radius:16px; background:var(--bg-1); border:1px solid var(--border); box-shadow:0 24px 64px rgba(0,0,0,0.45);">
        <div class="modal-header" style="flex-shrink:0; padding:16px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:var(--bg-2);">
          <h2 class="modal-title" id="pn-modal-title" style="margin:0; font-size:17px; font-weight:800; display:flex; align-items:center; gap:8px;">📜 إصدار سند أمر جديد</h2>
          <button class="modal-close" onclick="closePnModal()" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-2); padding:4px 8px; border-radius:6px; line-height:1;">✕</button>
        </div>
        <div class="modal-body" id="pn-modal-body" style="flex:1; overflow-y:auto; padding:20px; min-height:0;"></div>
      </div>
    </div>
  `;

  // Inject styles
  if (!document.getElementById("pn-styles")) {
    const s = document.createElement("style");
    s.id = "pn-styles";
    s.innerHTML = `
      .pn-print-doc { display:none; }
      @media print {
        body > * { display:none !important; }
        .pn-print-doc { display:block !important; }
      }
      .pn-status-badge { padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
      .pn-status-active    { background:rgba(16,185,129,.12); color:#059669; }
      .pn-status-paid      { background:rgba(107,114,128,.12); color:#6B7280; }
      .pn-status-overdue   { background:rgba(239,68,68,.12);  color:#DC2626; }
      .pn-status-cancelled { background:rgba(107,114,128,.12); color:#9CA3AF; }
      .pn-amount-badge { font-family:monospace; font-weight:800; color:var(--brand); }
    `;
    document.head.appendChild(s);
  }

  // Expose globals
  window.filterNotes       = filterNotes;
  window.openNewNoteModal  = openNewNoteModal;
  window.closePnModal      = closePnModal;
  window.savePnNote        = savePnNote;
  window.markNoteAsPaid    = markNoteAsPaid;
  window.cancelNote        = cancelNote;
  window.printNote         = printNote;
  window.viewNote          = viewNote;

  await loadNotes();
}

// ─── Load & Render Table ──────────────────────────────────────
async function loadNotes() {
  try {
    const snap = await getDocs(query(COLS.promissoryNotes(), orderBy("createdAt","desc")));
    cachedNotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // auto-flag overdue
    const today = new Date().toISOString().slice(0,10);
    cachedNotes.forEach(n => {
      if (n.status === "active" && n.dueDate && n.dueDate !== "لدى الاطلاع" && n.dueDate < today) {
        n.status = "overdue";
      }
    });
    renderKPIs();
    filterNotes();
  } catch(e) {
    document.getElementById("pn-tbody").innerHTML =
      `<tr><td colspan="7" style="text-align:center;color:var(--text-bad);">${e.message}</td></tr>`;
  }
}

function renderKPIs() {
  const active   = cachedNotes.filter(n => n.status === "active");
  const overdue  = cachedNotes.filter(n => n.status === "overdue");
  const paid     = cachedNotes.filter(n => n.status === "paid");
  const totalActive  = active.reduce((s,n) => s + (n.amount||0), 0);
  const totalOverdue = overdue.reduce((s,n) => s + (n.amount||0), 0);

  document.getElementById("pn-kpis").innerHTML = `
    <div class="inv-kpi-card">
      <div class="inv-kpi-val">${active.length + overdue.length}</div>
      <div class="inv-kpi-label">سندات نشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:var(--brand);">
      <div class="inv-kpi-val" style="color:var(--brand);">${formatCurrency(totalActive)}</div>
      <div class="inv-kpi-label">إجمالي المبالغ النشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:#EF4444;">
      <div class="inv-kpi-val" style="color:#EF4444;">${overdue.length}</div>
      <div class="inv-kpi-label">سندات متأخرة — ${formatCurrency(totalOverdue)}</div>
    </div>
    <div class="inv-kpi-card">
      <div class="inv-kpi-val" style="color:#10B981;">${paid.length}</div>
      <div class="inv-kpi-label">سندات مسددة</div>
    </div>
  `;
}

function filterNotes() {
  const q      = (document.getElementById("pn-search")?.value || "").trim().toLowerCase();
  const status = document.getElementById("pn-status-filter")?.value || "";

  let list = cachedNotes;
  if (status) list = list.filter(n => n.status === status);
  if (q) list = list.filter(n =>
    (n.noteNumber||"").toLowerCase().includes(q) ||
    (n.customerName||"").toLowerCase().includes(q)
  );

  const lbl = document.getElementById("pn-count");
  if (lbl) lbl.textContent = `${list.length} سند`;

  document.getElementById("pn-tbody").innerHTML = list.length === 0
    ? `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد سندات مطابقة</td></tr>`
    : list.map(n => {
        const st = STATUS_LABELS[n.status] || STATUS_LABELS.active;
        return `<tr>
          <td class="mono font-bold" style="color:var(--brand); cursor:pointer;" onclick="viewNote('${n.id}')">${n.noteNumber||"—"}</td>
          <td><strong>${n.customerName||"—"}</strong></td>
          <td class="pn-amount-badge">${formatCurrency(n.amount||0)}</td>
          <td class="mono dim">${n.issueDate||"—"}</td>
          <td class="mono dim">${n.dueDate||"—"}</td>
          <td><span class="pn-status-badge pn-status-${n.status}">${st.icon} ${st.label}</span></td>
          <td style="text-align:center;">
            <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
              <button class="btn btn-icon sm btn-ghost" onclick="printNote('${n.id}')" title="طباعة السند">🖨️</button>
              <button class="btn btn-icon sm btn-ghost" onclick="openGoodsReceiptAckForNote('${n.id}')" title="إقرار استلام بضاعة عينية مرتبط بهذا السند" style="color:#0284c7;">📜</button>
              ${n.status === "active" || n.status === "overdue"
                ? `<button class="btn btn-icon sm" style="background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.25);" onclick="markNoteAsPaid('${n.id}')" title="تسديد السند">✅ تسديد</button>
                   <button class="btn btn-icon sm btn-ghost text-bad" onclick="cancelNote('${n.id}')" title="إلغاء السند">⛔</button>`
                : ""}
            </div>
          </td>
        </tr>`;
      }).join("");
}

// ─── New Note Modal ───────────────────────────────────────────
async function openNewNoteModal(prefillCustomerId = null, prefillCustomerName = null) {
  // Load company settings
  let companyCity = "ينبع";
  let companyName = "شركة نظم الإمداد المتطورة";
  let companyCR   = "7054969006";
  try {
    const cachedCo = window.ERP_COMPANY || JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cachedCo.name) companyName = cachedCo.name;
    if (cachedCo.crNumber || cachedCo.cr) companyCR = cachedCo.crNumber || cachedCo.cr;
    if (cachedCo.city) companyCity = cachedCo.city;

    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (snap.exists()) {
      const sd = snap.data();
      companyName = sd.name || sd.companyName || companyName;
      companyCR   = sd.cr || sd.crNumber || companyCR;
      companyCity = sd.city || companyCity;
    }
  } catch (e) {
    console.warn("Could not load company settings in promissory notes:", e);
  }

  const noteNum = await generateNoteNumber();
  const today   = new Date().toISOString().slice(0,10);

  document.getElementById("pn-modal-title").textContent = "📜 إصدار سند أمر جديد";
  document.getElementById("pn-modal-body").innerHTML = `
    <form id="pn-form" onsubmit="savePnNote(event)" autocomplete="off" style="display:flex; flex-direction:column; height:100%; min-height:0;">
      <div id="pn-error" class="alert bad" style="display:none; margin-bottom:14px; font-weight:700; padding:10px 14px; border-radius:8px; font-size:13px;"></div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; overflow-y:auto; padding-bottom:14px; padding-left:2px; padding-right:2px;">

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم السند (تلقائي)</label>
          <input class="input mono" id="pn-num" value="${noteNum}" readonly style="background:var(--bg-2); font-weight:700; color:var(--brand);"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">تاريخ الإصدار *</label>
          <input class="input" type="date" id="pn-issue-date" value="${today}" required/>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">العميل (المدين) * <span class="text-warn" style="font-size:11px;">(اضغط للاختيار من القائمة)</span></label>
          <div style="position:relative;">
            <input class="input" id="pn-cust-search" placeholder="🔍 اضغط هنا لاختيار عميل أو اكتب للبحث…"
                   onfocus="searchPnCustomer(this.value)"
                   oninput="searchPnCustomer(this.value)" autocomplete="off"
                   value="${prefillCustomerName||""}"/>
            <div id="pn-cust-dropdown" style="
              position:absolute; top:calc(100% + 4px); right:0; left:0; background:var(--bg-1);
              border:1px solid var(--border); border-radius:10px; z-index:250;
              max-height:220px; overflow-y:auto; display:none; box-shadow:0 12px 30px rgba(0,0,0,0.3);
            "></div>
          </div>
          <input type="hidden" id="pn-cust-id" value="${prefillCustomerId||""}"/>
          <input type="hidden" id="pn-cust-credit-limit" value="0"/>
          <input type="hidden" id="pn-cust-balance" value="0"/>
          <div id="pn-credit-bar" style="display:none; margin-top:6px;"></div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم هوية / سجل تجاري العميل</label>
          <input class="input mono" id="pn-cust-id-num" placeholder="1234567890"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم جوال العميل</label>
          <input class="input mono" id="pn-cust-phone" placeholder="05xxxxxxxx"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">الرقم الضريبي للعميل (VAT)</label>
          <input class="input mono" id="pn-cust-vat" placeholder="300000000000003"/>
        </div>

        <!-- Authorized Signatory Details Card -->
        <div style="grid-column:1/-1; background:rgba(2, 132, 199, 0.05); padding:12px 14px; border-radius:10px; border:1px solid rgba(2, 132, 199, 0.25);">
          <div style="font-weight:800; font-size:12.5px; color:#0369a1; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <span>✍️</span> <span>بيانات الشخص المفوض بالتوقيع (المسؤول التنفيذي عن المنشأة المدينة)</span>
          </div>
          <div style="display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">اسم المفوض بالتوقيع *</label>
              <input class="input" id="pn-cust-resp" placeholder="الاسم الرباعي للمفوض" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم هوية المفوض *</label>
              <input class="input mono font-bold" id="pn-cust-resp-id" placeholder="10xxxxxxxx" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">صفة المفوض</label>
              <input class="input" id="pn-cust-resp-role" placeholder="المدير العام / وكيل شرعي" value="المدير العام المفوض" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">جوال المفوض</label>
              <input class="input mono font-bold" id="pn-cust-resp-phone" placeholder="05xxxxxxxx" style="font-size:12.5px;"/>
            </div>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">العنوان الوطني للمدين (المختار للتبليغ القضائي)</label>
          <input class="input" id="pn-cust-address" placeholder="المدينة — الحي — الشارع — الرمز البريدي"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">المبلغ (رقماً) *</label>
          <input class="input mono font-bold" type="number" id="pn-amount" min="1" step="0.01"
                 placeholder="0.00" required oninput="updateAmountWords()"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">تاريخ الاستحقاق</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <input class="input" type="date" id="pn-due-date" style="flex:1;"/>
            <label style="white-space:nowrap; font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" id="pn-on-demand" onchange="toggleDueDate(this)"/> لدى الاطلاع
            </label>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">المبلغ كتابةً (تلقائي)</label>
          <input class="input" id="pn-amount-words" readonly style="background:var(--bg-2); font-size:12px; font-weight:600;" placeholder="—"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">مدينة الإصدار (مكان الإنشاء)</label>
          <input class="input" id="pn-issue-city" value="${companyCity}"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">مدينة الوفاء (مكان الوفاء)</label>
          <input class="input" id="pn-pay-city" value="${companyCity}"/>
        </div>

        <!-- كفيل غارم متضامن (اختياري) -->
        <div style="grid-column:1/-1; background:rgba(79,70,229,0.04); padding:10px 14px; border-radius:8px; border:1px solid rgba(79,70,229,0.2);">
          <div style="font-weight:700; font-size:12px; color:var(--brand); margin-bottom:8px;">🤝 بيانات الكفيل الغارم المتضامن (اختياري لتعزيز الضمان القانوني)</div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:8px;">
            <input class="input" id="pn-guar-name" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12px;"/>
            <input class="input mono" id="pn-guar-id" placeholder="رقم هوية الكفيل" style="font-size:12px;"/>
            <input class="input mono" id="pn-guar-phone" placeholder="جوال الكفيل" style="font-size:12px;"/>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">ملاحظات / سبب السند</label>
          <textarea class="input" id="pn-notes" rows="2" style="resize:vertical;"
                    placeholder="ضمان سداد مسحوبات بضاعة آجلة / فاتورة رقم …"></textarea>
        </div>

      </div>

      <!-- Hidden company fields -->
      <input type="hidden" id="pn-company-name" value="${companyName}"/>
      <input type="hidden" id="pn-company-cr"   value="${companyCR}"/>

      <div class="modal-footer" style="flex-shrink:0; margin-top:auto; padding-top:14px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; background:var(--bg-1);">
        <button type="button" class="btn btn-secondary" onclick="closePnModal()" style="font-weight:600; padding:9px 18px;">إلغاء</button>
        <button type="submit" class="btn btn-primary" id="btn-save-pn" style="font-weight:700; padding:10px 24px; font-size:14px; background:linear-gradient(135deg, #4f46e5, #4338ca); color:#fff; border:none; box-shadow:0 2px 8px rgba(79,70,229,0.35); display:inline-flex; align-items:center; gap:8px;">
          <span>📜</span> <span>إصدار سند الأمر وحفظه</span>
        </button>
      </div>
    </form>
  `;

  // Expose helpers
  window.searchPnCustomer = searchPnCustomer;
  window.selectPnCustomer = selectPnCustomer;
  window.updateAmountWords = updateAmountWords;
  window.toggleDueDate = toggleDueDate;

  if (prefillCustomerId) {
    // fetch customer details
    try {
      const cSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, prefillCustomerId));
      if (cSnap.exists()) {
        const c = cSnap.data();
        document.getElementById("pn-cust-id-num").value = c.idNumber || c.crNumber || "";
        document.getElementById("pn-cust-credit-limit").value = c.creditLimit || 0;
        document.getElementById("pn-cust-balance").value = c.balance || 0;
        renderCreditBar(c.creditLimit || 0, c.balance || 0, 0);
      }
    } catch{}
  }

  const modal = document.getElementById("pn-modal");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
  }
}

function toggleDueDate(cb) {
  const inp = document.getElementById("pn-due-date");
  inp.disabled = cb.checked;
  if (cb.checked) inp.value = "";
}

function updateAmountWords() {
  const v = parseFloat(document.getElementById("pn-amount")?.value || 0);
  const words = document.getElementById("pn-amount-words");
  if (words) words.value = v > 0 ? numberToArabicWords(v) : "";
  // update credit bar
  const cl = parseFloat(document.getElementById("pn-cust-credit-limit")?.value || 0);
  const bal = parseFloat(document.getElementById("pn-cust-balance")?.value || 0);
  renderCreditBar(cl, bal, v);
}

function renderCreditBar(creditLimit, balance, noteAmount) {
  const bar = document.getElementById("pn-credit-bar");
  if (!bar) return;
  if (creditLimit <= 0) { bar.style.display = "none"; return; }
  const total = balance + noteAmount;
  const pct = Math.min((total / creditLimit) * 100, 100);
  const over = total > creditLimit;
  bar.style.display = "block";
  bar.innerHTML = `
    <div style="font-size:11px; color:${over?"#DC2626":"var(--text-2)"}; margin-bottom:4px;">
      ${over ? "⚠️ تجاوز حد الائتمان!" : "📊 الائتمان المستخدم"}
      ${formatCurrency(total)} / ${formatCurrency(creditLimit)}
    </div>
    <div style="height:6px; background:var(--bg-3); border-radius:4px; overflow:hidden;">
      <div style="height:100%; width:${pct}%; background:${over?"#EF4444":pct>80?"#F59E0B":"#10B981"}; border-radius:4px; transition:.3s;"></div>
    </div>
  `;
}

async function searchPnCustomer(q) {
  const dd = document.getElementById("pn-cust-dropdown");
  if (!dd) return;
  const term = (q || "").trim().toLowerCase();
  try {
    const custs = await getAll(COLS.customers());
    const matches = custs
      .filter(c => !term || 
                   (c.name||"").toLowerCase().includes(term) || 
                   (c.phone||"").includes(term) || 
                   (c.idNumber||"").includes(term) || 
                   (c.crNumber||"").includes(term))
      .slice(0, 12);
    if (!matches.length) { 
      dd.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد عميل مطابق</div>`;
      dd.style.display = "block"; 
      return; 
    }
    dd.innerHTML = matches.map(c => {
      const nameSafe = (c.name || "").replace(/'/g, "\\'");
      const addrSafe = ([c.address, c.street, c.district, c.city].filter(Boolean).join(" — ")).replace(/'/g, "\\'");
      const idNum = c.idNumber || c.crNumber || "";
      const phone = c.phone || c.mobile || "";
      const vat = c.vatNumber || "";
      const resp = (c.ownerName || c.contactPerson || c.responsiblePerson || "").replace(/'/g, "\\'");
      const guarName = (c.guarantor || c.guarantorName || "").replace(/'/g, "\\'");
      const guarId = (c.guarantorId || "").replace(/'/g, "\\'");
      const guarPhone = (c.guarantorPhone || "").replace(/'/g, "\\'");

      return `
      <div class="autocomplete-item"
           onclick="selectPnCustomer('${c.id}','${nameSafe}','${idNum}',${c.creditLimit||0},${c.balance||0},'${phone}','${addrSafe}','${vat}','${resp}','${guarName}','${guarId}','${guarPhone}')"
           style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--text-1); font-size:13px;">${c.name}</strong>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${idNum ? 'هوية/سجل: ' + idNum : ''} ${phone ? ' | هاتف: ' + phone : ''} ${c.city ? ' | ' + c.city : ''}</div>
        </div>
        <div style="text-align:left; font-size:11px;" class="dim">
          <span>الرصيد: ${formatCurrency(c.balance||0)}</span>
        </div>
      </div>`;
    }).join("");
    dd.style.display = "block";
  } catch(err) {
    console.warn("[PN] searchPnCustomer error:", err);
  }
}

function selectPnCustomer(id, name, idNum, creditLimit, balance, phone="", address="", vat="", resp="", guarName="", guarId="", guarPhone="") {
  document.getElementById("pn-cust-search").value = name;
  document.getElementById("pn-cust-id").value = id;
  if (idNum) document.getElementById("pn-cust-id-num").value = idNum;
  if (document.getElementById("pn-cust-phone")) document.getElementById("pn-cust-phone").value = phone;
  if (document.getElementById("pn-cust-address")) document.getElementById("pn-cust-address").value = address;
  if (document.getElementById("pn-cust-vat")) document.getElementById("pn-cust-vat").value = vat;
  if (document.getElementById("pn-cust-resp")) document.getElementById("pn-cust-resp").value = resp;
  if (document.getElementById("pn-guar-name")) document.getElementById("pn-guar-name").value = guarName;
  if (document.getElementById("pn-guar-id")) document.getElementById("pn-guar-id").value = guarId;
  if (document.getElementById("pn-guar-phone")) document.getElementById("pn-guar-phone").value = guarPhone;
  document.getElementById("pn-cust-credit-limit").value = creditLimit;
  document.getElementById("pn-cust-balance").value = balance;
  const dd = document.getElementById("pn-cust-dropdown");
  if (dd) dd.style.display = "none";
  const errEl = document.getElementById("pn-error");
  if (errEl) errEl.style.display = "none";
  const noteAmt = parseFloat(document.getElementById("pn-amount")?.value || 0);
  renderCreditBar(creditLimit, balance, noteAmt);
}

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest("#pn-cust-search") && !e.target.closest("#pn-cust-dropdown")) {
    const dd = document.getElementById("pn-cust-dropdown");
    if (dd) dd.style.display = "none";
  }
});

// ─── Save Note ────────────────────────────────────────────────
async function savePnNote(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-save-pn") || e.submitter || document.querySelector("#pn-form button[type='submit']");
  const errEl = document.getElementById("pn-error");
  if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }

  if (btn) { btn.disabled = true; btn.innerHTML = "<span>⏳</span> <span>جاري إصدار السند وحفظه…</span>"; }

  try {
    let customerId   = document.getElementById("pn-cust-id")?.value;
    let customerName = document.getElementById("pn-cust-search")?.value?.trim() || "";
    let custIdNum    = document.getElementById("pn-cust-id-num")?.value?.trim() || "";

    // Auto-match customer if not explicitly picked from dropdown
    if (!customerId && (customerName || custIdNum)) {
      try {
        const custs = await getAll(COLS.customers());
        const match = custs.find(c => {
          if (customerName && (c.name || "").trim().toLowerCase() === customerName.toLowerCase()) return true;
          if (custIdNum && (c.idNumber === custIdNum || c.crNumber === custIdNum)) return true;
          return false;
        });
        if (match) {
          customerId = match.id;
          customerName = match.name;
          document.getElementById("pn-cust-id").value = customerId;
          document.getElementById("pn-cust-search").value = customerName;
          if (!custIdNum) {
            custIdNum = match.idNumber || match.crNumber || "";
            document.getElementById("pn-cust-id-num").value = custIdNum;
          }
          if (document.getElementById("pn-cust-phone") && !document.getElementById("pn-cust-phone").value) {
            document.getElementById("pn-cust-phone").value = match.phone || match.mobile || "";
          }
          if (document.getElementById("pn-cust-address") && !document.getElementById("pn-cust-address").value) {
            document.getElementById("pn-cust-address").value = [match.address, match.street, match.district, match.city].filter(Boolean).join(" — ") || match.city || "";
          }
          if (document.getElementById("pn-cust-vat") && !document.getElementById("pn-cust-vat").value) {
            document.getElementById("pn-cust-vat").value = match.vatNumber || "";
          }
          if (document.getElementById("pn-cust-resp") && !document.getElementById("pn-cust-resp").value) {
            document.getElementById("pn-cust-resp").value = match.ownerName || match.contactPerson || match.responsiblePerson || "";
          }
        }
      } catch (_) {}
    }

    if (!customerId) {
      throw new Error("يرجى اختيار العميل (المدين) من القائمة المنسدلة للعملاء");
    }

    const amount = parseFloat(document.getElementById("pn-amount").value);
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("يرجى إدخال مبلغ صحيح لسند الأمر (أكبر من صفر)");
    }

    const onDemand = document.getElementById("pn-on-demand").checked;
    const dueDate  = onDemand ? "لدى الاطلاع" : (document.getElementById("pn-due-date").value || "لدى الاطلاع");

    const note = {
      noteNumber:       document.getElementById("pn-num").value,
      customerId,
      customerName,
      customerIdNumber: document.getElementById("pn-cust-id-num").value || custIdNum || "—",
      customerPhone:    document.getElementById("pn-cust-phone")?.value || "",
      customerAddress:  document.getElementById("pn-cust-address")?.value || "",
      customerVat:      document.getElementById("pn-cust-vat")?.value || "",
      contactPerson:      document.getElementById("pn-cust-resp")?.value || "",
      contactPersonId:    document.getElementById("pn-cust-resp-id")?.value || "",
      contactPersonRole:  document.getElementById("pn-cust-resp-role")?.value || "",
      contactPersonPhone: document.getElementById("pn-cust-resp-phone")?.value || "",
      guarantorName:    document.getElementById("pn-guar-name")?.value || "",
      guarantorId:      document.getElementById("pn-guar-id")?.value || "",
      guarantorPhone:   document.getElementById("pn-guar-phone")?.value || "",
      companyName:      document.getElementById("pn-company-name").value,
      companyCR:        document.getElementById("pn-company-cr").value,
      amount,
      amountInWords:    numberToArabicWords(amount),
      issueDate:        document.getElementById("pn-issue-date").value,
      dueDate,
      issueCity:        document.getElementById("pn-issue-city").value,
      paymentCity:      document.getElementById("pn-pay-city").value,
      notes:            document.getElementById("pn-notes").value,
      status:           "active",
      createdBy:        _currentUser?.displayName || _currentUser?.name || "النظام",
      createdAt:        new Date().toISOString(),
    };

    await create("promissoryNotes", note);

    // Update customer promissoryBalance
    try {
      const { update: dbUpdate } = await import("../utils/db.js");
      const cSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, customerId));
      if (cSnap.exists()) {
        const old = cSnap.data().promissoryBalance || 0;
        await dbUpdate("customers", customerId, { promissoryBalance: old + amount });
      }
    } catch(err) { console.warn("[PN] could not update promissoryBalance:", err); }

    closePnModal();
    await loadNotes();

    // Immediately print the new note
    if (confirm("✅ تم إصدار سند الأمر بنجاح!\nهل تريد طباعته الآن؟")) {
      const newNote = cachedNotes.find(n => n.noteNumber === note.noteNumber);
      if (newNote) printNote(newNote.id);
    }
  } catch(err) {
    if (errEl) {
      errEl.textContent = "⚠️ " + err.message;
      errEl.style.display = "block";
      errEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      alert("❌ " + err.message);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "<span>📜</span> <span>إصدار سند الأمر وحفظه</span>";
    }
  }
}

// ─── Mark as Paid ─────────────────────────────────────────────
async function markNoteAsPaid(id) {
  const n = cachedNotes.find(x => x.id === id);
  if (!n) return;
  if (!confirm(`✅ تأكيد تسديد سند الأمر رقم ${n.noteNumber}\nالمبلغ: ${formatCurrency(n.amount)}\nللعميل: ${n.customerName}`)) return;
  try {
    await update("promissoryNotes", id, {
      status:   "paid",
      paidDate: new Date().toISOString().slice(0,10),
    });
    // release promissoryBalance
    try {
      const cSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, n.customerId));
      if (cSnap.exists()) {
        const old = cSnap.data().promissoryBalance || 0;
        await update("customers", n.customerId, { promissoryBalance: Math.max(0, old - n.amount) });
      }
    } catch{}
    await loadNotes();
  } catch(err) { alert("❌ " + err.message); }
}

// ─── Cancel Note ──────────────────────────────────────────────
async function cancelNote(id) {
  const n = cachedNotes.find(x => x.id === id);
  if (!n) return;
  if (!confirm(`⛔ إلغاء سند الأمر رقم ${n.noteNumber}؟\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
  try {
    await update("promissoryNotes", id, { status: "cancelled" });
    try {
      const cSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, n.customerId));
      if (cSnap.exists()) {
        const old = cSnap.data().promissoryBalance || 0;
        await update("customers", n.customerId, { promissoryBalance: Math.max(0, old - n.amount) });
      }
    } catch{}
    await loadNotes();
  } catch(err) { alert("❌ " + err.message); }
}

// ─── View Note Details ────────────────────────────────────────
function viewNote(id) {
  const n = cachedNotes.find(x => x.id === id);
  if (!n) return;
  const st = STATUS_LABELS[n.status] || STATUS_LABELS.active;
  document.getElementById("pn-modal-title").textContent = `📜 سند الأمر — ${n.noteNumber}`;
  document.getElementById("pn-modal-body").innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
      <div><span class="dim">رقم السند:</span> <strong>${n.noteNumber}</strong></div>
      <div><span class="dim">الحالة:</span> <span class="pn-status-badge pn-status-${n.status}">${st.icon} ${st.label}</span></div>
      <div><span class="dim">العميل:</span> <strong>${n.customerName}</strong></div>
      <div><span class="dim">رقم الهوية/السجل:</span> ${n.customerIdNumber||"—"}</div>
      <div><span class="dim">المبلغ:</span> <strong style="color:var(--brand);">${formatCurrency(n.amount)}</strong></div>
      <div><span class="dim">تاريخ الإصدار:</span> ${n.issueDate}</div>
      <div><span class="dim">الاستحقاق:</span> ${n.dueDate}</div>
      <div><span class="dim">مدينة الإصدار:</span> ${n.issueCity}</div>
      <div style="grid-column:1/-1;"><span class="dim">المبلغ كتابةً:</span> <em>${n.amountInWords}</em></div>
      ${n.notes ? `<div style="grid-column:1/-1;"><span class="dim">ملاحظات:</span> ${n.notes}</div>` : ""}
    </div>
    <div class="modal-footer" style="margin-top:16px; display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closePnModal()">إغلاق</button>
      <button class="btn btn-primary" onclick="closePnModal();printNote('${id}')">🖨️ طباعة السند</button>
    </div>
  `;
  const modal = document.getElementById("pn-modal");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
  }
}

function closePnModal() {
  const modal = document.getElementById("pn-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
}

// ─── Print Note (Professional Format) ────────────────────────
async function printNote(id) {
  const n = typeof id === "string"
    ? cachedNotes.find(x => x.id === id)
    : id;
  if (!n) return;

  // Resolve current company settings dynamically
  let currentCompanyName = "شركة نظم الإمداد المتطورة";
  let currentCompanyCR   = "7054969006";
  let logoUrl = "";
  try {
    const cachedCo = window.ERP_COMPANY || JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cachedCo.name) currentCompanyName = cachedCo.name;
    if (cachedCo.crNumber || cachedCo.cr) currentCompanyCR = cachedCo.crNumber || cachedCo.cr;
    if (cachedCo.logoUrl || cachedCo.logoBase64 || cachedCo.dataUrl) logoUrl = cachedCo.logoUrl || cachedCo.logoBase64 || cachedCo.dataUrl;

    const [snap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (snap.exists()) {
      const sd = snap.data();
      currentCompanyName = sd.name || sd.companyName || currentCompanyName;
      currentCompanyCR   = sd.cr || sd.crNumber || currentCompanyCR;
      if (!logoUrl && (sd.logoUrl || sd.logoBase64)) logoUrl = sd.logoUrl || sd.logoBase64;
    }
    if (logoSnap.exists()) {
      const ld = logoSnap.data();
      logoUrl = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || logoUrl;
    }
  } catch(_) {}

  // If note has old company data (e.g. contains "الحديثة" or old CR), upgrade to current company data
  const companyName = (!n.companyName || n.companyName.includes("الحديثة")) ? currentCompanyName : n.companyName;
  const companyCR   = (!n.companyCR || n.companyCR === "4700123180" || n.companyCR === "4700124180") ? currentCompanyCR : n.companyCR;

  // Resolve full customer profile
  let cust = {};
  if (n.customerId) {
    try {
      const cSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, n.customerId));
      if (cSnap.exists()) cust = cSnap.data();
    } catch (_) {}
  }
  if (!cust.name && n.customerName) {
    try {
      const qSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/customers`), where("name", "==", n.customerName)));
      if (!qSnap.empty) cust = qSnap.docs[0].data();
    } catch (_) {}
  }

  const customerName = n.customerName || cust.name || "—";
  const customerIdNumber = (n.customerIdNumber && n.customerIdNumber !== "—") ? n.customerIdNumber : (cust.crNumber || cust.idNumber || cust.nationalId || "—");
  const customerVat = n.customerVat || cust.vatNumber || "—";
  const customerPhone = n.customerPhone || cust.phone || cust.mobile || "—";
  const customerAddress = n.customerAddress || [cust.address, cust.street, cust.district, cust.city, cust.postalCode].filter(Boolean).join(" — ") || cust.city || "ينبع — المملكة العربية السعودية";
  const contactPerson = n.contactPerson || cust.ownerName || cust.managerName || cust.responsiblePerson || cust.contactPerson || customerName;
  const contactPersonId = n.contactPersonId || cust.responsiblePersonId || cust.ownerId || "";
  const contactPersonRole = n.contactPersonRole || cust.responsiblePersonRole || "المدير العام المفوض";
  const contactPersonPhone = n.contactPersonPhone || cust.responsiblePersonPhone || customerPhone;
  const guarantorName = n.guarantorName || cust.guarantor || cust.guarantorName || "";
  const guarantorId   = n.guarantorId || cust.guarantorId || "";
  const guarantorPhone = n.guarantorPhone || cust.guarantorPhone || "";

  // Convert stamp to base64 with cache-busting
  let stampB64 = "";
  try {
    const r = await fetch("/icons/company-stamp.png?t=" + Date.now());
    const blob = await r.blob();
    stampB64 = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch{}

  const issueHijri = toHijriApprox(n.issueDate);

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>سند لأمر تنفيذي — ${n.noteNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Cairo', 'Arial', sans-serif; background:#f1f5f9; color:#0f172a;
         direction:rtl; padding:20px; font-size:12.5px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .doc { max-width:780px; margin:0 auto; background:#fff; border:3px double #004d80; border-radius:10px;
         padding:26px 30px; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.08); }
  
  .header { display:flex; justify-content:space-between; align-items:center;
             border-bottom:2px solid #004d80; padding-bottom:14px; margin-bottom:14px; gap:12px; }
  .hdr-col { flex:1.1; }
  .hdr-center { text-align:center; flex:1.2; }
  .hdr-left { text-align:left; direction:rtl; min-width:215px; }

  .doc-title { font-size:26px; font-weight:900; color:#004d80; letter-spacing:1px; line-height:1.2; }
  .doc-subtitle { font-size:11px; font-weight:700; color:#475569; margin-top:3px; }
  .note-badge { display:inline-block; margin-top:6px; background:#f0f9ff; border:1px solid #0284c7; color:#0369a1; padding:3px 12px; border-radius:20px; font-weight:800; font-size:12px; font-family:'IBM Plex Mono', monospace; }

  .amount-banner { background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); color:#fff; border-radius:8px;
                   padding:12px 18px; margin:14px 0; display:flex; justify-content:space-between; align-items:center; }
  .amount-val { font-size:22px; font-weight:900; font-family:'IBM Plex Mono', monospace; letter-spacing:0.5px; }
  .amount-words { font-size:13px; font-weight:700; color:#e0f2fe; margin-top:3px; }

  .section-head { background:#0f172a; color:#fff; padding:6px 12px; border-radius:6px;
                  font-size:12.5px; font-weight:800; margin:14px 0 8px; display:flex; justify-content:space-between; align-items:center; }
  
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; }
  .grid-party { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
  .party-card { border:1.5px solid #cbd5e1; border-radius:8px; padding:10px 14px; background:#f8fafc; }
  .party-card.creditor { border-color:#0284c7; background:#f0f9ff; }
  .party-card.debtor { border-color:#64748b; background:#fff; }
  .party-title { font-size:12.5px; font-weight:900; color:#004d80; margin-bottom:8px; border-bottom:1px dashed #cbd5e1; padding-bottom:4px; display:flex; justify-content:space-between; }
  
  .field { display:flex; gap:6px; align-items:baseline; font-size:12px; margin-bottom:4px; }
  .field-label { color:#475569; white-space:nowrap; min-width:115px; font-weight:600; }
  .field-val { font-weight:700; color:#0f172a; word-break:break-word; }
  .mono { font-family:'IBM Plex Mono', monospace; }

  .pledge-box { border:2px dashed #004d80; border-radius:8px; padding:14px 18px;
                 background:#faf5ff; margin:14px 0; font-size:12px; line-height:1.8; color:#1e1b4b; }
  .pledge-title { font-size:13px; font-weight:900; color:#4338ca; margin-bottom:6px; }
  .legal-bullets { margin-top:8px; padding-right:16px; font-size:11px; color:#334155; line-height:1.7; }

  .sig-area { display:grid; grid-template-columns:${guarantorName ? "1.2fr 1.2fr 1fr" : "1.3fr 1fr"}; gap:14px; margin-top:18px; }
  .sig-box { border:1.5px solid #94a3b8; border-radius:8px; padding:10px 12px; background:#fff; text-align:center; position:relative; }
  .sig-box-title { font-size:12px; font-weight:800; color:#0f172a; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; }
  .sig-meta { font-size:11px; text-align:right; color:#475569; margin-bottom:8px; line-height:1.5; }
  .sig-meta strong { color:#0f172a; }
  .thumb-box { width:65px; height:60px; border:1.5px dashed #94a3b8; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:9.5px; margin:0 auto; background:#f8fafc; }
  .sig-line { border-top:1px solid #475569; margin-top:8px; padding-top:4px; font-size:10.5px; color:#475569; font-weight:700; }

  .stamp-img { width:155px; height:155px; max-width:165px; max-height:165px; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18)); }

  .footer { text-align:center; font-size:10px; color:#64748b; border-top:1px solid #e2e8f0; margin-top:18px; padding-top:8px; line-height:1.4; }

  @media print {
    body { padding:0; background:#fff; }
    .doc { box-shadow:none; border-width:2px; max-width:100%; border-radius:0; padding:16px 20px; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>

<div class="doc">

  <!-- Top Action (Print helper) -->
  <div class="no-print" style="margin-bottom:14px; text-align:center; display:flex; gap:10px; justify-content:center;">
    <button onclick="window.print()" style="background:#004d80; color:#fff; font-weight:800; border:none; padding:8px 22px; border-radius:6px; cursor:pointer; font-family:inherit;">🖨️ طباعة سند الأمر التنفيذي</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="hdr-col" style="text-align:right; display:flex; align-items:center; gap:10px;">
      ${logoUrl ? `<img src="${logoUrl}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>` : `
        <div style="width:65px; height:65px; border-radius:10px; background:linear-gradient(135deg, #004d80, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:20px;">نظم الإمداد</div>
      `}
    </div>
    <div class="hdr-center">
      <div class="doc-title">سـنـد لأمـر</div>
      <div class="doc-subtitle">سند تنفيذي واجب النفاذ دون قيد أو شرط</div>
      <div class="note-badge">رقم السند: ${n.noteNumber}</div>
    </div>
    <div class="hdr-col hdr-left" style="text-align:left; direction:rtl; min-width:215px;">
      <div style="font-size:14.5px; font-weight:900; color:#004d80; white-space:nowrap; letter-spacing:0.2px;">${companyName}</div>
      <div style="font-size:11px; color:#475569; font-weight:700; white-space:nowrap; margin-top:2px;">س.ت: <span class="mono">${companyCR}</span></div>
      <div style="font-size:11px; color:#475569; font-weight:700; white-space:nowrap;">الرقم الضريبي: <span class="mono">314996148100003</span></div>
      <div style="font-size:10px; color:#64748b; margin-top:2px; white-space:nowrap;">ينبع — المملكة العربية السعودية</div>
    </div>
  </div>

  <!-- Note Terms & Dates -->
  <div class="section-head">
    <span>📌 البيانات المكانية والزمنية للسند</span>
    <span style="font-size:11px; font-weight:600;">(مستوفٍ لكافة أركان المادة 87 من نظام الأوراق التجارية)</span>
  </div>
  <div class="grid-2" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
    <div class="field"><span class="field-label">تاريخ الإنشاء :</span><span class="field-val">${issueHijri} هـ — الموافق <span class="mono">${n.issueDate}</span> م</span></div>
    <div class="field"><span class="field-label">مكان الإنشاء (مدينة الإصدار) :</span><span class="field-val">${n.issueCity || "ينبع"}، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">ميعاد الاستحقاق :</span><span class="field-val" style="color:#b91c1c; font-size:13px;">${n.dueDate}</span></div>
    <div class="field"><span class="field-label">مكان الوفاء (مدينة الأداء) :</span><span class="field-val">${n.paymentCity || "ينبع"}، المملكة العربية السعودية</span></div>
  </div>

  <!-- Amount Banner -->
  <div class="amount-banner">
    <div>
      <div style="font-size:11.5px; opacity:0.9; font-weight:700;">مبلغ السند الواجب الأداء دون قيد أو شرط :</div>
      <div class="amount-val">${n.amount.toLocaleString("ar-SA")} ريال سعودي</div>
    </div>
    <div style="text-align:left; max-width:55%;">
      <div style="font-size:11px; opacity:0.9; font-weight:700;">المبلغ تفقيطاً بالكلمات :</div>
      <div class="amount-words">${n.amountInWords} لا غير</div>
    </div>
  </div>

  <!-- Parties Grid: Creditor & Debtor -->
  <div class="grid-party">
    
    <!-- Creditor -->
    <div class="party-card creditor">
      <div class="party-title">
        <span>🏢 بيانات الدائن (المستفيد / صاحب الحق)</span>
      </div>
      <div class="field"><span class="field-label">اسم المنشأة :</span><span class="field-val">${companyName}</span></div>
      <div class="field"><span class="field-label">السجل التجاري :</span><span class="field-val mono">${companyCR}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">314996148100003</span></div>
      <div class="field"><span class="field-label">العنوان المعتمد :</span><span class="field-val">مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع</span></div>
      <div class="field"><span class="field-label">رقم الهاتف :</span><span class="field-val mono">0549141648</span></div>
    </div>

    <!-- Debtor -->
    <div class="party-card debtor">
      <div class="party-title">
        <span>👤 بيانات المدين (محرر السند / الملتزم بالسداد)</span>
      </div>
      <div class="field"><span class="field-label">اسم العميل / المنشأة :</span><span class="field-val">${customerName}</span></div>
      <div class="field"><span class="field-label">السجل / الهوية :</span><span class="field-val mono">${customerIdNumber}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${customerVat}</span></div>
      <div class="field"><span class="field-label">العنوان الوطني المعتمد :</span><span class="field-val">${customerAddress}</span></div>
      <div class="field"><span class="field-label">رقم الجوال :</span><span class="field-val mono">${customerPhone}</span></div>
      <div class="field"><span class="field-label">المفوض بالتوقيع :</span><span class="field-val">${contactPerson} ${contactPersonRole ? `(${contactPersonRole})` : ''}</span></div>
      ${contactPersonId ? `<div class="field"><span class="field-label">هوية المفوض :</span><span class="field-val mono">${contactPersonId}</span></div>` : ''}
    </div>

  </div>

  <!-- Legal Undertaking / Pledge -->
  <div class="pledge-box">
    <div class="pledge-title">📜 التعهد الصارم والآثار القضائية والتنفيذية الملزمة:</div>
    <p>
      أتعهد أنا الموقع أدناه (<strong>المدين / محرر السند</strong>) بكامل أهليتي المعتبرة شرعاً ونظاماً بأن أدفع بموجب هذا السند ودون قيد أو شرط لأمر الدائن:
      <strong style="color:#004d80; font-size:13.5px;">${companyName}</strong> (سجل تجاري رقم: <strong class="mono">${companyCR}</strong>)،
      في مدينة الوفاء (<strong>${n.paymentCity || "ينبع"}</strong>)، مبلغاً وقدره:
      <strong style="color:#b91c1c; font-size:14.5px;">( ${n.amount.toLocaleString("ar-SA")} ريال سعودي )</strong>
      فقط وقدره <strong>${n.amountInWords}</strong> لا غير، وذلك في ميعاد الاستحقاق المحدد أعلاه.
    </p>
    <div class="legal-bullets">
      <div>⚖️ <strong>الصفة التنفيذية المباشرة:</strong> يُعد هذا السند سنداً تنفيذياً واجباً وقابلاً للتنفيذ المباشر والجبري بموجب الفقرة (2) من المادة التاسعة من نظام التنفيذ الصادر بالمرسوم الملكي رقم (م/53) ولائحته التنفيذية.</div>
      <div>⚖️ <strong>الرجوع بدون مصاريف أو احتجاج:</strong> لحامل هذا السند (الدائن) الحق التام في الرجوع بدون مصاريف وبدون احتجاج وبدون الحاجة لعمل بروتستو عدم الوفاء (وفق المادة 87 وما بعدها من نظام الأوراق التجارية)، مع إسقاط أي دفع أو معارضة قضائية.</div>
      <div>⚖️ <strong>انشغال الذمة والتضامن:</strong> تظل ذمة المدين (وكفيله الغارم المتضامن) مشغولة بصفة قطعية غير قابلة للتجزئة حتى تمام السداد وتبرئة الذمة بموجب مخالصة خطية رسمية صادرة من الدائن.</div>
    </div>
    ${n.notes ? `<div style="margin-top:8px; padding:6px 10px; background:#fff; border-right:3px solid #004d80; font-size:11.5px; color:#1e293b;"><strong>البيان / سبب المعاملة:</strong> ${n.notes}</div>` : ""}
  </div>

  <!-- Signatures -->
  <div class="sig-area">

    <!-- Debtor Signature (No thumbprint) -->
    <div class="sig-box">
      <div class="sig-box-title">✍️ توقيع وختم المدين (محرر السند / المفوض بالتوقيع)</div>
      <div class="sig-meta">
        <div>المنشأة المدينة: <strong>${customerName}</strong></div>
        <div>المفوض بالتوقيع: <strong>${contactPerson} ${contactPersonRole ? `(${contactPersonRole})` : ''}</strong></div>
        <div>هوية المفوض / السجل: <strong class="mono">${contactPersonId || customerIdNumber}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">التوقيع والختم الرسمي للمدين</div>
      </div>
    </div>

    <!-- Guarantor (if present) (No thumbprint) -->
    ${guarantorName ? `
    <div class="sig-box">
      <div class="sig-box-title">🤝 توقيع الكفيل الغارم المتضامن</div>
      <div class="sig-meta">
        <div>اسم الكفيل: <strong>${guarantorName}</strong></div>
        <div>الهوية: <strong class="mono">${guarantorId || "—"}</strong></div>
        <div>الجوال: <strong class="mono">${guarantorPhone || "—"}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">توقيع الكفيل الغارم</div>
      </div>
    </div>
    ` : ""}

    <!-- Creditor Stamp & Signature -->
    <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
      <div class="sig-box-title" style="color:#004d80;">🏢 اعتماد وخاتم الدائن (المستفيد)</div>
      <div class="sig-meta">
        <div>المنشأة: <strong style="white-space:nowrap;">${companyName}</strong></div>
        <div>السجل التجاري: <strong class="mono">${companyCR}</strong></div>
      </div>
      <div style="text-align:center; margin-top:6px; position:relative; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        ${stampB64 ? `<img src="${stampB64}" class="stamp-img" alt="ختم الشركة"/>` : `<div style="height:90px;"></div>`}
        <div class="sig-line" style="width:100%; margin-top:4px;">توقيع وخاتم الدائن المعتمد</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م — رقم السند التنفيذي: <strong class="mono">${n.noteNumber}</strong>
    <br/>
    ${companyName} للتجارة — ينبع — المملكة العربية السعودية — وثيقة أصلية واجبة النفاذ القضائي
  </div>

</div>

<script>
  window.onload = () => {
    // Auto-open print preview if not restricted
    // window.print();
  };
<\/script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=850,height=950");
  if (w) { w.document.write(html); w.document.close(); }
  else alert("يرجى السماح بالنوافذ المنبثقة للطباعة.");
}

// ─── Hijri Approximation ──────────────────────────────────────
function toHijriApprox(isoDate) {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year:"numeric", month:"long", day:"numeric"
    }).format(new Date(isoDate)).replace(/\u06f\d/g, d => d);
  } catch { return isoDate; }
}

// ─── Firestore Collection ─────────────────────────────────────
// Patch COLS to include promissoryNotes
import { collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
if (!COLS.promissoryNotes) {
  COLS.promissoryNotes = () => collection(db, `companies/${COMPANY_ID}/promissoryNotes`);
}

// ─── Export shortcut for customers.js & global handlers ─────
window.openTrustReceiptFromPn = async () => {
  const { openTrustReceiptModal } = await import("./trust-receipts.js?v=2.4");
  openTrustReceiptModal();
};

window.openDebtAcknowledgmentFromPn = async () => {
  const { openDebtAcknowledgmentModal } = await import("./debt-acknowledgment.js?v=2.2");
  openDebtAcknowledgmentModal();
};

window.openGoodsReceiptAckFromPn = async () => {
  if (typeof window.openGoodsReceiptAckModal === "function") {
    window.openGoodsReceiptAckModal();
  } else {
    const { openGoodsReceiptAckModal } = await import("./goods-receipt-ack.js?v=1.0");
    openGoodsReceiptAckModal();
  }
};

window.openGoodsReceiptAckForNote = async (noteId) => {
  const note = cachedNotes.find(x => x.id === noteId);
  if (!note) return;
  const { openGoodsReceiptAckModal } = await import("./goods-receipt-ack.js?v=1.0");
  openGoodsReceiptAckModal({
    customerId: note.customerId,
    customerObj: { id: note.customerId, name: note.customerName, idNumber: note.debtorIdNumber, phone: note.debtorPhone, address: note.debtorCity },
    promissoryNoteId: note.id
  });
};

export { openNewNoteModal };
