// ============================================================
// IDHAM ERP — Inventory Counts, Reconciliation & Period Closings
// الجرد الدوري والمفاجئ، تسوية العجز والزيادة، وإقفال الفترات المخزنية
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs } from "../utils/db.js";
import { formatCurrency, formatQuantity, todayString } from "../utils/formatters.js";
import { createJournalEntry } from "../utils/db.js";

let products = [];
let warehouses = [];
let allAccounts = [];
let counts = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div style="margin-right:auto; display:flex; gap:12px;">
        <button class="btn btn-secondary" onclick="openClosingModal()">🔒 إقفال فترة مخزنية</button>
        <button class="btn btn-primary" onclick="openCountModal()">+ جلسة جرد جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">عمليات الجرد والقفلات المخزنية</h1>
        <p class="page-subtitle">مطابقة المخزون الفعلي مع الدفتري وإغلاق الحسابات الجارية</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الجرد</th>
                <th>المستودع الجاري</th>
                <th>عدد الأصناف</th>
                <th>قيمة العجز (ر.س)</th>
                <th>قيمة الزيادة (ر.س)</th>
                <th>الحالة</th>
                <th style="width:120px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="count-tbody">
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

    <!-- Counting Modal -->
    <div class="modal-overlay" id="count-modal">
      <div class="modal modal-xl" style="max-height:85vh; overflow-y:auto;">
        <div class="modal-header">
          <h3 class="modal-title">جلسة جرد وتسوية جديدة</h3>
          <button class="modal-close" onclick="closeModal('count-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="count-id" />
          
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group"><label>تاريخ الجرد *</label><input type="date" id="count-date" class="input" value="${todayString()}" /></div>
            <div class="form-group"><label>نوع الجرد *</label>
              <select id="count-type" class="input">
                <option value="periodic">جرد دوري (Periodic Count)</option>
                <option value="random">جرد مفاجئ (Random/Cycle Count)</option>
                <option value="annual">جرد سنوي ختامي (Annual Count)</option>
              </select>
            </div>
            <div class="form-group"><label>المستودع المراد جرده *</label><select id="count-wh" class="input" onchange="loadWhProductsForCount()"></select></div>
          </div>

          <div class="alert info mb-16">يرجى إدخال الكمية الفعلية لكل صنف في العمود "الكمية الفعلية". سيقوم النظام باحتساب الفروق آلياً.</div>

          <div class="table-container" style="max-height:300px; overflow-y:auto; border:1px solid var(--border-soft); margin-bottom:16px;">
            <table class="data-dense" style="margin:0;">
              <thead style="position:sticky; top:0; background:var(--bg-2); z-index:10;">
                <tr>
                  <th>كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الكمية الدفترية</th>
                  <th style="width:120px;">الكمية الفعلية *</th>
                  <th>الفارق</th>
                  <th>التكلفة الدفترية</th>
                  <th>قيمة الفارق المالي</th>
                </tr>
              </thead>
              <tbody id="count-items-tbody">
                <tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>
              </tbody>
            </table>
          </div>

          <div class="form-group"><label>ملاحظات الجرد / لجنة الجرد</label><textarea id="count-notes" class="input" rows="2"></textarea></div>
          <div id="count-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('count-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePhysicalCount()" id="save-count-btn">اعتماد الجرد والتسوية المالية</button>
        </div>
      </div>
    </div>

    <!-- Closing Period Modal -->
    <div class="modal-overlay" id="closing-modal">
      <div class="modal modal-sm">
        <div class="modal-header"><h3 class="modal-title">إقفال فترة مخزنية</h3><button class="modal-close" onclick="closeModal('closing-modal')">×</button></div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>اختر شهر الإقفال *</label>
            <input type="month" id="closing-month" class="input" value="${todayString().substring(0,7)}" />
          </div>
          <div class="alert warn">تنبيــه: إقفال الفترة يمنع أي عمليات إضافة أو صرف أو تسوية مخزنية مؤرخة في هذا الشهر نهائياً.</div>
          <div id="closing-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('closing-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="submitPeriodClosing()" id="save-closing-btn">إقفال الفترة الآن</button>
        </div></div>
    </div>
  `;

  await Promise.all([
    loadDependencies(),
    loadCounts()
  ]);
}

async function loadDependencies() {
  products = await getAll(COLS.products(), [orderBy("sku")]);
  warehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
  allAccounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);

  document.getElementById("count-wh").innerHTML = '<option value="">اختر المستودع...</option>' + 
    warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
}

async function loadCounts() {
  const tbody = document.getElementById("count-tbody");
  if (!tbody) return;

  try {
    const q = query(COLS.physicalCounts(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    counts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (counts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;">لا توجد جلسات جرد سابقة</td></tr>`;
      return;
    }

    const typeLabels = { periodic: "جرد دوري", random: "جرد مفاجئ", annual: "جرد سنوي ختامي" };

    tbody.innerHTML = counts.map(c => `
      <tr>
        <td>${c.date}</td>
        <td><span class="badge neutral">${typeLabels[c.type] || c.type}</span></td>
        <td><strong>${c.warehouseName}</strong></td>
        <td class="mono font-bold">${c.items.length}</td>
        <td class="mono text-bad font-bold">${formatCurrency(c.totalLoss || 0)}</td>
        <td class="mono text-good font-bold">${formatCurrency(c.totalGain || 0)}</td>
        <td><span class="badge ${c.status === 'posted' ? 'good' : 'warn'}">${c.status === 'posted' ? 'معتمد ومرحل' : 'مسودة'}</span></td>
        <td>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCountDetail('${c.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCount('${c.id}')" title="حذف">🗑️</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-bad">خطأ في التحميل: ${err.message}</td></tr>`;
  }
}

