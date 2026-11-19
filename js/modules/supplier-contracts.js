// ============================================================
// IDHAM ERP — عقود واتفاقيات الموردين والخصومات السنوية
// Supplier Contracts, Rebates & Price Matrix Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allContracts = [];
let allSuppliers = [];
let allProducts = [];
let contractLines = [];

const todayStr = () => new Date().toISOString().slice(0, 10);
const nextYearStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-con-search" class="input" placeholder="🔍 بحث في العقود (الرقم / المورد)..." oninput="window.filterSupplierContracts(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-con-sup-filter" onchange="window.filterSupplierContracts()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="sup-con-status-filter" onchange="window.filterSupplierContracts()">
          <option value="">كل الحالات</option>
          <option value="active">🟢 ساري ونشط</option>
          <option value="expiring_soon">🟡 قارب على الانتهاء</option>
          <option value="expired">🔴 منتهي</option>
          <option value="terminated">⚪ ملغي</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierContractsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierContractModal()">+ إنشاء عقد توريد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Cards -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي العقود الموثقة</div>
          <div class="mono" id="sup-con-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">عقود سارية ونشطة</div>
          <div class="mono" id="sup-con-kpi-active" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قاربت على الانتهاء (30 يوم)</div>
          <div class="mono" id="sup-con-kpi-expiring" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي القيمة التقديرية</div>
          <div class="mono" id="sup-con-kpi-val" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Contracts Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العقد</th>
                <th>اسم المورد</th>
                <th style="width:95px;">تاريخ البدء</th>
                <th style="width:95px;">تاريخ الانتهاء</th>
                <th style="width:110px;">شروط السداد</th>
                <th style="width:110px; text-align:left;">الحد الائتماني</th>
                <th style="width:110px; text-align:left;">حافز الهدف %</th>
                <th style="width:95px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sup-con-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل عقود الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <div class="modal-overlay" id="sup-contract-modal">
      <div class="modal modal-lg" style="max-width:900px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-con-modal-title">➕ إنشاء عقد توريد جديد</h3>
          <button class="modal-close" onclick="closeModal('sup-contract-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-con-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المتعاقد معه *</label>
              <select id="sup-con-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ بداية العقد *</label>
              <input type="date" id="sup-con-start" class="input" value="${todayStr()}" />
            </div>
            <div class="form-group">
              <label>تاريخ نهاية العقد *</label>
              <input type="date" id="sup-con-end" class="input" value="${nextYearStr()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>شروط السداد المتفق عليها</label>
              <select id="sup-con-terms" class="input">
                <option value="آجل 30 يوم">آجل 30 يوم</option>
                <option value="آجل 45 يوم">آجل 45 يوم</option>
                <option value="آجل 60 يوم">آجل 60 يوم</option>
                <option value="نقدي عند الاستلام (COD)">نقدي عند الاستلام (COD)</option>
                <option value="دفعات ميسرة">دفعات ميسرة</option>
              </select>
            </div>
            <div class="form-group">
              <label>الحد الائتماني الممنوح (ر.س)</label>
              <input type="number" id="sup-con-credit-limit" class="input mono" placeholder="50000" min="0" />
            </div>
            <div class="form-group">
              <label>نسبة بونص تحقيق الهدف السنوي (Rebate %)</label>
              <input type="number" id="sup-con-rebate" class="input mono" placeholder="2.5" min="0" max="20" step="0.1" />
            </div>
          </div>

          <!-- Product Price Matrix -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 جدول الأصناف والأسعار المعتمدة بالعقد:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addSupplierContractLine()">+ إضافة صنف للعقد</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:110px;">سعر التوريد المتفق</th>
                  <th style="width:100px;">الكمية التقديرية</th>
                  <th style="width:110px; text-align:left;">الإجمالي التقديري</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="sup-con-lines-tbody"></tbody>
            </table>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>حالة العقد</label>
              <select id="sup-con-status" class="input">
                <option value="active">🟢 ساري ونشط</option>
                <option value="expiring_soon">🟡 قارب على الانتهاء</option>
                <option value="expired">🔴 منتهي</option>
                <option value="terminated">⚪ ملغي</option>
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات وشروط خاصة</label>
              <input type="text" id="sup-con-notes" class="input" placeholder="شروط التسليم للمستودع، فترات السماح، شروط التحميل..." />
            </div>
          </div>

          <div id="sup-con-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-contract-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierContract()">💾 حفظ العقد</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [contracts, sups, prods] = await Promise.all([
      getAll(COLS.supplierContracts ? COLS.supplierContracts() : "supplierContracts", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.products(), [orderBy("name")]).catch(() => [])
    ]);

    allContracts = contracts;
    allSuppliers = sups;
    allProducts = prods;

    populateSuppliersFilter();
    updateKPIs();
    renderContractsTable();
  } catch (e) {
    console.warn("Error loading supplier contracts data:", e);
  }
}

