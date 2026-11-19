// ============================================================
// IDHAM ERP — Quotations Module v2 (عروض الأسعار)
// ============================================================
import {
  COLS, create, update, remove, getAll,
  query, orderBy, limit, getDocs, where, collection
} from "../utils/db.js";
import { generateInvoiceNumber } from "../utils/db.js";
import { formatCurrency, formatQuantity, formatDate, todayString, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { exportToExcel } from "../utils/excel.js";

// ── State ────────────────────────────────────────────────────
let quotations  = [];
let customers   = [];
let products    = [];
let salesReps   = [];
let categories  = [];
let suppliers   = [];
let supplierPriceLists = [];
let priceLists  = [];
let warehouses  = [];
let stockByWarehouse = [];
let stockByWarehouseMap = {};
let quoteItems  = [];
let activeQuoteId = null;
let _quotesUser = null;

function buildStockIndex() {
  stockByWarehouseMap = {};
  (stockByWarehouse || []).forEach(s => {
    const qty = parseNum(s.qty, 0);
    const pId = s.productId;
    const wId = s.warehouseId;
    if (pId && wId) {
      stockByWarehouseMap[`${wId}_${pId}`] = qty;
    }
    if (pId) {
      stockByWarehouseMap[`total_${pId}`] = (stockByWarehouseMap[`total_${pId}`] || 0) + qty;
    }
  });
}

function getProductStockQty(productId, warehouseId = null) {
  if (!productId) return 0;
  const targetWh = warehouseId !== null ? warehouseId : (document.getElementById("qt-warehouse")?.value || "");
  if (targetWh) {
    const key = `${targetWh}_${productId}`;
    if (stockByWarehouseMap[key] !== undefined) return stockByWarehouseMap[key];
    const found = (stockByWarehouse || []).find(s => s.productId === productId && s.warehouseId === targetWh);
    return parseNum(found?.qty, 0);
  }
  if (stockByWarehouseMap[`total_${productId}`] !== undefined) {
    return stockByWarehouseMap[`total_${productId}`];
  }
  return (stockByWarehouse || [])
    .filter(s => s.productId === productId)
    .reduce((sum, s) => sum + parseNum(s.qty, 0), 0);
}

function getProductStockBreakdown(productId) {
  if (!productId || !warehouses.length) return "";
  const parts = [];
  warehouses.forEach(w => {
    const key = `${w.id}_${productId}`;
    const q = stockByWarehouseMap[key] !== undefined
      ? stockByWarehouseMap[key]
      : parseNum(stockByWarehouse.find(s => s.productId === productId && s.warehouseId === w.id)?.qty, 0);
    if (q > 0) {
      parts.push(`${w.name}: ${q}`);
    }
  });
  return parts.length > 0 ? `المتوفر بالمخازن: ${parts.join(" | ")}` : "لا يوجد رصيد في أي مستودع (الرصيد 0)";
}

function populateWarehouseDropdown(selectedWhId = "") {
  const whSel = document.getElementById("qt-warehouse");
  if (!whSel) return;

  let mainWh = (warehouses || []).find(w => w.isMain || (w.name || "").includes("الرئيس")) || warehouses?.[0];
  const defaultWhId = selectedWhId !== undefined && selectedWhId !== "" ? selectedWhId : (mainWh?.id || "");

  const opts = (warehouses || []).map(w => {
    const icon = w.isMain ? "🏢" : (w.type === "Vehicle" || (w.name || "").includes("سيار") ? "🚐" : "🏬");
    const isSelected = w.id === defaultWhId ? "selected" : "";
    return `<option value="${w.id}" ${isSelected}>${icon} ${w.name}</option>`;
  }).join("");

  whSel.innerHTML = `<option value="">🏢 كل المخازن (رصيد إجمالي)</option>` + opts;
  if (defaultWhId) {
    whSel.value = defaultWhId;
  }
}

window.onQtWarehouseChange = () => {
  renderQuoteLines();
  const input = document.getElementById("qt-product-search");
  if (input && input.value.trim()) {
    input.dispatchEvent(new Event("input"));
  }
};

async function refreshStockByWarehouse() {
  try {
    stockByWarehouse = await getAll(COLS.stockByWarehouse());
    buildStockIndex();
  } catch (e) {
    console.warn("refreshStockByWarehouse error:", e);
  }
}

let plMargins = { retailMargin: 10, wholesaleMargin: 7, distributorMargin: 5 };
let tier1Margins = {
  basic: 4,      // سلع استراتيجية أساسية: زيوت وأرز وسكر ودقيق وحليب (3-5%)
  medium: 8,     // سلع استهلاكية متوسطة: صلصة وإندومي ومعلبات ومكرونة (6-10%)
  high: 13       // أدوات تغليف ومنظفات وبلاستيك (11-15%)
};

async function loadPriceListMargins() {
  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const docRef = doc(db, `companies/${COMPANY_ID}/settings`, "priceListMargins");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.retailMargin !== undefined) plMargins.retailMargin = parseFloat(data.retailMargin);
      if (data.wholesaleMargin !== undefined) plMargins.wholesaleMargin = parseFloat(data.wholesaleMargin);
      if (data.distributorMargin !== undefined) plMargins.distributorMargin = parseFloat(data.distributorMargin);
      if (data.tier1Basic !== undefined) tier1Margins.basic = parseFloat(data.tier1Basic);
      if (data.tier1Medium !== undefined) tier1Margins.medium = parseFloat(data.tier1Medium);
      if (data.tier1High !== undefined) tier1Margins.high = parseFloat(data.tier1High);
    }

    try {
      const t1Ref = doc(db, `companies/${COMPANY_ID}/settings`, "tier1Margins");
      const t1Snap = await getDoc(t1Ref);
      if (t1Snap.exists()) {
        const d = t1Snap.data();
        if (d.basic !== undefined) tier1Margins.basic = parseFloat(d.basic);
        if (d.medium !== undefined) tier1Margins.medium = parseFloat(d.medium);
        if (d.high !== undefined) tier1Margins.high = parseFloat(d.high);
      }
    } catch (_) {}
  } catch (e) {
    console.warn("Failed to load priceListMargins settings:", e);
  }
}

// ── Tier 1 Group Classification ──────────────────────────────
export function getProductTier1Group(prod) {
  if (!prod) return "medium";
  const cat = String(prod.category || "").toLowerCase().trim();
  const name = String(prod.name || prod.nameAr || prod.productName || "").toLowerCase().trim();

  // 1. Basic strategic items (سلع أساسية: زيوت، أرز، سكر، دقيق، حليب، مياه، بيض) -> هامش 3-5%
  const basicCats = [
    "oils", "rice_grains", "dry_goods", "dairy", "egg", "water", "meat_poultry"
  ];
  if (basicCats.includes(cat)) return "basic";
  if (
    name.includes("زيت") || name.includes("أرز") || name.includes("ارز") ||
    name.includes("سمن") || name.includes("سكر") || name.includes("دقيق") ||
    name.includes("طحين") || name.includes("حليب") || name.includes("لبن") ||
    name.includes("بيض") || name.includes("مياه") || name.includes("ماء")
  ) {
    return "basic";
  }

  // Food items: explicitly medium (never high)
  if (
    name.includes("اندومي") || name.includes("إندومي") || name.includes("نودلز") ||
    name.includes("صلصة") || name.includes("صلصه") || name.includes("طماطم") ||
    name.includes("مكرونة") || name.includes("معكرونة") || name.includes("تونة") ||
    name.includes("تونه") || name.includes("شاي") || name.includes("قهوة") ||
    name.includes("بسكويت") || cat === "pasta" || cat === "canned" ||
    cat === "coffee_tea" || cat === "biscuits" || cat === "confectionery" || cat === "spices"
  ) {
    return "medium";
  }

  // 2. High margin items (أدوات تغليف ومنظفات وبلاستيك وورقيات) -> هامش 11-15%
  const highCats = [
    "plastics", "cleaning", "disposables", "personal_care"
  ];
  if (highCats.includes(cat)) return "high";
  if (
    name.includes("منظف") || name.includes("مطهر") || name.includes("صابون") ||
    name.includes("كلور") || name.includes("فيري") || name.includes("ديتول") ||
    name.includes("بلاستيك") || name.includes("سفره") || name.includes("سفرة") ||
    name.includes("أكياس") || name.includes("اكياس") || name.includes("كيس نفايات") ||
    name.includes("كيس قمامة") || name.includes("كيس بلاستيك") ||
    name.includes("تغليف") || name.includes("قصدير") || name.includes("أكواب") ||
    name.includes("اكواب") || name.includes("مناديل") || name.includes("ورق قصدير") ||
    name.includes("ورق مطبخ") || name.includes("شامبو") || name.includes("معطر") ||
    name.includes("إسفنج") || name.includes("اسفنج") || name.includes("قفاز")
  ) {
    return "high";
  }

  // 3. Medium items (سلع متوسطة: صلصة، إندومي، مكرونة، معلبات، بهارات، شيبس، بسكويت...) -> هامش 6-10%
  return "medium";
}

export function getTier1MarginForProduct(prod) {
  const group = getProductTier1Group(prod);
  if (group === "basic") return tier1Margins.basic;
  if (group === "high")  return tier1Margins.high;
  return tier1Margins.medium;
}

export function isCustomerTier1(cust) {
  if (!cust) return false;
  return cust.tier === "A" || cust.manualTier === "A" || 
         cust.tier === "tier1" || cust.category === "tier1" ||
         cust.category === "فئة أولى" || cust.tier === "فئة أولى" ||
         cust.priceList === "tier1" || cust.priceList === "distributor";
}

export function updateTier1UI() {
  const pl = document.getElementById("qt-pricelist")?.value;
  const ind = document.getElementById("qt-tier1-indicator");
  if (ind) {
    if (pl === "tier1") {
      ind.style.display = "flex";
      const bEl = document.getElementById("qt-t1-b-pct");
      const mEl = document.getElementById("qt-t1-m-pct");
      const hEl = document.getElementById("qt-t1-h-pct");
      if (bEl) bEl.textContent = tier1Margins.basic;
      if (mEl) mEl.textContent = tier1Margins.medium;
      if (hEl) hEl.textContent = tier1Margins.high;
    } else {
      ind.style.display = "none";
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isoToDisplay(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const STATUS_MAP = {
  draft:     { label: "مسودة",   cls: "neutral" },
  sent:      { label: "مُرسَل",   cls: "indigo"  },
  accepted:  { label: "مقبول",   cls: "good"    },
  rejected:  { label: "مرفوض",  cls: "bad"     },
  expired:   { label: "منتهي",  cls: "warn"    },
  converted: { label: "مُفوتَر", cls: "teal"    },
};

function statusBadge(status) {
  const s = STATUS_MAP[status] || { label: status, cls: "neutral" };
  return `<span class="badge ${s.cls}" style="font-size:10px;">${s.label}</span>`;
}

function parseNum(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  let str = String(val).trim();
  if (!str) return fallback;
  str = str.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
           .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
           .replace(/٫/g, ".")
           .replace(/,/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

function resolveItemEffectiveCost(item, priceListKey = "standard") {
  if (!item) return { cost: 0, margin: 0, lastPurchasePrice: 0 };
  
  let cost = parseNum(item.cost || item.unitCost || item.costPrice || item.purchasePrice || item.averageCost, 0);
  let lastPur = parseNum(item.lastPurchasePrice, 0);
  const unitPrice = parseNum(item.unitPrice !== undefined ? item.unitPrice : item.price, 0);
  let margin = (item.margin !== undefined && item.margin !== null && item.margin !== "") ? parseNum(item.margin, null) : null;

  // 1. Direct valid cost > 0
  if (cost > 0) {
    if (margin === null || isNaN(margin)) {
      margin = unitPrice > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
    } else {
      margin = Math.round(margin * 100) / 100;
    }
    return { cost: Math.round(cost * 100) / 100, margin, lastPurchasePrice: Math.round((lastPur || cost) * 100) / 100 };
  }

  // 2. lastPurchasePrice > 0
  if (lastPur > 0) {
    cost = lastPur;
    if (margin === null || isNaN(margin)) {
      margin = unitPrice > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
    } else {
      margin = Math.round(margin * 100) / 100;
    }
    return { cost: Math.round(cost * 100) / 100, margin, lastPurchasePrice: Math.round(lastPur * 100) / 100 };
  }

  // 3. Match from products catalog by ID or by normalized name
  if (typeof products !== "undefined" && Array.isArray(products) && products.length > 0) {
    let prod = products.find(p => p.id === item.productId);
    if (!prod && item.productName) {
      const normTarget = typeof normalizeArabicText === "function" ? normalizeArabicText(item.productName.trim().toLowerCase()) : item.productName.trim().toLowerCase();
      prod = products.find(p => {
        const rawP = p.name || p.nameAr || "";
        const normP = typeof normalizeArabicText === "function" ? normalizeArabicText(rawP.trim().toLowerCase()) : rawP.trim().toLowerCase();
        return normP === normTarget || normP.includes(normTarget) || normTarget.includes(normP);
      });
    }
    if (prod) {
      const prodCost = parseNum(prod.averageCost || prod.costPrice || prod.lastPurchasePrice || prod.avgCostPrice || prod.purchasePrice || prod.cost, 0);
      if (prodCost > 0) {
        cost = prodCost;
        lastPur = parseNum(prod.lastPurchasePrice, prodCost);
        if (margin === null || isNaN(margin)) {
          margin = unitPrice > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
        } else {
          margin = Math.round(margin * 100) / 100;
        }
        return { cost: Math.round(cost * 100) / 100, margin, lastPurchasePrice: Math.round(lastPur * 100) / 100 };
      }
    }
  }

  // 4. Match from supplier prices bank
  if (item.productName && typeof getSupplierPricesForProduct === "function") {
    try {
      const supQuotes = getSupplierPricesForProduct(item.productName);
      if (supQuotes && supQuotes.length > 0 && supQuotes[0].costPrice > 0) {
        cost = parseNum(supQuotes[0].costPrice, 0);
        lastPur = cost;
        if (margin === null || isNaN(margin)) {
          margin = unitPrice > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
        } else {
          margin = Math.round(margin * 100) / 100;
        }
        return { cost: Math.round(cost * 100) / 100, margin, lastPurchasePrice: Math.round(lastPur * 100) / 100 };
      }
    } catch (e) {}
  }

  // 5. Match from historical quotations
  if (item.productName && typeof getQuotationPriceHistory === "function") {
    try {
      const hist = getQuotationPriceHistory(item.productName);
      const validHist = hist.find(h => parseNum(h.cost, 0) > 0);
      if (validHist) {
        cost = parseNum(validHist.cost, 0);
        lastPur = cost;
        if (margin === null || isNaN(margin)) {
          margin = unitPrice > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : parseNum(validHist.margin, 0);
        } else {
          margin = Math.round(margin * 100) / 100;
        }
        return { cost: Math.round(cost * 100) / 100, margin, lastPurchasePrice: Math.round(lastPur * 100) / 100 };
      }
    } catch (e) {}
  }

  // 6. If margin is specified (> 0) and unitPrice > 0, derive cost = unitPrice / (1 + margin / 100)
  if (unitPrice > 0 && margin !== null && !isNaN(margin) && margin > 0) {
    cost = Math.round((unitPrice / (1 + margin / 100)) * 100) / 100;
    return { cost, margin: Math.round(margin * 100) / 100, lastPurchasePrice: cost };
  }

  // 7. If cost is still 0 and unitPrice > 0, use priceList default margin to derive cost
  if (unitPrice > 0) {
    let defMargin = plMargins?.retailMargin || 10;
    if (priceListKey === "tier1") {
      const prod = (typeof products !== "undefined" && Array.isArray(products)) ? products.find(p => p.id === item.productId) : null;
      defMargin = getTier1MarginForProduct(prod || item);
    } else if (priceListKey === "wholesale") {
      defMargin = plMargins?.wholesaleMargin || 7;
    } else if (priceListKey === "distributor") {
      defMargin = plMargins?.distributorMargin || 5;
    }
    margin = defMargin;
    cost = Math.round((unitPrice / (1 + margin / 100)) * 100) / 100;
    return { cost, margin: Math.round(margin * 100) / 100, lastPurchasePrice: cost };
  }

  return { cost: 0, margin: 0, lastPurchasePrice: 0 };
}

function calcQuoteTotals(lines, edType, edVal) {
  let grossTotal = 0, discountLines = 0, totalCost = 0;
  const plKey = document.getElementById("qt-pricelist")?.value || "standard";
  
  for (const l of (lines || [])) {
    const qty = parseNum(l.qty, 0);
    const unitPrice = parseNum(l.unitPrice !== undefined ? l.unitPrice : l.price, 0);
    const discRate = parseNum(l.discount, 0);
    
    let cost = parseNum(l.cost || l.unitCost || l.costPrice || l.purchasePrice || l.averageCost, 0);
    if (cost <= 0) {
      const resolved = resolveItemEffectiveCost(l, plKey);
      cost = resolved.cost;
      if (l.cost !== undefined && cost > 0) l.cost = cost;
      if (l.margin !== undefined && resolved.margin > 0 && (!l.margin || l.margin === 0)) l.margin = resolved.margin;
    }

    const gross = qty * unitPrice;
    const disc  = gross * discRate / 100;
    grossTotal   += gross;
    discountLines += disc;
    totalCost    += (qty * cost);
  }
  const afterLineDisc = grossTotal - discountLines;
  let extraDiscount = 0;
  const ev = parseNum(edVal, 0);
  if (edType === "pct")   extraDiscount = afterLineDisc * ev / 100;
  if (edType === "fixed") extraDiscount = ev;
  const subtotal   = Math.max(0, afterLineDisc - extraDiscount);
  const vat        = Math.round(subtotal * 0.15 * 100) / 100;
  const grandTotal = Math.round((subtotal + vat) * 100) / 100;

  totalCost = Math.round(totalCost * 100) / 100;
  const totalProfit = Math.round((subtotal - totalCost) * 100) / 100;
  // Total Gross Profit Margin % before VAT = (totalProfit / subtotal) * 100
  const marginPct = subtotal > 0 ? Math.round(((totalProfit / subtotal) * 100) * 100) / 100 : 0;
  // Markup % on Cost = (totalProfit / totalCost) * 100
  const markupPct = totalCost > 0 ? Math.round(((totalProfit / totalCost) * 100) * 100) / 100 : 0;

  let sumLineMargins = 0;
  let lineCount = 0;
  (lines || []).forEach(l => {
    if (l.margin !== undefined && l.margin !== null && !isNaN(l.margin)) {
      sumLineMargins += parseNum(l.margin, 0);
      lineCount++;
    }
  });
  const avgMarginPct = lineCount > 0 ? Math.round((sumLineMargins / lineCount) * 100) / 100 : markupPct;

  return {
    grossTotal:    Math.round(grossTotal * 100) / 100,
    discountLines: Math.round(discountLines * 100) / 100,
    extraDiscount: Math.round(extraDiscount * 100) / 100,
    totalDiscount: Math.round((discountLines + extraDiscount) * 100) / 100,
    subtotal:      Math.round(subtotal * 100) / 100,
    vat,
    grandTotal,
    totalCost,
    totalProfit,
    marginPct,
    markupPct,
    avgMarginPct
  };
}

// ============================================================
// ENTRY POINT
// ============================================================
export async function render(container, user) {
  _quotesUser = user;
  container.innerHTML = buildPage();
  await loadPriceListMargins();
  await Promise.all([loadDependencies(), loadQuotesList()]);
  setupCustomerAutocomplete();
  setupProductAutocomplete();

  // Auto-open new quote form if items prefilled from Supplier Price Matrix
  try {
    const prefilledRaw = sessionStorage.getItem("idham_prefilled_quote_lines");
    if (prefilledRaw) {
      setTimeout(() => {
        if (typeof window.openQuoteForm === "function") {
          window.openQuoteForm();
        }
      }, 350);
    }
  } catch (e) {
    console.warn("Error checking prefilled quote lines:", e);
  }
}

// ============================================================
// PAGE HTML
// ============================================================
function buildPage() {
  const today = todayString();
  const firstDay = today.slice(0, 8) + "01";
  return `
<div class="filterbar">
  <input type="text" id="qt-search" class="input" style="width:200px;"
    placeholder="بحث برقم العرض أو العميل" oninput="filterQuotes()" />
  <div class="filter-select-group">
    <label>الحالة</label>
    <select id="qt-status-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
      <option value="draft">مسودة</option>
      <option value="sent">مُرسَل</option>
      <option value="accepted">مقبول</option>
      <option value="rejected">مرفوض</option>
      <option value="expired">منتهي</option>
      <option value="converted">مُفوتَر</option>
    </select>
  </div>
  <div class="date-range-group"><label>من</label>
    <input type="date" id="qt-from" value="${firstDay}" onchange="filterQuotes()" />
  </div>
  <div class="date-range-group"><label>إلى</label>
    <input type="date" id="qt-to" value="${today}" onchange="filterQuotes()" />
  </div>
  <div class="filter-select-group">
    <label>المندوب</label>
    <select id="qt-rep-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
    </select>
  </div>
  <div style="margin-right:auto;display:flex;gap:8px;">
    <button class="btn-export" onclick="exportPagePDF('.data-dense','عروض_الأسعار')" title="تصدير PDF"><span>📄</span> PDF</button>
    <button class="btn-export excel" onclick="exportPageExcel('.data-dense','عروض_الأسعار')" title="تصدير Excel"><span>📊</span> Excel</button>
    <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
    <button class="btn btn-secondary" id="qt-top-demand-btn" onclick="toggleQuotationsTab()" style="display:flex; align-items:center; gap:6px; font-weight:800; background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#e0e7ff; border-color:#4338ca; box-shadow:0 2px 8px rgba(49,46,129,0.25);" title="تحليل أكثر الأصناف طلباً في عروض الأسعار والعملاء الطالبين"><span id="qt-top-demand-icon">🏆</span> <span id="qt-top-demand-text">أكثر الأصناف طلباً</span></button>
    <button class="btn btn-secondary" onclick="openTier1MarginsModal()" style="display:flex; align-items:center; gap:6px; font-weight:700; background:rgba(5,150,105,0.08); color:#047857; border-color:rgba(5,150,105,0.3);" title="ضبط وتعديل نسب وهوامش ربح الفئة الأولى"><span>⚙️</span> نسب الفئة الأولى</button>
    <button class="btn btn-secondary" onclick="openSupplierPriceBankModal()" style="display:flex; align-items:center; gap:6px; font-weight:700; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#38bdf8; border-color:#334155;" title="استيراد وبنك عروض أسعار الموردين (PDF / Excel)"><span>🏢</span> بنك أسعار الموردين</button>
    <button class="btn btn-secondary" onclick="openQuotationImportModal()" style="display:flex; align-items:center; gap:6px; font-weight:700;">📥 استيراد ذكي (Excel / PDF / نسخ)</button>
    <button class="btn btn-primary" onclick="openQuoteForm()">+ عرض سعر جديد</button>
  </div>
</div>

<div class="page-content">
  <div class="kpi-grid mb-20">
    <div class="kpi-card g-blue">
      <div class="kpi-icon">📋</div>
      <div class="kpi-content"><div class="kpi-label">إجمالي العروض</div>
        <div class="kpi-value mono" id="kpi-qt-total">—</div></div></div>
    <div class="kpi-card g-green">
      <div class="kpi-icon">✅</div>
      <div class="kpi-content"><div class="kpi-label">عروض مقبولة</div>
        <div class="kpi-value mono" id="kpi-qt-accepted">—</div></div></div>
    <div class="kpi-card g-orange">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-content"><div class="kpi-label">عروض منتظرة</div>
        <div class="kpi-value mono" id="kpi-qt-pending">—</div></div></div>
    <div class="kpi-card g-purple">
      <div class="kpi-icon">🔄</div>
      <div class="kpi-content"><div class="kpi-label">نسبة التحويل</div>
        <div class="kpi-value mono" id="kpi-qt-conv">—</div></div></div>
  </div>

  <!-- ═══ NAVIGATION TABS (عروض الأسعار vs أكثر الأصناف طلباً) ═══ -->
  <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:2px solid #cbd5e1; padding-bottom:0;">
    <button type="button" id="qt-tab-btn-quotes" class="btn btn-primary" onclick="switchQuotationsTab('quotes')" style="display:inline-flex; align-items:center; gap:8px; font-weight:800; font-size:13px; border-radius:10px 10px 0 0; padding:10px 22px; cursor:pointer;">
      <span>📋</span> قائمة عروض الأسعار
      <span id="qt-quotes-count-badge" style="background:#2563eb; color:#ffffff; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:900;">${quotations.length || 0} عرض</span>
    </button>
    <button type="button" id="qt-tab-btn-demand" class="btn btn-secondary" onclick="switchQuotationsTab('demand')" style="display:inline-flex; align-items:center; gap:8px; font-weight:800; font-size:13px; border-radius:10px 10px 0 0; padding:10px 22px; background:#f8fafc; color:#334155; border:1.5px solid #cbd5e1; border-bottom:none; cursor:pointer;">
      <span>🏆</span> أكثر الأصناف طلباً في العروض والعملاء
      <span id="qt-demand-count-badge" style="background:#4338ca; color:#ffffff; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:900;">0 صنف</span>
    </button>
  </div>

  <!-- ═══ TAB 1: QUOTATIONS LIST ═══ -->
  <div id="qt-view-quotes-section">
    <div class="card">
      <div class="card-header">
        <h3 style="font-family:var(--font-heading);font-size:14px;">قائمة عروض الأسعار</h3>
        <span id="qt-count-label" class="text-2" style="font-size:12px;"></span>
      </div>
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>رقم العرض</th><th>التاريخ</th><th>العميل</th>
            <th>المندوب</th><th style="text-align:center;">الأصناف</th>
            <th>الإجمالي</th><th>الحالة</th><th>الصلاحية</th>
            <th style="width:160px;">إجراءات</th>
          </tr></thead>
          <tbody id="qt-tbody">
            ${Array(8).fill(0).map(() => `
                  <tr class="skeleton-row">
                    ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ═══ TAB 2: DEMAND & TOP REQUESTED PRODUCTS ANALYSIS ═══ -->
  <div id="qt-view-demand-section" style="display:none;">
    
    <!-- Demand Summary KPIs -->
    <div class="kpi-grid mb-20">
      <div class="kpi-card g-blue" style="border-right:4px solid #3b82f6;">
        <div class="kpi-icon">📦</div>
        <div class="kpi-content">
          <div class="kpi-label">عدد الأصناف المطلوبة</div>
          <div class="kpi-value mono" id="kpi-demand-prod-count">0 صنف</div>
        </div>
      </div>
      <div class="kpi-card g-purple" style="border-right:4px solid #8b5cf6;">
        <div class="kpi-icon">🔁</div>
        <div class="kpi-content">
          <div class="kpi-label">إجمالي مرات طلب الأصناف</div>
          <div class="kpi-value mono" id="kpi-demand-req-count">0 طلب</div>
        </div>
      </div>
      <div class="kpi-card g-orange" style="border-right:4px solid #f97316;">
        <div class="kpi-icon">⚖️</div>
        <div class="kpi-content">
          <div class="kpi-label">إجمالي الكميات المسعرة</div>
          <div class="kpi-value mono" id="kpi-demand-total-qty">0</div>
        </div>
      </div>
      <div class="kpi-card g-green" style="border-right:4px solid #10b981;">
        <div class="kpi-icon">👥</div>
        <div class="kpi-content">
          <div class="kpi-label">العملاء المستفسرين</div>
          <div class="kpi-value mono" id="kpi-demand-cust-count">0 عميل</div>
        </div>
      </div>
    </div>

    <!-- Demand Controls Bar -->
    <div class="card mb-16" style="padding:14px 18px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        
        <!-- Search & Filters -->
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <input type="text" id="qt-demand-search" class="input" placeholder="🔍 ابحث باسم الصنف أو العميل..." oninput="renderTopRequestedProducts()" style="width:230px; font-size:12.5px; font-weight:600;" />
          
          <div class="filter-select-group">
            <label style="font-size:11px; font-weight:700;">الترتيب حسب</label>
            <select id="qt-demand-sort" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px; font-weight:700;">
              <option value="count">🔥 الأكثر طلباً (عدد مرات العرض)</option>
              <option value="qty">📦 الأكثر كمية مطلوبة</option>
              <option value="value">💰 الأعلى قيمة مسعرة</option>
              <option value="customers">👥 الأكثر تنوعاً في العملاء</option>
            </select>
          </div>

          <div class="filter-select-group">
            <label style="font-size:11px; font-weight:700;">حالة العرض</label>
            <select id="qt-demand-status" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px; font-weight:700;">
              <option value="">جميع الحالات</option>
              <option value="converted">مبيعات محققة (مُفوتَر / مقبول)</option>
              <option value="pending">قيد الدراسة (مسودة / مرسل)</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div class="date-range-group">
            <label style="font-size:11px; font-weight:700;">من</label>
            <input type="date" id="qt-demand-from" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px;" />
          </div>
          <div class="date-range-group">
            <label style="font-size:11px; font-weight:700;">إلى</label>
            <input type="date" id="qt-demand-to" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px;" />
          </div>

          <button type="button" class="btn btn-secondary btn-sm" onclick="setDemandDatePreset('all')" style="font-size:11px; font-weight:800; padding:4px 10px;">كل الفترات</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setDemandDatePreset('month')" style="font-size:11px; font-weight:800; padding:4px 10px;">هذا الشهر</button>
        </div>

        <!-- Action Buttons (Print & Excel) -->
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="exportTopRequestedProductsExcel()" style="display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:12px; background:#f0fdf4; color:#15803d; border:1px solid #86efac;">
            <span>📊</span> تصدير Excel
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="printTopRequestedProductsReport()" style="display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:12px; background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd;">
            <span>🖨️</span> طباعة التقرير
          </button>
        </div>

      </div>
    </div>

    <!-- Demand Results Table Card -->
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-family:var(--font-heading);font-size:15px; font-weight:900; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>🏆</span> تحليل الأصناف الأكثر طلباً في عروض الأسعار والعملاء الطالبين
          </h3>
          <span class="text-2" id="qt-demand-subtitle" style="font-size:11.5px; font-weight:600;">يُظهر ترتيب الأصناف حسب تكرار طلبها في العروض، إجمالي الكميات، وقائمة كل عميل طلب الصنف</span>
        </div>
        <div id="qt-demand-stat-badge" class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:12px; padding:4px 12px; border-radius:10px;">0 صنف مسعر</div>
      </div>

      <div class="table-container">
        <table class="data-dense" id="qt-demand-table" style="width:100%; font-size:12.5px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 12px; width:55px; text-align:center;">#</th>
              <th style="padding:10px 12px; width:220px;">اسم الصنف والوحدة</th>
              <th style="padding:10px 12px; width:160px; text-align:center;">كم مرة طُلب؟ (تكرار العروض)</th>
              <th style="padding:10px 12px; width:130px; text-align:left;">إجمالي الكمية المطلوبة</th>
              <th style="padding:10px 12px; width:115px; text-align:left;">متوسط السعر</th>
              <th style="padding:10px 12px; width:125px; text-align:left;">إجمالي القيمة</th>
              <th style="padding:10px 12px; width:110px; text-align:center;">العملاء (من من؟)</th>
              <th style="padding:10px 12px; width:100px; text-align:center;">نسبة النجاح</th>
              <th style="padding:10px 12px; width:130px; text-align:center;">تفاصيل العملاء</th>
            </tr>
          </thead>
          <tbody id="qt-demand-tbody">
            <tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-3); font-weight:700;">جاري تحليل وتجميع بيانات الطلب...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUOTE FORM MODAL                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-form-modal">
  <style>
    /* Scoped Quotation Fullscreen Cockpit */
    #qt-form-modal {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      padding: 0 !important;
      margin: 0 !important;
      background: rgba(15, 23, 42, 0.85) !important;
      z-index: 9999 !important;
      display: flex !important;
      align-items: stretch !important;
      justify-content: stretch !important;
    }
    #qt-form-modal .modal-xl {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
      margin: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: none !important;
      background: #f8fafc !important;
    }
    #qt-form-modal input[type="number"]::-webkit-outer-spin-button,
    #qt-form-modal input[type="number"]::-webkit-inner-spin-button,
    #qt-form-modal .no-spin::-webkit-outer-spin-button,
    #qt-form-modal .no-spin::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
    }
    #qt-form-modal input[type="number"],
    #qt-form-modal .no-spin {
      -moz-appearance: textfield !important;
    }
    #qt-form-modal input:focus, #qt-form-modal select:focus, #qt-form-modal textarea:focus {
      outline: 2px solid #2563eb !important;
      outline-offset: -1px !important;
      background-color: #eff6ff !important;
    }
    #qt-lines-tbody tr:hover {
      background: rgba(59, 130, 246, 0.04) !important;
    }
    .qt-hud-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      font-size: 11.5px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .qt-hud-pill b {
      font-family: monospace;
      font-size: 12.5px;
      font-weight: 800;
    }
  </style>
  <div class="modal modal-xl">
    
    <!-- Modal Header (Crisp Light Theme 44px) -->
    <div class="modal-header" style="height:44px; background:#ffffff; color:#0f172a; padding:6px 18px; border-bottom:1.5px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:20px;">📝</span>
        <h3 class="modal-title" id="qt-form-title" style="color:#0f172a; font-size:15px; font-weight:900; margin:0;">عرض سعر جديد</h3>
        <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10.5px; padding:2px 7px; border:1px solid #c7d2fe;">
          ⛶ شاشة كاملة
        </span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="modal-close" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;" onclick="closeModal('qt-form-modal')">×</button>
      </div>
    </div>

    <!-- Modal Body (Flex 1, No Outer Scroll) -->
    <div class="modal-body" style="padding:8px 12px; overflow:hidden; flex:1 1 0%; min-height:0; display:flex; flex-direction:column; gap:6px; background:#f1f5f9;">

      <!-- Quotation Meta Info Bar (Compact Single Row ~40px) -->
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0;">
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          
          <div style="flex:2; min-width:230px; position:relative;">
            <div class="autocomplete-container">
              <input type="text" id="qt-customer-search" class="input font-bold"
                style="height:30px; font-size:12px; padding:2px 10px; border-color:#2563eb; background:#fff; width:100%;"
                placeholder="👤 ابحث بالعميل أو اختر... *" autocomplete="off" />
              <div class="autocomplete-results hidden" id="qt-customer-results" style="z-index:99999; max-height:280px; box-shadow:0 10px 30px rgba(0,0,0,0.18);"></div>
              <input type="hidden" id="qt-customer-id" />
              <input type="hidden" id="qt-customer-name-val" />
              <div id="qt-tier1-indicator" style="display:none; margin-top:4px; font-size:10px; font-weight:700; color:#065f46; background:rgba(16,185,129,0.12); padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.3); align-items:center; justify-content:space-between;">
                <span>💎 <strong>فئة أولى:</strong> أساسي <span id="qt-t1-b-pct">${tier1Margins.basic}</span>% | متوسط <span id="qt-t1-m-pct">${tier1Margins.medium}</span>% | تغليف <span id="qt-t1-h-pct">${tier1Margins.high}</span>%</span>
                <a href="javascript:void(0)" onclick="openTier1MarginsModal()" style="color:#047857; text-decoration:underline; font-size:9.5px; margin-right:4px;">تعديل ⚙️</a>
              </div>
            </div>
          </div>

          <div style="width:110px;">
            <input type="text" id="qt-number" class="input mono font-bold"
              style="height:30px; font-size:11px; padding:2px 6px; text-align:center; font-weight:800;" placeholder="رقم العرض" title="رقم العرض (تلقائي / قابل للتعديل)" />
          </div>

          <div style="width:125px;">
            <input type="date" id="qt-date" class="input font-bold" style="height:30px; font-size:11.5px; padding:2px 6px; text-align:center;" title="تاريخ العرض *" />
          </div>

          <div style="width:125px;">
            <input type="date" id="qt-expiry" class="input font-bold" style="height:30px; font-size:11.5px; padding:2px 6px; text-align:center;" onchange="checkExpiryWarn()" title="تاريخ الصلاحية *" />
            <div id="qt-expiry-warn" style="font-size:9px; color:var(--bad); display:none; margin-top:1px;">⚠️ منتهي</div>
          </div>

          <div style="width:120px;">
            <select id="qt-rep" class="input" style="height:30px; font-size:11px; padding:2px 4px;"><option value="">بدون مندوب</option></select>
          </div>

          <div style="width:140px;">
            <select id="qt-warehouse" class="input font-bold" onchange="window.onQtWarehouseChange()" style="height:30px; font-size:11px; padding:2px 4px; border-color:#0284c7; color:#0369a1; background:#f0f9ff;" title="المستودع لحساب وتحديد رصيد المخزون المتوفر">
              <option value="">🏢 كل المخازن (رصيد إجمالي)</option>
            </select>
          </div>

          <div style="width:145px;">
            <select id="qt-pricelist" class="input font-bold" onchange="onPricelistChange()" style="height:30px; font-size:11px; padding:2px 4px; border-color:#059669; color:#065f46;">
              <option value="standard">عادي (Standard)</option>
              <option value="wholesale">جملة (Wholesale)</option>
              <option value="distributor">موزع (Distributor)</option>
              <option value="tier1">💎 عميل فئة أولى (هوامش)</option>
              <option value="special">خاص (Special)</option>
            </select>
          </div>

          <div style="width:95px;">
            <select id="qt-payment-terms" class="input" style="height:30px; font-size:11px; padding:2px 4px;">
              <option value="cash">نقداً</option>
              <option value="net30">30 يوم</option>
              <option value="net60">60 يوم</option>
              <option value="custom">بالاتفاق</option>
            </select>
          </div>

          <div style="width:90px;">
            <select id="qt-status" class="input font-bold" style="height:30px; font-size:11px; padding:2px 4px;">
              <option value="draft">مسودة</option>
              <option value="sent">مُرسَل</option>
              <option value="accepted">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <button type="button" id="qt-extra-details-btn" class="btn btn-secondary btn-sm" onclick="window.toggleQtExtraDetails()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار تفاصيل إضافية: عنوان التسليم، ملاحظات، خصم إضافي">
            ⚙️ تفاصيل وشروط
          </button>

        </div>

        <!-- Secondary Extra Details Drawer -->
        <div id="qt-extra-details-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:flex-start; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">عنوان التسليم:</label>
            <input type="text" id="qt-delivery-address" class="input" placeholder="عنوان التسليم..." style="height:28px; font-size:11px; padding:2px 6px; width:100%;" />
          </div>
          <div style="flex:1.5; min-width:220px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">ملاحظات للعميل:</label>
            <textarea id="qt-notes" class="input" rows="1" placeholder="ملاحظات تظهر للعميل في العرض المطبوع..." style="resize:vertical; font-size:11px; padding:3px 6px; height:28px; min-height:28px; width:100%;"></textarea>
          </div>
          <div style="flex:1.5; min-width:220px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">الشروط والأحكام:</label>
            <textarea id="qt-terms" class="input" rows="1" style="resize:vertical; font-size:11px; padding:3px 6px; height:28px; min-height:28px; width:100%;">صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.</textarea>
          </div>
          <div style="width:160px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">إرفاق ملف:</label>
            <input type="file" id="qt-file-upload" class="input" style="height:28px; font-size:10px; padding:1px 4px; width:100%;" accept="image/*,application/pdf" />
          </div>
          <div style="display:flex; align-items:center; gap:4px; align-self:flex-end;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; white-space:nowrap;">خصم إضافي:</label>
            <select id="qt-extra-disc-type" class="input" style="width:80px; height:28px; font-size:10.5px; padding:2px 4px;" onchange="recalcTotals()">
              <option value="none">لا يوجد</option>
              <option value="pct">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
            <input type="number" id="qt-extra-disc-val" class="input mono no-spin" style="width:65px; height:28px; font-size:11px; text-align:center; padding:2px 4px;" min="0" step="0.01" value="0" onwheel="this.blur()" oninput="recalcTotals()" />
          </div>
        </div>

      </div>

      <!-- Product Search & Quick Actions Toolbar (Compact ~36px) -->
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
        <div style="display:flex; gap:6px; flex:1; min-width:320px; align-items:center;">
          <select id="qt-product-category-filter" class="input" style="width:130px; height:32px; font-size:11.5px; padding:2px 6px;">
            <option value="">كل الفئات</option>
          </select>
          <div class="autocomplete-container" style="flex:1; position:relative;">
            <input type="text" id="qt-product-search" class="input font-bold"
              placeholder="🔍 ابحث بالاسم أو رمز الصنف (SKU) أو الباركود لإضافة الصنف فوراً... [اضغط Enter للعودة هنا بعد كتابة الكمية]" autocomplete="off"
              style="height:32px; font-size:12.5px; padding:2px 10px; background:#fff; border-color:#2563eb; width:100%;" />
            <div class="autocomplete-results hidden" id="qt-product-results" style="min-width:600px; width:max(100%, 600px); max-width:800px; right:0; left:auto; z-index:99999; box-shadow:0 12px 35px rgba(0,0,0,0.18); border-radius:10px; max-height:360px;"></div>
          </div>
        </div>

        <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openSupplierPriceBankModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(15,23,42,0.06); color:#0f172a; font-weight:700;" title="فتح بنك أسعار الموردين">🏢 عروض الموردين</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openQuotationImportModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(37,99,235,0.08); color:#1d4ed8; font-weight:700;" title="استيراد من Excel أو PDF">📥 استيراد Excel/PDF</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openQuickAddProductModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(16,185,129,0.08); color:#059669; font-weight:700;" title="إضافة صنف جديد سريع">➕ صنف جديد</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addCustomQuoteLine()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(245,158,11,0.08); color:#d97706; font-weight:700;" title="إضافة بند حر مباشر">⚡ بند حر</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addAllProductsToQuote()" style="height:30px; font-size:11px; padding:3px 7px;" title="إدراج جميع أصناف الكتالوج">📦 إدراج الكل</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="refreshQuoteItemCostsFromPurchases(this)" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(79,70,229,0.08); color:#4F46E5; font-weight:600;" title="تحديث التكاليف من المشتريات">🔄 التكاليف</button>
          <button type="button" class="btn btn-ghost text-bad btn-sm" onclick="clearAllQuoteLines()" style="height:30px; font-size:11px; padding:3px 6px;" title="مسح كافة البنود">🗑️ تفريغ</button>
        </div>
      </div>

      <!-- Line Items Table (Spacious Fullscreen Viewport) -->
      <div class="invoice-lines table-container qt-lines-scroll-area" style="border:1.5px solid #cbd5e1; border-radius:8px; flex:1 1 0%; min-height:0; overflow-y:auto; overflow-x:auto; background:#fff; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
        <table style="width:100%; min-width:1160px; font-size:12px; border-collapse:collapse;">
          <thead style="position:sticky; top:0; z-index:10; background:#f8fafc; color:#1e293b; border-bottom:2px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <tr>
              <th style="padding:8px 4px; text-align:center; font-size:11px; font-weight:800; color:#475569; width:34px;">#</th>
              <th style="padding:8px 8px; text-align:right; font-size:11.5px; font-weight:900; color:#0f172a; min-width:300px;">الصنف</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:800; color:#334155; width:75px;">الوحدة</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#0284c7; width:85px;">الكمية</th>
              <th class="no-print" style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:800; color:#475569; width:95px;">سعر التكلفة</th>
              <th class="no-print" style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#059669; width:85px;">هامش ربح%</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#1e40af; width:110px;">سعر الوحدة</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#dc2626; width:75px;">خصم %</th>
              <th style="padding:8px 6px; text-align:left; font-size:11.5px; font-weight:800; color:#334155; width:100px;">صافي</th>
              <th style="padding:8px 6px; text-align:left; font-size:11.5px; font-weight:900; color:#d97706; width:90px;">ضريبة 15%</th>
              <th style="padding:8px 8px; text-align:left; font-size:12px; font-weight:900; color:#1e40af; width:115px;">الإجمالي</th>
              <th style="width:34px; text-align:center; padding:8px 2px;"></th>
            </tr>
          </thead>
          <tbody id="qt-lines-tbody"></tbody>
        </table>
      </div>

      <div id="qt-form-error" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px;"></div>

    </div>

    <!-- Fixed Bottom HUD Bar (Crisp High-Contrast Light Theme) -->
    <div class="modal-footer" style="height:54px; padding:0 16px; background:#ffffff; border-top:2px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 -2px 10px rgba(0,0,0,0.04);">
      
      <!-- Live Totals Strip -->
      <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; margin-left:12px;">
        
        <div class="qt-hud-pill">
          <span style="color:#64748b;">قبل الخصم:</span>
          <b id="qt-t-gross" style="color:#0f172a;">0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#dc2626;">الخصم:</span>
          <b id="qt-t-disc" style="color:#dc2626;">- 0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#2563eb;">الخاضع للضريبة:</span>
          <b id="qt-t-subtotal" style="color:#2563eb;">0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#d97706;">الضريبة (15%):</span>
          <b id="qt-t-vat" style="color:#d97706;">0.00 ر.س</b>
        </div>

        <!-- Profit / Margin Pill (Internal - No print) -->
        <div class="qt-hud-pill no-print" style="background:#ecfdf5; border-color:#a7f3d0;">
          <span style="color:#059669; font-weight:800;">📊 الربح:</span>
          <b id="qt-t-profit" style="color:#059669;">0.00 ر.س</b>
          <span style="color:#0284c7; font-weight:800; margin-right:4px;">| هامش:</span>
          <span id="qt-t-margin-badge" class="badge" style="background:#10b981; color:#fff; font-weight:800; font-size:10.5px; padding:2px 6px; border-radius:4px; font-family:monospace;">0.00%</span>
          <span style="display:none;" id="qt-t-cost">0.00 ر.س</span>
          <span style="display:none;" id="qt-t-margin">0.00%</span>
          <span style="display:none;" id="qt-t-margin-sales">0.00%</span>
          <span style="display:none;" id="qt-t-avg-margin">0.00%</span>
          <span style="display:none;" id="qt-t-profit-row"></span>
        </div>

        <!-- Pinned Grand Total -->
        <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 16px; background:linear-gradient(135deg, #1e40af, #2563eb); border-radius:8px; border:1px solid #1d4ed8; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
          <span style="font-size:12.5px; font-weight:800; color:#dbeafe;">الإجمالي النهائي:</span>
          <span class="mono" style="font-size:18px; font-weight:900; color:#ffffff;" id="qt-t-grand">0.00 ر.س</span>
        </div>

      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
        <button class="btn btn-ghost sm" onclick="closeModal('qt-form-modal')" style="color:#64748b; height:34px; font-size:12px; font-weight:700;">إلغاء</button>
        <button class="btn btn-secondary sm" id="qt-form-print-btn" style="display:inline-flex; height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;" onclick="printQuoteFromForm()">🖨️ طباعة / PDF</button>
        <button class="btn btn-secondary sm" onclick="saveQuote('draft')" id="qt-save-draft-btn" style="height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;">💾 مسودة</button>
        <button class="btn btn-primary" onclick="saveQuote('sent')" id="qt-save-btn" style="height:36px; padding:0 20px; font-weight:900; font-size:13px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 2px 6px rgba(37,99,235,0.3);">
          📤 حفظ وإرسال
        </button>
      </div>

    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SMART QUOTATION IMPORT MODAL (Excel / PDF / Paste)      -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-import-modal">
  <div class="modal modal-xl" style="max-height:92vh; display:flex; flex-direction:column; width:95%; max-width:1180px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #040d1f 0%, #0f2d6b 100%); color:#fff; padding:16px 24px; border-radius:12px 12px 0 0;">
      <div>
        <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>📥</span> استيراد عرض سعر ذكي (Excel / PDF / نسخ ولصق مباشر)
        </h3>
        <div style="font-size:11.5px; color:rgba(255,255,255,0.75); margin-top:3px;">
          استخراج فوري للأصناف والكميات والأسعار مع مطابقة الكتالوج لغوياً بدقة 100% دون أخطاء
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-import-modal')">×</button>
    </div>

    <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px;">
      
      <!-- Top Options Bar: Source Mode, Price Type & Tax & Profit Margin -->
      <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:12px 16px; margin-bottom:16px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <!-- Input Method Tabs -->
          <div style="display:flex; gap:6px;">
            <button type="button" id="tab-btn-file" class="btn btn-sm btn-primary" onclick="switchImportTab('file')" style="border-radius:6px; font-size:12px; font-weight:700;">
              📂 رفع ملف (Excel / CSV / PDF)
            </button>
            <button type="button" id="tab-btn-paste" class="btn btn-sm btn-secondary" onclick="switchImportTab('paste')" style="border-radius:6px; font-size:12px; font-weight:700;">
              📋 نسخ ولصق من Excel (Ctrl+V)
            </button>
          </div>

          <!-- Price Type & Tax Mode Options -->
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11.5px; font-weight:700; color:var(--text-1); white-space:nowrap;">نوع أسعار الشيت:</label>
              <select id="qt-import-price-type" class="input sm" style="height:32px; font-size:11.5px; font-weight:700; background:#f0fdf4; border-color:#86efac; color:#166534;" onchange="onImportPriceTypeChange()">
                <option value="cost" selected>💵 أسعار تكلفة شراء من مورد (إضافة هامش ربح لحساب سعر البيع)</option>
                <option value="sale">🏷️ أسعار بيع جاهزة للعميل (استخدامها كسعر بيع مباشر)</option>
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11.5px; font-weight:700; color:var(--text-1); white-space:nowrap;">طبيعة السعر بالشيت:</label>
              <select id="qt-import-tax-mode" class="input sm" style="height:32px; font-size:11.5px; font-weight:700;" onchange="reapplyTaxModeToImported()">
                <option value="exclusive" selected>غير شامل الضريبة (افتراضي)</option>
                <option value="inclusive">شامل ضريبة 15% (استخراج الصافي)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Margin Quick Control Bar (Visible when in Cost Mode) -->
        <div id="qt-import-margin-bar" style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border:1px solid #bfdbfe; border-radius:8px; padding:8px 14px; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">📈</span>
            <span style="font-size:12px; font-weight:700; color:#1e40af;">تحديد هامش الربح المطلوب على أسعار التكلفة:</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" id="qt-import-default-margin" class="input sm mono font-bold" value="10" min="0" max="500" step="0.5" style="width:75px; height:28px; text-align:center; font-size:13px; border-color:#3b82f6; background:#fff;" onchange="applyGlobalImportMargin(this.value)" />
              <span style="font-weight:700; color:#1e40af; font-size:13px;">%</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="applyGlobalImportMargin(document.getElementById('qt-import-default-margin').value)" style="height:28px; font-size:11.5px; font-weight:700; padding:0 12px;">
              ⚡ تطبيق على جميع الأصناف
            </button>
          </div>
          <!-- Quick Presets -->
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; color:#64748b; font-weight:600;">نسب سريعة:</span>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(5)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+5%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(10)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+10%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(15)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+15%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(20)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+20%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(25)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+25%</button>
          </div>
        </div>
      </div>

      <!-- TAB 1: FILE DRAG & DROP -->
      <div id="import-pane-file">
        <div id="qt-import-dropzone" style="border:2.5px dashed var(--border); border-radius:14px; padding:36px 20px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
          onclick="document.getElementById('qt-import-file-input').click()"
          ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='rgba(37,99,235,0.05)';"
          ondragleave="this.style.borderColor='var(--border)'; this.style.background='var(--bg-2)';"
          ondrop="handleQuotationFileDrop(event)">
          <div style="font-size:44px; margin-bottom:8px;">📊 📄</div>
          <div style="font-weight:800; color:var(--text-0); font-size:15px; margin-bottom:4px;">
            اسحب وأفلت ملف الإكسيل (.xlsx / .xls / .csv) أو ملف PDF هنا
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">أو اضغط لاختيار الملف من جهازك</div>
          <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; font-weight:700;">
            📁 تصفح الملفات
          </button>
        </div>
        <input type="file" id="qt-import-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none;" onchange="handleQuotationFileInput(event)" />
      </div>

      <!-- TAB 2: DIRECT PASTE TEXTAREA -->
      <div id="import-pane-paste" class="hidden">
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px;">
          <div style="font-size:12.5px; font-weight:700; color:var(--text-1); margin-bottom:6px;">
            📋 الصق خلايا الإكسيل هنا مباشرة (حدد الجدول في Excel واضغط Ctrl+C ثم اضغط Ctrl+V هنا):
          </div>
          <textarea id="qt-import-paste-area" class="input mono" rows="6" style="width:100%; font-size:11.5px; resize:vertical;"
            placeholder="اسم الصنف	الوحدة	الكمية	السعر قبل الضريبة	الخصم
بن هرري باجبير 5 ك	قطعة	1	185.50	0.00
فستق أمريكي (21/26) مالح 10 كيلو	كرتون	1	572.40	0.00
..."></textarea>
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button type="button" class="btn btn-primary" onclick="handlePastedQuotationText()" style="font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>⚡</span> تحليل وقراءة البيانات المنسوخة
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div id="qt-import-loading" class="hidden" style="text-align:center; padding:36px;">
        <div class="loading-spinner" style="margin:0 auto 12px auto; width:36px; height:36px;"></div>
        <div style="font-size:13.5px; font-weight:700; color:var(--brand);" id="qt-import-loading-text">جارٍ قراءة البيانات ومطابقة الأصناف لغوياً مع الكتالوج...</div>
      </div>

      <!-- Error Alert -->
      <div id="qt-import-error" class="alert bad hidden" style="margin-top:14px; font-size:12.5px;"></div>

      <!-- PREVIEW PARSED ITEMS AREA -->
      <div id="qt-import-preview-area" class="hidden" style="margin-top:20px;">
        
        <!-- Customer & Stats Header Strip -->
        <div style="background:linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border:1.5px solid #cbd5e1; border-radius:12px; padding:14px 18px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="font-size:18px;">👤</div>
            <div>
              <div style="font-size:11px; color:#64748b; font-weight:700;">العميل المكتشف بالشيت:</div>
              <input type="text" id="qt-import-detected-customer" class="input" style="font-weight:800; font-size:13px; height:32px; width:260px; color:#1e3a8a; border-color:#93c5fd; background:#fff;" placeholder="اسم العميل..." />
            </div>
            <div id="qt-import-customer-status" style="font-size:11px; color:#059669; font-weight:700;"></div>
          </div>

          <!-- Quick Stats Pills -->
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge" style="background:#eff6ff; border:1.5px solid #bfdbfe; color:#1e40af; font-size:12px; padding:6px 12px; font-weight:700;" id="qt-stat-total-items">📦 0 صنف</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <h4 style="color:var(--text-0); font-size:13.5px; font-weight:800; margin:0;">
            📋 تفاصيل الأصناف المستخرجة والأسعار وهوامش الربح:
          </h4>
          <div style="display:flex; align-items:center; gap:10px;">
            <button type="button" class="btn btn-sm btn-ghost" onclick="toggleQuotationExtractedDirection()" style="font-size:11.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:#1e40af;">🔀 عكس / تعديل اتجاه النص العربي</button>
            <div style="font-size:12px; color:var(--text-2);">
              * يمكنك تعديل أي تكلفة أو نسبة ربح أو سعر بيع مباشرة في الجدول
            </div>
          </div>
        </div>

        <div class="table-container" style="max-height:420px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <table class="data-dense" style="width:100%; margin:0; font-size:11.5px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="width:32px; text-align:center;"><input type="checkbox" id="qt-import-select-all" checked onchange="toggleAllImportedItems(this.checked)" /></th>
                <th style="width:30px; text-align:center;">#</th>
                <th style="min-width:210px;">اسم الصنف بالشيت</th>
                <th style="width:85px; text-align:center;">رقم/كود الصنف</th>
                <th style="width:70px; text-align:center;">الوحدة</th>
                <th style="width:65px; text-align:center;">الكمية</th>
                <th style="width:85px; text-align:left; color:#166534;" id="qt-th-cost">سعر التكلفة</th>
                <th style="width:65px; text-align:center; color:#1e40af;" id="qt-th-margin">الربح %</th>
                <th style="width:90px; text-align:left; color:#1e3a8a;" id="qt-th-price">سعر البيع (غير شامل)</th>
                <th style="width:85px; text-align:left; color:#0284c7;">شامل 15%</th>
                <th style="width:50px; text-align:center;">خصم%</th>
                <th style="width:105px; text-align:left;">الإجمالي شامل</th>
              </tr>
            </thead>
            <tbody id="qt-import-parsed-tbody"></tbody>
          </table>
        </div>

        <!-- Totals Summary Bar -->
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:10px; padding:10px 18px; display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
            <div id="qt-import-cost-summary-box">
              <span style="font-size:11.5px; color:#166534; font-weight:700;">إجمالي التكلفة:</span>
              <span class="mono font-bold" id="qt-import-tot-cost" style="margin-right:6px; font-size:12.5px; color:#166534;">0.00 ر.س</span>
            </div>
            <div id="qt-import-profit-summary-box">
              <span style="font-size:11.5px; color:#1e40af; font-weight:700;">صافي الربح المتوقع:</span>
              <span class="mono font-bold" id="qt-import-tot-profit" style="margin-right:6px; font-size:12.5px; color:#1e40af;">+0.00 ر.س (0%)</span>
            </div>
            <div style="border-right:1.5px solid var(--border-soft); padding-right:14px;">
              <span style="font-size:11.5px; color:var(--text-2);">البيع قبل الضريبة:</span>
              <span class="mono font-bold" id="qt-import-tot-gross" style="margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div>
              <span style="font-size:11.5px; color:#b45309; font-weight:700;">ضريبة 15%:</span>
              <span class="mono font-bold" id="qt-import-tot-vat" style="color:#b45309; margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div style="border-right:2px solid var(--border-soft); padding-right:16px;">
              <span style="font-size:12.5px; font-weight:800; color:var(--brand);">الإجمالي النهائي المطلوب:</span>
              <span class="mono font-bold text-brand" id="qt-import-tot-grand" style="margin-right:8px; font-size:15px;">0.00 ر.س</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-2); border-radius:0 0 12px 12px; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-ghost" onclick="closeModal('qt-import-modal')">إلغاء</button>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" id="qt-import-reupload-btn" onclick="resetQuotationImport()" style="display:none;">🔄 رفع ملف آخر</button>
        <button class="btn btn-primary" id="qt-import-submit-btn" disabled onclick="submitImportedQuotationItems()" style="background:linear-gradient(135deg,#047857,#059669); border-color:#047857; font-weight:800; padding:9px 24px; font-size:13.5px; box-shadow:0 3px 12px rgba(5,150,105,0.3);">
          ⚡ إنشاء وتعبئة عرض السعر الآن
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUICK ADD PRODUCT MODAL                                 -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-quick-product-modal" style="z-index: 1050;">
  <div class="modal modal-md" style="border-radius:12px; max-width:560px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#fff; border-radius:12px 12px 0 0; padding:14px 20px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">✨</span>
        <h3 class="modal-title" style="color:#fff; font-size:15px; font-weight:700; margin:0;" id="qt-qp-title">إضافة صنف جديد سريع إلى الكتالوج</h3>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-quick-product-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px;">
      <div style="font-size:12px; color:var(--text-2); margin-bottom:14px; line-height:1.5;">
        سيتم حفظ الصنف فوراً في قاعدة بيانات الأصناف (الكتالوج) ليكون متاحاً في المخزن وفواتير الشراء والبيع، مع إدراجه مباشرة في هذا العرض.
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">اسم الصنف بالعربي *</label>
        <input type="text" id="qt-qp-name" class="input" placeholder="مثال: شوكولاتة كيندر بوينو 43 جم" required />
      </div>

      <div class="grid-2 gap-12 mb-12">
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">رمز الصنف (SKU / الكود)</label>
          <input type="text" id="qt-qp-sku" class="input mono" placeholder="يولد تلقائياً" />
        </div>
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">الوحدة الأساسية</label>
          <select id="qt-qp-unit" class="input">
            <option value="كرتون" selected>كرتون (Carton)</option>
            <option value="حبة">حبة (Piece)</option>
            <option value="صندوق">صندوق (Box)</option>
            <option value="كيس">كيس (Bag)</option>
            <option value="شد">شد (Pack)</option>
            <option value="شوال">شوال (Sack)</option>
            <option value="علبة">علبة (Can)</option>
            <option value="كيلو">كيلو (Kilogram)</option>
            <option value="درزن">درزن (Dozen)</option>
            <option value="باليت">باليت (Pallet)</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">الفئة / التصنيف</label>
        <select id="qt-qp-category" class="input">
          <option value="">(بدون تصنيف)</option>
        </select>
      </div>

      <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:14px;">
        <div style="font-size:11.5px; font-weight:700; color:var(--text-1); margin-bottom:10px;">التسعير وهوامش الربح:</div>
        <div class="grid-3 gap-10">
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر التكلفة التقديري</label>
            <input type="number" id="qt-qp-cost" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('cost')" placeholder="0.00" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">هامش الربح %</label>
            <input type="number" id="qt-qp-margin" class="input mono" min="0" step="0.5" value="10"
              oninput="calcQuickProductPrice('margin')" placeholder="10" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر البيع (بدون ضريبة)</label>
            <input type="number" id="qt-qp-price" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('price')" placeholder="0.00" />
          </div>
        </div>
        <div id="qt-qp-vat-hint" style="font-size:11px; color:#059669; font-weight:700; margin-top:8px; text-align:left; direction:ltr;">
          السعر شامل الضريبة (15%): 0.00 ر.س
        </div>
      </div>

      <div id="qt-qp-error" class="alert bad hidden" style="font-size:12px; margin-top:8px;"></div>
    </div>
    <div class="modal-footer" style="padding:12px 20px; background:var(--bg-2); border-radius:0 0 12px 12px; gap:8px;">
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-quick-product-modal')">إلغاء</button>
      <button type="button" class="btn btn-primary" id="qt-qp-save-btn" onclick="saveQuickProduct()" style="background:#059669; border-color:#059669; font-weight:700;">
        ✨ حفظ وإدراج في عرض السعر
      </button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PRICE HISTORY MODAL (سجل وتاريخ أسعار البند)             -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-price-history-modal" style="z-index: 1060;">
  <div class="modal modal-lg" style="border-radius:14px; max-width:860px; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
    <div class="modal-header" style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color:#fff; border-radius:14px 14px 0 0; padding:16px 22px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">🕒</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:700; margin:0;" id="qt-ph-title">سجل أسعار الصنف في عروض الأسعار السابقة</h3>
          <div style="font-size:11.5px; color:#c7d2fe; margin-top:3px;" id="qt-ph-subtitle">...</div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:20px;" onclick="closeModal('qt-price-history-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px; max-height:72vh; overflow-y:auto;">
      <!-- Stats KPIs Cards -->
      <div class="grid-4 gap-10 mb-16" id="qt-ph-stats">
        <!-- Filled dynamically -->
      </div>

      <!-- Filter tabs: All vs Current Customer -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div class="tab-group" style="margin-bottom:0; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-secondary active" id="qt-ph-tab-all" onclick="switchPriceHistoryTab('all')" style="font-weight:700; border-radius:6px;">📋 جميع العملاء</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qt-ph-tab-cust" onclick="switchPriceHistoryTab('cust')" style="font-weight:700; border-radius:6px;">👤 العميل المحدد فقط</button>
        </div>
        <div style="font-size:12px; color:var(--text-2); font-weight:600;" id="qt-ph-count-hint"></div>
      </div>

      <!-- Table of previous quotation entries -->
      <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; background:var(--bg-1);">
        <table class="table" style="width:100%; margin:0; font-size:12px;">
          <thead style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
            <tr>
              <th style="padding:10px 12px; text-align:right;">رقم العرض</th>
              <th style="padding:10px 12px; text-align:right;">التاريخ</th>
              <th style="padding:10px 12px; text-align:right;">العميل</th>
              <th style="padding:10px 12px; text-align:center;">الوحدة والكمية</th>
              <th style="padding:10px 12px; text-align:center;">التكلفة / الهامش</th>
              <th style="padding:10px 12px; text-align:right;">السعر (بدون ضريبة)</th>
              <th style="padding:10px 12px; text-align:right;">شامل 15%</th>
              <th style="padding:10px 12px; text-align:center;">الإجراء</th>
            </tr>
          </thead>
          <tbody id="qt-ph-tbody">
            <!-- Rows filled dynamically -->
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer" style="padding:14px 22px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 اضغط على <strong>"استخدام هذا السعر 🎯"</strong> لنقل بيانات السعر والتكلفة مباشرة لسطر العرض الحالي.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-price-history-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SUPPLIER PRICE BANK & BATCH IMPORTER MODAL              -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-supplier-price-bank-modal" style="z-index: 1070;">
  <div class="modal modal-xl" style="max-height:94vh; display:flex; flex-direction:column; width:96%; max-width:1200px; border-radius:14px; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
    <div class="modal-header" style="background:linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #3a506b 100%); color:#fff; padding:16px 24px; border-radius:14px 14px 0 0;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:26px;">🏢</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16.5px; font-weight:800; margin:0;">
            بنك أسعار وقوائم الموردين الذكي (استيراد وإدارة عروض أسعار الموردين)
          </h3>
          <div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">
            استيراد عروض أسعار وقوائم الموردين (PDF / Excel) وبناء قاعدة بيانات تكاليف الشراء للربط الفوري في عروض الأسعار
          </div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:22px;" onclick="closeModal('qt-supplier-price-bank-modal')">×</button>
    </div>

    <!-- Navigation Tabs -->
    <div style="padding:10px 24px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div class="tab-group" style="margin-bottom:0; display:flex; gap:6px;">
        <button type="button" id="tab-btn-sup-import" class="btn btn-sm btn-primary active" onclick="switchSupplierBankTab('import')" style="font-weight:700; border-radius:6px;">
          📥 استيراد ملفات عروض الموردين (PDF / Excel / نسخ)
        </button>
        <button type="button" id="tab-btn-sup-search" class="btn btn-sm btn-secondary" onclick="switchSupplierBankTab('search')" style="font-weight:700; border-radius:6px;">
          🔍 استعراض وبحث في أسعار الموردين المسجلة
        </button>
        <button type="button" id="tab-btn-sup-lists" class="btn btn-sm btn-secondary" onclick="switchSupplierBankTab('lists')" style="font-weight:700; border-radius:6px;">
          📋 قوائم وملفات الموردين المحفوظة (<span id="qt-sup-lists-count">0</span>)
        </button>
      </div>
      <div id="qt-sup-bank-stats-badge" style="font-size:12px; font-weight:700; color:#059669; background:rgba(16,185,129,0.1); padding:4px 10px; border-radius:6px;">
        📦 إجمالي الأصناف المسجلة: <span id="qt-sup-total-items-badge">0</span> صنف
      </div>
    </div>

    <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px;">
      
      <!-- TAB 1: IMPORT SUPPLIER QUOTATION (PDF / EXCEL / PASTE) -->
      <div id="sup-bank-pane-import">
        
        <!-- Supplier & File Meta Configuration Box -->
        <div style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border:1.5px solid #cbd5e1; border-radius:12px; padding:16px 20px; margin-bottom:16px;">
          <div class="grid-3 gap-14 mb-12">
            
            <!-- Supplier Selector or New Name -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b; display:flex; justify-content:space-between;">
                <span>المورد صاحب العرض / القائمة *</span>
                <span style="font-size:10.5px; color:#2563eb; font-weight:600;">(اختر أو اكتب جديد)</span>
              </label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="qt-sup-import-name" class="input" style="font-weight:700; font-size:13px; border-color:#94a3b8; background:#fff;"
                  placeholder="مثال: شركة البركة للمواد الغذائية..." list="qt-sup-import-datalist" />
                <datalist id="qt-sup-import-datalist"></datalist>
              </div>
            </div>

            <!-- Quote Date -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b;">تاريخ عرض السعر / القائمة *</label>
              <input type="date" id="qt-sup-import-date" class="input font-bold" style="background:#fff; border-color:#94a3b8;" />
            </div>

            <!-- Tax Mode of Supplier File -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b;">طبيعة أسعار المورد بالملف:</label>
              <select id="qt-sup-import-tax-mode" class="input font-bold" style="background:#fff; border-color:#94a3b8;" onchange="reapplySupplierTaxMode()">
                <option value="exclusive" selected>💵 أسعار صافية غير شاملة الضريبة (افتراضي)</option>
                <option value="inclusive">🏷️ أسعار شاملة ضريبة 15% (استخراج الصافي تلقائياً)</option>
              </select>
            </div>
          </div>

          <!-- Method Tabs (Upload File vs Direct Paste) -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:10px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; gap:8px;">
              <button type="button" id="tab-btn-sup-subfile" class="btn btn-sm btn-primary" onclick="switchSupplierSubTab('file')" style="border-radius:6px; font-size:11.5px; font-weight:700;">
                📂 رفع ملف (Excel / PDF)
              </button>
              <button type="button" id="tab-btn-sup-subpaste" class="btn btn-sm btn-secondary" onclick="switchSupplierSubTab('paste')" style="border-radius:6px; font-size:11.5px; font-weight:700;">
                📋 نسخ ولصق مباشر (Ctrl+V)
              </button>
            </div>
            <div style="font-size:11.5px; color:#64748b;">
              💡 يدعم قراءة كافة ملفات الإكسيل (.xlsx / .xls / .csv) وملفات الـ PDF مع استخراج الأسماء والوحدات والأسعار بدقة 100%.
            </div>
          </div>
        </div>

        <!-- File Drag & Drop Area -->
        <div id="sup-subpane-file">
          <div id="qt-sup-dropzone" style="border:2.5px dashed #94a3b8; border-radius:14px; padding:32px 20px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
            onclick="document.getElementById('qt-sup-file-input').click()"
            ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='rgba(37,99,235,0.05)';"
            ondragleave="this.style.borderColor='#94a3b8'; this.style.background='var(--bg-2)';"
            ondrop="handleSupplierFileDrop(event)">
            <div style="font-size:40px; margin-bottom:6px;">🏢 📊 📄</div>
            <div style="font-weight:800; color:var(--text-0); font-size:15px; margin-bottom:4px;">
              اسحب وأفلت ملف عرض سعر المورد (Excel أو PDF) هنا
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">أو اضغط لاختيار الملف من جهازك</div>
            <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; font-weight:700;">
              📁 تصفح واختيار الملف
            </button>
          </div>
          <input type="file" id="qt-sup-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none;" onchange="handleSupplierFileInput(event)" />
        </div>

        <!-- Direct Paste Area -->
        <div id="sup-subpane-paste" class="hidden">
          <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px;">
            <div style="font-size:12.5px; font-weight:700; color:var(--text-1); margin-bottom:6px;">
              📋 الصق جدول أسعار المورد هنا (حدد البيانات في Excel واضغط Ctrl+C ثم اضغط Ctrl+V هنا):
            </div>
            <textarea id="qt-sup-paste-area" class="input mono" rows="5" style="width:100%; font-size:11.5px; resize:vertical;"
              placeholder="اسم الصنف	الوحدة	سعر التكلفة (قبل الضريبة)
زيت شيف 1.5 لتر	كرتون	95.00
أرز بسمتي الشعلان 10 ك	شوال	84.50
..."></textarea>
            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button type="button" class="btn btn-primary" onclick="handlePastedSupplierText()" style="font-weight:700; display:flex; align-items:center; gap:6px;">
                <span>⚡</span> تحليل وقراءة البيانات المنسوخة
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div id="qt-sup-import-loading" class="hidden" style="text-align:center; padding:32px;">
          <div class="loading-spinner" style="margin:0 auto 12px auto; width:36px; height:36px;"></div>
          <div style="font-size:13.5px; font-weight:700; color:var(--brand);" id="qt-sup-import-loading-text">جارٍ تحليل ملف المورد واستخراج بنود الأسعار...</div>
        </div>

        <!-- Error Alert -->
        <div id="qt-sup-import-error" class="alert bad hidden" style="margin-top:14px; font-size:12.5px;"></div>

        <!-- PREVIEW PARSED SUPPLIER ITEMS AREA -->
        <div id="qt-sup-preview-area" class="hidden" style="margin-top:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h4 style="color:var(--text-0); font-size:14px; font-weight:800; margin:0;">
                📋 مراجعة الأصناف والأسعار المستخرجة من عرض المورد:
              </h4>
              <span class="badge" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; font-weight:700; font-size:11.5px;" id="qt-sup-stat-count">0 صنف</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button type="button" class="btn btn-sm btn-ghost" onclick="toggleSupplierExtractedDirection()" style="font-size:11.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:#1e40af;">🔀 عكس / تعديل اتجاه النص العربي</button>
              <button type="button" class="btn btn-sm btn-ghost text-bad" onclick="clearExtractedSupplierItems()" style="font-size:11px; font-weight:700;">🗑️ مسح الكل</button>
              <button type="button" class="btn btn-sm btn-secondary" onclick="addManualSupplierItemRow()" style="font-size:11px; font-weight:700;">➕ إضافة سطر يدوياً</button>
            </div>
          </div>

          <div class="table-container" style="max-height:380px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
            <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
              <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
                <tr>
                  <th style="width:32px; text-align:center;"><input type="checkbox" id="qt-sup-select-all" checked onchange="toggleAllSupplierImportItems(this.checked)" /></th>
                  <th style="width:30px; text-align:center;">#</th>
                  <th style="min-width:260px;">اسم الصنف عند المورد *</th>
                  <th style="width:90px; text-align:center;">الكود / SKU</th>
                  <th style="width:85px; text-align:center;">الوحدة</th>
                  <th style="width:110px; text-align:left; color:#166534;">السعر قبل الضريبة (ر.س) *</th>
                  <th style="width:100px; text-align:left; color:#0284c7;">شامل 15%</th>
                  <th style="width:120px;">ملاحظات</th>
                  <th style="width:36px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="qt-sup-parsed-tbody"></tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:12px 18px; flex-wrap:wrap; gap:10px;">
            <div style="font-size:12px; color:var(--text-2);">
              💡 يمكنك تعديل أي اسم أو وحدة أو سعر مباشرة في الجدول قبل الحفظ.
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-ghost" onclick="resetSupplierImport()">🔄 اختيار ملف آخر</button>
              <button type="button" class="btn btn-primary" id="qt-sup-save-bank-btn" onclick="saveExtractedSupplierPricesToBank()" style="background:linear-gradient(135deg,#059669,#047857); border-color:#047857; font-weight:800; padding:8px 22px; font-size:13px; box-shadow:0 3px 10px rgba(5,150,105,0.25);">
                ✨ حفظ وتثبيت أسعار هذا المورد في قاعدة البيانات
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- TAB 2: SEARCH & BROWSE ALL SUPPLIER PRICES -->
      <div id="sup-bank-pane-search" class="hidden">
        <div style="display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; align-items:flex-end;">
          <div class="form-group mb-0" style="flex:1; min-width:280px;">
            <label style="font-size:11.5px; font-weight:700;">بحث سريع باسم الصنف لمعرفة أسعار الموردين:</label>
            <input type="text" id="qt-sup-search-input" class="input" style="font-size:12.5px; height:36px; font-weight:700;"
              placeholder="🔍 اكتب اسم الصنف للبحث والمقارنة الفورية..." oninput="renderSupplierBankSearchTable()" />
          </div>
          <div class="form-group mb-0" style="width:200px;">
            <label style="font-size:11.5px; font-weight:700;">تصفية بالمورد:</label>
            <select id="qt-sup-filter-supplier" class="input" style="height:36px; font-size:12px;" onchange="renderSupplierBankSearchTable()">
              <option value="">جميع الموردين</option>
            </select>
          </div>
        </div>

        <div class="table-container" style="max-height:480px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="min-width:220px;">اسم الصنف</th>
                <th style="min-width:180px;">المورد صاحب العرض</th>
                <th style="width:95px; text-align:center;">تاريخ التسعير</th>
                <th style="width:75px; text-align:center;">الوحدة</th>
                <th style="width:110px; text-align:left; color:#166534;">السعر قبل الضريبة</th>
                <th style="width:95px; text-align:left; color:#0284c7;">شامل 15%</th>
                <th style="width:130px; text-align:center;">الإجراء</th>
              </tr>
            </thead>
            <tbody id="qt-sup-search-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: UPLOADED SUPPLIER PRICE LISTS MANAGEMENT -->
      <div id="sup-bank-pane-lists" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-size:13.5px; font-weight:800;">📋 كافة عروض وقوائم أسعار الموردين المحفوظة بالبرنامج:</h4>
        </div>
        <div class="table-container" style="max-height:480px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="width:30px; text-align:center;">#</th>
                <th style="min-width:200px;">المورد</th>
                <th style="min-width:180px;">اسم الملف المرفوع</th>
                <th style="width:100px; text-align:center;">تاريخ العرض</th>
                <th style="width:85px; text-align:center;">عدد الأصناف</th>
                <th style="width:110px; text-align:center;">تاريخ الحفظ</th>
                <th style="width:120px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="qt-sup-lists-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 كافة الأسعار المسجلة في بنك الموردين تظهر تلقائياً أثناء كتابة أو اختيار أي صنف في عروض أسعار العملاء.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-supplier-price-bank-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SUPPLIER COST COMPARISON MODAL FOR QUOTATION ITEM        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-supplier-compare-modal" style="z-index: 1080;">
  <div class="modal modal-lg" style="border-radius:14px; max-width:880px; box-shadow:0 20px 45px rgba(0,0,0,0.22);">
    <div class="modal-header" style="background:linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%); color:#fff; border-radius:14px 14px 0 0; padding:16px 22px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:24px;">🏢</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800; margin:0;" id="qt-sc-title">مقارنة عروض وأسعار الموردين للصنف</h3>
          <div style="font-size:11.5px; color:#a7f3d0; margin-top:3px;" id="qt-sc-subtitle">...</div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:20px;" onclick="closeModal('qt-supplier-compare-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px; max-height:72vh; overflow-y:auto;">
      <!-- KPIs: Lowest Price, Highest Price, Average, Suppliers Count -->
      <div class="grid-4 gap-10 mb-16" id="qt-sc-stats">
        <!-- Filled dynamically -->
      </div>

      <!-- Table of Suppliers Offering This Product -->
      <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; background:var(--bg-1);">
        <table class="table" style="width:100%; margin:0; font-size:12px;">
          <thead style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
            <tr>
              <th style="padding:10px 12px; text-align:right;">اسم المورد</th>
              <th style="padding:10px 12px; text-align:center;">تاريخ التسعير</th>
              <th style="padding:10px 12px; text-align:center;">الوحدة</th>
              <th style="padding:10px 12px; text-align:left; color:#166534;">السعر قبل الضريبة (التكلفة)</th>
              <th style="padding:10px 12px; text-align:left; color:#0284c7;">شامل 15%</th>
              <th style="padding:10px 12px; text-align:center;">مصدر العرض / الملف</th>
              <th style="padding:10px 12px; text-align:center;">الإجراء</th>
            </tr>
          </thead>
          <tbody id="qt-sc-tbody">
            <!-- Filled dynamically -->
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer" style="padding:14px 22px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 اضغط على <strong>"اعتماد تكلفة هذا المورد 🎯"</strong> لنقل التكلفة مباشرة إلى سطر العرض وإعادة احتساب سعر البيع تلقائياً.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-supplier-compare-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- VIEW MODAL                                              -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-view-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 class="modal-title" id="qt-view-title">تفاصيل عرض السعر</h3>
      <button class="modal-close" onclick="closeModal('qt-view-modal')">×</button>
    </div>
    <div class="modal-body" id="qt-view-body" style="max-height:70vh;overflow-y:auto;"></div>
    <div class="modal-footer" style="gap:8px;flex-wrap:wrap;">
      <button class="btn btn-ghost" onclick="closeModal('qt-view-modal')">إغلاق</button>
      <button class="btn btn-secondary" onclick="printQuoteFromView()">🖨️ طباعة</button>
      <button class="btn" style="background:var(--good);color:#fff;" onclick="shareQuoteWhatsApp()">📱 واتساب</button>
      <button class="btn" style="background:#0284c7;color:#fff;font-weight:700;" onclick="window.openGoodsReceiptAckModal ? window.openGoodsReceiptAckModal({ quoteObj: window._currentViewQuote }) : import('./goods-receipt-ack.js?v=2.2').then(m => m.openGoodsReceiptAckModal({ quoteObj: window._currentViewQuote }))">📜 إقرار استلام وسند لأمر</button>
      <button class="btn btn-primary" id="qt-view-convert-btn" onclick="convertQuoteToInvoiceFromView()">🔄 تحويل لفاتورة</button>
    </div>
  </div>
</div>`;
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadDependencies() {
  try {
    [customers, products, salesReps, categories, suppliers, supplierPriceLists, warehouses, stockByWarehouse] = await Promise.all([
      getAll(COLS.customers(),  [orderBy("name")]),
      getAll(COLS.products(),   [orderBy("name")]),
      getAll(COLS.salesReps(),  [orderBy("name")]),
      getAll(COLS.categories(), [orderBy("name")]),
      getAll(COLS.suppliers(),  [orderBy("name")]).catch(() => []),
      getAll(COLS.supplierPriceLists(), [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.warehouses(), [orderBy("name")]).catch(() => []),
      getAll(COLS.stockByWarehouse()).catch(() => [])
    ]);

    buildStockIndex();
    populateWarehouseDropdown();

    try { priceLists = await getAll(COLS.priceLists()); } catch { priceLists = []; }

    const repOpts = salesReps.map(r =>
      `<option value="${r.id}" data-name="${r.name}">${r.name}</option>`).join("");
    const repSel = document.getElementById("qt-rep");
    if (repSel) repSel.innerHTML = '<option value="">بدون مندوب</option>' + repOpts;
    const repFilter = document.getElementById("qt-rep-filter");
    if (repFilter) repFilter.innerHTML = '<option value="">الكل</option>' + repOpts;

    // Populate category filter in Quote form
    const catFilter = document.getElementById("qt-product-category-filter");
    if (catFilter) {
      catFilter.innerHTML = '<option value="">كل الفئات</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }

    // Populate supplier datalists and badges
    populateSupplierBankDropdowns();
  } catch (err) {
    console.error("loadDependencies:", err);
  }
}

async function loadQuotesList() {
  const tbody = document.getElementById("qt-tbody");
  if (!tbody) return;
  try {
    let snap;
    try {
      snap = await getDocs(query(COLS.quotations(), orderBy("createdAt", "desc"), limit(500)));
    } catch (e2) {
      // Fallback without orderBy in case of index issues
      snap = await getDocs(query(COLS.quotations(), limit(500)));
    }

    // 2. Extra safety: if snap was empty or missing, try direct collection
    if ((!snap || snap.empty) && db && COMPANY_ID) {
      try {
        snap = await getDocs(collection(db, `companies/${COMPANY_ID}/quotations`));
      } catch (_) {}
    }

    quotations = (snap && snap.docs) ? snap.docs.map(d => ({ id: d.id, ...d.data() })) : [];

    // 3. Robust in-memory sorting: newest first (by createdAt or date)
    quotations.sort((a, b) => {
      const ta = a.createdAt?.seconds || (a.date ? new Date(a.date).getTime() / 1000 : 0);
      const tb = b.createdAt?.seconds || (b.date ? new Date(b.date).getTime() / 1000 : 0);
      return tb - ta;
    });

    renderQuotesList(quotations);
    updateDemandTabBadge();
    updateQuotesTabBadge();
  } catch (err) {
    console.error("loadQuotesList error:", err);
    if (tbody) tbody.innerHTML =
      `<tr><td colspan="9" class="text-bad" style="padding:16px;">خطأ: ${err.message}</td></tr>`;
  }
}

function updateQuotesTabBadge() {
  const badge = document.getElementById("qt-quotes-count-badge");
  if (badge) {
    badge.textContent = `${quotations.length} عرض`;
  }
}

function renderQuotesList(list) {
  const tbody = document.getElementById("qt-tbody");
  if (!tbody) return;

  const total     = list.length;
  const accepted  = list.filter(q => q.status === "accepted").length;
  const pending   = list.filter(q => q.status === "draft" || q.status === "sent").length;
  const converted = list.filter(q => q.status === "converted").length;
  const convPct   = total > 0 ? Math.round(converted / total * 100) : 0;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl("kpi-qt-total",    total);
  setEl("kpi-qt-accepted", accepted);
  setEl("kpi-qt-pending",  pending);
  setEl("kpi-qt-conv",     convPct + "%");
  setEl("qt-count-label",  total + " عرض");
  updateQuotesTabBadge();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد عروض أسعار</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(q => {
    const isExpired = q.status !== 'converted' && q.status !== 'accepted'
      && q.expiryDate && q.expiryDate < todayString();
    const canConvert = q.status !== 'converted';

    let marginHtml = "";
    const m = (q.markupPct !== undefined && q.markupPct !== null)
      ? parseFloat(q.markupPct)
      : (q.totalCost > 0 && q.subtotal
          ? Math.round(((q.subtotal - q.totalCost) / q.totalCost) * 100 * 100) / 100
          : ((q.marginPct !== undefined && q.marginPct !== null) ? parseFloat(q.marginPct) : null));
    if (m !== null && !isNaN(m)) {
      const isPos = m >= 0;
      marginHtml = `<div style="font-size:10px;font-weight:700;color:${isPos?'#059669':'#dc2626'};margin-top:2px;" title="نسبة هامش الربح الإجمالي على التكلفة">هامش: ${isPos?'+':''}${m.toFixed(1)}%</div>`;
    }

    return `
      <tr class="qt-row" data-id="${q.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">${q.quoteNumber || '—'}</td>
        <td class="dim">${isoToDisplay(q.date)}</td>
        <td><strong>${q.customerName || '—'}</strong></td>
        <td class="dim">${q.repName || '—'}</td>
        <td style="text-align:center;" class="mono">${(q.items||[]).length}</td>
        <td class="mono font-bold">
          ${formatCurrency(q.grandTotal || 0)}
          ${marginHtml}
        </td>
        <td>${isExpired ? statusBadge('expired') : statusBadge(q.status)}</td>
        <td class="${isExpired ? 'text-bad' : ''}">${isoToDisplay(q.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="${q.id}" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="gra" data-id="${q.id}" style="color:#0284c7;" title="إقرار استلام بضاعة وسند لأمر">📜</button>
            ${canConvert ? '<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="' + q.id + '" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>' : ''}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="${q.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="${q.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="${q.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Delegated event listener — replaces all inline onclick handlers
  // This avoids ID-escaping bugs and event propagation issues
  if (!tbody._qtListenerAttached) {
    tbody._qtListenerAttached = true;
    tbody.addEventListener('click', function qtHandler(e) {
      const actBtn = e.target.closest('.qt-act');
      if (actBtn) {
        e.stopPropagation();
        const id     = actBtn.dataset.id;
        const action = actBtn.dataset.action;
        if      (action === 'edit')    { const q = quotations.find(x => x.id === id); if (q) openQuoteForm(q); }
        else if (action === 'del')     { const q = quotations.find(x => x.id === id); deleteQuote(id, q ? q.quoteNumber || '' : ''); }
        else if (action === 'dup')     { const q = quotations.find(x => x.id === id); if (q) duplicateQuote(id); }
        else if (action === 'convert') { convertQuoteToInvoice(id); }
        else if (action === 'print')   { printQuote(id); }
        else if (action === 'gra')     { 
          const q = quotations.find(x => x.id === id); 
          if (q) {
            if (typeof window.openGoodsReceiptAckModal === "function") {
              window.openGoodsReceiptAckModal({ quoteObj: q });
            } else {
              import("./goods-receipt-ack.js?v=2.2").then(m => m.openGoodsReceiptAckModal({ quoteObj: q }));
            }
          }
        }
        return;
      }
      const row = e.target.closest('.qt-row');
      if (row && !e.target.closest('.qt-actions-cell')) {
        viewQuote(row.dataset.id, e);
      }
    });
  }
}

// ── Client-side filter ───────────────────────────────────────
window.filterQuotes = () => {
  const search = (document.getElementById("qt-search")?.value || "").trim().toLowerCase();
  const status = document.getElementById("qt-status-filter")?.value || "";
  const from   = document.getElementById("qt-from")?.value   || "";
  const to     = document.getElementById("qt-to")?.value     || "";
  const repId  = document.getElementById("qt-rep-filter")?.value || "";

  const filtered = quotations.filter(q => {
    if (search && !(
      (q.quoteNumber||"").toLowerCase().includes(search) ||
      (q.customerName||"").toLowerCase().includes(search)
    )) return false;
    if (status && q.status !== status) return false;
    const d = q.date || "";
    if (from && d < from) return false;
    if (to   && d > to)   return false;
    if (repId && q.repId !== repId) return false;
    return true;
  });
  renderQuotesList(filtered);
};

// ============================================================
// QUOTE FORM
// ============================================================
window.openQuoteForm = async (existingQuote = null) => {
  activeQuoteId = existingQuote?.id || null;
  let initialItems = existingQuote?.items;
  if (!initialItems) {
    try {
      const prefilledRaw = sessionStorage.getItem("idham_prefilled_quote_lines");
      if (prefilledRaw) {
        sessionStorage.removeItem("idham_prefilled_quote_lines");
        const parsed = JSON.parse(prefilledRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialItems = parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading prefilled quote items:", e);
    }
  }

  const plKey = existingQuote?.priceList || "standard";
  quoteItems = initialItems
    ? JSON.parse(JSON.stringify(initialItems)).map(item => {
        const prod = (typeof products !== "undefined" && Array.isArray(products)) ? products.find(p => p.id === item.productId) : null;
        
        // 1. Resolve unitPrice first
        const unitPrice = parseNum(item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : prod?.price), 0);
        
        // 2. Cost: If saved item already has cost > 0, strictly preserve it!
        let cost = parseNum(item.cost || item.unitCost || item.costPrice || item.purchasePrice || item.averageCost, 0);
        let lastPurchasePrice = parseNum(item.lastPurchasePrice, 0);
        let margin = (item.margin !== undefined && item.margin !== null && item.margin !== "") ? parseNum(item.margin, null) : null;
        
        if (cost <= 0) {
          // Only resolve if item had no saved cost
          const resolved = resolveItemEffectiveCost({ ...item, unitPrice, margin }, plKey);
          cost = resolved.cost || 0;
          lastPurchasePrice = resolved.lastPurchasePrice || (cost > 0 ? cost : 0);
          if (margin === null || isNaN(margin)) {
            margin = resolved.margin || 0;
          }
        }
        
        if (lastPurchasePrice <= 0 && cost > 0) {
          lastPurchasePrice = cost;
        }

        // 3. Margin: Strictly preserve saved margin if valid; otherwise calculate markup from cost & unitPrice
        if (margin === null || isNaN(margin)) {
          margin = (cost > 0 && unitPrice > 0) ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
        } else {
          margin = Math.round(margin * 100) / 100;
        }

        const qty = parseNum(item.qty, 1);
        const discount = parseNum(item.discount, 0);
        const gross = qty * unitPrice;
        const discAmt = gross * discount / 100;
        const total = Math.max(0, gross - discAmt);
        const vat = Math.round(total * 0.15 * 100) / 100;

        return {
          id: item.id || item.productId || ('custom_' + Math.random().toString(36).slice(2, 7)),
          productId: item.productId || "",
          productName: item.productName || prod?.name || "",
          unit: item.unit || prod?.unit || "Carton",
          qty: qty,
          unitPrice: Math.round(unitPrice * 100) / 100,
          price: Math.round(unitPrice * 100) / 100,
          cost: Math.round(cost * 100) / 100,
          lastPurchasePrice: Math.round(lastPurchasePrice * 100) / 100,
          margin: margin,
          discount: discount,
          total: Math.round(total * 100) / 100,
          vat: vat,
          grandTotal: Math.round((total + vat) * 100) / 100,
          isCustom: !!item.isCustom || !prod || String(item.productId || '').startsWith('adhoc_'),
          taxCategory: item.taxCategory || prod?.taxCategory || 'S'
        };
      })
    : [];

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  const today  = todayString();

  const titleEl = document.getElementById("qt-form-title");
  if (titleEl) titleEl.textContent = existingQuote?.id
    ? `تعديل العرض: ${existingQuote.quoteNumber}` : "عرض سعر جديد";

  setVal("qt-number",           existingQuote?.quoteNumber || "جارٍ التوليد…");
  setVal("qt-date",             existingQuote?.date        || today);
  setVal("qt-expiry",           existingQuote?.expiryDate  || addDays(today, 30));
  setVal("qt-customer-search",  existingQuote?.customerName || "");
  setVal("qt-customer-id",      existingQuote?.customerId   || "");
  setVal("qt-customer-name-val",existingQuote?.customerName || "");
  setVal("qt-delivery-address", existingQuote?.deliveryAddress || "");
  setVal("qt-rep",              existingQuote?.repId        || "");
  setVal("qt-pricelist",        existingQuote?.priceList    || "standard");
  updateTier1UI();
  setVal("qt-payment-terms",    existingQuote?.paymentTerms || "cash");
  setVal("qt-status",           existingQuote?.status       || "draft");
  setVal("qt-notes",            existingQuote?.notes        || "");
  setVal("qt-terms",            existingQuote?.terms        || "صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.");
  setVal("qt-extra-disc-type",  existingQuote?.extraDiscountType || "none");
  setVal("qt-extra-disc-val",   existingQuote?.extraDiscountVal  || "0");

  const warnEl = document.getElementById("qt-expiry-warn");
  if (warnEl) warnEl.style.display = "none";
  const errEl = document.getElementById("qt-form-error");
  if (errEl) errEl.classList.add("hidden");

  const formPrintBtn = document.getElementById("qt-form-print-btn");
  if (formPrintBtn) formPrintBtn.style.display = "inline-flex";

  populateWarehouseDropdown(existingQuote?.warehouseId || "");
  renderQuoteLines();
  openModal("qt-form-modal");
  refreshStockByWarehouse().then(() => renderQuoteLines());

  if (!existingQuote?.id) {
    generateInvoiceNumber("QT").then(num => {
      const el = document.getElementById("qt-number");
      if (el) el.value = num;
    }).catch(() => {});
  }
};

window.checkExpiryWarn = () => {
  const v    = document.getElementById("qt-expiry")?.value;
  const warn = document.getElementById("qt-expiry-warn");
  if (warn) warn.style.display = (v && v < todayString()) ? "block" : "none";
};

window.editQuote = (id) => {
  const q = quotations.find(x => x.id === id);
  if (q) openQuoteForm(q);
};

window.duplicateQuote = (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) return;
  const clone = JSON.parse(JSON.stringify(q));
  delete clone.id;
  clone.quoteNumber    = null;
  clone.status         = "draft";
  clone.date           = todayString();
  clone.expiryDate     = addDays(todayString(), 30);
  openQuoteForm(clone);
};

window.onPricelistChange = () => {
  const pl = document.getElementById("qt-pricelist")?.value || "standard";
  updateTier1UI();
  quoteItems = quoteItems.map(item => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return item;
    
    // Cost price basis (المتوسط المرجح أولاً)
    const cost = prod.averageCost || prod.costPrice || prod.lastPurchasePrice || prod.avgCostPrice || prod.purchasePrice || 0;
    
    let price = 0;
    if (pl === "tier1") {
      const marginPct = getTier1MarginForProduct(prod);
      price = cost > 0 ? (cost * (1 + marginPct / 100)) : 0;
    } else if (pl === "wholesale") {
      price = cost > 0 ? (cost * (1 + plMargins.wholesaleMargin / 100)) : 0;
    } else if (pl === "distributor") {
      price = cost > 0 ? (cost * (1 + plMargins.distributorMargin / 100)) : 0;
    } else {
      // standard / retail
      price = cost > 0 ? (cost * (1 + plMargins.retailMargin / 100)) : 0;
    }

    // Fallback if price is 0 (or cost is 0), divide selling price by 1.15 to get pre-tax
    if (price <= 0) {
      const saleBase = prod.salePrice || prod.priceRetail || prod.price || 0;
      price = Math.round((saleBase / 1.15) * 100) / 100;
    } else {
      price = Math.round(price * 100) / 100;
    }

    // Update margin percentage locally
    const margin = cost > 0 ? Math.round(((price / cost) - 1) * 100 * 100) / 100 : 0;

    return { ...item, cost, unitPrice: price, margin };
  });
  renderQuoteLines();
};

window.onQtRowKey = (e, index, field) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const searchInput = document.getElementById("qt-product-search");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else if (e.key === "ArrowDown") {
    const nextEl = document.getElementById(`qt-row-${field}-${index + 1}`);
    if (nextEl) { e.preventDefault(); nextEl.focus(); nextEl.select(); }
  } else if (e.key === "ArrowUp") {
    const prevEl = document.getElementById(`qt-row-${field}-${index - 1}`);
    if (prevEl) { e.preventDefault(); prevEl.focus(); prevEl.select(); }
  }
};

window.toggleQtExtraDetails = () => {
  const el = document.getElementById("qt-extra-details-drawer");
  if (!el) return;
  const isHidden = el.style.display === "none";
  el.style.display = isHidden ? "flex" : "none";
  const btn = document.getElementById("qt-extra-details-btn");
  if (btn) {
    btn.style.background = isHidden ? "#2563eb" : "";
    btn.style.color = isHidden ? "#fff" : "";
  }
};

// ── Lines ────────────────────────────────────────────────────
function renderQuoteLines() {
  const tbody = document.getElementById("qt-lines-tbody");
  if (!tbody) return;

  if (!quoteItems.length) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:20px;
      color:var(--text-2);font-size:12px;">ابحث عن صنف أعلاه لإضافته</td></tr>`;
    recalcTotals();
    return;
  }

  const curCustId = document.getElementById("qt-customer-id")?.value;

  tbody.innerHTML = quoteItems.map((line, i) => {
    const qty = parseNum(line.qty, 0);
    const unitPrice = parseNum(line.unitPrice !== undefined ? line.unitPrice : line.price, 0);
    const cost = parseNum(line.cost, 0);
    let margin = (line.margin !== undefined && line.margin !== null && line.margin !== "") ? parseNum(line.margin, null) : null;
    if (margin === null || isNaN(margin)) {
      margin = (cost > 0 && unitPrice > 0) ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
    } else {
      margin = Math.round(margin * 100) / 100;
    }
    const discRate = parseNum(line.discount, 0);
    const gross   = qty * unitPrice;
    const disc    = gross * discRate / 100;
    const net     = gross - disc;
    const vat     = Math.round(net * 0.15 * 100) / 100;
    const total   = Math.round((net + vat) * 100) / 100;
    const isCustom = !!line.isCustom || String(line.productId || "").startsWith("adhoc_");

    // Look up historical quotations for this product name
    const history = (line.productName && line.productName.trim().length >= 2) ? getQuotationPriceHistory(line.productName) : [];
    const latest = history.length > 0 ? history[0] : null;
    const sameCustMatch = (curCustId && history.length > 0) ? history.find(h => h.customerId === curCustId) : null;

    // Look up supplier prices for this product name
    const supQuotes = (line.productName && line.productName.trim().length >= 2) ? getSupplierPricesForProduct(line.productName) : [];
    const cheapestSup = supQuotes.length > 0 ? supQuotes[0] : null;

    let historyHintHtml = "";
    if (latest) {
      historyHintHtml = `
        <div style="margin-top:4px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; background:rgba(99,102,241,0.06); padding:3px 8px; border-radius:5px; border:1px dashed rgba(99,102,241,0.35);">
          <span style="color:#4338ca; font-weight:700;">🕒 آخر تسعير سابق:</span>
          <span class="mono" style="font-weight:800; color:#1e1b4b;">${formatCurrency(latest.unitPrice)}</span>
          <span style="color:var(--text-2); font-size:10px;">(${latest.customerName || 'عميل'} — ${isoToDisplay(latest.date)})</span>
          ${sameCustMatch && sameCustMatch.quoteNumber !== latest.quoteNumber ? `
            <span style="color:#059669; font-weight:700; margin-right:4px; font-size:10px;">| لنفس العميل: ${formatCurrency(sameCustMatch.unitPrice)}</span>
          ` : ''}
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#059669; padding:0 5px; font-weight:800; height:20px; background:rgba(16,185,129,0.1); border-radius:3px;"
            onclick="applyInlineHistoryPrice(${i})" title="تطبيق هذا السعر (${latest.unitPrice} ر.س) والتكلفة مباشرة على السطر">
            ⚡ تطبيق السعر
          </button>
        </div>
      `;
    }

    let supplierHintHtml = "";
    if (cheapestSup) {
      supplierHintHtml = `
        <div style="margin-top:3px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; background:rgba(16,185,129,0.07); padding:3px 8px; border-radius:5px; border:1px dashed rgba(16,185,129,0.45);">
          <span style="color:#065f46; font-weight:700;">🏢 تكلفة الموردين:</span>
          <span style="color:#047857; font-weight:800;">⭐ ${cheapestSup.supplierName}: <span class="mono">${formatCurrency(cheapestSup.costPrice)}</span></span>
          <span style="color:var(--text-2); font-size:10px;">(قبل الضريبة — ${isoToDisplay(cheapestSup.quoteDate)})</span>
          ${supQuotes.length > 1 ? `<span style="color:#0369a1; font-weight:700; font-size:10px;">| (${supQuotes.length} موردين)</span>` : ''}
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#059669; padding:0 6px; font-weight:800; height:20px; background:rgba(16,185,129,0.15); border-radius:3px;"
            onclick="applyCheapestSupplierCost(${i})" title="اعتماد سعر هذا المورد (${cheapestSup.costPrice} ر.س) كتكلفة لهذا السطر مع احتساب هامش الربح">
            ⚡ اعتماد تكلفة ${cheapestSup.supplierName.slice(0, 15)} (${formatCurrency(cheapestSup.costPrice)})
          </button>
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#4338ca; padding:0 6px; font-weight:700; height:20px; background:rgba(99,102,241,0.08); border-radius:3px;"
            onclick="openSupplierCompareModal(${i})" title="مقارنة كافة أسعار الموردين لهذا الصنف">
            🔍 مقارنة الموردين (${supQuotes.length})
          </button>
        </div>
      `;
    }

    const curWhId = document.getElementById("qt-warehouse")?.value || "";
    const lineStock = line.productId && !isCustom ? getProductStockQty(line.productId, curWhId) : null;
    const lineTotalStock = line.productId && !isCustom ? getProductStockQty(line.productId, null) : null;
    const lineStockBreakdown = line.productId && !isCustom ? getProductStockBreakdown(line.productId) : "";

    let lineStockBadgeHtml = "";
    if (lineStock !== null) {
      if (lineStock > 0) {
        lineStockBadgeHtml = `
          <span class="badge" style="background:rgba(16,185,129,0.14); color:#047857; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:3px;" title="${lineStockBreakdown}">
            📦 الرصيد بالمخزن: <strong>${lineStock}</strong> ${line.unit || ''}
            ${curWhId && lineTotalStock !== lineStock ? `<span style="opacity:0.8; font-size:9.5px;">(إجمالي: ${lineTotalStock})</span>` : ''}
          </span>
        `;
      } else {
        lineStockBadgeHtml = `
          <span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px; border:1px solid rgba(239,68,68,0.25); display:inline-flex; align-items:center; gap:3px;" title="${lineStockBreakdown}">
            ⚠️ الرصيد بالمخزن: 0 ${line.unit || ''}
            ${lineTotalStock > 0 ? `<span style="color:#059669; font-size:9.5px; font-weight:700;">(متوفر ${lineTotalStock} بمخازن أخرى)</span>` : ''}
          </span>
        `;
      }
    }

    let qtyStockHintHtml = "";
    if (lineStock !== null) {
      if (qty > lineStock && lineStock >= 0) {
        qtyStockHintHtml = `<div style="font-size:9.5px; color:#dc2626; font-weight:800; margin-top:2px; text-align:center; white-space:nowrap;" title="الكمية المطلوبة تتجاوز الرصيد الحالي بالمخزن">⚠️ الرصيد ${lineStock} فقط</div>`;
      } else if (lineStock > 0) {
        qtyStockHintHtml = `<div style="font-size:9.5px; color:#059669; font-weight:700; margin-top:2px; text-align:center; white-space:nowrap;">✓ متاح بالمخزن (${lineStock})</div>`;
      }
    }

    return `
      <tr id="qt-tr-${i}" style="border-bottom:1px solid var(--border-soft); ${isCustom ? 'background:rgba(245,158,11,0.03);' : ''}">
        <td style="padding:5px 8px;color:var(--text-2);font-size:11px;">${i+1}</td>
        <td style="padding:5px 8px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <input type="text" class="input" style="font-size:12.5px;font-weight:700;flex:1;min-width:180px;height:30px;${isCustom ? 'border-color:#fbbf24;background:#fffdf5;' : ''}"
              value="${(line.productName||'').replace(/"/g, '&quot;')}"
              placeholder="اكتب اسم الصنف..."
              oninput="onQtRowInput(${i},'productName',this.value)"
              onchange="updateQtLine(${i},'productName',this.value)" />
            ${isCustom ? `<span class="badge" style="background:#fef3c7;color:#b45309;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;">⚡ بند حر</span>` : (line.sku ? `<span style="font-size:10px;color:var(--text-2);font-family:monospace;">${line.sku}</span>` : '')}
            ${lineStockBadgeHtml}
            ${(() => {
              const curPl = document.getElementById("qt-pricelist")?.value;
              if (curPl === "tier1") {
                const prod = (typeof products !== "undefined" && Array.isArray(products)) ? products.find(p => p.id === line.productId) : null;
                const grp = getProductTier1Group(prod || line);
                const mPct = getTier1MarginForProduct(prod || line);
                const grpText = grp === "basic" ? `🌾 أساسي (${mPct}%)` : grp === "high" ? `📦 تغليف (${mPct}%)` : `🥫 متوسط (${mPct}%)`;
                return `<span class="badge" style="background:rgba(5,150,105,0.12);color:#047857;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;font-weight:700;">${grpText}</span>`;
              }
              return '';
            })()}
            <button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#047857;padding:2px 6px;white-space:nowrap;font-weight:700;background:rgba(16,185,129,0.08);border-radius:4px;"
              title="عرض ومقارنة عروض أسعار الموردين لهذا الصنف"
              onclick="openSupplierCompareModal(${i})">🏢 أسعار الموردين (${supQuotes.length})</button>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#4f46e5;padding:2px 6px;white-space:nowrap;font-weight:700;background:rgba(99,102,241,0.08);border-radius:4px;"
              title="عرض سجل عروض الأسعار السابقة لهذا البند"
              onclick="openPriceHistoryModal(${i})">🕒 سجل الأسعار (${history.length})</button>
            ${isCustom ? `<button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#059669;padding:2px 6px;white-space:nowrap;font-weight:700;"
              title="تسجيل هذا البند كصنف دائم في الكتالوج"
              onclick="registerAdhocProduct(${i})">💾 تسجيل بالكتالوج</button>` : ''}
          </div>
          ${supplierHintHtml}
          ${historyHintHtml}
        </td>
        <td style="padding:6px 8px;">
          <input type="text" class="input" style="width:72px;height:32px;font-size:11.5px;text-align:center;padding:2px;font-weight:600;${isCustom ? 'border-color:#fbbf24;' : ''}"
            value="${line.unit || 'كرتون'}"
            placeholder="الوحدة"
            oninput="onQtRowInput(${i},'unit',this.value)"
            onchange="updateQtLine(${i},'unit',this.value)" />
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-qty-${i}" class="input mono qt-line-qty no-spin" data-row="${i}" style="width:85px;height:32px;font-size:12.5px;font-weight:800;text-align:center;${lineStock !== null && qty > lineStock ? 'border-color:#ef4444;background:#fff5f5;' : ''}"
            value="${line.qty}" min="0.001" step="0.001"
            onwheel="this.blur()"
            oninput="onQtRowInput(${i},'qty',this.value)"
            onchange="updateQtLine(${i},'qty',this.value)"
            onkeydown="window.onQtRowKey(event, ${i}, 'qty')" />
          ${qtyStockHintHtml}
        </td>
        <td class="no-print" style="padding:6px 8px;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <input type="number" id="qt-row-cost-${i}" class="input mono no-spin" style="width:95px;height:32px;font-size:12px;font-weight:700;text-align:center;background:#f9f9ff;border-color:#d0d4f0;"
              value="${cost > 0 ? Number(cost.toFixed(2)) : 0}" min="0" step="0.01"
              onwheel="this.blur()"
              title="سعر التكلفة (آخر شراء / تقديري)"
              oninput="onQtRowInput(${i},'cost',this.value)"
              onchange="updateQtLineCost(${i},this.value)"
              onkeydown="window.onQtRowKey(event, ${i}, 'cost')" />
            ${line.lastPurchasePrice ? `<span style="font-size:9.5px;color:#059669;font-weight:600;text-align:center;" title="آخر سعر شراء مسجل من فواتير الشراء">آخر: ${formatCurrency(line.lastPurchasePrice)}</span>` : ''}
          </div>
        </td>
        <td class="no-print" style="padding:6px 8px;">
          <input type="number" id="qt-row-margin-${i}" class="input mono no-spin" style="width:85px;height:32px;font-size:12px;font-weight:700;text-align:center;background:#f0fdf4;border-color:#86efac;color:#166534;"
            value="${margin !== undefined && margin !== null && !isNaN(margin) ? Number(margin.toFixed(2)) : 0}" step="0.1"
            onwheel="this.blur()"
            title="نسبة هامش الربح %"
            oninput="onQtRowInput(${i},'margin',this.value)"
            onchange="updateQtLineMargin(${i},this.value)"
            onkeydown="window.onQtRowKey(event, ${i}, 'margin')" />
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-price-${i}" class="input mono no-spin" style="width:115px;height:32px;font-size:12.5px;font-weight:800;text-align:center;background:#eff6ff;border-color:#3b82f6;color:#1e3a8a;"
            value="${unitPrice > 0 ? Number(unitPrice.toFixed(2)) : 0}" min="0" step="0.01"
            onwheel="this.blur()"
            title="السعر غير شامل الضريبة"
            oninput="onQtRowInput(${i},'unitPrice',this.value)"
            onchange="updateQtLine(${i},'unitPrice',this.value)"
            onkeydown="window.onQtRowKey(event, ${i}, 'price')" />
          <div id="qt-row-inc-${i}" style="font-size:9.5px;color:#2563eb;font-weight:700;margin-top:2px;text-align:center;white-space:nowrap;" title="السعر شامل 15% ضريبة">
            شامل: ${formatCurrency(Math.round(unitPrice * 1.15 * 100) / 100)}
          </div>
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-disc-${i}" class="input mono no-spin" style="width:72px;height:32px;font-size:12px;text-align:center;"
            value="${discRate || 0}" min="0" max="100" step="0.1"
            onwheel="this.blur()"
            oninput="onQtRowInput(${i},'discount',this.value)"
            onchange="updateQtLine(${i},'discount',this.value)"
            onkeydown="window.onQtRowKey(event, ${i}, 'disc')" />
        </td>
        <td style="padding:5px 8px;" class="mono font-semibold" id="qt-row-net-${i}">${formatCurrency(net)}</td>
        <td style="padding:5px 8px;color:var(--warn);" class="mono" id="qt-row-vat-${i}">${formatCurrency(vat)}</td>
        <td style="padding:5px 8px;font-weight:700;" class="mono" id="qt-row-total-${i}">${formatCurrency(total)}</td>
        <td style="padding:5px 8px;">
          <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);"
            onclick="removeQtLine(${i})">✕</button>
        </td>
      </tr>`;
  }).join("");

  recalcTotals();
}

window.onQtRowInput = (i, field, val) => {
  if (!quoteItems[i]) return;
  if (field === 'productName' || field === 'unit') {
    quoteItems[i][field] = val;
    return;
  }
  const numericVal = parseNum(val, 0);
  quoteItems[i][field] = numericVal;

  let cost = parseNum(quoteItems[i].cost, 0);
  let margin = parseNum(quoteItems[i].margin, 0);
  let unitPrice = parseNum(quoteItems[i].unitPrice, 0);
  let qty = parseNum(quoteItems[i].qty, 0);
  let disc = parseNum(quoteItems[i].discount, 0);

  if (field === 'unitPrice') {
    if (cost > 0) {
      margin = Math.round(((numericVal / cost) - 1) * 100 * 100) / 100;
      quoteItems[i].margin = margin;
      const marginEl = document.getElementById(`qt-row-margin-${i}`);
      if (marginEl) marginEl.value = Number(margin.toFixed(2));
    } else if (numericVal > 0 && margin > 0) {
      cost = Math.round((numericVal / (1 + margin / 100)) * 100) / 100;
      quoteItems[i].cost = cost;
      const costEl = document.getElementById(`qt-row-cost-${i}`);
      if (costEl) costEl.value = Number(cost.toFixed(2));
    }
  } else if (field === 'margin') {
    if (cost > 0) {
      unitPrice = Math.round(cost * (1 + numericVal / 100) * 100) / 100;
      quoteItems[i].unitPrice = unitPrice;
      const priceEl = document.getElementById(`qt-row-price-${i}`);
      if (priceEl) priceEl.value = Number(unitPrice.toFixed(2));
    } else if (unitPrice > 0 && numericVal > 0) {
      cost = Math.round((unitPrice / (1 + numericVal / 100)) * 100) / 100;
      quoteItems[i].cost = cost;
      const costEl = document.getElementById(`qt-row-cost-${i}`);
      if (costEl) costEl.value = Number(cost.toFixed(2));
    }
  } else if (field === 'cost') {
    if (cost > 0 && unitPrice > 0) {
      margin = Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100;
      quoteItems[i].margin = margin;
      const marginEl = document.getElementById(`qt-row-margin-${i}`);
      if (marginEl) marginEl.value = Number(margin.toFixed(2));
    } else if (cost > 0 && margin > 0) {
      unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
      quoteItems[i].unitPrice = unitPrice;
      const priceEl = document.getElementById(`qt-row-price-${i}`);
      if (priceEl) priceEl.value = Number(unitPrice.toFixed(2));
    }
  }

  // Update row totals dynamically
  const gross = qty * quoteItems[i].unitPrice;
  const discAmt = gross * disc / 100;
  const net = gross - discAmt;
  const vat = Math.round(net * 0.15 * 100) / 100;
  const total = Math.round((net + vat) * 100) / 100;

  const incEl = document.getElementById(`qt-row-inc-${i}`);
  if (incEl) incEl.textContent = `شامل: ${formatCurrency(Math.round(quoteItems[i].unitPrice * 1.15 * 100)/100)}`;
  const netEl = document.getElementById(`qt-row-net-${i}`);
  if (netEl) netEl.textContent = formatCurrency(net);
  const vatEl = document.getElementById(`qt-row-vat-${i}`);
  if (vatEl) vatEl.textContent = formatCurrency(vat);
  const totEl = document.getElementById(`qt-row-total-${i}`);
  if (totEl) totEl.textContent = formatCurrency(total);

  recalcTotals();
};

window.refreshQuoteItemCostsFromPurchases = async (btn) => {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> جارٍ التحديث…`;
  }
  try {
    const { syncProductCostsFromPurchaseInvoices } = await import("../utils/product-cost-sync.js");
    const { productsMap } = await syncProductCostsFromPurchaseInvoices(true);
    
    // Reload products cache
    products = await getAll(COLS.products());
    
    const priceListKey = document.getElementById("qt-pricelist")?.value || "standard";
    let updatedCount = 0;
    
    quoteItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const syncInfo = productsMap[item.productId];
      const newCost = syncInfo?.averageCost || syncInfo?.costPrice || syncInfo?.lastPurchasePrice || syncInfo?.avgCostPrice || prod?.averageCost || prod?.costPrice || prod?.lastPurchasePrice || prod?.avgCostPrice || prod?.purchasePrice || 0;
      
      if (newCost > 0) {
        item.cost = newCost;
        item.lastPurchasePrice = syncInfo?.lastPurchasePrice || prod?.lastPurchasePrice || newCost;
        
        let price = 0;
        if (priceListKey === "tier1") {
          const marginPct = getTier1MarginForProduct(prod || item);
          price = newCost * (1 + marginPct / 100);
        } else if (priceListKey === "wholesale") {
          price = newCost * (1 + (plMargins?.wholesaleMargin || 7) / 100);
        } else if (priceListKey === "distributor") {
          price = newCost * (1 + (plMargins?.distributorMargin || 5) / 100);
        } else {
          price = newCost * (1 + (plMargins?.retailMargin || 10) / 100);
        }
        item.unitPrice = Math.round(price * 100) / 100;
        item.margin = Math.round(((item.unitPrice / newCost) - 1) * 100 * 100) / 100;
        updatedCount++;
      }
    });
    
    renderQuoteLines();
    showToast(`تم تحديث تكاليف وهوامش أسعار (${updatedCount}) صنف من فواتير الشراء بنجاح ✅`, "success");
  } catch (err) {
    showToast("فشل تحديث تكاليف عروض الأسعار: " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🔄</span> تحديث التكاليف من فواتير الشراء`;
    }
  }
};

window.updateQtLine = (idx, field, val) => {
  if (!quoteItems[idx]) return;
  if (field === 'productName' || field === 'unit') {
    quoteItems[idx][field] = val;
    return;
  }
  const numericVal = parseNum(val, 0);
  quoteItems[idx][field] = numericVal;
  if (field === 'unitPrice') {
    let cost = parseNum(quoteItems[idx].cost, 0);
    const margin = parseNum(quoteItems[idx].margin, 0);
    if (cost > 0) {
      quoteItems[idx].margin = Math.round(((numericVal / cost) - 1) * 100 * 100) / 100;
    } else if (numericVal > 0 && margin > 0) {
      quoteItems[idx].cost = Math.round((numericVal / (1 + margin / 100)) * 100) / 100;
    }
  }
  renderQuoteLines();
};

window.updateQtLineCost = (idx, val) => {
  const cost = parseNum(val, 0);
  quoteItems[idx].cost = Math.round(cost * 100) / 100;
  const unitPrice = parseNum(quoteItems[idx].unitPrice, 0);
  const margin = parseNum(quoteItems[idx].margin, 0);

  if (cost > 0 && unitPrice > 0) {
    quoteItems[idx].margin = Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100;
  } else if (cost > 0 && margin > 0) {
    quoteItems[idx].unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
  }
  renderQuoteLines();
};

window.updateQtLineMargin = (idx, val) => {
  const margin = parseNum(val, 0);
  quoteItems[idx].margin = Math.round(margin * 100) / 100;
  let cost = parseNum(quoteItems[idx].cost, 0);
  const unitPrice = parseNum(quoteItems[idx].unitPrice, 0);

  if (cost > 0) {
    quoteItems[idx].unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
  } else if (unitPrice > 0 && margin > 0) {
    quoteItems[idx].cost = Math.round((unitPrice / (1 + margin / 100)) * 100) / 100;
  }
  renderQuoteLines();
};

window.removeQtLine = (idx) => {
  quoteItems.splice(idx, 1);
  renderQuoteLines();
};

window.recalcTotals = () => {
  const edType = document.getElementById("qt-extra-disc-type")?.value || "none";
  const edVal  = document.getElementById("qt-extra-disc-val")?.value  || "0";
  const t = calcQuoteTotals(quoteItems, edType, edVal);
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s("qt-t-gross",        formatCurrency(t.grossTotal));
  s("qt-t-disc",         "- " + formatCurrency(t.totalDiscount));
  s("qt-t-subtotal",     formatCurrency(t.subtotal));
  s("qt-t-vat",          formatCurrency(t.vat));
  s("qt-t-grand",        formatCurrency(t.grandTotal));
  s("qt-t-cost",         formatCurrency(t.totalCost));
  s("qt-t-profit",       formatCurrency(t.totalProfit));

  const markupSign = t.markupPct >= 0 ? "+" : "";
  const markupText = `${markupSign}${t.markupPct.toFixed(2)}%`;
  s("qt-t-margin", markupText);
  s("qt-t-margin-badge", markupText);
  
  const marginSalesSign = t.marginPct >= 0 ? "+" : "";
  s("qt-t-margin-sales", `${marginSalesSign}${t.marginPct.toFixed(2)}%`);

  const avgSign = t.avgMarginPct >= 0 ? "+" : "";
  s("qt-t-avg-margin", `${avgSign}${t.avgMarginPct.toFixed(2)}%`);

  const isProfitable = t.totalProfit >= 0;
  const badgeEl = document.getElementById("qt-t-margin-badge");
  if (badgeEl) {
    badgeEl.style.background = isProfitable ? "#059669" : "#dc2626";
  }
  const profitRow = document.getElementById("qt-t-profit-row");
  if (profitRow) {
    profitRow.style.color = isProfitable ? "#059669" : "#dc2626";
  }
  const marginEl = document.getElementById("qt-t-margin");
  if (marginEl) {
    marginEl.style.color = isProfitable ? "#059669" : "#dc2626";
  }
};

// ── Autocompletes ─────────────────────────────────────────────
function setupCustomerAutocomplete() {
  const input   = document.getElementById("qt-customer-search");
  const results = document.getElementById("qt-customer-results");
  if (!input) return;

  // Immediate sync when typing or pasting: update hidden field and auto-match customers
  const syncCustomerInputs = () => {
    const rawVal = input.value.trim();
    const nameValEl = document.getElementById("qt-customer-name-val");
    if (nameValEl) nameValEl.value = rawVal;

    const idEl = document.getElementById("qt-customer-id");
    if (idEl) {
      if (!rawVal || rawVal === "عرض سعر عام (عميل عام)") {
        idEl.value = "general";
      } else {
        const matchedCust = customers.find(c => (c.name || "").trim().toLowerCase() === rawVal.toLowerCase());
        idEl.value = matchedCust ? matchedCust.id : "adhoc_customer";
      }
    }
  };

  input.addEventListener("input", syncCustomerInputs);
  input.addEventListener("change", syncCustomerInputs);

  input.addEventListener("input", debounce(() => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }
    const matched = customers.filter(c =>
      (c.name||"").toLowerCase().includes(term) || (c.phone||"").includes(term)
    ).slice(0, 10);

    if (!matched.length) {
      const safeTerm = term.replace(/'/g, "\\'").replace(/"/g, "&quot;");
      results.innerHTML = `
        <div style="padding:10px 14px; font-size:11.5px; color:var(--text-2); background:var(--bg-1);">
          عميل جديد / مخصص: <strong style="color:var(--text-1);">${safeTerm}</strong>
          <div style="font-size:10.5px; color:#059669; margin-top:2px;">✓ سيتم حفظ هذا العميل مباشرة في عرض السعر</div>
        </div>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched.map(c => {
      const isT1 = isCustomerTier1(c);
      const tierBadge = isT1 ? `<span class="badge" style="background:#059669;color:#fff;font-size:10px;padding:1px 6px;margin-right:6px;">💎 فئة أولى</span>` : '';
      return `
      <div class="autocomplete-item"
        onclick="selectQtCustomer('${c.id}','${(c.name||"").replace(/'/g,"\\'")}')">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700;">${c.name} ${tierBadge}</div>
          <div class="item-code">${c.phone || ""} ${c.vatNumber ? "| ض: " + c.vatNumber : ""}</div>
        </div>
      </div>`;
    }).join("");
    results.classList.remove("hidden");
  }, 250));

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target))
      results.classList.add("hidden");
  });
}

window.selectQtCustomer = (id, name) => {
  const s = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v; };
  s("qt-customer-id",       id);
  s("qt-customer-name-val", name);
  s("qt-customer-search",   name);
  document.getElementById("qt-customer-results")?.classList.add("hidden");

  const cust = customers.find(c => c.id === id);
  if (cust) {
    const addrInput = document.getElementById("qt-delivery-address");
    if (addrInput && !addrInput.value.trim() && cust.address) {
      addrInput.value = cust.address;
    }

    const plSelect = document.getElementById("qt-pricelist");
    if (isCustomerTier1(cust)) {
      if (plSelect && plSelect.value !== "tier1") {
        plSelect.value = "tier1";
        onPricelistChange();
      }
    } else {
      // Non-tier-1 customer: retain assigned list or default
      if (plSelect && plSelect.value === "tier1") {
        plSelect.value = cust.priceList || "standard";
        onPricelistChange();
      }
    }
  }
  updateTier1UI();
};

function setupProductAutocomplete() {
  const input   = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  const catFilter = document.getElementById("qt-product-category-filter");
  if (!input) return;

  const performSearch = () => {
    const rawTerm = input.value.trim();
    const term = rawTerm.toLowerCase();
    const catId = catFilter ? catFilter.value : "";
    const pl = document.getElementById("qt-pricelist")?.value || "standard";

    // If no term and no category, hide and return
    if (!term && !catId) {
      results.classList.add("hidden");
      return;
    }

    let matched = products;
    if (catId) {
      matched = matched.filter(p => p.category === catId);
    }
    if (term) {
      matched = matched.filter(p =>
        (p.name||"").toLowerCase().includes(term) ||
        (p.sku||"").toLowerCase().includes(term)  ||
        (p.barcode||"").includes(term)
      );
    }

    matched = matched.slice(0, 15);

    // Search historical ad-hoc items
    const matchedAdhoc = term ? getUniqueAdhocItemsFromQuotes(term) : [];

    // Search supplier price lists
    const matchedSuppliers = term ? getUniqueSupplierItems(term) : [];

    const safeTerm = (rawTerm || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");

    if (!matched.length && !matchedAdhoc.length && !matchedSuppliers.length) {
      results.innerHTML = `
        <div style="padding:14px;text-align:center;background:var(--bg-1);border-radius:8px;">
          <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;">
            الصنف <strong style="color:var(--text-1);">"${safeTerm}"</strong> غير موجود في دليل الأصناف أو عروض الأسعار أو قوائم الموردين
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="openQuickAddProductModal('${safeTerm}')" style="font-size:11.5px;padding:6px 12px;background:#059669;border-color:#059669;font-weight:700;">
              ➕ تسجيل "${safeTerm}" كصنف جديد في الكتالوج
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="addCustomQuoteLine('${safeTerm}')" style="font-size:11.5px;padding:6px 12px;color:#d97706;border-color:rgba(245,158,11,0.4);font-weight:700;">
              ⚡ إدراج كبند حر في العرض
            </button>
          </div>
        </div>`;
      results.classList.remove("hidden");
      return;
    }

    const itemsHtml = matched.map(p => {
      const cost = p.averageCost || p.costPrice || p.lastPurchasePrice || p.avgCostPrice || p.purchasePrice || 0;
      let price = 0;
      let tier1BadgeHtml = "";
      if (pl === "tier1") {
        const marginPct = getTier1MarginForProduct(p);
        const group = getProductTier1Group(p);
        const groupLabel = group === "basic" ? "🌾 أساسي" : group === "high" ? "📦 تغليف ومنظفات" : "🥫 متوسط";
        tier1BadgeHtml = `<span class="badge" style="background:rgba(5,150,105,0.12);color:#047857;font-size:10px;padding:1px 6px;">${groupLabel} (+${marginPct}%)</span>`;
        price = cost > 0 ? (cost * (1 + marginPct / 100)) : 0;
      } else if (pl === "wholesale") {
        price = cost > 0 ? (cost * (1 + plMargins.wholesaleMargin / 100)) : 0;
      } else if (pl === "distributor") {
        price = cost > 0 ? (cost * (1 + plMargins.distributorMargin / 100)) : 0;
      } else {
        price = cost > 0 ? (cost * (1 + plMargins.retailMargin / 100)) : 0;
      }

      // Fallback to salePrice / 1.15 if cost is 0
      if (price <= 0) {
        const saleBase = p.salePrice || p.priceRetail || p.price || 0;
        price = Math.round((saleBase / 1.15) * 100) / 100;
      } else {
        price = Math.round(price * 100) / 100;
      }

      // Display the final customer price (inclusive of 15% VAT) on the autocomplete item search results
      const displayPrice = price * 1.15;

      const currentWhId = document.getElementById("qt-warehouse")?.value || "";
      const stockQty = getProductStockQty(p.id, currentWhId);
      const totalStock = getProductStockQty(p.id, null);
      const stockBreakdown = getProductStockBreakdown(p.id);

      let stockBadgeHtml = "";
      if (stockQty > 0) {
        stockBadgeHtml = `
          <span class="badge" style="background:rgba(16,185,129,0.15); color:#047857; font-size:11px; font-weight:800; padding:2px 8px; border-radius:5px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:4px;" title="${stockBreakdown}">
            📦 متوفر بالمخزن: <strong>${stockQty}</strong> ${p.unit||'كرتون'}
            ${currentWhId && totalStock !== stockQty ? `<small style="opacity:0.8; font-weight:600;">(إجمالي: ${totalStock})</small>` : ''}
          </span>
        `;
      } else {
        stockBadgeHtml = `
          <span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:11px; font-weight:800; padding:2px 8px; border-radius:5px; border:1px solid rgba(239,68,68,0.25); display:inline-flex; align-items:center; gap:4px;" title="${stockBreakdown}">
            ⚠️ الرصيد بالمخزن: 0 ${p.unit||'كرتون'}
            ${totalStock > 0 ? `<small style="color:#059669; font-weight:700;">(متوفر ${totalStock} بمخازن أخرى)</small>` : ''}
          </span>
        `;
      }

      const safeName = (p.name||"").replace(/'/g, "\\'");
      const safeSku  = (p.sku||"").replace(/'/g, "\\'");
      return `
        <div class="autocomplete-item" style="padding:10px 14px; cursor:pointer;"
          onclick="addQtProduct('${p.id}','${safeName}',${price},'${p.unit||"PCS"}','${safeSku}', ${cost})">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;flex-wrap:wrap;">
              <span style="font-weight:700; color:var(--text-1); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
              ${p.sku ? `<span class="badge" style="font-size:10.5px; background:var(--bg-2); color:var(--text-2); padding:1px 6px;">${p.sku}</span>` : ''}
              <span class="badge" style="font-size:10.5px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${p.unit||"كرتون"}</span>
              ${stockBadgeHtml}
              ${tier1BadgeHtml}
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <span style="color:#059669; font-weight:600; font-size:11px; background:rgba(16,185,129,0.1); padding:2px 8px; border-radius:4px;">
                🛒 آخر شراء: ${formatCurrency(p.lastPurchasePrice || cost)}
              </span>
              <div style="text-align:left;">
                <span class="mono text-indigo font-bold" style="font-size:13px;" title="سعر البيع المقترح شامل الضريبة">${formatCurrency(displayPrice)}</span>
                <span class="dim" style="font-size:9.5px; display:block;">شامل 15%</span>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    let supItemsHtml = "";
    if (matchedSuppliers.length > 0) {
      supItemsHtml = `
        <div style="padding:6px 14px; background:rgba(6,78,59,0.08); border-top:1px solid rgba(6,78,59,0.2); border-bottom:1px solid rgba(6,78,59,0.2); font-size:11px; font-weight:800; color:#065f46; display:flex; align-items:center; justify-content:space-between;">
          <span>🏢 أصناف متوفرة في عروض أسعار الموردين (اضغط للإدراج مع التكلفة):</span>
          <span style="font-size:10px; color:#047857; font-weight:600;">(قوائم الموردين)</span>
        </div>
      ` + matchedSuppliers.map(sup => {
        const cost = sup.costPrice || 0;
        let price = cost > 0 ? (cost * (1 + (plMargins.retailMargin || 10) / 100)) : 0;
        price = Math.round(price * 100) / 100;
        const displayPrice = price * 1.15;
        const safeName = (sup.productName || "").replace(/'/g, "\\'");
        const safeUnit = (sup.unit || "كرتون").replace(/'/g, "\\'");
        return `
          <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; background:#f0fdf4;"
            onclick="addCustomQuoteLineWithData('${safeName}', '${safeUnit}', ${cost}, ${plMargins.retailMargin || 10}, ${price}, '')">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <span class="badge" style="font-size:10px; background:#dcfce7; color:#15803d; padding:2px 6px; font-weight:800;">🏢 مورد</span>
                <span style="font-weight:700; color:var(--text-1); font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sup.productName}</span>
                <span class="badge" style="font-size:10px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${sup.unit || "كرتون"}</span>
                <span style="font-size:10.5px; color:#047857; font-weight:600;">(${sup.supplierName} — ${isoToDisplay(sup.quoteDate)})</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                <span style="color:#059669; font-weight:700; font-size:11px; background:rgba(16,185,129,0.12); padding:2px 6px; border-radius:4px;">
                  🛒 تكلفة المورد: ${formatCurrency(cost)}
                </span>
                <div style="text-align:left;">
                  <span class="mono text-indigo font-bold" style="font-size:12.5px;" title="سعر البيع المقترح شامل الضريبة">${formatCurrency(displayPrice)}</span>
                  <span class="dim" style="font-size:9px; display:block;">شامل 15%</span>
                </div>
              </div>
            </div>
          </div>`;
      }).join("");
    }

    let adhocHtml = "";
    if (matchedAdhoc.length > 0) {
      adhocHtml = `
        <div style="padding:6px 14px; background:rgba(245,158,11,0.08); border-top:1px solid rgba(245,158,11,0.2); border-bottom:1px solid rgba(245,158,11,0.2); font-size:11px; font-weight:800; color:#b45309; display:flex; align-items:center; justify-content:space-between;">
          <span>🕒 بنود حرة مُسعّرة سابقاً في عروض الأسعار:</span>
          <span style="font-size:10px; color:#92400e; font-weight:600;">(اضغط للإدراج بنفس السعر والتكلفة)</span>
        </div>
      ` + matchedAdhoc.map(ad => {
        const displayPrice = (ad.unitPrice || 0) * 1.15;
        const safeName = (ad.productName || "").replace(/'/g, "\\'");
        const safeUnit = (ad.unit || "كرتون").replace(/'/g, "\\'");
        const safeSku = (ad.sku || "").replace(/'/g, "\\'");
        return `
          <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; background:#fffdf8;"
            onclick="addCustomQuoteLineWithData('${safeName}', '${safeUnit}', ${ad.cost || 0}, ${ad.margin || 0}, ${ad.unitPrice || 0}, '${safeSku}')">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <span class="badge" style="font-size:10px; background:#fef3c7; color:#b45309; padding:2px 6px; font-weight:800;">⚡ بند حر سابق</span>
                <span style="font-weight:700; color:var(--text-1); font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ad.productName}</span>
                <span class="badge" style="font-size:10px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${ad.unit || "كرتون"}</span>
                <span style="font-size:10.5px; color:var(--text-2);">(${ad.lastCustomerName || 'عميل'} — ${isoToDisplay(ad.lastQuotedDate)})</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                ${ad.cost > 0 ? `<span style="color:#059669; font-weight:600; font-size:10.5px; background:rgba(16,185,129,0.08); padding:2px 6px; border-radius:4px;">تكلفة: ${formatCurrency(ad.cost)}</span>` : ''}
                <div style="text-align:left;">
                  <span class="mono text-indigo font-bold" style="font-size:12.5px;" title="السعر المسعر سابقاً شامل الضريبة">${formatCurrency(displayPrice)}</span>
                  <span class="dim" style="font-size:9px; display:block;">شامل 15%</span>
                </div>
              </div>
            </div>
          </div>`;
      }).join("");
    }

    const bottomActionHtml = term ? `
      <div style="padding:8px 12px;background:var(--bg-2);border-top:1px dashed var(--border-soft);display:flex;justify-content:space-between;align-items:center;font-size:11px;">
        <span style="color:var(--text-2);">لم تجد ما تبحث عنه؟</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="addCustomQuoteLine('${safeTerm}')" style="font-size:11px;color:#d97706;font-weight:700;">⚡ إدراج "${safeTerm}" كبند حر جديد</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openQuickAddProductModal('${safeTerm}')" style="font-size:11px;color:#059669;font-weight:700;">➕ تسجيل صنف جديد</button>
        </div>
      </div>` : "";

    results.innerHTML = itemsHtml + supItemsHtml + adhocHtml + bottomActionHtml;
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);
  if (catFilter) {
    catFilter.addEventListener("change", performSearch);
  }

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target)))
      results.classList.add("hidden");
  });
}

window.addQtProduct = (productId, productName, unitPrice, unit, sku, cost = 0) => {
  const input   = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  if (input)   input.value = "";
  if (results) results.classList.add("hidden");

  const prod = products.find(p => p.id === productId);
  const numPrice = parseNum(unitPrice, 0);
  const effectiveCost = parseNum(cost, 0) || parseNum(prod?.averageCost || prod?.costPrice || prod?.lastPurchasePrice || prod?.avgCostPrice || prod?.purchasePrice, 0);
  const lastPurPrice = parseNum(prod?.lastPurchasePrice, effectiveCost > 0 ? effectiveCost : 0);

  const existingIndex = quoteItems.findIndex(l => l.productId === productId);
  if (existingIndex !== -1) {
    quoteItems[existingIndex].qty += 1;
    if (!quoteItems[existingIndex].cost && effectiveCost > 0) quoteItems[existingIndex].cost = Math.round(effectiveCost * 100) / 100;
    if (!quoteItems[existingIndex].lastPurchasePrice && lastPurPrice > 0) quoteItems[existingIndex].lastPurchasePrice = Math.round(lastPurPrice * 100) / 100;
    const [existing] = quoteItems.splice(existingIndex, 1);
    quoteItems.unshift(existing);
  } else {
    const baseCost = Math.round(effectiveCost * 100) / 100;
    const margin = baseCost > 0 ? Math.round(((numPrice / baseCost) - 1) * 100 * 100) / 100 : 0;
    quoteItems.unshift({
      productId,
      productName,
      unitPrice: Math.round(numPrice * 100) / 100,
      unit,
      sku,
      qty: 1,
      discount: 0,
      cost: baseCost,
      lastPurchasePrice: Math.round(lastPurPrice * 100) / 100,
      margin: margin
    });
  }
  renderQuoteLines();

  setTimeout(() => {
    const firstQty = document.querySelector("#qt-lines-tbody tr:first-child .qt-line-qty");
    if (firstQty) {
      firstQty.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      firstQty.focus();
      firstQty.select();
    }
  }, 40);
};

window.addAllProductsToQuote = () => {
  if (!products || products.length === 0) {
    showToast("لا توجد أصناف في الكتالوج", "warn");
    return;
  }
  const catFilter = document.getElementById("qt-product-category-filter")?.value;
  let targetProducts = products;
  if (catFilter) {
    targetProducts = products.filter(p => p.categoryId === catFilter || p.category === catFilter);
  }
  if (!targetProducts || targetProducts.length === 0) {
    showToast("لا توجد أصناف تطابق الفئة المحددة", "warn");
    return;
  }
  if (!confirm(`هل تريد إدراج جميع أصناف الكتالوج (${targetProducts.length} صنف) بداخل عرض السعر؟`)) return;

  const priceListKey = document.getElementById("qt-pricelist")?.value || "standard";

  let addedCount = 0;
  targetProducts.forEach(prod => {
    if (!quoteItems.some(x => x.productId === prod.id)) {
      let unitPrice = parseNum(prod.salePrice || prod.priceRetail || prod.sellingPrice || prod.price, 0);
      const cost = parseNum(prod.averageCost || prod.costPrice || prod.lastPurchasePrice || prod.avgCostPrice || prod.purchasePrice || prod.cost, 0);
      if (priceListKey === "tier1") {
        const marginPct = getTier1MarginForProduct(prod);
        if (cost > 0) unitPrice = cost * (1 + marginPct / 100);
      } else if (priceListKey === "wholesale" && prod.priceWholesale) unitPrice = parseNum(prod.priceWholesale, unitPrice);
      else if (priceListKey === "distributor" && prod.priceDistributor) unitPrice = parseNum(prod.priceDistributor, unitPrice);
      else if (priceListKey === "special" && prod.priceSpecial) unitPrice = parseNum(prod.priceSpecial, unitPrice);

      const lastPurchasePrice = parseNum(prod.lastPurchasePrice, cost > 0 ? cost : 0);
      const margin = cost > 0 ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;

      quoteItems.push({
        productId: prod.id,
        productName: prod.name || prod.nameAr || "",
        sku: prod.sku || prod.code || "",
        unit: prod.unit || prod.unitName || "PCS",
        cost: Math.round(cost * 100) / 100,
        lastPurchasePrice: Math.round(lastPurchasePrice * 100) / 100,
        margin,
        qty: 1,
        unitPrice: Math.round(unitPrice * 100) / 100,
        discount: 0
      });
      addedCount++;
    }
  });

  renderQuoteLines();
  showToast(`تم إدراج ${addedCount} صنف في عرض السعر بنجاح`, "success");
};

window.clearAllQuoteLines = () => {
  if (quoteItems.length === 0) return;
  if (confirm("هل أنت متأكد من تفريغ كافة بنود عرض السعر؟")) {
    quoteItems = [];
    renderQuoteLines();
    showToast("تم تفريغ كافة الأصناف", "info");
  }
};

// ============================================================
// SAVE QUOTE
// ============================================================
window.saveQuote = async (statusOverride) => {
  const errEl = document.getElementById("qt-form-error");
  if (errEl) errEl.classList.add("hidden");

  const inputCustName = document.getElementById("qt-customer-search")?.value.trim() || "";
  const hiddenCustName = document.getElementById("qt-customer-name-val")?.value.trim() || "";
  let customerName = inputCustName || hiddenCustName || "عرض سعر عام (عميل عام)";
  let customerId = document.getElementById("qt-customer-id")?.value.trim() || "general";

  if (customerName === "عرض سعر عام (عميل عام)") {
    customerId = "general";
  } else {
    const matchedCust = customers.find(c => (c.name || "").trim().toLowerCase() === customerName.toLowerCase());
    if (matchedCust) {
      customerId = matchedCust.id;
    } else if (!customerId || customerId === "general") {
      customerId = "adhoc_customer";
    }
  }

  // Ensure DOM fields reflect this
  const idEl = document.getElementById("qt-customer-id");
  if (idEl) idEl.value = customerId;
  const nameValEl = document.getElementById("qt-customer-name-val");
  if (nameValEl) nameValEl.value = customerName;

  const date         = document.getElementById("qt-date")?.value       || "";
  const expiryDate   = document.getElementById("qt-expiry")?.value     || "";

  if (!quoteItems.length) {
    if (errEl) { errEl.textContent = "يرجى إضافة صنف واحد على الأقل."; errEl.classList.remove("hidden"); }
    return;
  }
  if (!date) {
    if (errEl) { errEl.textContent = "يرجى تحديد تاريخ العرض."; errEl.classList.remove("hidden"); }
    return;
  }

  const edType  = document.getElementById("qt-extra-disc-type")?.value || "none";
  const edVal   = parseFloat(document.getElementById("qt-extra-disc-val")?.value) || 0;
  const totals  = calcQuoteTotals(quoteItems, edType, edVal);
  const repEl   = document.getElementById("qt-rep");
  const repId   = repEl?.value   || "";
  const repName = repEl?.options[repEl?.selectedIndex]?.dataset.name || "";
  const status  = statusOverride || document.getElementById("qt-status")?.value || "draft";

  const draftBtn = document.getElementById("qt-save-draft-btn");
  const sendBtn  = document.getElementById("qt-save-btn");
  if (draftBtn) draftBtn.disabled = true;
  if (sendBtn)  sendBtn.disabled  = true;

  try {
    let quoteNumber = (document.getElementById("qt-number")?.value || "").trim();
    if (!quoteNumber || quoteNumber === "جارٍ التوليد…" || quoteNumber === "يُولَّد تلقائياً") {
      quoteNumber = await generateInvoiceNumber("QT");
    }

    const sanitizedItems = (quoteItems || []).map(item => {
      const qty = parseNum(item.qty, 1);
      const unitPrice = parseNum(item.unitPrice !== undefined ? item.unitPrice : item.price, 0);
      const cost = parseNum(item.cost, 0);
      let margin = (item.margin !== undefined && item.margin !== null && item.margin !== "") ? parseNum(item.margin, null) : null;
      if (margin === null || isNaN(margin)) {
        margin = (cost > 0 && unitPrice > 0) ? Math.round(((unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
      } else {
        margin = Math.round(margin * 100) / 100;
      }
      const discount = parseNum(item.discount, 0);
      const gross = qty * unitPrice;
      const discAmt = gross * discount / 100;
      const total = Math.max(0, gross - discAmt);
      const vat = Math.round(total * 0.15 * 100) / 100;

      return {
        ...item,
        qty,
        unitPrice: Math.round(unitPrice * 100) / 100,
        price: Math.round(unitPrice * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        lastPurchasePrice: Math.round(parseNum(item.lastPurchasePrice || cost, 0) * 100) / 100,
        margin: margin,
        discount: discount,
        total: Math.round(total * 100) / 100,
        vat: vat,
        grandTotal: Math.round((total + vat) * 100) / 100
      };
    });
    quoteItems = sanitizedItems;

    const data = {
      quoteNumber,
      date,
      expiryDate,
      customerId,
      customerName,
      deliveryAddress:   document.getElementById("qt-delivery-address")?.value  || "",
      repId,
      repName,
      warehouseId:       document.getElementById("qt-warehouse")?.value || "",
      warehouseName:     document.getElementById("qt-warehouse")?.options?.[document.getElementById("qt-warehouse")?.selectedIndex]?.text || "",
      priceList:         document.getElementById("qt-pricelist")?.value          || "standard",
      paymentTerms:      document.getElementById("qt-payment-terms")?.value      || "cash",
      status,
      items:             sanitizedItems,
      grossTotal:        totals.grossTotal,
      discountTotal:     totals.totalDiscount,
      subtotal:          totals.subtotal,
      totalVat:          totals.vat,
      grandTotal:        totals.grandTotal,
      totalCost:         totals.totalCost,
      totalProfit:       totals.totalProfit,
      marginPct:         totals.marginPct,
      profitMargin:      totals.markupPct,
      markupPct:         totals.markupPct,
      avgMarginPct:      totals.avgMarginPct,
      extraDiscountType: edType,
      extraDiscountVal:  edVal,
      notes:             document.getElementById("qt-notes")?.value  || "",
      terms:             document.getElementById("qt-terms")?.value  || "",
      createdBy:         _quotesUser?.uid || "system",
    };

    let quoteId = activeQuoteId;
    if (activeQuoteId) {
      await update("quotations", activeQuoteId, data);
      const idx = quotations.findIndex(x => x.id === activeQuoteId);
      if (idx !== -1) {
        quotations[idx] = { ...quotations[idx], ...data, id: activeQuoteId };
        renderQuotesList(quotations);
      }
      showToast("تم تحديث عرض السعر بنجاح", "success");
    } else {
      const res = await create(COLS.quotations(), data);
      quoteId = typeof res === "string" ? res : res.id;
      showToast(`تم حفظ العرض ${quoteNumber}`, "success");
    }

    const fileInput = document.getElementById("qt-file-upload");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      window.uploadFileToArchive(file, "quotations", quoteId, `مرفق عرض سعر رقم ${quoteNumber}`).catch(e => console.warn(e));
    }

    closeModal("qt-form-modal");
    await loadQuotesList();
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
    console.error(err);
  } finally {
    if (draftBtn) draftBtn.disabled = false;
    if (sendBtn)  sendBtn.disabled  = false;
  }
};

// ============================================================
// VIEW MODAL
// ============================================================
// ============================================================
// VIEW MODAL & DYNAMIC TAX MODE TABLE
// ============================================================
window._quoteTaxViewMode = window._quoteTaxViewMode || "detailed";

function renderQuoteViewTableHtml(q, mode = "detailed") {
  const items = q.items || [];
  if (items.length === 0) {
    return `<div style="text-align:center;padding:24px;color:var(--text-3);">لا توجد أصناف في عرض السعر</div>`;
  }

  let theadHtml = "";
  let rowsHtml = "";

  if (mode === "inclusive") {
    theadHtml = `
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;color:var(--brand);font-weight:800;width:150px;">السعر شامل الضريبة (15%)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;color:var(--text-good);font-weight:900;width:150px;">الإجمالي شامل الضريبة</th>
      </tr>
    `;
    rowsHtml = items.map((l, i) => {
      const qty = parseFloat(l.qty) || 0;
      const unitPrice = parseFloat(l.unitPrice) || 0;
      const taxRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 0.15;
      const unitPriceIncl = Math.round(unitPrice * (1 + taxRate) * 100) / 100;
      const gross = qty * unitPrice;
      const disc = gross * (parseFloat(l.discount) || 0) / 100;
      const net = gross - disc;
      const netIncl = Math.round(net * (1 + taxRate) * 100) / 100;
      return `
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${i+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${l.productName}
            ${l.sku && l.sku !== "بند حر" ? `<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${l.sku}</div>` : ""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${formatQuantity(qty)} ${l.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px;display:inline-block;">${formatCurrency(unitPriceIncl)}</span>
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${l.discount ? `<span style="color:var(--text-bad);font-weight:700;">${l.discount}%</span>` : "—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good" style="font-size:13px;">${formatCurrency(netIncl)}</td>
        </tr>
      `;
    }).join("");
  } else if (mode === "exclusive") {
    theadHtml = `
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;width:130px;">سعر الوحدة (غير شامل)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;width:130px;">الإجمالي (غير شامل)</th>
      </tr>
    `;
    rowsHtml = items.map((l, i) => {
      const qty = parseFloat(l.qty) || 0;
      const unitPrice = parseFloat(l.unitPrice) || 0;
      const gross = qty * unitPrice;
      const disc = gross * (parseFloat(l.discount) || 0) / 100;
      const net = gross - disc;
      return `
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${i+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${l.productName}
            ${l.sku && l.sku !== "بند حر" ? `<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${l.sku}</div>` : ""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${formatQuantity(qty)} ${l.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold">${formatCurrency(unitPrice)}</td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${l.discount ? `<span style="color:var(--text-bad);font-weight:700;">${l.discount}%</span>` : "—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good">${formatCurrency(net)}</td>
        </tr>
      `;
    }).join("");
  } else {
    // detailed: before tax + vat + inclusive (default)
    theadHtml = `
      <tr>
        <th style="width:32px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:80px;">الكمية</th>
        <th style="text-align:left;width:110px;">السعر (غير شامل)</th>
        <th style="text-align:center;width:85px;">الضريبة (15%)</th>
        <th style="text-align:left;width:130px;background:rgba(37,99,235,0.08);color:var(--brand);font-weight:800;">السعر (شامل 15%)</th>
        <th style="text-align:left;width:125px;color:var(--text-good);font-weight:900;">الإجمالي شامل</th>
      </tr>
    `;
    rowsHtml = items.map((l, i) => {
      const qty = parseFloat(l.qty) || 0;
      const unitPrice = parseFloat(l.unitPrice) || 0;
      const taxRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 0.15;
      const unitVat = Math.round(unitPrice * taxRate * 100) / 100;
      const unitPriceIncl = Math.round((unitPrice + unitVat) * 100) / 100;
      const gross = qty * unitPrice;
      const disc = gross * (parseFloat(l.discount) || 0) / 100;
      const net = gross - disc;
      const netVat = Math.round(net * taxRate * 100) / 100;
      const netIncl = Math.round((net + netVat) * 100) / 100;
      return `
        <tr>
          <td style="padding:7px 8px;text-align:center;color:var(--text-2);">${i+1}</td>
          <td style="padding:7px 8px;font-weight:700;color:var(--text-1);">
            ${l.productName}
            ${l.sku && l.sku !== "بند حر" ? `<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${l.sku}</div>` : ""}
          </td>
          <td style="padding:7px 8px;text-align:center;" class="mono font-semibold">${formatQuantity(qty)} ${l.unit||""}</td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold">${formatCurrency(unitPrice)}</td>
          <td style="padding:7px 8px;text-align:center;" class="mono"><span style="color:#b45309;font-weight:700;">${formatCurrency(unitVat)}</span></td>
          <td style="padding:7px 8px;text-align:left;background:rgba(37,99,235,0.04);" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:6px;display:inline-block;">${formatCurrency(unitPriceIncl)}</span>
          </td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold text-good">${formatCurrency(netIncl)}</td>
        </tr>
      `;
    }).join("");
  }

  return `
    <table class="data-dense" style="width:100%;border-collapse:collapse;">
      <thead>${theadHtml}</thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${mode === "inclusive" ? `<div style="font-size:11px;color:var(--text-3);margin-top:6px;padding:4px 8px;font-style:italic;">* جميع أسعار الأصناف المعروضة أعلاه شاملة ضريبة القيمة المضافة 15%</div>` : ""}
  `;
}

window.setQuoteViewTaxMode = (mode) => {
  window._quoteTaxViewMode = mode;
  const q = window._currentViewQuote;
  if (!q) return;
  const container = document.getElementById("qt-view-table-container");
  if (container) {
    container.innerHTML = renderQuoteViewTableHtml(q, mode);
  }
  document.querySelectorAll(".qt-tax-mode-btn").forEach(b => {
    b.classList.remove("btn-primary");
    b.classList.add("btn-secondary");
  });
  const activeBtn = document.getElementById(`qt-tax-btn-${mode}`);
  if (activeBtn) {
    activeBtn.classList.remove("btn-secondary");
    activeBtn.classList.add("btn-primary");
  }
};

window.viewQuote = (id, event) => {
  if (event && (event.target.closest("button") || event.target.closest(".row-actions"))) {
    return;
  }
  const q = quotations.find(x => x.id === id);
  if (!q) return;

  const titleEl = document.getElementById("qt-view-title");
  if (titleEl) titleEl.textContent = `عرض السعر: ${q.quoteNumber || id}`;

  const convBtn = document.getElementById("qt-view-convert-btn");
  if (convBtn) convBtn.style.display = q.status === "converted" ? "none" : "";

  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const pList  = { standard:"عادي", wholesale:"جملة", distributor:"موزع", special:"خاص", tier1:"عميل فئة أولى" };

  const isExpiry = q.expiryDate && q.expiryDate < todayString()
    && q.status !== "accepted" && q.status !== "converted";

  const statusButtons = Object.entries(STATUS_MAP)
    .filter(([k]) => k !== "converted")
    .map(([k, v]) => `<button class="btn btn-sm ${q.status === k ? "btn-primary" : "btn-secondary"}"
      onclick="updateQuoteStatus('${q.id}','${k}')">${v.label}</button>`).join("");

  const bodyEl = document.getElementById("qt-view-body");
  if (!bodyEl) return;

  const currentMode = window._quoteTaxViewMode || "detailed";

  const qtTotals = calcQuoteTotals(q.items || [], q.extraDiscountType, q.extraDiscountVal);
  const markupPctVal    = (q.markupPct !== undefined && q.markupPct !== null) ? parseFloat(q.markupPct) : qtTotals.markupPct;
  const marginSalesVal  = (q.marginPct !== undefined && q.marginPct !== null) ? parseFloat(q.marginPct) : qtTotals.marginPct;
  const totalCostVal    = (q.totalCost !== undefined && q.totalCost !== null) ? parseFloat(q.totalCost) : qtTotals.totalCost;
  const totalProfitVal  = (q.totalProfit !== undefined && q.totalProfit !== null) ? parseFloat(q.totalProfit) : qtTotals.totalProfit;
  const isProfitable    = totalProfitVal >= 0;

  bodyEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:16px;background:var(--bg-2);padding:12px 14px;border-radius:10px;border:1px solid var(--border-soft);">
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">رقم العرض</div>
        <div class="mono text-indigo font-bold" style="font-size:15px;">${q.quoteNumber}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">الحالة</div>
        ${statusBadge(q.status)}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">التاريخ</div>
        <div style="font-weight:600;">${isoToDisplay(q.date)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">تاريخ الصلاحية</div>
        <div class="${isExpiry ? "text-bad font-bold" : ""}" style="font-weight:600;">${isoToDisplay(q.expiryDate)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">العميل</div>
        <div class="font-semibold" style="font-size:13px;color:var(--text-1);">${q.customerName}</div>
        ${q.deliveryAddress ? `<div style="font-size:11px;color:var(--text-2);">📍 ${q.deliveryAddress}</div>` : ""}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">المندوب</div>
        <div style="font-weight:600;">${q.repName || "—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">قائمة الأسعار</div>
        <div style="font-weight:600;">${pList[q.priceList] || q.priceList || "—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">شروط الدفع</div>
        <div style="font-weight:600;">${pTerms[q.paymentTerms] || q.paymentTerms || "—"}</div>
      </div>
    </div>

    <!-- ── Mode Selector Bar ── -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <div style="font-size:13px;font-weight:800;color:var(--text-1);display:flex;align-items:center;gap:6px;">
        <span>📦 بنود وقائمة أسعار العرض:</span>
        <span style="font-size:11.5px;color:var(--text-2);font-weight:normal;">(${q.items?.length || 0} صنف)</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;background:var(--bg-2);padding:3px;border-radius:99px;border:1px solid var(--border-soft);">
        <button type="button" id="qt-tax-btn-detailed" class="btn btn-xs qt-tax-mode-btn ${currentMode==='detailed'?'btn-primary':'btn-secondary'}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('detailed')">تفصيلي (قبل وبعد الضريبة)</button>
        <button type="button" id="qt-tax-btn-inclusive" class="btn btn-xs qt-tax-mode-btn ${currentMode==='inclusive'?'btn-primary':'btn-secondary'}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('inclusive')">شامل الضريبة فقط</button>
        <button type="button" id="qt-tax-btn-exclusive" class="btn btn-xs qt-tax-mode-btn ${currentMode==='exclusive'?'btn-primary':'btn-secondary'}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('exclusive')">غير شامل فقط</button>
      </div>
    </div>

    <div class="table-container mb-16" id="qt-view-table-container">
      ${renderQuoteViewTableHtml(q, currentMode)}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <!-- Internal Profitability Analysis (Management Only - No Print) -->
      <div class="no-print" style="width:340px;border:1.5px solid rgba(16,185,129,0.35);background:linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px dashed rgba(16,185,129,0.3);background:rgba(16,185,129,0.08);">
          <span style="font-size:12px;font-weight:800;color:#047857;display:flex;align-items:center;gap:5px;">
            <span>📊</span> مؤشرات الربحية (خاص بالإدارة - لا يُطبع)
          </span>
          <span class="badge" style="background:${isProfitable ? '#059669' : '#dc2626'};color:#fff;font-weight:800;font-size:11.5px;padding:3px 8px;border-radius:6px;font-family:monospace;">
            ${markupPctVal >= 0 ? '+' : ''}${markupPctVal.toFixed(2)}%
          </span>
        </div>
        <div style="padding:10px 14px;display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
            <span style="color:var(--text-2);">إجمالي التكلفة التقديرية:</span>
            <span class="mono font-semibold" style="color:var(--text-1);">${formatCurrency(totalCostVal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:${isProfitable ? '#059669' : '#dc2626'};">
            <span>إجمالي الربح قبل الضريبة:</span>
            <span class="mono font-bold" style="font-size:13px;">${formatCurrency(totalProfitVal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;color:${isProfitable ? '#047857' : '#dc2626'};padding-top:6px;border-top:1px solid rgba(16,185,129,0.2);">
            <span title="نسبة الربح المجمع قبل الضريبة على التكلفة = (إجمالي الربح قبل الضريبة ÷ إجمالي التكلفة) × 100">هامش الربح الإجمالي قبل الضريبة (على التكلفة):</span>
            <span class="mono font-black" style="font-size:13.5px;">${markupPctVal >= 0 ? '+' : ''}${markupPctVal.toFixed(2)}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-2);">
            <span title="نسبة الربح قبل الضريبة من إجمالي المبيعات = (إجمالي الربح قبل الضريبة ÷ المجموع الفرعي) × 100">نسبة الهامش قبل الضريبة (من المبيعات):</span>
            <span class="mono font-bold">${marginSalesVal >= 0 ? '+' : ''}${marginSalesVal.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <!-- Customer Document Totals Box -->
      <div style="width:340px;border:1.5px solid var(--border-soft);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">المجموع الصافي (غير شامل الضريبة)</span>
          <span class="mono font-bold">${formatCurrency(q.subtotal||q.grossTotal||0)}</span>
        </div>
        ${(q.discountTotal > 0) ? `<div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
          <span class="mono text-bad font-bold">- ${formatCurrency(q.discountTotal||0)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:rgba(217,119,6,0.06);">
          <span style="font-size:12px;color:#92400e;font-weight:700;">ضريبة القيمة المضافة (15%)</span>
          <span class="mono font-bold" style="color:#b45309;">${formatCurrency(q.totalVat||0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 14px;background:var(--bg-2);">
          <span style="font-size:13.5px;font-weight:800;color:var(--text-1);">الإجمالي النهائي (شامل الضريبة)</span>
          <span class="mono text-brand font-bold" style="font-size:16px;">${formatCurrency(q.grandTotal||0)}</span>
        </div>
      </div>
    </div>

    ${q.notes ? `<div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;font-size:12px;color:var(--text-2);margin-bottom:10px;border:1px solid var(--border-soft);">
      <strong>📝 ملاحظات:</strong> ${q.notes}</div>` : ""}

    <div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px solid var(--border-soft);">
      <span style="font-size:12px;color:var(--text-2);font-weight:700;">تحديث الحالة:</span>
      ${statusButtons}
    </div>`;

  window._currentViewQuote = q;
  openModal("qt-view-modal");
};

window.printQuoteFromView      = () => { if (window._currentViewQuote) printQuote(window._currentViewQuote.id); };
window.printQuoteFromForm      = async () => {
  if (!quoteItems || !quoteItems.length) {
    showToast("⚠️ أضف صنفاً واحداً على الأقل لمعاينة الطباعة", "warn");
    return;
  }
  const edType = document.getElementById("qt-extra-disc-type")?.value || "none";
  const edVal = parseFloat(document.getElementById("qt-extra-disc-val")?.value) || 0;
  const totals = calcQuoteTotals(quoteItems, edType, edVal);
  const repEl = document.getElementById("qt-rep");

  const q = {
    id: activeQuoteId || "temp_preview",
    quoteNumber: (document.getElementById("qt-number")?.value || "").trim() || "مسودة",
    date: document.getElementById("qt-date")?.value || todayString(),
    expiryDate: document.getElementById("qt-expiry")?.value || "",
    customerName: document.getElementById("qt-customer-search")?.value || document.getElementById("qt-customer-name-val")?.value || "عميل عام",
    customerId: document.getElementById("qt-customer-id")?.value || "general",
    deliveryAddress: document.getElementById("qt-delivery-address")?.value || "",
    repName: repEl?.options[repEl?.selectedIndex]?.dataset?.name || "",
    paymentTerms: document.getElementById("qt-payment-terms")?.value || "cash",
    priceList: document.getElementById("qt-pricelist")?.value || "standard",
    notes: document.getElementById("qt-notes")?.value || "",
    terms: document.getElementById("qt-terms")?.value || "صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.",
    items: quoteItems,
    grossTotal: totals.grossTotal,
    discountTotal: totals.totalDiscount,
    subtotal: totals.subtotal,
    totalVat: totals.vat,
    grandTotal: totals.grandTotal
  };
  return window.printQuoteObject(q);
};
window.convertQuoteToInvoiceFromView = () => { if (window._currentViewQuote) convertQuoteToInvoice(window._currentViewQuote.id); };

// ── WhatsApp Share (Updated with Inclusive Price & Details) ──
window.shareQuoteWhatsApp = () => {
  const q = window._currentViewQuote;
  if (!q) return;
  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const itemsText = (q.items||[]).map((l, i) => {
    const qty = parseFloat(l.qty) || 0;
    const unitPrice = parseFloat(l.unitPrice) || 0;
    const taxRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 0.15;
    const unitPriceIncl = Math.round(unitPrice * (1 + taxRate) * 100) / 100;
    const gross = qty * unitPrice;
    const disc = gross * (parseFloat(l.discount) || 0) / 100;
    const net = gross - disc;
    const netIncl = Math.round(net * (1 + taxRate) * 100) / 100;
    return `${i+1}. *${l.productName}*\n   الكمية: ${formatQuantity(qty)} ${l.unit||"كرتون"} × ${formatCurrency(unitPriceIncl)} (شامل 15%) = *${formatCurrency(netIncl)}*`;
  }).join("\n");

  const msg = [
    `*📋 عرض سعر من إدهام للمواد الغذائية*`,
    `رقم العرض: ${q.quoteNumber}`,
    `التاريخ: ${isoToDisplay(q.date)}`,
    `صالح حتى: ${isoToDisplay(q.expiryDate)}`,
    `العميل: ${q.customerName}`,
    `شروط الدفع: ${pTerms[q.paymentTerms] || "—"}`,
    "─────────────────",
    "*📦 تفاصيل الأصناف والأسعار (شاملة الضريبة):*",
    itemsText,
    "─────────────────",
    `المجموع الصافي (غير شامل): ${formatCurrency(q.subtotal||q.grossTotal||0)}`,
    (q.discountTotal > 0) ? `إجمالي الخصم: - ${formatCurrency(q.discountTotal||0)}` : "",
    `ضريبة القيمة المضافة (15%): ${formatCurrency(q.totalVat||0)}`,
    `*💰 الإجمالي النهائي المطلوب: ${formatCurrency(q.grandTotal||0)}*`,
    "─────────────────",
    q.notes ? `ملاحظات: ${q.notes}\n─────────────────` : "",
    "نشكركم لتعاملكم معنا 🙏",
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
};

// ============================================================
// STATUS UPDATE
// ============================================================
window.updateQuoteStatus = async (id, status) => {
  const label = STATUS_MAP[status]?.label || status;
  if (!await showConfirm(`تغيير حالة العرض إلى "${label}"؟`, "تحديث الحالة")) return;
  try {
    await update("quotations", id, { status });
    showToast(`تم تحديث الحالة إلى: ${label}`, "success");
    // Update in-memory list
    const idx = quotations.findIndex(q => q.id === id);
    if (idx !== -1) quotations[idx].status = status;
    filterQuotes();
    // Refresh view modal if same quote is open
    if (window._currentViewQuote?.id === id) {
      window._currentViewQuote.status = status;
      viewQuote(id);
    }
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// DELETE QUOTE
// ============================================================
window.deleteQuote = async (id, num) => {
  if (!await showConfirm(
    `حذف عرض السعر رقم "${num || id}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    "تأكيد الحذف"
  )) return;
  try {
    await remove("quotations", id);
    showToast("تم حذف عرض السعر", "success");
    quotations = quotations.filter(q => q.id !== id);
    filterQuotes();
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// CONVERT TO INVOICE
// ============================================================
window.convertQuoteToInvoice = async (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) return;
  if (q.status === "converted") {
    showToast("تم تحويل هذا العرض مسبقاً", "warn");
    return;
  }
  if (!await showConfirm(
    `تحويل العرض "${q.quoteNumber}" إلى فاتورة مبيعات جديدة?\nسيُغَيَّر وضع العرض إلى "مُفوتَر".`,
    "تحويل لفاتورة"
  )) return;

  try {
    sessionStorage.setItem("convert_quote", JSON.stringify({
      quoteId:      q.id,
      quoteNumber:  q.quoteNumber,
      customerId:   q.customerId,
      customerName: q.customerName,
      repId:        q.repId,
      repName:      q.repName,
      warehouseId:  q.warehouseId || "",
      items: (q.items||[]).map(l => ({
        productId:   l.productId,
        productName: l.productName,
        unit:        l.unit || "PCS",
        unitCode:    "PCE",
        taxCategory: "S",
        qty:         l.qty,
        unitPrice:   l.unitPrice,
        discount:    l.discount || 0,
      })),
      notes: q.notes || "",
    }));

    await update("quotations", id, {
      status:      "converted",
      convertedAt: new Date().toISOString(),
    });

    const idx = quotations.findIndex(x => x.id === id);
    if (idx !== -1) quotations[idx].status = "converted";
    filterQuotes();
    closeModal("qt-view-modal");
    showToast("تم التحويل. افتح وحدة فواتير المبيعات لاستكمال الإنشاء.", "success");

    if (typeof navigate === "function") navigate("sales-invoices");
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// PRINT QUOTE (A4)
// ============================================================
window.printQuote = async (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) { showToast("العرض غير موجود", "error"); return; }
  return window.printQuoteObject(q);
};

window.printQuoteObject = async (q) => {
  if (!q) return;

  let companyLogo = "";
  const co = {
    name: "شركة نظم الإمداد المتطورة",
    vatNumber: "314996148100003",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com"
  };

  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const settingsRef = doc(db, `companies/${COMPANY_ID}/settings`, "company");
    const logoRef = doc(db, `companies/${COMPANY_ID}/settings`, "logo");
    const [settingsSnap, logoSnap] = await Promise.all([
      getDoc(settingsRef),
      getDoc(logoRef)
    ]);
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.name) co.name = data.name;
      if (data.vatNumber) co.vatNumber = data.vatNumber;
      if (data.address) co.address = data.address;
      if (data.phone) co.phone = data.phone;
      if (data.email) co.email = data.email;
    }
    if (logoSnap.exists()) {
      companyLogo = logoSnap.data().dataUrl || "";
    }
  } catch (e) {
    console.warn("Failed to load company settings for print:", e);
  }

  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const pList  = { standard:"عادي", wholesale:"جملة", distributor:"موزع", special:"خاص", tier1:"عميل فئة أولى" };

  const initialMode = window._quoteTaxViewMode || "detailed";

  const linesHtml = (q.items||[]).map((l, i) => {
    const qty = parseFloat(l.qty) || 0;
    const unitPrice = parseFloat(l.unitPrice) || 0;
    const taxRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 0.15;
    const unitVat = Math.round(unitPrice * taxRate * 100) / 100;
    const unitPriceIncl = Math.round((unitPrice + unitVat) * 100) / 100;

    const gross = qty * unitPrice;
    const discRate = parseFloat(l.discount) || 0;
    const disc = gross * discRate / 100;
    const netEx = gross - disc;
    const netVat = Math.round(netEx * taxRate * 100) / 100;
    const netIncl = Math.round((netEx + netVat) * 100) / 100;

    const isCustom = !!l.isCustom || String(l.productId||"").startsWith("adhoc_");
    const showSku = l.sku && l.sku !== "بند حر" && !l.sku.startsWith("adhoc_") && !isCustom;

    return `
      <tr>
        <td style="text-align:center; font-weight:700; color:#475569; font-size:11px;">${i+1}</td>
        <td style="padding:8px 10px;">
          <div style="font-size:12px; font-weight:700; color:#0f172a; line-height:1.4;">${l.productName}</div>
          ${showSku ? `<div style="color:#64748b; font-size:9.5px; font-family:monospace; margin-top:1px;">كود: ${l.sku}</div>` : ""}
        </td>
        <td style="text-align:center; font-weight:600; color:#334155; font-size:11px;">${l.unit||"كرتون"}</td>
        <td style="text-align:center; font-weight:800; color:#0f172a; font-size:12px;" class="mono">${formatQuantity(qty)}</td>
        <td style="text-align:left; font-weight:700; color:#0f172a; font-size:11.5px;" class="col-ex-price mono">${formatCurrency(unitPrice)}</td>
        <td style="text-align:center; color:#b45309; font-weight:700; font-size:11.5px;" class="col-vat-amt mono">${formatCurrency(unitVat)}</td>
        <td style="text-align:left; font-weight:800; font-size:12px;" class="col-inc-price mono">
          <span style="background:rgba(30,58,138,0.08);padding:2px 6px;border-radius:4px;color:#1e3a8a;display:inline-block;">${formatCurrency(unitPriceIncl)}</span>
        </td>
        <td style="text-align:center; color:#64748b; font-size:11px;" class="col-disc mono">${discRate ? `<span style="color:#dc2626;font-weight:700;">${discRate}%</span>` : "—"}</td>
        <td style="text-align:left; font-weight:800; color:#0f766e; font-size:12px;" class="col-ex-total mono">${formatCurrency(netEx)}</td>
        <td style="text-align:left; font-weight:900; color:#0f766e; font-size:12.5px;" class="col-inc-total mono">${formatCurrency(netIncl)}</td>
      </tr>`;
  }).join("");

  const pw = window.open("", "_blank");
  if (!pw) { showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn"); return; }
  pw.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>عرض سعر ${q.quoteNumber||""}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic','Cairo',sans-serif;direction:rtl;color:#1e293b;background:#f1f5f9;font-size:12px;line-height:1.5;}

    /* ─── Toolbar ─── */
    .no-print{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:10px 24px;background:#fff;border-bottom:2px solid #e2e8f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.08);flex-wrap:wrap;}
    .toolbar-modes{display:flex;align-items:center;gap:6px;background:#f8fafc;padding:4px 8px;border-radius:10px;border:1px solid #cbd5e1;}
    .toolbar-label{font-size:12px;font-weight:700;color:#334155;margin-left:6px;}
    .btn-mode{background:#fff;color:#475569;border:1px solid #cbd5e1;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.15s;}
    .btn-mode:hover{background:#f1f5f9;border-color:#94a3b8;}
    .btn-mode.active{background:#1e40af;color:#fff;border-color:#1e40af;box-shadow:0 2px 6px rgba(30,64,175,0.35);}
    .toolbar-actions{display:flex;align-items:center;gap:8px;}
    .btn{padding:8px 18px;border-radius:8px;cursor:pointer;border:none;font-family:inherit;font-size:12.5px;font-weight:700;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;}
    .btn-blue{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;box-shadow:0 3px 10px rgba(37,99,235,0.35);}
    .btn-blue:hover{background:linear-gradient(135deg,#1e3a8a,#1d4ed8);transform:translateY(-1px);}
    .btn-green{background:linear-gradient(135deg,#047857,#059669);color:#fff;box-shadow:0 3px 10px rgba(5,150,105,0.3);}
    .btn-green:hover{transform:translateY(-1px);}
    .btn-gray{background:#64748b;color:#fff;}
    .btn-gray:hover{background:#475569;}

    /* ─── Mode display rules ─── */
    body.mode-detailed .col-ex-price { display: table-cell !important; }
    body.mode-detailed .col-vat-amt  { display: table-cell !important; }
    body.mode-detailed .col-inc-price{ display: table-cell !important; background: rgba(30,58,138,0.04); font-weight: 800; color: #1e3a8a; }
    body.mode-detailed .col-disc     { display: table-cell !important; }
    body.mode-detailed .col-ex-total { display: none !important; }
    body.mode-detailed .col-inc-total{ display: table-cell !important; }
    body.mode-detailed .tax-note-inc { display: none !important; }

    body.mode-inclusive .col-ex-price { display: none !important; }
    body.mode-inclusive .col-vat-amt  { display: none !important; }
    body.mode-inclusive .col-inc-price{ display: table-cell !important; font-weight: 800; color: #1e3a8a; }
    body.mode-inclusive .col-disc     { display: table-cell !important; }
    body.mode-inclusive .col-ex-total { display: none !important; }
    body.mode-inclusive .col-inc-total{ display: table-cell !important; }
    body.mode-inclusive .tax-note-inc { display: block !important; }

    body.mode-exclusive .col-ex-price { display: table-cell !important; }
    body.mode-exclusive .col-vat-amt  { display: none !important; }
    body.mode-exclusive .col-inc-price{ display: none !important; }
    body.mode-exclusive .col-disc     { display: table-cell !important; }
    body.mode-exclusive .col-ex-total { display: table-cell !important; }
    body.mode-exclusive .col-inc-total{ display: none !important; }
    body.mode-exclusive .tax-note-inc { display: none !important; }

    /* ─── Page ─── */
    .page{width:210mm;margin:12px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);}

    /* ─── Dark Navy Header (matches logo color) ─── */
    .header-band{
      background:linear-gradient(135deg,#040d1f 0%,#0a1d4a 45%,#0f2d6b 100%);
      padding:20px 28px;
      position:relative;
      overflow:hidden;
    }
    .header-band::before{content:"";position:absolute;top:-60px;left:-60px;width:220px;height:220px;background:rgba(255,255,255,0.04);border-radius:50%;}
    .header-band::after{content:"";position:absolute;bottom:-80px;right:30px;width:270px;height:270px;background:rgba(255,255,255,0.03);border-radius:50%;}
    /* 3-column header layout */
    .header-grid{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;position:relative;z-index:1;}
    /* Logo box */
    .logo-box{background:#fff;border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);min-width:90px;min-height:80px;}
    .co-logo{max-height:80px;max-width:140px;object-fit:contain;display:block;}
    /* Company info (center) */
    .co-section{text-align:center;}
    .co-name{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,0.3);}
    .co-line{font-size:10.5px;color:rgba(255,255,255,0.8);margin-bottom:3px;display:flex;align-items:center;justify-content:center;gap:5px;}
    /* Doc details (left in RTL = left side) */
    .doc-section{text-align:center;min-width:160px;}
    .doc-title-badge{
      background:rgba(255,255,255,0.14);
      border:2px solid rgba(255,255,255,0.3);
      border-radius:12px;
      padding:8px 18px;
      margin-bottom:10px;
      backdrop-filter:blur(8px);
    }
    .doc-title-ar{font-size:19px;font-weight:900;color:#fff;letter-spacing:2px;}
    .doc-title-en{font-size:9.5px;color:rgba(255,255,255,0.55);font-weight:400;margin-top:2px;letter-spacing:1.5px;}
    .doc-num-row{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:5px;}
    .doc-num-label{font-size:10px;color:rgba(255,255,255,0.6);}
    .doc-num-val{font-size:17px;font-weight:900;color:#fbbf24;font-family:monospace;letter-spacing:1.5px;}
    .doc-date-row{font-size:10.5px;color:rgba(255,255,255,0.78);text-align:center;margin-bottom:3px;}

    /* ─── Info Cards Strip ─── */
    .info-strip{display:grid;grid-template-columns:repeat(5,1fr);border-bottom:2px solid #e2e8f0;}
    .info-card{padding:10px 14px;border-left:1px solid #e2e8f0;background:#f8fafc;display:flex;align-items:flex-start;gap:8px;}
    .info-card:first-child{border-left:none;}
    .info-card:nth-child(even){background:#eef2ff;}
    .info-icon{font-size:18px;line-height:1;flex-shrink:0;margin-top:1px;}
    .info-label{font-size:9px;color:#64748b;font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.4px;}
    .info-val{font-size:11.5px;font-weight:700;color:#1e293b;}

    /* ─── Content ─── */
    .page-body{padding:16px 20px 14px;}

    /* ─── Table ─── */
    table{width:100%;border-collapse:collapse;font-size:11.5px;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;}
    thead tr{background:linear-gradient(90deg,#040d1f,#0f2d6b);}
    th{padding:10px 12px;color:#fff;font-weight:700;font-size:11px;text-align:right;border:none;letter-spacing:0.3px;}
    th:first-child{text-align:center;width:40px;}
    tbody tr:nth-child(even) td{background:#f8fafc;}
    tbody tr:nth-child(odd) td{background:#fff;}
    tbody tr:last-child td{border-bottom:none;}
    td{padding:8px 12px;border:none;border-bottom:1px solid #e2e8f0;color:#1e293b;vertical-align:middle;}
    td:first-child{text-align:center;color:#64748b;font-size:11px;}
    .td-num{text-align:left;font-family:monospace;}
    .td-center{text-align:center;}
    .td-net{color:#0f766e;font-weight:700;font-family:monospace;}

    /* ─── Totals ─── */
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:14px;}
    .totals-box{width:320px;border-radius:10px;overflow:hidden;border:1px solid #dde6f0;box-shadow:0 2px 8px rgba(0,0,0,0.07);}
    .tot-row{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;border-bottom:1px solid #e8eef6;background:#fff;}
    .tot-row:nth-child(even){background:#f8fafc;}
    .tot-label{font-size:11px;color:#475569;}
    .tot-val{font-size:12px;font-family:monospace;font-weight:700;color:#1e293b;}
    .tot-row.vat{background:#fffbeb;}
    .tot-row.vat .tot-label{color:#92400e;font-weight:600;}
    .tot-row.vat .tot-val{color:#b45309;}
    .tot-row.grand{background:linear-gradient(90deg,#040d1f,#0f2d6b);border-bottom:none;}
    .tot-row.grand .tot-label{font-size:13px;font-weight:800;color:#fff;}
    .tot-row.grand .tot-val{font-size:16px;font-weight:900;color:#fbbf24;}
    .tot-disc-val{color:#dc2626;font-family:monospace;font-weight:700;font-size:12px;}

    /* ─── Notes & Terms ─── */
    .notes-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:9px 14px;margin-top:12px;}
    .notes-title{font-size:10px;color:#92400e;font-weight:800;margin-bottom:3px;}
    .notes-text{font-size:11px;color:#78350f;line-height:1.5;}
    .terms-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:9px 14px;margin-top:8px;}
    .terms-title{font-size:10px;color:#166534;font-weight:800;margin-bottom:3px;}
    .terms-text{font-size:10.5px;color:#166534;line-height:1.5;}

    /* ─── Signatures ─── */
    .sig-section{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;margin-top:18px;align-items:end;}
    .sig-box{text-align:center;}
    .sig-line{border-top:1.5px dashed #94a3b8;padding-top:6px;margin-top:30px;}
    .sig-label{font-size:10.5px;color:#64748b;font-weight:600;}
    .qr-ph{width:64px;height:64px;border:1.5px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:8px;background:#f8fafc;margin:0 auto;}
    .qr-label{font-size:8.5px;color:#94a3b8;margin-top:3px;text-align:center;}

    /* ─── Footer ─── */
    .footer-band{
      background:linear-gradient(90deg,#040d1f,#0a1d4a);
      padding:9px 22px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:16px;
    }
    .footer-text{font-size:10px;color:rgba(255,255,255,0.68);}
    .footer-brand{font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);}

    /* ─── Print ─── */
    @page{size:A4 portrait;margin:5mm 7mm;}
    @media print{
      body{background:#fff!important;}
      .no-print{display:none!important;}
      .page{margin:0!important;border-radius:0!important;box-shadow:none!important;width:100%!important;}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      tr{page-break-inside:avoid;}
    }
  </style>
</head>
<body class="mode-${initialMode}">
  <div class="no-print">
    <div class="toolbar-modes">
      <span class="toolbar-label">نمط العرض والطباعة:</span>
      <button type="button" id="btn-mode-detailed" class="btn-mode ${initialMode==='detailed'?'active':''}" onclick="setPrintMode('detailed')">تفصيلي (شامل وغير شامل)</button>
      <button type="button" id="btn-mode-inclusive" class="btn-mode ${initialMode==='inclusive'?'active':''}" onclick="setPrintMode('inclusive')">شامل الضريبة فقط (15%)</button>
      <button type="button" id="btn-mode-exclusive" class="btn-mode ${initialMode==='exclusive'?'active':''}" onclick="setPrintMode('exclusive')">غير شامل فقط</button>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة العرض</button>
      <button class="btn btn-green" onclick="window.print()">📥 حفظ PDF</button>
      <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
    </div>
  </div>

  <div class="page">
    <!-- ══ ROYAL BLUE HEADER ══ -->
    <div class="header-band">
      <div class="header-grid">
        ${companyLogo
          ? `<div class="logo-box"><img class="co-logo" src="${companyLogo}" alt="الشعار"></div>`
          : `<div class="logo-box" style="font-size:28px;color:#1e3a8a;">🏢</div>`}
        <div class="co-section">
          <div class="co-name">${co.name}</div>
          <div class="co-line">🏠 ${co.address}</div>
          <div class="co-line">📞 ${co.phone} &nbsp;|&nbsp; ✉️ ${co.email}</div>
          <div class="co-line">🧾 الرقم الضريبي: <strong style="color:#fbbf24;margin-right:3px;">${co.vatNumber}</strong></div>
        </div>
        <div class="doc-section">
          <div class="doc-title-badge">
            <div class="doc-title-ar">عـرض سـعـر</div>
            <div class="doc-title-en">PRICE QUOTATION</div>
          </div>
          <div class="doc-num-row">
            <span class="doc-num-label">📋 رقم:</span>
            <span class="doc-num-val">${q.quoteNumber||""}</span>
          </div>
          <div class="doc-date-row">📅 التاريخ: <strong style="color:#fff;">${isoToDisplay(q.date)}</strong></div>
          <div class="doc-date-row" style="margin-top:3px;">✅ صالح حتى: <strong style="color:#fbbf24;">${isoToDisplay(q.expiryDate)}</strong></div>
        </div>
      </div>
    </div>

    <!-- ══ INFO CARDS STRIP ══ -->
    <div class="info-strip">
      <div class="info-card">
        <span class="info-icon">👤</span>
        <div>
          <div class="info-label">العميل</div>
          <div class="info-val">${q.customerName||"—"}</div>
          ${q.deliveryAddress ? `<div style="font-size:9.5px;color:#64748b;margin-top:1px;">📍 ${q.deliveryAddress}</div>` : ""}
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🧑‍💼</span>
        <div>
          <div class="info-label">المندوب</div>
          <div class="info-val">${q.repName||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">💳</span>
        <div>
          <div class="info-label">شروط الدفع</div>
          <div class="info-val">${pTerms[q.paymentTerms]||q.paymentTerms||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🏷️</span>
        <div>
          <div class="info-label">قائمة الأسعار</div>
          <div class="info-val">${pList[q.priceList]||q.priceList||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">📊</span>
        <div>
          <div class="info-label">الحالة</div>
          <div class="info-val" style="color:#1d4ed8;">${STATUS_MAP[q.status]?.label||q.status||"—"}</div>
        </div>
      </div>
    </div>

    <!-- ══ TABLE ══ -->
    <div class="page-body">
      <table>
        <thead>
          <tr>
            <th style="width:26px;text-align:center;">#</th>
            <th>الصنف والوصف</th>
            <th style="width:46px;" class="td-center">الوحدة</th>
            <th style="width:50px;" class="td-center">الكمية</th>
            <th style="width:88px;" class="col-ex-price td-num">السعر (غير شامل)</th>
            <th style="width:74px;" class="col-vat-amt td-center">الضريبة (15%)</th>
            <th style="width:105px;" class="col-inc-price td-num">السعر (شامل 15%)</th>
            <th style="width:46px;" class="col-disc td-center">خصم%</th>
            <th style="width:105px;" class="col-ex-total td-num">الإجمالي (غير شامل)</th>
            <th style="width:115px;" class="col-inc-total td-num">الإجمالي شامل الضريبة</th>
          </tr>
        </thead>
        <tbody>${linesHtml}</tbody>
      </table>
      <div class="tax-note-inc" style="font-size:10.5px;color:#64748b;margin-top:6px;font-style:italic;">* جميع أسعار الأصناف المعروضة بالجدول أعلاه شاملة ضريبة القيمة المضافة 15%.</div>

      <!-- ══ TOTALS ══ -->
      <div class="totals-wrap">
        <div class="totals-box">
          <div class="tot-row">
            <span class="tot-label">المجموع (غير شامل الضريبة)</span>
            <span class="tot-val">${formatCurrency(q.grossTotal||q.subtotal||0)}</span>
          </div>
          ${(q.discountTotal > 0) ? `
          <div class="tot-row">
            <span class="tot-label">إجمالي الخصم</span>
            <span class="tot-disc-val">- ${formatCurrency(q.discountTotal||0)}</span>
          </div>
          <div class="tot-row">
            <span class="tot-label">الصافي بعد الخصم</span>
            <span class="tot-val">${formatCurrency(q.subtotal||0)}</span>
          </div>` : ""}
          <div class="tot-row vat">
            <span class="tot-label">⚡ ضريبة القيمة المضافة (15%)</span>
            <span class="tot-val" style="color:#b45309;">${formatCurrency(q.totalVat||0)}</span>
          </div>
          <div class="tot-row grand">
            <span class="tot-label">💰 الإجمالي النهائي (شامل الضريبة)</span>
            <span class="tot-val">${formatCurrency(q.grandTotal||0)}</span>
          </div>
        </div>
      </div>

      ${q.notes ? `<div class="notes-box"><div class="notes-title">📝 ملاحظات</div><div class="notes-text">${q.notes}</div></div>` : ""}
      ${q.terms ? `<div class="terms-box"><div class="terms-title">📋 الشروط والأحكام</div><div class="terms-text">${q.terms}</div></div>` : ""}

      <!-- ══ SIGNATURES ══ -->
      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع مُعِدّ العرض</div>
        </div>
        <div style="text-align:center;">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=1e3a8a&data=${encodeURIComponent(`${co.name}\nهاتف: ${co.phone}\nإيميل: ${co.email}\nالرقم الضريبي: ${co.vatNumber}\n${co.address}`)}"
            alt="QR"
            style="width:90px;height:90px;border-radius:6px;border:2px solid #dde6f0;"
          >
          <div style="font-size:8.5px;color:#64748b;margin-top:4px;">معلومات الشركة</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع واعتماد العميل</div>
        </div>
      </div>
    </div>

    <!-- ══ FOOTER BAND ══ -->
    <div class="footer-band">
      <span class="footer-text">نشكركم لتعاملكم معنا — هذا العرض ملزم عند قبوله خطياً أو إلكترونياً.</span>
      <span class="footer-brand">${co.name}</span>
    </div>
  </div>

  <script>
    function setPrintMode(mode) {
      document.body.classList.remove('mode-detailed', 'mode-inclusive', 'mode-exclusive');
      document.body.classList.add('mode-' + mode);
      document.querySelectorAll('.btn-mode').forEach(function(b){ b.classList.remove('active'); });
      var el = document.getElementById('btn-mode-' + mode);
      if (el) el.classList.add('active');
    }
  </script>
</body>
</html>`);
  pw.document.close();
};

// ============================================================
// CSV EXPORT
// ============================================================
window.exportQuotesCSV = () => {
  try {
    const rows = [
      ["رقم العرض","التاريخ","الصلاحية","العميل","المندوب",
       "الأصناف","إجمالي قبل خصم","الخصم","ما بعد الخصم",
       "الضريبة","الإجمالي","الحالة"]
    ];
    for (const q of quotations) {
      rows.push([
        q.quoteNumber||"", q.date||"", q.expiryDate||"",
        q.customerName||"", q.repName||"",
        (q.items||[]).length,
        q.grossTotal||0, q.discountTotal||0,
        q.subtotal||0, q.totalVat||0, q.grandTotal||0,
        STATUS_MAP[q.status]?.label || q.status || "",
      ]);
    }
    const csv = rows.map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"}));
    a.download = `quotations_${todayString()}.csv`;
    a.click();
    showToast("تم تصدير الملف بنجاح", "success");
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// SMART QUOTATION IMPORT SUITE (Excel / CSV / PDF / Clipboard)
// ============================================================
let importedQuoteItems = [];
window._importedCustomerName = "";
let _importActiveTab = "file";

async function ensureXlsxLoaded() {
  if (window.XLSX) return window.XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error("فشل تحميل مكتبة قراءة ملفات Excel"));
    document.head.appendChild(script);
  });
}

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve();
    };
    script.onerror = () => reject(new Error("فشل تحميل مكتبة معالجة الـ PDF"));
    document.head.appendChild(script);
  });
}

function normalizeArabicText(str) {
  if (!str) return "";
  return String(str)
    .trim()
    // Remove diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize Alefs
    .replace(/[إأآا]/g, "ا")
    // Normalize Taa Marbuta & Haa
    .replace(/ة/g, "ه")
    // Normalize Yaa & Alef Maksura
    .replace(/[ىي]/g, "ي")
    // Normalize common units in foods
    .replace(/\bكيلو\b|\bكغ\b/g, "ك")
    .replace(/\bجرام\b|\bغرام\b/g, "جم")
    .replace(/\bقطعة\b|\bقطعه\b/g, "حبة")
    // Replace punctuation with spaces
    .replace(/[()\[\]{}\-_\/\\.,:;+*="']/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// ── Advanced Arabic BiDi & Presentation Normalizer for All Quotations (Customer & Supplier) ──
function cleanArabicPresentationForms(text) {
  if (!text) return "";
  return String(text).normalize('NFKC').replace(/[\u0640]/g, '');
}

const UNIT_SYNONYMS = [
  ['كرتون', /^(?:كرتون|كرتونه|نوترك|نوترک|نوﺗرك|نوترن|نوترق|نوتر|نووﺗرك|نوﺗرقك|نوسﺗركيك|نوﺗرهكروراق)/],
  ['بالة', /^(?:بالة|باله|ةلاب|هلاب|ةلاﺑ|ﻪلاﺑ)/],
  ['كيس', /^(?:كيس|سيك)/],
  ['تنكة', /^(?:تنكة|تنكه|ﻚنﺗ|ﻪﻜنﺗ|ةﻜنﺗ|تنك)/],
  ['حبة', /^(?:حبة|حبه|هبح|ةبح|ﻪبح|بح)/],
  ['قطعة', /^(?:قطعة|قطعه|عطق|ةعطق|عطقه)/],
  ['بكت', /^(?:بكت|باكت|تﻜﺑ|تكب)/],
  ['علبة', /^(?:علبة|علبه|ةبلع|بلع)/],
  ['جالون', /^(?:جالون|نولاج|ولاج)/],
  ['درزن', /^(?:درزن|نزرد)/]
];

const SUPPLIER_UNIT_MAP = {
  'بالة': 'بالة', 'باله': 'بالة', 'ةلاب': 'بالة', 'هلاب': 'بالة', 'ةلاﺑ': 'بالة', 'ﻪلاﺑ': 'بالة',
  'كرتون': 'كرتون', 'كرتونه': 'كرتون', 'نوترك': 'كرتون', 'نوترک': 'كرتون', 'نوﺗرك': 'كرتون', 'نوترن': 'كرتون', 'نوترق': 'كرتون', 'نوتر': 'كرتون',
  'كيس': 'كيس', 'سيك': 'كيس',
  'حبة': 'حبة', 'حبه': 'حبة', 'هبح': 'حبة', 'ةبح': 'حبة', 'ﻪبح': 'حبة',
  'قطعة': 'قطعة', 'قطعه': 'قطعة', 'عطق': 'قطعة', 'ةعطق': 'قطعة', 'عطقه': 'قطعة',
  'شد': 'شد', 'شدة': 'شد', 'دش': 'شد', 'ردشد': 'شد',
  'بكت': 'بكت', 'باكت': 'بكت', 'تﻜﺑ': 'بكت', 'تكب': 'بكت',
  'علبة': 'علبة', 'علبه': 'علبة', 'ةبلع': 'علبة',
  'جالون': 'جالون', 'نولاج': 'جالون',
  'درزن': 'درزن', 'نزرد': 'درزن'
};

const REVERSED_ARABIC_KEYWORDS = new Set([
  'زر', 'ةزم', 'هزم', 'ةميلولا', 'نوترك', 'نوترک', 'نوترك', 'نوترن', 'نوترق', 'نوتر', 'ةلاب', 'هلاب', 'ةلاﺑ', 'ﻪلاﺑ', 'سيك',
  'هبح', 'ةبح', 'ﻪبح', 'عطق', 'ةعطق', 'عطقه', 'انوﺗ', 'انوتا', 'انوتر', 'ريبك', 'ريغص', 'مارج', 'دلوق', 'ةفاكسن', 'ةفاﻜسن',
  'ةقرم', 'دش', 'ردشد', 'تيزلاب', 'ضيبا', 'ضي race', 'يساورلا', 'بديهملا', 'يباجنب', 'ي race', 'يﺑاجنﺑ', 'يرواشب', 'يرواشﺑ', 'ةلئاعلا',
  'ساك', 'وبلا', 'وبا', 'و race', 'وﺑا', 'يدنه', 'ىدنه', 'ابهذ', 'وكاموا', 'رئازجلا', 'ةياف', 'يرام', 'يحارلا', 'ةفايضلا', 'يلع',
  'وباو', 'يئاطلا', 'ةماخفلا', 'نيهاش', 'لفاح', 'زميلب', 'اينروفلاك', 'انيردنت', 'يدوق', 'ليتس', 'لياتس', 'طسو', 'دوق', 'فوم',
  'ليك', 'مارج', 'ات', 'ةبلع', 'بكت'
]);

function isArabicReversedString(text) {
  if (!text) return false;
  const clean = cleanArabicPresentationForms(text).trim();
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (/^[ةـ][\u0621-\u064A]/u.test(w) || /[لا|لإ|لأ|لآ]$/u.test(w)) return true;
    if (REVERSED_ARABIC_KEYWORDS.has(w)) return true;
  }
  return false;
}

function unreverseSingleToken(token) {
  if (!token) return "";
  const clean = cleanArabicPresentationForms(token).trim();
  if (!clean) return "";

  // If token is purely numbers / math symbols
  if (/^[\d.*xX×\-\/\+()]+$/.test(clean)) {
    return clean;
  }

  // Reverse characters in Arabic token
  let rev = clean.split('').reverse().join('');
  const brackets = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '«': '»', '»': '«' };
  rev = rev.split('').map(ch => brackets[ch] || ch).join('');
  // Reverse digits inside the token back to LTR
  rev = rev.replace(/\d+(\.\d+)?/g, m => m.split('').reverse().join(''));
  return rev;
}

function fixReversedArabicLine(text) {
  if (!text) return "";
  let clean = cleanArabicPresentationForms(text).trim();

  // Re-join fragmented Arabic words caused by PDF font glyph split
  clean = clean.replace(/\b([تةسهرمول])\s+([^\s\d]+)/gu, '$2$1');
  clean = clean.replace(/([^\s\d]+)\s+([تةسهرمول])\b/gu, '$1$2');

  const tokens = clean.split(/\s+/).filter(Boolean);
  const unreversedTokens = tokens.map(t => unreverseSingleToken(t));
  let result = unreversedTokens.join(" ");

  // Spacing around *
  result = result.replace(/\s*([*xX×])\s*/g, ' * ');
  result = result.replace(/\s+/g, ' ').trim();

  // Unicode-safe Dictionary cleanups
  const cleanups = [
    [/(?<![\p{L}\p{N}])االسرة(?![\p{L}\p{N}])/gu, 'الأسرة'],
    [/(?<![\p{L}\p{N}])ااسرة(?![\p{L}\p{N}])/gu, 'الأسرة'],
    [/(?<![\p{L}\p{N}])نسكافة(?![\p{L}\p{N}])/gu, 'نسكافيه'],
    [/(?<![\p{L}\p{N}])نوتيال(?![\p{L}\p{N}])/gu, 'نوتيلا'],
    [/(?<![\p{L}\p{N}])كالسيك(?![\p{L}\p{N}])/gu, 'كلاسيك'],
    [/(?<![\p{L}\p{N}])كالفورنيا(?![\p{L}\p{N}])/gu, 'كاليفورنيا'],
    [/(?<![\p{L}\p{N}])المكال(?![\p{L}\p{N}])/gu, 'المكلا'],
    [/(?<![\p{L}\p{N}])نموتو(?![\p{L}\p{N}])/gu, 'أجينوموتو'],
    [/(?<![\p{L}\p{N}])اجي(?![\p{L}\p{N}])/gu, 'أجي'],
    [/(?<![\p{L}\p{N}])اكياس(?![\p{L}\p{N}])/gu, 'أكياس'],
    [/(?<![\p{L}\p{N}])ابيض(?![\p{L}\p{N}])/gu, 'أبيض'],
    [/(?<![\p{L}\p{N}])ابو(?![\p{L}\p{N}])/gu, 'أبو'],
    [/(?<![\p{L}\p{N}])قواريرالوزير(?![\p{L}\p{N}])/gu, 'قوارير الوزير'],
    [/(?<![\p{L}\p{N}])صغيرتايلندي(?![\p{L}\p{N}])/gu, 'صغير تايلندي'],
    [/(?<![\p{L}\p{N}])كبيرتايلندي(?![\p{L}\p{N}])/gu, 'كبير تايلندي'],
    [/(?<![\p{L}\p{N}])(ليك\s*و|ليكو|كيل\s*و|وليك)(?![\p{L}\p{N}])/gu, 'كيلو'],
    [/(?<![\p{L}\p{N}])(جرا\s*م|جرام|مارج)(?![\p{L}\p{N}])/gu, 'جرام'],
    [/(?<![\p{L}\p{N}])(لت\s*ر|لتر|رتل)(?![\p{L}\p{N}])/gu, 'لتر'],
    [/(?<![\p{L}\p{N}])(علب\s*ة|علبة|ةبلع|بلعة)(?![\p{L}\p{N}])/gu, 'علبة'],
    [/(?<![\p{L}\p{N}])(حب\s*ة|حبة|ةبح|هبح|بهح)(?![\p{L}\p{N}])/gu, 'حبة'],
    [/(?<![\p{L}\p{N}])(تنك\s*ه|تنكة|ةكنت|هكنت)(?![\p{L}\p{N}])/gu, 'تنكة'],
    [/(?<![\p{L}\p{N}])(قارور\s*ه|قارورة|هروراق|ةروراق)(?![\p{L}\p{N}])/gu, 'قارورة'],
    [/(?<![\p{L}\p{N}])دلوق(?![\p{L}\p{N}])/gu, 'قولد'],
    [/(?<![\p{L}\p{N}])لياتس(?![\p{L}\p{N}])/gu, 'ستايل'],
    [/(?<![\p{L}\p{N}])تاتكب(?![\p{L}\p{N}])/gu, 'بكتات'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*كيل\s*و(?![\p{L}\p{N}])/gu, '$1 كيلو'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*لت\s*ر(?![\p{L}\p{N}])/gu, '$1 لتر'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*علب\s*ة(?![\p{L}\p{N}])/gu, '$1 علبة'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*حب\s*ة(?![\p{L}\p{N}])/gu, '$1 حبة'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*بك\s*ت(?![\p{L}\p{N}])/gu, '$1 بكت'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*كي\s*س(?![\p{L}\p{N}])/gu, '$1 كيس'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*جرا\s*م(?![\p{L}\p{N}])/gu, '$1 جرام'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*قارور\s*(?:ك|ه|ة)(?![\p{L}\p{N}])/gu, '$1 قارورة'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*سط\s*ل(?![\p{L}\p{N}])/gu, '$1 سطل'],
    [/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*جالو\s*ن(?![\p{L}\p{N}])/gu, '$1 جالون'],
    [/(?<![\p{L}\p{N}])فاخر1كيلو(?![\p{L}\p{N}])/gu, 'فاخر 1 كيلو'],
    [/(?<![\p{L}\p{N}])ساسا700(?![\p{L}\p{N}])/gu, 'ساسا 700 '],
    [/(?<![\p{L}\p{N}])كب(?![\p{L}\p{N}])/gu, 'بكت']
  ];
  for (const [re, rep] of cleanups) {
    result = result.replace(re, rep);
  }

  return result.replace(/\s+/gu, ' ').trim();
}

window.toggleQuotationExtractedDirection = () => {
  if (Array.isArray(_importParsedItems) && _importParsedItems.length > 0) {
    _importParsedItems.forEach(it => {
      if (it.rawName) {
        it.rawName = fixReversedArabicLine(it.rawName);
      }
    });
    renderParsedItemsTable();
    showToast("تم عكس وتعديل اتجاه نصوص الأصناف بنجاح", "info");
  }
};

window.toggleSupplierExtractedDirection = () => {
  if (Array.isArray(extractedSupplierItems) && extractedSupplierItems.length > 0) {
    extractedSupplierItems.forEach(it => {
      if (it.productName) {
        it.productName = fixReversedArabicLine(it.productName);
      }
    });
    renderExtractedSupplierItemsTable();
    showToast("تم عكس وتعديل اتجاه نصوص الأصناف بنجاح", "info");
  }
};

window.switchImportTab = (tab) => {
  _importActiveTab = tab;
  const filePane = document.getElementById("import-pane-file");
  const pastePane = document.getElementById("import-pane-paste");
  const btnFile = document.getElementById("tab-btn-file");
  const btnPaste = document.getElementById("tab-btn-paste");

  if (tab === "file") {
    if (filePane) filePane.classList.remove("hidden");
    if (pastePane) pastePane.classList.add("hidden");
    if (btnFile) { btnFile.classList.remove("btn-secondary"); btnFile.classList.add("btn-primary"); }
    if (btnPaste) { btnPaste.classList.remove("btn-primary"); btnPaste.classList.add("btn-secondary"); }
  } else {
    if (filePane) filePane.classList.add("hidden");
    if (pastePane) pastePane.classList.remove("hidden");
    if (btnPaste) { btnPaste.classList.remove("btn-secondary"); btnPaste.classList.add("btn-primary"); }
    if (btnFile) { btnFile.classList.remove("btn-primary"); btnFile.classList.add("btn-secondary"); }
    const pasteArea = document.getElementById("qt-import-paste-area");
    if (pasteArea) setTimeout(() => pasteArea.focus(), 100);
  }
};

window.openQuotationImportModal = () => {
  importedQuoteItems = [];
  window._importedCustomerName = "";

  const errEl = document.getElementById("qt-import-error");
  const loadEl = document.getElementById("qt-import-loading");
  const prevEl = document.getElementById("qt-import-preview-area");
  const dropEl = document.getElementById("import-pane-file");
  const submitBtn = document.getElementById("qt-import-submit-btn");
  const reuploadBtn = document.getElementById("qt-import-reupload-btn");
  const fileInput = document.getElementById("qt-import-file-input");
  const pasteArea = document.getElementById("qt-import-paste-area");

  if (errEl) errEl.classList.add("hidden");
  if (loadEl) loadEl.classList.add("hidden");
  if (prevEl) prevEl.classList.add("hidden");
  if (dropEl) dropEl.classList.remove("hidden");
  if (submitBtn) submitBtn.disabled = true;
  if (reuploadBtn) reuploadBtn.style.display = "none";
  if (fileInput) fileInput.value = "";
  if (pasteArea) pasteArea.value = "";

  const priceTypeEl = document.getElementById("qt-import-price-type");
  if (priceTypeEl) priceTypeEl.value = "cost";
  const defaultMarginEl = document.getElementById("qt-import-default-margin");
  if (defaultMarginEl && (!defaultMarginEl.value || defaultMarginEl.value === "0")) defaultMarginEl.value = "10";
  const taxModeEl = document.getElementById("qt-import-tax-mode");
  if (taxModeEl) taxModeEl.value = "exclusive";

  if (typeof onImportPriceTypeChange === "function") {
    onImportPriceTypeChange(false);
  }

  switchImportTab("file");
  openModal("qt-import-modal");
};

// Backward-compatibility alias
window.openPdfImportModal = window.openQuotationImportModal;

window.resetQuotationImport = () => {
  importedQuoteItems = [];
  const prevEl = document.getElementById("qt-import-preview-area");
  const reuploadBtn = document.getElementById("qt-import-reupload-btn");
  const submitBtn = document.getElementById("qt-import-submit-btn");
  const fileInput = document.getElementById("qt-import-file-input");

  if (prevEl) prevEl.classList.add("hidden");
  if (reuploadBtn) reuploadBtn.style.display = "none";
  if (submitBtn) submitBtn.disabled = true;
  if (fileInput) fileInput.value = "";

  switchImportTab(_importActiveTab);
};

function showImportError(msg) {
  const errEl = document.getElementById("qt-import-error");
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  }
  const loadEl = document.getElementById("qt-import-loading");
  if (loadEl) loadEl.classList.add("hidden");
}

function setImportLoading(isLoading, text = "جارٍ قراءة البيانات ومطابقة الأصناف...") {
  const loadEl = document.getElementById("qt-import-loading");
  const textEl = document.getElementById("qt-import-loading-text");
  const errEl = document.getElementById("qt-import-error");
  if (errEl) errEl.classList.add("hidden");

  if (loadEl) {
    if (isLoading) loadEl.classList.remove("hidden");
    else loadEl.classList.add("hidden");
  }
  if (textEl && text) textEl.textContent = text;
}

// ── File Handlers ───────────────────────────────────────────
window.handleQuotationFileDrop = (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) processQuotationFile(files[0]);
};

window.handleQuotationFileInput = (e) => {
  const file = e.target.files[0];
  if (file) processQuotationFile(file);
};

async function processQuotationFile(file) {
  const fname = (file.name || "").toLowerCase();
  const isPdf = fname.endsWith(".pdf") || file.type === "application/pdf";
  const isExcel = fname.endsWith(".xlsx") || fname.endsWith(".xls") || fname.endsWith(".csv") ||
    file.type.includes("sheet") || file.type.includes("excel") || file.type.includes("csv");

  if (isPdf) {
    await processPdfFile(file);
  } else if (isExcel) {
    await processExcelFile(file);
  } else {
    showImportError("نوع الملف غير مدعوم. يرجى اختيار ملف Excel (.xlsx / .xls / .csv) أو ملف PDF.");
  }
}

async function processExcelFile(file) {
  setImportLoading(true, "جارٍ قراءة وتحليل ملف الإكسيل ومطابقة الأصناف لغوياً...");
  try {
    const XLSX = await ensureXlsxLoaded();
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("الملف لا يحتوي على أي صفحات عمل (Sheets).");
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        const result = processRawRows(rawRows);
        applyImportResults(result);
      } catch (err) {
        showImportError(err.message || "حدث خطأ أثناء قراءة ملف الإكسيل");
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (err) {
    showImportError(err.message);
  }
}

// ── Direct Paste Handler (Ctrl+V) ───────────────────────────
window.handlePastedQuotationText = () => {
  const pasteArea = document.getElementById("qt-import-paste-area");
  const text = (pasteArea?.value || "").trim();
  if (!text) {
    showImportError("يرجى لصق بيانات الجدول في المربع أولاً.");
    return;
  }
  setImportLoading(true, "جارٍ تحليل النصوص المنسوخة ومطابقة الأصناف...");
  try {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rawRows = lines.map(line => line.split("\t").map(c => c.trim()));
    const result = processRawRows(rawRows);
    applyImportResults(result);
  } catch (err) {
    showImportError(err.message || "حدث خطأ أثناء تحليل البيانات المنسوخة");
  }
};

// ── PDF Handler ─────────────────────────────────────────────
async function processPdfFile(file) {
  setImportLoading(true, "جارٍ تحليل وقراءة ملف الـ PDF واستخراج البنود...");
  try {
    await ensurePdfJsLoaded();
    const arrayBuffer = await file.arrayBuffer();
    const result = await extractQuotationFromPdf(arrayBuffer);
    if (!result.items || result.items.length === 0) {
      throw new Error("لم نتمكن من استخلاص أي أصناف من جدول عرض السعر في ملف الـ PDF. يرجى التأكد من أن الملف يحتوي على جدول أصناف مقروء.");
    }
    applyImportResults(result);
  } catch (err) {
    showImportError(err.message);
  }
}

async function extractQuotationFromPdf(arrayBuffer) {
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const parsedItems = [];
  let detectedCustomer = "";
  let inTable = false;
  let needCustomerNextLine = false;
  let isDocReversed = false;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const rawItems = (content.items || [])
      .filter(it => it && typeof it.str === "string" && it.str.trim().length > 0)
      .map(it => ({ ...it, str: cleanArabicPresentationForms(it.str) }));
    if (rawItems.length === 0) continue;

    for (const it of rawItems) {
      if (isArabicReversedString(it.str)) {
        isDocReversed = true;
      }
    }

    // Group items into visual lines using vertical tolerance (8.0pt)
    rawItems.sort((a, b) => b.transform[5] - a.transform[5]);
    const lines = [];
    let currentLine = null;
    const Y_TOL = 8.0;

    for (const it of rawItems) {
      const y = it.transform[5];
      if (!currentLine || Math.abs(currentLine.y - y) > Y_TOL) {
        currentLine = { y, items: [it] };
        lines.push(currentLine);
      } else {
        currentLine.items.push(it);
      }
    }

    for (const line of lines) {
      // Sort items RTL (x descending)
      const rtlItems = [...line.items].sort((a, b) => b.transform[4] - a.transform[4]);
      const lineText = rtlItems.map(it => it.str.trim()).filter(Boolean).join(" ");
      if (!lineText) continue;

      // 1. Detect customer in header before table
      if (!inTable && !detectedCustomer) {
        const cleanLine = isDocReversed ? fixReversedArabicLine(lineText) : lineText;
        if (needCustomerNextLine) {
          const m = cleanLine.match(/^(.+?)(?:\s+(?:السيد|المندوب|حسب|مسودة|نقدي|آجل|قائمة)|$)/i);
          if (m && m[1]) {
            detectedCustomer = m[1].trim();
          }
          needCustomerNextLine = false;
        } else if (cleanLine.includes("👤") && (cleanLine.includes("العميل") || cleanLine.includes("Customer"))) {
          const custMatch = cleanLine.match(/(?:العميل|Customer)\s*[:\-–]\s*([^\n\r]+)/i);
          if (custMatch && custMatch[1] && custMatch[1].trim().length > 1) {
            let rawCust = custMatch[1]
              .replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i, "")
              .trim();
            if (rawCust.length >= 2 && !rawCust.includes("المندوب")) detectedCustomer = rawCust;
          } else {
            needCustomerNextLine = true;
          }
        } else if (cleanLine.includes("العميل") || cleanLine.includes("السيد") || cleanLine.includes("السادة") || cleanLine.includes("Customer")) {
          const custMatch = cleanLine.match(/(?:العميل|السيد|السادة|المحترم|Customer|Client)\s*[:\-–]?\s*([^\n\r]+)/i);
          if (custMatch && custMatch[1]) {
            let rawCust = custMatch[1]
              .replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i, "")
              .replace(/الرقم\s*الضريبي.*$/i, "")
              .replace(/المنافسين.*$/i, "")
              .replace(/العنوان.*$/i, "")
              .replace(/س\.?ت.*$/i, "")
              .trim();
            if (rawCust.length >= 2 && !/^(لا\s*يوجد|عام|عميل)$/i.test(rawCust) && !rawCust.includes("المندوب")) {
              detectedCustomer = rawCust;
            }
          }
        }
      }

      // 2. Check if this line is Table Header
      if (isTableHeaderLine(lineText)) {
        inTable = true;
        continue;
      }

      // 3. Check if table has ended (summary / totals / signatures / terms)
      if (inTable && isTableFooterLine(lineText)) {
        inTable = false;
        continue;
      }

      // 4. MUST BE IN TABLE: skip all company headers, footers, etc.
      if (!inTable) {
        continue;
      }

      // 5. Skip blacklisted lines or header continuation lines
      if (isBlacklistedLine(lineText) || lineText.includes("شامل )") || lineText.includes(")%15(")) {
        continue;
      }

      // 6. Try to parse as table product item
      const prodItem = parseLineToProduct(rtlItems, lineText, isDocReversed);
      if (prodItem) {
        parsedItems.push(prodItem);
      }
    }
  }

  return { items: parsedItems, detectedCustomer };
}

function isTableHeaderLine(t) {
  const norm = fixReversedArabicLine(t);
  const hasDesc = /البيان|الصنف|الوصف|اسم\s*الصنف|المادة|Description|Item/i.test(t) || /البيان|الصنف|الوصف|اسم\s*الصنف|المادة|Description|Item/i.test(norm);
  const hasPriceOrQty = /السعر|الكمية|الوحدة|ر\.?\s*الصنف|الصافي|الإجمالي|Price|Qty|Unit|Total/i.test(t) || /السعر|الكمية|الوحدة|ر\.?\s*الصنف|الصافي|الإجمالي|Price|Qty|Unit|Total/i.test(norm);
  return hasDesc && hasPriceOrQty;
}

function isTableFooterLine(t) {
  return /المجموع\s*العام|إجمالي\s*الضريبة|صافي\s*القيمة|المجموع\s*[:\-–\(]|الإجمالي\s*النهائي|اإلجمايل\s*النهايئ|فقط\s*وقدره|توقيع\s*المستلم|ختم\s*الشركة|الشروط\s*والأحكام|الرشوط\s*واألحكام|الأسعار\s*سارية/i.test(t);
}

function isBlacklistedLine(t) {
  if (!t || t.trim().length < 2) return true;
  const s = t.trim();

  // Company header & document metadata
  if (/شركة\s+.*التجارية|رشكة\s+.*|Trading\s+Co|Al-Rafada/i.test(s)) return true;
  if (/Build\s+\d+|شارع\s+|حي\s+|مبنى|مبىن|Yamaniya|Tabara/i.test(s)) return true;
  if (/الرقم\s*الضريبي|الرض\s*يب|Tax\s*Number|السجل\s*التجاري|C\.?R\.?|ص\.?ب|P\.?O\.?\s*Box/i.test(s)) return true;
  if (/هاتف|تلفون|جوال|فاكس|Tel\b|Mobile\b|Fax\b/i.test(s)) return true;
  if (/عرض\s*سعر\s*مبيعات|عرض\s*بيع/i.test(s)) return true;
  if (/المركز\s*الرئيسي|م\.\s*الرئيسي/i.test(s)) return true;
  if (/المستودع\s*[:\-]|المندوب\s*[:\-]|التاريخ\s*[:\-]|الموافق\s*[:\-]|الوقت\s*[:\-]|النوع\s*[:\-]|مرجع\s*[:\-]/i.test(s)) return true;
  if (/الصفحة\s+\d+\s+من\s+\d+|Page\s+\d+\s+of\s+\d+/i.test(s)) return true;
  if (/المنافسين|العنوان\s*[:\-]/i.test(s)) return true;
  if (/العميل\s*[:\-]/i.test(s)) return true;

  // Pure phone or number sequence line
  if (/^[\d\s\-\+\(\)\/]{7,}$/.test(s.replace(/\s+/g, ""))) return true;

  return false;
}

function parseLineToProduct(rtlItems, lineText, isDocReversed = false) {
  const tokens = rtlItems.map(it => it.str.trim()).filter(t => t && !["ر","س",".","ر.س","—","ر.س.","SAR"].includes(t));
  if (tokens.length < 2) return null;

  // Must not be blacklisted
  if (isBlacklistedLine(lineText)) return null;

  const unitRegex = /^(بالة|كيس|كرتون|كرتونة|كرتونه|حبة|حبه|علبة|علبه|كيلو|كجم|كغ|شد|شدة|قطعة|قطعه|بكت|باكت|درزن|صندوق|طبق|طرد|برميل|جالون|لتر|لرت|تنك|طن|رول|شوال|PCS|BOX|CTN|BAG|KG|PAC|BALE)$/i;

  const isNumericToken = (tok) => /^[%]?\s*[\d,]+(\.\d+)?\s*[%]?$/.test(tok.trim());

  let firstTrailingNumIdx = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (isNumericToken(tokens[i])) {
      firstTrailingNumIdx = i;
    } else {
      break;
    }
  }

  let unit = "حبة";
  let rawName = "";
  let sku = "";
  let qty = 1;
  let price = 0;

  if (firstTrailingNumIdx !== -1 && firstTrailingNumIdx > 0) {
    const candidateUnitIdx = firstTrailingNumIdx - 1;
    const candidateUnit = tokens[candidateUnitIdx];
    let nameEndIdx = candidateUnitIdx;

    if (unitRegex.test(candidateUnit)) {
      unit = candidateUnit;
    } else {
      for (let i = candidateUnitIdx; i >= Math.max(0, candidateUnitIdx - 2); i--) {
        if (unitRegex.test(tokens[i])) {
          unit = tokens[i];
          nameEndIdx = i;
          break;
        }
      }
    }

    const beforeTokens = tokens.slice(0, nameEndIdx);
    let startIdx = 0;

    // 1. Check serial number e.g. "1", "2", "3"
    if (beforeTokens.length > 0 && /^\d{1,4}$/.test(beforeTokens[0])) {
      startIdx = 1;
    }

    // 2. Check SKU e.g. "01-0445"
    if (beforeTokens.length > startIdx && /^(\d{2,5}[-\/]\d{2,5}|\d{4,10}|[A-Z0-9]{3,8})$/i.test(beforeTokens[startIdx])) {
      sku = beforeTokens[startIdx];
      startIdx++;
    }

    rawName = beforeTokens.slice(startIdx).join(" ").trim();

    // Extract numbers from trailing tokens
    const nums = [];
    tokens.slice(firstTrailingNumIdx).forEach(tok => {
      if (tok.includes("%") && !tok.match(/\d+\.\d+/)) return;
      const clean = tok.replace(/[^\d.]/g, "");
      const val = parseFloat(clean);
      if (!isNaN(val) && clean.length > 0 && clean.length < 9) {
        nums.push(val);
      }
    });

    if (nums.length >= 2) {
      qty = nums[0];
      price = nums[1];
    } else if (nums.length === 1) {
      price = nums[0];
    }
  } else {
    // Fallback extraction
    const textTokens = [];
    const nums = [];

    tokens.forEach((tok, idx) => {
      const clean = tok.replace(/[^\d.]/g, "");
      const val = parseFloat(clean);
      if (!isNaN(val) && clean.length > 0 && clean.length < 9 && /^[\d.%]+$/.test(tok)) {
        if (idx === 0 && /^\d{1,3}$/.test(clean)) {
          // row serial
        } else {
          nums.push(val);
        }
      } else if (unitRegex.test(tok)) {
        unit = tok;
      } else if (/^\d{2,5}[-\/]\d{2,5}$/.test(tok)) {
        sku = tok;
      } else {
        if (tok.length > 1 && !["*","x","-","=","/","+","—","%"].includes(tok)) {
          textTokens.push(tok);
        }
      }
    });

    rawName = textTokens.join(" ").trim();
    if (nums.length >= 2) {
      qty = nums[0];
      price = nums[1];
    } else if (nums.length === 1) {
      price = nums[0];
    }
  }

  // Unreverse reversed Arabic strings
  if (isDocReversed || isArabicReversedString(rawName)) {
    rawName = fixReversedArabicLine(rawName);
  }
  if (isDocReversed || isArabicReversedString(unit)) {
    unit = fixReversedArabicLine(unit);
  }

  // Sanity checks:
  if (!rawName || rawName.length < 2) return null;
  if (rawName.includes("شامل )") || rawName.includes("%15")) return null;
  if (!/[\p{L}]/u.test(rawName)) return null;
  if (price <= 0 || price > 1000000) return null;
  if (qty <= 0) qty = 1;

  const taxMode = document.getElementById("qt-import-tax-mode")?.value || "exclusive";
  const priceType = document.getElementById("qt-import-price-type")?.value || "cost";
  const defaultMargin = parseFloat(document.getElementById("qt-import-default-margin")?.value) || 10;

  let basePrice = price;
  if (taxMode === "inclusive" && price > 0) {
    basePrice = Math.round((price / 1.15) * 100) / 100;
  }

  let unitCost = 0;
  let profitMargin = 0;
  let unitPrice = basePrice;

  if (priceType === "cost") {
    unitCost = basePrice;
    profitMargin = defaultMargin;
    unitPrice = Math.round(basePrice * (1 + defaultMargin / 100) * 100) / 100;
  }

  return {
    included: true,
    rawName,
    sku,
    unit: unit || "حبة",
    qty,
    rawExcelPrice: price,
    rawPreTaxPrice: basePrice,
    unitCost,
    profitMargin,
    unitPrice,
    discount: 0,
    matchedProductId: "",
    matchStatus: "adhoc",
    matchScore: 0
  };
}

// ── Master 2D Array Processor (Excel & Paste) ────────────────
function processRawRows(rawRows) {
  if (!rawRows || rawRows.length === 0) {
    throw new Error("الملف أو النص فارغ ولا يحتوي على أي بيانات.");
  }

  // 1. Detect Customer Name from header rows (rows 0-5)
  let detectedCustomer = "";
  for (let r = 0; r < Math.min(6, rawRows.length); r++) {
    const rowStr = (rawRows[r] || []).map(c => String(c||"").trim()).filter(Boolean).join(" ");
    if (rowStr.includes("عرض سعر") || rowStr.includes("عرض اسعار") || rowStr.includes("العميل") || rowStr.includes("السيد") || rowStr.includes("السادة")) {
      const match = rowStr.match(/(?:عرض\s*سعر|عرض\s*اسعار|العميل|السيد|السادة)\s*[-:\/]?\s*(.+)/i);
      if (match && match[1]) {
        let cust = match[1].replace(/[-_]/g, " ").trim();
        cust = cust.replace(/^المحترم(ين)?/i, "").replace(/رقم\s*\d+.*$/i, "").trim();
        if (cust && !cust.includes("مبيعات") && !cust.includes("تقرير")) {
          detectedCustomer = cust;
          break;
        }
      }
    }
  }

  // 2. Find Header Row index & map columns
  let headerRowIndex = -1;
  const colMap = {
    name: -1,
    unit: -1,
    qty: -1,
    priceBefore: -1,
    priceIncl: -1,
    pricePlain: -1,
    priceAfterDisc: -1,
    disc: -1,
    sku: -1,
    vat: -1,
    totalIncl: -1
  };

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.length < 2) continue;

    const rowStr = row.map(c => String(c||"").trim().toLowerCase()).join(" ");
    if (
      (rowStr.includes("اسم") || rowStr.includes("صنف") || rowStr.includes("بيان") || rowStr.includes("وصف") || rowStr.includes("مادة") || rowStr.includes("ماده")) &&
      (rowStr.includes("سعر") || rowStr.includes("كمي") || rowStr.includes("وحد") || rowStr.includes("إجمالي") || rowStr.includes("اجمالي"))
    ) {
      headerRowIndex = r;
      row.forEach((cell, cIdx) => {
        const s = String(cell || "").trim().toLowerCase();
        if (!s) return;

        // Name (must not be SKU or code)
        if ((s.includes("اسم") || s.includes("صنف") || s.includes("بيان") || s.includes("وصف") || s.includes("مادة") || s.includes("ماده") || s === "item" || s === "product" || s === "description") && !s.includes("رقم") && !s.includes("كود") && !s.includes("رمز")) {
          if (colMap.name === -1) colMap.name = cIdx;
        }
        // SKU / Product Code (exclude warehouse number)
        else if ((s.includes("صنف") && s.includes("رقم")) || s.includes("كود") || s.includes("رمز") || s === "sku" || s === "code") {
          if (colMap.sku === -1) colMap.sku = cIdx;
        }
        // Unit
        else if (s.includes("وحد") || s === "unit" || s === "uom") {
          if (colMap.unit === -1) colMap.unit = cIdx;
        }
        // Qty
        else if (s.includes("كمي") || s.includes("عدد") || s === "qty" || s === "quantity") {
          if (colMap.qty === -1) colMap.qty = cIdx;
        }
        // Discount
        else if (s.includes("خصم") || s === "disc" || s === "discount") {
          if (colMap.disc === -1) colMap.disc = cIdx;
        }
        // Specific price columns:
        // 1. Price before tax (highest priority for base unit price)
        else if (s.includes("قبل") && s.includes("ضريب")) {
          colMap.priceBefore = cIdx;
        }
        // 2. Price inclusive of tax (unit price with VAT)
        else if (s.includes("شامل") && s.includes("ضريب") && !s.includes("إجمالي") && !s.includes("اجمالي")) {
          colMap.priceIncl = cIdx;
        }
        // 3. Total inclusive of tax
        else if ((s.includes("إجمالي") || s.includes("اجمالي")) && s.includes("شامل")) {
          colMap.totalIncl = cIdx;
        }
        // 4. VAT amount
        else if (s.includes("ضريب") && !s.includes("سعر") && !s.includes("قبل") && !s.includes("شامل")) {
          colMap.vat = cIdx;
        }
        // 5. Price after discount
        else if (s.includes("بعد") && s.includes("خصم")) {
          colMap.priceAfterDisc = cIdx;
        }
        // 6. Plain price (e.g. "السعر" or "price")
        else if ((s.includes("سعر") || s === "price" || s === "rate") && !s.includes("بعد") && !s.includes("شامل") && !s.includes("إجمالي") && !s.includes("اجمالي") && !s.includes("قبل")) {
          if (colMap.pricePlain === -1) colMap.pricePlain = cIdx;
        }
      });
      break;
    }
  }

  // Determine which price column to use:
  let activePriceCol = -1;
  let isColTaxInclusive = false;

  if (colMap.priceBefore !== -1) {
    activePriceCol = colMap.priceBefore;
    isColTaxInclusive = false;
  } else if (colMap.pricePlain !== -1) {
    activePriceCol = colMap.pricePlain;
    isColTaxInclusive = false;
  } else if (colMap.priceAfterDisc !== -1) {
    activePriceCol = colMap.priceAfterDisc;
    isColTaxInclusive = false;
  } else if (colMap.priceIncl !== -1) {
    activePriceCol = colMap.priceIncl;
    isColTaxInclusive = true;
  }

  // 3. Positional Fallback if header not detected
  if (headerRowIndex === -1) {
    headerRowIndex = -1; // start from row 0
    let bestTextCol = 0, maxAvgLen = 0;
    const numCols = (rawRows[0] || []).length;
    for (let c = 0; c < numCols; c++) {
      let textLenSum = 0, count = 0;
      for (let r = 0; r < Math.min(10, rawRows.length); r++) {
        const val = String(rawRows[r][c] || "").trim();
        if (isNaN(parseFloat(val)) && val.length > 2) {
          textLenSum += val.length;
          count++;
        }
      }
      const avg = count > 0 ? textLenSum / count : 0;
      if (avg > maxAvgLen) { maxAvgLen = avg; bestTextCol = c; }
    }
    colMap.name = bestTextCol;
    colMap.unit = bestTextCol + 1 < numCols ? bestTextCol + 1 : -1;
    colMap.qty = bestTextCol + 2 < numCols ? bestTextCol + 2 : -1;
    colMap.pricePlain = bestTextCol + 3 < numCols ? bestTextCol + 3 : -1;
    activePriceCol = colMap.pricePlain;
    isColTaxInclusive = false;
  }

  // Sync tax mode in UI dropdown
  const taxModeEl = document.getElementById("qt-import-tax-mode");
  if (taxModeEl) {
    taxModeEl.value = isColTaxInclusive ? "inclusive" : "exclusive";
  }

  // 4. Parse Rows
  const parsedItems = [];
  const isTaxInclusive = (taxModeEl?.value === "inclusive") || isColTaxInclusive;
  const priceType = document.getElementById("qt-import-price-type")?.value || "cost";
  const defaultMargin = parseFloat(document.getElementById("qt-import-default-margin")?.value) || 10;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawName = colMap.name !== -1 ? String(row[colMap.name] || "").trim() : "";
    if (!rawName || rawName.length < 2) continue;

    // Filter out total/summary rows
    const normLower = rawName.toLowerCase();
    if (normLower.includes("اجمالي") || normLower.includes("إجمالي") || normLower.includes("مجموع") ||
        normLower.includes("total") || normLower.includes("ضريبة") || normLower.includes("vat") ||
        normLower.includes("فقط وقدره") || normLower.includes("الشروط") || normLower.includes("توقيع")) {
      continue;
    }

    const sku = colMap.sku !== -1 ? String(row[colMap.sku] || "").trim() : "";
    const unit = colMap.unit !== -1 ? String(row[colMap.unit] || "").trim() : "حبة";

    // Qty
    let rawQty = colMap.qty !== -1 ? row[colMap.qty] : 1;
    let qty = parseFloat(String(rawQty).replace(/[^\d.]/g, "")) || 1;
    if (qty <= 0) qty = 1;

    // Price
    let rawPrice = activePriceCol !== -1 ? row[activePriceCol] : 0;
    let priceVal = parseFloat(String(rawPrice).replace(/[^\d.]/g, "")) || 0;

    // Tax handling
    const preTaxVal = (isTaxInclusive && priceVal > 0) ? (Math.round((priceVal / 1.15) * 100) / 100) : (Math.round(priceVal * 100) / 100);

    let unitCost = 0;
    let profitMargin = 0;
    let unitPrice = preTaxVal;

    if (priceType === "cost") {
      unitCost = preTaxVal;
      profitMargin = defaultMargin;
      unitPrice = Math.round(preTaxVal * (1 + defaultMargin / 100) * 100) / 100;
    }

    // Discount
    let rawDisc = colMap.disc !== -1 ? row[colMap.disc] : 0;
    let discount = parseFloat(String(rawDisc).replace(/[^\d.]/g, "")) || 0;

    parsedItems.push({
      included: true,
      rawName,
      sku,
      unit: unit || "حبة",
      qty,
      rawExcelPrice: priceVal,
      rawPreTaxPrice: preTaxVal,
      unitCost,
      profitMargin,
      unitPrice,
      discount,
      matchedProductId: "",
      matchStatus: "adhoc",
      matchScore: 0
    });
  }

  if (parsedItems.length === 0) {
    throw new Error("لم يتم العثور على أسطر أصناف صالحة في الملف أو النص.");
  }

  return { items: parsedItems, detectedCustomer };
}

// ── Raw Item Preserver (No Catalog Linking / No Guessing) ────
function matchProductsForImportedItems(items) {
  // Completely decoupled from catalog: Preserve exact names, units, and values from Excel/PDF!
  items.forEach(item => {
    item.matchedProductId = "";
    item.matchStatus = "adhoc";
    item.matchScore = 0;
  });
}

function applyImportResults(result) {
  importedQuoteItems = result.items;
  matchProductsForImportedItems(importedQuoteItems);

  setImportLoading(false);

  // Hide input panes & show preview
  const filePane = document.getElementById("import-pane-file");
  const pastePane = document.getElementById("import-pane-paste");
  const prevArea = document.getElementById("qt-import-preview-area");
  const submitBtn = document.getElementById("qt-import-submit-btn");
  const reuploadBtn = document.getElementById("qt-import-reupload-btn");
  const custInput = document.getElementById("qt-import-detected-customer");
  const custStatus = document.getElementById("qt-import-customer-status");

  if (filePane) filePane.classList.add("hidden");
  if (pastePane) pastePane.classList.add("hidden");
  if (prevArea) prevArea.classList.remove("hidden");
  if (submitBtn) submitBtn.disabled = false;
  if (reuploadBtn) reuploadBtn.style.display = "inline-flex";

  // Set Customer Name if detected
  window._importedCustomerName = result.detectedCustomer || "";
  if (custInput) custInput.value = window._importedCustomerName;
  if (custStatus) {
    if (window._importedCustomerName) {
      // Check if matches ERP customer (including reversed word order from Arabic PDF)
      const reversedCust = window._importedCustomerName.split(" ").reverse().join(" ");
      const found = customers.find(c =>
        normalizeArabicText(c.name).includes(normalizeArabicText(window._importedCustomerName)) ||
        normalizeArabicText(window._importedCustomerName).includes(normalizeArabicText(c.name)) ||
        normalizeArabicText(c.name).includes(normalizeArabicText(reversedCust)) ||
        normalizeArabicText(reversedCust).includes(normalizeArabicText(c.name))
      );
      if (found) {
        window._importedCustomerName = found.name;
        if (custInput) custInput.value = found.name;
        custStatus.innerHTML = `✅ متطابق مع العميل: <strong>${found.name}</strong>`;
      } else {
        custStatus.innerHTML = `ℹ️ سيتم استخدامه كاسم عميل في العرض`;
      }
    } else {
      custStatus.innerHTML = `(يمكنك كتابة اسم العميل أعلاه)`;
    }
  }

  // Ensure price type display matches current selection
  window.onImportPriceTypeChange(false);
}

window.onImportPriceTypeChange = (shouldRecalc = true) => {
  const priceType = document.getElementById("qt-import-price-type")?.value || "cost";
  const marginBar = document.getElementById("qt-import-margin-bar");
  const costBox = document.getElementById("qt-import-cost-summary-box");
  const profitBox = document.getElementById("qt-import-profit-summary-box");
  const thCost = document.getElementById("qt-th-cost");
  const thMargin = document.getElementById("qt-th-margin");
  const thPrice = document.getElementById("qt-th-price");

  if (priceType === "cost") {
    if (marginBar) marginBar.style.display = "flex";
    if (costBox) costBox.style.display = "block";
    if (profitBox) profitBox.style.display = "block";
    if (thCost) thCost.textContent = "سعر التكلفة";
    if (thMargin) thMargin.style.display = "";
    if (thPrice) thPrice.textContent = "سعر البيع (غير شامل)";
  } else {
    if (marginBar) marginBar.style.display = "none";
    if (costBox) costBox.style.display = "none";
    if (profitBox) profitBox.style.display = "none";
    if (thCost) thCost.textContent = "سعر البيع المباشر";
    if (thMargin) thMargin.style.display = "none";
    if (thPrice) thPrice.textContent = "السعر بعد التعديل";
  }

  if (shouldRecalc && importedQuoteItems && importedQuoteItems.length > 0) {
    const defaultMargin = parseFloat(document.getElementById("qt-import-default-margin")?.value) || 10;
    const isTaxInclusive = document.getElementById("qt-import-tax-mode")?.value === "inclusive";

    importedQuoteItems.forEach(item => {
      const raw = item.rawExcelPrice > 0 ? item.rawExcelPrice : (item.rawPreTaxPrice || item.unitCost || item.unitPrice || 0);
      const preTax = (isTaxInclusive && raw > 0) ? Math.round((raw / 1.15) * 100) / 100 : Math.round(raw * 100) / 100;
      item.rawPreTaxPrice = preTax;

      if (priceType === "cost") {
        item.unitCost = preTax;
        item.profitMargin = (item.profitMargin !== undefined && item.profitMargin !== 0) ? item.profitMargin : defaultMargin;
        item.unitPrice = Math.round(item.unitCost * (1 + item.profitMargin / 100) * 100) / 100;
      } else {
        item.unitCost = 0;
        item.profitMargin = 0;
        item.unitPrice = preTax;
      }
    });
  }

  renderParsedImportItems();
};

window.applyGlobalImportMargin = (marginVal) => {
  const m = parseFloat(marginVal) || 0;
  const marginInput = document.getElementById("qt-import-default-margin");
  if (marginInput) marginInput.value = m;

  const priceTypeEl = document.getElementById("qt-import-price-type");
  if (priceTypeEl && priceTypeEl.value !== "cost") {
    priceTypeEl.value = "cost";
    onImportPriceTypeChange(false);
  }

  importedQuoteItems.forEach(item => {
    item.profitMargin = m;
    const cost = (item.unitCost > 0) ? item.unitCost : (item.rawPreTaxPrice || item.rawExcelPrice || 0);
    item.unitCost = cost;
    item.unitPrice = cost > 0 ? Math.round(cost * (1 + m / 100) * 100) / 100 : item.unitPrice;
  });

  renderParsedImportItems();
  showToast(`تم تطبيق هامش ربح ${m}% على جميع الأصناف بنجاح ⚡`, "info");
};

window.reapplyTaxModeToImported = () => {
  if (!importedQuoteItems || importedQuoteItems.length === 0) return;
  const isTaxInclusive = document.getElementById("qt-import-tax-mode")?.value === "inclusive";
  const isCostMode = (document.getElementById("qt-import-price-type")?.value || "cost") === "cost";
  const defaultMargin = parseFloat(document.getElementById("qt-import-default-margin")?.value) || 10;

  importedQuoteItems.forEach(item => {
    const raw = item.rawExcelPrice > 0 ? item.rawExcelPrice : (item.rawPreTaxPrice || item.unitCost || item.unitPrice || 0);
    const preTax = (isTaxInclusive && raw > 0) ? Math.round((raw / 1.15) * 100) / 100 : Math.round(raw * 100) / 100;
    item.rawPreTaxPrice = preTax;

    if (isCostMode) {
      item.unitCost = preTax;
      const margin = item.profitMargin !== undefined ? item.profitMargin : defaultMargin;
      item.profitMargin = margin;
      item.unitPrice = Math.round(preTax * (1 + margin / 100) * 100) / 100;
    } else {
      item.unitCost = 0;
      item.profitMargin = 0;
      item.unitPrice = preTax;
    }
  });
  renderParsedImportItems();
};

function renderParsedImportItems() {
  const tbody = document.getElementById("qt-import-parsed-tbody");
  if (!tbody) return;

  const isCostMode = (document.getElementById("qt-import-price-type")?.value || "cost") === "cost";

  tbody.innerHTML = importedQuoteItems.map((item, idx) => {
    const qty = parseFloat(item.qty) || 0;
    const unitCost = parseFloat(item.unitCost) || 0;
    const profitMargin = parseFloat(item.profitMargin) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const gross = qty * unitPrice;
    const disc = gross * (parseFloat(item.discount) || 0) / 100;
    const net = gross - disc;
    const vat = Math.round(net * 0.15 * 100) / 100;
    const netIncl = Math.round((net + vat) * 100) / 100;
    const unitPriceIncl = Math.round(unitPrice * 1.15 * 100) / 100;

    return `
      <tr style="${!item.included ? 'opacity:0.45;background:#f8fafc;' : ''}">
        <td style="text-align:center;">
          <input type="checkbox" ${item.included ? 'checked' : ''} onchange="toggleImportItemIncluded(${idx}, this.checked)" />
        </td>
        <td style="text-align:center;color:var(--text-3);font-size:11px;">${idx + 1}</td>
        <td>
          <input type="text" class="input sm" style="font-weight:700;color:var(--text-0);font-size:12px;width:100%;"
            value="${(item.rawName || '').replace(/"/g, '&quot;')}" onchange="updateImportItem(${idx}, 'rawName', this.value)" />
        </td>
        <td style="text-align:center;">
          <span style="font-family:monospace;font-size:11.5px;color:var(--text-2);">${item.sku || '—'}</span>
        </td>
        <td style="text-align:center;">
          <input type="text" class="input sm" style="width:65px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${item.unit || 'حبة'}" onchange="updateImportItem(${idx}, 'unit', this.value)" />
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono font-bold" style="width:60px;height:26px;text-align:center;font-size:12px;padding:2px;"
            value="${item.qty}" min="0.001" step="0.001" onchange="updateImportItem(${idx}, 'qty', this.value)" />
        </td>
        <td>
          <input type="number" class="input sm mono font-bold" style="width:85px;height:26px;font-size:12px;padding:2px;background:#f0fdf4;border-color:#86efac;color:#166534;"
            value="${isCostMode ? unitCost : unitPrice}" min="0" step="0.01" title="${isCostMode ? 'سعر التكلفة من المورد' : 'سعر البيع المباشر'}"
            onchange="updateImportItem(${idx}, '${isCostMode ? 'unitCost' : 'unitPrice'}', this.value)" />
        </td>
        ${isCostMode ? `
        <td style="text-align:center;">
          <input type="number" class="input sm mono font-bold" style="width:60px;height:26px;text-align:center;font-size:12px;padding:2px;background:#eff6ff;border-color:#93c5fd;color:#1e40af;"
            value="${profitMargin}" step="0.5" title="نسبة هامش الربح %"
            onchange="updateImportItem(${idx}, 'profitMargin', this.value)" />
        </td>
        ` : `<td style="display:none;"></td>`}
        <td>
          <input type="number" class="input sm mono font-bold" style="width:88px;height:26px;font-size:12px;padding:2px;border-color:#bfdbfe;"
            value="${unitPrice}" min="0" step="0.01" title="سعر البيع المقترح للعميل"
            onchange="updateImportItem(${idx}, 'unitPrice', this.value)" />
        </td>
        <td class="mono font-bold" style="color:#0284c7;font-size:11.5px;">
          ${formatCurrency(unitPriceIncl)}
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono" style="width:46px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${item.discount || 0}" min="0" max="100" step="0.5" onchange="updateImportItem(${idx}, 'discount', this.value)" />
        </td>
        <td class="mono font-bold text-good" style="font-size:12.5px;">
          ${formatCurrency(netIncl)}
        </td>
      </tr>
    `;
  }).join("");

  recalcImportTotals();
}

window.toggleAllImportedItems = (checked) => {
  importedQuoteItems.forEach(item => item.included = checked);
  renderParsedImportItems();
};

window.toggleImportItemIncluded = (idx, checked) => {
  if (importedQuoteItems[idx]) {
    importedQuoteItems[idx].included = checked;
    renderParsedImportItems();
  }
};

window.updateImportItem = (idx, field, val) => {
  const item = importedQuoteItems[idx];
  if (!item) return;
  if (field === "rawName") item.rawName = val;
  else if (field === "sku") item.sku = val;
  else if (field === "unit") item.unit = val;
  else if (field === "qty") item.qty = parseFloat(val) || 1;
  else if (field === "unitCost") {
    const cost = parseFloat(val) || 0;
    item.unitCost = cost;
    item.rawPreTaxPrice = cost;
    const margin = parseFloat(item.profitMargin) || 0;
    item.unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
  }
  else if (field === "profitMargin") {
    const margin = parseFloat(val) || 0;
    item.profitMargin = margin;
    const cost = parseFloat(item.unitCost) || 0;
    item.unitPrice = cost > 0 ? Math.round(cost * (1 + margin / 100) * 100) / 100 : item.unitPrice;
  }
  else if (field === "unitPrice") {
    const price = parseFloat(val) || 0;
    item.unitPrice = price;
    const cost = parseFloat(item.unitCost) || 0;
    if (cost > 0) {
      item.profitMargin = Math.round(((price / cost) - 1) * 100 * 10) / 10;
    }
  }
  else if (field === "discount") item.discount = parseFloat(val) || 0;

  renderParsedImportItems();
};

function recalcImportTotals() {
  const totalItems = importedQuoteItems.length;
  const activeItems = importedQuoteItems.filter(i => i.included);
  const isCostMode = (document.getElementById("qt-import-price-type")?.value || "cost") === "cost";

  let totCost = 0;
  let totGross = 0;
  activeItems.forEach(i => {
    const qty = parseFloat(i.qty) || 0;
    const cost = parseFloat(i.unitCost) || 0;
    const unitPrice = parseFloat(i.unitPrice) || 0;
    const disc = (qty * unitPrice) * (parseFloat(i.discount) || 0) / 100;
    totCost += (qty * cost);
    totGross += ((qty * unitPrice) - disc);
  });

  const totProfit = totGross - totCost;
  const profitMarginPercent = totCost > 0 ? Math.round((totProfit / totCost) * 1000) / 10 : 0;
  const totVat = Math.round(totGross * 0.15 * 100) / 100;
  const totGrand = Math.round((totGross + totVat) * 100) / 100;

  const statTotal = document.getElementById("qt-stat-total-items");
  if (statTotal) {
    statTotal.textContent = `📦 ${activeItems.length} من ${totalItems} صنف (${isCostMode ? 'حساب أسعار بهامش ربح' : 'استيراد بيع مباشر'})`;
  }

  const elCost = document.getElementById("qt-import-tot-cost");
  const elProfit = document.getElementById("qt-import-tot-profit");
  const elGross = document.getElementById("qt-import-tot-gross");
  const elVat = document.getElementById("qt-import-tot-vat");
  const elGrand = document.getElementById("qt-import-tot-grand");

  if (elCost) elCost.textContent = formatCurrency(totCost);
  if (elProfit) {
    const sign = totProfit >= 0 ? "+" : "";
    elProfit.textContent = `${sign}${formatCurrency(totProfit)} (${sign}${profitMarginPercent}%)`;
    elProfit.style.color = totProfit >= 0 ? "#166534" : "#dc2626";
  }
  if (elGross) elGross.textContent = formatCurrency(totGross);
  if (elVat) elVat.textContent = formatCurrency(totVat);
  if (elGrand) elGrand.textContent = formatCurrency(totGrand);
}

// ── Submit & Populate Quotation (Pure Ad-hoc Lines — Zero Overwrite) ──────────────
window.submitImportedQuotationItems = () => {
  const activeItems = (importedQuoteItems || []).filter(item => item.included);
  if (activeItems.length === 0) {
    showToast("يرجى تحديد صنف واحد على الأقل للاستيراد", "warn");
    return;
  }

  // Detect customer name and id
  const custDetectedVal = (document.getElementById("qt-import-detected-customer")?.value || "").trim() || window._importedCustomerName || "";
  let matchedCustomer = null;
  if (custDetectedVal) {
    matchedCustomer = customers.find(c =>
      normalizeArabicText(c.name).includes(normalizeArabicText(custDetectedVal)) ||
      normalizeArabicText(custDetectedVal).includes(normalizeArabicText(c.name))
    );
  }

  // Pre-fill items array with exact cost and profit margin
  const preparedItems = activeItems.map((item, idx) => {
    const qty = parseFloat(item.qty) || 1;
    const unitCost = parseFloat(item.unitCost) || 0;
    const margin = parseFloat(item.profitMargin) || 0;
    const unitPrice = parseFloat(item.unitPrice) || (unitCost > 0 ? Math.round(unitCost * (1 + margin / 100) * 100) / 100 : 0);
    const discount = parseFloat(item.discount) || 0;
    const adhocId = "adhoc_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6);

    return {
      productId:   adhocId,
      productName: item.rawName,
      sku:         item.sku || "",
      unit:        item.unit || "حبة",
      qty:         qty,
      cost:        unitCost,
      lastPurchasePrice: unitCost,
      margin:      margin,
      unitPrice:   unitPrice,
      discount:    discount,
      isCustom:    true,
      taxCategory: "S"
    };
  });

  // Close Import Modal
  closeModal("qt-import-modal");

  // Construct draftQuote object with customer and items
  const draftQuote = {
    customerName: matchedCustomer ? matchedCustomer.name : custDetectedVal,
    customerId:   matchedCustomer ? matchedCustomer.id : (custDetectedVal ? "adhoc_customer" : ""),
    items:        preparedItems
  };

  // Open Quotation Form Modal with the draft quote!
  openQuoteForm(draftQuote);

  showToast(`✨ تم استيراد وتجهيز ${preparedItems.length} صنفاً بحساب التكلفة وهوامش الربح بدقة 100%!`, "success");
};

// ============================================================
// QUICK PRODUCT & AD-HOC ITEM FUNCTIONS
// ============================================================
window._adhocRowToReplaceIndex = null;

window.addCustomQuoteLine = (initialName = "") => {
  const input = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  if (input) input.value = "";
  if (results) results.classList.add("hidden");

  const adhocId = "adhoc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const priceListKey = document.getElementById("qt-pricelist")?.value || "standard";
  let defaultMargin = plMargins.retailMargin || 10;
  if (priceListKey === "tier1") {
    defaultMargin = getTier1MarginForProduct({ name: initialName });
  } else if (priceListKey === "wholesale") defaultMargin = plMargins.wholesaleMargin || 7;
  else if (priceListKey === "distributor") defaultMargin = plMargins.distributorMargin || 5;

  quoteItems.unshift({
    productId: adhocId,
    productName: initialName || "بند حر جديد",
    sku: "",
    unit: "كرتون",
    qty: 1,
    cost: 0,
    lastPurchasePrice: 0,
    margin: defaultMargin,
    unitPrice: 0,
    discount: 0,
    isCustom: true
  });

  renderQuoteLines();
  showToast("تمت إضافة بند حر بأعلى الجدول ✨", "info");

  setTimeout(() => {
    const firstRow = document.querySelector("#qt-lines-tbody tr:first-child");
    if (firstRow) {
      if (!initialName) {
        const nameInput = firstRow.querySelector("input[placeholder*='اسم']");
        if (nameInput) { nameInput.focus(); nameInput.select(); }
      } else {
        const qtyInput = firstRow.querySelector(".qt-line-qty");
        if (qtyInput) { qtyInput.focus(); qtyInput.select(); }
      }
    }
  }, 50);
};

window.openQuickAddProductModal = (prefillName = "", rowIndex = null) => {
  window._adhocRowToReplaceIndex = (rowIndex !== null && rowIndex !== undefined) ? rowIndex : null;

  const nameEl = document.getElementById("qt-qp-name");
  const skuEl = document.getElementById("qt-qp-sku");
  const unitEl = document.getElementById("qt-qp-unit");
  const catEl = document.getElementById("qt-qp-category");
  const costEl = document.getElementById("qt-qp-cost");
  const marginEl = document.getElementById("qt-qp-margin");
  const priceEl = document.getElementById("qt-qp-price");
  const errEl = document.getElementById("qt-qp-error");
  const titleEl = document.getElementById("qt-qp-title");

  if (errEl) errEl.classList.add("hidden");

  if (catEl) {
    catEl.innerHTML = '<option value="">(بدون تصنيف)</option>' +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  if (rowIndex !== null && rowIndex !== undefined && quoteItems[rowIndex]) {
    const row = quoteItems[rowIndex];
    if (titleEl) titleEl.textContent = "تسجيل البند الحر كصنف دائم بالكتالوج";
    if (nameEl) nameEl.value = row.productName || "";
    if (skuEl) skuEl.value = "SKU-" + Math.floor(100000 + Math.random() * 900000);
    if (unitEl) unitEl.value = row.unit || "كرتون";
    if (costEl) costEl.value = row.cost ? Number(parseNum(row.cost).toFixed(2)) : 0;
    if (marginEl) marginEl.value = (row.margin !== undefined && row.margin !== null) ? Number(parseNum(row.margin).toFixed(2)) : 10;
    if (priceEl) priceEl.value = row.unitPrice ? Number(parseNum(row.unitPrice).toFixed(2)) : 0;
  } else {
    if (titleEl) titleEl.textContent = "إضافة صنف جديد سريع إلى الكتالوج";
    if (nameEl) nameEl.value = prefillName || "";
    if (skuEl) skuEl.value = "SKU-" + Math.floor(100000 + Math.random() * 900000);
    if (unitEl) unitEl.value = "كرتون";
    if (costEl) costEl.value = "0";
    if (marginEl) marginEl.value = plMargins.retailMargin || 10;
    if (priceEl) priceEl.value = "0";
  }

  calcQuickProductPrice('cost');
  openModal("qt-quick-product-modal");
  setTimeout(() => {
    if (!nameEl.value) nameEl.focus();
    else if (parseFloat(costEl.value) <= 0) costEl.focus();
  }, 150);
};

window.registerAdhocProduct = (rowIndex) => {
  window.openQuickAddProductModal("", rowIndex);
};

window.calcQuickProductPrice = (trigger = 'cost') => {
  const cost = parseNum(document.getElementById("qt-qp-cost")?.value, 0);
  const margin = parseNum(document.getElementById("qt-qp-margin")?.value, 0);
  const priceEl = document.getElementById("qt-qp-price");
  const vatEl = document.getElementById("qt-qp-vat-hint");

  if (trigger === 'price') {
    const price = parseNum(priceEl?.value, 0);
    if (cost > 0 && priceEl) {
      const calculatedMargin = Math.round(((price / cost) - 1) * 100 * 100) / 100;
      const marginInput = document.getElementById("qt-qp-margin");
      if (marginInput) marginInput.value = Number(calculatedMargin.toFixed(2));
    }
  } else {
    if (priceEl) {
      const calculatedPrice = cost > 0 ? Math.round(cost * (1 + margin / 100) * 100) / 100 : parseNum(priceEl.value, 0);
      priceEl.value = Number(calculatedPrice.toFixed(2));
    }
  }

  const currentPrice = parseNum(priceEl?.value, 0);
  if (vatEl) {
    const withVat = Math.round(currentPrice * 1.15 * 100) / 100;
    vatEl.textContent = `السعر شامل الضريبة (15%): ${formatCurrency(withVat)}`;
  }
};

window.saveQuickProduct = async () => {
  const name = document.getElementById("qt-qp-name")?.value.trim();
  const errEl = document.getElementById("qt-qp-error");
  if (!name) {
    if (errEl) { errEl.textContent = "يرجى كتابة اسم الصنف."; errEl.classList.remove("hidden"); }
    return;
  }

  const sku = document.getElementById("qt-qp-sku")?.value.trim() || ("SKU-" + Date.now().toString().slice(-6));
  const unit = document.getElementById("qt-qp-unit")?.value.trim() || "كرتون";
  const costPrice = Math.round(parseNum(document.getElementById("qt-qp-cost")?.value, 0) * 100) / 100;
  const salePrice = Math.round(parseNum(document.getElementById("qt-qp-price")?.value, 0) * 100) / 100;
  let margin = parseNum(document.getElementById("qt-qp-margin")?.value, null);
  if (margin === null && costPrice > 0 && salePrice > 0) {
    margin = Math.round(((salePrice / costPrice) - 1) * 100 * 100) / 100;
  } else if (margin !== null) {
    margin = Math.round(margin * 100) / 100;
  } else {
    margin = 0;
  }
  const btn = document.getElementById("qt-qp-save-btn");
  if (btn) btn.disabled = true;

  try {
    const newProdData = {
      name,
      nameAr: name,
      sku,
      unit,
      category,
      costPrice,
      purchasePrice: costPrice,
      lastPurchasePrice: costPrice,
      avgCostPrice: costPrice,
      salePrice,
      priceRetail: salePrice,
      priceWholesale: salePrice,
      priceDistributor: salePrice,
      taxCategory: "S",
      createdAt: new Date().toISOString()
    };

    const res = await create(COLS.products(), newProdData);
    const prodId = typeof res === "string" ? res : (res?.id || "p_" + Date.now());
    newProdData.id = prodId;
    products.push(newProdData);

    if (window._adhocRowToReplaceIndex !== null && window._adhocRowToReplaceIndex !== undefined && quoteItems[window._adhocRowToReplaceIndex]) {
      const idx = window._adhocRowToReplaceIndex;
      quoteItems[idx].productId = prodId;
      quoteItems[idx].productName = name;
      quoteItems[idx].sku = sku;
      quoteItems[idx].unit = unit;
      quoteItems[idx].cost = costPrice;
      quoteItems[idx].lastPurchasePrice = costPrice;
      quoteItems[idx].unitPrice = salePrice;
      quoteItems[idx].margin = margin;
      quoteItems[idx].isCustom = false;
      window._adhocRowToReplaceIndex = null;
    } else {
      window.addQtProduct(prodId, name, salePrice, unit, sku, costPrice);
    }

    renderQuoteLines();
    closeModal("qt-quick-product-modal");
    showToast(`تم تسجيل الصنف "${name}" بالكتالوج وإدراجه بنجاح ✨`, "success");

    const searchInput = document.getElementById("qt-product-search");
    if (searchInput) searchInput.value = "";
    const results = document.getElementById("qt-product-results");
    if (results) results.classList.add("hidden");
  } catch (err) {
    if (errEl) { errEl.textContent = "حدث خطأ: " + err.message; errEl.classList.remove("hidden"); }
  } finally {
    if (btn) btn.disabled = false;
  }
};

// ============================================================
// QUOTATION PRICE HISTORY & AD-HOC ITEM MEMORY (سجل أسعار البنود)
// ============================================================
function getQuotationPriceHistory(itemName) {
  if (!itemName || typeof itemName !== "string") return [];
  const normTarget = normalizeArabicText(itemName);
  if (!normTarget || normTarget.length < 2) return [];

  const history = [];
  const allQuotes = Array.isArray(quotations) ? quotations : [];

  for (const q of allQuotes) {
    if (!q || !Array.isArray(q.items)) continue;
    for (const it of q.items) {
      if (!it || !it.productName) continue;
      const normIt = normalizeArabicText(it.productName);
      if (!normIt) continue;

      const isMatch = normIt === normTarget || normIt.includes(normTarget) || normTarget.includes(normIt);
      if (isMatch) {
        history.push({
          quoteId: q.id,
          quoteNumber: q.quoteNumber || "—",
          date: q.date || q.createdAt || "",
          customerId: q.customerId || "",
          customerName: q.customerName || "عميل عام",
          repName: q.repName || "",
          status: q.status || "draft",
          productName: it.productName,
          sku: it.sku || "",
          unit: it.unit || "كرتون",
          qty: it.qty || 1,
          cost: parseFloat(it.cost) || 0,
          margin: parseFloat(it.margin) || 0,
          unitPrice: parseFloat(it.unitPrice) || 0,
          discount: parseFloat(it.discount) || 0,
          isCustom: !!it.isCustom || String(it.productId || "").startsWith("adhoc_")
        });
      }
    }
  }

  history.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return history;
}

function getUniqueAdhocItemsFromQuotes(term) {
  const normTerm = normalizeArabicText(term);
  const allQuotes = Array.isArray(quotations) ? quotations : [];
  const adhocMap = new Map();

  for (const q of allQuotes) {
    if (!q || !Array.isArray(q.items)) continue;
    for (const it of q.items) {
      if (!it || !it.productName) continue;
      const isAdhoc = it.isCustom || String(it.productId || "").startsWith("adhoc_") ||
        !products.some(p => p.id === it.productId || normalizeArabicText(p.name) === normalizeArabicText(it.productName));
      
      if (!isAdhoc) continue;

      const normName = normalizeArabicText(it.productName);
      if (normTerm && !normName.includes(normTerm)) continue;

      if (!adhocMap.has(normName)) {
        adhocMap.set(normName, {
          productName: it.productName,
          unit: it.unit || "كرتون",
          unitPrice: parseFloat(it.unitPrice) || 0,
          cost: parseFloat(it.cost) || 0,
          margin: parseFloat(it.margin) || 0,
          sku: it.sku || "",
          lastQuotedDate: q.date || "",
          lastCustomerName: q.customerName || "عميل عام",
          quoteNumber: q.quoteNumber || "—",
          count: 1
        });
      } else {
        const existing = adhocMap.get(normName);
        existing.count += 1;
        if ((q.date || "") > (existing.lastQuotedDate || "")) {
          existing.unitPrice = parseFloat(it.unitPrice) || existing.unitPrice;
          existing.cost = parseFloat(it.cost) || existing.cost;
          existing.margin = parseFloat(it.margin) || existing.margin;
          existing.unit = it.unit || existing.unit;
          existing.lastQuotedDate = q.date;
          existing.lastCustomerName = q.customerName || existing.lastCustomerName;
          existing.quoteNumber = q.quoteNumber || existing.quoteNumber;
        }
      }
    }
  }

  return Array.from(adhocMap.values()).slice(0, 10);
}

window._activeHistoryRowIndex = null;
window._activeHistoryItemName = "";
window._currentPriceHistoryTab = "all";

window.openPriceHistoryModal = (rowIndex, initialName = "") => {
  window._activeHistoryRowIndex = (rowIndex !== null && rowIndex !== undefined) ? rowIndex : null;
  let itemName = initialName;
  if (rowIndex !== null && rowIndex !== undefined && quoteItems[rowIndex]) {
    itemName = quoteItems[rowIndex].productName || "";
  }
  itemName = (itemName || "").trim();
  if (!itemName) {
    showToast("يرجى كتابة اسم الصنف أولاً للبحث في سجل الأسعار", "warn");
    return;
  }
  window._activeHistoryItemName = itemName;
  window._currentPriceHistoryTab = "all";

  const titleEl = document.getElementById("qt-ph-title");
  const subEl = document.getElementById("qt-ph-subtitle");
  if (titleEl) titleEl.textContent = `سجل أسعار: "${itemName}" في عروض الأسعار`;
  if (subEl) subEl.textContent = `مقارنة الأسعار السابقة وهوامش الربح والتواريخ لكافة العملاء`;

  renderPriceHistoryContent();
  openModal("qt-price-history-modal");
};

function renderPriceHistoryContent() {
  const itemName = window._activeHistoryItemName;
  const history = getQuotationPriceHistory(itemName);
  const curCustId = document.getElementById("qt-customer-id")?.value;
  const curCustName = document.getElementById("qt-customer-search")?.value || "";

  // Tab filter
  const isCustTab = window._currentPriceHistoryTab === "cust";
  const filtered = isCustTab
    ? history.filter(h => (curCustId && h.customerId === curCustId) || (curCustName && normalizeArabicText(h.customerName) === normalizeArabicText(curCustName)))
    : history;

  // Update tabs styling
  const tabAll = document.getElementById("qt-ph-tab-all");
  const tabCust = document.getElementById("qt-ph-tab-cust");
  if (tabAll) {
    tabAll.className = !isCustTab ? "btn btn-sm btn-primary active" : "btn btn-sm btn-secondary";
  }
  if (tabCust) {
    tabCust.className = isCustTab ? "btn btn-sm btn-primary active" : "btn btn-sm btn-secondary";
    const sameCustCount = history.filter(h => (curCustId && h.customerId === curCustId) || (curCustName && normalizeArabicText(h.customerName) === normalizeArabicText(curCustName))).length;
    tabCust.textContent = `👤 ${curCustName ? curCustName.slice(0, 18) : 'العميل المحدد'} (${sameCustCount})`;
  }

  const countHint = document.getElementById("qt-ph-count-hint");
  if (countHint) {
    countHint.textContent = `عدد عروض الأسعار المسجلة: ${filtered.length} من أصل ${history.length}`;
  }

  // KPIs
  const statsEl = document.getElementById("qt-ph-stats");
  if (statsEl) {
    if (!history.length) {
      statsEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding:12px; background:var(--bg-2); border-radius:8px; text-align:center; color:var(--text-2); font-size:12px;">
          لا يوجد تسعير سابق مسجل لهذا البند حتى الآن.
        </div>
      `;
    } else {
      const prices = history.map(h => h.unitPrice).filter(p => p > 0);
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const latest = history[0];

      statsEl.innerHTML = `
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#1e40af; font-weight:700;">🕒 آخر سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#1e3a8a; margin:2px 0;">${formatCurrency(latest.unitPrice)}</div>
          <div style="font-size:9.5px; color:#60a5fa;">${isoToDisplay(latest.date)}</div>
        </div>
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#166534; font-weight:700;">📈 أعلى سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#15803d; margin:2px 0;">${formatCurrency(maxPrice)}</div>
          <div style="font-size:9.5px; color:#4ade80;">شامل 15%: ${formatCurrency(maxPrice * 1.15)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#991b1b; font-weight:700;">📉 أدنى سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#b91c1c; margin:2px 0;">${formatCurrency(minPrice)}</div>
          <div style="font-size:9.5px; color:#f87171;">شامل 15%: ${formatCurrency(minPrice * 1.15)}</div>
        </div>
        <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#6b21a8; font-weight:700;">⚖️ متوسط الأسعار</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#7e22ce; margin:2px 0;">${formatCurrency(Math.round(avgPrice * 100) / 100)}</div>
          <div style="font-size:9.5px; color:#c084fc;">إجمالي (${prices.length}) عروض</div>
        </div>
      `;
    }
  }

  // Tbody
  const tbody = document.getElementById("qt-ph-tbody");
  if (tbody) {
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-2);">لا توجد نتائج تطابق العرض المحدد</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((h) => {
      const withVat = Math.round(h.unitPrice * 1.15 * 100) / 100;
      const isSameCust = curCustId && h.customerId === curCustId;
      return `
        <tr style="border-bottom:1px solid var(--border-soft); ${isSameCust ? 'background:rgba(16,185,129,0.04);' : ''}">
          <td style="padding:8px 12px; font-weight:700; color:var(--brand);" class="mono">${h.quoteNumber}</td>
          <td style="padding:8px 12px; font-size:11.5px; color:var(--text-2);">${isoToDisplay(h.date)}</td>
          <td style="padding:8px 12px;">
            <div style="font-weight:700; font-size:12px;">${h.customerName}</div>
            ${isSameCust ? '<span class="badge" style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:1px 5px;">العميل الحالي</span>' : ''}
          </td>
          <td style="padding:8px 12px; text-align:center;">
            <span class="badge" style="font-size:10px; background:var(--bg-2); color:var(--text-2);">${h.qty} ${h.unit}</span>
          </td>
          <td style="padding:8px 12px; text-align:center; font-size:11px;">
            ${h.cost > 0 ? `<div class="mono" style="color:#059669; font-weight:700;">ت: ${formatCurrency(h.cost)}</div>` : '<span style="color:var(--text-2);">—</span>'}
            ${h.margin ? `<div style="font-size:10px; color:#4338ca; font-weight:600;">+${h.margin}%</div>` : ''}
          </td>
          <td style="padding:8px 12px; text-align:right; font-weight:800; font-size:12.5px;" class="mono text-indigo">${formatCurrency(h.unitPrice)}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700; font-size:12px; color:#0284c7;" class="mono">${formatCurrency(withVat)}</td>
          <td style="padding:8px 12px; text-align:center;">
            <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:3px 10px; font-weight:700; background:#059669; border-color:#059669; border-radius:5px;"
              onclick="applyHistoryPriceToRow(${h.unitPrice}, ${h.cost || 0}, ${h.margin || 0}, '${(h.unit || 'كرتون').replace(/'/g, "\\'")}')">
              استخدام هذا السعر 🎯
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }
}

window.switchPriceHistoryTab = (tab) => {
  window._currentPriceHistoryTab = tab;
  renderPriceHistoryContent();
};

window.applyHistoryPriceToRow = (unitPrice, cost, margin, unit) => {
  const rowIndex = window._activeHistoryRowIndex;
  const numPrice = parseNum(unitPrice, 0);
  const numCost = parseNum(cost, 0);
  let numMargin = parseNum(margin, null);
  if (numMargin === null && numCost > 0 && numPrice > 0) {
    numMargin = Math.round(((numPrice / numCost) - 1) * 100 * 100) / 100;
  }

  if (rowIndex !== null && rowIndex !== undefined && quoteItems[rowIndex]) {
    quoteItems[rowIndex].unitPrice = Math.round(numPrice * 100) / 100;
    if (numCost > 0) quoteItems[rowIndex].cost = Math.round(numCost * 100) / 100;
    if (numMargin !== null) quoteItems[rowIndex].margin = Math.round(numMargin * 100) / 100;
    if (unit) quoteItems[rowIndex].unit = unit;
    renderQuoteLines();
    closeModal("qt-price-history-modal");
    showToast(`تم تطبيق السعر (${formatCurrency(numPrice)}) بنجاح 🎯`, "success");
  } else {
    window.addCustomQuoteLineWithData(window._activeHistoryItemName, unit, numCost, numMargin || 0, numPrice, "");
    closeModal("qt-price-history-modal");
  }
};

window.applyInlineHistoryPrice = (rowIndex) => {
  if (!quoteItems[rowIndex]) return;
  const history = getQuotationPriceHistory(quoteItems[rowIndex].productName);
  if (!history || !history.length) return;
  const latest = history[0];
  const numPrice = parseNum(latest.unitPrice, 0);
  const numCost = parseNum(latest.cost, 0);
  let numMargin = parseNum(latest.margin, null);
  if (numMargin === null && numCost > 0 && numPrice > 0) {
    numMargin = Math.round(((numPrice / numCost) - 1) * 100 * 100) / 100;
  }

  quoteItems[rowIndex].unitPrice = Math.round(numPrice * 100) / 100;
  if (numCost > 0) quoteItems[rowIndex].cost = Math.round(numCost * 100) / 100;
  if (numMargin !== null) quoteItems[rowIndex].margin = Math.round(numMargin * 100) / 100;
  if (latest.unit) quoteItems[rowIndex].unit = latest.unit;
  renderQuoteLines();
  showToast(`تم تطبيق آخر تسعير سابق (${formatCurrency(numPrice)}) بنجاح ⚡`, "success");
};

window.addCustomQuoteLineWithData = (name, unit, cost, margin, unitPrice, sku = "") => {
  const input = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  if (input) input.value = "";
  if (results) results.classList.add("hidden");

  const adhocId = "adhoc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const numCost = parseNum(cost, 0);
  const numPrice = parseNum(unitPrice, 0);
  let numMargin = parseNum(margin, null);
  if (numMargin === null && numCost > 0 && numPrice > 0) {
    numMargin = Math.round(((numPrice / numCost) - 1) * 100 * 100) / 100;
  } else if (numMargin !== null) {
    numMargin = Math.round(numMargin * 100) / 100;
  }

  quoteItems.unshift({
    productId: adhocId,
    productName: name || "بند حر مسعر",
    sku: sku || "",
    unit: unit || "كرتون",
    qty: 1,
    cost: Math.round(numCost * 100) / 100,
    lastPurchasePrice: Math.round(numCost * 100) / 100,
    margin: numMargin || 0,
    unitPrice: Math.round(numPrice * 100) / 100,
    discount: 0,
    isCustom: true
  });

  renderQuoteLines();
  showToast(`تم إدراج البند المسعر سابقاً "${name}" بسعر ${formatCurrency(numPrice)} 🎯`, "success");

  setTimeout(() => {
    const firstRow = document.querySelector("#qt-lines-tbody tr:first-child");
    if (firstRow) {
      const qtyInput = firstRow.querySelector(".qt-line-qty");
      if (qtyInput) { qtyInput.focus(); qtyInput.select(); }
    }
  }, 50);
};

// ============================================================
// SUPPLIER PRICE BANK & COST INTELLIGENCE (بنك وقوائم أسعار الموردين)
// ============================================================
let extractedSupplierItems = [];
let _activeSupplierBankTab = "import";
let _activeSupplierSubTab = "file";
let _supplierCompareTargetRowIndex = null;
let _supplierCompareTargetItemName = "";

function populateSupplierBankDropdowns() {
  const datalist = document.getElementById("qt-sup-import-datalist");
  const filterSel = document.getElementById("qt-sup-filter-supplier");
  const listsCountEl = document.getElementById("qt-sup-lists-count");
  const totalItemsBadge = document.getElementById("qt-sup-total-items-badge");

  const allSupNames = new Set();
  (suppliers || []).forEach(s => { if (s.name) allSupNames.add(s.name.trim()); });
  (supplierPriceLists || []).forEach(l => { if (l.supplierName) allSupNames.add(l.supplierName.trim()); });

  const sortedNames = Array.from(allSupNames).sort((a, b) => a.localeCompare(b, "ar"));

  if (datalist) {
    datalist.innerHTML = sortedNames.map(name => `<option value="${name}"></option>`).join("");
  }
  if (filterSel) {
    filterSel.innerHTML = '<option value="">جميع الموردين</option>' +
      sortedNames.map(name => `<option value="${name}">${name}</option>`).join("");
  }

  const totalLists = (supplierPriceLists || []).length;
  let totalItemsCount = 0;
  (supplierPriceLists || []).forEach(l => { totalItemsCount += (l.items || []).length; });

  if (listsCountEl) listsCountEl.textContent = totalLists;
  if (totalItemsBadge) totalItemsBadge.textContent = totalItemsCount;
}

function getSupplierPricesForProduct(productName) {
  if (!productName || typeof productName !== "string") return [];
  const normTarget = normalizeArabicText(productName);
  if (!normTarget || normTarget.length < 2) return [];

  const matches = [];
  const allLists = Array.isArray(supplierPriceLists) ? supplierPriceLists : [];

  for (const list of allLists) {
    if (!list || !Array.isArray(list.items)) continue;
    for (const it of list.items) {
      if (!it || !it.productName) continue;
      const normIt = normalizeArabicText(it.productName);
      if (!normIt) continue;

      const isMatch = normIt === normTarget || normIt.includes(normTarget) || normTarget.includes(normIt);
      if (isMatch) {
        const costPrice = parseFloat(it.costPrice) || 0;
        const costPriceWithVat = parseFloat(it.costPriceWithVat) || Math.round(costPrice * 1.15 * 100) / 100;
        matches.push({
          supplierId: list.supplierId || "",
          supplierName: list.supplierName || "مورد عام",
          supplierPhone: list.supplierPhone || "",
          quoteDate: list.quoteDate || list.createdAt || "",
          fileName: list.fileName || "",
          productName: it.productName,
          sku: it.sku || "",
          unit: it.unit || "كرتون",
          costPrice,
          costPriceWithVat,
          notes: it.notes || ""
        });
      }
    }
  }

  // Sort lowest price first (أفضل وأرخص سعر مورد)
  matches.sort((a, b) => a.costPrice - b.costPrice);
  return matches;
}

function getUniqueSupplierItems(term) {
  const normTerm = normalizeArabicText(term);
  const allLists = Array.isArray(supplierPriceLists) ? supplierPriceLists : [];
  const itemMap = new Map();

  for (const list of allLists) {
    if (!list || !Array.isArray(list.items)) continue;
    for (const it of list.items) {
      if (!it || !it.productName) continue;
      const normName = normalizeArabicText(it.productName);
      if (normTerm && !normName.includes(normTerm)) continue;

      const key = normName + "_" + (list.supplierName || "");
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          productName: it.productName,
          supplierName: list.supplierName || "مورد عام",
          supplierId: list.supplierId || "",
          quoteDate: list.quoteDate || "",
          unit: it.unit || "كرتون",
          costPrice: parseFloat(it.costPrice) || 0,
          costPriceWithVat: parseFloat(it.costPriceWithVat) || (parseFloat(it.costPrice) || 0) * 1.15,
          sku: it.sku || ""
        });
      }
    }
  }

  return Array.from(itemMap.values()).slice(0, 10);
}

// ── Modals & Navigation ──────────────────────────────────────
window.openSupplierPriceBankModal = (initialTab = "import") => {
  const dateInput = document.getElementById("qt-sup-import-date");
  if (dateInput && !dateInput.value) dateInput.value = todayString();

  populateSupplierBankDropdowns();
  switchSupplierBankTab(initialTab);
  openModal("qt-supplier-price-bank-modal");
};

window.switchSupplierBankTab = (tab) => {
  _activeSupplierBankTab = tab;
  const paneImport = document.getElementById("sup-bank-pane-import");
  const paneSearch = document.getElementById("sup-bank-pane-search");
  const paneLists  = document.getElementById("sup-bank-pane-lists");

  const btnImport = document.getElementById("tab-btn-sup-import");
  const btnSearch = document.getElementById("tab-btn-sup-search");
  const btnLists  = document.getElementById("tab-btn-sup-lists");

  if (paneImport) paneImport.classList.toggle("hidden", tab !== "import");
  if (paneSearch) paneSearch.classList.toggle("hidden", tab !== "search");
  if (paneLists)  paneLists.classList.toggle("hidden",  tab !== "lists");

  if (btnImport) btnImport.className = tab === "import" ? "btn btn-sm btn-primary active" : "btn btn-sm btn-secondary";
  if (btnSearch) btnSearch.className = tab === "search" ? "btn btn-sm btn-primary active" : "btn btn-sm btn-secondary";
  if (btnLists)  btnLists.className  = tab === "lists"  ? "btn btn-sm btn-primary active" : "btn btn-sm btn-secondary";

  if (tab === "search") {
    renderSupplierBankSearchTable();
    setTimeout(() => document.getElementById("qt-sup-search-input")?.focus(), 100);
  } else if (tab === "lists") {
    renderSupplierBankListsTable();
  }
};

window.switchSupplierSubTab = (sub) => {
  _activeSupplierSubTab = sub;
  const filePane = document.getElementById("sup-subpane-file");
  const pastePane = document.getElementById("sup-subpane-paste");
  const btnFile = document.getElementById("tab-btn-sup-subfile");
  const btnPaste = document.getElementById("tab-btn-sup-subpaste");

  if (sub === "file") {
    if (filePane) filePane.classList.remove("hidden");
    if (pastePane) pastePane.classList.add("hidden");
    if (btnFile) { btnFile.classList.remove("btn-secondary"); btnFile.classList.add("btn-primary"); }
    if (btnPaste) { btnPaste.classList.remove("btn-primary"); btnPaste.classList.add("btn-secondary"); }
  } else {
    if (filePane) filePane.classList.add("hidden");
    if (pastePane) pastePane.classList.remove("hidden");
    if (btnPaste) { btnPaste.classList.remove("btn-secondary"); btnPaste.classList.add("btn-primary"); }
    if (btnFile) { btnFile.classList.remove("btn-primary"); btnFile.classList.add("btn-secondary"); }
    setTimeout(() => document.getElementById("qt-sup-paste-area")?.focus(), 100);
  }
};

// ── File Handlers for Suppliers ──────────────────────────────
window.handleSupplierFileDrop = (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) processSupplierFile(files[0]);
};

window.handleSupplierFileInput = (e) => {
  const file = e.target.files[0];
  if (file) processSupplierFile(file);
};

async function processSupplierFile(file) {
  const fname = (file.name || "").toLowerCase();
  const isPdf = fname.endsWith(".pdf") || file.type === "application/pdf";
  const isExcel = fname.endsWith(".xlsx") || fname.endsWith(".xls") || fname.endsWith(".csv") ||
    file.type.includes("sheet") || file.type.includes("excel") || file.type.includes("csv");

  window._supplierCurrentFileName = file.name || "ملف_عرض_سعر_مورد";

  if (isPdf) {
    await processSupplierPdfFile(file);
  } else if (isExcel) {
    await processSupplierExcelFile(file);
  } else {
    showSupplierImportError("نوع الملف غير مدعوم. يرجى اختيار ملف Excel (.xlsx / .xls / .csv) أو ملف PDF.");
  }
}

async function processSupplierExcelFile(file) {
  setSupplierImportLoading(true, "جارٍ قراءة وتحليل ملف الإكسيل واستخراج أسعار المورد...");
  try {
    const XLSX = await ensureXlsxLoaded();
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("الملف لا يحتوي على أي صفحات عمل (Sheets).");
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        parseSupplierRawRows(rawRows, file.name);
      } catch (err) {
        showSupplierImportError(err.message || "حدث خطأ أثناء قراءة ملف الإكسيل");
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (err) {
    showSupplierImportError(err.message);
  }
}

async function processSupplierPdfFile(file) {
  setSupplierImportLoading(true, "جارٍ تحليل وقراءة ملف الـ PDF واستخراج قائمة أسعار المورد...");
  try {
    await ensurePdfJsLoaded();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pagesData = [];
    let detectedSupplier = "";
    let detectedDate = "";
    let detectedQuoteNum = "";
    let isDocReversed = false;

    // 1. Extract raw items from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setSupplierImportLoading(true, `جارٍ قراءة صفحة (${pageNum} من ${pdf.numPages}) من عرض السعر...`);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const content = await page.getTextContent();
      const rawItems = (content.items || []).filter(it => it && typeof it.str === "string" && it.str.trim().length > 0);
      
      const pageItems = rawItems.map(it => {
        const x = it.transform[4];
        const y = it.transform[5];
        const top = viewport.height - y;
        return {
          str: cleanArabicPresentationForms(it.str),
          x,
          y,
          top,
          width: it.width,
          height: it.height
        };
      });

      pagesData.push({ pageNum, pageItems, width: viewport.width, height: viewport.height });

      for (const it of pageItems) {
        if (isArabicReversedString(it.str)) {
          isDocReversed = true;
        }
      }
    }

    // 2. Detect header info (Page 1 top section)
    if (pagesData.length > 0) {
      const p1 = pagesData[0];
      const headerItems = p1.pageItems.filter(it => it.top < (p1.height * 0.35));
      headerItems.sort((a, b) => a.top - b.top);

      // Group header lines
      const headerLines = [];
      let curLine = null;
      for (const it of headerItems) {
        if (!curLine || Math.abs(curLine.top - it.top) > 5.5) {
          curLine = { top: it.top, items: [it] };
          headerLines.push(curLine);
        } else {
          curLine.items.push(it);
        }
      }

      for (const line of headerLines) {
        const rtlWs = [...line.items].sort((a, b) => b.x - a.x);
        const rawText = rtlWs.map(it => it.str).join(" ").trim();
        const unrevText = fixReversedArabicLine(rawText);

        // Supplier company name
        if (!detectedSupplier && line.top < 110) {
          if (/Al-Rafada|Al-?Arabia/i.test(rawText) || /الرفادة/i.test(unrevText)) {
            detectedSupplier = "شركة الرفادة العربية التجارية";
          } else if (/شركة|مؤسسة|مصنع|Trading|Company|مجموعة/i.test(unrevText) && !unrevText.includes("Customer") && !unrevText.includes("العميل")) {
            const arMatch = unrevText.match(/((?:شركة|مؤسسة|مصنع|مجموعة)\s+[^\n\r,]+?(?:التجارية|المحدودة|للتجارة|للصناعة|للأغذية|للمواد الغذائية)?)/);
            if (arMatch && arMatch[1].length > 4) {
              detectedSupplier = arMatch[1].trim();
            } else if (unrevText.length > 4) {
              detectedSupplier = unrevText.trim();
            }
          }
        }

        // Date
        if (!detectedDate) {
          const dateMatch = rawText.match(/\b(202\d[-/]\d{1,2}[-/]\d{1,2})\b/);
          if (dateMatch) detectedDate = dateMatch[1].replace(/\//g, '-');
        }

        // Quote Number
        if (!detectedQuoteNum) {
          const numMatch = rawText.match(/(?:الرقم|مـــقرلا|Number|Quote\s*#)\s*[:\-–]?\s*(\d{4,8})/i);
          if (numMatch) detectedQuoteNum = numMatch[1];
        }
      }
    }

    // 3. Extract items across all pages using spatial clustering
    const extracted = [];
    const taxMode = document.getElementById("qt-sup-import-tax-mode")?.value || "exclusive";
    const isInclusive = taxMode === "inclusive";

    for (const page of pagesData) {
      const items = page.pageItems;
      items.sort((a, b) => a.top - b.top);

      const lines = [];
      let curLine = null;
      for (const it of items) {
        if (!curLine || Math.abs(curLine.top - it.top) > 4.5) {
          curLine = { top: it.top, items: [it] };
          lines.push(curLine);
        } else {
          curLine.items.push(it);
        }
      }

      for (const line of lines) {
        const ws = line.items;
        
        // Match table columns by coordinate boundaries
        const rowNumWs = ws.filter(w => w.x >= 550);
        const skuWs    = ws.filter(w => w.x >= 505 && w.x < 550);
        const descWs   = ws.filter(w => w.x >= 358 && w.x < 505);
        const unitWs   = ws.filter(w => w.x >= 315 && w.x < 358);
        const priceWs  = ws.filter(w => w.x >= 195 && w.x < 250);
        const totalWs  = ws.filter(w => w.x >= 15 && w.x < 85);

        if (rowNumWs.length === 0) continue;
        const rowNumStr = rowNumWs.map(w => w.str).join("").trim();
        if (!/^\d{1,4}$/.test(rowNumStr)) continue;

        if (priceWs.length === 0) continue;
        const priceClean = priceWs.map(w => w.str).join("").replace(/,/g, '').trim();
        const rawPriceVal = parseFloat(priceClean);
        if (isNaN(rawPriceVal) || rawPriceVal <= 0) continue;

        const skuStr = skuWs.map(w => w.str).join("").trim();

        // Extract Unit & Unit Cell Overflow
        let unit = "كرتون";
        let overflowDesc = "";
        const rawUnitStr = cleanArabicPresentationForms(unitWs.map(w => w.str).join(" ")).trim();

        if (rawUnitStr) {
          let matched = false;
          for (const [stdUnit, regex] of UNIT_SYNONYMS) {
            if (regex.test(rawUnitStr)) {
              unit = stdUnit;
              matched = true;
              const rest = rawUnitStr.replace(regex, "").trim();
              if (rest) overflowDesc = rest;
              break;
            }
          }
          if (!matched && rawUnitStr.length <= 10) {
            unit = fixReversedArabicLine(rawUnitStr);
          }
        }

        // Sort description RTL (x descending)
        const descSorted = [...descWs].sort((a, b) => b.x - a.x);
        let descTokens = descSorted.map(w => w.str.trim()).filter(Boolean);
        if (overflowDesc) {
          descTokens.push(overflowDesc);
        }

        const rawDescLine = descTokens.join(" ");
        if (!rawDescLine || rawDescLine.length < 2) continue;

        const productName = fixReversedArabicLine(rawDescLine);
        if (!productName || productName.length < 2) continue;

        let costPrice = isInclusive ? Math.round((rawPriceVal / 1.15) * 100) / 100 : rawPriceVal;
        let costPriceWithVat = Math.round(costPrice * 1.15 * 100) / 100;

        if (!isInclusive && totalWs.length > 0) {
          const totalClean = totalWs.map(w => w.str).join("").replace(/,/g, '').trim();
          const totalVal = parseFloat(totalClean);
          if (!isNaN(totalVal) && totalVal > 0) {
            costPriceWithVat = totalVal;
          }
        }

        extracted.push({
          selected: true,
          rowNum: parseInt(rowNumStr, 10),
          productName,
          sku: skuStr,
          unit,
          costPrice,
          costPriceWithVat,
          notes: detectedQuoteNum ? `عرض رقم ${detectedQuoteNum}` : ""
        });
      }
    }

    if (extracted.length === 0) {
      // Fallback: Line-by-line generic table parser
      const genericRows = [];
      for (const page of pagesData) {
        const items = page.pageItems;
        items.sort((a, b) => a.top - b.top);
        const lines = [];
        let curLine = null;
        for (const it of items) {
          if (!curLine || Math.abs(curLine.top - it.top) > 6.0) {
            curLine = { top: it.top, items: [it] };
            lines.push(curLine);
          } else {
            curLine.items.push(it);
          }
        }
        for (const line of lines) {
          const cells = line.items.map(it => isDocReversed ? fixReversedArabicLine(it.str) : it.str.trim()).filter(Boolean);
          if (cells.length >= 2) genericRows.push(cells);
        }
      }
      parseSupplierRawRows(genericRows, file.name);
      return;
    }

    // Auto-fill UI Inputs
    if (detectedSupplier) {
      const nameInput = document.getElementById("qt-sup-import-name");
      if (nameInput) nameInput.value = detectedSupplier;
    }
    if (detectedDate) {
      const dateInput = document.getElementById("qt-sup-import-date");
      if (dateInput) dateInput.value = detectedDate;
    }

    extractedSupplierItems = extracted;
    renderExtractedSupplierItemsTable();
    showToast(`تم استخراج (${extracted.length}) صنف من عرض أسعار المورد "${detectedSupplier || 'المورد'}" بنجاح ✨`, "success");

  } catch (err) {
    showSupplierImportError(err.message || "حدث خطأ أثناء معالجة ملف الـ PDF");
  }
}

window.handlePastedSupplierText = () => {
  const pasteArea = document.getElementById("qt-sup-paste-area");
  const text = (pasteArea?.value || "").trim();
  if (!text) {
    showSupplierImportError("يرجى لصق بيانات الجدول في المربع أولاً.");
    return;
  }
  setSupplierImportLoading(true, "جارٍ تحليل النصوص المنسوخة واستخراج أصناف المورد...");
  try {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rawRows = lines.map(line => line.split("\t").map(c => c.trim()));
    parseSupplierRawRows(rawRows, "بيانات_منسوخة");
  } catch (err) {
    showSupplierImportError(err.message || "حدث خطأ أثناء تحليل البيانات المنسوخة");
  }
};

function parseSupplierRawRows(rawRows, fileName) {
  if (!rawRows || rawRows.length === 0) {
    throw new Error("الملف لا يحتوي على أي صفوف أو بيانات.");
  }

  // 1. Find Header Row
  let headerRowIdx = -1;
  let colMap = { name: -1, unit: -1, price: -1, sku: -1, notes: -1 };

  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r].map(c => String(c || "").trim().toLowerCase());
    let hasName = false, hasPrice = false;

    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (!val) continue;

      if (/اسم\s*(الصنف|المنتج|المادة)|البيان|الوصف|الصنف|المنتج|المادة|description|product|item\s*name/i.test(val)) {
        colMap.name = c;
        hasName = true;
      } else if (/الوحدة|نوع\s*الوحدة|العبوة|unit|uom|pack/i.test(val)) {
        colMap.unit = c;
      } else if (/سعر\s*(التكلفة|الشراء|الوحدة|الصنف|الافرادي)?|السعر|التكلفة|price|cost|rate|unit\s*price/i.test(val) && !/إجمالي|الاجمالي|total/i.test(val)) {
        colMap.price = c;
        hasPrice = true;
      } else if (/الكود|الرمز|الباركود|sku|code|barcode/i.test(val)) {
        colMap.sku = c;
      } else if (/ملاحظات|notes|remarks/i.test(val)) {
        colMap.notes = c;
      }
    }

    if (hasName && hasPrice) {
      headerRowIdx = r;
      break;
    }
  }

  // Fallback if header not explicitly labeled
  if (headerRowIdx === -1 || colMap.name === -1 || colMap.price === -1) {
    let bestScore = -1;
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r];
      let strCols = 0, numCols = 0;
      row.forEach((cell, idx) => {
        const clean = String(cell).replace(/[^\d.]/g, "");
        if (clean && !isNaN(parseFloat(clean))) numCols++;
        else if (String(cell).trim().length > 2) strCols++;
      });
      if (strCols >= 1 && numCols >= 1 && (strCols + numCols) > bestScore) {
        bestScore = strCols + numCols;
        headerRowIdx = r > 0 ? r - 1 : 0;
        // Assign first long text as name, first number as price
        row.forEach((cell, idx) => {
          const clean = String(cell).replace(/[^\d.]/g, "");
          if (clean && !isNaN(parseFloat(clean)) && colMap.price === -1) colMap.price = idx;
          else if (String(cell).trim().length > 2 && colMap.name === -1) colMap.name = idx;
        });
      }
    }
  }

  if (colMap.name === -1) colMap.name = 0;
  if (colMap.price === -1) colMap.price = 1;

  const taxMode = document.getElementById("qt-sup-import-tax-mode")?.value || "exclusive";
  const isInclusive = taxMode === "inclusive";

  const extracted = [];
  const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    let rawName = String(row[colMap.name] || "").trim();
    if (!rawName || rawName.length < 2) continue;
    if (/^(الاجمالي|المجموع|إجمالي|صافي|total|subtotal|grand\s*total|vat|الضريبة)$/i.test(rawName)) continue;

    if (isArabicReversedString(rawName)) {
      rawName = fixReversedArabicLine(rawName);
    }

    const rawPriceStr = String(row[colMap.price] || "").replace(/[^\d.]/g, "");
    let rawPrice = parseFloat(rawPriceStr) || 0;
    if (rawPrice <= 0) continue;

    let costPrice = isInclusive ? Math.round((rawPrice / 1.15) * 100) / 100 : rawPrice;
    let costPriceWithVat = Math.round(costPrice * 1.15 * 100) / 100;

    let rawUnit = (colMap.unit >= 0 && row[colMap.unit]) ? String(row[colMap.unit]).trim() : "كرتون";
    if (SUPPLIER_UNIT_MAP[rawUnit]) rawUnit = SUPPLIER_UNIT_MAP[rawUnit];
    if (!rawUnit || rawUnit.length > 20) rawUnit = "كرتون";

    const rawSku = (colMap.sku >= 0 && row[colMap.sku]) ? String(row[colMap.sku]).trim() : "";
    const rawNotes = (colMap.notes >= 0 && row[colMap.notes]) ? String(row[colMap.notes]).trim() : "";

    extracted.push({
      selected: true,
      productName: rawName,
      sku: rawSku,
      unit: rawUnit,
      costPrice,
      costPriceWithVat,
      notes: rawNotes
    });
  }

  if (extracted.length === 0) {
    throw new Error("لم نتمكن من استخراج أصناف وأسعار صالحة من الملف. يرجى التأكد من احتواء الملف على أعمدة (اسم الصنف والسعر).");
  }

  extractedSupplierItems = extracted;
  renderExtractedSupplierItemsTable();
}

function renderExtractedSupplierItemsTable() {
  const tbody = document.getElementById("qt-sup-parsed-tbody");
  const countEl = document.getElementById("qt-sup-stat-count");
  const prevArea = document.getElementById("qt-sup-preview-area");
  const dropPane = document.getElementById("sup-subpane-file");
  const pastePane = document.getElementById("sup-subpane-paste");
  const loadEl = document.getElementById("qt-sup-import-loading");
  const errEl = document.getElementById("qt-sup-import-error");

  if (loadEl) loadEl.classList.add("hidden");
  if (errEl) errEl.classList.add("hidden");
  if (prevArea) prevArea.classList.remove("hidden");
  if (countEl) countEl.textContent = `${extractedSupplierItems.length} صنف مستخرج`;

  if (!tbody) return;

  tbody.innerHTML = extractedSupplierItems.map((it, idx) => `
    <tr style="border-bottom:1px solid var(--border-soft); ${!it.selected ? 'opacity:0.4; background:var(--bg-2);' : ''}">
      <td style="text-align:center; padding:6px;">
        <input type="checkbox" ${it.selected ? 'checked' : ''} onchange="toggleSupplierImportRow(${idx}, this.checked)" />
      </td>
      <td style="text-align:center; font-size:11px; color:var(--text-2); padding:6px;">${idx + 1}</td>
      <td style="padding:6px;">
        <input type="text" class="input font-bold" style="font-size:12px; height:30px; width:100%; border-color:#cbd5e1;"
          value="${(it.productName || '').replace(/"/g, '&quot;')}"
          onchange="updateSupplierImportItem(${idx}, 'productName', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="text" class="input mono" style="font-size:11px; height:30px; width:100%; text-align:center;"
          value="${(it.sku || '').replace(/"/g, '&quot;')}" placeholder="—"
          onchange="updateSupplierImportItem(${idx}, 'sku', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="text" class="input" style="font-size:11.5px; height:30px; width:100%; text-align:center;"
          value="${(it.unit || 'كرتون').replace(/"/g, '&quot;')}"
          onchange="updateSupplierImportItem(${idx}, 'unit', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="number" class="input mono font-bold" style="font-size:12.5px; height:30px; width:100%; color:#166534; background:#f0fdf4; border-color:#86efac;"
          value="${it.costPrice}" min="0" step="0.01"
          onchange="updateSupplierImportItem(${idx}, 'costPrice', this.value)" />
      </td>
      <td style="padding:6px; font-weight:700; color:#0284c7; font-size:12px;" class="mono">
        ${formatCurrency(it.costPriceWithVat)}
      </td>
      <td style="padding:6px;">
        <input type="text" class="input" style="font-size:11px; height:30px; width:100%;"
          value="${(it.notes || '').replace(/"/g, '&quot;')}" placeholder="اختياري"
          onchange="updateSupplierImportItem(${idx}, 'notes', this.value)" />
      </td>
      <td style="padding:6px; text-align:center;">
        <button type="button" class="btn btn-icon sm btn-ghost text-bad" onclick="removeSupplierImportRow(${idx})">✕</button>
      </td>
    </tr>
  `).join("");
}

window.toggleAllSupplierImportItems = (checked) => {
  extractedSupplierItems.forEach(it => it.selected = checked);
  renderExtractedSupplierItemsTable();
};

window.toggleSupplierImportRow = (idx, checked) => {
  if (extractedSupplierItems[idx]) {
    extractedSupplierItems[idx].selected = checked;
    renderExtractedSupplierItemsTable();
  }
};

window.updateSupplierImportItem = (idx, field, val) => {
  if (!extractedSupplierItems[idx]) return;
  if (field === "costPrice") {
    const num = parseFloat(val) || 0;
    extractedSupplierItems[idx].costPrice = num;
    extractedSupplierItems[idx].costPriceWithVat = Math.round(num * 1.15 * 100) / 100;
  } else {
    extractedSupplierItems[idx][field] = val;
  }
  renderExtractedSupplierItemsTable();
};

window.removeSupplierImportRow = (idx) => {
  extractedSupplierItems.splice(idx, 1);
  renderExtractedSupplierItemsTable();
};

window.clearExtractedSupplierItems = () => {
  if (!extractedSupplierItems.length) return;
  if (confirm("هل تريد تفريغ كافة الأصناف المستخرجة؟")) {
    extractedSupplierItems = [];
    renderExtractedSupplierItemsTable();
  }
};

window.addManualSupplierItemRow = () => {
  extractedSupplierItems.unshift({
    selected: true,
    productName: "صنف جديد لدى المورد",
    sku: "",
    unit: "كرتون",
    costPrice: 0,
    costPriceWithVat: 0,
    notes: ""
  });
  renderExtractedSupplierItemsTable();
};

window.reapplySupplierTaxMode = () => {
  const taxMode = document.getElementById("qt-sup-import-tax-mode")?.value || "exclusive";
  const isInclusive = taxMode === "inclusive";
  extractedSupplierItems.forEach(it => {
    if (isInclusive) {
      it.costPrice = Math.round((it.costPrice / 1.15) * 100) / 100;
    }
    it.costPriceWithVat = Math.round(it.costPrice * 1.15 * 100) / 100;
  });
  renderExtractedSupplierItemsTable();
};

window.resetSupplierImport = () => {
  extractedSupplierItems = [];
  const prevArea = document.getElementById("qt-sup-preview-area");
  const fileInput = document.getElementById("qt-sup-file-input");
  const pasteArea = document.getElementById("qt-sup-paste-area");
  const errEl = document.getElementById("qt-sup-import-error");

  if (prevArea) prevArea.classList.add("hidden");
  if (fileInput) fileInput.value = "";
  if (pasteArea) pasteArea.value = "";
  if (errEl) errEl.classList.add("hidden");
};

function showSupplierImportError(msg) {
  const errEl = document.getElementById("qt-sup-import-error");
  const loadEl = document.getElementById("qt-sup-import-loading");
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  }
  if (loadEl) loadEl.classList.add("hidden");
}

function setSupplierImportLoading(isLoading, text = "") {
  const loadEl = document.getElementById("qt-sup-import-loading");
  const textEl = document.getElementById("qt-sup-import-loading-text");
  const errEl = document.getElementById("qt-sup-import-error");
  if (errEl) errEl.classList.add("hidden");

  if (loadEl) {
    if (isLoading) loadEl.classList.remove("hidden");
    else loadEl.classList.add("hidden");
  }
  if (textEl && text) textEl.textContent = text;
}

// ── Save Supplier Price List to Bank ─────────────────────────
window.saveExtractedSupplierPricesToBank = async () => {
  const supplierNameInput = document.getElementById("qt-sup-import-name");
  const supplierName = supplierNameInput?.value.trim();
  const quoteDate = document.getElementById("qt-sup-import-date")?.value || todayString();
  const saveBtn = document.getElementById("qt-sup-save-bank-btn");

  if (!supplierName) {
    showSupplierImportError("يرجى كتابة أو اختيار اسم المورد صاحب العرض أولاً.");
    if (supplierNameInput) supplierNameInput.focus();
    return;
  }

  const selectedItems = extractedSupplierItems.filter(it => it.selected && it.productName && it.costPrice > 0);
  if (!selectedItems.length) {
    showSupplierImportError("يرجى تحديد صنف واحد على الأقل يحتوي على اسم وسعر تكلفة أكبر من الصفر.");
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>⏳</span> جارٍ الحفظ في بنك الموردين…`;
  }

  try {
    // Find or assign supplierId
    let supplierId = "sup_" + Date.now();
    const matchedSup = (suppliers || []).find(s => normalizeArabicText(s.name) === normalizeArabicText(supplierName));
    if (matchedSup) {
      supplierId = matchedSup.id;
    } else {
      // Create supplier in suppliers collection
      try {
        const newSupDoc = await create(COLS.suppliers(), {
          name: supplierName,
          nameAr: supplierName,
          createdAt: new Date().toISOString()
        });
        if (newSupDoc && newSupDoc.id) supplierId = newSupDoc.id;
        suppliers.push({ id: supplierId, name: supplierName });
      } catch (e) {
        console.warn("Auto-create supplier note:", e);
      }
    }

    const priceListData = {
      supplierId,
      supplierName,
      quoteDate,
      fileName: window._supplierCurrentFileName || "قائمة_أسعار_مورد",
      totalItems: selectedItems.length,
      items: selectedItems.map(it => ({
        productName: it.productName.trim(),
        sku: it.sku || "",
        unit: it.unit || "كرتون",
        costPrice: parseFloat(it.costPrice) || 0,
        costPriceWithVat: parseFloat(it.costPriceWithVat) || Math.round((parseFloat(it.costPrice) || 0) * 1.15 * 100) / 100,
        notes: it.notes || ""
      })),
      createdAt: new Date().toISOString()
    };

    const docRef = await create(COLS.supplierPriceLists(), priceListData);
    priceListData.id = typeof docRef === "string" ? docRef : (docRef?.id || "spl_" + Date.now());
    supplierPriceLists.unshift(priceListData);

    showToast(`تم حفظ وتثبيت (${selectedItems.length}) صنف من أسعار المورد "${supplierName}" بنجاح ✨`, "success");

    // Reset and switch to search/lists
    resetSupplierImport();
    populateSupplierBankDropdowns();
    renderQuoteLines(); // Refresh main table hints immediately!
    switchSupplierBankTab("search");

  } catch (err) {
    showSupplierImportError("حدث خطأ أثناء الحفظ: " + err.message);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `✨ حفظ وتثبيت أسعار هذا المورد في قاعدة البيانات`;
    }
  }
};

window.deleteSupplierPriceListFromBank = async (listId) => {
  if (!listId) return;
  const target = (supplierPriceLists || []).find(l => l.id === listId);
  const name = target ? `${target.supplierName} (${target.quoteDate})` : "هذه القائمة";

  if (!confirm(`هل أنت متأكد من حذف قائمة أسعار المورد "${name}" من قاعدة البيانات؟`)) return;

  try {
    await remove(COLS.supplierPriceLists(), listId);
    supplierPriceLists = (supplierPriceLists || []).filter(l => l.id !== listId);
    populateSupplierBankDropdowns();
    renderSupplierBankListsTable();
    renderSupplierBankSearchTable();
    renderQuoteLines();
    showToast(`تم حذف قائمة أسعار المورد بنجاح 🗑️`, "info");
  } catch (err) {
    showToast("فشل الحذف: " + err.message, "error");
  }
};

// ── Search & Browse View ─────────────────────────────────────
function renderSupplierBankSearchTable() {
  const tbody = document.getElementById("qt-sup-search-tbody");
  if (!tbody) return;

  const rawTerm = (document.getElementById("qt-sup-search-input")?.value || "").trim();
  const normTerm = normalizeArabicText(rawTerm);
  const supFilter = document.getElementById("qt-sup-filter-supplier")?.value || "";

  const allItems = [];
  (supplierPriceLists || []).forEach(list => {
    if (supFilter && list.supplierName !== supFilter) return;
    (list.items || []).forEach(it => {
      if (normTerm && !normalizeArabicText(it.productName).includes(normTerm)) return;
      allItems.push({
        listId: list.id,
        supplierName: list.supplierName,
        quoteDate: list.quoteDate,
        productName: it.productName,
        unit: it.unit || "كرتون",
        costPrice: it.costPrice || 0,
        costPriceWithVat: it.costPriceWithVat || (it.costPrice * 1.15)
      });
    });
  });

  if (!allItems.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:28px; color:var(--text-2);">لا توجد أصناف تطابق معايير البحث</td></tr>`;
    return;
  }

  tbody.innerHTML = allItems.slice(0, 50).map(it => {
    const safeName = (it.productName || "").replace(/'/g, "\\'");
    const safeUnit = (it.unit || "كرتون").replace(/'/g, "\\'");
    const safeSup  = (it.supplierName || "").replace(/'/g, "\\'");
    const defaultMargin = plMargins.retailMargin || 10;
    const calcPrice = Math.round(it.costPrice * (1 + defaultMargin / 100) * 100) / 100;

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px 12px; font-weight:700; font-size:12.5px;">${it.productName}</td>
        <td style="padding:8px 12px;">
          <span class="badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:11px; font-weight:700;">🏢 ${it.supplierName}</span>
        </td>
        <td style="padding:8px 12px; text-align:center; font-size:11.5px; color:var(--text-2);">${isoToDisplay(it.quoteDate)}</td>
        <td style="padding:8px 12px; text-align:center;">
          <span class="badge" style="background:var(--bg-2); font-size:10.5px;">${it.unit}</span>
        </td>
        <td style="padding:8px 12px; text-align:left; font-weight:800; font-size:12.5px; color:#166534;" class="mono">${formatCurrency(it.costPrice)}</td>
        <td style="padding:8px 12px; text-align:left; font-weight:700; font-size:11.5px; color:#0284c7;" class="mono">${formatCurrency(it.costPriceWithVat)}</td>
        <td style="padding:8px 12px; text-align:center;">
          <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:3px 10px; font-weight:700; background:#059669; border-color:#059669;"
            onclick="addCustomQuoteLineWithData('${safeName}', '${safeUnit}', ${it.costPrice}, ${defaultMargin}, ${calcPrice}, ''); closeModal('qt-supplier-price-bank-modal');">
            ⚡ إدراج في العرض 🎯
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderSupplierBankListsTable() {
  const tbody = document.getElementById("qt-sup-lists-tbody");
  if (!tbody) return;

  if (!supplierPriceLists || !supplierPriceLists.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد قوائم أسعار موردين محفوظة حتى الآن</td></tr>`;
    return;
  }

  tbody.innerHTML = supplierPriceLists.map((l, idx) => `
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="text-align:center; font-size:11px; color:var(--text-2); padding:10px;">${idx + 1}</td>
      <td style="padding:10px; font-weight:800; font-size:13px; color:#1e293b;">🏢 ${l.supplierName}</td>
      <td style="padding:10px; font-size:11.5px; color:var(--text-2);"><span class="mono">${l.fileName || '—'}</span></td>
      <td style="padding:10px; text-align:center; font-size:12px; font-weight:700;">${isoToDisplay(l.quoteDate)}</td>
      <td style="padding:10px; text-align:center;">
        <span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-weight:800; font-size:11.5px;">📦 ${(l.items || []).length} صنف</span>
      </td>
      <td style="padding:10px; text-align:center; font-size:11px; color:var(--text-2);">${isoToDisplay(l.createdAt)}</td>
      <td style="padding:10px; text-align:center;">
        <div style="display:flex; gap:6px; justify-content:center;">
          <button type="button" class="btn btn-sm btn-ghost" style="font-size:11px; font-weight:700; color:#2563eb;"
            onclick="document.getElementById('qt-sup-filter-supplier').value='${(l.supplierName || '').replace(/'/g, "\\'")}'; switchSupplierBankTab('search');">
            🔍 عرض الأصناف
          </button>
          <button type="button" class="btn btn-sm btn-ghost text-bad" style="font-size:11px; font-weight:700;"
            onclick="deleteSupplierPriceListFromBank('${l.id}')">
            🗑️ حذف
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ── Supplier Compare Modal ───────────────────────────────────
window.openSupplierCompareModal = (rowIndex, initialName = "") => {
  window._supplierCompareTargetRowIndex = (rowIndex !== null && rowIndex !== undefined) ? rowIndex : null;
  let itemName = initialName;
  if (rowIndex !== null && rowIndex !== undefined && quoteItems[rowIndex]) {
    itemName = quoteItems[rowIndex].productName || "";
  }
  itemName = (itemName || "").trim();
  if (!itemName) {
    showToast("يرجى كتابة اسم الصنف أولاً لمقارنة أسعار الموردين", "warn");
    return;
  }
  window._supplierCompareTargetItemName = itemName;

  const titleEl = document.getElementById("qt-sc-title");
  const subEl = document.getElementById("qt-sc-subtitle");
  if (titleEl) titleEl.textContent = `مقارنة عروض وأسعار الموردين للصنف: "${itemName}"`;
  if (subEl) subEl.textContent = `مقارنة الأسعار المقدمة من مختلف الموردين وتواريخها لاختيار أفضل تكلفة شراء`;

  const supQuotes = getSupplierPricesForProduct(itemName);

  // KPIs
  const statsEl = document.getElementById("qt-sc-stats");
  if (statsEl) {
    if (!supQuotes.length) {
      statsEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding:12px; background:var(--bg-2); border-radius:8px; text-align:center; color:var(--text-2); font-size:12px;">
          لا توجد عروض أسعار مسجلة من الموردين لهذا الصنف في قاعدة البيانات حتى الآن.
        </div>
      `;
    } else {
      const prices = supQuotes.map(s => s.costPrice).filter(p => p > 0);
      const lowest = prices.length ? Math.min(...prices) : 0;
      const highest = prices.length ? Math.max(...prices) : 0;
      const avg = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const cheapest = supQuotes[0];

      statsEl.innerHTML = `
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#166534; font-weight:700;">⭐ أرخص وأفضل مورد</div>
          <div class="mono" style="font-size:16px; font-weight:900; color:#15803d; margin:2px 0;">${formatCurrency(cheapest.costPrice)}</div>
          <div style="font-size:10px; color:#166534; font-weight:700;">${cheapest.supplierName.slice(0, 16)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#991b1b; font-weight:700;">📈 أعلى سعر معروض</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#b91c1c; margin:2px 0;">${formatCurrency(highest)}</div>
          <div style="font-size:9.5px; color:#f87171;">شامل 15%: ${formatCurrency(highest * 1.15)}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#1e40af; font-weight:700;">⚖️ متوسط تكلفة الشراء</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#1e3a8a; margin:2px 0;">${formatCurrency(Math.round(avg * 100) / 100)}</div>
          <div style="font-size:9.5px; color:#60a5fa;">من أصل (${prices.length}) موردين</div>
        </div>
        <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#6b21a8; font-weight:700;">🏢 الموردين المتوفر لديهم</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#7e22ce; margin:2px 0;">${supQuotes.length} مورد</div>
          <div style="font-size:9.5px; color:#c084fc;">جاهز للطلب المباشر</div>
        </div>
      `;
    }
  }

  // Tbody
  const tbody = document.getElementById("qt-sc-tbody");
  if (tbody) {
    if (!supQuotes.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-2);">لم يتم العثور على هذا الصنف في قوائم الموردين المسجلة</td></tr>`;
    } else {
      tbody.innerHTML = supQuotes.map((s, idx) => {
        const isCheapest = idx === 0;
        const safeSupName = (s.supplierName || '').replace(/'/g, "\\'");
        const safeUnit = (s.unit || 'كرتون').replace(/'/g, "\\'");
        return `
          <tr style="border-bottom:1px solid var(--border-soft); ${isCheapest ? 'background:rgba(16,185,129,0.06);' : ''}">
            <td style="padding:10px 12px;">
              <div style="font-weight:800; font-size:12.5px; color:#1e293b;">${s.supplierName}</div>
              ${isCheapest ? '<span class="badge" style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:1px 6px; font-weight:800;">⭐ الأرخص والأفضل</span>' : ''}
            </td>
            <td style="padding:10px 12px; text-align:center; font-size:11.5px; color:var(--text-2);">${isoToDisplay(s.quoteDate)}</td>
            <td style="padding:10px 12px; text-align:center;">
              <span class="badge" style="font-size:10px; background:var(--bg-2);">${s.unit}</span>
            </td>
            <td style="padding:10px 12px; text-align:left; font-weight:900; font-size:13px; color:#166534;" class="mono">
              ${formatCurrency(s.costPrice)}
            </td>
            <td style="padding:10px 12px; text-align:left; font-weight:700; font-size:12px; color:#0284c7;" class="mono">
              ${formatCurrency(s.costPriceWithVat)}
            </td>
            <td style="padding:10px 12px; text-align:center; font-size:11px; color:var(--text-2);">
              ${s.fileName || 'قائمة أسعار'}
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:4px 12px; font-weight:800; background:#059669; border-color:#059669;"
                onclick="applySelectedSupplierCost(${s.costPrice}, '${safeSupName}', '${safeUnit}')">
                اعتماد تكلفة هذا المورد 🎯
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  openModal("qt-supplier-compare-modal");
};

window.applySelectedSupplierCost = (cost, supplierName, unit) => {
  const rowIndex = window._supplierCompareTargetRowIndex;
  const numCost = parseNum(cost, 0);
  if (rowIndex !== null && rowIndex !== undefined && quoteItems[rowIndex]) {
    quoteItems[rowIndex].cost = Math.round(numCost * 100) / 100;
    quoteItems[rowIndex].lastPurchasePrice = Math.round(numCost * 100) / 100;
    if (unit) quoteItems[rowIndex].unit = unit;

    const margin = parseNum(quoteItems[rowIndex].margin, 10);
    quoteItems[rowIndex].unitPrice = Math.round(numCost * (1 + margin / 100) * 100) / 100;

    renderQuoteLines();
    closeModal("qt-supplier-compare-modal");
    showToast(`تم اعتماد تكلفة المورد "${supplierName}" (${formatCurrency(numCost)}) بنجاح 🎯`, "success");
  } else {
    // Add as new row
    const defaultMargin = plMargins.retailMargin || 10;
    const calcPrice = Math.round(numCost * (1 + defaultMargin / 100) * 100) / 100;
    window.addCustomQuoteLineWithData(window._supplierCompareTargetItemName, unit, numCost, defaultMargin, calcPrice, "");
    closeModal("qt-supplier-compare-modal");
  }
};

window.applyCheapestSupplierCost = (rowIndex) => {
  if (!quoteItems[rowIndex]) return;
  const supQuotes = getSupplierPricesForProduct(quoteItems[rowIndex].productName);
  if (!supQuotes || !supQuotes.length) return;
  const cheapest = supQuotes[0];
  const numCost = parseNum(cheapest.costPrice, 0);

  quoteItems[rowIndex].cost = Math.round(numCost * 100) / 100;
  quoteItems[rowIndex].lastPurchasePrice = Math.round(numCost * 100) / 100;
  if (cheapest.unit) quoteItems[rowIndex].unit = cheapest.unit;

  const margin = parseNum(quoteItems[rowIndex].margin, 10);
  quoteItems[rowIndex].unitPrice = Math.round(numCost * (1 + margin / 100) * 100) / 100;

  renderQuoteLines();
  showToast(`تم تطبيق تكلفة ${cheapest.supplierName} (${formatCurrency(numCost)}) بنجاح ⚡`, "success");
};

// ============================================================
// 🏆 TOP REQUESTED PRODUCTS & DEMAND ANALYSIS (أكثر الأصناف طلباً في العروض والعملاء)
// ============================================================

let _activeDemandAnalysis = [];

window.toggleQuotationsTab = () => {
  const secDemand = document.getElementById("qt-view-demand-section");
  const isDemandOpen = secDemand && secDemand.style.display !== "none";
  window.switchQuotationsTab(isDemandOpen ? "quotes" : "demand");
};

window.switchQuotationsTab = (tab) => {
  const btnQuotes = document.getElementById("qt-tab-btn-quotes");
  const btnDemand = document.getElementById("qt-tab-btn-demand");
  const secQuotes = document.getElementById("qt-view-quotes-section");
  const secDemand = document.getElementById("qt-view-demand-section");
  const topBtnText = document.getElementById("qt-top-demand-text");
  const topBtnIcon = document.getElementById("qt-top-demand-icon");
  const topBtn = document.getElementById("qt-top-demand-btn");

  if (tab === "demand") {
    if (btnQuotes) {
      btnQuotes.className = "btn btn-secondary";
      btnQuotes.style.background = "#f8fafc";
      btnQuotes.style.color = "#334155";
      btnQuotes.style.border = "1.5px solid #cbd5e1";
      btnQuotes.style.borderBottom = "none";
    }
    if (btnDemand) {
      btnDemand.className = "btn btn-primary";
      btnDemand.style.background = "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";
      btnDemand.style.color = "#ffffff";
      btnDemand.style.border = "none";
    }
    if (topBtn) {
      topBtn.style.background = "#2563eb";
      topBtn.style.color = "#ffffff";
      topBtn.style.borderColor = "#1d4ed8";
    }
    if (topBtnIcon) topBtnIcon.textContent = "📋";
    if (topBtnText) topBtnText.textContent = "الرجوع لعروض الأسعار";

    if (secQuotes) secQuotes.style.display = "none";
    if (secDemand) secDemand.style.display = "block";
    renderTopRequestedProducts();
  } else {
    if (btnQuotes) {
      btnQuotes.className = "btn btn-primary";
      btnQuotes.style.background = "";
      btnQuotes.style.color = "";
      btnQuotes.style.border = "";
    }
    if (btnDemand) {
      btnDemand.className = "btn btn-secondary";
      btnDemand.style.background = "#f8fafc";
      btnDemand.style.color = "#334155";
      btnDemand.style.border = "1.5px solid #cbd5e1";
      btnDemand.style.borderBottom = "none";
    }
    if (topBtn) {
      topBtn.style.background = "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";
      topBtn.style.color = "#e0e7ff";
      topBtn.style.borderColor = "#4338ca";
    }
    if (topBtnIcon) topBtnIcon.textContent = "🏆";
    if (topBtnText) topBtnText.textContent = "أكثر الأصناف طلباً";

    if (secQuotes) secQuotes.style.display = "block";
    if (secDemand) secDemand.style.display = "none";
  }
};

window.openTopRequestedProductsModal = () => {
  window.switchQuotationsTab("demand");
  const el = document.getElementById("qt-view-demand-section");
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

window.setDemandDatePreset = (preset) => {
  const fromEl = document.getElementById("qt-demand-from");
  const toEl = document.getElementById("qt-demand-to");
  if (!fromEl || !toEl) return;

  const today = todayString();
  if (preset === "month") {
    fromEl.value = today.slice(0, 8) + "01";
    toEl.value = today;
  } else if (preset === "all") {
    fromEl.value = "";
    toEl.value = "";
  }
  renderTopRequestedProducts();
};

function updateDemandTabBadge() {
  const badge = document.getElementById("qt-demand-count-badge");
  if (!badge) return;
  const analysis = computeQuotationDemandAnalysis({});
  badge.textContent = `${analysis.length} صنف`;
}

function computeQuotationDemandAnalysis(filters = {}) {
  const allQuotes = Array.isArray(quotations) ? quotations : [];
  const from = filters.from || "";
  const to = filters.to || "";
  const status = filters.status || "";
  const search = (filters.search || "").trim().toLowerCase();
  const normSearch = typeof normalizeArabicText === "function" ? normalizeArabicText(search) : search;

  // 1. Stable customer key resolver (never merge different ad-hoc customers into one!)
  function getCustomerKey(q) {
    const rawName = (q.customerName || "").trim();
    const rawId = (q.customerId || "").trim();
    const isGeneric = !rawId || ["adhoc_customer", "general", "walkin", "cash", "null", "undefined"].includes(rawId.toLowerCase());
    if (rawName && rawName.length > 1) {
      return typeof normalizeArabicText === "function" ? normalizeArabicText(rawName) : rawName.toLowerCase();
    }
    if (!isGeneric) return rawId;
    return "عميل عام";
  }

  // 2. Deduplicate quotations across edits/revisions:
  // If a quote was edited or re-saved with the same quoteNumber for the same customer, keep only the latest revision!
  const sortedQuotes = [...allQuotes].sort((a, b) => {
    const ta = a.updatedAt?.seconds || a.createdAt?.seconds || (a.date ? new Date(a.date).getTime() / 1000 : 0);
    const tb = b.updatedAt?.seconds || b.createdAt?.seconds || (b.date ? new Date(b.date).getTime() / 1000 : 0);
    return ta - tb;
  });

  const quotesMap = new Map();
  for (const q of sortedQuotes) {
    if (!q) continue;
    const cKey = getCustomerKey(q);
    const qNum = (q.quoteNumber || q.id || "").trim().toUpperCase();
    const dedupKey = `${cKey}___${qNum}`;
    quotesMap.set(dedupKey, q);
  }
  const dedupedQuotes = Array.from(quotesMap.values());

  // 3. Filter quotations based on dates and status
  const filteredQuotes = dedupedQuotes.filter(q => {
    if (!q) return false;
    const qDate = q.date || (q.createdAt?.toDate ? q.createdAt.toDate().toISOString().slice(0, 10) : (q.createdAt ? String(q.createdAt).slice(0, 10) : ""));
    if (from && qDate && qDate < from) return false;
    if (to && qDate && qDate > to) return false;

    if (status === "converted") {
      if (q.status !== "converted" && q.status !== "accepted") return false;
    } else if (status === "pending") {
      if (q.status !== "draft" && q.status !== "sent") return false;
    } else if (status) {
      if (q.status !== status) return false;
    }
    return true;
  });

  // 4. Aggregate demand per product
  const productMap = new Map();

  for (const q of filteredQuotes) {
    const items = Array.isArray(q.items) ? q.items : (Array.isArray(q.lines) ? q.lines : []);
    const custId = q.customerId || "";
    const custName = (q.customerName || "").trim() || "عميل عام";
    const custKey = getCustomerKey(q);
    const repName = q.repName || "—";
    const qDate = q.date || (q.createdAt?.toDate ? q.createdAt.toDate().toISOString().slice(0, 10) : (q.createdAt ? String(q.createdAt).slice(0, 10) : ""));
    const isSuccess = q.status === "converted" || q.status === "accepted";
    const qUniqueRef = `${custKey}___${(q.quoteNumber || q.id || "").trim().toUpperCase()}`;

    // Combine duplicate product lines within the same quotation document
    const quoteProductAgg = new Map();

    for (const it of items) {
      if (!it) continue;
      const rawName = (it.productName || it.name || it.description || "").trim();
      if (!rawName || rawName.length < 2) continue;

      const normName = typeof normalizeArabicText === "function" ? normalizeArabicText(rawName) : rawName.toLowerCase();
      const qty = parseFloat(it.qty || it.quantity) || 0;
      const unitPrice = parseFloat(it.unitPrice || it.price) || 0;
      const lineTotal = parseFloat(it.total || it.lineTotal) || (qty * unitPrice);
      const unit = it.unit || "حبة";
      const sku = it.sku || it.barcode || "";

      if (!quoteProductAgg.has(normName)) {
        quoteProductAgg.set(normName, {
          rawName,
          unit,
          sku,
          qty,
          unitPrice,
          lineTotal
        });
      } else {
        const existing = quoteProductAgg.get(normName);
        existing.qty += qty;
        existing.lineTotal += lineTotal;
        if (unitPrice > 0) existing.unitPrice = unitPrice;
      }
    }

    for (const [normName, itAgg] of quoteProductAgg.entries()) {
      if (!productMap.has(normName)) {
        productMap.set(normName, {
          key: normName,
          productName: itAgg.rawName,
          sku: itAgg.sku,
          unit: itAgg.unit,
          quoteCount: 0,
          totalQty: 0,
          totalValue: 0,
          prices: [],
          convertedCount: 0,
          seenQuoteKeys: new Set(),
          customersMap: new Map(),
        });
      }

      const pEntry = productMap.get(normName);

      if (!pEntry.seenQuoteKeys.has(qUniqueRef)) {
        pEntry.seenQuoteKeys.add(qUniqueRef);
        pEntry.quoteCount++;
        if (isSuccess) pEntry.convertedCount++;
      }

      pEntry.totalQty += itAgg.qty;
      pEntry.totalValue += itAgg.lineTotal;
      if (itAgg.unitPrice > 0) pEntry.prices.push(itAgg.unitPrice);
      if (!pEntry.sku && itAgg.sku) pEntry.sku = itAgg.sku;

      // Track by customer
      if (!pEntry.customersMap.has(custKey)) {
        pEntry.customersMap.set(custKey, {
          customerId: custId,
          customerName: custName,
          requestCount: 0,
          totalQty: 0,
          totalValue: 0,
          seenQuotes: new Set(),
          quotes: []
        });
      }

      const cEntry = pEntry.customersMap.get(custKey);
      if (!cEntry.seenQuotes.has(qUniqueRef)) {
        cEntry.seenQuotes.add(qUniqueRef);
        cEntry.requestCount++;
      }
      cEntry.totalQty += itAgg.qty;
      cEntry.totalValue += itAgg.lineTotal;
      cEntry.quotes.push({
        quoteId: q.id,
        quoteNumber: q.quoteNumber || "—",
        date: qDate,
        qty: itAgg.qty,
        unit: itAgg.unit,
        unitPrice: itAgg.unitPrice,
        lineTotal: itAgg.lineTotal,
        status: q.status || "draft",
        repName: repName,
      });
    }
  }

  // 3. Convert to array and filter
  let resultList = [];
  for (const p of productMap.values()) {
    const customersList = Array.from(p.customersMap.values());
    customersList.sort((a, b) => (b.requestCount - a.requestCount) || (b.totalQty - a.totalQty));

    const avgPrice = p.totalQty > 0 ? (p.totalValue / p.totalQty) : (p.prices.length > 0 ? (p.prices.reduce((a,b)=>a+b,0)/p.prices.length) : 0);
    const minPrice = p.prices.length > 0 ? Math.min(...p.prices) : 0;
    const maxPrice = p.prices.length > 0 ? Math.max(...p.prices) : 0;
    const conversionRate = p.quoteCount > 0 ? Math.round((p.convertedCount / p.quoteCount) * 100) : 0;

    if (search) {
      const normPName = typeof normalizeArabicText === "function" ? normalizeArabicText(p.productName) : p.productName.toLowerCase();
      const pMatch = normPName.includes(normSearch) || p.sku.toLowerCase().includes(search);
      const cMatch = customersList.some(c => {
        const normC = typeof normalizeArabicText === "function" ? normalizeArabicText(c.customerName) : c.customerName.toLowerCase();
        return normC.includes(normSearch);
      });
      if (!pMatch && !cMatch) continue;
    }

    resultList.push({
      key: p.key,
      productName: p.productName,
      sku: p.sku,
      unit: p.unit,
      quoteCount: p.quoteCount,
      totalQty: Math.round(p.totalQty * 100) / 100,
      totalValue: Math.round(p.totalValue * 100) / 100,
      avgPrice: Math.round(avgPrice * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      customerCount: customersList.length,
      convertedCount: p.convertedCount,
      conversionRate: conversionRate,
      customers: customersList
    });
  }

  // 4. Sort results
  const sortBy = filters.sortBy || "count";
  if (sortBy === "count") {
    resultList.sort((a, b) => (b.quoteCount - a.quoteCount) || (b.totalQty - a.totalQty));
  } else if (sortBy === "qty") {
    resultList.sort((a, b) => (b.totalQty - a.totalQty) || (b.quoteCount - a.quoteCount));
  } else if (sortBy === "value") {
    resultList.sort((a, b) => (b.totalValue - a.totalValue) || (b.quoteCount - a.quoteCount));
  } else if (sortBy === "customers") {
    resultList.sort((a, b) => (b.customerCount - a.customerCount) || (b.quoteCount - a.quoteCount));
  }

  return resultList;
}

window.renderTopRequestedProducts = () => {
  const tbody = document.getElementById("qt-demand-tbody");
  if (!tbody) return;

  const search = document.getElementById("qt-demand-search")?.value || "";
  const from   = document.getElementById("qt-demand-from")?.value   || "";
  const to     = document.getElementById("qt-demand-to")?.value     || "";
  const status = document.getElementById("qt-demand-status")?.value || "";
  const sortBy = document.getElementById("qt-demand-sort")?.value   || "count";

  const list = computeQuotationDemandAnalysis({ search, from, to, status, sortBy });
  _activeDemandAnalysis = list;

  // Update KPIs
  const totalProducts = list.length;
  const totalRequests = list.reduce((s, x) => s + x.quoteCount, 0);
  const totalQty      = list.reduce((s, x) => s + x.totalQty, 0);
  const allUniqueCust = new Set();
  list.forEach(x => x.customers.forEach(c => allUniqueCust.add(c.customerId || c.customerName)));
  const totalCust     = allUniqueCust.size;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl("kpi-demand-prod-count", `${totalProducts} صنف`);
  setEl("kpi-demand-req-count",  `${totalRequests} طلب`);
  setEl("kpi-demand-total-qty",  formatQuantity(totalQty));
  setEl("kpi-demand-cust-count", `${totalCust} عميل`);
  setEl("qt-demand-stat-badge",  `${totalProducts} صنف مسعر`);

  const maxQuoteCount = list.length > 0 ? Math.max(...list.map(x => x.quoteCount)) : 1;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-2); font-weight:700;">
      🔍 لا توجد أصناف مطابقة للبحث أو التصفية المختارة في عروض الأسعار
    </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((p, idx) => {
    let rankBadge = `<span class="mono font-bold" style="color:#64748b; font-size:12px;">#${idx + 1}</span>`;
    let rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    if (idx === 0) {
      rankBadge = `<span style="font-size:16px;" title="المركز الأول">🥇 1</span>`;
      rowBg = "#fffbeb";
    } else if (idx === 1) {
      rankBadge = `<span style="font-size:16px;" title="المركز الثاني">🥈 2</span>`;
    } else if (idx === 2) {
      rankBadge = `<span style="font-size:16px;" title="المركز الثالث">🥉 3</span>`;
    }

    const pctBar = maxQuoteCount > 0 ? Math.min(100, Math.round((p.quoteCount / maxQuoteCount) * 100)) : 10;

    return `
      <tr style="background:${rowBg}; border-bottom:1px solid #e2e8f0; transition:all 0.15s ease;">
        <td style="text-align:center; padding:10px 8px; font-weight:800;">${rankBadge}</td>
        
        <td style="padding:10px 12px;">
          <strong style="color:var(--text-1); font-size:13.5px;">${p.productName}</strong>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">
            الوحدة: <strong style="color:#0f172a;">${p.unit}</strong>
            ${p.sku ? ` | كود: <span class="mono" style="background:#f1f5f9; padding:1px 5px; border-radius:4px;">${p.sku}</span>` : ''}
          </div>
        </td>

        <td style="text-align:center; padding:10px 12px;">
          <div style="font-weight:900; font-size:14px; color:#312e81;">${p.quoteCount} مرة</div>
          <div style="background:#e0e7ff; border-radius:4px; height:5px; width:90px; margin:4px auto 0; overflow:hidden;">
            <div style="background:#4338ca; height:100%; width:${pctBar}%;"></div>
          </div>
        </td>

        <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px 12px; color:#0f172a;">
          ${formatQuantity(p.totalQty)} <small style="color:#64748b; font-weight:600;">${p.unit}</small>
        </td>

        <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px; color:#0369a1;">
          ${formatCurrency(p.avgPrice)}
          <div style="font-size:9.5px; color:#64748b; font-weight:600;">(من ${formatCurrency(p.minPrice)} إلى ${formatCurrency(p.maxPrice)})</div>
        </td>

        <td class="mono font-bold text-ok" style="text-align:left; font-size:13.5px; padding:10px 12px;">
          ${formatCurrency(p.totalValue)}
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:800; font-size:11.5px; padding:4px 9px; border-radius:8px;">
            👥 ${p.customerCount} عميل
          </span>
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <span class="badge" style="background:${p.conversionRate > 0 ? '#ecfdf5' : '#f8fafc'}; color:${p.conversionRate > 0 ? '#047857' : '#64748b'}; border:1px solid ${p.conversionRate > 0 ? '#a7f3d0' : '#e2e8f0'}; font-weight:800; font-size:11px; padding:3px 8px; border-radius:8px;">
            ${p.conversionRate}% (${p.convertedCount} بيع)
          </span>
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <button type="button" class="btn btn-sm" id="btn-toggle-demand-${idx}" onclick="toggleDemandCustomerRow(${idx})"
            style="background:#f1f5f9; color:#1e1b4b; border:1.5px solid #cbd5e1; font-weight:800; font-size:11.5px; padding:5px 11px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.15s;">
            <span>👥 من هم العملاء؟</span> <span id="caret-demand-${idx}">▼</span>
          </button>
        </td>
      </tr>

      <!-- Sub-row: Customer Breakdown (ومن من؟) -->
      <tr id="demand-cust-subrow-${idx}" style="display:none; background:#f8fafc; border-top:1.5px dashed #cbd5e1; border-bottom:2px solid #cbd5e1;">
        <td colspan="9" style="padding:14px 20px;">
          <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:16px; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
              <div style="font-weight:900; font-size:13.5px; color:#1e1b4b; display:flex; align-items:center; gap:8px;">
                <span>👥</span> قائمة العملاء الذين طلبوا صنف «${p.productName}» (${p.customers.length} عميل):
              </div>
              <div style="font-size:11.5px; color:#64748b; font-weight:700;">
                إجمالي مرات الطلب: <strong style="color:#4338ca;">${p.quoteCount} مرة</strong> | إجمالي الكمية: <strong style="color:#047857;">${formatQuantity(p.totalQty)} ${p.unit}</strong>
              </div>
            </div>

            <!-- Customer Breakdown Table -->
            <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:4px;">
              <thead>
                <tr style="background:#f1f5f9; color:#334155; border-bottom:1.5px solid #cbd5e1;">
                  <th style="padding:8px 10px; text-align:right;">العميل (من من؟)</th>
                  <th style="padding:8px 10px; text-align:center; width:120px;">مرات الطلب</th>
                  <th style="padding:8px 10px; text-align:left; width:130px;">الكمية المطلوبة</th>
                  <th style="padding:8px 10px; text-align:left; width:130px;">إجمالي القيمة</th>
                  <th style="padding:8px 10px; text-align:right;">عروض الأسعار والتواريخ والأسعار</th>
                </tr>
              </thead>
              <tbody>
                ${p.customers.map(c => `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:9px 10px;">
                      <strong style="color:#0f172a; font-size:13px;">👤 ${c.customerName}</strong>
                    </td>
                    <td style="padding:9px 10px; text-align:center;">
                      <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:900; font-size:11px; padding:2px 8px; border-radius:6px;">${c.requestCount} مرة</span>
                    </td>
                    <td class="mono font-bold" style="padding:9px 10px; text-align:left; color:#0f172a;">
                      ${formatQuantity(c.totalQty)} <small style="font-weight:600; color:#64748b;">${p.unit}</small>
                    </td>
                    <td class="mono font-bold" style="padding:9px 10px; text-align:left; color:#047857;">
                      ${formatCurrency(c.totalValue)}
                    </td>
                    <td style="padding:9px 10px;">
                      <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${c.quotes.map(q => `
                          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:6px;">
                            <span style="font-weight:900; color:#1e1b4b; cursor:pointer;" onclick="viewQuote('${q.quoteId}')" title="معاينة عرض السعر">📄 ${q.quoteNumber}</span>
                            <span style="color:#64748b;">📅 ${q.date || '—'}</span>
                            <span style="color:#047857; font-weight:800;">📦 ${formatQuantity(q.qty)} ${q.unit}</span>
                            <span class="mono" style="font-weight:800; color:#0369a1;">💰 ${formatCurrency(q.unitPrice)}</span>
                            ${statusBadge(q.status)}
                            ${q.repName && q.repName !== '—' ? `<span style="color:#64748b; font-size:10px;">👤 ${q.repName}</span>` : ''}
                          </div>
                        `).join("")}
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

          </div>
        </td>
      </tr>`;
  }).join("");
};

window.toggleDemandCustomerRow = (idx) => {
  const subrow = document.getElementById(`demand-cust-subrow-${idx}`);
  const caret = document.getElementById(`caret-demand-${idx}`);
  const btn = document.getElementById(`btn-toggle-demand-${idx}`);
  if (!subrow) return;

  const isHidden = subrow.style.display === "none";
  subrow.style.display = isHidden ? "table-row" : "none";
  if (caret) caret.textContent = isHidden ? "▲" : "▼";
  if (btn) {
    btn.style.background = isHidden ? "#1e1b4b" : "#f1f5f9";
    btn.style.color = isHidden ? "#ffffff" : "#1e1b4b";
  }
};

window.exportTopRequestedProductsExcel = async () => {
  if (!_activeDemandAnalysis || !_activeDemandAnalysis.length) {
    showToast("لا توجد بيانات أصناف للتصدير في العرض الحالي", "warning");
    return;
  }

  const headers = [
    "الترتيب",
    "اسم الصنف",
    "كود الصنف",
    "الوحدة",
    "كم مرة طُلب (تكرار العروض)",
    "إجمالي الكمية المطلوبة",
    "متوسط السعر المعروض (ر.س)",
    "أدنى سعر معروض (ر.س)",
    "أقصى سعر معروض (ر.س)",
    "إجمالي القيمة التقديرية (ر.س)",
    "عدد العملاء الطالبين",
    "نسبة التحويل للبيع %",
    "قائمة العملاء الطالبين وتفاصيل طلباتهم"
  ];

  const rows = _activeDemandAnalysis.map((p, idx) => {
    const custSummary = p.customers.map(c => 
      `${c.customerName} (${c.requestCount} مرة - ${formatQuantity(c.totalQty)} ${p.unit})`
    ).join(" | ");

    return [
      idx + 1,
      p.productName,
      p.sku || "",
      p.unit,
      p.quoteCount,
      p.totalQty,
      p.avgPrice,
      p.minPrice,
      p.maxPrice,
      p.totalValue,
      p.customerCount,
      `${p.conversionRate}%`,
      custSummary
    ];
  });

  const colWidths = [8, 30, 14, 10, 16, 16, 16, 14, 14, 18, 14, 14, 50];

  try {
    await exportToExcel({
      title: "أكثر_الأصناف_طلباً_في_عروض_الأسعار",
      headers,
      rows,
      colWidths,
      user: _quotesUser?.displayName || "مبيعات إدهام"
    });
    showToast("تم تصدير ملف Excel بنجاح", "success");
  } catch (err) {
    showToast(`فشل تصدير Excel: ${err.message}`, "error");
  }
};

window.printTopRequestedProductsReport = async () => {
  if (!_activeDemandAnalysis || !_activeDemandAnalysis.length) {
    showToast("لا توجد بيانات أصناف للطباعة", "warning");
    return;
  }

  let company = {};
  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (coSnap.exists()) company = coSnap.data();
    if (logoSnap.exists()) company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
  } catch (_) {}

  const coName = company.name || company.companyName || "مؤسسة إدهام للمواد الغذائية";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "المملكة العربية السعودية";
  const coPhone = company.phone || company.mobile || "";
  const coVat = company.vatNumber || company.vat || company.taxNumber || "";
  const coCr = company.crNumber || company.cr || "";
  const coLogo = company.logoUrl || "";

  const from = document.getElementById("qt-demand-from")?.value || "";
  const to = document.getElementById("qt-demand-to")?.value || "";

  const totalProds = _activeDemandAnalysis.length;
  const totalReqs = _activeDemandAnalysis.reduce((s, x) => s + x.quoteCount, 0);
  const totalQtys = _activeDemandAnalysis.reduce((s, x) => s + x.totalQty, 0);
  const totalVals = _activeDemandAnalysis.reduce((s, x) => s + x.totalValue, 0);

  const tableRows = _activeDemandAnalysis.map((p, idx) => `
    <tr>
      <td style="text-align:center;font-weight:800;">${idx + 1}</td>
      <td><strong>${p.productName}</strong> <small style="color:#64748b;">(${p.unit})</small></td>
      <td style="text-align:center;font-weight:900;color:#312e81;">${p.quoteCount} مرة</td>
      <td style="text-align:left;" class="mono">${formatQuantity(p.totalQty)}</td>
      <td style="text-align:left;" class="mono">${formatCurrency(p.avgPrice)}</td>
      <td style="text-align:left;" class="mono font-bold">${formatCurrency(p.totalValue)}</td>
      <td>
        <div style="font-size:10.5px;color:#0f172a;line-height:1.6;">
          ${p.customers.map(c => `• <strong>${c.customerName}</strong> (${c.requestCount} مرة — ${formatQuantity(c.totalQty)} ${p.unit})`).join("<br>")}
        </div>
      </td>
    </tr>
  `).join("");

  const win = window.open("", "_blank", "width=1000,height=850");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير أكثر الأصناف طلباً في عروض الأسعار — ${coName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family:'Cairo',Arial,sans-serif; direction:rtl; padding:18px; color:#0f172a; background:#fff; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    table { width:100%; border-collapse:collapse; font-size:11px; margin-top:12px; }
    th { background:#1e293b; color:#fff !important; padding:8px 10px; font-weight:800; border:1px solid #cbd5e1; }
    td { padding:8px 10px; border:1px solid #cbd5e1; }
    .mono { font-family:monospace; }
    @media print {
      body { padding:0; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #0f172a; padding-bottom:12px; margin-bottom:14px;">
    <div style="display:flex; align-items:center; gap:14px;">
      ${coLogo ? `<img src="${coLogo}" style="height:65px; width:65px; object-fit:contain;" />` : ''}
      <div>
        <h1 style="font-size:20px; font-weight:900; color:#0f172a; margin-bottom:3px;">${coName}</h1>
        <div style="font-size:11px; color:#475569;">📍 ${coAddress} ${coPhone ? `| 📞 ${coPhone}` : ''} ${coVat ? `| الرقم الضريبي: ${coVat}` : ''}</div>
      </div>
    </div>
    <div style="text-align:left;">
      <div style="background:#f1f5f9; padding:8px 16px; border-radius:8px; border:1.5px solid #cbd5e1;">
        <div style="font-size:14px; font-weight:900; color:#1e1b4b;">تقرير أكثر الأصناف طلباً في عروض الأسعار والعملاء</div>
        <div style="font-size:10.5px; color:#64748b; margin-top:2px;">الفترة: ${from ? formatDate(from) : 'البداية'} إلى ${to ? formatDate(to) : 'اليوم'} | تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-SA')}</div>
      </div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:12px;">
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">الأصناف المسعرة</div>
      <div style="font-size:15px; font-weight:900; color:#0f172a;">${totalProds} صنف</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي مرات طلب الأصناف</div>
      <div style="font-size:15px; font-weight:900; color:#312e81;">${totalReqs} طلب</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي الكميات المسعرة</div>
      <div style="font-size:15px; font-weight:900; color:#0f172a;">${formatQuantity(totalQtys)}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي القيمة التقديرية</div>
      <div style="font-size:15px; font-weight:900; color:#047857;">${formatCurrency(totalVals)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>اسم الصنف والوحدة</th>
        <th style="width:110px;text-align:center;">كم مرة طُلب؟</th>
        <th style="width:110px;text-align:left;">إجمالي الكمية</th>
        <th style="width:110px;text-align:left;">متوسط السعر</th>
        <th style="width:120px;text-align:left;">إجمالي القيمة</th>
        <th>العملاء الطالبون للصنف وتفاصيل طلباتهم (من من؟)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:11px; color:#475569; border-top:1px dashed #cbd5e1; padding-top:12px;">
    <div><strong>إعداد مسؤول المبيعات:</strong> .....................................</div>
    <div><strong>مراجعة الإدارة المالية:</strong> .....................................</div>
    <div><strong>اعتماد المدير العام:</strong> .....................................</div>
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 700);
};

// ── Tier 1 Margins Configuration Modal ───────────────────────
window.openTier1MarginsModal = () => {
  let modal = document.getElementById("qt-tier1-margins-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "qt-tier1-margins-modal";
    modal.className = "modal-backdrop hidden";
    modal.innerHTML = `
      <div class="modal-card" style="max-width:500px; width:92%; border-radius:12px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.25); background:#fff;">
        <div class="modal-header" style="background:linear-gradient(135deg,#065f46,#047857); color:#fff; padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:8px;">
            <span>⚙️</span> ضبط هوامش أرباح السلع (فئة أولى)
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal('qt-tier1-margins-modal')" style="color:#fff; font-size:16px; padding:0 6px;">✕</button>
        </div>
        <div class="modal-body" style="padding:16px 20px; background:#fff; display:flex; flex-direction:column; gap:12px;">
          <p style="font-size:12px; color:var(--text-2); margin:0; line-height:1.6;">
            تُطبق هذه النسب تلقائياً فوق سعر التكلفة عند إنشاء عرض سعر لعميل <strong>فئة أولى</strong> (دون التأثير على أي عميل آخر أو على باقي البرنامج):
          </p>

          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#065f46; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>🌾 سلع استراتيجية أساسية (زيوت، أرز، سكر، دقيق، حليب)</span>
              <span style="font-size:10.5px; color:#047857; font-weight:600;">(النطاق: 3% - 5%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-basic" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#86efac;" step="0.5" min="0" max="100" value="${tier1Margins.basic}" />
              <span style="font-size:13px; font-weight:700; color:#065f46;">%</span>
            </div>
          </div>

          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#1e40af; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>🥫 سلع استهلاكية متوسطة (صلصة، إندومي، معلبات، مكرونة)</span>
              <span style="font-size:10.5px; color:#2563eb; font-weight:600;">(النطاق: 6% - 10%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-medium" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#93c5fd;" step="0.5" min="0" max="100" value="${tier1Margins.medium}" />
              <span style="font-size:13px; font-weight:700; color:#1e40af;">%</span>
            </div>
          </div>

          <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#6b21a8; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>📦 أدوات التغليف والمنظفات والبلاستيك (سفرة، أكياس، صابون)</span>
              <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">(النطاق: 11% - 15%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-high" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#d8b4fe;" step="0.5" min="0" max="100" value="${tier1Margins.high}" />
              <span style="font-size:13px; font-weight:700; color:#6b21a8;">%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding:12px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('qt-tier1-margins-modal')">إلغاء</button>
          <button type="button" class="btn btn-primary" id="save-t1-margins-btn" onclick="saveTier1Margins()" style="background:#059669; border-color:#059669; font-weight:700;">💾 حفظ واعتماد النسب</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    const bIn = document.getElementById("t1-margin-basic");
    const mIn = document.getElementById("t1-margin-medium");
    const hIn = document.getElementById("t1-margin-high");
    if (bIn) bIn.value = tier1Margins.basic;
    if (mIn) mIn.value = tier1Margins.medium;
    if (hIn) hIn.value = tier1Margins.high;
  }
  openModal("qt-tier1-margins-modal");
};

window.saveTier1Margins = async () => {
  const btn = document.getElementById("save-t1-margins-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "جارٍ الحفظ…";
  }

  const b = parseFloat(document.getElementById("t1-margin-basic")?.value) || 0;
  const m = parseFloat(document.getElementById("t1-margin-medium")?.value) || 0;
  const h = parseFloat(document.getElementById("t1-margin-high")?.value) || 0;

  tier1Margins.basic = b;
  tier1Margins.medium = m;
  tier1Margins.high = h;

  try {
    const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const docRef = doc(db, `companies/${COMPANY_ID}/settings`, "tier1Margins");
    await setDoc(docRef, {
      basic: b,
      medium: m,
      high: h,
      updatedAt: new Date()
    }, { merge: true });

    const plRef = doc(db, `companies/${COMPANY_ID}/settings`, "priceListMargins");
    await setDoc(plRef, { tier1Basic: b, tier1Medium: m, tier1High: h }, { merge: true });

    showToast("تم حفظ وتحديث نسب هوامش الفئة الأولى بنجاح ✅", "success");
    closeModal("qt-tier1-margins-modal");

    updateTier1UI();

    const pl = document.getElementById("qt-pricelist")?.value;
    if (pl === "tier1") {
      onPricelistChange();
    }
  } catch (err) {
    showToast("خطأ في حفظ النسب: " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 حفظ واعتماد النسب";
    }
  }
};


