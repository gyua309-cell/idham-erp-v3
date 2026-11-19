// ============================================================
// IDHAM ERP — Categories & Units Module (الفئات ووحدات القياس)
// Enterprise Category Management & Multi-Unit Architecture
// ============================================================
import { COLS, create, update, remove, getAll, clearERPCache, db, doc, writeBatch, setDoc, orderBy } from "../utils/db.js";
import { formatCurrency, translateUnit, formatQuantity } from "../utils/formatters.js";

let _allCategories = [];
let _allProducts = [];
let _allStockBalances = [];
let _catSearchQuery = "";

const DEFAULT_CATEGORIES = [
  { id: "dairy",         name: "ألبان ومنتجاتها",       code: "dairy",         icon: "🥛", desc: "حليب، لبن، زبادي، أجبان، زبدة، قشطة", velocity: "fast" },
  { id: "oils",          name: "زيوت وسمن",             code: "oils",          icon: "🌻", desc: "زيوت ذرة، دوار الشمس، زيتون، سمن", velocity: "fast" },
  { id: "rice_grains",   name: "أرز وحبوب",             code: "rice_grains",   icon: "🌾", desc: "أرز بسمتي، عدس، فاصوليا، حمص", velocity: "fast" },
  { id: "dry_goods",     name: "سكر ودقيق ومعجنات",     code: "dry_goods",     icon: "🍞", desc: "سكر، دقيق، مكرونة، شوفان", velocity: "fast" },
  { id: "beverages",     name: "مشروبات وعصائر",        code: "beverages",     icon: "🧃", desc: "مشروبات غازية، عصائر، مشروبات طاقة", velocity: "fast" },
  { id: "water",         name: "مياه معبأة",             code: "water",         icon: "💧", desc: "مياه شرب وطبيعية ومعدنية", velocity: "fast" },
  { id: "meat_poultry",  name: "لحوم ودواجن مجمدة",     code: "meat_poultry",  icon: "🍗", desc: "دجاج، لحم بقري، مرتديلا، برجر", velocity: "slow" },
  { id: "seafood",       name: "أسماك ومأكولات بحرية",  code: "seafood",       icon: "🐟", desc: "سمك مجمد، روبيان، فيليه", velocity: "slow" },
  { id: "canned",        name: "معلبات وصلصات",         code: "canned",        icon: "🥫", desc: "تونة، فول، صلصة، كاتشب، ذرة", velocity: "medium" },
  { id: "confectionery", name: "حلويات وشوكولاتة",      code: "confectionery", icon: "🍫", desc: "شوكولاتة، حلويات، بونبون", velocity: "medium" },
  { id: "biscuits",      name: "بسكويت وكيك",           code: "biscuits",      icon: "🍪", desc: "بسكويت، ويفر، كيك، مافن", velocity: "medium" },
  { id: "spices",        name: "توابل وبهارات",         code: "spices",        icon: "🧂", desc: "فلفل، كمون، كركم، بهارات مشكلة", velocity: "slow" },
  { id: "coffee_tea",    name: "قهوة وشاي",             code: "coffee_tea",    icon: "☕", desc: "قهوة عربية وسريعة، شاي أخضر وأسود", velocity: "slow" },
  { id: "cleaning",      name: "منظفات ومعطرات",        code: "cleaning",      icon: "🧴", desc: "مسحوق غسيل، سائل جلي، مطهرات", velocity: "slow" },
  { id: "personal_care", name: "عناية شخصية وورقيات",   code: "personal_care", icon: "🧻", desc: "مناديل، معجون أسنان، شامبو", velocity: "slow" },
  { id: "baby",          name: "أطفال وحفاضات",         code: "baby",          icon: "👶", desc: "حفاضات، حليب أطفال، مستلزمات", velocity: "slow" },
  { id: "bakery",        name: "مخبوزات وخبز",          code: "bakery",        icon: "🥖", desc: "توست، كرواسون، سمبوسة، عجائن", velocity: "medium" },
  { id: "frozen",        name: "أغذية مجمدة",           code: "frozen",        icon: "🧊", desc: "بطاطس، خضار، سمبوسة، بيتزا", velocity: "slow" },
  { id: "honey_jam",     name: "عسل ومربيات وطحينة",    code: "honey_jam",     icon: "🍯", desc: "عسل طبيعي، مربى، طحينة، نوتيلا", velocity: "medium" },
  { id: "snacks",        name: "شيبس ومكسرات",          code: "snacks",        icon: "🥜", desc: "شيبس، مكسرات، تمور، فشار", velocity: "medium" },
  { id: "veg_fruits",    name: "خضار وفواكه طازجة",     code: "veg_fruits",    icon: "🍅", desc: "طماطم، خيار، بطاطس، تفاح، موز، برتقال", velocity: "fast" },
  { id: "frozen_veg",    name: "خضروات مجمدة",          code: "frozen_veg",    icon: "🥦", desc: "بازلاء مجمدة، خضار مشكل، ملوخية، بامية", velocity: "medium" },
  { id: "dates",         name: "تمور ومنتجاتها",        code: "dates",         icon: "🌴", desc: "تمر خلاص، سكري، عجوة، معجون التمر", velocity: "medium" },
  { id: "pickles",       name: "مخللات وأجبان مكشوفة",  code: "pickles",       icon: "🥒", desc: "زيتون أخضر وأسود، مخلل مشكل، أجبان وزن", velocity: "medium" },
  { id: "plastics",      name: "بلاستيكيات ومستلزمات تغليف", code: "plastics",   icon: "🛍️", desc: "أكياس بلاستيك، نايلون تغليف، سفريات", velocity: "medium" },
  { id: "disposables",   name: "أكواب ومستلزمات ضيافة",  code: "disposables",   icon: "🥤", desc: "أكواب ورقية، ملاعق، شوك، علب بلاستيك", velocity: "medium" },
  { id: "tobacco",       name: "تبغ ومستلزمات تدخين",    code: "tobacco",       icon: "🚬", desc: "سجائر، معسل، مستلزمات تدخين متنوعة", velocity: "slow" },
  { id: "egg",           name: "بيض طازج",              code: "egg",           icon: "🥚", desc: "بيض مائدة طازج بمختلف المقاسات", velocity: "fast" },
  { id: "sauces",        name: "صلصات ومايونيز وتوابل سائلة", code: "sauces",    icon: "🍯", desc: "مايونيز، خردل، كاتشب، صلصة حارة", velocity: "medium" },
  { id: "nuts_seeds",    name: "مكسرات وبذور",          code: "nuts_seeds",    icon: "🌰", desc: "فستق، لوز، كاجو، حب دوار الشمس", velocity: "medium" },
  { id: "ice_cream",     name: "آيس كريم وحلويات باردة", code: "ice_cream",     icon: "🍦", desc: "آيس كريم متنوع، حلويات مثلجة", velocity: "medium" }
];

