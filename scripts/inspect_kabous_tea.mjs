import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectKabousTea() {
  console.log('--- Inspecting Product: شاي الكابوس (13006) ---');
  
  // 1. Get products
  const prodSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const tea = products.find(p => p.sku === '13006' || p.code === '13006' || (p.name && p.name.includes('الكابوس')));
  console.log('Product Doc:', JSON.stringify(tea, null, 2));

  if (!tea) {
    console.log('Tea product not found!');
    return;
  }

  const teaId = tea.id;
  const teaSku = tea.sku || tea.code;

  // 2. Get stockByWarehouse
  const stockSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
  const teaStocks = stockSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => s.productId === teaId || s.id.includes(teaId));
  console.log('Stock By Warehouse:', JSON.stringify(teaStocks, null, 2));

  // 3. Get stockTransactions
  const txSnap = await getDocs(collection(db, 'companies/idham-main/stockTransactions'));
  const teaTxs = txSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.productId === teaId || (t.items && t.items.some(i => i.productId === teaId)));
  console.log(`Found ${teaTxs.length} stock transactions:`);
  teaTxs.forEach(t => {
    console.log(`TX: Type=${t.type || t.transactionType}, Date=${t.date || t.createdAt}, Qty=${t.qty || t.quantity}, Ref=${t.refNumber || t.referenceNumber || t.invoiceNumber || t.documentNumber || t.id}`);
  });

  // 4. Get purchaseInvoices
  const piSnap = await getDocs(collection(db, 'companies/idham-main/purchaseInvoices'));
  const purchases = piSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('\n--- Purchase Invoices ---');
  purchases.forEach(pi => {
    if (pi.status === 'cancelled') return;
    const lines = pi.lines || pi.items || [];
    lines.forEach(l => {
      if (l.productId === teaId || (l.productName && l.productName.includes('الكابوس')) || l.sku === teaSku) {
        console.log(`PI: Inv#=${pi.invoiceNumber || pi.number || pi.id}, Date=${pi.date}, Supplier=${pi.supplierName}, Qty=${l.qty || l.quantity}, Unit=${l.unit}, Status=${pi.status}`);
      }
    });
  });

  // 5. Get salesInvoices
  const siSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const sales = siSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('\n--- Sales Invoices ---');
  sales.forEach(si => {
    if (si.status === 'cancelled') return;
    const lines = si.lines || si.items || [];
    lines.forEach(l => {
      if (l.productId === teaId || (l.productName && l.productName.includes('الكابوس')) || l.sku === teaSku) {
        console.log(`SI: Inv#=${si.invoiceNumber || si.number || si.id}, Date=${si.date}, Customer=${si.customerName}, Qty=${l.qty || l.quantity}, Unit=${l.unit}, Status=${si.status}`);
      }
    });
  });

  // 6. Get inventoryAdjustments
  const adjSnap = await getDocs(collection(db, 'companies/idham-main/inventoryAdjustments'));
  const adjs = adjSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('\n--- Inventory Adjustments ---');
  adjs.forEach(adj => {
    const items = adj.items || adj.lines || [];
    items.forEach(i => {
      if (i.productId === teaId || (i.productName && i.productName.includes('الكابوس'))) {
        console.log(`ADJ: ID=${adj.id}, Date=${adj.date}, Type=${adj.type}, Qty=${i.qty || i.quantity || i.difference || i.countedQty}`);
      }
    });
  });

  // 7. Get deliveryNotes
  const dnSnap = await getDocs(collection(db, 'companies/idham-main/deliveryNotes'));
  const dns = dnSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('\n--- Delivery Notes ---');
  dns.forEach(dn => {
    const lines = dn.lines || dn.items || [];
    lines.forEach(l => {
      if (l.productId === teaId || (l.productName && l.productName.includes('الكابوس'))) {
        console.log(`DN: Num=${dn.deliveryNumber || dn.number || dn.id}, Date=${dn.date}, Customer=${dn.customerName}, Qty=${l.qty || l.quantity}, Status=${dn.status}`);
      }
    });
  });
}

inspectKabousTea().catch(console.error);
