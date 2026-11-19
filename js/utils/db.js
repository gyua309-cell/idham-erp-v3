// ============================================================
// IDHAM ERP — Firestore Database Utilities
// Atomic transactions, CRUD helpers, stock & accounting ops
// ============================================================

import {
  getFirestore, collection, doc, getDoc, getDocs, getDocsFromServer,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  runTransaction, serverTimestamp, writeBatch,
  increment, Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { db, COMPANY_ID } from "../firebase-config.js";

// Re-export Firestore primitives for use in modules
export { db, COMPANY_ID, query, where, orderBy, limit, startAfter, getDocs, getDocsFromServer, getDoc,
         serverTimestamp, doc, Timestamp, increment, setDoc, collection, runTransaction, updateDoc, deleteDoc, writeBatch };

// ──────────────────────────────────────────
// Collection references
// ──────────────────────────────────────────
const baseCOLS = {
  products:            () => collection(db, `companies/${COMPANY_ID}/products`),
  categories:          () => collection(db, `companies/${COMPANY_ID}/categories`),
  units:               () => collection(db, `companies/${COMPANY_ID}/units`),
  priceLists:          () => collection(db, `companies/${COMPANY_ID}/priceLists`),
  warehouses:          () => collection(db, `companies/${COMPANY_ID}/warehouses`),
  stockByWarehouse:    () => collection(db, `companies/${COMPANY_ID}/stockByWarehouse`),
  stockTransactions:   () => collection(db, `companies/${COMPANY_ID}/stockTransactions`),
  stockTransfers:      () => collection(db, `companies/${COMPANY_ID}/stockTransfers`),
  customers:           () => collection(db, `companies/${COMPANY_ID}/customers`),
  suppliers:           () => collection(db, `companies/${COMPANY_ID}/suppliers`),
  salesReps:           () => collection(db, `companies/${COMPANY_ID}/salesReps`),
  salesInvoices:       () => collection(db, `companies/${COMPANY_ID}/salesInvoices`),
  purchaseInvoices:    () => collection(db, `companies/${COMPANY_ID}/purchaseInvoices`),
  salesReturns:        () => collection(db, `companies/${COMPANY_ID}/salesReturns`),
  purchaseReturns:     () => collection(db, `companies/${COMPANY_ID}/purchaseReturns`),
  chartOfAccounts:     () => collection(db, `companies/${COMPANY_ID}/chartOfAccounts`),
  journalEntries:      () => collection(db, `companies/${COMPANY_ID}/journalEntries`),
  receipts:            () => collection(db, `companies/${COMPANY_ID}/receipts`),
  collections:         () => collection(db, `companies/${COMPANY_ID}/collections`),
  cashBoxes:           () => collection(db, `companies/${COMPANY_ID}/cashBoxes`),
  cashTransactions:    () => collection(db, `companies/${COMPANY_ID}/cashTransactions`),
  bankAccounts:        () => collection(db, `companies/${COMPANY_ID}/bankAccounts`),
  bankTransactions:    () => collection(db, `companies/${COMPANY_ID}/bankTransactions`),
  expenses:            () => collection(db, `companies/${COMPANY_ID}/expenses`),
  employees:           () => collection(db, `companies/${COMPANY_ID}/employees`),
  quotations:          () => collection(db, `companies/${COMPANY_ID}/quotations`),
  cheques:             () => collection(db, `companies/${COMPANY_ID}/cheques`),
  purchaseRequests:    () => collection(db, `companies/${COMPANY_ID}/purchaseRequests`),
  purchaseOrders:      () => collection(db, `companies/${COMPANY_ID}/purchaseOrders`),
  goodsReceiptPOs:     () => collection(db, `companies/${COMPANY_ID}/goodsReceiptPOs`),
  qualityInspections:  () => collection(db, `companies/${COMPANY_ID}/qualityInspections`),
  inventoryAdjustments:() => collection(db, `companies/${COMPANY_ID}/inventoryAdjustments`),
  productAssemblies:   () => collection(db, `companies/${COMPANY_ID}/productAssemblies`),
  physicalCounts:      () => collection(db, `companies/${COMPANY_ID}/physicalCounts`),
  auditTrails:         () => collection(db, `companies/${COMPANY_ID}/auditTrails`),
  settings:            () => collection(db, `companies/${COMPANY_ID}/settings`),
  users:               () => collection(db, `companies/${COMPANY_ID}/users`),
  counters:            () => collection(db, `companies/${COMPANY_ID}/counters`),
  locations:           () => collection(db, `companies/${COMPANY_ID}/locations`),
  costCenters:         () => collection(db, `companies/${COMPANY_ID}/costCenters`),
  deliveryNotes:       () => collection(db, `companies/${COMPANY_ID}/deliveryNotes`),
  employeeLoans:       () => collection(db, `companies/${COMPANY_ID}/employeeLoans`),
  payrolls:            () => collection(db, `companies/${COMPANY_ID}/payrolls`),
  employeeLeaves:      () => collection(db, `companies/${COMPANY_ID}/employeeLeaves`),
  employeeAttendance:  () => collection(db, `companies/${COMPANY_ID}/employeeAttendance`),
  employeeSettlements: () => collection(db, `companies/${COMPANY_ID}/employeeSettlements`),
  supplierContracts:   () => collection(db, `companies/${COMPANY_ID}/supplierContracts`),
  supplierClaims:      () => collection(db, `companies/${COMPANY_ID}/supplierClaims`),
  supplierEvaluations: () => collection(db, `companies/${COMPANY_ID}/supplierEvaluations`),
  supplierQuotations:  () => collection(db, `companies/${COMPANY_ID}/supplierQuotations`),
  supplierDeliveries:  () => collection(db, `companies/${COMPANY_ID}/supplierDeliveries`),
  supplierNotes:       () => collection(db, `companies/${COMPANY_ID}/supplierNotes`),
  supplierRebates:     () => collection(db, `companies/${COMPANY_ID}/supplierRebates`),
  customerContracts:   () => collection(db, `companies/${COMPANY_ID}/customerContracts`),
  customerComplaints:  () => collection(db, `companies/${COMPANY_ID}/customerComplaints`),
  customerLeads:       () => collection(db, `companies/${COMPANY_ID}/customerLeads`),
  customerNotes:       () => collection(db, `companies/${COMPANY_ID}/customerNotes`),
  loyaltyTransactions: () => collection(db, `companies/${COMPANY_ID}/loyaltyTransactions`),
  segmentPromotions:   () => collection(db, `companies/${COMPANY_ID}/segmentPromotions`),
  promissoryNotes:     () => collection(db, `companies/${COMPANY_ID}/promissoryNotes`),
  trustReceipts:       () => collection(db, `companies/${COMPANY_ID}/trustReceipts`),
  vanDispatches:       () => collection(db, `companies/${COMPANY_ID}/vanDispatches`),
};

// Fail-safe proxy for COLS so any collection name access always returns a valid CollectionReference
export const COLS = new Proxy(baseCOLS, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => collection(db, `companies/${COMPANY_ID}/${String(prop)}`);
  }
});

// ──────────────────────────────────────────
// ──────────────────────────────────────────
// High-Performance Multi-Tier Client Cache
// L1 = window.ERP_CACHE (in-memory Map, 0ms latency, 30 min TTL)
// L2 = IndexedDB        (idham_erp_db, high capacity, 4 hours TTL, survives restart)
// Smart Invalidation: Updates to a collection only invalidate its specific cache
// ──────────────────────────────────────────
const L1_TTL = 30 * 60 * 1000;       // 30 دقيقة للذاكرة السريعة
const L2_TTL = 4 * 60 * 60 * 1000;  // 4 ساعات لـ IndexedDB
const CACHE_SCHEMA_VER = "232.0";

if (!window.ERP_CACHE) window.ERP_CACHE = {};

// One-time cache reset guard when deploying cache/accounting fixes
const _needsCacheSchemaReset = (() => {
  try {
    if (localStorage.getItem("idham_idb_schema_v") !== CACHE_SCHEMA_VER) {
      window.ERP_CACHE = {};
      return true;
    }
  } catch (_) {}
  return false;
})();

