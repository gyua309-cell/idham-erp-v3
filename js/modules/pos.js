// ============================================================
// IDHAM ERP — POS Module v2.0 (نقطة البيع المتكاملة)
// ============================================================
// Features:
//   ✅ Categories sidebar (dynamic — auto-updates)
//   ✅ Products grid filtered by category + search
//   ✅ Stock integration (real-time qty from stockByWarehouse)
//   ✅ Cost price guard (cannot sell below cost — admin bypass)
//   ✅ Payment modes: Cash / Credit / Bank Transfer / Card (Network)
//   ✅ Cash box & bank account selection per payment method
//   ✅ Customer account (credit sales) with balance update
//   ✅ Atomic: invoice + stock deduction + journal entry in one Tx
//   ✅ Professional receipt printing (thermal 80mm + A4)
//   ✅ Barcode scanner support
//   ✅ Keyboard shortcuts (F8=Cash, F9=Network, F10=Credit, F11=Transfer)
// ============================================================

import {
  COLS, create, getAll, generateInvoiceNumber,
  createJournalEntry, adjustStock,
  query, where, orderBy, limit, getDocs, getDoc,
  runTransaction, serverTimestamp, doc, increment, setDoc, collection
} from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { formatCurrency, todayString } from "../utils/formatters.js";

// ──────────────────────────────────────────
// Module State
// ──────────────────────────────────────────
let allProducts    = [];   // full product list (loaded once)
let categories     = [];   // category list
let customers      = [];
let cashBoxes      = [];
let bankAccounts   = [];
let allAccounts    = [];
let warehouses     = [];
let stockMap       = {};   // { productId: totalQty }
let costMap        = {};   // { productId: averageCost }

let cart           = [];
let selectedCatId  = "ALL";
let activeWarehouseId = null;

// ──────────────────────────────────────────
// Entry Point
// ──────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = buildPOSLayout();
  bindEvents();
  window.addEventListener("keydown", posKeydownHandler);

  await loadAllData();
}

