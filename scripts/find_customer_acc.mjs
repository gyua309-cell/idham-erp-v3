import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function findCustomerAcc() {
  const coaSnap = await getDocs(collection(db, 'companies/idham-main/chartOfAccounts'));
  coaSnap.forEach(d => {
    const data = d.data();
    if (data.name && (data.name.includes('عيش وملح') || data.name.includes('جسر الخير'))) {
      console.log(`Found: ID: ${d.id}, Code: ${data.code}, Name: ${data.name}`);
    }
  });

  // Check how other returns for مطعم عيش وملح or other JEs reference it
  const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  jeSnap.forEach(d => {
    const data = d.data();
    if (data.description && data.description.includes('عيش وملح')) {
      console.log('JE for عيش وملح:', data.description);
      console.log(data.lines);
    }
  });

  process.exit(0);
}
findCustomerAcc();
