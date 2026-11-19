import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

function getISODate(t) {
  if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) return t.date;
  if (t.createdAt?.seconds) {
    const d = new Date(t.createdAt.seconds * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

async function analyzeAllTxns() {
  const bankDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, "0j34llJOFXQ2McuwHCtr"));
  const currentBankBalance = bankDoc.data().balance;
  console.log("Current Bank Balance in DB:", currentBankBalance);

  const [txnsSnap, rcptsSnap, expsSnap, jvsSnap] = await Promise.all([
    getDocs(query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), where("bankAccountId", "==", "0j34llJOFXQ2McuwHCtr"))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceId", "==", "0j34llJOFXQ2McuwHCtr"))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), where("sourceId", "==", "0j34llJOFXQ2McuwHCtr"))),
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`))
  ]);

  const items = [];
  const processedRefs = new Set();

  txnsSnap.forEach(d => {
    const data = d.data();
    const isoDate = getISODate(data);
    const isInc = data.type === "in";
    const ref = data.refNumber || d.id;
    processedRefs.add(ref);
    if (data.sourceId) processedRefs.add(data.sourceId);
    processedRefs.add(d.id);

    items.push({
      id: d.id,
      isoDate,
      ts: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(isoDate).getTime(),
      notes: data.notes,
      inflow: isInc ? (data.amount || 0) : 0,
      outflow: !isInc ? (data.amount || 0) : 0,
      ref,
      source: "bankTransaction"
    });
  });

  // Sort chronologically ascending (Oldest to Newest)
  items.sort((a,b) => {
    const c = (a.isoDate || "").localeCompare(b.isoDate || "");
    if (c !== 0) return c;
    return (a.ts || 0) - (b.ts || 0);
  });

  console.log("Total unique bank items:", items.length);

  let sumIn = 0;
  let sumOut = 0;
  items.forEach(item => {
    sumIn += item.inflow;
    sumOut += item.outflow;
  });

  console.log(`Sum In: ${sumIn.toFixed(2)}, Sum Out: ${sumOut.toFixed(2)}, Net: ${(sumIn - sumOut).toFixed(2)}`);
  
  // Calculate implied starting balance
  const startingBal = currentBankBalance - (sumIn - sumOut);
  console.log(`Starting Balance so final equals ${currentBankBalance}: ${startingBal.toFixed(2)}`);

  // Compute running balance starting from startingBal
  let running = startingBal;
  items.forEach(item => {
    running += (item.inflow - item.outflow);
    item.bal = Math.round(running * 100) / 100;
  });

  console.log("First 5 items with correct running balance:");
  items.slice(0, 5).forEach(i => console.log(i.isoDate, i.ref, `+${i.inflow}`, `-${i.outflow}`, `Bal: ${i.bal}`));

  console.log("\nLast 5 items with correct running balance:");
  items.slice(-5).forEach(i => console.log(i.isoDate, i.ref, `+${i.inflow}`, `-${i.outflow}`, `Bal: ${i.bal}`));
}

analyzeAllTxns().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
