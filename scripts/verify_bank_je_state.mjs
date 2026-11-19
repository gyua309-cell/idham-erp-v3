import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function verifyState() {
  const bankDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, "0j34llJOFXQ2McuwHCtr"));
  console.log("Bank balance in DB:", bankDoc.data().balance);

  const btxSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  const hasJE = btxSnap.docs.some(d => d.data().refNumber === "JE-2026-20260724" || d.data().sourceId === "AoXpRRDKde44HpUWdMyo" || d.id === "AoXpRRDKde44HpUWdMyo");
  console.log("Is JE in bankTransactions?", hasJE);

  // Check how many manual JEs affect Al-Rajhi
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const rajhiJEs = [];
  jesSnap.forEach(d => {
    const je = d.data();
    (je.lines || []).forEach(l => {
      if (l.accountCode === "1-1-1-3-02") {
        rajhiJEs.push({ id: d.id, code: je.code || je.entryNumber, date: je.date, desc: je.description, dr: l.debit, cr: l.credit });
      }
    });
  });
  console.log("Manual/Other JEs affecting Al-Rajhi count:", rajhiJEs.length);
  console.log("Sample Rajhi JEs:", rajhiJEs.slice(0, 10));
}

verifyState().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
