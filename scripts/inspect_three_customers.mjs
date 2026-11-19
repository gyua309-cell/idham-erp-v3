import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = 'idham-main';

async function inspect() {
  const targetNames = ['صبا المذاق', 'فرح', 'الصفا البخارى 2', 'الصفا البخاري 2'];
  
  const [invoicesSnap, returnsSnap, productsSnap] = await Promise.all([
    getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/products`))
  ]);
  
  const prodMap = {};
  productsSnap.docs.forEach(d => {
    const data = d.data();
    prodMap[d.id] = { id: d.id, ...data };
    if (data.name) prodMap[data.name] = { id: d.id, ...data };
  });

  const invoices = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const returns = returnsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const nameQuery of targetNames) {
    console.log(`\n========================================================================`);
    console.log(`QUERY: ${nameQuery}`);
    console.log(`========================================================================`);
    
    const matchedInvoices = invoices.filter(i => (i.customerName || '').includes(nameQuery) && i.status !== 'cancelled');
    const matchedReturns = returns.filter(r => (r.customerName || '').includes(nameQuery) && r.status !== 'cancelled');

    console.log(`Matched Invoices: ${matchedInvoices.length} | Returns: ${matchedReturns.length}`);

    let totalSub = 0;
    let totalCost = 0;

    for (const inv of matchedInvoices) {
      console.log(`\n  INVOICE: ${inv.number || inv.invoiceNumber || inv.id} | Date: ${inv.date} | Customer: ${inv.customerName} | Status: ${inv.status} | Rep: ${inv.repName}`);
      console.log(`    Subtotal: ${inv.subtotal} | Tax: ${inv.taxAmount || inv.totalVat || inv.vat} | TotalWithVat: ${inv.totalWithVat || inv.total} | TotalCost: ${inv.totalCost}`);
      
      const lines = inv.lines || inv.items || [];
      lines.forEach((l, idx) => {
        const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
        const lineQty = parseFloat(l.qty || l.quantity || 1);
        const linePrice = parseFloat(l.unitPrice || l.price || 0);
        const lineSub = lineQty * linePrice;
        const lineUnitCost = parseFloat(l.unitCost !== undefined ? l.unitCost : (l.costPrice !== undefined ? l.costPrice : (p?.costPrice || 0)));
        const lineTotalCost = lineQty * lineUnitCost;
        const lineProfit = lineSub - lineTotalCost;
        const lineMargin = lineSub > 0 ? (lineProfit / lineSub * 100) : 0;

        console.log(`    Line ${idx + 1}: ${l.productName || l.name}`);
        console.log(`      Qty: ${lineQty} ${l.unit || ''} | UnitPrice (قبل الضريبة): ${linePrice} | TotalLineSub: ${lineSub.toFixed(2)}`);
        console.log(`      UnitCost: ${lineUnitCost} | LineCost: ${lineTotalCost.toFixed(2)} | LineProfit: ${lineProfit.toFixed(2)} (${lineMargin.toFixed(2)}%)`);
        console.log(`      ProductMaster Info: costPrice=${p?.costPrice} | avgCost=${p?.avgCost} | avgCostPrice=${p?.avgCostPrice} | lastPurchasePrice=${p?.lastPurchasePrice} | sellingPrice=${p?.sellingPrice}`);
      });

      totalSub += parseFloat(inv.subtotal || 0);
      totalCost += parseFloat(inv.totalCost || 0);
    }

    for (const ret of matchedReturns) {
      console.log(`\n  RETURN: ${ret.number || ret.creditNoteNumber || ret.id} | Date: ${ret.date} | Customer: ${ret.customerName} | Status: ${ret.status}`);
      console.log(`    Subtotal: ${ret.subtotal} | TotalWithVat: ${ret.totalWithVat || ret.total} | TotalCost: ${ret.totalCost}`);
      const lines = ret.lines || ret.items || [];
      lines.forEach((l, idx) => {
        const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
        const lineQty = parseFloat(l.qty || l.quantity || 1);
        const linePrice = parseFloat(l.unitPrice || l.price || 0);
        const lineSub = lineQty * linePrice;
        const lineUnitCost = parseFloat(l.unitCost !== undefined ? l.unitCost : (l.costPrice !== undefined ? l.costPrice : (p?.costPrice || 0)));
        const lineTotalCost = lineQty * lineUnitCost;

        console.log(`    Line ${idx + 1}: ${l.productName || l.name}`);
        console.log(`      Qty: ${lineQty} | UnitPrice: ${linePrice} | LineSub: ${lineSub.toFixed(2)}`);
        console.log(`      UnitCost: ${lineUnitCost} | LineCost: ${lineTotalCost.toFixed(2)}`);
        console.log(`      ProductMaster Info: costPrice=${p?.costPrice} | avgCostPrice=${p?.avgCostPrice}`);
      });
      totalSub -= parseFloat(ret.subtotal || 0);
      totalCost -= parseFloat(ret.totalCost || 0);
    }

    const netProfit = totalSub - totalCost;
    const margin = totalSub > 0 ? (netProfit / totalSub * 100) : 0;
    console.log(`\n>>> NET FOR ${nameQuery}:`);
    console.log(`    Net Subtotal: ${totalSub.toFixed(2)} | Net Cost: ${totalCost.toFixed(2)} | Net Profit: ${netProfit.toFixed(2)} | Margin: ${margin.toFixed(2)}%`);
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
