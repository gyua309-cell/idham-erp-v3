import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectTransfer() {
  console.log('--- 1. Fetching Collections ---');
  const [
    transfersSnap,
    warehousesSnap,
    stockByWhSnap,
    productsSnap,
    txsSnap
  ] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/stockTransfers')),
    getDocs(collection(db, 'companies/idham-main/warehouses')),
    getDocs(collection(db, 'companies/idham-main/stockByWarehouse')),
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions'))
  ]);

  const transfers = transfersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const warehouses = warehousesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const stockByWh = stockByWhSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const txs = txsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Transfers: ${transfers.length}, Warehouses: ${warehouses.length}, StockByWarehouse: ${stockByWh.length}, Products: ${products.length}, Transactions: ${txs.length}`);

  // Find warehouses
  console.log('\n--- Warehouses ---');
  warehouses.forEach(w => {
    console.log(`WH: id=${w.id}, code=${w.code}, name=${w.name}, type=${w.type}, repId=${w.repId || w.salesRepId}`);
  });

  // Find target transfer
  console.log('\n--- Search Transfer REQ-57201816 ---');
  const targetTransfer = transfers.find(t => 
    t.transferNumber === 'REQ-57201816' ||
    t.number === 'REQ-57201816' ||
    t.refNumber === 'REQ-57201816' ||
    t.requestNumber === 'REQ-57201816' ||
    t.id === 'REQ-57201816' ||
    JSON.stringify(t).includes('57201816')
  );

  if (targetTransfer) {
    console.log('Target Transfer FOUND:');
    console.log(JSON.stringify(targetTransfer, null, 2));
  } else {
    console.log('Transfer REQ-57201816 NOT found directly by number. Listing all transfers:');
    transfers.forEach(t => {
      console.log(`TR: id=${t.id}, num=${t.transferNumber || t.number || t.refNumber}, from=${t.fromWarehouseName || t.sourceWarehouseId}, to=${t.toWarehouseName || t.targetWarehouseId}, status=${t.status}, date=${t.date}`);
    });
  }

  // Find the target products
  console.log('\n--- Target Products ---');
  const searchSkus = ['02009', '03002', 'PRD-30692', 'PRD-37612'];
  const targetProds = products.filter(p => 
    searchSkus.includes(p.sku) || 
    searchSkus.includes(p.barcode) ||
    searchSkus.includes(p.id) ||
    (p.name && (p.name.includes('15/1000') || p.name.includes('18/2000') || p.name.includes('اوماكو') || p.name.includes('زيت تنك')))
  );

  targetProds.forEach(p => {
    console.log(`Product: id=${p.id}, sku=${p.sku}, barcode=${p.barcode}, name=${p.name}, unit=${p.unit}, stockQty=${p.stockQty}, totalQty=${p.totalQty}`);
  });

  // Check StockByWarehouse for these products
  console.log('\n--- Stock By Warehouse for Target Products ---');
  targetProds.forEach(p => {
    console.log(`\n>> Product: ${p.name} (id: ${p.id}, sku: ${p.sku}):`);
    const records = stockByWh.filter(sbw => sbw.productId === p.id || sbw.id?.includes(p.id));
    if (records.length === 0) {
      console.log('   No records in stockByWarehouse!');
    } else {
      records.forEach(r => {
        const wh = warehouses.find(w => w.id === r.warehouseId);
        console.log(`   WH: ${wh?.name || r.warehouseId} (id: ${r.warehouseId}) -> Qty: ${r.qty || r.quantity || r.stockQty}`);
      });
    }
  });

  // Check transactions for target transfer or target products
  console.log('\n--- Related Stock Transactions ---');
  const relatedTxs = txs.filter(t => 
    JSON.stringify(t).includes('57201816') ||
    (targetTransfer && t.referenceId === targetTransfer.id) ||
    (targetTransfer && t.transferId === targetTransfer.id)
  );

  console.log(`Found ${relatedTxs.length} transactions related to this transfer.`);
  relatedTxs.forEach(t => {
    console.log(`TX: id=${t.id}, date=${t.date}, type=${t.type}, prod=${t.productName || t.productId}, wh=${t.warehouseId}, delta=${t.qtyDelta || t.qty}`);
  });
}

inspectTransfer().catch(console.error);
