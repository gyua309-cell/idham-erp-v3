import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function inspectTxnDates() {
  const bankTxnSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  const txns = bankTxnSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const rajhiTxns = txns.filter(t => t.bankAccountId === "0j34llJOFXQ2McuwHCtr");
  console.log("Rajhi txns count:", rajhiTxns.length);

  const dates = rajhiTxns.map(t => {
    let dStr = "";
    if (t.date) dStr = t.date;
    else if (t.createdAt) {
      if (typeof t.createdAt === "string") dStr = t.createdAt;
      else if (t.createdAt.seconds) {
        const d = new Date(t.createdAt.seconds * 1000);
        dStr = d.toISOString().split("T")[0];
      }
    }
    return dStr;
  });

  dates.sort();
  console.log("Min date:", dates[0]);
  console.log("Max date:", dates[dates.length - 1]);
  console.log("Date distribution:");
  const countsByMonth = {};
  dates.forEach(d => {
    const m = d.substring(0, 7);
    countsByMonth[m] = (countsByMonth[m] || 0) + 1;
  });
  console.log(countsByMonth);

  console.log("\nLast 10 transactions:");
  rajhiTxns.slice(-10).forEach(t => {
    console.log({
      date: t.date,
      createdAtSeconds: t.createdAt?.seconds,
      iso: t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toISOString() : null,
      amount: t.amount,
      type: t.type,
      notes: t.notes
    });
  });
}

inspectTxnDates().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
