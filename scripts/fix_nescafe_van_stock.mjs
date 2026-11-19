import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
};

const app = initializeApp(firebaseConfig, 'fix-nescafe');
const db = getFirestore(app);
const companyId = 'idham-main';

async function run() {
  console.log('--- Fixing Nescafe Van Stock Discrepancy ---');

  // 1. Delete phantom reversal transaction
  const txnId = 'tx_rev_edit_REP-72944341_1792351962988_6_CmRpTW3CU8373Prfkxa0';
  const txnRef = doc(db, `companies/${companyId}/stockTransactions`, txnId);
  const txnSnap = await getDoc(txnRef);
  if (txnSnap.exists()) {
    console.log('Deleting phantom txn:', txnId, txnSnap.data());
    await deleteDoc(txnRef);
    console.log('✅ Deleted phantom reverse transaction successfully.');
  } else {
    console.log('⚠️ Phantom txn not found (may already be deleted).');
  }

  // 2. Update stockByWarehouse for Mustafa car
  const sbwId = 'Zyltw7uwvd0aKejdeqQq_CmRpTW3CU8373Prfkxa0';
  const sbwRef = doc(db, `companies/${companyId}/stockByWarehouse`, sbwId);
  const sbwSnap = await getDoc(sbwRef);
  if (sbwSnap.exists()) {
    console.log('Current SBW data:', sbwSnap.data());
    await updateDoc(sbwRef, {
      qty: 0,
      updatedAt: new Date()
    });
    console.log('✅ Updated Mustafa car stock (stockByWarehouse) to 0 successfully.');
  } else {
    console.log('⚠️ SBW record not found.');
  }

  // 3. Update invoice stock error note
  const invRef = doc(db, `companies/${companyId}/salesInvoices`, 'REP-72944341');
  const invSnap = await getDoc(invRef);
  if (invSnap.exists()) {
    await updateDoc(invRef, {
      stockError: '',
      stockStatus: 'completed'
    });
    console.log('✅ Cleaned up REP-72944341 stockStatus to completed.');
  }

  console.log('🎉 Fix completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error during run:', err);
  process.exit(1);
});
