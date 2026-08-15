/**
 * FIX: Bad "adjustment_delete" stock transactions
 * 
 * Root cause: When the user deleted the FIRST phantom adjustment through the UI,
 * deleteAdjustment called adjustStock to REVERSE stock. But the phantom adjustment
 * never deducted stock in the first place. So those reversals are WRONG.
 *
 * This script:
 * 1. Finds all "adjustment_delete" stockTransactions
 * 2. For each one: reverse it (deduct the incorrectly added qty)
 * 3. Updates stockByWarehouse.qty correctly
 * 4. Updates products.totalQty correctly
 * 5. Deletes the bad stockTransaction record
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

function toFirestore(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if      (typeof v === 'number')  fields[k] = { doubleValue: v };
    else if (typeof v === 'string')  fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
  }
  return { fields };
}

async function runQuery(collectionPath, filter) {
  const parts  = collectionPath.split('/');
  const colId  = parts.pop();
  const parent = parts.join('/');
  const url    = `${BASE}/${parent}:runQuery?key=${API_KEY}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: colId }],
      where: {
        fieldFilter: {
          field: { fieldPath: filter.field },
          op: filter.op || "EQUAL",
          value: filter.value
        }
      },
      limit: 200
    }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  if (!Array.isArray(data)) { console.error('Query error:', JSON.stringify(data).slice(0,300)); return []; }
  return data.filter(d => d.document).map(d => ({
    id: d.document.name.split('/').pop(),
    ...parseFields(d.document.fields || {})
  }));
}

async function getDoc(path) {
  const url  = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.fields) return null;
  return { id: data.name.split('/').pop(), ...parseFields(data.fields) };
}

async function patchDoc(path, updates) {
  const fieldPaths = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const url = `${BASE}/${path}?key=${API_KEY}&${fieldPaths}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toFirestore(updates))
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error('PATCH failed:', resp.status, t.slice(0,200));
  }
  return resp.ok;
}

async function deleteDocApi(path) {
  const url  = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url, { method: 'DELETE' });
  return resp.status;
}

async function main() {
  console.log('================================================================');
  console.log('   تشخيص وإصلاح أرصدة المخزون');
  console.log('   (stockTransactions + stockByWarehouse + products)');
  console.log('================================================================\n');

  // 1. Show ALL stockTransactions (all types) to understand current state
  const allTxns = await runQuery(
    `companies/${COMPANY}/stockTransactions`,
    { field: 'type', value: { stringValue: 'adjustment_delete' } }
  );
  console.log(`🔍 حركات adjustment_delete: ${allTxns.length}`);
  for (const t of allTxns) {
    console.log(`   [${t.id}] ${t.productName||t.productId} | qtyChange: ${t.qtyChange} | warehouse: ${t.warehouseId} | sourceId: ${t.sourceId}`);
  }

  const outTxns = await runQuery(
    `companies/${COMPANY}/stockTransactions`,
    { field: 'type', value: { stringValue: 'adjustment_out' } }
  );
  console.log(`\n✅ حركات adjustment_out: ${outTxns.length}`);
  for (const t of outTxns) {
    console.log(`   [${t.id}] ${t.productName||t.productId} | qtyChange: ${t.qtyChange} | warehouse: ${t.warehouseId}`);
  }

  // Also check stockByWarehouse
  console.log('\n📦 أرصدة stockByWarehouse:');
  const stockByWhResp = await fetch(`${BASE}/companies/${COMPANY}/stockByWarehouse?key=${API_KEY}&pageSize=100`);
  const stockByWhData = await stockByWhResp.json();
  const stockDocs = (stockByWhData.documents||[]).map(d => ({
    id: d.name.split('/').pop(),
    ...parseFields(d.fields||{})
  }));
  for (const s of stockDocs) {
    console.log(`   [${s.id}] ${s.productId} | warehouse: ${s.warehouseId} | qty: ${s.qty}`);
  }

  if (allTxns.length === 0) {
    console.log('\n✅ لا توجد حركات adjustment_delete — ربما تم الإصلاح مسبقاً أو البيانات سليمة');
    return;
  }

  console.log('\n================================================================');
  console.log('   بدء الإصلاح ...');
  console.log('================================================================\n');

  let fixCount = 0;
  for (const txn of allTxns) {
    const badQtyChange = txn.qtyChange || 0; // e.g. +1 (wrong reversal)
    const correctDelta = -badQtyChange;       // e.g. -1 (undo the bad reversal)

    const productId  = txn.productId;
    const warehouseId= txn.warehouseId;

    console.log(`\n📦 ${txn.productName || productId}`);
    console.log(`   المستودع: ${warehouseId}`);
    console.log(`   قيمة الحركة الخاطئة: ${badQtyChange > 0 ? '+' : ''}${badQtyChange}`);

    // Fix stockByWarehouse
    const stockPath = `companies/${COMPANY}/stockByWarehouse/${warehouseId}_${productId}`;
    const stockDoc  = await getDoc(stockPath);

    if (!stockDoc) {
      console.log(`   ⚠️  لا يوجد سجل مخزون في: ${stockPath}`);
    } else {
      const currentQty = stockDoc.qty ?? 0;
      const newQty     = currentQty + correctDelta;
      console.log(`   الرصيد الحالي: ${currentQty} → الصحيح: ${newQty}`);
      const ok = await patchDoc(stockPath, { qty: newQty });
      console.log(`   ${ok ? '✅' : '❌'} تصحيح stockByWarehouse`);
    }

    // Fix products.totalQty
    const prodPath = `companies/${COMPANY}/products/${productId}`;
    const prodDoc  = await getDoc(prodPath);

    if (prodDoc) {
      const currentTotal = prodDoc.totalQty ?? 0;
      const newTotal     = currentTotal + correctDelta;
      console.log(`   totalQty الحالي: ${currentTotal} → الصحيح: ${newTotal}`);
      const ok2 = await patchDoc(prodPath, { totalQty: newTotal });
      console.log(`   ${ok2 ? '✅' : '❌'} تصحيح products.totalQty`);
    }

    // Delete the bad stockTransaction
    const delStatus = await deleteDocApi(`companies/${COMPANY}/stockTransactions/${txn.id}`);
    console.log(`   ${(delStatus===200||delStatus===204) ? '✅' : '❌'} حذف الحركة الخاطئة [${txn.id}] (status: ${delStatus})`);

    fixCount++;
  }

  console.log('\n================================================================');
  console.log(`   ✅ تم إصلاح ${fixCount} منتج`);
  console.log('================================================================\n');

  // Final state
  console.log('الرصيد النهائي بعد التصحيح:\n');
  for (const txn of allTxns) {
    const stockPath = `companies/${COMPANY}/stockByWarehouse/${txn.warehouseId}_${txn.productId}`;
    const s = await getDoc(stockPath);
    console.log(`   ${txn.productName||txn.productId}: ${s ? s.qty : 'لم يوجد'} وحدة في ${txn.warehouseId}`);
  }
}

main().catch(console.error);
