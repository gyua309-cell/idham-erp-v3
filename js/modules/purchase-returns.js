// ============================================================
// IDHAM ERP — Purchase Returns Module (مردودات مشتريات)
// ============================================================
import { COLS, create, update, getAll, adjustStock, createJournalEntry, generateInvoiceNumber } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, calcInvoiceTotals, todayString, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let returnLines = [];
let originalPurchase = null;

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="pr-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="pr-to" value="${todayString()}" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="pr-supplier-filter" onchange="loadPurchaseReturnsList()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="pr-warehouse-filter" onchange="loadPurchaseReturnsList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','مردودات_المشتريات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','مردودات_المشتريات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openPurchaseReturnModal()">+ مردود شراء جديد (إشعار مدين)</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مردودات المشتريات والإشعارات المدينة</h1>
        <p class="page-subtitle">إرجاع البضائع للموردين وخصم قيمتها من الذمم الدائنة</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم الإشعار المدين</th>
                <th>التاريخ</th>
                <th>الفاتورة الأصلية</th>
                <th>المورد</th>
                <th>المخزن المرجَع منه</th>
                <th>إجمالي المردود</th>
                <th>VAT 15%</th>
                <th>الصافي</th>
              </tr>
            </thead>
            <tbody id="pr-tbody">
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

    <!-- Purchase Return Modal -->
    <div class="modal-overlay" id="pr-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">إصدار إشعار مدين (مردود مشتريات)</h3>
          <button class="modal-close" onclick="closeModal('pr-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم فاتورة الشراء الأصلية *</label>
              <div class="autocomplete-container">
                <input type="text" id="pr-inv-search" class="input mono" placeholder="ادخل رقم الفاتورة..." autocomplete="off" />
                <div class="autocomplete-results hidden" id="pr-inv-results"></div>
              </div>
            </div>
            <div class="form-group">
              <label>رقم الإشعار المدين</label>
              <input type="text" id="pr-number" class="input mono" readonly placeholder="يُولّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="pr-date" class="input" value="${todayString()}" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>المورد</label>
              <input type="text" id="pr-sup-name" class="input" readonly placeholder="يتم تحديده من الفاتورة" />
            </div>
            <div class="form-group">
              <label>المخزن المسحوب منه البضاعة *</label>
              <select id="pr-warehouse"><option value="">اختر المخزن</option></select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>سبب الإرجاع *</label>
            <input type="text" id="pr-reason" class="input" placeholder="مثال: أصناف تالفة، عدم مطابقة المواصفات..." />
          </div>

          <div class="divider-label">بنود الفاتورة المرجعة</div>

          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">الصنف</th>
                  <th style="padding:8px 10px;">الكمية المشترات</th>
                  <th style="padding:8px 10px;">الكمية المرجعة للمورد</th>
                  <th style="padding:8px 10px;">سعر التكلفة</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="pr-lines-tbody">
                <tr><td colspan="6" style="text-align:center;padding:16px;color:var(--text-2);">حدد فاتورة الشراء الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:280px;">
              <div class="invoice-total-row"><span>المجموع</span><span class="mono" id="pr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>VAT 15%</span><span class="mono text-warn" id="pr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار المدين</span><span class="mono" id="pr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="pr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('pr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePurchaseReturn()" id="save-pr-btn">💾 حفظ وحصم الإشعار المدين</button>
        </div>
      </div>
    </div>`;

  // Bind change events to from/to date inputs
  document.getElementById("pr-from")?.addEventListener("change", () => loadPurchaseReturnsList());
  document.getElementById("pr-to")?.addEventListener("change", () => loadPurchaseReturnsList());

  await loadWarehousesList();
  await loadSuppliersFilter();
  await loadPurchaseReturnsList();
  setupPurchaseSearch();
}

async function loadSuppliersFilter() {
  try {
    const sups = await getAll(COLS.suppliers(), [orderBy("name")]);
    const filter = document.getElementById("pr-supplier-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل الموردين</option>' +
        sups.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    }
  } catch {}
}

async function loadWarehousesList() {
  try {
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("pr-warehouse");
    if (sel) whs.forEach(w => sel.innerHTML += `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`);

    const filter = document.getElementById("pr-warehouse-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المستودعات</option>' +
        whs.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }
  } catch {}
}

async function loadPurchaseReturnsList() {
  const tbody = document.getElementById("pr-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;
  try {
    const q = query(COLS.purchaseReturns(), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    let returns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply filters locally
    const from = document.getElementById("pr-from")?.value;
    const to = document.getElementById("pr-to")?.value;
    if (from || to) {
      returns = returns.filter(r => {
        const d = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
        return (!from || d >= from) && (!to || d <= to);
      });
    }

    const supF = document.getElementById("pr-supplier-filter")?.value;
    if (supF) {
      returns = returns.filter(r => r.supplierId === supF);
    }

    const whF = document.getElementById("pr-warehouse-filter")?.value;
    if (whF) {
      returns = returns.filter(r => r.warehouseId === whF);
    }

    if (returns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مشتريات تطابق الفلاتر المحددة</td></tr>`;
      return;
    }

    tbody.innerHTML = returns.map(r => `
      <tr>
        <td class="mono text-indigo font-bold">${r.number}</td>
        <td class="dim">${formatDate(r.createdAt)}</td>
        <td class="mono text-2">${r.originalPurchaseNumber || "—"}</td>
        <td class="font-semibold">${r.supplierName || "—"}</td>
        <td class="dim">${r.warehouseName || "—"}</td>
        <td class="mono">${formatCurrency(r.subtotal)}</td>
        <td class="mono text-warn">${formatCurrency(r.totalVat)}</td>
        <td class="mono font-bold text-good">${formatCurrency(r.totalWithVat)}</td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

function setupPurchaseSearch() {
  const input = document.getElementById("pr-inv-search");
  const results = document.getElementById("pr-inv-results");
  if (!input) return;

  input.addEventListener("input", debounce(async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }
    
    // Fetch last 100 purchase invoices to search in them
    const q = query(COLS.purchaseInvoices(), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    const invs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => 
      (i.number || "").toLowerCase().includes(term) || 
      (i.supplierName || "").toLowerCase().includes(term)
    );

    if (invs.length === 0) { results.classList.add("hidden"); return; }

    results.innerHTML = invs.slice(0, 8).map(i => `
      <div class="autocomplete-item" onclick="selectOriginalPurchase('${i.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${i.number}</span><span>${formatCurrency(i.totalWithVat)}</span></div>
        <div class="item-code">${i.supplierName} | ${formatDate(i.createdAt || i.date)}</div>
      </div>`).join("");
    results.classList.remove("hidden");
  }, 300));
}

window.selectOriginalPurchase = async (purId) => {
  try {
    const purRef = doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, purId);
    const snap = await getDoc(purRef);
    if (!snap.exists()) return;
    originalPurchase = { id: snap.id, ...snap.data() };

    document.getElementById("pr-inv-search").value = originalPurchase.number;
    document.getElementById("pr-sup-name").value   = originalPurchase.supplierName;
    document.getElementById("pr-inv-results").classList.add("hidden");

    // Fetch previous returns for this purchase invoice
    const returnedMap = {};
    const qRet = query(COLS.purchaseReturns(), where("originalPurchaseId", "==", originalPurchase.id));
    const snapRet = await getDocs(qRet);
    snapRet.docs.forEach(docSnap => {
      const ret = docSnap.data();
      if (ret.status !== "cancelled") {
        (ret.lines || []).forEach(line => {
          returnedMap[line.productId] = (returnedMap[line.productId] || 0) + (line.qty || 0);
        });
      }
    });

    // Pre-fill lines with original quantities and check maxReturnable
    returnLines = (originalPurchase.lines || []).map(l => {
      const alreadyReturned = returnedMap[l.productId] || 0;
      const maxReturnable = Math.max(0, l.qty - alreadyReturned);
      return {
        ...l,
        originalQty: l.qty,
        alreadyReturned: alreadyReturned,
        maxReturnable: maxReturnable,
        qty: 0,
      };
    });

    renderPurchaseReturnLines();
    updatePurchaseReturnTotals();
  } catch (err) { showToast(err.message, "error"); }
};

function renderPurchaseReturnLines() {
  const tbody = document.getElementById("pr-lines-tbody");
  if (!tbody) return;

  tbody.innerHTML = returnLines.map((l, i) => {
    const lineTotal = l.qty * l.unitPrice * (1 - (l.discount || 0)/100);
    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px;">${i+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">${l.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${l.originalQty}</td>
        <td style="padding:6px 10px;width:140px;">
          <input type="number" class="input mono font-bold text-warn" style="width:90px;height:30px;font-size:12px;"
            value="${l.qty}" min="0" max="${l.maxReturnable}" step="0.001"
            onchange="updatePurchaseReturnQty(${i},this.value)" />
          <div style="font-size:9.5px;color:var(--text-dim);margin-top:2px;">الحد الأقصى: ${l.maxReturnable} (أرجع: ${l.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:6px 10px;" class="mono font-bold">${formatCurrency(lineTotal)}</td>
      </tr>`;
  }).join("");
}

