import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectPRs() {
  const snap = await getDocs(collection(db, 'companies/idham-main/purchaseRequests'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Total purchaseRequests: ${docs.length}`);
  docs.forEach(d => {
    const items = d.lines || d.items || [];
    console.log(`PR: id=${d.id}, num=${d.number || d.rfqNumber}, date=${d.date || d.requestDate}, itemsCount=${items.length}, title=${d.supplierName || d.title}, createdAt=${JSON.stringify(d.createdAt)}`);
    if (items.length >= 20 || d.number?.includes('RFQ')) {
      console.log(`   Detailed lines count: ${items.length}`);
    }
  });
}

inspectPRs().catch(console.error);
