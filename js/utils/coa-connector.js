import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, collection, serverTimestamp } from "./db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// Default mapping configuration
const DEFAULT_MAPPING = {
  customers:  { enabled: true, parentCode: "1-1-2-1-1", numbering: "seq" },  // عملاء تجاريون مباشرون
  suppliers:  { enabled: true, parentCode: "2-1-1-1-1", numbering: "seq" },
  banks:      { enabled: true, parentCode: "1-1-1-3",   numbering: "seq" },
  cashBoxes:  { enabled: true, parentCode: "1-1-1-2",   numbering: "seq" },
  warehouses: { enabled: true, parentCode: "1-1-4",     numbering: "seq" },
  salesReps:  { enabled: true, parentCode: "1-1-2-1-2", numbering: "seq" },  // حسابات تحليلية للمناديب
  employees:  { enabled: true, parentCode: "2-1-5-2",   numbering: "seq" },  // رواتب الموظفين المستحقة
};

/**
 * Resolve the COA parent code for a customer:
 *  - If customer has a repId → find rep's account under 1-1-2-1-2 and use it as parent
 *  - Otherwise → use 1-1-2-1-1 (commercial/direct customers)
 */
async function resolveCustomerParentCode(repId, colRef) {
  if (!repId) return DEFAULT_MAPPING.customers.parentCode;  // 1-1-2-1-1

  // Search for the rep's COA account under 1-1-2-1-2
  const repAccQ = query(colRef,
    where("parentCode",     "==", "1-1-2-1-2"),
    where("sourceEntityId", "==", repId)
  );
  const repAccSnap = await getDocs(repAccQ);
  if (!repAccSnap.empty) {
    return repAccSnap.docs[0].data().code;  // e.g. "1-1-2-1-2-1"
  }

  // Also try by linkedRepId
  const repAccQ2 = query(colRef,
    where("parentCode",  "==", "1-1-2-1-2"),
    where("linkedRepId", "==", repId)
  );
  const repAccSnap2 = await getDocs(repAccQ2);
  if (!repAccSnap2.empty) {
    return repAccSnap2.docs[0].data().code;
  }

  // Rep account not found yet — fallback to commercial
  console.warn(`[COA-Connector] لم يُعثر على حساب المندوب ${repId} — سيُنشأ العميل تحت 1-1-2-1-1`);
  return DEFAULT_MAPPING.customers.parentCode;
}

/**
 * Retrieve the current COA mapping settings from Firestore settings/coa_mapping.
 */
export async function getCoaMapping() {
  try {
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "coa_mapping"));
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.error("Failed to load coa_mapping settings:", e);
  }
  // If not found, write the default mapping first so it exists
  try {
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "coa_mapping"), DEFAULT_MAPPING);
  } catch (e) {
    console.error("Failed to write default coa_mapping:", e);
  }
  return DEFAULT_MAPPING;
}

/**
 * Save updated COA mapping settings to Firestore.
 */
export async function saveCoaMapping(mapping) {
  await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "coa_mapping"), mapping);
}

/**
 * Generates a sequential sub-account code under a parent code in the COA.
 * Splits trailing digits by hyphen and increments the max sequence.
 */
