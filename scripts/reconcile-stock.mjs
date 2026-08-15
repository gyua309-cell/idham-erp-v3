/**
 * FULL RECONCILIATION: Rebuild stockByWarehouse from stockTransactions
 * 
 * The stock card/ledger computes balance by summing all qtyChange values in
 * stockTransactions (starting from 0). The stockByWarehouse.qty should equal
 * this sum. This script reconciles them for ALL products.
 */

const API_KEY  = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT  = "idham-foodstuffs-sa";
const COMPANY  = "idham-main";
const BASE     = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function parseFields(fields = {}) {
  const r = {};
  for (const [k, v] of Object.entries(fields)) {
    if      (v.stringValue  !== undefined) r[k] = v.stringValue;
    else if (v.doubleValue  !== undefined) r[k] = v.doubleValue;
    else if (v.integerValue !== undefined) r[k] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) r[k] = v.booleanValue;
    else if (v.arrayValue)                r[k] = (v.arrayValue.values||[]).map(x=>parseFields(x.mapValue?.fields||{}));
    else if (v.mapValue)                  r[k] = parseFields(v.mapValue.fields||{});
    else r[k] = null;
  }
  return r;
}

async function getAllPages(collPath) {
  let allDocs = [];
  let pageToken = null;
  do {
    let url = `${BASE}/${collPath}?key=${API_KEY}&pageSize=300`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const docs = (data.documents || []).map(d => ({
      id: d.name.split('/').pop(),
      ...parseFields(d.fields || {})
    }));
    allDocs = allDocs.concat(docs);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return allDocs;
}

async function runQuery(colId, fieldPath, value, valueType = 'stringValue') {
  const parent = `companies/${COMPANY}`;
  const url = `${BASE}/${parent}:runQuery?key=${API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: colId }],
      where: {
        fieldFilter: {
          field: { fieldPath },
          op: 'EQUAL',
          value: { [valueType]: value }
        }
      },
      limit: 500
    }
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  if (!Array.isArray(data)) { console.error('Query error:', JSON.stringify(data).slice(0,200)); return []; }
  return data.filter(d => d.document).map(d => ({
    id: d.document.name.split('/').pop(),
    ...parseFields(d.document.fields || {})
  }));
}

async function patchDoc(path, updates) {
  const fPaths = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const url = `${BASE}/${path}?key=${API_KEY}&${fPaths}`;
  const fields = {};
  for (const [k, v] of Object.entries(updates)) {
    if      (typeof v === 'number')  fields[k] = { doubleValue: v };
    else if (typeof v === 'string')  fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
  }
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error(`  ❌ PATCH ${path}: ${resp.status} ${t.slice(0,150)}`);
  }
  return resp.ok;
}

async function main() {
  console.log('================================================================');
  console.log('  إعادة حساب stockByWarehouse من stockTransactions');
  console.log('  (مطابقة الكارت مع أرصدة المخازن)');
  console.log('================================================================\n');

  // 1. Load all stockByWarehouse records
  console.log('📂 تحميل أرصدة المخازن...');
  const allStock = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
  console.log(`   ${allStock.length} سجل مخزون\n`);

  // 2. Load ALL stockTransactions
  console.log('📂 تحميل جميع حركات المخزون (stockTransactions)...');
  const allTxns = await getAllPages(`companies/${COMPANY}/stockTransactions`);
  console.log(`   ${allTxns.length} حركة\n`);

  // 3. Group transactions by warehouseId + productId, sum qtyChange
  const computed = {}; // key: `${warehouseId}_${productId}` → { sum, warehouseId, productId }
  for (const t of allTxns) {
    const wh = t.warehouseId;
    const pr = t.productId;
    if (!wh || !pr) continue;
    const key = `${wh}_${pr}`;
    if (!computed[key]) computed[key] = { sum: 0, warehouseId: wh, productId: pr };
    computed[key].sum += (t.qtyChange || 0);
  }

  // 4. Compare and fix
  let synced = 0, fixed = 0, skipped = 0;
  const discrepancies = [];

  for (const s of allStock) {
    const key = s.id; // already in format warehouseId_productId
    const currentQty = s.qty ?? 0;
    const computed_entry = computed[key];
    const correctQty = computed_entry ? Math.round(computed_entry.sum * 10000) / 10000 : 0;

    if (Math.abs(currentQty - correctQty) < 0.001) {
      synced++;
      continue;
    }

    discrepancies.push({
      key, warehouseId: s.warehouseId, productId: s.productId,
      currentQty, correctQty, diff: correctQty - currentQty
    });
  }

  // Also check for stockByWarehouse records that don't exist yet but should
  for (const [key, entry] of Object.entries(computed)) {
    const existing = allStock.find(s => s.id === key);
    if (!existing && Math.abs(entry.sum) > 0.001) {
      discrepancies.push({
        key, warehouseId: entry.warehouseId, productId: entry.productId,
        currentQty: 0, correctQty: entry.sum, diff: entry.sum,
        missing: true
      });
    }
  }

  console.log(`📊 نتائج المقارنة:`);
  console.log(`   متطابق: ${synced}`);
  console.log(`   يحتاج تصحيح: ${discrepancies.length}\n`);

  if (discrepancies.length === 0) {
    console.log('✅ جميع الأرصدة متطابقة مع حركات المخزون!');
    return;
  }

  // Load products for names
  console.log('📂 تحميل أسماء الأصناف...');
  const products = await getAllPages(`companies/${COMPANY}/products`);
  const prodMap = {};
  for (const p of products) prodMap[p.id] = p.name || p.code || p.id;

  console.log('\n');
  for (const d of discrepancies) {
    const prodName = prodMap[d.productId] || d.productId;
    const sign = d.diff > 0 ? '+' : '';
    console.log(`${d.currentQty < 0 || d.correctQty < 0 ? '🔴' : d.diff !== 0 ? '🟡' : '🟢'} ${prodName}`);
    console.log(`   المستودع  : ${d.warehouseId}`);
    console.log(`   الحالي    : ${d.currentQty} → الصحيح (من الحركات): ${d.correctQty} (فرق: ${sign}${d.diff})`);

    const stockPath = `companies/${COMPANY}/stockByWarehouse/${d.key}`;
    const ok = await patchDoc(stockPath, { qty: d.correctQty });
    console.log(`   ${ok ? '✅ تم التصحيح' : '❌ فشل التصحيح'}\n`);
    if (ok) fixed++; else skipped++;
  }

  console.log('================================================================');
  console.log(`  النتيجة: تم تصحيح ${fixed} سجل | فشل ${skipped}`);
  console.log('================================================================\n');

  // 5. Final summary of affected products
  console.log('الأرصدة النهائية بعد المطابقة:\n');
  for (const d of discrepancies) {
    const prodName = prodMap[d.productId] || d.productId;
    const flag = d.correctQty < 0 ? '🔴 سالب' : d.correctQty === 0 ? '🟡 صفر' : '🟢';
    console.log(`${flag} ${prodName}: ${d.correctQty} وحدة`);
    if (d.correctQty < 0) {
      console.log(`   ⚠️  الكمية المُصرَّفة (${Math.abs(d.correctQty)}) تجاوزت الرصيد المتاح`);
    }
  }
}

main().catch(console.error);
