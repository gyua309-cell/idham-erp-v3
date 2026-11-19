// ============================================================
// IDHAM ERP — برنامج نقاط الولاء والمكافآت
// Customer Loyalty Points & Rewards Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allCustomers = [];
let allLoyaltyTx = [];
let activeTab = "customers"; // 'customers' | 'history' | 'settings'

let loyaltySettings = {
  earnRate: 10,       // 10 points per 100 SAR sales (1 point per 10 SAR)
  redeemRate: 0.5,    // 1 point = 0.50 SAR discount (100 points = 50 SAR)
  minRedeemPoints: 50
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="loy-search" class="input" placeholder="🔍 بحث عن عميل..." oninput="window.filterLoyalty(this.value)" />
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-primary btn-sm" id="loy-tab-custs" onclick="window.switchLoyaltyTab('customers')">👥 أرصدة العملاء</button>
        <button class="btn btn-secondary btn-sm" id="loy-tab-hist" onclick="window.switchLoyaltyTab('history')">📜 سجل الحركات</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.openLoyaltyAdjustModal()">🎁 منح نقاط بونص / تسوية</button>
        <button class="btn btn-secondary" onclick="window.exportLoyaltyExcel()">📊 Excel</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي النقاط النشطة</div>
          <div class="mono" id="loy-kpi-active" style="font-size:22px; font-weight:900; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">القيمة المالية المتاحة للخصم</div>
          <div class="mono" id="loy-kpi-val" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(59,130,246,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">إجمالي النقاط المكتسبة</div>
          <div class="mono" id="loy-kpi-earned" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">النقاط المستبدلة بخصومات</div>
          <div class="mono" id="loy-kpi-redeemed" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="loy-content-area"></div>
    </div>

    <!-- Adjust / Redeem Modal -->
    <div class="modal-overlay" id="loyalty-modal">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <h3 class="modal-title" id="loy-modal-title">🎁 منح نقاط ولاء / تسوية</h3>
          <button class="modal-close" onclick="closeModal('loyalty-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="form-group mb-12">
            <label>العميل *</label>
            <select id="loy-modal-cust" class="input">
              <option value="">-- اختر العميل --</option>
            </select>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="loy-modal-type" class="input" onchange="window.onLoyTypeChange()">
                <option value="bonus">🎁 إضافة نقاط بونص ومكافأة</option>
                <option value="redeem">💸 استبدال نقاط بخصم نقدي</option>
                <option value="adjustment">⚖️ تسوية رصيد نقاط</option>
              </select>
            </div>
            <div class="form-group">
              <label>عدد النقاط *</label>
              <input type="number" id="loy-modal-points" class="input mono" placeholder="100" min="1" oninput="window.updateLoyValPreview()" />
            </div>
          </div>

          <div id="loy-val-preview" style="background:rgba(99,102,241,0.06); padding:10px 14px; border-radius:8px; margin-bottom:12px; font-size:12.5px; color:var(--brand); font-weight:700;">
            القيمة المعادلة: 0.00 ر.س
          </div>

          <div class="form-group">
            <label>البيان / سبب المنح أو الاستبدال *</label>
            <input type="text" id="loy-modal-notes" class="input" placeholder="مثال: مكافأة سداد نقدي مبكر..." />
          </div>

          <div id="loy-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('loyalty-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveLoyaltyTx()">💾 تأكيد وحفظ</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [custs, txs] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.loyaltyTransactions ? COLS.loyaltyTransactions() : "loyaltyTransactions", [orderBy("date", "desc")]).catch(() => [])
    ]);

    allCustomers = custs;
    allLoyaltyTx = txs;

    populateCustomerModal();
    updateKPIs();
    renderTabContent();
  } catch (e) {
    console.warn("Failed to load loyalty data:", e);
  }
}

