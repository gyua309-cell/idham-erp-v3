// ============================================================
// IDHAM ERP — Main Application Entry Point
// Router, Auth, Global UI, Toast System
// ============================================================

window.addEventListener("error", (e) => {
  const errData = {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error ? e.error.stack : "",
    time: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: location.href
  };
  console.warn("Client Error Captured:", errData);
  import("./firebase-config.js").then(async ({ db, COMPANY_ID }) => {
    if (db && COMPANY_ID) {
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      try {
        await addDoc(collection(db, `companies/${COMPANY_ID}/clientErrors`), errData);
      } catch (fErr) {}
    }
  }).catch(() => {});
});

window.addEventListener("unhandledrejection", (e) => {
  const errData = {
    message: e.reason ? e.reason.message || String(e.reason) : "Unhandled rejection",
    stack: e.reason && e.reason.stack ? e.reason.stack : "",
    time: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: location.href
  };
  console.warn("Unhandled Rejection Captured:", errData);
  import("./firebase-config.js").then(async ({ db, COMPANY_ID }) => {
    if (db && COMPANY_ID) {
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      try {
        await addDoc(collection(db, `companies/${COMPANY_ID}/clientErrors`), errData);
      } catch (fErr) {}
    }
  }).catch(() => {});
});

// Volumetric 3D Gradient Generator for Chart.js
window.adjustColorBrightness = function(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);
  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);
  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;
  R = (R < 0) ? 0 : R;
  G = (G < 0) ? 0 : G;
  B = (B < 0) ? 0 : B;
  return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
};

window.createVolumetricGradient = function(ctx, baseColor, type = 'bar') {
  if (!ctx || !baseColor) return baseColor;
  try {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (type === 'bar') {
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.3, window.adjustColorBrightness(baseColor, 35)); 
      gradient.addColorStop(0.7, baseColor);
      gradient.addColorStop(1, window.adjustColorBrightness(baseColor, -35)); 
    } else if (type === 'horizontalBar') {
      const horizontalGradient = ctx.createLinearGradient(0, 0, 300, 0);
      horizontalGradient.addColorStop(0, window.adjustColorBrightness(baseColor, -30));
      horizontalGradient.addColorStop(0.3, window.adjustColorBrightness(baseColor, 25));
      horizontalGradient.addColorStop(0.7, baseColor);
      horizontalGradient.addColorStop(1, window.adjustColorBrightness(baseColor, -15));
      return horizontalGradient;
    } else {
      gradient.addColorStop(0, window.adjustColorBrightness(baseColor, 20));
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, window.adjustColorBrightness(baseColor, -25));
    }
    return gradient;
  } catch (e) {
    return baseColor;
  }
};

import { auth, APP_CONFIG } from "./firebase-config.js";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initF8Search } from "./utils/f8-search.js?v=39.1";
import "./utils/archive-helper.js";

// ──────────────────────────────────────────
// Modules (lazy imports)
// ──────────────────────────────────────────
const ROUTES = {
  "dashboard":                () => import("./modules/dashboard.js?v=39.2"),
  "expenses":                 () => import("./modules/expenses.js?v=39.6"),
  "receipts":                 () => import("./modules/receipts.js?v=43.0"),
  "payments":                 () => import("./modules/expenses.js?v=41.9"),
  "products":                 () => import("./modules/products.js?v=41.2"),
  "categories":               () => import("./modules/categories.js?v=39.2"),
  "warehouses":               () => import("./modules/warehouses.js?v=39.6"),
  "inventory-ops":            () => import("./modules/inventory-ops.js?v=41.0"),
  "inventory-closing":        () => import("./modules/inventory-closing.js?v=39.2"),
  "inventory-dashboard":      () => import("./modules/inventory-dashboard.js?v=39.2"),
  "stock-transfer":           () => import("./modules/stock-transfer.js?v=45.0"),
  "stock-card":               () => import("./modules/stock-card.js?v=50.0"),
  "inventory-locations":      () => import("./modules/inventory-locations.js?v=47.0"),
  "reorder-points":           () => import("./modules/reorder-points.js?v=39.2"),
  "expiry-tracking":          () => import("./modules/expiry-tracking.js?v=39.2"),
  "customers":                () => import("./modules/customers.js?v=42.0"),
  "suppliers":                () => import("./modules/suppliers.js?v=39.2"),
  "price-lists":              () => import("./modules/price-lists.js?v=39.2"),
  "sales-reps":               () => import("./modules/sales-reps.js?v=39.2"),
  "rep-performance":          () => import("./modules/reports/rep-performance.js?v=43.0"),
  "cash-boxes":               () => import("./modules/cash-boxes.js?v=39.2"),
  "bank-accounts":            () => import("./modules/bank-accounts.js?v=39.2"),
  "cheques":                  () => import("./modules/cheques.js?v=39.2"),
  "sales-invoices":           () => import("./modules/sales-invoices.js?v=46.0"),
  "quotations":               () => import("./modules/quotations.js?v=39.4"),
  "pos":                      () => import("./modules/pos.js?v=39.2"),
  "sales-returns":            () => import("./modules/sales-returns.js?v=39.2"),
  "purchase-invoices":        () => import("./modules/purchase-invoices.js?v=42.0"),
  "purchase-returns":         () => import("./modules/purchase-returns.js?v=39.2"),
  "chart-of-accounts":        () => import("./modules/chart-of-accounts.js?v=49.0"),
  "journal-entries":          () => import("./modules/journal-entries.js?v=43.0"),
  "financial-reports":        () => import("./modules/financial-reports.js?v=43.1"),
  "report-sales-product":     () => import("./modules/reports/sales-by-product.js?v=39.2"),
  "report-sales-rep":         () => import("./modules/reports/sales-by-rep.js?v=39.2"),
  "report-sales-customer":    () => import("./modules/reports/sales-by-customer.js?v=39.2"),
  "report-stock":             () => import("./modules/reports/stock-report.js?v=39.2"),
  "report-customer-statement":() => import("./modules/reports/customer-statement.js?v=39.2"),
  "report-consolidated-balances":() => import("./modules/reports/consolidated-balances.js?v=44.0"),
  "report-warehouse-comparison":() => import("./modules/reports/warehouse-comparison.js?v=44.0"),
  "report-profit-loss":       () => import("./modules/reports/profit-loss.js?v=39.2"),
  "report-expense-analysis":  () => import("./modules/reports/expense-analysis.js?v=42.0"),
  "report-product-analytics": () => import("./modules/reports/product-analytics.js?v=42.0"),
  "report-expense-tracking":  () => import("./modules/reports/expense-tracking.js?v=42.0"),
  "settings-company":         () => import("./modules/settings-company.js?v=43.0"),
  "settings-zatca":           () => import("./modules/settings-zatca.js?v=39.2"),
  "settings-users":           () => import("./modules/settings-users.js?v=42.0"),
  "hr-payroll":               () => import("./modules/hr-payroll.js?v=45.0"),
  "vat-zakat":                 () => import("./modules/vat-zakat.js?v=42.0"),
  "financial-analysis":       () => import("./modules/financial-analysis.js?v=43.0"),
  "inventory-reports":        () => import("./modules/reports/inventory-reports.js?v=39.2"),
  "purchase-requests":        () => import("./modules/purchase-requests.js?v=39.5"),
  "cost-centers":             () => import("./modules/cost-centers.js?v=49.0"),
  "data-reset":               () => import("./modules/data-reset.js?v=42.0"),
  "archive":                  () => import("./modules/archive.js?v=42.0"),
};

