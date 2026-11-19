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

    if (vCode) {
      processedVoucherKeys.add(vCode);
      if (vCode.length >= 6) processedVoucherKeys.add(vCode.slice(0, 6));
    }
    processedVoucherKeys.add(id.toUpperCase());
    if (id.length >= 6) processedVoucherKeys.add(id.slice(0, 6).toUpperCase());

    let detailedNotes = data.notes || "حركة نقدية";
    let badgeText = isInc ? "إيداع نقدي" : "سحب نقدي";
    let ref = `TXN-${id.slice(0, 6).toUpperCase()}`;

    if (data.sourceType === "expense" || (vCode && expenseMap.has(vCode))) {
      const exp = expenseMap.get(vCode || data.sourceId?.toUpperCase());
      ref = exp?.code || `PV-${(exp?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند صرف";
      if (exp) {
        processedVoucherKeys.add(exp.id.toUpperCase());
        if (exp.id.length >= 6) processedVoucherKeys.add(exp.id.slice(0, 6).toUpperCase());
        if (exp.code) processedVoucherKeys.add(exp.code.toUpperCase());
        const beneficiary = exp.supplierName || exp.accountName || exp.category || "";
        detailedNotes = `سند صرف: ${beneficiary ? beneficiary + ' — ' : ''}${exp.notes || data.notes || ''}`;
      }
    } else if (data.sourceType === "receipt" || (vCode && receiptMap.has(vCode))) {
      const rcpt = receiptMap.get(vCode || data.sourceId?.toUpperCase());
      ref = rcpt?.displayCode || rcpt?.code || `RV-${(rcpt?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند قبض";
      if (rcpt) {
        processedVoucherKeys.add(rcpt.id.toUpperCase());
        if (rcpt.id.length >= 6) processedVoucherKeys.add(rcpt.id.slice(0, 6).toUpperCase());
        if (rcpt.code) processedVoucherKeys.add(rcpt.code.toUpperCase());
        if (rcpt.displayCode) processedVoucherKeys.add(rcpt.displayCode.toUpperCase());
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
      source: "cashTransactions"
    });
  }

  // 2. Process Expenses
  expsSnap.forEach(d => {
    const exp = d.data();
    const expId = d.id.toUpperCase();
    const expIdShort = expId.slice(0, 6);
    const expCode = (exp.code || "").toUpperCase();

    if (processedVoucherKeys.has(expId) || processedVoucherKeys.has(expIdShort) || (expCode && processedVoucherKeys.has(expCode))) {
      return;
    }

    processedVoucherKeys.add(expId);
    processedVoucherKeys.add(expIdShort);
    if (expCode) processedVoucherKeys.add(expCode);

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
      source: "expenses"
    });
  });

  // 3. Process Receipts
  rcptsSnap.forEach(d => {
    const rcpt = d.data();
    const rcptId = d.id.toUpperCase();
    const rcptIdShort = rcptId.slice(0, 6);
    const rcptCode = (rcpt.code || rcpt.displayCode || "").toUpperCase();

    if (processedVoucherKeys.has(rcptId) || processedVoucherKeys.has(rcptIdShort) || (rcptCode && processedVoucherKeys.has(rcptCode))) {
      return;
    }

    processedVoucherKeys.add(rcptId);
    processedVoucherKeys.add(rcptIdShort);
    if (rcptCode) processedVoucherKeys.add(rcptCode);

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
      source: "receipts"
    });
  });

  // 4. Process Manual/Direct Journal Entries
  // IMPORTANT FIX: Deduplicate by UNIQUE Document ID and line index, NEVER by shared code!
  if (boxAccountCode) {
    jvsSnap.forEach(d => {
      const je = d.data();
      if (je.status === "cancelled" || je.isReversed) return;
      if (je.sourceType === "expense" || je.sourceType === "receipt" || je.sourceType === "cashTransaction") return;
      if (je.sourceId && (processedVoucherKeys.has(je.sourceId.toUpperCase()) || processedVoucherKeys.has(je.sourceId.toUpperCase().slice(0, 6)))) return;

      (je.lines || []).forEach((l, idx) => {
        if (l.accountCode === boxAccountCode || (l.accountId === box.accountId) || (l.accountName && l.accountName.includes(box.name))) {
          // Check if this specific JE document + line was already processed
          const lineKey = `JE_DOC_${d.id}_L${idx}`;
          if (processedVoucherKeys.has(lineKey)) return;
          processedVoucherKeys.add(lineKey);

          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          const dt = _parseStatementDateTime(je);
          const jvCode = je.code || je.entryNumber || `JE-${d.id.slice(0, 6).toUpperCase()}`;

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
              source: "journalEntries"
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
              source: "journalEntries"
            });
          }
        }
      });
    });
  }

  // Sort ascending
  rawItems.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timestamp - b.timestamp;
  });

  console.log(`\n=== FIXED STATEMENT ITEMS (${rawItems.length} items) ===`);
  let runningBal = 0, totIn = 0, totOut = 0;
  rawItems.forEach((r, idx) => {
    totIn += r.inflow;
    totOut += r.outflow;
    runningBal += (r.inflow - r.outflow);
    console.log(`${idx+1}) Date: ${r.date} | Ref: ${r.ref} | Badge: ${r.badgeText} | In: ${r.inflow} | Out: ${r.outflow} | RunBal: ${runningBal} | Src: ${r.source} | Notes: ${r.notes}`);
  });

  console.log(`\nTotal In: ${totIn}, Total Out: ${totOut}, Closing Balance: ${runningBal}`);
  console.log(`Account DDJXykWLQP7HqFvo0X8n Balance in COA: 1587 (after 120 advance for Amr)`);
  console.log(`Difference (Closing - Expected 1587): ${runningBal - 1587}`);
}

run().catch(console.error);
