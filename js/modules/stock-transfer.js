// ============================================================
// IDHAM ERP — Stock Transfer Module (تحويل بضاعة بين المخازن)
// Multi-item transfer with two-step workflow (In Transit / Received)
// ============================================================
import { COLS, create, update, getAll, getStockForProduct, adjustStock, adjustStockBulk, generateInvoiceNumber, createJournalEntry, deleteDoc } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, collection, deleteDoc as fbDeleteDoc } from "../utils/db.js";
import { formatQuantity, formatDate, formatDateLong, todayString, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// ──────────────────────────────────────────
// القيد المحاسبي التلقائي للتحويل المخزني — Stock Transfer Auto JE
// ──────────────────────────────────────────

// تحديد حساب المخزون بناءً على المخزن
// الأولوية: sourceEntityId (مرتبط مسبقاً) ← اسم المخزن ← الحساب الأب
async function getWarehouseInventoryAccount(warehouseId, warehouseName) {
  const isVehicle = /سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(warehouseName || "");
  const parentCode = isVehicle ? "1-1-4-1-02" : "1-1-4-1";

  try {
    const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);

    // ── الأولوية 1: البحث بـ sourceEntityId (أدق وأضمن من الاسم) ──
    if (warehouseId) {
      const byEntityQ    = query(colRef, where("sourceEntityId", "==", warehouseId));
      const byEntitySnap = await getDocs(byEntityQ);
      if (!byEntitySnap.empty) {
        const doc = byEntitySnap.docs[0];
        const d   = doc.data();
        console.log(`[TransferJE] ✅ حساب بـ sourceEntityId: ${d.code} - ${d.name}`);
        return { code: d.code, id: doc.id, name: d.name };
      }
    }

    // ── الأولوية 2: البحث بالتطابق الكامل للاسم ──
    const subQ    = query(colRef, where("parentCode", "==", parentCode));
    const subSnap = await getDocs(subQ);
    const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const wn = (warehouseName || "").trim().toLowerCase();
    for (const acc of subs) {
      const accName = (acc.name || "").toLowerCase();
      if (accName === wn || accName.includes(wn) || wn.includes(accName)) {
        return { code: acc.code, id: acc.id, name: acc.name };
      }
    }

    // ── الأولوية 3: الحساب الأب حسب نوع المخزن ──
    if (isVehicle) {
      return { code: "1-1-4-1-02", id: "1-1-4-1-02", name: "مخزون سيارات التوزيع" };
    } else {
      return { code: "1-1-4-1-01", id: "1-1-4-1-01", name: "مخزون المستودع الرئيسي" };
    }
  } catch (e) {
    console.warn("[TransferJE] COA lookup failed:", e.message);
  }

  return {
    code: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01",
    id:   isVehicle ? "1-1-4-1-02" : "1-1-4-1-01",
    name: isVehicle ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسي"
  };
}


