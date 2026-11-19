import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);
const COMPANY_ID = 'idham-main';

async function fixTrialBalance() {
  console.log('=== FIXING TRIAL BALANCE IMBALANCE ===');

  // 1. Fix the 1 SAR difference in JE U59rTzQB65JaIfWOINm4 (JE-2026-20260724)
  const jeRef = doc(db, `companies/${COMPANY_ID}/journalEntries`, 'U59rTzQB65JaIfWOINm4');
  const jeSnap = await getDoc(jeRef);
  if (jeSnap.exists()) {
    const data = jeSnap.data();
    console.log('[1] Fixing JE U59rTzQB65JaIfWOINm4: current totalDebit =', data.totalDebit, 'totalCredit =', data.totalCredit);
    const lines = (data.lines || []).map(l => {
      if (l.accountCode === '2-1-5-1' && l.credit === 1474) {
        return { ...l, credit: 1475 };
      }
      return l;
    });
    await updateDoc(jeRef, {
      lines: lines,
      totalCredit: 1475,
      totalDebit: 1475,
      updatedAt: serverTimestamp()
    });
    console.log('  -> JE U59rTzQB65JaIfWOINm4 balanced to 1475.00 SAR.');
  }

  // 2. Fix the micro-decimal rounding in the 8 historical JEs
  const microJEs = [
    { id: '0Awzit1cHBn9pLpA1joG' },
    { id: 'Eb6QJpJkGHYI7VcAiqJV' },
    { id: 'HGnET6H5RGue0hnjDcfo' },
    { id: 'XIyG65SB7bDzXIKDQ5qr' },
    { id: 'XqMNbywwA1CvB3nEY0cD' },
    { id: 'cUYAdxvKWPP58UQUhvBN' },
    { id: 'gkmmNoicUaYqX7uueaV5' },
    { id: 'hSh1IaFrezaI6anlMwRY' }
  ];

  for (const item of microJEs) {
    const ref = doc(db, `companies/${COMPANY_ID}/journalEntries`, item.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;
    const d = snap.data();
    let sumDr = 0, sumCr = 0;
    const newLines = (d.lines || []).map(l => {
      const dr = Math.round((l.debit || 0) * 100) / 100;
      const cr = Math.round((l.credit || 0) * 100) / 100;
      sumDr += dr;
      sumCr += cr;
      return { ...l, debit: dr, credit: cr };
    });
    sumDr = Math.round(sumDr * 100) / 100;
    sumCr = Math.round(sumCr * 100) / 100;

    // If there is still a 0.01 discrepancy between rounded sumDr and sumCr, balance the last line
    if (Math.abs(sumDr - sumCr) > 0.001 && newLines.length >= 2) {
      const diff = Math.round((sumDr - sumCr) * 100) / 100;
      // adjust line with credit
      const crLine = newLines.find(l => l.credit > 0);
      if (crLine) {
        crLine.credit = Math.round((crLine.credit + diff) * 100) / 100;
        sumCr = sumDr;
      }
    }

    await updateDoc(ref, {
      lines: newLines,
      totalDebit: sumDr,
      totalCredit: sumDr,
      updatedAt: serverTimestamp()
    });
    console.log(`[2] Balanced historical JE ${item.id} (${d.entryNumber || d.number}) to ${sumDr}`);
  }

  // 3. Verify Trial Balance for 2026-10-01 to 2026-10-18
  console.log('\n[3] Verifying Trial Balance calculation...');
  const jesSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
  const jes = jesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const from = '2026-10-01';
  const to = '2026-10-18';

  const _netByCode = {};
  for (const entry of jes) {
    const d = entry.date || '';
    for (const line of (entry.lines || [])) {
      const code = line.accountCode;
      if (!code) continue;
      if (!_netByCode[code]) _netByCode[code] = { open: 0, tD: 0, tC: 0 };
      if (d < from) {
        _netByCode[code].open += (line.debit || 0) - (line.credit || 0);
      } else if (d >= from && d <= to) {
        _netByCode[code].tD += line.debit  || 0;
        _netByCode[code].tC += line.credit || 0;
      }
    }
  }

  let totalOpenDr = 0, totalOpenCr = 0;
  let totalTransDr = 0, totalTransCr = 0;
  let totalCloseDr = 0, totalCloseCr = 0;

  for (const code in _netByCode) {
    const { open, tD, tC } = _netByCode[code];
    const close = open + (tD - tC);
    if (open  > 0) totalOpenDr  += open;  else if (open  < 0) totalOpenCr  += (-open);
    if (close > 0) totalCloseDr += close; else if (close < 0) totalCloseCr += (-close);
    totalTransDr += tD;
    totalTransCr += tC;
  }

  const diffClose = Math.abs(totalCloseDr - totalCloseCr);
  const diffTrans = Math.abs(totalTransDr - totalTransCr);
  const diffOpen = Math.abs(totalOpenDr - totalOpenCr);

  console.log(`Open Balance Diff:   ${diffOpen.toFixed(4)} SAR`);
  console.log(`Trans Balance Diff:  ${diffTrans.toFixed(4)} SAR`);
  console.log(`Close Balance Diff:  ${diffClose.toFixed(4)} SAR`);
  
  if (diffClose < 0.01) {
    console.log('✅ TRIAL BALANCE IS NOW 100% PERFECTLY BALANCED! (0.00 SAR difference)');
  } else {
    console.warn('⚠️ Imbalance remaining:', diffClose);
  }
}

fixTrialBalance().catch(console.error);
