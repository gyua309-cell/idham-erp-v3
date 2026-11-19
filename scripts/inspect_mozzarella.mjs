import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function inspectMozzarella() {
  const pSnap = await getDocs(collection(db, 'companies/idham-main/products'));
  const prods = [];
  pSnap.forEach(d => {
    const p = d.data();
    if ((p.name || '').includes('موزريلا') || (p.name || '').includes('موزاريلا') || (p.name || '').includes('2300')) {
      prods.push({ id: d.id, ...p });
    }
  });

  console.log(`Found ${prods.length} matching products:`);
  for (const p of prods) {
    console.log("\n==================================");
    console.log("Product:", p.name);
    console.log("ID:", p.id);
    console.log("Unit:", p.unit, "altUnit:", p.altUnit, "unitFactor:", p.unitFactor);
    console.log("totalQty in product doc:", p.totalQty);

    // Check stockByWarehouse
    const sSnap = await getDocs(collection(db, 'companies/idham-main/stockByWarehouse'));
    sSnap.forEach(d => {
      if (d.data().productId === p.id) {
        console.log(`Stock doc ${d.id} (wh: ${d.data().warehouseId}): qty = ${d.data().qty}`);
      }
    });

    // Check all stock transactions
    console.log("--- Recent Stock Transactions ---");
    const stSnap = await getDocs(query(collection(db, 'companies/idham-main/stockTransactions'), where('productId', '==', p.id)));
    console.log(`Found ${stSnap.size} transactions:`);
    stSnap.forEach(d => {
      const st = d.data();
      console.log(d.id, "=>", st.date, st.type, "qty:", st.qtyChange, "wh:", st.warehouseId, "notes:", st.notes, "docNum:", st.documentNumber || st.refId);
    });
  }
}

inspectMozzarella().catch(console.error);
