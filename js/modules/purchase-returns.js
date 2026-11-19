// ============================================================
// IDHAM ERP — Purchase Returns Module (مردودات مشتريات)
// ============================================================
import { COLS, create, update, remove, getById, getAll, adjustStock, createJournalEntry, deleteJournalEntry, generateInvoiceNumber, autoCashTransaction, autoBankTransaction } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, collection } from "../utils/db.js";
import { formatCurrency, formatDate, calcInvoiceTotals, todayString, debounce } from "../utils/formatters.js";
import { autoPurchaseReturnJE } from "../utils/accounting-engine.js";
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
        <p class="page-subtitle">إرجاع البضائع للموردين وخصم قيمتها من الذمم الدائنة وتحديث المخزون والقيد المحاسبي</p>
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
                <th>الصافي المسترد</th>
                <th style="text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="pr-tbody">
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
              <select id="pr-warehouse" onchange="window.onPurchaseReturnWarehouseChange()"><option value="">اختر المخزن</option></select>
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
                  <th style="padding:8px 10px;">الكمية بالفاتورة</th>
                  <th style="padding:8px 10px;text-align:center;">الرصيد الفعلي بالمستودع</th>
                  <th style="padding:8px 10px;">الكمية المرجعة للمورد</th>
                  <th style="padding:8px 10px;">سعر التكلفة</th>
                  <th style="padding:8px 10px;text-align:center;">الضريبة VAT</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="pr-lines-tbody">
                <tr><td colspan="8" style="text-align:center;padding:16px;color:var(--text-2);">حدد فاتورة الشراء الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:300px;">
              <div class="invoice-total-row"><span>المجموع قبل الضريبة:</span><span class="mono font-bold" id="pr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>ضريبة القيمة المضافة:</span><span class="mono text-warn font-bold" id="pr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار المدين:</span><span class="mono font-bold text-good" id="pr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="pr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('pr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePurchaseReturn()" id="save-pr-btn">💾 حفظ وخصم الإشعار المدين</button>
        </div>
      </div>
    </div>

    <!-- View Purchase Return Modal -->
    <div class="modal-overlay" id="pr-view-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="pr-view-title">تفاصيل الإشعار المدين (مردود مشتريات)</h3>
          <button class="modal-close" onclick="closeModal('pr-view-modal')">×</button>
        </div>
        <div class="modal-body" id="pr-view-body" style="padding:20px;"></div>
        <div class="modal-footer" id="pr-view-footer" style="padding:12px 20px;"></div>
      </div>
    </div>`;

  // Bind change events to from/to date inputs
  document.getElementById("pr-from")?.addEventListener("change", () => loadPurchaseReturnsList());
  document.getElementById("pr-to")?.addEventListener("change", () => loadPurchaseReturnsList());

  await Promise.all([
    loadWarehousesList(),
    loadSuppliersFilter(),
    loadPurchaseReturnsList()
  ]);
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
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مشتريات تطابق الفلاتر المحددة</td></tr>`;
      return;
    }

    tbody.innerHTML = returns.map(r => `
      <tr>
        <td class="mono text-indigo font-bold" style="cursor:pointer;" onclick="viewPurchaseReturn('${r.id}')" title="عرض تفاصيل الإشعار المدين">${r.number}</td>
        <td class="dim">${formatDate(r.createdAt || r.date)}</td>
        <td class="mono text-2">${r.originalPurchaseNumber || "—"}</td>
        <td class="font-semibold">${r.supplierName || "—"}</td>
        <td class="dim">${r.warehouseName || "—"}</td>
        <td class="mono">${formatCurrency(r.subtotal)}</td>
        <td class="mono text-warn">${formatCurrency(r.totalVat)}</td>
        <td class="mono font-bold text-good">${formatCurrency(r.totalWithVat)}</td>
        <td style="text-align:center;">
          <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-icon sm btn-ghost" onclick="viewPurchaseReturn('${r.id}')" title="عرض تفاصيل الإشعار المدين">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printPurchaseReturn('${r.id}')" title="طباعة الإشعار المدين">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editPurchaseReturn('${r.id}')" title="تعديل مردود المشتريات">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="deletePurchaseReturn('${r.id}')" title="حذف مردود المشتريات">🗑️</button>
          </div>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
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
    if (originalPurchase.warehouseId) {
      document.getElementById("pr-warehouse").value = originalPurchase.warehouseId;
    }
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

    const waSel = document.getElementById("pr-warehouse");
    const currentWhId = waSel ? waSel.value : originalPurchase.warehouseId;

    // Fetch live stock for each product in this warehouse
    const stockMap = await fetchWarehouseStockForLines(currentWhId, originalPurchase.lines || []);

    // Pre-fill lines with original quantities, taxCategory, warehouse stock, and effective maxReturnable
    returnLines = (originalPurchase.lines || []).map(l => {
      const alreadyReturned = returnedMap[l.productId] || 0;
      const invoiceReturnable = Math.max(0, (l.qty || 0) - alreadyReturned);
      const currentStock = stockMap[l.productId] !== undefined ? stockMap[l.productId] : 0;
      const maxReturnable = Math.min(invoiceReturnable, currentStock);
      return {
        ...l,
        originalQty: l.qty || 0,
        alreadyReturned: alreadyReturned,
        invoiceReturnable: invoiceReturnable,
        currentStock: currentStock,
        maxReturnable: maxReturnable,
        taxCategory: l.taxCategory || "S",
        taxRate: (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 15,
        unit: l.unit || "حبة",
        qty: 0,
      };
    });

    renderPurchaseReturnLines();
    updatePurchaseReturnTotals();
  } catch (err) { showToast(err.message, "error"); }
};

async function fetchWarehouseStockForLines(warehouseId, lines) {
  const stockMap = {};
  if (!warehouseId || !lines || lines.length === 0) return stockMap;
  try {
    const promises = lines.map(async l => {
      if (!l.productId) return;
      try {
        const stockRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${warehouseId}_${l.productId}`);
        const sSnap = await getDoc(stockRef);
        stockMap[l.productId] = sSnap.exists() ? (sSnap.data().qty || 0) : 0;
      } catch (_) {
        stockMap[l.productId] = 0;
      }
    });
    await Promise.all(promises);
  } catch (e) {
    console.warn("fetchWarehouseStockForLines error:", e);
  }
  return stockMap;
}

