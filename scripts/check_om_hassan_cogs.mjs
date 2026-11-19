import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function run() {
  console.log('=== SALES INVOICES FOR OM HASSAN ===');
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const omInvs = [];
  invSnap.forEach(d => {
    const data = d.data();
    if ((data.customerName || '').includes('ام حسن') || (data.customerName || '').includes('أم حسن')) {
      omInvs.push({ id: d.id, ...data });
    }
  });

  omInvs.forEach(inv => {
    console.log('--------------------------------------------------');
    console.log('Invoice Doc ID:', inv.id);
    console.log('  Number:', inv.number || inv.invoiceNumber);
    console.log('  Date:', inv.date);
    console.log('  Subtotal:', inv.subtotal, 'VAT:', inv.vatAmount || inv.totalVat, 'Total:', inv.total || inv.totalWithVat);
    console.log('  totalCost:', inv.totalCost);
    console.log('  journalEntryId:', inv.journalEntryId);
    console.log('  CostCenter:', inv.costCenterId, inv.costCenterName);
    const lines = inv.lines || inv.items || [];
    console.log('  Items Count:', lines.length);
    let calcCost = 0;
    lines.forEach((l, idx) => {
      const q = parseFloat(l.qty || l.quantity || 0);
      const cp = parseFloat(l.costPrice || l.averageCost || l.purchasePrice || 0);
      const sp = parseFloat(l.unitPrice || l.price || 0);
      calcCost += (q * cp);
      console.log(`    [${idx + 1}] ${l.productName || l.name} | Qty: ${q} ${l.unit || ''} | Price: ${sp} | Cost: ${cp} | LineCost: ${(q * cp).toFixed(2)}`);
    });
    console.log('  -> Calculated Total Cost:', calcCost.toFixed(2));
  });

  console.log('\n=== JOURNAL ENTRIES FOR OM HASSAN / 042027 / 042037 ===');
  const jeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  jeSnap.forEach(d => {
    const je = d.data();
    const str = JSON.stringify(je);
    if (str.includes('ام حسن') || str.includes('أم حسن') || str.includes('042027') || str.includes('042037') || str.includes('LHjJiEJtbl63m98ehYW5') || str.includes('xUzpKdBWzUT6wudwdVBl')) {
      console.log('--------------------------------------------------');
      console.log('JE Doc ID:', d.id);
      console.log('  Entry Number:', je.entryNumber || je.number);
      console.log('  Date:', je.date);
      console.log('  SourceType:', je.sourceType, 'SourceId:', je.sourceId);
      console.log('  Description:', je.description);
      console.log('  Lines:');
      (je.lines || []).forEach(l => {
        console.log(`    Account: ${l.accountCode} - ${l.accountName} | Dr: ${l.debit || 0} | Cr: ${l.credit || 0} | CostCenter: ${l.costCenterId || ''}`);
      });
    }
  });
}
run().catch(console.error);
