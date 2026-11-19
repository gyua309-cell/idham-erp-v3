// ============================================================
// IDHAM ERP — Customers Module
// ============================================================
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, where, orderBy, limit, getDocs } from "../utils/db.js";
import { syncEntityToCoa, updateEntityInCoa, deleteEntityInCoa, migrateCustomerCoa } from "../utils/coa-connector.js";
import { formatCurrency, formatDate, getCreditStatus, debounce } from "../utils/formatters.js";
import { exportToExcel, importFromExcel, downloadTemplate } from "../utils/excel.js";
import { showRecordPreview, printRecord } from "../utils/record-actions.js";
import { syncCustomerNameEverywhere, syncCustomerBalanceToCoa } from "../utils/sync-engine.js";
import { openCustomerAgreementModal } from "./customer-agreement.js?v=4.2";

window.openCustomerAgreement = openCustomerAgreementModal;
window.openBlankCustomerAgreement = () => openCustomerAgreementModal(null, true);

let cachedCustomers = [];
let cachedInvoices = [];
let _cachedInvoicesEarliestDate = "";
let custSortField = "date";
let custSortDir = "desc";
let currentTierFilter = "all";
let currentActivityFilter = "all";
let currentSalesPeriod = "last30"; // "last30" | "currentMonth" | "lastMonth" | "allTime" | "custom"
let customSalesFrom = "";
let customSalesTo = "";

export function normalizeArabicText(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[()\[\]{}\-_\/\\.,:;+*="']/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function matchArabicSearch(target, query) {
  if (!query) return true;
  const normTarget = normalizeArabicText(target);
  const normQuery = normalizeArabicText(query);
  if (normTarget.includes(normQuery)) return true;

  const tokens = normQuery.split(" ").filter(Boolean);
  return tokens.every(token => {
    if (normTarget.includes(token)) return true;
    if (token.startsWith("ال") && token.length > 3) {
      const stripped = token.slice(2);
      if (normTarget.includes(stripped)) return true;
    }
    return false;
  });
}

export function getCustomerActivityInfo(rawName) {
  const n = (rawName || "").toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه");

  if (/مطعم|شواي|مشوي|وجبات|برجر|بخاري|مندي|فطائر|فطاير|اسماك|سمك|حلواني|مطبخ|كبس|شاورما|بيتزا|اكلات|طباخ|اعاش|إعاش/.test(n)) {
    return { key: "restaurant", label: "مطاعم وإعاشة", icon: "🍽️", color: "#ea580c", bg: "rgba(234,88,12,0.1)" };
  }
  if (/تموين|ماركت|اسواق|سوبرماركت/.test(n)) {
    return { key: "catering", label: "تموينات وأسواق", icon: "🏪", color: "#0284c7", bg: "rgba(2,132,199,0.1)" };
  }
  if (/بقال|دكان/.test(n)) {
    return { key: "grocery", label: "بقالات", icon: "🛒", color: "#16a34a", bg: "rgba(22,163,74,0.1)" };
  }
  if (/فندق|فنادق|منتجع|ايواء|شقق|نزل|سياحي|اجنح|شاليه/.test(n)) {
    return { key: "hotel", label: "فنادق وإيواء", icon: "🏨", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" };
  }
  if (/كافيه|مقهى|مقهي|كوفي|شاي|عصير|عصائر/.test(n)) {
    return { key: "cafe", label: "كافيهات ومقاهي", icon: "☕", color: "#b45309", bg: "rgba(180,83,9,0.1)" };
  }
  return { key: "other", label: "تجارية وأخرى", icon: "🏢", color: "#64748b", bg: "rgba(100,116,139,0.1)" };
}

export function getPeriodDateBounds(periodKey, customFrom = "", customTo = "") {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const arMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const curMonthName = arMonths[now.getMonth()];
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = arMonths[prevMonthDate.getMonth()];

  if (periodKey === "currentMonth") {
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    return { from, to: todayStr, label: `مسحوبات الشهر الحالي (${curMonthName})`, shortLabel: `الشهر الحالي (${curMonthName})`, curMonthName, prevMonthName };
  }
  if (periodKey === "lastMonth") {
    const from = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
    const to = `${lastDayPrev.getFullYear()}-${String(lastDayPrev.getMonth() + 1).padStart(2, "0")}-${String(lastDayPrev.getDate()).padStart(2, "0")}`;
    return { from, to, label: `مسحوبات الشهر السابق (${prevMonthName})`, shortLabel: `الشهر السابق (${prevMonthName})`, curMonthName, prevMonthName };
  }
  if (periodKey === "allTime") {
    return { from: "2000-01-01", to: "9999-12-31", label: "إجمالي المسحوبات (كامل الفترة)", shortLabel: "كامل الفترة", curMonthName, prevMonthName };
  }
  if (periodKey === "custom" && customFrom) {
    return { from: customFrom, to: customTo || todayStr, label: `مسحوبات الفترة (${customFrom} إلى ${customTo || todayStr})`, shortLabel: "فترة مخصصة", curMonthName, prevMonthName };
  }
  // Default: last 30 days
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { from: thirtyDaysAgoStr, to: todayStr, label: "مسحوبات الشهر (آخر ٣٠ يوماً)", shortLabel: "آخر ٣٠ يوماً", curMonthName, prevMonthName };
}

export async function applyCustomerSalesPeriod(periodKey, customFrom = "", customTo = "") {
  currentSalesPeriod = periodKey;
  customSalesFrom = customFrom;
  customSalesTo = customTo;

  const bounds = getPeriodDateBounds(periodKey, customFrom, customTo);

  if (bounds.from && bounds.from < _cachedInvoicesEarliestDate) {
    try {
      const constraints = bounds.from === "2000-01-01" ? [] : [where("date", ">=", bounds.from)];
      const moreInvs = await getAll(COLS.salesInvoices(), constraints);
      cachedInvoices = moreInvs || [];
      _cachedInvoicesEarliestDate = bounds.from;
    } catch (_) {}
  }

  // Compute sales per customer within bounds
  const custSalesMap = {};
  (cachedInvoices || []).forEach(inv => {
    if (inv.status === "cancelled" || !inv.customerId) return;
    const d = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().slice(0, 10) : typeof inv.createdAt === "string" ? inv.createdAt.slice(0, 10) : "");
    if (d >= bounds.from && d <= bounds.to) {
      custSalesMap[inv.customerId] = (custSalesMap[inv.customerId] || 0) + (inv.totalWithVat || inv.total || 0);
    }
  });

  // Update customer objects
  cachedCustomers.forEach(c => {
    c.monthlySales = custSalesMap[c.id] || 0;
    c.tier = getCustomerTierInfo(c.monthlySales, c.tierOverride || c.manualTier);
  });

  // Update header text in table
  const thEl = document.getElementById("th-sales-period");
  if (thEl) thEl.textContent = bounds.label;

  // Update quick filter label
  const tierTitleEl = document.getElementById("tier-filter-title");
  if (tierTitleEl) tierTitleEl.textContent = `🎯 تصنيف العملاء (حسب ${bounds.shortLabel}):`;

  // Update Tier & Activity counters
  updateTierCounters(cachedCustomers);
  updateActivityCounters(cachedCustomers);

  // Re-render
  const tbody = document.getElementById("cust-tbody");
  if (tbody) renderCustomersTable(cachedCustomers, tbody);
}

export function getCustomerTierInfo(monthlySales = 0, manualTier = null) {
  const sales = Number(monthlySales) || 0;
  if (manualTier && manualTier !== "auto" && ["A", "B", "C", "D"].includes(manualTier)) {
    if (manualTier === "A") {
      return {
        key: "A",
        label: "👑 فئة A (VIP)",
        badgeClass: "tier-badge-a",
        color: "#D4AF37",
        bg: "rgba(212,175,55,0.15)",
        border: "rgba(212,175,55,0.45)",
        isManual: true,
        desc: "كبار الحسابات والشركاء (> 20,000 ر.س)",
        nextTierText: "أعلى شريحة (VIP) 👑"
      };
    } else if (manualTier === "B") {
      return {
        key: "B",
        label: "💎 فئة B (مميز)",
        badgeClass: "tier-badge-b",
        color: "#818cf8",
        bg: "rgba(99,102,241,0.15)",
        border: "rgba(99,102,241,0.45)",
        isManual: true,
        desc: "عملاء رئيسيون (10,001 - 20,000 ر.س)",
        nextTierText: `متبقي ${(Math.max(0, 20001 - sales)).toLocaleString()} ر.س للترقية إلى فئة A`
      };
    } else if (manualTier === "C") {
      return {
        key: "C",
        label: "🚀 فئة C (نمو)",
        badgeClass: "tier-badge-c",
        color: "#34d399",
        bg: "rgba(16,185,129,0.15)",
        border: "rgba(16,185,129,0.45)",
        isManual: true,
        desc: "عملاء متوسطون (5,001 - 10,000 ر.س)",
        nextTierText: `متبقي ${(Math.max(0, 10001 - sales)).toLocaleString()} ر.س للترقية إلى فئة B`
      };
    } else {
      return {
        key: "D",
        label: "📦 فئة D (تجزئة)",
        badgeClass: "tier-badge-d",
        color: "#fb923c",
        bg: "rgba(249,115,22,0.15)",
        border: "rgba(249,115,22,0.45)",
        isManual: true,
        desc: "صغار العملاء (1 - 5,000 ر.س)",
        nextTierText: `متبقي ${(Math.max(0, 5001 - sales)).toLocaleString()} ر.س للترقية إلى فئة C`
      };
    }
  }

  // Dynamic automatic calculation based on last 30 days sales
  if (sales > 20000) {
    return {
      key: "A",
      label: "👑 فئة A (VIP)",
      badgeClass: "tier-badge-a",
      color: "#D4AF37",
      bg: "rgba(212,175,55,0.15)",
      border: "rgba(212,175,55,0.45)",
      isManual: false,
      desc: "كبار الحسابات والشركاء (مسحوبات > 20,000 ر.س)",
      nextTierText: "أعلى شريحة (VIP) 👑"
    };
  } else if (sales > 10000) {
    const remaining = 20001 - sales;
    return {
      key: "B",
      label: "💎 فئة B (مميز)",
      badgeClass: "tier-badge-b",
      color: "#818cf8",
      bg: "rgba(99,102,241,0.15)",
      border: "rgba(99,102,241,0.45)",
      isManual: false,
      desc: "عملاء رئيسيون (10,001 - 20,000 ر.س)",
      nextTierText: `متبقي ${remaining.toLocaleString()} ر.س للترقية إلى فئة A`
    };
  } else if (sales > 5000) {
    const remaining = 10001 - sales;
    return {
      key: "C",
      label: "🚀 فئة C (نمو)",
      badgeClass: "tier-badge-c",
      color: "#34d399",
      bg: "rgba(16,185,129,0.15)",
      border: "rgba(16,185,129,0.45)",
      isManual: false,
      desc: "عملاء متوسطون (5,001 - 10,000 ر.س)",
      nextTierText: `متبقي ${remaining.toLocaleString()} ر.س للترقية إلى فئة B`
    };
  } else if (sales > 0) {
    const remaining = 5001 - sales;
    return {
      key: "D",
      label: "📦 فئة D (تجزئة)",
      badgeClass: "tier-badge-d",
      color: "#fb923c",
      bg: "rgba(249,115,22,0.15)",
      border: "rgba(249,115,22,0.45)",
      isManual: false,
      desc: "صغار العملاء (1 - 5,000 ر.س)",
      nextTierText: `متبقي ${remaining.toLocaleString()} ر.س للترقية إلى فئة C`
    };
  } else {
    return {
      key: "inactive",
      label: "⚪ غير نشط",
      badgeClass: "tier-badge-inactive",
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.12)",
      border: "rgba(148,163,184,0.3)",
      isManual: false,
      desc: "بلا مسحوبات خلال آخر 30 يوماً",
      nextTierText: "يحتاج لشراء 1 ر.س لدخول فئة D"
    };
  }
}

