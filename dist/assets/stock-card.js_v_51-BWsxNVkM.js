import{t as Y,g as L,a as $,q as wt,f as z,d as _t,C as kt,p as $t,l as f}from"./index-BgjRa7f-.js";import{e as It}from"./excel-zCoXiaxq.js";import{getDocs as zt,query as Et,collection as St,where as Ct}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const q=(o,e="info")=>{typeof window.showToast=="function"?window.showToast(o,e):alert(o)};let N=[],V=[],c=null,v=[],R="asc";function dt(){let o={name:"شركة إدهام للمواد الغذائية",nameEn:"Idham Foodstuff Trading Co.",address:"المملكة العربية السعودية — الرياض",phone:"0500000000",email:"info@idham-foods.com",vatNumber:"310000000000003",crNumber:"1010000000",logoBase64:"",logoUrl:""};try{const e=localStorage.getItem("idham_company");if(e){const n=JSON.parse(e);o={...o,...n}}else window.ERP_COMPANY&&(o={...o,...window.ERP_COMPANY})}catch{}return o}async function Ot(o,e){const n=dt();o.innerHTML=`
    <style>
      .sc-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .sc-type-purchase { background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
      .sc-type-sale { background: rgba(239,68,68,0.12); color: #DC2626; border: 1px solid rgba(239,68,68,0.3); }
      .sc-type-transfer { background: rgba(99,102,241,0.12); color: #4F46E5; border: 1px solid rgba(99,102,241,0.3); }
      .sc-type-adj { background: rgba(245,158,11,0.12); color: #D97706; border: 1px solid rgba(245,158,11,0.3); }
      .sc-wh-pill { padding: 6px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 700; background: var(--bg-2); border: 1px solid var(--border-soft); display: inline-flex; align-items: center; gap: 6px; }

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
            ${n.logoBase64||n.logoUrl?`
              <img src="${n.logoBase64||n.logoUrl}" style="height:52px; max-width:85px; object-fit:contain; background:#fff; padding:4px; border-radius:8px; border:1.5px solid #D4AF37;" alt="شعار الشركة" />
            `:`
              <div style="width:46px; height:46px; border-radius:10px; background:rgba(212,175,55,0.2); border:1.5px solid #D4AF37; display:flex; align-items:center; justify-content:center; font-size:22px;">
                🏢
              </div>
            `}
            <div>
              <h1 style="margin:0; font-size:17px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">${n.name}</h1>
              <div style="font-size:10.5px; color:#D4AF37; font-weight:700; margin-top:2px;">${n.nameEn||"Foodstuff Trading & Distribution ERP — Supply Chain Management"}</div>
              <div style="font-size:9.5px; color:#e2e8f0; margin-top:2px;">
                📍 ${n.address||"المملكة العربية السعودية"} • 📞 ${n.phone||"—"}
              </div>
            </div>
          </div>

          <div style="text-align:left; background:rgba(0,0,0,0.25); padding:8px 14px; border-radius:8px; border:1px solid rgba(212,175,55,0.4);">
            <div style="font-size:13px; font-weight:900; color:#D4AF37;">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:3px;">
              الرقم الضريبي: <b style="font-family:monospace; color:#4ade80;">${n.vatNumber||"310000000000003"}</b>
            </div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:1px;">
              السجل التجاري: <b style="font-family:monospace; color:#4ade80;">${n.crNumber||"1010000000"}</b>
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
            <input type="date" id="sc-date-to" class="input mono font-bold" style="height:36px; width:130px;" value="${Y()}" />
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

          <!-- Detailed Movements Ledger Card -->
          <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
            
            <!-- Table Toolbar -->
            <div style="padding:14px 18px; border-bottom:1px solid var(--border-soft); background:var(--bg-2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;" class="no-print">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px;">📜</span>
                <h3 style="margin:0; font-size:14.5px; font-weight:900; color:var(--text-0);">سجل دفتر الأستاذ لحركة الصنف (Stock Movement Ledger)</h3>
                <span class="mono font-bold" style="font-size:11.5px; color:var(--text-2);" id="sc-meta-info"></span>
              </div>

              <!-- Sorting Direction Toggle -->
              <div style="display:flex; gap:6px; align-items:center;" class="no-print">
                <span style="font-size:11px; font-weight:700; color:var(--text-2);">الترتيب:</span>
                <button class="btn btn-secondary btn-sm" id="sc-sort-asc-btn" onclick="window.toggleScSort('asc')" style="font-size:11px; font-weight:bold; background:var(--brand); color:#fff;">⬇️ تسلسلي محاسبي (من الأقدم للأحدث)</button>
                <button class="btn btn-secondary btn-sm" id="sc-sort-desc-btn" onclick="window.toggleScSort('desc')" style="font-size:11px; font-weight:bold;">⬆️ من الأحدث للأقدم</button>
              </div>
            </div>
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
  `,await Bt(),Nt()}async function Bt(){try{const[o,e]=await Promise.all([L($.products()),L($.warehouses())]);V=o,N=e;const n=document.getElementById("sc-wh-filter");n&&(n.innerHTML='<option value="">🏢 جميع المستودعات والسيارات</option>'+N.map(p=>`<option value="${p.id}">${p.name}</option>`).join(""))}catch(o){console.error("loadInitialData error in stock-card:",o)}}function Nt(){const o=document.getElementById("sc-product-search"),e=document.getElementById("sc-product-results"),n=document.getElementById("sc-product-id");if(!o||!e)return;const p=()=>{const g=o.value.trim().toLowerCase();if(!g){e.classList.add("hidden");return}const r=V.filter(d=>d.name&&d.name.toLowerCase().includes(g)||d.sku&&d.sku.toLowerCase().includes(g)||d.barcode&&d.barcode.toLowerCase().includes(g)).slice(0,15);r.length?e.innerHTML=r.map(d=>`
        <div class="search-item" data-id="${d.id}" data-sku="${d.sku||""}" data-name="${d.name||""}" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:12.5px; color:var(--text-0);">${d.name}</b>
            <span class="mono font-bold" style="color:var(--brand); font-size:11px;">${d.sku||"—"}</span>
          </div>
          <div class="dim" style="font-size:10.5px; margin-top:2px;">
            الوحدة: ${d.unit||"كرتون"} | الباركود: ${d.barcode||"—"} | التكلفة: ${z(d.averageCost||d.costPrice||0)}
          </div>
        </div>
      `).join(""):e.innerHTML='<div style="padding:12px; color:var(--text-2); text-align:center; font-size:12px;">لا توجد أصناف مطابقة</div>',e.classList.remove("hidden")};o.addEventListener("input",wt(p,200)),o.addEventListener("focus",p),document.addEventListener("click",g=>{g.target.closest(".autocomplete-container")||e.classList.add("hidden")}),e.addEventListener("click",g=>{const r=g.target.closest(".search-item");if(r){const d=r.dataset.id,s=r.dataset.sku,h=r.dataset.name;o.value=`${s} — ${h}`,n.value=d,c=V.find(m=>m.id===d),e.classList.add("hidden"),window.loadStockCardReport()}})}window.loadStockCardReport=async()=>{const o=document.getElementById("sc-product-id")?.value,e=document.getElementById("sc-wh-filter")?.value,n=document.getElementById("sc-date-from")?.value||"",p=document.getElementById("sc-date-to")?.value||"",g=document.getElementById("sc-type-filter")?.value||"";if(!o||!c){q("يرجى اختيار الصنف من القائمة المنسدلة أولاً","warning");return}document.getElementById("sc-placeholder").classList.add("hidden"),document.getElementById("sc-profile-wrapper").classList.remove("hidden");const r=document.getElementById("print-item-name");r&&(r.textContent=c.name);const d=document.getElementById("print-item-sku");d&&(d.textContent=c.sku||"—");const s=document.getElementById("print-item-unit");s&&(s.textContent=c.unit||"كرتون");const h=document.getElementById("print-period");h&&(h.textContent=`من ${n||"البداية"} إلى ${p||"اليوم"}`);const m=document.getElementById("print-wh");if(m){const i=N.find(y=>y.id===e)?.name||"جميع المستودعات والسيارات";m.textContent=i}const w=document.getElementById("sc-tbody");w.innerHTML='<tr><td colspan="12" style="text-align:center; padding:36px; color:var(--text-2);">⏳ جارٍ قراءة وتحليل الحركات وسجلات المستودعات…</td></tr>';try{const[i,y,lt,ct,pt]=await Promise.all([zt(Et($.stockTransactions?$.stockTransactions():St(_t,`companies/${kt}/stockTransactions`),Ct("productId","==",o))).catch(()=>({docs:[]})),$t(o).catch(()=>[]),L($.salesInvoices?$.salesInvoices():"salesInvoices").catch(()=>[]),L($.purchaseInvoices?$.purchaseInvoices():"purchaseInvoices").catch(()=>[]),L($.stockTransfers?$.stockTransfers():"stockTransfers").catch(()=>[])]),E=new Map,S=new Map;(lt||[]).forEach(t=>{const a=t.customerName||"عميل نقدي",l=t.invoiceNumber||t.number||t.code,b={type:"sale",party:a,rep:t.repName||"",status:t.status,id:t.id,date:t.date};l&&(E.set(l,a),S.set(l,b)),t.id&&(E.set(t.id,a),S.set(t.id,b))}),(ct||[]).forEach(t=>{const a=t.supplierName||"مورد معتمد",l=t.invoiceNumber||t.number||t.code,b={type:"purchase",party:a,status:t.status,id:t.id,date:t.date};l&&(E.set(l,a),S.set(l,b)),t.id&&(E.set(t.id,a),S.set(t.id,b))}),(pt||[]).forEach(t=>{const a=t.number||t.code||t.transferNumber,l=t.fromWarehouseName||"المستودع الرئيسي",b=t.toWarehouseName||"المستودع",x=`${l} ⬅️ ${b}`,k={type:"transfer",party:x,fromN:l,toN:b,status:t.status,id:t.id,date:t.date};a&&(E.set(a,x),S.set(a,k)),t.id&&(E.set(t.id,x),S.set(t.id,k))});let D=i.docs.map(t=>({id:t.id,...t.data()}));const gt=t=>{if(t.date)return String(t.date).slice(0,10);let a=t.createdAt?.seconds||t.createdAt?._seconds;return a?new Date(a*1e3).toISOString().slice(0,10):t.createdAt?.toDate?t.createdAt.toDate().toISOString().slice(0,10):typeof t.createdAt=="string"?t.createdAt.slice(0,10):"2026-08-01"};D.forEach(t=>{t.__dateStr=gt(t)}),D.sort((t,a)=>{if(t.__dateStr!==a.__dateStr)return t.__dateStr.localeCompare(a.__dateStr);const l={opening:0,purchase_in:1,purchase_invoice:1,sales_return:2,transfer_in:3,sale_out:4,sales_invoice:4,transfer_out:5,damage:6},b=l[t.type]!==void 0?l[t.type]:4,x=l[a.type]!==void 0?l[a.type]:4;if(b!==x)return b-x;const k=t.createdAt?.seconds||t.createdAt?._seconds||0,C=a.createdAt?.seconds||a.createdAt?._seconds||0;return k-C});const K=document.getElementById("sc-locations-pills");let Q=0,ft=0,bt=0;const xt=(y||[]).map(t=>{const a=parseFloat(t.qty)||0,l=N.find(k=>k.id===t.warehouseId)||{name:t.warehouseName||t.warehouseId||"المستودع الرئيسي",type:"Main"},b=l.type==="Vehicle"||l.type==="Distribution"||l.name&&(l.name.includes("سيارة")||l.name.includes("مندوب"));Q+=a,b?bt+=a:ft+=a;const x=a>0?b?"#2563EB":"#059669":"#64748B";return`
        <span class="sc-wh-pill">
          <span>${b?"🚐":"🏢"}</span>
          <span>${l.name}:</span>
          <b class="mono" style="color:${x}; font-size:12px;">${f(a)} ${c.unit||"كرتون"}</b>
        </span>
      `}).join("")||'<span class="dim">لا يوجد رصيد مسجل بالمستودعات</span>';K&&(K.innerHTML=xt);const M=e?parseFloat(y.find(t=>t.warehouseId===e)?.qty||0):Q;let I=0,_=parseFloat(c.averageCost||c.costPrice||0),H=0,J=_,X=0,G=0;const A=[];D.forEach(t=>{const a=t.__dateStr,l=n&&a<n,b=!e||t.warehouseId===e;let x=parseFloat(t.qtyChange||0);const k=parseFloat(t.costPrice||t.purchasePrice||_||0),C=t.type||"",ot=["purchase_invoice","purchase_in","purchase_return","sales_return","return_in"].includes(C),nt=["sales_invoice","sale_out","pos_sale","pos_out","sale_cancel","cancel_sale"].includes(C),F=["transfer_out","transfer_in","transfer_cancel"].includes(C),st=["adjustment","damage","assembly","disassembly","opening"].includes(C),it=t.documentNumber||t.docRef||t.invoiceNumber||t.refCode||t.sourceId||"";let ut=E.get(it)||E.get(t.sourceId)||"";const vt=(C==="sale_cancel"||C==="cancel_sale")&&(String(t.notes||"").includes("إرجاع كمية التعديل")||String(t.notes||"").includes("تعديل"));let U=!1;if(vt){const O=S.get(it)||S.get(t.sourceId);O&&O.status!=="cancelled"&&(U=!0,x=0)}let B=x;if(!e&&F&&(B=0),b&&(B>0?(I+B>0?_=(I*_+B*k)/(I+B):_=k,I+=B):B<0&&(I+=B)),l){b&&(H=I,J=_);return}if(p&&a>p||!b)return;let T=0,j=0;if(!e&&F||U?(T=0,j=0):(T=x>0?x:0,j=x<0?Math.abs(x):0),T&&(X+=T),j&&(G+=j),g==="purchases"&&!ot||g==="sales"&&!nt||g==="transfers"&&!F||g==="adjustments"&&!st)return;const at=N.find(O=>O.id===t.warehouseId),ht=at?at.name:t.warehouseId||"المستودع الرئيسي";A.push({...t,dateStr:a,partyName:ut,isIgnoredReversal:U,qtyIn:T,qtyOut:j,balanceAfter:I,runningWAC:_,runningValuation:I*_,txCost:k,whName:ht,isPur:ot,isSale:nt,isTrans:F,isAdj:st})}),v=A;const P=N.find(t=>t.id===e),mt=P&&(P.type==="Vehicle"||P.name&&P.name.includes("سيارة"));document.getElementById("sc-opening-bal").textContent=f(H),document.getElementById("sc-opening-bal-sub").textContent=n?`رصيد البداية في ${n}`:"بداية النشاط (صفر)",document.getElementById("sc-total-in").textContent=f(X),document.getElementById("sc-total-out").textContent=f(G),document.getElementById("sc-current-balance").textContent=f(M);const Z=document.querySelector("#sc-total-in + div");Z&&(Z.textContent=mt?"تحويلات واردة واسترجاعات":e?"مشتريات وتحويلات واردة":"مشتريات ومرتجعات بيع");const tt=document.getElementById("sc-balance-breakdown-sub");tt&&(tt.textContent=e?`الرصيد في ${P?.name||"الموقع المختار"}`:"شامل الرئيسي والسيارات"),document.getElementById("sc-total-valuation").textContent=z(_),document.getElementById("sc-total-valuation-sub").innerHTML=`القيمة الكلية: <b class="text-brand">${z(M*_)}</b>`,document.getElementById("sc-subtitle").innerHTML=`
      الصنف: <strong class="text-indigo">${c.name}</strong> • الكود (SKU): <strong class="mono">${c.sku}</strong> 
      • الوحدة: <strong>${c.unit||"كرتون"}</strong> • الباركود: <strong class="mono">${c.barcode||"—"}</strong>
    `;const yt=D.filter(t=>!e||t.warehouseId===e).length;document.getElementById("sc-meta-info").textContent=`(${A.length} / ${yt} حركة)`;const W=A.length>0?A[A.length-1].balanceAfter:I,et=Math.abs(W-M),u=document.getElementById("sc-reconcile-alert");u&&(!n&&!p?et<=.001?(u.innerHTML=`
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <span>✅ <b>مطابقة تامة 100%:</b> الرصيد المحسوب من دفتر الحركات (<b>${f(W)}</b> ${c.unit||"كرتون"}) يطابق تماماً رصيد المخزن الفعلي المعتمد (<b>${f(M)}</b>).</span>
              <span style="font-size:11px; font-weight:normal; opacity:0.9;">سجل الحركات متسلسل وموثق بالكامل بدون أي عجز</span>
            </div>
          `,u.style.background="rgba(16,185,129,0.08)",u.style.borderColor="rgba(16,185,129,0.3)",u.style.color="#059669",u.style.display="block"):(u.innerHTML=`⚠️ <b>تنبيه تدقيق:</b> الرصيد المحسوب من الحركات (${f(W)}) يختلف عن الرصيد الفعلي في المخزن (${f(M)}). الفرق: ${f(et)} وحدة — قد تكون هناك حركات لم تُعتمد أو مسودات.`,u.style.background="rgba(239,68,68,0.08)",u.style.borderColor="rgba(239,68,68,0.3)",u.style.color="#DC2626",u.style.display="block"):u.style.display="none"),rt(H,J,n)}catch(i){console.error("loadStockCardReport error:",i),w.innerHTML=`<tr><td colspan="13" class="text-bad" style="text-align:center; padding:32px;">حدث خطأ: ${i.message}</td></tr>`}};function rt(o,e,n){const p=document.getElementById("sc-tbody");if(!p)return;const g=R==="asc"?[...v]:[...v].reverse();let r="";if(n&&R==="asc"&&(r=`
      <tr style="background:rgba(99,102,241,0.06); font-weight:700;">
        <td style="text-align:center;" class="mono dim">0</td>
        <td class="mono dim">${n}</td>
        <td style="text-align:center;"><span class="sc-badge" style="background:#E2E8F0; color:#334155;">📅 رصيد أول المدة</span></td>
        <td class="mono dim">—</td>
        <td class="mono dim">—</td>
        <td class="dim">رصيد الصنف في بداية الفترة المحددة (${n})</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono font-bold text-brand" style="font-size:13px;">${f(o)}</td>
        <td style="text-align:left;" class="mono dim">${z(e)}</td>
        <td style="text-align:left;" class="mono text-brand font-bold">${z(e)}</td>
        <td style="text-align:left;" class="mono font-bold">${z(o*e)}</td>
        <td class="dim" style="font-size:11px;">الرصيد الافتتاحي للصنف في تاريخ ${n}</td>
      </tr>
    `),!g.length){p.innerHTML=r+'<tr><td colspan="13" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مسجلة للصنف خلال الفترة المحددة</td></tr>';return}const d={purchase_invoice:{label:"📥 فاتورة شراء",cls:"sc-type-purchase"},purchase_in:{label:"📥 فاتورة شراء",cls:"sc-type-purchase"},purchase_return:{label:"↩️ مردود مشتريات",cls:"sc-type-sale"},purchase_reverse_edit:{label:"🔁 تعديل فاتورة شراء",cls:"sc-type-adj"},sales_invoice:{label:"📤 فاتورة بيع",cls:"sc-type-sale"},sale_out:{label:"📤 فاتورة بيع",cls:"sc-type-sale"},sale_reverse:{label:"🔁 تعديل فاتورة بيع",cls:"sc-type-adj"},sale_cancel:{label:"🔁 تسوية تعديل قديم",cls:"sc-type-adj"},sales_return:{label:"📥 مردود مبيعات",cls:"sc-type-purchase"},pos_sale:{label:"🛍️ نقطة بيع",cls:"sc-type-sale"},transfer_out:{label:"🔄 تحويل صادر (-)",cls:"sc-type-transfer"},transfer_in:{label:"🔄 تحويل وارد (+)",cls:"sc-type-transfer"},adjustment:{label:"⚖️ تسوية جردية",cls:"sc-type-adj"},damage:{label:"⚠️ إتلاف وتالف",cls:"sc-type-adj"},opening:{label:"📅 رصيد افتتاحي",cls:"sc-badge"}};p.innerHTML=r+g.map((s,h)=>{const m=d[s.type]||{label:s.type||"حركة",cls:"sc-badge"},w=R==="asc"?h+1:g.length-h,i=s.documentNumber||s.docRef||s.invoiceNumber||s.refCode||"—";return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="text-align:center;" class="mono dim">${w}</td>
        <td class="mono font-bold" style="font-size:11px;">${s.dateStr}</td>
        <td style="text-align:center;">
          <span class="sc-badge ${m.cls}">${m.label}</span>
        </td>
        <td class="mono font-bold">
          <span style="color:var(--brand); cursor:pointer;" onclick="window.previewStockDoc('${s.type}','${i}')" title="عرض تفاصيل المستند ${i}">
            ${i}
          </span>
        </td>
        <td style="font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${s.partyName?`<span style="font-weight:700; color:var(--text-0);" title="${s.partyName}">${s.partyName}</span>`:'<span class="dim">—</span>'}
        </td>
        <td>
          <span style="font-weight:700; color:var(--text-0);">${s.whName}</span>
        </td>
        <td style="text-align:center;" class="mono font-bold ${s.qtyIn?"text-good":"dim"}">
          ${s.qtyIn?"+"+f(s.qtyIn):"—"}
        </td>
        <td style="text-align:center;" class="mono font-bold ${s.qtyOut?"text-bad":"dim"}">
          ${s.qtyOut?"-"+f(s.qtyOut):"—"}
        </td>
        <td style="text-align:center; background:rgba(99,102,241,0.04);">
          <span class="mono font-bold" style="font-size:13px; color:${s.balanceAfter>0?"#10B981":s.balanceAfter===0?"#64748B":"#EF4444"};">
            ${f(s.balanceAfter)}
          </span>
        </td>
        <td style="text-align:left;" class="mono dim">${z(s.txCost)}</td>
        <td style="text-align:left;" class="mono font-bold text-brand">${z(s.runningWAC)}</td>
        <td style="text-align:left;" class="mono font-bold">${z(s.runningValuation)}</td>
        <td style="font-size:11px; color:var(--text-1); max-width:260px;">
          ${At(s)}
        </td>
      </tr>
    `}).join("")}function At(o){let e=String(o.notes||o.description||"").trim();const n=Math.abs(parseFloat(o.qtyChange||0)),p=c&&c.unit?c.unit:"كرتون";if(o.isIgnoredReversal)return'<span class="sc-badge" style="background:#fef3c7; color:#b45309; font-weight:bold;">🔁 قيد تسوية تعديل قديم (الفاتورة قائمة ومخصومة فعلياً من العهدة)</span>';if(o.isTrans){const g=`<span class="mono font-bold" style="background:rgba(99,102,241,0.14); color:#4F46E5; padding:2px 8px; border-radius:6px; border:1px solid rgba(99,102,241,0.35); font-size:11px; margin-left:6px;">🔄 شحنة: ${n} ${p}</span>`;let r=e;return r.includes("تصحيح تلقائي عند الاستلام")||r.includes("كمية مفقودة")?r="تأكيد استلام الشحنة في سيارة المندوب رسمياً":r.includes("قيد النقل إلى")&&(r=r.replace("قيد النقل إلى","صرف تحويل معتمد إلى")),`${g} <span style="font-weight:700; color:var(--text-0);">${r}</span>`}return o.isSale&&o.partyName?`<span style="color:var(--text-0); font-weight:700;">فاتورة بيع رسمية للعميل: <b>${o.partyName}</b></span>`:o.isPur&&o.partyName?`<span style="color:var(--text-0); font-weight:700;">استلام توريد من المورد: <b>${o.partyName}</b></span>`:e||(o.createdByName?`بواسطة: ${o.createdByName}`:"حركة نظامية موثقة")}window.previewStockDoc=(o,e)=>{!e||e==="—"||q(`مستند رقم: ${e}`,"info")};window.toggleScSort=o=>{R=o;const e=document.getElementById("sc-sort-asc-btn"),n=document.getElementById("sc-sort-desc-btn");o==="asc"?(e&&(e.style.background="var(--brand)",e.style.color="#fff"),n&&(n.style.background="var(--bg-2)",n.style.color="var(--text-1)")):(n&&(n.style.background="var(--brand)",n.style.color="#fff"),e&&(e.style.background="var(--bg-2)",e.style.color="var(--text-1)"));const p=document.getElementById("sc-date-from")?.value||"";rt(0,0,p)};window.printOfficialStockCard=()=>{window.print()};window.exportStockCardExcel=()=>{if(!v.length||!c){q("يرجى اختيار صنف واستخراج الكرت أولاً","warning");return}const o=v.map((e,n)=>({م:n+1,التاريخ:e.dateStr,"نوع الحركة":e.type,"رقم المستند":e.documentNumber||e.docRef||"","الطرف الثاني":e.partyName||"",المستودع:e.whName,"وارد (+)":e.qtyIn||0,"صادر (-)":e.qtyOut||0,"الرصيد بعد":e.balanceAfter,"تكلفة الوحدة":e.txCost,"المتوسط المرجح":e.runningWAC,"القيمة التراكمية":e.runningValuation,"البيان والملاحظات":e.notes||e.description||""}));It({title:`كرت_حركة_الصنف_${c.sku}_${Y()}`,headers:["م","التاريخ","نوع الحركة","رقم المستند","الطرف الثاني","المستودع","وارد (+)","صادر (-)","الرصيد بعد","تكلفة الوحدة","المتوسط المرجح","القيمة التراكمية","البيان والملاحظات"],rows:o.map(e=>Object.values(e)),colWidths:[6,12,16,16,22,18,10,10,12,12,14,14,28]})};window.printCustodyReconciliation=()=>{if(!c){q("يرجى اختيار صنف واستخراج الكرت أولاً","warning");return}const o=document.getElementById("sc-wh-filter")?.value||"",n=N.find(i=>i.id===o)?.name||"جميع المستودعات والسيارات",p=dt(),g=v.filter(i=>i.qtyIn>0),r=g.reduce((i,y)=>i+(y.qtyIn||0),0),d=v.filter(i=>i.qtyOut>0),s=d.reduce((i,y)=>i+(y.qtyOut||0),0),h=v.length>0?v[v.length-1].balanceAfter:0,m=c.unit||"كرتون",w=window.open("","_blank","width=920,height=800");w.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${c.name} — ${n}</title>
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
      <h2 style="font-size:15px; font-weight:900; color:#0f3d19;">${p.name}</h2>
      <div style="font-size:9.5px; color:#64748b;">سجل تجاري: ${p.crNumber||"—"} • ر.ض: ${p.vatNumber||"—"}</div>
    </div>
    <div class="title-box">
      <h1 style="font-size:16px; font-weight:900; color:#0f172a;">محضر مطابقة وجرد عهدة سيارة / مخزن</h1>
      <div style="font-size:10.5px; color:#0f3d19; font-weight:700;">كشف تفريغ حركة الصنف وتدقيق العهدة الميدانية</div>
    </div>
    <div style="text-align:left; font-size:9.5px; color:#64748b;">
      <div>تاريخ الاستخراج: <b>${Y()}</b></div>
      <div>نظام IDHAM ERP</div>
    </div>
  </div>

  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; font-size:11px;">
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${c.name}</span> (SKU: <span class="mono">${c.sku}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${n}</span></div>
    <div><b>الوحدة:</b> <span>${m}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${f(r)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${f(s)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${f(h)} ${m}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${v.length} حركة</div>
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
      ${g.map((i,y)=>`
        <tr>
          <td style="text-align:center;" class="mono">${y+1}</td>
          <td class="mono">${i.dateStr}</td>
          <td class="mono font-bold">${i.documentNumber||i.docRef||"—"}</td>
          <td>${i.partyName||i.notes||"استلام شحنة معتمدة"}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${f(i.qtyIn)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${f(r)}</td>
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
      ${d.map((i,y)=>`
        <tr>
          <td style="text-align:center;" class="mono">${y+1}</td>
          <td class="mono">${i.dateStr}</td>
          <td class="mono font-bold">${i.documentNumber||i.docRef||"—"}</td>
          <td><b>${i.partyName||"عميل نقدي"}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${f(i.qtyOut)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${f(s)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${f(h)} ${m}</b></div>
      <div>الرصيد الفعلي الموجود بالسيارة الآن: <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${m}</div>
      <div>الفارق (عجز / زيادة): <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${m}</div>
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
</html>`),w.document.close(),setTimeout(()=>{w.focus(),w.print(),w.close()},700)};export{Ot as render};
