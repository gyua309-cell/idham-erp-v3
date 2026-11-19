import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function traceBagsHistory() {
  const [prodsSnap, txsSnap, piSnap, siSnap, trSnap, adjSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions')),
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/stockTransfers')),
    getDocs(collection(db, 'companies/idham-main/inventoryAdjustments'))
  ]);

  const bag15Id = 'Kgqy5tEZswKnEJtaHB0P'; // اكياس مقاس15/1000
  const bag18Id = 'k9SN4NfHIQJ1Qbzz9F8E'; // اكياس مقاس18/2000

  console.log('=== PRODUCT 1: اكياس مقاس15/1000 كرتون بنى (PRD-30692) ===');
  const txs15 = txsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.productId === bag15Id);
  txs15.sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  txs15.forEach(t => {
    console.log(`TX: date=${t.date}, type=${t.type}, wh=${t.warehouseId}, delta=${t.qtyChange}, before=${t.qtyBefore}, after=${t.qtyAfter}, doc=${t.documentNumber}, notes=${t.notes}`);
  });

  console.log('\n=== PRODUCT 2: اكياس مقاس18/2000 كرتون بنى (PRD-37612) ===');
  const txs18 = txsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.productId === bag18Id);
  txs18.sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  txs18.forEach(t => {
    console.log(`TX: date=${t.date}, type=${t.type}, wh=${t.warehouseId}, delta=${t.qtyChange}, before=${t.qtyBefore}, after=${t.qtyAfter}, doc=${t.documentNumber}, notes=${t.notes}`);
  });

  console.log('\n=== SALES INVOICE REP-08307372 (Where bags were sold) ===');
  const inv = siSnap.docs.map(d => ({ id: d.id, ...d.data() })).find(s => s.number === 'REP-08307372');
  if (inv) {
    console.log(JSON.stringify(inv, null, 2));
  }
}

traceBagsHistory().catch(console.error);
