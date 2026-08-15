/**
 * Firestore REST API - Stock Analysis
 * Uses the Firestore REST API with web API key (rules allow public read)
 */

const API_KEY = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT = "idham-foodstuffs-sa";
const COMPANY = "idham-main";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

async function runQuery(collectionPath, filters = []) {
  const structuredQuery = {
    from: [{ collectionId: collectionPath.split('/').pop() }],
    where: filters.length === 1 ? {
      fieldFilter: {
        field: { fieldPath: filters[0].field },
        op: filters[0].op || "EQUAL",
        value: filters[0].value
      }
    } : filters.length > 1 ? {
      compositeFilter: {
        op: "AND",
        filters: filters.map(f => ({
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op || "EQUAL",
            value: f.value
          }
        }))
      }
    } : undefined,
    limit: 50
  };

  const parentPath = collectionPath.split('/').slice(0, -1).join('/');
  const url = `${BASE}/${parentPath}:runQuery?key=${API_KEY}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery })
  });

  const data = await resp.json();
  if (!Array.isArray(data)) {
    console.error('Query error:', JSON.stringify(data));
    return [];
  }
  return data.filter(d => d.document).map(d => ({
    id: d.document.name.split('/').pop(),
    ...parseFields(d.document.fields || {})
  }));
}

function parseFields(fields) {
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue);
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.arrayValue) result[key] = (val.arrayValue.values || []).map(v => parseFields(v.mapValue?.fields || {}));
    else if (val.mapValue) result[key] = parseFields(val.mapValue.fields || {});
    else result[key] = null;
  }
  return result;
}

async function getAllDocs(collectionPath) {
  const url = `${BASE}/${collectionPath}?key=${API_KEY}&pageSize=100`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!data.documents) return [];
  return data.documents.map(d => ({
    id: d.name.split('/').pop(),
    ...parseFields(d.fields || {})
  }));
}

async function main() {
  console.log('================================================================');
  console.log('   تحليل تأثير تسويات التبرعات على المخزون');
  console.log('================================================================\n');

  // 1. Get donation adjustments
  const adjs = await runQuery(
    `companies/${COMPANY}/inventoryAdjustments`,
    [{ field: 'type', value: { stringValue: 'donation' } }]
  );

  console.log(`📋 عدد تسويات التبرعات الموجودة: ${adjs.length}\n`);

  if (adjs.length === 0) {
    console.log('لا توجد تسويات تبرعات!');
    return;
  }

  const productIds = new Set();
  for (const adj of adjs) {
    const lines = adj.lines || [];
    console.log(`────────────────────────────────────`);
    console.log(`🆔 ID: ${adj.id}`);
    console.log(`📅 التاريخ: ${adj.date}`);
    console.log(`💰 التكلفة: ${adj.totalCost || 0} ر.س`);
    console.log(`📝 البيان: ${adj.notes || '—'}`);
    console.log(`📦 الأصناف (${lines.length}):`);
    for (const l of lines) {
      console.log(`   • ${l.productName || l.productId} | كمية: ${l.qty} | تكلفة الوحدة: ${l.cost || 0}`);
      if (l.productId) productIds.add(l.productId);
    }
    console.log('');
  }

  // 2. Check stock movements linked to each adjustment
  console.log('\n================================================================');
  console.log('   حركات المخزون المرتبطة بالتسويات (stockMovements)');
  console.log('================================================================\n');

  for (const adj of adjs) {
    const movements = await runQuery(
      `companies/${COMPANY}/stockMovements`,
      [{ field: 'sourceId', value: { stringValue: adj.id } }]
    );

    if (movements.length === 0) {
      console.log(`❌ [${adj.id}] → لا توجد حركة مخزون! (التسوية لم تؤثر على المخزون)`);
    } else {
      console.log(`✅ [${adj.id}] → ${movements.length} حركة مخزون:`);
      for (const m of movements) {
        console.log(`   • ${m.type || m.opType} | ${m.productName || m.productId} | Δ: ${m.qtyDelta || m.qty || 0}`);
      }
    }
  }

  // 3. Check journal entries linked to adjustments
  console.log('\n================================================================');
  console.log('   القيود المحاسبية المرتبطة (journalEntries)');
  console.log('================================================================\n');

  for (const adj of adjs) {
    const jes = await runQuery(
      `companies/${COMPANY}/journalEntries`,
      [{ field: 'sourceId', value: { stringValue: adj.id } }]
    );

    if (jes.length === 0) {
      console.log(`❌ [${adj.id}] → لا يوجد قيد محاسبي مرتبط`);
    } else {
      for (const je of jes) {
        console.log(`✅ [${adj.id}] → قيد: ${je.id} | المبلغ: ${je.totalDebit || 0} ر.س | الحالة: ${je.status}`);
      }
    }
  }

  // 4. Current warehouse stock for affected products
  console.log('\n================================================================');
  console.log('   الرصيد الحالي في المستودع للأصناف المتأثرة');
  console.log('================================================================\n');

  const allStock = await getAllDocs(`companies/${COMPANY}/warehouseStock`);
  const affected = allStock.filter(s => productIds.has(s.productId));

  if (affected.length === 0) {
    console.log('⚠️ لم يتم العثور على سجلات مخزون للأصناف المتأثرة');
  } else {
    for (const s of affected) {
      const qty = s.qty ?? s.quantity ?? 0;
      const flag = qty < 0 ? '🔴 سالب!' : qty === 0 ? '🟡 صفر' : '🟢';
      console.log(`${flag} ${s.productName || s.productId} | الكمية الحالية: ${qty} | المستودع: ${s.warehouseName || s.warehouseId}`);
    }
  }

  console.log('\n================================================================');
  console.log('   الخلاصة');
  console.log('================================================================');
}

main().catch(console.error);
