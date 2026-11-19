import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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
  console.log("=== 1. CASH BOXES ===");
  const cbSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/cashBoxes`));
  let mainBox = null;
  cbSnap.forEach(d => {
    const data = d.data();
    console.log(`Box ID: ${d.id} | Name: ${data.name} | Balance: ${data.balance} | AccountCode: ${data.accountCode} | AccountId: ${data.accountId}`);
    if (data.name && data.name.includes("الرئيسي") || d.id === "main" || data.type === "main") {
      mainBox = { id: d.id, ...data };
    }
  });

  if (!mainBox) {
    console.log("Main box not found!");
    return;
  }

  console.log("\n=== 2. CHART OF ACCOUNTS FOR MAIN BOX ===");
  const coaSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
  const accounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const mainAcc = accounts.find(a => 
    a.id === mainBox.accountId || 
    a.code === mainBox.accountCode || 
    a.code === "1-1-1-1-3" ||
    (a.name && a.name.includes("الرئيسي"))
  );
  if (mainAcc) {
    console.log(`Main Acc: ${mainAcc.code} - ${mainAcc.name} | Balance: ${mainAcc.balance} | Type: ${mainAcc.type} | Normal: ${mainAcc.normalBalance}`);
  }

  console.log("\n=== 3. JOURNAL ENTRIES FOR MAIN BOX ACCOUNT ===");
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  let totalDr = 0;
  let totalCr = 0;
  const jeRows = [];
  jesSnap.forEach(d => {
    const je = d.data();
    if (je.status === "cancelled" || je.isReversed) return;
    (je.lines || []).forEach(l => {
      const codeMatch = mainAcc && l.accountCode === mainAcc.code;
      const nameMatch = l.accountName && l.accountName.includes("الرئيسي");
      if (codeMatch || nameMatch) {
        const dr = Number(l.debit || 0);
        const cr = Number(l.credit || 0);
        totalDr += dr;
        totalCr += cr;
        jeRows.push({
          jeId: d.id,
          date: je.date,
          code: je.code || je.entryNumber,
          sourceType: je.sourceType,
          sourceId: je.sourceId,
          description: je.description || l.note,
          dr,
          cr
        });
      }
    });
  });

  console.log(`Found ${jeRows.length} JE lines impacting Main Box:`);
  jeRows.sort((a,b) => (a.date||"").localeCompare(b.date||""));
  jeRows.forEach((r, idx) => {
    console.log(`${idx+1}) Date: ${r.date} | Code: ${r.code} | Type: ${r.sourceType} | Dr: ${r.dr} | Cr: ${r.cr} | Desc: ${r.description} | Src: ${r.sourceId}`);
  });
  console.log(`Total Dr: ${totalDr}, Total Cr: ${totalCr}, Net (Dr - Cr): ${totalDr - totalCr}`);

  console.log("\n=== 4. CASH TRANSACTIONS FOR MAIN BOX ===");
  const ctxSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/cashTransactions`), where("cashBoxId", "==", mainBox.id)));
  console.log(`Found ${ctxSnap.size} cash transactions:`);
  let ctxIn = 0;
  let ctxOut = 0;
  ctxSnap.forEach(d => {
    const t = d.data();
    console.log(`ID: ${d.id} | Date: ${t.date} | Type: ${t.type} | Amount: ${t.amount} | Notes: ${t.notes} | SourceType: ${t.sourceType} | SourceId: ${t.sourceId}`);
    if (t.type === "in") ctxIn += Number(t.amount || 0);
    else ctxOut += Number(t.amount || 0);
  });
  console.log(`Ctx Total In: ${ctxIn}, Ctx Total Out: ${ctxOut}, Net: ${ctxIn - ctxOut}`);

  console.log("\n=== 5. EXPENSES FOR MAIN BOX ===");
  const expSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), where("sourceId", "==", mainBox.id)));
  console.log(`Found ${expSnap.size} expenses with sourceId == mainBox.id:`);
  expSnap.forEach(d => {
    const e = d.data();
    console.log(`ID: ${d.id} | Date: ${e.date} | Code: ${e.code} | Amount: ${e.amount} | Beneficiary: ${e.supplierName || e.accountName || e.category} | Notes: ${e.notes}`);
  });

  console.log("\n=== 6. RECEIPTS FOR MAIN BOX ===");
  const rcptSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceId", "==", mainBox.id)));
  console.log(`Found ${rcptSnap.size} receipts with sourceId == mainBox.id:`);
  rcptSnap.forEach(d => {
    const r = d.data();
    console.log(`ID: ${d.id} | Date: ${r.date} | Code: ${r.code || r.displayCode} | Amount: ${r.amount} | Customer: ${r.customerName} | Notes: ${r.notes}`);
  });

  console.log("\n=== 7. CHECK ANY TRANSACTIONS OF 71 SAR ===");
  const allExpSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/expenses`));
  allExpSnap.forEach(d => {
    const e = d.data();
    if (Math.abs(Number(e.amount || 0) - 71) < 0.01) {
      console.log(`[EXP 71] ID: ${d.id} | Date: ${e.date} | Amount: ${e.amount} | CashBoxId: ${e.cashBoxId} | SourceId: ${e.sourceId} | Notes: ${e.notes}`);
    }
  });
  const allCtxSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
  allCtxSnap.forEach(d => {
    const c = d.data();
    if (Math.abs(Number(c.amount || 0) - 71) < 0.01) {
      console.log(`[CTX 71] ID: ${d.id} | Date: ${c.date} | Amount: ${c.amount} | CashBoxId: ${c.cashBoxId} | Notes: ${c.notes}`);
    }
  });
  jesSnap.forEach(d => {
    const je = d.data();
    (je.lines || []).forEach(l => {
      if (Math.abs(Number(l.debit || 0) - 71) < 0.01 || Math.abs(Number(l.credit || 0) - 71) < 0.01) {
        console.log(`[JE 71] ID: ${d.id} | Code: ${je.code} | Dr: ${l.debit} | Cr: ${l.credit} | Acc: ${l.accountCode} - ${l.accountName} | Desc: ${je.description || l.note}`);
      }
    });
  });
}

run().catch(console.error);
