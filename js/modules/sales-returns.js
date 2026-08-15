// ============================================================
// IDHAM ERP — Sales Returns Module (مردودات مبيعات - إشعار دائن ZATCA)
// ============================================================
import { COLS, create, update, getAll, adjustStock, createJournalEntry, generateInvoiceNumber } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, calcInvoiceTotals, todayString, debounce } from "../utils/formatters.js";
import { generateZATCAQRBase64, renderZATCAQR } from "../utils/zatca-qr.js";
import { APP_CONFIG, db, COMPANY_ID } from "../firebase-config.js";
import { autoSalesReturnJE } from "../utils/accounting-engine.js";

let returnLines = [];
let originalInvoice = null;

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="sr-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="sr-to" value="${todayString()}" />
      </div>
      <div class="filter-select-group">
        <label>العميل</label>
        <select id="sr-customer-filter" onchange="loadSalesReturnsList()">
          <option value="">كل العملاء</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="sr-warehouse-filter" onchange="loadSalesReturnsList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','مردودات_المبيعات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','مردودات_المبيعات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSalesReturnModal()">+ مردود مبيعات جديد (إشعار دائن)</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مردودات المبيعات والإشعارات الدائنة</h1>
        <p class="page-subtitle">إرجاع البضائع للمخازن وإصدار إشعارات دائنة متوافقة مع ZATCA</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم الإشعار الدائن</th>
                <th>التاريخ</th>
                <th>رقم الفاتورة الأصلية</th>
                <th>العميل</th>
                <th>المخزن المستلم</th>
                <th>إجمالي المردود</th>
                <th>VAT 15%</th>
                <th>الصافي</th>
                <th>ZATCA</th>
              </tr>
            </thead>
            <tbody id="sr-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sales Return Modal -->
    <div class="modal-overlay" id="sr-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">إصدار إشعار دائن (مردود مبيعات)</h3>
          <button class="modal-close" onclick="closeModal('sr-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الفاتورة الأصلية *</label>
              <div class="autocomplete-container">
                <input type="text" id="sr-inv-search" class="input mono" placeholder="ادخل رقم الفاتورة..." autocomplete="off" />
                <div class="autocomplete-results hidden" id="sr-inv-results"></div>
              </div>
            </div>
            <div class="form-group">
              <label>رقم الإشعار الدائن</label>
              <input type="text" id="sr-number" class="input mono" readonly placeholder="يُولّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="sr-date" class="input" value="${todayString()}" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>العميل</label>
              <input type="text" id="sr-cust-name" class="input" readonly placeholder="يتم تحديده من الفاتورة" />
            </div>
            <div class="form-group">
              <label>المخزن المستلم للبضاعة المرجعة *</label>
              <select id="sr-warehouse"><option value="">اختر المخزن</option></select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>سبب الإرجاع *</label>
            <input type="text" id="sr-reason" class="input" placeholder="مثال: تلف بالعبوة، زيادة بالطلب، انتهاء صلاحية..." />
          </div>

          <div class="divider-label">بنود الفاتورة المرجعة</div>

          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">الصنف</th>
                  <th style="padding:8px 10px;">الكمية الأصلية</th>
                  <th style="padding:8px 10px;">الكمية المرجعة</th>
                  <th style="padding:8px 10px;">السعر الأصلي</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="sr-lines-tbody">
                <tr><td colspan="6" style="text-align:center;padding:16px;color:var(--text-2);">حدد الفاتورة الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:280px;">
              <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono" id="sr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>ضريبة القيمة المضافة (15%)</span><span class="mono text-warn" id="sr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار الدائن</span><span class="mono" id="sr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="sr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('sr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveSalesReturn()" id="save-sr-btn">💾 حفظ وحفظ الإشعار الدائن</button>
        </div>
      </div>
    </div>`;

  // Bind change events to from/to date inputs
  document.getElementById("sr-from")?.addEventListener("change", () => loadSalesReturnsList());
  document.getElementById("sr-to")?.addEventListener("change", () => loadSalesReturnsList());

  await loadWarehousesList();
  await loadCustomersFilter();
  await loadSalesReturnsList();
  setupInvoiceSearch();
}

async function loadCustomersFilter() {
  try {
    const custs = await getAll(COLS.customers(), [orderBy("name")]);
    const filter = document.getElementById("sr-customer-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل العملاء</option>' +
        custs.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch {}
}

async function loadWarehousesList() {
  try {
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("sr-warehouse");
    if (sel) whs.forEach(w => sel.innerHTML += `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`);
    
    const filter = document.getElementById("sr-warehouse-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المستودعات</option>' +
        whs.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }
  } catch {}
}

async function loadSalesReturnsList() {
  const tbody = document.getElementById("sr-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;
  try {
    const q = query(COLS.salesReturns(), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    let returns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply filters locally
    const from = document.getElementById("sr-from")?.value;
    const to = document.getElementById("sr-to")?.value;
    if (from || to) {
      returns = returns.filter(r => {
        const d = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
        return (!from || d >= from) && (!to || d <= to);
      });
    }

    const custF = document.getElementById("sr-customer-filter")?.value;
    if (custF) {
      returns = returns.filter(r => r.customerId === custF);
    }

    const whF = document.getElementById("sr-warehouse-filter")?.value;
    if (whF) {
      returns = returns.filter(r => r.warehouseId === whF);
    }

    if (returns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مبيعات تطابق الفلاتر المحددة</td></tr>`;
      return;
    }

    tbody.innerHTML = returns.map(r => {
      const returnNumber = r.number || r.creditNoteNumber || r.id || "—";
      const originalInv = r.originalInvoiceNumber || r.refInvoice || "—";
      const sub = parseFloat(r.subtotal || 0);
      const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : 0));
      const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));

      return `
      <tr>
        <td class="mono text-indigo font-bold">${returnNumber}</td>
        <td class="dim">${formatDate(r.createdAt)}</td>
        <td class="mono text-2">${originalInv}</td>
        <td class="font-semibold">${r.customerName || "عميل نقدي"}</td>
        <td class="dim">${r.warehouseName || "—"}</td>
        <td class="mono">${formatCurrency(sub)}</td>
        <td class="mono text-warn">${formatCurrency(vat)}</td>
        <td class="mono font-bold text-good">${formatCurrency(grand)}</td>
        <td><span class="zatca-stamp reported">✓ CN-ZATCA</span></td>
      </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

function setupInvoiceSearch() {
  const input = document.getElementById("sr-inv-search");
  const results = document.getElementById("sr-inv-results");
  if (!input) return;

  input.addEventListener("input", debounce(async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }
    
    // Fetch last 100 invoices to search in them
    const q = query(COLS.salesInvoices(), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    const invs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => 
      (i.number || "").toLowerCase().includes(term) || 
      (i.customerName || "").toLowerCase().includes(term)
    );

    if (invs.length === 0) { results.classList.add("hidden"); return; }

    results.innerHTML = invs.slice(0, 8).map(i => `
      <div class="autocomplete-item" onclick="selectOriginalInvoice('${i.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${i.number}</span><span>${formatCurrency(i.totalWithVat)}</span></div>
        <div class="item-code">${i.customerName} | ${formatDate(i.createdAt || i.date)}</div>
      </div>`).join("");
    results.classList.remove("hidden");
  }, 300));
}

window.selectOriginalInvoice = async (invId) => {
  try {
    const invRef = doc(db, `companies/${COMPANY_ID}/salesInvoices`, invId);
    const snap = await getDoc(invRef);
    if (!snap.exists()) return;
    originalInvoice = { id: snap.id, ...snap.data() };

    document.getElementById("sr-inv-search").value = originalInvoice.number;
    document.getElementById("sr-cust-name").value   = originalInvoice.customerName;
    document.getElementById("sr-inv-results").classList.add("hidden");

    // Fetch previous returns for this invoice
    const returnedMap = {};
    const qRet = query(COLS.salesReturns(), where("originalInvoiceId", "==", originalInvoice.id));
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
    returnLines = (originalInvoice.lines || []).map(l => {
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

    renderReturnLines();
    updateReturnTotals();
  } catch (err) { showToast(err.message, "error"); }
};

function renderReturnLines() {
  const tbody = document.getElementById("sr-lines-tbody");
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
            onchange="updateReturnQty(${i},this.value)" />
          <div style="font-size:9.5px;color:var(--text-dim);margin-top:2px;">الحد الأقصى: ${l.maxReturnable} (أرجع: ${l.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:6px 10px;" class="mono font-bold">${formatCurrency(lineTotal)}</td>
      </tr>`;
  }).join("");
}

