import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, createJournalEntry, deleteJournalEntry, isPeriodClosed, clearERPCache } from "../utils/db.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import {
  doc as fsDoc, runTransaction, serverTimestamp, collection,
  getDoc, getDocs as fsGetDocs, where, query as fsQuery, deleteDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { recalculateCustomerBalance, recalculateSupplierBalance } from "../utils/balance-sync.js";

let _costCenters = [];
let allAccounts  = [];
let cashBoxes    = [];
let bankAccounts = [];
let suppliers    = [];
let customers    = [];
let _editingId   = null; // ID of voucher being edited (null = new)

// ─────────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────────
async function loadCostCenters() {
  const ccList = await getAll(COLS.costCenters()).catch(() => []);
  _costCenters = ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  const sel = document.getElementById("rcpt-cc-sel");
  if (sel) sel.innerHTML = '<option value="">بدون مركز تكلفة</option>' +
    _costCenters.map(cc => `<option value="${cc.id}">${cc.code} — ${cc.name}</option>`).join("");
  const filterSel = document.getElementById("rcpt-cc-filter");
  if (filterSel) filterSel.innerHTML = '<option value="">كل المراكز</option>' +
    _costCenters.map(cc => `<option value="${cc.id}">${cc.name}</option>`).join("");
}

window.filterReceiptsByCard = (method) => {
  const sel = document.getElementById("rcpt-method-filter");
  if (sel) {
    sel.value = method === "all" ? "" : method;
    loadReceipts();
  }
};