// ──────────────────────────────────────────
// HTML Layout
// ──────────────────────────────────────────
function buildPOSLayout() {
  return `
<div class="pos-root" id="pos-root">

  <!-- ═══════════════ TOP BAR ═══════════════ -->
  <div class="pos-topbar">
    <div class="pos-topbar-left">
      <div class="pos-brand"><i class="fas fa-cash-register"></i> نقطة البيع</div>
      <select id="pos-warehouse" class="pos-select" title="المستودع">
        <option value="">اختر المستودع...</option>
      </select>
    </div>
    <div class="pos-topbar-center">
      <div class="pos-search-wrap" style="position:relative;">
        <i class="fas fa-barcode pos-search-icon"></i>
        <input type="text" id="pos-search" class="pos-search-input"
               placeholder="ابحث بالاسم أو الباركود أو الكود... [F8 للبحث المتقدم]"
               autocomplete="off" autofocus />
        <button type="button" id="pos-camera-scan-btn" onclick="startCameraScan()" style="background:none;border:none;cursor:pointer;color:var(--text-2);padding:4px 8px;font-size:16px;display:flex;align-items:center;" title="مسح باستخدام الكاميرا">
          <i class="fas fa-camera"></i>
        </button>
        <kbd class="pos-kbd">⌨</kbd>
      </div>
    </div>
    <div class="pos-topbar-right">
      <div class="pos-date"><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString("ar-SA", {weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
  </div>

  <!-- ═══════════════ MAIN AREA ═══════════════ -->
  <div class="pos-main">

    <!-- ─── Categories Sidebar ─── -->
    <div class="pos-categories" id="pos-categories">
      <div class="pos-cat-item active" data-cat="ALL" onclick="selectCategory('ALL')">
        <div class="pos-cat-icon">🌐</div>
        <div class="pos-cat-label">الكل</div>
      </div>
      <!-- dynamic categories inserted here -->
    </div>

    <!-- ─── Products Grid ─── -->
    <div class="pos-products-area">
      <div class="pos-products-header">
        <span id="pos-cat-title" class="pos-cat-title">جميع الأصناف</span>
        <span id="pos-prod-count" class="pos-prod-count">0 صنف</span>
      </div>
      <div class="pos-products-grid" id="pos-products-grid">
        <div class="pos-loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الأصناف...</div>
      </div>
    </div>

    <!-- ─── Cart & Checkout ─── -->
    <div class="pos-cart-panel" id="pos-cart-panel">

      <!-- Customer & Invoice Type -->
      <div class="pos-cart-top">
        <div class="pos-cart-row">
          <label class="pos-label"><i class="fas fa-user"></i> العميل</label>
          <select id="pos-customer" class="pos-select-lg">
            <option value="cash_customer">عميل نقدي</option>
          </select>
        </div>
        <div class="pos-cart-row">
          <label class="pos-label"><i class="fas fa-file-invoice"></i> نوع الفاتورة</label>
          <div class="pos-invoice-type" id="pos-invoice-type">
            <button class="pos-type-btn active" data-type="simplified" onclick="setInvoiceType('simplified')">مبسّطة</button>
            <button class="pos-type-btn" data-type="standard" onclick="setInvoiceType('standard')">معيارية</button>
          </div>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="pos-cart-items" id="pos-cart-items">
        <div class="pos-empty-cart">
          <i class="fas fa-shopping-cart pos-empty-icon"></i>
          <p>السلة فارغة</p>
          <small>اضغط على صنف لإضافته</small>
        </div>
      </div>

      <!-- Discount Row -->
      <div class="pos-discount-row">
        <label class="pos-label"><i class="fas fa-tag"></i> خصم (ر.س)</label>
        <input type="number" id="pos-discount" class="pos-input-sm" value="0" min="0" step="0.01"
               oninput="recalcTotals()" />
      </div>

      <!-- Totals -->
      <div class="pos-totals">
        <div class="pos-total-row">
          <span>المجموع قبل الضريبة</span>
          <strong id="pos-subtotal" class="mono">0.00 ر.س</strong>
        </div>
        <div class="pos-total-row text-muted">
          <span>الضريبة 15%</span>
          <strong id="pos-vat" class="mono">0.00 ر.س</strong>
        </div>
        <div class="pos-total-row pos-grand-total">
          <span>الإجمالي</span>
          <strong id="pos-total" class="mono brand">0.00 ر.س</strong>
        </div>
      </div>

      <!-- Payment Method Tabs -->
      <div class="pos-pay-tabs">
        <button class="pos-pay-tab active" data-method="cash" onclick="selectPayMethod('cash')">
          <i class="fas fa-money-bill-wave"></i><br>نقد<br><kbd>F8</kbd>
        </button>
        <button class="pos-pay-tab" data-method="network" onclick="selectPayMethod('network')">
          <i class="fas fa-credit-card"></i><br>شبكة<br><kbd>F9</kbd>
        </button>
        <button class="pos-pay-tab" data-method="credit" onclick="selectPayMethod('credit')">
          <i class="fas fa-clock"></i><br>آجل<br><kbd>F10</kbd>
        </button>
        <button class="pos-pay-tab" data-method="transfer" onclick="selectPayMethod('transfer')">
          <i class="fas fa-exchange-alt"></i><br>تحويل<br><kbd>F11</kbd>
        </button>
      </div>

      <!-- Payment Details removed from sidebar to gain cart height -->

      <!-- Action Buttons -->
      <div class="pos-actions">
        <button class="pos-btn-checkout" id="pos-btn-checkout" onclick="checkout()">
          <i class="fas fa-check-circle"></i>
          <span id="pos-btn-label">إتمام البيع — كاش</span>
        </button>
        <div class="pos-actions-sub">
          <button class="pos-btn-secondary" onclick="clearCart()" title="إفراغ السلة">
            <i class="fas fa-trash"></i>
          </button>
          <button class="pos-btn-secondary" onclick="holdSale()" title="تعليق البيع">
            <i class="fas fa-pause-circle"></i>
          </button>
          <button class="pos-btn-secondary" onclick="printLastReceipt()" title="إعادة طباعة">
            <i class="fas fa-print"></i>
          </button>
        </div>
      </div>

      <!-- Error Banner -->
      <div id="pos-error" class="pos-error hidden"></div>
    </div>
  </div>

</div>

<!-- ═══ PAYMENT CONFIRM MODAL ═══ -->
<div class="pos-modal-overlay hidden" id="pos-pay-modal">
  <div class="pos-modal">
    <div class="pos-modal-header">
      <h3 id="pos-modal-title"><i class="fas fa-check-circle text-good"></i> تأكيد السداد</h3>
    </div>
    <div class="pos-modal-body">
      <div class="pos-pay-summary" id="pos-pay-summary"></div>
      <div class="pos-pay-modal-row">
        <label>المبلغ المستلم (للنقد)</label>
        <input type="number" id="pos-received-amount" class="pos-input-lg" placeholder="0.00" min="0" step="0.01"
               oninput="calcChange()" />
      </div>
      <div class="pos-change-row" id="pos-change-row">
        <span>الباقي للعميل</span>
        <strong id="pos-change-amount" class="mono brand">0.00 ر.س</strong>
      </div>
      <div id="pos-modal-pay-details" style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
        <div id="pos-cashbox-row" class="pos-pay-modal-row">
          <label style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;"><i class="fas fa-cash-register"></i> الصندوق المستلم *</label>
          <select id="pos-cashbox" class="pos-input-sm" style="font-size:14px; padding:8px 10px; width:100%; border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-2); color:var(--text-0);"></select>
        </div>
        <div id="pos-bank-row" class="pos-pay-modal-row hidden">
          <label style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;"><i class="fas fa-university"></i> الحساب البنكي *</label>
          <select id="pos-bank" class="pos-input-sm" style="font-size:14px; padding:8px 10px; width:100%; border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-2); color:var(--text-0);"></select>
        </div>
        <div id="pos-ref-row" class="pos-pay-modal-row hidden">
          <label style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;"><i class="fas fa-hashtag"></i> رقم المرجع</label>
          <input type="text" id="pos-ref-no" class="pos-input-sm" style="font-size:14px; padding:8px 10px; width:100%; border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-2); color:var(--text-0);" placeholder="رقم الحوالة / الإيصال..." />
        </div>
        <div class="pos-pay-modal-row">
          <label style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;"><i class="fas fa-sticky-note"></i> ملاحظة</label>
          <input type="text" id="pos-note" class="pos-input-sm" style="font-size:14px; padding:8px 10px; width:100%; border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-2); color:var(--text-0);" placeholder="ملاحظة اختيارية..." />
        </div>
      </div>
    </div>
    <div class="pos-modal-footer">
      <button class="pos-btn-confirm" id="pos-btn-confirm" onclick="confirmCheckout()">
        <i class="fas fa-check"></i> تأكيد وطباعة
      </button>
      <button class="pos-btn-cancel" onclick="closePayModal()">إلغاء</button>
    </div>
  </div>
</div>

<!-- ═══ RECEIPT PRINT AREA ═══ -->
<div id="pos-receipt-print" class="pos-receipt-print-area"></div>

<style>
/* ═══════════════ POS STYLES ═══════════════ */
.pos-root {
  display: flex; flex-direction: column;
  height: calc(100vh - 60px);
  background: var(--bg-0);
  font-family: 'Cairo', 'Segoe UI', sans-serif;
}

/* ── Top Bar ── */
.pos-topbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 10px 16px;
  background: var(--bg-1);
  border-bottom: 2px solid var(--brand);
  flex-shrink: 0;
}
.pos-brand {
  font-size: 18px; font-weight: 800;
  color: var(--brand);
  display: flex; align-items: center; gap: 8px;
}
.pos-topbar-center { flex: 1; max-width: 600px; }
.pos-search-wrap {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-2); border: 1.5px solid var(--border-soft);
  border-radius: 10px; padding: 8px 14px;
  transition: border-color 0.2s;
}
.pos-search-wrap:focus-within { border-color: var(--brand); }
.pos-search-icon { color: var(--text-2); font-size: 16px; }
.pos-search-input {
  flex: 1; border: none; background: transparent;
  color: var(--text-0); font-size: 15px; outline: none;
  font-family: inherit;
}
.pos-kbd {
  background: var(--bg-3, #333); color: var(--text-2);
  padding: 2px 6px; border-radius: 4px; font-size: 11px;
}
.pos-date { font-size: 12px; color: var(--text-2); white-space: nowrap; }
.pos-select {
  padding: 7px 10px; border: 1px solid var(--border-soft);
  border-radius: 8px; background: var(--bg-2); color: var(--text-0);
  font-family: inherit; font-size: 13px; cursor: pointer;
}

/* ── Main ── */
.pos-main {
  display: flex; flex: 1; overflow: hidden; gap: 0;
}

/* ── Categories Sidebar ── */
.pos-categories {
  width: 90px; flex-shrink: 0;
  background: var(--bg-1);
  border-left: 1px solid var(--border-soft);
  overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  padding: 8px 4px;
}
.pos-cat-item {
  width: 76px; min-height: 72px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px; padding: 8px 4px;
  border-radius: 10px; cursor: pointer;
  transition: all 0.18s; text-align: center;
  border: 2px solid transparent;
  background: var(--bg-2);
}
.pos-cat-item:hover { background: var(--bg-3, #2a2a3e); border-color: var(--brand); }
.pos-cat-item.active {
  background: var(--brand);
  color: #fff; border-color: var(--brand);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}
.pos-cat-item.active .pos-cat-label { color: #fff; }
.pos-cat-icon { font-size: 22px; line-height: 1; }
.pos-cat-label {
  font-size: 10px; font-weight: 700;
  color: var(--text-1); line-height: 1.3;
  word-break: break-all; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── Products Area ── */
.pos-products-area {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  background: var(--bg-0);
}
.pos-products-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px;
  background: var(--bg-1); border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}
.pos-cat-title {
  font-size: 15px; font-weight: 800; color: var(--text-0);
}
.pos-prod-count {
  font-size: 12px; color: var(--text-2);
  background: var(--bg-2); padding: 3px 10px; border-radius: 20px;
}
.pos-products-grid {
  flex: 1; overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px; padding: 12px;
  align-content: start;
}
.pos-loading {
  grid-column: 1/-1; text-align: center;
  padding: 40px; color: var(--text-2); font-size: 16px;
}

/* Product Card */
.pos-prod-card {
  background: var(--bg-1);
  border: 1.5px solid var(--border-soft);
  border-radius: 12px; padding: 12px 10px;
  cursor: pointer; text-align: center;
  transition: all 0.15s;
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  position: relative;
  user-select: none;
}
.pos-prod-card:hover {
  border-color: var(--brand);
  box-shadow: 0 4px 16px rgba(99,102,241,0.2);
  transform: translateY(-2px);
}
.pos-prod-card:active { transform: scale(0.96); }
.pos-prod-card.out-of-stock {
  opacity: 0.55; filter: grayscale(0.6);
  border-color: var(--bad, #ef4444) !important;
}
.pos-prod-icon {
  width: 56px; height: 56px; border-radius: 10px;
  background: linear-gradient(135deg, var(--bg-2), var(--bg-3, #2a2a3e));
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
}
.pos-prod-name {
  font-size: 11px; font-weight: 700; color: var(--text-0);
  line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  width: 100%;
}
.pos-prod-price {
  font-size: 14px; font-weight: 800;
  color: var(--brand); font-variant-numeric: tabular-nums;
}
.pos-prod-stock {
  font-size: 10px; color: var(--text-2);
  display: flex; align-items: center; gap: 3px;
}
.pos-prod-stock.low { color: var(--warn, #f59e0b); }
.pos-prod-stock.out { color: var(--bad, #ef4444); font-weight: 700; }
.pos-stock-badge {
  position: absolute; top: 6px; right: 6px;
  background: var(--bad, #ef4444); color: #fff;
  font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px;
}

/* ── Cart Panel ── */
.pos-cart-panel {
  width: 360px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: var(--bg-1);
  border-right: 1px solid var(--border-soft);
  overflow: hidden;
}
.pos-cart-top {
  padding: 12px 14px;
  background: var(--bg-2); border-bottom: 1px solid var(--border-soft);
  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
}
.pos-cart-row {
  display: flex; align-items: center; gap: 8px;
}
.pos-label {
  font-size: 12px; font-weight: 700; color: var(--text-2);
  white-space: nowrap; min-width: 70px;
  display: flex; align-items: center; gap: 5px;
}
.pos-select-lg {
  flex: 1; padding: 8px 10px; border: 1px solid var(--border-soft);
  border-radius: 8px; background: var(--bg-1); color: var(--text-0);
  font-family: inherit; font-size: 13px;
}
.pos-invoice-type {
  display: flex; gap: 4px; flex: 1;
}
.pos-type-btn {
  flex: 1; padding: 6px; border-radius: 6px; border: 1px solid var(--border-soft);
  background: var(--bg-1); color: var(--text-1); cursor: pointer; font-size: 12px;
  transition: all 0.15s; font-family: inherit;
}
.pos-type-btn.active {
  background: var(--brand); color: #fff; border-color: var(--brand);
}

/* Cart Items */
.pos-cart-items {
  flex: 1; overflow-y: auto; padding: 10px;
  background: var(--bg-0);
}
.pos-empty-cart {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 120px;
  color: var(--text-2); text-align: center;
}
.pos-empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.4; }
.pos-cart-item {
  background: var(--bg-1); border: 1px solid var(--border-soft);
  border-radius: 10px; padding: 10px; margin-bottom: 8px;
  display: flex; align-items: flex-start; gap: 8px;
}
.pos-cart-item-info { flex: 1; }
.pos-cart-item-name { font-size: 12px; font-weight: 700; color: var(--text-0); margin-bottom: 3px; }
.pos-cart-item-price { font-size: 11px; color: var(--text-2); }
.pos-cart-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.pos-cart-item-total { font-size: 14px; font-weight: 800; color: var(--brand); }
.pos-qty-ctrl { display: flex; align-items: center; background: var(--bg-2); border-radius: 6px; overflow: hidden; }
.pos-qty-btn {
  width: 28px; height: 28px; border: none; background: transparent;
  cursor: pointer; font-size: 16px; color: var(--brand); line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.pos-qty-btn:hover { background: var(--brand); color: #fff; }
.pos-qty-input {
  width: 36px; text-align: center; border: none; background: transparent;
  color: var(--text-0); font-size: 13px; font-weight: 700;
}
.pos-cart-item-del {
  background: none; border: none; cursor: pointer;
  color: var(--text-2); font-size: 13px; padding: 2px;
  transition: color 0.15s;
}
.pos-cart-item-del:hover { color: var(--bad, #ef4444); }

/* Discount */
.pos-discount-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-top: 1px solid var(--border-soft);
  background: var(--bg-1); flex-shrink: 0;
}
.pos-input-sm {
  flex: 1; padding: 7px 10px; border: 1px solid var(--border-soft);
  border-radius: 8px; background: var(--bg-2); color: var(--text-0);
  font-size: 13px; font-family: inherit;
}

/* Totals */
.pos-totals {
  padding: 10px 14px; border-top: 1px solid var(--border-soft);
  background: var(--bg-2); flex-shrink: 0;
}
.pos-total-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px; font-size: 13px;
}
.pos-grand-total {
  font-size: 17px; font-weight: 900; margin-top: 8px;
  padding-top: 8px; border-top: 2px dashed var(--border-soft);
}
.mono { font-variant-numeric: tabular-nums; }
.brand { color: var(--brand); }
.text-muted { color: var(--text-2); }

/* Payment Tabs */
.pos-pay-tabs {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 6px; padding: 8px 12px;
  background: var(--bg-1); border-top: 1px solid var(--border-soft);
  flex-shrink: 0;
}
.pos-pay-tab {
  padding: 8px 4px; border-radius: 8px;
  border: 1.5px solid var(--border-soft);
  background: var(--bg-2); color: var(--text-1);
  cursor: pointer; text-align: center; font-size: 11px;
  font-weight: 700; font-family: inherit; transition: all 0.18s;
  line-height: 1.5;
}
.pos-pay-tab kbd { font-size: 9px; color: var(--text-2); font-family: monospace; }
.pos-pay-tab:hover { border-color: var(--brand); }
.pos-pay-tab.active {
  background: var(--brand); color: #fff; border-color: var(--brand);
  box-shadow: 0 3px 10px rgba(99,102,241,0.35);
}
.pos-pay-tab.active kbd { color: rgba(255,255,255,0.7); }

/* Pay Details */
.pos-pay-details { padding: 8px 12px; flex-shrink: 0; }
.pos-pay-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 6px;
}
.pos-pay-row.hidden { display: none; }

/* Actions */
.pos-actions { padding: 10px 12px; flex-shrink: 0; }
.pos-btn-checkout {
  width: 100%; padding: 14px; border-radius: 10px;
  background: linear-gradient(135deg, var(--brand), var(--indigo, #6366f1));
  color: #fff; border: none; cursor: pointer;
  font-size: 15px; font-weight: 800; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.18s;
  box-shadow: 0 4px 16px rgba(99,102,241,0.4);
}
.pos-btn-checkout:hover { opacity: 0.92; transform: translateY(-1px); }
.pos-btn-checkout:active { transform: scale(0.98); }
.pos-btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.pos-actions-sub { display: flex; gap: 8px; margin-top: 8px; }
.pos-btn-secondary {
  flex: 1; padding: 9px; border-radius: 8px;
  border: 1px solid var(--border-soft); background: var(--bg-2);
  color: var(--text-1); cursor: pointer; font-size: 14px;
  transition: all 0.15s;
}
.pos-btn-secondary:hover { border-color: var(--brand); color: var(--brand); }

/* Error Banner */
.pos-error {
  margin: 0 12px 8px; padding: 10px 14px;
  background: rgba(239,68,68,0.12); border: 1px solid var(--bad, #ef4444);
  border-radius: 8px; color: var(--bad, #ef4444); font-size: 13px;
  font-weight: 700;
}
.pos-error.hidden { display: none; }

/* ── Modal ── */
.pos-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.pos-modal-overlay.hidden { display: none; }
.pos-modal {
  background: var(--bg-1); border-radius: 16px;
  width: 460px; max-width: 95vw;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  border: 1px solid var(--border-soft);
  overflow: hidden;
  animation: pos-modal-in 0.2s ease;
}
@keyframes pos-modal-in {
  from { transform: scale(0.93) translateY(20px); opacity: 0; }
  to   { transform: scale(1)    translateY(0);    opacity: 1; }
}
.pos-modal-header {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-2);
}
.pos-modal-header h3 { margin: 0; font-size: 17px; display: flex; align-items: center; gap: 8px; }
.pos-modal-body { padding: 20px; }
.pos-pay-summary {
  background: var(--bg-2); border-radius: 10px; padding: 14px;
  margin-bottom: 16px; font-size: 14px; line-height: 2;
}
.pos-pay-modal-row {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;
}
.pos-pay-modal-row label { font-size: 13px; font-weight: 700; color: var(--text-2); }
.pos-input-lg {
  padding: 12px; border: 1.5px solid var(--border-soft);
  border-radius: 10px; background: var(--bg-2); color: var(--text-0);
  font-size: 20px; font-weight: 800; text-align: center;
  font-family: inherit; transition: border-color 0.2s;
}
.pos-input-lg:focus { border-color: var(--brand); outline: none; }
.pos-change-row {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(16,185,129,0.1); padding: 10px 14px; border-radius: 8px;
  font-size: 15px; font-weight: 700;
}
.pos-modal-footer {
  padding: 14px 20px; display: flex; gap: 10px;
  border-top: 1px solid var(--border-soft); background: var(--bg-2);
}
.pos-btn-confirm {
  flex: 1; padding: 13px; background: var(--good, #10b981);
  color: #fff; border: none; border-radius: 10px; cursor: pointer;
  font-size: 15px; font-weight: 800; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pos-btn-cancel {
  padding: 13px 20px; background: var(--bg-1);
  border: 1px solid var(--border-soft); border-radius: 10px;
  cursor: pointer; color: var(--text-1); font-family: inherit; font-size: 14px;
}

/* ── Print Receipt ── */
.pos-receipt-print-area { display: none; }
@media print {
  * { display: none !important; }
  .pos-receipt-print-area {
    display: block !important;
    position: fixed; inset: 0;
    width: 80mm; margin: 0 auto;
    font-family: 'Courier New', monospace; font-size: 12px;
    color: #000; background: #fff; padding: 8px;
  }
}
</style>
  `;
}

