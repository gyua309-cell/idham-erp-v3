import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
  storageBucket: "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId: "1:915839133333:web:fe472e01993025f08a9d9c",
  measurementId: "G-Y797B0GWYK"
};

const app = initializeApp(firebaseConfig, 'fix-jazira');
const db = getFirestore(app);
const companyId = 'idham-main';

async function fix() {
  console.log('--- Inspecting btx_je_djqvBMyoqYT4WuGkGqEg_bank_aljazira_0 ---');
  const txnRef = doc(db, `companies/${companyId}/bankTransactions`, 'btx_je_djqvBMyoqYT4WuGkGqEg_bank_aljazira_0');
  const txnSnap = await getDoc(txnRef);

  if (txnSnap.exists()) {
    console.log('Current txn data:', txnSnap.data());
    // Update bankAccountId to gUUIXCOI7KtEw2HFn2Tp (بنك الراجحى عهد)
    await updateDoc(txnRef, {
      bankAccountId: 'gUUIXCOI7KtEw2HFn2Tp'
    });
    console.log('✅ Updated transaction bankAccountId to gUUIXCOI7KtEw2HFn2Tp (بنك الراجحى عهد)');
  } else {
    console.log('Transaction not found by that id.');
  }

  // Update bank-aljazira balance to 0 in bankAccounts
  const jaziraRef = doc(db, `companies/${companyId}/bankAccounts`, 'bank-aljazira');
  await updateDoc(jaziraRef, { balance: 0 });
  console.log('✅ Updated bank-aljazira balance to 0 in bankAccounts');

  // Update gUUIXCOI7KtEw2HFn2Tp (بنك الراجحى عهد) balance to 100 in bankAccounts
  const ahdRef = doc(db, `companies/${companyId}/bankAccounts`, 'gUUIXCOI7KtEw2HFn2Tp');
  await updateDoc(ahdRef, { balance: 100 });
  console.log('✅ Updated bank_rajhi_ahd balance to 100 in bankAccounts');

  console.log('🎉 Fix completed successfully!');
  process.exit(0);
}

fix().catch(err => {
  console.error('Error during fix:', err);
  process.exit(1);
});
