// ============================================================
// IDHAM ERP — Developed Payment Vouchers Module (سندات الصرف المطورة)
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, createJournalEntry, isPeriodClosed } from "../utils/db.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";

let _costCenters = [];
let allAccounts = [];
let cashBoxes = [];
let bankAccounts = [];
let suppliers = [];
let customers = [];
let _loadedExpenses = [];
let _editingExpenseId = null;

async function loadCostCenters() {
  const ccList = await getAll(COLS.costCenters()).catch(() => []);
  _costCenters = ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  const sel = document.getElementById("exp-cc-sel");
  if (sel) sel.innerHTML = '<option value="">بدون مركز تكلفة</option>' +
    _costCenters.map(cc => `<option value="${cc.id}">${cc.code} — ${cc.name}</option>`).join("");
  const filterSel = document.getElementById("exp-cc-filter");
  if (filterSel) filterSel.innerHTML = '<option value="">كل المراكز</option>' +
    _costCenters.map(cc => `<option value="${cc.id}">${cc.name}</option>`).join("");
}

window.filterExpensesByCard = (method) => {
  const sel = document.getElementById("exp-method-filter");
  if (sel) {
    sel.value = method === "all" ? "" : method;
    loadExpenses();
  }
};

export async function render(container, user) {
  container.innerHTML = `
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="exp-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="exp-from" class="input" value="${startOfMonth()}" onchange="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">إلى تاريخ</label>
        <input type="date" id="exp-to" class="input" value="${todayString()}" onchange="loadExpenses()" />
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">نوع الجهة</label>
        <select id="exp-entity-type-filter" class="input" onchange="loadExpenses()">
          <option value="">كل الجهات</option>
          <option value="expense">مصروف</option>
          <option value="supplier">مورد</option>
          <option value="customer">عميل</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">طريقة الدفع</label>
        <select id="exp-method-filter" class="input" onchange="loadExpenses()">
          <option value="">كل الطرق</option>
          <option value="cash">💵 نقدي</option>
          <option value="bank">🏦 تحويل بنكي</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">مركز التكلفة</label>
        <select id="exp-cc-filter" class="input" onchange="loadExpenses()">
          <option value="">كل المراكز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_الصرف')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_الصرف')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-primary" onclick="openExpenseModal()">+ سند صرف جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💸 سجل سندات الصرف (Payment Vouchers)</h1>
        <p class="page-subtitle" id="exp-count" style="color:var(--text-3);font-size:13px;">سجل سندات الصرف النقدية والبنكية للمصروفات والموردين</p>
      </div>

      <!-- ═══ RICH INTERACTIVE KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" id="exp-kpi-grid">
        <div class="stats-card kpi-interactive" id="kpi-exp-card-all" onclick="filterExpensesByCard('all')" style="cursor:pointer;background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02));border:1.5px solid rgba(239,68,68,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية كافة سندات الصرف">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#ef4444;">📤 إجمالي المدفوعات المعروضة</span>
            <span class="badge sm" id="kpi-exp-badge-all" style="font-size:10px;background:#ef4444;color:#fff;">الكل 🎯</span>
          </div>
          <span class="stats-val text-bad" id="kpi-exp-total" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-exp-card-cash" onclick="filterExpensesByCard('cash')" style="cursor:pointer;background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02));border:1.5px solid rgba(245,158,11,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المدفوعات النقدية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#d97706;">💵 المدفوعات النقدية (صناديق)</span>
            <span class="badge sm" id="kpi-exp-badge-cash" style="font-size:10px;background:rgba(245,158,11,0.15);color:#d97706;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-warning" id="kpi-exp-cash" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-exp-card-bank" onclick="filterExpensesByCard('bank')" style="cursor:pointer;background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02));border:1.5px solid rgba(37,99,235,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المدفوعات البنكية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#1d4ed8;">🏦 المدفوعات البنكية والتحويلات</span>
            <span class="badge sm" id="kpi-exp-badge-bank" style="font-size:10px;background:rgba(37,99,235,0.15);color:#1d4ed8;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-brand" id="kpi-exp-bank" style="font-size:22px;font-weight:900;color:#1d4ed8;">0.00 ر.س</span>
        </div>

        <div class="stats-card" style="background:linear-gradient(135deg, rgba(107,114,128,0.08), rgba(107,114,128,0.02));border:1.5px solid rgba(107,114,128,0.3);border-radius:16px;padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#4b5563;">🔢 عدد سندات الصرف</span>
            <span class="badge sm" style="font-size:10px;background:rgba(107,114,128,0.15);color:#4b5563;">عدد 📋</span>
          </div>
          <span class="stats-val text-bad" id="kpi-exp-count" style="font-size:22px;font-weight:900;">0 سند</span>
        </div>
      </div>

      <div class="card" style="border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:100px;">التاريخ</th>
                <th style="width:110px;">رقم السند</th>
                <th>جهة الصرف</th>
                <th style="width:100px;">نوع الجهة</th>
                <th>البيان والملاحظات</th>
                <th>طريقة الدفع والصندوق</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;width:120px;">المبلغ</th>
                <th style="text-align:center;width:150px;" class="no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="exp-tbody">
              ${Array(6).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
                  <td class="no-print"></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <div class="modal-overlay" id="expense-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="expense-modal-title">سند صرف جديد (Payment Voucher)</h3>
          <button class="modal-close" onclick="closeModal('expense-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="exp-date" class="input" value="${todayString()}" />
            </div>
            <div class="form-group">
              <label>المبلغ *</label>
              <input type="number" id="exp-amount" class="input mono" min="0" step="0.01" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>جهة الصرف (النوع) *</label>
              <select id="exp-entity-type" class="input" onchange="onEntityTypeChange()">
                <option value="expense">بند مصروف</option>
                <option value="supplier">مورد (سداد ذمة دائنة)</option>
                <option value="customer">عميل (رد نقدية)</option>
                <option value="other">حساب عام</option>
              </select>
            </div>
            <div class="form-group">
              <label id="exp-entity-label">الحساب / الحساب المستهدف *</label>
              <div style="display:flex;gap:6px;flex-direction:column;">
                <input type="text" id="exp-target-search" class="input" placeholder="🔍 ابحث بجزء من اسم الحساب أو الكود..." oninput="filterExpenseTargetEntity()" style="font-size:12.5px;padding:6px 12px;background:var(--bg-2);border-radius:8px;" />
                <select id="exp-target-entity" class="input">
                  <option value="">اختر...</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة الصرف *</label>
              <select id="exp-pay-method" class="input" onchange="togglePaySource()">
                <option value="cash">نقدي (سند صرف صندوق)</option>
                <option value="bank">تحويل بنكي (سند صرف بنك)</option>
              </select>
            </div>
            <div class="form-group">
              <label id="exp-source-label">صندوق الصرف *</label>
              <select id="exp-source" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>البيان / ملاحظات *</label>
            <textarea id="exp-notes" class="input" rows="2" placeholder="اكتب بياناً تفصيلياً لعملية الصرف..."></textarea>
          </div>
          
          <div class="form-group mb-16">
            <label>🏷️ مركز التكلفة (اختياري)</label>
            <select id="exp-cc-sel" class="input">
              <option value="">بدون مركز تكلفة</option>
            </select>
          </div>
          
          <div class="form-group mb-16">
            <label>📁 إرفاق صورة السند / الفاتورة (أتمتة الأرشيف)</label>
            <input type="file" id="exp-file-upload" class="input" accept="image/*,application/pdf" />
          </div>
          
          <div id="exp-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('expense-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveExpense()" id="save-exp-btn">حفظ واعتماد</button>
        </div>
      </div>
    </div>

    <!-- Expense Preview Modal -->
    <div class="modal-overlay" id="expense-preview-modal">
      <div class="modal modal-lg">
        <div class="modal-header no-print">
          <h3 class="modal-title">معاينة سند الصرف</h3>
          <button class="modal-close" onclick="closeModal('expense-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="expense-preview-body" style="padding: 0; background: white;">
          <!-- Content built by js -->
        </div>
        <div class="modal-footer no-print">
          <button class="btn btn-secondary" onclick="closeModal('expense-preview-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="window.printExpenseVoucher()"><i class="fas fa-print"></i> طباعة السند</button>
        </div>
      </div>
    </div>
  `;

  const fromEl = container.querySelector("#exp-from");
  const toEl = container.querySelector("#exp-to");
  if (fromEl) fromEl.addEventListener("change", loadExpenses);
  if (toEl) toEl.addEventListener("change", loadExpenses);

  await Promise.all([
    loadReferenceData(),
    loadCostCenters(),
    loadExpenses()
  ]);
}