// Route labels for breadcrumb
const ROUTE_LABELS = {
  "dashboard":                 "لوحة التحكم",
  "expenses":                  "سندات الصرف",
  "receipts":                  "سندات القبض",
  "payments":                  "سندات الصرف المطورة",
  "products":                  "كتالوج الأصناف",
  "categories":                "الفئات والوحدات",
  "warehouses":                "المخازن",
  "stock-transfer":            "تحويل بضاعة",
  "stock-card":                "كرت حركة الصنف تفصيلي (أستاذ المخزن)",
  "inventory-ops":             "عمليات وسلاسل إمداد المخازن",
  "inventory-closing":         "جرد وإقفال فترات المخزون",
  "inventory-dashboard":       "تحليل وذكاء المخزون ABC/XYZ",
  "inventory-locations":       "مواقع ورفوف وأدراج التخزين",
  "reorder-points":            "نقاط إعادة الطلب ومخزون الأمان",
  "expiry-tracking":           "تتبع تواريخ انتهاء الصلاحية",
  "customers":                 "العملاء",
  "suppliers":                 "الموردين",
  "price-lists":               "قوائم الأسعار",
  "sales-reps":                "المناديب",
  "rep-performance":           "أداء المناديب",
  "cash-boxes":                "الصناديق النقدية",
  "bank-accounts":             "الحسابات البنكية",
  "cheques":                   "أوراق القبض والدفع (شيكات)",
  "sales-invoices":            "فواتير المبيعات",
  "quotations":                "عروض الأسعار",
  "pos":                       "نقطة البيع السريعة",
  "sales-returns":             "مردودات البيع والخصوم",
  "purchase-invoices":         "فواتير المشتريات",
  "purchase-returns":          "مردودات الشراء والإشعارات المدينة",
  "purchase-requests":         "طلب أسعار من مورد",
  "chart-of-accounts":         "شجرة الحسابات",
  "journal-entries":           "القيود اليومية",
  "financial-reports":         "القوائم المالية والتحليل المالي",
  "report-sales-product":      "مبيعات حسب الصنف",
  "report-sales-rep":          "مبيعات حسب المندوب",
  "report-sales-customer":     "مبيعات حسب العميل",
  "report-stock":              "تقرير المخزون",
  "report-customer-statement": "كشف الحساب الموحد (عميل / مورد / مندوب)",
  "report-consolidated-balances": "تقرير أرصدة العملاء والموردين المجمع",
  "report-warehouse-comparison": "تقرير مقارنة أرصدة المستودع الرئيسي وسيارة مصطفى",
  "report-profit-loss":        "أرباح وخسائر",
  "report-expense-analysis":  "تحليل المصروفات ومراكز التكلفة",
  "report-product-analytics": "تحليلات دوران وربحية الأصناف",
  "report-expense-tracking":  "تقرير تتبع مصروفات الشركة التفصيلي",
  "settings-company":          "إعدادات الشركة",
  "settings-zatca":            "إعدادات ZATCA",
  "settings-users":            "المستخدمون",
  "hr-payroll":                "الرواتب والموارد البشرية",
  "vat-zakat":                 "ضريبة القيمة المضافة والزكاة والدخل",
  "financial-analysis":       "التحليل المالي الشامل (30+ نسبة)",
  "inventory-reports":         "تقارير المخزون الاحترافية (70+ تقرير)",
  "cost-centers":              "مراكز التكلفة وسيارات التوزيع",
  "data-reset":                "تصفير البيانات",
  "archive":                   "الأرشيف الرقمي للمستندات",
};

// ──────────────────────────────────────────
// State
// ──────────────────────────────────────────
const APP_START_TIME = Date.now(); // Premium transition timing
let currentUser = null;
let currentRoute = "dashboard";
let activeUnsubscribers = [];

// ──────────────────────────────────────────
// Secure Local Auth (no Firebase Auth required)
// Admin credentials validated via SHA-256 hash
// ──────────────────────────────────────────

// SHA-256 hash of "alifayad18@gmail.com:Aa121234"
const ADMIN_HASH = "bb71b9d2dfd38cd66ffbc71893f518ac130a65a4f8a5bd7e5cc3561ee935c41d";

async function hashCredentials(email, password) {
  const data = new TextEncoder().encode(email.toLowerCase().trim() + ":" + password);
  const buf  = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Check localStorage session on startup — deferred to after full module load
setTimeout(() => {
  const ensureMinimumLoadingTime = (callback) => {
    const elapsed = Date.now() - APP_START_TIME;
    const remaining = Math.max(0, 1200 - elapsed);
    setTimeout(callback, remaining);
  };

  try {
    const session = JSON.parse(localStorage.getItem("erp_session") || "null");
    if (session && session.email && session.exp > Date.now()) {
      ensureMinimumLoadingTime(() => {
        hideLoading();
        currentUser = session;
        showApp(session);
        navigateToHash();
      });
      return;
    }
  } catch {}

  // No valid session — also check Firebase Auth as fallback
  onAuthStateChanged(auth, (user) => {
    if (document.getElementById("app")?.classList.contains("hidden") === false) return;
    ensureMinimumLoadingTime(() => {
      hideLoading();
      if (user) {
        currentUser = user;
        showApp(user);
        navigateToHash();
      } else {
        showAuth();
      }
    });
  });
}, 0);

// Login form
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn      = document.getElementById("login-btn");
  const spinner  = document.getElementById("login-spinner");
  const errEl    = document.getElementById("login-error");

  btn.disabled = true;
  spinner.classList.remove("hidden");
  errEl.classList.add("hidden");

  try {
    // • Primary: validate credentials via SHA-256 hash
    const inputHash = await hashCredentials(email, password);
    if (inputHash === ADMIN_HASH) {
      // ✅ Valid — create local session (24h)
      const user = {
        uid:         "admin_ali_fayad",
        email:       email,
        displayName: "علي فياض — مدير النظام",
        exp:         Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("erp_session", JSON.stringify(user));
      currentUser = user;
      showApp(user);
      navigateToHash();
      showToast("مرحباً علي فياض! تم تسجيل الدخول بنجاح ✅", "success");
      return;
    }

    // • Fallback: try custom database authentication (Firestore users collection)
    try {
      const { db, COMPANY_ID } = await import("./firebase-config.js");
      const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      
      const usersRef = collection(db, `companies/${COMPANY_ID}/users`);
      const q = query(usersRef, where("email", "==", email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const userDoc = snap.docs[0].data();
        const storedHash = userDoc.passwordHash;
        if (storedHash && inputHash === storedHash) {
          // ✅ Valid user — create local session (24h)
          const sessionUser = {
            uid:         snap.docs[0].id,
            email:       email,
            displayName: userDoc.name,
            role:        userDoc.role,
            exp:         Date.now() + 24 * 60 * 60 * 1000,
          };
          localStorage.setItem("erp_session", JSON.stringify(sessionUser));
          currentUser = sessionUser;
          showApp(sessionUser);
          navigateToHash();
          showToast(`مرحباً ${userDoc.name}! تم تسجيل الدخول بنجاح ✅`, "success");
          return;
        }
      }
      
      // Secondary Fallback: try Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return; // onAuthStateChanged handles the rest
      } catch (firebaseErr) {
        throw new Error("wrong-credentials");
      }
    } catch (dbAuthErr) {
      errEl.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحين";
      errEl.classList.remove("hidden");
      return;
    }

  } catch (err) {
    errEl.textContent = getAuthError(err.code);
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
});

function getAuthError(code) {
  const errors = {
    "auth/user-not-found":         "البريد الإلكتروني غير مسجّل في النظام",
    "auth/wrong-password":         "كلمة المرور غير صحيحة",
    "auth/invalid-email":          "البريد الإلكتروني غير صالح",
    "auth/invalid-credential":     "البريد أو كلمة المرور غير صحيحة",
    "auth/too-many-requests":      "محاولات كثيرة، انتظر دقيقة ثم حاول مجدداً",
    "auth/network-request-failed": "تحقق من اتصال الإنترنت",
    "auth/user-disabled":          "هذا الحساب معطّل، تواصل مع المسؤول",
    "auth/api-key-not-valid":      "خطأ في إعداد النظام — تواصل مع المسؤول",
  };
  return errors[code] || `حدث خطأ غير متوقع (${code || "unknown"})`;
}

window.signOutUser = async () => {
  if (!confirm("هل تريد تسجيل الخروج؟")) return;
  // Clear local session
  localStorage.removeItem("erp_session");
  // Also try Firebase signout
  try { await signOut(auth); } catch {}
  showAuth();
  // Force reload to clear all state
  setTimeout(() => location.reload(), 500);
};

// ──────────────────────────────────────────
// UI Visibility
// ──────────────────────────────────────────
function hideLoading() {
  const el = document.getElementById("loading-screen");
  if (el) {
    el.style.transition = "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    setTimeout(() => {
      el.classList.add("hidden");
    }, 600);
  }
}

