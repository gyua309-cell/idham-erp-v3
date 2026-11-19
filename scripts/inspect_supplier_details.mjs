import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectSupplierTransactions() {
  const [supSnap, piSnap, prSnap, expSnap, rcptSnap, jeSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/suppliers')),
    getDocs(collection(db, 'companies/idham-main/purchaseInvoices')),
    getDocs(collection(db, 'companies/idham-main/purchaseReturns')),
    getDocs(collection(db, 'companies/idham-main/expenses')),
    getDocs(collection(db, 'companies/idham-main/receipts')),
    getDocs(collection(db, 'companies/idham-main/journalEntries'))
  ]);

  const suppliers = supSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const purchaseInvoices = piSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const purchaseReturns = prSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const journalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const targetSuppliers = [
    'شركة الدريس',
    'شركة ارنون للصناعات البلاستيكية المحدوده',
    'شركة مجموعة با فرط للصناعة لانتاج المواد الغذائية',
    'شركة جيلانى باك التجارية',
    'شركة بن خميس',
    'محامص ومطاحن زاد طيبة',
    'مؤسسة ايمن حمدان حمد العتيبى',
    'الشركة العربية الماليزية لمنتجات الزيوت النباتية المحدوده',
    'شركة محمد على العيسانى للمواد الغذائية المحدودة',
    'شركة الرفادة العربية التجارية',
    'شركة هلال العروس',
    'شركة الغذاء الفاخر المحدوده'
  ];

  for (const name of targetSuppliers) {
    const sup = suppliers.find(s => s.name.trim().toLowerCase().includes(name.trim().toLowerCase()));
    if (!sup) {
      console.log(`Supplier not found: ${name}`);
      continue;
    }
    const sId = sup.id;
    console.log(`\n======================================================`);
    console.log(`🏢 المورد: ${sup.name} (ID: ${sId})`);
    console.log(`الرصيد المسجل بالدليل (Stored): ${sup.balance}`);

    // Invoices
    const pis = purchaseInvoices.filter(p => p.supplierId === sId || (p.supplierName && p.supplierName.trim() === sup.name.trim()));
    console.log(`\n📄 فواتير المشتريات (${pis.length}):`);
    pis.forEach(p => {
      console.log(`  - فاتورة ${p.number || p.invoiceNumber || p.id} بتاريخ ${p.date || 'بدون تاريخ'}: الإجمالي = ${p.totalWithVat || p.total}, المدفوع = ${p.paidAmount}, المتبقي = ${p.remainingAmount}, الحالة = ${p.status || 'نشط'}`);
    });

    // Returns
    const prs = purchaseReturns.filter(p => p.supplierId === sId || (p.supplierName && p.supplierName.trim() === sup.name.trim()));
    if (prs.length > 0) {
      console.log(`\n🔄 مردودات المشتريات (${prs.length}):`);
      prs.forEach(r => {
        console.log(`  - مرتجع ${r.number || r.returnNumber || r.id} بتاريخ ${r.date}: الإجمالي = ${r.totalWithVat || r.total}, الحالة = ${r.status || 'نشط'}`);
      });
    }

    // Expenses (سندات صرف)
    const exps = expenses.filter(e => e.targetId === sId || e.supplierId === sId || (e.beneficiary && e.beneficiary.trim() === sup.name.trim()) || (e.supplierName && e.supplierName.trim() === sup.name.trim()));
    console.log(`\n💵 سندات الصرف / المدفوعات (${exps.length}):`);
    exps.forEach(e => {
      console.log(`  - سند صرف ${e.number || e.voucherNumber || e.id} بتاريخ ${e.date}: المبلغ = ${e.amount}, الوصف = ${e.notes || e.description || ''}, طريقة الدفع = ${e.paymentMethod || 'تحويل'}, الحالة = ${e.status || 'نشط'}`);
    });

    // Receipts (سندات قبض)
    const rcpts = receipts.filter(r => (r.targetId === sId || r.supplierId === sId) && (!r.entityType || r.entityType === 'supplier'));
    if (rcpts.length > 0) {
      console.log(`\n📥 سندات القبض (${rcpts.length}):`);
      rcpts.forEach(r => {
        console.log(`  - سند قبض ${r.number || r.voucherNumber || r.id} بتاريخ ${r.date}: المبلغ = ${r.amount}, الحالة = ${r.status || 'نشط'}`);
      });
    }

    // Journal entries
    const jes = [];
    journalEntries.forEach(j => {
      if (j.status === 'cancelled' || j.isReversed) return;
      const matchingLines = (j.lines || []).filter(l => 
        l.accountName?.includes(sup.name) || 
        l.note?.includes(sup.name) || 
        j.description?.includes(sup.name)
      );
      if (matchingLines.length > 0) {
        jes.push({ je: j, lines: matchingLines });
      }
    });

    if (jes.length > 0) {
      console.log(`\n📝 القيود اليومية / الافتتاحية المرتبطة (${jes.length}):`);
      jes.forEach(({ je, lines }) => {
        console.log(`  - قيد ${je.entryNumber || je.number || je.id} بتاريخ ${je.date}: البيان = ${je.description || ''}, النوع = ${je.sourceType || 'manual'}`);
        lines.forEach(l => {
          console.log(`      حساب: ${l.accountName} (${l.accountCode}) | مدين: ${l.debit || 0} | دائن: ${l.credit || 0} | ملاحظة: ${l.note || ''}`);
        });
      });
    }
  }
}

inspectSupplierTransactions().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
