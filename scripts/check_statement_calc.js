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

function _extractVoucherCodeFromNotes(notes) {
  if (!notes) return "";
  const match = notes.match(/#?([A-Z0-9]{5,12})/i);
  return match ? match[1].toUpperCase() : "";
}

function _parseStatementDateTime(docData) {
  let isoDate = docData.date || "";
  let ts = 0;
  if (docData.createdAt?.toDate) {
    ts = docData.createdAt.toDate().getTime();
    if (!isoDate) isoDate = docData.createdAt.toDate().toISOString().split("T")[0];
  } else if (docData.createdAt) {
    ts = new Date(docData.createdAt).getTime();
    if (!isoDate && !isNaN(ts)) isoDate = new Date(docData.createdAt).toISOString().split("T")[0];
  } else if (isoDate) {
    ts = new Date(isoDate).getTime();
  }
  if (!isoDate) isoDate = "2026-10-10";
  if (isNaN(ts) || ts <= 0) ts = new Date(isoDate).getTime() || 0;
  return { isoDate, timestamp: ts };
}

async function run() {
  const cashBoxId = "fldAOs5swMd3RCbxVi8a";
  const boxSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/cashBoxes`));
  const box = boxSnap.docs.find(d => d.id === cashBoxId)?.data();
  console.log("Box:", box);

  const boxAccountCode = box.accountCode || "1-1-1-1-3";

  const [txnsSnap, rcptsSnap, expsSnap, jvsSnap] = await Promise.all([
    getDocs(query(collection(db, `companies/${COMPANY_ID}/cashTransactions`), where("cashBoxId", "==", cashBoxId))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceId", "==", cashBoxId))),
    getDocs(query(collection(db, `companies/${COMPANY_ID}/expenses`), where("sourceId", "==", cashBoxId))),
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`))
  ]);

  const expenseMap = new Map();
  expsSnap.forEach(d => {
    const data = d.data();
    expenseMap.set(d.id.toUpperCase(), { id: d.id, ...data });
    if (data.code) expenseMap.set(data.code.toUpperCase(), { id: d.id, ...data });
  });

  const receiptMap = new Map();
  rcptsSnap.forEach(d => {
    const data = d.data();
    receiptMap.set(d.id.toUpperCase(), { id: d.id, ...data });
    if (data.displayCode) receiptMap.set(data.displayCode.toUpperCase(), { id: d.id, ...data });
    if (data.code) receiptMap.set(data.code.toUpperCase(), { id: d.id, ...data });
  });

  const rawItems = [];
  const processedVouchers = new Set();

  // 1. Process cashTransactions
  const groupedTxns = new Map();
  txnsSnap.forEach(d => {
    const data = d.data();
    const vCode = (data.sourceId || _extractVoucherCodeFromNotes(data.notes) || "").toUpperCase();
    const groupKey = vCode ? `VOUCHER_${vCode}` : `TXN_${d.id}`;
    const dt = _parseStatementDateTime(data);

    const existing = groupedTxns.get(groupKey);
    if (!existing || dt.timestamp >= existing.dt.timestamp) {
      groupedTxns.set(groupKey, { id: d.id, data, dt, vCode });
    }
  });

  for (const [groupKey, { id, data, dt, vCode }] of groupedTxns.entries()) {
    const isInc = data.type === "in";
    const amount = Number(data.amount || 0);
    if (amount <= 0) continue;

    if (vCode) processedVouchers.add(vCode);

    let detailedNotes = data.notes || "حركة نقدية";
    let badgeText = isInc ? "إيداع نقدي" : "سحب نقدي";
    let ref = `TXN-${id.slice(0, 6).toUpperCase()}`;

    if (data.sourceType === "expense" || (vCode && expenseMap.has(vCode))) {
      const exp = expenseMap.get(vCode || data.sourceId?.toUpperCase());
      ref = exp?.code || `PV-${(exp?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند صرف";
      if (exp) {
        const beneficiary = exp.supplierName || exp.accountName || exp.category || "";
        detailedNotes = `سند صرف: ${beneficiary ? beneficiary + ' — ' : ''}${exp.notes || data.notes || ''}`;
      }
    } else if (data.sourceType === "receipt" || (vCode && receiptMap.has(vCode))) {
      const rcpt = receiptMap.get(vCode || data.sourceId?.toUpperCase());
      ref = rcpt?.displayCode || rcpt?.code || `RV-${(rcpt?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند قبض";
      if (rcpt) {
        const customer = rcpt.customerName || rcpt.accountName || "";
        detailedNotes = `سند قبض: ${customer ? 'تحصيل من ' + customer + ' — ' : ''}${rcpt.notes || data.notes || ''}`;
      }
    } else if (data.isTransfer || data.type === "transfer" || (data.notes && data.notes.includes("تحويل"))) {
      badgeText = isInc ? "تحويل وارد 🔄" : "تحويل صادر 🔄";
      ref = data.refNumber || `TR-${id.slice(0, 6).toUpperCase()}`;
    }

    rawItems.push({
      id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      ref,
      type: data.type,
      badgeText,
      notes: detailedNotes,
      inflow: isInc ? amount : 0,
      outflow: !isInc ? amount : 0,
      source: "cashTransactions",
      rawDoc: data
    });
  }

  // 2. Process Expenses
  expsSnap.forEach(d => {
    const exp = d.data();
    const expId = d.id.toUpperCase();
    const expCode = (exp.code || "").toUpperCase();
    if (processedVouchers.has(expId) || (expCode && processedVouchers.has(expCode))) return;

    processedVouchers.add(expId);
    if (expCode) processedVouchers.add(expCode);

    const dt = _parseStatementDateTime(exp);
    const amount = Number(exp.amount || 0);
    const beneficiary = exp.supplierName || exp.accountName || exp.category || "جهة الصرف";

    rawItems.push({
      id: d.id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      ref: exp.code || `PV-${d.id.slice(0, 6).toUpperCase()}`,
      type: "out",
      badgeText: "سند صرف",
      notes: `صرف لصالح: ${beneficiary} — ${exp.notes || ''}`,
      inflow: 0,
      outflow: amount,
      source: "expenses",
      rawDoc: exp
    });
  });

  // 3. Process Receipts
  rcptsSnap.forEach(d => {
    const rcpt = d.data();
    const rcptId = d.id.toUpperCase();
    const rcptCode = (rcpt.code || rcpt.displayCode || "").toUpperCase();
    if (processedVouchers.has(rcptId) || (rcptCode && processedVouchers.has(rcptCode))) return;

    processedVouchers.add(rcptId);
    if (rcptCode) processedVouchers.add(rcptCode);

    const dt = _parseStatementDateTime(rcpt);
    const amount = Number(rcpt.amount || 0);
    const customer = rcpt.customerName || rcpt.accountName || "عميل";

    rawItems.push({
      id: d.id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      ref: rcpt.displayCode || rcpt.code || `RV-${d.id.slice(0, 6).toUpperCase()}`,
      type: "in",
      badgeText: "سند قبض",
      notes: `تحصيل من: ${customer} — ${rcpt.notes || ''}`,
      inflow: amount,
      outflow: 0,
      source: "receipts",
      rawDoc: rcpt
    });
  });

  // 4. Process Manual/Direct Journal Entries ONLY
  if (boxAccountCode) {
    jvsSnap.forEach(d => {
      const je = d.data();
      if (je.status === "cancelled" || je.isReversed) return;
      if (je.sourceType === "expense" || je.sourceType === "receipt" || je.sourceType === "cashTransaction") return;
      if (je.sourceId && (processedVouchers.has(je.sourceId.toUpperCase()) || processedVouchers.has((je.code||"").toUpperCase()))) return;

      (je.lines || []).forEach((l, idx) => {
        if (l.accountCode === boxAccountCode || (l.accountName && l.accountName.includes(box.name))) {
          const jvCode = je.code || je.entryNumber || `JE-${d.id.slice(0, 6).toUpperCase()}`;
          if (processedVouchers.has(jvCode.toUpperCase()) || processedVouchers.has(d.id.toUpperCase())) return;
          processedVouchers.add(jvCode.toUpperCase());

          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          const dt = _parseStatementDateTime(je);

          if (dr > 0) {
            rawItems.push({
              id: `${d.id}_${idx}`,
              timestamp: dt.timestamp,
              date: dt.isoDate,
              ref: jvCode,
              type: "in",
              badgeText: "قيد تسوية (+)",
              notes: `${je.description || l.note || 'إيداع بقيد يومية'}`,
              inflow: dr,
              outflow: 0,
              source: "journalEntries",
              rawDoc: je
            });
          } else if (cr > 0) {
            rawItems.push({
              id: `${d.id}_${idx}`,
              timestamp: dt.timestamp,
              date: dt.isoDate,
              ref: jvCode,
              type: "out",
              badgeText: "قيد تسوية (-)",
              notes: `${je.description || l.note || 'سحب بقيد يومية'}`,
              inflow: 0,
              outflow: cr,
              source: "journalEntries",
              rawDoc: je
            });
          }
        }
      });
    });
  }

  // Sort chronologically ascending
  rawItems.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timestamp - b.timestamp;
  });

  console.log(`\n=== PROCESSED STATEMENT ITEMS (${rawItems.length} items) ===`);
  let runningBal = 0;
  let totIn = 0;
  let totOut = 0;
  rawItems.forEach((r, idx) => {
    totIn += r.inflow;
    totOut += r.outflow;
    runningBal += (r.inflow - r.outflow);
    console.log(`${idx+1}) Date: ${r.date} | Ref: ${r.ref} | Badge: ${r.badgeText} | In: ${r.inflow} | Out: ${r.outflow} | RunBal: ${runningBal} | Src: ${r.source} | Notes: ${r.notes}`);
  });

  console.log(`\nTotal In: ${totIn}, Total Out: ${totOut}, Closing Balance: ${runningBal}`);
  console.log(`Stored Box Balance: ${box.balance}`);
  console.log(`Difference (Closing - Stored): ${runningBal - box.balance}`);
}

run().catch(console.error);
