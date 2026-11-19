import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain:        "idham-b3a7e.firebaseapp.com",
  projectId:         "idham-b3a7e",
  storageBucket:     "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId:             "1:915839133333:web:fe472e01993025f08a9d9c",
  measurementId:     "G-Y797B0GWYK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function run() {
  const cashBoxId = "fldAOs5swMd3RCbxVi8a";
  const boxAccountCode = "1-1-1-1-3";

  // Check all cashTransactions
  const txSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/cashTransactions`), where("cashBoxId", "==", cashBoxId)));
  console.log("--- cashTransactions ---");
  txSnap.forEach(d => {
    const data = d.data();
    console.log(d.id, data.date, data.type, data.amount, data.sourceType, data.sourceId, data.notes);
  });

  // Check expenses with cashBoxId
  const expSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), where("cashBoxId", "==", cashBoxId)));
  console.log("--- expenses ---");
  expSnap.forEach(d => {
    const data = d.data();
    console.log(d.id, data.date, data.amount, data.code, data.notes);
  });
}

run().catch(console.error);
