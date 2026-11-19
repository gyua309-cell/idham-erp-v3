import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspect() {
  const invRef = doc(db, 'companies/idham-main/salesInvoices', '3g8vcAuQu7ugts2uoFIg');
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    console.log("Invoice 3g8vcAuQu7ugts2uoFIg NOT found!");
    return;
  }
  const inv = invSnap.data();
  console.log("=== INVOICE ===");
  console.log("Number:", inv.invoiceNumber || inv.number);
  console.log("Date:", inv.date);
  console.log("CustomerId:", inv.customerId, "CustomerName:", inv.customerName);
  console.log("Subtotal:", inv.subtotal);
  console.log("TotalVat:", inv.totalVat, "vatAmount:", inv.vatAmount);
  console.log("TotalWithVat:", inv.totalWithVat, "total:", inv.total);
  console.log("PaidAmount:", inv.paidAmount, "remainingAmount:", inv.remainingAmount);
  console.log("JournalEntryId:", inv.journalEntryId);
  console.log("Lines:");
  (inv.lines || inv.items || []).forEach((l, idx) => {
    console.log(`  Line ${idx + 1}: ${l.productName || l.name} | Qty: ${l.qty} | Price: ${l.unitPrice || l.price} | TaxCat: ${l.taxCategory} | TaxRate: ${l.taxRate} | Disc: ${l.discount}`);
  });

  console.log("\n=== JOURNAL ENTRIES FOR THIS INVOICE ===");
  const jesSnap = await getDocs(query(collection(db, 'companies/idham-main/journalEntries'), where('sourceId', '==', '3g8vcAuQu7ugts2uoFIg')));
  jesSnap.docs.forEach(d => {
    console.log("JE by sourceId (docId):", d.id, JSON.stringify(d.data(), null, 2));
  });

  const invNum = inv.invoiceNumber || inv.number;
  if (invNum) {
    const jesNumSnap = await getDocs(query(collection(db, 'companies/idham-main/journalEntries'), where('sourceId', '==', invNum)));
    jesNumSnap.docs.forEach(d => {
      console.log("JE by sourceId (invNum):", d.id, JSON.stringify(d.data(), null, 2));
    });
  }

  if (inv.journalEntryId) {
    const jeDoc = await getDoc(doc(db, 'companies/idham-main/journalEntries', inv.journalEntryId));
    if (jeDoc.exists()) {
      console.log("JE by inv.journalEntryId:", jeDoc.id, JSON.stringify(jeDoc.data(), null, 2));
    }
  }

  console.log("\n=== CUSTOMER ===");
  if (inv.customerId) {
    const custDoc = await getDoc(doc(db, 'companies/idham-main/customers', inv.customerId));
    if (custDoc.exists()) {
      const c = custDoc.data();
      console.log("Customer found by ID:", inv.customerId, "Name:", c.name, "Balance:", c.balance);
    }
  } else {
    const custsSnap = await getDocs(collection(db, 'companies/idham-main/customers'));
    custsSnap.docs.forEach(d => {
      if ((d.data().name || "").includes("كبسة البادية")) {
        console.log("Customer found by name search:", d.id, d.data().name, "Balance:", d.data().balance);
      }
    });
  }
}

inspect().catch(console.error);
