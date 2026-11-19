import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  collection, 
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  projectId: "idham-b3a7e"
});
const db = getFirestore(app);

const COMPANY_ID = "idham-main";
const WAREHOUSE_ID = "Zyltw7uwvd0aKejdeqQq";
const WAREHOUSE_NAME = "مخزن سيارة 1 مصطفى";
const TODAY = "2026-10-10";

const ITEMS_TO_ADJUST = [
  {
    productId: "bJ7SHrAJrGUmxRXK5uIt",
    sku: "12006",
    productName: "كارى مهران مشكل 36*400 جرام",
    qtyToDeduct: 0.5,
    cost: 398,
    totalCost: 199.00
  },
  {
    productId: "c87KVwQ4KpLT51MM3l1u",
    sku: "12007",
    productName: "كارى مهران مشكل 18 ح * 1000 جم",
    qtyToDeduct: 0.5,
    cost: 458,
    totalCost: 229.00
  },
  {
    productId: "tAq8ENjtZ0cRpzhW6xFH",
    sku: "12001",
    productName: "شطة رنا قوارير صغير  36*88 مل",
    qtyToDeduct: 3.0,
    cost: 29.5001,
    totalCost: 88.50
  },
  {
    productId: "SQnrnOyRXWzq76NO3yXB",
    sku: "03003",
    productName: "ارز الديوان بسمتى مزة ذهبى 40 كيلو",
    qtyToDeduct: 2.0,
    cost: 204.809,
    totalCost: 409.62
  }
];

const TOTAL_ADJUSTMENT_COST = ITEMS_TO_ADJUST.reduce((acc, item) => acc + item.totalCost, 0);

async function executeSettlement() {
  console.log("=== STARTING SETTLEMENT FOR MOSTAFA VAN WAREHOUSE ===");
  console.log(`Warehouse: ${WAREHOUSE_NAME} (${WAREHOUSE_ID})`);
  console.log(`Date: ${TODAY}`);
  console.log(`Items count: ${ITEMS_TO_ADJUST.length}`);
  console.log(`Total Cost: ${TOTAL_ADJUSTMENT_COST.toFixed(2)} SAR\n`);

  const adjRef = doc(collection(db, `companies/${COMPANY_ID}/inventoryAdjustments`));
  const adjId = adjRef.id;

  await runTransaction(db, async (tx) => {
    // 1. READ ALL CURRENT DATA FIRST (Firestore transaction requirement)
    const reads = [];
    for (const item of ITEMS_TO_ADJUST) {
      const sbwRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${WAREHOUSE_ID}_${item.productId}`);
      const prodRef = doc(db, `companies/${COMPANY_ID}/products`, item.productId);
      reads.push({
        item,
        sbwRef,
        prodRef,
        sbwSnap: await tx.get(sbwRef),
        prodSnap: await tx.get(prodRef)
      });
    }

    // 2. VERIFY AND COMPUTE NEW BALANCES
    const updates = [];
    for (const r of reads) {
      if (!r.sbwSnap.exists()) {
        throw new Error(`stockByWarehouse entry not found for product ${r.item.productId}`);
      }
      if (!r.prodSnap.exists()) {
        throw new Error(`product entry not found for product ${r.item.productId}`);
      }

      const currentWhQty = r.sbwSnap.data().qty || 0;
      const currentMasterQty = r.prodSnap.data().totalQty || 0;

      const newWhQty = Math.round((currentWhQty - r.item.qtyToDeduct) * 1000) / 1000;
      const newMasterQty = Math.round((currentMasterQty - r.item.qtyToDeduct) * 1000) / 1000;

      console.log(`Product [${r.item.sku}] ${r.item.productName}:`);
      console.log(`  Van Stock:    ${currentWhQty} -> ${newWhQty} (Deduct: ${r.item.qtyToDeduct})`);
      console.log(`  Master Stock: ${currentMasterQty} -> ${newMasterQty} (Deduct: ${r.item.qtyToDeduct})`);

      updates.push({
        ...r,
        currentWhQty,
        newWhQty,
        currentMasterQty,
        newMasterQty
      });
    }

    // 3. WRITE INVENTORY ADJUSTMENT RECORD
    tx.set(adjRef, {
      type: "deduct",
      date: TODAY,
      warehouseId: WAREHOUSE_ID,
      warehouseName: WAREHOUSE_NAME,
      notes: "تسوية جردية لمخزن سيارة المندوب مصطفى لمبيعات سابقة لم تخصم من رصيد السيارة (التكلفة مثبتة محاسبياً مسبقاً بفواتير المبيعات)",
      lines: ITEMS_TO_ADJUST.map(it => ({
        productId: it.productId,
        sku: it.sku,
        productName: it.productName,
        qty: it.qtyToDeduct,
        cost: it.cost,
        totalCost: it.totalCost
      })),
      totalCost: TOTAL_ADJUSTMENT_COST,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 4. WRITE UPDATES FOR EACH ITEM
    for (const u of updates) {
      // Update stockByWarehouse
      const stockStatus = u.newWhQty <= 0 ? "out" : (u.newWhQty <= (u.sbwSnap.data().reorderLevel || 0) ? "low" : "ok");
      tx.update(u.sbwRef, {
        qty: u.newWhQty,
        stockStatus,
        updatedAt: serverTimestamp()
      });

      // Update product totalQty
      tx.update(u.prodRef, {
        totalQty: u.newMasterQty,
        updatedAt: serverTimestamp()
      });

      // Create stockTransactions audit entry
      const stRef = doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
      tx.set(stRef, {
        warehouseId: WAREHOUSE_ID,
        warehouseName: WAREHOUSE_NAME,
        productId: u.item.productId,
        productName: u.item.productName,
        qtyBefore: u.currentWhQty,
        qtyChange: -u.item.qtyToDeduct,
        qtyAfter: u.newWhQty,
        type: "adjustment_out",
        sourceType: "inventoryAdjustment",
        sourceId: adjId,
        documentNumber: `ADJ-${adjId.slice(0, 8).toUpperCase()}`,
        date: TODAY,
        notes: `تسوية مبيعات سابقة لمندوب التوزيع مصطفى — مستند تسوية ${adjId}`,
        createdAt: serverTimestamp()
      });
    }
  });

  console.log(`\n✅ SETTLEMENT EXECUTED SUCCESSFULLY! Adjustment Doc ID: ${adjId}`);
}

executeSettlement()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ SETTLEMENT FAILED:", err);
    process.exit(1);
  });
