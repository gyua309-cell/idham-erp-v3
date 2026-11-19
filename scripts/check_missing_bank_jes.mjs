import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function checkManualBankJEs() {
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const btxSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  
  const btxRefs = new Set();
  btxSnap.docs.forEach(d => {
    const data = d.data();
    if (data.refNumber) btxRefs.add(data.refNumber);
    if (data.sourceId) btxRefs.add(data.sourceId);
  });

  const missingJEs = [];
  jesSnap.docs.forEach(d => {
    const je = d.data();
    if (je.status === "cancelled" || je.isReversed) return;
    
    // Check if this JE is manual or without bankTransaction
    const isManual = je.sourceType === "manual" || !je.sourceType;
    (je.lines || []).forEach(l => {
      if (l.accountCode === "1-1-1-3-02") { // Al-Rajhi
        const code = je.code || je.entryNumber || d.id;
        if (!btxRefs.has(code) && !btxRefs.has(d.id)) {
          missingJEs.push({
            jeId: d.id,
            entryNumber: code,
            date: je.date,
            desc: je.description || l.note || "قيد يومية يدوي",
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
            sourceType: je.sourceType
          });
        }
      }
    });
  });

  console.log("Total JEs affecting Al-Rajhi not in bankTransactions:", missingJEs.length);
  missingJEs.forEach(m => console.log(m));
}

checkManualBankJEs().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
