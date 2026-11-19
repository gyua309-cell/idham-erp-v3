import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

const COMPANY_ID = 'idham-main';
const MAIN_WH_ID = 'W5uANJjMgfFh2p3xU4bT';

async function backupAndFix() {
  console.log("=== STEP 1: TAKING BACKUP ===");
  const backupDir = path.resolve('قاعدة_البيانات_والنسخ_الاحتياطي');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const backupData = {
    timestamp: new Date().toISOString(),
    products: {},
    stockByWarehouse: {},
    purchaseInvoices: {},
    salesInvoices: {}
  };

  const prodIds = [
    '4F1zPkjk7V5XR4Cf7eep', // معطر العندليب
    'ydKSXXu03a9KkMjZt71q', // معطر كوتاج
    'LL5a49ARgDEA4QbPvXRp', // كيس نايلون 24
    'gS5LZNGjTrBOuwhoB7uA'  // كيس نايلون 8
  ];

  for (const pid of prodIds) {
    const psnap = await getDoc(doc(db, `companies/${COMPANY_ID}/products`, pid));
    if (psnap.exists()) backupData.products[pid] = psnap.data();

    const whDocId = `${MAIN_WH_ID}_${pid}`;
    const sbsnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, whDocId));
    if (sbsnap.exists()) backupData.stockByWarehouse[whDocId] = sbsnap.data();
  }

  const piSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, '5mBKJ7del4HLaSeHAjdg'));
  if (piSnap.exists()) backupData.purchaseInvoices['5mBKJ7del4HLaSeHAjdg'] = piSnap.data();

  const siSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, 'FvN34BzjYJeMX6AbFnTn'));
  if (siSnap.exists()) backupData.salesInvoices['FvN34BzjYJeMX6AbFnTn'] = siSnap.data();

  const backupFilePath = path.join(backupDir, `backup_products_fix_${Date.now()}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`✅ Backup successfully saved to: ${backupFilePath}`);

  console.log("\n=== STEP 2: FIXING MOATTAR ANDALEEB & COTTAGE (DEDUCTING 1 SOLD UNIT) ===");
  // 1. معطر العندليب
  const andaleebId = '4F1zPkjk7V5XR4Cf7eep';
  await updateDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${MAIN_WH_ID}_${andaleebId}`), {
    qty: 3,
    updatedAt: Timestamp.now()
  });
  await updateDoc(doc(db, `companies/${COMPANY_ID}/products`, andaleebId), {
    totalQty: 3,
    updatedAt: Timestamp.now()
  });
  await addDoc(collection(db, `companies/${COMPANY_ID}/stockTransactions`), {
    productId: andaleebId,
    productName: "معطر العندليب مذهلة 500 مل - 18 حبه",
    sku: "14017",
    warehouseId: MAIN_WH_ID,
    warehouseName: "المستودع الرئيسى",
    type: "sale_out",
    sourceType: "salesInvoice",
    sourceId: "FvN34BzjYJeMX6AbFnTn",
    invoiceNumber: "INV-042028",
    documentNumber: "INV-042028",
    qtyChange: -1,
    qtyBefore: 4,
    qtyAfter: 3,
    date: "2026-10-06",
    notes: "إثبات خصم مبيعات فاتورة INV-042028 (تصحيح أثر تعديل الفاتورة)",
    createdAt: Timestamp.now()
  });
  console.log("  ✅ معطر العندليب: تم تعديل الرصيد من 4 إلى 3 وإثبات حركة الخصم.");

  // 2. معطر كوتاج
  const cottageId = 'ydKSXXu03a9KkMjZt71q';
  await updateDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${MAIN_WH_ID}_${cottageId}`), {
    qty: 3,
    updatedAt: Timestamp.now()
  });
  await updateDoc(doc(db, `companies/${COMPANY_ID}/products`, cottageId), {
    totalQty: 3,
    updatedAt: Timestamp.now()
  });
  await addDoc(collection(db, `companies/${COMPANY_ID}/stockTransactions`), {
    productId: cottageId,
    productName: "معطر جو كوتاج 300 مل *48",
    sku: "14016",
    warehouseId: MAIN_WH_ID,
    warehouseName: "المستودع الرئيسى",
    type: "sale_out",
    sourceType: "salesInvoice",
    sourceId: "FvN34BzjYJeMX6AbFnTn",
    invoiceNumber: "INV-042028",
    documentNumber: "INV-042028",
    qtyChange: -1,
    qtyBefore: 4,
    qtyAfter: 3,
    date: "2026-10-06",
    notes: "إثبات خصم مبيعات فاتورة INV-042028 (تصحيح أثر تعديل الفاتورة)",
    createdAt: Timestamp.now()
  });
  console.log("  ✅ معطر كوتاج: تم تعديل الرصيد من 4 إلى 3 وإثبات حركة الخصم.");

  console.log("\n=== STEP 3: FIXING NYLON BAGS 8 & 24 IN PURCHASE INVOICE & STOCK ===");
  // Update purchase invoice line 14 from nylon 24 to nylon 8
  const piData = backupData.purchaseInvoices['5mBKJ7del4HLaSeHAjdg'];
  const newLines = [...piData.lines];
  newLines[14] = {
    ...newLines[14],
    productId: 'gS5LZNGjTrBOuwhoB7uA',
    productName: 'كيس نايلون (8) 20 كيلو',
    sku: '43070',
    batchNumber: 'LOT-261015-3070-15',
    unit: 'Carton',
    qty: 10,
    unitPrice: 119
  };

  await updateDoc(doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, '5mBKJ7del4HLaSeHAjdg'), {
    lines: newLines,
    updatedAt: Timestamp.now(),
    fixNote: "تم تصحيح السطر 15 إلى كيس نايلون (8) 20 كيلو كود 43070 بدلاً من التكرار الخاطئ لكود 24"
  });
  console.log("  ✅ فاتورة المشتريات PUR-000083: تم تصحيح الصنف المكرر في السطر 15 إلى كيس نايلون (8) كود 43070.");

  // Correct stock for nylon 24 (LL5a49ARgDEA4QbPvXRp) from 20 to 10
  const nylon24Id = 'LL5a49ARgDEA4QbPvXRp';
  await updateDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${MAIN_WH_ID}_${nylon24Id}`), {
    qty: 10,
    updatedAt: Timestamp.now()
  });
  await updateDoc(doc(db, `companies/${COMPANY_ID}/products`, nylon24Id), {
    totalQty: 10,
    updatedAt: Timestamp.now()
  });
  await addDoc(collection(db, `companies/${COMPANY_ID}/stockTransactions`), {
    productId: nylon24Id,
    productName: "كيس نايلون (24) 20 كيلو",
    sku: "43036",
    warehouseId: MAIN_WH_ID,
    warehouseName: "المستودع الرئيسى",
    type: "adjustment",
    sourceType: "correction",
    sourceId: "5mBKJ7del4HLaSeHAjdg",
    invoiceNumber: "PUR-000083",
    documentNumber: "PUR-000083",
    qtyChange: -10,
    qtyBefore: 20,
    qtyAfter: 10,
    date: "2026-10-15",
    notes: "تصحيح الإدخال المكرر في فاتورة الشراء PUR-000083 (كان مدخلاً 20 والمطلوب 10)",
    createdAt: Timestamp.now()
  });
  console.log("  ✅ كيس نايلون (24): تم تصحيح الرصيد من 20 إلى 10.");

  // Correct stock for nylon 8 (gS5LZNGjTrBOuwhoB7uA) to 10
  const nylon8Id = 'gS5LZNGjTrBOuwhoB7uA';
  await setDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${MAIN_WH_ID}_${nylon8Id}`), {
    warehouseId: MAIN_WH_ID,
    warehouseName: "المستودع الرئيسى",
    productId: nylon8Id,
    productName: "كيس نايلون (8) 20 كيلو",
    sku: "43070",
    qty: 10,
    updatedAt: Timestamp.now()
  }, { merge: true });

  await updateDoc(doc(db, `companies/${COMPANY_ID}/products`, nylon8Id), {
    totalQty: 10,
    costPrice: 119,
    updatedAt: Timestamp.now()
  });

  await addDoc(collection(db, `companies/${COMPANY_ID}/stockTransactions`), {
    productId: nylon8Id,
    productName: "كيس نايلون (8) 20 كيلو",
    sku: "43070",
    warehouseId: MAIN_WH_ID,
    warehouseName: "المستودع الرئيسى",
    type: "purchase_in",
    sourceType: "purchaseInvoice",
    sourceId: "5mBKJ7del4HLaSeHAjdg",
    invoiceNumber: "PUR-000083",
    documentNumber: "PUR-000083",
    qtyChange: 10,
    qtyBefore: 0,
    qtyAfter: 10,
    purchasePrice: 119,
    date: "2026-10-15",
    notes: "إثبات وارد فاتورة الشراء PUR-000083 لكيس نايلون (8) كود 43070",
    createdAt: Timestamp.now()
  });
  console.log("  ✅ كيس نايلون (8): تم إنشاء وتعيين الرصيد إلى 10 وإثبات حركة الوارد.");

  console.log("\n=== STEP 4: VERIFICATION ===");
  for (const pid of prodIds) {
    const psnap = await getDoc(doc(db, `companies/${COMPANY_ID}/products`, pid));
    const p = psnap.data();
    const whDocId = `${MAIN_WH_ID}_${pid}`;
    const sbsnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, whDocId));
    const sb = sbsnap.data();
    console.log(`Product [${p.sku}] ${p.name}:`);
    console.log(`  -> Master totalQty: ${p.totalQty}`);
    console.log(`  -> Main Warehouse Qty: ${sb?.qty}`);
  }
}

backupAndFix().catch(console.error);
