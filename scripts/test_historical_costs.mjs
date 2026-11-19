import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function testHistoricalLineCosts() {
  const [invSnap, retSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const returns = retSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled' && r.status !== 'void');
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p; if (p.name) prodMap[p.name] = p; });

  function getInvoiceExactCost(inv) {
    const lines = inv.lines || inv.items || [];
    if (!lines.length) return parseFloat(inv.totalCost || 0);
    let total = 0;
    lines.forEach(l => {
      const qty = parseFloat(l.qty || l.quantity || 1);
      const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
      const unitCost = parseFloat(
        l.purchasePrice !== undefined && l.purchasePrice > 0 ? l.purchasePrice :
        l.unitCost !== undefined && l.unitCost > 0 ? l.unitCost :
        l.costPrice !== undefined && l.costPrice > 0 ? l.costPrice :
        (p?.avgCostPrice || p?.costPrice || p?.lastPurchasePrice || 0)
      );
      total += (qty * unitCost);
    });
    return total;
  }

  const custMap = {};

  invoices.forEach(inv => {
    const cid = inv.customerId || inv.customerName || 'unknown';
    if (!custMap[cid]) {
      custMap[cid] = { name: inv.customerName, rep: inv.repName, subtotal: 0, total: 0, cost: 0 };
    }
    const c = custMap[cid];
    const gross = parseFloat(inv.totalWithVat || inv.total || 0);
    const sub = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (gross / 1.15));
    const cost = getInvoiceExactCost(inv);

    c.subtotal += sub;
    c.total += gross;
    c.cost += cost;
  });

  returns.forEach(ret => {
    const cid = ret.customerId || ret.customerName || 'unknown';
    if (custMap[cid]) {
      const c = custMap[cid];
      const gross = parseFloat(ret.totalWithVat || ret.total || 0);
      const sub = parseFloat(ret.subtotal !== undefined ? ret.subtotal : (gross / 1.15));
      const cost = getInvoiceExactCost(ret);

      c.subtotal -= sub;
      c.total -= gross;
      c.cost -= cost;
    }
  });

  console.log('------------------------------------------------------------------------------------------------------');
  console.log('CUSTOMER RECALCULATION WITH HISTORICAL PURCHASE COSTS AT TIME OF SALE:');
  console.log('------------------------------------------------------------------------------------------------------');
  const rows = Object.values(custMap).filter(c => c.subtotal > 0).map(c => {
    const profit = c.subtotal - c.cost;
    const margin = c.subtotal > 0 ? (profit / c.subtotal * 100) : 0;
    return { ...c, profit, margin };
  });

  rows.sort((a, b) => a.margin - b.margin);

  rows.forEach(r => {
    const mark = r.profit < 0 ? '🔴 LOSS' : r.margin < 3 ? '🟡 LOW ' : '🟢 OK  ';
    console.log(`${mark} | ${r.name.padEnd(35)} | Sub: ${r.subtotal.toFixed(2).padStart(9)} | Cost: ${r.cost.toFixed(2).padStart(9)} | Profit: ${r.profit.toFixed(2).padStart(8)} | Margin: ${r.margin.toFixed(2).padStart(6)}%`);
  });
}

testHistoricalLineCosts().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
