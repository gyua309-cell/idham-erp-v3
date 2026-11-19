import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function fullAudit() {
  const [invSnap, retSnap, jeSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/journalEntries')),
    getDocs(collection(db, 'companies/idham-main/chartOfAccounts'))
  ]);

  const jes = [];
  jeSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    jes.push(data);
  });

  const coa = {};
  coaSnap.forEach(d => {
    coa[d.data().code] = { id: d.id, ...d.data() };
  });

  console.log('=== FULL INVOICE AUDIT ===');
  let missingInv = [];
  invSnap.forEach(d => {
    const inv = d.data();
    inv.id = d.id;
    if (inv.status === 'cancelled') return;
    const invNum = inv.invoiceNumber || inv.number || d.id;
    const match = jes.find(j => 
      j.referenceId === d.id || 
      j.invoiceId === d.id || 
      j.docNumber === invNum || 
      j.referenceNumber === invNum ||
      (j.description && (j.description.includes(invNum) || j.description.includes(d.id)))
    );
    if (!match) {
      missingInv.push(inv);
    }
  });
  console.log('Total Missing Invoices JEs:', missingInv.length);
  missingInv.forEach(i => console.log(`  Inv: ${i.invoiceNumber || i.id}, Date: ${i.date || i.invoiceDate}, Sub: ${i.subtotal}, Cust: ${i.customerName}`));

  console.log('\n=== FULL SALES RETURNS AUDIT ===');
  let missingRet = [];
  retSnap.forEach(d => {
    const ret = d.data();
    ret.id = d.id;
    if (ret.status === 'cancelled') return;
    const retNum = ret.returnNumber || ret.creditNoteNumber || ret.number || d.id;
    const match = jes.find(j => 
      j.referenceId === d.id || 
      j.returnId === d.id || 
      j.docNumber === retNum || 
      j.referenceNumber === retNum ||
      (j.description && (j.description.includes(retNum) || j.description.includes(d.id)))
    );
    if (!match) {
      missingRet.push(ret);
    }
  });
  console.log('Total Missing Returns JEs:', missingRet.length);
  missingRet.forEach(r => console.log(`  Ret: ${r.returnNumber || r.creditNoteNumber || r.id}, Date: ${r.date || r.returnDate}, Sub: ${r.subtotal}, Cust: ${r.customerName}`));

  process.exit(0);
}
fullAudit();
