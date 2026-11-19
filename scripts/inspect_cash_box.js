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
  const cbSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/cashBoxes`));
  console.log("=== Cash Boxes ===");
  cbSnap.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id} | Name: [${data.name}] | AccountCode: [${data.accountCode}] | Balance: ${data.balance}`);
  });
}

run().catch(console.error);
