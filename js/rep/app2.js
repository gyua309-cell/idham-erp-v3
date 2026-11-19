
// Helper to get local date string YYYY-MM-DD in local timezone (Saudi Arabia UTC+3)
function getTodayLocalDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ═══════════════════════════════════════════════════════════
// IDHAM VAN SALES PWA v2.0 — js/rep/app2.js
// Full offline-capable, real-time, POS-style rep app
// ═══════════════════════════════════════════════════════════

import { initializeApp }     from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, query, where, limit, onSnapshot,
  serverTimestamp, runTransaction, increment, writeBatch
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/* ── Firebase ─────────────────────────────────────────── */
const FB_CFG = {
  apiKey:            "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain:        "idham-b3a7e.firebaseapp.com",
  projectId:         "idham-b3a7e",
  storageBucket:     "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId:             "1:915839133333:web:fe472e01993025f08a9d9c",
};
const fbApp = initializeApp(FB_CFG, "rep-v2");
const db    = getFirestore(fbApp);
const COID  = "idham-main";
const COL   = (n) => collection(db, `companies/${COID}/${n}`);

/* ── VAT ─────────────────────────────────────────────── */
const VAT = 0.15;

/* ── Normalization Helper ── */
function _normalizeInvoice(inv) {
  if (!inv) return inv;
  inv.invoiceNumber = inv.invoiceNumber || inv.number || inv.id || "";
  inv.number        = inv.number || inv.invoiceNumber || inv.id || "";

  // Normalize Total (prefer totalWithVat)
  let tot = inv.totalWithVat;
  if (tot === undefined || tot === null) tot = inv.total;
  if (tot === undefined || tot === null) tot = inv.grandTotal;
  if (tot === undefined || tot === null) tot = inv.netTotal;
  if (tot === undefined || tot === null) tot = inv.finalTotal;
  if (tot === undefined || tot === null) tot = inv.totalAmount;
  if (tot === undefined || tot === null) tot = inv.amount;
  inv.total = parseFloat(tot || 0);
  inv.totalWithVat = inv.total;

  // Normalize VAT (prefer totalVat)
  let vat = inv.totalVat;
  if (vat === undefined || vat === null) vat = inv.vatAmount;
  inv.vatAmount = parseFloat(vat || 0);
  inv.totalVat = inv.vatAmount;

  if (!inv.customerName && inv.customer) {
    inv.customerName = typeof inv.customer === "string" ? inv.customer : (inv.customer.name || "");
  }

  return inv;
}

/* ── Two-Way Invoice Fetching (Rep App + Main ERP App Invoices) ── */
async function fetchRepInvoices(limitCount = 500) {
  if (!REP || !REP.id) return [];
  try {
    // ─── جلب فواتير المندوب بحد أعلى 500 لتغطية كل الشهر الحالي ───
    const promises = [
      getDocs(query(COL("salesInvoices"), where("repId", "==", REP.id), limit(limitCount)))
    ];
    if (REP.assignedWarehouseId) {
      promises.push(getDocs(query(COL("salesInvoices"), where("warehouseId", "==", REP.assignedWarehouseId), limit(limitCount))));
    }

    const snaps = await Promise.all(promises);
    const map = new Map();

    snaps.forEach(snap => {
      snap.docs.forEach(d => {
        if (!map.has(d.id)) {
          map.set(d.id, _normalizeInvoice({ id: d.id, ...d.data() }));
        }
      });
    });

    const all = Array.from(map.values());
    // ترتيب محلي تنازلي حسب التاريخ الفعلي للفاتورة
    all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return all;
  } catch (err) {
    console.error("Error fetching rep invoices:", err);
    return [];
  }
}


/* ── Company Info (loaded from Firestore, cached in localStorage) ── */
let COMPANY = JSON.parse(localStorage.getItem("rep_company") || "{}");
if (!COMPANY.name) COMPANY = { name: "شركة نظم الإمداد المتطورة", phone: "0549141648", address: "ينبع الصناعية 2179", vatNumber: "314996148100003", crNumber: "7054969006" };

async function loadCompanyInfo() {
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COID}/settings`, "company")),
      getDoc(doc(db, `companies/${COID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      const s = compSnap.data();
      const rawCr = s.crNumber || s.cr || s.commercialRegistration || "";
      const validCr = (rawCr && (rawCr.startsWith("70") || rawCr.startsWith("47") || rawCr.length >= 7)) ? rawCr : "7054969006";
      COMPANY = {
        name:       s.name       || s.companyName || COMPANY.name || "شركة نظم الإمداد المتطورة",
        phone:      s.phone      || COMPANY.phone      || "0549141648",
        address:    s.address    || COMPANY.address    || "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
        city:       s.city       || COMPANY.city       || "ينبع",
        vatNumber:  s.vatNumber  || COMPANY.vatNumber  || "314996148100003",
        crNumber:   validCr,
        email:      s.email      || COMPANY.email      || "Nuzmalamdad@gmail.com",
        currency:   s.currency   || "SAR",
        vatRate:    s.vatRate    || "15",
        logoUrl:    ""
      };
      if (logoSnap.exists() && logoSnap.data().dataUrl) {
        COMPANY.logoUrl = logoSnap.data().dataUrl;
      }
      localStorage.setItem("rep_company", JSON.stringify(COMPANY));
      const compEl = document.getElementById("header-company");
      if (compEl) compEl.textContent = COMPANY.name;
    }
  } catch(e) { /* use cached */ }
}


/* ══════════════════════════════════
   SESSION
══════════════════════════════════ */
let REP = null;
let _unsub_stock = null; // Firestore real-time unsubscriber

function loadSession() {
  try { REP = JSON.parse(localStorage.getItem("rep_v2_session") || "null"); } catch { REP = null; }
}
function saveSession(r) { REP = r; localStorage.setItem("rep_v2_session", JSON.stringify(r)); }
function clearSession()  { REP = null; localStorage.removeItem("rep_v2_session"); }

/* ══════════════════════════════════
   THEME
══════════════════════════════════ */
let _theme = localStorage.getItem("rep_theme") || "dark";

function applyTheme(t) {
  _theme = t;
  document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "");
  const ico = document.getElementById("theme-icon");
  if (ico) ico.textContent = t === "light" ? "🌙" : "☀️";
  localStorage.setItem("rep_theme", t);
}
window.toggleTheme = () => applyTheme(_theme === "dark" ? "light" : "dark");

/* ══════════════════════════════════
   TOAST
══════════════════════════════════ */
function toast(msg, type = "", dur = 2800) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el?.remove(), dur);
}

/* ══════════════════════════════════
   OFFLINE QUEUE (IndexedDB / fallback localStorage)
══════════════════════════════════ */
const QUEUE_KEY = "rep_offline_queue";
function queueGet()         { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
function queueSave(q)       { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); updateOfflineBadge(); }
function queueAdd(inv)      { const q = queueGet(); q.push(inv); queueSave(q); }
function queueRemove(id)    { queueSave(queueGet().filter(i => i._queueId !== id)); }

function updateOfflineBadge() {
  const q = queueGet();
  const badge = document.getElementById("offline-badge");
  const cnt   = document.getElementById("offline-count");
  if (!badge) return;
  if (q.length > 0) {
    badge.classList.remove("hidden");
    if (cnt) cnt.textContent = q.length;
  } else {
    badge.classList.add("hidden");
  }
}

async function syncQueue() {
  const q = queueGet();
  if (!q.length) return;
  let synced = 0;
  for (const item of q) {
    try {
      if (item.type === "payment") {
        await saveAndProcessPayment(item);
      } else {
        await saveAndProcessInvoice(item);
      }
      queueRemove(item._queueId);
      synced++;
    } catch(e) {
      console.error("Failed to sync queued item:", item._queueId, e.message);
      break;
    }
  }
  if (synced > 0) toast(`✅ تمت مزامنة ${synced} حركات معلّقة بنجاح ودخلت في الحسابات`, "ok");
  await syncPendingStockDeductions();
}

async function syncPendingStockDeductions() {
  try {
    const raw = localStorage.getItem("rep_pending_stock_deductions");
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!list.length) return;
    const { adjustStockBulk } = await import("../utils/db.js");
    const remaining = [];
    let recoveredCount = 0;

    for (const item of list) {
      try {
        const adjustments = (item.lines || [])
          .filter(line => line.productId && line.qty)
          .map(line => ({
            warehouseId: item.warehouseId,
            productId: line.productId,
            qtyDelta: -line.qty,
            metadata: {
              type: "sale_out",
              sourceType: "salesInvoice",
              sourceId: item.invoiceNumber,
              documentNumber: item.invoiceNumber,
              invoiceNumber: item.invoiceNumber,
              allowNegative: false,
              productName: line.name || line.productName || "",
              notes: `مبيعات المندوب — مزامنة معلقة لفاتورة ${item.invoiceNumber}`
            }
          }));

        if (adjustments.length > 0) {
          await adjustStockBulk(adjustments);
          await updateDoc(doc(db, `companies/${COID}/salesInvoices`, item.invoiceNumber), {
            stockStatus: "completed",
            stockUpdatedAt: serverTimestamp()
          }).catch(() => {});
          recoveredCount++;
        }
      } catch (err) {
        console.warn("Retrying pending deduction failed for", item.invoiceNumber, err.message);
        remaining.push(item);
      }
    }
    localStorage.setItem("rep_pending_stock_deductions", JSON.stringify(remaining));
    if (recoveredCount > 0) {
      toast(`✅ تم استكمال خصم المخزون بنجاح لـ ${recoveredCount} فواتير معلقة`, "ok");
    }
  } catch (e) {
    console.warn("syncPendingStockDeductions error:", e.message);
  }
}

// Auto-sync when online
window.addEventListener("online", () => {
  toast("🌐 عاد الإنترنت — جاري المزامنة…", "warn");
  setTimeout(syncQueue, 2000);
});

/* ══════════════════════════════════
   SCREENS
══════════════════════════════════ */
function showSplash()  { setVisible("splash-screen", true); setVisible("login-screen", false); setVisible("app-shell", false); }
function showLogin()   { setVisible("splash-screen", false); setVisible("login-screen", true); setVisible("app-shell", false); }
function showApp()     { setVisible("splash-screen", false); setVisible("login-screen", false); setVisible("app-shell", true); }

function setVisible(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  if (show) el.classList.remove("hidden");
  else      el.classList.add("hidden");
}

/* ══════════════════════════════════
   LOGIN
══════════════════════════════════ */
window.togglePin = (btn) => {
  const inp = document.getElementById("login-pin");
  if (!inp) return;
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "👁" : "🙈";
};

window.doLogin = async () => {
  let phone = (document.getElementById("login-phone")?.value || document.getElementById("rep-login-phone")?.value || "").trim();
  const pin   = (document.getElementById("login-pin")?.value || document.getElementById("rep-login-pin")?.value || "").trim();
  const err   = document.getElementById("login-error") || document.getElementById("rep-login-error");
  const btn   = document.getElementById("login-btn") || document.getElementById("rep-login-btn");
  const lbl   = document.getElementById("login-label") || document.getElementById("rep-login-label");
  const spin  = document.getElementById("login-spin") || document.getElementById("rep-login-spin");

  if (!phone || !pin) { showErr(err, "أدخل رقم الهاتف والـ PIN"); return; }
  btn.disabled = true; lbl?.classList.add("hidden"); spin?.classList.remove("hidden");
  err?.classList.add("hidden");

  try {
    const normPhone = phone.replace(/\D/g, "");
    let q = query(COL("salesReps"), where("phone", "==", phone));
    let snap = await getDocs(q);

    // Try normalized phone numbers
    if (snap.empty && normPhone !== phone) {
      q = query(COL("salesReps"), where("phone", "==", normPhone));
      snap = await getDocs(q);
    }

    // Try alternate leading zero
    if (snap.empty) {
      const altPhone = phone.startsWith("0") ? phone.slice(1) : ("0" + phone);
      q = query(COL("salesReps"), where("phone", "==", altPhone));
      snap = await getDocs(q);
    }

    let matchingDocs = snap.empty ? [] : snap.docs;

    // Fallback: search all salesReps by phone suffix
    if (snap.empty) {
      const allReps = await getDocs(COL("salesReps"));
      const matched = allReps.docs.filter(d => {
        const p = (d.data().phone || "").replace(/\D/g, "");
        return p && normPhone && (p === normPhone || p.endsWith(normPhone) || normPhone.endsWith(p));
      });
      if (matched.length > 0) {
        matchingDocs = matched;
      } else if (!allReps.empty) {
        matchingDocs = allReps.docs;
      }
    }

    if (matchingDocs.length === 0) throw new Error("رقم الهاتف غير مسجّل في النظام");

    // Match by PIN if multiple reps exist for this phone number
    let repDoc = matchingDocs.find(d => d.data().pin === pin);
    if (!repDoc) {
      // Default to first matching rep if no correct PIN is found (to trigger the correct error message)
      repDoc = matchingDocs[0];
    }

    const rep = { id: repDoc.id, ...repDoc.data() };

    if (rep.pin && rep.pin !== pin) {
      throw new Error("رقم PIN غير صحيح");
    }

    if (!rep.pin) rep.pin = pin;

    saveSession(rep);
    initApp();
  } catch(e) {
    showErr(err, e.message);
  } finally {
    btn.disabled = false; lbl?.classList.remove("hidden"); spin?.classList.add("hidden");
  }
};
window._doLogin = window.doLogin;
window.repLogin = window.doLogin;

function showErr(el, msg) { if (!el) return; el.textContent = msg; el.classList.remove("hidden"); }

window.doLogout = () => {
  if (_unsub_stock) { _unsub_stock(); _unsub_stock = null; }
  clearSession();
  showLogin();
};

/* ══════════════════════════════════
   APP INIT
══════════════════════════════════ */
function startHeaderClock() {
  const el = document.getElementById("header-time-date");
  if (!el) return;
  const update = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    const dateStr = now.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" });
    el.textContent = `${timeStr} | ${dateStr}`;
  };
  update();
  setInterval(update, 1000);
}

async function checkAndCreateRepCashBox() {
  if (!REP || !REP.id) return;
  try {
    const boxId = `cashBox_${REP.id}`;
    const boxRef = doc(db, `companies/${COID}/cashBoxes`, boxId);
    const snap = await getDoc(boxRef);
    if (!snap.exists()) {
      let code = "1-1-1-2";
      if (REP.name && REP.name.includes("مصطفى")) code = "1-1-1-2-1";
      else if (REP.name && REP.name.includes("محمد")) code = "1-1-1-2-2";
      
      const boxData = {
        name: `صندوق المندوب - ${REP.name}`,
        balance: 0,
        openingBalance: 0,
        type: "rep",
        keeper: REP.name,
        repId: REP.id,
        accountCode: code,
        createdAt: new Date().toISOString()
      };
      await setDoc(boxRef, boxData);
      console.log(`[CashBox] Auto-created cash box for rep ${REP.name}: ${boxId}`);
    }
  } catch (err) {
    console.warn("Failed to check/create rep cash box:", err.message);
  }
}

function initApp() {
  applyTheme(_theme);
  showApp();
  const ava = document.getElementById("rep-ava");
  if (ava) ava.textContent = REP.name?.[0] || "م";
  const nm  = document.getElementById("header-name");
  if (nm) nm.textContent = REP.name || "المندوب";
  const zo  = document.getElementById("header-zone");
  if (zo) zo.textContent = REP.zone || "—";
  const compEl = document.getElementById("header-company");
  if (compEl) compEl.textContent = COMPANY.name || "نظم الإمداد المتطورة";
  updateOfflineBadge();
  loadCompanyInfo(); // Load company name/address for invoices
  startHeaderClock(); // Start dynamic top bar clock
  checkAndCreateRepCashBox(); // Create cash box if missing
  
  navigate("dashboard");
}


// Expose initApp for standalone login handler in rep.html
window._moduleInitApp = function(rep) {
  _booted = true;              // prevent boot() timer from calling showLogin()
  window._booted = true;       // also set on window for rep.html access
  if (rep) saveSession(rep);
  loadSession();
  if (REP) initApp();
};



/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
let _currentPage = "";

window.navigate = (page) => {
  if (_currentPage === page) return;
  _currentPage = page;
  // Unsubscribe real-time stock if leaving stock/pos
  if (page !== "pos" && page !== "stock") {
    if (_unsub_stock) { _unsub_stock(); _unsub_stock = null; }
  }
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });
  const mc = document.getElementById("page-content");
  if (!mc) return;
  // Reset pos scroll
  mc.style.cssText = "";
  switch(page) {
    case "dashboard": renderDashboard(mc); break;
    case "pos":       renderPOS(mc); break;
    case "credit":    renderCredit(mc); break;
    case "customers": renderCustomers(mc); break;
    case "stock":     renderStock(mc); break;
    default: mc.innerHTML = `<div class="empty-wrap"><div class="empty-icon">🚧</div><div class="empty-text">قريباً</div></div>`;
  }
};

/* ══════════════════════════════════
   DASHBOARD
══════════════════════════════════ */
async function renderDashboard(mc) {
  mc.innerHTML = `<div class="page"><div class="loading-wrap"><div class="spin"></div>جاري التحميل…</div></div>`;
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const all = await fetchRepInvoices(500);
    const month = all.filter(i => (i.date || "") >= monthStart && i.status !== "cancelled");
    const totalSales = month.reduce((s,i) => s + (i.total||0), 0);
    const totalInvs  = month.length;
    const target     = REP.monthlyTarget || 0;
    const pct        = target > 0 ? Math.min(100, (totalSales/target)*100) : 0;

    // Calculate Sales by Payment Method for this month
    let cashSales     = 0;
    let creditSales   = 0;
    let networkSales  = 0;
    let transferSales = 0;

    month.forEach(i => {
      const pm = (i.paymentMethod || "cash").toLowerCase();
      const total = i.total || 0;
      const paid = i.paidAmount !== undefined ? i.paidAmount : (pm === "cash" ? total : 0);
      const remaining = i.remainingAmount !== undefined ? i.remainingAmount : (pm === "credit" ? total : 0);

      if (pm === "cash") {
        cashSales += total;
      } else if (pm === "credit" || pm === "deferred" || pm === "آجل") {
        creditSales += total;
      } else if (pm === "network" || pm === "شبكة" || pm === "bank") {
        networkSales += total;
      } else if (pm === "transfer" || pm === "تحويل") {
        transferSales += total;
      } else if (pm === "partial" || pm === "جزئي") {
        cashSales += paid;
        creditSales += remaining;
      }
    });

    let cashBalance = 0;
    let customerDebts = 0;
    try {
      // ── قراءة صندوق المندوب ومزامنة الرصيد محاسبياً من شجرة الحسابات ──
      const boxId = `cashBox_${REP.id}`;
      const boxSnap = await getDoc(doc(db, `companies/${COID}/cashBoxes`, boxId));
      if (boxSnap.exists()) {
        const boxData = boxSnap.data();
        const accountCode = boxData.accountCode;
        if (accountCode) {
          const coaSnap = await getDocs(query(collection(db, `companies/${COID}/chartOfAccounts`), where("code", "==", accountCode)));
          if (!coaSnap.empty) {
            cashBalance = parseFloat(coaSnap.docs[0].data().balance || 0);
          } else {
            cashBalance = parseFloat(boxData.balance || 0);
          }
        } else {
          cashBalance = parseFloat(boxData.balance || 0);
        }
      }

      // ── حساب مديونية عملاء المندوب مباشرة من أرصدة العملاء الحقيقية (0 قراءات زائدة وتوفير الكوته) ──
      let repCusts = _custCache;
      if (!repCusts || repCusts.length === 0) {
        const custSnap = await getDocs(query(COL("customers"), where("repId", "==", REP.id)));
        repCusts = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        _custCache = repCusts;
      }

      repCusts.forEach(cust => {
        const bal = parseFloat(cust.balance || 0);
        if (bal > 0) customerDebts += bal;
      });
      customerDebts = Math.round(customerDebts * 100) / 100;

    } catch (coaErr) {
      console.warn("Failed to fetch rep customer debts:", coaErr.message);
    }

    const currentViewMode = window.repInvoiceViewMode || "grid";

    mc.innerHTML = `
    <div class="page">
      <div class="page-title">أهلاً ${(REP.name || "").replace(/^المندوب\\s+/, "")} 👋</div>

      <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px;">
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">📈</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: var(--brand);">${fmtC(totalSales)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">إجمالي المبيعات (الشهر)</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">💵</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #10b981;">${fmtC(cashSales)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">مبيعات نقدي (الشهر)</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">💳</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #3b82f6;">${fmtC(networkSales)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">مبيعات شبكة (الشهر)</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">🏛️</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #8b5cf6;">${fmtC(transferSales)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">مبيعات تحويل (الشهر)</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">⏳</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #f59e0b;">${fmtC(creditSales)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">مبيعات آجلة (الشهر)</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">💰</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #14b8a6;">${fmtC(cashBalance)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">صندوق المندوب</div>
        </div>
        <div class="kpi-card" style="padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1); grid-column: span 2;">
          <div class="kpi-icon" style="font-size: 18px; margin-bottom: 2px;">👥</div>
          <div class="kpi-val" style="font-size: 13px; font-weight: 800; color: #ef4444;">${fmtC(customerDebts)} ر.س</div>
          <div class="kpi-lbl" style="font-size: 10px; color: var(--t2); font-weight: bold;">إجمالي مديونية عملاء المندوب (مستحقات)</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--t2); padding: 8px 12px; margin-bottom: 16px; background: var(--bg-2); border: 1px solid var(--border-soft); border-radius: 12px;">
        <span>📊 فواتير الشهر: <strong>${totalInvs} فاتورة</strong></span>
        <span>🎯 إجمالي المبيعات: <strong>${fmtC(totalSales)} ر.س</strong></span>
      </div>

      ${target > 0 ? `
      <div class="target-card">
        <div class="target-header">
          <span>🎯 الهدف الشهري</span>
          <span>${pct.toFixed(1)}% — ${fmtC(target)} ر.س</span>
        </div>
        <div class="target-track">
          <div class="target-fill" style="width:${pct}%;background:${pct>=100?'var(--success)':pct>=70?'var(--warn)':'linear-gradient(90deg,var(--brand),var(--brand-2))'}"></div>
        </div>
      </div>` : ""}

      ${queueGet().length > 0 ? `
      <div class="queue-item" onclick="navigate('dashboard')" style="cursor:pointer;margin-bottom:14px;">
        <div>
          <div style="font-size:13px;font-weight:700;">⏳ فواتير معلّقة للمزامنة</div>
          <div style="font-size:11px;color:var(--t2);">ستُرسل تلقائياً عند عودة الإنترنت</div>
        </div>
        <div class="queue-status">${queueGet().length} فاتورة</div>
      </div>` : ""}

      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div class="section-title" style="margin-bottom:0;">أحدث الفواتير (${all.length})</div>
        <div class="view-mode-toggle">
          <button class="view-btn ${currentViewMode === 'grid' ? 'active' : ''}" onclick="toggleRepInvViewMode('grid')">🎴 كروت</button>
          <button class="view-btn ${currentViewMode === 'list' ? 'active' : ''}" onclick="toggleRepInvViewMode('list')">📋 قائمة</button>
        </div>
      </div>

      ${all.length === 0
        ? `<div class="empty-wrap"><div class="empty-icon">🧾</div><div class="empty-text">لا توجد فواتير بعد</div></div>`
        : currentViewMode === "grid"
          ? `<div class="inv-grid">
              ${all.slice(0, 30).map(inv => {
                const invNo = inv.invoiceNumber || inv.number || inv.id.slice(0,8);
                const isRepApp = invNo.startsWith("REP") || invNo.startsWith("VAN");
                const pm = (inv.paymentMethod || "cash").toLowerCase();
                let badgeClass = "cash";
                let badgeText = "نقدي 💵";
                if (pm === "credit" || pm === "deferred" || pm === "آجل") {
                  badgeClass = "credit";
                  badgeText = "آجل ⏳";
                } else if (pm === "partial" || pm === "جزئي") {
                  badgeClass = "partial";
                  badgeText = "جزئي 🌓";
                } else if (pm === "network" || pm === "شبكة") {
                  badgeClass = "network";
                  badgeText = "شبكة 💳";
                } else if (pm === "transfer" || pm === "تحويل") {
                  badgeClass = "network";
                  badgeText = "تحويل 🏛️";
                }

                const srcBadge = isRepApp
                  ? `<span class="inv-source-badge rep-app">تطبيق المندوب 📱</span>`
                  : `<span class="inv-source-badge main-app">المكتب الرئيسي 🏢</span>`;

                return `
                <div class="inv-card">
                  <div class="inv-card-header">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-size:13px; font-weight:800; color:var(--t1);">🧾 ${invNo}</span>
                      ${srcBadge}
                    </div>
                    <span class="pm-badge ${badgeClass}">${badgeText}</span>
                  </div>
                  <div class="inv-card-body">
                    <div class="inv-card-cust">🏪 ${inv.customerName || "—"}</div>
                    <div class="inv-card-meta">
                      <span>📅 ${inv.date || "—"}</span>
                      <span>📦 ${inv.lines?.length || 0} صنف</span>
                    </div>
                  </div>
                  <div class="inv-card-footer">
                    <div>
                      <div style="font-size:10px; color:var(--t2);">إجمالي الفاتورة</div>
                      <div class="inv-card-total">${fmtC(inv.total || 0)} <span style="font-size:11px; font-weight:600;">ر.س</span></div>
                    </div>
                    <div style="display:flex; gap:4px; align-items:center;">
                      <button onclick="viewInvoice('${inv.id}')" style="background:var(--bg-1); border:1px solid var(--border-soft); border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px;" title="عرض التفاصيل">👁️</button>
                      <button onclick="window.printInvoice('${inv.id}')" style="background:var(--bg-1); border:1px solid var(--border-soft); border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px;" title="طباعة">🖨️</button>
                      <button onclick="deleteRepInvoice('${inv.id}')" style="background:var(--bg-1); border:1px solid var(--border-soft); border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px; filter: grayscale(1);" title="حذف">🗑️</button>
                    </div>
                  </div>
                </div>`;
              }).join("")}
            </div>`
          : `<div class="inv-list">
              ${all.slice(0, 30).map(inv => {
                const invNo = inv.invoiceNumber || inv.number || inv.id.slice(0,8);
                const isRepApp = invNo.startsWith("REP") || invNo.startsWith("VAN");
                const pm = (inv.paymentMethod || "cash").toLowerCase();
                let badgeClass = "cash";
                let badgeText = "نقدي";
                if (pm === "credit" || pm === "deferred" || pm === "آجل") {
                  badgeClass = "credit";
                  badgeText = "آجل";
                } else if (pm === "partial" || pm === "جزئي") {
                  badgeClass = "partial";
                  badgeText = "جزئي";
                } else if (pm === "network" || pm === "شبكة") {
                  badgeClass = "network";
                  badgeText = "شبكة";
                } else if (pm === "transfer" || pm === "تحويل") {
                  badgeClass = "network";
                  badgeText = "تحويل";
                }

                const srcBadge = isRepApp
                  ? `<span class="inv-source-badge rep-app" style="margin-right:4px;">تطبيق المندوب 📱</span>`
                  : `<span class="inv-source-badge main-app" style="margin-right:4px;">المكتب الرئيسي 🏢</span>`;

                return `
                <div class="inv-item" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px;">
                  <div style="flex:1; display:flex; align-items:center; justify-content:space-between;">
                    <div>
                      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span class="inv-no">${invNo}</span>
                        ${srcBadge}
                        <span class="pm-badge ${badgeClass}">${badgeText}</span>
                      </div>
                      <div class="inv-cust">${inv.customerName || "—"}</div>
                    </div>
                    <div style="text-align:left; margin-left:12px; margin-right:12px;">
                      <div class="inv-amount">${fmtC(inv.total||0)}</div>
                      <div class="inv-date">${inv.date||""}</div>
                    </div>
                  </div>
                  <div style="display:flex; gap:6px; align-items:center; margin-right:8px;">
                    <button onclick="viewInvoice('${inv.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; padding:6px;" title="عرض الفاتورة">👁️</button>
                    <button onclick="window.printInvoice('${inv.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; padding:6px;" title="طباعة الفاتورة">🖨️</button>
                    <button onclick="deleteRepInvoice('${inv.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; padding:6px; filter: grayscale(1);" title="حذف الفاتورة">🗑️</button>
                  </div>
                </div>`;
              }).join("")}
            </div>`
      }
    </div>`;
  } catch(e) {
    mc.innerHTML = `<div class="page"><div class="empty-wrap"><div class="empty-icon">⚠️</div><div class="empty-text">${e.message}</div></div></div>`;
  }
}

/* ── View Mode Switcher Helper ── */
window.toggleRepInvViewMode = (mode) => {
  window.repInvoiceViewMode = mode;
  const mc = document.getElementById("main-content");
  if (mc) renderDashboard(mc);
};

/* ─── Delete Rep Invoice (Manager PIN Protected) ─── */
window.deleteRepInvoice = async (id) => {
  const pin = prompt("🔒 يرجى إدخال رمز PIN الخاص بالمدير لإتمام عملية الحذف:");
  if (!pin) return;
  
  try {
    const q = query(COL("salesReps"), where("pin", "==", pin));
    const snap = await getDocs(q);
    if (snap.empty) {
      toast("❌ رمز PIN الخاص بالمدير غير صحيح!", "err");
      return;
    }
    
    const repData = snap.docs[0].data();
    const isAdmin = repData.role === "admin" || repData.isAdmin === true || repData.name.includes("مصطفى");
    if (!isAdmin) {
      toast("❌ عذراً، لا يمتلك هذا المندوب صلاحية حذف الفواتير!", "err");
      return;
    }
    
    if (!confirm(`⚠️ هل أنت متأكد من رغبتك في حذف الفاتورة ${id} نهائياً؟`)) return;
    
    const invRef = doc(db, `companies/${COID}/salesInvoices`, id);
    const invSnap = await getDoc(invRef);
    if (!invSnap.exists()) {
      toast("❌ الفاتورة غير موجودة!", "err");
      return;
    }
    const inv = invSnap.data();
    
    await runTransaction(db, async (tx) => {
      // Delete invoice document
      tx.delete(invRef);
      
      // Reverse stock
      if (inv.warehouseId && inv.lines) {
        for (const line of inv.lines) {
          const sq = query(COL("stockByWarehouse"), where("productId","==",line.productId), where("warehouseId","==",inv.warehouseId));
          const ss = await getDocs(sq);
          if (!ss.empty) {
            tx.update(ss.docs[0].ref, { qty: increment(line.qty) });
          }
        }
      }
      
      // عكس رصيد العميل (فقط للفواتير الآجلة أو الجزئية بقيمة remainingAmount — Bug fix)
      const remainingToReverse = parseFloat(inv.remainingAmount ?? (inv.paymentMethod === "credit" ? inv.total : 0));
      if ((inv.paymentMethod === "credit" || inv.paymentMethod === "deferred" || inv.paymentMethod === "آجل" || inv.paymentMethod === "partial") && inv.customerId && remainingToReverse > 0) {
        tx.update(doc(COL("customers"), inv.customerId), { balance: increment(-remainingToReverse) });
      }
    });

    // Delete or reverse Cash Transaction if cash
    if (inv.paymentMethod === "cash") {
      try {
        const txnsSnap = await getDocs(query(COL("cashTransactions"), where("sourceId", "==", id)));
        for (const docOfTxn of txnsSnap.docs) {
          await runTransaction(db, async (tx) => {
            tx.delete(docOfTxn.ref);
            // Reverse balance in cash box
            const boxRef = doc(db, `companies/${COID}/cashBoxes`, `cashBox_${inv.repId}`);
            tx.update(boxRef, { balance: increment(-inv.total) });
          });
        }
      } catch (ctxnErr) {
        console.warn("Failed to reverse cash transaction:", ctxnErr.message);
      }
    }

    // Delete associated receipts and their JEs
    try {
      const rcptSnap = await getDocs(query(COL("receipts"), where("sourceInvoiceId", "==", id)));
      for (const rcptDoc of rcptSnap.docs) {
        const rcptId = rcptDoc.id;
        // Delete receipt JEs
        try {
          const jeSnap = await getDocs(query(COL("journalEntries"), where("sourceId", "==", rcptId)));
          for (const jeDoc of jeSnap.docs) {
            await runTransaction(db, async (tx) => { tx.delete(jeDoc.ref); });
          }
        } catch(jeErr) {
          console.warn("Failed to delete receipt JE in deleteRepInvoice:", jeErr.message);
        }
        // Delete receipt
        await runTransaction(db, async (tx) => { tx.delete(rcptDoc.ref); });
        console.log(`[Cleanup] Deleted receipt ${rcptId} for deleted rep invoice ${id}`);
      }
    } catch(rcptErr) {
      console.warn("Failed to delete associated receipts in deleteRepInvoice:", rcptErr.message);
    }

    // Delete associated Journal Entries
    try {
      const jeSnap = await getDocs(query(COL("journalEntries"), where("sourceId", "==", id)));
      for (const jeDoc of jeSnap.docs) {
        await runTransaction(db, async (tx) => {
          tx.delete(jeDoc.ref);
        });
      }
    } catch (jeErr) {
      console.warn("Failed to delete journal entries for deleted invoice:", jeErr.message);
    }
    
    toast("✅ تم حذف الفاتورة وإلغاء حركاتها بنجاح", "ok");
    
    // إعادة حساب رصيد العميل بالكامل بعد الحذف
    if (inv.customerId) {
      import("../utils/balance-sync.js").then(m => {
        m.recalculateCustomerBalance(inv.customerId).catch(e => console.warn("Balance recalc after delete failed:", e.message));
      }).catch(() => {});
    }
    
    window.location.reload();

  } catch (err) {
    toast(`❌ فشل الحذف: ${err.message}`, "err");
  }
};

/* ══════════════════════════════════
   POS SCREEN
══════════════════════════════════ */
let _pos = {
  lines:    [],
  cust:     null,
  pay:      "cash",
  discount: 0,
  products: [],
  catMap:   {}, // categoryId → {name, emoji}
  viewGrid: true,
  filterCat:"all",
};

