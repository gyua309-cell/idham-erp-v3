// ============================================================
// IDHAM ERP — Firestore Database Utilities
// Atomic transactions, CRUD helpers, stock & accounting ops
// ============================================================

import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  runTransaction, serverTimestamp, writeBatch,
  increment, Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { db, COMPANY_ID } from "../firebase-config.js";

// Re-export Firestore primitives for use in modules
export { query, where, orderBy, limit, startAfter, getDocs, getDoc,
         serverTimestamp, doc, Timestamp, increment, setDoc, collection, runTransaction, updateDoc, deleteDoc, writeBatch };

// ──────────────────────────────────────────
// Collection references
// ──────────────────────────────────────────
export const COLS = {
  products:          () => collection(db, `companies/${COMPANY_ID}/products`),
  categories:        () => collection(db, `companies/${COMPANY_ID}/categories`),
  units:             () => collection(db, `companies/${COMPANY_ID}/units`),
  priceLists:        () => collection(db, `companies/${COMPANY_ID}/priceLists`),
  warehouses:        () => collection(db, `companies/${COMPANY_ID}/warehouses`),
  stockByWarehouse:  () => collection(db, `companies/${COMPANY_ID}/stockByWarehouse`),
  stockTransactions: () => collection(db, `companies/${COMPANY_ID}/stockTransactions`),
  customers:         () => collection(db, `companies/${COMPANY_ID}/customers`),
  suppliers:         () => collection(db, `companies/${COMPANY_ID}/suppliers`),
  salesReps:         () => collection(db, `companies/${COMPANY_ID}/salesReps`),
  salesInvoices:     () => collection(db, `companies/${COMPANY_ID}/salesInvoices`),
  purchaseInvoices:  () => collection(db, `companies/${COMPANY_ID}/purchaseInvoices`),
  salesReturns:      () => collection(db, `companies/${COMPANY_ID}/salesReturns`),
  purchaseReturns:   () => collection(db, `companies/${COMPANY_ID}/purchaseReturns`),
  chartOfAccounts:   () => collection(db, `companies/${COMPANY_ID}/chartOfAccounts`),
  journalEntries:    () => collection(db, `companies/${COMPANY_ID}/journalEntries`),
  receipts:          () => collection(db, `companies/${COMPANY_ID}/receipts`),
  cashBoxes:         () => collection(db, `companies/${COMPANY_ID}/cashBoxes`),
  cashTransactions:  () => collection(db, `companies/${COMPANY_ID}/cashTransactions`),
  bankAccounts:      () => collection(db, `companies/${COMPANY_ID}/bankAccounts`),
  bankTransactions:  () => collection(db, `companies/${COMPANY_ID}/bankTransactions`),
  expenses:          () => collection(db, `companies/${COMPANY_ID}/expenses`),
  employees:         () => collection(db, `companies/${COMPANY_ID}/employees`),
  quotations:        () => collection(db, `companies/${COMPANY_ID}/quotations`),
  cheques:           () => collection(db, `companies/${COMPANY_ID}/cheques`),
  purchaseRequests:  () => collection(db, `companies/${COMPANY_ID}/purchaseRequests`),
  purchaseOrders:    () => collection(db, `companies/${COMPANY_ID}/purchaseOrders`),
  goodsReceiptPOs:   () => collection(db, `companies/${COMPANY_ID}/goodsReceiptPOs`),
  qualityInspections:() => collection(db, `companies/${COMPANY_ID}/qualityInspections`),
  inventoryAdjustments:() => collection(db, `companies/${COMPANY_ID}/inventoryAdjustments`),
  productAssemblies: () => collection(db, `companies/${COMPANY_ID}/productAssemblies`),
  physicalCounts:    () => collection(db, `companies/${COMPANY_ID}/physicalCounts`),
  auditTrails:       () => collection(db, `companies/${COMPANY_ID}/auditTrails`),
  settings:          () => collection(db, `companies/${COMPANY_ID}/settings`),
  users:             () => collection(db, `companies/${COMPANY_ID}/users`),
  counters:          () => collection(db, `companies/${COMPANY_ID}/counters`),
  locations:         () => collection(db, `companies/${COMPANY_ID}/locations`),
  costCenters:       () => collection(db, `companies/${COMPANY_ID}/costCenters`),
  employeeLoans:     () => collection(db, `companies/${COMPANY_ID}/employeeLoans`),
  payrolls:          () => collection(db, `companies/${COMPANY_ID}/payrolls`),
  employeeLeaves:    () => collection(db, `companies/${COMPANY_ID}/employeeLeaves`),
  employeeAttendance:() => collection(db, `companies/${COMPANY_ID}/employeeAttendance`),
  employeeSettlements:() => collection(db, `companies/${COMPANY_ID}/employeeSettlements`),
};

