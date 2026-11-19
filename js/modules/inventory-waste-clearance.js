// ══════════════════════════════════════════════════════════════════
// IDHAM ERP — DEAD STOCK, CLEARANCE RADAR & INVENTORY WASTE (v2.2)
// رادار الرواكد وتصريف المخزون ومحاضر الإتلاف والقيود المحاسبية
// + تاريخ الشراء وتصدير تقرير PDF مخصص للمناديب بدون أسعار التكلفة
// ══════════════════════════════════════════════════════════════════

import { getAll, create, update, adjustStock, createJournalEntry, COLS, doc, getDoc, db, COMPANY_ID } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, showToast, showConfirm, formatQuantity } from "../utils/helpers.js";

// ── State Variables ───────────────────────────────────────────
let allProducts = [];
let allStock = [];
let allWarehouses = [];
let allSalesInvoices = [];
let allPurchaseInvoices = [];
let allWasteRecords = [];
let analyzedItems = [];
let activeTab = "radar"; // "radar" | "history"
let activeFilter = "all"; // "all" | "dead" | "urgent_expiry" | "near_expiry" | "expired" | "slow"
let searchQuery = "";
let selectedWarehouseFilter = "";
let sortColumn = "priority"; // "priority" | "name" | "sku" | "purchaseDate" | "qty" | "saleDate" | "expiry" | "cost" | "sellingPrice" | "clearancePrice" | "risk"
let sortDirection = "asc"; // "asc" | "desc"

// ── Entry Point ───────────────────────────────────────────────
export async function render(container, user) {
  const root = container || document.getElementById("main-content");
  if (!root) return;

  root.innerHTML = buildPageSkeleton();
  attachGlobalHandlers();
  await loadRadarData();
}

