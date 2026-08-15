// ============================================================
// IDHAM ERP — Rep Mobile App (js/rep/app.js)
// Self-contained PWA: login, dashboard, invoice, credit note,
// customers, stock. Real-time sync via Firestore.
// ============================================================

import { initializeApp }     from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, updateDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, runTransaction, increment, writeBatch
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// ── Firebase Config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8",
  authDomain:        "idham-foodstuffs-sa.firebaseapp.com",
  projectId:         "idham-foodstuffs-sa",
  storageBucket:     "idham-foodstuffs-sa.firebasestorage.app",
  messagingSenderId: "771445462953",
  appId:             "1:771445462953:web:05d70fb7c36a385c9796b8",
};
const app = initializeApp(firebaseConfig, "rep-app");
const db  = getFirestore(app);

// ── Constants ────────────────────────────────────────────────
const COMPANY_ID = "idham-main";
const COL = (name) => collection(db, `companies/${COMPANY_ID}/${name}`);
const VAT = 0.15;

// ── Session ──────────────────────────────────────────────────
let REP = null; // current rep object

function loadSession() {
  try {
    const s = localStorage.getItem("rep_session");
    if (s) { REP = JSON.parse(s); }
  } catch(e) { REP = null; }
}
function saveSession(rep) { REP = rep; localStorage.setItem("rep_session", JSON.stringify(rep)); }
function clearRepSession() { REP = null; localStorage.removeItem("rep_session"); }

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type = "info") {
  document.querySelectorAll(".rep-toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = `rep-toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Screen manager ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".rep-screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ══════════════════════════════════════════════════════════════
// AUTH — Login / Logout
// ══════════════════════════════════════════════════════════════

window.repLogin = async () => {
  const phoneEl = document.getElementById("login-phone") || document.getElementById("rep-login-phone");
  const pinEl   = document.getElementById("login-pin")   || document.getElementById("rep-login-pin");
  const errEl   = document.getElementById("login-error") || document.getElementById("rep-login-error");
  const btn     = document.getElementById("login-btn")   || document.getElementById("rep-login-btn");
  const lbl     = document.getElementById("login-label") || document.getElementById("rep-login-label");
  const spin    = document.getElementById("login-spin")  || document.getElementById("rep-login-spinner");

  const phone = phoneEl ? phoneEl.value.trim() : "";
  const pin   = pinEl   ? pinEl.value.trim()   : "";

  if (!phone || !pin) { errEl.textContent = "أدخل رقم الهاتف والـ PIN"; errEl.classList.remove("hidden"); return; }

  btn.disabled = true; lbl?.classList.add("hidden"); spin?.classList.remove("hidden");
  errEl.classList.add("hidden");

  try {
    // Find rep by phone number (with fallback format matching)
    const normPhone = phone.replace(/\D/g, "");
    let snap = await getDocs(query(COL("salesReps"), where("phone", "==", phone), limit(1)));
    if (snap.empty && normPhone !== phone) {
      snap = await getDocs(query(COL("salesReps"), where("phone", "==", normPhone), limit(1)));
    }
    if (snap.empty) {
      const altPhone = phone.startsWith("0") ? phone.slice(1) : "0" + phone;
      snap = await getDocs(query(COL("salesReps"), where("phone", "==", altPhone), limit(1)));
    }
    if (snap.empty) {
      const allRepsSnap = await getDocs(COL("salesReps"));
      const matchedDoc = allRepsSnap.docs.find(d => {
        const p = (d.data().phone || "").replace(/\D/g, "");
        return p && normPhone && (p === normPhone || p.endsWith(normPhone) || normPhone.endsWith(p));
      });
      if (matchedDoc) {
        snap = { empty: false, docs: [matchedDoc] };
      }
    }
    if (snap.empty) throw new Error("رقم الهاتف غير مسجل في النظام");

    const repDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (!repDoc.pin) throw new Error("لم يتم تفعيل الـ PIN. تواصل مع المدير");
    if (repDoc.pin !== pin) throw new Error("رقم PIN غير صحيح");

    saveSession(repDoc);
    initApp();
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false; lbl.classList.remove("hidden"); spin.classList.add("hidden");
  }
};
window._doLogin = window.repLogin;

window.repLogout = () => {
  clearRepSession();
  showScreen("rep-login-screen");
  document.getElementById("rep-login-phone").value = "";
  document.getElementById("rep-login-pin").value = "";
};

// ══════════════════════════════════════════════════════════════
// APP INIT
// ══════════════════════════════════════════════════════════════

function initApp() {
  showScreen("rep-app-shell");
  // Update header
  document.getElementById("rep-avatar").textContent = REP.name?.[0] || "م";
  document.getElementById("rep-header-name").textContent = REP.name || "المندوب";
  document.getElementById("rep-header-zone").textContent = REP.zone || "—";
  repNavigate("dashboard");
}

// ══════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════

window.repNavigate = (page) => {
  document.querySelectorAll(".rep-nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });
  const container = document.getElementById("rep-page-container");
  switch(page) {
    case "dashboard":   renderDashboard(container); break;
    case "customers":   renderCustomers(container); break;
    case "stock":       renderStock(container); break;
    case "new-invoice": renderNewInvoice(container); break;
    case "credit-note": renderCreditNote(container); break;
    default: container.innerHTML = `<div class="rep-empty"><div class="empty-icon">🚧</div><p>قريباً</p></div>`;
  }
};

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════

async function renderDashboard(container) {
  container.innerHTML = `<div class="rep-page"><div class="rep-loading"><div class="rep-spinner"></div> جاري التحميل…</div></div>`;
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    // My invoices - query by repId only (no orderBy to avoid index requirement)
    const q = query(COL("salesInvoices"), where("repId", "==", REP.id), limit(100));
    const snap = await getDocs(q);
    const allInvoices = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));  // sort by date desc client-side
    // Filter by current month client-side
    const invoices = allInvoices.filter(i => i.date && i.date >= monthStart);

    const totalSales = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalInvs  = invoices.length;
    const target     = REP.monthlyTarget || 0;
    const pct        = target > 0 ? Math.min(100, (totalSales / target) * 100) : 0;

    container.innerHTML = `
    <div class="rep-page">
      <div class="rep-page-title">أهلاً ${REP.name?.split(" ")[0] || ""}! 👋</div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-val">${totalInvs}</div>
          <div class="kpi-lbl">فاتورة هذا الشهر</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-val">${fmtCur(totalSales)}</div>
          <div class="kpi-lbl">إجمالي المبيعات</div>
        </div>
      </div>

      ${target > 0 ? `
      <div class="target-bar-wrap">
        <div class="target-bar-header">
          <span>🎯 الهدف الشهري</span>
          <span>${pct.toFixed(1)}% — ${fmtCur(target)}</span>
        </div>
        <div class="target-bar-track">
          <div class="target-bar-fill" style="width:${pct}%;background:${pct>=100?'var(--good)':pct>=70?'var(--warn)':'var(--brand)'}"></div>
        </div>
      </div>` : ""}

      <div class="section-title">آخر الفواتير</div>
      <div class="inv-list">
        ${invoices.length === 0 ? `<div class="rep-empty"><div class="empty-icon">🧾</div><p>لا توجد فواتير بعد</p></div>` :
          invoices.slice(0, 10).map(inv => `
          <div class="inv-item" onclick="repPrintInvoice('${inv.id}')">
            <div class="inv-item-left">
              <div class="inv-no">${inv.invoiceNumber || inv.id.slice(0,8)}</div>
              <div class="inv-cust">${inv.customerName || "—"}</div>
            </div>
            <div class="inv-item-right">
              <div class="inv-amount">${fmtCur(inv.total || 0)}</div>
              <div class="inv-date">${inv.date || ""}</div>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
  } catch(e) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ══════════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════════

let _customers = [];

async function renderCustomers(container) {
  container.innerHTML = `<div class="rep-page"><div class="rep-loading"><div class="rep-spinner"></div> جاري التحميل…</div></div>`;
  try {
    const q = query(COL("customers"), where("repId", "==", REP.id));
    const snap = await getDocs(q);
    _customers = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
    renderCustomerList(container, _customers);
  } catch(e) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><p>${e.message}</p></div></div>`;
  }
}

function renderCustomerList(container, list) {
  container.innerHTML = `
  <div class="rep-page">
    <div class="rep-page-title">👥 عملائي (${list.length})</div>
    <input class="rep-search" placeholder="🔍 بحث…" oninput="filterCustomers(this.value)" />
    <div class="cust-list" id="cust-list-body">
      ${list.length === 0 ? `<div class="rep-empty"><div class="empty-icon">👤</div><p>لا يوجد عملاء مرتبطون بك</p></div>` :
        list.map(c => {
          const bal = c.balance || 0;
          return `
          <div class="cust-card">
            <div class="cust-avatar">${c.name?.[0] || "ع"}</div>
            <div class="cust-info">
              <div class="cust-name">${c.name}</div>
              <div class="cust-phone">${c.phone || "—"}</div>
              <div class="cust-balance">رصيد: ${fmtCur(bal)}</div>
            </div>
            <span class="balance-badge ${bal <= 0 ? 'ok' : ''}">${fmtCur(Math.abs(bal))}</span>
          </div>`;
        }).join("")}
    </div>
  </div>`;
}

window.filterCustomers = (q) => {
  const filtered = _customers.filter(c =>
    c.name?.includes(q) || c.phone?.includes(q)
  );
  document.getElementById("cust-list-body").innerHTML = filtered.map(c => {
    const bal = c.balance || 0;
    return `
    <div class="cust-card">
      <div class="cust-avatar">${c.name?.[0] || "ع"}</div>
      <div class="cust-info">
        <div class="cust-name">${c.name}</div>
        <div class="cust-phone">${c.phone || "—"}</div>
      </div>
      <span class="balance-badge ${bal <= 0 ? 'ok' : ''}">${fmtCur(Math.abs(bal))}</span>
    </div>`;
  }).join("") || `<div class="rep-empty"><p>لا نتائج</p></div>`;
};

// ══════════════════════════════════════════════════════════════
// STOCK (assigned warehouse)
// ══════════════════════════════════════════════════════════════

async function renderStock(container) {
  if (!REP.assignedWarehouseId) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><div class="empty-icon">🚗</div><p>لم يتم تعيين مخزن لك<br>تواصل مع المدير</p></div></div>`;
    return;
  }
  container.innerHTML = `<div class="rep-page"><div class="rep-loading"><div class="rep-spinner"></div> جاري التحميل…</div></div>`;
  try {
    let snap = await getDocs(query(COL("stockByWarehouse"), where("warehouseId", "==", REP.assignedWarehouseId)));
    if (snap.empty) {
      snap = await getDocs(COL("stockByWarehouse"));
    }
    const stockMap = {};
    snap.docs.forEach(d => { const data = d.data(); stockMap[data.productId] = (stockMap[data.productId] || 0) + (data.qty || 0); });

    // Get product names
    const prodSnap = await getDocs(COL("products"));
    const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(p => (stockMap[p.id] ?? p.stockQty ?? 0) > 0)
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));

    container.innerHTML = `
    <div class="rep-page">
      <div class="rep-page-title">📦 مخزن سيارتي</div>
      <input class="rep-search" placeholder="🔍 بحث في المخزون…" oninput="filterStock(this.value)" />
      <div class="stock-list" id="stock-list-body">
        ${renderStockItems(products, stockMap)}
      </div>
    </div>`;
    window._stockProducts = products;
    window._stockMap = stockMap;
  } catch(e) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><p>${e.message}</p></div></div>`;
  }
}

function renderStockItems(prods, map) {
  if (!prods.length) return `<div class="rep-empty"><div class="empty-icon">📦</div><p>لا يوجد مخزون</p></div>`;
  return prods.map(p => {
    const qty = map[p.id] ?? 0;
    return `
    <div class="stock-item">
      <div>
        <div class="stock-item-name">${p.name}</div>
        <div class="stock-item-unit">${p.unit || ""}</div>
      </div>
      <div class="stock-qty ${qty <= 0 ? 'low' : qty <= 5 ? 'warn' : 'ok'}">${qty}</div>
    </div>`;
  }).join("");
}

window.filterStock = (q) => {
  if (!window._stockProducts) return;
  const filtered = window._stockProducts.filter(p => p.name?.includes(q));
  document.getElementById("stock-list-body").innerHTML = renderStockItems(filtered, window._stockMap || {});
};

// ══════════════════════════════════════════════════════════════
// NEW INVOICE
// ══════════════════════════════════════════════════════════════

let _invLines   = [];
let _selCust    = null;
let _payMethod  = "credit";
let _discount   = 0;
let _discType   = "pct"; // pct | amount

async function renderNewInvoice(container) {
  // Load customers + stock in parallel
  container.innerHTML = `<div class="rep-page"><div class="rep-loading"><div class="rep-spinner"></div> جاري التحميل…</div></div>`;
  try {
    if (!_customers.length) {
      const q = query(COL("customers"), where("repId", "==", REP.id));
      const s = await getDocs(q);
      _customers = s.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
    }

    _invLines  = [];
    _selCust   = null;
    _payMethod = "credit";
    _discount  = 0;
    _discType  = "pct";

    buildInvoiceUI(container);
  } catch(e) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><p>${e.message}</p></div></div>`;
  }
}

