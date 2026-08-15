// ============================================================
// IDHAM ERP — Cheques Module (أوراق القبض والدفع)
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, createJournalEntry } from "../utils/db.js";
import { formatCurrency, todayString } from "../utils/formatters.js";

let cheques = [];
let allAccounts = [];
let bankAccounts = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group">
        <label>الحالة</label>
        <select id="chq-status-filter" class="input" onchange="loadCheques()">
          <option value="all">الكل</option>
          <option value="pending" selected>تحت التحصيل/مؤجل</option>
          <option value="cleared">مُحصَّل (مصروف)</option>
          <option value="bounced">مرتجع (بدون رصيد)</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:12px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الشيكات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','الشيكات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-secondary" onclick="openChequeModal('payable')">+ ورقة دفع (شيك صادر)</button>
        <button class="btn btn-primary" onclick="openChequeModal('receivable')">+ ورقة قبض (شيك وارد)</button>
      </div>
    </div>
    
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">أوراق القبض والدفع (الشيكات)</h1>
        <p class="page-subtitle">متابعة الشيكات الواردة والصادرة وحالتها البنكية</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>النوع</th>
                <th>رقم الشيك</th>
                <th>البنك (المسحوب عليه)</th>
                <th>تاريخ الاستحقاق</th>
                <th>البيان / المستفيد</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th style="width:120px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="chq-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Cheque Modal -->
    <div class="modal-overlay" id="chq-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="chq-modal-title">تسجيل شيك</h3>
          <button class="modal-close" onclick="closeModal('chq-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="chq-type" />
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group"><label>رقم الشيك *</label><input type="text" id="chq-number" class="input mono" /></div>
            <div class="form-group"><label>تاريخ الاستحقاق *</label><input type="date" id="chq-date" class="input" value="${todayString()}" /></div>
          </div>
          
          <div class="form-group mb-16">
            <label>المبلغ *</label>
            <input type="number" id="chq-amount" class="input mono" min="0" step="0.01" />
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group"><label>البنك (إصدار/سحب) *</label><input type="text" id="chq-bank-name" class="input" placeholder="مثال: البنك الأهلي" /></div>
            <div class="form-group"><label>اسم المستفيد / الساحب *</label><input type="text" id="chq-beneficiary" class="input" /></div>
          </div>

          <div class="form-group mb-16">
            <label id="chq-acc-label">حساب المورد / العميل (شجرة الحسابات) *</label>
            <select id="chq-account" class="input"></select>
          </div>

          <div class="form-group mb-16">
            <label>ملاحظات</label>
            <textarea id="chq-notes" class="input" rows="2"></textarea>
          </div>
          <div id="chq-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('chq-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCheque()" id="save-chq-btn">حفظ الشيك</button>
        </div>
      </div>
    </div>

    <!-- Action Modal (Clear/Bounce) -->
    <div class="modal-overlay" id="chq-action-modal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">تحديث حالة الشيك</h3>
          <button class="modal-close" onclick="closeModal('chq-action-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="action-chq-id" />
          <input type="hidden" id="action-chq-status" />
          <p id="action-chq-msg" style="margin-bottom:16px;"></p>
          <div class="form-group">
            <label>اختر الحساب البنكي للتأثير *</label>
            <select id="action-bank-acc" class="input"></select>
          </div>
          <div id="action-chq-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('chq-action-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="submitChequeAction()" id="save-action-btn">تأكيد</button>
        </div>
      </div>
    </div>
  `;

  await Promise.all([
    loadDependencies(),
    window.loadCheques = loadCheques // export for the filter change
  ]);
  await loadCheques();
}

async function loadDependencies() {
  allAccounts = await getAll(COLS.chartOfAccounts());
  bankAccounts = await getAll(COLS.bankAccounts());

  document.getElementById("action-bank-acc").innerHTML = '<option value="">اختر الحساب البنكي...</option>' + 
    bankAccounts.map(b => `<option value="${b.id}">${b.bankName} - ${b.accountNumber}</option>`).join("");
}

async function loadCheques() {
  const statusFilter = document.getElementById("chq-status-filter").value;
  const tbody = document.getElementById("chq-tbody");

  try {
    const q = query(COLS.cheques(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    cheques = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (statusFilter !== 'all') {
      cheques = cheques.filter(c => c.status === statusFilter);
    }

    if (!cheques.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-3);">لا توجد شيكات</td></tr>`;
      return;
    }

    tbody.innerHTML = cheques.map(c => {
      let typeBadge = c.type === 'receivable' ? '<span class="badge bg-good text-white">قبض (وارد)</span>' : '<span class="badge bg-bad text-white">دفع (صادر)</span>';
      let statusBadge = '';
      if (c.status === 'pending') statusBadge = '<span class="badge bg-info text-white">تحت التحصيل</span>';
      else if (c.status === 'cleared') statusBadge = '<span class="badge bg-good text-white">محصَّل</span>';
      else statusBadge = '<span class="badge bg-bad text-white">مرتجع</span>';

      return `
        <tr>
          <td>${typeBadge}</td>
          <td class="mono font-bold">${c.chqNumber}</td>
          <td>${c.bankName}</td>
          <td>${c.dueDate}</td>
          <td>${c.beneficiary}</td>
          <td class="mono text-bad">${formatCurrency(c.amount)}</td>
          <td>${statusBadge}</td>
          <td>
            ${c.status === 'pending' ? `
              <button class="btn btn-icon sm btn-ghost text-good" onclick="promptChequeAction('${c.id}', 'cleared')" title="تحصيل/صرف">✔️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="promptChequeAction('${c.id}', 'bounced')" title="ارتجاع">❌</button>
            ` : ''}
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="delCheque('${c.id}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-bad" style="text-align:center;">خطأ في التحميل</td></tr>`;
  }
}

