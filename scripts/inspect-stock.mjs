/**
 * Inspect stockMovements - show raw data to understand field names
 */
const API_KEY = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT = "idham-foodstuffs-sa";
const COMPANY = "idham-main";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function parseFields(fields = {}) {
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined)      result[key] = val.stringValue;
    else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    else if (val.integerValue !== undefined)result[key] = parseInt(val.integerValue);
    else if (val.booleanValue !== undefined)result[key] = val.booleanValue;
    else if (val.arrayValue)               result[key] = (val.arrayValue.values||[]).map(v=>parseFields(v.mapValue?.fields||{}));
    else if (val.mapValue)                 result[key] = parseFields(val.mapValue.fields||{});
    else result[key] = null;
  }
  return result;
}

async function getAllDocs(collectionPath, pageToken = null) {
  let url = `${BASE}/${collectionPath}?key=${API_KEY}&pageSize=50`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  const resp = await fetch(url);
  const data = await resp.json();
  const docs = (data.documents || []).map(d => ({
    id: d.name.split('/').pop(),
    ...parseFields(d.fields || {})
  }));
  return { docs, nextPageToken: data.nextPageToken };
}

async function main() {
  console.log('=== جميع حركات المخزون (stockMovements) ===\n');

  let pageToken = null;
  let allDocs = [];
  
  do {
    const { docs, nextPageToken } = await getAllDocs(`companies/${COMPANY}/stockMovements`, pageToken);
    allDocs = allDocs.concat(docs);
    pageToken = nextPageToken;
  } while (pageToken);

  console.log(`إجمالي الحركات: ${allDocs.length}\n`);
  
  // Show unique field names from first doc
  if (allDocs.length > 0) {
    console.log('حقول المستند الأول:', Object.keys(allDocs[0]).join(', '));
    console.log('');
  }

  // Show all docs sorted by date descending
  const sorted = allDocs.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  
  for (const d of sorted) {
    const allKeys = Object.entries(d).map(([k,v]) => `${k}:${v}`).join(' | ');
    console.log(`[${d.id}] ${allKeys}`);
  }

  // Also check warehouseStock
  console.log('\n=== أرصدة المستودعات (warehouseStock) ===\n');
  const { docs: stockDocs } = await getAllDocs(`companies/${COMPANY}/warehouseStock`);
  console.log(`إجمالي: ${stockDocs.length} سجل`);
  for (const s of stockDocs) {
    console.log(`[${s.id}] ${s.productName||s.productId} | المستودع: ${s.warehouseId} | الكمية: ${s.qty ?? s.quantity ?? '?'}`);
  }
}

main().catch(console.error);