async function loadReferenceData() {
  allAccounts = await getAll(COLS.chartOfAccounts());
  cashBoxes = await getAll(COLS.cashBoxes());
  bankAccounts = await getAll(COLS.bankAccounts());
  suppliers = await getAll(COLS.suppliers());
  customers = await getAll(COLS.customers());
  
  onEntityTypeChange();
  togglePaySource();
}

let _expTargetOptions = [];

function _renderExpTargetSelectOptions(sel, list, query = "") {
  if (!sel) return;
  let html = '<option value="">اختر...</option>';
  if (list && list.length) {
    html += list.map(item => `<option value="${item.id}">${item.text}</option>`).join("");
  } else {
    html = `<option value="">🔍 لا يوجد حساب يطابق "${query}"</option>`;
  }
  sel.innerHTML = html;
}

window.onEntityTypeChange = () => {
  const type = document.getElementById("exp-entity-type").value;
  const label = document.getElementById("exp-entity-label");
  const sel = document.getElementById("exp-target-entity");
  const searchInput = document.getElementById("exp-target-search");
  if (searchInput) searchInput.value = "";

  let list = [];
  if (type === "expense") {
    label.textContent = "بند المصروف (الحساب) *";
    list = allAccounts.filter(a => a.type === 'expense')
      .map(a => ({ id: a.id, text: `${a.code} - ${a.name}` }));
  } else if (type === "supplier") {
    label.textContent = "المورد المستهدف *";
    list = suppliers.map(s => ({ id: s.id, text: s.name }));
  } else if (type === "customer") {
    label.textContent = "العميل المستهدف *";
    list = customers.map(c => ({ id: c.id, text: c.name }));
  } else {
    label.textContent = "الحساب المستهدف (دليل الحسابات) *";
    list = allAccounts.map(a => ({ id: a.id, text: `${a.code} - ${a.name}` }));
  }

  _expTargetOptions = list;
  _renderExpTargetSelectOptions(sel, list);
};

window.filterExpenseTargetEntity = () => {
  const query = (document.getElementById("exp-target-search")?.value || "").trim().toLowerCase();
  const sel   = document.getElementById("exp-target-entity");
  if (!query) {
    _renderExpTargetSelectOptions(sel, _expTargetOptions);
    return;
  }
  const filtered = _expTargetOptions.filter(item => item.text.toLowerCase().includes(query));
  _renderExpTargetSelectOptions(sel, filtered, query);
  if (filtered.length === 1 && sel) {
    sel.value = filtered[0].id;
  }
};

