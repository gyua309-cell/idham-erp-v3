import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, runTransaction, writeBatch, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
};

const app = initializeApp(firebaseConfig, 'accrue-broker');
const db = getFirestore(app);
const companyId = 'idham-main';

async function getNextEntryNumber() {
  const counterRef = doc(db, `companies/${companyId}/counters`, "journal");
  let entryNumber = "";
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const seq = snap.exists() ? (snap.data().seq || 0) + 1 : 1;
    tx.set(counterRef, { seq, updatedAt: serverTimestamp() }, { merge: true });
    entryNumber = `JE-${String(seq).padStart(6, "0")}`;
  });
  return entryNumber;
}

async function run() {
  console.log('=== Starting Broker Commission Accrual for Ziyad ===');

  // Invoices to accrue:
  // 1. INV-042070 (tchQVLhpqFLC25PBe45T) -> 58.71 SAR (Date: 2026-10-19)
  // 2. INV-042077 (elFTirh2h5kYvIEPoZK4) -> 149.65 SAR (Date: 2026-10-22)

  const invoices = [
    {
      docId: 'tchQVLhpqFLC25PBe45T',
      invoiceNumber: 'INV-042070',
      date: '2026-10-19',
      commAmount: 58.71,
      customerName: 'مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات'
    },
    {
      docId: 'elFTirh2h5kYvIEPoZK4',
      invoiceNumber: 'INV-042077',
      date: '2026-10-22',
      commAmount: 149.65,
      customerName: 'مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات'
    }
  ];

  let totalAccrued = 0;

  for (const inv of invoices) {
    const entryNumber = await getNextEntryNumber();
    console.log(`Creating JE ${entryNumber} for ${inv.invoiceNumber} (${inv.commAmount} SAR)...`);

    const lines = [
      {
        accountCode: '5-4-10',
        accountName: 'عمولات بيع ووساطة تجارية',
        debit: inv.commAmount,
        credit: 0,
        note: `استحقاق عمولة الوسيط زياد (1%) عن فاتورة ${inv.invoiceNumber} — ${inv.customerName}`
      },
      {
        accountCode: '2-1-4-2',
        accountName: 'مستحقات عمولات الوسطاء - زياد',
        debit: 0,
        credit: inv.commAmount,
        note: `استحقاق عمولة الوسيط زياد (1%) عن فاتورة ${inv.invoiceNumber} — ${inv.customerName}`
      }
    ];

    const jeData = {
      entryNumber,
      code: entryNumber,
      date: inv.date,
      description: `قيد استحقاق عمولة الوسيط زياد (1%) عن مبيعات فاتورة ${inv.invoiceNumber} — ${inv.customerName}`,
      sourceType: 'broker_commission',
      sourceId: inv.docId,
      status: 'posted',
      createdByName: 'علي فياض — مدير النظام',
      totalDebit: inv.commAmount,
      totalCredit: inv.commAmount,
      lines,
      createdAt: serverTimestamp()
    };

    const jeRef = await addDoc(collection(db, `companies/${companyId}/journalEntries`), jeData);
    console.log(`✅ Created JE ${entryNumber} (Doc ID: ${jeRef.id})`);

    // Update invoice document
    const invRef = doc(db, `companies/${companyId}/salesInvoices`, inv.docId);
    await updateDoc(invRef, {
      brokerTrigger: 'on_invoice',
      brokerCommissionStatus: 'earned',
      brokerCommissionEarned: inv.commAmount,
      brokerJournalEntryId: jeRef.id,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Updated invoice ${inv.invoiceNumber} status to earned`);

    totalAccrued += inv.commAmount;
  }

  totalAccrued = Math.round(totalAccrued * 100) / 100;
  console.log(`Total Commission Accrued: ${totalAccrued} SAR`);

  // Update customer default trigger
  const custRef = doc(db, `companies/${companyId}/customers`, 'wH6dTDnlCecLiDHIN25U');
  await updateDoc(custRef, {
    brokerTrigger: 'on_invoice',
    updatedAt: serverTimestamp()
  });
  console.log('✅ Updated customer wH6dTDnlCecLiDHIN25U brokerTrigger to on_invoice');

  // Update chart of accounts balances:
  // 1. Account 2-1-4-2 (Liability - Credit Normal) -> credit +totalAccrued
  // 2. Account 2-1-4 (Parent Liability - Credit Normal) -> credit +totalAccrued
  // 3. Account 5-4-10 (Expense - Debit Normal) -> debit +totalAccrued
  // 4. Account 5-4 (Parent Expense - Debit Normal) -> debit +totalAccrued

  // Let's find doc refs in chartOfAccounts
  const { getDocs, query, where } = await import('firebase/firestore');
  const coaSnap = await getDocs(collection(db, `companies/${companyId}/chartOfAccounts`));

  const batch = writeBatch(db);
  coaSnap.forEach(d => {
    const acc = d.data();
    if (acc.code === '2-1-4-2') {
      batch.update(d.ref, {
        balance: increment(totalAccrued),
        totalCredit: increment(totalAccrued),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Queued update for Account 2-1-4-2');
    }
    if (acc.code === '2-1-4') {
      batch.update(d.ref, {
        balance: increment(totalAccrued),
        totalCredit: increment(totalAccrued),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Queued update for Parent Account 2-1-4');
    }
    if (acc.code === '5-4-10') {
      batch.update(d.ref, {
        balance: increment(totalAccrued),
        totalDebit: increment(totalAccrued),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Queued update for Account 5-4-10');
    }
    if (acc.code === '5-4') {
      batch.update(d.ref, {
        balance: increment(totalAccrued),
        totalDebit: increment(totalAccrued),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Queued update for Parent Account 5-4');
    }
  });

  await batch.commit();
  console.log('🎉 COA balances successfully updated in Firestore!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error during accrual:', err);
  process.exit(1);
});