async function renderPOS(mc) {
  if (!REP.assignedWarehouseId) {
    mc.style.cssText = "";
    mc.innerHTML = `
      <div class="page" style="display:flex; align-items:center; justify-content:center; height:100%; min-height:350px;">
        <div class="empty-wrap" style="text-align:center; padding:32px; background:var(--bg-1); border-radius:24px; border:1px solid var(--border); box-shadow:var(--shadow); max-width:90%; margin:auto;">
          <div class="empty-icon" style="font-size:64px; margin-bottom:16px;">🚗</div>
          <div class="empty-text" style="font-weight:800; font-size:17px; color:var(--t1); margin-bottom:8px;">لم يتم ربط مخزن السيارة بعد</div>
          <div style="font-size:12px; color:var(--t2); line-height:1.6;">تواصل مع إدارة النظام لتعيين مستودع السيارة المخصص لك لتتمكن من تحميل المخزون والبدء بالبيع.</div>
          <button class="btn-primary" onclick="navigate('dashboard')" style="margin-top:20px; min-height:42px; font-size:13px; padding:8px 16px; margin: 0 auto;">🔄 العودة للرئيسية</button>
        </div>
      </div>`;
    return;
  }

  mc.style.cssText = "padding:0;height:100%;display:flex;flex-direction:column;overflow:hidden;";
  _pos.lines = []; _pos.cust = null; _pos.pay = "cash"; _pos.discount = 0;

  mc.innerHTML = `
  <div class="pos-shell" id="pos-shell">

    <!-- Top bar -->
    <div class="pos-topbar">
      <button class="btn-ghost btn-primary pos-back" onclick="navigate('dashboard')">← رجوع</button>
      <div class="pos-cust-pill" id="pos-cust-pill" onclick="openCustPicker()">
        <span>👤</span>
        <span class="pos-cust-pill-name" id="pos-cust-name">اختر عميل…</span>
      </div>
    </div>

    <!-- Category chips -->
    <div class="cat-strip" id="cat-strip">
      <div class="cat-chip active" data-cat="all" onclick="posCatFilter('all',this)">
        <span>🏷</span> الكل
        <span class="cat-count" id="cat-count-all">—</span>
      </div>
    </div>

    <!-- Responsive Split Layout Main Body -->
    <div class="pos-body" style="display:flex; flex:1; overflow:hidden;">
      <!-- Right Side: Products list -->
      <div class="pos-products" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <!-- Search toolbar -->
        <div class="pos-toolbar" style="flex-shrink:0; display:flex; align-items:center; gap:8px;">
          <input class="pos-search" id="pos-search" type="search" placeholder="🔍 بحث في الأصناف…" oninput="posSearch(this.value)" style="flex:1;" />
          <button onclick="startVoiceSearch()" style="background:var(--bg-2); border:1px solid var(--border); border-radius:8px; height:38px; width:38px; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; margin:0;" title="البحث الصوتي">🎤</button>
          <button onclick="startBarcodeScan()" style="background:var(--bg-2); border:1px solid var(--border); border-radius:8px; height:38px; width:38px; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; margin:0;" title="قارئ الباركود بالكاميرا">📷</button>
          <div class="view-toggle" onclick="posToggleView()" id="view-toggle-btn" style="margin:0;">⊞</div>
        </div>

        <!-- Cashier Ticker: shows last added product -->
        <div class="pos-ticker" id="pos-ticker" style="flex-shrink:0;">
          <span class="pos-ticker-icon" id="ticker-icon">🛒</span>
          <span class="pos-ticker-name" id="ticker-name">—</span>
          <span class="pos-ticker-qty"  id="ticker-qty">×1</span>
          <span class="pos-ticker-price" id="ticker-price">0.00</span>
        </div>

        <!-- Product Grid -->
        <div class="prod-grid" id="prod-grid" style="flex:1; overflow-y:auto;">
          <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--t3);">
            <div class="spin" style="margin:0 auto 14px;"></div> جاري التحميل…
          </div>
        </div>
      </div>

      <!-- Left Side: Cashier Split-Screen Cart Sidebar (displayed on wide screens) -->
      <div class="pos-cart">
        <div class="cart-header">
          <span>🛒 السلة</span>
          <span class="cart-count-badge" id="cart-side-count">0</span>
        </div>
        <div class="cart-body" id="cart-body">
          <div class="cart-empty">
            <span style="font-size:32px;">🛒</span>
            <span>السلة فارغة</span>
          </div>
        </div>
        
        <!-- Payment & Discount & Totals inside Sidebar -->
        <div style="padding:12px; border-top:1px solid var(--border); background:var(--bg-2); display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
          <!-- Payment Method -->
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:11px; color:var(--t2); font-weight:700;">طريقة الدفع:</span>
            <div class="pay-chips" style="width:100%; display:flex; gap:4px; padding:0;">
              <button class="pay-chip active" id="side-pm-cash" onclick="posSetPay('cash')" style="flex:1; padding:6px; font-size:11px;">💵 نقدي</button>
              <button class="pay-chip" id="side-pm-credit" onclick="posSetPay('credit')" style="flex:1; padding:6px; font-size:11px;">📋 آجل</button>
              <button class="pay-chip" id="side-pm-transfer" onclick="posSetPay('transfer')" style="flex:1; padding:6px; font-size:11px;">🏦</button>
              <button class="pay-chip" id="side-pm-cheque" onclick="posSetPay('cheque')" style="flex:1; padding:6px; font-size:11px;">🗒️</button>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:11px; color:var(--t2); font-weight:700;">الخصم:</span>
            <input type="number" class="disc-chip" id="pos-side-disc" placeholder="خصم ر.س" min="0" step="0.5" style="width:90px; text-align:center; padding:4px;"
              oninput="_pos.discount=parseFloat(this.value)||0;updateCartFab();" />
          </div>
          
          <!-- Amount Paid -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:11px; color:var(--brand); font-weight:700;">المبلغ المدفوع:</span>
            <input type="number" class="disc-chip" id="pos-side-paid" placeholder="الكل" min="0" step="0.5" style="width:90px; text-align:center; padding:4px; border-color:var(--brand);"
              oninput="_pos.paidAmount=this.value!==''?parseFloat(this.value):undefined; syncPaidInputs(this.value);" />
          </div>

          <!-- Totals -->
          <div style="border-top:1px dashed var(--border); padding-top:6px; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t2);">
              <span>قبل الضريبة</span><span id="cart-side-sub">0.00 ر.س</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t2);">
              <span>ضريبة 15%</span><span id="cart-side-vat">0.00 ر.س</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:900; color:var(--brand-2);">
              <span>الإجمالي</span><span id="cart-side-total">0.00 ر.س</span>
            </div>
          </div>
          <button class="confirm-btn" style="width:100%; padding:12px; font-size:15px; font-weight:700;" onclick="posSubmit();">
            ✅ تأكيد الفاتورة
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Cart FAB (displayed on mobile only) -->
    <div class="cart-fab" id="cart-fab" onclick="openCartSheet()">
      <span style="font-size:22px;">🛒</span>
      <span class="cart-fab-badge hidden" id="cart-fab-badge">0</span>
      <span class="cart-fab-total" id="cart-fab-total">0.00</span>
    </div>

    <!-- Compact Mobile Footer Bar (displayed on mobile only) -->
    <div class="pos-footer-bar">
      <div class="pay-chips">
        <button class="pay-chip active" id="pm-cash"     onclick="posSetPay('cash')"    title="نقدي">💵 نقدي</button>
        <button class="pay-chip"        id="pm-credit"   onclick="posSetPay('credit')"  title="آجل">📋 آجل</button>
        <button class="pay-chip"        id="pm-transfer" onclick="posSetPay('transfer')" title="تحويل">🏦</button>
        <button class="pay-chip"        id="pm-cheque"   onclick="posSetPay('cheque')"  title="شيك">🗒️</button>
      </div>
      <div style="display:flex; gap:8px; width:100%;">
        <input type="number" class="disc-chip" id="pos-disc" placeholder="خصم ر.س" min="0" step="0.5"
          oninput="_pos.discount=parseFloat(this.value)||0;updateCartFab();" style="flex:1;" />
        <input type="number" class="disc-chip" id="pos-paid" placeholder="المدفوع" min="0" step="0.5"
          oninput="_pos.paidAmount=this.value!==''?parseFloat(this.value):undefined; syncPaidInputs(this.value);" style="flex:1; border-color:var(--brand);" />
      </div>
      <div class="footer-total">
        <div class="ft-lbl">الإجمالي</div>
        <div class="ft-val" id="pos-total">0.00</div>
      </div>
      <button class="footer-confirm-btn" id="confirm-btn" onclick="posSubmit()">✅ تأكيد</button>
    </div>
  </div>`;

  // Non-blocking: render UI immediately, load products in background
  posLoadProducts();
  posStartStockListener();
}

/* ─── Cart Sheet (Bottom Sheet) ─── */
window.openCartSheet = () => {
  const existing = document.getElementById("cart-sheet-overlay");
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "cart-sheet-overlay";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh;display:flex;flex-direction:column;">
    <div class="sheet-handle"></div>
    <div class="sheet-title" style="flex-shrink:0;">
      🛒 السلة
      <span id="sheet-item-count" style="font-size:12px;color:var(--t2);font-weight:400;">
        (${_pos.lines.reduce((s,l)=>s+l.qty,0)} وحدة)
      </span>
    </div>

    <!-- Items list -->
    <div class="sheet-body" id="cart-sheet-body"
         style="flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:10px;">
    </div>

    <!-- Totals -->
    <div style="padding:10px 14px;border-top:1px solid var(--border);flex-shrink:0;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:4px;">
        <span>قبل الضريبة</span><span id="sheet-sub-val">0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:6px;">
        <span>ضريبة 15%</span><span id="sheet-vat-val">0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:var(--brand-2);">
        <span>الإجمالي</span><span id="sheet-total-val">0.00 ر.س</span>
      </div>
    </div>

    <!-- Confirm -->
    <div style="padding:8px 14px calc(10px + var(--safe-bot));flex-shrink:0;">
      <button class="confirm-btn" style="width:100%;font-size:16px;padding:15px;"
        onclick="document.getElementById('cart-sheet-overlay')?.remove();posSubmit();">
        ✅ تأكيد الفاتورة
      </button>
    </div>
  </div>`;

  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("pos-shell")?.appendChild(overlay);
  refreshCartSheet();
};

// Render all items into the cart sheet body
function refreshCartSheet() {
  const body = document.getElementById("cart-sheet-body");
  if (!body) return;

  // Update totals
  const { sub, vat, total } = posUpdateTotals();
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl("sheet-sub-val",   fmtC(sub));
  setEl("sheet-vat-val",   fmtC(vat));
  setEl("sheet-total-val", fmtC(total) + " ر.س");
  setEl("sheet-item-count", `(${_pos.lines.reduce((s,l)=>s+l.qty,0)} وحدة)`);

  if (!_pos.lines.length) {
    body.innerHTML = `
      <div class="cart-empty" style="padding:40px 0;">
        <span style="font-size:48px;">🛒</span>
        <span style="font-size:14px;color:var(--t2);text-align:center;">السلة فارغة<br>اضغط على الأصناف لإضافتها</span>
      </div>`;
    return;
  }

  body.innerHTML = _pos.lines.map((ln, i) => `
  <div class="cart-row" id="cs-row-${i}">
    <div class="cart-row-top">
      <span class="cart-row-icon">${prodIcon({name:ln.name,categoryName:''})}</span>
      <div class="cart-row-info">
        <div class="cart-row-name">${ln.name}</div>
        <div class="cart-row-unit-price">${fmtC(ln.price)} ر.س / وحدة</div>
      </div>
      <button class="cart-row-del" onclick="csRemove(${i})">🗑</button>
    </div>
    <div class="cart-row-bottom">
      <button class="cart-qty-btn minus" onclick="csQty(${i},-1)">−</button>
      <input class="cart-qty-val" type="number" inputmode="numeric"
        value="${ln.qty}" min="1" max="${ln.stock||999}"
        onchange="csSetQty(${i},this.value)"
        onfocus="this.select()" />
      <button class="cart-qty-btn plus" onclick="csQty(${i},1)">+</button>
      <div class="cart-row-price" id="cs-price-${i}">${fmtC(ln.price * ln.qty)} ر.س</div>
    </div>
  </div>`).join("");
}

// Cart sheet actions (cs = cart sheet)
window.csQty = (i, d) => {
  if (!_pos.lines[i]) return;
  const ln = _pos.lines[i];
  ln.qty = Math.max(1, ln.qty + d);
  if (ln.qty > (ln.stock || 999)) { ln.qty = ln.stock; toast("وصلت للحد المتاح", "warn"); }
  // Update row in-place
  const inp = document.querySelector(`#cs-row-${i} .cart-qty-val`);
  const priceEl = document.getElementById(`cs-price-${i}`);
  if (inp)     inp.value = ln.qty;
  if (priceEl) priceEl.textContent = fmtC(ln.price * ln.qty) + " ر.س";
  updateCartFab();
  updateCardBadge(ln.productId);
  // Refresh totals
  const { sub, vat, total } = posUpdateTotals();
  const s = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  s("sheet-sub-val",   fmtC(sub));
  s("sheet-vat-val",   fmtC(vat));
  s("sheet-total-val", fmtC(total)+" ر.س");
  s("sheet-item-count", `(${_pos.lines.reduce((s,l)=>s+l.qty,0)} وحدة)`);
};

window.csSetQty = (i, val) => {
  if (!_pos.lines[i]) return;
  const ln = _pos.lines[i];
  ln.qty = Math.max(1, Math.min(parseInt(val)||1, ln.stock||999));
  const inp = document.querySelector(`#cs-row-${i} .cart-qty-val`);
  const priceEl = document.getElementById(`cs-price-${i}`);
  if (inp)     inp.value = ln.qty;
  if (priceEl) priceEl.textContent = fmtC(ln.price * ln.qty) + " ر.س";
  updateCartFab();
  updateCardBadge(ln.productId);
  const { sub, vat, total } = posUpdateTotals();
  const s = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  s("sheet-sub-val",   fmtC(sub));
  s("sheet-vat-val",   fmtC(vat));
  s("sheet-total-val", fmtC(total)+" ر.س");
};

window.csRemove = (i) => {
  const pid = _pos.lines[i]?.productId;
  _pos.lines.splice(i, 1);
  updateCartFab();
  if (pid) updateCardBadge(pid);
  refreshCartSheet();
};



function updateCartFab() {
  const totalQty = _pos.lines.reduce((s,l) => s+l.qty, 0);
  const { sub, vat, total } = posUpdateTotals();
  const badge = document.getElementById("cart-fab-badge");
  const fabT  = document.getElementById("cart-fab-total");
  const footT = document.getElementById("pos-total");
  if (badge) { badge.textContent = totalQty; badge.classList.toggle("hidden", totalQty===0); }
  if (fabT)  fabT.textContent  = fmtC(total);
  if (footT) footT.textContent = fmtC(total);

  // Update split-screen side cart totals
  const sideCount = document.getElementById("cart-side-count");
  const sideSub   = document.getElementById("cart-side-sub");
  const sideVat   = document.getElementById("cart-side-vat");
  const sideTotal = document.getElementById("cart-side-total");
  if (sideCount) sideCount.textContent = totalQty;
  if (sideSub)   sideSub.textContent   = fmtC(sub) + " ر.س";
  if (sideVat)   sideVat.textContent   = fmtC(vat) + " ر.س";
  if (sideTotal) sideTotal.textContent = fmtC(total) + " ر.س";
}

/* ─── Load Products (cache-first → network refresh) ─── */
const _PROD_CACHE_KEY = `rep_products_${COID}`;

async function posLoadProducts() {
  // ── STEP 1: Show cached products INSTANTLY (< 10ms) ──────────────────
  const cached = localStorage.getItem(_PROD_CACHE_KEY);
  if (cached) {
    try {
      let cachedProds = JSON.parse(cached);
      if (REP.assignedWarehouseId) {
        cachedProds = cachedProds.filter(p => (p.stockQty || 0) > 0);
      }
      _pos.products = cachedProds;
      buildCatStrip();
      posRenderGrid();
    } catch(e) { /* ignore corrupt cache */ }
  }

  // ── STEP 2: Fetch from Firestore in parallel (background) ───────────
  try {
    // Run all queries simultaneously + load main warehouse stock
    const [psSnap, ssSnap, whSnap, allWhSnap] = await Promise.all([
      getDocs(COL("products")),
      REP.assignedWarehouseId
        ? getDocs(query(COL("stockByWarehouse"), where("warehouseId", "==", REP.assignedWarehouseId)))
        : Promise.resolve(null),
      REP.assignedWarehouseId
        ? getDoc(doc(db, `companies/${COID}/warehouses`, REP.assignedWarehouseId))
        : Promise.resolve(null),
      getDocs(COL("warehouses")),
    ]);

    // Check if warehouse is main warehouse or not a car warehouse
    let whName = "";
    if (whSnap && whSnap.exists()) {
      whName = whSnap.data().name || "";
    }
    const isMain = whName.includes("الرئيسي") || whName.includes("الرئيسى") || whName.toLowerCase().includes("main") || REP.assignedWarehouseId === "W5uANJjMgfFh2p3xU4bT";
    const isCar = whName.includes("سيارة") || whName.includes("سياره") || whName.includes("مندوب") || whName.toLowerCase().includes("van") || whName.toLowerCase().includes("rep");

    if (!REP.assignedWarehouseId || isMain || !isCar) {
      const posShell = document.getElementById("pos-shell");
      if (posShell) {
        posShell.style.cssText = "";
        posShell.innerHTML = `
          <div class="page" style="display:flex; align-items:center; justify-content:center; height:100%; min-height:350px;">
            <div class="empty-wrap" style="text-align:center; padding:32px; background:var(--bg-1); border-radius:24px; border:1px solid var(--border); box-shadow:var(--shadow); max-width:90%; margin:auto;">
              <div class="empty-icon" style="font-size:64px; margin-bottom:16px;">🚗</div>
              <div class="empty-text" style="font-weight:800; font-size:17px; color:var(--t1); margin-bottom:8px;">مستودع غير صالح للمندوب</div>
              <div style="font-size:12px; color:var(--t2); line-height:1.6; margin-bottom:16px;">
                مستودعك الحالي هو (<b>${whName || "غير محدد"}</b>).<br>
                يُمنع المندوب من البيع مباشرة من المستودع الرئيسي. يجب ربط حسابك بمخزن سيارتك المخصص.
              </div>
              <button class="btn-primary" onclick="navigate('dashboard')" style="margin-top:20px; min-height:42px; font-size:13px; padding:8px 16px; margin: 0 auto;">🔄 العودة للرئيسية</button>
            </div>
          </div>`;
      }
      return;
    }

    // بحث عن المستودع الرئيسي تلقائياً
    const allWarehouses = allWhSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const mainWh = allWarehouses.find(w =>
      w.id !== REP.assignedWarehouseId &&
      (w.name?.includes("الرئيسي") || w.name?.includes("الرئيسى") || w.id === "W5uANJjMgfFh2p3xU4bT")
    ) || allWarehouses.find(w => w.id !== REP.assignedWarehouseId);
    REP._mainWarehouseId = mainWh?.id || null;

    // تحميل مخزون المستودع الرئيسي لمعرفة ما يمكن طلب شحنه
    let mainStockMap = {};
    if (REP._mainWarehouseId) {
      try {
        const mainSS = await getDocs(query(COL("stockByWarehouse"), where("warehouseId", "==", REP._mainWarehouseId)));
        mainSS.docs.forEach(d => { const dt = d.data(); mainStockMap[dt.productId] = dt.qty ?? 0; });
      } catch(e) { /* غير حرج */ }
    }

    // Build stock map (مخزون السيارة)
    const stockMap = {};
    if (ssSnap) ssSnap.docs.forEach(d => { const dt = d.data(); stockMap[dt.productId] = dt.qty ?? 0; });

    // Build products list — كل المنتجات (ليس فقط المتوفرة في السيارة)
    let freshProds = psSnap.docs.map(d => {
      const dt = d.data();
      const name = dt.name || dt.nameAr || dt.productName || dt.title || (dt.sku ? `صنف ${dt.sku}` : "صنف");
      return {
        id: d.id, ...dt, name: name,
        stockQty:     REP.assignedWarehouseId ? (stockMap[d.id]     ?? 0) : 0,
        mainStockQty: mainStockMap[d.id] ?? 0,  // كمية المستودع الرئيسي
      };
    }).sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));

    // لا نحذف المنتجات غير المتوفرة — نعرضها بلون مختلف مع زر "اطلب شحن"
    _pos.products = freshProds;

    // Cache for next visit
    try { localStorage.setItem(_PROD_CACHE_KEY, JSON.stringify(freshProds)); } catch(e) {}

    buildCatStrip();
    posRenderGrid();
  } catch(e) {
    // If network failed but we had cache, stay on cache silently
    if (!_pos.products.length) {
      const g = document.getElementById("prod-grid");
      if (g) g.innerHTML = `<div style="grid-column:1/-1;color:var(--danger);text-align:center;padding:20px;">${e.message}</div>`;
    }
  }
}

// Build category strip from _pos.products
function buildCatStrip() {
  _pos.catMap = { all: { name: "الكل", emoji: "🏷" } };
  const catCounts = {};
  _pos.products.forEach(p => {
    const cid = p.category || "other";
    const cn  = p.categoryName || "أخرى";
    if (!_pos.catMap[cid]) _pos.catMap[cid] = { name: cn, emoji: catEmoji(cn) };
    catCounts[cid] = (catCounts[cid] || 0) + 1; // نحسب كل المنتجات
  });

  const strip = document.getElementById("cat-strip");
  if (!strip) return;

  const total = _pos.products.length; // كل المنتجات

  let html = `
    <div class="cat-chip ${(!_pos.filterCat || _pos.filterCat === 'all') ? 'active' : ''}" data-cat="all" onclick="posCatFilter('all',this)">
      <span>🏷</span> الكل
      <span class="cat-count" id="cat-count-all">${total}</span>
    </div>
  `;

  let colorIdx = 0;
  Object.entries(_pos.catMap).forEach(([cid, cat]) => {
    if (cid === "all") return;
    const cnt = catCounts[cid] || 0;
    if (!cnt && REP.assignedWarehouseId) return;
    const [c1, c2] = catColor(cat.name, colorIdx++);
    const isActive = _pos.filterCat === cid;
    html += `
      <div class="cat-chip ${isActive ? 'active' : ''}" data-cat="${cid}" 
        style="--chip-c1: ${c1}; --chip-c2: ${c2};"
        onclick="posCatFilter('${cid}',this)">
        <span>${cat.emoji}</span> ${cat.name}
        <span class="cat-count">${cnt}</span>
      </div>
    `;
  });

  strip.innerHTML = html;
}



/* ─── Real-time Stock Listener ─── */
function posStartStockListener() {
  if (!REP.assignedWarehouseId) return;
  if (_unsub_stock) { _unsub_stock(); }
  const sq = query(COL("stockByWarehouse"), where("warehouseId", "==", REP.assignedWarehouseId));
  _unsub_stock = onSnapshot(sq, (snap) => {
    snap.docs.forEach(d => {
      const dt = d.data();
      const p = _pos.products.find(x => x.id === dt.productId);
      if (p) {
        const oldQty = p.stockQty;
        p.stockQty = dt.qty ?? 0;
        if (oldQty > 0 && p.stockQty === 0) toast(`⚠️ نفد: ${p.name}`, "warn");
      }
    });
    posRenderGrid();
  });
}

/* ─── Category Filter ─── */
window.posCatFilter = (catId, el) => {
  _pos.filterCat = catId;
  document.querySelectorAll(".cat-chip").forEach(c => c.classList.toggle("active", c.dataset.cat === catId));
  const search = document.getElementById("pos-search");
  if (search) search.value = "";
  posRenderGrid();
};

/* ─── Search ─── */
window.posSearch = (q) => posRenderGrid(q);

/* ─── Toggle View ─── */
window.posToggleView = () => {
  _pos.viewGrid = !_pos.viewGrid;
  const btn = document.getElementById("view-toggle-btn");
  if (btn) btn.textContent = _pos.viewGrid ? "⊞" : "☰";
  posRenderGrid();
};

/* ─── Render Grid ─── */
function posRenderGrid(search = "") {
  const grid = document.getElementById("prod-grid");
  if (!grid) return;
  const q = search || (document.getElementById("pos-search")?.value || "");
  const isGrid = _pos.viewGrid;

  let prods = _pos.products;
  if (_pos.filterCat && _pos.filterCat !== "all") prods = prods.filter(p => (p.category||"other") === _pos.filterCat);
  if (q) prods = prods.filter(p => p.name?.includes(q) || p.barcode?.includes(q));

  // Priority: in-stock first, out-of-stock last
  if (REP.assignedWarehouseId) {
    prods = [...prods].sort((a, b) => {
      const aOos = (a.stockQty || 0) <= 0;
      const bOos = (b.stockQty || 0) <= 0;
      if (aOos === bOos) return 0;
      return aOos ? 1 : -1; // in-stock (false) comes before out-of-stock (true)
    });
  }

  if (!prods.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--t3);">لا يوجد أصناف</div>`;
    return;
  }


  if (isGrid) {
    grid.style.gridTemplateColumns = "repeat(auto-fill,minmax(100px,1fr))";
  } else {
    grid.style.gridTemplateColumns = "1fr";
  }

  grid.innerHTML = prods.map(p => {
    const inCart = _pos.lines.find(l => l.productId === p.id);
    const oos    = REP.assignedWarehouseId && p.stockQty <= 0;
    const price  = p.salePrice || p.priceRetail || p.sellingPrice || p.price || 0;
    const cost   = p.avgCostPrice || p.averageCost || p.costPrice || p.purchasePrice || p.buyPrice || 0;
    const stockQ = p.stockQty || 0;
    const pName  = p.name || p.nameAr || p.productName || p.title || (p.sku ? `صنف ${p.sku}` : "صنف");
    const pUnit  = p.unit || p.unitName || "حبة";
    return isGrid ? `
    <div class="prod-card ${inCart?'in-cart':''} ${oos?'out-of-stock':''}"
      data-pid="${p.id}"
      onclick="posTap('${p.id}','${esc(pName)}',${price},${stockQ},${cost},'${esc(pUnit)}')">
      ${inCart ? `<div class="prod-qty-badge">${inCart.qty}</div>` : ""}
      <div class="prod-img">${prodIcon(p)}</div>
      <div class="prod-name">${pName}</div>
      <div class="prod-price">${fmtC(price)}</div>
      <div class="prod-stock-lbl ${stockQ<=3?'low':''}">${REP.assignedWarehouseId?`${stockQ}`:''}</div>
    </div>` : `
    <div class="prod-card list-card ${inCart?'in-cart':''} ${oos?'out-of-stock':''}"
      data-pid="${p.id}"
      onclick="posTap('${p.id}','${esc(pName)}',${price},${stockQ},${cost},'${esc(pUnit)}')">
      <div class="prod-img">${prodIcon(p)}</div>
      <div class="prod-name">${pName}</div>
      <div class="prod-price">${fmtC(price)}</div>
      ${inCart ? `<div class="prod-qty-badge" style="position:static;margin-right:auto;">${inCart.qty}</div>` : ''}
    </div>`;
  }).join("");
}

/* ─── فتح مودال طلب الشحن لمنتج محدد ─── */
window.posRequestShipmentFor = (productId, productName) => {
  openRestockRequestModal(productId, productName);
};

/* ─── Tap product (optimized: only updates the tapped card) ─── */
window.posTap = (id, name, price, stock, cost = 0, unit = "حبة") => {
  const safeStock = (typeof stock === "number" && !isNaN(stock)) ? Math.max(0, stock) : 0;
  if (safeStock <= 0) {
    toast("⚠️ هذا الصنف غير متوفر في سيارتك حالياً", "warn");
    posRequestShipmentFor(id, name);
    return;
  }
  const ex = _pos.lines.find(l => l.productId === id);
  if (ex) {
    if (ex.qty < safeStock) {
      ex.qty++;
    } else {
      toast(`⚠️ وصلت لأقصى كمية متاحة في سيارتك (${safeStock})`, "warn");
      return;
    }
  } else {
    _pos.lines.push({ productId: id, name, price, qty: 1, stock: safeStock, cost, unit: unit || "حبة" });
  }

  const line = _pos.lines.find(l => l.productId === id);
  requestAnimationFrame(() => {
    updateCardBadge(id);
    renderCart(); // Automatically updates split screen cart and calls updateCartFab
    updateTicker({ name, price, qty: line?.qty || 1 });
  });
  if (navigator.vibrate) navigator.vibrate(20);
};

// Show last-added item in the cashier ticker strip
let _tickerTimer = null;
function updateTicker({ name, price, qty }) {
  const ticker = document.getElementById("pos-ticker");
  const tName  = document.getElementById("ticker-name");
  const tQty   = document.getElementById("ticker-qty");
  const tPrice = document.getElementById("ticker-price");
  if (!ticker) return;
  if (tName)  tName.textContent  = name;
  if (tQty)   tQty.textContent   = `×${qty}`;
  if (tPrice) tPrice.textContent = `${fmtC(price * qty)} ر.س`;
  ticker.classList.add("visible");
  // Auto-hide after 2.5s
  clearTimeout(_tickerTimer);
  _tickerTimer = setTimeout(() => ticker.classList.remove("visible"), 2500);
}

// Update only this card's badge (10x faster than re-rendering all)
function updateCardBadge(productId) {
  const line = _pos.lines.find(l => l.productId === productId);
  const card = document.querySelector(`.prod-card[data-pid="${productId}"]`);
  if (!card) return;
  let badge = card.querySelector(".prod-qty-badge");
  if (line && line.qty > 0) {
    card.classList.add("in-cart");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "prod-qty-badge";
      card.appendChild(badge);
    }
    badge.textContent = line.qty;
  } else {
    card.classList.remove("in-cart");
    if (badge) badge.remove();
  }
}

