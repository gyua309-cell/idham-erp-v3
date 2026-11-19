import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function checkJE() {
  const jeRef = doc(db, 'companies/idham-main/journalEntries', 'BKADpEsth1SQtUcqevEm');
  const snap = await getDoc(jeRef);
  if (snap.exists()) {
    console.log("Found stored JE doc:", JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("JE BKADpEsth1SQtUcqevEm DOES NOT EXIST in Firestore!");
  }

  // Check all JEs for 042022
  const allJeSnap = await getDocs(collection(db, 'companies/idham-main/journalEntries'));
  allJeSnap.docs.forEach(d => {
    const data = d.data();
    if (JSON.stringify(data).includes("042022") || JSON.stringify(data).includes("4rmxK0LaBnL3hdKRd8sj")) {
      console.log("Matched JE:", d.id, JSON.stringify(data, null, 2));
    }
  });
}

checkJE().catch(console.error);
