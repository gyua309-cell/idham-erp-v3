import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function check() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const invoices = [];
  invSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    const dt = data.date || data.invoiceDate || '';
    if (dt >= '2026-09-01' && dt <= '2026-09-30' && data.status !== 'cancelled') {
      invoices.push(data);
    }
  });

  const retSnap = await getDocs(collection(db, 'companies/idham-main/salesReturns'));
  const returns = [];
  retSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    const dt = data.date || data.returnDate || '';
    if (dt >= '2026-09-01' && dt <= '2026-09-30' && data.status !== 'cancelled') {
      returns.push(data);
    }
  });

  const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  const jes = [];
  jeSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    const dt = data.date || '';
    if (dt >= '2026-09-01' && dt <= '2026-09-30') {
      jes.push(data);
    }
  });

  console.log('--- INVOICES AUDIT ---');
  let missingJeInvoices = [];
  let mismatchedInvoices = [];
  for (const inv of invoices) {
    const invSub = parseFloat(inv.subtotal) || (parseFloat(inv.totalAmount || 0) - parseFloat(inv.vatAmount || 0)) || 0;
    const matchingJe = jes.find(j => 
      j.referenceId === inv.id || 
      j.invoiceId === inv.id || 
      j.docNumber === inv.invoiceNumber || 
      j.referenceNumber === inv.invoiceNumber ||
      (j.description && j.description.includes(inv.invoiceNumber)) ||
      (j.description && j.description.includes(inv.id))
    );
    if (!matchingJe) {
      missingJeInvoices.push({ id: inv.id, number: inv.invoiceNumber, date: inv.date || inv.invoiceDate, subtotal: invSub, customer: inv.customerName });
    } else {
      let je411 = 0;
      (matchingJe.lines || []).forEach(l => {
        if (l.accountCode === '4-1-1' || l.accountId === '4-1-1') je411 += (parseFloat(l.credit) || 0) - (parseFloat(l.debit) || 0);
      });
      if (Math.abs(je411 - invSub) > 0.05) {
        mismatchedInvoices.push({ invNumber: inv.invoiceNumber, invSub, je411, diff: invSub - je411, jeId: matchingJe.id });
      }
    }
  }
  console.log('Invoices without matching JE:', missingJeInvoices.length);
  missingJeInvoices.forEach(m => console.log('  ->', JSON.stringify(m)));
  console.log('Invoices with mismatched JE:', mismatchedInvoices.length);
  mismatchedInvoices.forEach(m => console.log('  ->', JSON.stringify(m)));

  console.log('\n--- SALES RETURNS AUDIT ---');
  let missingJeReturns = [];
  let mismatchedReturns = [];
  for (const ret of returns) {
    const retSub = parseFloat(ret.subtotal) || (parseFloat(ret.totalAmount || 0) - parseFloat(ret.vatAmount || 0)) || 0;
    const matchingJe = jes.find(j => 
      j.referenceId === ret.id || 
      j.returnId === ret.id || 
      j.docNumber === ret.returnNumber || 
      j.referenceNumber === ret.returnNumber ||
      (j.description && j.description.includes(ret.returnNumber)) ||
      (j.description && j.description.includes(ret.id))
    );
    if (!matchingJe) {
      missingJeReturns.push({ id: ret.id, number: ret.returnNumber, date: ret.date || ret.returnDate, subtotal: retSub, customer: ret.customerName });
    } else {
      let je412 = 0;
      (matchingJe.lines || []).forEach(l => {
        if (l.accountCode === '4-1-2' || l.accountId === '4-1-2') je412 += (parseFloat(l.debit) || 0) - (parseFloat(l.credit) || 0);
      });
      if (Math.abs(je412 - retSub) > 0.05) {
        mismatchedReturns.push({ retNumber: ret.returnNumber, retSub, je412, diff: retSub - je412, jeId: matchingJe.id });
      }
    }
  }
  console.log('Returns without matching JE:', missingJeReturns.length);
  missingJeReturns.forEach(m => console.log('  ->', JSON.stringify(m)));
  console.log('Returns with mismatched JE:', mismatchedReturns.length);
  mismatchedReturns.forEach(m => console.log('  ->', JSON.stringify(m)));

  process.exit(0);
}
check();
