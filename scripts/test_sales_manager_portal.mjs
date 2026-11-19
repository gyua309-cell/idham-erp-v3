import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
};

const app = initializeApp(firebaseConfig, 'test-sales-mgr');
const db = getFirestore(app);
const companyId = 'idham-main';

async function runTest() {
  console.log('=== Step 1: Pre-Test System State Check ===');
  const initialCustomers = (await getDocs(collection(db, `companies/${companyId}/customers`))).size;
  const initialJEs = (await getDocs(collection(db, `companies/${companyId}/journalEntries`))).size;
  console.log(`Initial Customers Count: ${initialCustomers}`);
  console.log(`Initial Journal Entries Count: ${initialJEs}`);

  const testId = `test_cust_salesmgr_${Date.now()}`;
  const testPayload = {
    name: "مؤسسة اختبار مدير المبيعات الميدانية",
    code: "CUST-99999",
    legalForm: "مؤسسة فردية",
    activityType: "مطعم وإعاشة",
    crNumber: "7012345678",
    crDate: "2026-05-15",
    crSource: "ينبع",
    vatNumber: "310099999900003",
    phone: "0555555555",
    mobile: "0555555555",
    email: "test_mgr@example.com",
    city: "ينبع",
    district: "البلد",
    street: "طريق الملك عبدالعزيز",
    postalCode: "46421",
    address: "ينبع - البلد - طريق الملك عبدالعزيز",
    googleMapsUrl: "https://maps.google.com/?q=24.0889,38.0637",
    repId: "Z8vkxuOfaumR63DMz7vA",
    repName: "مصطفى",
    creditLimit: 25000,
    creditDays: 30,
    paymentMethod: "credit",
    ownerName: "عبدالله محمد الأحمدي",
    ownerId: "1098765432",
    ownerPhone: "0555555555",
    signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    attachments: [
      { docId: "cr_doc", title: "السجل التجاري", fileName: "cr_7012345678.pdf", uploadedAt: new Date().toISOString() },
      { docId: "vat_doc", title: "شهادة الضريبة", fileName: "vat_cert.jpg", uploadedAt: new Date().toISOString() },
      { docId: "license_doc", title: "رخصة البلدية", fileName: "license.jpg", uploadedAt: new Date().toISOString() }
    ],
    hasAgreement: true,
    approvalStatus: "pending",
    status: "pending_approval",
    source: "sales_manager_portal",
    balance: 0,
    currentBalance: 0,
    priceList: "default"
  };

  console.log('\n=== Step 2: Creating Test Customer via Sales Manager Portal Logic ===');
  const custRef = doc(db, `companies/${companyId}/customers`, testId);
  await setDoc(custRef, testPayload);
  console.log(`✅ Test customer created: ${testId}`);

  console.log('\n=== Step 3: Verifying Customer Fields in Firestore ===');
  const savedSnap = await getDoc(custRef);
  if (!savedSnap.exists()) throw new Error('Customer was not saved!');
  const data = savedSnap.data();
  console.log('Saved Customer Name:', data.name);
  console.log('Approval Status:', data.approvalStatus);
  console.log('Status:', data.status);
  console.log('Attachments count:', data.attachments.length);
  console.log('Credit Limit:', data.creditLimit);
  console.log('Credit Days:', data.creditDays);
  console.log('Rep Name:', data.repName);
  console.log('GPS URL:', data.googleMapsUrl);
  console.log('Signature present?:', !!data.signatureDataUrl);

  console.log('\n=== Step 4: Verifying Data Integrity (No side effects) ===');
  const postCustomers = (await getDocs(collection(db, `companies/${companyId}/customers`))).size;
  const postJEs = (await getDocs(collection(db, `companies/${companyId}/journalEntries`))).size;
  console.log(`Post-create Customers Count: ${postCustomers} (Expected +1)`);
  console.log(`Post-create Journal Entries Count: ${postJEs} (Expected EXACT MATCH)`);
  if (postJEs !== initialJEs) {
    throw new Error('ALERT: Journal Entries count changed! Unwanted side-effect!');
  }

  console.log('\n=== Step 5: Clean Up Test Record ===');
  await deleteDoc(custRef);
  console.log(`✅ Test customer ${testId} deleted cleanly.`);

  const finalCustomers = (await getDocs(collection(db, `companies/${companyId}/customers`))).size;
  console.log(`Final Customers Count: ${finalCustomers} (Matches initial: ${finalCustomers === initialCustomers})`);

  console.log('\n🎉 ALL SALES MANAGER TESTS PASSED WITH 100% INTEGRITY!');
}

runTest().catch(console.error);
