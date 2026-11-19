import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkCustomer() {
  const custId = 'sQG0xwdcdaKEfdUKG3IS';
  const custRef = doc(db, 'companies/idham-main/customers', custId);
  const custSnap = await getDoc(custRef);
  console.log("Customer:", custSnap.data().name, "Current balance in doc:", custSnap.data().balance);

  // Recalculate balance
  const invSnap = await getDocs(query(collection(db, 'companies/idham-main/salesInvoices'), where('customerId', '==', custId)));
  let totalInvoices = 0;
  let autoCredit = 0;
  invSnap.forEach(d => {
    const inv = d.data();
    if (inv.status !== 'cancelled') {
      totalInvoices += parseFloat(inv.totalWithVat || 0);
      console.log("Invoice:", inv.number, "Total:", inv.totalWithVat, "Paid:", inv.paidAmount, "Status:", inv.status);
    }
  });

  const rcptSnap = await getDocs(query(collection(db, 'companies/idham-main/receipts'), where('targetId', '==', custId)));
  let totalReceipts = 0;
  rcptSnap.forEach(d => {
    const r = d.data();
    totalReceipts += parseFloat(r.amount || 0);
    console.log("Receipt:", r.number || d.id, "Amount:", r.amount);
  });

  const retSnap = await getDocs(query(collection(db, 'companies/idham-main/salesReturns'), where('customerId', '==', custId)));
  let totalReturns = 0;
  retSnap.forEach(d => {
    const ret = d.data();
    if (ret.status !== 'cancelled') {
      totalReturns += parseFloat(ret.totalWithVat || 0);
      console.log("Return:", ret.number || d.id, "Amount:", ret.totalWithVat);
    }
  });

  const realBalance = totalInvoices - totalReceipts - totalReturns;
  console.log(`\nRecomputed Real Balance: ${totalInvoices} - ${totalReceipts} - ${totalReturns} = ${realBalance.toFixed(2)} SAR`);
  await updateDoc(custRef, { balance: Math.round(realBalance * 100) / 100 });
  console.log("Customer balance synchronized in Firestore.");
}

checkCustomer().catch(console.error);
