import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function fullAudit() {
  console.log('--- Starting Full Stock Audit Across All Collections ---');

  const [prodSnap, stockSnap, purchSnap, salesSnap, dnSnap, srSnap, prSnap, adjSnap, txSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/stockByWarehouse')),
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/deliveryNotes')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/purchaseReturns')),
    getDocs(collection(db, 'companies/idham-main/inventoryAdjustments')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions'))
  ]);

  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const stockByWh = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const purchases = purchSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status !== 'cancelled');
  const sales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.status !== 'cancelled');
  const deliveryNotes = dnSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status !== 'cancelled' && (d.deliveryStatus === 'delivered' || d.status === 'delivered' || d.stockDeducted === true));
  const salesReturns = srSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled');
  const purchaseReturns = prSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled');
  const adjs = adjSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.status !== 'cancelled');
  const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Loaded:
  - Products: ${products.length}
  - StockByWarehouse docs: ${stockByWh.length}
  - Purchase Invoices: ${purchases.length}
  - Sales Invoices: ${sales.length}
  - Delivery Notes: ${deliveryNotes.length}
  - Stock Transactions: ${transactions.length}
  `);

  // Map product stock by warehouse
  const prodActualStock = {};
  products.forEach(p => {
    prodActualStock[p.id] = 0;
  });
  stockByWh.forEach(s => {
    if (s.productId && prodActualStock[s.productId] !== undefined) {
      prodActualStock[s.productId] += (parseFloat(s.qty) || 0);
    }
  });

  // Calculate purchases per product
  const prodPurchased = {};
  purchases.forEach(pi => {
    const lines = pi.lines || pi.items || [];
    lines.forEach(l => {
      if (!l.productId) return;
      const baseQty = (parseFloat(l.qty || l.quantity) || 0) * (l.unitFactor || 1);
      prodPurchased[l.productId] = (prodPurchased[l.productId] || 0) + baseQty;
    });
  });

  // Calculate purchase returns
  const prodPurchReturned = {};
  purchaseReturns.forEach(pr => {
    const lines = pr.lines || pr.items || [];
    lines.forEach(l => {
      if (!l.productId) return;
      const baseQty = (parseFloat(l.qty || l.quantity) || 0) * (l.unitFactor || 1);
      prodPurchReturned[l.productId] = (prodPurchReturned[l.productId] || 0) + baseQty;
    });
  });

  // Calculate sales per product
  const prodSold = {};
  sales.forEach(si => {
    const lines = si.lines || si.items || [];
    lines.forEach(l => {
      if (!l.productId) return;
      const baseQty = (parseFloat(l.qty || l.quantity) || 0) * (l.unitFactor || 1);
      prodSold[l.productId] = (prodSold[l.productId] || 0) + baseQty;
    });
  });

  // Delivery notes without sales invoice
  const prodDelivered = {};
  deliveryNotes.forEach(dn => {
    if (dn.invoiceId || dn.salesInvoiceId) return; // already counted in sales if linked
    const lines = dn.lines || dn.items || [];
    lines.forEach(l => {
      if (!l.productId) return;
      const baseQty = (parseFloat(l.qty || l.quantity) || 0) * (l.unitFactor || 1);
      prodDelivered[l.productId] = (prodDelivered[l.productId] || 0) + baseQty;
    });
  });

  // Sales returns
  const prodSalesReturned = {};
  salesReturns.forEach(sr => {
    const lines = sr.lines || sr.items || [];
    lines.forEach(l => {
      if (!l.productId) return;
      const baseQty = (parseFloat(l.qty || l.quantity) || 0) * (l.unitFactor || 1);
      prodSalesReturned[l.productId] = (prodSalesReturned[l.productId] || 0) + baseQty;
    });
  });

  // Inventory adjustments
  const prodAdjusted = {};
  adjs.forEach(adj => {
    const lines = adj.items || adj.lines || [];
    lines.forEach(l => {
      if (!l.productId) return;
      // qty or diff
      const diff = parseFloat(l.difference !== undefined ? l.difference : (l.qtyDelta || l.qty || 0));
      prodAdjusted[l.productId] = (prodAdjusted[l.productId] || 0) + diff;
    });
  });

  // Transactions delta
  const prodTxSum = {};
  transactions.forEach(t => {
    if (!t.productId) return;
    const change = parseFloat(t.qtyChange || t.quantity || 0);
    prodTxSum[t.productId] = (prodTxSum[t.productId] || 0) + change;
  });

  // Analyze each product
  const mismatches = [];
  const withOpeningStock = [];
  const allAudited = [];

  products.forEach(p => {
    const actualWhStock = prodActualStock[p.id] !== undefined ? prodActualStock[p.id] : (parseFloat(p.totalQty) || 0);
    const pPurch = prodPurchased[p.id] || 0;
    const pPurchRet = prodPurchReturned[p.id] || 0;
    const netPurch = pPurch - pPurchRet;

    const pSold = prodSold[p.id] || 0;
    const pDeliv = prodDelivered[p.id] || 0;
    const pSalesRet = prodSalesReturned[p.id] || 0;
    const netSold = (pSold + pDeliv) - pSalesRet;

    const pAdj = prodAdjusted[p.id] || 0;
    const pOpening = parseFloat(p.openingStock || p.initialStock || 0);

    const docTotalQty = parseFloat(p.totalQty || 0);

    // Theoretical from documents = Opening + NetPurch - NetSold + pAdj
    const theoreticalDoc = pOpening + netPurch - netSold + pAdj;
    
    // Difference between theoretical from docs and actual stock in warehouse
    const diff = actualWhStock - theoreticalDoc;

    if (pOpening > 0) {
      withOpeningStock.push({
        id: p.id,
        name: p.name,
        sku: p.sku || p.code,
        opening: pOpening,
        netPurch,
        netSold,
        actualWhStock
      });
    }

    if (Math.abs(diff) > 0.001) {
      mismatches.push({
        id: p.id,
        name: p.name,
        sku: p.sku || p.code,
        actualWhStock,
        docTotalQty,
        pOpening,
        netPurch,
        netSold,
        pAdj,
        theoreticalDoc,
        diff,
        txSum: prodTxSum[p.id] || 0
      });
    }

    allAudited.push({
      id: p.id,
      name: p.name,
      sku: p.sku || p.code,
      actualWhStock,
      netPurch,
      netSold,
      diff
    });
  });

  console.log(`\n======================================================`);
  console.log(`TOTAL PRODUCTS AUDITED: ${products.length}`);
  console.log(`PRODUCTS WITH OPENING STOCK: ${withOpeningStock.length}`);
  console.log(`PRODUCTS WITH DISCREPANCIES (Actual Stock != Invoices Net): ${mismatches.length}`);
  console.log(`======================================================\n`);

  if (mismatches.length > 0) {
    console.log('Top Mismatches:');
    mismatches.forEach((m, idx) => {
      console.log(`${idx + 1}. [${m.sku}] ${m.name}`);
      console.log(`   Purchased: ${m.netPurch} | Sold: ${m.netSold} | Opening: ${m.pOpening} | Adj: ${m.pAdj}`);
      console.log(`   Theoretical (Purch - Sold): ${m.theoreticalDoc} | Actual Stock: ${m.actualWhStock} | Discrepancy: ${m.diff > 0 ? '+' : ''}${m.diff}`);
    });
  }

  // Let's specifically inspect Butter and Tea
  const butter = products.filter(p => p.name && (p.name.includes('زبد') || p.name.includes('زبده') || p.name.includes('زبدة')));
  console.log('\n--- Butter Products ---');
  butter.forEach(b => {
    console.log(`Butter: [${b.sku}] ${b.name} -> Actual Stock: ${prodActualStock[b.id]}, TotalQty: ${b.totalQty}, Purch: ${prodPurchased[b.id] || 0}, Sold: ${prodSold[b.id] || 0}`);
  });
}

fullAudit().catch(console.error);
