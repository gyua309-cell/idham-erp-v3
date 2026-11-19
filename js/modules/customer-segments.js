// ============================================================
// IDHAM ERP — شرائح وتصنيفات العملاء ومحرك العروض والواتساب
// Customer Segmentation, Tiered Promotions & WhatsApp Campaigns
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allCustomers = [];
let allInvoices = [];
let allPromotions = [];
let selectedSegment = "all";

const SEGMENTS = [
  { id: "vip_platinum", label: "🥇 شريحة البلاتيني (VIP)", desc: "كبار العملاء بأعلى مسحوبات شهرية وسداد ممتاز", color: "#8B5CF6", minSales: 15000 },
  { id: "gold", label: "🥈 الشريحة الذهبية", desc: "عملاء منتظمون بمسحوبات شهرية مرتفعة", color: "#F59E0B", minSales: 8000 },
  { id: "silver", label: "🥉 الشريحة الفضية", desc: "عملاء نشطون بمسحوبات متوسطة", color: "#3B82F6", minSales: 3000 },
  { id: "retail_regular", label: "🏪 شريحة التجزئة العادية", desc: "مطاعم وبقالات بمسحوبات اعتيادية ونقدية", color: "#10B981", minSales: 0 },
  { id: "at_risk", label: "⚠️ في دائرة الخطر (منقطع)", desc: "عملاء لم يسجلوا أي مسحوبات منذ أكثر من 30 يوماً", color: "#EF4444", minSales: 0 },
  { id: "new_client", label: "🌱 عملاء جدد", desc: "عملاء تم تسجيلهم حديثاً في آخر 30 يوماً", color: "#06B6D4", minSales: 0 }
];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="seg-search" class="input" placeholder="🔍 بحث عن عميل داخل الشريحة..." oninput="window.filterSegmentCustomers(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الشريحة</label>
        <select id="seg-select-filter" onchange="window.selectSegment(this.value)">
          <option value="all">كل الشرائح</option>
          ${SEGMENTS.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-primary" style="background:#25D366; border-color:#25D366;" onclick="window.openWhatsAppCampaignModal()">
          💬 إطلاق حملة واتساب للشرائح
        </button>
        <button class="btn btn-secondary" onclick="window.openPromotionsModal()">
          🎁 عروض وبونص الشرائح
        </button>
        <button class="btn btn-secondary" onclick="window.autoAnalyzeAndSegment()">⚡ تحليل وتقييم الشرائح التلقائي</button>
        <button class="btn btn-secondary" onclick="window.exportSegmentsExcel()">📊 تصدير Excel</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Segments Grid Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:20px;" id="seg-cards-grid"></div>

      <!-- Customers in Segment Table -->
      <div class="card">
        <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);" id="seg-table-title">👥 قائمة العملاء</h3>
          <span class="badge" id="seg-cust-count">0 عميل</span>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th style="text-align:left;">إجمالي مسحوبات الشهر</th>
                <th style="text-align:left;">الرصيد الحالي</th>
                <th style="text-align:center;">الشريحة الحالية</th>
                <th style="text-align:center;">تغيير الشريحة</th>
                <th style="text-align:center;">واتساب</th>
              </tr>
            </thead>
            <tbody id="seg-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحليل الشرائح...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- WhatsApp Campaign Modal -->
    <div class="modal-overlay" id="wa-campaign-modal">
      <div class="modal modal-lg" style="max-width:750px;">
        <div class="modal-header">
          <h3 class="modal-title">💬 إطلاق حملة رسائل واتساب للشريحة</h3>
          <button class="modal-close" onclick="closeModal('wa-campaign-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>الشريحة المستهدفة *</label>
              <select id="wa-camp-seg" class="input" onchange="window.updateWACampaignPreview()">
                ${SEGMENTS.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>نوع القالب *</label>
              <select id="wa-camp-template" class="input" onchange="window.onWACampTemplateChange()">
                <option value="promo">🎁 عرض ترويجي وخصم خاص</option>
                <option value="reorder">🔔 تذكير بتجديد الطلبية والنواقص</option>
                <option value="at_risk_recovery">❤️ عروض خاصة لاستعادة العملاء المنقطعين</option>
                <option value="debt_reminder">⚖️ تذكير بمطابقة الرصيد والسداد</option>
                <option value="custom">✏️ نص مخصص</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-12">
            <label>نص الرسالة (يمكن استخدام المتغيرات: {اسم_العميل}، {اسم_الشركة}) *</label>
            <textarea id="wa-camp-text" class="input" rows="4" oninput="window.updateWACampaignPreview()"></textarea>
          </div>

          <div style="font-weight:700; font-size:12.5px; color:var(--text-1); margin-bottom:8px;">
            👥 العملاء المستهدفون في هذه الحملة (<span id="wa-target-count">0</span> عميل):
          </div>
          <div class="table-container" style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>الجوال</th>
                  <th>المندوب</th>
                  <th style="width:100px; text-align:center;">إرسال</th>
                </tr>
              </thead>
              <tbody id="wa-targets-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('wa-campaign-modal')">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Tiered Promotions Modal -->
    <div class="modal-overlay" id="promotions-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title">🎁 عروض وبونص الشرائح (Promotion Rules)</h3>
          <button class="modal-close" onclick="closeModal('promotions-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="card mb-16" style="padding:16px; background:var(--bg-2); border:1px solid var(--border-soft);">
            <div style="font-weight:800; font-size:13px; color:var(--brand); margin-bottom:10px;">➕ إضافة عرض ترويجي جديد لشريحة:</div>
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label>الشريحة *</label>
                <select id="promo-seg" class="input">
                  ${SEGMENTS.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label>عنوان العرض *</label>
                <input type="text" id="promo-title" class="input" placeholder="مثال: خصم 3% إضافي" />
              </div>
              <div class="form-group">
                <label>نسبة الخصم %</label>
                <input type="number" id="promo-discount-pct" class="input mono" placeholder="3" min="0" max="50" step="0.5" />
              </div>
            </div>
            <div class="form-group mb-12">
              <label>تفاصيل ووصف البونص الترويجي</label>
              <input type="text" id="promo-desc" class="input" placeholder="مثال: احصل على كرتون شطة مجاناً عند شراء 10 كراتين زيت..." />
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.savePromotionRule()">💾 حفظ وتفعيل العرض</button>
          </div>

          <div style="font-weight:800; font-size:13px; color:var(--text-0); margin-bottom:8px;">العروض النشطة المربوطة بالشرائح:</div>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الشريحة</th>
                  <th>العرض</th>
                  <th>الخصم %</th>
                  <th>التفاصيل</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="promo-rules-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('promotions-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [custs, invs, promos] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.salesInvoices()).catch(() => []),
      getAll(COLS.segmentPromotions ? COLS.segmentPromotions() : "segmentPromotions").catch(() => [])
    ]);

    allCustomers = custs;
    allInvoices = invs;
    allPromotions = promos;

    renderSegmentCards();
    renderCustomersTable();
  } catch (e) {
    console.warn("Failed to load segments data:", e);
  }
}

