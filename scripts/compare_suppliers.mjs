import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function compareSuppliers() {
  const [supSnap, piSnap, prSnap, expSnap, jeSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/suppliers')),
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/purchaseReturns')),
    getDocs(collection(db, 'companies/idham-main/expenses')),
    getDocs(collection(db, 'companies/idham-main/journalEntries')),
    getDocs(collection(db, 'companies/idham-main/accounts'))
  ]);

  const suppliers = [];
  supSnap.forEach(d => suppliers.push({ id: d.id, ...d.data() }));

  const purchaseInvoices = [];
  piSnap.forEach(d => purchaseInvoices.push({ id: d.id, ...d.data() }));

  const purchaseReturns = [];
  prSnap.forEach(d => purchaseReturns.push({ id: d.id, ...d.data() }));

  const expenses = [];
  expSnap.forEach(d => expenses.push({ id: d.id, ...d.data() }));

  const journalEntries = [];
  jeSnap.forEach(d => journalEntries.push({ id: d.id, ...d.data() }));

  const coa = [];
  coaSnap.forEach(d => coa.push({ id: d.id, ...d.data() }));

  console.log(`Loaded ${suppliers.length} suppliers, ${purchaseInvoices.length} PIs, ${purchaseReturns.length} PRs, ${expenses.length} Expenses, ${journalEntries.length} JEs, ${coa.length} COA.`);

  // Let's analyze each supplier
  const report = suppliers.map(sup => {
    const sId = sup.id;
    const sName = (sup.name || '').trim();
    const storedBalance = parseFloat(sup.balance || sup.currentBalance || 0);
    const openingBalance = parseFloat(sup.openingBalance || 0);

    // 1. Calculate from Operational Documents (Statement logic)
    // Purchases
    const supPIs = purchaseInvoices.filter(pi => 
      pi.supplierId === sId || 
      (pi.supplierName && pi.supplierName.trim() === sName)
    );
    const totalPurchases = supPIs.reduce((sum, pi) => sum + (parseFloat(pi.totalWithVat || pi.total || 0) || 0), 0);
    const totalPaidOnPIs = supPIs.reduce((sum, pi) => sum + (parseFloat(pi.paidAmount || 0) || 0), 0);

    // Purchase Returns
    const supPRs = purchaseReturns.filter(pr => 
      pr.supplierId === sId || 
      (pr.supplierName && pr.supplierName.trim() === sName)
    );
    const totalReturns = supPRs.reduce((sum, pr) => sum + (parseFloat(pr.totalWithVat || pr.total || 0) || 0), 0);

    // Direct Expense / Payment vouchers linked to this supplier
    const supExps = expenses.filter(ex => 
      ex.supplierId === sId || 
      (ex.beneficiary && ex.beneficiary.trim() === sName) ||
      (ex.supplierName && ex.supplierName.trim() === sName)
    );
    const totalPayments = supExps.reduce((sum, ex) => sum + (parseFloat(ex.amount || 0) || 0), 0);

    // Operational calculated balance:
    // Balance = Opening + Purchases - Returns - DirectPayments (or unpaid remaining on PIs)
    const unpaidPIRemaining = supPIs.reduce((sum, pi) => sum + (parseFloat(pi.remainingAmount !== undefined ? pi.remainingAmount : (pi.totalWithVat || pi.total || 0) - (pi.paidAmount || 0)) || 0), 0);
    const opCalculatedBalance = openingBalance + totalPurchases - totalReturns - totalPayments;

    // 2. Calculate from Accounting Ledger (COA & Journal Entries)
    // Find supplier COA account
    const matchedCoa = coa.find(a => 
      a.sourceEntityId === sId ||
      a.id === sup.accountId ||
      a.code === sup.accountCode ||
      (a.code && a.code.startsWith('2-1-1') && (a.nameAr === sName || a.name === sName || (a.nameAr || a.name || '').includes(sName)))
    );

    let ledgerBalance = 0;
    let totalDr = 0;
    let totalCr = 0;

    if (matchedCoa) {
      journalEntries.filter(je => !je.status || je.status === 'posted').forEach(je => {
        (je.lines || []).forEach(l => {
          if (l.accountId === matchedCoa.id || l.accountCode === matchedCoa.code) {
            const dr = parseFloat(l.debit || 0) || 0;
            const cr = parseFloat(l.credit || 0) || 0;
            totalDr += dr;
            totalCr += cr;
          }
        });
      });
      // For liability (2-1-1): Normal balance is Credit (Credit - Debit)
      ledgerBalance = (matchedCoa.openingBalance || 0) + (totalCr - totalDr);
    }

    return {
      id: sId,
      name: sName,
      storedBalance,
      openingBalance,
      unpaidPIRemaining,
      opCalculatedBalance,
      coaCode: matchedCoa?.code || 'None',
      coaName: matchedCoa?.nameAr || matchedCoa?.name || 'None',
      ledgerBalance,
      totalDr,
      totalCr,
      piCount: supPIs.length,
      prCount: supPRs.length,
      expCount: supExps.length,
      diffStoredVsLedger: Math.round((storedBalance - ledgerBalance) * 100) / 100,
      diffStoredVsOp: Math.round((storedBalance - opCalculatedBalance) * 100) / 100
    };
  });

  console.log('=== SUPPLIERS COMPARISON TABLE ===');
  console.table(report.map(r => ({
    'المورد': r.name,
    'الرصيد في الدليل (المخزن)': r.storedBalance,
    'رصيد دفتر الأستاذ (COA)': r.ledgerBalance,
    'رصيد الفواتير غير المسددة': r.unpaidPIRemaining,
    'الرصيد التشغيلي (شراء-سداد)': r.opCalculatedBalance,
    'كود الحساب': r.coaCode,
    'فارق (دليل - أستاذ)': r.diffStoredVsLedger
  })));

  // Detailed discrepancies:
  const discrepancies = report.filter(r => Math.abs(r.storedBalance - r.ledgerBalance) > 0.01 || Math.abs(r.storedBalance - r.unpaidPIRemaining) > 0.01);
  console.log(`\nFound ${discrepancies.length} suppliers with balance discrepancies.`);
  discrepancies.forEach(d => {
    console.log(`\n--- Supplier: ${d.name} (${d.id}) ---`);
    console.log(`  Stored in Supplier Doc: ${d.storedBalance}`);
    console.log(`  Ledger Balance (2-1-1): ${d.ledgerBalance} (Dr: ${d.totalDr}, Cr: ${d.totalCr})`);
    console.log(`  Unpaid PI Remaining: ${d.unpaidPIRemaining}`);
    console.log(`  Purchases: ${d.piCount}, Returns: ${d.prCount}, Direct Payments: ${d.expCount}`);
  });
}

compareSuppliers();