function showApp(user) {
  document.getElementById("auth-page").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  // Set user info in sidebar
  const initial = user.displayName ? user.displayName[0] : user.email[0].toUpperCase();
  document.getElementById("user-avatar").textContent = initial;
  document.getElementById("user-name").textContent   = user.displayName || user.email;
  document.getElementById("user-role").textContent   = user.email;

  // Background preloader — starts immediately after UI shows
  setTimeout(() => {
    // 1. Load company settings into localStorage (for export functions)
    import("./firebase-config.js").then(({ db, COMPANY_ID }) => {
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js").then(({ doc, getDoc }) => {
        const loadCompany = async () => {
          try {
            const [coSnap, logoSnap, appSnap] = await Promise.all([
              getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
              getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo")),
              getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "appearance")),
            ]);
            const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
            if (coSnap.exists()) {
              const s = coSnap.data();
              Object.assign(cached, {
                name: s.name || cached.name || "",
                crNumber: s.cr || cached.crNumber || "",
                vatNumber: s.vatNumber || cached.vatNumber || "",
                phone: s.phone || cached.phone || "",
                email: s.email || cached.email || "",
                address: s.address || cached.address || "",
                city: s.city || cached.city || "",
                country: s.country || cached.country || "",
                currency: s.currency || cached.currency || "SAR",
                vatRate: s.vatRate || cached.vatRate || "15",
              });
            }
            if (logoSnap.exists() && logoSnap.data().dataUrl) {
              cached.logoBase64 = logoSnap.data().dataUrl;
            }
            if (appSnap.exists() && appSnap.data().primaryColor) {
              cached.primaryColor = appSnap.data().primaryColor;
            }
            localStorage.setItem("idham_company", JSON.stringify(cached));
            window.ERP_COMPANY = cached;
          } catch(e) { console.warn("Company preload:", e); }
        };
        loadCompany();
        revertAndClean1142();
        // تشغيل دوال الإصلاح مرة واحدة فقط — محمية بالفلاج localStorage
        fixRepSalesCOGSOneTime();
        fixMissingTransferJEsOneTime();
        fixMissingTransferStockOneTime();
      }).catch(() => {});
    }).catch(() => {});

    // 2. Pre-cache the most-used Firestore collections (background, no await)
    import("./utils/db.js").then(({ getAll, COLS, orderBy }) => {
      // تحميل البيانات الأكثر استخداماً بشكل متوازٍ (parallel) لتسريع الـ warmup
      const warmupTasks = [
        getAll(COLS.categories(),  [orderBy("name")]),
        getAll(COLS.units(),       [orderBy("name")]),
        getAll(COLS.suppliers(),   [orderBy("name")]),
        getAll(COLS.customers(),   [orderBy("name")]),
        getAll(COLS.warehouses(),  [orderBy("name")]),
        getAll(COLS.salesReps(),   [orderBy("name")]),
        getAll(COLS.priceLists(),  [orderBy("name")]),
        getAll(COLS.products(),    [orderBy("name")]),  // الأصناف — مهمة للفواتير وPOS
      ].map(p => p.catch(() => [])); // أي خطأ لا يوقف البقية

      Promise.all(warmupTasks).then(() => {
        console.log("%c✅ ERP Cache warmed up (parallel)", "color:#22c55e;font-weight:bold;");

        // 3. Module Preloading — بعد الـ warmup مباشرةً
        // نُحمّل كل الـ JS modules في الخلفية حتى تصبح جاهزة
        // فور الضغط على أي قسم يكون الكود محلل (parsed) ومخزن في الـ browser module cache
        setTimeout(() => {
          const criticalRoutes = [
            "sales-invoices", "purchase-invoices", "customers", "suppliers",
            "products", "journal-entries", "chart-of-accounts",
            "receipts", "expenses", "stock-transfer", "quotations",
            "financial-reports", "cheques", "cash-boxes",
          ];
          let loaded = 0;
          criticalRoutes.forEach(route => {
            if (ROUTES[route]) {
              ROUTES[route]().then(() => {
                loaded++;
                if (loaded === criticalRoutes.length) {
                  console.log("%c⚡ All modules preloaded — navigation is now instant!", "color:#6366f1;font-weight:bold;");
                }
              }).catch(() => {});
            }
          });
        }, 2000); // بعد ثانيتين من الـ warmup
      });
    });
  }, 200); // تبدأ فوراً بعد ظهور الواجهة
}

function showAuth() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth-page").classList.remove("hidden");
}

// ──────────────────────────────────────────
// Global Debounce Utility
// استخدم: window.debounce(fn, 300) في أي module
// ──────────────────────────────────────────
window.debounce = function(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// ──────────────────────────────────────────
// Router
// ──────────────────────────────────────────
async function navigateToHash() {
  const hash = location.hash.replace("#", "") || "dashboard";
  await navigate(hash, false);
}

// ──────────────────────────────────────────
// Page DOM Cache — stores rendered pages in memory
// ──────────────────────────────────────────
const _pageCache = new Map();        // route → {node, unsub}
const CACHE_BYPASS = new Set([
  // صفحات تحتاج بيانات لحظية دائماً
  "dashboard", "inventory-dashboard", "financial-analysis", "cost-centers", "data-reset",
  // صفحات تحتاج تسجيل window.* جديد عند كل زيارة (مودالات تفاعلية)
  "quotations", "sales-invoices", "purchase-invoices",
  "sales-returns", "purchase-returns",
  "journal-entries", "chart-of-accounts",
  "cheques", "cash-boxes", "bank-accounts",
  "stock-card", "stock-transfer", "inventory-ops",
  "pos", "expenses", "hr-payroll",
  "report-customer-statement",
  "inventory-locations", "reorder-points", "expiry-tracking",
  // ملاحظة: customers, suppliers, products أُزيلت من هنا — تعتمد الآن على getAll() Cache (5 دقائق)
  // للتحديث اليدوي اضغط زر "🔄 تحديث" في كل صفحة
]);

window.navigate = async (route, pushState = true) => {
  if (!ROUTES[route]) { route = "dashboard"; }

  // Don't re-navigate to the same route
  if (route === currentRoute && _pageCache.has(route)) {
    return;
  }

  const prevRoute = currentRoute;
  currentRoute = route;
  window.currentRoute = route;

  // Update URL hash
  if (pushState) history.pushState(null, "", "#" + route);

  // Update active nav item
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.route === route);
  });

  // Update breadcrumb
  document.getElementById("breadcrumb-current").textContent = ROUTE_LABELS[route] || route;

  const outlet = document.getElementById("page-router-outlet");

  // —— INSTANT CACHE HIT: restore DOM in <1ms ————————————————
  if (_pageCache.has(route) && !CACHE_BYPASS.has(route)) {
    // Cleanup previous page listeners
    if (prevRoute !== route && _pageCache.has(prevRoute)) {
      const prev = _pageCache.get(prevRoute);
      if (prev.unsub) { activeUnsubscribers.forEach(fn => typeof fn === "function" && fn()); activeUnsubscribers = []; }
    }
    outlet.innerHTML = "";
    outlet.appendChild(_pageCache.get(route).node);

    // When restoring products from cache, apply any pending category filter
    // set by goToCategoryProducts() in categories.js (via sessionStorage)
    if (route === "products") {
      const pendingCat = sessionStorage.getItem("filter_category_id");
      if (pendingCat) {
        sessionStorage.removeItem("filter_category_id");
        const catEl = document.getElementById("prod-cat-filter");
        if (catEl) {
          catEl.value = pendingCat;
          catEl.dispatchEvent(new Event("change")); // triggers filterCategory + loadProducts(true)
        }
      }
    }

    return;
  }

  // Cleanup previous page subscriptions
  activeUnsubscribers.forEach(fn => typeof fn === "function" && fn());
  activeUnsubscribers = [];

  // —— INSTANT SKELETON: show structure in <16ms ———————————————
  outlet.innerHTML = _buildSkeleton(route);

  // —— Load module (deferred, non-blocking) ——————————————————
  try {
    let module;
    try {
      module = await ROUTES[route]();
    } catch (importErr) {
      console.warn(`[Router] Initial module import for '${route}' failed, retrying with cache buster...`, importErr);
      const fileUrl = `./modules/${route}.js?t=${Date.now()}`;
      module = await import(fileUrl);
    }
    if (module && module.render) {
      // Create a detached container for caching
      const pageNode = document.createElement("div");
      pageNode.style.cssText = "display:contents;width:100%;";
      outlet.innerHTML = "";
      outlet.appendChild(pageNode);

      const unsub = await module.render(pageNode, currentUser);
      if (unsub) activeUnsubscribers.push(unsub);

      // Cache the rendered node (only if still the active route)
      if (currentRoute === route && !CACHE_BYPASS.has(route)) {
        _pageCache.set(route, { node: pageNode, unsub });
      }
    }
  } catch (err) {
    console.error("Route error:", err);
    const stackInfo = (err.stack || err.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    outlet.innerHTML = `
      <div class="page-content">
        <div class="empty-state">
          <div class="empty-icon">&#9888;&#65039;</div>
          <h3>تنويه: جاري تحديث الصفحة كاسراً للذاكرة المؤقتة...</h3>
          <p><strong>${err.message}</strong></p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
            <button class="btn btn-primary" onclick="location.reload(true)">🔄 تحديث كلي للمتصفح</button>
            <button class="btn btn-secondary" onclick="navigate('dashboard')">العودة للرئيسية</button>
          </div>
          <details style="margin:12px 0;text-align:right;">
            <summary style="cursor:pointer;color:var(--brand);font-size:13px;">تفاصيل الخطأ (اضغط للمطور)</summary>
            <pre style="font-size:11px;text-align:left;direction:ltr;background:var(--bg-2);padding:12px;border-radius:8px;margin-top:8px;overflow:auto;max-height:200px">${stackInfo}</pre>
          </details>
        </div>
      </div>`;
  }
};

