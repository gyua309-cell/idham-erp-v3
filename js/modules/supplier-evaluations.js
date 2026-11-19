// ============================================================
// IDHAM ERP — تقييم أداء وجودة الموردين
// Supplier Scorecard, Quality & Performance Evaluation Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allEvaluations = [];
let allSuppliers = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-eval-search" class="input" placeholder="🔍 بحث في التقييمات والموردين..." oninput="window.filterEvaluations(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-eval-sup-filter" onchange="window.filterEvaluations()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>التصنيف (Tier)</label>
        <select id="sup-eval-tier-filter" onchange="window.filterEvaluations()">
          <option value="">كل الفئات</option>
          <option value="A">🌟 فئة أ (استراتيجي معتمد - 90%+)</option>
          <option value="B">🥈 فئة ب (جيد موثوق - 75-89%)</option>
          <option value="C">🥉 فئة ج (متوسط / تحت الملاحظة - 60-74%)</option>
          <option value="D">⚠️ فئة د (غير مرضي - أقل من 60%)</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportEvaluationsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openEvaluationModal()">+ تقييم أداء مورد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">الموردون المقيمون</div>
          <div class="mono" id="eval-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">🌟 فئة أ (استراتيجي معتمد)</div>
          <div class="mono" id="eval-kpi-tier-a" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">متوسط الالتزام بالتسليم</div>
          <div class="mono" id="eval-kpi-delivery" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0%</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">متوسط جودة البضاعة</div>
          <div class="mono" id="eval-kpi-quality" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0%</div>
        </div>
      </div>

      <!-- Evaluations Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>المورد</th>
                <th style="width:100px;">تاريخ التقييم</th>
                <th style="width:100px; text-align:center;">الالتزام بالتسليم</th>
                <th style="width:100px; text-align:center;">جودة البضاعة</th>
                <th style="width:100px; text-align:center;">تنافسية الأسعار</th>
                <th style="width:100px; text-align:center;">سرعة التعويض</th>
                <th style="width:90px; text-align:center;">المعدل الكلي</th>
                <th style="width:120px; text-align:center;">التصنيف</th>
                <th style="width:90px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="eval-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل تقييمات الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Evaluation Modal -->
    <div class="modal-overlay" id="eval-modal">
      <div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title" id="eval-modal-title">⭐ تقييم أداء مورد</h3>
          <button class="modal-close" onclick="closeModal('eval-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="eval-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المستهدف بالتقييم *</label>
              <select id="eval-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ التقييم *</label>
              <input type="date" id="eval-date" class="input" value="${todayStr()}" />
            </div>
          </div>

          <div style="background:var(--bg-2); border-radius:10px; padding:14px; margin-bottom:14px;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0); margin-bottom:10px;">معايير التقييم الأربعة (من 100 نقطة لكل معيار):</div>
            
            <div class="grid-2 gap-12 mb-10">
              <div class="form-group">
                <label>🚚 الالتزام بمواعيد التسليم والتوريد (0-100)</label>
                <input type="number" id="eval-delivery" class="input mono" placeholder="95" min="0" max="100" oninput="window.calcOverallScore()" />
              </div>
              <div class="form-group">
                <label>📦 جودة البضاعة وخلوها من العيوب (0-100)</label>
                <input type="number" id="eval-quality" class="input mono" placeholder="90" min="0" max="100" oninput="window.calcOverallScore()" />
              </div>
            </div>

            <div class="grid-2 gap-12">
              <div class="form-group">
                <label>💰 تنافسية واستقرار الأسعار (0-100)</label>
                <input type="number" id="eval-pricing" class="input mono" placeholder="85" min="0" max="100" oninput="window.calcOverallScore()" />
              </div>
              <div class="form-group">
                <label>🤝 سرعة الاستجابة والتعويض عن التوالف (0-100)</label>
                <input type="number" id="eval-support" class="input mono" placeholder="90" min="0" max="100" oninput="window.calcOverallScore()" />
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(99,102,241,0.08); padding:12px 16px; border-radius:8px; margin-bottom:14px;">
            <div>
              <span style="font-size:12px; color:var(--text-2);">النتيجة الإجمالية المحسوبة:</span>
              <b class="mono" id="eval-preview-score" style="font-size:18px; color:var(--brand); margin-right:8px;">90%</b>
            </div>
            <div>
              <span style="font-size:12px; color:var(--text-2);">التصنيف المستحق:</span>
              <span id="eval-preview-tier" class="badge good" style="font-size:13px; font-weight:800; padding:4px 10px;">🌟 فئة أ (استراتيجي)</span>
            </div>
          </div>

          <div class="form-group">
            <label>ملاحظات التقييم والتوصيات</label>
            <textarea id="eval-notes" class="input" rows="2" placeholder="أداء ممتاز في توريد الأرز والزيوت مع سرعة استبدال العبوات التالفة..."></textarea>
          </div>

          <div id="eval-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('eval-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveEvaluation()">💾 حفظ التقييم</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [evals, sups] = await Promise.all([
      getAll(COLS.supplierEvaluations ? COLS.supplierEvaluations() : "supplierEvaluations", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => [])
    ]);

    allEvaluations = evals;
    allSuppliers = sups;

    populateSuppliersDropdown();
    updateKPIs();
    renderEvaluationsTable();
  } catch (e) {
    console.warn("Error loading supplier evaluations data:", e);
  }
}

