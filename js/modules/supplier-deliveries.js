// ============================================================
// IDHAM ERP — جدولة وتتبع شحنات ومواعيد تسليم الموردين
// Supplier Inbound Deliveries & Receiving Logistics Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allDeliveries = [];
let allSuppliers = [];
let allWarehouses = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="deliv-search" class="input" placeholder="🔍 بحث في الشحنات (المورد/السائق)..." oninput="window.filterDeliveries(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="deliv-sup-filter" onchange="window.filterDeliveries()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="deliv-status-filter" onchange="window.filterDeliveries()">
          <option value="">كل الحالات</option>
          <option value="today">🚚 شحنات اليوم</option>
          <option value="in_transit">🚛 في الطريق للمستودع</option>
          <option value="unloading">📦 قيد التفريغ والاستلام</option>
          <option value="scheduled">📅 مجدولة قادمة</option>
          <option value="received">✅ تم الاستلام بالكامل</option>
          <option value="delayed">⚠️ متأخرة</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportDeliveriesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openDeliveryModal()">+ جدولة شحنة مورد جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الشحنات المجدولة</div>
          <div class="mono" id="deliv-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1.5px solid rgba(59,130,246,0.3); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">🚚 شحنات متوقع وصولها اليوم</div>
          <div class="mono" id="deliv-kpi-today" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">🚛 في الطريق / قيد التفريغ</div>
          <div class="mono" id="deliv-kpi-transit" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي الكراتين المتوقعة</div>
          <div class="mono" id="deliv-kpi-cartons" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 كرتون</div>
        </div>
      </div>

      <!-- Deliveries Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:105px;">رقم الشحنة</th>
                <th>المورد</th>
                <th style="width:95px;">تاريخ الوصول</th>
                <th style="width:85px;">الوقت</th>
                <th>المستودع المستلم</th>
                <th>الأصناف والكراتين</th>
                <th>بيانات السائق والشاحنة</th>
                <th style="width:115px; text-align:center;">الحالة</th>
                <th style="width:120px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="deliv-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل جدول شحنات الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delivery Modal -->
    <div class="modal-overlay" id="deliv-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="deliv-modal-title">➕ جدولة شحنة مورد جديدة</h3>
          <button class="modal-close" onclick="closeModal('deliv-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="deliv-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد صاحب الشحنة *</label>
              <select id="deliv-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ الوصول المتوقع *</label>
              <input type="date" id="deliv-date" class="input" value="${todayStr()}" />
            </div>
            <div class="form-group">
              <label>الوقت التقريبي</label>
              <input type="time" id="deliv-time" class="input" value="10:00" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المستودع المستلم *</label>
              <select id="deliv-wh-id" class="input">
                <option value="">-- اختر المستودع --</option>
              </select>
            </div>
            <div class="form-group">
              <label>عدد الكراتين / الطبالي التقديري</label>
              <input type="number" id="deliv-cartons" class="input mono" placeholder="500" min="1" />
            </div>
            <div class="form-group">
              <label>حالة الشحنة</label>
              <select id="deliv-status" class="input">
                <option value="scheduled">📅 مجدولة قادمة</option>
                <option value="in_transit">🚛 في الطريق للمستودع</option>
                <option value="unloading">📦 قيد التفريغ والفحص</option>
                <option value="received">✅ تم الاستلام والتخزين</option>
                <option value="delayed">⚠️ متأخرة</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>اسم السائق</label>
              <input type="text" id="deliv-driver-name" class="input" placeholder="محمد السائق" />
            </div>
            <div class="form-group">
              <label>جوال السائق</label>
              <input type="text" id="deliv-driver-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>رقم لوحة الشاحنة</label>
              <input type="text" id="deliv-truck-plate" class="input mono" placeholder="أ ب ج 1234" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>بيان الأصناف المشحونة</label>
            <input type="text" id="deliv-items" class="input" placeholder="مثال: 300 كرتون أرز بنجابي، 200 كرتون زيت ذرة..." />
          </div>

          <div class="form-group">
            <label>ملاحظات المستودع وتجهيز العمالة</label>
            <textarea id="deliv-notes" class="input" rows="2" placeholder="تجهيز رافعة شوكية، تفريغ في المستودع باحة B..."></textarea>
          </div>

          <div id="deliv-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('deliv-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveDelivery()">💾 حفظ الشحنة</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [delivs, sups, whs] = await Promise.all([
      getAll(COLS.supplierDeliveries ? COLS.supplierDeliveries() : "supplierDeliveries", [orderBy("expectedDate", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.warehouses ? COLS.warehouses() : "warehouses", [orderBy("name")]).catch(() => [])
    ]);

    allDeliveries = delivs;
    allSuppliers = sups;
    allWarehouses = whs;

    populateDropdowns();
    updateKPIs();
    renderDeliveriesTable();
  } catch (e) {
    console.warn("Error loading supplier deliveries:", e);
  }
}

