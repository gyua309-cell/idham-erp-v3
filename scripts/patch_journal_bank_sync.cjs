const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../js/modules/journal-entries.js");
let code = fs.readFileSync(filePath, "utf8");

const isCRLF = code.includes("\r\n");
code = code.replace(/\r\n/g, "\n");

console.log("Patching journal-entries.js to auto-sync bank accounts...");

// Update call to syncBalancesForJournalLines
const oldCall = `    // Auto-sync supplier & customer balances in real-time
    if (status === "posted") {
      syncBalancesForJournalLines(validLines).catch(() => {});
    }`;

const newCall = `    // Auto-sync supplier, customer & bank balances in real-time
    if (status === "posted") {
      const entryNum = editId ? (document.getElementById("je-number")?.value || "") : (entryNumber || _nextNum || "");
      syncBalancesForJournalLines(validLines, { entryId: editId || "", entryNumber: entryNum, date, description: desc }).catch(() => {});
    }`;

if (code.includes(oldCall)) {
  code = code.replace(oldCall, newCall);
  console.log("✓ Updated syncBalancesForJournalLines call with entry metadata");
}

// Update syncBalancesForJournalLines signature and add bank sync block
const oldFuncSig = `async function syncBalancesForJournalLines(lines = []) {`;
const newFuncSig = `async function syncBalancesForJournalLines(lines = [], entryMeta = {}) {`;

if (code.includes(oldFuncSig)) {
  code = code.replace(oldFuncSig, newFuncSig);
  console.log("✓ Updated syncBalancesForJournalLines signature");
}

const oldLoopEnd = `    for (const cId of custIdSet) {
      await recalculateCustomerBalance(cId).catch(() => {});
    }
  } catch(e) {`;

const newBankSyncBlock = `    for (const cId of custIdSet) {
      await recalculateCustomerBalance(cId).catch(() => {});
    }

    // Auto-sync Bank Accounts & record bankTransactions for bank lines
    try {
      const allBanks = await getAll(COLS.bankAccounts()).catch(() => []);
      const { doc: fsDoc, setDoc: fsSetDoc, updateDoc: fsUpdateDoc, serverTimestamp: fsServerTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const { db, COMPANY_ID } = await import("../firebase-config.js");

      for (const line of lines) {
        const accCode = line.accountCode || "";
        const accId = line.accountId || "";
        const accName = (line.accountName || "").trim().toLowerCase();

        const bankMatch = (allBanks || []).find(b => {
          if (b.id && (b.id === accId || b.accountId === accId)) return true;
          if (b.accountCode && b.accountCode === accCode) return true;
          const bName = (b.name || "").trim().toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
          const aName = accName.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
          if (bName && aName === bName) return true;
          if (aName.includes("عهد") && bName.includes("عهد")) return true;
          if (!aName.includes("عهد") && bName.includes("عهد")) return false;
          if (aName.includes("جزير") && bName.includes("جزير")) return true;
          if (aName.includes("راجح") && bName.includes("راجح") && !aName.includes("عهد") && !bName.includes("عهد")) return true;
          return false;
        });

        if (bankMatch) {
          const dr = Number(line.debit || 0);
          const cr = Number(line.credit || 0);
          const amt = dr > 0 ? dr : cr;
          if (amt > 0) {
            const isIncome = dr > 0;
            const currentBal = Number(bankMatch.balance || 0);
            const newBal = isIncome ? currentBal + amt : currentBal - amt;

            await fsUpdateDoc(fsDoc(db, \`companies/\${COMPANY_ID}/bankAccounts\`, bankMatch.id), {
              balance: newBal,
              updatedAt: fsServerTimestamp()
            }).catch(() => {});

            const refCode = entryMeta.entryNumber || "JE";
            const txnId = \`btx_je_\${entryMeta.entryId || Date.now()}_\${bankMatch.id}\`.replace(/[^a-zA-Z0-9_]/g, "_");
            await fsSetDoc(fsDoc(db, \`companies/\${COMPANY_ID}/bankTransactions\`, txnId), {
              bankAccountId: bankMatch.id,
              amount: amt,
              type: isIncome ? "in" : "out",
              date: entryMeta.date || new Date().toISOString().split("T")[0],
              refNumber: refCode,
              notes: \`قيد يومية: \${entryMeta.description || line.note || 'تسوية قيد محاسبي'}\`,
              sourceType: "manualJE",
              sourceId: entryMeta.entryId || null,
              balanceAfter: newBal,
              createdAt: fsServerTimestamp()
            }).catch(() => {});
          }
        }
      }
    } catch (bErr) {
      console.warn("[JournalEntries] Error auto-syncing bank accounts:", bErr);
    }
  } catch(e) {`;

if (code.includes(oldLoopEnd)) {
  code = code.replace(oldLoopEnd, newBankSyncBlock);
  console.log("✓ Added automatic bank transaction creation to syncBalancesForJournalLines");
}

if (isCRLF) {
  code = code.replace(/\n/g, "\r\n");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("Done patching journal-entries.js!");
