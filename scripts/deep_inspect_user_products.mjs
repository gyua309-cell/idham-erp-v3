import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function deepInspect() {
  console.log("1. Finding all products with 'معطر'...");
  const prodSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const moattarProds = prods.filter(p => p.name && (p.name.includes('معطر') || p.name.includes('كوناج') || p.name.includes('عندليب')));
  console.log(`Moattar products (${moattarProds.length}):`);
  moattarProds.forEach(p => {
    console.log(`  [${p.sku}] ${p.name} (ID: ${p.id}) -> totalQty: ${p.totalQty}`);
  });

  const nylonProds = prods.filter(p => p.name && (p.name.includes('نايلون') || p.name.includes('التوحيد') || (p.sku && ['43036','43070','43034','43035'].includes(p.sku))));
  console.log(`\nNylon products (${nylonProds.length}):`);
  nylonProds.forEach(p => {
    console.log(`  [${p.sku}] ${p.name} (ID: ${p.id}) -> totalQty: ${p.totalQty}`);
  });

  // Check purchase invoices lines
  console.log("\n2. Scanning Purchase Invoices...");
  const piSnap = await getDocs(collection(db, 'companies/idham-main/purchaseInvoices'));
  const allPIs = piSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const relevantProdIds = [...moattarProds, ...nylonProds].map(p => p.id);

  console.log(`Found ${allPIs.length} purchase invoices.`);
  allPIs.forEach(pi => {
    (pi.items || pi.lines || []).forEach(item => {
      if (relevantProdIds.includes(item.productId) || 
          moattarProds.some(m => item.productName?.includes('عندليب') || item.productName?.includes('كوناج')) ||
          nylonProds.some(n => item.productName?.includes('نايلون'))) {
        console.log(`  PI Doc: ${pi.invoiceNo || pi.id} | Date: ${pi.date} | Prod: [${item.productId}] ${item.productName || item.name} | Qty: ${item.qty || item.quantity} | UnitPrice: ${item.unitPrice || item.price} | Total: ${item.total || item.lineTotal}`);
      }
    });
  });

  // Check sales invoices lines
  console.log("\n3. Scanning Sales Invoices...");
  const siSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const allSIs = siSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${allSIs.length} sales invoices.`);
  allSIs.forEach(si => {
    (si.items || si.lines || []).forEach(item => {
      if (relevantProdIds.includes(item.productId) || 
          moattarProds.some(m => item.productName?.includes('عندليب') || item.productName?.includes('كوناج')) ||
          nylonProds.some(n => item.productName?.includes('نايلون'))) {
        console.log(`  SI Doc: ${si.invoiceNo || si.id} | Date: ${si.date} | Customer: ${si.customerName} | WH: ${si.warehouseName || si.warehouseId} | Prod: [${item.productId}] ${item.productName || item.name} | Qty: ${item.qty || item.quantity}`);
      }
    });
  });

  // Check delivery notes lines (اذون التسليم)
  console.log("\n4. Scanning Delivery Notes...");
  const dnSnap = await getDocs(collection(db, 'companies/idham-main/deliveryNotes'));
  console.log(`Found ${dnSnap.size} delivery notes.`);
  dnSnap.docs.forEach(d => {
    const dn = d.data();
    (dn.items || dn.lines || []).forEach(item => {
      if (relevantProdIds.includes(item.productId)) {
        console.log(`  DN Doc: ${dn.dnNo || d.id} | Date: ${dn.date} | Prod: ${item.productName} | Qty: ${item.qty}`);
      }
    });
  });

  // Check stock transactions sample to see fields
  console.log("\n5. Checking sample stockTransaction fields...");
  const txSnap = await getDocs(query(collection(db, 'companies/idham-main/stockTransactions'), where('productId', '==', '4F1zPkjk7V5XR4Cf7eep')));
  console.log(`Found ${txSnap.size} txs for 4F1zPkjk7V5XR4Cf7eep`);
  txSnap.docs.forEach(d => {
    console.log(`  Tx ${d.id}:`, JSON.stringify(d.data()));
  });
}

deepInspect().catch(console.error);