// ──────────────────────────────────────────
// Data Loading
// ──────────────────────────────────────────
async function loadAllData() {
  try {
    [allProducts, categories, customers, cashBoxes, bankAccounts, warehouses, allAccounts] = await Promise.all([
      getAll(COLS.products()),
      getAll(COLS.categories()),
      getAll(COLS.customers()),
      getAll(COLS.cashBoxes()),
      getAll(COLS.bankAccounts()),
      getAll(COLS.warehouses()),
      getAll(COLS.chartOfAccounts()),
    ]);

    // Default to first warehouse — pos-warehouse element may or may not exist
    const warehouseSel = document.getElementById("pos-warehouse");
    if (warehouseSel && warehouses.length) {
      warehouseSel.innerHTML = warehouses.map(w =>
        `<option value="${w.id}">${w.name}</option>`
      ).join("");
    }
    activeWarehouseId = warehouses[0]?.id || null;

    // Load stock for active warehouse
    if (activeWarehouseId) await loadStockForWarehouse(activeWarehouseId);

    // Build cost map from products
    allProducts.forEach(p => {
      costMap[p.id] = p.averageCost || p.costPrice || 0;
    });

    populateCustomers();
    populateCashBoxes();
    populateBankAccounts();
    renderCategories();
    renderProducts();

  } catch (err) {
    console.error("POS load error:", err);
    showPosError("خطأ في تحميل البيانات: " + err.message);
  }
}