export async function render(container, user) {
  container.innerHTML = `
    <style>
      .clickable-cat-card {
        cursor: pointer;
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s, border-color 0.22s;
        border: 1px solid var(--border-soft) !important;
        position: relative;
        background: var(--bg-card, var(--bg-1));
      }
      .clickable-cat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        border-color: var(--brand) !important;
        background: var(--bg-2-hover);
      }
      .clickable-cat-card .cat-actions {
        opacity: 0.3;
        transition: opacity 0.2s;
      }
      .clickable-cat-card:hover .cat-actions {
        opacity: 1;
      }
      .cat-badge-fast { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
      .cat-badge-medium { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
      .cat-badge-slow { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
      .cat-kpi-strip {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }
    </style>

    <div class="filterbar">
      <div style="display:flex;gap:4px;" class="quick-filters">
        <button class="quick-filter-btn active" id="btn-tab-cats" onclick="switchCatTab('cats')">📂 فئات الأصناف</button>
        <button class="quick-filter-btn" id="btn-tab-units" onclick="switchCatTab('units')">📏 وحدات القياس</button>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="forceReloadCategories()" title="تحديث الفئات من السيرفر">🔄 تحديث</button>
        <button class="btn btn-primary" id="btn-add-cat" onclick="openCatModal()">+ إضافة فئة جديدة</button>
        <button class="btn btn-primary hidden" id="btn-add-unit" onclick="openUnitModal()">+ إضافة وحدة قياس</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Categories Section -->
      <div id="section-cats">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">تصنيفات الأصناف (Categories)</h1>
            <p class="page-subtitle">تنظيم الأصناف والكتالوج إلى أقسام رئيسية وفرعية مع مراقبة المخزون الفعلي والقيمة</p>
          </div>
          <div style="min-width:260px; max-width:360px; width:100%;">
            <input type="text" id="cat-search-input" class="input" placeholder="🔍 بحث في الفئات أو الكود..." oninput="onCategorySearch(this.value)" style="border-radius:20px; padding:8px 16px;" />
          </div>
        </div>

        <div id="cats-kpis" class="cat-kpi-strip"></div>

        <div class="grid-3 gap-16 mb-24" id="cats-grid">
          <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل فئات الأصناف والمخزون…</span></div>
        </div>
      </div>

      <!-- Units Section (Hidden by default) -->
      <div id="section-units" class="hidden">
        <div class="page-header">
          <div>
            <h1 class="page-title">وحدات القياس (Units of Measurement)</h1>
            <p class="page-subtitle">تعريف وحدات التعبئة (كرتون، كيس، قطعة، باليت) ومكافئاتها للتحويل المخزني التلقائي</p>
          </div>
        </div>

        <div class="card">
          <div class="table-container">
            <table class="data-dense">
              <thead>
                <tr>
                  <th>كود الوحدة</th>
                  <th>اسم الوحدة بالعربية</th>
                  <th>الاسم بالإنجليزية</th>
                  <th>معامل التحويل للوحدة الصغرى</th>
                  <th>ملاحظات</th>
                  <th style="width:80px; text-align:center;">إجراءات</th>
                </tr>
              </thead>
              <tbody id="units-tbody">
                ${Array(5).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div class="modal-overlay" id="cat-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cat-modal-title">إضافة فئة أصناف</h3>
          <button class="modal-close" onclick="closeModal('cat-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cat-edit-id" />
          <div class="form-group mb-16">
            <label>اسم الفئة *</label>
            <input type="text" id="cat-name" class="input" placeholder="مثال: أرز وحبوب، معلبات، عصائر..." />
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>الكود *</label>
              <input type="text" id="cat-code" class="input mono" placeholder="RICE" />
            </div>
            <div class="form-group">
              <label>الأيقونة / الرمز</label>
              <input type="text" id="cat-icon" class="input" placeholder="🌾" value="📦" />
            </div>
            <div class="form-group">
              <label>سرعة دوران السلع</label>
              <select id="cat-velocity" class="input">
                <option value="fast">أساسية سريعة الدوران (Fast)</option>
                <option value="medium" selected>متوسطة الدوران (Medium)</option>
                <option value="slow">منخفضة / متخصصة (Slow)</option>
                <option value="none">مخصص / لا ينطبق</option>
              </select>
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الوصف / الملاحظات</label>
            <textarea id="cat-desc" class="input" rows="2" placeholder="وصف للأصناف التابعة لهذه الفئة"></textarea>
          </div>
          <div id="cat-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cat-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCategory()" id="save-cat-btn">حفظ الفئة</button>
        </div>
      </div>
    </div>

    <!-- Unit Modal -->
    <div class="modal-overlay" id="unit-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="unit-modal-title">إضافة وحدة قياس</h3>
          <button class="modal-close" onclick="closeModal('unit-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="unit-edit-id" />
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>كود الوحدة *</label>
              <input type="text" id="unit-code" class="input mono" placeholder="CTN" />
            </div>
            <div class="form-group">
              <label>اسم الوحدة (عربي) *</label>
              <input type="text" id="unit-name-ar" class="input" placeholder="كرتون" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>اسم الوحدة (إنجليزي)</label>
              <input type="text" id="unit-name-en" class="input mono" placeholder="Carton" />
            </div>
            <div class="form-group">
              <label>معامل التحويل (عدد القطع)</label>
              <input type="number" id="unit-factor" class="input mono" value="1" min="1" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>ملاحظات</label>
            <input type="text" id="unit-notes" class="input" placeholder="وصف التعبئة..." />
          </div>
          <div id="unit-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('unit-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveUnit()" id="save-unit-btn">حفظ الوحدة</button>
        </div>
      </div>
    </div>`;

  window.switchCatTab = (tab) => {
    document.getElementById("btn-tab-cats").classList.toggle("active", tab === "cats");
    document.getElementById("btn-tab-units").classList.toggle("active", tab === "units");
    document.getElementById("section-cats").classList.toggle("hidden", tab !== "cats");
    document.getElementById("section-units").classList.toggle("hidden", tab !== "units");
    document.getElementById("btn-add-cat").classList.toggle("hidden", tab !== "cats");
    document.getElementById("btn-add-unit").classList.toggle("hidden", tab !== "units");
  };

  await loadCategoriesGrid();
  await loadUnitsTable();
}

