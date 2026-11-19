import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function main() {
  console.log('Loading database collections...');
  const [prodsSnap, whSnap, repsSnap, invSnap, stSnap, transSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/warehouses')),
    getDocs(collection(db, 'companies/idham-main/salesReps')),
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions')),
    getDocs(collection(db, 'companies/idham-main/stockTransfers'))
  ]);

  const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const reps = repsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const mostafa = reps.find(r => r.name?.includes('مصطفى'));
  const mostafaWhId = mostafa?.assignedWarehouseId || 'Zyltw7uwvd0aKejdeqQq';
  const mainWhId = 'W5uANJjMgfFh2p3xU4bT';

  const allProds = prodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allInvs = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allSts = stSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allTransfers = transSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const sbwSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
  const allSbw = sbwSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Target search
  const targets = [
    { label: 'كاري مهران', filter: p => (p.name || '').includes('مهران') },
    { label: 'أرز الديوان', filter: p => (p.name || '').includes('ديوان') },
    { label: 'شطة قوارير', filter: p => (p.name || '').includes('شط') && (p.name || '').includes('قوارير') }
  ];

  for (const t of targets) {
    console.log('\n' + '='.repeat(70));
    console.log(`🔎 TARGET CATEGORY: ${t.label}`);
    console.log('='.repeat(70));

    const matched = allProds.filter(t.filter);
    console.log(`Found ${matched.length} products:`);
    for (const p of matched) {
      console.log(`\n📦 Product: [${p.id}] ${p.name} | Unit: ${p.unit} | Master TotalQty: ${p.totalQty ?? p.stock ?? 'N/A'}`);
      
      // Stock by Warehouse
      const sbwEntries = allSbw.filter(s => s.productId === p.id);
      sbwEntries.forEach(s => {
        const wh = warehouses.find(w => w.id === s.warehouseId);
        console.log(`   📍 WH: [${s.warehouseId}] ${wh?.name || 'Unknown'} => Current Qty: ${s.qty}`);
      });

      // Stock Transfers involving Mostafa's car
      const transfers = allTransfers.filter(tr => {
        const lines = tr.items || tr.lines || [];
        const hasProd = lines.some(l => l.productId === p.id);
        const hasCar = tr.toWarehouseId === mostafaWhId || tr.fromWarehouseId === mostafaWhId;
        return hasProd && hasCar;
      });
      console.log(`   🚚 Stock Transfers for Mostafa car: ${transfers.length}`);
      transfers.forEach(tr => {
        const lines = tr.items || tr.lines || [];
        const l = lines.find(x => x.productId === p.id);
        console.log(`      Transfer: ${tr.transferNumber || tr.id} | Date: ${tr.date} | From: ${tr.fromWarehouseName || tr.fromWarehouseId} -> To: ${tr.toWarehouseName || tr.toWarehouseId} | Qty: ${l.qty || l.quantity} | Status: ${tr.status}`);
      });

      // Invoices containing this product
      const invs = allInvs.filter(i => {
        if (i.status === 'cancelled') return false;
        return (i.lines || []).some(l => l.productId === p.id || l.name?.includes(p.name));
      });

      console.log(`   🧾 Total Invoices Selling this product: ${invs.length}`);
      
      let totalSoldAll = 0;
      let totalSoldMostafa = 0;
      let totalDeductedMostafa = 0;
      let totalDeductedAll = 0;

      invs.sort((a,b) => (a.date || '').localeCompare(b.date || '')).forEach(inv => {
        const line = (inv.lines || []).find(l => l.productId === p.id || l.name?.includes(p.name));
        const q = parseFloat(line.qty || 0);
        totalSoldAll += q;

        const isMostafa = inv.repId === mostafa?.id || inv.repName?.includes('مصطفى') || inv.warehouseId === mostafaWhId;
        if (isMostafa) totalSoldMostafa += q;

        // Check stock transactions for this invoice
        const sts = allSts.filter(st => {
          const matchDoc = st.sourceId === inv.invoiceNumber || st.documentNumber === inv.invoiceNumber || st.invoiceNumber === inv.invoiceNumber || st.sourceId === inv.id;
          return matchDoc && st.productId === p.id;
        });

        const ded = sts.reduce((acc, st) => acc + Math.abs(parseFloat(st.qtyChange || st.qty || 0)), 0);
        totalDeductedAll += ded;
        if (isMostafa) totalDeductedMostafa += ded;

        const whName = warehouses.find(w => w.id === inv.warehouseId)?.name || inv.warehouseId;
        const dedStatus = sts.length > 0 ? `Deducted: ${ded} (WH: ${sts.map(x=>x.warehouseId).join(',')})` : `❌ NOT DEDUCTED (0)`;

        console.log(`      - Inv: ${inv.invoiceNumber || inv.id} | Date: ${inv.date} | Rep: ${inv.repName} | WH: ${whName} | Sold: ${q} | ${dedStatus} | stockStatus: ${inv.stockStatus || 'N/A'}`);
      });

      console.log(`   📊 Summary for Product [${p.name}]:`);
      console.log(`      - Total Sold Across All Reps/Store: ${totalSoldAll}`);
      console.log(`      - Total Sold by Mostafa: ${totalSoldMostafa}`);
      console.log(`      - Total Deducted in StockTransactions (All): ${totalDeductedAll}`);
      console.log(`      - Total Deducted in StockTransactions (Mostafa): ${totalDeductedMostafa}`);
      console.log(`      - Un-deducted Qty for Mostafa: ${totalSoldMostafa - totalDeductedMostafa}`);
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