function calculateCustomerMonthlySales(custId) {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().slice(0, 10);

  const custInvs = allInvoices.filter(i => (i.customerId === custId) && (i.date || "") >= monthAgoStr && i.status !== "cancelled");
  return custInvs.reduce((s, i) => s + parseFloat(i.totalWithVat || i.total || 0), 0);
}

function renderSegmentCards() {
  const grid = document.getElementById("seg-cards-grid");
  if (!grid) return;

  grid.innerHTML = SEGMENTS.map(s => {
    const count = allCustomers.filter(c => (c.segment || "retail_regular") === s.id).length;
    const isSelected = selectedSegment === s.id;
    return `
      <div class="card" onclick="window.selectSegment('${s.id}')" style="padding:14px; border:1.5px solid ${isSelected ? s.color : 'var(--border-soft)'}; background:${isSelected ? s.color + '10' : 'var(--bg-card)'}; border-radius:12px; cursor:pointer; transition:all 0.2s;">
        <div style="font-weight:800; font-size:13px; color:${s.color}; margin-bottom:4px;">${s.label}</div>
        <div style="font-size:11px; color:var(--text-2); height:32px; overflow:hidden; line-height:1.4;">${s.desc}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-soft);">
          <span style="font-size:11px; color:var(--text-3);">العملاء:</span>
          <span class="mono font-bold" style="font-size:16px; color:var(--text-0);">${count}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderCustomersTable(list = allCustomers) {
  const tbody = document.getElementById("seg-tbody");
  const countEl = document.getElementById("seg-cust-count");
  const titleEl = document.getElementById("seg-table-title");
  if (!tbody) return;

  let filtered = list;
  if (selectedSegment !== "all") {
    filtered = list.filter(c => (c.segment || "retail_regular") === selectedSegment);
    const segObj = SEGMENTS.find(s => s.id === selectedSegment);
    if (titleEl) titleEl.textContent = `👥 عملاء ${segObj?.label || "الشريحة"}`;
  } else {
    if (titleEl) titleEl.textContent = `👥 كل العملاء والشرائح`;
  }

  if (countEl) countEl.textContent = `${filtered.length} عميل`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا يوجد عملاء في هذه الشريحة</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const curSeg = c.segment || "retail_regular";
    const segObj = SEGMENTS.find(s => s.id === curSeg) || SEGMENTS[3];
    const monthlySales = calculateCustomerMonthlySales(c.id);

    return `
      <tr>
        <td class="font-bold">${c.name}</td>
        <td class="mono dim">${c.phone || "—"}</td>
        <td>${c.zone || "—"}</td>
        <td>${c.repName || "—"}</td>
        <td class="mono font-bold" style="text-align:left; color:var(--brand);">${formatCurrency(monthlySales)}</td>
        <td class="mono font-bold" style="text-align:left; color:${(c.balance||0)>0?'var(--bad)':'var(--good)'};">${formatCurrency(c.balance || 0)}</td>
        <td style="text-align:center;">
          <span class="badge" style="background:${segObj.color}18; color:${segObj.color}; font-weight:800; font-size:11px;">
            ${segObj.label}
          </span>
        </td>
        <td style="text-align:center;">
          <select class="input" style="height:30px; font-size:11.5px; padding:2px 6px; width:130px;" onchange="window.changeCustomerSegment('${c.id}', this.value)">
            ${SEGMENTS.map(s => `<option value="${s.id}" ${s.id === curSeg ? "selected" : ""}>${s.label}</option>`).join("")}
          </select>
        </td>
        <td style="text-align:center;">
          ${c.phone ? `
            <button class="btn btn-icon sm" style="color:#25D366;" onclick="window.quickSegmentWhatsApp('${c.phone}', '${c.name.replace(/'/g, "\\'")}', '${segObj.label}')" title="محادثة واتساب">💬</button>
          ` : '—'}
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.selectSegment = (segId) => {
    selectedSegment = segId;
    const sel = document.getElementById("seg-select-filter");
    if (sel) sel.value = segId;
    renderSegmentCards();
    renderCustomersTable();
  };

  window.filterSegmentCustomers = (q) => {
    q = (q || "").trim().toLowerCase();
    const filtered = allCustomers.filter(c => 
      !q || (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.zone || "").toLowerCase().includes(q)
    );
    renderCustomersTable(filtered);
  };

  window.changeCustomerSegment = async (custId, newSeg) => {
    try {
      await update("customers", custId, { segment: newSeg });
      const c = allCustomers.find(x => x.id === custId);
      if (c) c.segment = newSeg;
      renderSegmentCards();
      renderCustomersTable();
    } catch (e) {
      alert("فشل تحديث الشريحة: " + e.message);
    }
  };

  window.quickSegmentWhatsApp = (phone, name, segLabel) => {
    const clean = phone.replace(/[^0-9]/g, "");
    const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
    const co = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";
    const msg = `مرحباً ${name}، عميلنا المميز في (${segLabel}) لدى ${co} 🌿\n\nنود إفادتكم بتوفر عروض وأسعار خاصة لطلبياتكم القادمة. يسعدنا خدمتكم دائماً!`;
    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.openWhatsAppCampaignModal = () => {
    document.getElementById("wa-camp-seg").value = selectedSegment !== "all" ? selectedSegment : "vip_platinum";
    window.onWACampTemplateChange();
    openModal("wa-campaign-modal");
  };

  window.onWACampTemplateChange = () => {
    const t = document.getElementById("wa-camp-template").value;
    const co = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";
    let text = "";

    if (t === "promo") {
      text = `مرحباً {اسم_العميل}، يسعدنا في ${co} أن نقدم لكم عروضاً وخصومات حصرية على قائمة المواد الغذائية والتغليف لهذا الأسبوع! تواصل معنا لتأكيد طلبيتك بأفضل الأسعار.`;
    } else if (t === "reorder") {
      text = `مرحباً {اسم_العميل}، نود الاطمئنان على احتياجاتكم من المواد الغذائية والتوريدات الدورية لدى ${co}. هل ترغبون في جدولة زيارة المندوب اليوم؟`;
    } else if (t === "at_risk_recovery") {
      text = `مرحباً {اسم_العميل}، افتقدنا تعاملكم معنا في ${co} ❤️ يسعدنا تقديم خصم خاص واستثنائي بنسبة 5% على أول طلبية قادمة لتشريفنا بخدمتكم مجدداً!`;
    } else if (t === "debt_reminder") {
      text = `مرحباً {اسم_العميل}، نرجو التكرم بمراجعة ملخص كشف الحساب المسجل لدى ${co} لجدولة السداد ومطابقة الرصيد. شاكرين حسن تعاونكم معنا.`;
    }

    document.getElementById("wa-camp-text").value = text;
    window.updateWACampaignPreview();
  };

  window.updateWACampaignPreview = () => {
    const segId = document.getElementById("wa-camp-seg").value;
    const text = document.getElementById("wa-camp-text").value;
    const targetCusts = allCustomers.filter(c => (c.segment || "retail_regular") === segId);
    
    document.getElementById("wa-target-count").textContent = targetCusts.length;

    const tbody = document.getElementById("wa-targets-tbody");
    if (!tbody) return;

    if (!targetCusts.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:16px; color:var(--text-2);">لا يوجد عملاء في هذه الشريحة</td></tr>`;
      return;
    }

    tbody.innerHTML = targetCusts.map(c => {
      const custMsg = text.replace(/\{اسم_العميل\}/g, c.name).replace(/\{اسم_الشركة\}/g, window.ERP_COMPANY?.name || "مؤسسة إدهام");
      const clean = (c.phone || "").replace(/[^0-9]/g, "");
      const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
      const url = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(custMsg)}`;

      return `
        <tr>
          <td class="font-bold">${c.name}</td>
          <td class="mono dim">${c.phone || "—"}</td>
          <td>${c.repName || "—"}</td>
          <td style="text-align:center;">
            ${c.phone ? `
              <a href="${url}" target="_blank" class="btn btn-sm" style="background:#25D366; color:#fff; text-decoration:none; padding:3px 10px; font-size:11px; border-radius:6px; display:inline-block;">
                💬 إرسال
              </a>
            ` : `<span style="font-size:11px; color:var(--text-3);">بلا هاتف</span>`}
          </td>
        </tr>
      `;
    }).join("");
  };

  window.openPromotionsModal = () => {
    renderPromotionsTable();
    openModal("promotions-modal");
  };

  window.savePromotionRule = async () => {
    const seg = document.getElementById("promo-seg").value;
    const title = document.getElementById("promo-title").value.trim();
    const discountPct = parseFloat(document.getElementById("promo-discount-pct").value) || 0;
    const desc = document.getElementById("promo-desc").value.trim();

    if (!title) { alert("يرجى كتابة عنوان العرض"); return; }

    const docData = {
      segmentId: seg,
      segmentName: SEGMENTS.find(s => s.id === seg)?.label || seg,
      title: title,
      discountPct: discountPct,
      description: desc,
      status: "active"
    };

    try {
      await create("segmentPromotions", docData);
      allPromotions = await getAll(COLS.segmentPromotions ? COLS.segmentPromotions() : "segmentPromotions").catch(() => []);
      document.getElementById("promo-title").value = "";
      document.getElementById("promo-discount-pct").value = "";
      document.getElementById("promo-desc").value = "";
      renderPromotionsTable();
    } catch (e) {
      alert("فشل الحفظ: " + e.message);
    }
  };

  window.deletePromotionRule = async (id) => {
    if (!confirm("هل تريد حذف هذا العرض الترويجي؟")) return;
    try {
      await remove("segmentPromotions", id);
      allPromotions = allPromotions.filter(p => p.id !== id);
      renderPromotionsTable();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  function renderPromotionsTable() {
    const tbody = document.getElementById("promo-rules-tbody");
    if (!tbody) return;

    if (!allPromotions.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد عروض بونص مسجلة بعد</td></tr>`;
      return;
    }

    tbody.innerHTML = allPromotions.map(p => `
      <tr>
        <td class="font-bold">${p.segmentName || p.segmentId}</td>
        <td style="color:var(--brand); font-weight:700;">${p.title}</td>
        <td class="mono font-bold" style="color:var(--good);">${p.discountPct}%</td>
        <td style="font-size:11.5px; color:var(--text-2);">${p.description || "—"}</td>
        <td>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deletePromotionRule('${p.id}')">✕</button>
        </td>
      </tr>
    `).join("");
  }

  window.autoAnalyzeAndSegment = async () => {
    if (!confirm("هل تريد تشغيل الخوارزمية الذكية لتصنيف العملاء آلياً حسب حجم المسحوبات في آخر 30 يوماً؟")) return;

    let updated = 0;
    const now = new Date();

    for (const c of allCustomers) {
      const sales = calculateCustomerMonthlySales(c.id);
      let targetSeg = "retail_regular";

      if (sales >= 15000) targetSeg = "vip_platinum";
      else if (sales >= 8000) targetSeg = "gold";
      else if (sales >= 3000) targetSeg = "silver";
      else if (sales === 0 && (c.createdAt ? (now - new Date(c.createdAt.seconds * 1000)) > 30 * 86400000 : true)) {
        targetSeg = "at_risk";
      }

      if (c.segment !== targetSeg) {
        await update("customers", c.id, { segment: targetSeg });
        c.segment = targetSeg;
        updated++;
      }
    }

    alert(`✅ تم اكتمال التحليل وتحديث شرائح ${updated} عميل تلقائياً!`);
    renderSegmentCards();
    renderCustomersTable();
  };

  window.exportSegmentsExcel = () => {
    const data = allCustomers.map(c => ({
      "اسم العميل": c.name,
      "الهاتف": c.phone,
      "المنطقة": c.zone,
      "المندوب": c.repName,
      "الشريحة": SEGMENTS.find(s => s.id === (c.segment || "retail_regular"))?.label || c.segment,
      "الرصيد الحالي": c.balance || 0,
      "مسحوبات الشهر": calculateCustomerMonthlySales(c.id)
    }));
    exportToExcel(data, "شرائح_العملاء");
  };
}
