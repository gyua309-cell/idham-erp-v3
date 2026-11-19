// ============================================================
// IDHAM ERP — متابعة العملاء ومحرك التنبؤ الذكي بالطلبيات CRM
// Customer CRM, Sales Pipeline & AI Predictive Replenishment Module
// ============================================================
import { COLS, getAll, create, update, remove, query, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate, debounce } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allLeads = [];
let allReps = [];
let allCustomers = [];
let allSalesInvoices = [];
let viewMode = "kanban"; // 'kanban' | 'table' | 'ai-predict'
let predictedOrders = [];

const STAGES = [
  { id: "new", label: "🎯 عميل مستهدف", color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
  { id: "contacted", label: "📞 تم التواصل / زيارة", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  { id: "quoted", label: "📄 أُرسل عرض سعر", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  { id: "negotiation", label: "🤝 مرحلة التفاوض", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
  { id: "won", label: "✅ تم التعاقد والتعميد", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { id: "lost", label: "❌ غير مهتم / ملغي", color: "#EF4444", bg: "rgba(239,68,68,0.08)" }
];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="crm-search" class="input" placeholder="🔍 بحث في العملاء والمتابعات..." oninput="window.filterLeads(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="crm-rep-filter" onchange="window.filterLeads()">
          <option value="">كل المناديب</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النشاط</label>
        <select id="crm-type-filter" onchange="window.filterLeads()">
          <option value="">كل الأنشطة</option>
          <option value="مطعم">مطعم</option>
          <option value="بقالة">بقالة / سوبرماركت</option>
          <option value="كافيه">كافيه / مقهى</option>
          <option value="إعاشة">شركة إعاشة وتوريد</option>
          <option value="فندق">فندق / ضيافة</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-secondary btn-sm" id="crm-btn-kanban" onclick="window.setCRMView('kanban')">📊 كانبان</button>
        <button class="btn btn-secondary btn-sm" id="crm-btn-table" onclick="window.setCRMView('table')">☰ جدول</button>
        <button class="btn btn-primary btn-sm" id="crm-btn-ai" onclick="window.setCRMView('ai-predict')" style="background:linear-gradient(135deg, #6366F1, #8B5CF6); border:none;">
          🔮 التنبؤ الذكي بالطلبيات
        </button>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportCRMExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openLeadModal()">+ إضافة فرصة بيعية / عميل</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الفرص البيعية</div>
          <div class="mono" id="crm-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد التفاوض والعروض</div>
          <div class="mono" id="crm-kpi-pipeline" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">🔔 طلبات متوقعة حان موعدها</div>
          <div class="mono" id="crm-kpi-due-orders" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">المبيعات الشهرية المتوقعة</div>
          <div class="mono" id="crm-kpi-val" style="font-size:18px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Container for Kanban / Table / AI Predictions -->
      <div id="crm-view-container"></div>
    </div>

    <!-- Lead Modal -->
    <div class="modal-overlay" id="lead-modal">
      <div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title" id="lead-modal-title">➕ إضافة فرصة بيعية جديدة</h3>
          <button class="modal-close" onclick="closeModal('lead-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="lead-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>اسم المنشأة / العميل *</label>
              <input type="text" id="lead-name" class="input" placeholder="مثال: مطاعم بيت الشواية" />
            </div>
            <div class="form-group">
              <label>الشخص المسؤول / جهة الاتصال</label>
              <input type="text" id="lead-contact" class="input" placeholder="أ/ محمد المدير التنفيذي" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>رقم الجوال *</label>
              <input type="text" id="lead-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>نوع النشاط</label>
              <select id="lead-type" class="input">
                <option value="مطعم">مطعم</option>
                <option value="بقالة">بقالة / سوبرماركت</option>
                <option value="كافيه">كافيه / مقهى</option>
                <option value="إعاشة">شركة إعاشة وتوريد</option>
                <option value="فندق">فندق / ضيافة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div class="form-group">
              <label>المنطقة / الحي</label>
              <input type="text" id="lead-zone" class="input" placeholder="ينبع الصناعية" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المندوب المسؤول</label>
              <select id="lead-rep" class="input">
                <option value="">-- اختر المندوب --</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبيعات المتوقعة شهرياً</label>
              <input type="number" id="lead-val" class="input mono" placeholder="5000" min="0" />
            </div>
            <div class="form-group">
              <label>مرحلة المتابعة</label>
              <select id="lead-stage" class="input">
                ${STAGES.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>موعد المتابعة القادم</label>
              <input type="date" id="lead-next-date" class="input" />
            </div>
            <div class="form-group">
              <label>أهم الأصناف المطلوبة</label>
              <input type="text" id="lead-items" class="input" placeholder="أرز، زيت، تغليف، بهارات..." />
            </div>
          </div>

          <div class="form-group">
            <label>ملاحظات وسجل المحادثة</label>
            <textarea id="lead-notes" class="input" rows="3" placeholder="تفاصيل الزيارة أو متطلبات العميل..."></textarea>
          </div>

          <div id="lead-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('lead-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveLead()">💾 حفظ البيانات</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [leads, reps, custs, invoices] = await Promise.all([
      getAll(COLS.customerLeads ? COLS.customerLeads() : "customerLeads").catch(() => []),
      getAll(COLS.salesReps ? COLS.salesReps() : "salesReps", [orderBy("name")]).catch(() => []),
      getAll(COLS.customers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.salesInvoices(), [orderBy("date", "desc")]).catch(() => [])
    ]);

    allLeads = leads;
    allReps = reps;
    allCustomers = custs;
    allSalesInvoices = invoices;

    calculateAIPredictions();
    populateRepsFilter();
    updateKPIs();
    renderCurrentView();
  } catch (e) {
    console.warn("Failed to load CRM data:", e);
  }
}

function calculateAIPredictions() {
  const today = new Date();
  predictedOrders = [];

  allCustomers.forEach(c => {
    const custInvs = allSalesInvoices.filter(i => (i.customerId === c.id || i.customerName === c.name) && i.status !== "cancelled");
    if (custInvs.length < 2) return; // Need at least 2 invoices to compute pattern

    // Sort oldest to newest
    const sorted = [...custInvs].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    // Calculate intervals
    let totalIntervalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1].date);
      const d2 = new Date(sorted[i].date);
      const diff = Math.max(1, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
      totalIntervalDays += diff;
    }

    const avgInterval = Math.max(3, Math.round(totalIntervalDays / (sorted.length - 1)));
    const lastInv = sorted[sorted.length - 1];
    const lastDate = new Date(lastInv.date);
    const daysSinceLast = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const nextExpectedDate = new Date(lastDate);
    nextExpectedDate.setDate(nextExpectedDate.getDate() + avgInterval);

    // Compute top purchased items for this customer
    const itemMap = {};
    custInvs.forEach(inv => {
      (inv.lines || inv.items || []).forEach(it => {
        const k = it.name || it.productName;
        if (!k) return;
        if (!itemMap[k]) itemMap[k] = { name: k, qty: 0, count: 0, unitPrice: it.unitPrice || it.price || 0 };
        itemMap[k].qty += parseFloat(it.qty || it.quantity || 1);
        itemMap[k].count += 1;
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 3);
    const avgInvoiceVal = custInvs.reduce((s, inv) => s + parseFloat(inv.totalWithVat || inv.total || 0), 0) / custInvs.length;

    let urgency = "normal"; // 'due_today' | 'upcoming' | 'normal' | 'overdue'
    if (daysSinceLast >= avgInterval) urgency = "due_today";
    else if (daysSinceLast >= avgInterval - 2) urgency = "upcoming";

    predictedOrders.push({
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone || "",
      zone: c.zone || "—",
      repName: c.repName || "—",
      avgIntervalDays: avgInterval,
      daysSinceLastOrder: daysSinceLast,
      lastOrderDate: lastInv.date,
      nextExpectedDateStr: nextExpectedDate.toISOString().slice(0, 10),
      avgInvoiceVal: avgInvoiceVal,
      topItems: topItems,
      urgency: urgency
    });
  });

  // Sort: due today first, then upcoming
  predictedOrders.sort((a, b) => {
    const score = (u) => (u === "due_today" ? 3 : u === "upcoming" ? 2 : 1);
    return score(b.urgency) - score(a.urgency) || b.daysSinceLastOrder - a.daysSinceLastOrder;
  });
}

function updateKPIs() {
  const won = allLeads.filter(l => l.stage === "won");
  const pipeline = allLeads.filter(l => l.stage === "quoted" || l.stage === "negotiation" || l.stage === "contacted");
  const totalVal = allLeads.reduce((s, l) => s + (parseFloat(l.expectedMonthlyValue) || 0), 0);
  const dueOrdersCount = predictedOrders.filter(p => p.urgency === "due_today").length;

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("crm-kpi-total", allLeads.length);
  setT("crm-kpi-pipeline", pipeline.length);
  setT("crm-kpi-due-orders", dueOrdersCount);
  setT("crm-kpi-val", formatCurrency(totalVal));
}

function populateRepsFilter() {
  const f = document.getElementById("crm-rep-filter");
  const m = document.getElementById("lead-rep");
  const opt = allReps.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل المناديب</option>` + opt;
  if (m) m.innerHTML = `<option value="">-- اختر المندوب --</option>` + opt;
}

function renderCurrentView(list = allLeads) {
  const container = document.getElementById("crm-view-container");
  if (!container) return;

  if (viewMode === "kanban") {
    renderKanban(container, list);
  } else if (viewMode === "table") {
    renderTable(container, list);
  } else if (viewMode === "ai-predict") {
    renderAIPredictions(container);
  }
}

function renderAIPredictions(container) {
  const dueCount = predictedOrders.filter(p => p.urgency === "due_today").length;

  container.innerHTML = `
    <div style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.03)); border:1.5px solid rgba(99,102,241,0.25); border-radius:14px; padding:16px 20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--brand); display:flex; align-items:center; gap:8px;">
            <span>🔮 محرك التنبؤ الذكي بالطلبيات (AI Replenishment Engine)</span>
          </h3>
          <p style="margin:4px 0 0; font-size:12px; color:var(--text-2);">
            يقوم النظام بتحليل دورات الشراء ومعدلات استهلاك كل عميل، وينبهك تلقائياً بمواعيد إعادة الطلب قبل نفاذ المخزون لديهم.
          </p>
        </div>
        <span class="badge" style="background:#6366F1; color:#fff; font-weight:800; font-size:12px; padding:6px 14px; border-radius:20px;">
          🔔 ${dueCount} عميل حان موعد طلبهم اليوم
        </span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:14px;">
      ${predictedOrders.map(p => {
        const isDue = p.urgency === "due_today";
        const isUpcoming = p.urgency === "upcoming";
        const badgeColor = isDue ? "#EF4444" : isUpcoming ? "#F59E0B" : "#10B981";
        const badgeText = isDue ? "🔥 حان موعد الطلب اليوم!" : isUpcoming ? "⏳ متوقع خلال يومين" : "🟢 تم التوريد مؤخراً";

        return `
          <div class="card" style="padding:16px; border:1.5px solid ${isDue ? 'rgba(239,68,68,0.3)' : 'var(--border-soft)'}; background:${isDue ? 'rgba(239,68,68,0.02)' : 'var(--bg-card)'}; border-radius:14px; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
              <div>
                <div style="font-weight:800; font-size:15px; color:var(--text-0);">${p.customerName}</div>
                <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">📍 ${p.zone} • 🚗 ${p.repName}</div>
              </div>
              <span class="badge" style="background:${badgeColor}18; color:${badgeColor}; font-weight:800; font-size:10.5px;">
                ${badgeText}
              </span>
            </div>

            <!-- Pattern Metrics -->
            <div style="background:var(--bg-2); border-radius:8px; padding:10px 12px; margin:8px 0; font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div><span style="color:var(--text-3);">دورة الشراء:</span> <b>كل ${p.avgIntervalDays} أيام</b></div>
              <div><span style="color:var(--text-3);">آخر طلب:</span> <b class="mono">${p.daysSinceLastOrder} يوم مضت</b></div>
              <div><span style="color:var(--text-3);">تاريخ آخر فاتورة:</span> <span class="mono">${p.lastOrderDate}</span></div>
              <div><span style="color:var(--text-3);">متوسط الفاتورة:</span> <b class="mono text-good">${formatCurrency(p.avgInvoiceVal)}</b></div>
            </div>

            <!-- Top Recommended Products -->
            <div style="font-size:11.5px; margin:6px 0 12px;">
              <div style="font-weight:700; color:var(--text-1); margin-bottom:4px;">📦 الأصناف الأكثر استهلاكاً المتوقعة:</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                ${p.topItems.map(it => `
                  <span style="background:rgba(99,102,241,0.08); color:var(--brand); border-radius:6px; padding:2px 8px; font-size:11px; font-weight:600;">
                    ${it.name}
                  </span>
                `).join("")}
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div style="display:flex; gap:8px; margin-top:auto; padding-top:10px; border-top:1px dashed var(--border-soft);">
              ${p.customerPhone ? `
                <button class="btn btn-secondary btn-sm" style="flex:1; font-size:11.5px;" onclick="window.sendReorderWhatsApp('${p.customerPhone}', '${p.customerName.replace(/'/g, "\\'")}', '${p.topItems.map(x=>x.name).join('، ')}')">
                  💬 تذكير واتساب
                </button>
              ` : ""}
              <button class="btn btn-primary btn-sm" style="flex:1; font-size:11.5px;" onclick="window.createProposedInvoice('${p.customerId}')">
                ⚡ إنشاء فاتورة مقترحة
              </button>
            </div>
          </div>
        `;
      }).join("")}
      ${!predictedOrders.length ? `<div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--text-2);">يلزم توفر فواتير مبيعات سابقة لحساب دورة التنبؤ بالطلب</div>` : ""}
    </div>
  `;
}

function renderKanban(container, list) {
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; overflow-x:auto; padding-bottom:16px;">
      ${STAGES.map((st, sIdx) => {
        const stageLeads = list.filter(l => (l.stage || "new") === st.id);
        const stageVal = stageLeads.reduce((s, l) => s + (parseFloat(l.expectedMonthlyValue) || 0), 0);
        return `
          <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; padding:12px; display:flex; flex-direction:column; min-height:450px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:2px solid ${st.color}; margin-bottom:12px;">
              <div style="font-weight:800; font-size:13px; color:var(--text-0);">${st.label}</div>
              <span class="badge" style="background:${st.bg}; color:${st.color}; font-weight:800;">${stageLeads.length}</span>
            </div>
            
            <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:600px;">
              ${stageLeads.map(l => `
                <div class="card" style="padding:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); cursor:pointer; transition:transform 0.2s;" onclick="window.editLead('${l.id}')">
                  <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
                    <div style="font-weight:800; font-size:13px; color:var(--text-0);">${l.name}</div>
                    <span class="badge neutral" style="font-size:9.5px;">${l.activityType || "مطعم"}</span>
                  </div>
                  <div style="font-size:11.5px; color:var(--text-2); margin-bottom:6px;">👤 ${l.contactPerson || l.phone || "—"}</div>
                  
                  ${l.expectedMonthlyValue ? `
                    <div class="mono" style="font-size:12px; font-weight:700; color:var(--brand); margin-bottom:6px;">
                      💵 ${formatCurrency(l.expectedMonthlyValue)} / شهر
                    </div>
                  ` : ""}

                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-3); border-top:1px dashed var(--border-soft); padding-top:6px; margin-top:6px;">
                    <span>📍 ${l.zone || "—"}</span>
                    <span>🚗 ${l.repName || "—"}</span>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div style="display:flex; gap:6px; margin-top:10px;" onclick="event.stopPropagation()">
                    ${l.phone ? `
                      <button class="btn btn-sm btn-secondary" style="flex:1; font-size:11px; padding:4px;" onclick="window.chatLeadWhatsApp('${l.phone}', '${l.name.replace(/'/g, "\\'")}')" title="محادثة واتساب">
                        💬 واتساب
                      </button>
                    ` : ""}
                    ${sIdx < STAGES.length - 2 ? `
                      <button class="btn btn-sm btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="window.advanceLeadStage('${l.id}', '${STAGES[sIdx + 1].id}')" title="تقديم للمرحلة التالية">
                        ➔
                      </button>
                    ` : ""}
                  </div>

                  ${l.stage !== "won" ? `
                    <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:8px; font-size:11px; background:rgba(16,185,129,0.08); color:#10B981; border-color:rgba(16,185,129,0.2);" onclick="event.stopPropagation(); window.convertLeadToCustomer('${l.id}')">
                      ✨ تحويل لعميل دائم
                    </button>
                  ` : ""}
                </div>
              `).join("")}
              ${!stageLeads.length ? `<div style="text-align:center; padding:32px 8px; color:var(--text-3); font-size:12px;">لا يوجد عملاء في هذه المرحلة</div>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderTable(container, list) {
  container.innerHTML = `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>اسم العميل / المنشأة</th>
              <th>المسؤول</th>
              <th>الهاتف</th>
              <th>النشاط</th>
              <th>المنطقة</th>
              <th>المندوب</th>
              <th style="text-align:left;">المتوقع شهرياً</th>
              <th style="text-align:center;">المرحلة</th>
              <th style="text-align:center;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(l => {
              const st = STAGES.find(s => s.id === l.stage) || STAGES[0];
              return `
                <tr>
                  <td class="font-bold">${l.name}</td>
                  <td>${l.contactPerson || "—"}</td>
                  <td class="mono dim">${l.phone || "—"}</td>
                  <td><span class="badge neutral">${l.activityType || "مطعم"}</span></td>
                  <td>${l.zone || "—"}</td>
                  <td>${l.repName || "—"}</td>
                  <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.expectedMonthlyValue || 0)}</td>
                  <td style="text-align:center;"><span class="badge" style="background:${st.bg}; color:${st.color}; font-weight:700;">${st.label}</span></td>
                  <td>
                    <div class="row-actions" style="justify-content:center;">
                      ${l.phone ? `<button class="btn btn-icon sm" style="color:#25D366;" onclick="window.chatLeadWhatsApp('${l.phone}', '${l.name.replace(/'/g, "\\'")}')" title="محادثة واتساب">💬</button>` : ""}
                      ${l.stage !== "won" ? `<button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertLeadToCustomer('${l.id}')" title="تحويل لعميل دائم">✨</button>` : ""}
                      <button class="btn btn-icon sm btn-ghost" onclick="window.editLead('${l.id}')" title="تعديل">✏️</button>
                      <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteLead('${l.id}')" title="حذف">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
            ${!list.length ? `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد فرص بيعية مسجلة</td></tr>` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setupGlobalFunctions() {
  window.setCRMView = (mode) => {
    viewMode = mode;
    document.getElementById("crm-btn-kanban")?.classList.toggle("btn-primary", mode === "kanban");
    document.getElementById("crm-btn-kanban")?.classList.toggle("btn-secondary", mode !== "kanban");
    document.getElementById("crm-btn-table")?.classList.toggle("btn-primary", mode === "table");
    document.getElementById("crm-btn-table")?.classList.toggle("btn-secondary", mode !== "table");
    document.getElementById("crm-btn-ai")?.classList.toggle("btn-primary", mode === "ai-predict");
    document.getElementById("crm-btn-ai")?.classList.toggle("btn-secondary", mode !== "ai-predict");
    renderCurrentView();
  };

  window.filterLeads = () => {
    const q = (document.getElementById("crm-search")?.value || "").trim().toLowerCase();
    const rep = document.getElementById("crm-rep-filter")?.value || "";
    const type = document.getElementById("crm-type-filter")?.value || "";

    const filtered = allLeads.filter(l => {
      const mQ = !q || (l.name || "").toLowerCase().includes(q) || (l.phone || "").includes(q) || (l.contactPerson || "").toLowerCase().includes(q);
      const mR = !rep || l.repId === rep;
      const mT = !type || l.activityType === type;
      return mQ && mR && mT;
    });

    renderCurrentView(filtered);
  };

  window.chatLeadWhatsApp = (phone, name) => {
    const clean = phone.replace(/[^0-9]/g, "");
    const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
    const msg = `مرحباً ${name}، نتشرف بالتواصل معكم من مؤسسة إدهام للمواد الغذائية بخصوص توريد احتياجاتكم...`;
    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.sendReorderWhatsApp = (phone, name, itemsStr) => {
    const clean = phone.replace(/[^0-9]/g, "");
    const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
    const co = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";
    const msg = `مرحباً ${name}، حياكم الله من ${co} 🌿\n\nنود الاطمئنان على احتياجاتكم من الأصناف المعتادة (${itemsStr || "المواد الغذائية والتغليف"}). هل ترغبون في إرسال المندوب لتسليم طلبيتكم المعتادة اليوم؟\n\nشاكرين ومقدرين تعاملكم معنا!`;
    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.createProposedInvoice = (custId) => {
    if (window.navigate) {
      window.navigate("sales-invoices");
      setTimeout(() => {
        if (window.openInvoiceModal) {
          window.openInvoiceModal();
          const cust = allCustomers.find(c => c.id === custId);
          if (cust && window.selectCustomer) {
            window.selectCustomer(cust.id, cust.name, cust.creditLimit || 0, cust.balance || 0);
          }
        }
      }, 300);
    }
  };

  window.advanceLeadStage = async (id, nextStage) => {
    try {
      await update("customerLeads", id, { stage: nextStage });
      const l = allLeads.find(x => x.id === id);
      if (l) l.stage = nextStage;
      updateKPIs();
      renderCurrentView();
    } catch (e) {
      alert("فشل تحديث المرحلة: " + e.message);
    }
  };

  window.openLeadModal = () => {
    document.getElementById("lead-edit-id").value = "";
    document.getElementById("lead-modal-title").textContent = "➕ إضافة فرصة بيعية جديدة";
    document.getElementById("lead-name").value = "";
    document.getElementById("lead-contact").value = "";
    document.getElementById("lead-phone").value = "";
    document.getElementById("lead-type").value = "مطعم";
    document.getElementById("lead-zone").value = "";
    document.getElementById("lead-rep").value = "";
    document.getElementById("lead-val").value = "";
    document.getElementById("lead-stage").value = "new";
    document.getElementById("lead-next-date").value = "";
    document.getElementById("lead-items").value = "";
    document.getElementById("lead-notes").value = "";
    document.getElementById("lead-modal-err").classList.add("hidden");
    openModal("lead-modal");
  };

  window.saveLead = async () => {
    const err = document.getElementById("lead-modal-err");
    err.classList.add("hidden");

    const name = document.getElementById("lead-name").value.trim();
    const phone = document.getElementById("lead-phone").value.trim();
    const repId = document.getElementById("lead-rep").value;
    const rep = allReps.find(r => r.id === repId);
    const editId = document.getElementById("lead-edit-id").value;

    if (!name) { err.textContent = "يرجى كتابة اسم المنشأة / العميل"; err.classList.remove("hidden"); return; }
    if (!phone) { err.textContent = "يرجى إدخال رقم الجوال"; err.classList.remove("hidden"); return; }

    const data = {
      name,
      contactPerson: document.getElementById("lead-contact").value.trim(),
      phone,
      activityType: document.getElementById("lead-type").value,
      zone: document.getElementById("lead-zone").value.trim(),
      repId: repId || null,
      repName: rep ? rep.name : "",
      expectedMonthlyValue: parseFloat(document.getElementById("lead-val").value) || 0,
      stage: document.getElementById("lead-stage").value,
      nextFollowUpDate: document.getElementById("lead-next-date").value,
      interestedItems: document.getElementById("lead-items").value.trim(),
      notes: document.getElementById("lead-notes").value.trim()
    };

    try {
      if (editId) {
        await update("customerLeads", editId, data);
      } else {
        await create("customerLeads", data);
      }
      closeModal("lead-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editLead = (id) => {
    const l = allLeads.find(x => x.id === id);
    if (!l) return;

    document.getElementById("lead-edit-id").value = l.id;
    document.getElementById("lead-modal-title").textContent = "✏️ تعديل الفرصة البيعية — " + l.name;
    document.getElementById("lead-name").value = l.name || "";
    document.getElementById("lead-contact").value = l.contactPerson || "";
    document.getElementById("lead-phone").value = l.phone || "";
    document.getElementById("lead-type").value = l.activityType || "مطعم";
    document.getElementById("lead-zone").value = l.zone || "";
    document.getElementById("lead-rep").value = l.repId || "";
    document.getElementById("lead-val").value = l.expectedMonthlyValue || "";
    document.getElementById("lead-stage").value = l.stage || "new";
    document.getElementById("lead-next-date").value = l.nextFollowUpDate || "";
    document.getElementById("lead-items").value = l.interestedItems || "";
    document.getElementById("lead-notes").value = l.notes || "";
    document.getElementById("lead-modal-err").classList.add("hidden");
    openModal("lead-modal");
  };

  window.deleteLead = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفرصة البيعية؟")) return;
    try {
      await remove("customerLeads", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.convertLeadToCustomer = async (id) => {
    const l = allLeads.find(x => x.id === id);
    if (!l) return;

    if (!confirm(`هل تريد تحويل العميل المحتمل "${l.name}" إلى عميل دائم بالدليل المحاسبي؟`)) return;

    try {
      // 1. Create in customers collection
      const custId = await create("customers", {
        name: l.name,
        phone: l.phone,
        contactPerson: l.contactPerson || "",
        zone: l.zone || "",
        repId: l.repId || null,
        repName: l.repName || "",
        type: "retail",
        priceList: "retail",
        creditLimit: 0,
        balance: 0,
        notes: `تم تحويله من CRM — نشاط: ${l.activityType || "مطعم"}`
      });

      // 2. Mark lead as won
      await update("customerLeads", id, { stage: "won", convertedCustomerId: custId });
      alert(`✅ تم تحويل "${l.name}" بنجاح إلى دليل العملاء!`);
      await loadData();
    } catch (e) {
      alert("فشل التحويل: " + e.message);
    }
  };

  window.exportCRMExcel = () => {
    const data = allLeads.map(l => ({
      "المنشأة": l.name,
      "المسؤول": l.contactPerson,
      "الهاتف": l.phone,
      "النشاط": l.activityType,
      "المنطقة": l.zone,
      "المندوب": l.repName,
      "المبيعات المتوقعة": l.expectedMonthlyValue || 0,
      "المرحلة": STAGES.find(s => s.id === l.stage)?.label || l.stage,
      "المتابعة القادمة": l.nextFollowUpDate || "—"
    }));
    exportToExcel(data, "متابعة_عملاء_CRM");
  };
}
