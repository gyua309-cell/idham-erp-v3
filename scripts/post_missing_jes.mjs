import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function postMissingJEs() {
  const companyId = 'idham-main';
  
  // 1. Post Sales Invoice JE for REP-99810303
  const invJeId = 'JE-INV-REP-99810303';
  const invJeData = {
    companyId: companyId,
    entryNumber: invJeId,
    date: '2026-09-07',
    sourceType: 'salesInvoice',
    sourceId: 'REP-99810303',
    invoiceId: 'REP-99810303',
    referenceId: 'REP-99810303',
    docNumber: 'REP-99810303',
    description: 'مبيعات — فاتورة REP-99810303 — مؤسسة بقالة جسر الخير للمواد الغذائية',
    costCenterId: 'cc_301',
    costCenterName: 'سيارة المندوب مصطفى (ينبع والمسارات)',
    status: 'posted',
    totalDebit: 831.06,
    totalCredit: 831.06,
    createdAt: new Date('2026-09-07T10:00:00Z'),
    updatedAt: new Date().toISOString(),
    createdByName: 'مصطفى',
    lines: [
      {
        accountId: '6oTrhmG2olTwiwtJqFIR',
        accountCode: '1-1-2-1-2-02-04',
        accountName: 'مؤسسة بقالة جسر الخير للمواد الغذائية',
        debit: 831.06,
        credit: 0,
        costCenterId: 'cc_301',
        note: 'فاتورة REP-99810303 — مؤسسة بقالة جسر الخير للمواد الغذائية'
      },
      {
        accountId: 'rpkK6XIgjWaWhqiYCIrG',
        accountCode: '4-1-1',
        accountName: 'إيرادات مبيعات المواد الغذائية',
        debit: 0,
        credit: 722.66,
        costCenterId: 'cc_301',
        note: 'مبيعات فاتورة REP-99810303'
      },
      {
        accountId: '2pD50bcFrs5AzbgoNByg',
        accountCode: '2-1-3-1',
        accountName: 'ضريبة القيمة المضافة - المخرجات',
        debit: 0,
        credit: 108.40,
        costCenterId: 'cc_301',
        note: 'ضريبة فاتورة REP-99810303 15%'
      }
    ]
  };

  const invCogsJeId = 'JE-COGS-REP-99810303';
  const invCogsJeData = {
    companyId: companyId,
    entryNumber: invCogsJeId,
    date: '2026-09-07',
    sourceType: 'salesInvoice_cogs',
    sourceId: 'REP-99810303',
    invoiceId: 'REP-99810303',
    referenceId: 'REP-99810303',
    docNumber: 'REP-99810303',
    description: 'قيد تكلفة البضاعة المباعة — فاتورة مبيعات REP-99810303 — مؤسسة بقالة جسر الخير للمواد الغذائية',
    status: 'posted',
    totalDebit: 671.63,
    totalCredit: 671.63,
    createdAt: new Date('2026-09-07T10:00:00Z'),
    updatedAt: new Date().toISOString(),
    lines: [
      {
        accountId: 'Ujj9nLMrCYbW2pSICnDN',
        accountCode: '5-1-8',
        accountName: 'مصروف تكلفة البضاعة المباعة',
        debit: 671.63,
        credit: 0,
        note: 'إثبات تكلفة البضاعة المباعة لفاتورة #REP-99810303'
      },
      {
        accountId: 'wh_coa_Zyltw7uwvd0aKejdeqQq',
        accountCode: '1-1-4-1-02-01',
        accountName: 'مخزون مخزن سيارة 1 مصطفى',
        debit: 0,
        credit: 671.63,
        note: 'تخفيض مخزون سيارة المندوب بتكلفة المبيعات — فاتورة REP-99810303'
      }
    ]
  };

  // 2. Post Sales Return JE for CR-20005013
  const retJeId = 'JE-SR-CR-20005013';
  const retJeData = {
    companyId: companyId,
    entryNumber: retJeId,
    date: '2026-09-06',
    sourceType: 'salesReturn',
    sourceId: 'CR-20005013',
    returnId: 'CR-20005013',
    referenceId: 'CR-20005013',
    docNumber: 'CR-20005013',
    description: 'مردود مبيعات — إشعار دائن CR-20005013 — مطعم عيش وملح',
    status: 'posted',
    totalDebit: 3274.05,
    totalCredit: 3274.05,
    createdAt: new Date('2026-09-06T10:00:00Z'),
    updatedAt: new Date().toISOString(),
    lines: [
      {
        accountId: '6JbOGL0DDrYHsR3od803',
        accountCode: '4-1-2',
        accountName: 'مردودات ومسموحات المبيعات',
        debit: 2847.00,
        credit: 0,
        note: 'مردود مبيعات إشعار دائن #CR-20005013'
      },
      {
        accountId: '2pD50bcFrs5AzbgoNByg',
        accountCode: '2-1-3-1',
        accountName: 'ضريبة القيمة المضافة - المخرجات',
        debit: 427.05,
        credit: 0,
        note: 'رد ضريبة مردود مبيعات إشعار دائن #CR-20005013'
      },
      {
        accountId: 'Ul3sAi85u8Zm9nDQtzNy',
        accountCode: '1-1-2-1-2-02-26',
        accountName: 'مطعم عيش وملح',
        debit: 0,
        credit: 3274.05,
        note: 'تخفيض حساب العميل بقيمة المردودات إشعار دائن #CR-20005013'
      }
    ]
  };

  const retCogsJeId = 'JE-COGS-CR-20005013';
  const retCogsJeData = {
    companyId: companyId,
    entryNumber: retCogsJeId,
    date: '2026-09-06',
    sourceType: 'salesReturnCOGS',
    sourceId: 'CR-20005013',
    returnId: 'CR-20005013',
    referenceId: 'CR-20005013',
    docNumber: 'CR-20005013',
    description: 'إرجاع تكلفة البضاعة للمخزون — مردود مبيعات CR-20005013 — مطعم عيش وملح',
    status: 'posted',
    totalDebit: 2600.00,
    totalCredit: 2600.00,
    createdAt: new Date('2026-09-06T10:00:00Z'),
    updatedAt: new Date().toISOString(),
    lines: [
      {
        accountId: 'wh_coa_Zyltw7uwvd0aKejdeqQq',
        accountCode: '1-1-4-1-02-01',
        accountName: 'مخزون مخزن سيارة 1 مصطفى',
        debit: 2600.00,
        credit: 0,
        note: 'إعادة إدخال تكلفة البضاعة المردودة لمخزون السيارة — CR-20005013'
      },
      {
        accountId: 'Ujj9nLMrCYbW2pSICnDN',
        accountCode: '5-1-8',
        accountName: 'مصروف تكلفة البضاعة المباعة',
        debit: 0,
        credit: 2600.00,
        note: 'تخفيض تكلفة البضاعة المباعة بمردود #CR-20005013'
      }
    ]
  };

  console.log('Writing JEs to Firestore...');
  await setDoc(doc(db, `companies/${companyId}/journalEntries`, invJeId), invJeData);
  await setDoc(doc(db, `companies/${companyId}/journalEntries`, invCogsJeId), invCogsJeData);
  await setDoc(doc(db, `companies/${companyId}/journalEntries`, retJeId), retJeData);
  await setDoc(doc(db, `companies/${companyId}/journalEntries`, retCogsJeId), retCogsJeData);

  console.log('✅ Created 4 Journal Entries successfully!');

  process.exit(0);
}
postMissingJEs();
