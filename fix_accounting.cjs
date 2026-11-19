/**
 * IDHAM ERP — الإصلاح الشامل للمحاسبة
 * 1. قيود الفواتير الناقصة (13)
 * 2. قيود سندات القبض الناقصة (34)
 * 3. قيود سندات الصرف الناقصة (1)
 * 4. إعادة حساب COA كامل من القيود
 * 5. مزامنة البنوك والصناديق مع COA
 * 6. حساب الأرباح والخسائر المرحّلة (3-3 و 3-4)
 * 7. تقليص شجرة الحسابات (حذف حسابات صفرية غير مستخدمة)
 */

const { initializeApp }  = require('./node_modules/firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  where,
  addDoc,
  updateDoc,
  limit,
} = require('./node_modules/firebase/firestore');

const cfg = {
  apiKey:    'AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8',
  projectId: 'idham-foodstuffs-sa',
  appId:     '1:771445462953:web:05d70fb7c36a385c9796b8',
};
const app = initializeApp(cfg);
const db  = getFirestore(app);
const COID = 'idham-main';
const col  = n => collection(db, 'companies', COID, n);

// ── batch helper (max 480 / flush) ───────────────
let _batch = null, _ops = 0;
async function batchUpdate(ref, data) {
  if (!_batch) _batch = writeBatch(db);
  _batch.update(ref, data); _ops++;
  if (_ops >= 480) await flush();
}
async function batchDelete(ref) {
  if (!_batch) _batch = writeBatch(db);
  _batch.delete(ref); _ops++;
  if (_ops >= 480) await flush();
}
async function flush() {
  if (_batch && _ops > 0) { await _batch.commit(); }
  _batch = null; _ops = 0;
}

// ── helpers ──────────────────────────────────────
function getCashBankCode(r, coaDocs) {
  if (r.cashBankAccountCode) {
    const found = coaDocs.find(a => a.code === r.cashBankAccountCode);
    if (found) return r.cashBankAccountCode;
  }
  if (r.cashBoxId) {
    const a = coaDocs.find(x => x.sourceEntityId === r.cashBoxId || x.linkedEntityId === r.cashBoxId);
    return a ? a.code : '1-1-1-2';
  }
  if (r.bankAccountId) {
    const a = coaDocs.find(x => x.sourceEntityId === r.bankAccountId || x.linkedEntityId === r.bankAccountId);
    return a ? a.code : '1-1-1-3';
  }
  if (r.sourceAccountType === 'bank') return '1-1-1-3';
  return '1-1-1-2';
}
function getCashBankName(r) {
  return r.sourceAccountName || (r.bankAccountId ? 'البنك' : 'الصندوق');
}
function getEntityCode(id, coaDocs, fallback) {
  if (!id) return fallback;
  const a = coaDocs.find(x => x.sourceEntityId === id);
  return a ? a.code : fallback;
}

// ══════════════════════════════════════════════════
// 1. قيود الفواتير الناقصة
// ══════════════════════════════════════════════════
async function fixInvoiceJEs(allJE, coaDocs) {
  console.log('\n[1] إصلاح قيود الفواتير الناقصة...');
  const jeKeys = new Set(
    allJE.filter(j => j.sourceType === 'salesInvoice' || j.sourceType === 'sales').map(j => j.sourceId)
  );
  const snap = await getDocs(col('salesInvoices'));
  const missing = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i => i.status !== 'cancelled' && !jeKeys.has(i.invoiceNumber) && !jeKeys.has(i.id));

  console.log(`   فواتير بلا قيد: ${missing.length}`);
  let n = 0;
  for (const inv of missing) {
    const key      = inv.invoiceNumber || inv.id;
    const total    = parseFloat(inv.totalWithVat || inv.total || 0);
    const sub      = parseFloat(inv.subtotal || 0) || total / 1.15;
    const vat      = parseFloat(inv.vatAmount || 0) || sub * 0.15;
    const pm       = (inv.paymentMethod || 'credit').toLowerCase();
    const isCredit = ['credit','deferred','آجل','partial','جزئي'].includes(pm);
    const isBank   = ['bank','transfer','شبكة','mada','visa'].includes(pm);

    let debitCode, debitName;
    if (isCredit) {
      debitCode = getEntityCode(inv.customerId, coaDocs, '1-1-2-1');
      debitName = inv.customerName || 'عميل';
    } else if (isBank) {
      debitCode = inv.cashBankAccountCode || '1-1-1-3';
      debitName = 'البنك';
    } else {
      debitCode = inv.cashBankAccountCode || '1-1-1-2';
      debitName = 'الصندوق';
    }

    const lines = [
      { accountCode: debitCode, accountName: debitName,           debit: total, credit: 0 },
      { accountCode: '4-1-1',  accountName: 'إيرادات المبيعات',  debit: 0,     credit: parseFloat(sub.toFixed(2)) },
    ];
    if (vat > 0.01) {
      lines.push({ accountCode: '2-1-3-1', accountName: 'ضريبة القيمة المضافة المستحقة', debit: 0, credit: parseFloat(vat.toFixed(2)) });
    }

    await addDoc(col('journalEntries'), {
      sourceType: 'salesInvoice', sourceId: key,
      date: inv.date || new Date().toISOString().split('T')[0],
      description: `مبيعات — فاتورة ${key} — ${inv.customerName || ''}`,
      lines, createdAt: new Date().toISOString(), isAutomatic: true, autoFixed: true,
    });
    console.log(`   ✅ ${key} | ${inv.customerName} | ${total.toFixed(2)}`);
    n++;
  }
  console.log(`   [1] أُنشئ ${n} قيد فاتورة`);
  return n;
}

