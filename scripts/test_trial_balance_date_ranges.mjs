import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const CID = 'idham-main';

async function testDateRanges() {
  console.log('=== TESTING TRIAL BALANCE DATE RANGES ===');

  const jeSnap = await getDocs(collection(db, `companies/${CID}/journalEntries`));
  const entries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Check date formats
  const dateFormats = new Set();
  let invalidDateCount = 0;
  entries.forEach(e => {
    const d = e.date;
    if (!d) {
      invalidDateCount++;
      return;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      dateFormats.add('YYYY-MM-DD');
    } else if (d.includes('T')) {
      dateFormats.add('ISO_DATETIME');
    } else {
      dateFormats.add(d.slice(0, 15));
    }
  });
  console.log('Date formats found in journal entries:', Array.from(dateFormats));
  console.log('Entries without date:', invalidDateCount);

  // Function to simulate renderTrialBalance for specific account and date range
  function getTrialBalanceForAccount(accCode, from, to) {
    let openBal = 0, transDr = 0, transCr = 0;

    for (const entry of entries) {
      // Normalization as done in code
      let d = (entry.date || '').slice(0, 10);
      for (const line of (entry.lines || [])) {
        const code = (line.accountCode || '').trim();
        const isMatch = code === accCode || code.startsWith(accCode + '-');
        if (!isMatch) continue;

        if (d < from) {
          openBal += (line.debit || 0) - (line.credit || 0);
        } else if (d >= from && d <= to) {
          transDr += line.debit || 0;
          transCr += line.credit || 0;
        }
      }
    }
    const closeBal = openBal + (transDr - transCr);
    return {
      openBal,
      openDr: openBal > 0 ? openBal : 0,
      openCr: openBal < 0 ? -openBal : 0,
      transDr,
      transCr,
      closeBal,
      closeDr: closeBal > 0 ? closeBal : 0,
      closeCr: closeBal < 0 ? -closeBal : 0,
    };
  }

  const periods = [
    { name: 'Year 2026 (All)', from: '2026-01-01', to: '2026-10-31' },
    { name: 'From July 1 to Today', from: '2026-07-01', to: '2026-10-31' },
    { name: 'October 2026 Only', from: '2026-10-01', to: '2026-10-31' },
    { name: 'Q3 2026 (Jul-Sep)', from: '2026-07-01', to: '2026-09-30' },
    { name: 'September 2026 Only', from: '2026-09-01', to: '2026-09-30' },
  ];

  console.log('\n--- OUTPUT VAT (2-1-3-1 & 2-1-3) Across Periods ---');
  for (const p of periods) {
    const tb = getTrialBalanceForAccount('2-1-3', p.from, p.to);
    console.log(`\nPeriod: ${p.name} [${p.from} to ${p.to}]`);
    console.log(`  Open: Dr=${tb.openDr.toFixed(2)}, Cr=${tb.openCr.toFixed(2)}`);
    console.log(`  Trans: Dr=${tb.transDr.toFixed(2)}, Cr=${tb.transCr.toFixed(2)}`);
    console.log(`  Close: Dr=${tb.closeDr.toFixed(2)}, Cr=${tb.closeCr.toFixed(2)}`);
  }

  console.log('\n--- INPUT VAT (1-1-5-2) Across Periods ---');
  for (const p of periods) {
    const tb = getTrialBalanceForAccount('1-1-5-2', p.from, p.to);
    console.log(`\nPeriod: ${p.name} [${p.from} to ${p.to}]`);
    console.log(`  Open: Dr=${tb.openDr.toFixed(2)}, Cr=${tb.openCr.toFixed(2)}`);
    console.log(`  Trans: Dr=${tb.transDr.toFixed(2)}, Cr=${tb.transCr.toFixed(2)}`);
    console.log(`  Close: Dr=${tb.closeDr.toFixed(2)}, Cr=${tb.closeCr.toFixed(2)}`);
  }

  // Compare with VAT report calculations for October vs Full Year
  const siSnap = await getDocs(collection(db, `companies/${CID}/salesInvoices`));
  const piSnap = await getDocs(collection(db, `companies/${CID}/purchaseInvoices`));
  const srSnap = await getDocs(collection(db, `companies/${CID}/salesReturns`));
  const prSnap = await getDocs(collection(db, `companies/${CID}/purchaseReturns`));

  const sales = siSnap.docs.map(d => d.data()).filter(d => d.status !== 'cancelled');
  const purchases = piSnap.docs.map(d => d.data()).filter(d => d.status !== 'cancelled');
  const salesRet = srSnap.docs.map(d => d.data()).filter(d => d.status !== 'cancelled');
  const purchRet = prSnap.docs.map(d => d.data()).filter(d => d.status !== 'cancelled');

  function getVatReportForPeriod(from, to) {
    const filterD = list => list.filter(item => {
      const d = (item.date || (item.createdAt?.toDate ? item.createdAt.toDate().toISOString().slice(0, 10) : '')).slice(0, 10);
      return (!from || d >= from) && (!to || d <= to);
    });

    const fSales = filterD(sales);
    const fPurchases = filterD(purchases);
    const fSalesRet = filterD(salesRet);
    const fPurchRet = filterD(purchRet);

    const sVat = fSales.reduce((s, i) => s + (parseFloat(i.totalVat || i.taxAmount || 0)), 0);
    const srVat = fSalesRet.reduce((s, i) => s + (parseFloat(i.totalVat || i.taxAmount || 0)), 0);
    const netOutputVat = sVat - srVat;

    const pVat = fPurchases.reduce((s, i) => s + (parseFloat(i.totalVat || i.taxAmount || 0)), 0);
    const prVat = fPurchRet.reduce((s, i) => s + (parseFloat(i.totalVat || i.taxAmount || 0)), 0);
    const netInputVat = pVat - prVat;

    return { sVat, srVat, netOutputVat, pVat, prVat, netInputVat, netPayable: netOutputVat - netInputVat };
  }

  console.log('\n--- VAT REPORT (ZATCA) Numbers Across Periods ---');
  for (const p of periods) {
    const rep = getVatReportForPeriod(p.from, p.to);
    console.log(`\nPeriod: ${p.name} [${p.from} to ${p.to}]`);
    console.log(`  Sales VAT: ${rep.sVat.toFixed(2)} - Sales Ret VAT: ${rep.srVat.toFixed(2)} = Net Output VAT: ${rep.netOutputVat.toFixed(2)}`);
    console.log(`  Purch VAT: ${rep.pVat.toFixed(2)} - Purch Ret VAT: ${rep.prVat.toFixed(2)} = Net Input VAT: ${rep.netInputVat.toFixed(2)}`);
    console.log(`  Net VAT: ${rep.netPayable.toFixed(2)} SAR (${rep.netPayable > 0 ? 'مستحق للسداد' : 'رصيد دائن / استرداد'})`);
  }

  process.exit(0);
}

testDateRanges().catch(err => {
  console.error(err);
  process.exit(1);
});