export async function render(container, user) {
  container.innerHTML = `
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="rcpt-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadReceipts()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="rcpt-from" class="input" value="${startOfMonth()}" onchange="loadReceipts()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">إلى تاريخ</label>
        <input type="date" id="rcpt-to" class="input" value="${todayString()}" onchange="loadReceipts()" />
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">نوع الجهة</label>
        <select id="rcpt-entity-type-filter" class="input" onchange="loadReceipts()">
          <option value="">كل الجهات</option>
          <option value="customer">عملاء</option>
          <option value="supplier">موردين</option>
          <option value="revenue">إيراد مباشر</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">طريقة القبض</label>
        <select id="rcpt-method-filter" class="input" onchange="loadReceipts()">
          <option value="">كل الطرق</option>
          <option value="cash">💵 نقدي</option>
          <option value="bank">🏦 تحويل بنكي</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">مركز التكلفة</label>
        <select id="rcpt-cc-filter" class="input" onchange="loadReceipts()">
          <option value="">كل المراكز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_القبض')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_القبض')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="printAllReceiptVouchers()" title="طباعة جميع السندات المعروضة">🖨️ طباعة الكل</button>
        <button class="btn btn-secondary btn-sm" onclick="printBlankReceiptVoucher()" title="طباعة سند قبض فارغ للتعبئة اليدوية" style="background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.4);color:#b45309;">📝 سند فارغ</button>
        <button class="btn btn-primary" onclick="openReceiptModal()">+ سند قبض جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💳 سجل سندات القبض (Receipt Vouchers)</h1>
        <p class="page-subtitle" id="rcpt-count" style="color:var(--text-3);font-size:13px;">سجل سندات القبض النقدية والبنكية للعملاء والموردين والإيرادات</p>
      </div>

      <!-- ═══ RICH INTERACTIVE KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" id="rcpt-kpi-grid">
        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-all" onclick="filterReceiptsByCard('all')" style="cursor:pointer;background:linear-gradient(135deg, rgba(91,127,255,0.08), rgba(91,127,255,0.02));border:1.5px solid rgba(91,127,255,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية كافة المقبوضات">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:var(--brand);">💰 إجمالي المقبوضات المعروضة</span>
            <span class="badge sm" id="kpi-badge-all" style="font-size:10px;background:var(--brand);color:#fff;">الكل 🎯</span>
          </div>
          <span class="stats-val text-brand" id="kpi-rcpt-total" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-cash" onclick="filterReceiptsByCard('cash')" style="cursor:pointer;background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02));border:1.5px solid rgba(16,185,129,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المقبوضات النقدية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#059669;">💵 المقبوضات النقدية (صناديق)</span>
            <span class="badge sm" id="kpi-badge-cash" style="font-size:10px;background:rgba(16,185,129,0.15);color:#059669;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-ok" id="kpi-rcpt-cash" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-bank" onclick="filterReceiptsByCard('bank')" style="cursor:pointer;background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02));border:1.5px solid rgba(37,99,235,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المقبوضات البنكية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#1d4ed8;">🏦 المقبوضات البنكية والتحويلات</span>
            <span class="badge sm" id="kpi-badge-bank" style="font-size:10px;background:rgba(37,99,235,0.15);color:#1d4ed8;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-brand" id="kpi-rcpt-bank" style="font-size:22px;font-weight:900;color:#1d4ed8;">0.00 ر.س</span>
        </div>

        <div class="stats-card" style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02));border:1.5px solid rgba(245,158,11,0.3);border-radius:16px;padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#d97706;">🔢 عدد السندات المحررة</span>
            <span class="badge sm" style="font-size:10px;background:rgba(245,158,11,0.15);color:#d97706;">عدد 📋</span>
          </div>
          <span class="stats-val text-warning" id="kpi-rcpt-count" style="font-size:22px;font-weight:900;">0 سند</span>
        </div>
      </div>

      <div class="card" style="border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:100px;">التاريخ</th>
                <th style="width:110px;">رقم السند</th>
                <th>جهة القبض</th>
                <th style="width:100px;">نوع الجهة</th>
                <th>البيان والملاحظات</th>
                <th>طريقة القبض والصندوق</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;width:120px;">المبلغ</th>
                <th style="text-align:center;width:150px;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="rcpt-tbody">
              ${Array(6).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px;height:14px;margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Receipt Form Modal (New + Edit)
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="receipt-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="rcpt-modal-title">سند قبض جديد (Receipt Voucher)</h3>
          <button class="modal-close" onclick="closeModal('receipt-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="rcpt-date" class="input" value="${todayString()}" />
            </div>
            <div class="form-group">
              <label>المبلغ *</label>
              <input type="number" id="rcpt-amount" class="input mono" min="0" step="0.01" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>جهة القبض (النوع) *</label>
              <select id="rcpt-entity-type" class="input" onchange="onReceiptEntityTypeChange()">
                <option value="customer">عميل (تحصيل ذمة مدينة)</option>
                <option value="supplier">مورد (استرداد نقدية)</option>
                <option value="revenue">بند إيراد مباشر</option>
                <option value="other">حساب عام</option>
              </select>
            </div>
            <div class="form-group">
              <label id="rcpt-entity-label">الحساب / الكيان المقابل *</label>
              <div style="display:flex;gap:6px;flex-direction:column;">
                <input type="text" id="rcpt-target-search" class="input" placeholder="🔍 ابحث بجزء من اسم الحساب أو الكود..." oninput="filterReceiptTargetEntity()" style="font-size:12.5px;padding:6px 12px;background:var(--bg-2);border-radius:8px;" />
                <select id="rcpt-target-entity" class="input">
                  <option value="">اختر...</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة القبض *</label>
              <select id="rcpt-pay-method" class="input" onchange="toggleReceiptPaySource()">
                <option value="cash">نقدي (إيداع بصندوق)</option>
                <option value="bank">تحويل بنكي (إيداع ببنك)</option>
              </select>
            </div>
            <div class="form-group">
              <label id="rcpt-source-label">صندوق الاستلام *</label>
              <select id="rcpt-source" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>البيان / ملاحظات *</label>
            <textarea id="rcpt-notes" class="input" rows="2" placeholder="اكتب بياناً تفصيلياً لعملية القبض والتحصيل..."></textarea>
          </div>

          <div class="form-group mb-16">
            <label>🏷️ مركز التكلفة (اختياري)</label>
            <select id="rcpt-cc-sel" class="input">
              <option value="">بدون مركز تكلفة</option>
            </select>
          </div>

          <div class="form-group mb-16" id="rcpt-file-group">
            <label>📁 إرفاق إيصال / صورة التحويل البنكي أو الشيك</label>
            <input type="file" id="rcpt-file-upload" class="input" accept="image/*,application/pdf" />
          </div>

          <div id="rcpt-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('receipt-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveReceipt()" id="save-rcpt-btn">حفظ واعتماد</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Receipt Preview Modal
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="receipt-preview-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">معاينة سند القبض</h3>
          <button class="modal-close" onclick="closeModal('receipt-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="receipt-preview-body">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('receipt-preview-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="printReceiptVoucher()">🖨️ طباعة</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Delete Confirm Modal
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="rcpt-delete-modal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title" style="color:var(--bad);">⚠️ تأكيد حذف سند القبض</h3>
          <button class="modal-close" onclick="closeModal('rcpt-delete-modal')">×</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:12px;font-size:15px;">هل أنت متأكد من حذف هذا السند؟</p>
          <div id="rcpt-delete-info" style="background:var(--bg-2);border-radius:8px;padding:12px;font-size:13px;line-height:1.8;"></div>
          <div class="alert bad" style="margin-top:16px;font-size:13px;">
            ⚠️ سيتم حذف <strong>السند + القيود المحاسبية + حركات الصندوق/البنك</strong> المرتبطة به نهائياً ولا يمكن التراجع عن ذلك.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rcpt-delete-modal')">إلغاء</button>
          <button class="btn btn-danger" onclick="confirmDeleteReceipt()" id="rcpt-confirm-delete-btn">🗑️ حذف نهائياً</button>
        </div>
      </div>
    </div>
  `;

  const fromEl = container.querySelector("#rcpt-from");
  const toEl   = container.querySelector("#rcpt-to");
  if (fromEl) fromEl.addEventListener("change", loadReceipts);
  if (toEl)   toEl.addEventListener("change", loadReceipts);

  await Promise.all([
    loadReceiptReferenceData(),
    loadCostCenters(),
    loadReceipts()
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reference Data
// ─────────────────────────────────────────────────────────────────────────────
async function loadReceiptReferenceData() {
  [allAccounts, cashBoxes, bankAccounts, suppliers, customers] = await Promise.all([
    getAll(COLS.chartOfAccounts()),
    getAll(COLS.cashBoxes()),
    getAll(COLS.bankAccounts()),
    getAll(COLS.suppliers()),
    getAll(COLS.customers()),
  ]);
  onReceiptEntityTypeChange();
  toggleReceiptPaySource();
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────────────────────
let _rcptTargetOptions = [];

function _renderRcptTargetSelectOptions(sel, list, query = "") {
  if (!sel) return;
  let html = '<option value="">اختر...</option>';
  if (list && list.length) {
    html += list.map(item => `<option value="${item.id}">${item.text}</option>`).join("");
  } else {
    html = `<option value="">🔍 لا يوجد حساب يطابق "${query}"</option>`;
  }
  sel.innerHTML = html;
}

window.onReceiptEntityTypeChange = () => {
  const type  = document.getElementById("rcpt-entity-type").value;
  const label = document.getElementById("rcpt-entity-label");
  const sel   = document.getElementById("rcpt-target-entity");
  const searchInput = document.getElementById("rcpt-target-search");
  if (searchInput) searchInput.value = "";

  let list = [];
  if (type === "customer") {
    label.textContent = "العميل المستهدف *";
    list = customers.map(c => ({ id: c.id, text: c.name }));
  } else if (type === "supplier") {
    label.textContent = "المورد المستهدف *";
    list = suppliers.map(s => ({ id: s.id, text: s.name }));
  } else if (type === "revenue") {
    label.textContent = "بند الإيراد (الحساب) *";
    list = allAccounts.filter(a => a.type === "revenue")
      .map(a => ({ id: a.id, text: `${a.code} - ${a.name}` }));
  } else {
    label.textContent = "الحساب الدائن (دليل الحسابات) *";
    list = allAccounts.map(a => ({ id: a.id, text: `${a.code} - ${a.name}` }));
  }

  _rcptTargetOptions = list;
  _renderRcptTargetSelectOptions(sel, list);
};

window.filterReceiptTargetEntity = () => {
  const query = (document.getElementById("rcpt-target-search")?.value || "").trim().toLowerCase();
  const sel   = document.getElementById("rcpt-target-entity");
  if (!query) {
    _renderRcptTargetSelectOptions(sel, _rcptTargetOptions);
    return;
  }
  const filtered = _rcptTargetOptions.filter(item => item.text.toLowerCase().includes(query));
  _renderRcptTargetSelectOptions(sel, filtered, query);
  if (filtered.length === 1 && sel) {
    sel.value = filtered[0].id;
  }
};

window.toggleReceiptPaySource = () => {
  const method = document.getElementById("rcpt-pay-method")?.value || "cash";
  const label  = document.getElementById("rcpt-source-label");
  const sel    = document.getElementById("rcpt-source");
  if (!sel) return;
  sel.innerHTML = '<option value="">اختر...</option>';

  if (method === "cash") {
    if (label) label.textContent = "صندوق الاستلام *";
    let list = (cashBoxes && cashBoxes.length > 0) ? cashBoxes : [];
    if (list.length === 0 && allAccounts && allAccounts.length > 0) {
      list = allAccounts.filter(a => a.code?.startsWith("1-1-1-1") || a.code?.startsWith("1-1-1-2") || a.name?.includes("صندوق") || a.code === "1-1-1-1-3");
    }
    sel.innerHTML += list.map(c => `<option value="${c.id}">${c.name || c.accountName || c.code}</option>`).join("");
  } else {
    if (label) label.textContent = "الحساب البنكي المودع به *";
    let list = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : [];
    if (list.length === 0 && allAccounts && allAccounts.length > 0) {
      list = allAccounts.filter(a => a.code?.startsWith("1-1-1-3") || a.name?.includes("بنك") || a.name?.includes("الراجح") || a.name?.includes("الجزير"));
    }
    sel.innerHTML += list.map(b => {
      const bName = b.name || b.bankName || b.accountName || "حساب بنكي";
      const bAcc = b.accountNumber ? ` (${b.accountNumber})` : (b.accountCode ? ` [${b.accountCode}]` : '');
      return `<option value="${b.id}">${bName}${bAcc}</option>`;
    }).join("");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Open Modal: NEW or EDIT
// ─────────────────────────────────────────────────────────────────────────────
window.openReceiptModal = async (receiptData = null) => {
  if (!cashBoxes.length || !bankAccounts.length || !allAccounts.length) {
    await loadReceiptReferenceData();
  }
  _editingId = receiptData ? receiptData.id : null;
  const titleEl = document.getElementById("rcpt-modal-title");
  const fileGroup = document.getElementById("rcpt-file-group");

  if (receiptData) {
    titleEl.textContent = `تعديل سند القبض — #${receiptData.id.substring(0,6).toUpperCase()}`;
    if (fileGroup) fileGroup.style.display = "none"; // hide file on edit
  } else {
    titleEl.textContent = "سند قبض جديد (Receipt Voucher)";
    if (fileGroup) fileGroup.style.display = "";
  }

  // Populate fields
  document.getElementById("rcpt-date").value   = receiptData?.date   || todayString();
  document.getElementById("rcpt-amount").value = receiptData?.amount || "";
  document.getElementById("rcpt-notes").value  = receiptData?.notes  || "";

  const entityTypeEl = document.getElementById("rcpt-entity-type");
  entityTypeEl.value = receiptData?.entityType || "customer";
  onReceiptEntityTypeChange();

  const targetEl = document.getElementById("rcpt-target-entity");
  if (receiptData?.targetId) targetEl.value = receiptData.targetId;

  const methodEl = document.getElementById("rcpt-pay-method");
  methodEl.value = receiptData?.method || "cash";
  toggleReceiptPaySource();

  const sourceEl = document.getElementById("rcpt-source");
  if (receiptData?.sourceId) sourceEl.value = receiptData.sourceId;
  const ccSel = document.getElementById("rcpt-cc-sel");
  if (ccSel && receiptData?.costCenterId) ccSel.value = receiptData.costCenterId;

  document.getElementById("rcpt-error").classList.add("hidden");
  openModal("receipt-modal");
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVE (Create or Update)
// ─────────────────────────────────────────────────────────────────────────────
window.saveReceipt = async () => {
  const errEl  = document.getElementById("rcpt-error");
  errEl.classList.add("hidden");

  const date       = document.getElementById("rcpt-date").value;
  const amount     = parseFloat(document.getElementById("rcpt-amount").value);
  const entityType = document.getElementById("rcpt-entity-type").value;
  const targetId   = document.getElementById("rcpt-target-entity").value;
  const method     = document.getElementById("rcpt-pay-method").value;
  const sourceId   = document.getElementById("rcpt-source").value;
  const notes      = document.getElementById("rcpt-notes").value.trim();
  const ccId       = document.getElementById("rcpt-cc-sel")?.value || null;

  if (!date || !amount || amount <= 0 || !targetId || !sourceId || !notes) {
    errEl.textContent = "الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-rcpt-btn");
  btn.disabled = true;
  btn.textContent = _editingId ? "جاري التعديل..." : "جاري الحفظ...";

  try {
    if (await isPeriodClosed(date)) {
      errEl.textContent = `⚠️ لا يمكن الحفظ لأن تاريخ (${date}) يقع في فترة محاسبية مغلقة.`;
      errEl.classList.remove("hidden");
      return;
    }

    // ── Resolve Accounts ──────────────────────────────────────
    const { creditAccId, creditAccCode, creditAccName, destinationName } =
      resolveCredit(entityType, targetId);

    const { debitAccId, debitAccCode, debitAccName, sourceDocRef } =
      resolveDebit(method, sourceId);

    const sourceName = method === "cash"
      ? cashBoxes.find(c => c.id === sourceId)?.name
      : bankAccounts.find(b => b.id === sourceId)?.name;

    const ccName = _costCenters.find(cc => cc.id === ccId)?.name || null;

    // ── EDIT path ─────────────────────────────────────────────
    if (_editingId) {
      await _updateReceipt({
        id: _editingId, date, amount, entityType, targetId,
        accountName: destinationName || "إيراد",
        method, sourceId, sourceName, notes, ccId, ccName,
        debitAccId, debitAccCode, debitAccName,
        creditAccId, creditAccCode, creditAccName, sourceDocRef
      });
      showToast("تم تعديل سند القبض وتحديث القيود", "success");

    // ── CREATE path ───────────────────────────────────────────
    } else {
      await _createReceipt({
        date, amount, entityType, targetId,
        accountName: destinationName || "إيراد",
        method, sourceId, sourceName, notes, ccId, ccName,
        debitAccId, debitAccCode, debitAccName,
        creditAccId, creditAccCode, creditAccName, sourceDocRef
      });

      const fileInput = document.getElementById("rcpt-file-upload");
      if (fileInput?.files?.length > 0) {
        window.uploadFileToArchive(fileInput.files[0], "bank_transfers", "new",
          `مرفق سند قبض — ${notes}`).catch(e => console.warn(e));
      }
      showToast("تم حفظ سند القبض واعتماده", "success");
    }

    if (entityType === "customer") await recalculateCustomerBalance(targetId).catch(() => {});
    else if (entityType === "supplier") await recalculateSupplierBalance(targetId).catch(() => {});

    clearERPCache(`companies/${COMPANY_ID}/receipts`);
    clearERPCache(`companies/${COMPANY_ID}/chartOfAccounts`);
    clearERPCache(`companies/${COMPANY_ID}/journalEntries`);
    clearERPCache(`companies/${COMPANY_ID}/customers`);
    clearERPCache(`companies/${COMPANY_ID}/suppliers`);

    closeModal("receipt-modal");
    await loadReceipts();

  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "حفظ واعتماد";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE (Atomic Transaction)
// ─────────────────────────────────────────────────────────────────────────────
async function _createReceipt(p) {
  let rcptId = "";
  await runTransaction(db, async (tx) => {
    // Reads first
    let currentBal = 0;
    if (p.sourceDocRef) {
      const snap = await tx.get(p.sourceDocRef);
      if (snap.exists()) currentBal = parseFloat(snap.data().balance || 0);
    }
    const balanceAfter = currentBal + p.amount;

    // Write receipt doc
    const receiptRef = fsDoc(collection(db, `companies/${COMPANY_ID}/receipts`));
    rcptId = receiptRef.id;
    tx.set(receiptRef, {
      date: p.date, amount: p.amount, entityType: p.entityType,
      targetId: p.targetId, accountName: p.accountName,
      method: p.method, sourceId: p.sourceId, sourceName: p.sourceName,
      notes: p.notes, costCenterId: p.ccId, costCenterName: p.ccName,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });

    // Update source balance
    if (p.sourceDocRef) {
      tx.update(p.sourceDocRef, { balance: balanceAfter, updatedAt: serverTimestamp() });
    }

    // Write cash/bank transaction
    const txColl = p.method === "cash"
      ? `companies/${COMPANY_ID}/cashTransactions`
      : `companies/${COMPANY_ID}/bankTransactions`;
    const txRef = fsDoc(collection(db, txColl));
    const txData = p.method === "cash"
      ? { cashBoxId: p.sourceId, type: "in", amount: p.amount, balanceAfter, sourceType: "receipt", sourceId: rcptId, date: p.date, notes: `سند قبض — ${p.notes}`, userName: "النظام", createdAt: serverTimestamp() }
      : { bankAccountId: p.sourceId, type: "in", amount: p.amount, balanceAfter, sourceType: "receipt", sourceId: rcptId, date: p.date, refNumber: `RV-${rcptId.substring(0,6).toUpperCase()}`, notes: `سند قبض — ${p.notes}`, userName: "النظام", createdAt: serverTimestamp() };
    tx.set(txRef, txData);
  });

  // Journal entry
  await createJournalEntry({
    date: p.date,
    description: `سند قبض رقم #${rcptId.substring(0,6).toUpperCase()} - ${p.notes}`,
    sourceType: "receipt", sourceId: rcptId,
    lines: [
      { accountId: p.debitAccId,  accountCode: p.debitAccCode,  accountName: p.debitAccName,  debit: p.amount, credit: 0,        note: p.notes, costCenterId: p.ccId },
      { accountId: p.creditAccId, accountCode: p.creditAccCode, accountName: p.creditAccName, debit: 0,        credit: p.amount, note: `تحصيل سند قبض`, costCenterId: p.ccId }
    ]
  });
  return rcptId;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE (Edit existing — reverse old, apply new)
// ─────────────────────────────────────────────────────────────────────────────
async function _updateReceipt(p) {
  // 1. Load old receipt doc
  const oldSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/receipts`, p.id));
  if (!oldSnap.exists()) throw new Error("سند القبض غير موجود");
  const old = { id: p.id, ...oldSnap.data() };

  // 2. Find old source doc
  const oldSourceColl = old.method === "cash" ? "cashBoxes" : "bankAccounts";
  const oldSourceRef  = fsDoc(db, `companies/${COMPANY_ID}/${oldSourceColl}`, old.sourceId);
  const newSourceColl = p.method === "cash" ? "cashBoxes" : "bankAccounts";
  const newSourceRef  = fsDoc(db, `companies/${COMPANY_ID}/${newSourceColl}`, p.sourceId);

  // 3. Atomic transaction: reverse old balance + apply new balance + update receipt
  let newCalculatedBal = 0;
  await runTransaction(db, async (tx) => {
    const oldSourceSnap = await tx.get(oldSourceRef);
    const oldBal        = parseFloat(oldSourceSnap.data()?.balance || 0);

    let newBal;
    if (old.sourceId === p.sourceId) {
      // Same source: reverse old amount, add new amount
      newBal = oldBal - old.amount + p.amount;
      tx.update(oldSourceRef, { balance: newBal, updatedAt: serverTimestamp() });
      newCalculatedBal = newBal;
    } else {
      // Different source: restore old source, deduct from new source
      const newSourceSnap = await tx.get(newSourceRef);
      const newSrcBal     = parseFloat(newSourceSnap.data()?.balance || 0);
      tx.update(oldSourceRef, { balance: oldBal - old.amount, updatedAt: serverTimestamp() });
      newBal = newSrcBal + p.amount;
      tx.update(newSourceRef, { balance: newBal, updatedAt: serverTimestamp() });
      newCalculatedBal = newBal;
    }

    // Update receipt document in place
    tx.update(fsDoc(db, `companies/${COMPANY_ID}/receipts`, p.id), {
      date: p.date, amount: p.amount, entityType: p.entityType,
      targetId: p.targetId, accountName: p.accountName,
      method: p.method, sourceId: p.sourceId, sourceName: p.sourceName,
      notes: p.notes, costCenterId: p.ccId, costCenterName: p.ccName,
      updatedAt: serverTimestamp()
    });
  });

  // 4. Delete old journal entries for this receipt, then re-create
  await _deleteJournalEntriesBySource(p.id);
  await _deleteCashBankTxBySource(p.id, old.method);

  // 5. Write new journal entry
  await createJournalEntry({
    date: p.date,
    description: `سند قبض رقم #${p.id.substring(0,6).toUpperCase()} - ${p.notes}`,
    sourceType: "receipt", sourceId: p.id,
    lines: [
      { accountId: p.debitAccId,  accountCode: p.debitAccCode,  accountName: p.debitAccName,  debit: p.amount, credit: 0,        note: p.notes, costCenterId: p.ccId },
      { accountId: p.creditAccId, accountCode: p.creditAccCode, accountName: p.creditAccName, debit: 0,        credit: p.amount, note: `تحصيل سند قبض`, costCenterId: p.ccId }
    ]
  });

  // 6. Write new cash/bank transaction
  const newTxColl = p.method === "cash"
    ? `companies/${COMPANY_ID}/cashTransactions`
    : `companies/${COMPANY_ID}/bankTransactions`;
  const newTxRef  = fsDoc(collection(db, newTxColl));
  const newTxData = p.method === "cash"
    ? { cashBoxId: p.sourceId, type: "in", amount: p.amount, balanceAfter: newCalculatedBal, sourceType: "receipt", sourceId: p.id, date: p.date, notes: `سند قبض — ${p.notes}`, userName: "النظام", createdAt: serverTimestamp() }
    : { bankAccountId: p.sourceId, type: "in", amount: p.amount, balanceAfter: newCalculatedBal, sourceType: "receipt", sourceId: p.id, date: p.date, refNumber: `RV-${p.id.substring(0,6).toUpperCase()}`, notes: `سند قبض — ${p.notes}`, userName: "النظام", createdAt: serverTimestamp() };
  // Use direct add (not in transaction as balances already handled)
  const { addDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
  await addDoc(collection(db, newTxColl), newTxData);
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE with Cascade
// ─────────────────────────────────────────────────────────────────────────────
let _pendingDeleteId = null;

window.confirmDeleteReceiptModal = async (id) => {
  _pendingDeleteId = id;
  const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/receipts`, id));
  if (!snap.exists()) { showToast("السند غير موجود", "error"); return; }
  const r = snap.data();
  document.getElementById("rcpt-delete-info").innerHTML = `
    <div>📅 التاريخ: <strong>${r.date}</strong></div>
    <div>🔢 رقم السند: <strong>${id.substring(0,6).toUpperCase()}</strong></div>
    <div>👤 الجهة: <strong>${r.accountName}</strong></div>
    <div>💰 المبلغ: <strong>${formatCurrency(r.amount)}</strong></div>
    <div>📝 البيان: <strong>${r.notes}</strong></div>
  `;
  openModal("rcpt-delete-modal");
};

window.confirmDeleteReceipt = async () => {
  if (!_pendingDeleteId) return;
  const btn = document.getElementById("rcpt-confirm-delete-btn");
  btn.disabled = true;
  btn.textContent = "جاري الحذف...";

  try {
    const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/receipts`, _pendingDeleteId));
    if (!snap.exists()) throw new Error("السند غير موجود");
    const old = snap.data();

    // 1. Reverse source balance
    const sourceColl = old.method === "cash" ? "cashBoxes" : "bankAccounts";
    const sourceRef  = fsDoc(db, `companies/${COMPANY_ID}/${sourceColl}`, old.sourceId);
    await runTransaction(db, async (tx) => {
      const srcSnap = await tx.get(sourceRef);
      if (srcSnap.exists()) {
        const bal = parseFloat(srcSnap.data().balance || 0);
        tx.update(sourceRef, { balance: Math.max(0, bal - old.amount), updatedAt: serverTimestamp() });
      }
      // Delete receipt doc
      tx.delete(fsDoc(db, `companies/${COMPANY_ID}/receipts`, _pendingDeleteId));
    });

    // 2. Cascade delete journal entries
    await _deleteJournalEntriesBySource(_pendingDeleteId);

    // 3. Cascade delete cash/bank transactions
    await _deleteCashBankTxBySource(_pendingDeleteId, old.method);

    if (old.entityType === "customer") await recalculateCustomerBalance(old.targetId).catch(() => {});
    else if (old.entityType === "supplier") await recalculateSupplierBalance(old.targetId).catch(() => {});

    clearERPCache(`companies/${COMPANY_ID}/receipts`);
    clearERPCache(`companies/${COMPANY_ID}/journalEntries`);
    clearERPCache(`companies/${COMPANY_ID}/chartOfAccounts`);
    clearERPCache(`companies/${COMPANY_ID}/customers`);
    clearERPCache(`companies/${COMPANY_ID}/suppliers`);

    showToast("تم حذف السند وجميع القيود والحركات المرتبطة به", "success");
    closeModal("rcpt-delete-modal");
    await loadReceipts();

  } catch (err) {
    showToast("خطأ: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🗑️ حذف نهائياً";
    _pendingDeleteId = null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Preview
// ─────────────────────────────────────────────────────────────────────────────
// Helper for Clean Sequential Voucher Code
function _getCleanVoucherCode(docObj, fallbackId, typePrefix) {
  if (docObj && docObj.displayCode) return docObj.displayCode;
  if (docObj && (docObj.number || docObj.seqNo)) {
    const num = docObj.number || docObj.seqNo;
    return `${typePrefix}-${String(num).padStart(5, '0')}`;
  }
  // If loadedReceipts is present, find index
  if (typeof _loadedReceipts !== "undefined" && _loadedReceipts.length) {
    const idx = _loadedReceipts.findIndex(x => x.id === fallbackId);
    if (idx !== -1) return `${typePrefix}-${String(idx + 101).padStart(5, '0')}`;
  }
  // Deterministic clean numeric code fallback
  let hashNum = 0;
  for (let i = 0; i < fallbackId.length; i++) {
    hashNum = (hashNum << 5) - hashNum + fallbackId.charCodeAt(i);
    hashNum |= 0;
  }
  const cleanSeq = Math.abs(hashNum % 8999) + 101;
  return `${typePrefix}-${String(cleanSeq).padStart(5, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview
// ─────────────────────────────────────────────────────────────────────────────
window.previewReceipt = async (id) => {
  let r = (typeof _loadedReceipts !== "undefined" ? _loadedReceipts : []).find(e => e.id === id);
  if (!r) {
    try {
      const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/receipts`, id));
      if (snap.exists()) r = { id: snap.id, ...snap.data() };
    } catch (_) {}
  }
  if (!r) { showToast("السند غير موجود", "error"); return; }

  // Ensure clean sequential code
  r.displayCode = _getCleanVoucherCode(r, id, "RV");

  // Load company settings and logo from Firestore
  let company = {};
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      company = compSnap.data();
    } else {
      const rootSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}`));
      if (rootSnap.exists()) company = rootSnap.data();
    }
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      company.logoUrl = logoSnap.data().dataUrl;
    }
  } catch (_) {}

  const body = document.getElementById("receipt-preview-body");
  body.setAttribute("data-receipt-id", id);
  body.innerHTML = _buildReceiptHTML(r, id, company);
  openModal("receipt-preview-modal");
};

window.printReceiptVoucher = () => {
  const body = document.getElementById("receipt-preview-body");
  const html = body.innerHTML;
  const win  = window.open("", "_blank", "width=850,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

// ─────────────────────────────────────────────────────────────────────────────
// Build Receipt Print HTML
// ─────────────────────────────────────────────────────────────────────────────
function _buildReceiptHTML(r, id, company) {
  const code = r.displayCode || _getCleanVoucherCode(r, id, "RV");
  const typeMap   = { customer: "عميل", supplier: "مورد", revenue: "إيراد مباشر", other: "حساب عام" };
  const methodMap = { cash: "💵 نقدي", bank: "🏦 تحويل بنكي" };
  const amountWords = _numberToArabicWords(r.amount);

  // Company fields
  const coName    = company.name    || company.companyName || "شركة نظم الإمداد الحديثة";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
  const coPhone   = company.phone   || company.mobile || "0549141648";
  const coEmail   = company.email   || "";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "312448150500003";
  const coCr      = company.crNumber || company.cr  || "4700123180";
  const coLogo    = company.logoUrl  || company.logoBase64 || company.logo || "";

  return `
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${coLogo 
            ? `<img src="${coLogo}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />` 
            : `<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">🏢</div>`
          }
          <div>
            <div style="font-size:25px;font-weight:900;color:#ffffff !important;line-height:1.2;letter-spacing:0.3px;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${coName}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.92) !important;margin-bottom:6px;font-weight:600;">📍 ${coAddress}</div>
            
            <!-- Clean Inline Official Badges (No ugly dark boxes) -->
            <div style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:11.5px;color:rgba(255,255,255,0.95) !important;">
              ${coVat ? `<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${coVat}</span></span>` : ""}
              ${coCr  ? `<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr" style="font-family:monospace;">${coCr}</span></span>`   : ""}
              ${coPhone ? `<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${coPhone}</span></span>` : ""}
            </div>
          </div>
        </div>

        <!-- Left: Official Certificate Title Badge -->
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.35) !important;border-radius:16px;padding:14px 28px;box-shadow:0 4px 15px rgba(0,0,0,0.15);-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
            <div style="font-size:28px;font-weight:900;color:#ffffff !important;letter-spacing:1.5px;line-height:1;">سـنـد قـبـض</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.88) !important;letter-spacing:3px;font-weight:800;margin-top:5px;text-transform:uppercase;">RECEIPT VOUCHER</div>
          </div>
        </div>

      </div>
      
      <!-- Gold Accent Divider Ribbon -->
      <div style="height:5px;background:linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;margin-top:18px;border-radius:3px;"></div>
    </div>

    <!-- ═══ VOUCHER SERIAL & META BAR ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;padding:18px 36px;display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:20px;align-items:center;">
      
      <!-- Voucher Number -->
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:12px;">
        <div style="font-size:11px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">رقم السند المتسلسل</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:22px;font-weight:900;color:#1e3a8a;font-family:'Courier New',Consolas,monospace;background:#e0e7ff;padding:3px 14px;border-radius:8px;border:1px solid #c7d2fe;">${code}</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:12px;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${r.date}</div>
      </div>

      <!-- Payment/Receipt Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة القبض / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#047857;">${methodMap[r.method] || r.method}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:700;margin-top:2px;">${r.sourceName || "الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);border:2px solid #059669;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(5,150,105,0.08);">
        
        <div>
          <div style="font-size:12px;color:#065f46;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">💰 المبلغ المستلم بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#064e3b;font-family:'Courier New',Consolas,monospace;line-height:1;">${formatCurrency(r.amount)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #6ee7b7;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#047857;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#064e3b;font-weight:900;line-height:1.5;">فقط ${amountWords} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ DETAILS GRID & STATEMENT ═══ -->
    <div style="padding:0 36px 24px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:14px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">استلمنا من (جهة القبض / الحساب الدائن)</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:140px;">نوع الجهة</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:200px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:16px 18px;font-size:16px;font-weight:900;color:#1e3a8a;">${r.accountName}</td>
            <td style="padding:16px 18px;border-right:1.5px solid #cbd5e1;">
              <span style="background:#dbeafe;color:#1e40af;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #93c5fd;">${typeMap[r.entityType] || r.entityType}</span>
            </td>
            <td style="padding:16px 18px;font-size:13.5px;font-weight:700;color:#475569;border-right:1.5px solid #cbd5e1;">${r.costCenterName || "بدون مركز تكلفة"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement / Notes Box -->
      <div style="margin-top:18px;background:#f8fafc;border:1.5px dashed #94a3b8;border-radius:14px;padding:18px 24px;">
        <div style="font-size:11.5px;color:#64748b;font-weight:800;margin-bottom:6px;text-transform:uppercase;">البيان / ملاحظات وسبب القبض</div>
        <div style="font-size:15px;color:#0f172a;font-weight:800;line-height:1.6;">${r.notes || "—"}</div>
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:28px 36px 32px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;">
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المستلم (الجهة الدائنة)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">اعتماد المدير المالي</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:11px;color:#64748b;font-weight:700;">طُبع من نظام شركة نظم الإمداد الحديثة بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
      <div dir="ltr" style="display:inline-block;direction:ltr;font-size:11px;color:#334155;font-family:monospace;font-weight:800;">REF: ${code}</div>
    </div>

  </div>`;
}

window.printSingleReceiptVoucher = async (id) => {
  let r = (typeof _loadedReceipts !== "undefined" ? _loadedReceipts : []).find(e => e.id === id);
  if (!r) {
    try {
      const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/receipts`, id));
      if (snap.exists()) r = { id: snap.id, ...snap.data() };
    } catch (_) {}
  }
  if (!r) { showToast("السند غير موجود", "error"); return; }

  let company = {};
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) company = compSnap.data();
    if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
  } catch (_) {}

  const html = _buildReceiptHTML(r, id, company);
  const win = window.open("", "_blank", "width=850,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض — ${r.displayCode || 'RV-' + id.substring(0,6).toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

window.printAllReceiptVouchers = async () => {
  const vouchers = (typeof _loadedReceipts !== "undefined" ? _loadedReceipts : []);
  if (!vouchers.length) { showToast("لا توجد سندات قبض للطباعة في القائمة الحالية", "warning"); return; }

  let company = {};
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) company = compSnap.data();
    if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
  } catch (_) {}

  const allHtml = vouchers.map((r, i) => {
    const isLast = i === vouchers.length - 1;
    return `<div style="${isLast ? '' : 'page-break-after:always;'}">${_buildReceiptHTML(r, r.id, company)}</div>`;
  }).join("");

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>طباعة جميع سندات القبض (${vouchers.length} سند)</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${allHtml}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 800);
};

