import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

// TLV Generator for ZATCA
function tlvEncode(tag, value) {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const result = new Uint8Array(2 + valueBytes.length);
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  return result;
}

function concatUint8Arrays(arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function uint8ToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

function generateZATCAQRBase64({ sellerName, vatNumber, timestamp, totalWithVat, vatAmount }) {
  const tlvArrays = [
    tlvEncode(1, sellerName || "شركة أدهام للمواد الغذائية"),
    tlvEncode(2, vatNumber || "312448150500003"),
    tlvEncode(3, timestamp || new Date().toISOString()),
    tlvEncode(4, Number(totalWithVat).toFixed(2)),
    tlvEncode(5, Number(vatAmount).toFixed(2)),
  ];
  return uint8ToBase64(concatUint8Arrays(tlvArrays));
}

async function fix() {
  const invRef = doc(db, 'companies/idham-main/salesInvoices', '3g8vcAuQu7ugts2uoFIg');
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    console.error("Invoice not found!");
    return;
  }
  const inv = invSnap.data();

  const newSubtotal = 3502.62;
  const newVat = 516.09;
  const newTotalWithVat = 4018.71;
  const newRemainingAmount = 4018.71; // paidAmount is 0

  // Timestamp for QR
  let ts = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString() : (inv.date ? `${inv.date}T12:00:00Z` : new Date().toISOString());
  const newQr = generateZATCAQRBase64({
    sellerName: "شركة أدهام للتجارة للمواد الغذائية",
    vatNumber: "312448150500003",
    timestamp: ts,
    totalWithVat: newTotalWithVat,
    vatAmount: newVat
  });

  console.log("Updating sales invoice 3g8vcAuQu7ugts2uoFIg...");
  await updateDoc(invRef, {
    subtotal: newSubtotal,
    totalVat: newVat,
    vatAmount: newVat,
    taxAmount: newVat,
    totalWithVat: newTotalWithVat,
    total: newTotalWithVat,
    remainingAmount: newRemainingAmount,
    qrBase64: newQr
  });
  console.log("Sales invoice updated successfully.");

  // Update Journal Entry NB9kFFKkQ9sONb52YK6w
  const jeRef = doc(db, 'companies/idham-main/journalEntries', 'NB9kFFKkQ9sONb52YK6w');
  const jeSnap = await getDoc(jeRef);
  if (jeSnap.exists()) {
    const je = jeSnap.data();
    console.log("Updating JE NB9kFFKkQ9sONb52YK6w...");
    const updatedLines = je.lines.map(l => {
      if (l.accountCode === "1-1-2-1-2-25-08" || l.accountName === "كبسة البادية") {
        return { ...l, debit: newTotalWithVat };
      }
      if (l.accountCode === "2-1-3-1" || (l.accountName || "").includes("ضريبة")) {
        return { ...l, credit: newVat };
      }
      return l;
    });

    await updateDoc(jeRef, {
      lines: updatedLines,
      totalDebit: newTotalWithVat,
      totalCredit: newTotalWithVat
    });
    console.log("Journal Entry updated successfully.");
  } else {
    console.warn("JE NB9kFFKkQ9sONb52YK6w not found!");
  }

  // Recalculate customer balance
  const customerId = inv.customerId || "fxiLmRmHj0j3q1W2iZsW";
  console.log(`Recalculating customer balance for ${customerId}...`);
  const custDocRef = doc(db, 'companies/idham-main/customers', customerId);
  const custSnap = await getDoc(custDocRef);
  if (custSnap.exists()) {
    const prevBalance = custSnap.data().balance;
    console.log(`Previous customer balance: ${prevBalance}`);
    
    // Check all invoices for customer to compute exact balance
    const invSnapAll = await getDocs(query(
      collection(db, 'companies/idham-main/salesInvoices'),
      where("customerId", "==", customerId)
    ));
    let totalDebit = 0;
    invSnapAll.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled") return;
      const t = d.id === '3g8vcAuQu7ugts2uoFIg' ? newTotalWithVat : parseFloat(data.totalWithVat || 0);
      totalDebit += t;
    });

    // Check receipts
    const rcptSnap = await getDocs(query(
      collection(db, 'companies/idham-main/receipts'),
      where("targetId", "==", customerId)
    ));
    let totalCredit = 0;
    rcptSnap.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled") return;
      totalCredit += parseFloat(data.amount || 0);
    });

    // Check collections
    const colSnap = await getDocs(query(
      collection(db, 'companies/idham-main/collections'),
      where("customerId", "==", customerId)
    ));
    colSnap.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled") return;
      totalCredit += parseFloat(data.amount || 0);
    });

    // Check sales returns
    const retSnap = await getDocs(query(
      collection(db, 'companies/idham-main/salesReturns'),
      where("customerId", "==", customerId)
    ));
    retSnap.docs.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled") return;
      totalCredit += parseFloat(data.totalWithVat || data.total || 0);
    });

    console.log(`Customer debits: ${totalDebit}, credits: ${totalCredit}`);
    // Wait, let's see how prev balance was computed: -72.67 was prevBalance.
    // If invoice total decreased by 9.30 (from 4028.01 to 4018.71),
    // new balance = prevBalance - 9.30 = -72.67 - 9.30 = -81.97.
    const diff = 4028.01 - 4018.71; // 9.30
    const newBalAdjusted = Math.round((prevBalance - diff) * 100) / 100;
    console.log(`Adjusting balance by -${diff} => new balance: ${newBalAdjusted}`);

    await updateDoc(custDocRef, {
      balance: newBalAdjusted
    });
    console.log(`Customer balance updated to ${newBalAdjusted}.`);
  }

  // Also check COA accounts if currentBalance is stored
  const coaCustSnap = await getDocs(query(
    collection(db, 'companies/idham-main/chartOfAccounts'),
    where("code", "==", "1-1-2-1-2-25-08")
  ));
  if (!coaCustSnap.empty) {
    const coaDoc = coaCustSnap.docs[0];
    const d = coaDoc.data();
    if (d.currentBalance !== undefined || d.balance !== undefined) {
      const curBal = d.currentBalance !== undefined ? d.currentBalance : d.balance;
      const updatedCoaBal = Math.round((curBal - 9.30) * 100) / 100;
      console.log(`Updating COA customer account ${coaDoc.id} balance from ${curBal} to ${updatedCoaBal}`);
      await updateDoc(doc(db, 'companies/idham-main/chartOfAccounts', coaDoc.id), {
        currentBalance: updatedCoaBal,
        balance: updatedCoaBal
      });
    }
  }

  const coaVatSnap = await getDocs(query(
    collection(db, 'companies/idham-main/chartOfAccounts'),
    where("code", "==", "2-1-3-1")
  ));
  if (!coaVatSnap.empty) {
    const coaDoc = coaVatSnap.docs[0];
    const d = coaDoc.data();
    if (d.currentBalance !== undefined || d.balance !== undefined) {
      const curBal = d.currentBalance !== undefined ? d.currentBalance : d.balance;
      // VAT output is a credit balance. Decreasing credit by 9.30
      const updatedCoaBal = Math.round((curBal - 9.30) * 100) / 100;
      console.log(`Updating COA VAT account ${coaDoc.id} balance from ${curBal} to ${updatedCoaBal}`);
      await updateDoc(doc(db, 'companies/idham-main/chartOfAccounts', coaDoc.id), {
        currentBalance: updatedCoaBal,
        balance: updatedCoaBal
      });
    }
  }

  console.log("=== FIX COMPLETED SUCCESSFULLY ===");
}

fix().catch(console.error);
