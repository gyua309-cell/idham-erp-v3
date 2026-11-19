// Simulation test for broker commission release on payment
function simulateReleaseBrokerCommission(invoice, receiptAmount) {
  const brokerRate = invoice.brokerCommissionRate || 1.0;
  const invoiceSubtotal = Number(invoice.subtotal) || 0;
  const invoiceTotal = Number(invoice.total) || 1;
  const totalCommission = Number(invoice.brokerCommissionTotal) || (invoiceSubtotal * (brokerRate / (100 + brokerRate)));
  const alreadyEarned = Number(invoice.brokerCommissionEarned) || 0;

  // Proportional release based on payment fraction
  const paymentRatio = Math.min(1.0, Number(receiptAmount) / invoiceTotal);
  const earnedFromThisReceipt = Math.round(totalCommission * paymentRatio * 100) / 100;
  const newEarned = Math.min(totalCommission, Math.round((alreadyEarned + earnedFromThisReceipt) * 100) / 100);
  const isFullyEarned = newEarned >= (totalCommission - 0.05);

  const je = {
    date: "2026-10-20",
    description: `استحقاق عمولة وساطة تجارية — الفاتورة ${invoice.invoiceNumber} — الوسيط زياد`,
    sourceType: "brokerCommission",
    sourceId: invoice.id,
    lines: [
      {
        accountCode: "5-4-10",
        accountName: "عمولات بيع ووساطة تجارية",
        debit: earnedFromThisReceipt,
        credit: 0
      },
      {
        accountCode: "2-1-4-2",
        accountName: "مستحقات عمولات الوسطاء - زياد",
        debit: 0,
        credit: earnedFromThisReceipt
      }
    ]
  };

  return {
    earnedFromThisReceipt,
    newEarned,
    isFullyEarned,
    je
  };
}

const sampleInv = {
  id: "tchQVLhpqFLC25PBe45T",
  invoiceNumber: "INV-042070",
  subtotal: 5870.6,
  total: 6751.19,
  brokerCommissionTotal: 58.71,
  brokerCommissionEarned: 0,
  brokerCommissionRate: 1.0
};

console.log("=== Testing Full Payment (6751.19 SAR) ===");
const resFull = simulateReleaseBrokerCommission(sampleInv, 6751.19);
console.log("Earned:", resFull.earnedFromThisReceipt, "New Total:", resFull.newEarned, "Fully Earned?", resFull.isFullyEarned);
console.log("JE Lines:", JSON.stringify(resFull.je.lines, null, 2));

console.log("\n=== Testing Partial Payment (50% = 3375.60 SAR) ===");
const resPart = simulateReleaseBrokerCommission(sampleInv, 3375.60);
console.log("Earned:", resPart.earnedFromThisReceipt, "New Total:", resPart.newEarned, "Fully Earned?", resPart.isFullyEarned);
console.log("JE Lines:", JSON.stringify(resPart.je.lines, null, 2));
