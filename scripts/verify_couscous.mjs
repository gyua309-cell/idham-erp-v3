import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  projectId: "idham-b3a7e"
});
const db = getFirestore(app);

async function check() {
  const stock = await getDoc(doc(db, "companies/idham-main/stockByWarehouse/W5uANJjMgfFh2p3xU4bT_q2tZaPlKzV3e494rozAp"));
  const prod = await getDoc(doc(db, "companies/idham-main/products/q2tZaPlKzV3e494rozAp"));
  console.log("VERIFIED: Warehouse Qty =", stock.data()?.qty, "| Master TotalQty =", prod.data()?.totalQty);
}

check().catch(console.error);
