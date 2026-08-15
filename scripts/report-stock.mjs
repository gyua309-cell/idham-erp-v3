/**
 * Show named stock balances after fix
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

async function getDoc(path) {
  const url  = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.fields) return null;
  return { id: data.name.split('/').pop(), ...parseFields(data.fields) };
}

// Products affected by fix (IDs from fix output)
const affected = [
  { id: 'ndlDJpMG9hlBKQe4MauJ', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'dtCMNYIhjGBZGCUE6Lr1', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'n4IW05Dc6fcoU0G6Ac2t', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: '7ty5VeY9ebD9ljF6VuAB', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'LYDz1hvYQAgGoTpbTOSw', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'FvWk9Bio56bO2RWhnZTf', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: '4NzCCNfozK7Vy1tIyEHA', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'oILf9Ggdj8bYNt4Pl492', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'fLTt9zHDbOC7GKFzZWZV', whId: 'W5uANJjMgfFh2p3xU4bT' },
  { id: 'beXxTsnefRyHdex6cB0E', whId: 'W5uANJjMgfFh2p3xU4bT' },
];

async function main() {
  console.log('================================================================');
  console.log('   الأرصدة الحالية بعد الإصلاح (مع أسماء الأصناف)');
  console.log('================================================================\n');

  // Also check adjustment_out to see what the donation contained
  const url = `${BASE}/companies/${COMPANY}/stockTransactions:runQuery?key=${API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'stockTransactions' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'type' },
            op: 'EQUAL',
            value: { stringValue: 'adjustment_out' }
          }
        },
        limit: 50
      }
    })
  });
  
  const data = await resp.json();
  const outTxns = Array.isArray(data) 
    ? data.filter(d => d.document).map(d => ({
        id: d.document.name.split('/').pop(),
        ...parseFields(d.document.fields || {})
      }))
    : [];

  console.log(`📤 حركات التسوية الصحيحة (adjustment_out): ${outTxns.length}`);
  for (const t of outTxns) {
    console.log(`   ${t.productName||t.productId} | -${Math.abs(t.qtyChange||0)} | warehouse: ${t.warehouseId}`);
  }

  console.log('\n📦 الأرصدة الحالية في المستودع الرئيسي:\n');

  const uniqueIds = [...new Set(affected.map(a => a.id))];
  for (const productId of uniqueIds) {
    const prod = await getDoc(`companies/${COMPANY}/products/${productId}`);
    const stock = await getDoc(`companies/${COMPANY}/stockByWarehouse/W5uANJjMgfFh2p3xU4bT_${productId}`);
    
    const name = prod?.name || prod?.productName || productId;
    const code = prod?.code || prod?.productCode || '';
    const qty  = stock?.qty ?? 'لم يوجد';
    const flag = typeof qty === 'number' ? (qty < 0 ? '🔴 سالب' : qty === 0 ? '🟡 صفر' : '🟢') : '⚠️';
    
    console.log(`${flag} [${code}] ${name}`);
    console.log(`   الرصيد في المستودع الرئيسي: ${qty}`);
    if (typeof qty === 'number' && qty < 0) {
      console.log(`   ⚠️  يحتاج مراجعة: الكمية المُتبرع بها تجاوزت الرصيد المسجل`);
    }
    console.log('');
  }
}

main().catch(console.error);