function updateKPIs() {
  const totalEarned = allCustomers.reduce((s, c) => s + (parseInt(c.loyaltyPointsEarned) || parseInt(c.loyaltyPoints) || 0), 0);
  const totalRedeemed = allCustomers.reduce((s, c) => s + (parseInt(c.loyaltyPointsRedeemed) || 0), 0);
  const activePoints = allCustomers.reduce((s, c) => s + (parseInt(c.loyaltyPoints) || 0), 0);
  const monetaryVal = activePoints * loyaltySettings.redeemRate;

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("loy-kpi-active", activePoints.toLocaleString());
  setT("loy-kpi-val", formatCurrency(monetaryVal));
  setT("loy-kpi-earned", totalEarned.toLocaleString());
  setT("loy-kpi-redeemed", totalRedeemed.toLocaleString());
}

function populateCustomerModal() {
  const sel = document.getElementById("loy-modal-cust");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- اختر العميل --</option>` +
    allCustomers.map(c => `<option value="${c.id}">${c.name} (رصيده: ${c.loyaltyPoints || 0} نقطة)</option>`).join("");
}

function renderTabContent(list = allCustomers) {
  const container = document.getElementById("loy-content-area");
  if (!container) return;

  if (activeTab === "customers") {
    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th style="text-align:left;">إجمالي النقاط المكتسبة</th>
                <th style="text-align:left;">النقاط المستبدلة</th>
                <th style="text-align:left;">رصيد النقاط الحالي</th>
                <th style="text-align:left;">القيمة بالريال</th>
                <th style="text-align:center;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => {
                const pts = parseInt(c.loyaltyPoints) || 0;
                const earned = parseInt(c.loyaltyPointsEarned) || pts;
                const redeemed = parseInt(c.loyaltyPointsRedeemed) || 0;
                const val = pts * loyaltySettings.redeemRate;
                return `
                  <tr>
                    <td class="font-bold">${c.name}</td>
                    <td class="mono dim">${c.phone || "—"}</td>
                    <td>${c.zone || "—"}</td>
                    <td>${c.repName || "—"}</td>
                    <td class="mono" style="text-align:left;">${earned.toLocaleString()}</td>
                    <td class="mono" style="text-align:left; color:#F59E0B;">${redeemed.toLocaleString()}</td>
                    <td class="mono font-bold" style="text-align:left; font-size:14px; color:var(--brand);">${pts.toLocaleString()}</td>
                    <td class="mono font-bold" style="text-align:left; color:#10B981;">${formatCurrency(val)}</td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary btn-sm" onclick="window.quickRewardCustomer('${c.id}')" style="font-size:11px; padding:3px 8px;">
                        🎁 مكافأة
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
              ${!list.length ? `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا يوجد عملاء</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:105px;">التاريخ</th>
                <th>العميل</th>
                <th>نوع الحركة</th>
                <th style="text-align:left;">النقاط</th>
                <th style="text-align:left;">القيمة المعادلة</th>
                <th>البيان والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${allLoyaltyTx.map(t => {
                const isAdd = t.points > 0;
                return `
                  <tr>
                    <td class="mono dim">${t.date || "—"}</td>
                    <td class="font-semibold">${t.customerName}</td>
                    <td>
                      <span class="badge ${isAdd ? 'good' : 'warn'}">
                        ${t.type === 'bonus' ? '🎁 مكافأة بونص' : (t.type === 'invoice' ? '🧾 شراء فاتورة' : '💸 استبدال خصم')}
                      </span>
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:${isAdd ? 'var(--good)' : '#F59E0B'};">
                      ${isAdd ? '+' : ''}${t.points}
                    </td>
                    <td class="mono" style="text-align:left;">${formatCurrency(Math.abs(t.points) * loyaltySettings.redeemRate)}</td>
                    <td style="font-size:12px; color:var(--text-2);">${t.notes || "—"}</td>
                  </tr>
                `;
              }).join("")}
              ${!allLoyaltyTx.length ? `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات نقاط مسجلة</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

function setupGlobalFunctions() {
  window.switchLoyaltyTab = (tab) => {
    activeTab = tab;
    document.getElementById("loy-tab-custs")?.classList.toggle("btn-primary", tab === "customers");
    document.getElementById("loy-tab-custs")?.classList.toggle("btn-secondary", tab !== "customers");
    document.getElementById("loy-tab-hist")?.classList.toggle("btn-primary", tab === "history");
    document.getElementById("loy-tab-hist")?.classList.toggle("btn-secondary", tab !== "history");
    renderTabContent();
  };

  window.filterLoyalty = (q) => {
    q = (q || "").trim().toLowerCase();
    const filtered = allCustomers.filter(c => 
      !q || (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
    renderTabContent(filtered);
  };

  window.openLoyaltyAdjustModal = (prefilledCustId = "") => {
    document.getElementById("loy-modal-cust").value = prefilledCustId;
    document.getElementById("loy-modal-type").value = "bonus";
    document.getElementById("loy-modal-points").value = "100";
    document.getElementById("loy-modal-notes").value = "";
    document.getElementById("loy-modal-err").classList.add("hidden");
    window.updateLoyValPreview();
    openModal("loyalty-modal");
  };

  window.quickRewardCustomer = (custId) => {
    window.openLoyaltyAdjustModal(custId);
  };

  window.updateLoyValPreview = () => {
    const pts = parseFloat(document.getElementById("loy-modal-points")?.value) || 0;
    const val = pts * loyaltySettings.redeemRate;
    const el = document.getElementById("loy-val-preview");
    if (el) el.textContent = `القيمة المعادلة: ${formatCurrency(val)}`;
  };

  window.saveLoyaltyTx = async () => {
    const err = document.getElementById("loy-modal-err");
    err.classList.add("hidden");

    const custId = document.getElementById("loy-modal-cust").value;
    const cust = allCustomers.find(c => c.id === custId);
    let pts = parseInt(document.getElementById("loy-modal-points").value) || 0;
    const type = document.getElementById("loy-modal-type").value;
    const notes = document.getElementById("loy-modal-notes").value.trim();

    if (!custId) { err.textContent = "يرجى اختيار العميل"; err.classList.remove("hidden"); return; }
    if (pts <= 0) { err.textContent = "الرجاء إدخال عدد نقاط أكبر من 0"; err.classList.remove("hidden"); return; }
    if (!notes) { err.textContent = "الرجاء كتابة البيان وسبب الحركة"; err.classList.remove("hidden"); return; }

    const curPoints = parseInt(cust.loyaltyPoints) || 0;
    let delta = pts;
    if (type === "redeem") {
      if (pts > curPoints) {
        err.textContent = `رصيد نقاط العميل (${curPoints}) غير كافٍ للاستبدال`;
        err.classList.remove("hidden");
        return;
      }
      delta = -pts;
    }

    const newBal = curPoints + delta;
    const newEarned = (parseInt(cust.loyaltyPointsEarned) || curPoints) + (delta > 0 ? delta : 0);
    const newRedeemed = (parseInt(cust.loyaltyPointsRedeemed) || 0) + (delta < 0 ? Math.abs(delta) : 0);

    try {
      // 1. Create transaction log
      await create("loyaltyTransactions", {
        customerId: custId,
        customerName: cust.name,
        date: todayStr(),
        type: type,
        points: delta,
        notes: notes
      });

      // 2. Update customer balance
      await update("customers", custId, {
        loyaltyPoints: newBal,
        loyaltyPointsEarned: newEarned,
        loyaltyPointsRedeemed: newRedeemed
      });

      cust.loyaltyPoints = newBal;
      cust.loyaltyPointsEarned = newEarned;
      cust.loyaltyPointsRedeemed = newRedeemed;

      closeModal("loyalty-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.exportLoyaltyExcel = () => {
    const data = allCustomers.map(c => ({
      "العميل": c.name,
      "الهاتف": c.phone,
      "المنطقة": c.zone,
      "النقاط المكتسبة": c.loyaltyPointsEarned || c.loyaltyPoints || 0,
      "النقاط المستبدلة": c.loyaltyPointsRedeemed || 0,
      "الرصيد الحالي": c.loyaltyPoints || 0,
      "القيمة المالية": (c.loyaltyPoints || 0) * loyaltySettings.redeemRate
    }));
    exportToExcel(data, "نقاط_ولاء_العملاء");
  };
}
