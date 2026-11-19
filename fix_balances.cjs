/**
 * إصلاح ثلاثة أشياء محددة:
 * 1. بنك الجزيرة: COA = الرصيد الفعلي من bankAccounts
 * 2. الصندوق الرئيسي + صندوق مصطفى: من cashBoxes
 * 3. ذمم العملاء: COA لكل عميل = رصيده في customers
 */

const { initializeApp } = require('./node_modules/firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('./node_modules/firebase/firestore');

const cfg = { apiKey: 'AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8', projectId: 'idham-foodstuffs-sa', appId: '1:771445462953:web:05d70fb7c36a385c9796b8' };
const app = initializeApp(cfg);
const db  = getFirestore(app);
const COID = 'idham-main';
const col  = n => collection(db, 'companies', COID, n);

async function main() {
  console.log('=== إصلاح الأرصدة المحددة ===\n');

  // تحميل البيانات
  const [coaSnap, bankSnap, cashSnap, custSnap] = await Promise.all([
    getDocs(col('chartOfAccounts')),
    getDocs(col('bankAccounts')),
    getDocs(col('cashBoxes')),
    getDocs(col('customers')),
  ]);

  const coaDocs = coaSnap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
  const banks   = bankSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const boxes   = cashSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const custs   = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // batch
  let batch = writeBatch(db);
  let ops   = 0;
  const flush = async () => { if (ops > 0) await batch.commit(); batch = writeBatch(db); ops = 0; };
  const upd = async (ref, data) => { batch.update(ref, data); ops++; if (ops >= 480) await flush(); };

  const now = new Date().toISOString();

  // ── 1. البنوك ────────────────────────────────
  console.log('1. البنوك:');
  for (const b of banks) {
    const bal = parseFloat(b.balance || 0);
    const acc = coaDocs.find(a => a.sourceEntityId === b.id || a.linkedEntityId === b.id);
    if (!acc) { console.log(`   ⚠️ لا يوجد COA للبنك: ${b.name}`); continue; }
    await upd(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: bal < 0 ? -bal : 0, updatedAt: now });
    console.log(`   ✅ ${b.name}: ${bal.toFixed(2)} → ${acc.code}`);
  }

  // ── 2. الصناديق ──────────────────────────────
  console.log('\n2. الصناديق:');
  for (const b of boxes) {
    const bal = parseFloat(b.balance || 0);
    const acc = coaDocs.find(a => a.sourceEntityId === b.id || a.linkedEntityId === b.id);
    if (!acc) { console.log(`   ⚠️ لا يوجد COA للصندوق: ${b.name}`); continue; }
    await upd(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: bal < 0 ? -bal : 0, updatedAt: now });
    console.log(`   ✅ ${b.name}: ${bal.toFixed(2)} → ${acc.code}`);
  }

  // ── 3. ذمم العملاء ───────────────────────────
  console.log('\n3. ذمم العملاء:');
  let custUpdated = 0, totalCOA = 0;
  for (const c of custs) {
    const bal = parseFloat(c.balance || 0);
    const acc = coaDocs.find(a => a.sourceEntityId === c.id);
    if (!acc) continue;
    await upd(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: bal < 0 ? -bal : 0, updatedAt: now });
    totalCOA += bal;
    custUpdated++;
  }
  const totalDB = custs.reduce((s, c) => s + (parseFloat(c.balance) || 0), 0);
  console.log(`   ✅ حُدِّث ${custUpdated} حساب عميل في COA`);
  console.log(`   إجمالي COA: ${totalCOA.toFixed(2)} | إجمالي DB: ${totalDB.toFixed(2)}`);

  await flush();
  console.log('\n✅ اكتمل إصلاح الأرصدة');
  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
