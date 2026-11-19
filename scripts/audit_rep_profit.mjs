import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  authDomain:        'idham-b3a7e.firebaseapp.com',
  projectId:         'idham-b3a7e',
  storageBucket:     'idham-b3a7e.firebasestorage.app',
  messagingSenderId: '915839133333',
  appId:             '1:915839133333:web:fe472e01993025f08a9d9c',
  measurementId:     'G-Y797B0GWYK'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runCostAudit() {
  const [invSnap, retSnap, prodSnap, repSnap] = await Promise.all([
    getDocs(query(collection(db, 'companies/idham-main/salesInvoices'), where('date', '>=', '2026-10-01'), where('date', '<=', '2026-10-10'))),
    getDocs(query(collection(db, 'companies/idham-main/salesReturns'), where('date', '>=', '2026-10-01'), where('date', '<=', '2026-10-10'))),
    getDocs(collection(db, 'companies/idham-main/products')),
    getDocs(collection(db, 'companies/idham-main/salesReps'))
  ]);

  const prodMap = {};
  prodSnap.forEach(d => {
    const data = d.data();
    prodMap[d.id] = data;
    if (data.name) prodMap[data.name] = data;
  });

  const repMap = {};
  repSnap.forEach(d => { repMap[d.id] = d.data().name; });

  const getCost = (docObj) => {
    const lines = docObj.lines || docObj.items || [];
    if (lines.length === 0) return parseFloat(docObj.totalCost || 0);
    let total = 0;
    lines.forEach(l => {
      const qty = parseFloat(l.qty || l.quantity || 1);
      const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
      const unitCost = parseFloat(
        l.costPrice !== undefined && l.costPrice > 0 ? l.costPrice :
        l.purchasePrice !== undefined && l.purchasePrice > 0 ? l.purchasePrice :
        l.unitCost !== undefined && l.unitCost > 0 ? l.unitCost :
        (p?.costPrice || p?.purchasePrice || p?.avgCostPrice || p?.lastPurchasePrice || 0)
      );
      total += (qty * unitCost);
    });
    return total;
  };

  const repAudit = {};

  invSnap.forEach(d => {
    const inv = d.data();
    if (inv.status === 'cancelled') return;
    const rid = inv.repId || 'unknown';
    const rname = repMap[rid] || inv.repName || rid;
    if (!repAudit[rid]) repAudit[rid] = { name: rname, gross: 0, sub: 0, cost: 0, retGross: 0, retSub: 0, retCost: 0, count: 0 };
    
    const gross = parseFloat(inv.totalWithVat || inv.total || 0);
    const sub   = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (gross / 1.15));
    const cost  = getCost(inv);

    repAudit[rid].gross += gross;
    repAudit[rid].sub += sub;
    repAudit[rid].cost += cost;
    repAudit[rid].count++;
  });

  retSnap.forEach(d => {
    const ret = d.data();
    if (ret.status === 'cancelled') return;
    const rid = ret.repId || ret.salesRepId || 'unknown';
    if (!repAudit[rid]) {
      const rname = repMap[rid] || ret.repName || rid;
      repAudit[rid] = { name: rname, gross: 0, sub: 0, cost: 0, retGross: 0, retSub: 0, retCost: 0, count: 0 };
    }
    const gross = parseFloat(ret.totalWithVat || ret.total || 0);
    const sub   = parseFloat(ret.subtotal !== undefined ? ret.subtotal : (gross / 1.15));
    const cost  = getCost(ret);

    repAudit[rid].retGross += gross;
    repAudit[rid].retSub += sub;
    repAudit[rid].retCost += cost;
  });

  console.log('=== AUDIT RESULTS FOR 2026-10-01 to 2026-10-10 ===');
  let companyNetSub = 0, companyNetCost = 0;
  for (const [rid, data] of Object.entries(repAudit)) {
    const netSalesGross = data.gross - data.retGross;
    const netSalesSub = data.sub - data.retSub;
    const netCost = data.cost - data.retCost;
    const grossProfit = netSalesSub - netCost;
    const marginPct = netSalesSub > 0 ? (grossProfit / netSalesSub * 100) : 0;
    
    companyNetSub += netSalesSub;
    companyNetCost += netCost;

    console.log(`Rep: ${data.name} (${rid})`);
    console.log(`  Sales (incl VAT): ${netSalesGross.toFixed(2)} | Subtotal (excl VAT): ${netSalesSub.toFixed(2)} | Invoices: ${data.count}`);
    console.log(`  COGS: ${netCost.toFixed(2)} | Gross Profit: ${grossProfit.toFixed(2)} | Margin: ${marginPct.toFixed(2)}%`);
  }

  const compProfit = companyNetSub - companyNetCost;
  const compMargin = companyNetSub > 0 ? (compProfit / companyNetSub * 100) : 0;
  console.log('--- COMPANY TOTAL ---');
  console.log(`  Net Sales Sub: ${companyNetSub.toFixed(2)} | Total COGS: ${companyNetCost.toFixed(2)}`);
  console.log(`  Total Gross Profit: ${compProfit.toFixed(2)} | Overall Margin: ${compMargin.toFixed(2)}%`);
  process.exit(0);
}
runCostAudit();