// ══════════════════════════════════════════════════
// 2. قيود سندات القبض الناقصة
// ══════════════════════════════════════════════════
async function fixReceiptJEs(allJE, coaDocs) {
  console.log('\n[2] إصلاح قيود سندات القبض الناقصة...');
  const jeKeys = new Set(allJE.filter(j => j.sourceType === 'receipt').map(j => j.sourceId));
  const snap   = await getDocs(col('receipts'));
  const missing = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => !jeKeys.has(r.id));

  console.log(`   سندات بلا قيد: ${missing.length}`);
  let n = 0;
  for (const r of missing) {
    const amount = parseFloat(r.amount || 0);
    if (amount <= 0) continue;

    const cashCode = getCashBankCode(r, coaDocs);
    const cashName = getCashBankName(r);

    let creditCode, creditName;
    if (r.entityType === 'customer') {
      creditCode = getEntityCode(r.targetId, coaDocs, '1-1-2-1');
      creditName = r.accountName || r.targetName || 'عميل';
    } else if (r.entityType === 'supplier') {
      creditCode = getEntityCode(r.targetId, coaDocs, '2-1-1-1');
      creditName = r.accountName || r.targetName || 'مورد';
    } else {
      creditCode = '4-2-5';
      creditName = 'إيرادات متنوعة';
    }

    await addDoc(col('journalEntries'), {
      sourceType: 'receipt', sourceId: r.id,
      date: (r.date || r.createdAt || '').toString().split('T')[0] || new Date().toISOString().split('T')[0],
      description: `سند قبض — ${r.accountName || r.targetName || ''} — ${amount.toFixed(2)} ريال`,
      lines: [
        { accountCode: cashCode,   accountName: cashName,   debit: amount, credit: 0 },
        { accountCode: creditCode, accountName: creditName, debit: 0,      credit: amount },
      ],
      createdAt: new Date().toISOString(), isAutomatic: true, autoFixed: true,
    });
    console.log(`   ✅ ${r.id.slice(0,8)} | ${r.accountName||r.targetName} | ${amount} → ${cashCode}`);
    n++;
  }
  console.log(`   [2] أُنشئ ${n} قيد سند قبض`);
  return n;
}

// ══════════════════════════════════════════════════
// 3. قيود سندات الصرف الناقصة
// ══════════════════════════════════════════════════
async function fixExpenseJEs(allJE, coaDocs) {
  console.log('\n[3] إصلاح قيود سندات الصرف الناقصة...');
  const jeKeys = new Set(allJE.filter(j => j.sourceType === 'expense').map(j => j.sourceId));
  const snap   = await getDocs(col('expenses'));
  const missing = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => !jeKeys.has(e.id));

  console.log(`   سندات صرف بلا قيد: ${missing.length}`);
  let n = 0;
  for (const e of missing) {
    const amount = parseFloat(e.amount || 0);
    if (amount <= 0) continue;

    const cashCode = e.cashBankAccountCode || (e.bankAccountId ? '1-1-1-3' : '1-1-1-2');
    const expCode  = e.accountCode || '5-4';
    const expName  = e.category || e.description?.slice(0, 40) || 'مصروفات عامة';

    await addDoc(col('journalEntries'), {
      sourceType: 'expense', sourceId: e.id,
      date: (e.date || '').split('T')[0] || new Date().toISOString().split('T')[0],
      description: `سند صرف — ${expName}`,
      lines: [
        { accountCode: expCode,   accountName: expName,                              debit: amount, credit: 0 },
        { accountCode: cashCode,  accountName: e.sourceAccountName || 'الصندوق',     debit: 0,      credit: amount },
      ],
      createdAt: new Date().toISOString(), isAutomatic: true, autoFixed: true,
    });
    console.log(`   ✅ ${e.id.slice(0,8)} | ${expName} | ${amount}`);
    n++;
  }
  console.log(`   [3] أُنشئ ${n} قيد صرف`);
  return n;
}