function buildInvoiceUI(container) {
  // POS shell must fill rep-main exactly
  container.style.cssText = 'padding:0;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  container.innerHTML = `
  <div class="pos-shell">

    <!-- Top bar: back + customer -->
    <div class="pos-topbar">
      <button class="pos-back-btn" onclick="repNavigate('dashboard')">← رجوع</button>
      <button class="pos-cust-btn ${_selCust ? 'has-cust' : ''}" id="pos-cust-btn" onclick="openCustPicker()">
        <span>👤</span>
        <span id="pos-cust-label" style="overflow:hidden;text-overflow:ellipsis;">${_selCust ? _selCust.name : 'اختر عميل…'}</span>
      </button>
    </div>

    <!-- Body: products grid + cart -->
    <div class="pos-body">

      <!-- Products panel -->
      <div class="pos-products">
        <div class="pos-search-bar">
          <input type="search" placeholder="🔍 بحث في الأصناف…" oninput="posFilterProducts(this.value)" />
        </div>
        <div class="pos-product-grid" id="pos-product-grid">
          <div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-3);font-size:13px;">
            <div class="rep-spinner" style="margin:0 auto 12px;"></div>
            جاري تحميل الأصناف…
          </div>
        </div>
      </div>

      <!-- Cart panel -->
      <div class="pos-cart">
        <div class="pos-cart-title">🛒 الطلب</div>
        <div class="pos-cart-items" id="pos-cart-body">
          <div class="pos-cart-empty">
            <span style="font-size:32px;">🛒</span>
            <span>أضف أصناف</span>
          </div>
        </div>
      </div>

    </div><!-- end pos-body -->

    <!-- Footer: totals + payment + confirm -->
    <div class="pos-footer">
      <div class="pos-totals-mini">
        <span>قبل الضريبة: <b id="pos-sub">0.00</b></span>
        <span>ضريبة 15%: <b id="pos-vat">0.00</b></span>
      </div>
      <div class="pos-total-big">
        <span class="lbl">الإجمالي</span>
        <span class="val" id="pos-total">0.00 ر.س</span>
      </div>

      <!-- Payment method -->
      <div class="pos-pay-row">
        <button class="pos-pay-btn active" id="pm-cash"    onclick="posSetPay('cash')"   ><span class="icon">💵</span>نقدي</button>
        <button class="pos-pay-btn"        id="pm-credit"  onclick="posSetPay('credit')" ><span class="icon">📋</span>آجل</button>
        <button class="pos-pay-btn"        id="pm-transfer" onclick="posSetPay('transfer')"><span class="icon">🏦</span>تحويل</button>
        <button class="pos-pay-btn"        id="pm-cheque"  onclick="posSetPay('cheque')" ><span class="icon">🗒️</span>شيك</button>
      </div>

      <!-- Discount + Confirm -->
      <div class="pos-submit-row">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <input type="number" class="pos-disc-input" id="pos-disc" placeholder="0%" min="0" max="100"
            oninput="_discount=parseFloat(this.value)||0;posUpdateTotals();" />
          <span class="pos-disc-label">خصم %</span>
        </div>
        <button class="pos-confirm-btn" id="pos-submit-btn" onclick="submitInvoice()">
          ✅ تأكيد الفاتورة
        </button>
      </div>
    </div>

  </div>`;

  // Load products async
  posLoadProducts();
}

async function posLoadProducts() {
  try {
    if (!_allProducts.length) {
      if (REP.assignedWarehouseId) {
        let sq = query(COL("stockByWarehouse"), where("warehouseId", "==", REP.assignedWarehouseId));
        let ss = await getDocs(sq);
        const stockMap = {};
        if (ss.empty) {
          ss = await getDocs(COL("stockByWarehouse"));
        }
        ss.docs.forEach(d => { const dt = d.data(); stockMap[dt.productId] = (stockMap[dt.productId] || 0) + (dt.qty || 0); });
        const ps = await getDocs(COL("products"));
        _allProducts = ps.docs.map(d => ({ id: d.id, ...d.data(), stockQty: stockMap[d.id] ?? d.data().stockQty ?? 0 }))
          .filter(p => p.stockQty > 0)
          .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
      } else {
        const ps = await getDocs(COL("products"));
        _allProducts = ps.docs.map(d => ({ id: d.id, ...d.data(), stockQty: 999 }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
      }
    }
    posRenderGrid(_allProducts);
  } catch(e) {
    const grid = document.getElementById("pos-product-grid");
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1;color:var(--bad);text-align:center;padding:20px;">${e.message}</div>`;
  }
}

