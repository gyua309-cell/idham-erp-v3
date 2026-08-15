/**
 * FINAL FIX: Remove orphaned stockTransactions from deleted adjustment UHsGHcheHKTDanAC2psf
 * 
 * ROOT CAUSE ANALYSIS:
 * ====================
 * 
 * PROBLEM 1 - Double Deduction on 9 products:
 *   - UHsGHcheHKTDanAC2psf: adjustment document was deleted (by user request) 
 *     BUT its stockTransactions were NOT deleted → orphaned phantom deductions remain
 *   - BCTUbnBr2yCz8ksXO0WB: user re-entered the donation → NEW stockTransactions created
 *   - Result: DOUBLE deduction for same products
 * 
 * PROBLEM 2 - سكر الاسرة صغير 20*1 كيلو (مخزن سيارة 1 مصطفى) = -1:
 *   - UNRELATED to adjustments! Pure SALES issue.
 *   - Sales rep مصطفى sold 1 unit (REP-20323249 on 2026-08-05) beyond his allocated stock
 *   - The car warehouse had 0 units, sale was still processed → -1
 *   - FIX: Add a stock transfer to cover this, or adjust the sale
 * 
 * PROBLEM 3 - 3aqia7dfI2rrb7FNTXqn:
 *   - A small separate adjustment that deducted 1 from سكر الاسرة كرتون
 *   - Will investigate if it should stay or go
 * 
 * THIS SCRIPT:
 *   Step 1: Delete all stockTransactions where sourceId = 'UHsGHcheHKTDanAC2psf'
 *   Step 2: Run reconciliation to fix stockByWarehouse
 */

const API_KEY  = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT  = "idham-foodstuffs-sa";
const COMPANY  = "idham-main";
const BASE     = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const ORPHAN_ID = "UHsGHcheHKTDanAC2psf"; // deleted doc, orphaned transactions

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
  if (!Array.isArray(data)) { console.error('Query error:', JSON.stringify(data).slice(0,200)); return []; }
  return data.filter(d => d.document).map(d => ({
    id: d.document.name.split('/').pop(),
    fullPath: d.document.name.replace(`projects/${PROJECT}/databases/(default)/documents/`, ''),
    ...parseFields(d.document.fields || {})
  }));
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

async function deleteDoc(path) {
  const url = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url, { method: 'DELETE' });
  return resp.ok || resp.status === 404;
}

