import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, collection, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

const COMPANY_ID = 'idham-main';
const GHOST_INV_ID = 'nxse8ZB6338D13tA5pXK';    // Incomplete Al-Essayi duplicate (no JE, no stock)
const REAL_INV_ID = 'WySThYETjHWoceznIZrn';     // Real Al-Essayi invoice (PUR-000079)
const GHAID_INV_ID = '5mBKJ7del4HLaSeHAjdg';    // Ghaid Al-Raqiya invoice (should be PUR-000083)

async function repair() {
  console.log('=== STARTING DATABASE REPAIR ===');

  // 1. Delete ghost duplicate invoice nxse8ZB6338D13tA5pXK
  const ghostRef = doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, GHOST_INV_ID);
  const ghostSnap = await getDoc(ghostRef);
  if (ghostSnap.exists()) {
    console.log(`[1] Deleting ghost duplicate invoice: ${GHOST_INV_ID}`);
    await deleteDoc(ghostRef);
    console.log('  -> Ghost invoice deleted successfully.');
  } else {
    console.log(`[1] Ghost invoice ${GHOST_INV_ID} does not exist (already deleted).`);
  }

  // 2. Fix Al-Essayi supplier balance
  const realSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, REAL_INV_ID));
  if (realSnap.exists()) {
    const suppId = realSnap.data().supplierId;
    const suppRef = doc(db, `companies/${COMPANY_ID}/suppliers`, suppId);
    const suppSnap = await getDoc(suppRef);
    if (suppSnap.exists()) {
      const currentBal = suppSnap.data().balance || 0;
      console.log(`[2] Al-Essayi current balance: ${currentBal}`);
      // The invoice was 99015. It was added twice so subtract 99015
      const newBal = Math.round((currentBal - 99015) * 100) / 100;
      console.log(`  -> Correcting Al-Essayi balance to: ${newBal}`);
      await updateDoc(suppRef, {
        balance: newBal,
        updatedAt: serverTimestamp()
      });
      console.log('  -> Supplier balance updated successfully.');
    }
  }

  // 3. Restore warehouse stock for the 5 items that were reversed at 16:27 UTC
  const whId = realSnap.data().warehouseId; // المستودع الرئيسي
  console.log(`[3] Restoring stock for warehouse: ${whId}`);
  
  const itemsToRestore = [
    { productId: 'wGEk0xKjCvX7pSSQGUU1', name: 'ارز الرواسى هندى مزة 40 كجم', qty: 100 },
    { productId: 'SQnrnOyRXWzq76NO3yXB', name: 'ارز الديوان بسمتى مزة ذهبى 40 كيلو', qty: 100 },
    { productId: '9NtVvzhfnxB2Z9rDN3uN', name: 'ارز اوماكو ذهبى مزه بسمتى 40 كجم خط احمر', qty: 50 },
    { productId: '9rXe9UCiqrJ4c97SXCJp', name: 'زبيب اوزباكستانى ذهبى رقم 1 10 كجم', qty: 20 },
    { productId: '94bTgCDFkYMJQaoETG3Z', name: 'سمن فارم وسط 12* 800 جرام', qty: 20 },
  ];

  for (const item of itemsToRestore) {
    const sRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${whId}_${item.productId}`);
    const sSnap = await getDoc(sRef);
    const currentStock = sSnap.exists() ? (sSnap.data().qty || 0) : 0;
    const restoredStock = currentStock + item.qty;
    console.log(`  - ${item.name}: Current stock = ${currentStock}, adding back ${item.qty} -> ${restoredStock}`);
    await updateDoc(sRef, {
      qty: restoredStock,
      updatedAt: serverTimestamp()
    });
  }

  // Also remove the 5 erroneous purchase_reverse stock transactions from 16:27 UTC
  const txSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
  const errTxs = txSnap.docs.filter(d => {
    const data = d.data();
    return data.type === 'purchase_reverse' && 
           data.invoiceNumber === 'PUR-000079' &&
           String(data.createdAt?.toDate?.() || data.createdAt).includes('2026-10-15T16:27');
  });
  console.log(`  - Found ${errTxs.length} erroneous purchase_reverse transactions to clean up.`);
  for (const tDoc of errTxs) {
    await deleteDoc(tDoc.ref);
    console.log(`    Deleted erroneous tx: ${tDoc.id}`);
  }

  // 4. Renumber Ghaid Al-Raqiya invoice to PUR-000083
  console.log(`[4] Renumbering Ghaid Al-Raqiya (${GHAID_INV_ID}) from PUR-000079 to PUR-000083`);
  const ghaidRef = doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, GHAID_INV_ID);
  await updateDoc(ghaidRef, {
    number: 'PUR-000083',
    updatedAt: serverTimestamp()
  });
  console.log('  -> Invoice number updated to PUR-000083');

  // Update its Journal Entry JE-002178
  const jeSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const ghaidJe = jeSnap.docs.find(d => d.id === 'iDy9Hf8QDyj7PpfL5iX5');
  if (ghaidJe) {
    const desc = (ghaidJe.data().description || '').replace('PUR-000079', 'PUR-000083');
    const lines = (ghaidJe.data().lines || []).map(l => ({
      ...l,
      note: (l.note || '').replace('PUR-000079', 'PUR-000083')
    }));
    await updateDoc(ghaidJe.ref, {
      description: desc,
      lines: lines,
      updatedAt: serverTimestamp()
    });
    console.log('  -> Journal entry iDy9Hf8QDyj7PpfL5iX5 updated with PUR-000083');
  }

  // Update its stock transactions to reference PUR-000083
  const ghaidTxs = txSnap.docs.filter(d => d.id.includes(GHAID_INV_ID));
  console.log(`  - Updating ${ghaidTxs.length} stock transactions for Ghaid Al-Raqiya to PUR-000083`);
  for (const tDoc of ghaidTxs) {
    await updateDoc(tDoc.ref, {
      invoiceNumber: 'PUR-000083',
      documentNumber: 'PUR-000083'
    });
  }

  // 5. Update PUR counter in Firestore to at least 83
  const counterRef = doc(db, `companies/${COMPANY_ID}/counters`, 'pur');
  const counterSnap = await getDoc(counterRef);
  const currentSeq = counterSnap.exists() ? (counterSnap.data().seq || 0) : 0;
  console.log(`[5] Current PUR counter seq: ${currentSeq}`);
  if (currentSeq < 83) {
    await updateDoc(counterRef, {
      seq: 83,
      updatedAt: serverTimestamp()
    });
    console.log('  -> PUR counter updated to 83.');
  }

  console.log('\n=== DATABASE REPAIR COMPLETED SUCCESSFULLY ===');
}

repair().catch(console.error);
