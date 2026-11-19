import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain:        "idham-b3a7e.firebaseapp.com",
  projectId:         "idham-b3a7e",
  storageBucket:     "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId:             "1:915839133333:web:fe472e01993025f08a9d9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const company = "idham-main";
  const pSnap = await getDocs(collection(db, `companies/${company}/products`));
  let productId = null;
  pSnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.sku === "02005" || (data.name && data.name.includes("شروق"))) {
      productId = doc.id;
    }
  });

  const txSnap = await getDocs(query(collection(db, `companies/${company}/stockTransactions`), where("productId", "==", productId)));
  const txs = [];
  txSnap.docs.forEach(doc => {
    txs.push({ id: doc.id, ...doc.data() });
  });

  const getDateStr = (t) => {
    if (t.date) return String(t.date).slice(0, 10);
    let secs = t.createdAt?.seconds || t.createdAt?._seconds;
    if (secs) return new Date(secs * 1000).toISOString().slice(0, 10);
    return "2026-08-01";
  };

  txs.forEach(t => t.__dateStr = getDateStr(t));
  txs.sort((a,b) => {
    if (a.__dateStr !== b.__dateStr) return a.__dateStr.localeCompare(b.__dateStr);
    const prio = { "opening": 0, "purchase_in": 1, "purchase_invoice": 1, "sales_return": 2, "transfer_in": 3, "sale_out": 4, "sales_invoice": 4, "transfer_out": 5, "damage": 6 };
    const pA = prio[a.type] !== undefined ? prio[a.type] : 4;
    const pB = prio[b.type] !== undefined ? prio[b.type] : 4;
    return pA - pB;
  });

  console.log("=== TRANSACTIONS 1 TO 20 ===");
  let running = 0;
  txs.slice(0, 20).forEach((t, i) => {
    running += parseFloat(t.qtyChange || 0);
    console.log(`${i+1}. [${t.__dateStr}] type=${(t.type || '').padEnd(22)} change=${t.qtyChange >= 0 ? '+' + t.qtyChange : t.qtyChange} -> running=${running} | doc=${t.documentNumber || t.refId || ''} | notes=${t.notes}`);
  });
}

run().catch(console.error);
