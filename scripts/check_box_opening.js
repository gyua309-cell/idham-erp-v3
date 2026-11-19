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
  const boxDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/cashBoxes`, "fldAOs5swMd3RCbxVi8a"));
  console.log("Box Data:", boxDoc.data());

  const accSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
  let acc11113 = null;
  accSnap.forEach(d => {
    if (d.data().code === "1-1-1-1-3") acc11113 = { id: d.id, ...d.data() };
  });
  console.log("COA Account 1-1-1-1-3:", acc11113);
}

run().catch(console.error);
