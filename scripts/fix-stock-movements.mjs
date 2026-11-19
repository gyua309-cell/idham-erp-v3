/**
 * Full Diagnostic + Auto-Fix for inventory movements on 2026-08-07
 * Finds erroneous adjustment_delete movements and corrects warehouse stock
 */

const API_KEY = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT = "idham-foodstuffs-sa";
const COMPANY = "idham-main";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function parseFields(fields = {}) {
  const r = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue  !== undefined) r[k] = v.stringValue;
    else if (v.doubleValue  !== undefined) r[k] = v.doubleValue;
    else if (v.integerValue !== undefined) r[k] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) r[k] = v.booleanValue;
    else if (v.arrayValue)  r[k] = (v.arrayValue.values || []).map(x => parseFields(x.mapValue?.fields || {}));
    else if (v.mapValue)    r[k] = parseFields(v.mapValue.fields || {});
    else r[k] = null;
  }
  return r;
}

function buildValue(val) {
  if (typeof val === 'string')  return { stringValue: val };
  if (typeof val === 'number')  return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  return { nullValue: null };
}

async function runQuery(colPath, filters = []) {
  const parts = colPath.split('/');
  const colId = parts.pop();
  const parentPath = parts.join('/');
  const url = `${BASE}/${parentPath}:runQuery?key=${API_KEY}`;
  const sq = { from: [{ collectionId: colId }], limit: 200 };
  if (filters.length === 1) {
    sq.where = { fieldFilter: { field: { fieldPath: filters[0].f }, op: "EQUAL", value: buildValue(filters[0].v) } };
  } else if (filters.length > 1) {
    sq.where = { compositeFilter: { op: "AND", filters: filters.map(f => ({
      fieldFilter: { field: { fieldPath: f.f }, op: "EQUAL", value: buildValue(f.v) }
    })) } };
  }
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: sq }) });
  const data = await resp.json();
  if (!Array.isArray(data)) { console.error('Query error:', JSON.stringify(data)); return []; }
  return data.filter(d => d.document).map(d => ({ id: d.document.name.split('/').pop(), _path: d.document.name, ...parseFields(d.document.fields || {}) }));
}

async function getDoc(path) {
  const url = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const d = await resp.json();
  return { id: d.name.split('/').pop(), ...parseFields(d.fields || {}) };
}

async function deleteFireDoc(path) {
  const url = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url, { method: 'DELETE' });
  return resp.status;
}