// ─── High-Performance Fail-Safe IndexedDB Engine (Single Instance + 150ms Guard) ───
const IDB_NAME = "idham_erp_cache_db";
const IDB_STORE = "erp_collections";
const IDB_VERSION = 1;

let _idbInstance = null;
let _idbOpenPromise = null;

function openIdb() {
  if (_idbInstance) return Promise.resolve(_idbInstance);
  if (_idbOpenPromise) return _idbOpenPromise;
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  _idbOpenPromise = new Promise((resolve) => {
    let resolved = false;
    const done = (res) => {
      if (!resolved) {
        resolved = true;
        _idbInstance = res;
        _idbOpenPromise = null;
        resolve(res);
      }
    };

    // 150ms timeout guard: NEVER block the ERP on IndexedDB
    const timer = setTimeout(() => done(null), 150);

    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        try {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE, { keyPath: "key" });
          }
        } catch (_) {}
      };
      req.onsuccess = () => {
        clearTimeout(timer);
        const dbRes = req.result;
        if (_needsCacheSchemaReset && dbRes) {
          try {
            const tx = dbRes.transaction(IDB_STORE, "readwrite");
            tx.objectStore(IDB_STORE).clear();
            localStorage.setItem("idham_idb_schema_v", CACHE_SCHEMA_VER);
          } catch (_) {}
        }
        done(dbRes);
      };
      req.onerror = () => { clearTimeout(timer); done(null); };
      req.onblocked = () => { clearTimeout(timer); done(null); };
    } catch (_) {
      clearTimeout(timer);
      done(null);
    }
  });

  return _idbOpenPromise;
}

async function idbGet(key) {
  try {
    const db = await openIdb();
    if (!db) return null;
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) { resolved = true; resolve(val); }
      };
      const timer = setTimeout(() => done(null), 150);

      try {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(key);
        req.onsuccess = () => {
          clearTimeout(timer);
          if (!req.result) return done(null);
          const { val, ts } = req.result;
          if (Date.now() - ts > L2_TTL) {
            idbDel(key);
            return done(null);
          }
          done(val);
        };
        req.onerror = () => { clearTimeout(timer); done(null); };
        tx.onerror = () => { clearTimeout(timer); done(null); };
        tx.onabort = () => { clearTimeout(timer); done(null); };
      } catch (_) { clearTimeout(timer); done(null); }
    });
  } catch (_) { return null; }
}

async function idbSet(key, val) {
  try {
    // Sanitize val to avoid DataCloneError with non-cloneable objects
    const cleanVal = JSON.parse(JSON.stringify(val));
    const db = await openIdb();
    if (!db) return;
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, 150);
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        store.put({ key, val: cleanVal, ts: Date.now() });
        tx.oncomplete = () => { clearTimeout(timer); resolve(); };
        tx.onerror = () => { clearTimeout(timer); resolve(); };
        tx.onabort = () => { clearTimeout(timer); resolve(); };
      } catch (_) { clearTimeout(timer); resolve(); }
    });
  } catch (_) {}
}

async function idbDel(key) {
  try {
    const db = await openIdb();
    if (!db) return;
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, 150);
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        store.delete(key);
        tx.oncomplete = () => { clearTimeout(timer); resolve(); };
        tx.onerror = () => { clearTimeout(timer); resolve(); };
      } catch (_) { clearTimeout(timer); resolve(); }
    });
  } catch (_) {}
}

async function idbClearPrefix(prefix) {
  try {
    const db = await openIdb();
    if (!db) return;
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, 150);
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            if (String(cursor.key).startsWith(prefix)) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            clearTimeout(timer);
            resolve();
          }
        };
        req.onerror = () => { clearTimeout(timer); resolve(); };
      } catch (_) { clearTimeout(timer); resolve(); }
    });
  } catch (_) {}
}

function serializeConstraint(c) {
  if (!c) return "null";
  const type = c.type || (c._limit !== undefined ? "limit" : c._direction ? "orderBy" : c._op ? "where" : "unknown");
  if (type === "where") {
    const field = c._field?.segments?.join(".") || c.field?.segments?.join(".") || c.field || "f";
    const op = c._op || c.op || "==";
    const val = String(c._value !== undefined ? c._value : c.value);
    return `where_${field}_${op}_${val}`;
  }
  if (type === "orderBy") {
    const field = c._field?.segments?.join(".") || c.field?.segments?.join(".") || c.field || "f";
    const dir = c._direction || c.direction || "asc";
    return `order_${field}_${dir}`;
  }
  if (type === "limit") {
    const lim = c._limit !== undefined ? c._limit : c.limit;
    return `limit_${lim}`;
  }
  return String(c);
}

/**
 * Clear cache for a specific collection path (or all if no path given).
 * Smart: updating products won't evict suppliers/customers cache.
 */
export async function clearERPCache(colPath = null) {
  if (colPath) {
    // Clear L1 in-memory
    delete window.ERP_CACHE[colPath];
    Object.keys(window.ERP_CACHE)
      .filter(k => k.startsWith(colPath))
      .forEach(k => delete window.ERP_CACHE[k]);
    // Clear L2 IndexedDB
    try {
      await idbClearPrefix(colPath);
    } catch (_) {}
  } else {
    // Full clear
    window.ERP_CACHE = {};
    try {
      const db = await openIdb();
      if (db) {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).clear();
      }
    } catch (_) {}
  }
}