const PROD_EMOJIS = { default: "📦", meat: "🥩", oil: "🫙", rice: "🍚", sugar: "🍬", water: "💧", juice: "🧃", milk: "🥛", cheese: "🧀", bread: "🍞" };
function prodEmoji(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("لحم") || n.includes("دجاج")) return "🥩";
  if (n.includes("زيت")) return "🫙";
  if (n.includes("أرز") || n.includes("ارز")) return "🍚";
  if (n.includes("سكر")) return "🍬";
  if (n.includes("ماء") || n.includes("مياه")) return "💧";
  if (n.includes("عصير")) return "🧃";
  if (n.includes("حليب")) return "🥛";
  if (n.includes("جبن")) return "🧀";
  if (n.includes("خبز")) return "🍞";
  if (n.includes("بهار") || n.includes("توابل")) return "🌶️";
  if (n.includes("تمر")) return "🌴";
  return "📦";
}

function posRenderGrid(prods) {
  const grid = document.getElementById("pos-product-grid");
  if (!grid) return;
  if (!prods.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-3);">لا يوجد مخزون</div>`;
    return;
  }
  grid.innerHTML = prods.map(p => {
    const inCart = _invLines.find(l => l.productId === p.id);
    return `
    <div class="pos-product-card ${inCart ? 'added' : ''}" onclick="posTapProduct('${p.id}','${escapeHtml(p.name)}',${p.sellingPrice||p.price||0},${p.stockQty||0})">
      <div class="prod-emoji">${prodEmoji(p.name)}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-price">${fmtCur(p.sellingPrice||p.price||0)}</div>
      ${inCart ? `<div class="prod-added-badge">${inCart.qty}</div>` : `<div class="prod-stock">${p.stockQty}</div>`}
    </div>`;
  }).join("");
}