export async function forceReloadCategories() {
  clearERPCache(COLS.categories().path);
  clearERPCache(COLS.products().path);
  await loadCategoriesGrid();
  if (window.showToast) window.showToast("تم تحديث بيانات الفئات والمخزون", "success");
}
window.forceReloadCategories = forceReloadCategories;

window.onCategorySearch = (val) => {
  _catSearchQuery = (val || "").trim().toLowerCase();
  renderFilteredCategories();
};

async function loadCategoriesGrid() {
  const grid = document.getElementById("cats-grid");
  if (!grid) return;

  try {
    // 1. Fetch categories, products, and stock balances in parallel
    const [catsSnap, productsSnap, stockBalancesSnap] = await Promise.all([
      getAll(COLS.categories()),
      getAll(COLS.products()),
      getAll(COLS.stockByWarehouse())
    ]);

    let cats = (catsSnap && catsSnap.length > 0) ? catsSnap : [];
    _allProducts = productsSnap || [];
    _allStockBalances = stockBalancesSnap || [];

    // Combine with default categories if empty or missing
    if (cats.length === 0) {
      cats = [...DEFAULT_CATEGORIES];
    } else {
      // Ensure any default category not yet in DB is also included in view
      DEFAULT_CATEGORIES.forEach(def => {
        if (!cats.some(c => c.id === def.id || c.code === def.code || c.name === def.name)) {
          cats.push(def);
        }
      });
    }

    _allCategories = cats;
    renderFilteredCategories();
  } catch (err) {
    console.error("Error loading categories:", err);
    // Fallback to default categories if network/cache error
    _allCategories = [...DEFAULT_CATEGORIES];
    renderFilteredCategories();
  }
}

