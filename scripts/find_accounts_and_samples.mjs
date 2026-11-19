import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function findAccounts() {
  const coaSnap = await getDocs(collection(db, 'companies/idham-main/chartOfAccounts'));
  console.log('=== CHART OF ACCOUNTS RELEVANT ACCOUNTS ===');
  coaSnap.forEach(d => {
    const data = d.data();
    if (data.code.startsWith('1-1-3') || data.code.startsWith('2-1-3') || data.code.startsWith('4-1') || data.code.startsWith('5-1') || data.code.startsWith('1-1-4')) {
      console.log(`${data.code} | ${data.name} | ID: ${d.id}`);
    }
  });

  // Also look up existing JEs for sales invoices to match the exact structure
  const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  console.log('\n=== SAMPLE INVOICE JE ===');
  jeSnap.forEach(d => {
    const data = d.data();
    if (data.description && data.description.includes('مبيعات — فاتورة REP-38320048')) {
      console.log(JSON.stringify({ id: d.id, ...data }, null, 2));
    }
    if (data.description && data.description.includes('مردود مبيعات — إشعار دائن CR-21415827')) {
      console.log('\n=== SAMPLE RETURN JE ===');
      console.log(JSON.stringify({ id: d.id, ...data }, null, 2));
    }
  });

  process.exit(0);
}
findAccounts();
