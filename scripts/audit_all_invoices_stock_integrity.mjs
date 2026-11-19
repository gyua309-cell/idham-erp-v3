import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function auditAllInvoices() {
  console.log("Fetching all sales invoices...");
  const siSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const allInvoices = siSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Found ${allInvoices.length} total sales invoices. Filtering posted invoices...`);
  const postedInvoices = allInvoices.filter(inv => inv.status !== 'cancelled' && inv.status !== 'draft');
  console.log(`Checking ${postedInvoices.length} posted invoices against stock transactions...`);

  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const allTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Fetched ${allTxs.length} stock transactions. Analyzing discrepancies...`);

  // Index txs by invoice documentNumber / sourceId / invoiceNumber
  const txsByInvoice = {};
  allTxs.forEach(t => {
    const keys = new Set([
      t.invoiceNumber,
      t.documentNumber,
      t.sourceId,
      t.refId
    ].filter(Boolean));

    keys.forEach(k => {
      if (!txsByInvoice[k]) txsByInvoice[k] = [];
      txsByInvoice[k].push(t);
    });
  });

  const discrepancies = [];

  for (const inv of postedInvoices) {
    const invNum = inv.number || inv.invoiceNumber || inv.id;
    const relatedTxs = txsByInvoice[invNum] || txsByInvoice[inv.id] || [];

    const lines = inv.lines || inv.items || [];
    for (const line of lines) {
      if (!line.productId || String(line.productId).startsWith('adhoc_') || line.isCustom) continue;

      const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1;
      const expectedDeduction = (parseFloat(line.qty) || 0) * factor;

      // Net deduction in stock transactions for this product and this invoice
      const pTxs = relatedTxs.filter(t => t.productId === line.productId);
      let actualNetDeduction = 0;
      pTxs.forEach(t => {
        // qtyChange is negative for sale_out, positive for sale_reverse_edit
        const delta = parseFloat(t.qtyChange) || 0;
        actualNetDeduction += -delta; // so sale_out (-1) becomes +1 deduction
      });

      const diff = Math.round((expectedDeduction - actualNetDeduction) * 1000) / 1000;
      if (diff !== 0) {
        discrepancies.push({
          invoiceId: inv.id,
          invoiceNumber: invNum,
          date: inv.date,
          customer: inv.customerName,
          productId: line.productId,
          productName: line.productName || line.name,
          expectedQty: expectedDeduction,
          actualDeductedQty: actualNetDeduction,
          missingDeduction: diff,
          stockStatus: inv.stockStatus
        });
      }
    }
  }

  console.log(`\n=======================================================`);
  console.log(`AUDIT RESULTS: Found ${discrepancies.length} line discrepancies across all posted invoices:`);
  console.log(`=======================================================`);
  discrepancies.forEach(d => {
    console.log(`Invoice: ${d.invoiceNumber} (${d.date}) | Customer: ${d.customer} | Prod: ${d.productName} | Expected: ${d.expectedQty} | Actually Deducted: ${d.actualDeductedQty} | Missing: ${d.missingDeduction} | status: ${d.stockStatus}`);
  });
}

auditAllInvoices().catch(console.error);
