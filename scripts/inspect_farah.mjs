import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectFarah() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => (i.customerName || '').includes('فرح') && i.status !== 'cancelled');

  for (const inv of invoices) {
    console.log(`\n======================================================`);
    console.log(`INVOICE: ${inv.number || inv.invoiceNumber || inv.id} | Date: ${inv.date} | Customer: ${inv.customerName}`);
    console.log(`Subtotal: ${inv.subtotal} | VAT: ${inv.taxAmount || inv.totalVat || inv.vat} | TotalWithVat: ${inv.totalWithVat || inv.total} | TotalCost: ${inv.totalCost}`);
    const lines = inv.lines || inv.items || [];
    lines.forEach((l, idx) => {
      const qty = parseFloat(l.qty || l.quantity || 1);
      const price = parseFloat(l.unitPrice || l.price || 0);
      const sub = qty * price;
      const unitCost = parseFloat(l.unitCost !== undefined ? l.unitCost : (l.costPrice || 0));
      const cost = qty * unitCost;
      const profit = sub - cost;
      console.log(`  Line ${idx+1}: ${l.productName || l.name}`);
      console.log(`    Qty: ${qty} | UnitPrice (قبل الضريبة): ${price} | Sub: ${sub.toFixed(2)}`);
      console.log(`    UnitCost: ${unitCost} | TotalCost: ${cost.toFixed(2)} | Profit: ${profit.toFixed(2)} (${(profit/sub*100).toFixed(2)}%)`);
    });
  }
}

inspectFarah().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