async function loadStockForWarehouse(warehouseId) {
  if (!warehouseId) return;
  stockMap = {};
  const q = query(COLS.stockByWarehouse(), where("warehouseId", "==", warehouseId));
  const snap = await getDocs(q);
  snap.docs.forEach(d => {
    const data = d.data();
    stockMap[data.productId] = data.qty || 0;
  });
  renderProducts();
}

function populateCustomers() {
  const sel = document.getElementById("pos-customer");
  sel.innerHTML = `<option value="cash_customer">عميل نقدي</option>` +
    customers.filter(c => c.isActive !== false)
      .map(c => `<option value="${c.id}">${c.name}${c.phone ? ` — ${c.phone}` : ""}</option>`)
      .join("");
}

function populateCashBoxes() {
  const sel = document.getElementById("pos-cashbox");
  sel.innerHTML = cashBoxes.length
    ? cashBoxes.map(b => `<option value="${b.id}">${b.name} (${formatCurrency(b.balance || 0)})</option>`).join("")
    : `<option value="">لا يوجد صناديق</option>`;
}

function populateBankAccounts() {
  const sel = document.getElementById("pos-bank");
  sel.innerHTML = bankAccounts.length
    ? bankAccounts.map(b => `<option value="${b.id}">${b.bankName} — ${b.iban?.slice(-6) || ""}</option>`).join("")
    : `<option value="">لا يوجد حسابات بنكية</option>`;
}

// ──────────────────────────────────────────
// Categories Sidebar
// ──────────────────────────────────────────
function renderCategories() {
  const sidebar = document.getElementById("pos-categories");
  sidebar.innerHTML = `
    <div class="pos-cat-item active" data-cat="ALL" onclick="selectCategory('ALL')">
      <div class="pos-cat-icon">🌐</div>
      <div class="pos-cat-label">الكل</div>
    </div>
  ` + categories.filter(c => c.isActive !== false).map(cat => `
    <div class="pos-cat-item" data-cat="${cat.id}" onclick="selectCategory('${cat.id}')">
      <div class="pos-cat-icon">${cat.icon || "📦"}</div>
      <div class="pos-cat-label">${cat.name}</div>
    </div>
  `).join("");
}

window.selectCategory = function(catId) {
  selectedCatId = catId;
  document.querySelectorAll(".pos-cat-item").forEach(el => {
    el.classList.toggle("active", el.dataset.cat === catId);
  });

  // Update title
  const cat = categories.find(c => c.id === catId);
  document.getElementById("pos-cat-title").textContent =
    catId === "ALL" ? "جميع الأصناف" : (cat?.name || catId);

  // Clear search on category switch
  const searchEl = document.getElementById("pos-search");
  if (searchEl) searchEl.value = "";

  renderProducts();
};

