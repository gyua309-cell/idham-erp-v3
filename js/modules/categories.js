// ============================================================
// IDHAM ERP — Categories & Units Module (الفئات ووحدات القياس)
// ============================================================
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, orderBy, getDocs } from "../utils/db.js";
import { db } from "../firebase-config.js";
import { formatCurrency, translateUnit, formatQuantity } from "../utils/formatters.js";



export async function render(container, user) {
  container.innerHTML = `
    <style>
      .clickable-cat-card {
        cursor: pointer;
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s, border-color 0.22s;
        border: 1px solid var(--border-soft) !important;
      }
      .clickable-cat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        border-color: var(--brand) !important;
        background: var(--bg-2-hover);
      }
      .clickable-cat-card .delete-btn-container {
        opacity: 0.15;
        transition: opacity 0.2s;
      }
      .clickable-cat-card:hover .delete-btn-container {
        opacity: 1;
      }
    </style>
    <div class="filterbar">
      <div style="display:flex;gap:4px;" class="quick-filters">
        <button class="quick-filter-btn active" id="btn-tab-cats" onclick="switchCatTab('cats')">📂 فئات الأصناف</button>
        <button class="quick-filter-btn" id="btn-tab-units" onclick="switchCatTab('units')">📏 وحدات القياس</button>
      </div>
      <div style="margin-right:auto;">
        <button class="btn btn-primary" id="btn-add-cat" onclick="openCatModal()">+ إضافة فئة جديدة</button>
        <button class="btn btn-primary hidden" id="btn-add-unit" onclick="openUnitModal()">+ إضافة وحدة قياس</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Categories Section -->
      <div id="section-cats">
        <div class="page-header">
          <div>
            <h1 class="page-title">تصنيفات الأصناف (Categories)</h1>
            <p class="page-subtitle">تنظيم الأصناف والكتالوج إلى أقسام رئيسية وفرعية</p>
          </div>
        </div>

        <div class="grid-3 gap-16 mb-24" id="cats-grid">
          <div class="page-loading"><div class="loading-spinner"></div></div>
        </div>
      </div>

      <!-- Units Section (Hidden by default) -->
      <div id="section-units" class="hidden">
        <div class="page-header">
          <div>
            <h1 class="page-title">وحدات القياس (Units of Measurement)</h1>
            <p class="page-subtitle">تعريف وحدات التعبئة (كرتون، كيس، قطعة، باليت) ومكافئاتها</p>
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
                  <th></th>
                </tr>
              </thead>
              <tbody id="units-tbody">
                ${Array(8).fill(0).map(() => `
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
                <option value="fast">أساسية سريعة الدوران (5%)</option>
                <option value="medium" selected>متوسطة الدوران (10%)</option>
                <option value="slow">منخفضة / متخصصة (15%)</option>
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

async function loadCategoriesGrid() {
  const grid = document.getElementById("cats-grid");
  if (!grid) return;
  
  const defaultCats = [
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

  try {
    // 1. Fetch categories, products, and stock balances in parallel for speed!
    const [catsSnap, productsSnap, stockBalancesSnap] = await Promise.all([
      getAll(COLS.categories()),
      getAll(COLS.products()),
      getAll(COLS.stockByWarehouse())
    ]);

    let cats = catsSnap;
    const products = productsSnap;
    const stockBalances = stockBalancesSnap;

    // Check for missing default categories
    const missingCats = defaultCats.filter(d => !cats.some(c => c.id === d.id));

    if (missingCats.length > 0) {
      const { writeBatch, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const batch = writeBatch(db);

      // Create missing default categories
      missingCats.forEach(c => {
        const docRef = doc(COLS.categories(), c.id);
        batch.set(docRef, {
          name: c.name,
          code: c.code,
          icon: c.icon,
          description: c.desc,
          velocity: c.velocity || "medium",
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
      });

      await batch.commit();

      // Fetch fresh set
      cats = await getAll(COLS.categories());
    }

    // Map stock quantities per product ID
    const stockMap = {};
    stockBalances.forEach(s => {
      if (!stockMap[s.productId]) stockMap[s.productId] = 0;
      stockMap[s.productId] += s.qty || 0;
    });

    // Aggregate statistics per category
    const catStats = {};
    products.forEach(p => {
      const catId = p.category || p.categoryId;
      if (!catId) return;
      if (!catStats[catId]) {
        catStats[catId] = { count: 0, totalQty: 0, totalValue: 0, totalCost: 0, units: {} };
      }
      const qty = (stockMap[p.id] !== undefined) ? stockMap[p.id] : (p._totalQty !== undefined ? p._totalQty : (p.totalQty || 0));
      const sPrice = p.sellingPrice || p.salePrice || p.priceRetail || p.price || 0;
      const cPrice = p.costPrice || p.purchasePrice || 0;
      catStats[catId].count += 1;
      catStats[catId].totalQty += qty;
      catStats[catId].totalValue += qty * sPrice;
      catStats[catId].totalCost += qty * cPrice;

      if (qty > 0) {
        const u = p.unit || "Piece";
        catStats[catId].units[u] = (catStats[catId].units[u] || 0) + qty;
      }
    });

    // Sort categories: Categories with active products first, then by name
    cats.sort((a, b) => {
      const cntA = (catStats[a.id]?.count || 0);
      const cntB = (catStats[b.id]?.count || 0);
      if (cntA !== cntB) return cntB - cntA;
      return a.name.localeCompare(b.name, 'ar');
    });

    grid.innerHTML = cats.map(c => {
      const stats = catStats[c.id] || { count: 0, totalQty: 0, totalValue: 0, totalCost: 0, units: {} };
      
      // Determine dominant unit of measure for this category
      let dominantUnit = "وحدة";
      if (stats.units && Object.keys(stats.units).length > 0) {
        const sortedUnits = Object.entries(stats.units).sort((a, b) => b[1] - a[1]);
        if (sortedUnits[0] && sortedUnits[0][1] > 0) {
          dominantUnit = translateUnit(sortedUnits[0][0]);
        }
      } else if (stats.count > 0) {
        const firstProd = products.find(p => (p.category === c.id || p.categoryId === c.id));
        if (firstProd) {
          dominantUnit = translateUnit(firstProd.unit);
        }
      }

      return `
        <div class="card clickable-cat-card" onclick="goToCategoryProducts('${c.id}')" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; min-height:220px; border-radius:12px;">
          <div>
            <div class="flex items-center justify-between mb-12">
              <div class="flex items-center gap-12">
                <div style="width:46px;height:46px;background:var(--indigo-glow);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;">${c.icon || "📦"}</div>
                <div>
                  <h3 style="font-family:var(--font-heading);font-size:15px;color:var(--text-0);font-weight:700;">${c.name}</h3>
                  <span class="mono text-indigo font-semibold" style="font-size:10px;">CODE: ${c.code || "CAT"}</span>
                </div>
              </div>
              <div class="delete-btn-container" onclick="event.stopPropagation(); deleteCategory('${c.id}','${c.name}')">
                <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);" title="حذف الفئة">🗑️</button>
              </div>
            </div>
            <p class="text-2" style="font-size:12px; line-height:1.5; margin-bottom:12px;">${c.description || c.desc || "لا يوجد وصف"}</p>
          </div>
          
          <div class="cat-stats" style="border-top:1px dashed var(--border-soft); padding-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; color:var(--text-2);">
            <div>
              <span class="dim">الأصناف:</span>
              <strong style="color:var(--brand);">${stats.count}</strong>
            </div>
            <div>
              <span class="dim">المخزون:</span>
              <strong style="color:var(--good);">${formatQuantity(stats.totalQty)} ${dominantUnit}</strong>
            </div>
            <div style="grid-column:span 2; display:flex; justify-content:space-between; margin-top:2px;">
              <span class="dim">قيمة المخزون (بيع):</span>
              <strong style="color:var(--text-0); font-family:monospace;">${formatCurrency(stats.totalValue)} ر.س</strong>
            </div>
            <div style="grid-column:span 2; display:flex; justify-content:space-between;">
              <span class="dim">قيمة التكلفة:</span>
              <strong style="color:var(--orange); font-family:monospace;">${formatCurrency(stats.totalCost)} ر.س</strong>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    grid.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
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
    const allUnits = units.length > 0 ? units : defaultUnits;

    tbody.innerHTML = allUnits.map(u => `
      <tr>
        <td class="mono font-bold text-indigo" style="font-size:12px;">${u.code}</td>
        <td class="font-heading font-bold">${u.nameAr || u.name}</td>
        <td class="mono dim">${u.nameEn || "—"}</td>
        <td class="mono font-semibold text-good">${u.factor || 1} قطعة</td>
        <td class="dim">${u.notes || "—"}</td>
        <td>
          <button class="btn btn-icon sm btn-ghost" onclick="deleteUnit('${u.id}','${u.nameAr || u.name}')" style="color:var(--bad);">🗑️</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert bad">${err.message}</div></td></tr>`;
  }
}

window.openCatModal = () => {
  document.getElementById("cat-edit-id").value = "";
  document.getElementById("cat-name").value = "";
  document.getElementById("cat-code").value = "";
  document.getElementById("cat-desc").value = "";
  document.getElementById("cat-velocity").value = "medium";
  document.getElementById("cat-error").classList.add("hidden");
  openModal("cat-modal");
};

window.saveCategory = async () => {
  const errEl = document.getElementById("cat-error");
  errEl.classList.add("hidden");
  const name = document.getElementById("cat-name").value.trim();
  const code = document.getElementById("cat-code").value.trim();
  if (!name || !code) { errEl.textContent = "اسم الفئة والكود مطلوبان"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-cat-btn");
  btn.disabled = true;

  try {
    await create(COLS.categories(), {
      name, code,
      icon: document.getElementById("cat-icon").value.trim() || "📦",
      desc: document.getElementById("cat-desc").value.trim(),
      velocity: document.getElementById("cat-velocity").value
    });
    showToast("تمت إضافة الفئة بنجاح", "success");
    closeModal("cat-modal");
    await loadCategoriesGrid();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

window.deleteCategory = async (id, name) => {
  if (!await showConfirm(`حذف فئة "${name}"؟`, "تأكيد")) return;
  try { await remove("categories", id); showToast("تم الحذف", "success"); await loadCategoriesGrid(); }
  catch (err) { showToast(err.message, "error"); }
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
  if (!code || !nameAr) { errEl.textContent = "الكود واسم الوحدة مطلوبان"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-unit-btn");
  btn.disabled = true;

  try {
    await create(COLS.units(), {
      code, nameAr,
      nameEn: document.getElementById("unit-name-en").value.trim(),
      factor: parseInt(document.getElementById("unit-factor").value) || 1,
      notes: document.getElementById("unit-notes").value.trim(),
    });
    showToast("تمت إضافة وحدة القياس", "success");
    closeModal("unit-modal");
    await loadUnitsTable();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

window.deleteUnit = async (id, name) => {
  if (!await showConfirm(`حذف الوحدة "${name}"؟`, "تأكيد")) return;
  try { await remove("units", id); showToast("تم الحذف", "success"); await loadUnitsTable(); }
  catch (err) { showToast(err.message, "error"); }
};

window.goToCategoryProducts = (catId) => {
  sessionStorage.setItem("filter_category_id", catId);
  window.location.hash = "#products";
};