function updateKPIs() {
  const active = allContracts.filter(c => c.status === "active");
  const expiring = allContracts.filter(c => {
    if (c.status !== "active") return false;
    const end = new Date(c.endDate);
    const diff = (end - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  });
  const totalVal = allContracts.reduce((s, c) => s + (parseFloat(c.totalEstimatedValue) || 0), 0);

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("sup-con-kpi-total", allContracts.length);
  setT("sup-con-kpi-active", active.length);
  setT("sup-con-kpi-expiring", expiring.length);
  setT("sup-con-kpi-val", formatCurrency(totalVal));
}

function populateSuppliersFilter() {
  const f = document.getElementById("sup-con-sup-filter");
  const m = document.getElementById("sup-con-sup-id");
  const opts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + opts;
  if (m) m.innerHTML = `<option value="">-- اختر المورد --</option>` + opts;
}

function renderContractsTable(list = allContracts) {
  const tbody = document.getElementById("sup-con-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عقود توريد مسجلة</td></tr>`;
    return;
  }

  const statusBadges = {
    active: '<span class="badge good">ساري</span>',
    expiring_soon: '<span class="badge warn">قارب الانتهاء</span>',
    expired: '<span class="badge bad">منتهي</span>',
    terminated: '<span class="badge neutral">ملغي</span>'
  };

  tbody.innerHTML = list.map(c => `
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${c.contractNumber || c.number || c.id}</td>
      <td class="font-bold">${c.supplierName}</td>
      <td class="mono dim">${c.startDate || "—"}</td>
      <td class="mono dim">${c.endDate || "—"}</td>
      <td><span class="badge neutral">${c.paymentTerms || "آجل 30 يوم"}</span></td>
      <td class="mono font-bold" style="text-align:left;">${(c.creditLimit||0) > 0 ? formatCurrency(c.creditLimit) : "—"}</td>
      <td class="mono font-bold" style="text-align:left; color:#10B981;">${(c.rebatePct||0) > 0 ? `${c.rebatePct}%` : "—"}</td>
      <td style="text-align:center;">${statusBadges[c.status] || statusBadges.active}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.printOfficialSupplierContract('${c.id}')" title="طباعة العقد الرسمي">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.renewSupplierContract('${c.id}')" title="تجديد لسنة جديدة">🔄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierContract('${c.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierContract('${c.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderContractLinesTable() {
  const tbody = document.getElementById("sup-con-lines-tbody");
  if (!tbody) return;

  if (!contractLines.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف مضافة للعقد بعد. انقر على "+ إضافة صنف للعقد"</td></tr>`;
    return;
  }

  tbody.innerHTML = contractLines.map((line, idx) => `
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updateSupplierContractLine(${idx}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${allProducts.map(p => `<option value="${p.id}" ${p.id === line.productId ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${line.unit || "كرتون"}" onchange="window.updateSupplierContractLine(${idx}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.unitPrice || ""}" placeholder="0.00" min="0" step="0.5" oninput="window.updateSupplierContractLine(${idx}, 'unitPrice', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.qty || ""}" placeholder="100" min="1" oninput="window.updateSupplierContractLine(${idx}, 'qty', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${formatCurrency((line.unitPrice || 0) * (line.qty || 0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeSupplierContractLine(${idx})">✕</button>
      </td>
    </tr>
  `).join("");
}

function setupGlobalFunctions() {
  window.filterSupplierContracts = () => {
    const q = (document.getElementById("sup-con-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("sup-con-sup-filter")?.value || "";
    const st = document.getElementById("sup-con-status-filter")?.value || "";

    const filtered = allContracts.filter(c => {
      const mQ = !q || (c.contractNumber || "").toLowerCase().includes(q) || (c.supplierName || "").toLowerCase().includes(q);
      const mS = !supId || c.supplierId === supId;
      const mSt = !st || c.status === st;
      return mQ && mS && mSt;
    });

    renderContractsTable(filtered);
  };

  window.openSupplierContractModal = () => {
    document.getElementById("sup-con-edit-id").value = "";
    document.getElementById("sup-con-modal-title").textContent = "➕ إنشاء عقد توريد جديد";
    document.getElementById("sup-con-sup-id").value = "";
    document.getElementById("sup-con-start").value = todayStr();
    document.getElementById("sup-con-end").value = nextYearStr();
    document.getElementById("sup-con-terms").value = "آجل 30 يوم";
    document.getElementById("sup-con-credit-limit").value = "";
    document.getElementById("sup-con-rebate").value = "";
    document.getElementById("sup-con-status").value = "active";
    document.getElementById("sup-con-notes").value = "";
    document.getElementById("sup-con-modal-err").classList.add("hidden");
    contractLines = [];
    renderContractLinesTable();
    openModal("sup-contract-modal");
  };

  window.addSupplierContractLine = () => {
    contractLines.push({ productId: "", productName: "", unit: "كرتون", unitPrice: 0, qty: 100 });
    renderContractLinesTable();
  };

  window.updateSupplierContractLine = (idx, field, val) => {
    if (!contractLines[idx]) return;
    if (field === "productId") {
      const p = allProducts.find(x => x.id === val);
      contractLines[idx].productId = val;
      contractLines[idx].productName = p ? p.name : "";
      contractLines[idx].unit = p ? (p.unit || "كرتون") : "كرتون";
      contractLines[idx].unitPrice = p ? (p.costPrice || p.purchasePrice || 0) : 0;
    } else if (field === "unitPrice" || field === "qty") {
      contractLines[idx][field] = parseFloat(val) || 0;
    } else {
      contractLines[idx][field] = val;
    }
    renderContractLinesTable();
  };

  window.removeSupplierContractLine = (idx) => {
    contractLines.splice(idx, 1);
    renderContractLinesTable();
  };

  window.saveSupplierContract = async () => {
    const err = document.getElementById("sup-con-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("sup-con-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const editId = document.getElementById("sup-con-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد المتعاقد معه"; err.classList.remove("hidden"); return; }

    const num = editId ? undefined : `SCNT-${new Date().getFullYear()}-${String(allContracts.length + 1).padStart(4, "0")}`;
    const totalEst = contractLines.reduce((s, l) => s + ((l.unitPrice || 0) * (l.qty || 0)), 0);

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      startDate: document.getElementById("sup-con-start").value,
      endDate: document.getElementById("sup-con-end").value,
      paymentTerms: document.getElementById("sup-con-terms").value,
      creditLimit: parseFloat(document.getElementById("sup-con-credit-limit").value) || 0,
      rebatePct: parseFloat(document.getElementById("sup-con-rebate").value) || 0,
      status: document.getElementById("sup-con-status").value,
      notes: document.getElementById("sup-con-notes").value.trim(),
      totalEstimatedValue: totalEst,
      lines: contractLines
    };

    if (num) data.contractNumber = num;

    try {
      if (editId) {
        await update("supplierContracts", editId, data);
      } else {
        await create("supplierContracts", data);
      }
      closeModal("sup-contract-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editSupplierContract = (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;

    document.getElementById("sup-con-edit-id").value = c.id;
    document.getElementById("sup-con-modal-title").textContent = "✏️ تعديل عقد التوريد: " + (c.contractNumber || c.id);
    document.getElementById("sup-con-sup-id").value = c.supplierId || "";
    document.getElementById("sup-con-start").value = c.startDate || todayStr();
    document.getElementById("sup-con-end").value = c.endDate || nextYearStr();
    document.getElementById("sup-con-terms").value = c.paymentTerms || "آجل 30 يوم";
    document.getElementById("sup-con-credit-limit").value = c.creditLimit || "";
    document.getElementById("sup-con-rebate").value = c.rebatePct || "";
    document.getElementById("sup-con-status").value = c.status || "active";
    document.getElementById("sup-con-notes").value = c.notes || "";
    contractLines = c.lines || [];
    renderContractLinesTable();
    openModal("sup-contract-modal");
  };

  window.renewSupplierContract = async (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`هل تريد تجديد عقد المورد "${c.supplierName}" لسنة ميلادية جديدة؟`)) return;

    try {
      const newStart = todayStr();
      const newEnd = nextYearStr();
      const newNum = `SCNT-${new Date().getFullYear()}-${String(allContracts.length + 1).padStart(4, "0")}`;

      const renewed = {
        ...c,
        contractNumber: newNum,
        startDate: newStart,
        endDate: newEnd,
        status: "active",
        notes: `تجديد للعقد السابق (${c.contractNumber || c.id})`
      };
      delete renewed.id;

      await create("supplierContracts", renewed);
      await loadData();
      alert("✅ تم تجديد العقد بنجاح برقم: " + newNum);
    } catch (e) {
      alert("فشل التجديد: " + e.message);
    }
  };

  window.deleteSupplierContract = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا العقد؟")) return;
    try {
      await remove("supplierContracts", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.printOfficialSupplierContract = (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;

    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", crNumber: "1010000000", vatNumber: "310000000000003" };
    const win = window.open("", "_blank");

    win.document.write(`
      <html dir="rtl">
        <head>
          <title>عقد توريد مواد غذائية - ${c.contractNumber || c.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .party-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
            th { background: #f1f5f9; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">عقد اتفاق وتوريد مواد غذائية</h2>
            <div style="font-size:13px; color:#475569; margin-top:6px;">رقم العقد: <b>${c.contractNumber || c.id}</b> | التاريخ: ${c.startDate || todayStr()}</div>
          </div>

          <p>إنه في يوم الموافق <b>${c.startDate || todayStr()}</b> تم الاتفاق والتراضي بين كل من:</p>

          <div class="party-box">
            <b>الطرف الأول (المشتري):</b> ${co.name} — س.ت: ${co.crNumber || "—"} — ر.ض: ${co.vatNumber || "—"}<br>
            <b>الطرف الثاني (المورد):</b> ${c.supplierName}
          </div>

          <h4>البند الأول: موضوع العقد والأسعار المعتمدة</h4>
          <p>يلتزم الطرف الثاني بتوريد الأصناف والمواد الغذائية للطرف الأول وفقاً للأسعار والمواصفات المحددة في الجدول التالي:</p>

          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>اسم الصنف</th>
                <th>الوحدة</th>
                <th>سعر التوريد المعتمد</th>
                <th>الكمية التقديرية</th>
                <th>الإجمالي التقديري</th>
              </tr>
            </thead>
            <tbody>
              ${(c.lines || []).map((l, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><b>${l.productName || l.name}</b></td>
                  <td>${l.unit || "كرتون"}</td>
                  <td>${formatCurrency(l.unitPrice || 0)}</td>
                  <td>${l.qty || "—"}</td>
                  <td>${formatCurrency((l.unitPrice || 0) * (l.qty || 0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h4>البند الثاني: مدة العقد وشروط السداد</h4>
          <p>• مدة هذا العقد سنة ميلادية تبدأ من <b>${c.startDate}</b> وتنتهي في <b>${c.endDate}</b> وتجدد باتفاق الطرفين.</p>
          <p>• شروط السداد المتفق عليها: <b>${c.paymentTerms || "آجل 30 يوم"}</b> مع حد ائتماني قدره <b>${formatCurrency(c.creditLimit || 0)}</b>.</p>
          ${c.rebatePct ? `<p>• يمنح الطرف الثاني الطرف الأول بونص وحافز تحقيق هدف سنوي بنسبة <b>${c.rebatePct}%</b> عند تحقيق المستهدف.</p>` : ""}

          <div class="signatures">
            <div>
              <div>عن الطرف الأول (المشتري)</div>
              <div><b>${co.name}</b></div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
            <div>
              <div>عن الطرف الثاني (المورد)</div>
              <div><b>${c.supplierName}</b></div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  window.exportSupplierContractsExcel = () => {
    const rows = allContracts.map(c => ({
      "رقم العقد": c.contractNumber || c.id,
      "اسم المورد": c.supplierName,
      "تاريخ البدء": c.startDate,
      "تاريخ الانتهاء": c.endDate,
      "شروط السداد": c.paymentTerms,
      "الحد الائتماني": c.creditLimit || 0,
      "حافز الهدف %": c.rebatePct || 0,
      "الحالة": c.status,
      "القيمة التقديرية": c.totalEstimatedValue || 0
    }));
    exportToExcel(rows, "عقود_الموردين");
  };
}
