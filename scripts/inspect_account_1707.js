import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

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
  const accDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, "DDJXykWLQP7HqFvo0X8n"));
  console.log("Account DDJXykWLQP7HqFvo0X8n:", accDoc.data());

  const boxDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/cashBoxes`, "fldAOs5swMd3RCbxVi8a"));
  console.log("Box fldAOs5swMd3RCbxVi8a:", boxDoc.data());
}

run().catch(console.error);