window.updateReturnQty = (i, val) => {
  const qty = parseFloat(val) || 0;
  if (qty > returnLines[i].maxReturnable) {
    showToast(`الكمية المرجعة لا تزيد عن الكمية المتاحة للإرجاع (${returnLines[i].maxReturnable})`, "warning");
    returnLines[i].qty = returnLines[i].maxReturnable;
  } else {
    returnLines[i].qty = qty;
  }
  renderReturnLines();
  updateReturnTotals();
};

function updateReturnTotals() {
  const activeLines = returnLines.filter(l => l.qty > 0);
  const totals = calcInvoiceTotals(activeLines);
  document.getElementById("sr-subtotal").textContent = formatCurrency(totals.subtotal);
  document.getElementById("sr-vat").textContent      = formatCurrency(totals.vatTotal);
  document.getElementById("sr-grand").textContent    = formatCurrency(totals.grandTotal);
}

window.openSalesReturnModal = () => {
  returnLines = []; originalInvoice = null;
  document.getElementById("sr-inv-search").value = "";
  document.getElementById("sr-cust-name").value = "";
  document.getElementById("sr-reason").value = "";
  document.getElementById("sr-error").classList.add("hidden");
  document.getElementById("sr-number").value = "جارِ التوليد...";

  renderReturnLines();
  updateReturnTotals();
  openModal("sr-modal");

  generateInvoiceNumber("CN").then(num => {
    const el = document.getElementById("sr-number");
    if (el) el.value = num;
  }).catch(() => {});
};

