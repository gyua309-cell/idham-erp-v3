// ============================================================
// IDHAM ERP — Formatters & Utilities
// Extended version with all required functions
// ============================================================

import { APP_CONFIG } from "../firebase-config.js";

// ── Currency ──────────────────────────────────────────────
export function formatCurrency(amount, short = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  if (short && Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(1) + "K ر.س";
  }
  const formatted = new Intl.NumberFormat("ar-SA-u-nu-latn", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `\u200E${formatted}\u200E ر.س`;
}

// ── Dates ─────────────────────────────────────────────────
/**
 * Returns a clear, unambiguous DD/MM/YYYY date string (e.g. 06/08/2026).
 * Consistent across all tables, print and PDF views.
 */
export function formatDate(value) {
  if (!value) return "—";
  let date;
  if (value?.toDate) date = value.toDate();
  else if (typeof value === "string") {
    // ISO strings like "2026-08-06" must be parsed as local date (not UTC)
    // to avoid off-by-one from timezone shifts.
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value);
    date = iso ? new Date(value + "T00:00:00") : new Date(value);
  } else {
    date = new Date(value);
  }
  if (isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Returns a verbose Arabic date string (e.g. "06 أغسطس 2026").
 * Use in print/PDF/detail views where space is not a constraint.
 */
export function formatDateLong(value) {
  if (!value) return "—";
  let date;
  if (value?.toDate) date = value.toDate();
  else if (typeof value === "string") {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value);
    date = iso ? new Date(value + "T00:00:00") : new Date(value);
  } else {
    date = new Date(value);
  }
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "2-digit" });
}

export function formatISOTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function startOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// ── Numbers ───────────────────────────────────────────────
export function formatQuantity(qty) {
  if (qty === null || qty === undefined || isNaN(qty)) return "—";
  const num = parseFloat(qty);
  const hasDecimals = num % 1 !== 0;
  return new Intl.NumberFormat("ar-SA-u-nu-latn", {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasDecimals ? 3 : 0,
  }).format(num);
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toFixed(1) + "%";
}

// ── Invoice Calculations ──────────────────────────────────
export function calcLineTotal(qty, unitPrice, discountVal = 0, discountType = "percent") {
  const gross = (qty || 0) * (unitPrice || 0);
  let discountAmt = 0;
  if (discountType === "amount") {
    discountAmt = Math.min(gross, Math.max(0, parseFloat(discountVal) || 0));
  } else {
    discountAmt = Math.min(gross, Math.max(0, gross * ((parseFloat(discountVal) || 0) / 100)));
  }
  return Math.max(0, gross - discountAmt);
}

export function calcInvoiceTotals(lines) {
  let subtotal = 0, discountTotal = 0, vatTotal = 0;

  (lines || []).forEach(line => {
    const gross = (line.qty || 0) * (line.unitPrice || 0);
    let discountAmt = 0;
    if (line.discountType === "amount") {
      discountAmt = Math.min(gross, Math.max(0, parseFloat(line.discount) || 0));
    } else {
      discountAmt = Math.min(gross, Math.max(0, gross * ((parseFloat(line.discount) || 0) / 100)));
    }
    const afterDiscount = Math.max(0, gross - discountAmt);
    // Default VAT rate is 15% (0.15) unless explicitly set to Zero (Z) or Exempt (E) or taxRate is 0
    let vatRate = 0.15;
    if (line.taxCategory === "E" || line.taxCategory === "Z" || line.taxRate === 0) {
      vatRate = 0;
    } else if (line.taxRate !== undefined && line.taxRate !== null && !isNaN(line.taxRate)) {
      vatRate = parseFloat(line.taxRate) / 100;
    }
    const lineVat = afterDiscount * vatRate;

    subtotal      += afterDiscount;
    discountTotal += discountAmt;
    vatTotal      += lineVat;
  });

  return {
    subtotal:      Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    vatTotal:      Math.round(vatTotal * 100) / 100,
    grandTotal:    Math.round((subtotal + vatTotal) * 100) / 100,
  };
}

// ── Stock Status ──────────────────────────────────────────
export function getStockStatus(qty, reorderLevel = 0) {
  if (qty <= 0) return { color: "bad", label: "نافد" };
  if (reorderLevel > 0 && qty <= reorderLevel) return { color: "warn", label: "منخفض" };
  return { color: "good", label: "متوفر" };
}

export function getStockStatusBadge(qty, reorderLevel = 0) {
  const st = getStockStatus(qty, reorderLevel);
  return `<span class="badge ${st.color}" style="font-size:10px;">${st.label}</span>`;
}

