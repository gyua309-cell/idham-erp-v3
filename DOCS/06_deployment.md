# 06 — النشر والبيئات

## بيانات المشروع

```
Firebase Project ID:  idham-foodstuffs-sa
Firebase Region:      me-west1 (السعودية)
Hosting URL:          https://idham-foodstuffs-sa.web.app
Firebase Console:     https://console.firebase.google.com/project/idham-foodstuffs-sa
```

---

## ملفات الإعداد

### firebase.json
```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "DOCS/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/js/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }]
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "idham-foodstuffs-sa"
  }
}
```

---

## أوامر النشر

### نشر كامل (Hosting فقط):
```bash
cd "e:\ادهام للمواد الغذائية"
firebase deploy --only hosting --project idham-foodstuffs-sa
```

### نشر Firestore Rules:
```bash
firebase deploy --only firestore:rules --project idham-foodstuffs-sa
```

### نشر Firestore Indexes:
```bash
firebase deploy --only firestore:indexes --project idham-foodstuffs-sa
```

### نشر كل شيء:
```bash
firebase deploy --project idham-foodstuffs-sa
```

---

## متطلبات النشر

1. **Firebase CLI** مُثبَّت:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Node.js** v18 أو أحدث

3. **package.json** يحتوي على:
   ```json
   {
     "dependencies": {
       "firebase-tools": "^13.x"
     }
   }
   ```

---

## Service Worker (PWA)

```javascript
// sw.js — يُفعّل offline mode
// يُكاش: index.html, js/*, css/*, icons/*
// يُستثنى: Firebase SDK (CDN)

// تحديث Service Worker:
// عند نشر نسخة جديدة، يتحقق المتصفح تلقائياً
// وينزّل الـ SW الجديد عند إعادة فتح التطبيق
```

---

## إصدارات النظام (Version Numbers)

```javascript
// في app.js — ROUTES — كل module له رقم إصدار:
"sales-invoices": () => import("./modules/sales-invoices.js?v=42.0"),
"products":       () => import("./modules/products.js?v=41.2"),
```

**لماذا؟** لإجبار المتصفح على تنزيل النسخة الجديدة عند التحديث.

---

## النسخ الاحتياطية

### تلقائياً:
- Firebase يحتفظ بآخر نسخ من Hosting
- Firestore يحتفظ بسجل كامل للبيانات

### يدوياً:
```bash
# تشغيل سكريبت النسخ الاحتياطي
node backup_script.js
# أو
.\start_backup.bat
```

---

## التطوير المحلي

```bash
# تشغيل الخادم المحلي
firebase serve --only hosting

# أو استخدام ملف BAT:
.\run-erp.bat
```

**ملاحظة:** التطوير المحلي يتصل بـ Firebase Cloud الحقيقي وليس Emulator (إلا إذا كان الـ flag `USE_EMULATOR` مُفعَّل في firebase-config.js).

---

## حدود Firebase Spark Plan (المجاني)

| الخدمة | الحد اليومي | الوضع الحالي |
|---|---|---|
| Firestore reads | 50,000 | ✅ مناسب |
| Firestore writes | 20,000 | ✅ مناسب |
| Firestore deletes | 20,000 | ✅ مناسب |
| Storage | 1 GB | ✅ مناسب |
| Hosting | 10 GB/شهر | ✅ مناسب |
| Auth | غير محدود | ✅ |

**نصيحة:** الـ Cache يُقلّل Firestore reads بنسبة 80%+ ويحافظ على عدم تجاوز الحد المجاني.

---

## متغيرات البيئة (Environment Variables)

لا يوجد `.env` في هذا المشروع — كل الإعدادات في `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8",
  authDomain:        "idham-foodstuffs-sa.firebaseapp.com",
  projectId:         "idham-foodstuffs-sa",
  storageBucket:     "idham-foodstuffs-sa.firebasestorage.app",
  messagingSenderId: "771445462953",
  appId:             "1:771445462953:web:05d70fb7c36a385c9796b8",
};
```

**ملاحظة:** Firebase API Key للويب ليس سرياً — الأمان يعتمد على `firestore.rules` و `Firebase Auth`.

---

## لوحة Firebase Console

### أقسام مهمة:
- **Firestore Database** → لعرض وتعديل البيانات مباشرة
- **Authentication** → لإدارة المستخدمين
- **Storage** → للصور والملفات
- **Hosting** → لسجل الإصدارات السابقة
- **Usage** → لمراقبة الاستهلاك