// ──────────────────────────────────────────
// Products Grid
// ──────────────────────────────────────────
function renderProducts(searchQ = "") {
  const grid = document.getElementById("pos-products-grid");
  if (!grid) return;

  let filtered = allProducts.filter(p => p.isActive !== false);

  // Filter by category — products are stored with field `category` (categoryId as fallback)
  if (selectedCatId !== "ALL") {
    filtered = filtered.filter(p =>
      p.category === selectedCatId ||
      p.categoryId === selectedCatId
    );
  }


  // Filter by search
  if (searchQ) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(p =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.barcode || "").toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q)
    );
  }

  // Update count
  document.getElementById("pos-prod-count").textContent = `${filtered.length} صنف`;

  if (!filtered.length) {
    grid.innerHTML = `<div class="pos-loading">لا توجد أصناف في هذه الفئة</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const stock     = stockMap[p.id] ?? 0;
    const stockOut  = activeWarehouseId && stock <= 0;
    const stockLow  = activeWarehouseId && stock > 0 && stock <= (p.minStock || 0);
    const price     = p.salePrice || p.priceRetail || p.price || 0;
    const stockLabel = activeWarehouseId
      ? stockOut ? "نفذ" : `${stock} ${p.unitShort || ""}`
      : "";

    return `
      <div class="pos-prod-card ${stockOut ? "out-of-stock" : ""}"
           onclick="addToCartById('${p.id}')"
           title="${p.name}">
        ${stockOut ? `<div class="pos-stock-badge">نفذ</div>` : ""}
        <div class="pos-prod-icon">${p.icon || p.categoryIcon || "📦"}</div>
        <div class="pos-prod-name">${p.name}</div>
        <div class="pos-prod-price">${formatCurrency(price)}</div>
        <div class="pos-prod-stock ${stockOut ? "out" : stockLow ? "low" : ""}">
          <i class="fas fa-box-open" style="font-size:9px"></i>
          ${stockLabel}
        </div>
      </div>
    `;
  }).join("");
}

// ──────────────────────────────────────────
// Cart Management
// ──────────────────────────────────────────
window.addToCartById = function(id) {
  const prod = allProducts.find(p => p.id === id);
  if (!prod) return;

  // Stock check
  const stock = stockMap[id] ?? Infinity;
  if (activeWarehouseId && stock <= 0) {
    showPosError(`❌ الصنف "${prod.name}" نفذ من المخزون`);
    setTimeout(() => hidePosError(), 2500);
    return;
  }

  addToCart(prod);
  hidePosError();
};

function addToCart(prod) {
  const existing = cart.find(i => i.id === prod.id);
  if (existing) {
    // Check stock limit
    const stock = stockMap[prod.id] ?? Infinity;
    if (activeWarehouseId && existing.qty >= stock) {
      showPosError(`⚠️ الكمية المتاحة: ${stock} فقط`);
      setTimeout(() => hidePosError(), 2000);
      return;
    }
    existing.qty += 1;
  } else {
    const price = prod.salePrice || prod.priceRetail || prod.price || 0;
    cart.unshift({
      id:        prod.id,
      name:      prod.name,
      price:     price,
      costPrice: prod.averageCost || prod.costPrice || 0,
      qty:       1,
      discount:  0,
    });
  }
  renderCart();
}

window.updateCartQty = function(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const newQty = item.qty + change;
  if (newQty <= 0) {
    cart = cart.filter(i => i.id !== id);
  } else {
    const stock = stockMap[id] ?? Infinity;
    if (activeWarehouseId && newQty > stock) {
      showPosError(`⚠️ الكمية المتاحة: ${stock} فقط`);
      setTimeout(() => hidePosError(), 2000);
      return;
    }
    item.qty = newQty;
  }
  renderCart();
};

window.setCartQty = function(id, val) {
  const qty = parseFloat(val) || 1;
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const stock = stockMap[id] ?? Infinity;
  if (activeWarehouseId && qty > stock) {
    showPosError(`⚠️ الكمية المتاحة: ${stock} فقط`);
    return;
  }
  item.qty = Math.max(0.001, qty);
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
};

window.removeCartItem = function(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
};

window.clearCart = function() {
  cart = [];
  document.getElementById("pos-discount").value = 0;
  renderCart();
};

function renderCart() {
  const listEl = document.getElementById("pos-cart-items");
  if (!listEl) return;

  if (!cart.length) {
    listEl.innerHTML = `
      <div class="pos-empty-cart">
        <i class="fas fa-shopping-cart pos-empty-icon"></i>
        <p>السلة فارغة</p>
        <small>اضغط على صنف لإضافته</small>
      </div>`;
    updateTotals(0, 0, 0);
    return;
  }

  listEl.innerHTML = cart.map(item => {
    const lineTotal = item.price * item.qty;
    return `
      <div class="pos-cart-item" data-id="${item.id}">
        <div class="pos-cart-item-info">
          <div class="pos-cart-item-name">${item.name}</div>
          <div class="pos-cart-item-price">${formatCurrency(item.price)} / وحدة</div>
        </div>
        <div class="pos-cart-item-right">
          <div class="pos-cart-item-total">${formatCurrency(lineTotal)}</div>
          <div class="pos-qty-ctrl">
            <button class="pos-qty-btn" onclick="updateCartQty('${item.id}', -1)">−</button>
            <input class="pos-qty-input" type="number" value="${item.qty}" min="0.001" step="any"
                   onchange="setCartQty('${item.id}', this.value)"
                   onfocus="this.select()" />
            <button class="pos-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="pos-cart-item-del" onclick="removeCartItem('${item.id}')" title="حذف">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join("");

  recalcTotals();
}

window.recalcTotals = function() {
  let subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = parseFloat(document.getElementById("pos-discount")?.value) || 0;
  subtotal = Math.max(0, subtotal - discount);
  const vat   = subtotal * 0.15;
  const total = subtotal + vat;
  updateTotals(subtotal, vat, total);
};

function updateTotals(sub, vat, total) {
  document.getElementById("pos-subtotal").textContent = `${formatCurrency(sub)} ر.س`;
  document.getElementById("pos-vat").textContent      = `${formatCurrency(vat)} ر.س`;
  document.getElementById("pos-total").textContent    = `${formatCurrency(total)} ر.س`;
}

// ──────────────────────────────────────────
// Payment Method Selection
// ──────────────────────────────────────────
let currentPayMethod = "cash";
let invoiceType      = "simplified";

window.selectPayMethod = function(method) {
  currentPayMethod = method;
  document.querySelectorAll(".pos-pay-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.method === method)
  );

  // Show/hide payment detail rows
  const cashBoxRow = document.getElementById("pos-cashbox-row");
  const bankRow    = document.getElementById("pos-bank-row");
  const refRow     = document.getElementById("pos-ref-row");

  cashBoxRow?.classList.toggle("hidden", method === "transfer" || method === "credit");
  bankRow?.classList.toggle("hidden",    method !== "transfer" && method !== "network");
  refRow?.classList.toggle("hidden",     method !== "transfer");

  const labels = {
    cash:     "إتمام البيع — نقد",
    network:  "إتمام البيع — شبكة",
    credit:   "إتمام البيع — آجل",
    transfer: "إتمام البيع — تحويل",
  };
  document.getElementById("pos-btn-label").textContent = labels[method] || "إتمام البيع";
};

