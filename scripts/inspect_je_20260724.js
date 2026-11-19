import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  jesSnap.forEach(d => {
    const je = d.data();
    if (je.code === "JE-2026-20260724" || d.id.includes("20260724")) {
      console.log(`\n=== JE Doc ID: ${d.id} | Code: ${je.code} | Date: ${je.date} ===`);
      console.log("Header:", { date: je.date, desc: je.description, status: je.status, sourceType: je.sourceType });
      console.log("Lines (" + (je.lines || []).length + "):");
      (je.lines || []).forEach((l, i) => {
        console.log(`  Line ${i+1}: AccCode: ${l.accountCode} | AccName: ${l.accountName} | Dr: ${l.debit} | Cr: ${l.credit} | Note: ${l.note || l.description}`);
      });
    }
  });
}

run().catch(console.error);
