import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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
  const [invSnap, jeSnap] = await Promise.all([
    getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`))
  ]);

  const inv = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).find(i => i.invoiceNumber === "INV-041997" || i.id === "INV-041997" || i.number === "INV-041997");
  console.log("Invoice INV-041997:", inv ? { number: inv.invoiceNumber, date: inv.date, totalCost: inv.totalCost, subtotal: inv.subtotal, lines: inv.lines } : "Not found");

  const jes = jeSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(j => j.sourceId === "INV-041997" || j.sourceId === inv?.id || j.description?.includes("INV-041997"));
  console.log("Journal Entries for INV-041997:", jes.map(j => ({ id: j.id, num: j.entryNumber, type: j.sourceType, lines: j.lines })));
}

run();
