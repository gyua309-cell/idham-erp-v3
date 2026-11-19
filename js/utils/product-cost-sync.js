// ============================================================
// IDHAM ERP — Product Purchase Price & Cost Synchronization Engine
// ============================================================
import { COLS, getAll, update } from "./db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { doc, getDocs, writeBatch, serverTimestamp } from "./db.js";

/**
 * Calculates and updates lastPurchasePrice, avgCostPrice, and lastPurchaseDate
 * for all products based on active warehouse stock and historical purchase invoices (WAC / FIFO stock coverage).
 * @param {boolean} [silent=false] - Whether to suppress toasts
 * @returns {Promise<{updatedCount: number, productsMap: Object}>}
 */
export async function syncProductCostsFromPurchaseInvoices(silent = false) {
  try {
    // 1. Fetch all active purchase invoices, all products, and warehouse stock
    const [invoices, allProducts, stockDocs] = await Promise.all([
      getAll(COLS.purchaseInvoices()),
      getAll(COLS.products()),
      getAll(COLS.stockByWarehouse())
    ]);

    const validInvoices = (invoices || []).filter(inv => 
      inv.status !== "cancelled" && inv.status !== "ملغاة" && inv.status !== "draft"
    );

    // Map current stock on hand across all warehouses
    const currentStockMap = {};
    (stockDocs || []).forEach(s => {
      if (s.productId) {
        currentStockMap[s.productId] = (currentStockMap[s.productId] || 0) + (parseFloat(s.qty) || 0);
      }
    });

    // Sort invoices chronologically (oldest to newest)
    validInvoices.sort((a, b) => {
      const dateA = a.date || (a.createdAt?.toDate ? a.createdAt.toDate().toISOString() : "") || "";
      const dateB = b.date || (b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : "") || "";
      return dateA.localeCompare(dateB);
    });

    // 2. Map purchases per product
    const productPurchases = {};

    validInvoices.forEach(inv => {
      const invDate = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "") || "";
      const supplierName = inv.supplierName || inv.supplier || "";
      const invNumber = inv.number || inv.invoiceNumber || "";
      const lines = inv.lines || inv.items || [];
      
      const globalDiscountAmt = parseFloat(inv.globalDiscountAmount || inv.discountAmount || inv.discountTotal || 0) || 0;
      let totalLinesGross = 0;
      
      lines.forEach(line => {
        const qty = parseFloat(line.qty) || 0;
        const uPrice = parseFloat(line.unitPrice || line.price || line.cost || 0) || 0;
        totalLinesGross += (qty * uPrice);
      });

      lines.forEach(line => {
        const pid = line.productId;
        if (!pid) return;

        const qty = parseFloat(line.qty) || 0;
        const bonusQty = parseFloat(line.bonusQty) || 0;
        const physicalQty = qty + bonusQty;
        const rawUnitPrice = parseFloat(line.unitPrice || line.price || line.cost || 0) || 0;

        if (physicalQty <= 0 || rawUnitPrice <= 0) return;

        // Calculate effective net unit price after item discount and proportional global discount
        const lineGross = qty * rawUnitPrice;
        const lineDiscVal = parseFloat(line.discount) || 0;
        const lineDiscAmount = lineDiscVal <= 100 && lineDiscVal > 0 && line.discountType !== "amount"
          ? lineGross * (lineDiscVal / 100)
          : (lineDiscVal > 0 ? lineDiscVal : 0);

        const lineAfterLineDisc = Math.max(0, lineGross - lineDiscAmount);
        const globalDiscPortion = totalLinesGross > 0 ? (lineAfterLineDisc / totalLinesGross) * globalDiscountAmt : 0;
        const netLinePaid = Math.max(0, lineAfterLineDisc - globalDiscPortion);
        const effectiveNetUnitPrice = physicalQty > 0 ? (netLinePaid / physicalQty) : rawUnitPrice;

        if (!productPurchases[pid]) {
          productPurchases[pid] = {
            totalSpend: 0,
            totalQty: 0,
            lastPurchasePrice: 0,
            lastPurchaseDate: "",
            lastSupplierName: "",
            lastInvoiceNumber: "",
            history: []
          };
        }

        const entry = {
          date: invDate,
          unitCost: Math.round(effectiveNetUnitPrice * 100) / 100,
          qty: physicalQty,
          supplierName,
          invoiceNumber: invNumber
        };

        productPurchases[pid].totalSpend += (effectiveNetUnitPrice * physicalQty);
        productPurchases[pid].totalQty += physicalQty;
        productPurchases[pid].lastPurchasePrice = entry.unitCost;
        productPurchases[pid].lastPurchaseDate = invDate || productPurchases[pid].lastPurchaseDate;
        productPurchases[pid].lastSupplierName = supplierName || productPurchases[pid].lastSupplierName;
        productPurchases[pid].lastInvoiceNumber = invNumber || productPurchases[pid].lastInvoiceNumber;
        productPurchases[pid].history.push(entry);
      });
    });

    // 3. Update products with True Inventory Cost (WAC / Active FIFO Stock Coverage)
    let batch = writeBatch(db);
    let batchOpCount = 0;
    let updatedCount = 0;
    const productsMap = {};

    for (const prod of allProducts) {
      const stats = productPurchases[prod.id];
      const updates = {};
      let hasChanges = false;

      if (stats && stats.history.length > 0) {
        // حساب تكلفة المخزون الفعلي المتبقي في المستودع (من الأحدث فالأقدم):
        // إذا كان المخزون القديم قد نَفَد بالكامل، فإن التكلفة الفعلية هي تكلفة الشراء الحديث فقط
        const historyDesc = [...stats.history].reverse();
        const stockQty = Math.max(0, currentStockMap[prod.id] !== undefined ? currentStockMap[prod.id] : (parseFloat(prod.totalQty) || 0));
        let calculatedAvg = stats.lastPurchasePrice;

        if (stockQty > 0) {
          let remainingNeeded = stockQty;
          let totalCostCovered = 0;
          let coveredQty = 0;

          for (const pur of historyDesc) {
            const take = Math.min(remainingNeeded, pur.qty);
            totalCostCovered += (take * pur.unitCost);
            coveredQty += take;
            remainingNeeded -= take;
            if (remainingNeeded <= 0) break;
          }

          if (coveredQty > 0) {
            calculatedAvg = Math.round((totalCostCovered / coveredQty) * 100) / 100;
          }
        }

        const calculatedLast = stats.lastPurchasePrice;

        if (prod.lastPurchasePrice !== calculatedLast) {
          updates.lastPurchasePrice = calculatedLast;
          hasChanges = true;
        }
        if (stats.lastPurchaseDate && prod.lastPurchaseDate !== stats.lastPurchaseDate) {
          updates.lastPurchaseDate = stats.lastPurchaseDate;
          hasChanges = true;
        }
        if (stats.lastSupplierName && prod.lastSupplierName !== stats.lastSupplierName) {
          updates.lastSupplierName = stats.lastSupplierName;
          hasChanges = true;
        }
        if (prod.avgCostPrice !== calculatedAvg) {
          updates.avgCostPrice = calculatedAvg;
          hasChanges = true;
        }
        if (prod.averageCost !== calculatedAvg) {
          updates.averageCost = calculatedAvg;
          hasChanges = true;
        }
        if (prod.costPrice !== calculatedAvg) {
          updates.costPrice = calculatedAvg;
          hasChanges = true;
        }

        productsMap[prod.id] = {
          lastPurchasePrice: calculatedLast,
          avgCostPrice: calculatedAvg,
          averageCost: calculatedAvg,
          costPrice: calculatedAvg,
          lastPurchaseDate: stats.lastPurchaseDate,
          lastSupplierName: stats.lastSupplierName
        };
      } else {
        // If product has no purchase invoices yet, ensure avgCostPrice falls back to costPrice/purchasePrice
        const fallbackCost = Number(prod.costPrice || prod.purchasePrice || prod.averageCost || 0);
        if (fallbackCost > 0 && !prod.avgCostPrice) {
          updates.avgCostPrice = fallbackCost;
          hasChanges = true;
        }
        if (fallbackCost > 0 && !prod.lastPurchasePrice) {
          updates.lastPurchasePrice = fallbackCost;
          hasChanges = true;
        }
        productsMap[prod.id] = {
          lastPurchasePrice: prod.lastPurchasePrice || fallbackCost,
          avgCostPrice: prod.avgCostPrice || fallbackCost,
          averageCost: prod.averageCost || fallbackCost,
          costPrice: prod.costPrice || fallbackCost,
          lastPurchaseDate: prod.lastPurchaseDate || "",
          lastSupplierName: prod.lastSupplierName || ""
        };
      }

      if (hasChanges) {
        const prodRef = doc(db, `companies/${COMPANY_ID}/products`, prod.id);
        batch.update(prodRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        batchOpCount++;
        updatedCount++;

        if (batchOpCount >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          batchOpCount = 0;
        }
      }
    }

    if (batchOpCount > 0) {
      await batch.commit();
    }
    console.log(`[ProductCostSync] Successfully synced purchase prices for ${updatedCount} products to Firestore`);

    if (!silent && window.showToast) {
      window.showToast(`تم تحديث آخر أسعار شراء ومتوسط التكلفة لـ (${Object.keys(productPurchases).length}) صنف من الفواتير بنجاح ✅`, "success");
    }

    return { updatedCount, productsMap };
  } catch (err) {
    console.error("[ProductCostSync] Sync failed:", err);
    if (!silent && window.showToast) {
      window.showToast("فشل تحديث أسعار الشراء: " + err.message, "error");
    }
    return { updatedCount: 0, productsMap: {} };
  }
}

// Global hook for buttons and console
window.syncAllProductPurchasePrices = async function(btn) {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> جارٍ التحديث من الفواتير…`;
  }
  try {
    await syncProductCostsFromPurchaseInvoices(false);
    if (window.loadProducts) await window.loadProducts(true);
    if (window.loadPriceMatrix) await window.loadPriceMatrix();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🔄</span> تحديث أسعار الشراء من الفواتير`;
    }
  }
};