window.onPurchaseReturnWarehouseChange = async () => {
  const waSel = document.getElementById("pr-warehouse");
  const warehouseId = waSel ? waSel.value : null;
  if (!warehouseId || !originalPurchase || !returnLines.length) return;

  const stockMap = await fetchWarehouseStockForLines(warehouseId, originalPurchase.lines || []);
  returnLines.forEach(l => {
    l.currentStock = stockMap[l.productId] !== undefined ? stockMap[l.productId] : 0;
    l.maxReturnable = Math.min(l.invoiceReturnable, l.currentStock);
    if (l.qty > l.maxReturnable) l.qty = l.maxReturnable;
  });

  renderPurchaseReturnLines();
  updatePurchaseReturnTotals();
};

function renderPurchaseReturnLines() {
  const tbody = document.getElementById("pr-lines-tbody");
  if (!tbody) return;

  tbody.innerHTML = returnLines.map((l, i) => {
    const lineTotal = l.qty * l.unitPrice * (1 - (l.discount || 0)/100);
    const isExempt = (l.taxCategory === "E" || l.taxCategory === "Z" || l.taxRate === 0);
    const isOutOfStock = (l.currentStock <= 0);

    return `
      <tr style="border-bottom:1px solid var(--border-soft); ${isOutOfStock ? 'background:rgba(239,68,68,0.03);' : ''}">
        <td style="padding:6px 10px;">${i+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">
          <b>${l.productName}</b>
          <div class="dim mono" style="font-size:10px;">${l.sku || "—"} | الوحدة: ${l.unit || "حبة"}</div>
        </td>
        <td style="padding:6px 10px;" class="mono dim">${l.originalQty} ${l.unit || ""}</td>
        <td style="padding:6px 10px;text-align:center;">
          ${isOutOfStock 
            ? '<span class="badge bad font-bold" style="font-size:10px;padding:3px 6px;">0 (غير متوفر)</span>' 
            : `<span class="badge good font-bold" style="font-size:10px;padding:3px 6px;">${l.currentStock} متوفر</span>`}
        </td>
        <td style="padding:6px 10px;width:150px;">
          <input type="number" class="input mono font-bold ${isOutOfStock ? 'disabled' : 'text-warn'}" style="width:90px;height:30px;font-size:12px;${isOutOfStock ? 'background:var(--bg-2);cursor:not-allowed;' : ''}"
            value="${l.qty}" min="0" max="${l.maxReturnable}" step="0.001"
            ${isOutOfStock ? 'disabled title="لا يمكن الإرجاع — الرصيد في المستودع صفر"' : ''}
            onchange="updatePurchaseReturnQty(${i},this.value)" />
          <div style="font-size:9.5px;color:${isOutOfStock ? '#ef4444' : 'var(--text-dim)'};margin-top:2px;font-weight:${isOutOfStock ? 'bold' : 'normal'};">
            ${isOutOfStock ? '⚠️ الرصيد بالمستودع 0 — لا يمكن الإرجاع' : `المتاح للإرجاع: ${l.maxReturnable} (سابق: ${l.alreadyReturned})`}
          </div>
        </td>
        <td style="padding:6px 10px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:6px 10px;text-align:center;">
          ${isExempt ? '<span class="badge good" style="font-size:9.5px;padding:2px 4px;">معفى</span>' : '<span class="badge warn" style="font-size:9.5px;padding:2px 4px;">15%</span>'}
        </td>
        <td style="padding:6px 10px;" class="mono font-bold">${formatCurrency(lineTotal)}</td>
      </tr>`;
  }).join("");
}

