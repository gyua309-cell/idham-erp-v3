import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function inspectJE() {
  console.log("=== Checking JE-2026-20260724 ===");
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const matched = [];
  jesSnap.forEach(d => {
    const data = d.data();
    if (d.id.includes("20260724") || data.entryNumber === "JE-2026-20260724" || data.code === "JE-2026-20260724" || JSON.stringify(data).includes("2314.76")) {
      matched.push({ id: d.id, ...data });
    }
  });

  console.log("Matched JEs count:", matched.length);
  matched.forEach(m => console.log(JSON.stringify(m, null, 2)));

  console.log("\n=== Checking COA Account 1-1-1-3-02 ===");
  const coaSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/chartOfAccounts`),
    where("code", "==", "1-1-1-3-02")
  ));
  if (!coaSnap.empty) {
    const coa = coaSnap.docs[0].data();
    console.log("COA 1-1-1-3-02:", {
      id: coaSnap.docs[0].id,
      code: coa.code,
      name: coa.name,
      balance: coa.balance,
      debit: coa.debit,
      credit: coa.credit
    });
  } else {
    console.log("Account 1-1-1-3-02 NOT FOUND in COA!");
  }

  console.log("\n=== Checking Bank Account doc ===");
  const bankDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, "0j34llJOFXQ2McuwHCtr"));
  if (bankDoc.exists()) {
    console.log("Bank doc:", bankDoc.data());
  }

  console.log("\n=== Checking bankTransactions for 2314.76 ===");
  const btxSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  const btxMatched = btxSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => Math.abs(t.amount - 2314.76) < 0.01 || (t.notes && t.notes.includes("الجاري")));
  console.log("bankTransactions matched:", btxMatched);
}

inspectJE().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
