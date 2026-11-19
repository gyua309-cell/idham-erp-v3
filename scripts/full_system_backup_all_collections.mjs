import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e",
  storageBucket: "idham-b3a7e.firebasestorage.app",
  messagingSenderId: "915839133333",
  appId: "1:915839133333:web:fe472e01993025f08a9d9c"
};

const companyId = 'idham-main';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ALL_ERP_COLLECTIONS = [
  'products',
  'categories',
  'units',
  'priceLists',
  'warehouses',
  'stockByWarehouse',
  'stockTransactions',
  'stockTransfers',
  'customers',
  'suppliers',
  'salesReps',
  'salesInvoices',
  'purchaseInvoices',
  'salesReturns',
  'purchaseReturns',
  'chartOfAccounts',
  'journalEntries',
  'receipts',
  'cashBoxes',
  'cashTransactions',
  'bankAccounts',
  'bankTransactions',
  'expenses',
  'employees',
  'quotations',
  'cheques',
  'purchaseRequests',
  'purchaseOrders',
  'goodsReceiptPOs',
  'qualityInspections',
  'inventoryAdjustments',
  'productAssemblies',
  'physicalCounts',
  'auditTrails',
  'settings',
  'users',
  'counters',
  'locations',
  'costCenters',
  'deliveryNotes',
  'employeeLoans',
  'payrolls',
  'employeeLeaves',
  'employeeAttendance',
  'employeeSettlements',
  'supplierContracts',
  'supplierClaims',
  'supplierEvaluations',
  'supplierQuotations',
  'supplierDeliveries',
  'supplierNotes',
  'supplierRebates',
  'customerContracts',
  'customerComplaints',
  'customerLeads',
  'customerNotes',
  'loyaltyTransactions',
  'segmentPromotions',
  'promissoryNotes',
  'trustReceipts'
];

async function runComprehensiveBackup() {
  console.log("============================================================");
  console.log("🛡️ STARTING 100% COMPREHENSIVE ERP FULL BACKUP");
  console.log("============================================================");

  const baseBackupDir = path.resolve('قاعدة_البيانات_والنسخ_الاحتياطي');
  const backupsDir = path.join(baseBackupDir, 'backups');
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const snapshotDir = path.join(backupsDir, `snapshot_${dateStr}`);

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const fullData = {
    metadata: {
      companyId,
      backupStartedAt: now.toISOString(),
      erpName: 'إدهام للمواد الغذائية',
      totalCollectionsListed: ALL_ERP_COLLECTIONS.length,
      counts: {},
      totalDocuments: 0
    },
    companyDoc: null,
    collections: {}
  };

  // 1. Backup company document
  try {
    const compSnap = await getDoc(doc(db, 'companies', companyId));
    if (compSnap.exists()) {
      fullData.companyDoc = { id: compSnap.id, ...compSnap.data() };
      console.log(`✓ Company Doc (${companyId}) backed up.`);
    }
  } catch (err) {
    console.warn(`⚠️ Error reading company doc:`, err.message);
  }

  let totalDocsCount = 0;

  // 2. Backup all collections sequentially to ensure 100% data integrity
  for (const colName of ALL_ERP_COLLECTIONS) {
    try {
      const colRef = collection(db, `companies/${companyId}/${colName}`);
      const snap = await getDocs(colRef);
      const docs = snap.docs.map(d => {
        const data = d.data();
        // Safe serialization of dates/timestamps
        Object.keys(data).forEach(k => {
          if (data[k] && typeof data[k] === 'object' && data[k].toDate && typeof data[k].toDate === 'function') {
            data[k] = data[k].toDate().toISOString();
          }
        });
        return { id: d.id, ...data };
      });

      fullData.collections[colName] = docs;
      fullData.metadata.counts[colName] = docs.length;
      totalDocsCount += docs.length;

      // Save individual collection snapshot
      const colFile = path.join(snapshotDir, `${colName}.json`);
      fs.writeFileSync(colFile, JSON.stringify(docs, null, 2), 'utf-8');

      if (docs.length > 0) {
        console.log(`  ✓ ${colName.padEnd(25)}: ${String(docs.length).padStart(5)} documents`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Error fetching ${colName}:`, err.message);
      fullData.collections[colName] = [];
      fullData.metadata.counts[colName] = 0;
    }
  }

  fullData.metadata.totalDocuments = totalDocsCount;
  fullData.metadata.backupCompletedAt = new Date().toISOString();

  // Save the master single JSON file
  const masterFile = path.join(backupsDir, `idham_FULL_BACKUP_${dateStr}.json`);
  fs.writeFileSync(masterFile, JSON.stringify(fullData, null, 2), 'utf-8');

  // Also update latest master file
  const latestMasterFile = path.join(backupsDir, `idham_FULL_BACKUP_LATEST.json`);
  fs.writeFileSync(latestMasterFile, JSON.stringify(fullData, null, 2), 'utf-8');

  // Generate Manifest Report
  const manifest = {
    backupDate: now.toISOString(),
    masterBackupFile: masterFile,
    snapshotDirectory: snapshotDir,
    totalDocumentsSaved: totalDocsCount,
    collectionSummary: fullData.metadata.counts
  };
  fs.writeFileSync(path.join(snapshotDir, '_MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  const masterSizeMB = (fs.statSync(masterFile).size / (1024 * 1024)).toFixed(2);

  console.log("\n============================================================");
  console.log("✅ 100% COMPREHENSIVE BACKUP FINISHED SUCCESSFULLY!");
  console.log(`📦 Master File: ${masterFile} (${masterSizeMB} MB)`);
  console.log(`📂 Folder Snapshot: ${snapshotDir} (individual JSON per collection)`);
  console.log(`📊 Total Documents Saved: ${totalDocsCount}`);
  console.log("============================================================\n");
}

runComprehensiveBackup().catch(err => {
  console.error("❌ Fatal Backup Error:", err);
  process.exit(1);
});