window.posFilterProducts = (q) => {
  if (!_allProducts.length) return;
  posRenderGrid(_allProducts.filter(p => p.name?.includes(q) || p.barcode?.includes(q)));
};

window.posTapProduct = (id, name, price, stock) => {
  const ex = _invLines.find(l => l.productId === id);
  if (ex) { ex.qty = Math.min(ex.qty + 1, stock || 999); }
  else { _invLines.push({ productId: id, name, price, qty: 1, stock }); }
  posRenderCart();
  posUpdateTotals();
  posRenderGrid(_allProducts.filter(p => {
    const inp = document.querySelector('.pos-search-bar input');
    return !inp?.value || p.name?.includes(inp.value);
  }));
};

window.posCartQty = (i, delta) => {
  const line = _invLines[i];
  if (!line) return;
  line.qty = Math.max(1, line.qty + delta);
  if (line.qty > (line.stock || 999)) line.qty = line.stock || 999;
  posRenderCart(); posUpdateTotals();
  posRenderGrid(_allProducts);
};

window.posRemoveLine = (i) => {
  _invLines.splice(i, 1);
  posRenderCart(); posUpdateTotals();
  posRenderGrid(_allProducts);
};

function posRenderCart() {
  const body = document.getElementById("pos-cart-body");
  if (!body) return;
  if (!_invLines.length) {
    body.innerHTML = `<div class="pos-cart-empty"><span style="font-size:32px;">🛒</span><span>أضف أصناف</span></div>`;
    return;
  }
  body.innerHTML = _invLines.map((ln, i) => `
  <div class="pos-cart-item">
    <button class="pos-cart-del" onclick="posRemoveLine(${i})">✕</button>
    <div class="pos-cart-item-name">${ln.name}</div>
    <div class="pos-cart-qty-row">
      <button class="pos-qty-btn" onclick="posCartQty(${i},-1)">−</button>
      <span class="pos-cart-qty">${ln.qty}</span>
      <button class="pos-qty-btn" onclick="posCartQty(${i},1)">+</button>
    </div>
    <div class="pos-cart-price">${fmtCur(ln.price * ln.qty)}</div>
  </div>`).join("");
}

window.posSetPay = (m) => {
  _payMethod = m;
  ["cash","credit","transfer","cheque"].forEach(k => {
    const el = document.getElementById(`pm-${k}`);
    if (el) el.classList.toggle("active", k === m);
  });
};

function posUpdateTotals() {
  const sub = _invLines.reduce((s, l) => s + l.price * l.qty, 0);
  const discAmt = sub * ((_discount || 0) / 100);
  const net = sub - discAmt;
  const vat = net * VAT;
  const total = net + vat;
  const s = document.getElementById("pos-sub");
  const v = document.getElementById("pos-vat");
  const t = document.getElementById("pos-total");
  if (s) s.textContent = fmtCur(sub);
  if (v) v.textContent = fmtCur(vat);
  if (t) t.textContent = fmtCur(total) + " ر.س";
  // keep shared vars in sync
  _discType = "pct";
  updateTotals && (() => {})(); // compat
}