function getCustomerDateStr(c) {
  if (!c) return "—";
  if (c.createdAt) {
    if (c.createdAt.toDate) return c.createdAt.toDate().toISOString().split("T")[0];
    if (c.createdAt.seconds) return new Date(c.createdAt.seconds * 1000).toISOString().split("T")[0];
    if (typeof c.createdAt === "string") return c.createdAt.slice(0, 10);
  }
  if (c.createdDate) return String(c.createdDate).slice(0, 10);
  if (c.dateAdded) return String(c.dateAdded).slice(0, 10);
  if (c.date) return String(c.date).slice(0, 10);
  return "—";
}

function getCustomerTimestamp(c) {
  if (!c) return 0;
  if (c.createdAt?.toDate) return c.createdAt.toDate().getTime();
  if (c.createdAt?.seconds) return c.createdAt.seconds * 1000;
  if (typeof c.createdAt === "string") {
    const t = new Date(c.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (c.createdDate) {
    const t = new Date(c.createdDate).getTime();
    if (!isNaN(t)) return t;
  }
  if (c.dateAdded) {
    const t = new Date(c.dateAdded).getTime();
    if (!isNaN(t)) return t;
  }
  if (c.date) {
    const t = new Date(c.date).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

function renderCustomerRowsHtml(docs) {
  return docs.map(c => {
    const cs = getCreditStatus(c.balance || 0, c.creditLimit || 0);
    const cDate = getCustomerDateStr(c);
    const tier = c.tier || getCustomerTierInfo(c.monthlySales || 0, c.tierOverride);
    const act = getCustomerActivityInfo(c.name);
    const mSales = c.monthlySales || 0;

    return `<tr>
      <td>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <div class="font-semibold font-heading" 
               style="color:var(--brand); cursor:pointer; text-decoration:underline; font-weight:800;" 
               onclick="window.showCustomerIntelligence('${c.id}', '${c.name.replace(/'/g, "\\'")}')"
               title="🧠 عرض لوحة ذكاء العميل والتحليل الإحصائي">
            ${c.name}
          </div>
          <span class="activity-badge" style="background:${act.bg}; color:${act.color}; border:1px solid ${act.color}45; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:700;" title="النشاط المقدر من الاسم: ${act.label}">
            ${act.icon} ${act.label}
          </span>
          <span class="tier-badge ${tier.badgeClass}" title="${tier.desc}">
            ${tier.label} ${tier.isManual ? '🔒' : ''}
          </span>
        </div>
        <div style="font-size:11px;color:var(--text-2);display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:2px;">
          <span class="mono">${c.code||""}</span>
          ${cDate !== "—" ? `<span style="font-size:10px;color:var(--text-2);background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;" title="تاريخ إضافة العميل">📅 ${cDate}</span>` : ""}
          ${c.hasBrokerCommission ? `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px; cursor:pointer;" onclick="event.stopPropagation(); navigate('broker-statement');" title="كشف حساب الوسيط">💼 وسيط: ${c.brokerName || 'زياد'} (${c.brokerRate || 1}%)</span>` : ''}
          ${(c.status === "pending_approval" || c.approvalStatus === "pending") ? `<span class="badge" style="background:#fffbeb; color:#d97706; border:1px solid #fde68a; font-weight:800; font-size:10px;">🟡 بانتظار الاعتماد المالي</span>` : ''}
          ${Array.isArray(c.attachments) && c.attachments.length > 0 ? `
            <button type="button" class="btn btn-sm" style="background:#0284c7; color:#fff; border:none; padding:2px 8px; border-radius:6px; font-weight:800; font-size:10.5px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 4px rgba(2,132,199,0.35);" onclick="window.openCustomerAttachmentsModal('${c.id}')" title="عرض وفحص المستندات الرسمية المرفوعة للعميل">
              📁 المستندات (${c.attachments.length})
            </button>
          ` : ''}
        </div>
      </td>
      <td class="mono dim" style="white-space:nowrap;">
        ${cDate !== "—" ? `<span class="badge neutral mono" style="font-size:11px;font-weight:600;">📅 ${cDate}</span>` : "—"}
      </td>
      <td style="white-space:nowrap;">
        <div class="mono font-bold" style="color:${tier.color}; font-size:12.5px;">
          ${formatCurrency(mSales)}
        </div>
        <div class="dim" style="font-size:10px;" title="${tier.nextTierText}">
          ${tier.nextTierText}
        </div>
      </td>
      <td class="mono dim">${c.phone || "—"}</td>
      <td class="dim">${c.zone || "—"}</td>
      <td class="dim">${c.repName || "—"}</td>
      <td class="mono ${c.balance > 0 ? "text-bad" : "text-good"}">${formatCurrency(c.balance || 0)}</td>
      <td class="mono">${formatCurrency(c.creditLimit || 0)}</td>
      <td style="min-width:110px;">
        ${c.creditLimit > 0 ? `
        <div class="credit-meter">
          <div class="meter-label">
            <span style="font-size:10px;" class="text-${cs.color}">${cs.label}</span>
            <span style="font-size:10px;" class="mono">${cs.pct.toFixed(0)}%</span>
          </div>
          <div class="progress-bar">
            <div class="fill ${cs.color}" style="width:${cs.pct}%;"></div>
          </div>
        </div>` : '<span class="text-2" style="font-size:11px;">بلا حد</span>'}
      </td>
      <td><span class="badge neutral" style="font-size:10px;">${c.priceList === "wholesale" ? "الجملة" : c.priceList === "retail" ? "التجزئة" : "الأساسي"}</span></td>
      <td>
        <div class="row-actions">
          ${(c.status === "pending_approval" || c.approvalStatus === "pending") ? `<button class="btn btn-icon sm" style="background:#059669; color:#fff; font-weight:bold; box-shadow:0 2px 8px rgba(5,150,105,0.4);" onclick="window.approveSalesManagerCustomer('${c.id}', '${c.name.replace(/'/g, "\\'")}')" title="اعتماد العميل وتفعيل حسابه بالشجرة">✅</button>` : ''}
          ${Array.isArray(c.attachments) && c.attachments.length > 0 ? `<button class="btn btn-icon sm" style="background:#0284c7; color:#fff; border:1px solid #0369a1; font-weight:bold; box-shadow:0 1px 4px rgba(2,132,199,0.3);" onclick="window.openCustomerAttachmentsModal('${c.id}')" title="عرض الأوراق والمستندات الرسمية (KYC)">📁</button>` : ''}
          <button class="btn btn-icon sm btn-ghost" onclick="previewCustomer('${c.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editCustomer('${c.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm" style="background:rgba(30,58,138,.12);color:#1E3A8A;border:1px solid rgba(30,58,138,.3);" onclick="openCustomerAgreement('${c.id}')" title="اتفاقية فتح / تحديث حساب">📝</button>
          <button class="btn btn-icon sm btn-ghost" onclick="printCustomer('${c.id}')" title="طباعة">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="exportCustomerPDF('${c.id}')" title="PDF">📄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCustomerStatement('${c.id}','${c.name.replace(/'/g, "\\'")}')" title="كشف حساب">📊</button>
          ${c.hasBrokerCommission ? `<button class="btn btn-icon sm" style="background:rgba(2,132,199,.15);color:#0284c7;border:1px solid rgba(2,132,199,.35);" onclick="navigate('broker-statement')" title="كشف حساب عمولات الوسيط (${c.brokerName || 'زياد'})">💼</button>` : ''}
          <button class="btn btn-icon sm" style="background:rgba(3,105,161,.12);color:#0284c7;border:1px solid rgba(3,105,161,.3);" onclick="issueTrustReceiptFromCustomers('${c.id}')" title="إصدار سند أمانة وعهدة مالية (م/79)">🛡️</button>
          <button class="btn btn-icon sm" style="background:rgba(220,38,38,.10);color:#DC2626;border:1px solid rgba(220,38,38,.25);" onclick="issueDebtAckFromCustomers('${c.id}')" title="إقرار مديونية وتعهد سداد">⚖️</button>
          <button class="btn btn-icon sm" style="background:rgba(124,58,237,.10);color:#7C3AED;border:1px solid rgba(124,58,237,.2);" onclick="issuePromissoryNote('${c.id}','${c.name.replace(/'/g, "\\'")}')" title="إصدار سند أمر">📜</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCustomer('${c.id}','${c.name.replace(/'/g, "\\'")}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

window.viewCustomerStatement = (id, name) => {
  if (window.navigate) {
    window.navigate("customer-statement");
    setTimeout(() => {
      if (window.selectStmtCustomer) window.selectStmtCustomer(id);
    }, 300);
  }
};

window.setCustomerTierFilter = (tier) => {
  currentTierFilter = tier;
  document.querySelectorAll(".tier-filter-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(`tier-btn-${tier}`);
  if (btn) btn.classList.add("active");
  const tbody = document.getElementById("cust-tbody");
  if (tbody && cachedCustomers.length > 0) {
    renderCustomersTable(cachedCustomers, tbody);
  }
};

export async function render(container, user) {
  const hasCache = cachedCustomers && cachedCustomers.length > 0;

  container.innerHTML = `
    <style>
      .tier-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700;
        white-space: nowrap; line-height: 1.2;
      }
      .tier-badge-a { background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(245,215,110,0.1) 100%); color: #F5D76E; border: 1px solid rgba(212,175,55,0.45); box-shadow: 0 0 8px rgba(212,175,55,0.2); }
      .tier-badge-b { background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.1) 100%); color: #A5B4FC; border: 1px solid rgba(99,102,241,0.45); }
      .tier-badge-c { background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.45); }
      .tier-badge-d { background: linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,146,60,0.1) 100%); color: #FDBA74; border: 1px solid rgba(249,115,22,0.45); }
      .tier-badge-inactive { background: rgba(148,163,184,0.12); color: #94A3B8; border: 1px solid rgba(148,163,184,0.3); }

      .tier-filter-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
        border: 1px solid var(--border-soft); background: var(--bg-1); color: var(--text-2);
        cursor: pointer; transition: all 0.2s ease;
      }
      .tier-filter-btn:hover { background: var(--bg-3); color: var(--text-1); }
      .tier-filter-btn.active { background: var(--brand); color: #fff !important; border-color: var(--brand) !important; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }

      .activity-filter-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
        border: 1px solid var(--border-soft); background: var(--bg-1); color: var(--text-2);
        cursor: pointer; transition: all 0.2s ease;
      }
      .activity-filter-btn:hover { background: var(--bg-3); color: var(--text-1); }
      .activity-filter-btn.active { background: #0284c7; color: #fff !important; border-color: #0284c7 !important; box-shadow: 0 2px 8px rgba(2,132,199,0.3); }
    </style>

    <div class="filterbar">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="cust-search" class="input" placeholder="🔍  بحث في العملاء والأنشطة…" />
      </div>
      <div class="filter-select-group">
        <label>فترة المسحوبات</label>
        <select id="cust-period-filter" onchange="window.changeCustomerSalesPeriod(this.value)">
          <option value="last30" selected>آخر ٣٠ يوماً</option>
          <option value="currentMonth">الشهر الحالي (أكتوبر)</option>
          <option value="lastMonth">الشهر السابق (سبتمبر)</option>
          <option value="allTime">كامل الفترة (كل المبيعات)</option>
          <option value="custom">📅 فترة مخصصة…</option>
        </select>
      </div>
      <div class="filter-select-group" id="cust-custom-dates" style="display:none; flex-direction:row; align-items:flex-end; gap:6px;">
        <div>
          <label style="font-size:10px;">من تاريخ</label>
          <input type="date" id="cust-from-date" class="input sm" style="font-size:11px; padding:3px 6px;" onchange="window.recalcCustomerPeriodSales()" />
        </div>
        <div>
          <label style="font-size:10px;">إلى تاريخ</label>
          <input type="date" id="cust-to-date" class="input sm" style="font-size:11px; padding:3px 6px;" onchange="window.recalcCustomerPeriodSales()" />
        </div>
      </div>
      <div class="filter-select-group">
        <label>نشاط العميل</label>
        <select id="cust-activity-filter" onchange="window.onCustomerActivitySelectChange(this.value)">
          <option value="all">كل الأنشطة</option>
          <option value="restaurant">🍽️ مطاعم وإعاشة</option>
          <option value="catering">🏪 تموينات وأسواق</option>
          <option value="grocery">🛒 بقالات</option>
          <option value="hotel">🏨 فنادق وإيواء</option>
          <option value="cafe">☕ كافيهات ومقاهي</option>
          <option value="other">🏢 تجارية وأخرى</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المنطقة</label>
        <select id="cust-zone-filter" onchange="window.filterCustomersList()">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="cust-rep-filter" onchange="window.filterCustomersList()">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الائتمان</label>
        <select id="cust-credit-filter" onchange="window.filterCustomersList()">
          <option value="">الكل</option>
          <option value="ok">طبيعي</option>
          <option value="warn">قارب الحد</option>
          <option value="bad">تجاوز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export" style="background:#1e3a8a;color:#fff;" onclick="window.openBlankCustomerAgreement()" title="طباعة نموذج اتفاقية فتح حساب رسمي فارغ"><span>📑</span> اتفاقية فارغة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','العملاء')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportCustomersExcel()" title="تصدير Excel بجميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openCustomerImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn-export" style="background:#7C3AED;color:#fff;" onclick="runCustomerCoaMigration()" title="ربط العملاء بشجرة الحسابات حسب مندوبيهم (مرة واحدة فقط)" id="btn-migrate-coa"><span>🔗</span> ترحيل ذمم العملاء</button>
        <a href="sales-manager.html" target="_blank" class="btn-export" style="background:#0284c7;color:#fff;text-decoration:none;" title="فتح بوابة مدير المبيعات الميدانية"><span>💼</span> بوابة مدير المبيعات</a>
        <button class="btn btn-primary" onclick="openCustomerModal()">+ إضافة عميل</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Business Activity Quick Filter Pills -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:10px; background:var(--bg-1); padding:10px 14px; border-radius:12px; border:1px solid var(--border-soft);">
        <span style="font-weight:800; font-size:12px; color:var(--text-1); margin-left:4px;">🏢 نشاط العميل (مشتق من الاسم):</span>
        <button class="activity-filter-btn active" id="act-btn-all" onclick="window.setCustomerActivityFilter('all')">🌟 كل الأنشطة (<span id="acount-all">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-restaurant" onclick="window.setCustomerActivityFilter('restaurant')" style="border-color:rgba(234,88,12,0.3); color:#ea580c;">🍽️ مطاعم وإعاشة (<span id="acount-restaurant">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-catering" onclick="window.setCustomerActivityFilter('catering')" style="border-color:rgba(2,132,199,0.3); color:#0284c7;">🏪 تموينات وأسواق (<span id="acount-catering">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-grocery" onclick="window.setCustomerActivityFilter('grocery')" style="border-color:rgba(22,163,74,0.3); color:#16a34a;">🛒 بقالات (<span id="acount-grocery">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-hotel" onclick="window.setCustomerActivityFilter('hotel')" style="border-color:rgba(124,58,237,0.3); color:#7c3aed;">🏨 فنادق وإيواء (<span id="acount-hotel">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-cafe" onclick="window.setCustomerActivityFilter('cafe')" style="border-color:rgba(180,83,9,0.3); color:#b45309;">☕ كافيهات ومقاهي (<span id="acount-cafe">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-other" onclick="window.setCustomerActivityFilter('other')" style="color:#64748b;">🏢 تجارية وأخرى (<span id="acount-other">0</span>)</button>
      </div>

      <!-- Tier Quick Filter Pills -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:12px; border:1px solid var(--border-soft);">
        <span style="font-weight:800; font-size:12px; color:var(--text-1); margin-left:4px;" id="tier-filter-title">🎯 تصنيف العملاء (حسب مسحوبات ٣٠ يوماً):</span>
        <button class="tier-filter-btn active" id="tier-btn-all" onclick="window.setCustomerTierFilter('all')">🌟 الكل (<span id="tcount-all">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-pending" onclick="window.setCustomerTierFilter('pending')" style="border-color:#f59e0b; color:#d97706; background:#fffbeb;">🟡 بانتظار الاعتماد (<span id="tcount-pending">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-kyc" onclick="window.setCustomerTierFilter('kyc')" style="border-color:#0284c7; color:#0284c7; background:#f0f9ff; font-weight:800;">📁 بمرفقات KYC (<span id="tcount-kyc">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-A" onclick="window.setCustomerTierFilter('A')" style="border-color:rgba(212,175,55,0.4); color:#D4AF37;">👑 فئة A (> 20 ألف) (<span id="tcount-A">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-B" onclick="window.setCustomerTierFilter('B')" style="border-color:rgba(99,102,241,0.4); color:#818CF8;">💎 فئة B (10 - 20 ألف) (<span id="tcount-B">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-C" onclick="window.setCustomerTierFilter('C')" style="border-color:rgba(16,185,129,0.4); color:#34D399;">🚀 فئة C (5 - 10 آلاف) (<span id="tcount-C">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-D" onclick="window.setCustomerTierFilter('D')" style="border-color:rgba(249,115,22,0.4); color:#FB923C;">📦 فئة D (1 - 5 آلاف) (<span id="tcount-D">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-inactive" onclick="window.setCustomerTierFilter('inactive')" style="color:#94A3B8;">⚪ غير نشط (0) (<span id="tcount-inactive">0</span>)</button>
      </div>

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">العملاء</h1>
          <p class="page-subtitle" id="cust-count">${hasCache ? `${cachedCustomers.length} عميل` : ''}</p>
        </div>
        <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
          <button class="btn btn-secondary btn-icon sm" id="cust-refresh-btn" onclick="refreshCustomers()" title="تحديث البيانات" style="font-size:13px;padding:6px 12px;">🔄  تحديث</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>اسم العميل والنشاط والشريحة</th>
              <th style="cursor:pointer; user-select:none; white-space:nowrap;" onclick="window.toggleCustomerDateSort()" title="اضغط للترتيب حسب تاريخ الإضافة">
                <div style="display:inline-flex; align-items:center; gap:6px; color:var(--brand); font-weight:700;">
                  <span>تاريخ الإضافة</span>
                  <span id="cust-date-sort-icon" style="font-size:11px; background:rgba(59,130,246,0.12); color:#2563EB; padding:1px 6px; border-radius:4px; border:1px solid rgba(59,130,246,0.25);">
                    ${custSortDir === 'desc' ? '⬇️ الأحدث' : '⬆️ الأقدم'}
                  </span>
                </div>
              </th>
              <th id="th-sales-period">مسحوبات (آخر ٣٠ يوماً)</th>
              <th>الهاتف</th><th>المنطقة</th>
              <th>المندوب</th><th>الرصيد الحالي</th><th>حد الائتمان</th>
              <th>استخدام الائتمان</th><th>قائمة الأسعار</th><th></th>
            </tr></thead>
            <tbody id="cust-tbody">
              ${hasCache ? renderCustomerRowsHtml(cachedCustomers) : `
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" id="customer-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="cust-modal-title">إضافة عميل جديد</h3>
          <button class="modal-close" onclick="closeModal('customer-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cust-edit-id" />
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group" style="grid-column:span 2;">
              <label>اسم العميل *</label>
              <input type="text" id="cust-name" class="input" />
            </div>
            <div class="form-group">
              <label>كود العميل</label>
              <input type="text" id="cust-code" class="input mono" placeholder="CUST-001" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label>الهاتف</label>
              <input type="tel" id="cust-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>الرقم الضريبي (VAT)</label>
              <input type="text" id="cust-vat" class="input mono" placeholder="300000000000003" />
            </div>
            <div class="form-group">
              <label>الهوية الوطنية / السجل</label>
              <input type="text" id="cust-national-id" class="input mono" placeholder="1XXXXXXXXX" />
            </div>
            <div class="form-group">
              <label>المنطقة/المسار</label>
              <input type="text" id="cust-zone" class="input" placeholder="الرياض — شمال" />
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>حد الائتمان (ر.س)</label>
              <input type="number" id="cust-credit-limit" class="input mono" step="100" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label>أيام الائتمان (مهلة السداد)</label>
              <input type="number" id="cust-credit-days" class="input mono" min="0" placeholder="30" />
            </div>
            <div class="form-group">
              <label>المندوب المسؤول</label>
              <select id="cust-rep">
                <option value="">اختر المندوب</option>
              </select>
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>قائمة الأسعار</label>
              <select id="cust-price-list">
                <option value="default">السعر الأساسي</option>
                <option value="wholesale">الجملة</option>
                <option value="retail">التجزئة</option>
              </select>
            </div>
            <div class="form-group">
              <label>تصنيف الشريحة (يدوي / تلقائي)</label>
              <select id="cust-tier-override" class="input">
                <option value="auto">تلقائي (حسب المسحوبات الشهرية)</option>
                <option value="A">👑 فئة A (VIP — أكثر من 20,000 ر.س)</option>
                <option value="B">💎 فئة B (مميز — 10,001 إلى 20,000 ر.س)</option>
                <option value="C">🚀 فئة C (نمو — 5,001 إلى 10,000 ر.س)</option>
                <option value="D">📦 فئة D (تجزئة — 1 إلى 5,000 ر.س)</option>
              </select>
            </div>
            <div class="form-group">
              <label>يوم التوزيع المعتاد</label>
              <select id="cust-delivery-day" class="input">
                <option value="">-- اختر اليوم --</option>
                <option value="السبت">السبت</option>
                <option value="الأحد">الأحد</option>
                <option value="الاثنين">الاثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
              </select>
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>خط السير / المسار</label>
              <input type="text" id="cust-route-group" class="input" placeholder="مسار ينبع الصناعية" />
            </div>
            <div class="form-group">
              <label>رابط موقع العميل على خرائط جوجل (Google Maps URL)</label>
              <input type="url" id="cust-maps-url" class="input mono" placeholder="https://maps.google.com/?q=..." />
            </div>
          </div>

          <!-- Saudi National Address Section (مطابقة هيئة الزكاة والضريبة) -->
          <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:10px; padding:14px; margin-bottom:16px;">
            <div style="font-weight:800; font-size:13px; color:var(--brand); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <span>📍 العنوان الوطني المعتمد للعميل (ZATCA National Address):</span>
            </div>
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label>اسم الشارع (Street Name)</label>
                <input type="text" id="cust-street" class="input" placeholder="الامير مقرن بن عبد العزيز" />
              </div>
              <div class="form-group">
                <label>الحي (District)</label>
                <input type="text" id="cust-district" class="input" placeholder="حي العقيق" />
              </div>
              <div class="form-group">
                <label>المدينة (City)</label>
                <input type="text" id="cust-city" class="input" placeholder="الرياض / ينبع / المدينة" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
              <div class="form-group">
                <label>رقم المبنى (Building No)</label>
                <input type="text" id="cust-building-no" class="input mono" placeholder="7480" maxlength="8" />
              </div>
              <div class="form-group">
                <label>الرمز البريدي (Postal Code)</label>
                <input type="text" id="cust-postal-code" class="input mono" placeholder="12345" maxlength="5" />
              </div>
              <div class="form-group">
                <label>الرقم الإضافي (Additional No)</label>
                <input type="text" id="cust-additional-no" class="input mono" placeholder="3180" maxlength="4" />
              </div>
              <div class="form-group">
                <label>الدولة (Country)</label>
                <input type="text" id="cust-country" class="input" value="المملكة العربية السعودية" />
              </div>
            </div>
          </div>

          <!-- عمولة الوسيط والمندوب الخارجي (اختياري) -->
          <div class="card mb-16" style="padding:12px 14px; background:rgba(2,132,199,0.04); border:1.2px solid rgba(2,132,199,0.25); border-radius:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:12.5px; font-weight:900; color:#0284c7; display:flex; align-items:center; gap:6px;">
                <span>💼</span>
                <span>عمولة الوسيط التجاري / المندوب الخارجي (اختياري)</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="checkbox" id="cust-has-broker" onchange="window.toggleBrokerFields(this.checked)" style="width:16px;height:16px;cursor:pointer;" />
                <label for="cust-has-broker" style="margin-bottom:0; cursor:pointer; font-weight:800; font-size:12px; color:#004d80;">تفعيل عمولة وسيط لهذا العميل</label>
              </div>
            </div>
            <div id="cust-broker-fields" style="display:none; grid-template-columns:1.5fr 1fr 1.5fr; gap:10px; margin-top:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">اسم الوسيط / المستفيد *</label>
                <input type="text" id="cust-broker-name" class="input font-bold" placeholder="مثال: زياد" value="زياد" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">نسبة العمولة المضافة (%) *</label>
                <input type="number" id="cust-broker-rate" class="input mono font-bold" value="1.0" step="0.1" min="0" max="50" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">شرط الاستحقاق والترحيل *</label>
                <select id="cust-broker-trigger" class="input">
                  <option value="on_invoice" selected>فور إصدار الفاتورة (الاستحقاق الفوري المباشر)</option>
                  <option value="on_payment">عند سداد العميل للفاتورة</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group mb-16" id="cust-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cust-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cust-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div class="form-group">
            <label>ملاحظات</label>
            <textarea id="cust-notes" class="input" rows="2"></textarea>
          </div>
          <div id="cust-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('customer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCustomer()" id="save-cust-btn">حفظ</button>
        </div>
      </div>
    </div>`;

  const searchInput = container.querySelector("#cust-search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => window.filterCustomersList(), 200));
  }
  await Promise.all([loadRepsFilter(), loadCustomers()]);
}

async function loadRepsFilter() {
  try {
    const reps = await getAll(COLS.salesReps(), [orderBy("name")]);
    const sel = document.getElementById("cust-rep-filter");
    const repSel = document.getElementById("cust-rep");
    reps.forEach(r => {
      if (sel) sel.innerHTML += `<option value="${r.id}">${r.name}</option>`;
      if (repSel) repSel.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
  } catch {}
}

function updateTierCounters(custs) {
  const countAll = custs.length;
  const countA   = custs.filter(c => c.tier?.key === 'A').length;
  const countB   = custs.filter(c => c.tier?.key === 'B').length;
  const countC   = custs.filter(c => c.tier?.key === 'C').length;
  const countD   = custs.filter(c => c.tier?.key === 'D').length;
  const countInact = custs.filter(c => c.tier?.key === 'inactive').length;
  const countPending = custs.filter(c => c.status === 'pending_approval' || c.approvalStatus === 'pending').length;
  const countKyc = custs.filter(c => Array.isArray(c.attachments) && c.attachments.length > 0).length;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('tcount-all', countAll);
  setEl('tcount-pending', countPending);
  setEl('tcount-kyc', countKyc);
  setEl('tcount-A', countA);
  setEl('tcount-B', countB);
  setEl('tcount-C', countC);
  setEl('tcount-D', countD);
  setEl('tcount-inactive', countInact);
}

function updateActivityCounters(custs) {
  const list = custs || cachedCustomers || [];
  const counts = { all: list.length, restaurant: 0, catering: 0, grocery: 0, hotel: 0, cafe: 0, other: 0 };
  list.forEach(c => {
    const act = getCustomerActivityInfo(c.name);
    if (counts[act.key] !== undefined) counts[act.key]++;
    else counts.other++;
  });

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl("acount-all", counts.all);
  setEl("acount-restaurant", counts.restaurant);
  setEl("acount-catering", counts.catering);
  setEl("acount-grocery", counts.grocery);
  setEl("acount-hotel", counts.hotel);
  setEl("acount-cafe", counts.cafe);
  setEl("acount-other", counts.other);
}

async function loadCustomers(reset = false) {
  const tbody = document.getElementById("cust-tbody");
  if (!tbody) return;

  if (cachedCustomers.length === 0) {
    tbody.innerHTML = `${Array(5).fill(0).map(() => `
                  <tr class="skeleton-row">
                    ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`;
  }

  try {
    const d35 = new Date(Date.now() - 35 * 86400000).toISOString().slice(0, 10);
    _cachedInvoicesEarliestDate = d35;
    const [custs, invoices] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name"), limit(1000)]),
      getAll(COLS.salesInvoices(), [where("date", ">=", d35)]).catch(() => [])
    ]);

    cachedCustomers = custs || [];
    cachedInvoices = invoices || [];

    // تعبئة خيارات فلتر المناطق تلقائياً
    const zoneSel = document.getElementById("cust-zone-filter");
    if (zoneSel && zoneSel.options.length <= 1) {
      const curZone = zoneSel.value;
      const zones = [...new Set(cachedCustomers.map(c => (c.zone || "").trim()).filter(Boolean))].sort();
      zones.forEach(z => {
        zoneSel.innerHTML += `<option value="${z}">${z}</option>`;
      });
      if (curZone) zoneSel.value = curZone;
    }

    applyCustomerSalesPeriod(currentSalesPeriod, customSalesFrom, customSalesTo);
  } catch (err) {
    console.error("loadCustomers error:", err);
    tbody.innerHTML = `<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.changeCustomerSalesPeriod = (val) => {
  const customBox = document.getElementById("cust-custom-dates");
  if (val === "custom") {
    if (customBox) customBox.style.display = "inline-flex";
    const fromVal = document.getElementById("cust-from-date")?.value || "";
    const toVal = document.getElementById("cust-to-date")?.value || "";
    if (fromVal) applyCustomerSalesPeriod("custom", fromVal, toVal);
  } else {
    if (customBox) customBox.style.display = "none";
    applyCustomerSalesPeriod(val);
  }
};

window.recalcCustomerPeriodSales = () => {
  const fromVal = document.getElementById("cust-from-date")?.value || "";
  const toVal = document.getElementById("cust-to-date")?.value || "";
  if (fromVal) applyCustomerSalesPeriod("custom", fromVal, toVal);
};

window.setCustomerActivityFilter = (actKey) => {
  currentActivityFilter = actKey;
  document.querySelectorAll(".activity-filter-btn").forEach(btn => btn.classList.remove("active"));
  const btn = document.getElementById(`act-btn-${actKey}`);
  if (btn) btn.classList.add("active");
  const actSelect = document.getElementById("cust-activity-filter");
  if (actSelect) actSelect.value = actKey;
  filterCustomersList();
};

window.onCustomerActivitySelectChange = (val) => {
  currentActivityFilter = val;
  document.querySelectorAll(".activity-filter-btn").forEach(btn => btn.classList.remove("active"));
  const btn = document.getElementById(`act-btn-${val}`);
  if (btn) btn.classList.add("active");
  filterCustomersList();
};

window.setCustomerTierFilter = (tierKey) => {
  currentTierFilter = tierKey;
  document.querySelectorAll(".tier-filter-btn").forEach(btn => btn.classList.remove("active"));
  const btn = document.getElementById(`tier-btn-${tierKey}`);
  if (btn) btn.classList.add("active");
  filterCustomersList();
};

window.filterCustomersList = () => {
  const tbody = document.getElementById("cust-tbody");
  if (!tbody) return;
  if (!cachedCustomers || cachedCustomers.length === 0) {
    loadCustomers();
    return;
  }
  renderCustomersTable(cachedCustomers, tbody);
};

window.refreshCustomers = async () => {
  const btn = document.getElementById("cust-refresh-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ جاري…"; }
  cachedCustomers = []; 
  cachedInvoices = [];
  if (window.ERP_CACHE) {
    for (const key of Object.keys(window.ERP_CACHE)) {
      if (key.includes("customers") || key.includes("salesInvoices")) delete window.ERP_CACHE[key];
    }
  }
  await loadCustomers(true);
  if (btn) { btn.disabled = false; btn.textContent = "🔄  تحديث"; }
};

window.toggleCustomerDateSort = () => {
  if (custSortField !== "date") {
    custSortField = "date";
    custSortDir = "desc";
  } else {
    custSortDir = (custSortDir === "desc") ? "asc" : "desc";
  }
  const icon = document.getElementById("cust-date-sort-icon");
  if (icon) {
    icon.textContent = custSortDir === "desc" ? "⬇️ الأحدث" : "⬆️ الأقدم";
  }
  const tbody = document.getElementById("cust-tbody");
  if (tbody && cachedCustomers.length > 0) {
    renderCustomersTable(cachedCustomers, tbody);
  }
};

function renderCustomersTable(custs, tbody) {
  if (!tbody) tbody = document.getElementById("cust-tbody");
  if (!tbody) return;

  let filtered = [...(custs || cachedCustomers || [])];
  
  // Search query with Arabic Normalization & multi-token matching
  const searchVal = document.getElementById("cust-search")?.value?.trim();
  if (searchVal) {
    filtered = filtered.filter(c => {
      const act = getCustomerActivityInfo(c.name);
      return matchArabicSearch(c.name || "", searchVal) ||
             (c.code || "").toLowerCase().includes(searchVal.toLowerCase()) ||
             matchArabicSearch(c.repName || "", searchVal) ||
             matchArabicSearch(c.zone || "", searchVal) ||
             (c.phone || "").includes(searchVal) ||
             (c.vatNumber || "").includes(searchVal) ||
             (c.nationalId || c.crNumber || "").includes(searchVal) ||
             matchArabicSearch(act.label || "", searchVal);
    });
  }

  const zoneF = document.getElementById("cust-zone-filter")?.value;
  if (zoneF) filtered = filtered.filter(c => c.zone === zoneF);

  // تصفية حسب المندوب بدقة (بالكود وبالاسم)
  const repF = document.getElementById("cust-rep-filter")?.value;
  if (repF) {
    const repSelect = document.getElementById("cust-rep-filter");
    const repName = repSelect?.options[repSelect.selectedIndex]?.text?.trim();
    filtered = filtered.filter(c => {
      if (c.repId === repF || c.salesRepId === repF || c.assignedRepId === repF) return true;
      if (repName && (c.repName === repName || c.salesRepName === repName)) return true;
      return false;
    });
  }

  const creditF = document.getElementById("cust-credit-filter")?.value;
  if (creditF) filtered = filtered.filter(c => getCreditStatus(c.balance || 0, c.creditLimit || 0).color === creditF);

  // Filter by Activity (مطاعم، تموينات، بقالات، فنادق، كافيهات، أخرى)
  if (currentActivityFilter && currentActivityFilter !== "all") {
    filtered = filtered.filter(c => getCustomerActivityInfo(c.name).key === currentActivityFilter);
  }

  // تحديث عدادات الشرائح والأنشطة فورياً لتوافق التصفية الحالية
  updateTierCounters(filtered);
  updateActivityCounters(filtered);

  // Filter by Tier
  if (currentTierFilter && currentTierFilter !== "all") {
    if (currentTierFilter === "pending") {
      filtered = filtered.filter(c => c.status === "pending_approval" || c.approvalStatus === "pending");
    } else if (currentTierFilter === "kyc") {
      filtered = filtered.filter(c => Array.isArray(c.attachments) && c.attachments.length > 0);
    } else {
      filtered = filtered.filter(c => c.tier?.key === currentTierFilter);
    }
  }

  // ── ترتيب حسب تاريخ الإضافة ──
  if (custSortField === "date") {
    filtered.sort((a, b) => {
      const tA = getCustomerTimestamp(a);
      const tB = getCustomerTimestamp(b);
      return custSortDir === "desc" ? (tB - tA) : (tA - tB);
    });
  }

  const countEl = document.getElementById("cust-count");
  if (countEl) countEl.textContent = `${filtered.length} عميل`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج تطابق خيارات البحث والتصفية</td></tr>`;
    return;
  }

  tbody.innerHTML = renderCustomerRowsHtml(filtered);
}

window.openCustomerModal = (cust = null) => {
  document.getElementById("cust-edit-id").value = cust?.id || "";
  document.getElementById("cust-modal-title").textContent = cust ? "تعديل العميل" : "إضافة عميل جديد";
  document.getElementById("cust-name").value = cust?.name || "";
  document.getElementById("cust-code").value = cust?.code || "";
  document.getElementById("cust-phone").value = cust?.phone || "";
  document.getElementById("cust-vat").value = cust?.vatNumber || cust?.vat || "";
  const crVal = cust?.nationalId || cust?.crNumber || cust?.cr || "";
  document.getElementById("cust-national-id").value = crVal;
  document.getElementById("cust-zone").value = cust?.zone || "";

  // Structured National Address Fields
  document.getElementById("cust-street").value = cust?.street || "";
  document.getElementById("cust-district").value = cust?.district || "";
  document.getElementById("cust-city").value = cust?.city || "";
  document.getElementById("cust-building-no").value = cust?.buildingNo || cust?.buildingNumber || "";
  document.getElementById("cust-postal-code").value = cust?.postalCode || cust?.zip || "";
  document.getElementById("cust-additional-no").value = cust?.additionalNo || cust?.additionalNumber || "";
  document.getElementById("cust-country").value = cust?.country || "المملكة العربية السعودية";

  // Fallback parsing if old unstructured address exists
  if (!cust?.street && !cust?.district && cust?.address) {
    const rawAddr = cust.address;
    if (rawAddr.includes("حي")) {
      const parts = rawAddr.split(/[-—,]/).map(p => p.trim());
      parts.forEach(p => {
        if (p.includes("حي")) document.getElementById("cust-district").value = p;
        else if (p.includes("شارع") || p.includes("الشارع")) document.getElementById("cust-street").value = p;
        else if (!document.getElementById("cust-street").value) document.getElementById("cust-street").value = p;
      });
    } else {
      document.getElementById("cust-street").value = rawAddr;
    }
  }

  document.getElementById("cust-notes").value = cust?.notes || "";

  document.getElementById("cust-delivery-day").value = cust?.deliveryDay || "";
  document.getElementById("cust-route-group").value  = cust?.routeGroup  || "";
  document.getElementById("cust-maps-url").value     = cust?.googleMapsUrl || "";
  document.getElementById("cust-credit-limit").value = cust?.creditLimit || "";
  document.getElementById("cust-credit-days").value  = cust?.creditDays  || "";
  document.getElementById("cust-rep").value          = cust?.repId       || "";
  document.getElementById("cust-price-list").value   = cust?.priceList   || "default";
  document.getElementById("cust-tier-override").value = cust?.tierOverride || cust?.manualTier || "auto";
  document.getElementById("cust-form-error").classList.add("hidden");

  // Handle Broker Commission settings
  const hasBroker = !!cust?.hasBrokerCommission;
  const brokerCheck = document.getElementById("cust-has-broker");
  if (brokerCheck) brokerCheck.checked = hasBroker;
  const brokerFields = document.getElementById("cust-broker-fields");
  if (brokerFields) brokerFields.style.display = hasBroker ? "grid" : "none";
  const bNameEl = document.getElementById("cust-broker-name");
  if (bNameEl) bNameEl.value = cust?.brokerName || "زياد";
  const bRateEl = document.getElementById("cust-broker-rate");
  if (bRateEl) bRateEl.value = cust?.brokerRate !== undefined ? cust.brokerRate : "1.0";
  const bTrigEl = document.getElementById("cust-broker-trigger");
  if (bTrigEl) bTrigEl.value = cust?.brokerTrigger || "on_invoice";

  // Handle COA toggle visibility
  const toggleWrap = document.getElementById("cust-coa-toggle-wrap");
  const toggle = document.getElementById("cust-coa-toggle");
  if (cust) {
    if (toggleWrap) toggleWrap.style.display = "none";
    if (toggle) toggle.checked = !!cust.accountId;
  } else {
    if (toggleWrap) toggleWrap.style.display = "flex";
    if (toggle) toggle.checked = true;
  }

  openModal("customer-modal");
};

window.toggleBrokerFields = (checked) => {
  const fields = document.getElementById("cust-broker-fields");
  if (fields) fields.style.display = checked ? "grid" : "none";
};

window.editCustomer = (id) => {
  const cust = cachedCustomers.find(c => c.id === id);
  if (cust) {
    openCustomerModal(cust);
  } else {
    import("../utils/db.js").then(async ({ getById }) => {
      try {
        const c = await getById("customers", id);
        if (c) openCustomerModal(c);
      } catch (err) { showToast(err.message, "error"); }
    });
  }
};

// ── إصدار سند أمانة وعهدة أو سند أمر مباشر من شاشة العملاء ─────
window.issueTrustReceiptFromCustomers = async (customerId) => {
  const { openTrustReceiptModal } = await import("./trust-receipts.js?v=2.4");
  openTrustReceiptModal(customerId);
};

window.issueDebtAckFromCustomers = async (customerId) => {
  const { openDebtAcknowledgmentModal } = await import("./debt-acknowledgment.js?v=2.2");
  openDebtAcknowledgmentModal(customerId);
};

window.issuePromissoryNote = async (customerId, customerName) => {
  // navigate to promissory-notes then open modal
  if (window.navigate) window.navigate("promissory-notes");
  // wait a bit for module to load then open modal
  let attempts = 0;
  const tryOpen = () => {
    attempts++;
    if (typeof window.openNewNoteModal === "function") {
      window.openNewNoteModal(customerId, customerName);
    } else if (attempts < 30) {
      setTimeout(tryOpen, 300);
    }
  };
  setTimeout(tryOpen, 600);
};

window.saveCustomer = async () => {
  const errEl = document.getElementById("cust-form-error");
  errEl.classList.add("hidden");
  const id   = document.getElementById("cust-edit-id").value;
  const name = document.getElementById("cust-name").value.trim();
  if (!name) { errEl.textContent = "اسم العميل مطلوب"; errEl.classList.remove("hidden"); return; }
  const repSel = document.getElementById("cust-rep");
  const crValue = document.getElementById("cust-national-id").value.trim();

  // Structured National Address
  const street = document.getElementById("cust-street")?.value?.trim() || "";
  const district = document.getElementById("cust-district")?.value?.trim() || "";
  const city = document.getElementById("cust-city")?.value?.trim() || "";
  const buildingNo = document.getElementById("cust-building-no")?.value?.trim() || "";
  const postalCode = document.getElementById("cust-postal-code")?.value?.trim() || "";
  const additionalNo = document.getElementById("cust-additional-no")?.value?.trim() || "";
  const country = document.getElementById("cust-country")?.value?.trim() || "المملكة العربية السعودية";

  // Build composite address string for backward compatibility
  const addrParts = [];
  if (buildingNo) addrParts.push(`رقم المبنى: ${buildingNo}`);
  if (street) addrParts.push(`الشارع: ${street}`);
  if (district) addrParts.push(`الحي: ${district}`);
  if (city) addrParts.push(`المدينة: ${city}`);
  if (postalCode) addrParts.push(`الرمز البريدي: ${postalCode}`);
  const compositeAddress = addrParts.length > 0 ? addrParts.join(" — ") : "";

  const hasBrokerCommission = document.getElementById("cust-has-broker")?.checked || false;
  const brokerName = document.getElementById("cust-broker-name")?.value?.trim() || "زياد";
  const brokerRate = parseFloat(document.getElementById("cust-broker-rate")?.value) || 1.0;
  const brokerTrigger = document.getElementById("cust-broker-trigger")?.value || "on_invoice";

  const data = {
    name, code: document.getElementById("cust-code").value.trim(),
    phone: document.getElementById("cust-phone").value.trim(),
    vatNumber: document.getElementById("cust-vat").value.trim(),
    nationalId: crValue,
    crNumber: crValue,
    zone: document.getElementById("cust-zone").value.trim(),
    creditLimit: parseFloat(document.getElementById("cust-credit-limit").value) || 0,
    creditDays:  parseInt(document.getElementById("cust-credit-days").value) || 0,
    repId:       repSel.value,
    assignedRepId: repSel.value,
    repName:     repSel.options[repSel.selectedIndex]?.text || "",
    priceList:   document.getElementById("cust-price-list").value,
    deliveryDay: document.getElementById("cust-delivery-day").value,
    tierOverride: document.getElementById("cust-tier-override")?.value || "auto",
    routeGroup:  document.getElementById("cust-route-group").value.trim(),
    googleMapsUrl: document.getElementById("cust-maps-url").value.trim(),
    hasBrokerCommission,
    brokerName,
    brokerRate,
    brokerTrigger,
    brokerAccountCode: "2-1-4-2",
    brokerExpenseCode: "5-4-10",
    street,
    district,
    city,
    buildingNo,
    buildingNumber: buildingNo,
    postalCode,
    additionalNo,
    additionalNumber: additionalNo,
    country,
    address: compositeAddress,
    notes:       document.getElementById("cust-notes").value.trim(),
  };
  if (!id) {
    data.balance = 0;
  }
  const btn = document.getElementById("save-cust-btn");
  btn.disabled = true;
  try {
    if (id) {
      const oldCust = cachedCustomers.find(c => c.id === id);
      await update("customers", id, data);
      // ✅ تحديث COA والحسابات المرتبطة
      if (oldCust) {
        const nameChanged = oldCust.name !== name;
        if (oldCust.accountId) {
          if (nameChanged) {
            await updateEntityInCoa(oldCust.accountId, name);
          }
        } else {
          // Heal missing COA reference
          const coaData = await syncEntityToCoa("customers", id, name);
          if (coaData) {
            const { id: _ignoreId, ...safeCoaData } = coaData;
            await update("customers", id, safeCoaData);
          }
        }
        if (nameChanged) {
          // ✅ تحديث الاسم في كل الفواتير والسندات والمرتجعات وعروض الأسعار والقيود
          syncCustomerNameEverywhere(id, name).catch(e =>
            console.warn("[Customers] syncCustomerNameEverywhere error:", e.message)
          );
        }
        // ✅ مزامنة رصيد COA دائماً بعد أي تعديل
        syncCustomerBalanceToCoa(id).catch(() => {});
      }
      showToast("تم تحديث العميل بنجاح", "success");
    } else {
      const skipCoa = !document.getElementById("cust-coa-toggle").checked;
      const custId = await create(COLS.customers(), data);
      if (!skipCoa) {
        try {
          // تمرير repId لإنشاء الحساب تحت مندوبه أو تحت العملاء التجاريين
          const coaData = await syncEntityToCoa("customers", custId, name, {
            repId: data.repId || null
          });
          if (coaData) {
            const { id: _ignoreId, ...safeCoaData } = coaData;
            await update("customers", custId, safeCoaData);
          }
        } catch (coaErr) {
          console.error("Failed to sync customer to COA:", coaErr);
          showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${coaErr.message}`, "error");
        }
      }
      showToast("تمت إضافة العميل بنجاح", "success");
    }
    closeModal("customer-modal");
    await loadCustomers();
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

window.deleteCustomer = async (id, name) => {
  if (!await showConfirm(`هل تريد حذف العميل "${name}" نهائياً؟`, "تأكيد الحذف")) return;
  try {
    const cust = cachedCustomers.find(c => c.id === id);
    if (cust && cust.accountId) {
      const res = await deleteEntityInCoa("customers", id, cust.accountId);
      if (res.action === "archived") {
        showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.", "warning");
        await loadCustomers();
        return;
      }
    }
    await remove("customers", id);
    showToast("تم حذف العميل بنجاح", "success");
    await loadCustomers();
  }
  catch (err) { showToast(err.message, "error"); }
};

window.viewCustomerStatement = (id, name) => {
  window._preselectedStatementEntity = { type: "customer", id };
  navigate("report-customer-statement");
};
window.exportCustomers = async () => { window.exportCustomersExcel(); };

window.exportCustomersExcel = async () => {
  try {
    const custs = cachedCustomers.length > 0 ? cachedCustomers : await getAll(COLS.customers(), [orderBy('name')]);
    showToast('جاري تجهيز ملف Excel…', 'info');
    const rows = custs.map(c => [
      c.name || '', c.code || '', getCustomerActivityInfo(c.name).label, c.phone || '', c.email || '',
      c.zone || '', c.repName || '', c.priceList || '',
      c.balance || 0, c.creditLimit || 0,
      c.paymentTerms || '', c.vatNumber || '', c.notes || ''
    ]);
    await exportToExcel({
      title: 'العملاء',
      headers: ['اسم العميل*', 'كود العميل', 'نشاط العميل', 'رقم الهاتف', 'البريد الإلكتروني',
        'المنطقة', 'المندوب', 'قائمة الأسعار',
        'الرصيد الحالي', 'حد الائتمان',
        'شروط الدفع', 'الرقم الضريبي', 'ملاحظات'],
      rows,
      colWidths: [28, 14, 18, 14, 26, 14, 18, 14, 14, 14, 14, 18, 26],
    });
    showToast(`تم تصدير ${rows.length} عميل ✅`, 'success');
  } catch (err) { showToast('خطأ: ' + err.message, 'error'); }
};

window.openCustomerImportModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'cust-import-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:680px;width:95%;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد العملاء من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('cust-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-2);border-radius:10px;padding:16px;margin-bottom:16px;font-size:12px;color:var(--text-2);line-height:1.8;">
          <strong style="color:var(--text-1);">الأعمدة المطلوبة:</strong> اسم العميل(*), كود العميل, رقم الهاتف, البريد الإلكتروني, المنطقة, المندوب, قائمة الأسعار, حد الائتمان, شروط الدفع, الرقم الضريبي, ملاحظات
        </div>
        <div id="cust-drop-zone" style="border:2px dashed var(--border-soft);border-radius:12px;padding:36px;text-align:center;cursor:pointer;"
          onclick="document.getElementById('cust-file-inp').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--brand)';"
          ondragleave="this.style.borderColor='var(--border-soft)';"
          ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';handleCustomerImport(event.dataTransfer.files[0]);">
          <div style="font-size:40px;margin-bottom:8px;">📊</div>
          <div style="font-weight:600;">اسحب ملف Excel أو انقر للاختيار</div>
          <input type="file" id="cust-file-inp" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleCustomerImport(this.files[0])">
        </div>
        <div id="cust-import-status" style="margin-top:12px;"></div>
        <div id="cust-import-preview" style="max-height:200px;overflow:auto;margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-import-overlay').remove()">إلغاء</button>
        <button class="btn" style="background:var(--bg-2);" onclick="downloadCustomerTemplate()">📥 نموذج</button>
        <button class="btn btn-primary" id="cust-import-btn" style="display:none;" onclick="executeCustImport()">✅ استيراد</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

let _custImportRows = [], _custImportHeaders = [];
window.downloadCustomerTemplate = async () => {
  await downloadTemplate({
    title: 'العملاء',
    headers: ['اسم العميل*', 'كود العميل', 'رقم الهاتف', 'البريد الإلكتروني', 'المنطقة', 'اسم المندوب', 'قائمة الأسعار', 'حد الائتمان', 'شروط الدفع', 'الرقم الضريبي', 'ملاحظات'],
    sampleRows: [['شركة المستقبل', 'C001', '0501234567', 'info@co.sa', 'الرياض', 'أحمد', 'retail', 50000, 'net30', '300xxxxxxxxxx', 'عميل مميز']],
    colWidths: [28, 14, 14, 26, 14, 18, 14, 14, 14, 18, 26],
  });
  showToast('تم تنزيل النموذج ✅', 'success');
};
window.handleCustomerImport = async (file) => {
  if (!file) return;
  try {
    const { headers, rows } = await importFromExcel(file);
    _custImportRows = rows; _custImportHeaders = headers;
    document.getElementById('cust-import-status').innerHTML =
      `<div class="alert good">✅ تم قراءة <strong>${rows.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;
    const preview = rows.slice(0,5).map(r => `<tr>${Object.values(r).slice(0,5).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('');
    document.getElementById('cust-import-preview').innerHTML = `<table class="data-dense" style="font-size:11px;"><tbody>${preview}</tbody></table>`;
    document.getElementById('cust-import-btn').style.display = '';
  } catch(e) { showToast(e.message,'error'); }
};
window.executeCustImport = async () => {
  const btn = document.getElementById('cust-import-btn');
  btn.disabled = true; btn.textContent = '⏳ جاري...';
  let added = 0, updated = 0, failed = 0;
  
  // Load existing customers and sales reps
  const [existing, reps] = await Promise.all([
    getAll(COLS.customers(), []),
    getAll(COLS.salesReps(), [])
  ]);
  
  const nameMap = {};
  existing.forEach(c => { nameMap[c.name?.trim()?.toLowerCase()] = c.id; });

  const repMap = {};
  reps.forEach(r => { repMap[r.name?.trim()?.toLowerCase()] = r.id; });

  for (const r of _custImportRows) {
    const name = String(r['اسم العميل*'] || r['اسم'] || Object.values(r)[0] || '').trim();
    if (!name) { failed++; continue; }
    
    const importedRepName = String(r['اسم المندوب'] || '').trim();
    const repId = repMap[importedRepName.toLowerCase()] || null;

    const payload = {
      name,
      code:         String(r['كود العميل'] || '').trim() || null,
      phone:        String(r['رقم الهاتف'] || '').trim() || null,
      email:        String(r['البريد الإلكتروني'] || '').trim() || null,
      zone:         String(r['المنطقة'] || '').trim() || null,
      repName:      importedRepName || null,
      repId:        repId,
      priceList:    String(r['قائمة الأسعار'] || 'retail').trim(),
      creditLimit:  parseFloat(r['حد الائتمان'] || 0) || 0,
      paymentTerms: String(r['شروط الدفع'] || 'net30').trim(),
      vatNumber:    String(r['الرقم الضريبي'] || '').trim() || null,
      notes:        String(r['ملاحظات'] || '').trim() || null,
      updatedAt:    new Date().toISOString(),
    };
    try {
      const existId = nameMap[name.toLowerCase()];
      if (existId) {
        await update("customers", existId, payload);
        updated++;
      } else {
        payload.createdAt = new Date().toISOString();
        payload.balance = 0;
        const newId = await create(COLS.customers(), payload);
        // ✅ جديد: إنشاء حساب في شجرة الحسابات لكل عميل مستورد
        syncEntityToCoa("customers", newId, name, { repId: payload.repId || null })
          .then(coaData => { if (coaData) update("customers", newId, coaData); })
          .catch(e => console.warn(`[Import] COA sync failed for ${name}:`, e.message));
        added++;
      }
    } catch(e) { failed++; }
  }
  document.getElementById('cust-import-overlay').remove();
  showToast(`✅ مضاف: ${added} | محدث: ${updated} | فاشل: ${failed}`, 'success');
  cachedCustomers = []; await loadCustomers(true);
};

// ── Preview / Print / PDF ──────────────────────────────────
function getCustomerById(id) {
  return cachedCustomers.find(c => c.id === id) || null;
}

function buildCustomerSections(c) {
  const cs = getCreditStatus(c.balance || 0, c.creditLimit || 0);
  const cDate = getCustomerDateStr(c);
  return [
    {
      heading: 'بيانات العميل',
      rows: [
        { label: 'اسم العميل', value: c.name, bold: true },
        { label: 'كود العميل', value: c.code, mono: true },
        { label: 'تاريخ الإضافة', value: cDate, mono: true },
        { label: 'رقم الهاتف', value: c.phone, mono: true },
        { label: 'البريد الإلكتروني', value: c.email },
        { label: 'المنطقة', value: c.zone },
        { label: 'المندوب', value: c.repName },
        { label: 'قائمة الأسعار', value: c.priceList === 'wholesale' ? 'الجملة' : c.priceList === 'retail' ? 'التجزئة' : 'الأساسي' },
      ]
    },
    {
      heading: 'بيانات مالية وقانونية',
      rows: [
        { label: 'الرصيد الحالي', value: formatCurrency(c.balance || 0), mono: true, bold: true },
        { label: 'حد الائتمان', value: formatCurrency(c.creditLimit || 0), mono: true },
        { label: 'نسبة استهلاك الحد', value: c.creditLimit > 0 ? `${cs.pct.toFixed(1)}%` : 'بلا حد' },
        { label: 'أيام الائتمان (مهلة السداد)', value: c.creditDays ? `${c.creditDays} يوم` : 'فوري (كاش)' },
        { label: 'الرقم الضريبي', value: c.vatNumber, mono: true },
        { label: 'السجل التجاري', value: c.crNumber || c.nationalId, mono: true },
        { label: 'مصدر التسجيل', value: c.source === 'sales_manager_portal' ? '💼 بوابة مدير المبيعات الميدانية' : 'الإدارة العامة' },
        { label: 'ملاحظات', value: c.notes },
      ]
    },
    {
      heading: `الأوراق والمستندات الرسمية (KYC) — (${(c.attachments || []).length} مستند)`,
      rows: [
        {
          label: 'حالة المستندات المرفوعة',
          value: Array.isArray(c.attachments) && c.attachments.length > 0
            ? c.attachments.map(a => `📄 ${a.title || a.fileName || 'مستند'}`).join(' &nbsp;|&nbsp; ')
            : '<span style="color:#f59e0b; font-weight:700;">لا توجد مستندات مرفوعة بعد</span>'
        },
        c.signatureDataUrl ? {
          label: 'التوقيع الحي المعتمد',
          value: '✍️ تم التوقيع الرقمي بنجاح وموثق بالاتفاقية'
        } : null,
        {
          label: 'عرض وفحص الملفات',
          value: `<button class="btn btn-sm" style="background:#0284c7;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${c.id}')">📁 فتح ملف المستندات والصور (KYC)</button>`
        }
      ].filter(Boolean)
    }
  ];
}

window.previewCustomer = (id) => {
  const c = getCustomerById(id);
  if (!c) { showToast('لم يتم إيجاد العميل', 'error'); return; }
  const cs = getCreditStatus(c.balance || 0, c.creditLimit || 0);
  const attachmentsCount = (c.attachments || []).length;
  showRecordPreview({
    title: c.name,
    icon: '👤',
    badgeText: cs.label,
    badgeColor: cs.color === 'good' ? 'good' : cs.color === 'warn' ? 'warn' : 'bad',
    sections: buildCustomerSections(c),
    actions: [
      { icon: '📁', label: `المستندات الرسمية (${attachmentsCount})`, fn: `document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${id}')`, style: 'background:#0284c7;color:#fff;font-weight:bold;' },
      { icon: '✏️', label: 'تعديل', fn: `document.getElementById('record-preview-overlay').remove();editCustomer('${id}')`, style: 'background:var(--brand);color:#fff;' },
      { icon: '📝', label: 'اتفاقية الحساب', fn: `document.getElementById('record-preview-overlay').remove();openCustomerAgreement('${id}')`, style: 'background:#1E3A8A;color:#fff;' },
      { icon: '🛡️', label: 'سند أمانة وعهدة مالية', fn: `document.getElementById('record-preview-overlay').remove();issueTrustReceiptFromCustomers('${id}')`, style: 'background:#0369A1;color:#fff;' },
      { icon: '⚖️', label: 'إقرار مديونية وتعهد سداد', fn: `document.getElementById('record-preview-overlay').remove();issueDebtAckFromCustomers('${id}')`, style: 'background:#DC2626;color:#fff;' },
      { icon: '🖨️', label: 'طباعة', fn: `printCustomer('${id}')`, style: 'background:var(--bg-2);color:var(--text-1);' },
      { icon: '📄', label: 'PDF', fn: `exportCustomerPDF('${id}')`, style: 'background:#EF4444;color:#fff;' },
      { icon: '📊', label: 'كشف حساب', fn: `viewCustomerStatement('${id}','${c.name.replace(/'/g,"\\'")}')`, style: 'background:#10B981;color:#fff;' },
    ]
  });
};

window.printCustomer = (id) => {
  openCustomerAgreementModal(id);
};

window.exportCustomerPDF = (id) => {
  openCustomerAgreementModal(id);
};

// ─── اعتماد عميل جديد قادم من مدير المبيعات وربطه بالشجرة ───
window.approveSalesManagerCustomer = async (customerId, customerName) => {
  const cust = cachedCustomers.find(c => c.id === customerId);
  if (!cust) {
    showToast("لم يتم العثور على بيانات العميل", "error");
    return;
  }

  const confirm = window.confirm(
    `هل تريد اعتماد العميل: "${customerName}" وتفعيل حسابه رسمياً في النظام؟\n\n` +
    `• الحد الائتماني: ${formatCurrency(cust.creditLimit || 0)}\n` +
    `• المندوب المسؤول: ${cust.repName || 'غير محدد'}\n` +
    `• سيتم ربطه تلقائياً بشجرة الحسابات (COA) ليصبح متاحاً للبيع فوراً.`
  );
  if (!confirm) return;

  try {
    showToast("جاري اعتماد العميل وربطه بالشجرة...", "info");
    const { doc, updateDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { syncEntityToCoa } = await import("../utils/coa-connector.js");

    // 1. تحديث حالة العميل
    const custRef = doc(db, `companies/${COMPANY_ID}/customers`, customerId);
    await updateDoc(custRef, {
      status: "active",
      approvalStatus: "approved",
      approvedAt: serverTimestamp()
    });

    // 2. مزامنة وربط العميل بشجرة الحسابات (COA)
    try {
      await syncEntityToCoa("customers", customerId, cust.name, { repId: cust.repId || cust.assignedRepId });
    } catch (coaErr) {
      console.warn("COA sync warning:", coaErr);
    }

    showToast(`✅ تم اعتماد العميل "${customerName}" وتفعيل حسابه بنجاح!`, "success");
    await loadCustomers();
  } catch (err) {
    console.error("Approval error:", err);
    showToast("حدث خطأ أثناء اعتماد العميل: " + err.message, "error");
  }
};

// ─── نافذة استعراض المستندات القانونية والمرفقات (KYC) ───
window.openCustomerAttachmentsModal = (customerId) => {
  const c = cachedCustomers.find(x => x.id === customerId);
  if (!c) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "cust-kyc-overlay";
  overlay.style.zIndex = "1200";

  const attachments = Array.isArray(c.attachments) ? c.attachments : [];

  overlay.innerHTML = `
    <div class="modal-window" style="max-width:720px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.3); font-family:var(--font-body,'Cairo',sans-serif); direction:rtl; text-align:right;">
      <div style="background:linear-gradient(135deg, #004d80, #0284c7); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">📂</span>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800;">الأوراق والمستندات القانونية (KYC) — ${c.name}</h3>
            <div style="font-size:11px; opacity:0.85;">كود العميل: ${c.code || '—'} &nbsp;|&nbsp; المندوب: ${c.repName || '—'}</div>
          </div>
        </div>
        <button class="modal-close-btn" style="background:rgba(255,255,255,0.18); border:none; color:#fff; width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:16px;" onclick="document.getElementById('cust-kyc-overlay').remove()">✕</button>
      </div>

      <div style="padding:20px; max-height:75vh; overflow-y:auto;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:16px; font-size:12px; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">
          <div>📜 السجل التجاري: <strong class="mono">${c.crNumber || 'غير مدون'}</strong></div>
          <div>🏢 الرقم الضريبي: <strong class="mono">${c.vatNumber || 'غير مدون'}</strong></div>
          <div>📞 الجوال: <strong class="mono">${c.phone || c.mobile || '—'}</strong></div>
          <div>💳 التسهيلات المقررة: <strong>${formatCurrency(c.creditLimit || 0)}</strong> (${c.creditDays || 30} يوماً)</div>
          ${c.googleMapsUrl ? `<div style="grid-column:1/-1;"><a href="${c.googleMapsUrl}" target="_blank" style="color:#0284c7; font-weight:bold;">📍 فتح موقع المنشأة الميداني على خرائط جوجل</a></div>` : ''}
        </div>

        <h4 style="font-size:13px; font-weight:800; margin-bottom:10px; color:#004d80;">المستندات والملفات المرفوعة (${attachments.length}):</h4>
        ${attachments.length === 0 ? `
          <div style="text-align:center; padding:32px; color:var(--text-muted); border:1px dashed #cbd5e1; border-radius:10px;">
            لا توجد مستندات قانونية مرفقة لهذا العميل حتى الآن.
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:12px;">
            ${attachments.map(a => `
              <div style="border:1.5px solid #e2e8f0; border-radius:10px; padding:10px; background:#fff; text-align:center;">
                <div style="font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${a.title || a.fileName}">
                  ${a.title || a.fileName || 'مستند قانوني'}
                </div>
                ${a.dataUrl?.startsWith('data:image') ? `
                  <a href="${a.dataUrl}" target="_blank" title="اضغط للتكبير وعرض الصورة">
                    <img src="${a.dataUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" />
                  </a>
                ` : `
                  <div style="padding:20px; background:#f1f5f9; border-radius:6px; margin-bottom:6px; font-size:24px;">📄</div>
                  <a href="${a.dataUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px;">عرض الملف / PDF</a>
                `}
              </div>
            `).join('')}
          </div>
        `}

        ${c.signatureDataUrl ? `
          <div style="margin-top:16px; padding:12px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:12px; font-weight:800; color:#004d80;">✍️ نموذج توقيع العميل الحي على الاتفاقية:</div>
              <div style="font-size:10.5px; color:#475569;">موثق إلكترونياً ومربوط بالاتفاقية الائتمانية الرسمية</div>
            </div>
            <img src="${c.signatureDataUrl}" style="max-height:55px; background:#fff; padding:4px; border:1px solid #cbd5e1; border-radius:6px;" />
          </div>
        ` : ''}
        <!-- خانة رفع مستند جديد مباشرة من البرنامج الرئيسي -->
        <div style="margin-top:16px; padding:12px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#0f172a;">➕ إرفاق مستند أو وثيقة رسمية للملف:</div>
            <div style="font-size:10.5px; color:#64748b;">سجل تجاري، شهادة ضريبية، رخصة، هوية، عقد إيجار، آيبان (صور أو PDF)</div>
          </div>
          <div>
            <input type="file" id="cust-upload-kyc-input" accept="image/*,.pdf" style="display:none;" onchange="window.uploadNewCustomerKycDoc('${c.id}', this)" />
            <button type="button" class="btn btn-primary sm" onclick="document.getElementById('cust-upload-kyc-input').click()" style="background:#0284c7; font-weight:800; font-size:11.5px; padding:6px 14px; border-radius:6px; cursor:pointer;">
              📤 رفع مستند جديد
            </button>
          </div>
        </div>
      </div>

      <div style="padding:12px 20px; border-top:1px solid #e2e8f0; background:#f8fafc; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-kyc-overlay').remove()">إغلاق</button>
        <button class="btn btn-primary" onclick="document.getElementById('cust-kyc-overlay').remove(); openCustomerAgreement('${c.id}')" style="background:#0284c7;">
          🖨️ طباعة الاتفاقية القانونية A4
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

// ─── رفع مستند KYC جديد لملف العميل وحفظه في Firestore ───
window.uploadNewCustomerKycDoc = async (customerId, input) => {
  const file = input?.files?.[0];
  if (!file) return;

  const docTitle = prompt("أدخل اسم / نوع المستند المرفوع (مثلاً: رخصة البلدية، عقد الإيجار، السجل التجاري):", file.name) || file.name;

  try {
    showToast("جاري معالجة ورفع المستند...", "info");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const { doc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const { db, COMPANY_ID } = await import("../firebase-config.js");

      const newAttachment = {
        docId: "doc_" + Date.now(),
        title: docTitle,
        fileName: file.name,
        dataUrl: dataUrl,
        uploadedAt: new Date().toISOString()
      };

      const custRef = doc(db, `companies/${COMPANY_ID}/customers`, customerId);
      await updateDoc(custRef, {
        attachments: arrayUnion(newAttachment)
      });

      // تحديث العميل في الذاكرة
      const custInCache = cachedCustomers.find(x => x.id === customerId);
      if (custInCache) {
        if (!Array.isArray(custInCache.attachments)) custInCache.attachments = [];
        custInCache.attachments.push(newAttachment);
      }

      showToast("✅ تم رفع المستند وحفظه بملف العميل بنجاح!", "success");
      document.getElementById("cust-kyc-overlay")?.remove();
      window.openCustomerAttachmentsModal(customerId);
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Upload error:", err);
    showToast("حدث خطأ أثناء رفع المستند: " + err.message, "error");
  }
};

// ─── ترحيل ذمم العملاء لشجرة الحسابات (مرة واحدة) ───
window.runCustomerCoaMigration = async () => {
  const btn = document.getElementById("btn-migrate-coa");
  const confirm = window.confirm(
    "⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.\n\n" +
    "• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)\n" +
    "• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)\n\n" +
    "العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.\n\n" +
    "هل تريد المتابعة؟"
  );
  if (!confirm) return;

  if (btn) { btn.disabled = true; btn.textContent = "⏳ جاري الترحيل..."; }

  try {
    const results = await migrateCustomerCoa();
    const msg = [
      `✅ تم ترحيل: ${results.migrated.length} عميل`,
      `⏭️ تم تخطّي: ${results.skipped.length} عميل (مرتبط مسبقاً)`,
      results.errors.length > 0 ? `❌ أخطاء: ${results.errors.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    if (results.migrated.length > 0) {
      console.table(results.migrated);
    }
    window.alert(msg);
    await loadCustomers();
  } catch (err) {
    window.alert("❌ خطأ أثناء الترحيل: " + err.message);
    console.error("Customer COA Migration Error:", err);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = "<span>🔗</span> ترحيل ذمم العملاء"; }
  }
};

// ─── شاشة ذكاء العميل والتحليل الإحصائي ───
window.showCustomerIntelligence = async (customerId, customerName) => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "cust-intelligence-overlay";
  overlay.style.zIndex = "1100";
  overlay.innerHTML = `
    <div class="modal" style="max-width:1150px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); box-shadow:0 24px 48px rgba(0,0,0,0.15);">
      <div class="modal-header" style="padding:20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; direction:rtl;">
        <h3 class="modal-title" style="display:flex; align-items:center; gap:8px; font-size:16px; font-weight:800; color:var(--brand); margin:0;">
          🧠 لوحة ذكاء العميل والتحليل الإحصائي: <span style="color:var(--text-1);">${customerName}</span>
        </h3>
        <div style="display:flex; gap:12px; align-items:center;">
          <button class="btn btn-secondary sm" onclick="window.printCustomerIntelligence()" style="display:flex; align-items:center; gap:6px; font-size:12px; padding:6px 12px;">
            🖨️ طباعة التحليل
          </button>
          <button class="modal-close" onclick="document.getElementById('cust-intelligence-overlay').remove()" style="font-size:24px; color:var(--text-3); background:none; border:none; cursor:pointer;">×</button>
        </div>
      </div>
      <div class="modal-body" id="cust-intel-body" style="padding:24px; overflow-y:auto; flex:1; display:flex; align-items:center; justify-content:center; min-height:350px; background:var(--bg-3);">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  try {
    const [salesSnap, receiptsSnap, contractsSnap, complaintsSnap] = await Promise.all([
      getDocs(query(COLS.salesInvoices(), where("customerId", "==", customerId))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.receipts(), where("targetId", "==", customerId))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.customerContracts(), where("customerId", "==", customerId))).catch(() => ({ docs: [] })),
      getDocs(query(COLS.customerComplaints(), where("customerId", "==", customerId))).catch(() => ({ docs: [] }))
    ]);

    const invoices = salesSnap.docs.map(d => d.data()).filter(i => i.status !== "cancelled");
    const receipts = receiptsSnap.docs.map(d => d.data()).sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    const contracts = contractsSnap.docs.map(d => d.data());
    const complaints = complaintsSnap.docs.map(d => d.data());

    // Calculate monthly sales (last 30 days) and tier
    const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const monthlyInvoices = invoices.filter(i => (i.date || "").slice(0, 10) >= thirtyDaysAgoStr);
    const monthlySales = monthlyInvoices.reduce((s, i) => s + (i.totalWithVat || i.total || 0), 0);
    const customerDoc = cachedCustomers.find(c => c.id === customerId) || {};
    const tierInfo = getCustomerTierInfo(monthlySales, customerDoc.tierOverride || customerDoc.manualTier);

    const totalInvoicesCount = invoices.length;
    const totalSalesExclVat = invoices.reduce((s, i) => s + (i.subtotal || 0), 0);
    const totalSalesInclVat = invoices.reduce((s, i) => s + (i.totalWithVat || 0), 0);
    let totalCost = 0;
    invoices.forEach(i => {
      const lines = i.lines || i.items || [];
      const linesCost = lines.reduce((sum, l) => {
        const qty = parseFloat(l.qty || l.quantity || 1) || 0;
        const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.purchasePrice !== undefined ? l.purchasePrice : (l.unitCost || 0))) || 0;
        return sum + (qty * uCost);
      }, 0);
      totalCost += (linesCost > 0 ? linesCost : (parseFloat(i.totalCost) || 0));
    });
    const totalProfit = totalSalesExclVat - totalCost;
    const profitMargin = totalSalesExclVat > 0 ? (totalProfit / totalSalesExclVat) * 100 : 0;

    const balance = customerDoc ? (customerDoc.balance || 0) : 0;
    const loyaltyPoints = parseInt(customerDoc.loyaltyPoints) || 0;
    const pinnedWarning = customerDoc.pinnedWarningNote || "";
    const totalPaid = Math.max(0, totalSalesInclVat - balance);
    const collectionRate = totalSalesInclVat > 0 ? (totalPaid / totalSalesInclVat) * 100 : 100;

    let avgFrequencyText = "—";
    if (totalInvoicesCount > 1) {
      const dates = invoices.map(i => new Date(i.date)).sort((a, b) => a - b);
      const diffMs = dates[dates.length - 1] - dates[0];
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const avgDays = diffDays / (totalInvoicesCount - 1);
      avgFrequencyText = avgDays <= 1 ? "يومي تقريباً" : `كل ${avgDays.toFixed(1)} يوم`;
    } else if (totalInvoicesCount === 1) { avgFrequencyText = "فاتورة واحدة فقط"; }

    let lastPaymentText = "لا يوجد مدفوعات مسجلة";
    if (receipts.length > 0) {
      const lp = receipts[0];
      lastPaymentText = `${formatCurrency(lp.amount || 0)} بتاريخ ${lp.date || (lp.createdAt?.toDate ? lp.createdAt.toDate().toISOString().split("T")[0] : "—")}`;
    }

    const latestInvs = [...invoices].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const lastPurchasedItems = [];
    latestInvs.forEach(inv => {
      if (lastPurchasedItems.length >= 5) return;
      (inv.lines || []).forEach(line => {
        if (lastPurchasedItems.length >= 5) return;
        if (!lastPurchasedItems.some(item => item.productId === line.productId)) {
          lastPurchasedItems.push({
            productId: line.productId, name: line.productName,
            qty: line.qty || line.quantity || 1,
            unit: (line.unit && line.unit !== "undefined") ? line.unit : (line.unitCode || ""),
            price: line.unitPrice || line.price || 0, date: inv.date
          });
        }
      });
    });

    const chartInvs = [...invoices].sort((a, b) => (a.date || "").localeCompare(b.date || "")).slice(-10);
    const maxProfit = Math.max(...chartInvs.map(i => (i.subtotal || 0) - (i.totalCost || 0)), 1);

    const bodyEl = document.getElementById("cust-intel-body");
    if (!bodyEl) return;

    // Reset flex centering when dashboard data is loaded to prevent vertical clipping
    bodyEl.style.display = "block";

    // Bind Print Function globally for this customer
    window.printCustomerIntelligence = () => {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>لوحة ذكاء العميل - ${customerName}</title>
            <style>
              body {
                direction: rtl;
                text-align: right;
                font-family: system-ui, -apple-system, sans-serif;
                padding: 30px;
                background: #fff;
                color: #000;
              }
              h2, h3 { text-align: center; margin-bottom: 10px; color: #7C3AED; }
              .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 24px;
              }
              .kpi-card {
                padding: 16px;
                border-radius: 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                position: relative;
              }
              .kpi-label { font-size: 11px; color: #6b7280; font-weight: 600; }
              .kpi-value { font-size: 20px; font-weight: 800; color: #111827; margin-top: 6px; }
              .mono { font-family: monospace; }
              .card {
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                background: #fff;
                margin-bottom: 24px;
              }
              h4 { font-size: 13px; font-weight: 700; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: right; font-size: 11px; }
              th { background: #f3f4f6; }
              .badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                display: inline-block;
              }
              .badge.good { background: #d1fae5; color: #065f46; }
              .badge.bad { background: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>
            <h2>🧠 لوحة ذكاء العميل والتحليل الإحصائي</h2>
            <h3 style="color:#374151;">العميل: ${customerName}</h3>
            ${bodyEl.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    bodyEl.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:20px; direction:rtl; text-align:right;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewCustomerStatement('${customerId}', '${customerName.replace(/'/g, "\\'")}')">📊 كشف حساب تفصيلي</button>
            ${customerDoc.phone ? `
              <button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${customerDoc.phone.replace(/[^0-9]/g,'')}', '_blank')">💬 محادثة واتساب</button>
            ` : ""}
            ${customerDoc.googleMapsUrl ? `
              <a href="${customerDoc.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 فتح في خرائط جوجل</a>
            ` : ""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">
              🎁 نقاط الولاء: ${loyaltyPoints} نقطة (${formatCurrency(loyaltyPoints * 0.5)})
            </span>
            <span class="badge" style="background:rgba(16,185,129,0.1); color:#10B981; font-weight:800;">
              📜 العقود: ${contracts.length} عقد
            </span>
          </div>
        </div>

        <!-- Customer Tier & Volume Intelligence Banner -->
        <div style="background:linear-gradient(135deg, ${tierInfo.bg} 0%, var(--bg-card) 100%); padding:18px 20px; border-radius:14px; border:1px solid ${tierInfo.border}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:36px; line-height:1;">
              ${tierInfo.key === 'A' ? '👑' : tierInfo.key === 'B' ? '💎' : tierInfo.key === 'C' ? '🚀' : tierInfo.key === 'D' ? '📦' : '⚪'}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px; font-weight:800; color:${tierInfo.color}; font-family:var(--font-heading);">
                  ${tierInfo.label}
                </span>
                ${tierInfo.isManual ? '<span class="badge neutral" style="font-size:10px;">🔒 تثبيت يدوي</span>' : '<span class="badge neutral" style="font-size:10px;">⚡ تصنيف ديناميكي</span>'}
              </div>
              <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
                ${tierInfo.desc}
              </div>
            </div>
          </div>
          <div style="text-align:left; min-width:200px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">مسحوبات آخر ٣٠ يوماً</div>
            <div class="mono" style="font-size:20px; font-weight:800; color:${tierInfo.color}; margin-top:2px;">
              ${formatCurrency(monthlySales)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:3px;">
              🎯 ${tierInfo.nextTierText}
            </div>
          </div>
        </div>

        ${pinnedWarning ? `
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير ائتماني مثبت للعميل:</b> ${pinnedWarning}</span>
          </div>
        ` : ""}

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--brand); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📊 نشاط الفواتير</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--brand); margin-top:8px;">${totalInvoicesCount} <span style="font-size:12px; font-weight:500;">فاتورة</span></div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">متوسط الشراء: ${avgFrequencyText}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--indigo); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">💰 حجم المبيعات</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--indigo); margin-top:8px;">${formatCurrency(totalSalesExclVat)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">شامل الضريبة: ${formatCurrency(totalSalesInclVat)}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--good); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📈 صافي الربح</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--good); margin-top:8px;">${formatCurrency(totalProfit)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">هامش الربح: ${profitMargin.toFixed(1)}%</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--warn); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">⏳ نسبة التحصيل</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--warn); margin-top:8px;">${collectionRate.toFixed(1)}%</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">الرصيد: ${formatCurrency(balance)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📥 آخر السدادات</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${receipts.slice(0, 5).map(r => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div><div style="font-weight:600; font-size:12.5px;">سند رقم ${r.number || "—"}</div></div>
                  <div style="text-align:left;"><div class="font-bold text-good" style="font-size:13.5px;">+ ${formatCurrency(r.amount || 0)}</div><div style="font-size:11px; color:var(--text-3);">${r.date || "—"}</div></div>
                </div>`).join("")}
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--brand); margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px;">آخر دفعة: ${lastPaymentText}</div>
          </div>
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📦 آخر بضائع مشتراة</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${lastPurchasedItems.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div>
                    <div style="font-weight:600; font-size:12.5px;">${item.name}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">التاريخ: ${item.date || "—"}</div>
                  </div>
                  <div style="text-align:left;">
                    <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${item.qty} ${item.unit || "حبة"}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سعر الوحدة: ${formatCurrency(item.price)}</div>
                  </div>
                </div>
              `).join("")}
              ${lastPurchasedItems.length === 0 ? `
                <div style="text-align:center; padding:40px; color:var(--text-3); font-size:12.5px;">لا توجد مشتريات بضائع مسجلة.</div>
              ` : ""}
            </div>
          </div>
        </div>

        <!-- Row 3: Sales Invoices & Detailed Profits Table -->
        <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            📄 فواتير مبيعات العميل وأرباحها التفصيلية
          </h4>
          <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
              <thead style="position:sticky; top:0; background:var(--bg-2); border-bottom:2px solid var(--border-soft); z-index:1;">
                <tr>
                  <th style="padding:10px;">رقم الفاتورة</th>
                  <th style="padding:10px;">التاريخ</th>
                  <th style="padding:10px;">قيمة الفاتورة (شامل)</th>
                  <th style="padding:10px;">قيمة المبيعات (خارج)</th>
                  <th style="padding:10px;">تكلفة البضاعة (COGS)</th>
                  <th style="padding:10px;">صافي الربح</th>
                  <th style="padding:10px;">هامش الربح %</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(inv => {
                  const valIncl = inv.totalWithVat || 0;
                  const valExcl = inv.subtotal || 0;
                  const lines = inv.lines || inv.items || [];
                  const linesCost = lines.reduce((sum, l) => {
                    const qty = parseFloat(l.qty || l.quantity || 1) || 0;
                    const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.purchasePrice !== undefined ? l.purchasePrice : (l.unitCost || 0))) || 0;
                    return sum + (qty * uCost);
                  }, 0);
                  const cost = linesCost > 0 ? linesCost : (parseFloat(inv.totalCost) || 0);
                  const profit = valExcl - cost;
                  const margin = valExcl > 0 ? (profit / valExcl) * 100 : 0;
                  return `
                    <tr style="border-bottom:1px solid var(--border-soft);">
                      <td style="padding:10px; font-weight:600; color:var(--brand);">${inv.number || inv.invoiceNumber || inv.id}</td>
                      <td style="padding:10px; color:var(--text-3);">${inv.date || "—"}</td>
                      <td style="padding:10px;" class="mono">${formatCurrency(valIncl)}</td>
                      <td style="padding:10px;" class="mono">${formatCurrency(valExcl)}</td>
                      <td style="padding:10px; color:var(--text-3);" class="mono">${formatCurrency(cost)}</td>
                      <td style="padding:10px; font-weight:600; color:${profit >= 0 ? "var(--good)" : "var(--bad)"}" class="mono">${profit >= 0 ? "+" : ""}${formatCurrency(profit)}</td>
                      <td style="padding:10px;" class="mono"><span class="badge ${profit >= 0 ? "good" : "bad"}" style="font-size:11px; padding:2px 8px;">${margin >= 0 ? "+" : ""}${margin.toFixed(1)}%</span></td>
                    </tr>
                  `;
                }).join("")}
                ${invoices.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-3);">لا توجد فواتير مبيعات مسجلة لهذا العميل.</td>
                  </tr>
                ` : ""}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 4: CSS Bar Graph representing Profitability per Invoice (last 10 invoices) -->
        ${chartInvs.length > 0 ? `
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:24px;">
              📈 رسم بياني لحجم الأرباح من آخر 10 فواتير للعميل
            </h4>
            <div style="display:flex; height:150px; align-items:end; gap:20px; padding:0 20px; position:relative; border-bottom:1px solid var(--border);">
              ${chartInvs.map(inv => {
                const profit = (inv.subtotal || 0) - (inv.totalCost || 0);
                const pct = (profit / maxProfit) * 100;
                return `
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:end; position:relative;">
                    <div class="mono" style="font-size:9.5px; font-weight:700; color:var(--good); margin-bottom:4px; position:absolute; bottom:${pct + 4}%;">
                      ${Math.round(profit)}
                    </div>
                    <div style="width:24px; height:${pct}%; background:linear-gradient(to top, var(--good-soft), var(--good)); border-radius:4px 4px 0 0; transition:height 0.3s ease;"></div>
                    <div class="mono" style="font-size:9px; color:var(--text-3); margin-top:8px; white-space:nowrap; transform:rotate(-20deg); transform-origin:top right; margin-right:-10px;">
                      ${inv.number || inv.id.slice(0, 8)}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    `;
  } catch (err) {
    const el = document.getElementById("cust-intel-body");
    if (el) el.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};