async function getProductCostPrice(productId) {
  try {
    const pSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/products`, productId));
    if (pSnap.exists()) {
      const p = pSnap.data();
      const cost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
      if (cost > 0.001) return cost;
      const sale = parseFloat(p.salePrice || p.priceRetail || 0);
      if (sale > 0.001) return Math.round(sale * 0.7 * 100) / 100;
    }
  } catch {}
  return 1; // فلبك 1 ريال لضمان توليد القيد وعدم الفشل
}

// إنشاء القيد المحاسبي للتحويل المخزني
async function createTransferJE(transfer) {
  // حساب إجمالي التكلفة من خطوط التحويل
  let totalCost = 0;
  for (const line of (transfer.lines || [])) {
    const cost = line.costPrice || await getProductCostPrice(line.productId);
    totalCost += Math.round(cost * line.qty * 100) / 100;
  }

  if (totalCost < 0.001) {
    totalCost = (transfer.lines || []).reduce((s, l) => s + (l.qty || 1), 0);
  }

  // منع تكرار القيد
  const existQ = query(COLS.journalEntries(),
    where("sourceType", "==", "stockTransfer"),
    where("sourceId",   "==", transfer.id));
  const existSnap = await getDocs(existQ);
  if (!existSnap.empty) {
    console.log("[TransferJE] القيد موجود بالفعل للتحويل", transfer.id);
    return existSnap.docs[0].id;
  }

  // جلب حسابي المخزن (مصدر ووجهة)
  const fromAcc = await getWarehouseInventoryAccount(transfer.fromWarehouseId, transfer.fromWarehouseName);
  const toAcc   = await getWarehouseInventoryAccount(transfer.toWarehouseId,   transfer.toWarehouseName);

  const jeId = await createJournalEntry({
    date:        transfer.date || new Date().toISOString().slice(0, 10),
    description: `تحويل مخزني ${transfer.number} — من ${transfer.fromWarehouseName} إلى ${transfer.toWarehouseName}`,
    lines: [
      {
        accountCode: toAcc.code,
        accountId:   toAcc.id,
        accountName: toAcc.name,
        debit:       Math.round(totalCost * 100) / 100,
        credit:      0,
        note: `استلام مخزون — تحويل ${transfer.number}`,
      },
      {
        accountCode: fromAcc.code,
        accountId:   fromAcc.id,
        accountName: fromAcc.name,
        debit:       0,
        credit:      Math.round(totalCost * 100) / 100,
        note: `صرف مخزون — تحويل ${transfer.number}`,
      },
    ],
    sourceType:    "stockTransfer",
    sourceId:      transfer.id,
    status:        "posted",
    createdByName: window._transferUser?.displayName || window._transferUser?.email || "النظام",
  });

  console.log(`[TransferJE] تم إنشاء القيد للتحويل ${transfer.number} — قيمة: ${totalCost}`);
  return jeId;
}

let warehouses = [];
let allProducts = [];
let allCategories = [];
let transferLines = [];
let selectedTransfer = null;

// Helper to generate skeleton loading rows
function getSkeletonRows(cols, rows) {
  let html = "";
  for (let r = 0; r < rows; r++) {
    html += '<tr class="skeleton-row">';
    for (let c = 0; c < cols; c++) {
      const width = 40 + Math.floor(Math.random() * 80);
      html += `<td><div class="sk" style="width:${width}px; height:12px; margin:4px 0;"></div></td>`;
    }
    html += '</tr>';
  }
  return html;
}

export async function render(container, user) {
  window._transferUser = user;
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="st-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="st-to" value="${todayString()}" />
      </div>
      <div style="margin-right:auto;">
        <button class="btn btn-primary" onclick="openTransferModal()">+ أمر تحويل جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تحويل بضاعة بين المخازن</h1>
        <p class="page-subtitle" id="st-count">سجل حركة التحويلات بين المخازن</p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-20" id="st-kpi-area">
        <div class="kpi-card g-blue">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي التحويلات</div>
            <div class="kpi-value mono" id="st-kpi-total">—</div></div></div>
        <div class="kpi-card g-orange">
          <div class="kpi-icon">🚚</div>
          <div class="kpi-content"><div class="kpi-label">قيد النقل (ترانزيت)</div>
            <div class="kpi-value mono" id="st-kpi-transit">—</div></div></div>
        <div class="kpi-card g-green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content"><div class="kpi-label">تم الاستلام مخزنياً</div>
            <div class="kpi-value mono" id="st-kpi-received">—</div></div></div>
        <div class="kpi-card g-purple">
          <div class="kpi-icon">🔢</div>
          <div class="kpi-content"><div class="kpi-label">عدد الأصناف المحولة</div>
            <div class="kpi-value mono" id="st-kpi-items">—</div></div></div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم التحويل</th>
                <th>التاريخ</th>
                <th>من مخزن</th>
                <th>إلى مخزن</th>
                <th>الأصناف</th>
                <th>الحالة</th>
                <th>البيان / ملاحظات</th>
                <th>المستخدم</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="st-tbody">
              <tr><td colspan="9" style="text-align:center;padding:20px;">جاري التحميل...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Stock Transfer Modal -->
    <div class="modal-overlay" id="transfer-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">أمر تحويل مخزني جديد</h3>
          <button class="modal-close" onclick="closeModal('transfer-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>الرقم المرجعي</label>
              <input type="text" id="st-number" class="input mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>المخزن المصدر (من) *</label>
              <select id="st-from-wh" onchange="updateAllAvailableStock()">
                <option value="">اختر المخزن المصدر</option>
              </select>
            </div>
            <div class="form-group">
              <label>المخزن المستلم (إلى) *</label>
              <select id="st-to-wh">
                <option value="">اختر المخزن المستلم</option>
              </select>
            </div>
          </div>

          <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13px; color:var(--primary);">📋 الأصناف المراد تحويلها</strong>
              <div style="display:flex; gap:8px; align-items:center;">
                <select id="st-product-category-filter" class="input" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                  <option value="">كل الفئات</option>
                </select>
                <div class="autocomplete-container" style="width:360px;">
                  <input type="text" id="st-product-search" class="input" style="height:34px; font-size:12px;" placeholder="ابحث باسم الصنف أو الكود للإضافة…" autocomplete="off" />
                  <div class="autocomplete-results hidden" id="st-product-results"></div>
                </div>
              </div>
            </div>

            <!-- Transfer Items Lines Table -->
            <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; background:#fff;">
              <table style="width:100%; font-size:12px; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                    <th style="padding:8px 10px; text-align:right;">#</th>
                    <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                    <th style="padding:8px 10px; text-align:right;">الكود</th>
                    <th style="padding:8px 10px; text-align:right;">الوحدة</th>
                    <th style="padding:8px 10px; text-align:right; color:var(--primary);">الرصيد المتاح</th>
                    <th style="padding:8px 10px; text-align:right; width:100px;">الكمية</th>
                    <th style="padding:8px 6px;"></th>
                  </tr>
                </thead>
                <tbody id="st-lines-tbody">
                  <tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="st-date" class="input" value="${todayString()}" />
            </div>
            <div class="form-group">
              <label>ملاحظات / سبب التحويل</label>
              <input type="text" id="st-notes" class="input" placeholder="مثال: تغذية فرع شمال، إعادة توزيع..." />
            </div>
          </div>

          <div id="st-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('transfer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="executeTransfer()" id="exec-st-btn">💾 تنفيذ التحويل (قيد النقل)</button>
        </div>
      </div>
    </div>

    <!-- View Transfer Details Modal -->
    <div class="modal-overlay" id="view-transfer-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="view-st-title">تفاصيل التحويل المخزني</h3>
          <button class="modal-close" onclick="closeModal('view-transfer-modal')">×</button>
        </div>
        <div class="modal-body" id="view-st-body" style="padding:20px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('view-transfer-modal')">إغلاق</button>
          <button class="btn btn-ghost" id="st-print-btn" onclick="printStockTransfer()" style="display:inline-flex; align-items:center; gap:6px;">🖨️ طباعة سند التحويل</button>
          <button class="btn btn-ghost text-bad" id="st-cancel-btn" onclick="cancelTransfer()" style="margin-right:auto;">🚫 إلغاء الأمر</button>
          <button class="btn btn-secondary" id="st-edit-btn" onclick="openEditTransferModal()" style="display:none;">✏️ تعديل الأمر</button>
          <button class="btn btn-primary" id="st-confirm-btn" onclick="confirmReceipt()">✅ تأكيد الاستلام الفعلي في المخزن المستلم</button>
          <button class="btn btn-primary" id="st-approve-btn" onclick="approveTransferRequest()" style="background-color:var(--good); border-color:var(--good); margin-left:8px; display:none;">✔️ موافقة وشحن السيارة</button>
          <button class="btn btn-ghost text-bad" id="st-reject-btn" onclick="rejectTransferRequest()" style="margin-right:auto; display:none;">❌ رفض الطلب</button>
        </div>
      </div>
    </div>`;

  // ربط أحداث التغيير لفلاتر تاريخ التحويل
  document.getElementById("st-from")?.addEventListener("change", () => loadTransferHistory());
  document.getElementById("st-to")?.addEventListener("change", () => loadTransferHistory());

  await loadWarehousesList();
  await loadTransferHistory();
  setupProductSearch();
}

async function loadWarehousesList() {
  try {
    warehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
    const fromSel = document.getElementById("st-from-wh");
    const toSel   = document.getElementById("st-to-wh");
    if (fromSel && toSel) {
      const opts = warehouses.map(w => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join("");
      fromSel.innerHTML = '<option value="">اختر المخزن المصدر</option>' + opts;
      toSel.innerHTML   = '<option value="">اختر المخزن المستلم</option>' + opts;
    }

    // Preload products & categories in background
    getAll(COLS.products(), [orderBy("name")]).then(p => { allProducts = p; });
    getAll(COLS.categories(), [orderBy("name")]).then(cats => {
      allCategories = cats;
      const catFilter = document.getElementById("st-product-category-filter");
      if (catFilter) {
        catFilter.innerHTML = '<option value="">كل الفئات</option>' + 
          allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      }
    });
  } catch {}
}

async function loadTransferHistory() {
  const tbody = document.getElementById("st-tbody");
  if (!tbody) return;

  tbody.innerHTML = getSkeletonRows(9, 8);

  const from = document.getElementById("st-from")?.value;
  const to   = document.getElementById("st-to")?.value;

  try {
    let q = collection(db, `companies/${COMPANY_ID}/stockTransfers`);
    const constraints = [];
    if (from) {
      constraints.push(where("date", ">=", from));
    }
    if (to) {
      constraints.push(where("date", "<=", to));
    }

    if (!from && !to) {
      q = query(q, ...constraints, orderBy("date", "desc"), limit(100));
    } else {
      q = query(q, ...constraints, orderBy("date", "desc"));
    }

    const snap = await getDocs(q);
    let transfers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // ── Client-side sort: newest first ───────────────────────────────────────
    // Firestore orders by `date` (string) only; createdAt (Timestamp) gives the
    // precise creation time and must be used as the primary sort key.
    transfers.sort((a, b) => {
      // 1. createdAt Timestamp (most precise)
      const tsA = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds * 1000 ?? 0;
      const tsB = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds * 1000 ?? 0;
      if (tsB !== tsA) return tsB - tsA;

      // 2. date string fallback (YYYY-MM-DD)
      const dA = a.date || "";
      const dB = b.date || "";
      if (dB > dA) return 1;
      if (dB < dA) return -1;

      // 3. transfer number (e.g. TR-8951288) as tie-breaker
      const nA = parseInt((a.number || "0").replace(/\D/g, ""), 10) || 0;
      const nB = parseInt((b.number || "0").replace(/\D/g, ""), 10) || 0;
      return nB - nA;
    });

    document.getElementById("st-count").textContent = `${transfers.length} أمر تحويل مخزني`;

    // Calculate KPI values
    const totalCount = transfers.length;
    const transitCount = transfers.filter(t => t.status === "in_transit").length;
    const receivedCount = transfers.filter(t => t.status === "received").length;
    const itemsCount = transfers.reduce((sum, t) => sum + (t.lines || []).length, 0);

    const elTotal = document.getElementById("st-kpi-total"); if (elTotal) elTotal.textContent = totalCount;
    const elTransit = document.getElementById("st-kpi-transit"); if (elTransit) elTransit.textContent = transitCount;
    const elReceived = document.getElementById("st-kpi-received"); if (elReceived) elReceived.textContent = receivedCount;
    const elItems = document.getElementById("st-kpi-items"); if (elItems) elItems.textContent = itemsCount;

    if (transfers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد تحويلات مخزنية مسجلة</td></tr>`;
      return;
    }

    tbody.innerHTML = transfers.map(t => {
      let statusBadge = "";
      if (t.status === "requested") {
        statusBadge = `<span class="badge indigo">⏳ طلب شحن</span>`;
      } else if (t.status === "in_transit") {
        statusBadge = `<span class="badge warn">🚚 قيد النقل</span>`;
      } else if (t.status === "received") {
        statusBadge = `<span class="badge good">✅ تم الاستلام</span>`;
      } else {
        statusBadge = `<span class="badge neutral">🚫 ملغى</span>`;
      }

      return `
        <tr style="cursor:pointer;" onclick="viewTransfer('${t.id}')">
          <td class="mono font-bold text-indigo">${t.number || t.id.slice(0,8)}</td>
          <td class="dim">${formatDate(t.createdAt || t.date)}</td>
          <td><span class="badge neutral">${t.fromWarehouseName || t.fromWarehouseId}</span></td>
          <td><span class="badge indigo">${t.toWarehouseName || t.toWarehouseId}</span></td>
          <td class="mono font-semibold">${(t.lines || []).length} أصناف</td>
          <td>${statusBadge}</td>
          <td class="dim">${t.notes || "—"}</td>
          <td class="dim" style="font-size:11px;">${t.createdByName || "النظام"}</td>
          <td>
            <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewTransfer('${t.id}')">👁️</button>
          </td>
        </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

function setupProductSearch() {
  const input = document.getElementById("st-product-search");
  const results = document.getElementById("st-product-results");
  const catFilter = document.getElementById("st-product-category-filter");
  if (!input) return;

  const performSearch = () => {
    const term = input.value.trim().toLowerCase();
    const catId = catFilter ? catFilter.value : "";

    if (!term && !catId) {
      results.classList.add("hidden");
      return;
    }

    let matched = allProducts;
    if (catId) {
      matched = matched.filter(p => p.category === catId);
    }
    if (term) {
      matched = matched.filter(p =>
        (p.name||"").toLowerCase().includes(term) ||
        (p.sku||"").toLowerCase().includes(term)  ||
        (p.barcode||"").includes(term)
      );
    }

    matched = matched.slice(0, 15);

    if (!matched.length) {
      results.innerHTML = `<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>`;
      results.classList.remove("hidden");
      return;
    }

    const whId = document.getElementById("st-from-wh")?.value;
    const cachedObj = window.ERP_CACHE[`companies/${COMPANY_ID}/stockByWarehouse`];
    const stockCache = cachedObj && Array.isArray(cachedObj.data) ? cachedObj.data : [];

    results.innerHTML = matched.map(p => {
      const stockItem = stockCache.find(s => s.productId === p.id && s.warehouseId === whId);
      const avail = stockItem ? stockItem.qty : 0;
      return `
        <div class="autocomplete-item" onclick="addTransferLine('${p.id}','${(p.name||"").replace(/'/g,"\\'")}','${p.unit || "PCS"}','${p.sku || ""}')">
          <div class="flex justify-between">
            <span>${p.name}</span>
            <span class="badge ${avail > 0 ? 'good' : 'bad'}" style="font-size:10px;">المتاح: ${avail}</span>
          </div>
          <div class="item-code">${p.sku || ""} | ${p.unit || ""}</div>
        </div>
      `;
    }).join("");
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);
  if (catFilter) {
    catFilter.addEventListener("change", performSearch);
  }

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target)))
      results.classList.add("hidden");
  });
}

