import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function runSupplierAudit(shouldApplyFix = false) {
  console.log('--- STARTING COMPREHENSIVE SUPPLIERS AUDIT & RECONCILIATION ---');

  const [supSnap, piSnap, prSnap, expSnap, rcptSnap, jeSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/suppliers')),
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/purchaseReturns')),
    getDocs(collection(db, 'companies/idham-main/expenses')),
    getDocs(collection(db, 'companies/idham-main/receipts')),
    getDocs(collection(db, 'companies/idham-main/journalEntries')),
    getDocs(collection(db, 'companies/idham-main/chartOfAccounts'))
  ]);

  const suppliers = supSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const purchaseInvoices = piSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== 'cancelled');
  const purchaseReturns = prSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled' && r.status !== 'void');
  const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.status !== 'cancelled');
  const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== 'cancelled');
  const journalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(j => j.status !== 'cancelled' && !j.isReversed);
  const coa = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Loaded: ${suppliers.length} Suppliers, ${purchaseInvoices.length} PIs, ${purchaseReturns.length} PRs, ${expenses.length} Expenses, ${receipts.length} Receipts, ${journalEntries.length} JEs.`);

  const auditResults = [];

  for (const sup of suppliers) {
    const sId = sup.id;
    const sName = (sup.name || '').trim().toLowerCase();
    const storedBalance = parseFloat(sup.balance || 0);

    // Matching COA
    const matchedCoa = coa.filter(a => a.sourceEntityId === sId);
    const matchedAccCodes = new Set(matchedCoa.map(a => a.code).filter(Boolean));
    const matchedAccIds = new Set(matchedCoa.map(a => a.id).filter(Boolean));

    // 1. Invoices
    const supPIs = purchaseInvoices.filter(pi => 
      pi.supplierId === sId || 
      (pi.supplierName && pi.supplierName.trim().toLowerCase() === sName)
    );
    const totalPurchasesWithVat = supPIs.reduce((sum, pi) => sum + (parseFloat(pi.totalWithVat || pi.grandTotal || pi.total || 0) || 0), 0);
    const totalPaidOnPIs = supPIs.reduce((sum, pi) => sum + (parseFloat(pi.paidAmount || 0) || 0), 0);
    const unpaidPIRemaining = supPIs.reduce((sum, pi) => {
      const rem = pi.remainingAmount !== undefined ? parseFloat(pi.remainingAmount) : (parseFloat(pi.totalWithVat || pi.total || 0) - parseFloat(pi.paidAmount || 0));
      return sum + (isNaN(rem) ? 0 : rem);
    }, 0);

    // 2. Returns
    const supPRs = purchaseReturns.filter(pr => 
      pr.supplierId === sId || 
      (pr.supplierName && pr.supplierName.trim().toLowerCase() === sName)
    );
    const totalReturns = supPRs.reduce((sum, pr) => sum + (parseFloat(pr.totalWithVat || pr.total || 0) || 0), 0);

    // 3. Expenses / Payment vouchers
    const supExps = expenses.filter(ex => 
      ex.targetId === sId || 
      ex.supplierId === sId || 
      (ex.beneficiary && ex.beneficiary.trim().toLowerCase() === sName) ||
      (ex.supplierName && ex.supplierName.trim().toLowerCase() === sName)
    );
    const totalExpenses = supExps.reduce((sum, ex) => sum + (parseFloat(ex.amount || 0) || 0), 0);

    // 4. Receipts from supplier
    const supRcpts = receipts.filter(r => 
      (r.targetId === sId || r.supplierId === sId) &&
      (!r.entityType || r.entityType === 'supplier')
    );
    const totalReceipts = supRcpts.reduce((sum, r) => sum + (parseFloat(r.amount || 0) || 0), 0);

    // 5. Manual Journal Entries
    let jeDebit = 0;
    let jeCredit = 0;
    journalEntries.forEach(je => {
      const st = (je.sourceType || '').toLowerCase();
      const rt = (je.refType || '').toLowerCase();
      const desc = (je.description || '').toLowerCase();

      const isAuto =
        je.auto === true ||
        st === 'purchase' || st === 'purchaseinvoice' || st === 'purchase_invoice' ||
        st === 'expense' || st === 'supplierpayment' || st === 'purchase_return' || st === 'purchasereturn' ||
        st === 'sales' || st === 'salesinvoice' || st === 'receipt' || st === 'salesreturn' ||
        rt.includes('purchase') || rt.includes('invoice') || rt.includes('expense') || rt.includes('return') || rt.includes('receipt') ||
        desc.includes('فاتورة') || desc.includes('مشتريات') || desc.includes('سند صرف') || desc.includes('سند قبض') || desc.includes('مرتجع');

      const isOpening = desc.includes('افتتاحي') || st === 'opening' || rt === 'opening';

      if (isAuto && !isOpening) return;

      (je.lines || []).forEach(line => {
        const lAccId = line.accountId;
        const lAccCode = line.accountCode;
        const lAccName = (line.accountName || '').trim().toLowerCase();

        const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                        (lAccCode && matchedAccCodes.has(lAccCode)) ||
                        (sName && lAccName && (lAccName === sName || lAccName.includes(sName) || sName.includes(lAccName)));

        if (isMatch) {
          jeDebit += parseFloat(line.debit || 0);
          jeCredit += parseFloat(line.credit || 0);
        }
      });
    });

    // Check duplicate automatic payment between PI.paidAmount and Expense vouchers:
    let autoDebit = 0;
    supPIs.forEach(pur => {
      if (pur.paidAmount > 0) {
        const purDateStr = pur.date || (pur.createdAt?.toDate ? pur.createdAt.toDate().toISOString().split('T')[0] : '');
        const hasMatchingVoucher = supExps.some(e => {
          const eDate = e.date || (e.createdAt?.toDate ? e.createdAt.toDate().toISOString().split('T')[0] : '');
          return eDate === purDateStr && Math.abs((parseFloat(e.amount || 0)) - parseFloat(pur.paidAmount)) < 0.01;
        });

        if (!hasMatchingVoucher) {
          autoDebit += parseFloat(pur.paidAmount || 0);
        }
      }
    });

    // Statement balance = (Total Purchases + Receipts + JE Credit) - (Auto Paid on PIs + Expenses + Returns + JE Debit)
    const statementBalance = Math.round(((totalPurchasesWithVat + totalReceipts + jeCredit) - (autoDebit + totalExpenses + totalReturns + jeDebit)) * 100) / 100;
    const isDiscrepant = Math.abs(storedBalance - statementBalance) > 0.01;

    auditResults.push({
      id: sId,
      name: sup.name,
      storedBalance,
      statementBalance,
      unpaidPIRemaining: Math.round(unpaidPIRemaining * 100) / 100,
      totalPurchases: Math.round(totalPurchasesWithVat * 100) / 100,
      totalPaid: Math.round((autoDebit + totalExpenses) * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
      piCount: supPIs.length,
      expCount: supExps.length,
      prCount: supPRs.length,
      jeCount: (jeDebit > 0 || jeCredit > 0) ? 1 : 0,
      isDiscrepant,
      diff: Math.round((storedBalance - statementBalance) * 100) / 100
    });

    if (shouldApplyFix && isDiscrepant) {
      console.log(`Syncing ${sup.name}: Old Stored = ${storedBalance} -> New Reconciled = ${statementBalance}`);
      await updateDoc(doc(db, `companies/idham-main/suppliers`, sId), {
        balance: statementBalance
      });
    }
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.table(auditResults.map(r => ({
    'المورد': r.name,
    'الرصيد في الدليل': r.storedBalance,
    'الرصيد الحقيقي (كشف الحساب)': r.statementBalance,
    'الفارق': r.diff,
    'فواتير مشتريات': r.piCount,
    'سندات صرف': r.expCount,
    'مرتجعات': r.prCount,
    'حالة المطابقة': r.isDiscrepant ? '❌ غير مطابق' : '✅ مطابق'
  })));

  const totalDiscrepant = auditResults.filter(r => r.isDiscrepant).length;
  console.log(`\nTotal Discrepant Suppliers: ${totalDiscrepant} / ${suppliers.length}`);
}

const apply = process.argv.includes('--apply');
runSupplierAudit(apply).then(() => {
  console.log('Supplier audit finished successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
