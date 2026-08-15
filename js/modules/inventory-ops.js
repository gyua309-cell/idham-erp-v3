// ============================================================
// IDHAM ERP — Advanced Supply Chain & Warehouse Operations
// طلبات الشراء، أوامر الشراء، استلام البضاعة، فحص الجودة، والتجميع والتسويات
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, doc, getDoc, deleteDoc } from "../utils/db.js";
import { formatCurrency, formatQuantity, todayString } from "../utils/formatters.js";
import { createJournalEntry, adjustStock } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let products = [];
let categories = [];
let warehouses = [];
let allAccounts = [];
let suppliers = [];
let activeSubModule = "request"; // request | po | grpo | inspect | assemble | adjust

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Filter & Navigation Bar -->
    <div class="filterbar no-print">
      <div class="filter-select-group">
        <label>العملية التشغيلية / المستند</label>
        <select id="ops-submodule-select" class="input" onchange="switchOpsSubModule(this.value)">
          <optgroup label="── دورة الشراء والاستلام ──">
            <option value="request" selected>📋 طلبات الشراء (Purchase Request)</option>
            <option value="po">📜 أوامر الشراء (Purchase Order)</option>
            <option value="grpo">📦 استلام البضاعة (Goods Receipt)</option>
            <option value="inspect">🔬 فحص الجودة (Quality Inspection)</option>
          </optgroup>
          <optgroup label="── العمليات اليومية ──">
            <option value="dispatch">📤 صرف مخزني (Stock Dispatch)</option>
            <option value="vehicle">🚐 تحميل سيارة توزيع (Load Vehicle)</option>
            <option value="vehicle-return">🔄 استلام من سيارة (Vehicle Return)</option>
            <option value="assemble">🔧 تجميع / تفكيك (Assembly)</option>
            <option value="adjust">⚖️ تسويات وإعدام (Adjustments)</option>
          </optgroup>
          <optgroup label="── الجرد والتقييم ──">
            <option value="revalue">💰 إعادة تقييم المخزون (Revalue)</option>
            <option value="spot-count">🔢 جرد مفاجئ (Spot Count)</option>
          </optgroup>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:12px;">
        <button class="btn btn-secondary" onclick="exportOpsToCSV()">📤 تصدير CSV</button>
        <button class="btn btn-primary" id="ops-new-btn" onclick="openOpsModal()">+ معاملة جديدة</button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" id="ops-content-area" style="padding:20px;">
       <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>

    <!-- Purchase Request Modal -->
    <div class="modal-overlay" id="pr-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">طلب شراء جديد</h3><button class="modal-close" onclick="closeModal('pr-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الطلب *</label><input type="date" id="pr-date" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>المستودع المطلوب التوريد له *</label><select id="pr-wh" class="input"></select></div>
        </div>
        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1fr 2fr 1fr; gap:12px; align-items:end; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;"><label>تصفية بالفئة</label><select id="pr-item-cat" class="input" onchange="filterOpsProducts('pr-item-sel', this.value)"><option value="">كل الفئات</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>إضافة صنف</label><select id="pr-item-sel" class="input"><option value="">اختر...</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>الكمية المطلوبة</label><input type="number" id="pr-item-qty" class="input mono" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="addPRItem()">+ إضافة للقائمة</button>
        </div>
        <table class="data-dense mb-16">
          <thead><tr><th>الصنف</th><th>الكمية</th><th></th></tr></thead>
          <tbody id="pr-lines-tbody"></tbody>
        </table>
        <div class="form-group"><label>البيان / أسباب الطلب</label><textarea id="pr-notes" class="input" rows="2"></textarea></div>
        <div id="pr-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('pr-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="savePurchaseRequest()" id="save-pr-btn">تقديم الطلب للاعتماد</button>
      </div></div>
    </div>

    <!-- Purchase Order (PO) Modal -->
    <div class="modal-overlay" id="po-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">أمر شراء جديد (PO)</h3><button class="modal-close" onclick="closeModal('po-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الأمر *</label><input type="date" id="po-date" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>المورد المستهدف *</label><select id="po-supplier" class="input"></select></div>
          <div class="form-group"><label>مستودع الاستلام *</label><select id="po-wh" class="input"></select></div>
        </div>
        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1fr 2fr 1fr 1fr; gap:12px; align-items:end; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;"><label>تصفية بالفئة</label><select id="po-item-cat" class="input" onchange="filterOpsProducts('po-item-sel', this.value)"><option value="">كل الفئات</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>إضافة صنف</label><select id="po-item-sel" class="input" onchange="onPOSelItemChange(this.value)"><option value="">اختر...</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>سعر التكلفة (ر.س) *</label><input type="number" id="po-item-cost" class="input mono" step="0.01" value="0.00" /></div>
            <div class="form-group" style="margin-bottom:0;"><label>الكمية المطلوبة</label><input type="number" id="po-item-qty" class="input mono" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="addPOItem()">+ إضافة صنف للأمر</button>
        </div>
        <table class="data-dense mb-16">
          <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr></thead>
          <tbody id="po-lines-tbody"></tbody>
        </table>
        <div class="form-group"><label>ملاحظات وشروط التوريد</label><textarea id="po-notes" class="input" rows="2"></textarea></div>
        <div id="po-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('po-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="savePurchaseOrder()" id="save-po-btn">إصدار أمر الشراء</button>
      </div></div>
    </div>

    <!-- Goods Receipt PO (GRPO) Modal -->
    <div class="modal-overlay" id="grpo-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">إذن استلام بضاعة جديد (GRPO)</h3><button class="modal-close" onclick="closeModal('grpo-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="grpo-date" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>استيراد من أمر شراء (PO)</label><select id="grpo-po-select" class="input" onchange="loadPOToGRPO(this.value)"><option value="">اختر أمر شراء للتحويل...</option></select></div>
          <div class="form-group"><label>مستودع التخزين الفعلي *</label><select id="grpo-wh" class="input" disabled></select></div>
        </div>
        
        <table class="data-dense mb-16">
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="width:120px;">الكمية بالوحدة</th>
              <th style="width:130px;">الكمية بالحبة/اللتر</th>
              <th style="width:120px;">السعر المالي</th>
              <th style="width:120px;">رقم التشغيلة (Batch)</th>
              <th style="width:120px;">تاريخ الانتهاء</th>
            </tr>
          </thead>
          <tbody id="grpo-lines-tbody">
            <tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>
          </tbody>
        </table>

        <div id="grpo-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('grpo-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveGRPO()" id="save-grpo-btn" disabled>تأكيد الاستلام وإضافة للمخزون</button>
      </div></div>
    </div>

    <!-- Quality Inspection Modal -->
    <div class="modal-overlay" id="qi-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">فحص جودة ومطابقة حرارية</h3><button class="modal-close" onclick="closeModal('qi-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الفحص *</label><input type="date" id="qi-date" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>رقم التشغيلة (Batch) *</label><input type="text" id="qi-batch" class="input mono" placeholder="B123-X" /></div>
          <div class="form-group"><label>درجة حرارة الشحنة المستلمة (°م) *</label><input type="number" id="qi-temp" class="input mono" placeholder="-18" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>الصنف المستلم *</label><select id="qi-product" class="input"></select></div>
          <div class="form-group"><label>تاريخ الإنتاج *</label><input type="date" id="qi-prod-date" class="input" /></div>
          <div class="form-group"><label>تاريخ انتهاء الصلاحية *</label><input type="date" id="qi-expiry" class="input" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>حالة المطابقة العامة *</label>
            <select id="qi-status" class="input">
              <option value="passed">مطابق ومقبول (Passed)</option>
              <option value="failed">مرفوض للتلف / حرارة غير مطابقة (Failed)</option>
            </select>
          </div>
          <div class="form-group"><label>المستودع المستهدف *</label><select id="qi-wh" class="input"></select></div>
        </div>
        <div class="form-group"><label>ملاحظات الفحص المخبري والظاهري</label><textarea id="qi-notes" class="input" rows="2"></textarea></div>
        <div id="qi-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('qi-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveQualityInspection()" id="save-qi-btn">حفظ واعتماد الفحص</button>
      </div></div>
    </div>

    <!-- Assembly / Disassembly Modal -->
    <div class="modal-overlay" id="asm-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">تجميع / تفكيك حزمة أصناف</h3><button class="modal-close" onclick="closeModal('asm-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>النوع *</label>
            <select id="asm-type" class="input">
              <option value="assembly">تجميع حزمة جديدة (Assembly)</option>
              <option value="disassembly">تفكيك حزمة لمكوناتها (Disassembly)</option>
            </select>
          </div>
          <div class="form-group"><label>الصنف الرئيسي (الحزمة) *</label><select id="asm-product" class="input"></select></div>
          <div class="form-group"><label>الكمية المستهدفة *</label><input type="number" id="asm-qty" class="input mono" min="1" value="1" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>المستودع *</label><select id="asm-wh" class="input"></select></div>
          <div class="form-group"><label>تاريخ العملية</label><input type="date" id="asm-date" class="input" value="${todayString()}" /></div>
        </div>
        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة مكون (صنف فرعي)</label><select id="asm-component-sel" class="input"><option value="">اختر...</option></select></div>
            <div class="form-group"><label>الكمية المطلوبة لكل حزمة</label><input type="number" id="asm-component-qty" class="input mono" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="addAssemblyComponent()">+ إضافة مكون</button>
        </div>
        <table class="data-dense mb-16">
          <thead><tr><th>الصنف المكون</th><th>الكمية لكل حزمة</th><th></th></tr></thead>
          <tbody id="asm-lines-tbody"></tbody>
        </table>
        <div id="asm-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('asm-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveAssembly()" id="save-asm-btn">تنفيذ العملية</button>
      </div></div>
    </div>

    <!-- Adjustments / Damage Modal -->
    <div class="modal-overlay" id="adj-modal">
      <div class="modal modal-lg" style="max-width:850px; max-height:90vh; overflow-y:auto;"><div class="modal-header"><h3 class="modal-title" id="adj-modal-title">تسوية وصرف وإهلاك مخزني</h3><button class="modal-close" onclick="closeModal('adj-modal')">×</button></div>
      <div class="modal-body" style="padding:20px;">
        <!-- Header fields -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>نوع العملية *</label>
            <select id="adj-type" class="input">
              <option value="damage">إعدام سلع تالفة (Damage Write-off)</option>
              <option value="add">تسوية إضافة (+)</option>
              <option value="deduct">تسوية خصم (-)</option>
              <option value="return-damaged">مرتجع تالف للمورد</option>
              <option value="expired">إعدام منتهي الصلاحية</option>
              <option value="donation">تبرعات وهبات (سلة البركة)</option>
            </select>
          </div>
          <div class="form-group"><label>المستودع المتأثر *</label><select id="adj-wh" class="input"></select></div>
          <div class="form-group"><label>التاريخ *</label><input type="date" id="adj-date" class="input" value="${todayString()}" /></div>
        </div>

        <!-- Item entry section -->
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:16px; margin-bottom:16px;">
          <h4 style="margin:0 0 12px 0; font-size:14px; color:var(--text-1);">إضافة صنف للمعاملة</h4>
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group" style="position:relative; margin-bottom:0;">
              <label>الصنف *</label>
              <input type="text" id="adj-product-search" class="input" placeholder="ابحث باسم الصنف أو الباركود..." autocomplete="off" />
              <div class="autocomplete-results hidden" id="adj-product-results" style="position:absolute; width:100%; max-height:200px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border-soft); z-index:1000; box-shadow:0 4px 6px rgba(0,0,0,0.1);"></div>
              <input type="hidden" id="adj-product" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>الكمية *</label>
              <input type="number" id="adj-qty" class="input mono" min="0.001" step="0.001" value="1" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>تكلفة الوحدة (ر.س)</label>
              <input type="number" id="adj-cost" class="input mono" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div style="text-align:left;">
            <button class="btn btn-sm btn-secondary" onclick="addAdjLine()">➕ إضافة صنف للقائمة</button>
          </div>
        </div>

        <!-- Table of added items -->
        <div class="table-container mb-16" style="border: 1px solid var(--border-soft); border-radius: 6px;">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr>
                <th>رمز الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th style="text-align:center; width:100px;">الكمية</th>
                <th style="text-align:left; width:120px;">تكلفة الوحدة</th>
                <th style="text-align:left; width:120px;">إجمالي التكلفة</th>
                <th style="text-align:center; width:60px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="adj-items-tbody">
              <!-- Dynamic Lines -->
            </tbody>
            <tfoot>
              <tr style="font-weight:bold; background:var(--bg-hover);">
                <td colspan="4" style="text-align:right;">الإجمالي الكلي لتكلفة التسوية:</td>
                <td id="adj-total-cost-label" style="text-align:left;">0.00 ر.س</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="form-group"><label>البيان / أسباب الإعدام أو التعديل *</label><textarea id="adj-notes" class="input" rows="2" placeholder="يرجى توضيح سبب التسوية..."></textarea></div>
        <div id="adj-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('adj-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveAdjustment()" id="save-adj-btn">💾 حفظ المعاملة وإنشاء قيد</button>
      </div></div>
    </div>

    <!-- Stock Dispatch Modal -->
    <div class="modal-overlay" id="dispatch-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📤 أمر صرف مخزني</h3><button class="modal-close" onclick="closeModal('dispatch-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>التاريخ *</label><input type="date" id="dsp-date" class="input" /></div>
          <div class="form-group"><label>المخزن المصدر *</label><select id="dsp-wh" class="input"></select></div>
          <div class="form-group"><label>الغرض من الصرف *</label>
            <select id="dsp-purpose" class="input">
              <option value="internal">صرف داخلي</option>
              <option value="production">تصنيع</option>
              <option value="sales">مبيعات</option>
              <option value="sample">عينة</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        </div>
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة صنف</label><select id="dsp-item-sel" class="input"><option value="">اختر…</option></select></div>
            <div class="form-group"><label>الكمية</label><input type="number" id="dsp-item-qty" class="input mono" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="addDispatchItem()">+ إضافة للقائمة</button>
        </div>
        <div class="table-container mb-16"><table class="data-dense"><thead><tr><th>الصنف</th><th>الكمية</th><th>التكلفة</th><th>الإجمالي</th><th></th></tr></thead><tbody id="dsp-lines-tbody"></tbody></table></div>
        <div class="form-group"><label>البيان</label><textarea id="dsp-notes" class="input" rows="2"></textarea></div>
        <div id="dsp-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('dispatch-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveDispatch()" id="save-dsp-btn">📤 تنفيذ الصرف</button>
      </div></div>
    </div>

    <!-- Vehicle Load Modal -->
    <div class="modal-overlay" id="vehicle-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">🚐 تحميل بضاعة على سيارة التوزيع</h3><button class="modal-close" onclick="closeModal('vehicle-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>التاريخ *</label><input type="date" id="veh-date" class="input" /></div>
          <div class="form-group"><label>المخزن المصدر *</label><select id="veh-src-wh" class="input"></select></div>
          <div class="form-group"><label>مخزن السيارة (الوجهة) *</label><select id="veh-dst-wh" class="input"></select></div>
        </div>
        <div class="form-group mb-16"><label>المندوب / السائق</label><input type="text" id="veh-driver" class="input" placeholder="اسم المندوب" /></div>
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة صنف</label><select id="veh-item-sel" class="input"><option value="">اختر…</option></select></div>
            <div class="form-group"><label>الكمية</label><input type="number" id="veh-item-qty" class="input mono" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="addVehicleItem()">+ إضافة</button>
        </div>
        <div class="table-container mb-16"><table class="data-dense"><thead><tr><th>الصنف</th><th>الكمية</th><th></th></tr></thead><tbody id="veh-lines-tbody"></tbody></table></div>
        <div class="form-group"><label>ملاحظات</label><textarea id="veh-notes" class="input" rows="2"></textarea></div>
        <div id="veh-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('vehicle-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveVehicleLoad()" id="save-veh-btn">🚐 تأكيد التحميل</button>
      </div></div>
    </div>

    <!-- Spot Count Modal -->
    <div class="modal-overlay" id="spot-count-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">🔢 جرد مفاجئ (Spot Count)</h3><button class="modal-close" onclick="closeModal('spot-count-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الجرد *</label><input type="date" id="sc-date" class="input" /></div>
          <div class="form-group"><label>المخزن الأول *</label><select id="sc-wh" class="input"></select></div>
          <div class="form-group"><label>المخزن الثاني (اختياري)</label><select id="sc-wh2" class="input"><option value="">-- لا يوجد --</option></select></div>
        </div>
        <div class="form-group mb-16"><label>ملاحظات / سبب الجرد</label><input type="text" id="sc-notes" class="input" placeholder="جرد دوري، مفاجئ، للتحقق..." /></div>
        <p style="color:var(--text-2); font-size:13px; margin-bottom:12px;">أدخل الكميات الفعلية الموجودة في المخزن. سيتم مقارنتها بالكميات الدفترية وإنشاء تسويات تلقائية.</p>
        <div class="table-container">
          <table class="data-dense">
            <thead id="sc-table-thead"><tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr></thead>
            <tbody id="sc-lines-tbody"><tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">اختر المخزن لتحميل الأصناف</td></tr></tbody>
          </table>
        </div>
        <div id="sc-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('spot-count-modal')">إلغاء</button>
        <button class="btn btn-warning" onclick="loadSpotCountItems()" id="load-sc-btn" style="background:#F59E0B;color:#fff;">📥 تحميل أصناف المخزن</button>
        <button class="btn btn-primary" onclick="saveSpotCount()" id="save-sc-btn" disabled>✅ اعتماد الجرد وإنشاء تسويات</button>
      </div></div>
    </div>

    <!-- Revalue Modal -->
    <div class="modal-overlay" id="revalue-modal">
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title">💰 إعادة تقييم المخزون</h3><button class="modal-close" onclick="closeModal('revalue-modal')">×</button></div>
      <div class="modal-body">
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>المخزن *</label><select id="rv-wh" class="input"></select></div>
          <div class="form-group"><label>الصنف *</label><select id="rv-product" class="input"></select></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>التكلفة الحالية (ر.س)</label><input type="number" id="rv-old-cost" class="input mono" readonly placeholder="تلقائي" /></div>
          <div class="form-group"><label>التكلفة الجديدة (ر.س) *</label><input type="number" id="rv-new-cost" class="input mono" step="0.01" placeholder="0.00" /></div>
        </div>
        <div class="form-group mb-16"><label>تاريخ إعادة التقييم</label><input type="date" id="rv-date" class="input" /></div>
        <div class="form-group"><label>سبب إعادة التقييم *</label><textarea id="rv-notes" class="input" rows="2" placeholder="تغيير سعر السوق، خسارة قيمة، ..." /></div>
        <div id="rv-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('revalue-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveRevalue()" id="save-rv-btn">💰 تطبيق إعادة التقييم</button>
      </div></div>
    </div>

    <!-- Spot Count Detail Modal -->
    <div class="modal-overlay" id="spot-count-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📄 تفاصيل جرد المخزون المفاجئ</h3><button class="modal-close" onclick="closeModal('spot-count-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="sc-detail-body">
        <!-- Content injected dynamically -->
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('spot-count-detail-modal')">إغلاق</button>
        <button class="btn btn-primary" onclick="window.printActiveSpotCount()">🖨️ طباعة تقرير الجرد</button>
      </div></div>
    </div>
  `;

  await Promise.all([
    loadDependencies(),
    switchOpsSubModule(activeSubModule)
  ]);
}

async function loadDependencies() {
  const [prodsSnap, catsSnap, whsSnap, accsSnap, suppSnap] = await Promise.all([
    getAll(COLS.products(), [orderBy("sku")]),
    getAll(COLS.categories(), [orderBy("name")]),
    getAll(COLS.warehouses(), [orderBy("name")]),
    getAll(COLS.chartOfAccounts(), [orderBy("code")]),
    getAll(COLS.suppliers(), [orderBy("name")]),
  ]);
  products = prodsSnap;
  categories = catsSnap;
  warehouses = whsSnap;
  allAccounts = accsSnap;
  suppliers = suppSnap;

  // Load select boxes
  const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
  const prodOptions = '<option value="">اختر...</option>' + products.map(p => `<option value="${p.id}" data-cost="${p.costPrice||0}">${p.sku} - ${p.name}</option>`).join("");
  const suppOptions = '<option value="">اختر المورد...</option>' + suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");

  // Populate category select boxes
  const catOptions = '<option value="">كل الفئات</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  const prCat = document.getElementById("pr-item-cat"); if (prCat) prCat.innerHTML = catOptions;
  const poCat = document.getElementById("po-item-cat"); if (poCat) poCat.innerHTML = catOptions;

  document.getElementById("pr-wh").innerHTML = whOptions;
  document.getElementById("po-wh").innerHTML = whOptions;
  document.getElementById("grpo-wh").innerHTML = whOptions;
  document.getElementById("qi-wh").innerHTML = whOptions;
  document.getElementById("asm-wh").innerHTML = whOptions;
  document.getElementById("adj-wh").innerHTML = whOptions;
  // New selects
  const safeSet = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  safeSet("dsp-wh",      whOptions);
  safeSet("dsp-item-sel", prodOptions);
  safeSet("veh-src-wh",  whOptions);
  safeSet("veh-dst-wh",  warehouses.filter(w => w.type === 'Vehicle').map(w => `<option value="${w.id}">${w.name}</option>`).join("") || whOptions);
  safeSet("veh-item-sel", prodOptions);
  safeSet("sc-wh",        whOptions);
  safeSet("sc-wh2",       '<option value="">-- لا يوجد --</option>' + whOptions);
  safeSet("rv-wh",        whOptions);
  safeSet("rv-product",   prodOptions);

  document.getElementById("po-supplier").innerHTML = suppOptions;

  document.getElementById("pr-item-sel").innerHTML = prodOptions;
  document.getElementById("po-item-sel").innerHTML = prodOptions;
  document.getElementById("qi-product").innerHTML = prodOptions;
  document.getElementById("asm-product").innerHTML = prodOptions;
  document.getElementById("asm-component-sel").innerHTML = prodOptions;
  const adjProdEl = document.getElementById("adj-product");
  if (adjProdEl && adjProdEl.tagName === "SELECT") {
    adjProdEl.innerHTML = prodOptions;
  }
  setupAdjProductAutocomplete();

  // Set default dates
  const today = new Date().toISOString().slice(0,10);
  ["dsp-date","veh-date","sc-date","rv-date"].forEach(id => {
    const el = document.getElementById(id); if (el && !el.value) el.value = today;
  });
}

window.switchOpsSubModule = async (val) => {
  activeSubModule = val;
  const area = document.getElementById("ops-content-area");
  area.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div></div>`;

  try {
    if (val === 'request') {
      const q = query(COLS.purchaseRequests(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const prs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderPRList(area, prs);
    } else if (val === 'po') {
      const q = query(COLS.purchaseOrders(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const pos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderPOList(area, pos);
    } else if (val === 'grpo') {
      const q = query(COLS.goodsReceiptPOs(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const grpos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderGRPOList(area, grpos);
    } else if (val === 'inspect') {
      const q = query(COLS.qualityInspections(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const qis = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderQIList(area, qis);
    } else if (val === 'assemble') {
      const q = query(COLS.productAssemblies(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const asms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderAssemblyList(area, asms);
    } else if (val === 'adjust') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const adjs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.opType);
      renderAdjustmentList(area, adjs);
    } else if (val === 'dispatch') {
      const q = query(COLS.stockDispatches?.() || COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const dsps = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'dispatch');
      renderDispatchList(area, dsps);
    } else if (val === 'vehicle') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const vehs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'vehicle-load');
      renderVehicleList(area, vehs);
    } else if (val === 'vehicle-return') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const vrs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'vehicle-return');
      renderVehicleReturnList(area, vrs);
    } else if (val === 'spot-count') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const scs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'spot-count');
      renderSpotCountList(area, scs);
    } else if (val === 'revalue') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const rvs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'revalue');
      renderRevalueList(area, rvs);
    }
  } catch (err) {
    area.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

window.openOpsModal = async () => {
  if (activeSubModule === 'request') {
    prItems = [];
    document.getElementById("pr-lines-tbody").innerHTML = "";
    document.getElementById("pr-notes").value = "";
    openModal("pr-modal");
  } else if (activeSubModule === 'po') {
    poItems = [];
    document.getElementById("po-lines-tbody").innerHTML = "";
    document.getElementById("po-notes").value = "";
    openModal("po-modal");
  } else if (activeSubModule === 'grpo') {
    const q = query(COLS.purchaseOrders(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const activePOs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'ordered');

    const sel = document.getElementById("grpo-po-select");
    sel.innerHTML = '<option value="">اختر أمر شراء للتحويل...</option>' +
      activePOs.map(p => `<option value="${p.id}">${p.poNumber || p.id} — ${p.supplierName}</option>`).join("");

    document.getElementById("grpo-lines-tbody").innerHTML = `<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>`;
    document.getElementById("save-grpo-btn").disabled = true;
    openModal("grpo-modal");
  } else if (activeSubModule === 'inspect') {
    document.getElementById("qi-batch").value = "";
    document.getElementById("qi-temp").value = "";
    document.getElementById("qi-notes").value = "";
    openModal("qi-modal");
  } else if (activeSubModule === 'assemble') {
    asmComponents = [];
    document.getElementById("asm-lines-tbody").innerHTML = "";
    document.getElementById("asm-qty").value = "1";
    openModal("asm-modal");
  } else if (activeSubModule === 'adjust') {
    window._editingAdjId = null;
    window._adjLines = [];
    document.getElementById("adj-notes").value = "";
    document.getElementById("adj-product").value = "";
    const searchInput = document.getElementById("adj-product-search");
    if (searchInput) searchInput.value = "";
    const costInput = document.getElementById("adj-cost");
    if (costInput) costInput.value = "";
    const qtyInput = document.getElementById("adj-qty");
    if (qtyInput) qtyInput.value = "1";
    renderAdjLinesTable();
    const btn = document.getElementById("save-adj-btn");
    if (btn) btn.textContent = "💾 حفظ المعاملة وإنشاء قيد";
    openModal("adj-modal");
  }
};

// ── Purchase Request Submodule ──
let prItems = [];
window.addPRItem = () => {
  const sel = document.getElementById("pr-item-sel");
  const qty = parseInt(document.getElementById("pr-item-qty").value) || 0;
  if (!sel.value || qty <= 0) return;

  const prod = products.find(p => p.id === sel.value);
  if (prItems.some(i => i.productId === sel.value)) return;
  prItems.push({ productId: sel.value, name: prod.name, sku: prod.sku, qty });
  renderPRLines();
};

function renderPRLines() {
  document.getElementById("pr-lines-tbody").innerHTML = prItems.map((item, idx) => `
    <tr>
      <td>${item.sku} - ${item.name}</td>
      <td class="mono font-bold">${item.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePRItem(${idx})">×</button></td>
    </tr>
  `).join("");
}

window.removePRItem = (idx) => { prItems.splice(idx,1); renderPRLines(); };

window.savePurchaseRequest = async () => {
  const errEl = document.getElementById("pr-error"); errEl.classList.add("hidden");
  if (!prItems.length) { errEl.textContent = "يرجى إضافة صنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }
  
  const btn = document.getElementById("save-pr-btn"); btn.disabled = true;
  try {
    const whId = document.getElementById("pr-wh").value;
    await create(COLS.purchaseRequests(), {
      date: document.getElementById("pr-date").value,
      warehouseId: whId,
      warehouseName: warehouses.find(w => w.id === whId)?.name,
      items: prItems,
      notes: document.getElementById("pr-notes").value.trim(),
      status: "pending_approval"
    });
    showToast("تم تقديم طلب الشراء للاعتماد", "success");
    closeModal("pr-modal");
    switchOpsSubModule("request");
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

function renderPRList(container, prs) {
  if (prs.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">📝</div><p>لا توجد طلبات شراء مسجلة</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>المستودع</th><th>الأصناف المطلوبة</th><th>البيان</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${prs.map(p => `
          <tr>
            <td>${p.date}</td>
            <td><strong>${p.warehouseName}</strong></td>
            <td>${(p.items || []).map(i => `${i.name} (${i.qty})`).join("، ")}</td>
            <td>${p.notes || "—"}</td>
            <td>
              <span class="badge ${p.status === 'approved' ? 'good' : p.status === 'rejected' ? 'bad' : 'warn'}">
                ${p.status === 'approved' ? 'موافق عليه' : p.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
              </span>
            </td>
            <td class="no-print">
              ${p.status === 'pending_approval' ? `
                <button class="btn btn-sm btn-ghost text-good" onclick="approvePR('${p.id}', 'approved')">✔️ موافقة</button>
                <button class="btn btn-sm btn-ghost text-bad" onclick="approvePR('${p.id}', 'rejected')">❌ رفض</button>
              ` : '—'}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

window.approvePR = async (id, status) => {
  if (confirm(`هل تريد تأكيد ${status === 'approved' ? 'اعتماد' : 'رفض'} هذا الطلب؟`)) {
    try {
      await update("purchaseRequests", id, { status });
      showToast("تم تحديث حالة طلب الشراء", "success");
      switchOpsSubModule("request");
    } catch(err) { showToast(err.message, "error"); }
  }
};

// ── Purchase Order (PO) Submodule ──
let poItems = [];
window.onPOSelItemChange = (val) => {
  const sel = document.getElementById("po-item-sel");
  const opt = sel.options[sel.selectedIndex];
  const cost = parseFloat(opt.getAttribute("data-cost")) || 0;
  document.getElementById("po-item-cost").value = cost.toFixed(2);
};

window.filterOpsProducts = (selectId, categoryId) => {
  const select = document.getElementById(selectId);
  if (!select) return;
  const filtered = categoryId 
    ? products.filter(p => p.category === categoryId) 
    : products;
  
  select.innerHTML = '<option value="">اختر...</option>' + 
    filtered.map(p => `<option value="${p.id}" data-cost="${p.costPrice||0}">${p.sku} - ${p.name}</option>`).join("");
  
  if (selectId === 'po-item-sel') {
    const costInput = document.getElementById("po-item-cost");
    if (costInput) costInput.value = "0.00";
  }
};

window.addPOItem = () => {
  const sel = document.getElementById("po-item-sel");
  const qty = parseInt(document.getElementById("po-item-qty").value) || 0;
  const cost = parseFloat(document.getElementById("po-item-cost").value) || 0;
  if (!sel.value || qty <= 0 || cost < 0) return;

  const prod = products.find(p => p.id === sel.value);
  if (poItems.some(i => i.productId === sel.value)) return;
  poItems.push({ productId: sel.value, name: prod.name, sku: prod.sku, qty, unitPrice: cost });
  renderPOLines();
};

function renderPOLines() {
  document.getElementById("po-lines-tbody").innerHTML = poItems.map((item, idx) => `
    <tr>
      <td>${item.sku} - ${item.name}</td>
      <td class="mono font-bold">${item.qty}</td>
      <td class="mono">${formatCurrency(item.unitPrice)}</td>
      <td class="mono font-bold">${formatCurrency(item.qty * item.unitPrice)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePOItem(${idx})">×</button></td>
    </tr>
  `).join("");
}

window.removePOItem = (idx) => { poItems.splice(idx,1); renderPOLines(); };

window.savePurchaseOrder = async () => {
  const errEl = document.getElementById("po-error"); errEl.classList.add("hidden");
  const suppId = document.getElementById("po-supplier").value;
  const whId = document.getElementById("po-wh").value;
  
  if (!suppId || !whId || !poItems.length) {
    errEl.textContent = "يرجى اختيار المورد والمستودع وإضافة صنف واحد على الأقل"; errEl.classList.remove("hidden"); return;
  }

  const btn = document.getElementById("save-po-btn"); btn.disabled = true;
  try {
    const poNum = `PO-${Date.now().toString().substring(6)}`;
    await create(COLS.purchaseOrders(), {
      poNumber: poNum,
      date: document.getElementById("po-date").value,
      supplierId: suppId,
      supplierName: suppliers.find(s => s.id === suppId)?.name,
      warehouseId: whId,
      warehouseName: warehouses.find(w => w.id === whId)?.name,
      items: poItems,
      notes: document.getElementById("po-notes").value.trim(),
      status: "ordered"
    });
    showToast("تم إصدار أمر الشراء بنجاح", "success");
    closeModal("po-modal");
    switchOpsSubModule("po");
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

function renderPOList(container, pos) {
  if (pos.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">📜</div><p>لا توجد أوامر شراء مسجلة</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الأمر</th><th>التاريخ</th><th>المورد</th><th>المستودع</th><th>القيمة الإجمالية</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${pos.map(p => {
          const total = (p.items || []).reduce((s,i) => s + (i.qty * i.unitPrice), 0);
          return `
            <tr>
              <td class="mono font-bold">${p.poNumber}</td>
              <td>${p.date}</td>
              <td><strong>${p.supplierName}</strong></td>
              <td>${p.warehouseName}</td>
              <td class="mono font-bold text-indigo">${formatCurrency(total)}</td>
              <td>
                <span class="badge ${p.status === 'received' ? 'good' : p.status === 'cancelled' ? 'bad' : 'warn'}">
                  ${p.status === 'received' ? 'مستلم بالكامل' : p.status === 'cancelled' ? 'ملغي' : 'مفتوح / جاري التوريد'}
                </span>
              </td>
              <td class="no-print">
                <button class="btn btn-sm btn-ghost" onclick="printPODetail('${p.id}')">🖨️ طباعة</button>
                ${p.status === 'ordered' ? `<button class="btn btn-sm btn-ghost text-bad" onclick="cancelPO('${p.id}')">❌ إلغاء</button>` : ''}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

window.cancelPO = async (id) => {
  if (confirm("هل تريد إلغاء أمر الشراء هذا؟")) {
    try {
      await update("purchaseOrders", id, { status: "cancelled" });
      showToast("تم إلغاء أمر الشراء", "success");
      switchOpsSubModule("po");
    } catch(err) { showToast(err.message, "error"); }
  }
};

window.printPODetail = async (id) => {
  const { getById } = await import("../utils/db.js");
  const po = await getById("purchaseOrders", id);
  if (!po) return;

  const total = (po.items || []).reduce((s,i)=>s+(i.qty*i.unitPrice), 0);
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
    <head>
      <title>أمر شراء #${po.poNumber}</title>
      <style>
        body { font-family: sans-serif; direction: rtl; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h2>طلب توريد / أمر شراء مالي</h2>
      <p>رقم الأمر: <strong>${po.poNumber}</strong></p>
      <p>التاريخ: ${po.date}</p>
      <p>المورد: ${po.supplierName}</p>
      <p>المستودع المستهدف: ${po.warehouseName}</p>
      <hr/>
      <table>
        <thead><tr><th>#</th><th>الصنف</th><th>الكمية المطلوبة</th><th>سعر التكلفة</th><th>الإجمالي</th></tr></thead>
        <tbody>
          ${po.items.map((item, idx) => `
            <tr>
              <td>${idx+1}</td>
              <td>${item.sku} - ${item.name}</td>
              <td>${item.qty}</td>
              <td>${formatCurrency(item.unitPrice)}</td>
              <td>${formatCurrency(item.qty * item.unitPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">الإجمالي الكلي: ${formatCurrency(total)}</h3>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ── Goods Receipt PO (GRPO) Submodule ──
let activeGRPOPO = null;

window.updateGrpoAltQty = (idx, factor) => {
  const row = document.querySelector(`#grpo-lines-tbody tr[data-idx="${idx}"]`);
  if (!row) return;
  const altInput = row.querySelector(".grpo-qty-alt");
  const baseInput = row.querySelector(".grpo-qty");
  if (altInput && baseInput) {
    const altVal = parseFloat(altInput.value) || 0;
    baseInput.value = Math.round(altVal * factor);
  }
};

window.updateGrpoBaseQty = (idx, factor) => {
  const row = document.querySelector(`#grpo-lines-tbody tr[data-idx="${idx}"]`);
  if (!row) return;
  const altInput = row.querySelector(".grpo-qty-alt");
  const baseInput = row.querySelector(".grpo-qty");
  if (altInput && baseInput) {
    const baseVal = parseFloat(baseInput.value) || 0;
    altInput.value = (baseVal / factor).toFixed(2).replace(/\.00$/, "");
  }
};

window.loadPOToGRPO = async (poId) => {
  const tbody = document.getElementById("grpo-lines-tbody");
  const btn = document.getElementById("save-grpo-btn");
  if (!poId) {
    tbody.innerHTML = `<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>`;
    btn.disabled = true;
    return;
  }

  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;
  try {
    const { getById } = await import("../utils/db.js");
    activeGRPOPO = await getById("purchaseOrders", poId);
    if (!activeGRPOPO) throw new Error("أمر الشراء غير موجود");

    const whSelect = document.getElementById("grpo-wh");
    whSelect.value = activeGRPOPO.warehouseId;

    tbody.innerHTML = (activeGRPOPO.items || []).map((item, idx) => {
      const prod = products.find(p => p.id === item.productId) || {};
      const unit = prod.unit || "حبة";
      const altUnit = prod.altUnit || "";
      const factor = parseInt(prod.unitFactor) || 1;
      
      let qtyAlt = 0;
      let qtyBase = item.qty;
      if (altUnit && factor > 1) {
        qtyAlt = (item.qty / factor).toFixed(2).replace(/\.00$/, "");
      }

      return `
        <tr data-idx="${idx}">
          <td>
            <strong>${item.sku} - ${item.name}</strong>
          </td>
          <!-- Alt Unit (Carton) -->
          <td style="vertical-align: middle;">
            ${altUnit ? `
              <div style="display:flex; align-items:center; gap:4px;">
                <input type="number" class="input mono grpo-qty-alt" style="height:28px; width:80px;" value="${qtyAlt}" min="0" step="any" oninput="updateGrpoAltQty(${idx}, ${factor})" />
                <span class="dim" style="font-size:11px;">${altUnit}</span>
              </div>
            ` : `<span class="dim">—</span>`}
          </td>
          <!-- Base Unit (Piece) -->
          <td style="vertical-align: middle;">
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" class="input mono grpo-qty" style="height:28px; width:90px;" value="${qtyBase}" min="1" oninput="updateGrpoBaseQty(${idx}, ${factor})" data-idx="${idx}" />
              <span class="dim" style="font-size:11px;">${unit}</span>
            </div>
          </td>
          <td><input type="number" class="input mono grpo-cost" style="height:28px; width:90px;" value="${item.unitPrice}" step="0.01" data-idx="${idx}" /></td>
          <td><input type="text" class="input mono grpo-batch" style="height:28px; width:90px;" placeholder="Batch#" data-idx="${idx}" /></td>
          <td><input type="date" class="input grpo-expiry" style="height:28px;" data-idx="${idx}" /></td>
        </tr>
      `;
    }).join("");

    btn.disabled = false;

  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-bad" style="text-align:center;">${err.message}</td></tr>`;
    btn.disabled = true;
  }
};

window.saveGRPO = async () => {
  const errEl = document.getElementById("grpo-error"); errEl.classList.add("hidden");
  if (!activeGRPOPO) return;

  const rows = document.querySelectorAll("#grpo-lines-tbody tr");
  const lines = [];
  let totalValue = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const idx = parseInt(row.getAttribute("data-idx"));
    const originalItem = (activeGRPOPO.items || [])[idx];
    if (!originalItem) continue;

    const qtyInput = row.querySelector(".grpo-qty");
    const costInput = row.querySelector(".grpo-cost");
    const batchInput = row.querySelector(".grpo-batch");
    const expiryInput = row.querySelector(".grpo-expiry");
    const altInput = row.querySelector(".grpo-qty-alt");

    const qty = parseInt(qtyInput?.value) || 0;
    const cost = parseFloat(costInput?.value) || 0;
    const batch = batchInput?.value.trim() || "";
    const expiry = expiryInput?.value || "";
    const qtyAlt = altInput ? parseFloat(altInput.value) || 0 : 0;

    if (qty <= 0 || cost <= 0) {
      errEl.textContent = "يرجى إدخال كميات وأسعار صحيحة لكافة السطور"; errEl.classList.remove("hidden"); return;
    }

    const prod = products.find(p => p.id === originalItem.productId) || {};

    lines.push({
      productId: originalItem.productId,
      sku: originalItem.sku,
      name: originalItem.name,
      qty,
      unitPrice: cost,
      batchNumber: batch || null,
      expiryDate: expiry || null,
      unit: prod.unit || "حبة",
      altUnit: prod.altUnit || null,
      unitFactor: parseInt(prod.unitFactor) || 1,
      qtyAlt: qtyAlt
    });
    totalValue += qty * cost;
  }

  const btn = document.getElementById("save-grpo-btn"); btn.disabled = true;
  try {
    const grpoNum = `GRPO-${Date.now().toString().substring(6)}`;
    const date = document.getElementById("grpo-date").value;
    const whId = activeGRPOPO.warehouseId;

    const grpoId = await create(COLS.goodsReceiptPOs(), {
      grpoNumber: grpoNum,
      date,
      purchaseOrderId: activeGRPOPO.id,
      poNumber: activeGRPOPO.poNumber,
      supplierId: activeGRPOPO.supplierId,
      supplierName: activeGRPOPO.supplierName,
      warehouseId: whId,
      warehouseName: activeGRPOPO.warehouseName,
      items: lines,
      totalValue,
      status: "received"
    });

    for (const line of lines) {
      await adjustStock(whId, line.productId, line.qty, {
        type: "purchase_in",
        sourceType: "goodsReceiptPO",
        sourceId: grpoId,
        purchasePrice: line.unitPrice,
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate
      });
    }

    await update("purchaseOrders", activeGRPOPO.id, { status: "received" });

    const invAccObj = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون مستودع المواد الغذائية" };
    const apAccObj  = allAccounts.find(a => a.code === "2-1-1-1-1")   || allAccounts.find(a => a.code === "2-1-1-1") || { id: "AP_SUPPLIERS", code: "2-1-1-1-1", name: "ذمم موردون محليون" };

    await createJournalEntry({
      date,
      description: `إذن استلام بضاعة مخزني #${grpoNum} لـ ${activeGRPOPO.supplierName}`,
      sourceType: "goodsReceiptPO",
      sourceId: grpoId,
      lines: [
        { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: totalValue, credit: 0, note: "إثبات استلام مخزون" },
        { accountId: apAccObj.id,  accountCode: apAccObj.code,  accountName: apAccObj.name,  debit: 0, credit: totalValue, note: "إثبات التزام الموردين" }
      ]
    });

    showToast("تم إثبات استلام البضاعة مخزنياً ومحاسبياً", "success");
    closeModal("grpo-modal");
    switchOpsSubModule("grpo");

  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderGRPOList(container, grpos) {
  if (grpos.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">📦</div><p>لا توجد أذونات استلام مخزنية</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الإذن</th><th>التاريخ</th><th>أمر الشراء</th><th>المورد</th><th>المستودع</th><th>قيمة الوارد المالي</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${grpos.map(g => `
          <tr>
            <td class="mono font-bold">${g.grpoNumber}</td>
            <td>${g.date}</td>
            <td class="mono font-bold text-dim">${g.poNumber}</td>
            <td><strong>${g.supplierName}</strong></td>
            <td>${g.warehouseName}</td>
            <td class="mono font-bold text-good">${formatCurrency(g.totalValue)}</td>
            <td class="no-print" style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-ghost" onclick="printGRPODetail('${g.id}')">🖨️ طباعة</button>
              <button class="btn btn-sm btn-primary" onclick="convertGRPOToInvoice('${g.id}')" style="background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; padding:4px 8px; font-size:11px;">📄 تحويل لفاتورة</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

window.printGRPODetail = async (id) => {
  const { getById } = await import("../utils/db.js");
  const g = await getById("goodsReceiptPOs", id);
  if (!g) return;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
    <head>
      <title>إذن استلام بضاعة #${g.grpoNumber}</title>
      <style>
        body { font-family: sans-serif; direction: rtl; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h2>مؤسسة إدهام للمواد الغذائية — إذن استلام بضاعة مخزني</h2>
      <p>رقم السند: <strong>${g.grpoNumber}</strong></p>
      <p>التاريخ: ${g.date}</p>
      <p>أمر الشراء المرجعي: ${g.poNumber}</p>
      <p>المورد: ${g.supplierName}</p>
      <p>المستودع الفعلي: ${g.warehouseName}</p>
      <hr/>
      <table>
        <thead><tr><th>#</th><th>الصنف</th><th>الكمية بالوحدة</th><th>الكمية بالحبة/اللتر</th><th>سعر الوحدة</th><th>رقم التشغيلة (Batch)</th><th>تاريخ الانتهاء</th><th>الإجمالي</th></tr></thead>
        <tbody>
          ${(g.items || []).map((item, idx) => {
            const hasAlt = item.altUnit && item.unitFactor > 1;
            const altQtyStr = hasAlt ? `${item.qtyAlt || (item.qty / item.unitFactor).toFixed(2).replace(/\.00$/, "")} ${item.altUnit}` : "—";
            const baseQtyStr = `${item.qty} ${item.unit || "حبة"}`;
            return `
              <tr>
                <td>${idx+1}</td>
                <td>${item.sku} - ${item.name}</td>
                <td>${altQtyStr}</td>
                <td>${baseQtyStr}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${item.batchNumber || "—"}</td>
                <td>${item.expiryDate || "—"}</td>
                <td>${formatCurrency(item.qty * item.unitPrice)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">القيمة المالية التراكمية: ${formatCurrency(g.totalValue)}</h3>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

window.convertGRPOToInvoice = async (id) => {
  try {
    const { getById } = await import("../utils/db.js");
    const g = await getById("goodsReceiptPOs", id);
    if (!g) { showToast("إذن الاستلام غير موجود", "error"); return; }

    // Save to sessionStorage
    sessionStorage.setItem("convert_grpo_to_invoice", JSON.stringify({
      grpoId:        g.id,
      grpoNumber:    g.grpoNumber,
      supplierId:    g.supplierId || "",
      supplierName:  g.supplierName || "",
      warehouseId:   g.warehouseId || "",
      warehouseName: g.warehouseName || "",
      items: (g.items || []).map(item => ({
        productId:   item.productId,
        productName: item.name,
        sku:         item.sku || "",
        unit:        item.unit || "PCS",
        qty:         item.qty || 0,
        unitPrice:   item.unitPrice || 0,
        batchNumber: item.batchNumber || "",
        expiryDate:  item.expiryDate || ""
      })),
      totalValue:    g.totalValue
    }));

    showToast("تم تحويل إذن الاستلام بنجاح. يتم تحويلك الآن لوحدة الفواتير المشتريات...", "success");
    
    if (typeof navigate === "function") {
      navigate("purchase-invoices");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ── Quality Inspection Submodule ──
window.saveQualityInspection = async () => {
  const errEl = document.getElementById("qi-error"); errEl.classList.add("hidden");
  
  const batch = document.getElementById("qi-batch").value.trim().toUpperCase();
  const temp = parseFloat(document.getElementById("qi-temp").value);
  const productId = document.getElementById("qi-product").value;
  const prodDate = document.getElementById("qi-prod-date").value;
  const expiry = document.getElementById("qi-expiry").value;
  const whId = document.getElementById("qi-wh").value;
  const status = document.getElementById("qi-status").value;

  if (!batch || isNaN(temp) || !productId || !prodDate || !expiry || !whId) {
    errEl.textContent = "يرجى تعبئة كافة الحقول المطلوبة"; errEl.classList.remove("hidden"); return;
  }

  const btn = document.getElementById("save-qi-btn"); btn.disabled = true;
  try {
    const prod = products.find(p => p.id === productId);
    await create(COLS.qualityInspections(), {
      date: document.getElementById("qi-date").value,
      batchNumber: batch,
      temperatureRecorded: temp,
      productId,
      productName: prod.name,
      sku: prod.sku,
      productionDate: prodDate,
      expiryDate: expiry,
      status,
      warehouseId: whId,
      warehouseName: warehouses.find(w => w.id === whId)?.name,
      notes: document.getElementById("qi-notes").value.trim()
    });
    showToast("تم تسجيل وحفظ فحص الجودة", "success");
    closeModal("qi-modal");
    switchOpsSubModule("inspect");
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

function renderQIList(container, qis) {
  if (qis.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">🌡️</div><p>لا توجد فحوصات جودة مسجلة</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>الصنف</th><th>التشغيلة (Batch)</th><th>الحرارة (°م)</th><th>صلاحية الشحنة</th><th>المستودع</th><th>حالة الفحص</th></tr></thead>
      <tbody>
        ${qis.map(q => `
          <tr>
            <td>${q.date}</td>
            <td><strong>${q.sku} — ${q.productName}</strong></td>
            <td class="mono font-bold">${q.batchNumber}</td>
            <td class="mono font-bold">${q.temperatureRecorded}°م</td>
            <td class="dim">من: ${q.productionDate} إلى: ${q.expiryDate}</td>
            <td>${q.warehouseName}</td>
            <td><span class="badge ${q.status === 'passed' ? 'good' : 'bad'}">${q.status === 'passed' ? 'مطابق ومقبول' : 'مرفوض/تالف'}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ── Assembly / Disassembly Submodule ──
let asmComponents = [];
window.addAssemblyComponent = () => {
  const sel = document.getElementById("asm-component-sel");
  const qty = parseInt(document.getElementById("asm-component-qty").value) || 0;
  if (!sel.value || qty <= 0) return;
  const prod = products.find(p => p.id === sel.value);
  if (asmComponents.some(c => c.productId === sel.value)) return;
  asmComponents.push({ productId: sel.value, name: prod.name, sku: prod.sku, qty });
  renderAsmLines();
};

function renderAsmLines() {
  document.getElementById("asm-lines-tbody").innerHTML = asmComponents.map((item, idx) => `
    <tr>
      <td>${item.sku} - ${item.name}</td>
      <td class="mono font-bold">${item.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removeAsmLine(${idx})">×</button></td>
    </tr>
  `).join("");
}

window.removeAsmLine = (idx) => { asmComponents.splice(idx,1); renderAsmLines(); };

window.saveAssembly = async () => {
  const errEl = document.getElementById("asm-error"); errEl.classList.add("hidden");
  
  const type = document.getElementById("asm-type").value;
  const targetProdId = document.getElementById("asm-product").value;
  const targetQty = parseInt(document.getElementById("asm-qty").value) || 0;
  const whId = document.getElementById("asm-wh").value;
  const date = document.getElementById("asm-date").value;

  if (!targetProdId || targetQty <= 0 || !whId || !asmComponents.length) {
    errEl.textContent = "يرجى تعبئة كافة الحقول وتحديد المكونات"; errEl.classList.remove("hidden"); return;
  }

  const btn = document.getElementById("save-asm-btn"); btn.disabled = true;
  try {
    const parentProd = products.find(p => p.id === targetProdId);
    const asmId = await create(COLS.productAssemblies(), {
      type, date,
      parentProductId: targetProdId,
      parentProductName: parentProd.name,
      parentSku: parentProd.sku,
      quantity: targetQty,
      warehouseId: whId,
      warehouseName: warehouses.find(w=>w.id===whId)?.name,
      components: asmComponents
    });

    const parentCost = parentProd.costPrice || 0;
    const totalCost = parentCost * targetQty;
    const invAccObj = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون مستودع المواد الغذائية" };

    await createJournalEntry({
      date,
      description: `عملية ${type === 'assembly' ? 'تجميع' : 'تفكيك'} منتج #${parentProd.sku}`,
      sourceType: "assembly",
      sourceId: asmId,
      lines: [
        { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: type === 'assembly' ? totalCost : 0, credit: type === 'assembly' ? 0 : totalCost, note: `تأثير مخزون المنتج الرئيسي` },
        { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: type === 'assembly' ? 0 : totalCost, credit: type === 'assembly' ? totalCost : 0, note: `تأثير المخزون للمكونات` }
      ]
    });

    showToast("تم تنفيذ عملية التجميع وتأثير المخزون بنجاح", "success");
    closeModal("asm-modal");
    switchOpsSubModule("assemble");
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

function renderAssemblyList(container, asms) {
  if (asms.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">🛠️</div><p>لا توجد عمليات تجميع/تفكيك</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>النوع</th><th>الحزمة (المنتج الرئيسي)</th><th>الكمية</th><th>المستودع</th><th>المكونات الفرعية</th></tr></thead>
      <tbody>
        ${asms.map(a => `
          <tr>
            <td>${a.date}</td>
            <td><span class="badge ${a.type === 'assembly' ? 'good' : 'warn'}">${a.type === 'assembly' ? 'تجميع' : 'تفكيك'}</span></td>
            <td><strong>${a.parentSku} — ${a.parentProductName}</strong></td>
            <td class="mono font-bold">${a.quantity}</td>
            <td>${a.warehouseName}</td>
            <td class="dim">${a.components.map(c => `${c.name} (${c.qty})`).join("، ")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ── Daily Adjustments & Damage Write-off ──
window.saveAdjustment = async () => {
  const errEl = document.getElementById("adj-error");
  errEl.classList.add("hidden");

  const type = document.getElementById("adj-type").value;
  const whId = document.getElementById("adj-wh").value;
  const date = document.getElementById("adj-date").value;
  const notes = document.getElementById("adj-notes").value.trim();

  if (!whId || !date) {
    errEl.textContent = "يرجى تعبئة كافة الحقول المطلوبة";
    errEl.classList.remove("hidden");
    return;
  }

  if (window._adjLines.length === 0) {
    errEl.textContent = "يرجى إضافة صنف واحد على الأقل للعملية";
    errEl.classList.remove("hidden");
    return;
  }

  // ── Guard against double-save ────────────────────────────────────────
  if (window._adjSavingInProgress) {
    showToast("⏳ جارٍ الحفظ... لا تضغط مرتين", "warning");
    return;
  }
  window._adjSavingInProgress = true;

  const btn = document.getElementById("save-adj-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جارٍ الحفظ...";

  try {
    const isEdit = !!window._editingAdjId;
    let adjId = window._editingAdjId;

    const whName = warehouses.find(w => w.id === whId)?.name || "المستودع الرئيسي";
    const totalCost = window._adjLines.reduce((s, l) => s + l.totalCost, 0);

    const invAccObj = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون المستودع الرئيسي" };
    const expAccObj = allAccounts.find(a => a.code === "5-7") || { id: "STOCK_LOSS", code: "5-7", name: "المخصصات والخسائر المحتملة" };
    const donationAccObj = allAccounts.find(a => a.code === "5-4-21") || { id: "DONATION_EXPENSE", code: "5-4-21", name: "مصروف هدايا ومساعدات ومساهمات اجتماعية" };

    const activeExpAcc = type === "donation" ? donationAccObj : expAccObj;

    // 1. REVERSAL (IF EDIT)
    if (isEdit) {
      const oldAdj = await getDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, adjId)).then(d => d.exists() ? d.data() : null);
      if (oldAdj) {
        // Reverse old stock adjustments (loop over lines, or single-item if historical)
        const oldLines = oldAdj.lines || [
          { productId: oldAdj.productId, qty: oldAdj.qty, type: oldAdj.type }
        ];

        for (const l of oldLines) {
          if (!l.productId || !l.qty) continue;
          const reverseQty = (oldAdj.type === 'damage' || oldAdj.type === 'deduct' || oldAdj.type === 'expired' || oldAdj.type === 'return-damaged' || oldAdj.type === 'donation')
            ? l.qty
            : -l.qty;

          await adjustStock(oldAdj.warehouseId, l.productId, reverseQty, {
            type: "adjustment_reverse", sourceType: "inventoryAdjustment", sourceId: adjId
          });
        }

        // Delete old JEs
        try {
          const { deleteJournalEntry } = await import("../utils/db.js");
          const oldJEs = await getDocs(query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "==", adjId)));
          for (const jeDoc of oldJEs.docs) {
            await deleteJournalEntry(jeDoc.id);
          }
        } catch (jeErr) {
          console.warn("[Edit] Failed to cleanup old JEs:", jeErr.message);
        }
      }

      // Update the document
      await update(COLS.inventoryAdjustments(), adjId, {
        type,
        date,
        warehouseId: whId,
        warehouseName: whName,
        notes,
        lines: window._adjLines,
        totalCost,
        updatedAt: new Date()
      });
    } else {
      // Create new document
      adjId = await create(COLS.inventoryAdjustments(), {
        type,
        date,
        warehouseId: whId,
        warehouseName: whName,
        notes,
        lines: window._adjLines,
        totalCost,
        createdAt: new Date()
      });
    }
  // Guard: warn if total cost is zero for outflow types that need a JE
  const isOutflow = ['damage', 'deduct', 'expired', 'return-damaged', 'donation'].includes(type);
  if (isOutflow && totalCost === 0) {
    const proceed = confirm(
      "⚠️ تنبيه: إجمالي التكلفة = 0 ريال!\n" +
      "هذا يعني القيد المحاسبي سيُسجَّل بصفر ولن يؤثر على شجرة الحسابات.\n\n" +
      "السبب الغالب: المنتجات لا تحتوي على متوسط تكلفة مسجّل.\n" +
      "هل تريد المتابعة على أي حال؟"
    );
    if (!proceed) {
      window._adjSavingInProgress = false;
      btn.disabled = false;
      btn.textContent = "💾 حفظ التسوية";
      return;
    }
  }

    // Apply stock changes — allowNegative:true lets admin force adjustments
    // even when registered stock is lower than the requested qty
    for (const l of window._adjLines) {
      const qtyDelta = (type === 'damage' || type === 'deduct' || type === 'expired' || type === 'return-damaged' || type === 'donation')
        ? -l.qty
        : l.qty;

      await adjustStock(whId, l.productId, qtyDelta, {
        type: qtyDelta < 0 ? "adjustment_out" : "adjustment_in",
        sourceType: "inventoryAdjustment",
        sourceId: adjId,
        productName: l.productName || "",
        warehouseName: whName,
        allowNegative: true   // Admin can always force inventory adjustments
      });
    }

    // 3. CREATE NEW JOURNAL ENTRY
    let typeText = "تسوية خصم";
    if (type === 'damage') typeText = "إهلاك تالف";
    else if (type === 'expired') typeText = "إعدام منتهي صلاحية";
    else if (type === 'return-damaged') typeText = "مرتجع تالف للمورد";
    else if (type === 'donation') typeText = "صرف تبرعات وهبات";
    else if (type === 'add') typeText = "تسوية إضافة";

    if (type === 'damage' || type === 'deduct' || type === 'expired' || type === 'return-damaged' || type === 'donation') {
      // Outflow (-)
      await createJournalEntry({
        date,
        description: `${typeText} لعدد ${window._adjLines.length} أصناف - ${notes}`,
        sourceType: "inventory_adjustment",
        sourceId: adjId,
        lines: [
          { accountId: activeExpAcc.id, accountCode: activeExpAcc.code, accountName: activeExpAcc.name, debit: totalCost, credit: 0, note: `إثبات تكلفة ${typeText}` },
          { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: 0, credit: totalCost, note: "تخفيض قيمة المخزون" }
        ]
      });
    } else {
      // Inflow (+)
      await createJournalEntry({
        date,
        description: `تسوية إضافة لعدد ${window._adjLines.length} أصناف - ${notes}`,
        sourceType: "inventory_adjustment",
        sourceId: adjId,
        lines: [
          { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: totalCost, credit: 0, note: "زيادة قيمة المخزون" },
          { accountId: expAccObj.id, accountCode: expAccObj.code, accountName: expAccObj.name, debit: 0, credit: totalCost, note: "تسوية فروقات جردية (زيادة)" }
        ]
      });
    }

    showToast(isEdit ? "تم تعديل المعاملة وتحديث القيود المحاسبية بنجاح" : "تم تسجيل المعاملة وإنشاء القيود المحاسبية بنجاح", "success");
    closeModal("adj-modal");
    switchOpsSubModule("adjust");
  } catch (err) {
    // ── Auto-rollback: if doc was created but stock/JE failed, delete it ──
    if (!isEdit && adjId) {
      try {
        await remove("inventoryAdjustments", adjId);
        console.warn("[saveAdjustment] Rolled back orphan document:", adjId);
      } catch (rollbackErr) {
        console.error("[saveAdjustment] Rollback failed:", rollbackErr.message);
      }
    }
    errEl.textContent = "❌ " + err.message;
    errEl.classList.remove("hidden");
    console.error("[saveAdjustment] Error:", err);
  } finally {
    window._adjSavingInProgress = false;
    btn.disabled = false;
    btn.textContent = isEdit ? "💾 حفظ التعديلات" : "💾 حفظ التسوية";
  }
};

function renderAdjustmentList(container, adjs) {
  if (adjs.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔧</div><p>لا توجد تسويات مسجلة</p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-dense" style="width:100%;">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>نوع المعاملة</th>
          <th>الأصناف (الرمز - الاسم - الكمية)</th>
          <th style="text-align:left;">إجمالي التكلفة</th>
          <th>المستودع</th>
          <th>البيان / أسباب العملية</th>
          <th class="no-print">إجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${adjs.map(a => {
          let typeBadge = '';
          if (a.type === 'damage') typeBadge = '<span class="badge bad text-white">إعدام تالف</span>';
          else if (a.type === 'expired') typeBadge = '<span class="badge bad text-white">إعدام منتهي الصلاحية</span>';
          else if (a.type === 'return-damaged') typeBadge = '<span class="badge warn text-white">مرتجع تالف للمورد</span>';
          else if (a.type === 'donation') typeBadge = '<span class="badge info text-white" style="background:#3b82f6;">تبرعات وهبات</span>';
          else if (a.type === 'deduct') typeBadge = '<span class="badge warn text-white">تسوية خصم (-)</span>';
          else typeBadge = '<span class="badge good text-white">تسوية إضافة (+)</span>';

          // Historical fallback
          const lines = a.lines || [
            {
              productId: a.productId,
              productName: a.productName || "—",
              sku: a.sku || "—",
              qty: a.qty || 0,
              cost: a.costPrice || 0,
              totalCost: a.totalCost || ((a.costPrice || 0) * (a.qty || 0))
            }
          ];

          const totalCost = a.totalCost || lines.reduce((s, l) => s + (l.totalCost || 0), 0);

          const itemsHtml = lines.map(l => `
            <div style="margin-bottom:4px; font-size:12px;">
              <span class="mono font-bold" style="color:var(--brand);">${l.sku || "—"}</span> — ${l.productName} 
              <span class="badge neutral" style="padding:1px 5px; font-size:10.5px;">الكمية: ${l.qty}</span>
            </div>
          `).join("");

          return `
            <tr>
              <td>${a.date}</td>
              <td>${typeBadge}</td>
              <td>${itemsHtml}</td>
              <td class="mono font-bold" style="text-align:left;">${formatCurrency(totalCost)}</td>
              <td>${a.warehouseName || "—"}</td>
              <td class="dim">${a.notes || "—"}</td>
              <td class="no-print" style="white-space:nowrap;">
                <button class="btn btn-sm btn-ghost" onclick="printAdjDetail('${a.id}')">🖨️ طباعة</button>
                <button class="btn btn-sm btn-ghost text-primary" onclick="editAdjustment('${a.id}')">✏️ تعديل</button>
                <button class="btn btn-sm btn-ghost text-bad" onclick="deleteAdjustment('${a.id}')">🗑️ حذف</button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

// ── Export CSV Submodule ──
window.exportOpsToCSV = async () => {
  showToast("جاري التصدير...", "info");
  try {
    let list = [];
    if (activeSubModule === 'request') list = await getAll(COLS.purchaseRequests());
    else if (activeSubModule === 'po') list = await getAll(COLS.purchaseOrders());
    else if (activeSubModule === 'grpo') list = await getAll(COLS.goodsReceiptPOs());
    else if (activeSubModule === 'inspect') list = await getAll(COLS.qualityInspections());
    else if (activeSubModule === 'assemble') list = await getAll(COLS.productAssemblies());
    else list = (await getAll(COLS.inventoryAdjustments())).filter(d => d.opType === activeSubModule || !d.opType);

    if (!list.length) { showToast("لا توجد بيانات لتصديرها", "warn"); return; }
    const headers = Object.keys(list[0]);
    const csvRows = [headers.join(",")];
    list.forEach(item => {
      const vals = headers.map(h => {
        const val = item[h];
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val || "").replace(/"/g, '""')}"`;
      });
      csvRows.push(vals.join(","));
    });
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inventory_${activeSubModule}_${todayString()}.csv`;
    a.click();
    showToast("تم التصدير بنجاح", "success");
  } catch(e) { showToast(e.message, "error"); }
};

// ════════════════════════════════════════════════════
// DISPATCH (أمر الصرف المخزني)
// ════════════════════════════════════════════════════
let dispatchLines = [];

function renderDispatchList(area, list) {
  if (!list.length) {
    area.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-2);">
      <div style="font-size:40px;margin-bottom:12px;">📤</div>
      <div style="font-size:16px;font-weight:600;">لا توجد عمليات صرف مسجلة</div>
      <div style="font-size:13px;margin-top:8px;">استخدم "معاملة جديدة" لإنشاء أمر صرف</div>
    </div>`;
    return;
  }
  area.innerHTML = `<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>رقم الأمر</th><th>المخزن</th><th>الغرض</th><th>الأصناف</th><th>إجمالي التكلفة</th><th>الحالة</th><th></th></tr></thead>
    <tbody>${list.map(d => `<tr>
      <td>${d.date || "—"}</td>
      <td class="mono font-bold">${d.number || d.id.slice(-6)}</td>
      <td>${d.warehouseName || "—"}</td>
      <td>${d.purpose === "internal" ? "داخلي" : d.purpose === "sales" ? "مبيعات" : d.purpose || "—"}</td>
      <td class="mono">${(d.lines||[]).length} صنف</td>
      <td class="mono">${formatCurrency(d.totalCost || 0)}</td>
      <td><span class="badge good" style="font-size:10px;">مُنفَّذ</span></td>
      <td></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`;
}

window.addDispatchItem = () => {
  const sel = document.getElementById("dsp-item-sel");
  const qty = parseFloat(document.getElementById("dsp-item-qty").value) || 1;
  if (!sel.value) { showToast("اختر صنفاً أولاً", "warn"); return; }
  const opt = sel.options[sel.selectedIndex];
  const prod = products.find(p => p.id === sel.value);
  if (!prod) return;
  const existing = dispatchLines.find(l => l.productId === sel.value);
  if (existing) { existing.qty += qty; }
  else { dispatchLines.push({ productId: sel.value, productName: prod.name, sku: prod.sku, qty, cost: prod.costPrice || 0 }); }
  renderDspLines();
};

function renderDspLines() {
  const tbody = document.getElementById("dsp-lines-tbody");
  if (!tbody) return;
  if (!dispatchLines.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد أصناف مضافة</td></tr>`; return; }
  let total = 0;
  tbody.innerHTML = dispatchLines.map((l, i) => {
    const lineTotal = l.qty * l.cost;
    total += lineTotal;
    return `<tr>
      <td>${l.productName} <span class="dim mono" style="font-size:11px;">${l.sku}</span></td>
      <td><input type="number" class="input mono" style="width:80px;" value="${l.qty}" min="1" onchange="dispatchLines[${i}].qty=parseFloat(this.value)||1; renderDspLines();" /></td>
      <td class="mono">${formatCurrency(l.cost)}</td>
      <td class="mono font-bold">${formatCurrency(lineTotal)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="dispatchLines.splice(${i},1); renderDspLines();">✕</button></td>
    </tr>`;
  }).join("") + `<tr style="background:var(--bg-3);font-weight:700;"><td colspan="3">الإجمالي</td><td class="mono">${formatCurrency(total)}</td><td></td></tr>`;
}

window.saveDispatch = async () => {
  const errEl = document.getElementById("dsp-error"); errEl.classList.add("hidden");
  const whId  = document.getElementById("dsp-wh").value;
  const date  = document.getElementById("dsp-date").value;
  const purpose = document.getElementById("dsp-purpose").value;
  const notes = document.getElementById("dsp-notes").value.trim();
  if (!whId || !date || !dispatchLines.length) {
    errEl.textContent = "يرجى اختيار المخزن والتاريخ وإضافة أصناف"; errEl.classList.remove("hidden"); return;
  }
  const wh = warehouses.find(w => w.id === whId);
  const btn = document.getElementById("save-dsp-btn"); btn.disabled = true; btn.textContent = "جارٍ التنفيذ…";
  try {
    const totalCost = dispatchLines.reduce((s,l) => s + l.qty * l.cost, 0);
    // Adjust stock for each line
    for (const l of dispatchLines) {
      await adjustStock({ productId: l.productId, warehouseId: whId, qty: -l.qty, cost: l.cost, type: "out", refType: "dispatch", note: `صرف: ${purpose}` });
    }
    // Save dispatch record
    await create(COLS.inventoryAdjustments(), {
      opType: "dispatch", date, warehouseId: whId, warehouseName: wh?.name, purpose, lines: dispatchLines, totalCost, notes,
      status: "confirmed", createdAt: new Date()
    });
    showToast(`✅ تم تنفيذ أمر الصرف بنجاح — ${dispatchLines.length} صنف`, "success");
    closeModal("dispatch-modal");
    dispatchLines = [];
    await switchOpsSubModule("dispatch");
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; btn.textContent = "📤 تنفيذ الصرف"; }
};

// ════════════════════════════════════════════════════
// VEHICLE LOAD (تحميل سيارة)
// ════════════════════════════════════════════════════
let vehicleLines = [];

function renderVehicleList(area, list) {
  if (!list.length) {
    area.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🚐</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات تحميل مسجلة</div></div>`;
    return;
  }
  area.innerHTML = `<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>من مخزن</th><th>إلى سيارة</th><th>المندوب</th><th>الأصناف</th><th>الحالة</th></tr></thead>
    <tbody>${list.map(d => `<tr>
      <td>${d.date||"—"}</td><td>${d.fromWarehouse||"—"}</td><td>${d.toWarehouse||"—"}</td>
      <td>${d.driver||"—"}</td><td class="mono">${(d.lines||[]).length} صنف</td>
      <td><span class="badge good" style="font-size:10px;">محمَّل</span></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`;
}

function renderVehicleReturnList(area, list) {
  area.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔄</div><div style="font-size:16px;font-weight:600;">عمليات الاستلام من السيارة: ${list.length}</div></div>`;
}

window.addVehicleItem = () => {
  const sel = document.getElementById("veh-item-sel");
  const qty = parseFloat(document.getElementById("veh-item-qty").value) || 1;
  if (!sel.value) { showToast("اختر صنفاً أولاً", "warn"); return; }
  const prod = products.find(p => p.id === sel.value);
  if (!prod) return;
  const existing = vehicleLines.find(l => l.productId === sel.value);
  if (existing) existing.qty += qty;
  else vehicleLines.push({ productId: sel.value, productName: prod.name, sku: prod.sku, qty, cost: prod.costPrice || 0 });
  const tbody = document.getElementById("veh-lines-tbody");
  if (tbody) tbody.innerHTML = vehicleLines.map((l,i) => `<tr>
    <td>${l.productName}</td>
    <td class="mono">${l.qty}</td>
    <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleLines.splice(${i},1); window.addVehicleItem();">✕</button></td>
  </tr>`).join("");
};

window.saveVehicleLoad = async () => {
  const errEl = document.getElementById("veh-error"); errEl.classList.add("hidden");
  const srcWh = document.getElementById("veh-src-wh").value;
  const dstWh = document.getElementById("veh-dst-wh").value;
  const date  = document.getElementById("veh-date").value;
  const driver = document.getElementById("veh-driver").value.trim();
  const notes = document.getElementById("veh-notes").value.trim();
  if (!srcWh || !dstWh || !date || !vehicleLines.length) {
    errEl.textContent = "يرجى تحديد المخازن والتاريخ والأصناف"; errEl.classList.remove("hidden"); return;
  }
  const srcW = warehouses.find(w => w.id === srcWh);
  const dstW = warehouses.find(w => w.id === dstWh);
  const btn = document.getElementById("save-veh-btn"); btn.disabled = true;
  try {
    for (const l of vehicleLines) {
      await adjustStock({ productId: l.productId, warehouseId: srcWh, qty: -l.qty, cost: l.cost, type: "out", refType: "vehicle-load" });
      await adjustStock({ productId: l.productId, warehouseId: dstWh, qty:  l.qty, cost: l.cost, type: "in",  refType: "vehicle-load" });
    }
    await create(COLS.inventoryAdjustments(), {
      opType: "vehicle-load", date, fromWarehouse: srcW?.name, toWarehouse: dstW?.name,
      fromWarehouseId: srcWh, toWarehouseId: dstWh, driver, lines: vehicleLines, notes, createdAt: new Date()
    });
    showToast(`✅ تم تحميل ${vehicleLines.length} صنف على السيارة`, "success");
    closeModal("vehicle-modal");
    vehicleLines = [];
    await switchOpsSubModule("vehicle");
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; btn.textContent = "🚐 تأكيد التحميل"; }
};

// ════════════════════════════════════════════════════
// SPOT COUNT (جرد مفاجئ)
// ════════════════════════════════════════════════════
window.spotCountLines = [];

function renderSpotCountList(area, list) {
  if (!list.length) {
    area.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔢</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات جرد مسجلة</div></div>`;
    return;
  }
  area.innerHTML = `<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الأصناف</th><th>الفروقات</th><th>الملاحظات</th><th class="no-print" style="text-align:center;">إجراءات</th></tr></thead>
    <tbody>${list.map(d => `<tr>
      <td>${d.date||"—"}</td><td>${d.warehouseName||"—"}</td>
      <td class="mono">${(d.lines||[]).length}</td>
      <td class="mono ${(d.variances||0)>0?"text-bad":""}">${d.variances||0}</td>
      <td class="dim">${d.notes||"—"}</td>
      <td class="no-print" style="text-align:center; display:flex; gap:6px; justify-content:center;">
        <button class="btn btn-sm btn-ghost text-primary" onclick="window.showSpotCountDetail('${d.id}')">👁️ معاينة وتفاصيل</button>
        <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printSpotCountById('${d.id}')">🖨️ طباعة</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteSpotCount('${d.id}')">❌ حذف وتراجع</button>
      </td>
    </tr>`).join("")}</tbody>
  </table></div></div>`;
}

window.loadSpotCountItems = async () => {
  const whId1 = document.getElementById("sc-wh").value;
  const whId2 = document.getElementById("sc-wh2").value;
  if (!whId1) { showToast("اختر المخزن الأول أولاً", "warn"); return; }
  const btn = document.getElementById("load-sc-btn"); btn.disabled = true; btn.textContent = "جارٍ التحميل…";
  try {
    // Load current stock balances for both warehouses and all products
    const [prodSnap, stockSnap] = await Promise.all([
      getDocs(query(COLS.products(), orderBy("name"), limit(200))),
      getDocs(COLS.stockByWarehouse())
    ]);

    const stockMap = {};
    stockSnap.forEach(doc => {
      stockMap[doc.id] = doc.data().qty || 0;
    });

    window.spotCountLines = prodSnap.docs.map(d => {
      const p = { id: d.id, ...d.data() };
      const bookQty1 = stockMap[`${whId1}_${p.id}`] || 0;
      const bookQty2 = whId2 ? (stockMap[`${whId2}_${p.id}`] || 0) : 0;
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku || "",
        bookQty1,
        actualQty1: bookQty1,
        bookQty2,
        actualQty2: bookQty2
      };
    });

    const thead = document.getElementById("sc-table-thead");
    const tbody = document.getElementById("sc-lines-tbody");

    const whName1 = warehouses.find(w => w.id === whId1)?.name || "مخزن 1";
    const whName2 = whId2 ? (warehouses.find(w => w.id === whId2)?.name || "مخزن 2") : "";

    if (whId2) {
      if (thead) {
        thead.innerHTML = `<tr>
          <th>الصنف</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">دفتر (${whName1})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">فعلي (${whName1})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">الفرق</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">دفتر (${whName2})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">فعلي (${whName2})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">الفرق</th>
        </tr>`;
      }
      if (tbody) {
        tbody.innerHTML = window.spotCountLines.map((l, i) => `<tr>
          <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
          <td class="mono">${formatQuantity(l.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${l.actualQty1}" step="0.001"
            oninput="window.spotCountLines[${i}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${i}, this)" /></td>
          <td id="sc-diff1-${i}" class="mono">0</td>
          <td class="mono">${formatQuantity(l.bookQty2)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${l.actualQty2}" step="0.001"
            oninput="window.spotCountLines[${i}].actualQty2=parseFloat(this.value)||0; window.updateSCDiff2(${i}, this)" /></td>
          <td id="sc-diff2-${i}" class="mono">0</td>
        </tr>`).join("");
      }
    } else {
      if (thead) {
        thead.innerHTML = `<tr>
          <th>الصنف</th>
          <th>الكمية الدفترية</th>
          <th>الكمية الفعلية</th>
          <th>الفرق</th>
        </tr>`;
      }
      if (tbody) {
        tbody.innerHTML = window.spotCountLines.map((l, i) => `<tr>
          <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
          <td class="mono">${formatQuantity(l.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:90px; padding:4px;" value="${l.actualQty1}" step="0.001"
            oninput="window.spotCountLines[${i}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${i}, this)" /></td>
          <td id="sc-diff1-${i}" class="mono">0</td>
        </tr>`).join("");
      }
    }

    document.getElementById("save-sc-btn").disabled = false;
    showToast(`تم تحميل ${window.spotCountLines.length} صنف بنجاح`, "success");
  } catch(err) { showToast(err.message, "error"); }
  finally { btn.disabled = false; btn.textContent = "📥 تحميل أصناف المخزن"; }
};

window.updateSCDiff1 = (i, input) => {
  const line = window.spotCountLines[i];
  if (!line) return;
  line.actualQty1 = parseFloat(input.value) || 0;
  const diff = line.actualQty1 - line.bookQty1;
  const el = document.getElementById(`sc-diff1-${i}`);
  if (el) {
    el.textContent = diff >= 0 ? `+${formatQuantity(diff)}` : formatQuantity(diff);
    el.className = `mono ${diff !== 0 ? (diff < 0 ? "text-bad" : "text-good") : ""}`;
  }
};

window.updateSCDiff2 = (i, input) => {
  const line = window.spotCountLines[i];
  if (!line) return;
  line.actualQty2 = parseFloat(input.value) || 0;
  const diff = line.actualQty2 - line.bookQty2;
  const el = document.getElementById(`sc-diff2-${i}`);
  if (el) {
    el.textContent = diff >= 0 ? `+${formatQuantity(diff)}` : formatQuantity(diff);
    el.className = `mono ${diff !== 0 ? (diff < 0 ? "text-bad" : "text-good") : ""}`;
  }
};

window.saveSpotCount = async () => {
  const errEl = document.getElementById("sc-error"); errEl.classList.add("hidden");
  const whId1 = document.getElementById("sc-wh").value;
  const whId2 = document.getElementById("sc-wh2").value;
  const date = document.getElementById("sc-date").value;
  const notes = document.getElementById("sc-notes").value.trim();
  if (!whId1 || !date || !window.spotCountLines.length) {
    errEl.textContent = "يرجى إكمال البيانات"; errEl.classList.remove("hidden"); return;
  }
  const wh1 = warehouses.find(w => w.id === whId1);
  const wh2 = whId2 ? warehouses.find(w => w.id === whId2) : null;
  const btn = document.getElementById("save-sc-btn"); btn.disabled = true; btn.textContent = "جارٍ الاعتماد…";
  try {
    let totalAdjustments = 0;
    
    // Process Warehouse 1 variances
    const linesWithDiff1 = window.spotCountLines.filter(l => l.actualQty1 !== l.bookQty1);
    for (const l of linesWithDiff1) {
      const diff1 = l.actualQty1 - l.bookQty1;
      await adjustStock(whId1, l.productId, diff1, {
        type: "spot-count",
        refType: "spot-count",
        note: `تسوية جرد مفاجئ - ${wh1?.name || "مخزن 1"}`
      });
      totalAdjustments++;
    }

    // Process Warehouse 2 variances
    let linesWithDiff2 = [];
    if (whId2) {
      linesWithDiff2 = window.spotCountLines.filter(l => l.actualQty2 !== l.bookQty2);
      for (const l of linesWithDiff2) {
        const diff2 = l.actualQty2 - l.bookQty2;
        await adjustStock(whId2, l.productId, diff2, {
          type: "spot-count",
          refType: "spot-count",
          note: `تسوية جرد مفاجئ - ${wh2?.name || "مخزن 2"}`
        });
        totalAdjustments++;
      }
    }

    await create(COLS.inventoryAdjustments(), {
      opType: "spot-count",
      date,
      warehouseId: whId1,
      warehouseName: wh1?.name || "",
      warehouseId2: whId2 || "",
      warehouseName2: wh2?.name || "",
      lines: window.spotCountLines,
      variances: linesWithDiff1.length + linesWithDiff2.length,
      notes,
      createdAt: new Date()
    });

    showToast(`✅ تم اعتماد الجرد — تم إنشاء ${totalAdjustments} تسوية مخزنية`, "success");
    closeModal("spot-count-modal");
    window.spotCountLines = [];
    await switchOpsSubModule("spot-count");
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; btn.textContent = "✅ اعتماد الجرد وإنشاء تسويات"; }
};

// ════════════════════════════════════════════════════
// REVALUE (إعادة تقييم المخزون)
// ════════════════════════════════════════════════════
function renderRevalueList(area, list) {
  if (!list.length) {
    area.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">💰</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات إعادة تقييم مسجلة</div></div>`;
    return;
  }
  area.innerHTML = `<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الصنف</th><th>التكلفة القديمة</th><th>التكلفة الجديدة</th><th>الفرق</th><th>السبب</th></tr></thead>
    <tbody>${list.map(d => {
      const diff = (d.newCost||0) - (d.oldCost||0);
      return `<tr>
        <td>${d.date||"—"}</td><td>${d.warehouseName||"—"}</td><td>${d.productName||"—"}</td>
        <td class="mono">${formatCurrency(d.oldCost||0)}</td>
        <td class="mono">${formatCurrency(d.newCost||0)}</td>
        <td class="mono ${diff<0?"text-bad":"text-good"}">${diff>=0?"+":""}${formatCurrency(diff)}</td>
        <td class="dim">${d.notes||"—"}</td>
      </tr>`;
    }).join("")}</tbody>
  </table></div></div>`;
}

window.saveRevalue = async () => {
  const errEl = document.getElementById("rv-error"); errEl.classList.add("hidden");
  const whId    = document.getElementById("rv-wh").value;
  const prodId  = document.getElementById("rv-product").value;
  const newCost = parseFloat(document.getElementById("rv-new-cost").value);
  const date    = document.getElementById("rv-date").value;
  const notes   = document.getElementById("rv-notes").value.trim();
  if (!whId || !prodId || !newCost || !date || !notes) {
    errEl.textContent = "يرجى إكمال جميع الحقول المطلوبة"; errEl.classList.remove("hidden"); return;
  }
  const wh   = warehouses.find(w => w.id === whId);
  const prod = products.find(p => p.id === prodId);
  const oldCost = prod?.costPrice || 0;
  const btn = document.getElementById("save-rv-btn"); btn.disabled = true;
  try {
    // Update product cost price
    await update("products", prodId, { costPrice: newCost, lastRevalueDate: date, lastRevalueBy: "system" });
    // Record the revalue event
    await create(COLS.inventoryAdjustments(), {
      opType: "revalue", date, warehouseId: whId, warehouseName: wh?.name,
      productId: prodId, productName: prod?.name, oldCost, newCost, notes, createdAt: new Date()
    });
    showToast(`✅ تم تحديث التكلفة من ${formatCurrency(oldCost)} إلى ${formatCurrency(newCost)}`, "success");
    closeModal("revalue-modal");
    await switchOpsSubModule("revalue");
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; btn.textContent = "💰 تطبيق إعادة التقييم"; }
};

// ════════════════════════════════════════════════════
// OPEN OPS MODAL — Extended
// ════════════════════════════════════════════════════
const _origOpenOpsModal = window.openOpsModal;
window.openOpsModal = async () => {
  if (activeSubModule === 'dispatch') {
    dispatchLines = [];
    renderDspLines();
    openModal("dispatch-modal");
  } else if (activeSubModule === 'vehicle') {
    vehicleLines = [];
    const tbody = document.getElementById("veh-lines-tbody");
    if (tbody) tbody.innerHTML = "";
    openModal("vehicle-modal");
  } else if (activeSubModule === 'vehicle-return') {
    showToast("استخدم تحويل بضاعة لاستلام المرتجع من السيارة", "warn");
  } else if (activeSubModule === 'spot-count') {
    window.spotCountLines = [];
    const thead = document.getElementById("sc-table-thead");
    if (thead) {
      thead.innerHTML = `<tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr>`;
    }
    const tbody = document.getElementById("sc-lines-tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">اختر المخزن لتحميل الأصناف</td></tr>`;
    document.getElementById("save-sc-btn").disabled = true;
    const wh2Select = document.getElementById("sc-wh2");
    if (wh2Select) wh2Select.value = "";
    openModal("spot-count-modal");
  } else if (activeSubModule === 'revalue') {
    document.getElementById("rv-old-cost").value = "";
    document.getElementById("rv-new-cost").value = "";
    document.getElementById("rv-notes").value = "";
    openModal("revalue-modal");
  } else if (_origOpenOpsModal) {
    _origOpenOpsModal();
  }
};

// ── Spot Count Extended Operations ──
let activeDetailSC = null;

window.showSpotCountDetail = async (id) => {
  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) { showToast("المعاملة غير موجودة", "error"); return; }
    const sc = snap.data();
    sc.id = snap.id;
    activeDetailSC = sc;

    const hasWh2 = sc.warehouseId2 && sc.warehouseId2 !== "";

    // إحصائيات للملخص
    const totalLines    = (sc.lines||[]).length;
    const linesWithDiff = (sc.lines||[]).filter(l => {
      const a = l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty ?? 0);
      const b = l.bookQty1   !== undefined ? l.bookQty1   : (l.bookQty   ?? 0);
      return a !== b;
    });
    const shortages = linesWithDiff.filter(l => {
      const a = l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty ?? 0);
      const b = l.bookQty1   !== undefined ? l.bookQty1   : (l.bookQty   ?? 0);
      return a < b;
    }).length;
    const surpluses = linesWithDiff.length - shortages;

    const statsHtml = `
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#16a34a;">${totalLines}</div>
          <div style="font-size:11px;color:#166534;">إجمالي الأصناف</div>
        </div>
        <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#ea580c;">${linesWithDiff.length}</div>
          <div style="font-size:11px;color:#9a3412;">فروقات</div>
        </div>
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#dc2626;">${shortages}</div>
          <div style="font-size:11px;color:#991b1b;">عجز (ناقص)</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#1d4ed8;">${surpluses}</div>
          <div style="font-size:11px;color:#1e3a8a;">فائض (زائد)</div>
        </div>
      </div>`;

    const detailHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:8px;" class="no-print">
        <div style="font-weight:700; color:var(--brand); font-size:14px;">📄 مستند جرد مفاجئ (${sc.date || ""})</div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary btn-sm" onclick="window.printActiveSpotCount()">🖨️ طباعة التقرير</button>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('spot-count-detail-modal'); window.deleteSpotCount('${sc.id}')">❌ حذف وتراجع</button>
        </div>
      </div>
      <div class="grid-3 gap-16 mb-16" style="border-bottom:1px solid var(--border-soft); padding-bottom:12px;">
        <div><strong>تاريخ الجرد:</strong> <span class="mono">${sc.date || "—"}</span></div>
        <div><strong>المخزن الأول:</strong> <span>${sc.warehouseName || "—"}</span></div>
        ${hasWh2 ? `<div><strong>المخزن الثاني:</strong> <span>${sc.warehouseName2 || "—"}</span></div>` : "<div></div>"}
      </div>
      <div class="mb-16"><strong>ملاحظات:</strong> <span>${sc.notes || "—"}</span></div>
      ${statsHtml}
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            ${hasWh2 ? `
              <tr>
                <th>الصنف</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">دفتر (${sc.warehouseName})</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">فعلي (${sc.warehouseName})</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">الفرق</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">دفتر (${sc.warehouseName2})</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">فعلي (${sc.warehouseName2})</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">الفرق</th>
              </tr>` : `
              <tr>
                <th>الصنف</th>
                <th>الكمية الدفترية</th>
                <th>الكمية الفعلية</th>
                <th>الفرق</th>
              </tr>`}
          </thead>
          <tbody>
            ${(sc.lines || []).map(l => {
              if (hasWh2) {
                const diff1 = (l.actualQty1??0) - (l.bookQty1??0);
                const diff2 = (l.actualQty2??0) - (l.bookQty2??0);
                return `<tr>
                  <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
                  <td class="mono">${formatQuantity(l.bookQty1)}</td>
                  <td class="mono">${formatQuantity(l.actualQty1)}</td>
                  <td class="mono ${diff1!==0?(diff1<0?"text-bad":"text-good"):""}"><strong>${diff1>=0?"+":""}${formatQuantity(diff1)}</strong></td>
                  <td class="mono">${formatQuantity(l.bookQty2)}</td>
                  <td class="mono">${formatQuantity(l.actualQty2)}</td>
                  <td class="mono ${diff2!==0?(diff2<0?"text-bad":"text-good"):""}"><strong>${diff2>=0?"+":""}${formatQuantity(diff2)}</strong></td>
                </tr>`;
              } else {
                const actual = l.actualQty1!==undefined?l.actualQty1:(l.actualQty??0);
                const book   = l.bookQty1!==undefined?l.bookQty1:(l.bookQty??0);
                const diff   = actual - book;
                const rowBg  = diff!==0?(diff<0?"background:#fff5f5;":"background:#f0fdf4;"):"";
                return `<tr style="${rowBg}">
                  <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
                  <td class="mono">${formatQuantity(book)}</td>
                  <td class="mono">${formatQuantity(actual)}</td>
                  <td class="mono ${diff!==0?(diff<0?"text-bad":"text-good"):""}"><strong>${diff>=0?"+":""}${formatQuantity(diff)}</strong></td>
                </tr>`;
              }
            }).join("")}
          </tbody>
        </table>
      </div>`;

    document.getElementById("sc-detail-body").innerHTML = detailHtml;
    openModal("spot-count-detail-modal");
  } catch(e) { showToast(e.message, "error"); }
};



window.deleteSpotCount = async (id) => {
  if (!confirm("هل أنت متأكد من حذف هذه المعاملة؟ سيتم التراجع عن جميع تسويات الكميات في المخازن وإعادة الأرصدة لوضعها السابق.")) return;
  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) { showToast("المعاملة غير موجودة", "error"); return; }
    const sc = snap.data();
    
    const hasWh2 = sc.warehouseId2 && sc.warehouseId2 !== "";
    
    // 1. Reverse Wh1 adjustments
    const lines1 = (sc.lines || []).filter(l => {
      const actual = l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty !== undefined ? l.actualQty : 0);
      const book = l.bookQty1 !== undefined ? l.bookQty1 : (l.bookQty !== undefined ? l.bookQty : 0);
      return actual !== book;
    });
    for (const l of lines1) {
      const actual = l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty !== undefined ? l.actualQty : 0);
      const book = l.bookQty1 !== undefined ? l.bookQty1 : (l.bookQty !== undefined ? l.bookQty : 0);
      const diff1 = actual - book;
      await adjustStock(sc.warehouseId, l.productId, -diff1, {
        type: "spot-count-reversal",
        refType: "spot-count-reversal",
        note: `إلغاء تسوية جرد - تراجع`
      });
    }
    
    // 2. Reverse Wh2 adjustments
    if (hasWh2) {
      const lines2 = (sc.lines || []).filter(l => l.actualQty2 !== l.bookQty2);
      for (const l of lines2) {
        const diff2 = l.actualQty2 - l.bookQty2;
        await adjustStock(sc.warehouseId2, l.productId, -diff2, {
          type: "spot-count-reversal",
          refType: "spot-count-reversal",
          note: `إلغاء تسوية جرد - تراجع`
        });
      }
    }
    
    // 3. Delete doc cleanly
    await remove("inventoryAdjustments", id);
    showToast("✅ تم حذف المعاملة والتراجع عن جميع تسويات المخزون بنجاح", "success");
    await switchOpsSubModule("spot-count");
  } catch(e) { showToast(e.message, "error"); }
};

// ── بناء HTML الطباعة ──
function buildSpotCountPrintHTML(sc) {
  const hasWh2 = sc.warehouseId2 && sc.warehouseId2 !== "";
  const totalLines = (sc.lines||[]).length;
  const linesWithDiff = (sc.lines||[]).filter(l => {
    const a = l.actualQty1!==undefined?l.actualQty1:(l.actualQty??0);
    const b = l.bookQty1!==undefined?l.bookQty1:(l.bookQty??0);
    return a !== b;
  });
  const shortages = linesWithDiff.filter(l => {
    const a = l.actualQty1!==undefined?l.actualQty1:(l.actualQty??0);
    const b = l.bookQty1!==undefined?l.bookQty1:(l.bookQty??0);
    return a < b;
  }).length;
  return `<html dir="rtl" lang="ar"><head><meta charset="UTF-8">
  <title>جرد مفاجئ - ${sc.date||""}</title>
  <style>
    *{box-sizing:border-box} body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;padding:20px;color:#1f2937;font-size:13px;direction:rtl}
    .hdr{text-align:center;margin-bottom:20px;border-bottom:3px solid #5b3ec2;padding-bottom:12px}
    .hdr h1{margin:0;color:#5b3ec2;font-size:20px} .hdr p{margin:4px 0 0;color:#6b7280;font-size:12px}
    .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .mi{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px}
    .mi label{font-size:11px;color:#6b7280;display:block} .mi span{font-weight:600}
    .stats{display:flex;gap:10px;margin-bottom:16px}
    .st{flex:1;border-radius:6px;padding:8px;text-align:center;border:1px solid}
    .st .n{font-size:20px;font-weight:700} .st .l{font-size:11px;margin-top:2px}
    .s0{background:#f0fdf4;border-color:#86efac;color:#15803d}
    .s1{background:#fff7ed;border-color:#fdba74;color:#c2410c}
    .s2{background:#fef2f2;border-color:#fca5a5;color:#b91c1c}
    .s3{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#5b3ec2;color:#fff;padding:7px 10px;text-align:right;font-weight:600}
    td{border:1px solid #e5e7eb;padding:6px 10px;text-align:right}
    tr:nth-child(even) td{background:#f9fafb}
    .deficit td{background:#fff5f5!important} .surplus td{background:#f0fdf4!important}
    .bad{color:#dc2626;font-weight:700} .good{color:#16a34a;font-weight:700}
    .mono{font-family:monospace} .dim{color:#9ca3af;font-size:11px}
    .footer{margin-top:20px;border-top:1px solid #e5e7eb;padding-top:10px;display:flex;justify-content:space-between;font-size:11px;color:#6b7280}
    @media print{body{padding:8px} @page{margin:1cm}}
  </style></head><body>
  <div class="hdr"><h1>🔢 تقرير جرد مفاجئ (Spot Count)</h1><p>إدهام للمواد الغذائية — نظام ERP</p></div>
  <div class="meta">
    <div class="mi"><label>تاريخ الجرد</label><span>${sc.date||"—"}</span></div>
    <div class="mi"><label>المخزن الأول</label><span>${sc.warehouseName||"—"}</span></div>
    ${hasWh2?`<div class="mi"><label>المخزن الثاني</label><span>${sc.warehouseName2||"—"}</span></div>`:`<div class="mi"><label>ملاحظات</label><span>${sc.notes||"—"}</span></div>`}
  </div>
  <div class="stats">
    <div class="st s0"><div class="n">${totalLines}</div><div class="l">إجمالي</div></div>
    <div class="st s1"><div class="n">${linesWithDiff.length}</div><div class="l">فروقات</div></div>
    <div class="st s2"><div class="n">${shortages}</div><div class="l">عجز</div></div>
    <div class="st s3"><div class="n">${linesWithDiff.length-shortages}</div><div class="l">فائض</div></div>
  </div>
  <table><thead><tr><th>#</th><th>الصنف</th><th>كود</th>
    ${hasWh2?`<th>دفتر (${sc.warehouseName})</th><th>فعلي</th><th>فرق</th><th>دفتر (${sc.warehouseName2})</th><th>فعلي</th><th>فرق</th>`:`<th>الدفتري</th><th>الفعلي</th><th>الفرق</th>`}
  </tr></thead><tbody>
    ${(sc.lines||[]).map((l,i)=>{
      if(hasWh2){
        const d1=(l.actualQty1??0)-(l.bookQty1??0),d2=(l.actualQty2??0)-(l.bookQty2??0);
        const rc=(d1!==0||d2!==0)?(d1<0||d2<0?"deficit":"surplus"):"";
        return `<tr class="${rc}"><td class="mono dim">${i+1}</td><td>${l.productName}</td><td class="mono dim">${l.sku||""}</td><td class="mono">${l.bookQty1??0}</td><td class="mono">${l.actualQty1??0}</td><td class="mono ${d1<0?"bad":d1>0?"good":""}">  ${d1>=0?"+":""}${d1}</td><td class="mono">${l.bookQty2??0}</td><td class="mono">${l.actualQty2??0}</td><td class="mono ${d2<0?"bad":d2>0?"good":""}">  ${d2>=0?"+":""}${d2}</td></tr>`;
      } else {
        const a=l.actualQty1!==undefined?l.actualQty1:(l.actualQty??0);
        const b=l.bookQty1!==undefined?l.bookQty1:(l.bookQty??0);
        const d=a-b; const rc=d!==0?(d<0?"deficit":"surplus"):"";
        return `<tr class="${rc}"><td class="mono dim">${i+1}</td><td>${l.productName}</td><td class="mono dim">${l.sku||""}</td><td class="mono">${b}</td><td class="mono">${a}</td><td class="mono ${d<0?"bad":d>0?"good":""}"><strong>${d>=0?"+":""}${d}</strong></td></tr>`;
      }
    }).join("")}
  </tbody></table>
  <div class="footer"><span>طباعة: ${new Date().toLocaleDateString("ar-SA",{dateStyle:"full"})}</span><span>إدهام ERP</span></div>
  </body></html>`;
}

// طباعة من المودال
window.printActiveSpotCount = () => {
  if (!activeDetailSC) return;
  window._doPrintSpotCount(activeDetailSC);
};

// طباعة مباشرة من القائمة
window.printSpotCountById = async (id) => {
  try {
    showToast("⏳ جارٍ تحضير التقرير…", "info");
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id));
    if (!snap.exists()) { showToast("الجرد غير موجود", "error"); return; }
    window._doPrintSpotCount({ id: snap.id, ...snap.data() });
  } catch(e) { showToast(e.message, "error"); }
};

// الدالة الأساسية للطباعة — تستخدم iframe مخفي (لا يُحجب)
window._doPrintSpotCount = (sc) => {
  const old = document.getElementById("_sc-print-frame");
  if (old) old.remove();
  const html   = buildSpotCountPrintHTML(sc);
  const iframe = document.createElement("iframe");
  iframe.id    = "_sc-print-frame";
  iframe.style.cssText = "position:fixed;width:0;height:0;border:none;left:-9999px;top:-9999px;";
  document.body.appendChild(iframe);
  
  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open();
  iDoc.write(html);
  iDoc.close();
  
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch(e) {
      const w = window.open("","_blank","width=900,height=700");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    }
  }, 150);
};

// ── Inventory Adjustment Helpers (Autocomplete, Print, Edit, Delete) ──
// ── Inventory Adjustment Helpers (Autocomplete, Print, Edit, Delete, Lines Management) ──
window._adjLines = [];

function setupAdjProductAutocomplete() {
  const searchInput = document.getElementById("adj-product-search");
  const resultsDiv = document.getElementById("adj-product-results");
  const idInput = document.getElementById("adj-product");

  if (!searchInput || !resultsDiv) return;

  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (!val) {
      resultsDiv.classList.add("hidden");
      resultsDiv.innerHTML = "";
      return;
    }

    const matches = products.filter(p => 
      (p.name || "").toLowerCase().includes(val) || 
      (p.sku || "").toLowerCase().includes(val) ||
      (p.barcode || "").toLowerCase().includes(val)
    ).slice(0, 10);

    if (matches.length === 0) {
      resultsDiv.innerHTML = `<div style="padding:10px; color:var(--text-dim); text-align:center;">لا توجد أصناف تطابق البحث</div>`;
      resultsDiv.classList.remove("hidden");
      return;
    }

    resultsDiv.innerHTML = matches.map(p => {
      const bestCost = p.averageCost || p.costPrice || 0;
      return `
      <div class="autocomplete-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft);" onclick="selectAdjProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${p.sku || ""}', ${bestCost})">
        <strong>${p.sku || ""}</strong> - ${p.name} <span style="font-size:10.5px; color:var(--text-dim);">متوسط التكلفة: ${formatCurrency(bestCost)}</span>
      </div>`;
    }).join("");
    resultsDiv.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.classList.add("hidden");
    }
  });
}

window.selectAdjProduct = (id, name, sku, costPrice) => {
  const searchInput = document.getElementById("adj-product-search");
  const idInput = document.getElementById("adj-product");
  const costEl = document.getElementById("adj-cost");
  const resultsDiv = document.getElementById("adj-product-results");

  if (idInput) idInput.value = id;
  if (searchInput) searchInput.value = `${sku ? sku + ' - ' : ''}${name}`;
  if (resultsDiv) resultsDiv.classList.add("hidden");
  if (costEl) costEl.value = costPrice ? costPrice.toFixed(2) : "0.00";
};

window.addAdjLine = () => {
  const idInput = document.getElementById("adj-product");
  const searchInput = document.getElementById("adj-product-search");
  const qtyInput = document.getElementById("adj-qty");
  const costInput = document.getElementById("adj-cost");

  const productId = idInput?.value;
  const qty = parseFloat(qtyInput?.value) || 0;
  const cost = parseFloat(costInput?.value) || 0;

  if (!productId) {
    showToast("يرجى اختيار صنف أولاً", "warn");
    return;
  }
  if (qty <= 0) {
    showToast("يرجى إدخال كمية صحيحة أكبر من صفر", "warn");
    return;
  }

  const prod = products.find(p => p.id === productId);
  if (!prod) {
    showToast("لم يتم العثور على الصنف المختار", "error");
    return;
  }

  // Check if item already exists in list
  const existingIdx = window._adjLines.findIndex(l => l.productId === productId);
  if (existingIdx !== -1) {
    window._adjLines[existingIdx].qty += qty;
    window._adjLines[existingIdx].totalCost = window._adjLines[existingIdx].qty * window._adjLines[existingIdx].cost;
  } else {
    window._adjLines.push({
      productId,
      productName: prod.name,
      sku: prod.sku,
      qty,
      cost,
      totalCost: qty * cost
    });
  }

  // Clear entry fields
  if (idInput) idInput.value = "";
  if (searchInput) searchInput.value = "";
  if (qtyInput) qtyInput.value = "1";
  if (costInput) costInput.value = "";

  renderAdjLinesTable();
};

window.removeAdjLine = (index) => {
  window._adjLines.splice(index, 1);
  renderAdjLinesTable();
};

function renderAdjLinesTable() {
  const tbody = document.getElementById("adj-items-tbody");
  const totalLabel = document.getElementById("adj-total-cost-label");
  if (!tbody) return;

  if (window._adjLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-dim); font-size:13px;">لا توجد أصناف مضافة بعد</td></tr>`;
    if (totalLabel) totalLabel.textContent = formatCurrency(0);
    return;
  }

  let totalCost = 0;
  tbody.innerHTML = window._adjLines.map((l, i) => {
    totalCost += l.totalCost;
    return `
      <tr>
        <td class="mono font-bold">${l.sku || "—"}</td>
        <td><strong>${l.productName}</strong></td>
        <td class="mono" style="text-align:center;">${l.qty}</td>
        <td class="mono" style="text-align:left;">${formatCurrency(l.cost)}</td>
        <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost)}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="removeAdjLine(${i})" title="حذف">✕</button>
        </td>
      </tr>
    `;
  }).join("");

  if (totalLabel) totalLabel.textContent = formatCurrency(totalCost);
}

window.printAdjDetail = async (id) => {
  const { getById } = await import("../utils/db.js");
  const adj = await getById("inventoryAdjustments", id);
  if (!adj) {
    showToast("لم يتم العثور على مستند التسوية للطباعة", "error");
    return;
  }

  const typeNameMap = {
    damage: "إعدام سلع تالفة",
    add: "تسوية إضافة (+)",
    deduct: "تسوية خصم (-)",
    "return-damaged": "مرتجع تالف للمورد",
    expired: "إعدام منتهي الصلاحية",
    donation: "تبرعات وهبات (سلة البركة)"
  };

  const lines = adj.lines || [
    {
      productId: adj.productId,
      productName: adj.productName || "—",
      sku: adj.sku || "—",
      qty: adj.qty || 0,
      cost: adj.costPrice || 0,
      totalCost: adj.totalCost || ((adj.costPrice || 0) * (adj.qty || 0))
    }
  ];

  const totalCost = adj.totalCost || lines.reduce((s, l) => s + (l.totalCost || 0), 0);

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
    <head>
      <title>سند تسوية مخزنية #${adj.id.slice(0, 8)}</title>
      <style>
        body { font-family: sans-serif; direction: rtl; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature { border-top: 1px dashed #333; width: 200px; text-align: center; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2>سند تسوية مخزنية</h2>
          <p>رقم السند: <strong>${adj.id.slice(0, 8).toUpperCase()}</strong></p>
        </div>
        <div style="text-align: left;">
          <p>التاريخ: ${adj.date}</p>
          <p>المستودع: ${adj.warehouseName || "المستودع الرئيسي"}</p>
        </div>
      </div>
      <div class="details">
        <div>نوع المعاملة: <strong>${typeNameMap[adj.type] || adj.type}</strong></div>
        <div>البيان / السبب: <strong>${adj.notes || "—"}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>رمز الصنف (SKU)</th>
            <th>اسم الصنف</th>
            <th style="text-align:center;">الكمية</th>
            <th style="text-align:left;">تكلفة الوحدة</th>
            <th style="text-align:left;">إجمالي التكلفة</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((l, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${l.sku || "—"}</td>
              <td>${l.productName || "—"}</td>
              <td style="text-align:center;">${l.qty}</td>
              <td style="text-align:left;">${formatCurrency(l.cost || 0)}</td>
              <td style="text-align:left;">${formatCurrency(l.totalCost || 0)}</td>
            </tr>
          `).join("")}
          <tr style="font-weight:bold; background:#f9f9f9;">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td style="text-align:left;">${formatCurrency(totalCost)}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="signature">توقيع أمين المستودع</div>
        <div class="signature">توقيع المدير المالي</div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

window.editAdjustment = async (id) => {
  try {
    const { getById } = await import("../utils/db.js");
    const adj = await getById("inventoryAdjustments", id);
    if (!adj) {
      showToast("لم يتم العثور على التسوية", "error");
      return;
    }

    window._editingAdjId = id;

    // Load header values
    document.getElementById("adj-type").value = adj.type || "damage";
    document.getElementById("adj-wh").value = adj.warehouseId || "";
    document.getElementById("adj-date").value = adj.date || todayString();
    document.getElementById("adj-notes").value = adj.notes || "";

    // Clear temp input fields
    document.getElementById("adj-product").value = "";
    document.getElementById("adj-product-search").value = "";
    document.getElementById("adj-qty").value = "1";
    document.getElementById("adj-cost").value = "";

    // Load lines with historical fallback
    if (adj.lines && Array.isArray(adj.lines)) {
      window._adjLines = adj.lines.map(l => ({ ...l }));
    } else {
      // Fallback for historical single-item adjustments
      window._adjLines = [
        {
          productId: adj.productId,
          productName: adj.productName || "—",
          sku: adj.sku || "—",
          qty: adj.qty || 0,
          cost: adj.costPrice || 0,
          totalCost: adj.totalCost || ((adj.costPrice || 0) * (adj.qty || 0))
        }
      ];
    }

    renderAdjLinesTable();

    const btn = document.getElementById("save-adj-btn");
    if (btn) btn.textContent = "💾 حفظ التعديلات وتحديث القيود";

    openModal("adj-modal");
  } catch (err) {
    showToast("خطأ أثناء تحميل التسوية: " + err.message, "error");
  }
};

window.deleteAdjustment = async (id) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذه التسوية نهائياً؟ سيتم استعادة الكميات في المخزن وحذف قيود اليومية المرتبطة بها.")) return;

  try {
    // ── 1. Load adjustment (using static imports already at module level) ──
    const adjRef = doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id);
    const adjSnap = await getDoc(adjRef);
    if (!adjSnap.exists()) {
      alert("لم يتم العثور على التسوية في قاعدة البيانات!");
      return;
    }
    const adj = { id: adjSnap.id, ...adjSnap.data() };
    const lines = adj.lines || [{ productId: adj.productId, qty: adj.qty }];

    // ── 2. Check if this adjustment actually changed stock ────────────────
    // Query the CORRECT collection: stockTransactions (not stockMovements)
    const movSnap = await getDocs(query(
      collection(db, `companies/${COMPANY_ID}/stockTransactions`),
      where("sourceId", "==", id)
    ));
    const hadStockImpact = !movSnap.empty;

    if (!hadStockImpact) {
      console.log(`[Delete] No stockTransactions for ${id} — skipping reversal (phantom record)`);
    } else {
      // ── 2b. Reverse stock (best-effort) ────────────────────────────────
      for (const l of lines) {
        if (!l.productId || !l.qty || !adj.warehouseId) continue;
        const reverseQty = (['damage','deduct','expired','return-damaged','donation'].includes(adj.type))
          ? +l.qty : -l.qty;
        try {
          await adjustStock(adj.warehouseId, l.productId, reverseQty, {
            type: "adjustment_delete", sourceType: "inventoryAdjustment", sourceId: id,
            allowNegative: true
          });
        } catch (sErr) {
          console.warn("[Delete] Stock reversal skipped for", l.productId, sErr.message);
        }
      }
    }

    // ── 3. Delete linked JEs (best-effort) ────────────────────────────────
    try {
      const { deleteJournalEntry } = await import("../utils/db.js");
      const jeSnap = await getDocs(query(
        collection(db, `companies/${COMPANY_ID}/journalEntries`),
        where("sourceId", "==", id)
      ));
      for (const jeDoc of jeSnap.docs) {
        try { await deleteJournalEntry(jeDoc.id); }
        catch (e) { console.warn("[Delete] JE delete failed:", e.message); }
      }
    } catch (jeErr) {
      console.warn("[Delete] JE query failed:", jeErr.message);
    }

    // ── 4. Delete the adjustment document (also clears ERP cache) ─────────
    await remove("inventoryAdjustments", id);

    showToast("تم حذف التسوية واسترداد المخزون وإلغاء القيود بنجاح ✅", "success");
    switchOpsSubModule("adjust");

  } catch (err) {
    console.error("[deleteAdjustment] Fatal error:", err);
    alert("❌ خطأ أثناء الحذف:\n\n" + err.message);
  }
};


