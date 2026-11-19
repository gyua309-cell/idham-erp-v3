import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function tracePurchases() {
  const [purchSnap, prodSnap, salesSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/salesInvoices'))
  ]);

  const purchases = purchSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status !== 'cancelled');
  purchases.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const sales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.status !== 'cancelled');

  const targetKeywords = ['نسرين', 'شروق', 'سكر الاسرة', 'سكر الأسرة', 'طحينة', 'المنيوم'];

  console.log('========================================================================');
  console.log('PURCHASE INVOICES HISTORY FOR TARGET PRODUCTS:');
  console.log('========================================================================');

  purchases.forEach(pi => {
    const lines = pi.lines || pi.items || [];
    lines.forEach(l => {
      const pName = l.productName || l.name || '';
      const matched = targetKeywords.some(kw => pName.includes(kw));
      if (matched) {
        const qty = parseFloat(l.qty || l.quantity || 1);
        const unitPrice = parseFloat(l.unitPrice || l.price || l.costPrice || 0);
        console.log(`[PURCHASE] Date: ${pi.date} | Inv#: ${pi.invoiceNumber || pi.number || pi.id} | Supplier: ${pi.supplierName}`);
        console.log(`   Product: ${pName} (ID: ${l.productId})`);
        console.log(`   Qty: ${qty} ${l.unit || ''} | Unit Purchase Price (قبل الضريبة): ${unitPrice} | Total: ${(qty * unitPrice).toFixed(2)}`);
      }
    });
  });

  console.log('\n========================================================================');
  console.log('PRODUCT MASTER CURRENT SETTINGS:');
  console.log('========================================================================');
  products.forEach(p => {
    const pName = p.name || '';
    const matched = targetKeywords.some(kw => pName.includes(kw));
    if (matched) {
      console.log(`Product: ${pName} (ID: ${p.id})`);
      console.log(`   costPrice: ${p.costPrice} | avgCost: ${p.avgCost} | avgCostPrice: ${p.avgCostPrice} | lastPurchasePrice: ${p.lastPurchasePrice} | price: ${p.price || p.sellingPrice}`);
    }
  });

  console.log('\n========================================================================');
  console.log('SALES INVOICES AROUND JULY 2026:');
  console.log('========================================================================');
  const targetSales = sales.filter(s => (s.customerName || '').includes('صبا المذاق') || (s.customerName || '').includes('فرح') || (s.customerName || '').includes('الصفا البخارى 2'));
  targetSales.forEach(si => {
    console.log(`[SALE] Date: ${si.date} | Inv#: ${si.number || si.invoiceNumber || si.id} | Cust: ${si.customerName} | Status: ${si.status}`);
    const lines = si.lines || si.items || [];
    lines.forEach(l => {
      console.log(`   Item: ${l.productName || l.name} | Qty: ${l.qty || l.quantity} | SalePrice: ${l.unitPrice || l.price} | LineSub: ${(parseFloat(l.qty||1) * parseFloat(l.unitPrice||0)).toFixed(2)} | RecordedCost: ${l.unitCost || l.costPrice}`);
    });
  });
}

tracePurchases().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