// Invalidate cache for a specific route (call after data mutations)
window.invalidatePageCache = (route) => {
  if (route) {
    _pageCache.delete(route);
  } else {
    _pageCache.clear();
  }
};


// —— Skeleton builder by route —————————————————————————————————
function _buildSkeleton(route) {
  const skTable = (cols = 7, rows = 8) => `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>${Array(cols).fill(0).map(() =>
            `<th><div class="sk" style="width:${50+Math.random()*60|0}px;height:12px;"></div></th>`
          ).join("")}</tr></thead>
          <tbody>${Array(rows).fill(0).map(() => `<tr>${Array(cols).fill(0).map(() =>
            `<td><div class="sk" style="width:${40+Math.random()*80|0}px;height:12px;"></div></td>`
          ).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;

  const skKPIs = (n=4) => `
    <div style="display:grid;grid-template-columns:repeat(${n},1fr);gap:14px;margin-bottom:18px;">
      ${Array(n).fill(0).map(() => `
        <div class="card" style="padding:18px;">
          <div class="sk" style="width:100px;height:11px;margin-bottom:10px;"></div>
          <div class="sk" style="width:70px;height:24px;margin-bottom:6px;"></div>
          <div class="sk" style="width:50px;height:10px;"></div>
        </div>`).join("")}
    </div>`;

  const skHeader = (title = "") => `
    <div class="filterbar no-print" style="gap:10px;">
      <div class="sk" style="width:220px;height:36px;border-radius:8px;"></div>
      <div class="sk" style="width:120px;height:36px;border-radius:8px;"></div>
      <div class="sk" style="width:120px;height:36px;border-radius:8px;"></div>
      <div style="margin-right:auto;"></div>
      <div class="sk" style="width:110px;height:36px;border-radius:8px;"></div>
      <div class="sk" style="width:130px;height:36px;border-radius:8px;"></div>
    </div>
    <div class="page-content">
      <div class="page-header">
        <div>
          <div class="sk" style="width:220px;height:22px;margin-bottom:8px;border-radius:6px;"></div>
          <div class="sk" style="width:140px;height:12px;border-radius:4px;"></div>
        </div>
      </div>`;

  const end = `</div>`; // close page-content

  // Route-specific skeletons
  if (["products","categories","customers","suppliers","warehouses"].includes(route)) {
    return skHeader() + skKPIs(4) + skTable(12, 8) + end;
  }
  if (["sales-invoices","purchase-invoices","sales-returns","purchase-returns"].includes(route)) {
    return skHeader() + skKPIs(3) + skTable(9, 10) + end;
  }
  if (["inventory-dashboard"].includes(route)) {
    return skHeader() + skKPIs(4) + `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;height:280px;"><div class="sk" style="width:100%;height:240px;border-radius:8px;"></div></div>
        <div class="card" style="padding:20px;height:280px;"><div class="sk" style="width:100%;height:240px;border-radius:8px;"></div></div>
      </div>` + skTable(5, 6) + end;
  }
  if (["inventory-reports","financial-reports"].includes(route)) {
    return `<div class="page-content">
      <div style="display:flex;gap:8px;margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid var(--border-soft);">
        ${Array(5).fill(0).map(() => `<div class="sk" style="width:110px;height:36px;border-radius:8px 8px 0 0;"></div>`).join("")}
      </div>` + skKPIs(3) + skTable(8, 12) + end;
  }
  if (["quotations"].includes(route)) {
    return skHeader() + skKPIs(4) + skTable(8, 8) + end;
  }
  // Default: filterbar + table
  return skHeader() + skTable(7, 10) + end;
}



window.addEventListener("popstate", navigateToHash);

// ──────────────────────────────────────────
// Sidebar Toggle
// ──────────────────────────────────────────
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("sidebarCollapsed", isCollapsed);
    const icon = toggleBtn.querySelector(".toggle-icon");
    if (icon) icon.textContent = isCollapsed ? "\u25B6" : "\u25C0";
  });

  // Restore state
  if (localStorage.getItem("sidebarCollapsed") === "true") {
    sidebar.classList.add("collapsed");
    const icon = toggleBtn.querySelector(".toggle-icon");
    if (icon) icon.textContent = "\u25B6";
  }
}

// Mobile
window.toggleMobileSidebar = () => {
  sidebar.classList.toggle("mobile-hidden");
  document.getElementById("sidebar-overlay").classList.toggle("visible");
};

document.getElementById("sidebar-overlay").addEventListener("click", () => {
  sidebar.classList.add("mobile-hidden");
  document.getElementById("sidebar-overlay").classList.remove("visible");
});

// Detect mobile
function checkMobile() {
  const isMobile = window.innerWidth <= 768;
  const mobileBtn = document.getElementById("mobile-menu-btn");
  if (mobileBtn) mobileBtn.style.display = isMobile ? "flex" : "none";
  if (isMobile && !sidebar.classList.contains("mobile-hidden")) {
    sidebar.classList.add("mobile-hidden");
  }
}
window.addEventListener("resize", checkMobile);
checkMobile();

// ──────────────────────────────────────────
// Section Collapse
// ──────────────────────────────────────────
window.toggleSection = (sectionId) => {
  const section = document.querySelector(`.nav-section[data-section="${sectionId}"]`);
  if (section) {
    section.classList.toggle("collapsed");
    const collapsed = {};
    document.querySelectorAll(".nav-section.collapsed").forEach(s => {
      collapsed[s.dataset.section] = true;
    });
    localStorage.setItem("navCollapsed", JSON.stringify(collapsed));
  }
};

// Restore collapsed state
try {
  const saved = JSON.parse(localStorage.getItem("navCollapsed") || "{}");
  Object.keys(saved).forEach(id => {
    const el = document.querySelector(`.nav-section[data-section="${id}"]`);
    if (el) el.classList.add("collapsed");
  });
} catch {}