// ── UI Skeleton ───────────────────────────────────────────────
function buildPageSkeleton() {
  return `
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;" dir="rtl">
      
      <!-- Top Page Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:14px; background:linear-gradient(135deg, #EF4444, #991B1B); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; box-shadow:0 6px 16px rgba(239,68,68,0.3);">
            ⚠️
          </div>
          <div>
            <h2 style="font-size:21px; font-weight:900; margin:0; color:var(--text-0,#0f172a);">رادار الرواكد وتصريف المخزون والتوالف</h2>
            <p style="margin:3px 0 0; font-size:12.5px; color:var(--text-2,#64748b);">كشف السلع الراكدة • تاريخ الشراء ومدة الركود • تسريع تصريف بضاعة قريبة الانتهاء • تسجيل محاضر التوالف</p>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <button class="btn btn-secondary btn-sm" onclick="window.printRadarPDF()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:8px 16px; border-radius:10px; background:#fff; border:1.5px solid #1e3a8a; color:#1e3a8a; box-shadow:0 2px 6px rgba(30,58,138,0.12); cursor:pointer;" title="طباعة وتصدير تقرير PDF مخصص للمندوب بسعر البيع فقط دون إظهار التكلفة">
            <span>📑</span> <span>تصدير تقرير PDF (للمندوب)</span>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.exportWasteClearanceCSV()" style="font-weight:700; padding:8px 14px; border-radius:10px;">
            <span>📊</span> <span>تصدير CSV</span>
          </button>
          <button class="btn btn-primary" onclick="window.openWasteModal()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:8px 18px; border-radius:10px; background:linear-gradient(135deg,#EF4444,#B91C1C); border:none; box-shadow:0 4px 12px rgba(239,68,68,0.25);">
            <span>🗑️</span> <span>تسجيل محضر إتلاف بضاعة</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:14px; margin-bottom:20px;">
        <div id="card-filter-dead" class="card kpi-card" onclick="window.filterByCard('dead')" title="انقر لتصفية الأصناف الراكدة (+60 يوم أو لم تُبَع قط)" style="cursor:pointer; padding:16px; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); border-right:4px solid #EF4444; transition:all 0.2s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11.5px; color:var(--text-2,#64748b); font-weight:700;">🛑 أصناف راكدة (+60 يوم أو لم تُبَع)</div>
            <span class="card-filter-badge" style="font-size:9.5px; padding:1px 6px; border-radius:6px; background:#fee2e2; color:#ef4444; font-weight:700; display:none;">محدد ✓</span>
          </div>
          <div class="mono font-bold" id="stat-dead-stock-count" style="font-size:22px; color:#EF4444; margin-top:4px;">0 صنف</div>
          <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;" id="stat-dead-stock-qty">0 وحدة مخزنة</div>
        </div>

        <div id="card-filter-stagnant" class="card kpi-card" onclick="window.filterByCard('stagnant')" title="انقر لتصفية كل الأصناف ذات السيولة المجمدة (راكدة وبطيئة)" style="cursor:pointer; padding:16px; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); border-right:4px solid #F59E0B; transition:all 0.2s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div id="stat-frozen-title" style="font-size:11.5px; color:var(--text-2,#64748b); font-weight:700;">💰 سيولة مجمدة في الرواكد</div>
            <span class="card-filter-badge" style="font-size:9.5px; padding:1px 6px; border-radius:6px; background:#fef3c7; color:#d97706; font-weight:700; display:none;">محدد ✓</span>
          </div>
          <div class="mono font-bold" id="stat-dead-stock-val" style="font-size:22px; color:#D97706; margin-top:4px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;" id="stat-frozen-sub">محسوبة بسعر التكلفة WACC</div>
        </div>

        <div id="card-filter-expiring" class="card kpi-card" onclick="window.filterByCard('expiring')" title="انقر لتصفية البضائع القريبة والمنتهية الصلاحية" style="cursor:pointer; padding:16px; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); border-right:4px solid #DC2626; transition:all 0.2s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11.5px; color:var(--text-2,#64748b); font-weight:700;">⏳ بضائع قريبة / منتهية الصلاحية</div>
            <span class="card-filter-badge" style="font-size:9.5px; padding:1px 6px; border-radius:6px; background:#fee2e2; color:#dc2626; font-weight:700; display:none;">محدد ✓</span>
          </div>
          <div class="mono font-bold" id="stat-near-expiry-count" style="font-size:22px; color:#DC2626; margin-top:4px;">0 صنف</div>
          <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;" id="stat-near-expiry-sub">&lt; 90 يوم على الانتهاء</div>
        </div>

        <div id="card-filter-waste" class="card kpi-card" onclick="window.switchClearanceTab('history')" title="انقر لفتح سجل محاضر إتلاف المخزون" style="cursor:pointer; padding:16px; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); border-right:4px solid #6366F1; transition:all 0.2s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11.5px; color:var(--text-2,#64748b); font-weight:700;">🗑️ إجمالي التوالف المسجلة</div>
            <span style="font-size:10.5px; color:#6366F1; font-weight:700;">عرض السجل ⬅</span>
          </div>
          <div class="mono font-bold" id="stat-total-waste-val" style="font-size:22px; color:#4F46E5; margin-top:4px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;" id="stat-total-waste-count">0 محضر معتمد</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex; gap:10px; margin-bottom:14px; border-bottom:2px solid var(--border-soft,#e2e8f0); padding-bottom:6px;">
        <button id="tab-btn-radar" class="btn-radar-tab active" onclick="window.switchClearanceTab('radar')">
          🎯 رادار الرواكد والتصريف السريع
        </button>
        <button id="tab-btn-history" class="btn-radar-tab" onclick="window.switchClearanceTab('history')">
          📑 سجل محاضر الإتلاف السابقة (<span id="waste-history-count-badge">0</span>)
        </button>
      </div>

      <!-- RADAR TAB CONTENT -->
      <div id="tab-content-radar">
        <!-- Filter Bar -->
        <div class="card" style="padding:14px 18px; border-radius:12px; margin-bottom:14px; background:var(--bg-card,#fff); border:1px solid var(--border-soft,#e2e8f0);">
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
            
            <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
              <input type="text" id="radar-search" placeholder="🔍 بحث باسم الصنف أو الكود..." class="form-control" style="width:240px; font-size:12.5px; padding:6px 12px; border-radius:8px;" oninput="window.onRadarFilterChange()" />
              
              <select id="radar-wh-filter" class="form-control" style="width:180px; font-size:12.5px; padding:6px 10px; border-radius:8px;" onchange="window.onRadarFilterChange()">
                <option value="">— كل المستودعات —</option>
              </select>

              <select id="radar-risk-filter" class="form-control" style="width:220px; font-size:12.5px; padding:6px 10px; border-radius:8px;" onchange="window.onRadarFilterChange()">
                <option value="all">كل الحالات والأنواع</option>
                <option value="never_sold">🚫 أصناف لم تُبَع قط نهائياً (راكدة)</option>
                <option value="dead">🛑 راكد ميت (+60 يوم أو لم يُبَع)</option>
                <option value="slow">🐢 بطيء الحركة (آخر بيع 30-59 يوم)</option>
                <option value="stagnant">💰 كل الرواكد (ميتة + لم تُبَع + بطيئة)</option>
                <option value="expiring">⏳ قريبة ومنتهية الصلاحية</option>
                <option value="urgent_expiry">⏳ وشيك الانتهاء (&lt;60 يوم)</option>
                <option value="near_expiry">⚠️ قريب الانتهاء (&lt;90 يوم)</option>
                <option value="expired">🚨 منتهي الصلاحية</option>
                <option value="new_stock">🆕 وصول حديث (&lt;30 يوم)</option>
              </select>
            </div>

            <div style="font-size:12px; color:var(--text-2,#64748b);">
              عدد الأصناف المطابقة: <strong id="radar-matched-count" style="color:var(--text-0,#0f172a);">0</strong>
            </div>

          </div>
        </div>

        <!-- Clearance Table Card -->
        <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); overflow:hidden; background:var(--bg-card,#fff);">
          <div class="table-container" style="max-height:620px; overflow-y:auto;">
            <table class="data-dense" style="margin:0; font-size:12.5px; width:100%; border-collapse:collapse;">
              <thead id="radar-thead">
                <tr style="background:var(--bg-3,#f8fafc); position:sticky; top:0; z-index:2; border-bottom:2px solid var(--border-soft,#e2e8f0);">
                  <th class="sortable-th" onclick="window.setRadarSort('name')" style="text-align:right; padding:10px 14px;" title="ترتيب حسب اسم الصنف">
                    الصنف والبيانات <span class="sort-icon" data-col="name">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('sku')" style="width:95px; text-align:center;" title="ترتيب حسب الكود (SKU)">
                    الكود <span class="sort-icon" data-col="sku">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('purchaseDate')" style="width:160px; min-width:145px; text-align:center; color:#1e3a8a;" title="ترتيب حسب تاريخ الشراء / الورود">
                    📅 تاريخ الشراء والمورد <span class="sort-icon" data-col="purchaseDate">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('qty')" style="width:105px; text-align:center;" title="ترتيب حسب الرصيد المتوفر بالمستودع">
                    الرصيد الكلي <span class="sort-icon" data-col="qty">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('saleDate')" style="width:165px; min-width:150px; text-align:center;" title="ترتيب حسب تاريخ آخر حركة بيع">
                    آخر حركة بيع والعميل <span class="sort-icon" data-col="saleDate">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('expiry')" style="width:115px; text-align:center;" title="ترتيب حسب تاريخ الصلاحية">
                    الصلاحية <span class="sort-icon" data-col="expiry">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('cost')" style="width:105px; text-align:left;" title="ترتيب حسب التكلفة المتوسطة WACC">
                    التكلفة WACC <span class="sort-icon" data-col="cost">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('sellingPrice')" style="width:105px; text-align:left;" title="ترتيب حسب سعر البيع الحالي">
                    سعر البيع الحالي <span class="sort-icon" data-col="sellingPrice">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('clearancePrice')" style="width:125px; text-align:left; color:#10B981;" title="ترتيب حسب سعر التصريف المقترح">
                    سعر التصريف <span class="sort-icon" data-col="clearancePrice">⇅</span>
                  </th>
                  <th class="sortable-th" onclick="window.setRadarSort('risk')" style="width:125px; text-align:center;" title="ترتيب حسب تصنيف الخطورة والركود">
                    تصنيف الخطر <span class="sort-icon" data-col="risk">⇅</span>
                  </th>
                  <th style="width:150px; text-align:center;">الإجراءات السريعة</th>
                </tr>
              </thead>
              <tbody id="waste-tbody">
                <tr><td colspan="11" style="text-align:center; padding:35px; color:var(--text-2,#64748b);">⏳ جارٍ فحص تواريخ الشراء وحركة المبيعات وتواريخ الصلاحية…</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- HISTORY TAB CONTENT -->
      <div id="tab-content-history" style="display:none;">
        <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft,#e2e8f0); overflow:hidden; background:var(--bg-card,#fff);">
          <div style="padding:14px 18px; border-bottom:1px solid var(--border-soft,#e2e8f0); display:flex; justify-content:space-between; align-items:center; background:var(--bg-2,#f8fafc);">
            <strong style="font-size:14px; color:var(--text-0,#0f172a);">📑 سجل محاضر إتلاف البضاعة المسجلة</strong>
            <span style="font-size:12px; color:var(--text-2,#64748b);">يتم خصم الكميات وعكس القيود تلقائياً</span>
          </div>
          <div class="table-container" style="max-height:550px; overflow-y:auto;">
            <table class="data-dense" style="margin:0; font-size:12.5px; width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3,#f8fafc); border-bottom:2px solid var(--border-soft,#e2e8f0);">
                  <th style="width:110px; text-align:right; padding:10px 14px;">رقم المحضر</th>
                  <th style="width:105px; text-align:center;">التاريخ</th>
                  <th style="text-align:right;">الصنف التالف</th>
                  <th style="width:120px; text-align:center;">المستودع</th>
                  <th style="width:95px; text-align:center;">الكمية التالفة</th>
                  <th style="width:115px; text-align:left;">تكلفة الوحدة</th>
                  <th style="width:120px; text-align:left;">إجمالي الخسارة</th>
                  <th style="text-align:right;">سبب الإتلاف</th>
                  <th style="width:110px; text-align:center;">طباعة A4</th>
                </tr>
              </thead>
              <tbody id="waste-history-tbody">
                <tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-2,#64748b);">⏳ جارٍ تحميل محاضر الإتلاف…</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL 1: محضر إتلاف بضاعة -->
    <div class="modal-overlay" id="waste-modal" style="display:none;" onclick="if(event.target===this)window.closeWasteModal()">
      <div class="modal modal-lg" style="max-width:680px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1,#fff); box-shadow:0 20px 40px rgba(0,0,0,0.2);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:#EF4444; display:flex; align-items:center; gap:8px;">
            <span>🗑️</span> <span>تسجيل محضر إتلاف بضاعة تالفة / منتهية الصلاحية</span>
          </h3>
          <button class="modal-close" onclick="window.closeWasteModal()" style="background:none; border:none; font-size:22px; cursor:pointer; color:var(--text-2,#64748b);">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-2,#f8fafc);">
          <div class="card" style="padding:18px; border-radius:12px; background:var(--bg-card,#fff); border:1px solid var(--border-soft,#e2e8f0);">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">تاريخ المحضر *</label>
                <input type="date" id="waste-date" class="form-control mono font-bold" value="${todayString()}" style="width:100%; padding:7px 10px; border-radius:8px;" />
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">المستودع المصدر *</label>
                <select id="waste-warehouse" class="form-control font-bold" style="width:100%; padding:7px 10px; border-radius:8px;" onchange="window.onWasteWhChange()"></select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">الصنف التالف *</label>
              <select id="waste-product-select" class="form-control font-bold" style="width:100%; padding:7px 10px; border-radius:8px;" onchange="window.selectWasteProduct(this.value)"></select>
              <div id="waste-prod-avail-hint" style="font-size:11.5px; color:#2563EB; font-weight:700; margin-top:4px;"></div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">الكمية التالفة المراد إعدامها *</label>
                <input type="number" id="waste-qty" class="form-control mono font-bold text-bad" placeholder="0" min="1" style="width:100%; padding:7px 10px; border-radius:8px; font-size:14px;" oninput="window.calcWasteVal()" />
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">إجمالي خسارة التلف (WACC)</label>
                <input type="text" id="waste-total-loss" class="form-control mono font-bold text-bad" readonly value="0.00 ر.س" style="width:100%; padding:7px 10px; border-radius:8px; background:var(--bg-3,#f1f5f9);" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">سبب الإتلاف المعتمد *</label>
              <select id="waste-reason-preset" class="form-control" style="width:100%; padding:7px 10px; border-radius:8px; margin-bottom:6px;" onchange="window.onWasteReasonPreset(this.value)">
                <option value="انتهاء فترة الصلاحية">انتهاء فترة الصلاحية المقررة</option>
                <option value="كسر وتهشم أثناء النقل والتفريغ">كسر وتهشم أثناء النقل والتفريغ</option>
                <option value="تلف ناتج عن سوء التخزين أو الرطوبة">تلف ناتج عن سوء التخزين أو الرطوبة</option>
                <option value="عيب مصنعي غير مطابق للمواصفات">عيب مصنعي غير مطابق للمواصفات</option>
                <option value="أخرى">أسباب أخرى (اكتب في الملاحظات)</option>
              </select>
              <textarea id="waste-reason" class="form-control" rows="2" placeholder="ملاحظات تفصيلية أو أسماء أعضاء لجنة الإتلاف…" style="width:100%; padding:7px 10px; border-radius:8px;"></textarea>
            </div>

            <div style="font-size:11px; color:var(--text-muted,#64748b); background:rgba(239,68,68,0.06); padding:8px 12px; border-radius:8px; border:1px dashed rgba(239,68,68,0.3);">
              ℹ️ عند الاعتماد: سيتم خصم الكمية فوراً من رصيد المستودع وإنشاء قيد محاسبي تلقائي (مدين: خسائر تلف مخزون / دائن: المخزون).
            </div>

          </div>
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft,#e2e8f0); background:var(--bg-card,#fff); display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-ghost" onclick="window.closeWasteModal()" style="font-weight:700;">إلغاء</button>
          <button id="btn-save-waste" class="btn btn-primary" onclick="window.saveWasteRecord()" style="padding:8px 22px; font-weight:800; background:linear-gradient(135deg,#EF4444,#B91C1C); border:none; border-radius:8px;">
            💾 اعتماد الإتلاف وخصم المخزون
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: تعديل السعر الترويجي للتصريف -->
    <div class="modal-overlay" id="discount-modal" style="display:none;" onclick="if(event.target===this)window.closeDiscountModal()">
      <div class="modal" style="max-width:440px; width:92%; border-radius:16px; overflow:hidden; background:var(--bg-card,#fff); padding:20px;">
        <h3 style="margin:0 0 12px; font-size:16px; font-weight:900; color:var(--text-0,#0f172a);">🏷️ تطبيق سعر تصريف ترويجي</h3>
        <p style="font-size:12.5px; color:var(--text-2,#64748b); margin-bottom:14px;" id="discount-modal-prod-name"></p>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; margin-bottom:4px; display:block;">سعر البيع المقترح الجديد (ر.س) *</label>
          <input type="number" id="discount-modal-price" class="form-control mono font-bold text-good" step="0.01" style="width:100%; padding:8px 12px; font-size:15px; border-radius:8px;" />
        </div>
        <div id="discount-modal-cost-hint" style="font-size:11px; color:var(--text-muted,#64748b); margin-bottom:16px;"></div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-ghost" onclick="window.closeDiscountModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="window.confirmClearanceDiscount()" style="background:#10B981; border:none; font-weight:800; padding:8px 20px; border-radius:8px;">
            حفظ وتحديث السعر ✅
          </button>
        </div>
      </div>
    </div>

    <style>
      .btn-radar-tab {
        background: transparent;
        border: none;
        padding: 8px 18px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--text-2, #64748b);
        cursor: pointer;
        border-radius: 8px 8px 0 0;
        transition: all 0.2s;
      }
      .btn-radar-tab.active {
        color: #EF4444;
        border-bottom: 3px solid #EF4444;
        background: rgba(239,68,68,0.06);
      }
      .btn-radar-tab:hover:not(.active) {
        color: var(--text-0, #0f172a);
        background: var(--bg-2, #f8fafc);
      }
      .sortable-th {
        cursor: pointer !important;
        user-select: none;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .sortable-th:hover {
        background: #e2e8f0 !important;
        color: #1e3a8a !important;
      }
      .sort-icon {
        display: inline-block;
        font-size: 11px;
        margin-right: 3px;
        vertical-align: middle;
      }
    </style>
  `;
}