window.openChequeModal = (type) => {
  document.getElementById("chq-type").value = type;
  document.getElementById("chq-modal-title").textContent = type === 'receivable' ? 'تسجيل ورقة قبض (شيك وارد)' : 'تسجيل ورقة دفع (شيك صادر)';
  document.getElementById("chq-acc-label").textContent = type === 'receivable' ? 'حساب العميل (الساحب) *' : 'حساب المورد (المستفيد) *';
  
  // Filter accounts
  const accTypes = type === 'receivable' ? ['customer'] : ['vendor'];
  const filteredAccs = allAccounts.filter(a => accTypes.includes(a.type));
  document.getElementById("chq-account").innerHTML = '<option value="">اختر...</option>' + 
    filteredAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");

  document.getElementById("chq-number").value = "";
  document.getElementById("chq-date").value = todayString();
  document.getElementById("chq-amount").value = "";
  document.getElementById("chq-bank-name").value = "";
  document.getElementById("chq-beneficiary").value = "";
  document.getElementById("chq-notes").value = "";
  document.getElementById("chq-error").classList.add("hidden");
  
  openModal("chq-modal");
};

window.saveCheque = async () => {
  const errEl = document.getElementById("chq-error"); errEl.classList.add("hidden");
  
  const type = document.getElementById("chq-type").value;
  const chqNumber = document.getElementById("chq-number").value.trim();
  const dueDate = document.getElementById("chq-date").value;
  const amount = parseFloat(document.getElementById("chq-amount").value);
  const bankName = document.getElementById("chq-bank-name").value.trim();
  const beneficiary = document.getElementById("chq-beneficiary").value.trim();
  const accountId = document.getElementById("chq-account").value;
  
  if (!chqNumber || !dueDate || !amount || !bankName || !beneficiary || !accountId) {
    errEl.textContent = "الرجاء تعبئة جميع الحقول المطلوبة (*)"; errEl.classList.remove("hidden"); return;
  }

  const btn = document.getElementById("save-chq-btn"); btn.disabled = true;

  try {
    const data = {
      type,
      chqNumber,
      dueDate,
      amount,
      bankName,
      beneficiary,
      accountId,
      accountName: allAccounts.find(a=>a.id===accountId)?.name,
      notes: document.getElementById("chq-notes").value,
      status: "pending" // pending, cleared, bounced
    };

    const cId = await create(COLS.cheques(), data);

    // Initial Journal Entry (Receipt of Cheque / Issuance of Cheque)
    // Needs Accounts: Notes Receivable (أوراق قبض) / Notes Payable (أوراق دفع)
    // We will use hardcoded aliases or expect them in the chart. For now we use standard names.
    const nrAcc = allAccounts.find(a => a.name.includes("أوراق قبض"))?.id || "NOTES_REC";
    const npAcc = allAccounts.find(a => a.name.includes("أوراق دفع"))?.id || "NOTES_PAY";

    const nrAccObj = allAccounts.find(a => a.name.includes("أوراق قبض")) || { id: "NOTES_REC", code: "112", name: "أوراق قبض" };
    const npAccObj = allAccounts.find(a => a.name.includes("أوراق دفع")) || { id: "NOTES_PAY", code: "212", name: "أوراق دفع" };
    const partyAccObj = allAccounts.find(a => a.id === accountId);

    if (type === 'receivable') {
      await createJournalEntry({
        date: dueDate,
        description: `استلام شيك #${chqNumber} من ${data.accountName}`,
        sourceType: "cheque",
        sourceId: cId,
        lines: [
          { 
            accountId: nrAccObj.id, 
            accountCode: nrAccObj.code, 
            accountName: nrAccObj.name, 
            debit: amount, 
            credit: 0, 
            note: `استلام شيك` 
          },
          { 
            accountId: accountId, 
            accountCode: partyAccObj?.code || "", 
            accountName: partyAccObj?.name || "", 
            debit: 0, 
            credit: amount, 
            note: `سداد بشيك` 
          }
        ]
      });
    } else {
      await createJournalEntry({
        date: dueDate,
        description: `إصدار شيك #${chqNumber} لـ ${data.accountName}`,
        sourceType: "cheque",
        sourceId: cId,
        lines: [
          { 
            accountId: accountId, 
            accountCode: partyAccObj?.code || "", 
            accountName: partyAccObj?.name || "", 
            debit: amount, 
            credit: 0, 
            note: `دفعة بشيك` 
          },
          { 
            accountId: npAccObj.id, 
            accountCode: npAccObj.code, 
            accountName: npAccObj.name, 
            debit: 0, 
            credit: amount, 
            note: `إصدار شيك` 
          }
        ]
      });
    }

    showToast("تم تسجيل الشيك وإنشاء القيد المحاسبي المبدئي", "success");
    closeModal("chq-modal");
    await loadCheques();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.promptChequeAction = (id, newStatus) => {
  const c = cheques.find(x => x.id === id);
  if (!c) return;

  document.getElementById("action-chq-id").value = id;
  document.getElementById("action-chq-status").value = newStatus;
  
  const msg = newStatus === 'cleared' ? 'هل أنت متأكد من تحصيل/صرف هذا الشيك فعلياً في البنك؟ سيتم التأثير على حساب البنك المختار.' : 'هل أنت متأكد من ارتجاع هذا الشيك (بدون رصيد)؟ سيتم عكس القيد المحاسبي.';
  document.getElementById("action-chq-msg").textContent = msg;
  document.getElementById("action-chq-error").classList.add("hidden");
  
  openModal("chq-action-modal");
};

window.submitChequeAction = async () => {
  const errEl = document.getElementById("action-chq-error"); errEl.classList.add("hidden");
  const id = document.getElementById("action-chq-id").value;
  const status = document.getElementById("action-chq-status").value;
  const bankAccId = document.getElementById("action-bank-acc").value;

  if (status === 'cleared' && !bankAccId) {
    errEl.textContent = "الرجاء اختيار الحساب البنكي للتأثير"; errEl.classList.remove("hidden"); return;
  }

  const btn = document.getElementById("save-action-btn"); btn.disabled = true;

  try {
    const c = cheques.find(x => x.id === id);
    await update("cheques", id, { status });

    const nrAccObj = allAccounts.find(a => a.name.includes("أوراق قبض")) || { id: "NOTES_REC", code: "112", name: "أوراق قبض" };
    const npAccObj = allAccounts.find(a => a.name.includes("أوراق دفع")) || { id: "NOTES_PAY", code: "212", name: "أوراق دفع" };
    const actualBankAcc = bankAccounts.find(b => b.id === bankAccId)?.accountId || "BANK_ACC";
    const actualBankAccObj = allAccounts.find(a => a.id === actualBankAcc) || { id: "BANK_ACC", code: "102", name: "البنك" };
    const clientAccObj = allAccounts.find(a => a.id === c.accountId);

    if (status === 'cleared') {
      if (c.type === 'receivable') {
        await createJournalEntry({
          date: todayString(),
          description: `تحصيل شيك وارد #${c.chqNumber}`,
          sourceType: "cheque_clear",
          sourceId: id,
          lines: [
            { accountId: actualBankAccObj.id, accountCode: actualBankAccObj.code, accountName: actualBankAccObj.name, debit: c.amount, credit: 0, note: "إيداع شيك" },
            { accountId: nrAccObj.id, accountCode: nrAccObj.code, accountName: nrAccObj.name, debit: 0, credit: c.amount, note: "إقفال ورقة قبض" }
          ]
        });
      } else {
        await createJournalEntry({
          date: todayString(),
          description: `صرف شيك صادر #${c.chqNumber}`,
          sourceType: "cheque_clear",
          sourceId: id,
          lines: [
            { accountId: npAccObj.id, accountCode: npAccObj.code, accountName: npAccObj.name, debit: c.amount, credit: 0, note: "إقفال ورقة دفع" },
            { accountId: actualBankAccObj.id, accountCode: actualBankAccObj.code, accountName: actualBankAccObj.name, debit: 0, credit: c.amount, note: "سحب شيك" }
          ]
        });
      }
    } else if (status === 'bounced') {
      if (c.type === 'receivable') {
        await createJournalEntry({
          date: todayString(),
          description: `ارتجاع شيك وارد #${c.chqNumber}`,
          sourceType: "cheque_bounce",
          sourceId: id,
          lines: [
            { accountId: c.accountId, accountCode: clientAccObj?.code || "", accountName: clientAccObj?.name || "", debit: c.amount, credit: 0, note: "عكس تسوية (مرتجع)" },
            { accountId: nrAccObj.id, accountCode: nrAccObj.code, accountName: nrAccObj.name, debit: 0, credit: c.amount, note: "إلغاء ورقة قبض" }
          ]
        });
      } else {
        await createJournalEntry({
          date: todayString(),
          description: `ارتجاع شيك صادر #${c.chqNumber}`,
          sourceType: "cheque_bounce",
          sourceId: id,
          lines: [
            { accountId: npAccObj.id, accountCode: npAccObj.code, accountName: npAccObj.name, debit: c.amount, credit: 0, note: "إلغاء ورقة دفع" },
            { accountId: c.accountId, accountCode: clientAccObj?.code || "", accountName: clientAccObj?.name || "", debit: 0, credit: c.amount, note: "عكس سداد (مرتجع)" }
          ]
        });
      }
    }

    showToast("تم تحديث حالة الشيك وإنشاء القيود اللازمة", "success");
    closeModal("chq-action-modal");
    await loadCheques();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.delCheque = async (id) => {
  if (confirm("تحذير: سيتم حذف سجل الشيك. هل تريد الاستمرار؟")) {
    try { await remove("cheques", id); showToast("تم الحذف", "success"); await loadCheques(); }
    catch(err) { showToast(err.message, "error"); }
  }
};
