import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function fixKabousTeaStock() {
  const prodId = 'gtOkpFC26meAhlHSgLQj';
  const whId = 'W5uANJjMgfFh2p3xU4bT';
  const stockDocId = `${whId}_${prodId}`;

  console.log('--- Fixing Phantom Stock for Tea (13006) ---');

  // 1. Delete the 2 duplicate reverse transactions
  const tx1Ref = doc(db, 'companies/idham-main/stockTransactions', 'SADl5iTasdxEInqePXfM');
  const tx2Ref = doc(db, 'companies/idham-main/stockTransactions', 'tTbi2Nr645d0yAqMTRMM');

  await deleteDoc(tx1Ref);
  console.log('Deleted duplicate tx 1: SADl5iTasdxEInqePXfM');
  await deleteDoc(tx2Ref);
  console.log('Deleted duplicate tx 2: tTbi2Nr645d0yAqMTRMM');

  // 2. Update stockByWarehouse
  const stockRef = doc(db, 'companies/idham-main/stockByWarehouse', stockDocId);
  await updateDoc(stockRef, {
    qty: 0,
    stockStatus: 'out',
    updatedAt: serverTimestamp()
  });
  console.log(`Updated stockByWarehouse (${stockDocId}) to qty: 0`);

  // 3. Update products doc
  const prodRef = doc(db, 'companies/idham-main/products', prodId);
  await updateDoc(prodRef, {
    totalQty: 0,
    stockQty: 0,
    updatedAt: serverTimestamp()
  });
  console.log(`Updated products (${prodId}) to totalQty: 0`);

  // 4. Verify
  const [sSnap, pSnap] = await Promise.all([getDoc(stockRef), getDoc(prodRef)]);
  console.log('Verification:');
  console.log('Stock doc qty:', sSnap.data().qty);
  console.log('Product doc totalQty:', pSnap.data().totalQty);
  console.log('--- Done fixing Kabous Tea stock! ---');
}

fixKabousTeaStock().catch(console.error);