window.togglePaySource = () => {
  const method = document.getElementById("exp-pay-method").value;
  const label = document.getElementById("exp-source-label");
  const sel = document.getElementById("exp-source");
  sel.innerHTML = '<option value="">اختر...</option>';

  if (method === 'cash') {
    label.textContent = "صندوق الصرف *";
    sel.innerHTML += cashBoxes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } else {
    label.textContent = "الحساب البنكي المخصوم منه *";
    sel.innerHTML += bankAccounts.map(b => `<option value="${b.id}">${b.name || "بنك"} - ${b.accountNumber || ""}</option>`).join("");
  }
};

window.openExpenseModal = () => {
  _editingExpenseId = null;
  const titleEl = document.getElementById("expense-modal-title");
  if (titleEl) titleEl.textContent = "سند صرف جديد (Payment Voucher)";
  document.getElementById("exp-date").value = todayString();
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-entity-type").value = "expense";
  onEntityTypeChange();
  document.getElementById("exp-notes").value = "";
  const ccSel = document.getElementById("exp-cc-sel");
  if (ccSel) ccSel.value = "";
  document.getElementById("exp-error").classList.add("hidden");
  openModal("expense-modal");
};

window.saveExpense = async () => {
  const errEl = document.getElementById("exp-error");
  errEl.classList.add("hidden");

  const date = document.getElementById("exp-date").value;
  const amount = parseFloat(document.getElementById("exp-amount").value);
  const entityType = document.getElementById("exp-entity-type").value;
  const targetId = document.getElementById("exp-target-entity").value;
  const method = document.getElementById("exp-pay-method").value;
  const sourceId = document.getElementById("exp-source").value;
  const notes = document.getElementById("exp-notes").value.trim();

  if (!date || !amount || amount <= 0 || !targetId || !sourceId || !notes) {
    errEl.textContent = "الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-exp-btn");
  btn.disabled = true;

  try {
    if (await isPeriodClosed(date)) {
      errEl.textContent = `⚠️ لا يمكن حفظ سند الصرف لأن تاريخه (${date}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`;
      errEl.classList.remove("hidden");
      btn.disabled = false;
      return;
    }

    const { doc: fsDoc, runTransaction, serverTimestamp, collection, getDoc, getDocs, query, where, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");

    // Reversal of old values if editing
    if (_editingExpenseId) {
      const oldExpRef = fsDoc(db, `companies/${COMPANY_ID}/expenses`, _editingExpenseId);
      const oldExpSnap = await getDoc(oldExpRef);
      if (oldExpSnap.exists()) {
        const oldExp = oldExpSnap.data();

        // 1. Revert cash/bank balance
        const oldSourceRef = fsDoc(db, `companies/${COMPANY_ID}/${oldExp.method === 'cash' ? 'cashBoxes' : 'bankAccounts'}`, oldExp.sourceId);
        const oldSourceSnap = await getDoc(oldSourceRef);
        if (oldSourceSnap.exists()) {
          const oldSourceBal = parseFloat(oldSourceSnap.data().balance || 0);
          await updateDoc(oldSourceRef, {
            balance: oldSourceBal + oldExp.amount,
            updatedAt: serverTimestamp()
          });
        }

        // 2. Find old J.E. and call deleteJournalEntry (which reverses COA balances and deletes the J.E. document)
        const { deleteJournalEntry } = await import("../utils/db.js");
        const jeQuery = query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "==", _editingExpenseId), where("sourceType", "==", "expense"));
        const jeSnap = await getDocs(jeQuery);
        if (!jeSnap.empty) {
          await deleteJournalEntry(jeSnap.docs[0].id);
        }
      }
    }

    let debitAccId = "";
    let debitAccCode = "";
    let debitAccName = "";
    let destinationName = "";

    // 1. Resolve Debit Account depending on entityType
    if (entityType === "expense") {
      const acc = allAccounts.find(a => a.id === targetId);
      debitAccId = targetId;
      debitAccCode = acc?.code;
      debitAccName = acc?.name;
      destinationName = acc?.name;
    } else if (entityType === "supplier") {
      const supp = suppliers.find(s => s.id === targetId);
      destinationName = supp?.name;
      
      const parentSuppCode = "2-1-1-1-1"; 
      for (const code in allAccounts) {
        const acc = allAccounts[code];
        if (acc.sourceEntityId === targetId && acc.sourceModule === "suppliers") {
          debitAccId = acc.id;
          debitAccCode = acc.code;
          debitAccName = acc.name;
          break;
        }
      }
      if (!debitAccId) {
        const match = allAccounts.find(a => a.name.includes(supp?.name));
        debitAccId = match?.id || allAccounts.find(a => a.code === parentSuppCode)?.id;
        debitAccCode = match?.code || parentSuppCode;
        debitAccName = match?.name || "ذمم الموردين";
      }
    } else if (entityType === "customer") {
      const cust = customers.find(c => c.id === targetId);
      destinationName = cust?.name;
      const parentCustCode = "1-1-2-1-1";
      for (const code in allAccounts) {
        const acc = allAccounts[code];
        if (acc.sourceEntityId === targetId && acc.sourceModule === "customers") {
          debitAccId = acc.id;
          debitAccCode = acc.code;
          debitAccName = acc.name;
          break;
        }
      }
      if (!debitAccId) {
        const match = allAccounts.find(a => a.name.includes(cust?.name));
        debitAccId = match?.id || allAccounts.find(a => a.code === parentCustCode)?.id;
        debitAccCode = match?.code || parentCustCode;
        debitAccName = match?.name || "ذمم العملاء";
      }
    } else {
      const acc = allAccounts.find(a => a.id === targetId);
      debitAccId = targetId;
      debitAccCode = acc?.code;
      debitAccName = acc?.name;
      destinationName = acc?.name;
    }

    // 2. Resolve Credit Account (Cash or Bank)
    let creditAccId = "";
    let creditAccCode = "";
    let creditAccName = "";
    let sourceDocRef = null;

    if (method === 'cash') {
      const cb = cashBoxes.find(c => c.id === sourceId);
      creditAccId = cb?.accountId;
      creditAccCode = cb?.code;
      creditAccName = cb?.name;
      sourceDocRef = fsDoc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
    } else {
      const ba = bankAccounts.find(b => b.id === sourceId);
      creditAccId = ba?.accountId;
      creditAccCode = ba?.code;
      creditAccName = ba?.name;
      sourceDocRef = fsDoc(db, `companies/${COMPANY_ID}/bankAccounts`, sourceId);
    }

    if (!creditAccId) {
      const parentCashCode = "1-1-1-1-3";
      const parentBankCode = "1-1-1-3-2";   // ✅ كود صحيح (مصرف الراجحي أو أي بنك)
      const fallbackCode = method === 'cash' ? parentCashCode : parentBankCode;
      const match = allAccounts.find(a => a.code === fallbackCode)
                 || allAccounts.find(a => a.parentCode === "1-1-1-3");  // أي حساب بنكي
      creditAccId = match?.id;
      creditAccCode = match?.code;
      creditAccName = match?.name;
    }

    // 3. Check if target is a CashBox (e.g. Owner's Current or another Cashbox)
    const targetCb = cashBoxes.find(c => c.accountId === debitAccId || c.id === targetId || c.accountCode === debitAccCode);
    let targetCbRef = null;
    if (targetCb) {
      targetCbRef = fsDoc(db, `companies/${COMPANY_ID}/cashBoxes`, targetCb.id);
    }

    // 4. Atomically perform transaction to update cash/bank balance and write records
    let expId = "";
    await runTransaction(db, async (transaction) => {
      // --- 1. ALL READS FIRST ---
      let currentBal = 0;
      let sourceSnap = null;
      if (sourceDocRef) {
        sourceSnap = await transaction.get(sourceDocRef);
        if (sourceSnap.exists()) {
          currentBal = parseFloat(sourceSnap.data().balance || 0);
        }
      }

      let targetCbSnap = null;
      let targetCbBal = 0;
      if (targetCbRef) {
        targetCbSnap = await transaction.get(targetCbRef);
        if (targetCbSnap.exists()) {
          targetCbBal = parseFloat(targetCbSnap.data().balance || 0);
        }
      }

      let coaCreditSnap = null;
      let coaCreditBal = 0;
      let coaCreditDocRef = null;
      if (creditAccId) {
        coaCreditDocRef = fsDoc(db, `companies/${COMPANY_ID}/chartOfAccounts`, creditAccId);
        coaCreditSnap = await transaction.get(coaCreditDocRef);
        if (coaCreditSnap.exists()) {
          coaCreditBal = parseFloat(coaCreditSnap.data().balance || 0);
        }
      }

      let coaDebitSnap = null;
      let coaDebitBal = 0;
      let coaDebitDocRef = null;
      if (debitAccId) {
        coaDebitDocRef = fsDoc(db, `companies/${COMPANY_ID}/chartOfAccounts`, debitAccId);
        coaDebitSnap = await transaction.get(coaDebitDocRef);
        if (coaDebitSnap.exists()) {
          coaDebitBal = parseFloat(coaDebitSnap.data().balance || 0);
        }
      }

      // --- 2. CALCULATIONS ---
      const balanceAfter = currentBal - amount;
      const targetBalAfter = targetCbBal + amount;

      // --- 3. ALL WRITES AFTERWARDS ---
      if (sourceDocRef) {
        transaction.update(sourceDocRef, {
          balance: balanceAfter,
          updatedAt: serverTimestamp()
        });
      }

      if (targetCbRef && targetCbSnap && targetCbSnap.exists()) {
        transaction.update(targetCbRef, {
          balance: targetBalAfter,
          updatedAt: serverTimestamp()
        });
      }

      const voucherRef = _editingExpenseId 
        ? fsDoc(db, `companies/${COMPANY_ID}/expenses`, _editingExpenseId)
        : fsDoc(collection(db, `companies/${COMPANY_ID}/expenses`));
      expId = voucherRef.id;
      
      transaction.set(voucherRef, {
        date,
        amount,
        entityType,
        targetId,
        accountName: destinationName || "مصروف",
        method,
        sourceId,
        sourceName: method === 'cash' ? cashBoxes.find(c => c.id === sourceId)?.name : bankAccounts.find(b => b.id === sourceId)?.name,
        notes,
        costCenterId: document.getElementById("exp-cc-sel")?.value || null,
        costCenterName: _costCenters.find(cc => cc.id === document.getElementById("exp-cc-sel")?.value)?.name || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (method === 'cash') {
        const txRef = fsDoc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
        transaction.set(txRef, {
          cashBoxId: sourceId,
          type: "out",
          amount,
          balanceAfter,
          notes: `سند صرف رقم ${expId.substring(0,6).toUpperCase()} — ${notes}`,
          userName: "المستخدم",
          createdAt: serverTimestamp()
        });
      } else {
        const txRef = fsDoc(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
        transaction.set(txRef, {
          bankAccountId: sourceId,
          type: "out",
          amount,
          balanceAfter,
          notes: `سند صرف رقم ${expId.substring(0,6).toUpperCase()} — ${notes}`,
          refNumber: `PV-${expId.substring(0,6).toUpperCase()}`,
          createdAt: serverTimestamp()
        });
      }

      if (targetCb && targetCbSnap && targetCbSnap.exists()) {
        const txTargetRef = fsDoc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
        transaction.set(txTargetRef, {
          cashBoxId: targetCb.id,
          type: "in",
          amount,
          balanceAfter: targetBalAfter,
          notes: `توريد واستلام من سند صرف رقم ${expId.substring(0,6).toUpperCase()} — ${notes}`,
          userName: "المستخدم",
          createdAt: serverTimestamp()
        });
      }
    });

    // 4. Generate Journal Entry
    const decAccDetail = allAccounts.find(a => a.id === debitAccId);
    const crAccDetail = allAccounts.find(a => a.id === creditAccId);

    await createJournalEntry({
      date: date,
      description: `سند صرف رقم #${expId.substring(0,6).toUpperCase()} - ${notes}`,
      sourceType: "expense",
      sourceId: expId,
      lines: [
        { 
          accountId: debitAccId, 
          accountCode: debitAccCode || decAccDetail?.code || "", 
          accountName: debitAccName || decAccDetail?.name || "", 
          debit: amount, 
          credit: 0, 
          note: notes,
          costCenterId: document.getElementById("exp-cc-sel")?.value || null
        },
        { 
          accountId: creditAccId, 
          accountCode: creditAccCode || crAccDetail?.code || "", 
          accountName: creditAccName || crAccDetail?.name || "", 
          debit: 0, 
          credit: amount, 
          note: `سداد سند صرف`,
          costCenterId: document.getElementById("exp-cc-sel")?.value || null
        }
      ]
    });

    const { clearERPCache: clear } = await import("../utils/db.js");
    clear(`companies/${COMPANY_ID}/expenses`);
    clear(`companies/${COMPANY_ID}/chartOfAccounts`);
    clear(`companies/${COMPANY_ID}/journalEntries`);

    showToast("تم حفظ سند الصرف واعتماده", "success");
    
    const fileInput = document.getElementById("exp-file-upload");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      window.uploadFileToArchive(file, "expenses", expId, `مرفق سند صرف رقم PV-${expId.substring(0,6).toUpperCase()}: ${notes}`).catch(e => console.warn(e));
    }
    
    closeModal("expense-modal");
    await loadExpenses();

    if (entityType === "customer") {
      import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(targetId)).catch(e => console.warn(e));
    } else if (entityType === "supplier") {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(targetId)).catch(e => console.warn(e));
    }

  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.printSingleExpenseVoucher = async (id) => {
  let exp = _loadedExpenses.find(e => e.id === id);
  if (!exp) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const { db, COMPANY_ID } = await import("../firebase-config.js");
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/expenses`, id));
      if (snap.exists()) exp = { id: snap.id, ...snap.data() };
    } catch (_) {}
  }
  if (!exp) { showToast("سند الصرف غير موجود", "error"); return; }

  let company = {};
  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/company`)),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/logo`))
    ]);
    if (coSnap.exists()) company = coSnap.data();
    if (logoSnap.exists()) company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
  } catch (_) {}

  const html = _buildExpenseHTML(exp, id, company);
  const win = window.open("", "_blank", "width=850,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف — #${id.substring(0,6).toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; padding:20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; padding:0; }
      .header-container { background:linear-gradient(135deg,#7c2d12 0%,#c2410c 60%,#ea580c 100%) !important; }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

async function loadExpenses() {
  const fromEl = document.getElementById("exp-from");
  const toEl   = document.getElementById("exp-to");
  const searchEl = document.getElementById("exp-search");
  const typeFEl = document.getElementById("exp-entity-type-filter");
  const methodFEl = document.getElementById("exp-method-filter");
  const ccFEl  = document.getElementById("exp-cc-filter");
  const tbody  = document.getElementById("exp-tbody");
  if (!tbody) return;

  const from = fromEl ? fromEl.value : "";
  const to   = toEl ? toEl.value : "";
  const queryText = (searchEl?.value || "").trim().toLowerCase();
  const typeF   = typeFEl?.value || "";
  const methodF = methodFEl?.value || "";
  const ccF     = ccFEl?.value || "";

  try {
    let expenses = await getAll(COLS.expenses()).catch(() => []);

    // Assign sequential display numbers (PV-00101, PV-00102, etc.) based on oldest-to-newest order
    expenses.sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      const tA = a.createdAt?.seconds || a.createdAt || 0;
      const tB = b.createdAt?.seconds || b.createdAt || 0;
      return tA - tB;
    });

    expenses.forEach((e, idx) => {
      if (!e.number && !e.seqNo) {
        e.displayCode = `PV-${String(idx + 101).padStart(5, '0')}`;
      } else {
        e.displayCode = `PV-${String(e.number || e.seqNo).padStart(5, '0')}`;
      }
    });

    // Sort client-side by Date desc & CreatedAt desc (Newest entered first)
    expenses.sort((a, b) => {
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      const tA = a.createdAt?.seconds || a.createdAt || 0;
      const tB = b.createdAt?.seconds || b.createdAt || 0;
      return tB - tA;
    });

    _loadedExpenses = expenses;

    // 1. Filter Date Range
    if (from) expenses = expenses.filter(e => e.date && e.date >= from);
    if (to)   expenses = expenses.filter(e => e.date && e.date <= to);

    // 2. Filter Payment Method (handle cash vs bank variations)
    if (methodF === "cash") {
      expenses = expenses.filter(e => e.method === "cash" || (e.sourceName && e.sourceName.includes("صندوق")));
    } else if (methodF === "bank") {
      expenses = expenses.filter(e => e.method === "bank" || e.method === "transfer" || e.method === "bank_transfer" || e.method === "network" || e.method === "cheque" || (e.sourceName && (e.sourceName.includes("بنك") || e.sourceName.includes("مصرف") || e.sourceName.includes("الراجحى") || e.sourceName.includes("الاهلي"))));
    }

    // 3. Filter Entity Type
    if (typeF) expenses = expenses.filter(e => e.entityType === typeF);

    // 4. Filter Cost Center
    if (ccF) expenses = expenses.filter(e => e.costCenterId === ccF);

    // 5. Search Text Query Filter
    if (queryText) {
      expenses = expenses.filter(e => {
        const idStr = (e.id || "").toLowerCase();
        const numStr = (e.number || "").toLowerCase();
        const dispStr = (e.displayCode || "").toLowerCase();
        const codeStr = idStr.substring(0, 6);
        const name = (e.accountName || e.targetName || e.supplierName || e.category || "").toLowerCase();
        const notes = (e.notes || e.description || "").toLowerCase();
        const srcName = (e.sourceName || "").toLowerCase();
        const ccName = (e.costCenterName || "").toLowerCase();
        return idStr.includes(queryText) || numStr.includes(queryText) || dispStr.includes(queryText) || codeStr.includes(queryText) ||
               name.includes(queryText) || notes.includes(queryText) ||
               srcName.includes(queryText) || ccName.includes(queryText);
      });
    }

    // Calculate KPI Cards Totals
    const totalAmt = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const cashAmt  = expenses.filter(r => r.method === "cash" || (r.sourceName && r.sourceName.includes("صندوق"))).reduce((s, e) => s + (e.amount || 0), 0);
    const bankAmt  = expenses.filter(r => r.method === "bank" || r.method === "transfer" || r.method === "bank_transfer" || (r.sourceName && (r.sourceName.includes("بنك") || r.sourceName.includes("مصرف") || r.sourceName.includes("الراجحى")))).reduce((s, e) => s + (e.amount || 0), 0);

    const kpiTotalEl = document.getElementById("kpi-exp-total");
    const kpiCashEl  = document.getElementById("kpi-exp-cash");
    const kpiBankEl  = document.getElementById("kpi-exp-bank");
    const kpiCountEl = document.getElementById("kpi-exp-count");
    const countSubEl = document.getElementById("exp-count");

    if (kpiTotalEl) kpiTotalEl.textContent = formatCurrency(totalAmt);
    if (kpiCashEl)  kpiCashEl.textContent  = formatCurrency(cashAmt);
    if (kpiBankEl)  kpiBankEl.textContent  = formatCurrency(bankAmt);
    if (kpiCountEl) kpiCountEl.textContent = `${expenses.length} سند`;
    if (countSubEl) countSubEl.textContent = `مستندات الصرف المفلترة: ${expenses.length} سند — إجمالي المدفوعات: ${formatCurrency(totalAmt)}`;

    // Update active KPI badge styles
    const bAll  = document.getElementById("kpi-exp-badge-all");
    const bCash = document.getElementById("kpi-exp-badge-cash");
    const bBank = document.getElementById("kpi-exp-badge-bank");
    if (bAll)  { bAll.style.background = methodF === "" ? "#ef4444" : "rgba(239,68,68,0.15)"; bAll.textContent = methodF === "" ? "نشط 🎯" : "الكل 🔍"; }
    if (bCash) { bCash.style.background = methodF === "cash" ? "#d97706" : "rgba(245,158,11,0.15)"; bCash.style.color = methodF === "cash" ? "#fff" : "#d97706"; bCash.textContent = methodF === "cash" ? "نشط 🎯" : "تصفية 🔍"; }
    if (bBank) { bBank.style.background = methodF === "bank" ? "#1d4ed8" : "rgba(37,99,235,0.15)"; bBank.style.color = methodF === "bank" ? "#fff" : "#1d4ed8"; bBank.textContent = methodF === "bank" ? "نشط 🎯" : "تصفية 🔍"; }

    if (!expenses.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات صرف ضمن التصفية الفعالة حالياً</td></tr>`;
      return;
    }

    const typeLabels = { expense: "مصروف", supplier: "مورد", customer: "عميل", other: "حساب عام" };
    const typeBadgeStyles = {
      expense:  "background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);",
      supplier: "background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",
      customer: "background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",
      other:    "background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"
    };

    tbody.innerHTML = expenses.map(e => {
      const isBank = e.method === "bank" || e.method === "transfer" || e.method === "bank_transfer" || (e.sourceName && (e.sourceName.includes("بنك") || e.sourceName.includes("مصرف") || e.sourceName.includes("الراجحى")));
      
      const rowStyle = isBank 
        ? 'background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);' 
        : 'background:rgba(239,68,68,0.02);border-bottom:1px solid var(--border-soft);';

      const methodBadge = isBank
        ? `<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${e.sourceName || "بنك"}</span>`
        : `<span class="badge" style="background:#fff7ed;color:#c2410c;border:1px solid #ffedd5;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${e.sourceName || "صندوق"}</span>`;

      return `
        <tr style="${rowStyle}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${e.date || "—"}</td>
          <td class="mono" style="font-size:12px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:3px 10px;border-radius:6px;font-weight:900;color:#c2410c;font-family:monospace;">${e.displayCode}</span></td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${e.accountName || e.targetName || e.supplierName || e.category || e.description || "—"}</strong></td>
          <td><span class="badge" style="${typeBadgeStyles[e.entityType] || typeBadgeStyles.expense}font-size:11px;font-weight:700;">${typeLabels[e.entityType] || "مصروف"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${e.notes || e.description || "—"}</small></td>
          <td>${methodBadge}</td>
          <td>${e.costCenterName ? `<span style="font-size:11px;background:rgba(249,115,22,0.1);padding:3px 10px;border-radius:12px;color:#c2410c;font-weight:700;">${e.costCenterName}</span>` : "—"}</td>
          <td style="text-align:left;" class="mono font-bold text-bad" style="font-size:14px;">${formatCurrency(e.amount || 0)}</td>
          <td style="text-align:center;" class="no-print">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewExpense('${e.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick="editExpense('${e.id}')" title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleExpenseVoucher('${e.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteExpense('${e.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل المصروفات: ${err.message}</td></tr>`;
  }
}