function calculateTier(score) {
  if (score >= 90) return { tier: "A", label: "🌟 فئة أ (استراتيجي)", badge: '<span class="badge good" style="font-weight:800;">🌟 فئة أ (استراتيجي)</span>' };
  if (score >= 75) return { tier: "B", label: "🥈 فئة ب (جيد موثوق)", badge: '<span class="badge" style="background:rgba(99,102,241,0.15); color:var(--brand); font-weight:800;">🥈 فئة ب (موثوق)</span>' };
  if (score >= 60) return { tier: "C", label: "🥉 فئة ج (تحت الملاحظة)", badge: '<span class="badge warn" style="font-weight:800;">🥉 فئة ج (ملاحظة)</span>' };
  return { tier: "D", label: "⚠️ فئة د (غير مرضي)", badge: '<span class="badge bad" style="font-weight:800;">⚠️ فئة د (غير مرضي)</span>' };
}

function updateKPIs() {
  const tierA = allEvaluations.filter(e => e.overallScore >= 90);
  const avgDelivery = allEvaluations.length ? Math.round(allEvaluations.reduce((s, e) => s + (e.deliveryScore || 0), 0) / allEvaluations.length) : 0;
  const avgQuality = allEvaluations.length ? Math.round(allEvaluations.reduce((s, e) => s + (e.qualityScore || 0), 0) / allEvaluations.length) : 0;

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("eval-kpi-total", allEvaluations.length);
  setT("eval-kpi-tier-a", tierA.length);
  setT("eval-kpi-delivery", `${avgDelivery}%`);
  setT("eval-kpi-quality", `${avgQuality}%`);
}

function populateSuppliersDropdown() {
  const f = document.getElementById("sup-eval-sup-filter");
  const m = document.getElementById("eval-sup-id");
  const opts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + opts;
  if (m) m.innerHTML = `<option value="">-- اختر المورد --</option>` + opts;
}

