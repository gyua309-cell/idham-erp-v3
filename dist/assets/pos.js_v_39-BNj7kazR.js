const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/accounting-engine-DReIGn_F.js","assets/index-C8cvrlnW.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as I,a as w,f as l,z as ut,C as E,t as ft,d as L,_ as mt}from"./index-C8cvrlnW.js";import{query as ot,where as at,getDocs as st,serverTimestamp as T,collection as bt,doc as F,runTransaction as gt,increment as xt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let z=[],U=[],Q=[],V=[],G=[],vt=[],R=[],v={},O={},i=[],_="ALL",f=null;async function Nt(t,e){t.innerHTML=yt(),zt(),window.addEventListener("keydown",ct),await ht()}function yt(){return`
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
      <div class="pos-date"><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
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
  `}async function ht(){try{[z,U,Q,V,G,R,vt]=await Promise.all([I(w.products()),I(w.categories()),I(w.customers()),I(w.cashBoxes()),I(w.bankAccounts()),I(w.warehouses()),I(w.chartOfAccounts())]);const t=document.getElementById("pos-warehouse");t&&R.length&&(t.innerHTML=R.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")),f=R[0]?.id||null,f&&await nt(f),z.forEach(e=>{O[e.id]=e.averageCost||e.costPrice||0}),wt(),kt(),It(),Et(),M()}catch(t){console.error("POS load error:",t),x("خطأ في تحميل البيانات: "+t.message)}}async function nt(t){if(!t)return;v={};const e=ot(w.stockByWarehouse(),at("warehouseId","==",t));(await st(e)).docs.forEach(a=>{const s=a.data();v[s.productId]=s.qty||0}),M()}function wt(){const t=document.getElementById("pos-customer");t.innerHTML='<option value="cash_customer">عميل نقدي</option>'+Q.filter(e=>e.isActive!==!1).map(e=>`<option value="${e.id}">${e.name}${e.phone?` — ${e.phone}`:""}</option>`).join("")}function kt(){const t=document.getElementById("pos-cashbox");t.innerHTML=V.length?V.map(e=>`<option value="${e.id}">${e.name} (${l(e.balance||0)})</option>`).join(""):'<option value="">لا يوجد صناديق</option>'}function It(){const t=document.getElementById("pos-bank");t.innerHTML=G.length?G.map(e=>`<option value="${e.id}">${e.bankName} — ${e.iban?.slice(-6)||""}</option>`).join(""):'<option value="">لا يوجد حسابات بنكية</option>'}function Et(){const t=document.getElementById("pos-categories");t.innerHTML=`
    <div class="pos-cat-item active" data-cat="ALL" onclick="selectCategory('ALL')">
      <div class="pos-cat-icon">🌐</div>
      <div class="pos-cat-label">الكل</div>
    </div>
  `+U.filter(e=>e.isActive!==!1).map(e=>`
    <div class="pos-cat-item" data-cat="${e.id}" onclick="selectCategory('${e.id}')">
      <div class="pos-cat-icon">${e.icon||"📦"}</div>
      <div class="pos-cat-label">${e.name}</div>
    </div>
  `).join("")}window.selectCategory=function(t){_=t,document.querySelectorAll(".pos-cat-item").forEach(a=>{a.classList.toggle("active",a.dataset.cat===t)});const e=U.find(a=>a.id===t);document.getElementById("pos-cat-title").textContent=t==="ALL"?"جميع الأصناف":e?.name||t;const o=document.getElementById("pos-search");o&&(o.value=""),M()};function M(t=""){const e=document.getElementById("pos-products-grid");if(!e)return;let o=z.filter(a=>a.isActive!==!1);if(_!=="ALL"&&(o=o.filter(a=>a.category===_||a.categoryId===_)),t){const a=t.toLowerCase();o=o.filter(s=>(s.name||"").toLowerCase().includes(a)||(s.barcode||"").toLowerCase().includes(a)||(s.code||"").toLowerCase().includes(a))}if(document.getElementById("pos-prod-count").textContent=`${o.length} صنف`,!o.length){e.innerHTML='<div class="pos-loading">لا توجد أصناف في هذه الفئة</div>';return}e.innerHTML=o.map(a=>{const s=v[a.id]??0,r=f&&s<=0,c=f&&s>0&&s<=(a.minStock||0),p=a.salePrice||a.priceRetail||a.price||0,b=f?r?"نفذ":`${s} ${a.unitShort||""}`:"";return`
      <div class="pos-prod-card ${r?"out-of-stock":""}"
           onclick="addToCartById('${a.id}')"
           title="${a.name}">
        ${r?'<div class="pos-stock-badge">نفذ</div>':""}
        <div class="pos-prod-icon">${a.icon||a.categoryIcon||"📦"}</div>
        <div class="pos-prod-name">${a.name}</div>
        <div class="pos-prod-price">${l(p)}</div>
        <div class="pos-prod-stock ${r?"out":c?"low":""}">
          <i class="fas fa-box-open" style="font-size:9px"></i>
          ${b}
        </div>
      </div>
    `}).join("")}window.addToCartById=function(t){const e=z.find(a=>a.id===t);if(!e)return;const o=v[t]??1/0;if(f&&o<=0){x(`❌ الصنف "${e.name}" نفذ من المخزون`),setTimeout(()=>q(),2500);return}Ct(e),q()};function Ct(t){const e=i.find(o=>o.id===t.id);if(e){const o=v[t.id]??1/0;if(f&&e.qty>=o){x(`⚠️ الكمية المتاحة: ${o} فقط`),setTimeout(()=>q(),2e3);return}e.qty+=1}else{const o=t.salePrice||t.priceRetail||t.price||0;i.unshift({id:t.id,name:t.name,price:o,costPrice:t.averageCost||t.costPrice||0,qty:1,discount:0})}S()}window.updateCartQty=function(t,e){const o=i.find(s=>s.id===t);if(!o)return;const a=o.qty+e;if(a<=0)i=i.filter(s=>s.id!==t);else{const s=v[t]??1/0;if(f&&a>s){x(`⚠️ الكمية المتاحة: ${s} فقط`),setTimeout(()=>q(),2e3);return}o.qty=a}S()};window.setCartQty=function(t,e){const o=parseFloat(e)||1,a=i.find(r=>r.id===t);if(!a)return;const s=v[t]??1/0;if(f&&o>s){x(`⚠️ الكمية المتاحة: ${s} فقط`);return}a.qty=Math.max(.001,o),a.qty<=0&&(i=i.filter(r=>r.id!==t)),S()};window.removeCartItem=function(t){i=i.filter(e=>e.id!==t),S()};window.clearCart=function(){i=[],document.getElementById("pos-discount").value=0,S()};function S(){const t=document.getElementById("pos-cart-items");if(t){if(!i.length){t.innerHTML=`
      <div class="pos-empty-cart">
        <i class="fas fa-shopping-cart pos-empty-icon"></i>
        <p>السلة فارغة</p>
        <small>اضغط على صنف لإضافته</small>
      </div>`,rt(0,0,0);return}t.innerHTML=i.map(e=>{const o=e.price*e.qty;return`
      <div class="pos-cart-item" data-id="${e.id}">
        <div class="pos-cart-item-info">
          <div class="pos-cart-item-name">${e.name}</div>
          <div class="pos-cart-item-price">${l(e.price)} / وحدة</div>
        </div>
        <div class="pos-cart-item-right">
          <div class="pos-cart-item-total">${l(o)}</div>
          <div class="pos-qty-ctrl">
            <button class="pos-qty-btn" onclick="updateCartQty('${e.id}', -1)">−</button>
            <input class="pos-qty-input" type="number" value="${e.qty}" min="0.001" step="any"
                   onchange="setCartQty('${e.id}', this.value)"
                   onfocus="this.select()" />
            <button class="pos-qty-btn" onclick="updateCartQty('${e.id}', 1)">+</button>
          </div>
        </div>
        <button class="pos-cart-item-del" onclick="removeCartItem('${e.id}')" title="حذف">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `}).join(""),recalcTotals()}}window.recalcTotals=function(){let t=i.reduce((s,r)=>s+r.price*r.qty,0);const e=parseFloat(document.getElementById("pos-discount")?.value)||0;t=Math.max(0,t-e);const o=t*.15,a=t+o;rt(t,o,a)};function rt(t,e,o){document.getElementById("pos-subtotal").textContent=`${l(t)} ر.س`,document.getElementById("pos-vat").textContent=`${l(e)} ر.س`,document.getElementById("pos-total").textContent=`${l(o)} ر.س`}let g="cash",it="simplified";window.selectPayMethod=function(t){g=t,document.querySelectorAll(".pos-pay-tab").forEach(r=>r.classList.toggle("active",r.dataset.method===t));const e=document.getElementById("pos-cashbox-row"),o=document.getElementById("pos-bank-row"),a=document.getElementById("pos-ref-row");e?.classList.toggle("hidden",t==="transfer"||t==="credit"),o?.classList.toggle("hidden",t!=="transfer"&&t!=="network"),a?.classList.toggle("hidden",t!=="transfer");const s={cash:"إتمام البيع — نقد",network:"إتمام البيع — شبكة",credit:"إتمام البيع — آجل",transfer:"إتمام البيع — تحويل"};document.getElementById("pos-btn-label").textContent=s[t]||"إتمام البيع"};window.setInvoiceType=function(t){it=t,document.querySelectorAll(".pos-type-btn").forEach(e=>e.classList.toggle("active",e.dataset.type===t))};window.checkout=function(){if(q(),!i.length){x("⚠️ السلة فارغة — أضف أصناف أولاً");return}const t=i.filter(o=>{const a=O[o.id]||o.costPrice||0;return a>0&&o.price<a});if(t.length){const o=t.map(a=>`${a.name} (التكلفة: ${l(O[a.id]||a.costPrice)})`).join("، ");x(`🚫 لا يمكن البيع بأقل من التكلفة:
${o}`);return}const e=document.getElementById("pos-customer").value;if(g==="credit"&&e==="cash_customer"){x("❌ يجب اختيار عميل محدد للبيع الآجل");return}$t()};function $t(){const t=i.reduce((P,D)=>P+D.price*D.qty,0),e=parseFloat(document.getElementById("pos-discount")?.value)||0,o=Math.max(0,t-e),a=o*.15,s=o+a,r={cash:"نقد",network:"شبكة",credit:"آجل",transfer:"تحويل بنكي"},c=document.getElementById("pos-customer").value,p=c==="cash_customer"?"عميل نقدي":Q.find(P=>P.id===c)?.name||"عميل";document.getElementById("pos-pay-summary").innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;">
      <span style="color:var(--text-2)">العميل</span>       <strong>${p}</strong>
      <span style="color:var(--text-2)">طريقة الدفع</span>  <strong>${r[g]}</strong>
      <span style="color:var(--text-2)">عدد الأصناف</span>  <strong>${i.length}</strong>
      <span style="color:var(--text-2)">قبل الضريبة</span>  <strong class="mono">${l(o)} ر.س</strong>
      <span style="color:var(--text-2)">الضريبة 15%</span>  <strong class="mono">${l(a)} ر.س</strong>
      <span style="color:var(--text-2);font-weight:900;font-size:15px">الإجمالي</span>
      <strong class="mono brand" style="font-size:18px">${l(s)} ر.س</strong>
    </div>
  `;const b=document.getElementById("pos-received-amount"),y=document.getElementById("pos-change-row");b.value="";const C=g==="cash";b.parentElement.style.display=C?"flex":"none",y.style.display=C?"flex":"none",C&&b.focus(),document.getElementById("pos-pay-modal").classList.remove("hidden")}window.closePayModal=function(){document.getElementById("pos-pay-modal").classList.add("hidden")};window.calcChange=function(){const t=Bt(),e=parseFloat(document.getElementById("pos-received-amount").value)||0,o=Math.max(0,e-t);document.getElementById("pos-change-amount").textContent=`${l(o)} ر.س`};function Bt(){const t=i.reduce((a,s)=>a+s.price*s.qty,0),e=parseFloat(document.getElementById("pos-discount")?.value)||0;return Math.max(0,t-e)*1.15}let H=null;window.confirmCheckout=async function(){const t=document.getElementById("pos-btn-confirm");t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';try{const e=i.reduce((n,$)=>n+$.price*$.qty,0),o=parseFloat(document.getElementById("pos-discount")?.value)||0,a=Math.max(0,e-o),s=a*.15,r=a+s,c=document.getElementById("pos-customer").value,b=Q.find(n=>n.id===c)?.name||"عميل نقدي",y=document.getElementById("pos-cashbox").value||null,C=document.getElementById("pos-bank").value||null,P=document.getElementById("pos-ref-no")?.value||null,D=document.getElementById("pos-note")?.value||"",k=f,h=await ut("INV"),J={number:h,invoiceNumber:h,invoiceType:it,type:g,date:ft(),customerId:c==="cash_customer"?null:c,customerName:b,warehouseId:k,repId:null,companyId:E,lines:i.map(n=>({productId:n.id,productName:n.name,qty:n.qty,unitPrice:n.price,costPrice:O[n.id]||n.costPrice||0,vatRate:.15,vatAmount:+(n.price*n.qty*.15/1.15||0).toFixed(4),lineTotal:+(n.price*n.qty).toFixed(4)})),subtotal:+a.toFixed(4),discountAmount:+o.toFixed(4),totalVat:+s.toFixed(4),totalWithVat:+r.toFixed(4),paidAmount:g==="credit"?0:r,status:g==="credit"?"posted":"paid",cashBoxId:["cash"].includes(g)&&y||null,bankAccountId:["network","transfer"].includes(g)&&C||null,referenceNo:P||null,note:D||"",zatcaStatus:"pending",createdAt:T(),updatedAt:T()},W={};try{await Promise.all(i.map(async n=>{const $=ot(bt(L,`companies/${E}/stockTransactions`),at("productId","==",n.id)),u=(await st($)).docs.map(d=>d.data()),m={};u.forEach(d=>{k&&d.warehouseId!==k||d.batchNumber&&(m[d.batchNumber]||(m[d.batchNumber]={qty:0,expiryDate:d.expiryDate||""}),m[d.batchNumber].qty+=d.qtyChange||0)});const N=Object.keys(m).map(d=>({number:d,...m[d]})).filter(d=>d.qty>.001).sort((d,B)=>d.expiryDate?B.expiryDate?new Date(d.expiryDate)-new Date(B.expiryDate):-1:1);W[n.id]=N}))}catch(n){console.warn("Failed to fetch batches for POS cart items:",n)}const lt=F(L,`companies/${E}/salesInvoices`,h.replace("-","_"));await gt(L,async n=>{const $=i.map(u=>{const m=W[u.id]||[];return{...u,batchNumber:m.length>0?m[0].number:"",expiryDate:m.length>0?m[0].expiryDate:""}}),K={...J,lines:$};n.set(lt,K);for(const u of i){if(!k)continue;const m=`${k}_${u.id}`,N=F(L,`companies/${E}/stockByWarehouse`,m),d=await n.get(N),B=d.exists()&&d.data().qty||0,j=B-u.qty;if(j<0)throw new Error(`رصيد غير كافٍ للصنف: ${u.name} (المتاح: ${B})`);n.set(N,{warehouseId:k,productId:u.id,qty:j,stockStatus:j<=0?"out":"ok",updatedAt:T()},{merge:!0});const Y=W[u.id]||[];let X="",Z="";Y.length>0&&(X=Y[0].number,Z=Y[0].expiryDate);const pt=F(L,`companies/${E}/stockTransactions`,`${h}_${u.id}`);n.set(pt,{warehouseId:k,productId:u.id,type:"sale_out",qtyBefore:B,qtyChange:-u.qty,qtyAfter:j,referenceId:h,note:`مبيعات POS — ${h}`,companyId:E,batchNumber:X,expiryDate:Z,createdAt:T()})}if(g==="credit"&&c!=="cash_customer"){const u=F(L,`companies/${E}/customers`,c);n.update(u,{balance:xt(r),updatedAt:T()})}});try{await Lt(J,r,s,a,y,C)}catch(n){console.warn("Journal entry failed (non-critical):",n)}i.forEach(n=>{f&&(v[n.id]=Math.max(0,(v[n.id]||0)-n.qty))}),H={...J,invoiceNumber:h},closePayModal(),clearCart(),M(),dt(H),window.showToast?.(`✅ تم إصدار الفاتورة ${h}`,"success")}catch(e){console.error("Checkout error:",e),x("❌ "+e.message)}finally{t.disabled=!1,t.innerHTML='<i class="fas fa-check"></i> تأكيد وطباعة'}};async function Lt(t,e,o,a,s,r){try{const{autoPOSJE:c}=await mt(async()=>{const{autoPOSJE:b}=await import("./accounting-engine-DReIGn_F.js");return{autoPOSJE:b}},__vite__mapDeps([0,1,2])),p=(t.lines||[]).reduce((b,y)=>b+(y.costPrice||y.averageCost||0)*(y.qty||0),0);await c({id:t.id,receiptNumber:t.invoiceNumber,date:t.date||new Date().toISOString().slice(0,10),subtotal:a,taxAmount:o,total:e,grandTotal:e,totalCost:p,cogsAmount:p,paymentMethod:t.type,customerName:t.customerName||""}),console.log(`[POS JE] ✅ قيد محاسبي أُنشئ للفاتورة ${t.invoiceNumber} | net=${a} | vat=${o} | COGS=${p.toFixed(2)}`)}catch(c){throw console.warn("[POS JE] autoPOSJE failed:",c.message),c}}function dt(t){const e=document.getElementById("pos-receipt-print");if(!e)return;const o=new Date().toLocaleString("ar-SA"),a=(t.lines||[]).map(r=>`
    <tr>
      <td style="padding:2px 4px;text-align:right">${r.productName}</td>
      <td style="padding:2px 4px;text-align:center">${r.qty}</td>
      <td style="padding:2px 4px;text-align:left">${l(r.unitPrice)}</td>
      <td style="padding:2px 4px;text-align:left">${l(r.lineTotal)}</td>
    </tr>
  `).join(""),s={cash:"نقد",network:"شبكة",credit:"آجل",transfer:"تحويل"};e.innerHTML=`
    <div style="text-align:center;direction:rtl;font-family:Arial,sans-serif;">
      <div style="font-size:18px;font-weight:900;margin-bottom:4px">إدهام للمواد الغذائية</div>
      <div style="font-size:11px;color:#555">نظام IDHAM ERP</div>
      <div style="border-top:2px dashed #000;margin:8px 0"></div>

      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span>رقم الفاتورة: <strong>${t.invoiceNumber}</strong></span>
        <span>${o}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span>العميل: <strong>${t.customerName}</strong></span>
        <span>الدفع: <strong>${s[t.type]||t.type}</strong></span>
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
        <tbody>${a}</tbody>
      </table>

      <div style="border-top:2px dashed #000;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:11px">
        <span>المجموع قبل الضريبة:</span>
        <strong>${l(t.subtotal)} ر.س</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px">
        <span>ضريبة القيمة المضافة (15%):</span>
        <strong>${l(t.totalVat)} ر.س</strong>
      </div>
      <div style="border-top:1px solid #000;margin:6px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900">
        <span>الإجمالي:</span>
        <span>${l(t.totalWithVat)} ر.س</span>
      </div>

      <div style="border-top:2px dashed #000;margin:10px 0"></div>
      <div style="font-size:10px;color:#555;text-align:center">
        <div>هذه الفاتورة صادرة من نظام IDHAM ERP</div>
        <div>شكراً لتعاملكم معنا</div>
        <div style="margin-top:4px;font-size:9px">ر.ق ضريبي: 300000000000003</div>
      </div>
    </div>
  `,window.print()}window.printLastReceipt=function(){H?dt(H):window.showToast?.("لا توجد فاتورة سابقة للطباعة","warning")};window.holdSale=function(){window.showToast?.("تم تعليق البيع — ميزة التعليق قيد التطوير","info")};function x(t){const e=document.getElementById("pos-error");e&&(e.textContent=t,e.classList.remove("hidden"))}function q(){document.getElementById("pos-error")?.classList.add("hidden")}function zt(){document.getElementById("pos-search")?.addEventListener("input",t=>{M(t.target.value.trim().toLowerCase())}),document.getElementById("pos-warehouse")?.addEventListener("change",async t=>{f=t.target.value||null,await nt(f)})}let A="",tt=null;function ct(t){if(!(t.target.tagName==="INPUT"&&!["pos-search","pos-received-amount"].includes(t.target.id))&&t.target.tagName!=="TEXTAREA"){if(t.key==="F8"){t.preventDefault(),selectPayMethod("cash"),document.getElementById("pos-btn-checkout")?.click();return}if(t.key==="F9"){t.preventDefault(),selectPayMethod("network"),document.getElementById("pos-btn-checkout")?.click();return}if(t.key==="F10"){t.preventDefault(),selectPayMethod("credit"),document.getElementById("pos-btn-checkout")?.click();return}if(t.key==="F11"){t.preventDefault(),selectPayMethod("transfer"),document.getElementById("pos-btn-checkout")?.click();return}if(t.key==="Escape"){closePayModal();return}if(t.key==="Enter"&&A.length>2){const e=A;A="";const o=z.find(s=>(s.barcode||"").toLowerCase()===e.toLowerCase()||(s.code||"").toLowerCase()===e.toLowerCase());o?(addToCartById(o.id),window.showToast?.(`تمت إضافة: ${o.name}`,"success",1200)):window.showToast?.("صنف غير موجود","error",1200);const a=document.getElementById("pos-search");a&&(a.value="");return}["Shift","Control","Alt","Enter","F8","F9","F10","F11","Escape"].includes(t.key)||(A+=t.key,clearTimeout(tt),tt=setTimeout(()=>{A=""},400))}}const et=window.navigate;window.navigate=async(t,e)=>{window.removeEventListener("keydown",ct),window.stopCameraScan&&await window.stopCameraScan(),et&&et(t,e)};function Pt(){return new Promise((t,e)=>{if(window.Html5Qrcode){t();return}const o=document.createElement("script");o.src="https://unpkg.com/html5-qrcode",o.onload=t,o.onerror=e,document.head.appendChild(o)})}window.startCameraScan=async()=>{try{await Pt();let t=document.getElementById("pos-camera-modal");t?t.classList.remove("hidden"):(t=document.createElement("div"),t.id="pos-camera-modal",t.className="pos-modal-overlay",t.innerHTML=`
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
      `,document.body.appendChild(t));const e=new Html5Qrcode("pos-qr-reader");window._html5QrCodeInstance=e;const o=(s,r)=>{console.log(`Scan result: ${s}`);const c=z.find(p=>(p.barcode||"").toLowerCase()===s.toLowerCase().trim()||(p.code||"").toLowerCase()===s.toLowerCase().trim());if(c)addToCartById(c.id),window.showToast?.(`تمت إضافة: ${c.name}`,"success",1200),stopCameraScan();else{const p=document.getElementById("pos-camera-error");p&&(p.textContent=`صنف غير موجود للباركود: ${s}`,p.classList.remove("hidden"),setTimeout(()=>{p.classList.add("hidden")},3e3))}},a={fps:10,qrbox:{width:250,height:150}};await e.start({facingMode:"environment"},a,o)}catch(t){console.error("Camera scan start error:",t),alert("تعذر تشغيل الكاميرا: "+t.message)}};window.stopCameraScan=async()=>{const t=document.getElementById("pos-camera-modal");if(t&&t.classList.add("hidden"),window._html5QrCodeInstance){try{await window._html5QrCodeInstance.stop()}catch(e){console.warn("Failed to stop camera:",e)}window._html5QrCodeInstance=null}};export{Nt as render};