/* ─── Cart ─── */
function renderCart() {
  const body = document.getElementById("cart-body");
  if (!body) return;
  updateCartFab();

  if (!_pos.lines.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <span style="font-size:32px;">🛒</span>
        <span style="font-size:13px;color:var(--t2);">السلة فارغة</span>
      </div>`;
    return;
  }

  body.innerHTML = _pos.lines.map((ln, i) => {
    const maxStock = (typeof ln.stock === "number" && !isNaN(ln.stock)) ? Math.max(1, ln.stock) : 1;
    return `
    <div class="cart-row" id="cart-row-${i}">
      <div class="cart-row-top">
        <span class="cart-row-icon">${prodIconByName(ln.name)}</span>
        <div class="cart-row-info">
          <div class="cart-row-name">${ln.name}</div>
          <div class="cart-row-unit-price">${fmtC(ln.price)} ر.س / وحدة</div>
        </div>
        <button class="cart-row-del" onclick="posRemove(${i})" aria-label="حذف">🗑</button>
      </div>
      <div class="cart-row-bottom">
        <button class="cart-qty-btn minus" onclick="posQty(${i},-1)">−</button>
        <input class="cart-qty-val" type="number" inputmode="numeric"
          value="${ln.qty}" min="1" max="${maxStock}"
          onchange="posSetQty(${i},this.value)"
          onfocus="this.select()" />
        <button class="cart-qty-btn plus" onclick="posQty(${i},1)">+</button>
        <div class="cart-row-price">${fmtC(ln.price * ln.qty)} ر.س</div>
      </div>
    </div>`;
  }).join("");
}

// Get icon by product name (for cart)
function prodIconByName(name) {
  const p = { name, categoryName: "" };
  return prodIcon(p);
}

function setupSwipe() {
  document.querySelectorAll(".cart-item").forEach((el, i) => {
    let startX = 0, dx = 0;
    el.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchmove", e => {
      dx = e.touches[0].clientX - startX;
      if (dx < -10) el.querySelector(".cart-item-inner").style.transform = `translateX(${Math.max(dx, -80)}px)`;
    }, { passive: true });
    el.addEventListener("touchend", () => {
      if (dx < -60) posRemove(i);
      else el.querySelector(".cart-item-inner").style.transform = "";
      dx = 0;
    });
  });
}

window.posQty = (i, d) => {
  if (!_pos.lines[i]) return;
  const ln = _pos.lines[i];
  const maxStock = (typeof ln.stock === "number" && !isNaN(ln.stock)) ? Math.max(0, ln.stock) : 0;
  if (d > 0 && ln.qty >= maxStock) {
    toast(`⚠️ وصلت لأقصى كمية متاحة في سيارتك (${maxStock})`, "warn");
    return;
  }
  ln.qty = Math.max(1, Math.min(ln.qty + d, maxStock > 0 ? maxStock : 1));
  updateCartFab();
  updateCardBadge(ln.productId);
  refreshCartRow(i); // Update only this row, not the whole cart
};

window.posRemove = (i) => {
  const pid = _pos.lines[i]?.productId;
  _pos.lines.splice(i, 1);
  updateCartFab();
  if (pid) updateCardBadge(pid);
  renderCart(); // Re-render after removal (item count changes)
};

// Manual quantity input from cart
window.posSetQty = (i, val) => {
  if (!_pos.lines[i]) return;
  const ln = _pos.lines[i];
  const maxStock = (typeof ln.stock === "number" && !isNaN(ln.stock)) ? Math.max(0, ln.stock) : 0;
  let n = parseInt(val) || 1;
  if (maxStock > 0 && n > maxStock) {
    toast(`⚠️ الكمية المطلوبة تتجاوز المتاح في سيارتك (${maxStock})`, "warn");
    n = maxStock;
  }
  ln.qty = Math.max(1, maxStock > 0 ? Math.min(n, maxStock) : 1);
  updateCartFab();
  updateCardBadge(ln.productId);
  refreshCartRow(i);
};

// Refresh a single cart row in-place without full re-render
function refreshCartRow(i) {
  const ln = _pos.lines[i];
  if (!ln) return;
  const row = document.getElementById(`cart-row-${i}`);
  if (!row) { renderCart(); return; }
  const qtyEl    = row.querySelector('.cart-qty-val');
  const priceEl  = row.querySelector('.cart-row-price');
  if (qtyEl)   qtyEl.value   = ln.qty;
  if (priceEl) priceEl.textContent = fmtC(ln.price * ln.qty) + ' ر.س';

  // Update bottom sheet if open
  const csRow = document.getElementById(`cs-row-${i}`);
  if (csRow) {
    const csQtyEl = csRow.querySelector('.cart-qty-val');
    const csPriceEl = document.getElementById(`cs-price-${i}`);
    if (csQtyEl) csQtyEl.value = ln.qty;
    if (csPriceEl) csPriceEl.textContent = fmtC(ln.price * ln.qty) + ' ر.س';
  }

  updateCartFab();

  // Refresh bottom sheet totals
  const sheetSub = document.getElementById("sheet-sub-val");
  const sheetVat = document.getElementById("sheet-vat-val");
  const sheetTotal = document.getElementById("sheet-total-val");
  const sheetCount = document.getElementById("sheet-item-count");
  const { sub, vat, total } = posUpdateTotals();
  if (sheetSub)   sheetSub.textContent = fmtC(sub);
  if (sheetVat)   sheetVat.textContent = fmtC(vat);
  if (sheetTotal) sheetTotal.textContent = fmtC(total) + " ر.س";
  if (sheetCount) sheetCount.textContent = `(${_pos.lines.reduce((s,l)=>s+l.qty,0)} وحدة)`;
}

function posUpdateTotals() {
  const sub    = _pos.lines.reduce((s,l) => s + l.price * l.qty, 0);
  const discAmt = Math.min(_pos.discount || 0, sub); // خصم مبلغ ثابت (ليس نسبة)
  const net    = sub - discAmt;
  const vat    = net * VAT;
  const total  = net + vat;

  // Sync mobile and side discount inputs
  const discMob = document.getElementById("pos-disc");
  const discSide = document.getElementById("pos-side-disc");
  if (discMob && document.activeElement !== discMob) discMob.value = _pos.discount || "";
  if (discSide && document.activeElement !== discSide) discSide.value = _pos.discount || "";

  return { sub, discAmt, net, vat, total };
}

window.syncPaidInputs = (val) => {
  const pMob = document.getElementById("pos-paid");
  const pSide = document.getElementById("pos-side-paid");
  if (pMob && document.activeElement !== pMob) pMob.value = val;
  if (pSide && document.activeElement !== pSide) pSide.value = val;
};

window.posSetPay = (m) => {
  _pos.pay = m;
  ["cash","credit","transfer","cheque"].forEach(k => {
    const el = document.getElementById(`pm-${k}`);
    if (el) el.classList.toggle("active", k === m);
    const sideEl = document.getElementById(`side-pm-${k}`);
    if (sideEl) sideEl.classList.toggle("active", k === m);
  });
  
  if (m === "credit") {
    _pos.paidAmount = 0;
    if (typeof syncPaidInputs === "function") syncPaidInputs(0);
  } else if (m === "cash") {
    _pos.paidAmount = undefined;
    if (typeof syncPaidInputs === "function") syncPaidInputs("");
  }
};

/* ─── Customer Picker ─── */
let _custCache = [];

window.openCustPicker = async () => {
  if (!_custCache.length) {
    const snap = await getDocs(query(COL("customers"), where("repId", "==", REP.id)));
    _custCache = snap.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b)=>(a.name||"").localeCompare(b.name||"","ar"));
  }
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML = `
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">اختر العميل</div>
    <div class="sheet-search">
      <input class="page-search" placeholder="🔍 بحث…" oninput="filterCustSheet(this.value)" style="margin:0;" />
    </div>
    <div class="sheet-body" id="cust-sheet-body">
      ${renderCustList(_custCache)}
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window._custOverlay = overlay;
};

window.filterCustSheet = (q) => {
  const body = document.getElementById("cust-sheet-body");
  if (body) body.innerHTML = renderCustList(_custCache.filter(c => c.name?.includes(q)||c.phone?.includes(q)));
};

function renderCustList(list) {
  return list.map(c => {
    const name = c.name || c.nameAr || c.customerName || (c.code ? `عميل ${c.code}` : "عميل");
    const bal = c.balance || 0;
    return `
    <div class="cust-pick-card" onclick="selectCust('${c.id}')">
      <div class="cust-ava">${name?.[0]||"ع"}</div>
      <div>
        <div class="cust-name">${name}</div>
        <div class="cust-phone">${c.phone||"—"}</div>
      </div>
      <span class="cust-bal ${bal<=0?'ok':''}">${fmtC(Math.abs(bal))}</span>
    </div>`;
  }).join("") || `<div class="empty-wrap"><div class="empty-text">لا نتائج</div></div>`;
}

window.selectCust = (id) => {
  _pos.cust = _custCache.find(c => c.id === id) || null;
  const pill = document.getElementById("pos-cust-pill");
  const name = document.getElementById("pos-cust-name");
  if (pill) pill.classList.toggle("selected", !!_pos.cust);
  if (name) name.textContent = _pos.cust?.name || "اختر عميل…";
  window._custOverlay?.remove();
};

/* ─── Save & Process Invoice (Strict Atomic Stock Deduction) ─── */
async function saveAndProcessInvoice(inv) {
  if (!inv.warehouseId) {
    throw new Error("لا يوجد مستودع/سيارة مرتبطة بحساب هذا المندوب. يرجى مراجعة الإدارة لتعيين سيارة للمندوب.");
  }

  // 1. إعداد مصفوفة خصم المخزون
  const adjustments = (inv.lines || [])
    .filter(line => line.productId && line.qty)
    .map(line => ({
      warehouseId: inv.warehouseId,
      productId: line.productId,
      qtyDelta: -line.qty,
      metadata: {
        type: "sale_out",
        sourceType: "salesInvoice",
        sourceId: inv.invoiceNumber,
        documentNumber: inv.invoiceNumber,
        invoiceNumber: inv.invoiceNumber,
        allowNegative: false, // ⚠️ منع البيع بالسالب قطعياً
        productName: line.name || line.productName || "",
        notes: `مبيعات المندوب — فاتورة ${inv.invoiceNumber}`
      }
    }));

  // 2. التنفيذ الذري لخصم المخزون أولاً وقبل أي كتابة في قاعدة البيانات
  // إذا كان رصيد الصنف غير كافٍ أو حدث انقطاع في الشبكة، سترمي adjustStockBulk خطأً فورياً يوقف كل شيء
  // ولن تُسجل الفاتورة ولن يتأثر رصيد العميل نهائياً.
  let stockDeducted = false;
  if (adjustments.length > 0) {
    const { adjustStockBulk } = await import("../utils/db.js");
    await adjustStockBulk(adjustments);
    stockDeducted = true;
    inv.stockStatus = "completed";
    inv.stockUpdatedAt = serverTimestamp ? serverTimestamp() : new Date().toISOString();
  }

  // 3. حفظ الفاتورة وتحديث رصيد العميل فقط بعد نجاح خصم المخزون
  try {
    await runTransaction(db, async (tx) => {
      const invRef = doc(db, `companies/${COID}/salesInvoices`, inv.invoiceNumber);
      const invSnap = await tx.get(invRef);
      const alreadySaved = invSnap.exists();

      tx.set(invRef, inv, { merge: true });

      if (!alreadySaved && inv.remainingAmount > 0 && inv.customerId) {
        tx.set(doc(COL("customers"), inv.customerId),
          { balance: increment(inv.remainingAmount) },
          { merge: true });
      }
    });
  } catch (invSaveErr) {
    // تراجع تلقائي (Rollback) فوري للكميات المخصومة إذا تعذر كتابة الفاتورة لضمان التماثل
    if (stockDeducted && adjustments.length > 0) {
      try {
        const { adjustStockBulk } = await import("../utils/db.js");
        const rollbackAdjustments = adjustments.map(a => ({
          ...a,
          qtyDelta: -a.qtyDelta, // عكس الكمية لإعادتها للمخزن
          metadata: {
            ...a.metadata,
            type: "sale_rollback",
            notes: `تراجع تلقائي عن خصم المخزون لتعذر حفظ الفاتورة ${inv.invoiceNumber}`
          }
        }));
        await adjustStockBulk(rollbackAdjustments);
        console.warn("[Rollback] Stock deduction successfully reversed for:", inv.invoiceNumber);
      } catch (rbErr) {
        console.error("[Rollback] Stock rollback failed:", rbErr.message);
      }
    }
    throw new Error(`تعذر حفظ الفاتورة في النظام: ${invSaveErr.message}`);
  }

  // 2. Deposit Cash into Rep's Specific Cash Box & Create Receipt
  let rcptRef = null;
  if (inv.paidAmount > 0 && inv.repId) {
    try {
      const { autoCashTransaction } = await import("../utils/db.js");
      await autoCashTransaction({
        type: "in",
        amount: inv.paidAmount,
        notes: `مبيعات نقدية — فاتورة ${inv.invoiceNumber}`,
        sourceType: "salesInvoice",
        sourceId: inv.invoiceNumber,
        date: inv.date,
        cashBoxId: `cashBox_${inv.repId}`
      });
      console.log(`[CashBox] Deposited ${inv.total} into cashBox_${inv.repId}`);
      
      // CREATE REAL RECEIPT FOR SINGLE SOURCE OF TRUTH
      rcptRef = doc(COL("receipts"));
      await setDoc(rcptRef, {
         date: inv.date,
         amount: inv.paidAmount,
         entityType: "customer",
         targetId: inv.customerId || null,
         accountName: inv.customerName || "عميل نقدي",
         method: inv.paymentMethod || "cash",
         sourceId: `cashBox_${inv.repId}`,
         sourceName: "صندوق المندوب",
         notes: `دفعة محصلة للفاتورة ${inv.invoiceNumber}`,
         costCenterId: inv.costCenterId || null,
         costCenterName: inv.costCenterName || null,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp(),
         isAutoGenerated: true,
         sourceInvoiceId: inv.id || inv.invoiceNumber
      });
      console.log(`[Receipt] Auto-generated receipt for invoice ${inv.invoiceNumber}`);
    } catch (cashBoxErr) {
      console.warn("Failed to log cash transaction for rep invoice:", cashBoxErr.message);
    }
  }

  // 3. Run Automated Accounting Engine (JEs)
  try {
    const { autoSalesJE } = await import("../utils/accounting-engine.js");
    
    // Fetch all warehouses for the accounting engine
    const whSnap = await getDocs(COL("warehouses"));
    const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Calculate average costs (for COGS)
    let totalCost = 0;
    try {
      const costPromises = inv.lines.map(async (l) => {
        const prodSnap = await getDoc(doc(db, `companies/${COID}/products`, l.productId));
        if (prodSnap.exists()) {
          const pd = prodSnap.data();
          const cost = parseFloat(pd.buyPrice || pd.cost || pd.averageCost || pd.costPrice || pd.purchasePrice || 0);
          return cost * l.qty;
        }
        return 0;
      });
      const costs = await Promise.all(costPromises);
      totalCost = costs.reduce((s, c) => s + c, 0);
    } catch (cogsErr) {
      console.warn("Failed to calculate COGS for rep invoice:", cogsErr.message);
    }

    const jeId = await autoSalesJE({
      id:            inv.invoiceNumber,
      invoiceNumber: inv.invoiceNumber,
      date:          inv.date,
      customerName:  inv.customerName,
      customerId:    inv.customerId    || null,
      customerType:  inv.customerType || "retail",
      repId:         inv.repId        || null,   // ← حساب المندوب التحليلي
      salesRepId:    inv.repId        || null,   // ← نسخة احتياطية
      paymentMethod: inv.paymentMethod,
      subtotal:      inv.subtotal,
      taxAmount:     inv.vatAmount,
      total:         inv.total,
      paidAmount:    inv.paidAmount !== undefined ? inv.paidAmount : inv.total,
      remainingAmount: inv.remainingAmount !== undefined ? inv.remainingAmount : 0,
      totalCost:     totalCost,
      warehouseId:   inv.warehouseId,
      costCenterId:   inv.costCenterId || null,
      costCenterName: inv.costCenterName || null,
      sourceType:    "salesInvoice",
    }, { displayName: inv.repName, uid: inv.repId }, warehouses);

    await updateDoc(doc(db, `companies/${COID}/salesInvoices`, inv.invoiceNumber), {
      journalEntryId: jeId,
      totalCost: Math.round(totalCost * 100) / 100
    });
    console.log(`[Accounting] Auto-created JE for rep invoice ${inv.invoiceNumber}: ${jeId}`);

    // إنشاء قيد سند القبض التلقائي لتسوية ذمة العميل وتحصيل المبلغ في صندوق المندوب
    if (rcptRef && inv.customerId && inv.paidAmount > 0) {
      try {
        const { autoCustomerPaymentJE } = await import("../utils/accounting-engine.js");
        const rcptJeId = await autoCustomerPaymentJE({
          id: rcptRef.id,
          date: inv.date,
          amount: inv.paidAmount,
          customerId: inv.customerId,
          customerName: inv.customerName,
          repId: inv.repId,
          sourceId: `cashBox_${inv.repId}`,
          paymentMethod: inv.paymentMethod || "cash",
          invoiceNumber: inv.invoiceNumber,
          costCenterId: inv.costCenterId || null,
          costCenterName: inv.costCenterName || null,
        }, { displayName: inv.repName, uid: inv.repId });

        await updateDoc(rcptRef, {
          journalEntryId: rcptJeId,
          updatedAt: serverTimestamp()
        });
        console.log(`[Receipt JE] Auto-created JE for receipt ${rcptRef.id}: ${rcptJeId}`);
      } catch (rcptJeErr) {
        console.warn("Failed to create JE for auto-receipt:", rcptJeErr.message);
      }
    }
  } catch (aeErr) {
    console.warn("Accounting automation failed for rep invoice:", aeErr.message);
  }
}

/* ─── Failure Alert Modal (تنبيه بفشل العملية وسبب الفشل دون المساس بالأرصدة) ─── */
function showInvoiceFailureModal(title, message, details = "") {
  document.getElementById("inv-failure-modal")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "inv-failure-modal";
  overlay.style.zIndex = "99999";

  overlay.innerHTML = `
  <div class="modal-sheet" style="max-width:440px; margin:auto; border-radius:20px; overflow:hidden; border:1px solid rgba(239,68,68,0.3); box-shadow:0 20px 45px rgba(0,0,0,0.4);">
    <div style="background:linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding:20px 16px; text-align:center; color:#fff;">
      <div style="font-size:46px; margin-bottom:6px; line-height:1;">⚠️</div>
      <h3 style="margin:0; font-size:18px; font-weight:800; letter-spacing:-0.2px;">${title}</h3>
      <div style="font-size:12px; opacity:0.95; margin-top:4px;">لم يتم اعتماد أو حفظ الفاتورة في النظام</div>
    </div>
    
    <div style="padding:18px 16px;">
      <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.22); border-radius:12px; padding:12px 14px; margin-bottom:14px; text-align:right;">
        <div style="font-size:12px; color:#b91c1c; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
          <span>🔍</span> <span>سبب الفشل:</span>
        </div>
        <div style="font-size:13.5px; color:var(--text, #1f2937); line-height:1.6; font-weight:600;">${message}</div>
        ${details ? `<div style="font-size:11.5px; color:var(--t2, #6b7280); margin-top:6px; line-height:1.5;">${details}</div>` : ""}
      </div>

      <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 12px; margin-bottom:16px; font-size:12px; color:#065f46; display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">🛡️</span>
        <span style="line-height:1.4;"><strong>أمان الحسابات:</strong> لم يتم تعديل رصيد العميل نهائياً، وظلت أصناف السلة محفوظة لتعديلها ومتابعة العمل.</span>
      </div>

      <button class="confirm-btn" style="width:100%; padding:14px; font-size:15px; font-weight:800; border-radius:12px; background:#1e293b; color:#fff; border:none; cursor:pointer;" onclick="document.getElementById('inv-failure-modal')?.remove();">
        ✏️ مراجعة وتعديل أصناف الفاتورة
      </button>
    </div>
  </div>`;

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

/* ─── Submit Invoice (الربط الذري الإلزامي ومنع التكرار) ─── */
let _posSubmitting = false;  // منع الضغط المزدوج على زر الحفظ

window.posSubmit = async () => {
  // الحماية من الحفظ المزدوج
  if (_posSubmitting) {
    toast("⏳ جاري معالجة الفاتورة...", "warn"); return;
  }
  if (!_pos.cust)         { toast("❌ اختر عميلاً أولاً", "err"); return; }
  if (!_pos.lines.length) { toast("❌ أضف صنفاً واحداً على الأقل", "err"); return; }

  // 1. فحص الفواتير المعلقة في طابور المزامنة لمنع تداخل الأرصدة
  const pendingQueue = JSON.parse(localStorage.getItem("rep_pending_stock_deductions") || "[]");
  const offlineQueue = queueGet();
  if (offlineQueue.length > 0 || pendingQueue.length > 0) {
    if (navigator.onLine) {
      toast("⏳ جاري مزامنة العمليات السابقة المعلقة أولاً...", "warn");
      try {
        await syncQueue();
        await syncPendingStockDeductions();
      } catch (_) {}
    }
    const remainingPending = JSON.parse(localStorage.getItem("rep_pending_stock_deductions") || "[]");
    const remainingOffline = queueGet();
    if (remainingOffline.length > 0 || remainingPending.length > 0) {
      showInvoiceFailureModal(
        "توجد فواتير سابقة معلقة لم تكتمل مزامنتها",
        `توجد عمليات سابقة معلقة (${remainingOffline.length + remainingPending.length}) لم يكتمل خصم مخزونها بعد مع الخادم. يرجى التأكد من اتصال الإنترنت والمزامنة أولاً قبل إصدار فواتير جديدة لحماية دقة المخزون ومنع تعارض الأرصدة.`
      );
      return;
    }
  }

  // 2. التحقق من توفر الإنترنت لضمان الخصم اللحظي الموثوق
  if (!navigator.onLine) {
    showInvoiceFailureModal(
      "لا يوجد اتصال بالإنترنت",
      "يلزم توفر اتصال نشط بالإنترنت للتحقق لحظياً من رصيد سيارتك وخصم المخزون سحابياً. تم إيقاف الفاتورة لحماية المخزون، ولم يتم التأثير على رصيد العميل."
    );
    return;
  }

// ── دالة توليد رقم فاتورة تسلسلي ذري لكل سيارة/مندوب بدون تكرار ──
async function generateRepInvoiceNumber(rep) {
  let p = "VAN1";
  const name = (rep?.name || "").trim();
  const code = (rep?.code || "").trim().toUpperCase();
  if (code.startsWith("VAN") || code.startsWith("REP")) {
    p = code.replace(/[^A-Z0-9]/g, "");
  } else if (name.includes("مصطفى")) {
    p = "VAN1";
  } else if (name.includes("محمد")) {
    p = "VAN2";
  } else if (name.includes("عمرو")) {
    p = "VAN3";
  } else if (name.includes("احمد") || name.includes("أحمد")) {
    p = "VAN4";
  } else {
    p = "VAN1";
  }

  const docKey = p.toLowerCase();
  const counterRef = doc(db, `companies/${COID}/counters`, docKey);
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let num;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const storedSeq = snap.exists() ? (snap.data().seq || 0) : 0;
        const nextSeq = storedSeq + 1;
        tx.set(counterRef, { seq: nextSeq, prefix: p, updatedAt: serverTimestamp() }, { merge: true });
        num = `${p}-${String(nextSeq).padStart(6, "0")}`;
      });
      return num;
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, attempt * 300));
        continue;
      }
      return `${p}-${Date.now().toString().slice(-6)}`;
    }
  }
}

// ── دالة توليد رقم سند قبض تسلسلي ذري لكل سيارة/مندوب بدون تكرار ──
async function generateRepReceiptNumber(rep) {
  let p = "VAN1";
  const name = (rep?.name || "").trim();
  const code = (rep?.code || "").trim().toUpperCase();
  if (code.startsWith("VAN") || code.startsWith("REP")) {
    p = code.replace(/[^A-Z0-9]/g, "");
  } else if (name.includes("مصطفى")) {
    p = "VAN1";
  } else if (name.includes("محمد")) {
    p = "VAN2";
  } else if (name.includes("عمرو")) {
    p = "VAN3";
  } else if (name.includes("احمد") || name.includes("أحمد")) {
    p = "VAN4";
  } else {
    p = "VAN1";
  }

  const docKey = `rv_${p.toLowerCase()}`;
  const counterRef = doc(db, `companies/${COID}/counters`, docKey);
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let num;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const storedSeq = snap.exists() ? (snap.data().seq || 0) : 0;
        const nextSeq = storedSeq + 1;
        tx.set(counterRef, { seq: nextSeq, prefix: `RV-${p}`, updatedAt: serverTimestamp() }, { merge: true });
        num = `RV-${p}-${String(nextSeq).padStart(6, "0")}`;
      });
      return num;
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, attempt * 300));
        continue;
      }
      return `RV-${p}-${Date.now().toString().slice(-6)}`;
    }
  }
}

  const btn = document.getElementById("confirm-btn");
  if (btn) { btn.disabled = true; btn.textContent = "جاري التحقق والخصم…"; }
  _posSubmitting = true;

  try {
    const { sub, discAmt, net, vat, total } = posUpdateTotals();
    const today = getTodayLocalDate();
    const invNo = await generateRepInvoiceNumber(REP);

    let paidAmount = _pos.paidAmount !== undefined ? parseFloat(_pos.paidAmount) : total;
    if (isNaN(paidAmount) || paidAmount < 0) paidAmount = 0;
    if (paidAmount > total) paidAmount = total;

    // If payment method is explicit credit but user didn't enter a paid amount, assume 0 paid.
    if (_pos.pay === "credit" && _pos.paidAmount === undefined) {
      paidAmount = 0;
    }

    // Ensure proper rounding
    paidAmount = Math.round(paidAmount * 100) / 100;
    let remainingAmount = Math.round((total - paidAmount) * 100) / 100;

    let finalPaymentMethod = _pos.pay;
    if (remainingAmount > 0 && paidAmount > 0) finalPaymentMethod = "partial";
    if (remainingAmount > 0 && paidAmount === 0) finalPaymentMethod = "credit";
    if (remainingAmount === 0) finalPaymentMethod = "cash";

    const invData = {
      _queueId:       invNo,
      invoiceNumber:  invNo,
      number:         invNo,  // ✅ For Admin ERP compatibility
      customerId:     _pos.cust.id,
      customerName:   _pos.cust.name,
      customerType:   _pos.cust.type || "retail",
      repId:          REP.id,
      repName:        REP.name,
      warehouseId:    REP.assignedWarehouseId || null,
      costCenterId:   REP.costCenterId || null,
      costCenterName: REP.costCenterName || null,
      date:           today,
      lines:          _pos.lines.map(l => {
        const prod = (_pos.products || []).find(p => p.id === l.productId);
        const unit = l.unit || prod?.unit || "حبة";
        return {
          productId: l.productId, 
          name: l.name, 
          productName: l.name, // ✅ For Admin ERP compatibility
          qty: l.qty, 
          price: l.price, 
          unitPrice: l.price,  // ✅ For Admin ERP compatibility
          unit: unit,          // ✅ Unit of measure
          discount: 0,         // ✅ For Admin ERP compatibility
          costPrice: l.cost || 0, // ✅ Store historical cost price
          purchasePrice: l.cost || 0, // ✅ Backup purchasePrice
          total: l.price * l.qty 
        };
      }),
      subtotal:       sub,
      discountAmount: discAmt,
      discountPct:    0,
      vatAmount:      vat,
      totalVat:       vat,    // ✅ For Admin ERP compatibility
      total,
      totalWithVat:   total,  // ✅ For Admin ERP compatibility
      paidAmount:     paidAmount,
      remainingAmount: remainingAmount,
      paymentMethod:  finalPaymentMethod,
      status:         remainingAmount > 0 ? "posted" : "paid",
      stockStatus:    "completed", // ✅ يُسجل معتمداً فور نجاح الخصم الذري
      source:         "rep_app_v2",
      companyId:      COID,
      createdAt:      serverTimestamp ? serverTimestamp() : new Date().toISOString(),
    };

    // التنفيذ الذري: خصم المخزون أولاً ثم حفظ الفاتورة وتحديث رصيد العميل
    await saveAndProcessInvoice(invData);
    toast(`✅ تم حفظ الفاتورة ${invNo} وخصم المخزون بنجاح`, "ok");

    // Show share options
    setTimeout(() => showShareSheet(invData), 600);

    // تصفير السلة فقط بعد النجاح التام والمؤكد
    _pos.lines = []; _pos.cust = null; _pos.pay = "cash"; _pos.discount = 0;
    _currentPage = null;  // ← Force re-render of dashboard
    navigate("dashboard");

  } catch(e) {
    console.error("posSubmit error:", e);
    let errorMsg = e.message || "حدث خطأ غير متوقع أثناء معالجة الفاتورة";
    let title = "تعذر إتمام الفاتورة";

    if (errorMsg.includes("رصيد المخزون غير كافٍ")) {
      title = "عجز في مخزون سيارة المندوب";
    } else if (errorMsg.includes("network") || errorMsg.includes("Failed to fetch") || errorMsg.includes("offline")) {
      title = "انقطاع أو ضعف في الاتصال بالإنترنت";
      errorMsg = "تعذر الاتصال بالخادم للتحقق من المخزون وخصمه. تم إيقاف الفاتورة لحماية دقة الحسابات، ولم يتأثر رصيد العميل.";
    }

    // إظهار التنبيه البارز مع سبب الفشل وتأكيد أمان رصيد العميل
    showInvoiceFailureModal(title, errorMsg);
    if (btn) { btn.disabled = false; btn.textContent = "✅ تأكيد الفاتورة"; }
  } finally {
    _posSubmitting = false;  // أعد تفعيل الزر دائماً
    if (btn) { btn.disabled = false; }
  }
};


/* ─── Share Sheet ─── */
function showShareSheet(inv) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML = `
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">✅ تم حفظ الفاتورة</div>
    <div style="padding:16px;">
      <div style="text-align:center;font-size:36px;margin-bottom:8px;">🧾</div>
      <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:4px;">${inv.invoiceNumber}</div>
      <div style="text-align:center;font-size:13px;color:var(--t2);margin-bottom:16px;">${inv.customerName} — ${fmtC(inv.total)} ر.س</div>
      <div class="share-row">
        <button class="share-btn whatsapp" onclick="shareWhatsApp('${inv.invoiceNumber}','${inv.customerName}',${inv.total})">
          💬 واتساب
        </button>
        <button class="share-btn" onclick="printInvoiceData(${JSON.stringify(inv).replace(/"/g,'&quot;')})">
          🖨️ طباعة
        </button>
      </div>
      <button class="btn-primary full mt8" onclick="this.closest('.modal-overlay').remove()">
        إغلاق
      </button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

window.shareWhatsApp = (invNo, custName, total) => {
  const msg = encodeURIComponent(`🧾 فاتورة رقم: ${invNo}\n👤 العميل: ${custName}\n💰 الإجمالي: ${fmtC(total)} ر.س\n🏢 ${COMPANY.name}`);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
};

let _cr = { lines: [], cust: null, refInvoice: null };

async function renderCredit(mc) {
  if (!REP.assignedWarehouseId) {
    mc.style.cssText = "";
    mc.innerHTML = `
      <div class="page" style="display:flex; align-items:center; justify-content:center; height:100%; min-height:350px;">
        <div class="empty-wrap" style="text-align:center; padding:32px; background:var(--bg-1); border-radius:24px; border:1px solid var(--border); box-shadow:var(--shadow); max-width:90%; margin:auto;">
          <div class="empty-icon" style="font-size:64px; margin-bottom:16px;">🚗</div>
          <div class="empty-text" style="font-weight:800; font-size:17px; color:var(--t1); margin-bottom:8px;">لم يتم ربط مخزن السيارة بعد</div>
          <div style="font-size:12px; color:var(--t2); line-height:1.6;">تواصل مع إدارة النظام لتعيين مستودع السيارة المخصص لك لتتمكن من إرجاع البضائع للسيارة.</div>
          <button class="btn-primary" onclick="navigate('dashboard')" style="margin-top:20px; min-height:42px; font-size:13px; padding:8px 16px; margin: 0 auto;">🔄 العودة للرئيسية</button>
        </div>
      </div>`;
    return;
  }

  mc.style.cssText = "padding:0;height:100%;display:flex;flex-direction:column;overflow:hidden;";
  // Preload customers
  if (!_custCache.length) {
    const snap = await getDocs(query(COL("customers"), where("repId", "==", REP.id)));
    _custCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.name||"").localeCompare(b.name||"","ar"));
  }
  _cr = { lines: [], cust: null, refInvoice: null, originalInvoiceNumber: null, originalInvoiceId: null, customerInvoices: [] };

  mc.innerHTML = `
  <div class="pos-shell" id="cr-shell">
    <!-- Top Bar -->
    <div class="pos-topbar">
      <button class="btn-ghost btn-primary pos-back" onclick="navigate('dashboard')">← رجوع</button>
      <div class="pos-cust-pill" id="cr-cust-pill" onclick="openCrCustPicker()">
        <span>👤</span><span id="cr-cust-name" class="pos-cust-pill-name">اختر عميل…</span>
      </div>
    </div>

    <!-- Ref Invoice Selection -->
    <div id="cr-ref-inv-wrap" style="padding:6px 12px;background:var(--bg-1);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:12px;color:var(--t2);white-space:nowrap;font-weight:700;">🧾 الفاتورة الأصلية:</span>
        <select id="cr-ref-inv-select" class="pos-search" style="flex:1;font-size:12px;padding:6px 10px;border-radius:8px;background:var(--bg-2);color:var(--t1);" onchange="crSelectInvoice(this.value)">
          <option value="">اختر العميل أولاً لعرض فواتيره...</option>
        </select>
      </div>
      <div id="cr-ref-manual-row" style="display:none;align-items:center;gap:8px;">
        <span style="font-size:11px;color:var(--t3);white-space:nowrap;">أو إدخال يدوي:</span>
        <input id="cr-ref-inv" class="pos-search" style="flex:1;font-size:11px;padding:4px 8px;"
          placeholder="رقم الفاتورة الأصلية (يدوي)"
          oninput="crSetRef(this.value)" />
      </div>
    </div>

    <!-- Responsive Split Layout Main Body -->
    <div class="pos-body" style="display:flex; flex:1; overflow:hidden;">
      <!-- Right Side: Products list -->
      <div class="pos-products" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <!-- Search -->
        <div class="pos-toolbar" style="flex-shrink:0;">
          <input class="pos-search" id="cr-search-inp" placeholder="🔍 بحث في الأصناف المرتجعة…" oninput="crSearch(this.value)" />
        </div>

        <!-- Cashier Ticker -->
        <div class="pos-ticker" id="cr-ticker" style="flex-shrink:0;">
          <span class="pos-ticker-icon">↩️</span>
          <span class="pos-ticker-name" id="cr-ticker-name">—</span>
          <span class="pos-ticker-qty"  id="cr-ticker-qty">×1</span>
          <span class="pos-ticker-price" id="cr-ticker-price">0.00</span>
        </div>

        <!-- Product Grid -->
        <div class="prod-grid" id="cr-prod-grid" style="flex:1; overflow-y:auto;">
          <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--t3);">
            <div class="spin" style="margin:0 auto 14px;"></div> تحميل…
          </div>
        </div>
      </div>

      <!-- Left Side: Cashier Credit Note Cart Sidebar (shown on desktop/tablet) -->
      <div class="pos-cart">
        <div class="cart-header">
          <span>↩️ المرتجعات</span>
          <span class="cart-count-badge" id="cr-side-count">0</span>
        </div>
        <div class="cart-body" id="cr-body">
          <div class="cart-empty">
            <span style="font-size:32px;">↩️</span>
            <span>لا يوجد مرتجعات</span>
          </div>
        </div>
        
        <!-- Totals & Actions inside Sidebar -->
        <div style="padding:12px; border-top:1px solid var(--border); background:var(--bg-2); display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
          <div style="font-size:10px; color:var(--t3); text-align:center; margin-bottom:4px;">
            ↩️ إشعار دائن — يُعيد المخزون لسيارتك
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t2);">
            <span>قبل الضريبة</span><span id="cr-side-sub">0.00 ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t2);">
            <span>ضريبة 15%</span><span id="cr-side-vat">0.00 ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:900; color:var(--success);">
            <span>إجمالي الإشعار</span><span id="cr-side-total">0.00 ر.س</span>
          </div>
          <button class="confirm-btn" style="width:100%; padding:12px; font-size:15px; background:var(--success);" onclick="crSubmit();">
            ✅ حفظ الإشعار الدائن
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Cart FAB (shown on mobile only) -->
    <div class="cart-fab" id="cr-fab" onclick="openCrSheet()" style="display:none;">
      <span style="font-size:22px;">↩️</span>
      <span class="cart-fab-badge hidden" id="cr-fab-badge">0</span>
      <span class="cart-fab-total" id="cr-fab-total">0.00</span>
    </div>

    <!-- Compact Mobile Footer (shown on mobile only) -->
    <div class="pos-footer-bar" style="flex-shrink:0;">
      <div style="font-size:11px;color:var(--t2);text-align:center;padding:4px 0;">
        ↩️ إشعار دائن — يُعيد المخزون لسيارتك
      </div>
      <button class="confirm-btn" style="background:var(--success);width:100%;" onclick="crSubmit()">
        ✅ حفظ الإشعار الدائن
        <span id="cr-footer-total" style="font-size:13px;opacity:0.85;"> — 0.00 ر.س</span>
      </button>
    </div>
  </div>`;

  await crLoadProducts();
}

let _crProds = [];

async function crLoadProducts() {
  if (_pos.products.length) {
    _crProds = [..._pos.products];
  } else {
    const ps = await getDocs(COL("products"));
    _crProds = ps.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => (a.name||"").localeCompare(b.name||"","ar"));
  }
  crRenderGrid();
}

function crRenderGrid(q = "") {
  const grid = document.getElementById("cr-prod-grid");
  if (!grid) return;
  let prods = q ? _crProds.filter(p => p.name?.includes(q) || p.barcode?.includes(q)) : _crProds;

  grid.innerHTML = prods.map(p => {
    const inCr = _cr.lines.find(l => l.productId === p.id);
    const price = p.salePrice || p.priceRetail || p.sellingPrice || p.price || 0;
    const unit = p.unit || p.baseUnit || "حبة";
    const cost = p.costPrice || p.buyPrice || p.purchasePrice || p.averageCost || 0;
    return `
    <div class="prod-card ${inCr ? 'in-cart' : ''}" data-crpid="${p.id}"
      onclick="crTap('${p.id}','${esc(p.name)}',${price},'${esc(unit)}',${cost})">
      ${inCr ? `<div class="prod-qty-badge">${inCr.qty}</div>` : ""}
      <div class="prod-img">${prodIcon(p)}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-price">${fmtC(price)}</div>
    </div>`;
  }).join("") || `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--t3);">لا نتائج</div>`;
}

window.crSearch = (q) => crRenderGrid(q);
window.crSetRef = (v) => {
  const val = v ? v.trim() : null;
  _cr.refInvoice = val;
  _cr.originalInvoiceNumber = val;
};

window.crSelectInvoice = (val) => {
  const manualRow = document.getElementById("cr-ref-manual-row");
  const manualInp = document.getElementById("cr-ref-inv");
  if (val === "__manual__") {
    if (manualRow) manualRow.style.display = "flex";
    if (manualInp) manualInp.focus();
    _cr.refInvoice = manualInp ? (manualInp.value.trim() || null) : null;
    _cr.originalInvoiceNumber = _cr.refInvoice;
    _cr.originalInvoiceId = null;
    return;
  }
  if (manualRow) manualRow.style.display = "none";
  if (!val) {
    _cr.refInvoice = null;
    _cr.originalInvoiceNumber = null;
    _cr.originalInvoiceId = null;
    if (manualInp) manualInp.value = "";
    return;
  }
  const inv = (_cr.customerInvoices || []).find(i => (i.invoiceNumber || i.id) === val);
  _cr.refInvoice = val;
  _cr.originalInvoiceNumber = val;
  _cr.originalInvoiceId = inv ? (inv.id || val) : val;
  if (manualInp) manualInp.value = val;
  toast(`✅ تم ربط المردود بالفاتورة: ${val}`, "ok");
};

let _crTickerTimer = null;
window.crTap = (id, name, price, unit = "حبة", costPrice = 0) => {
  if (!_cr.cust) {
    toast("❌ اختر عميلاً أولاً", "err");
    return;
  }

  // Strict check: Block reps from returning items the customer did not buy before
  if (_cr.purchasedProductIds && !_cr.purchasedProductIds.has(id)) {
    toast("❌ هذا الصنف لم يسبق للعميل شراؤه! لا يمكن للمندوب استرجاعه.", "err");
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    return;
  }

  const ex = _cr.lines.find(l => l.productId === id);
  if (ex) {
    ex.qty++;
  } else {
    _cr.lines.push({
      productId: id,
      name,
      productName: name,
      price,
      unitPrice: price,
      unit: unit || "حبة",
      qty: 1,
      discount: 0,
      costPrice: costPrice || 0
    });
  }
  const line = _cr.lines.find(l => l.productId === id);
  const curPrice = line.unitPrice !== undefined ? line.unitPrice : line.price;
  requestAnimationFrame(() => {
    const card = document.querySelector(`.prod-card[data-crpid="${id}"]`);
    if (card) {
      card.classList.add("in-cart");
      let badge = card.querySelector(".prod-qty-badge");
      if (!badge) { badge = document.createElement("div"); badge.className = "prod-qty-badge"; card.appendChild(badge); }
      badge.textContent = line.qty;
    }
    crRenderCart(); // Automatically updates sidebar and calls crUpdateFab
    // Show ticker
    const ticker = document.getElementById("cr-ticker");
    const tN = document.getElementById("cr-ticker-name");
    const tQ = document.getElementById("cr-ticker-qty");
    const tP = document.getElementById("cr-ticker-price");
    if (ticker) { ticker.classList.add("visible"); clearTimeout(_crTickerTimer); _crTickerTimer = setTimeout(() => ticker.classList.remove("visible"), 2500); }
    if (tN) tN.textContent = name;
    if (tQ) tQ.textContent = `×${line.qty}`;
    if (tP) tP.textContent = `${fmtC(curPrice * line.qty)} ر.س`;
  });
  if (navigator.vibrate) navigator.vibrate(20);
};

function crUpdateFab() {
  const totalQty = _cr.lines.reduce((s,l) => s+l.qty, 0);
  const sub = _cr.lines.reduce((s,l) => s + (l.unitPrice !== undefined ? l.unitPrice : l.price) * l.qty, 0);
  const vat = Math.round((sub * VAT) * 1000) / 1000;
  const total = sub + vat;

  // Mobile Floating FAB & Footer
  const fab = document.getElementById("cr-fab");
  const badge = document.getElementById("cr-fab-badge");
  const fabT = document.getElementById("cr-fab-total");
  const footT = document.getElementById("cr-footer-total");
  if (fab) fab.style.display = totalQty > 0 ? "" : "none";
  if (badge) { badge.textContent = totalQty; badge.classList.toggle("hidden", totalQty === 0); }
  if (fabT)  fabT.textContent = fmtC(total);
  if (footT) footT.textContent = ` — ${fmtC(total)} ر.س`;

  // Side Cart
  const sideCount = document.getElementById("cr-side-count");
  const sideSub   = document.getElementById("cr-side-sub");
  const sideVat   = document.getElementById("cr-side-vat");
  const sideTotal = document.getElementById("cr-side-total");
  if (sideCount) sideCount.textContent = totalQty;
  if (sideSub)   sideSub.textContent   = fmtC(sub) + " ر.س";
  if (sideVat)   sideVat.textContent   = fmtC(vat) + " ر.س";
  if (sideTotal) sideTotal.textContent = fmtC(total) + " ر.س";
}