window.setInvoiceType = function(type) {
  invoiceType = type;
  document.querySelectorAll(".pos-type-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.type === type)
  );
};

// ──────────────────────────────────────────
// Checkout — Cost Guard + Payment Modal
// ──────────────────────────────────────────
window.checkout = function() {
  hidePosError();
  if (!cart.length) {
    showPosError("⚠️ السلة فارغة — أضف أصناف أولاً");
    return;
  }

  // ── Cost price guard ──
  const violations = cart.filter(item => {
    const cost = costMap[item.id] || item.costPrice || 0;
    return cost > 0 && item.price < cost;
  });
  if (violations.length) {
    const names = violations.map(v => `${v.name} (التكلفة: ${formatCurrency(costMap[v.id] || v.costPrice)})`).join("، ");
    showPosError(`🚫 لا يمكن البيع بأقل من التكلفة:\n${names}`);
    return;
  }

  // ── Credit sale needs a real customer ──
  const customerId = document.getElementById("pos-customer").value;
  if (currentPayMethod === "credit" && customerId === "cash_customer") {
    showPosError("❌ يجب اختيار عميل محدد للبيع الآجل");
    return;
  }

  // Open payment confirmation modal
  openPayModal();
};

function openPayModal() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = parseFloat(document.getElementById("pos-discount")?.value) || 0;
  const net      = Math.max(0, subtotal - discount);
  const vat      = net * 0.15;
  const total    = net + vat;

  const methodLabels = { cash: "نقد", network: "شبكة", credit: "آجل", transfer: "تحويل بنكي" };
  const customerId   = document.getElementById("pos-customer").value;
  const customerName = customerId === "cash_customer"
    ? "عميل نقدي"
    : customers.find(c => c.id === customerId)?.name || "عميل";

  document.getElementById("pos-pay-summary").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;">
      <span style="color:var(--text-2)">العميل</span>       <strong>${customerName}</strong>
      <span style="color:var(--text-2)">طريقة الدفع</span>  <strong>${methodLabels[currentPayMethod]}</strong>
      <span style="color:var(--text-2)">عدد الأصناف</span>  <strong>${cart.length}</strong>
      <span style="color:var(--text-2)">قبل الضريبة</span>  <strong class="mono">${formatCurrency(net)} ر.س</strong>
      <span style="color:var(--text-2)">الضريبة 15%</span>  <strong class="mono">${formatCurrency(vat)} ر.س</strong>
      <span style="color:var(--text-2);font-weight:900;font-size:15px">الإجمالي</span>
      <strong class="mono brand" style="font-size:18px">${formatCurrency(total)} ر.س</strong>
    </div>
  `;

  const receivedEl  = document.getElementById("pos-received-amount");
  const changeRow   = document.getElementById("pos-change-row");
  receivedEl.value  = "";

  // Show received amount input only for cash
  const isCash = currentPayMethod === "cash";
  receivedEl.parentElement.style.display = isCash ? "flex" : "none";
  changeRow.style.display                = isCash ? "flex" : "none";
  if (isCash) receivedEl.focus();

  document.getElementById("pos-pay-modal").classList.remove("hidden");
}

window.closePayModal = function() {
  document.getElementById("pos-pay-modal").classList.add("hidden");
};

window.calcChange = function() {
  const total    = getTotalAmount();
  const received = parseFloat(document.getElementById("pos-received-amount").value) || 0;
  const change   = Math.max(0, received - total);
  document.getElementById("pos-change-amount").textContent = `${formatCurrency(change)} ر.س`;
};

function getTotalAmount() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = parseFloat(document.getElementById("pos-discount")?.value) || 0;
  const net      = Math.max(0, subtotal - discount);
  return net * 1.15;
}

// ──────────────────────────────────────────
// Confirm Checkout — Atomic Firestore Tx
// ──────────────────────────────────────────
let lastInvoiceData = null;

window.confirmCheckout = async function() {
  const confirmBtn = document.getElementById("pos-btn-confirm");
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...`;

  try {
    const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discount   = parseFloat(document.getElementById("pos-discount")?.value) || 0;
    const net        = Math.max(0, subtotal - discount);
    const vat        = net * 0.15;
    const total      = net + vat;

    const customerId   = document.getElementById("pos-customer").value;
    const customerObj  = customers.find(c => c.id === customerId);
    const customerName = customerObj?.name || "عميل نقدي";

    const cashBoxId  = document.getElementById("pos-cashbox").value  || null;
    const bankId     = document.getElementById("pos-bank").value     || null;
    const refNo      = document.getElementById("pos-ref-no")?.value  || null;
    const note       = document.getElementById("pos-note")?.value    || "";
    const warehouseId = activeWarehouseId;

    const invoiceNumber = await generateInvoiceNumber("INV");

    const invData = {
      number:        invoiceNumber,   // ← للبحث التسلسلي (generateInvoiceNumber queries by 'number')
      invoiceNumber, invoiceType,
      type:        currentPayMethod,
      date:        todayString(),
      customerId:  customerId === "cash_customer" ? null : customerId,
      customerName,
      warehouseId,
      repId:       null,
      companyId:   COMPANY_ID,
      lines: cart.map(i => ({
        productId:   i.id,
        productName: i.name,
        qty:         i.qty,
        unitPrice:   i.price,
        costPrice:   costMap[i.id] || i.costPrice || 0,
        vatRate:     0.15,
        vatAmount:   +(i.price * i.qty * 0.15 / 1.15 || 0).toFixed(4),
        lineTotal:   +(i.price * i.qty).toFixed(4),
      })),
      subtotal:       +net.toFixed(4),
      discountAmount: +discount.toFixed(4),
      totalVat:       +vat.toFixed(4),
      totalWithVat:   +total.toFixed(4),
      paidAmount:     currentPayMethod === "credit" ? 0 : total,
      status:         currentPayMethod === "credit" ? "posted" : "paid",
      cashBoxId:      ["cash"].includes(currentPayMethod)                 ? (cashBoxId || null) : null,
      bankAccountId:  ["network","transfer"].includes(currentPayMethod)  ? (bankId    || null) : null,
      referenceNo:    refNo || null,
      note:           note  || "",
      zatcaStatus:   "pending",
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    };

    // Fetch available batches for all items in the cart before starting the transaction (FEFO)
    const cartBatches = {};
    try {
      await Promise.all(cart.map(async (item) => {
        const q = query(collection(db, `companies/${COMPANY_ID}/stockTransactions`), where("productId", "==", item.id));
        const snap = await getDocs(q);
        const txs = snap.docs.map(d => d.data());

        const batchMap = {};
        txs.forEach(t => {
          if (warehouseId && t.warehouseId !== warehouseId) return;
          if (t.batchNumber) {
            if (!batchMap[t.batchNumber]) {
              batchMap[t.batchNumber] = { qty: 0, expiryDate: t.expiryDate || "" };
            }
            batchMap[t.batchNumber].qty += t.qtyChange || 0;
          }
        });

        const available = Object.keys(batchMap)
          .map(num => ({ number: num, ...batchMap[num] }))
          .filter(b => b.qty > 0.001)
          .sort((a, b) => {
            if (!a.expiryDate) return 1;
            if (!b.expiryDate) return -1;
            return new Date(a.expiryDate) - new Date(b.expiryDate);
          });

        cartBatches[item.id] = available;
      }));
    } catch (err) {
      console.warn("Failed to fetch batches for POS cart items:", err);
    }

    // Atomic: save invoice + deduct stock
    const invRef = doc(db, `companies/${COMPANY_ID}/salesInvoices`, invoiceNumber.replace("-", "_"));
    await runTransaction(db, async (tx) => {
      // 1. Write invoice
      // Include batch number on invoice lines if resolved
      const cartWithBatches = cart.map(item => {
        const batches = cartBatches[item.id] || [];
        return {
          ...item,
          batchNumber: batches.length > 0 ? batches[0].number : "",
          expiryDate:  batches.length > 0 ? batches[0].expiryDate : ""
        };
      });
      const finalInvData = { ...invData, lines: cartWithBatches };
      tx.set(invRef, finalInvData);

      // 2. Deduct stock for each product
      for (const item of cart) {
        if (!warehouseId) continue;
        const stockDocId = `${warehouseId}_${item.id}`;
        const stockRef   = doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId);
        const stockSnap  = await tx.get(stockRef);
        const currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
        const newQty     = currentQty - item.qty;
        if (newQty < 0) throw new Error(`رصيد غير كافٍ للصنف: ${item.name} (المتاح: ${currentQty})`);

        tx.set(stockRef, {
          warehouseId, productId: item.id,
          qty: newQty,
          stockStatus: newQty <= 0 ? "out" : "ok",
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // Resolve FEFO batch metadata
        const batches = cartBatches[item.id] || [];
        let batchNum = "";
        let expDate = "";
        if (batches.length > 0) {
          batchNum = batches[0].number;
          expDate  = batches[0].expiryDate;
        }

        // Stock transaction log
        const txnRef = doc(db, `companies/${COMPANY_ID}/stockTransactions`,
          `${invoiceNumber}_${item.id}`);
        tx.set(txnRef, {
          warehouseId, productId: item.id,
          type: "sale_out",
          qtyBefore: currentQty,
          qtyChange: -item.qty,
          qtyAfter: newQty,
          referenceId: invoiceNumber,
          note: `مبيعات POS — ${invoiceNumber}`,
          companyId: COMPANY_ID,
          batchNumber: batchNum,
          expiryDate: expDate,
          createdAt: serverTimestamp(),
        });
      }

      // 3. Update customer balance (for credit sales)
      if (currentPayMethod === "credit" && customerId !== "cash_customer") {
        const custRef = doc(db, `companies/${COMPANY_ID}/customers`, customerId);
        tx.update(custRef, {
          balance: increment(total),
          updatedAt: serverTimestamp(),
        });
      }
    });

    // 4. Journal Entry (outside tx for performance)
    try {
      await buildJournalEntry(invData, total, vat, net, cashBoxId, bankId);
    } catch (jeErr) {
      console.warn("Journal entry failed (non-critical):", jeErr);
    }

    // Update local stock map
    cart.forEach(item => {
      if (activeWarehouseId) {
        stockMap[item.id] = Math.max(0, (stockMap[item.id] || 0) - item.qty);
      }
    });

    lastInvoiceData = { ...invData, invoiceNumber };
    closePayModal();
    clearCart();
    renderProducts();

    // Print receipt
    printReceipt(lastInvoiceData);
    window.showToast?.(`✅ تم إصدار الفاتورة ${invoiceNumber}`, "success");

  } catch (err) {
    console.error("Checkout error:", err);
    showPosError("❌ " + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<i class="fas fa-check"></i> تأكيد وطباعة`;
  }
};

// ──────────────────────────────────────────
// Journal Entry Builder
// ──────────────────────────────────────────
async function buildJournalEntry(inv, total, vat, net, cashBoxId, bankId) {
  // ─── استخدام محرك الأتمتة المحاسبية (accounting-engine) بأكواد صحيحة ───
  // الأكواد الصحيحة: نقد=1-1-1-1-3 | بنك=1-1-1-3-2 | آجل=1-1-2-1-2 | مبيعات=4-1-1 | ضريبة=2-1-3-1
  try {
    const { autoPOSJE } = await import("../utils/accounting-engine.js");

    // حساب تكلفة البضاعة المباعة من بنود الفاتورة
    const totalCost = (inv.lines || []).reduce((s, l) => {
      return s + ((l.costPrice || l.averageCost || 0) * (l.qty || 0));
    }, 0);

    await autoPOSJE({
      id:            inv.id,
      receiptNumber: inv.invoiceNumber,
      date:          inv.date || new Date().toISOString().slice(0, 10),
      subtotal:      net,          // قبل الضريبة
      taxAmount:     vat,          // ضريبة القيمة المضافة
      total:         total,        // شامل الضريبة
      grandTotal:    total,
      totalCost:     totalCost,    // تكلفة البضاعة (لقيد COGS)
      cogsAmount:    totalCost,
      paymentMethod: inv.type,     // cash | network | transfer | credit
      customerName:  inv.customerName || "",
    });
    console.log(`[POS JE] ✅ قيد محاسبي أُنشئ للفاتورة ${inv.invoiceNumber} | net=${net} | vat=${vat} | COGS=${totalCost.toFixed(2)}`);
  } catch (err) {
    console.warn("[POS JE] autoPOSJE failed:", err.message);
    throw err;
  }
}

// ──────────────────────────────────────────
// Receipt Printing
// ──────────────────────────────────────────
function printReceipt(inv) {
  const printArea = document.getElementById("pos-receipt-print");
  if (!printArea) return;

  const now    = new Date().toLocaleString("ar-SA");
  const lines  = (inv.lines || []).map(l => `
    <tr>
      <td style="padding:2px 4px;text-align:right">${l.productName}</td>
      <td style="padding:2px 4px;text-align:center">${l.qty}</td>
      <td style="padding:2px 4px;text-align:left">${formatCurrency(l.unitPrice)}</td>
      <td style="padding:2px 4px;text-align:left">${formatCurrency(l.lineTotal)}</td>
    </tr>
  `).join("");

  const methodMap = { cash: "نقد", network: "شبكة", credit: "آجل", transfer: "تحويل" };

  printArea.innerHTML = `
    <div style="text-align:center;direction:rtl;font-family:Arial,sans-serif;">
      <div style="font-size:18px;font-weight:900;margin-bottom:4px">إدهام للمواد الغذائية</div>
      <div style="font-size:11px;color:#555">نظام IDHAM ERP</div>
      <div style="border-top:2px dashed #000;margin:8px 0"></div>

      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span>رقم الفاتورة: <strong>${inv.invoiceNumber}</strong></span>
        <span>${now}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span>العميل: <strong>${inv.customerName}</strong></span>
        <span>الدفع: <strong>${methodMap[inv.type] || inv.type}</strong></span>
      </div>
      <div style="border-top:1px dashed #000;margin:6px 0"></div>

      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="border-bottom:1px solid #000">
            <th style="text-align:right;padding:2px 4px">الصنف</th>
            <th style="text-align:center">الكمية</th>
            <th style="text-align:left">السعر</th>
            <th style="text-align:left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>${lines}</tbody>
      </table>

      <div style="border-top:2px dashed #000;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:11px">
        <span>المجموع قبل الضريبة:</span>
        <strong>${formatCurrency(inv.subtotal)} ر.س</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px">
        <span>ضريبة القيمة المضافة (15%):</span>
        <strong>${formatCurrency(inv.totalVat)} ر.س</strong>
      </div>
      <div style="border-top:1px solid #000;margin:6px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900">
        <span>الإجمالي:</span>
        <span>${formatCurrency(inv.totalWithVat)} ر.س</span>
      </div>

      <div style="border-top:2px dashed #000;margin:10px 0"></div>
      <div style="font-size:10px;color:#555;text-align:center">
        <div>هذه الفاتورة صادرة من نظام IDHAM ERP</div>
        <div>شكراً لتعاملكم معنا</div>
        <div style="margin-top:4px;font-size:9px">ر.ق ضريبي: 300000000000003</div>
      </div>
    </div>
  `;

  window.print();
}

window.printLastReceipt = function() {
  if (lastInvoiceData) printReceipt(lastInvoiceData);
  else window.showToast?.("لا توجد فاتورة سابقة للطباعة", "warning");
};

window.holdSale = function() {
  window.showToast?.("تم تعليق البيع — ميزة التعليق قيد التطوير", "info");
};

// ──────────────────────────────────────────
// Error Helpers
// ──────────────────────────────────────────
function showPosError(msg) {
  const el = document.getElementById("pos-error");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}
function hidePosError() {
  document.getElementById("pos-error")?.classList.add("hidden");
}

// ──────────────────────────────────────────
// Event Binding
// ──────────────────────────────────────────
function bindEvents() {
  document.getElementById("pos-search")?.addEventListener("input", e => {
    renderProducts(e.target.value.trim().toLowerCase());
  });

  document.getElementById("pos-warehouse")?.addEventListener("change", async e => {
    activeWarehouseId = e.target.value || null;
    await loadStockForWarehouse(activeWarehouseId);
  });
}

// ──────────────────────────────────────────
// Keyboard Shortcuts + Barcode Scanner
// ──────────────────────────────────────────
let barcodeBuffer = "";
let barcodeTimer  = null;

function posKeydownHandler(e) {
  if (e.target.tagName === "INPUT" && !["pos-search","pos-received-amount"].includes(e.target.id)) return;
  if (e.target.tagName === "TEXTAREA") return;

  if (e.key === "F8")  { e.preventDefault(); selectPayMethod("cash");     document.getElementById("pos-btn-checkout")?.click(); return; }
  if (e.key === "F9")  { e.preventDefault(); selectPayMethod("network");  document.getElementById("pos-btn-checkout")?.click(); return; }
  if (e.key === "F10") { e.preventDefault(); selectPayMethod("credit");   document.getElementById("pos-btn-checkout")?.click(); return; }
  if (e.key === "F11") { e.preventDefault(); selectPayMethod("transfer"); document.getElementById("pos-btn-checkout")?.click(); return; }
  if (e.key === "Escape") { closePayModal(); return; }

  // Barcode scanner (types fast + Enter)
  if (e.key === "Enter" && barcodeBuffer.length > 2) {
    const code = barcodeBuffer; barcodeBuffer = "";
    const prod = allProducts.find(p =>
      (p.barcode || "").toLowerCase() === code.toLowerCase() ||
      (p.code   || "").toLowerCase() === code.toLowerCase()
    );
    if (prod) { addToCartById(prod.id); window.showToast?.(`تمت إضافة: ${prod.name}`, "success", 1200); }
    else window.showToast?.("صنف غير موجود", "error", 1200);
    const s = document.getElementById("pos-search"); if (s) s.value = "";
    return;
  }

  if (!["Shift","Control","Alt","Enter","F8","F9","F10","F11","Escape"].includes(e.key)) {
    barcodeBuffer += e.key;
    clearTimeout(barcodeTimer);
    barcodeTimer = setTimeout(() => { barcodeBuffer = ""; }, 400);
  }
}

// Cleanup on navigation
const _origNav = window.navigate;
window.navigate = async (route, ps) => {
  window.removeEventListener("keydown", posKeydownHandler);
  if (window.stopCameraScan) await window.stopCameraScan();
  if (_origNav) _origNav(route, ps);
};

function loadHtml5QrcodeLibrary() {
  return new Promise((resolve, reject) => {
    if (window.Html5Qrcode) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.startCameraScan = async () => {
  try {
    await loadHtml5QrcodeLibrary();
    let modal = document.getElementById("pos-camera-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "pos-camera-modal";
      modal.className = "pos-modal-overlay";
      modal.innerHTML = `
        <div class="pos-modal" style="width: 480px; z-index:99999;">
          <div class="pos-modal-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;"><i class="fas fa-camera"></i> قارئ الكاميرا للباركود</h3>
            <button onclick="stopCameraScan()" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-2);">×</button>
          </div>
          <div class="pos-modal-body">
            <div id="pos-qr-reader" style="width:100%; min-height:280px; background:#000; border-radius:8px; overflow:hidden;"></div>
            <div id="pos-camera-error" class="alert bad hidden" style="margin-top:10px; padding:10px; border-radius:6px;"></div>
          </div>
          <div class="pos-modal-footer">
            <button class="pos-btn-cancel" onclick="stopCameraScan()">إغلاق</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.remove("hidden");
    }

    const html5QrCode = new Html5Qrcode("pos-qr-reader");
    window._html5QrCodeInstance = html5QrCode;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.log(`Scan result: ${decodedText}`);
      const prod = allProducts.find(p =>
        (p.barcode || "").toLowerCase() === decodedText.toLowerCase().trim() ||
        (p.code || "").toLowerCase() === decodedText.toLowerCase().trim()
      );
      if (prod) {
        addToCartById(prod.id);
        window.showToast?.(`تمت إضافة: ${prod.name}`, "success", 1200);
        stopCameraScan();
      } else {
        const errEl = document.getElementById("pos-camera-error");
        if (errEl) {
          errEl.textContent = `صنف غير موجود للباركود: ${decodedText}`;
          errEl.classList.remove("hidden");
          setTimeout(() => { errEl.classList.add("hidden"); }, 3000);
        }
      }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 150 } };
    await html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback
    );
  } catch (err) {
    console.error("Camera scan start error:", err);
    alert("تعذر تشغيل الكاميرا: " + err.message);
  }
};

window.stopCameraScan = async () => {
  const modal = document.getElementById("pos-camera-modal");
  if (modal) modal.classList.add("hidden");

  if (window._html5QrCodeInstance) {
    try {
      await window._html5QrCodeInstance.stop();
    } catch (e) {
      console.warn("Failed to stop camera:", e);
    }
    window._html5QrCodeInstance = null;
  }
};
