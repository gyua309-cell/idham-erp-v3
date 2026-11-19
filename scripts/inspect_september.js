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

async function run() {
  try {
    console.log("Fetching September 2026 data...");
    const [invSnap, retSnap, jeSnap, prodSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/products`))
    ]);

    const prods = {};
    prodSnap.docs.forEach(d => {
      const data = d.data();
      prods[d.id] = { id: d.id, name: data.name, costPrice: parseFloat(data.costPrice || 0), purchasePrice: parseFloat(data.purchasePrice || 0) };
    });

    const septInvoices = invSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled" && (i.date || "").startsWith("2026-09"));

    const septReturns = retSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.status !== "cancelled" && (r.date || "").startsWith("2026-09"));

    const septJEs = jeSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(j => (j.date || "").startsWith("2026-09"));

    console.log(`Found ${septInvoices.length} Invoices, ${septReturns.length} Returns, ${septJEs.length} JEs in September 2026`);

    // Invoices breakdown
    let totalInvWithVat = 0;
    let totalInvSubtotal = 0;
    let totalInvCost = 0;
    let lowMarginInvoices = [];

    septInvoices.forEach(inv => {
      const gross = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0));
      const sub = parseFloat(inv.subtotal || inv.totalWithoutVat || (gross / 1.15) || 0);
      let cost = 0;
      if (inv.totalCost !== undefined && inv.totalCost !== null) {
        cost = parseFloat(inv.totalCost);
      } else {
        (inv.items || []).forEach(item => {
          const q = parseFloat(item.qty || item.quantity || 0);
          const c = parseFloat(item.averageCost || item.costPrice || prods[item.productId || item.id]?.costPrice || 0);
          cost += q * c;
        });
      }
      totalInvWithVat += gross;
      totalInvSubtotal += sub;
      totalInvCost += cost;

      const profit = sub - cost;
      const margin = sub > 0 ? (profit / sub) * 100 : 0;
      if (margin < 4.5) {
        lowMarginInvoices.push({
          invNumber: inv.invoiceNumber || inv.id,
          date: inv.date,
          customerName: inv.customerName,
          repName: inv.repName,
          subtotal: sub,
          cost: cost,
          profit: profit,
          margin: margin.toFixed(1) + "%",
          items: (inv.items || []).map(it => ({
            name: it.productName || it.name,
            qty: it.qty,
            unitPrice: it.unitPrice || it.price,
            costPrice: it.costPrice || it.averageCost || prods[it.productId || it.id]?.costPrice,
            total: it.total,
            itemMargin: (it.unitPrice > 0 ? ((it.unitPrice - (it.costPrice || prods[it.productId || it.id]?.costPrice || 0)) / it.unitPrice * 100).toFixed(1) : 0) + "%"
          }))
        });
      }
    });

    // Returns breakdown
    let totalRetWithVat = 0;
    let totalRetSubtotal = 0;
    let totalRetCost = 0;
    septReturns.forEach(ret => {
      const gross = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total || 0));
      const sub = parseFloat(ret.subtotal || ret.totalWithoutVat || (gross / 1.15) || 0);
      let cost = 0;
      (ret.items || []).forEach(item => {
        const q = parseFloat(item.qty || item.quantity || 0);
        const c = parseFloat(item.averageCost || item.costPrice || prods[item.productId || item.id]?.costPrice || 0);
        cost += q * c;
      });
      totalRetWithVat += gross;
      totalRetSubtotal += sub;
      totalRetCost += cost;
    });

    console.log("\n=== DASHBOARD INVOICE MATH ===");
    console.log(`Gross Invoices: ${totalInvWithVat.toFixed(2)} (Subtotal: ${totalInvSubtotal.toFixed(2)})`);
    console.log(`Returns: ${totalRetWithVat.toFixed(2)} (Subtotal: ${totalRetSubtotal.toFixed(2)})`);
    console.log(`Net Sales (Subtotal): ${(totalInvSubtotal - totalRetSubtotal).toFixed(2)}`);
    console.log(`COGS from Invoices: ${(totalInvCost - totalRetCost).toFixed(2)}`);
    console.log(`Gross Profit: ${(totalInvSubtotal - totalRetSubtotal - (totalInvCost - totalRetCost)).toFixed(2)}`);
    console.log(`Margin: ${(((totalInvSubtotal - totalRetSubtotal - (totalInvCost - totalRetCost)) / (totalInvSubtotal - totalRetSubtotal)) * 100).toFixed(2)}%`);

    // Journal entries math for September
    let je411 = 0, je412 = 0, je518 = 0, je517 = 0, jeOther5 = {};
    septJEs.forEach(je => {
      (je.lines || []).forEach(l => {
        const code = String(l.accountCode || "");
        const dr = parseFloat(l.debit || 0);
        const cr = parseFloat(l.credit || 0);
        if (code.startsWith("4-1-1")) je411 += (cr - dr);
        if (code.startsWith("4-1-2")) je412 += (dr - cr);
        if (code === "5-1-8" || code.startsWith("5-1-8") || l.accountName?.includes("تكلفة البضاعة")) je518 += (dr - cr);
        if (code === "5-1-7" || l.accountName?.includes("نقل")) je517 += (dr - cr);
        if (code.startsWith("5-") && code !== "5-1-8" && code !== "5-1-7") {
          jeOther5[code] = (jeOther5[code] || 0) + (dr - cr);
        }
      });
    });

    console.log("\n=== JOURNAL ENTRIES MATH ===");
    console.log(`4-1-1 Sales Revenue: ${je411.toFixed(2)}`);
    console.log(`4-1-2 Sales Returns: ${je412.toFixed(2)}`);
    console.log(`Net Revenue in P&L: ${(je411 - je412).toFixed(2)}`);
    console.log(`5-1-8 COGS in P&L: ${je518.toFixed(2)}`);
    console.log(`5-1-7 Freight-in in P&L: ${je517.toFixed(2)}`);
    console.log(`Other 5-x Accounts:`, jeOther5);

    console.log("\n=== LOW MARGIN INVOICES (Margin < 4.5%) ===");
    console.log(`Found ${lowMarginInvoices.length} invoices with margin < 4.5%`);
    lowMarginInvoices.forEach(inv => {
      console.log(`\nInv: ${inv.invNumber} | Date: ${inv.date} | Rep: ${inv.repName} | Cust: ${inv.customerName}`);
      console.log(`  Subtotal: ${inv.subtotal.toFixed(2)} | Cost: ${inv.cost.toFixed(2)} | Profit: ${inv.profit.toFixed(2)} | Margin: ${inv.margin}`);
      inv.items.forEach(it => {
        console.log(`    -> Item: ${it.name} | Qty: ${it.qty} | Price: ${it.unitPrice} | Cost: ${it.costPrice} | ItemMargin: ${it.itemMargin}`);
      });
    });

  } catch (e) {
    console.error("Error:", e);
  }
}

run();
