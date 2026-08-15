import fs from 'fs';
import https from 'https';
import { execSync } from 'child_process';

const config = fs.readFileSync('js/firebase-config.js', 'utf8');
const apiKeyMatch = config.match(/apiKey:\s*["']([^"']+)["']/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';
const projectId = 'idham-foodstuffs-sa';
const companyId = 'idham-main';

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/companies/${companyId}`;

function get(url) {
  const separator = url.includes('?') ? '&' : '?';
  return new Promise((resolve) => {
    https.get(`${url}${separator}key=${apiKey}`, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve({}); }
      });
    });
  });
}

const collections = [
  'products',
  'categories',
  'warehouses',
  'stockByWarehouse',
  'chartOfAccounts',
  'customers',
  'suppliers',
  'salesReps',
  'journalEntries',
  'stockTransfers',
  'salesInvoices',
  'purchaseInvoices',
  'receipts',
  'expenses',
  'salesReturns',
  'purchaseReturns'
];

async function run() {
  console.log('--- STARTING FIRESTORE TO GITHUB BACKUP ---');
  const backupDir = 'database_backup';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  let successCount = 0;
  let failCount = 0;

  for (const col of collections) {
    console.log(`Backing up collection: ${col}...`);
    const data = await get(`${BASE_URL}/${col}?pageSize=1000`);
    
    if (data.error) {
      console.error(`  ❌ Failed to backup ${col}:`, data.error.message || data.error);
      failCount++;
    } else {
      const documents = data.documents || [];
      const filepath = `${backupDir}/${col}.json`;
      fs.writeFileSync(filepath, JSON.stringify(documents, null, 2), 'utf8');
      console.log(`  ✅ Saved ${documents.length} docs to ${filepath}`);
      successCount++;
    }
  }

  console.log(`\nBackup Summary: ${successCount} successful, ${failCount} failed.`);

  if (successCount > 0) {
    console.log('\nCommitting and pushing backups to GitHub...');
    try {
      execSync('git add database_backup/*', { stdio: 'inherit' });
      execSync('git commit -m "Auto-update database backup from Firestore"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Database backups successfully pushed to GitHub!');
    } catch (gitErr) {
      console.error('❌ Git push failed. Please push manually using: git push origin main');
    }
  }
}

run();