let activeCountProducts = [];

window.loadWhProductsForCount = async () => {
  const whId = document.getElementById("count-wh").value;
  const tbody = document.getElementById("count-items-tbody");
  if (!whId) {
    tbody.innerHTML = `<tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>`;
    return;
  }

  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    // Load per-warehouse stock from stockByWarehouse
    const { getStockForWarehouse } = await import("../utils/db.js");
    const stock = await getStockForWarehouse(whId);
    const stockMap = {};
    stock.forEach(s => stockMap[s.productId] = s.qty);

    activeCountProducts = products.map(p => {
      const bookQty = stockMap[p.id] || 0;
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        bookQty,
        cost: p.costPrice || 0,
        actualQty: bookQty // Default actual equals book
      };
    });

    renderCountLines();

  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-bad" style="text-align:center;">${err.message}</td></tr>`;
  }
};

function renderCountLines() {
  const tbody = document.getElementById("count-items-tbody");
  tbody.innerHTML = activeCountProducts.map((p, idx) => {
    const diff = p.actualQty - p.bookQty;
    const diffCost = diff * p.cost;

    return `
      <tr>
        <td class="mono font-bold">${p.sku}</td>
        <td><strong>${p.name}</strong></td>
        <td class="mono font-bold">${formatQuantity(p.bookQty)}</td>
        <td>
          <input type="number" class="input mono count-input" style="height:28px; padding:2px 8px; font-size:12px; font-weight:bold;" 
            value="${p.actualQty}" min="0" onchange="updateCountLine(${idx}, this.value)" />
        </td>
        <td class="mono font-bold ${diff > 0 ? 'text-good' : diff < 0 ? 'text-bad' : ''}">
          ${diff > 0 ? `+${formatQuantity(diff)}` : diff < 0 ? formatQuantity(diff) : "0"}
        </td>
        <td class="mono dim">${formatCurrency(p.cost)}</td>
        <td class="mono font-bold ${diffCost > 0 ? 'text-good' : diffCost < 0 ? 'text-bad' : ''}">
          ${formatCurrency(diffCost)}
        </td>
      </tr>
    `;
  }).join("");
}

window.updateCountLine = (idx, val) => {
  activeCountProducts[idx].actualQty = parseFloat(val) || 0;
  renderCountLines();
};

window.openCountModal = () => {
  document.getElementById("count-wh").value = "";
  document.getElementById("count-items-tbody").innerHTML = `<tr><td colspan="7" class="dim" style="text-align:center;">يرجى اختيار المستودع لبدء الجرد</td></tr>`;
  document.getElementById("count-notes").value = "";
  document.getElementById("count-error").classList.add("hidden");
  openModal("count-modal");
};

