// ============================================================
// IDHAM ERP — Global F8 Keyboard Search Modal v1.0
// ============================================================
import { COLS, getAll, orderBy } from "./db.js";
import { formatCurrency } from "./formatters.js";

let allProducts = [];
let allAccounts = [];
let activeIndex = -1;
let filteredItems = [];
let currentSearchType = null; // "product" | "account"
let activeJELineIndex = null; // For journal entries

// Initialize Global F8 Search Modal
export function initF8Search() {
  // Inject modal markup if not already present
  if (!document.getElementById("f8-search-modal")) {
    const modalHtml = `
      <div class="f8-modal-overlay" id="f8-search-modal">
        <div class="f8-modal">
          <div class="f8-modal-header">
            <h3 class="f8-modal-title" id="f8-modal-title">🔍 بحث F8 السريع</h3>
            <button class="f8-modal-close" onclick="closeF8Modal()">&times;</button>
          </div>
          <div class="f8-modal-body">
            <div class="f8-search-bar">
              <input type="text" id="f8-search-input" class="f8-input" 
                placeholder="اكتب للبحث... (استخدم الأسهم ↑ ↓ للتنقل و Enter للاختيار)" autocomplete="off" />
            </div>
            <div class="f8-table-container">
              <table class="f8-table">
                <thead id="f8-table-thead"></thead>
                <tbody id="f8-table-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
    const div = document.createElement("div");
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);

    // Inject Styles
    const style = document.createElement("style");
    style.textContent = `
      .f8-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.65);
        backdrop-filter: blur(5px); display: flex; align-items: center;
        justify-content: center; z-index: 99999; opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .f8-modal-overlay.active { opacity: 1; pointer-events: auto; }
      .f8-modal {
        background: var(--bg-1, #1e1b4b); border: 1px solid var(--border-soft, rgba(255,255,255,0.08));
        border-radius: 16px; width: 780px; max-width: 95vw; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;
        animation: f8-slide-up 0.2s ease;
      }
      @keyframes f8-slide-up {
        from { transform: translateY(20px) scale(0.97); }
        to { transform: translateY(0) scale(1); }
      }
      .f8-modal-header {
        padding: 14px 20px; border-bottom: 1px solid var(--border-soft, rgba(255,255,255,0.08));
        background: var(--bg-2, #0f172a); display: flex; align-items: center; justify-content: space-between;
      }
      .f8-modal-title { font-size: 15px; font-weight: 700; color: var(--text-0, #fff); margin: 0; }
      .f8-modal-close {
        background: none; border: none; font-size: 24px; color: var(--text-2, #94a3b8);
        cursor: pointer; line-height: 1; padding: 4px; transition: color 0.15s;
      }
      .f8-modal-close:hover { color: var(--bad, #ef4444); }
      .f8-modal-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
      .f8-search-bar { position: relative; }
      .f8-input {
        width: 100%; padding: 12px 16px; border: 1.5px solid var(--border-soft, rgba(255,255,255,0.08));
        border-radius: 10px; background: var(--bg-0, #0a0d18); color: var(--text-0, #fff);
        font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.15s;
      }
      .f8-input:focus { border-color: var(--brand, #5B7FFF); }
      .f8-table-container {
        flex: 1; overflow-y: auto; border: 1px solid var(--border-soft, rgba(255,255,255,0.08));
        border-radius: 8px; background: var(--bg-0, #0a0d18); max-height: 50vh;
      }
      .f8-table { width: 100%; border-collapse: collapse; text-align: right; font-size: 13px; }
      .f8-table th {
        position: sticky; top: 0; background: var(--bg-2, #0f172a); z-index: 10;
        padding: 10px 14px; font-size: 11px; font-weight: 800; color: var(--text-2, #94a3b8);
        border-bottom: 1.5px solid var(--border-soft, rgba(255,255,255,0.08));
      }
      .f8-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
      .f8-table tr { cursor: pointer; transition: background 0.1s; }
      .f8-table tr:hover td { background: var(--bg-1, #1e1b4b); }
      .f8-table tr.active td { background: var(--brand, #5B7FFF) !important; color: #fff !important; }
      .f8-table tr.active .mono { color: #fff !important; }
      .f8-table tr.active .text-indigo { color: #fff !important; }
      .f8-table tr.active .badge { border-color: #fff !important; color: #fff !important; }
      .f8-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: rgba(99,102,241,0.15); color: var(--brand, #5B7FFF); }
      .f8-badge.expense { background: rgba(245,158,11,0.15); color: #f59e0b; }
      .f8-badge.asset { background: rgba(16,185,129,0.15); color: #10b981; }
    `;
    document.head.appendChild(style);

    // Global Close Helper
    window.closeF8Modal = () => {
      document.getElementById("f8-search-modal").classList.remove("active");
    };

    // Setup input listeners
    const searchInput = document.getElementById("f8-search-input");
    searchInput.addEventListener("input", () => {
      filterF8Results(searchInput.value.trim());
    });

    searchInput.addEventListener("keydown", handleF8Navigation);
  }

  // Global F8 Trigger
  document.addEventListener("keydown", (e) => {
    if (e.key === "F8") {
      e.preventDefault();
      triggerF8Search();
    }
  });
}

// Determine search context and open the modal
async function triggerF8Search() {
  const route = window.currentRoute || "";
  const activeEl = document.activeElement;

  // Check if we are on a Journal Entries screen and editing a line
  if (route === "journal-entries" || activeEl?.id?.startsWith("acc-search-")) {
    currentSearchType = "account";
    if (activeEl?.id?.startsWith("acc-search-")) {
      activeJELineIndex = parseInt(activeEl.id.replace("acc-search-", ""));
    } else {
      activeJELineIndex = 0; // Default to first line
    }
    document.getElementById("f8-modal-title").textContent = "🔍 بحث F8 السريع في دليل الحسابات";
    document.getElementById("f8-search-input").placeholder = "ابحث برقم الحساب أو اسم الحساب...";
    openF8Modal();
    await loadF8Accounts();
    filterF8Results("");
    return;
  }

  // Otherwise, default to Product search if on a supported inventory/sales/purchase route
  const productRoutes = [
    "sales-invoices", "quotations", "pos", "sales-returns",
    "purchase-invoices", "purchase-returns", "reorder-points"
  ];

  if (productRoutes.includes(route) || activeEl?.id?.includes("product-search") || activeEl?.id?.includes("prod-search")) {
    currentSearchType = "product";
    document.getElementById("f8-modal-title").textContent = "🔍 بحث F8 السريع في كتالوج الأصناف";
    document.getElementById("f8-search-input").placeholder = "ابحث بالاسم، رمز الصنف (SKU)، أو الباركود...";
    openF8Modal();
    await loadF8Products();
    filterF8Results("");
    return;
  }
}

function openF8Modal() {
  const modal = document.getElementById("f8-search-modal");
  const input = document.getElementById("f8-search-input");
  modal.classList.add("active");
  input.value = "";
  input.focus();
  activeIndex = -1;
}

// Fetch products from database
async function loadF8Products() {
  if (allProducts.length === 0) {
    try {
      allProducts = await getAll(COLS.products(), [orderBy("name")]);
    } catch (e) {
      console.error("loadF8Products error:", e);
    }
  }
}

// Fetch accounts from database
async function loadF8Accounts() {
  if (allAccounts.length === 0) {
    try {
      allAccounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);
    } catch (e) {
      console.error("loadF8Accounts error:", e);
    }
  }
}

// Filter results client-side
function filterF8Results(q) {
  const queryText = q.toLowerCase();
  activeIndex = -1;

  if (currentSearchType === "product") {
    filteredItems = allProducts.filter(p => p.isActive !== false);
    if (queryText) {
      filteredItems = filteredItems.filter(p =>
        (p.name || "").toLowerCase().includes(queryText) ||
        (p.sku || "").toLowerCase().includes(queryText) ||
        (p.barcode || "").includes(queryText)
      );
    }
    filteredItems = filteredItems.slice(0, 100); // Limit to top 100
    renderF8ProductTable();
  } else if (currentSearchType === "account") {
    // Only show detail accounts that can accept posting
    filteredItems = allAccounts.filter(a => a.isActive !== false && a.nodeType !== "header");
    if (queryText) {
      filteredItems = filteredItems.filter(a =>
        (a.code || "").toLowerCase().includes(queryText) ||
        (a.name || "").toLowerCase().includes(queryText)
      );
    }
    filteredItems = filteredItems.slice(0, 100);
    renderF8AccountTable();
  }
}

// Render Products Grid
function renderF8ProductTable() {
  const thead = document.getElementById("f8-table-thead");
  const tbody = document.getElementById("f8-table-tbody");

  thead.innerHTML = `
    <tr>
      <th style="width:140px;">رمز الصنف (SKU)</th>
      <th>الاسم</th>
      <th>الفئة</th>
      <th style="width:60px;text-align:center;">الوحدة</th>
      <th style="width:110px;text-align:left;">السعر البيعي</th>
      <th style="width:110px;text-align:left;">تكلفة الشراء</th>
    </tr>
  `;

  if (filteredItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredItems.map((p, index) => `
    <tr id="f8-row-${index}" onclick="selectF8Item(${index})">
      <td class="mono font-semibold text-indigo">${p.sku || "—"}</td>
      <td><strong>${p.name}</strong></td>
      <td class="dim">${p.categoryName || p.categoryId || "—"}</td>
      <td style="text-align:center;">${p.unit || "حبة"}</td>
      <td class="mono text-indigo" style="text-align:left;">${formatCurrency(p.salePrice || p.price || 0)}</td>
      <td class="mono dim" style="text-align:left;">${formatCurrency(p.costPrice || p.averageCost || 0)}</td>
    </tr>
  `).join("");
}

// Render Accounts Grid
function renderF8AccountTable() {
  const thead = document.getElementById("f8-table-thead");
  const tbody = document.getElementById("f8-table-tbody");

  thead.innerHTML = `
    <tr>
      <th style="width:150px;">رقم الحساب</th>
      <th>اسم الحساب</th>
      <th>نوع الحساب</th>
      <th>التبويب</th>
    </tr>
  `;

  const typeLabels = { asset: "أصول", liability: "خصوم", equity: "ملكية", revenue: "إيرادات", expense: "مصروفات" };

  if (filteredItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredItems.map((a, index) => `
    <tr id="f8-row-${index}" onclick="selectF8Item(${index})">
      <td class="mono font-bold text-indigo">${a.code}</td>
      <td><strong>${a.name}</strong></td>
      <td><span class="f8-badge ${a.type || ""}">${typeLabels[a.type] || a.type || "—"}</span></td>
      <td class="dim">${a.category || "—"}</td>
    </tr>
  `).join("");
}

// Keyboard Navigation Handler
function handleF8Navigation(e) {
  if (filteredItems.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (activeIndex < filteredItems.length - 1) {
      activeIndex++;
      highlightF8Row();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (activeIndex > 0) {
      activeIndex--;
      highlightF8Row();
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < filteredItems.length) {
      selectF8Item(activeIndex);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    window.closeF8Modal();
  }
}

// Highlight the active row and scroll it into view
function highlightF8Row() {
  // Remove active class from all rows
  document.querySelectorAll(".f8-table tr").forEach(tr => tr.classList.remove("active"));

  const activeRow = document.getElementById(`f8-row-${activeIndex}`);
  if (activeRow) {
    activeRow.classList.add("active");
    // Scroll row into view inside scroll container
    activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// Select item and close modal
window.selectF8Item = function(index) {
  const item = filteredItems[index];
  if (!item) return;

  const route = window.currentRoute || "";

  if (currentSearchType === "product") {
    if (route === "quotations" && typeof window.addQtProduct === "function") {
      const price = item.salePrice || item.price || 0;
      window.addQtProduct(item.id, item.name, price, item.unit || "حبة", item.sku);
    } else if (route === "sales-invoices" && typeof window.addProductLine === "function") {
      const price = item.salePrice || item.price || 0;
      window.addProductLine(item.id, item.name, price, item.unit || "حبة", item.taxCategory || "S");
    } else if (route === "pos" && typeof window.addToCartById === "function") {
      window.addToCartById(item.id);
    } else if (route === "purchase-invoices" && typeof window.addPurLine === "function") {
      const price = item.costPrice || item.averageCost || 0;
      window.addPurLine(item.id, item.name, price, item.unit || "حبة", item.sku, item.taxCategory || "S");
    } else {
      // General fallback: if there is an active input, fill it
      const inputs = [
        "product-search-input", "qt-product-search", 
        "pur-product-search", "pos-search"
      ];
      for (const id of inputs) {
        const el = document.getElementById(id);
        if (el) {
          el.value = item.name;
          el.dispatchEvent(new Event("input"));
          el.focus();
          break;
        }
      }
    }
  } else if (currentSearchType === "account") {
    if (route === "journal-entries" && typeof window.selectAccLine === "function") {
      window.selectAccLine(activeJELineIndex, item.id, item.code, item.name, item.type);
      // Put focus back on the next logical cell (the Debit or Credit input)
      setTimeout(() => {
        const noteInput = document.querySelector(`tr[data-line="${activeJELineIndex}"] .je-note-input`);
        if (noteInput) noteInput.focus();
      }, 50);
    }
  }

  window.closeF8Modal();
};
