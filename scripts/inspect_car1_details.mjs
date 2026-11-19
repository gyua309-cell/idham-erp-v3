import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectVehicleStock() {
  const [stockByWhSnap, txsSnap, salesInvsSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/stockByWarehouse')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions')),
    getDocs(collection(db, 'companies/idham-main/salesInvoices'))
  ]);

  const stockByWh = stockByWhSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const txs = txsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const salesInvs = salesInvsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const vehicleWhId = 'Zyltw7uwvd0aKejdeqQq'; // مخزن سيارة 1 مصطفى

  console.log(`--- All stockByWarehouse records for Car 1 Mustafa (${vehicleWhId}) ---`);
  const carRecords = stockByWh.filter(r => r.warehouseId === vehicleWhId);
  console.log(`Found ${carRecords.length} records:`);
  carRecords.forEach(r => {
    console.log(JSON.stringify(r));
  });

  console.log(`\n--- All transactions for transfer 8uinidJhfbe6qDfkHy4q ---`);
  const trTxs = txs.filter(t => t.id?.includes('8uinidJhfbe6qDfkHy4q') || t.referenceId === '8uinidJhfbe6qDfkHy4q');
  trTxs.forEach(t => {
    console.log(JSON.stringify(t));
  });

  console.log(`\n--- Check if Mustafa made any sales or invoices after this transfer (date >= 2026-10-10) ---`);
  const recentSales = salesInvs.filter(s => (s.date >= '2026-10-10' || s.invoiceDate >= '2026-10-10') && (s.warehouseId === vehicleWhId || s.salesRepName?.includes('مصطفى')));
  console.log(`Found ${recentSales.length} sales invoices from car 1 / Mustafa since Oct 10:`);
  recentSales.forEach(s => {
    console.log(`Invoice: ${s.number || s.invoiceNumber}, Date: ${s.date}, WH: ${s.warehouseName || s.warehouseId}, Rep: ${s.salesRepName}, Total: ${s.total}`);
    (s.lines || s.items || []).forEach(l => {
      console.log(`   Line: ${l.productName || l.name}, Qty: ${l.qty || l.quantity}`);
    });
  });
}

inspectVehicleStock().catch(console.error);