function renderEvaluationsTable(list = allEvaluations) {
  const tbody = document.getElementById("eval-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد تقييمات مسجلة بعد</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(e => {
    const tierObj = calculateTier(e.overallScore);
    return `
      <tr>
        <td class="font-bold">${e.supplierName}</td>
        <td class="mono dim">${e.date || "—"}</td>
        <td class="mono font-bold" style="text-align:center; color:#10B981;">${e.deliveryScore}%</td>
        <td class="mono font-bold" style="text-align:center; color:var(--brand);">${e.qualityScore}%</td>
        <td class="mono font-bold" style="text-align:center;">${e.pricingScore}%</td>
        <td class="mono font-bold" style="text-align:center;">${e.supportScore}%</td>
        <td class="mono font-bold" style="text-align:center; font-size:13.5px; color:var(--text-0);">${e.overallScore}%</td>
        <td style="text-align:center;">${tierObj.badge}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editEvaluation('${e.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteEvaluation('${e.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterEvaluations = () => {
    const q = (document.getElementById("sup-eval-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("sup-eval-sup-filter")?.value || "";
    const tier = document.getElementById("sup-eval-tier-filter")?.value || "";

    const filtered = allEvaluations.filter(e => {
      const mQ = !q || (e.supplierName || "").toLowerCase().includes(q) || (e.notes || "").toLowerCase().includes(q);
      const mS = !supId || e.supplierId === supId;
      const tierObj = calculateTier(e.overallScore);
      const mT = !tier || tierObj.tier === tier;
      return mQ && mS && mT;
    });

    renderEvaluationsTable(filtered);
  };

  window.calcOverallScore = () => {
    const d = parseFloat(document.getElementById("eval-delivery").value) || 0;
    const q = parseFloat(document.getElementById("eval-quality").value) || 0;
    const p = parseFloat(document.getElementById("eval-pricing").value) || 0;
    const s = parseFloat(document.getElementById("eval-support").value) || 0;

    const overall = Math.round((d * 0.35) + (q * 0.35) + (p * 0.15) + (s * 0.15));
    const tierObj = calculateTier(overall);

    const scoreEl = document.getElementById("eval-preview-score");
    const tierEl = document.getElementById("eval-preview-tier");
    if (scoreEl) scoreEl.textContent = `${overall}%`;
    if (tierEl) {
      tierEl.textContent = tierObj.label;
      tierEl.className = `badge ${tierObj.tier === 'A' ? 'good' : tierObj.tier === 'B' ? 'neutral' : tierObj.tier === 'C' ? 'warn' : 'bad'}`;
    }

    return overall;
  };

  window.openEvaluationModal = () => {
    document.getElementById("eval-edit-id").value = "";
    document.getElementById("eval-modal-title").textContent = "⭐ تقييم أداء مورد";
    document.getElementById("eval-sup-id").value = "";
    document.getElementById("eval-date").value = todayStr();
    document.getElementById("eval-delivery").value = "90";
    document.getElementById("eval-quality").value = "90";
    document.getElementById("eval-pricing").value = "85";
    document.getElementById("eval-support").value = "90";
    document.getElementById("eval-notes").value = "";
    document.getElementById("eval-modal-err").classList.add("hidden");
    window.calcOverallScore();
    openModal("eval-modal");
  };

  window.saveEvaluation = async () => {
    const err = document.getElementById("eval-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("eval-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const editId = document.getElementById("eval-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }

    const overall = window.calcOverallScore();
    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      date: document.getElementById("eval-date").value,
      deliveryScore: parseFloat(document.getElementById("eval-delivery").value) || 0,
      qualityScore: parseFloat(document.getElementById("eval-quality").value) || 0,
      pricingScore: parseFloat(document.getElementById("eval-pricing").value) || 0,
      supportScore: parseFloat(document.getElementById("eval-support").value) || 0,
      overallScore: overall,
      tier: calculateTier(overall).tier,
      notes: document.getElementById("eval-notes").value.trim()
    };

    try {
      if (editId) {
        await update("supplierEvaluations", editId, data);
      } else {
        await create("supplierEvaluations", data);
      }
      closeModal("eval-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editEvaluation = (id) => {
    const e = allEvaluations.find(x => x.id === id);
    if (!e) return;

    document.getElementById("eval-edit-id").value = e.id;
    document.getElementById("eval-modal-title").textContent = "✏️ تعديل تقييم أداء: " + e.supplierName;
    document.getElementById("eval-sup-id").value = e.supplierId || "";
    document.getElementById("eval-date").value = e.date || todayStr();
    document.getElementById("eval-delivery").value = e.deliveryScore || "";
    document.getElementById("eval-quality").value = e.qualityScore || "";
    document.getElementById("eval-pricing").value = e.pricingScore || "";
    document.getElementById("eval-support").value = e.supportScore || "";
    document.getElementById("eval-notes").value = e.notes || "";
    document.getElementById("eval-modal-err").classList.add("hidden");
    window.calcOverallScore();
    openModal("eval-modal");
  };

  window.deleteEvaluation = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      await remove("supplierEvaluations", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportEvaluationsExcel = () => {
    const rows = allEvaluations.map(e => ({
      "المورد": e.supplierName,
      "التاريخ": e.date,
      "الالتزام بالتسليم %": e.deliveryScore,
      "جودة البضاعة %": e.qualityScore,
      "تنافسية الأسعار %": e.pricingScore,
      "سرعة الاستجابة %": e.supportScore,
      "المعدل الكلي %": e.overallScore,
      "الفئة": e.tier,
      "الملاحظات": e.notes || "—"
    }));
    exportToExcel(rows, "تقييم_أداء_الموردين");
  };
}