export async function generateCoaSubAccountCode(parentCode) {
  const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
  const q = query(colRef, where("parentCode", "==", parentCode));
  const snap = await getDocs(q);
  const accounts = snap.docs.map(d => d.data());

  if (accounts.length === 0) {
    return `${parentCode}-01`;
  }

  let maxSeq = 0;
  accounts.forEach(acc => {
    const code = acc.code || "";
    const parts = code.split("-");
    const lastPart = parts[parts.length - 1];
    const seq = parseInt(lastPart, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  });

  const nextSeq = maxSeq + 1;
  const seqString = nextSeq.toString().padStart(2, "0");
  return `${parentCode}-${seqString}`;
}

/**
 * Synchronize a newly created entity to the Chart of Accounts under its mapped parent.
 */
export async function syncEntityToCoa(moduleKey, entityId, entityName, options = {}) {
  const mapping = await getCoaMapping();
  const config = mapping[moduleKey];
  if (!config || !config.enabled) return null;

  // Toggle option to skip (e.g. cash customer)
  if (options.skipCoa) return null;

  const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);

  let parentCode = config.parentCode;

  if (moduleKey === "warehouses") {
    const isVehicle = options.type === "Vehicle" || /سيارة|مندوب|vehicle|car|rep/i.test(entityName);
    parentCode = isVehicle ? "1-1-4-1-02" : "1-1-4-1";
  }

  // ── تقسيم ذمم العملاء: تجاريون مباشرون vs. عملاء مناديب ──
  if (moduleKey === "customers") {
    parentCode = await resolveCustomerParentCode(options.repId || null, colRef);
  }

  if (!parentCode) return null;

  // Ensure parent account exists
  const pq = query(colRef, where("code", "==", parentCode));
  const psnap = await getDocs(pq);

  let parentAcc;
  if (psnap.empty) {
    console.warn(`[COA-Connector] الحساب الأب (${parentCode}) غير موجود — جارٍ إنشاؤه تلقائيًا...`);
    parentAcc = await ensureParentAccountExists(parentCode, colRef);
    if (!parentAcc) throw new Error(`فشل إنشاء الحساب الأب (${parentCode}). يُرجى تشغيل "تصحيح الهيكل" من شجرة الحسابات.`);
  } else {
    parentAcc = psnap.docs[0].data();
  }

  // إذا كان الحساب الأب nodeType=detail يجب تحويله لـ header ليقبل فروعاً
  // (يحدث عند أول عميل يُضاف تحت حساب مندوب)
  if (parentAcc.nodeType === "detail") {
    const parentDocRef = psnap.docs[0].ref;
    await updateDoc(parentDocRef, { nodeType: "header" });
    parentAcc = { ...parentAcc, nodeType: "header" };
    console.log(`[COA-Connector] تم تحويل حساب ${parentCode} من detail إلى header`);
  }

  // Concurrency-safe: generate the next code
  const code = await generateCoaSubAccountCode(parentCode);

  const accRef = doc(colRef);
  const accData = {
    code,
    name: entityName,
    type: parentAcc.type,
    parentCode,
    nodeType: "detail",
    level: (parentAcc.level || 4) + 1,
    balance: 0,
    totalDebit: 0,
    totalCredit: 0,
    openingBalance: 0,
    isActive: true,
    companyId: COMPANY_ID,
    normalBalance: parentAcc.normalBalance || (["asset", "expense"].includes(parentAcc.type) ? "debit" : "credit"),
    sourceModule: moduleKey,
    sourceEntityId: entityId,
    linkedRepId: options.repId || null,   // ربط العميل بمندوبه
    createdAt: new Date().toISOString()
  };

  await setDoc(accRef, accData);

  // Write audit trail log
  try {
    const auditRef = doc(collection(db, `companies/${COMPANY_ID}/auditTrails`));
    await setDoc(auditRef, {
      action: "coa_account_auto_created",
      details: `تم إنشاء حساب ${code} - ${entityName} تلقائياً (${moduleKey}${options.repId ? ` تحت مندوب ${options.repId}` : ""})`,
      entityType: "chartOfAccounts",
      entityId: accRef.id,
      module: moduleKey,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }

  return { accountId: accRef.id, accountCode: code };
}

/**
 * Synchronize updates (like entity name changes) to the COA.
 */
export async function updateEntityInCoa(accountId, newName) {
  if (!accountId) return;
  const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
  const accRef = doc(colRef, accountId);
  const snap = await getDoc(accRef);
  if (snap.exists()) {
    await updateDoc(accRef, { name: newName, updatedAt: serverTimestamp() });
  }
}

/**
 * Perform history checks before deleting an entity from COA.
 * If transactions exist: marks it inactive in both entity and COA.
 * If no transactions: deletes the account from COA.
 */
export async function deleteEntityInCoa(moduleName, entityId, accountId) {
  if (!accountId) return { action: "deleted" };

  const accRef = doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, accountId);
  const snap = await getDoc(accRef);
  if (!snap.exists()) return { action: "deleted" };

  const acc = snap.data();
  const hasHistory = acc.totalDebit !== 0 || acc.totalCredit !== 0 || acc.balance !== 0 || (acc.openingBalance || 0) !== 0;

  if (hasHistory) {
    // Deactivate in COA
    await updateDoc(accRef, { isActive: false, updatedAt: serverTimestamp() });
    
    // Also deactivate in parent module
    const entityRef = doc(db, `companies/${COMPANY_ID}/${moduleName}`, entityId);
    await updateDoc(entityRef, { isActive: false, updatedAt: serverTimestamp() });

    // Write audit log
    try {
      const auditRef = doc(collection(db, `companies/${COMPANY_ID}/auditTrails`));
      await setDoc(auditRef, {
        action: "coa_account_auto_archived",
        details: `تم أرشفة الحساب ${acc.code} لوجود حركات مالية تاريخية`,
        entityType: "chartOfAccounts",
        entityId: accountId,
        module: moduleName,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Audit log failed:", e);
    }

    return { action: "archived", hasHistory: true };
  } else {
    // Delete account from COA
    await deleteDoc(accRef);
    return { action: "deleted", hasHistory: false };
  }
}

// ──────────────────────────────────────────────────────────────────
// Self-Heal: إنشاء حساب أب مفقود تلقائياً من القائمة الافتراضية
// ──────────────────────────────────────────────────────────────────
const PARENT_DEFAULTS = {
  "1-1-1-1":   { name:"صناديق النقد",                type:"asset",     parentCode:"1-1-1", nodeType:"header", level:3, normalBalance:"debit"  },
  "1-1-1-2":   { name:"صناديق المناديب",             type:"asset",     parentCode:"1-1-1", nodeType:"header", level:3, normalBalance:"debit"  },
  "1-1-1-3":   { name:"البنوك والحسابات البنكية",     type:"asset",     parentCode:"1-1-1", nodeType:"header", level:3, normalBalance:"debit"  },
  "1-1-2-1-1": { name:"ذمم عملاء تجزئة — محلية",    type:"asset",     parentCode:"1-1-2-1",nodeType:"header", level:4, normalBalance:"debit"  },
  "1-1-2-2-1": { name:"ذمم عملاء جملة — شركات",     type:"asset",     parentCode:"1-1-2-2",nodeType:"header", level:4, normalBalance:"debit"  },
  "2-1-1-1-1": { name:"ذمم موردون غذائية — محلي",   type:"liability", parentCode:"2-1-1-1",nodeType:"header", level:4, normalBalance:"credit" },
  "1-1-4-1":   { name:"مخزون المستودعات وسيارات التوزيع", type:"asset",     parentCode:"1-1-4", nodeType:"header", level:3, normalBalance:"debit"  },
  "1-1-4-1-02":{ name:"مخزون سيارات التوزيع",             type:"asset",     parentCode:"1-1-4-1", nodeType:"header", level:4, normalBalance:"debit"  },
  "2-1-5-2":   { name:"رواتب ومستحقات الموظفين المستحقة", type:"liability", parentCode:"2-1-5", nodeType:"header", level:4, normalBalance:"credit" },
  "2-1-5":     { name:"الأرصدة الدائنة الأخرى والمستحقات", type:"liability", parentCode:"2-1",   nodeType:"header", level:3, normalBalance:"credit" },
  "2-1":       { name:"الالتزامات المتداولة",         type:"liability", parentCode:"2",     nodeType:"header", level:2, normalBalance:"credit" },
  // آباء الآباء
  "1-1-1":     { name:"النقد وشبه النقد",            type:"asset",     parentCode:"1-1",   nodeType:"header", level:2, normalBalance:"debit"  },
  "1-1-2-1":   { name:"ذمم عملاء تجزئة",            type:"asset",     parentCode:"1-1-2", nodeType:"header", level:3, normalBalance:"debit"  },
  "1-1-2-2":   { name:"ذمم عملاء جملة",             type:"asset",     parentCode:"1-1-2", nodeType:"header", level:3, normalBalance:"debit"  },
  "2-1-1-1":   { name:"ذمم موردون محليون",           type:"liability", parentCode:"2-1-1", nodeType:"header", level:3, normalBalance:"credit" },
  "1-1-4":     { name:"المخزون",                    type:"asset",     parentCode:"1-1",   nodeType:"header", level:2, normalBalance:"debit"  },
};

async function ensureParentAccountExists(parentCode, colRef) {
  // تحقق مرة أخرى بعد المحاولة الأولى
  const recheck = await getDocs(query(colRef, where("code", "==", parentCode)));
  if (!recheck.empty) return recheck.docs[0].data();

  const defaults = PARENT_DEFAULTS[parentCode];
  if (!defaults) {
    console.error(`[COA-Connector] لا يوجد تعريف افتراضي للحساب الأب: ${parentCode}`);
    return null;
  }

  // إنشاء الحساب الأب أولاً (تأكد من وجود أبيه)
  if (defaults.parentCode) {
    const grandParentQ = await getDocs(query(colRef, where("code", "==", defaults.parentCode)));
    if (grandParentQ.empty) {
      await ensureParentAccountExists(defaults.parentCode, colRef);
    }
  }

  const newRef = doc(colRef);
  const accData = {
    ...defaults,
    code:          parentCode,
    balance:       0,
    totalDebit:    0,
    totalCredit:   0,
    openingBalance:0,
    isActive:      true,
    companyId:     COMPANY_ID,
    createdAt:     new Date().toISOString(),
    autoCreated:   true,
  };
  await setDoc(newRef, accData);
  console.log(`[COA-Connector] تم إنشاء الحساب الأب تلقائياً: ${parentCode} — ${defaults.name}`);
  return accData;
}

// ──────────────────────────────────────────────────────────────────
// Backfill: ربط الحسابات القديمة بشجرة الحسابات (one-time migration)
// ──────────────────────────────────────────────────────────────────
export async function backfillCOAFromEntities() {
  const modules = [
    { key: "banks",     collection: "bankAccounts",  nameField: "name" },
    { key: "customers", collection: "customers",     nameField: "name" },
    { key: "suppliers", collection: "suppliers",     nameField: "name" },
    { key: "cashBoxes", collection: "cashBoxes",     nameField: "name" },
    { key: "warehouses",collection: "warehouses",    nameField: "name" },
    { key: "employees", collection: "employees",     nameField: "name" },
  ];

  const results = { synced: [], skipped: [], errors: [] };

  for (const mod of modules) {
    try {
      const colRef = collection(db, `companies/${COMPANY_ID}/${mod.collection}`);
      const snap   = await getDocs(colRef);

      for (const d of snap.docs) {
        const data = d.data();
        // تخطّ الحسابات المرتبطة بالفعل
        if (data.accountId) {
          results.skipped.push(`${mod.key}: ${data[mod.nameField]} (مرتبط بالفعل)`);
          continue;
        }
        // تخطّ الحسابات غير النشطة
        if (data.isActive === false) {
          results.skipped.push(`${mod.key}: ${data[mod.nameField]} (غير نشط)`);
          continue;
        }

        try {
          // ── العملاء: تمرير repId لتصنيفهم تحت مندوبهم أو تحت العملاء التجاريين ──
          const opts = mod.key === "customers" ? { repId: data.repId || null } : {};
          const coaData = await syncEntityToCoa(
            mod.key,
            d.id,
            data[mod.nameField] || `${mod.key}-${d.id.slice(0,6)}`,
            opts
          );
          if (coaData) {
            // ربط معرّف COA بالكيان
            const entityRef = doc(db, `companies/${COMPANY_ID}/${mod.collection}`, d.id);
            await updateDoc(entityRef, coaData);
            results.synced.push(`${mod.key}: ${data[mod.nameField]} → ${coaData.accountCode}`);
          }
        } catch (e) {
          results.errors.push(`${mod.key}: ${data[mod.nameField]} — ${e.message}`);
        }
      }
    } catch (e) {
      results.errors.push(`خطأ في قسم ${mod.key}: ${e.message}`);
    }
  }

  return results;
}

/**
 * migrateCustomerCoa — ترحيل العملاء الحاليين لهيكل الفصل الجديد
 * يُشغَّل مرة واحدة فقط من أدوات الإدارة.
 * يبحث عن كل عميل → ينشئ حساباً تحليلياً تحت مندوبه (أو تحت 1-1-2-1-1)
 * → يربطه بـ accountId + accountCode في مستند العميل
 * → يُعيِّن رصيده الحالي openingBalance
 */
export async function migrateCustomerCoa() {
  const colRef  = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
  const custCol = collection(db, `companies/${COMPANY_ID}/customers`);
  const snap    = await getDocs(custCol);

  const results = { migrated: [], skipped: [], errors: [] };

  for (const d of snap.docs) {
    const cust = d.data();
    const custId = d.id;

    if (cust.accountId) {
      results.skipped.push(`${cust.name} — مرتبط بالفعل بـ ${cust.accountCode}`);
      continue;
    }

    try {
      const parentCode = await resolveCustomerParentCode(cust.repId || null, colRef);

      // Ensure parent is header
      const pQ = query(colRef, where("code", "==", parentCode));
      const pSnap = await getDocs(pQ);
      if (!pSnap.empty && pSnap.docs[0].data().nodeType === "detail") {
        await updateDoc(pSnap.docs[0].ref, { nodeType: "header" });
      }

      const code    = await generateCoaSubAccountCode(parentCode);
      const pData   = pSnap.empty ? { type: "asset", level: 5, normalBalance: "debit" } : pSnap.docs[0].data();
      const accRef  = doc(colRef);
      const balance = parseFloat(cust.balance || 0);

      await setDoc(accRef, {
        code,
        name:           cust.name,
        type:           pData.type || "asset",
        parentCode,
        nodeType:       "detail",
        level:          (pData.level || 5) + 1,
        balance,
        totalDebit:     balance > 0 ? balance : 0,
        totalCredit:    balance < 0 ? Math.abs(balance) : 0,
        openingBalance: balance,
        isActive:       true,
        companyId:      COMPANY_ID,
        normalBalance:  "debit",
        sourceModule:   "customers",
        sourceEntityId: custId,
        linkedRepId:    cust.repId || null,
        createdAt:      new Date().toISOString(),
        migratedAt:     new Date().toISOString(),
      });

      // ربط الحساب بمستند العميل
      await updateDoc(doc(custCol, custId), {
        accountId:   accRef.id,
        accountCode: code,
      });

      results.migrated.push(`${cust.name} → ${code} (رصيد: ${balance})`);
    } catch (e) {
      results.errors.push(`${cust.name} — ${e.message}`);
    }
  }

  console.log("[COA Migration] نتائج ترحيل ذمم العملاء:", results);
  return results;
}

// ============================================================
// syncRepToCoa — إنشاء حساب تحليلي تلقائي لكل مندوب
// يُستدعى عند إضافة مندوب جديد أو عند التحديث من sales-reps.js
// ينشئ حساباً تحت 1-1-2-1-2 (ذمم عملاء تجزئة — مناديب)
// ============================================================
export async function syncRepToCoa(repId, repName) {
  const colRef  = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
  const repRef  = doc(db, `companies/${COMPANY_ID}/salesReps`, repId);
  const PARENT  = "1-1-2-1-2";

  // هل يوجد حساب مرتبط بهذا المندوب مسبقاً?
  const existQ  = query(colRef,
    where("parentCode",    "==", PARENT),
    where("sourceEntityId", "==", repId)
  );
  const existSnap = await getDocs(existQ);
  if (!existSnap.empty) {
    // الحساب موجود مسبقاً — أعد ربطه بالمندوب فقط
    const accDoc  = existSnap.docs[0];
    await updateDoc(repRef, {
      accountId:   accDoc.id,
      accountCode: accDoc.data().code,
    });
    return { accountId: accDoc.id, accountCode: accDoc.data().code };
  }

  // إنشاء حساب جديد للمندوب
  // ⚠️ nodeType = "header" لأن عملاء المندوب سيُنشأون تحته كحسابات فرعية
  const code   = await generateCoaSubAccountCode(PARENT);
  const accDoc = doc(colRef);
  await setDoc(accDoc, {
    code,
    name:           `عملاء ${repName}`,
    type:           "asset",
    parentCode:     PARENT,
    nodeType:       "header",   // ← header وليس detail حتى يقبل فروع العملاء
    level:          5,
    balance:        0,
    totalDebit:     0,
    totalCredit:    0,
    openingBalance: 0,
    isActive:       true,
    companyId:      COMPANY_ID,
    normalBalance:  "debit",
    sourceEntityId: repId,
    linkedRepId:    repId,
    createdAt:      serverTimestamp(),
  });

  // حفظ معرّف COA في مستند المندوب
  await updateDoc(repRef, {
    accountId:   accDoc.id,
    accountCode: code,
  });

  console.log(`[COA-Connector] تم إنشاء حساب تحليلي (header) للمندوب: ${repName} → ${code}`);
  return { accountId: accDoc.id, accountCode: code };
}
