import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, runTransaction, serverTimestamp, increment, writeBatch } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = 'idham-main';

async function run() {
  console.log("Checking if JE for DN-000001 already exists...");
  const jeColl = collection(db, `companies/${COMPANY_ID}/journalEntries`);
  const existingSnap = await getDocs(jeColl);
  const existing = existingSnap.docs.find(d => {
    const data = d.data();
    return (data.sourceType === "deliveryNote" || data.refNumber === "DN-000001") && data.status !== "cancelled";
  });

  if (existing) {
    console.log("JE for DN-000001 already exists:", existing.id, existing.data().entryNumber);
    return;
  }

  // 1. Get next sequence from counters/journal
  const counterRef = doc(db, `companies/${COMPANY_ID}/counters`, "journal");
  let entryNumber;
  let entryRef;

  const totalAmount = 1080.00;
  const date = "2026-10-08";
  const dnDocId = "rAOBcpmRaQ8TOnr7Q8Rm";
  const dnNum = "DN-000001";

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const seq  = snap.exists() ? (snap.data().seq || 0) + 1 : 1;
    tx.set(counterRef, { seq, updatedAt: serverTimestamp() });
    entryNumber = `JE-${String(seq).padStart(6, "0")}`;

    entryRef = doc(collection(db, `companies/${COMPANY_ID}/journalEntries`));
    tx.set(entryRef, {
      entryNumber: entryNumber,
      code: entryNumber,
      date: date,
      description: `سند تسليم بضاعة مبيعات رقم ${dnNum} — تموينات ريف رضوى`,
      refNumber: dnNum,
      sourceType: "deliveryNote",
      sourceId: dnDocId,
      status: "posted",
      isAuto: true,
      createdByName: "مدير النظام",
      createdAt: serverTimestamp(),
      totalDebit: totalAmount,
      totalCredit: totalAmount,
      lines: [
        {
          accountCode: "1-1-2-1-2-25-01",
          accountId: "ZPc4edBplkJ5RgjorBPF",
          accountName: "تموينات ريف رضوى",
          debit: totalAmount,
          credit: 0,
          note: `سند تسليم بضاعة ${dnNum} — آجل`
        },
        {
          accountCode: "4-1-1",
          accountId: "rpkK6XIgjWaWhqiYCIrG",
          accountName: "إيرادات مبيعات المواد الغذائية",
          debit: 0,
          credit: totalAmount,
          note: `إيراد تسليم بضاعة ${dnNum}`
        }
      ]
    });
  });

  console.log(`Created Sales JE ${entryNumber} (id: ${entryRef.id}) for ${dnNum}`);

  // 2. Also create COGS entry: 982.50
  const cogsAmount = 982.50;
  let cogsEntryNumber;
  let cogsEntryRef;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const seq  = snap.exists() ? (snap.data().seq || 0) + 1 : 1;
    tx.set(counterRef, { seq, updatedAt: serverTimestamp() });
    cogsEntryNumber = `JE-${String(seq).padStart(6, "0")}`;

    cogsEntryRef = doc(collection(db, `companies/${COMPANY_ID}/journalEntries`));
    tx.set(cogsEntryRef, {
      entryNumber: cogsEntryNumber,
      code: cogsEntryNumber,
      date: date,
      description: `تكلفة بضاعة مباعة — سند تسليم ${dnNum}`,
      refNumber: dnNum,
      sourceType: "deliveryNote_cogs",
      sourceId: dnDocId,
      status: "posted",
      isAuto: true,
      createdByName: "مدير النظام",
      createdAt: serverTimestamp(),
      totalDebit: cogsAmount,
      totalCredit: cogsAmount,
      lines: [
        {
          accountCode: "5-1-8",
          accountId: "Ujj9nLMrCYbW2pSICnDN",
          accountName: "مصروف تكلفة البضاعة المباعة",
          debit: cogsAmount,
          credit: 0,
          note: `تكلفة بضاعة مسلّمة سند ${dnNum}`
        },
        {
          accountCode: "1-1-4-1-01",
          accountId: "wh_coa_W5uANJjMgfFh2p3xU4bT",
          accountName: "مخزون المستودع الرئيسى",
          debit: 0,
          credit: cogsAmount,
          note: `صرف مخزون تسليم بضاعة سند ${dnNum}`
        }
      ]
    });
  });

  console.log(`Created COGS JE ${cogsEntryNumber} (id: ${cogsEntryRef.id}) for ${dnNum}`);

  // 3. Update Delivery Note document to reference the JEs
  await updateDoc(doc(db, `companies/${COMPANY_ID}/deliveryNotes`, dnDocId), {
    journalEntryId: entryRef.id,
    journalEntryNumber: entryNumber,
    cogsJournalEntryId: cogsEntryRef.id,
    cogsJournalEntryNumber: cogsEntryNumber,
    totalCost: cogsAmount,
    updatedAt: serverTimestamp()
  });

  console.log("Updated delivery note document with JE references.");

  // 4. Run balance sync for chart of accounts
  console.log("Syncing COA balances...");
  const allJEs = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const drMap = {}, crMap = {};
  allJEs.forEach(d => {
    const data = d.data();
    if (data.status === "cancelled") return;
    (data.lines || []).forEach(l => {
      const code = l.accountCode;
      const accId = l.accountId;
      if (code) {
        drMap[code] = (drMap[code] || 0) + (parseFloat(l.debit) || 0);
        crMap[code] = (crMap[code] || 0) + (parseFloat(l.credit) || 0);
      }
      if (accId) {
        drMap[accId] = (drMap[accId] || 0) + (parseFloat(l.debit) || 0);
        crMap[accId] = (crMap[accId] || 0) + (parseFloat(l.credit) || 0);
      }
    });
  });

  const coaSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
  for (const docSnap of coaSnap.docs) {
    const acc = docSnap.data();
    const totalDr = drMap[acc.code] || drMap[docSnap.id] || 0;
    const totalCr = crMap[acc.code] || crMap[docSnap.id] || 0;
    const delta = totalDr - totalCr;
    const isCredit = ['liability', 'equity', 'revenue'].includes(acc.type);
    const balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
    
    await updateDoc(docSnap.ref, {
      totalDebit: Math.round(totalDr * 100) / 100,
      totalCredit: Math.round(totalCr * 100) / 100,
      balance: balance
    });
  }

  console.log("✅ Successfully created JEs and synchronized Chart of Accounts!");
}

run().catch(console.error);
