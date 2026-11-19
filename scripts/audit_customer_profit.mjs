import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectCustomerProfits() {
  const [invSnap, prodSnap, retSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/salesReturns'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const returns = retSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled' && r.status !== 'void');

  const prodMap = {};
  products.forEach(p => {
    prodMap[p.id] = p;
    if (p.name) prodMap[p.name] = p;
  });

  const checkCustomers = ['مطعم عيش وملح', 'مطعم الصفا البخارى 2', 'بقالة عبد الله', 'مطعم صبا المذاق لتقديم الوجبات'];

  for (const custName of checkCustomers) {
    console.log('========================================================================');
    console.log('CUSTOMER:', custName);
    console.log('========================================================================');

    const custInvs = invoices.filter(i => (i.customerName || '').includes(custName));
    const custRets = returns.filter(r => (r.customerName || '').includes(custName));

    let sumGross = 0;
    let sumSub = 0;
    let sumCost = 0;

    for (const inv of custInvs) {
      const gross = parseFloat(inv.totalWithVat || inv.total || 0);
      const sub = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (gross / 1.15));
      const cost = parseFloat(inv.totalCost || 0);

      sumGross += gross;
      sumSub += sub;
      sumCost += cost;

      console.log(`\n  Invoice: ${inv.number || inv.id} | Date: ${inv.date} | Sub: ${sub.toFixed(2)} | Cost: ${cost.toFixed(2)} | Profit: ${(sub - cost).toFixed(2)}`);

      const items = inv.items || inv.lines || [];
      for (const it of items) {
        const p = prodMap[it.productId] || prodMap[it.name] || prodMap[it.productName];
        const qty = parseFloat(it.qty || it.quantity || 1);
        const price = parseFloat(it.price || it.unitPrice || 0);
        const lineSub = qty * price;
        const unitCost = parseFloat(it.unitCost !== undefined ? it.unitCost : (it.cost || 0));
        const lineCost = qty * unitCost;

        const isLoss = lineCost > lineSub;
        console.log(`    ${isLoss ? '🚨 LOSS' : '  OK '} Item: ${it.name || it.productName}`);
        console.log(`         Qty=${qty} ${it.unit || ''} @ Price=${price} -> LineSub=${lineSub.toFixed(2)} | UnitCost=${unitCost} -> LineCost=${lineCost.toFixed(2)} | (Margin=${lineSub > 0 ? (((lineSub - lineCost) / lineSub) * 100).toFixed(1) : 0}%)`);
        if (p) {
          console.log(`         ProductMaster: costPrice=${p.costPrice}, avgCost=${p.avgCost}, avgCostPrice=${p.avgCostPrice}, lastPurchasePrice=${p.lastPurchasePrice}, unit=${p.unit}, piecesPerUnit=${p.piecesPerUnit || p.factor}`);
        }
      }
    }

    console.log(`\n>>> CUST SUMMARY FOR ${custName}:`);
    console.log(`    Invoices: ${custInvs.length} | Gross: ${sumGross.toFixed(2)} | Subtotal: ${sumSub.toFixed(2)} | Cost: ${sumCost.toFixed(2)} | Profit: ${(sumSub - sumCost).toFixed(2)}`);
    console.log(`    Returns: ${custRets.length}`);
    for (const r of custRets) {
      console.log(`      Return ${r.number || r.id} | Date: ${r.date} | Sub: ${r.subtotal} | TotalWithVat: ${r.totalWithVat} | TotalCost: ${r.totalCost}`);
    }
  }
}

inspectCustomerProfits().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
