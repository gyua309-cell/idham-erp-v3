import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function auditCOGS() {
  try {
    const [invSnap, retSnap, jeSnap, prodSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/products`))
    ]);

    const prods = {};
    prodSnap.docs.forEach(d => {
      prods[d.id] = { id: d.id, ...d.data() };
    });

    const septInvoices = invSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled" && (i.date || "") >= "2026-09-01" && (i.date || "") <= "2026-09-30");

    const septReturns = retSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.status !== "cancelled" && (r.date || "") >= "2026-09-01" && (r.date || "") <= "2026-09-30");

    const septJEs = jeSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(j => (j.date || "") >= "2026-09-01" && (j.date || "") <= "2026-09-30");

    console.log(`Auditing September 2026: ${septInvoices.length} Invoices, ${septReturns.length} Returns, ${septJEs.length} JEs`);

    // 1. Check all JEs touching 5-1-8 or 5-1 accounts
    const cogsJELines = [];
    let total518Debit = 0;
    let total518Credit = 0;
    const sourceIdMap = {};

    septJEs.forEach(je => {
      (je.lines || []).forEach((l, idx) => {
        const code = String(l.accountCode || "");
        const name = String(l.accountName || "");
        const is518 = code === "5-1-8" || code.startsWith("5-1-8") || name.includes("تكلفة البضاعة");
        if (is518) {
          const dr = parseFloat(l.debit || 0);
          const cr = parseFloat(l.credit || 0);
          total518Debit += dr;
          total518Credit += cr;
          cogsJELines.push({
            jeId: je.id,
            entryNumber: je.entryNumber || je.number || je.refNumber,
            sourceType: je.sourceType,
            sourceId: je.sourceId,
            date: je.date,
            description: je.description,
            note: l.note,
            debit: dr,
            credit: cr,
            net: dr - cr
          });

          if (je.sourceId) {
            sourceIdMap[je.sourceId] = (sourceIdMap[je.sourceId] || 0) + 1;
          }
        }
      });
    });

    console.log(`\n=== ACCOUNT 5-1-8 COGS TOTALS IN JOURNAL ENTRIES ===`);
    console.log(`Total 5-1-8 Debits: ${total518Debit.toFixed(2)}`);
    console.log(`Total 5-1-8 Credits: ${total518Credit.toFixed(2)}`);
    console.log(`Net 5-1-8 Balance in P&L: ${(total518Debit - total518Credit).toFixed(2)}`);

    // Check for duplicate JEs
    const duplicates = Object.entries(sourceIdMap).filter(([k, v]) => v > 1);
    console.log(`\nDuplicate Source IDs in COGS JEs: ${duplicates.length}`);
    if (duplicates.length > 0) {
      duplicates.forEach(([k, v]) => console.log(`  Source ID ${k} has ${v} COGS lines`));
    }

    // Check non-invoice COGS JEs
    const nonInvoiceCOGS = cogsJELines.filter(l => l.sourceType !== "salesCOGS" && l.sourceType !== "salesInvoice" && l.sourceType !== "salesReturnCOGS");
    console.log(`\nNon-standard COGS JEs: ${nonInvoiceCOGS.length}`);
    nonInvoiceCOGS.forEach(l => {
      console.log(`  JE: ${l.entryNumber} | Type: ${l.sourceType} | SourceId: ${l.sourceId} | Date: ${l.date} | Net: ${l.net} | Desc: ${l.description}`);
    });

    // Compare Invoice Cost with JE Cost for each Invoice
    console.log(`\n=== INVOICE COST vs JE COGS RECONCILIATION ===`);
    let totalInvComputedCost = 0;
    let totalInvoiceTotalCostField = 0;
    let invWithNoJE = [];
    let costDiscrepancies = [];

    septInvoices.forEach(inv => {
      let linesCost = 0;
      (inv.lines || inv.items || []).forEach(item => {
        const q = parseFloat(item.qty || item.quantity || 0);
        const unitCost = parseFloat(item.costPrice || item.averageCost || prods[item.productId || item.id]?.costPrice || 0);
        linesCost += q * unitCost;
      });
      totalInvComputedCost += linesCost;
      totalInvoiceTotalCostField += parseFloat(inv.totalCost || linesCost || 0);

      const matchingJEs = cogsJELines.filter(l => l.sourceId === inv.id || l.sourceId === inv.invoiceNumber || l.sourceId === inv.number);
      const jeCost = matchingJEs.reduce((s, l) => s + l.net, 0);

      if (matchingJEs.length === 0) {
        invWithNoJE.push({ id: inv.id, number: inv.invoiceNumber || inv.number, date: inv.date, cost: linesCost });
      } else if (Math.abs(jeCost - linesCost) > 1.0) {
        costDiscrepancies.push({
          id: inv.id,
          number: inv.invoiceNumber || inv.number,
          date: inv.date,
          customer: inv.customerName,
          rep: inv.repName,
          computedCost: linesCost,
          totalCostField: inv.totalCost,
          jeCost: jeCost,
          diff: jeCost - linesCost
        });
      }
    });

    console.log(`Total Invoices Lines Cost: ${totalInvComputedCost.toFixed(2)}`);
    console.log(`Total Invoices totalCost Field: ${totalInvoiceTotalCostField.toFixed(2)}`);
    console.log(`Invoices with NO COGS JE: ${invWithNoJE.length}`);
    console.log(`Invoices with COGS Discrepancy (> 1 SAR): ${costDiscrepancies.length}`);

    if (costDiscrepancies.length > 0) {
      console.log(`\nTop Cost Discrepancies:`);
      costDiscrepancies.slice(0, 10).forEach(d => {
        console.log(`  Inv: ${d.number} | Date: ${d.date} | Rep: ${d.rep} | LinesCost: ${d.computedCost.toFixed(2)} | JECost: ${d.jeCost.toFixed(2)} | Diff: ${d.diff.toFixed(2)}`);
      });
    }

    // 4. Detailed analysis of Product Cost Prices in September
    console.log(`\n=== UNIT COST PRICE AUDIT (Check for VAT or Unit Factor distortions) ===`);
    const suspiciousItems = [];
    septInvoices.forEach(inv => {
      (inv.lines || inv.items || []).forEach(it => {
        const p = prods[it.productId || it.id];
        const unitPrice = parseFloat(it.unitPrice || it.price || 0);
        const costPrice = parseFloat(it.costPrice || it.averageCost || 0);
        const masterCost = parseFloat(p?.costPrice || p?.purchasePrice || 0);
        const qty = parseFloat(it.qty || it.quantity || 0);

        // Check if costPrice > unitPrice (Loss sale)
        if (costPrice > unitPrice && unitPrice > 0) {
          suspiciousItems.push({
            reason: "Cost > Sale Price (بيع بخسارة)",
            invNum: inv.invoiceNumber || inv.number,
            date: inv.date,
            rep: inv.repName,
            cust: inv.customerName,
            product: it.productName || it.name,
            unit: it.unit || it.selectedUnit,
            qty: qty,
            unitPrice: unitPrice,
            costPrice: costPrice,
            masterCost: masterCost,
            loss: (costPrice - unitPrice) * qty
          });
        }
        // Check if costPrice equals unitPrice with 15% VAT (e.g. cost entered with VAT vs sale without VAT)
        if (Math.abs(costPrice - unitPrice * 1.15) < 1.0 && unitPrice > 0) {
          suspiciousItems.push({
            reason: "Cost equals Sale Price with VAT (احتمال إدخال التكلفة شاملة الضريبة والبيع بدون)",
            invNum: inv.invoiceNumber || inv.number,
            date: inv.date,
            rep: inv.repName,
            cust: inv.customerName,
            product: it.productName || it.name,
            unitPrice: unitPrice,
            costPrice: costPrice
          });
        }
      });
    });

    console.log(`Suspicious items found: ${suspiciousItems.length}`);
    suspiciousItems.slice(0, 15).forEach(s => {
      console.log(`  [${s.reason}] Inv: ${s.invNum} | Rep: ${s.rep} | Prod: ${s.product} | Qty: ${s.qty} | Sale: ${s.unitPrice} | Cost: ${s.costPrice} | MasterCost: ${s.masterCost}`);
    });

  } catch (e) {
    console.error("Audit error:", e);
  }
}

auditCOGS();
