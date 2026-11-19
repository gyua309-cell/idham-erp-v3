import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
  storageBucket: "idham-b3a7e.firebasestorage.app"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function run() {
  console.log("=== 1. Find Product 02009 ===");
  const pSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/products`));
  let prod = null;
  pSnap.forEach(d => {
    const data = d.data();
    if (data.sku === "02009" || (data.name||"").includes("شيف")) {
      prod = { id: d.id, ...data };
      console.log("Product:", { id: d.id, name: data.name, sku: data.sku, totalQty: data.totalQty });
    }
  });

  if (!prod) {
    console.log("Product 02009 not found!");
    return;
  }

  console.log("\n=== 2. Check stockByWarehouse for 02009 ===");
  const sbwSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockByWarehouse`));
  sbwSnap.forEach(d => {
    const data = d.data();
    if (data.productId === prod.id) {
      console.log("SBW:", d.id, "-> WH:", data.warehouseId, "qty:", data.qty);
    }
  });

  console.log("\n=== 3. Check purchaseInvoices for 02009 ===");
  const piSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/purchaseInvoices`));
  piSnap.forEach(d => {
    const inv = d.data();
    const line = (inv.lines || inv.items || []).find(l => l.productId === prod.id || (l.sku === "02009") || (l.productName||"").includes("شيف"));
    if (line) {
      console.log("Purchase Invoice:", { id: d.id, number: inv.number, date: inv.date, supplier: inv.supplierName, qty: line.qty, bonus: line.bonusQty, status: inv.status, wh: inv.warehouseId });
    }
  });

  console.log("\n=== 4. Check stockTransfers for 02009 ===");
  const trSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockTransfers`));
  trSnap.forEach(d => {
    const tr = d.data();
    const line = (tr.items || tr.lines || []).find(l => l.productId === prod.id || (l.sku === "02009") || (l.productName||"").includes("شيف"));
    if (line) {
      console.log("Transfer:", { id: d.id, number: tr.number || tr.transferNumber, date: tr.date, from: tr.fromWarehouseId, to: tr.toWarehouseId, qty: line.qty, status: tr.status });
    }
  });

  console.log("\n=== 5. Check all stockTransactions for 02009 ===");
  const txSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/stockTransactions`), where("productId", "==", prod.id)));
  console.log(`Total transactions in stockTransactions: ${txSnap.docs.length}`);
  const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  txs.sort((a,b) => {
    const timeA = a.createdAt?.seconds || (a.date ? new Date(a.date).getTime() / 1000 : 0);
    const timeB = b.createdAt?.seconds || (b.date ? new Date(b.date).getTime() / 1000 : 0);
    return timeA - timeB;
  });
  txs.forEach((t, i) => {
    console.log(`${i+1}. [${t.date}] Type: ${t.type} | Doc: ${t.documentNumber || t.notes || t.id} | WH: ${t.warehouseId} | Change: ${t.qtyChange} | Notes: ${t.notes || ""}`);
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
