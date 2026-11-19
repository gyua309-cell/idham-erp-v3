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
  const [jeSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`))
  ]);

  const accMap = {};
  coaSnap.docs.forEach(d => {
    const data = d.data();
    accMap[d.id] = data;
    if (data.code) accMap[data.code] = data;
  });

  const from = "2026-09-01";
  const to = "2026-09-30";

  const septJEs = jeSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j => (j.date || "") >= from && (j.date || "") <= to);

  const accBalances = {};

  septJEs.forEach(je => {
    (je.lines || []).forEach(l => {
      const code = l.accountCode || accMap[l.accountId]?.code || "UNKNOWN";
      const name = l.accountName || accMap[l.accountId]?.name || "UNKNOWN";
      const dr = parseFloat(l.debit || 0);
      const cr = parseFloat(l.credit || 0);
      if (!accBalances[code]) accBalances[code] = { code, name, debit: 0, credit: 0, netExp: 0, entries: [] };
      accBalances[code].debit += dr;
      accBalances[code].credit += cr;
      accBalances[code].netExp += (dr - cr);
      accBalances[code].entries.push({ jeNum: je.entryNumber || je.refNumber || je.id, date: je.date, dr, cr, type: je.sourceType, desc: je.description });
    });
  });

  console.log("=== ALL ACCOUNTS STARTING WITH 5-1 IN SEPTEMBER 2026 ===");
  Object.keys(accBalances).filter(c => c.startsWith("5-1")).forEach(c => {
    const a = accBalances[c];
    console.log(`Account ${a.code} (${a.name}):`);
    console.log(`  Total Debit: ${a.debit.toFixed(2)} | Total Credit: ${a.credit.toFixed(2)} | Net (Dr-Cr): ${a.netExp.toFixed(2)} | Entries Count: ${a.entries.length}`);
  });

  // Check 5-1-8 lines that have credits
  const cogsCredits = accBalances["5-1-8"]?.entries.filter(e => e.cr > 0) || [];
  console.log(`\n=== 5-1-8 CREDITS (Returns/Adjustments): ${cogsCredits.length} ===`);
  cogsCredits.forEach(e => {
    console.log(`  JE: ${e.jeNum} | Date: ${e.date} | Type: ${e.type} | Credit: ${e.cr} | Desc: ${e.desc}`);
  });

  // Check 5-1-8 lines that are not salesCOGS
  const nonSalesCOGS = accBalances["5-1-8"]?.entries.filter(e => e.type !== "salesCOGS") || [];
  console.log(`\n=== 5-1-8 NON-salesCOGS ENTRIES: ${nonSalesCOGS.length} ===`);
  nonSalesCOGS.forEach(e => {
    console.log(`  JE: ${e.jeNum} | Date: ${e.date} | Type: ${e.type} | Dr: ${e.dr} | Cr: ${e.cr} | Desc: ${e.desc}`);
  });
}

run();
