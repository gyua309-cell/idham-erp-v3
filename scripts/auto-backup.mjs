/**
 * ============================================================
 * IDHAM ERP — Automated Full Local Database Backup Script
 * ============================================================
 * Exports all company collections to structured timestamped JSON snapshots
 * into: e:\ادهام للمواد الغذائية\قاعدة_البيانات_والنسخ_الاحتياطي\backups\
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
  storageBucket: "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId: "1:915839133333:web:fe472e01993025f08a9d9c",
  measurementId: "G-Y797B0GWYK"
};

const companyId = 'idham-main';

// Target directory for local backups
const backupDir = path.resolve(__dirname, '..', 'قاعدة_البيانات_والنسخ_الاحتياطي', 'backups');

const COLLECTIONS_TO_BACKUP = [
  'salesInvoices',
  'purchaseInvoices',
  'salesReturns',
  'purchaseReturns',
  'receipts',
  'expenses',
  'journalEntries',
  'chartOfAccounts',
  'customers',
  'suppliers',
  'salesReps',
  'employees',
  'employeeLoans',
  'products',
  'categories',
  'priceLists',
  'warehouses',
  'stockByWarehouse',
  'stockMovements',
  'stockTransfers',
  'inventoryCounts',
  'cashBoxes',
  'bankAccounts',
  'costCenters',
  'settings',
  'payroll',
  'quotations',
  'promissoryNotes',
  'trustReceipts',
  'inventoryAdjustments',
  'cashTransactions',
  'bankTransactions',
  'deliveryNotes'
];

async function executeBackup() {
  console.log('🚀 Starting Automated Local Backup for Idham ERP...');
  console.log(`📁 Target Directory: ${backupDir}`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const timestamp = new Date();
  const dateStr = timestamp.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFilename = `idham_backup_${dateStr}.json`;
  const backupFilePath = path.join(backupDir, backupFilename);
  const latestFilePath = path.join(backupDir, `idham_backup_latest.json`);

  const fullData = {
    metadata: {
      companyId,
      backupCreatedAt: timestamp.toISOString(),
      backupVersion: '1.0',
      totalCollections: COLLECTIONS_TO_BACKUP.length,
      counts: {}
    },
    collections: {}
  };

  let totalDocs = 0;

  for (const colName of COLLECTIONS_TO_BACKUP) {
    try {
      const snap = await getDocs(collection(db, `companies/${companyId}/${colName}`));
      const docs = snap.docs.map(d => {
        const data = d.data();
        // Convert Timestamps to ISO strings for portable serialization
        Object.keys(data).forEach(k => {
          if (data[k] && typeof data[k] === 'object' && data[k].toDate && typeof data[k].toDate === 'function') {
            data[k] = data[k].toDate().toISOString();
          }
        });
        return { id: d.id, ...data };
      });

      fullData.collections[colName] = docs;
      fullData.metadata.counts[colName] = docs.length;
      totalDocs += docs.length;
      console.log(`  ✓ ${colName.padEnd(20)} : ${docs.length} records`);
    } catch (colErr) {
      console.warn(`  ⚠️ Error fetching ${colName}:`, colErr.message);
      fullData.collections[colName] = [];
      fullData.metadata.counts[colName] = 0;
    }
  }

  fullData.metadata.totalDocuments = totalDocs;

  // Write timestamped backup JSON
  fs.writeFileSync(backupFilePath, JSON.stringify(fullData, null, 2), 'utf-8');
  // Write latest backup JSON (for fast restore / instant read)
  fs.writeFileSync(latestFilePath, JSON.stringify(fullData, null, 2), 'utf-8');

  const fileSizeMB = (fs.statSync(backupFilePath).size / (1024 * 1024)).toFixed(2);

  console.log(`\n============================================================`);
  console.log(`✅ BACKUP COMPLETED SUCCESSFULLY!`);
  console.log(`📦 File: ${backupFilename} (${fileSizeMB} MB)`);
  console.log(`📊 Total Records Saved: ${totalDocs} records across ${COLLECTIONS_TO_BACKUP.length} collections`);
  console.log(`📍 Location: ${backupFilePath}`);
  console.log(`============================================================\n`);

  return { backupFilePath, totalDocs, backupFilename };
}

executeBackup().catch(err => {
  console.error('❌ Backup Failed:', err);
  process.exit(1);
});
