import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function analyzeAugust() {
  const [invSnap, retSnap, jeSnap, expSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/salesInvoices')),
    getDocs(collection(db, 'companies/idham-main/salesReturns')),
    getDocs(collection(db, 'companies/idham-main/journalEntries')),
    getDocs(collection(db, 'companies/idham-main/expenses')),
    getDocs(collection(db, 'companies/idham-main/chartOfAccounts'))
  ]);

  const coa = {};
  coaSnap.forEach(d => { coa[d.data().code] = d.data().name; coa[d.id] = d.data().name; });

  let augRev = 0, augRet = 0, augCogs = 0, augExpenses = {};

  jeSnap.forEach(d => {
    const data = d.data();
    const dt = data.date || '';
    if (dt >= '2026-08-01' && dt <= '2026-08-31') {
      (data.lines || []).forEach(l => {
        const code = l.accountCode || '';
        const dr = parseFloat(l.debit) || 0;
        const cr = parseFloat(l.credit) || 0;

        if (code === '4-1-1' || code.startsWith('4-1-1')) {
          augRev += (cr - dr);
        } else if (code === '4-1-2' || code.startsWith('4-1-2')) {
          augRet += (dr - cr);
        } else if (code === '5-1-8' || code === '5-1-7' || code === '5-1-3' || (code.startsWith('5-1-') && !code.startsWith('5-1-1'))) {
          augCogs += (dr - cr);
        } else if (code.startsWith('5-') && !code.startsWith('5-1-1') && !code.startsWith('5-1-8')) {
          const expAmt = dr - cr;
          if (expAmt !== 0) {
            const accName = l.accountName || coa[code] || code;
            augExpenses[accName] = (augExpenses[accName] || 0) + expAmt;
          }
        }
      });
    }
  });

  const netRev = augRev - augRet;
  let totalFixed = 0;
  for (const [k, v] of Object.entries(augExpenses)) {
    totalFixed += v;
  }

  const grossProfit = netRev - augCogs;
  const cmRatio = netRev > 0 ? (grossProfit / netRev) : 0;
  const breakEvenSales = cmRatio > 0 ? (totalFixed / cmRatio) : 0;
  const marginOfSafety = netRev > 0 ? ((netRev - breakEvenSales) / netRev) * 100 : 0;
  const beDays = netRev > 0 ? Math.round((breakEvenSales / (netRev / 31))) : 0;

  console.log('=== AUGUST 2026 FINANCIAL AUDIT ===');
  console.log('Gross Revenue 4-1-1:', augRev.toFixed(2));
  console.log('Sales Returns 4-1-2:', augRet.toFixed(2));
  console.log('Net Revenue:', netRev.toFixed(2));
  console.log('COGS 5-1-8 (Variable Cost):', augCogs.toFixed(2));
  console.log('Gross Profit (Contribution Margin):', grossProfit.toFixed(2));
  console.log('Contribution Margin Ratio (CM%):', (cmRatio * 100).toFixed(2) + '%');
  console.log('-----------------------------------');
  console.log('Operating / Fixed Expenses:');
  for (const [k, v] of Object.entries(augExpenses)) {
    console.log(`  - ${k}: ${v.toFixed(2)} ر.س`);
  }
  console.log('Total Fixed Expenses:', totalFixed.toFixed(2), 'ر.س');
  console.log('-----------------------------------');
  console.log('Break-Even Point in Sales (نقطة التعادل بالريال):', breakEvenSales.toFixed(2), 'ر.س');
  console.log('Break-Even Day of Month (يوم تحقيق التعادل):', beDays, 'من أصل 31 يوم');
  console.log('Margin of Safety (هامش الأمان فوق التعادل):', marginOfSafety.toFixed(2) + '%');
  console.log('Net Profit in August:', (grossProfit - totalFixed).toFixed(2), 'ر.س');

  process.exit(0);
}
analyzeAugust();
