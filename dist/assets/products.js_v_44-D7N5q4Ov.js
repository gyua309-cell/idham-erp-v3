const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-T8P1GM2w.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as K,a as h,_ as Bt,d as yt,f as C,k as Dt,l as x,m as jt,n as Vt,u as Ct,o as Rt,r as Qt,C as xt,p as Ht,q as Kt}from"./index-T8P1GM2w.js";import{e as Ot,d as Wt,i as Gt}from"./excel-zCoXiaxq.js";import"./product-cost-sync-Cw8qxUO_.js";import{query as St,where as Tt,limit as Zt,getDocs as ct,orderBy as Mt,getDoc as Yt,doc as Jt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let B=[],F=0;const It=50;let Lt=null,ht=!1,ft="",vt="",Q=[],M=[],T="sku",pt=!0;window.sortProdList=t=>{T===t?pt=!pt:(T=t,pt=t==="sku"||t==="name"||t==="category"),z()};function R(t){return T!==t?'<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>':pt?'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>':'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>'}window.getSortArrowProd=R;let U=null,Pt=null;async function Xt(){if(Pt)return Pt;try{const t=await Yt(Jt(yt,`companies/${xt}/settings`,"system"));t.exists()&&(Pt=t.data())}catch(t){console.error("Failed to load pricing settings:",t)}return Pt||{}}function te(t){return t.length===0?'<tr><td colspan="14" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مطابقة</td></tr>':t.map(e=>{const o=Math.max(0,e._totalQty!==void 0&&e._totalQty!==null?e._totalQty:e.totalQty!==void 0?e.totalQty:e.stockQty!==void 0?e.stockQty:0),i=Dt(o,e.reorderLevel||0),n=e.costPrice||e.purchasePrice||0,a=e.avgCostPrice||e.averageCost||n,p=e.lastPurchasePrice||(e.lastPurchasePrice===0?0:e.avgCostPrice||(n>0?n:null)),u=e.sellingPrice||e.salePrice||e.priceRetail||e.price||0,m=p&&p>0?p:a||n,r=u>0?(u-m)/u*100:0;let s="low",l=`${r.toFixed(1)}%`;r>=20?s="high":r>=10?s="medium":(s="low",r<=0?l=`⚠️ ${r.toFixed(1)}%`:l=`${r.toFixed(1)}%`);const c=e.sku||e.code||"—";return`
      <tr class="status-${i.color}">
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">${c}</td>
        <td style="cursor:pointer;" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">
          <strong>${e.name||e.nameAr}</strong>
          ${e.nameEn?`<div class="dim" style="font-size:10px;">${e.nameEn}</div>`:""}
          ${e.barcode?`<div class="mono dim" style="font-size:10px;">Barcode: ${e.barcode}</div>`:""}
        </td>
        <td>
          ${e.tracking==="batch"?'<span class="badge warn" style="font-size:10px;">التشغيلة</span>':e.tracking==="serial"?'<span class="badge info" style="font-size:10px;">تسلسلي</span>':'<span class="badge neutral" style="font-size:10px;">عام</span>'}
        </td>
        <td class="dim">${e.categoryName||"—"}</td>
        <td>${zt(e.unit||"Piece")}${e.altUnit?` (${zt(e.altUnit)}: ${e.unitFactor} ${zt(e.unit||"Piece")})`:""}</td>
        
        <td class="mono price-editable" style="text-align:left; color:var(--text-2);" title="سعر التكلفة اليدوي — انقر مرتين للتعديل"
            ondblclick="inlineEditPrice(this, '${e.id}', 'costPrice', ${n})">
          ${n>0?C(n):'<span class="dim">—</span>'}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="المتوسط المرجح المحسوب تلقائياً من فواتير الشراء">
          ${e.avgCostPrice!==void 0&&e.avgCostPrice!==null&&e.avgCostPrice>0?`<span style="color:var(--brand);">${C(e.avgCostPrice)}</span>`:n>0?`<span class="dim" style="font-size:11px;" title="التكلفة اليدوية">${C(n)}</span>`:'<span class="dim" style="font-size:11px;">—</span>'}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="${e.lastPurchaseDate?"تاريخ آخر شراء: "+e.lastPurchaseDate+(e.lastSupplierName?" | المورد: "+e.lastSupplierName:""):e.lastPurchasePrice?"آخر سعر شراء مسجل":"التكلفة المسجلة"}">
          ${e.lastPurchasePrice!==void 0&&e.lastPurchasePrice!==null&&e.lastPurchasePrice>0?`<span style="color:#059669; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.25); display:inline-block;">${C(e.lastPurchasePrice)}</span>${e.lastPurchaseDate?`<div class="dim" style="font-size:10px; margin-top:2px;">${e.lastPurchaseDate}</div>`:""}`:p!==null&&p>0?`<span style="color:var(--text-1);">${C(p)}</span>`:n>0?`<span class="dim" style="font-size:11px;">${C(n)}</span>`:'<span class="dim" style="font-size:11px;">—</span>'}
        </td>
        
        <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
            ondblclick="inlineEditPrice(this, '${e.id}', 'salePrice', ${u})">
          <span class="profit-dot ${s}" title="هامش الربح الفعلي: ${r.toFixed(1)}%"></span>
          ${C(u)}
        </td>
        
        <td style="text-align:center;">
          <span class="margin-pct ${s}" title="الهامش الفعلي المحسوب من آخر سعر شراء">${l}</span>
          ${e.targetMarginPct?`<div class="dim" style="font-size:9.5px; margin-top:2px;" title="نسبة الربح المستهدفة المسجلة">هدف: ${e.targetMarginPct}%</div>`:""}
        </td>
        
        <td>${e.taxCategory==="S"?"15%":"0%"}</td>
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}')" title="كشف حركة الصنف">${x(o)}</td>
        <td>${jt(o,e.reorderLevel)}</td>
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
    `}).join("")}async function pe(t,e){if(!document.getElementById("prod-local-styles")){const a=document.createElement("style");a.id="prod-local-styles",a.innerHTML=`
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
    `,document.head.appendChild(a)}B=[],t.innerHTML=`
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
          ${M.map(a=>`<option value="${a.id}" ${ft===a.id?"selected":""}>${a.name}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="prod-status-filter">
          <option value="">الكل</option>
          <option value="ok" ${vt==="ok"?"selected":""}>متوفر</option>
          <option value="low" ${vt==="low"?"selected":""}>منخفض</option>
          <option value="out" ${vt==="out"?"selected":""}>نافد</option>
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
          <div class="inv-kpi-value" id="kpi-total-val">${U?C(U.totalValue):"—"}</div>
          <div class="inv-kpi-label">قيمة المخزون (سعر البيع)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-teal">
        <div class="inv-kpi-icon">🏷️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-cost">${U?C(U.totalCost):"—"}</div>
          <div class="inv-kpi-label">تكلفة المخزون (الشرائية)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-green">
        <div class="inv-kpi-icon">📈</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-margin-pct">${U?`${U.avgMargin}%`:"—"}</div>
          <div class="inv-kpi-label">متوسط هامش الربح %</div>
        </div>
      </div>
      <div class="inv-kpi-card g-orange">
        <div class="inv-kpi-icon">⚠️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-low-stock">${U?U.lowStockCount:"—"}</div>
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
                <th onclick="sortProdList('sku')" style="cursor:pointer; user-select:none;">الكود ${R("sku")}</th>
                <th onclick="sortProdList('name')" style="cursor:pointer; user-select:none;">اسم الصنف (عربي/إنجليزي) ${R("name")}</th>
                <th>التتبع</th>
                <th onclick="sortProdList('category')" style="cursor:pointer; user-select:none;">الفئة ${R("category")}</th>
                <th>الوحدات والتحويل</th>
                <th onclick="sortProdList('costPrice')" style="cursor:pointer; user-select:none; text-align:left;">التكلفة (يدوي) ${R("costPrice")}</th>
                <th onclick="sortProdList('avgCostPrice')" style="cursor:pointer; user-select:none; text-align:left; color:var(--brand);">متوسط الشراء (تلقائي) ${R("avgCostPrice")}</th>
                <th onclick="sortProdList('lastPurchasePrice')" style="cursor:pointer; user-select:none; text-align:left;">آخر سعر شراء ${R("lastPurchasePrice")}</th>
                <th onclick="sortProdList('sellingPrice')" style="cursor:pointer; user-select:none; text-align:left;">سعر البيع (جملة/تجزئة) ${R("sellingPrice")}</th>
                <th onclick="sortProdList('profit')" style="cursor:pointer; user-select:none; text-align:center;">نسبة الربح ${R("profit")}</th>
                <th>الضريبة</th>
                <th onclick="sortProdList('totalQty')" style="cursor:pointer; user-select:none;">المخزون الإجمالي ${R("totalQty")}</th>
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
          <button class="btn btn-sm btn-secondary" id="prev-page-btn" onclick="window.loadPrevPage()" ${F===0?"disabled":""}>السابق</button>
          <span id="page-counter" class="text-2 mono" style="font-size:12px;">الصفحة ${F+1}</span>
          <button class="btn btn-sm btn-secondary" id="next-page-btn" onclick="window.loadNextPage()" ${ht?"":"disabled"}>التالي</button>
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
      <div class="modal" style="max-width:1100px; width:97%; max-height:92vh; display:flex; flex-direction:column;">
        <div class="modal-header" style="border-bottom:none; padding-bottom:0; flex-shrink:0;">
          <h3 class="modal-title" id="stock-modal-title">تفاصيل بطاقة الصنف</h3>
          <button class="modal-close" onclick="closeModal('stock-modal')">×</button>
        </div>
        <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin: 0 24px 0 24px; flex-shrink:0;">
          <button class="tab-btn active" id="tab-btn-balances" onclick="switchStockTab('balances')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">📦 أرصدة المخازن</button>
          <button class="tab-btn" id="tab-btn-batches" onclick="switchStockTab('batches')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">🧬 التشغيلات والتواريخ</button>
          <button class="tab-btn" id="tab-btn-card" onclick="switchStockTab('card')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">📜 دفتر الحركة التفصيلي</button>
        </div>
        <div class="modal-body" id="stock-modal-body" style="flex:1; overflow-y:auto; padding:0;">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </div>
  `;const o=document.getElementById("prod-cat-filter");o&&o.addEventListener("change",()=>{ft=o.value,z(!0)});const i=document.getElementById("prod-status-filter");i&&i.addEventListener("change",()=>{vt=i.value,z(!0)}),window.setupProductSearch();const n=sessionStorage.getItem("filter_category_id");n&&(ft=n,sessionStorage.removeItem("filter_category_id")),await z(!0)}async function z(t=!1){t&&(Lt=null,F=0);const e=document.getElementById("prod-tbody");if(e)try{if(!M||M.length===0){M=await K(h.categories());const v=[{id:"dairy",name:"ألبان ومنتجاتها",icon:"🥛"},{id:"oils",name:"زيوت وسمن",icon:"🌻"},{id:"rice_grains",name:"أرز وحبوب",icon:"🌾"},{id:"dry_goods",name:"سكر ودقيق ومعجنات",icon:"🍞"},{id:"beverages",name:"مشروبات وعصائر",icon:"🧃"},{id:"water",name:"مياه معبأة",icon:"💧"},{id:"meat_poultry",name:"لحوم ودواجن مجمدة",icon:"🍗"},{id:"seafood",name:"أسماك ومأكولات بحرية",icon:"🐟"},{id:"canned",name:"معلبات وصلصات",icon:"🥫"},{id:"confectionery",name:"حلويات وشوكولاتة",icon:"🍫"},{id:"biscuits",name:"بسكويت وكيك",icon:"🍪"},{id:"spices",name:"توابل وبهارات",icon:"🧂"},{id:"coffee_tea",name:"قهوة وشاي",icon:"☕"},{id:"cleaning",name:"منظفات ومعطرات",icon:"🧴"},{id:"personal_care",name:"عناية شخصية وورقيات",icon:"🧻"},{id:"baby",name:"أطفال وحفاضات",icon:"👶"},{id:"bakery",name:"مخبوزات وخبز",icon:"🥖"},{id:"frozen",name:"أغذية مجمدة",icon:"🧊"},{id:"honey_jam",name:"عسل ومربيات وطحينة",icon:"🍯"},{id:"snacks",name:"شيبس ومكسرات",icon:"🥜"},{id:"veg_fruits",name:"خضار وفواكه طازجة",icon:"🍅"},{id:"frozen_veg",name:"خضروات مجمدة",icon:"🥦"},{id:"dates",name:"تمور ومنتجاتها",icon:"🌴"},{id:"pickles",name:"مخللات وأجبان مكشوفة",icon:"🥒"},{id:"plastics",name:"بلاستيكيات ومستلزمات تغليف",icon:"🛍️"},{id:"disposables",name:"أكواب ومستلزمات ضيافة",icon:"🥤"},{id:"tobacco",name:"تبغ ومستلزمات تدخين",icon:"🚬"},{id:"egg",name:"بيض طازج",icon:"🥚"},{id:"sauces",name:"صلصات ومايونيز وتوابل سائلة",icon:"🍯"},{id:"nuts_seeds",name:"مكسرات وبذور",icon:"🌰"},{id:"ice_cream",name:"آيس كريم وحلويات باردة",icon:"🍦"}].filter(y=>!M.some(k=>k.id===y.id));if(v.length>0)try{const{writeBatch:y,doc:k}=await Bt(async()=>{const{writeBatch:d,doc:b}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:d,doc:b}},[]),at=y(yt);v.forEach(d=>{const b=k(h.categories(),d.id);at.set(b,{name:d.name,code:d.id,icon:d.icon,description:`أصناف تابعة لقسم ${d.name}`,createdAt:new Date,updatedAt:new Date},{merge:!0})}),await at.commit(),M=await K(h.categories())}catch(y){console.error("Auto-seed categories failed:",y)}}const o=document.getElementById("prod-cat-filter");o&&(o.innerHTML='<option value="">كل الفئات</option>'+M.map(g=>`<option value="${g.id}" ${ft===g.id?"selected":""}>${g.name}</option>`).join(""));const i=document.getElementById("prod-category");i&&(i.innerHTML='<option value="">اختر الفئة...</option>'+M.map(g=>`<option value="${g.id}">${g.name}</option>`).join("")),(!Q||Q.length===0)&&(Q=await K(h.warehouses()));const{clearERPCache:n}=await Bt(async()=>{const{clearERPCache:g}=await import("./index-T8P1GM2w.js").then(v=>v.T);return{clearERPCache:g}},__vite__mapDeps([0,1]));await n(h.stockByWarehouse().path),await n(h.products().path);let a=await K(h.products());a.sort((g,v)=>(g.sku||"").localeCompare(v.sku||"",void 0,{numeric:!0}));try{const g=await K(h.stockByWarehouse()),v={};g.forEach(y=>{y.productId&&(v[y.productId]=(v[y.productId]||0)+(y.qty||0))}),a.forEach(y=>{y._totalQty=v[y.id]!==void 0?v[y.id]:y.totalQty!==void 0?y.totalQty:0})}catch(g){console.warn("Stock balances unavailable:",g)}B=a;const p=document.getElementById("prod-cat-filter")?.value||ft||"",u=document.getElementById("prod-status-filter")?.value||vt||"",m=(document.getElementById("prod-search")?.value||"").trim().toLowerCase();let r=[...B];p&&(r=r.filter(g=>g.category===p)),u&&(r=r.filter(g=>{const v=g._totalQty||0,y=g.reorderLevel||0;return u==="out"?v<=0:u==="low"?v>0&&v<=y:u==="ok"?v>y:!0})),m&&(r=r.filter(g=>g.name?.toLowerCase().includes(m)||g.sku?.toLowerCase().includes(m)||g.barcode?.includes(m)||g.nameEn?.toLowerCase().includes(m)||g.categoryName?.toLowerCase().includes(m))),T&&r.sort((g,v)=>{let y=g[T],k=v[T];if(T==="sku")y=g.sku||"",k=v.sku||"";else if(T==="name")y=g.name||"",k=v.name||"";else if(T==="category")y=g.categoryName||g.category||"",k=v.categoryName||v.category||"";else if(T==="costPrice")y=Number(g.costPrice||g.purchasePrice||0),k=Number(v.costPrice||v.purchasePrice||0);else if(T==="sellingPrice")y=Number(g.sellingPrice||g.salePrice||g.priceRetail||g.price||0),k=Number(v.sellingPrice||v.salePrice||v.priceRetail||v.price||0);else if(T==="totalQty")y=Number(g._totalQty||0),k=Number(v._totalQty||0);else if(T==="profit"){const at=Number(g.costPrice||g.purchasePrice||0),d=Number(g.sellingPrice||g.salePrice||g.priceRetail||g.price||0),b=d>0?(d-at)/d*100:0,I=Number(v.costPrice||v.purchasePrice||0),_=Number(v.sellingPrice||v.salePrice||v.priceRetail||v.price||0),D=_>0?(_-I)/_*100:0;y=b,k=D}return typeof y=="string"?pt?y.localeCompare(k,void 0,{numeric:!0}):k.localeCompare(y,void 0,{numeric:!0}):pt?y-k:k-y}),ht=r.length>(F+1)*It;const s=F*It,l=r.slice(s,s+It);let c=0,f=0,w=0,E=0,S=0;r.forEach(g=>{const v=g._totalQty||0,y=g.avgCostPrice||g.costPrice||g.purchasePrice||0,k=g.sellingPrice||g.salePrice||g.priceRetail||g.price||0;c+=v*k,f+=v*y,k>0&&(w+=(k-y)/k*100,S++),v<(g.reorderLevel||0)&&E++});const G=S>0?(w/S).toFixed(1):"0.0";U={totalValue:c,totalCost:f,avgMargin:G,lowStockCount:E};const H=document.getElementById("kpi-total-val"),X=document.getElementById("kpi-total-cost"),ut=document.getElementById("kpi-margin-pct"),gt=document.getElementById("kpi-low-stock");H&&(H.textContent=C(c)),X&&(X.textContent=C(f)),ut&&(ut.textContent=`${G}%`),gt&&(gt.textContent=E);const mt=document.getElementById("prod-count-label");mt&&(mt.textContent=`${r.length} صنف — عرض ${l.length}`),e.innerHTML=te(l);const tt=document.getElementById("page-counter");tt&&(tt.textContent=`الصفحة ${F+1} / ${Math.max(1,Math.ceil(r.length/It))}`);const Z=document.getElementById("prev-page-btn"),et=document.getElementById("next-page-btn");Z&&(Z.disabled=F===0),et&&(et.disabled=!ht)}catch(o){console.error(o),e.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--danger);">
      ⚠️ ${o.message}
      <br><button class="btn btn-sm btn-secondary" style="margin-top:12px;" onclick="loadProducts(true)">إعادة المحاولة</button>
    </td></tr>`}}window.applySuggestedCategoryMargin=async()=>{const t=await Xt();if(!t.enableCategoryMargins)return;const e=document.getElementById("prod-category").value,o=parseFloat(document.getElementById("prod-purchase-price").value)||0;if(o<=0)return;const i=M.find(p=>p.id===e);if(!i)return;let n=0;if(i.velocity==="fast")n=t.marginFast??5;else if(i.velocity==="medium")n=t.marginMedium??10;else if(i.velocity==="slow")n=t.marginSlow??15;else return;const a=Math.round(o*(1+n/100)*100)/100;document.getElementById("prod-price-retail").value=a};window.onCategoryChange=async()=>{if(await applySuggestedCategoryMargin(),!!document.getElementById("prod-edit-id").value)return;const e=document.getElementById("prod-category").value;if(!e)return;const o=document.getElementById("prod-sku");if(!o)return;let n={dairy:"01",oils:"02",rice_grains:"03",dry_goods:"04",beverages:"05",water:"06",meat_poultry:"07",seafood:"08",canned:"09",confectionery:"10",biscuits:"11",spices:"12",coffee_tea:"13",cleaning:"14",personal_care:"15",baby:"16",bakery:"17",frozen:"18",honey_jam:"19",snacks:"20"}[e];if(!n){const r=M.findIndex(s=>s.id===e);n=String(r>=0?21+r:99)}const a=B.map(r=>String(r.sku||"")).filter(r=>r.startsWith(n));let p=0;a.forEach(r=>{const s=r.slice(n.length),l=parseInt(s,10);!isNaN(l)&&l>p&&(p=l)});const u=p+1,m=n+String(u).padStart(3,"0");o.value=m};let q=null,nt=null;window.inlineEditPrice=(t,e,o,i)=>{if(t.querySelector("input"))return;nt&&nt();const n=t.innerHTML,a=document.createElement("input");a.type="number",a.step="0.01",a.min="0",a.value=i,a.style.cssText=["width:90px","height:26px","padding:3px 7px","font-size:12px","font-family:var(--font-mono,monospace)","font-weight:700","border:2px solid var(--brand)","border-radius:6px","background:var(--bg-1,#fff)","color:var(--text-1,#1e293b)","outline:none","box-shadow:0 0 0 3px rgba(91,127,255,.15)","text-align:left","display:block","box-sizing:border-box"].join(";"),t.innerHTML="",t.style.padding="4px 8px",t.appendChild(a),a.focus(),a.select(),q=t,nt=u;let p=!1;function u(){p||(p=!0,t.style.padding="",t.innerHTML=n,q===t&&(q=null,nt=null))}const m=async()=>{if(p)return;p=!0;const r=parseFloat(a.value);if(isNaN(r)||r<0){t.style.padding="",t.innerHTML=n,q===t&&(q=null,nt=null);return}if(r===i){t.style.padding="",t.innerHTML=n,q===t&&(q=null,nt=null);return}t.style.padding="",t.innerHTML='<div class="loading-spinner sm"></div>',q===t&&(q=null,nt=null);try{const s={};o==="salePrice"||o==="sellingPrice"||o==="priceRetail"?(s.salePrice=r,s.sellingPrice=r,s.priceRetail=r):o==="costPrice"||o==="purchasePrice"?(s.costPrice=r,s.purchasePrice=r,s.averageCost=r):s[o]=r,await Ct("products",e,s);const l=B.find(c=>c.id===e);l&&Object.assign(l,s),showToast("✅ تم تحديث السعر بنجاح","success"),await z()}catch(s){showToast("❌ "+s.message,"error"),t.innerHTML=n}};a.addEventListener("blur",()=>m()),a.addEventListener("keydown",r=>{r.key==="Enter"&&a.blur(),r.key==="Escape"&&(p=!0,u())})};window.switchProdFormTab=t=>{["basic","inventory","pricing","units"].forEach(n=>{const a=document.getElementById(`prod-tab-${n}`);a&&(a.classList.remove("active"),a.style.borderBottomColor="transparent",a.style.color="var(--text-2)");const p=document.getElementById(`content-prod-${n}`);p&&p.classList.add("hidden")});const o=document.getElementById(`prod-tab-${t}`);o&&(o.classList.add("active"),o.style.borderBottomColor="var(--brand)",o.style.color="var(--brand)");const i=document.getElementById(`content-prod-${t}`);i&&i.classList.remove("hidden")};window.toggleTrackingFields=()=>{const t=document.getElementById("prod-tracking")?.value,e=document.getElementById("prod-shelf-life");e&&(t==="batch"?(e.disabled=!1,e.parentElement.classList.remove("disabled")):(e.disabled=!0,e.value="",e.parentElement.classList.add("disabled")))};window.openProductModal=(t=null)=>{switchProdFormTab("basic"),document.getElementById("prod-edit-id").value=t?.id||"",document.getElementById("prod-modal-title").textContent=t?"تعديل بطاقة الصنف":"إضافة صنف جديد",document.getElementById("prod-sku").value=t?.sku||"",document.getElementById("prod-name-ar").value=t?.name||t?.nameAr||"",document.getElementById("prod-name-en").value=t?.nameEn||"",document.getElementById("prod-category").value=t?.category||"",document.getElementById("prod-supplier").value=t?.supplierId||"",document.getElementById("prod-origin").value=t?.country||"",document.getElementById("prod-barcode").value=t?.barcode||"",document.getElementById("prod-barcodes-alt").value=(t?.alternativeBarcodes||[]).join(", "),document.getElementById("prod-hs-code").value=t?.hsCode||"",document.getElementById("prod-desc").value=t?.description||"",document.getElementById("prod-tracking").value=t?.tracking||"none",document.getElementById("prod-shelf-life").value=t?.shelfLife||"",document.getElementById("prod-temp").value=t?.storageTemperature||"dry",document.getElementById("prod-min").value=t?.minimumQuantity||"",document.getElementById("prod-max").value=t?.maximumQuantity||"",document.getElementById("prod-reorder").value=t?.reorderLevel||"",document.getElementById("prod-safety").value=t?.safetyStock||"",document.getElementById("prod-eoq").value=t?.economicOrderQuantity||"",document.getElementById("prod-lead-time").value=t?.leadTime||"",document.getElementById("prod-zatca-tax").value=t?.taxCategory||"S",document.getElementById("prod-valuation").value=t?.valuationMethod||"moving_average",document.getElementById("prod-purchase-price").value=t?.costPrice||t?.purchasePrice||"",document.getElementById("prod-std-cost").value=t?.standardCost||"",document.getElementById("prod-target-margin-pct").value=t?.targetMarginPct!==void 0&&t?.targetMarginPct!==null?t.targetMarginPct:"",document.getElementById("prod-margin-type").value=t?.marginType||"markup";const e=document.getElementById("prod-last-purchase-display");e&&(t?.lastPurchasePrice!==void 0&&t?.lastPurchasePrice!==null&&t?.lastPurchasePrice>0?e.textContent=`${C(t.lastPurchasePrice)} ${t.lastPurchaseDate?`(تاريخ: ${t.lastPurchaseDate})`:""}`:e.textContent="لا يوجد فواتير شراء مسجلة بعد"),window._currentEditingProduct=t;const o=parseFloat(t?.costPrice||t?.purchasePrice)||0,n=(t?.taxCategory||"S")==="S"?1.15:1;document.getElementById("prod-price-retail").value=t?.salePrice||t?.priceRetail||"",document.getElementById("prod-price-wholesale").value=t?.priceWholesale||"",document.getElementById("prod-price-distributor").value=t?.priceDistributor||"",["retail","wholesale","distributor"].forEach(u=>{const m=parseFloat(u==="retail"?t?.salePrice||t?.priceRetail:u==="wholesale"?t?.priceWholesale:t?.priceDistributor)||0,r=document.getElementById(`prod-price-inc-${u}`);r&&(r.value=m>0?(m*n).toFixed(2):"");const s=document.getElementById(`prod-pct-${u}`);s&&(o>0&&m>0?s.value=((m-o)/o*100).toFixed(1):s.value="")});const a=document.getElementById("prod-zatca-tax");a&&!a._changeListenerAttached&&(a.addEventListener("change",()=>{["retail","wholesale","distributor"].forEach(u=>{const m=document.getElementById(`prod-price-${u}`);m&&m.value!==""&&window.onPriceInput(u)})}),a._changeListenerAttached=!0),document.getElementById("prod-unit-base").value=t?.unit||"Piece",document.getElementById("prod-unit-alt").value=t?.altUnit||"",document.getElementById("prod-unit-conv").value=t?.unitFactor||"";const p=document.getElementById("prod-locations-tbody");p&&(p.innerHTML=Q.map(u=>{const m=t?.locationsByWarehouse?.[u.id]||"";return`
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>
            <input type="text" class="input sm sc-wh-loc-input" data-wh-id="${u.id}" value="${m}" placeholder="مثال: الرف A-12" style="padding:4px 8px; font-size:12px; margin:0;" />
          </td>
        </tr>
      `}).join("")),document.getElementById("prod-form-error").classList.add("hidden"),openModal("product-modal")};window.editProduct=t=>{const e=B.find(o=>o.id===t);e?openProductModal(e):Bt(()=>import("./index-T8P1GM2w.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const i=await o("products",t);i&&openProductModal(i)}catch(i){showToast(i.message,"error")}})};window.saveProduct=async()=>{const t=document.getElementById("prod-form-error");t.classList.add("hidden");const e=document.getElementById("prod-edit-id").value,o=document.getElementById("prod-sku").value.trim().toUpperCase(),i=document.getElementById("prod-name-ar").value.trim(),n=parseFloat(document.getElementById("prod-price-retail").value)||0;if(!o||!i){t.textContent="يرجى تعبئة الكود والاسم العربي",t.classList.remove("hidden");return}if(!n){t.textContent="يرجى تعبئة سعر التجزئة الأساسي",t.classList.remove("hidden");return}const a=document.getElementById("prod-category").value,p=M.find(c=>c.id===a),u={};document.querySelectorAll(".sc-wh-loc-input").forEach(c=>{const f=c.dataset.whId,w=c.value.trim();w&&(u[f]=w)});const m=parseFloat(document.getElementById("prod-target-margin-pct").value),r=document.getElementById("prod-margin-type").value||"markup",s={sku:o,name:i,nameAr:i,nameEn:document.getElementById("prod-name-en").value.trim(),category:a,categoryName:p?.name||"",supplierId:document.getElementById("prod-supplier").value,country:document.getElementById("prod-origin").value.trim(),barcode:document.getElementById("prod-barcode").value.trim(),alternativeBarcodes:document.getElementById("prod-barcodes-alt").value.split(",").map(c=>c.trim()).filter(Boolean),hsCode:document.getElementById("prod-hs-code").value.trim(),description:document.getElementById("prod-desc").value.trim(),tracking:document.getElementById("prod-tracking").value,shelfLife:parseInt(document.getElementById("prod-shelf-life").value)||null,storageTemperature:document.getElementById("prod-temp").value,locationsByWarehouse:u,minimumQuantity:parseInt(document.getElementById("prod-min").value)||0,maximumQuantity:parseInt(document.getElementById("prod-max").value)||0,reorderLevel:parseInt(document.getElementById("prod-reorder").value)||0,safetyStock:parseInt(document.getElementById("prod-safety").value)||0,economicOrderQuantity:parseInt(document.getElementById("prod-eoq").value)||0,leadTime:parseInt(document.getElementById("prod-lead-time").value)||0,taxCategory:document.getElementById("prod-zatca-tax").value,valuationMethod:document.getElementById("prod-valuation").value,costPrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,purchasePrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,standardCost:parseFloat(document.getElementById("prod-std-cost").value)||0,targetMarginPct:isNaN(m)?null:m,marginType:r,salePrice:n,sellingPrice:n,priceRetail:n,priceWholesale:parseFloat(document.getElementById("prod-price-wholesale").value)||0,priceDistributor:parseFloat(document.getElementById("prod-price-distributor").value)||0,unit:document.getElementById("prod-unit-base").value,altUnit:document.getElementById("prod-unit-alt").value,unitFactor:parseInt(document.getElementById("prod-unit-conv").value)||1,searchTokens:Vt(i+" "+o)},l=document.getElementById("save-prod-btn");l.disabled=!0;try{e?(await Ct("products",e,s),showToast("تم تحديث بطاقة الصنف بنجاح","success")):(await Rt(h.products(),s),showToast("تم إضافة الصنف بنجاح","success")),closeModal("product-modal"),B=[],await z(!0)}catch(c){t.textContent=c.message,t.classList.remove("hidden")}finally{l.disabled=!1}};window.deleteProduct=async(t,e=null)=>{if(!e){const o=B.find(i=>i.id===t);e=o&&(o.name||o.nameAr)||""}try{const o=St(h.stockTransactions(),Tt("productId","==",t),Zt(1));if(!(await ct(o)).empty){const n=document.createElement("div");n.className="modal-overlay active",n.id="del-guard-overlay",n.innerHTML=`
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
        </div>`,document.body.appendChild(n);return}}catch(o){console.warn("Safety check failed, proceeding with confirmation:",o)}if(confirm(`هل تريد حذف الصنف "${e}"؟
لا توجد حركات مسجلة لهذا الصنف.`))try{await Qt("products",t),showToast("تم حذف الصنف بنجاح","success"),B=[],await z(!0)}catch(o){showToast(o.message,"error")}};window._forceDeleteProduct=async(t,e)=>{const o=document.getElementById("del-guard-overlay");if(o&&o.remove(),confirm(`⚠️ تأكيد الحذف القسري للصنف "${e}"؟
ستبقى الحركات التاريخية ولكن الصنف لن يظهر في القوائم.`))try{await Qt("products",t),showToast(`تم حذف الصنف "${e}" قسرياً`,"success"),B=[],await z(!0)}catch(i){showToast(i.message,"error")}};window.loadProducts=z;let J=null,it=null,W=[],wt=[],kt=[],A=new Map,V=new Map,L=[],$t="desc";window.switchStockTab=async t=>{const e=document.getElementById("tab-btn-balances"),o=document.getElementById("tab-btn-batches"),i=document.getElementById("tab-btn-card"),n=document.getElementById("stock-modal-body");if(!e||!o||!i)return;[e,o,i].forEach(p=>{p.classList.remove("active"),p.style.borderBottomColor="transparent",p.style.color="var(--text-2)"});const a=document.getElementById(`tab-btn-${t}`);a.classList.add("active"),a.style.borderBottomColor="var(--brand)",a.style.color="var(--brand)",n.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>';try{if(t==="balances")qt();else if(t==="batches"){if(!kt.length){const p=St(h.stockTransactions(),Tt("productId","==",J)),m=(await ct(p)).docs.map(s=>s.data()),r={};m.forEach(s=>{s.batchNumber&&(r[s.batchNumber]||(r[s.batchNumber]={qty:0,expiryDate:s.expiryDate,prodDate:s.productionDate}),r[s.batchNumber].qty+=s.qtyChange||0)}),kt=Object.keys(r).map(s=>({number:s,...r[s]})).filter(s=>s.qty>0)}ee()}else{if(!wt.length){const[p,u,m,r,s]=await Promise.all([ct(St(h.stockTransactions(),Tt("productId","==",J))),ct(h.salesInvoices?h.salesInvoices():collection(yt,`companies/${xt}/salesInvoices`)).catch(()=>({docs:[]})),ct(h.purchaseInvoices?h.purchaseInvoices():collection(yt,`companies/${xt}/purchaseInvoices`)).catch(()=>({docs:[]})),ct(h.stockTransfers?h.stockTransfers():collection(yt,`companies/${xt}/stockTransfers`)).catch(()=>({docs:[]})),Ht(J).catch(()=>[])]);W=s||[],A=new Map,V=new Map,(u.docs||[]).forEach(l=>{const c=l.data(),f=c.customerName||c.clientName||"عميل نقدي",w=c.invoiceNumber||c.number||c.code,E={type:"sale",party:f,rep:c.repName||"",status:c.status,id:l.id,date:c.date};w&&(A.set(w,f),V.set(w,E)),l.id&&(A.set(l.id,f),V.set(l.id,E))}),(m.docs||[]).forEach(l=>{const c=l.data(),f=c.supplierName||c.vendorName||"مورد معتمد",w=c.invoiceNumber||c.number||c.code,E={type:"purchase",party:f,status:c.status,id:l.id,date:c.date};w&&(A.set(w,f),V.set(w,E)),l.id&&(A.set(l.id,f),V.set(l.id,E))}),(r.docs||[]).forEach(l=>{const c=l.data(),f=c.number||c.code||c.transferNumber,w=c.fromWarehouseName||"المستودع الرئيسي",E=c.toWarehouseName||"المستودع",S=`${w} ⬅️ ${E}`,G={type:"transfer",party:S,fromN:w,toN:E,status:c.status,id:l.id,date:c.date};f&&(A.set(f,S),V.set(f,G)),l.id&&(A.set(l.id,S),V.set(l.id,G))}),wt=p.docs.map(l=>{const c=l.data(),f=c.documentNumber||c.docNum||c.docNo||c.refNo||c.refCode||c.invoiceNumber||c.number||c.notes?.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i)?.[0]||"",w=c.customerName||c.supplierName||A.get(f)||A.get(l.id)||"";return{id:l.id,...c,docNum:f,partyName:w}})}Ft()}}catch(p){n.innerHTML=`<div class="alert bad">${p.message}</div>`}};function qt(){const t=document.getElementById("stock-modal-body"),e={};Q.forEach(n=>e[n.id]=n.name);const i=B.find(n=>n.id===J)?.locationsByWarehouse||{};W.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">📦</div><p>لا يوجد رصيد في أي مخزن</p></div>':t.innerHTML=`
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>المخزن / موقع الرف</th><th>الكمية المتوفرة</th><th>حد الطلب</th><th>الحالة</th></tr></thead>
        <tbody>
          ${W.map(n=>{const a=e[n.warehouseId]||n.warehouseId,p=i[n.warehouseId]||"",u=p?`<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الرف/الموقع: ${p}</span>`:'<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الموقع غير محدد</span>';return Dt(n.qty,n.reorderLevel||0),`<tr>
              <td><strong>${a}</strong>${u}</td>
              <td class="mono font-bold">${x(n.qty)}</td>
              <td class="mono dim">${n.reorderLevel||0}</td>
              <td>${jt(n.qty,n.reorderLevel)}</td>
            </tr>`}).join("")}
          <tr style="border-top:2px solid var(--border);">
            <td class="font-bold">الإجمالي</td>
            <td class="mono font-bold text-indigo">${x(W.reduce((n,a)=>n+a.qty,0))}</td>
            <td></td><td></td>
          </tr>
        </tbody>
      </table>`}function ee(){const t=document.getElementById("stock-modal-body");kt.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">🧬</div><p>لا توجد تشغيلات (Batches) فعالة أو منتهية الصلاحية مسجلة</p></div>':t.innerHTML=`
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>رقم التشغيلة</th><th>تاريخ الإنتاج</th><th>تاريخ الانتهاء</th><th>الكمية المتبقية</th><th>الحالة</th></tr></thead>
        <tbody>
          ${kt.map(e=>{const o=e.expiryDate&&new Date(e.expiryDate)<new Date;return`
              <tr>
                <td class="mono font-bold">${e.number}</td>
                <td class="dim">${e.prodDate||"—"}</td>
                <td class="mono ${o?"text-bad font-bold":""}">${e.expiryDate||"—"}</td>
                <td class="mono font-bold">${x(e.qty)}</td>
                <td>${o?'<span class="badge bad">منتهية الصلاحية</span>':'<span class="badge good">صالحة</span>'}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>`}function Ft(t,e,o,i,n=!1){const a=document.getElementById("stock-modal-body"),p={};Q.forEach(d=>p[d.id]=d.name);const m=(B.find(d=>d.id===J)||{}).unit||"كرتون",r={purchase_invoice:"فاتورة شراء",purchase_in:"فاتورة شراء",sales_invoice:"فاتورة بيع",sale_out:"فاتورة بيع",transfer_out:"تحويل صادر",transfer_in:"تحويل وارد",sales_return:"مرتجع مبيعات",return_in:"مرتجع مبيعات",purchase_return:"مرتجع مشتريات",return_out:"مرتجع مشتريات",adjustment:"تسوية مخزنية",damage:"إهلاك تالف",donation:"تبرعات وهبات",expired:"إعدام صلاحية","return-damaged":"مرتجع تالف للمورد",assembly:"تجميع",disassembly:"تفكيك","spot-count":"جرد مفاجئ","spot-count-reversal":"إلغاء جرد مفاجئ",adjustment_in:"تسوية إضافة",adjustment_out:"تسوية خصم",adjustment_delete:"إلغاء تسوية",adjustment_reverse:"تعديل تسوية",opening:"رصيد افتتاحي",sale_cancel:"تعديل مبيعات"},s={purchase_invoice:"🛒",purchase_in:"🛒",sales_invoice:"💰",sale_out:"💰",transfer_in:"📥",transfer_out:"📤",sales_return:"↩️",return_in:"↩️",purchase_return:"↩️",return_out:"↩️",adjustment:"⚖️",adjustment_in:"➕",adjustment_out:"➖",damage:"💔",expired:"🗑️","spot-count":"🔢","return-damaged":"↩️",assembly:"🔧",disassembly:"🔩",donation:"🎁",opening:"🏁",sale_cancel:"📝"};let l=0;const c=(W||[]).map(d=>{const b=parseFloat(d.qty)||0;l+=b;const I=Q.find($=>$.id===d.warehouseId)||{name:d.warehouseName||d.warehouseId,type:"Main"},_=I.type==="Vehicle"||I.type==="Distribution"||I.name&&(I.name.includes("سيارة")||I.name.includes("مندوب")),D=b>0?_?"#2563EB":"#059669":"#64748B";return`
      <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:var(--bg-card, #fff); border:1px solid var(--border-soft); border-radius:20px; font-size:11.5px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <span>${_?"🚐":"🏢"}</span>
        <span>${I.name}:</span>
        <b class="mono" style="color:${D}; font-weight:800;">${x(b)} ${m}</b>
      </span>
    `}).join("")||'<span class="dim" style="font-size:11px;">لا توجد أرصدة مسجلة بالمستودعات</span>',f=Q.map(d=>`<option value="${d.id}" ${i===d.id?"selected":""}>${d.name}</option>`).join(""),w=`
    <!-- Live Warehouse Distribution Banner -->
    <div style="padding:10px 18px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:16px;">📍</span>
          <b style="font-size:12.5px; color:var(--text-0);">الأرصدة اللحظية المتوفرة بالمستودعات والسيارات:</b>
        </div>
        <div style="font-size:12.5px; font-weight:800; color:var(--brand);">
          📦 إجمالي رصيد المؤسسة: <span class="mono" style="font-size:14px;">${x(l)}</span> ${m}
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${c}
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
          ${f}
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

      <!-- Sorting Toggle -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">↕️ الترتيب</label>
        <div style="display:flex;gap:4px;">
          <button type="button" class="btn btn-sm ${$t==="desc"?"btn-primary":"btn-secondary"}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('desc')" title="عرض أحدث العمليات في البداية">⬆️ الأحدث</button>
          <button type="button" class="btn btn-sm ${$t==="asc"?"btn-primary":"btn-secondary"}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('asc')" title="عرض تسلسلي دفتري من البداية">⬇️ الأقدم</button>
        </div>
      </div>

      <!-- Simplified Checkbox -->
      <div style="display:inline-flex; align-items:center; gap:6px; padding-bottom:5px;">
        <input type="checkbox" id="ledger-simplified" style="width:16px; height:16px; cursor:pointer;" ${n?"checked":""} onchange="_applyLedgerFilters()" />
        <label for="ledger-simplified" style="font-size:11px; font-weight:700; color:var(--text-1); cursor:pointer;">📊 تحميل وبيع فقط</label>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:6px;align-items:flex-end;margin-right:auto;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" style="padding:6px 14px;font-size:11.5px;border-radius:6px;font-weight:700;" onclick="_applyLedgerFilters()">🔍 تطبيق</button>
        <button class="btn btn-secondary btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;" onclick="_resetLedgerFilters()">↺ إعادة</button>
        <button class="btn btn-sm" style="padding:6px 12px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="window.printCustodyReconciliationFromProductModal()" title="طباعة محضر مطابقة وجرد رسمي للسيارة أو المستودع">📋 محضر العهدة</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerExcel()">📊 Excel</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerPdf()">📄 PDF</button>
      </div>
    </div>`,E=d=>{if(d.date)return String(d.date).slice(0,10);let b=d.createdAt?.seconds||d.createdAt?._seconds;return b?new Date(b*1e3).toISOString().slice(0,10):d.createdAt?.toDate?d.createdAt.toDate().toISOString().slice(0,10):typeof d.createdAt=="string"?d.createdAt.slice(0,10):"2026-08-01"},S=d=>d==="opening"||d==="purchase_in"||d==="purchase_invoice"?1:d==="sales_return"||d==="return_in"?2:d==="transfer_in"||d==="adjustment_in"?3:d==="sale_out"||d==="sales_invoice"||d==="pos_sale"||d==="pos_out"?4:d==="transfer_out"?5:d==="adjustment_out"||d==="damage"||d==="expired"?6:7;let G=[...wt].sort((d,b)=>{const I=E(d),_=E(b);if(I!==_)return I.localeCompare(_);const D=S(d.type)-S(b.type);if(D!==0)return D;const $=d.createdAt?.seconds||d.createdAt?._seconds||(d.createdAt?.toMillis?d.createdAt.toMillis()/1e3:0),O=b.createdAt?.seconds||b.createdAt?._seconds||(b.createdAt?.toMillis?b.createdAt.toMillis()/1e3:0);return $-O});const H={};Q.forEach(d=>{H[d.id]=0});let X=0,ut=0,gt=0,mt=0;const tt=[];for(let d=0;d<G.length;d++){const b=G[d],I=b.warehouseId||"main",_=E(b),D=t&&_<t,$=b.type||"",O=["purchase_invoice","purchase_in","purchase_return","sales_return","return_in"].includes($),bt=["sales_invoice","sale_out","pos_sale","pos_out","sale_cancel","cancel_sale"].includes($),ot=["transfer_out","transfer_in","transfer_cancel"].includes($),rt=["adjustment","damage","assembly","disassembly","opening","adjustment_in","adjustment_out","spot-count"].includes($);let j=b.docNum||b.documentNumber||b.refNo||b.refCode||b.invoiceNumber||b.number||"";if(!j&&b.notes){const Y=b.notes.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i);Y&&(j=Y[0])}j||(j="—");let N=b.partyName||A.get(j)||A.get(b.id)||"";!N&&ot&&(N="🔄 تحويل بين المخازن");let P=b.qtyChange;if(P==null||isNaN(P)){const Y=Number(b.qty||b.quantity||b.qtyIn||b.qtyOut||0);P=$==="sale_out"||$==="sales_invoice"||$==="transfer_out"||$==="adjustment_out"||$==="damage"||$==="expired"?-Math.abs(Y):Math.abs(Y)}else P=Number(P);const st=($==="sale_cancel"||$==="cancel_sale")&&(String(b.notes||"").includes("إرجاع كمية التعديل")||String(b.notes||"").includes("تعديل"));let _t=!1;if(st){const Y=V.get(j)||V.get(b.id);Y&&Y.status!=="cancelled"&&(_t=!0,P=0)}H[I]=(H[I]||0)+P,ot||(X+=P);const At=i?H[i]||0:X;if(D){(!i||i===I)&&(mt=At);continue}if(e&&_>e||i&&I!==i||n&&!ot&&!bt)continue;let dt=0,lt=0;if(!i&&ot?(dt=P>0?P:0,lt=P<0?Math.abs(P):0):_t?(dt=0,lt=0):(dt=P>0?P:0,lt=P<0?Math.abs(P):0),dt&&(ut+=dt),lt&&(gt+=lt),o==="sales_invoice"&&!bt||o==="purchase_invoice"&&!O||o==="transfer_in"&&$!=="transfer_in"||o==="transfer_out"&&$!=="transfer_out"||o==="adjustment"&&!rt)continue;const Ut=p[I]||I;tt.push({...b,dateStr:_,documentNumber:j,partyName:N,whName:Ut,inQty:dt,outQty:lt,qtyChange:P,balanceAfter:At,whBalance:H[I],companyBalance:X,isIgnoredReversal:_t,isPur:O,isSale:bt,isTrans:ot,isAdj:rt})}const Z=i?parseFloat(W.find(d=>d.warehouseId===i)?.qty||0):l,et=i?H[i]||0:X,g=Math.abs(et-Z)<.001;L=tt;const v=`
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; padding:12px 18px 4px 18px;">
      <!-- Opening Balance -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#64748B;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">رصيد أول المدة 📅</div>
        <div class="mono font-bold" style="font-size:18px; color:var(--text-0); margin-top:2px;">${x(mt)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${t?"في "+t:"بداية الحركات (صفر)"}</div>
      </div>

      <!-- Total In -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الوارد 📥</div>
        <div class="mono font-bold text-good" style="font-size:18px; margin-top:2px;">+${x(ut)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${i?"شحنات مستلمة":"مشتريات ومرتجعات"}</div>
      </div>

      <!-- Total Out -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#EF4444;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الصادر 📤</div>
        <div class="mono font-bold text-bad" style="font-size:18px; margin-top:2px;">-${x(gt)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${i?"مبيعات مسلمة":"مبيعات وهالك"}</div>
      </div>

      <!-- Current Stock -->
      <div style="background:rgba(16,185,129,0.04); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:#059669; font-weight:800;">الرصيد الفعلي الحالي 📦</div>
        <div class="mono font-bold text-good" style="font-size:19px; margin-top:2px;">${x(Z)} ${m}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${i?"بالمستودع المحدد":"شامل المؤسسة والسيارات"}</div>
      </div>
    </div>
  `,y=g?`<div style="margin:8px 18px; padding:8px 14px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; color:#059669; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>✅</span>
        <span><b>تدقيق مطابق 100%:</b> الرصيد التراكمي لدفتر الأستاذ (${x(et)}) يطابق تماماً الرصيد الفعلي في المستودع (${x(Z)} ${m}). لا يوجد أي عجز أو تضارب دفتري.</span>
      </div>`:`<div style="margin:8px 18px; padding:8px 14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#DC2626; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>⚠️</span>
        <span><b>تنبيه تدقيق:</b> رصيد الدفتر التراكمي (${x(et)}) والرصيد المسجل بالمستودع (${x(Z)} ${m}). الفارق: ${x(et-Z)}.</span>
      </div>`,k=$t==="desc"?[...tt].reverse():[...tt],at=k.length===0?'<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔍</div><p>لا توجد حركات تطابق الفلاتر المحددة</p></div>':`<div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2;">
            <th style="padding:9px 10px; width:35px; text-align:center; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">#</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft); white-space:nowrap;">📅 التاريخ</th>
            <th style="padding:9px 12px; text-align:center; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">نوع الحركة</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">رقم المستند</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">👤 الطرف الثاني (العميل / المورد / المسار)</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">المخزن / الموقع</th>
            <th style="padding:9px 10px; text-align:center; font-size:11px; font-weight:700; color:#10B981; border-bottom:2px solid var(--border-soft);">وارد (+)</th>
            <th style="padding:9px 10px; text-align:center; font-size:11px; font-weight:700; color:#EF4444; border-bottom:2px solid var(--border-soft);">صادر (-)</th>
            <th style="padding:9px 12px; text-align:center; font-size:11px; font-weight:700; color:var(--brand); border-bottom:2px solid var(--border-soft);">الرصيد بعد 📦</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">البيان والملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${k.map((d,b)=>{const I=d.type||d.refType||"adjustment",_=r[I]||I,D=s[I]||"📋",$=b%2===0?"var(--bg-1)":"var(--bg-2)",O=d.inQty>0,bt=O?`<span style="background:rgba(16,185,129,.12);color:#10B981;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">+${x(d.inQty)}</span>`:'<span style="color:var(--text-3);">—</span>',ot=!O&&d.outQty>0?`<span style="background:rgba(239,68,68,.1);color:#EF4444;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">-${x(d.outQty)}</span>`:'<span style="color:var(--text-3);">—</span>';let rt="";i?rt=`<span style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${x(d.balanceAfter)}</span>`:rt=`
                <div style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${x(d.companyBalance)}</div>
                <div style="font-size:9.5px; color:var(--text-3); font-family:var(--font-mono);">مخزن: ${x(d.whBalance)}</div>
              `;let j='<span style="color:var(--text-3);">—</span>';if(d.partyName){let P="#475569",st="👤";d.isSale?(P="#0284c7",st="👤"):d.isPur?(P="#d97706",st="🏭"):d.isTrans&&(P="#6366f1",st="🔄"),j=`
                <span style="display:inline-flex; align-items:center; gap:5px; font-weight:700; color:${P}; font-size:12px;">
                  <span>${st}</span>
                  <span>${d.partyName}</span>
                </span>
              `}let N=d.notes||d.note||d.description||"";return d.isIgnoredReversal?N="[حركة تعديل محاسبي دفتري — مسجلة لأغراض التدقيق بدون خصم مادي]":N||(d.isSale?N=`فاتورة بيع للعميل: ${d.partyName||"نقدي"}`:d.isPur?N=`توريد مشتريات من المورد: ${d.partyName||"معتمد"}`:d.isTrans?N=`تحويل بضاعة: ${d.partyName||"بين المستودعات"}`:N="—"),`
              <tr style="background:${$}; border-bottom:1px solid var(--border-soft); transition:background .15s;"
                onmouseover="this.style.background='rgba(91,127,255,.06)'"
                onmouseout="this.style.background='${$}'">
                <td style="padding:8px 10px; text-align:center; color:var(--text-3); font-family:var(--font-mono); font-size:11px;">${b+1}</td>
                <td style="padding:8px 12px; white-space:nowrap; color:var(--text-2); font-family:var(--font-mono); font-size:11.5px;">${d.dateStr}</td>
                <td style="padding:8px 12px; white-space:nowrap; text-align:center;">
                  <span style="
                    display:inline-flex; align-items:center; gap:4px;
                    background:${O?"rgba(16,185,129,.1)":"rgba(239,68,68,.08)"};
                    color:${O?"#059669":"#DC2626"};
                    padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;
                  ">${D} ${_}</span>
                </td>
                <td style="padding:8px 12px; font-family:var(--font-mono); font-weight:700; color:var(--brand); font-size:12px;">${d.documentNumber||"—"}</td>
                <td style="padding:8px 12px; white-space:nowrap;">${j}</td>
                <td style="padding:8px 12px; font-size:11.5px; color:var(--text-1);">${d.whName}</td>
                <td style="padding:8px 10px; text-align:center;">${bt}</td>
                <td style="padding:8px 10px; text-align:center;">${ot}</td>
                <td style="padding:8px 12px; text-align:center;">${rt}</td>
                <td style="padding:8px 12px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-2); font-size:11.5px;"
                  title="${N.replace(/"/g,"&quot;")}">${N}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>`;a.innerHTML=w+v+y+at}window.toggleProductModalSort=t=>{$t=t,_applyLedgerFilters()};window._applyLedgerFilters=()=>{const t=document.getElementById("ledger-from")?.value||"",e=document.getElementById("ledger-to")?.value||"",o=document.getElementById("ledger-type")?.value||"",i=document.getElementById("ledger-warehouse")?.value||"",n=document.getElementById("ledger-simplified")?.checked||!1;Ft(t,e,o,i,n)};window._resetLedgerFilters=()=>{Ft("","","","",!1)};window._exportLedgerExcel=async()=>{try{if(!L||L.length===0){showToast("لا توجد بيانات للتصدير","warning");return}const t=["م","التاريخ","نوع الحركة","رقم المستند","الطرف الثاني (العميل / المورد / المسار)","المستودع","وارد (+)","صادر (-)","الرصيد بعد","البيان والملاحظات"],e=[6,12,16,16,25,18,10,10,12,35],o=L.map((n,a)=>[a+1,n.dateStr,n.type||"حركة",n.documentNumber||"—",n.partyName||"—",n.whName||"—",n.inQty||"—",n.outQty||"—",n.balanceAfter!==void 0?n.balanceAfter:0,n.notes||n.note||n.description||"—"]),i=`دفتر_حركة_${it||"الصنف"}_${new Date().toISOString().slice(0,10)}`;await Ot({title:i,headers:t,rows:o,colWidths:e}),showToast("تم تصدير Excel بنجاح ✅","success")}catch(t){showToast("خطأ في التصدير: "+t.message,"error")}};window._exportLedgerPdf=()=>{if(!L||L.length===0){showToast("لا توجد بيانات للتصدير","warning");return}const t=(()=>{const i=document.getElementById("ledger-from")?.value||"",n=document.getElementById("ledger-to")?.value||"";return i&&n?`من ${i} إلى ${n}`:i?`من ${i}`:n?`حتى ${n}`:"كل الفترات"})(),e=L.map((i,n)=>{const a=i.inQty>0;return`<tr style="background:${n%2===0?"#fff":"#f8fafc"}">
      <td style="text-align:center;">${n+1}</td>
      <td>${i.dateStr}</td>
      <td><span style="background:${a?"#dcfce7":"#fee2e2"};color:${a?"#166534":"#991b1b"};padding:2px 6px;border-radius:10px;font-size:10px;">${i.type||""}</span></td>
      <td style="font-weight:700;color:#1e3a8a;">${i.documentNumber||"—"}</td>
      <td style="font-weight:700;">${i.partyName||"—"}</td>
      <td>${i.whName||"—"}</td>
      <td style="color:#16a34a;font-weight:700;text-align:center;">${i.inQty?"+"+x(i.inQty):"—"}</td>
      <td style="color:#dc2626;font-weight:700;text-align:center;">${i.outQty?"-"+x(i.outQty):"—"}</td>
      <td style="font-weight:700;color:#1d4ed8;text-align:center;">${x(i.balanceAfter||0)}</td>
      <td style="color:#64748b;font-size:10.5px;">${i.notes||i.note||i.description||"—"}</td>
    </tr>`}).join(""),o=window.open("","_blank","width=1100,height=750");o.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8">
    <title>دفتر حركة - ${it||""}</title>
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
        <p>دفتر حركة تفصيلي: <strong>${it||""}</strong></p>
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
  </body></html>`),o.document.close(),setTimeout(()=>o.focus(),300)};window.printCustodyReconciliationFromProductModal=()=>{if(!J)return;const t=B.find(l=>l.id===J)||{name:it,unit:"كرتون",sku:"—"},e=document.getElementById("ledger-warehouse")?.value||"",i=Q.find(l=>l.id===e)?.name||"جميع المستودعات والسيارات",n=L.filter(l=>l.inQty>0),a=n.reduce((l,c)=>l+(c.inQty||0),0),p=L.filter(l=>l.outQty>0),u=p.reduce((l,c)=>l+(c.outQty||0),0),m=L.length>0?L[L.length-1].balanceAfter:0,r=t.unit||"كرتون",s=window.open("","_blank","width=920,height=800");s.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${t.name||it} — ${i}</title>
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
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${t.name||it}</span> (SKU: <span class="mono">${t.sku||"—"}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${i}</span></div>
    <div><b>الوحدة:</b> <span>${r}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${x(a)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${x(u)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${x(m)} ${r}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${L.length} حركة</div>
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
      ${n.map((l,c)=>`
        <tr>
          <td style="text-align:center;" class="mono">${c+1}</td>
          <td class="mono">${l.dateStr}</td>
          <td class="mono font-bold">${l.documentNumber||"—"}</td>
          <td>${l.partyName||l.notes||"استلام شحنة معتمدة"}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${x(l.inQty)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${x(a)}</td>
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
      ${p.map((l,c)=>`
        <tr>
          <td style="text-align:center;" class="mono">${c+1}</td>
          <td class="mono">${l.dateStr}</td>
          <td class="mono font-bold">${l.documentNumber||"—"}</td>
          <td><b>${l.partyName||"عميل نقدي"}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${x(l.outQty)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("")||'<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${x(u)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${x(m)} ${r}</b></div>
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
</html>`),s.document.close(),setTimeout(()=>{s.focus(),s.print(),s.close()},700)};window.reconcileProductStock=async(t,e)=>{e&&(e.disabled=!0,e.innerHTML="⏳ جارٍ التدقيق…");try{wt=[],W=[],await switchStockTab("card"),showToast("تم تدقيق ومطابقة حركات الصنف بنجاح ✅","success")}catch(o){showToast("فشل التدقيق: "+o.message,"error")}finally{e&&(e.disabled=!1,e.innerHTML="⚖️ تدقيق ومطابقة الرصيد")}};window.viewStock=async(t,e=null)=>{if(J=t,!e){const i=B.find(n=>n.id===t);e=i&&(i.name||i.nameAr)||""}it=e,W=[],wt=[],kt=[],document.getElementById("stock-modal-title").textContent=`بطاقة الصنف: ${e}`;const o=document.getElementById("stock-modal-body");o.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>',openModal("stock-modal");try{W=await Ht(t),qt()}catch(i){o.innerHTML=`<div class="alert bad">${i.message}</div>`}};window.setupProductSearch=()=>{const t=document.getElementById("prod-search");t&&t.addEventListener("input",Kt(()=>z(!0),400))};window.exportProducts=async()=>{showToast("جارٍ تصدير البيانات…","info");try{const t=await K(h.products(),[Mt("sku")]),e=[["الكود","الاسم","الاسم الإنجليزي","الفئة","التتبع","الوحدة","درجة حرارة الحفظ","سعر التكلفة","سعر البيع","الباركود"]];t.forEach(a=>e.push([a.sku,a.name,a.nameEn||"",a.categoryName||a.category,a.tracking,a.unit,a.storageTemperature,a.costPrice,a.salePrice,a.barcode]));const o=e.map(a=>a.map(p=>`"${p||""}"`).join(",")).join(`
`),i=new Blob(["\uFEFF"+o],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a");n.href=URL.createObjectURL(i),n.download=`products_${new Date().toISOString().split("T")[0]}.csv`,n.click(),showToast("تم تصدير الملف بنجاح","success")}catch(t){showToast(t.message,"error")}};window.loadNextPage=()=>{F++,z()};window.loadPrevPage=()=>{F>0&&(F--,Lt=null,z())};window.printProductBarcode=async t=>{try{const{getById:e}=await Bt(async()=>{const{getById:a}=await import("./index-T8P1GM2w.js").then(p=>p.T);return{getById:a}},__vite__mapDeps([0,1])),o=await e("products",t);if(!o)return;const i=o.barcode||o.sku,n=window.open("","_blank");n.document.write(`
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
          JsBarcode("#barcode-svg", "${i}", {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: true
          });
          setTimeout(() => { window.print(); window.close(); }, 500);
        <\/script>
      </body>
      </html>
    `),n.document.close()}catch(e){showToast(e.message,"error")}};window.exportProductsExcel=async()=>{try{const t=B.length>0?B:await K(h.products(),[Mt("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.sku||"",o.name||o.nameAr||"",o.nameEn||"",o.barcode||"",o.categoryName||"",o.unit||"",o.altUnit||"",o.unitFactor||1,o.costPrice||0,o.salePrice||0,o.priceWholesale||0,o.taxCategory==="S"?15:0,o.reorderLevel||0,o.tracking||"none",o.totalQty||0,o.active===!1?"غير نشط":"نشط",o.notes||""]);await Ot({title:"كتالوج_الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة","سعر البيع","سعر الجملة","ضريبة القيمة المضافة %","حد إعادة الطلب","نظام التتبع","المخزون الحالي","الحالة","ملاحظات"],rows:e,colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,12,14,10,22]}),showToast(`تم تصدير ${e.length} صنف بنجاح ✅`,"success")}catch(t){showToast("خطأ في التصدير: "+t.message,"error")}};window.downloadProductTemplate=async()=>{try{await Wt({title:"الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","اسم الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة*","سعر البيع*","سعر الجملة","ضريبة (S أو E)","حد إعادة الطلب","نظام التتبع (none/batch/serial)"],sampleRows:[["P001","زيت نخيل","Palm Oil","6281234567890","زيوت","لتر","كرتون",12,18.5,25,22,"S",50,"none"],["P002","سكر أبيض","White Sugar","6281234567891","سلع أساسية","كيلو","كيس",50,3,4.5,4,"S",100,"none"]],colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,22]}),showToast("تم تنزيل نموذج الاستيراد ✅","success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openProductImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="prod-import-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t)};let Et=[];window.handleImportFileDrop=async t=>{if(t)try{showToast("جاري قراءة الملف…","info");const{headers:e,rows:o}=await Gt(t);Et=o;const i=[],n={};o.forEach((r,s)=>{const l=String(r[e[0]]||r["كود الصنف (SKU)*"]||r.SKU||"").trim(),c=String(r[e[1]]||r["الاسم العربي*"]||r["اسم الصنف"]||"").trim();l||i.push(`الصف ${s+2}: كود الصنف (SKU) مطلوب`),c||i.push(`الصف ${s+2}: الاسم العربي مطلوب`),n[l]&&i.push(`الصف ${s+2}: كود مكرر "${l}"`),l&&(n[l]=!0)});const a=Object.keys(o[0]||{}).slice(0,8),p=o.slice(0,10),u=`
      <thead><tr>${a.map(r=>`<th>${r}</th>`).join("")}${a.length<Object.keys(o[0]||{}).length?"<th>…</th>":""}</tr></thead>
      <tbody>${p.map((r,s)=>`<tr style="background:${s%2===0?"var(--bg-1)":"var(--bg-2)"}">${a.map(l=>`<td>${r[l]||""}</td>`).join("")}${a.length<Object.keys(r).length?"<td>…</td>":""}</tr>`).join("")}</tbody>
    `;document.getElementById("import-preview-table").innerHTML=u;const m=[{label:"إجمالي الصفوف",val:o.length,color:"#2563eb"},{label:"الأعمدة",val:e.length,color:"#10B981"},{label:"أخطاء",val:i.length,color:i.length?"#EF4444":"#10B981"}].map(r=>`
      <div style="background:var(--bg-2);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;align-items:center;min-width:100px;">
        <span style="font-size:22px;font-weight:800;color:${r.color};">${r.val}</span>
        <span style="font-size:11px;color:var(--text-2);">${r.label}</span>
      </div>`).join("");document.getElementById("import-stats").innerHTML=m,i.length>0?document.getElementById("import-validation-errors").innerHTML=`
        <div class="alert bad" style="max-height:120px;overflow:auto;">
          <strong>⚠️ تحذيرات التحقق (${i.length}):</strong><br>
          ${i.slice(0,15).map(r=>`<div style="font-size:11px;">${r}</div>`).join("")}
          ${i.length>15?`<div style="font-size:11px;">...و ${i.length-15} أخرى</div>`:""}
        </div>`:document.getElementById("import-validation-errors").innerHTML='<div class="alert good">✅ جميع البيانات صحيحة وجاهزة للاستيراد</div>',document.getElementById("import-step-1").style.display="none",document.getElementById("import-step-2").style.display="block",i.length===0&&(document.getElementById("import-confirm-btn").style.display=""),showToast(`تم قراءة ${o.length} صنف. راجع البيانات قبل الاستيراد.`,o.length>0?"success":"warn")}catch(e){showToast("خطأ في قراءة الملف: "+e.message,"error")}};window.executeProductImport=async()=>{const t=document.getElementById("import-confirm-btn");t.disabled=!0,t.textContent="⏳ جاري الاستيراد…";let e=0,o=0,i=0;try{const n=await K(h.products(),[]),a={};n.forEach(r=>{r.sku&&(a[r.sku.trim()]=r.id)});const p=M.length>0?M:await K(h.categories?h.categories():`companies/${xt}/categories`,[Mt("name")]).catch(()=>[]),u={};p.forEach(r=>{u[(r.name||"").trim().toLowerCase()]={id:r.id,name:r.name}});const m=50;for(let r=0;r<Et.length;r++){const s=Et[r],l=String(s["كود الصنف (SKU)*"]||s.SKU||s[Object.keys(s)[0]]||"").trim(),c=String(s["الاسم العربي*"]||s.الاسم||s[Object.keys(s)[1]]||"").trim();if(!l||!c){i++;continue}const f=String(s["اسم الفئة"]||s.الفئة||"").trim().toLowerCase(),w=u[f]||{},E={sku:l,name:c,nameAr:c,nameEn:String(s["الاسم الإنجليزي"]||"").trim()||null,barcode:String(s.الباركود||"").trim()||null,categoryId:w.id||null,categoryName:w.name||s["اسم الفئة"]||s.الفئة||null,unit:String(s["وحدة البيع"]||"حبة").trim(),altUnit:String(s["الوحدة الكبرى"]||"").trim()||null,unitFactor:parseFloat(s["معامل التحويل"]||1)||1,costPrice:parseFloat(s["سعر التكلفة*"]||s["سعر التكلفة"]||0)||0,salePrice:parseFloat(s["سعر البيع*"]||s["سعر البيع"]||0)||0,priceWholesale:parseFloat(s["سعر الجملة"]||0)||0,taxCategory:String(s["ضريبة (S أو E)"]||s.ضريبة||"S").toUpperCase()==="E"?"E":"S",reorderLevel:parseInt(s["حد إعادة الطلب"]||0)||0,tracking:String(s["نظام التتبع (none/batch/serial)"]||s["نظام التتبع"]||"none").toLowerCase(),active:!0,updatedAt:new Date().toISOString()};try{a[l]?(await Ct(h.products(),a[l],E),o++):(E.createdAt=new Date().toISOString(),await Rt(h.products(),E),e++)}catch(S){i++,console.warn("Import row failed:",l,S)}r%10===0&&(t.textContent=`⏳ ${r+1} / ${Et.length}`),await new Promise(S=>setTimeout(S,20))}document.getElementById("prod-import-overlay").remove(),showToast(`✅ الاستيراد مكتمل — مضاف: ${e} | محدَّث: ${o} | فاشل: ${i}`,"success"),B=[],Lt=null,ht=!1,await z()}catch(n){showToast("خطأ في الاستيراد: "+n.message,"error"),t.disabled=!1,t.textContent="✅ استيراد البيانات"}};function zt(t){return{Piece:"حبة",Kilogram:"كجم",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Carton:"كرتون",Box:"صندوق",Pallet:"باليت",Bag:"كيس",Bale:"بالة",Tank:"تنك",Barrel:"برميل",Roll:"رول",Pack:"شد / ربطة",Sack:"شوال",Tray:"طبق",Gallon:"جالون",Ton:"طن"}[t]||t||""}function Nt(){return(document.getElementById("prod-zatca-tax")?.value||"S")==="S"?1.15:1}window.onCostInput=()=>{typeof applySuggestedCategoryMargin=="function"&&applySuggestedCategoryMargin(),["retail","wholesale","distributor"].forEach(t=>{const e=document.getElementById(`prod-pct-${t}`);e&&e.value!==""&&window.onPctInput(t)})};window.onPriceInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),n=document.getElementById(`prod-pct-${t}`);if(!o)return;const a=parseFloat(o.value)||0,p=Nt();if(i&&(i.value=a>0?(a*p).toFixed(2):""),n)if(e>0&&a>0){const u=(a-e)/e*100;n.value=u.toFixed(1)}else n.value=""};window.onPriceIncInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),n=document.getElementById(`prod-pct-${t}`);if(!i)return;const a=parseFloat(i.value)||0,p=Nt(),u=a>0?a/p:0;if(o&&(o.value=u>0?u.toFixed(2):""),n)if(e>0&&u>0){const m=(u-e)/e*100;n.value=m.toFixed(1)}else n.value=""};window.onPctInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),n=document.getElementById(`prod-pct-${t}`);if(!n)return;const a=parseFloat(n.value)||0,p=Nt();if(e>0){const u=e*(1+a/100);o&&(o.value=u.toFixed(2)),i&&(i.value=(u*p).toFixed(2))}else o&&(o.value=""),i&&(i.value="")};window.loadNextPage=()=>{ht&&(F++,z())};window.loadPrevPage=()=>{F>0&&(F--,z())};window.onTargetMarginInput=()=>{const t=parseFloat(document.getElementById("prod-target-margin-pct")?.value),e=document.getElementById("prod-margin-type")?.value||"markup";if(isNaN(t)||t<0)return;const o=parseFloat(document.getElementById("prod-purchase-price")?.value)||0,i=window._currentEditingProduct||{},n=parseFloat(i.lastPurchasePrice)||0,a=n>0?n:o;if(a>0){let p=0;e==="margin"&&t<100?p=Math.round(a/(1-t/100)*100)/100:p=Math.round(a*(1+t/100)*100)/100;const u=document.getElementById("prod-price-retail");u&&(u.value=p.toFixed(2),window.onPriceInput("retail"));const m=Math.max(0,t-5),r=Math.max(0,t-10);let s=0,l=0;e==="margin"&&m<100?(s=Math.round(a/(1-m/100)*100)/100,l=Math.round(a/(1-r/100)*100)/100):(s=Math.round(a*(1+m/100)*100)/100,l=Math.round(a*(1+r/100)*100)/100);const c=document.getElementById("prod-price-wholesale");c&&(c.value=s.toFixed(2),window.onPriceInput("wholesale"));const f=document.getElementById("prod-price-distributor");f&&(f.value=l.toFixed(2),window.onPriceInput("distributor"))}};window.applyLastPurchasePricePricing=()=>{const t=window._currentEditingProduct||{},e=parseFloat(t.lastPurchasePrice)||0;if(e<=0){window.showToast?.("لا يوجد آخر سعر شراء مسجل لهذا الصنف بعد","warn");return}const o=document.getElementById("prod-purchase-price");o&&(o.value=e.toFixed(2));const i=document.getElementById("prod-target-margin-pct");let n=parseFloat(i?.value);(isNaN(n)||n<=0)&&(n=15,i&&(i.value=n)),window.onTargetMarginInput(),window.showToast?.(`✅ تم تطبيق آخر سعر شراء (${C(e)}) وحساب أسعار البيع بهامش ${n}%`,"success")};export{z as loadProducts,pe as render};
