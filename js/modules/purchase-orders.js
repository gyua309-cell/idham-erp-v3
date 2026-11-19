// ============================================================
// IDHAM ERP — أوامر الشراء الرسمية للموردين
// Official Purchase Orders (PO) & Receiving Workflow Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allPOs = [];
let allSuppliers = [];
let allWarehouses = [];
let allProducts = [];
let poLines = [];

const todayStr = () => new Date().toISOString().slice(0, 10);
const nextWeekStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="po-search" class="input" placeholder="🔍 بحث في أوامر الشراء (PO)..." oninput="window.filterPOs(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="po-sup-filter" onchange="window.filterPOs()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="po-status-filter" onchange="window.filterPOs()">
          <option value="">كل الحالات</option>
          <option value="sent">📨 تم الإرسال للمورد</option>
          <option value="draft">📝 مسودة</option>
          <option value="received">✅ تم الاستلام والفوترة</option>
          <option value="cancelled">❌ ملغي</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportPOsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openPOModal()">+ إنشاء أمر شراء رسمي (PO)</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي أوامر الشراء</div>
          <div class="mono" id="po-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(59,130,246,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">أوامر مرسلة بانتظار التوريد</div>
          <div class="mono" id="po-kpi-sent" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">تم استلامها وفلترتها</div>
          <div class="mono" id="po-kpi-received" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي قيمة الأوامر النشطة</div>
          <div class="mono" id="po-kpi-val" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- PO Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم الأمر (PO)</th>
                <th>المورد</th>
                <th style="width:95px;">تاريخ الطلب</th>
                <th style="width:95px;">تاريخ التوريد المتوقع</th>
                <th>المستودع المستلم</th>
                <th style="width:70px; text-align:center;">الأصناف</th>
                <th style="width:120px; text-align:left;">إجمالي القيمة</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:150px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="po-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل أوامر الشراء...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PO Modal -->
    <div class="modal-overlay" id="po-modal">
      <div class="modal modal-lg" style="max-width:900px;">
        <div class="modal-header">
          <h3 class="modal-title" id="po-modal-title">➕ إنشاء أمر شراء رسمي (PO)</h3>
          <button class="modal-close" onclick="closeModal('po-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="po-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المستهدف *</label>
              <select id="po-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ أمر الشراء *</label>
              <input type="date" id="po-date" class="input" value="${todayStr()}" />
            </div>
            <div class="form-group">
              <label>تاريخ التوريد المطلوب</label>
              <input type="date" id="po-delivery-date" class="input" value="${nextWeekStr()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المستودع المستلِم *</label>
              <select id="po-wh-id" class="input">
                <option value="">-- اختر المستودع --</option>
              </select>
            </div>
            <div class="form-group">
              <label>شروط الدفع</label>
              <input type="text" id="po-terms" class="input" placeholder="آجل 30 يوم / نقدي عند الاستلام" />
            </div>
            <div class="form-group">
              <label>حالة أمر الشراء</label>
              <select id="po-status" class="input">
                <option value="sent">📨 مرسل للمورد بانتظار التوريد</option>
                <option value="draft">📝 مسودة</option>
                <option value="received">✅ تم الاستلام والفوترة</option>
                <option value="cancelled">❌ ملغي</option>
              </select>
            </div>
          </div>

          <!-- Product Lines -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف والكميات المطلوبة:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addPOLine()">+ إضافة صنف</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:100px;">الكمية</th>
                  <th style="width:110px;">السعر التقديري</th>
                  <th style="width:110px; text-align:left;">الإجمالي</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="po-lines-tbody"></tbody>
            </table>
          </div>

          <div class="form-group">
            <label>ملاحظات التوريد والاشتراطات</label>
            <input type="text" id="po-notes" class="input" placeholder="اشتراطات درجة حرارة النقل، وقت وصول الشاحنة، اشتراطات التحميل..." />
          </div>

          <div id="po-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('po-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.savePO()">💾 حفظ أمر الشراء</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [pos, sups, whs, prods] = await Promise.all([
      getAll(COLS.purchaseOrders ? COLS.purchaseOrders() : "purchaseOrders", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.warehouses ? COLS.warehouses() : "warehouses", [orderBy("name")]).catch(() => []),
      getAll(COLS.products(), [orderBy("name")]).catch(() => [])
    ]);

    allPOs = pos;
    allSuppliers = sups;
    allWarehouses = whs;
    allProducts = prods;

    populateDropdowns();
    updateKPIs();
    renderPOTable();
  } catch (e) {
    console.warn("Error loading purchase orders data:", e);
  }
}

