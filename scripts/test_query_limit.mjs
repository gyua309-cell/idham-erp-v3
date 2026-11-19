import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function testQuery() {
  const snapAll = await getDocs(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
  console.log("Total docs without orderBy:", snapAll.size);

  const q = query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), orderBy("createdAt", "desc"), limit(200));
  const snapOrdered = await getDocs(q);
  console.log("Total docs with orderBy('createdAt', 'desc'):", snapOrdered.size);
}

testQuery().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
