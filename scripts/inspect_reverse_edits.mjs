import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectAllReverseEdits() {
  const [prodSnap, txSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions'))
  ]);

  const products = Object.fromEntries(prodSnap.docs.map(d => [d.id, d.data()]));
  const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const revTxs = txs.filter(t => t.type === 'sale_reverse_edit');
  console.log(`Total sale_reverse_edit transactions: ${revTxs.length}`);

  const byProd = {};
  revTxs.forEach(t => {
    if (!t.productId) return;
    if (!byProd[t.productId]) byProd[t.productId] = [];
    byProd[t.productId].push(t);
  });

  console.log(`Products affected by sale_reverse_edit: ${Object.keys(byProd).length}`);
  for (const [pId, pList] of Object.entries(byProd)) {
    const p = products[pId] || {};
    console.log(`\nProduct: [${p.sku || p.code}] ${p.name || p.nameAr || pId} (TotalQty: ${p.totalQty})`);
    console.log(`  Count of reverse_edit txs: ${pList.length}`);
    pList.forEach(t => {
      console.log(`    Ref: ${t.refId || t.documentNumber || t.invoiceNumber} | QtyChange: ${t.qtyChange} | Date: ${t.date} | Note: ${t.notes}`);
    });
  }
}

inspectAllReverseEdits().catch(console.error);
