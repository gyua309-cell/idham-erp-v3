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
  const boxSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/cashBoxes`, "fldAOs5swMd3RCbxVi8a"));
  console.log("Box balance in DB:", boxSnap.data().balance);

  const accSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, "DDJXykWLQP7HqFvo0X8n"));
  console.log("Account balance in DB:", accSnap.data().balance);

  // Check all JEs for 1-1-1-1-3
  const jeSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  let totalDr = 0, totalCr = 0;
  let lines = [];
  jeSnap.forEach(d => {
    const je = d.data();
    (je.lines || []).forEach(l => {
      if (l.accountCode === "1-1-1-1-3") {
        totalDr += (l.debit || 0);
        totalCr += (l.credit || 0);
        lines.push({ date: je.date, dr: l.debit || 0, cr: l.credit || 0, desc: je.description, entryNum: je.entryNumber });
      }
    });
  });

  console.log(`Total Dr=${totalDr}, Total Cr=${totalCr}, Net=${totalDr - totalCr}`);
  lines.sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  console.log("All JE lines for 1-1-1-1-3:");
  lines.forEach(l => console.log(`  ${l.date} | ${l.entryNum} | Dr: ${l.dr} | Cr: ${l.cr} | ${l.desc?.slice(0,40)}`));
}

run().catch(console.error);
