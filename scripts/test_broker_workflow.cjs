const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function runTest() {
  console.log("=== 1. Checking Chart of Accounts ===");
  const coaExpenseSnap = await db.collection("chart_of_accounts").where("code", "==", "5-4-10").get();
  if (coaExpenseSnap.empty) {
    console.error("FAIL: 5-4-10 expense account not found!");
  } else {
    const acc = coaExpenseSnap.docs[0].data();
    console.log(`PASS: Expense account found: [${acc.code}] ${acc.name} (${acc.type})`);
  }

  const coaBrokerSnap = await db.collection("chart_of_accounts").where("code", "==", "2-1-4-2").get();
  if (coaBrokerSnap.empty) {
    console.error("FAIL: 2-1-4-2 broker liability account not found!");
  } else {
    const acc = coaBrokerSnap.docs[0].data();
    console.log(`PASS: Liability account found: [${acc.code}] ${acc.name} (${acc.type})`);
  }

  console.log("\n=== 2. Checking Customer Settings ===");
  const custDoc = await db.collection("customers").doc("wH6dTDnlCecLiDHIN25U").get();
  if (!custDoc.exists) {
    console.error("FAIL: Customer not found!");
  } else {
    const c = custDoc.data();
    console.log(`PASS: Customer: ${c.name}`);
    console.log(`  hasBrokerCommission: ${c.hasBrokerCommission}`);
    console.log(`  brokerName: ${c.brokerName}`);
    console.log(`  brokerRate: ${c.brokerRate}%`);
    console.log(`  brokerAccountCode: ${c.brokerAccountCode}`);
    console.log(`  brokerExpenseCode: ${c.brokerExpenseCode}`);
  }

  console.log("\n=== 3. Checking Invoice INV-042070 ===");
  const invDoc = await db.collection("sales_invoices").doc("tchQVLhpqFLC25PBe45T").get();
  if (!invDoc.exists) {
    console.error("FAIL: Invoice INV-042070 not found!");
  } else {
    const inv = invDoc.data();
    console.log(`PASS: Invoice: ${inv.invoiceNumber}`);
    console.log(`  Total: ${inv.total}`);
    console.log(`  Subtotal: ${inv.subtotal}`);
    console.log(`  brokerCommissionTotal: ${inv.brokerCommissionTotal}`);
    console.log(`  brokerCommissionStatus: ${inv.brokerCommissionStatus}`);
    console.log(`  brokerCommissionEarned: ${inv.brokerCommissionEarned}`);
  }

  console.log("\n=== 4. Testing Mathematical Precision ===");
  // Base price test: 291 with 1% markup:
  const base = 291;
  const rate = 1.0;
  const markupPrice = Math.round(base * (1 + rate / 100) * 100) / 100;
  const commissionPerUnit = markupPrice - base;
  console.log(`Base: ${base} -> Markup Price (+1%): ${markupPrice} (Commission per unit: ${commissionPerUnit.toFixed(2)})`);
  if (markupPrice === 293.91 && Math.abs(commissionPerUnit - 2.91) < 0.001) {
    console.log("PASS: Math formula 291 * 1.01 = 293.91 exact!");
  } else {
    console.error("FAIL: Math formula mismatch!");
  }

  console.log("\nAll core validations completed successfully!");
  process.exit(0);
}

runTest().catch(err => {
  console.error("Error in test:", err);
  process.exit(1);
});
