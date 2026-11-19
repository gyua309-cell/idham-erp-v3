import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectCustomersPerformance() {
  const [invSnap, retSnap, rcptSnap, custSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/receipts')),
    getDocs(collection(db, 'companies/idham-main/customers'))
  ]);

  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(i => i.date >= '2026-10-01' && i.date <= '2026-10-05' && i.status !== 'cancelled');

  const returns = retSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.date >= '2026-10-01' && r.date <= '2026-10-05' && r.status !== 'cancelled');

  const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.date >= '2026-10-01' && r.date <= '2026-10-05' && r.status !== 'cancelled');

  const customers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`October 1-5: ${invoices.length} Invoices, ${returns.length} Returns, ${receipts.length} Receipts.`);

  const map = {};
  invoices.forEach(inv => {
    const cid = inv.customerId || inv.customerName;
    if (!map[cid]) {
      const cDoc = customers.find(c => c.id === inv.customerId);
      map[cid] = {
        name: inv.customerName,
        totalWithVat: 0,
        subtotal: 0,
        vat: 0,
        cost: 0,
        paidOnInvs: 0,
        receipts: 0,
        currentBalance: cDoc?.balance || 0
      };
    }
    const c = map[cid];
    c.totalWithVat += parseFloat(inv.totalWithVat || inv.total || 0);
    c.subtotal += parseFloat(inv.subtotal || (parseFloat(inv.totalWithVat || inv.total || 0) / 1.15));
    c.vat += parseFloat(inv.vat || (parseFloat(inv.totalWithVat || 0) - parseFloat(inv.subtotal || 0)) || 0);
    c.cost += parseFloat(inv.totalCost || 0);
    c.paidOnInvs += parseFloat(inv.paidAmount || 0);
  });

  receipts.forEach(r => {
    const cid = r.targetId || r.customerId;
    if (map[cid]) {
      map[cid].receipts += parseFloat(r.amount || 0);
    }
  });

  const table = Object.values(map).map(c => {
    const profit = c.subtotal - c.cost;
    const profitPct = c.subtotal > 0 ? (profit / c.subtotal) * 100 : 0;
    const grossMarginPct = c.totalWithVat > 0 ? (profit / c.totalWithVat) * 100 : 0;
    const markupPct = c.cost > 0 ? (profit / c.cost) * 100 : 0;
    return {
      'العميل': c.name,
      'قبل الضريبة': Math.round(c.subtotal * 100) / 100,
      'الضريبة': Math.round(c.vat * 100) / 100,
      'شامل الضريبة': Math.round(c.totalWithVat * 100) / 100,
      'التكلفة': Math.round(c.cost * 100) / 100,
      'الربح (صافي)': Math.round(profit * 100) / 100,
      'هامش الربح % (قبل الضريبة)': profitPct.toFixed(2) + '%',
      'هامش الربح % (شامل)': grossMarginPct.toFixed(2) + '%',
      'المسدد': Math.round((c.paidOnInvs + c.receipts) * 100) / 100,
      'المتبقي للفترة': Math.round((c.totalWithVat - (c.paidOnInvs + c.receipts)) * 100) / 100,
      'رصيد العميل الكلي': c.currentBalance
    };
  });

  console.table(table);
}

inspectCustomersPerformance().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