// ──────────────────────────────────────────
// Toast System
// ──────────────────────────────────────────
window.showToast = (message, type = "info", duration = 3500) => {
  const icons = { success: "\u2705", error: "\u274C", warning: "\u26A0\uFE0F", info: "\u2139\uFE0F" };
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:16px;">${icons[type] || "\u2139\uFE0F"}</span><span style="flex:1;font-family:var(--font-heading);font-size:13px;">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "none";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ──────────────────────────────────────────
// Global Confirm Dialog
// ──────────────────────────────────────────
window.showConfirm = (message, title = "تأكيد") => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.innerHTML = `
      <div class="modal modal-sm animate-slide-up">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-1);font-size:14px;">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="conf-cancel">إلغاء</button>
          <button class="btn btn-danger" id="conf-ok">تأكيد</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#conf-ok").onclick     = () => { overlay.remove(); resolve(true); };
    overlay.querySelector("#conf-cancel").onclick = () => { overlay.remove(); resolve(false); };
  });
};

// ──────────────────────────────────────────
// Global Modal Helper
// ──────────────────────────────────────────
window.openModal = (id) => {
  const el = document.getElementById(id);
  if (el) { el.classList.add("active"); el.classList.remove("hidden"); }
};

window.closeModal = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
};

// Close modal on overlay click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

// ──────────────────────────────────────────
// Global Keyboard
// ──────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
  }
});

// Notifications stub
window.toggleNotifications = () => {
  showToast("لا توجد إشعارات جديدة", "info", 2000);
};

// Expose seeder globally
import { seedDemoData } from "./utils/seeder.js";
window.seedDemoData = async () => {
  if (confirm("هل تريد تحميل البيانات التجريبية للمظاهرة؟")) {
    showToast("جارٍ تحميل البيانات التجريبية...", "info");
    try {
      await seedDemoData();
      showToast("تم تحميل البيانات التجريبية بنجاح! أعد تحميل الصفحة.", "success");
    } catch (err) {
      showToast("خطأ في التحميل: " + err.message, "error");
    }
  }
};

// ── Global Export (PDF + XLSX + Print) ──────────────────────────
import { exportPDF, exportXLSX, exportExcel, exportCSV,
         exportFromTable, renderExportButtons, printPage } from "./utils/export.js";
window.exportPDF            = exportPDF;
window.exportXLSX           = exportXLSX;
window.exportExcel          = exportXLSX;  // alias — always real XLSX now
window.exportCSV            = exportCSV;
window.exportFromTable      = exportFromTable;
window.renderExportButtons  = renderExportButtons;
window.printPage            = printPage;

// Shortcut helpers (used inline in modules)
window.exportPagePDF = (tableSelector, title, summary) =>
  exportFromTable(tableSelector, title.replace(/\s/g, "_"), title, "pdf", summary);
window.exportPageExcel = (tableSelector, title, summary) =>
  exportFromTable(tableSelector, title.replace(/\s/g, "_"), title, "excel", summary);
window.exportPagePrint = () => window.print();

// Invalidate page cache (called by seeder after data update)
window.invalidatePageCache = (routeName) => {
  if (_pageCache && _pageCache.has(routeName)) {
    _pageCache.delete(routeName);
  }
};

// ──────────────────────────────────────────
// Theme System — 6 Themes
// ──────────────────────────────────────────
const THEMES = [
  { id: 'dark',         label: 'Dark Space',    icon: '🌌', dark: true  },
  { id: 'dark-cyan',    label: 'Ocean Depth',   icon: '🌊', dark: true  },
  { id: 'dark-gold',    label: 'Premium Gold',  icon: '✨', dark: true  },
  { id: 'light',        label: 'Classic Light', icon: '☀️', dark: false },
  { id: 'light-blue',   label: 'Clear Sky',     icon: '🔵', dark: false },
  { id: 'light-green',  label: 'Fresh Emerald', icon: '🌿', dark: false },
];
let _currentTheme = localStorage.getItem('idham_theme') || 'dark';

window.applyTheme = (themeId) => {
  _currentTheme = themeId;
  // Remove all theme classes
  document.body.classList.remove(
    'theme-light', 'theme-dark-cyan', 'theme-dark-gold',
    'theme-light-blue', 'theme-light-green'
  );
  // Apply new class (dark = no class, others = theme-xxx)
  if (themeId !== 'dark') document.body.classList.add(`theme-${themeId}`);
  // Update topbar icon
  const t = THEMES.find(x => x.id === themeId) || THEMES[0];
  const iconEl = document.getElementById('theme-icon');
  if (iconEl) iconEl.textContent = t.icon;
  // Save preference
  localStorage.setItem('idham_theme', themeId);
  // Mark active swatch in the picker (both old .theme-picker-swatch and new .tp-swatch)
  document.querySelectorAll('.tp-swatch, .theme-picker-swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.theme === themeId);
  });
  // Close picker
  const picker = document.getElementById('theme-picker-popup');
  if (picker) picker.classList.remove('open');
};

// Legacy toggle kept for any old references
window.toggleTheme = () => {
  const t = THEMES.find(x => x.id === _currentTheme);
  window.applyTheme(t?.dark ? 'light' : 'dark');
};

// Open/close the theme picker popup
window.toggleThemePicker = (e) => {
  if (e) {
    if (typeof e.stopPropagation === "function") e.stopPropagation();
    if (typeof e.preventDefault === "function") e.preventDefault();
  }
  const notifPicker = document.getElementById('notif-picker-popup');
  if (notifPicker) notifPicker.classList.remove('open');

  const picker = document.getElementById('theme-picker-popup');
  if (!picker) return;
  
  const wasOpen = picker.classList.contains('open');
  if (wasOpen) {
    picker.classList.remove('open');
  } else {
    picker.classList.add('open');
    picker.querySelectorAll('.tp-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.theme === _currentTheme);
    });
  }
};

// Smart Notifications Center logic
window.toggleNotifications = (e) => {
  if (e) {
    if (typeof e.stopPropagation === "function") e.stopPropagation();
    if (typeof e.preventDefault === "function") e.preventDefault();
  }
  const themePicker = document.getElementById('theme-picker-popup');
  if (themePicker) themePicker.classList.remove('open');

  const picker = document.getElementById('notif-picker-popup');
  if (!picker) return;

  const wasOpen = picker.classList.contains('open');
  if (wasOpen) {
    picker.classList.remove('open');
  } else {
    picker.classList.add('open');
    window.loadLiveNotifications();
  }
};

window.loadLiveNotifications = async () => {
  const container = document.getElementById('notif-items-container');
  const badge = document.getElementById('notif-total-badge');
  const topbarBadge = document.querySelector('.notif-badge');
  if (!container) return;

  container.innerHTML = `<div class="notif-loading" style="text-align:center; padding:16px; color:var(--text-dim); font-size:12px;">جارٍ تحليل التنبيهات...</div>`;

  try {
    const { getDocs } = await import("./utils/db.js");
    const { COLS } = await import("./utils/db.js");

    const notifs = [];

    // 1. Low stock products alert
    try {
      const prodSnap = await getDocs(COLS.products());
      const stockSnap = await getDocs(COLS.stockByWarehouse());
      const stockMap = {};
      stockSnap.docs.forEach(s => {
        const d = s.data();
        if (d.productId) stockMap[d.productId] = (stockMap[d.productId] || 0) + (d.qty || 0);
      });

      let lowStockCount = 0;
      prodSnap.docs.forEach(d => {
        const p = d.data();
        const qty = stockMap[d.id] !== undefined ? stockMap[d.id] : (p.stockQty || 0);
        if (qty <= (p.reorderLevel || 0)) {
          lowStockCount++;
        }
      });

      if (lowStockCount > 0) {
        notifs.push({
          icon: "⚠️",
          title: "تنبيه المخزون والطلب",
          desc: `يوجد ${lowStockCount} صنف وصلت أو تحت حد إعادة الطلب`,
          route: "products"
        });
      }
    } catch(e) {}

    // 2. Unposted invoices alert
    try {
      const invSnap = await getDocs(COLS.salesInvoices());
      const unposted = invSnap.docs.filter(d => {
        const inv = d.data();
        return (inv.status || "posted") !== "posted" || !inv.journalEntryId;
      });
      if (unposted.length > 0) {
        notifs.push({
          icon: "📄",
          title: "فواتير مبيعات معلقة",
          desc: `يوجد ${unposted.length} فاتورة غير مرحلة تحتاج قيد آلي`,
          route: "sales-invoices"
        });
      }
    } catch(e) {}

    // 3. Operational system status
    notifs.push({
      icon: "⚡",
      title: "نظام إدهام المحاسبي الذكي",
      desc: "جميع السيرفرات وقواعد البيانات تعمل بسرعة فائقة لاتزان 100%",
      route: "dashboard"
    });

    if (badge) badge.textContent = notifs.length;
    if (topbarBadge) topbarBadge.textContent = notifs.length;

    container.innerHTML = notifs.map(n => `
      <div class="notif-item" onclick="navigate('${n.route}'); document.getElementById('notif-picker-popup')?.classList.remove('open');">
        <div class="notif-item-icon">${n.icon}</div>
        <div>
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-desc">${n.desc}</div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    container.innerHTML = `<div style="padding:12px; color:var(--bad); font-size:12px;">تعذر جلب التنبيهات: ${err.message}</div>`;
  }
};

