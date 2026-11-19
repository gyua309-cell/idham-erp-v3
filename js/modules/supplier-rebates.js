// ============================================================
// IDHAM ERP — حوافز وخصومات الموردين السنوية (Rebates & Target)
// Annual Supplier Target Tracking, Rebates & Incentive Hub
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allRebates = [];
let allSuppliers = [];
let allInvoices = [];

const currentYear = () => new Date().getFullYear();

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="reb-search" class="input" placeholder="🔍 بحث في اتفاقيات البونص..." oninput="window.filterRebates(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>السنة المالية</label>
        <select id="reb-year-filter" onchange="window.filterRebates()">
          <option value="${currentYear()}">${currentYear()}</option>
          <option value="${currentYear() - 1}">${currentYear() - 1}</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportRebatesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openRebateModal()">+ إضافة هدف وبونص سنوي لمورد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي اتفاقيات البونص السنوية</div>
          <div class="mono" id="reb-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1.5px solid rgba(16,185,129,0.3); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">💰 إجمالي البونص المكتسب حتى الآن</div>
          <div class="mono" id="reb-kpi-earned" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي المشتريات المحققة</div>
          <div class="mono" id="reb-kpi-achieved" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">أهداف المشتريات السنوية المستهدفة</div>
          <div class="mono" id="reb-kpi-target" style="font-size:18px; font-weight:900; color:#F59E0B; margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Rebates Visual Progress Cards -->
      <div id="reb-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;"></div>
    </div>

    <!-- Rebate Modal -->
    <div class="modal-overlay" id="rebate-modal">
      <div class="modal modal-lg" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title" id="reb-modal-title">➕ إضافة اتفاقية بونص وهدف سنوي</h3>
          <button class="modal-close" onclick="closeModal('rebate-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="reb-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المستهدف *</label>
              <select id="reb-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>السنة المالية *</label>
              <input type="number" id="reb-year" class="input mono" value="${currentYear()}" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>قيمة المشتريات السنوية المستهدفة (ر.س) *</label>
              <input type="number" id="reb-target-val" class="input mono" placeholder="100000" min="1000" />
            </div>
            <div class="form-group">
              <label>نسبة البونص / الحافز السنوي (Rebate %) *</label>
              <input type="number" id="reb-pct" class="input mono" placeholder="3.0" min="0.1" max="25" step="0.1" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>شروط استحقاق البونص وطريقة التسوية</label>
            <input type="text" id="reb-terms" class="input" placeholder="مثال: يصرف كخصم نقدي في نهاية السنة المالية أو بضاعة مجانية..." />
          </div>

          <div class="form-group">
            <label>ملاحظات إضافية</label>
            <textarea id="reb-notes" class="input" rows="2" placeholder="أي تفاصيل خاصة بالاتفاقية..."></textarea>
          </div>

          <div id="reb-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rebate-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveRebate()">💾 حفظ الاتفاقية</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [rebates, sups, invs] = await Promise.all([
      getAll(COLS.supplierRebates ? COLS.supplierRebates() : "supplierRebates", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.purchaseInvoices()).catch(() => [])
    ]);

    allRebates = rebates;
    allSuppliers = sups;
    allInvoices = invs.filter(i => i.status !== "cancelled");

    populateSuppliersDropdown();
    updateKPIs();
    renderRebateCards();
  } catch (e) {
    console.warn("Error loading supplier rebates data:", e);
  }
}

function calculateActualYearlyPurchases(supId, year) {
  const yearInvs = allInvoices.filter(i => i.supplierId === supId && (i.date || "").startsWith(String(year)));
  return yearInvs.reduce((sum, i) => sum + parseFloat(i.totalWithVat || i.total || 0), 0);
}

