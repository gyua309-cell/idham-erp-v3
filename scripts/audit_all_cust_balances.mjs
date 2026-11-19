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
  const compId = "idham-main";
  const [customers, invoices, receipts, returns, coa] = await Promise.all([
    getAllPages(`companies/${compId}/customers`),
    getAllPages(`companies/${compId}/salesInvoices`),
    getAllPages(`companies/${compId}/receipts`),
    getAllPages(`companies/${compId}/salesReturns`),
    getAllPages(`companies/${compId}/chartOfAccounts`)
  ]);

  console.log(`=== FULL AUDIT OF ALL ${customers.length} CUSTOMERS ===\n`);

  let totalDiff = 0;
  const discrepancies = [];

  for (const c of customers) {
    const cInvs = invoices.filter(i => i.customerId === c.id || (i.customerName && i.customerName.trim() === c.name.trim()));
    const cRcpts = receipts.filter(r => r.targetId === c.id || r.customerId === c.id || (r.customerName && r.customerName.trim() === c.name.trim()));
    const cRets = returns.filter(r => r.customerId === c.id || (r.customerName && r.customerName.trim() === c.name.trim()));

    const sumInvs = cInvs.reduce((sum, x) => sum + Number(x.totalWithVat || x.total || 0), 0);
    const sumRcpts = cRcpts.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const sumRets = cRets.reduce((sum, x) => sum + Number(x.totalWithVat || x.total || 0), 0);
    const openBal = Number(c.openingBalance || 0);

    const actualStatementBalance = Math.round((openBal + sumInvs - sumRcpts - sumRets) * 100) / 100;
    const storedBalance = Math.round(Number(c.balance || 0) * 100) / 100;

    const diff = Math.round((storedBalance - actualStatementBalance) * 100) / 100;
    if (Math.abs(diff) > 0.05) {
      totalDiff++;
      discrepancies.push({
        id: c.id,
        name: c.name,
        code: c.code,
        stored: storedBalance,
        actual: actualStatementBalance,
        diff: diff,
        invsCount: cInvs.length,
        rcptsCount: cRcpts.length,
        retsCount: cRets.length,
        sumInvs,
        sumRcpts,
        sumRets
      });
    }
  }

  console.log(`Found ${discrepancies.length} customers with outdated stored c.balance:`);
  discrepancies.forEach(d => {
    console.log(`- ${d.name} (${d.code || d.id}):`);
    console.log(`    Stored c.balance: ${d.stored} | Actual Statement: ${d.actual} (Diff: ${d.diff})`);
    console.log(`    (Invoices: ${d.sumInvs.toFixed(2)} [${d.invsCount}], Receipts: ${d.sumRcpts.toFixed(2)} [${d.rcptsCount}], Returns: ${d.sumRets.toFixed(2)} [${d.retsCount}])`);
  });
}

run().catch(console.error);
