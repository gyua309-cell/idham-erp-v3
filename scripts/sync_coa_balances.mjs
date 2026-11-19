import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function syncBalances() {
  const companyId = 'idham-main';
  const jeSnap = await getDocs(collection(db, `companies/${companyId}/journalEntries`));
  const coaSnap = await getDocs(collection(db, `companies/${companyId}/chartOfAccounts`));

  const drMap = {}, crMap = {};
  jeSnap.forEach(d => {
    const data = d.data();
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
  console.log('✅ Synchronized all COA balances with latest Journal Entries!');
  process.exit(0);
}
syncBalances();