window.savePhysicalCount = async () => {
  const errEl = document.getElementById("count-error"); errEl.classList.add("hidden");
  
  const whId = document.getElementById("count-wh").value;
  const date = document.getElementById("count-date").value;
  const type = document.getElementById("count-type").value;
  
  if (!whId || !date) { errEl.textContent = "الرجاء تحديد التاريخ والمستودع"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-count-btn"); btn.disabled = true;

  try {
    let totalLoss = 0;
    let totalGain = 0;
    const items = activeCountProducts.map(p => {
      const diff = p.actualQty - p.bookQty;
      const diffCost = diff * p.cost;
      if (diffCost < 0) totalLoss += Math.abs(diffCost);
      else totalGain += diffCost;

      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        bookQty: p.bookQty,
        actualQty: p.actualQty,
        variance: diff,
        cost: p.cost,
        varianceCost: diffCost
      };
    });

    const countId = await create(COLS.physicalCounts(), {
      date, type,
      warehouseId: whId,
      warehouseName: warehouses.find(w=>w.id===whId)?.name,
      items,
      totalLoss,
      totalGain,
      notes: document.getElementById("count-notes").value.trim(),
      status: "posted"
    });

    // Accounting Entry
    // If deficit (totalLoss > 0): Dr. Inventory Variance Expense / Cr. Stock
    // If surplus (totalGain > 0): Dr. Stock / Cr. Inventory Variance Revenue
    const totalNetVariance = totalGain - totalLoss;

    const invAccObj = allAccounts.find(a => a.code === "120") || { id: "INV_STOCK", code: "120", name: "مخزون مستودع المواد الغذائية" };
    // Deficit Variance Expense: "506"
    // Surplus Variance Revenue: "406"
    const varLossAcc = allAccounts.find(a => a.code === "506") || { id: "VAR_LOSS", code: "506", name: "خسائر فروقات جرد مخزنية" };
    const varGainAcc = allAccounts.find(a => a.code === "406") || { id: "VAR_GAIN", code: "406", name: "أرباح وإيرادات تسويات جردية" };

    if (totalNetVariance < 0) { // Deficit
      await createJournalEntry({
        date,
        description: `قيد تسوية عجز جرد مستودع ${warehouses.find(w=>w.id===whId)?.name}`,
        sourceType: "physical_count",
        sourceId: countId,
        lines: [
          { accountId: varLossAcc.id, accountCode: varLossAcc.code, accountName: varLossAcc.name, debit: Math.abs(totalNetVariance), credit: 0, note: "إثبات عجز الجرد" },
          { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: 0, credit: Math.abs(totalNetVariance), note: "تخفيض المخزون بالفروق الفعيلة" }
        ]
      });
    } else if (totalNetVariance > 0) { // Surplus
      await createJournalEntry({
        date,
        description: `قيد تسوية زيادة جرد مستودع ${warehouses.find(w=>w.id===whId)?.name}`,
        sourceType: "physical_count",
        sourceId: countId,
        lines: [
          { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: totalNetVariance, credit: 0, note: "زيادة المخزون بالفروق الفعيلة" },
          { accountId: varGainAcc.id, accountCode: varGainAcc.code, accountName: varGainAcc.name, debit: 0, credit: totalNetVariance, note: "إثبات أرباح تسوية جردية" }
        ]
      });
    }

    showToast("تم اعتماد الجرد وترحيل القيود المحاسبية بنجاح", "success");
    closeModal("count-modal");
    await loadCounts();

  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.deleteCount = async (id) => {
  if (confirm("هل تريد بالتأكيد حذف سجل الجرد؟")) {
    try { await remove("physicalCounts", id); showToast("تم حذف الجرد", "success"); await loadCounts(); }
    catch(err) { showToast(err.message, "error"); }
  }
};

// ── Period Closings ──
window.openClosingModal = () => {
  document.getElementById("closing-error").classList.add("hidden");
  openModal("closing-modal");
};

window.submitPeriodClosing = async () => {
  const errEl = document.getElementById("closing-error"); errEl.classList.add("hidden");
  const month = document.getElementById("closing-month").value;

  if (!month) { errEl.textContent = "يرجى تحديد الشهر"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-closing-btn"); btn.disabled = true;
  try {
    // Write period closing entry in counters or settings collection
    await create(COLS.settings(), {
      type: "period_closing",
      period: month,
      closedAt: todayString(),
      status: "closed"
    });
    showToast(`تم إقفال الفترة المخزنية لـ ${month} بنجاح`, "success");
    closeModal("closing-modal");
  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};
