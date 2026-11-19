import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectHighProfitInvoices() {
  const [invSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const targetCustomers = ['مطعم عيش وملح', 'مطعم رواد الاسماك', 'مطعم البرنس للبخارى', 'مطعم البرنس'];

  for (const name of targetCustomers) {
    const custInvs = invoices.filter(i => i.customerName && i.customerName.includes(name));
    console.log(`\n======================================================`);
    console.log(`🏢 CUSTOMER: ${name} (${custInvs.length} invoices)`);

    let totalSubtotal = 0;
    let totalStoredCost = 0;
    let totalRealProductCost = 0;

    custInvs.forEach(inv => {
      const invSub = parseFloat(inv.subtotal || (parseFloat(inv.totalWithVat || inv.total || 0) / 1.15));
      const invStoredCost = parseFloat(inv.totalCost || 0);

      // Recalculate cost from current product master catalog
      let invCatalogCost = 0;
      let hasZeroCostItems = false;
      const lines = inv.items || inv.lines || [];

      lines.forEach(it => {
        const p = products.find(prod => prod.id === it.productId || prod.name === it.name || prod.name === it.productName);
        const qty = parseFloat(it.qty || it.quantity || 1);
        const unitPrice = parseFloat(it.unitPrice || it.price || 0);
        const unitCostOnInvoice = parseFloat(it.unitCost !== undefined ? it.unitCost : (it.cost || 0));
        const catalogCost = parseFloat(p?.avgCost || p?.costPrice || p?.lastPurchasePrice || 0);

        if (unitCostOnInvoice === 0) hasZeroCostItems = true;
        invCatalogCost += (qty * catalogCost);
      });

      totalSubtotal += invSub;
      totalStoredCost += invStoredCost;
      totalRealProductCost += invCatalogCost;

      const storedMargin = invSub > 0 ? (((invSub - invStoredCost) / invSub) * 100).toFixed(1) : '0';
      const catalogMargin = invSub > 0 ? (((invSub - invCatalogCost) / invSub) * 100).toFixed(1) : '0';

      console.log(`  Invoice ${inv.number || inv.id} (${inv.date}): Subtotal=${invSub.toFixed(2)} | StoredCost=${invStoredCost.toFixed(2)} (Margin: ${storedMargin}%) | CatalogCost=${invCatalogCost.toFixed(2)} (Margin: ${catalogMargin}%) ${hasZeroCostItems ? '⚠️ [HAS 0 COST ITEMS]' : ''}`);

      if (hasZeroCostItems || parseFloat(storedMargin) > 30) {
        lines.forEach(it => {
          const p = products.find(prod => prod.id === it.productId || prod.name === it.name || prod.name === it.productName);
          const qty = parseFloat(it.qty || it.quantity || 1);
          const unitPrice = parseFloat(it.unitPrice || it.price || 0);
          const unitCostOnInvoice = parseFloat(it.unitCost !== undefined ? it.unitCost : (it.cost || 0));
          const catalogCost = parseFloat(p?.avgCost || p?.costPrice || p?.lastPurchasePrice || 0);
          console.log(`      * Item: "${it.name || it.productName}" | Qty: ${qty} | UnitPrice: ${unitPrice} | UnitCostOnInv: ${unitCostOnInvoice} | CatalogAvgCost: ${catalogCost}`);
        });
      }
    });

    console.log(`\n  SUMMARY FOR ${name}:`);
    console.log(`    Total Subtotal: ${totalSubtotal.toFixed(2)}`);
    console.log(`    Total Stored Cost on Invoices: ${totalStoredCost.toFixed(2)} -> Profit Margin = ${(((totalSubtotal - totalStoredCost) / totalSubtotal) * 100).toFixed(2)}%`);
    console.log(`    Total Real Product Cost (Catalog): ${totalRealProductCost.toFixed(2)} -> Profit Margin = ${(((totalSubtotal - totalRealProductCost) / totalSubtotal) * 100).toFixed(2)}%`);
  }
}

inspectHighProfitInvoices().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
