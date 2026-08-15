// ============================================================
// IDHAM ERP — Sync Engine v1.0
// محرك المزامنة المركزية — ترابط كامل بين الأقسام
// ============================================================
//
// هذه الوحدة هي المرجع الوحيد لمزامنة البيانات بين الكوليكشنات:
//  - تغيير اسم العميل  → يُحدَّث في الفواتير + السندات + القيود + COA
//  - إعادة حساب رصيد العميل → يُكتب في customers + chartOfAccounts
//  - مزامنة كاملة → يجمع كل ما سبق في استدعاء واحد
//
// ============================================================

import { db, COMPANY_ID } from "../firebase-config.js";
import {
  collection, query, where, getDocs, writeBatch, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const col = (name) => collection(db, `companies/${COMPANY_ID}/${name}`);

// ──────────────────────────────────────────
// 1. مزامنة اسم العميل في كل الكوليكشنات
// ──────────────────────────────────────────
/**
 * syncCustomerNameEverywhere(customerId, newName)
 * بعد تعديل اسم العميل، يُحدِّث:
 *  - salesInvoices.customerName
 *  - receipts.accountName  (حيث targetId = customerId)
 *  - journalEntries: أسطر تشير لحساب العميل (accountId = accountId)
 *  - chartOfAccounts: اسم الحساب المرتبط
 */
export async function syncCustomerNameEverywhere(customerId, newName) {
  if (!customerId || !newName) return;
  console.log(`[SyncEngine] Syncing name for customer ${customerId} → "${newName}"`);

  try {
    let batch = writeBatch(db);
    let ops = 0;

    const flush = async () => {
      if (ops > 0) { await batch.commit(); batch = writeBatch(db); ops = 0; }
    };

    // ── 1. salesInvoices ──
    const invSnap = await getDocs(query(col("salesInvoices"), where("customerId", "==", customerId)));
    for (const d of invSnap.docs) {
      if (d.data().customerName !== newName) {
        batch.update(d.ref, { customerName: newName });
        ops++;
        if (ops >= 400) await flush();
      }
    }

    // ── 2. receipts ──
    const rcptSnap = await getDocs(query(col("receipts"), where("targetId", "==", customerId)));
    for (const d of rcptSnap.docs) {
      const data = d.data();
      if (data.entityType === "customer" && data.accountName !== newName) {
        batch.update(d.ref, { accountName: newName, targetName: newName });
        ops++;
        if (ops >= 400) await flush();
      }
    }

    // ── 3. salesReturns ──
    const retSnap = await getDocs(query(col("salesReturns"), where("customerId", "==", customerId)));
    for (const d of retSnap.docs) {
      if (d.data().customerName !== newName) {
        batch.update(d.ref, { customerName: newName });
        ops++;
        if (ops >= 400) await flush();
      }
    }

    // ── 4. journalEntries — تحديث اسم حساب العميل في أسطر القيود ──
    // نبحث عن حساب العميل في COA أولاً
    const coaSnap = await getDocs(query(col("chartOfAccounts"), where("sourceEntityId", "==", customerId)));
    if (!coaSnap.empty) {
      const coaDoc  = coaSnap.docs[0];
      const coaId   = coaDoc.id;
      const coaCode = coaDoc.data().code;

      // تحديث اسم الحساب في COA
      batch.update(coaDoc.ref, { name: newName });
      ops++;
      if (ops >= 400) await flush();

      // تحديث أسطر القيود التي تشير لهذا الحساب
      const jeSnap = await getDocs(col("journalEntries"));
      for (const jeDoc of jeSnap.docs) {
        const lines = jeDoc.data().lines || [];
        let changed = false;
        const newLines = lines.map(line => {
          if (line.accountCode === coaCode || line.accountId === coaId) {
            if (line.accountName !== newName) { changed = true; return { ...line, accountName: newName }; }
          }
          return line;
        });
        if (changed) {
          batch.update(jeDoc.ref, { lines: newLines });
          ops++;
          if (ops >= 400) await flush();
        }
      }
    }

    await flush();
    console.log(`[SyncEngine] ✅ Customer name synced everywhere for ${customerId}`);
  } catch (err) {
    console.error("[SyncEngine] syncCustomerNameEverywhere error:", err.message);
  }
}

// ──────────────────────────────────────────
// 2. مزامنة رصيد العميل → COA
// ──────────────────────────────────────────
/**
 * syncCustomerBalanceToCoa(customerId)
 * يقرأ customers.balance ويكتبه في chartOfAccounts المرتبط
 * يُستدعى بعد كل recalculateCustomerBalance()
 */
export async function syncCustomerBalanceToCoa(customerId) {
  if (!customerId) return;
  try {
    const custRef  = doc(db, `companies/${COMPANY_ID}/customers`, customerId);
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const custDoc  = await getDoc(custRef);
    if (!custDoc.exists()) return;
    const balance  = parseFloat(custDoc.data().balance) || 0;

    // إيجاد حساب COA المرتبط
    const coaSnap = await getDocs(query(col("chartOfAccounts"), where("sourceEntityId", "==", customerId)));
    if (coaSnap.empty) return;

    const batch = writeBatch(db);
    for (const coaDoc of coaSnap.docs) {
      const data = coaDoc.data();
      const isCredit = data.normalBalance === 'credit' || ['liability', 'equity', 'revenue'].includes(data.type);
      const dr = isCredit ? 0 : balance;
      const cr = isCredit ? balance : 0;
      batch.update(coaDoc.ref, { 
        balance, 
        totalDebit: dr >= 0 ? dr : 0,
        totalCredit: cr >= 0 ? cr : 0,
        rebuiltAt: new Date().toISOString() 
      });
    }
    await batch.commit();
    console.log(`[SyncEngine] ✅ COA balance synced for customer ${customerId}: ${balance}`);
    
    // تشغيل التجميع التلقائي لتحديث الآباء
    await recalculateCoaRollup();
  } catch (err) {
    console.error("[SyncEngine] syncCustomerBalanceToCoa error:", err.message);
  }
}

// ──────────────────────────────────────────
// 3. مزامنة اسم المورد في كل الكوليكشنات
// ──────────────────────────────────────────
export async function syncSupplierNameEverywhere(supplierId, newName) {
  if (!supplierId || !newName) return;
  console.log(`[SyncEngine] Syncing name for supplier ${supplierId} → "${newName}"`);
  try {
    let batch = writeBatch(db);
    let ops = 0;
    const flush = async () => { if (ops > 0) { await batch.commit(); batch = writeBatch(db); ops = 0; } };

    // purchaseInvoices
    const invSnap = await getDocs(query(col("purchaseInvoices"), where("supplierId", "==", supplierId)));
    for (const d of invSnap.docs) {
      if (d.data().supplierName !== newName) {
        batch.update(d.ref, { supplierName: newName }); ops++;
        if (ops >= 400) await flush();
      }
    }

    // expenses (payment vouchers)
    const expSnap = await getDocs(query(col("expenses"), where("targetId", "==", supplierId)));
    for (const d of expSnap.docs) {
      if (d.data().entityType === "supplier" && d.data().accountName !== newName) {
        batch.update(d.ref, { accountName: newName, targetName: newName }); ops++;
        if (ops >= 400) await flush();
      }
    }

    // purchaseReturns
    const retSnap = await getDocs(query(col("purchaseReturns"), where("supplierId", "==", supplierId)));
    for (const d of retSnap.docs) {
      if (d.data().supplierName !== newName) {
        batch.update(d.ref, { supplierName: newName }); ops++;
        if (ops >= 400) await flush();
      }
    }

    // COA
    const coaSnap = await getDocs(query(col("chartOfAccounts"), where("sourceEntityId", "==", supplierId)));
    for (const coaDoc of coaSnap.docs) {
      batch.update(coaDoc.ref, { name: newName }); ops++;
      if (ops >= 400) await flush();
    }

    await flush();
    console.log(`[SyncEngine] ✅ Supplier name synced everywhere for ${supplierId}`);
  } catch (err) {
    console.error("[SyncEngine] syncSupplierNameEverywhere error:", err.message);
  }
}

// ──────────────────────────────────────────
// 4. مزامنة رصيد المورد → COA
// ──────────────────────────────────────────
export async function syncSupplierBalanceToCoa(supplierId) {
  if (!supplierId) return;
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const suppDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/suppliers`, supplierId));
    if (!suppDoc.exists()) return;
    const balance = parseFloat(suppDoc.data().balance) || 0;

    const coaSnap = await getDocs(query(col("chartOfAccounts"), where("sourceEntityId", "==", supplierId)));
    if (coaSnap.empty) return;

    const batch = writeBatch(db);
    for (const coaDoc of coaSnap.docs) {
      const data = coaDoc.data();
      const isCredit = data.normalBalance === 'credit' || ['liability', 'equity', 'revenue'].includes(data.type);
      const dr = isCredit ? 0 : balance;
      const cr = isCredit ? balance : 0;
      batch.update(coaDoc.ref, { 
        balance, 
        totalDebit: dr >= 0 ? dr : 0,
        totalCredit: cr >= 0 ? cr : 0,
        rebuiltAt: new Date().toISOString() 
      });
    }
    await batch.commit();
    console.log(`[SyncEngine] ✅ COA balance synced for supplier ${supplierId}: ${balance}`);
    
    // تشغيل التجميع التلقائي لتحديث الآباء
    await recalculateCoaRollup();
  } catch (err) {
    console.error("[SyncEngine] syncSupplierBalanceToCoa error:", err.message);
  }
}

// ──────────────────────────────────────────
// 5. مزامنة كاملة للعميل (اسم + رصيد + COA)
// ──────────────────────────────────────────
export async function fullCustomerSync(customerId, newName = null) {
  if (!customerId) return;
  try {
    const { recalculateCustomerBalance } = await import("./balance-sync.js");
    const balance = await recalculateCustomerBalance(customerId);

    if (newName) {
      await syncCustomerNameEverywhere(customerId, newName);
    }

    await syncCustomerBalanceToCoa(customerId);
    console.log(`[SyncEngine] ✅ Full sync complete for customer ${customerId}`);
    return balance;
  } catch (err) {
    console.error("[SyncEngine] fullCustomerSync error:", err.message);
  }
}

// ──────────────────────────────────────────
// 6. البحث عن عميل بالاسم القديم وإعادة ربطه
// ──────────────────────────────────────────
/**
 * findAndRelinkByOldName(oldName, newCustomerId)
 * يبحث عن الفواتير والسندات التي تحمل الاسم القديم ويربطها بالعميل الصحيح
 */
export async function findAndRelinkByOldName(oldName, newCustomerId) {
  if (!oldName || !newCustomerId) return { invoices: 0, receipts: 0 };
  console.log(`[SyncEngine] Searching for old name "${oldName}" → relinking to ${newCustomerId}`);

  const { getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
  const custDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, newCustomerId));
  const newName = custDoc.exists() ? custDoc.data().name : oldName;

  let batch = writeBatch(db);
  let ops = 0, invCount = 0, rcptCount = 0;
  const flush = async () => { if (ops > 0) { await batch.commit(); batch = writeBatch(db); ops = 0; } };

  // فواتير بالاسم القديم بدون customerId أو بـ customerId مختلف
  const invSnap = await getDocs(col("salesInvoices"));
  for (const d of invSnap.docs) {
    const data = d.data();
    const name = (data.customerName || "").toLowerCase().trim();
    if (name.includes(oldName.toLowerCase().trim()) && data.customerId !== newCustomerId) {
      batch.update(d.ref, { customerName: newName, customerId: newCustomerId });
      ops++; invCount++;
      if (ops >= 400) await flush();
    }
  }

  // سندات قبض بالاسم القديم
  const rcptSnap = await getDocs(col("receipts"));
  for (const d of rcptSnap.docs) {
    const data = d.data();
    const name = (data.accountName || data.targetName || "").toLowerCase().trim();
    if (name.includes(oldName.toLowerCase().trim()) && data.targetId !== newCustomerId) {
      batch.update(d.ref, { accountName: newName, targetName: newName, targetId: newCustomerId });
      ops++; rcptCount++;
      if (ops >= 400) await flush();
    }
  }

  await flush();
  console.log(`[SyncEngine] Relinked: ${invCount} invoices, ${rcptCount} receipts`);
  return { invoices: invCount, receipts: rcptCount };
}

// ──────────────────────────────────────────
// 7. تحديث COA تلقائياً بعد قيد (incremental)
// ──────────────────────────────────────────
export async function updateCoaAfterJE(lines, reverse = false) {
  if (!lines || lines.length === 0) return;
  try {
    const { getDoc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    // بناء خريطة كل الحسابات مرة واحدة
    const coaSnap = await getDocs(col("chartOfAccounts"));
    const coaByCode = {};
    coaSnap.docs.forEach(d => { coaByCode[d.data().code] = { id: d.id, ref: d.ref, type: d.data().type }; });

    const batch = writeBatch(db);
    let ops = 0;

    const sign = reverse ? -1 : 1;

    for (const line of lines) {
      if (!line.accountCode) continue;
      const acc = coaByCode[line.accountCode];
      if (!acc) continue;

      const dr = (parseFloat(line.debit)  || 0) * sign;
      const cr = (parseFloat(line.credit) || 0) * sign;
      const isDebitNormal = ["asset", "expense"].includes(acc.type);
      const balanceDelta  = isDebitNormal ? (dr - cr) : (cr - dr);

      batch.update(acc.ref, {
        totalDebit:  increment(dr),
        totalCredit: increment(cr),
        balance:     increment(balanceDelta),
        updatedAt:   new Date().toISOString(),
      });
      ops++;
    }

    if (ops > 0) await batch.commit();
    console.log(`[SyncEngine] ✅ COA updated after JE (${ops} accounts, reverse=${reverse})`);
  } catch (err) {
    console.error("[SyncEngine] updateCoaAfterJE error:", err.message);
  }
}

// ──────────────────────────────────────────
// 8. تجميع أرصدة الحسابات الأب تلقائياً (COA Rollup)
// ──────────────────────────────────────────
export async function recalculateCoaRollup() {
  try {
    // 1. قراءة جميع القيود المحاسبية المرحّلة
    const jeSnap = await getDocs(col("journalEntries"));
    const debitByCode = {};
    const creditByCode = {};

    jeSnap.docs.forEach(doc => {
      const je = doc.data();
      if (je.status && je.status !== "posted") return;
      const lines = je.lines || [];
      for (const line of lines) {
        const code = line.accountCode;
        if (!code) continue;
        const dr = parseFloat(line.debit || 0);
        const cr = parseFloat(line.credit || 0);
        debitByCode[code] = (debitByCode[code] || 0) + dr;
        creditByCode[code] = (creditByCode[code] || 0) + cr;
      }
    });

    // 2. قراءة شجرة الحسابات
    const coaSnap = await getDocs(col("chartOfAccounts"));
    const coaMap = {};
    
    // تحديد حسابات الآباء ديناميكياً
    const parentCodes = new Set();
    coaSnap.docs.forEach(d => {
      const pc = d.data().parentCode;
      if (pc) parentCodes.add(pc);
    });

    coaSnap.docs.forEach(d => {
      const data = d.data();
      const code = data.code;
      if (!code) return;
      
      const isParent = parentCodes.has(code);
      coaMap[code] = {
        ref: d.ref,
        id: d.id,
        code,
        name: data.name,
        type: data.type,
        parentCode: data.parentCode || null,
        isParent: isParent,
        normalBalance: data.normalBalance || (["asset", "expense"].includes(data.type) ? "debit" : "credit"),
        // يأخذ كل حساب حركاته المباشرة من القيود (حتى لو كان أباً ولديه أبناء غير مستخدمين مثل 4-1-1)
        totalDebit: debitByCode[code] || 0,
        totalCredit: creditByCode[code] || 0,
        balance: 0,
      };
    });

    // 3. التجميع من المستويات الأعمق للأبناء وصولاً للأعلى
    const sortedCodes = Object.keys(coaMap).sort((a, b) => {
      return (b.match(/-/g) || []).length - (a.match(/-/g) || []).length;
    });

    const r2 = n => Math.round((n || 0) * 100) / 100;

    for (const code of sortedCodes) {
      const acc = coaMap[code];
      const pCode = acc.parentCode;
      if (pCode && coaMap[pCode]) {
        coaMap[pCode].totalDebit  = r2(coaMap[pCode].totalDebit  + acc.totalDebit);
        coaMap[pCode].totalCredit = r2(coaMap[pCode].totalCredit + acc.totalCredit);
      }
    }

    // 4. احتساب الرصيد النهائي بناءً على طبيعة الحساب والمدين والدائن المجمعين
    for (const acc of Object.values(coaMap)) {
      const delta = acc.totalDebit - acc.totalCredit;
      const isCredit = acc.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(acc.type);
      acc.balance = r2(isCredit ? -delta : delta);
    }

    // 5. كتابة التحديثات في دفعات
    let batch = writeBatch(db);
    let ops = 0;
    for (const acc of Object.values(coaMap)) {
      batch.update(acc.ref, {
        balance: acc.balance,
        totalDebit: acc.totalDebit,
        totalCredit: acc.totalCredit,
        rebuiltAt: new Date().toISOString()
      });
      ops++;
      if (ops >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    }
    if (ops > 0) {
      await batch.commit();
    }
    console.log(`[SyncEngine] ✅ COA Rollup complete (${Object.keys(coaMap).length} accounts updated)`);
  } catch (err) {
    console.error("[SyncEngine] recalculateCoaRollup error:", err.message);
  }
}
