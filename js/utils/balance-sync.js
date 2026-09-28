import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

export async function recalculateCustomerBalance(customerId) {
  if (!customerId) return 0;
  try {
    const companyId = COMPANY_ID;

    // 0. Fetch customer info & COA accounts
    const custDoc = await getDoc(doc(db, `companies/${companyId}/customers`, customerId));
    const custData = custDoc.exists() ? custDoc.data() : {};
    const custName = (custData.name || "").trim().toLowerCase();

    const coaSnap = await getDocs(query(
      collection(db, `companies/${companyId}/chartOfAccounts`),
      where("sourceEntityId", "==", customerId)
    ));
    const matchedAccCodes = new Set();
    const matchedAccIds = new Set();
    coaSnap.docs.forEach(d => {
      matchedAccIds.add(d.id);
      if (d.data().code) matchedAccCodes.add(d.data().code);
    });
    
    // 1. Fetch active invoices
    const invSnap = await getDocs(query(
      collection(db, `companies/${companyId}/salesInvoices`),
      where("customerId", "==", customerId)
    ));
    let totalDebit = 0;
    let autoCredit = 0;
    
    // Fetch receipts for duplicate checks
    const rcptSnap = await getDocs(query(
      collection(db, `companies/${companyId}/receipts`),
      where("targetId", "==", customerId)
    ));
    const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.entityType === "customer");

    const colSnap = await getDocs(query(
      collection(db, `companies/${companyId}/collections`),
      where("customerId", "==", customerId)
    ));
    const collections = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    invSnap.docs.forEach(d => {
      const inv = d.data();
      if (inv.status === "cancelled") return;
      totalDebit += parseFloat(inv.totalWithVat || 0);
      
      if (inv.paidAmount > 0) {
        const invDateStr = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
        const hasMatchingVoucher = receipts.some(r => {
          const rDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
          return rDate === invDateStr && Math.abs((r.amount || 0) - inv.paidAmount) < 0.01;
        }) || collections.some(c => {
          const cDate = c.date || (c.createdAt?.toDate ? c.createdAt.toDate().toISOString().split("T")[0] : "");
          return cDate === invDateStr && Math.abs((c.amount || 0) - inv.paidAmount) < 0.01;
        });

        if (!hasMatchingVoucher) {
          autoCredit += parseFloat(inv.paidAmount || 0);
        }
      }
    });

    // 2. Fetch active returns
    const retSnap = await getDocs(query(
      collection(db, `companies/${companyId}/salesReturns`),
      where("customerId", "==", customerId)
    ));
    let totalReturns = 0;
    retSnap.docs.forEach(d => {
      const ret = d.data();
      if (ret.status === "cancelled" || ret.status === "void") return;
      totalReturns += parseFloat(ret.totalWithVat || 0);
    });

    // 3. Calculate receipts total
    let totalReceipts = 0;
    receipts.forEach(r => {
      totalReceipts += parseFloat(r.amount || 0);
    });

    // 4. Calculate collections total
    let totalCollections = 0;
    collections.forEach(c => {
      totalCollections += parseFloat(c.amount || 0);
    });

    // 4b. Fetch expenses (refund/payment vouchers to customer, if any)
    let totalExpenses = 0;
    try {
      const expSnap = await getDocs(query(
        collection(db, `companies/${companyId}/expenses`),
        where("targetId", "==", customerId)
      ));
      expSnap.docs.forEach(d => {
        const exp = d.data();
        if (exp.status === "cancelled") return;
        if (exp.entityType === "customer") {
          totalExpenses += parseFloat(exp.amount || 0);
        }
      });
    } catch (e) {}

    // 5. Fetch manual Journal Entries affecting this customer
    let jeDebit = 0;
    let jeCredit = 0;
    try {
      const jeSnap = await getDocs(collection(db, `companies/${companyId}/journalEntries`));
      jeSnap.docs.forEach(d => {
        const je = d.data();
        if (je.status === "cancelled" || je.isReversed) return;
        if (je.sourceType === "sales" || je.sourceType === "receipt" || je.sourceType === "sales_return" || je.sourceType === "expense") return;

        (je.lines || []).forEach(line => {
          const lAccId = line.accountId;
          const lAccCode = line.accountCode;
          const lAccName = (line.accountName || "").trim().toLowerCase();

          const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                          (lAccCode && matchedAccCodes.has(lAccCode)) ||
                          (custName && lAccName && (lAccName === custName || lAccName.includes(custName) || custName.includes(lAccName)));

          if (isMatch) {
            jeDebit += parseFloat(line.debit || 0);
            jeCredit += parseFloat(line.credit || 0);
          }
        });
      });
    } catch(e) {
      console.warn("[BalanceSync] Error fetching JEs for customer:", e);
    }

    // Calculate final balance (debit normal: positive = customer owes us)
    const actualBalance = (totalDebit + totalExpenses + jeDebit) - (autoCredit + totalReceipts + totalCollections + totalReturns + jeCredit);
    const roundedBalance = Math.round(actualBalance * 100) / 100;

    // Update customer doc
    await updateDoc(doc(db, `companies/${companyId}/customers`, customerId), {
      balance: roundedBalance
    });
    
    console.log(`[BalanceSync] Synced Customer ${customerId} (${custData.name}) balance to: ${roundedBalance}`);
    return roundedBalance;
  } catch (err) {
    console.error(`[BalanceSync] Failed for customer ${customerId}:`, err);
    return null;
  }
}