window.updatePurchaseReturnQty = (i, val) => {
  const qty = parseFloat(val) || 0;
  if (qty > returnLines[i].maxReturnable) {
    showToast(`الكمية المرجعة لا تزيد عن الكمية المتاحة للإرجاع (${returnLines[i].maxReturnable})`, "warning");
    returnLines[i].qty = returnLines[i].maxReturnable;
  } else {
    returnLines[i].qty = qty;
  }
  renderPurchaseReturnLines();
  updatePurchaseReturnTotals();
};

function updatePurchaseReturnTotals() {
  const activeLines = returnLines.filter(l => l.qty > 0);
  const totals = calcInvoiceTotals(activeLines);
  document.getElementById("pr-subtotal").textContent = formatCurrency(totals.subtotal);
  document.getElementById("pr-vat").textContent      = formatCurrency(totals.vatTotal);
  document.getElementById("pr-grand").textContent    = formatCurrency(totals.grandTotal);
}

window.openPurchaseReturnModal = () => {
  returnLines = []; originalPurchase = null;
  document.getElementById("pr-inv-search").value = "";
  document.getElementById("pr-sup-name").value = "";
  document.getElementById("pr-reason").value = "";
  document.getElementById("pr-error").classList.add("hidden");
  document.getElementById("pr-number").value = "جارِ التوليد...";

  renderPurchaseReturnLines();
  updatePurchaseReturnTotals();
  openModal("pr-modal");

  generateInvoiceNumber("DN").then(num => {
    const el = document.getElementById("pr-number");
    if (el) el.value = num;
  }).catch(() => {});
};

