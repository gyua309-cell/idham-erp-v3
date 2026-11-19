import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkAndFixZeroCostInvoices(applyFix = false) {
  const [invSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Checking ${invoices.length} active sales invoices for missing or zero costs...`);

  let zeroCostInvoices = 0;
  let fixedInvoices = 0;

  for (const inv of invoices) {
    const lines = inv.items || inv.lines || [];
    let computedCost = 0;
    let needsUpdate = false;

    lines.forEach(it => {
      const p = products.find(prod => prod.id === it.productId || prod.name === it.name || prod.name === it.productName);
      const qty = parseFloat(it.qty || it.quantity || 1);
      const catalogCost = parseFloat(p?.avgCost || p?.costPrice || p?.lastPurchasePrice || 0);
      let unitCost = parseFloat(it.unitCost !== undefined ? it.unitCost : (it.cost || 0));

      if (unitCost === 0 && catalogCost > 0) {
        unitCost = catalogCost;
        it.unitCost = catalogCost;
        needsUpdate = true;
      }

      computedCost += (qty * unitCost);
    });

    const currentTotalCost = parseFloat(inv.totalCost || 0);
    if (currentTotalCost === 0 && computedCost > 0) {
      needsUpdate = true;
      zeroCostInvoices++;
    } else if (Math.abs(currentTotalCost - computedCost) > 1 && computedCost > 0) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      const sub = parseFloat(inv.subtotal || (parseFloat(inv.totalWithVat || inv.total || 0) / 1.15));
      const oldMargin = sub > 0 ? (((sub - currentTotalCost) / sub) * 100).toFixed(1) : '0';
      const newMargin = sub > 0 ? (((sub - computedCost) / sub) * 100).toFixed(1) : '0';

      console.log(`Invoice ${inv.number || inv.id} (${inv.customerName} - ${inv.date}): OldCost=${currentTotalCost.toFixed(2)} (${oldMargin}%) -> RealCost=${computedCost.toFixed(2)} (${newMargin}%)`);

      if (applyFix) {
        await updateDoc(doc(db, 'companies/idham-main/salesInvoices', inv.id), {
          totalCost: Math.round(computedCost * 100) / 100,
          items: lines
        });
        fixedInvoices++;
      }
    }
  }

  console.log(`\nFound ${zeroCostInvoices} invoices with 0 cost that needed fix.`);
  if (applyFix) {
    console.log(`Fixed and updated ${fixedInvoices} invoices in Firestore.`);
  }
}

const apply = process.argv.includes('--apply');
checkAndFixZeroCostInvoices(apply).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