function renderFilteredCategories() {
  const grid = document.getElementById("cats-grid");
  const kpisContainer = document.getElementById("cats-kpis");
  if (!grid) return;

  const products = _allProducts || [];
  const stockBalances = _allStockBalances || [];

  // Map stock quantities per product ID
  const stockMap = {};
  stockBalances.forEach(s => {
    if (!stockMap[s.productId]) stockMap[s.productId] = 0;
    stockMap[s.productId] += s.qty || 0;
  });

  // Aggregate statistics per category
  const catStats = {};
  let totalGrandProducts = 0;
  let totalGrandQty = 0;
  let totalGrandSaleValue = 0;
  let totalGrandCostValue = 0;

  products.forEach(p => {
    const catId = p.category || p.categoryId || "general";
    if (!catStats[catId]) {
      catStats[catId] = { count: 0, totalQty: 0, totalValue: 0, totalCost: 0, units: {} };
    }
    const qty = (stockMap[p.id] !== undefined) ? stockMap[p.id] : (p._totalQty !== undefined ? p._totalQty : (p.totalQty || p.stockQty || 0));
    const sPrice = parseFloat(p.sellingPrice || p.salePrice || p.priceRetail || p.price || 0);
    const cPrice = parseFloat(p.costPrice || p.purchasePrice || p.avgCostPrice || 0);

    catStats[catId].count += 1;
    catStats[catId].totalQty += qty;
    catStats[catId].totalValue += (qty * sPrice);
    catStats[catId].totalCost += (qty * cPrice);

    totalGrandProducts += 1;
    totalGrandQty += qty;
    totalGrandSaleValue += (qty * sPrice);
    totalGrandCostValue += (qty * cPrice);

    if (qty > 0) {
      const u = p.unit || "Piece";
      catStats[catId].units[u] = (catStats[catId].units[u] || 0) + qty;
    }
  });

  // Render Top KPI Cards
  if (kpisContainer) {
    kpisContainer.innerHTML = `
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid var(--brand);">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي الفئات النشطة</div>
        <div style="font-size:20px; font-weight:900; color:var(--brand); font-family:monospace; margin:4px 0;">${_allCategories.length} فئة</div>
        <div style="font-size:10.5px; color:var(--text-2);">${totalGrandProducts} صنف مفهرس</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #10b981;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي وحدات المخزون</div>
        <div style="font-size:20px; font-weight:900; color:#10b981; font-family:monospace; margin:4px 0;">${formatQuantity(totalGrandQty)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">كافة المستودعات</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #6366f1;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">قيمة المخزون (سعر البيع)</div>
        <div style="font-size:20px; font-weight:900; color:#6366f1; font-family:monospace; margin:4px 0;">${formatCurrency(totalGrandSaleValue)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">القيمة السوقية التقديرية</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #f59e0b;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">قيمة المخزون (سعر التكلفة)</div>
        <div style="font-size:20px; font-weight:900; color:#f59e0b; font-family:monospace; margin:4px 0;">${formatCurrency(totalGrandCostValue)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">رأس المال المخزني الفعلي</div>
      </div>
    `;
  }

  // Filter categories by search query
  let filteredCats = [..._allCategories];
  if (_catSearchQuery) {
    filteredCats = filteredCats.filter(c => 
      (c.name && c.name.toLowerCase().includes(_catSearchQuery)) ||
      (c.code && c.code.toLowerCase().includes(_catSearchQuery)) ||
      (c.desc && c.desc.toLowerCase().includes(_catSearchQuery)) ||
      (c.description && c.description.toLowerCase().includes(_catSearchQuery))
    );
  }

  // Sort categories: Categories with active products first, then by name
  filteredCats.sort((a, b) => {
    const cntA = (catStats[a.id]?.count || catStats[a.code]?.count || 0);
    const cntB = (catStats[b.id]?.count || catStats[b.code]?.count || 0);
    if (cntA !== cntB) return cntB - cntA;
    return (a.name || "").localeCompare(b.name || "", 'ar');
  });

  if (filteredCats.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:48px; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border);">
        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
        <h3 style="margin:0 0 6px 0; font-size:16px;">لا توجد فئات مطابقة للبحث "${_catSearchQuery}"</h3>
        <p style="color:var(--text-2); font-size:12px; margin:0 0 16px 0;">تأكد من كتابة الكلمة بشكل صحيح أو أضف فئة جديدة</p>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('cat-search-input').value=''; onCategorySearch('');">عرض كل الفئات</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredCats.map(c => {
    const stats = catStats[c.id] || catStats[c.code] || { count: 0, totalQty: 0, totalValue: 0, totalCost: 0, units: {} };
    
    // Determine dominant unit of measure for this category
    let dominantUnit = "وحدة";
    if (stats.units && Object.keys(stats.units).length > 0) {
      const sortedUnits = Object.entries(stats.units).sort((a, b) => b[1] - a[1]);
      if (sortedUnits[0] && sortedUnits[0][1] > 0) {
        dominantUnit = translateUnit(sortedUnits[0][0]);
      }
    } else if (stats.count > 0) {
      const firstProd = products.find(p => (p.category === c.id || p.categoryId === c.id || p.category === c.code));
      if (firstProd) {
        dominantUnit = translateUnit(firstProd.unit);
      }
    }

    const vel = c.velocity || "medium";
    const velLabel = vel === "fast" ? "⚡ سريعة الدوران" : vel === "slow" ? "🐢 بطيئة / متخصصة" : "⚖️ متوسطة الدوران";
    const velClass = vel === "fast" ? "cat-badge-fast" : vel === "slow" ? "cat-badge-slow" : "cat-badge-medium";

    return `
      <div class="card clickable-cat-card" onclick="goToCategoryProducts('${c.id || c.code}')" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between; min-height:220px; border-radius:12px;">
        <div>
          <div class="flex items-center justify-between mb-10">
            <div class="flex items-center gap-12">
              <div style="width:46px; height:46px; background:var(--indigo-glow, rgba(99,102,241,0.12)); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">
                ${c.icon || "📦"}
              </div>
              <div>
                <h3 style="font-family:var(--font-heading); font-size:15px; color:var(--text-0); font-weight:800; margin:0 0 2px 0;">${c.name}</h3>
                <span class="mono text-indigo font-semibold" style="font-size:10.5px; opacity:0.85;">CODE: ${c.code || c.id || "CAT"}</span>
              </div>
            </div>
            
            <div class="cat-actions" style="display:flex; gap:4px; align-items:center;">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation(); editCategory('${c.id || c.code}')" title="تعديل الفئة" style="color:var(--text-2);">✏️</button>
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation(); deleteCategory('${c.id || c.code}','${c.name}')" title="حذف الفئة" style="color:var(--bad);">🗑️</button>
            </div>
          </div>

          <div style="display:flex; gap:6px; align-items:center; margin-bottom:10px;">
            <span style="font-size:10px; padding:2px 8px; border-radius:12px; font-weight:700;" class="${velClass}">${velLabel}</span>
          </div>

          <p class="text-2" style="font-size:11.5px; line-height:1.45; margin:0 0 12px 0; min-height:34px; color:var(--text-2);">${c.description || c.desc || "تنظيم الأصناف والمنتجات التابعة لهذا القسم"}</p>
        </div>
        
        <div class="cat-stats" style="border-top:1px dashed var(--border-soft); padding-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; color:var(--text-2);">
          <div>
            <span class="dim">الأصناف:</span>
            <strong style="color:var(--brand); font-weight:800; font-size:12px;">${stats.count} صنف</strong>
          </div>
          <div>
            <span class="dim">المخزون:</span>
            <strong style="color:var(--good); font-weight:800; font-size:12px;">${formatQuantity(stats.totalQty)} ${dominantUnit}</strong>
          </div>
          <div style="grid-column:span 2; display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">قيمة المخزون (بيع):</span>
            <strong style="color:var(--text-0); font-family:monospace; font-weight:700;">${formatCurrency(stats.totalValue)}</strong>
          </div>
          <div style="grid-column:span 2; display:flex; justify-content:space-between;">
            <span class="dim">قيمة التكلفة:</span>
            <strong style="color:var(--orange, #f59e0b); font-family:monospace; font-weight:700;">${formatCurrency(stats.totalCost)}</strong>
          </div>
        </div>
      </div>`;
  }).join("");
}

