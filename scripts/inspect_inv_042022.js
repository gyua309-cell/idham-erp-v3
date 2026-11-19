import { db, COMPANY_ID } from "./js/firebase-config.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

async function inspectInvoice() {
  const q = query(
    collection(db, `companies/${COMPANY_ID}/salesInvoices`),
    where("number", "in", ["INV-042022", "042022", "INV-260902-042022"])
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No invoice found by number query, trying all invoices matching 042022...");
    const allSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`));
    const matched = allSnap.docs.filter(d => (d.data().number || "").includes("042022") || d.id.includes("042022"));
    matched.forEach(d => console.log("Found:", d.id, JSON.stringify(d.data(), null, 2)));
    return;
  }
  for (const d of snap.docs) {
    const inv = d.data();
    console.log("Invoice ID:", d.id);
    console.log("Data:", JSON.stringify(inv, null, 2));

    // Check stock transactions
    console.log("\n--- Checking Stock Transactions ---");
    const stSnap = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/stockTransactions`),
      where("sourceId", "==", d.id)
    ));
    console.log(`Found ${stSnap.size} stock transactions with sourceId == ${d.id}`);
    stSnap.docs.forEach(st => console.log("Stock Tx:", st.id, JSON.stringify(st.data())));

    const stSnap2 = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/stockTransactions`),
      where("documentNumber", "==", inv.number)
    ));
    console.log(`Found ${stSnap2.size} stock transactions with documentNumber == ${inv.number}`);
    stSnap2.docs.forEach(st => console.log("Stock Tx (by num):", st.id, JSON.stringify(st.data())));

    // Check Journal Entries
    console.log("\n--- Checking Journal Entries ---");
    const jeSnap = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/journalEntries`),
      where("sourceId", "in", [d.id, inv.number])
    ));
    console.log(`Found ${jeSnap.size} journal entries`);
    jeSnap.docs.forEach(je => console.log("JE:", je.id, JSON.stringify(je.data())));
  }
}

inspectInvoice().catch(console.error);