function updateKPIs() {
  const sent = allPOs.filter(p => p.status === "sent");
  const received = allPOs.filter(p => p.status === "received");
  const totalVal = sent.reduce((s, p) => s + (parseFloat(p.totalAmount) || 0), 0);

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("po-kpi-total", allPOs.length);
  setT("po-kpi-sent", sent.length);
  setT("po-kpi-received", received.length);
  setT("po-kpi-val", formatCurrency(totalVal));
}

function populateDropdowns() {
  const f = document.getElementById("po-sup-filter");
  const mSup = document.getElementById("po-sup-id");
  const kWh = document.getElementById("po-wh-id");

  const supOpts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + supOpts;
  if (mSup) mSup.innerHTML = `<option value="">-- اختر المورد --</option>` + supOpts;

  if (kWh) {
    kWh.innerHTML = `<option value="">-- اختر المستودع --</option>` +
      allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
  }
}

function renderPOTable(list = allPOs) {
  const tbody = document.getElementById("po-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد أوامر شراء مسجلة</td></tr>`;
    return;
  }

  const statusBadges = {
    sent: '<span class="badge" style="background:rgba(59,130,246,0.15); color:#3B82F6; font-weight:700;">📨 مرسل للمورد</span>',
    draft: '<span class="badge neutral">مسودة</span>',
    received: '<span class="badge good">✅ تم الاستلام</span>',
    cancelled: '<span class="badge bad">ملغي</span>'
  };

  tbody.innerHTML = list.map(p => `
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${p.poNumber || p.id}</td>
      <td class="font-bold">${p.supplierName}</td>
      <td class="mono dim">${p.date || "—"}</td>
      <td class="mono dim">${p.expectedDeliveryDate || "—"}</td>
      <td>${p.warehouseName || "المستودع الرئيسي"}</td>
      <td class="mono" style="text-align:center;">${(p.lines || []).length}</td>
      <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:13px;">${formatCurrency(p.totalAmount || 0)}</td>
      <td style="text-align:center;">${statusBadges[p.status] || statusBadges.draft}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.printOfficialPO('${p.id}')" title="طباعة أمر الشراء">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" style="color:#25D366;" onclick="window.sharePOWhatsApp('${p.id}')" title="إرسال عبر واتساب">💬</button>
          ${p.status !== "received" ? `
            <button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertPOToPurchaseInvoice('${p.id}')" title="⚡ تحويل لفاتورة مشتريات واستلام">⚡</button>
          ` : ""}
          <button class="btn btn-icon sm btn-ghost" onclick="window.editPO('${p.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deletePO('${p.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderPOLinesTable() {
  const tbody = document.getElementById("po-lines-tbody");
  if (!tbody) return;

  if (!poLines.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف. انقر على "+ إضافة صنف"</td></tr>`;
    return;
  }

  tbody.innerHTML = poLines.map((line, idx) => `
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updatePOLine(${idx}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${allProducts.map(p => `<option value="${p.id}" ${p.id === line.productId ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${line.unit || "كرتون"}" onchange="window.updatePOLine(${idx}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.qty || ""}" placeholder="100" min="1" oninput="window.updatePOLine(${idx}, 'qty', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.unitPrice || ""}" placeholder="0.00" min="0" step="0.5" oninput="window.updatePOLine(${idx}, 'unitPrice', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${formatCurrency((line.unitPrice || 0) * (line.qty || 0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePOLine(${idx})">✕</button>
      </td>
    </tr>
  `).join("");
}

function setupGlobalFunctions() {
  window.filterPOs = () => {
    const q = (document.getElementById("po-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("po-sup-filter")?.value || "";
    const st = document.getElementById("po-status-filter")?.value || "";

    const filtered = allPOs.filter(p => {
      const mQ = !q || (p.poNumber || "").toLowerCase().includes(q) || (p.supplierName || "").toLowerCase().includes(q);
      const mS = !supId || p.supplierId === supId;
      const mSt = !st || p.status === st;
      return mQ && mS && mSt;
    });

    renderPOTable(filtered);
  };

  window.openPOModal = () => {
    document.getElementById("po-edit-id").value = "";
    document.getElementById("po-modal-title").textContent = "➕ إنشاء أمر شراء رسمي (PO)";
    document.getElementById("po-sup-id").value = "";
    document.getElementById("po-date").value = todayStr();
    document.getElementById("po-delivery-date").value = nextWeekStr();
    document.getElementById("po-wh-id").value = allWarehouses[0]?.id || "";
    document.getElementById("po-terms").value = "آجل 30 يوم";
    document.getElementById("po-status").value = "sent";
    document.getElementById("po-notes").value = "";
    document.getElementById("po-modal-err").classList.add("hidden");
    poLines = [];
    renderPOLinesTable();
    openModal("po-modal");
  };

  window.addPOLine = () => {
    poLines.push({ productId: "", productName: "", unit: "كرتون", qty: 100, unitPrice: 0 });
    renderPOLinesTable();
  };

  window.updatePOLine = (idx, field, val) => {
    if (!poLines[idx]) return;
    if (field === "productId") {
      const p = allProducts.find(x => x.id === val);
      poLines[idx].productId = val;
      poLines[idx].productName = p ? p.name : "";
      poLines[idx].unit = p ? (p.unit || "كرتون") : "كرتون";
      poLines[idx].unitPrice = p ? (p.costPrice || p.purchasePrice || 0) : 0;
    } else if (field === "unitPrice" || field === "qty") {
      poLines[idx][field] = parseFloat(val) || 0;
    } else {
      poLines[idx][field] = val;
    }
    renderPOLinesTable();
  };

  window.removePOLine = (idx) => {
    poLines.splice(idx, 1);
    renderPOLinesTable();
  };

  window.savePO = async () => {
    const err = document.getElementById("po-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("po-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const whId = document.getElementById("po-wh-id").value;
    const wh = allWarehouses.find(w => w.id === whId);
    const editId = document.getElementById("po-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }
    if (!poLines.length) { err.textContent = "يرجى إضافة صنف واحد على الأقل"; err.classList.remove("hidden"); return; }

    const num = editId ? undefined : `PO-${new Date().getFullYear()}-${String(allPOs.length + 1).padStart(4, "0")}`;
    const total = poLines.reduce((s, l) => s + ((l.unitPrice || 0) * (l.qty || 0)), 0);

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      supplierPhone: sup ? sup.phone : "",
      date: document.getElementById("po-date").value,
      expectedDeliveryDate: document.getElementById("po-delivery-date").value,
      warehouseId: whId || null,
      warehouseName: wh ? wh.name : "المستودع الرئيسي",
      paymentTerms: document.getElementById("po-terms").value.trim(),
      status: document.getElementById("po-status").value,
      notes: document.getElementById("po-notes").value.trim(),
      totalAmount: total,
      lines: poLines
    };

    if (num) data.poNumber = num;

    try {
      if (editId) {
        await update("purchaseOrders", editId, data);
      } else {
        await create("purchaseOrders", data);
      }
      closeModal("po-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editPO = (id) => {
    const p = allPOs.find(x => x.id === id);
    if (!p) return;

    document.getElementById("po-edit-id").value = p.id;
    document.getElementById("po-modal-title").textContent = "✏️ تعديل أمر الشراء: " + (p.poNumber || p.id);
    document.getElementById("po-sup-id").value = p.supplierId || "";
    document.getElementById("po-date").value = p.date || todayStr();
    document.getElementById("po-delivery-date").value = p.expectedDeliveryDate || nextWeekStr();
    document.getElementById("po-wh-id").value = p.warehouseId || "";
    document.getElementById("po-terms").value = p.paymentTerms || "";
    document.getElementById("po-status").value = p.status || "sent";
    document.getElementById("po-notes").value = p.notes || "";
    poLines = p.lines || [];
    renderPOLinesTable();
    openModal("po-modal");
  };

  window.convertPOToPurchaseInvoice = async (id) => {
    const p = allPOs.find(x => x.id === id);
    if (!p) return;

    if (!confirm(`هل تريد تحويل أمر الشراء "${p.poNumber || p.id}" إلى فاتورة مشتريات معتمدة بعد استلام الشحنة؟`)) return;

    // Update status to received
    await update("purchaseOrders", id, { status: "received" }).catch(() => {});

    if (window.navigate) {
      window.navigate("purchase-invoices");
      setTimeout(() => {
        if (typeof window.openNewPurchaseModal === "function") {
          window.openNewPurchaseModal(p.supplierId, p.supplierName, p.lines);
        }
      }, 350);
    }
  };

  window.sharePOWhatsApp = (id) => {
    const p = allPOs.find(x => x.id === id);
    if (!p) return;

    const clean = (p.supplierPhone || "").replace(/[^0-9]/g, "");
    const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
    const co = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";

    const itemsSummary = (p.lines || []).map(l => `• ${l.productName || l.name}: ${l.qty} ${l.unit || 'كرتون'}`).join("\n");

    const msg = `السادة المحترمون / ${p.supplierName}\nتحية طيبة من ${co} 🌿\n\nنرفق لكم أمر الشراء الرسمي رقم (${p.poNumber || p.id}):\n• تاريخ التوريد المطلوب: ${p.expectedDeliveryDate || "عاجل"}\n• المستودع المستلم: ${p.warehouseName || "المستودع الرئيسي"}\n• إجمالي القيمة: ${formatCurrency(p.totalAmount)}\n\nالأصناف المطلوبة:\n${itemsSummary}\n\nنرجو تأكيد الاستلام وموعد خروج الشاحنة.`;

    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.printOfficialPO = (id) => {
    const p = allPOs.find(x => x.id === id);
    if (!p) return;

    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", crNumber: "1010000000", vatNumber: "310000000000003" };
    const win = window.open("", "_blank");

    win.document.write(`
      <html dir="rtl">
        <head>
          <title>أمر شراء رسمي - ${p.poNumber || p.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 24px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13.5px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
            th { background: #f1f5f9; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 50px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">${co.name}</h2>
            <div style="font-size:12px; color:#666;">س.ت: ${co.crNumber || "—"} | الرقم الضريبي: ${co.vatNumber || "—"}</div>
            <h3 style="margin-top:12px; color:#4338CA;">أمر شراء رسمي (Purchase Order)</h3>
            <div style="font-size:13px; font-weight:bold;">رقم الأمر: ${p.poNumber || p.id} | التاريخ: ${p.date || todayStr()}</div>
          </div>

          <div class="box">
            <b>السادة / شركة:</b> ${p.supplierName}<br>
            <b>المستودع المستلم:</b> ${p.warehouseName || "المستودع الرئيسي"}<br>
            <b>تاريخ التوريد المتوقع:</b> ${p.expectedDeliveryDate || "—"}<br>
            <b>شروط السداد:</b> ${p.paymentTerms || "آجل"}
          </div>

          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>الصنف والمواصفات</th>
                <th>الوحدة</th>
                <th style="text-align:center;">الكمية المطلوبة</th>
                <th style="text-align:left;">السعر المتفق عليه</th>
                <th style="text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${(p.lines || []).map((l, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><b>${l.productName || l.name}</b></td>
                  <td>${l.unit || "كرتون"}</td>
                  <td style="text-align:center;"><b>${l.qty}</b></td>
                  <td style="text-align:left;">${formatCurrency(l.unitPrice || 0)}</td>
                  <td style="text-align:left;"><b>${formatCurrency((l.unitPrice || 0) * (l.qty || 0))}</b></td>
                </tr>
              `).join("")}
              <tr style="background:#f1f5f9; font-weight:bold;">
                <td colspan="5" style="text-align:center;">إجمالي أمر الشراء</td>
                <td style="text-align:left; color:#4338CA; font-size:14px;">${formatCurrency(p.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          ${p.notes ? `<p><b>ملاحظات التوريد:</b> ${p.notes}</p>` : ""}

          <div class="signatures">
            <div>
              <div>إدارة المشتريات / ${co.name}</div>
              <div class="sig-line">الاعتماد والتوقيع</div>
            </div>
            <div>
              <div>موافقة وتأكيد المورد / ${p.supplierName}</div>
              <div class="sig-line">الختم وتاريخ التوريد</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  window.deletePO = async (id) => {
    if (!confirm("هل أنت متأكد من حذف أمر الشراء هذا؟")) return;
    try {
      await remove("purchaseOrders", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportPOsExcel = () => {
    const rows = allPOs.map(p => ({
      "رقم الأمر": p.poNumber || p.id,
      "المورد": p.supplierName,
      "تاريخ الطلب": p.date,
      "تاريخ التوريد المتوقع": p.expectedDeliveryDate,
      "المستودع": p.warehouseName,
      "الحالة": p.status,
      "القيمة": p.totalAmount || 0
    }));
    exportToExcel(rows, "أوامر_الشراء_PO");
  };
}