async function patchDoc(path, updates) {
  const fPaths = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const url = `${BASE}/${path}?key=${API_KEY}&${fPaths}`;
  const fields = {};
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (typeof v === 'string') fields[k] = { stringValue: v };
  }
  const resp = await fetch(url, {
    method: 'PATCH', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ fields })
  });
  return resp.ok;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  الإصلاح الجذري النهائي');
  console.log('════════════════════════════════════════════════════════════════\n');

  // ── STEP 1: Print diagnosis ───────────────────────────────────────────────
  console.log('📋 ملخص تشخيص المشكلة:\n');
  console.log('  المشكلة ❶: خصم مزدوج لـ 9+ أصناف');
  console.log('  ─────────────────────────────────────');
  console.log('  التسوية UHsGHcheHKTDanAC2psf (2026-08-06): تم حذف الوثيقة لكن');
  console.log('  حركات المخزون (stockTransactions) بقيت يتيمة بدون مستند.');
  console.log('  ثم أدخل المستخدم تسوية جديدة BCTUbnBr2yCz8ksXO0WB (2026-08-07)');
  console.log('  للأصناف نفسها → خصم مرتين = رصيد سالب!\n');
  console.log('  المشكلة ❷: سكر الاسرة صغير 20*1 كيلو = -1 وحدة');
  console.log('  ─────────────────────────────────────');
  console.log('  المخزن: مخزن سيارة 1 مصطفى');
  console.log('  السبب: مبيعات (REP-20323249 في 2026-08-05)');
  console.log('  المندوب باع وحدة من المخزن وكان الرصيد صفر → رصيد سالب');
  console.log('  ليس له علاقة بالتسويات على الإطلاق!\n');

  // ── STEP 2: Find orphaned transactions ───────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`  حذف حركات يتيمة: sourceId = ${ORPHAN_ID}`);
  console.log('════════════════════════════════════════════════════════════════\n');

  const orphanTxns = await runQuery('stockTransactions', 'sourceId', ORPHAN_ID);
  console.log(`  وجد ${orphanTxns.length} حركة يتيمة\n`);

  const products = await getAllPages(`companies/${COMPANY}/products`);
  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p.name || p.id; });

  // Show what will be deleted
  let totalRestored = {}; // key: wh_prod → qty to add back
  for (const t of orphanTxns) {
    const prodName = prodMap[t.productId] || t.productId;
    const delta = t.qtyChange || 0;
    const sign = delta > 0 ? '+' : '';
    console.log(`  🗑️  حذف: ${prodName} | ${sign}${delta} | مخزن: ${t.warehouseId}`);
    // Track what to reverse in stockByWarehouse
    const k = `${t.warehouseId}_${t.productId}`;
    if (!totalRestored[k]) totalRestored[k] = { warehouseId: t.warehouseId, productId: t.productId, deltaToReverse: 0 };
    totalRestored[k].deltaToReverse += delta;
  }

  if (orphanTxns.length === 0) {
    console.log('  ✅ لا توجد حركات يتيمة - ربما تم إصلاحها مسبقاً\n');
  } else {
    // Delete orphaned transactions
    console.log('\n  🔄 جاري الحذف...\n');
    let deleted = 0, failed = 0;
    for (const t of orphanTxns) {
      const ok = await deleteDoc(t.fullPath);
      if (ok) { deleted++; console.log(`  ✅ حُذفت: ${t.id}`); }
      else { failed++; console.log(`  ❌ فشل: ${t.id}`); }
    }
    console.log(`\n  النتيجة: حُذفت ${deleted} | فشل ${failed}\n`);

    // Update stockByWarehouse to reverse the orphaned deductions
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  تحديث أرصدة المخازن لعكس الحركات المحذوفة');
    console.log('════════════════════════════════════════════════════════════════\n');

    const allStock = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
    const stockMap = {};
    allStock.forEach(s => { stockMap[s.id] = s.qty ?? 0; });

    for (const [key, info] of Object.entries(totalRestored)) {
      const currentQty = stockMap[key] ?? 0;
      const newQty = currentQty - info.deltaToReverse; // Reverse the delta
      const prodName = prodMap[info.productId] || info.productId;
      const sign = info.deltaToReverse > 0 ? '+' : '';
      console.log(`  📦 ${prodName}`);
      console.log(`     الرصيد الحالي: ${currentQty}`);
      console.log(`     الحركة المحذوفة: ${sign}${info.deltaToReverse} (سيُعكس)`);
      console.log(`     الرصيد الجديد: ${newQty}`);
      const ok = await patchDoc(`companies/${COMPANY}/stockByWarehouse/${key}`, { qty: newQty });
      console.log(`     ${ok ? '✅ تم التحديث' : '❌ فشل التحديث'}\n`);
    }
  }

  // ── STEP 3: Check 3aqia7dfI2rrb7FNTXqn ──────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  فحص التسوية 3aqia7dfI2rrb7FNTXqn');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Check if the adjustment document still exists
  const adjDoc3a = await runQuery('inventoryAdjustments', 'id', '3aqia7dfI2rrb7FNTXqn');
  const txns3a = await runQuery('stockTransactions', 'sourceId', '3aqia7dfI2rrb7FNTXqn');

  // Try direct fetch
  const resp3a = await fetch(`${BASE}/companies/${COMPANY}/inventoryAdjustments/3aqia7dfI2rrb7FNTXqn?key=${API_KEY}`);
  const docExists = resp3a.ok;

  console.log(`  وثيقة التسوية موجودة؟ ${docExists ? '✅ نعم' : '❌ لا (محذوفة)'}`);
  console.log(`  عدد حركات المخزون المرتبطة: ${txns3a.length}`);
  for (const t of txns3a) {
    const prodName = prodMap[t.productId] || t.productId;
    console.log(`  - ${prodName}: ${t.qtyChange > 0 ? '+' : ''}${t.qtyChange}`);
  }

  if (!docExists && txns3a.length > 0) {
    console.log('\n  ⚠️  هذه التسوية أيضاً يتيمة (مستند محذوف + حركات باقية)!');
    console.log('  هل تريد حذف هذه الحركات أيضاً؟ راجع التقرير وقرر.\n');
  } else if (docExists) {
    console.log('\n  ✅ هذه تسوية صحيحة ومرتبطة بوثيقتها - لا حاجة للتعديل\n');
  }

  // ── STEP 4: Final state after fix ────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  الأرصدة النهائية للأصناف المتأثرة');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Reload all txns and recompute
  const allTxns = await getAllPages(`companies/${COMPANY}/stockTransactions`);
  const allStockFinal = await getAllPages(`companies/${COMPANY}/stockByWarehouse`);
  const stockMapFinal = {};
  allStockFinal.forEach(s => { stockMapFinal[s.id] = s.qty ?? 0; });

  // Compute from transactions for affected products
  const affectedProds = [
    ...new Set(orphanTxns.map(t => t.productId))
  ];

  for (const prodId of affectedProds) {
    const prodName = prodMap[prodId] || prodId;
    const prodTxns = allTxns.filter(t => t.productId === prodId);
    const total = prodTxns.reduce((s, t) => s + (t.qtyChange || 0), 0);
    const stored = Object.entries(stockMapFinal)
      .filter(([k]) => k.endsWith(`_${prodId}`))
      .map(([k, v]) => `${k.split('_')[0]}: ${v}`);
    const flag = total < 0 ? '🔴' : total === 0 ? '🟡' : '🟢';
    console.log(`${flag} ${prodName}`);
    console.log(`   من الحركات: ${total} وحدة`);
    console.log(`   stockByWarehouse: ${stored.join(', ')}\n`);
  }

  // ── STEP 5: Summary of سكر الاسرة صغير ──────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  سكر الاسرة صغير 20*1 كيلو - تفصيل السبب');
  console.log('════════════════════════════════════════════════════════════════\n');
  console.log('  هذا الصنف في مخزن سيارة 1 مصطفى وصل إلى -1 بسبب:');
  console.log('  ────────────────────────────────────────────────');
  console.log('  📅 2026-07-16: تحويل وارد  +1 → رصيد = 1');
  console.log('  📅 2026-07-18: تحويل وارد  +2 → رصيد = 3');
  console.log('  📅 2026-07-18: تحويل صادر  -1 → رصيد = 2');
  console.log('  📅 2026-07-21: مبيعات      -2 → رصيد = 0');
  console.log('  📅 2026-07-22: مبيعات      -1 → رصيد = -1 ⚠️');
  console.log('  📅 2026-07-22: مبيعات      -1 → رصيد = -2');
  console.log('  📅 2026-07-22: مبيعات      -1 → رصيد = -3');
  console.log('  📅 2026-07-22: تحويل وارد  +4 → رصيد = 1');
  console.log('  📅 2026-07-22: مبيعات      -1 → رصيد = 0');
  console.log('  📅 2026-07-28: غير محدد    +1 → رصيد = 1');
  console.log('  📅 2026-08-01: مبيعات      -1 → رصيد = 0');
  console.log('  📅 2026-08-05: مبيعات      -1 → رصيد = -1 ⚠️ (REP-20323249)');
  console.log('');
  console.log('  الحل: إضافة تحويل وارد +1 لمخزن السيارة، أو مراجعة الفاتورة REP-20323249');
  console.log('');

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  انتهى الإصلاح');
  console.log('════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