window.addTransferLine = async (productId, productName, unit, sku) => {
  document.getElementById("st-product-search").value = "";
  document.getElementById("st-product-results").classList.add("hidden");

  if (transferLines.some(l => l.productId === productId)) {
    showToast("الصنف مضاف بالفعل", "warn");
    return;
  }

  const fromWh = document.getElementById("st-from-wh").value;
  let availQty = 0;
  if (fromWh) {
    const stockList = await getStockForProduct(productId);
    const item = stockList.find(s => s.warehouseId === fromWh);
    availQty = item ? item.qty : 0;
  }

  const prod = allProducts.find(p => p.id === productId);
  const costPrice = prod ? parseFloat(prod.averageCost || prod.costPrice || prod.purchasePrice || 0) : 0;

  transferLines.push({
    productId, productName, unit, sku,
    qty: 1,
    availQty,
    costPrice
  });

  renderTransferLines();
};

window.updateAllAvailableStock = async () => {
  const fromWh = document.getElementById("st-from-wh").value;
  if (!fromWh) {
    transferLines.forEach(l => l.availQty = 0);
    renderTransferLines();
    return;
  }

  for (const line of transferLines) {
    try {
      const stockList = await getStockForProduct(line.productId);
      const item = stockList.find(s => s.warehouseId === fromWh);
      line.availQty = item ? item.qty : 0;
    } catch {
      line.availQty = 0;
    }
  }
  renderTransferLines();
};