function renderLines() {
  if (!_invLines.length) return `<div style="color:var(--text-3);font-size:13px;text-align:center;padding:12px;">لم تتم إضافة أصناف بعد</div>`;
  return _invLines.map((ln, i) => `
  <div class="inv-line">
    <div class="inv-line-name">${ln.name}</div>
    <div class="inv-line-qty-ctrl">
      <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
      <span class="qty-val">${ln.qty}</span>
      <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
    </div>
    <div class="inv-line-price">${fmtCur(ln.price * ln.qty)}</div>
    <button class="inv-line-del" onclick="removeLine(${i})">🗑</button>
  </div>`).join("");
}

window.changeQty = (i, delta) => {
  _invLines[i].qty = Math.max(1, (_invLines[i].qty || 1) + delta);
  const body = document.getElementById("inv-lines-body");
  if (body) body.innerHTML = renderLines();
  updateTotals();
};

window.removeLine = (i) => {
  _invLines.splice(i, 1);
  const body = document.getElementById("inv-lines-body");
  if (body) body.innerHTML = renderLines();
  updateTotals();
};

window.setPayMethod = (m) => {
  _payMethod = m;
  document.querySelectorAll(".pay-opt").forEach((el, idx) => {
    const methods = ["cash","credit","transfer","cheque"];
    el.classList.toggle("selected", methods[idx] === m);
  });
};

function updateTotals() {
  const sub = _invLines.reduce((s, l) => s + l.price * l.qty, 0);
  let discAmt = _discType === "pct" ? sub * (_discount / 100) : _discount;
  discAmt = Math.min(discAmt, sub);
  const net = sub - discAmt;
  const vat = net * VAT;
  const total = net + vat;
  document.getElementById("t-sub")   && (document.getElementById("t-sub").textContent   = fmtCur(sub));
  document.getElementById("t-disc")  && (document.getElementById("t-disc").textContent  = fmtCur(discAmt));
  document.getElementById("t-vat")   && (document.getElementById("t-vat").textContent   = fmtCur(vat));
  document.getElementById("t-total") && (document.getElementById("t-total").textContent = fmtCur(total));
}

function getInvoiceTotals() {
  const sub = _invLines.reduce((s, l) => s + l.price * l.qty, 0);
  // POS uses pct discount always
  let discAmt = sub * ((_discount || 0) / 100);
  discAmt = Math.min(discAmt, sub);
  const net = sub - discAmt;
  const vat = net * VAT;
  return { sub, discAmt, net, vat, total: net + vat };
}

// ── Customer Picker ───────────────────────────────────────────
window.openCustPicker = () => {
  const overlay = document.createElement("div");
  overlay.className = "rep-modal-overlay";
  overlay.innerHTML = `
  <div class="rep-modal-sheet">
    <div class="rep-modal-handle"></div>
    <div class="rep-modal-title">اختر العميل</div>
    <input class="rep-search" placeholder="🔍 بحث…" oninput="filterCustPicker(this.value)" style="margin-bottom:10px;" />
    <div class="rep-modal-list" id="cust-picker-list">
      ${_customers.map(c => `
        <div class="cust-card" onclick="selectCustomer('${c.id}')">
          <div class="cust-avatar">${c.name?.[0]||"ع"}</div>
          <div class="cust-info">
            <div class="cust-name">${c.name}</div>
            <div class="cust-phone">${c.phone||"—"}</div>
          </div>
        </div>`).join("")}
    </div>
  </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window._custPickerOverlay = overlay;
};

window.filterCustPicker = (q) => {
  const list = document.getElementById("cust-picker-list");
  if (!list) return;
  list.innerHTML = _customers.filter(c => c.name?.includes(q) || c.phone?.includes(q))
    .map(c => `
      <div class="cust-card" onclick="selectCustomer('${c.id}')">
        <div class="cust-avatar">${c.name?.[0]||"ع"}</div>
        <div class="cust-info"><div class="cust-name">${c.name}</div></div>
      </div>`).join("") || `<div class="rep-empty"><p>لا نتائج</p></div>`;
};

window.selectCustomer = (id) => {
  _selCust = _customers.find(c => c.id === id) || null;
  const name = _selCust?.name || "اختر عميل…";
  // Update both old form label and POS button
  const lbl1 = document.getElementById("cust-pick-label");
  const lbl2 = document.getElementById("pos-cust-label");
  const btn  = document.getElementById("pos-cust-btn");
  if (lbl1) lbl1.textContent = name;
  if (lbl2) lbl2.textContent = name;
  if (btn)  { btn.classList.toggle("has-cust", !!_selCust); }
  window._custPickerOverlay?.remove();
};

// ── Product Picker ────────────────────────────────────────────
let _allProducts = [];

window.openProductPicker = async () => {
  // Load products from warehouse stock
  if (!_allProducts.length) {
    try {
      if (REP.assignedWarehouseId) {
        const sq = query(COL("stockByWarehouse"), where("warehouseId", "==", REP.assignedWarehouseId));
        const ss = await getDocs(sq);
        const stockMap = {};
        ss.docs.forEach(d => { const dt = d.data(); stockMap[dt.productId] = dt.qty || 0; });
        const ps = await getDocs(COL("products"));
        _allProducts = ps.docs.map(d => ({ id: d.id, ...d.data(), stockQty: stockMap[d.id] ?? 0 }))
          .filter(p => p.stockQty > 0)
          .sort((a, b) => a.name?.localeCompare(b.name, "ar"));
      } else {
        const ps = await getDocs(COL("products"));
        _allProducts = ps.docs.map(d => ({ id: d.id, ...d.data(), stockQty: 999 }));
      }
    } catch(e) { toast("فشل تحميل الأصناف", "error"); return; }
  }

  const overlay = document.createElement("div");
  overlay.className = "rep-modal-overlay";
  overlay.innerHTML = `
  <div class="rep-modal-sheet">
    <div class="rep-modal-handle"></div>
    <div class="rep-modal-title">اختر صنف</div>
    <input class="rep-search" placeholder="🔍 بحث في الأصناف…" oninput="filterProdPicker(this.value)" style="margin-bottom:10px;" />
    <div class="rep-modal-list" id="prod-picker-list">
      ${renderProdPickerItems(_allProducts)}
    </div>
  </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window._prodPickerOverlay = overlay;
};

