// Suppliers — Detailed Module with 360° Supplier Intelligence Hub & Maps
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, where, orderBy, limit, getDocs } from "../utils/db.js";
import { syncEntityToCoa, updateEntityInCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, debounce } from "../utils/formatters.js";
import { exportToExcel, importFromExcel, downloadTemplate } from "../utils/excel.js";
import { showRecordPreview, printRecord } from "../utils/record-actions.js";
import { syncSupplierNameEverywhere, syncSupplierBalanceToCoa } from "../utils/sync-engine.js";

let cachedSuppliers = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="search-bar" style="max-width:240px;"><input type="text" id="sup-search" class="input" placeholder="🔍  بحث في الموردين…" /></div>
      <div class="filter-select-group" style="max-width:180px;">
        <select id="sup-category-filter" class="input">
          <option value="">كل التصنيفات</option>
          <option value="rice">موردو الأرز</option>
          <option value="sugar_oil">موردو السكر والزيت</option>
          <option value="flour">موردو الدقيق والمواد الأساسية</option>
          <option value="services">موردو الخدمات (مرافق وإيجار)</option>
          <option value="other">موردون آخرون</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary" onclick="window.syncAllSuppliersBalances()" title="مزامنة وتحديث أرصدة الموردين مع القيود والفواتير"><span>🔄</span> مزامنة الأرصدة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الموردين')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportSuppliersExcel()" title="تصدير Excel"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openSupplierImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSupplierModal()">+ إضافة مورد</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">دليل الموردين</h1><p class="page-subtitle" id="sup-count"></p></div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense"><thead><tr><th>اسم المورد</th><th>الهاتف</th><th>الآيبان / البنك</th><th>الرصيد المستحق</th><th style="text-align:center;">الإجراءات</th></tr></thead>
          <tbody id="sup-tbody">${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(5).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
        </table></div></div>
    </div>
    
    <!-- Supplier Add/Edit Modal -->
    <div class="modal-overlay" id="supplier-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="sup-modal-title">إضافة مورد</h3><button class="modal-close" onclick="closeModal('supplier-modal')">×</button></div>
      <div class="modal-body" style="padding:20px;">
        <input type="hidden" id="sup-edit-id" />
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>اسم المورد *</label><input type="text" id="sup-name" class="input" placeholder="الاسم التجاري للمورد" /></div>
          <div class="form-group"><label>كود المورد</label><input type="text" id="sup-code" class="input mono" placeholder="SUP-001" /></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:16px;">
          <div class="form-group"><label>رقم الهاتف</label><input type="text" id="sup-phone" class="input mono" placeholder="05xxxxxxxx" /></div>
          <div class="form-group"><label>الرقم الضريبي (VAT)</label><input type="text" id="sup-vat" class="input mono" placeholder="3xxxxxxxxxxxxxx" /></div>
          <div class="form-group"><label>الهوية الوطنية / السجل التجاري</label><input type="text" id="sup-national-id" class="input mono" placeholder="رقم الهوية أو السجل" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>تصنيف المورد *</label>
            <select id="sup-category" class="input">
              <option value="other">موردون آخرون</option>
              <option value="rice">موردو الأرز</option>
              <option value="sugar_oil">موردو السكر والزيت</option>
              <option value="flour">موردو الدقيق والمواد الأساسية</option>
              <option value="services">موردو الخدمات (مرافق وإيجار)</option>
            </select>
          </div>
          <div class="form-group">
            <label>اسم البنك المعتمد</label>
            <input type="text" id="sup-bank" class="input" placeholder="مصرف الراجحي / الأهلي..." />
          </div>
          <div class="form-group">
            <label>رقم الآيبان (IBAN)</label>
            <input type="text" id="sup-iban" class="input mono" placeholder="SA0000000000000000000000" />
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>العنوان والمستودع</label><input type="text" id="sup-address" class="input" placeholder="المدينة، الشارع، المنطقة الصناعية" /></div>
          <div class="form-group"><label>رابط موقع المستودع على خرائط جوجل (Maps URL)</label><input type="url" id="sup-maps-url" class="input mono" placeholder="https://maps.google.com/?q=..." /></div>
        </div>
        <div class="form-group" id="sup-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input type="checkbox" id="sup-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
          <label for="sup-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
        </div>
        <div class="form-group"><label>ملاحظات وشروط الدفع</label><input type="text" id="sup-notes" class="input" placeholder="شروط الدفع، فترات السماح، شروط التحميل..." /></div>
        <div id="sup-error" class="alert bad hidden" style="margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('supplier-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveSupplier()" id="save-sup-btn">حفظ</button>
      </div></div></div>`;

  const searchInput = container.querySelector("#sup-search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => loadSuppliers(), 350));
  }
  const catFilterInput = container.querySelector("#sup-category-filter");
  if (catFilterInput) {
    catFilterInput.addEventListener("change", () => loadSuppliers());
  }
  await loadSuppliers();
}

async function loadSuppliers() {
  const tbody = document.getElementById("sup-tbody");
  if (!tbody) return;
  const searchInput = document.getElementById("sup-search");
  const term  = searchInput ? searchInput.value.toLowerCase().trim() : "";
  try {
    let sups = await getAll(COLS.suppliers(), [orderBy("name")]);
    cachedSuppliers = sups;
    renderSuppliersTable(sups, tbody, term);

    // Auto-sync balances in background for zero/uncalculated balances (e.g. initial opening balances from JEs)
    Promise.resolve().then(async () => {
      const { recalculateSupplierBalance } = await import("../utils/balance-sync.js");
      let changed = false;
      for (const s of sups) {
        if (s.balance === undefined || s.balance === null || s.balance === 0) {
          const b = await recalculateSupplierBalance(s.id).catch(() => null);
          if (b !== null && b !== s.balance) {
            s.balance = b;
            changed = true;
          }
        }
      }
      if (changed) renderSuppliersTable(sups, tbody, term);
    }).catch(() => {});
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="alert bad">${err.message}</div></td></tr>`;
  }
}