window.saveSalesReturn = async () => {
  const errEl = document.getElementById("sr-error");
  errEl.classList.add("hidden");

  if (!originalInvoice) { errEl.textContent = "اختر الفاتورة الأصلية"; errEl.classList.remove("hidden"); return; }
  const activeLines = returnLines.filter(l => l.qty > 0);
  if (activeLines.length === 0) { errEl.textContent = "حدد كمية مرجعة لصنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }

  const waSel       = document.getElementById("sr-warehouse");
  const warehouseId = waSel.value;
  const warehouseName = waSel.options[waSel.selectedIndex]?.dataset.name || "";
  const reason      = document.getElementById("sr-reason").value.trim();

  if (!warehouseId) { errEl.textContent = "اختر المخزن المستلم للبضاعة المرجعة"; errEl.classList.remove("hidden"); return; }
  if (!reason) { errEl.textContent = "أدخل سبب الإرجاع"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-sr-btn");
  btn.disabled = true;

  try {
    const totals = calcInvoiceTotals(activeLines);
    const cnNum  = document.getElementById("sr-number").value;
    const date   = document.getElementById("sr-date").value;

    const data = {
      number: cnNum,
      date,
      originalInvoiceId: originalInvoice.id,
      originalInvoiceNumber: originalInvoice.number,
      customerId: originalInvoice.customerId,
      customerName: originalInvoice.customerName,
      repId: originalInvoice.repId || originalInvoice.salesRepId || null,
      warehouseId, warehouseName,
      lines: activeLines,
      subtotal: totals.subtotal,
      totalVat: totals.vatTotal,
      totalWithVat: totals.grandTotal,
      reason,
      status: "issued",
      zatcaStatus: "reported",
    };

    const cnId = await create(COLS.salesReturns(), data);

    // Reinstate stock for returned lines
    for (const line of activeLines) {
      await adjustStock(warehouseId, line.productId, +line.qty, {
        type: "return_in", sourceType: "salesReturn", sourceId: cnId,
        documentNumber: cnNum, invoiceNumber: cnNum
      });
    }

    // ─── Automated Accounting Engine (Sales Return) ───
    try {
      const warehouses = await getAll(COLS.warehouses());
      const totalCost = activeLines.reduce((s, l) => {
        return s + ((l.costPrice || l.averageCost || 0) * (l.qty || 0));
      }, 0);
      await autoSalesReturnJE({
        id:                    cnId,
        returnNumber:          cnNum,
        date,
        customerName:          originalInvoice.customerName,
        customerType:          originalInvoice.customerType || "retail",
        paymentMethod:         originalInvoice.paymentMethod || "credit",
        subtotal:              totals.subtotal,
        taxAmount:             totals.vatTotal,
        total:                 totals.grandTotal,
        totalCost,
        warehouseId,
      }, {}, warehouses);
    } catch(jeErr) {
      console.warn("[AccountingEngine] Sales Return JE failed:", jeErr.message);
    }

    // Update Customer balance on client side (since Cloud Functions are disabled on Spark plan)
    if (originalInvoice.customerId && totals.grandTotal > 0) {
      try {
        const { increment, updateDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const custRef = doc(db, `companies/${COMPANY_ID}/customers`, originalInvoice.customerId);
        // A sales return decreases the amount the customer owes us
        await updateDoc(custRef, {
          balance: increment(-totals.grandTotal),
          updatedAt: serverTimestamp()
        });
        console.log(`[CustomerBalance] Client-side decremented customer ${originalInvoice.customerId} balance by -${totals.grandTotal} due to return`);
      } catch (custErr) {
        console.warn("Failed to update customer balance on return:", custErr.message);
      }
    }

    showToast(`تم إصدار الإشعار الدائن ${cnNum}`, "success");
    closeModal("sr-modal");
    await loadSalesReturnsList();

    if (originalInvoice.customerId) {
      import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(originalInvoice.customerId)).catch(e => console.warn(e));
    }

  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

