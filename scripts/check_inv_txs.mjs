import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkOtherItemsInInvoice() {
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const allTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const invTxs = allTxs.filter(t => 
    t.invoiceNumber === 'INV-042034' || 
    t.documentNumber === 'INV-042034' || 
    t.refId === 'INV-042034'
  );

  console.log(`Found ${invTxs.length} transactions for INV-042034:`);
  invTxs.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeA - timeB;
  });

  invTxs.forEach(t => {
    console.log(`[${t.type}] Prod=${t.productName || t.productId} | Qty=${t.qtyChange} | Before=${t.qtyBefore} | After=${t.qtyAfter} | Time=${t.createdAt?.seconds} | Note=${t.notes}`);
  });
}

checkOtherItemsInInvoice().catch(console.error);