// ══════════════════════════════════════════════════
// 4. إعادة حساب COA كامل
// ══════════════════════════════════════════════════
async function recomputeCOA(coaDocs) {
  console.log('\n[4] إعادة حساب شجرة الحسابات...');
  // تحميل القيود بعد الإضافات
  const jeSnap = await getDocs(col('journalEntries'));
  const allJE  = jeSnap.docs.map(d => d.data());

  // خريطة أرصدة
  const map = {};
  coaDocs.forEach(a => {
    map[a.code] = { ref: a.ref, type: a.type, D: 0, C: 0 };
    // رصيد افتتاحي
    const ob = parseFloat(a.openingBalance || 0);
    if (ob > 0) map[a.code].D += ob;
    if (ob < 0) map[a.code].C += Math.abs(ob);
  });

  allJE.forEach(je => {
    (je.lines || []).forEach(l => {
      if (l.accountCode && map[l.accountCode]) {
        map[l.accountCode].D += parseFloat(l.debit  || 0);
        map[l.accountCode].C += parseFloat(l.credit || 0);
      }
    });
  });

  let updated = 0;
  for (const [code, d] of Object.entries(map)) {
    const isDebit = ['asset', 'expense'].includes(d.type);
    const bal     = isDebit ? d.D - d.C : d.C - d.D;
    await batchUpdate(d.ref, {
      totalDebit:  Math.round(d.D * 100) / 100,
      totalCredit: Math.round(d.C * 100) / 100,
      balance:     Math.round(bal * 100) / 100,
      updatedAt:   new Date().toISOString(),
    });
    updated++;
  }
  await flush();
  console.log(`   [4] حُدِّث ${updated} حساب`);
  return updated;
}

// ══════════════════════════════════════════════════
// 5. مزامنة البنوك والصناديق → COA (بالرصيد الفعلي)
// ══════════════════════════════════════════════════
async function syncBankCash(coaDocs) {
  console.log('\n[5] مزامنة البنوك والصناديق...');

  const banks = (await getDocs(col('bankAccounts'))).docs.map(d => ({ id: d.id, ...d.data() }));
  for (const b of banks) {
    const acc = coaDocs.find(a => a.sourceEntityId === b.id || a.linkedEntityId === b.id);
    if (!acc) { console.log(`   ⚠️ لا COA للبنك: ${b.name}`); continue; }
    const bal = parseFloat(b.balance || 0);
    await batchUpdate(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: bal < 0 ? -bal : 0, updatedAt: new Date().toISOString() });
    console.log(`   ✅ بنك ${b.name}: ${bal} → ${acc.code}`);
  }

  const boxes = (await getDocs(col('cashBoxes'))).docs.map(d => ({ id: d.id, ...d.data() }));
  for (const b of boxes) {
    const acc = coaDocs.find(a => a.sourceEntityId === b.id || a.linkedEntityId === b.id);
    if (!acc) { console.log(`   ⚠️ لا COA للصندوق: ${b.name}`); continue; }
    const bal = parseFloat(b.balance || 0);
    await batchUpdate(acc.ref, { balance: bal, totalDebit: bal >= 0 ? bal : 0, totalCredit: bal < 0 ? -bal : 0, updatedAt: new Date().toISOString() });
    console.log(`   ✅ صندوق ${b.name}: ${bal} → ${acc.code}`);
  }
  await flush();
}

