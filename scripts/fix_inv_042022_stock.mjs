import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, writeBatch, serverTimestamp, runTransaction } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function fixInvoice042022() {
  const invRef = doc(db, 'companies/idham-main/salesInvoices', '4rmxK0LaBnL3hdKRd8sj');
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    console.log("Invoice not found!");
    return;
  }
  const inv = invSnap.data();
  console.log("Found invoice:", inv.number);

  // 1. Find all existing stock transactions for this invoice
  const stSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const oldTxDocs = [];
  stSnap.forEach(d => {
    const st = d.data();
    if (st.sourceId === '4rmxK0LaBnL3hdKRd8sj' || st.refId === inv.number || st.documentNumber === inv.number || st.invoiceNumber === inv.number || (st.notes || '').includes(inv.number)) {
      oldTxDocs.push({ id: d.id, ...st });
    }
  });

  console.log(`Found ${oldTxDocs.length} old stock transactions for this invoice.`);

  // 2. Revert whatever effect old transactions had on stockByWarehouse
  // For each old transaction: reverse its qtyChange (e.g. if qtyChange was -1, add +1 back; if +1, subtract 1)
  const stockByWhMap = {}; // key: warehouseId_productId => net adjustment
  for (const tx of oldTxDocs) {
    const key = `${tx.warehouseId}_${tx.productId}`;
    stockByWhMap[key] = (stockByWhMap[key] || 0) - (tx.qtyChange || 0); // reverse effect
  }

  // 3. Apply the TRUE desired deduction for the invoice lines
  const desiredLines = inv.lines || [];
  for (const line of desiredLines) {
    if (!line.productId || !line.qty) continue;
    const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1;
    const baseQty = (parseFloat(line.qty) || 0) * factor;
    const key = `${inv.warehouseId}_${line.productId}`;
    stockByWhMap[key] = (stockByWhMap[key] || 0) - baseQty; // deduct true line quantity
  }

  console.log("Net stock delta to apply per product in warehouse:", stockByWhMap);

  // 4. Update stockByWarehouse and remove old corrupted transactions, and write fresh clean transactions
  for (const [key, delta] of Object.entries(stockByWhMap)) {
    if (Math.abs(delta) < 0.0001) continue;
    const [whId, prodId] = key.split('_');
    const sRef = doc(db, 'companies/idham-main/stockByWarehouse', key);
    const sSnap = await getDoc(sRef);
    const currQty = sSnap.exists() ? (sSnap.data().qty || 0) : 0;
    const newQty = currQty + delta;
    console.log(`Updating stock for ${prodId} in ${whId}: ${currQty} + (${delta}) = ${newQty}`);
    await updateDoc(sRef, { qty: newQty, updatedAt: serverTimestamp() });
  }

  // 5. Clean up old stock transaction documents
  for (const tx of oldTxDocs) {
    await deleteDoc(doc(db, 'companies/idham-main/stockTransactions', tx.id));
    console.log(`Deleted old stock tx: ${tx.id}`);
  }

  // 6. Write clean, accurate stock transactions for this invoice
  for (let idx = 0; idx < desiredLines.length; idx++) {
    const line = desiredLines[idx];
    if (!line.productId || !line.qty) continue;
    const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1;
    const baseQty = (parseFloat(line.qty) || 0) * factor;

    const sRef = doc(db, 'companies/idham-main/stockByWarehouse', `${inv.warehouseId}_${line.productId}`);
    const sSnap = await getDoc(sRef);
    const currQty = sSnap.exists() ? (sSnap.data().qty || 0) : 0;

    const newTxRef = doc(db, 'companies/idham-main/stockTransactions', `tx_sale_out_4rmxK0LaBnL3hdKRd8sj_${inv.warehouseId}_${line.productId}`);
    await setDoc(newTxRef, {
      warehouseId: inv.warehouseId,
      productId: line.productId,
      productName: line.productName || '',
      qtyBefore: currQty + baseQty,
      qtyChange: -baseQty,
      qtyAfter: currQty,
      type: 'sale_out',
      sourceType: 'salesInvoice',
      sourceId: '4rmxK0LaBnL3hdKRd8sj',
      documentNumber: inv.number,
      invoiceNumber: inv.number,
      date: inv.date || '2026-10-03',
      batchNumber: line.batchNumber || '',
      expiryDate: line.expiryDate || '',
      notes: `فاتورة بيع ${inv.number}`,
      createdAt: serverTimestamp()
    });
    console.log(`Created clean stock tx for ${line.productName} (-${baseQty})`);
  }

  await updateDoc(invRef, { stockStatus: 'completed', updatedAt: serverTimestamp() });
  console.log("✅ Invoice INV-042022 stock re-synchronized successfully!");
}

fixInvoice042022().catch(console.error);
