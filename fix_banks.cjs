/**
 * ربط وإصلاح حسابات البنوك في COA
 */
const { initializeApp } = require('./node_modules/firebase/app');
const { getFirestore, collection, getDocs, writeBatch } = require('./node_modules/firebase/firestore');

const cfg = { apiKey: 'AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8', projectId: 'idham-foodstuffs-sa', appId: '1:771445462953:web:05d70fb7c36a385c9796b8' };
const app = initializeApp(cfg);
const db  = getFirestore(app);
const COID = 'idham-main';
const col  = n => collection(db, 'companies', COID, n);

async function main() {
  const [coaSnap, bankSnap, cashSnap] = await Promise.all([
    getDocs(col('chartOfAccounts')),
    getDocs(col('bankAccounts')),
    getDocs(col('cashBoxes')),
  ]);

  const coaDocs = coaSnap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
  const banks   = bankSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const boxes   = cashSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // عرض جميع حسابات البنك في COA
  console.log('حسابات البنوك في COA:');
  coaDocs.filter(a => (a.code||'').startsWith('1-1-1-3')).forEach(a =>
    console.log('  ', a.code, '|', a.name, '| رصيد:', a.balance, '| sourceEntityId:', a.sourceEntityId||'—')
  );

  console.log('\nحسابات الصناديق في COA:');
  coaDocs.filter(a => (a.code||'').startsWith('1-1-1-2') || (a.code||'').startsWith('1-1-1-1')).forEach(a =>
    console.log('  ', a.code, '|', a.name, '| رصيد:', a.balance, '| sourceEntityId:', a.sourceEntityId||'—')
  );

  console.log('\nبيانات البنوك الفعلية:');
  banks.forEach(b => console.log('  id:', b.id, '| اسم:', b.name, '| رصيد:', b.balance));

  console.log('\nبيانات الصناديق الفعلية:');
  boxes.forEach(b => console.log('  id:', b.id, '| اسم:', b.name, '| رصيد:', b.balance));

  // ── إصلاح: ربط البنوك يدوياً بالكود ──
  const BANK_MAP = {
    'bank-aljazira':  '1-1-1-3-01',  // بنك الجزيرة
    'bank-alrajhi':   '1-1-1-3-02',  // بنك الراجحي
  };

  const now = new Date().toISOString();
  const batch = writeBatch(db);
  let ops = 0;

  for (const b of banks) {
    const code = BANK_MAP[b.id];
    if (!code) { console.log(`\n⚠️ لا يوجد mapping للبنك: ${b.id}`); continue; }
    const acc = coaDocs.find(a => a.code === code);
    if (!acc) { console.log(`\n⚠️ حساب ${code} غير موجود في COA`); continue; }
    const bal = parseFloat(b.balance || 0);
    batch.update(acc.ref, {
      balance:        bal,
      totalDebit:     bal >= 0 ? bal : 0,
      totalCredit:    bal < 0  ? -bal : 0,
      sourceEntityId: b.id,   // ربط مستقبلي
      updatedAt:      now,
    });
    ops++;
    console.log(`\n✅ ربط بنك: ${b.name} (${b.id}) → ${code} | رصيد: ${bal}`);
  }

  // ── إصلاح الصندوق الرئيسي الذي كان 1 بدل 726 ──
  const mainBox = boxes.find(b => b.name?.includes('الرئيسي') || b.name?.includes('رئيسى'));
  if (mainBox) {
    // البحث بالاسم في COA
    const acc = coaDocs.find(a => a.name?.includes('رئيسي') || a.name?.includes('رئيسى') || a.code === '1-1-1-1-3');
    if (acc) {
      const bal = parseFloat(mainBox.balance || 0);
      batch.update(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: 0, sourceEntityId: mainBox.id, updatedAt: now });
      ops++;
      console.log(`✅ صندوق رئيسي: ${bal} → ${acc.code}`);
    }
  }

  if (ops > 0) { await batch.commit(); console.log('\n✅ تم الحفظ'); }
  else console.log('\n⚠️ لا شيء يحتاج تحديث');
  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