window.loadExpenses = loadExpenses;

// ============================================================
// Actions, Preview, Edit, Delete for Expense Vouchers
// ============================================================

// Helper for Clean Sequential Voucher Code
function _getCleanVoucherCode(docObj, fallbackId, typePrefix) {
  if (docObj && docObj.displayCode) return docObj.displayCode;
  if (docObj && (docObj.number || docObj.seqNo)) {
    const num = docObj.number || docObj.seqNo;
    return `${typePrefix}-${String(num).padStart(5, '0')}`;
  }
  // If loadedExpenses is present, find index
  if (typeof _loadedExpenses !== "undefined" && _loadedExpenses.length) {
    const idx = _loadedExpenses.findIndex(x => x.id === fallbackId);
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

window.previewExpense = async (id) => {
  let exp = (typeof _loadedExpenses !== "undefined" ? _loadedExpenses : []).find(e => e.id === id);
  
  const body = document.getElementById("expense-preview-body");
  if (!body) return;

  body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-3);"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>جارٍ تحميل بيانات الشركة والشعار...</div>`;
  openModal("expense-preview-modal");

  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");

    if (!exp) {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/expenses`, id));
      if (snap.exists()) exp = { id: snap.id, ...snap.data() };
    }
    if (!exp) { body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--bad);">سند الصرف غير موجود</div>`; return; }

    exp.displayCode = _getCleanVoucherCode(exp, id, "PV");

    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/company`)),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/logo`))
    ]);

    const company = coSnap.exists() ? coSnap.data() : {};
    if (logoSnap.exists()) {
      company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
    }

    body.innerHTML = _buildExpenseHTML(exp, id, company);
  } catch (err) {
    console.error(err);
    body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--bad);">خطأ في تحميل بيانات المعاينة: ${err.message}</div>`;
  }
};

