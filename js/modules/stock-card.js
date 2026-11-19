// ============================================================
// IDHAM ERP — Master Item Card & Stock Ledger Module (كرت حركة الصنف التفصيلي)
// Enterprise-Grade Inventory Audit (Pure Canonical Ledger from 0 Opening Balance)
// ============================================================
import { COLS, getAll, getStockForProduct, db, COMPANY_ID, collection } from "../utils/db.js";
import { query, orderBy, getDocs, where, limit } from "../utils/db.js";
import { formatCurrency, formatQuantity, formatDate, todayString, debounce, startOfMonth } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

const toast = (msg, type = "info") => {
  if (typeof window.showToast === "function") window.showToast(msg, type);
  else alert(msg);
};

let warehouses = [];
let products = [];
let selectedProduct = null;
let currentLedger = [];
let _sortOrder = "asc"; // "asc" = chronological | "desc" = newest first
let _currentPath = "all"; // "all" | "main" | "transfers" | "van_sales" | "clean"
let _lastOpeningQty = 0;
let _lastOpeningWAC = 0;
let _lastFromDate = "";

function isVehicleWarehouse(whId, whName = "") {
  if (!whId) return false;
  const w = warehouses.find(x => x.id === whId);
  const name = (w?.name || whName || "").toLowerCase();
  const type = (w?.type || "").toLowerCase();
  return type === "vehicle" || type === "distribution" || /سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(name);
}

function isMainWarehouse(whId, whName = "") {
  if (!whId) return true;
  const w = warehouses.find(x => x.id === whId);
  const name = (w?.name || whName || "").toLowerCase();
  const type = (w?.type || "").toLowerCase();
  return type === "main" || /رئيسي|رئيسى|main/i.test(name) || whId === "W5uANJjMgfFh2p3xU4bT";
}

function getCompanyInfo() {
  let co = {
    name: "شركة إدهام للمواد الغذائية",
    nameEn: "Idham Foodstuff Trading Co.",
    address: "المملكة العربية السعودية — الرياض",
    phone: "0500000000",
    email: "info@idham-foods.com",
    vatNumber: "310000000000003",
    crNumber: "1010000000",
    logoBase64: "",
    logoUrl: ""
  };
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) {
      const parsed = JSON.parse(raw);
      co = { ...co, ...parsed };
    } else if (window.ERP_COMPANY) {
      co = { ...co, ...window.ERP_COMPANY };
    }
  } catch {}
  return co;
}