function renderSuppliersTable(sups, tbody, term) {
  let filtered = [...sups];
  if (term) {
    filtered = filtered.filter(s =>
      (s.name || "").toLowerCase().includes(term) ||
      (s.phone || "").includes(term) ||
      (s.code || "").toLowerCase().includes(term) ||
      (s.vatNumber || "").includes(term)
    );
  }
  const catFilter = document.getElementById("sup-category-filter")?.value;
  if (catFilter) {
    filtered = filtered.filter(s => s.category === catFilter);
  }

  const countEl = document.getElementById("sup-count");
  if (countEl) countEl.textContent = `${filtered.length} مورد`;

  const CAT_LABELS = {
    rice: "الأرز",
    sugar_oil: "السكر والزيت",
    flour: "الدقيق والمواد الأساسية",
    services: "الخدمات",
    other: "أخرى"
  };
  const CAT_COLORS = {
    rice: "#6366f1",
    sugar_oil: "#f59e0b",
    flour: "#10b981",
    services: "#8b5cf6",
    other: "#6b7280"
  };

  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-2);">لا يوجد موردون</td></tr>`
    : filtered.map(s => `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="font-semibold font-heading" style="cursor:pointer; color:var(--brand);" onclick="viewSupplierIntelligence360('${s.id}')">${s.name}</div>
            ${s.category ? `<span class="coa-badge" style="background:${CAT_COLORS[s.category]}22;color:${CAT_COLORS[s.category]};padding:1px 5px;border-radius:4px;font-size:9px;font-weight:bold;">${CAT_LABELS[s.category] || s.category}</span>` : ""}
          </div>
          ${s.code ? `<div style="font-size:11px;color:var(--text-2);">${s.code}</div>` : ""}
        </td>
        <td class="mono dim">${s.phone||"—"}</td>
        <td class="mono" style="font-size:11.5px;">${s.iban ? `<b>${s.bankName || 'بنك'}:</b> ${s.iban.slice(0, 10)}...` : '—'}</td>
        <td class="mono font-bold ${(s.balance||0)>0?"text-bad":(s.balance||0)<0?"text-good":""}">
          ${(s.balance||0) < 0 
            ? `<span style="color:#059669; font-weight:800;" title="مدين لصالحنا">(${formatCurrency(Math.abs(s.balance))}) مدين</span>` 
            : formatCurrency(s.balance||0)}
        </td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierIntelligence360('${s.id}')" title="بطاقة المورد 360°">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editSupplier('${s.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printSupplier('${s.id}')" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierStatement('${s.id}')" title="كشف حساب">📊</button>
            <button class="btn btn-icon sm btn-ghost" onclick="delSupplier('${s.id}','${s.name.replace(/'/g, "\\'")}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`).join("");
}