function updateKPIs() {
  const year = parseInt(document.getElementById("reb-year-filter")?.value) || currentYear();
  const yearRebates = allRebates.filter(r => (parseInt(r.year) || currentYear()) === year);

  let totalTarget = 0;
  let totalAchieved = 0;
  let totalEarnedRebate = 0;

  yearRebates.forEach(r => {
    const actual = calculateActualYearlyPurchases(r.supplierId, year);
    const target = parseFloat(r.targetValue) || 1;
    const pct = parseFloat(r.rebatePct) || 0;
    
    totalTarget += target;
    totalAchieved += actual;
    totalEarnedRebate += (actual * (pct / 100));
  });

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("reb-kpi-total", yearRebates.length);
  setT("reb-kpi-earned", formatCurrency(totalEarnedRebate));
  setT("reb-kpi-achieved", formatCurrency(totalAchieved));
  setT("reb-kpi-target", formatCurrency(totalTarget));
}

function populateSuppliersDropdown() {
  const m = document.getElementById("reb-sup-id");
  if (m) {
    m.innerHTML = `<option value="">-- اختر المورد --</option>` +
      allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  }
}

function renderRebateCards(list = allRebates) {
  const grid = document.getElementById("reb-cards-grid");
  if (!grid) return;

  const year = parseInt(document.getElementById("reb-year-filter")?.value) || currentYear();
  const filtered = list.filter(r => (parseInt(r.year) || currentYear()) === year);

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column:1/-1; padding:48px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🎯</div>
        <div style="font-size:16px; font-weight:700;">لا توجد اتفاقيات بونص سنوية مسجلة لعام ${year}</div>
        <div style="font-size:12px; margin-top:4px;">انقر على "+ إضافة هدف وبونص سنوي لمورد" لتوثيق أهداف التوريد والحوافز</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const actual = calculateActualYearlyPurchases(r.supplierId, year);
    const target = parseFloat(r.targetValue) || 100000;
    const pct = parseFloat(r.rebatePct) || 3;
    const progressPct = Math.min(100, Math.round((actual / target) * 100));
    const earnedSoFar = actual * (pct / 100);
    const potentialTotal = target * (pct / 100);
    const isCompleted = actual >= target;

    return `
      <div class="card" style="padding:18px; border:1.5px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'var(--border-soft)'}; background:${isCompleted ? 'rgba(16,185,129,0.03)' : 'var(--bg-card)'}; border-radius:14px; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div>
            <div style="font-weight:800; font-size:15px; color:var(--text-0);">${r.supplierName}</div>
            <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">اتفاقية بونص عام ${r.year || year} • نسبة الحافز: <b style="color:#10B981;">${pct}%</b></div>
          </div>
          <span class="badge" style="background:${isCompleted ? '#10B981' : '#6366F1'}18; color:${isCompleted ? '#10B981' : 'var(--brand)'}; font-weight:800; font-size:11px;">
            ${isCompleted ? '🎉 تم تحقيق الهدف!' : `إنجاز ${progressPct}%`}
          </span>
        </div>

        <!-- Progress Bar -->
        <div style="margin:8px 0 14px;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
            <span>المحقق: <b class="mono text-brand">${formatCurrency(actual)}</b></span>
            <span>الهدف: <b class="mono">${formatCurrency(target)}</b></span>
          </div>
          <div style="height:10px; background:var(--bg-2); border-radius:10px; overflow:hidden; border:1px solid var(--border-soft);">
            <div style="height:100%; width:${progressPct}%; background:${isCompleted ? '#10B981' : 'linear-gradient(to left, #6366F1, #8B5CF6)'}; border-radius:10px; transition:width 0.3s;"></div>
          </div>
        </div>

        <!-- Incentive Calculations Matrix -->
        <div style="background:var(--bg-2); border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div><span style="color:var(--text-3);">البونص المكتسب حالياً:</span></div>
          <div style="text-align:left;"><b class="mono font-bold text-good" style="font-size:13px;">+ ${formatCurrency(earnedSoFar)}</b></div>
          <div><span style="color:var(--text-3);">البونص عند اكتمال الهدف:</span></div>
          <div style="text-align:left;"><b class="mono font-bold" style="font-size:13px; color:var(--brand);">${formatCurrency(potentialTotal)}</b></div>
        </div>

        ${r.terms ? `
          <div style="font-size:11.5px; color:var(--text-2); margin-bottom:12px; line-height:1.4;">
            <b>الشروط:</b> ${r.terms}
          </div>
        ` : ""}

        <!-- Actions -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:10px; border-top:1px dashed var(--border-soft);">
          <button class="btn btn-secondary btn-sm" onclick="window.editRebate('${r.id}')">✏️ تعديل</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteRebate('${r.id}')" title="حذف">🗑️</button>
        </div>
      </div>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterRebates = () => {
    const q = (document.getElementById("reb-search")?.value || "").trim().toLowerCase();
    const year = parseInt(document.getElementById("reb-year-filter")?.value) || currentYear();

    const filtered = allRebates.filter(r => {
      const mQ = !q || (r.supplierName || "").toLowerCase().includes(q) || (r.terms || "").toLowerCase().includes(q);
      const mY = (parseInt(r.year) || currentYear()) === year;
      return mQ && mY;
    });

    updateKPIs();
    renderRebateCards(filtered);
  };

  window.openRebateModal = () => {
    document.getElementById("reb-edit-id").value = "";
    document.getElementById("reb-modal-title").textContent = "➕ إضافة اتفاقية بونص وهدف سنوي";
    document.getElementById("reb-sup-id").value = "";
    document.getElementById("reb-year").value = currentYear();
    document.getElementById("reb-target-val").value = "100000";
    document.getElementById("reb-pct").value = "3.0";
    document.getElementById("reb-terms").value = "خصم سنوي مباشر من الرصيد أو بضاعة مجانية";
    document.getElementById("reb-notes").value = "";
    document.getElementById("reb-modal-err").classList.add("hidden");
    openModal("rebate-modal");
  };

  window.saveRebate = async () => {
    const err = document.getElementById("reb-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("reb-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const targetVal = parseFloat(document.getElementById("reb-target-val").value) || 0;
    const pct = parseFloat(document.getElementById("reb-pct").value) || 0;
    const editId = document.getElementById("reb-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }
    if (!targetVal) { err.textContent = "يرجى إدخال قيمة الهدف السنوي"; err.classList.remove("hidden"); return; }

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      year: parseInt(document.getElementById("reb-year").value) || currentYear(),
      targetValue: targetVal,
      rebatePct: pct,
      terms: document.getElementById("reb-terms").value.trim(),
      notes: document.getElementById("reb-notes").value.trim()
    };

    try {
      if (editId) {
        await update("supplierRebates", editId, data);
      } else {
        await create("supplierRebates", data);
      }
      closeModal("rebate-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editRebate = (id) => {
    const r = allRebates.find(x => x.id === id);
    if (!r) return;

    document.getElementById("reb-edit-id").value = r.id;
    document.getElementById("reb-modal-title").textContent = "✏️ تعديل اتفاقية البونص: " + r.supplierName;
    document.getElementById("reb-sup-id").value = r.supplierId || "";
    document.getElementById("reb-year").value = r.year || currentYear();
    document.getElementById("reb-target-val").value = r.targetValue || "";
    document.getElementById("reb-pct").value = r.rebatePct || "";
    document.getElementById("reb-terms").value = r.terms || "";
    document.getElementById("reb-notes").value = r.notes || "";
    document.getElementById("reb-modal-err").classList.add("hidden");
    openModal("rebate-modal");
  };

  window.deleteRebate = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الاتفاقية؟")) return;
    try {
      await remove("supplierRebates", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportRebatesExcel = () => {
    const year = parseInt(document.getElementById("reb-year-filter")?.value) || currentYear();
    const rows = allRebates.map(r => {
      const actual = calculateActualYearlyPurchases(r.supplierId, r.year || year);
      const earned = actual * ((r.rebatePct || 0) / 100);
      return {
        "المورد": r.supplierName,
        "السنة": r.year || year,
        "الهدف السنوي": r.targetValue || 0,
        "المشتريات المحققة": actual,
        "نسبة الحافز %": r.rebatePct || 0,
        "البونص المكتسب": earned,
        "الشروط": r.terms || "—"
      };
    });
    exportToExcel(rows, "حوافز_وبونص_الموردين_السنوية");
  };
}
