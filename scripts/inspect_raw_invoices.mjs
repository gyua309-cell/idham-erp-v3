import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectDoc() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const invFarah = invoices.find(i => (i.number === 'INV-99937277' || i.invoiceNumber === 'INV-99937277' || i.id === 'INV-99937277' || (i.customerName === 'تموينات فرح' && i.date === '2026-07-22')));
  const invSaba = invoices.find(i => (i.customerName || '').includes('صبا المذاق'));
  const invSafa2 = invoices.filter(i => (i.customerName || '').includes('الصفا البخارى 2'));

  console.log('--- FARAH ---');
  console.log(JSON.stringify(invFarah, null, 2));

  console.log('--- SABA ---');
  console.log(JSON.stringify(invSaba, null, 2));

  console.log('--- SAFA 2 ---');
  console.log(JSON.stringify(invSafa2, null, 2));
}

inspectDoc().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