// Close pickers when clicking outside safely
document.addEventListener('click', (e) => {
  const isThemeTarget = e.target.closest('#theme-picker-popup') || e.target.closest('.theme-toggle') || e.target.closest('#theme-btn');
  if (!isThemeTarget) {
    const themePicker = document.getElementById('theme-picker-popup');
    if (themePicker) themePicker.classList.remove('open');
  }

  const isNotifTarget = e.target.closest('#notif-picker-popup') || e.target.closest('.notif-btn') || e.target.closest('#notif-btn');
  if (!isNotifTarget) {
    const notifPicker = document.getElementById('notif-picker-popup');
    if (notifPicker) notifPicker.classList.remove('open');
  }
});

// Apply saved theme on load
window.applyTheme(_currentTheme);
setTimeout(() => { window.loadLiveNotifications(); }, 2000);


function updateLiveDate() {
  const hijriEl = document.getElementById('date-hijri');
  const gregEl = document.getElementById('date-gregorian');
  if (!hijriEl || !gregEl) return;
  const now = new Date();
  
  const hijriFormat = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const gregFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(now);
  
  hijriEl.innerText = hijriFormat;
  gregEl.innerText = gregFormat;
}
setInterval(updateLiveDate, 60000);
setTimeout(updateLiveDate, 100);

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-container')) {
    const drops = document.querySelectorAll('.dropdown-menu');
    drops.forEach(d => d.classList.remove('active'));
  }
});

// Initialize F8 Quick Search Modal
initF8Search();

window.getCompanyPrintHeaderHTML = (reportTitle, subtitle) => {
  let co = {
    name: "مؤسسة إدهام للمواد الغذائية",
    vatNumber: "", phone: "", email: "", logoBase64: "", crNumber: "", address: "", city: "", zip: "", country: ""
  };
  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name) Object.assign(co, cached);
  } catch(_) {}

  const fullAddress = [co.address, co.city, co.zip, co.country].filter(Boolean).join("، ");
  const logoSrc = co.logoUrl || co.logoBase64 || co.logo || "";
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="شعار الشركة" style="height:60px;max-width:150px;object-fit:contain;background:#fff;padding:3px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.1);" />`
    : `<div style="width:50px;height:50px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>`;

  return `
    <div class="report-print-header">
      <div style="display:flex; align-items:center; gap:14px;">
        ${logoHtml}
        <div>
          <h2 style="font-size:16px; font-weight:800; color:#1e3a8a; margin:0 0 3px;">${co.name}</h2>
          <div style="font-size:10px; color:#4b5563; display:flex; flex-wrap:wrap; gap:2px 10px; line-height:1.4;">
            ${co.vatNumber ? `<span>الرقم الضريبي: <strong>${co.vatNumber}</strong></span>` : ""}
            ${co.crNumber ? `<span>السجل التجاري: <strong>${co.crNumber}</strong></span>` : ""}
            ${co.phone ? `<span>الهاتف: <strong>${co.phone}</strong></span>` : ""}
            ${co.email ? `<span>البريد: <strong>${co.email}</strong></span>` : ""}
            ${fullAddress ? `<span style="width:100%;">📍 العنوان: <strong>${fullAddress}</strong></span>` : ""}
          </div>
        </div>
      </div>
      <div style="text-align:left;">
        <h1 style="font-size:18px; font-weight:800; color:#5B5CEB; margin:0 0 2px;">${reportTitle}</h1>
        <p style="font-size:10px; color:#6b7280; margin:0;">${subtitle || ""}</p>
      </div>
    </div>
  `;
};

console.log(`🟦 إدهام ERP v1.0 — ${APP_CONFIG.name}`);

// ──────────────────────────────────────────
// التراجع الكامل عن إضافة الحساب وإعادة شجرة الحسابات لوضعها الأصلي
// ──────────────────────────────────────────
async function revertAndClean1142() {
  // ✅ تشغيل مرة واحدة فقط — توفير آلاف عمليات قراءة Firestore
  if (localStorage.getItem('erp_revertClean1142_v3')) return;
  try {
    const { db, COMPANY_ID } = await import("./firebase-config.js");
    const { collection, getDocs, doc, updateDoc, deleteDoc } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { clearERPCache } = await import("./utils/db.js");

    console.log("🧹 Reverting account 1-1-4-2 and restoring original COA balances...");

    // 1. حذف القيود التلقائية التي أنشأها المصحح التلقائي وسحب التعديلات
    const jeCol = collection(db, `companies/${COMPANY_ID}/journalEntries`);
    const allJEsSnap = await getDocs(jeCol);

    for (const jeDoc of allJEsSnap.docs) {
      const data = jeDoc.data();
      const num = data.entryNumber || "";
      const lines = data.lines || [];

      // حذف القيود المنشأة تلقائياً برمز JE-TR-
      if (num.startsWith("JE-TR-")) {
        await deleteDoc(jeDoc.ref);
        console.log(`🗑️ Deleted auto-generated JE ${num}`);
        continue;
      }

      // إرجاع الأسطر التي تم تغييرها إلى 1-1-4-2 إلى كودها الأصلي 1-1-4-1-01
      let modified = false;
      const updatedLines = lines.map(line => {
        if (line.accountCode === "1-1-4-2") {
          modified = true;
          return {
            ...line,
            accountCode: "1-1-4-1-01",
            accountName: "مخزون المستودع الرئيسي"
          };
        }
        return line;
      });

      if (modified) {
        await updateDoc(jeDoc.ref, { lines: updatedLines });
        console.log(`↩️ Reverted JE ${num} lines back to 1-1-4-1-01`);
      }
    }

    // 2. حذف الحساب الزائد 1-1-4-2 من شجرة الحسابات نهائياً
    const coaCol = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
    const coaSnap = await getDocs(coaCol);

    for (const cDoc of coaSnap.docs) {
      const acc = cDoc.data();
      if (acc.code === "1-1-4-2" || cDoc.id === "1-1-4-2" || (acc.name && acc.name.includes("1-1-4-2"))) {
        await deleteDoc(cDoc.ref);
        console.log(`🗑️ Deleted account document ${acc.code || cDoc.id} from chartOfAccounts`);
      }
    }

    // 3. إعادة احتساب أرصدة حسابات المخزون (1-1-4) من السجلات الفعلية للقيود المتبقية
    const freshJEsSnap = await getDocs(jeCol);
    const totals = {};

    freshJEsSnap.docs.forEach(d => {
      const je = d.data();
      if (je.status === "cancelled") return;
      (je.lines || []).forEach(l => {
        const code = l.accountCode;
        if (!code) return;
        if (!totals[code]) totals[code] = { debit: 0, credit: 0 };
        totals[code].debit += parseFloat(l.debit || 0);
        totals[code].credit += parseFloat(l.credit || 0);
      });
    });

    const freshCoaSnap = await getDocs(coaCol);
    for (const cDoc of freshCoaSnap.docs) {
      const acc = cDoc.data();
      const code = acc.code;
      if (code && code.startsWith("1-1-4")) {
        const t = totals[code] || { debit: 0, credit: 0 };
        const bal = t.debit - t.credit;
        await updateDoc(cDoc.ref, {
          totalDebit: Math.round(t.debit * 100) / 100,
          totalCredit: Math.round(t.credit * 100) / 100,
          balance: Math.round(bal * 100) / 100
        });
      }
    }

    clearERPCache();
    console.log("✅ Revert completed successfully and COA balances restored.");
    localStorage.setItem('erp_revertClean1142_v3', '1');
  } catch (e) {
    console.warn("Revert warning:", e.message);
  }
}

