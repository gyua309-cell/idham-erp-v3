import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

async function checkCollections() {
  const collectionsToCheck = [
    "chartOfAccounts",
    "chart_of_accounts",
    "accounts",
    "salesInvoices",
    "sales_invoices",
    "invoices"
  ];

  for (const c of collectionsToCheck) {
    const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/${c}`));
    console.log(`companies/${COMPANY_ID}/${c}: count = ${snap.size}`);
  }

  // Also check root collections
  for (const c of ["chartOfAccounts", "chart_of_accounts", "accounts", "salesInvoices", "sales_invoices"]) {
    const snap = await getDocs(collection(db, c));
    console.log(`root ${c}: count = ${snap.size}`);
  }
}

checkCollections().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