// ── Load Firestore Data ───────────────────────────────────────
async function loadRadarData() {
  try {
    const [pList, sList, wList, invList, wasteList, purList] = await Promise.all([
      getAll(COLS.products()).catch(() => []),
      getAll(COLS.stockByWarehouse()).catch(() => []),
      getAll(COLS.warehouses()).catch(() => []),
      getAll(COLS.salesInvoices()).catch(() => []),
      getAll(COLS.inventoryWaste()).catch(() => []),
      getAll(COLS.purchaseInvoices()).catch(() => []),
    ]);

    allProducts = pList || [];
    allStock = sList || [];
    allWarehouses = wList || [];
    allSalesInvoices = invList || [];
    allWasteRecords = wasteList || [];
    allPurchaseInvoices = purList || [];

    populateWarehouseFilters();
    analyzeClearanceAndWaste();

    renderKPIs();
    renderRadarTable();
    renderWasteHistoryTable();

  } catch (err) {
    console.error("loadRadarData error:", err);
    showToast("خطأ أثناء تحميل بيانات المخزون والرواكد", "error");
  }
}

function populateWarehouseFilters() {
  const filterSel = document.getElementById("radar-wh-filter");
  const modalSel = document.getElementById("waste-warehouse");

  const whOpts = allWarehouses.map(w => `<option value="${w.id}">${w.name || w.code || w.id}</option>`).join("");

  if (filterSel) {
    filterSel.innerHTML = '<option value="">— كل المستودعات —</option>' + whOpts;
  }
  if (modalSel) {
    modalSel.innerHTML = whOpts;
  }
}

function analyzeClearanceAndWaste() {
  const now = new Date();
  const DAY_MS = 1000 * 60 * 60 * 24;
  const sixtyDaysAgo = new Date(now.getTime() - (60 * DAY_MS));

  // 1. Stock map
  const stockMap = {};
  allStock.forEach(s => {
    const pid = s.productId;
    if (!pid) return;
    if (!stockMap[pid]) stockMap[pid] = { totalQty: 0, byWarehouse: {} };
    const q = Number(s.qty || s.quantity || 0);
    stockMap[pid].totalQty += q;
    stockMap[pid].byWarehouse[s.warehouseId] = (stockMap[pid].byWarehouse[s.warehouseId] || 0) + q;
  });

  // 2. Sales map (تتبع تاريخ ورقم آخر فاتورة بيع والكميات)
  const salesMap = {};
  allSalesInvoices.forEach(inv => {
    if (inv.status === "cancelled" || inv.status === "draft") return;
    let invDate;
    if (inv.date?.toDate) invDate = inv.date.toDate();
    else if (typeof inv.date === "string") invDate = new Date(inv.date);
    else if (inv.createdAt?.toDate) invDate = inv.createdAt.toDate();
    else if (typeof inv.createdAt === "string") invDate = new Date(inv.createdAt);
    else invDate = new Date(inv.date || 0);

    if (isNaN(invDate.getTime())) return;

    const isLast60 = (now.getTime() - invDate.getTime()) <= (60 * DAY_MS);

    const lines = inv.lines || inv.items || [];
    lines.forEach(l => {
      const pid = l.productId || l.id;
      if (!pid) return;
      if (!salesMap[pid]) {
        salesMap[pid] = {
          lastSoldDate: null,
          lastInvoiceNumber: "",
          lastInvoiceCustomer: "",
          lastInvoiceQty: 0,
          soldQtyLast60: 0
        };
      }
      if (!salesMap[pid].lastSoldDate || invDate > salesMap[pid].lastSoldDate) {
        salesMap[pid].lastSoldDate = invDate;
        salesMap[pid].lastInvoiceNumber = inv.number || inv.invoiceNumber || "";
        salesMap[pid].lastInvoiceCustomer = inv.customerName || inv.customer?.name || (typeof inv.customer === "string" ? inv.customer : "") || "";
        salesMap[pid].lastInvoiceQty = Number(l.qty || 0);
      }
      if (isLast60) {
        salesMap[pid].soldQtyLast60 += Number(l.qty || 0);
      }
    });
  });

  // 3. Purchase map (تاريخ الشراء والمورد ورقم الفاتورة)
  const purchaseMap = {};
  allPurchaseInvoices.forEach(inv => {
    if (inv.status === "cancelled" || inv.status === "draft") return;
    let invDate;
    if (inv.date?.toDate) invDate = inv.date.toDate();
    else if (typeof inv.date === "string") invDate = new Date(inv.date);
    else if (inv.createdAt?.toDate) invDate = inv.createdAt.toDate();
    else if (typeof inv.createdAt === "string") invDate = new Date(inv.createdAt);
    else return;

    if (isNaN(invDate.getTime())) return;

    const lines = inv.lines || inv.items || [];
    lines.forEach(l => {
      const pid = l.productId || l.id;
      if (!pid) return;
      if (!purchaseMap[pid] || invDate > purchaseMap[pid].lastPurchaseDate) {
        purchaseMap[pid] = {
          lastPurchaseDate: invDate,
          lastPurchaseInvoiceNumber: inv.number || inv.invoiceNumber || "",
          supplierName: inv.supplierName || inv.supplier?.name || (typeof inv.supplier === "string" ? inv.supplier : "") || ""
        };
      }
    });
  });

  // 4. Products Analysis
  analyzedItems = allProducts.map(p => {
    const sm = stockMap[p.id] || { totalQty: Number(p.totalQty || p.currentStock || 0), byWarehouse: {} };
    const totalQty = sm.totalQty;
    const saleInfo = salesMap[p.id] || { lastSoldDate: null, lastInvoiceNumber: "", lastInvoiceCustomer: "", lastInvoiceQty: 0, soldQtyLast60: 0 };
    const purInfo = purchaseMap[p.id] || {};
    
    const cost = Number(p.avgCostPrice || p.costPrice || 0);
    const sellingPrice = Number(p.sellingPrice || p.price || 0);

    // Purchase / Arrival Date Calculation
    let lastPurchaseDate = purInfo.lastPurchaseDate || null;
    let daysSincePurchase = null;
    if (lastPurchaseDate) {
      daysSincePurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / DAY_MS);
    }

    let arrivalDate = lastPurchaseDate;
    if (!arrivalDate && p.createdAt) {
      const cDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      if (!isNaN(cDate.getTime())) {
        arrivalDate = cDate;
      }
    }
    let daysSinceArrival = arrivalDate ? Math.floor((now.getTime() - arrivalDate.getTime()) / DAY_MS) : null;
    if (daysSincePurchase === null && daysSinceArrival !== null && lastPurchaseDate) {
      daysSincePurchase = daysSinceArrival;
    }

    // Expiry check
    let expiryDate = null;
    let daysToExpiry = null;
    if (p.expiryDate) {
      expiryDate = p.expiryDate?.toDate ? p.expiryDate.toDate() : new Date(p.expiryDate);
      if (!isNaN(expiryDate.getTime())) {
        daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS);
      }
    }

    // Days since last sale
    let daysSinceLastSale = null;
    if (saleInfo.lastSoldDate) {
      daysSinceLastSale = Math.floor((now.getTime() - saleInfo.lastSoldDate.getTime()) / DAY_MS);
    }

    // Accurate Stagnation Duration Calculation (فترة الركود الدقيقة)
    let stagnationDays = null;
    let stagnationSource = "none";
    const isNeverSold = !saleInfo.lastSoldDate;

    if (saleInfo.lastSoldDate) {
      if (lastPurchaseDate && lastPurchaseDate > saleInfo.lastSoldDate) {
        stagnationDays = daysSincePurchase;
        stagnationSource = "purchase_after_sale";
      } else {
        stagnationDays = daysSinceLastSale;
        stagnationSource = "sale";
      }
    } else {
      // صنف لم يُبَع قط: إذا كان تاريخ الشراء أو الإضافة موجوداً نعتمد عليه، وإلا فبضاعة أول المدة (~63 يوماً)
      stagnationDays = daysSinceArrival !== null ? daysSinceArrival : 63;
      stagnationSource = daysSinceArrival !== null ? "arrival" : "opening_stock";
    }

    // Accurate Risk Classification
    let riskType = "normal";
    let riskLabel = "طبيعي";
    let riskClass = "badge-good";
    let suggestedDiscountPct = 0;

    if (totalQty > 0) {
      if (daysToExpiry !== null && daysToExpiry <= 0) {
        riskType = "expired";
        riskLabel = "🚨 منتهي الصلاحية";
        riskClass = "badge-bad";
        suggestedDiscountPct = 100;
      } else if (daysToExpiry !== null && daysToExpiry <= 60) {
        riskType = "urgent_expiry";
        riskLabel = "⏳ وشيك الانتهاء";
        riskClass = "badge-bad";
        suggestedDiscountPct = 35;
      } else if (daysToExpiry !== null && daysToExpiry <= 90) {
        riskType = "near_expiry";
        riskLabel = "⚠️ قريب الانتهاء";
        riskClass = "badge-warn";
        suggestedDiscountPct = 20;
      } else if (isNeverSold) {
        // الأصناف الراكدة التي لم تُبَع قط نهائياً بالمخزون
        if (stagnationDays >= 30) {
          riskType = "dead";
          riskLabel = `🛑 لم يُبَع قط (${stagnationDays} يوم)`;
          riskClass = "badge-bad";
          suggestedDiscountPct = 15;
        } else {
          riskType = "new_stock";
          riskLabel = `🆕 وصول حديث (${stagnationDays} يوم)`;
          riskClass = "badge-good";
          suggestedDiscountPct = 0;
        }
      } else if (daysSinceLastSale !== null && daysSinceLastSale < 30) {
        // أي صنف تم بيعه خلال آخر 30 يوماً يعتبر نشطاً ومتحركاً ولا يدخل في الرواكد أبداً
        riskType = "normal";
        riskLabel = "✅ نشط ومتحرك";
        riskClass = "badge-good";
        suggestedDiscountPct = 0;
      } else if (stagnationDays !== null && stagnationDays >= 60) {
        riskType = "dead";
        riskLabel = "🛑 راكد ميت (+60 يوم)";
        riskClass = "badge-bad";
        suggestedDiscountPct = 15;
      } else if (stagnationDays !== null && stagnationDays >= 30 && stagnationDays < 60) {
        riskType = "slow";
        riskLabel = `🐢 بطيء الحركة (${stagnationDays} يوم)`;
        riskClass = "badge-warn";
        suggestedDiscountPct = 10;
      } else if (stagnationDays !== null && stagnationDays < 30) {
        riskType = "new_stock";
        riskLabel = `🆕 وصول حديث (${stagnationDays} يوم)`;
        riskClass = "badge-good";
        suggestedDiscountPct = 0;
      } else {
        riskType = "normal";
        riskLabel = "طبيعي";
        riskClass = "badge-good";
        suggestedDiscountPct = 0;
      }
    }

    let clearancePrice = sellingPrice;
    if (riskType === "expired") {
      clearancePrice = 0;
    } else if (suggestedDiscountPct > 0 && sellingPrice > 0) {
      const calcPrice = sellingPrice * (1 - (suggestedDiscountPct / 100));
      clearancePrice = Math.max(cost, calcPrice);
      clearancePrice = Math.round(clearancePrice * 100) / 100;
    }

    const frozenLiquidity = totalQty > 0 ? (totalQty * cost) : 0;

    return {
      ...p,
      totalQty,
      byWarehouse: sm.byWarehouse,
      cost,
      sellingPrice,
      clearancePrice,
      suggestedDiscountPct,
      frozenLiquidity,
      daysToExpiry,
      expiryDate,
      daysSinceLastSale,
      lastSoldDate: saleInfo.lastSoldDate,
      lastInvoiceNumber: saleInfo.lastInvoiceNumber,
      lastInvoiceCustomer: saleInfo.lastInvoiceCustomer,
      lastInvoiceQty: saleInfo.lastInvoiceQty,
      soldQtyLast60: saleInfo.soldQtyLast60,
      lastPurchaseDate,
      daysSincePurchase,
      arrivalDate,
      daysSinceArrival,
      stagnationDays,
      stagnationSource,
      isNeverSold,
      supplierName: purInfo.supplierName || p.supplierName || p.supplier || "",
      riskType,
      riskLabel,
      riskClass,
    };
  });
}