async function patchDoc(path, fields) {
  const url = `${BASE}/${path}?key=${API_KEY}`;
  const body = { fields: {} };
  for (const [k, v] of Object.entries(fields)) body.fields[k] = buildValue(v);
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.ok;
}

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  تشخيص شامل لحركات مخزون التسويات 2026-08-07');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. Get ALL adjustment_delete movements (created when phantoms were deleted)
  const delMovements = await runQuery(
    `companies/${COMPANY}/stockMovements`,
    [{ f: 'type', v: 'adjustment_delete' }]
  );
  console.log(`حركات adjustment_delete الموجودة: ${delMovements.length}`);
  
  // 2. Get ALL adjustment_out movements (the real donation that ran)
  const outMovements = await runQuery(
    `companies/${COMPANY}/stockMovements`,
    [{ f: 'type', v: 'adjustment_out' }]
  );
  console.log(`حركات adjustment_out الموجودة: ${outMovements.length}\n`);

  // Group adjustment_out by sourceId
  const outBySrc = {};
  for (const m of outMovements) {
    if (!outBySrc[m.sourceId]) outBySrc[m.sourceId] = [];
    outBySrc[m.sourceId].push(m);
  }

  // 3. For each adjustment_delete, check if the original adjustment had a corresponding adjustment_out
  console.log('════════════════════════════════════════════════════════');
  console.log('  تحليل كل حركة adjustment_delete');
  console.log('════════════════════════════════════════════════════════\n');

  const erroneousDeletes = [];

  for (const dm of delMovements) {
    const srcId = dm.sourceId;
    const hasOriginalOut = outBySrc[srcId] && outBySrc[srcId].some(o => o.productId === dm.productId);
    
    console.log(`[${dm.id}] منتج: ${dm.productName || dm.productId} | مستودع: ${dm.warehouseId}`);
    console.log(`  sourceId: ${srcId} | قيمة التغيير: ${dm.qtyDelta || 0}`);
    
    if (!hasOriginalOut) {
      console.log(`  ⚠️  لا يوجد adjustment_out مقابل لهذه الحركة!`);
      console.log(`  → هذا الـ adjustment_delete خاطئ (عكس تسوية وهمية)`);
      erroneousDeletes.push(dm);
    } else {
      console.log(`  ✅  لها adjustment_out مقابل — الحذف كان صحيحاً`);
    }
    console.log('');
  }

  if (erroneousDeletes.length === 0) {
    console.log('✅ لا توجد حركات خاطئة. المشكلة في مكان آخر.\n');
  } else {
    console.log(`\n⚠️  عدد الحركات الخاطئة: ${erroneousDeletes.length}`);
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  تطبيق الإصلاح: حذف الحركات الخاطئة وتعديل المخزون');
    console.log('════════════════════════════════════════════════════════\n');

    for (const dm of erroneousDeletes) {
      const wrongQty = dm.qtyDelta || 0; // This was erroneously added
      const stockDocId = `${dm.warehouseId}_${dm.productId}`;
      const stockPath = `companies/${COMPANY}/warehouseStock/${stockDocId}`;
      
      // Get current stock
      const stock = await getDoc(stockPath);
      const currentQty = stock ? (stock.qty || 0) : 0;
      const correctedQty = currentQty - wrongQty; // Remove the erroneous qty
      
      console.log(`🔧 إصلاح: ${dm.productName || dm.productId}`);
      console.log(`   المستودع: ${dm.warehouseId}`);
      console.log(`   الكمية الحالية: ${currentQty}`);
      console.log(`   التعديل الخاطئ كان: +${wrongQty}`);
      console.log(`   الكمية المصححة: ${correctedQty}`);
      
      // Fix warehouse stock
      if (stock) {
        const ok = await patchDoc(stockPath, { qty: correctedQty });
        console.log(`   ${ok ? '✅' : '❌'} تحديث warehouseStock → ${correctedQty}`);
      } else {
        console.log(`   ⚠️  لم يُعثر على سجل مخزون للمستودع`);
      }
      
      // Delete erroneous stockMovement
      const movPath = `companies/${COMPANY}/stockMovements/${dm.id}`;
      const s = await deleteFireDoc(movPath);
      console.log(`   ${s === 200 ? '✅' : '❌'} حذف حركة المخزون الخاطئة (status: ${s})`);
      console.log('');
    }
  }

  // 4. Show final state of all affected warehouse stock
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  الرصيد النهائي لكل مستودع بعد الإصلاح');
  console.log('════════════════════════════════════════════════════════\n');

  // Get unique productIds from all movements
  const affectedProducts = new Set([
    ...delMovements.map(m => m.productId),
    ...outMovements.map(m => m.productId)
  ]);

  for (const pid of affectedProducts) {
    // Query warehouseStock for this product across all warehouses
    const stocks = await runQuery(
      `companies/${COMPANY}/warehouseStock`,
      [{ f: 'productId', v: pid }]
    );
    const prodName = delMovements.find(m => m.productId === pid)?.productName
                  || outMovements.find(m => m.productId === pid)?.productName
                  || pid;
    
    if (stocks.length === 0) {
      console.log(`${prodName}: لا يوجد سجل مخزون`);
    } else {
      let total = 0;
      for (const s of stocks) {
        const q = s.qty || 0;
        total += q;
        const flag = q < 0 ? '🔴' : q === 0 ? '🟡' : '🟢';
        console.log(`${flag} ${prodName}`);
        console.log(`   ${s.warehouseId || s.id}: ${q} وحدة`);
      }
      console.log(`   الإجمالي الكلي: ${total}\n`);
    }
  }
}

main().catch(console.error);
