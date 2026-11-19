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
  const [customers, invoices, receipts, returns, jes, coa, collections, deliveryNotes] = await Promise.all([
    getAllPages(`companies/${compId}/customers`),
    getAllPages(`companies/${compId}/salesInvoices`),
    getAllPages(`companies/${compId}/receipts`),
    getAllPages(`companies/${compId}/salesReturns`),
    getAllPages(`companies/${compId}/journalEntries`),
    getAllPages(`companies/${compId}/chartOfAccounts`),
    getAllPages(`companies/${compId}/collections`),
    getAllPages(`companies/${compId}/deliveryNotes`)
  ]);

  const targetCust = customers.find(c => (c.name || "").includes("ريف رضوى") || (c.name || "").includes("رضوى"));
  console.log("Customer found:", targetCust);

  if (!targetCust) {
    console.log("No customer found matching 'ريف رضوى'");
    return;
  }

  const custId = targetCust.id;
  const custName = (targetCust.name || "").trim().toLowerCase();

  console.log("\n--- CUSTOMER DOC DETAILS ---");
  console.log("ID:", custId);
  console.log("Name:", targetCust.name);
  console.log("Stored Balance:", targetCust.balance);
  console.log("Opening Balance:", targetCust.openingBalance);

  // Invoices
  const custInvoices = invoices.filter(inv => inv.customerId === custId && inv.status !== "cancelled");
  console.log(`\n--- INVOICES (${custInvoices.length}) ---`);
  let invDebit = 0;
  let invPaid = 0;
  custInvoices.forEach(inv => {
    const tot = parseFloat(inv.totalWithVat || inv.total || 0);
    const paid = parseFloat(inv.paidAmount || 0);
    invDebit += tot;
    invPaid += paid;
    console.log(`  [Invoice] ${inv.number || inv.id} | Date: ${inv.date} | Total: ${tot} | Paid: ${paid} | Status: ${inv.status} | PayMethod: ${inv.paymentMethod}`);
  });

  // Receipts
  const custReceipts = receipts.filter(r => r.targetId === custId || r.customerId === custId);
  console.log(`\n--- RECEIPTS (${custReceipts.length}) ---`);
  let rcptTotal = 0;
  custReceipts.forEach(r => {
    const amt = parseFloat(r.amount || 0);
    rcptTotal += amt;
    console.log(`  [Receipt] ${r.receiptNumber || r.number || r.id} | Date: ${r.date} | Amount: ${amt} | EntityType: ${r.entityType} | TargetType: ${r.targetType}`);
  });

  // Collections
  const custCols = collections.filter(c => c.customerId === custId);
  console.log(`\n--- COLLECTIONS (${custCols.length}) ---`);
  let colTotal = 0;
  custCols.forEach(c => {
    const amt = parseFloat(c.amount || 0);
    colTotal += amt;
    console.log(`  [Collection] ${c.id} | Date: ${c.date} | Amount: ${amt}`);
  });

  // Returns
  const custReturns = returns.filter(ret => ret.customerId === custId && ret.status !== "cancelled");
  console.log(`\n--- SALES RETURNS (${custReturns.length}) ---`);
  let retTotal = 0;
  custReturns.forEach(ret => {
    const tot = parseFloat(ret.totalWithVat || ret.total || 0);
    retTotal += tot;
    console.log(`  [Return] ${ret.number || ret.id} | Date: ${ret.date} | Total: ${tot}`);
  });

  // Delivery Notes
  const custDNs = deliveryNotes.filter(dn => dn.customerId === custId);
  console.log(`\n--- DELIVERY NOTES (${custDNs.length}) ---`);
  let dnTotal = 0;
  custDNs.forEach(dn => {
    const tot = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
    dnTotal += tot;
    console.log(`  [DN] ${dn.number || dn.id} | Date: ${dn.date} | Total: ${tot} | Status: ${dn.status} | PayMethod: ${dn.paymentMethod}`);
  });

  // COA & Journal Entries
  const custCoa = coa.filter(a => a.sourceEntityId === custId || (a.name || "").trim().toLowerCase() === custName);
  console.log(`\n--- COA MATCHES (${custCoa.length}) ---`);
  const coaIds = new Set(custCoa.map(a => a.id));
  const coaCodes = new Set(custCoa.map(a => a.code).filter(Boolean));
  custCoa.forEach(a => console.log(`  COA: ${a.code} - ${a.name} (id: ${a.id}) | Balance: ${a.balance}`));

  let jeDebit = 0;
  let jeCredit = 0;
  jes.forEach(je => {
    if (je.status === "cancelled" || je.isReversed) return;
    const st = (je.sourceType || "").toLowerCase();
    const rt = (je.refType || "").toLowerCase();
    const desc = (je.description || "").toLowerCase();
    const isAuto = st.includes("sales") || st.includes("receipt") || st.includes("return") || st.includes("cogs") ||
                   rt.includes("sales") || rt.includes("receipt") || rt.includes("return") ||
                   desc.includes("مبيعات") || desc.includes("فاتورة") || desc.includes("سند قبض");
    
    (je.lines || []).forEach(l => {
      const match = (l.accountId && coaIds.has(l.accountId)) ||
                    (l.accountCode && coaCodes.has(l.accountCode)) ||
                    (l.accountName && l.accountName.trim().toLowerCase() === custName);
      if (match) {
        const d = parseFloat(l.debit || 0);
        const c = parseFloat(l.credit || 0);
        console.log(`  [Journal Entry] ${je.entryNumber || je.id} | Date: ${je.date} | isAuto: ${isAuto} | Desc: ${je.description} | Debit: ${d} | Credit: ${c}`);
        if (!isAuto) {
          jeDebit += d;
          jeCredit += c;
        }
      }
    });
  });

  console.log("\n================ SUMMARY ================");
  console.log("Total Invoices (Debit):", invDebit);
  console.log("Total Receipts (Credit):", rcptTotal);
  console.log("Total Returns (Credit):", retTotal);
  console.log("Manual JE Debit:", jeDebit);
  console.log("Manual JE Credit:", jeCredit);
  console.log("Net Statement Balance (Invoices - Receipts - Returns + JE Debit - JE Credit):", (invDebit - rcptTotal - retTotal + jeDebit - jeCredit));
  console.log("Customer Document balance field:", targetCust.balance);
}

run();
