import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectRawAdj() {
  const adjSnap = await getDocs(collection(db, 'companies/idham-main/inventoryAdjustments'));
  const adjs = adjSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${adjs.length} adjustments.`);
  if (adjs.length > 0) {
    console.log('Sample Adjustment 1:', JSON.stringify(adjs[0], null, 2));
    if (adjs.length > 1) {
      console.log('Sample Adjustment 2:', JSON.stringify(adjs[1], null, 2));
    }
  }
}

inspectRawAdj().catch(console.error);
