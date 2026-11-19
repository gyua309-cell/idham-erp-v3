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

async function testPeriodStatement() {
  const bankDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, "0j34llJOFXQ2McuwHCtr"));
  const currentBankBalance = bankDoc.data().balance;

  const btxSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/bankTransactions`),
    where("bankAccountId", "==", "0j34llJOFXQ2McuwHCtr")
  ));

  const items = btxSnap.docs.map(d => {
    const data = d.data();
    const isoDate = getISODate(data);
    const isInc = data.type === "in";
    return {
      id: d.id,
      isoDate,
      ts: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : new Date(isoDate).getTime(),
      notes: data.notes,
      ref: data.refNumber || d.id,
      inflow: isInc ? Number(data.amount || 0) : 0,
      outflow: !isInc ? Number(data.amount || 0) : 0,
    };
  });

  items.sort((a,b) => {
    const c = (a.isoDate || "").localeCompare(b.isoDate || "");
    if (c !== 0) return c;
    return (a.ts || 0) - (b.ts || 0);
  });

  let sumIn = 0;
  let sumOut = 0;
  items.forEach(i => { sumIn += i.inflow; sumOut += i.outflow; });
  const startingBal = currentBankBalance - (sumIn - sumOut);

  // Filter period: 2026-10-13 to 2026-10-20
  const from = "2026-10-13";
  const to = "2026-10-20";

  let balBeforePeriod = startingBal;
  const periodItems = [];

  items.forEach(i => {
    if (i.isoDate < from) {
      balBeforePeriod += (i.inflow - i.outflow);
    } else if (i.isoDate <= to) {
      periodItems.push(i);
    }
  });

  console.log(`Balance before period (${from}): ${balBeforePeriod.toFixed(2)}`);
  console.log(`Period items count: ${periodItems.length}`);

  let run = balBeforePeriod;
  periodItems.forEach((p, idx) => {
    run += (p.inflow - p.outflow);
    console.log(`${idx + 1}. ${p.isoDate} | ${p.ref} | in:${p.inflow} | out:${p.outflow} | Bal:${run.toFixed(2)} | ${p.notes}`);
  });

  console.log(`Ending Balance: ${run.toFixed(2)} (Matches current: ${run.toFixed(2) === currentBankBalance.toFixed(2)})`);
}

testPeriodStatement().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
