import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function inspectReceiptsExpenses() {
  console.log("=== Checking Receipts with Bank Payments ===");
  const rSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), limit(50)));
  const bankReceipts = rSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.paymentMethod === "bank" || r.paymentMethod === "transfer" || r.sourceId === "0j34llJOFXQ2McuwHCtr" || r.bankAccountId === "0j34llJOFXQ2McuwHCtr");
  
  console.log("Found bank receipts:", bankReceipts.length);
  if (bankReceipts.length > 0) {
    console.log("Sample bank receipt:", JSON.stringify(bankReceipts[0], null, 2));
  }

  console.log("\n=== Checking Expenses with Bank Payments ===");
  const eSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), limit(50)));
  const bankExpenses = eSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(e => e.paymentMethod === "bank" || e.paymentMethod === "transfer" || e.sourceId === "0j34llJOFXQ2McuwHCtr" || e.bankAccountId === "0j34llJOFXQ2McuwHCtr");
  
  console.log("Found bank expenses:", bankExpenses.length);
  if (bankExpenses.length > 0) {
    console.log("Sample bank expense:", JSON.stringify(bankExpenses[0], null, 2));
  }
}

inspectReceiptsExpenses().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
