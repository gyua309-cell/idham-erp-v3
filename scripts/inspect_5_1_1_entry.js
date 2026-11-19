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
  const jeSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const septJEs = jeSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j => (j.date || "") >= "2026-09-01" && (j.date || "") <= "2026-09-30");

  septJEs.forEach(je => {
    (je.lines || []).forEach(l => {
      if (l.accountCode === "5-1-1" || l.accountCode?.startsWith("5-1-1")) {
        console.log("Found 5-1-1 line in JE:", je.entryNumber || je.number || je.id);
        console.log("  Date:", je.date);
        console.log("  SourceType:", je.sourceType);
        console.log("  SourceId:", je.sourceId);
        console.log("  Description:", je.description);
        console.log("  Debit:", l.debit, "Credit:", l.credit);
        console.log("  All lines:", je.lines);
      }
    });
  });
}

run();