window.printExpenseVoucher = () => {
  const body = document.getElementById("expense-preview-body");
  if (!body) return;
  const html = body.innerHTML;
  const win  = window.open("", "_blank", "width=850,height=700");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; padding:20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; padding:0; }
      .header-container { background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important; }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

window.editExpense = (id) => {
  const exp = _loadedExpenses.find(e => e.id === id);
  if (!exp) return;

  _editingExpenseId = id;
  
  // Set modal title
  const titleEl = document.getElementById("expense-modal-title");
  if (titleEl) titleEl.textContent = `تعديل سند الصرف (#${id.substring(0,6).toUpperCase()})`;

  document.getElementById("exp-date").value = exp.date;
  document.getElementById("exp-amount").value = exp.amount;
  document.getElementById("exp-entity-type").value = exp.entityType;
  
  // Trigger onEntityTypeChange to populate target list
  window.onEntityTypeChange();
  document.getElementById("exp-target-entity").value = exp.targetId;

  document.getElementById("exp-pay-method").value = exp.method;
  
  // Trigger togglePaySource to populate source list
  window.togglePaySource();
  document.getElementById("exp-source").value = exp.sourceId;

  document.getElementById("exp-notes").value = exp.notes || "";
  
  const ccSel = document.getElementById("exp-cc-sel");
  if (ccSel) ccSel.value = exp.costCenterId || "";

  document.getElementById("exp-error").classList.add("hidden");
  openModal("expense-modal");
};