function updateKPIs() {
  const today = todayStr();
  const todayDelivs = allDeliveries.filter(d => d.expectedDate === today && d.status !== "received");
  const inTransit = allDeliveries.filter(d => d.status === "in_transit" || d.status === "unloading");
  const totalCartons = allDeliveries.filter(d => d.status !== "received").reduce((s, d) => s + (parseInt(d.cartonsCount) || 0), 0);

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("deliv-kpi-total", allDeliveries.length);
  setT("deliv-kpi-today", todayDelivs.length);
  setT("deliv-kpi-transit", inTransit.length);
  setT("deliv-kpi-cartons", `${totalCartons} كرتون`);
}

function populateDropdowns() {
  const f = document.getElementById("deliv-sup-filter");
  const mSup = document.getElementById("deliv-sup-id");
  const kWh = document.getElementById("deliv-wh-id");

  const supOpts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + supOpts;
  if (mSup) mSup.innerHTML = `<option value="">-- اختر المورد --</option>` + supOpts;

  if (kWh) {
    kWh.innerHTML = `<option value="">-- اختر المستودع --</option>` +
      allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
  }
}

function renderDeliveriesTable(list = allDeliveries) {
  const tbody = document.getElementById("deliv-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد شحنات مجدولة مسجلة</td></tr>`;
    return;
  }

  const statusBadges = {
    scheduled: '<span class="badge neutral">📅 مجدولة</span>',
    in_transit: '<span class="badge warn">🚛 في الطريق</span>',
    unloading: '<span class="badge" style="background:rgba(99,102,241,0.15); color:var(--brand); font-weight:700;">📦 قيد التفريغ</span>',
    received: '<span class="badge good">✅ تم الاستلام</span>',
    delayed: '<span class="badge bad">⚠️ متأخرة</span>'
  };

  tbody.innerHTML = list.map(d => {
    const isToday = d.expectedDate === todayStr();
    return `
      <tr style="${isToday && d.status !== 'received' ? 'background:rgba(59,130,246,0.04);' : ''}">
        <td class="mono font-bold" style="color:var(--brand);">${d.shipmentNumber || d.id}</td>
        <td class="font-bold">${d.supplierName}</td>
        <td class="mono ${isToday ? 'font-bold text-brand' : 'dim'}">${d.expectedDate || "—"}${isToday ? ' (اليوم)' : ''}</td>
        <td class="mono dim">${d.expectedTime || "—"}</td>
        <td>${d.warehouseName || "المستودع الرئيسي"}</td>
        <td style="font-size:12px;">
          <div><b>${d.cartonsCount || 0}</b> كرتون</div>
          <div style="font-size:11px; color:var(--text-2);">${d.itemsSummary || "—"}</div>
        </td>
        <td style="font-size:12px;">
          <div>👤 ${d.driverName || "—"} ${d.driverPhone ? `<a href="tel:${d.driverPhone}" style="color:var(--brand); text-decoration:none;">(${d.driverPhone})</a>` : ''}</div>
          <div style="font-size:11px; color:var(--text-3);">🚛 لوحة: <b>${d.truckPlate || "—"}</b></div>
        </td>
        <td style="text-align:center;">${statusBadges[d.status] || statusBadges.scheduled}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            ${d.driverPhone ? `
              <button class="btn btn-icon sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${d.driverPhone.replace(/[^0-9]/g,'')}', '_blank')" title="واتساب السائق">💬</button>
            ` : ""}
            <button class="btn btn-icon sm btn-ghost" onclick="window.editDelivery('${d.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteDelivery('${d.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterDeliveries = () => {
    const q = (document.getElementById("deliv-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("deliv-sup-filter")?.value || "";
    const st = document.getElementById("deliv-status-filter")?.value || "";
    const today = todayStr();

    const filtered = allDeliveries.filter(d => {
      const mQ = !q || (d.shipmentNumber || "").toLowerCase().includes(q) || (d.supplierName || "").toLowerCase().includes(q) || (d.driverName || "").toLowerCase().includes(q) || (d.truckPlate || "").toLowerCase().includes(q);
      const mS = !supId || d.supplierId === supId;
      let mSt = true;
      if (st === "today") mSt = d.expectedDate === today;
      else if (st) mSt = d.status === st;
      return mQ && mS && mSt;
    });

    renderDeliveriesTable(filtered);
  };

  window.openDeliveryModal = () => {
    document.getElementById("deliv-edit-id").value = "";
    document.getElementById("deliv-modal-title").textContent = "➕ جدولة شحنة مورد جديدة";
    document.getElementById("deliv-sup-id").value = "";
    document.getElementById("deliv-date").value = todayStr();
    document.getElementById("deliv-time").value = "10:00";
    document.getElementById("deliv-wh-id").value = allWarehouses[0]?.id || "";
    document.getElementById("deliv-cartons").value = "300";
    document.getElementById("deliv-status").value = "scheduled";
    document.getElementById("deliv-driver-name").value = "";
    document.getElementById("deliv-driver-phone").value = "";
    document.getElementById("deliv-truck-plate").value = "";
    document.getElementById("deliv-items").value = "";
    document.getElementById("deliv-notes").value = "";
    document.getElementById("deliv-modal-err").classList.add("hidden");
    openModal("deliv-modal");
  };

  window.saveDelivery = async () => {
    const err = document.getElementById("deliv-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("deliv-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const whId = document.getElementById("deliv-wh-id").value;
    const wh = allWarehouses.find(w => w.id === whId);
    const editId = document.getElementById("deliv-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }

    const num = editId ? undefined : `SHP-${new Date().getFullYear()}-${String(allDeliveries.length + 1).padStart(4, "0")}`;

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      expectedDate: document.getElementById("deliv-date").value,
      expectedTime: document.getElementById("deliv-time").value,
      warehouseId: whId || null,
      warehouseName: wh ? wh.name : "المستودع الرئيسي",
      cartonsCount: parseInt(document.getElementById("deliv-cartons").value) || 0,
      status: document.getElementById("deliv-status").value,
      driverName: document.getElementById("deliv-driver-name").value.trim(),
      driverPhone: document.getElementById("deliv-driver-phone").value.trim(),
      truckPlate: document.getElementById("deliv-truck-plate").value.trim(),
      itemsSummary: document.getElementById("deliv-items").value.trim(),
      notes: document.getElementById("deliv-notes").value.trim()
    };

    if (num) data.shipmentNumber = num;

    try {
      if (editId) {
        await update("supplierDeliveries", editId, data);
      } else {
        await create("supplierDeliveries", data);
      }
      closeModal("deliv-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editDelivery = (id) => {
    const d = allDeliveries.find(x => x.id === id);
    if (!d) return;

    document.getElementById("deliv-edit-id").value = d.id;
    document.getElementById("deliv-modal-title").textContent = "✏️ تعديل شحنة المورد: " + (d.shipmentNumber || d.id);
    document.getElementById("deliv-sup-id").value = d.supplierId || "";
    document.getElementById("deliv-date").value = d.expectedDate || todayStr();
    document.getElementById("deliv-time").value = d.expectedTime || "10:00";
    document.getElementById("deliv-wh-id").value = d.warehouseId || "";
    document.getElementById("deliv-cartons").value = d.cartonsCount || "";
    document.getElementById("deliv-status").value = d.status || "scheduled";
    document.getElementById("deliv-driver-name").value = d.driverName || "";
    document.getElementById("deliv-driver-phone").value = d.driverPhone || "";
    document.getElementById("deliv-truck-plate").value = d.truckPlate || "";
    document.getElementById("deliv-items").value = d.itemsSummary || "";
    document.getElementById("deliv-notes").value = d.notes || "";
    document.getElementById("deliv-modal-err").classList.add("hidden");
    openModal("deliv-modal");
  };

  window.deleteDelivery = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشحنة؟")) return;
    try {
      await remove("supplierDeliveries", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportDeliveriesExcel = () => {
    const rows = allDeliveries.map(d => ({
      "رقم الشحنة": d.shipmentNumber || d.id,
      "المورد": d.supplierName,
      "تاريخ الوصول": d.expectedDate,
      "الوقت": d.expectedTime,
      "المستودع": d.warehouseName,
      "الكراتين": d.cartonsCount,
      "السائق": d.driverName,
      "الجوال": d.driverPhone,
      "اللوحة": d.truckPlate,
      "الحالة": d.status
    }));
    exportToExcel(rows, "جدول_شحنات_الموردين");
  };
}
