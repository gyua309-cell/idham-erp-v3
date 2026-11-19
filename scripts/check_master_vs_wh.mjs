import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function run() {
  const prodIds = [
    'bJ7SHrAJrGUmxRXK5uIt', // كاري مهران صغير
    'c87KVwQ4KpLT51MM3l1u', // كاري مهران كبير
    'tAq8ENjtZ0cRpzhW6xFH', // شطة رنا قوارير
    'SQnrnOyRXWzq76NO3yXB'  // ارز ديوان
  ];

  const sbwSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
  const allSbw = sbwSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const whSnap = await getDocs(collection(db, 'companies/idham-main/warehouses'));
  const whMap = {};
  whSnap.docs.forEach(d => whMap[d.id] = d.data().name);

  for (const id of prodIds) {
    const pSnap = await getDoc(doc(db, 'companies/idham-main/products', id));
    const p = pSnap.data();
    const entries = allSbw.filter(s => s.productId === id);
    const sumWh = entries.reduce((acc, s) => acc + (s.qty || 0), 0);
    console.log(`\nProduct: [${id}] ${p.name}`);
    console.log(`  Master totalQty: ${p.totalQty} | Master stock: ${p.stock}`);
    console.log(`  Sum of stockByWarehouse: ${sumWh}`);
    entries.forEach(s => console.log(`    WH [${s.warehouseId}] (${whMap[s.warehouseId]}): ${s.qty}`));
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
