const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // assuming it's in the root

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const COID = "idham-foodstuffs-sa";

async function fixCashBoxes() {
  console.log("Fetching all sales invoices...");
  const snap = await db.collection(`companies/${COID}/salesInvoices`).get();
  
  const repCash = {};

  snap.forEach(doc => {
    const inv = doc.data();
    if (!inv.repId) return;

    let paid = 0;
    if (inv.paidAmount !== undefined) {
      paid = parseFloat(inv.paidAmount) || 0;
    } else if (inv.paymentMethod === 'cash') {
      paid = parseFloat(inv.total) || 0;
    }

    if (!repCash[inv.repId]) repCash[inv.repId] = 0;
    repCash[inv.repId] += paid;
  });

  console.log("Calculated correct cash box balances:", repCash);

  for (const repId in repCash) {
    const boxRef = db.doc(`companies/${COID}/cashBoxes/cashBox_${repId}`);
    await boxRef.set({
      balance: repCash[repId],
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Updated cashBox_${repId} to ${repCash[repId]}`);
  }

  console.log("Done!");
}

fixCashBoxes().catch(console.error);
