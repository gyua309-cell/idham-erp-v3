import{l as y,C as l,g as k,o as z,f as E,x as L,r as P,c as j}from"./index-CF9GFeRJ.js";import{orderBy as Q,setDoc as T,doc as M}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[],A=[],S=[],v="";const B=[{id:"dairy",name:"ألبان ومنتجاتها",code:"dairy",icon:"🥛",desc:"حليب، لبن، زبادي، أجبان، زبدة، قشطة",velocity:"fast"},{id:"oils",name:"زيوت وسمن",code:"oils",icon:"🌻",desc:"زيوت ذرة، دوار الشمس، زيتون، سمن",velocity:"fast"},{id:"rice_grains",name:"أرز وحبوب",code:"rice_grains",icon:"🌾",desc:"أرز بسمتي، عدس، فاصوليا، حمص",velocity:"fast"},{id:"dry_goods",name:"سكر ودقيق ومعجنات",code:"dry_goods",icon:"🍞",desc:"سكر، دقيق، مكرونة، شوفان",velocity:"fast"},{id:"beverages",name:"مشروبات وعصائر",code:"beverages",icon:"🧃",desc:"مشروبات غازية، عصائر، مشروبات طاقة",velocity:"fast"},{id:"water",name:"مياه معبأة",code:"water",icon:"💧",desc:"مياه شرب وطبيعية ومعدنية",velocity:"fast"},{id:"meat_poultry",name:"لحوم ودواجن مجمدة",code:"meat_poultry",icon:"🍗",desc:"دجاج، لحم بقري، مرتديلا، برجر",velocity:"slow"},{id:"seafood",name:"أسماك ومأكولات بحرية",code:"seafood",icon:"🐟",desc:"سمك مجمد، روبيان، فيليه",velocity:"slow"},{id:"canned",name:"معلبات وصلصات",code:"canned",icon:"🥫",desc:"تونة، فول، صلصة، كاتشب، ذرة",velocity:"medium"},{id:"confectionery",name:"حلويات وشوكولاتة",code:"confectionery",icon:"🍫",desc:"شوكولاتة، حلويات، بونبون",velocity:"medium"},{id:"biscuits",name:"بسكويت وكيك",code:"biscuits",icon:"🍪",desc:"بسكويت، ويفر، كيك، مافن",velocity:"medium"},{id:"spices",name:"توابل وبهارات",code:"spices",icon:"🧂",desc:"فلفل، كمون، كركم، بهارات مشكلة",velocity:"slow"},{id:"coffee_tea",name:"قهوة وشاي",code:"coffee_tea",icon:"☕",desc:"قهوة عربية وسريعة، شاي أخضر وأسود",velocity:"slow"},{id:"cleaning",name:"منظفات ومعطرات",code:"cleaning",icon:"🧴",desc:"مسحوق غسيل، سائل جلي، مطهرات",velocity:"slow"},{id:"personal_care",name:"عناية شخصية وورقيات",code:"personal_care",icon:"🧻",desc:"مناديل، معجون أسنان، شامبو",velocity:"slow"},{id:"baby",name:"أطفال وحفاضات",code:"baby",icon:"👶",desc:"حفاضات، حليب أطفال، مستلزمات",velocity:"slow"},{id:"bakery",name:"مخبوزات وخبز",code:"bakery",icon:"🥖",desc:"توست، كرواسون، سمبوسة، عجائن",velocity:"medium"},{id:"frozen",name:"أغذية مجمدة",code:"frozen",icon:"🧊",desc:"بطاطس، خضار، سمبوسة، بيتزا",velocity:"slow"},{id:"honey_jam",name:"عسل ومربيات وطحينة",code:"honey_jam",icon:"🍯",desc:"عسل طبيعي، مربى، طحينة، نوتيلا",velocity:"medium"},{id:"snacks",name:"شيبس ومكسرات",code:"snacks",icon:"🥜",desc:"شيبس، مكسرات، تمور، فشار",velocity:"medium"},{id:"veg_fruits",name:"خضار وفواكه طازجة",code:"veg_fruits",icon:"🍅",desc:"طماطم، خيار، بطاطس، تفاح، موز، برتقال",velocity:"fast"},{id:"frozen_veg",name:"خضروات مجمدة",code:"frozen_veg",icon:"🥦",desc:"بازلاء مجمدة، خضار مشكل، ملوخية، بامية",velocity:"medium"},{id:"dates",name:"تمور ومنتجاتها",code:"dates",icon:"🌴",desc:"تمر خلاص، سكري، عجوة، معجون التمر",velocity:"medium"},{id:"pickles",name:"مخللات وأجبان مكشوفة",code:"pickles",icon:"🥒",desc:"زيتون أخضر وأسود، مخلل مشكل، أجبان وزن",velocity:"medium"},{id:"plastics",name:"بلاستيكيات ومستلزمات تغليف",code:"plastics",icon:"🛍️",desc:"أكياس بلاستيك، نايلون تغليف، سفريات",velocity:"medium"},{id:"disposables",name:"أكواب ومستلزمات ضيافة",code:"disposables",icon:"🥤",desc:"أكواب ورقية، ملاعق، شوك، علب بلاستيك",velocity:"medium"},{id:"tobacco",name:"تبغ ومستلزمات تدخين",code:"tobacco",icon:"🚬",desc:"سجائر، معسل، مستلزمات تدخين متنوعة",velocity:"slow"},{id:"egg",name:"بيض طازج",code:"egg",icon:"🥚",desc:"بيض مائدة طازج بمختلف المقاسات",velocity:"fast"},{id:"sauces",name:"صلصات ومايونيز وتوابل سائلة",code:"sauces",icon:"🍯",desc:"مايونيز، خردل، كاتشب، صلصة حارة",velocity:"medium"},{id:"nuts_seeds",name:"مكسرات وبذور",code:"nuts_seeds",icon:"🌰",desc:"فستق، لوز، كاجو، حب دوار الشمس",velocity:"medium"},{id:"ice_cream",name:"آيس كريم وحلويات باردة",code:"ice_cream",icon:"🍦",desc:"آيس كريم متنوع، حلويات مثلجة",velocity:"medium"}];async function O(e,i){e.innerHTML=`
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
                ${Array(5).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
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
    </div>`,window.switchCatTab=o=>{document.getElementById("btn-tab-cats").classList.toggle("active",o==="cats"),document.getElementById("btn-tab-units").classList.toggle("active",o==="units"),document.getElementById("section-cats").classList.toggle("hidden",o!=="cats"),document.getElementById("section-units").classList.toggle("hidden",o!=="units"),document.getElementById("btn-add-cat").classList.toggle("hidden",o!=="cats"),document.getElementById("btn-add-unit").classList.toggle("hidden",o!=="units")},await I(),await _()}async function G(){y(l.categories().path),y(l.products().path),await I(),window.showToast&&window.showToast("تم تحديث بيانات الفئات والمخزون","success")}window.forceReloadCategories=G;window.onCategorySearch=e=>{v=(e||"").trim().toLowerCase(),$()};async function I(){if(document.getElementById("cats-grid"))try{const[i,o,d]=await Promise.all([k(l.categories()),k(l.products()),k(l.stockByWarehouse())]);let a=i&&i.length>0?i:[];A=o||[],S=d||[],a.length===0?a=[...B]:B.forEach(n=>{a.some(r=>r.id===n.id||r.code===n.code||r.name===n.name)||a.push(n)}),h=a,$()}catch(i){console.error("Error loading categories:",i),h=[...B],$()}}function $(){const e=document.getElementById("cats-grid"),i=document.getElementById("cats-kpis");if(!e)return;const o=A||[],d=S||[],a={};d.forEach(t=>{a[t.productId]||(a[t.productId]=0),a[t.productId]+=t.qty||0});const n={};let r=0,u=0,p=0,w=0;o.forEach(t=>{const s=t.category||t.categoryId||"general";n[s]||(n[s]={count:0,totalQty:0,totalValue:0,totalCost:0,units:{}});const c=a[t.id]!==void 0?a[t.id]:t._totalQty!==void 0?t._totalQty:t.totalQty||t.stockQty||0,m=parseFloat(t.sellingPrice||t.salePrice||t.priceRetail||t.price||0),x=parseFloat(t.costPrice||t.purchasePrice||t.avgCostPrice||0);if(n[s].count+=1,n[s].totalQty+=c,n[s].totalValue+=c*m,n[s].totalCost+=c*x,r+=1,u+=c,p+=c*m,w+=c*x,c>0){const C=t.unit||"Piece";n[s].units[C]=(n[s].units[C]||0)+c}}),i&&(i.innerHTML=`
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid var(--brand);">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي الفئات النشطة</div>
        <div style="font-size:20px; font-weight:900; color:var(--brand); font-family:monospace; margin:4px 0;">${h.length} فئة</div>
        <div style="font-size:10.5px; color:var(--text-2);">${r} صنف مفهرس</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #10b981;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي وحدات المخزون</div>
        <div style="font-size:20px; font-weight:900; color:#10b981; font-family:monospace; margin:4px 0;">${z(u)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">كافة المستودعات</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #6366f1;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">قيمة المخزون (سعر البيع)</div>
        <div style="font-size:20px; font-weight:900; color:#6366f1; font-family:monospace; margin:4px 0;">${E(p)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">القيمة السوقية التقديرية</div>
      </div>
      <div class="card" style="padding:14px; text-align:center; border-top:3px solid #f59e0b;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">قيمة المخزون (سعر التكلفة)</div>
        <div style="font-size:20px; font-weight:900; color:#f59e0b; font-family:monospace; margin:4px 0;">${E(w)}</div>
        <div style="font-size:10.5px; color:var(--text-2);">رأس المال المخزني الفعلي</div>
      </div>
    `);let f=[...h];if(v&&(f=f.filter(t=>t.name&&t.name.toLowerCase().includes(v)||t.code&&t.code.toLowerCase().includes(v)||t.desc&&t.desc.toLowerCase().includes(v)||t.description&&t.description.toLowerCase().includes(v))),f.sort((t,s)=>{const c=n[t.id]?.count||n[t.code]?.count||0,m=n[s.id]?.count||n[s.code]?.count||0;return c!==m?m-c:(t.name||"").localeCompare(s.name||"","ar")}),f.length===0){e.innerHTML=`
      <div style="grid-column:1/-1; text-align:center; padding:48px; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border);">
        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
        <h3 style="margin:0 0 6px 0; font-size:16px;">لا توجد فئات مطابقة للبحث "${v}"</h3>
        <p style="color:var(--text-2); font-size:12px; margin:0 0 16px 0;">تأكد من كتابة الكلمة بشكل صحيح أو أضف فئة جديدة</p>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('cat-search-input').value=''; onCategorySearch('');">عرض كل الفئات</button>
      </div>
    `;return}e.innerHTML=f.map(t=>{const s=n[t.id]||n[t.code]||{count:0,totalQty:0,totalValue:0,totalCost:0,units:{}};let c="وحدة";if(s.units&&Object.keys(s.units).length>0){const g=Object.entries(s.units).sort((b,U)=>U[1]-b[1]);g[0]&&g[0][1]>0&&(c=L(g[0][0]))}else if(s.count>0){const g=o.find(b=>b.category===t.id||b.categoryId===t.id||b.category===t.code);g&&(c=L(g.unit))}const m=t.velocity||"medium",x=m==="fast"?"⚡ سريعة الدوران":m==="slow"?"🐢 بطيئة / متخصصة":"⚖️ متوسطة الدوران",C=m==="fast"?"cat-badge-fast":m==="slow"?"cat-badge-slow":"cat-badge-medium";return`
      <div class="card clickable-cat-card" onclick="goToCategoryProducts('${t.id||t.code}')" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between; min-height:220px; border-radius:12px;">
        <div>
          <div class="flex items-center justify-between mb-10">
            <div class="flex items-center gap-12">
              <div style="width:46px; height:46px; background:var(--indigo-glow, rgba(99,102,241,0.12)); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">
                ${t.icon||"📦"}
              </div>
              <div>
                <h3 style="font-family:var(--font-heading); font-size:15px; color:var(--text-0); font-weight:800; margin:0 0 2px 0;">${t.name}</h3>
                <span class="mono text-indigo font-semibold" style="font-size:10.5px; opacity:0.85;">CODE: ${t.code||t.id||"CAT"}</span>
              </div>
            </div>
            
            <div class="cat-actions" style="display:flex; gap:4px; align-items:center;">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation(); editCategory('${t.id||t.code}')" title="تعديل الفئة" style="color:var(--text-2);">✏️</button>
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation(); deleteCategory('${t.id||t.code}','${t.name}')" title="حذف الفئة" style="color:var(--bad);">🗑️</button>
            </div>
          </div>

          <div style="display:flex; gap:6px; align-items:center; margin-bottom:10px;">
            <span style="font-size:10px; padding:2px 8px; border-radius:12px; font-weight:700;" class="${C}">${x}</span>
          </div>

          <p class="text-2" style="font-size:11.5px; line-height:1.45; margin:0 0 12px 0; min-height:34px; color:var(--text-2);">${t.description||t.desc||"تنظيم الأصناف والمنتجات التابعة لهذا القسم"}</p>
        </div>
        
        <div class="cat-stats" style="border-top:1px dashed var(--border-soft); padding-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; color:var(--text-2);">
          <div>
            <span class="dim">الأصناف:</span>
            <strong style="color:var(--brand); font-weight:800; font-size:12px;">${s.count} صنف</strong>
          </div>
          <div>
            <span class="dim">المخزون:</span>
            <strong style="color:var(--good); font-weight:800; font-size:12px;">${z(s.totalQty)} ${c}</strong>
          </div>
          <div style="grid-column:span 2; display:flex; justify-content:space-between; margin-top:2px;">
            <span class="dim">قيمة المخزون (بيع):</span>
            <strong style="color:var(--text-0); font-family:monospace; font-weight:700;">${E(s.totalValue)}</strong>
          </div>
          <div style="grid-column:span 2; display:flex; justify-content:space-between;">
            <span class="dim">قيمة التكلفة:</span>
            <strong style="color:var(--orange, #f59e0b); font-family:monospace; font-weight:700;">${E(s.totalCost)}</strong>
          </div>
        </div>
      </div>`}).join("")}async function _(){const e=document.getElementById("units-tbody");if(!e)return;const i=[{id:"u1",code:"PCS",nameAr:"قطعة",nameEn:"Piece",factor:1,notes:"الوحدة الأساسية الصغرى"},{id:"u2",code:"CTN",nameAr:"كرتون",nameEn:"Carton",factor:12,notes:"شد 12 قطعة أو عبوة"},{id:"u3",code:"BAG",nameAr:"كيس / شيكارة",nameEn:"Bag",factor:1,notes:"أكياس 5 كجم / 10 كجم / 40 كجم"},{id:"u4",code:"PKT",nameAr:"باكت / باق",nameEn:"Packet",factor:6,notes:"ربطة أو باكت فرعي"},{id:"u5",code:"PLT",nameAr:"باليت كامل",nameEn:"Pallet",factor:50,notes:"طبلية مخزنية كاملة"}];try{const o=await k(l.units(),[Q("code")]),d=o&&o.length>0?o:i;e.innerHTML=d.map(a=>`
      <tr>
        <td class="mono font-bold text-indigo" style="font-size:12px;">${a.code}</td>
        <td class="font-heading font-bold">${a.nameAr||a.name}</td>
        <td class="mono dim">${a.nameEn||"—"}</td>
        <td class="mono font-semibold text-good">${a.factor||1} قطعة</td>
        <td class="dim">${a.notes||"—"}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="deleteUnit('${a.id}','${a.nameAr||a.name}')" style="color:var(--bad);" title="حذف الوحدة">🗑️</button>
        </td>
      </tr>`).join("")}catch(o){e.innerHTML=`<tr><td colspan="6"><div class="alert bad">${o.message}</div></td></tr>`}}window.openCatModal=(e=null)=>{const i=document.getElementById("cat-edit-id"),o=document.getElementById("cat-name"),d=document.getElementById("cat-code"),a=document.getElementById("cat-icon"),n=document.getElementById("cat-desc"),r=document.getElementById("cat-velocity"),u=document.getElementById("cat-modal-title");document.getElementById("cat-error").classList.add("hidden"),e?(u.textContent="تعديل فئة الأصناف",i.value=e.id||"",o.value=e.name||"",d.value=e.code||"",a.value=e.icon||"📦",n.value=e.desc||e.description||"",r.value=e.velocity||"medium"):(u.textContent="إضافة فئة أصناف جديدة",i.value="",o.value="",d.value="",a.value="📦",n.value="",r.value="medium"),openModal("cat-modal")};window.editCategory=e=>{const i=h.find(o=>o.id===e||o.code===e);i&&window.openCatModal(i)};window.saveCategory=async()=>{const e=document.getElementById("cat-error");e.classList.add("hidden");const i=document.getElementById("cat-edit-id").value,o=document.getElementById("cat-name").value.trim(),d=document.getElementById("cat-code").value.trim(),a=document.getElementById("cat-icon").value.trim()||"📦",n=document.getElementById("cat-desc").value.trim(),r=document.getElementById("cat-velocity").value;if(!o||!d){e.textContent="اسم الفئة والكود مطلوبان",e.classList.remove("hidden");return}const u=document.getElementById("save-cat-btn");u.disabled=!0;try{const p={name:o,code:d,icon:a,desc:n,description:n,velocity:r,updatedAt:new Date};if(i)await T(M(l.categories(),i),p,{merge:!0}),window.showToast&&window.showToast("تم تحديث الفئة بنجاح","success");else{const w=d.toLowerCase().replace(/[^a-z0-9_]/g,"_");await T(M(l.categories(),w),{...p,createdAt:new Date},{merge:!0}),window.showToast&&window.showToast("تمت إضافة الفئة بنجاح","success")}y(l.categories().path),closeModal("cat-modal"),await I()}catch(p){e.textContent=p.message,e.classList.remove("hidden")}finally{u.disabled=!1}};window.deleteCategory=async(e,i)=>{if(typeof window.showConfirm=="function"){if(!await showConfirm(`هل أنت متأكد من حذف فئة "${i}"؟`,"تأكيد الحذف"))return}else if(!confirm(`هل أنت متأكد من حذف فئة "${i}"؟`))return;try{await P("categories",e),y(l.categories().path),window.showToast&&window.showToast("تم حذف الفئة بنجاح","success"),await I()}catch(o){window.showToast?window.showToast(o.message,"error"):alert(o.message)}};window.openUnitModal=()=>{document.getElementById("unit-edit-id").value="",document.getElementById("unit-code").value="",document.getElementById("unit-name-ar").value="",document.getElementById("unit-name-en").value="",document.getElementById("unit-factor").value="1",document.getElementById("unit-notes").value="",document.getElementById("unit-error").classList.add("hidden"),openModal("unit-modal")};window.saveUnit=async()=>{const e=document.getElementById("unit-error");e.classList.add("hidden");const i=document.getElementById("unit-code").value.trim(),o=document.getElementById("unit-name-ar").value.trim();if(!i||!o){e.textContent="الكود واسم الوحدة مطلوبان",e.classList.remove("hidden");return}const d=document.getElementById("save-unit-btn");d.disabled=!0;try{await j(l.units(),{code:i,nameAr:o,nameEn:document.getElementById("unit-name-en").value.trim(),factor:parseInt(document.getElementById("unit-factor").value)||1,notes:document.getElementById("unit-notes").value.trim()}),y(l.units().path),window.showToast&&window.showToast("تمت إضافة وحدة القياس بنجاح","success"),closeModal("unit-modal"),await _()}catch(a){e.textContent=a.message,e.classList.remove("hidden")}finally{d.disabled=!1}};window.deleteUnit=async(e,i)=>{if(typeof window.showConfirm=="function"){if(!await showConfirm(`هل أنت متأكد من حذف الوحدة "${i}"؟`,"تأكيد"))return}else if(!confirm(`هل أنت متأكد من حذف الوحدة "${i}"؟`))return;try{await P("units",e),y(l.units().path),window.showToast&&window.showToast("تم حذف الوحدة","success"),await _()}catch(o){window.showToast?window.showToast(o.message,"error"):alert(o.message)}};window.goToCategoryProducts=e=>{sessionStorage.setItem("filter_category_id",e),window.location.hash="#products"};export{G as forceReloadCategories,O as render};
