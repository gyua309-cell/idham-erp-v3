import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function addBankTxnForJE() {
  const jeDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/journalEntries`, "AoXpRRDKde44HpUWdMyo"));
  if (!jeDoc.exists()) {
    console.error("JE not found!");
    return;
  }
  const je = jeDoc.data();
  console.log("Found JE:", je.description, je.date, je.totalDebit);

  // Bank Account for Al-Rajhi: 0j34llJOFXQ2McuwHCtr
  const bankAccountId = "0j34llJOFXQ2McuwHCtr";

  // Create bankTransaction record
  const txnId = `btx_je_AoXpRRDKde44`;
  const txnRef = doc(db, `companies/${COMPANY_ID}/bankTransactions`, txnId);
  
  await setDoc(txnRef, {
    bankAccountId,
    amount: 2314.76,
    type: "in", // Debit bank = money in (+)
    date: je.date || "2026-10-01",
    refNumber: je.code || je.entryNumber || "JE-2026-20260724",
    notes: `قيد يومية: ${je.description || 'من الجارى الى مصرف الراجحى'}`,
    sourceType: "manualJE",
    sourceId: "AoXpRRDKde44HpUWdMyo",
    balanceAfter: 146234.32,
    createdAt: je.createdAt || serverTimestamp()
  });

  console.log("Successfully created bankTransaction doc:", txnId);
}

addBankTxnForJE().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
