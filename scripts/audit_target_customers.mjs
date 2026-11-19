const API_KEY  = "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY";
const PROJECT  = "idham-b3a7e";
const BASE     = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function parseFields(fields = {}) {
  const r = {};
  for (const [k, v] of Object.entries(fields)) {
    if      (v.stringValue  !== undefined) r[k] = v.stringValue;
    else if (v.doubleValue  !== undefined) r[k] = v.doubleValue;
    else if (v.integerValue !== undefined) r[k] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) r[k] = v.booleanValue;
    else if (v.arrayValue)                r[k] = (v.arrayValue.values||[]).map(x=>parseFields(x.mapValue?.fields||{}));
    else if (v.mapValue)                  r[k] = parseFields(v.mapValue.fields||{});
    else r[k] = null;
  }
  return r;
}

async function getAllPages(collPath) {
  let allDocs = [];
  let pageToken = null;
  do {
    let url = `${BASE}/${collPath}?key=${API_KEY}&pageSize=300`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.error) {
      console.error(`Error fetching ${collPath}:`, data.error);
      return [];
    }
    const docs = (data.documents || []).map(d => ({
      id: d.name.split('/').pop(),
      ...parseFields(d.fields || {})
    }));
    allDocs = allDocs.concat(docs);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return allDocs;
}

async function run() {
  // First, find company id
  const rootCompanies = await getAllPages("companies");
  console.log("Companies found:", rootCompanies.map(c => c.id));
  const compId = rootCompanies[0]?.id || "idham-main";
  console.log("Using companyId:", compId);

  const [customers, invoices, receipts, returns, jes] = await Promise.all([
    getAllPages(`companies/${compId}/customers`),
    getAllPages(`companies/${compId}/salesInvoices`),
    getAllPages(`companies/${compId}/receipts`),
    getAllPages(`companies/${compId}/salesReturns`),
    getAllPages(`companies/${compId}/journalEntries`)
  ]);

  console.log(`Loaded: ${customers.length} customers, ${invoices.length} invoices, ${receipts.length} receipts, ${returns.length} returns, ${jes.length} JEs`);

  const prince = customers.find(c => (c.name || '').includes('البرنس'));
  const aish = customers.find(c => (c.name || '').includes('عيش'));
  const rowad = customers.find(c => (c.name || '').includes('رواد'));

  console.log("\n--- TARGET CUSTOMERS ---");
  for (const c of [prince, aish, rowad].filter(Boolean)) {
    console.log(`\n================== Customer: ${c.name} (ID: ${c.id}, Code: ${c.code}) ==================`);
    console.log(`Stored c.balance: ${c.balance}, openingBalance: ${c.openingBalance}`);

    const cInvs = invoices.filter(i => i.customerId === c.id || (i.customerName && i.customerName.trim() === c.name.trim()));
    const cRcpts = receipts.filter(r => r.targetId === c.id || r.customerId === c.id || (r.customerName && r.customerName.trim() === c.name.trim()));
    const cRets = returns.filter(r => r.customerId === c.id || (r.customerName && r.customerName.trim() === c.name.trim()));

    console.log(`Invoices count: ${cInvs.length}`);
    let sumInvs = 0;
    cInvs.forEach(i => {
      const tot = Number(i.totalWithVat || i.total || 0);
      sumInvs += tot;
      console.log(`  [Invoice] Date: ${i.date}, No: ${i.invoiceNumber || i.number || i.id}, Tot: ${tot}, PayMethod: ${i.paymentMethod}, remainingAmount: ${i.remainingAmount}`);
    });

    console.log(`Receipts count: ${cRcpts.length}`);
    let sumRcpts = 0;
    cRcpts.forEach(r => {
      const amt = Number(r.amount || 0);
      sumRcpts += amt;
      console.log(`  [Receipt] Date: ${r.date}, No: ${r.receiptNumber || r.number || r.id}, Amt: ${amt}, Method: ${r.method}`);
    });

    console.log(`Returns count: ${cRets.length}`);
    let sumRets = 0;
    cRets.forEach(r => {
      const tot = Number(r.totalWithVat || r.total || 0);
      sumRets += tot;
      console.log(`  [Return] Date: ${r.date}, No: ${r.creditNoteNumber || r.number || r.id}, Tot: ${tot}`);
    });

    const openBal = Number(c.openingBalance || 0);
    const calculatedLedgerBal = openBal + sumInvs - sumRcpts - sumRets;
    console.log(`\n>>> SUMMARY for ${c.name}:`);
    console.log(`    Opening: ${openBal}`);
    console.log(`    + Invoices: ${sumInvs.toFixed(2)}`);
    console.log(`    - Receipts: ${sumRcpts.toFixed(2)}`);
    console.log(`    - Returns:  ${sumRets.toFixed(2)}`);
    console.log(`    = Statement / Ledger Balance: ${calculatedLedgerBal.toFixed(2)}`);
    console.log(`    Stored c.balance: ${c.balance}`);
  }
}

run().catch(console.error);
