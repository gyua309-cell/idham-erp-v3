import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { syncCustomerBalanceToCoa, syncSupplierBalanceToCoa } from "./sync-engine.js";

export async function recalculateCustomerBalance(customerId) {
  if (!customerId) return 0;
  try {
    const companyId = COMPANY_ID;
    
    // 1. Fetch active invoices
    const invSnap = await getDocs(query(
      collection(db, `companies/${companyId}/salesInvoices`),
      where("customerId", "==", customerId)
    ));
    let totalDebit = 0;
    const creditInvoices = [];
    
    invSnap.docs.forEach(d => {
      const inv = d.data();
      if (inv.status === "cancelled") return;
      const pm = (inv.paymentMethod || "cash").toLowerCase();
      if (pm === "credit" || pm === "deferred" || pm === "آجل" || pm === "cash" || pm === "نقدي") {
        totalDebit += parseFloat(inv.totalWithVat || inv.total || 0);
        creditInvoices.push({ id: d.id, ...inv });
      } else if (pm === "partial" || pm === "جزئي") {
        const paid = parseFloat(inv.paidAmount || 0);
        const rem = parseFloat(inv.remainingAmount !== undefined ? inv.remainingAmount : (parseFloat(inv.totalWithVat || inv.total || 0) - paid));
        totalDebit += rem;
        creditInvoices.push({ id: d.id, ...inv });
      }
    });
    
    // Fetch receipts
    const rcptSnap = await getDocs(query(
      collection(db, `companies/${companyId}/receipts`),
      where("targetId", "==", customerId)
    ));
    const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.entityType === "customer");

    // Fetch repReceipts (payments from rep app stored in separate collection)
    const repRcptSnap = await getDocs(query(
      collection(db, `companies/${companyId}/repReceipts`),
      where("customerId", "==", customerId)
    )).catch(() => ({ docs: [] }));
    const repReceipts = repRcptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const colSnap = await getDocs(query(
      collection(db, `companies/${companyId}/collections`),
      where("customerId", "==", customerId)
    ));
    const collections = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Fetch active returns
    const retSnap = await getDocs(query(
      collection(db, `companies/${companyId}/salesReturns`),
      where("customerId", "==", customerId)
    ));
    let totalReturns = 0;
    retSnap.docs.forEach(d => {
      const ret = d.data();
      if (ret.status === "cancelled" || ret.status === "void") return;
      totalReturns += parseFloat(ret.totalWithVat || ret.total || 0);
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

    // 4b. Calculate repReceipts total (rep app payments)
    let totalRepReceipts = 0;
    repReceipts.forEach(r => {
      totalRepReceipts += parseFloat(r.amount || 0);
    });

    // 5. Fallback for manual payments: if credit invoice is marked as paid but has no matching receipt/collection doc
    let manualPayments = 0;
    creditInvoices.forEach(inv => {
      if (inv.status === "paid") {
        const val = parseFloat(inv.totalWithVat || inv.total || 0);
        const hasReceipt = receipts.some(r => Math.abs(r.amount - val) < 1.0) || collections.some(c => Math.abs(c.amount - val) < 1.0);
        if (!hasReceipt) {
          manualPayments += val;
        }
      }
    });

    // Calculate final balance (debit normal)
    const actualBalance = totalDebit - (totalReceipts + totalCollections + totalRepReceipts + totalReturns + manualPayments);
    const roundedBalance = Math.round(actualBalance * 100) / 100;

    // Update customer doc
    await updateDoc(doc(db, `companies/${companyId}/customers`, customerId), {
      balance: roundedBalance
    });
    
    // ✅ جديد: مزامنة رصيد COA تلقائياً
    syncCustomerBalanceToCoa(customerId).catch(() => {});
    
    console.log(`[BalanceSync] Synced Customer ${customerId} balance to: ${roundedBalance}`);
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

    // 1. Fetch active purchases
    const purSnap = await getDocs(query(
      collection(db, `companies/${companyId}/purchaseInvoices`),
      where("supplierId", "==", supplierId)
    ));
    let totalCredit = 0;
    const purchases = [];
    
    purSnap.docs.forEach(d => {
      const pur = d.data();
      if (pur.status === "cancelled") return;
      const pm = (pur.paymentMethod || "credit").toLowerCase();
      if (pm === "credit" || pm === "deferred" || pm === "آجل") {
        totalCredit += parseFloat(pur.totalWithVat || 0);
        purchases.push({ id: d.id, ...pur });
      } else if (pm === "partial" || pm === "جزئي") {
        const paid = parseFloat(pur.paidAmount || 0);
        const rem = parseFloat(pur.remainingAmount !== undefined ? pur.remainingAmount : (parseFloat(pur.totalWithVat || 0) - paid));
        totalCredit += rem;
        purchases.push({ id: d.id, ...pur });
      }
    });

    // 2. Fetch expenses (payment vouchers)
    const expSnap = await getDocs(query(
      collection(db, `companies/${companyId}/expenses`),
      where("targetId", "==", supplierId)
    ));
    const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.entityType === "supplier");
    let totalExpenses = 0;
    expenses.forEach(e => {
      totalExpenses += parseFloat(e.amount || 0);
    });

    // 3. Fetch active returns
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

    // 4. Fallback for manual payments: if credit purchase invoice is marked as paid but has no matching expense doc
    let manualPayments = 0;
    purchases.forEach(pur => {
      if (pur.status === "paid") {
        const val = parseFloat(pur.totalWithVat || 0);
        const hasExpense = expenses.some(e => Math.abs(e.amount - val) < 1.0);
        if (!hasExpense) {
          manualPayments += val;
        }
      }
    });

    // Calculate final supplier balance (liability outstanding)
    const actualBalance = totalCredit - (totalExpenses + totalReturns + manualPayments);
    const roundedBalance = Math.round(actualBalance * 100) / 100;

    // Update supplier doc
    await updateDoc(doc(db, `companies/${companyId}/suppliers`, supplierId), {
      balance: roundedBalance
    });

    // ✅ جديد: مزامنة رصيد COA تلقائياً
    syncSupplierBalanceToCoa(supplierId).catch(() => {});

    console.log(`[BalanceSync] Synced Supplier ${supplierId} balance to: ${roundedBalance}`);
    return roundedBalance;
  } catch (err) {
    console.error(`[BalanceSync] Failed for supplier ${supplierId}:`, err);
    return null;
  }
}
