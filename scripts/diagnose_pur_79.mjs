import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function run() {
  const doc1 = await getDoc(doc(db, 'companies/idham-main/purchaseInvoices', 'nxse8ZB6338D13tA5pXK'));
  const doc2 = await getDoc(doc(db, 'companies/idham-main/purchaseInvoices', 'WySThYETjHWoceznIZrn'));
  const doc3 = await getDoc(doc(db, 'companies/idham-main/purchaseInvoices', '5mBKJ7del4HLaSeHAjdg'));

  console.log('=== DOC 1 (nxse8ZB6338D13tA5pXK) ===');
  console.log(JSON.stringify(doc1.data(), null, 2));

  console.log('\n=== DOC 2 (WySThYETjHWoceznIZrn) ===');
  console.log(JSON.stringify(doc2.data(), null, 2));

  console.log('\n=== DOC 3 (5mBKJ7del4HLaSeHAjdg) ===');
  console.log(JSON.stringify(doc3.data(), null, 2));

  // Check stock transactions
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const allTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const relatedTxs = allTxs.filter(t => 
    t.refId === 'nxse8ZB6338D13tA5pXK' ||
    t.refId === 'WySThYETjHWoceznIZrn' ||
    t.refId === '5mBKJ7del4HLaSeHAjdg' ||
    t.invoiceId === 'nxse8ZB6338D13tA5pXK' ||
    t.invoiceId === 'WySThYETjHWoceznIZrn' ||
    t.invoiceId === '5mBKJ7del4HLaSeHAjdg' ||
    t.invoiceNumber === 'PUR-000079' ||
    t.documentNumber === 'PUR-000079'
  );

  console.log('\n=== RELATED STOCK TRANSACTIONS (Count: ' + relatedTxs.length + ') ===');
  relatedTxs.forEach(t => {
    console.log({
      id: t.id,
      type: t.type,
      productId: t.productId,
      productName: t.productName,
      qtyChange: t.qtyChange,
      qtyBefore: t.qtyBefore,
      qtyAfter: t.qtyAfter,
      refId: t.refId,
      invoiceNumber: t.invoiceNumber,
      createdAt: t.createdAt?.toDate ? t.createdAt.toDate().toISOString() : t.createdAt
    });
  });

  // Check Journal Entries
  const jesSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  const allJes = jesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const relatedJes = allJes.filter(j => 
    j.refId === 'nxse8ZB6338D13tA5pXK' ||
    j.refId === 'WySThYETjHWoceznIZrn' ||
    j.refId === '5mBKJ7del4HLaSeHAjdg' ||
    j.id === 'g7ON6qQUSBuiJ1WyHS1H' ||
    j.id === 'iDy9Hf8QDyj7PpfL5iX5' ||
    j.docNumber === 'PUR-000079' ||
    (j.description && j.description.includes('PUR-000079'))
  );
  console.log('\n=== RELATED JOURNAL ENTRIES (Count: ' + relatedJes.length + ') ===');
  relatedJes.forEach(j => {
    console.log({
      id: j.id,
      number: j.number || j.entryNumber,
      date: j.date,
      refId: j.refId,
      desc: j.description,
      totalDebit: j.totalDebit,
      linesCount: (j.lines || []).length
    });
  });

  // Check supplier balance / statement for Al-Essayi
  const suppSnap = await getDocs(collection(db, 'companies/idham-main/suppliers'));
  const supps = suppSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const alEssayi = supps.find(s => s.name && s.name.includes('العيسائ'));
  if (alEssayi) {
    console.log('\n=== AL-ESSAYI SUPPLIER INFO ===');
    console.log({
      id: alEssayi.id,
      name: alEssayi.name,
      balance: alEssayi.balance,
      currentBalance: alEssayi.currentBalance
    });
  }
}

run().catch(console.error);