export async function recalculateSupplierBalance(supplierId) {
  if (!supplierId) return 0;
  try {
    const companyId = COMPANY_ID;

    // 0. Fetch supplier info & COA accounts
    const suppDoc = await getDoc(doc(db, `companies/${companyId}/suppliers`, supplierId));
    const supData = suppDoc.exists() ? suppDoc.data() : {};
    const supName = (supData.name || "").trim().toLowerCase();

    const coaSnap = await getDocs(query(
      collection(db, `companies/${companyId}/chartOfAccounts`),
      where("sourceEntityId", "==", supplierId)
    ));
    const matchedAccCodes = new Set();
    const matchedAccIds = new Set();
    coaSnap.docs.forEach(d => {
      matchedAccIds.add(d.id);
      if (d.data().code) matchedAccCodes.add(d.data().code);
    });

    // 1. Fetch active purchases
    const purSnap = await getDocs(query(
      collection(db, `companies/${companyId}/purchaseInvoices`),
      where("supplierId", "==", supplierId)
    ));
    let totalCredit = 0;
    let autoDebit = 0;
    const purchases = purSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Fetch expenses (payment vouchers)
    const expSnap = await getDocs(query(
      collection(db, `companies/${companyId}/expenses`),
      where("targetId", "==", supplierId)
    ));
    const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.status !== "cancelled" && e.entityType === "supplier");
    let totalExpenses = 0;
    expenses.forEach(e => {
      totalExpenses += parseFloat(e.amount || 0);
    });

    // 2b. Fetch receipts (refund/receipt vouchers from supplier)
    const rcptSnap = await getDocs(query(
      collection(db, `companies/${companyId}/receipts`),
      where("targetId", "==", supplierId)
    ));
    const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== "cancelled" && (!r.entityType || r.entityType === "supplier"));
    let totalReceipts = 0;
    receipts.forEach(r => {
      totalReceipts += parseFloat(r.amount || 0);
    });

    // 3. Loop purchases to compute total purchases and non-matching automatic payments
    purchases.forEach(pur => {
      if (pur.status === "cancelled") return;
      totalCredit += parseFloat(pur.totalWithVat || 0);

      if (pur.paidAmount > 0) {
        const purDateStr = pur.date || (pur.createdAt?.toDate ? pur.createdAt.toDate().toISOString().split("T")[0] : "");
        const hasMatchingVoucher = expenses.some(e => {
          const eDate = e.date || (e.createdAt?.toDate ? e.createdAt.toDate().toISOString().split("T")[0] : "");
          return eDate === purDateStr && Math.abs((e.amount || 0) - pur.paidAmount) < 0.01;
        });

        if (!hasMatchingVoucher) {
          autoDebit += parseFloat(pur.paidAmount || 0);
        }
      }
    });

    // 4. Fetch active returns
    const retSnap = await getDocs(query(
      collection(db, `companies/${companyId}/purchaseReturns`),
      where("supplierId", "==", supplierId)
    ));
    let totalReturns = 0;
    retSnap.docs.forEach(d => {
      const ret = d.data();
      if (ret.status === "cancelled" || ret.status === "void") return;
      totalReturns += parseFloat(ret.totalWithVat || 0);
    });

    // 5. Fetch manual Journal Entries affecting this supplier
    let jeDebit = 0;
    let jeCredit = 0;
    try {
      const jeSnap = await getDocs(collection(db, `companies/${companyId}/journalEntries`));
      jeSnap.docs.forEach(d => {
        const je = d.data();
        if (je.status === "cancelled" || je.isReversed) return;
        const st = (je.sourceType || "").toLowerCase();
        const rt = (je.refType || "").toLowerCase();
        const desc = (je.description || "").toLowerCase();

        const isAuto =
          je.auto === true ||
          st === "purchase" || st === "purchaseinvoice" || st === "purchase_invoice" ||
          st === "expense" || st === "supplierpayment" || st === "purchase_return" || st === "purchasereturn" ||
          st === "sales" || st === "salesinvoice" || st === "receipt" || st === "salesreturn" ||
          rt.includes("purchase") || rt.includes("invoice") || rt.includes("expense") || rt.includes("return") || rt.includes("receipt") ||
          desc.includes("فاتورة") || desc.includes("مشتريات") || desc.includes("سند صرف") || desc.includes("سند قبض") || desc.includes("مرتجع");

        const isOpening = desc.includes("افتتاحي") || st === "opening" || rt === "opening";

        if (isAuto && !isOpening) return;

        (je.lines || []).forEach(line => {
          const lAccId = line.accountId;
          const lAccCode = line.accountCode;
          const lAccName = (line.accountName || "").trim().toLowerCase();

          const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                          (lAccCode && matchedAccCodes.has(lAccCode)) ||
                          (supName && lAccName && (lAccName === supName || lAccName.includes(supName) || supName.includes(lAccName)));

          if (isMatch) {
            jeDebit += parseFloat(line.debit || 0);
            jeCredit += parseFloat(line.credit || 0);
          }
        });
      });
    } catch(e) {
      console.warn("[BalanceSync] Error fetching JEs for supplier:", e);
    }

    // Calculate final supplier balance (Credit normal: positive = company owes supplier, negative = supplier owes company / debit balance)
    const actualBalance = (totalCredit + totalReceipts + jeCredit) - (autoDebit + totalExpenses + totalReturns + jeDebit);
    const roundedBalance = Math.round(actualBalance * 100) / 100;

    // Update supplier doc
    await updateDoc(doc(db, `companies/${companyId}/suppliers`, supplierId), {
      balance: roundedBalance
    });

    console.log(`[BalanceSync] Synced Supplier ${supplierId} (${supData.name}) balance to: ${roundedBalance} (Credits: ${totalCredit + totalReceipts + jeCredit}, Debits: ${autoDebit + totalExpenses + totalReturns + jeDebit})`);
    return roundedBalance;
  } catch (err) {
    console.error(`[BalanceSync] Failed for supplier ${supplierId}:`, err);
    return null;
  }
}
