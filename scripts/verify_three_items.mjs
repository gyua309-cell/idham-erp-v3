import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function verifyThreeItems() {
  const prodSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  const stockSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));

  const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const stocks = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const items = [
    { label: 'شاي الكابوس', sku: '13006' },
    { label: 'زبدة بلو ريفر', sku: '02022' },
    { label: 'ماء صفا 5 لتر', sku: '05020' }
  ];

  for (const it of items) {
    const p = prods.find(x => x.sku === it.sku || x.code === it.sku || (x.name && x.name.includes(it.label)));
    if (!p) {
      console.log(`Product ${it.label} not found!`);
      continue;
    }
    const whDocs = stocks.filter(s => s.productId === p.id);
    const totalWhStock = whDocs.reduce((sum, s) => sum + (parseFloat(s.qty) || 0), 0);
    console.log(`=======================================================`);
    console.log(`Product: [${p.sku}] ${p.name}`);
    console.log(`  - Product Doc totalQty: ${p.totalQty}`);
    console.log(`  - StockByWarehouse Sum: ${totalWhStock}`);
    console.log(`  - Stock Status: ${p.stockStatus || whDocs[0]?.stockStatus}`);
    whDocs.forEach(w => {
      console.log(`    Warehouse ${w.warehouseId}: qty = ${w.qty}`);
    });
  }
}

verifyThreeItems().catch(console.error);
