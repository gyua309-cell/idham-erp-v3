import fs from 'fs';

const filePath = 'js/modules/sales-invoices.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fullscreen Cockpit Modal Style & Header with Live HUD
const oldHeader = `    <!-- New/Edit Invoice Modal -->
    <div class="modal-overlay" id="new-invoice-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title" id="invoice-modal-title">فاتورة مبيعات جديدة</h3>
          <button class="modal-close" onclick="closeModal('new-invoice-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">`;

const newHeader = `    <!-- New/Edit Invoice Modal (True Fullscreen Cockpit - World-Class) -->
    <div class="modal-overlay" id="new-invoice-modal" onclick="if(event.target===this)closeModal('new-invoice-modal')">
      <style>
        #new-invoice-modal {
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
        #new-invoice-modal .modal-xl {
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
        #new-invoice-modal .modal-header {
          height: 44px !important;
          padding: 6px 18px !important;
          border-bottom: 1.5px solid #e2e8f0 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          background: #ffffff !important;
          color: #0f172a !important;
          flex-shrink: 0 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
        }
        #new-invoice-modal .modal-body {
          padding: 8px 14px !important;
          overflow: hidden !important;
          flex: 1 1 0% !important;
          min-height: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
          background: #f1f5f9 !important;
        }
        #new-invoice-modal .modal-footer {
          height: 52px !important;
          padding: 0 18px !important;
          background: #ffffff !important;
          border-top: 2px solid #cbd5e1 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-shrink: 0 !important;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.04) !important;
        }
        .sale-hud-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 6px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .sale-hud-pill b {
          font-family: monospace;
          font-size: 12px;
          font-weight: 800;
        }
        #invoice-lines-tbody tr:hover {
          background-color: #f1f5f9 !important;
        }
      </style>
      <div class="modal modal-xl">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📄</span>
            <h3 class="modal-title" id="invoice-modal-title" style="margin:0; font-size:15px; font-weight:900; color:#0f172a;">فاتورة مبيعات جديدة</h3>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10px; padding:2px 7px; border:1px solid #c7d2fe;">⛶ شاشة كاملة متطورة</span>
          </div>

          <!-- Live Top HUD Profit & Margin Summary -->
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="sale-hud-pill" title="عدد بنود الفاتورة">
              <span>📦 البنود:</span>
              <b id="inv-hud-lines-count">0</b>
            </div>
            <div class="sale-hud-pill" title="المبيعات خارج الضريبة">
              <span>💰 صافي البيع:</span>
              <b id="inv-hud-subtotal" style="color:#2563eb;">0.00 ر.س</b>
            </div>
            <div class="sale-hud-pill" title="تكلفة البضاعة وفق المتوسط المرجح (WAC)">
              <span>⚖️ التكلفة (WAC):</span>
              <b id="inv-hud-cost" style="color:#64748b;">0.00 ر.س</b>
            </div>
            <div class="sale-hud-pill" title="صافي الربح التقديري">
              <span>📈 الربح:</span>
              <b id="inv-hud-profit" style="color:#16a34a;">0.00 ر.س</b>
            </div>
            <div class="sale-hud-pill" id="inv-hud-margin-pill" style="background:#ecfdf5; border-color:#6ee7b7;" title="نسبة هامش الربح للفاتورة وفق المتوسط المرجح">
              <span style="color:#065f46;">🎯 هامش الربح:</span>
              <b id="inv-hud-margin" style="color:#059669; font-size:13px;">0.0%</b>
            </div>
            <button class="modal-close" onclick="closeModal('new-invoice-modal')" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;">×</button>
          </div>
        </div>
        <div class="modal-body" style="padding:10px 14px;">`;

console.log("oldHeader found?", content.includes(oldHeader) || content.replace(/\r\n/g, '\n').includes(oldHeader.replace(/\r\n/g, '\n')));
