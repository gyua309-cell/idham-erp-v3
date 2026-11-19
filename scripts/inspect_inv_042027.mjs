import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectInvoice042027() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  invSnap.forEach(d => {
    const data = d.data();
    if ((data.number || '').includes('042027') || d.id.includes('042027') || d.id === 'LHjJiEJtbl63m98ehYW5') {
      console.log("Found Invoice:", d.id, data.number, data.customerName, "Total:", data.totalWithVat);
      console.log("Lines count:", (data.lines || []).length);
      console.log("Lines:", JSON.stringify(data.lines, null, 2));
    }
  });
}

inspectInvoice042027().catch(console.error);
