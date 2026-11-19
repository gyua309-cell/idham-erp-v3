import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const PROD_ID = "vQkzxlzdOHu7z21s9SMV"; // كاتشب رنا عريض كبير 5 كيلو *4 جالون
  
  console.log("=== 1. All Purchases for Product ===");
  const piSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/purchaseInvoices`));
  const purchases = [];
  piSnap.forEach(d => {
    const inv = d.data();
    if (inv.status === "cancelled") return;
    const lines = inv.lines || inv.items || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      purchases.push({
        id: d.id,
        number: inv.number || inv.invoiceNumber || d.id,
        date: inv.date,
        supplier: inv.supplierName,
        warehouseId: inv.warehouseId,
        qty: parseFloat(l.qty || 0),
        bonusQty: parseFloat(l.bonusQty || 0),
        unitPrice: parseFloat(l.unitPrice || l.purchasePrice || l.costPrice || 0),
        total: parseFloat(l.totalWithVat || l.total || 0),
        notes: inv.notes || ""
      });
    }
  });
  console.log("Purchases:", purchases.sort((a,b)=>(a.date||"").localeCompare(b.date||"")));

  console.log("\n=== 2. All Stock Transfers for Product ===");
  const trSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockTransfers`));
  const transfers = [];
  trSnap.forEach(d => {
    const tr = d.data();
    if (tr.status === "cancelled" || tr.status === "void") return;
    const lines = tr.items || tr.lines || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      transfers.push({
        id: d.id,
        number: tr.number || tr.transferNumber || d.id,
        date: tr.date,
        fromWh: tr.fromWarehouseName || tr.fromWarehouseId,
        fromWhId: tr.fromWarehouseId,
        toWh: tr.toWarehouseName || tr.toWarehouseId,
        toWhId: tr.toWarehouseId,
        qty: parseFloat(l.qty || 0),
        status: tr.status,
        notes: tr.notes || ""
      });
    }
  });
  console.log("Transfers:", transfers.sort((a,b)=>(a.date||"").localeCompare(b.date||"")));

  console.log("\n=== 3. All Sales Invoices for Product ===");
  const invSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`));
  const sales = [];
  invSnap.forEach(d => {
    const inv = d.data();
    if (inv.status === "cancelled") return;
    const lines = inv.lines || inv.items || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      sales.push({
        id: d.id,
        number: inv.number || inv.invoiceNumber || d.id,
        date: inv.date,
        customer: inv.customerName,
        rep: inv.repName,
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouseName,
        qty: parseFloat(l.qty || 0),
        unitPrice: parseFloat(l.unitPrice || l.price || 0),
        total: parseFloat(l.totalWithVat || l.total || 0)
      });
    }
  });
  console.log("Sales:", sales.sort((a,b)=>(a.date||"").localeCompare(b.date||"")));

  console.log("\n=== 4. All Stock Adjustments / Waste ===");
  const adjSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/inventoryAdjustments`));
  adjSnap.forEach(d => {
    const adj = d.data();
    const lines = adj.lines || adj.items || [];
    const l = lines.find(x => x.productId === PROD_ID);
    if (l) console.log("Adj:", d.id, adj);
  });

  const wasteSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/inventoryWaste`));
  wasteSnap.forEach(d => {
    const wst = d.data();
    const lines = wst.lines || wst.items || [];
    const l = lines.find(x => x.productId === PROD_ID);
    if (l) console.log("Waste:", d.id, wst);
  });

  console.log("\n=== 5. Stock by Warehouse ===");
  const sbwSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockByWarehouse`));
  sbwSnap.forEach(d => {
    const data = d.data();
    if (data.productId === PROD_ID) {
      console.log(`WH ID: ${data.warehouseId} -> Qty: ${data.qty}`);
    }
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
