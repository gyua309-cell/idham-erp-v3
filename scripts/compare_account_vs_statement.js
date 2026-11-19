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
  const accLines = [];
  jesSnap.forEach(d => {
    const je = d.data();
    if (je.status === "cancelled" || je.isReversed) return;
    (je.lines || []).forEach((l, idx) => {
      if (l.accountCode === "1-1-1-1-3" || (l.accountId === "DDJXykWLQP7HqFvo0X8n")) {
        const dr = Number(l.debit || 0);
        const cr = Number(l.credit || 0);
        accLines.push({
          jeId: d.id,
          date: je.date,
          code: je.code || je.entryNumber,
          sourceType: je.sourceType,
          sourceId: je.sourceId,
          description: je.description || l.note,
          dr,
          cr,
          lineIdx: idx
        });
      }
    });
  });

  console.log(`=== JOURNAL ENTRIES FOR ACCOUNT 1-1-1-1-3 (${accLines.length} lines) ===`);
  let totDr = 0, totCr = 0;
  accLines.sort((a,b) => (a.date||"").localeCompare(b.date||""));
  accLines.forEach((l, i) => {
    totDr += l.dr;
    totCr += l.cr;
    console.log(`${i+1}) Date: ${l.date} | Code: ${l.code} | Type: ${l.sourceType} | Dr: ${l.dr} | Cr: ${l.cr} | Run: ${totDr - totCr} | Desc: ${l.description}`);
  });
  console.log(`Total Dr: ${totDr}, Total Cr: ${totCr}, Net: ${totDr - totCr}`);
}

run().catch(console.error);
