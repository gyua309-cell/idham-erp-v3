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

  console.log(`Loaded: ${customers.length} customers, ${invoices.length} invoices, ${receipts.length} receipts, ${returns.length} returns, ${jes.length} JEs.`);

  const discrepancies = [];

  for (const cust of customers) {
    const customerId = cust.id;
    const custName = (cust.name || "").trim().toLowerCase();

    // Matching COA
    const matchedAccCodes = new Set();
    const matchedAccIds = new Set();
    coa.filter(a => a.sourceEntityId === customerId || (a.name || "").trim().toLowerCase() === custName).forEach(d => {
      matchedAccIds.add(d.id);
      if (d.code) matchedAccCodes.add(d.code);
    });

    // Invoices
    let totalDebit = 0;
    let autoCredit = 0;
    const custInvoices = invoices.filter(inv => inv.customerId === customerId && inv.status !== "cancelled");
    const custReceipts = receipts.filter(r => (r.targetId === customerId || r.customerId === customerId) && r.status !== "cancelled");
    const custCols = collections.filter(c => c.customerId === customerId && c.status !== "cancelled");

    custInvoices.forEach(inv => {
      totalDebit += parseFloat(inv.totalWithVat || inv.total || 0);

      if (inv.paidAmount > 0) {
        const invDateStr = inv.date || "";
        const hasMatchingVoucher = custReceipts.some(r => {
          const rDate = r.date || "";
          return rDate === invDateStr && Math.abs((parseFloat(r.amount) || 0) - parseFloat(inv.paidAmount)) < 0.01;
        }) || custCols.some(c => {
          const cDate = c.date || "";
          return cDate === invDateStr && Math.abs((parseFloat(c.amount) || 0) - parseFloat(inv.paidAmount)) < 0.01;
        });

        if (!hasMatchingVoucher) {
          autoCredit += parseFloat(inv.paidAmount || 0);
        }
      }
    });

    // Delivery Notes
    const custDNs = deliveryNotes.filter(dn => dn.customerId === customerId && dn.status !== "cancelled" && dn.status !== "void" && dn.status !== "converted_to_invoice");
    custDNs.forEach(dn => {
      const tot = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
      totalDebit += tot;
      if (dn.paymentMethod === "cash" && dn.status === "confirmed") {
        autoCredit += tot;
      }
    });

    // Returns
    let totalReturns = 0;
    const custReturns = returns.filter(ret => ret.customerId === customerId && ret.status !== "cancelled" && ret.status !== "void");
    custReturns.forEach(ret => {
      totalReturns += parseFloat(ret.totalWithVat || ret.total || 0);
    });

    // Receipts
    let totalReceipts = 0;
    custReceipts.forEach(r => {
      totalReceipts += parseFloat(r.amount || 0);
    });

    // Collections
    let totalCollections = 0;
    custCols.forEach(c => {
      totalCollections += parseFloat(c.amount || 0);
    });

    // Manual JEs
    let jeDebit = 0;
    let jeCredit = 0;
    jes.forEach(je => {
      if (je.status === "cancelled" || je.isReversed) return;
      const st = (je.sourceType || "").toLowerCase();
      const rt = (je.refType || "").toLowerCase();
      const desc = (je.description || "").toLowerCase();

      const isAutoGenerated = 
        st === "salesinvoice" || st === "sales" || st === "receipt" || st === "salesreturn" || 
        st === "sales_return" || st === "salescogs" || st === "cogs" || st === "salesreturncogs" || 
        st === "salesinvoice_cogs" || st === "collection" || st === "expense" || st === "supplierpayment" ||
        rt.includes("sales") || rt.includes("receipt") || rt.includes("invoice") || rt.includes("return") ||
        desc.includes("مبيعات") || desc.includes("فاتورة") || desc.includes("سند قبض") || 
        desc.includes("مرتجع") || desc.includes("إشعار دائن") || desc.includes("تصفية");

      if (isAutoGenerated) return;

      (je.lines || []).forEach(line => {
        const lAccId = line.accountId;
        const lAccCode = line.accountCode;
        const lAccName = (line.accountName || "").trim().toLowerCase();

        const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                        (lAccCode && matchedAccCodes.has(lAccCode)) ||
                        (custName && lAccName && lAccName === custName);

        if (isMatch) {
          jeDebit += parseFloat(line.debit || 0);
          jeCredit += parseFloat(line.credit || 0);
        }
      });
    });

    const calculatedBalance = Math.round(((totalDebit + jeDebit) - (autoCredit + totalReceipts + totalCollections + totalReturns + jeCredit)) * 100) / 100;
    const storedBalance = Math.round((parseFloat(cust.balance) || 0) * 100) / 100;

    if (Math.abs(calculatedBalance - storedBalance) > 0.05) {
      discrepancies.push({
        id: cust.id,
        name: cust.name,
        stored: storedBalance,
        calculated: calculatedBalance,
        diff: Math.round((storedBalance - calculatedBalance) * 100) / 100,
        invoices: totalDebit,
        receipts: totalReceipts,
        returns: totalReturns,
        jeDebit,
        jeCredit
      });
    }
  }

  console.log(`\nFound ${discrepancies.length} customers with balance discrepancy between stored customer.balance and statement calculations:\n`);
  discrepancies.forEach(d => {
    console.log(`- ${d.name} (${d.id}): Stored = ${d.stored} | Correct Statement Balance = ${d.calculated} (Diff: ${d.diff})`);
  });
}

run();