function renderTransferLines() {
  const tbody = document.getElementById("st-lines-tbody");
  if (!tbody) return;

  if (transferLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>`;
    document.getElementById("st-error")?.classList.add("hidden");
    return;
  }

  let hasOverStock = false;
  let overStockNames = [];

  tbody.innerHTML = transferLines.map((line, i) => {
    const isOver = line.qty > line.availQty;
    if (isOver) {
      hasOverStock = true;
      overStockNames.push(`${line.productName} (المطلوب: ${line.qty} > المتاح: ${line.availQty})`);
    }
    return `
      <tr style="border-bottom:1px solid var(--border-soft); ${isOver ? 'background-color:rgba(239,68,68,0.08);' : ''}">
        <td style="padding:6px 10px;color:var(--text-2);width:30px;">${i + 1}</td>
        <td style="padding:6px 10px;font-weight:600;">${line.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${line.sku || "—"}</td>
        <td style="padding:6px 10px;" class="dim">${line.unit || "—"}</td>
        <td style="padding:6px 10px;" class="mono font-semibold ${line.availQty > 0 ? 'text-good' : 'text-bad'}">${line.availQty}</td>
        <td style="padding:6px 10px;width:100px;">
          <input type="number" class="input mono" style="width:90px;height:30px;font-size:12px;${isOver ? 'border-color:var(--bad);background-color:rgba(239,68,68,0.18);color:var(--bad);font-weight:bold;' : ''}"
            value="${line.qty}" min="0.001" step="0.001"
            onchange="updateTransferLineQty(${i},this.value)" oninput="updateTransferLineQty(${i},this.value)" />
        </td>
        <td style="padding:6px 10px;text-align:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="removeTransferLine(${i})" style="color:var(--bad);">✕</button>
        </td>
      </tr>`;
  }).join("");

  const errEl = document.getElementById("st-error");
  const execBtn = document.getElementById("exec-st-btn");

  if (hasOverStock) {
    if (errEl) {
      errEl.innerHTML = `🚨 <strong>تنبيه رصيد غير كافٍ:</strong> الأصناف التالية تزيد عن المتاح بالنظام بالمخزن المصدر:<br>• ${overStockNames.join("<br>• ")}`;
      errEl.classList.remove("hidden");
    }
    if (execBtn) {
      execBtn.disabled = true;
      execBtn.style.opacity = "0.5";
      execBtn.style.cursor = "not-allowed";
    }
  } else {
    if (errEl) errEl.classList.add("hidden");
    if (execBtn) {
      execBtn.disabled = false;
      execBtn.style.opacity = "1";
      execBtn.style.cursor = "pointer";
    }
  }
}

window.updateTransferLineQty = (idx, val) => {
  transferLines[idx].qty = parseFloat(val) || 0;
  renderTransferLines();
};

window.removeTransferLine = (idx) => {
  transferLines.splice(idx, 1);
  renderTransferLines();
};

window.openTransferModal = async () => {
  window._editingTransferId   = null; // وضع إنشاء جديد
  window._editingTransferSnap = null;
  transferLines = [];
  renderTransferLines();
  document.getElementById("st-product-search").value = "";
  document.getElementById("st-notes").value = "";
  document.getElementById("st-error").classList.add("hidden");
  document.getElementById("st-number").value = "جارٍ التوليد...";

  // عنوان المودال — جديد
  const modalTitle = document.querySelector("#transfer-modal .modal-title");
  if (modalTitle) modalTitle.textContent = "أمر تحويل مخزني جديد";
  const execBtn = document.getElementById("exec-st-btn");
  if (execBtn) execBtn.textContent = "💾 تنفيذ التحويل (قيد النقل)";

  openModal("transfer-modal");

  try {
    const num = await generateInvoiceNumber("TR");
    document.getElementById("st-number").value = num;
  } catch {}
};

// ══════════════════════════════════════════════════════
// فتح نموذج التعديل — يملأ الفورم ببيانات الأذن الحالي
// ══════════════════════════════════════════════════════
window.openEditTransferModal = async () => {
  if (!selectedTransfer) return;
  const t = selectedTransfer;

  window._editingTransferId   = t.id;
  window._editingTransferSnap = t; // نسخة القديمة للمقارنة

  // ملء الفورم
  transferLines = (t.lines || []).map(l => ({ ...l })); // نسخ عميق

  // انتظر تحميل المخازن إن لم تُحمل
  if (!warehouses.length) await loadWarehousesList();

  // اختر المخازن
  const fromSel = document.getElementById("st-from-wh");
  const toSel   = document.getElementById("st-to-wh");
  if (fromSel) fromSel.value = t.fromWarehouseId;
  if (toSel)   toSel.value   = t.toWarehouseId;

  document.getElementById("st-number").value = t.number || t.id.slice(0, 8);
  document.getElementById("st-date").value   = t.date || "";
  document.getElementById("st-notes").value  = t.notes || "";
  document.getElementById("st-error").classList.add("hidden");

  renderTransferLines();

  // عنوان المودال — تعديل
  const modalTitle = document.querySelector("#transfer-modal .modal-title");
  if (modalTitle) modalTitle.textContent = `✏️ تعديل أمر التحويل — ${t.number || t.id.slice(0,8)}`;
  const execBtn = document.getElementById("exec-st-btn");
  if (execBtn) execBtn.textContent = "💾 حفظ التعديلات";

  // تحديث الأرصدة المتاحة للمخزن المصدر
  await window.updateAllAvailableStock?.();

  // ── وضع التعديل: أعِد الكميات الأصلية إلى المتاح ──
  // الكميات سبق أُخذت من المستودع عند إنشاء الأذن (in_transit/requested)
  // لذا: الرصيد الفعلي المتاح = الرصيد الحالي + الكمية الأصلية المحجوزة
  const origLines = t.lines || [];
  transferLines.forEach(line => {
    const origLine = origLines.find(ol => ol.productId === line.productId);
    if (origLine && origLine.qty > 0) {
      line.availQty = (line.availQty || 0) + origLine.qty;
      line._origQty = origLine.qty; // نحتفظ بالكمية الأصلية للمقارنة
    }
  });
  renderTransferLines(); // تحديث العرض بالأرصدة المصحّحة

  closeModal("view-transfer-modal");
  openModal("transfer-modal");
};


window.executeTransfer = async () => {
  const errEl = document.getElementById("st-error");
  errEl.classList.add("hidden");

  const fromWh = document.getElementById("st-from-wh").value;
  const toWh   = document.getElementById("st-to-wh").value;
  const date   = document.getElementById("st-date").value;
  const notes  = document.getElementById("st-notes").value.trim();
  const num    = document.getElementById("st-number").value;

  const fromSel = document.getElementById("st-from-wh");
  const toSel   = document.getElementById("st-to-wh");
  const fromWhName = fromSel.options[fromSel.selectedIndex]?.dataset.name || "";
  const toWhName   = toSel.options[toSel.selectedIndex]?.dataset.name || "";

  if (!fromWh || !toWh) { errEl.textContent = "يرجى اختيار المخزن المصدر والمستلم"; errEl.classList.remove("hidden"); return; }
  if (fromWh === toWh) { errEl.textContent = "المخزن المصدر والمستلم متطابقان"; errEl.classList.remove("hidden"); return; }
  if (transferLines.length === 0) { errEl.textContent = "يرجى إضافة صنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }

  // Validate stock level for each line
  for (const line of transferLines) {
    if (line.qty <= 0) { errEl.textContent = `الكمية للصنف ${line.productName} يجب أن تكون أكبر من 0`; errEl.classList.remove("hidden"); return; }
    if (line.qty > line.availQty) {
      errEl.textContent = `رصيد غير كافٍ للصنف ${line.productName} (الكمية المطلوبة: ${line.qty} > المتاح: ${line.availQty})`;
      errEl.classList.remove("hidden");
      return;
    }
  }

  const btn = document.getElementById("exec-st-btn");
  btn.disabled = true;

  // ══════════════════════════════════════════════
  //  وضع التعديل — تحديث أذن موجود بدون تكرار
  // ══════════════════════════════════════════════
  const editingId = window._editingTransferId;

  if (editingId) {
    btn.textContent = "⏳ جارٍ حفظ التعديلات…";
    try {
      // ✅ FIX: دائماً نجلب أحدث نسخة من Firestore عند الحفظ
      // (منع خطأ التعديل المتكرر الذي يستخدم بيانات قديمة)
      const freshDocRef  = doc(db, `companies/${COMPANY_ID}/stockTransfers`, editingId);
      const freshDocSnap = await getDoc(freshDocRef);
      if (!freshDocSnap.exists()) throw new Error("أمر التحويل غير موجود");
      const currentSnap = { id: freshDocSnap.id, ...freshDocSnap.data() };

      const transferData = {
        date,
        fromWarehouseId:   fromWh,
        fromWarehouseName: fromWhName || currentSnap.fromWarehouseName,
        toWarehouseId:     toWh,
        toWarehouseName:   toWhName   || currentSnap.toWarehouseName,
        lines:             transferLines,
        notes,
        updatedAt:         new Date(),
        updatedBy:         window._transferUser?.uid || "system",
        updatedByName:     window._transferUser?.displayName || window._transferUser?.email || "النظام",
      };

      // ── إذا كان الأذن «قيد النقل» أو «تم الاستلام» — يجب تصحيح كميات المخزن ──
      if (currentSnap.status === "in_transit" || currentSnap.status === "received") {
        // بناء خريطة السطور القديمة من أحدث نسخة فعلية (ليس من الذاكرة)
        const oldMap = {};
        for (const ol of (currentSnap.lines || [])) {
          oldMap[ol.productId] = (oldMap[ol.productId] || 0) + ol.qty;
        }
        // بناء خريطة السطور الجديدة
        const newMap = {};
        for (const nl of transferLines) {
          newMap[nl.productId] = (newMap[nl.productId] || 0) + nl.qty;
        }

        // الأصناف الموجودة في القديم والجديد: نعكس الفرق
        const allProductIds = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        const adjustments = [];
        for (const pid of allProductIds) {
          const oldQty = oldMap[pid] || 0;
          const newQty = newMap[pid] || 0;
          const diff   = newQty - oldQty;
          if (Math.abs(diff) > 0.0001) {
            const lineInfo = transferLines.find(l => l.productId === pid) ||
                             (currentSnap.lines || []).find(l => l.productId === pid);

            // 1. تصحيح المخزن المصدر
            adjustments.push({
              warehouseId: currentSnap.fromWarehouseId,
              productId: pid,
              qtyDelta: -diff,
              metadata: {
                type:           diff > 0 ? "transfer_out" : "transfer_cancel",
                sourceType:     "stockTransfer",
                sourceId:       editingId,
                documentNumber: currentSnap.number,
                productName:    lineInfo?.productName || pid,
                notes:          `تعديل أمر التحويل ${currentSnap.number || ""} (المصدر) (فرق: ${diff > 0 ? '-' : '+'}${Math.abs(diff)})`
              }
            });

            // 2. تصحيح المخزن المستلم (فقط إذا كانت الشحنة مستلمة بالفعل)
            if (currentSnap.status === "received") {
              adjustments.push({
                warehouseId: currentSnap.toWarehouseId,
                productId: pid,
                qtyDelta: diff,
                metadata: {
                  type:           diff > 0 ? "transfer_in" : "transfer_cancel",
                  sourceType:     "stockTransfer",
                  sourceId:       editingId,
                  documentNumber: currentSnap.number,
                  productName:    lineInfo?.productName || pid,
                  notes:          `تعديل أمر التحويل ${currentSnap.number || ""} (المستلم) (فرق: ${diff > 0 ? '+' : '-'}${Math.abs(diff)})`
                }
              });
            }
          }
        }
        if (adjustments.length > 0) {
          await adjustStockBulk(adjustments);
        }
      }

      // تحديث المستند
      await update("stockTransfers", editingId, transferData);

      // ── تحديث القيد المحاسبي ──
      try {
        const existQ    = query(COLS.journalEntries(),
          where("sourceType", "==", "stockTransfer"),
          where("sourceId",   "==", editingId));
        const existSnap = await getDocs(existQ);
        for (const jd of existSnap.docs) { await fbDeleteDoc(jd.ref); }
        if (currentSnap.status === "received") {
          await createTransferJE({ ...currentSnap, ...transferData, id: editingId });
        }
      } catch (jeErr) {
        console.warn("[EditTransfer] تحديث القيد فشل (غير حرج):", jeErr.message);
      }

      showToast(`✅ تم تعديل أمر التحويل ${transferData.date ? num : num} بنجاح`, "success");
      window._editingTransferId   = null;
      window._editingTransferSnap = null;
      closeModal("transfer-modal");
      await loadTransferHistory();

    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "💾 حفظ التعديلات";
    }
    return;
  }

  // ══════════════════════════════════════════
  //  وضع الإنشاء — أذن جديد (السلوك القديم)
  // ══════════════════════════════════════════
  btn.textContent = "جارٍ الحفظ قيد النقل…";

  try {
    const transferData = {
      number:            num,
      date,
      fromWarehouseId:   fromWh,
      fromWarehouseName: fromWhName,
      toWarehouseId:     toWh,
      toWarehouseName:   toWhName,
      lines:             transferLines,
      notes,
      status:            "in_transit",
      createdBy:         window._transferUser?.uid || "system",
      createdByName:     window._transferUser?.displayName || window._transferUser?.email || "النظام",
      receivedAt:        null
    };

    // 1. Create transfer record
    const trId = await create(collection(db, `companies/${COMPANY_ID}/stockTransfers`), transferData);

    // 2. Adjust stock in source warehouse (minus qty) in bulk
    const adjustments = transferLines.map(line => ({
      warehouseId: fromWh,
      productId: line.productId,
      qtyDelta: -line.qty,
      metadata: {
        date: date || new Date().toISOString().slice(0, 10),
        type: "transfer_out",
        sourceType: "stockTransfer",
        sourceId: trId,
        documentNumber: num,
        productName: line.productName,
        notes: `قيد النقل إلى ${toWhName} في المستند ${num}`
      }
    }));
    if (adjustments.length > 0) {
      await adjustStockBulk(adjustments);
    }

    // 3. إنشاء القيد المحاسبي التلقائي فوراً للتحويل
    try {
      await createTransferJE({ ...transferData, id: trId });
    } catch (jeErr) {
      console.warn("[StockTransfer] تعذر توليد القيد المحاسبي فوراً:", jeErr.message);
    }

    showToast(`✅ تم حفظ أمر التحويل ${num} وتوليد القيد المحاسبي وحركة كرت الصنف`, "success");
    closeModal("transfer-modal");
    await loadTransferHistory();
  } catch (err) {
    const isQuota = (err?.message || "").includes("Quota exceeded") || (err?.code === "resource-exhausted") || (err?.message || "").includes("429");
    if (isQuota) {
      errEl.innerHTML = `🚨 <strong>تنبيه حصة السيرفر (Quota Exceeded):</strong><br>تم الوصول للحد الأقصى اليومي المجاني لقراءة/كتابة السيرفر (50,000 عملية). يتجدد العداد تلقائياً منتصف الليل، أو يمكنك ترقية باقة الفايربيز إلى (Blaze Plan) لإلغاء الحد اليومي فوراً.`;
    } else {
      errEl.textContent = err.message || "حدث خطأ أثناء حفظ أمر التحويل";
    }
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 تنفيذ التحويل (قيد النقل)";
  }
};

window.viewTransfer = async (id) => {
  const body = document.getElementById("view-st-body");
  body.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div></div>`;
  openModal("view-transfer-modal");

  selectedTransfer = null;
  document.getElementById("st-confirm-btn").style.display = "none";
  document.getElementById("st-cancel-btn").style.display = "none";
  document.getElementById("st-approve-btn").style.display = "none";
  document.getElementById("st-reject-btn").style.display = "none";

  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/stockTransfers`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("أمر التحويل غير موجود");
    const t = { id: snap.id, ...snap.data() };
    selectedTransfer = t;

    let statusBadge = "";
    if (t.status === "requested") {
      statusBadge = `<span class="badge indigo">⏳ طلب شحن</span>`;
      document.getElementById("st-approve-btn").style.display = "";
      document.getElementById("st-reject-btn").style.display = "";
      document.getElementById("st-edit-btn").style.display = ""; // يمكن التعديل
    } else if (t.status === "in_transit") {
      statusBadge = `<span class="badge warn">🚚 قيد النقل</span>`;
      document.getElementById("st-confirm-btn").style.display = "";
      document.getElementById("st-cancel-btn").style.display = "";
      document.getElementById("st-edit-btn").style.display = ""; // يمكن التعديل
    } else if (t.status === "received") {
      statusBadge = `<span class="badge good">✅ تم الاستلام</span>`;
    } else {
      statusBadge = `<span class="badge neutral">🚫 ملغى</span>`;
    }

    // Load products if not loaded to resolve prices
    if (allProducts.length === 0) {
      allProducts = await getAll(COLS.products());
    }

    let totalSellingVal = 0;
    const linesHTML = (t.lines || []).map((l, i) => {
      const p = allProducts.find(prod => prod.id === l.productId);
      const salePrice = p ? (p.salePrice || p.priceRetail || 0) : 0;
      const lineTotal = l.qty * salePrice;
      totalSellingVal += lineTotal;

      return `
        <tr>
          <td style="padding:7px 12px;">${i+1}</td>
          <td style="padding:7px 12px; font-weight:600;">${l.productName}</td>
          <td style="padding:7px 12px;" class="mono">${l.sku || "—"}</td>
          <td style="padding:7px 12px;">${l.unit || "—"}</td>
          <td style="padding:7px 12px;" class="mono font-bold">${formatQuantity(l.qty)}</td>
          <td style="padding:7px 12px;" class="mono text-indigo">${salePrice.toFixed(2)} ر.س</td>
          <td style="padding:7px 12px;" class="mono font-bold text-good">${lineTotal.toFixed(2)} ر.س</td>
        </tr>
      `;
    }).join("");

    body.innerHTML = `
      <div class="grid-2 gap-16 mb-20">
        <div>
          <div class="section-label mb-6">رقم التحويل المرجعي</div>
          <div class="mono font-bold text-indigo text-lg">${t.number || t.id.slice(0,8)}</div>
        </div>
        <div>
          <div class="section-label mb-6">الحالة</div>
          <div>${statusBadge}</div>
        </div>
        <div>
          <div class="section-label mb-6">من مستودع (المصدر)</div>
          <div class="font-semibold">${t.fromWarehouseName || t.fromWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">إلى مستودع (المستلم)</div>
          <div class="font-semibold">${t.toWarehouseName || t.toWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">التاريخ</div>
          <div>${formatDateLong(t.createdAt || t.date)}</div>
        </div>
        <div>
          <div class="section-label mb-6">أنشئ بواسطة</div>
          <div>${t.createdByName || "النظام"}</div>
        </div>
      </div>

      <div class="table-container mb-16">
        <table class="data-dense">
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>الكود</th>
              <th>الوحدة</th>
              <th>الكمية</th>
              <th style="color:var(--brand);">سعر الحبة (بيع)</th>
              <th style="color:var(--good);">إجمالي بيعي</th>
            </tr>
          </thead>
          <tbody>${linesHTML}</tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
        <div style="background:var(--bg-2); padding:10px 16px; border-radius:8px; border:1px solid var(--border); font-size:14px; font-weight:700;">
          إجمالي القيمة البيعية للتحويل: <span class="mono text-indigo">${totalSellingVal.toFixed(2)} ر.س</span>
        </div>
      </div>

      ${t.notes ? `<div style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${t.notes}</div>` : ""}
    `;
  } catch (err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

window.confirmReceipt = async () => {
  if (!selectedTransfer) return;
  if (!confirm("⚠️ هل تأكدت من استلام كافة كميات الأصناف المذكورة فعلياً في المستودع المستلم؟")) return;

  const btn = document.getElementById("st-confirm-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جارٍ تأكيد الاستلام…";

  try {
    // Re-fetch latest transfer document to avoid stale data!
    const docRef = doc(db, `companies/${COMPANY_ID}/stockTransfers`, selectedTransfer.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("أمر التحويل غير موجود");
    const latestTransfer = { id: snap.id, ...snap.data() };

    if (latestTransfer.status === "received") {
      throw new Error("هذا التحويل تم استلامه بالفعل");
    }
    if (latestTransfer.status === "cancelled") {
      throw new Error("هذا التحويل تم إلغاؤه");
    }

    // 1. Update status to received
    await update("stockTransfers", latestTransfer.id, {
      status: "received",
      receivedAt: new Date(),
      receivedBy: window._transferUser?.uid || "system",
      receivedByName: window._transferUser?.displayName || window._transferUser?.email || "النظام"
    });

    // ✅ FIX: قبل إضافة الوارد للوجهة — تحقق أن المصدر نُقص بالكمية الصحيحة بالتوازي
    const outQueries = (latestTransfer.lines || []).map(line => {
      return getDocs(query(COLS.stockTransactions(),
        where("documentNumber", "==", latestTransfer.number),
        where("productId",      "==", line.productId),
        where("warehouseId",    "==", latestTransfer.fromWarehouseId),
        where("type",          "==", "transfer_out")
      ));
    });
    const outSnaps = await Promise.all(outQueries);

    const adjustments = [];
    (latestTransfer.lines || []).forEach((line, idx) => {
      const outSnap = outSnaps[idx];
      const totalOut = outSnap.docs.reduce((s, d) => s + Math.abs(d.data().qtyChange || 0), 0);

      if (totalOut < line.qty) {
        const missing = line.qty - totalOut;
        console.warn(`[ConfirmReceipt] ⚠️ الصنف ${line.productName}: صادر مسجّل=${totalOut} < الأمر=${line.qty} — تصحيح تلقائي: -${missing}`);
        adjustments.push({
          warehouseId: latestTransfer.fromWarehouseId,
          productId: line.productId,
          qtyDelta: -missing,
          metadata: {
            type:           "transfer_out",
            sourceType:     "stockTransfer",
            sourceId:       latestTransfer.id,
            documentNumber: latestTransfer.number,
            productName:    line.productName,
            notes:          `تصحيح تلقائي عند الاستلام: التحويل ${latestTransfer.number} (كمية مفقودة: ${missing})`
          }
        });
      } else if (totalOut > line.qty) {
        const excess = totalOut - line.qty;
        console.warn(`[ConfirmReceipt] ⚠️ الصنف ${line.productName}: صادر مسجّل=${totalOut} > الأمر=${line.qty} — إرجاع الزيادة: +${excess}`);
        adjustments.push({
          warehouseId: latestTransfer.fromWarehouseId,
          productId: line.productId,
          qtyDelta: +excess,
          metadata: {
            type:           "transfer_cancel",
            sourceType:     "stockTransfer",
            sourceId:       latestTransfer.id,
            documentNumber: latestTransfer.number,
            productName:    line.productName,
            notes:          `تصحيح تلقائي عند الاستلام: التحويل ${latestTransfer.number} (زيادة مُسترجعة: ${excess})`
          }
        });
      }

      // إضافة كميات الوارد للوجهة
      adjustments.push({
        warehouseId: latestTransfer.toWarehouseId,
        productId: line.productId,
        qtyDelta: +line.qty,
        metadata: {
          date:           latestTransfer.date || new Date().toISOString().slice(0, 10),
          type:           "transfer_in",
          sourceType:     "stockTransfer",
          sourceId:       latestTransfer.id,
          documentNumber: latestTransfer.number,
          productName:    line.productName,
          notes:          `تم تأكيد استلام الشحنة ${latestTransfer.number}`
        }
      });
    });

    if (adjustments.length > 0) {
      await adjustStockBulk(adjustments);
    }

    // 3. إنشاء القيد المحاسبي التلقائي
    //    مدين: مخزون الوجهة | دائن: مخزون المصدر
    let jeCreated = false;
    try {
      const jeId = await createTransferJE(latestTransfer);
      jeCreated = !!jeId;
    } catch (jeErr) {
      console.warn("[TransferJE] تعذر إنشاء القيد:", jeErr.message);
    }

    showToast(
      jeCreated
        ? `✅ تم تأكيد الاستلام وإنشاء القيد المحاسبي للتحويل ${latestTransfer.number}`
        : `✅ تم تأكيد الاستلام (تحذير: لم تتوفر تكلفة لإنشاء القيد)`,
      jeCreated ? "success" : "warning"
    );
    closeModal("view-transfer-modal");
    await loadTransferHistory();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "✅ تأكيد الاستلام";
  }
};

window.cancelTransfer = async () => {
  if (!selectedTransfer) return;
  if (!confirm("🚫 هل تريد إلغاء أمر التحويل وإرجاع الكميات للمخزن المصدر؟")) return;

  const btn = document.getElementById("st-cancel-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جارٍ الإلغاء…";

  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/stockTransfers`, selectedTransfer.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("أمر التحويل غير موجود");
    const latestTransfer = { id: snap.id, ...snap.data() };

    if (latestTransfer.status === "received") {
      throw new Error("لا يمكن إلغاء التحويل بعد استلامه");
    }
    if (latestTransfer.status === "cancelled") {
      throw new Error("هذا التحويل ملغى بالفعل");
    }

    // 1. Update status to cancelled
    await update("stockTransfers", latestTransfer.id, {
      status: "cancelled",
      cancelledAt: new Date()
    });

    // 2. Reverse stock in source warehouse (plus back the qty) in bulk
    const adjustments = (latestTransfer.lines || []).map(line => ({
      warehouseId: latestTransfer.fromWarehouseId,
      productId: line.productId,
      qtyDelta: +line.qty,
      metadata: {
        type: "transfer_cancel",
        sourceType: "stockTransfer",
        sourceId: latestTransfer.id,
        documentNumber: latestTransfer.number,
        productName: line.productName,
        notes: `إرجاع الكميات بعد إلغاء الأمر ${latestTransfer.number}`
      }
    }));
    if (adjustments.length > 0) {
      await adjustStockBulk(adjustments);
    }

    // 3. حذف القيد المحاسبي التلقائي للتحويل الملغى إن وجد
    try {
      const existQ = query(COLS.journalEntries(),
        where("sourceType", "==", "stockTransfer"),
        where("sourceId",   "==", latestTransfer.id));
      const existSnap = await getDocs(existQ);
      for (const jd of existSnap.docs) {
        await fbDeleteDoc(jd.ref);
      }
    } catch (jeErr) {
      console.warn("[CancelTransfer] تعذر حذف القيد للتحويل الملغى:", jeErr.message);
    }

    showToast("🚫 تم إلغاء أمر التحويل وإعادة الكميات لمخزن المصدر", "success");
    closeModal("view-transfer-modal");
    await loadTransferHistory();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🚫 إلغاء الأمر";
  }
};


window.approveTransferRequest = async () => {
  if (!selectedTransfer) return;
  
  if (!confirm(`⚠️ هل توافق على طلب شحن السيارة رقم ${selectedTransfer.number || selectedTransfer.id.slice(0,8)}؟\nسيتم خصم الكميات من مستودع المصدر (${selectedTransfer.fromWarehouseName}) وتصبح الشحنة قيد النقل للسيارة.`)) return;

  const btn = document.getElementById("st-approve-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جاري الاعتماد والشحن…";

  try {
    const companyId = COMPANY_ID;
    const docRef = doc(db, `companies/${companyId}/stockTransfers`, selectedTransfer.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("أمر التحويل غير موجود");
    const latestTransfer = { id: snap.id, ...snap.data() };

    if (latestTransfer.status !== "requested") {
      throw new Error("حالة هذا الطلب تغيرت بالفعل");
    }
    
    // Validate stock levels in source warehouse
    for (const line of latestTransfer.lines || []) {
      const stockRef = doc(db, `companies/${companyId}/stockByWarehouse`, `${latestTransfer.fromWarehouseId}_${line.productId}`);
      const stockSnap = await getDoc(stockRef);
      const currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
      if (currentQty < line.qty) {
        throw new Error(`عذراً، الرصيد غير كافٍ في مستودع المصدر للصنف: ${line.productName} (المتاح: ${currentQty} ، المطلوب: ${line.qty})`);
      }
    }

    // Update status to in_transit
    await update("stockTransfers", latestTransfer.id, {
      status: "in_transit",
      approvedAt: new Date(),
      approvedBy: window._transferUser?.uid || "system",
      approvedByName: window._transferUser?.displayName || window._transferUser?.email || "المدير"
    });

    // Deduct stock from source warehouse in bulk
    const adjustments = (latestTransfer.lines || []).map(line => ({
      warehouseId: latestTransfer.fromWarehouseId,
      productId: line.productId,
      qtyDelta: -line.qty,
      metadata: {
        type: "transfer_out",
        sourceType: "stockTransfer",
        sourceId: latestTransfer.id,
        documentNumber: latestTransfer.number,
        productName: line.productName,
        notes: `تمت الموافقة وشحن البضاعة للسيارة في المستند ${latestTransfer.number}`
      }
    }));
    if (adjustments.length > 0) {
      await adjustStockBulk(adjustments);
    }

    showToast("✅ تم اعتماد الطلب وبدء عملية الشحن (قيد النقل للسيارة)", "success");
    closeModal("view-transfer-modal");
    await loadTransferHistory();

  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "✔️ موافقة وشحن السيارة";
  }
};

window.rejectTransferRequest = async () => {
  if (!selectedTransfer) return;
  if (!confirm(`❌ هل أنت متأكد من رفض وإلغاء طلب شحن السيارة رقم ${selectedTransfer.number || selectedTransfer.id.slice(0,8)}؟`)) return;

  const btn = document.getElementById("st-reject-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جاري الرفض…";

  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/stockTransfers`, selectedTransfer.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("أمر التحويل غير موجود");
    const latestTransfer = { id: snap.id, ...snap.data() };

    if (latestTransfer.status !== "requested") {
      throw new Error("حالة هذا الطلب تغيرت بالفعل");
    }

    await update("stockTransfers", latestTransfer.id, {
      status: "cancelled",
      rejectedAt: new Date(),
      rejectedBy: window._transferUser?.uid || "system",
      rejectedByName: window._transferUser?.displayName || window._transferUser?.email || "المدير",
      notes: (latestTransfer.notes || "") + " (تم رفض الطلب من قبل الإدارة)"
    });

    showToast("🚫 تم رفض وإلغاء طلب الشحن بنجاح", "success");
    closeModal("view-transfer-modal");
    await loadTransferHistory();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "❌ رفض الطلب";
  }
};

window.printStockTransfer = async () => {
  if (!selectedTransfer) return;
  const t = selectedTransfer;

  let companyName = "مؤسسة أدهام للمواد الغذائية";
  let companyVat = "";
  let companyCr = "";
  try {
    const sysSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (sysSnap.exists()) {
      const co = sysSnap.data();
      companyName = co.name || companyName;
      companyVat = co.vatNumber || "";
      companyCr = co.crNumber || "";
    }
  } catch (e) {
    console.warn(e);
  }

  if (allProducts.length === 0) {
    allProducts = await getAll(COLS.products());
  }

  let totalSellingVal = 0;
  const linesHtml = (t.lines || []).map((l, i) => {
    const p = allProducts.find(prod => prod.id === l.productId);
    const salePrice = p ? (p.salePrice || p.priceRetail || 0) : 0;
    const lineTotal = l.qty * salePrice;
    totalSellingVal += lineTotal;

    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${i + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${l.productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono">${l.sku || "—"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${l.unit || "—"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono">${formatQuantity(l.qty)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="mono">${salePrice.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;" class="mono">${lineTotal.toFixed(2)} ر.س</td>
      </tr>
    `;
  }).join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>سند تحويل مخزني — ${t.number || t.id.slice(0,8)}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: bold; color: #0056b3; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
        .meta-item { font-size: 13px; line-height: 1.6; }
        .meta-label { color: #666; font-weight: 600; }
        .meta-value { font-weight: bold; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
        th { background: #0056b3; color: white; padding: 10px; font-weight: bold; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; }
        .total-box { margin-top: 20px; text-align: left; font-size: 16px; font-weight: bold; border-top: 2px solid #0056b3; padding-top: 10px; }
        .notes { margin-top: 30px; font-size: 12px; color: #555; background: #fff3cd; padding: 12px; border-radius: 6px; border-right: 4px solid #ffc107; }
        .footer-sigs { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; }
        .sig-block { border-top: 1px dashed #666; width: 180px; text-align: center; padding-top: 8px; }
        @media print {
          body { margin: 10px; }
          .no-print { display: none !important; }
        }
        .mono { font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: left;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #0056b3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🖨️ طباعة السند</button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 8px;">✕ إغلاق</button>
      </div>

      <div class="header">
        <div>
          <div style="font-size: 20px; font-weight: bold; color: #111;">${companyName}</div>
          ${companyCr ? `<div style="font-size: 12px; color: #666;">سجل تجاري: ${companyCr}</div>` : ""}
          ${companyVat ? `<div style="font-size: 12px; color: #666;">الرقم الضريبي: ${companyVat}</div>` : ""}
        </div>
        <div class="title">سند تحويل مخزني</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div><span class="meta-label">رقم التحويل المرجعي:</span> <span class="meta-value">${t.number || t.id.slice(0,8)}</span></div>
          <div><span class="meta-label">تاريخ المستند:</span> <span class="meta-value">${formatDateLong(t.createdAt || t.date)}</span></div>
          <div><span class="meta-label">الحالة:</span> <span class="meta-value">${t.status === 'received' ? '✅ تم الاستلام مخزنياً' : t.status === 'in_transit' ? '🚚 قيد النقل (ترانزيت)' : t.status === 'requested' ? '⏳ طلب شحن' : '🚫 ملغى'}</span></div>
        </div>
        <div class="meta-item">
          <div><span class="meta-label">المستودع المصدر (من):</span> <span class="meta-value" style="color: #c00;">${t.fromWarehouseName || t.fromWarehouseId}</span></div>
          <div><span class="meta-label">المستودع المستلم (إلى):</span> <span class="meta-value" style="color: #080;">${t.toWarehouseName || t.toWarehouseId}</span></div>
          <div><span class="meta-label">أنشئ بواسطة:</span> <span class="meta-value">${t.createdByName || "النظام"}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>اسم الصنف المعرف</th>
            <th style="width: 100px;">الكود (SKU)</th>
            <th style="width: 80px;">الوحدة</th>
            <th style="width: 80px;">الكمية المحولة</th>
            <th style="width: 120px;">سعر الحبة (بيع)</th>
            <th style="width: 130px;">الإجمالي البيعي</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
        </tbody>
      </table>

      <div class="total-box">
        إجمالي القيمة البيعية للتحويل: <span style="color: #0056b3; font-size: 18px;">${totalSellingVal.toFixed(2)} ر.س</span>
      </div>

      ${t.notes ? `<div class="notes"><strong>ملاحظات التحويل:</strong> ${t.notes}</div>` : ""}

      <div class="footer-sigs">
        <div>
          <p>أمين مستودع المصدر (المسلّم)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
        <div>
          <p>الناقل (السائق)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
        <div>
          <p>أمين مستودع المستلم (المستلم)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
};
