import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function testModalDuplicates() {
  const bankId = "0j34llJOFXQ2McuwHCtr";
  const bankAccountCode = "1-1-1-3-02";

  const [txnsSnap, rcptsSnap, expsSnap, jvsSnap] = await Promise.all([
    getDocs(query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), where("bankAccountId", "==", bankId))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceId", "==", bankId))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), where("sourceId", "==", bankId))),
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`))
  ]);

  console.log("txnsSnap size:", txnsSnap.size);
  console.log("rcptsSnap size:", rcptsSnap.size);
  console.log("expsSnap size:", expsSnap.size);

  let jvCount = 0;
  jvsSnap.forEach(d => {
    const je = d.data();
    (je.lines || []).forEach(l => {
      if (l.accountCode === bankAccountCode) jvCount++;
    });
  });
  console.log("Matching JE lines:", jvCount);
}

testModalDuplicates().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
