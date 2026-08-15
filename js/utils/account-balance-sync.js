// ============================================================
// IDHAM ERP — Account Balance Sync Utility
// مزامنة أرصدة الحسابات مع القيود اليومية
// ============================================================
// This utility recomputes account balances from journal entries
// and updates them in Firestore. Run this when:
//   1. First time setup (after seeding default accounts)
//   2. After importing historical journal entries
//   3. If balances get out of sync for any reason
// ============================================================

import { COLS, getAll } from "../utils/db.js";
import {
  query, orderBy, getDocs, doc, runTransaction, serverTimestamp
} from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// ──────────────────────────────────────────
// Recompute all account balances from journal entries
// ──────────────────────────────────────────
export async function recomputeAllBalances() {
  console.log("🔄 Starting balance recomputation...");

  // 1. Load all journal entries
  const q    = query(COLS.journalEntries(), orderBy("date", "asc"));
  const snap = await getDocs(q);
  const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 2. Build balance map from journal lines
  const balanceMap = {};   // { accountCode: { debit, credit, balance } }
  const idByCode   = {};   // { accountCode: firestoreId }

  // Load all accounts first
  const accounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);
  accounts.forEach(a => {
    idByCode[a.code] = a.id;
    const op = parseFloat(a.openingBalance) || 0;
    balanceMap[a.code] = {
      totalDebit:  op > 0 ? op : 0,
      totalCredit: op < 0 ? Math.abs(op) : 0,
      balance:     op,
    };
  });

  // 3. Process each journal line
  entries.forEach(entry => {
    (entry.lines || []).forEach(line => {
      const code = line.accountCode;
      if (!code || !balanceMap[code]) return;

      balanceMap[code].totalDebit  += (line.debit  || 0);
      balanceMap[code].totalCredit += (line.credit || 0);
    });
  });

  // 4. Compute final balance for each account
  accounts.forEach(a => {
    const data = balanceMap[a.code];
    if (!data) return;

    // For normal balance = debit accounts (assets, expenses): balance = debit - credit
    // For normal balance = credit accounts (liabilities, equity, revenue): balance = credit - debit
    const isDebitNormal = ["asset", "expense"].includes(a.type);
    data.balance = isDebitNormal
      ? data.totalDebit  - data.totalCredit
      : data.totalCredit - data.totalDebit;
  });

  // 5. Update Firestore in batches
  const { writeBatch } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
  const BATCH_SIZE = 499;
  const entries2update = Object.entries(balanceMap);

  for (let i = 0; i < entries2update.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = entries2update.slice(i, i + BATCH_SIZE);

    chunk.forEach(([code, data]) => {
      const id = idByCode[code];
      if (!id) return;
      const ref = doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, id);
      batch.update(ref, {
        totalDebit:  data.totalDebit,
        totalCredit: data.totalCredit,
        balance:     data.balance,
        updatedAt:   serverTimestamp(),
      });
    });

    await batch.commit();
  }

  console.log(`✅ Recomputed balances for ${accounts.length} accounts.`);
  return balanceMap;
}

// ──────────────────────────────────────────
// Update a single account balance (called after each journal entry)
// ──────────────────────────────────────────
export async function updateAccountBalance(accountCode, debitDelta, creditDelta) {
  const { increment, doc: firestoreDoc, updateDoc, serverTimestamp: sts } =
    await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

  // Find account by code
  const q    = query(COLS.chartOfAccounts(), where("code", "==", accountCode));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const accId  = snap.docs[0].id;
  const accRef = firestoreDoc(db, `companies/${COMPANY_ID}/chartOfAccounts`, accId);
  const type   = snap.docs[0].data().type;

  const isDebitNormal = ["asset","expense"].includes(type);
  const balanceDelta  = isDebitNormal
    ? debitDelta - creditDelta
    : creditDelta - debitDelta;

  await updateDoc(accRef, {
    totalDebit:  increment(debitDelta),
    totalCredit: increment(creditDelta),
    balance:     increment(balanceDelta),
    updatedAt:   sts(),
  });
}

// ──────────────────────────────────────────
// Validate journal entry balance
// ──────────────────────────────────────────
export function validateJournalEntry(lines) {
  const errors = [];

  const totalDebit  = lines.reduce((s, l) => s + (l.debit  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    errors.push(`القيد غير متوازن: المدين ${totalDebit.toFixed(2)} ≠ الدائن ${totalCredit.toFixed(2)}`);
  }

  if (totalDebit === 0) {
    errors.push("القيد فارغ — يجب إدخال مبالغ");
  }

  lines.forEach((line, i) => {
    if ((line.debit || 0) > 0 && (line.credit || 0) > 0) {
      errors.push(`السطر ${i+1}: لا يمكن أن يكون السطر مديناً ودائناً في نفس الوقت`);
    }
    if (!line.accountCode && ((line.debit || 0) > 0 || (line.credit || 0) > 0)) {
      errors.push(`السطر ${i+1}: لا يوجد حساب محدد`);
    }
  });

  return errors;
}

// Import where for single account query
import { where } from "../utils/db.js";
