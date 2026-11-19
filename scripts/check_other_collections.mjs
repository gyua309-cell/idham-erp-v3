import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkAllCollections() {
  const targetIds = [
    'LL5a49ARgDEA4QbPvXRp', // كيس نايلون (24)
    'gS5LZNGjTrBOuwhoB7uA', // كيس نايلون (8)
    '4F1zPkjk7V5XR4Cf7eep', // معطر العندليب
    'ydKSXXu03a9KkMjZt71q'  // معطر كوتاج
  ];

  console.log("Checking sales returns...");
  const srSnap = await getDocs(collection(db, 'companies/idham-main/salesReturns'));
  srSnap.docs.forEach(d => {
    (d.data().items || d.data().lines || []).forEach(it => {
      if (targetIds.includes(it.productId)) {
        console.log(`SR: ${d.id}`, it);
      }
    });
  });

  console.log("Checking purchase returns...");
  const prSnap = await getDocs(collection(db, 'companies/idham-main/purchaseReturns'));
  prSnap.docs.forEach(d => {
    (d.data().items || d.data().lines || []).forEach(it => {
      if (targetIds.includes(it.productId)) {
        console.log(`PR: ${d.id}`, it);
      }
    });
  });

  console.log("Checking inventory adjustments...");
  const adjSnap = await getDocs(collection(db, 'companies/idham-main/inventoryAdjustments'));
  adjSnap.docs.forEach(d => {
    (d.data().items || d.data().lines || []).forEach(it => {
      if (targetIds.includes(it.productId)) {
        console.log(`Adj: ${d.id}`, it);
      }
    });
  });

  console.log("Checking stock transfers...");
  const trSnap = await getDocs(collection(db, 'companies/idham-main/stockTransfers'));
  trSnap.docs.forEach(d => {
    (d.data().items || d.data().lines || []).forEach(it => {
      if (targetIds.includes(it.productId)) {
        console.log(`Transfer: ${d.id}`, it);
      }
    });
  });

  console.log("Done checking all collections.");
}

checkAllCollections().catch(console.error);
