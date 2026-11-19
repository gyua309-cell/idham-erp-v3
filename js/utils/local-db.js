/**
 * ============================================================
 * IDHAM ERP — Local Database Engine & In-Browser Backup Manager
 * ============================================================
 * High-capacity IndexedDB local database + Instant JSON Backup / Restore
 */

import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, getDocs, doc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const DB_NAME = "IdhamERP_LocalDB";
const DB_VERSION = 1;

const COLLECTIONS = [
  "salesInvoices",
  "purchaseInvoices",
  "salesReturns",
  "purchaseReturns",
  "receipts",
  "expenses",
  "journalEntries",
  "chartOfAccounts",
  "customers",
  "suppliers",
  "salesReps",
  "employees",
  "employeeLoans",
  "products",
  "categories",
  "priceLists",
  "warehouses",
  "stockByWarehouse",
  "stockMovements",
  "stockTransfers",
  "cashBoxes",
  "bankAccounts",
  "costCenters",
  "settings"
];

let idb = null;

export async function initLocalDB() {
  if (idb) return idb;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      COLLECTIONS.forEach(col => {
        if (!dbInstance.objectStoreNames.contains(col)) {
          dbInstance.createObjectStore(col, { keyPath: "id" });
        }
      });
    };
    request.onsuccess = (e) => {
      idb = e.target.result;
      resolve(idb);
    };
    request.onerror = (e) => {
      console.warn("IndexedDB init failed:", e.target.error);
      resolve(null);
    };
  });
}

/**
 * Save records locally into IndexedDB
 */
export async function saveToLocalDB(collectionName, records) {
  try {
    const database = await initLocalDB();
    if (!database) return;
    const tx = database.transaction(collectionName, "readwrite");
    const store = tx.objectStore(collectionName);
    const arr = Array.isArray(records) ? records : [records];
    arr.forEach(item => {
      if (item && item.id) store.put(item);
    });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn(`Local save failed for ${collectionName}:`, err.message);
  }
}

/**
 * Get all records from local IndexedDB
 */
export async function getFromLocalDB(collectionName) {
  try {
    const database = await initLocalDB();
    if (!database) return [];
    return new Promise((resolve) => {
      const tx = database.transaction(collectionName, "readonly");
      const store = tx.objectStore(collectionName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Download a complete JSON backup to the user's PC with 1 click
 */
export async function downloadInBrowserBackup() {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `idham_local_backup_${dateStr}.json`;

  const backupData = {
    metadata: {
      companyId: COMPANY_ID,
      createdAt: timestamp.toISOString(),
      version: "1.0",
      totalCollections: COLLECTIONS.length,
      counts: {}
    },
    collections: {}
  };

  let totalRecords = 0;

  for (const colName of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/${colName}`));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      backupData.collections[colName] = docs;
      backupData.metadata.counts[colName] = docs.length;
      totalRecords += docs.length;
      // also save to local indexedDB
      saveToLocalDB(colName, docs);
    } catch (e) {
      backupData.collections[colName] = [];
    }
  }

  backupData.metadata.totalDocuments = totalRecords;

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { filename, totalRecords };
}

/**
 * Restore database from a local JSON backup file
 */
export async function restoreFromBackupFile(jsonString, progressCallback) {
  const data = JSON.parse(jsonString);
  if (!data.collections) {
    throw new Error("ملف النسخة الاحتياطية غير صالح أو لا يحتوي على جداول البيانات المطلوبة");
  }

  const collections = data.collections;
  let totalRestored = 0;

  for (const colName of Object.keys(collections)) {
    const records = collections[colName];
    if (!records || !records.length) continue;

    if (progressCallback) {
      progressCallback(`جاري استرجاع جدول ${colName} (${records.length} سجل)...`);
    }

    // Write in batches of 400 docs to Firestore
    for (let i = 0; i < records.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = records.slice(i, i + 400);
      chunk.forEach(item => {
        const itemCopy = { ...item };
        const id = itemCopy.id;
        delete itemCopy.id;
        batch.set(doc(db, `companies/${COMPANY_ID}/${colName}`, id), itemCopy, { merge: true });
      });
      await batch.commit();
    }

    // Save locally
    await saveToLocalDB(colName, records);
    totalRestored += records.length;
  }

  return totalRestored;
}
