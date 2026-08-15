# 05 — آليات الأداء والـ Cache

## المشكلة الأصلية

البرنامج يُرسل طلبات Firestore في كل زيارة لكل صفحة. مع 50 عميل مثلاً = **51 طلب Firestore** في فتح صفحة العملاء وحدها!

---

## الحل: نظام Cache ثنائي الطبقة

```
┌─────────────────────────────────────────────────────────┐
│                    طلب بيانات                            │
│                        │                                 │
│              ┌──────────▼──────────┐                    │
│              │   L1: ERP_CACHE    │                    │
│              │  (window memory)   │                    │
│              │    TTL = 15 دقيقة  │                    │
│              └──────────┬──────────┘                    │
│                     miss │                               │
│              ┌──────────▼──────────┐                    │
│              │   L2: localStorage  │                    │
│              │   TTL = ساعتان     │                    │
│              └──────────┬──────────┘                    │
│                     miss │                               │
│              ┌──────────▼──────────┐                    │
│              │   Firestore Cloud   │                    │
│              │   (الطلب الفعلي)   │                    │
│              └─────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### L1: الذاكرة (window.ERP_CACHE)
- **السرعة:** < 1ms
- **المدة:** 15 دقيقة
- **تُمسح:** عند إغلاق أو تحديث المتصفح
- **تتسع لـ:** حسب RAM المتصفح

### L2: التخزين المحلي (localStorage)
- **السرعة:** 2-5ms
- **المدة:** ساعتان
- **تُمسح:** تلقائياً عند انتهاء الصلاحية، أو يدوياً
- **تتسع لـ:** 10MB لكل موقع

---

## Warmup عند تسجيل الدخول

```javascript
// بعد 200ms من ظهور الواجهة:
Promise.all([
  getAll(COLS.customers(),   [orderBy("name")]),  // 1 طلب
  getAll(COLS.suppliers(),   [orderBy("name")]),  // 1 طلب
  getAll(COLS.warehouses(),  [orderBy("name")]),  // 1 طلب
  getAll(COLS.salesReps(),   [orderBy("name")]),  // 1 طلب
  getAll(COLS.priceLists(),  [orderBy("name")]),  // 1 طلب
  getAll(COLS.products(),    [orderBy("name")]),  // 1 طلب
]);
// ← 6 طلبات متوازية بدلاً من 6 متسلسلة

// بعد 2000ms: تحميل جميع JS modules في الخلفية
criticalRoutes.forEach(route => ROUTES[route]().catch(() => {}));
```

---

## Module Preloading

بعد ثانيتين من تسجيل الدخول، يُحمَّل كل الـ JS في الخلفية:

```javascript
const criticalRoutes = [
  "sales-invoices", "purchase-invoices", "customers", "suppliers",
  "products", "journal-entries", "chart-of-accounts",
  "receipts", "expenses", "stock-transfer", "quotations",
  "financial-reports", "cheques", "cash-boxes",
];
// التأثير: أي قسم تضغط عليه بعد ثانيتين → يفتح فوراً
```

---

## Debounce البحث

```javascript
// window.debounce معرّف في app.js (متاح لكل module)
window.debounce = function(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// الاستخدام في sales-invoices.js:
searchEl.addEventListener("input", window.debounce(() => loadInvoicesList(), 300));
// ← الجدول لا يُعاد رسمه إلا بعد 300ms من التوقف عن الكتابة
```

---

## Page DOM Cache

```javascript
// _pageCache يحفظ الصفحات المعروضة في الذاكرة
const _pageCache = new Map();  // route → { node, unsub }

// عند التنقل:
if (_pageCache.has(route) && !CACHE_BYPASS.has(route)) {
  outlet.appendChild(_pageCache.get(route).node);  // < 1ms
  return;
}
```

### صفحات مستثناة من الـ DOM Cache (CACHE_BYPASS):
```
dashboard, inventory-dashboard, financial-analysis, cost-centers,
quotations, sales-invoices, purchase-invoices,
sales-returns, purchase-returns,
journal-entries, chart-of-accounts,
cheques, cash-boxes, bank-accounts,
stock-card, stock-transfer, inventory-ops,
pos, expenses, hr-payroll,
report-customer-statement
```
هذه تحتاج بيانات لحظية (فواتير جديدة، أرصدة محدثة) لذا لا يُكاش DOM.
لكن البيانات نفسها تأتي من getAll() Cache.

---

## Cache Invalidation (إبطال الـ Cache)

```javascript
// عند حفظ أو حذف أي بيانات:
import { invalidateCache } from "../utils/db.js";
await invalidateCache("salesInvoices");  // يمسح cache الفواتير فقط
await invalidateCache("customers");      // يمسح cache العملاء فقط
await invalidateCache();                 // يمسح كل شيء
```

الطريقة:
1. يحذف L1 للـ collection المحددة
2. يحذف L2 (localStorage) للـ collection المحددة
3. الطلب التالي يذهب لـ Firestore ويُخزَّن مجدداً

---

## Skeleton Loading

```javascript
// أثناء تحميل الصفحة → يعرض هيكلاً فارغاً فوراً:
outlet.innerHTML = _buildSkeleton(route);
// ← يظهر skeleton مع animation في < 16ms
// ← بيانات حقيقية تملأه بعد جلبها
```

---

## قياسات الأداء (بعد التحسينات)

| العملية | قبل | بعد |
|---|---|---|
| فتح صفحة العملاء (أول زيارة) | 3-5 ثواني | 1-2 ثانية |
| فتح صفحة العملاء (زيارة ثانية) | 3-5 ثواني | < 50ms |
| التنقل بين الأقسام (cached) | 2-4 ثواني | < 5ms |
| البحث في الجدول | 300ms/حرف | 0ms/حرف (debounced) |
| فتح فواتير المبيعات (بعد warmup) | 4-6 ثواني | 0.5-1 ثانية |
| قيود محاسبية (load 500 قيد) | كل زيارة | مرة واحدة ثم Cache |

---

## Firebase Persistent Cache

```javascript
// firebase-config.js — Offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
// ← Firestore يحفظ البيانات في IndexedDB
// ← يعمل offline بالبيانات الأخيرة
// ← يُزامن تلقائياً عند الاتصال
```
