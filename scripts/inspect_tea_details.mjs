import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectDetails() {
  const teaId = 'gtOkpFC26meAhlHSgLQj';
  
  // Stock transactions
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const teaTxs = txSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.productId === teaId || (t.items && t.items.some(i => i.productId === teaId)));
    
  console.log('Stock Transactions for Tea:');
  console.log(JSON.stringify(teaTxs, null, 2));

  // INV-042034
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const inv = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).find(i => (i.invoiceNumber || i.number || i.id) === 'INV-042034');
  console.log('\nInvoice INV-042034:');
  console.log(JSON.stringify(inv, null, 2));
}

inspectDetails().catch(console.error);
