const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{g as P,C as g,_ as U,d as lt,f as I,j as rt,k as S,l as ct,m as vt,u as W,n as pt,r as gt,o as bt,p as yt,a as ut}from"./index-HrCilPJ3.js";import{e as ht,d as xt,i as ft}from"./excel-zCoXiaxq.js";import{getDocs as N,query as dt,where as st,orderBy as K,getDoc as wt,doc as kt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let x=[],w=0;const j=50;let G=null,R=!1,_="",F="",T=[],y=[],k=null,A=null;async function It(){if(A)return A;try{const t=await wt(kt(lt,`companies/${ut}/settings`,"system"));t.exists()&&(A=t.data())}catch(t){console.error("Failed to load pricing settings:",t)}return A||{}}function Et(t){return t.length===0?'<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مطابقة</td></tr>':t.map(e=>{const o=e._totalQty!==void 0&&e._totalQty!==null&&e._totalQty>0?e._totalQty:e.totalQty!==void 0&&e.totalQty>0?e.totalQty:e.stockQty||0,i=rt(o,e.reorderLevel||0),a=e.costPrice||e.purchasePrice||0,n=e.sellingPrice||e.salePrice||e.priceRetail||e.price||0,l=n>0?(n-a)/n*100:0;let r="low";l>20?r="high":l>=10&&(r="medium");const c=(e.name||e.nameAr||"").replace(/'/g,"\\'"),d=e.sku||e.code||"—";return`
      <tr class="status-${i.color}">
        <td><button class="btn btn-icon sm btn-ghost" onclick="viewStock('${e.id}','${c}')" title="كشف حركة الصنف">📦</button></td>
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}','${c}')" title="كشف حركة الصنف">${d}</td>
        <td style="cursor:pointer;" onclick="viewStock('${e.id}','${c}')" title="كشف حركة الصنف">
          <strong>${e.name||e.nameAr}</strong>
          ${e.nameEn?`<div class="dim" style="font-size:10px;">${e.nameEn}</div>`:""}
          ${e.barcode?`<div class="mono dim" style="font-size:10px;">Barcode: ${e.barcode}</div>`:""}
        </td>
        <td>
          ${e.tracking==="batch"?'<span class="badge warn" style="font-size:10px;">التشغيلة</span>':e.tracking==="serial"?'<span class="badge info" style="font-size:10px;">تسلسلي</span>':'<span class="badge neutral" style="font-size:10px;">عام</span>'}
        </td>
        <td class="dim">${e.categoryName||"—"}</td>
        <td>${q(e.unit||"Piece")}${e.altUnit?` (${q(e.altUnit)}: ${e.unitFactor} ${q(e.unit||"Piece")})`:""}</td>
        
        <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
            ondblclick="inlineEditPrice(this, '${e.id}', 'costPrice', ${a})">
          ${I(a)}
        </td>
        
        <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
            ondblclick="inlineEditPrice(this, '${e.id}', 'salePrice', ${n})">
          <span class="profit-dot ${r}" title="هامش الربح: ${l.toFixed(1)}%"></span>
          ${I(n)}
        </td>
        
        <td>${e.taxCategory==="S"?"15%":"0%"}</td>
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${e.id}','${c}')" title="كشف حركة الصنف">${S(o)}</td>
        <td>${ct(o,e.reorderLevel)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="printProductBarcode('${e.id}')" title="طباعة باركود">🏷️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editProduct('${e.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteProduct('${e.id}','${c}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}async function _t(t,e){if(!document.getElementById("prod-local-styles")){const n=document.createElement("style");n.id="prod-local-styles",n.innerHTML=`
      .skeleton-row td { padding: 12px 14px; }
      .profit-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
      .profit-dot.high { background: #10B981; }
      .profit-dot.medium { background: #F59E0B; }
      .profit-dot.low { background: #EF4444; }
      td.price-editable { cursor: pointer; position: relative; }
      td.price-editable:hover { background: rgba(91, 127, 255, 0.08) !important; color: var(--brand); }
    `,document.head.appendChild(n)}x=[],t.innerHTML=`
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
          ${y.map(n=>`<option value="${n.id}" ${_===n.id?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="prod-status-filter">
          <option value="">الكل</option>
          <option value="ok" ${F==="ok"?"selected":""}>متوفر</option>
          <option value="low" ${F==="low"?"selected":""}>منخفض</option>
          <option value="out" ${F==="out"?"selected":""}>نافد</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
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
          <div class="inv-kpi-value" id="kpi-total-val">${k?I(k.totalValue):"—"}</div>
          <div class="inv-kpi-label">قيمة المخزون (سعر البيع)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-teal">
        <div class="inv-kpi-icon">🏷️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-cost">${k?I(k.totalCost):"—"}</div>
          <div class="inv-kpi-label">تكلفة المخزون (الشرائية)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-green">
        <div class="inv-kpi-icon">📈</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-margin-pct">${k?`${k.avgMargin}%`:"—"}</div>
          <div class="inv-kpi-label">متوسط هامش الربح %</div>
        </div>
      </div>
      <div class="inv-kpi-card g-orange">
        <div class="inv-kpi-icon">⚠️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-low-stock">${k?k.lowStockCount:"—"}</div>
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
                <th style="width:36px;"></th>
                <th>الكود</th>
                <th>اسم الصنف (عربي/إنجليزي)</th>
                <th>التتبع</th>
                <th>الفئة</th>
                <th>الوحدات والتحويل</th>
                <th style="text-align:left;">التكلفة (المتوسط)</th>
                <th style="text-align:left;">سعر البيع (جملة/تجزئة)</th>
                <th>الضريبة</th>
                <th>المخزون الإجمالي</th>
                <th>الحالة</th>
                <th style="width:80px;"></th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:20px;height:20px;border-radius:50%;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:60px;height:24px;border-radius:6px;"></div></td>
                </tr>
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:20px;height:20px;border-radius:50%;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:60px;height:24px;border-radius:6px;"></div></td>
                </tr>
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:20px;height:20px;border-radius:50%;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:60px;height:24px;border-radius:6px;"></div></td>
                </tr>
              
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border-soft);">
          <button class="btn btn-sm btn-secondary" id="prev-page-btn" onclick="loadPrevPage()" ${w===0?"disabled":""}>السابق</button>
          <span id="page-counter" class="text-2 mono" style="font-size:12px;">الصفحة ${w+1}</span>
          <button class="btn btn-sm btn-secondary" id="next-page-btn" onclick="loadNextPage()" ${R?"":"disabled"}>التالي</button>
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
                <label>سعر الشراء الافتراضي (ر.س)</label>
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
      <div class="modal modal-lg">
        <div class="modal-header" style="border-bottom:none; padding-bottom:0;">
          <h3 class="modal-title" id="stock-modal-title">تفاصيل بطاقة الصنف</h3>
          <button class="modal-close" onclick="closeModal('stock-modal')">×</button>
        </div>
        <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin: 0 24px 16px 24px;">
          <button class="tab-btn active" id="tab-btn-balances" onclick="switchStockTab('balances')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">أرصدة المخازن</button>
          <button class="tab-btn" id="tab-btn-batches" onclick="switchStockTab('batches')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">التشغيلات والتواريخ (Batches)</button>
          <button class="tab-btn" id="tab-btn-card" onclick="switchStockTab('card')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">دفتر الحركة التفصيلي</button>
        </div>
        <div class="modal-body" id="stock-modal-body">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </div>
  `;const o=document.getElementById("prod-cat-filter");o&&o.addEventListener("change",()=>{_=o.value,f(!0)});const i=document.getElementById("prod-status-filter");i&&i.addEventListener("change",()=>{F=i.value,f(!0)}),window.setupProductSearch();const a=sessionStorage.getItem("filter_category_id");a&&(_=a,sessionStorage.removeItem("filter_category_id")),await f(!0)}async function f(t=!1){t&&(G=null,w=0,y=[],T=[]);const e=document.getElementById("prod-tbody");if(e)try{if(y.length===0){y=await P(g.categories());const m=[{id:"dairy",name:"ألبان ومنتجاتها",icon:"🥛"},{id:"oils",name:"زيوت وسمن",icon:"🌻"},{id:"rice_grains",name:"أرز وحبوب",icon:"🌾"},{id:"dry_goods",name:"سكر ودقيق ومعجنات",icon:"🍞"},{id:"beverages",name:"مشروبات وعصائر",icon:"🧃"},{id:"water",name:"مياه معبأة",icon:"💧"},{id:"meat_poultry",name:"لحوم ودواجن مجمدة",icon:"🍗"},{id:"seafood",name:"أسماك ومأكولات بحرية",icon:"🐟"},{id:"canned",name:"معلبات وصلصات",icon:"🥫"},{id:"confectionery",name:"حلويات وشوكولاتة",icon:"🍫"},{id:"biscuits",name:"بسكويت وكيك",icon:"🍪"},{id:"spices",name:"توابل وبهارات",icon:"🧂"},{id:"coffee_tea",name:"قهوة وشاي",icon:"☕"},{id:"cleaning",name:"منظفات ومعطرات",icon:"🧴"},{id:"personal_care",name:"عناية شخصية وورقيات",icon:"🧻"},{id:"baby",name:"أطفال وحفاضات",icon:"👶"},{id:"bakery",name:"مخبوزات وخبز",icon:"🥖"},{id:"frozen",name:"أغذية مجمدة",icon:"🧊"},{id:"honey_jam",name:"عسل ومربيات وطحينة",icon:"🍯"},{id:"snacks",name:"شيبس ومكسرات",icon:"🥜"},{id:"veg_fruits",name:"خضار وفواكه طازجة",icon:"🍅"},{id:"frozen_veg",name:"خضروات مجمدة",icon:"🥦"},{id:"dates",name:"تمور ومنتجاتها",icon:"🌴"},{id:"pickles",name:"مخللات وأجبان مكشوفة",icon:"🥒"},{id:"plastics",name:"بلاستيكيات ومستلزمات تغليف",icon:"🛍️"},{id:"disposables",name:"أكواب ومستلزمات ضيافة",icon:"🥤"},{id:"tobacco",name:"تبغ ومستلزمات تدخين",icon:"🚬"},{id:"egg",name:"بيض طازج",icon:"🥚"},{id:"sauces",name:"صلصات ومايونيز وتوابل سائلة",icon:"🍯"},{id:"nuts_seeds",name:"مكسرات وبذور",icon:"🌰"},{id:"ice_cream",name:"آيس كريم وحلويات باردة",icon:"🍦"}].filter(v=>!y.some(b=>b.id===v.id));if(m.length>0)try{const{writeBatch:v,doc:b}=await U(async()=>{const{writeBatch:$,doc:Q}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:$,doc:Q}},[]),nt=v(lt);m.forEach($=>{const Q=b(g.categories(),$.id);nt.set(Q,{name:$.name,code:$.id,icon:$.icon,description:`أصناف تابعة لقسم ${$.name}`,createdAt:new Date,updatedAt:new Date},{merge:!0})}),await nt.commit(),y=await P(g.categories())}catch(v){console.error("Auto-seed categories failed:",v)}}const o=document.getElementById("prod-cat-filter");o&&(o.innerHTML='<option value="">كل الفئات</option>'+y.map(p=>`<option value="${p.id}" ${_===p.id?"selected":""}>${p.name}</option>`).join(""));const i=document.getElementById("prod-category");i&&(i.innerHTML='<option value="">اختر الفئة...</option>'+y.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")),T.length===0&&(T=await P(g.warehouses()));let n=(await N(g.products())).docs.map(p=>({id:p.id,...p.data()}));n.sort((p,m)=>(p.sku||"").localeCompare(m.sku||"",void 0,{numeric:!0}));try{const p=await N(g.stockByWarehouse()),m={};p.docs.forEach(v=>{const b=v.data();b.productId&&(m[b.productId]=(m[b.productId]||0)+(b.qty||0))}),n.forEach(v=>{v._totalQty=m[v.id]!==void 0?m[v.id]:v.stockQty||0})}catch(p){console.warn("Stock balances unavailable:",p)}x=n;const l=document.getElementById("prod-cat-filter")?.value||_||"",r=document.getElementById("prod-status-filter")?.value||F||"",c=(document.getElementById("prod-search")?.value||"").trim().toLowerCase();let d=[...x];l&&(d=d.filter(p=>p.category===l)),r&&(d=d.filter(p=>{const m=p._totalQty||0,v=p.reorderLevel||0;return r==="out"?m<=0:r==="low"?m>0&&m<=v:r==="ok"?m>v:!0})),c&&(d=d.filter(p=>p.name?.toLowerCase().includes(c)||p.sku?.toLowerCase().includes(c)||p.barcode?.includes(c)||p.nameEn?.toLowerCase().includes(c)||p.categoryName?.toLowerCase().includes(c))),R=d.length>(w+1)*j;const s=w*j,u=d.slice(s,s+j);let h=0,L=0,M=0,E=0,B=0;d.forEach(p=>{const m=p._totalQty||0,v=p.costPrice||p.purchasePrice||0,b=p.sellingPrice||p.salePrice||p.priceRetail||p.price||0;h+=m*b,L+=m*v,b>0&&(M+=(b-v)/b*100,B++),m<(p.reorderLevel||0)&&E++});const Z=B>0?(M/B).toFixed(1):"0.0";k={totalValue:h,totalCost:L,avgMargin:Z,lowStockCount:E};const J=document.getElementById("kpi-total-val"),Y=document.getElementById("kpi-total-cost"),X=document.getElementById("kpi-margin-pct"),tt=document.getElementById("kpi-low-stock");J&&(J.textContent=I(h)),Y&&(Y.textContent=I(L)),X&&(X.textContent=`${Z}%`),tt&&(tt.textContent=E);const et=document.getElementById("prod-count-label");et&&(et.textContent=`${d.length} صنف — عرض ${u.length}`),e.innerHTML=Et(u);const ot=document.getElementById("page-counter");ot&&(ot.textContent=`الصفحة ${w+1} / ${Math.max(1,Math.ceil(d.length/j))}`);const at=document.getElementById("prev-page-btn"),it=document.getElementById("next-page-btn");at&&(at.disabled=w===0),it&&(it.disabled=!R)}catch(o){console.error(o),e.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--danger);">
      ⚠️ ${o.message}
      <br><button class="btn btn-sm btn-secondary" style="margin-top:12px;" onclick="loadProducts(true)">إعادة المحاولة</button>
    </td></tr>`}}window.applySuggestedCategoryMargin=async()=>{const t=await It();if(!t.enableCategoryMargins)return;const e=document.getElementById("prod-category").value,o=parseFloat(document.getElementById("prod-purchase-price").value)||0;if(o<=0)return;const i=y.find(l=>l.id===e);if(!i)return;let a=0;if(i.velocity==="fast")a=t.marginFast??5;else if(i.velocity==="medium")a=t.marginMedium??10;else if(i.velocity==="slow")a=t.marginSlow??15;else return;const n=Math.round(o*(1+a/100)*100)/100;document.getElementById("prod-price-retail").value=n};window.onCategoryChange=async()=>{if(await applySuggestedCategoryMargin(),!!document.getElementById("prod-edit-id").value)return;const e=document.getElementById("prod-category").value;if(!e)return;const o=document.getElementById("prod-sku");if(!o)return;let a={dairy:"01",oils:"02",rice_grains:"03",dry_goods:"04",beverages:"05",water:"06",meat_poultry:"07",seafood:"08",canned:"09",confectionery:"10",biscuits:"11",spices:"12",coffee_tea:"13",cleaning:"14",personal_care:"15",baby:"16",bakery:"17",frozen:"18",honey_jam:"19",snacks:"20"}[e];if(!a){const d=y.findIndex(s=>s.id===e);a=String(d>=0?21+d:99)}const n=x.map(d=>String(d.sku||"")).filter(d=>d.startsWith(a));let l=0;n.forEach(d=>{const s=d.slice(a.length),u=parseInt(s,10);!isNaN(u)&&u>l&&(l=u)});const r=l+1,c=a+String(r).padStart(3,"0");o.value=c};window.inlineEditPrice=(t,e,o,i)=>{if(t.querySelector("input"))return;const a=document.createElement("input");a.type="number",a.step="0.01",a.value=i,a.className="input mono",a.style.cssText="width:80px; padding:4px 6px; font-size:12px; margin:0; text-align:left;",t.innerHTML="",t.appendChild(a),a.focus(),a.select();let n=!1;const l=async()=>{if(n)return;n=!0;const r=parseFloat(a.value);if(isNaN(r)||r<0){t.innerHTML=I(i);return}t.innerHTML='<div class="loading-spinner sm"></div>';try{const c={[o]:r};(o==="salePrice"||o==="priceRetail"||o==="sellingPrice")&&(c.salePrice=r,c.sellingPrice=r,c.priceRetail=r),(o==="costPrice"||o==="purchasePrice")&&(c.costPrice=r,c.purchasePrice=r,c.averageCost=r),await W("products",e,c);const d=x.find(s=>s.id===e);d&&Object.assign(d,c),showToast("تم تحديث السعر بنجاح","success"),await f()}catch(c){showToast(c.message,"error"),t.innerHTML=I(i)}};a.addEventListener("blur",l),a.addEventListener("keydown",r=>{r.key==="Enter"&&l(),r.key==="Escape"&&(n=!0,t.innerHTML=I(i))})};window.switchProdFormTab=t=>{["basic","inventory","pricing","units"].forEach(a=>{const n=document.getElementById(`prod-tab-${a}`);n&&(n.classList.remove("active"),n.style.borderBottomColor="transparent",n.style.color="var(--text-2)");const l=document.getElementById(`content-prod-${a}`);l&&l.classList.add("hidden")});const o=document.getElementById(`prod-tab-${t}`);o&&(o.classList.add("active"),o.style.borderBottomColor="var(--brand)",o.style.color="var(--brand)");const i=document.getElementById(`content-prod-${t}`);i&&i.classList.remove("hidden")};window.toggleTrackingFields=()=>{const t=document.getElementById("prod-tracking")?.value,e=document.getElementById("prod-shelf-life");e&&(t==="batch"?(e.disabled=!1,e.parentElement.classList.remove("disabled")):(e.disabled=!0,e.value="",e.parentElement.classList.add("disabled")))};window.openProductModal=(t=null)=>{switchProdFormTab("basic"),document.getElementById("prod-edit-id").value=t?.id||"",document.getElementById("prod-modal-title").textContent=t?"تعديل بطاقة الصنف":"إضافة صنف جديد",document.getElementById("prod-sku").value=t?.sku||"",document.getElementById("prod-name-ar").value=t?.name||t?.nameAr||"",document.getElementById("prod-name-en").value=t?.nameEn||"",document.getElementById("prod-category").value=t?.category||"",document.getElementById("prod-supplier").value=t?.supplierId||"",document.getElementById("prod-origin").value=t?.country||"",document.getElementById("prod-barcode").value=t?.barcode||"",document.getElementById("prod-barcodes-alt").value=(t?.alternativeBarcodes||[]).join(", "),document.getElementById("prod-hs-code").value=t?.hsCode||"",document.getElementById("prod-desc").value=t?.description||"",document.getElementById("prod-tracking").value=t?.tracking||"none",document.getElementById("prod-shelf-life").value=t?.shelfLife||"",document.getElementById("prod-temp").value=t?.storageTemperature||"dry",document.getElementById("prod-min").value=t?.minimumQuantity||"",document.getElementById("prod-max").value=t?.maximumQuantity||"",document.getElementById("prod-reorder").value=t?.reorderLevel||"",document.getElementById("prod-safety").value=t?.safetyStock||"",document.getElementById("prod-eoq").value=t?.economicOrderQuantity||"",document.getElementById("prod-lead-time").value=t?.leadTime||"",document.getElementById("prod-zatca-tax").value=t?.taxCategory||"S",document.getElementById("prod-valuation").value=t?.valuationMethod||"moving_average",document.getElementById("prod-purchase-price").value=t?.costPrice||t?.purchasePrice||"",document.getElementById("prod-std-cost").value=t?.standardCost||"";const e=parseFloat(t?.costPrice||t?.purchasePrice)||0,i=(t?.taxCategory||"S")==="S"?1.15:1;document.getElementById("prod-price-retail").value=t?.salePrice||t?.priceRetail||"",document.getElementById("prod-price-wholesale").value=t?.priceWholesale||"",document.getElementById("prod-price-distributor").value=t?.priceDistributor||"",["retail","wholesale","distributor"].forEach(l=>{const r=parseFloat(l==="retail"?t?.salePrice||t?.priceRetail:l==="wholesale"?t?.priceWholesale:t?.priceDistributor)||0,c=document.getElementById(`prod-price-inc-${l}`);c&&(c.value=r>0?(r*i).toFixed(2):"");const d=document.getElementById(`prod-pct-${l}`);d&&(e>0&&r>0?d.value=((r-e)/e*100).toFixed(1):d.value="")});const a=document.getElementById("prod-zatca-tax");a&&!a._changeListenerAttached&&(a.addEventListener("change",()=>{["retail","wholesale","distributor"].forEach(l=>{const r=document.getElementById(`prod-price-${l}`);r&&r.value!==""&&window.onPriceInput(l)})}),a._changeListenerAttached=!0),document.getElementById("prod-unit-base").value=t?.unit||"Piece",document.getElementById("prod-unit-alt").value=t?.altUnit||"",document.getElementById("prod-unit-conv").value=t?.unitFactor||"";const n=document.getElementById("prod-locations-tbody");n&&(n.innerHTML=T.map(l=>{const r=t?.locationsByWarehouse?.[l.id]||"";return`
        <tr>
          <td><strong>${l.name}</strong></td>
          <td>
            <input type="text" class="input sm sc-wh-loc-input" data-wh-id="${l.id}" value="${r}" placeholder="مثال: الرف A-12" style="padding:4px 8px; font-size:12px; margin:0;" />
          </td>
        </tr>
      `}).join("")),document.getElementById("prod-form-error").classList.add("hidden"),openModal("product-modal")};window.editProduct=t=>{const e=x.find(o=>o.id===t);e?openProductModal(e):U(()=>import("./index-HrCilPJ3.js").then(o=>o.N),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const i=await o("products",t);i&&openProductModal(i)}catch(i){showToast(i.message,"error")}})};window.saveProduct=async()=>{const t=document.getElementById("prod-form-error");t.classList.add("hidden");const e=document.getElementById("prod-edit-id").value,o=document.getElementById("prod-sku").value.trim().toUpperCase(),i=document.getElementById("prod-name-ar").value.trim(),a=parseFloat(document.getElementById("prod-price-retail").value)||0;if(!o||!i){t.textContent="يرجى تعبئة الكود والاسم العربي",t.classList.remove("hidden");return}if(!a){t.textContent="يرجى تعبئة سعر التجزئة الأساسي",t.classList.remove("hidden");return}const n=document.getElementById("prod-category").value,l=y.find(s=>s.id===n),r={};document.querySelectorAll(".sc-wh-loc-input").forEach(s=>{const u=s.dataset.whId,h=s.value.trim();h&&(r[u]=h)});const c={sku:o,name:i,nameAr:i,nameEn:document.getElementById("prod-name-en").value.trim(),category:n,categoryName:l?.name||"",supplierId:document.getElementById("prod-supplier").value,country:document.getElementById("prod-origin").value.trim(),barcode:document.getElementById("prod-barcode").value.trim(),alternativeBarcodes:document.getElementById("prod-barcodes-alt").value.split(",").map(s=>s.trim()).filter(Boolean),hsCode:document.getElementById("prod-hs-code").value.trim(),description:document.getElementById("prod-desc").value.trim(),tracking:document.getElementById("prod-tracking").value,shelfLife:parseInt(document.getElementById("prod-shelf-life").value)||null,storageTemperature:document.getElementById("prod-temp").value,locationsByWarehouse:r,minimumQuantity:parseInt(document.getElementById("prod-min").value)||0,maximumQuantity:parseInt(document.getElementById("prod-max").value)||0,reorderLevel:parseInt(document.getElementById("prod-reorder").value)||0,safetyStock:parseInt(document.getElementById("prod-safety").value)||0,economicOrderQuantity:parseInt(document.getElementById("prod-eoq").value)||0,leadTime:parseInt(document.getElementById("prod-lead-time").value)||0,taxCategory:document.getElementById("prod-zatca-tax").value,valuationMethod:document.getElementById("prod-valuation").value,costPrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,purchasePrice:parseFloat(document.getElementById("prod-purchase-price").value)||0,standardCost:parseFloat(document.getElementById("prod-std-cost").value)||0,salePrice:a,sellingPrice:a,priceRetail:a,priceWholesale:parseFloat(document.getElementById("prod-price-wholesale").value)||0,priceDistributor:parseFloat(document.getElementById("prod-price-distributor").value)||0,unit:document.getElementById("prod-unit-base").value,altUnit:document.getElementById("prod-unit-alt").value,unitFactor:parseInt(document.getElementById("prod-unit-conv").value)||1,searchTokens:vt(i+" "+o)},d=document.getElementById("save-prod-btn");d.disabled=!0;try{e?(await W("products",e,c),showToast("تم تحديث بطاقة الصنف بنجاح","success")):(await pt(g.products(),c),showToast("تم إضافة الصنف بنجاح","success")),closeModal("product-modal"),x=[],await f(!0)}catch(s){t.textContent=s.message,t.classList.remove("hidden")}finally{d.disabled=!1}};window.deleteProduct=async(t,e)=>{if(confirm(`هل تريد حذف الصنف "${e}"؟`))try{await gt("products",t),showToast("تم حذف الصنف","success"),x=[],await f(!0)}catch(o){showToast(o.message,"error")}};window.loadProducts=f;let O=null,z=[],C=[],D=[];window.switchStockTab=async t=>{const e=document.getElementById("tab-btn-balances"),o=document.getElementById("tab-btn-batches"),i=document.getElementById("tab-btn-card"),a=document.getElementById("stock-modal-body");if(!e||!o||!i)return;[e,o,i].forEach(l=>{l.classList.remove("active"),l.style.borderBottomColor="transparent",l.style.color="var(--text-2)"});const n=document.getElementById(`tab-btn-${t}`);n.classList.add("active"),n.style.borderBottomColor="var(--brand)",n.style.color="var(--brand)",a.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>';try{if(t==="balances")mt();else if(t==="batches"){if(!D.length){const l=dt(g.stockTransactions(),st("productId","==",O)),c=(await N(l)).docs.map(s=>s.data()),d={};c.forEach(s=>{s.batchNumber&&(d[s.batchNumber]||(d[s.batchNumber]={qty:0,expiryDate:s.expiryDate,prodDate:s.productionDate}),d[s.batchNumber].qty+=s.qtyChange||0)}),D=Object.keys(d).map(s=>({number:s,...d[s]})).filter(s=>s.qty>0)}Bt()}else{if(!C.length){const l=dt(g.stockTransactions(),st("productId","==",O));C=(await N(l)).docs.map(c=>({id:c.id,...c.data()})),C.sort((c,d)=>(d.createdAt?.toMillis()||0)-(c.createdAt?.toMillis()||0))}$t()}}catch(l){a.innerHTML=`<div class="alert bad">${l.message}</div>`}};function mt(){const t=document.getElementById("stock-modal-body"),e={};T.forEach(a=>e[a.id]=a.name);const i=x.find(a=>a.id===O)?.locationsByWarehouse||{};z.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">📦</div><p>لا يوجد رصيد في أي مخزن</p></div>':t.innerHTML=`
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>المخزن / موقع الرف</th><th>الكمية المتوفرة</th><th>حد الطلب</th><th>الحالة</th></tr></thead>
        <tbody>
          ${z.map(a=>{const n=e[a.warehouseId]||a.warehouseId,l=i[a.warehouseId]||"",r=l?`<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الرف/الموقع: ${l}</span>`:'<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الموقع غير محدد</span>';return rt(a.qty,a.reorderLevel||0),`<tr>
              <td><strong>${n}</strong>${r}</td>
              <td class="mono font-bold">${S(a.qty)}</td>
              <td class="mono dim">${a.reorderLevel||0}</td>
              <td>${ct(a.qty,a.reorderLevel)}</td>
            </tr>`}).join("")}
          <tr style="border-top:2px solid var(--border);">
            <td class="font-bold">الإجمالي</td>
            <td class="mono font-bold text-indigo">${S(z.reduce((a,n)=>a+n.qty,0))}</td>
            <td></td><td></td>
          </tr>
        </tbody>
      </table>`}function Bt(){const t=document.getElementById("stock-modal-body");D.length===0?t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">🧬</div><p>لا توجد تشغيلات (Batches) فعالة أو منتهية الصلاحية مسجلة</p></div>':t.innerHTML=`
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>رقم التشغيلة</th><th>تاريخ الإنتاج</th><th>تاريخ الانتهاء</th><th>الكمية المتبقية</th><th>الحالة</th></tr></thead>
        <tbody>
          ${D.map(e=>{const o=e.expiryDate&&new Date(e.expiryDate)<new Date;return`
              <tr>
                <td class="mono font-bold">${e.number}</td>
                <td class="dim">${e.prodDate||"—"}</td>
                <td class="mono ${o?"text-bad font-bold":""}">${e.expiryDate||"—"}</td>
                <td class="mono font-bold">${S(e.qty)}</td>
                <td>${o?'<span class="badge bad">منتهية الصلاحية</span>':'<span class="badge good">صالحة</span>'}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>`}function $t(){const t=document.getElementById("stock-modal-body"),e={};if(T.forEach(o=>e[o.id]=o.name),C.length===0)t.innerHTML='<div class="empty-state" style="padding:20px;"><div class="empty-icon">📜</div><p>لا توجد حركات مسجلة لهذا الصنف</p></div>';else{const o={purchase_invoice:"فاتورة شراء",sales_invoice:"فاتورة بيع",transfer_out:"تحويل صادر",transfer_in:"تحويل وارد",adjustment:"تسوية عجز/زيادة",damage:"إهلاك تالف",assembly:"تجميع",disassembly:"تفكيك"};t.innerHTML=`
      <table class="data-dense" style="width:100%; font-size:12px;">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>نوع الحركة</th>
            <th>رقم المستند</th>
            <th>المخزن</th>
            <th class="text-good">وارد (+)</th>
            <th class="text-bad">صادر (-)</th>
            <th>الرصيد بعد</th>
            <th>التكلفة / البيان</th>
          </tr>
        </thead>
        <tbody>
          ${C.map(i=>{const a=i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:i.date||"—",n=e[i.warehouseId]||i.warehouseId||"—",l=i.qtyChange||0,r=l>0?l:0,c=l<0?Math.abs(l):0;return`
              <tr>
                <td class="dim">${a}</td>
                <td><span class="badge neutral" style="font-size:10px;">${o[i.type]||i.type||"تسوية"}</span></td>
                <td class="mono font-bold">${i.documentNumber||i.invoiceNumber||"—"}</td>
                <td>${n}</td>
                <td class="mono text-good font-bold">${r?`+${S(r)}`:"—"}</td>
                <td class="mono text-bad font-bold">${c?`-${S(c)}`:"—"}</td>
                <td class="mono">${S(i.qtyAfter||0)}</td>
                <td class="dim" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${i.notes||""}">
                  ${i.notes||"—"}
                </td>
              </tr>
            `}).join("")}
        </tbody>
      </table>`}}window.viewStock=async(t,e)=>{O=t,z=[],C=[],D=[],document.getElementById("stock-modal-title").textContent=`بطاقة الصنف: ${e}`;const o=document.getElementById("stock-modal-body");o.innerHTML='<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>',openModal("stock-modal");try{z=await bt(t),mt()}catch(i){o.innerHTML=`<div class="alert bad">${i.message}</div>`}};window.setupProductSearch=()=>{const t=document.getElementById("prod-search");t&&t.addEventListener("input",yt(()=>f(!0),400))};window.exportProducts=async()=>{showToast("جارٍ تصدير البيانات…","info");try{const t=await P(g.products(),[K("sku")]),e=[["الكود","الاسم","الاسم الإنجليزي","الفئة","التتبع","الوحدة","درجة حرارة الحفظ","سعر التكلفة","سعر البيع","الباركود"]];t.forEach(n=>e.push([n.sku,n.name,n.nameEn||"",n.categoryName||n.category,n.tracking,n.unit,n.storageTemperature,n.costPrice,n.salePrice,n.barcode]));const o=e.map(n=>n.map(l=>`"${l||""}"`).join(",")).join(`
`),i=new Blob(["\uFEFF"+o],{type:"text/csv;charset=utf-8;"}),a=document.createElement("a");a.href=URL.createObjectURL(i),a.download=`products_${new Date().toISOString().split("T")[0]}.csv`,a.click(),showToast("تم تصدير الملف بنجاح","success")}catch(t){showToast(t.message,"error")}};window.loadNextPage=()=>{w++,f()};window.loadPrevPage=()=>{w>0&&(w--,G=null,f())};window.printProductBarcode=async t=>{try{const{getById:e}=await U(async()=>{const{getById:n}=await import("./index-HrCilPJ3.js").then(l=>l.N);return{getById:n}},__vite__mapDeps([0,1])),o=await e("products",t);if(!o)return;const i=o.barcode||o.sku,a=window.open("","_blank");a.document.write(`
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
    `),a.document.close()}catch(e){showToast(e.message,"error")}};window.exportProductsExcel=async()=>{try{const t=x.length>0?x:await P(g.products(),[K("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.sku||"",o.name||o.nameAr||"",o.nameEn||"",o.barcode||"",o.categoryName||"",o.unit||"",o.altUnit||"",o.unitFactor||1,o.costPrice||0,o.salePrice||0,o.priceWholesale||0,o.taxCategory==="S"?15:0,o.reorderLevel||0,o.tracking||"none",o.totalQty||0,o.active===!1?"غير نشط":"نشط",o.notes||""]);await ht({title:"كتالوج_الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة","سعر البيع","سعر الجملة","ضريبة القيمة المضافة %","حد إعادة الطلب","نظام التتبع","المخزون الحالي","الحالة","ملاحظات"],rows:e,colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,12,14,10,22]}),showToast(`تم تصدير ${e.length} صنف بنجاح ✅`,"success")}catch(t){showToast("خطأ في التصدير: "+t.message,"error")}};window.downloadProductTemplate=async()=>{try{await xt({title:"الأصناف",headers:["كود الصنف (SKU)*","الاسم العربي*","الاسم الإنجليزي","الباركود","اسم الفئة","وحدة البيع","الوحدة الكبرى","معامل التحويل","سعر التكلفة*","سعر البيع*","سعر الجملة","ضريبة (S أو E)","حد إعادة الطلب","نظام التتبع (none/batch/serial)"],sampleRows:[["P001","زيت نخيل","Palm Oil","6281234567890","زيوت","لتر","كرتون",12,18.5,25,22,"S",50,"none"],["P002","سكر أبيض","White Sugar","6281234567891","سلع أساسية","كيلو","كيس",50,3,4.5,4,"S",100,"none"]],colWidths:[16,28,24,16,18,10,12,12,14,14,14,10,12,22]}),showToast("تم تنزيل نموذج الاستيراد ✅","success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openProductImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="prod-import-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t)};let H=[];window.handleImportFileDrop=async t=>{if(t)try{showToast("جاري قراءة الملف…","info");const{headers:e,rows:o}=await ft(t);H=o;const i=[],a={};o.forEach((d,s)=>{const u=String(d[e[0]]||d["كود الصنف (SKU)*"]||d.SKU||"").trim(),h=String(d[e[1]]||d["الاسم العربي*"]||d["اسم الصنف"]||"").trim();u||i.push(`الصف ${s+2}: كود الصنف (SKU) مطلوب`),h||i.push(`الصف ${s+2}: الاسم العربي مطلوب`),a[u]&&i.push(`الصف ${s+2}: كود مكرر "${u}"`),u&&(a[u]=!0)});const n=Object.keys(o[0]||{}).slice(0,8),l=o.slice(0,10),r=`
      <thead><tr>${n.map(d=>`<th>${d}</th>`).join("")}${n.length<Object.keys(o[0]||{}).length?"<th>…</th>":""}</tr></thead>
      <tbody>${l.map((d,s)=>`<tr style="background:${s%2===0?"var(--bg-1)":"var(--bg-2)"}">${n.map(u=>`<td>${d[u]||""}</td>`).join("")}${n.length<Object.keys(d).length?"<td>…</td>":""}</tr>`).join("")}</tbody>
    `;document.getElementById("import-preview-table").innerHTML=r;const c=[{label:"إجمالي الصفوف",val:o.length,color:"#2563eb"},{label:"الأعمدة",val:e.length,color:"#10B981"},{label:"أخطاء",val:i.length,color:i.length?"#EF4444":"#10B981"}].map(d=>`
      <div style="background:var(--bg-2);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;align-items:center;min-width:100px;">
        <span style="font-size:22px;font-weight:800;color:${d.color};">${d.val}</span>
        <span style="font-size:11px;color:var(--text-2);">${d.label}</span>
      </div>`).join("");document.getElementById("import-stats").innerHTML=c,i.length>0?document.getElementById("import-validation-errors").innerHTML=`
        <div class="alert bad" style="max-height:120px;overflow:auto;">
          <strong>⚠️ تحذيرات التحقق (${i.length}):</strong><br>
          ${i.slice(0,15).map(d=>`<div style="font-size:11px;">${d}</div>`).join("")}
          ${i.length>15?`<div style="font-size:11px;">...و ${i.length-15} أخرى</div>`:""}
        </div>`:document.getElementById("import-validation-errors").innerHTML='<div class="alert good">✅ جميع البيانات صحيحة وجاهزة للاستيراد</div>',document.getElementById("import-step-1").style.display="none",document.getElementById("import-step-2").style.display="block",i.length===0&&(document.getElementById("import-confirm-btn").style.display=""),showToast(`تم قراءة ${o.length} صنف. راجع البيانات قبل الاستيراد.`,o.length>0?"success":"warn")}catch(e){showToast("خطأ في قراءة الملف: "+e.message,"error")}};window.executeProductImport=async()=>{const t=document.getElementById("import-confirm-btn");t.disabled=!0,t.textContent="⏳ جاري الاستيراد…";let e=0,o=0,i=0;try{const a=await P(g.products(),[]),n={};a.forEach(d=>{d.sku&&(n[d.sku.trim()]=d.id)});const l=y.length>0?y:await P(g.categories?g.categories():`companies/${ut}/categories`,[K("name")]).catch(()=>[]),r={};l.forEach(d=>{r[(d.name||"").trim().toLowerCase()]={id:d.id,name:d.name}});const c=50;for(let d=0;d<H.length;d++){const s=H[d],u=String(s["كود الصنف (SKU)*"]||s.SKU||s[Object.keys(s)[0]]||"").trim(),h=String(s["الاسم العربي*"]||s.الاسم||s[Object.keys(s)[1]]||"").trim();if(!u||!h){i++;continue}const L=String(s["اسم الفئة"]||s.الفئة||"").trim().toLowerCase(),M=r[L]||{},E={sku:u,name:h,nameAr:h,nameEn:String(s["الاسم الإنجليزي"]||"").trim()||null,barcode:String(s.الباركود||"").trim()||null,categoryId:M.id||null,categoryName:M.name||s["اسم الفئة"]||s.الفئة||null,unit:String(s["وحدة البيع"]||"حبة").trim(),altUnit:String(s["الوحدة الكبرى"]||"").trim()||null,unitFactor:parseFloat(s["معامل التحويل"]||1)||1,costPrice:parseFloat(s["سعر التكلفة*"]||s["سعر التكلفة"]||0)||0,salePrice:parseFloat(s["سعر البيع*"]||s["سعر البيع"]||0)||0,priceWholesale:parseFloat(s["سعر الجملة"]||0)||0,taxCategory:String(s["ضريبة (S أو E)"]||s.ضريبة||"S").toUpperCase()==="E"?"E":"S",reorderLevel:parseInt(s["حد إعادة الطلب"]||0)||0,tracking:String(s["نظام التتبع (none/batch/serial)"]||s["نظام التتبع"]||"none").toLowerCase(),active:!0,updatedAt:new Date().toISOString()};try{n[u]?(await W(g.products(),n[u],E),o++):(E.createdAt=new Date().toISOString(),await pt(g.products(),E),e++)}catch(B){i++,console.warn("Import row failed:",u,B)}d%10===0&&(t.textContent=`⏳ ${d+1} / ${H.length}`),await new Promise(B=>setTimeout(B,20))}document.getElementById("prod-import-overlay").remove(),showToast(`✅ الاستيراد مكتمل — مضاف: ${e} | محدَّث: ${o} | فاشل: ${i}`,"success"),x=[],G=null,R=!1,await f()}catch(a){showToast("خطأ في الاستيراد: "+a.message,"error"),t.disabled=!1,t.textContent="✅ استيراد البيانات"}};function q(t){return{Piece:"حبة",Kilogram:"كجم",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Carton:"كرتون",Box:"صندوق",Pallet:"باليت",Bag:"كيس",Bale:"بالة",Tank:"تنك",Barrel:"برميل",Roll:"رول",Pack:"شد / ربطة",Sack:"شوال",Tray:"طبق",Gallon:"جالون",Ton:"طن"}[t]||t||""}function V(){return(document.getElementById("prod-zatca-tax")?.value||"S")==="S"?1.15:1}window.onCostInput=()=>{typeof applySuggestedCategoryMargin=="function"&&applySuggestedCategoryMargin(),["retail","wholesale","distributor"].forEach(t=>{const e=document.getElementById(`prod-pct-${t}`);e&&e.value!==""&&window.onPctInput(t)})};window.onPriceInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),a=document.getElementById(`prod-pct-${t}`);if(!o)return;const n=parseFloat(o.value)||0,l=V();if(i&&(i.value=n>0?(n*l).toFixed(2):""),a)if(e>0&&n>0){const r=(n-e)/e*100;a.value=r.toFixed(1)}else a.value=""};window.onPriceIncInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),a=document.getElementById(`prod-pct-${t}`);if(!i)return;const n=parseFloat(i.value)||0,l=V(),r=n>0?n/l:0;if(o&&(o.value=r>0?r.toFixed(2):""),a)if(e>0&&r>0){const c=(r-e)/e*100;a.value=c.toFixed(1)}else a.value=""};window.onPctInput=t=>{const e=parseFloat(document.getElementById("prod-purchase-price").value)||0,o=document.getElementById(`prod-price-${t}`),i=document.getElementById(`prod-price-inc-${t}`),a=document.getElementById(`prod-pct-${t}`);if(!a)return;const n=parseFloat(a.value)||0,l=V();if(e>0){const r=e*(1+n/100);o&&(o.value=r.toFixed(2)),i&&(i.value=(r*l).toFixed(2))}else o&&(o.value=""),i&&(i.value="")};export{f as loadProducts,_t as render};