window.deleteExpense = async (id) => {
  const confirmed = await window.showConfirm?.("هل أنت متأكد من رغبتك في حذف سند الصرف هذا؟ سيتم إرجاع المبالغ للصندوق/البنك وعكس القيود المحاسبية بالكامل.", "حذف سند الصرف");
  if (!confirmed) return;

  try {
    const { doc, getDoc, updateDoc, deleteDoc, getDocs, query, where, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { deleteJournalEntry } = await import("../utils/db.js");

    const expRef = doc(db, `companies/${COMPANY_ID}/expenses`, id);
    const expSnap = await getDoc(expRef);
    if (!expSnap.exists()) {
      window.showToast("سند الصرف غير موجود", "error");
      return;
    }

    const exp = expSnap.data();

    // 1. Reverse Cash/Bank balance
    const sourceRef = doc(db, `companies/${COMPANY_ID}/${exp.method === 'cash' ? 'cashBoxes' : 'bankAccounts'}`, exp.sourceId);
    const sourceSnap = await getDoc(sourceRef);
    if (sourceSnap.exists()) {
      const sourceBal = parseFloat(sourceSnap.data().balance || 0);
      await updateDoc(sourceRef, {
        balance: sourceBal + exp.amount,
        updatedAt: serverTimestamp()
      });
    }

    // 2. Find and delete Journal Entry (which reverses COA balances)
    const jeQuery = query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "==", id), where("sourceType", "==", "expense"));
    const jeSnap = await getDocs(jeQuery);
    if (!jeSnap.empty) {
      await deleteJournalEntry(jeSnap.docs[0].id);
    }

    // 3. Delete Expense doc
    await deleteDoc(expRef);

    const { clearERPCache } = await import("../utils/db.js");
    clearERPCache(`companies/${COMPANY_ID}/expenses`);
    clearERPCache(`companies/${COMPANY_ID}/chartOfAccounts`);
    clearERPCache(`companies/${COMPANY_ID}/journalEntries`);

    window.showToast("تم حذف سند الصرف وعكس القيود المحاسبية بنجاح", "success");
    await loadExpenses();

    if (exp.entityType === "customer") {
      import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(exp.targetId)).catch(e => console.warn(e));
    } else if (exp.entityType === "supplier") {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(exp.targetId)).catch(e => console.warn(e));
    }

  } catch (err) {
    console.error(err);
    window.showToast("خطأ في حذف سند الصرف: " + err.message, "error");
  }
};