window.updatePurchaseReturnQty = (i, val) => {
  const line = returnLines[i];
  if (line.currentStock <= 0) {
    showToast(`❌ لا يمكن إرجاع الصنف "${line.productName}" لأن رصيده في المستودع 0. إذا كان الصنف مرتجعاً من عميل، يرجى إثبات فاتورة مردود المبيعات أولاً.`, "error");
    line.qty = 0;
    renderPurchaseReturnLines();
    updatePurchaseReturnTotals();
    return;
  }

  const qty = parseFloat(val) || 0;
  if (qty > line.maxReturnable) {
    showToast(`الكمية المرجعة (${qty}) لا يمكن أن تزيد عن الحد المتاح في المستودع والفاتورة (${line.maxReturnable})`, "warning");
    line.qty = line.maxReturnable;
  } else {
    line.qty = Math.max(0, qty);
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

// ─── Arabic Number to Words (Tafqeet) ─────────────────────────
function numberToArabicWords(n) {
  if (!n || isNaN(n)) return "صفر ريال سعودي";
  const ones = ["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة",
    "عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر",
    "سبعة عشر","ثمانية عشر","تسعة عشر"];
  const tens = ["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
  const hundreds = ["","مئة","مئتان","ثلاثمئة","أربعمئة","خمسمئة","ستمئة","سبعمئة","ثمانمئة","تسعمئة"];
  const thousands = ["","ألف","ألفان","ثلاثة آلاف","أربعة آلاف","خمسة آلاف","ستة آلاف",
    "سبعة آلاف","ثمانية آلاف","تسعة آلاف"];

  const num = Math.floor(Math.abs(n));
  const fils = Math.round((Math.abs(n) - num) * 100);

  function belowThousand(x) {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10), o = x % 10;
    if (o === 0) return tens[t];
    return ones[o] + " و" + tens[t];
  }

  function convert(x) {
    if (x === 0) return "صفر";
    let result = "";
    const th = Math.floor(x / 1000);
    const rem = x % 1000;
    const h = Math.floor(rem / 100);
    const r = rem % 100;

    if (th > 0) {
      result += (th < 10 ? thousands[th] : belowThousand(th) + " ألف");
      if (h > 0 || r > 0) result += " و";
    }
    if (h > 0) {
      result += hundreds[h];
      if (r > 0) result += " و";
    }
    if (r > 0) result += belowThousand(r);
    return result;
  }

  const millions = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  let result = "";
  if (millions > 0) result += convert(millions) + " مليون ";
  result += convert(remainder);

  let final = result.trim() + " ريال سعودي";
  if (fils > 0) final += " و" + convert(fils) + " هللة";
  final += " لا غير";
  return final;
}

window.openPurchaseReturnModal = () => {
  window._editingReturnId = null;
  returnLines = []; originalPurchase = null;

  const modalTitle = document.querySelector("#pr-modal .modal-title");
  if (modalTitle) modalTitle.textContent = "إصدار إشعار مدين (مردود مشتريات)";
  const saveBtn = document.getElementById("save-pr-btn");
  if (saveBtn) saveBtn.textContent = "💾 حفظ وخصم الإشعار المدين";

  const invSearch = document.getElementById("pr-inv-search");
  if (invSearch) {
    invSearch.value = "";
    invSearch.disabled = false;
    invSearch.readOnly = false;
  }
  document.getElementById("pr-sup-name").value = "";
  document.getElementById("pr-reason").value = "";
  document.getElementById("pr-error").classList.add("hidden");
  document.getElementById("pr-number").value = "جارِ التوليد...";

  renderPurchaseReturnLines();
  updatePurchaseReturnTotals();
  openModal("pr-modal");

  generateInvoiceNumber("DN").then(num => {
    const el = document.getElementById("pr-number");
    if (el && !window._editingReturnId) el.value = num;
  }).catch(() => {});
};

window.savePurchaseReturn = async () => {
  const errEl = document.getElementById("pr-error");
  errEl.classList.add("hidden");

  const isEditing = !!window._editingReturnId;
  const editingId = window._editingReturnId;

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
  btn.textContent = isEditing ? "⏳ جارٍ تحديث الإشعار المدين…" : "⏳ جارٍ الحفظ وخصم الرصيد…";

  try {
    const totals = calcInvoiceTotals(activeLines);
    const dnNum  = document.getElementById("pr-number").value;
    const date   = document.getElementById("pr-date").value;
    const payMethod = originalPurchase.paymentMethod || "credit";

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
      paymentMethod: payMethod,
      reason,
      status: "issued",
    };

    // ─── EDIT MODE WORKFLOW ───
    if (isEditing) {
      const oldReturn = await getById("purchaseReturns", editingId);
      if (!oldReturn) throw new Error("تعذر إيجاد الإشعار المدين السابق للتعديل");

      // Validate stock delta for increases
      for (const line of activeLines) {
        const oldLine = (oldReturn.lines || []).find(x => x.productId === line.productId);
        const oldQty = oldLine ? (oldLine.qty || 0) : 0;
        const deltaQty = line.qty - oldQty;
        if (deltaQty > 0) {
          const stockDocRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${warehouseId}_${line.productId}`);
          const stockSnap = await getDoc(stockDocRef);
          const currStock = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
          if (currStock < deltaQty) {
            throw new Error(`رصيد الصنف "${line.productName}" في المستودع غير كافٍ لزيادة الكمية المرجعة (المتوفر: ${currStock}، المطلوب خصمه إضافياً: ${deltaQty})`);
          }
        }
      }

      // 1. Adjust physical stock by delta
      for (const line of activeLines) {
        const oldLine = (oldReturn.lines || []).find(x => x.productId === line.productId);
        const oldQty = oldLine ? (oldLine.qty || 0) : 0;
        const deltaQty = line.qty - oldQty;
        if (Math.abs(deltaQty) > 0.0001) {
          await adjustStock(warehouseId, line.productId, -deltaQty, {
            type: "purchase_return_edit",
            sourceType: "purchaseReturn",
            sourceId: editingId,
            txDocId: `tx_pur_ret_edit_${editingId}_${Date.now()}_${line.productId}`,
            documentNumber: dnNum,
            notes: `تعديل مردود مشتريات (إشعار مدين ${dnNum}) — الفارق: ${-deltaQty}`
          });
        }
      }

      // Check for removed lines completely
      for (const oldLine of (oldReturn.lines || [])) {
        if (!activeLines.some(l => l.productId === oldLine.productId)) {
          await adjustStock(warehouseId, oldLine.productId, +oldLine.qty, {
            type: "purchase_return_edit",
            sourceType: "purchaseReturn",
            sourceId: editingId,
            txDocId: `tx_pur_ret_edit_${editingId}_${Date.now()}_${oldLine.productId}`,
            documentNumber: dnNum,
            notes: `إلغاء صنف من مردود مشتريات (${dnNum}) — إعادة ${oldLine.qty} للمستودع`
          });
        }
      }

      // 2. Delete old JE and recreate with new amounts
      if (oldReturn.journalEntryId) {
        try { await deleteJournalEntry(oldReturn.journalEntryId); } catch (_) {}
      }
      for (const sKey of [editingId, oldReturn.number]) {
        try {
          const jeSnap = await getDocs(
            query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
              where("sourceType", "==", "purchaseReturn"),
              where("sourceId", "==", sKey))
          );
          for (const jeDoc of jeSnap.docs) {
            await deleteJournalEntry(jeDoc.id);
          }
        } catch (_) {}
      }

      let newJeId = null;
      try {
        const warehouses = await getAll(COLS.warehouses());
        newJeId = await autoPurchaseReturnJE({
          id: editingId,
          returnNumber: dnNum,
          date,
          supplierId: originalPurchase.supplierId,
          supplierName: originalPurchase.supplierName,
          paymentMethod: payMethod,
          warehouseId,
          subtotal: totals.subtotal,
          taxAmount: totals.vatTotal,
          total: totals.grandTotal,
        }, window._currentUser || {}, warehouses);
      } catch (jeErr) {
        console.warn("[PurchaseReturnEdit] Auto JE failed:", jeErr);
      }

      // 3. Update Supplier Balance Delta
      const oldTotal = oldReturn.totalWithVat || oldReturn.total || 0;
      const deltaTotal = totals.grandTotal - oldTotal;
      if (originalPurchase.supplierId && Math.abs(deltaTotal) > 0.001 && payMethod !== "cash") {
        try {
          const { increment, updateDoc, doc: fsDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
          const suppRef = fsDoc(db, `companies/${COMPANY_ID}/suppliers`, originalPurchase.supplierId);
          await updateDoc(suppRef, {
            balance: increment(-deltaTotal),
            updatedAt: serverTimestamp()
          });
        } catch (suppErr) {
          console.warn("[PurchaseReturnEdit] Supplier balance update failed:", suppErr);
        }
      }

      // 4. Update Return Document
      await update(COLS.purchaseReturns(), editingId, {
        ...data,
        journalEntryId: newJeId || oldReturn.journalEntryId || null,
        updatedAt: new Date().toISOString()
      });

      window._editingReturnId = null;
      (window.showToast || alert)(`✅ تم تحديث الإشعار المدين ${dnNum} وتحديث المخزون والمحاسبة بنجاح`, "success");
      closeModal("pr-modal");
      await loadPurchaseReturnsList();

      if (originalPurchase.supplierId) {
        import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(originalPurchase.supplierId)).catch(e => console.warn(e));
      }
      return;
    }

    // ─── CREATE MODE WORKFLOW ───
    // 0. Pre-validate stock availability for all lines before creating any documents
    for (const line of activeLines) {
      if (!line.productId) continue;
      try {
        const stockDocRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${warehouseId}_${line.productId}`);
        const stockSnap = await getDoc(stockDocRef);
        const currStock = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
        if (currStock < line.qty) {
          throw new Error(`رصيد الصنف "${line.productName || line.productId}" في المستودع غير كافٍ لإتمام المردود (المتوفر: ${currStock}، المطلوب إرجاعه: ${line.qty}). يرجى التأكد من استلام بضاعة الصنف أولاً.`);
        }
      } catch (checkErr) {
        if (checkErr.message && checkErr.message.includes("غير كافٍ")) {
          throw checkErr;
        }
        console.warn("[PurchaseReturn] Stock pre-check warning:", checkErr);
      }
    }

    let dnId = null;
    try {
      dnId = await create(COLS.purchaseReturns(), data);

      // 1. Deduct physical stock & log stockTransactions for returned lines
      for (const line of activeLines) {
        await adjustStock(warehouseId, line.productId, -line.qty, {
          type: "purchase_return",
          sourceType: "purchaseReturn",
          sourceId: dnId,
          txDocId: `tx_purchase_return_${dnId}_${Date.now()}_${line.productId}`,
          documentNumber: dnNum,
          notes: `مردود مشتريات (إشعار مدين ${dnNum}) — مورد: ${originalPurchase.supplierName}`
        });
      }
    } catch (stockErr) {
      // Rollback: if document was created but stock deduction failed, remove the orphan document
      if (dnId) {
        try {
          await remove(COLS.purchaseReturns(), dnId);
          console.warn(`[PurchaseReturn] Rolled back orphan return ${dnId} due to stock error:`, stockErr.message);
        } catch (_) {}
      }
      throw stockErr;
    }

    // 2. Accounting Engine: Auto Journal Entry (Debit Note)
    try {
      const warehouses = await getAll(COLS.warehouses());
      const jeId = await autoPurchaseReturnJE({
        id: dnId,
        returnNumber: dnNum,
        date,
        supplierId: originalPurchase.supplierId,
        supplierName: originalPurchase.supplierName,
        paymentMethod: payMethod,
        warehouseId,
        subtotal: totals.subtotal,
        taxAmount: totals.vatTotal,
        total: totals.grandTotal,
      }, window._currentUser || {}, warehouses);

      if (jeId) {
        await update(COLS.purchaseReturns(), dnId, { journalEntryId: jeId });
      }
    } catch (jeErr) {
      console.warn("[PurchaseReturn] Auto JE failed:", jeErr);
    }

    // 3. Auto Cash / Bank Refund (if original purchase was cash/bank)
    if (payMethod === "cash" || payMethod === "نقدي") {
      try {
        await autoCashTransaction({
          type: "in",
          amount: totals.grandTotal,
          notes: `استرداد نقدي لمردود مشتريات — إشعار مدين ${dnNum} — ${originalPurchase.supplierName}`,
          sourceType: "purchaseReturn",
          sourceId: dnId,
          date
        });
      } catch (cashErr) {
        console.warn("[PurchaseReturn] Cash transaction failed:", cashErr);
      }
    } else if (["transfer", "bank", "cheque", "check", "تحويل", "شيك"].includes(payMethod)) {
      try {
        await autoBankTransaction({
          type: "in",
          amount: totals.grandTotal,
          notes: `استرداد بنكي لمردود مشتريات — إشعار مدين ${dnNum} — ${originalPurchase.supplierName}`,
          sourceType: "purchaseReturn",
          sourceId: dnId,
          date
        });
      } catch (bankErr) {
        console.warn("[PurchaseReturn] Bank transaction failed:", bankErr);
      }
    }

    // 4. Update Supplier Balance (Decrease Liability / Credit Account)
    if (originalPurchase.supplierId && totals.grandTotal > 0 && payMethod !== "cash") {
      try {
        const { increment, updateDoc, doc: fsDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const suppRef = fsDoc(db, `companies/${COMPANY_ID}/suppliers`, originalPurchase.supplierId);
        await updateDoc(suppRef, {
          balance: increment(-totals.grandTotal),
          updatedAt: serverTimestamp()
        });
        console.log(`[SupplierBalance] Decremented supplier ${originalPurchase.supplierId} balance by -${totals.grandTotal}`);
      } catch (suppErr) {
        console.warn("Failed to update supplier balance on return:", suppErr.message);
      }
    }

    (window.showToast || alert)(`✅ تم إصدار الإشعار المدين ${dnNum} وتحديث المخزون والمحاسبة بنجاح`, "success");
    closeModal("pr-modal");
    await loadPurchaseReturnsList();

    if (originalPurchase.supplierId) {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(originalPurchase.supplierId)).catch(e => console.warn(e));
    }

  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = isEditing ? "💾 تحديث الإشعار المدين" : "💾 حفظ وخصم الإشعار المدين";
  }
};

// ─── View Purchase Return Details ─────────────────────────────
window.viewPurchaseReturn = async (id) => {
  try {
    const r = await getById("purchaseReturns", id);
    if (!r) throw new Error("لم يتم العثور على الإشعار المدين");

    document.getElementById("pr-view-title").textContent = `📜 تفاصيل الإشعار المدين — ${r.number}`;

    const linesHtml = (r.lines || []).map((l, i) => {
      const lineTotal = (l.qty || 0) * (l.unitPrice || 0) * (1 - (l.discount || 0)/100);
      const isExempt = (l.taxCategory === "E" || l.taxCategory === "Z" || l.taxRate === 0);
      return `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td><b>${l.productName || "—"}</b><div class="dim mono" style="font-size:10px;">${l.sku || "—"}</div></td>
          <td style="text-align:center;">${l.unit || "حبة"}</td>
          <td class="mono font-bold" style="text-align:center;">${l.qty}</td>
          <td class="mono" style="text-align:center;">${formatCurrency(l.unitPrice)}</td>
          <td style="text-align:center;">${isExempt ? '<span class="badge good" style="font-size:10px;">معفى</span>' : '<span class="badge warn" style="font-size:10px;">15%</span>'}</td>
          <td class="mono font-bold text-good" style="text-align:center;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    }).join("");

    document.getElementById("pr-view-body").innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px; background:var(--bg-2); padding:14px; border-radius:8px; border:1px solid var(--border);">
        <div><span class="dim" style="font-size:11px;">رقم الإشعار المدين:</span> <div class="mono font-bold text-indigo" style="font-size:14px;">${r.number}</div></div>
        <div><span class="dim" style="font-size:11px;">التاريخ:</span> <div class="mono font-bold">${formatDate(r.date || r.createdAt)}</div></div>
        <div><span class="dim" style="font-size:11px;">الفاتورة الأصلية:</span> <div class="mono font-bold">${r.originalPurchaseNumber || "—"}</div></div>
        <div><span class="dim" style="font-size:11px;">المورد:</span> <div class="font-bold">${r.supplierName || "—"}</div></div>
        <div><span class="dim" style="font-size:11px;">المخزن المرجَع منه:</span> <div>${r.warehouseName || "—"}</div></div>
        <div><span class="dim" style="font-size:11px;">طريقة السداد:</span> <div>${r.paymentMethod === "cash" ? "نقدي" : (r.paymentMethod === "bank" ? "تحويل بنكي" : "آجل (ذمم دائنة)")}</div></div>
        <div style="grid-column:1/-1;"><span class="dim" style="font-size:11px;">سبب الإرجاع:</span> <div>${r.reason || "—"}</div></div>
      </div>

      <div class="table-container" style="max-height:300px; overflow-y:auto; margin-bottom:16px; border:1px solid var(--border); border-radius:6px;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">#</th>
              <th>الصنف</th>
              <th style="text-align:center;">الوحدة</th>
              <th style="text-align:center;">الكمية المرجعة</th>
              <th style="text-align:center;">سعر الوحدة</th>
              <th style="text-align:center;">الضريبة</th>
              <th style="text-align:center;">الإجمالي المرجع</th>
            </tr>
          </thead>
          <tbody>${linesHtml}</tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px;">
        <div style="font-size:12px;">
          ${r.journalEntryId ? `<span class="badge" style="background:rgba(59,130,246,0.1); color:#2563eb; border:1px solid rgba(59,130,246,0.3);">📘 قيد رقم: ${r.journalEntryId.slice(0,8)}</span>` : ""}
        </div>
        <div class="invoice-totals" style="width:280px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة:</span><span class="mono font-bold">${formatCurrency(r.subtotal)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة (15%):</span><span class="mono text-warn font-bold">${formatCurrency(r.totalVat)}</span></div>
          <div class="invoice-total-row grand-total"><span>صافي الإشعار المدين:</span><span class="mono font-bold text-good">${formatCurrency(r.totalWithVat)}</span></div>
        </div>
      </div>
    `;

    document.getElementById("pr-view-footer").innerHTML = `
      <div style="display:flex; gap:8px; justify-content:space-between; width:100%; flex-wrap:wrap;">
        <button class="btn btn-ghost text-bad" onclick="closeModal('pr-view-modal'); deletePurchaseReturn('${r.id}')">🗑️ حذف الإشعار</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('pr-view-modal')">إغلاق</button>
          <button class="btn btn-secondary" onclick="closeModal('pr-view-modal'); editPurchaseReturn('${r.id}')">✏️ تعديل</button>
          <button class="btn btn-primary" onclick="printPurchaseReturn('${r.id}')">🖨️ طباعة الإشعار</button>
        </div>
      </div>
    `;

    openModal("pr-view-modal");
  } catch (err) {
    (window.showToast || alert)("خطأ: " + err.message, "error");
  }
};

// ─── Edit Purchase Return ─────────────────────────────────────
window.editPurchaseReturn = async (id) => {
  try {
    const ret = await getById("purchaseReturns", id);
    if (!ret) throw new Error("لم يتم العثور على الإشعار المدين");

    window._editingReturnId = id;
    const modalTitle = document.querySelector("#pr-modal .modal-title");
    if (modalTitle) modalTitle.textContent = `✏️ تعديل إشعار مدين (مردود مشتريات) — ${ret.number}`;
    const saveBtn = document.getElementById("save-pr-btn");
    if (saveBtn) saveBtn.textContent = "💾 تحديث الإشعار المدين";

    const invSearch = document.getElementById("pr-inv-search");
    if (invSearch) {
      invSearch.value = ret.originalPurchaseNumber || "";
      invSearch.disabled = true;
    }
    document.getElementById("pr-number").value = ret.number;
    document.getElementById("pr-date").value   = ret.date || todayString();
    document.getElementById("pr-sup-name").value = ret.supplierName || "";
    if (ret.warehouseId) {
      document.getElementById("pr-warehouse").value = ret.warehouseId;
    }
    document.getElementById("pr-reason").value = ret.reason || "";
    document.getElementById("pr-error").classList.add("hidden");

    // Fetch original purchase invoice
    const purRef = doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, ret.originalPurchaseId);
    const snap = await getDoc(purRef);
    if (!snap.exists()) throw new Error("فاتورة الشراء الأصلية غير موجودة");
    originalPurchase = { id: snap.id, ...snap.data() };

    // Fetch other returns for this purchase invoice (excluding current return!)
    const returnedMap = {};
    const qRet = query(COLS.purchaseReturns(), where("originalPurchaseId", "==", originalPurchase.id));
    const snapRet = await getDocs(qRet);
    snapRet.docs.forEach(docSnap => {
      if (docSnap.id === id) return; // skip this return
      const other = docSnap.data();
      if (other.status !== "cancelled") {
        (other.lines || []).forEach(line => {
          returnedMap[line.productId] = (returnedMap[line.productId] || 0) + (line.qty || 0);
        });
      }
    });

    const currentWhId = ret.warehouseId || originalPurchase.warehouseId;
    const stockMap = await fetchWarehouseStockForLines(currentWhId, originalPurchase.lines || []);

    const currentLinesMap = {};
    (ret.lines || []).forEach(l => {
      currentLinesMap[l.productId] = l;
    });

    returnLines = (originalPurchase.lines || []).map(l => {
      const alreadyReturned = returnedMap[l.productId] || 0;
      const invoiceReturnable = Math.max(0, (l.qty || 0) - alreadyReturned);
      const currStock = stockMap[l.productId] !== undefined ? stockMap[l.productId] : 0;
      const existingLine = currentLinesMap[l.productId];
      const thisReturnQty = existingLine ? (existingLine.qty || 0) : 0;
      const maxReturnable = Math.min(invoiceReturnable, currStock + thisReturnQty);

      return {
        ...l,
        originalQty: l.qty || 0,
        alreadyReturned: alreadyReturned,
        invoiceReturnable: invoiceReturnable,
        currentStock: currStock,
        maxReturnable: maxReturnable,
        taxCategory: l.taxCategory || "S",
        taxRate: (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 15,
        unit: l.unit || "حبة",
        qty: thisReturnQty,
        oldQty: thisReturnQty,
      };
    });

    renderPurchaseReturnLines();
    updatePurchaseReturnTotals();
    openModal("pr-modal");
  } catch (err) {
    (window.showToast || alert)("خطأ في فتح التعديل: " + err.message, "error");
  }
};

// ─── Delete Purchase Return ───────────────────────────────────
window.deletePurchaseReturn = async (id) => {
  try {
    const ret = await getById("purchaseReturns", id);
    if (!ret) throw new Error("لم يتم العثور على الإشعار المدين");

    const conf = window.showConfirm
      ? await window.showConfirm(`هل أنت متأكد من حذف الإشعار المدين "${ret.number}" نهائياً؟\nسيتم إعادة الأصناف المرجعة إلى رصيد المستودع (${ret.warehouseName || "المستودع"}) وإلغاء القيد وعكس رصيد المورد.`, "تأكيد حذف الإشعار المدين")
      : confirm(`هل أنت متأكد من حذف الإشعار المدين "${ret.number}" نهائياً؟`);
    if (!conf) return;

    // 1. Reverse stock: add returned quantities back to warehouse
    const whId = ret.warehouseId;
    if (whId && Array.isArray(ret.lines)) {
      for (const line of ret.lines) {
        if (!line.productId || !(line.qty > 0)) continue;
        try {
          await adjustStock(whId, line.productId, line.qty, {
            type: "purchase_return_reverse",
            sourceType: "purchaseReturn",
            sourceId: id,
            txDocId: `tx_pur_ret_rev_${id}_${Date.now()}_${line.productId}`,
            documentNumber: ret.number,
            notes: `إلغاء مردود مشتريات (إشعار مدين ${ret.number}) — إعادة ${line.qty} ${line.unit || ""} للمستودع`
          });
        } catch (stkErr) {
          console.warn("[deletePurchaseReturn] Stock reversal warning:", stkErr.message);
        }
      }
    }

    // 2. Delete linked Journal Entry
    if (ret.journalEntryId) {
      try {
        await deleteJournalEntry(ret.journalEntryId);
        console.log(`[deletePurchaseReturn] Deleted JE ${ret.journalEntryId}`);
      } catch (jeErr) {
        console.warn("[deletePurchaseReturn] JE delete error:", jeErr.message);
      }
    }
    for (const sKey of [id, ret.number]) {
      try {
        const jeSnap = await getDocs(
          query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
            where("sourceType", "==", "purchaseReturn"),
            where("sourceId", "==", sKey))
        );
        for (const jeDoc of jeSnap.docs) {
          await deleteJournalEntry(jeDoc.id);
        }
      } catch (_) {}
    }

    // 3. Reverse cash / bank transactions if any
    try {
      const qCash = query(collection(db, `companies/${COMPANY_ID}/cashTransactions`),
        where("sourceId", "==", id), where("sourceType", "==", "purchaseReturn"));
      const cashSnap = await getDocs(qCash);
      for (const cd of cashSnap.docs) {
        await remove(COLS.cashTransactions ? COLS.cashTransactions() : "cashTransactions", cd.id);
      }
      const qBank = query(collection(db, `companies/${COMPANY_ID}/bankTransactions`),
        where("sourceId", "==", id), where("sourceType", "==", "purchaseReturn"));
      const bankSnap = await getDocs(qBank);
      for (const bd of bankSnap.docs) {
        await remove(COLS.bankTransactions ? COLS.bankTransactions() : "bankTransactions", bd.id);
      }
    } catch (cbErr) {
      console.warn("[deletePurchaseReturn] Cash/bank cleanup warning:", cbErr);
    }

    // 4. Reverse Supplier Balance
    const totalWithVat = ret.totalWithVat || ret.total || 0;
    if (ret.supplierId && totalWithVat > 0 && ret.paymentMethod !== "cash") {
      try {
        const { increment, updateDoc, doc: fsDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const suppRef = fsDoc(db, `companies/${COMPANY_ID}/suppliers`, ret.supplierId);
        await updateDoc(suppRef, {
          balance: increment(totalWithVat),
          updatedAt: serverTimestamp()
        });
      } catch (suppErr) {
        console.warn("[deletePurchaseReturn] Supplier balance reverse warning:", suppErr.message);
      }
    }

    // 5. Delete Return document
    await remove(COLS.purchaseReturns(), id);

    if (ret.supplierId) {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(ret.supplierId)).catch(e => console.warn(e));
    }

    (window.showToast || alert)(`✅ تم حذف الإشعار المدين ${ret.number} وإعادة الأصناف للمستودع وتحديث الحسابات بنجاح`, "success");
    await loadPurchaseReturnsList();
  } catch (err) {
    (window.showToast || alert)("خطأ في الحذف: " + err.message, "error");
  }
};

// ─── Print Purchase Return (Professional A4 Debit Note) ───────
window.printPurchaseReturn = async (id) => {
  try {
    let r = typeof id === "object" ? id : null;
    if (!r) {
      r = await getById("purchaseReturns", id);
    }
    if (!r) throw new Error("لم يتم العثور على الإشعار المدين");

    // Fetch company settings
    let company = {};
    try { company = JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch (_) {}
    try {
      const [compSnap, logoSnap] = await Promise.all([
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
      ]);
      if (compSnap.exists()) Object.assign(company, compSnap.data());
      if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
    } catch (_) {}

    const companyName = company.name || company.companyName || "مؤسسة ادهام للمواد الغذائية";
    const companyVAT  = company.vatNumber || company.vat || "300000000000003";
    const companyCR   = company.crNumber || company.commercialRegistration || "";
    const companyPhone = company.phone || "";
    const companyAddr  = [company.address, company.city, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
    const companyLogo = company.logoUrl || "";

    // Fetch supplier info
    let supVat = "";
    let supPhone = "";
    let supAddr = "";
    let supCR = "";
    if (r.supplierId) {
      try {
        const sDoc = await getById("suppliers", r.supplierId);
        if (sDoc) {
          supVat = sDoc.vatNumber || sDoc.vat || "";
          supPhone = sDoc.phone || "";
          supAddr = sDoc.address || "";
          supCR = sDoc.crNumber || "";
        }
      } catch (_) {}
    }

    const subtotal = parseFloat(r.subtotal || 0);
    const vat = parseFloat(r.totalVat || 0);
    const grand = parseFloat(r.totalWithVat || (subtotal + vat));
    const words = numberToArabicWords(grand);

    const lines = r.lines || [];
    const linesHtml = lines.map((l, i) => {
      const lTotal = (l.qty || 0) * (l.unitPrice || 0) * (1 - (l.discount || 0)/100);
      const isExempt = (l.taxCategory === "E" || l.taxCategory === "Z" || l.taxRate === 0);
      const lVat = isExempt ? 0 : lTotal * 0.15;
      const lWithVat = lTotal + lVat;
      return `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td style="font-family:monospace; text-align:center;">${l.sku || "—"}</td>
          <td><strong>${l.productName || "—"}</strong></td>
          <td style="text-align:center;">${l.unit || "حبة"}</td>
          <td style="text-align:center; font-weight:bold; font-family:monospace;">${l.qty}</td>
          <td style="text-align:left; font-family:monospace;">${(l.unitPrice || 0).toFixed(2)}</td>
          <td style="text-align:center;">${isExempt ? "0%" : "15%"}</td>
          <td style="text-align:left; font-family:monospace;">${lVat.toFixed(2)}</td>
          <td style="text-align:left; font-weight:bold; font-family:monospace;">${lWithVat.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار مدين ضريبي — ${r.number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background:#fff; color:#1e293b; padding:24px; direction:rtl; font-size:12px; }
    .print-container { max-width:850px; margin:0 auto; border:1px solid #cbd5e1; border-radius:8px; padding:28px; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2563eb; padding-bottom:18px; margin-bottom:18px; }
    .header-logo { max-height:75px; max-width:180px; object-fit:contain; }
    .header-info h2 { font-size:20px; font-weight:900; color:#1e3a8a; margin-bottom:4px; }
    .header-info p { font-size:11px; color:#64748b; margin:2px 0; }
    .doc-title-badge { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px 18px; text-align:center; }
    .doc-title-badge h1 { font-size:18px; font-weight:900; color:#1e40af; margin:0; }
    .doc-title-badge div { font-size:12px; font-weight:700; color:#3b82f6; margin-top:2px; }
    .doc-title-badge .dn-num { font-family:monospace; font-size:15px; font-weight:900; color:#0f172a; margin-top:4px; }
    
    .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
    .meta-box { border:1px solid #e2e8f0; border-radius:6px; padding:12px; background:#f8fafc; font-size:11.5px; }
    .meta-box h3 { font-size:12px; font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px; }
    .meta-row { display:flex; justify-content:space-between; margin-bottom:4px; }
    .meta-row .lbl { color:#64748b; }
    .meta-row .val { font-weight:700; color:#0f172a; }
    
    table { width:100%; border-collapse:collapse; margin-bottom:18px; font-size:11.5px; }
    th { background:#f1f5f9; color:#334155; font-weight:800; border:1px solid #cbd5e1; padding:8px 6px; text-align:center; }
    td { border:1px solid #e2e8f0; padding:7px 6px; }
    
    .summary-grid { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; gap:20px; }
    .tafqeet-box { flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; font-size:11.5px; }
    .totals-box { width:280px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; }
    .tot-row { display:flex; justify-content:space-between; padding:7px 12px; border-bottom:1px solid #e2e8f0; font-size:11.5px; }
    .tot-row.grand { background:#1e40af; color:#fff; font-size:13px; font-weight:900; border-bottom:none; }
    
    .signatures { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-top:28px; text-align:center; }
    .sig-card { border-top:1px dashed #94a3b8; padding-top:10px; font-size:11px; color:#475569; }
    .sig-card strong { display:block; font-size:12px; color:#0f172a; margin-bottom:30px; }
    
    @media print {
      body { padding:0; }
      .print-container { border:none; padding:10px; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="no-print" style="text-align:left; margin-bottom:12px;">
      <button onclick="window.print()" style="padding:8px 18px; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">🖨️ طباعة الإشعار</button>
      <button onclick="window.close()" style="padding:8px 14px; background:#e2e8f0; color:#1e293b; border:none; border-radius:6px; cursor:pointer; margin-right:8px;">إغلاق</button>
    </div>

    <div class="header">
      <div class="header-info">
        <h2>${companyName}</h2>
        ${companyCR ? `<p>سجل تجاري: <strong>${companyCR}</strong></p>` : ""}
        <p>الرقم الضريبي: <strong>${companyVAT}</strong></p>
        <p>العنوان: ${companyAddr} ${companyPhone ? `| هاتف: ${companyPhone}` : ""}</p>
      </div>
      <div class="doc-title-badge">
        <h1>إشعار مدين ضريبي</h1>
        <div>TAX DEBIT NOTE (مردود مشتريات)</div>
        <div class="dn-num">${r.number}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>بيانات الإشعار المدين</h3>
        <div class="meta-row"><span class="lbl">رقم الإشعار:</span><span class="val mono">${r.number}</span></div>
        <div class="meta-row"><span class="lbl">تاريخ الإشعار:</span><span class="val">${formatDate(r.date || r.createdAt)}</span></div>
        <div class="meta-row"><span class="lbl">فاتورة الشراء الأصلية:</span><span class="val mono">${r.originalPurchaseNumber || "—"}</span></div>
        <div class="meta-row"><span class="lbl">المستودع المرجَع منه:</span><span class="val">${r.warehouseName || "—"}</span></div>
        <div class="meta-row"><span class="lbl">طريقة التسوية:</span><span class="val">${r.paymentMethod === "cash" ? "استرداد نقدي" : (r.paymentMethod === "bank" ? "تحويل بنكي" : "خصم من حساب المورد (آجل)")}</span></div>
        ${r.reason ? `<div class="meta-row"><span class="lbl">سبب الإرجاع:</span><span class="val">${r.reason}</span></div>` : ""}
      </div>
      <div class="meta-box">
        <h3>بيانات المورد (الدائن)</h3>
        <div class="meta-row"><span class="lbl">اسم المورد:</span><span class="val">${r.supplierName || "—"}</span></div>
        ${supVat ? `<div class="meta-row"><span class="lbl">الرقم الضريبي:</span><span class="val mono">${supVat}</span></div>` : ""}
        ${supCR ? `<div class="meta-row"><span class="lbl">السجل التجاري:</span><span class="val mono">${supCR}</span></div>` : ""}
        ${supPhone ? `<div class="meta-row"><span class="lbl">الهاتف:</span><span class="val mono">${supPhone}</span></div>` : ""}
        ${supAddr ? `<div class="meta-row"><span class="lbl">العنوان:</span><span class="val">${supAddr}</span></div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px;">#</th>
          <th style="width:90px;">الكود</th>
          <th>بيان الصنف</th>
          <th style="width:50px;">الوحدة</th>
          <th style="width:60px;">الكمية</th>
          <th style="width:75px;">السعر</th>
          <th style="width:45px;">الضريبة</th>
          <th style="width:70px;">مبلغ VAT</th>
          <th style="width:85px;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="tafqeet-box">
        <div style="font-weight:700; margin-bottom:4px; color:#475569;">المبلغ كتابةً:</div>
        <div style="font-size:12px; font-weight:800; color:#1e3a8a;">${words}</div>
        <div style="margin-top:10px; font-size:10px; color:#94a3b8;">
          * يعتبر هذا الإشعار مستنداً ضريبياً رسمياً لتخفيض قيمة المشتريات المذكورة أعلاه ورد الضريبة وفقاً للائحة هيئة الزكاة والضريبة والجمارك (ZATCA).
        </div>
      </div>
      <div class="totals-box">
        <div class="tot-row"><span>المجموع الخاضع للضريبة:</span><span class="mono font-bold">${subtotal.toFixed(2)} ر.س</span></div>
        <div class="tot-row"><span>ضريبة القيمة المضافة (15%):</span><span class="mono font-bold">${vat.toFixed(2)} ر.س</span></div>
        <div class="tot-row grand"><span>الصافي المسترد / المخصوم:</span><span class="mono">${grand.toFixed(2)} ر.س</span></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-card">
        <strong>أمين المستودع (المُسلّم)</strong>
        <span>التوقيع: ............................</span>
      </div>
      <div class="sig-card">
        <strong>مندوب المورد (المُستلِم)</strong>
        <span>الاسم والتوقيع: ............................</span>
      </div>
      <div class="sig-card">
        <strong>المحاسب / الإدارة المالية</strong>
        <span>الختم والاعتماد: ............................</span>
      </div>
    </div>

    <div style="text-align:center; font-size:9px; color:#94a3b8; margin-top:24px; border-top:1px solid #f1f5f9; padding-top:8px;">
      نظام إدهام ERP — طُبع بتاريخ ${new Date().toLocaleDateString("ar-SA")} ${new Date().toLocaleTimeString("ar-SA")}
    </div>
  </div>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=850,height=1000");
    if (!printWin) {
      alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
      return;
    }
    printWin.document.write(html);
    printWin.document.close();
    printWin.onload = () => setTimeout(() => printWin.print(), 500);
  } catch (err) {
    (window.showToast || alert)("خطأ في الطباعة: " + err.message, "error");
  }
};


