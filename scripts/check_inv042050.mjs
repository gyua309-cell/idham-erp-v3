import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkInv042050() {
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const invTxs = txs.filter(t => t.invoiceNumber === 'INV-042050' || t.documentNumber === 'INV-042050' || t.refId === 'INV-042050');
  console.log(`INV-042050 transactions: ${invTxs.length}`);
  invTxs.forEach(t => {
    console.log(`[${t.type}] Prod=${t.productName || t.productId} | Qty=${t.qtyChange} | Note=${t.notes}`);
  });
}

checkInv042050().catch(console.error);
