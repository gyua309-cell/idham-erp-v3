import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function testRecalculation() {
  const [invSnap, retSnap, recSnap, custSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/receipts')),
    getDocs(collection(db, 'companies/idham-main/customers')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const returns = retSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled' && r.status !== 'void');
  const customers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p; if (p.name) prodMap[p.name] = p; });

  const custMap = {};
  customers.forEach(cust => {
    custMap[cust.id] = {
      id: cust.id,
      name: cust.name,
      repName: cust.repName || 'بدون مندوب',
      subtotalSales: 0,
      vatSales: 0,
      totalSales: 0,
      totalCost: 0,
      invoiceCount: 0,
      returnCount: 0,
    };
  });

  for (const inv of invoices) {
    const cid = inv.customerId || 'unknown';
    if (!custMap[cid]) custMap[cid] = { id: cid, name: inv.customerName, subtotalSales: 0, vatSales: 0, totalSales: 0, totalCost: 0, invoiceCount: 0, returnCount: 0 };
    const c = custMap[cid];
    c.invoiceCount++;
    const gross = parseFloat(inv.totalWithVat || inv.total || 0);
    const sub = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (gross / 1.15));
    const vat = parseFloat(inv.vat !== undefined ? inv.vat : (gross - sub));
    const cost = parseFloat(inv.totalCost || 0);
    c.totalSales += gross;
    c.subtotalSales += sub;
    c.vatSales += vat;
    c.totalCost += cost;
  }

  for (const ret of returns) {
    const cid = ret.customerId || 'unknown';
    if (custMap[cid]) {
      const c = custMap[cid];
      c.returnCount++;
      const grossRet = parseFloat(ret.totalWithVat || ret.total || 0);
      const subRet = parseFloat(ret.subtotal !== undefined ? ret.subtotal : (grossRet / 1.15));
      const vatRet = parseFloat(ret.vat !== undefined ? ret.vat : (grossRet - subRet));
      let costRet = parseFloat(ret.totalCost || 0);
      if (costRet === 0) {
        (ret.items || ret.lines || []).forEach(it => {
          const p = prodMap[it.productId] || prodMap[it.name] || prodMap[it.productName];
          const qty = parseFloat(it.qty || it.quantity || 1);
          const uCost = parseFloat(it.costPrice !== undefined ? it.costPrice : (it.unitCost !== undefined ? it.unitCost : (p?.avgCostPrice || p?.costPrice || 0)));
          costRet += (qty * uCost);
        });
      }
      c.totalSales -= grossRet;
      c.subtotalSales -= subRet;
      c.vatSales -= vatRet;
      c.totalCost -= costRet;
    }
  }

  const results = Object.values(custMap).filter(c => Math.abs(c.totalSales) > 0.001);
  results.sort((a, b) => b.totalSales - a.totalSales);

  console.log('Top 20 Customers Recalculated:');
  console.log('------------------------------------------------------------------------------------------------------------------------');
  console.log('Customer                             | SubtotalSales | TotalSales | TotalCost  | Profit     | Margin%');
  console.log('------------------------------------------------------------------------------------------------------------------------');
  for (const r of results.slice(0, 20)) {
    const profit = r.subtotalSales - r.totalCost;
    const margin = r.subtotalSales > 0 ? (profit / r.subtotalSales * 100).toFixed(2) : '0.00';
    console.log(`${r.name.padEnd(36)} | ${r.subtotalSales.toFixed(2).padStart(13)} | ${r.totalSales.toFixed(2).padStart(10)} | ${r.totalCost.toFixed(2).padStart(10)} | ${profit.toFixed(2).padStart(10)} | ${margin.padStart(6)}%`);
  }
}

testRecalculation().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
