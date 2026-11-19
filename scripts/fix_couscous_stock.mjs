import { initializeApp } from "firebase/app";
import { getFirestore, doc, runTransaction, serverTimestamp } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  projectId: "idham-b3a7e"
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";
const WAREHOUSE_ID = "W5uANJjMgfFh2p3xU4bT";
const PRODUCT_ID = "q2tZaPlKzV3e494rozAp";

async function run() {
  const stockRef = doc(db, "companies", COMPANY_ID, "stockByWarehouse", `${WAREHOUSE_ID}_${PRODUCT_ID}`);
  const prodRef = doc(db, "companies", COMPANY_ID, "products", PRODUCT_ID);
  const txDocId = `tx_adj_couscous_20261010_${Date.now()}`;
  const txRef = doc(db, "companies", COMPANY_ID, "stockTransactions", txDocId);

  await runTransaction(db, async (tx) => {
    const sSnap = await tx.get(stockRef);
    const pSnap = await tx.get(prodRef);

    if (!sSnap.exists()) throw new Error("Stock document not found");
    const currentStock = sSnap.data().qty || 0;
    const currentProdQty = pSnap.data().totalQty || 0;
    console.log("Current stockByWarehouse qty:", currentStock, "Current prod totalQty:", currentProdQty);

    const targetQty = 0;
    const delta = targetQty - currentStock; // -2

    tx.update(stockRef, {
      qty: targetQty,
      updatedAt: serverTimestamp()
    });

    tx.update(prodRef, {
      totalQty: Math.max(0, currentProdQty + delta),
      updatedAt: serverTimestamp()
    });

    tx.set(txRef, {
      txDocId: txDocId,
      documentNumber: "ADJ-20261010-04019",
      refId: "INV-042042",
      invoiceNumber: "INV-042042",
      type: "adjustment_out",
      notes: "تسوية مخزنية: تصحيح رصيد الكسكسي الفعلي إلى (0) بعد إلغاء السطر المكرر في فاتورة INV-042042",
      qtyChange: delta,
      qtyBefore: currentStock,
      qtyAfter: targetQty,
      productId: PRODUCT_ID,
      productName: "كسكسى  1 كيس * 5 كيلو",
      warehouseId: WAREHOUSE_ID,
      date: "2026-10-10",
      createdByName: "علي فياض — مدير النظام",
      createdAt: serverTimestamp()
    });
  });

  console.log("SUCCESS: Couscous stock successfully adjusted to 0 with audit trail in stockTransactions!");
}

run().catch(console.error);
