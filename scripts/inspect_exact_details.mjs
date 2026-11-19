import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectExact() {
  console.log("=== 1. PURCHASE INVOICE 5mBKJ7del4HLaSeHAjdg ===");
  const piSnap = await getDoc(doc(db, 'companies/idham-main/purchaseInvoices', '5mBKJ7del4HLaSeHAjdg'));
  if (piSnap.exists()) {
    const pi = piSnap.data();
    console.log(`InvoiceNo: ${pi.invoiceNo} | Date: ${pi.date} | Supplier: ${pi.supplierName} | Notes: ${pi.notes}`);
    console.log("Items:");
    (pi.items || []).forEach((it, idx) => {
      console.log(`  [${idx}] prodId: ${it.productId} | name: ${it.productName || it.name} | qty: ${it.qty} | unitPrice: ${it.unitPrice} | total: ${it.total}`);
    });
  }

  console.log("\n=== 2. SALES INVOICE FvN34BzjYJeMX6AbFnTn (INV-042028) ===");
  const siSnap = await getDoc(doc(db, 'companies/idham-main/salesInvoices', 'FvN34BzjYJeMX6AbFnTn'));
  if (siSnap.exists()) {
    const si = siSnap.data();
    console.log(`InvoiceNo: ${si.invoiceNo} | Date: ${si.date} | Customer: ${si.customerName} | Status: ${si.status} | Warehouse: ${si.warehouseName}`);
    console.log("Items:");
    (si.items || []).forEach((it, idx) => {
      console.log(`  [${idx}] prodId: ${it.productId} | name: ${it.productName || it.name} | qty: ${it.qty} | unitPrice: ${it.unitPrice} | total: ${it.total}`);
    });
  }

  console.log("\n=== 3. ALL STOCK TRANSACTIONS FOR MOATTAR COTTAGE (ydKSXXu03a9KkMjZt71q) ===");
  const txSnap1 = await getDocs(query(collection(db, 'companies/idham-main/stockTransactions'), where('productId', '==', 'ydKSXXu03a9KkMjZt71q')));
  txSnap1.docs.forEach(d => {
    console.log(`  Tx ${d.id}:`, JSON.stringify(d.data()));
  });

  console.log("\n=== 4. ALL STOCK TRANSACTIONS FOR MOATTAR ANDALEEB (4F1zPkjk7V5XR4Cf7eep) ===");
  const txSnap2 = await getDocs(query(collection(db, 'companies/idham-main/stockTransactions'), where('productId', '==', '4F1zPkjk7V5XR4Cf7eep')));
  txSnap2.docs.forEach(d => {
    console.log(`  Tx ${d.id}:`, JSON.stringify(d.data()));
  });

  console.log("\n=== 5. CHECK IF PRODUCT [43070] كيس نايلون (8) 20 كيلو EXISTS IN ALL INVOICES ===");
  const allPisSnap = await getDocs(collection(db, 'companies/idham-main/purchaseInvoices'));
  allPisSnap.docs.forEach(d => {
    const p = d.data();
    (p.items || []).forEach(it => {
      if (it.productId === 'gS5LZNGjTrBOuwhoB7uA' || it.productName?.includes('8') && it.productName?.includes('نايلون')) {
        console.log(`  Found in PI ${p.invoiceNo}:`, it);
      }
    });
  });
}

inspectExact().catch(console.error);
