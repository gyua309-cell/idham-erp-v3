import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function findExactJE() {
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  jesSnap.forEach(d => {
    const data = d.data();
    const str = JSON.stringify(data);
    if (str.includes("2314.76") || str.includes("2,314.76") || (data.description && data.description.includes("من الجارى الى مصرف الراجحى"))) {
      console.log("FOUND JE DOC ID:", d.id);
      console.log(JSON.stringify(data, null, 2));
    }
  });
}

findExactJE().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