function renderProdPickerItems(prods) {
  return prods.map(p => `
  <div class="prod-pick-item" onclick="addProductLine('${p.id}','${escapeHtml(p.name)}',${p.sellingPrice||p.price||0},${p.stockQty||0})">
    <div>
      <div class="prod-pick-name">${p.name}</div>
      <div class="prod-pick-price">السعر: ${fmtCur(p.sellingPrice||p.price||0)}</div>
    </div>
    <div class="prod-pick-stock">${p.stockQty || 0}</div>
  </div>`).join("") || `<div class="rep-empty"><p>لا يوجد مخزون</p></div>`;
}

window.filterProdPicker = (q) => {
  const list = document.getElementById("prod-picker-list");
  if (!list) return;
  list.innerHTML = renderProdPickerItems(_allProducts.filter(p => p.name?.includes(q) || p.barcode?.includes(q)));
};

window.addProductLine = (id, name, price, stock) => {
  const existing = _invLines.find(l => l.productId === id);
  if (existing) { existing.qty++; }
  else { _invLines.push({ productId: id, name, price, qty: 1, stock }); }
  window._prodPickerOverlay?.remove();
  const body = document.getElementById("inv-lines-body");
  if (body) body.innerHTML = renderLines();
  updateTotals();
  toast(`تمت إضافة ${name}`, "success");
};

// ── Submit Invoice ────────────────────────────────────────────
window.submitInvoice = async () => {
  if (!_selCust) { toast("اختر عميلاً أولاً", "error"); return; }
  if (!_invLines.length) { toast("أضف صنفاً واحداً على الأقل", "error"); return; }

  // Support both POS button (pos-submit-btn) and old form button (inv-submit-btn)
  const btn = document.getElementById("pos-submit-btn") || document.getElementById("inv-submit-btn");
  if (btn) { btn.disabled = true; btn.textContent = "جاري الحفظ…"; }

  try {
    const { sub, discAmt, net, vat, total } = getInvoiceTotals();
    const today = new Date().toISOString().split("T")[0];

    // Generate invoice number
    const invNo = await getNextInvoiceNumber();

    const invoiceData = {
      invoiceNumber:  invNo,
      customerId:     _selCust.id,
      customerName:   _selCust.name,
      repId:          REP.id,
      repName:        REP.name,
      warehouseId:    REP.assignedWarehouseId || null,
      date:           today,
      lines:          _invLines.map(l => ({
        productId: l.productId, name: l.name,
        qty: l.qty, price: l.price, total: l.price * l.qty,
      })),
      subtotal:       sub,
      discountAmount: discAmt,
      discountType:   _discType,
      discountValue:  _discount,
      vatAmount:      vat,
      total:          total,
      paymentMethod:  _payMethod,
      status:         "posted",
      source:         "rep_app",
      notes:          document.getElementById("inv-notes")?.value || "",
      createdAt:      serverTimestamp(),
      companyId:      COMPANY_ID,
    };

    // Use transaction to save invoice + update stock + update customer balance
    await runTransaction(db, async (tx) => {
      // 1. Create invoice
      const invRef = doc(COL("salesInvoices"), invNo);
      tx.set(invRef, invoiceData);

      // 2. Update stock (deduct from warehouse)
      if (REP.assignedWarehouseId) {
        for (const line of _invLines) {
          const stockQ = query(COL("stockByWarehouse"),
            where("productId", "==", line.productId),
            where("warehouseId", "==", REP.assignedWarehouseId));
          const stockSnap = await getDocs(stockQ);
          if (!stockSnap.empty) {
            tx.update(stockSnap.docs[0].ref, { qty: increment(-line.qty) });
          }
        }
      }

      // 3. Update customer balance (debit = positive means they owe)
      if (_payMethod === "credit") {
        const custRef = doc(COL("customers"), _selCust.id);
        tx.update(custRef, { balance: increment(total) });
      }
    });

    toast(`✅ تم حفظ الفاتورة ${invNo}`, "success");

    // Print
    setTimeout(() => repPrintInvoiceData({ ...invoiceData, invoiceNumber: invNo }), 500);

    // Reset form
    _invLines = []; _selCust = null; _payMethod = "credit"; _discount = 0;
    repNavigate("dashboard");

  } catch(e) {
    toast("فشل الحفظ: " + e.message, "error");
    console.error(e);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "حفظ الفاتورة 🧾"; }
  }
};

