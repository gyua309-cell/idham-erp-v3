import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function checkDups() {
  const btxSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/bankTransactions`),
    where("bankAccountId", "==", "0j34llJOFXQ2McuwHCtr")
  ));
  console.log("Total Rajhi bankTransactions:", btxSnap.size);

  const sourceIds = btxSnap.docs.map(d => d.data().sourceId).filter(Boolean);
  console.log("bankTransactions with sourceId count:", sourceIds.length);
  console.log("Sample sourceIds:", sourceIds.slice(0, 5));

  const hasAM1 = btxSnap.docs.some(d => d.data().sourceId === "AM1FRkU9qUzBUNU5EuJ6" || d.id === "AM1FRkU9qUzBUNU5EuJ6");
  console.log("Expense AM1FRkU9qUzBUNU5EuJ6 in bankTransactions:", hasAM1);

  const has1mm = btxSnap.docs.some(d => d.data().sourceId === "1mmCdd9rGU512oGztH7e" || d.id === "1mmCdd9rGU512oGztH7e");
  console.log("Receipt 1mmCdd9rGU512oGztH7e in bankTransactions:", has1mm);
}

checkDups().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