// ══════════════════════════════════════════════════
// 6. حساب الأرباح والخسائر (3-3 و 3-4)
// ══════════════════════════════════════════════════
async function computePnL() {
  console.log('\n[6] حساب الأرباح والخسائر...');
  const snap = await getDocs(col('chartOfAccounts'));
  const all  = snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));

  let rev = 0, exp = 0;
  all.forEach(a => {
    const bal = parseFloat(a.balance || 0);
    if (a.type === 'revenue' && a.code !== '4') rev += bal;
    if (a.type === 'expense' && a.code !== '5') exp += bal;
  });
  const net = rev - exp;

  console.log(`   إيرادات: ${rev.toFixed(2)} | مصروفات: ${exp.toFixed(2)} | صافي: ${net.toFixed(2)}`);

  for (const code of ['3-3', '3-4']) {
    const a = all.find(x => x.code === code);
    if (a) {
      await updateDoc(a.ref, { balance: Math.round(net * 100) / 100, updatedAt: new Date().toISOString() });
      console.log(`   ✅ حساب ${code} = ${net.toFixed(2)}`);
    }
  }
  return net;
}

// ══════════════════════════════════════════════════
// 7. تقليص الشجرة (حذف حسابات صفرية غير مستخدمة)
// ══════════════════════════════════════════════════
async function pruneCOA(coaDocs, allJE) {
  console.log('\n[7] تقليص شجرة الحسابات...');

  const usedCodes = new Set();
  allJE.forEach(je => (je.lines||[]).forEach(l => { if (l.accountCode) usedCodes.add(l.accountCode); }));

  const PROTECTED = new Set([
    '1','2','3','4','5',
    '1-1','1-2','1-3','2-1','2-2','3-1','3-2','4-1','4-2','5-1','5-2','5-3','5-4','5-5','5-6','5-7',
    '1-1-1','1-1-2','1-1-3','1-1-4','1-1-5','2-1-1','2-1-2','2-1-3','2-1-4',
    '4-1-1','4-1-2','4-1-3','5-1-1','5-1-8','3-3','3-4','3-1-4','1-1-2-1','1-1-4-1',
  ]);

  let deleted = 0;
  for (const a of coaDocs) {
    if (PROTECTED.has(a.code)) continue;
    if (usedCodes.has(a.code)) continue;
    if (parseFloat(a.balance || 0) !== 0) continue;
    if (parseFloat(a.totalDebit || 0) !== 0) continue;
    if (a.sourceEntityId) continue; // مرتبط بكيان حقيقي

    const level = (a.code || '').split('-').length;
    if (level < 3) continue; // لا نحذف إلا من مستوى 3 فأعلى

    const hasChild = coaDocs.some(c => c.code !== a.code && (c.code||'').startsWith(a.code + '-'));
    if (hasChild) continue;

    await batchDelete(a.ref);
    console.log(`   🗑 ${a.code} | ${a.name}`);
    deleted++;
  }
  await flush();
  console.log(`   [7] حُذف ${deleted} حساب غير مستخدم`);
  return deleted;
}

// ══════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  IDHAM ERP — الإصلاح الشامل للمحاسبة');
  console.log('═══════════════════════════════════════════');

  // تحميل البيانات الأساسية
  const [jeSnap, coaSnap] = await Promise.all([
    getDocs(col('journalEntries')),
    getDocs(col('chartOfAccounts')),
  ]);
  const allJE   = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const coaDocs = coaSnap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
  console.log(`\n  قيود حالية: ${allJE.length} | حسابات COA: ${coaDocs.length}`);

  const r1 = await fixInvoiceJEs(allJE, coaDocs);
  const r2 = await fixReceiptJEs(allJE, coaDocs);
  const r3 = await fixExpenseJEs(allJE, coaDocs);
  const r4 = await recomputeCOA(coaDocs);
  await syncBankCash(coaDocs);
  const net = await computePnL();
  const r7  = await pruneCOA(coaDocs, allJE);

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ اكتمل الإصلاح الشامل');
  console.log(`  قيود فواتير أُنشئت   : ${r1}`);
  console.log(`  قيود قبض أُنشئت      : ${r2}`);
  console.log(`  قيود صرف أُنشئت      : ${r3}`);
  console.log(`  حسابات COA حُدِّثت   : ${r4}`);
  console.log(`  صافي ربح/خسارة       : ${net?.toFixed(2)} ريال`);
  console.log(`  حسابات محذوفة        : ${r7}`);
  console.log('═══════════════════════════════════════════');
  process.exit(0);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
