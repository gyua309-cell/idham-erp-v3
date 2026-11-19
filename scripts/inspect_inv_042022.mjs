import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function check() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const invoices = [];
  invSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    if ((data.number || "").includes("042022") || d.id.includes("042022")) {
      invoices.push(data);
    }
  });

  console.log(`Found ${invoices.length} matching invoices:`);
  for (const inv of invoices) {
    console.log("=== Invoice ===");
    console.log("ID:", inv.id);
    console.log("Number:", inv.number);
    console.log("Date:", inv.date);
    console.log("WarehouseId:", inv.warehouseId, inv.warehouseName);
    console.log("CostCenterId:", inv.costCenterId, inv.costCenterName);
    console.log("Customer:", inv.customerId, inv.customerName);
    console.log("Status:", inv.status);
    console.log("StockStatus:", inv.stockStatus);
    console.log("StockError:", inv.stockError);
    console.log("JournalEntryId:", inv.journalEntryId);
    console.log("JournalEntryError:", inv.journalEntryError);
    console.log("Total:", inv.totalWithVat);
    console.log("Lines count:", (inv.lines || []).length);
    console.log("Lines:", JSON.stringify(inv.lines, null, 2));

    // Check stock transactions
    console.log("\n--- Stock Transactions for this invoice ---");
    const stSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
    const relatedSt = [];
    stSnap.forEach(d => {
      const st = d.data();
      if (st.sourceId === inv.id || st.refId === inv.number || st.documentNumber === inv.number || st.invoiceNumber === inv.number || (st.notes || '').includes(inv.number)) {
        relatedSt.push({ id: d.id, ...st });
      }
    });
    console.log(`Found ${relatedSt.length} stock transactions:`);
    relatedSt.forEach(st => console.log(st.id, "=>", st.type, st.productId, "qtyChange:", st.qtyChange, "wh:", st.warehouseId, "notes:", st.notes));

    // Check stockByWarehouse for these products
    console.log("\n--- Stock in Warehouse for these products ---");
    for (const line of (inv.lines || [])) {
      if (!line.productId) continue;
      const sRef = doc(db, `companies/idham-main/stockByWarehouse`, `${inv.warehouseId}_${line.productId}`);
      const sSnap = await getDoc(sRef);
      console.log(`Product: ${line.productName} (${line.productId}) => Stock in WH (${inv.warehouseId}):`, sSnap.exists() ? sSnap.data().qty : 'NOT FOUND');
    }

    // Check JEs
    console.log("\n--- Journal Entries for this invoice ---");
    const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
    const relatedJe = [];
    jeSnap.forEach(d => {
      const je = d.data();
      if (je.sourceId === inv.id || je.sourceId === inv.number || d.id === inv.journalEntryId || (je.description || '').includes(inv.number)) {
        relatedJe.push({ id: d.id, ...je });
      }
    });
    console.log(`Found ${relatedJe.length} journal entries:`);
    relatedJe.forEach(je => {
      console.log("JE ID:", je.id, "Num:", je.entryNumber, "sourceType:", je.sourceType, "sourceId:", je.sourceId, "debit:", je.totalDebit, "credit:", je.totalCredit, "status:", je.status);
      console.log("Lines:", JSON.stringify(je.lines, null, 2));
    });
  }
}

check().catch(console.error);