async function getNextInvoiceNumber() {
  const today = new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}`;
  const ms = Date.now();
  return `${prefix}-${ms.toString().slice(-6)}`;
}

// ══════════════════════════════════════════════════════════════
// CREDIT NOTE (إشعار دائن)
// ══════════════════════════════════════════════════════════════

let _creditLines   = [];
let _creditSelCust = null;
let _creditReason  = "";

async function renderCreditNote(container) {
  container.innerHTML = `<div class="rep-page"><div class="rep-loading"><div class="rep-spinner"></div> جاري التحميل…</div></div>`;
  try {
    if (!_customers.length) {
      const q = query(COL("customers"), where("repId", "==", REP.id));
      const s = await getDocs(q);
      _customers = s.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
    }
    _creditLines = []; _creditSelCust = null; _creditReason = "";
    buildCreditNoteUI(container);
  } catch(e) {
    container.innerHTML = `<div class="rep-page"><div class="rep-empty"><p>${e.message}</p></div></div>`;
  }
}

function buildCreditNoteUI(container) {
  container.innerHTML = `
  <div class="rep-form">
    <div class="rep-page-title">↩️ إشعار دائن</div>

    <div class="rep-section">
      <div class="rep-section-title">العميل</div>
      <button class="product-picker-btn" id="credit-cust-btn" onclick="openCreditCustPicker()">
        <span>👤</span><span id="credit-cust-label">${_creditSelCust ? _creditSelCust.name : "اختر عميل…"}</span>
      </button>
    </div>

    <div class="rep-section">
      <div class="rep-section-title">الأصناف المرتجعة</div>
      <button class="product-picker-btn" onclick="openCreditProductPicker()"><span>➕</span><span>إضافة صنف مرتجع</span></button>
      <div class="inv-lines" id="credit-lines-body">${renderCreditLines()}</div>
    </div>

    <div class="rep-section">
      <div class="rep-section-title">سبب الإشعار</div>
      <textarea id="credit-reason" class="rep-input" rows="2" placeholder="بضاعة تالفة / خطأ في السعر…"></textarea>
    </div>

    <div class="rep-section">
      <div class="inv-total-section">
        <div class="total-row"><span class="label">الإجمالي قبل الضريبة</span><span class="val" id="cr-sub">0.00</span></div>
        <div class="total-row"><span class="label">ضريبة القيمة المضافة 15%</span><span class="val" id="cr-vat">0.00</span></div>
        <div class="total-row main"><span class="label" style="font-size:16px;font-weight:700;">إجمالي الإشعار</span><span class="val" id="cr-total" style="color:var(--good);">0.00</span></div>
      </div>
    </div>

    <div style="height:80px;"></div>
  </div>

  <div class="rep-submit-bar">
    <button class="rep-btn secondary" onclick="repNavigate('dashboard')">إلغاء</button>
    <button class="rep-btn success" onclick="submitCreditNote()" id="credit-submit-btn">حفظ الإشعار ↩️</button>
  </div>`;
}

function renderCreditLines() {
  if (!_creditLines.length) return `<div style="color:var(--text-3);font-size:13px;text-align:center;padding:12px;">لم تتم إضافة أصناف بعد</div>`;
  return _creditLines.map((ln, i) => `
  <div class="inv-line">
    <div class="inv-line-name">${ln.name}</div>
    <div class="inv-line-qty-ctrl">
      <button class="qty-btn" onclick="changeCreditQty(${i},-1)">−</button>
      <span class="qty-val">${ln.qty}</span>
      <button class="qty-btn" onclick="changeCreditQty(${i},1)">+</button>
    </div>
    <div class="inv-line-price">${fmtCur(ln.price * ln.qty)}</div>
    <button class="inv-line-del" onclick="removeCreditLine(${i})">🗑</button>
  </div>`).join("");
}

window.changeCreditQty = (i, d) => {
  _creditLines[i].qty = Math.max(1, _creditLines[i].qty + d);
  document.getElementById("credit-lines-body").innerHTML = renderCreditLines();
  updateCreditTotals();
};
window.removeCreditLine = (i) => {
  _creditLines.splice(i, 1);
  document.getElementById("credit-lines-body").innerHTML = renderCreditLines();
  updateCreditTotals();
};

function updateCreditTotals() {
  const sub = _creditLines.reduce((s, l) => s + l.price * l.qty, 0);
  const vat = sub * VAT;
  document.getElementById("cr-sub")   && (document.getElementById("cr-sub").textContent   = fmtCur(sub));
  document.getElementById("cr-vat")   && (document.getElementById("cr-vat").textContent   = fmtCur(vat));
  document.getElementById("cr-total") && (document.getElementById("cr-total").textContent = fmtCur(sub + vat));
}

window.openCreditCustPicker = () => {
  const overlay = document.createElement("div");
  overlay.className = "rep-modal-overlay";
  overlay.innerHTML = `
  <div class="rep-modal-sheet">
    <div class="rep-modal-handle"></div>
    <div class="rep-modal-title">اختر العميل</div>
    <div class="rep-modal-list">
      ${_customers.map(c => `
        <div class="cust-card" onclick="selectCreditCustomer('${c.id}')">
          <div class="cust-avatar">${c.name?.[0]||"ع"}</div>
          <div class="cust-info"><div class="cust-name">${c.name}</div></div>
        </div>`).join("")}
    </div>
  </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window._creditCustOverlay = overlay;
};
window.selectCreditCustomer = (id) => {
  _creditSelCust = _customers.find(c => c.id === id);
  document.getElementById("credit-cust-label").textContent = _creditSelCust?.name || "اختر عميل…";
  window._creditCustOverlay?.remove();
};

