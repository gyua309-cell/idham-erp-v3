# سجل التغييرات (CHANGELOG)

## v44.x — يوليو 2026

### ✅ تحسينات الأداء (Performance Optimization)
- **Module Preloading**: تحميل جميع JS modules في الخلفية بعد تسجيل الدخول
- **Global Debounce**: `window.debounce()` متاح لكل الـ modules
- **Debounce البحث**: في sales-invoices, purchase-invoices, journal-entries
- **Cache collections/receipts**: getAll() بدلاً من getDocs في sales-invoices
- **Cache expenses**: getAll() بدلاً من getDocs في purchase-invoices
- **Cache 500 قيد**: getAll() بدلاً من getDocs في journal-entries
- **Parallel Warmup**: تحميل 6 مجموعات في نفس الوقت بدلاً من التسلسلي

### ✅ إصلاح ميزان المراجعة
- تصحيح قيمة المخزون (بدون ضريبة)
- حساب أب المخزون = مستودع رئيسي + سيارات المناديب
- التحقق من قيمة بضاعة سيارة المندوب

### ✅ Cache Layer
- TTL L1: رفع من 5 دقائق إلى 15 دقيقة
- TTL L2: رفع من 30 دقيقة إلى ساعتين
- توسيع isCacheable لتشمل where queries

---

## v43.x — يونيو 2026

### ✅ تقارير المخزون
- تقرير warehouse-comparison (مقارنة المستودعات)
- تقرير consolidated-balances (الأرصدة الموحدة)
- تحسين inventory-reports (124KB)

### ✅ إصلاحات شجرة الحسابات
- chart-of-accounts: إضافة ميزان المراجعة
- تحديث الأرصدة التلقائي

---

## v42.x — مايو 2026

### ✅ قسم المبيعات
- تحسين sales-invoices: KPIs تفصيلية
- إضافة فلاتر متعددة (مندوب، مستودع، عميل)
- تحويل فاتورة شراء لبيع
- ZATCA Integration

### ✅ قسم المشتريات
- purchase-invoices: ربط بـ GRPO
- سداد مباشر من الفاتورة

### ✅ القيود المحاسبية
- journal-entries: دفتر اليومية والأستاذ
- دعم مراكز التكلفة في القيود

---

## v41.x — أبريل 2026

### ✅ نظام الكاش الثنائي
- db.js: L1 + L2 cache system
- Smart cache invalidation
- invalidateCache() API

### ✅ تحسينات العملاء
- customers.js: إزالة background recalculation
- إضافة زر تحديث يدوي
- Cache للعملاء والموردين والأصناف

---

## v39.x — مارس 2026

### ✅ محرك القيود التلقائية
- accounting-engine.js v1.0
- قيود البيع والشراء والتحصيل والسداد
- قيود نقل المخزون

### ✅ نقل المخزون
- stock-transfer.js: نقل بين مستودعات
- تحميل سيارات المناديب
- مردود سيارات المناديب

---

## v1.0 — البداية

### ✅ الوحدات الأساسية
- Firebase setup + Multi-tenant architecture
- نظام التوجيه (Router) بالـ Hash
- نظام المصادقة
- الأصناف والفئات والوحدات
- العملاء والموردين
- فواتير البيع والشراء الأساسية
- شجرة الحسابات
- لوحة التحكم
