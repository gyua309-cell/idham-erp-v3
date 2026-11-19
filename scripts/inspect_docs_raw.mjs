import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectRaw() {
  const piSnap = await getDoc(doc(db, 'companies/idham-main/purchaseInvoices', '5mBKJ7del4HLaSeHAjdg'));
  console.log("=== PI 5mBKJ7del4HLaSeHAjdg RAW ===");
  console.log(JSON.stringify(piSnap.data(), null, 2));

  const siSnap = await getDoc(doc(db, 'companies/idham-main/salesInvoices', 'FvN34BzjYJeMX6AbFnTn'));
  console.log("\n=== SI FvN34BzjYJeMX6AbFnTn (INV-042028) RAW ===");
  console.log(JSON.stringify(siSnap.data(), null, 2));
}

inspectRaw().catch(console.error);