// ── Invoice Status ────────────────────────────────────────
export function getInvoiceStatusBadge(status) {
  const map = {
    pending:   { color: "warn",   label: "معلقة" },
    paid:      { color: "good",   label: "مدفوعة" },
    partial:   { color: "indigo", label: "جزئي" },
    overdue:   { color: "bad",    label: "متأخرة" },
    cancelled: { color: "neutral",label: "ملغاة" },
    draft:     { color: "neutral",label: "مسودة" },
    posted:    { color: "good",   label: "مرحلة" },
  };
  const s = map[status] || { color: "neutral", label: status };
  return `<span class="badge ${s.color}" style="font-size:10px;">${s.label}</span>`;
}

// ── Credit Status ─────────────────────────────────────────
export function getCreditStatus(balance, creditLimit) {
  if (!creditLimit) return { color: "neutral", label: "—", pct: 0 };
  const pct = Math.min((balance / creditLimit) * 100, 150);
  if (pct >= 100) return { color: "bad",  label: "تجاوز الحد", pct };
  if (pct >= 80)  return { color: "warn", label: "قارب الحد",  pct };
  return { color: "good", label: "طبيعي", pct };
}

// ── Target Color ──────────────────────────────────────────
export function getTargetColor(pct) {
  if (pct >= 100) return "lime";
  if (pct >= 70)  return "indigo";
  if (pct >= 40)  return "warn";
  return "bad";
}

// ── Search Tokens ─────────────────────────────────────────
export function generateSearchTokens(text) {
  if (!text) return [];
  const tokens = new Set();
  const normalized = text.toLowerCase().trim();
  // Add full string
  tokens.add(normalized);
  // Add each word
  normalized.split(/\s+/).forEach(w => {
    if (w.length >= 2) tokens.add(w);
    // Add prefixes of each word
    for (let i = 2; i <= Math.min(w.length, 6); i++) {
      tokens.add(w.slice(0, i));
    }
  });
  return Array.from(tokens).slice(0, 30); // Firestore array-contains limit
}

// ── Debounce ──────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── UUID ──────────────────────────────────────────────────
export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Format Short Number ───────────────────────────────────
export function formatShortNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Unit Translation ──────────────────────────────────────
export function translateUnit(unit) {
  if (!unit) return "حبة";
  const u = String(unit).trim().toLowerCase();
  const map = {
    carton: "كرتون",
    ctn: "كرتون",
    bag: "كيس",
    bale: "شدة / كيس",
    box: "علبة",
    pkt: "باكت",
    packet: "باكت",
    piece: "حبة",
    pcs: "حبة",
    pallet: "باليت",
    plt: "باليت",
    kg: "كيلو",
    g: "جرام",
    l: "لتر",
    tin: "تنك",
    can: "صفيحة / تنك",
    gallon: "جالون",
    gal: "جالون",
    doz: "درزن",
    dozen: "درزن",
    bundle: "ربطة"
  };
  return map[u] || unit;
}

// ── Tafqeet (Arabic Amount in Words) ─────────────────────
export function tafqeetArabic(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) return "فقط صفر ريال سعودي لا غير";
  
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  function convertGroup(n) {
    let res = "";
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    if (h > 0) res += hundreds[h];
    if (remainder > 0) {
      if (res) res += " و";
      if (remainder < 20) {
        res += ones[remainder];
      } else {
        const o = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (o > 0) res += ones[o] + " و" + tens[t];
        else res += tens[t];
      }
    }
    return res;
  }

  const num = Math.abs(parseFloat(amount));
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let parts = [];
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const units = integerPart % 1000;

  if (millions > 0) {
    if (millions === 1) parts.push("مليون");
    else if (millions === 2) parts.push("مليونان");
    else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + " ملايين");
    else parts.push(convertGroup(millions) + " مليون");
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push("ألف");
    else if (thousands === 2) parts.push("ألفان");
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + " آلاف");
    else parts.push(convertGroup(thousands) + " ألف");
  }

  if (units > 0 || parts.length === 0) {
    const uStr = convertGroup(units);
    if (uStr) parts.push(uStr);
  }

  let text = parts.join(" و") + " ريالاً سعودياً";
  if (decimalPart > 0) {
    text += " و" + convertGroup(decimalPart) + " هللة";
  }
  return "فقط " + text + " لا غير";
}

export function showToast(msg, type = "info") {
  if (typeof window.showToast === "function") {
    return window.showToast(msg, type);
  }
  console.log(`[Toast ${type}]:`, msg);
}

