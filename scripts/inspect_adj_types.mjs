import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectAdjustmentsAndTransactions() {
  const [adjSnap, txSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/inventoryAdjustments')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions'))
  ]);

  const adjs = adjSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Inventory Adjustments Count: ${adjs.length}`);
  adjs.forEach(a => {
    console.log(`ADJ: ID=${a.id}, Num=${a.number || a.adjustmentNumber}, Date=${a.date}, Type=${a.type}, Status=${a.status}`);
    const items = a.items || a.lines || [];
    items.forEach(i => {
      console.log(`   Item: ${i.productName || i.name} | SysQty: ${i.systemQty || i.currentQty} | Counted: ${i.countedQty || i.physicalQty} | Diff: ${i.difference !== undefined ? i.difference : i.qtyDelta}`);
    });
  });

  // Check what types of transactions exist in stockTransactions
  const types = {};
  txs.forEach(t => {
    types[t.type] = (types[t.type] || 0) + 1;
  });
  console.log('\nTransaction Types in DB:');
  console.log(JSON.stringify(types, null, 2));
}

inspectAdjustmentsAndTransactions().catch(console.error);
