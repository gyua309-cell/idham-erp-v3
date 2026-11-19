import admin from 'firebase-admin';
import fs from 'fs';

const sa = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function check() {
  const custsSnap = await db.collection('companies/company_1/customers').get();
  console.log('Total customers in Firestore:', custsSnap.size);
  const custs = custsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const invsSnap = await db.collection('companies/company_1/salesInvoices').get();
  const rcptsSnap = await db.collection('companies/company_1/receipts').get();
  const retsSnap = await db.collection('companies/company_1/salesReturns').get();

  const invsByCust = {};
  invsSnap.forEach(d => {
    const data = d.data();
    const cid = data.customerId;
    if (!cid) return;
    if (!invsByCust[cid]) invsByCust[cid] = [];
    invsByCust[cid].push(data);
  });

  const rcptsByCust = {};
  rcptsSnap.forEach(d => {
    const data = d.data();
    const cid = data.targetId || data.customerId;
    if (!cid) return;
    if (!rcptsByCust[cid]) rcptsByCust[cid] = [];
    rcptsByCust[cid].push(data);
  });

  const retsByCust = {};
  retsSnap.forEach(d => {
    const data = d.data();
    const cid = data.customerId;
    if (!cid) return;
    if (!retsByCust[cid]) retsByCust[cid] = [];
    retsByCust[cid].push(data);
  });

  console.log('\n--- CUSTOMERS AUDIT ---');
  let diffCount = 0;
  for (const c of custs) {
    const cInvs = invsByCust[c.id] || [];
    const cRcpts = rcptsByCust[c.id] || [];
    const cRets = retsByCust[c.id] || [];

    const totInv = cInvs.reduce((sum, x) => sum + Number(x.totalWithVat || x.total || 0), 0);
    const totRcpt = cRcpts.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const totRet = cRets.reduce((sum, x) => sum + Number(x.totalWithVat || x.total || 0), 0);
    const openBal = Number(c.openingBalance || 0);

    const calculatedBalance = Math.round((openBal + totInv - totRcpt - totRet) * 100) / 100;
    const storedBalance = Math.round(Number(c.balance || 0) * 100) / 100;

    const diff = Math.abs(storedBalance - calculatedBalance);
    if (diff > 0.05 || c.name.includes('البرنس') || c.name.includes('عيش')) {
      diffCount++;
      console.log(`Cust: ${c.name} (${c.code || c.id}) [Rep: ${c.repName || c.salesRepName || 'none'}]`);
      console.log(`   Stored c.balance in DB: ${storedBalance}`);
      console.log(`   Invoices sum: ${totInv.toFixed(2)} (${cInvs.length} invoices)`);
      console.log(`   Receipts sum: ${totRcpt.toFixed(2)} (${cRcpts.length} receipts)`);
      console.log(`   Returns sum:  ${totRet.toFixed(2)} (${cRets.length} returns)`);
      console.log(`   Calculated Ledger Balance: ${calculatedBalance.toFixed(2)}`);
      console.log(`   DIFF: ${(storedBalance - calculatedBalance).toFixed(2)}\n`);
    }
  }
  console.log(`Total customers with discrepancy: ${diffCount}`);
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
