import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function reconcileAllStock() {
  console.log("=== Starting Comprehensive Stock Reconciler ===");

  // 1. Fetch all stock transactions
  const stSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  console.log(`Total stock transactions in DB: ${stSnap.size}`);

  // Find duplicates by invoice / sourceId
  const txByInvoiceProduct = {}; // key: invId_whId_prodId => array of tx docs
  stSnap.forEach(d => {
    const st = d.data();
    st.id = d.id;
    if (st.sourceType === 'salesInvoice' || (st.type && st.type.startsWith('sale_'))) {
      const srcId = st.sourceId || st.refId || st.documentNumber || st.invoiceNumber;
      if (srcId && st.warehouseId && st.productId) {
        const key = `${srcId}_${st.warehouseId}_${st.productId}`;
        if (!txByInvoiceProduct[key]) txByInvoiceProduct[key] = [];
        txByInvoiceProduct[key].push(st);
      }
    }
  });

  // Check for duplicate sale_out on same invoice
  let duplicateCount = 0;
  for (const [key, txList] of Object.entries(txByInvoiceProduct)) {
    const saleOuts = txList.filter(t => t.type === 'sale_out');
    if (saleOuts.length > 1) {
      console.log(`Duplicate sale_out detected for ${key}: count = ${saleOuts.length}`);
      // Keep only one, delete others and adjust stock
      for (let i = 1; i < saleOuts.length; i++) {
        const dup = saleOuts[i];
        console.log(`Deleting duplicate tx ${dup.id} (qtyChange: ${dup.qtyChange})`);
        await deleteDoc(doc(db, 'companies/idham-main/stockTransactions', dup.id));
        // Reverse its effect from stockByWarehouse
        const sRef = doc(db, 'companies/idham-main/stockByWarehouse', `${dup.warehouseId}_${dup.productId}`);
        const sSnap = await getDoc(sRef);
        if (sSnap.exists()) {
          const currQty = sSnap.data().qty || 0;
          const restoredQty = currQty - (dup.qtyChange || 0); // dup.qtyChange is negative, so subtracting it adds it back
          console.log(`Restoring stock for ${dup.productId} in ${dup.warehouseId}: ${currQty} -> ${restoredQty}`);
          await updateDoc(sRef, { qty: restoredQty, updatedAt: serverTimestamp() });
        }
        duplicateCount++;
      }
    }
  }

  console.log(`Cleaned up ${duplicateCount} duplicate stock transactions.`);

  // Specifically check mozzarella product ycEwyn2aAf4FfCqI3qkP
  const mozRef = doc(db, 'companies/idham-main/stockByWarehouse', 'W5uANJjMgfFh2p3xU4bT_ycEwyn2aAf4FfCqI3qkP');
  const mozSnap = await getDoc(mozRef);
  console.log("Mozzarella stock in W5uANJjMgfFh2p3xU4bT after cleanup:", mozSnap.data()?.qty);

  // Update totalQty in product doc
  const prodSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  for (const pDoc of prodSnap.docs) {
    const pId = pDoc.id;
    const sSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
    let totalStock = 0;
    sSnap.forEach(sd => {
      if (sd.data().productId === pId) {
        totalStock += (sd.data().qty || 0);
      }
    });
    if (pDoc.data().totalQty !== totalStock) {
      await updateDoc(pDoc.ref, { totalQty: totalStock, updatedAt: serverTimestamp() });
    }
  }

  console.log("✅ All stock documents and product total quantities reconciled!");
}

reconcileAllStock().catch(console.error);
