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
    const invSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`));
    const septInvoices = invSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled" && (i.date || "").startsWith("2026-09"));

    console.log("Sample invoice keys:", Object.keys(septInvoices[0] || {}));
    console.log("Sample invoice items/lines:", septInvoices[0]?.items || septInvoices[0]?.lines);

    const itemStats = {};
    septInvoices.forEach(inv => {
      const lineList = inv.items || inv.lines || [];
      lineList.forEach(item => {
        const name = item.productName || item.name || item.description || "غير معروف";
        const qty = parseFloat(item.qty || item.quantity || 0);
        const unitPrice = parseFloat(item.unitPrice || item.price || 0);
        const unitCost = parseFloat(item.costPrice || item.averageCost || 0);
        const totalSales = parseFloat(item.total || (qty * unitPrice) || 0);
        const totalCost = parseFloat(item.totalCost || (qty * unitCost) || 0);

        if (!itemStats[name]) {
          itemStats[name] = { name, totalQty: 0, totalSales: 0, totalCost: 0, samplePrice: unitPrice, sampleCost: unitCost };
        }
        itemStats[name].totalQty += qty;
        itemStats[name].totalSales += totalSales;
        itemStats[name].totalCost += totalCost;
      });
    });

    const sortedItems = Object.values(itemStats).sort((a, b) => b.totalSales - a.totalSales);
    console.log(`\n=== FOUND ${sortedItems.length} DISTINCT PRODUCTS IN SEPT INVOICES ===`);
    sortedItems.slice(0, 15).forEach(it => {
      const profit = it.totalSales - it.totalCost;
      const margin = it.totalSales > 0 ? (profit / it.totalSales * 100).toFixed(1) : 0;
      console.log(`Product: ${it.name.padEnd(30)} | Qty: ${String(it.totalQty).padStart(4)} | Sales: ${it.totalSales.toFixed(2).padStart(9)} | Cost: ${it.totalCost.toFixed(2).padStart(9)} | Margin: ${(margin + "%").padStart(6)} (Sale ${it.samplePrice} vs Cost ${it.sampleCost})`);
    });

  } catch (e) {
    console.error("Error:", e);
  }
}

run();
