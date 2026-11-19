import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function fixSalesReturnsCosts() {
  const [retSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/products'))
  ]);

  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const prodMap = {};
  products.forEach(p => {
    prodMap[p.id] = p;
    if (p.name) prodMap[p.name] = p;
  });

  console.log(`Auditing and fixing costs for ${retSnap.size} sales returns...`);

  for (const docSnap of retSnap.docs) {
    const ret = { id: docSnap.id, ...docSnap.data() };
    const lines = ret.items || ret.lines || [];
    let computedCost = 0;
    let linesUpdated = false;

    lines.forEach(it => {
      const p = prodMap[it.productId] || prodMap[it.name] || prodMap[it.productName];
      const qty = parseFloat(it.qty || it.quantity || 1);
      let unitCost = parseFloat(it.costPrice !== undefined ? it.costPrice : (it.unitCost !== undefined ? it.unitCost : (it.purchasePrice || 0)));

      if (!unitCost || unitCost === 0) {
        unitCost = parseFloat(p?.avgCostPrice || p?.avgCost || p?.costPrice || p?.lastPurchasePrice || 0);
        it.costPrice = unitCost;
        linesUpdated = true;
      }

      computedCost += (qty * unitCost);
    });

    const roundedCost = Math.round(computedCost * 100) / 100;
    console.log(`Return ${ret.number || ret.id} (${ret.customerName}) -> Subtotal: ${ret.subtotal} | OldCost: ${ret.totalCost} -> NewCost: ${roundedCost}`);

    await updateDoc(doc(db, 'companies/idham-main/salesReturns', ret.id), {
      totalCost: roundedCost,
      lines: lines
    });
  }

  console.log('✅ All sales returns updated successfully in Firestore.');
}

fixSalesReturnsCosts().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