// ──────────────────────────────────────────
// Two-Tier Client Cache
// L1 = window.ERP_CACHE (in-memory, 5 min TTL)
// L2 = localStorage     (30 min TTL, survives refresh)
// Smart invalidation: only clears affected collection
// ──────────────────────────────────────────
const L1_TTL = 15 * 60 * 1000;   // 15 دقيقة (كانت 5)
const L2_TTL = 2 * 60 * 60 * 1000;  // ساعتين (كانت 30 دقيقة)
const L2_PREFIX = "erp_c_";

// Force clear cache once for version update to reflect the new account balances
try {
  if (localStorage.getItem("erp_cache_version") !== "1.2.0") {
    Object.keys(localStorage)
      .filter(k => k.startsWith(L2_PREFIX))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem("erp_cache_version", "1.2.0");
    console.log("[Cache] Force cleared local cache due to version update v1.2.0 — auto-sync enabled.");
  }
} catch (e) {
  console.warn("Failed to check or clear localStorage cache version:", e);
}

if (!window.ERP_CACHE) window.ERP_CACHE = {};

function l2Get(key) {
  try {
    const raw = localStorage.getItem(L2_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > L2_TTL) { localStorage.removeItem(L2_PREFIX + key); return null; }
    return data;
  } catch { return null; }
}
function l2Set(key, data) {
  try { localStorage.setItem(L2_PREFIX + key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}
function l2Del(key) {
  try { localStorage.removeItem(L2_PREFIX + key); } catch {}
}

/**
 * Clear cache for a specific collection path (or all if no path given).
 * Smart: updating products won't evict suppliers/customers cache.
 */
export function clearERPCache(colPath = null) {
  if (colPath) {
    // Clear L1 (in-memory) — exact + compound keys
    delete window.ERP_CACHE[colPath];
    Object.keys(window.ERP_CACHE)
      .filter(k => k.startsWith(colPath))
      .forEach(k => delete window.ERP_CACHE[k]);
    // Clear L2 (localStorage) — exact + compound keys (e.g. salesReps__orderBy)
    Object.keys(localStorage)
      .filter(k => k.startsWith(L2_PREFIX + colPath))
      .forEach(k => localStorage.removeItem(k));
  } else {
    // Full clear
    window.ERP_CACHE = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(L2_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
}

// ──────────────────────────────────────────
// CRUD Helpers
// ──────────────────────────────────────────
export async function create(colRef, data) {
  clearERPCache(colRef.path);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function update(collectionName, id, data) {
  const colPath = `companies/${COMPANY_ID}/${collectionName}`;
  clearERPCache(colPath);
  const docRef = doc(db, colPath, id);
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
    const oldJE = jeSnap.data();

    // Fetch all accounts once
    const accSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
    const accByCode = {};
    accSnap.docs.forEach(d => {
      accByCode[d.data().code] = { ref: d.ref, data: d.data() };
    });

    // Step 1: Reverse OLD balance updates (if it was posted)
    if (oldJE && oldJE.status === "posted" && oldJE.lines) {
      const batchRev = writeBatch(db);
      let batchRevHasWrites = false;
      for (const line of oldJE.lines) {
        if (!line.accountCode) continue;
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

    // Step 2: Delete the document
    await deleteDoc(jeRef);
  } catch (err) {
    console.error("[deleteJournalEntry] Failed to reverse balance and delete JE:", err);
    throw err;
  }
}

export async function remove(collectionName, id) {
  const colPath = `companies/${COMPANY_ID}/${collectionName}`;
  clearERPCache(colPath);
  if (collectionName === "journalEntries") {
    await deleteJournalEntry(id);
  } else {
    const docRef = doc(db, colPath, id);
    await deleteDoc(docRef);
  }
}

export async function getById(collectionName, id) {
  const cacheKey = `companies/${COMPANY_ID}/${collectionName}/${id}`;
  // L1 check
  const l1 = window.ERP_CACHE[cacheKey];
  if (l1 && Date.now() - l1.ts < L1_TTL) return l1.data;
  // L2 check
  const l2 = l2Get(cacheKey);
  if (l2) { window.ERP_CACHE[cacheKey] = { data: l2, ts: Date.now() }; return l2; }

  const docRef = doc(db, `companies/${COMPANY_ID}/${collectionName}`, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const result = { id: snap.id, ...snap.data() };
  window.ERP_CACHE[cacheKey] = { data: result, ts: Date.now() };
  l2Set(cacheKey, result);
  return result;
}

export async function getAll(colRef, constraints = []) {
  // توسيع نطاق الـ Cache ليشمل أي مزيج من orderBy + limit + where
  const isCacheable = constraints.every(c =>
    c?.type === "orderBy" || c?.type === "limit" || c?.type === "where"
  );

  // مفتاح فريد يشمل قيم الفلاتر أيضاً
  const cacheKey = colRef.path + (constraints.length
    ? "__" + constraints.map(c => {
        if (!c) return "null";
        if (c.type === "where") return `where_${c.field?.segments?.join(".") || ""}_${String(c.value)}`;
        return c.type || String(c);
      }).join("_")
    : "");

  if (isCacheable) {
    // L1 check (أسرع)
    const l1 = window.ERP_CACHE[cacheKey];
    if (l1 && Date.now() - l1.ts < L1_TTL) return [...l1.data];
    // L2 check (localStorage — يبقى بعد الإغلاق)
    const l2 = l2Get(cacheKey);
    if (l2) {
      window.ERP_CACHE[cacheKey] = { data: l2, ts: Date.now() };
      return [...l2];
    }
  }

  const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (isCacheable) {
    window.ERP_CACHE[cacheKey] = { data, ts: Date.now() };
    try { l2Set(cacheKey, data); } catch(e) {
      // localStorage امتلأ — نستخدم L1 فقط
      console.warn("[Cache] localStorage full, using L1 only");
    }
  }

  return data;
}

export async function getPaginated(colRef, constraints, pageSize = 50, lastDoc = null) {
  const qConstraints = [...constraints, limit(pageSize + 1)];
  if (lastDoc) qConstraints.push(startAfter(lastDoc));
  const q = query(colRef, ...qConstraints);
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > pageSize;
  const docs = snap.docs.slice(0, pageSize).map(d => ({ id: d.id, ...d.data() }));
  const lastSnapshot = snap.docs[Math.min(pageSize - 1, snap.docs.length - 1)] || null;
  return { docs, hasMore, lastSnapshot };
}

// ──────────────────────────────────────────
// Invoice Number Generation (Atomic Counter)
// Max 3 retries with exponential backoff to prevent infinite loop / quota exhaustion
// ──────────────────────────────────────────
export async function generateInvoiceNumber(prefix = "INV") {
  const counterRef = doc(db, `companies/${COMPANY_ID}/counters`, prefix.toLowerCase());
  const MAX_RETRIES = 3;

  // Determine collection name
  let colName = "";
  const p = prefix.toUpperCase();
  if (p === "INV") colName = "salesInvoices";
  else if (p === "PUR") colName = "purchaseInvoices";
  else if (p === "RFQ") colName = "purchaseRequests";
  else if (p === "DN") colName = "purchaseReturns";
  else if (p === "QT") colName = "quotations";
  else if (p === "CN") colName = "salesReturns";
  else if (p === "TR") colName = "stockTransfers";

  // Fetch max number in database
  let maxSeq = 0;
  if (colName) {
    try {
      const colRef = collection(db, `companies/${COMPANY_ID}/${colName}`);
      const q = query(colRef, orderBy("number", "desc"), limit(20));
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        const numStr = d.data().number || "";
        const match = numStr.match(/\d+/);
        if (match) {
          const val = parseInt(match[0]);
          if (val > maxSeq) maxSeq = val;
        }
      });
    } catch (e) {
      console.error("generateInvoiceNumber: failed to read max doc number, using counter fallback", e);
    }
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let number;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        // Ensure seq is at least maxSeq + 1 (respecting deletions/rollbacks)
        let seq = maxSeq + 1;
        if (snap.exists()) {
          const storedSeq = snap.data().seq || 0;
          // If storedSeq is greater, we can use it, but if they deleted records we want to reset to maxSeq + 1
          // This ensures strict sequential numbering based on actual documents in the collection
          seq = maxSeq + 1;
        }
        tx.set(counterRef, { seq, updatedAt: serverTimestamp() });
        number = `${prefix}-${String(seq).padStart(6, "0")}`;
      });
      return number;  // ✅ success
    } catch (err) {
      const isQuotaOrPermission =
        err?.code === "resource-exhausted" ||
        err?.code === "permission-denied"  ||
        err?.message?.includes("429");

      if (attempt < MAX_RETRIES && !isQuotaOrPermission) {
        await new Promise(r => setTimeout(r, attempt * 1000));
        continue;
      }

      const ts = Date.now().toString(36).toUpperCase();
      console.warn(`[Counter] ${prefix} — fallback after ${attempt} attempts:`, err?.code || err?.message);
      return `${prefix}-T${ts}`;
    }
  }

  return `${prefix}-T${Date.now().toString(36).toUpperCase()}`;
}

// ──────────────────────────────────────────
// Stock Operations (Atomic)
// ──────────────────────────────────────────
export async function adjustStock(warehouseId, productId, qtyDelta, metadata = {}) {
  clearERPCache();
  if (!warehouseId || !productId) throw new Error("warehouseId and productId are required");

  const stockDocId = `${warehouseId}_${productId}`;
  const stockRef   = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId);
  const txnRef     = doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
  const sysRef     = doc(db, `companies/${COMPANY_ID}/settings`, "system");

  await runTransaction(db, async (tx) => {
    // 1. PERFORM ALL READS FIRST
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
  clearERPCache();
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

    // Execute all reads in parallel
    const stockSnaps = await Promise.all(stockRefs.map(ref => tx.get(ref)));
    const prodSnaps = await Promise.all(prodRefs.map(ref => tx.get(ref)));

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
      const firstAdj = adjustments.find(a => a.productId === productId);
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
    for (const adj of adjustments) {
      const { warehouseId, productId, qtyDelta, metadata = {} } = adj;
      if (!warehouseId || !productId) continue;

      const stockDocId = `${warehouseId}_${productId}`;
      const stockSnap = stockSnapMap[stockDocId];
      const currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
      
      if (uniqueStocks[stockDocId].runningQty === undefined) {
        uniqueStocks[stockDocId].runningQty = currentQty;
      }
      const qtyBefore = uniqueStocks[stockDocId].runningQty;
      const qtyAfter = qtyBefore + qtyDelta;
      uniqueStocks[stockDocId].runningQty = qtyAfter;

      const reorderLevel = stockSnap.exists() ? (stockSnap.data().reorderLevel || 0) : 0;
      const stockStatus = qtyAfter <= 0 ? "out" : (reorderLevel > 0 && qtyAfter <= reorderLevel ? "low" : "ok");

      const stockRef = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId);
      tx.set(stockRef, {
        warehouseId, productId,
        qty: qtyAfter,
        stockStatus,
        reorderLevel,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const txnRef = doc(collection(db, `companies/${COMPANY_ID}/stockTransactions`));
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getStockForWarehouse(warehouseId) {
  const q = query(COLS.stockByWarehouse(), where("warehouseId", "==", warehouseId), orderBy("productId"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ──────────────────────────────────────────
// Stock Transfer Between Warehouses (Atomic)
// ──────────────────────────────────────────
export async function transferStock(fromWarehouseId, toWarehouseId, productId, qty, metadata = {}) {
  clearERPCache();
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
  clearERPCache();
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
  // ✅ المزامنة التلقائية: يُحدِّث شجرة الحسابات فور إنشاء أي قيد
  const _applyBalanceUpdate = async () => {
    const batch = writeBatch(db);
    let batchHasWrites = false;

    // Fetch all accounts once
    const accSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
    const accByCode = {};
    accSnap.docs.forEach(d => {
      accByCode[d.data().code] = { ref: d.ref, data: d.data() };
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

          batch.update(accEntry.ref, updateFields);
          batchHasWrites = true;
        }
      }
    }

    if (batchHasWrites) await batch.commit();
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

  // ✅ يُرجع كلاهما: entryNumber (رقم القيد) + id (معرّف Firestore)
  // للتوافق العكسي: الكود القديم كان يستخدم القيمة كـ string مباشرة — الكائن الجديد toString() يُعيد entryNumber
  const result = Object.assign(
    new String(entryNumber),  // toString() / valueOf() => entryNumber (for legacy callers that use it as string)
    { id: entryRef.id, entryNumber }
  );
  return result;
}

export async function updateJournalEntry(id, { date, description, reference, lines, status = "posted" }) {
  clearERPCache();
  
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

  // Fetch all accounts once
  const accSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
  const accByCode = {};
  accSnap.docs.forEach(d => {
    accByCode[d.data().code] = { ref: d.ref, data: d.data() };
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

    const sortedAccounts = [...accountsList].sort((a, b) => {
      const depthA = (a.code.match(/-/g) || []).length;
      const depthB = (b.code.match(/-/g) || []).length;
      return depthB - depthA;
    });

    for (const acc of sortedAccounts) {
      if (acc.parentCode && accountsMap[acc.parentCode]) {
        const parent = accountsMap[acc.parentCode];
        parent.totalDebit = Math.round((parent.totalDebit + acc.totalDebit) * 100) / 100;
        parent.totalCredit = Math.round((parent.totalCredit + acc.totalCredit) * 100) / 100;
        parent.balance = Math.round((parent.balance + acc.balance) * 100) / 100;
      }
    }

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

