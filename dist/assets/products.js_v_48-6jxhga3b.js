const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{g as A,C as I,_ as At,d as Xt,f as H,n as te,o as v,p as ee,q as ge,u as Vt,c as oe,r as ne,v as ie,w as be,a as ae}from"./index-CF9GFeRJ.js";import{e as se,d as ve,i as ye}from"./excel-DM5XZHtQ.js";import"./product-cost-sync-DM1NFvQW.js";import{orderBy as vt,query as Qt,where as qt,limit as Pt,getDocs as Ot,getDoc as fe,doc as xe}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let z=[],q=0;const Tt=50;let Ut=null,_t=!1,Bt="",Et="",O=[],S=[],tt=[];async function re(){if(!tt||tt.length===0)try{tt=await A(I.suppliers(),[vt("name")])}catch(t){console.warn("Failed to load suppliers with orderBy, falling back:",t);try{tt=await A(I.suppliers()),tt.sort((e,o)=>(e.name||"").localeCompare(o.name||"","ar"))}catch{tt=[]}}de()}function de(t=null){const e=document.getElementById("prod-supplier");if(!e)return;const o=t!==null?t:e.value;e.innerHTML='<option value="">اختر المورد الافتراضي...</option>'+(tt||[]).map(n=>`<option value="${n.id}">${n.name}${n.code?` (${n.code})`:""}</option>`).join(""),o&&(e.value=o)}let R="sku",ht=!0;window.sortProdList=t=>{R===t?ht=!ht:(R=t,ht=t==="sku"||t==="name"||t==="category"),C()};function Y(t){return R!==t?'<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>':ht?'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>':'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>'}window.getSortArrowProd=Y;let it=null,Lt=null;async function he(){if(Lt)return Lt;try{const t=await fe(xe(Xt,`companies/${ae}/settings`,"system"));t.exists()&&(Lt=t.data())}catch(t){console.error("Failed to load pricing settings:",t)}return Lt||{}}function we(t){return t.length===0?'<tr><td colspan="14" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مطابقة</td></tr>':t.map(e=>{const o=Math.max(0,e._totalQty!==void 0&&e._totalQty!==null?e._totalQty:e.totalQty!==void 0?e.totalQty:e.stockQty!==void 0?e.stockQty:0),n=te(o,e.reorderLevel||0),i=e.costPrice||e.purchasePrice||0,s=e.averageCost||e.avgCostPrice||i,p=e.lastPurchasePrice||(e.lastPurchasePrice===0?0:e.averageCost||e.avgCostPrice||(i>0?i:null)),g=e.sellingPrice||e.salePrice||e.priceRetail||e.price||0,b=p&&p>0?p:s||i,r=g>0?(g-b)/g*100:0;let d="low",u=`${r.toFixed(1)}%`;r>=20?d="high":r>=10?d="medium":(d="low",r<=0?u=`⚠️ ${r.toFixed(1)}%`:u=`${r.toFixed(1)}%`);const y=e.sku||e.code||"—";return`
      <tr class="status-${n.color}">
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">${y}</td>
        <td style="cursor:pointer;" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">
          <strong>${e.name||e.nameAr}</strong>
          ${e.nameEn?`<div class="dim" style="font-size:10px;">${e.nameEn}</div>`:""}
          ${e.barcode?`<div class="mono dim" style="font-size:10px;">Barcode: ${e.barcode}</div>`:""}
        </td>
        <td>
          ${e.tracking==="batch"?'<span class="badge warn" style="font-size:10px;">التشغيلة</span>':e.tracking==="serial"?'<span class="badge info" style="font-size:10px;">تسلسلي</span>':'<span class="badge neutral" style="font-size:10px;">عام</span>'}
        </td>
        <td class="dim">${e.categoryName||"—"}</td>
        <td>${Ht(e.unit||"Piece")}${e.altUnit?` (${Ht(e.altUnit)}: ${e.unitFactor} ${Ht(e.unit||"Piece")})`:""}</td>
        
        <td class="mono price-editable" style="text-align:left; color:var(--text-2);" title="سعر التكلفة اليدوي — انقر مرتين للتعديل"
            ondblclick="inlineEditPrice(this, '${e.id}', 'costPrice', ${i})">
          ${i>0?H(i):'<span class="dim">—</span>'}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="المتوسط المرجح المحسوب تلقائياً من فواتير الشراء">
          ${s>0?`<span style="color:var(--brand);">${H(s)}</span>`:i>0?`<span class="dim" style="font-size:11px;" title="التكلفة اليدوية">${H(i)}</span>`:'<span class="dim" style="font-size:11px;">—</span>'}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="${e.lastPurchaseDate?"تاريخ آخر شراء: "+e.lastPurchaseDate+(e.lastSupplierName?" | المورد: "+e.lastSupplierName:""):e.lastPurchasePrice?"آخر سعر شراء مسجل":"التكلفة المسجلة"}">
          ${e.lastPurchasePrice!==void 0&&e.lastPurchasePrice!==null&&e.lastPurchasePrice>0?`<span style="color:#059669; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.25); display:inline-block;">${H(e.lastPurchasePrice)}</span>${e.lastPurchaseDate?`<div class="dim" style="font-size:10px; margin-top:2px;">${e.lastPurchaseDate}</div>`:""}`:p!==null&&p>0?`<span style="color:var(--text-1);">${H(p)}</span>`:i>0?`<span class="dim" style="font-size:11px;">${H(i)}</span>`:'<span class="dim" style="font-size:11px;">—</span>'}
        </td>
        
        <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
            ondblclick="inlineEditPrice(this, '${e.id}', 'salePrice', ${g})">
          <span class="profit-dot ${d}" title="هامش الربح الفعلي: ${r.toFixed(1)}%"></span>
          ${H(g)}
        </td>
        
        <td style="text-align:center;">
          <span class="margin-pct ${d}" title="الهامش الفعلي المحسوب من آخر سعر شراء">${u}</span>
          ${e.targetMarginPct?`<div class="dim" style="font-size:9.5px; margin-top:2px;" title="نسبة الربح المستهدفة المسجلة">هدف: ${e.targetMarginPct}%</div>`:""}
        </td>
        
        <td>${e.taxCategory==="S"?"15%":"0%"}</td>
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">${v(o)}</td>
        <td>${ee(o,e.reorderLevel)}</td>
        <td style="padding:6px; text-align:center;">
          <div class="prod-actions-stack">
            <button class="btn-act btn-act-view" onclick="event.stopPropagation();viewStock('${e.id}')" title="كشف حركة الصنف">
              <span>📦</span> حركة
            </button>
            <button class="btn-act btn-act-edit" onclick="event.stopPropagation();editProduct('${e.id}')" title="تعديل صنف">
              <span>✏️</span> تعديل
            </button>
            <button class="btn-act btn-act-barcode" onclick="event.stopPropagation();printProductBarcode('${e.id}')" title="طباعة باركود">
              <span>🏷️</span> باركود
            </button>
            <button class="btn-act btn-act-delete" onclick="event.stopPropagation();deleteProduct('${e.id}')" title="حذف الصنف">
              <span>🗑️</span> حذف
            </button>
          </div>
        </td>
      </tr>
    `}).join("")}async function Me(t,e){if(!document.getElementById("prod-local-styles")){const s=document.createElement("style");s.id="prod-local-styles",s.innerHTML=`
      .skeleton-row td { padding: 12px 14px; }
      .profit-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
      .profit-dot.high { background: #10B981; }
      .profit-dot.medium { background: #F59E0B; }
      .profit-dot.low { background: #EF4444; }
      .margin-pct { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; }
      .margin-pct.high { color: #10B981; background: rgba(16, 185, 129, 0.1); }
      .margin-pct.medium { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
      .margin-pct.low { color: #EF4444; background: rgba(239, 68, 68, 0.1); }
      td.price-editable { cursor: pointer; position: relative; }
      td.price-editable:hover { background: rgba(91, 127, 255, 0.08) !important; color: var(--brand); }
      .prod-actions-stack { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; min-width: 120px; position: relative; z-index: 10; }
      .btn-act { display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 4px 6px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; font-family: inherit; }
      .btn-act-view { background: rgba(99, 102, 241, 0.12); color: #4F46E5; border-color: rgba(99, 102, 241, 0.25); }
      .btn-act-view:hover { background: #4F46E5; color: #ffffff; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3); }
      .btn-act-edit { background: rgba(245, 158, 11, 0.12); color: #D97706; border-color: rgba(245, 158, 11, 0.25); }
      .btn-act-edit:hover { background: #D97706; color: #ffffff; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3); }
      .btn-act-barcode { background: rgba(16, 185, 129, 0.12); color: #059669; border-color: rgba(16, 185, 129, 0.25); }
      .btn-act-barcode:hover { background: #059669; color: #ffffff; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); }
      .btn-act-delete { background: rgba(239, 68, 68, 0.12); color: #DC2626; border-color: rgba(239, 68, 68, 0.25); }
      .btn-act-delete:hover { background: #DC2626; color: #ffffff; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }
    `,document.head.appendChild(s)}z=[],t.innerHTML=`
    <!-- Filter Bar -->
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:300px;">
        <input type="text" id="prod-search" class="input" placeholder="🔍  بحث في الأصناف (اسم، كود، باركود)…" />
      </div>
      <div class="filterbar-divider"></div>
      <div class="filter-select-group">
        <label>الفئة</label>
        <select id="prod-cat-filter">
          <option value="">كل الفئات</option>
          ${S.map(s=>`<option value="${s.id}" ${Bt===s.id?"selected":""}>${s.name}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="prod-status-filter">
          <option value="">الكل</option>
          <option value="ok" ${Et==="ok"?"selected":""}>متوفر</option>
          <option value="low" ${Et==="low"?"selected":""}>منخفض</option>
          <option value="out" ${Et==="out"?"selected":""}>نافد</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button class="btn-export" style="background:#4F46E5;color:#fff;" onclick="syncAllProductPurchasePrices(this)" title="تحديث ومزامنة آخر أسعار الشراء ومتوسط التكلفة من كافة فواتير الشراء"><span>🔄</span> تحديث أسعار الشراء</button>
        <button class="btn-export" onclick="exportPagePDF('#prod-tbody','كتالوج_الأصناف')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportProductsExcel()" title="تصدير Excel - جميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:var(--bg-2);border:1px solid var(--border-soft);color:var(--text-1);" onclick="downloadProductTemplate()" title="تنزيل نموذج استيراد"><span>📥</span> نموذج الاستيراد</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openProductImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openProductModal()">+ إضافة صنف جديد</button>
      </div>
    </div>

    <!-- KPIs Section -->
    <div class="inv-kpi-grid" style="margin-bottom: 20px;">
      <div class="inv-kpi-card g-blue">
        <div class="inv-kpi-icon">💰</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-val">${it?H(it.totalValue):"—"}</div>
          <div class="inv-kpi-label">قيمة المخزون (سعر البيع المتوقع)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-teal">
        <div class="inv-kpi-icon">🏷️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-cost">${it?H(it.totalCost):"—"}</div>
          <div class="inv-kpi-label">تكلفة المخزون الشرائية (المطابقة للمحاسبة)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-green">
        <div class="inv-kpi-icon">📈</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-margin-pct">${it?`${it.avgMargin}%`:"—"}</div>
          <div class="inv-kpi-label">متوسط هامش الربح %</div>
        </div>
      </div>
      <div class="inv-kpi-card g-orange">
        <div class="inv-kpi-icon">⚠️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-low-stock">${it?it.lowStockCount:"—"}</div>
          <div class="inv-kpi-label">أصناف تحت حد الطلب</div>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">كتالوج الأصناف والبطاقات التعريفية</h1>
          <p class="page-subtitle" id="prod-count-label">جارٍ التحميل…</p>
        </div>
        <div class="page-header-right">
          <span id="prod-page-info" class="text-2 mono" style="font-size:12px;"></span>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="table-container" id="prod-table-wrap">
          <table class="data-dense" id="prod-table">
            <thead>
              <tr>
                <th onclick="sortProdList('sku')" style="cursor:pointer; user-select:none;">الكود ${Y("sku")}</th>
                <th onclick="sortProdList('name')" style="cursor:pointer; user-select:none;">اسم الصنف (عربي/إنجليزي) ${Y("name")}</th>
                <th>التتبع</th>
                <th onclick="sortProdList('category')" style="cursor:pointer; user-select:none;">الفئة ${Y("category")}</th>
                <th>الوحدات والتحويل</th>
                <th onclick="sortProdList('costPrice')" style="cursor:pointer; user-select:none; text-align:left;">التكلفة (يدوي) ${Y("costPrice")}</th>
                <th onclick="sortProdList('avgCostPrice')" style="cursor:pointer; user-select:none; text-align:left; color:var(--brand);">متوسط الشراء (تلقائي) ${Y("avgCostPrice")}</th>
                <th onclick="sortProdList('lastPurchasePrice')" style="cursor:pointer; user-select:none; text-align:left;">آخر سعر شراء ${Y("lastPurchasePrice")}</th>
                <th onclick="sortProdList('sellingPrice')" style="cursor:pointer; user-select:none; text-align:left;">سعر البيع (جملة/تجزئة) ${Y("sellingPrice")}</th>
                <th onclick="sortProdList('profit')" style="cursor:pointer; user-select:none; text-align:center;">نسبة الربح ${Y("profit")}</th>
                <th>الضريبة</th>
                <th onclick="sortProdList('totalQty')" style="cursor:pointer; user-select:none;">المخزون الإجمالي ${Y("totalQty")}</th>
                <th>الحالة</th>
                <th style="width:130px; text-align:center;">الخيارات والإجراءات</th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:120px;height:40px;border-radius:6px;"></div></td>
                </tr>
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:120px;height:40px;border-radius:6px;"></div></td>
                </tr>
              
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border-soft); position:relative; z-index:10;">
          <button class="btn btn-sm btn-secondary" id="prev-page-btn" onclick="window.loadPrevPage()" ${q===0?"disabled":""}>السابق</button>
          <span id="page-counter" class="text-2 mono" style="font-size:12px;">الصفحة ${q+1}</span>
          <button class="btn btn-sm btn-secondary" id="next-page-btn" onclick="window.loadNextPage()" ${_t?"":"disabled"}>التالي</button>
        </div>
      </div>
    </div>

    <!-- Product Modal (Add/Edit) -->
    <div class="modal-overlay" id="product-modal">
      <div class="modal modal-xl" style="max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <h3 class="modal-title" id="prod-modal-title">إضافة صنف جديد</h3>
          <button class="modal-close" onclick="closeModal('product-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:24px;">
          <input type="hidden" id="prod-edit-id" />
          
          <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin-bottom:20px;">
            <button class="tab-btn active" id="prod-tab-basic" onclick="switchProdFormTab('basic')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">البيانات الأساسية</button>
            <button class="tab-btn" id="prod-tab-inventory" onclick="switchProdFormTab('inventory')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">مؤشرات المخازن وتتبع الصلاحية</button>
            <button class="tab-btn" id="prod-tab-pricing" onclick="switchProdFormTab('pricing')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">التكلفة ومستويات الأسعار</button>
            <button class="tab-btn" id="prod-tab-units" onclick="switchProdFormTab('units')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">الوحدات المتعددة والتحويل</button>
          </div>

          <!-- Tab 1: Basic Information -->
          <div class="prod-form-tab-content" id="content-prod-basic">
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>كود الصنف (Item Code) *</label>
                <input type="text" id="prod-sku" class="input" placeholder="RICE-100" />
              </div>
              <div class="form-group">
                <label>الاسم باللغة العربية *</label>
                <input type="text" id="prod-name-ar" class="input" placeholder="أرز بسمتي الشعلان 10 كجم" />
              </div>
              <div class="form-group">
                <label>الاسم باللغة الإنجليزية</label>
                <input type="text" id="prod-name-en" class="input" placeholder="Al Shalan Basmati Rice 10kg" />
              </div>
            </div>
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>الفئة الرئيسية *</label>
                <select id="prod-category" class="input" onchange="onCategoryChange()">
                  <option value="">اختر الفئة...</option>
                </select>
              </div>
              <div class="form-group">
                <label>المورد الافتراضي</label>
                <select id="prod-supplier" class="input">
                  <option value="">اختر المورد...</option>
                </select>
              </div>
              <div class="form-group">
                <label>بلد المنشأ</label>
                <input type="text" id="prod-origin" class="input" placeholder="الهند، البرازيل..." />
              </div>
            </div>
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>الباركود الأساسي</label>
                <input type="text" id="prod-barcode" class="input mono" placeholder="628xxxxxxxxxx" />
              </div>
              <div class="form-group">
                <label>باركود بديل (متعدد، مفصول بفاصلة)</label>
                <input type="text" id="prod-barcodes-alt" class="input mono" placeholder="6281002003, 6284005006" />
              </div>
              <div class="form-group">
                <label>رمز النظام المنسق الجمركي (HS Code)</label>
                <input type="text" id="prod-hs-code" class="input mono" placeholder="1006.30.00" />
              </div>
            </div>
            <div class="form-group">
              <label>وصف الصنف / تفاصيل إضافية</label>
              <textarea id="prod-desc" class="input" rows="3" placeholder="المواصفات الفنية والملاحظات التشغيلية..."></textarea>
            </div>
          </div>

          <!-- Tab 2: Warehouse Control & Expiry Tracking -->
          <div class="prod-form-tab-content hidden" id="content-prod-inventory">
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>طريقة التتبع (Tracking Method)</label>
                <select id="prod-tracking" class="input" onchange="toggleTrackingFields()">
                  <option value="none">بدون تتبع خاص</option>
                  <option value="batch">بالتشغيلة وتاريخ الانتهاء (Batch & Expiry)</option>
                  <option value="serial">بالرقم التسلسلي (Serial Number)</option>
                </select>
              </div>
              <div class="form-group">
                <label>فترة الصلاحية بالأيام (Shelf Life)</label>
                <input type="number" id="prod-shelf-life" class="input mono" placeholder="365" />
              </div>
              <div class="form-group">
                <label>درجة حرارة التخزين (°م)</label>
                <select id="prod-temp" class="input">
                  <option value="dry">مخزن جاف (غرفة)</option>
                  <option value="chilled">تبريد (1°م إلى 4°م)</option>
                  <option value="frozen">تجميد (-18°م وأقل)</option>
                </select>
              </div>
            </div>
            <div class="grid-4 gap-16 mb-16">
              <div class="form-group">
                <label>الحد الأدنى للمخزون (Min)</label>
                <input type="number" id="prod-min" class="input mono" placeholder="10" />
              </div>
              <div class="form-group">
                <label>الحد الأقصى للمخزون (Max)</label>
                <input type="number" id="prod-max" class="input mono" placeholder="1000" />
              </div>
              <div class="form-group">
                <label>نقطة إعادة الطلب (Reorder Point)</label>
                <input type="number" id="prod-reorder" class="input mono" placeholder="50" />
              </div>
              <div class="form-group">
                <label>مخزون الأمان (Safety Stock)</label>
                <input type="number" id="prod-safety" class="input mono" placeholder="20" />
              </div>
            </div>
            <div class="grid-3 gap-16">
              <div class="form-group">
                <label>الكمية الاقتصادية للطلب (EOQ)</label>
                <input type="number" id="prod-eoq" class="input mono" placeholder="150" />
              </div>
              <div class="form-group">
                <label>وقت التوريد بالأيام (Lead Time)</label>
                <input type="number" id="prod-lead-time" class="input mono" placeholder="15" />
              </div>
              <div class="form-group">
                <label>فئة ضريبة القيمة المضافة ZATCA *</label>
                <select id="prod-zatca-tax" class="input">
                  <option value="S">خاضع للضريبة الأساسية 15%</option>
                  <option value="Z">خاضع لنسبة الصفر 0%</option>
                  <option value="E">معفى من الضريبة</option>
                </select>
              </div>
            </div>

            <!-- Multi-Warehouse shelf/bin locations mapping -->
            <h4 style="border-top:1px solid var(--border-soft); padding-top:16px; margin-top:20px; color:var(--brand); font-family:var(--font-heading); font-size:14px; font-weight:700;">📍 مواقع التخزين داخل المستودعات (Locations & Bins)</h4>
            <p class="dim" style="font-size:11px; margin-bottom:12px;">تحديد الرفوف والممرات لكل مستودع لتسهيل التحضير (مثال: الرف A-12، الممر 3)</p>
            <div class="table-container" style="max-height: 180px; overflow-y: auto;">
              <table class="data-dense" style="width:100%; margin:0;">
                <thead>
                  <tr>
                    <th>اسم المستودع</th>
                    <th>موقع الصنف بالرف / الممر (Location / Shelf Code)</th>
                  </tr>
                </thead>
                <tbody id="prod-locations-tbody">
                  <!-- Will be loaded dynamically from warehouses -->
                </tbody>
              </table>
            </div>

          </div>

          <!-- Tab 3: Costing & Price Levels -->
          <div class="prod-form-tab-content hidden" id="content-prod-pricing">
            
            <!-- Smart Pricing Strategy Card (استراتيجية التسعير الذكي وآخر سعر شراء) -->
            <div style="background:rgba(99,102,241,0.06); border:1.5px solid rgba(99,102,241,0.25); border-radius:12px; padding:14px 18px; margin-bottom:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">🎯</span>
                  <strong style="font-size:13.5px; color:var(--text-0);">استراتيجية التسعير وهامش الربح المستهدف (Last Purchase Price Pricing)</strong>
                </div>
                <div style="font-size:11.5px; color:var(--text-2);">
                  🛒 آخر سعر شراء مسجل: <b id="prod-last-purchase-display" class="mono font-bold" style="color:#059669;">—</b>
                </div>
              </div>

              <div class="grid-3 gap-16">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700;">نسبة هامش الربح المستهدفة %</label>
                  <div style="display:flex; gap:6px; align-items:center;">
                    <input type="number" id="prod-target-margin-pct" class="input mono font-bold" placeholder="مثال: 20" min="0" max="500" step="0.5" oninput="onTargetMarginInput()" style="font-size:13px; font-weight:800; border-color:var(--brand);" />
                    <span style="font-size:12px; font-weight:800; color:var(--brand);">%</span>
                  </div>
                </div>

                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700;">طريقة احتساب الهامش</label>
                  <select id="prod-margin-type" class="input font-bold" onchange="onTargetMarginInput()" style="font-size:11.5px; height:36px;">
                    <option value="markup">إضافة على التكلفة (Markup %)</option>
                    <option value="margin">هامش ربح من سعر البيع (Margin %)</option>
                  </select>
                </div>

                <div class="form-group" style="margin:0; display:flex; flex-direction:column; justify-content:flex-end;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="applyLastPurchasePricePricing()" style="height:36px; font-size:11px; font-weight:700; color:var(--brand); border-color:var(--brand);">
                    ⚡ حساب الأسعار من آخر سعر شراء
                  </button>
                </div>
              </div>
            </div>

            <div class="grid-3 gap-16 mb-20">
              <div class="form-group">
                <label>طريقة التقييم المالي (Valuation)</label>
                <select id="prod-valuation" class="input">
                  <option value="moving_average">المتوسط المرجح المتحرك (Moving Average)</option>
                  <option value="fifo">الوارد أولاً يصرف أولاً (FIFO)</option>
                  <option value="lifo">الوارد أخيراً يصرف أولاً (LIFO)</option>
                  <option value="standard">التكلفة القياسية (Standard Cost)</option>
                </select>
              </div>
              <div class="form-group">
                <label>سعر التكلفة اليدوي الافتراضي (ر.س)</label>
                <input type="number" id="prod-purchase-price" class="input mono" step="0.01" placeholder="0.00" oninput="onCostInput()" />
              </div>
              <div class="form-group">
                <label>التكلفة القياسية / المعيارية (ر.س)</label>
                <input type="number" id="prod-std-cost" class="input mono" step="0.01" placeholder="0.00" />
              </div>
            </div>
            
            <h4 style="border-bottom:1px solid var(--border-soft); padding-bottom:8px; margin-bottom:16px; color:var(--brand); font-family:var(--font-heading); font-size:14px; font-weight:700;">💰 مستويات أسعار البيع للعملاء وهامش الربح</h4>
            <div class="grid-3 gap-16">
              <!-- Retail -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">🛒 بيع التجزئة (Retail)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س) *</label>
                    <input type="number" id="prod-price-retail" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('retail')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-retail" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('retail')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-retail" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('retail')" />
                  </div>
                </div>
              </div>

              <!-- Wholesale -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">📦 بيع الجملة (Wholesale)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-wholesale" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('wholesale')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-wholesale" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('wholesale')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-wholesale" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('wholesale')" />
                  </div>
                </div>
              </div>

              <!-- Distributor -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">🚚 الموزعين (Distributor)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-distributor" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('distributor')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-distributor" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('distributor')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-distributor" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('distributor')" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Multi-Unit & UoM Conversion -->
          <div class="prod-form-tab-content hidden" id="content-prod-units">
            <div class="alert info mb-16">تتيح لك هذه الواجهة تحديد وحدات القياس المختلفة للصنف (مثال: الشراء بالكرتون والبيع بالحبة) مع ضبط معامل التحويل التلقائي.</div>
            <div class="grid-3 gap-16 mb-20">
              <div class="form-group">
                <label>الوحدة الأساسية (المخزنية/أصغر وحدة) *</label>
                <select id="prod-unit-base" class="input">
                  <option value="Carton">كرتون (Carton)</option>
                  <option value="Piece">حبة (Piece)</option>
                  <option value="Box">صندوق (Box)</option>
                  <option value="Bag">كيس (Bag)</option>
                  <option value="Bale">بالة (Bale)</option>
                  <option value="Barrel">برميل (Barrel)</option>
                  <option value="Pack">شد / ربطة (Pack)</option>
                  <option value="Sack">شوال (Sack)</option>
                  <option value="Tray">طبق (Tray)</option>
                  <option value="Gallon">جالون (Gallon)</option>
                  <option value="Kilogram">كيلو جرام (KG)</option>
                  <option value="Ton">طن (Ton)</option>
                  <option value="Liter">لتر (Liter)</option>
                  <option value="Gram">جرام (Gram)</option>
                  <option value="Can">علبة (Can)</option>
                  <option value="Bottle">زجاجة (Bottle)</option>
                  <option value="Meter">متر (Meter)</option>
                  <option value="Tank">تنك (Tank)</option>
                  <option value="Roll">رول (Roll)</option>
                </select>
              </div>
              <div class="form-group">
                <label>الوحدة البديلة الأولى (وحدة الشراء/التعبئة)</label>
                <select id="prod-unit-alt" class="input">
                  <option value="">بدون وحدة بديلة</option>
                  <option value="Carton">كرتون (Carton)</option>
                  <option value="Box">صندوق (Box)</option>
                  <option value="Bag">كيس (Bag)</option>
                  <option value="Bale">بالة (Bale)</option>
                  <option value="Barrel">برميل (Barrel)</option>
                  <option value="Pack">شد / ربطة (Pack)</option>
                  <option value="Sack">شوال (Sack)</option>
                  <option value="Tray">طبق (Tray)</option>
                  <option value="Gallon">جالون (Gallon)</option>
                  <option value="Ton">طن (Ton)</option>
                  <option value="Pallet">باليت (Pallet)</option>
                  <option value="Piece">حبة (Piece)</option>
                  <option value="Kilogram">كيلو جرام (KG)</option>
                  <option value="Liter">لتر (Liter)</option>
                  <option value="Gram">جرام (Gram)</option>
                  <option value="Can">علبة (Can)</option>
                  <option value="Bottle">زجاجة (Bottle)</option>
                  <option value="Meter">متر (Meter)</option>
                  <option value="Tank">تنك (Tank)</option>
                  <option value="Roll">رول (Roll)</option>
                </select>
              </div>
              <div class="form-group">
                <label>معامل التحويل (كم وحدة أساسية في البديلة)</label>
                <input type="number" id="prod-unit-conv" class="input mono" placeholder="مثال: 12 حبة في الكرتون" />
              </div>
            </div>
          </div>

          <div id="prod-form-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('product-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveProduct()" id="save-prod-btn">حفظ الصنف</button>
        </div>
      </div>
    </div>

    <!-- Enhanced Stock Ledger & Batch Card Modal -->
    <div class="modal-overlay" id="stock-modal">
      <div class="modal" id="stock-modal-card" style="max-width:98vw; width:98vw; height:95vh; max-height:95vh; display:flex; flex-direction:column; border-radius:14px; box-shadow:0 15px 40px rgba(0,0,0,0.3); transition:all 0.2s ease;">
        <div class="modal-header" style="border-bottom:none; padding:12px 20px 8px 20px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">📋</span>
            <div>
              <h3 class="modal-title" id="stock-modal-title" style="margin:0; font-size:16px; font-weight:900;">تفاصيل بطاقة الصنف</h3>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn btn-sm" onclick="window.openFullStockCardFromModal()" style="display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:11.5px; padding:5px 14px; background:linear-gradient(135deg, #0f3d19, #1e5a2a); color:#fff; border:none; border-radius:6px; cursor:pointer;" title="فتح كرت الصنف الشامل بحجم الشاشة الكاملة">
              <span>📊</span>
              <span>فتح الكرت الشامل المخصص</span>
            </button>
            <button type="button" class="btn btn-sm btn-secondary" id="stock-modal-fs-btn" onclick="window.toggleStockModalFullscreen()" style="font-size:14px; padding:4px 10px; font-weight:bold;" title="تكبير / استعادة">
              ⛶
            </button>
            <button class="modal-close" onclick="closeModal('stock-modal')" style="font-size:20px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px;">×</button>
          </div>
        </div>
        <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin: 0 20px; flex-shrink:0; gap:4px;">
          <button class="tab-btn active" id="tab-btn-balances" onclick="switchStockTab('balances')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:800; border-bottom:2.5px solid var(--brand); color:var(--brand); font-size:12.5px;">📦 أرصدة المخازن والسيارات</button>
          <button class="tab-btn" id="tab-btn-batches" onclick="switchStockTab('batches')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:800; border-bottom:2.5px solid transparent; color:var(--text-2); font-size:12.5px;">🧬 التشغيلات والتواريخ</button>
          <button class="tab-btn" id="tab-btn-card" onclick="switchStockTab('card')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:800; border-bottom:2.5px solid transparent; color:var(--text-2); font-size:12.5px;">📜 دفتر الحركة وسلسلة الإمداد</button>
        </div>
        <div class="modal-body" id="stock-modal-body" style="flex:1; display:flex; flex-direction:column; overflow:hidden; padding:0; height:100%;">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </div>
  `;const o=document.getElementById("prod-cat-filter");o&&o.addEventListener("change",()=>{Bt=o.value,C(!0)});const n=document.getElementById("prod-status-filter");n&&n.addEventListener("change",()=>{Et=n.value,C(!0)}),window.setupProductSearch();const i=sessionStorage.getItem("filter_category_id");i&&(Bt=i,sessionStorage.removeItem("filter_category_id")),await C(!0)}window.refreshProducts=()=>C(!0,!0);async function C(t=!1,e=!1){t&&(Ut=null,q=0);const o=document.getElementById("prod-tbody");if(o)try{if(!S||S.length===0){S=await A(I.categories());const f=[{id:"dairy",name:"ألبان ومنتجاتها",icon:"🥛"},{id:"oils",name:"زيوت وسمن",icon:"🌻"},{id:"rice_grains",name:"أرز وحبوب",icon:"🌾"},{id:"dry_goods",name:"سكر ودقيق ومعجنات",icon:"🍞"},{id:"beverages",name:"مشروبات وعصائر",icon:"🧃"},{id:"water",name:"مياه معبأة",icon:"💧"},{id:"meat_poultry",name:"لحوم ودواجن مجمدة",icon:"🍗"},{id:"seafood",name:"أسماك ومأكولات بحرية",icon:"🐟"},{id:"canned",name:"معلبات وصلصات",icon:"🥫"},{id:"confectionery",name:"حلويات وشوكولاتة",icon:"🍫"},{id:"biscuits",name:"بسكويت وكيك",icon:"🍪"},{id:"spices",name:"توابل وبهارات",icon:"🧂"},{id:"coffee_tea",name:"قهوة وشاي",icon:"☕"},{id:"cleaning",name:"منظفات ومعطرات",icon:"🧴"},{id:"personal_care",name:"عناية شخصية وورقيات",icon:"🧻"},{id:"baby",name:"أطفال وحفاضات",icon:"👶"},{id:"bakery",name:"مخبوزات وخبز",icon:"🥖"},{id:"frozen",name:"أغذية مجمدة",icon:"🧊"},{id:"honey_jam",name:"عسل ومربيات وطحينة",icon:"🍯"},{id:"snacks",name:"شيبس ومكسرات",icon:"🥜"},{id:"veg_fruits",name:"خضار وفواكه طازجة",icon:"🍅"},{id:"frozen_veg",name:"خضروات مجمدة",icon:"🥦"},{id:"dates",name:"تمور ومنتجاتها",icon:"🌴"},{id:"pickles",name:"مخللات وأجبان مكشوفة",icon:"🥒"},{id:"plastics",name:"بلاستيكيات ومستلزمات تغليف",icon:"🛍️"},{id:"disposables",name:"أكواب ومستلزمات ضيافة",icon:"🥤"},{id:"tobacco",name:"تبغ ومستلزمات تدخين",icon:"🚬"},{id:"egg",name:"بيض طازج",icon:"🥚"},{id:"sauces",name:"صلصات ومايونيز وتوابل سائلة",icon:"🍯"},{id:"nuts_seeds",name:"مكسرات وبذور",icon:"🌰"},{id:"ice_cream",name:"آيس كريم وحلويات باردة",icon:"🍦"}].filter(h=>!S.some(E=>E.id===h.id));if(f.length>0)try{const{writeBatch:h,doc:E}=await At(async()=>{const{writeBatch:D,doc:pt}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:D,doc:pt}},[]),ct=h(Xt);f.forEach(D=>{const pt=E(I.categories(),D.id);ct.set(pt,{name:D.name,code:D.id,icon:D.icon,description:`أصناف تابعة لقسم ${D.name}`,createdAt:new Date,updatedAt:new Date},{merge:!0})}),await ct.commit(),S=await A(I.categories())}catch(h){console.error("Auto-seed categories failed:",h)}}const n=document.getElementById("prod-cat-filter");n&&(n.innerHTML='<option value="">كل الفئات</option>'+S.map(l=>`<option value="${l.id}" ${Bt===l.id?"selected":""}>${l.name}</option>`).join(""));const i=document.getElementById("prod-category");if(i&&(i.innerHTML='<option value="">اختر الفئة...</option>'+S.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")),re().catch(()=>{}),e){const{clearERPCache:l}=await At(async()=>{const{clearERPCache:f}=await import("./index-CF9GFeRJ.js").then(h=>h.T);return{clearERPCache:f}},__vite__mapDeps([0,1]));await Promise.all([l(I.stockByWarehouse().path),l(I.products().path)])}const[s,p,g]=await Promise.all([!O||O.length===0?A(I.warehouses()).catch(()=>[]):Promise.resolve(O),A(I.products()),A(I.stockByWarehouse()).catch(()=>[])]);s&&s.length&&(O=s);let b=(p||[]).filter(l=>l&&(l.name||l.nameAr||l.sku));b.sort((l,f)=>(l.sku||"").localeCompare(f.sku||"",void 0,{numeric:!0}));const r={};(g||[]).forEach(l=>{l.productId&&(r[l.productId]=(r[l.productId]||0)+(l.qty||0))}),b.forEach(l=>{l._totalQty=r[l.id]!==void 0?r[l.id]:l.totalQty!==void 0?l.totalQty:0}),z=b;const d=document.getElementById("prod-cat-filter")?.value||Bt||"",u=document.getElementById("prod-status-filter")?.value||Et||"",y=(document.getElementById("prod-search")?.value||"").trim().toLowerCase();let P=[...z];d&&(P=P.filter(l=>l.category===d)),u&&(P=P.filter(l=>{const f=l._totalQty||0,h=l.reorderLevel||0;return u==="out"?f<=0:u==="low"?f>0&&f<=h:u==="ok"?f>h:!0})),y&&(P=P.filter(l=>l.name?.toLowerCase().includes(y)||l.sku?.toLowerCase().includes(y)||l.barcode?.includes(y)||l.nameEn?.toLowerCase().includes(y)||l.categoryName?.toLowerCase().includes(y))),R&&P.sort((l,f)=>{let h=l[R],E=f[R];if(R==="sku")h=l.sku||"",E=f.sku||"";else if(R==="name")h=l.name||"",E=f.name||"";else if(R==="category")h=l.categoryName||l.category||"",E=f.categoryName||f.category||"";else if(R==="costPrice")h=Number(l.costPrice||l.purchasePrice||0),E=Number(f.costPrice||f.purchasePrice||0);else if(R==="sellingPrice")h=Number(l.sellingPrice||l.salePrice||l.priceRetail||l.price||0),E=Number(f.sellingPrice||f.salePrice||f.priceRetail||f.price||0);else if(R==="totalQty")h=Number(l._totalQty||0),E=Number(f._totalQty||0);else if(R==="profit"){const ct=Number(l.costPrice||l.purchasePrice||0),D=Number(l.sellingPrice||l.salePrice||l.priceRetail||l.price||0),pt=D>0?(D-ct)/D*100:0,jt=Number(f.costPrice||f.purchasePrice||0),N=Number(f.sellingPrice||f.salePrice||f.priceRetail||f.price||0),Mt=N>0?(N-jt)/N*100:0;h=pt,E=Mt}return typeof h=="string"?ht?h.localeCompare(E,void 0,{numeric:!0}):E.localeCompare(h,void 0,{numeric:!0}):ht?h-E:E-h}),_t=P.length>(q+1)*Tt;const c=q*Tt,x=P.slice(c,c+Tt);let k=0,B=0,j=0,V=0,dt=0;P.forEach(l=>{const f=l._totalQty||0,h=l.averageCost||l.costPrice||l.lastPurchasePrice||l.avgCostPrice||l.purchasePrice||0,E=l.sellingPrice||l.salePrice||l.priceRetail||l.price||0;k+=f*E,B+=f*h,E>0&&(j+=(E-h)/E*100,dt++),f<(l.reorderLevel||0)&&V++});const ft=dt>0?(j/dt).toFixed(1):"0.0";it={totalValue:k,totalCost:B,avgMargin:ft,lowStockCount:V};const wt=document.getElementById("kpi-total-val"),xt=document.getElementById("kpi-total-cost"),at=document.getElementById("kpi-margin-pct"),lt=document.getElementById("kpi-low-stock");wt&&(wt.textContent=H(k)),xt&&(xt.textContent=H(B)),at&&(at.textContent=`${ft}%`),lt&&(lt.textContent=V);const Ct=document.getElementById("prod-count-label");Ct&&(Ct.textContent=`${P.length} صنف — عرض ${x.length}`),o.innerHTML=we(x);const kt=document.getElementById("page-counter");kt&&(kt.textContent=`الصفحة ${q+1} / ${Math.max(1,Math.ceil(P.length/Tt))}`);const $t=document.getElementById("prev-page-btn"),It=document.getElementById("next-page-btn");$t&&($t.disabled=q===0),It&&(It.disabled=!_t)}catch(n){console.error(n),o.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--danger);">
      ⚠️ ${n.message}
      <br><button class="btn btn-sm btn-secondary" style="margin-top:12px;" onclick="loadProducts(true)">إعادة المحاولة</button>
    </td></tr>`}}window.applySuggestedCategoryMargin=async()=>{const t=await he();if(!t.enableCategoryMargins)return;const e=document.getElementById("prod-category").value,o=parseFloat(document.getElementById("prod-purchase-price").value)||0;if(o<=0)return;const n=S.find(p=>p.id===e);if(!n)return;let i=0;if(n.velocity==="fast")i=t.marginFast??5;else if(n.velocity==="medium")i=t.marginMedium??10;else if(n.velocity==="slow")i=t.marginSlow??15;else return;const s=Math.round(o*(1+i/100)*100)/100;document.getElementById("prod-price-retail").value=s};window.onCategoryChange=async()=>{if(await applySuggestedCategoryMargin(),!!document.getElementById("prod-edit-id").value)return;const e=document.getElementById("prod-category").value;if(!e)return;const o=document.getElementById("prod-sku");if(!o)return;let i={dairy:"01",oils:"02",rice_grains:"03",dry_goods:"04",beverages:"05",water:"06",meat_poultry:"07",seafood:"08",canned:"09",confectionery:"10",biscuits:"11",spices:"12",coffee_tea:"13",cleaning:"14",personal_care:"15",baby:"16",bakery:"17",frozen:"18",honey_jam:"19",snacks:"20"}[e];if(!i){const r=S.findIndex(d=>d.id===e);i=String(r>=0?21+r:99)}const s=z.map(r=>String(r.sku||"")).filter(r=>r.startsWith(i));let p=0;s.forEach(r=>{const d=r.slice(i.length),u=parseInt(d,10);!isNaN(u)&&u>p&&(p=u)});const g=p+1,b=i+String(g).padStart(3,"0");o.value=b};let nt=null,bt=null;window.inlineEditPrice=(t,e,o,n)=>{if(t.querySelector("input"))return;bt&&bt();const i=t.innerHTML,s=document.createElement("input");s.type="number",s.step="0.01",s.min="0",s.value=n,s.style.cssText=["width:90px","height:26px","padding:3px 7px","font-size:12px","font-family:var(--font-mono,monospace)","font-weight:700","border:2px solid var(--brand)","border-radius:6px","background:var(--bg-1,#fff)","color:var(--text-1,#1e293b)","outline:none","box-shadow:0 0 0 3px rgba(91,127,255,.15)","text-align:left","display:block","box-sizing:border-box"].join(";"),t.innerHTML="",t.style.padding="4px 8px",t.appendChild(s),s.focus(),s.select(),nt=t,bt=g;let p=!1;function g(){p||(p=!0,t.style.padding="",t.innerHTML=i,nt===t&&(nt=null,bt=null))}const b=async()=>{if(p)return;p=!0;const r=parseFloat(s.value);if(isNaN(r)||r<0){t.style.padding="",t.innerHTML=i,nt===t&&(nt=null,bt=null);return}if(r===n){t.style.padding="",t.innerHTML=i,nt===t&&(nt=null,bt=null);return}t.style.padding="",t.innerHTML='<div class="loading-spinner sm"></div>',nt===t&&(nt=null,bt=null);try{const d={};o==="salePrice"||o==="sellingPrice"||o==="priceRetail"?(d.salePrice=r,d.sellingPrice=r,d.priceRetail=r):o==="costPrice"||o==="purchasePrice"?(d.costPrice=r,d.purchasePrice=r,d.averageCost=r):d[o]=r,await Vt("products",e,d);const u=z.find(y=>y.id===e);u&&Object.assign(u,d),showToast("✅ تم تحديث السعر بنجاح","success"),await C()}catch(d){showToast("❌ "+d.message,"error"),t.innerHTML=i}};s.addEventListener("blur",()=>b()),s.addEventListener("keydown",r=>{r.key==="Enter"&&s.blur(),r.key==="Escape"&&(p=!0,g())})};window.switchProdFormTab=t=>{["basic","inventory","pricing","units"].forEach(i=>{const s=document.getElementById(`prod-tab-${i}`);s&&(s.classList.remove("active"),s.style.borderBottomColor="transparent",s.style.color="var(--text-2)");const p=document.getElementById(`content-prod-${i}`);p&&p.classList.add("hidden")});const o=document.getElementById(`prod-tab-${t}`);o&&(o.classList.add("active"),o.style.borderBottomColor="var(--brand)",o.style.color="var(--brand)");const n=document.getElementById(`content-prod-${t}`);n&&n.classList.remove("hidden")};window.toggleTrackingFields=()=>{const t=document.getElementById("prod-tracking")?.value,e=document.getElementById("prod-shelf-life");e&&(t==="batch"?(e.disabled=!1,e.parentElement.classList.remove("disabled")):(e.disabled=!0,e.value="",e.parentElement.classList.add("disabled")))};window.openProductModal=async(t=null)=>{switchProdFormTab("basic"),document.getElementById("prod-edit-id").value=t?.id||"",document.getElementById("prod-modal-title").textContent=t?"تعديل بطاقة الصنف":"إضافة صنف جديد";const e=document.getElementById("prod-category");e&&e.options.length<=1&&S&&S.length>0&&(e.innerHTML='<option value="">اختر الفئة...</option>'+S.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")),!tt||tt.length===0?await re():de(t?.supplierId||"");const o=document.getElementById("prod-supplier");if(document.getElementById("prod-sku").value=t?.sku||"",document.getElementById("prod-name-ar").value=t?.name||t?.nameAr||"",document.getElementById("prod-name-en").value=t?.nameEn||"",e&&(e.value=t?.category||""),o&&(o.value=t?.supplierId||"",t?.supplierId&&o.value!==t.supplierId)){const r=document.createElement("option");r.value=t.supplierId,r.textContent=t.supplierName||`مورد (${t.supplierId})`,o.appendChild(r),o.value=t.supplierId}document.getElementById("prod-origin").value=t?.country||"",document.getElementById("prod-barcode").value=t?.barcode||"",document.getElementById("prod-barcodes-alt").value=(t?.alternativeBarcodes||[]).join(", "),document.getElementById("prod-hs-code").value=t?.hsCode||"",document.getElementById("prod-desc").value=t?.description||"",document.getElementById("prod-tracking").value=t?.tracking||"none",document.getElementById("prod-shelf-life").value=t?.shelfLife||"",document.getElementById("prod-temp").value=t?.storageTemperature||"dry",document.getElementById("prod-min").value=t?.minimumQuantity||"",document.getElementById("prod-max").value=t?.maximumQuantity||"",document.getElementById("prod-reorder").value=t?.reorderLevel||"",document.getElementById("prod-safety").value=t?.safetyStock||"",document.getElementById("prod-eoq").value=t?.economicOrderQuantity||"",document.getElementById("prod-lead-time").value=t?.leadTime||"",document.getElementById("prod-zatca-tax").value=t?.taxCategory||"S",document.getElementById("prod-valuation").value=t?.valuationMethod||"moving_average",document.getElementById("prod-purchase-price").value=t?.costPrice||t?.purchasePrice||"",document.getElementById("prod-std-cost").value=t?.standardCost||"",document.getElementById("prod-target-margin-pct").value=t?.targetMarginPct!==void 0&&t?.targetMarginPct!==null?t.targetMarginPct:"",document.getElementById("prod-margin-type").value=t?.marginType||"markup";const n=document.getElementById("prod-last-purchase-display");n&&(t?.lastPurchasePrice!==void 0&&t?.lastPurchasePrice!==null&&t?.lastPurchasePrice>0?n.textContent=`${H(t.lastPurchasePrice)} ${t.lastPurchaseDate?`(تاريخ: ${t.lastPurchaseDate})`:""}`:n.textContent="لا يوجد فواتير شراء مسجلة بعد"),window._currentEditingProduct=t;const i=parseFloat(t?.costPrice||t?.purchasePrice)||0,p=(t?.taxCategory||"S")==="S"?1.15:1;document.getElementById("prod-price-retail").value=t?.salePrice||t?.priceRetail||"",document.getElementById("prod-price-wholesale").value=t?.priceWholesale||"",document.getElementById("prod-price-distributor").value=t?.priceDistributor||"",["retail","wholesale","distributor"].forEach(r=>{const d=parseFloat(r==="retail"?t?.salePrice||t?.priceRetail:r==="wholesale"?t?.priceWholesale:t?.priceDistributor)||0,u=document.getElementById(`prod-price-inc-${r}`);u&&(u.value=d>0?(d*p).toFixed(2):"");const y=document.getElementById(`prod-pct-${r}`);y&&(i>0&&d>0?y.value=((d-i)/i*100).toFixed(1):y.value="")});const g=document.getElementById("prod-zatca-tax");g&&!g._changeListenerAttached&&(g.addEventListener("change",()=>{["retail","wholesale","distributor"].forEach(r=>{const d=document.getElementById(`prod-price-${r}`);d&&d.value!==""&&window.onPriceInput(r)})}),g._changeListenerAttached=!0),document.getElementById("prod-unit-base").value=t?.unit||"Piece",document.getElementById("prod-unit-alt").value=t?.altUnit||"",document.getElementById("prod-unit-conv").value=t?.unitFactor||"";const b=document.getElementById("prod-locations-tbody");b&&(b.innerHTML=O.map(r=>{const d=t?.locationsByWarehouse?.[r.id]||"";return`
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>
            <input type="text" class="input sm sc-wh-loc-input" data-wh-id="${r.id}" value="${d}" placeholder="مثال: الرف A-12" style="padding:4px 8px; font-size:12px; margin:0;" />
          </td>
        </tr>
      `}).join("")),document.getElementById("prod-form-error").classList.add("hidden"),openModal("product-modal")};window.editProduct=t=>{const e=z.find(o=>o.id===t);e?openProductModal(e):At(()=>import("./index-CF9GFeRJ.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const n=await o("products",t);n&&openProductModal(n)}catch(n){showToast(n.message,"error")}})};window.saveProduct=async()=>{const t=document.getElementById("prod-form-error");t.classList.add("hidden");const e=document.getElementById("prod-edit-id").value,o=document.getElementById("prod-sku").value.trim().toUpperCase(),n=document.getElementById("prod-name-ar").value.trim(),i=parseFloat(document.getElementById("prod-price-retail").value)||0;if(!o||!n){t.textContent="يرجى تعبئة الكود والاسم العربي",t.classList.remove("hidden");return}if(!i){t.textContent="يرجى تعبئة سعر التجزئة الأساسي",t.classList.remove("hidden");return}const s=document.getElementById("prod-category").value,p=S.find(c=>c.id===s),g=document.getElementById("prod-supplier")?.value||"",b=(tt||[]).find(c=>c.id===g),r={};document.querySelectorAll(".sc-wh-loc-input").forEach(c=>{const x=c.dataset.whId,k=c.value.trim();k&&(r[x]=k)});const d=parseFloat(document.getElementById("prod-target-margin-pct").value),u=document.getElementById("prod-margin-type").value||"markup",y={sku:o,name:n,nameAr:n,nameEn:document.getElementById("prod-name-en").value.trim(),category:s,categoryName:p?.name||"",supplierId:g,supplierName:b?.name||"",country:document.getElementById("prod-origin").value.trim(),barcode:document.getElementById("prod-barcode").value.trim(),alternativeBarcodes:document.getElementById("prod-barcodes-alt").value.split(",").map(c=>c.trim()).filter(Boolean),hsCode:document.getElementById("prod-hs-code").value.trim(),description:document.getElementById("prod-desc").value.trim(),tracking:document.getElementById("prod-tracking").value,shelfLife:parseInt(document.getElementById("prod-shelf-life").value)||null,storageTemperature:document.getElementById("prod-temp").value,locationsByWarehouse:r,minimumQuantity:parseInt(document.getElementById("prod-min").value)||0,maximumQuantity:parseInt(document.getElementById("prod-max").value)||0,reorderLevel:parseInt(document.getElementById("prod-reorder").value)||0,safetyStock:parseInt(document.getElementById("prod-safety").value)||0,economicOrderQuantity:parseInt(document.getElementById("prod-eoq").value)||0,leadTime:parseInt(document.getElementById("prod-lead-time").value)||0,taxCategory:document.getElementById("prod-zatca-tax").value,valuationMethod:document.getElementById("prod-valuation").value,costPrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,purchasePrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,standardCost:parseFloat(document.getElementById("prod-std-cost").value)||0,targetMarginPct:isNaN(d)?null:d,marginType:u,salePrice:i,sellingPrice:i,priceRetail:i,priceWholesale:parseFloat(document.getElementById("prod-price-wholesale").value)||0,priceDistributor:parseFloat(document.getElementById("prod-price-distributor").value)||0,unit:document.getElementById("prod-unit-base").value,altUnit:document.getElementById("prod-unit-alt").value,unitFactor:parseInt(document.getElementById("prod-unit-conv").value)||1,searchTokens:ge(n+" "+o)},P=document.getElementById("save-prod-btn");P.disabled=!0;try{e?(await Vt("products",e,y),showToast("تم تحديث بطاقة الصنف بنجاح","success")):(await oe(I.products(),y),showToast("تم إضافة الصنف بنجاح","success")),closeModal("product-modal"),z=[],await C(!0)}catch(c){t.textContent=c.message,t.classList.remove("hidden")}finally{P.disabled=!1}};window.deleteProduct=async(t,e=null)=>{if(!e){const o=z.find(n=>n.id===t);e=o&&(o.name||o.nameAr)||""}try{const o=Qt(I.stockTransactions(),qt("productId","==",t),Pt(1));if(!(await Ot(o)).empty){const i=document.createElement("div");i.className="modal-overlay active",i.id="del-guard-overlay",i.innerHTML=`
        <div class="modal" style="max-width:480px;">
          <div class="modal-header" style="background:rgba(239,68,68,0.08);border-bottom:1px solid rgba(239,68,68,0.2);">
            <h3 class="modal-title" style="color:var(--danger);">⛔ لا يمكن حذف الصنف</h3>
            <button class="modal-close" onclick="document.getElementById('del-guard-overlay').remove()">×</button>
          </div>
          <div class="modal-body" style="padding:24px;">
            <p style="font-size:15px;margin-bottom:12px;">الصنف <strong>"${e}"</strong> لديه حركات مخزنية مسجلة (فواتير شراء / بيع / تسويات).</p>
            <div class="alert" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px;margin-bottom:16px;color:var(--text-1);">
              <strong>⚠️ لحماية سلامة البيانات المحاسبية</strong>، لا يُسمح بحذف صنف له تاريخ حركات.<br/>
              <span style="font-size:12px;opacity:0.8;">يمكنك بدلاً من ذلك تعطيل الصنف لمنع استخدامه في الفواتير الجديدة.</span>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button class="btn btn-secondary" onclick="document.getElementById('del-guard-overlay').remove()">إغلاق</button>
              <button class="btn" style="background:rgba(239,68,68,0.15);color:var(--danger);border:1px solid rgba(239,68,68,0.3);"
                onclick="_forceDeleteProduct('${t}', '${e.replace(/'/g,"\\'")}')">حذف قسري مع العلم بالمخاطر</button>
            </div>
          </div>
        </div>`,document.body.appendChild(i);return}}catch(o){console.warn("Safety check failed, proceeding with confirmation:",o)}if(confirm(`هل تريد حذف الصنف "${e}"؟
لا توجد حركات مسجلة لهذا الصنف.`))try{await ne("products",t),showToast("تم حذف الصنف بنجاح","success"),z=[],await C(!0)}catch(o){showToast(o.message,"error")}};window._forceDeleteProduct=async(t,e)=>{const o=document.getElementById("del-guard-overlay");if(o&&o.remove(),confirm(`⚠️ تأكيد الحذف القسري للصنف "${e}"؟
ستبقى الحركات التاريخية ولكن الصنف لن يظهر في القوائم.`))try{await ne("products",t),showToast(`تم حذف الصنف "${e}" قسرياً`,"success"),z=[],await C(!0)}catch(n){showToast(n.message,"error")}};window.loadProducts=C;let G=null,yt=null,et=[],zt=[],St=[],W=new Map,X=new Map,Q=[],Ft="desc",K="all";function Rt(t,e=""){if(!t)return!1;const o=O.find(s=>s.id===t),n=(o?.name||e||"").toLowerCase(),i=(o?.type||"").toLowerCase();return i==="vehicle"||i==="distribution"||/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(n)}function Yt(t,e=""){if(!t)return!0;const o=O.find(s=>s.id===t),n=(o?.name||e||"").toLowerCase();return(o?.type||"").toLowerCase()==="main"||/رئيسي|رئيسى|main/i.test(n)||t==="W5uANJjMgfFh2p3xU4bT"}window.switchStockTab=async t=>{const e=document.getElementById("tab-btn-balances"),o=document.getElementById("tab-btn-batches"),n=document.getElementById("tab-btn-card"),i=document.getElementById("stock-modal-body");if(!e||!o||!n)return;[e,o,n].forEach(p=>{p.classList.remove("active"),p.style.borderBottomColor="transparent",p.style.color="var(--text-2)"});const s=document.getElementById(`tab-btn-${t}`);s.classList.add("active"),s.style.borderBottomColor="var(--brand)",s.style.color="var(--brand)",i.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>';try{if(t==="balances")le();else if(t==="batches"){if(!St.length){const p=Qt(I.stockTransactions(),qt("productId","==",G)),b=(await Ot(p)).docs.map(d=>d.data()),r={};b.forEach(d=>{d.batchNumber&&(r[d.batchNumber]||(r[d.batchNumber]={qty:0,expiryDate:d.expiryDate,prodDate:d.productionDate}),r[d.batchNumber].qty+=d.qtyChange||0)}),St=Object.keys(r).map(d=>({number:d,...r[d]})).filter(d=>d.qty>0)}ke()}else{if(!zt.length){const[p,g,b,r,d]=await Promise.all([Ot(Qt(I.stockTransactions(),qt("productId","==",G),Pt(200))),A(I.salesInvoices?I.salesInvoices():"salesInvoices",[vt("date","desc"),Pt(100)]).catch(()=>[]),A(I.purchaseInvoices?I.purchaseInvoices():"purchaseInvoices",[vt("date","desc"),Pt(100)]).catch(()=>[]),A(I.stockTransfers?I.stockTransfers():"stockTransfers",[vt("date","desc"),Pt(100)]).catch(()=>[]),ie(G).catch(()=>[])]);et=d||[],W=new Map,X=new Map,(Array.isArray(g)?g:g.docs?g.docs.map(c=>({id:c.id,...c.data()})):[]).forEach(c=>{const x=c.customerName||c.clientName||"عميل نقدي",k=c.invoiceNumber||c.number||c.code,B={type:"sale",party:x,rep:c.repName||"",status:c.status,id:c.id,date:c.date};k&&(W.set(k,x),X.set(k,B)),c.id&&(W.set(c.id,x),X.set(c.id,B))}),(Array.isArray(b)?b:b.docs?b.docs.map(c=>({id:c.id,...c.data()})):[]).forEach(c=>{const x=c.supplierName||c.vendorName||"مورد معتمد",k=c.invoiceNumber||c.number||c.code,B={type:"purchase",party:x,status:c.status,id:c.id,date:c.date};k&&(W.set(k,x),X.set(k,B)),c.id&&(W.set(c.id,x),X.set(c.id,B))}),(Array.isArray(r)?r:r.docs?r.docs.map(c=>({id:c.id,...c.data()})):[]).forEach(c=>{const x=c.number||c.code||c.transferNumber,k=c.fromWarehouseName||"المستودع الرئيسي",B=c.toWarehouseName||"المستودع",j=`${k} ⬅️ ${B}`,V={type:"transfer",party:j,fromN:k,toN:B,status:c.status,id:c.id,date:c.date};x&&(W.set(x,j),X.set(x,V)),c.id&&(W.set(c.id,j),X.set(c.id,V))}),zt=p.docs.map(c=>{const x=c.data(),k=x.documentNumber||x.docNum||x.docNo||x.refNo||x.refCode||x.invoiceNumber||x.number||x.notes?.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i)?.[0]||"",B=x.customerName||x.supplierName||W.get(k)||W.get(c.id)||"";return{id:c.id,...x,docNum:k,partyName:B}})}Wt()}}catch(p){i.innerHTML=`<div class="alert bad">${p.message}</div>`}};function le(){const t=document.getElementById("stock-modal-body"),e={};O.forEach(i=>e[i.id]=i.name);const n=z.find(i=>i.id===G)?.locationsByWarehouse||{};et.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">📦</div><p>لا يوجد رصيد في أي مخزن</p></div>':t.innerHTML=`
      <div style="flex:1; overflow-y:auto; padding:16px;">
        <table class="data-dense" style="width:100%;">
          <thead><tr><th>المخزن / موقع الرف</th><th>الكمية المتوفرة</th><th>حد الطلب</th><th>الحالة</th></tr></thead>
          <tbody>
            ${et.map(i=>{const s=e[i.warehouseId]||i.warehouseId,p=n[i.warehouseId]||"",g=p?`<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الرف/الموقع: ${p}</span>`:'<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الموقع غير محدد</span>';return te(i.qty,i.reorderLevel||0),`<tr>
                <td><strong>${s}</strong>${g}</td>
                <td class="mono font-bold">${v(i.qty)}</td>
                <td class="mono dim">${i.reorderLevel||0}</td>
                <td>${ee(i.qty,i.reorderLevel)}</td>
              </tr>`}).join("")}
            <tr style="border-top:2px solid var(--border);">
              <td class="font-bold">الإجمالي</td>
              <td class="mono font-bold text-indigo">${v(et.reduce((i,s)=>i+s.qty,0))}</td>
              <td></td><td></td>
            </tr>
          </tbody>
        </table>
      </div>`}function ke(){const t=document.getElementById("stock-modal-body");St.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">🧬</div><p>لا توجد تشغيلات (Batches) فعالة أو منتهية الصلاحية مسجلة</p></div>':t.innerHTML=`
      <div style="flex:1; overflow-y:auto; padding:16px;">
        <table class="data-dense" style="width:100%;">
          <thead><tr><th>رقم التشغيلة</th><th>تاريخ الإنتاج</th><th>تاريخ الانتهاء</th><th>الكمية المتبقية</th><th>الحالة</th></tr></thead>
          <tbody>
            ${St.map(e=>{const o=e.expiryDate&&new Date(e.expiryDate)<new Date;return`
                <tr>
                  <td class="mono font-bold">${e.number}</td>
                  <td class="dim">${e.prodDate||"—"}</td>
                  <td class="mono ${o?"text-bad font-bold":""}">${e.expiryDate||"—"}</td>
                  <td class="mono font-bold">${v(e.qty)}</td>
                  <td>${o?'<span class="badge bad">منتهية الصلاحية</span>':'<span class="badge good">صالحة</span>'}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>`}function Wt(t,e,o,n,i=!1){const s=document.getElementById("stock-modal-body"),p={};O.forEach(a=>p[a.id]=a.name);const b=(z.find(a=>a.id===G)||{}).unit||"كرتون",r={purchase_invoice:"فاتورة شراء",purchase_in:"فاتورة شراء",sales_invoice:"فاتورة بيع",sale_out:"فاتورة بيع",sale_out_edit:"فاتورة بيع (معدلة)",transfer_out:"تحويل صادر",transfer_in:"تحويل وارد",sales_return:"مرتجع مبيعات",return_in:"مرتجع مبيعات",purchase_return:"مرتجع مشتريات",return_out:"مرتجع مشتريات",purchase_reverse:"🔁 تسوية تعديل شراء",sale_reverse_edit:"🔄 عكس قيد (تعديل فاتورة)",reverse_edit:"🔄 عكس قيد (تعديل فاتورة)",adjustment:"تسوية مخزنية",damage:"إهلاك تالف",donation:"تبرعات وهبات",expired:"إعدام صلاحية","return-damaged":"مرتجع تالف للمورد",assembly:"تجميع",disassembly:"تفكيك","spot-count":"جرد مفاجئ","spot-count-reversal":"إلغاء جرد مفاجئ",adjustment_in:"تسوية إضافة",adjustment_out:"تسوية خصم",adjustment_delete:"إلغاء تسوية",adjustment_reverse:"تعديل تسوية",opening:"رصيد افتتاحي",sale_cancel:"تعديل مبيعات"},d={purchase_invoice:"🛒",purchase_in:"🛒",sales_invoice:"💰",sale_out:"💰",sale_out_edit:"💰",transfer_in:"📥",transfer_out:"📤",sales_return:"↩️",return_in:"↩️",purchase_return:"↩️",return_out:"↩️",purchase_reverse:"🔁",sale_reverse_edit:"🔄",reverse_edit:"🔄",adjustment:"⚖️",adjustment_in:"➕",adjustment_out:"➖",damage:"💔",expired:"🗑️","spot-count":"🔢","return-damaged":"↩️",assembly:"🔧",disassembly:"🔩",donation:"🎁",opening:"🏁",sale_cancel:"📝"};let u=0;const y=(et||[]).map(a=>{const m=parseFloat(a.qty)||0;u+=m;const $=O.find(w=>w.id===a.warehouseId)||{name:a.warehouseName||a.warehouseId,type:"Main"},M=$.type==="Vehicle"||$.type==="Distribution"||$.name&&($.name.includes("سيارة")||$.name.includes("مندوب")),T=m>0?M?"#2563EB":"#059669":"#64748B";return`
      <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:var(--bg-card, #fff); border:1px solid var(--border-soft); border-radius:20px; font-size:11.5px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <span>${M?"🚐":"🏢"}</span>
        <span>${$.name}:</span>
        <b class="mono" style="color:${T}; font-weight:800;">${v(m)} ${b}</b>
      </span>
    `}).join("")||'<span class="dim" style="font-size:11px;">لا توجد أرصدة مسجلة بالمستودعات</span>',P=O.map(a=>`<option value="${a.id}" ${n===a.id?"selected":""}>${a.name}</option>`).join(""),c=`
    <!-- Live Warehouse Distribution Banner -->
    <div style="padding:10px 18px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:16px;">📍</span>
          <b style="font-size:12.5px; color:var(--text-0);">الأرصدة اللحظية المتوفرة بالمستودعات والسيارات:</b>
        </div>
        <div style="font-size:12.5px; font-weight:800; color:var(--brand);">
          📦 إجمالي رصيد المؤسسة: <span class="mono" style="font-size:14px;">${v(u)}</span> ${b}
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${y}
      </div>
    </div>

    <!-- Filter Bar Inputs -->
    <div id="ledger-filter-bar" style="
      display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;
      padding:12px 18px;
      background:linear-gradient(135deg, var(--bg-2) 0%, var(--bg-1) 100%);
      border-bottom:1px solid var(--border-soft);
    ">
      <!-- Date From -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">📅 من تاريخ</label>
        <input type="date" id="ledger-from" class="input" style="padding:5px 8px;font-size:11.5px;width:130px;border-radius:6px;" value="${t||""}" />
      </div>

      <!-- Date To -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">📅 إلى تاريخ</label>
        <input type="date" id="ledger-to" class="input" style="padding:5px 8px;font-size:11.5px;width:130px;border-radius:6px;" value="${e||""}" />
      </div>

      <!-- Warehouse -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">🏭 المستودع / السيارة</label>
        <select id="ledger-warehouse" class="input" style="padding:5px 8px;font-size:11.5px;min-width:160px;border-radius:6px;">
          <option value="">🏢 كل المستودعات والسيارات</option>
          ${P}
        </select>
      </div>

      <!-- Movement Type -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">🔄 نوع الحركة</label>
        <select id="ledger-type" class="input" style="padding:5px 8px;font-size:11.5px;min-width:145px;border-radius:6px;">
          <option value="">كل الحركات</option>
          <option value="purchase_invoice" ${o==="purchase_invoice"?"selected":""}>🛒 مشتريات واردة</option>
          <option value="sales_invoice" ${o==="sales_invoice"?"selected":""}>💰 مبيعات صادرة</option>
          <option value="transfer_in" ${o==="transfer_in"?"selected":""}>📥 تحويلات واردة</option>
          <option value="transfer_out" ${o==="transfer_out"?"selected":""}>📤 تحويلات صادرة</option>
          <option value="adjustment" ${o==="adjustment"?"selected":""}>⚖️ تسويات جردية</option>
        </select>
      </div>

      <!-- Live Search Box -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">🔍 بحث فوري (عميل / مستند / بيان)</label>
        <div style="position:relative; display:flex; align-items:center;">
          <input type="text" id="modal-ledger-search" class="input" placeholder="اكتب اسم العميل أو الفاتورة..." style="padding:5px 8px; font-size:11.5px; width:200px; border-radius:6px;" oninput="window.filterModalTableRows(this.value)" />
          <span id="modal-ledger-search-count" style="display:none; position:absolute; left:6px; font-size:10px; font-weight:800; color:var(--brand); background:rgba(16,185,129,0.15); padding:1px 5px; border-radius:4px;"></span>
        </div>
      </div>

      <!-- Sorting Toggle -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">↕️ الترتيب</label>
        <div style="display:flex;gap:4px;">
          <button type="button" class="btn btn-sm ${Ft==="desc"?"btn-primary":"btn-secondary"}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('desc')" title="عرض أحدث العمليات في البداية">⬆️ الأحدث</button>
          <button type="button" class="btn btn-sm ${Ft==="asc"?"btn-primary":"btn-secondary"}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('asc')" title="عرض تسلسلي دفتري من البداية">⬇️ الأقدم</button>
        </div>
      </div>

      <!-- Simplified Checkbox -->
      <div style="display:inline-flex; align-items:center; gap:6px; padding-bottom:5px;">
        <input type="checkbox" id="ledger-simplified" style="width:16px; height:16px; cursor:pointer;" ${i?"checked":""} onchange="_applyLedgerFilters()" />
        <label for="ledger-simplified" style="font-size:11px; font-weight:700; color:var(--text-1); cursor:pointer;">📊 تحميل وبيع فقط</label>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:6px;align-items:flex-end;margin-right:auto;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" style="padding:6px 14px;font-size:11.5px;border-radius:6px;font-weight:700;" onclick="_applyLedgerFilters()">🔍 تطبيق</button>
        <button class="btn btn-secondary btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;" onclick="_resetLedgerFilters()">↺ إعادة</button>
        <button type="button" class="btn btn-sm btn-secondary" id="btn-toggle-summary" onclick="window.toggleModalSummaryVisibility()" style="padding:6px 11px; font-size:11.5px; border-radius:6px; font-weight:700;" title="إخفاء أو إظهار لوحة التحليل لتوسيع مساحة الجدول">👁️ طي التحليل</button>
        <button class="btn btn-sm" style="padding:6px 12px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="window.printCustodyReconciliationFromProductModal()" title="طباعة محضر مطابقة وجرد رسمي للسيارة أو المستودع">📋 محضر العهدة</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerExcel()">📊 Excel</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerPdf()">📄 PDF</button>
      </div>
    </div>

    <!-- Smart Path Quick Filter Pills Sub-bar -->
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 18px; background:var(--bg-1); border-bottom:1px solid var(--border-soft);">
      <span style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:4px;">
        <span>🎯</span>
        <span>تتبع مسار الصنف:</span>
      </span>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm ${K==="all"?"btn-primary":"btn-secondary"}" style="padding:4px 10px; font-size:11px; border-radius:15px; font-weight:700;" onclick="window.setModalPathFilter('all')">🌐 الدورة الشاملة (الكل)</button>
        <button type="button" class="btn btn-sm ${K==="main"?"btn-primary":"btn-secondary"}" style="padding:4px 10px; font-size:11px; border-radius:15px; font-weight:700;" onclick="window.setModalPathFilter('main')">🏢 المستودع الرئيسي فقط</button>
        <button type="button" class="btn btn-sm ${K==="transfers"?"btn-primary":"btn-secondary"}" style="padding:4px 10px; font-size:11px; border-radius:15px; font-weight:700;" onclick="window.setModalPathFilter('transfers')">🔄 شحنات تحويلات السيارات</button>
        <button type="button" class="btn btn-sm ${K==="van_sales"?"btn-primary":"btn-secondary"}" style="padding:4px 10px; font-size:11px; border-radius:15px; font-weight:700;" onclick="window.setModalPathFilter('van_sales')">🚐 مبيعات سيارات المناديب</button>
        <button type="button" class="btn btn-sm ${K==="clean"?"btn-primary":"btn-secondary"}" style="padding:4px 10px; font-size:11px; border-radius:15px; font-weight:700;" onclick="window.setModalPathFilter('clean')">✨ فواتير المبيعات الصافية</button>
      </div>
    </div>`,x=a=>{if(a.date)return String(a.date).slice(0,10);let m=a.createdAt?.seconds||a.createdAt?._seconds;return m?new Date(m*1e3).toISOString().slice(0,10):a.createdAt?.toDate?a.createdAt.toDate().toISOString().slice(0,10):typeof a.createdAt=="string"?a.createdAt.slice(0,10):"2026-08-01"},k=(a,m=0)=>a==="opening"?0:a==="purchase_in"||a==="purchase_invoice"?1:a==="sale_reverse_edit"||a==="reverse_edit"||a==="sales_return"||a==="return_in"||a==="sale_cancel"||a==="cancel_sale"?2:a==="transfer_in"||a==="adjustment_in"?3:a==="sale_out"||a==="sales_invoice"||a==="pos_sale"||a==="pos_out"||a==="delivery_note"?4:a==="transfer_out"?5:a==="adjustment_out"||a==="damage"||a==="expired"?6:Number(m)>0?2:4;let B=[...zt].sort((a,m)=>{const $=x(a),M=x(m);if($!==M)return $.localeCompare(M);const T=a.createdAt?.seconds||a.createdAt?._seconds||(a.createdAt?.toMillis?a.createdAt.toMillis()/1e3:0),w=m.createdAt?.seconds||m.createdAt?._seconds||(m.createdAt?.toMillis?m.createdAt.toMillis()/1e3:0);if(T!==w)return T-w;const L=k(a.type,a.qtyChange)-k(m.type,m.qtyChange);if(L!==0)return L;const Z=a.createdAt?.nanoseconds||a.createdAt?._nanoseconds||0,J=m.createdAt?.nanoseconds||m.createdAt?._nanoseconds||0;if(Z!==J)return Z-J;const st=parseFloat(a.qtyChange||a.qtyDelta||0);return parseFloat(m.qtyChange||m.qtyDelta||0)-st});const j={};O.forEach(a=>{j[a.id]=0});let V=0,dt=0,ft=0,wt=0;const xt=[];for(let a=0;a<B.length;a++){const m=B[a],$=m.warehouseId||"main",M=x(m),T=t&&M<t,w=m.type||"",L=["purchase_invoice","purchase_in","purchase_return","sales_return","return_in","purchase_reverse"].includes(w),Z=["sales_invoice","sale_out","delivery_note","pos_sale","pos_out","sale_cancel","cancel_sale","sale_reverse_edit","reverse_edit"].includes(w),J=["transfer_out","transfer_in","transfer_cancel"].includes(w),st=["adjustment","damage","assembly","disassembly","opening","adjustment_in","adjustment_out","spot-count"].includes(w);let U=m.docNum||m.documentNumber||m.refNo||m.refCode||m.invoiceNumber||m.number||"";if(!U&&m.notes){const rt=m.notes.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i);rt&&(U=rt[0])}U||(U="—");let F=m.partyName||W.get(U)||W.get(m.id)||"";!F&&J&&(F="🔄 تحويل بين المخازن");let _=m.qtyChange;if(_==null||isNaN(_)){const rt=Number(m.qty||m.quantity||m.qtyIn||m.qtyOut||0);_=w==="sale_out"||w==="sales_invoice"||w==="transfer_out"||w==="adjustment_out"||w==="damage"||w==="expired"?-Math.abs(rt):Math.abs(rt)}else _=Number(_);const Gt=w==="purchase_reverse"&&(String(m.notes||"").includes("حذف فاتورة الشراء")||String(m.notes||"").includes("تعديل")||String(m.notes||"").includes("عكس"));let ot=!1;if(Gt){const rt=X.get(U)||X.get(m.refId)||X.get(m.sourceId);rt&&rt.status!=="cancelled"&&(ot=!0,_=0)}j[$]=(j[$]||0)+_,J||(V+=_);const ut=n?j[n]||0:V;if(T){(!n||n===$)&&(wt=ut);continue}if(e&&M>e||n&&$!==n||i&&!J&&!Z)continue;let mt=0,gt=0;if(ot?(mt=0,gt=0):(mt=_>0?_:0,gt=_<0?Math.abs(_):0),n?(mt&&(dt+=mt),gt&&(ft+=gt)):J||(mt&&(dt+=mt),gt&&(ft+=gt)),o==="sales_invoice"&&!Z||o==="purchase_invoice"&&!L||o==="transfer_in"&&w!=="transfer_in"||o==="transfer_out"&&w!=="transfer_out"||o==="adjustment"&&!st)continue;const Dt=p[$]||$,Zt=Rt($,Dt),Jt=Yt($,Dt),pe=Z&&Zt,ue=Z&&Jt,me=!ot&&!["sale_reverse_edit","reverse_edit","purchase_reverse","sale_cancel"].includes(w);xt.push({...m,dateStr:M,documentNumber:U,partyName:F,whName:Dt,inQty:mt,outQty:gt,qtyChange:_,balanceAfter:ut,whBalance:j[$],companyBalance:V,isIgnoredReversal:ot,isPur:L,isSale:Z,isTrans:J,isAdj:st,isWhVehicle:Zt,isWhMain:Jt,isVanSale:pe,isMainSale:ue,isCleanCommercial:me})}const at=n?parseFloat(et.find(a=>a.warehouseId===n)?.qty||0):u,lt=n?j[n]||0:V,Ct=Math.abs(lt-at)<.001;Q=xt;let kt=0,$t=0,It=0,l=0,f=0,h=0;B.forEach(a=>{const m=a.warehouseId,$=Yt(m),M=Rt(m),T=a.type||"",w=parseFloat(a.qtyChange||0);if(T!=="purchase_reverse"){if((T==="purchase_invoice"||T==="purchase_in")&&w>0&&(kt+=w,$t++),["sales_invoice","sale_out","delivery_note","pos_sale"].includes(T)&&w<0){const L=Math.abs(w);$?It+=L:M&&(f+=L)}if(T==="transfer_out"){const L=Math.abs(w);$&&(l+=L)}else T==="transfer_in"&&($||M&&(h+=w))}});let E=0,ct=0;(et||[]).forEach(a=>{const m=parseFloat(a.qty)||0;Rt(a.warehouseId)?ct+=m:E+=m});const D=`
    <div style="margin:8px 18px; padding:12px 14px; background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
        <span style="font-size:11.5px; font-weight:800; color:var(--text-0); display:flex; align-items:center; gap:6px;">
          <span>🔄</span>
          <span><b>سلسلة إمداد الصنف:</b> توريد الموردين ➔ المستودع الرئيسي ➔ شحن السيارات ➔ مبيعات الميدان</span>
        </span>
        <span class="badge good" style="font-size:10px;">✅ دورة متطابقة ومغلقة محاسبياً</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px; font-size:11px;">
        <!-- Inbound -->
        <div style="background:var(--bg-card); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:8px 10px;">
          <div style="color:#059669; font-weight:800; margin-bottom:2px;">1. توريد المشتريات 🏭</div>
          <div style="font-size:15px; font-weight:900;" class="mono text-good">+${v(kt)} ${b}</div>
          <div class="dim" style="font-size:9.5px; margin-top:2px;">${$t} فواتير شراء من الموردين</div>
        </div>

        <!-- Main Warehouse Hub -->
        <div style="background:var(--bg-card); border:1px solid rgba(59,130,246,0.3); border-radius:8px; padding:8px 10px;">
          <div style="color:#2563EB; font-weight:800; margin-bottom:2px;">2. المستودع الرئيسي 🏢</div>
          <div style="display:flex; justify-content:space-between;">
            <span class="dim">الرصيد بالمستودع:</span>
            <b class="mono font-bold" style="color:#2563EB;">${v(E)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">مبيعات مباشرة:</span>
            <b class="mono font-bold text-bad">-${v(It)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">محول للسيارات:</span>
            <b class="mono font-bold" style="color:#6366F1;">-${v(l)}</b>
          </div>
        </div>

        <!-- Van Fleet Sales -->
        <div style="background:var(--bg-card); border:1px solid rgba(139,92,246,0.3); border-radius:8px; padding:8px 10px;">
          <div style="color:#7C3AED; font-weight:800; margin-bottom:2px;">3. سيارات المناديب (الميدان) 🚐</div>
          <div style="display:flex; justify-content:space-between;">
            <span class="dim">مبيعات المناديب:</span>
            <b class="mono font-bold" style="color:#7C3AED;">-${v(f)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">شحنات مستلمة:</span>
            <b class="mono font-bold text-good">+${v(h)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">المتبقي بالسيارات:</span>
            <b class="mono font-bold">${v(ct)}</b>
          </div>
        </div>
      </div>
    </div>
  `,pt=`
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; padding:12px 18px 4px 18px;">
      <!-- Opening Balance -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#64748B;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">رصيد أول المدة 📅</div>
        <div class="mono font-bold" style="font-size:18px; color:var(--text-0); margin-top:2px;">${v(wt)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${t?"في "+t:"بداية الحركات (صفر)"}</div>
      </div>

      <!-- Total In -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الوارد 📥</div>
        <div class="mono font-bold text-good" style="font-size:18px; margin-top:2px;">+${v(dt)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${n?"شحنات مستلمة":"مشتريات ومرتجعات"}</div>
      </div>

      <!-- Total Out -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#EF4444;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الصادر 📤</div>
        <div class="mono font-bold text-bad" style="font-size:18px; margin-top:2px;">-${v(ft)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${n?"مبيعات مسلمة":"مبيعات وهالك"}</div>
      </div>

      <!-- Current Stock -->
      <div style="background:rgba(16,185,129,0.04); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:#059669; font-weight:800;">الرصيد الفعلي الحالي 📦</div>
        <div class="mono font-bold text-good" style="font-size:19px; margin-top:2px;">${v(at)} ${b}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${n?"بالمستودع المحدد":"شامل المؤسسة والسيارات"}</div>
      </div>
    </div>
  `,jt=Ct?`<div style="margin:8px 18px; padding:8px 14px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; color:#059669; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>✅</span>
        <span><b>تدقيق مطابق 100%:</b> الرصيد التراكمي لدفتر الأستاذ (${v(lt)}) يطابق تماماً الرصيد الفعلي في المستودع (${v(at)} ${b}). لا يوجد أي عجز أو تضارب دفتري.</span>
      </div>`:`<div style="margin:8px 18px; padding:8px 14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#DC2626; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>⚠️</span>
        <span><b>تنبيه تدقيق:</b> رصيد الدفتر التراكمي (${v(lt)}) والرصيد المسجل بالمستودع (${v(at)} ${b}). الفارق: ${v(lt-at)}.</span>
      </div>`;let N=[...xt];K==="main"?N=N.filter(a=>a.isWhMain):K==="transfers"?N=N.filter(a=>a.isTrans):K==="van_sales"?N=N.filter(a=>a.isVanSale):K==="clean"&&(N=N.filter(a=>a.isCleanCommercial));const Mt=Ft==="desc"?[...N].reverse():[...N],ce=Mt.length===0?'<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔍</div><p>لا توجد حركات تطابق الفلاتر المحددة</p></div>':`
      <table id="modal-ledger-table" style="width:100%; min-width:1250px; border-collapse:collapse; font-size:12px;">
        <thead style="position:sticky; top:0; z-index:10; background:#0f3d19; color:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.15);">
          <tr style="background:#0f3d19; color:#fff;">
            <th style="padding:10px 10px; width:45px; text-align:center; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">#</th>
            <th style="padding:10px 12px; width:105px; text-align:right; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324; white-space:nowrap;">📅 التاريخ</th>
            <th style="padding:10px 12px; width:135px; text-align:center; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">نوع الحركة</th>
            <th style="padding:10px 12px; width:115px; text-align:right; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">رقم المستند</th>
            <th style="padding:10px 12px; width:220px; text-align:right; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">👤 الطرف الثاني (العميل / المورد / المسار)</th>
            <th style="padding:10px 12px; width:140px; text-align:right; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">المخزن / الموقع</th>
            <th style="padding:10px 10px; width:95px; text-align:center; font-size:11.5px; font-weight:800; color:#86efac; border-bottom:2px solid #165324;">وارد (+)</th>
            <th style="padding:10px 10px; width:95px; text-align:center; font-size:11.5px; font-weight:800; color:#fca5a5; border-bottom:2px solid #165324;">صادر (-)</th>
            <th style="padding:10px 12px; width:115px; text-align:center; font-size:11.5px; font-weight:800; color:#fde047; border-bottom:2px solid #165324;">الرصيد بعد 📦</th>
            <th style="padding:10px 12px; min-width:200px; text-align:right; font-size:11.5px; font-weight:800; color:#fff; border-bottom:2px solid #165324;">البيان والملاحظات</th>
          </tr>
        </thead>
        <tbody id="modal-ledger-tbody">
          ${Mt.map((a,m)=>{const $=a.type||a.refType||"adjustment",M=r[$]||$,T=d[$]||"📋",w=m%2===0?"var(--bg-1)":"var(--bg-2)",L=a.inQty>0,Z=L?`<span style="background:rgba(16,185,129,.12);color:#10B981;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">+${v(a.inQty)}</span>`:'<span style="color:var(--text-3);">—</span>',J=!L&&a.outQty>0?`<span style="background:rgba(239,68,68,.1);color:#EF4444;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">-${v(a.outQty)}</span>`:'<span style="color:var(--text-3);">—</span>';let st="";n?st=`<span style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${v(a.balanceAfter)}</span>`:st=`
                <div style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${v(a.companyBalance)}</div>
                <div style="font-size:9.5px; color:var(--text-3); font-family:var(--font-mono);">مخزن: ${v(a.whBalance)}</div>
              `;let U='<span style="color:var(--text-3);">—</span>';if(a.partyName){let ot="#475569",ut="👤";a.isSale?(ot="#0284c7",ut="👤"):a.isPur?(ot="#d97706",ut="🏭"):a.isTrans&&(ot="#6366f1",ut="🔄"),U=`
                <span style="display:inline-flex; align-items:center; gap:5px; font-weight:700; color:${ot}; font-size:12px;">
                  <span>${ut}</span>
                  <span>${a.partyName}</span>
                </span>
              `}let F=a.notes||a.note||a.description||"";a.isIgnoredReversal?F="[حركة تعديل دفتري سابقة — فاتورة الشراء معتمدة ومثبتة فعلياً بالمستودع]":a.type==="sale_reverse_edit"||a.type==="reverse_edit"?F=F||`تعديل الفاتورة ${a.documentNumber} (عكس القيد السابق لتطبيق التعديل — المحصلة صفر)`:F||(a.isSale?F=`فاتورة بيع للعميل: ${a.partyName||"نقدي"}`:a.isPur?F=`توريد مشتريات من المورد: ${a.partyName||"معتمد"}`:a.isTrans?F=`تحويل بضاعة: ${a.partyName||"بين المستودعات"}`:F="—");const _=a.type==="sale_reverse_edit"||a.type==="reverse_edit"||a.type==="purchase_reverse"||a.isIgnoredReversal;return`
              <tr class="modal-ledger-row" data-search="${`${a.documentNumber||""} ${a.partyName||""} ${a.whName||""} ${F} ${M}`.toLowerCase().replace(/"/g,"&quot;")}" style="background:${w}; border-bottom:1px solid var(--border-soft); transition:background .15s;"
                onmouseover="this.style.background='rgba(91,127,255,.06)'"
                onmouseout="this.style.background='${w}'">
                <td style="padding:8px 10px; text-align:center; color:var(--text-3); font-family:var(--font-mono); font-size:11px;">${m+1}</td>
                <td style="padding:8px 12px; white-space:nowrap; color:var(--text-2); font-family:var(--font-mono); font-size:11.5px;">${a.dateStr}</td>
                <td style="padding:8px 12px; white-space:nowrap; text-align:center;">
                  <span style="
                    display:inline-flex; align-items:center; gap:4px;
                    background:${_?"rgba(245,158,11,.14)":L?"rgba(16,185,129,.1)":"rgba(239,68,68,.08)"};
                    color:${_?"#B45309":L?"#059669":"#DC2626"};
                    border:${_?"1px solid rgba(245,158,11,.3)":"none"};
                    padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;
                  ">${T} ${M}</span>
                </td>
                <td style="padding:8px 12px; font-family:var(--font-mono); font-weight:700; color:var(--brand); font-size:12px;">${a.documentNumber||"—"}</td>
                <td style="padding:8px 12px;">${U}</td>
                <td style="padding:8px 12px; font-size:11.5px; color:var(--text-1);">${a.whName}</td>
                <td style="padding:8px 10px; text-align:center;">${Z}</td>
                <td style="padding:8px 10px; text-align:center;">${J}</td>
                <td style="padding:8px 12px; text-align:center;">${st}</td>
                <td style="padding:8px 12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-2); font-size:11.5px;"
                  title="${F.replace(/"/g,"&quot;")}">${F}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>`;s.innerHTML=`
    <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
      <div id="modal-ledger-header-panel" style="flex-shrink:0; background:var(--bg-1); border-bottom:1px solid var(--border-soft); max-height:48vh; overflow-y:auto; transition:max-height 0.25s ease;">
        ${c}
        <div id="modal-summary-collapsible">
          ${pt}
          ${D}
          ${jt}
        </div>
      </div>
      <div id="modal-ledger-table-wrap" style="flex:1; overflow-y:auto; overflow-x:auto; position:relative; background:var(--bg-card);">
        ${ce}
      </div>
    </div>
  `}window.toggleProductModalSort=t=>{Ft=t,_applyLedgerFilters()};window.setModalPathFilter=t=>{K=t,_applyLedgerFilters()};window._applyLedgerFilters=()=>{const t=document.getElementById("ledger-from")?.value||"",e=document.getElementById("ledger-to")?.value||"",o=document.getElementById("ledger-type")?.value||"",n=document.getElementById("ledger-warehouse")?.value||"",i=document.getElementById("ledger-simplified")?.checked||!1;Wt(t,e,o,n,i)};window._resetLedgerFilters=()=>{K="all",Wt("","","","",!1)};window.toggleStockModalFullscreen=()=>{const t=document.getElementById("stock-modal-card"),e=document.getElementById("stock-modal-fs-btn");if(!t)return;t.classList.toggle("modal-fullscreen")?(t.style.maxWidth="100vw",t.style.width="100vw",t.style.height="100vh",t.style.maxHeight="100vh",t.style.borderRadius="0",t.style.margin="0",e&&(e.innerHTML="🗗",e.title="تصغير / استعادة الحجم الافتراضي")):(t.style.maxWidth="98vw",t.style.width="98vw",t.style.height="95vh",t.style.maxHeight="95vh",t.style.borderRadius="14px",t.style.margin="auto",e&&(e.innerHTML="⛶",e.title="تكبير بحجم الشاشة الكاملة"))};window.openFullStockCardFromModal=()=>{if(G){window._scPreselectProductId=G;try{localStorage.setItem("idham_sc_preselect_product_id",G)}catch{}typeof closeModal=="function"&&closeModal("stock-modal"),window.location.hash="#stock-card"}};window.toggleModalSummaryVisibility=()=>{const t=document.getElementById("modal-summary-collapsible"),e=document.getElementById("btn-toggle-summary");t&&(t.style.display==="none"?(t.style.display="block",e&&(e.innerHTML="👁️ طي التحليل")):(t.style.display="none",e&&(e.innerHTML="👁️ إظهار التحليل")))};window.filterModalTableRows=t=>{const e=(t||"").trim().toLowerCase(),o=document.querySelectorAll(".modal-ledger-row"),n=document.getElementById("modal-ledger-search-count");let i=0;o.forEach(s=>{const p=(s.getAttribute("data-search")||s.textContent||"").toLowerCase();!e||p.includes(e)?(s.style.display="",i++):s.style.display="none"}),n&&(e?(n.style.display="inline-block",n.textContent=`(${i} مطابقة)`):n.style.display="none")};window._exportLedgerExcel=async()=>{try{if(!Q||Q.length===0){showToast("لا توجد بيانات للتصدير","warning");return}const t=["م","التاريخ","نوع الحركة","رقم المستند","الطرف الثاني (العميل / المورد / المسار)","المستودع","وارد (+)","صادر (-)","الرصيد بعد","البيان والملاحظات"],e=[6,12,16,16,25,18,10,10,12,35],o=Q.map((i,s)=>[s+1,i.dateStr,i.type||"حركة",i.documentNumber||"—",i.partyName||"—",i.whName||"—",i.inQty||"—",i.outQty||"—",i.balanceAfter!==void 0?i.balanceAfter:0,i.notes||i.note||i.description||"—"]),n=`دفتر_حركة_${yt||"الصنف"}_${new Date().toISOString().slice(0,10)}`;await se({title:n,headers:t,rows:o,colWidths:e}),showToast("تم تصدير Excel بنجاح ✅","success")}catch(t){showToast("خطأ في التصدير: "+t.message,"error")}};window._exportLedgerPdf=()=>{if(!Q||Q.length===0){showToast("لا توجد بيانات للتصدير","warning");return}const t=(()=>{const n=document.getElementById("ledger-from")?.value||"",i=document.getElementById("ledger-to")?.value||"";return n&&i?`من ${n} إلى ${i}`:n?`من ${n}`:i?`حتى ${i}`:"كل الفترات"})(),e=Q.map((n,i)=>{const s=n.inQty>0;return`<tr style="background:${i%2===0?"#fff":"#f8fafc"}">
      <td style="text-align:center;">${i+1}</td>
      <td>${n.dateStr}</td>
      <td><span style="background:${s?"#dcfce7":"#fee2e2"};color:${s?"#166534":"#991b1b"};padding:2px 6px;border-radius:10px;font-size:10px;">${n.type||""}</span></td>
      <td style="font-weight:700;color:#1e3a8a;">${n.documentNumber||"—"}</td>
      <td style="font-weight:700;">${n.partyName||"—"}</td>
      <td>${n.whName||"—"}</td>
      <td style="color:#16a34a;font-weight:700;text-align:center;">${n.inQty?"+"+v(n.inQty):"—"}</td>
      <td style="color:#dc2626;font-weight:700;text-align:center;">${n.outQty?"-"+v(n.outQty):"—"}</td>
      <td style="font-weight:700;color:#1d4ed8;text-align:center;">${v(n.balanceAfter||0)}</td>
      <td style="color:#64748b;font-size:10.5px;">${n.notes||n.note||n.description||"—"}</td>
    </tr>`}).join(""),o=window.open("","_blank","width=1100,height=750");o.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8">
    <title>دفتر حركة - ${yt||""}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap');
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:'Cairo',sans-serif; direction:rtl; background:#fff; color:#1e293b; padding:15px; font-size:11px; }
      .mono { font-family:'IBM Plex Mono', monospace; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; padding-bottom:10px; border-bottom:2.5px solid #1e3a8a; }
      .logo-title h1 { font-size:18px; font-weight:800; color:#1e3a8a; }
      .logo-title p  { font-size:11px; color:#64748b; margin-top:2px; }
      .meta { text-align:left; font-size:10px; color:#64748b; }
      table { width:100%; border-collapse:collapse; font-size:10.5px; }
      thead tr { background:#1e3a8a; color:#fff; }
      thead th { padding:6px 8px; text-align:right; font-weight:700; white-space:nowrap; }
      tbody td { padding:5px 8px; border-bottom:1px solid #e2e8f0; }
      @media print {
        @page { size:A4 landscape; margin:8mm; }
        button { display:none !important; }
      }
    </style>
  </head><body>
    <div class="header">
      <div class="logo-title">
        <h1>إدهام للمواد الغذائية</h1>
        <p>دفتر حركة تفصيلي: <strong>${yt||""}</strong></p>
      </div>
      <div class="meta">
        <strong>الفترة: ${t}</strong>
        <div>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</div>
      </div>
    </div>
    <table>
      <thead><tr>
        <th style="width:25px;">#</th>
        <th>التاريخ</th><th>نوع الحركة</th><th>رقم المستند</th><th>الطرف الثاني</th><th>المستودع</th>
        <th style="text-align:center;">وارد (+)</th><th style="text-align:center;">صادر (-)</th>
        <th style="text-align:center;">الرصيد بعد</th><th>البيان والملاحظات</th>
      </tr></thead>
      <tbody>${e}</tbody>
    </table>
    <div style="margin-top:20px;text-align:center;">
      <button onclick="window.print()" style="padding:8px 24px;background:#1e3a8a;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ طباعة / حفظ PDF</button>
    </div>
  </body></html>`),o.document.close(),setTimeout(()=>o.focus(),300)};window.printCustodyReconciliationFromProductModal=()=>{if(!G)return;const t=z.find(u=>u.id===G)||{name:yt,unit:"كرتون",sku:"—"},e=document.getElementById("ledger-warehouse")?.value||"",n=O.find(u=>u.id===e)?.name||"جميع المستودعات والسيارات",i=Q.filter(u=>u.inQty>0),s=i.reduce((u,y)=>u+(y.inQty||0),0),p=Q.filter(u=>u.outQty>0),g=p.reduce((u,y)=>u+(y.outQty||0),0),b=Q.length>0?Q[Q.length-1].balanceAfter:0,r=t.unit||"كرتون",d=window.open("","_blank","width=920,height=800");d.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${t.name||yt} — ${n}</title>
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
      <h2 style="font-size:15px; font-weight:900; color:#0f3d19;">شركة إدهام للمواد الغذائية</h2>
      <div style="font-size:9.5px; color:#64748b;">إدارة سلاسل الإمداد والمستودعات</div>
    </div>
    <div class="title-box">
      <h1 style="font-size:16px; font-weight:900; color:#0f172a;">محضر مطابقة وجرد عهدة سيارة / مخزن</h1>
      <div style="font-size:10.5px; color:#0f3d19; font-weight:700;">كشف تفريغ حركة الصنف وتدقيق العهدة الميدانية</div>
    </div>
    <div style="text-align:left; font-size:9.5px; color:#64748b;">
      <div>تاريخ الاستخراج: <b>${new Date().toISOString().slice(0,10)}</b></div>
      <div>نظام IDHAM ERP</div>
    </div>
  </div>

  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; font-size:11px;">
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${t.name||yt}</span> (SKU: <span class="mono">${t.sku||"—"}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${n}</span></div>
    <div><b>الوحدة:</b> <span>${r}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${v(s)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${v(g)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${v(b)} ${r}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${Q.length} حركة</div>
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
      ${i.map((u,y)=>`
        <tr>
          <td style="text-align:center;" class="mono">${y+1}</td>
          <td class="mono">${u.dateStr}</td>
          <td class="mono font-bold">${u.documentNumber||"—"}</td>
          <td>${u.partyName||u.notes||"استلام شحنة معتمدة"}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${v(u.inQty)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${v(s)}</td>
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
        <th>اسم العميل / المستلم</th>
        <th style="width:80px; text-align:center;">الكمية المباعة</th>
        <th style="width:75px; text-align:center;">حالة الفاتورة</th>
      </tr>
    </thead>
    <tbody>
      ${p.map((u,y)=>`
        <tr>
          <td style="text-align:center;" class="mono">${y+1}</td>
          <td class="mono">${u.dateStr}</td>
          <td class="mono font-bold">${u.documentNumber||"—"}</td>
          <td><b>${u.partyName||"عميل نقدي"}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${v(u.outQty)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${v(g)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${v(b)} ${r}</b></div>
      <div>الرصيد الفعلي الموجود بالسيارة الآن: <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${r}</div>
      <div>الفارق (عجز / زيادة): <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${r}</div>
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
</html>`),d.document.close(),setTimeout(()=>{d.focus(),d.print(),d.close()},700)};window.reconcileProductStock=async(t,e)=>{e&&(e.disabled=!0,e.innerHTML="⏳ جارٍ التدقيق…");try{zt=[],et=[],await switchStockTab("card"),showToast("تم تدقيق ومطابقة حركات الصنف بنجاح ✅","success")}catch(o){showToast("فشل التدقيق: "+o.message,"error")}finally{e&&(e.disabled=!1,e.innerHTML="⚖️ تدقيق ومطابقة الرصيد")}};window.viewStock=async(t,e=null)=>{if(G=t,!e){const n=z.find(i=>i.id===t);e=n&&(n.name||n.nameAr)||""}yt=e,et=[],zt=[],St=[],document.getElementById("stock-modal-title").textContent=`بطاقة الصنف: ${e}`;const o=document.getElementById("stock-modal-body");o.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>',openModal("stock-modal");try{et=await ie(t),le()}catch(n){o.innerHTML=`<div class="alert bad">${n.message}</div>`}};window.setupProductSearch=()=>{const t=document.getElementById("prod-search");t&&t.addEventListener("input",be(()=>C(!0),400))};window.exportProducts=async()=>{showToast("جارٍ تصدير البيانات…","info");try{const t=await A(I.products(),[vt("sku")]),e=[["الكود","الاسم","الاسم الإنجليزي","الفئة","التتبع","الوحدة","درجة حرارة الحفظ","سعر التكلفة","سعر البيع","الباركود"]];t.forEach(s=>e.push([s.sku,s.name,s.nameEn||"",s.categoryName||s.category,s.tracking,s.unit,s.storageTemperature,s.costPrice,s.salePrice,s.barcode]));const o=e.map(s=>s.map(p=>`"${p||""}"`).join(",")).join(`
`),n=new Blob(["\uFEFF"+o],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a");i.href=URL.createObjectURL(n),i.download=`products_${new Date().toISOString().split("T")[0]}.csv`,i.click(),showToast("تم تصدير الملف بنجاح","success")}catch(t){showToast(t.message,"error")}};window.loadNextPage=()=>{q++,C()};window.loadPrevPage=()=>{q>0&&(q--,Ut=null,C())};window.printProductBarcode=async t=>{try{const{getById:e}=await At(async()=>{const{getById:s}=await import("./index-CF9GFeRJ.js").then(p=>p.T);return{getById:s}},__vite__mapDeps([0,1])),o=await e("products",t);if(!o)return;const n=o.barcode||o.sku,i=window.open("","_blank");i.document.write(`
      <html>
      <head>
        <title>طباعة باركود: ${o.name}</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: sans-serif; text-align: center; }
          .barcode-card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; width: 280px; }
          h4 { margin: 0 0 10px 0; }
          svg { margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="barcode-card">
          <h4>إدهام للمواد الغذائية</h4>
          <div style="font-size:12px; font-weight:bold;">${o.name}</div>
          <div style="font-size:11px; color:#555; margin-top:4px;">السعر: ${o.salePrice} ر.س</div>
          <svg id="barcode-svg"></svg>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode("#barcode-svg", "${n}", {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: true
          });
          setTimeout(() => { window.print(); window.close(); }, 500);
        <\/script>
      </body>
      </html>
    `),i.document.close()}catch(e){showToast(e.message,"error")}};window.exportProductsExcel=async()=>{try{const t=z.length>0?z:await A(I.products(),[vt("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.sku||"",o.name||o.nameAr||"",o.nameEn||"",o.barcode||"",o.categoryName||"",o.unit||"",o.altUnit||"",o.unitFactor||1,o.costPrice||0,o.salePrice||0,o.priceWholesale||0,o.taxCategory==="S"?15:0,o.reorderLevel||0,o.tracking||"none",o.totalQty||0,o.active===!1?"غير نشط":"نشط",o.notes||""]);await se({title:"كتالوج_الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة","سعر البيع","سعر الجملة","ضريبة القيمة المضافة %","حد إعادة الطلب","نظام التتبع","المخزون الحالي","الحالة","ملاحظات"],rows:e,colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,12,14,10,22]}),showToast(`تم تصدير ${e.length} صنف بنجاح ✅`,"success")}catch(t){showToast("خطأ في التصدير: "+t.message,"error")}};window.downloadProductTemplate=async()=>{try{await ve({title:"الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","اسم الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة*","سعر البيع*","سعر الجملة","ضريبة (S أو E)","حد إعادة الطلب","نظام التتبع (none/batch/serial)"],sampleRows:[["P001","زيت نخيل","Palm Oil","6281234567890","زيوت","لتر","كرتون",12,18.5,25,22,"S",50,"none"],["P002","سكر أبيض","White Sugar","6281234567891","سلع أساسية","كيلو","كيس",50,3,4.5,4,"S",100,"none"]],colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,22]}),showToast("تم تنزيل نموذج الاستيراد ✅","success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openProductImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="prod-import-overlay",t.innerHTML=`
    <div class="modal" style="max-width:740px;width:95%;max-height:92vh;display:flex;flex-direction:column;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد الأصناف من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('prod-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body" style="flex:1;overflow-y:auto;">
        <!-- Step 1: Upload -->
        <div id="import-step-1">
          <div style="background:var(--bg-2);border-radius:12px;padding:20px;margin-bottom:16px;">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <span style="font-size:28px;">💡</span>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">تعليمات الاستيراد</div>
                <ul style="font-size:12px;color:var(--text-2);margin:0;padding-right:16px;line-height:1.8;">
                  <li>قم بتنزيل نموذج Excel أولاً عبر زر <strong>نموذج الاستيراد</strong></li>
                  <li>الأعمدة المميزة بـ (*) إلزامية</li>
                  <li>لا تغيّر أسماء الأعمدة في الصف الأول</li>
                  <li>الحد الأقصى <strong>5,000 صنف</strong> في الاستيراد الواحد</li>
                  <li>الأصناف ذات كود (SKU) موجود مسبقاً ستُحدَّث، والجديدة ستُضاف</li>
                </ul>
              </div>
            </div>
          </div>
          <div id="import-drop-zone" style="border:2px dashed var(--border-soft);border-radius:12px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--bg-1);"
            onclick="document.getElementById('import-file-input').click()"
            ondragover="event.preventDefault();this.style.borderColor='var(--brand)';this.style.background='rgba(91,127,255,0.05)';"
            ondragleave="this.style.borderColor='var(--border-soft)';this.style.background='var(--bg-1)';"
            ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';this.style.background='var(--bg-1)';handleImportFileDrop(event.dataTransfer.files[0]);">
            <div style="font-size:48px;margin-bottom:12px;">📊</div>
            <div style="font-size:15px;font-weight:600;margin-bottom:6px;">اسحب ملف Excel هنا</div>
            <div style="font-size:12px;color:var(--text-2);">أو انقر للاختيار — .xlsx / .xls / .csv</div>
            <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleImportFileDrop(this.files[0])">
          </div>
        </div>
        <!-- Step 2: Preview & mapping -->
        <div id="import-step-2" style="display:none;">
          <div id="import-stats" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;"></div>
          <div style="max-height:340px;overflow:auto;border-radius:8px;border:1px solid var(--border-soft);">
            <table class="data-dense" style="font-size:11.5px;" id="import-preview-table"></table>
          </div>
          <div id="import-validation-errors" style="margin-top:12px;"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('prod-import-overlay').remove()">إلغاء</button>
        <button class="btn" style="background:var(--bg-2);" onclick="downloadProductTemplate()">📥 تنزيل نموذج</button>
        <button class="btn btn-primary" id="import-confirm-btn" style="display:none;" onclick="executeProductImport()">✅ استيراد البيانات</button>
      </div>
    </div>
  `,document.body.appendChild(t)};let Nt=[];window.handleImportFileDrop=async t=>{if(t)try{showToast("جاري قراءة الملف…","info");const{headers:e,rows:o}=await ye(t);Nt=o;const n=[],i={};o.forEach((r,d)=>{const u=String(r[e[0]]||r["كود الصنف (SKU)*"]||r.SKU||"").trim(),y=String(r[e[1]]||r["الاسم العربي*"]||r["اسم الصنف"]||"").trim();u||n.push(`الصف ${d+2}: كود الصنف (SKU) مطلوب`),y||n.push(`الصف ${d+2}: الاسم العربي مطلوب`),i[u]&&n.push(`الصف ${d+2}: كود مكرر "${u}"`),u&&(i[u]=!0)});const s=Object.keys(o[0]||{}).slice(0,8),p=o.slice(0,10),g=`
      <thead><tr>${s.map(r=>`<th>${r}</th>`).join("")}${s.length<Object.keys(o[0]||{}).length?"<th>…</th>":""}</tr></thead>
      <tbody>${p.map((r,d)=>`<tr style="background:${d%2===0?"var(--bg-1)":"var(--bg-2)"}">${s.map(u=>`<td>${r[u]||""}</td>`).join("")}${s.length<Object.keys(r).length?"<td>…</td>":""}</tr>`).join("")}</tbody>
    `;document.getElementById("import-preview-table").innerHTML=g;const b=[{label:"إجمالي الصفوف",val:o.length,color:"#2563eb"},{label:"الأعمدة",val:e.length,color:"#10B981"},{label:"أخطاء",val:n.length,color:n.length?"#EF4444":"#10B981"}].map(r=>`
      <div style="background:var(--bg-2);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;align-items:center;min-width:100px;">
        <span style="font-size:22px;font-weight:800;color:${r.color};">${r.val}</span>
        <span style="font-size:11px;color:var(--text-2);">${r.label}</span>
      </div>`).join("");document.getElementById("import-stats").innerHTML=b,n.length>0?document.getElementById("import-validation-errors").innerHTML=`
        <div class="alert bad" style="max-height:120px;overflow:auto;">
          <strong>⚠️ تحذيرات التحقق (${n.length}):</strong><br>
          ${n.slice(0,15).map(r=>`<div style="font-size:11px;">${r}</div>`).join("")}
          ${n.length>15?`<div style="font-size:11px;">...و ${n.length-15} أخرى</div>`:""}
        </div>`:document.getElementById("import-validation-errors").innerHTML='<div class="alert good">✅ جميع البيانات صحيحة وجاهزة للاستيراد</div>',document.getElementById("import-step-1").style.display="none",document.getElementById("import-step-2").style.display="block",n.length===0&&(document.getElementById("import-confirm-btn").style.display=""),showToast(`تم قراءة ${o.length} صنف. راجع البيانات قبل الاستيراد.`,o.length>0?"success":"warn")}catch(e){showToast("خطأ في قراءة الملف: "+e.message,"error")}};window.executeProductImport=async()=>{const t=document.getElementById("import-confirm-btn");t.disabled=!0,t.textContent="⏳ جاري الاستيراد…";let e=0,o=0,n=0;try{const i=await A(I.products(),[]),s={};i.forEach(r=>{r.sku&&(s[r.sku.trim()]=r.id)});const p=S.length>0?S:await A(I.categories?I.categories():`companies/${ae}/categories`,[vt("name")]).catch(()=>[]),g={};p.forEach(r=>{g[(r.name||"").trim().toLowerCase()]={id:r.id,name:r.name}});const b=50;for(let r=0;r<Nt.length;r++){const d=Nt[r],u=String(d["كود الصنف (SKU)*"]||d.SKU||d[Object.keys(d)[0]]||"").trim(),y=String(d["الاسم العربي*"]||d.الاسم||d[Object.keys(d)[1]]||"").trim();if(!u||!y){n++;continue}const P=String(d["اسم الفئة"]||d.الفئة||"").trim().toLowerCase(),c=g[P]||{},x={sku:u,name:y,nameAr:y,nameEn:String(d["الاسم الإنجليزي"]||"").trim()||null,barcode:String(d.الباركود||"").trim()||null,categoryId:c.id||null,categoryName:c.name||d["اسم الفئة"]||d.الفئة||null,unit:String(d["وحدة البيع"]||"حبة").trim(),altUnit:String(d["الوحدة الكبرى"]||"").trim()||null,unitFactor:parseFloat(d["معامل التحويل"]||1)||1,costPrice:parseFloat(d["سعر التكلفة*"]||d["سعر التكلفة"]||0)||0,salePrice:parseFloat(d["سعر البيع*"]||d["سعر البيع"]||0)||0,priceWholesale:parseFloat(d["سعر الجملة"]||0)||0,taxCategory:String(d["ضريبة (S أو E)"]||d.ضريبة||"S").toUpperCase()==="E"?"E":"S",reorderLevel:parseInt(d["حد إعادة الطلب"]||0)||0,tracking:String(d["نظام التتبع (none/batch/serial)"]||d["نظام التتبع"]||"none").toLowerCase(),active:!0,updatedAt:new Date().toISOString()};try{s[u]?(await Vt(I.products(),s[u],x),o++):(x.createdAt=new Date().toISOString(),await oe(I.products(),x),e++)}catch(k){n++,console.warn("Import row failed:",u,k)}r%10===0&&(t.textContent=`⏳ ${r+1} / ${Nt.length}`),await new Promise(k=>setTimeout(k,20))}document.getElementById("prod-import-overlay").remove(),showToast(`✅ الاستيراد مكتمل — مضاف: ${e} | محدَّث: ${o} | فاشل: ${n}`,"success"),z=[],Ut=null,_t=!1,await C()}catch(i){showToast("خطأ في الاستيراد: "+i.message,"error"),t.disabled=!1,t.textContent="✅ استيراد البيانات"}};function Ht(t){return{Piece:"حبة",Kilogram:"كجم",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Carton:"كرتون",Box:"صندوق",Pallet:"باليت",Bag:"كيس",Bale:"بالة",Tank:"تنك",Barrel:"برميل",Roll:"رول",Pack:"شد / ربطة",Sack:"شوال",Tray:"طبق",Gallon:"جالون",Ton:"طن"}[t]||t||""}function Kt(){return(document.getElementById("prod-zatca-tax")?.value||"S")==="S"?1.15:1}window.onCostInput=()=>{typeof applySuggestedCategoryMargin=="function"&&applySuggestedCategoryMargin(),["retail","wholesale","distributor"].forEach(t=>{const e=document.getElementById(`prod-pct-${t}`);e&&e.value!==""&&window.onPctInput(t)})};window.onPriceInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),n=document.getElementById(`prod-price-inc-${t}`),i=document.getElementById(`prod-pct-${t}`);if(!o)return;const s=parseFloat(o.value)||0,p=Kt();if(n&&(n.value=s>0?(s*p).toFixed(2):""),i)if(e>0&&s>0){const g=(s-e)/e*100;i.value=g.toFixed(1)}else i.value=""};window.onPriceIncInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),n=document.getElementById(`prod-price-inc-${t}`),i=document.getElementById(`prod-pct-${t}`);if(!n)return;const s=parseFloat(n.value)||0,p=Kt(),g=s>0?s/p:0;if(o&&(o.value=g>0?g.toFixed(2):""),i)if(e>0&&g>0){const b=(g-e)/e*100;i.value=b.toFixed(1)}else i.value=""};window.onPctInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),n=document.getElementById(`prod-price-inc-${t}`),i=document.getElementById(`prod-pct-${t}`);if(!i)return;const s=parseFloat(i.value)||0,p=Kt();if(e>0){const g=e*(1+s/100);o&&(o.value=g.toFixed(2)),n&&(n.value=(g*p).toFixed(2))}else o&&(o.value=""),n&&(n.value="")};window.loadNextPage=()=>{_t&&(q++,C())};window.loadPrevPage=()=>{q>0&&(q--,C())};window.onTargetMarginInput=()=>{const t=parseFloat(document.getElementById("prod-target-margin-pct")?.value),e=document.getElementById("prod-margin-type")?.value||"markup";if(isNaN(t)||t<0)return;const o=parseFloat(document.getElementById("prod-purchase-price")?.value)||0,n=window._currentEditingProduct||{},i=parseFloat(n.lastPurchasePrice)||0,s=i>0?i:o;if(s>0){let p=0;e==="margin"&&t<100?p=Math.round(s/(1-t/100)*100)/100:p=Math.round(s*(1+t/100)*100)/100;const g=document.getElementById("prod-price-retail");g&&(g.value=p.toFixed(2),window.onPriceInput("retail"));const b=Math.max(0,t-5),r=Math.max(0,t-10);let d=0,u=0;e==="margin"&&b<100?(d=Math.round(s/(1-b/100)*100)/100,u=Math.round(s/(1-r/100)*100)/100):(d=Math.round(s*(1+b/100)*100)/100,u=Math.round(s*(1+r/100)*100)/100);const y=document.getElementById("prod-price-wholesale");y&&(y.value=d.toFixed(2),window.onPriceInput("wholesale"));const P=document.getElementById("prod-price-distributor");P&&(P.value=u.toFixed(2),window.onPriceInput("distributor"))}};window.applyLastPurchasePricePricing=()=>{const t=window._currentEditingProduct||{},e=parseFloat(t.lastPurchasePrice)||0;if(e<=0){window.showToast?.("لا يوجد آخر سعر شراء مسجل لهذا الصنف بعد","warn");return}const o=document.getElementById("prod-purchase-price");o&&(o.value=e.toFixed(2));const n=document.getElementById("prod-target-margin-pct");let i=parseFloat(n?.value);(isNaN(i)||i<=0)&&(i=15,n&&(n.value=i)),window.onTargetMarginInput(),window.showToast?.(`✅ تم تطبيق آخر سعر شراء (${H(e)}) وحساب أسعار البيع بهامش ${i}%`,"success")};export{C as loadProducts,Me as render};
