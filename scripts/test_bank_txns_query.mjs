import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function testBankTxnsQuery() {
  const q = query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const rajhiTxns = txns.filter(t => t.bankAccountId === "0j34llJOFXQ2McuwHCtr");
  console.log("Total Rajhi bank txns now:", rajhiTxns.length);

  const target = rajhiTxns.find(t => t.id === "btx_je_AoXpRRDKde44" || t.amount === 2314.76);
  console.log("Found our JE bank transaction:", target);
}

testBankTxnsQuery().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
