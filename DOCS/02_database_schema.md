# 02 — هيكل قاعدة البيانات (Firestore Schema)

## البنية العامة

```
Firestore
└── companies/
    └── {companyId}/           ← إدهام = "idham"
        ├── settings/          ← إعدادات الشركة
        ├── products/          ← الأصناف
        ├── categories/        ← الفئات والوحدات
        ├── warehouses/        ← المستودعات
        ├── customers/         ← العملاء
        ├── suppliers/         ← الموردين
        ├── salesReps/         ← المناديب
        ├── salesInvoices/     ← فواتير البيع
        ├── purchaseInvoices/  ← فواتير الشراء
        ├── salesReturns/      ← مردودات بيع
        ├── purchaseReturns/   ← مردودات شراء
        ├── quotations/        ← عروض الأسعار
        ├── purchaseRequests/  ← طلبات الشراء
        ├── receipts/          ← سندات القبض
        ├── expenses/          ← سندات الصرف
        ├── cashBoxes/         ← الصناديق
        ├── cashTransactions/  ← حركات الصناديق
        ├── bankAccounts/      ← الحسابات البنكية
        ├── bankTransactions/  ← حركات البنوك
        ├── cheques/           ← الشيكات
        ├── chartOfAccounts/   ← شجرة الحسابات
        ├── journalEntries/    ← القيود المحاسبية
        ├── costCenters/       ← مراكز التكلفة
        ├── employees/         ← الموظفون
        ├── stockByWarehouse/  ← المخزون حسب المستودع
        ├── stockTransactions/ ← حركات المخزون
        ├── inventoryAdjustments/ ← تسويات المخزون
        ├── physicalCounts/    ← الجرد الفعلي
        ├── priceLists/        ← قوائم الأسعار
        ├── counters/          ← تسلسل الأرقام
        ├── users/             ← مستخدمو الشركة
        └── auditTrails/       ← سجل التدقيق
```

---

## تفاصيل Collections الرئيسية

### 📦 products (الأصناف)
```json
{
  "id": "auto-generated",
  "name": "اسم الصنف",
  "nameEn": "Product Name",
  "sku": "SKU-001",
  "barcode": "6281234567890",
  "categoryId": "ref→categories",
  "unitId": "ref→units",
  "purchasePrice": 10.00,
  "sellingPrice": 15.00,
  "vatRate": 15,
  "trackInventory": true,
  "minStock": 10,
  "maxStock": 500,
  "description": "وصف الصنف",
  "imageUrl": "Firebase Storage URL",
  "isActive": true,
  "createdAt": "Timestamp"
}
```

### 👥 customers (العملاء)
```json
{
  "id": "auto-generated",
  "name": "اسم العميل",
  "phone": "0501234567",
  "vatNumber": "300000000000003",
  "repId": "ref→salesReps",
  "priceLisId": "ref→priceLists",
  "creditLimit": 5000.00,
  "balance": 1250.00,
  "type": "retail | wholesale",
  "address": "العنوان",
  "isActive": true,
  "createdAt": "Timestamp"
}
```

### 🏪 suppliers (الموردون)
```json
{
  "id": "auto-generated",
  "name": "اسم المورد",
  "phone": "0501234567",
  "vatNumber": "300000000000003",
  "balance": -5000.00,
  "type": "local | import",
  "address": "العنوان",
  "isActive": true,
  "createdAt": "Timestamp"
}
```

### 🧾 salesInvoices (فواتير البيع)
```json
{
  "id": "auto-generated",
  "number": "INV-2026-0001",
  "date": "2026-07-23",
  "customerId": "ref→customers",
  "customerName": "اسم العميل",
  "repId": "ref→salesReps",
  "repName": "اسم المندوب",
  "warehouseId": "ref→warehouses",
  "warehouseName": "اسم المستودع",
  "lines": [
    {
      "productId": "ref→products",
      "productName": "اسم الصنف",
      "qty": 10,
      "unitPrice": 15.00,
      "vatRate": 15,
      "subtotal": 150.00,
      "vatAmount": 22.50,
      "total": 172.50
    }
  ],
  "subtotal": 150.00,
  "totalVat": 22.50,
  "totalWithVat": 172.50,
  "discount": 0,
  "paymentMethod": "cash | credit | bank",
  "status": "draft | issued | paid | cancelled",
  "zatcaStatus": "pending | reported",
  "journalEntryId": "ref→journalEntries",
  "notes": "ملاحظات",
  "createdAt": "Timestamp",
  "createdBy": "userId"
}
```

### 🛒 purchaseInvoices (فواتير الشراء)
```json
{
  "id": "auto-generated",
  "number": "PUR-2026-0001",
  "date": "2026-07-23",
  "supplierId": "ref→suppliers",
  "supplierName": "اسم المورد",
  "warehouseId": "ref→warehouses",
  "refNumber": "رقم مرجعي المورد",
  "lines": [
    {
      "productId": "ref→products",
      "productName": "اسم الصنف",
      "qty": 100,
      "unitCost": 10.00,
      "vatRate": 15,
      "subtotal": 1000.00,
      "vatAmount": 150.00,
      "total": 1150.00
    }
  ],
  "subtotal": 1000.00,
  "totalVat": 150.00,
  "totalWithVat": 1150.00,
  "paymentMethod": "cash | credit | bank",
  "status": "draft | received | paid | cancelled",
  "journalEntryId": "ref→journalEntries",
  "createdAt": "Timestamp"
}
```