function renderKPIs() {
  const isWh = !!selectedWarehouseFilter;

  // Calculate stats strictly according to selected warehouse if chosen
  const itemsWithWh = analyzedItems.map(x => {
    const qty = isWh ? (x.byWarehouse?.[selectedWarehouseFilter] || 0) : x.totalQty;
    const frozen = qty > 0 ? (qty * x.cost) : 0;
    return { ...x, currentQty: qty, currentFrozen: frozen };
  }).filter(x => x.currentQty > 0);

  const deadItems = itemsWithWh.filter(x => x.riskType === "dead");
  const deadCount = deadItems.length;
  const deadQty = deadItems.reduce((sum, x) => sum + x.currentQty, 0);
  const deadVal = deadItems.reduce((sum, x) => sum + x.currentFrozen, 0);

  const slowItems = itemsWithWh.filter(x => x.riskType === "slow");
  const slowCount = slowItems.length;
  const slowQty = slowItems.reduce((sum, x) => sum + x.currentQty, 0);
  const slowVal = slowItems.reduce((sum, x) => sum + x.currentFrozen, 0);
  const totalStagnantVal = deadVal + slowVal;
  const totalStagnantCount = deadCount + slowCount;

  const nearExpiryItems = itemsWithWh.filter(x => x.riskType === "near_expiry" || x.riskType === "urgent_expiry" || x.riskType === "expired");
  const nearExpiryCount = nearExpiryItems.length;
  const nearExpiryVal = nearExpiryItems.reduce((sum, x) => sum + x.currentFrozen, 0);
  const urgentCount = itemsWithWh.filter(x => x.riskType === "urgent_expiry").length;
  const expiredCount = itemsWithWh.filter(x => x.riskType === "expired").length;

  const newStockItems = itemsWithWh.filter(x => x.riskType === "new_stock");
  const newStockVal = newStockItems.reduce((sum, x) => sum + x.currentFrozen, 0);

  const wasteRecords = isWh 
    ? allWasteRecords.filter(w => w.warehouseId === selectedWarehouseFilter)
    : allWasteRecords;
  const totalWasteLoss = wasteRecords.reduce((sum, w) => sum + Number(w.totalLoss || 0), 0);
  const totalWasteCount = wasteRecords.length;

  const el = id => document.getElementById(id);

  // Card 1: Dead Stock (+60 days or never sold)
  const neverSoldItems = itemsWithWh.filter(x => x.isNeverSold);
  const neverSoldCount = neverSoldItems.length;

  if (el("stat-dead-stock-count")) el("stat-dead-stock-count").textContent = `${deadCount} صنف`;
  if (el("stat-dead-stock-qty")) el("stat-dead-stock-qty").textContent = `منها ${neverSoldCount} صنف لم يُبَع قط (${formatQuantity(deadQty)} وحدة)`;

  // Card 2: Frozen Liquidity (Dynamically reacts to active filter & warehouse)
  let displayedVal = totalStagnantVal;
  let displayedTitle = "💰 سيولة مجمدة في الرواكد";
  let displayedSub = isWh 
    ? `بالمستودع المحدد (${formatCurrency(deadVal)} راكد + ${formatCurrency(slowVal)} بطيء)`
    : `${formatCurrency(deadVal)} راكد ميت (+60 يوم) • ${formatCurrency(slowVal)} بطيء`;

  if (activeFilter === "dead") {
    displayedVal = deadVal;
    displayedTitle = "🛑 سيولة الرواكد الميتة وغير المباعة";
    displayedSub = isWh
      ? `${deadCount} صنف راكد بالمستودع المحدد (${formatQuantity(deadQty)} وحدة)`
      : `${deadCount} صنف راكد (منها ${neverSoldCount} صنف لم يُبَع قط)`;
  } else if (activeFilter === "never_sold") {
    const neverSoldVal = neverSoldItems.reduce((sum, x) => sum + x.currentFrozen, 0);
    const neverSoldQty = neverSoldItems.reduce((sum, x) => sum + x.currentQty, 0);
    displayedVal = neverSoldVal;
    displayedTitle = "🚫 سيولة أصناف لم تُبَع قط نهائياً";
    displayedSub = `${neverSoldCount} صنف بالمخزون لم يسبق بيعه مطلقاً (${formatQuantity(neverSoldQty)} وحدة)`;
  } else if (activeFilter === "slow") {
    displayedVal = slowVal;
    displayedTitle = "🐢 سيولة البضائع البطيئة (30-59 يوم)";
    displayedSub = isWh
      ? `${slowCount} صنف بطيء بالمستودع المحدد (${formatQuantity(slowQty)} وحدة)`
      : `${slowCount} صنف بدون حركة بيع بين 30 و 59 يوماً`;
  } else if (activeFilter === "stagnant") {
    displayedVal = totalStagnantVal;
    displayedTitle = "💰 إجمالي الرواكد (ميتة + بطيئة)";
    displayedSub = `${deadCount} راكد ميت (${formatCurrency(deadVal)}) • ${slowCount} بطيء (${formatCurrency(slowVal)})`;
  } else if (activeFilter === "expiring" || activeFilter === "urgent_expiry" || activeFilter === "near_expiry" || activeFilter === "expired") {
    displayedVal = nearExpiryVal;
    displayedTitle = "⏳ سيولة المخزون المهدد بالانتهاء";
    displayedSub = `${nearExpiryCount} صنف معرّض لخطر انتهاء الصلاحية (${formatCurrency(nearExpiryVal)})`;
  } else if (activeFilter === "new_stock") {
    displayedVal = newStockVal;
    displayedTitle = "🆕 سيولة بضائع الوصول الحديث";
    displayedSub = `${newStockItems.length} صنف وصل حديثاً للمستودع (<30 يوم)`;
  }

  if (el("stat-frozen-title")) el("stat-frozen-title").textContent = displayedTitle;
  if (el("stat-dead-stock-val")) el("stat-dead-stock-val").textContent = formatCurrency(displayedVal);
  if (el("stat-frozen-sub")) el("stat-frozen-sub").textContent = displayedSub;

  // Card 3: Expiry
  if (el("stat-near-expiry-count")) el("stat-near-expiry-count").textContent = `${nearExpiryCount} صنف`;
  if (el("stat-near-expiry-sub")) {
    el("stat-near-expiry-sub").textContent = expiredCount > 0 
      ? `منها (${expiredCount}) منتهي الصلاحية و (${urgentCount}) وشيك`
      : `< 90 يوم على الانتهاء (${urgentCount} وشيك)`;
  }

  // Card 4: Waste
  if (el("stat-total-waste-val")) el("stat-total-waste-val").textContent = formatCurrency(totalWasteLoss);
  if (el("stat-total-waste-count")) {
    el("stat-total-waste-count").textContent = isWh
      ? `${totalWasteCount} محضر في هذا المستودع`
      : `${totalWasteCount} محضر معتمد`;
  }
  if (el("waste-history-count-badge")) el("waste-history-count-badge").textContent = allWasteRecords.length;
}

function getFilteredRadarItems() {
  const isWh = !!selectedWarehouseFilter;

  return analyzedItems.filter(p => {
    const qty = isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty;
    if (qty <= 0) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchSku = (p.sku || "").toLowerCase().includes(q);
      const matchBarcode = (p.barcode || "").toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBarcode) return false;
    }

    if (activeFilter === "all") {
      return true;
    } else if (activeFilter === "never_sold") {
      return p.isNeverSold;
    } else if (activeFilter === "dead") {
      return p.riskType === "dead";
    } else if (activeFilter === "slow") {
      return p.riskType === "slow";
    } else if (activeFilter === "stagnant") {
      return p.riskType === "dead" || p.riskType === "slow" || p.isNeverSold;
    } else if (activeFilter === "expiring") {
      return p.riskType === "near_expiry" || p.riskType === "urgent_expiry" || p.riskType === "expired";
    } else if (activeFilter === "urgent_expiry") {
      return p.riskType === "urgent_expiry";
    } else if (activeFilter === "near_expiry") {
      return p.riskType === "near_expiry";
    } else if (activeFilter === "expired") {
      return p.riskType === "expired";
    } else if (activeFilter === "new_stock") {
      return p.riskType === "new_stock";
    }

    return p.riskType === activeFilter;
  });
}