export async function render(container, user) {
  const co = getCompanyInfo();

  container.innerHTML = `
    <style>
      .sc-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .sc-type-purchase { background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
      .sc-type-sale { background: rgba(239,68,68,0.12); color: #DC2626; border: 1px solid rgba(239,68,68,0.3); }
      .sc-type-transfer { background: rgba(99,102,241,0.12); color: #4F46E5; border: 1px solid rgba(99,102,241,0.3); }
      .sc-type-adj { background: rgba(245,158,11,0.12); color: #D97706; border: 1px solid rgba(245,158,11,0.3); }
      .sc-wh-pill { padding: 6px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 700; background: var(--bg-2); border: 1px solid var(--border-soft); display: inline-flex; align-items: center; gap: 6px; }
      .sc-path-btn { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid var(--border-soft); background: var(--bg-card); color: var(--text-1); cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 5px; }
      .sc-path-btn:hover { background: var(--bg-2); border-color: var(--brand); }
      .sc-path-btn.active { background: var(--brand); color: #ffffff !important; border-color: var(--brand); box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
      @media (max-width: 980px) {
        .sc-pipeline-grid { grid-template-columns: 1fr !important; }
        .sc-pipeline-arrow { display: none !important; }
      }

      @media print {
        @page { size: A4 landscape; margin: 8mm 10mm 10mm 10mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body, html, #app, .page-container, .page-content { background: #ffffff !important; color: #000000 !important; padding: 0 !important; margin: 0 !important; font-family: 'Cairo', 'Segoe UI', sans-serif !important; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        .card { border: 1px solid #cbd5e1 !important; box-shadow: none !important; background: #ffffff !important; margin-bottom: 10px !important; padding: 8px !important; break-inside: avoid; }
        .table-container { max-height: none !important; overflow: visible !important; }
        table { width: 100% !important; border-collapse: collapse !important; font-size: 9.5px !important; page-break-inside: auto; }
        tr { page-break-inside: avoid !important; page-break-after: auto !important; }
        thead { display: table-header-group !important; }
        thead tr th { background: #0f3d19 !important; color: #ffffff !important; font-weight: 900 !important; border: 1px solid #0a2911 !important; padding: 6px 4px !important; font-size: 9.5px !important; text-align: center !important; }
        tbody tr td { border: 1px solid #cbd5e1 !important; padding: 5px 4px !important; color: #0f172a !important; font-size: 9.5px !important; }
        tbody tr:nth-child(even) { background: #f8fafc !important; }
        .sc-badge { border: 1px solid #94a3b8 !important; font-size: 8.5px !important; padding: 2px 5px !important; }
      }
    </style>

    <div class="page-container" style="padding: 18px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- LUXURY PRINT LETTERHEAD HEADER -->
      <div class="print-only" style="display:none; margin-bottom:14px;">
        <div style="background: linear-gradient(135deg, #0f3d19 0%, #1a5c2a 100%); color:#ffffff; padding:12px 18px; border-radius:10px 10px 0 0; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #D4AF37;">
          <div style="display:flex; align-items:center; gap:14px;">
            ${co.logoBase64 || co.logoUrl ? `
              <img src="${co.logoBase64 || co.logoUrl}" style="height:52px; max-width:85px; object-fit:contain; background:#fff; padding:4px; border-radius:8px; border:1.5px solid #D4AF37;" alt="شعار الشركة" />
            ` : `
              <div style="width:46px; height:46px; border-radius:10px; background:rgba(212,175,55,0.2); border:1.5px solid #D4AF37; display:flex; align-items:center; justify-content:center; font-size:22px;">
                🏢
              </div>
            `}
            <div>
              <h1 style="margin:0; font-size:17px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">${co.name}</h1>
              <div style="font-size:10.5px; color:#D4AF37; font-weight:700; margin-top:2px;">${co.nameEn || 'Foodstuff Trading & Distribution ERP — Supply Chain Management'}</div>
              <div style="font-size:9.5px; color:#e2e8f0; margin-top:2px;">
                📍 ${co.address || 'المملكة العربية السعودية'} • 📞 ${co.phone || '—'}
              </div>
            </div>
          </div>

          <div style="text-align:left; background:rgba(0,0,0,0.25); padding:8px 14px; border-radius:8px; border:1px solid rgba(212,175,55,0.4);">
            <div style="font-size:13px; font-weight:900; color:#D4AF37;">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:3px;">
              الرقم الضريبي: <b style="font-family:monospace; color:#4ade80;">${co.vatNumber || '310000000000003'}</b>
            </div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:1px;">
              السجل التجاري: <b style="font-family:monospace; color:#4ade80;">${co.crNumber || '1010000000'}</b>
            </div>
          </div>
        </div>

        <!-- Print Item Info Bar -->
        <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-top:none; padding:8px 16px; border-radius:0 0 8px 8px; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:#1e293b;">
          <div>
            <b>📦 الصنف: </b><span id="print-item-name" class="font-bold" style="color:#0f3d19; font-size:11.5px;">—</span>
            <span style="margin:0 8px; color:#94a3b8;">|</span>
            <b>الكود (SKU): </b><span id="print-item-sku" class="mono font-bold" style="color:#0f3d19;">—</span>
            <span style="margin:0 8px; color:#94a3b8;">|</span>
            <b>الوحدة: </b><span id="print-item-unit" class="font-bold">—</span>
          </div>
          <div>
            <b>📅 نطاق الحركة: </b><span id="print-period" class="font-bold" style="color:#0f3d19;">الفترة المحددة</span>
            <span style="margin:0 8px; color:#94a3b8;">|</span>
            <b>🏢 الموقع: </b><span id="print-wh" class="font-bold" style="color:#0f3d19;">جميع المستودعات والسيارات</span>
          </div>
        </div>
      </div>

      <!-- Top Filter Bar (Screen) -->
      <div class="filterbar no-print" style="padding:14px 20px; background:var(--bg-card); border-radius:14px; border:1px solid var(--border-soft); margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
        
        <!-- Product Search / Autocomplete -->
        <div class="form-group" style="width:300px; margin:0;">
          <label style="font-size:11.5px; margin-bottom:4px; font-weight:800; color:var(--text-0);">اختر أو ابحث عن الصنف *</label>
          <div class="autocomplete-container" style="position:relative;">
            <input type="text" id="sc-product-search" class="input font-bold" style="height:36px;" placeholder="🔍 ابحث بالاسم، الكود، الباركود..." autocomplete="off" />
            <div class="autocomplete-results hidden" id="sc-product-results" style="position:absolute; width:100%; z-index:999; max-height:260px; overflow-y:auto; background:var(--bg-1); border:1.5px solid var(--border-soft); border-radius:10px; box-shadow:var(--shadow);"></div>
            <input type="hidden" id="sc-product-id" />
          </div>
        </div>

        <!-- Warehouse Filter -->
        <div class="filter-select-group" style="margin:0;">
          <label style="font-size:11.5px; font-weight:800;">المستودع / الموقع</label>
          <select id="sc-wh-filter" class="input font-bold" style="height:36px; min-width:180px;">
            <option value="">🏢 جميع المستودعات والسيارات</option>
          </select>
        </div>

        <!-- Operation Type Filter -->
        <div class="filter-select-group" style="margin:0;">
          <label style="font-size:11.5px; font-weight:800;">نوع العملية</label>
          <select id="sc-type-filter" class="input font-bold" style="height:36px; min-width:160px;">
            <option value="">كل العمليات والحركات</option>
            <option value="purchases">📥 مشتريات ومرتجع مبيعات (وارد)</option>
            <option value="sales">📤 مبيعات (صادر)</option>
            <option value="transfers">🔄 تحويلات المستودعات والسيارات</option>
            <option value="adjustments">⚖️ تسويات جردية وتوالف</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="date-range-group" style="margin:0; display:flex; gap:6px; align-items:flex-end;">
          <div>
            <label style="font-size:11.5px; font-weight:800;">من تاريخ</label>
            <input type="date" id="sc-date-from" class="input mono font-bold" style="height:36px; width:130px;" value="" />
          </div>
          <div>
            <label style="font-size:11.5px; font-weight:800;">إلى تاريخ</label>
            <input type="date" id="sc-date-to" class="input mono font-bold" style="height:36px; width:130px;" value="${todayString()}" />
          </div>
        </div>

        <!-- Actions -->
        <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
          <button class="btn btn-primary" onclick="loadStockCardReport()" style="height:36px; font-weight:bold; background:linear-gradient(135deg,#0f3d19,#1a5c2a);">🔍 استخراج الكرت</button>
          <button class="btn btn-secondary btn-sm" onclick="window.exportStockCardExcel()" style="height:36px;">📊 Excel</button>
          <button class="btn btn-primary btn-sm" onclick="window.printOfficialStockCard()" style="height:36px; font-weight:bold; background:linear-gradient(135deg,#0f3d19,#1a5c2a);">🖨️ طباعة رسمية</button>
          <button class="btn btn-secondary btn-sm" id="sc-custody-btn" onclick="window.printCustodyReconciliation()" style="height:36px; font-weight:bold; border-color:#2563EB; color:#2563EB;" title="طباعة محضر مطابقة وجرد لسيارة المندوب">📋 محضر مطابقة العهدة</button>
        </div>
      </div>

      <!-- Page Content -->
      <div class="page-content">
        
        <!-- Header Info (Screen) -->
        <div class="page-header flex justify-between items-center no-print" style="margin-bottom:18px;">
          <div>
            <h1 class="page-title" style="font-size:22px; font-weight:900; color:var(--text-0);">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</h1>
            <p class="page-subtitle" id="sc-subtitle" style="font-size:12.5px; color:var(--text-2); margin-top:2px;">يرجى اختيار صنف لعرض سجل الحركات وكميات المخازن التفصيلية</p>
          </div>
          <div class="no-print" id="sc-zatca-badge-wrapper">
            <span id="sc-zatca-badge" class="badge good hidden">مطابق لمتطلبات هيئة الزكاة والضريبة والجمارك</span>
          </div>
        </div>

        <!-- Item Profile & KPIs Wrapper -->
        <div id="sc-profile-wrapper" class="hidden">
          
          <!-- Live Warehouse & Van Locations Pills Strip -->
          <div class="card mb-16" style="padding:12px 18px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px;">📍</span>
                <b style="font-size:12.5px; color:var(--text-0);">توزيع الرصيد اللحظي الحالي في المستودعات والسيارات:</b>
              </div>
              <div id="sc-locations-pills" style="display:flex; flex-wrap:wrap; gap:8px;">
                <!-- Pills inserted dynamically -->
              </div>
            </div>
          </div>

          <!-- 5 Crystal Clear KPI Cards -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:12px; margin-bottom:20px;">
            
            <!-- 1. Opening Balance -->
            <div class="card" style="padding:14px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-card); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#64748B;"></div>
              <div style="font-size:11px; color:var(--text-2); font-weight:700;">رصيد أول المدة 📅</div>
              <div class="mono font-bold" id="sc-opening-bal" style="font-size:20px; color:var(--text-0); margin-top:4px;">0</div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:2px;" id="sc-opening-bal-sub">بداية الفترة</div>
            </div>

            <!-- 2. Pure Inbound (Purchases) -->
            <div class="card" style="padding:14px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-card); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#10B981;"></div>
              <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الوارد الفعلي 📥</div>
              <div class="mono font-bold text-good" id="sc-total-in" style="font-size:20px; margin-top:4px;">0</div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:2px;">مشتريات ومرتجعات بيع</div>
            </div>

            <!-- 3. Pure Outbound (Sales & Waste) -->
            <div class="card" style="padding:14px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-card); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#EF4444;"></div>
              <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الصادر الفعلي 📤</div>
              <div class="mono font-bold text-bad" id="sc-total-out" style="font-size:20px; margin-top:4px;">0</div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:2px;">مبيعات وهالك وتوالف</div>
            </div>

            <!-- 4. Actual Total Stock -->
            <div class="card" style="padding:14px; border-radius:12px; border:1px solid rgba(16,185,129,0.3); background:rgba(16,185,129,0.03); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:linear-gradient(90deg, #10B981, #059669);"></div>
              <div style="font-size:11px; color:#059669; font-weight:800;">الرصيد الفعلي الحالي بالمؤسسة 📦</div>
              <div class="mono font-bold text-good" id="sc-current-balance" style="font-size:22px; margin-top:4px;">0</div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:2px;" id="sc-balance-breakdown-sub">شامل الرئيسي والسيارات</div>
            </div>

            <!-- 5. Average Cost & Valuation -->
            <div class="card" style="padding:14px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-card); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#6366F1;"></div>
              <div style="font-size:11px; color:var(--text-2); font-weight:700;">متوسط التكلفة والقيمة 💰</div>
              <div class="mono font-bold" id="sc-total-valuation" style="font-size:16px; color:#4F46E5; margin-top:4px;">—</div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:2px;" id="sc-total-valuation-sub">تقييم المخزون الحالي</div>
            </div>

          </div>

          <!-- Supply Chain Flow Pipeline (سلسلة إمداد ودورة حياة الصنف) -->
          <div id="sc-pipeline-container" class="card no-print" style="margin-bottom:20px; padding:18px 20px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card); display:none;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.15)); display:flex; align-items:center; justify-content:center; font-size:18px;">
                  🔄
                </div>
                <div>
                  <h3 style="margin:0; font-size:15px; font-weight:900; color:var(--text-0);">سلسلة إمداد الصنف ودورة التوزيع الميداني (End-to-End Supply Chain Pipeline)</h3>
                  <p class="dim" style="margin:2px 0 0 0; font-size:11px;">تتبع مسار البضاعة: توريد الموردين ➔ المستودع الرئيسي ➔ شحن سيارات المناديب ➔ مبيعات الميدان</p>
                </div>
              </div>
              
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="sc-badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:11.5px;" id="pipe-balance-badge">
                  ✅ الدورة متطابقة ومغلقة محاسبياً
                </span>
              </div>
            </div>

            <!-- 3 Connected Pipeline Stages -->
            <div class="sc-pipeline-grid" style="display:grid; grid-template-columns: 1fr auto 1.15fr auto 1.15fr; gap:8px; align-items:stretch; margin-bottom:16px;">
              
              <!-- Stage 1: Supplier Inbound -->
              <div style="background:var(--bg-2); border:1.5px solid rgba(16,185,129,0.25); border-radius:12px; padding:14px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
                <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#10B981;"></div>
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11.5px; font-weight:800; color:#059669;">1. التوريد والمشتريات 🏭</span>
                    <span class="sc-badge" style="font-size:10px; background:rgba(16,185,129,0.1); color:#059669;" id="pipe-supplier-in-count">0 فواتير</span>
                  </div>
                  <div style="font-size:22px; font-weight:900; color:#059669;" class="mono font-bold" id="pipe-supplier-in-qty">+0</div>
                  <div class="dim" style="font-size:10.5px; margin-top:2px;">إجمالي المشتريات من الموردين</div>
                </div>
                <div style="margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-soft); font-size:10.5px; display:flex; justify-content:space-between;">
                  <span class="dim">مرتجع من العملاء (+):</span>
                  <b class="mono font-bold" id="pipe-cust-returns" style="color:var(--text-1);">0</b>
                </div>
              </div>

              <!-- Arrow 1 -> 2 -->
              <div class="sc-pipeline-arrow" style="display:flex; align-items:center; justify-content:center; color:var(--text-2); font-size:22px;">
                ➔
              </div>

              <!-- Stage 2: Main Warehouse Hub -->
              <div style="background:var(--bg-2); border:1.5px solid rgba(59,130,246,0.25); border-radius:12px; padding:14px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
                <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#3B82F6;"></div>
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11.5px; font-weight:800; color:#2563EB;">2. المستودع الرئيسي 🏢</span>
                    <span class="sc-badge" style="font-size:10px; background:rgba(59,130,246,0.1); color:#2563EB;" id="pipe-main-stock-badge">الموقع المركزي</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <div>
                      <div style="font-size:22px; font-weight:900; color:#2563EB;" class="mono font-bold" id="pipe-main-current-stock">0</div>
                      <div class="dim" style="font-size:10.5px; margin-top:2px;">الرصيد الفعلي الحالي بالمستودع</div>
                    </div>
                  </div>
                </div>
                
                <div style="margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-soft); font-size:10.5px; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between;">
                    <span class="dim">مبيعات مباشرة من المستودع:</span>
                    <b class="mono font-bold text-bad" id="pipe-main-sales-qty">-0</b>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="dim">محول لسيارات المناديب (شحن):</span>
                    <b class="mono font-bold" id="pipe-transfers-to-vans" style="color:#6366F1;">-0</b>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="dim">مرتجع من سيارات المناديب:</span>
                    <b class="mono font-bold text-good" id="pipe-returns-from-vans">+0</b>
                  </div>
                </div>
              </div>

              <!-- Arrow 2 -> 3 -->
              <div class="sc-pipeline-arrow" style="display:flex; align-items:center; justify-content:center; color:var(--text-2); font-size:22px;">
                ➔
              </div>

              <!-- Stage 3: Van Fleet Sales -->
              <div style="background:var(--bg-2); border:1.5px solid rgba(139,92,246,0.25); border-radius:12px; padding:14px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
                <div style="position:absolute; top:0; right:0; left:0; height:3.5px; background:#8B5CF6;"></div>
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11.5px; font-weight:800; color:#7C3AED;">3. سيارات المناديب (الميدان) 🚐</span>
                    <span class="sc-badge" style="font-size:10px; background:rgba(139,92,246,0.1); color:#7C3AED;" id="pipe-van-sales-count">0 فواتير</span>
                  </div>
                  <div style="font-size:22px; font-weight:900; color:#7C3AED;" class="mono font-bold" id="pipe-van-sales-qty">-0</div>
                  <div class="dim" style="font-size:10.5px; margin-top:2px;">إجمالي مبيعات المندوبين للعملاء</div>
                </div>

                <div style="margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-soft); font-size:10.5px; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between;">
                    <span class="dim">إجمالي شحنات التحميل المستلمة:</span>
                    <b class="mono font-bold text-good" id="pipe-van-received-qty">+0</b>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="dim">الرصيد المتبقي بعهدة السيارات الآن:</span>
                    <b class="mono font-bold" id="pipe-van-current-stock" style="color:var(--text-0);">0</b>
                  </div>
                </div>
              </div>

            </div>

            <!-- Reconciled Conservation Equality Bar -->
            <div style="background:var(--bg-1); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px; font-size:11.5px;">
                <span style="font-weight:800; color:var(--text-0);">
                  ⚖️ ميزان حركة وتوزيع الصنف:
                  <span class="mono font-bold" style="color:#059669;" id="pipe-tally-in">الوارد: 0</span> = 
                  <span class="mono font-bold" style="color:#EF4444;" id="pipe-tally-sales">المباع: 0</span> + 
                  <span class="mono font-bold" style="color:#2563EB;" id="pipe-tally-rem">المتبقي بالمخازن: 0</span>
                </span>
                <span style="font-size:11px; color:var(--text-2);" id="pipe-tally-details">
                  مبيعات المستودع: 0 | مبيعات السيارات: 0
                </span>
              </div>

              <!-- Multi-segmented Progress Bar -->
              <div style="height:10px; width:100%; border-radius:5px; background:var(--bg-3); overflow:hidden; display:flex;" id="pipe-progress-bar">
                <div id="pipe-bar-main-sales" style="background:#EF4444; width:0%;" title="مبيعات المستودع الرئيسي"></div>
                <div id="pipe-bar-van-sales" style="background:#8B5CF6; width:0%;" title="مبيعات سيارات المناديب"></div>
                <div id="pipe-bar-main-stock" style="background:#3B82F6; width:0%;" title="الرصيد المتبقي بالمستودع الرئيسي"></div>
                <div id="pipe-bar-van-stock" style="background:#10B981; width:0%;" title="الرصيد المتبقي بالسيارات"></div>
              </div>
              
              <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:6px; font-size:10px; color:var(--text-2);">
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:2px; background:#EF4444; display:inline-block;"></span> مبيعات رئيسي</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:2px; background:#8B5CF6; display:inline-block;"></span> مبيعات مناديب</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:2px; background:#3B82F6; display:inline-block;"></span> رصيد رئيسي متبقي</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:2px; background:#10B981; display:inline-block;"></span> رصيد سيارات متبقي</span>
              </div>
            </div>

          </div>

          <!-- Detailed Movements Ledger Card -->
          <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
            
            <!-- Table Toolbar -->
            <div style="padding:14px 18px; border-bottom:1px solid var(--border-soft); background:var(--bg-2); display:flex; flex-direction:column; gap:12px;" class="no-print">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">📜</span>
                  <h3 style="margin:0; font-size:14.5px; font-weight:900; color:var(--text-0);">سجل دفتر الأستاذ لحركة الصنف (Stock Movement Ledger)</h3>
                  <span class="mono font-bold" style="font-size:11.5px; color:var(--text-2);" id="sc-meta-info"></span>
                </div>

                <!-- Sorting Direction Toggle -->
                <div style="display:flex; gap:6px; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:var(--text-2);">الترتيب:</span>
                  <button class="btn btn-secondary btn-sm" id="sc-sort-asc-btn" onclick="window.toggleScSort('asc')" style="font-size:11px; font-weight:bold; background:var(--brand); color:#fff;">⬇️ تسلسلي محاسبي (من الأقدم للأحدث)</button>
                  <button class="btn btn-secondary btn-sm" id="sc-sort-desc-btn" onclick="window.toggleScSort('desc')" style="font-size:11px; font-weight:bold;">⬆️ من الأحدث للأقدم</button>
                </div>
              </div>

              <!-- Smart Path Quick Filter Pills -->
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding-top:4px; border-top:1px dashed var(--border-soft);">
                <span style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:4px;">
                  <span>🎯</span>
                  <span>تتبع مسار الصنف:</span>
                </span>
                <div style="display:flex; gap:6px; flex-wrap:wrap;" id="sc-path-filter-group">
                  <button type="button" class="sc-path-btn active" data-path="all" onclick="window.setScPathFilter('all')">🌐 الدورة الشاملة (الكل)</button>
                  <button type="button" class="sc-path-btn" data-path="main" onclick="window.setScPathFilter('main')">🏢 المستودع الرئيسي فقط</button>
                  <button type="button" class="sc-path-btn" data-path="transfers" onclick="window.setScPathFilter('transfers')">🔄 شحنات تحويلات السيارات</button>
                  <button type="button" class="sc-path-btn" data-path="van_sales" onclick="window.setScPathFilter('van_sales')">🚐 مبيعات سيارات المناديب</button>
                  <button type="button" class="sc-path-btn" data-path="clean" onclick="window.setScPathFilter('clean')">✨ فواتير المبيعات الصافية</button>
                </div>
              </div>
            </div>

            <!-- Path Active Status Bar -->
            <div id="sc-path-status-bar" style="display:none; margin:10px 18px 0 18px; padding:8px 14px; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.25); border-radius:8px; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-0);" class="no-print"></div>

            <div id="sc-reconcile-alert" style="display:none; margin:10px 18px; padding:10px 16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#DC2626; font-size:12.5px; font-weight:700;" class="no-print"></div>

            <div class="table-container" style="max-height:650px; overflow-y:auto;">
              <table class="data-dense" id="sc-table" style="margin:0; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                    <th style="width:30px; text-align:center;">#</th>
                    <th style="width:85px;">التاريخ</th>
                    <th style="width:125px; text-align:center;">نوع الحركة</th>
                    <th style="width:105px;">رقم المستند</th>
                    <th style="width:160px;">الطرف الثاني (العميل / المورد / المسار)</th>
                    <th style="width:130px;">المستودع / الموقع</th>
                    <th style="width:75px; text-align:center; color:#10B981;">وارد (+)</th>
                    <th style="width:75px; text-align:center; color:#EF4444;">صادر (-)</th>
                    <th style="width:90px; text-align:center; background:rgba(99,102,241,0.06); color:#4F46E5;">الرصيد بعد 📦</th>
                    <th style="width:80px; text-align:left;">تكلفة الوحدة</th>
                    <th style="width:85px; text-align:left;">المتوسط المرجح</th>
                    <th style="width:90px; text-align:left;">القيمة التراكمية</th>
                    <th>البيان والتفاصيل والملاحظات</th>
                  </tr>
                </thead>
                <tbody id="sc-tbody">
                  <tr><td colspan="13" class="dim" style="text-align:center; padding:32px;">يرجى اختيار الصنف من شريط البحث بالأعلى ثم الضغط على "استخراج الكرت"</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Official Print Signatures Footer -->
          <div class="print-only" style="display:none; margin-top:24px; padding-top:14px; border-top:1.5px solid #cbd5e1;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:10.5px;">
              <div style="text-align:center; width:200px;">
                <div style="font-weight:700; color:#334155; margin-bottom:30px;">مسؤول حركة المخزون والمستودعات</div>
                <div style="border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
              </div>
              <div style="text-align:center; width:200px;">
                <div style="font-weight:700; color:#334155; margin-bottom:30px;">أمين المستودع الرئيسي</div>
                <div style="border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
              </div>
              <div style="text-align:center; width:200px;">
                <div style="font-weight:700; color:#334155; margin-bottom:30px;">المدير المالي والتدقيق الداخلي</div>
                <div style="border-top:1px dashed #94a3b8; padding-top:4px;">الختم والاعتماد: _____________</div>
              </div>
            </div>
            <div style="text-align:center; font-size:9px; color:#64748b; margin-top:14px; border-top:1px solid #e2e8f0; padding-top:4px;">
              هذه الوثيقة مستخرجة رسمياً من نظام إدهام لإدارة موارد المؤسسات ونظم الإمداد (IDHAM ERP — SCM) — كافة الحقوق محفوظة © ${new Date().getFullYear()}
            </div>
          </div>

        </div>

        <!-- Welcome Placeholder -->
        <div id="sc-placeholder" class="empty-state" style="padding:60px 20px; text-align:center;">
          <div class="empty-icon" style="font-size:54px; margin-bottom:12px;">📊</div>
          <h3 style="font-size:18px; font-weight:900; color:var(--text-0); margin-bottom:6px;">دفتر أستاذ المخزون وتدقيق حركة الصنف</h3>
          <p class="dim" style="max-width:480px; margin:0 auto 16px auto; font-size:13px; line-height:1.6;">
            اختر الصنف من شريط البحث بالأعلى لتتبع دورة حياة الصنف بالتفصيل: فواتير الشراء، فواتير المبيعات، تحويلات سيارات المناديب، والتسويات الجردية بحسابات رياضية دقيقة 100%.
          </p>
        </div>

      </div>
    </div>
  `;

  await loadInitialData();
  setupAutocomplete();
}

