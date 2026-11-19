import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectButterAndWater() {
  const [prodSnap, txSnap, dnSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/stockTransactions')),
    getDocs(collection(db, 'companies/idham-main/deliveryNotes'))
  ]);

  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const dns = dnSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const butter = products.find(p => (p.sku === '02022' || p.code === '02022' || (p.name && p.name.includes('بلو ريفر'))));
  console.log('Butter Doc:', JSON.stringify(butter, null, 2));

  if (butter) {
    const butterTxs = txs.filter(t => t.productId === butter.id);
    console.log(`\nButter (${butter.id}) Transactions (${butterTxs.length}):`);
    butterTxs.forEach(t => {
      console.log(`TX: Type=${t.type}, Date=${t.date}, QtyChange=${t.qtyChange}, Before=${t.qtyBefore}, After=${t.qtyAfter}, Ref=${t.documentNumber || t.refNumber || t.invoiceNumber || t.refId}, Notes=${t.notes}`);
    });
  }

  console.log('\n--- Safa Water Products & Transactions ---');
  const safaProds = products.filter(p => p.name && p.name.includes('صفا'));
  safaProds.forEach(p => {
    const pTxs = txs.filter(t => t.productId === p.id);
    console.log(`Safa [${p.sku}] ${p.name} (ID: ${p.id}): ${pTxs.length} txs`);
    pTxs.forEach(t => {
      console.log(`   TX: Type=${t.type}, Date=${t.date}, QtyChange=${t.qtyChange}, Before=${t.qtyBefore}, After=${t.qtyAfter}, Ref=${t.documentNumber || t.invoiceNumber}, Notes=${t.notes}`);
    });
  });

  console.log(`\n--- Delivery Notes (${dns.length}) ---`);
  dns.forEach(dn => {
    console.log(`DN: Num=${dn.deliveryNumber || dn.number || dn.id}, Date=${dn.date}, Customer=${dn.customerName}, Status=${dn.status}, DeliveryStatus=${dn.deliveryStatus}, StockDeducted=${dn.stockDeducted}, InvId=${dn.salesInvoiceId || dn.invoiceId}`);
    const lines = dn.lines || dn.items || [];
    lines.forEach(l => {
      console.log(`   Item: ${l.productName || l.name} | Qty: ${l.qty || l.quantity}`);
    });
  });
}

inspectButterAndWater().catch(console.error);
