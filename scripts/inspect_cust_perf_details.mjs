import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectOctoberInvoices() {
  const [invSnap, retSnap, rcptSnap, custSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/receipts')),
    getDocs(collection(db, 'companies/idham-main/customers')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const octInvs = invSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(i => i.date >= '2026-10-01' && i.date <= '2026-10-05' && i.status !== 'cancelled');

  const octRets = retSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.date >= '2026-10-01' && r.date <= '2026-10-05' && r.status !== 'cancelled');

  const octRcpts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.date >= '2026-10-01' && r.date <= '2026-10-05' && r.status !== 'cancelled');

  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`October 1-5 Invoices count: ${octInvs.length}, Returns: ${octRets.length}, Receipts: ${octRcpts.length}`);

  octInvs.slice(0, 8).forEach(i => {
    console.log(`\n======================================================`);
    console.log(`Invoice ${i.number || i.id} - ${i.customerName} (Date: ${i.date}):`);
    console.log(`  Subtotal (Before VAT): ${i.subtotal}`);
    console.log(`  VAT (15%): ${i.vat || i.taxAmount}`);
    console.log(`  Total With VAT: ${i.totalWithVat || i.total}`);
    console.log(`  Total Cost: ${i.totalCost}`);
    console.log(`  Profit (Subtotal - Cost): ${(parseFloat(i.subtotal || 0) - parseFloat(i.totalCost || 0)).toFixed(2)}`);
    console.log(`  Profit Margin % on Subtotal: ${i.subtotal > 0 ? (((parseFloat(i.subtotal) - parseFloat(i.totalCost || 0)) / parseFloat(i.subtotal)) * 100).toFixed(2) : 0}%`);
    console.log(`  Profit Margin % on Gross (With VAT): ${i.totalWithVat > 0 ? (((parseFloat(i.subtotal) - parseFloat(i.totalCost || 0)) / parseFloat(i.totalWithVat)) * 100).toFixed(2) : 0}%`);
    console.log(`  Paid Amount: ${i.paidAmount}, Remaining: ${i.remainingAmount}, Method: ${i.paymentMethod}`);
    console.log('  Items Breakdown:');
    (i.items || i.lines || []).forEach(it => {
      const p = products.find(prod => prod.id === it.productId || prod.name === it.name || prod.name === it.productName);
      const qty = parseFloat(it.qty || it.quantity || 1);
      const unitPrice = parseFloat(it.unitPrice || it.price || 0);
      const unitCost = parseFloat(it.unitCost !== undefined ? it.unitCost : (it.cost || p?.costPrice || p?.avgCost || 0));
      const lineSubtotal = parseFloat(it.subtotal || it.total || (qty * unitPrice));
      const lineCost = qty * unitCost;
      const lineProfit = lineSubtotal - lineCost;
      console.log(`    - ${it.name || it.productName}: Qty=${qty} | Price=${unitPrice} | LineSubtotal=${lineSubtotal} | UnitCost=${unitCost} (Product AvgCost=${p?.avgCost || p?.costPrice}) | LineCost=${lineCost.toFixed(2)} | Profit=${lineProfit.toFixed(2)} (${lineSubtotal > 0 ? ((lineProfit/lineSubtotal)*100).toFixed(1) : 0}%)`);
    });
  });
}

inspectOctoberInvoices().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
