import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function run() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  let targetInv = null;
  const negativeInvoices = [];
  
  invSnap.forEach(d => {
    const data = d.data();
    data.id = d.id;
    const valExcl = data.subtotal || 0;
    const cost = data.totalCost || 0;
    const profit = valExcl - cost;
    if ((data.number || '').includes('62470382') || d.id.includes('62470382')) {
      targetInv = data;
    }
    if (profit < 0 && data.status !== 'cancelled') {
      negativeInvoices.push({
        id: data.id,
        number: data.number,
        date: data.date,
        customerName: data.customerName,
        subtotal: valExcl,
        totalWithVat: data.totalWithVat,
        totalCost: cost,
        profit: profit,
        margin: valExcl > 0 ? (profit / valExcl) * 100 : 0,
        lines: data.lines
      });
    }
  });

  console.log('=== Target Invoice REP-62470382 ===');
  if (targetInv) {
    console.log(JSON.stringify({
      id: targetInv.id,
      number: targetInv.number,
      date: targetInv.date,
      customerName: targetInv.customerName,
      subtotal: targetInv.subtotal,
      vatAmount: targetInv.vatAmount,
      totalWithVat: targetInv.totalWithVat,
      totalCost: targetInv.totalCost,
      lines: targetInv.lines
    }, null, 2));
  } else {
    console.log('Not found by number 62470382');
  }

  console.log('\n=== All Negative Invoices in DB ===');
  console.log('Total count:', negativeInvoices.length);
  negativeInvoices.forEach(inv => {
    console.log(`${inv.number} | ${inv.date} | ${inv.customerName} | SalesExcl: ${inv.subtotal} | Cost: ${inv.totalCost} | Profit: ${inv.profit.toFixed(2)} | Margin: ${inv.margin.toFixed(1)}%`);
    (inv.lines || []).forEach(l => {
      console.log(`   -> Product: [${l.productId || l.id}] ${l.productName || l.name} | Qty: ${l.qty || l.quantity} | UnitPrice: ${l.unitPrice || l.price} | CostPrice: ${l.costPrice || l.cost || 0} | LineTotal: ${l.total || l.subtotal} | LineCost: ${(l.qty || l.quantity || 1) * (l.costPrice || l.cost || 0)}`);
    });
  });
}
run().catch(console.error);