window.savePurchaseReturn = async () => {
  const errEl = document.getElementById("pr-error");
  errEl.classList.add("hidden");

  if (!originalPurchase) { errEl.textContent = "اختر فاتورة الشراء الأصلية"; errEl.classList.remove("hidden"); return; }
  const activeLines = returnLines.filter(l => l.qty > 0);
  if (activeLines.length === 0) { errEl.textContent = "حدد كمية مرجعة لصنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }

  const waSel       = document.getElementById("pr-warehouse");
  const warehouseId = waSel.value;
  const warehouseName = waSel.options[waSel.selectedIndex]?.dataset.name || "";
  const reason      = document.getElementById("pr-reason").value.trim();

  if (!warehouseId) { errEl.textContent = "اختر المخزن المسحوب منه البضاعة المرجعة"; errEl.classList.remove("hidden"); return; }
  if (!reason) { errEl.textContent = "أدخل سبب الإرجاع"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-pr-btn");
  btn.disabled = true;

  try {
    const totals = calcInvoiceTotals(activeLines);
    const dnNum  = document.getElementById("pr-number").value;
    const date   = document.getElementById("pr-date").value;

    const data = {
      number: dnNum,
      date,
      originalPurchaseId: originalPurchase.id,
      originalPurchaseNumber: originalPurchase.number,
      supplierId: originalPurchase.supplierId,
      supplierName: originalPurchase.supplierName,
      warehouseId, warehouseName,
      lines: activeLines,
      subtotal: totals.subtotal,
      totalVat: totals.vatTotal,
      totalWithVat: totals.grandTotal,
      reason,
      status: "issued",
    };

    const dnId = await create(COLS.purchaseReturns(), data);

    // Deduct stock for returned lines
    for (const line of activeLines) {
      await adjustStock(warehouseId, line.productId, -line.qty, {
        type: "return_out", sourceType: "purchaseReturn", sourceId: dnId,
        documentNumber: dnNum, invoiceNumber: dnNum
      });
    }

    // Accounting Journal Entry (Debit Note)
    await createJournalEntry({
      date,
      description: `مردودات مشتريات — إشعار مدين ${dnNum} — ${originalPurchase.supplierName}`,
      sourceType: "purchaseReturn", sourceId: dnId,
      lines: [
        // Dr. Accounts Payable (Decrease Liability) حساب الذمم الدائنة الصحيح
        { accountCode: "2-1-1-1-1", accountName: "ذمم موردون محليون", debit: totals.grandTotal, credit: 0 },
        // Cr. Inventory (Deduct stock value) حساب المخزون الصحيح
        { accountCode: "1-1-4-1-01", accountName: "مخزون المستودع الرئيسي", debit: 0, credit: totals.subtotal },
        // Cr. VAT Input (Reversal) حساب ضريبة المدخلات الصحيح
        { accountCode: "1-1-5-2", accountName: "ضريبة القيمة المضافة - المدخلات", debit: 0, credit: totals.vatTotal },
      ],
    });

    // Update Supplier balance on client side (since Cloud Functions are disabled on Spark plan)
    if (originalPurchase.supplierId && totals.grandTotal > 0) {
      try {
        const { increment, updateDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const suppRef = doc(db, `companies/${COMPANY_ID}/suppliers`, originalPurchase.supplierId);
        // A purchase return decreases the amount we owe the supplier
        await updateDoc(suppRef, {
          balance: increment(-totals.grandTotal),
          updatedAt: serverTimestamp()
        });
        console.log(`[SupplierBalance] Client-side decremented supplier ${originalPurchase.supplierId} balance by -${totals.grandTotal} due to return`);
      } catch (suppErr) {
        console.warn("Failed to update supplier balance on return:", suppErr.message);
      }
    }

    showToast(`تم إصدار الإشعار المدين ${dnNum}`, "success");
    closeModal("pr-modal");
    await loadPurchaseReturnsList();

    if (originalPurchase.supplierId) {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(originalPurchase.supplierId)).catch(e => console.warn(e));
    }

  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

