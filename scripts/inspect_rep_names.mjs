import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectReps() {
  const [invSnap, custSnap, repsSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/customers')),
    getDocs(collection(db, 'companies/idham-main/salesReps'))
  ]);

  const invoices = invSnap.docs.map(d => d.data()).filter(i => i.status !== 'cancelled');
  const customers = custSnap.docs.map(d => d.data());
  const salesReps = repsSnap.docs.map(d => d.data());

  const invReps = new Set(invoices.map(i => i.repName).filter(Boolean));
  const custReps = new Set(customers.map(c => c.repName).filter(Boolean));
  const officialReps = new Set(salesReps.map(r => r.name).filter(Boolean));

  console.log('Official SalesReps collection:', Array.from(officialReps));
  console.log('Invoice Rep Names:', Array.from(invReps));
  console.log('Customer Rep Names:', Array.from(custReps));
}

inspectReps().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