window.openSupplierModal = (s=null) => {
  document.getElementById("sup-edit-id").value = s?.id||"";
  document.getElementById("sup-modal-title").textContent = s?"تعديل المورد":"إضافة مورد";
  document.getElementById("sup-name").value    = s?.name||"";
  document.getElementById("sup-code").value    = s?.code||"";
  document.getElementById("sup-phone").value   = s?.phone||"";
  document.getElementById("sup-vat").value     = s?.vatNumber||s?.vat||"";
  document.getElementById("sup-national-id").value = s?.nationalId||"";
  document.getElementById("sup-address").value = s?.address||"";
  document.getElementById("sup-category").value = s?.category||"other";
  document.getElementById("sup-bank").value    = s?.bankName||"";
  document.getElementById("sup-iban").value    = s?.iban||"";
  document.getElementById("sup-maps-url").value = s?.googleMapsUrl||"";
  document.getElementById("sup-notes").value   = s?.notes||"";
  document.getElementById("sup-error").classList.add("hidden");

  // Handle COA toggle visibility
  const toggleWrap = document.getElementById("sup-coa-toggle-wrap");
  const toggle = document.getElementById("sup-coa-toggle");
  if (s) {
    if (toggleWrap) toggleWrap.style.display = "none";
    if (toggle) toggle.checked = !!s.accountId;
  } else {
    if (toggleWrap) toggleWrap.style.display = "flex";
    if (toggle) toggle.checked = true;
  }

  openModal("supplier-modal");
};

window.editSupplier = (id) => {
  const s = cachedSuppliers.find(x => x.id === id);
  if (s) {
    openSupplierModal(s);
  } else {
    import("../utils/db.js").then(async ({ getById }) => {
      try {
        const x = await getById("suppliers", id);
        if (x) openSupplierModal(x);
      } catch (err) { showToast(err.message, "error"); }
    });
  }
};