async function loadInitialData() {
  try {
    const [pDocs, wDocs] = await Promise.all([
      getAll(COLS.products()),
      getAll(COLS.warehouses())
    ]);

    products = pDocs;
    warehouses = wDocs;

    const whSel = document.getElementById("sc-wh-filter");
    if (whSel) {
      whSel.innerHTML = '<option value="">🏢 جميع المستودعات والسيارات</option>' +
        warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }

    const preselectId = window._scPreselectProductId || localStorage.getItem("idham_sc_preselect_product_id");
    if (preselectId) {
      const found = products.find(p => p.id === preselectId);
      if (found) {
        selectedProduct = found;
        const inp = document.getElementById("sc-product-search");
        const hiddenId = document.getElementById("sc-product-id");
        if (inp) inp.value = `${found.sku || ''} — ${found.name}`;
        if (hiddenId) hiddenId.value = found.id;
        window._scPreselectProductId = null;
        localStorage.removeItem("idham_sc_preselect_product_id");
        setTimeout(() => { if (typeof window.loadStockCardReport === "function") window.loadStockCardReport(); }, 150);
      }
    }
  } catch (err) {
    console.error("loadInitialData error in stock-card:", err);
  }
}

function setupAutocomplete() {
  const input = document.getElementById("sc-product-search");
  const results = document.getElementById("sc-product-results");
  const hiddenId = document.getElementById("sc-product-id");
  if (!input || !results) return;

  const performSearch = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.classList.add("hidden");
      return;
    }

    const matches = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    ).slice(0, 15);

    if (!matches.length) {
      results.innerHTML = '<div style="padding:12px; color:var(--text-2); text-align:center; font-size:12px;">لا توجد أصناف مطابقة</div>';
    } else {
      results.innerHTML = matches.map(p => `
        <div class="search-item" data-id="${p.id}" data-sku="${p.sku || ''}" data-name="${p.name || ''}" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:12.5px; color:var(--text-0);">${p.name}</b>
            <span class="mono font-bold" style="color:var(--brand); font-size:11px;">${p.sku || '—'}</span>
          </div>
          <div class="dim" style="font-size:10.5px; margin-top:2px;">
            الوحدة: ${p.unit || 'كرتون'} | الباركود: ${p.barcode || '—'} | التكلفة: ${formatCurrency(p.averageCost || p.costPrice || 0)}
          </div>
        </div>
      `).join("");
    }
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-container")) {
      results.classList.add("hidden");
    }
  });

  results.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (item) {
      const id = item.dataset.id;
      const sku = item.dataset.sku;
      const name = item.dataset.name;

      input.value = `${sku} — ${name}`;
      hiddenId.value = id;
      selectedProduct = products.find(p => p.id === id);
      results.classList.add("hidden");

      window.loadStockCardReport();
    }
  });
}

