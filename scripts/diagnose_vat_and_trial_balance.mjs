import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const CID = 'idham-main';

async function diagnose() {
  console.log('=== FORENSIC VAT & TRIAL BALANCE AUDIT ===');

  // 1. Fetch all sales invoices
  const siSnap = await getDocs(collection(db, `companies/${CID}/salesInvoices`));
  console.log(`Total Sales Invoices: ${siSnap.size}`);
  let siTotalTax = 0, siTotalSub = 0;
  const siByMonth = {};
  siSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled') return;
    const date = data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : 'unknown');
    const month = date.slice(0, 7);
    const vat = parseFloat(data.totalVat || data.taxAmount || 0);
    const sub = parseFloat(data.subtotal || data.netTotal || 0);
    siTotalTax += vat;
    siTotalSub += sub;
    if (!siByMonth[month]) siByMonth[month] = { count: 0, sub: 0, vat: 0 };
    siByMonth[month].count++;
    siByMonth[month].sub += sub;
    siByMonth[month].vat += vat;
  });

  console.log('\n--- Sales Invoices by Month ---');
  for (const m of Object.keys(siByMonth).sort()) {
    console.log(`  ${m}: count=${siByMonth[m].count}, subtotal=${siByMonth[m].sub.toFixed(2)}, vat=${siByMonth[m].vat.toFixed(2)}`);
  }
  console.log(`Total Sales VAT (active invoices): ${siTotalTax.toFixed(2)} SAR`);

  // 2. Fetch sales returns
  const srSnap = await getDocs(collection(db, `companies/${CID}/salesReturns`));
  console.log(`\nTotal Sales Returns: ${srSnap.size}`);
  let srTotalTax = 0;
  const srByMonth = {};
  srSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled') return;
    const date = data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : 'unknown');
    const month = date.slice(0, 7);
    const vat = parseFloat(data.totalVat || data.taxAmount || 0);
    srTotalTax += vat;
    if (!srByMonth[month]) srByMonth[month] = { count: 0, vat: 0 };
    srByMonth[month].count++;
    srByMonth[month].vat += vat;
  });
  for (const m of Object.keys(srByMonth).sort()) {
    console.log(`  ${m}: count=${srByMonth[m].count}, vat=${srByMonth[m].vat.toFixed(2)}`);
  }
  console.log(`Total Sales Returns VAT: ${srTotalTax.toFixed(2)} SAR`);

  // 3. Fetch purchase invoices
  const piSnap = await getDocs(collection(db, `companies/${CID}/purchaseInvoices`));
  console.log(`\nTotal Purchase Invoices: ${piSnap.size}`);
  let piTotalTax = 0, piTotalSub = 0;
  const piByMonth = {};
  piSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled') return;
    const date = data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : 'unknown');
    const month = date.slice(0, 7);
    const vat = parseFloat(data.totalVat || data.taxAmount || 0);
    const sub = parseFloat(data.subtotal || data.taxableSubtotal || 0);
    piTotalTax += vat;
    piTotalSub += sub;
    if (!piByMonth[month]) piByMonth[month] = { count: 0, sub: 0, vat: 0 };
    piByMonth[month].count++;
    piByMonth[month].sub += sub;
    piByMonth[month].vat += vat;
  });
  console.log('\n--- Purchase Invoices by Month ---');
  for (const m of Object.keys(piByMonth).sort()) {
    console.log(`  ${m}: count=${piByMonth[m].count}, subtotal=${piByMonth[m].sub.toFixed(2)}, vat=${piByMonth[m].vat.toFixed(2)}`);
  }
  console.log(`Total Purchase VAT (active invoices): ${piTotalTax.toFixed(2)} SAR`);

  // 4. Fetch purchase returns
  const prSnap = await getDocs(collection(db, `companies/${CID}/purchaseReturns`));
  console.log(`\nTotal Purchase Returns: ${prSnap.size}`);
  let prTotalTax = 0;
  const prByMonth = {};
  prSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled') return;
    const date = data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : 'unknown');
    const month = date.slice(0, 7);
    const vat = parseFloat(data.totalVat || data.taxAmount || 0);
    prTotalTax += vat;
    if (!prByMonth[month]) prByMonth[month] = { count: 0, vat: 0 };
    prByMonth[month].count++;
    prByMonth[month].vat += vat;
  });
  for (const m of Object.keys(prByMonth).sort()) {
    console.log(`  ${m}: count=${prByMonth[m].count}, vat=${prByMonth[m].vat.toFixed(2)}`);
  }
  console.log(`Total Purchase Returns VAT: ${prTotalTax.toFixed(2)} SAR`);

  // 5. Fetch journal entries touching VAT accounts
  const jeSnap = await getDocs(collection(db, `companies/${CID}/journalEntries`));
  console.log(`\nTotal Journal Entries: ${jeSnap.size}`);
  let jeVatOutDr = 0, jeVatOutCr = 0;
  let jeVatInDr = 0, jeVatInCr = 0;

  const vatOutByMonth = {};
  const vatInByMonth = {};
  const allVatByAccount = {};

  jeSnap.forEach(d => {
    const je = d.data();
    const date = je.date || 'unknown';
    const month = date.slice(0, 7);

    for (const l of (je.lines || [])) {
      const code = (l.accountCode || '').trim();
      const dr = parseFloat(l.debit || 0);
      const cr = parseFloat(l.credit || 0);

      if (!allVatByAccount[code]) allVatByAccount[code] = { name: l.accountName || '', dr: 0, cr: 0 };
      allVatByAccount[code].dr += dr;
      allVatByAccount[code].cr += cr;

      // Check account codes
      if (code === '2-1-3-1' || code === '2-1-3') {
        jeVatOutDr += dr;
        jeVatOutCr += cr;
        if (!vatOutByMonth[month]) vatOutByMonth[month] = { dr: 0, cr: 0, count: 0 };
        vatOutByMonth[month].dr += dr;
        vatOutByMonth[month].cr += cr;
        vatOutByMonth[month].count++;
      } else if (code === '1-1-5-2' || code === '1-1-5') {
        jeVatInDr += dr;
        jeVatInCr += cr;
        if (!vatInByMonth[month]) vatInByMonth[month] = { dr: 0, cr: 0, count: 0 };
        vatInByMonth[month].dr += dr;
        vatInByMonth[month].cr += cr;
        vatInByMonth[month].count++;
      }
    }
  });

  console.log('\n--- Journal Entries Output VAT (2-1-3-1) by Month ---');
  for (const m of Object.keys(vatOutByMonth).sort()) {
    console.log(`  ${m}: count=${vatOutByMonth[m].count}, Debit=${vatOutByMonth[m].dr.toFixed(2)}, Credit=${vatOutByMonth[m].cr.toFixed(2)}, NetCr=${(vatOutByMonth[m].cr - vatOutByMonth[m].dr).toFixed(2)}`);
  }
  console.log(`Total JE Output VAT (2-1-3-1): Dr=${jeVatOutDr.toFixed(2)}, Cr=${jeVatOutCr.toFixed(2)}, NetCredit=${(jeVatOutCr - jeVatOutDr).toFixed(2)} SAR`);

  console.log('\n--- Journal Entries Input VAT (1-1-5-2) by Month ---');
  for (const m of Object.keys(vatInByMonth).sort()) {
    console.log(`  ${m}: count=${vatInByMonth[m].count}, Debit=${vatInByMonth[m].dr.toFixed(2)}, Credit=${vatInByMonth[m].cr.toFixed(2)}, NetDr=${(vatInByMonth[m].dr - vatInByMonth[m].cr).toFixed(2)}`);
  }
  console.log(`Total JE Input VAT (1-1-5-2): Dr=${jeVatInDr.toFixed(2)}, Cr=${jeVatInCr.toFixed(2)}, NetDebit=${(jeVatInDr - jeVatInCr).toFixed(2)} SAR`);

  console.log('\n--- VAT-related Accounts in Chart of Accounts ---');
  for (const [code, val] of Object.entries(allVatByAccount)) {
    if (code.startsWith('2-1-3') || code.startsWith('1-1-5') || val.name.includes('ضريب') || val.name.includes('VAT')) {
      console.log(`  ${code} (${val.name}): Dr=${val.dr.toFixed(2)}, Cr=${val.cr.toFixed(2)}, Net=${(val.dr - val.cr).toFixed(2)}`);
    }
  }

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
