import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const coaSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
  const accounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const cogsAccs = accounts.filter(a => String(a.code || "").startsWith("5-1"));
  console.log("=== 5-1 ACCOUNTS IN CHART OF ACCOUNTS ===");
  cogsAccs.forEach(a => {
    console.log(`Code: ${a.code} | Name: ${a.name} | Type: ${a.type} | Normal: ${a.normalBalance}`);
  });
}

run();
