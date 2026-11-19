const fs = require('fs');

let content = fs.readFileSync('js/modules/receipts.js', 'utf8');
const hadCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Find insertion point right after `return rcptId;` in `_createReceipt`
const target1 = `  // Journal entry
  await createJournalEntry({
    date: p.date,
    description: \`سند قبض رقم #\${rcptId.substring(0,6).toUpperCase()} - \${p.notes}\`,
    sourceType: "receipt", sourceId: rcptId,
    lines: [
      { accountId: p.debitAccId,  accountCode: p.debitAccCode,  accountName: p.debitAccName,  debit: p.amount, credit: 0,        note: p.notes, costCenterId: p.ccId },
      { accountId: p.creditAccId, accountCode: p.creditAccCode, accountName: p.creditAccName, debit: 0,        credit: p.amount, note: \`تحصيل سند قبض\`, costCenterId: p.ccId }
    ]
  });
  return rcptId;
}`;

const replacement1 = `  // Journal entry
  await createJournalEntry({
    date: p.date,
    description: \`سند قبض رقم #\${rcptId.substring(0,6).toUpperCase()} - \${p.notes}\`,
    sourceType: "receipt", sourceId: rcptId,
    lines: [
      { accountId: p.debitAccId,  accountCode: p.debitAccCode,  accountName: p.debitAccName,  debit: p.amount, credit: 0,        note: p.notes, costCenterId: p.ccId },
      { accountId: p.creditAccId, accountCode: p.creditAccCode, accountName: p.creditAccName, debit: 0,        credit: p.amount, note: \`تحصيل سند قبض\`, costCenterId: p.ccId }
    ]
  });

  // ── Auto-release broker commission on customer payment ──
  if (p.entityType === "customer" && p.targetId) {
    try {
      await releaseBrokerCommissionOnPayment(p.targetId, p.amount, rcptId, p.date, p.notes);
    } catch (commErr) {
      console.warn("[BrokerCommission] Auto release on receipt failed:", commErr);
    }
  }

  return rcptId;
}

/**
 * دالة إطلاق عمولة الوسيط تلقائياً عند سداد العميل للفاتورة وتوليد القيد المحاسبي
 */
async function releaseBrokerCommissionOnPayment(customerId, amountPaid, rcptId, receiptDate, notes) {
  try {
    const invRef = collection(db, \`companies/\${COMPANY_ID}/salesInvoices\`);
    const q = fsQuery(
      invRef,
      where("customerId", "==", customerId),
      where("hasBrokerCommission", "==", true)
    );
    const snap = await fsGetDocs(q);
    if (snap.empty) return;

    let remainingReceiptAmt = parseFloat(amountPaid) || 0;

    for (const d of snap.docs) {
      if (remainingReceiptAmt <= 0) break;
      const inv = d.data();
      if (inv.brokerCommissionStatus === "earned" && (inv.brokerCommissionEarned || 0) >= (inv.brokerCommissionTotal || 0)) {
        continue;
      }

      const totalInv = parseFloat(inv.totalWithVat || 0);
      const prevEarned = parseFloat(inv.brokerCommissionEarned || 0);
      const rate = parseFloat(inv.brokerRate) || 1.0;
      const totalComm = parseFloat(inv.brokerCommissionTotal) || Math.round(parseFloat(inv.subtotal || 0) * (rate / 100) * 100) / 100;
      const unearnedComm = Math.max(0, totalComm - prevEarned);

      if (unearnedComm <= 0.01) continue;

      // Portion of payment applied to this invoice
      const invPaid = parseFloat(inv.paidAmount || 0);
      const invRemaining = Math.max(0, totalInv - invPaid);
      const payApplied = Math.min(remainingReceiptAmt, invRemaining > 0 ? invRemaining : totalInv);
      const earnedRatio = totalInv > 0 ? Math.min(1, payApplied / totalInv) : 1;
      const commToRelease = Math.min(unearnedComm, Math.round(totalComm * earnedRatio * 100) / 100);

      if (commToRelease > 0.01) {
        remainingReceiptAmt -= payApplied;

        // 1. توليد قيد اليومية الآلي للعمولة المستحقة
        // مدين: 5-4-10 (عمولات بيع ووساطة تجارية)
        // دائن: 2-1-4-2 (مستحقات عمولات الوسطاء - زياد)
        const brokerAcc = inv.brokerAccountCode || "2-1-4-2";
        const expenseAcc = inv.brokerExpenseCode || "5-4-10";
        const brokerName = inv.brokerName || "زياد";
        const invNum = inv.number || d.id;

        const jeLines = [
          {
            accountCode: expenseAcc,
            accountName: "عمولات بيع ووساطة تجارية",
            debit: commToRelease,
            credit: 0,
            note: \`استحقاق عمولة الوسيط (\${brokerName}) لسداد فاتورة \${invNum}\`
          },
          {
            accountCode: brokerAcc,
            accountName: \`مستحقات عمولات الوسطاء - \${brokerName}\`,
            debit: 0,
            credit: commToRelease,
            note: \`استحقاق عمولة الوسيط (\${brokerName}) لسداد فاتورة \${invNum}\`
          }
        ];

        const jeId = await createJournalEntry({
          date: receiptDate || todayString(),
          sourceType: "broker_commission",
          sourceId: d.id,
          description: \`قيد آلي: استحقاق عمولة الوسيط \${brokerName} (\${commToRelease} ر.س) لتحصيل فاتورة \${invNum} بموجب سند قبض #\${rcptId.substring(0,6).toUpperCase()}\`,
          lines: jeLines
        });

        // 2. تحديث الفاتورة
        const newEarned = Math.round((prevEarned + commToRelease) * 100) / 100;
        const newStatus = newEarned >= (totalComm - 0.05) ? "earned" : "partial_earned";
        const batch = writeBatch(db);
        batch.update(fsDoc(db, \`companies/\${COMPANY_ID}/salesInvoices\`, d.id), {
          brokerCommissionEarned: newEarned,
          brokerCommissionStatus: newStatus,
          lastBrokerJeId: jeId || "",
          updatedAt: serverTimestamp()
        });
        await batch.commit();

        console.log(\`[BrokerCommission] Auto-released \${commToRelease} SAR for broker \${brokerName} on invoice \${invNum}. JE: \${jeId}\`);
        if (window.showToast) {
          window.showToast(\`✅ تم إثبات استحقاق عمولة الوسيط (\${brokerName}: \${formatCurrency(commToRelease)}) بقيد آلي فور تحصيل الفاتورة\`, "success", 5000);
        }
      }
    }
  } catch (err) {
    console.error("[BrokerCommission] Release error:", err);
  }
}`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('receipts.js patched successfully with broker auto-release!');
} else {
  console.error('target1 not found in receipts.js');
}

if (hadCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync('js/modules/receipts.js', content, 'utf8');
console.log('Done patching receipts.js');