window.saveSupplier = async()=>{
  const errEl=document.getElementById("sup-error"); errEl.classList.add("hidden");
  const id=document.getElementById("sup-edit-id").value;
  const name=document.getElementById("sup-name").value.trim();
  if(!name){errEl.textContent="الاسم مطلوب";errEl.classList.remove("hidden");return;}
  
  const data={
    name,
    code: document.getElementById("sup-code").value.trim(),
    phone: document.getElementById("sup-phone").value.trim(),
    vatNumber: document.getElementById("sup-vat").value.trim(),
    nationalId: document.getElementById("sup-national-id").value.trim(),
    address: document.getElementById("sup-address").value.trim(),
    category: document.getElementById("sup-category").value,
    bankName: document.getElementById("sup-bank").value.trim(),
    iban: document.getElementById("sup-iban").value.trim(),
    googleMapsUrl: document.getElementById("sup-maps-url").value.trim(),
    notes: document.getElementById("sup-notes").value.trim()
  };
  
  if(!id){ data.balance = 0; }
  const btn=document.getElementById("save-sup-btn"); btn.disabled=true;
  try {
    if (id) {
      const oldSup = cachedSuppliers.find(x => x.id === id);
      await update("suppliers", id, data);
      if (oldSup) {
        const nameChanged = oldSup.name !== name;
        if (oldSup.accountId) {
          if (nameChanged) {
            await updateEntityInCoa(oldSup.accountId, name);
            syncSupplierNameEverywhere(id, name).catch(e =>
              console.warn("[Suppliers] syncSupplierNameEverywhere error:", e.message)
            );
          }
        } else {
          const coaData = await syncEntityToCoa("suppliers", id, name);
          if (coaData) await update("suppliers", id, coaData);
        }
        syncSupplierBalanceToCoa(id).catch(() => {});
      }
      showToast("تم تحديث بيانات المورد ✅");
    } else {
      const wantCoa = document.getElementById("sup-coa-toggle")?.checked ?? true;
      let coaFields = {};
      if (wantCoa) {
        const tempId = "sup_" + Date.now();
        const coaData = await syncEntityToCoa("suppliers", tempId, name);
        if (coaData) coaFields = coaData;
      }
      const newId = await create("suppliers", { ...data, ...coaFields });
      if (wantCoa && coaFields.accountId) {
        await updateEntityInCoa(coaFields.accountId, name, newId);
      }
      showToast("تمت إضافة المورد بنجاح ✅");
    }
    closeModal("supplier-modal");
    await loadSuppliers();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.delSupplier = async (id, name) => {
  if (!confirm(`هل أنت متأكد من حذف المورد "${name}"؟`)) return;
  try {
    const s = cachedSuppliers.find(x => x.id === id);
    if (s?.accountId) {
      await deleteEntityInCoa(s.accountId);
    }
    await remove("suppliers", id);
    showToast("تم حذف المورد ✅");
    await loadSuppliers();
  } catch (err) {
    showToast("فشل الحذف: " + err.message, "error");
  }
};

window.viewSupplierStatement = (id) => {
  if (window.navigate) {
    window.navigate("supplier-statement");
    setTimeout(() => {
      if (typeof window.selectSupplierForStmt === "function") {
        window.selectSupplierForStmt(id);
      }
    }, 300);
  }
};

// ── بطاقة المورد الشاملة 360° (Supplier 360° Intelligence Hub) ──────────────────────
window.viewSupplierIntelligence360 = async (id) => {
  const s = cachedSuppliers.find(x => x.id === id);
  if (!s) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "sup-360-overlay";
  overlay.style.zIndex = "1100";
  overlay.innerHTML = `
    <div class="modal modal-lg" style="max-width:980px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1);">
      <div class="modal-header" style="padding:18px 24px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 class="modal-title" style="display:flex; align-items:center; gap:8px; font-size:16px; font-weight:800; color:var(--brand); margin:0;">
          🏢 بطاقة المورد الشاملة 360°: <span style="color:var(--text-0);">${s.name}</span>
        </h3>
        <button class="modal-close" onclick="document.getElementById('sup-360-overlay').remove()">×</button>
      </div>
      <div class="modal-body" id="sup-360-body" style="padding:24px; overflow-y:auto; flex:1; background:var(--bg-3);">
        <div style="text-align:center; padding:60px;"><span class="spin"></span> جاري تجميع مؤشرات ومشتريات المورد...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  try {
    const { recalculateSupplierBalance } = await import("../utils/balance-sync.js");
    const freshBal = await recalculateSupplierBalance(id).catch(() => s.balance || 0);
    s.balance = freshBal;

    const [purchasesSnap, paymentsSnap, receiptsSnap, contractsSnap, claimsSnap, evalsSnap] = await Promise.all([
      getDocs(query(COLS.purchaseInvoices(), where("supplierId", "==", id))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.expenses(), where("targetId", "==", id))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.receipts(), where("targetId", "==", id))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.supplierContracts(), where("supplierId", "==", id))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.supplierClaims(), where("supplierId", "==", id))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.supplierEvaluations(), where("supplierId", "==", id))).catch(() => ({ docs: [] }))
    ]);

    const invoices = (purchasesSnap.docs || []).map(d => d.data()).filter(i => i.status !== "cancelled");
    const payments = (paymentsSnap.docs || []).map(d => d.data()).filter(p => p.status !== "cancelled");
    const receipts = (receiptsSnap.docs || []).map(d => d.data()).filter(r => r.status !== "cancelled" && (!r.entityType || r.entityType === "supplier"));
    const contracts = (contractsSnap.docs || []).map(d => d.data());
    const claims = (claimsSnap.docs || []).map(d => d.data());
    const evals = (evalsSnap.docs || []).map(d => d.data());

    const totalPurchases = invoices.reduce((sum, i) => sum + (parseFloat(i.totalWithVat || i.total || 0)), 0);
    const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount || 0)), 0);
    const totalReceipts = receipts.reduce((sum, r) => sum + (parseFloat(r.amount || 0)), 0);
    const balance = typeof s.balance === "number" ? s.balance : (totalPurchases + totalReceipts - totalPayments);
    const latestEval = evals.length ? evals[0] : null;

    // Extract top supplied products
    const itemMap = {};
    invoices.forEach(inv => {
      (inv.lines || inv.items || []).forEach(it => {
        const k = it.name || it.productName;
        if (!k) return;
        if (!itemMap[k]) itemMap[k] = { name: k, qty: 0, totalVal: 0, lastPrice: it.unitPrice || it.price || 0 };
        itemMap[k].qty += parseFloat(it.qty || it.quantity || 1);
        itemMap[k].totalVal += parseFloat(it.total || ((it.qty || 1) * (it.unitPrice || 0)));
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.totalVal - a.totalVal).slice(0, 5);

    const bodyEl = document.getElementById("sup-360-body");
    if (!bodyEl) return;

    const isCreditor = balance > 0;
    const isDebtor = balance < 0;

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('sup-360-overlay').remove(); window.viewSupplierStatement('${id}')">📊 كشف حساب تفصيلي</button>
            ${s.phone ? `<button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${s.phone.replace(/[^0-9]/g,'')}', '_blank')">💬 محادثة واتساب</button>` : ""}
            ${s.googleMapsUrl ? `<a href="${s.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 موقع المستودع على الخريطة</a>` : ""}
            ${s.iban ? `<button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${s.iban}'); alert('تم نسخ الآيبان ✅');">📋 نسخ الآيبان</button>` : ""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${latestEval ? `<span class="badge good" style="font-weight:800; font-size:11.5px;">🌟 الفئة: ${latestEval.tier || 'A'} (${latestEval.overallScore || 90}%)</span>` : ""}
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">📜 العقود: ${contracts.length}</span>
            <span class="badge" style="background:rgba(239,68,68,0.1); color:#EF4444; font-weight:800;">🔍 المطالبات: ${claims.length}</span>
          </div>
        </div>

        ${s.pinnedWarningNote ? `
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير مثبت للمورد:</b> ${s.pinnedWarningNote}</span>
          </div>
        ` : ""}

        <!-- KPI Cards -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي المشتريات التاريخية</div>
            <div class="mono font-bold" style="font-size:18px; color:var(--brand); margin-top:4px;">${formatCurrency(totalPurchases)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد الفواتير: ${invoices.length}</div>
          </div>
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي السدادات المنفذة</div>
            <div class="mono font-bold" style="font-size:18px; color:#10B981; margin-top:4px;">${formatCurrency(totalPayments)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد السندات: ${payments.length}</div>
          </div>
          <div class="card" style="padding:14px; background:${isCreditor ? 'rgba(239,68,68,0.05)' : isDebtor ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)'}; border:1.5px solid ${isCreditor ? '#EF4444' : isDebtor ? '#10B981' : 'var(--border-soft)'}; border-radius:12px;">
            <div style="font-size:11px; color:${isCreditor ? '#EF4444' : isDebtor ? '#10B981' : 'var(--text-3)'}; font-weight:700;">
              ${isCreditor ? 'الرصيد المستحق للمورد' : isDebtor ? 'رصيد المورد (مدين لصالحنا)' : 'رصيد الحساب'}
            </div>
            <div class="mono font-bold" style="font-size:18px; color:${isCreditor ? '#EF4444' : isDebtor ? '#10B981' : 'var(--text-0)'}; margin-top:4px;">
              ${isDebtor ? `(${formatCurrency(Math.abs(balance))}) مدين` : formatCurrency(balance)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
              الحالة: ${isCreditor ? 'مستحق السداد للمورد' : isDebtor ? 'دفعة مقدمة / قيد افتتاحي لصالحنا' : 'مطابق (0.00)'}
            </div>
          </div>
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">الحساب البنكي المعتمد</div>
            <div class="mono font-bold" style="font-size:12.5px; color:var(--brand); margin-top:6px; word-break:break-all;">${s.iban || "غير مسجل"}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${s.bankName || "البنك"}</div>
          </div>
        </div>

        <!-- Top Supplied Products Table -->
        <div class="card" style="padding:18px;">
          <h4 style="margin:0 0 12px; font-size:14px; font-weight:800; color:var(--text-0);">📦 أكثر السلع والمواد الغذائية توريداً من هذا المورد:</h4>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>اسم الصنف</th>
                  <th style="width:120px; text-align:center;">إجمالي الكمية الموردة</th>
                  <th style="width:130px; text-align:left;">آخر سعر شراء</th>
                  <th style="width:140px; text-align:left;">إجمالي قيمة الشراء</th>
                </tr>
              </thead>
              <tbody>
                ${topItems.map(it => `
                  <tr>
                    <td class="font-bold">${it.name}</td>
                    <td class="mono" style="text-align:center;">${it.qty}</td>
                    <td class="mono font-bold" style="text-align:left;">${formatCurrency(it.lastPrice)}</td>
                    <td class="mono font-bold text-brand" style="text-align:left;">${formatCurrency(it.totalVal)}</td>
                  </tr>
                `).join("")}
                ${!topItems.length ? `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-3);">لا توجد مشتريات بضائع مسجلة بعد</td></tr>` : ""}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  } catch (e) {
    const el = document.getElementById("sup-360-body");
    if (el) el.innerHTML = `<div class="alert bad">${e.message}</div>`;
  }
};

function getSupplierById(id) {
  return cachedSuppliers.find(s => s.id === id) || null;
}

function buildSupplierSections(s) {
  const CAT_LABELS = {
    rice: "موردو الأرز",
    sugar_oil: "موردو السكر والزيت",
    flour: "موردو الدقيق والمواد الأساسية",
    services: "موردو الخدمات (مرافق وإيجار)",
    other: "موردون آخرون"
  };
  return [
    {
      heading: 'بيانات المورد',
      rows: [
        { label: 'اسم المورد', value: s.name, bold: true },
        { label: 'كود المورد', value: s.code, mono: true },
        { label: 'تصنيف المورد', value: CAT_LABELS[s.category] || s.category || 'موردون آخرون' },
        { label: 'رقم الهاتف', value: s.phone, mono: true },
        { label: 'الرقم الضريبي (VAT)', value: s.vatNumber, mono: true },
        { label: 'الهوية الوطنية / السجل التجاري', value: s.nationalId, mono: true },
        { label: 'البنك والآيبان', value: s.iban ? `${s.bankName || 'البنك'}: ${s.iban}` : '—', mono: true },
        { label: 'العنوان', value: s.address },
      ]
    },
    {
      heading: 'بيانات مالية وقانونية',
      rows: [
        { label: 'الرصيد الحالي', value: formatCurrency(s.balance || 0), mono: true, bold: true },
        { label: 'ملاحظات', value: s.notes },
      ]
    }
  ];
}

window.previewSupplier = (id) => {
  window.viewSupplierIntelligence360(id);
};

window.printSupplier = (id) => {
  const s = getSupplierById(id);
  if (!s) return;
  printRecord({ title: s.name, icon: '🏭', sections: buildSupplierSections(s) });
};

window.exportSupplierPDF = (id) => {
  window.printSupplier(id);
};

window.syncAllSuppliersBalances = async () => {
  try {
    const { recalculateSupplierBalance } = await import("../utils/balance-sync.js");
    if (window.showToast) window.showToast("جاري مزامنة وتحديث أرصدة الموردين مع القيود والفواتير...", "info");
    for (const sup of cachedSuppliers) {
      await recalculateSupplierBalance(sup.id).catch(() => {});
    }
    await loadSuppliers();
    if (window.showToast) window.showToast("✅ تم تحديث ومزامنة كافة أرصدة الموردين بنجاح", "success");
  } catch(e) {
    console.error(e);
    if (window.showToast) window.showToast("حدث خطأ أثناء مزامنة الأرصدة", "error");
  }
};
