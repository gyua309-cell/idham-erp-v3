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
  
  const piSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/purchaseInvoices`));
  const trSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/stockTransfers`));
  const invSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`));
  const adjSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/inventoryAdjustments`));

  const allEvents = [];

  // Purchases
  piSnap.forEach(d => {
    const inv = d.data();
    if (inv.status === "cancelled") return;
    const lines = inv.lines || inv.items || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      allEvents.push({
        date: inv.date,
        type: "purchase",
        typeName: "فاتورة شراء",
        docNum: inv.number || inv.invoiceNumber || d.id,
        party: inv.supplierName,
        whId: inv.warehouseId || "W5uANJjMgfFh2p3xU4bT",
        inQty: parseFloat(l.qty || 0),
        outQty: 0,
        notes: inv.notes || ""
      });
    }
  });

  // Transfers
  trSnap.forEach(d => {
    const tr = d.data();
    if (tr.status === "cancelled" || tr.status === "void") return;
    const lines = tr.items || tr.lines || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      const qty = parseFloat(l.qty || 0);
      // Transfer Out from fromWh
      allEvents.push({
        date: tr.date,
        type: "transfer_out",
        typeName: "تحويل مخزني (صادر)",
        docNum: tr.number || tr.transferNumber || d.id,
        party: `إلى: ${tr.toWarehouseName || tr.toWarehouseId}`,
        whId: tr.fromWarehouseId,
        inQty: 0,
        outQty: qty,
        notes: `تحويل إلى ${tr.toWarehouseName || tr.toWarehouseId}`
      });
      // Transfer In to toWh
      allEvents.push({
        date: tr.date,
        type: "transfer_in",
        typeName: "تحويل مخزني (وارد)",
        docNum: tr.number || tr.transferNumber || d.id,
        party: `من: ${tr.fromWarehouseName || tr.fromWarehouseId}`,
        whId: tr.toWarehouseId,
        inQty: qty,
        outQty: 0,
        notes: `تحويل من ${tr.fromWarehouseName || tr.fromWarehouseId}`
      });
    }
  });

  // Sales
  invSnap.forEach(d => {
    const inv = d.data();
    if (inv.status === "cancelled") return;
    const lines = inv.lines || inv.items || [];
    const l = lines.find(x => x.productId === PROD_ID || (x.productName && x.productName.includes("عريض كبير")));
    if (l) {
      const qty = parseFloat(l.qty || 0);
      allEvents.push({
        date: inv.date,
        type: "sale",
        typeName: "فاتورة مبيعات",
        docNum: inv.number || inv.invoiceNumber || d.id,
        party: inv.customerName,
        whId: inv.warehouseId || "Zyltw7uwvd0aKejdeqQq",
        inQty: 0,
        outQty: qty,
        notes: `مندوب: ${inv.repName || ""}`
      });
    }
  });

  // Inventory Adjustment
  adjSnap.forEach(d => {
    const adj = d.data();
    const lines = adj.lines || adj.items || [];
    const l = lines.find(x => x.productId === PROD_ID);
    if (l) {
      // Check difference
      const book1 = parseFloat(l.bookQty1 || 0);
      const act1 = parseFloat(l.actualQty1 || 0);
      const diff1 = act1 - book1;
      if (diff1 !== 0) {
        allEvents.push({
          date: adj.date,
          type: "adj",
          typeName: "تسوية مخزنية (جرد)",
          docNum: adj.number || d.id,
          party: "جرد المستودع الرئيسي",
          whId: "W5uANJjMgfFh2p3xU4bT",
          inQty: diff1 > 0 ? diff1 : 0,
          outQty: diff1 < 0 ? Math.abs(diff1) : 0,
          notes: `تسوية جرد: دفتري ${book1} -> فعلي ${act1}`
        });
      }
      const book2 = parseFloat(l.bookQty2 || 0);
      const act2 = parseFloat(l.actualQty2 || 0);
      const diff2 = act2 - book2;
      if (diff2 !== 0) {
        allEvents.push({
          date: adj.date,
          type: "adj",
          typeName: "تسوية مخزنية (جرد)",
          docNum: adj.number || d.id,
          party: "جرد سيارة مصطفى",
          whId: "Zyltw7uwvd0aKejdeqQq",
          inQty: diff2 > 0 ? diff2 : 0,
          outQty: diff2 < 0 ? Math.abs(diff2) : 0,
          notes: `تسوية جرد سيارة: دفتري ${book2} -> فعلي ${act2}`
        });
      }
    }
  });

  allEvents.sort((a,b) => (a.date || "").localeCompare(b.date || ""));

  console.log("==========================================================================");
  console.log("ALL MOVEMENTS CHRONOLOGICAL (WHOLE COMPANY):");
  console.log("==========================================================================");
  let compBal = 0;
  allEvents.forEach((ev, idx) => {
    const net = ev.inQty - ev.outQty;
    compBal += (ev.type === "transfer_out" || ev.type === "transfer_in") ? 0 : net; // internal transfers don't change company total
    console.log(`${idx+1}. [${ev.date}] ${ev.typeName.padEnd(20)} | Doc: ${ev.docNum.padEnd(12)} | WH: ${ev.whId === "W5uANJjMgfFh2p3xU4bT" ? "الرئيسي" : "سيارة مصطفى"} | In: ${ev.inQty} | Out: ${ev.outQty} | Party: ${ev.party}`);
  });

  console.log("\n==========================================================================");
  console.log("MOVEMENTS SPECIFIC TO MAIN WAREHOUSE (المستودع الرئيسي):");
  console.log("==========================================================================");
  const mainEvents = allEvents.filter(e => e.whId === "W5uANJjMgfFh2p3xU4bT" || e.whId === "المستودع الرئيسى");
  let mainBal = 0;
  mainEvents.forEach((ev, idx) => {
    mainBal += (ev.inQty - ev.outQty);
    console.log(`${idx+1}. [${ev.date}] ${ev.typeName.padEnd(22)} | Doc: ${ev.docNum.padEnd(12)} | In: +${ev.inQty} | Out: -${ev.outQty} | Bal: ${mainBal} | Party: ${ev.party}`);
  });
  console.log(`FINAL MAIN WAREHOUSE BALANCE: ${mainBal}`);

  console.log("\n==========================================================================");
  console.log("MOVEMENTS SPECIFIC TO MUSTAFA CAR (سيارة مصطفى):");
  console.log("==========================================================================");
  const mustafaEvents = allEvents.filter(e => e.whId === "Zyltw7uwvd0aKejdeqQq" || e.whId === "مخزن سيارة 1 مصطفى");
  let musBal = 0;
  mustafaEvents.forEach((ev, idx) => {
    musBal += (ev.inQty - ev.outQty);
    console.log(`${idx+1}. [${ev.date}] ${ev.typeName.padEnd(22)} | Doc: ${ev.docNum.padEnd(12)} | In: +${ev.inQty} | Out: -${ev.outQty} | Bal: ${musBal} | Party: ${ev.party}`);
  });
  console.log(`FINAL MUSTAFA CAR BALANCE: ${musBal}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