async function loadUnitsTable() {
  const tbody = document.getElementById("units-tbody");
  if (!tbody) return;

  const defaultUnits = [
    { id: "u1", code: "PCS", nameAr: "قطعة", nameEn: "Piece", factor: 1, notes: "الوحدة الأساسية الصغرى" },
    { id: "u2", code: "CTN", nameAr: "كرتون", nameEn: "Carton", factor: 12, notes: "شد 12 قطعة أو عبوة" },
    { id: "u3", code: "BAG", nameAr: "كيس / شيكارة", nameEn: "Bag", factor: 1, notes: "أكياس 5 كجم / 10 كجم / 40 كجم" },
    { id: "u4", code: "PKT", nameAr: "باكت / باق", nameEn: "Packet", factor: 6, notes: "ربطة أو باكت فرعي" },
    { id: "u5", code: "PLT", nameAr: "باليت كامل", nameEn: "Pallet", factor: 50, notes: "طبلية مخزنية كاملة" },
  ];

  try {
    const units = await getAll(COLS.units(), [orderBy("code")]);
    const allUnits = (units && units.length > 0) ? units : defaultUnits;

    tbody.innerHTML = allUnits.map(u => `
      <tr>
        <td class="mono font-bold text-indigo" style="font-size:12px;">${u.code}</td>
        <td class="font-heading font-bold">${u.nameAr || u.name}</td>
        <td class="mono dim">${u.nameEn || "—"}</td>
        <td class="mono font-semibold text-good">${u.factor || 1} قطعة</td>
        <td class="dim">${u.notes || "—"}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="deleteUnit('${u.id}','${u.nameAr || u.name}')" style="color:var(--bad);" title="حذف الوحدة">🗑️</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert bad">${err.message}</div></td></tr>`;
  }
}

window.openCatModal = (catToEdit = null) => {
  const editIdEl = document.getElementById("cat-edit-id");
  const nameEl = document.getElementById("cat-name");
  const codeEl = document.getElementById("cat-code");
  const iconEl = document.getElementById("cat-icon");
  const descEl = document.getElementById("cat-desc");
  const velEl = document.getElementById("cat-velocity");
  const titleEl = document.getElementById("cat-modal-title");
  document.getElementById("cat-error").classList.add("hidden");

  if (catToEdit) {
    titleEl.textContent = "تعديل فئة الأصناف";
    editIdEl.value = catToEdit.id || "";
    nameEl.value = catToEdit.name || "";
    codeEl.value = catToEdit.code || "";
    iconEl.value = catToEdit.icon || "📦";
    descEl.value = catToEdit.desc || catToEdit.description || "";
    velEl.value = catToEdit.velocity || "medium";
  } else {
    titleEl.textContent = "إضافة فئة أصناف جديدة";
    editIdEl.value = "";
    nameEl.value = "";
    codeEl.value = "";
    iconEl.value = "📦";
    descEl.value = "";
    velEl.value = "medium";
  }
  openModal("cat-modal");
};

window.editCategory = (catId) => {
  const cat = _allCategories.find(c => c.id === catId || c.code === catId);
  if (cat) {
    window.openCatModal(cat);
  }
};

window.saveCategory = async () => {
  const errEl = document.getElementById("cat-error");
  errEl.classList.add("hidden");
  const editId = document.getElementById("cat-edit-id").value;
  const name = document.getElementById("cat-name").value.trim();
  const code = document.getElementById("cat-code").value.trim();
  const icon = document.getElementById("cat-icon").value.trim() || "📦";
  const desc = document.getElementById("cat-desc").value.trim();
  const velocity = document.getElementById("cat-velocity").value;

  if (!name || !code) { 
    errEl.textContent = "اسم الفئة والكود مطلوبان"; 
    errEl.classList.remove("hidden"); 
    return; 
  }

  const btn = document.getElementById("save-cat-btn");
  btn.disabled = true;

  try {
    const data = { name, code, icon, desc, description: desc, velocity, updatedAt: new Date() };

    if (editId) {
      await setDoc(doc(COLS.categories(), editId), data, { merge: true });
      if (window.showToast) window.showToast("تم تحديث الفئة بنجاح", "success");
    } else {
      const docId = code.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      await setDoc(doc(COLS.categories(), docId), { ...data, createdAt: new Date() }, { merge: true });
      if (window.showToast) window.showToast("تمت إضافة الفئة بنجاح", "success");
    }

    clearERPCache(COLS.categories().path);
    closeModal("cat-modal");
    await loadCategoriesGrid();
  } catch (err) {
    errEl.textContent = err.message; 
    errEl.classList.remove("hidden");
  } finally { 
    btn.disabled = false; 
  }
};

window.deleteCategory = async (id, name) => {
  if (typeof window.showConfirm === "function") {
    if (!await showConfirm(`هل أنت متأكد من حذف فئة "${name}"؟`, "تأكيد الحذف")) return;
  } else if (!confirm(`هل أنت متأكد من حذف فئة "${name}"؟`)) {
    return;
  }

  try { 
    await remove("categories", id); 
    clearERPCache(COLS.categories().path);
    if (window.showToast) window.showToast("تم حذف الفئة بنجاح", "success"); 
    await loadCategoriesGrid(); 
  } catch (err) { 
    if (window.showToast) window.showToast(err.message, "error"); 
    else alert(err.message);
  }
};

window.openUnitModal = () => {
  document.getElementById("unit-edit-id").value = "";
  document.getElementById("unit-code").value = "";
  document.getElementById("unit-name-ar").value = "";
  document.getElementById("unit-name-en").value = "";
  document.getElementById("unit-factor").value = "1";
  document.getElementById("unit-notes").value = "";
  document.getElementById("unit-error").classList.add("hidden");
  openModal("unit-modal");
};

window.saveUnit = async () => {
  const errEl = document.getElementById("unit-error");
  errEl.classList.add("hidden");
  const code   = document.getElementById("unit-code").value.trim();
  const nameAr = document.getElementById("unit-name-ar").value.trim();
  if (!code || !nameAr) { 
    errEl.textContent = "الكود واسم الوحدة مطلوبان"; 
    errEl.classList.remove("hidden"); 
    return; 
  }

  const btn = document.getElementById("save-unit-btn");
  btn.disabled = true;

  try {
    await create(COLS.units(), {
      code, nameAr,
      nameEn: document.getElementById("unit-name-en").value.trim(),
      factor: parseInt(document.getElementById("unit-factor").value) || 1,
      notes: document.getElementById("unit-notes").value.trim(),
    });
    clearERPCache(COLS.units().path);
    if (window.showToast) window.showToast("تمت إضافة وحدة القياس بنجاح", "success");
    closeModal("unit-modal");
    await loadUnitsTable();
  } catch (err) {
    errEl.textContent = err.message; 
    errEl.classList.remove("hidden");
  } finally { 
    btn.disabled = false; 
  }
};

window.deleteUnit = async (id, name) => {
  if (typeof window.showConfirm === "function") {
    if (!await showConfirm(`هل أنت متأكد من حذف الوحدة "${name}"؟`, "تأكيد")) return;
  } else if (!confirm(`هل أنت متأكد من حذف الوحدة "${name}"؟`)) {
    return;
  }

  try { 
    await remove("units", id); 
    clearERPCache(COLS.units().path);
    if (window.showToast) window.showToast("تم حذف الوحدة", "success"); 
    await loadUnitsTable(); 
  } catch (err) { 
    if (window.showToast) window.showToast(err.message, "error"); 
    else alert(err.message);
  }
};

window.goToCategoryProducts = (catId) => {
  sessionStorage.setItem("filter_category_id", catId);
  window.location.hash = "#products";
};