window.loadStockCardReport = async () => {
  const productId = document.getElementById("sc-product-id")?.value;
  const whId = document.getElementById("sc-wh-filter")?.value;
  const fromDate = document.getElementById("sc-date-from")?.value || "";
  const toDate = document.getElementById("sc-date-to")?.value || "";
  const typeFilter = document.getElementById("sc-type-filter")?.value || "";

  if (!productId || !selectedProduct) {
    toast("يرجى اختيار الصنف من القائمة المنسدلة أولاً", "warning");
    return;
  }

  document.getElementById("sc-placeholder").classList.add("hidden");
  document.getElementById("sc-profile-wrapper").classList.remove("hidden");

  // Update Print Header Fields
  const printItemName = document.getElementById("print-item-name");
  if (printItemName) printItemName.textContent = selectedProduct.name;
  const printItemSku = document.getElementById("print-item-sku");
  if (printItemSku) printItemSku.textContent = selectedProduct.sku || "—";
  const printItemUnit = document.getElementById("print-item-unit");
  if (printItemUnit) printItemUnit.textContent = selectedProduct.unit || "كرتون";
  const printPeriod = document.getElementById("print-period");
  if (printPeriod) printPeriod.textContent = `من ${fromDate || 'البداية'} إلى ${toDate || 'اليوم'}`;
  const printWh = document.getElementById("print-wh");
  if (printWh) {
    const whName = warehouses.find(w => w.id === whId)?.name || "جميع المستودعات والسيارات";
    printWh.textContent = whName;
  }

  const tbody = document.getElementById("sc-tbody");
  tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:36px; color:var(--text-2);">⏳ جارٍ قراءة وتحليل الحركات وسجلات المستودعات…</td></tr>';

  try {
    // ──────────────────────────────────────────
    // 1. Fetch All Stock Transactions, Stock By Warehouse & Commercial Documents
    // ──────────────────────────────────────────
    const [txSnap, stockDocsSnap, salesInvsSnap, purInvsSnap, transfersSnap] = await Promise.all([
      getDocs(query(COLS.stockTransactions ? COLS.stockTransactions() : collection(db, `companies/${COMPANY_ID}/stockTransactions`), where("productId", "==", productId), limit(200))).catch(() => ({ docs: [] })),
      getStockForProduct(productId).catch(() => []),
      getAll(COLS.salesInvoices ? COLS.salesInvoices() : "salesInvoices", [orderBy("date", "desc"), limit(100)]).catch(() => []),
      getAll(COLS.purchaseInvoices ? COLS.purchaseInvoices() : "purchaseInvoices", [orderBy("date", "desc"), limit(100)]).catch(() => []),
      getAll(COLS.stockTransfers ? COLS.stockTransfers() : "stockTransfers", [orderBy("date", "desc"), limit(100)]).catch(() => [])
    ]);

    // Build Fast Lookup Maps for Parties (Customers, Suppliers, Transfer routes)
    const partyMap = new Map();
    const docMetaMap = new Map();

    (salesInvsSnap || []).forEach(inv => {
      const p = inv.customerName || "عميل نقدي";
      const num = inv.invoiceNumber || inv.number || inv.code;
      const data = { type: "sale", party: p, rep: inv.repName || "", status: inv.status, id: inv.id, date: inv.date };
      if (num) { partyMap.set(num, p); docMetaMap.set(num, data); }
      if (inv.id) { partyMap.set(inv.id, p); docMetaMap.set(inv.id, data); }
    });

    (purInvsSnap || []).forEach(pur => {
      const p = pur.supplierName || "مورد معتمد";
      const num = pur.invoiceNumber || pur.number || pur.code;
      const data = { type: "purchase", party: p, status: pur.status, id: pur.id, date: pur.date };
      if (num) { partyMap.set(num, p); docMetaMap.set(num, data); }
      if (pur.id) { partyMap.set(pur.id, p); docMetaMap.set(pur.id, data); }
    });

    (transfersSnap || []).forEach(tr => {
      const num = tr.number || tr.code || tr.transferNumber;
      const fromN = tr.fromWarehouseName || "المستودع الرئيسي";
      const toN = tr.toWarehouseName || "المستودع";
      const p = `${fromN} ⬅️ ${toN}`;
      const data = { type: "transfer", party: p, fromN, toN, status: tr.status, id: tr.id, date: tr.date };
      if (num) { partyMap.set(num, p); docMetaMap.set(num, data); }
      if (tr.id) { partyMap.set(tr.id, p); docMetaMap.set(tr.id, data); }
    });

    let rawTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const getDateStr = (t) => {
      if (t.date) return String(t.date).slice(0, 10);
      let secs = t.createdAt?.seconds || t.createdAt?._seconds;
      if (secs) return new Date(secs * 1000).toISOString().slice(0, 10);
      if (t.createdAt?.toDate) return t.createdAt.toDate().toISOString().slice(0, 10);
      if (typeof t.createdAt === "string") return t.createdAt.slice(0, 10);
      return "2026-08-01";
    };

    rawTxs.forEach(t => {
      t.__dateStr = getDateStr(t);
    });

    // Chronological sort with robust inward/reversal precedence
    rawTxs.sort((a, b) => {
      // 1. Transaction date
      if (a.__dateStr !== b.__dateStr) return a.__dateStr.localeCompare(b.__dateStr);

      // 2. Exact timestamp within the day (seconds)
      const secA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
      const secB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
      if (secA !== secB) return secA - secB;

      // 3. Movement priority: reversals, returns and additions ALWAYS precede sales and withdrawals
      const prio = {
        "opening": 0,
        "purchase_in": 1,
        "purchase_invoice": 1,
        "sale_reverse_edit": 2,
        "reverse_edit": 2,
        "sale_cancel": 2,
        "cancel_sale": 2,
        "sales_return": 2,
        "return_in": 2,
        "transfer_in": 3,
        "adjustment_in": 3,
        "sale_out": 4,
        "sales_invoice": 4,
        "delivery_note": 4,
        "pos_sale": 4,
        "pos_out": 4,
        "transfer_out": 5,
        "adjustment_out": 5,
        "damage": 6
      };
      const pA = prio[a.type] !== undefined ? prio[a.type] : (parseFloat(a.qtyChange || a.qtyDelta || 0) > 0 ? 2 : 4);
      const pB = prio[b.type] !== undefined ? prio[b.type] : (parseFloat(b.qtyChange || b.qtyDelta || 0) > 0 ? 2 : 4);
      if (pA !== pB) return pA - pB;

      // 4. Nanoseconds precision
      const nanoA = a.createdAt?.nanoseconds || a.createdAt?._nanoseconds || 0;
      const nanoB = b.createdAt?.nanoseconds || b.createdAt?._nanoseconds || 0;
      if (nanoA !== nanoB) return nanoA - nanoB;

      // 5. Ultimate tie-breaker for simultaneous edits: Inward quantity additions (+) always precede outward deductions (-)
      const chgA = parseFloat(a.qtyChange || a.qtyDelta || 0);
      const chgB = parseFloat(b.qtyChange || b.qtyDelta || 0);
      return chgB - chgA;
    });

    // ──────────────────────────────────────────
    // 2. Live Warehouse Distribution Pills
    // ──────────────────────────────────────────
    const pillsContainer = document.getElementById("sc-locations-pills");
    let totalStockAllWh = 0;
    let mainWhStock = 0;
    let vanStock = 0;

    const pillsHtml = (stockDocsSnap || []).map(s => {
      const q = parseFloat(s.qty) || 0;
      const wh = warehouses.find(w => w.id === s.warehouseId) || { name: s.warehouseName || s.warehouseId || "المستودع الرئيسي", type: "Main" };
      const isVan = wh.type === "Vehicle" || wh.type === "Distribution" || (wh.name && (wh.name.includes("سيارة") || wh.name.includes("مندوب")));
      
      totalStockAllWh += q;
      if (isVan) vanStock += q;
      else mainWhStock += q;

      const color = q > 0 ? (isVan ? "#2563EB" : "#059669") : "#64748B";
      return `
        <span class="sc-wh-pill">
          <span>${isVan ? '🚐' : '🏢'}</span>
          <span>${wh.name}:</span>
          <b class="mono" style="color:${color}; font-size:12px;">${formatQuantity(q)} ${selectedProduct.unit || 'كرتون'}</b>
        </span>
      `;
    }).join("") || '<span class="dim">لا يوجد رصيد مسجل بالمستودعات</span>';

    if (pillsContainer) pillsContainer.innerHTML = pillsHtml;

    // ──────────────────────────────────────────
    // 3. Pure Canonical Running Balance (Starts at 0 Opening Stock)
    // ──────────────────────────────────────────
    const activeBalance = whId 
      ? parseFloat(stockDocsSnap.find(s => s.warehouseId === whId)?.qty || 0)
      : totalStockAllWh;

    let runningQty = 0;
    let runningWAC = parseFloat(selectedProduct.averageCost || selectedProduct.costPrice || 0);

    let openingQty = 0;
    let openingWAC = runningWAC;

    let periodIn = 0;
    let periodOut = 0;

    const whRunningBalances = {};
    warehouses.forEach(w => { whRunningBalances[w.id] = 0; });

    const chronologicalLedger = [];

    rawTxs.forEach(t => {
      const dateStr = t.__dateStr;
      const isBeforePeriod = fromDate && dateStr < fromDate;

      const matchWh = !whId || t.warehouseId === whId;
      let change = parseFloat(t.qtyChange || 0);
      const txCost = parseFloat(t.costPrice || t.purchasePrice || runningWAC || 0);

      const tType = t.type || "";
      const isPur = ["purchase_invoice", "purchase_in", "purchase_return", "sales_return", "return_in", "purchase_reverse"].includes(tType);
      const isSale = ["sales_invoice", "sale_out", "delivery_note", "pos_sale", "pos_out", "sale_cancel", "cancel_sale"].includes(tType);
      const isTrans = ["transfer_out", "transfer_in", "transfer_cancel"].includes(tType);
      const isAdj = ["adjustment", "damage", "assembly", "disassembly", "opening"].includes(tType);

      const docNum = t.documentNumber || t.docRef || t.invoiceNumber || t.refCode || t.sourceId || "";
      let partyName = partyMap.get(docNum) || partyMap.get(t.sourceId) || "";

      // Audit Reversal Artifact Check:
      // If a purchase_reverse was recorded as an edit/reversal step for a purchase invoice that is STILL active and posted,
      // the purchase was NOT cancelled; the stock remains added in the warehouse.
      // We keep the transaction for audit record, but reconcile effectiveChange to 0 so the ledger equals actual stock.
      const isPurReversalArtifact = (tType === "purchase_reverse") && 
        (String(t.notes || "").includes("حذف فاتورة الشراء") || String(t.notes || "").includes("تعديل") || String(t.notes || "").includes("عكس"));

      let isIgnoredReversal = false;
      if (isPurReversalArtifact) {
        const purMeta = docMetaMap.get(docNum) || docMetaMap.get(t.refId) || docMetaMap.get(t.sourceId);
        if (purMeta && purMeta.status !== "cancelled") {
          isIgnoredReversal = true;
          change = 0;
        }
      }

      const wid = t.warehouseId || "main";
      whRunningBalances[wid] = (whRunningBalances[wid] || 0) + change;

      // Scoped Delta for balance:
      // Internal transfers move stock between locations without altering company-wide total stock
      let effectiveChange = change;
      if (!whId && isTrans) {
        effectiveChange = 0;
      }

      if (matchWh) {
        if (effectiveChange > 0) {
          if (runningQty + effectiveChange > 0) {
            runningWAC = ((runningQty * runningWAC) + (effectiveChange * txCost)) / (runningQty + effectiveChange);
          } else {
            runningWAC = txCost;
          }
          runningQty += effectiveChange;
        } else if (effectiveChange < 0) {
          runningQty += effectiveChange;
        }
      }

      if (isBeforePeriod) {
        if (matchWh) {
          openingQty = runningQty;
          openingWAC = runningWAC;
        }
        return;
      }

      if (toDate && dateStr > toDate) return;
      if (!matchWh) return;

      let qtyIn = 0;
      let qtyOut = 0;

      if (isIgnoredReversal) {
        qtyIn = 0;
        qtyOut = 0;
      } else {
        qtyIn = change > 0 ? change : 0;
        qtyOut = change < 0 ? Math.abs(change) : 0;
      }

      if (!whId) {
        // At company-wide level, internal transfers shift goods between locations without changing net external commercial inflow/outflow
        if (!isTrans) {
          if (qtyIn) periodIn += qtyIn;
          if (qtyOut) periodOut += qtyOut;
        }
      } else {
        if (qtyIn) periodIn += qtyIn;
        if (qtyOut) periodOut += qtyOut;
      }

      if (typeFilter === "purchases" && !isPur) return;
      if (typeFilter === "sales" && !isSale) return;
      if (typeFilter === "transfers" && !isTrans) return;
      if (typeFilter === "adjustments" && !isAdj) return;

      const whObj = warehouses.find(w => w.id === t.warehouseId);
      const whName = whObj ? whObj.name : (t.warehouseId || "المستودع الرئيسي");
      const isWhVehicle = isVehicleWarehouse(t.warehouseId, whName);
      const isWhMain = isMainWarehouse(t.warehouseId, whName);
      const isVanSale = isSale && isWhVehicle;
      const isMainSale = isSale && isWhMain;
      const isCleanCommercial = !isIgnoredReversal && !["sale_reverse_edit", "reverse_edit", "purchase_reverse", "sale_cancel"].includes(t.type);

      chronologicalLedger.push({
        ...t,
        dateStr,
        partyName,
        isIgnoredReversal,
        qtyIn,
        qtyOut,
        balanceAfter: runningQty,
        whBalance: whRunningBalances[wid] !== undefined ? whRunningBalances[wid] : runningQty,
        companyBalance: runningQty,
        runningWAC,
        runningValuation: runningQty * runningWAC,
        txCost,
        whName,
        isPur,
        isSale,
        isTrans,
        isAdj,
        isWhVehicle,
        isWhMain,
        isVanSale,
        isMainSale,
        isCleanCommercial
      });
    });

    currentLedger = chronologicalLedger;

    // ──────────────────────────────────────────
    // 3.5 Calculate Supply Chain Flow Pipeline Metrics
    // ──────────────────────────────────────────
    let pipeSupplierIn = 0;
    let pipeSupplierInCount = 0;
    let pipeCustReturns = 0;

    let pipeMainSales = 0;
    let pipeMainSalesCount = 0;
    let pipeTransfersToVans = 0;
    let pipeReturnsFromVans = 0;

    let pipeVanSales = 0;
    let pipeVanSalesCount = 0;
    let pipeVanReceived = 0;

    rawTxs.forEach(t => {
      const wid = t.warehouseId;
      const isMain = isMainWarehouse(wid);
      const isVan = isVehicleWarehouse(wid);
      const tType = t.type || "";
      const q = parseFloat(t.qtyChange || 0);

      // Reversal artifacts should not distort flow
      const isPurReversal = (tType === "purchase_reverse");
      if (isPurReversal) return;

      if (tType === "purchase_invoice" || tType === "purchase_in") {
        if (q > 0) {
          pipeSupplierIn += q;
          pipeSupplierInCount++;
        }
      } else if (tType === "sales_return" || tType === "return_in") {
        if (q > 0) pipeCustReturns += q;
      }

      if (["sales_invoice", "sale_out", "delivery_note", "pos_sale"].includes(tType)) {
        if (q < 0) {
          const absQ = Math.abs(q);
          if (isMain) {
            pipeMainSales += absQ;
            pipeMainSalesCount++;
          } else if (isVan) {
            pipeVanSales += absQ;
            pipeVanSalesCount++;
          }
        }
      }

      if (tType === "transfer_out") {
        const absQ = Math.abs(q);
        if (isMain) {
          pipeTransfersToVans += absQ;
        }
      } else if (tType === "transfer_in") {
        if (isMain) {
          pipeReturnsFromVans += q;
        } else if (isVan) {
          pipeVanReceived += q;
        }
      }
    });

    const pipeMainStock = mainWhStock;
    const pipeVanStock = vanStock;

    // Populate Pipeline UI
    const pipeContainer = document.getElementById("sc-pipeline-container");
    if (pipeContainer) {
      pipeContainer.style.display = "block";
      
      const elSupInQty = document.getElementById("pipe-supplier-in-qty");
      if (elSupInQty) elSupInQty.textContent = "+" + formatQuantity(pipeSupplierIn);
      const elSupInCount = document.getElementById("pipe-supplier-in-count");
      if (elSupInCount) elSupInCount.textContent = `${pipeSupplierInCount} فواتير شراء`;
      const elCustRet = document.getElementById("pipe-cust-returns");
      if (elCustRet) elCustRet.textContent = formatQuantity(pipeCustReturns);

      const elMainStock = document.getElementById("pipe-main-current-stock");
      if (elMainStock) elMainStock.textContent = formatQuantity(pipeMainStock);
      const elMainSales = document.getElementById("pipe-main-sales-qty");
      if (elMainSales) elMainSales.textContent = "-" + formatQuantity(pipeMainSales);
      const elTransVans = document.getElementById("pipe-transfers-to-vans");
      if (elTransVans) elTransVans.textContent = "-" + formatQuantity(pipeTransfersToVans);
      const elRetVans = document.getElementById("pipe-returns-from-vans");
      if (elRetVans) elRetVans.textContent = "+" + formatQuantity(pipeReturnsFromVans);

      const elVanSales = document.getElementById("pipe-van-sales-qty");
      if (elVanSales) elVanSales.textContent = "-" + formatQuantity(pipeVanSales);
      const elVanSalesCount = document.getElementById("pipe-van-sales-count");
      if (elVanSalesCount) elVanSalesCount.textContent = `${pipeVanSalesCount} فواتير ميدانية`;
      const elVanRec = document.getElementById("pipe-van-received-qty");
      if (elVanRec) elVanRec.textContent = "+" + formatQuantity(pipeVanReceived);
      const elVanStock = document.getElementById("pipe-van-current-stock");
      if (elVanStock) elVanStock.textContent = formatQuantity(pipeVanStock);

      // Conservation equation & progress bar
      const totalSales = pipeMainSales + pipeVanSales;
      const totalRemStock = pipeMainStock + pipeVanStock;
      const totalInflow = openingQty + pipeSupplierIn + pipeCustReturns;
      const totalOutAndRem = totalSales + totalRemStock;

      const tallyInEl = document.getElementById("pipe-tally-in");
      if (tallyInEl) tallyInEl.textContent = `الوارد والمتاح: ${formatQuantity(totalInflow)}`;
      const tallySalesEl = document.getElementById("pipe-tally-sales");
      if (tallySalesEl) tallySalesEl.textContent = `المبيعات الصادرة: ${formatQuantity(totalSales)}`;
      const tallyRemEl = document.getElementById("pipe-tally-rem");
      if (tallyRemEl) tallyRemEl.textContent = `المتبقي بالمخازن: ${formatQuantity(totalRemStock)}`;

      const tallyDetailsEl = document.getElementById("pipe-tally-details");
      if (tallyDetailsEl) tallyDetailsEl.textContent = `مبيعات المستودع: ${formatQuantity(pipeMainSales)} (${pipeMainSalesCount}) | مبيعات المناديب: ${formatQuantity(pipeVanSales)} (${pipeVanSalesCount})`;

      // Multi-segmented bar
      const baseTotal = totalOutAndRem > 0 ? totalOutAndRem : 1;
      const barMainSales = document.getElementById("pipe-bar-main-sales");
      if (barMainSales) barMainSales.style.width = ((pipeMainSales / baseTotal) * 100).toFixed(1) + "%";
      const barVanSales = document.getElementById("pipe-bar-van-sales");
      if (barVanSales) barVanSales.style.width = ((pipeVanSales / baseTotal) * 100).toFixed(1) + "%";
      const barMainStock = document.getElementById("pipe-bar-main-stock");
      if (barMainStock) barMainStock.style.width = ((pipeMainStock / baseTotal) * 100).toFixed(1) + "%";
      const barVanStock = document.getElementById("pipe-bar-van-stock");
      if (barVanStock) barVanStock.style.width = ((pipeVanStock / baseTotal) * 100).toFixed(1) + "%";
    }

    _lastOpeningQty = openingQty;
    _lastOpeningWAC = openingWAC;
    _lastFromDate = fromDate;

    // ──────────────────────────────────────────
    // 4. Update Top KPIs
    // ──────────────────────────────────────────
    const whObj = warehouses.find(w => w.id === whId);
    const isVehicle = whObj && (whObj.type === "Vehicle" || (whObj.name && whObj.name.includes("سيارة")));

    document.getElementById("sc-opening-bal").textContent = formatQuantity(openingQty);
    document.getElementById("sc-opening-bal-sub").textContent = fromDate ? `رصيد البداية في ${fromDate}` : "بداية النشاط (صفر)";
    document.getElementById("sc-total-in").textContent = formatQuantity(periodIn);
    document.getElementById("sc-total-out").textContent = formatQuantity(periodOut);
    document.getElementById("sc-current-balance").textContent = formatQuantity(activeBalance);

    const inSubEl = document.querySelector("#sc-total-in + div");
    if (inSubEl) {
      inSubEl.textContent = isVehicle ? "تحويلات واردة واسترجاعات" : (whId ? "مشتريات وتحويلات واردة" : "مشتريات ومرتجعات بيع");
    }

    const balSubEl = document.getElementById("sc-balance-breakdown-sub");
    if (balSubEl) {
      balSubEl.textContent = whId ? `الرصيد في ${whObj?.name || 'الموقع المختار'}` : "شامل الرئيسي والسيارات";
    }
    
    document.getElementById("sc-total-valuation").textContent = formatCurrency(runningWAC);
    document.getElementById("sc-total-valuation-sub").innerHTML = `القيمة الكلية: <b class="text-brand">${formatCurrency(activeBalance * runningWAC)}</b>`;

    document.getElementById("sc-subtitle").innerHTML = `
      الصنف: <strong class="text-indigo">${selectedProduct.name}</strong> • الكود (SKU): <strong class="mono">${selectedProduct.sku}</strong> 
      • الوحدة: <strong>${selectedProduct.unit || 'كرتون'}</strong> • الباركود: <strong class="mono">${selectedProduct.barcode || '—'}</strong>
    `;

    const totalTxCount = rawTxs.filter(t => !whId || t.warehouseId === whId).length;
    document.getElementById("sc-meta-info").textContent = `(${chronologicalLedger.length} / ${totalTxCount} حركة)`;

    // Reconciliation alert: warn if ledger ending balance ≠ actual Firestore stock
    const ledgerEndBalance = chronologicalLedger.length > 0
      ? chronologicalLedger[chronologicalLedger.length - 1].balanceAfter
      : runningQty;
    const balanceDiff = Math.abs(ledgerEndBalance - activeBalance);
    const reconcAlert = document.getElementById("sc-reconcile-alert");
    if (reconcAlert) {
      if (!fromDate && !toDate) {
        if (balanceDiff <= 0.001) {
          reconcAlert.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <span>✅ <b>مطابقة تامة 100%:</b> الرصيد المحسوب من دفتر الحركات (<b>${formatQuantity(ledgerEndBalance)}</b> ${selectedProduct.unit || 'كرتون'}) يطابق تماماً رصيد المخزن الفعلي المعتمد (<b>${formatQuantity(activeBalance)}</b>).</span>
              <span style="font-size:11px; font-weight:normal; opacity:0.9;">سجل الحركات متسلسل وموثق بالكامل بدون أي عجز</span>
            </div>
          `;
          reconcAlert.style.background = "rgba(16,185,129,0.08)";
          reconcAlert.style.borderColor = "rgba(16,185,129,0.3)";
          reconcAlert.style.color = "#059669";
          reconcAlert.style.display = "block";
        } else {
          reconcAlert.innerHTML = `⚠️ <b>تنبيه تدقيق:</b> الرصيد المحسوب من الحركات (${formatQuantity(ledgerEndBalance)}) يختلف عن الرصيد الفعلي في المخزن (${formatQuantity(activeBalance)}). الفرق: ${formatQuantity(balanceDiff)} وحدة — قد تكون هناك حركات لم تُعتمد أو مسودات.`;
          reconcAlert.style.background = "rgba(239,68,68,0.08)";
          reconcAlert.style.borderColor = "rgba(239,68,68,0.3)";
          reconcAlert.style.color = "#DC2626";
          reconcAlert.style.display = "block";
        }
      } else {
        reconcAlert.style.display = "none";
      }
    }

    // ──────────────────────────────────────────
    // 5. Render Table Rows
    // ──────────────────────────────────────────
    renderTableRows(openingQty, openingWAC, fromDate);

  } catch (err) {
    console.error("loadStockCardReport error:", err);
    tbody.innerHTML = `<tr><td colspan="13" class="text-bad" style="text-align:center; padding:32px;">حدث خطأ: ${err.message}</td></tr>`;
  }
};

function renderTableRows(openingQty = _lastOpeningQty, openingWAC = _lastOpeningWAC, fromDate = _lastFromDate) {
  const tbody = document.getElementById("sc-tbody");
  if (!tbody) return;
  const whId = document.getElementById("sc-wh-filter")?.value || "";

  // Filter by Smart Path
  let rowsToDisplay = _sortOrder === "asc" ? [...currentLedger] : [...currentLedger].reverse();

  if (_currentPath === "main") {
    rowsToDisplay = rowsToDisplay.filter(t => t.isWhMain);
  } else if (_currentPath === "transfers") {
    rowsToDisplay = rowsToDisplay.filter(t => t.isTrans);
  } else if (_currentPath === "van_sales") {
    rowsToDisplay = rowsToDisplay.filter(t => t.isVanSale);
  } else if (_currentPath === "clean") {
    rowsToDisplay = rowsToDisplay.filter(t => t.isCleanCommercial);
  }

  // Update Path Buttons Active State
  document.querySelectorAll(".sc-path-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.path === _currentPath);
  });

  // Update Status Bar
  const statusBar = document.getElementById("sc-path-status-bar");
  if (statusBar) {
    let pathMsg = "";
    if (_currentPath === "all") {
      pathMsg = `<span>🌐 <b>الدورة الشاملة:</b> يعرض جميع الحركات التراكمية في كافة المواقع (${rowsToDisplay.length} حركة مسجلة)</span>`;
    } else if (_currentPath === "main") {
      pathMsg = `<span>🏢 <b>مسار المستودع الرئيسي فقط:</b> يعرض المشتريات المباشرة، والمبيعات الصادرة، وشحنات التحميل (${rowsToDisplay.length} حركة)</span>`;
    } else if (_currentPath === "transfers") {
      pathMsg = `<span>🔄 <b>مسار شحنات تحويلات السيارات:</b> يعرض سندات تحميل سيارات المناديب والتفريغ (${rowsToDisplay.length} سند تحويل)</span>`;
    } else if (_currentPath === "van_sales") {
      pathMsg = `<span>🚐 <b>مسار مبيعات سيارات المناديب:</b> يعرض فواتير بيع المندوبين للعملاء بالميدان (${rowsToDisplay.length} فاتورة بيع)</span>`;
    } else if (_currentPath === "clean") {
      pathMsg = `<span>✨ <b>المبيعات التجارية الصافية:</b> تم إخفاء القيود العكسية التقنية لعرض الفواتير الحقيقية الصافية فقط (${rowsToDisplay.length} حركة تجارية)</span>`;
    }

    statusBar.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${pathMsg}
      </div>
      ${_currentPath !== 'all' ? `<button class="btn btn-sm btn-secondary" onclick="window.setScPathFilter('all')" style="padding:2px 8px; font-size:10.5px; border-radius:4px;">إلغاء التصفية (عرض الكل) ✕</button>` : ''}
    `;
    statusBar.style.display = "flex";
  }

  let openingRow = "";
  // Show opening balance row ONLY if user specified a "fromDate" filter (e.g. from August 1st) AND path is "all"
  if (_currentPath === "all" && fromDate && _sortOrder === "asc") {
    openingRow = `
      <tr style="background:rgba(99,102,241,0.06); font-weight:700;">
        <td style="text-align:center;" class="mono dim">0</td>
        <td class="mono dim">${fromDate}</td>
        <td style="text-align:center;"><span class="sc-badge" style="background:#E2E8F0; color:#334155;">📅 رصيد أول المدة</span></td>
        <td class="mono dim">—</td>
        <td class="mono dim">—</td>
        <td class="dim">رصيد الصنف في بداية الفترة المحددة (${fromDate})</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono font-bold text-brand" style="font-size:13px;">${formatQuantity(openingQty)}</td>
        <td style="text-align:left;" class="mono dim">${formatCurrency(openingWAC)}</td>
        <td style="text-align:left;" class="mono text-brand font-bold">${formatCurrency(openingWAC)}</td>
        <td style="text-align:left;" class="mono font-bold">${formatCurrency(openingQty * openingWAC)}</td>
        <td class="dim" style="font-size:11px;">الرصيد الافتتاحي للصنف في تاريخ ${fromDate}</td>
      </tr>
    `;
  }

  if (!rowsToDisplay.length) {
    tbody.innerHTML = openingRow + `<tr><td colspan="13" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مسجلة للصنف خلال الفترة المحددة</td></tr>`;
    return;
  }

  const typeLabels = {
    purchase_invoice:       { label: "📥 فاتورة شراء",        cls: "sc-type-purchase" },
    purchase_in:            { label: "📥 فاتورة شراء",        cls: "sc-type-purchase" },
    purchase_return:        { label: "↩️ مردود مشتريات",      cls: "sc-type-sale" },
    purchase_reverse:       { label: "🔁 تسوية تعديل شراء",   cls: "sc-type-adj" },
    purchase_reverse_edit:  { label: "🔁 تعديل فاتورة شراء",  cls: "sc-type-adj" },
    sales_invoice:          { label: "📤 فاتورة بيع",         cls: "sc-type-sale" },
    sale_out:               { label: "📤 فاتورة بيع",         cls: "sc-type-sale" },
    sale_out_edit:          { label: "📤 فاتورة بيع (معدلة)", cls: "sc-type-sale" },
    delivery_note:          { label: "📦 سند تسليم بضاعة",    cls: "sc-type-sale" },
    sale_reverse_edit:      { label: "🔁 استرجاع تعديل فاتورة (+)", cls: "sc-type-purchase" },
    sale_reverse:           { label: "🔁 استرجاع تعديل فاتورة (+)", cls: "sc-type-purchase" },
    reverse_edit:           { label: "🔁 استرجاع تعديل فاتورة (+)", cls: "sc-type-purchase" },
    sale_cancel:            { label: "🔁 تسوية تعديل قديم",   cls: "sc-type-adj" },
    sales_return:           { label: "📥 مردود مبيعات",       cls: "sc-type-purchase" },
    pos_sale:               { label: "🛍️ نقطة بيع",          cls: "sc-type-sale" },
    transfer_out:           { label: "🔄 تحويل صادر (-)",     cls: "sc-type-transfer" },
    transfer_in:            { label: "🔄 تحويل وارد (+)",     cls: "sc-type-transfer" },
    adjustment:             { label: "⚖️ تسوية جردية",        cls: "sc-type-adj" },
    damage:                 { label: "⚠️ إتلاف وتالف",        cls: "sc-type-adj" },
    opening:                { label: "📅 رصيد افتتاحي",       cls: "sc-badge" }
  };

  tbody.innerHTML = openingRow + rowsToDisplay.map((t, idx) => {
    const tConfig = typeLabels[t.type] || { label: t.type || "حركة", cls: "sc-badge" };
    const rowNum = _sortOrder === "asc" ? (idx + 1) : (rowsToDisplay.length - idx);
    const docRefStr = t.documentNumber || t.docRef || t.invoiceNumber || t.refCode || '—';

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="text-align:center;" class="mono dim">${rowNum}</td>
        <td class="mono font-bold" style="font-size:11px;">${t.dateStr}</td>
        <td style="text-align:center;">
          <span class="sc-badge ${tConfig.cls}">${tConfig.label}</span>
        </td>
        <td class="mono font-bold">
          <span style="color:var(--brand); cursor:pointer;" onclick="window.previewStockDoc('${t.type}','${docRefStr}')" title="عرض تفاصيل المستند ${docRefStr}">
            ${docRefStr}
          </span>
        </td>
        <td style="font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${t.partyName ? `<span style="font-weight:700; color:var(--text-0);" title="${t.partyName}">${t.partyName}</span>` : '<span class="dim">—</span>'}
        </td>
        <td>
          <span style="font-weight:700; color:var(--text-0);">${t.whName}</span>
        </td>
        <td style="text-align:center;" class="mono font-bold ${t.qtyIn ? 'text-good' : 'dim'}">
          ${t.qtyIn ? '+' + formatQuantity(t.qtyIn) : '—'}
        </td>
        <td style="text-align:center;" class="mono font-bold ${t.qtyOut ? 'text-bad' : 'dim'}">
          ${t.qtyOut ? '-' + formatQuantity(t.qtyOut) : '—'}
        </td>
        <td style="text-align:center; background:rgba(99,102,241,0.04);">
          ${whId ? `
            <span class="mono font-bold" style="font-size:13px; color:${t.balanceAfter > 0 ? '#10B981' : (t.balanceAfter === 0 ? '#64748B' : '#EF4444')};">
              ${formatQuantity(t.balanceAfter)}
            </span>
          ` : `
            <div>
              <span class="mono font-bold" style="font-size:13px; color:${t.balanceAfter > 0 ? '#10B981' : (t.balanceAfter === 0 ? '#64748B' : '#EF4444')};" title="رصيد إجمالي الشركة">
                ${formatQuantity(t.balanceAfter)}
              </span>
              <div style="font-size:9.5px; color:var(--text-2); font-family:var(--font-mono); white-space:nowrap; margin-top:1px;" title="رصيد ${t.whName} بعد هذه الحركة مباشرة">
                موقع: <b>${formatQuantity(t.whBalance)}</b>
              </div>
            </div>
          `}
        </td>
        <td style="text-align:left;" class="mono dim">${formatCurrency(t.txCost)}</td>
        <td style="text-align:left;" class="mono font-bold text-brand">${formatCurrency(t.runningWAC)}</td>
        <td style="text-align:left;" class="mono font-bold">${formatCurrency(t.runningValuation)}</td>
        <td style="font-size:11px; color:var(--text-1); max-width:260px;">
          ${formatNoteCleanly(t)}
        </td>
      </tr>
    `;
  }).join("");
}

function formatNoteCleanly(t) {
  let note = String(t.notes || t.description || "").trim();
  const qChange = Math.abs(parseFloat(t.qtyChange || 0));
  const unitStr = (selectedProduct && selectedProduct.unit) ? selectedProduct.unit : "كرتون";

  if (t.isIgnoredReversal) {
    if (t.isPur || t.type === "purchase_reverse") {
      return `<span class="sc-badge" style="background:#fef3c7; color:#b45309; font-weight:bold;">🔁 قيد تسوية تعديل قديم (فاتورة الشراء قائمة ومثبتة فعلياً بالمستودع)</span>`;
    }
    return `<span class="sc-badge" style="background:#fef3c7; color:#b45309; font-weight:bold;">🔁 قيد تسوية تعديل قديم (الفاتورة قائمة ومخصومة فعلياً من العهدة)</span>`;
  }

  if (t.isTrans) {
    const qtyBadge = `<span class="mono font-bold" style="background:rgba(99,102,241,0.14); color:#4F46E5; padding:2px 8px; border-radius:6px; border:1px solid rgba(99,102,241,0.35); font-size:11px; margin-left:6px;">🔄 شحنة: ${qChange} ${unitStr}</span>`;
    let cleanMsg = note;
    if (cleanMsg.includes("تصحيح تلقائي عند الاستلام") || cleanMsg.includes("كمية مفقودة")) {
      cleanMsg = `تأكيد استلام الشحنة في سيارة المندوب رسمياً`;
    } else if (cleanMsg.includes("قيد النقل إلى")) {
      cleanMsg = cleanMsg.replace("قيد النقل إلى", "صرف تحويل معتمد إلى");
    }
    return `${qtyBadge} <span style="font-weight:700; color:var(--text-0);">${cleanMsg}</span>`;
  }

  if (t.isSale && t.partyName) {
    return `<span style="color:var(--text-0); font-weight:700;">فاتورة بيع رسمية للعميل: <b>${t.partyName}</b></span>`;
  }

  if (t.isPur && t.partyName) {
    return `<span style="color:var(--text-0); font-weight:700;">استلام توريد من المورد: <b>${t.partyName}</b></span>`;
  }

  return note || (t.createdByName ? `بواسطة: ${t.createdByName}` : "حركة نظامية موثقة");
}

window.previewStockDoc = (type, docRef) => {
  if (!docRef || docRef === '—') return;
  toast(`مستند رقم: ${docRef}`, "info");
};

window.toggleScSort = (order) => {
  _sortOrder = order;
  const ascBtn = document.getElementById("sc-sort-asc-btn");
  const descBtn = document.getElementById("sc-sort-desc-btn");
  if (order === "asc") {
    if (ascBtn) { ascBtn.style.background = "var(--brand)"; ascBtn.style.color = "#fff"; }
    if (descBtn) { descBtn.style.background = "var(--bg-2)"; descBtn.style.color = "var(--text-1)"; }
  } else {
    if (descBtn) { descBtn.style.background = "var(--brand)"; descBtn.style.color = "#fff"; }
    if (ascBtn) { ascBtn.style.background = "var(--bg-2)"; ascBtn.style.color = "var(--text-1)"; }
  }
  renderTableRows();
};

window.setScPathFilter = (path) => {
  _currentPath = path;
  renderTableRows();
};

window.printOfficialStockCard = () => {
  window.print();
};

window.exportStockCardExcel = () => {
  if (!currentLedger.length || !selectedProduct) {
    toast("يرجى اختيار صنف واستخراج الكرت أولاً", "warning");
    return;
  }

  const rows = currentLedger.map((t, i) => ({
    "م": i + 1,
    "التاريخ": t.dateStr,
    "نوع الحركة": t.type,
    "رقم المستند": t.documentNumber || t.docRef || "",
    "الطرف الثاني": t.partyName || "",
    "المستودع": t.whName,
    "وارد (+)": t.qtyIn || 0,
    "صادر (-)": t.qtyOut || 0,
    "الرصيد بعد": t.balanceAfter,
    "تكلفة الوحدة": t.txCost,
    "المتوسط المرجح": t.runningWAC,
    "القيمة التراكمية": t.runningValuation,
    "البيان والملاحظات": t.notes || t.description || ""
  }));

  exportToExcel({
    title: `كرت_حركة_الصنف_${selectedProduct.sku}_${todayString()}`,
    headers: ["م", "التاريخ", "نوع الحركة", "رقم المستند", "الطرف الثاني", "المستودع", "وارد (+)", "صادر (-)", "الرصيد بعد", "تكلفة الوحدة", "المتوسط المرجح", "القيمة التراكمية", "البيان والملاحظات"],
    rows: rows.map(r => Object.values(r)),
    colWidths: [6, 12, 16, 16, 22, 18, 10, 10, 12, 12, 14, 14, 28]
  });
};

window.printCustodyReconciliation = () => {
  if (!selectedProduct) {
    toast("يرجى اختيار صنف واستخراج الكرت أولاً", "warning");
    return;
  }
  const whId = document.getElementById("sc-wh-filter")?.value || "";
  const whObj = warehouses.find(w => w.id === whId);
  const whName = whObj?.name || "جميع المستودعات والسيارات";
  const co = getCompanyInfo();

  // Inbound items
  const inRows = currentLedger.filter(t => t.qtyIn > 0);
  const totalIn = inRows.reduce((sum, t) => sum + (t.qtyIn || 0), 0);

  // Outbound items
  const outRows = currentLedger.filter(t => t.qtyOut > 0);
  const totalOut = outRows.reduce((sum, t) => sum + (t.qtyOut || 0), 0);

  const endingBal = currentLedger.length > 0 ? currentLedger[currentLedger.length - 1].balanceAfter : 0;
  const unitStr = selectedProduct.unit || "كرتون";

  const win = window.open("", "_blank", "width=920,height=800");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${selectedProduct.name} — ${whName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#0f172a; background:#fff; padding:10px; font-size:11px; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .mono { font-family:'IBM Plex Mono', monospace; }
    table { width:100%; border-collapse:collapse; margin-bottom:10px; }
    th, td { border:1px solid #cbd5e1; padding:4px 6px; font-size:10.5px; }
    th { background:#f1f5f9; font-weight:800; }
    .header { border-bottom:2px solid #0f3d19; padding-bottom:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }
    .title-box { text-align:center; flex:1; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:12px; }
    .kpi-box { border:1.5px solid #cbd5e1; border-radius:8px; padding:6px; text-align:center; background:#f8fafc; }
    .kpi-val { font-size:15px; font-weight:900; margin-top:2px; }
    .audit-box { border:2px dashed #0f3d19; border-radius:8px; padding:10px; margin:12px 0; background:#f0fdf4; }
    .signatures { display:flex; justify-content:space-between; margin-top:24px; padding-top:8px; }
    .sig-col { width:30%; text-align:center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="font-size:15px; font-weight:900; color:#0f3d19;">${co.name}</h2>
      <div style="font-size:9.5px; color:#64748b;">سجل تجاري: ${co.crNumber || '—'} • ر.ض: ${co.vatNumber || '—'}</div>
    </div>
    <div class="title-box">
      <h1 style="font-size:16px; font-weight:900; color:#0f172a;">محضر مطابقة وجرد عهدة سيارة / مخزن</h1>
      <div style="font-size:10.5px; color:#0f3d19; font-weight:700;">كشف تفريغ حركة الصنف وتدقيق العهدة الميدانية</div>
    </div>
    <div style="text-align:left; font-size:9.5px; color:#64748b;">
      <div>تاريخ الاستخراج: <b>${todayString()}</b></div>
      <div>نظام IDHAM ERP</div>
    </div>
  </div>

  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; font-size:11px;">
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${selectedProduct.name}</span> (SKU: <span class="mono">${selectedProduct.sku}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${whName}</span></div>
    <div><b>الوحدة:</b> <span>${unitStr}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${formatQuantity(totalIn)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${formatQuantity(totalOut)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${formatQuantity(endingBal)} ${unitStr}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${currentLedger.length} حركة</div>
    </div>
  </div>

  <h4 style="font-size:11.5px; font-weight:800; color:#0f3d19; margin-bottom:4px;">1. بيان الشحنات والكميات المستلمة في العهدة (الوارد):</h4>
  <table>
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th style="width:70px;">التاريخ</th>
        <th style="width:90px;">رقم السند</th>
        <th>مصدر الشحنة / المسار</th>
        <th style="width:80px; text-align:center;">الكمية المستلمة</th>
        <th style="width:75px; text-align:center;">الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${inRows.map((t, i) => `
        <tr>
          <td style="text-align:center;" class="mono">${i+1}</td>
          <td class="mono">${t.dateStr}</td>
          <td class="mono font-bold">${t.documentNumber || t.docRef || '—'}</td>
          <td>${t.partyName || t.notes || 'استلام شحنة معتمدة'}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${formatQuantity(t.qtyIn)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("") || '<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${formatQuantity(totalIn)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h4 style="font-size:11.5px; font-weight:800; color:#0f3d19; margin-bottom:4px; margin-top:8px;">2. بيان المبيعات والتسليمات الموثقة للعملاء (الصادر):</h4>
  <table>
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th style="width:70px;">التاريخ</th>
        <th style="width:90px;">رقم الفاتورة</th>
        <th>اسم العميل / المطعم المستلم</th>
        <th style="width:80px; text-align:center;">الكمية المباعة</th>
        <th style="width:75px; text-align:center;">حالة الفاتورة</th>
      </tr>
    </thead>
    <tbody>
      ${outRows.map((t, i) => `
        <tr>
          <td style="text-align:center;" class="mono">${i+1}</td>
          <td class="mono">${t.dateStr}</td>
          <td class="mono font-bold">${t.documentNumber || t.docRef || '—'}</td>
          <td><b>${t.partyName || 'عميل نقدي'}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${formatQuantity(t.qtyOut)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("") || '<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${formatQuantity(totalOut)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${formatQuantity(endingBal)} ${unitStr}</b></div>
      <div>الرصيد الفعلي الموجود بالسيارة الآن: <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${unitStr}</div>
      <div>الفارق (عجز / زيادة): <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${unitStr}</div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <div style="font-weight:700;">المندوب / المسؤول عن العهدة</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
    </div>
    <div class="sig-col">
      <div style="font-weight:700;">أمين المستودع العام / الجارد</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
    </div>
    <div class="sig-col">
      <div style="font-weight:700;">اعتماد الإدارة والتدقيق المالي</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">الختم: ___________________</div>
    </div>
  </div>

  <div style="text-align:center; font-size:8px; color:#94a3b8; margin-top:16px;">
    وثيقة رسمية صادرة من نظام إدهام لإدارة الموارد — IDHAM ERP SCM • صالحة للتدقيق والمطابقة القانونية
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 700);
};
