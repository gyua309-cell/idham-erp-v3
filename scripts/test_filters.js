import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

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

function _parseStatementDateTime(entry, defaultDate = "2026-10-11") {
  let ts = 0;
  if (entry.createdAt?.toMillis) ts = entry.createdAt.toMillis();
  else if (entry.createdAt?.seconds) ts = entry.createdAt.seconds * 1000;
  else if (entry.createdAt?.toDate) ts = entry.createdAt.toDate().getTime();

  let rawDate = entry.date || "";
  let isoDate = defaultDate;
  if (rawDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) isoDate = rawDate;
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [d, m, y] = rawDate.split("/");
      isoDate = `${y}-${m}-${d}`;
    }
  } else if (ts > 0) {
    isoDate = new Date(ts).toISOString().split("T")[0];
  }
  return { timestamp: ts, isoDate };
}

function _extractVoucherCodeFromNotes(notes) {
  if (!notes) return null;
  const m = notes.match(/(?:سند صرف رقم|سند قبض رقم|PV-|RV-|TXN-|TR-|إذن صرف رقم|فاتورة)\s*([A-Za-z0-9_-]+)/i);
  return m ? m[1].toUpperCase() : null;
}

async function run() {
  const cashBoxId = "fldAOs5swMd3RCbxVi8a";
  const boxSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/cashBoxes`, cashBoxId));
  const box = boxSnap.data();
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
    if (d.id.length >= 6) expenseMap.set(d.id.slice(0, 6).toUpperCase(), { id: d.id, ...data });
    if (data.code) expenseMap.set(data.code.toUpperCase(), { id: d.id, ...data });
  });

  const receiptMap = new Map();
  rcptsSnap.forEach(d => {
    const data = d.data();
    receiptMap.set(d.id.toUpperCase(), { id: d.id, ...data });
    if (d.id.length >= 6) receiptMap.set(d.id.slice(0, 6).toUpperCase(), { id: d.id, ...data });
    if (data.displayCode) receiptMap.set(data.displayCode.toUpperCase(), { id: d.id, ...data });
    if (data.code) receiptMap.set(data.code.toUpperCase(), { id: d.id, ...data });
  });

  const rawItems = [];
  const processedVoucherKeys = new Set();

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
    if (vCode) {
      processedVoucherKeys.add(vCode);
      if (vCode.length >= 6) processedVoucherKeys.add(vCode.slice(0, 6));
    }
    processedVoucherKeys.add(id.toUpperCase());
    if (id.length >= 6) processedVoucherKeys.add(id.slice(0, 6).toUpperCase());
    rawItems.push({
      id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      inflow: isInc ? amount : 0,
      outflow: !isInc ? amount : 0,
    });
  }

  expsSnap.forEach(d => {
    const exp = d.data();
    const expId = d.id.toUpperCase();
    const expCode = (exp.code || "").toUpperCase();
    if (processedVoucherKeys.has(expId) || (expCode && processedVoucherKeys.has(expCode))) return;
    processedVoucherKeys.add(expId);
    if (expCode) processedVoucherKeys.add(expCode);
    const dt = _parseStatementDateTime(exp);
    rawItems.push({
      id: d.id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      inflow: 0,
      outflow: Number(exp.amount || 0),
    });
  });

  rcptsSnap.forEach(d => {
    const rcpt = d.data();
    const rcptId = d.id.toUpperCase();
    const rcptCode = (rcpt.code || rcpt.displayCode || "").toUpperCase();
    if (processedVoucherKeys.has(rcptId) || (rcptCode && processedVoucherKeys.has(rcptCode))) return;
    processedVoucherKeys.add(rcptId);
    if (rcptCode) processedVoucherKeys.add(rcptCode);
    const dt = _parseStatementDateTime(rcpt);
    rawItems.push({
      id: d.id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      inflow: Number(rcpt.amount || 0),
      outflow: 0,
    });
  });

  if (boxAccountCode) {
    jvsSnap.forEach(d => {
      const je = d.data();
      if (je.status === "cancelled" || je.isReversed) return;
      if (je.sourceType === "expense" || je.sourceType === "receipt" || je.sourceType === "cashTransaction") return;
      (je.lines || []).forEach((l, idx) => {
        if (l.accountCode === boxAccountCode) {
          const lineKey = `JE_DOC_${d.id}_L${idx}`;
          if (processedVoucherKeys.has(lineKey)) return;
          processedVoucherKeys.add(lineKey);
          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          const dt = _parseStatementDateTime(je);
          if (dr > 0) {
            rawItems.push({ id: `${d.id}_${idx}`, timestamp: dt.timestamp, date: dt.isoDate, inflow: dr, outflow: 0 });
          } else if (cr > 0) {
            rawItems.push({ id: `${d.id}_${idx}`, timestamp: dt.timestamp, date: dt.isoDate, inflow: 0, outflow: cr });
          }
        }
      });
    });
  }

  rawItems.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timestamp - b.timestamp;
  });

  function testFilter(name, from, to, typeFilter) {
    let openingBal = 0;
    let periodItems = [];
    for (const item of rawItems) {
      if (from && item.date < from) openingBal += (item.inflow - item.outflow);
      else periodItems.push(item);
    }
    if (to) periodItems = periodItems.filter(item => item.date <= to);

    let curBal = openingBal;
    let totalIn = 0;
    let totalOut = 0;
    periodItems.forEach(item => {
      totalIn += item.inflow;
      totalOut += item.outflow;
      curBal += (item.inflow - item.outflow);
    });

    console.log(`\n=== Test: ${name} (from: "${from}", to: "${to}") ===`);
    console.log(`Opening: ${openingBal.toFixed(2)} | In: ${totalIn.toFixed(2)} | Out: ${totalOut.toFixed(2)} | Net: ${(totalIn - totalOut).toFixed(2)} | Closing: ${curBal.toFixed(2)}`);
  }

  testFilter("All time", "", "");
  testFilter("2026-10-11 only", "2026-10-11", "2026-10-11");
  testFilter("2026-10-08 only", "2026-10-08", "2026-10-08");
  testFilter("2026-10-01 to 2026-10-10", "2026-10-01", "2026-10-10");
  testFilter("2026-07-01 to 2026-07-31", "2026-07-01", "2026-07-31");
}

run().catch(console.error);