// ──────────────────────────────────────────
// CRUD Helpers (Polymorphic: string or colRef)
// ──────────────────────────────────────────
export async function create(collectionNameOrRef, data) {
  let targetColRef;
  let colPath;
  if (typeof collectionNameOrRef === "string") {
    colPath = `companies/${COMPANY_ID}/${collectionNameOrRef}`;
    targetColRef = collection(db, colPath);
  } else if (collectionNameOrRef && collectionNameOrRef.path) {
    colPath = collectionNameOrRef.path;
    targetColRef = collectionNameOrRef;
  } else {
    const colName = collectionNameOrRef?.id || String(collectionNameOrRef);
    colPath = `companies/${COMPANY_ID}/${colName}`;
    targetColRef = collection(db, colPath);
  }

  clearERPCache(colPath);
  const docRef = await addDoc(targetColRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function update(collectionNameOrRef, id, data) {
  let docRef;
  let colPath;
  if (typeof collectionNameOrRef === "string") {
    colPath = `companies/${COMPANY_ID}/${collectionNameOrRef}`;
    clearERPCache(colPath);
    docRef = doc(db, colPath, id);
  } else if (collectionNameOrRef && collectionNameOrRef.path) {
    colPath = collectionNameOrRef.path;
    clearERPCache(colPath);
    docRef = doc(db, collectionNameOrRef.path, id);
  } else {
    const colName = collectionNameOrRef?.id || String(collectionNameOrRef);
    colPath = `companies/${COMPANY_ID}/${colName}`;
    clearERPCache(colPath);
    docRef = doc(db, colPath, id);
  }
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJournalEntry(id) {
  try {
    const jeRef = doc(db, `companies/${COMPANY_ID}/journalEntries`, id);
    const jeSnap = await getDoc(jeRef);
    if (!jeSnap.exists()) return;

    const jeData = jeSnap.data();
    const isPosted = jeData.status === "posted" || jeData.status === "مرحل" || jeData.status === "مرحّل";

    // Step 1: If posted, reverse balances on affected chartOfAccounts in batch
    if (isPosted && Array.isArray(jeData.lines) && jeData.lines.length > 0) {
      const allAccounts = await getAll(COLS.chartOfAccounts());
      const accByCode = {};
      allAccounts.forEach(a => { accByCode[a.code] = a; });
      const batchRev = writeBatch(db);
      let batchRevHasWrites = false;

      for (const line of jeData.lines) {
        if (!line.accountCode) continue;
        const debit  = parseFloat(line.debit)  || 0;
        const credit = parseFloat(line.credit) || 0;
        if (debit === 0 && credit === 0) continue;

        const accData = accByCode[line.accountCode];
        if (accData) {
          const docRef = doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, accData.id);
          const normalBalance = accData.normalBalance || (["asset", "expense"].includes(accData.type) ? "debit" : "credit");
          const netChange = normalBalance === "debit" ? (debit - credit) : (credit - debit);

          batchRev.update(docRef, {
            balance:     increment(-netChange),
            totalDebit:  increment(-debit),
            totalCredit: increment(-credit),
            updatedAt:   serverTimestamp()
          });
          batchRevHasWrites = true;
        }
      }
      if (batchRevHasWrites) await batchRev.commit();
    }

    // Step 2: Delete the document
    await deleteDoc(jeRef);
    clearERPCache(COLS.chartOfAccounts().path);
  } catch (err) {
    console.error("[deleteJournalEntry] Failed to reverse balance and delete JE:", err);
    throw err;
  }
}

export async function remove(collectionNameOrRef, id) {
  let colPath;
  let colName;
  if (typeof collectionNameOrRef === "string") {
    colName = collectionNameOrRef;
    colPath = `companies/${COMPANY_ID}/${collectionNameOrRef}`;
  } else if (collectionNameOrRef && collectionNameOrRef.path) {
    colPath = collectionNameOrRef.path;
    colName = collectionNameOrRef.id || colPath.split("/").pop();
  } else {
    colName = collectionNameOrRef?.id || String(collectionNameOrRef);
    colPath = `companies/${COMPANY_ID}/${colName}`;
  }

  clearERPCache(colPath);
  if (colName === "journalEntries") {
    await deleteJournalEntry(id);
  } else {
    const docRef = doc(db, colPath, id);
    await deleteDoc(docRef);
  }
}

export async function getById(collectionNameOrRef, id) {
  let colName;
  let colPath;
  if (typeof collectionNameOrRef === "string") {
    colName = collectionNameOrRef;
    colPath = `companies/${COMPANY_ID}/${collectionNameOrRef}`;
  } else if (collectionNameOrRef && collectionNameOrRef.path) {
    colPath = collectionNameOrRef.path;
    colName = collectionNameOrRef.id || colPath.split("/").pop();
  } else {
    colName = collectionNameOrRef?.id || String(collectionNameOrRef);
    colPath = `companies/${COMPANY_ID}/${colName}`;
  }

  const cacheKey = `${colPath}/${id}`;
  // L1 check (0ms)
  const l1 = window.ERP_CACHE[cacheKey];
  if (l1 && Date.now() - l1.ts < L1_TTL) return l1.data;
  // L2 IndexedDB check (<5ms)
  const l2 = await idbGet(cacheKey);
  if (l2) {
    window.ERP_CACHE[cacheKey] = { data: l2, ts: Date.now() };
    return l2;
  }

  const docRef = doc(db, colPath, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const result = { id: snap.id, ...snap.data() };
  window.ERP_CACHE[cacheKey] = { data: result, ts: Date.now() };
  idbSet(cacheKey, result).catch(() => {});
  return result;
}

export async function getAll(colRef, constraints = []) {
  if (typeof colRef === "string") {
    colRef = collection(db, colRef.includes("/") ? colRef : `companies/${COMPANY_ID}/${colRef}`);
  }
  const colPathStr = colRef?.path || String(colRef);
  // Semi-static collections (chartOfAccounts, warehouses, categories, units, products, customers)
  // are cached in L1 (Memory) and L2 (IndexedDB) for instant 0ms loads and quota protection.
  const isDynamicCol = colPathStr.includes("stockByWarehouse") || 
                       colPathStr.includes("stockTransactions") ||
                       colPathStr.includes("cashBoxes") ||
                       colPathStr.includes("cashTransactions");
  const cacheKey = colPathStr + (constraints.length
    ? "__" + constraints.map(serializeConstraint).join("_")
    : "");

  const DYNAMIC_L1_TTL = 90 * 1000; // 90s short memory cache for dynamic collections during fast navigation

  if (isDynamicCol) {
    const l1 = window.ERP_CACHE[cacheKey];
    if (l1 && Date.now() - l1.ts < DYNAMIC_L1_TTL) {
      return [...l1.data];
    }
  } else {
    // 1. L1 Memory Check (Instant 0ms)
    const l1 = window.ERP_CACHE[cacheKey];
    if (l1 && Date.now() - l1.ts < L1_TTL) {
      return [...l1.data];
    }

    // 2. L2 IndexedDB Check (<5ms)
    const l2 = await idbGet(cacheKey);
    if (l2 && Array.isArray(l2)) {
      window.ERP_CACHE[cacheKey] = { data: l2, ts: Date.now() };
      return [...l2];
    }
  }

  // 3. High-Performance Multi-Tab Cached Fetch (Offline Persistence Enabled)
  const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));

  // Save in L1 memory cache (fast 0ms hits)
  window.ERP_CACHE[cacheKey] = { data, ts: Date.now() };

  // Save in L2 IndexedDB only for static/non-dynamic collections
  if (!isDynamicCol) {
    idbSet(cacheKey, data).catch(() => {});
  }

  return data;
}

export async function getPaginated(colRef, constraints, pageSize = 50, lastDoc = null) {
  if (typeof colRef === "string") {
    colRef = collection(db, colRef.includes("/") ? colRef : `companies/${COMPANY_ID}/${colRef}`);
  }
  const qConstraints = [...constraints, limit(pageSize + 1)];
  if (lastDoc) qConstraints.push(startAfter(lastDoc));
  const q = query(colRef, ...qConstraints);
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > pageSize;
  const docs = snap.docs.slice(0, pageSize).map(d => ({ ...d.data(), id: d.id }));
  const lastSnapshot = snap.docs[Math.min(pageSize - 1, snap.docs.length - 1)] || null;
  return { docs, hasMore, lastSnapshot };
}

// ──────────────────────────────────────────
// Invoice Number Generation (Atomic Counter)
// Strictly sequential, zero duplicates, atomic Firestore transaction
// ──────────────────────────────────────────
export async function generateInvoiceNumber(prefix = "INV") {
  const p = (prefix || "INV").toUpperCase();
  const docKey = p.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const counterRef = doc(db, `companies/${COMPANY_ID}/counters`, docKey);
  const MAX_RETRIES = 5;

  // Baseline minimum sequence per series to guarantee historical monotonicity without gaps
  const MIN_SEQ = {
    INV:  42133, // Continues seamlessly from INV-042132
    PUR:  130,   // Continues from PUR-000129
    QT:   5102,  // Continues from QT-005101
    CN:   12,
    DN:   17,
    TR:   98,
    VAN1: 1,
    VAN2: 1,
    VAN3: 1,
    VAN4: 1
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let number;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const storedSeq = snap.exists() ? (snap.data().seq || 0) : 0;
        const baseline = MIN_SEQ[p] || 1;
        const nextSeq = Math.max(storedSeq + 1, baseline);

        tx.set(counterRef, {
          seq: nextSeq,
          prefix: p,
          updatedAt: serverTimestamp()
        }, { merge: true });

        number = `${p}-${String(nextSeq).padStart(6, "0")}`;
      });
      return number;  // ✅ Success! Instant, zero quota waste, strictly sequential
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, attempt * 400));
        continue;
      }
      console.warn(`[Counter] ${p} fallback after ${attempt} attempts:`, err?.code || err?.message);
      return `${p}-${Date.now().toString().slice(-6)}`;
    }
  }

  return `${p}-${Date.now().toString().slice(-6)}`;
}