window.openCreditProductPicker = async () => {
  if (!_allProducts.length) await window.openProductPicker(); return;
  const overlay = document.createElement("div");
  overlay.className = "rep-modal-overlay";
  overlay.innerHTML = `
  <div class="rep-modal-sheet">
    <div class="rep-modal-handle"></div>
    <div class="rep-modal-title">الصنف المرتجع</div>
    <div class="rep-modal-list">
      ${_allProducts.map(p => `
        <div class="prod-pick-item" onclick="addCreditLine('${p.id}','${escapeHtml(p.name)}',${p.sellingPrice||p.price||0})">
          <div><div class="prod-pick-name">${p.name}</div><div class="prod-pick-price">${fmtCur(p.sellingPrice||p.price||0)}</div></div>
        </div>`).join("")}
    </div>
  </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window._creditProdOverlay = overlay;
};
window.addCreditLine = (id, name, price) => {
  const ex = _creditLines.find(l => l.productId === id);
  if (ex) ex.qty++; else _creditLines.push({ productId: id, name, price, qty: 1 });
  window._creditProdOverlay?.remove();
  document.getElementById("credit-lines-body").innerHTML = renderCreditLines();
  updateCreditTotals();
};

window.submitCreditNote = async () => {
  if (!_creditSelCust) { toast("اختر عميلاً", "error"); return; }
  if (!_creditLines.length) { toast("أضف صنفاً واحداً", "error"); return; }
  const btn = document.getElementById("credit-submit-btn");
  btn.disabled = true; btn.textContent = "جاري الحفظ…";
  try {
    const sub = _creditLines.reduce((s, l) => s + l.price * l.qty, 0);
    const vat = sub * VAT;
    const total = sub + vat;
    const today = new Date().toISOString().split("T")[0];
    const crNo = `CR-${Date.now().toString().slice(-8)}`;

    const data = {
      creditNoteNumber: crNo,
      customerId: _creditSelCust.id, customerName: _creditSelCust.name,
      repId: REP.id, repName: REP.name,
      date: today, lines: _creditLines,
      subtotal: sub, vatAmount: vat, total,
      reason: document.getElementById("credit-reason")?.value || "",
      status: "posted", source: "rep_app",
      createdAt: serverTimestamp(), companyId: COMPANY_ID,
    };

    await runTransaction(db, async (tx) => {
      tx.set(doc(COL("salesReturns"), crNo), data);
      // Reduce customer balance (credit = reduce debt)
      tx.update(doc(COL("customers"), _creditSelCust.id), { balance: increment(-total) });
      // Return stock
      if (REP.assignedWarehouseId) {
        for (const line of _creditLines) {
          const sq = query(COL("stockByWarehouse"),
            where("productId", "==", line.productId),
            where("warehouseId", "==", REP.assignedWarehouseId));
          const ss = await getDocs(sq);
          if (!ss.empty) tx.update(ss.docs[0].ref, { qty: increment(line.qty) });
        }
      }
    });

    toast(`✅ تم حفظ الإشعار ${crNo}`, "success");
    _creditLines = []; _creditSelCust = null;
    repNavigate("dashboard");
  } catch(e) { toast("فشل: " + e.message, "error"); }
  finally { if (btn) { btn.disabled = false; btn.textContent = "حفظ الإشعار ↩️"; } }
};

// ══════════════════════════════════════════════════════════════
// PRINT
// ══════════════════════════════════════════════════════════════

window.repPrintInvoice = async (invId) => {
  try {
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, invId));
    if (!snap.exists()) { toast("الفاتورة غير موجودة", "error"); return; }
    repPrintInvoiceData({ id: snap.id, ...snap.data() });
  } catch(e) { toast(e.message, "error"); }
};

window.repPrintInvoiceData = (inv) => {
  const co = JSON.parse(localStorage.getItem("idham_company") || "{}");
  const lines = (inv.lines || []).map(l =>
    `<tr><td>${l.name}</td><td>${l.qty}</td><td>${fmtCur(l.price)}</td><td>${fmtCur(l.total || l.price*l.qty)}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
  <meta charset="UTF-8"/>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Cairo',sans-serif; font-size:13px; color:#111; background:#fff; padding:16px; }
    .header { text-align:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:12px; }
    .header h2 { font-size:18px; font-weight:900; }
    .header p  { font-size:11px; color:#555; }
    .inv-meta { display:flex; justify-content:space-between; margin-bottom:12px; font-size:12px; }
    table { width:100%; border-collapse:collapse; margin-bottom:12px; }
    th,td { border:1px solid #ddd; padding:6px 8px; text-align:right; font-size:12px; }
    th { background:#f5f5f5; font-weight:700; }
    .totals { margin-right:auto; width:50%; font-size:12px; }
    .totals tr td:last-child { font-weight:700; }
    .grand { font-size:15px; font-weight:900; }
    @media print { body { padding:0; } }
  </style>
  </head><body onload="window.print()">
  <div class="header">
    <h2>${co.name || "إدهام للمواد الغذائية"}</h2>
    <p>ر.ت: ${co.crNumber||""} | الرقم الضريبي: ${co.vatNumber||""}</p>
    <p>${co.address||""} ${co.city||""}</p>
  </div>
  <div class="inv-meta">
    <div><b>فاتورة رقم:</b> ${inv.invoiceNumber||inv.id}</div>
    <div><b>التاريخ:</b> ${inv.date||""}</div>
  </div>
  <div class="inv-meta">
    <div><b>العميل:</b> ${inv.customerName||""}</div>
    <div><b>المندوب:</b> ${inv.repName||""}</div>
  </div>
  <table>
    <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
    <tbody>${lines}</tbody>
  </table>
  <table class="totals">
    <tr><td>المجموع قبل الضريبة</td><td>${fmtCur(inv.subtotal||0)}</td></tr>
    ${inv.discountAmount > 0 ? `<tr><td>الخصم</td><td>${fmtCur(inv.discountAmount)}</td></tr>` : ""}
    <tr><td>ضريبة القيمة المضافة 15%</td><td>${fmtCur(inv.vatAmount||0)}</td></tr>
    <tr class="grand"><td>الإجمالي</td><td>${fmtCur(inv.total||0)} ر.س</td></tr>
  </table>
  <p style="text-align:center;font-size:11px;color:#888;margin-top:16px;">شكراً لتعاملكم معنا</p>
  </body></html>`;

  const frame = document.getElementById("rep-print-frame");
  if (frame) {
    frame.srcdoc = html;
    frame.onload = () => { try { frame.contentWindow.print(); } catch(e) {} };
  }
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function fmtCur(n) { return Number(n || 0).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function escapeHtml(s) { return String(s || "").replace(/'/g, "\\'").replace(/"/g, "&quot;"); }

// ══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ══════════════════════════════════════════════════════════════

loadSession();
if (REP) {
  initApp();
} else {
  showScreen("rep-login-screen");
}

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw-rep.js").catch(() => {});
}