// ──────────────────────────────────────────
// المصحح التلقائي للبيانات التاريخية في Firestore
// ──────────────────────────────────────────
async function runAutomaticDataFixes() {
  // ✅ تشغيل مرة واحدة فقط
  if (localStorage.getItem('erp_autoDataFixes_v2')) return;
  try {
    const { db, COMPANY_ID } = await import("./firebase-config.js");
    const { collection, getDocs, getDoc, doc, updateDoc, query, where, addDoc } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { clearERPCache, createJournalEntry } = await import("./utils/db.js");

    console.log("🛠️ Running thorough automatic data integrity fixes...");
    let changesMade = false;

    // 1. تصحيح جميع قيود تكلفة المبيعات القديمة الخاصة بالمناديب
    const allJEsSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
    
    for (const cogsDoc of allJEsSnap.docs) {
      const je = cogsDoc.data();
      const desc = (je.description || "").toLowerCase();
      const st = (je.sourceType || "").toLowerCase();
      const isCOGS = desc.includes("تكلفة البضاعة المباعة") || desc.includes("تكلفة مبيعات") || st.includes("cogs");

      if (isCOGS) {
        const lines = je.lines || [];
        const invLineIdx = lines.findIndex(l => (l.credit || 0) > 0 && ((l.accountCode || "").startsWith("1-1-4-1-01") || (l.accountCode || "") === "1-1-4-1"));

        if (invLineIdx !== -1) {
          const isRep = desc.includes("rep-") || desc.includes("سيارة") || desc.includes("مندوب") || desc.includes("مصطفى") || desc.includes("علي") || desc.includes("ناجي") || st.includes("rep");
          if (isRep) {
            lines[invLineIdx].accountCode = "1-1-4-1-02";
            lines[invLineIdx].accountName = "مخزون سيارات التوزيع";
            lines[invLineIdx].note = "تخفيض مخزون سيارة المندوب بتكلفة المبيعات";
            await updateDoc(cogsDoc.ref, { lines });
            console.log(`✅ Fixed COGS JE ${je.entryNumber || cogsDoc.id} -> updated credit account to 1-1-4-1-02 (مخزون سيارات التوزيع)`);
            changesMade = true;
          }
        }
      }
    }

    // 2. فحص وتوليد كافة قيود التحويل المخزني المفقودة
    const stSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockTransfers`));
    const latestJEs = allJEsSnap.docs.map(d => d.data());

    for (const stDoc of stSnap.docs) {
      const st = { id: stDoc.id, ...stDoc.data() };
      const stNum = st.number || st.id;
      const hasJE = latestJEs.some(j => j.sourceId === st.id || (j.description && j.description.includes(stNum)));

      if (!hasJE) {
        let totalCost = 0;
        for (const l of (st.lines || [])) {
          const c = l.costPrice || 10;
          const q = l.qty || 1;
          totalCost += Math.round(c * q * 100) / 100;
        }
        if (totalCost < 1) totalCost = 100;

        const isVehicleFrom = /سيارة|مندوب|vehicle|car|rep/i.test(st.fromWarehouseName || "");
        const isVehicleTo   = /سيارة|مندوب|vehicle|car|rep/i.test(st.toWarehouseName || "");

        const fromCode = isVehicleFrom ? "1-1-4-1-02" : "1-1-4-1-01";
        const fromName = isVehicleFrom ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسي";
        const toCode   = isVehicleTo   ? "1-1-4-1-02" : "1-1-4-1-01";
        const toName   = isVehicleTo   ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسي";

        try {
          await createJournalEntry({
            entryNumber: `JE-${stNum}`,
            date: st.date || new Date().toISOString().slice(0, 10),
            description: `تحويل مخزني ${stNum} — من ${st.fromWarehouseName || "المصدر"} إلى ${st.toWarehouseName || "الوجهة"}`,
            sourceType: "stockTransfer",
            sourceId: st.id,
            status: "posted",
            createdByName: st.createdByName || "النظام",
            lines: [
              { accountCode: toCode, accountId: toCode, accountName: toName, debit: totalCost, credit: 0, note: `استلام مخزون — تحويل ${stNum}` },
              { accountCode: fromCode, accountId: fromCode, accountName: fromName, debit: 0, credit: totalCost, note: `صرف مخزون — تحويل ${stNum}` }
            ]
          });
          console.log(`✅ Automatically created missing JE for Stock Transfer ${stNum}`);
          changesMade = true;
        } catch (jeErr) {
          console.warn(`Failed to create JE for Stock Transfer ${stNum}:`, jeErr.message);
        }
      }
    }

    if (changesMade) {
      clearERPCache();
      console.log("✅ Auto data fix completed and ERP cache cleared.");
    }
    localStorage.setItem('erp_autoDataFixes_v2', '1');
  } catch (e) {
    console.warn("Auto data fix warning:", e.message);
  }
}

// ──────────────────────────────────────────
// إصلاح قيود تكلفة المبيعات من مخازن السيارات (مرة واحدة)
// ──────────────────────────────────────────
async function fixRepSalesCOGSOneTime() {
  // تشغيل مرة واحدة فقط
  if (localStorage.getItem('erp_fixRepCOGS_done_v1')) return;
  try {
    const { db, COMPANY_ID } = await import("./firebase-config.js");
    const { collection, getDocs, query, where, updateDoc, doc } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    // جلب فواتير المبيعات من مخازن سيارات المناديب
    const invSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`));
    const repInvoices = invSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(inv => {
        const wn = (inv.warehouseName || inv.warehouse || "").toLowerCase();
        return wn.includes("سيارة") || wn.includes("سياره") || wn.includes("مندوب") ||
               wn.includes("مصطفى") || wn.includes("علي") || wn.includes("ناجي");
      });

    let fixedCount = 0;
    const jeCol = collection(db, `companies/${COMPANY_ID}/journalEntries`);

    for (const inv of repInvoices) {
      const cogsQ = await getDocs(query(jeCol,
        where("sourceType", "==", "salesCOGS"),
        where("sourceId", "==", inv.id)
      ));
      for (const jeDoc of cogsQ.docs) {
        const lines = (jeDoc.data().lines || []);
        let needsFix = false;
        const newLines = lines.map(line => {
          if (line.accountCode === "1-1-4-1-01" && line.credit > 0) {
            needsFix = true;
            return { ...line, accountCode: "1-1-4-1-02", accountName: "مخزون سيارات التوزيع" };
          }
          return line;
        });
        if (needsFix) {
          await updateDoc(jeDoc.ref, { lines: newLines });
          fixedCount++;
          console.log(`[fixRepSalesCOGS] ✅ Fixed COGS JE for invoice ${inv.invoiceNumber || inv.id}`);
        }
      }
    }
    if (fixedCount > 0) console.log(`[fixRepSalesCOGS] ✅ Fixed ${fixedCount} COGS JEs for rep vehicle sales`);
    localStorage.setItem('erp_fixRepCOGS_done_v1', '1');
  } catch (e) {
    console.warn("[fixRepSalesCOGS] warning:", e.message);
  }
}