function updateRadarSortIcons() {
  const icons = {
    asc: '<span style="color:#2563EB; font-weight:900; font-size:12px;">▲</span>',
    desc: '<span style="color:#2563EB; font-weight:900; font-size:12px;">▼</span>',
    none: '<span style="color:#94a3b8; font-size:11px; opacity:0.5;">⇅</span>'
  };

  document.querySelectorAll("#radar-thead .sort-icon").forEach(span => {
    const col = span.getAttribute("data-col");
    if (col === sortColumn) {
      span.innerHTML = icons[sortDirection];
    } else {
      span.innerHTML = icons.none;
    }
  });
}

function renderRadarTable() {
  const tbody = document.getElementById("waste-tbody");
  if (!tbody) return;

  let filtered = getFilteredRadarItems();
  const isWh = !!selectedWarehouseFilter;
  const whName = isWh ? (allWarehouses.find(w => w.id === selectedWarehouseFilter)?.name || "المستودع المحدد") : "";

  const priority = { expired: 1, urgent_expiry: 2, near_expiry: 3, dead: 4, slow: 5, new_stock: 6, normal: 7 };
  filtered.sort((a, b) => {
    let diff = 0;
    const qtyA = isWh ? (a.byWarehouse?.[selectedWarehouseFilter] || 0) : a.totalQty;
    const qtyB = isWh ? (b.byWarehouse?.[selectedWarehouseFilter] || 0) : b.totalQty;

    switch (sortColumn) {
      case "name":
        diff = (a.name || "").localeCompare(b.name || "", "ar");
        break;
      case "sku":
        diff = (a.sku || "").localeCompare(b.sku || "", undefined, { numeric: true });
        break;
      case "purchaseDate": {
        const tA = a.lastPurchaseDate ? a.lastPurchaseDate.getTime() : (a.arrivalDate ? a.arrivalDate.getTime() : 0);
        const tB = b.lastPurchaseDate ? b.lastPurchaseDate.getTime() : (b.arrivalDate ? b.arrivalDate.getTime() : 0);
        diff = tA - tB;
        break;
      }
      case "qty":
        diff = qtyA - qtyB;
        break;
      case "saleDate": {
        const tA = a.lastSoldDate ? a.lastSoldDate.getTime() : 0;
        const tB = b.lastSoldDate ? b.lastSoldDate.getTime() : 0;
        diff = tA - tB;
        break;
      }
      case "expiry": {
        const eA = a.daysToExpiry !== null ? a.daysToExpiry : 999999;
        const eB = b.daysToExpiry !== null ? b.daysToExpiry : 999999;
        diff = eA - eB;
        break;
      }
      case "cost":
        diff = a.cost - b.cost;
        break;
      case "sellingPrice":
        diff = a.sellingPrice - b.sellingPrice;
        break;
      case "clearancePrice":
        diff = a.clearancePrice - b.clearancePrice;
        break;
      case "risk": {
        const pa = priority[a.riskType] || 99;
        const pb = priority[b.riskType] || 99;
        diff = pa - pb;
        break;
      }
      case "priority":
      default: {
        const pa = priority[a.riskType] || 99;
        const pb = priority[b.riskType] || 99;
        if (pa !== pb) return pa - pb;
        const frozenA = qtyA * a.cost;
        const frozenB = qtyB * b.cost;
        return frozenB - frozenA;
      }
    }

    if (diff !== 0) {
      return sortDirection === "asc" ? diff : -diff;
    }
    return (a.name || "").localeCompare(b.name || "", "ar");
  });

  updateRadarSortIcons();

  const countEl = document.getElementById("radar-matched-count");
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding:40px; color:var(--text-2,#64748b);">
          🎉 ممتاز! لا توجد أصناف تطابق معايير الرواكد أو المخاطر المحددة حالياً.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const itemQty = isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty;

    const saleText = p.lastSoldDate 
      ? `<div style="font-weight:700; color:var(--text-0,#0f172a);">${formatDate(p.lastSoldDate)}</div>
         <div style="font-size:10px; color:#64748b;">(منذ ${p.daysSinceLastSale} يوم)</div>
         ${p.lastInvoiceNumber ? `<div style="font-size:9.5px; color:#2563EB; font-family:monospace; margin-top:2px;" title="فاتورة مبيعات رقم ${p.lastInvoiceNumber}">🧾 ${p.lastInvoiceNumber}</div>` : ''}
         ${p.lastInvoiceCustomer ? `<div style="font-size:11px; color:#0f766e; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="العميل المباع له: ${p.lastInvoiceCustomer}">👤 ${p.lastInvoiceCustomer}</div>` : ''}`
      : `<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; font-weight:800; padding:2px 8px; border-radius:6px; font-size:11px; display:inline-block;">🚫 لم يُبَع قط</span>
         <div style="font-size:10px; color:#64748b; margin-top:3px;">(في المخزن: ${p.daysSinceArrival !== null ? p.daysSinceArrival + ' يوم' : (p.stagnationDays ? p.stagnationDays + ' يوم' : 'رصيد افتتاحي')})</div>`;

    const purText = p.lastPurchaseDate 
      ? `<div style="font-weight:700; color:var(--text-0,#0f172a);">${formatDate(p.lastPurchaseDate)}</div>
         <div style="font-size:10px; color:#64748b;">(منذ ${p.daysSincePurchase} يوم)</div>
         ${p.supplierName ? `<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${p.supplierName}">🏢 ${p.supplierName}</div>` : ''}`
      : (p.daysSinceArrival !== null 
          ? `<div style="font-weight:600; color:#64748b;">مضاف للنظام</div>
             <div style="font-size:10px; color:#94a3b8;">(منذ ${p.daysSinceArrival} يوم)</div>
             ${p.supplierName ? `<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${p.supplierName}">🏢 ${p.supplierName}</div>` : ''}`
          : `<div style="font-weight:600; color:#64748b;">رصيد افتتاحي</div>
             <div style="font-size:10px; color:#94a3b8;">(بضاعة أول المدة)</div>
             ${p.supplierName ? `<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${p.supplierName}">🏢 ${p.supplierName}</div>` : ''}`);

    const expText = p.daysToExpiry !== null
      ? (p.daysToExpiry <= 0 
          ? '<span style="color:#DC2626; font-weight:900;">منتهي!</span>'
          : `متبقي ${p.daysToExpiry} يوم`)
      : '—';

    const safeName = (p.name || "").replace(/'/g, "\\'");

    return `
      <tr style="border-bottom:1px solid var(--border-soft,#e2e8f0); transition:background 0.15s;">
        <td style="padding:10px 14px;">
          <div style="font-weight:800; color:var(--text-0,#0f172a); font-size:13px;">${p.name}</div>
          ${p.barcode ? `<div style="font-size:10.5px; color:var(--text-muted,#94a3b8);">${p.barcode}</div>` : ""}
        </td>
        <td style="text-align:center;" class="mono dim">${p.sku || '—'}</td>
        <td style="text-align:center;">${purText}</td>
        <td style="text-align:center;" class="mono font-bold">
          <span style="font-size:13px; color:${itemQty>0?'var(--text-0,#0f172a)':'#94a3b8'};">
            ${formatQuantity(itemQty)} ${p.unit || 'حبة'}
          </span>
          ${isWh ? `<div style="font-size:9.5px; color:#2563eb;">(${whName})</div>` : ''}
        </td>
        <td style="text-align:center; font-size:11.5px;">${saleText}</td>
        <td style="text-align:center; font-size:11.5px;">${expText}</td>
        <td class="mono text-warn">${formatCurrency(p.cost)}</td>
        <td class="mono">${formatCurrency(p.sellingPrice)}</td>
        <td class="mono font-bold text-good" style="font-size:13px;">
          ${p.riskType === "expired" 
            ? '<span style="color:#DC2626;">إتلاف (0 ر.س)</span>' 
            : `${formatCurrency(p.clearancePrice)} ${p.suggestedDiscountPct > 0 ? `<small style="color:#059669;">(-${p.suggestedDiscountPct}%)</small>` : ''}`}
        </td>
        <td style="text-align:center;">
          <span class="badge ${p.riskClass}" style="font-size:10.5px; padding:3px 8px; border-radius:99px; ${p.isNeverSold && p.riskType === 'dead' ? 'background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;font-weight:800;' : ''}">
            ${p.riskLabel}
          </span>
        </td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            ${p.riskType !== "expired" ? `
              <button class="btn btn-secondary btn-sm" onclick="window.openDiscountModal('${p.id}','${safeName}',${p.sellingPrice},${p.cost},${p.clearancePrice})" title="تطبيق سعر بيع ترويجي" style="font-size:11px; padding:3px 8px;">
                🏷️ خصم
              </button>
            ` : ""}
            <button class="btn btn-danger btn-sm" onclick="window.openWasteModalForProduct('${p.id}', ${itemQty})" title="تسجيل محضر إتلاف" style="font-size:11px; padding:3px 8px; background:#EF4444; color:#fff; border:none; border-radius:6px;">
              🗑️ إتلاف
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderWasteHistoryTable() {
  const tbody = document.getElementById("waste-history-tbody");
  if (!tbody) return;

  if (allWasteRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:35px; color:var(--text-2,#64748b);">
          لا توجد محاضر إتلاف مسجلة حتى الآن.
        </td>
      </tr>
    `;
    return;
  }

  const sorted = [...allWasteRecords].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  tbody.innerHTML = sorted.map((w, idx) => `
    <tr style="border-bottom:1px solid var(--border-soft,#e2e8f0);">
      <td style="padding:10px 14px;" class="mono font-bold">${w.code || `WST-${String(idx+1).padStart(4,'0')}`}</td>
      <td style="text-align:center;">${formatDate(w.date)}</td>
      <td style="font-weight:700;">${w.productName || '—'}</td>
      <td style="text-align:center;">${w.warehouseName || 'المستودع الرئيسي'}</td>
      <td style="text-align:center;" class="mono font-bold text-bad">${formatQuantity(w.qty)}</td>
      <td class="mono">${formatCurrency(w.unitCost)}</td>
      <td class="mono font-bold text-bad">${formatCurrency(w.totalLoss)}</td>
      <td style="font-size:11.5px; max-width:200px;">${w.reason || '—'}</td>
      <td style="text-align:center;">
        <button class="btn btn-secondary btn-sm" onclick="window.printWasteVoucher('${w.id}')" title="طباعة محضر الإتلاف الرسمي" style="font-size:11px; padding:3px 8px;">
          🖨️ طباعة
        </button>
      </td>
    </tr>
  `).join("");
}

function attachGlobalHandlers() {

  window.setRadarSort = function(col) {
    if (sortColumn === col) {
      sortDirection = (sortDirection === "asc" ? "desc" : "asc");
    } else {
      sortColumn = col;
      if (["qty", "cost", "sellingPrice", "clearancePrice", "purchaseDate", "saleDate", "expiry"].includes(col)) {
        sortDirection = "desc";
      } else {
        sortDirection = "asc";
      }
    }
    renderRadarTable();
  };

  window.updateCardHighlights = function() {
    const cards = {
      dead: document.getElementById("card-filter-dead"),
      stagnant: document.getElementById("card-filter-stagnant"),
      expiring: document.getElementById("card-filter-expiring")
    };
    
    Object.entries(cards).forEach(([type, el]) => {
      if (!el) return;
      const badge = el.querySelector(".card-filter-badge");
      if (activeFilter === type) {
        el.style.outline = "2.5px solid #4F46E5";
        el.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0,0,0,0.1)";
        el.style.transform = "translateY(-2px)";
        if (badge) badge.style.display = "inline-block";
      } else {
        el.style.outline = "";
        el.style.boxShadow = "";
        el.style.transform = "";
        if (badge) badge.style.display = "none";
      }
    });
  };

  window.filterByCard = function(type) {
    if (activeTab !== "radar") {
      window.switchClearanceTab("radar");
    }
    // Toggle: if clicking the already active filter, revert to 'all'
    if (activeFilter === type) {
      activeFilter = "all";
    } else {
      activeFilter = type;
    }
    const riskSel = document.getElementById("radar-risk-filter");
    if (riskSel) riskSel.value = activeFilter;
    window.updateCardHighlights();
    renderKPIs();
    renderRadarTable();
  };

  window.switchClearanceTab = function(tabName) {
    activeTab = tabName;
    const btnRadar = document.getElementById("tab-btn-radar");
    const btnHistory = document.getElementById("tab-btn-history");
    const contentRadar = document.getElementById("tab-content-radar");
    const contentHistory = document.getElementById("tab-content-history");

    if (tabName === "radar") {
      btnRadar?.classList.add("active");
      btnHistory?.classList.remove("active");
      if (contentRadar) contentRadar.style.display = "block";
      if (contentHistory) contentHistory.style.display = "none";
    } else {
      btnHistory?.classList.add("active");
      btnRadar?.classList.remove("active");
      if (contentRadar) contentRadar.style.display = "none";
      if (contentHistory) contentHistory.style.display = "block";
      renderWasteHistoryTable();
    }
  };

  window.onRadarFilterChange = function() {
    searchQuery = document.getElementById("radar-search")?.value.trim() || "";
    selectedWarehouseFilter = document.getElementById("radar-wh-filter")?.value || "";
    activeFilter = document.getElementById("radar-risk-filter")?.value || "all";
    window.updateCardHighlights();
    renderKPIs();
    renderRadarTable();
  };

  window.openWasteModal = function() {
    document.getElementById("waste-date").value = todayString();
    document.getElementById("waste-qty").value = "";
    document.getElementById("waste-total-loss").value = "0.00 ر.س";
    document.getElementById("waste-reason").value = "";
    document.getElementById("waste-prod-avail-hint").textContent = "";

    populateWarehouseFilters();

    const pSel = document.getElementById("waste-product-select");
    if (pSel) {
      pSel.innerHTML = '<option value="">اختر الصنف التالف…</option>' +
        allProducts.map(p => {
          const cost = p.avgCostPrice || p.costPrice || 0;
          return `<option value="${p.id}" data-cost="${cost}">${p.name} (تكلفة: ${cost} ر.س)</option>`;
        }).join("");
    }

    document.getElementById("waste-modal").style.display = "flex";
  };

  window.openWasteModalForProduct = function(prodId, defaultQty) {
    window.openWasteModal();
    const pSel = document.getElementById("waste-product-select");
    if (pSel) {
      pSel.value = prodId;
      window.selectWasteProduct(prodId);
    }
    if (defaultQty > 0) {
      const qInput = document.getElementById("waste-qty");
      if (qInput) {
        qInput.value = defaultQty;
        window.calcWasteVal();
      }
    }
  };

  window.closeWasteModal = function() {
    document.getElementById("waste-modal").style.display = "none";
  };

  window.onWasteWhChange = function() {
    const pid = document.getElementById("waste-product-select")?.value;
    if (pid) window.selectWasteProduct(pid);
  };

  window.selectWasteProduct = function(productId) {
    const wSel = document.getElementById("waste-warehouse");
    const whId = wSel?.value;
    const p = analyzedItems.find(x => x.id === productId);
    const hintEl = document.getElementById("waste-prod-avail-hint");

    if (p && hintEl) {
      const whQty = (whId && p.byWarehouse?.[whId]) ? p.byWarehouse[whId] : (p.totalQty || 0);
      hintEl.textContent = `الرصيد المتاح في هذا المستودع: ${whQty} ${p.unit || 'حبة'}`;
    }
    window.calcWasteVal();
  };

  window.calcWasteVal = function() {
    const pSel = document.getElementById("waste-product-select");
    const cost = parseFloat(pSel?.options[pSel.selectedIndex]?.dataset.cost) || 0;
    const qty = parseFloat(document.getElementById("waste-qty")?.value) || 0;
    const total = cost * qty;
    const lossEl = document.getElementById("waste-total-loss");
    if (lossEl) lossEl.value = formatCurrency(total);
  };

  window.onWasteReasonPreset = function(val) {
    const rEl = document.getElementById("waste-reason");
    if (rEl && val !== "أخرى") {
      rEl.value = val;
    }
  };

  window.saveWasteRecord = async function() {
    const btn = document.getElementById("btn-save-waste");
    const wSel = document.getElementById("waste-warehouse");
    const pSel = document.getElementById("waste-product-select");
    const warehouseId = wSel?.value;
    const warehouseName = wSel?.options[wSel.selectedIndex]?.text || "المستودع الرئيسي";
    const productId = pSel?.value;
    const qty = parseFloat(document.getElementById("waste-qty")?.value) || 0;
    const cost = parseFloat(pSel?.options[pSel.selectedIndex]?.dataset.cost) || 0;
    const reason = document.getElementById("waste-reason")?.value.trim() || document.getElementById("waste-reason-preset")?.value || "تلف بضاعة";
    const date = document.getElementById("waste-date")?.value || todayString();

    if (!productId || qty <= 0) {
      showToast("يرجى اختيار الصنف وتحديد كمية تالفة صحيحة أكبر من صفر", "warning");
      return;
    }

    const prod = allProducts.find(x => x.id === productId);
    const prodName = prod?.name || "صنف";
    const totalLoss = Math.round(cost * qty * 100) / 100;

    const confirmed = await showConfirm(
      `هل أنت متأكد من اعتماد محضر إتلاف ${qty} ${prod?.unit || 'وحدة'} من [${prodName}] بقيمة خسارة إجمالية ${formatCurrency(totalLoss)}؟\nسيتم خصم المخزون وإنشاء قيد خسائر التلف فوراً.`,
      "تأكيد اعتماد محضر الإتلاف"
    );
    if (!confirmed) return;

    try {
      if (btn) { btn.disabled = true; btn.textContent = "⏳ جارٍ الاعتماد والخصم..."; }

      await adjustStock(warehouseId, productId, -qty, {
        type: "inventory_waste",
        notes: `إتلاف بضاعة: ${reason} (محضر إتلاف)`
      });

      const wasteCode = `WST-${Date.now().toString().slice(-6)}`;

      let jeId = null;
      try {
        const jvRes = await createJournalEntry({
          date: date,
          refCode: wasteCode,
          refType: "inventory_waste",
          narration: `إثبات خسائر إتلاف بضاعة مخزنية: ${prodName} — سبب: ${reason}`,
          status: "posted",
          lines: [
            {
              accountCode: "5-1-8",
              accountName: "خسائر تالف وهالك مخزون",
              debit: totalLoss,
              credit: 0,
              notes: `إتلاف ${qty} من ${prodName}`
            },
            {
              accountCode: "1-1-4-1-01",
              accountName: `مخزون — ${warehouseName}`,
              debit: 0,
              credit: totalLoss,
              notes: `خصم بضاعة تالفة (${wasteCode})`
            }
          ]
        });
        jeId = jvRes?.id || null;
      } catch (jeErr) {
        console.warn("Could not create JE for waste:", jeErr.message);
      }

      await create(COLS.inventoryWaste(), {
        code: wasteCode,
        date: date,
        warehouseId: warehouseId,
        warehouseName: warehouseName,
        productId: productId,
        productName: prodName,
        sku: prod?.sku || "",
        qty: qty,
        unit: prod?.unit || "حبة",
        unitCost: cost,
        totalLoss: totalLoss,
        reason: reason,
        journalEntryId: jeId,
        createdAt: new Date().toISOString()
      });

      window.closeWasteModal();
      showToast("✅ تم اعتماد محضر الإتلاف وخصم المخزون وتسجيل القيد بنجاح", "success");

      await loadRadarData();

    } catch (e) {
      console.error("saveWasteRecord error:", e);
      showToast(`فشل تسجيل محضر الإتلاف: ${e.message}`, "error");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "💾 اعتماد الإتلاف وخصم المخزون"; }
    }
  };

  let _currentEditProd = null;
  window.openDiscountModal = function(prodId, prodName, currentPrice, costPrice, clearancePrice) {
    _currentEditProd = { id: prodId, name: prodName, costPrice, currentPrice };
    document.getElementById("discount-modal-prod-name").textContent = `الصنف: ${prodName} (السعر الحالي: ${formatCurrency(currentPrice)})`;
    document.getElementById("discount-modal-price").value = clearancePrice || currentPrice;
    document.getElementById("discount-modal-cost-hint").textContent = `💡 تكلفة الشراء WACC: ${formatCurrency(costPrice)}`;
    document.getElementById("discount-modal").style.display = "flex";
  };

  window.closeDiscountModal = function() {
    document.getElementById("discount-modal").style.display = "none";
    _currentEditProd = null;
  };

  window.confirmClearanceDiscount = async function() {
    if (!_currentEditProd) return;
    const newPrice = parseFloat(document.getElementById("discount-modal-price")?.value) || 0;
    if (newPrice <= 0) {
      showToast("يرجى إدخال سعر بيع صحيح أكبر من صفر", "warning");
      return;
    }

    try {
      await update(COLS.products(), _currentEditProd.id, {
        sellingPrice: newPrice,
        updatedAt: new Date().toISOString()
      });

      window.closeDiscountModal();
      showToast(`✅ تم تحديث سعر بيع [${_currentEditProd.name}] إلى ${formatCurrency(newPrice)} بنجاح`, "success");
      await loadRadarData();
    } catch (e) {
      console.error(e);
      showToast(`فشل تحديث السعر: ${e.message}`, "error");
    }
  };

  window.exportWasteClearanceCSV = function() {
    let items = getFilteredRadarItems();
    if (!items.length) { showToast("لا توجد بيانات للتصدير", "warning"); return; }
    const isWh = !!selectedWarehouseFilter;
    const BOM = "\uFEFF";
    const header = [
      "اسم الصنف",
      "الكود (SKU)",
      "تاريخ الشراء",
      "أيام منذ الشراء",
      "المورد",
      "الرصيد المتوفر",
      "الوحدة",
      "تاريخ آخر بيع",
      "أيام منذ آخر بيع",
      "رقم آخر فاتورة بيع",
      "العميل المباع له",
      "مدة الركود الفعلي (أيام)",
      "التكلفة WACC",
      "سعر البيع الحالي",
      "سعر التصريف المقترح",
      "تصنيف الخطر",
      "قيمة السيولة المجمدة"
    ].join(",");

    const rows = items.map(p => {
      const itemQty = isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty;
      const frozen = itemQty * p.cost;
      return [
        `"${(p.name||'').replace(/"/g,'""')}"`,
        `"${p.sku||''}"`,
        p.lastPurchaseDate ? formatDate(p.lastPurchaseDate) : '—',
        p.daysSincePurchase !== null ? p.daysSincePurchase : (p.daysSinceArrival !== null ? p.daysSinceArrival : '—'),
        `"${(p.supplierName||'').replace(/"/g,'""')}"`,
        itemQty,
        `"${p.unit||'حبة'}"`,
        p.lastSoldDate ? formatDate(p.lastSoldDate) : 'لم يُبَع قط',
        p.daysSinceLastSale !== null ? p.daysSinceLastSale : '—',
        `"${p.lastInvoiceNumber || '—'}"`,
        `"${(p.lastInvoiceCustomer || '—').replace(/"/g,'""')}"`,
        p.stagnationDays !== null ? p.stagnationDays : '—',
        p.cost,
        p.sellingPrice,
        p.clearancePrice,
        `"${p.riskLabel}"`,
        frozen.toFixed(2)
      ].join(",");
    });

    const csv = BOM + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `رادار-الرواكد-والتوالف-${todayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────
  // 📑 طباعة وتصدير تقرير PDF مخصص للمناديب بدون سعر التكلفة
  // يظهر فقط: الصنف، الكود، تاريخ الشراء، الكمية، آخر بيع، الصلاحية، سعر البيع، تصنيف الخطر
  // ─────────────────────────────────────────────────────────────
  window.printRadarPDF = async function() {
    let items = getFilteredRadarItems();
    if (!items.length) {
      showToast("لا توجد أصناف مطابقة للطباعة", "warning");
      return;
    }
    const isWh = !!selectedWarehouseFilter;

    // Sort items by priority
    const priority = { expired: 1, urgent_expiry: 2, near_expiry: 3, dead: 4, slow: 5, new_stock: 6, normal: 7 };
    items.sort((a, b) => {
      const pa = priority[a.riskType] || 99;
      const pb = priority[b.riskType] || 99;
      if (pa !== pb) return pa - pb;
      const valA = (isWh ? (a.byWarehouse?.[selectedWarehouseFilter] || 0) : a.totalQty) * a.sellingPrice;
      const valB = (isWh ? (b.byWarehouse?.[selectedWarehouseFilter] || 0) : b.totalQty) * b.sellingPrice;
      return valB - valA;
    });

    let company = {};
    try {
      const compSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
      if (compSnap.exists()) company = compSnap.data();
      const logoSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"));
      if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
    } catch (_) {}

    // Totals calculated at selling price (NO COST EXPOSED)
    const totalItems = items.length;
    const totalQty = items.reduce((sum, p) => sum + (isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty), 0);
    const totalSalesVal = items.reduce((sum, p) => sum + ((isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty) * p.sellingPrice), 0);
    const deadCount = items.filter(x => x.riskType === "dead").length;
    const nearExpCount = items.filter(x => x.riskType === "near_expiry" || x.riskType === "urgent_expiry" || x.riskType === "expired").length;

    const whFilterName = selectedWarehouseFilter 
      ? (allWarehouses.find(w => w.id === selectedWarehouseFilter)?.name || "مستودع محدد")
      : "كافة المستودعات";

    const rowsHtml = items.map((p, idx) => {
      const itemQty = isWh ? (p.byWarehouse?.[selectedWarehouseFilter] || 0) : p.totalQty;
      const purStr = p.lastPurchaseDate 
        ? `${formatDate(p.lastPurchaseDate)} <br><small style="color:#64748b;">(منذ ${p.daysSincePurchase} يوم)</small>${p.supplierName ? `<br><small style="color:#1e293b; font-weight:700;">🏢 ${p.supplierName}</small>` : ''}`
        : (p.daysSinceArrival !== null 
            ? `مضاف للنظام <br><small style="color:#64748b;">(منذ ${p.daysSinceArrival} يوم)</small>${p.supplierName ? `<br><small style="color:#1e293b; font-weight:700;">🏢 ${p.supplierName}</small>` : ''}` 
            : `رصيد افتتاحي <br><small style="color:#64748b;">(بضاعة أول المدة)</small>${p.supplierName ? `<br><small style="color:#1e293b; font-weight:700;">🏢 ${p.supplierName}</small>` : ''}`);

      const saleStr = p.lastSoldDate
        ? `${formatDate(p.lastSoldDate)} <br><small style="color:#64748b;">(منذ ${p.daysSinceLastSale} يوم)${p.lastInvoiceNumber ? ' • ' + p.lastInvoiceNumber : ''}</small>${p.lastInvoiceCustomer ? `<br><small style="color:#0f766e; font-weight:700;">👤 ${p.lastInvoiceCustomer}</small>` : ''}`
        : `<span style="color:#dc2626; font-weight:800;">🚫 لم يُبَع قط</span><br><small style="color:#64748b;">(في المخزن: ${p.daysSinceArrival !== null ? p.daysSinceArrival + ' يوم' : (p.stagnationDays ? p.stagnationDays + ' يوم' : 'رصيد افتتاحي')})</small>`;

      const expStr = p.daysToExpiry !== null
        ? (p.daysToExpiry <= 0 ? '<strong style="color:#dc2626;">منتهي!</strong>' : `متبقي ${p.daysToExpiry} يوم`)
        : '—';

      const lineTotal = itemQty * p.sellingPrice;

      return `
        <tr>
          <td style="text-align:center; color:#64748b; font-weight:700;">${idx + 1}</td>
          <td>
            <strong>${p.name}</strong>
            ${p.barcode ? `<div style="font-size:9.5px; color:#64748b;">${p.barcode}</div>` : ''}
          </td>
          <td style="text-align:center;" class="mono dim">${p.sku || '—'}</td>
          <td style="text-align:center;">${purStr}</td>
          <td style="text-align:center;" class="mono font-bold">${formatQuantity(itemQty)} ${p.unit || 'حبة'}</td>
          <td style="text-align:center; font-size:11px;">${saleStr}</td>
          <td style="text-align:center; font-size:11px;">${expStr}</td>
          <td style="text-align:left; font-weight:800; color:#1e3a8a;" class="mono">${formatCurrency(p.sellingPrice)}</td>
          <td style="text-align:left; font-weight:800; color:#059669;" class="mono">${formatCurrency(lineTotal)}</td>
          <td style="text-align:center;">
            <span class="print-badge ${p.riskClass}">${p.riskLabel}</span>
          </td>
        </tr>
      `;
    }).join("");

    const win = window.open("", "_blank", "width=1100,height=800");
    win.document.write(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بيان الأصناف والمخزون المطلوب تصريفه — ${todayString()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 landscape; margin: 7mm; }
    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 10px;
      font-size: 11.5px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .mono { font-family: monospace; }
    .dim { color: #64748b; }
    .header-band {
      background: linear-gradient(135deg, #040d1f 0%, #0a1d4a 55%, #0f2d6b 100%) !important;
      color: #fff;
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-right h2 { font-size: 17px; font-weight: 900; margin: 0 0 2px; }
    .header-right p { font-size: 11px; color: #93c5fd; margin: 0; }
    .header-center { text-align: center; }
    .header-center h1 { font-size: 19px; font-weight: 900; color: #facc15; margin: 0 0 2px; }
    .header-center div { font-size: 11px; color: #e2e8f0; }
    .logo-box {
      background: #fff;
      border-radius: 8px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 90px;
      height: 60px;
    }
    .logo-box img { max-height: 52px; max-width: 120px; object-fit: contain; }

    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .kpi-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
    }
    .kpi-title { font-size: 10.5px; color: #64748b; font-weight: 700; }
    .kpi-val { font-size: 16px; font-weight: 900; margin-top: 2px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    thead tr {
      background: linear-gradient(135deg, #040d1f 0%, #0f2d6b 100%) !important;
      color: #fff;
    }
    th {
      padding: 8px 6px;
      font-weight: 800;
      border: 1px solid #0f2d6b;
      font-size: 11px;
    }
    td {
      padding: 6px 6px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) { background: #f8fafc; }

    .grand-row {
      background: #f1f5f9 !important;
      font-weight: 900;
      font-size: 12px;
      border-top: 2px solid #0f2d6b;
    }

    .print-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
    }
    .badge-bad { background: #fee2e2; color: #991b1b; }
    .badge-warn { background: #fef3c7; color: #92400e; }
    .badge-good { background: #dcfce7; color: #166534; }

    .rep-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 11px;
      color: #1e3a8a;
      margin-bottom: 16px;
    }

    .signatures {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      page-break-inside: avoid;
    }
    .sig-line {
      border-top: 1px dashed #64748b;
      padding-top: 6px;
      font-weight: 700;
    }

    .footer-band {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header-band">
    <div class="header-right">
      <h2>${company.name || 'شركة إدهام للمواد الغذائية'}</h2>
      <p>س.ت: ${company.crNumber || '—'} • الرقم الضريبي: ${company.vatNumber || '—'}</p>
      <p>نطاق المستودع: ${whFilterName}</p>
    </div>

    <div class="header-center">
      <h1>📋 بيان الأصناف والمخزون المطلوب تصريفه وتسريع بيعه</h1>
      <div style="font-size:12px; font-weight:800; color:#facc15; margin-top:2px;">نسخة قسم المبيعات والتوزيع (بأسعار البيع المعتمدة)</div>
      <div style="font-size:10px; color:#e2e8f0; margin-top:2px;">تاريخ التقرير: ${formatDate(new Date())} • وقت الطباعة: ${new Date().toLocaleTimeString('ar-SA')}</div>
    </div>

    <div>
      <div class="logo-box">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="Logo" />` : '<strong style="color:#0a1d4a; font-size:16px;">إدهام ERP</strong>'}
      </div>
    </div>
  </div>

  <!-- KPI Strip (NO COST EXPOSED) -->
  <div class="kpi-strip">
    <div class="kpi-item" style="border-right: 4px solid #ef4444;">
      <div class="kpi-title">🛑 أصناف راكدة (+60 يوم)</div>
      <div class="kpi-val" style="color:#ef4444;">${deadCount} صنف</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #10b981;">
      <div class="kpi-title">🏷️ القيمة الإجمالية بسعر البيع</div>
      <div class="kpi-val" style="color:#059669;">${formatCurrency(totalSalesVal)}</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #dc2626;">
      <div class="kpi-title">⏳ بضائع قريبة / منتهية الصلاحية</div>
      <div class="kpi-val" style="color:#dc2626;">${nearExpCount} صنف</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #1e3a8a;">
      <div class="kpi-title">📦 إجمالي الكميات المتاحة للتصريف</div>
      <div class="kpi-val" style="color:#1e3a8a;">${formatQuantity(totalQty)} وحدة</div>
    </div>
  </div>

  <!-- Instructions banner for reps -->
  <div class="rep-banner">
    <strong>📌 تعليمات وتوجيهات إدارة المبيعات:</strong> يُرجى من المناديب ومشرفي المناطق إعطاء أولوية ترويجية وعروض لهذه الأصناف لدى منافذ البيع ومحلات التجزئة والجملة لتسريع تصريف البضاعة وتنشيط حركة المستودع.
  </div>

  <!-- Data Table (ONLY SELLING PRICE) -->
  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th style="text-align:right;">الصنف والبيانات</th>
        <th style="width:85px; text-align:center;">الكود (SKU)</th>
        <th style="width:125px; text-align:center;">📅 تاريخ الشراء والمورد</th>
        <th style="width:95px; text-align:center;">الكمية المتوفرة</th>
        <th style="width:125px; text-align:center;">آخر حركة بيع والعميل</th>
        <th style="width:105px; text-align:center;">الصلاحية</th>
        <th style="width:100px; text-align:left;">سعر البيع (ر.س)</th>
        <th style="width:110px; text-align:left;">إجمالي القيمة</th>
        <th style="width:115px; text-align:center;">توجيه المبيعات</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      <tr class="grand-row">
        <td colspan="4" style="text-align:right; font-weight:900; padding:8px;">الإجمالي الكلي (${totalItems} صنف)</td>
        <td style="text-align:center; font-weight:900;" class="mono">${formatQuantity(totalQty)}</td>
        <td colspan="3" style="text-align:left; font-weight:900; color:#64748b; font-size:11px;">إجمالي المبيعات المستهدفة:</td>
        <td style="text-align:left; font-weight:900; color:#059669;" class="mono">${formatCurrency(totalSalesVal)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Signatures Block -->
  <div class="signatures">
    <div class="sig-box">
      أمين ومسؤول المستودع
      <div style="height:35px;"></div>
      <div class="sig-line">التوقيع: .....................</div>
    </div>
    <div class="sig-box">
      مشرف المبيعات
      <div style="height:35px;"></div>
      <div class="sig-line">التوقيع: .....................</div>
    </div>
    <div class="sig-box">
      مندوب التوزيع المستلم
      <div style="height:35px;"></div>
      <div class="sig-line">التوقيع: .....................</div>
    </div>
    <div class="sig-box">
      اعتماد الإدارة
      <div style="height:35px;"></div>
      <div class="sig-line">التوقيع: .....................</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer-band">
    <div>نظام إدهام المتكامل لإدارة الموارد — IDHAM ERP v3.0</div>
    <div>بيان تشغيلي موجّه لتسريع المبيعات وتصريف الرواكد بالمستودعات</div>
    <div>صفحة 1 من 1</div>
  </div>

</body>
</html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 700);
  };

  // Print Official Waste Voucher A4
  window.printWasteVoucher = async function(wasteId) {
    const record = allWasteRecords.find(w => w.id === wasteId);
    if (!record) { showToast("لم يتم العثور على محضر الإتلاف", "error"); return; }

    let company = {};
    try {
      const compSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
      if (compSnap.exists()) company = compSnap.data();
      const logoSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"));
      if (logoSnap.exists() && logoSnap.data().dataUrl) company.logoUrl = logoSnap.data().dataUrl;
    } catch (_) {}

    const win = window.open("", "_blank", "width=850,height=750");
    win.document.write(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر إتلاف بضاعة — ${record.code || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#0f172a; background:#fff; padding:15px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #dc2626; padding-bottom:12px; margin-bottom:18px; }
    .logo { max-height:70px; max-width:140px; object-fit:contain; }
    .title-box { text-align:center; flex:1; }
    .title { font-size:22px; font-weight:900; color:#dc2626; margin:0; }
    .subtitle { font-size:12px; color:#64748b; margin-top:2px; }
    .meta-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; font-size:13px; }
    th { background:#f1f5f9; border:1px solid #cbd5e1; padding:8px 10px; text-align:right; font-weight:800; }
    td { border:1px solid #cbd5e1; padding:8px 10px; vertical-align:middle; }
    .signatures { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:50px; text-align:center; }
    .sig-box { border-top:1px dashed #64748b; padding-top:8px; font-size:13px; font-weight:700; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="font-size:16px; font-weight:900; margin:0;">${company.name || 'شركة إدهام للمواد الغذائية'}</h2>
      <div style="font-size:11px; color:#64748b;">س.ت: ${company.crNumber || '—'} • الرقم الضريبي: ${company.vatNumber || '—'}</div>
    </div>
    <div class="title-box">
      <h1 class="title">محضر إتلاف بضاعة رسمي</h1>
      <div class="subtitle">رقم المحضر: ${record.code || '—'}</div>
    </div>
    <div>
      ${company.logoUrl ? `<img src="${company.logoUrl}" class="logo" />` : ''}
    </div>
  </div>

  <div class="meta-box">
    <div><strong>التاريخ:</strong> ${formatDate(record.date)}</div>
    <div><strong>المستودع:</strong> ${record.warehouseName || 'المستودع الرئيسي'}</div>
    <div><strong>سبب الإتلاف:</strong> ${record.reason || '—'}</div>
    <div><strong>رقم القيد المحاسبي:</strong> ${record.journalEntryId ? 'قيد آلي معتمد' : 'مرحل'}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>الصنف والبيان</th>
        <th style="width:110px; text-align:center;">الكود (SKU)</th>
        <th style="width:100px; text-align:center;">الكمية التالفة</th>
        <th style="width:110px; text-align:left;">تكلفة الوحدة</th>
        <th style="width:120px; text-align:left;">إجمالي الخسارة</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${record.productName}</strong></td>
        <td style="text-align:center;">${record.sku || '—'}</td>
        <td style="text-align:center; font-weight:900; color:#dc2626;">${formatQuantity(record.qty)} ${record.unit || 'حبة'}</td>
        <td style="text-align:left;">${formatCurrency(record.unitCost)}</td>
        <td style="text-align:left; font-weight:900; color:#dc2626;">${formatCurrency(record.totalLoss)}</td>
      </tr>
    </tbody>
  </table>

  <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px; font-size:12px; color:#991b1b; margin-bottom:30px;">
    <strong>إقرار وتعهد اللجنة:</strong> تشهد اللجنة الموقعة أدناه بأنه قد تم فحص ومعاينة البضاعة المذكورة أعلاه، وثبت عدم صلاحيتها للاستهلاك الآدمي أو التجاري، وتم إتلافها بالكامل وإسقاطها دفترياً ومخزنياً وفقاً للنظام.
  </div>

  <div class="signatures">
    <div class="sig-box">
      أمين المستودع
      <div style="height:40px;"></div>
      الاسم والتوقيع: .....................
    </div>
    <div class="sig-box">
      مدير الحسابات / المالي
      <div style="height:40px;"></div>
      الاسم والتوقيع: .....................
    </div>
    <div class="sig-box">
      المدير العام / الاعتماد
      <div style="height:40px;"></div>
      الاسم والتوقيع: .....................
    </div>
  </div>

</body>
</html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 700);
  };

}