// ─────────────────────────────────────────────────────────────────────────────
// Blank Receipt Voucher (for manual filling by sales reps)
// ─────────────────────────────────────────────────────────────────────────────
window.printBlankReceiptVoucher = async () => {
  let company = {};
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) company = compSnap.data();
    if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
  } catch (_) {}

  const coName    = company.name    || company.companyName || "شركة نظم الإمداد الحديثة";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
  const coPhone   = company.phone   || company.mobile || "";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "";
  const coCr      = company.crNumber || company.cr  || "";
  const coLogo    = company.logoUrl  || company.logoBase64 || company.logo || "";

  const blankLine = `<div style="border-bottom:1.5px solid #94a3b8;min-width:220px;height:28px;display:inline-block;"></div>`;
  const dottedBox = (h="48px") => `<div style="border:1.5px dashed #94a3b8;border-radius:8px;height:${h};width:100%;"></div>`;

  const html = `
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">

    <!-- ═══ ROYAL HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0369a1 100%) !important;padding:20px 30px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${coLogo
            ? `<img src="${coLogo}" style="height:70px;width:70px;object-fit:contain;background:#fff;border-radius:12px;padding:5px;box-shadow:0 3px 10px rgba(0,0,0,0.2);" />`
            : `<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>`
          }
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff !important;margin-bottom:5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${coName}</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.9) !important;margin-bottom:5px;">📍 ${coAddress}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px 8px;font-size:11px;color:rgba(255,255,255,0.95) !important;">
              ${coVat  ? `<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr">${coVat}</span></span>` : ""}
              ${coCr   ? `<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr">${coCr}</span></span>` : ""}
              ${coPhone? `<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 <span dir="ltr">${coPhone}</span></span>` : ""}
            </div>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;border:2px solid rgba(255,255,255,0.4) !important;border-radius:14px;padding:12px 24px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
            <div style="font-size:26px;font-weight:900;color:#fff !important;letter-spacing:1.5px;">سـنـد قـبـض</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.85) !important;letter-spacing:3px;font-weight:800;margin-top:4px;text-transform:uppercase;">RECEIPT VOUCHER</div>
          </div>
        </div>
      </div>
      <div style="height:4px;background:linear-gradient(90deg,#b45309 0%,#f59e0b 50%,#b45309 100%) !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;margin-top:14px;border-radius:3px;"></div>
    </div>

    <!-- ═══ META BAR (رقم السند + التاريخ + طريقة القبض) ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;padding:14px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;align-items:center;">
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:10px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;text-transform:uppercase;">رقم السند</div>
        <div style="background:#e0e7ff;border-radius:8px;border:1px solid #c7d2fe;padding:4px 10px;font-size:18px;font-weight:900;color:#1e3a8a;font-family:monospace;min-width:130px;min-height:32px;display:inline-block;"></div>
      </div>
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:10px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;">التاريخ</div>
        <div style="font-size:14px;font-weight:900;color:#0f172a;"> &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <div style="border-bottom:1.5px solid #94a3b8;width:140px;margin:4px auto 0;"></div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;">طريقة القبض</div>
        <div style="display:flex;justify-content:center;gap:14px;font-size:13px;font-weight:800;color:#334155;">
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><span style="width:15px;height:15px;border:2px solid #64748b;border-radius:3px;display:inline-block;"></span> نقدي</label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><span style="width:15px;height:15px;border:2px solid #64748b;border-radius:3px;display:inline-block;"></span> تحويل بنكي</label>
        </div>
      </div>
    </div>

    <!-- ═══ AMOUNT BOX ═══ -->
    <div style="padding:18px 30px 14px;">
      <div style="background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:2px solid #059669;border-radius:14px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div style="flex:0 0 auto;">
          <div style="font-size:11px;color:#065f46;font-weight:800;margin-bottom:6px;">💰 المبلغ بالأرقام (ر.س)</div>
          <div style="border-bottom:2px solid #059669;width:190px;height:38px;font-size:26px;font-weight:900;color:#064e3b;font-family:monospace;"></div>
        </div>
        <div style="flex:1;background:#fff;border:1.5px solid #6ee7b7;border-radius:10px;padding:12px 18px;">
          <div style="font-size:10.5px;color:#047857;font-weight:800;margin-bottom:8px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:13px;color:#064e3b;font-weight:700;">فقط ${dottedBox("24px")} لا غير</div>
        </div>
      </div>
    </div>

    <!-- ═══ DETAILS TABLE ═══ -->
    <div style="padding:0 30px 16px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">استلمنا من (جهة القبض / الحساب الدائن)</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:130px;">نوع الجهة</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:180px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:14px 16px;">${dottedBox("32px")}</td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#334155;">
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> عميل</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> مورد</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> إيراد مباشر</label>
              </div>
            </td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">${dottedBox("32px")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Notes -->
      <div style="margin-top:14px;background:#f8fafc;border:1.5px dashed #94a3b8;border-radius:12px;padding:14px 20px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:8px;">البيان / ملاحظات وسبب القبض</div>
        ${dottedBox("36px")}
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:20px 30px 24px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المستلم (الجهة الدائنة)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">اعتماد المدير المالي</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:10px 30px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:10.5px;color:#64748b;font-weight:700;">نموذج سند قبض — ${coName}</div>
      <div style="font-size:10.5px;color:#94a3b8;font-family:monospace;">BLANK RECEIPT VOUCHER TEMPLATE</div>
    </div>

  </div>`;

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض فارغ — ${coName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

// ─────────────────────────────────────────────────────────────────────────────
// Load Receipts Table
// ─────────────────────────────────────────────────────────────────────────────
let _loadedReceipts = [];


async function loadReceipts() {
  const fromEl  = document.getElementById("rcpt-from");
  const toEl    = document.getElementById("rcpt-to");
  const searchEl= document.getElementById("rcpt-search");
  const typeFEl = document.getElementById("rcpt-entity-type-filter");
  const methodFEl= document.getElementById("rcpt-method-filter");
  const ccFEl   = document.getElementById("rcpt-cc-filter");
  const tbody   = document.getElementById("rcpt-tbody");
  if (!tbody) return;

  const from = fromEl?.value || "";
  const to   = toEl?.value   || "";
  const queryText = (searchEl?.value || "").trim().toLowerCase();
  const typeF   = typeFEl?.value || "";
  const methodF = methodFEl?.value || "";
  const ccF     = ccFEl?.value || "";

  try {
    let receipts = await getAll(COLS.receipts()).catch(() => []);

    // Assign sequential display numbers (RV-00101, RV-00102, etc.) based on oldest-to-newest order
    receipts.sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      const tA = a.createdAt?.seconds || a.createdAt || 0;
      const tB = b.createdAt?.seconds || b.createdAt || 0;
      return tA - tB;
    });

    receipts.forEach((r, idx) => {
      if (!r.number && !r.seqNo) {
        r.displayCode = `RV-${String(idx + 101).padStart(5, '0')}`;
      } else {
        r.displayCode = `RV-${String(r.number || r.seqNo).padStart(5, '0')}`;
      }
    });

    // Sort client-side by date desc & createdAt desc (Newest entered first)
    receipts.sort((a, b) => {
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      const tA = a.createdAt?.seconds || a.createdAt || 0;
      const tB = b.createdAt?.seconds || b.createdAt || 0;
      return tB - tA;
    });

    _loadedReceipts = receipts;

    // 1. Filter Date Range
    if (from) receipts = receipts.filter(r => r.date && r.date >= from);
    if (to)   receipts = receipts.filter(r => r.date && r.date <= to);

    // 2. Filter Payment Method (handle all cash & bank/transfer variations)
    if (methodF === "cash") {
      receipts = receipts.filter(r => r.method === "cash" || (r.sourceName && r.sourceName.includes("صندوق")));
    } else if (methodF === "bank") {
      receipts = receipts.filter(r => r.method === "bank" || r.method === "transfer" || r.method === "bank_transfer" || r.method === "network" || r.method === "cheque" || (r.sourceName && (r.sourceName.includes("بنك") || r.sourceName.includes("مصرف") || r.sourceName.includes("الراجحى") || r.sourceName.includes("الاهلي"))));
    }

    // 3. Filter Entity Type
    if (typeF) receipts = receipts.filter(r => r.entityType === typeF);

    // 4. Filter Cost Center
    if (ccF) receipts = receipts.filter(r => r.costCenterId === ccF);

    // 5. Search text filter
    if (queryText) {
      receipts = receipts.filter(r => {
        const idStr = (r.id || "").toLowerCase();
        const dispStr = (r.displayCode || "").toLowerCase();
        const codeStr = idStr.substring(0, 6);
        const name = (r.accountName || "").toLowerCase();
        const notes = (r.notes || "").toLowerCase();
        const srcName = (r.sourceName || "").toLowerCase();
        const ccName = (r.costCenterName || "").toLowerCase();
        return idStr.includes(queryText) || dispStr.includes(queryText) || codeStr.includes(queryText) ||
               name.includes(queryText) || notes.includes(queryText) ||
               srcName.includes(queryText) || ccName.includes(queryText);
      });
    }

    // Calculate KPI Totals
    const totalAmt = receipts.reduce((s, e) => s + (e.amount || 0), 0);
    const cashAmt  = receipts.filter(r => r.method === "cash" || (r.sourceName && r.sourceName.includes("صندوق"))).reduce((s, e) => s + (e.amount || 0), 0);
    const bankAmt  = receipts.filter(r => r.method === "bank" || r.method === "transfer" || r.method === "bank_transfer" || (r.sourceName && (r.sourceName.includes("بنك") || r.sourceName.includes("مصرف") || r.sourceName.includes("الراجحى")))).reduce((s, e) => s + (e.amount || 0), 0);

    const kpiTotalEl = document.getElementById("kpi-rcpt-total");
    const kpiCashEl  = document.getElementById("kpi-rcpt-cash");
    const kpiBankEl  = document.getElementById("kpi-rcpt-bank");
    const kpiCountEl = document.getElementById("kpi-rcpt-count");
    const countSubEl = document.getElementById("rcpt-count");

    if (kpiTotalEl) kpiTotalEl.textContent = formatCurrency(totalAmt);
    if (kpiCashEl)  kpiCashEl.textContent  = formatCurrency(cashAmt);
    if (kpiBankEl)  kpiBankEl.textContent  = formatCurrency(bankAmt);
    if (kpiCountEl) kpiCountEl.textContent = `${receipts.length} سند`;
    if (countSubEl) countSubEl.textContent = `مستندات القبض المفلترة: ${receipts.length} سند — إجمالي المقبوضات: ${formatCurrency(totalAmt)}`;

    // Update active KPI badge styles
    const bAll  = document.getElementById("kpi-badge-all");
    const bCash = document.getElementById("kpi-badge-cash");
    const bBank = document.getElementById("kpi-badge-bank");
    if (bAll)  { bAll.style.background = methodF === "" ? "var(--brand)" : "rgba(91,127,255,0.15)"; bAll.textContent = methodF === "" ? "نشط 🎯" : "الكل 🔍"; }
    if (bCash) { bCash.style.background = methodF === "cash" ? "#059669" : "rgba(16,185,129,0.15)"; bCash.style.color = methodF === "cash" ? "#fff" : "#059669"; bCash.textContent = methodF === "cash" ? "نشط 🎯" : "تصفية 🔍"; }
    if (bBank) { bBank.style.background = methodF === "bank" ? "#1d4ed8" : "rgba(37,99,235,0.15)"; bBank.style.color = methodF === "bank" ? "#fff" : "#1d4ed8"; bBank.textContent = methodF === "bank" ? "نشط 🎯" : "تصفية 🔍"; }

    if (!receipts.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات قبض ضمن التصفية الفعالة حالياً</td></tr>`;
      return;
    }

    const typeLabels = { customer: "عميل", supplier: "مورد", revenue: "إيراد مباشر", other: "حساب عام" };
    const typeBadgeStyles = {
      customer: "background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",
      supplier: "background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",
      revenue:  "background:rgba(37,99,235,0.12);color:#2563eb;border:1px solid rgba(37,99,235,0.25);",
      other:    "background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"
    };

    tbody.innerHTML = receipts.map(e => {
      const isBank = e.method === "bank" || e.method === "transfer" || e.method === "bank_transfer" || (e.sourceName && (e.sourceName.includes("بنك") || e.sourceName.includes("مصرف") || e.sourceName.includes("الراجحى")));
      
      const rowStyle = isBank 
        ? 'background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);' 
        : 'background:rgba(16,185,129,0.02);border-bottom:1px solid var(--border-soft);';

      const methodBadge = isBank
        ? `<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${e.sourceName || "بنك"}</span>`
        : `<span class="badge" style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${e.sourceName || "صندوق"}</span>`;

      return `
        <tr style="${rowStyle}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${e.date}</td>
          <td class="mono" style="font-size:12px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:3px 10px;border-radius:6px;font-weight:900;color:var(--brand);font-family:monospace;">${e.displayCode}</span></td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${e.accountName}</strong></td>
          <td><span class="badge" style="${typeBadgeStyles[e.entityType] || typeBadgeStyles.other}font-size:11px;font-weight:700;">${typeLabels[e.entityType] || "عميل"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${e.notes || "—"}</small></td>
          <td>${methodBadge}</td>
          <td>${e.costCenterName ? `<span style="font-size:11px;background:rgba(91,127,255,0.1);padding:3px 10px;border-radius:12px;color:var(--brand);font-weight:700;">${e.costCenterName}</span>` : "—"}</td>
          <td style="text-align:left;" class="mono font-bold text-ok" style="font-size:14px;">${formatCurrency(e.amount)}</td>
          <td style="text-align:center;white-space:nowrap;">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewReceipt('${e.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick='openReceiptModal(${JSON.stringify({...e, id: e.id})})' title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleReceiptVoucher('${e.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="confirmDeleteReceiptModal('${e.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل بيانات السندات: ${err.message}</td></tr>`;
  }
}

