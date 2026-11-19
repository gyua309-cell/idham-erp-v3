import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectJEs() {
  const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  const jes = [];
  jeSnap.forEach(d => jes.push({ id: d.id, ...d.data() }));

  const matched = jes.filter(j => 
    JSON.stringify(j).includes('INV-042027') ||
    JSON.stringify(j).includes('19140') ||
    JSON.stringify(j).includes('19,140') ||
    (j.entryNumber === 'JE-001784')
  );

  console.log(`Found ${matched.length} matched JEs:`);
  matched.forEach(j => {
    console.log(JSON.stringify(j, null, 2));
  });
}
inspectJEs();
