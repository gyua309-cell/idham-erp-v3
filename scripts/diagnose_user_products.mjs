import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function diagnose() {
  console.log("Fetching products...");
  const prodSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const targets = ['كوناج', 'العندليب', 'التوحيد', 'نايلون'];
  const matchedProds = prods.filter(p => {
    return targets.some(t => (p.name && p.name.includes(t)) || (p.sku && p.sku.includes(t)));
  });

  console.log(`Found ${matchedProds.length} matching products:`);
  matchedProds.forEach(p => {
    console.log(`ID: ${p.id} | SKU: ${p.sku} | Name: ${p.name} | totalQty: ${p.totalQty} | currentStock: ${p.currentStock}`);
  });

  const matchedIds = matchedProds.map(p => p.id);

  console.log("\nFetching stockByWarehouse...");
  const sbwSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
  const sbw = sbwSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const warehousesSnap = await getDocs(collection(db, 'companies/idham-main/warehouses'));
  const whMap = {};
  warehousesSnap.docs.forEach(d => { whMap[d.id] = d.data().name; });

  matchedProds.forEach(p => {
    console.log(`\n=== PRODUCT: [${p.sku}] ${p.name} (ID: ${p.id}) ===`);
    console.log(`Master Doc: totalQty=${p.totalQty}, currentStock=${p.currentStock}`);
    const whRecords = sbw.filter(s => s.productId === p.id || s.id.endsWith(`_${p.id}`));
    console.log(`Warehouse records (${whRecords.length}):`);
    whRecords.forEach(r => {
      console.log(`  - Doc ID: ${r.id} | WH: ${whMap[r.warehouseId] || r.warehouseId} (${r.warehouseId}) | qty: ${r.qty}`);
    });
  });

  console.log("\nFetching stockTransactions for these products...");
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const allTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  matchedProds.forEach(p => {
    console.log(`\n--- Transactions for [${p.sku}] ${p.name} ---`);
    const pTxs = allTxs.filter(t => t.productId === p.id);
    // sort by date
    pTxs.sort((a,b) => (a.date || '').localeCompare(b.date || '') || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    console.log(`Total transactions found: ${pTxs.length}`);
    let running = 0;
    pTxs.forEach(t => {
      const q = parseFloat(t.qty || t.quantity || 0);
      running += (t.type === 'in' || t.direction === 'in' || q > 0 ? Math.abs(q) : -Math.abs(q));
      console.log(`  Date: ${t.date} | Type: ${t.type || t.refType} | DocNo: ${t.refDocNo || t.docNo || t.id} | WH: ${whMap[t.warehouseId] || t.warehouseId} | qty: ${q} | note: ${t.note || ''} | Running calc: ${running}`);
    });
  });
}

diagnose().catch(console.error);