window.loadReceipts = loadReceipts;

// ─────────────────────────────────────────────────────────────────────────────
// Cascade Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function _deleteJournalEntriesBySource(sourceId) {
  const q    = fsQuery(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "==", sourceId));
  const snap = await fsGetDocs(q);
  if (snap.empty) return;
  for (const d of snap.docs) {
    await deleteJournalEntry(d.id);
  }
}

async function _deleteCashBankTxBySource(sourceId, method) {
  const coll = method === "cash"
    ? `companies/${COMPANY_ID}/cashTransactions`
    : `companies/${COMPANY_ID}/bankTransactions`;
  const q    = fsQuery(collection(db, coll), where("sourceId", "==", sourceId));
  const snap = await fsGetDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Resolution
// ─────────────────────────────────────────────────────────────────────────────
function resolveCredit(entityType, targetId) {
  let creditAccId = null, creditAccCode = null, creditAccName = null, destinationName = null;

  if (entityType === "customer") {
    const cust = customers.find(c => c.id === targetId);
    destinationName = cust?.name || null;
    const match = allAccounts.find(a => a.sourceEntityId === targetId && a.sourceModule === "customers")
                || allAccounts.find(a => a.name && cust?.name && a.name.includes(cust.name))
                || allAccounts.find(a => a.code === "1-1-2-1-1");
    creditAccId   = match?.id || null;
    creditAccCode = match?.code || null;
    creditAccName = match?.name || "ذمم العملاء";
  } else if (entityType === "supplier") {
    const supp = suppliers.find(s => s.id === targetId);
    destinationName = supp?.name || null;
    const match = allAccounts.find(a => a.sourceEntityId === targetId && a.sourceModule === "suppliers")
                || allAccounts.find(a => a.name && supp?.name && a.name.includes(supp.name))
                || allAccounts.find(a => a.code === "2-1-1-1-1");
    creditAccId   = match?.id || null;
    creditAccCode = match?.code || null;
    creditAccName = match?.name || "ذمم الموردين";
  } else {
    const acc = allAccounts.find(a => a.id === targetId);
    creditAccId = targetId || null;
    creditAccCode = acc?.code || null;
    creditAccName = acc?.name || null;
    destinationName = acc?.name || null;
  }
  return { creditAccId, creditAccCode, creditAccName, destinationName };
}

function resolveDebit(method, sourceId) {
  let debitAccId = null, debitAccCode = null, debitAccName = null, sourceDocRef = null;

  if (method === "cash") {
    const cb = cashBoxes.find(c => c.id === sourceId);
    debitAccId = cb?.accountId || null;
    const acc = allAccounts.find(a => a.id === cb?.accountId || (cb?.accountCode && a.code === cb.accountCode) || a.id === sourceId || a.code === sourceId);
    debitAccId = debitAccId || acc?.id || null;
    debitAccCode = acc?.code || cb?.accountCode || cb?.code || null;
    debitAccName = acc?.name || cb?.name || null;
    sourceDocRef = fsDoc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
  } else {
    const ba = bankAccounts.find(b => b.id === sourceId);
    debitAccId = ba?.accountId || null;
    let acc = allAccounts.find(a => a.id === ba?.accountId || (ba?.accountCode && a.code === ba.accountCode) || a.id === sourceId || a.code === sourceId);
    if (!acc && ba?.name) {
      const baClean = ba.name.replace(/[\s\-_]/g, '').toLowerCase();
      acc = allAccounts.find(a => a.parentCode === "1-1-1-3" && (
        a.name?.replace(/[\s\-_]/g, '').toLowerCase().includes(baClean) ||
        baClean.includes((a.name || '').replace(/[\s\-_]/g, '').toLowerCase())
      ));
    }
    debitAccId = debitAccId || acc?.id || null;
    debitAccCode = acc?.code || ba?.accountCode || ba?.code || null;
    debitAccName = acc?.name || ba?.name || null;
    sourceDocRef = fsDoc(db, `companies/${COMPANY_ID}/bankAccounts`, sourceId);
  }

  if (!debitAccId) {
    const fallback = allAccounts.find(a => a.code === (method === "cash" ? "1-1-1-1-3" : "1-1-1-3-02"))
                  || (method !== "cash" && allAccounts.find(a => a.code?.startsWith("1-1-1-3")))
                  || allAccounts.find(a => a.code === "1-1-1-1-3");
    debitAccId = fallback?.id || null;
    debitAccCode = fallback?.code || null;
    debitAccName = fallback?.name || null;
  }
  return { debitAccId, debitAccCode, debitAccName, sourceDocRef };
}

// ─────────────────────────────────────────────────────────────────────────────
// Number to Arabic Words (simple)
// ─────────────────────────────────────────────────────────────────────────────
function _numberToArabicWords(num) {
  if (!num || isNaN(num)) return "صفر ريال سعودي";
  const n = Math.floor(num);
  const decimals = Math.round((num - n) * 100);
  const ones = ["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"];
  const tens = ["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
  const hundreds = ["","مائة","مئتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانمائة","تسعمائة"];
  function group(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " و" + ones[n%10] : "");
    return hundreds[Math.floor(n/100)] + (n%100 ? " و" + group(n%100) : "");
  }
  let result = "";
  if (n >= 1000000) result += group(Math.floor(n/1000000)) + " مليون ";
  if (n >= 1000)    result += group(Math.floor((n%1000000)/1000)) + " ألف ";
  result += group(n % 1000);
  result = result.trim() + " ريال سعودي";
  if (decimals > 0) result += ` و${group(decimals)} هللة`;
  return result;
}
