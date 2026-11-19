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
    const [invSnap, prodSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/products`))
    ]);

    const prods = {};
    prodSnap.docs.forEach(d => {
      const data = d.data();
      prods[d.id] = { id: d.id, name: data.name, costPrice: parseFloat(data.costPrice || 0) };
    });

    const septInvoices = invSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled" && (i.date || "").startsWith("2026-09"));

    const itemStats = {};

    septInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const pId = item.productId || item.id;
        const name = item.productName || item.name || prods[pId]?.name || "غير معروف";
        const qty = parseFloat(item.qty || item.quantity || 0);
        const unitPrice = parseFloat(item.unitPrice || item.price || 0);
        const unitCost = parseFloat(item.costPrice || item.averageCost || prods[pId]?.costPrice || 0);
        const totalSales = qty * unitPrice;
        const totalCost = qty * unitCost;

        if (!itemStats[name]) {
          itemStats[name] = { name, totalQty: 0, totalSales: 0, totalCost: 0, samplePrice: unitPrice, sampleCost: unitCost };
        }
        itemStats[name].totalQty += qty;
        itemStats[name].totalSales += totalSales;
        itemStats[name].totalCost += totalCost;
      });
    });

    const sortedItems = Object.values(itemStats).sort((a, b) => b.totalSales - a.totalSales);

    console.log("=== TOP PRODUCTS SOLD IN SEPTEMBER 2026 & THEIR MARGINS ===");
    sortedItems.forEach(it => {
      const profit = it.totalSales - it.totalCost;
      const margin = it.totalSales > 0 ? (profit / it.totalSales * 100).toFixed(1) : 0;
      console.log(`Product: ${it.name}`);
      console.log(`  Qty: ${it.totalQty} | Sales: ${it.totalSales.toFixed(2)} | Cost: ${it.totalCost.toFixed(2)} | Profit: ${profit.toFixed(2)} | Margin: ${margin}% | (Unit: Sale ${it.samplePrice} vs Cost ${it.sampleCost})`);
    });

  } catch (e) {
    console.error("Error:", e);
  }
}

run();
