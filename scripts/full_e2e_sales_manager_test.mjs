import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
};

const app = initializeApp(firebaseConfig, 'e2e-salesmgr');
const db = getFirestore(app);
const companyId = 'idham-main';

async function runE2ETest() {
  console.log('====================================================');
  console.log('🚀 STARTING FULL E2E WORKFLOW TEST FOR SALES MANAGER');
  console.log('====================================================');

  // Baseline audit
  const snapInitialCusts = await getDocs(collection(db, `companies/${companyId}/customers`));
  const initialCustCount = snapInitialCusts.size;
  const snapInitialJEs = await getDocs(collection(db, `companies/${companyId}/journalEntries`));
  const initialJECount = snapInitialJEs.size;
  const snapInitialInvs = await getDocs(collection(db, `companies/${companyId}/salesInvoices`));
  const initialInvCount = snapInitialInvs.size;

  console.log(`[Baseline] Customers: ${initialCustCount} | Journal Entries: ${initialJECount} | Invoices: ${initialInvCount}`);

  // Test Phase 1: Sales Manager Submits a New Client with KYC Attachments & Agreement
  const testCustId = `e2e_cust_${Date.now()}`;
  console.log(`\n[Phase 1] Sales Manager Submitting Customer: ${testCustId}...`);

  const initialPayload = {
    name: "مطاعم واحة الضيافة الماسية",
    code: "CUST-88888",
    legalForm: "شركة ذات مسؤولية محدودة",
    activityType: "مطاعم وإعاشة وتوريد أطعمة",
    crNumber: "7098765432",
    crDate: "2026-03-20",
    crSource: "ينبع",
    vatNumber: "319988776600003",
    phone: "0540001122",
    mobile: "0540001122",
    email: "hospitality@diamond.sa",
    city: "ينبع",
    district: "حي الشاطئ",
    street: "طريق الكورنيش",
    postalCode: "46424",
    address: "ينبع - حي الشاطئ - طريق الكورنيش",
    googleMapsUrl: "https://maps.google.com/?q=24.1021,38.0450",
    repId: "Z8vkxuOfaumR63DMz7vA",
    repName: "مصطفى",
    assignedRepId: "Z8vkxuOfaumR63DMz7vA",
    creditLimit: 30000,
    creditDays: 30,
    paymentMethod: "credit",
    ownerName: "سليمان عبدالرحمن الغامدي",
    ownerId: "1055443322",
    ownerPhone: "0540001122",
    signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    attachments: [
      { docId: "cr_doc", title: "السجل التجاري", fileName: "cr_7098765432.pdf", uploadedAt: new Date().toISOString() },
      { docId: "vat_doc", title: "شهادة ضريبة القيمة المضافة ZATCA", fileName: "vat_cert.pdf", uploadedAt: new Date().toISOString() },
      { docId: "license_doc", title: "رخصة البلدية للمطعم", fileName: "license_yanbu.jpg", uploadedAt: new Date().toISOString() },
      { docId: "owner_id_doc", title: "الهوية الوطنية للمالك", fileName: "owner_id.jpg", uploadedAt: new Date().toISOString() }
    ],
    hasAgreement: true,
    approvalStatus: "pending",
    status: "pending_approval",
    source: "sales_manager_portal",
    balance: 0,
    currentBalance: 0,
    priceList: "default",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const custDocRef = doc(db, `companies/${companyId}/customers`, testCustId);
  await setDoc(custDocRef, initialPayload);
  console.log(`✅ [Phase 1 Success] Customer saved in Firestore with status: pending_approval`);

  // Verify Phase 1
  let snap = await getDoc(custDocRef);
  if (!snap.exists()) throw new Error('Customer document does not exist!');
  let cData = snap.data();
  if (cData.status !== "pending_approval") throw new Error('Customer status should be pending_approval!');
  if (cData.attachments.length !== 4) throw new Error('Expected 4 attachments!');
  if (!cData.signatureDataUrl) throw new Error('Expected digital signature!');

  // Test Phase 2: Sales Manager edits the customer to adjust credit limit and add 5th attachment (Bank IBAN)
  console.log(`\n[Phase 2] Sales Manager Updating Customer Credit Limit & Attachments...`);
  const updatedAttachments = [
    ...cData.attachments,
    { docId: "iban_doc", title: "شهادة الآيبان البنكي", fileName: "iban_alinma.pdf", uploadedAt: new Date().toISOString() }
  ];
  await updateDoc(custDocRef, {
    creditLimit: 35000,
    attachments: updatedAttachments,
    updatedAt: serverTimestamp()
  });

  snap = await getDoc(custDocRef);
  cData = snap.data();
  if (cData.creditLimit !== 35000) throw new Error('Credit limit update failed!');
  if (cData.attachments.length !== 5) throw new Error('5th attachment was not added!');
  console.log(`✅ [Phase 2 Success] Credit limit updated to ${cData.creditLimit} SAR, attachments: ${cData.attachments.length}`);

  // Test Phase 3: Admin Reviews KYC & Approves Customer
  console.log(`\n[Phase 3] Admin / Finance Approves Customer...`);
  await updateDoc(custDocRef, {
    status: "active",
    approvalStatus: "approved",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  snap = await getDoc(custDocRef);
  cData = snap.data();
  if (cData.status !== "active" || cData.approvalStatus !== "approved") {
    throw new Error('Customer approval failed!');
  }
  console.log(`✅ [Phase 3 Success] Customer successfully approved and active!`);

  // Test Phase 4: System Integrity Audit
  console.log(`\n[Phase 4] System Integrity & Side-Effect Check...`);
  const snapPostJEs = await getDocs(collection(db, `companies/${companyId}/journalEntries`));
  const postJECount = snapPostJEs.size;
  const snapPostInvs = await getDocs(collection(db, `companies/${companyId}/salesInvoices`));
  const postInvCount = snapPostInvs.size;

  console.log(`Journal Entries Count: ${postJECount} (Matches initial ${initialJECount}: ${postJECount === initialJECount})`);
  console.log(`Invoices Count: ${postInvCount} (Matches initial ${initialInvCount}: ${postInvCount === initialInvCount})`);

  if (postJECount !== initialJECount) throw new Error('FATAL: Journal entries changed unexpectedly!');
  if (postInvCount !== initialInvCount) throw new Error('FATAL: Invoices changed unexpectedly!');

  // Test Phase 5: Clean Up
  console.log(`\n[Phase 5] Clean up test record...`);
  await deleteDoc(custDocRef);
  const snapFinalCusts = await getDocs(collection(db, `companies/${companyId}/customers`));
  console.log(`Final Customer Count: ${snapFinalCusts.size} (Matches baseline: ${snapFinalCusts.size === initialCustCount})`);

  console.log('\n====================================================');
  console.log('🏆 ALL E2E TESTS PASSED 100% WITH ZERO SIDE-EFFECTS!');
  console.log('====================================================');
}

runE2ETest().catch(console.error);
