import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
};

const app = initializeApp(firebaseConfig, 'remove-comm-13-10');
const db = getFirestore(app);
const companyId = 'idham-main';

async function main() {
  console.log('=== Step 1: Inspect Invoice INV-042056 (H03Hyh1P5c3AuWQnrZea) ===');
  const invRef = doc(db, `companies/${companyId}/salesInvoices`, 'H03Hyh1P5c3AuWQnrZea');
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    throw new Error('Invoice INV-042056 not found!');
  }
  const invData = invSnap.data();
  console.log('Current invoice data:', {
    number: invData.number || invData.invoiceNumber,
    date: invData.date,
    subtotal: invData.subtotal,
    totalWithVat: invData.totalWithVat,
    hasBrokerCommission: invData.hasBrokerCommission,
    brokerName: invData.brokerName,
    brokerRate: invData.brokerRate,
    brokerCommissionTotal: invData.brokerCommissionTotal,
    brokerJournalEntryId: invData.brokerJournalEntryId
  });

  console.log('\n=== Step 2: Inspect & Delete Journal Entry JE-002509 (3VtDkf2GoaONcdP1URxp) ===');
  const jeRef = doc(db, `companies/${companyId}/journalEntries`, '3VtDkf2GoaONcdP1URxp');
  const jeSnap = await getDoc(jeRef);
  if (jeSnap.exists()) {
    console.log('Found JE:', jeSnap.data().entryNumber, jeSnap.data().description, jeSnap.data().totalDebit);
    await deleteDoc(jeRef);
    console.log('✅ Deleted JE-002509 (3VtDkf2GoaONcdP1URxp)');
  } else {
    console.log('JE-002509 does not exist (already deleted)');
  }

  console.log('\n=== Step 3: Clear broker commission fields from Invoice INV-042056 ===');
  // Preserve ALL invoice details, items, customer, tax, totals untouched.
  await updateDoc(invRef, {
    hasBrokerCommission: false,
    brokerName: null,
    brokerRate: 0,
    brokerCommissionTotal: 0,
    brokerCommissionEarned: 0,
    brokerCommissionStatus: null,
    brokerTrigger: null,
    brokerJournalEntryId: null,
    updatedAt: serverTimestamp()
  });
  console.log('✅ Updated invoice INV-042056: broker commission removed cleanly.');

  console.log('\n=== Step 4: Adjust Chart of Accounts (COA) balances ===');
  // Account 2-1-4-2 (مستحقات عمولات الوسطاء - زياد)
  const acc2142Ref = doc(db, `companies/${companyId}/chartOfAccounts`, '2qV2h07vAKKrTpBgfjyy');
  const acc2142Snap = await getDoc(acc2142Ref);
  if (acc2142Snap.exists()) {
    const curBal = Number(acc2142Snap.data().balance || 0);
    const newBal = Math.round((curBal - 18.47) * 100) / 100;
    console.log(`Account 2-1-4-2 balance: ${curBal} -> ${newBal}`);
    await updateDoc(acc2142Ref, { balance: newBal, updatedAt: serverTimestamp() });
  }

  // Account 5-4-10 (مصروفات عمولات وسيط)
  const acc5410Ref = doc(db, `companies/${companyId}/chartOfAccounts`, 'X2gaVjG6UoiiQUWEe95z');
  const acc5410Snap = await getDoc(acc5410Ref);
  if (acc5410Snap.exists()) {
    const curBal = Number(acc5410Snap.data().balance || 0);
    const newBal = Math.round((curBal - 18.47) * 100) / 100;
    console.log(`Account 5-4-10 balance: ${curBal} -> ${newBal}`);
    await updateDoc(acc5410Ref, { balance: newBal, updatedAt: serverTimestamp() });
  }

  // Parent Account 2-1-4 (المصروفات المستحقة الدفع)
  const acc214Ref = doc(db, `companies/${companyId}/chartOfAccounts`, '8mDYdR38sFfvjqo18HVd');
  const acc214Snap = await getDoc(acc214Ref);
  if (acc214Snap.exists()) {
    const curBal = Number(acc214Snap.data().balance || 0);
    const newBal = Math.round((curBal - 18.47) * 100) / 100;
    console.log(`Account 2-1-4 balance: ${curBal} -> ${newBal}`);
    await updateDoc(acc214Ref, { balance: newBal, updatedAt: serverTimestamp() });
  }

  // Parent Account 5-4 (المصروفات الإدارية والعمومية)
  const acc54Ref = doc(db, `companies/${companyId}/chartOfAccounts`, '604jXVaMOsPljvN8gN8y');
  const acc54Snap = await getDoc(acc54Ref);
  if (acc54Snap.exists()) {
    const curBal = Number(acc54Snap.data().balance || 0);
    const newBal = Math.round((curBal - 18.47) * 100) / 100;
    console.log(`Account 5-4 balance: ${curBal} -> ${newBal}`);
    await updateDoc(acc54Ref, { balance: newBal, updatedAt: serverTimestamp() });
  }

  console.log('\n=== Step 5: Verification Check on Firestore ===');
  const checkInvSnap = await getDoc(invRef);
  const cd = checkInvSnap.data();
  console.log('Verified invoice INV-042056:', {
    number: cd.number || cd.invoiceNumber,
    date: cd.date,
    subtotal: cd.subtotal,
    totalWithVat: cd.totalWithVat,
    hasBrokerCommission: cd.hasBrokerCommission,
    brokerCommissionTotal: cd.brokerCommissionTotal
  });

  const check2142 = (await getDoc(acc2142Ref)).data();
  console.log('Verified 2-1-4-2 balance:', check2142.balance);

  const check5410 = (await getDoc(acc5410Ref)).data();
  console.log('Verified 5-4-10 balance:', check5410.balance);

  console.log('\n✅ All operations completed successfully!');
}

main().catch(console.error);
