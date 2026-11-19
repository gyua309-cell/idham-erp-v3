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

async function testFullChain() {
  const bankId = "0j34llJOFXQ2McuwHCtr";
  const bankDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, bankId));
  const currentBankBalance = bankDoc.data().balance;

  const btxSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/bankTransactions`),
    where("bankAccountId", "==", bankId)
  ));

  const allTxns = btxSnap.docs.map(d => {
    const data = d.data();
    const isoDate = getISODate(data);
    const isInc = data.type === "in";
    return {
      id: d.id,
      isoDate,
      ts: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(isoDate).getTime(),
      notes: data.notes || "حركة بنكية",
      ref: data.refNumber || d.id,
      amount: Number(data.amount || 0),
      inflow: isInc ? Number(data.amount || 0) : 0,
      outflow: !isInc ? Number(data.amount || 0) : 0,
    };
  });

  // Sort ascending chronologically
  allTxns.sort((a,b) => {
    const c = (a.isoDate || "").localeCompare(b.isoDate || "");
    if (c !== 0) return c;
    return (a.ts || 0) - (b.ts || 0);
  });

  // Base starting balance
  let totalIn = 0;
  let totalOut = 0;
  allTxns.forEach(t => { totalIn += t.inflow; totalOut += t.outflow; });
  const baseStartBal = currentBankBalance - (totalIn - totalOut);

  // Compute balanceAfter for every transaction in the master list
  let running = baseStartBal;
  allTxns.forEach(t => {
    running += (t.inflow - t.outflow);
    t.computedBalanceAfter = Math.round(running * 100) / 100;
  });

  console.log("Master list count:", allTxns.length);
  console.log("Last item computed balance:", allTxns[allTxns.length - 1].computedBalanceAfter);
  console.log("Matches current bank balance?:", allTxns[allTxns.length - 1].computedBalanceAfter === currentBankBalance);

  // Test period: 2026-10-13 to 2026-10-20
  const from = "2026-10-13";
  const to = "2026-10-20";

  const periodTxns = allTxns.filter(t => (!from || t.isoDate >= from) && (!to || t.isoDate <= to));
  console.log("Filtered count for 13-20 Oct:", periodTxns.length);
  
  // Previous balance before 2026-10-13:
  const txnsBefore = allTxns.filter(t => from && t.isoDate < from);
  const prevBal = txnsBefore.length > 0 ? txnsBefore[txnsBefore.length - 1].computedBalanceAfter : baseStartBal;
  console.log("Previous balance before 2026-10-13:", prevBal);

  console.log("\nPeriod table (Chronological Ascending):");
  periodTxns.forEach((t, i) => {
    console.log(`${i+1}. ${t.isoDate} | ${t.ref} | in:${t.inflow} | out:${t.outflow} | Bal:${t.computedBalanceAfter}`);
  });

  console.log("\nPeriod table (Latest First - Descending):");
  const descPeriod = [...periodTxns].reverse();
  descPeriod.forEach((t, i) => {
    console.log(`${i+1}. ${t.isoDate} | ${t.ref} | in:${t.inflow} | out:${t.outflow} | Bal:${t.computedBalanceAfter}`);
  });
}

testFullChain().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
