/**
 * DEEP DIAGNOSTIC: Full audit of all stock operations
 * Shows complete history per product, flags all issues
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

function getDate(t) {
  if (t.date) return t.date;
  let secs = t.createdAt?.seconds || t.createdAt?._seconds;
  if (secs) return new Date(secs * 1000).toISOString().slice(0, 10);
  if (t.createdAt?.toDate) return t.createdAt.toDate().toISOString().slice(0, 10);
  return '????-??-??';
}

const TYPE_AR = {
  purchase_in:     'شراء وارد',
  purchase_return: 'مرتجع شراء',
  sale_out:        'مبيعات صادر',
  sales_invoice:   'فاتورة مبيعات',
  pos_out:         'نقطة بيع صادر',
  sale_cancel:     'إلغاء مبيعات',
  return_in:       'مرتجع مبيعات',
  transfer_out:    'تحويل صادر',
  transfer_in:     'تحويل وارد',
  adjustment:      'تسوية',
  adjustment_out:  'تسوية خصم',
  adjustment_in:   'تسوية إضافة',
  adjustment_delete:'إلغاء تسوية',
  opening:         'رصيد افتتاحي',
  damage:          'تالف',
};

async function main() {
  console.log('================================================================');
  console.log('   فحص جذري شامل لجميع عمليات المخزون');
  console.log('================================================================\n');

  // Load everything
  console.log('⏳ تحميل البيانات...');
  const [allTxns, allStock, products, warehouses] = await Promise.all([
    getAllPages(`companies/${COMPANY}/stockTransactions`),
    getAllPages(`companies/${COMPANY}/stockByWarehouse`),
    getAllPages(`companies/${COMPANY}/products`),
    getAllPages(`companies/${COMPANY}/warehouses`),
  ]);

  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = { name: p.name || p.id, code: p.code || '', totalQty: p.totalQty ?? 0 }; });
  const whMap = {};
  warehouses.forEach(w => { whMap[w.id] = w.name || w.id; });
  const stockMap = {};
  allStock.forEach(s => { stockMap[s.id] = s.qty ?? 0; });

  console.log(`   ✓ ${allTxns.length} حركة مخزون | ${allStock.length} سجل رصيد | ${products.length} صنف | ${warehouses.length} مخزن\n`);

  // Sort all transactions by date
  allTxns.sort((a, b) => {
    const da = getDate(a), db = getDate(b);
    if (da !== db) return da.localeCompare(db);
    const sa = a.createdAt?.seconds || a.createdAt?._seconds || 0;
    const sb = b.createdAt?.seconds || b.createdAt?._seconds || 0;
    return sa - sb;
  });

  // Group by productId + warehouseId
  const groups = {}; // key = `${wh}_${prod}`
  for (const t of allTxns) {
    if (!t.productId || !t.warehouseId) continue;
    const key = `${t.warehouseId}_${t.productId}`;
    if (!groups[key]) groups[key] = { warehouseId: t.warehouseId, productId: t.productId, txns: [] };
    groups[key].txns.push(t);
  }

  // ── ANALYSIS ──────────────────────────────────────────────────────────────
  const issues = [];
  const allResults = [];

  for (const [key, g] of Object.entries(groups)) {
    const whName   = whMap[g.warehouseId] || g.warehouseId;
    const prod     = prodMap[g.productId] || { name: g.productId, code: '', totalQty: 0 };
    const stored   = stockMap[key] ?? 'غير موجود';
    
    let runningQty = 0;
    const rows = [];
    for (const t of g.txns) {
      const delta  = t.qtyChange || 0;
      const before = runningQty;
      runningQty  += delta;
      const typeAr = TYPE_AR[t.type] || t.type || '—';
      const date   = getDate(t);
      rows.push({ date, type: t.type, typeAr, delta, before, after: runningQty,
        ref: t.sourceId || t.ref || '', id: t.id });
    }

    const computedQty = runningQty;
    const diff = typeof stored === 'number' ? (stored - computedQty) : null;
    const hasIssue = diff !== null && Math.abs(diff) > 0.001;
    const isNeg = computedQty < -0.001;

    allResults.push({ key, whName, prod, stored, computedQty, diff, hasIssue, isNeg, rows });
  }

  // ── SECTION 1: Products with negative balance ────────────────────────────
  const negatives = allResults.filter(r => r.isNeg);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❶ أصناف ذات رصيد سالب: ${negatives.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  for (const r of negatives) {
    console.log(`🔴 [${r.prod.code}] ${r.prod.name}  |  مخزن: ${r.whName}`);
    console.log(`   الرصيد (من الحركات): ${r.computedQty}  |  المُخزَّن: ${r.stored}`);
    console.log(`\n   تاريخ الحركات:\n`);
    console.log(`   ${'التاريخ'.padEnd(12)} ${'النوع'.padEnd(22)} ${'Δ'.padStart(5)} ${'قبل'.padStart(6)} ${'بعد'.padStart(6)}  المرجع`);
    console.log(`   ${'-'.repeat(75)}`);
    for (const row of r.rows) {
      const sign = row.delta > 0 ? '+' : '';
      const flagRow = row.after < 0 && row.before >= 0 ? '⚠️ ' : '   ';
      console.log(`${flagRow}${row.date.padEnd(12)} ${row.typeAr.padEnd(22)} ${(sign+row.delta).padStart(5)} ${String(row.before).padStart(6)} ${String(row.after).padStart(6)}  ${row.ref}`);
    }
    console.log('');
  }

  // ── SECTION 2: Out-of-sync (stored ≠ computed) ───────────────────────────
  const desynced = allResults.filter(r => r.hasIssue);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❷ أصناف غير متزامنة (مُخزَّن ≠ مجموع الحركات): ${desynced.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  if (desynced.length === 0) {
    console.log('  ✅ جميع أرصدة stockByWarehouse متطابقة مع stockTransactions\n');
  } else {
    for (const r of desynced) {
      console.log(`🟡 [${r.prod.code}] ${r.prod.name}`);
      console.log(`   مخزن: ${r.whName}`);
      console.log(`   المُخزَّن: ${r.stored}  |  من الحركات: ${r.computedQty}  |  فرق: ${r.diff > 0 ? '+' : ''}${r.diff}\n`);
    }
  }

  // ── SECTION 3: Adjustment operations full history ────────────────────────
  const adjTxns = allTxns.filter(t =>
    ['adjustment', 'adjustment_out', 'adjustment_in', 'adjustment_delete', 'damage'].includes(t.type)
  );
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❸ عمليات التسوية والتعديل: ${adjTxns.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`   ${'التاريخ'.padEnd(12)} ${'الصنف'.padEnd(30)} ${'النوع'.padEnd(22)} ${'Δ'.padStart(6)} ${'المرجع'}`);
  console.log(`   ${'-'.repeat(90)}`);
  for (const t of adjTxns) {
    const prod = prodMap[t.productId] || { name: t.productId, code: '' };
    const typeAr = TYPE_AR[t.type] || t.type;
    const sign = (t.qtyChange || 0) > 0 ? '+' : '';
    const flag = t.type === 'adjustment_delete' ? '⚠️  ' : '   ';
    console.log(`${flag}${getDate(t).padEnd(12)} ${(prod.code ? `[${prod.code}] ` : '') + prod.name.slice(0,28).padEnd(30)} ${typeAr.padEnd(22)} ${(sign+(t.qtyChange||0)).padStart(6)}  ${t.sourceId||''}`);
  }

  // ── SECTION 4: Transfer operations ──────────────────────────────────────
  const transferTxns = allTxns.filter(t => ['transfer_out', 'transfer_in'].includes(t.type));
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❹ عمليات التحويل بين المخازن: ${transferTxns.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Group by sourceId (each transfer has out + in)
  const transferGroups = {};
  for (const t of transferTxns) {
    const ref = t.sourceId || t.id;
    if (!transferGroups[ref]) transferGroups[ref] = [];
    transferGroups[ref].push(t);
  }

  for (const [ref, txns] of Object.entries(transferGroups)) {
    const outs = txns.filter(t => t.type === 'transfer_out');
    const ins  = txns.filter(t => t.type === 'transfer_in');
    const date = getDate(txns[0]);
    
    // Check balance: sum of outs + ins should be 0 for same product
    const outSum = outs.reduce((s, t) => s + (t.qtyChange || 0), 0);
    const inSum  = ins.reduce((s,  t) => s + (t.qtyChange || 0), 0);
    const balanced = Math.abs(outSum + inSum) < 0.001;
    
    const flag = balanced ? '  ✅' : '⚠️ غير متوازن';
    console.log(`  [${date}] ${ref}  ${flag}`);
    for (const t of txns) {
      const prod = prodMap[t.productId] || { name: t.productId, code: '' };
      const sign = (t.qtyChange||0) > 0 ? '+' : '';
      const wh   = whMap[t.warehouseId] || t.warehouseId;
      console.log(`    ${t.type === 'transfer_out' ? '← صادر' : '→ وارد'} ${sign}${t.qtyChange||0}  ${prod.name}  [${wh}]`);
    }
    if (!balanced) {
      console.log(`    ⚠️ صادر: ${outSum}, وارد: ${inSum}, الفرق: ${outSum + inSum}`);
    }
    console.log('');
  }

  // ── SECTION 5: Sales history ─────────────────────────────────────────────
  const salesTxns = allTxns.filter(t =>
    ['sale_out', 'sales_invoice', 'pos_out', 'sale_cancel', 'return_in'].includes(t.type)
  );
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❺ عمليات المبيعات: ${salesTxns.length} حركة`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`   ${'التاريخ'.padEnd(12)} ${'الصنف'.padEnd(30)} ${'النوع'.padEnd(16)} ${'Δ'.padStart(6)} ${'المخزن'}`);
  console.log(`   ${'-'.repeat(85)}`);
  for (const t of salesTxns) {
    const prod = prodMap[t.productId] || { name: t.productId, code: '' };
    const typeAr = TYPE_AR[t.type] || t.type;
    const sign = (t.qtyChange||0) > 0 ? '+' : '';
    const wh = whMap[t.warehouseId] || t.warehouseId;
    console.log(`   ${getDate(t).padEnd(12)} ${((prod.code?'['+prod.code+'] ':'')+prod.name).slice(0,30).padEnd(30)} ${typeAr.padEnd(16)} ${(sign+(t.qtyChange||0)).padStart(6)}  ${wh}`);
  }

  // ── SECTION 6: Summary by product (all warehouses) ───────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ❻ ملخص كل صنف (مجموع جميع المخازن)`);
  console.log(`${'═'.repeat(60)}\n`);

  // Group by productId only (sum across warehouses)
  const byProduct = {};
  for (const r of allResults) {
    if (!byProduct[r.prod.name]) byProduct[r.prod.name] = { code: r.prod.code, totalComputed: 0, stored_totalQty: r.prod.totalQty, warehouses: [] };
    byProduct[r.prod.name].totalComputed += r.computedQty;
    byProduct[r.prod.name].warehouses.push({ wh: r.whName, qty: r.computedQty, stored: r.stored });
  }

  const prodSummary = Object.entries(byProduct)
    .filter(([_, v]) => v.totalComputed !== 0 || v.warehouses.some(w => Math.abs(w.qty) > 0))
    .sort((a, b) => a[0].localeCompare(b[0]));

  for (const [name, v] of prodSummary) {
    const flag = v.totalComputed < 0 ? '🔴' : v.totalComputed === 0 ? '🟡' : '🟢';
    const prodTotalMismatch = Math.abs(v.stored_totalQty - v.totalComputed) > 0.001;
    console.log(`${flag} [${v.code}] ${name}: ${v.totalComputed} وحدة إجمالاً${prodTotalMismatch ? ` (products.totalQty=${v.stored_totalQty} ← يحتاج تصحيح)` : ''}`);
    for (const wh of v.warehouses) {
      const mismatch = typeof wh.stored === 'number' && Math.abs(wh.stored - wh.qty) > 0.001;
      console.log(`   ${wh.wh}: ${wh.qty} ${mismatch ? `⚠️ مُخزَّن=${wh.stored}` : ''}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  انتهى الفحص`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(console.error);