// ──────────────────────────────────────────
// Stock Operations (Atomic)
// ──────────────────────────────────────────
export async function adjustStock(warehouseId, productId, qtyDelta, metadata = {}) {
  clearERPCache(COLS.stockByWarehouse().path);
  clearERPCache(COLS.stockTransactions().path);
  clearERPCache(COLS.products().path);
  if (!warehouseId || !productId) throw new Error("warehouseId and productId are required");

  const isEditOrCancel = metadata.isEdit || (metadata.type && (metadata.type.includes("edit") || metadata.type.includes("cancel") || metadata.type.includes("reverse")));
  const txDocId = metadata.txDocId || (metadata.sourceId && metadata.type ? (isEditOrCancel ? `tx_${metadata.type}_${metadata.sourceId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${warehouseId}_${productId}` : `tx_${metadata.type}_${metadata.sourceId}_${warehouseId}_${productId}`).replace(/[\/\s]/g, '_') : null);
  const stockDocId = `${warehouseId}_${productId}`;
  const stockRef   = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId);
  const txnRef     = txDocId ? doc(db, `companies/${COMPANY_ID}/stockTransactions`, txDocId) : doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
  const sysRef     = doc(db, `companies/${COMPANY_ID}/settings`, "system");

  await runTransaction(db, async (tx) => {
    // 1. PERFORM ALL READS FIRST
    const txnSnap = await tx.get(txnRef);
    if (txnSnap.exists()) {
      console.warn(`[adjustStock] Transaction ${txnRef.id} already processed. Skipping duplicate execution.`);
      return;
    }
    const sysSnap = await tx.get(sysRef);
    const stockSnap = await tx.get(stockRef);
    const prodRef = doc(db, `companies/${COMPANY_ID}/products`, productId);
    const prodSnap = await tx.get(prodRef);

    // 2. LOGICAL COMPUTATIONS IN MEMORY
    const valMethod = sysSnap.exists() ? (sysSnap.data().valuationMethod || "weighted_average") : "weighted_average";
    const currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
    const newQty = currentQty + qtyDelta;

    if (newQty < 0 && !metadata.allowNegative) {
      throw new Error(`رصيد المخزون غير كافٍ — الرصيد الحالي: ${currentQty}، المطلوب: ${Math.abs(qtyDelta)}`);
    }

    const reorderLevel = stockSnap.exists() ? (stockSnap.data().reorderLevel || 0) : 0;
    const stockStatus = newQty <= 0 ? "out" : (reorderLevel > 0 && newQty <= reorderLevel ? "low" : "ok");

    let hasProdUpdate = false;
    let prodUpdateData = {};
    let txnCogs = null;
    let txnUnitCost = null;

    if (prodSnap.exists()) {
      const prodData = prodSnap.data();
      const currentAvg = prodData.averageCost || prodData.costPrice || 0;
      const currentQtyVal = prodData.totalQty || 0;
      const totalNewQty = Math.max(0, currentQtyVal + qtyDelta);
      hasProdUpdate = true;

      if (valMethod === "fifo") {
        let fifoBatches = Array.isArray(prodData.fifoBatches) ? prodData.fifoBatches : [];
        fifoBatches = fifoBatches.filter(b => b && b.qty > 0);

        if (qtyDelta > 0) {
          const purchasePrice = parseFloat(metadata.purchasePrice) || parseFloat(prodData.costPrice) || 0;
          fifoBatches.push({
            qty: qtyDelta,
            price: purchasePrice,
            date: metadata.date || new Date().toISOString().split("T")[0]
          });
          
          let newAvg = purchasePrice;
          if (totalNewQty > 0) {
            newAvg = ((currentQtyVal * currentAvg) + (qtyDelta * purchasePrice)) / totalNewQty;
          }
          newAvg = Math.round(newAvg * 10000) / 10000;

          const oldestPrice = fifoBatches.length > 0 ? fifoBatches[0].price : purchasePrice;
          prodUpdateData = {
            fifoBatches,
            costPrice: oldestPrice,
            averageCost: newAvg,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
        } else if (qtyDelta < 0) {
          let qtyToConsume = Math.abs(qtyDelta);
          let totalCostConsumed = 0;

          while (qtyToConsume > 0 && fifoBatches.length > 0) {
            const batch = fifoBatches[0];
            if (batch.qty <= qtyToConsume) {
              totalCostConsumed += batch.qty * batch.price;
               qtyToConsume -= batch.qty;
              fifoBatches.shift();
            } else {
              totalCostConsumed += qtyToConsume * batch.price;
              batch.qty -= qtyToConsume;
              qtyToConsume = 0;
            }
          }

          if (qtyToConsume > 0) {
            const fallbackPrice = parseFloat(prodData.costPrice) || 0;
            totalCostConsumed += qtyToConsume * fallbackPrice;
          }

          const oldestPrice = fifoBatches.length > 0 ? fifoBatches[0].price : (prodData.costPrice || 0);
          prodUpdateData = {
            fifoBatches,
            costPrice: oldestPrice,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
          txnCogs = totalCostConsumed;
          txnUnitCost = Math.round((totalCostConsumed / Math.abs(qtyDelta)) * 10000) / 10000;
        }
      } else {
        // Weighted Average method
        if (qtyDelta > 0 && metadata.type === "purchase_in" && metadata.purchasePrice !== undefined) {
          const purchasePrice = parseFloat(metadata.purchasePrice) || 0;
          let newAvg = purchasePrice;
          if (totalNewQty > 0) {
            newAvg = ((currentQtyVal * currentAvg) + (qtyDelta * purchasePrice)) / totalNewQty;
          }
          newAvg = Math.round(newAvg * 10000) / 10000;

          prodUpdateData = {
            averageCost: newAvg,
            costPrice: newAvg,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
        } else {
          prodUpdateData = {
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
        }
      }
    }

    // 3. PERFORM ALL WRITES AT THE END
    tx.set(stockRef, {
      warehouseId, productId,
      qty: newQty,
      stockStatus,
      reorderLevel,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    if (hasProdUpdate) {
      tx.update(prodRef, prodUpdateData);
    }

    const txnData = {
      warehouseId, productId,
      qtyBefore: currentQty,
      qtyChange: qtyDelta,
      qtyAfter: newQty,
      date: metadata.date || new Date().toISOString().split("T")[0],
      ...metadata,
      createdAt: serverTimestamp(),
    };
    if (txnCogs !== null) txnData.cogs = txnCogs;
    if (txnUnitCost !== null) txnData.unitCost = txnUnitCost;

    tx.set(txnRef, txnData);
  });
}

export async function adjustStockBulk(adjustments) {
  clearERPCache(COLS.stockByWarehouse().path);
  clearERPCache(COLS.stockTransactions().path);
  clearERPCache(COLS.products().path);
  if (!Array.isArray(adjustments) || adjustments.length === 0) return;

  const sysRef = doc(db, `companies/${COMPANY_ID}/settings`, "system");

  await runTransaction(db, async (tx) => {
    // 1. Read system settings
    const sysSnap = await tx.get(sysRef);
    const valMethod = sysSnap.exists() ? (sysSnap.data().valuationMethod || "weighted_average") : "weighted_average";

    // 2. Map and unique lists of references
    const uniqueStocks = {}; // key: warehouseId_productId
    const uniqueProducts = {}; // key: productId

    // Group adjustments
    for (const adj of adjustments) {
      const { warehouseId, productId, qtyDelta } = adj;
      if (!warehouseId || !productId) continue;

      const stockDocId = `${warehouseId}_${productId}`;
      if (!uniqueStocks[stockDocId]) {
        uniqueStocks[stockDocId] = {
          warehouseId,
          productId,
          qtyDelta: 0,
          metadata: { ...adj.metadata }
        };
      }
      uniqueStocks[stockDocId].qtyDelta += qtyDelta;

      if (uniqueProducts[productId] === undefined) {
        uniqueProducts[productId] = 0;
      }
      uniqueProducts[productId] += qtyDelta;
    }

    const stockKeys = Object.keys(uniqueStocks);
    const productKeys = Object.keys(uniqueProducts);

    // Prepare Refs
    const stockRefs = stockKeys.map(k => doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, k));
    const prodRefs = productKeys.map(k => doc(db, `companies/${COMPANY_ID}/products`, k));

    // Prepare txnRefs for each adjustment to guarantee idempotency
    const adjTxnRefs = adjustments.map(adj => {
      const { warehouseId, productId, metadata = {} } = adj;
      const isEditOrCancel = metadata.isEdit || (metadata.type && (metadata.type.includes("edit") || metadata.type.includes("cancel") || metadata.type.includes("reverse")));
      const txDocId = metadata.txDocId || (metadata.sourceId && metadata.type ? (isEditOrCancel ? `tx_${metadata.type}_${metadata.sourceId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${warehouseId}_${productId}` : `tx_${metadata.type}_${metadata.sourceId}_${warehouseId}_${productId}`).replace(/[\/\s]/g, '_') : null);
      return txDocId ? doc(db, `companies/${COMPANY_ID}/stockTransactions`, txDocId) : doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
    });

    // Execute all reads in parallel
    const [stockSnaps, prodSnaps, txnSnaps] = await Promise.all([
      Promise.all(stockRefs.map(ref => tx.get(ref))),
      Promise.all(prodRefs.map(ref => tx.get(ref))),
      Promise.all(adjTxnRefs.map(ref => tx.get(ref)))
    ]);

    // Filter out adjustments that have already been applied in Firestore
    const activeAdjustments = [];
    const activeTxnRefs = [];
    adjustments.forEach((adj, idx) => {
      if (txnSnaps[idx].exists()) {
        console.warn(`[adjustStockBulk] Transaction ${adjTxnRefs[idx].id} already applied. Skipping duplicate.`);
      } else {
        activeAdjustments.push(adj);
        activeTxnRefs.push(adjTxnRefs[idx]);
      }
    });

    if (activeAdjustments.length === 0) {
      console.log(`[adjustStockBulk] All adjustments already processed. Skipping.`);
      return;
    }

    const stockSnapMap = {};
    stockKeys.forEach((k, idx) => { stockSnapMap[k] = stockSnaps[idx]; });

    const prodSnapMap = {};
    productKeys.forEach((k, idx) => { prodSnapMap[k] = prodSnaps[idx]; });

    // Store in-memory updates for products
    const prodUpdateMap = {};

    // Process product quantity changes first (to compute new cost/qty)
    for (const productId of productKeys) {
      const prodSnap = prodSnapMap[productId];
      if (!prodSnap.exists()) continue;

      const prodData = prodSnap.data();
      const currentAvg = prodData.averageCost || prodData.costPrice || 0;
      const currentQtyVal = prodData.totalQty || 0;
      const qtyDelta = uniqueProducts[productId];
      const totalNewQty = Math.max(0, currentQtyVal + qtyDelta);

      let prodUpdateData = {
        totalQty: totalNewQty,
        updatedAt: serverTimestamp()
      };

      let txnCogs = null;
      let txnUnitCost = null;

      // Find the first adjustment for this product that has metadata
      const firstAdj = activeAdjustments.find(a => a.productId === productId);
      const metadata = firstAdj ? firstAdj.metadata : {};

      if (valMethod === "fifo") {
        let fifoBatches = Array.isArray(prodData.fifoBatches) ? prodData.fifoBatches : [];
        fifoBatches = fifoBatches.filter(b => b && b.qty > 0);

        if (qtyDelta > 0) {
          const purchasePrice = parseFloat(metadata.purchasePrice) || parseFloat(prodData.costPrice) || 0;
          fifoBatches.push({
            qty: qtyDelta,
            price: purchasePrice,
            date: metadata.date || new Date().toISOString().split("T")[0]
          });
          
          let newAvg = purchasePrice;
          if (totalNewQty > 0) {
            newAvg = ((currentQtyVal * currentAvg) + (qtyDelta * purchasePrice)) / totalNewQty;
          }
          newAvg = Math.round(newAvg * 10000) / 10000;

          const oldestPrice = fifoBatches.length > 0 ? fifoBatches[0].price : purchasePrice;
          prodUpdateData = {
            fifoBatches,
            costPrice: oldestPrice,
            averageCost: newAvg,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
        } else if (qtyDelta < 0) {
          let qtyToConsume = Math.abs(qtyDelta);
          let totalCostConsumed = 0;

          while (qtyToConsume > 0 && fifoBatches.length > 0) {
            const batch = fifoBatches[0];
            if (batch.qty <= qtyToConsume) {
              totalCostConsumed += batch.qty * batch.price;
              qtyToConsume -= batch.qty;
              fifoBatches.shift();
            } else {
              totalCostConsumed += qtyToConsume * batch.price;
              batch.qty -= qtyToConsume;
              qtyToConsume = 0;
            }
          }

          if (qtyToConsume > 0) {
            const fallbackPrice = parseFloat(prodData.costPrice) || 0;
            totalCostConsumed += qtyToConsume * fallbackPrice;
          }

          const oldestPrice = fifoBatches.length > 0 ? fifoBatches[0].price : (prodData.costPrice || 0);
          prodUpdateData = {
            fifoBatches,
            costPrice: oldestPrice,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
          txnCogs = totalCostConsumed;
          txnUnitCost = Math.round((totalCostConsumed / Math.abs(qtyDelta)) * 10000) / 10000;
        }
      } else {
        // Weighted Average
        if (qtyDelta > 0 && metadata.type === "purchase_in" && metadata.purchasePrice !== undefined) {
          const purchasePrice = parseFloat(metadata.purchasePrice) || 0;
          let newAvg = purchasePrice;
          if (totalNewQty > 0) {
            newAvg = ((currentQtyVal * currentAvg) + (qtyDelta * purchasePrice)) / totalNewQty;
          }
          newAvg = Math.round(newAvg * 10000) / 10000;

          prodUpdateData = {
            averageCost: newAvg,
            costPrice: newAvg,
            totalQty: totalNewQty,
            updatedAt: serverTimestamp()
          };
        }
      }

      prodUpdateMap[productId] = {
        ref: prodRefs[productKeys.indexOf(productId)],
        data: prodUpdateData,
        txnCogs,
        txnUnitCost
      };
    }

    // Now process each individual stock adjustment and write to transaction
    for (let i = 0; i < activeAdjustments.length; i++) {
      const adj = activeAdjustments[i];
      const txnRef = activeTxnRefs[i];
      const { warehouseId, productId, qtyDelta, metadata = {} } = adj;
      if (!warehouseId || !productId) continue;

      const stockDocId = `${warehouseId}_${productId}`;
      const stockSnap = stockSnapMap[stockDocId];
      const currentQty = stockSnap && stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
      
      if (uniqueStocks[stockDocId].runningQty === undefined) {
        uniqueStocks[stockDocId].runningQty = currentQty;
      }
      const qtyBefore = uniqueStocks[stockDocId].runningQty;
      const qtyAfter = qtyBefore + qtyDelta;

      if (qtyAfter < 0 && !metadata.allowNegative) {
        throw new Error(`رصيد المخزون غير كافٍ للمنتج (${metadata.productName || productId}) في المستودع المحدد. الرصيد الحالي: ${qtyBefore}، المطلوب خصمه: ${Math.abs(qtyDelta)}`);
      }

      uniqueStocks[stockDocId].runningQty = qtyAfter;

      const reorderLevel = stockSnap && stockSnap.exists() ? (stockSnap.data().reorderLevel || 0) : 0;
      const stockStatus = qtyAfter <= 0 ? "out" : (reorderLevel > 0 && qtyAfter <= reorderLevel ? "low" : "ok");

      const stockRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId);
      tx.set(stockRef, {
        warehouseId, productId,
        qty: qtyAfter,
        stockStatus,
        reorderLevel,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const txnData = {
        warehouseId, productId,
        qtyBefore,
        qtyChange: qtyDelta,
        qtyAfter,
        date: metadata.date || new Date().toISOString().split("T")[0],
        ...metadata,
        createdAt: serverTimestamp(),
      };

      const pUpdate = prodUpdateMap[productId];
      if (pUpdate) {
        const netChange = uniqueProducts[productId];
        if (pUpdate.txnCogs !== null && Math.abs(netChange) > 0.0001) {
          const ratio = qtyDelta / netChange;
          txnData.cogs = Math.round(pUpdate.txnCogs * ratio * 100) / 100;
        }
        if (pUpdate.txnUnitCost !== null) {
          txnData.unitCost = pUpdate.txnUnitCost;
        }
      }

      tx.set(txnRef, txnData);
    }

    // Write all product updates
    for (const productId of productKeys) {
      const pUpdate = prodUpdateMap[productId];
      if (pUpdate) {
        tx.update(pUpdate.ref, pUpdate.data);
      }
    }
  });
}


export async function getStockForProduct(productId) {
  const q = query(COLS.stockByWarehouse(), where("productId", "==", productId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export async function getStockForWarehouse(warehouseId) {
  const q = query(COLS.stockByWarehouse(), where("warehouseId", "==", warehouseId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

// ──────────────────────────────────────────
// Stock Transfer Between Warehouses (Atomic)
// ──────────────────────────────────────────
export async function transferStock(fromWarehouseId, toWarehouseId, productId, qty, metadata = {}) {
  clearERPCache(COLS.stockByWarehouse().path);
  clearERPCache(COLS.stockTransactions().path);
  clearERPCache(COLS.stockTransfers().path);
  if (fromWarehouseId === toWarehouseId) throw new Error("المخزن المصدر والوجهة متطابقان");
  if (qty <= 0) throw new Error("الكمية يجب أن تكون أكبر من صفر");

  const fromRef   = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${fromWarehouseId}_${productId}`);
  const toRef     = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${toWarehouseId}_${productId}`);
  const txnOutRef = doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
  const txnInRef  = doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));

  await runTransaction(db, async (tx) => {
    const fromSnap = await tx.get(fromRef);
    const toSnap   = await tx.get(toRef);

    const fromQty = fromSnap.exists() ? (fromSnap.data().qty || 0) : 0;
    const toQty   = toSnap.exists()   ? (toSnap.data().qty   || 0) : 0;

    if (fromQty < qty) throw new Error(`رصيد غير كافٍ في المخزن المصدر: ${fromQty} < ${qty}`);

    const newFromQty = fromQty - qty;
    const newToQty   = toQty   + qty;

    tx.set(fromRef, { qty: newFromQty, updatedAt: serverTimestamp() }, { merge: true });
    tx.set(toRef,   { qty: newToQty,   updatedAt: serverTimestamp(), warehouseId: toWarehouseId, productId }, { merge: true });

    tx.set(txnOutRef, { warehouseId: fromWarehouseId, productId, qtyBefore: fromQty, qtyChange: -qty, qtyAfter: newFromQty, type: "transfer_out", ...metadata, createdAt: serverTimestamp() });
    tx.set(txnInRef,  { warehouseId: toWarehouseId,   productId, qtyBefore: toQty,   qtyChange: +qty, qtyAfter: newToQty,   type: "transfer_in",  ...metadata, createdAt: serverTimestamp() });
  });
}

// ──────────────────────────────────────────
// Journal Entry (Double-Entry, Validated)
// ──────────────────────────────────────────
let journalSeq = 0;

function getParentCodes(code, accByCode = null) {
  if (!code) return [];
  const parents = [];

  if (accByCode) {
    let curr = code;
    let guard = 0;
    while (curr && guard < 10) {
      guard++;
      const acc = accByCode[curr];
      const pCode = acc ? (acc.data?.parentCode || acc.parentCode) : null;
      if (!pCode || pCode === curr) break;
      if (!parents.includes(pCode)) {
        parents.push(pCode);
      }
      curr = pCode;
    }
  }

  const parts = code.split("-");
  for (let i = 1; i < parts.length; i++) {
    const p = parts.slice(0, i).join("-");
    if (!parents.includes(p)) parents.push(p);
  }
  return parents;
}

export async function createJournalEntry({ date, description, lines, sourceType = "manual", sourceId = null, status = "posted", createdByName = "النظام", entryNumber: providedEntryNumber, costCenterId = null, costCenterName = null }) {
  clearERPCache(COLS.journalEntries().path);
  // Note: chartOfAccounts cache is kept intact to prevent burning hundreds of reads on every invoice/payment
  // Validate balance
  const totalDebit  = lines.reduce((s, l) => s + (l.debit  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`القيد غير متوازن: المدين ${totalDebit.toFixed(2)} ≠ الدائن ${totalCredit.toFixed(2)}`);
  }

  // Sanitize lines (replace undefined with null)
  const sanitizedLines = (lines || []).map(line => {
    const l = {};
    for (const key of Object.keys(line)) {
      l[key] = line[key] === undefined ? null : line[key];
    }
    return l;
  });

  // Step 1: Get entry number and save journal entry (NO queries inside transaction)
  const counterRef = doc(db, `companies/${COMPANY_ID}/counters`, "journal");
  let entryNumber;
  let entryRef;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const seq  = snap.exists() ? (snap.data().seq || 0) + 1 : 1;
    tx.set(counterRef, { seq, updatedAt: serverTimestamp() });
    entryNumber = providedEntryNumber || `JE-${String(seq).padStart(6, "0")}`;

    // Write journal entry doc
    entryRef = doc(collection(db, `companies/${COMPANY_ID}/journalEntries`));
    tx.set(entryRef, {
      entryNumber: entryNumber || null,
      code: entryNumber || null,
      date: date || null,
      description: description || null,
      costCenterId: costCenterId || null,
      costCenterName: costCenterName || null,
      lines: sanitizedLines,
      sourceType: sourceType || null,
      sourceId: sourceId || null,
      totalDebit:  Math.round(totalDebit  * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      status: status || "posted",
      createdByName: createdByName || null,
      createdAt: serverTimestamp(),
    });
  });

  // Step 2: Update account balances AFTER transaction (queries not allowed inside transactions)
  // ✅ المزامنة التلقائية: يُحدِّث شجرة الحسابات فور إنشاء أي قيد (ويُحدِّث الكاش محلياً دون قراءات إضافية)
  const _applyBalanceUpdate = async () => {
    const batch = writeBatch(db);
    let batchHasWrites = false;
    const codeDeltas = {};

    // Fetch accounts using cached getAll (0 network reads!)
    const allAccounts = await getAll(COLS.chartOfAccounts());
    const accByCode = {};
    allAccounts.forEach(d => {
      accByCode[d.code] = { ref: doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, d.id), data: d };
    });

    for (const line of sanitizedLines) {
      if (!line.accountCode) continue;
      const delta = (line.debit || 0) - (line.credit || 0);
      if (Math.abs(delta) < 0.001) continue;

      // Update both the leaf account and all its parent accounts hierarchically
      const parentCodes = getParentCodes(line.accountCode, accByCode);
      const codesToUpdate = [line.accountCode, ...parentCodes];

      for (const c of codesToUpdate) {
        const accEntry = accByCode[c];
        if (accEntry) {
          const firstChar = c.trim().charAt(0);
          const isCreditNormal = ["2", "3", "4"].includes(firstChar);
          const incrementValue = isCreditNormal ? -delta : delta;

          const updateFields = {
            balance: increment(incrementValue),
            updatedAt: serverTimestamp(),
          };

          const debitDelta = line.debit || 0;
          const creditDelta = line.credit || 0;
          if (debitDelta > 0) updateFields.totalDebit = increment(debitDelta);
          if (creditDelta > 0) updateFields.totalCredit = increment(creditDelta);

          if (!codeDeltas[c]) codeDeltas[c] = { bal: 0, dr: 0, cr: 0 };
          codeDeltas[c].bal += incrementValue;
          codeDeltas[c].dr  += debitDelta;
          codeDeltas[c].cr  += creditDelta;

          batch.update(accEntry.ref, updateFields);
          batchHasWrites = true;
        }
      }
    }

    if (batchHasWrites) {
      await batch.commit();
      // Sync L1 & L2 chartOfAccounts cache in-place with 0 extra Firestore reads
      const coaPath = COLS.chartOfAccounts().path;
      Object.keys(window.ERP_CACHE)
        .filter(k => k.startsWith(coaPath))
        .forEach(k => {
          const entry = window.ERP_CACHE[k];
          if (entry && Array.isArray(entry.data)) {
            entry.data = entry.data.map(acc => {
              const d = codeDeltas[acc.code];
              if (!d) return acc;
              return {
                ...acc,
                balance: Math.round((Number(acc.balance || 0) + d.bal) * 100) / 100,
                totalDebit: Math.round((Number(acc.totalDebit || 0) + d.dr) * 100) / 100,
                totalCredit: Math.round((Number(acc.totalCredit || 0) + d.cr) * 100) / 100,
              };
            });
            entry.ts = Date.now();
            idbSet(k, entry.data).catch(() => {});
          }
        });
    }
  };

  try {
    await _applyBalanceUpdate();
  } catch (balanceErr) {
    // أُعيد المحاولة مرة واحدة تلقائياً قبل الاستسلام
    console.warn("[createJournalEntry] Balance update failed, retrying once…", balanceErr.message);
    try {
      await new Promise(r => setTimeout(r, 800));
      await _applyBalanceUpdate();
      console.log("[createJournalEntry] Balance update retry succeeded.");
    } catch (retryErr) {
      // القيد محفوظ — الشجرة ستتحدث عند فتح صفحة شجرة الحسابات
      console.error("[createJournalEntry] Balance update failed after retry (JE saved OK):", retryErr.message,
        "| JE lines:", sanitizedLines.map(l => `${l.accountCode} DR:${l.debit||0} CR:${l.credit||0}`).join(" | "));
    }
  }

  // ✅ يُرجع معرّف Firestore كـ primitive string لضمان توافقه مع كافة عمليات updateDoc/setDoc
  return entryRef.id;
}

export async function updateJournalEntry(id, { date, description, reference, lines, status = "posted" }) {
  clearERPCache(COLS.journalEntries().path);
  clearERPCache(COLS.chartOfAccounts().path);
  
  // Validate balance
  const totalDebit  = lines.reduce((s, l) => s + (l.debit  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`القيد غير متوازن: المدين ${totalDebit.toFixed(2)} ≠ الدائن ${totalCredit.toFixed(2)}`);
  }

  // Sanitize lines (replace undefined with null)
  const sanitizedLines = (lines || []).map(line => {
    const l = {};
    for (const key of Object.keys(line)) {
      l[key] = line[key] === undefined ? null : line[key];
    }
    return l;
  });

  const jeRef = doc(db, `companies/${COMPANY_ID}/journalEntries`, id);
  const jeSnap = await getDoc(jeRef);
  if (!jeSnap.exists()) throw new Error("القيد غير موجود");
  const oldJE = jeSnap.data();

  // Fetch accounts using cached getAll (0 network reads!)
  const allAccounts = await getAll(COLS.chartOfAccounts());
  const accByCode = {};
  allAccounts.forEach(d => {
    accByCode[d.code] = { ref: doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, d.id), data: d };
  });

  // Step 1: Reverse OLD balance updates (if it was posted)
  if (oldJE && oldJE.status === "posted" && oldJE.lines) {
    const batchRev = writeBatch(db);
    let batchRevHasWrites = false;
    for (const line of oldJE.lines) {
      if (!line.accountCode) continue;
      // Reverse old lines: credit becomes debit, debit becomes credit
      const delta = (line.credit || 0) - (line.debit || 0); // reverse delta
      if (Math.abs(delta) < 0.001) continue;

      const parentCodes = getParentCodes(line.accountCode);
      const codesToUpdate = [line.accountCode, ...parentCodes];

      for (const c of codesToUpdate) {
        const accEntry = accByCode[c];
        if (accEntry) {
          const firstChar = c.trim().charAt(0);
          const isCreditNormal = ["2", "3", "4"].includes(firstChar);
          const incrementValue = isCreditNormal ? -delta : delta;

          const updateFields = {
            balance: increment(incrementValue),
            updatedAt: serverTimestamp(),
          };

          const debitDelta = -(line.debit || 0);
          const creditDelta = -(line.credit || 0);
          if (Math.abs(debitDelta) > 0) updateFields.totalDebit = increment(debitDelta);
          if (Math.abs(creditDelta) > 0) updateFields.totalCredit = increment(creditDelta);

          batchRev.update(accEntry.ref, updateFields);
          batchRevHasWrites = true;
        }
      }
    }
    if (batchRevHasWrites) await batchRev.commit();
  }

  // Step 2: Save the updated journal entry
  await updateDoc(jeRef, {
    date: date || null,
    description: description || null,
    reference: reference || null,
    lines: sanitizedLines,
    totalDebit:  Math.round(totalDebit  * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    status: status || "posted",
    updatedAt: serverTimestamp()
  });

  // Step 3: Apply NEW balance updates (if new status is posted)
  if (status === "posted") {
    const batchApp = writeBatch(db);
    let batchAppHasWrites = false;
    for (const line of sanitizedLines) {
      if (!line.accountCode) continue;
      const delta = (line.debit || 0) - (line.credit || 0);
      if (Math.abs(delta) < 0.001) continue;

      const parentCodes = getParentCodes(line.accountCode);
      const codesToUpdate = [line.accountCode, ...parentCodes];

      for (const c of codesToUpdate) {
        const accEntry = accByCode[c];
        if (accEntry) {
          const firstChar = c.trim().charAt(0);
          const isCreditNormal = ["2", "3", "4"].includes(firstChar);
          const incrementValue = isCreditNormal ? -delta : delta;

          const updateFields = {
            balance: increment(incrementValue),
            updatedAt: serverTimestamp(),
          };

          const debitDelta = line.debit || 0;
          const creditDelta = line.credit || 0;
          if (debitDelta > 0) updateFields.totalDebit = increment(debitDelta);
          if (creditDelta > 0) updateFields.totalCredit = increment(creditDelta);

          batchApp.update(accEntry.ref, updateFields);
          batchAppHasWrites = true;
        }
      }
    }
    if (batchAppHasWrites) await batchApp.commit();
  }
}


// ──────────────────────────────────────────
// Idempotent Operation Lock (prevent double-submit)
// ──────────────────────────────────────────
export async function withIdempotencyLock(lockKey, operation) {
  const lockRef = doc(db, `companies/${COMPANY_ID}/locks`, lockKey);

  await runTransaction(db, async (tx) => {
    const lockSnap = await tx.get(lockRef);
    if (lockSnap.exists()) {
      const lockAge = Date.now() - lockSnap.data().createdAt?.toMillis();
      if (lockAge < 30000) { // 30 second lock
        throw new Error("العملية قيد التنفيذ بالفعل");
      }
    }
    tx.set(lockRef, { createdAt: serverTimestamp(), key: lockKey });
  });

  try {
    const result = await operation();
    await deleteDoc(lockRef);
    return result;
  } catch (err) {
    await deleteDoc(lockRef).catch(() => {});
    throw err;
  }
}

// ──────────────────────────────────────────
// Batch Write Helper
// ──────────────────────────────────────────
export async function batchCreate(colRef, items) {
  const BATCH_SIZE = 499;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + BATCH_SIZE);
    chunk.forEach(item => {
      const ref = doc(colRef);
      batch.set(ref, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }
}

// ──────────────────────────────────────────
// Auto Cash Box Transaction
// يُحدِّث رصيد الصندوق الافتراضي تلقائياً عند
// حفظ فاتورة نقدية (مبيعات أو مشتريات)
//
// type = "in"  → مبيعات نقدية (تزيد الصندوق)
// type = "out" → مشتريات نقدية (تُنقص الصندوق)
// ──────────────────────────────────────────
export async function autoCashTransaction({ type, amount, notes, sourceType, sourceId, date, cashBoxId }) {
  if (!amount || amount <= 0) return null;

  try {
    let boxRef = null;
    let boxId = cashBoxId;

    if (boxId) {
      boxRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, boxId);
      const snap = await getDoc(boxRef);
      if (!snap.exists()) {
        console.warn(`[autoCashTransaction] Cash box not found: ${boxId} - falling back to default`);
        boxId = null;
      }
    }

    if (!boxId) {
      // Find default cash box (first one, or named "رئيسية" / "main")
      const boxSnap = await getDocs(
        query(collection(db, `companies/${COMPANY_ID}/cashBoxes`), limit(10))
      );
      if (boxSnap.empty) {
        console.warn("[autoCashTransaction] No cash box found — skipping cash update");
        return null;
      }

      // Prefer box named رئيسية or الرئيسي, else take first
      let boxDoc = boxSnap.docs.find(d => {
        const n = (d.data().name || "").toLowerCase();
        return n.includes("رئيسي") || n.includes("main") || n.includes("default");
      }) || boxSnap.docs[0];

      boxRef = boxDoc.ref;
      boxId = boxDoc.id;
    }

    let balanceAfter = 0;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(boxRef);
      const current = snap.exists() ? (snap.data().balance || 0) : 0;
      const delta   = type === "in" ? +amount : -amount;
      balanceAfter  = current + delta;

      // Allow negative for purchases (supplier owes us context) but warn
      tx.update(boxRef, { balance: balanceAfter, updatedAt: serverTimestamp() });

      const txnRef = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
      tx.set(txnRef, {
        cashBoxId: boxId,
        type,
        amount,
        notes: notes || (type === "in" ? "إيراد نقدي" : "صرف نقدي"),
        sourceType: sourceType || "invoice",
        sourceId:   sourceId   || null,
        date:       date       || new Date().toISOString().split("T")[0],
        balanceAfter,
        createdAt: serverTimestamp(),
        isAuto: true,   // flag: generated automatically by the system
      });
    });

    clearERPCache(COLS.cashBoxes().path);
    clearERPCache(COLS.cashTransactions().path);
    console.log(`[autoCashTransaction] ${type} ${amount} → box ${boxId}, balance now ${balanceAfter}`);
    return balanceAfter;
  } catch (err) {
    console.warn("[autoCashTransaction] Failed (non-fatal):", err.message);
    return null;
  }
}

// ──────────────────────────────────────────
// Auto Bank Account Transaction
// يُحدِّث رصيد البنك الافتراضي تلقائياً عند
// حفظ فاتورة بالتحويل أو الشبكة أو الشيك
//
// type = "in"  → مبيعات تحويل (تزيد البنك)
// type = "out" → مشتريات بالتحويل (تُنقص البنك)
// ──────────────────────────────────────────
export async function autoBankTransaction({ type, amount, notes, sourceType, sourceId, date }) {
  if (!amount || amount <= 0) return null;
  try {
    const bankSnap = await getDocs(
      query(collection(db, `companies/${COMPANY_ID}/bankAccounts`), limit(10))
    );
    if (bankSnap.empty) {
      console.warn("[autoBankTransaction] No bank accounts found — skipping bank update");
      return null;
    }
    // Prefer default / main bank, else first
    let bankDoc = bankSnap.docs.find(d => {
      const n = (d.data().name || "").toLowerCase();
      return n.includes("رئيسي") || n.includes("main") || n.includes("default") || n.includes("أهلي") || n.includes("الأهلي");
    }) || bankSnap.docs[0];

    const bankRef = bankDoc.ref;
    let balanceAfter = 0;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(bankRef);
      const current = snap.exists() ? (snap.data().balance || 0) : 0;
      const delta   = type === "in" ? +amount : -amount;
      balanceAfter  = current + delta;

      tx.update(bankRef, { balance: balanceAfter, updatedAt: serverTimestamp() });

      const txnRef = doc(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
      tx.set(txnRef, {
        bankAccountId: bankDoc.id,
        type,
        amount,
        notes: notes || (type === "in" ? "إيراد بنكي" : "صرف بنكي"),
        sourceType: sourceType || "invoice",
        sourceId:   sourceId   || null,
        date:       date       || new Date().toISOString().split("T")[0],
        balanceAfter,
        createdAt: serverTimestamp(),
        isAuto: true,
      });
    });

    console.log(`[autoBankTransaction] ${type} ${amount} → bank ${bankDoc.id}, balance now ${balanceAfter}`);
    return balanceAfter;
  } catch (err) {
    console.warn("[autoBankTransaction] Failed (non-fatal):", err.message);
    return null;
  }
}

// ──────────────────────────────────────────
// isPeriodClosed
// يتحقق مما إذا كانت الفترة المالية (الشهر)
// قد تم إقفالها مخزنياً/مالياً لمنع التلاعب بأثر رجعي
// ──────────────────────────────────────────
export async function isPeriodClosed(dateStr) {
  if (!dateStr) return false;
  try {
    const monthStr = dateStr.substring(0, 7); // YYYY-MM
    // Import Firestore collection group querying helper dynamically or query settings
    const q = query(
      COLS.settings(),
      where("type", "==", "period_closing"),
      where("period", "==", monthStr),
      where("status", "==", "closed"),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.error("[isPeriodClosed] Error checking period closing status:", err);
    return false;
  }
}

export async function rebuildCoaBalances() {
  try {
    const expectedHeaders = new Set([
      "1", "1-1", "1-1-1", "1-1-1-1", "1-1-1-2", "1-1-1-3",
      "1-1-2", "1-1-2-1", "1-1-2-1-1", "1-1-2-1-2", "1-1-2-2",
      "1-1-3", "1-1-4", "1-1-4-1", "1-1-4-2", "1-1-5", "1-1-5-1",
      "1-1-5-4", "1-2", "1-2-1", "1-2-2", "1-2-3", "1-2-4",
      "2", "2-1", "2-1-1", "2-1-1-1", "2-1-1-1-1", "2-1-1-2",
      "2-1-1-2-1", "2-1-2", "2-1-3", "2-1-4", "2-1-5", "2-2",
      "3", "3-1", "4", "4-1", "4-1-1", "4-1-1-1",
      "4-1-1-2", "4-1-3", "5", "5-1", "5-1-1",
      "5-2", "5-3", "5-4", "5-4-1", "5-4-2", "5-4-3",
      "5-5", "5-6", "5-7"
    ]);

    const jeSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`));
    const debitByCode = {};
    const creditByCode = {};

    jeSnap.docs.forEach(d => {
      const je = d.data();
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

    const accSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
    
    // Build a set of all codes that act as parents in the COA
    const parentCodes = new Set();
    accSnap.docs.forEach(docSnap => {
      const parent = docSnap.data().parentCode;
      if (parent) parentCodes.add(parent);
    });

    const accountsMap = {};
    const accountsList = [];

    accSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const code = data.code;
      if (!code) return;

      const correctedNodeType = (expectedHeaders.has(code) || parentCodes.has(code)) ? "header" : "detail";

      const accInfo = {
        ref: docSnap.ref,
        code: code,
        name: data.name,
        type: data.type,
        nodeType: correctedNodeType,
        parentCode: data.parentCode || null,
        normalBalance: data.normalBalance || (["asset", "expense"].includes(data.type) ? "debit" : "credit"),
        totalDebit: Math.round((debitByCode[code] || 0) * 100) / 100,
        totalCredit: Math.round((creditByCode[code] || 0) * 100) / 100,
        balance: 0
      };

      if (accInfo.nodeType !== "header") {
        const delta = accInfo.totalDebit - accInfo.totalCredit;
        const isCredit = accInfo.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(accInfo.type);
        accInfo.balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
      }

      accountsMap[code] = accInfo;
      accountsList.push(accInfo);
    });

    function getTreeDepth(code, visited = new Set()) {
      const a = accountsMap[code];
      if (!a || !a.parentCode || !accountsMap[a.parentCode]) return 0;
      if (visited.has(code)) return 0;
      visited.add(code);
      return 1 + getTreeDepth(a.parentCode, visited);
    }

    accountsList.forEach(a => {
      a.treeDepth = getTreeDepth(a.code);
    });

    const sortedAccounts = [...accountsList].sort((a, b) => b.treeDepth - a.treeDepth);

    for (const acc of sortedAccounts) {
      if (acc.parentCode && accountsMap[acc.parentCode]) {
        const parent = accountsMap[acc.parentCode];
        parent.totalDebit = Math.round((parent.totalDebit + acc.totalDebit) * 100) / 100;
        parent.totalCredit = Math.round((parent.totalCredit + acc.totalCredit) * 100) / 100;
      }
    }

    accountsList.forEach(acc => {
      const delta = acc.totalDebit - acc.totalCredit;
      const isCredit = acc.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(acc.type);
      acc.balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
    });

    const batch = writeBatch(db);
    for (const acc of accountsList) {
      batch.update(acc.ref, {
        nodeType: acc.nodeType,
        balance: acc.balance,
        totalDebit: acc.totalDebit,
        totalCredit: acc.totalCredit,
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
    console.log("[AccountingEngine] Successfully rebuilt COA tree balances bottom-up.");
  } catch (err) {
    console.error("[AccountingEngine] COA Rebuild failed:", err.message);
  }
}


