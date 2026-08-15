// ============================================================
// IDHAM ERP — Sales Rep Module
// ============================================================
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, where, orderBy, limit, getDocs } from "../utils/db.js";
import { formatCurrency, formatDate, formatPercent, getTargetColor } from "../utils/formatters.js";
import { showRecordPreview, printRecord } from "../utils/record-actions.js";
import { exportToExcel } from "../utils/excel.js";
import { syncRepToCoa } from "../utils/coa-connector.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="rep-search" class="input" placeholder="🔍  بحث في المناديب…" />
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export" onclick="exportPagePDF('#reps-grid','المناديب')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportRepsExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openRepModal()">+ إضافة مندوب</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">المناديب الميدانيون</h1>
      </div>
      <div id="reps-grid" class="grid-3" style="gap:16px;margin-bottom:24px;">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="rep-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="rep-modal-title">إضافة مندوب جديد</h3>
          <button class="modal-close" onclick="closeModal('rep-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="rep-edit-id" />
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>اسم المندوب *</label>
              <input type="text" id="rep-name" class="input" />
            </div>
            <div class="form-group">
              <label>الهاتف</label>
              <input type="tel" id="rep-phone" class="input mono" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>المنطقة/المسار</label>
              <input type="text" id="rep-zone" class="input" />
            </div>
            <div class="form-group">
              <label>الهدف الشهري (ر.س)</label>
              <input type="number" id="rep-target" class="input mono" step="100" min="0" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>الراتب الأساسي (ر.س)</label>
              <input type="number" id="rep-salary" class="input mono" step="100" />
            </div>
            <div class="form-group">
              <label>نسبة العمولة (%)</label>
              <input type="number" id="rep-commission" class="input mono" step="0.1" min="0" max="100" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16" style="border-top:1px solid var(--border);padding-top:12px;">
            <div class="form-group">
              <label>🔑 رقم PIN (تطبيق الجوال)</label>
              <input type="password" id="rep-pin" class="input mono" maxlength="6" placeholder="4-6 أرقام" />
            </div>
            <div class="form-group">
              <label>🚗 مخزن السيارة (المستودع)</label>
              <select id="rep-warehouse" class="input"><option value="">-- اختر مستودع --</option></select>
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>👤 الموظف المرتبط (الموارد البشرية)</label>
              <select id="rep-employee" class="input"><option value="">-- اختر موظف --</option></select>
            </div>
            <div class="form-group"></div>
          </div>
          <div id="rep-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rep-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRep()" id="save-rep-btn">حفظ</button>
        </div>
      </div>
    </div>`;

  await loadReps();
}

async function loadReps() {
  const grid = document.getElementById("reps-grid");
  if (!grid) return;
  try {
    const [reps, customers, invoices, receipts, coaAccounts] = await Promise.all([
      getAll(COLS.salesReps(), [orderBy("name")]),
      getAll(COLS.customers()),
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      // Load COA accounts under the reps' parent "1-1-2-1-2" to read account balances
      getAll(COLS.chartOfAccounts(), [where("parentCode", "==", "1-1-2-1-2")]).catch(() => []),
    ]);
    cachedReps = reps;

    // Build a COA map: accountId → account doc
    const coaMap = {};
    coaAccounts.forEach(acc => { coaMap[acc.id] = acc; });

    if (reps.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🚚</div><h3>لا يوجد مناديب</h3><p>اضغط على "إضافة مندوب" للبدء</p></div>`;
      return;
    }

    const activeInvoices = invoices.filter(i => i.status !== "cancelled");

    grid.innerHTML = reps.map(rep => {
      // 1. Assigned Customers for this rep — فلترة صارمة بالمعرّف فقط لمنع ربط عملاء غير معنيين
      // ✅ FIX: تمت إزالة الفلترة بـ repName لأنها تُسبب ظهور عملاء غير مربوطين بالمندوب
      const repCusts = customers.filter(c => c.repId === rep.id || c.assignedRepId === rep.id);
      const custIds = new Set(repCusts.map(c => c.id));
      const custNames = new Set(repCusts.map(c => c.name));

      // 2. Total Invoiced Sales for this rep / rep's customers — استخدام custIds فقط
      let repSales = 0;
      activeInvoices.forEach(inv => {
        if (inv.repId === rep.id || custIds.has(inv.customerId)) {
          repSales += parseFloat(inv.totalWithVat || inv.total || 0);
        }
      });

      // 3. Total Cash Collections (Receipts) for this rep's customers — استخدام custIds فقط
      let repCollections = 0;
      receipts.forEach(rcpt => {
        if (rcpt.repId === rep.id || custIds.has(rcpt.customerId) || custIds.has(rcpt.targetId)) {
          repCollections += parseFloat(rcpt.amount || 0);
        }
      });

      // 4. Customer Debts & Commission calculation based on CASH COLLECTIONS (with target check)
      const custDebtTotal = repCusts.reduce((s, c) => s + parseFloat(c.balance || 0), 0);
      const target = rep.monthlyTarget || 0;
      const commRate = repSales < target ? 1.0 : parseFloat(rep.commissionRate || 2.5);
      const earnedCommission = (repCollections * commRate) / 100;

      const pct    = target > 0 ? Math.min((repSales / target) * 100, 150) : 0;
      const color  = getTargetColor(pct);

      // 5. COA Account Balance — رصيد الحساب المحاسبي للمندوب في شجرة الحسابات
      //    يعكس أثر القيود المحاسبية (تسوية السلف، الاستحقاقات، إلخ)
      const repCoa  = rep.accountId ? coaMap[rep.accountId] : null;
      const coaBal  = repCoa ? parseFloat(repCoa.balance || repCoa.totalDebit - repCoa.totalCredit || 0) : null;
      const isSettled = coaBal !== null && Math.abs(coaBal) < 0.01;
      const coaBlock = repCoa ? `
        <div style="margin-top:10px;padding:10px 12px;border-radius:10px;
          background:${isSettled ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)'};
          border:1px solid ${isSettled ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'};
          display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:10px;color:var(--text-2);margin-bottom:2px;">📒 رصيد الحساب المحاسبي</div>
            <div style="font-size:11px;color:var(--text-2);">${repCoa.code} — ${repCoa.name}</div>
          </div>
          <div style="text-align:left;">
            ${isSettled
              ? `<span style="font-size:13px;font-weight:700;color:#10b981;">✅ مسوّى (صفر)</span>`
              : `<span style="font-size:14px;font-weight:800;color:${coaBal > 0 ? '#f59e0b' : '#ef4444'};"
                   class="mono">${formatCurrency(Math.abs(coaBal))}</span>
                 <div style="font-size:10px;color:var(--text-2);">${coaBal > 0 ? 'رصيد مدين' : 'رصيد دائن'}</div>`
            }
          </div>
        </div>` : '';

      return `
        <div class="card" style="padding:0;overflow:hidden;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="height:4px;background:var(--${color});"></div>
          <div style="padding:20px;">
            <div class="flex items-center gap-12 mb-16">
              <div class="user-avatar" style="width:46px;height:46px;font-size:18px;background:var(--brand-glow);color:var(--brand);font-weight:bold;">${rep.name[0]}</div>
              <div>
                <div class="font-heading font-bold" style="font-size:16px;color:var(--text-0);">${rep.name}</div>
                <div class="text-2" style="font-size:12px;">📍 ${rep.zone || "ينبع والمسارات الميدانية"}</div>
              </div>
              <div style="margin-right:auto;">
                <div class="row-actions" style="opacity:1;">
                  <button class="btn btn-icon sm btn-ghost" onclick="viewRepStatement('${rep.id}')" title="كشف الحساب والتحصيلات">📑</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="previewRep('${rep.id}')" title="معاينة">👁️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="editRep('${rep.id}')" title="تعديل">✏️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="printRep('${rep.id}')" title="طباعة">🖨️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="deleteRep('${rep.id}','${rep.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
                </div>
              </div>
            </div>

            <!-- Target Progress -->
            <div class="mb-16" style="background:var(--bg-2);padding:12px;border-radius:10px;">
              <div class="flex justify-between mb-8" style="font-size:12px;">
                <span class="text-2 font-semibold">تحقيق الهدف الشهري (المبيعات)</span>
                <span class="mono text-${color} font-bold">${formatPercent(pct)}</span>
              </div>
              <div class="progress-bar" style="height:7px;background:rgba(255,255,255,0.06);">
                <div class="fill ${color}" style="width:${Math.min(pct, 100)}%;transition:width 0.6s ease;border-radius:4px;"></div>
              </div>
              <div class="flex justify-between mt-8" style="font-size:11px;">
                <span class="mono font-bold" style="color:var(--text-0);">${formatCurrency(repSales)}</span>
                <span class="text-2">الهدف: ${formatCurrency(target)}</span>
              </div>
            </div>

            <!-- Financials & Commission Metrics -->
            <div class="grid-2 gap-10" style="font-size:12px;margin-bottom:12px;">
              <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--good);">💵 التحصيلات النقدية</div>
                <div class="mono font-bold text-good" style="font-size:15px;">${formatCurrency(repCollections)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">من كشوفات العملاء</div>
              </div>
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--indigo);">💰 العمولة المستحقة (${commRate}%)</div>
                <div class="mono font-bold text-indigo" style="font-size:15px;">${formatCurrency(earnedCommission)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">محسوبة على النقد المحصل</div>
              </div>
            </div>

            <!-- Customer & Contact Info -->
            <div class="grid-2 gap-10" style="font-size:11px;">
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">👥 العملاء المربوطون</div>
                <div class="mono font-bold" style="color:var(--text-0);">${repCusts.length} عميل (ديون: ${formatCurrency(custDebtTotal)})</div>
              </div>
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">📞 الهاتف والجوال</div>
                <div class="mono font-bold" style="color:var(--text-0);">${rep.phone || "—"}</div>
              </div>
            </div>

            <!-- COA Account Balance (reflects journal entry settlements) -->
            ${coaBlock}
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    grid.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}


window.openRepModal = async (rep = null) => {
  document.getElementById("rep-edit-id").value = rep?.id || "";
  document.getElementById("rep-modal-title").textContent = rep ? "تعديل المندوب" : "إضافة مندوب";
  document.getElementById("rep-name").value       = rep?.name          || "";
  document.getElementById("rep-phone").value      = rep?.phone         || "";
  document.getElementById("rep-zone").value       = rep?.zone          || "";
  document.getElementById("rep-target").value     = rep?.monthlyTarget || "";
  document.getElementById("rep-salary").value     = rep?.salary        || "";
  document.getElementById("rep-commission").value = rep?.commissionRate || "";
  document.getElementById("rep-pin").value        = "";
  document.getElementById("rep-form-error").classList.add("hidden");
  // Load warehouses into dropdown
  try {
    const { getAll, COLS } = await import("../utils/db.js");
    const { orderBy } = await import("../utils/db.js");
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("rep-warehouse");
    sel.innerHTML = `<option value="">-- اختر مستودع --</option>` +
      whs.map(w => `<option value="${w.id}" ${rep?.assignedWarehouseId === w.id ? 'selected' : ''}>${w.name}</option>`).join("");
  } catch(e) {}
  // Load employees into dropdown
  try {
    const { getAll, COLS } = await import("../utils/db.js");
    const { orderBy } = await import("../utils/db.js");
    const emps = await getAll(COLS.employees(), [orderBy("name")]);
    const empSel = document.getElementById("rep-employee");
    empSel.innerHTML = `<option value="">-- اختر موظف --</option>` +
      emps.map(e => `<option value="${e.id}" ${rep?.employeeId === e.id ? 'selected' : ''}>${e.name} (${e.job || 'موظف'})</option>`).join("");
  } catch(e) {}
  openModal("rep-modal");
};

window.editRep = async (id) => {
  const { getById } = await import("../utils/db.js");
  const rep = await getById("salesReps", id);
  if (rep) openRepModal(rep);
};

window.saveRep = async () => {
  const errEl = document.getElementById("rep-form-error");
  errEl.classList.add("hidden");
  const id   = document.getElementById("rep-edit-id").value;
  const name = document.getElementById("rep-name").value.trim();
  if (!name) { errEl.textContent = "اسم المندوب مطلوب"; errEl.classList.remove("hidden"); return; }
  const pinVal = document.getElementById("rep-pin").value.trim();
  const data = {
    name, phone: document.getElementById("rep-phone").value.trim(),
    zone: document.getElementById("rep-zone").value.trim(),
    monthlyTarget:  parseFloat(document.getElementById("rep-target").value)     || 0,
    salary:         parseFloat(document.getElementById("rep-salary").value)     || 0,
    commissionRate: parseFloat(document.getElementById("rep-commission").value) || 0,
    assignedWarehouseId: document.getElementById("rep-warehouse").value || null,
    employeeId: document.getElementById("rep-employee").value || null,
  };
  if (pinVal) data.pin = pinVal; // only update pin if entered
  const btn = document.getElementById("save-rep-btn");
  btn.disabled = true;
  try {
    if (id) {
      await update("salesReps", id, data);
      showToast("تم تحديث المندوب", "success");
    } else {
      const newRef = await create(COLS.salesReps(), data);
      showToast("تمت إضافة المندوب", "success");
      // إنشاء حساب تحليلي تلقائي في شجرة الحسابات
      try {
        const newId = typeof newRef === "string" ? newRef : newRef?.id || newRef;
        if (newId) await syncRepToCoa(newId, data.name);
      } catch (coaErr) {
        console.warn("[syncRepToCoa] فشل إنشاء حساب المندوب في شجرة الحسابات:", coaErr.message);
      }
    }
    closeModal("rep-modal");
    await loadReps();
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

window.deleteRep = async (id, name) => {
  if (!await showConfirm(`حذف المندوب "${name}"؟`, "تأكيد")) return;
  try { await remove("salesReps", id); showToast("تم الحذف", "success"); await loadReps(); }
  catch (err) { showToast(err.message, "error"); }
};
window.viewRepStatement = (id) => {
  window._preselectedStatementEntity = { type: "rep", id };
  navigate("report-customer-statement");
};

// ── Preview / Print / PDF ────────────────────────────────
let cachedReps = [];
function getRepById(id) { return cachedReps.find(r => r.id === id) || null; }

function buildRepSections(r) {
  return [
    {
      heading: 'بيانات المندوب',
      rows: [
        { label: 'اسم المندوب', value: r.name, bold: true },
        { label: 'رقم الهاتف', value: r.phone, mono: true },
        { label: 'المنطقة/المسار', value: r.zone },
      ]
    },
    {
      heading: 'بيانات مالية',
      rows: [
        { label: 'الراتب الأساسي', value: formatCurrency(r.salary || 0), mono: true },
        { label: 'الهدف الشهري', value: formatCurrency(r.monthlyTarget || 0), mono: true },
        { label: 'نسبة العمولة', value: r.commissionRate ? `${r.commissionRate}%` : null },
        { label: 'ملاحظات', value: r.notes },
      ]
    }
  ];
}

window.previewRep = (id) => {
  const r = getRepById(id);
  if (!r) { showToast('لم يتم إيجاد المندوب', 'error'); return; }
  showRecordPreview({
    title: r.name,
    icon: '👤',
    sections: buildRepSections(r),
    actions: [
      { icon: '✏️', label: 'تعديل', fn: `document.getElementById('record-preview-overlay').remove();editRep('${id}')`, style: 'background:var(--brand);color:#fff;' },
      { icon: '🖨️', label: 'طباعة', fn: `printRep('${id}')`, style: 'background:var(--bg-2);color:var(--text-1);' },
      { icon: '📄', label: 'PDF', fn: `exportRepPDF('${id}')`, style: 'background:#EF4444;color:#fff;' },
    ]
  });
};

window.printRep = (id) => {
  const r = getRepById(id);
  if (!r) return;
  printRecord({ title: r.name, icon: '👤', sections: buildRepSections(r) });
};

window.exportRepPDF = (id) => { window.printRep(id); };

// ── Excel Export ──────────────────────────────────────
window.exportRepsExcel = async () => {
  try {
    const reps = await getAll(COLS.salesReps(), [orderBy('name')]);
    await exportToExcel({
      title: 'المندوبون',
      headers: ['اسم المندوب', 'رقم الهاتف', 'المنطقة', 'الراتب', 'الهدف الشهري', 'العمولة %'],
      rows: reps.map(r => [r.name, r.phone || '', r.zone || '', r.salary || 0, r.monthlyTarget || 0, r.commissionRate || 0]),
      colWidths: [26, 16, 18, 14, 16, 12],
    });
    showToast('تم تصدير المندوبين ✅', 'success');
  } catch(e) { showToast(e.message, 'error'); }
};

