import{t as ht,g as et,C as A,w as Kt,f as N,d as Jt,a as Xt,v as Gt,o as l}from"./index-CF9GFeRJ.js";import{e as Zt}from"./excel-DM5XZHtQ.js";import{getDocs as te,query as ee,collection as ne,where as oe,limit as it,orderBy as vt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const dt=(n,e="info")=>{typeof window.showToast=="function"?window.showToast(n,e):alert(n)};let j=[],lt=[],y=null,S=[],at="asc",v="all",Tt=0,qt=0,Dt="";function Mt(n,e=""){if(!n)return!1;const s=j.find(i=>i.id===n),b=(s?.name||e||"").toLowerCase(),d=(s?.type||"").toLowerCase();return d==="vehicle"||d==="distribution"||/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(b)}function Nt(n,e=""){if(!n)return!0;const s=j.find(i=>i.id===n),b=(s?.name||e||"").toLowerCase();return(s?.type||"").toLowerCase()==="main"||/رئيسي|رئيسى|main/i.test(b)||n==="W5uANJjMgfFh2p3xU4bT"}function Lt(){let n={name:"شركة إدهام للمواد الغذائية",nameEn:"Idham Foodstuff Trading Co.",address:"المملكة العربية السعودية — الرياض",phone:"0500000000",email:"info@idham-foods.com",vatNumber:"310000000000003",crNumber:"1010000000",logoBase64:"",logoUrl:""};try{const e=localStorage.getItem("idham_company");if(e){const s=JSON.parse(e);n={...n,...s}}else window.ERP_COMPANY&&(n={...n,...window.ERP_COMPANY})}catch{}return n}async function be(n,e){const s=Lt();n.innerHTML=`
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
            ${s.logoBase64||s.logoUrl?`
              <img src="${s.logoBase64||s.logoUrl}" style="height:52px; max-width:85px; object-fit:contain; background:#fff; padding:4px; border-radius:8px; border:1.5px solid #D4AF37;" alt="شعار الشركة" />
            `:`
              <div style="width:46px; height:46px; border-radius:10px; background:rgba(212,175,55,0.2); border:1.5px solid #D4AF37; display:flex; align-items:center; justify-content:center; font-size:22px;">
                🏢
              </div>
            `}
            <div>
              <h1 style="margin:0; font-size:17px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">${s.name}</h1>
              <div style="font-size:10.5px; color:#D4AF37; font-weight:700; margin-top:2px;">${s.nameEn||"Foodstuff Trading & Distribution ERP — Supply Chain Management"}</div>
              <div style="font-size:9.5px; color:#e2e8f0; margin-top:2px;">
                📍 ${s.address||"المملكة العربية السعودية"} • 📞 ${s.phone||"—"}
              </div>
            </div>
          </div>

          <div style="text-align:left; background:rgba(0,0,0,0.25); padding:8px 14px; border-radius:8px; border:1px solid rgba(212,175,55,0.4);">
            <div style="font-size:13px; font-weight:900; color:#D4AF37;">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:3px;">
              الرقم الضريبي: <b style="font-family:monospace; color:#4ade80;">${s.vatNumber||"310000000000003"}</b>
            </div>
            <div style="font-size:9.5px; color:#ffffff; margin-top:1px;">
              السجل التجاري: <b style="font-family:monospace; color:#4ade80;">${s.crNumber||"1010000000"}</b>
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
            <input type="date" id="sc-date-to" class="input mono font-bold" style="height:36px; width:130px;" value="${ht()}" />
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
  `,await se(),ie()}async function se(){try{const[n,e]=await Promise.all([et(A.products()),et(A.warehouses())]);lt=n,j=e;const s=document.getElementById("sc-wh-filter");s&&(s.innerHTML='<option value="">🏢 جميع المستودعات والسيارات</option>'+j.map(d=>`<option value="${d.id}">${d.name}</option>`).join(""));const b=window._scPreselectProductId||localStorage.getItem("idham_sc_preselect_product_id");if(b){const d=lt.find(i=>i.id===b);if(d){y=d;const i=document.getElementById("sc-product-search"),r=document.getElementById("sc-product-id");i&&(i.value=`${d.sku||""} — ${d.name}`),r&&(r.value=d.id),window._scPreselectProductId=null,localStorage.removeItem("idham_sc_preselect_product_id"),setTimeout(()=>{typeof window.loadStockCardReport=="function"&&window.loadStockCardReport()},150)}}}catch(n){console.error("loadInitialData error in stock-card:",n)}}function ie(){const n=document.getElementById("sc-product-search"),e=document.getElementById("sc-product-results"),s=document.getElementById("sc-product-id");if(!n||!e)return;const b=()=>{const d=n.value.trim().toLowerCase();if(!d){e.classList.add("hidden");return}const i=lt.filter(r=>r.name&&r.name.toLowerCase().includes(d)||r.sku&&r.sku.toLowerCase().includes(d)||r.barcode&&r.barcode.toLowerCase().includes(d)).slice(0,15);i.length?e.innerHTML=i.map(r=>`
        <div class="search-item" data-id="${r.id}" data-sku="${r.sku||""}" data-name="${r.name||""}" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:12.5px; color:var(--text-0);">${r.name}</b>
            <span class="mono font-bold" style="color:var(--brand); font-size:11px;">${r.sku||"—"}</span>
          </div>
          <div class="dim" style="font-size:10.5px; margin-top:2px;">
            الوحدة: ${r.unit||"كرتون"} | الباركود: ${r.barcode||"—"} | التكلفة: ${N(r.averageCost||r.costPrice||0)}
          </div>
        </div>
      `).join(""):e.innerHTML='<div style="padding:12px; color:var(--text-2); text-align:center; font-size:12px;">لا توجد أصناف مطابقة</div>',e.classList.remove("hidden")};n.addEventListener("input",Kt(b,200)),n.addEventListener("focus",b),document.addEventListener("click",d=>{d.target.closest(".autocomplete-container")||e.classList.add("hidden")}),e.addEventListener("click",d=>{const i=d.target.closest(".search-item");if(i){const r=i.dataset.id,_=i.dataset.sku,F=i.dataset.name;n.value=`${_} — ${F}`,s.value=r,y=lt.find(o=>o.id===r),e.classList.add("hidden"),window.loadStockCardReport()}})}window.loadStockCardReport=async()=>{const n=document.getElementById("sc-product-id")?.value,e=document.getElementById("sc-wh-filter")?.value,s=document.getElementById("sc-date-from")?.value||"",b=document.getElementById("sc-date-to")?.value||"",d=document.getElementById("sc-type-filter")?.value||"";if(!n||!y){dt("يرجى اختيار الصنف من القائمة المنسدلة أولاً","warning");return}document.getElementById("sc-placeholder").classList.add("hidden"),document.getElementById("sc-profile-wrapper").classList.remove("hidden");const i=document.getElementById("print-item-name");i&&(i.textContent=y.name);const r=document.getElementById("print-item-sku");r&&(r.textContent=y.sku||"—");const _=document.getElementById("print-item-unit");_&&(_.textContent=y.unit||"كرتون");const F=document.getElementById("print-period");F&&(F.textContent=`من ${s||"البداية"} إلى ${b||"اليوم"}`);const o=document.getElementById("print-wh");if(o){const p=j.find(u=>u.id===e)?.name||"جميع المستودعات والسيارات";o.textContent=p}const k=document.getElementById("sc-tbody");k.innerHTML='<tr><td colspan="12" style="text-align:center; padding:36px; color:var(--text-2);">⏳ جارٍ قراءة وتحليل الحركات وسجلات المستودعات…</td></tr>';try{const[p,u,H,Rt,Ot]=await Promise.all([te(ee(A.stockTransactions?A.stockTransactions():ne(Jt,`companies/${Xt}/stockTransactions`),oe("productId","==",n),it(200))).catch(()=>({docs:[]})),Gt(n).catch(()=>[]),et(A.salesInvoices?A.salesInvoices():"salesInvoices",[vt("date","desc"),it(100)]).catch(()=>[]),et(A.purchaseInvoices?A.purchaseInvoices():"purchaseInvoices",[vt("date","desc"),it(100)]).catch(()=>[]),et(A.stockTransfers?A.stockTransfers():"stockTransfers",[vt("date","desc"),it(100)]).catch(()=>[])]),T=new Map,P=new Map;(H||[]).forEach(t=>{const a=t.customerName||"عميل نقدي",f=t.invoiceNumber||t.number||t.code,g={type:"sale",party:a,rep:t.repName||"",status:t.status,id:t.id,date:t.date};f&&(T.set(f,a),P.set(f,g)),t.id&&(T.set(t.id,a),P.set(t.id,g))}),(Rt||[]).forEach(t=>{const a=t.supplierName||"مورد معتمد",f=t.invoiceNumber||t.number||t.code,g={type:"purchase",party:a,status:t.status,id:t.id,date:t.date};f&&(T.set(f,a),P.set(f,g)),t.id&&(T.set(t.id,a),P.set(t.id,g))}),(Ot||[]).forEach(t=>{const a=t.number||t.code||t.transferNumber,f=t.fromWarehouseName||"المستودع الرئيسي",g=t.toWarehouseName||"المستودع",c=`${f} ⬅️ ${g}`,x={type:"transfer",party:c,fromN:f,toN:g,status:t.status,id:t.id,date:t.date};a&&(T.set(a,c),P.set(a,x)),t.id&&(T.set(t.id,c),P.set(t.id,x))});let W=p.docs.map(t=>({id:t.id,...t.data()}));const Vt=t=>{if(t.date)return String(t.date).slice(0,10);let a=t.createdAt?.seconds||t.createdAt?._seconds;return a?new Date(a*1e3).toISOString().slice(0,10):t.createdAt?.toDate?t.createdAt.toDate().toISOString().slice(0,10):typeof t.createdAt=="string"?t.createdAt.slice(0,10):"2026-08-01"};W.forEach(t=>{t.__dateStr=Vt(t)}),W.sort((t,a)=>{if(t.__dateStr!==a.__dateStr)return t.__dateStr.localeCompare(a.__dateStr);const f=t.createdAt?.seconds||t.createdAt?._seconds||0,g=a.createdAt?.seconds||a.createdAt?._seconds||0;if(f!==g)return f-g;const c={opening:0,purchase_in:1,purchase_invoice:1,sale_reverse_edit:2,reverse_edit:2,sale_cancel:2,cancel_sale:2,sales_return:2,return_in:2,transfer_in:3,adjustment_in:3,sale_out:4,sales_invoice:4,delivery_note:4,pos_sale:4,pos_out:4,transfer_out:5,adjustment_out:5,damage:6},x=c[t.type]!==void 0?c[t.type]:parseFloat(t.qtyChange||t.qtyDelta||0)>0?2:4,w=c[a.type]!==void 0?c[a.type]:parseFloat(a.qtyChange||a.qtyDelta||0)>0?2:4;if(x!==w)return x-w;const m=t.createdAt?.nanoseconds||t.createdAt?._nanoseconds||0,E=a.createdAt?.nanoseconds||a.createdAt?._nanoseconds||0;if(m!==E)return m-E;const M=parseFloat(t.qtyChange||t.qtyDelta||0);return parseFloat(a.qtyChange||a.qtyDelta||0)-M});const _t=document.getElementById("sc-locations-pills");let kt=0,$t=0,It=0;const Ht=(u||[]).map(t=>{const a=parseFloat(t.qty)||0,f=j.find(x=>x.id===t.warehouseId)||{name:t.warehouseName||t.warehouseId||"المستودع الرئيسي",type:"Main"},g=f.type==="Vehicle"||f.type==="Distribution"||f.name&&(f.name.includes("سيارة")||f.name.includes("مندوب"));kt+=a,g?It+=a:$t+=a;const c=a>0?g?"#2563EB":"#059669":"#64748B";return`
        <span class="sc-wh-pill">
          <span>${g?"🚐":"🏢"}</span>
          <span>${f.name}:</span>
          <b class="mono" style="color:${c}; font-size:12px;">${l(a)} ${y.unit||"كرتون"}</b>
        </span>
      `}).join("")||'<span class="dim">لا يوجد رصيد مسجل بالمستودعات</span>';_t&&(_t.innerHTML=Ht);const U=e?parseFloat(u.find(t=>t.warehouseId===e)?.qty||0):kt;let $=0,z=parseFloat(y.averageCost||y.costPrice||0),Q=0,rt=z,pt=0,ct=0;const Y={};j.forEach(t=>{Y[t.id]=0});const R=[];W.forEach(t=>{const a=t.__dateStr,f=s&&a<s,g=!e||t.warehouseId===e;let c=parseFloat(t.qtyChange||0);const x=parseFloat(t.costPrice||t.purchasePrice||z||0),w=t.type||"",m=["purchase_invoice","purchase_in","purchase_return","sales_return","return_in","purchase_reverse"].includes(w),E=["sales_invoice","sale_out","delivery_note","pos_sale","pos_out","sale_cancel","cancel_sale"].includes(w),M=["transfer_out","transfer_in","transfer_cancel"].includes(w),O=["adjustment","damage","assembly","disassembly","opening"].includes(w),G=t.documentNumber||t.docRef||t.invoiceNumber||t.refCode||t.sourceId||"";let nt=T.get(G)||T.get(t.sourceId)||"";const mt=w==="purchase_reverse"&&(String(t.notes||"").includes("حذف فاتورة الشراء")||String(t.notes||"").includes("تعديل")||String(t.notes||"").includes("عكس"));let q=!1;if(mt){const st=P.get(G)||P.get(t.refId)||P.get(t.sourceId);st&&st.status!=="cancelled"&&(q=!0,c=0)}const D=t.warehouseId||"main";Y[D]=(Y[D]||0)+c;let I=c;if(!e&&M&&(I=0),g&&(I>0?($+I>0?z=($*z+I*x)/($+I):z=x,$+=I):I<0&&($+=I)),f){g&&(Q=$,rt=z);return}if(b&&a>b||!g)return;let C=0,B=0;if(q?(C=0,B=0):(C=c>0?c:0,B=c<0?Math.abs(c):0),e?(C&&(pt+=C),B&&(ct+=B)):M||(C&&(pt+=C),B&&(ct+=B)),d==="purchases"&&!m||d==="sales"&&!E||d==="transfers"&&!M||d==="adjustments"&&!O)return;const L=j.find(st=>st.id===t.warehouseId),V=L?L.name:t.warehouseId||"المستودع الرئيسي",Z=Mt(t.warehouseId,V),tt=Nt(t.warehouseId,V),ot=E&&Z,Qt=E&&tt,Yt=!q&&!["sale_reverse_edit","reverse_edit","purchase_reverse","sale_cancel"].includes(t.type);R.push({...t,dateStr:a,partyName:nt,isIgnoredReversal:q,qtyIn:C,qtyOut:B,balanceAfter:$,whBalance:Y[D]!==void 0?Y[D]:$,companyBalance:$,runningWAC:z,runningValuation:$*z,txCost:x,whName:V,isPur:m,isSale:E,isTrans:M,isAdj:O,isWhVehicle:Z,isWhMain:tt,isVanSale:ot,isMainSale:Qt,isCleanCommercial:Yt})}),S=R;let ft=0,St=0,gt=0,K=0,zt=0,Et=0,Ct=0,J=0,bt=0,Bt=0;W.forEach(t=>{const a=t.warehouseId,f=Nt(a),g=Mt(a),c=t.type||"",x=parseFloat(t.qtyChange||0);if(c!=="purchase_reverse"){if(c==="purchase_invoice"||c==="purchase_in"?x>0&&(ft+=x,St++):(c==="sales_return"||c==="return_in")&&x>0&&(gt+=x),["sales_invoice","sale_out","delivery_note","pos_sale"].includes(c)&&x<0){const m=Math.abs(x);f?(K+=m,zt++):g&&(J+=m,bt++)}if(c==="transfer_out"){const m=Math.abs(x);f&&(Et+=m)}else c==="transfer_in"&&(f?Ct+=x:g&&(Bt+=x))}});const xt=$t,yt=It,At=document.getElementById("sc-pipeline-container");if(At){At.style.display="block";const t=document.getElementById("pipe-supplier-in-qty");t&&(t.textContent="+"+l(ft));const a=document.getElementById("pipe-supplier-in-count");a&&(a.textContent=`${St} فواتير شراء`);const f=document.getElementById("pipe-cust-returns");f&&(f.textContent=l(gt));const g=document.getElementById("pipe-main-current-stock");g&&(g.textContent=l(xt));const c=document.getElementById("pipe-main-sales-qty");c&&(c.textContent="-"+l(K));const x=document.getElementById("pipe-transfers-to-vans");x&&(x.textContent="-"+l(Et));const w=document.getElementById("pipe-returns-from-vans");w&&(w.textContent="+"+l(Ct));const m=document.getElementById("pipe-van-sales-qty");m&&(m.textContent="-"+l(J));const E=document.getElementById("pipe-van-sales-count");E&&(E.textContent=`${bt} فواتير ميدانية`);const M=document.getElementById("pipe-van-received-qty");M&&(M.textContent="+"+l(Bt));const O=document.getElementById("pipe-van-current-stock");O&&(O.textContent=l(yt));const G=K+J,nt=xt+yt,mt=Q+ft+gt,q=G+nt,D=document.getElementById("pipe-tally-in");D&&(D.textContent=`الوارد والمتاح: ${l(mt)}`);const I=document.getElementById("pipe-tally-sales");I&&(I.textContent=`المبيعات الصادرة: ${l(G)}`);const C=document.getElementById("pipe-tally-rem");C&&(C.textContent=`المتبقي بالمخازن: ${l(nt)}`);const B=document.getElementById("pipe-tally-details");B&&(B.textContent=`مبيعات المستودع: ${l(K)} (${zt}) | مبيعات المناديب: ${l(J)} (${bt})`);const L=q>0?q:1,V=document.getElementById("pipe-bar-main-sales");V&&(V.style.width=(K/L*100).toFixed(1)+"%");const Z=document.getElementById("pipe-bar-van-sales");Z&&(Z.style.width=(J/L*100).toFixed(1)+"%");const tt=document.getElementById("pipe-bar-main-stock");tt&&(tt.style.width=(xt/L*100).toFixed(1)+"%");const ot=document.getElementById("pipe-bar-van-stock");ot&&(ot.style.width=(yt/L*100).toFixed(1)+"%")}Tt=Q,qt=rt,Dt=s;const X=j.find(t=>t.id===e),Wt=X&&(X.type==="Vehicle"||X.name&&X.name.includes("سيارة"));document.getElementById("sc-opening-bal").textContent=l(Q),document.getElementById("sc-opening-bal-sub").textContent=s?`رصيد البداية في ${s}`:"بداية النشاط (صفر)",document.getElementById("sc-total-in").textContent=l(pt),document.getElementById("sc-total-out").textContent=l(ct),document.getElementById("sc-current-balance").textContent=l(U);const jt=document.querySelector("#sc-total-in + div");jt&&(jt.textContent=Wt?"تحويلات واردة واسترجاعات":e?"مشتريات وتحويلات واردة":"مشتريات ومرتجعات بيع");const Ft=document.getElementById("sc-balance-breakdown-sub");Ft&&(Ft.textContent=e?`الرصيد في ${X?.name||"الموقع المختار"}`:"شامل الرئيسي والسيارات"),document.getElementById("sc-total-valuation").textContent=N(z),document.getElementById("sc-total-valuation-sub").innerHTML=`القيمة الكلية: <b class="text-brand">${N(U*z)}</b>`,document.getElementById("sc-subtitle").innerHTML=`
      الصنف: <strong class="text-indigo">${y.name}</strong> • الكود (SKU): <strong class="mono">${y.sku}</strong> 
      • الوحدة: <strong>${y.unit||"كرتون"}</strong> • الباركود: <strong class="mono">${y.barcode||"—"}</strong>
    `;const Ut=W.filter(t=>!e||t.warehouseId===e).length;document.getElementById("sc-meta-info").textContent=`(${R.length} / ${Ut} حركة)`;const ut=R.length>0?R[R.length-1].balanceAfter:$,Pt=Math.abs(ut-U),h=document.getElementById("sc-reconcile-alert");h&&(!s&&!b?Pt<=.001?(h.innerHTML=`
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <span>✅ <b>مطابقة تامة 100%:</b> الرصيد المحسوب من دفتر الحركات (<b>${l(ut)}</b> ${y.unit||"كرتون"}) يطابق تماماً رصيد المخزن الفعلي المعتمد (<b>${l(U)}</b>).</span>
              <span style="font-size:11px; font-weight:normal; opacity:0.9;">سجل الحركات متسلسل وموثق بالكامل بدون أي عجز</span>
            </div>
          `,h.style.background="rgba(16,185,129,0.08)",h.style.borderColor="rgba(16,185,129,0.3)",h.style.color="#059669",h.style.display="block"):(h.innerHTML=`⚠️ <b>تنبيه تدقيق:</b> الرصيد المحسوب من الحركات (${l(ut)}) يختلف عن الرصيد الفعلي في المخزن (${l(U)}). الفرق: ${l(Pt)} وحدة — قد تكون هناك حركات لم تُعتمد أو مسودات.`,h.style.background="rgba(239,68,68,0.08)",h.style.borderColor="rgba(239,68,68,0.3)",h.style.color="#DC2626",h.style.display="block"):h.style.display="none"),wt(Q,rt,s)}catch(p){console.error("loadStockCardReport error:",p),k.innerHTML=`<tr><td colspan="13" class="text-bad" style="text-align:center; padding:32px;">حدث خطأ: ${p.message}</td></tr>`}};function wt(n=Tt,e=qt,s=Dt){const b=document.getElementById("sc-tbody");if(!b)return;const d=document.getElementById("sc-wh-filter")?.value||"";let i=at==="asc"?[...S]:[...S].reverse();v==="main"?i=i.filter(o=>o.isWhMain):v==="transfers"?i=i.filter(o=>o.isTrans):v==="van_sales"?i=i.filter(o=>o.isVanSale):v==="clean"&&(i=i.filter(o=>o.isCleanCommercial)),document.querySelectorAll(".sc-path-btn").forEach(o=>{o.classList.toggle("active",o.dataset.path===v)});const r=document.getElementById("sc-path-status-bar");if(r){let o="";v==="all"?o=`<span>🌐 <b>الدورة الشاملة:</b> يعرض جميع الحركات التراكمية في كافة المواقع (${i.length} حركة مسجلة)</span>`:v==="main"?o=`<span>🏢 <b>مسار المستودع الرئيسي فقط:</b> يعرض المشتريات المباشرة، والمبيعات الصادرة، وشحنات التحميل (${i.length} حركة)</span>`:v==="transfers"?o=`<span>🔄 <b>مسار شحنات تحويلات السيارات:</b> يعرض سندات تحميل سيارات المناديب والتفريغ (${i.length} سند تحويل)</span>`:v==="van_sales"?o=`<span>🚐 <b>مسار مبيعات سيارات المناديب:</b> يعرض فواتير بيع المندوبين للعملاء بالميدان (${i.length} فاتورة بيع)</span>`:v==="clean"&&(o=`<span>✨ <b>المبيعات التجارية الصافية:</b> تم إخفاء القيود العكسية التقنية لعرض الفواتير الحقيقية الصافية فقط (${i.length} حركة تجارية)</span>`),r.innerHTML=`
      <div style="display:flex; align-items:center; gap:8px;">
        ${o}
      </div>
      ${v!=="all"?`<button class="btn btn-sm btn-secondary" onclick="window.setScPathFilter('all')" style="padding:2px 8px; font-size:10.5px; border-radius:4px;">إلغاء التصفية (عرض الكل) ✕</button>`:""}
    `,r.style.display="flex"}let _="";if(v==="all"&&s&&at==="asc"&&(_=`
      <tr style="background:rgba(99,102,241,0.06); font-weight:700;">
        <td style="text-align:center;" class="mono dim">0</td>
        <td class="mono dim">${s}</td>
        <td style="text-align:center;"><span class="sc-badge" style="background:#E2E8F0; color:#334155;">📅 رصيد أول المدة</span></td>
        <td class="mono dim">—</td>
        <td class="mono dim">—</td>
        <td class="dim">رصيد الصنف في بداية الفترة المحددة (${s})</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono dim">—</td>
        <td style="text-align:center;" class="mono font-bold text-brand" style="font-size:13px;">${l(n)}</td>
        <td style="text-align:left;" class="mono dim">${N(e)}</td>
        <td style="text-align:left;" class="mono text-brand font-bold">${N(e)}</td>
        <td style="text-align:left;" class="mono font-bold">${N(n*e)}</td>
        <td class="dim" style="font-size:11px;">الرصيد الافتتاحي للصنف في تاريخ ${s}</td>
      </tr>
    `),!i.length){b.innerHTML=_+'<tr><td colspan="13" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مسجلة للصنف خلال الفترة المحددة</td></tr>';return}const F={purchase_invoice:{label:"📥 فاتورة شراء",cls:"sc-type-purchase"},purchase_in:{label:"📥 فاتورة شراء",cls:"sc-type-purchase"},purchase_return:{label:"↩️ مردود مشتريات",cls:"sc-type-sale"},purchase_reverse:{label:"🔁 تسوية تعديل شراء",cls:"sc-type-adj"},purchase_reverse_edit:{label:"🔁 تعديل فاتورة شراء",cls:"sc-type-adj"},sales_invoice:{label:"📤 فاتورة بيع",cls:"sc-type-sale"},sale_out:{label:"📤 فاتورة بيع",cls:"sc-type-sale"},sale_out_edit:{label:"📤 فاتورة بيع (معدلة)",cls:"sc-type-sale"},delivery_note:{label:"📦 سند تسليم بضاعة",cls:"sc-type-sale"},sale_reverse_edit:{label:"🔁 استرجاع تعديل فاتورة (+)",cls:"sc-type-purchase"},sale_reverse:{label:"🔁 استرجاع تعديل فاتورة (+)",cls:"sc-type-purchase"},reverse_edit:{label:"🔁 استرجاع تعديل فاتورة (+)",cls:"sc-type-purchase"},sale_cancel:{label:"🔁 تسوية تعديل قديم",cls:"sc-type-adj"},sales_return:{label:"📥 مردود مبيعات",cls:"sc-type-purchase"},pos_sale:{label:"🛍️ نقطة بيع",cls:"sc-type-sale"},transfer_out:{label:"🔄 تحويل صادر (-)",cls:"sc-type-transfer"},transfer_in:{label:"🔄 تحويل وارد (+)",cls:"sc-type-transfer"},adjustment:{label:"⚖️ تسوية جردية",cls:"sc-type-adj"},damage:{label:"⚠️ إتلاف وتالف",cls:"sc-type-adj"},opening:{label:"📅 رصيد افتتاحي",cls:"sc-badge"}};b.innerHTML=_+i.map((o,k)=>{const p=F[o.type]||{label:o.type||"حركة",cls:"sc-badge"},u=at==="asc"?k+1:i.length-k,H=o.documentNumber||o.docRef||o.invoiceNumber||o.refCode||"—";return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="text-align:center;" class="mono dim">${u}</td>
        <td class="mono font-bold" style="font-size:11px;">${o.dateStr}</td>
        <td style="text-align:center;">
          <span class="sc-badge ${p.cls}">${p.label}</span>
        </td>
        <td class="mono font-bold">
          <span style="color:var(--brand); cursor:pointer;" onclick="window.previewStockDoc('${o.type}','${H}')" title="عرض تفاصيل المستند ${H}">
            ${H}
          </span>
        </td>
        <td style="font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${o.partyName?`<span style="font-weight:700; color:var(--text-0);" title="${o.partyName}">${o.partyName}</span>`:'<span class="dim">—</span>'}
        </td>
        <td>
          <span style="font-weight:700; color:var(--text-0);">${o.whName}</span>
        </td>
        <td style="text-align:center;" class="mono font-bold ${o.qtyIn?"text-good":"dim"}">
          ${o.qtyIn?"+"+l(o.qtyIn):"—"}
        </td>
        <td style="text-align:center;" class="mono font-bold ${o.qtyOut?"text-bad":"dim"}">
          ${o.qtyOut?"-"+l(o.qtyOut):"—"}
        </td>
        <td style="text-align:center; background:rgba(99,102,241,0.04);">
          ${d?`
            <span class="mono font-bold" style="font-size:13px; color:${o.balanceAfter>0?"#10B981":o.balanceAfter===0?"#64748B":"#EF4444"};">
              ${l(o.balanceAfter)}
            </span>
          `:`
            <div>
              <span class="mono font-bold" style="font-size:13px; color:${o.balanceAfter>0?"#10B981":o.balanceAfter===0?"#64748B":"#EF4444"};" title="رصيد إجمالي الشركة">
                ${l(o.balanceAfter)}
              </span>
              <div style="font-size:9.5px; color:var(--text-2); font-family:var(--font-mono); white-space:nowrap; margin-top:1px;" title="رصيد ${o.whName} بعد هذه الحركة مباشرة">
                موقع: <b>${l(o.whBalance)}</b>
              </div>
            </div>
          `}
        </td>
        <td style="text-align:left;" class="mono dim">${N(o.txCost)}</td>
        <td style="text-align:left;" class="mono font-bold text-brand">${N(o.runningWAC)}</td>
        <td style="text-align:left;" class="mono font-bold">${N(o.runningValuation)}</td>
        <td style="font-size:11px; color:var(--text-1); max-width:260px;">
          ${ae(o)}
        </td>
      </tr>
    `}).join("")}function ae(n){let e=String(n.notes||n.description||"").trim();const s=Math.abs(parseFloat(n.qtyChange||0)),b=y&&y.unit?y.unit:"كرتون";if(n.isIgnoredReversal)return n.isPur||n.type==="purchase_reverse"?'<span class="sc-badge" style="background:#fef3c7; color:#b45309; font-weight:bold;">🔁 قيد تسوية تعديل قديم (فاتورة الشراء قائمة ومثبتة فعلياً بالمستودع)</span>':'<span class="sc-badge" style="background:#fef3c7; color:#b45309; font-weight:bold;">🔁 قيد تسوية تعديل قديم (الفاتورة قائمة ومخصومة فعلياً من العهدة)</span>';if(n.isTrans){const d=`<span class="mono font-bold" style="background:rgba(99,102,241,0.14); color:#4F46E5; padding:2px 8px; border-radius:6px; border:1px solid rgba(99,102,241,0.35); font-size:11px; margin-left:6px;">🔄 شحنة: ${s} ${b}</span>`;let i=e;return i.includes("تصحيح تلقائي عند الاستلام")||i.includes("كمية مفقودة")?i="تأكيد استلام الشحنة في سيارة المندوب رسمياً":i.includes("قيد النقل إلى")&&(i=i.replace("قيد النقل إلى","صرف تحويل معتمد إلى")),`${d} <span style="font-weight:700; color:var(--text-0);">${i}</span>`}return n.isSale&&n.partyName?`<span style="color:var(--text-0); font-weight:700;">فاتورة بيع رسمية للعميل: <b>${n.partyName}</b></span>`:n.isPur&&n.partyName?`<span style="color:var(--text-0); font-weight:700;">استلام توريد من المورد: <b>${n.partyName}</b></span>`:e||(n.createdByName?`بواسطة: ${n.createdByName}`:"حركة نظامية موثقة")}window.previewStockDoc=(n,e)=>{!e||e==="—"||dt(`مستند رقم: ${e}`,"info")};window.toggleScSort=n=>{at=n;const e=document.getElementById("sc-sort-asc-btn"),s=document.getElementById("sc-sort-desc-btn");n==="asc"?(e&&(e.style.background="var(--brand)",e.style.color="#fff"),s&&(s.style.background="var(--bg-2)",s.style.color="var(--text-1)")):(s&&(s.style.background="var(--brand)",s.style.color="#fff"),e&&(e.style.background="var(--bg-2)",e.style.color="var(--text-1)")),wt()};window.setScPathFilter=n=>{v=n,wt()};window.printOfficialStockCard=()=>{window.print()};window.exportStockCardExcel=()=>{if(!S.length||!y){dt("يرجى اختيار صنف واستخراج الكرت أولاً","warning");return}const n=S.map((e,s)=>({م:s+1,التاريخ:e.dateStr,"نوع الحركة":e.type,"رقم المستند":e.documentNumber||e.docRef||"","الطرف الثاني":e.partyName||"",المستودع:e.whName,"وارد (+)":e.qtyIn||0,"صادر (-)":e.qtyOut||0,"الرصيد بعد":e.balanceAfter,"تكلفة الوحدة":e.txCost,"المتوسط المرجح":e.runningWAC,"القيمة التراكمية":e.runningValuation,"البيان والملاحظات":e.notes||e.description||""}));Zt({title:`كرت_حركة_الصنف_${y.sku}_${ht()}`,headers:["م","التاريخ","نوع الحركة","رقم المستند","الطرف الثاني","المستودع","وارد (+)","صادر (-)","الرصيد بعد","تكلفة الوحدة","المتوسط المرجح","القيمة التراكمية","البيان والملاحظات"],rows:n.map(e=>Object.values(e)),colWidths:[6,12,16,16,22,18,10,10,12,12,14,14,28]})};window.printCustodyReconciliation=()=>{if(!y){dt("يرجى اختيار صنف واستخراج الكرت أولاً","warning");return}const n=document.getElementById("sc-wh-filter")?.value||"",s=j.find(p=>p.id===n)?.name||"جميع المستودعات والسيارات",b=Lt(),d=S.filter(p=>p.qtyIn>0),i=d.reduce((p,u)=>p+(u.qtyIn||0),0),r=S.filter(p=>p.qtyOut>0),_=r.reduce((p,u)=>p+(u.qtyOut||0),0),F=S.length>0?S[S.length-1].balanceAfter:0,o=y.unit||"كرتون",k=window.open("","_blank","width=920,height=800");k.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${y.name} — ${s}</title>
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
      <h2 style="font-size:15px; font-weight:900; color:#0f3d19;">${b.name}</h2>
      <div style="font-size:9.5px; color:#64748b;">سجل تجاري: ${b.crNumber||"—"} • ر.ض: ${b.vatNumber||"—"}</div>
    </div>
    <div class="title-box">
      <h1 style="font-size:16px; font-weight:900; color:#0f172a;">محضر مطابقة وجرد عهدة سيارة / مخزن</h1>
      <div style="font-size:10.5px; color:#0f3d19; font-weight:700;">كشف تفريغ حركة الصنف وتدقيق العهدة الميدانية</div>
    </div>
    <div style="text-align:left; font-size:9.5px; color:#64748b;">
      <div>تاريخ الاستخراج: <b>${ht()}</b></div>
      <div>نظام IDHAM ERP</div>
    </div>
  </div>

  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; font-size:11px;">
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${y.name}</span> (SKU: <span class="mono">${y.sku}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${s}</span></div>
    <div><b>الوحدة:</b> <span>${o}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${l(i)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${l(_)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${l(F)} ${o}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${S.length} حركة</div>
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
      ${d.map((p,u)=>`
        <tr>
          <td style="text-align:center;" class="mono">${u+1}</td>
          <td class="mono">${p.dateStr}</td>
          <td class="mono font-bold">${p.documentNumber||p.docRef||"—"}</td>
          <td>${p.partyName||p.notes||"استلام شحنة معتمدة"}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${l(p.qtyIn)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${l(i)}</td>
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
      ${r.map((p,u)=>`
        <tr>
          <td style="text-align:center;" class="mono">${u+1}</td>
          <td class="mono">${p.dateStr}</td>
          <td class="mono font-bold">${p.documentNumber||p.docRef||"—"}</td>
          <td><b>${p.partyName||"عميل نقدي"}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${l(p.qtyOut)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${l(_)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${l(F)} ${o}</b></div>
      <div>الرصيد الفعلي الموجود بالسيارة الآن: <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${o}</div>
      <div>الفارق (عجز / زيادة): <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${o}</div>
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
</html>`),k.document.close(),setTimeout(()=>{k.focus(),k.print(),k.close()},700)};export{be as render};
