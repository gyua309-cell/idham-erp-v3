# 01 — المعمارية التقنية

## نظرة عامة

نظام إدهام ERP هو تطبيق ويب أحادي الصفحة (SPA) مبني بـ **Vanilla JavaScript** مع **Firebase** كـ Backend-as-a-Service. لا يعتمد على أي Framework مثل React أو Vue مما يجعله خفيفاً وسريع التحميل.

---

## مخطط البنية العامة

```
┌─────────────────────────────────────────────────────────┐
│                    المتصفح (Browser)                      │
│                                                           │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │  index.html  │  │  app.js Router │  │   CSS Styles │  │
│  │  (Entry Point)│  │  (Navigation)  │  │   (css/)    │  │
│  └──────────────┘  └────────────────┘  └─────────────┘  │
│                             │                             │
│           ┌─────────────────┼─────────────────┐          │
│           ▼                 ▼                 ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  js/modules/ │  │  js/utils/   │  │ Firebase SDK  │   │
│  │  (صفحات)     │  │  (مساعدات)   │  │  (Firestore)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                               │           │
│         ┌─────────────────────────────────────┤          │
│         │           Cache Layer               │          │
│         │  L1: window.ERP_CACHE (15 دقيقة)    │          │
│         │  L2: localStorage (ساعتان)           │          │
│         └─────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
                              │
                    ──────────┼──────────
                    │  Firebase Cloud  │
                    ──────────┼──────────
                              │
         ┌────────────────────┼───────────────────┐
         ▼                    ▼                   ▼
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │  Firestore   │    │  Firebase    │    │  Firebase    │
  │  (Database)  │    │    Auth      │    │   Storage    │
  └─────────────┘    └──────────────┘    └──────────────┘
```

---

## هيكل الملفات

```
e:\ادهام للمواد الغذائية\
│
├── index.html                 # نقطة الدخول — يحتوي HTML + CSS مدمج
├── manifest.json              # PWA Manifest
├── sw.js                      # Service Worker (للعمل أوف لاين)
│
├── js/
│   ├── app.js                 # الراوتر الرئيسي + تسجيل الدخول + التنقل
│   ├── firebase-config.js     # إعداد Firebase + معرف الشركة
│   │
│   ├── modules/               # وحدات الصفحات (44 وحدة)
│   │   ├── dashboard.js       # لوحة التحكم
│   │   ├── sales-invoices.js  # فواتير المبيعات (101KB)
│   │   ├── purchase-invoices.js # فواتير المشتريات (82KB)
│   │   ├── products.js        # إدارة الأصناف (91KB)
│   │   ├── customers.js       # إدارة العملاء
│   │   ├── suppliers.js       # إدارة الموردين
│   │   ├── journal-entries.js # القيود المحاسبية (61KB)
│   │   ├── chart-of-accounts.js # شجرة الحسابات (109KB)
│   │   ├── financial-reports.js # التقارير المالية
│   │   ├── pos.js             # نقطة البيع
│   │   ├── hr-payroll.js      # الموارد البشرية والرواتب (98KB)
│   │   └── reports/           # 13 تقرير متخصص
│   │       ├── inventory-reports.js   # تقارير المخزون (124KB)
│   │       ├── customer-statement.js  # كشف حساب العميل
│   │       ├── sales-by-product.js   # المبيعات حسب الصنف
│   │       └── ...
│   │
│   └── utils/                 # أدوات مشتركة (14 أداة)
│       ├── db.js              # طبقة قاعدة البيانات + Cache (41KB)
│       ├── accounting-engine.js # محرك القيود التلقائية (43KB)
│       ├── formatters.js      # تنسيق الأرقام والتواريخ
│       ├── export.js          # تصدير PDF وExcel
│       ├── zatca-qr.js        # QR كود ZATCA
│       ├── f8-search.js       # البحث السريع F8
│       ├── auth-manager.js    # إدارة الصلاحيات
│       └── excel.js           # تصدير Excel
│
├── css/                       # ملفات CSS المنفصلة
│
├── DOCS/                      # التوثيق (هذا المجلد)
│
├── firebase.json              # إعدادات Firebase Hosting
├── firestore.indexes.json     # فهارس Firestore
└── firestore.rules            # قواعد أمان Firestore
```

---

## آلية التنقل (Router)

النظام يعتمد على **Hash-based routing** (`#route`):

```
https://idham-foodstuffs-sa.web.app/#sales-invoices
https://idham-foodstuffs-sa.web.app/#dashboard
https://idham-foodstuffs-sa.web.app/#chart-of-accounts
```

### تسلسل عملية التنقل:

```
1. المستخدم يضغط على قسم في القائمة الجانبية
2. navigate(route) يُستدعى في app.js
3. يتحقق من _pageCache — هل الصفحة محفوظة؟
   ├── نعم (وليست في CACHE_BYPASS): يعرضها فوراً < 1ms
   └── لا:
       ├── يعرض Skeleton (هيكل فارغ) فوراً
       ├── import() لتحميل module.js
       └── module.render(container, user) لعرض البيانات
4. يحفظ الصفحة في _pageCache للزيارة القادمة
```

---

## نموذج الأمان والمستأجرين (Multi-Tenant)

كل شركة تملك بياناتها المنفصلة تماماً تحت:
```
companies/{companyId}/
    ├── salesInvoices/
    ├── products/
    ├── customers/
    └── ...
```

- `COMPANY_ID` يُحدَّد بعد تسجيل الدخول من ملف تعريف المستخدم
- لا يمكن لمستخدم شركة رؤية بيانات شركة أخرى
- `firestore.rules` تُطبّق هذا على مستوى قاعدة البيانات

---

## التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---|---|---|
| JavaScript (ES Modules) | ES2022 | منطق التطبيق |
| Firebase SDK | 11.0.2 | Database, Auth, Storage |
| Firestore | - | قاعدة البيانات |
| Firebase Auth | - | تسجيل الدخول |
| Firebase Storage | - | رفع الصور والشعارات |
| Firebase Hosting | - | الاستضافة |
| Font Awesome | 6.x | الأيقونات |
| Google Fonts (Tajawal) | - | الخط العربي |
| SheetJS (xlsx) | - | تصدير Excel |
| html2canvas + jsPDF | - | تصدير PDF |