### 📖 journalEntries (القيود المحاسبية)
```json
{
  "id": "auto-generated",
  "entryNumber": "JE-2026-0001",
  "date": "2026-07-23",
  "description": "بيان القيد",
  "sourceType": "manual | salesInvoice | purchaseInvoice | salesReturn | purchaseReturn | receipt | expense",
  "sourceId": "ref→source document",
  "lines": [
    {
      "accountCode": "1-1-2-1-1",
      "accountName": "ذمم عملاء تجزئة",
      "debit": 172.50,
      "credit": 0,
      "description": "بيان البند"
    },
    {
      "accountCode": "4-1-1-1-3",
      "accountName": "مبيعات تجزئة - آجل",
      "debit": 0,
      "credit": 150.00,
      "description": "بيان البند"
    },
    {
      "accountCode": "2-1-3-1",
      "accountName": "ضريبة القيمة المضافة - المخرجات",
      "debit": 0,
      "credit": 22.50,
      "description": "VAT 15%"
    }
  ],
  "totalDebit": 172.50,
  "totalCredit": 172.50,
  "status": "posted | draft | reversed",
  "costCenterId": "ref→costCenters",
  "createdAt": "Timestamp",
  "createdBy": "userId"
}
```

### 📊 chartOfAccounts (شجرة الحسابات)
```json
{
  "id": "auto-generated",
  "code": "1-1-2-1-1",
  "name": "ذمم عملاء تجزئة - محلية",
  "nameEn": "Retail Receivables - Local",
  "type": "asset | liability | equity | revenue | expense",
  "parentCode": "1-1-2-1",
  "level": 5,
  "isParent": false,
  "normalBalance": "debit | credit",
  "balance": 25000.00,
  "isActive": true
}
```

### 🏭 warehouses (المستودعات)
```json
{
  "id": "auto-generated",
  "name": "المستودع الرئيسي",
  "type": "main | vehicle | external",
  "repId": "ref→salesReps",
  "isActive": true,
  "location": "الرياض"
}
```

### 📦 stockByWarehouse (المخزون حسب المستودع)
```json
{
  "id": "{warehouseId}_{productId}",
  "warehouseId": "ref→warehouses",
  "productId": "ref→products",
  "qty": 250,
  "avgCost": 10.50,
  "totalValue": 2625.00,
  "lastUpdated": "Timestamp"
}
```

### 💰 receipts (سندات القبض)
```json
{
  "id": "auto-generated",
  "number": "REC-2026-0001",
  "date": "2026-07-23",
  "entityType": "customer | other",
  "targetId": "ref→customers",
  "amount": 500.00,
  "paymentMethod": "cash | bank | cheque",
  "cashBoxId": "ref→cashBoxes",
  "bankAccountId": "ref→bankAccounts",
  "notes": "ملاحظات",
  "journalEntryId": "ref→journalEntries",
  "createdAt": "Timestamp"
}
```

### 💸 expenses (سندات الصرف)
```json
{
  "id": "auto-generated",
  "number": "EXP-2026-0001",
  "date": "2026-07-23",
  "entityType": "supplier | employee | other",
  "targetId": "ref→suppliers | employees",
  "amount": 1000.00,
  "category": "فئة المصروف",
  "paymentMethod": "cash | bank | cheque",
  "notes": "ملاحظات",
  "journalEntryId": "ref→journalEntries",
  "createdAt": "Timestamp"
}
```

### 🏧 cashBoxes (الصناديق)
```json
{
  "id": "auto-generated",
  "name": "الصندوق الرئيسي",
  "balance": 15000.00,
  "accountCode": "1-1-1-1-3",
  "isActive": true
}
```

### 🏦 bankAccounts (الحسابات البنكية)
```json
{
  "id": "auto-generated",
  "bankName": "مصرف الراجحي",
  "accountNumber": "***1234",
  "iban": "SA0000000000001234",
  "balance": 50000.00,
  "accountCode": "1-1-1-3-2",
  "isActive": true
}
```

### 👨‍💼 employees (الموظفون)
```json
{
  "id": "auto-generated",
  "name": "اسم الموظف",
  "employeeNumber": "EMP-001",
  "position": "المنصب",
  "department": "القسم",
  "basicSalary": 5000.00,
  "housingAllowance": 1000.00,
  "transportAllowance": 500.00,
  "hireDate": "2024-01-01",
  "isActive": true
}
```

---

## فهارس Firestore (Indexes)

الفهارس المُنشأة في `firestore.indexes.json`:

| Collection | الحقول | الترتيب |
|---|---|---|
| salesInvoices | status, createdAt | DESC |
| salesInvoices | customerId, createdAt | DESC |
| salesInvoices | repId, createdAt | DESC |
| purchaseInvoices | supplierId, createdAt | DESC |
| journalEntries | sourceType, createdAt | DESC |
| stockTransactions | warehouseId, createdAt | DESC |
| cheques | status, dueDate | ASC |

---

## قواعد أمان Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // المستخدم المصادق عليه فقط يمكنه القراءة والكتابة
    match /companies/{companyId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
