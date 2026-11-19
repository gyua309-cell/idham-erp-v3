import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function inspectBank() {
  console.log("=== Bank Accounts ===");
  const bankAccSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankAccounts`));
  const bankAccounts = bankAccSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Bank Accounts count:", bankAccounts.length);
  bankAccounts.forEach(b => console.log(b.id, b.name, b.accountNumber, b.balance, b.accountCode));

  console.log("\n=== Bank Transactions ===");
  const bankTxnSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  console.log("bankTransactions count:", bankTxnSnap.size);
  if (bankTxnSnap.size > 0) {
    const sample = bankTxnSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() }));
    console.log("Sample 5 txns:", JSON.stringify(sample, null, 2));

    // Check dates of txns for Rajhi
    const rajhiId = bankAccounts.find(b => b.name.includes("الراجحي"))?.id;
    console.log("Rajhi ID:", rajhiId);
    const rajhiTxns = bankTxnSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(t => t.bankAccountId === rajhiId);
    console.log("Total Rajhi Txns:", rajhiTxns.length);
    console.log("Dates of first 10 Rajhi txns:");
    rajhiTxns.slice(0, 10).forEach(t => {
      console.log({
        id: t.id,
        date: t.date,
        createdAt: t.createdAt,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        notes: t.notes
      });
    });
  }
}

inspectBank().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
