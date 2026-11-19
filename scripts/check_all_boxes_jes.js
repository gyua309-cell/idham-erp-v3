import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain:        "idham-b3a7e.firebaseapp.com",
  projectId:         "idham-b3a7e",
  storageBucket:     "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId:             "1:915839133333:web:fe472e01993025f08a9d9c",
  measurementId:     "G-Y797B0GWYK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function run() {
  const [cbSnap, coaSnap, jesSnap, ctxSnap, expSnap, rcptSnap] = await Promise.all([
    getDocs(collection(db, `companies/${COMPANY_ID}/cashBoxes`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/cashTransactions`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/expenses`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/receipts`))
  ]);

  const boxes = cbSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const accounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const box of boxes) {
    const acc = accounts.find(a => a.id === box.accountId || a.code === box.accountCode);
    console.log(`\n========================================`);
    console.log(`Box: ${box.name} (${box.id}) | Stored Balance: ${box.balance}`);
    console.log(`Account: ${acc ? acc.code + ' - ' + acc.name + ' (Bal: ' + acc.balance + ')' : 'NO ACCOUNT'}`);

    if (!acc) continue;

    // Calculate JE balance for this account
    let jeDr = 0, jeCr = 0, jeCount = 0;
    jesSnap.forEach(d => {
      const je = d.data();
      if (je.status === "cancelled" || je.isReversed) return;
      (je.lines || []).forEach(l => {
        if (l.accountCode === acc.code || l.accountId === acc.id) {
          jeDr += Number(l.debit || 0);
          jeCr += Number(l.credit || 0);
          jeCount++;
        }
      });
    });

    console.log(`JE lines for account: ${jeCount} | Total Dr: ${jeDr} | Total Cr: ${jeCr} | Net: ${jeDr - jeCr}`);
  }
}

run().catch(console.error);