/* ── Credit Note Sidebar/Sheet Cart ── */
window.openCrSheet = () => {
  const existing = document.getElementById("cr-sheet-overlay");
  if (existing) { existing.remove(); return; }
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "cr-sheet-overlay";

  const sub = _cr.lines.reduce((s,l) => s + (l.unitPrice !== undefined ? l.unitPrice : l.price) * l.qty, 0);
  const vat = Math.round((sub * VAT) * 1000) / 1000;
  const total = sub + vat;

  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh;display:flex;flex-direction:column;">
    <div class="sheet-handle"></div>
    <div class="sheet-title" style="flex-shrink:0;">
      ↩️ المرتجعات
      <span id="cr-sheet-count" style="font-size:12px;color:var(--t2);font-weight:400;">
        (${_cr.lines.reduce((s,l)=>s+l.qty,0)} وحدة)
      </span>
    </div>
    <div class="sheet-body" id="cr-sheet-body"
         style="flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:10px;">
    </div>
    <div style="padding:10px 14px;border-top:1px solid var(--border);flex-shrink:0;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:4px;">
        <span>قبل الضريبة</span><span id="cr-sheet-sub">${fmtC(sub)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:6px;">
        <span>ضريبة 15%</span><span id="cr-sheet-vat">${fmtC(vat)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:var(--success);">
        <span>إجمالي الإشعار</span><span id="cr-sheet-total">${fmtC(total)} ر.س</span>
      </div>
    </div>
    <div style="padding:8px 14px calc(10px + var(--safe-bot));flex-shrink:0;">
      <button class="confirm-btn" style="width:100%;font-size:16px;padding:15px;background:var(--success);"
        onclick="document.getElementById('cr-sheet-overlay')?.remove();crSubmit();">
        ✅ حفظ الإشعار الدائن
      </button>
    </div>
  </div>`;

  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("cr-shell")?.appendChild(overlay);
  crRefreshSheet();
};

function crRenderCart() {
  const body = document.getElementById("cr-body");
  if (!body) return;
  crUpdateFab();

  if (!_cr.lines.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <span style="font-size:32px;">↩️</span>
        <span>لا يوجد مرتجعات</span>
      </div>`;
    return;
  }

  body.innerHTML = _cr.lines.map((ln, i) => {
    const price = ln.unitPrice !== undefined ? ln.unitPrice : ln.price;
    const name = ln.productName || ln.name;
    const unit = ln.unit || "وحدة";
    return `
    <div class="cart-row" id="crr-${i}">
      <div class="cart-row-top">
        <span class="cart-row-icon">${prodIconByName(name)}</span>
        <div class="cart-row-info">
          <div class="cart-row-name">${name}</div>
          <div class="cart-row-unit-price">${fmtC(price)} ر.س / ${unit}</div>
        </div>
        <button class="cart-row-del" onclick="crRemove(${i})" aria-label="حذف">🗑</button>
      </div>
      <div class="cart-row-bottom">
        <button class="cart-qty-btn minus" onclick="crQty(${i},-1)">−</button>
        <input class="cart-qty-val" type="number" inputmode="numeric"
          value="${ln.qty}" min="1"
          onchange="crSetQty(${i},this.value)"
          onfocus="this.select()" />
        <button class="cart-qty-btn plus" onclick="crQty(${i},1)">+</button>
        <div class="cart-row-price" id="crp-${i}">${fmtC(price * ln.qty)} ر.س</div>
      </div>
    </div>`;
  }).join("");
}

function crRefreshSheet() {
  const body = document.getElementById("cr-sheet-body");
  if (!body) return;
  const sub = _cr.lines.reduce((s,l) => s + (l.unitPrice !== undefined ? l.unitPrice : l.price) * l.qty, 0);
  const vat = Math.round((sub * VAT) * 1000) / 1000;
  const total = sub + vat;
  const s = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  s("cr-sheet-sub",   fmtC(sub));
  s("cr-sheet-vat",   fmtC(vat));
  s("cr-sheet-total", fmtC(total)+" ر.س");
  s("cr-sheet-count", `(${_cr.lines.reduce((s,l)=>s+l.qty,0)} وحدة)`);

  if (!_cr.lines.length) {
    body.innerHTML = `<div class="cart-empty"><span style="font-size:48px;">↩️</span><span>لا يوجد مرتجعات</span></div>`;
    return;
  }
  body.innerHTML = _cr.lines.map((ln,i) => {
    const price = ln.unitPrice !== undefined ? ln.unitPrice : ln.price;
    const name = ln.productName || ln.name;
    const unit = ln.unit || "وحدة";
    return `
    <div class="cart-row" id="crr-sheet-${i}">
      <div class="cart-row-top">
        <span class="cart-row-icon">${prodIconByName(name)}</span>
        <div class="cart-row-info">
          <div class="cart-row-name">${name}</div>
          <div class="cart-row-unit-price">${fmtC(price)} ر.س / ${unit}</div>
        </div>
        <button class="cart-row-del" onclick="crRemove(${i})">🗑</button>
      </div>
      <div class="cart-row-bottom">
        <button class="cart-qty-btn minus" onclick="crQty(${i},-1)">−</button>
        <input class="cart-qty-val" type="number" inputmode="numeric"
          value="${ln.qty}" min="1"
          onchange="crSetQty(${i},this.value)"
          onfocus="this.select()" />
        <button class="cart-qty-btn plus" onclick="crQty(${i},1)">+</button>
        <div class="cart-row-price" id="crp-sheet-${i}">${fmtC(price*ln.qty)} ر.س</div>
      </div>
    </div>`;
  }).join("");
}

function crRefreshSheetTotals() {
  const sub = _cr.lines.reduce((s,l) => s + (l.unitPrice !== undefined ? l.unitPrice : l.price) * l.qty, 0);
  const vat = Math.round((sub * VAT) * 1000) / 1000;
  const total = sub + vat;
  const s = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  s("cr-sheet-sub",   fmtC(sub));
  s("cr-sheet-vat",   fmtC(vat));
  s("cr-sheet-total", fmtC(total)+" ر.س");
  s("cr-sheet-count", `(${_cr.lines.reduce((s,l)=>s+l.qty,0)} وحدة)`);
}

window.openCrCustPicker = async () => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML = `
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">👤 اختر العميل</div>
    <div class="sheet-body">${renderCustList(_custCache)}</div>
  </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  const origSelect = window.selectCust;
  window.selectCust = async (id) => {
    _cr.cust = _custCache.find(c => c.id === id) || null;
    const pill = document.getElementById("cr-cust-pill");
    const nm   = document.getElementById("cr-cust-name");
    if (pill) pill.classList.toggle("selected", !!_cr.cust);
    if (nm)   nm.textContent = _cr.cust?.name || "اختر عميل…";
    overlay.remove();
    window.selectCust = origSelect;

    // Load customer purchase history and past invoices
    if (_cr.cust) {
      if (nm) nm.textContent = "👤 جاري فحص تاريخ المشتريات والفواتير...";
      try {
        const snap = await getDocs(query(COL("salesInvoices"), where("customerId", "==", _cr.cust.id)));
        _cr.purchasedProductIds = new Set();
        _cr.customerInvoices = [];
        snap.docs.forEach(d => {
          const inv = _normalizeInvoice({ id: d.id, ...d.data() });
          _cr.customerInvoices.push(inv);
          (inv.lines || []).forEach(l => {
            if (l.productId) _cr.purchasedProductIds.add(l.productId);
          });
        });

        // Sort invoices newest first
        _cr.customerInvoices.sort((a,b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        // Populate invoice select dropdown
        const invSel = document.getElementById("cr-ref-inv-select");
        if (invSel) {
          invSel.innerHTML = `<option value="">اختر الفاتورة الأصلية المراد الإرجاع منها (${_cr.customerInvoices.length} فاتورة مسجلة)...</option>` +
            _cr.customerInvoices.map(inv => {
              const num = inv.invoiceNumber || inv.id;
              const dateStr = inv.date || "";
              const tot = fmtC(inv.total || inv.totalWithVat || 0);
              return `<option value="${num}">فاتورة ${num} — ${dateStr} (${tot} ر.س)</option>`;
            }).join("") +
            `<option value="__manual__">✏️ إدخال يدوي لرقم فاتورة أخرى...</option>`;
        }

        if (nm) nm.textContent = _cr.cust.name;
        toast(`✅ تم ربط العميل (${_cr.customerInvoices.length} فاتورة سابقة)`, "ok");
      } catch (e) {
        if (nm) nm.textContent = _cr.cust.name;
        _cr.purchasedProductIds = null;
        _cr.customerInvoices = [];
        const invSel = document.getElementById("cr-ref-inv-select");
        if (invSel) {
          invSel.innerHTML = `<option value="__manual__">✏️ إدخال رقم الفاتورة يدوياً (نمط دون اتصال)</option>`;
        }
        const manualRow = document.getElementById("cr-ref-manual-row");
        if (manualRow) manualRow.style.display = "flex";
        toast("⚠️ تنبيه: تعذر فحص مشتريات العميل السابقة (نمط دون اتصال)", "warn");
      }
    }
  };
  document.body.appendChild(overlay);
};

let _crSubmitting = false;

window.crSubmit = async () => {
  if (_crSubmitting) {
    toast("⏳ جاري حفظ الإشعار الدائن...", "warn");
    return;
  }
  if (!_cr.cust)  { toast("❌ اختر عميلاً أولاً", "err"); return; }
  if (!_cr.lines.length) { toast("❌ أضف صنفاً واحداً على الأقل", "err"); return; }

  _crSubmitting = true;

  const sub   = _cr.lines.reduce((s,l) => s + (l.unitPrice !== undefined ? l.unitPrice : l.price) * l.qty, 0);
  const vat   = Math.round((sub * VAT) * 1000) / 1000;
  const total = sub + vat;
  const crNo  = `CR-${Date.now().toString().slice(-8)}`;
  const today = getTodayLocalDate();
  const refInv = _cr.originalInvoiceNumber || _cr.refInvoice || null;

  const formattedLines = _cr.lines.map(l => {
    const uPrice = Number(l.unitPrice !== undefined ? l.unitPrice : l.price) || 0;
    const qty = Number(l.qty) || 1;
    const disc = Number(l.discount) || 0;
    const cPrice = Number(l.costPrice) || 0;
    return {
      productId:   l.productId,
      productName: l.productName || l.name || "صنف",
      name:        l.productName || l.name || "صنف",
      unit:        l.unit || "حبة",
      qty:         qty,
      unitPrice:   uPrice,
      price:       uPrice,
      discount:    disc,
      costPrice:   cPrice,
      total:       Math.round(uPrice * qty * (1 - disc / 100) * 100) / 100
    };
  });

  try {
    await runTransaction(db, async (tx) => {
      // 1. Save credit note document
      tx.set(doc(db, `companies/${COID}/salesReturns`, crNo), {
        number:                crNo,
        creditNoteNumber:      crNo,
        invoiceNumber:         crNo,
        type:                  "sales_return",
        source:                "rep_van_app",
        customerId:            _cr.cust.id,
        customerName:          _cr.cust.name,
        repId:                 REP.id,
        repName:               REP.name,
        warehouseId:           REP.assignedWarehouseId || null,
        warehouseName:         REP.assignedWarehouseName || "سيارة المندوب",
        originalInvoiceNumber: refInv,
        originalInvoiceId:     _cr.originalInvoiceId || refInv,
        refInvoice:            refInv,
        date:                  today,
        lines:                 formattedLines,
        subtotal:              sub,
        vatAmount:             vat,
        totalVat:              vat,
        total:                 total,
        totalWithVat:          total,
        status:                "posted",
        zatcaStatus:           "reported",
        companyId:             COID,
        createdAt:             serverTimestamp(),
      });

      // 2. Reduce customer balance (credit)
      tx.set(doc(COL("customers"), _cr.cust.id), {
        balance: increment(-total)
      }, { merge: true });
    });

    // 3. Update stock transactions & inventory balances atomically via adjustStockBulk
    if (REP.assignedWarehouseId) {
      try {
        const { adjustStockBulk } = await import("../utils/db.js");
        const adjustments = formattedLines
          .filter(ln => ln.productId && ln.qty)
          .map(ln => ({
            warehouseId: REP.assignedWarehouseId,
            productId: ln.productId,
            qtyDelta: +ln.qty,
            metadata: {
              type: "return_in",
              sourceType: "salesReturn",
              sourceId: crNo,
              documentNumber: crNo,
              invoiceNumber: crNo,
              productName: ln.name,
              notes: `مردود مبيعات المندوب — إشعار دائن ${crNo}`
            }
          }));
        if (adjustments.length > 0) {
          await adjustStockBulk(adjustments);
        }
      } catch (modErr) {
        console.warn("adjustStockBulk error in rep return:", modErr.message);
      }
    }

    // 4. Create accounting journal entry
    try {
      const { autoSalesReturnJE } = await import("../utils/accounting-engine.js");
      const whSnap = await getDocs(COL("warehouses"));
      const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const totalCost = formattedLines.reduce((s, l) => s + ((l.costPrice || 0) * (l.qty || 0)), 0);
      await autoSalesReturnJE({
        id:           crNo,
        returnNumber: crNo,
        date:         today,
        customerId:   _cr.cust.id,
        repId:        REP.id,
        customerName: _cr.cust.name,
        customerType: _cr.cust.type || "retail",
        paymentMethod: "credit",
        subtotal:     sub,
        taxAmount:    vat,
        total:        total,
        totalCost,
        warehouseId:  REP.assignedWarehouseId,
      }, {}, warehouses);
    } catch (jeErr) {
      console.warn("autoSalesReturnJE error:", jeErr.message);
    }

    // 5. Sync customer balance recalculation if available
    try {
      const bSync = await import("../utils/balance-sync.js");
      if (bSync && bSync.recalculateCustomerBalance) {
        await bSync.recalculateCustomerBalance(_cr.cust.id);
      }
    } catch (_) {}

    toast(`✅ تم حفظ الإشعار ${crNo} ورُبط بالفاتورة والمخزون بنجاح`, "ok");
    navigate("dashboard");
  } catch(e) {
    toast("❌ " + e.message, "err");
  } finally {
    _crSubmitting = false;
  }
};





/* ══════════════════════════════════
   CUSTOMERS
══════════════════════════════════ */
async function renderCustomers(mc) {
  // Show cached items instantly (if they exist) to keep interface extremely fast
  mc.innerHTML = `
  <div class="page">
    <div class="page-title">👥 عملائي (${_custCache.length})</div>
    <input class="page-search" placeholder="🔍 بحث…" oninput="filterCustPage(this.value)" />
    <div class="cust-list" id="cust-page-list">${renderCustCards(_custCache)}</div>
  </div>`;

  // Then fetch fresh data in background to reflect collections made in the main ERP
  try {
    const snap = await getDocs(query(COL("customers"), where("repId","==",REP.id)));
    _custCache = snap.docs.map(d => {
      const dt = d.data();
      dt.name = dt.name || dt.nameAr || dt.customerName || "عميل";
      return { id: d.id, ...dt };
    }).sort((a,b) => (a.name||"").localeCompare(b.name||"","ar"));
    
    // Update the UI if we are still on the customers page
    if (_currentPage === "customers") {
      const titleEl = mc.querySelector(".page-title");
      if (titleEl) titleEl.textContent = `👥 عملائي (${_custCache.length})`;
      const listEl = document.getElementById("cust-page-list");
      if (listEl) listEl.innerHTML = renderCustCards(_custCache);
    }
  } catch(e) {
    console.error("Failed to revalidate customers cache:", e);
    if (!_custCache.length) {
      mc.innerHTML = `<div class="page"><div class="empty-wrap"><div class="empty-text">${e.message}</div></div></div>`;
    }
  }
}
window.filterCustPage = (q) => {
  const el = document.getElementById("cust-page-list");
  if (el) el.innerHTML = renderCustCards(_custCache.filter(c=>c.name?.includes(q)||c.phone?.includes(q)));
};
function renderCustCards(list) {
  return list.map(c => {
    const name = c.name || c.nameAr || c.customerName || (c.code ? `عميل ${c.code}` : "عميل");
    const bal = c.balance || 0;
    return `
    <div class="cust-card" data-cust-id="${c.id}" onclick="viewCustomerLedger('${c.id}')" style="cursor:pointer;">
      <div class="cust-ava">${name?.[0]||"ع"}</div>
      <div style="flex:1;">
        <div class="cust-name">${name}</div>
        <div class="cust-phone">${c.phone||"—"}</div>
      </div>
      <span class="cust-bal ${bal<=0?'ok':''}">${fmtC(Math.abs(bal))}</span>
    </div>`;
  }).join("") || `<div class="empty-wrap"><div class="empty-text">لا يوجد عملاء</div></div>`;
}

/* ══════════════════════════════════
   STOCK
══════════════════════════════════ */
let _stockProds = [], _stockMap = {};

async function renderStock(mc) {
  if (!REP.assignedWarehouseId) {
    mc.innerHTML = `<div class="page"><div class="empty-wrap"><div class="empty-icon">🚗</div><div class="empty-text">لم يُعيّن مخزن لك<br>تواصل مع المدير</div></div></div>`;
    return;
  }
  mc.innerHTML = `<div class="page"><div class="loading-wrap"><div class="spin"></div>تحميل…</div></div>`;
  try {
    const whSnap = await getDoc(doc(db, `companies/${COID}/warehouses`, REP.assignedWarehouseId));
    let whName = "";
    if (whSnap.exists()) {
      whName = whSnap.data().name || "";
    }
    const isMain = whName.includes("الرئيسي") || whName.includes("الرئيسى") || whName.toLowerCase().includes("main") || REP.assignedWarehouseId === "W5uANJjMgfFh2p3xU4bT";
    const isCar = whName.includes("سيارة") || whName.includes("سياره") || whName.includes("مندوب") || whName.toLowerCase().includes("van") || whName.toLowerCase().includes("rep");

    if (isMain || !isCar) {
      mc.innerHTML = `
        <div class="page" style="display:flex; align-items:center; justify-content:center; height:100%; min-height:350px;">
          <div class="empty-wrap" style="text-align:center; padding:32px; background:var(--bg-1); border-radius:24px; border:1px solid var(--border); box-shadow:var(--shadow); max-width:90%; margin:auto;">
            <div class="empty-icon" style="font-size:64px; margin-bottom:16px;">🚗</div>
            <div class="empty-text" style="font-weight:800; font-size:17px; color:var(--t1); margin-bottom:8px;">مستودع غير صالح للمندوب</div>
            <div style="font-size:12px; color:var(--t2); line-height:1.6; margin-bottom:16px;">
              مستودعك الحالي هو (<b>${whName || "غير محدد"}</b>).<br>
              المندوب يجب أن يستعرض ويبيع من مخزن سيارته المخصص فقط.
            </div>
            <button class="btn-primary" onclick="navigate('dashboard')" style="margin-top:20px; min-height:42px; font-size:13px; padding:8px 16px; margin: 0 auto;">🔄 العودة للرئيسية</button>
          </div>
        </div>`;
      return;
    }

    const sq = query(COL("stockByWarehouse"), where("warehouseId","==",REP.assignedWarehouseId));
    const ss = await getDocs(sq);
    _stockMap = {};
    ss.docs.forEach(d => { const dt=d.data(); _stockMap[dt.productId]=dt.qty??0; });
    const ps = await getDocs(COL("products"));
    _stockProds = ps.docs.map(d=>({id:d.id,...d.data(),qty:_stockMap[d.id]??0}))
      .filter(p=>p.qty>0||p.id in _stockMap)
      .sort((a,b)=>(a.name||"").localeCompare(b.name||"","ar"));
    renderStockList(mc);

    // Real-time
    if (_unsub_stock) _unsub_stock();
    _unsub_stock = onSnapshot(sq, snap => {
      snap.docs.forEach(d=>{ const dt=d.data(); _stockMap[dt.productId]=dt.qty??0; const p=_stockProds.find(x=>x.id===dt.productId); if(p)p.qty=dt.qty??0; });
      renderStockList(mc);
    });
  } catch(e) {
    mc.innerHTML = `<div class="page"><div class="empty-wrap"><div class="empty-text">${e.message}</div></div></div>`;
  }
}
function renderStockList(mc) {
  const total = _stockProds.reduce((s,p)=>s+(p.qty||0),0);
  mc.innerHTML = `
  <div class="page">
    <div class="page-title" style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-bottom:10px;">
      <span>📦 مخزون سيارتي</span>
      <div style="display:flex; gap:6px;">
        <button class="btn-secondary" onclick="openVanStocktakeModal()" style="min-height:36px; font-size:11px; padding:6px 8px; margin:0; width:auto; flex-shrink:0;">⚖️ جرد السيارة</button>
        <button class="btn-primary" onclick="openRestockRequestModal()" style="min-height:36px; font-size:11px; padding:6px 8px; margin:0; width:auto; flex-shrink:0;">🚚 طلب شحن</button>
      </div>
    </div>
    <div id="pending-transfers-banner-wrap"></div>
    <input class="page-search" placeholder="🔍 بحث…" oninput="filterStock(this.value)" />
    <div style="font-size:12px;color:var(--t2);margin-bottom:12px;">إجمالي الوحدات: ${total}</div>
    <div class="stock-list" id="stock-list-body">${renderStockItems(_stockProds)}</div>
  </div>`;
  if (window.checkPendingStockTransfers) {
    window.checkPendingStockTransfers();
  }
}
window.filterStock = (q) => {
  const el=document.getElementById("stock-list-body");
  if(el) el.innerHTML=renderStockItems(_stockProds.filter(p=>p.name?.includes(q)));
};
function renderStockItems(prods) {
  if (!prods.length) return `<div class="empty-wrap"><div class="empty-icon">📦</div><div class="empty-text">لا يوجد مخزون</div></div>`;
  const maxQ = Math.max(...prods.map(p=>p.qty||0), 1);
  return prods.map(p => {
    const q = p.qty || 0;
    const cls = q <= 0 ? "low" : q <= 5 ? "medium" : "";
    const pct = Math.min(100, (q/maxQ)*100);
    return `
    <div class="stock-item">
      <div class="stock-item-row">
        <div>
          <div class="stock-name">${p.name}</div>
          <div class="stock-unit">${p.unit||""}</div>
        </div>
        <div class="stock-qty ${cls}">${q}</div>
      </div>
      <div class="stock-bar-track">
        <div class="stock-bar-fill ${cls}" style="width:${pct}%;"></div>
      </div>
    </div>`;
  }).join("");
}

/* ══════════════════════════════════
   PRINT
══════════════════════════════════ */
// Direct offline ZATCA QR base64 generator
function getZatcaQRBase64(seller, vat, time, total, tax) {
  const tlvEncode = (tag, val) => {
    const bytes = new TextEncoder().encode(val);
    const res = new Uint8Array(2 + bytes.length);
    res[0] = tag;
    res[1] = bytes.length;
    res.set(bytes, 2);
    return res;
  };
  const fields = [
    tlvEncode(1, seller),
    tlvEncode(2, vat),
    tlvEncode(3, time),
    tlvEncode(4, Number(total).toFixed(2)),
    tlvEncode(5, Number(tax).toFixed(2))
  ];
  const len = fields.reduce((s, a) => s + a.length, 0);
  const buf = new Uint8Array(len);
  let offset = 0;
  for (const arr of fields) {
    buf.set(arr, offset);
    offset += arr.length;
  }
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return btoa(binary);
}

window.printInvoice = async (id) => {
  try {
    const snap = await getDoc(doc(db, `companies/${COID}/salesInvoices`, id));
    if (!snap.exists()) { toast("الفاتورة غير موجودة","err"); return; }
    printInvoiceData(_normalizeInvoice({ id: snap.id, ...snap.data() }));
  } catch(e) { toast(e.message,"err"); }
};

window.printInvoiceData = async (inv) => {
  try {
  if (typeof inv === "string") inv = JSON.parse(inv);
  inv = _normalizeInvoice(inv);

  // Load customer full data for printing
  let custBalance = 0;
  let custVat = "";
  let custCr = "";
  let custStreet = "";
  let custDistrict = "";
  let custCity = "";
  let custBuilding = "";
  let custZip = "";
  let custAdditional = "";
  let custCountry = "المملكة العربية السعودية";

  if (inv.customerId || inv.customerName) {
    try {
      const { getDoc, doc, collection: colFn, query: qFn, where: wFn, getDocs: getDocsFn } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      let custSnap = null;
      if (inv.customerId) {
        custSnap = await getDoc(doc(db, `companies/${COID}/customers`, inv.customerId));
        if (!custSnap.exists()) {
          const custQ = qFn(colFn(db, `companies/${COID}/customers`), wFn("accountId", "==", inv.customerId));
          const qSnap = await getDocsFn(custQ);
          if (!qSnap.empty) custSnap = qSnap.docs[0];
        }
      }
      if ((!custSnap || !custSnap.exists()) && inv.customerName) {
        const nameQ = qFn(colFn(db, `companies/${COID}/customers`), wFn("name", "==", inv.customerName));
        const nSnap = await getDocsFn(nameQ);
        if (!nSnap.empty) custSnap = nSnap.docs[0];
      }

      if (custSnap && custSnap.exists()) {
        const cdata = custSnap.data();
        custBalance = parseFloat(cdata.balance) || 0;
        
        // Calculate true previous balance before this invoice by checking prior invoices
        try {
          const priorQ = qFn(colFn(db, `companies/${COID}/salesInvoices`), wFn("customerId", "==", inv.customerId || custSnap.id));
          const priorSnap = await getDocsFn(priorQ);
          let priorSum = 0;
          let priorCount = 0;
          priorSnap.docs.forEach(d => {
            const did = d.id;
            const dnum = d.data().invoiceNumber || did;
            const curNum = inv.invoiceNumber || inv.id || "";
            if (did !== inv.id && dnum !== curNum) {
              priorCount++;
              priorSum += Number(d.data().remainingAmount || d.data().totalWithVat || d.data().total || 0);
            }
          });
          if (priorCount === 0) {
            previousBalance = 0;
          } else {
            previousBalance = Math.max(0, priorSum);
          }
        } catch(e) {
          console.warn("Fallback balance calc:", e);
          const invRem = Number(inv.remainingAmount || inv.totalWithVat || inv.total || 0);
          previousBalance = Math.abs(custBalance - invRem) < 0.05 ? 0 : Math.max(0, custBalance - invRem);
        }
        custVat = cdata.vatNumber || cdata.vat || cdata.taxNumber || cdata.taxNo || cdata.taxId || "";
        custCr = cdata.crNumber || cdata.nationalId || cdata.cr || cdata.commercialRegistration || cdata.idNumber || "";
        custStreet = cdata.street || "";
        custDistrict = cdata.district || "";
        custCity = cdata.city || cdata.zone || "";
        custBuilding = cdata.buildingNo || cdata.buildingNumber || "";
        custZip = cdata.postalCode || cdata.zip || cdata.zipCode || "";
        custAdditional = cdata.additionalNo || cdata.additionalNumber || "";
        custCountry = cdata.country || "المملكة العربية السعودية";

        if (cdata.address) {
          const addr = cdata.address;
          if (!custBuilding) {
            const m = addr.match(/(?:المبنى|رقم المبنى)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custBuilding = m[1].trim();
          }
          if (!custStreet) {
            const m = addr.match(/(?:الشارع|شارع)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custStreet = m[1].trim();
          }
          if (!custDistrict) {
            const m = addr.match(/(?:الحي|حي)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custDistrict = m[1].trim();
          }
          if (!custCity) {
            const m = addr.match(/(?:المدينة|مدينة)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custCity = m[1].trim();
          }
          if (!custZip) {
            const m = addr.match(/(?:الرمز البريدي|الرمز|البريدي)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custZip = m[1].trim();
          }
          if (!custAdditional) {
            const m = addr.match(/(?:الرقم الإضافي|الرقم الاضافي|الإضافي|الاضافي)\s*:\s*([^—\-\n,]+)/i);
            if (m && m[1]) custAdditional = m[1].trim();
          }
        }

        if (!custDistrict && (custStreet || cdata.address)) {
          const fullAddr = custStreet || cdata.address || "";
          if (fullAddr.includes("حي")) {
            const match = fullAddr.match(/(?:-|—|,|\/)?\s*(حي\s+[^,-—\/]+)/);
            if (match && match[1]) {
              custDistrict = match[1].trim();
              if (custStreet && custStreet.includes(match[0])) {
                custStreet = custStreet.replace(match[0], "").trim();
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load customer balance for print:", e);
    }
  }

  const cust = {
    name: inv.customerName || "عميل نقدي",
    vatNumber: custVat || "",
    crNumber: custCr || "",
    street: custStreet || "",
    district: custDistrict || "",
    city: custCity || "",
    buildingNo: custBuilding || "",
    postalCode: custZip || "",
    additionalNo: custAdditional || "",
    country: custCountry || "المملكة العربية السعودية",
    balance: custBalance || 0
  };

  // Determine ZATCA Invoice Category (Standard B2B vs Simplified B2C)
  const isB2B = !!(custVat && custVat.trim().length >= 10);
  const titleAr = isB2B ? "فاتورة ضريبية" : "فاتورة ضريبية مبسطة";
  const titleEn = isB2B ? "TAX INVOICE" : "SIMPLIFIED TAX INVOICE";
  const typeTag = isB2B ? "فاتورة ضريبية قياسية (B2B)" : "فاتورة ضريبية مبسطة (B2C)";

  // ── 1. Generate ZATCA QR Base64 ──
  let qrBase64 = "";
  try {
    const sellerName = COMPANY.name || "شركة نظم الإمداد المتطورة";
    const vatNumber  = COMPANY.vatNumber || "314996148100003";
    const isoTime    = inv.createdAt
      ? (typeof inv.createdAt === "string" ? inv.createdAt : new Date(inv.createdAt.seconds * 1000).toISOString())
      : new Date().toISOString();
    qrBase64 = getZatcaQRBase64(sellerName, vatNumber, isoTime, inv.total || 0, inv.vatAmount || 0);
  } catch (qrErr) { console.error("[print] QR generation error:", qrErr); }

  const qrImgDataUrl = qrBase64 ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrBase64)}` : "";

  // ── 2. Build invoice values ──
  const payLabel   = { cash:"نقدي (Cash)", credit:"آجل (Credit)", transfer:"تحويل بنكي", cheque:"شيك" }[inv.paymentMethod] || inv.paymentMethod || "-";
  const subtotal   = inv.subtotal || 0;
  const discAmt    = inv.discountAmount || 0;
  const vatAmt     = inv.vatAmount || 0;
  const total      = inv.total || 0;

  let totalItemsCount = 0;
  let totalQtySum = 0;

  const lineRows = (inv.lines || []).map((l, i) => {
    const name = l.name || l.productName || "-";
    const qty  = parseFloat(l.qty || 0);
    const price = parseFloat(l.price || l.unitPrice || 0);
    const discPercent = parseFloat(l.discount || 0);
    const lineDisc = (qty * price) * (discPercent / 100);
    const taxableAmount = (qty * price) - lineDisc;
    const vatRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 15;
    const vatAmount = taxableAmount * (vatRate / 100);
    const totalWithVat = taxableAmount + vatAmount;

    totalItemsCount++;
    totalQtySum += qty;

    // Smart unit determination:
    let rawUnit = l.unit;
    if (!rawUnit || rawUnit === "Piece" || rawUnit === "PCS" || rawUnit === "حبة") {
      const prodsList = (typeof _pos !== "undefined" && _pos && _pos.products) ? _pos.products : [];
      const matchedProd = prodsList.find(p => p.id === l.productId || p.name === name);
      if (matchedProd && matchedProd.unit && matchedProd.unit !== "Piece" && matchedProd.unit !== "PCS") {
        rawUnit = matchedProd.unit;
      } else if (!rawUnit) {
        rawUnit = matchedProd?.unit || "حبة";
      }
    }
    const unitName = rawUnit || "حبة";

    return `<tr>
      <td style="text-align:center; font-weight:700;">${i + 1}</td>
      <td class="desc" style="text-align:right;">
        <div style="font-weight:800; color:#1e1b4b; font-size:11.5px;">${name}</div>
        <div style="font-size:9.5px; color:#6b7280; margin-top:2px;">الوحدة: <b style="color:#1e1b4b;">${unitName}</b></div>
      </td>
      <td style="text-align:center;" class="mono font-bold">${qty}</td>
      <td class="mono">${fmtC(price)}</td>
      <td class="mono" style="color:${discPercent > 0 ? '#dc2626' : '#9ca3af'};">
        ${discPercent > 0 ? `${discPercent}%` : "—"}
      </td>
      <td class="mono">${fmtC(taxableAmount)}</td>
      <td style="text-align:center;">${vatRate}%</td>
      <td class="mono">${fmtC(vatAmount)}</td>
      <td class="mono font-bold" style="color:#1e1b4b;">${fmtC(totalWithVat)}</td>
    </tr>`;
  }).join("");

  const logoSrc = COMPANY.logoUrl || COMPANY.logoBase64 || COMPANY.logo || "";
  const logoHtml = logoSrc
    ? `<div class="logo-circle"><img src="${logoSrc}" alt="شعار" /></div>`
    : `<div class="logo-circle"><div class="default-logo">🏢</div></div>`;

  const barcodeSvg = (() => {
    const clean = (inv.invoiceNumber || inv.id || "").replace(/[^a-zA-Z0-9]/g, '');
    let svg = '<svg width="150" height="38" viewBox="0 0 150 38" xmlns="http://www.w3.org/2000/svg">';
    let x = 12;
    let hash = 5381;
    for (let i = 0; i < clean.length; i++) hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    svg += '<rect x="' + x + '" y="2" width="2" height="22" fill="#111" />'; x += 3;
    svg += '<rect x="' + x + '" y="2" width="1" height="22" fill="#111" />'; x += 2;
    for (let i = 0; i < 20; i++) {
      const width = ((Math.abs(hash) >> i) & 1) ? 2.5 : 1;
      svg += '<rect x="' + x + '" y="2" width="' + width + '" height="22" fill="#111" />';
      x += width + 1.5;
    }
    svg += '<rect x="' + x + '" y="2" width="1" height="22" fill="#111" />'; x += 2;
    svg += '<rect x="' + x + '" y="2" width="2" height="22" fill="#111" />';
    svg += '<text x="75" y="34" font-family="monospace" font-size="9" text-anchor="middle" fill="#111">' + (inv.invoiceNumber || inv.id?.slice(0,10)) + '</text>';
    svg += '</svg>';
    return svg;
  })();

  
  const lineCount = (inv.lines || []).length;
  const isSmallInvoice = lineCount <= 4;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${titleAr} #${inv.invoiceNumber || ""}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'IBM Plex Sans Arabic',sans-serif;background:#f8fafc;color:#1f2937;direction:rtl;min-height:100vh;padding:12px;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  
  .toolbar{background:#1e293b;padding:12px;display:flex;gap:12px;justify-content:center;position:sticky;top:0;z-index:99;border-radius:10px;margin-bottom:12px;}
  .btn{border:none;border-radius:8px;padding:9px 20px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;}
  .btn-print{background:#1e1b4b;color:#fff;}
  .btn-close{background:#334155;color:#fff;}
  
  .invoice-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 14px; border: 1.5px solid #1e1b4b; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
  
  .top-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px; }
  .title-box { text-align: right; }
  .title-box h1 { font-size: 22px; color: #1e1b4b; font-weight: 800; line-height: 1.2; }
  .title-box h2 { font-size: 10.5px; color: #6366f1; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; }
  .doc-badge { display: inline-block; background: #e0e7ff; color: #1e1b4b; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 4px; }
  
  .company-banner { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%) !important; color: #fff !important; border-radius: 10px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 3.5px solid #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.12); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .banner-meta { text-align: right; display: flex; flex-direction: column; gap: 3px; }
  .meta-line { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #fff !important; }
  .meta-line .m-lbl { opacity: 0.9; font-weight: 500; }
  .meta-line .m-val { font-weight: 800; color: #fff !important; }
  
  .banner-co { text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .banner-co h2 { font-size: 17px; font-weight: 800; color: #fff !important; margin-bottom: 2px; }
  .co-id-row { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .co-pill { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #fff !important; display: inline-flex; align-items: center; gap: 6px; }
  .co-pill strong { color: #fff !important; font-size: 11.5px; }
  
  .logo-circle { width: 68px; height: 68px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 2px solid #6366f1; box-shadow: 0 3px 8px rgba(0,0,0,0.15); flex-shrink: 0; margin: 0 12px; }
  .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .logo-circle .default-logo { font-size: 28px; }
  
  .parties-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .party-card { border: 1.2px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 6px 10px; font-size: 10.5px; }
  .party-card.seller { border-color: #a5b4fc; background: #fdfcff; }
  .party-card.buyer { border-color: #cbd5e1; background: #f8fafc; }
  
  .party-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
  .party-title { font-weight: 800; color: #3730a3; font-size: 11px; }
  .party-name { font-size: 12.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  /* Dedicated Party ID Badges (CR & VAT) */
  .party-ids-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px; }
  .id-badge { background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
  .id-badge.vat-badge { border-color: #818cf8; background: #fdfcff; }
  .id-lbl { color: #475569; font-weight: 700; }
  .id-val { font-weight: 800; color: #1e1b4b; font-size: 10.5px; }
  
  .badge-vat { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }
  .badge-novat { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }

  /* Compact Horizontal Address Matrix */
  .addr-compact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px 6px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 4px 6px;
  }
  .addr-line-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 9.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .addr-line-item .lbl { color: #64748b; font-weight: 700; }
  .addr-line-item .val { color: #1e293b; font-weight: 800; }
  .addr-line-item.full { grid-column: span 3; }
  
  .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1.5px solid #1e1b4b; border-radius: 8px; overflow: hidden; }
  .invoice-table thead tr { background: #1e1b4b !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .invoice-table thead th { color: #fff !important; font-size: 10px; font-weight: 700; padding: 7px 4px; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
  .invoice-table tbody tr { border-bottom: 1px solid #e2e8f0; }
  .invoice-table tbody tr:nth-child(even) { background: #fdfcff; }
  .invoice-table tbody td { padding: 7px 5px; font-size: 10.5px; text-align: center; border: 1px solid #e2e8f0; color: #1f2937; }
  .mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
  .font-bold { font-weight: 700; }
  
  .bottom-layout { display: grid; grid-template-columns: 100px 1fr 280px; gap: 10px; margin-bottom: 12px; align-items: stretch; margin-top: 10px; }
  .qr-box { border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 6px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .qr-box span { font-size: 8.5px; color: #64748b; margin-top: 4px; font-weight: 700; }
  
  .notes-box { border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; background: #fff; font-size: 10.5px; display: flex; flex-direction: column; justify-content: space-between; }
  .notes-title { font-weight: 800; color: #1e1b4b; margin-bottom: 2px; font-size: 11px; }
  .notes-body { color: #475569; line-height: 1.35; }
  .official-receipt-notice { margin-top: 4px; background: #fef2f2; border: 1px dashed #ef4444; border-radius: 4px; padding: 3px 6px; }
  .notice-ar { font-weight: 800; color: #991b1b; font-size: 9.5px; }
  .notice-en { font-size: 8px; color: #7f1d1d; font-weight: 600; direction: ltr; text-align: right; }
  
  .totals-table-wrap { border: 1.5px solid #1e1b4b; border-radius: 8px; overflow: hidden; background: #fff; }
  .totals-table { width: 100%; border-collapse: collapse; }
  .totals-table tr td { padding: 6px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
  .totals-table tr td.lbl { text-align: right; color: #475569; font-weight: 600; }
  .totals-table tr td.val { text-align: left; font-family: 'IBM Plex Mono', monospace; font-weight: 700; direction: ltr; white-space: nowrap; }
  .totals-table tr.grand td { background: #1e1b4b !important; color: #fff !important; font-weight: 800; font-size: 13px; border-bottom: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .totals-table tr.grand td.val { color: #fff !important; }
  .totals-table tr.balance-row td { background: #f8fafc; font-size: 10px; color: #64748b; }
  .totals-table tr.due-row td { background: #fdfcff; font-weight: 800; color: #1e1b4b; font-size: 11.5px; }
  
  .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 6px; }
  .sig-box { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #fafafa; font-size: 10.5px; }
  .sig-title { font-weight: 800; color: #334155; margin-bottom: 20px; }
  .sig-line { border-top: 1px solid #94a3b8; padding-top: 4px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
  
  .footer-bar { text-align: center; padding-top: 10px; font-size: 10.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; margin-top: 10px; }
  
  @page { size: A4; margin: 6mm 8mm 6mm 8mm; }
  @media print {
    html, body {
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
      height: 100% !important;
      font-size: 10px !important;
    }
    .toolbar, .no-print { display: none !important; }
    .invoice-container {
      box-shadow: none !important;
      margin: 0 !important;
      border-radius: 0 !important;
      border: 1px solid #1e1b4b !important;
      padding: 5px 8px !important;
      max-width: 100% !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .top-header { padding-bottom: 3px !important; margin-bottom: 4px !important; }
    .title-box h1 { font-size: 16px !important; }
    .company-banner { padding: 4px 8px !important; margin-bottom: 4px !important; border-radius: 6px !important; }
    .company-banner h2 { font-size: 13px !important; }
    .logo-circle { width: 42px !important; height: 42px !important; margin: 0 4px !important; }
    .parties-container { gap: 4px !important; margin-bottom: 4px !important; }
    .party-card { padding: 3px 5px !important; font-size: 8.5px !important; }
    .party-ids-row { gap: 2px !important; margin-bottom: 2px !important; }
    .id-badge { padding: 1px 3px !important; font-size: 8px !important; }
    .addr-compact-grid { padding: 2px 4px !important; }
    .addr-line-item { font-size: 8px !important; }
    .invoice-table { margin-bottom: 4px !important; }
    .invoice-table thead th { padding: 3px 2px !important; font-size: 8.5px !important; }
    .invoice-table tbody td { padding: 2px 2px !important; font-size: 8.5px !important; }
    .tafqeet-strip { padding: 2px 5px !important; margin-bottom: 4px !important; font-size: 8.5px !important; }
    .bottom-layout { gap: 5px !important; margin-bottom: 4px !important; grid-template-columns: 80px 1fr 230px !important; }
    .qr-box { padding: 2px !important; }
    .qr-box svg, .qr-box img { max-width: 70px !important; max-height: 70px !important; }
    .notes-box { padding: 3px 5px !important; font-size: 8px !important; }
    .totals-table tr td { padding: 2px 5px !important; font-size: 8.5px !important; }
    .totals-table tr.grand td { font-size: 10px !important; padding: 2.5px 5px !important; }
    .signatures-grid { gap: 6px !important; margin-top: 3px !important; padding-top: 3px !important; }
    .sig-box { padding: 3px 5px !important; font-size: 8px !important; }
    .sig-title { margin-bottom: 6px !important; font-size: 8px !important; }
    .footer-bar { margin-top: 3px !important; padding-top: 2px !important; font-size: 8px !important; }
  }
</style>
</head>
<body>
<div class="toolbar">
  <button class="btn btn-print" onclick="window.print()">🖨️ طباعة الفاتورة A4</button>
  <button class="btn btn-close" onclick="window.close()">✕ إغلاق</button>
</div>

<div class="invoice-container">
  <!-- Top Header with Barcode & Title -->
  <div class="top-header">
    <div class="title-box">
      <h1>${titleAr}</h1>
      <h2>${titleEn}</h2>
      <span class="doc-badge">${typeTag}</span>
    </div>
    <div>
      ${barcodeSvg}
    </div>
  </div>

  <!-- Purple Company Banner -->
  <div class="company-banner">
    <div class="banner-meta">
      <div class="meta-line"><span class="m-lbl">رقم الفاتورة / Inv No:</span> <strong class="m-val mono">${inv.invoiceNumber || inv.id?.slice(0,10) || "—"}</strong></div>
      <div class="meta-line"><span class="m-lbl">تاريخ الإصدار / Date:</span> <strong class="m-val mono">${inv.date || "—"}</strong></div>
      <div class="meta-line"><span class="m-lbl">طريقة الدفع / Terms:</span> <strong class="m-val">${payLabel}</strong></div>
      ${inv.dueDate ? `<div class="meta-line"><span class="m-lbl">الاستحقاق / Due:</span> <strong class="m-val mono">${inv.dueDate}</strong></div>` : ""}
    </div>
    ${logoHtml}
    <div class="banner-co">
      <h2>${COMPANY.name || "شركة نظم الإمداد المتطورة"}</h2>
      <div class="co-id-row">
        <span class="co-pill">الرقم الضريبي (VAT): <strong class="mono">${COMPANY.vatNumber || "314996148100003"}</strong></span>
        <span class="co-pill">السجل التجاري (CR): <strong class="mono">${COMPANY.crNumber || "7054969006"}</strong></span>
      </div>
    </div>
  </div>

  <!-- ZATCA National Address Tabs/Cards for Seller & Buyer -->
  <div class="parties-container">
    <!-- Seller Box -->
    <div class="party-card seller">
      <div class="party-head">
        <span class="party-title">🏢 بيانات المورد / البائع (Seller)</span>
      </div>
      <div class="party-name">${COMPANY.name || "شركة نظم الإمداد المتطورة"}</div>
      <div class="party-ids-row">
        <div class="id-badge">
          <span class="id-lbl">السجل التجاري (CR):</span>
          <span class="id-val mono">${COMPANY.crNumber || "7054969006"}</span>
        </div>
        <div class="id-badge vat-badge">
          <span class="id-lbl">الرقم الضريبي (VAT):</span>
          <span class="id-val mono">${COMPANY.vatNumber || "314996148100003"}</span>
        </div>
      </div>
      <div class="addr-compact-grid">
        <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${COMPANY.city || "ينبع"}</span></div>
        <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${COMPANY.district || "حي النزهة"}</span></div>
        <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${COMPANY.street || "عامر الشعبي"}</span></div>
        <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${COMPANY.buildingNo || "7480"}</span></div>
        <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${COMPANY.zip || "46424"}</span></div>
        <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${COMPANY.additionalNo || "3180"}</span></div>
        <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${COMPANY.country || "المملكة العربية السعودية"}</span></div>
      </div>
    </div>

    <!-- Buyer Box -->
    <div class="party-card buyer">
      <div class="party-head">
        <span class="party-title">👤 بيانات العميل / المشتري (Buyer)</span>
        <span class="${cust.vatNumber ? 'badge-vat' : 'badge-novat'}">${cust.vatNumber ? 'مسجل ضريبياً' : 'غير مسجل'}</span>
      </div>
      <div class="party-name">${cust.name || "عميل نقدي"}</div>
      <div class="party-ids-row">
        <div class="id-badge">
          <span class="id-lbl">السجل / الهوية:</span>
          <span class="id-val mono">${cust.crNumber || "—"}</span>
        </div>
        <div class="id-badge vat-badge">
          <span class="id-lbl">الرقم الضريبي (VAT):</span>
          <span class="id-val mono" style="color:${cust.vatNumber ? '#1e1b4b' : '#6b7280'};">${cust.vatNumber || "غير مسجل"}</span>
        </div>
      </div>
      <div class="addr-compact-grid">
        <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${cust.city || "—"}</span></div>
        <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${cust.district || "—"}</span></div>
        <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${cust.street || "—"}</span></div>
        <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${cust.buildingNo || "—"}</span></div>
        <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${cust.postalCode || "—"}</span></div>
        <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${cust.additionalNo || "—"}</span></div>
        <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${cust.country || "المملكة العربية السعودية"}</span></div>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table class="invoice-table">
    <thead>
      <tr>
        <th style="width:32px;">م<br><span style="font-size:8px;">#</span></th>
        <th>الصنف والبيان<br><span style="font-size:8px;">Description & Packaging</span></th>
        <th style="width:55px;">الكمية<br><span style="font-size:8px;">Qty</span></th>
        <th style="width:75px;">سعر الوحدة<br><span style="font-size:8px;">Unit Price</span></th>
        <th style="width:65px;">الخصم<br><span style="font-size:8px;">Discount</span></th>
        <th style="width:80px;">الخاضع<br><span style="font-size:8px;">Taxable Base</span></th>
        <th style="width:50px;">النسبة<br><span style="font-size:8px;">Rate</span></th>
        <th style="width:75px;">الضريبة<br><span style="font-size:8px;">VAT (15%)</span></th>
        <th style="width:85px;">الإجمالي<br><span style="font-size:8px;">Total (Inc. VAT)</span></th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>

  <!-- Bottom Layout: QR + Notes + Totals -->
  <div class="bottom-layout">
    <!-- QR Code -->
    <div class="qr-box">
      ${qrImgDataUrl ? `<img src="${qrImgDataUrl}" width="86" height="86" style="display:block;margin:0 auto;border-radius:4px;" alt="ZATCA QR" />` : `<div id="qrcode-container" style="width:86px;height:86px;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#94a3b8;">ZATCA QR</div>`}
      <span>ZATCA</span>
    </div>

    <!-- Notes & Metadata -->
    <div class="notes-box">
      <div>
        <div class="notes-title">📌 شروط وملاحظات / Notes & Terms:</div>
        <div class="notes-body">
          <div>${inv.notes || "البضاعة المباعة لا ترد ولا تستبدل إلا بموجب الفاتورة الأصلية وخلال المدة النظامية."}</div>
          <div class="official-receipt-notice">
            <div class="notice-ar">⚠️ لا تعتبر هذه الفاتورة محصلة إلا بموجب سند قبض رسمي</div>
            <div class="notice-en">The invoice is not considered collected except with an official receipt</div>
          </div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
        ${inv.repName ? `<span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:2px 8px; font-size:10px; font-weight:600;">👤 المندوب: <b>${inv.repName}</b></span>` : ""}
        ${inv.warehouseName ? `<span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:2px 8px; font-size:10px; font-weight:600;">🏢 المستودع: <b>${inv.warehouseName}</b></span>` : ""}
      </div>
    </div>

    <!-- Totals Table -->
    <div class="totals-table-wrap">
      <table class="totals-table">
        <tr>
          <td class="lbl">المجموع قبل الضريبة (Taxable):</td>
          <td class="val">${fmtC(subtotal)}</td>
        </tr>
        ${discAmt > 0 ? `
        <tr>
          <td class="lbl" style="color:#dc2626;">إجمالي الخصم (Discount):</td>
          <td class="val" style="color:#dc2626;">- ${fmtC(discAmt)}</td>
        </tr>` : ""}
        <tr>
          <td class="lbl">ضريبة القيمة المضافة (15% VAT):</td>
          <td class="val">${fmtC(vatAmt)}</td>
        </tr>
        <tr class="grand">
          <td class="lbl">الإجمالي شامل الضريبة (Grand Total):</td>
          <td class="val font-bold">${fmtC(total)}</td>
        </tr>

      </table>
    </div>
  </div>

  <!-- Signatures & Acceptance Strip -->
  <div class="signatures-grid">
    <div class="sig-box">
      <div class="sig-title">✍️ استلام واعتماد العميل (Received & Accepted By):</div>
      <div class="sig-line">
        <span>اسم المستلم: ______________________</span>
        <span>التوقيع والختم: ________________</span>
      </div>
    </div>
    <div class="sig-box">
      <div class="sig-title">🚚 تسليم المندوب / السائق (Delivered By):</div>
      <div class="sig-line">
        <span>المندوب: <b>${inv.repName || "سائق المؤسسة"}</b></span>
        <span>التوقيع: ____________________</span>
      </div>
    </div>
  </div>

  <!-- Footer Bar -->
  <div class="footer-bar">
    <div>📞 الهاتف: <b>${COMPANY.phone || "0549141648"}</b></div>
    <div>شكراً لتعاملكم معنا — ${COMPANY.name || "شركة نظم الإمداد المتطورة"}</div>
  </div>
</div>

<script src="js/utils/qrcode.min.js"><\/script>
<script>
  try {
    new QRCode(document.getElementById("qrcode-container"), {
      text: "${qrBase64}",
      width: 86,
      height: 86,
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {
    document.getElementById("qrcode-container").innerHTML = '<div style="font-size:9px;color:#ef4444;">تعذر توليد QR</div>';
  }
</script>
</body>
</html>`;

  // ── 4. Show inside app as overlay with robust top toolbar for Mobile Print & PDF ──
  let overlay = document.getElementById("inv-print-overlay");
  if (overlay) overlay.remove();

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  overlay = document.createElement("div");
  overlay.id = "inv-print-overlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.85);
    display:flex;flex-direction:column;align-items:center;
    overflow-y:auto;padding:0;
  `;

  // Top Sticky Bar for Print & PDF Controls
  const topBar = document.createElement("div");
  topBar.style.cssText = `
    position:sticky;top:0;z-index:100000;width:100%;max-width:860px;
    background:#1e1b4b;padding:10px 16px;display:flex;gap:10px;
    align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.3);
    border-bottom:1px solid rgba(255,255,255,0.1);
  `;
  topBar.innerHTML = `
    <div style="color:#fff;font-weight:800;font-size:13px;font-family:'Cairo',sans-serif;display:flex;align-items:center;gap:6px;">
      📄 <span>معاينة الفاتورة للطباعة و PDF</span>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <button id="overlay-do-print" style="
        background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;
        border-radius:10px;padding:8px 16px;font-weight:700;font-size:13px;
        font-family:'Cairo',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;
        box-shadow:0 2px 8px rgba(79,70,229,0.4);
      ">🖨️ طباعة / حفظ PDF</button>
      <button id="overlay-open-tab" style="
        background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);
        border-radius:10px;padding:8px 12px;font-weight:700;font-size:12px;
        font-family:'Cairo',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px;
      ">🔗 فتح بنافذة مستقلة</button>
      <button id="overlay-close-btn" style="
        background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.4);
        border-radius:10px;padding:8px 14px;font-weight:800;font-size:14px;
        cursor:pointer;
      ">✕</button>
    </div>
  `;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
    width:100%;max-width:860px;min-height:calc(100vh - 55px);
    border:none;background:#eef2ff;flex-shrink:0;
  `;
  iframe.src = blobUrl;

  overlay.appendChild(topBar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  const doPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch(e) {
      console.warn("Iframe print blocked, opening window...", e);
      const w = window.open(blobUrl, '_blank');
      if (w) {
        w.focus();
        setTimeout(() => w.print(), 500);
      }
    }
  };

  topBar.querySelector("#overlay-do-print").onclick = doPrint;
  topBar.querySelector("#overlay-open-tab").onclick = () => {
    const w = window.open(blobUrl, '_blank');
    if (w) {
      w.focus();
      setTimeout(() => w.print(), 500);
    }
  };
  topBar.querySelector("#overlay-close-btn").onclick = () => {
    overlay.remove();
    URL.revokeObjectURL(blobUrl);
  };

  iframe.onload = () => {
    try {
      const iwin = iframe.contentWindow;
      const printBtn = iwin.document.querySelector(".btn-print");
      if (printBtn) printBtn.onclick = doPrint;
      const closeBtn = iwin.document.querySelector(".btn-close");
      if (closeBtn) closeBtn.onclick = () => { overlay.remove(); URL.revokeObjectURL(blobUrl); };
    } catch(e) {}
  };
  } catch (err) {
    console.error("Error in printInvoiceData:", err);
    if (typeof toast === "function") toast("⚠️ خطأ في تجهيز طباعة الفاتورة: " + err.message, "err");
    else alert("⚠️ خطأ في تجهيز الطباعة: " + err.message);
  }
};

// ════════════════════════════════════════
// عرض تفاصيل الفاتورة (Modal كامل)
// ════════════════════════════════════════
window.viewInvoice = async (id) => {
  // إظهار مؤشر التحميل
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "inv-view-loading";
  loadingOverlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.4);
    display:flex; align-items:center; justify-content:center; z-index:9999;
  `;
  loadingOverlay.innerHTML = `<div style="background:var(--bg-0,#fff);border-radius:16px;padding:24px 32px;text-align:center;">
    <div class="spin" style="margin:0 auto 10px;"></div>
    <div style="font-family:'Cairo',sans-serif;font-size:13px;color:var(--t2);">جاري التحميل…</div>
  </div>`;
  document.body.appendChild(loadingOverlay);

  try {
    // جلب الفاتورة من Firestore
    const snap = await getDoc(doc(db, `companies/${COID}/salesInvoices`, id));
    if (!snap.exists()) { toast("الفاتورة غير موجودة", "err"); loadingOverlay.remove(); return; }
    const inv = _normalizeInvoice({ id: snap.id, ...snap.data() });
    window._viewedInv = inv; // ✅ Save to global scope for printInvoiceData

    loadingOverlay.remove();

    // — بناء جدول الأصناف —
    const linesHtml = (inv.lines || []).map((l, i) => {
      const name = l.name || l.productName || "";
      const qty  = l.qty || 0;
      const price = l.price !== undefined ? l.price : (l.unitPrice !== undefined ? l.unitPrice : 0);
      const total = l.total !== undefined ? l.total : (qty * price);
      return `
      <tr style="border-bottom:1px solid var(--border,#e5e7eb);">
        <td style="padding:10px 8px;font-size:13px;color:var(--t1);">${i + 1}</td>
        <td style="padding:10px 8px;font-size:13px;font-weight:600;color:var(--t1);">${name}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:center;color:var(--t1);">${qty}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:center;color:var(--t2);">${fmtC(price)}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:left;font-weight:700;color:var(--brand);">${fmtC(total)}</td>
      </tr>`;
    }).join("");

    const payLabel = { cash: "نقدي 💵", credit: "آجل 📋", transfer: "تحويل 🏦", cheque: "شيك 📄" }[inv.paymentMethod] || inv.paymentMethod || "—";
    const invDate  = inv.date || new Date().toLocaleDateString("ar-SA");

    // — بناء الـ Modal بأسلوب مضمون —
    const existing = document.getElementById("inv-view-overlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "inv-view-overlay";
    overlay.className = "modal-overlay active";
    // استخدم inline styles كاملة لضمان الظهور بغض النظر عن CSS
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9998;
      background:rgba(0,0,0,0.6);
      display:flex; flex-direction:column; align-items:stretch;
      overflow-y:auto; padding:0;
      direction:rtl; font-family:'Cairo',sans-serif;
    `;
    overlay.innerHTML = `
    <div style="
      background:var(--bg-0,#fff);
      width:100%; min-height:100dvh;
      font-family:'Cairo',sans-serif;
      direction:rtl;
      display:flex; flex-direction:column;
    ">
      <!-- رأس Modal -->
      <div style="
        background:linear-gradient(135deg,var(--brand,#6C63FF),var(--brand-2,#8B5CF6));
        padding:16px 16px env(safe-area-inset-top,12px);
        position:sticky; top:0; z-index:10;
        display:flex; align-items:center; justify-content:space-between;
      ">
        <button onclick="this.closest('.modal-overlay').remove()" style="
          background:rgba(255,255,255,.2); border:none; border-radius:50%;
          width:36px; height:36px; font-size:18px; cursor:pointer; color:#fff;
          display:flex; align-items:center; justify-content:center;
        ">✕</button>
        <div style="text-align:center; flex:1;">
          <div style="color:#fff; font-size:16px; font-weight:800;">${inv.invoiceNumber || id.slice(0,8)}</div>
          <div style="color:rgba(255,255,255,.8); font-size:11px;">${invDate}</div>
        </div>
        <button onclick="printInvoiceData(window._viewedInv)" style="
          background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.4);
          border-radius:10px; padding:6px 12px; color:#fff; font-size:12px;
          font-family:'Cairo',sans-serif; font-weight:700; cursor:pointer;
          display:flex; align-items:center; gap:4px;
        ">🖨️ PDF</button>
      </div>

      <!-- بيانات المنشأة -->
      <div style="
        background:var(--bg-1,#f8f9fa);
        padding:14px 16px;
        border-bottom:1px solid var(--border,#e5e7eb);
        text-align:center;
      ">
        <div style="font-size:15px; font-weight:800; color:var(--t1);">${COMPANY.name || "إدهام للمواد الغذائية"}</div>
        ${COMPANY.address ? `<div style="font-size:11px;color:var(--t2);margin-top:2px;">${COMPANY.address}${COMPANY.city ? " — " + COMPANY.city : ""}</div>` : ""}
        <div style="display:flex; justify-content:center; gap:16px; margin-top:4px; flex-wrap:wrap;">
          ${COMPANY.phone    ? `<span style="font-size:10px;color:var(--t2);">📞 ${COMPANY.phone}</span>` : ""}
          ${COMPANY.vatNumber? `<span style="font-size:10px;color:var(--t2);">ر.ض: ${COMPANY.vatNumber}</span>` : ""}
        </div>
        <div style="font-size:10px;color:var(--t2);margin-top:2px;">فاتورة ضريبية مبسّطة — ${inv.invoiceNumber || id}</div>
      </div>

      <!-- بيانات العميل والمندوب -->
      <div style="padding:14px 16px; border-bottom:1px solid var(--border,#e5e7eb);">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div style="background:var(--bg-1,#f8f9fa); border-radius:12px; padding:10px 12px;">
            <div style="font-size:10px;color:var(--t2);margin-bottom:4px;">👤 العميل</div>
            <div style="font-size:13px;font-weight:700;color:var(--t1);">${inv.customerName || "—"}</div>
          </div>
          <div style="background:var(--bg-1,#f8f9fa); border-radius:12px; padding:10px 12px;">
            <div style="font-size:10px;color:var(--t2);margin-bottom:4px;">🚗 المندوب</div>
            <div style="font-size:13px;font-weight:700;color:var(--t1);">${inv.repName || REP.name || "—"}</div>
          </div>
          <div style="background:var(--bg-1,#f8f9fa); border-radius:12px; padding:10px 12px;">
            <div style="font-size:10px;color:var(--t2);margin-bottom:4px;">💳 طريقة الدفع</div>
            <div style="font-size:13px;font-weight:700;color:var(--t1);">${payLabel}</div>
          </div>
          <div style="background:var(--bg-1,#f8f9fa); border-radius:12px; padding:10px 12px;">
            <div style="font-size:10px;color:var(--t2);margin-bottom:4px;">📅 التاريخ</div>
            <div style="font-size:13px;font-weight:700;color:var(--t1);">${invDate}</div>
          </div>
        </div>
      </div>

      <!-- جدول الأصناف -->
      <div style="padding:14px 16px; flex:1;">
        <div style="font-size:13px;font-weight:800;color:var(--t1);margin-bottom:10px;">📦 الأصناف</div>
        <div style="overflow-x:auto; border-radius:12px; border:1px solid var(--border,#e5e7eb);">
          <table style="width:100%; border-collapse:collapse; font-family:'Cairo',sans-serif;">
            <thead>
              <tr style="background:var(--bg-1,#f8f9fa);">
                <th style="padding:8px;font-size:11px;color:var(--t2);text-align:right;">#</th>
                <th style="padding:8px;font-size:11px;color:var(--t2);text-align:right;">الصنف</th>
                <th style="padding:8px;font-size:11px;color:var(--t2);text-align:center;">كمية</th>
                <th style="padding:8px;font-size:11px;color:var(--t2);text-align:center;">سعر</th>
                <th style="padding:8px;font-size:11px;color:var(--t2);text-align:left;">إجمالي</th>
              </tr>
            </thead>
            <tbody>${linesHtml || `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--t2);">لا توجد أصناف</td></tr>`}</tbody>
          </table>
        </div>
      </div>

      <!-- الإجماليات -->
      <div style="
        padding:14px 16px;
        background:var(--bg-1,#f8f9fa);
        border-top:1px solid var(--border,#e5e7eb);
      ">
        <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:var(--t2);">
          <span>المجموع قبل الضريبة</span>
          <span style="font-weight:600;color:var(--t1);">${fmtC(inv.subtotal || 0)} ر.س</span>
        </div>
        ${(inv.discountAmount || 0) > 0 ? `
        <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:var(--t2);">
          <span>الخصم</span>
          <span style="font-weight:600;color:#ef4444;">- ${fmtC(inv.discountAmount)} ر.س</span>
        </div>` : ""}
        <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:var(--t2);">
          <span>ضريبة القيمة المضافة 15%</span>
          <span style="font-weight:600;color:var(--t1);">${fmtC(inv.vatAmount || 0)} ر.س</span>
        </div>
        <div style="
          display:flex; justify-content:space-between; padding:10px 12px;
          background:linear-gradient(135deg,var(--brand,#6C63FF),var(--brand-2,#8B5CF6));
          border-radius:12px; margin-top:8px;
        ">
          <span style="color:#fff; font-size:15px; font-weight:800;">الإجمالي المستحق</span>
          <span style="color:#fff; font-size:17px; font-weight:900;">${fmtC(inv.total || 0)} ر.س</span>
        </div>
      </div>

      <!-- أزرار الإجراءات -->
      <div style="
        padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 12px);
        background:var(--bg-0,#fff);
        border-top:1px solid var(--border,#e5e7eb);
        display:flex; gap:10px;
      ">
        <button onclick="window.shareWhatsApp('${inv.invoiceNumber}','${inv.customerName}',${inv.total})" style="
          flex:1; padding:13px; border-radius:12px;
          background:#25D366; border:none; color:#fff;
          font-family:'Cairo',sans-serif; font-size:14px; font-weight:700;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
        ">💬 واتساب</button>
        <button onclick="printInvoiceData(window._viewedInv)" style="
          flex:1; padding:13px; border-radius:12px;
          background:linear-gradient(135deg,var(--brand,#6C63FF),var(--brand-2,#8B5CF6));
          border:none; color:#fff;
          font-family:'Cairo',sans-serif; font-size:14px; font-weight:700;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
        ">🖨️ PDF</button>
        <button onclick="window.editRepInvoice('${inv.id}')" style="flex:1;padding:13px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#fff;font-family:'Cairo',sans-serif;font-size:14px;font-weight:700;cursor:pointer;">✏️ تعديل</button>
      </div>
    </div>`;

    // حفظ الفاتورة في متغير عالمي للطباعة
    window._viewedInv = inv;

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);

  } catch(e) {
    loadingOverlay.remove();
    toast(e.message, "err");
  }
};


// ════════════════════════════════════════
// تعديل فاتورة المندوب
// ════════════════════════════════════════
window.editRepInvoice = async (invId) => {
  document.querySelectorAll(".modal-overlay").forEach(m => m.remove());
  const loadEl = document.createElement("div");
  loadEl.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;";
  loadEl.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px 32px;text-align:center;font-family:Cairo,sans-serif;"><div>جاري التحميل...</div></div>';
  document.body.appendChild(loadEl);
  try {
    const snap = await getDoc(doc(db, `companies/${COID}/salesInvoices`, invId));
    if (!snap.exists()) { toast("الفاتورة غير موجودة","err"); loadEl.remove(); return; }
    const inv = _normalizeInvoice({ id: snap.id, ...snap.data() });

    // Ensure customers are loaded for this rep
    if (!_custCache.length) {
      const custSnap = await getDocs(query(COL("customers"), where("repId", "==", REP.id)));
      _custCache = custSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>(a.name||"").localeCompare(b.name||"","ar"));
    }

    // Build the dropdown options list
    let optionsHtml = _custCache.map(c => `
      <option value="${c.id}" ${c.id === inv.customerId ? "selected" : ""}>${c.name}</option>
    `).join("");
    if (inv.customerId && !_custCache.some(c => c.id === inv.customerId)) {
      optionsHtml = `<option value="${inv.customerId}" selected>${inv.customerName || "عميل غير معروف"}</option>` + optionsHtml;
    }

    loadEl.remove();
    window._editingInv = JSON.parse(JSON.stringify(inv));
    window._originalInv = JSON.parse(JSON.stringify(inv)); // ✅ Save copy of original invoice
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.style.cssText = "align-items:flex-start;overflow-y:auto;padding:0;z-index:10000;";
    overlay.innerHTML = `
    <div style="background:#fff;width:100%;min-height:100dvh;font-family:'Cairo',sans-serif;direction:rtl;display:flex;flex-direction:column;">
      <div style="background:linear-gradient(135deg,#f59e0b,#f97316);padding:16px;position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;">
        <button onclick="this.closest('.modal-overlay').remove()" style="background:rgba(255,255,255,.2);border:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;color:#fff;">&#x2715;</button>
        <div style="color:#fff;font-size:16px;font-weight:800;">&#x270F;&#xFE0F; تعديل الفاتورة — ${inv.invoiceNumber||invId.slice(0,8)}</div>
      </div>
      <div style="padding:16px;border-bottom:1px solid #f1f5f9;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">العميل</div>
            <select id="edit-cust-id" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Cairo',sans-serif;">
              ${optionsHtml}
            </select></div>
          <div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">طريقة الدفع</div>
            <select id="edit-pay" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Cairo',sans-serif;"
              onchange="
                const v = this.value;
                const paidEl = document.getElementById('edit-paid');
                const paidLbl = document.getElementById('edit-paid-lbl');
                if(v==='credit'){ paidEl.value='0'; paidEl.disabled=true; }
                else if(v==='cash'){ paidEl.value=''; paidEl.disabled=false; }
                else if(v==='partial'){ paidEl.value=''; paidEl.disabled=false; }
                else { paidEl.value=''; paidEl.disabled=false; }
              ">
              <option value="cash" ${(inv.paymentMethod==="cash"||(!inv.paymentMethod))?"selected":""}>نقدي</option>
              <option value="credit" ${inv.paymentMethod==="credit"?"selected":""}>آجل</option>
              <option value="partial" ${(inv.paymentMethod==="partial"||inv.remainingAmount>0&&inv.paidAmount>0&&inv.paymentMethod!=="credit"&&inv.paymentMethod!=="cash")?"selected":""}>جزئي (دفع جزء الآن)</option>
              <option value="transfer" ${inv.paymentMethod==="transfer"?"selected":""}>تحويل بنكي</option>
              <option value="cheque" ${inv.paymentMethod==="cheque"?"selected":""}>شيك</option>
            </select></div>
          <div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">خصم ر.س</div>
            <input id="edit-disc" type="number" min="0" step="0.5" value="${inv.discountAmount||0}"
              style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Cairo',sans-serif;" oninput="window._editRecalc()"/></div>
          <div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">المبلغ المدفوع (للآجل)</div>
            <input id="edit-paid" type="number" min="0" step="0.5" placeholder="الإجمالي" value="${inv.paidAmount !== undefined ? inv.paidAmount : (inv.paymentMethod === 'cash' ? inv.total : 0)}"
              style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Cairo',sans-serif;"/></div>
          <div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">التاريخ</div>
            <input id="edit-date" type="date" value="${inv.date||""}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Cairo',sans-serif;"/></div>
        </div>
      </div>
      <div style="padding:16px;flex:1;">
        <div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:8px;">📦 الأصناف</div>
        <div style="display:flex;gap:8px;padding:6px 0;border-bottom:2px solid #e2e8f0;margin-bottom:4px;">
          <div style="width:24px;"></div>
          <div style="flex:2;font-size:11px;color:#94a3b8;font-weight:700;">الصنف</div>
          <div style="width:58px;font-size:11px;color:#94a3b8;font-weight:700;text-align:center;">كمية</div>
          <div style="width:76px;font-size:11px;color:#94a3b8;font-weight:700;text-align:center;">سعر</div>
          <div style="width:76px;font-size:11px;color:#94a3b8;font-weight:700;">إجمالي</div>
        </div>
        <div id="edit-lines-wrap"></div>
      </div>
      <div style="padding:12px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;padding:4px 0;"><span>المجموع قبل الضريبة</span><span id="edit-sub" style="font-weight:700;">${fmtC(inv.subtotal||0)} ر.س</span></div>
        <div id="edit-discrow" style="display:${(inv.discountAmount||0)>0?"flex":"none"};justify-content:space-between;font-size:13px;color:#ef4444;padding:4px 0;"><span>الخصم</span><span id="edit-discamt" style="font-weight:700;">- ${fmtC(inv.discountAmount||0)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;padding:4px 0;"><span>ضريبة 15%</span><span id="edit-vat" style="font-weight:700;">${fmtC(inv.vatAmount||0)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;padding:10px 14px;background:linear-gradient(135deg,#1e1b4b,#6366f1);color:#fff;border-radius:12px;margin-top:8px;">
          <span>الإجمالي</span><span id="edit-tot">${fmtC(inv.total||0)} ر.س</span>
        </div>
      </div>
      <div style="padding:12px 16px calc(env(safe-area-inset-bottom,0px)+12px);background:#fff;border-top:1px solid #e2e8f0;">
        <button onclick="window._saveEditedInvoice('${invId}')"
          style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#fff;font-family:'Cairo',sans-serif;font-size:15px;font-weight:800;cursor:pointer;">
          &#x1F4BE; حفظ التعديلات
        </button>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    window._renderEditLines = () => {
      const lines = window._editingInv.lines || [];
      const wrap = document.getElementById("edit-lines-wrap");
      if (!wrap) return;
      wrap.innerHTML = lines.map((l, i) => {
        const name = l.name || l.productName || "";
        const qty = l.qty || 0;
        const price = l.price !== undefined ? l.price : (l.unitPrice || 0);
        const total = l.total !== undefined ? l.total : (qty * price);
        return `
          <div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9;">
            <button onclick="window._deleteEditLine(${i})" style="background:none;border:none;color:#ef4444;font-size:16px;cursor:pointer;padding:4px 8px;margin:0;">🗑️</button>
            <div style="flex:2;font-size:13px;font-weight:600;color:#1e293b;">${name}</div>
            <input type="number" class="edit-qty" data-idx="${i}" min="0.01" step="any" value="${qty}"
              style="width:58px;border:1px solid #e2e8f0;border-radius:8px;padding:6px;font-size:13px;font-family:Cairo,sans-serif;text-align:center;"
              oninput="window._editRecalc()"/>
            <input type="number" class="edit-price" data-idx="${i}" min="0" step="0.01" value="${price}"
              style="width:76px;border:1px solid #e2e8f0;border-radius:8px;padding:6px;font-size:13px;font-family:Cairo,sans-serif;text-align:center;"
              oninput="window._editRecalc()"/>
            <div class="edit-linetot" data-idx="${i}" style="width:76px;text-align:left;font-size:13px;font-weight:700;color:#1e1b4b;">${fmtC(total)}</div>
          </div>`;
      }).join("");
    };

    window._deleteEditLine = (idx) => {
      const lines = window._editingInv.lines || [];
      lines.splice(idx, 1);
      window._renderEditLines();
      window._editRecalc();
    };

    window._renderEditLines();

    window._editRecalc = () => {
      const lines = window._editingInv.lines || [];
      document.querySelectorAll(".edit-qty").forEach(el => {
        const i = parseInt(el.dataset.idx);
        if (lines[i]) lines[i].qty = parseFloat(el.value)||0;
      });
      document.querySelectorAll(".edit-price").forEach(el => {
        const i = parseInt(el.dataset.idx);
        if (lines[i]) { 
          lines[i].price = parseFloat(el.value)||0; 
          lines[i].unitPrice = lines[i].price;
          lines[i].total = lines[i].qty * lines[i].price; 
        }
      });
      document.querySelectorAll(".edit-linetot").forEach(el => {
        const i = parseInt(el.dataset.idx);
        if (lines[i]) el.textContent = fmtC(lines[i].total);
      });
      const rawSub = lines.reduce((s,l)=>s+(l.total||0),0);
      const da = Math.min(parseFloat(document.getElementById("edit-disc")?.value||0), rawSub);
      const afterD = rawSub - da;
      const vat = afterD * 0.15;
      const tot = afterD + vat;
      if(document.getElementById("edit-sub"))     document.getElementById("edit-sub").textContent     = fmtC(rawSub)+" ر.س";
      if(document.getElementById("edit-discamt")) document.getElementById("edit-discamt").textContent = "- "+fmtC(da)+" ر.س";
      if(document.getElementById("edit-discrow")) document.getElementById("edit-discrow").style.display = da>0?"flex":"none";
      if(document.getElementById("edit-vat"))     document.getElementById("edit-vat").textContent     = fmtC(vat)+" ر.س";
      if(document.getElementById("edit-tot"))     document.getElementById("edit-tot").textContent     = fmtC(tot)+" ر.س";
      Object.assign(window._editingInv,{subtotal:rawSub,discountPct:0,discountAmount:da,vatAmount:vat,total:tot});
    };

    window._saveEditedInvoice = async (id) => {
      if (window._isSavingEditedInvoice) return;
      window._isSavingEditedInvoice = true;
      let editLoadEl = null;
      try {
        window._editRecalc();
        const orig = window._originalInv;
        if (!orig) { 
          toast("خطأ: لم يتم العثور على الفاتورة الأصلية", "err"); 
          window._isSavingEditedInvoice = false;
          return; 
        }

        const selectedPay = document.getElementById("edit-pay")?.value || "cash";
        const total = window._editingInv.total || 0;

        // === تحديد طريقة الدفع والمبالغ بناءً على اختيار المستخدم ===
        let paidAmount = 0;
        let remainingAmount = 0;
        let finalPaymentMethod = selectedPay;

        if (selectedPay === "credit") {
          paidAmount = 0;
          remainingAmount = total;
          finalPaymentMethod = "credit";
        } else if (selectedPay === "partial") {
          paidAmount = parseFloat(document.getElementById("edit-paid")?.value) || 0;
          if (isNaN(paidAmount) || paidAmount < 0) paidAmount = 0;
          if (paidAmount > total) paidAmount = total;
          remainingAmount = Math.round((total - paidAmount) * 100) / 100;
          if (remainingAmount <= 0.01) { finalPaymentMethod = "cash"; remainingAmount = 0; }
          else finalPaymentMethod = "partial";
        } else {
          // نقدي / تحويل / شيك
          const rawPaid = document.getElementById("edit-paid")?.value;
          paidAmount = (rawPaid !== undefined && rawPaid !== "") ? parseFloat(rawPaid) : total;
          if (isNaN(paidAmount) || paidAmount < 0) paidAmount = total;
          if (paidAmount > total) paidAmount = total;
          remainingAmount = Math.round((total - paidAmount) * 100) / 100;
          if (remainingAmount <= 0.01) remainingAmount = 0;
          if (remainingAmount > 0) finalPaymentMethod = "partial";
          else finalPaymentMethod = selectedPay;
        }

        const invDocId  = id;                            // Document ID in Firestore
        const invNumber = orig.invoiceNumber || id;      // Invoice number (used in JEs + cash transactions)
        
        // Read new customer details from select dropdown
        const custSelect = document.getElementById("edit-cust-id");
        const customerId = custSelect?.value || orig.customerId || null;
        const customerName = custSelect?.options[custSelect.selectedIndex]?.text || orig.customerName || "";

        editLoadEl = document.createElement("div");
        editLoadEl.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;";
        editLoadEl.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px 32px;text-align:center;font-family:Cairo,sans-serif;"><div class="spin" style="margin:0 auto 10px;"></div><div>جاري حفظ التعديلات وتحديث الحسابات والمخزون...</div></div>';
        document.body.appendChild(editLoadEl);

        const updLines = window._editingInv.lines.map(l => ({
          productId:   l.productId,
          name:        l.name || l.productName || "",
          productName: l.name || l.productName || "",
          qty:         l.qty,
          price:       l.price !== undefined ? l.price : (l.unitPrice || 0),
          unitPrice:   l.price !== undefined ? l.price : (l.unitPrice || 0),
          discount:    0,
          total:       l.total !== undefined ? l.total : (l.qty * (l.price || l.unitPrice || 0))
        }));

         const upd = {
          customerName:    customerName,
          customerId:      customerId,
          paymentMethod:   finalPaymentMethod,
          date:            document.getElementById("edit-date")?.value || window._editingInv.date,
          lines:           updLines,
          subtotal:        window._editingInv.subtotal,
          discountPct:     window._editingInv.discountPct || 0,
          discountAmount:  window._editingInv.discountAmount || 0,
          vatAmount:       window._editingInv.vatAmount,
          totalVat:        window._editingInv.vatAmount,
          total:           total,
          totalWithVat:    total,
          paidAmount:      paidAmount,
          remainingAmount: remainingAmount,
          status:          remainingAmount > 0.01 ? "posted" : "paid",
          costCenterId:    orig.costCenterId || REP.costCenterId || null,
          costCenterName:  orig.costCenterName || REP.costCenterName || null,
          updatedAt:       new Date().toISOString(),
          updatedBy:       REP?.name || "المندوب",
        };

        // === STEP 1: Revert Customer Balance → Save invoice → Apply new Balance ===
        await runTransaction(db, async (tx) => {
          // Revert old receivable from old customer
          const oldRemaining = parseFloat(orig.remainingAmount || 0);
          const oldCustomerId = orig.customerId || null;
          if (oldRemaining > 0.01 && oldCustomerId) {
            // ✅ FIX: use set+merge to avoid failure when customer doc doesn't exist
            tx.set(doc(COL("customers"), oldCustomerId),
              { balance: increment(-oldRemaining) },
              { merge: true });
          }

          tx.set(doc(db, `companies/${COID}/salesInvoices`, invDocId), upd, { merge: true });

          // Apply new receivable to new customer
          const newCustomerId = upd.customerId || null;
          if (upd.remainingAmount > 0.01 && newCustomerId) {
            // ✅ FIX: use set+merge to avoid failure when customer doc doesn't exist
            tx.set(doc(COL("customers"), newCustomerId),
              { balance: increment(upd.remainingAmount) },
              { merge: true });
          }
        });

        // === STEP 1.5: Revert old stock & Apply new stock via adjustStock (creates stock transactions for detailed ledger) ===
        try {
          const { adjustStock } = await import("../utils/db.js");
          const nowTs = Date.now();
          // 1. Revert old stock (add it back)
          if (orig.warehouseId && orig.lines) {
            for (let idx = 0; idx < orig.lines.length; idx++) {
              const line = orig.lines[idx];
              if (!line.productId || !line.qty) continue;
              try {
                await adjustStock(orig.warehouseId, line.productId, line.qty, {
                  type: "sale_cancel",
                  sourceType: "salesInvoice",
                  sourceId: invDocId,
                  txDocId: `tx_sale_cancel_edit_${invDocId}_${nowTs}_${idx}_${line.productId}`,
                  documentNumber: invNumber,
                  invoiceNumber: invNumber,
                  allowNegative: true, // safe on reverse
                  productName: line.name || line.productName || "",
                  notes: `إرجاع كمية التعديل — فاتورة ${invNumber}`
                });
              } catch (lineErr) {
                console.warn(`Failed to reverse old stock for line ${line.productId} on edit:`, lineErr.message);
              }
            }
          }
          // 2. Apply new stock (deduct it)
          if (orig.warehouseId && updLines.length > 0) {
            for (let idx = 0; idx < updLines.length; idx++) {
              const line = updLines[idx];
              if (!line.productId || !line.qty) continue;
              try {
                await adjustStock(orig.warehouseId, line.productId, -line.qty, {
                  type: "sale_out",
                  sourceType: "salesInvoice",
                  sourceId: invDocId,
                  txDocId: `tx_sale_out_edit_${invDocId}_${nowTs}_${idx}_${line.productId}`,
                  documentNumber: invNumber,
                  invoiceNumber: invNumber,
                  allowNegative: false,
                  productName: line.name || line.productName || "",
                  notes: `خصم كمية التعديل — فاتورة ${invNumber}`
                });
              } catch (lineErr) {
                console.warn(`Failed to apply new stock for line ${line.productId} on edit:`, lineErr.message);
              }
            }
          }
        } catch (stockErr) {
          console.error("Failed to adjust stock for edited invoice:", stockErr.message);
        }

        // === STEP 2: Revert Old Cash Transactions from rep cash box ===
        const oldPaid = parseFloat(orig.paidAmount || 0);
        const oldWasCash = ["cash", "partial", "transfer", "cheque"].includes(orig.paymentMethod) && oldPaid > 0.01;
        if (oldWasCash && orig.repId) {
          try {
            for (const searchId of [...new Set([invNumber, invDocId])]) {
              const txnsSnap = await getDocs(query(COL("cashTransactions"), where("sourceId", "==", searchId)));
              for (const docOfTxn of txnsSnap.docs) {
                const txnAmount = parseFloat(docOfTxn.data().amount || 0);
                await runTransaction(db, async (tx) => {
                  tx.delete(docOfTxn.ref);
                  const boxRef = doc(db, `companies/${COID}/cashBoxes`, `cashBox_${orig.repId}`);
                  tx.update(boxRef, { balance: increment(-txnAmount) });
                });
              }
            }
          } catch (ctxnErr) {
            console.warn("Failed to reverse cash transaction:", ctxnErr.message);
          }
        }

        // === STEP 2.5: Revert Old Auto-Generated Receipts ===
        if (oldWasCash) {
          try {
            for (const searchId of [...new Set([invNumber, invDocId])]) {
              const rcptSnap = await getDocs(query(COL("receipts"), where("sourceInvoiceId", "==", searchId)));
              for (const rcptDoc of rcptSnap.docs) {
                const rcptId = rcptDoc.id;
                // Delete receipt's linked journal entry if exists
                try {
                  const jeSnap = await getDocs(query(COL("journalEntries"), where("sourceId", "==", rcptId)));
                  for (const jeDoc of jeSnap.docs) {
                    await runTransaction(db, async (tx) => { tx.delete(jeDoc.ref); });
                  }
                } catch(jeErr) {
                  console.warn("Failed to delete receipt JE on rep edit:", jeErr.message);
                }
                // Delete receipt
                await runTransaction(db, async (tx) => { tx.delete(rcptDoc.ref); });
                console.log(`[Receipt Cleanup] Deleted receipt ${rcptId} for edited rep invoice ${invNumber}`);
              }
            }
          } catch(rcptErr) {
            console.warn("Failed to revert old receipts on rep edit:", rcptErr.message);
          }
        }

        // === STEP 3: Add New Cash Transaction & Receipt (only if there is a cash component) ===
        let editRcptRef = null;
        const newHasCash = ["cash", "partial", "transfer", "cheque"].includes(finalPaymentMethod) && paidAmount > 0.01;
        if (newHasCash && orig.repId) {
          try {
            const { autoCashTransaction } = await import("../utils/db.js");
            const methodLabel = finalPaymentMethod === "partial" ? "جزئي" : finalPaymentMethod === "cash" ? "نقدي" : finalPaymentMethod;
            await autoCashTransaction({
              type: "in",
              amount: paidAmount,
              notes: `مبيعات ${methodLabel} (تعديل) — فاتورة ${invNumber}`,
              sourceType: "salesInvoice",
              sourceId: invNumber,
              date: upd.date,
              cashBoxId: `cashBox_${orig.repId}`
            });

            // CREATE REAL RECEIPT FOR SINGLE SOURCE OF TRUTH
            editRcptRef = doc(COL("receipts"));
            await setDoc(editRcptRef, {
               date: upd.date,
               amount: paidAmount,
               entityType: "customer",
               targetId: upd.customerId || null,
               accountName: upd.customerName || "عميل نقدي",
               method: finalPaymentMethod || "cash",
               sourceId: `cashBox_${orig.repId}`,
               sourceName: "صندوق المندوب",
               notes: `دفعة محصلة للفاتورة ${invNumber} (تعديل)`,
               createdAt: serverTimestamp(),
               updatedAt: serverTimestamp(),
               isAutoGenerated: true,
               sourceInvoiceId: invDocId || invNumber
            });
            console.log(`[Receipt] Auto-generated receipt for edited invoice ${invNumber}`);
          } catch (cashBoxErr) {
            console.warn("Failed to log new cash transaction or receipt:", cashBoxErr.message);
          }
        }

        // === STEP 4: Delete old Journal Entries (search by invoiceNumber and docId) ===
        try {
          for (const searchId of [...new Set([invNumber, invDocId])]) {
            const jeSnap = await getDocs(query(COL("journalEntries"), where("sourceId", "==", searchId)));
            for (const jeDoc of jeSnap.docs) {
              await runTransaction(db, async (tx) => { tx.delete(jeDoc.ref); });
            }
          }
        } catch (jeErr) {
          console.warn("Failed to delete journal entries:", jeErr.message);
        }

        // === STEP 5: Re-generate Accounting Journal Entry ===
        try {
          const { autoSalesJE } = await import("../utils/accounting-engine.js");
          const { rebuildCoaBalances } = await import("../utils/db.js");
          const whSnap = await getDocs(COL("warehouses"));
          const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          const costs = await Promise.all(updLines.map(async (l) => {
            const prodSnap = await getDoc(doc(db, `companies/${COID}/products`, l.productId));
            if (prodSnap.exists()) {
              const pd = prodSnap.data();
              return (pd.averageCost || pd.costPrice || pd.purchasePrice || 0) * l.qty;
            }
            return 0;
          }));
          const totalCost = costs.reduce((s, c) => s + c, 0);

          const jeId = await autoSalesJE({
            id:              invNumber,
            invoiceNumber:   invNumber,
            date:            upd.date,
            customerName:    upd.customerName,
            customerId:      customerId,
            customerType:    orig.origCustomerType || orig.customerType || "retail",
            repId:           orig.repId   || null,
            salesRepId:      orig.repId   || null,
            paymentMethod:   upd.paymentMethod,
            subtotal:        upd.subtotal,
            taxAmount:       upd.vatAmount,
            total:           total,
            paidAmount:      paidAmount,
            remainingAmount: remainingAmount,
            totalCost:       totalCost,
            warehouseId:     orig.warehouseId,
            sourceType:      "salesInvoice",
          }, { displayName: orig.repName, uid: orig.repId }, warehouses);

          await updateDoc(doc(db, `companies/${COID}/salesInvoices`, invDocId), {
            journalEntryId: jeId,
            totalCost:      Math.round(totalCost * 100) / 100
          });

          // إنشاء قيد سند القبض التلقائي لتسوية ذمة العميل وتحصيل المبلغ في صندوق المندوب
          if (editRcptRef && customerId && paidAmount > 0) {
            try {
              const { autoCustomerPaymentJE } = await import("../utils/accounting-engine.js");
              const rcptJeId = await autoCustomerPaymentJE({
                id: editRcptRef.id,
                date: upd.date,
                amount: paidAmount,
                customerId: customerId,
                customerName: upd.customerName,
                repId: orig.repId,
                sourceId: `cashBox_${orig.repId}`,
                paymentMethod: finalPaymentMethod || "cash",
                invoiceNumber: invNumber,
                costCenterId: upd.costCenterId || orig.costCenterId || null,
                costCenterName: upd.costCenterName || orig.costCenterName || null,
              }, { displayName: orig.repName, uid: orig.repId });

              await updateDoc(editRcptRef, {
                journalEntryId: rcptJeId,
                updatedAt: serverTimestamp()
              });
              console.log(`[Receipt JE Edit] Auto-created JE for edited receipt ${editRcptRef.id}: ${rcptJeId}`);
            } catch (rcptJeErr) {
              console.warn("Failed to create JE for edited auto-receipt:", rcptJeErr.message);
            }
          }

          // إعادة بناء أرصدة شجرة الحسابات كاملةً بعد كل تعديل
          await rebuildCoaBalances();
        } catch (aeErr) {
          console.warn("Accounting automation failed after edit:", aeErr.message);
        }

        editLoadEl.remove();
        window._isSavingEditedInvoice = false;
        const payLabel = finalPaymentMethod === "cash" ? "نقدي ✅" :
                         finalPaymentMethod === "credit" ? "آجل ✅" :
                         `جزئي: ${paidAmount.toFixed(2)} ر.س نقداً + ${remainingAmount.toFixed(2)} ر.س آجل ✅`;
        toast(`تم حفظ التعديلات — ${payLabel}`, "ok");
        overlay.remove();
        navigate("dashboard");
      } catch(err) {
        window._isSavingEditedInvoice = false;
        if(editLoadEl) editLoadEl.remove();
        toast("خطأ: " + err.message, "err");
      }
    };
  } catch(err) { loadEl.remove(); toast(err.message,"err"); }
};
function fmtC(n) { return Number(n||0).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function esc(s)  { return String(s||"").replace(/'/g,"\\'").replace(/"/g,"&quot;"); }
const CAT_COLORS = [
  ["#FF6B6B","#FF8E53"], // red-orange (meat)
  ["#FFD93D","#FF9F00"], // yellow-amber (oils)
  ["#4ECDC4","#44A08D"], // teal (rice/grains)
  ["#A8E6CF","#3CB371"], // green (vegetables)
  ["#C9B1FF","#8B5CF6"], // purple (dairy)
  ["#FFB3C6","#FF6B9D"], // pink (sweets)
  ["#74B9FF","#0984E3"], // blue (water/drinks)
  ["#FFEAA7","#FDCB6E"], // light yellow (bread)
  ["#FD79A8","#E84393"], // hot pink (ice cream)
  ["#55EFC4","#00B894"], // mint (canned)
  ["#E17055","#D63031"], // dark red (spices)
  ["#81ECEC","#00CEC9"], // cyan (eggs/misc)
];

// ─── Icon lookup table ───
const ICON_RULES = [
  { keys: ["لحم","دجاج","فراخ","مواشي","لحوم","أجبنة","جبن","جبنة","شيدر","موزاريلا"], icon: "🥩", colorIdx: 0 },
  { keys: ["زيت","سمن","مارجرين","زيوت","دهن"], icon: "🫙", colorIdx: 1 },
  { keys: ["أرز","ارز","بسمتي","رز","دقيق","طحين"], icon: "🍚", colorIdx: 2 },
  { keys: ["خضار","خضروات","فاكه","فواكه","طازجة","طازج"], icon: "🥬", colorIdx: 3 },
  { keys: ["حليب","لبن","يوغرت","قشطة","البان"], icon: "🥛", colorIdx: 4 },
  { keys: ["سكر","حلوى","بسكويت","كيك","شوكولاتة","شوكولا"], icon: "🍫", colorIdx: 5 },
  { keys: ["ماء","مياه","عصير","مشروب","ريدبول","بيبسي","كوكا","ببسي"], icon: "🧃", colorIdx: 6 },
  { keys: ["خبز","عيش","صاموله"], icon: "🍞", colorIdx: 7 },
  { keys: ["آيس","مثلجات","ايس","ايسكريم"], icon: "🍦", colorIdx: 8 },
  { keys: ["معلب","علب","طماطم","فاصوليا","حمص","عدس","معجون","معكرونة","نودل"], icon: "🥫", colorIdx: 9 },
  { keys: ["بهار","توابل","هيل","كمون","كركم","فلفل"], icon: "🌶️", colorIdx: 10 },
  { keys: ["بيض"], icon: "🥚", colorIdx: 11 },
  { keys: ["شاي","قهوة","نسكافيه"], icon: "☕", colorIdx: 1 },
  { keys: ["تمر","رطب","عجوة"], icon: "🫘", colorIdx: 1 },
  { keys: ["عسل"], icon: "🍯", colorIdx: 1 },
  { keys: ["مكسرات","شيبس","بوشيات","كريكر"], icon: "🌰", colorIdx: 5 },
  { keys: ["صابون","منظف","تنظيف","سائل"], icon: "🧼", colorIdx: 6 },
  { keys: ["مناديل","ورق"], icon: "🧻", colorIdx: 11 },
];

// Get color gradient for a category
function catColor(categoryName, fallbackIdx = 0) {
  const n = (categoryName || "").toLowerCase();
  for (let i = 0; i < ICON_RULES.length; i++) {
    if (ICON_RULES[i].keys.some(k => n.includes(k))) {
      const ci = ICON_RULES[i].colorIdx ?? (i % CAT_COLORS.length);
      return CAT_COLORS[ci % CAT_COLORS.length];
    }
  }
  return CAT_COLORS[fallbackIdx % CAT_COLORS.length];
}

function prodIcon(p) {
  if (p.imageUrl) return `<img src="${p.imageUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;" onerror="this.outerHTML='&#128230;'" />`;
  const text = ((p.categoryName || "") + " " + (p.name || "")).toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keys.some(k => text.includes(k))) return rule.icon;
  }
  return "📦";
}

function catEmoji(name) {
  const n = (name || "").toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keys.some(k => n.includes(k))) return rule.icon;
  }
  if (n.includes("ألبان")||n.includes("لبن")) return "🥛";
  if (n.includes("مشروبات")) return "🧃";
  if (n.includes("معلبات")) return "🥫";
  if (n.includes("مجمدات")) return "🧊";
  return "📦";
}


/* ══════════════════════════════════
   CUSTOMER LEDGER & PAYMENTS (كشف الحساب والتحصيل)
   ══════════════════════════════════ */

window.viewCustomerLedger = async (customerId) => {
  const cust = _custCache.find(c => c.id === customerId);
  if (!cust) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "ledger-overlay";
  overlay.innerHTML = `
  <div class="modal-sheet" id="ledger-sheet" style="display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px 10px; border-bottom:1px solid var(--border); flex-shrink:0;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">📊</span>
        <div>
          <div style="font-size:16px; font-weight:900; color:var(--t1); line-height:1.2;">كشف حساب العميل</div>
          <div style="font-size:11px; color:var(--t3); margin-top:2px;">${cust.name} ${cust.code ? `• كود: ${cust.code}` : ''}</div>
        </div>
      </div>
      <button onclick="document.getElementById('ledger-overlay')?.remove()" style="background:var(--bg-2); border:1px solid var(--border); font-size:16px; color:var(--t2); cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;" title="إغلاق">✕</button>
    </div>

    <div class="sheet-body" style="flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:12px; gap:10px;">
      <!-- Customer Card Info -->
      <div class="ledger-cust-card" style="background:var(--bg-2); border-radius:14px; padding:12px 14px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="min-width:160px;">
          <div style="font-size:16px; font-weight:900; color:var(--t1); line-height:1.3;">${cust.name}</div>
          <div style="display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:4px; font-size:12px; color:var(--t2);">
            ${cust.phone ? `<a href="tel:${cust.phone}" style="color:var(--brand); text-decoration:none; font-weight:700; display:inline-flex; align-items:center; gap:4px;">📞 ${cust.phone}</a>` : '<span style="color:var(--t3);">📞 بلا هاتف</span>'}
            ${cust.code ? `<span style="background:var(--bg-3); padding:2px 7px; border-radius:6px; font-size:10.5px; font-family:monospace; font-weight:700;">#${cust.code}</span>` : ''}
          </div>
        </div>
        <div class="ledger-cust-bal-box" style="text-align:left; background:var(--bg-1); padding:8px 14px; border-radius:12px; border:1.5px solid var(--border); min-width:130px;">
          <div style="font-size:10px; color:var(--t3); font-weight:700;" id="ledger-bal-label">صافي الرصيد الحالي</div>
          <div id="ledger-cust-balance" style="font-size:18px; font-weight:900; color:var(--brand);">${fmtC(cust.balance || 0)} <span style="font-size:11px; font-weight:600;">ر.س</span></div>
        </div>
      </div>

      <!-- Action buttons (4 Grid Buttons) -->
      <div class="ledger-action-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
        <button class="btn-primary ledger-action-btn" onclick="openCollectPaymentModal('${cust.id}')" style="padding:8px 3px; font-size:11px; min-height:42px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; margin:0; border-radius:10px;">
          <span style="font-size:15px;">💵</span><span style="font-weight:800;">تحصيل دفعة</span>
        </button>
        <button class="btn-secondary ledger-action-btn" onclick="printCustomerLedgerA4('${cust.id}')" style="padding:8px 3px; font-size:11px; min-height:42px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; margin:0; border-radius:10px; background:var(--bg-2); border:1px solid var(--border);">
          <span style="font-size:15px;">📄</span><span style="font-weight:800;">كشف PDF</span>
        </button>
        <button class="btn-secondary ledger-action-btn" onclick="shareLedgerWhatsApp('${cust.id}')" style="padding:8px 3px; font-size:11px; min-height:42px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; margin:0; border-radius:10px; background:var(--bg-2); border:1px solid var(--border);">
          <span style="font-size:15px;">💬</span><span style="font-weight:800;">واتساب</span>
        </button>
        <button class="btn-secondary ledger-action-btn" onclick="printLedgerThermal('${cust.id}')" style="padding:8px 3px; font-size:11px; min-height:42px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; margin:0; border-radius:10px; background:var(--bg-2); border:1px solid var(--border);">
          <span style="font-size:15px;">🖨️</span><span style="font-weight:800;">حراري</span>
        </button>
      </div>

      <!-- Ledger Container (Stats, Filters & Table) -->
      <div id="ledger-list-container">
        <div style="text-align:center; padding:32px;"><span class="spin" style="margin:0 auto 10px;"></span>جاري تجهيز كشف الحساب وتدقيق الحركات…</div>
      </div>
    </div>
    <div style="padding:8px 14px; border-top:1px solid var(--border); flex-shrink:0; display:flex; justify-content:space-between; align-items:center; background:var(--bg-2);">
      <div style="font-size:10.5px; color:var(--t3);">💡 اضغط <b>كشف PDF</b> لحفظ أو طباعة كشف حساب معتمد</div>
      <button class="btn-secondary" onclick="document.getElementById('ledger-overlay')?.remove()" style="margin:0; padding:5px 16px; font-size:12px; font-weight:800; border-radius:8px;">إغلاق</button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  // Now query Firestore for ledger details
  try {
    const companyId = COID;

    // ── قراءة من كلا المصدرين: repInvoices + salesInvoices + مرتجعات + إيصالات ──
    const [repInvSnap, saleInvSnap, retSnap, rcptSnap, repRcptSnap, freshCustSnap] = await Promise.all([
      getDocs(query(collection(db, `companies/${companyId}/repInvoices`),   where("customerId", "==", cust.id), limit(100))),
      getDocs(query(collection(db, `companies/${companyId}/salesInvoices`), where("customerId", "==", cust.id), limit(100))),
      getDocs(query(collection(db, `companies/${companyId}/salesReturns`),  where("customerId", "==", cust.id), limit(100))),
      getDocs(query(collection(db, `companies/${companyId}/receipts`),      where("targetId",   "==", cust.id), limit(100))),
      getDocs(query(collection(db, `companies/${companyId}/repReceipts`),   where("customerId", "==", cust.id), limit(100))),
      getDoc(doc(db, `companies/${companyId}/customers`, cust.id))
    ]);

    if (freshCustSnap && freshCustSnap.exists()) {
      const freshData = freshCustSnap.data();
      Object.assign(cust, freshData);
    }

    const txs = [];
    let totalInvoices = 0;
    let totalPayments = 0;
    let totalReturns  = 0;
    const seenInvs    = new Set();
    const seenRcpts   = new Set();

    // 1. فواتير المندوب
    repInvSnap.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled" || data.status === "void") return;
      const invNum = data.invoiceNumber || d.id;
      if (seenInvs.has(invNum)) return;
      seenInvs.add(invNum);

      const amt = parseFloat(data.totalWithVat ?? data.total ?? data.grandTotal ?? 0);
      const pm  = (data.paymentMethod || data.paymentType || "").toLowerCase();
      const isCash = pm === "cash" || pm === "نقدي";
      totalInvoices += amt;
      txs.push({
        date:  data.date || data.invoiceDate || "",
        type:  "invoice",
        isCash,
        ref:   invNum,
        amount: amt,
        desc:  isCash ? "فاتورة نقدية" : "فاتورة مبيعات (آجل)",
        timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000
                 : data.invoiceDate ? new Date(data.invoiceDate).getTime()
                 : new Date(data.date || 0).getTime(),
      });
    });

    // 2. فواتير البرنامج الرئيسي
    saleInvSnap.docs.forEach(d => {
      const data = _normalizeInvoice({ id: d.id, ...d.data() });
      if (data.status === "cancelled") return;
      const invNum = data.invoiceNumber || d.id;
      if (seenInvs.has(invNum)) return;
      seenInvs.add(invNum);

      const tot = parseFloat(data.totalWithVat ?? data.total ?? 0);
      const pm  = (data.paymentMethod || data.paymentType || "").toLowerCase();
      const isCash = pm === "cash" || pm === "نقدي";
      totalInvoices += tot;
      txs.push({
        date:  data.date || "",
        type:  "invoice",
        isCash,
        ref:   invNum,
        amount: tot,
        desc:  isCash ? "فاتورة نقدية" : "فاتورة مبيعات (آجل)",
        timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(data.date || 0).getTime(),
      });
    });

    // 3. مرتجعات المبيعات
    retSnap.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled" || data.status === "void") return;
      const amt = parseFloat(data.totalWithVat ?? data.total ?? 0);
      totalReturns += amt;
      txs.push({
        date:  data.date || "",
        type:  "return",
        isCash: false,
        ref:   data.creditNoteNumber || d.id.slice(0, 10),
        amount: -amt,
        desc:  "مرتجع مبيعات",
        timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(data.date || 0).getTime(),
      });
    });

    // 4. سندات القبض (receipts)
    rcptSnap.docs.forEach(d => {
      const data = d.data();
      if (data.entityType !== "customer" && data.type !== "customer" && data.entityType !== undefined) return;
      const rNum = data.receiptNumber || data.voucherNumber || d.id;
      if (seenRcpts.has(rNum)) return;
      seenRcpts.add(rNum);

      const amt = parseFloat(data.amount || 0);
      totalPayments += amt;
      txs.push({
        date:  data.date || "",
        type:  "payment",
        isCash: false,
        ref:   data.receiptNumber || data.voucherNumber || `RV-${d.id.slice(0, 8).toUpperCase()}`,
        amount: -amt,
        desc:  data.notes ? data.notes : `سند قبض (${data.method === "cash" || data.paymentMethod === "cash" ? "نقدي" : "شبكة"})`,
        timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(data.date || 0).getTime(),
      });
    });

    // 5. سندات قبض المندوب (repReceipts)
    repRcptSnap.docs.forEach(d => {
      const data = d.data();
      const rNum = data.receiptNumber || d.id;
      if (seenRcpts.has(rNum)) return;
      seenRcpts.add(rNum);

      const amt = parseFloat(data.amount || 0);
      totalPayments += amt;
      txs.push({
        date:  data.date || "",
        type:  "payment",
        isCash: false,
        ref:   data.receiptNumber || `RV-${d.id.slice(0, 6).toUpperCase()}`,
        amount: -amt,
        desc:  data.notes ? data.notes : `سند قبض مندوب (${data.method === "cash" || data.paymentMethod === "cash" ? "نقدي" : "شبكة"})`,
        timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(data.date || 0).getTime(),
      });
    });

    // ── حساب الرصيد الصحيح = فواتير − مدفوعات − مرتجعات ──
    const computedBalance = Math.round((totalInvoices - totalPayments - totalReturns) * 100) / 100;

    // تحديث الرصيد المعروض في كرت العميل
    const balEl = document.getElementById("ledger-cust-balance");
    const balLbl = document.getElementById("ledger-bal-label");
    if (balEl) {
      const isPositive = computedBalance > 0;
      balEl.textContent = `${fmtC(computedBalance)} ر.س`;
      balEl.style.color = isPositive ? "#dc2626" : computedBalance < 0 ? "#16a34a" : "var(--t2)";
      if (balLbl) balLbl.textContent = isPositive ? "مديونية (مستحق عليه)" : computedBalance < 0 ? "رصيد دائن (له)" : "لا توجد مديونية";
    }

    // مزامنة رصيد العميل فورياً إن وُجد فارق
    if (Math.abs((cust.balance || 0) - computedBalance) > 0.05) {
      cust.balance = computedBalance;
      const cached = _custCache.find(c => c.id === cust.id);
      if (cached) cached.balance = computedBalance;
      updateDoc(doc(db, `companies/${companyId}/customers`, cust.id), { balance: computedBalance }).catch(() => {});
      const outerCardBal = document.querySelector(`[data-cust-id="${cust.id}"] .cust-bal`);
      if (outerCardBal) outerCardBal.textContent = `${fmtC(computedBalance)} ر.س`;
    }

    const listContainer = document.getElementById("ledger-list-container");
    if (!listContainer) return;

    if (txs.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center; padding:32px; color:var(--t3); font-size:13px; background:var(--bg-2); border-radius:12px; border:1px solid var(--border);">لا توجد حركات مسجلة لهذا العميل حتى الآن</div>`;
      return;
    }

    // ── حساب الرصيد التراكمي (تصاعدي من الأقدم للأحدث) ──
    const sortedAsc = [...txs].sort((a, b) => a.timestamp - b.timestamp);
    let running = 0;
    sortedAsc.forEach(tx => {
      running = Math.round((running + tx.amount) * 100) / 100;
      tx.runningBalance = running;
    });

    // حفظ في الذاكرة لتسهيل التصدير والطباعة
    window._currentCustomerLedger = {
      cust,
      txs: sortedAsc,
      totalInvoices,
      totalPayments,
      totalReturns,
      computedBalance
    };

    // الترتيب التنازلي للعرض (الأحدث أولاً)
    const sortedDesc = [...sortedAsc].reverse();

    const invCount = txs.filter(t => t.type === "invoice").length;
    const rcptCount = txs.filter(t => t.type === "payment").length;
    const retCount = txs.filter(t => t.type === "return").length;

    listContainer.innerHTML = `
      <!-- 4 KPI Stat Cards -->
      <div class="ledger-kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(135px, 1fr)); gap:8px;">
        <div class="ledger-kpi-card" style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--t3); margin-bottom:4px;">
            <span>🧾 إجمالي الفواتير</span>
            <span style="font-size:9.5px; background:rgba(37,99,235,0.12); color:#2563eb; padding:1px 6px; border-radius:4px; font-weight:800;">مدين</span>
          </div>
          <div style="font-size:14px; font-weight:900; color:#2563eb;">${fmtC(totalInvoices)} <span style="font-size:10px;">ر.س</span></div>
          <div style="font-size:9.5px; color:var(--t3); margin-top:2px;">${invCount} فاتورة</div>
        </div>

        <div class="ledger-kpi-card" style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--t3); margin-bottom:4px;">
            <span>💵 المقبوضات</span>
            <span style="font-size:9.5px; background:rgba(22,163,74,0.12); color:#16a34a; padding:1px 6px; border-radius:4px; font-weight:800;">دائن</span>
          </div>
          <div style="font-size:14px; font-weight:900; color:#16a34a;">${fmtC(totalPayments)} <span style="font-size:10px;">ر.س</span></div>
          <div style="font-size:9.5px; color:var(--t3); margin-top:2px;">${rcptCount} سند تحصيل</div>
        </div>

        <div class="ledger-kpi-card" style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--t3); margin-bottom:4px;">
            <span>↩️ المرتجعات</span>
            <span style="font-size:9.5px; background:rgba(217,119,6,0.12); color:#d97706; padding:1px 6px; border-radius:4px; font-weight:800;">دائن</span>
          </div>
          <div style="font-size:14px; font-weight:900; color:#d97706;">${fmtC(totalReturns)} <span style="font-size:10px;">ر.س</span></div>
          <div style="font-size:9.5px; color:var(--t3); margin-top:2px;">${retCount} مرتجع</div>
        </div>

        <div class="ledger-kpi-card" style="background:${computedBalance > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)'}; border:1.5px solid ${computedBalance > 0 ? '#ef4444' : '#10b981'}; border-radius:12px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--t3); margin-bottom:4px;">
            <span>⚖️ صافي الرصيد</span>
            <span style="font-size:9.5px; background:${computedBalance > 0 ? '#ef4444' : '#10b981'}; color:#fff; padding:1px 6px; border-radius:4px; font-weight:800;">${computedBalance > 0 ? 'مستحق' : 'مسدد'}</span>
          </div>
          <div style="font-size:14.5px; font-weight:900; color:${computedBalance > 0 ? '#dc2626' : '#16a34a'};">${fmtC(computedBalance)} <span style="font-size:10px;">ر.س</span></div>
          <div style="font-size:9.5px; color:var(--t2); margin-top:2px; font-weight:700;">${computedBalance > 0 ? 'مستحق بذمة العميل' : computedBalance < 0 ? 'رصيد دائن للعميل' : 'الحساب مصفى'}</div>
        </div>
      </div>

      <!-- Quick Filter Tabs & Mobile View Switcher -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:2px;">
        <div style="display:flex; align-items:center; gap:6px; overflow-x:auto; padding-bottom:2px; flex:1;">
          <button class="ledger-tab active" onclick="window.filterLedgerTab('all', this)">الكل (${txs.length})</button>
          <button class="ledger-tab" onclick="window.filterLedgerTab('invoice', this)">🧾 الفواتير (${invCount})</button>
          <button class="ledger-tab" onclick="window.filterLedgerTab('payment', this)">💵 السندات (${rcptCount})</button>
          ${retCount > 0 ? `<button class="ledger-tab" onclick="window.filterLedgerTab('return', this)">↩️ المرتجعات (${retCount})</button>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button id="ledger-view-mode-btn" class="ledger-tab ledger-view-toggle" onclick="window.toggleLedgerViewMode(this)" title="تبديل طريقة العرض">📊 عرض جدول</button>
          <div style="font-size:10.5px; color:var(--t3); white-space:nowrap;">الحركات: <b>${txs.length}</b></div>
        </div>
      </div>

      <!-- 1. Mobile Cards View (Optimized for Phones) -->
      <div class="ledger-cards-wrap" id="ledger-cards-container">
        ${sortedDesc.map(tx => {
          const isDebit  = tx.amount > 0;
          const sign     = isDebit ? "+" : "";
          const amtColor = isDebit ? "#dc2626" : "#16a34a";
          const balColor = tx.runningBalance > 0 ? "#dc2626" : tx.runningBalance < 0 ? "#16a34a" : "var(--t2)";

          let badgeHtml = "";
          if (tx.type === "invoice") {
            badgeHtml = tx.isCash
              ? `<span style="background:rgba(16,185,129,0.12); color:#059669; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">🟢 نقدي</span>`
              : `<span style="background:rgba(37,99,235,0.12); color:#2563eb; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">🔵 فاتورة آجلة</span>`;
          } else if (tx.type === "payment") {
            badgeHtml = `<span style="background:rgba(16,185,129,0.12); color:#059669; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">💵 سند تحصيل</span>`;
          } else if (tx.type === "return") {
            badgeHtml = `<span style="background:rgba(217,119,6,0.12); color:#d97706; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">↩️ مرتجع</span>`;
          }

          return `
            <div class="ledger-card-item ledger-row" data-type="${tx.type}">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px;">
                  ${badgeHtml}
                  <span style="font-family:monospace; font-size:11px; color:var(--t1); font-weight:800;">${tx.ref}</span>
                </div>
                <span style="font-size:10.5px; color:var(--t3); font-family:monospace;">${tx.date}</span>
              </div>
              ${tx.desc ? `<div style="font-size:11px; color:var(--t2); line-height:1.3;">${tx.desc}</div>` : ''}
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border); padding-top:7px; margin-top:2px;">
                <div>
                  <span style="font-size:10px; color:var(--t3);">المبلغ: </span>
                  <span style="font-weight:900; color:${amtColor}; font-size:13px; font-family:monospace;">
                    ${sign}${fmtC(Math.abs(tx.amount))} <span style="font-size:9.5px; font-weight:600;">ر.س</span>
                  </span>
                </div>
                <div style="text-align:left;">
                  <span style="font-size:10px; color:var(--t3);">الرصيد: </span>
                  <span style="font-weight:900; color:${balColor}; font-size:13px; font-family:monospace;">
                    ${fmtC(tx.runningBalance)} <span style="font-size:9.5px; font-weight:600;">ر.س</span>
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- 2. Desktop Table View -->
      <div class="ledger-table-wrap" style="overflow-x:auto; border:1px solid var(--border); border-radius:12px; background:var(--bg-1);">
        <table style="width:100%; min-width:520px; border-collapse:collapse; font-size:11px; text-align:right;">
          <thead>
            <tr style="background:var(--bg-2); border-bottom:2px solid var(--border); color:var(--t2); font-weight:700;">
              <th style="padding:10px 8px; width:85px;">التاريخ</th>
              <th style="padding:10px 8px;">نوع الحركة والبيان</th>
              <th style="padding:10px 8px; width:110px;">المرجع</th>
              <th style="padding:10px 8px; text-align:left; width:100px;">المبلغ</th>
              <th style="padding:10px 8px; text-align:left; width:110px;">الرصيد بعد الحركة</th>
            </tr>
          </thead>
          <tbody id="ledger-table-body">
            ${sortedDesc.map(tx => {
              const isDebit  = tx.amount > 0;
              const sign     = isDebit ? "+" : "";
              const amtColor = isDebit ? "#dc2626" : "#16a34a";
              const balColor = tx.runningBalance > 0 ? "#dc2626" : tx.runningBalance < 0 ? "#16a34a" : "var(--t2)";

              let badgeHtml = "";
              if (tx.type === "invoice") {
                if (tx.isCash) {
                  badgeHtml = `<span style="background:rgba(16,185,129,0.12); color:#059669; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">🟢 فاتورة نقدية</span>`;
                } else {
                  badgeHtml = `<span style="background:rgba(37,99,235,0.12); color:#2563eb; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">🔵 فاتورة آجلة</span>`;
                }
              } else if (tx.type === "payment") {
                badgeHtml = `<span style="background:rgba(16,185,129,0.12); color:#059669; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">💵 سند تحصيل</span>`;
              } else if (tx.type === "return") {
                badgeHtml = `<span style="background:rgba(217,119,6,0.12); color:#d97706; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">↩️ مرتجع مبيعات</span>`;
              }

              return `
                <tr class="ledger-row" data-type="${tx.type}" style="border-bottom:1px solid var(--border); vertical-align:middle;">
                  <td style="padding:10px 8px; color:var(--t2); white-space:nowrap; font-size:10.5px; font-family:monospace;">${tx.date}</td>
                  <td style="padding:10px 8px;">
                    <div>${badgeHtml}</div>
                    <div style="font-size:10px; color:var(--t3); margin-top:2px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${tx.desc}">${tx.desc}</div>
                  </td>
                  <td style="padding:10px 8px; font-family:monospace; font-size:10.5px; color:var(--t1); font-weight:700;">${tx.ref}</td>
                  <td style="padding:10px 8px; text-align:left; font-weight:800; color:${amtColor}; font-size:11.5px; white-space:nowrap; font-family:monospace;">
                    ${sign}${fmtC(Math.abs(tx.amount))} <span style="font-size:9px; font-weight:600;">ر.س</span>
                  </td>
                  <td style="padding:10px 8px; text-align:left; font-weight:900; color:${balColor}; font-size:12px; white-space:nowrap; font-family:monospace; background:rgba(0,0,0,0.015);">
                    ${fmtC(tx.runningBalance)} <span style="font-size:9px; font-weight:600;">ر.س</span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div id="ledger-empty-filter" style="display:none; text-align:center; padding:24px; color:var(--t3); font-size:12px;">لا توجد حركات مطابقة لهذا الفلتر</div>
    `;
  } catch (err) {
    const listContainer = document.getElementById("ledger-list-container");
    if (listContainer) {
      listContainer.innerHTML = `<div class="error-box" style="margin:0;">⚠️ خطأ في تحميل كشف الحساب: ${err.message}</div>`;
    }
    console.error("[viewCustomerLedger]", err);
  }
};

window.toggleLedgerViewMode = (btn) => {
  const sheet = document.getElementById("ledger-sheet");
  if (!sheet) return;
  const isTable = sheet.classList.toggle("ledger-show-table");
  if (btn) btn.textContent = isTable ? "📱 عرض بطاقات" : "📊 عرض جدول";
};

window.filterLedgerTab = (filterType, btnEl) => {
  document.querySelectorAll('.ledger-tab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const rows = document.querySelectorAll('.ledger-row');
  let visibleCount = 0;
  rows.forEach(r => {
    if (filterType === 'all' || r.getAttribute('data-type') === filterType) {
      r.style.display = '';
      visibleCount++;
    } else {
      r.style.display = 'none';
    }
  });

  const emptyEl = document.getElementById('ledger-empty-filter');
  if (emptyEl) {
    emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
  }
};

window.shareLedgerWhatsApp = async (customerId) => {
  const cust = _custCache.find(c => c.id === customerId);
  if (!cust) return;
  toast("جاري تجهيز كشف الحساب للمشاركة...", "warn");

  const ledger = window._currentCustomerLedger;
  const txs = ledger?.txs || [];
  const latestTxs = [...txs].reverse().slice(0, 8);

  let msg = `*📋 كشف حساب عميل 📋*\n`;
  msg += `🏢 *${COMPANY.name}*\n`;
  msg += `─────────────────\n`;
  msg += `👤 *العميل:* ${cust.name}\n`;
  if (cust.code) msg += `🔢 *كود العميل:* ${cust.code}\n`;
  if (cust.phone) msg += `📞 *الهاتف:* ${cust.phone}\n`;
  msg += `📅 *تاريخ الاستخراج:* ${new Date().toISOString().split('T')[0]}\n`;
  msg += `─────────────────\n`;
  msg += `🧾 *إجمالي الفواتير:* ${fmtC(ledger?.totalInvoices || 0)} ر.س\n`;
  msg += `💵 *إجمالي المقبوضات:* ${fmtC(ledger?.totalPayments || 0)} ر.س\n`;
  if (ledger?.totalReturns) msg += `↩️ *إجمالي المرتجعات:* ${fmtC(ledger.totalReturns)} ر.س\n`;
  msg += `💰 *صافي الرصيد المستحق:* *${fmtC(cust.balance || 0)} ر.س*\n`;
  msg += `─────────────────\n`;
  msg += `*📊 آخر الحركات المسجلة:*\n`;

  latestTxs.forEach((t) => {
    const icon = t.type === "invoice" ? (t.isCash ? "🟢" : "🧾") : t.type === "return" ? "↩️" : "💵";
    const label = t.type === "invoice" ? (t.isCash ? "فاتورة نقدية" : "فاتورة مبيعات") : t.type === "return" ? "مرتجع مبيعات" : "سند قبض";
    const sign = t.amount > 0 ? "+" : "-";
    msg += `${icon} *${t.date}* | ${label}\n`;
    msg += `   مرجع: ${t.ref} | مبلغ: ${sign}${fmtC(Math.abs(t.amount))} ر.س\n`;
    msg += `   الرصيد بعد الحركة: ${fmtC(t.runningBalance)} ر.س\n`;
  });

  msg += `─────────────────\n`;
  msg += `شكراً لتعاملكم معنا 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
};

window.printLedgerThermal = async (customerId) => {
  const cust = _custCache.find(c => c.id === customerId);
  if (!cust) return;
  toast("جاري تجهيز كشف الحساب للطباعة الحرارية...", "warn");

  const ledger = window._currentCustomerLedger;
  const txs = ledger?.txs || [];
  const latestTxs = [...txs].reverse().slice(0, 15);

  const divider = `<div class="dv">--------------------------------</div>`;
  const rows = latestTxs.map(t => {
    const sign = t.amount > 0 ? "+" : "-";
    const label = t.type === "invoice" ? (t.isCash ? "فاتورة نقد" : "فاتورة آجل") : t.type === "return" ? "مرتجع" : "سند قبض";
    return `
      <tr>
        <td>${t.date}</td>
        <td>${label}<br><span style="font-size:8px; color:#555;">${t.ref}</span></td>
        <td style="text-align:left;">${sign}${fmtC(Math.abs(t.amount))}</td>
        <td style="text-align:left; font-weight:bold;">${fmtC(t.runningBalance)}</td>
      </tr>
    `;
  }).join("");

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { margin: 0; size: 58mm auto; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
      color: #000;
      background: #fff;
      width: 58mm;
      padding: 4px 2px;
      direction: rtl;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .lg { font-size: 13px; }
    .dv { text-align: center; color: #555; font-size: 10px; margin: 3px 0; letter-spacing: -1px; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; }
    th { border-bottom: 1px dashed #000; padding: 2px 1px; font-weight: bold; text-align: right; }
    td { padding: 3px 1px; text-align: right; vertical-align: top; border-bottom: 0.5px dotted #ccc; }
    @media print {
      body { width: 58mm !important; }
    }
  </style></head>
  <body>
    <div class="center bold lg">${COMPANY.name}</div>
    <div class="center bold" style="font-size:10px; margin-top:2px;">كشف حساب عميل مصغر</div>
    ${divider}
    <div style="font-size:9.5px;">العميل: <b>${cust.name}</b></div>
    ${cust.code ? `<div style="font-size:9px;">كود العميل: ${cust.code}</div>` : ''}
    <div style="font-size:9px;">الهاتف: ${cust.phone || "—"}</div>
    <div style="font-size:9px;">التاريخ: ${new Date().toISOString().split('T')[0]}</div>
    <div style="font-size:11px; font-weight:bold; margin-top:4px; border:1px solid #000; padding:4px; text-align:center;">
      الرصيد المستحق: ${fmtC(cust.balance || 0)} ر.س
    </div>
    ${divider}
    <table>
      <thead><tr><th>التاريخ</th><th>الحركة</th><th style="text-align:left;">المبلغ</th><th style="text-align:left;">الرصيد</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${divider}
    <div class="center" style="font-size:8.5px;">إجمالي الفواتير: ${fmtC(ledger?.totalInvoices || 0)} ر.س</div>
    <div class="center" style="font-size:8.5px;">إجمالي المقبوضات: ${fmtC(ledger?.totalPayments || 0)} ر.س</div>
    <div class="center bold" style="font-size:9.5px; margin-top:2px;">الرصيد الحالي: ${fmtC(cust.balance || 0)} ر.س</div>
    ${divider}
    <div class="center" style="font-size:8.5px;">تطبيق المندوب الميداني</div>
    <div class="center" style="font-size:8.5px;">${COMPANY.name}</div>
    <div style="height:14px;"></div>
  </body></html>`;

  const fr = document.getElementById("print-frame");
  if (fr) {
    fr.srcdoc = html;
    fr.onload = () => {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch(e) {
        const w = window.open("","_blank","width=400,height=600");
        if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
      }
    };
  } else {
    const w = window.open("","_blank","width=400,height=600");
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),300); }
  }
};

window.printCustomerLedgerA4 = async (customerId) => {
  const cust = _custCache.find(c => c.id === customerId);
  if (!cust) return;
  toast("جاري إعداد كشف الحساب الرسمي A4 للطباعة...", "warn");

  const ledger = window._currentCustomerLedger;
  const txs = ledger?.txs || [];

  // جلب بيانات وإعدادات الشركة وشعارها إن وُجد
  let companyData = { name: COMPANY.name || "مؤسسة ادهام للمواد الغذائية" };
  try {
    const compDoc = await getDoc(doc(db, `companies/${COID}/settings`, "company"));
    if (compDoc.exists()) companyData = { ...companyData, ...compDoc.data() };
  } catch (_) {}

  const rows = txs.map((t, idx) => {
    const isDebit = t.amount > 0;
    const debitStr = isDebit ? fmtC(t.amount) : "—";
    const creditStr = !isDebit ? fmtC(Math.abs(t.amount)) : "—";
    const label = t.type === "invoice" ? (t.isCash ? "فاتورة نقدية" : "فاتورة مبيعات") : t.type === "return" ? "مرتجع مبيعات" : "سند قبض / تحصيل";
    const fullDesc = t.desc ? `${label} (${t.desc})` : label;
    return `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="white-space:nowrap; text-align:center;">${t.date}</td>
        <td>${fullDesc}</td>
        <td style="text-align:center; font-family:monospace; font-weight:bold;">${t.ref}</td>
        <td style="text-align:center; color:${isDebit ? '#b91c1c' : '#555'}; font-weight:${isDebit ? 'bold' : 'normal'};">${debitStr}</td>
        <td style="text-align:center; color:${!isDebit ? '#15803d' : '#555'}; font-weight:${!isDebit ? 'bold' : 'normal'};">${creditStr}</td>
        <td style="text-align:center; font-weight:bold; background:#fafafa;">${fmtC(t.runningBalance)}</td>
      </tr>
    `;
  }).join("");

  const todayStr = new Date().toISOString().split('T')[0];

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب عميل — ${cust.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 10mm; }
    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      color: #1e293b;
      background: #fff;
      padding: 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .company-title { font-size: 18px; font-weight: 900; color: #0f172a; }
    .company-sub { font-size: 11px; color: #475569; margin-top: 3px; }
    .doc-title {
      font-size: 20px;
      font-weight: 900;
      color: #1e40af;
      text-align: center;
      margin: 8px 0 14px;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .info-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
      font-size: 11.5px;
      line-height: 1.8;
    }
    .info-card strong { color: #0f172a; }
    .summary-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .sum-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      background: #f8fafc;
    }
    .sum-title { font-size: 10px; color: #64748b; font-weight: 700; }
    .sum-val { font-size: 14px; font-weight: 900; margin-top: 3px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 20px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 6px;
      font-weight: 800;
      border: 1px solid #0f172a;
      text-align: center;
    }
    td {
      padding: 7px 6px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    tr:nth-child(even) td { background: #fdfdfd; }
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      text-align: center;
      font-size: 11px;
    }
    .sign-line { margin-top: 40px; border-bottom: 1px solid #94a3b8; width: 80%; margin-left: auto; margin-right: auto; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="company-title">${companyData.name || "مؤسسة ادهام للمواد الغذائية"}</div>
      <div class="company-sub">
        ${companyData.taxNumber ? `الرقم الضريبي: ${companyData.taxNumber} | ` : ''}
        ${companyData.crNumber ? `س.ت: ${companyData.crNumber} | ` : ''}
        ${companyData.phone ? `هاتف: ${companyData.phone}` : ''}
      </div>
    </div>
    <div style="text-align:left; font-size:11px; color:#475569;">
      <div>تاريخ الاستخراج: <b>${todayStr}</b></div>
      <div>بواسطة المندوب: <b>${_profile?.name || "المندوب الميداني"}</b></div>
    </div>
  </div>

  <div class="doc-title">كشف حساب عميل تفصيلي</div>

  <div class="info-grid">
    <div class="info-card">
      <div>اسم العميل: <b>${cust.name}</b></div>
      ${cust.code ? `<div>كود الحساب المحاسبي: <b>${cust.code}</b></div>` : ''}
      <div>رقم الهاتف: <b>${cust.phone || "—"}</b></div>
    </div>
    <div class="info-card" style="background:#f1f5f9;">
      <div>إجمالي المبيعات: <b>${fmtC(ledger?.totalInvoices || 0)} ر.س</b></div>
      <div>إجمالي المقبوضات: <b>${fmtC(ledger?.totalPayments || 0)} ر.س</b></div>
      <div style="font-size:13px; font-weight:900; color:${(cust.balance || 0) > 0 ? '#b91c1c' : '#15803d'}; margin-top:4px;">
        الرصيد النهائي: <b>${fmtC(cust.balance || 0)} ر.س</b>
      </div>
    </div>
  </div>

  <div class="summary-bar">
    <div class="sum-card">
      <div class="sum-title">إجمالي الفواتير (مدين)</div>
      <div class="sum-val" style="color:#2563eb;">${fmtC(ledger?.totalInvoices || 0)} ر.س</div>
    </div>
    <div class="sum-card">
      <div class="sum-title">إجمالي المقبوضات (دائن)</div>
      <div class="sum-val" style="color:#16a34a;">${fmtC(ledger?.totalPayments || 0)} ر.س</div>
    </div>
    <div class="sum-card">
      <div class="sum-title">إجمالي المرتجعات</div>
      <div class="sum-val" style="color:#d97706;">${fmtC(ledger?.totalReturns || 0)} ر.س</div>
    </div>
    <div class="sum-card" style="background:${(cust.balance || 0) > 0 ? '#fef2f2' : '#f0fdf4'}; border-color:${(cust.balance || 0) > 0 ? '#fca5a5' : '#86efac'};">
      <div class="sum-title" style="color:${(cust.balance || 0) > 0 ? '#991b1b' : '#166534'};">الرصيد المستحق الحالي</div>
      <div class="sum-val" style="color:${(cust.balance || 0) > 0 ? '#b91c1c' : '#15803d'};">${fmtC(cust.balance || 0)} ر.س</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:35px;">م</th>
        <th style="width:85px;">التاريخ</th>
        <th>نوع الحركة والبيان</th>
        <th style="width:110px;">رقم المرجع</th>
        <th style="width:90px;">مدين (+)</th>
        <th style="width:90px;">دائن (-)</th>
        <th style="width:105px;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <div>المندوب المعتمد</div>
      <div class="sign-line"></div>
    </div>
    <div>
      <div>المحاسب المالي</div>
      <div class="sign-line"></div>
    </div>
    <div>
      <div>مصادقة وتوقيع العميل</div>
      <div class="sign-line"></div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=800");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  }
};


window.openCollectPaymentModal = async (customerId) => {
  const cust = _custCache.find(c => c.id === customerId);
  if (!cust) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "collect-payment-overlay";
  overlay.style.zIndex = "1001";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div class="sheet-title">تحصيل دفعة (سند قبض)</div>
    <div class="sheet-body" style="flex:1; overflow-y:auto; padding:16px;">
      <div style="font-size:12px; color:var(--t2); margin-bottom:8px;">تحصيل دفعة لحساب العميل: <b style="color:var(--t1);">${cust.name}</b></div>
      
      <div class="field-group">
        <label class="field-label">💰 المبلغ المحصل (ر.س) *</label>
        <input id="payment-amount" type="number" class="field-input mono" placeholder="0.00" min="0.01" step="0.01" inputmode="decimal" style="font-size:18px; font-weight:700;" />
      </div>

      <div class="field-group">
        <label class="field-label">💳 طريقة التحصيل *</label>
        <div style="display:flex; gap:8px;">
          <button id="paymethod-cash" class="btn-secondary active" onclick="setPaymentMethod('cash')" style="flex:1; margin:0; font-size:13px; font-weight:bold; min-height:40px;">💵 نقداً</button>
          <button id="paymethod-network" class="btn-secondary" onclick="setPaymentMethod('network')" style="flex:1; margin:0; font-size:13px; font-weight:bold; min-height:40px;">💳 شبكة (مدى/بنك)</button>
        </div>
      </div>

      <div class="field-group hidden" id="bank-accounts-wrap">
        <label class="field-label">🏛️ الحساب البنكي المودع به *</label>
        <select id="payment-bank-account" class="field-input" style="height:44px; font-family:'Cairo',sans-serif;"></select>
      </div>

      <div class="field-group">
        <label class="field-label">✏️ البيان / ملاحظات *</label>
        <input id="payment-notes" type="text" class="field-input" value="تحصيل دفعة حساب" placeholder="مثال: تحصيل جزء من المديونية" />
      </div>

      <div id="payment-error" class="error-box hidden"></div>
    </div>
    <div style="padding:12px calc(12px + var(--safe-bot)) 12px 12px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0;">
      <button class="btn-secondary" onclick="document.getElementById('collect-payment-overlay')?.remove()" style="flex:1; margin:0;">إلغاء</button>
      <button id="submit-payment-btn" class="btn-primary" onclick="submitCollectedPayment('${cust.id}')" style="flex:2; margin:0; background:var(--success); font-weight:700;">💾 تأكيد وحفظ السند</button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  let _paymentMethod = "cash";
  window.setPaymentMethod = (method) => {
    _paymentMethod = method;
    document.getElementById("paymethod-cash").classList.toggle("active", method === "cash");
    document.getElementById("paymethod-network").classList.toggle("active", method === "network");
    const wrap = document.getElementById("bank-accounts-wrap");
    if (wrap) {
      wrap.classList.toggle("hidden", method !== "network");
    }
  };

  try {
    const snap = await getDocs(collection(db, `companies/${COID}/bankAccounts`));
    const bankAccounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const select = document.getElementById("payment-bank-account");
    if (select && bankAccounts.length > 0) {
      select.innerHTML = bankAccounts.map(b => `<option value="${b.id}">${b.name || "البنك"} — ${b.accountNumber || ""}</option>`).join("");
    } else if (select) {
      select.innerHTML = `<option value="">لا توجد حسابات بنكية مسجلة</option>`;
    }
  } catch (err) {
    console.warn("Failed to load bank accounts for representative collection:", err.message);
  }

  window.submitCollectedPayment = async (custId) => {
    const amountInp = document.getElementById("payment-amount");
    const notesInp  = document.getElementById("payment-notes");
    const errBox    = document.getElementById("payment-error");
    const btn       = document.getElementById("submit-payment-btn");

    if (!amountInp || !notesInp || !errBox) return;

    errBox.classList.add("hidden");
    const amount = parseFloat(amountInp.value);
    const notes  = notesInp.value.trim();

    if (!amount || amount <= 0) { showErr(errBox, "الرجاء إدخال مبلغ صحيح أكبر من 0"); return; }
    if (!notes) { showErr(errBox, "الرجاء كتابة بيان التحصيل"); return; }

    let bankAccountId = "";
    if (_paymentMethod === "network") {
      bankAccountId = document.getElementById("payment-bank-account").value;
      if (!bankAccountId) { showErr(errBox, "الرجاء اختيار الحساب البنكي المستلم"); return; }
    }

    btn.disabled = true;
    btn.textContent = "جاري الحفظ…";

    const paymentNo = await generateRepReceiptNumber(REP);
    const today = getTodayLocalDate();

    const paymentData = {
      _queueId:       paymentNo,
      type:           "payment",
      id:             paymentNo,
      receiptNumber:  paymentNo,
      customerId:     custId,
      customerName:   cust.name,
      customerType:   cust.type || "retail",
      amount:         amount,
      paymentMethod:  _paymentMethod === "cash" ? "cash" : "bank",
      sourceId:       _paymentMethod === "cash" ? `cashBox_${REP.id}` : bankAccountId,
      notes:          notes,
      date:           today,
      repId:          REP.id,
      repName:        REP.name,
      costCenterId:   REP.costCenterId || null,
      costCenterName: REP.costCenterName || null,
      createdAt:      serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    try {
      if (navigator.onLine) {
        await saveAndProcessPayment(paymentData);
        toast(`✅ تم تحصيل ${fmtC(amount)} ر.س بنجاح وصدر سند القبض ${paymentNo}`, "ok");
      } else {
        queueAdd(paymentData);
        toast(`📥 حُفظ السند في الانتظار (لا إنترنت) وسيتم مزامنته تلقائياً`, "warn");
      }

      overlay.remove();
      document.getElementById("ledger-overlay")?.remove();
      
      cust.balance = (cust.balance || 0) - amount;
      if (_currentPage === "customers") {
        const pageList = document.getElementById("cust-page-list");
        if (pageList) pageList.innerHTML = renderCustCards(_custCache);
      }
    } catch (e) {
      showErr(errBox, `فشل التحصيل: ${e.message}`);
      btn.disabled = false;
      btn.textContent = "💾 تأكيد وحفظ السند";
    }
  };
};

async function saveAndProcessPayment(payment) {
  const companyId = COID;
  
  const [coaSnap, custSnap, whSnap] = await Promise.all([
    getDocs(collection(db, `companies/${companyId}/chartOfAccounts`)),
    getDoc(doc(db, `companies/${companyId}/customers`, payment.customerId)),
    getDocs(collection(db, `companies/${companyId}/warehouses`))
  ]);

  const allAccounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const customer = custSnap.exists() ? custSnap.data() : null;
  const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  let creditAccId = "";
  let creditAccCode = "";
  let creditAccName = "";
  
  if (customer) {
    const parentCustCode = customer.type === "wholesale" ? "1-1-2-2-1" : "1-1-2-1-1";
    const custAccMatch = allAccounts.find(a => a.sourceEntityId === payment.customerId && a.sourceModule === "customers");
    if (custAccMatch) {
      creditAccId = custAccMatch.id;
      creditAccCode = custAccMatch.code;
      creditAccName = custAccMatch.name;
    } else {
      const match = allAccounts.find(a => a.name && customer.name && a.name.includes(customer.name));
      creditAccId = match?.id || allAccounts.find(a => a.code === parentCustCode)?.id;
      creditAccCode = match?.code || parentCustCode;
      creditAccName = match?.name || "ذمم العملاء";
    }
  }

  let debitAccId = "";
  let debitAccCode = "";
  let debitAccName = "";
  let sourceDocRef = null;
  let sourceName = "";

  if (payment.paymentMethod === "cash") {
    sourceDocRef = doc(db, `companies/${companyId}/cashBoxes`, payment.sourceId);
    const cbSnap = await getDoc(sourceDocRef);
    if (cbSnap.exists()) {
      const cb = cbSnap.data();
      sourceName = cb.name;
      const cbAccMatch = allAccounts.find(a => a.code === cb.accountCode || a.id === cb.accountId);
      if (cbAccMatch) {
        debitAccId = cbAccMatch.id;
        debitAccCode = cbAccMatch.code;
        debitAccName = cbAccMatch.name;
      }
    }
    if (!debitAccId) {
      const parentCashCode = "1-1-1-2";
      const match = allAccounts.find(a => a.code === parentCashCode);
      debitAccId = match?.id || parentCashCode;
      debitAccCode = match?.code || parentCashCode;
      debitAccName = match?.name || "صناديق المناديب";
    }
  } else {
    sourceDocRef = doc(db, `companies/${companyId}/bankAccounts`, payment.sourceId);
    const baSnap = await getDoc(sourceDocRef);
    if (baSnap.exists()) {
      const ba = baSnap.data();
      sourceName = ba.name || "البنك";
      const baAccMatch = allAccounts.find(a => a.id === ba.accountId);
      if (baAccMatch) {
        debitAccId = baAccMatch.id;
        debitAccCode = baAccMatch.code;
        debitAccName = baAccMatch.name;
      }
    }
    if (!debitAccId) {
      const fallbackCode = "1-1-1-3-2";
      const match = allAccounts.find(a => a.code === fallbackCode);
      debitAccId = match?.id || fallbackCode;
      debitAccCode = match?.code || fallbackCode;
      debitAccName = match?.name || "مصرف الراجحي";
    }
  }

  await runTransaction(db, async (transaction) => {
    const receiptRef = doc(db, `companies/${companyId}/receipts`, payment.id);
    const receiptSnap = await transaction.get(receiptRef);
    if (receiptSnap.exists()) {
      console.warn(`[saveAndProcessPayment] Receipt ${payment.id} already exists. Skipping duplicate.`);
      return;
    }

    let currentBal = 0;
    if (sourceDocRef) {
      const sourceSnap = await transaction.get(sourceDocRef);
      if (sourceSnap.exists()) {
        currentBal = parseFloat(sourceSnap.data().balance || 0);
      }
    }

    const balanceAfter = currentBal + payment.amount;

    if (sourceDocRef) {
      transaction.update(sourceDocRef, {
        balance: balanceAfter,
        updatedAt: serverTimestamp()
      });
    }

    transaction.set(receiptRef, {
      date: payment.date,
      amount: payment.amount,
      entityType: "customer",
      targetId: payment.customerId,
      accountName: payment.customerName,
      method: payment.paymentMethod,
      sourceId: payment.sourceId,
      sourceName: sourceName,
      notes: payment.notes,
      repId: payment.repId,
      repName: payment.repName,
      costCenterId: payment.costCenterId || null,
      costCenterName: payment.costCenterName || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (payment.paymentMethod === "cash") {
      const txRef = doc(collection(db, `companies/${companyId}/cashTransactions`));
      transaction.set(txRef, {
        cashBoxId: payment.sourceId,
        type: "in",
        amount: payment.amount,
        balanceAfter,
        notes: `سند قبض رقم ${payment.id.substring(0,6).toUpperCase()} — ${payment.notes}`,
        userName: payment.repName,
        createdAt: serverTimestamp()
      });
    } else {
      const txRef = doc(collection(db, `companies/${companyId}/bankTransactions`));
      transaction.set(txRef, {
        bankAccountId: payment.sourceId,
        type: "in",
        amount: payment.amount,
        balanceAfter,
        notes: `سند قبض رقم ${payment.id.substring(0,6).toUpperCase()} — ${payment.notes}`,
        refNumber: `RV-${payment.id.substring(0,6).toUpperCase()}`,
        createdAt: serverTimestamp()
      });
    }
  });

  const balanceSync = await import("../utils/balance-sync.js");
  await balanceSync.recalculateCustomerBalance(payment.customerId);

  try {
    const { createJournalEntry } = await import("../utils/db.js");
    const decAccDetail = allAccounts.find(a => a.id === debitAccId);
    const crAccDetail = allAccounts.find(a => a.id === creditAccId);

    await createJournalEntry({
      date: payment.date,
      description: `تحصيل من ${payment.customerName || "عميل"} — سند قبض #${payment.id.substring(0,6).toUpperCase()} - ${payment.notes}`,
      sourceType: "pos",
      sourceId: payment.id,
      costCenterId: payment.costCenterId || null,
      costCenterName: payment.costCenterName || null,
      lines: [
        {
          accountId: debitAccId,
          accountCode: debitAccCode || decAccDetail?.code || "",
          accountName: debitAccName || decAccDetail?.name || "",
          debit: payment.amount,
          credit: 0,
          note: payment.notes,
          costCenterId: payment.costCenterId || null,
        },
        {
          accountId: creditAccId,
          accountCode: creditAccCode || crAccDetail?.code || "",
          accountName: creditAccName || crAccDetail?.name || "",
          debit: 0,
          credit: payment.amount,
          note: `تحصيل سند قبض`,
          costCenterId: payment.costCenterId || null,
        }
      ]
    });
    console.log(`[Accounting] Auto-created JE for payment ${payment.id}`);
  } catch (jeErr) {
    console.warn("Accounting automation failed for payment voucher:", jeErr.message);
  }
}

/* ══════════════════════════════════
   RESTOCK / REPLENISHMENT REQUESTS (طلبات شحن السيارة)
   ══════════════════════════════════ */

window.openRestockRequestModal = async (prefilledProductId = null, prefilledProductName = null) => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "restock-request-overlay";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div class="sheet-title">طلب تغذية بضاعة (تحويل مخزني)</div>
    <div class="sheet-body" style="flex:1; overflow-y:auto; padding:16px;" id="restock-sheet-body">
      <div style="text-align:center; padding:24px;"><span class="spin" style="margin:0 auto 8px;"></span>جاري تحميل الأصناف والمستودعات…</div>
    </div>
    <div style="padding:12px calc(12px + var(--safe-bot)) 12px 12px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0;">
      <button class="btn-secondary" onclick="document.getElementById('restock-request-overlay')?.remove()" style="flex:1; margin:0;">إلغاء</button>
      <button id="send-restock-btn" class="btn-primary" onclick="submitRestockRequest()" style="flex:2; margin:0; font-weight:700;" disabled>🚀 إرسال الطلب</button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  try {
    const companyId = COID;
    
    const [prodSnap, whSnap] = await Promise.all([
      getDocs(query(collection(db, `companies/${companyId}/products`))),
      getDocs(collection(db, `companies/${companyId}/warehouses`))
    ]);

    const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>(a.name||"").localeCompare(b.name||"","ar"));
    const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const sourceWarehouses = warehouses.filter(w => w.id !== REP.assignedWarehouseId);
    const defaultWh = sourceWarehouses.find(w => w.name?.includes("الرئيسي") || w.name?.includes("الرئيسى") || w.id === "W5uANJjMgfFh2p3xU4bT") || sourceWarehouses[0];

    // تحميل مخزون المستودع الرئيسي لعرض الكمية المتاحة في نتائج البحث
    let mainStockMapRestock = {};
    if (defaultWh) {
      try {
        const mss = await getDocs(query(collection(db, `companies/${companyId}/stockByWarehouse`), where("warehouseId", "==", defaultWh.id)));
        mss.docs.forEach(d => { const dt = d.data(); mainStockMapRestock[dt.productId] = dt.qty ?? 0; });
      } catch(e) { /* غير حرج */ }
    }

    const body = document.getElementById("restock-sheet-body");
    if (!body) return;

    body.innerHTML = `
      <div class="field-group">
        <label class="field-label">📍 مستودع المصدر (من) *</label>
        <select id="restock-source-wh" class="field-input" style="height:44px; font-family:'Cairo',sans-serif;">
          ${sourceWarehouses.map(w => `<option value="${w.id}" data-name="${w.name}" ${defaultWh && w.id === defaultWh.id ? "selected" : ""}>${w.name}</option>`).join("")}
        </select>
      </div>

      <div class="field-group" style="position:relative;">
        <label class="field-label">🔍 ابحث عن صنف لإضافته للطلب *</label>
        <input id="restock-prod-search" type="text" class="field-input" placeholder="ابحث باسم الصنف أو الكود…" oninput="filterRestockSearch(this.value)" />
        <div id="restock-search-results" class="hidden" style="position:absolute; top:70px; left:0; right:0; background:var(--bg-2); border:1px solid var(--border); border-radius:8px; max-height:200px; overflow-y:auto; z-index:100; box-shadow:var(--shadow);"></div>
      </div>

      <div style="font-size:12px; font-weight:700; color:var(--t1); margin-bottom:6px;">📦 الأصناف المطلوبة:</div>
      <div id="restock-items-list" style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
        <div style="text-align:center; padding:12px; color:var(--t3); border:1px dashed var(--border); border-radius:8px; font-size:12px;">لم يتم إضافة أصناف بعد. استخدم البحث أعلاه للإضافة.</div>
      </div>

      <div class="field-group">
        <label class="field-label">✏️ ملاحظات</label>
        <input id="restock-notes" type="text" class="field-input" placeholder="أدخل أي ملاحظات هنا..." />
      </div>

      <div id="restock-error" class="error-box hidden"></div>
    `;

    const selectedItems = [];

    window.filterRestockSearch = (q) => {
      const resultsDiv = document.getElementById("restock-search-results");
      if (!resultsDiv) return;

      if (!q.trim()) {
        resultsDiv.classList.add("hidden");
        return;
      }

      const term = q.trim().toLowerCase();
      const matched = products.filter(p => p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term) || p.barcode?.includes(term));
      
      if (matched.length === 0) {
        resultsDiv.innerHTML = `<div style="padding:10px; text-align:center; color:var(--t3); font-size:12px;">لا توجد نتائج</div>`;
        resultsDiv.classList.remove("hidden");
        return;
      }

      resultsDiv.innerHTML = matched.map(p => {
        const aq = mainStockMapRestock[p.id] ?? 0;
        const badge = aq > 0
          ? `<span style="font-size:11px;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-weight:700;">${aq} متاح</span>`
          : `<span style="font-size:11px;background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:12px;">غير متوفر</span>`;
        return `<div style="padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;${aq<=0?'opacity:0.6':''}" onclick="addRestockItem('${p.id}','${esc(p.name)}','${p.sku||""}','${p.unit||""}',${aq})"><div><div style="font-weight:700;color:var(--t1);">${p.name}</div><div style="font-size:10px;color:var(--t3);">${p.sku||""} ${p.unit?'| '+p.unit:''}</div></div>${badge}</div>`;
      }).join("");
      resultsDiv.classList.remove("hidden");
    };

    window.addRestockItem = (id, name, sku, unit, availQty = 0) => {
      document.getElementById("restock-search-results")?.classList.add("hidden");
      const si = document.getElementById("restock-prod-search");
      if (si) si.value = "";

      if (selectedItems.some(item => item.productId === id)) {
        toast("⚠️ الصنف مضاف بالفعل للطلب", "warn");
        return;
      }

      selectedItems.push({
        productId:   id,
        productName: name,
        sku:         sku,
        unit:        unit,
        qty:         1,
        availQty:    availQty,  // كمية المستودع الرئيسي
      });

      renderRestockItems();
    };

    // إضافة منتج محدد مسبقاً (من الضغط على بطاقة OOS)
    if (prefilledProductId) {
      const pref = products.find(p => p.id === prefilledProductId);
      if (pref) {
        const prefAvail = mainStockMapRestock[prefilledProductId] ?? 0;
        addRestockItem(prefilledProductId, prefilledProductName || pref.name, pref.sku||"" , pref.unit||"", prefAvail);
      }
    }

    window.removeRestockItem = (id) => {
      const idx = selectedItems.findIndex(item => item.productId === id);
      if (idx !== -1) {
        selectedItems.splice(idx, 1);
      }
      renderRestockItems();
    };

    window.updateRestockItemQty = (id, val) => {
      const item = selectedItems.find(item => item.productId === id);
      if (item) {
        item.qty = parseFloat(val) || 0;
      }
    };

    function renderRestockItems() {
      const listDiv = document.getElementById("restock-items-list");
      const btn = document.getElementById("send-restock-btn");
      if (!listDiv || !btn) return;

      if (selectedItems.length === 0) {
        listDiv.innerHTML = `<div style="text-align:center; padding:12px; color:var(--t3); border:1px dashed var(--border); border-radius:8px; font-size:12px;">لم يتم إضافة أصناف بعد. استخدم البحث أعلاه للإضافة.</div>`;
        btn.disabled = true;
        return;
      }

      btn.disabled = false;
      listDiv.innerHTML = selectedItems.map(item => {
        const avail = item.availQty || 0;
        const availTxt = avail > 0
          ? `<span style="color:#166534; font-weight:700;">متاح: ${avail}</span>`
          : `<span style="color:#991b1b;">غير متوفر</span>`;
        return `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-1); padding:10px 12px; border:1px solid var(--border); border-radius:8px; gap:8px;">
          <div style="flex:1;">
            <div style="font-weight:700; color:var(--t1); font-size:13px;">${item.productName}</div>
            <div style="font-size:10px; color:var(--t3); display:flex; gap:8px;">
              ${item.sku || ""} ${item.unit ? '| '+item.unit : ""}
              <span>• المستودع: ${availTxt}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="number" class="field-input mono" style="width:70px; height:32px; font-size:13px; text-align:center; padding:4px; margin:0;"
              value="${item.qty}" min="0.01" step="0.01" max="${avail||9999}"
              onchange="updateRestockItemQty('${item.productId}', this.value)" />
            <button class="btn-ghost" onclick="removeRestockItem('${item.productId}')" style="padding:4px 8px; color:var(--error); font-size:14px; min-height:auto; height:32px; border:none; margin:0;">✕</button>
          </div>
        </div>`;
      }).join("");
    }

    window.submitRestockRequest = async () => {
      const errBox = document.getElementById("restock-error");
      const submitBtn = document.getElementById("send-restock-btn");
      if (!errBox || !submitBtn) return;

      errBox.classList.add("hidden");

      if (selectedItems.length === 0) {
        showErr(errBox, "الرجاء إضافة صنف واحد على الأقل للطلب");
        return;
      }

      for (const item of selectedItems) {
        if (item.qty <= 0) {
          showErr(errBox, `الكمية للصنف ${item.productName} يجب أن تكون أكبر من صفر`);
          return;
        }
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "جاري الإرسال…";

      const sourceWhSelect = document.getElementById("restock-source-wh");
      const fromWarehouseId = sourceWhSelect.value;
      const fromWarehouseName = sourceWhSelect.options[sourceWhSelect.selectedIndex]?.dataset.name || "";
      const notes = document.getElementById("restock-notes").value.trim();
      const requestNo = `REQ-${Date.now().toString().slice(-8)}`;
      const today = getTodayLocalDate();

      const toWarehouseId = REP.assignedWarehouseId;
      const toWarehouseName = REP.assignedWarehouseName || `سيارة ${REP.name}`;

      const restockData = {
        number:            requestNo,
        date:              today,
        fromWarehouseId:   fromWarehouseId,
        fromWarehouseName: fromWarehouseName,
        toWarehouseId:     toWarehouseId,
        toWarehouseName:   toWarehouseName,
        lines:             selectedItems,
        notes:             notes,
        status:            "requested",
        createdBy:         REP.id,
        createdByName:     REP.name,
        createdAt:         serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        receivedAt:        null
      };

      try {
        if (!navigator.onLine) {
          throw new Error("عذراً، يجب توفر اتصال بالإنترنت لإرسال طلب شحن السيارة للمستودع.");
        }

        await addDoc(collection(db, `companies/${companyId}/stockTransfers`), restockData);
        
        toast(`✅ تم إرسال طلب الشحن ${requestNo} للمدير بنجاح`, "ok");
        overlay.remove();

      } catch (e) {
        showErr(errBox, `فشل إرسال الطلب: ${e.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = "🚀 إرسال الطلب";
      }
    };

  } catch (err) {
    const body = document.getElementById("restock-sheet-body");
    if (body) {
      body.innerHTML = `<div class="error-box" style="margin:0;">⚠️ خطأ في التحميل: ${err.message}</div>`;
    }
  }
};


/* ══════════════════════════════════
   RESTOCK CONFIRMATION (تأكيد استلام الشحنة بالسيارة)
   ══════════════════════════════════ */

window.checkPendingStockTransfers = async () => {
  if (!REP.assignedWarehouseId) return;
  try {
    const q = query(
      collection(db, `companies/${COID}/stockTransfers`),
      where("toWarehouseId", "==", REP.assignedWarehouseId),
      where("status", "==", "requested")
    );
    const snap = await getDocs(q);
    const pending = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const container = document.getElementById("pending-transfers-banner-wrap");
    if (!container) return;

    if (pending.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = pending.map(tr => `
      <div class="pending-transfer-banner" onclick="openReceiveStockModal('${tr.id}')" style="background:rgba(var(--brand-rgb, 79, 70, 229), 0.1); border:1.5px solid var(--brand); border-radius:12px; padding:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
        <div>
          <div style="font-weight:800; color:var(--brand); font-size:13px;">🚚 شحنة واردة بانتظار التأكيد</div>
          <div style="font-size:11px; color:var(--t2); margin-top:2px;">الرقم: ${tr.number} | من: ${tr.fromWarehouseName}</div>
        </div>
        <span style="font-size:11px; background:var(--brand); color:#fff; padding:4px 8px; border-radius:8px; font-weight:700;">عرض واستلام</span>
      </div>
    `).join("");
  } catch (err) {
    console.warn("Failed to check pending stock transfers:", err.message);
  }
};

window.openReceiveStockModal = async (transferId) => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "receive-stock-overlay";
  overlay.style.zIndex = "1002";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div class="sheet-title">تأكيد استلام شحنة بضاعة</div>
    <div class="sheet-body" style="flex:1; overflow-y:auto; padding:16px;" id="receive-stock-sheet-body">
      <div style="text-align:center; padding:24px;"><span class="spin" style="margin:0 auto 8px;"></span>جاري تحميل تفاصيل الشحنة…</div>
    </div>
    <div style="padding:12px calc(12px + var(--safe-bot)) 12px 12px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0;">
      <button class="btn-secondary" onclick="document.getElementById('receive-stock-overlay')?.remove()" style="flex:1; margin:0;">إلغاء</button>
      <button id="confirm-receive-btn" class="btn-primary" onclick="confirmStockReceipt('${transferId}')" style="flex:2; margin:0; font-weight:700; background:var(--success);" disabled>✅ تأكيد واستلام البضاعة</button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  try {
    const docRef = doc(db, `companies/${COID}/stockTransfers`, transferId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("الشحنة المطلوبة غير موجودة في قاعدة البيانات.");
    }

    const tr = snap.data();
    window._currentReceiveTransfer = tr; // Save globally for confirmation function

    const body = document.getElementById("receive-stock-sheet-body");
    const confirmBtn = document.getElementById("confirm-receive-btn");

    if (!body || !confirmBtn) return;

    confirmBtn.disabled = false;
    body.innerHTML = `
      <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:16px; font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--t2);">رقم الشحنة:</span>
          <b style="color:var(--t1);" class="mono">${tr.number}</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--t2);">مستودع المصدر:</span>
          <b style="color:var(--t1);">${tr.fromWarehouseName}</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--t2);">تاريخ الشحن:</span>
          <b style="color:var(--t1);">${tr.date}</b>
        </div>
        ${tr.notes ? `
        <div style="margin-top:8px; border-top:1px solid var(--border); padding-top:6px; color:var(--t3);">
          <b>ملاحظات:</b> ${tr.notes}
        </div>` : ""}
      </div>

      <div style="font-size:13px; font-weight:700; color:var(--t1); margin-bottom:10px;">📦 الأصناف والكميات الواردة:</div>
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
        ${(tr.lines || []).map(line => `
          <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-1); padding:10px 12px; border:1px solid var(--border); border-radius:8px;">
            <div>
              <div style="font-weight:700; color:var(--t1); font-size:13px;">${line.productName}</div>
              <div style="font-size:10px; color:var(--t3);">${line.sku || ""}</div>
            </div>
            <div style="font-size:15px; font-weight:900; color:var(--brand);">${line.qty} <span style="font-size:10px; font-weight:normal; color:var(--t2);">${line.unit || "حبة"}</span></div>
          </div>
        `).join("")}
      </div>

      <div style="font-size:11px; color:var(--t2); text-align:center; padding:0 8px; line-height:1.4;">
        ⚠️ بمجرد النقر على "تأكيد واستلام البضاعة"، سيتم إضافة الكميات المذكورة أعلاه تلقائياً إلى مخزون سيارتك وستصبح متاحة للبيع الفوري.
      </div>

      <div id="receive-error" class="error-box hidden"></div>
    `;

  } catch (err) {
    const body = document.getElementById("receive-stock-sheet-body");
    if (body) {
      body.innerHTML = `<div class="error-box" style="margin:0;">⚠️ خطأ في تحميل التفاصيل: ${err.message}</div>`;
    }
  }
};

window.confirmStockReceipt = async (transferId) => {
  const tr = window._currentReceiveTransfer;
  if (!tr) return;

  const btn = document.getElementById("confirm-receive-btn");
  const errBox = document.getElementById("receive-error");
  if (!btn || !errBox) return;

  errBox.classList.add("hidden");
  btn.disabled = true;
  btn.textContent = "جاري تأكيد الاستلام وتحديث المخزون…";

  try {
    if (!navigator.onLine) {
      throw new Error("يجب توفر اتصال بالإنترنت لتأكيد استلام الشحنة وتحديث المخزون الفوري.");
    }

    await runTransaction(db, async (tx) => {
      // 1. Update stock transfer status to received
      const transferRef = doc(db, `companies/${COID}/stockTransfers/${transferId}`);
      tx.update(transferRef, {
        status: "received",
        receivedAt: serverTimestamp(),
        receivedBy: REP.id,
        receivedByName: REP.name
      });

      // 2. Add quantities to destination (van) warehouse
      for (const line of tr.lines || []) {
        const stockRef = doc(db, `companies/${COID}/stockByWarehouse/${REP.assignedWarehouseId}_${line.productId}`);
        tx.set(stockRef, {
          warehouseId: REP.assignedWarehouseId,
          productId: line.productId,
          qty: increment(line.qty),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // 3. Write transaction log to stockTransactions
        const txRef = doc(collection(db, `companies/${COID}/stockTransactions`));
        tx.set(txRef, {
          warehouseId: REP.assignedWarehouseId,
          productId: line.productId,
          qtyBefore: 0,
          qtyChange: line.qty,
          qtyAfter: line.qty,
          type: "transfer_in",
          sourceType: "stockTransfer",
          sourceId: transferId,
          productName: line.productName,
          notes: `تم تأكيد استلام الشحنة ${tr.number}`,
          createdAt: serverTimestamp()
        });
      }
    });

    toast(`✅ تم استلام الشحنة ${tr.number} بنجاح وتمت إضافة الكميات للمخزن`, "ok");
    
    document.getElementById("receive-stock-overlay")?.remove();
    
    // Refresh stock list immediately
    if (_currentPage === "stock") {
      const pageContent = document.getElementById("page-content");
      if (pageContent) await renderStock(pageContent);
    }

  } catch (e) {
    errBox.textContent = `فشل تأكيد الاستلام: ${e.message}`;
    errBox.classList.remove("hidden");
    btn.disabled = false;
    btn.textContent = "✅ تأكيد واستلام البضاعة";
  }
};



/* ══════════════════════════════════
   VAN STOCKTAKE & SETTLEMENT (جرد السيارة وتسوية الفروقات)
   ══════════════════════════════════ */

window.openVanStocktakeModal = async () => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "stocktake-overlay";
  overlay.style.zIndex = "1002";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div class="sheet-title">جرد بضاعة السيارة وتسوية الفروقات</div>
    <div class="sheet-body" style="flex:1; overflow-y:auto; padding:16px;" id="stocktake-sheet-body">
      <div style="text-align:center; padding:24px;"><span class="spin" style="margin:0 auto 8px;"></span>جاري تحميل منتجات السيارة…</div>
    </div>
    <div style="padding:12px calc(12px + var(--safe-bot)) 12px 12px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0;">
      <button class="btn-secondary" onclick="document.getElementById('stocktake-overlay')?.remove()" style="flex:1; margin:0;">إلغاء</button>
      <button id="submit-stocktake-btn" class="btn-primary" onclick="submitVanStocktake()" style="flex:2; margin:0; font-weight:700; background:var(--brand);" disabled>💾 اعتماد وترحيل الجرد</button>
    </div>
  </div>`;
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  try {
    const body = document.getElementById("stocktake-sheet-body");
    const submitBtn = document.getElementById("submit-stocktake-btn");

    if (!body || !submitBtn) return;

    if (_stockProds.length === 0) {
      body.innerHTML = `<div style="text-align:center; padding:32px; color:var(--t3); font-size:13px;">لا يوجد مخزون حالي في سيارتك للقيام بالجرد.</div>`;
      return;
    }

    submitBtn.disabled = false;

    body.innerHTML = `
      <div style="font-size:12px; color:var(--t2); margin-bottom:12px; line-height:1.4;">
        الرجاء إدخال الكميات الفعلية الموجودة في السيارة حالياً. سيقوم النظام تلقائياً بإنشاء مستند تسوية وقيد محاسبي بالفروقات (إن وُجدت).
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
        ${_stockProds.map(p => `
          <div style="background:var(--bg-1); border:1px solid var(--border); border-radius:8px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <div style="flex:1;">
              <div style="font-weight:700; color:var(--t1); font-size:13px;">${p.name}</div>
              <div style="font-size:10px; color:var(--t3);">
                الرصيد الدفتري: <b style="color:var(--t2);" class="mono">${p.qty}</b> ${p.unit || "حبة"}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="actual-qty-${p.id}" class="field-input mono" style="width:80px; height:36px; font-size:13px; text-align:center; padding:4px; margin:0;" value="${p.qty}" min="0" step="0.01" onchange="calculateStocktakeVariance('${p.id}', ${p.qty})" />
              <div id="variance-badge-${p.id}" style="font-size:11px; font-weight:700; width:44px; text-align:center; color:var(--t3);">—</div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="field-group">
        <label class="field-label">✏️ ملاحظات الجرد</label>
        <input id="stocktake-notes" type="text" class="field-input" placeholder="مثال: جرد نهاية الأسبوع، تسوية فروقات..." />
      </div>

      <div id="stocktake-error" class="error-box hidden"></div>
    `;

    window.calculateStocktakeVariance = (prodId, bookQty) => {
      const actualInp = document.getElementById(`actual-qty-${prodId}`);
      const badge = document.getElementById(`variance-badge-${prodId}`);
      if (!actualInp || !badge) return;

      const actualQty = parseFloat(actualInp.value) || 0;
      const variance = actualQty - bookQty;

      if (variance > 0) {
        badge.innerHTML = `+${variance}`;
        badge.style.color = "var(--success)";
      } else if (variance < 0) {
        badge.innerHTML = `${variance}`;
        badge.style.color = "var(--error)";
      } else {
        badge.innerHTML = "—";
        badge.style.color = "var(--t3)";
      }
    };

    window.submitVanStocktake = async () => {
      const errBox = document.getElementById("stocktake-error");
      const btn = document.getElementById("submit-stocktake-btn");
      if (!errBox || !btn) return;

      errBox.classList.add("hidden");
      btn.disabled = true;
      btn.textContent = "جاري ترحيل الجرد والتسوية…";

      try {
        if (!navigator.onLine) {
          throw new Error("يجب توفر اتصال بالإنترنت لإجراء الجرد وتسوية الفروقات لضمان صحة القيود المحاسبية ومزامنتها.");
        }

        const companyId = COID;
        const today = getTodayLocalDate();
        const countNo = `STK-REP-${Date.now().toString().slice(-8)}`;

        // Load Chart of Accounts
        const coaSnap = await getDocs(collection(db, `companies/${companyId}/chartOfAccounts`));
        const allAccounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const invAccObj = allAccounts.find(a => a.code === "120") || { id: "INV_STOCK", code: "120", name: "مخزون مستودع المواد الغذائية" };
        const varLossAcc = allAccounts.find(a => a.code === "506") || { id: "VAR_LOSS", code: "506", name: "خسائر فروقات جرد مخزنية" };
        const varGainAcc = allAccounts.find(a => a.code === "406") || { id: "VAR_GAIN", code: "406", name: "أرباح وإيرادات تسويات جردية" };

        let totalLoss = 0;
        let totalGain = 0;
        const linesWithDiff = [];
        const allItems = [];

        for (const p of _stockProds) {
          const actualInp = document.getElementById(`actual-qty-${p.id}`);
          const actualQty = actualInp ? parseFloat(actualInp.value) || 0 : p.qty;
          const variance = actualQty - p.qty;
          const cost = p.costPrice || 0;
          const diffCost = variance * cost;

          if (diffCost < 0) totalLoss += Math.abs(diffCost);
          else totalGain += diffCost;

          const itemData = {
            productId: p.id,
            sku: p.sku || "",
            name: p.name,
            bookQty: p.qty,
            actualQty,
            variance,
            cost,
            varianceCost: diffCost
          };

          allItems.push(itemData);
          if (variance !== 0) {
            linesWithDiff.push(itemData);
          }
        }

        if (linesWithDiff.length === 0) {
          toast("✅ تم الجرد بنجاح ومطابق تماماً، لا توجد فروقات لتسويتها.", "ok");
          overlay.remove();
          return;
        }

        const notes = document.getElementById("stocktake-notes").value.trim() || "جرد سيارة المندوب وتسوية تلقائية";

        await runTransaction(db, async (tx) => {
          // 1. Create Physical Count record
          const pcRef = doc(collection(db, `companies/${companyId}/physicalCounts`));
          tx.set(pcRef, {
            number: countNo,
            date: today,
            type: "cycle",
            warehouseId: REP.assignedWarehouseId,
            warehouseName: REP.assignedWarehouseName || `سيارة ${REP.name}`,
            items: allItems,
            totalLoss,
            totalGain,
            notes: notes + " (جرد سيارة المندوب)",
            status: "posted",
            createdBy: REP.id,
            createdByName: REP.name,
            createdAt: serverTimestamp()
          });

          // 2. Adjust Stock and write stockTransactions
          for (const l of linesWithDiff) {
            const stockRef = doc(db, `companies/${companyId}/stockByWarehouse/${REP.assignedWarehouseId}_${l.productId}`);
            tx.set(stockRef, {
              warehouseId: REP.assignedWarehouseId,
              productId: l.productId,
              qty: increment(l.variance),
              updatedAt: serverTimestamp()
            }, { merge: true });

            const txRef = doc(collection(db, `companies/${companyId}/stockTransactions`));
            tx.set(txRef, {
              warehouseId: REP.assignedWarehouseId,
              productId: l.productId,
              qtyBefore: l.bookQty,
              qtyChange: l.variance,
              qtyAfter: l.actualQty,
              type: l.variance > 0 ? "adjustment_in" : "adjustment_out",
              sourceType: "physical_count",
              sourceId: pcRef.id,
              productName: l.name,
              notes: `تسوية فروق جرد السيارة - مستند ${countNo}`,
              createdAt: serverTimestamp()
            });
          }
        });

        // 3. Create Journal Entry based on Net Variance
        const totalNetVariance = totalGain - totalLoss;
        const { createJournalEntry } = await import("../utils/db.js");

        if (totalNetVariance < 0) { // Deficit Loss
          await createJournalEntry({
            date: today,
            description: `قيد تسوية عجز جرد سيارة المندوب ${REP.name} - مستند ${countNo}`,
            sourceType: "physical_count",
            sourceId: countNo,
            lines: [
              { accountId: varLossAcc.id, accountCode: varLossAcc.code, accountName: varLossAcc.name, debit: Math.abs(totalNetVariance), credit: 0, note: "إثبات خسائر عجز جرد السيارة" },
              { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: 0, credit: Math.abs(totalNetVariance), note: "تخفيض قيمة مخزون السيارة" }
            ]
          });
        } else if (totalNetVariance > 0) { // Surplus Gain
          await createJournalEntry({
            date: today,
            description: `قيد تسوية زيادة جرد سيارة المندوب ${REP.name} - مستند ${countNo}`,
            sourceType: "physical_count",
            sourceId: countNo,
            lines: [
              { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: totalNetVariance, credit: 0, note: "زيادة قيمة مخزون السيارة بالفروق الفعيلة" },
              { accountId: varGainAcc.id, accountCode: varGainAcc.code, accountName: varGainAcc.name, debit: 0, credit: totalNetVariance, note: "إثبات أرباح تسوية جرد السيارة" }
            ]
          });
        }

        toast(`✅ تم ترحيل الجرد ${countNo} بنجاح وتسوية الفروقات محاسبياً.`, "ok");
        overlay.remove();

        // Refresh stock list immediately
        if (_currentPage === "stock") {
          const pageContent = document.getElementById("page-content");
          if (pageContent) await renderStock(pageContent);
        }

      } catch (e) {
        errBox.textContent = `فشل ترحيل الجرد: ${e.message}`;
        errBox.classList.remove("hidden");
        btn.disabled = false;
        btn.textContent = "💾 اعتماد وترحيل الجرد";
      }
    };

  } catch (err) {
    const body = document.getElementById("stocktake-sheet-body");
    if (body) {
      body.innerHTML = `<div class="error-box" style="margin:0;">⚠️ خطأ في تحميل البيانات: ${err.message}</div>`;
    }
  }
};



/* ══════════════════════════════════
   VOICE SEARCH & CAMERA BARCODE SCANNER (البحث الصوتي وقارئ الباركود)
   ══════════════════════════════════ */

window.startVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast("⚠️ متصفحك لا يدعم البحث الصوتي", "warn");
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = "ar-SA";
  rec.continuous = false;
  rec.interimResults = false;

  toast("🎤 جاري الاستماع، تحدث الآن…", "warn");

  rec.onresult = (e) => {
    const term = e.results[0][0].transcript;
    const inp = document.getElementById("pos-search");
    if (inp) {
      inp.value = term;
      posSearch(term);
    }
    toast(`🔍 تم البحث عن: "${term}"`, "ok");
  };

  rec.onerror = (e) => {
    console.error("Speech Recognition Error:", e);
    toast("⚠️ فشل التعرف على الصوت. الرجاء المحاولة مجدداً.", "err");
  };

  rec.start();
};

window.startBarcodeScan = async () => {
  if (!window.Html5Qrcode) {
    toast("⏳ جاري تحميل قارئ الباركود…", "warn");
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("فشل تحميل مكتبة الباركود"));
        document.head.appendChild(script);
      });
    } catch(err) {
      toast("⚠️ فشل تحميل مكتبة الباركود. تحقق من اتصالك.", "err");
      return;
    }
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "barcode-scanner-overlay";
  overlay.style.zIndex = "1003";
  overlay.innerHTML = `
  <div class="modal-sheet" style="max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
    <div class="sheet-handle"></div>
    <div class="sheet-title">📷 مسح باركود المنتج بالكاميرا</div>
    <div class="sheet-body" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; overflow:hidden;">
      <div id="scanner-preview" style="width:100%; max-width:360px; aspect-ratio:1; background:#000; border-radius:12px; overflow:hidden; position:relative; border:2px solid var(--brand);">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#fff; font-size:12px;" id="scanner-loading-text">جاري تشغيل الكاميرا…</div>
      </div>
      <div style="font-size:11px; color:var(--t2); margin-top:12px; text-align:center;">
        وجه الكاميرا نحو باركود المنتج لمسحه وإضافته مباشرة إلى سلة المشتريات.
      </div>
      <div id="scanner-scanned-item" style="font-size:13px; font-weight:700; color:var(--success); margin-top:8px; text-align:center; min-height:18px;"></div>
    </div>
    <div style="padding:12px calc(12px + var(--safe-bot)) 12px 12px; border-top:1px solid var(--border); flex-shrink:0;">
      <button class="btn-primary full" id="close-scanner-btn" style="margin:0; background:var(--error);">إيقاف الكاميرا وإغلاق</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  let html5Qrcode = null;
  const stopScanning = async () => {
    if (html5Qrcode) {
      try { await html5Qrcode.stop(); } catch(e) { console.warn(e); }
    }
    overlay.remove();
  };

  document.getElementById("close-scanner-btn").onclick = stopScanning;
  overlay.onclick = (e) => { if(e.target === overlay) stopScanning(); };

  try {
    html5Qrcode = new Html5Qrcode("scanner-preview");
    const config = { fps: 10, qrbox: { width: 250, height: 120 } };

    let lastScanTime = 0;
    const scanSuccess = (decodedText) => {
      const now = Date.now();
      if (now - lastScanTime < 2000) return;
      lastScanTime = now;

      const term = decodedText.trim();
      const product = _pos.products.find(p => p.barcode === term || p.sku === term || p.id === term);

      const scannedTextEl = document.getElementById("scanner-scanned-item");

      if (product) {
        const price = product.salePrice || product.priceRetail || product.sellingPrice || product.price || 0;
        const stock = product.stockQty || 0;
        
        posTap(product.id, product.name, price, stock);

        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch(ae) { console.warn("Beep failed", ae); }

        if (scannedTextEl) {
          scannedTextEl.textContent = `✅ تم إضافة: ${product.name}`;
          scannedTextEl.style.color = "var(--success)";
        }
        toast(`✅ تم إضافة: ${product.name}`, "ok");
      } else {
        if (scannedTextEl) {
          scannedTextEl.textContent = `❌ منتج غير معروف: ${term}`;
          scannedTextEl.style.color = "var(--error)";
        }
        toast(`⚠️ الباركود ${term} غير مسجل بمخزون سيارتك`, "warn");
      }
    };

    const loadingText = document.getElementById("scanner-loading-text");
    if (loadingText) loadingText.remove();

    await html5Qrcode.start({ facingMode: "environment" }, config, scanSuccess, () => {});

  } catch (err) {
    console.error("Camera Scanner failed:", err);
    const preview = document.getElementById("scanner-preview");
    if (preview) {
      preview.innerHTML = `<div style="color:var(--error); padding:20px; font-size:12px; text-align:center;">⚠️ خطأ في فتح الكاميرا: ${err.message || "تأكد من صلاحيات الكاميرا"}</div>`;
    }
  }
};

/* ══════════════════════════════════
   BOOTSTRAP
══════════════════════════════════ */

// NO service worker registration - SW unregisters itself on activate

// Sync offline queue when app opens online
if (navigator.onLine) setTimeout(syncQueue, 3000);

// ── BOOT ──
applyTheme(_theme);
updateOfflineBadge();
loadSession();

window._booted = true;

// splash is hidden by default in new rep.html, show app or login directly
if (REP) {
  initApp();
} else {
  showLogin();
}