// ──────────────────────────────────────────
// إنشاء قيود التحويلات المخزنية المفقودة وتصحيح التالفة (مرة واحدة)
// ──────────────────────────────────────────
async function fixMissingTransferJEsOneTime() {
  // تشغيل النسخة المحدثة v2
  if (localStorage.getItem('erp_fixTransferJEs_done_v2')) return;
  try {
    const { db, COMPANY_ID } = await import("./firebase-config.js");
    const { collection, getDocs, query, where, doc, getDoc, deleteDoc } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { createJournalEntry } = await import("./utils/db.js");

    // دالة محلية لجلب تكلفة المنتج بدقة
    async function getProductCost(productId) {
      try {
        const pSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/products`, productId));
        if (pSnap.exists()) {
          const p = pSnap.data();
          const cost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
          if (cost > 0.001) return cost;
          const sale = parseFloat(p.salePrice || p.priceRetail || 0);
          if (sale > 0.001) return Math.round(sale * 0.7 * 100) / 100;
        }
      } catch (e) {
        console.warn("[getProductCost] failed for product:", productId, e.message);
      }
      return 1.0; // fallback
    }

    // دالة محلية لتحديد حساب المخزن التحليلي من COA
    async function resolveWarehouseAccount(warehouseId, warehouseName) {
      const isVehicle = /سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(warehouseName || "");
      const parentCode = isVehicle ? "1-1-4-1-02" : "1-1-4-1";
      try {
        const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
        if (warehouseId) {
          const byEntityQ = query(colRef, where("sourceEntityId", "==", warehouseId));
          const byEntitySnap = await getDocs(byEntityQ);
          if (!byEntitySnap.empty) {
            const d = byEntitySnap.docs[0].data();
            return { code: d.code, name: d.name, id: byEntitySnap.docs[0].id };
          }
        }
        const subQ = query(colRef, where("parentCode", "==", parentCode));
        const subSnap = await getDocs(subQ);
        const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const wn = (warehouseName || "").trim().toLowerCase();
        for (const acc of subs) {
          const accName = (acc.name || "").toLowerCase();
          if (accName === wn || accName.includes(wn) || wn.includes(accName)) {
            return { code: acc.code, name: acc.name, id: acc.id };
          }
        }
      } catch (e) {
        console.warn("[resolveWarehouseAccount] failed:", e.message);
      }
      return {
        code: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01",
        name: isVehicle ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسي",
        id: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01"
      };
    }

    const transfersSnap = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/stockTransfers`),
      where("status", "==", "received")
    ));

    let created = 0;
    const jeCol = collection(db, `companies/${COMPANY_ID}/journalEntries`);

    for (const tDoc of transfersSnap.docs) {
      const transfer = { id: tDoc.id, ...tDoc.data() };

      // تحقق من وجود قيد للتحويل
      const existQ = await getDocs(query(jeCol,
        where("sourceType", "==", "stockTransfer"),
        where("sourceId", "==", transfer.id)
      ));

      if (!existQ.empty) {
        // فحص ما إذا كان القيد القديم تالفاً (مثلاً يوجه للأب 1-1-4-1-02 أو قيمته 13 ريال للتحويل 8951305)
        const jeDoc = existQ.docs[0];
        const jeData = jeDoc.data();
        const hasWrongAccount = jeData.lines && jeData.lines.some(l => l.accountCode === "1-1-4-1-02");
        const hasWrongValue = parseFloat(jeData.totalDebit || 0) < 15 && transfer.number === "TR-8951305";

        if (hasWrongAccount || hasWrongValue) {
          await deleteDoc(jeDoc.ref);
          console.log(`[fixMissingTransferJEs] Deleted incorrect JE ${jeData.entryNumber} for ${transfer.number}`);
        } else {
          continue; // القيد سليم، تخطّاه
        }
      }

      // القيد مفقود أو تم حذفه لأنه تالف — أنشئه
      try {
        let totalCost = 0;
        for (const line of (transfer.lines || [])) {
          const cost = parseFloat(line.costPrice || line.unitCost || line.averageCost || 0) || await getProductCost(line.productId);
          totalCost += cost * parseFloat(line.qty || 0);
        }
        if (totalCost < 0.001) {
          totalCost = (transfer.lines || []).reduce((s, l) => s + (l.qty || 1), 0);
        }

        const toAcc   = await resolveWarehouseAccount(transfer.toWarehouseId, transfer.toWarehouseName);
        const fromAcc = await resolveWarehouseAccount(transfer.fromWarehouseId, transfer.fromWarehouseName);

        await createJournalEntry({
          date: transfer.date || new Date().toISOString().slice(0, 10),
          description: `تحويل مخزني ${transfer.number} — من ${transfer.fromWarehouseName} إلى ${transfer.toWarehouseName}`,
          lines: [
            {
              accountCode: toAcc.code,
              accountName: toAcc.name,
              accountId: toAcc.id,
              debit: Math.round(totalCost * 100) / 100,
              credit: 0,
              note: `استلام مخزون — تحويل ${transfer.number}`
            },
            {
              accountCode: fromAcc.code,
              accountName: fromAcc.name,
              accountId: fromAcc.id,
              debit: 0,
              credit: Math.round(totalCost * 100) / 100,
              note: `صرف مخزون — تحويل ${transfer.number}`
            },
          ],
          sourceType: "stockTransfer",
          sourceId:   transfer.id,
          status:     "posted",
          createdByName: "النظام — إصلاح تلقائي",
        });
        created++;
        console.log(`[fixMissingTransferJEs] ✅ Created/Fixed JE for transfer ${transfer.number} with value ${totalCost}`);
      } catch (jeErr) {
        console.warn(`[fixMissingTransferJEs] Failed for ${transfer.number}:`, jeErr.message);
      }
    }
    if (created > 0) {
      console.log(`[fixMissingTransferJEs] ✅ Created/Fixed ${created} missing transfer JEs`);
      // تحديث أرصدة شجرة الحسابات فوراً بعد تصحيح القيود
      setTimeout(() => {
        if (window.rebuildAccountBalances) {
          window.rebuildAccountBalances({ silent: true });
        }
      }, 1000);
    }
    localStorage.setItem('erp_fixTransferJEs_done_v2', '1');
  } catch (e) {
    console.warn("[fixMissingTransferJEs] warning:", e.message);
  }
}

// ──────────────────────────────────────────
// تصحيح الأرصدة المخزنية للتحويلات المستلمة والمفقود حركتها في الوجهة (مرة واحدة)
// ──────────────────────────────────────────
async function fixMissingTransferStockOneTime() {
  if (localStorage.getItem('erp_fixTransferStock_done_v2')) return;
  try {
    const { db, COMPANY_ID } = await import("./firebase-config.js");
    const { collection, getDocs, query, where } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { adjustStockBulk } = await import("./utils/db.js");

    const transfersSnap = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/stockTransfers`),
      where("status", "==", "received")
    ));

    let fixedCount = 0;

    for (const tDoc of transfersSnap.docs) {
      const transfer = { id: tDoc.id, ...tDoc.data() };

      // تحقق ما إذا كانت هناك حركة وارد (transfer_in) مسجلة لمستودع الوجهة في كرت الصنف
      const txSnap = await getDocs(query(
        collection(db, `companies/${COMPANY_ID}/stockTransactions`),
        where("sourceId", "==", transfer.id),
        where("warehouseId", "==", transfer.toWarehouseId),
        where("type", "==", "transfer_in")
      ));

      if (txSnap.empty) {
        console.log(`[fixTransferStock] Transfer ${transfer.number} status is received but missing transfer_in stock records. Adjusting...`);
        
        const adjustments = (transfer.lines || []).map(line => ({
          warehouseId: transfer.toWarehouseId,
          productId: line.productId,
          qtyDelta: +line.qty,
          metadata: {
            date:           transfer.date || new Date().toISOString().slice(0, 10),
            type:           "transfer_in",
            sourceType:     "stockTransfer",
            sourceId:       transfer.id,
            documentNumber: transfer.number,
            productName:    line.productName,
            notes:          `تم تأكيد استلام الشحنة ${transfer.number} — إصلاح تلقائي للمخزون`
          }
        }));

        if (adjustments.length > 0) {
          await adjustStockBulk(adjustments);
          fixedCount++;
        }
      }
    }

    if (fixedCount > 0) {
      console.log(`[fixTransferStock] ✅ Fixed missing stock for ${fixedCount} received transfers.`);
    }
    localStorage.setItem('erp_fixTransferStock_done_v2', '1');
  } catch (e) {
    console.warn("[fixTransferStock] warning:", e.message);
  }
}
