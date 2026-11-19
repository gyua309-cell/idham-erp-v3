import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

function getTxnDate(t) {
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

async function testRange() {
  const btxSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/bankTransactions`),
    where("bankAccountId", "==", "0j34llJOFXQ2McuwHCtr")
  ));
  const txns = btxSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const from = "2026-10-13";
  const to = "2026-10-20";

  const matching = txns.filter(t => {
    const d = getTxnDate(t);
    return (!from || d >= from) && (!to || d <= to);
  });

  console.log(`Transactions between ${from} and ${to}:`, matching.length);
  matching.forEach(t => {
    console.log(getTxnDate(t), t.type, t.amount, t.refNumber, t.notes);
  });
}

testRange().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
