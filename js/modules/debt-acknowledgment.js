// ============================================================
// IDHAM ERP — Debt Acknowledgment & Payment Undertaking Module
// نموذج إقرار مديونية وتعهد بالتزام السداد — معتمد نظامياً وقضائياً
// وفقاً لنظام الإثبات (م/43) ونظام المعاملات المدنية (م/191) السعودي
// ============================================================

import { getById, getAll, COLS, db, COMPANY_ID, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, tafqeetArabic } from "../utils/formatters.js";

const showToast = (...a) => (window.showToast ? window.showToast(...a) : console.log(...a));

/**
 * دالة مساعدة لحساب التاريخ الهجري التقريبي
 */
function getHijriDate(dateObj = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    return formatter.format(dateObj).replace(/هـ/g, '').trim();
  } catch {
    return "";
  }
}

/**
 * فتح نافذة إنشاء وتخصيص إقرار المديونية وتعهد السداد
 * @param {string|object} customerIdOrObj 
 * @param {object} options { amount, asOfDate, dueDate, notes, invoices }
 */
export async function openDebtAcknowledgmentModal(customerIdOrObj, options = {}) {
  let cust = null;

  if (typeof customerIdOrObj === "object" && customerIdOrObj !== null) {
    cust = customerIdOrObj;
  } else if (typeof customerIdOrObj === "string" && customerIdOrObj) {
    try {
      cust = await getById("customers", customerIdOrObj);
    } catch (e) {
      console.warn("Failed to fetch customer by ID for debt acknowledgment:", e);
    }
  }

  // Remove existing modal if already open
  const existing = document.getElementById("debt-ack-modal-overlay");
  if (existing) existing.remove();

  const today = todayString();
  const defaultAmount = options.amount !== undefined ? parseFloat(options.amount) : (cust ? parseFloat(cust.balance || 0) : 0);
  const asOfDate = options.asOfDate || today;
  
  // Default due date: 15 days from today if not specified
  let defaultDueDate = options.dueDate;
  if (!defaultDueDate) {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    defaultDueDate = d.toISOString().slice(0, 10);
  }

  // Load Company Defaults
  let co = {
    name: "شركة نظم الإمداد المتطورة",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    city: "ينبع",
    phone: "0549141648",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414"
  };
  try {
    const cachedCo = window.ERP_COMPANY || JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cachedCo.name) Object.assign(co, cachedCo);
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (snap.exists()) Object.assign(co, snap.data());
  } catch (_) {}

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "debt-ack-modal-overlay";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
    <div class="modal-box" style="max-width:760px; width:95%; max-height:92vh; display:flex; flex-direction:column; border-radius:16px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35); background:var(--bg-card); border:1px solid var(--border);">
      
      <!-- Modal Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); color:#fff; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; font-size:20px;">⚖️</div>
          <div>
            <h3 style="margin:0; font-size:16.5px; font-weight:900; letter-spacing:0.3px;">إقرار مديونية وتعهد بالتزام السداد</h3>
            <div style="font-size:11.5px; color:#e0f2fe; margin-top:2px;">سند إقرار مالي رسمي وقضائي ملزم لحفظ وتأمين حقوق الشركة</div>
          </div>
        </div>
        <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('debt-ack-modal-overlay').remove()" style="color:#fff; font-size:20px; line-height:1; border:none; background:transparent; cursor:pointer;">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px;">
        
        <!-- Customer Selection / Data Header -->
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 18px;">
          <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:6px; display:block;">العميل (المدين المقر) *</label>
          <div style="position:relative;">
            <input type="text" id="da-cust-search" class="input font-bold" 
                   value="${cust ? cust.name : ''}" 
                   placeholder="🔍 ابحث عن العميل بالاسم أو رقم الهاتف..." 
                   autocomplete="off" 
                   onfocus="window.searchDaCustomer(this.value)"
                   oninput="window.searchDaCustomer(this.value)"
                   style="height:42px; font-size:14px;" />
            <div id="da-cust-dropdown" style="position:absolute; top:calc(100% + 4px); right:0; left:0; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; z-index:500; max-height:220px; overflow-y:auto; display:none; box-shadow:0 12px 30px rgba(0,0,0,0.25);"></div>
          </div>
          <input type="hidden" id="da-cust-id" value="${cust ? cust.id : ''}" />
        </div>

        <!-- Financial Terms Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          
          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">المبلغ المقر به (ريال سعودي) *</label>
            <input type="number" id="da-amount" class="input mono font-bold" 
                   value="${defaultAmount > 0 ? defaultAmount : ''}" 
                   placeholder="0.00" step="0.01" min="0.01" required
                   style="font-size:18px; color:#b91c1c; height:44px;" 
                   oninput="window.updateDaTafqeet(this.value)" />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">المطابقة حتى تاريخ *</label>
            <input type="date" id="da-as-of-date" class="input" value="${asOfDate}" style="height:44px;" />
          </div>

          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:11.5px; font-weight:800; color:var(--text-2); margin-bottom:4px; display:block;">المبلغ تفقيطاً بالكلمات (تلقائي)</label>
            <input type="text" id="da-amount-words" class="input" readonly 
                   value="${defaultAmount > 0 ? tafqeetArabic(defaultAmount) : '—'}"
                   style="background:var(--bg-2); font-weight:700; color:var(--text-1); font-size:12.5px;" />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:#0369a1; margin-bottom:4px; display:block;">تاريخ الاستحقاق المتعهد به (موعد السداد الأقصى) *</label>
            <input type="date" id="da-due-date" class="input" value="${defaultDueDate}" style="height:42px; border-color:#0284c7;" required />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">طريقة السداد المتعهد بها</label>
            <select id="da-pay-method" class="input" style="height:42px;">
              <option value="حوالة بنكية معتمدة على الحساب الرسمي">حوالة بنكية معتمدة على الحساب الرسمي</option>
              <option value="نقداً بموجب سند قبض رسمي">نقداً بموجب سند قبض رسمي</option>
              <option value="شيك مصرفي واجب الصرف">شيك مصرفي واجب الصرف</option>
            </select>
          </div>

        </div>

        <!-- Customer Identity Details (Auto-filled & Editable) -->
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 18px;">
          <div style="font-size:12px; font-weight:900; color:var(--brand); margin-bottom:10px;">📋 البيانات الرسمية الموثقة للمدين (المختار للتبليغ القضائي)</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم السجل التجاري / الهوية الوطنية</label>
              <input type="text" id="da-cust-id-num" class="input mono font-bold" value="${cust ? (cust.crNumber || cust.idNumber || cust.nationalId || '') : ''}" placeholder="1234567890" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم الهاتف / الجوال المعتمد</label>
              <input type="text" id="da-cust-phone" class="input mono font-bold" value="${cust ? (cust.phone || cust.mobile || '') : ''}" placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">الرقم الضريبي (VAT)</label>
              <input type="text" id="da-cust-vat" class="input mono" value="${cust ? (cust.vatNumber || '') : ''}" placeholder="300000000000003" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">العنوان الوطني المعتمد (المدينة، الحي)</label>
              <input type="text" id="da-cust-address" class="input" value="${cust ? ([cust.address, cust.street, cust.district, cust.city, cust.postalCode].filter(Boolean).join(' — ') || cust.city || '') : 'ينبع — المملكة العربية السعودية'}" placeholder="ينبع — شارع … — حي …" />
            </div>
          </div>

          <!-- Dedicated Authorized Signatory Card -->
          <div style="margin-top:12px; padding:10px 14px; background:rgba(2,132,199,0.06); border:1px solid rgba(2,132,199,0.25); border-radius:10px;">
            <div style="font-size:11.5px; font-weight:800; color:#0284c7; margin-bottom:8px;">✍️ بيانات المفوض بالتوقيع والالتزام القانوني (المسؤول النظامي)</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">اسم المفوض بالتوقيع</label>
                <input type="text" id="da-cust-resp" class="input" value="${cust ? (cust.ownerName || cust.contactPerson || cust.managerName || cust.responsiblePerson || cust.name || '') : ''}" placeholder="اسم المدير / المسؤول المفوض" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم هوية المفوض</label>
                <input type="text" id="da-cust-resp-id" class="input mono font-bold" value="${cust ? (cust.responsiblePersonId || cust.ownerId || '') : ''}" placeholder="10xxxxxxxx" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">صفة المفوض</label>
                <input type="text" id="da-cust-resp-role" class="input" value="${cust ? (cust.responsiblePersonRole || 'المدير العام المفوض') : 'المدير العام المفوض'}" placeholder="المدير العام / الوكيل الشرعي" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">جوال المفوض</label>
                <input type="text" id="da-cust-resp-phone" class="input mono font-bold" value="${cust ? (cust.responsiblePersonPhone || cust.phone || '') : ''}" placeholder="05xxxxxxxx" />
              </div>
            </div>
          </div>
        </div>

        <!-- Guarantor Details (Optional) -->
        <div style="background:rgba(79,70,229,0.04); border:1px solid rgba(79,70,229,0.2); border-radius:12px; padding:12px 18px;">
          <div style="font-size:12px; font-weight:800; color:#4f46e5; margin-bottom:8px;">🤝 بيانات الكفيل الغارم المتضامن (اختياري لتعزيز التحصيل والضمان)</div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:10px;">
            <input type="text" id="da-guar-name" class="input" value="${cust ? (cust.guarantor || cust.guarantorName || '') : ''}" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12px;" />
            <input type="text" id="da-guar-id" class="input mono" value="${cust ? (cust.guarantorId || '') : ''}" placeholder="رقم هوية الكفيل" style="font-size:12px;" />
            <input type="text" id="da-guar-phone" class="input mono" value="${cust ? (cust.guarantorPhone || '') : ''}" placeholder="جوال الكفيل" style="font-size:12px;" />
          </div>
        </div>

        <!-- Notes / Ref -->
        <div>
          <label style="font-size:11.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">ملاحظات / أرقام الفواتير وسندات التسليم المسحوبة</label>
          <textarea id="da-notes" class="input" rows="2" style="resize:vertical;" placeholder="بموجب فواتير المبيعات المسحوبة وسندات التسليم المؤرخة...">${options.notes || ""}</textarea>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('debt-ack-modal-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" onclick="window.submitAndPrintDebtAcknowledgment()" style="padding:10px 24px; font-weight:800; font-size:13.5px; background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); border:none; box-shadow:0 4px 14px rgba(2,132,199,0.35); display:inline-flex; align-items:center; gap:8px;">
          <span>🖨️</span> <span>طباعة وتوليد الإقرار الرسمي الموثق</span>
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Expose helpers
  window.updateDaTafqeet = (val) => {
    const num = parseFloat(val);
    const el = document.getElementById("da-amount-words");
    if (el) el.value = (num && !isNaN(num) && num > 0) ? tafqeetArabic(num) : "—";
  };

  window.searchDaCustomer = async (term) => {
    const dd = document.getElementById("da-cust-dropdown");
    if (!dd) return;
    const q = (term || "").trim().toLowerCase();
    try {
      const custs = await getAll(COLS.customers());
      const matches = custs.filter(c => !q || 
        (c.name || "").toLowerCase().includes(q) || 
        (c.phone || "").includes(q) || 
        (c.idNumber || "").includes(q) || 
        (c.crNumber || "").includes(q)
      ).slice(0, 10);

      if (!matches.length) {
        dd.innerHTML = `<div style="padding:10px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد عميل مطابق</div>`;
        dd.style.display = "block";
        return;
      }

      dd.innerHTML = matches.map(c => {
        const nameSafe = (c.name || "").replace(/'/g, "\\'");
        const addrSafe = ([c.address, c.street, c.district, c.city].filter(Boolean).join(" — ")).replace(/'/g, "\\'");
        const idNum = c.idNumber || c.crNumber || "";
        const phone = c.phone || c.mobile || "";
        const vat = c.vatNumber || "";
        const resp = (c.ownerName || c.contactPerson || c.managerName || c.responsiblePerson || c.name || "").replace(/'/g, "\\'");
        const guarName = (c.guarantor || c.guarantorName || "").replace(/'/g, "\\'");
        const guarId = (c.guarantorId || "").replace(/'/g, "\\'");
        const guarPhone = (c.guarantorPhone || "").replace(/'/g, "\\'");

        return `
          <div class="autocomplete-item" 
               onclick="window.selectDaCustomer('${c.id}', '${nameSafe}', '${idNum}', '${phone}', '${vat}', '${resp}', '${addrSafe}', ${c.balance || 0}, '${guarName}', '${guarId}', '${guarPhone}')"
               style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--text-1); font-size:13px;">${c.name}</strong>
              <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${idNum ? 'سجل/هوية: ' + idNum : ''} ${phone ? ' | هاتف: ' + phone : ''}</div>
            </div>
            <div class="mono font-bold" style="font-size:12px; color:${(c.balance||0) > 0 ? '#b91c1c' : '#059669'};">
              ${formatCurrency(c.balance || 0)}
            </div>
          </div>
        `;
      }).join("");
      dd.style.display = "block";
    } catch (_) {}
  };

  window.selectDaCustomer = (id, name, idNum, phone, vat, resp, addr, bal, guarName, guarId, guarPhone) => {
    document.getElementById("da-cust-search").value = name;
    document.getElementById("da-cust-id").value = id;
    if (document.getElementById("da-cust-id-num")) document.getElementById("da-cust-id-num").value = idNum;
    if (document.getElementById("da-cust-phone")) document.getElementById("da-cust-phone").value = phone;
    if (document.getElementById("da-cust-vat")) document.getElementById("da-cust-vat").value = vat;
    if (document.getElementById("da-cust-resp")) document.getElementById("da-cust-resp").value = resp;
    if (document.getElementById("da-cust-address")) document.getElementById("da-cust-address").value = addr;
    if (document.getElementById("da-guar-name")) document.getElementById("da-guar-name").value = guarName || "";
    if (document.getElementById("da-guar-id")) document.getElementById("da-guar-id").value = guarId || "";
    if (document.getElementById("da-guar-phone")) document.getElementById("da-guar-phone").value = guarPhone || "";

    const amtInput = document.getElementById("da-amount");
    if (amtInput && (!amtInput.value || parseFloat(amtInput.value) <= 0)) {
      if (bal > 0) {
        amtInput.value = bal;
        window.updateDaTafqeet(bal);
      }
    }
    const dd = document.getElementById("da-cust-dropdown");
    if (dd) dd.style.display = "none";
  };

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#da-cust-search") && !e.target.closest("#da-cust-dropdown")) {
      const dd = document.getElementById("da-cust-dropdown");
      if (dd) dd.style.display = "none";
    }
  });

  window.submitAndPrintDebtAcknowledgment = () => {
    const custName = document.getElementById("da-cust-search")?.value.trim();
    if (!custName) {
      showToast("يرجى اختيار العميل أولاً", "warn");
      return;
    }
    const amount = parseFloat(document.getElementById("da-amount")?.value || 0);
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast("يرجى إدخال مبلغ صحيح للإقرار", "warn");
      return;
    }

    const data = {
      custName,
      custIdNum: document.getElementById("da-cust-id-num")?.value.trim() || "—",
      custPhone: document.getElementById("da-cust-phone")?.value.trim() || "—",
      custVat: document.getElementById("da-cust-vat")?.value.trim() || "—",
      custResp: document.getElementById("da-cust-resp")?.value.trim() || custName,
      custRespId: document.getElementById("da-cust-resp-id")?.value.trim() || "",
      custRespRole: document.getElementById("da-cust-resp-role")?.value.trim() || "المدير العام المفوض",
      custRespPhone: document.getElementById("da-cust-resp-phone")?.value.trim() || "",
      custAddress: document.getElementById("da-cust-address")?.value.trim() || "المملكة العربية السعودية",
      amount,
      amountWords: document.getElementById("da-amount-words")?.value || tafqeetArabic(amount),
      asOfDate: document.getElementById("da-as-of-date")?.value || todayString(),
      dueDate: document.getElementById("da-due-date")?.value || todayString(),
      payMethod: document.getElementById("da-pay-method")?.value || "حوالة بنكية معتمدة على الحساب الرسمي",
      guarName: document.getElementById("da-guar-name")?.value.trim() || "",
      guarId: document.getElementById("da-guar-id")?.value.trim() || "",
      guarPhone: document.getElementById("da-guar-phone")?.value.trim() || "",
      notes: document.getElementById("da-notes")?.value.trim() || "",
      co
    };

    generateAndPrintDebtAcknowledgment(data);
  };
}

/**
 * توليد وطباعة وثيقة إقرار المديونية والتعهد بالسداد
 */
export async function generateAndPrintDebtAcknowledgment(data) {
  const {
    custName, custIdNum, custPhone, custVat, custResp, custRespId, custRespRole, custRespPhone, custAddress,
    amount, amountWords, asOfDate, dueDate, payMethod,
    guarName, guarId, guarPhone, notes, co
  } = data;

  const coName = co?.name || "شركة نظم الإمداد المتطورة";
  const coCR = co?.crNumber || co?.cr || "7054969006";
  const coVat = co?.vatNumber || "314996148100003";
  const coPhone = co?.phone || "0549141648";
  const coAddress = co?.address || "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414";

  // Cache-busting stamp
  let stampB64 = "";
  try {
    const r = await fetch("/icons/company-stamp.png?t=" + Date.now());
    const blob = await r.blob();
    stampB64 = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (_) {}

  const docNumber = `ACK-${todayString().replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateHijri = getHijriDate(new Date(asOfDate));
  const dueHijri = getHijriDate(new Date(dueDate));

  const win = window.open("", "_blank", "width=850,height=950");
  if (!win) {
    showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "error");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إقرار مديونية وتعهد سداد — ${custName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Cairo', 'Arial', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      direction: rtl;
      padding: 24px;
      font-size: 12.5px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border: 3px double #004d80;
      border-radius: 12px;
      padding: 26px 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      position: relative;
    }

    /* Top Action (Print helper) */
    .no-print {
      margin-bottom: 14px;
      text-align: center;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn-print {
      background: #004d80;
      color: #fff;
      font-weight: 800;
      border: none;
      padding: 9px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #004d80;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .hdr-col { flex: 1; }
    .hdr-center { text-align: center; flex: 1.5; }
    .hdr-left { text-align: left; direction: ltr; }

    .doc-title {
      font-size: 24px;
      font-weight: 900;
      color: #004d80;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .doc-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .doc-badge {
      display: inline-block;
      margin-top: 6px;
      background: #f0f9ff;
      border: 1px solid #0284c7;
      color: #0369a1;
      padding: 3px 12px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 12px;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* Amount Banner */
    .amount-banner {
      background: linear-gradient(135deg, #004d80 0%, #0369a1 100%);
      color: #fff;
      border-radius: 8px;
      padding: 12px 18px;
      margin: 14px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-val {
      font-size: 22px;
      font-weight: 900;
      font-family: 'IBM Plex Mono', monospace;
    }
    .amount-words {
      font-size: 13px;
      font-weight: 700;
      color: #e0f2fe;
      margin-top: 2px;
    }

    /* Parties Grid */
    .grid-party {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .party-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
    }
    .party-card.creditor {
      border-color: #0284c7;
      background: #f0f9ff;
    }
    .party-card.debtor {
      border-color: #64748b;
      background: #fff;
    }
    .party-title {
      font-size: 12.5px;
      font-weight: 900;
      color: #004d80;
      margin-bottom: 8px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }

    .field {
      display: flex;
      gap: 6px;
      align-items: baseline;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .field-label {
      color: #475569;
      white-space: nowrap;
      min-width: 110px;
      font-weight: 600;
    }
    .field-val {
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }
    .mono { font-family: 'IBM Plex Mono', monospace; }

    /* Statement Terms Grid */
    .grid-terms {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }

    /* Legal Undertaking Box */
    .pledge-box {
      border: 2px dashed #004d80;
      border-radius: 8px;
      padding: 14px 18px;
      background: #faf5ff;
      margin: 14px 0;
      font-size: 12px;
      line-height: 1.8;
      color: #1e1b4b;
    }
    .pledge-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #4338ca;
      margin-bottom: 6px;
    }
    .legal-clause {
      margin-top: 6px;
      padding-right: 14px;
      font-size: 11.5px;
      color: #334155;
      line-height: 1.7;
    }
    .legal-clause strong {
      color: #0f172a;
    }

    /* Signatures Area */
    .sig-area {
      display: grid;
      grid-template-columns: ${guarName ? "1.2fr 1.2fr 1fr" : "1.3fr 1fr"};
      gap: 14px;
      margin-top: 16px;
    }
    .sig-box {
      border: 1.5px solid #94a3b8;
      border-radius: 8px;
      padding: 10px 12px;
      background: #fff;
      text-align: center;
      position: relative;
    }
    .sig-box-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .sig-meta {
      font-size: 11px;
      text-align: right;
      color: #475569;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .sig-meta strong { color: #0f172a; }
    .thumb-box {
      width: 65px;
      height: 60px;
      border: 1.5px dashed #94a3b8;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 9.5px;
      margin: 0 auto;
      background: #f8fafc;
    }
    .sig-line {
      border-top: 1px solid #475569;
      margin-top: 8px;
      padding-top: 4px;
      font-size: 10.5px;
      color: #475569;
      font-weight: 700;
    }

    .stamp-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    .footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      margin-top: 16px;
      padding-top: 8px;
      line-height: 1.4;
    }

    @media print {
      body { padding: 0; background: #fff; }
      .doc { box-shadow: none; border-width: 2px; max-width: 100%; border-radius: 0; padding: 14px 18px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

<div class="doc">

  <!-- Top Action Button -->
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨️ طباعة إقرار المديونية الرسمي</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="hdr-col" style="text-align:right; display:flex; align-items:center; gap:10px;">
      ${stampB64 ? `<img src="${stampB64}" style="max-height:70px; max-width:140px; object-fit:contain; border-radius:8px;" alt="شعار الشركة"/>` : `
        <div style="width:65px; height:65px; border-radius:10px; background:linear-gradient(135deg, #004d80, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:22px;">MSS</div>
      `}
    </div>
    <div class="hdr-center">
      <div class="doc-title">إقرار مديونية والتزام بالسداد</div>
      <div class="doc-subtitle">وثيقة إقرار مالي وتعهد قضائي ملزم ونافذ شرعاً ونظاماً</div>
      <div class="doc-badge">رقم الإقرار: ${docNumber}</div>
    </div>
    <div class="hdr-col hdr-left">
      <div style="font-size:14px; font-weight:900; color:#004d80; text-align:left;">${coName}</div>
      <div style="font-size:11px; color:#475569; font-weight:700; text-align:left;">س.ت: <span class="mono">${coCR}</span></div>
      <div style="font-size:11px; color:#475569; font-weight:700; text-align:left;">الرقم الضريبي: <span class="mono">${coVat}</span></div>
      <div style="font-size:10px; color:#64748b; margin-top:2px; text-align:left;">ينبع الصناعية — هاتف: ${coPhone}</div>
    </div>
  </div>

  <!-- Statement Terms Grid -->
  <div class="grid-terms">
    <div class="field"><span class="field-label">تاريخ تحرير الإقرار :</span><span class="field-val">${dateHijri ? dateHijri + ' هـ — ' : ''}${asOfDate} م</span></div>
    <div class="field"><span class="field-label">مدينة التحرير :</span><span class="field-val">ينبع، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">تاريخ الاستحقاق الملزم :</span><span class="field-val" style="color:#b91c1c; font-size:13px;">${dueHijri ? dueHijri + ' هـ — ' : ''}${dueDate} م</span></div>
    <div class="field"><span class="field-label">طريقة السداد المتعهد بها :</span><span class="field-val">${payMethod}</span></div>
  </div>

  <!-- Amount Banner -->
  <div class="amount-banner">
    <div>
      <div style="font-size:11px; opacity:0.9; font-weight:700;">مبلغ المديونية المقر به دون قيد أو شرط :</div>
      <div class="amount-val">${amount.toLocaleString("ar-SA")} ريال سعودي</div>
    </div>
    <div style="text-align:left; max-width:55%;">
      <div style="font-size:11px; opacity:0.9; font-weight:700;">المبلغ تفقيطاً بالكلمات :</div>
      <div class="amount-words">${amountWords}</div>
    </div>
  </div>

  <!-- Parties Grid: Creditor & Debtor -->
  <div class="grid-party">
    
    <!-- Creditor -->
    <div class="party-card creditor">
      <div class="party-title">🏢 بيانات الدائن (المقر له / صاحب الحق)</div>
      <div class="field"><span class="field-label">اسم المنشأة :</span><span class="field-val">${coName}</span></div>
      <div class="field"><span class="field-label">السجل التجاري :</span><span class="field-val mono">${coCR}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${coVat}</span></div>
      <div class="field"><span class="field-label">العنوان المعتمد :</span><span class="field-val">${coAddress}</span></div>
      <div class="field"><span class="field-label">رقم الهاتف :</span><span class="field-val mono">${coPhone}</span></div>
    </div>

    <!-- Debtor -->
    <div class="party-card debtor">
      <div class="party-title">👤 بيانات المدين المقر (الملتزم بالسداد)</div>
      <div class="field"><span class="field-label">اسم المنشأة / العميل :</span><span class="field-val">${custName}</span></div>
      <div class="field"><span class="field-label">السجل / الهوية :</span><span class="field-val mono">${custIdNum}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${custVat}</span></div>
      <div class="field"><span class="field-label">العنوان الوطني :</span><span class="field-val">${custAddress}</span></div>
      <div class="field"><span class="field-label">رقم الجوال :</span><span class="field-val mono">${custPhone}</span></div>
      <div class="field"><span class="field-label">المفوض بالتوقيع :</span><span class="field-val">${custResp} ${custRespRole ? `(${custRespRole})` : ''}</span></div>
      ${custRespId ? `<div class="field"><span class="field-label">هوية المفوض :</span><span class="field-val mono">${custRespId}</span></div>` : ''}
    </div>

  </div>

  <!-- Legal Undertaking / Pledge Box -->
  <div class="pledge-box">
    <div class="pledge-title">📜 صيغة الإقرار الشرعي والنظامي والالتزام القضائي بالسداد:</div>
    <p>
      أقر أنا الموقع أدناه (<strong>المدين المقر</strong>) بصفتي أصيلاً / مفوضاً نظامياً عن المنشأة الموضحة بياناتها أعلاه، وبكامل الأهلية المعتبرة شرعاً ونظاماً، وبما لا رجعة فيه ولا بداء، بالآتي:
    </p>
    <div class="legal-clause">
      1. <strong>ثبوت وصحة المديونية:</strong> أقر بصحة مطابقة الحساب التجاري حتى تاريخ <strong>${asOfDate}</strong>، وبأن في ذمتي وذمة منشأتي ديناً ثابتاً ومستحق الأداء بصفة قطعية غير معلقة على شرط لصالح الدائن: <strong>${coName}</strong> (س.ت: <span class="mono">${coCR}</span>)، بمبلغ وقدره <strong>(${amount.toLocaleString("ar-SA")} ريال سعودي)</strong>، وذلك لقاء بضائع ومواد غذائية مستلمة بالكامل ومطابقة للمواصفات دون أي اعتراض أو تحفظ.
    </div>
    <div class="legal-clause">
      2. <strong>التعهد بالسداد التام:</strong> أتعهد وألتزم بالوفاء بكامل المبلغ المذكور أعلاه دون مماطلة في موعد أقصاه تاريخ <strong>${dueDate}</strong>، وذلك بـ (<strong>${payMethod}</strong>).
    </div>
    <div class="legal-clause">
      3. <strong>الحجية القضائية وإسقاط الدفوع:</strong> يُعد هذا الإقرار حجة قاطعة ودليلاً كتابياً ملزماً وغير قابل للرجوع فيه استناداً للمادة (14) والمادة (29) وما بعدهما من <strong>نظام الإثبات السعودي</strong> الصادر بالمرسوم الملكي رقم (م/43)، وأسقط بموجبه نهائياً أي حق في الدفع بالإنكار أو الطعن في الحسابات أو استلام البضاعة.
    </div>
    <div class="legal-clause">
      4. <strong>المسؤولية وأتعاب التقاضي:</strong> في حال التخلف عن السداد، يحق للدائن اتخاذ كافة الإجراءات القضائية، مع تحمّل المدين المقر (وكفيله الغارم) لكافة أتعاب المحاماة ومصاريف التقاضي والأضرار الناتجة عن التأخير.
    </div>
    ${notes ? `<div style="margin-top:8px; padding:6px 10px; background:#fff; border-right:3px solid #004d80; font-size:11.5px; color:#1e293b;"><strong>ملاحظات / مرجع الفواتير:</strong> ${notes}</div>` : ""}
  </div>

  <!-- Signatures -->
  <div class="sig-area">

    <!-- Debtor Signature & Stamp (No thumbprint) -->
    <div class="sig-box">
      <div class="sig-box-title">✍️ توقيع وختم المدين المقر</div>
      <div class="sig-meta">
        <div>المنشأة: <strong>${custName}</strong></div>
        <div>المفوض بالتوقيع: <strong>${custResp} ${custRespRole ? `(${custRespRole})` : ''}</strong></div>
        <div>الهوية/السجل: <strong class="mono">${custRespId || custIdNum}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">التوقيع والختم الرسمي للمدين المقر</div>
      </div>
    </div>

    <!-- Guarantor (if provided) (No thumbprint) -->
    ${guarName ? `
    <div class="sig-box">
      <div class="sig-box-title">🤝 توقيع الكفيل الغارم المتضامن</div>
      <div class="sig-meta">
        <div>الاسم: <strong>${guarName}</strong></div>
        <div>الهوية: <strong class="mono">${guarId || "—"}</strong></div>
        <div>الجوال: <strong class="mono">${guarPhone || "—"}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">توقيع الكفيل الغارم</div>
      </div>
    </div>
    ` : ""}

    <!-- Creditor Stamp & Signature -->
    <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
      <div class="sig-box-title" style="color:#004d80;">🏢 اعتماد وخاتم الدائن (المقر له)</div>
      <div class="sig-meta">
        <div>المنشأة: <strong>${coName}</strong></div>
        <div>السجل التجاري: <strong class="mono">${coCR}</strong></div>
      </div>
      <div style="text-align:center; margin-top:4px; min-height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        ${stampB64 ? `<img src="${stampB64}" class="stamp-img" alt="ختم الشركة"/>` : `<div style="height:70px;"></div>`}
        <div class="sig-line" style="width:100%; margin-top:2px;">توقيع وخاتم الدائن المعتمد</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م — وثيقة إقرار مالي وتعهد قضائي ملزم رقم: <strong class="mono">${docNumber}</strong>
    <br/>
    ${coName} للتجارة — ينبع — المملكة العربية السعودية — وثيقة رسمية حجة في الإثبات القضائي
  </div>

</div>

</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

// Global exposure
if (typeof window !== "undefined") {
  window.openDebtAcknowledgmentModal = openDebtAcknowledgmentModal;
  window.openDebtAcknowledgment = openDebtAcknowledgmentModal;
}
