import{t as M,f as b,D as N,x as rt,e as lt,o as dt,a as W,u as ct,b as B,d as Q,C as j,l as P,g as F}from"./index-CnctmNGr.js";import{s as pt}from"./helpers-BqJwgdUi.js";import{getDoc as q,doc as H}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let U=[],at=[],K=[],ot=[],st=[],A=[],Y=[],et="radar",y="all",J="",k="",V="priority",_="asc";async function $t(c,e){const o=c||document.getElementById("main-content");o&&(o.innerHTML=gt(),xt(),await X())}function gt(){return`
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
                <input type="date" id="waste-date" class="form-control mono font-bold" value="${M()}" style="width:100%; padding:7px 10px; border-radius:8px;" />
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
  `}async function X(){try{const[c,e,o,s,n,a]=await Promise.all([F(W.products()).catch(()=>[]),F(W.stockByWarehouse()).catch(()=>[]),F(W.warehouses()).catch(()=>[]),F(W.salesInvoices()).catch(()=>[]),F(W.inventoryWaste()).catch(()=>[]),F(W.purchaseInvoices()).catch(()=>[])]);U=c||[],at=e||[],K=o||[],ot=s||[],A=n||[],st=a||[],it(),ft(),Z(),O(),nt()}catch(c){console.error("loadRadarData error:",c),N("خطأ أثناء تحميل بيانات المخزون والرواكد","error")}}function it(){const c=document.getElementById("radar-wh-filter"),e=document.getElementById("waste-warehouse"),o=K.map(s=>`<option value="${s.id}">${s.name||s.code||s.id}</option>`).join("");c&&(c.innerHTML='<option value="">— كل المستودعات —</option>'+o),e&&(e.innerHTML=o)}function ft(){const c=new Date,e=1e3*60*60*24;new Date(c.getTime()-60*e);const o={};at.forEach(a=>{const t=a.productId;if(!t)return;o[t]||(o[t]={totalQty:0,byWarehouse:{}});const l=Number(a.qty||a.quantity||0);o[t].totalQty+=l,o[t].byWarehouse[a.warehouseId]=(o[t].byWarehouse[a.warehouseId]||0)+l});const s={};ot.forEach(a=>{if(a.status==="cancelled"||a.status==="draft")return;let t;if(a.date?.toDate?t=a.date.toDate():typeof a.date=="string"?t=new Date(a.date):a.createdAt?.toDate?t=a.createdAt.toDate():typeof a.createdAt=="string"?t=new Date(a.createdAt):t=new Date(a.date||0),isNaN(t.getTime()))return;const l=c.getTime()-t.getTime()<=60*e;(a.lines||a.items||[]).forEach(f=>{const r=f.productId||f.id;r&&(s[r]||(s[r]={lastSoldDate:null,lastInvoiceNumber:"",lastInvoiceCustomer:"",lastInvoiceQty:0,soldQtyLast60:0}),(!s[r].lastSoldDate||t>s[r].lastSoldDate)&&(s[r].lastSoldDate=t,s[r].lastInvoiceNumber=a.number||a.invoiceNumber||"",s[r].lastInvoiceCustomer=a.customerName||a.customer?.name||(typeof a.customer=="string"?a.customer:"")||"",s[r].lastInvoiceQty=Number(f.qty||0)),l&&(s[r].soldQtyLast60+=Number(f.qty||0)))})});const n={};st.forEach(a=>{if(a.status==="cancelled"||a.status==="draft")return;let t;if(a.date?.toDate)t=a.date.toDate();else if(typeof a.date=="string")t=new Date(a.date);else if(a.createdAt?.toDate)t=a.createdAt.toDate();else if(typeof a.createdAt=="string")t=new Date(a.createdAt);else return;if(isNaN(t.getTime()))return;(a.lines||a.items||[]).forEach(p=>{const f=p.productId||p.id;f&&(!n[f]||t>n[f].lastPurchaseDate)&&(n[f]={lastPurchaseDate:t,lastPurchaseInvoiceNumber:a.number||a.invoiceNumber||"",supplierName:a.supplierName||a.supplier?.name||(typeof a.supplier=="string"?a.supplier:"")||""})})}),Y=U.map(a=>{const t=o[a.id]||{totalQty:Number(a.totalQty||a.currentStock||0),byWarehouse:{}},l=t.totalQty,p=s[a.id]||{lastSoldDate:null,lastInvoiceNumber:"",lastInvoiceCustomer:"",lastInvoiceQty:0,soldQtyLast60:0},f=n[a.id]||{},r=Number(a.avgCostPrice||a.costPrice||0),u=Number(a.sellingPrice||a.price||0);let g=f.lastPurchaseDate||null,i=null;g&&(i=Math.floor((c.getTime()-g.getTime())/e));let x=g;if(!x&&a.createdAt){const h=a.createdAt?.toDate?a.createdAt.toDate():new Date(a.createdAt);isNaN(h.getTime())||(x=h)}let m=x?Math.floor((c.getTime()-x.getTime())/e):null;i===null&&m!==null&&g&&(i=m);let C=null,D=null;a.expiryDate&&(C=a.expiryDate?.toDate?a.expiryDate.toDate():new Date(a.expiryDate),isNaN(C.getTime())||(D=Math.ceil((C.getTime()-c.getTime())/e)));let E=null;p.lastSoldDate&&(E=Math.floor((c.getTime()-p.lastSoldDate.getTime())/e));let $=null,L="none";const v=!p.lastSoldDate;p.lastSoldDate?g&&g>p.lastSoldDate?($=i,L="purchase_after_sale"):($=E,L="sale"):($=m!==null?m:63,L=m!==null?"arrival":"opening_stock");let z="normal",I="طبيعي",S="badge-good",w=0;l>0&&(D!==null&&D<=0?(z="expired",I="🚨 منتهي الصلاحية",S="badge-bad",w=100):D!==null&&D<=60?(z="urgent_expiry",I="⏳ وشيك الانتهاء",S="badge-bad",w=35):D!==null&&D<=90?(z="near_expiry",I="⚠️ قريب الانتهاء",S="badge-warn",w=20):v?$>=30?(z="dead",I=`🛑 لم يُبَع قط (${$} يوم)`,S="badge-bad",w=15):(z="new_stock",I=`🆕 وصول حديث (${$} يوم)`,S="badge-good",w=0):E!==null&&E<30?(z="normal",I="✅ نشط ومتحرك",S="badge-good",w=0):$!==null&&$>=60?(z="dead",I="🛑 راكد ميت (+60 يوم)",S="badge-bad",w=15):$!==null&&$>=30&&$<60?(z="slow",I=`🐢 بطيء الحركة (${$} يوم)`,S="badge-warn",w=10):$!==null&&$<30?(z="new_stock",I=`🆕 وصول حديث (${$} يوم)`,S="badge-good",w=0):(z="normal",I="طبيعي",S="badge-good",w=0));let T=u;if(z==="expired")T=0;else if(w>0&&u>0){const h=u*(1-w/100);T=Math.max(r,h),T=Math.round(T*100)/100}const d=l>0?l*r:0;return{...a,totalQty:l,byWarehouse:t.byWarehouse,cost:r,sellingPrice:u,clearancePrice:T,suggestedDiscountPct:w,frozenLiquidity:d,daysToExpiry:D,expiryDate:C,daysSinceLastSale:E,lastSoldDate:p.lastSoldDate,lastInvoiceNumber:p.lastInvoiceNumber,lastInvoiceCustomer:p.lastInvoiceCustomer,lastInvoiceQty:p.lastInvoiceQty,soldQtyLast60:p.soldQtyLast60,lastPurchaseDate:g,daysSincePurchase:i,arrivalDate:x,daysSinceArrival:m,stagnationDays:$,stagnationSource:L,isNeverSold:v,supplierName:f.supplierName||a.supplierName||a.supplier||"",riskType:z,riskLabel:I,riskClass:S}})}function Z(){const c=!!k,e=Y.map(d=>{const h=c?d.byWarehouse?.[k]||0:d.totalQty,R=h>0?h*d.cost:0;return{...d,currentQty:h,currentFrozen:R}}).filter(d=>d.currentQty>0),o=e.filter(d=>d.riskType==="dead"),s=o.length,n=o.reduce((d,h)=>d+h.currentQty,0),a=o.reduce((d,h)=>d+h.currentFrozen,0),t=e.filter(d=>d.riskType==="slow"),l=t.length,p=t.reduce((d,h)=>d+h.currentQty,0),f=t.reduce((d,h)=>d+h.currentFrozen,0),r=a+f,u=e.filter(d=>d.riskType==="near_expiry"||d.riskType==="urgent_expiry"||d.riskType==="expired"),g=u.length,i=u.reduce((d,h)=>d+h.currentFrozen,0),x=e.filter(d=>d.riskType==="urgent_expiry").length,m=e.filter(d=>d.riskType==="expired").length,C=e.filter(d=>d.riskType==="new_stock"),D=C.reduce((d,h)=>d+h.currentFrozen,0),E=c?A.filter(d=>d.warehouseId===k):A,$=E.reduce((d,h)=>d+Number(h.totalLoss||0),0),L=E.length,v=d=>document.getElementById(d),z=e.filter(d=>d.isNeverSold),I=z.length;v("stat-dead-stock-count")&&(v("stat-dead-stock-count").textContent=`${s} صنف`),v("stat-dead-stock-qty")&&(v("stat-dead-stock-qty").textContent=`منها ${I} صنف لم يُبَع قط (${P(n)} وحدة)`);let S=r,w="💰 سيولة مجمدة في الرواكد",T=c?`بالمستودع المحدد (${b(a)} راكد + ${b(f)} بطيء)`:`${b(a)} راكد ميت (+60 يوم) • ${b(f)} بطيء`;if(y==="dead")S=a,w="🛑 سيولة الرواكد الميتة وغير المباعة",T=c?`${s} صنف راكد بالمستودع المحدد (${P(n)} وحدة)`:`${s} صنف راكد (منها ${I} صنف لم يُبَع قط)`;else if(y==="never_sold"){const d=z.reduce((R,G)=>R+G.currentFrozen,0),h=z.reduce((R,G)=>R+G.currentQty,0);S=d,w="🚫 سيولة أصناف لم تُبَع قط نهائياً",T=`${I} صنف بالمخزون لم يسبق بيعه مطلقاً (${P(h)} وحدة)`}else y==="slow"?(S=f,w="🐢 سيولة البضائع البطيئة (30-59 يوم)",T=c?`${l} صنف بطيء بالمستودع المحدد (${P(p)} وحدة)`:`${l} صنف بدون حركة بيع بين 30 و 59 يوماً`):y==="stagnant"?(S=r,w="💰 إجمالي الرواكد (ميتة + بطيئة)",T=`${s} راكد ميت (${b(a)}) • ${l} بطيء (${b(f)})`):y==="expiring"||y==="urgent_expiry"||y==="near_expiry"||y==="expired"?(S=i,w="⏳ سيولة المخزون المهدد بالانتهاء",T=`${g} صنف معرّض لخطر انتهاء الصلاحية (${b(i)})`):y==="new_stock"&&(S=D,w="🆕 سيولة بضائع الوصول الحديث",T=`${C.length} صنف وصل حديثاً للمستودع (<30 يوم)`);v("stat-frozen-title")&&(v("stat-frozen-title").textContent=w),v("stat-dead-stock-val")&&(v("stat-dead-stock-val").textContent=b(S)),v("stat-frozen-sub")&&(v("stat-frozen-sub").textContent=T),v("stat-near-expiry-count")&&(v("stat-near-expiry-count").textContent=`${g} صنف`),v("stat-near-expiry-sub")&&(v("stat-near-expiry-sub").textContent=m>0?`منها (${m}) منتهي الصلاحية و (${x}) وشيك`:`< 90 يوم على الانتهاء (${x} وشيك)`),v("stat-total-waste-val")&&(v("stat-total-waste-val").textContent=b($)),v("stat-total-waste-count")&&(v("stat-total-waste-count").textContent=c?`${L} محضر في هذا المستودع`:`${L} محضر معتمد`),v("waste-history-count-badge")&&(v("waste-history-count-badge").textContent=A.length)}function tt(){const c=!!k;return Y.filter(e=>{if((c?e.byWarehouse?.[k]||0:e.totalQty)<=0)return!1;if(J){const s=J.toLowerCase(),n=(e.name||"").toLowerCase().includes(s),a=(e.sku||"").toLowerCase().includes(s),t=(e.barcode||"").toLowerCase().includes(s);if(!n&&!a&&!t)return!1}return y==="all"?!0:y==="never_sold"?e.isNeverSold:y==="dead"?e.riskType==="dead":y==="slow"?e.riskType==="slow":y==="stagnant"?e.riskType==="dead"||e.riskType==="slow"||e.isNeverSold:y==="expiring"?e.riskType==="near_expiry"||e.riskType==="urgent_expiry"||e.riskType==="expired":y==="urgent_expiry"?e.riskType==="urgent_expiry":y==="near_expiry"?e.riskType==="near_expiry":y==="expired"?e.riskType==="expired":y==="new_stock"?e.riskType==="new_stock":e.riskType===y})}function ut(){const c={asc:'<span style="color:#2563EB; font-weight:900; font-size:12px;">▲</span>',desc:'<span style="color:#2563EB; font-weight:900; font-size:12px;">▼</span>',none:'<span style="color:#94a3b8; font-size:11px; opacity:0.5;">⇅</span>'};document.querySelectorAll("#radar-thead .sort-icon").forEach(e=>{e.getAttribute("data-col")===V?e.innerHTML=c[_]:e.innerHTML=c.none})}function O(){const c=document.getElementById("waste-tbody");if(!c)return;let e=tt();const o=!!k,s=o?K.find(t=>t.id===k)?.name||"المستودع المحدد":"",n={expired:1,urgent_expiry:2,near_expiry:3,dead:4,slow:5,new_stock:6,normal:7};e.sort((t,l)=>{let p=0;const f=o?t.byWarehouse?.[k]||0:t.totalQty,r=o?l.byWarehouse?.[k]||0:l.totalQty;switch(V){case"name":p=(t.name||"").localeCompare(l.name||"","ar");break;case"sku":p=(t.sku||"").localeCompare(l.sku||"",void 0,{numeric:!0});break;case"purchaseDate":{const u=t.lastPurchaseDate?t.lastPurchaseDate.getTime():t.arrivalDate?t.arrivalDate.getTime():0,g=l.lastPurchaseDate?l.lastPurchaseDate.getTime():l.arrivalDate?l.arrivalDate.getTime():0;p=u-g;break}case"qty":p=f-r;break;case"saleDate":{const u=t.lastSoldDate?t.lastSoldDate.getTime():0,g=l.lastSoldDate?l.lastSoldDate.getTime():0;p=u-g;break}case"expiry":{const u=t.daysToExpiry!==null?t.daysToExpiry:999999,g=l.daysToExpiry!==null?l.daysToExpiry:999999;p=u-g;break}case"cost":p=t.cost-l.cost;break;case"sellingPrice":p=t.sellingPrice-l.sellingPrice;break;case"clearancePrice":p=t.clearancePrice-l.clearancePrice;break;case"risk":{const u=n[t.riskType]||99,g=n[l.riskType]||99;p=u-g;break}case"priority":default:{const u=n[t.riskType]||99,g=n[l.riskType]||99;if(u!==g)return u-g;const i=f*t.cost;return r*l.cost-i}}return p!==0?_==="asc"?p:-p:(t.name||"").localeCompare(l.name||"","ar")}),ut();const a=document.getElementById("radar-matched-count");if(a&&(a.textContent=e.length),e.length===0){c.innerHTML=`
      <tr>
        <td colspan="11" style="text-align:center; padding:40px; color:var(--text-2,#64748b);">
          🎉 ممتاز! لا توجد أصناف تطابق معايير الرواكد أو المخاطر المحددة حالياً.
        </td>
      </tr>
    `;return}c.innerHTML=e.map(t=>{const l=o?t.byWarehouse?.[k]||0:t.totalQty,p=t.lastSoldDate?`<div style="font-weight:700; color:var(--text-0,#0f172a);">${B(t.lastSoldDate)}</div>
         <div style="font-size:10px; color:#64748b;">(منذ ${t.daysSinceLastSale} يوم)</div>
         ${t.lastInvoiceNumber?`<div style="font-size:9.5px; color:#2563EB; font-family:monospace; margin-top:2px;" title="فاتورة مبيعات رقم ${t.lastInvoiceNumber}">🧾 ${t.lastInvoiceNumber}</div>`:""}
         ${t.lastInvoiceCustomer?`<div style="font-size:11px; color:#0f766e; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="العميل المباع له: ${t.lastInvoiceCustomer}">👤 ${t.lastInvoiceCustomer}</div>`:""}`:`<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; font-weight:800; padding:2px 8px; border-radius:6px; font-size:11px; display:inline-block;">🚫 لم يُبَع قط</span>
         <div style="font-size:10px; color:#64748b; margin-top:3px;">(في المخزن: ${t.daysSinceArrival!==null?t.daysSinceArrival+" يوم":t.stagnationDays?t.stagnationDays+" يوم":"رصيد افتتاحي"})</div>`,f=t.lastPurchaseDate?`<div style="font-weight:700; color:var(--text-0,#0f172a);">${B(t.lastPurchaseDate)}</div>
         <div style="font-size:10px; color:#64748b;">(منذ ${t.daysSincePurchase} يوم)</div>
         ${t.supplierName?`<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${t.supplierName}">🏢 ${t.supplierName}</div>`:""}`:t.daysSinceArrival!==null?`<div style="font-weight:600; color:#64748b;">مضاف للنظام</div>
             <div style="font-size:10px; color:#94a3b8;">(منذ ${t.daysSinceArrival} يوم)</div>
             ${t.supplierName?`<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${t.supplierName}">🏢 ${t.supplierName}</div>`:""}`:`<div style="font-weight:600; color:#64748b;">رصيد افتتاحي</div>
             <div style="font-size:10px; color:#94a3b8;">(بضاعة أول المدة)</div>
             ${t.supplierName?`<div style="font-size:11px; color:#1e293b; font-weight:700; margin-top:3px; line-height:1.35; word-break:break-word;" title="المورد: ${t.supplierName}">🏢 ${t.supplierName}</div>`:""}`,r=t.daysToExpiry!==null?t.daysToExpiry<=0?'<span style="color:#DC2626; font-weight:900;">منتهي!</span>':`متبقي ${t.daysToExpiry} يوم`:"—",u=(t.name||"").replace(/'/g,"\\'");return`
      <tr style="border-bottom:1px solid var(--border-soft,#e2e8f0); transition:background 0.15s;">
        <td style="padding:10px 14px;">
          <div style="font-weight:800; color:var(--text-0,#0f172a); font-size:13px;">${t.name}</div>
          ${t.barcode?`<div style="font-size:10.5px; color:var(--text-muted,#94a3b8);">${t.barcode}</div>`:""}
        </td>
        <td style="text-align:center;" class="mono dim">${t.sku||"—"}</td>
        <td style="text-align:center;">${f}</td>
        <td style="text-align:center;" class="mono font-bold">
          <span style="font-size:13px; color:${l>0?"var(--text-0,#0f172a)":"#94a3b8"};">
            ${P(l)} ${t.unit||"حبة"}
          </span>
          ${o?`<div style="font-size:9.5px; color:#2563eb;">(${s})</div>`:""}
        </td>
        <td style="text-align:center; font-size:11.5px;">${p}</td>
        <td style="text-align:center; font-size:11.5px;">${r}</td>
        <td class="mono text-warn">${b(t.cost)}</td>
        <td class="mono">${b(t.sellingPrice)}</td>
        <td class="mono font-bold text-good" style="font-size:13px;">
          ${t.riskType==="expired"?'<span style="color:#DC2626;">إتلاف (0 ر.س)</span>':`${b(t.clearancePrice)} ${t.suggestedDiscountPct>0?`<small style="color:#059669;">(-${t.suggestedDiscountPct}%)</small>`:""}`}
        </td>
        <td style="text-align:center;">
          <span class="badge ${t.riskClass}" style="font-size:10.5px; padding:3px 8px; border-radius:99px; ${t.isNeverSold&&t.riskType==="dead"?"background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;font-weight:800;":""}">
            ${t.riskLabel}
          </span>
        </td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            ${t.riskType!=="expired"?`
              <button class="btn btn-secondary btn-sm" onclick="window.openDiscountModal('${t.id}','${u}',${t.sellingPrice},${t.cost},${t.clearancePrice})" title="تطبيق سعر بيع ترويجي" style="font-size:11px; padding:3px 8px;">
                🏷️ خصم
              </button>
            `:""}
            <button class="btn btn-danger btn-sm" onclick="window.openWasteModalForProduct('${t.id}', ${l})" title="تسجيل محضر إتلاف" style="font-size:11px; padding:3px 8px; background:#EF4444; color:#fff; border:none; border-radius:6px;">
              🗑️ إتلاف
            </button>
          </div>
        </td>
      </tr>
    `}).join("")}function nt(){const c=document.getElementById("waste-history-tbody");if(!c)return;if(A.length===0){c.innerHTML=`
      <tr>
        <td colspan="9" style="text-align:center; padding:35px; color:var(--text-2,#64748b);">
          لا توجد محاضر إتلاف مسجلة حتى الآن.
        </td>
      </tr>
    `;return}const e=[...A].sort((o,s)=>new Date(s.date||0)-new Date(o.date||0));c.innerHTML=e.map((o,s)=>`
    <tr style="border-bottom:1px solid var(--border-soft,#e2e8f0);">
      <td style="padding:10px 14px;" class="mono font-bold">${o.code||`WST-${String(s+1).padStart(4,"0")}`}</td>
      <td style="text-align:center;">${B(o.date)}</td>
      <td style="font-weight:700;">${o.productName||"—"}</td>
      <td style="text-align:center;">${o.warehouseName||"المستودع الرئيسي"}</td>
      <td style="text-align:center;" class="mono font-bold text-bad">${P(o.qty)}</td>
      <td class="mono">${b(o.unitCost)}</td>
      <td class="mono font-bold text-bad">${b(o.totalLoss)}</td>
      <td style="font-size:11.5px; max-width:200px;">${o.reason||"—"}</td>
      <td style="text-align:center;">
        <button class="btn btn-secondary btn-sm" onclick="window.printWasteVoucher('${o.id}')" title="طباعة محضر الإتلاف الرسمي" style="font-size:11px; padding:3px 8px;">
          🖨️ طباعة
        </button>
      </td>
    </tr>
  `).join("")}function xt(){window.setRadarSort=function(e){V===e?_=_==="asc"?"desc":"asc":(V=e,["qty","cost","sellingPrice","clearancePrice","purchaseDate","saleDate","expiry"].includes(e)?_="desc":_="asc"),O()},window.updateCardHighlights=function(){const e={dead:document.getElementById("card-filter-dead"),stagnant:document.getElementById("card-filter-stagnant"),expiring:document.getElementById("card-filter-expiring")};Object.entries(e).forEach(([o,s])=>{if(!s)return;const n=s.querySelector(".card-filter-badge");y===o?(s.style.outline="2.5px solid #4F46E5",s.style.boxShadow="0 0 0 4px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0,0,0,0.1)",s.style.transform="translateY(-2px)",n&&(n.style.display="inline-block")):(s.style.outline="",s.style.boxShadow="",s.style.transform="",n&&(n.style.display="none"))})},window.filterByCard=function(e){et!=="radar"&&window.switchClearanceTab("radar"),y===e?y="all":y=e;const o=document.getElementById("radar-risk-filter");o&&(o.value=y),window.updateCardHighlights(),Z(),O()},window.switchClearanceTab=function(e){et=e;const o=document.getElementById("tab-btn-radar"),s=document.getElementById("tab-btn-history"),n=document.getElementById("tab-content-radar"),a=document.getElementById("tab-content-history");e==="radar"?(o?.classList.add("active"),s?.classList.remove("active"),n&&(n.style.display="block"),a&&(a.style.display="none")):(s?.classList.add("active"),o?.classList.remove("active"),n&&(n.style.display="none"),a&&(a.style.display="block"),nt())},window.onRadarFilterChange=function(){J=document.getElementById("radar-search")?.value.trim()||"",k=document.getElementById("radar-wh-filter")?.value||"",y=document.getElementById("radar-risk-filter")?.value||"all",window.updateCardHighlights(),Z(),O()},window.openWasteModal=function(){document.getElementById("waste-date").value=M(),document.getElementById("waste-qty").value="",document.getElementById("waste-total-loss").value="0.00 ر.س",document.getElementById("waste-reason").value="",document.getElementById("waste-prod-avail-hint").textContent="",it();const e=document.getElementById("waste-product-select");e&&(e.innerHTML='<option value="">اختر الصنف التالف…</option>'+U.map(o=>{const s=o.avgCostPrice||o.costPrice||0;return`<option value="${o.id}" data-cost="${s}">${o.name} (تكلفة: ${s} ر.س)</option>`}).join("")),document.getElementById("waste-modal").style.display="flex"},window.openWasteModalForProduct=function(e,o){window.openWasteModal();const s=document.getElementById("waste-product-select");if(s&&(s.value=e,window.selectWasteProduct(e)),o>0){const n=document.getElementById("waste-qty");n&&(n.value=o,window.calcWasteVal())}},window.closeWasteModal=function(){document.getElementById("waste-modal").style.display="none"},window.onWasteWhChange=function(){const e=document.getElementById("waste-product-select")?.value;e&&window.selectWasteProduct(e)},window.selectWasteProduct=function(e){const s=document.getElementById("waste-warehouse")?.value,n=Y.find(t=>t.id===e),a=document.getElementById("waste-prod-avail-hint");if(n&&a){const t=s&&n.byWarehouse?.[s]?n.byWarehouse[s]:n.totalQty||0;a.textContent=`الرصيد المتاح في هذا المستودع: ${t} ${n.unit||"حبة"}`}window.calcWasteVal()},window.calcWasteVal=function(){const e=document.getElementById("waste-product-select"),o=parseFloat(e?.options[e.selectedIndex]?.dataset.cost)||0,s=parseFloat(document.getElementById("waste-qty")?.value)||0,n=o*s,a=document.getElementById("waste-total-loss");a&&(a.value=b(n))},window.onWasteReasonPreset=function(e){const o=document.getElementById("waste-reason");o&&e!=="أخرى"&&(o.value=e)},window.saveWasteRecord=async function(){const e=document.getElementById("btn-save-waste"),o=document.getElementById("waste-warehouse"),s=document.getElementById("waste-product-select"),n=o?.value,a=o?.options[o.selectedIndex]?.text||"المستودع الرئيسي",t=s?.value,l=parseFloat(document.getElementById("waste-qty")?.value)||0,p=parseFloat(s?.options[s.selectedIndex]?.dataset.cost)||0,f=document.getElementById("waste-reason")?.value.trim()||document.getElementById("waste-reason-preset")?.value||"تلف بضاعة",r=document.getElementById("waste-date")?.value||M();if(!t||l<=0){N("يرجى اختيار الصنف وتحديد كمية تالفة صحيحة أكبر من صفر","warning");return}const u=U.find(m=>m.id===t),g=u?.name||"صنف",i=Math.round(p*l*100)/100;if(await pt(`هل أنت متأكد من اعتماد محضر إتلاف ${l} ${u?.unit||"وحدة"} من [${g}] بقيمة خسارة إجمالية ${b(i)}؟
سيتم خصم المخزون وإنشاء قيد خسائر التلف فوراً.`,"تأكيد اعتماد محضر الإتلاف"))try{e&&(e.disabled=!0,e.textContent="⏳ جارٍ الاعتماد والخصم..."),await rt(n,t,-l,{type:"inventory_waste",notes:`إتلاف بضاعة: ${f} (محضر إتلاف)`});const m=`WST-${Date.now().toString().slice(-6)}`;let C=null;try{C=(await lt({date:r,refCode:m,refType:"inventory_waste",narration:`إثبات خسائر إتلاف بضاعة مخزنية: ${g} — سبب: ${f}`,status:"posted",lines:[{accountCode:"5-1-8",accountName:"خسائر تالف وهالك مخزون",debit:i,credit:0,notes:`إتلاف ${l} من ${g}`},{accountCode:"1-1-4-1-01",accountName:`مخزون — ${a}`,debit:0,credit:i,notes:`خصم بضاعة تالفة (${m})`}]}))?.id||null}catch(D){console.warn("Could not create JE for waste:",D.message)}await dt(W.inventoryWaste(),{code:m,date:r,warehouseId:n,warehouseName:a,productId:t,productName:g,sku:u?.sku||"",qty:l,unit:u?.unit||"حبة",unitCost:p,totalLoss:i,reason:f,journalEntryId:C,createdAt:new Date().toISOString()}),window.closeWasteModal(),N("✅ تم اعتماد محضر الإتلاف وخصم المخزون وتسجيل القيد بنجاح","success"),await X()}catch(m){console.error("saveWasteRecord error:",m),N(`فشل تسجيل محضر الإتلاف: ${m.message}`,"error")}finally{e&&(e.disabled=!1,e.textContent="💾 اعتماد الإتلاف وخصم المخزون")}};let c=null;window.openDiscountModal=function(e,o,s,n,a){c={id:e,name:o,costPrice:n,currentPrice:s},document.getElementById("discount-modal-prod-name").textContent=`الصنف: ${o} (السعر الحالي: ${b(s)})`,document.getElementById("discount-modal-price").value=a||s,document.getElementById("discount-modal-cost-hint").textContent=`💡 تكلفة الشراء WACC: ${b(n)}`,document.getElementById("discount-modal").style.display="flex"},window.closeDiscountModal=function(){document.getElementById("discount-modal").style.display="none",c=null},window.confirmClearanceDiscount=async function(){if(!c)return;const e=parseFloat(document.getElementById("discount-modal-price")?.value)||0;if(e<=0){N("يرجى إدخال سعر بيع صحيح أكبر من صفر","warning");return}try{await ct(W.products(),c.id,{sellingPrice:e,updatedAt:new Date().toISOString()}),window.closeDiscountModal(),N(`✅ تم تحديث سعر بيع [${c.name}] إلى ${b(e)} بنجاح`,"success"),await X()}catch(o){console.error(o),N(`فشل تحديث السعر: ${o.message}`,"error")}},window.exportWasteClearanceCSV=function(){let e=tt();if(!e.length){N("لا توجد بيانات للتصدير","warning");return}const o=!!k,s="\uFEFF",n=["اسم الصنف","الكود (SKU)","تاريخ الشراء","أيام منذ الشراء","المورد","الرصيد المتوفر","الوحدة","تاريخ آخر بيع","أيام منذ آخر بيع","رقم آخر فاتورة بيع","العميل المباع له","مدة الركود الفعلي (أيام)","التكلفة WACC","سعر البيع الحالي","سعر التصريف المقترح","تصنيف الخطر","قيمة السيولة المجمدة"].join(","),a=e.map(r=>{const u=o?r.byWarehouse?.[k]||0:r.totalQty,g=u*r.cost;return[`"${(r.name||"").replace(/"/g,'""')}"`,`"${r.sku||""}"`,r.lastPurchaseDate?B(r.lastPurchaseDate):"—",r.daysSincePurchase!==null?r.daysSincePurchase:r.daysSinceArrival!==null?r.daysSinceArrival:"—",`"${(r.supplierName||"").replace(/"/g,'""')}"`,u,`"${r.unit||"حبة"}"`,r.lastSoldDate?B(r.lastSoldDate):"لم يُبَع قط",r.daysSinceLastSale!==null?r.daysSinceLastSale:"—",`"${r.lastInvoiceNumber||"—"}"`,`"${(r.lastInvoiceCustomer||"—").replace(/"/g,'""')}"`,r.stagnationDays!==null?r.stagnationDays:"—",r.cost,r.sellingPrice,r.clearancePrice,`"${r.riskLabel}"`,g.toFixed(2)].join(",")}),t=s+[n,...a].join(`
`),l=new Blob([t],{type:"text/csv;charset=utf-8;"}),p=URL.createObjectURL(l),f=document.createElement("a");f.href=p,f.download=`رادار-الرواكد-والتوالف-${M()}.csv`,f.click(),URL.revokeObjectURL(p)},window.printRadarPDF=async function(){let e=tt();if(!e.length){N("لا توجد أصناف مطابقة للطباعة","warning");return}const o=!!k,s={expired:1,urgent_expiry:2,near_expiry:3,dead:4,slow:5,new_stock:6,normal:7};e.sort((i,x)=>{const m=s[i.riskType]||99,C=s[x.riskType]||99;if(m!==C)return m-C;const D=(o?i.byWarehouse?.[k]||0:i.totalQty)*i.sellingPrice;return(o?x.byWarehouse?.[k]||0:x.totalQty)*x.sellingPrice-D});let n={};try{const i=await q(H(Q,`companies/${j}/settings`,"company"));i.exists()&&(n=i.data());const x=await q(H(Q,`companies/${j}/settings`,"logo"));x.exists()&&x.data().dataUrl&&(n.logoUrl=x.data().dataUrl)}catch{}const a=e.length,t=e.reduce((i,x)=>i+(o?x.byWarehouse?.[k]||0:x.totalQty),0),l=e.reduce((i,x)=>i+(o?x.byWarehouse?.[k]||0:x.totalQty)*x.sellingPrice,0),p=e.filter(i=>i.riskType==="dead").length,f=e.filter(i=>i.riskType==="near_expiry"||i.riskType==="urgent_expiry"||i.riskType==="expired").length,r=k?K.find(i=>i.id===k)?.name||"مستودع محدد":"كافة المستودعات",u=e.map((i,x)=>{const m=o?i.byWarehouse?.[k]||0:i.totalQty,C=i.lastPurchaseDate?`${B(i.lastPurchaseDate)} <br><small style="color:#64748b;">(منذ ${i.daysSincePurchase} يوم)</small>${i.supplierName?`<br><small style="color:#1e293b; font-weight:700;">🏢 ${i.supplierName}</small>`:""}`:i.daysSinceArrival!==null?`مضاف للنظام <br><small style="color:#64748b;">(منذ ${i.daysSinceArrival} يوم)</small>${i.supplierName?`<br><small style="color:#1e293b; font-weight:700;">🏢 ${i.supplierName}</small>`:""}`:`رصيد افتتاحي <br><small style="color:#64748b;">(بضاعة أول المدة)</small>${i.supplierName?`<br><small style="color:#1e293b; font-weight:700;">🏢 ${i.supplierName}</small>`:""}`,D=i.lastSoldDate?`${B(i.lastSoldDate)} <br><small style="color:#64748b;">(منذ ${i.daysSinceLastSale} يوم)${i.lastInvoiceNumber?" • "+i.lastInvoiceNumber:""}</small>${i.lastInvoiceCustomer?`<br><small style="color:#0f766e; font-weight:700;">👤 ${i.lastInvoiceCustomer}</small>`:""}`:`<span style="color:#dc2626; font-weight:800;">🚫 لم يُبَع قط</span><br><small style="color:#64748b;">(في المخزن: ${i.daysSinceArrival!==null?i.daysSinceArrival+" يوم":i.stagnationDays?i.stagnationDays+" يوم":"رصيد افتتاحي"})</small>`,E=i.daysToExpiry!==null?i.daysToExpiry<=0?'<strong style="color:#dc2626;">منتهي!</strong>':`متبقي ${i.daysToExpiry} يوم`:"—",$=m*i.sellingPrice;return`
        <tr>
          <td style="text-align:center; color:#64748b; font-weight:700;">${x+1}</td>
          <td>
            <strong>${i.name}</strong>
            ${i.barcode?`<div style="font-size:9.5px; color:#64748b;">${i.barcode}</div>`:""}
          </td>
          <td style="text-align:center;" class="mono dim">${i.sku||"—"}</td>
          <td style="text-align:center;">${C}</td>
          <td style="text-align:center;" class="mono font-bold">${P(m)} ${i.unit||"حبة"}</td>
          <td style="text-align:center; font-size:11px;">${D}</td>
          <td style="text-align:center; font-size:11px;">${E}</td>
          <td style="text-align:left; font-weight:800; color:#1e3a8a;" class="mono">${b(i.sellingPrice)}</td>
          <td style="text-align:left; font-weight:800; color:#059669;" class="mono">${b($)}</td>
          <td style="text-align:center;">
            <span class="print-badge ${i.riskClass}">${i.riskLabel}</span>
          </td>
        </tr>
      `}).join(""),g=window.open("","_blank","width=1100,height=800");g.document.write(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بيان الأصناف والمخزون المطلوب تصريفه — ${M()}</title>
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
      <h2>${n.name||"شركة إدهام للمواد الغذائية"}</h2>
      <p>س.ت: ${n.crNumber||"—"} • الرقم الضريبي: ${n.vatNumber||"—"}</p>
      <p>نطاق المستودع: ${r}</p>
    </div>

    <div class="header-center">
      <h1>📋 بيان الأصناف والمخزون المطلوب تصريفه وتسريع بيعه</h1>
      <div style="font-size:12px; font-weight:800; color:#facc15; margin-top:2px;">نسخة قسم المبيعات والتوزيع (بأسعار البيع المعتمدة)</div>
      <div style="font-size:10px; color:#e2e8f0; margin-top:2px;">تاريخ التقرير: ${B(new Date)} • وقت الطباعة: ${new Date().toLocaleTimeString("ar-SA")}</div>
    </div>

    <div>
      <div class="logo-box">
        ${n.logoUrl?`<img src="${n.logoUrl}" alt="Logo" />`:'<strong style="color:#0a1d4a; font-size:16px;">إدهام ERP</strong>'}
      </div>
    </div>
  </div>

  <!-- KPI Strip (NO COST EXPOSED) -->
  <div class="kpi-strip">
    <div class="kpi-item" style="border-right: 4px solid #ef4444;">
      <div class="kpi-title">🛑 أصناف راكدة (+60 يوم)</div>
      <div class="kpi-val" style="color:#ef4444;">${p} صنف</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #10b981;">
      <div class="kpi-title">🏷️ القيمة الإجمالية بسعر البيع</div>
      <div class="kpi-val" style="color:#059669;">${b(l)}</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #dc2626;">
      <div class="kpi-title">⏳ بضائع قريبة / منتهية الصلاحية</div>
      <div class="kpi-val" style="color:#dc2626;">${f} صنف</div>
    </div>
    <div class="kpi-item" style="border-right: 4px solid #1e3a8a;">
      <div class="kpi-title">📦 إجمالي الكميات المتاحة للتصريف</div>
      <div class="kpi-val" style="color:#1e3a8a;">${P(t)} وحدة</div>
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
      ${u}
      <tr class="grand-row">
        <td colspan="4" style="text-align:right; font-weight:900; padding:8px;">الإجمالي الكلي (${a} صنف)</td>
        <td style="text-align:center; font-weight:900;" class="mono">${P(t)}</td>
        <td colspan="3" style="text-align:left; font-weight:900; color:#64748b; font-size:11px;">إجمالي المبيعات المستهدفة:</td>
        <td style="text-align:left; font-weight:900; color:#059669;" class="mono">${b(l)}</td>
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
    `),g.document.close(),setTimeout(()=>{g.focus(),g.print(),g.close()},700)},window.printWasteVoucher=async function(e){const o=A.find(a=>a.id===e);if(!o){N("لم يتم العثور على محضر الإتلاف","error");return}let s={};try{const a=await q(H(Q,`companies/${j}/settings`,"company"));a.exists()&&(s=a.data());const t=await q(H(Q,`companies/${j}/settings`,"logo"));t.exists()&&t.data().dataUrl&&(s.logoUrl=t.data().dataUrl)}catch{}const n=window.open("","_blank","width=850,height=750");n.document.write(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر إتلاف بضاعة — ${o.code||""}</title>
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
      <h2 style="font-size:16px; font-weight:900; margin:0;">${s.name||"شركة إدهام للمواد الغذائية"}</h2>
      <div style="font-size:11px; color:#64748b;">س.ت: ${s.crNumber||"—"} • الرقم الضريبي: ${s.vatNumber||"—"}</div>
    </div>
    <div class="title-box">
      <h1 class="title">محضر إتلاف بضاعة رسمي</h1>
      <div class="subtitle">رقم المحضر: ${o.code||"—"}</div>
    </div>
    <div>
      ${s.logoUrl?`<img src="${s.logoUrl}" class="logo" />`:""}
    </div>
  </div>

  <div class="meta-box">
    <div><strong>التاريخ:</strong> ${B(o.date)}</div>
    <div><strong>المستودع:</strong> ${o.warehouseName||"المستودع الرئيسي"}</div>
    <div><strong>سبب الإتلاف:</strong> ${o.reason||"—"}</div>
    <div><strong>رقم القيد المحاسبي:</strong> ${o.journalEntryId?"قيد آلي معتمد":"مرحل"}</div>
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
        <td><strong>${o.productName}</strong></td>
        <td style="text-align:center;">${o.sku||"—"}</td>
        <td style="text-align:center; font-weight:900; color:#dc2626;">${P(o.qty)} ${o.unit||"حبة"}</td>
        <td style="text-align:left;">${b(o.unitCost)}</td>
        <td style="text-align:left; font-weight:900; color:#dc2626;">${b(o.totalLoss)}</td>
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
    `),n.document.close(),setTimeout(()=>{n.focus(),n.print(),n.close()},700)}}export{$t as render};