function _buildExpenseHTML(e, id, company) {
  const code = e.displayCode || _getCleanVoucherCode(e, id, "PV");
  const typeMap   = { expense: "مصروف", supplier: "مورد", customer: "عميل", other: "حساب عام" };
  const methodMap = { cash: "💵 نقدي", bank: "🏦 تحويل بنكي" };
  const amountWords = _numberToArabicWords(e.amount || 0);

  // Company fields
  const coName    = company.name    || company.companyName || "شركة نظم الإمداد الحديثة";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
  const coPhone   = company.phone   || company.mobile || "0549141648";
  const coEmail   = company.email   || "";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "312448150500003";
  const coCr      = company.crNumber || company.cr  || "4700012345";
  const coLogo    = company.logoUrl  || company.logoBase64 || company.logo || "";

  return `
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${coLogo 
            ? `<img src="${coLogo}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />` 
            : `<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">💸</div>`
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
            <div style="font-size:28px;font-weight:900;color:#ffffff !important;letter-spacing:1.5px;line-height:1;">سـنـد صـرف</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.88) !important;letter-spacing:3px;font-weight:800;margin-top:5px;text-transform:uppercase;">PAYMENT VOUCHER</div>
          </div>
        </div>

      </div>
      
      <!-- Warm Orange Accent Divider Ribbon -->
      <div style="height:5px;background:linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #ea580c 100%) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;margin-top:18px;border-radius:3px;"></div>
    </div>

    <!-- ═══ VOUCHER SERIAL & META BAR ═══ -->
    <div style="background:#fff7ed;border-bottom:1.5px solid #fed7aa;padding:18px 36px;display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:20px;align-items:center;">
      
      <!-- Voucher Number -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:12px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">رقم السند المتسلسل</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:22px;font-weight:900;color:#9a3412;font-family:'Courier New',Consolas,monospace;background:#ffedd5;padding:3px 14px;border-radius:8px;border:1px solid #fed7aa;">${code}</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:12px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${e.date || "—"}</div>
      </div>

      <!-- Payment Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة الدفع / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#c2410c;">${methodMap[e.method] || e.method}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:700;margin-top:2px;">${e.sourceName || "الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);border:2px solid #ef4444;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(239,68,68,0.08);">
        
        <div>
          <div style="font-size:12px;color:#991b1b;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">📤 المبلغ المدفوع بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#7f1d1d;font-family:'Courier New',Consolas,monospace;line-height:1;">${formatCurrency(e.amount || 0)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #fca5a5;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#991b1b;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#7f1d1d;font-weight:900;line-height:1.5;">فقط ${amountWords} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ DETAILS GRID & STATEMENT ═══ -->
    <div style="padding:0 36px 24px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:14px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">المدفوع له (جهة الصرف / الحساب المدين)</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:140px;">نوع الجهة</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:200px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:16px 18px;font-size:16px;font-weight:900;color:#991b1b;">${e.accountName || e.targetName || e.supplierName || e.category || "مصروف"}</td>
            <td style="padding:16px 18px;border-right:1.5px solid #cbd5e1;">
              <span style="background:#fee2e2;color:#991b1b;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #fca5a5;">${typeMap[e.entityType] || "مصروف"}</span>
            </td>
            <td style="padding:16px 18px;font-size:13.5px;font-weight:700;color:#475569;border-right:1.5px solid #cbd5e1;">${e.costCenterName || "بدون مركز تكلفة"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement / Notes Box -->
      <div style="margin-top:18px;background:#fff7ed;border:1.5px dashed #ea580c;border-radius:14px;padding:18px 24px;">
        <div style="font-size:11.5px;color:#9a3412;font-weight:800;margin-bottom:6px;text-transform:uppercase;">البيان / ملاحظات الصرف</div>
        <div style="font-size:15px;color:#0f172a;font-weight:800;line-height:1.6;">${e.notes || e.description || "—"}</div>
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:28px 36px 32px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;">
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المستلم (الجهة المدفوع لها)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">اعتماد المدير العام</div>
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

function _numberToArabicWords(num) {
  if (!num || isNaN(num)) return "صفر";
  const n = Math.floor(num);
  const decimals = Math.round((num - n) * 100);
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانيمائة", "تسعمائة"];
  function group(val) {
    if (val === 0) return "";
    if (val < 20) return ones[val];
    if (val < 100) return tens[Math.floor(val/10)] + (val%10 ? " و" + ones[val%10] : "");
    return hundreds[Math.floor(val/100)] + (val%100 ? " و" + group(val%100) : "");
  }
  let result = "";
  if (n >= 1000000) result += group(Math.floor(n/1000000)) + " مليون ";
  if (n >= 1000)    result += group(Math.floor((n%1000000)/1000)) + " ألف ";
  result += group(n % 1000);
  result = result.trim() + " ريال سعودي";
  if (decimals > 0) result += ` و ${group(decimals)} هللة`;
  return result;
}
