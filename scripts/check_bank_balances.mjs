import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

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

async function checkBalances() {
  const rajhiDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/bankAccounts`, "0j34llJOFXQ2McuwHCtr"));
  const rajhi = rajhiDoc.data();
  console.log("Current Rajhi Bank Doc:", {
    name: rajhi.name,
    balance: rajhi.balance,
    openingBalance: rajhi.openingBalance,
    accountCode: rajhi.accountCode
  });

  const btxSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/bankTransactions`),
    where("bankAccountId", "==", "0j34llJOFXQ2McuwHCtr")
  ));
  const txns = btxSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Sort by date/createdAt
  txns.sort((a,b) => {
    const da = getTxnDate(a) + (a.createdAt?.seconds || 0);
    const db = getTxnDate(b) + (b.createdAt?.seconds || 0);
    return da.localeCompare(db);
  });

  let sumIn = 0;
  let sumOut = 0;
  txns.forEach(t => {
    if (t.type === "in") sumIn += Number(t.amount || 0);
    else sumOut += Number(t.amount || 0);
  });

  console.log(`Total Inflow from txns: ${sumIn.toFixed(2)}`);
  console.log(`Total Outflow from txns: ${sumOut.toFixed(2)}`);
  console.log(`Net Movement: ${(sumIn - sumOut).toFixed(2)}`);
  console.log(`Current Balance in Doc: ${rajhi.balance}`);
  console.log(`Implied Opening/Base Balance: ${(rajhi.balance - (sumIn - sumOut)).toFixed(2)}`);

  // Also check Chart of Accounts balance for 1-1-1-3-02
  const coaSnap = await getDocs(query(
    collection(db, `companies/${COMPANY_ID}/chartOfAccounts`),
    where("code", "==", rajhi.accountCode || "1-1-1-3-02")
  ));
  if (!coaSnap.empty) {
    const coaAcc = coaSnap.docs[0].data();
    console.log("COA Account balance:", coaAcc.code, coaAcc.name, coaAcc.balance);
  }
}

checkBalances().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
