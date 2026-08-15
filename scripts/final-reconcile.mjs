/**
 * Fix remaining orphan: 3aqia7dfI2rrb7FNTXqn
 * Also do final full reconcile to ensure complete consistency
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
  let allDocs = [], pageToken = null;
  do {
    let url = `${BASE}/${collPath}?key=${API_KEY}&pageSize=300`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const docs = (data.documents || []).map(d => ({
      id: d.name.split('/').pop(),
      fullPath: d.name.replace(`projects/${PROJECT}/databases/(default)/documents/`, ''),
      ...parseFields(d.fields || {})
    }));
    allDocs = allDocs.concat(docs);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return allDocs;
}

async function runQuery(colId, field, value) {
  const parent = `companies/${COMPANY}`;
  const url = `${BASE}/${parent}:runQuery?key=${API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: colId }],
      where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
      limit: 300
    }
  };
  const resp = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data.filter(d => d.document).map(d => ({
    id: d.document.name.split('/').pop(),
    fullPath: d.document.name.replace(`projects/${PROJECT}/databases/(default)/documents/`, ''),
    ...parseFields(d.document.fields || {})
  }));
}

async function deleteDoc(path) {
  const resp = await fetch(`${BASE}/${path}?key=${API_KEY}`, { method: 'DELETE' });
  return resp.ok || resp.status === 404;
}

async function patchDoc(path, updates) {
  const fPaths = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const url = `${BASE}/${path}?key=${API_KEY}&${fPaths}`;
  const fields = {};
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === 'number') fields[k] = { doubleValue: v };
  }
  const resp = await fetch(url, {
    method:'PATCH', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ fields })
  });
  return resp.ok;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  إصلاح التسوية اليتيمة الأخيرة + مطابقة شاملة نهائية');
  console.log('════════════════════════════════════════════════════════════\n');

  const products = await getAllPages(`companies/${COMPANY}/products`);
  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p.name || p.id; });

  // Fix 3aqia7dfI2rrb7FNTXqn orphan
  const ORPHAN2 = '3aqia7dfI2rrb7FNTXqn';
  const txns2 = await runQuery('stockTransactions', 'sourceId', ORPHAN2);
  
  console.log(`📋 التسوية اليتيمة ${ORPHAN2}:`);
  console.log(`   عدد الحركات: ${txns2.length}`);

  if (txns2.length > 0) {
    for (const t of txns2) {
      const prodName = prodMap[t.productId] || t.productId;
      console.log(`   - ${prodName}: ${t.qtyChange > 0 ? '+' : ''}${t.qtyChange}`);
    }

    // Get current stockByWarehouse
    const allStock = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
    const stockMap = {};
    allStock.forEach(s => { stockMap[s.id] = s.qty ?? 0; });

    console.log('\n   🔄 حذف الحركات وتصحيح الأرصدة...\n');
    for (const t of txns2) {
      const prodName = prodMap[t.productId] || t.productId;
      const key = `${t.warehouseId}_${t.productId}`;
      const current = stockMap[key] ?? 0;
      const newQty = current - (t.qtyChange || 0);
      
      const del = await deleteDoc(t.fullPath);
      const patch = await patchDoc(`companies/${COMPANY}/stockByWarehouse/${key}`, { qty: newQty });
      console.log(`   ${del && patch ? '✅' : '❌'} ${prodName}: ${current} → ${newQty}`);
    }
  } else {
    console.log('   ✅ لا توجد حركات يتيمة\n');
  }

  // Full final reconcile
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  مطابقة شاملة نهائية: stockByWarehouse ↔ stockTransactions');
  console.log('════════════════════════════════════════════════════════════\n');

  const allTxns = await getAllPages(`companies/${COMPANY}/stockTransactions`);
  const allStock = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
  const warehouses = await getAllPages(`companies/${COMPANY}/warehouses`);
  const whMap = {};
  warehouses.forEach(w => { whMap[w.id] = w.name || w.id; });

  // Compute correct quantities from transactions
  const computed = {};
  for (const t of allTxns) {
    if (!t.productId || !t.warehouseId) continue;
    const key = `${t.warehouseId}_${t.productId}`;
    if (!computed[key]) computed[key] = 0;
    computed[key] += (t.qtyChange || 0);
  }

  const stockMap2 = {};
  allStock.forEach(s => { stockMap2[s.id] = s.qty ?? 0; });

  let synced = 0, fixed = 0, negatives = [];
  for (const s of allStock) {
    const correct = Math.round((computed[s.id] ?? 0) * 10000) / 10000;
    const current = s.qty ?? 0;
    if (Math.abs(current - correct) < 0.001) { synced++; continue; }
    const ok = await patchDoc(`companies/${COMPANY}/stockByWarehouse/${s.id}`, { qty: correct });
    if (ok) fixed++;
    const prodName = prodMap[s.productId] || s.productId;
    console.log(`  ${ok ? '✅' : '❌'} [${whMap[s.warehouseId] || s.warehouseId}] ${prodName}: ${current} → ${correct}`);
  }
  
  // Collect negatives after fix
  for (const [key, qty] of Object.entries(computed)) {
    if (qty < -0.001) {
      const [whId, ...rest] = key.split('_');
      const prodId = rest.join('_');
      negatives.push({ whId, prodId, qty, whName: whMap[whId] || whId, prodName: prodMap[prodId] || prodId });
    }
  }

  console.log(`\n  متطابق: ${synced} | صُحِّح: ${fixed}\n`);

  // Final status
  console.log('════════════════════════════════════════════════════════════');
  console.log('  الوضع النهائي');
  console.log('════════════════════════════════════════════════════════════\n');

  if (negatives.length === 0) {
    console.log('  ✅ لا يوجد أي رصيد سالب في جميع المخازن!\n');
  } else {
    console.log(`  ⚠️  أصناف ذات رصيد سالب (${negatives.length}):\n`);
    for (const n of negatives) {
      console.log(`  🔴 ${n.prodName}`);
      console.log(`     المخزن: ${n.whName}`);
      console.log(`     الرصيد: ${n.qty}\n`);
    }
  }

  // Show affected products final state
  const keyProducts = [
    'سكر الاسرة صغير', 'سكر الاسرة كرتون', 'دقيق بكتات', 'ملح ساسا',
    'تمر الاحساء', 'فول صينى', 'مكرونة اورين', 'شاهى الربيع',
    'معجون طماطم', 'زيت دوار', 'ارز ابو كاس'
  ];
  
  console.log('  الأصناف المتأثرة:\n');
  const allStockFinal = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
  
  // Group by product
  const byProd = {};
  for (const s of allStockFinal) {
    if (!byProd[s.productId]) byProd[s.productId] = [];
    byProd[s.productId].push({ wh: whMap[s.warehouseId] || s.warehouseId, qty: s.qty ?? 0 });
  }
  
  for (const [prodId, entries] of Object.entries(byProd)) {
    const name = prodMap[prodId] || prodId;
    const isKey = keyProducts.some(k => name.includes(k.split(' ')[0]));
    if (!isKey) continue;
    const total = entries.reduce((s, e) => s + e.qty, 0);
    const flag = total < 0 ? '🔴' : total === 0 ? '🟡' : '🟢';
    console.log(`  ${flag} ${name}: إجمالي ${total}`);
    for (const e of entries) {
      if (Math.abs(e.qty) > 0) console.log(`     └ ${e.wh}: ${e.qty}`);
    }
  }
  
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  انتهت المطابقة الشاملة النهائية');
  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
