const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CEMoTDyX.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{t as P,g as T,a as u,f as y,o as N,u as F,_ as Q,x as M,e as G,d as S,C as O,r as Z,l as $}from"./index-CEMoTDyX.js";import{orderBy as w,query as I,getDocs as x,getDoc as V,doc as W,collection as J,where as K,limit as it}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let E=[],tt=[],k=[],C=[],X=[],g="request";async function Bt(e,o){e.innerHTML=`
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
          <div class="form-group"><label>تاريخ الطلب *</label><input type="date" id="pr-date" class="input" value="${P()}" /></div>
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
          <div class="form-group"><label>تاريخ الأمر *</label><input type="date" id="po-date" class="input" value="${P()}" /></div>
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
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="grpo-date" class="input" value="${P()}" /></div>
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
          <div class="form-group"><label>تاريخ الفحص *</label><input type="date" id="qi-date" class="input" value="${P()}" /></div>
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
          <div class="form-group"><label>تاريخ العملية</label><input type="date" id="asm-date" class="input" value="${P()}" /></div>
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
          <div class="form-group"><label>التاريخ *</label><input type="date" id="adj-date" class="input" value="${P()}" /></div>
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
  `,await Promise.all([lt(),switchOpsSubModule(g)])}async function lt(){const[e,o,t,s,a]=await Promise.all([T(u.products(),[w("sku")]),T(u.categories(),[w("name")]),T(u.warehouses(),[w("name")]),T(u.chartOfAccounts(),[w("code")]),T(u.suppliers(),[w("name")])]);E=e,tt=o,k=t,C=s,X=a;const d=k.map(b=>`<option value="${b.id}">${b.name}</option>`).join(""),n='<option value="">اختر...</option>'+E.map(b=>`<option value="${b.id}" data-cost="${b.costPrice||0}">${b.sku} - ${b.name}</option>`).join(""),i='<option value="">اختر المورد...</option>'+X.map(b=>`<option value="${b.id}">${b.name}</option>`).join(""),c='<option value="">كل الفئات</option>'+tt.map(b=>`<option value="${b.id}">${b.name}</option>`).join(""),r=document.getElementById("pr-item-cat");r&&(r.innerHTML=c);const p=document.getElementById("po-item-cat");p&&(p.innerHTML=c),document.getElementById("pr-wh").innerHTML=d,document.getElementById("po-wh").innerHTML=d,document.getElementById("grpo-wh").innerHTML=d,document.getElementById("qi-wh").innerHTML=d,document.getElementById("asm-wh").innerHTML=d,document.getElementById("adj-wh").innerHTML=d;const l=(b,f)=>{const h=document.getElementById(b);h&&(h.innerHTML=f)};l("dsp-wh",d),l("dsp-item-sel",n),l("veh-src-wh",d),l("veh-dst-wh",k.filter(b=>b.type==="Vehicle").map(b=>`<option value="${b.id}">${b.name}</option>`).join("")||d),l("veh-item-sel",n),l("sc-wh",d),l("sc-wh2",'<option value="">-- لا يوجد --</option>'+d),l("rv-wh",d),l("rv-product",n),document.getElementById("po-supplier").innerHTML=i,document.getElementById("pr-item-sel").innerHTML=n,document.getElementById("po-item-sel").innerHTML=n,document.getElementById("qi-product").innerHTML=n,document.getElementById("asm-product").innerHTML=n,document.getElementById("asm-component-sel").innerHTML=n;const m=document.getElementById("adj-product");m&&m.tagName==="SELECT"&&(m.innerHTML=n),xt();const v=new Date().toISOString().slice(0,10);["dsp-date","veh-date","sc-date","rv-date"].forEach(b=>{const f=document.getElementById(b);f&&!f.value&&(f.value=v)})}window.switchOpsSubModule=async e=>{g=e;const o=document.getElementById("ops-content-area");o.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>';try{if(e==="request"){const t=I(u.purchaseRequests(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));ct(o,a)}else if(e==="po"){const t=I(u.purchaseOrders(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));rt(o,a)}else if(e==="grpo"){const t=I(u.goodsReceiptPOs(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));pt(o,a)}else if(e==="inspect"){const t=I(u.qualityInspections(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));ut(o,a)}else if(e==="assemble"){const t=I(u.productAssemblies(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));mt(o,a)}else if(e==="adjust"){const t=I(u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>!d.opType);bt(o,a)}else if(e==="dispatch"){const t=I(u.stockDispatches?.()||u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="dispatch");ht(o,a)}else if(e==="vehicle"){const t=I(u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-load");yt(o,a)}else if(e==="vehicle-return"){const t=I(u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-return");vt(o,a)}else if(e==="spot-count"){const t=I(u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="spot-count");gt(o,a)}else if(e==="revalue"){const t=I(u.inventoryAdjustments(),w("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="revalue");ft(o,a)}}catch(t){o.innerHTML=`<div class="alert bad">${t.message}</div>`}};window.openOpsModal=async()=>{if(g==="request")D=[],document.getElementById("pr-lines-tbody").innerHTML="",document.getElementById("pr-notes").value="",openModal("pr-modal");else if(g==="po")H=[],document.getElementById("po-lines-tbody").innerHTML="",document.getElementById("po-notes").value="",openModal("po-modal");else if(g==="grpo"){const e=I(u.purchaseOrders(),w("createdAt","desc")),t=(await x(e)).docs.map(a=>({id:a.id,...a.data()})).filter(a=>a.status==="ordered"),s=document.getElementById("grpo-po-select");s.innerHTML='<option value="">اختر أمر شراء للتحويل...</option>'+t.map(a=>`<option value="${a.id}">${a.poNumber||a.id} — ${a.supplierName}</option>`).join(""),document.getElementById("grpo-lines-tbody").innerHTML='<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>',document.getElementById("save-grpo-btn").disabled=!0,openModal("grpo-modal")}else if(g==="inspect")document.getElementById("qi-batch").value="",document.getElementById("qi-temp").value="",document.getElementById("qi-notes").value="",openModal("qi-modal");else if(g==="assemble")R=[],document.getElementById("asm-lines-tbody").innerHTML="",document.getElementById("asm-qty").value="1",openModal("asm-modal");else if(g==="adjust"){window._editingAdjId=null,window._adjLines=[],document.getElementById("adj-notes").value="",document.getElementById("adj-product").value="";const e=document.getElementById("adj-product-search");e&&(e.value="");const o=document.getElementById("adj-cost");o&&(o.value="");const t=document.getElementById("adj-qty");t&&(t.value="1"),U();const s=document.getElementById("save-adj-btn");s&&(s.textContent="💾 حفظ المعاملة وإنشاء قيد"),openModal("adj-modal")}};let D=[];window.addPRItem=()=>{const e=document.getElementById("pr-item-sel"),o=parseInt(document.getElementById("pr-item-qty").value)||0;if(!e.value||o<=0)return;const t=E.find(s=>s.id===e.value);D.some(s=>s.productId===e.value)||(D.push({productId:e.value,name:t.name,sku:t.sku,qty:o}),ot())};function ot(){document.getElementById("pr-lines-tbody").innerHTML=D.map((e,o)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePRItem(${o})">×</button></td>
    </tr>
  `).join("")}window.removePRItem=e=>{D.splice(e,1),ot()};window.savePurchaseRequest=async()=>{const e=document.getElementById("pr-error");if(e.classList.add("hidden"),!D.length){e.textContent="يرجى إضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const o=document.getElementById("save-pr-btn");o.disabled=!0;try{const t=document.getElementById("pr-wh").value;await N(u.purchaseRequests(),{date:document.getElementById("pr-date").value,warehouseId:t,warehouseName:k.find(s=>s.id===t)?.name,items:D,notes:document.getElementById("pr-notes").value.trim(),status:"pending_approval"}),showToast("تم تقديم طلب الشراء للاعتماد","success"),closeModal("pr-modal"),switchOpsSubModule("request")}catch(t){e.textContent=t.message,e.classList.remove("hidden")}finally{o.disabled=!1}};function ct(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📝</div><p>لا توجد طلبات شراء مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>المستودع</th><th>الأصناف المطلوبة</th><th>البيان</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${o.map(t=>`
          <tr>
            <td>${t.date}</td>
            <td><strong>${t.warehouseName}</strong></td>
            <td>${(t.items||[]).map(s=>`${s.name} (${s.qty})`).join("، ")}</td>
            <td>${t.notes||"—"}</td>
            <td>
              <span class="badge ${t.status==="approved"?"good":t.status==="rejected"?"bad":"warn"}">
                ${t.status==="approved"?"موافق عليه":t.status==="rejected"?"مرفوض":"قيد الانتظار"}
              </span>
            </td>
            <td class="no-print">
              ${t.status==="pending_approval"?`
                <button class="btn btn-sm btn-ghost text-good" onclick="approvePR('${t.id}', 'approved')">✔️ موافقة</button>
                <button class="btn btn-sm btn-ghost text-bad" onclick="approvePR('${t.id}', 'rejected')">❌ رفض</button>
              `:"—"}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.approvePR=async(e,o)=>{if(confirm(`هل تريد تأكيد ${o==="approved"?"اعتماد":"رفض"} هذا الطلب؟`))try{await F("purchaseRequests",e,{status:o}),showToast("تم تحديث حالة طلب الشراء","success"),switchOpsSubModule("request")}catch(t){showToast(t.message,"error")}};let H=[];window.onPOSelItemChange=e=>{const o=document.getElementById("po-item-sel"),t=o.options[o.selectedIndex],s=parseFloat(t.getAttribute("data-cost"))||0;document.getElementById("po-item-cost").value=s.toFixed(2)};window.filterOpsProducts=(e,o)=>{const t=document.getElementById(e);if(!t)return;const s=o?E.filter(a=>a.category===o):E;if(t.innerHTML='<option value="">اختر...</option>'+s.map(a=>`<option value="${a.id}" data-cost="${a.costPrice||0}">${a.sku} - ${a.name}</option>`).join(""),e==="po-item-sel"){const a=document.getElementById("po-item-cost");a&&(a.value="0.00")}};window.addPOItem=()=>{const e=document.getElementById("po-item-sel"),o=parseInt(document.getElementById("po-item-qty").value)||0,t=parseFloat(document.getElementById("po-item-cost").value)||0;if(!e.value||o<=0||t<0)return;const s=E.find(a=>a.id===e.value);H.some(a=>a.productId===e.value)||(H.push({productId:e.value,name:s.name,sku:s.sku,qty:o,unitPrice:t}),st())};function st(){document.getElementById("po-lines-tbody").innerHTML=H.map((e,o)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td class="mono">${y(e.unitPrice)}</td>
      <td class="mono font-bold">${y(e.qty*e.unitPrice)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePOItem(${o})">×</button></td>
    </tr>
  `).join("")}window.removePOItem=e=>{H.splice(e,1),st()};window.savePurchaseOrder=async()=>{const e=document.getElementById("po-error");e.classList.add("hidden");const o=document.getElementById("po-supplier").value,t=document.getElementById("po-wh").value;if(!o||!t||!H.length){e.textContent="يرجى اختيار المورد والمستودع وإضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const s=document.getElementById("save-po-btn");s.disabled=!0;try{const a=`PO-${Date.now().toString().substring(6)}`;await N(u.purchaseOrders(),{poNumber:a,date:document.getElementById("po-date").value,supplierId:o,supplierName:X.find(d=>d.id===o)?.name,warehouseId:t,warehouseName:k.find(d=>d.id===t)?.name,items:H,notes:document.getElementById("po-notes").value.trim(),status:"ordered"}),showToast("تم إصدار أمر الشراء بنجاح","success"),closeModal("po-modal"),switchOpsSubModule("po")}catch(a){e.textContent=a.message,e.classList.remove("hidden")}finally{s.disabled=!1}};function rt(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📜</div><p>لا توجد أوامر شراء مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الأمر</th><th>التاريخ</th><th>المورد</th><th>المستودع</th><th>القيمة الإجمالية</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${o.map(t=>{const s=(t.items||[]).reduce((a,d)=>a+d.qty*d.unitPrice,0);return`
            <tr>
              <td class="mono font-bold">${t.poNumber}</td>
              <td>${t.date}</td>
              <td><strong>${t.supplierName}</strong></td>
              <td>${t.warehouseName}</td>
              <td class="mono font-bold text-indigo">${y(s)}</td>
              <td>
                <span class="badge ${t.status==="received"?"good":t.status==="cancelled"?"bad":"warn"}">
                  ${t.status==="received"?"مستلم بالكامل":t.status==="cancelled"?"ملغي":"مفتوح / جاري التوريد"}
                </span>
              </td>
              <td class="no-print">
                <button class="btn btn-sm btn-ghost" onclick="printPODetail('${t.id}')">🖨️ طباعة</button>
                ${t.status==="ordered"?`<button class="btn btn-sm btn-ghost text-bad" onclick="cancelPO('${t.id}')">❌ إلغاء</button>`:""}
              </td>
            </tr>
          `}).join("")}
      </tbody>
    </table>
  `}window.cancelPO=async e=>{if(confirm("هل تريد إلغاء أمر الشراء هذا؟"))try{await F("purchaseOrders",e,{status:"cancelled"}),showToast("تم إلغاء أمر الشراء","success"),switchOpsSubModule("po")}catch(o){showToast(o.message,"error")}};window.printPODetail=async e=>{const{getById:o}=await Q(async()=>{const{getById:d}=await import("./index-CEMoTDyX.js").then(n=>n.T);return{getById:d}},__vite__mapDeps([0,1])),t=await o("purchaseOrders",e);if(!t)return;const s=(t.items||[]).reduce((d,n)=>d+n.qty*n.unitPrice,0),a=window.open("","_blank");a.document.write(`
    <html>
    <head>
      <title>أمر شراء #${t.poNumber}</title>
      <style>
        body { font-family: sans-serif; direction: rtl; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h2>طلب توريد / أمر شراء مالي</h2>
      <p>رقم الأمر: <strong>${t.poNumber}</strong></p>
      <p>التاريخ: ${t.date}</p>
      <p>المورد: ${t.supplierName}</p>
      <p>المستودع المستهدف: ${t.warehouseName}</p>
      <hr/>
      <table>
        <thead><tr><th>#</th><th>الصنف</th><th>الكمية المطلوبة</th><th>سعر التكلفة</th><th>الإجمالي</th></tr></thead>
        <tbody>
          ${t.items.map((d,n)=>`
            <tr>
              <td>${n+1}</td>
              <td>${d.sku} - ${d.name}</td>
              <td>${d.qty}</td>
              <td>${y(d.unitPrice)}</td>
              <td>${y(d.qty*d.unitPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">الإجمالي الكلي: ${y(s)}</h3>
      <script>window.print();<\/script>
    </body>
    </html>
  `),a.document.close()};let j=null;window.updateGrpoAltQty=(e,o)=>{const t=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!t)return;const s=t.querySelector(".grpo-qty-alt"),a=t.querySelector(".grpo-qty");if(s&&a){const d=parseFloat(s.value)||0;a.value=Math.round(d*o)}};window.updateGrpoBaseQty=(e,o)=>{const t=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!t)return;const s=t.querySelector(".grpo-qty-alt"),a=t.querySelector(".grpo-qty");if(s&&a){const d=parseFloat(a.value)||0;s.value=(d/o).toFixed(2).replace(/\.00$/,"")}};window.loadPOToGRPO=async e=>{const o=document.getElementById("grpo-lines-tbody"),t=document.getElementById("save-grpo-btn");if(!e){o.innerHTML='<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>',t.disabled=!0;return}o.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const{getById:s}=await Q(async()=>{const{getById:d}=await import("./index-CEMoTDyX.js").then(n=>n.T);return{getById:d}},__vite__mapDeps([0,1]));if(j=await s("purchaseOrders",e),!j)throw new Error("أمر الشراء غير موجود");const a=document.getElementById("grpo-wh");a.value=j.warehouseId,o.innerHTML=(j.items||[]).map((d,n)=>{const i=E.find(v=>v.id===d.productId)||{},c=i.unit||"حبة",r=i.altUnit||"",p=parseInt(i.unitFactor)||1;let l=0,m=d.qty;return r&&p>1&&(l=(d.qty/p).toFixed(2).replace(/\.00$/,"")),`
        <tr data-idx="${n}">
          <td>
            <strong>${d.sku} - ${d.name}</strong>
          </td>
          <!-- Alt Unit (Carton) -->
          <td style="vertical-align: middle;">
            ${r?`
              <div style="display:flex; align-items:center; gap:4px;">
                <input type="number" class="input mono grpo-qty-alt" style="height:28px; width:80px;" value="${l}" min="0" step="any" oninput="updateGrpoAltQty(${n}, ${p})" />
                <span class="dim" style="font-size:11px;">${r}</span>
              </div>
            `:'<span class="dim">—</span>'}
          </td>
          <!-- Base Unit (Piece) -->
          <td style="vertical-align: middle;">
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" class="input mono grpo-qty" style="height:28px; width:90px;" value="${m}" min="1" oninput="updateGrpoBaseQty(${n}, ${p})" data-idx="${n}" />
              <span class="dim" style="font-size:11px;">${c}</span>
            </div>
          </td>
          <td><input type="number" class="input mono grpo-cost" style="height:28px; width:90px;" value="${d.unitPrice}" step="0.01" data-idx="${n}" /></td>
          <td><input type="text" class="input mono grpo-batch" style="height:28px; width:90px;" placeholder="Batch#" data-idx="${n}" /></td>
          <td><input type="date" class="input grpo-expiry" style="height:28px;" data-idx="${n}" /></td>
        </tr>
      `}).join(""),t.disabled=!1}catch(s){o.innerHTML=`<tr><td colspan="6" class="text-bad" style="text-align:center;">${s.message}</td></tr>`,t.disabled=!0}};window.saveGRPO=async()=>{const e=document.getElementById("grpo-error");if(e.classList.add("hidden"),!j)return;const o=document.querySelectorAll("#grpo-lines-tbody tr"),t=[];let s=0;for(let d=0;d<o.length;d++){const n=o[d],i=parseInt(n.getAttribute("data-idx")),c=(j.items||[])[i];if(!c)continue;const r=n.querySelector(".grpo-qty"),p=n.querySelector(".grpo-cost"),l=n.querySelector(".grpo-batch"),m=n.querySelector(".grpo-expiry"),v=n.querySelector(".grpo-qty-alt"),b=parseInt(r?.value)||0,f=parseFloat(p?.value)||0,h=l?.value.trim()||"",L=m?.value||"",B=v&&parseFloat(v.value)||0;if(b<=0||f<=0){e.textContent="يرجى إدخال كميات وأسعار صحيحة لكافة السطور",e.classList.remove("hidden");return}const _=E.find(z=>z.id===c.productId)||{};t.push({productId:c.productId,sku:c.sku,name:c.name,qty:b,unitPrice:f,batchNumber:h||null,expiryDate:L||null,unit:_.unit||"حبة",altUnit:_.altUnit||null,unitFactor:parseInt(_.unitFactor)||1,qtyAlt:B}),s+=b*f}const a=document.getElementById("save-grpo-btn");a.disabled=!0;try{const d=`GRPO-${Date.now().toString().substring(6)}`,n=document.getElementById("grpo-date").value,i=j.warehouseId,c=await N(u.goodsReceiptPOs(),{grpoNumber:d,date:n,purchaseOrderId:j.id,poNumber:j.poNumber,supplierId:j.supplierId,supplierName:j.supplierName,warehouseId:i,warehouseName:j.warehouseName,items:t,totalValue:s,status:"received"});for(const l of t)await M(i,l.productId,l.qty,{type:"purchase_in",sourceType:"goodsReceiptPO",sourceId:c,purchasePrice:l.unitPrice,batchNumber:l.batchNumber,expiryDate:l.expiryDate});await F("purchaseOrders",j.id,{status:"received"});const r=C.find(l=>l.code==="1-1-4-1-01")||C.find(l=>l.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"},p=C.find(l=>l.code==="2-1-1-1-1")||C.find(l=>l.code==="2-1-1-1")||{id:"AP_SUPPLIERS",code:"2-1-1-1-1",name:"ذمم موردون محليون"};await G({date:n,description:`إذن استلام بضاعة مخزني #${d} لـ ${j.supplierName}`,sourceType:"goodsReceiptPO",sourceId:c,lines:[{accountId:r.id,accountCode:r.code,accountName:r.name,debit:s,credit:0,note:"إثبات استلام مخزون"},{accountId:p.id,accountCode:p.code,accountName:p.name,debit:0,credit:s,note:"إثبات التزام الموردين"}]}),showToast("تم إثبات استلام البضاعة مخزنياً ومحاسبياً","success"),closeModal("grpo-modal"),switchOpsSubModule("grpo")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{a.disabled=!1}};function pt(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📦</div><p>لا توجد أذونات استلام مخزنية</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الإذن</th><th>التاريخ</th><th>أمر الشراء</th><th>المورد</th><th>المستودع</th><th>قيمة الوارد المالي</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${o.map(t=>`
          <tr>
            <td class="mono font-bold">${t.grpoNumber}</td>
            <td>${t.date}</td>
            <td class="mono font-bold text-dim">${t.poNumber}</td>
            <td><strong>${t.supplierName}</strong></td>
            <td>${t.warehouseName}</td>
            <td class="mono font-bold text-good">${y(t.totalValue)}</td>
            <td class="no-print" style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-ghost" onclick="printGRPODetail('${t.id}')">🖨️ طباعة</button>
              <button class="btn btn-sm btn-primary" onclick="convertGRPOToInvoice('${t.id}')" style="background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; padding:4px 8px; font-size:11px;">📄 تحويل لفاتورة</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.printGRPODetail=async e=>{const{getById:o}=await Q(async()=>{const{getById:a}=await import("./index-CEMoTDyX.js").then(d=>d.T);return{getById:a}},__vite__mapDeps([0,1])),t=await o("goodsReceiptPOs",e);if(!t)return;const s=window.open("","_blank");s.document.write(`
    <html>
    <head>
      <title>إذن استلام بضاعة #${t.grpoNumber}</title>
      <style>
        body { font-family: sans-serif; direction: rtl; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h2>مؤسسة إدهام للمواد الغذائية — إذن استلام بضاعة مخزني</h2>
      <p>رقم السند: <strong>${t.grpoNumber}</strong></p>
      <p>التاريخ: ${t.date}</p>
      <p>أمر الشراء المرجعي: ${t.poNumber}</p>
      <p>المورد: ${t.supplierName}</p>
      <p>المستودع الفعلي: ${t.warehouseName}</p>
      <hr/>
      <table>
        <thead><tr><th>#</th><th>الصنف</th><th>الكمية بالوحدة</th><th>الكمية بالحبة/اللتر</th><th>سعر الوحدة</th><th>رقم التشغيلة (Batch)</th><th>تاريخ الانتهاء</th><th>الإجمالي</th></tr></thead>
        <tbody>
          ${(t.items||[]).map((a,d)=>{const i=a.altUnit&&a.unitFactor>1?`${a.qtyAlt||(a.qty/a.unitFactor).toFixed(2).replace(/\.00$/,"")} ${a.altUnit}`:"—",c=`${a.qty} ${a.unit||"حبة"}`;return`
              <tr>
                <td>${d+1}</td>
                <td>${a.sku} - ${a.name}</td>
                <td>${i}</td>
                <td>${c}</td>
                <td>${y(a.unitPrice)}</td>
                <td>${a.batchNumber||"—"}</td>
                <td>${a.expiryDate||"—"}</td>
                <td>${y(a.qty*a.unitPrice)}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">القيمة المالية التراكمية: ${y(t.totalValue)}</h3>
      <script>window.print();<\/script>
    </body>
    </html>
  `),s.document.close()};window.convertGRPOToInvoice=async e=>{try{const{getById:o}=await Q(async()=>{const{getById:s}=await import("./index-CEMoTDyX.js").then(a=>a.T);return{getById:s}},__vite__mapDeps([0,1])),t=await o("goodsReceiptPOs",e);if(!t){showToast("إذن الاستلام غير موجود","error");return}sessionStorage.setItem("convert_grpo_to_invoice",JSON.stringify({grpoId:t.id,grpoNumber:t.grpoNumber,supplierId:t.supplierId||"",supplierName:t.supplierName||"",warehouseId:t.warehouseId||"",warehouseName:t.warehouseName||"",items:(t.items||[]).map(s=>({productId:s.productId,productName:s.name,sku:s.sku||"",unit:s.unit||"PCS",qty:s.qty||0,unitPrice:s.unitPrice||0,batchNumber:s.batchNumber||"",expiryDate:s.expiryDate||""})),totalValue:t.totalValue})),showToast("تم تحويل إذن الاستلام بنجاح. يتم تحويلك الآن لوحدة الفواتير المشتريات...","success"),typeof navigate=="function"&&navigate("purchase-invoices")}catch(o){showToast(o.message,"error")}};window.saveQualityInspection=async()=>{const e=document.getElementById("qi-error");e.classList.add("hidden");const o=document.getElementById("qi-batch").value.trim().toUpperCase(),t=parseFloat(document.getElementById("qi-temp").value),s=document.getElementById("qi-product").value,a=document.getElementById("qi-prod-date").value,d=document.getElementById("qi-expiry").value,n=document.getElementById("qi-wh").value,i=document.getElementById("qi-status").value;if(!o||isNaN(t)||!s||!a||!d||!n){e.textContent="يرجى تعبئة كافة الحقول المطلوبة",e.classList.remove("hidden");return}const c=document.getElementById("save-qi-btn");c.disabled=!0;try{const r=E.find(p=>p.id===s);await N(u.qualityInspections(),{date:document.getElementById("qi-date").value,batchNumber:o,temperatureRecorded:t,productId:s,productName:r.name,sku:r.sku,productionDate:a,expiryDate:d,status:i,warehouseId:n,warehouseName:k.find(p=>p.id===n)?.name,notes:document.getElementById("qi-notes").value.trim()}),showToast("تم تسجيل وحفظ فحص الجودة","success"),closeModal("qi-modal"),switchOpsSubModule("inspect")}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{c.disabled=!1}};function ut(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🌡️</div><p>لا توجد فحوصات جودة مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>الصنف</th><th>التشغيلة (Batch)</th><th>الحرارة (°م)</th><th>صلاحية الشحنة</th><th>المستودع</th><th>حالة الفحص</th></tr></thead>
      <tbody>
        ${o.map(t=>`
          <tr>
            <td>${t.date}</td>
            <td><strong>${t.sku} — ${t.productName}</strong></td>
            <td class="mono font-bold">${t.batchNumber}</td>
            <td class="mono font-bold">${t.temperatureRecorded}°م</td>
            <td class="dim">من: ${t.productionDate} إلى: ${t.expiryDate}</td>
            <td>${t.warehouseName}</td>
            <td><span class="badge ${t.status==="passed"?"good":"bad"}">${t.status==="passed"?"مطابق ومقبول":"مرفوض/تالف"}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}let R=[];window.addAssemblyComponent=()=>{const e=document.getElementById("asm-component-sel"),o=parseInt(document.getElementById("asm-component-qty").value)||0;if(!e.value||o<=0)return;const t=E.find(s=>s.id===e.value);R.some(s=>s.productId===e.value)||(R.push({productId:e.value,name:t.name,sku:t.sku,qty:o}),dt())};function dt(){document.getElementById("asm-lines-tbody").innerHTML=R.map((e,o)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removeAsmLine(${o})">×</button></td>
    </tr>
  `).join("")}window.removeAsmLine=e=>{R.splice(e,1),dt()};window.saveAssembly=async()=>{const e=document.getElementById("asm-error");e.classList.add("hidden");const o=document.getElementById("asm-type").value,t=document.getElementById("asm-product").value,s=parseInt(document.getElementById("asm-qty").value)||0,a=document.getElementById("asm-wh").value,d=document.getElementById("asm-date").value;if(!t||s<=0||!a||!R.length){e.textContent="يرجى تعبئة كافة الحقول وتحديد المكونات",e.classList.remove("hidden");return}const n=document.getElementById("save-asm-btn");n.disabled=!0;try{const i=E.find(m=>m.id===t),c=await N(u.productAssemblies(),{type:o,date:d,parentProductId:t,parentProductName:i.name,parentSku:i.sku,quantity:s,warehouseId:a,warehouseName:k.find(m=>m.id===a)?.name,components:R}),p=(i.costPrice||0)*s,l=C.find(m=>m.code==="1-1-4-1-01")||C.find(m=>m.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"};await G({date:d,description:`عملية ${o==="assembly"?"تجميع":"تفكيك"} منتج #${i.sku}`,sourceType:"assembly",sourceId:c,lines:[{accountId:l.id,accountCode:l.code,accountName:l.name,debit:o==="assembly"?p:0,credit:o==="assembly"?0:p,note:"تأثير مخزون المنتج الرئيسي"},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:o==="assembly"?0:p,credit:o==="assembly"?p:0,note:"تأثير المخزون للمكونات"}]}),showToast("تم تنفيذ عملية التجميع وتأثير المخزون بنجاح","success"),closeModal("asm-modal"),switchOpsSubModule("assemble")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{n.disabled=!1}};function mt(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🛠️</div><p>لا توجد عمليات تجميع/تفكيك</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>النوع</th><th>الحزمة (المنتج الرئيسي)</th><th>الكمية</th><th>المستودع</th><th>المكونات الفرعية</th></tr></thead>
      <tbody>
        ${o.map(t=>`
          <tr>
            <td>${t.date}</td>
            <td><span class="badge ${t.type==="assembly"?"good":"warn"}">${t.type==="assembly"?"تجميع":"تفكيك"}</span></td>
            <td><strong>${t.parentSku} — ${t.parentProductName}</strong></td>
            <td class="mono font-bold">${t.quantity}</td>
            <td>${t.warehouseName}</td>
            <td class="dim">${t.components.map(s=>`${s.name} (${s.qty})`).join("، ")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.saveAdjustment=async()=>{const e=document.getElementById("adj-error");e.classList.add("hidden");const o=document.getElementById("adj-type").value,t=document.getElementById("adj-wh").value,s=document.getElementById("adj-date").value,a=document.getElementById("adj-notes").value.trim();if(!t||!s){e.textContent="يرجى تعبئة كافة الحقول المطلوبة",e.classList.remove("hidden");return}if(window._adjLines.length===0){e.textContent="يرجى إضافة صنف واحد على الأقل للعملية",e.classList.remove("hidden");return}if(window._adjSavingInProgress){showToast("⏳ جارٍ الحفظ... لا تضغط مرتين","warning");return}window._adjSavingInProgress=!0;const d=document.getElementById("save-adj-btn");d.disabled=!0,d.textContent="⏳ جارٍ الحفظ...";try{const n=!!window._editingAdjId;let i=window._editingAdjId;const c=k.find(h=>h.id===t)?.name||"المستودع الرئيسي",r=window._adjLines.reduce((h,L)=>h+L.totalCost,0),p=C.find(h=>h.code==="1-1-4-1-01")||C.find(h=>h.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون المستودع الرئيسي"},l=C.find(h=>h.code==="5-7")||{id:"STOCK_LOSS",code:"5-7",name:"المخصصات والخسائر المحتملة"},m=C.find(h=>h.code==="5-4-21")||{id:"DONATION_EXPENSE",code:"5-4-21",name:"مصروف هدايا ومساعدات ومساهمات اجتماعية"},v=o==="donation"?m:l;if(n){const h=await V(W(S,`companies/${O}/inventoryAdjustments`,i)).then(L=>L.exists()?L.data():null);if(h){const L=h.lines||[{productId:h.productId,qty:h.qty,type:h.type}];for(const B of L){if(!B.productId||!B.qty)continue;const _=h.type==="damage"||h.type==="deduct"||h.type==="expired"||h.type==="return-damaged"||h.type==="donation"?B.qty:-B.qty;await M(h.warehouseId,B.productId,_,{type:"adjustment_reverse",sourceType:"inventoryAdjustment",sourceId:i})}try{const{deleteJournalEntry:B}=await Q(async()=>{const{deleteJournalEntry:z}=await import("./index-CEMoTDyX.js").then(nt=>nt.T);return{deleteJournalEntry:z}},__vite__mapDeps([0,1])),_=await x(I(J(S,`companies/${O}/journalEntries`),K("sourceId","==",i)));for(const z of _.docs)await B(z.id)}catch(B){console.warn("[Edit] Failed to cleanup old JEs:",B.message)}}await F(u.inventoryAdjustments(),i,{type:o,date:s,warehouseId:t,warehouseName:c,notes:a,lines:window._adjLines,totalCost:r,updatedAt:new Date})}else i=await N(u.inventoryAdjustments(),{type:o,date:s,warehouseId:t,warehouseName:c,notes:a,lines:window._adjLines,totalCost:r,createdAt:new Date});if(["damage","deduct","expired","return-damaged","donation"].includes(o)&&r===0&&!confirm(`⚠️ تنبيه: إجمالي التكلفة = 0 ريال!
هذا يعني القيد المحاسبي سيُسجَّل بصفر ولن يؤثر على شجرة الحسابات.

السبب الغالب: المنتجات لا تحتوي على متوسط تكلفة مسجّل.
هل تريد المتابعة على أي حال؟`)){window._adjSavingInProgress=!1,d.disabled=!1,d.textContent="💾 حفظ التسوية";return}for(const h of window._adjLines){const L=o==="damage"||o==="deduct"||o==="expired"||o==="return-damaged"||o==="donation"?-h.qty:h.qty;await M(t,h.productId,L,{type:L<0?"adjustment_out":"adjustment_in",sourceType:"inventoryAdjustment",sourceId:i,productName:h.productName||"",warehouseName:c,allowNegative:!0})}let f="تسوية خصم";o==="damage"?f="إهلاك تالف":o==="expired"?f="إعدام منتهي صلاحية":o==="return-damaged"?f="مرتجع تالف للمورد":o==="donation"?f="صرف تبرعات وهبات":o==="add"&&(f="تسوية إضافة"),o==="damage"||o==="deduct"||o==="expired"||o==="return-damaged"||o==="donation"?await G({date:s,description:`${f} لعدد ${window._adjLines.length} أصناف - ${a}`,sourceType:"inventory_adjustment",sourceId:i,lines:[{accountId:v.id,accountCode:v.code,accountName:v.name,debit:r,credit:0,note:`إثبات تكلفة ${f}`},{accountId:p.id,accountCode:p.code,accountName:p.name,debit:0,credit:r,note:"تخفيض قيمة المخزون"}]}):await G({date:s,description:`تسوية إضافة لعدد ${window._adjLines.length} أصناف - ${a}`,sourceType:"inventory_adjustment",sourceId:i,lines:[{accountId:p.id,accountCode:p.code,accountName:p.name,debit:r,credit:0,note:"زيادة قيمة المخزون"},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:0,credit:r,note:"تسوية فروقات جردية (زيادة)"}]}),showToast(n?"تم تعديل المعاملة وتحديث القيود المحاسبية بنجاح":"تم تسجيل المعاملة وإنشاء القيود المحاسبية بنجاح","success"),closeModal("adj-modal"),switchOpsSubModule("adjust")}catch(n){if(!isEdit&&adjId)try{await Z("inventoryAdjustments",adjId),console.warn("[saveAdjustment] Rolled back orphan document:",adjId)}catch(i){console.error("[saveAdjustment] Rollback failed:",i.message)}e.textContent="❌ "+n.message,e.classList.remove("hidden"),console.error("[saveAdjustment] Error:",n)}finally{window._adjSavingInProgress=!1,d.disabled=!1,d.textContent=isEdit?"💾 حفظ التعديلات":"💾 حفظ التسوية"}};function bt(e,o){if(o.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔧</div><p>لا توجد تسويات مسجلة</p></div>';return}e.innerHTML=`
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
        ${o.map(t=>{let s="";t.type==="damage"?s='<span class="badge bad text-white">إعدام تالف</span>':t.type==="expired"?s='<span class="badge bad text-white">إعدام منتهي الصلاحية</span>':t.type==="return-damaged"?s='<span class="badge warn text-white">مرتجع تالف للمورد</span>':t.type==="donation"?s='<span class="badge info text-white" style="background:#3b82f6;">تبرعات وهبات</span>':t.type==="deduct"?s='<span class="badge warn text-white">تسوية خصم (-)</span>':s='<span class="badge good text-white">تسوية إضافة (+)</span>';const a=t.lines||[{productId:t.productId,productName:t.productName||"—",sku:t.sku||"—",qty:t.qty||0,cost:t.costPrice||0,totalCost:t.totalCost||(t.costPrice||0)*(t.qty||0)}],d=t.totalCost||a.reduce((i,c)=>i+(c.totalCost||0),0),n=a.map(i=>`
            <div style="margin-bottom:4px; font-size:12px;">
              <span class="mono font-bold" style="color:var(--brand);">${i.sku||"—"}</span> — ${i.productName} 
              <span class="badge neutral" style="padding:1px 5px; font-size:10.5px;">الكمية: ${i.qty}</span>
            </div>
          `).join("");return`
            <tr>
              <td>${t.date}</td>
              <td>${s}</td>
              <td>${n}</td>
              <td class="mono font-bold" style="text-align:left;">${y(d)}</td>
              <td>${t.warehouseName||"—"}</td>
              <td class="dim">${t.notes||"—"}</td>
              <td class="no-print" style="white-space:nowrap;">
                <button class="btn btn-sm btn-ghost" onclick="printAdjDetail('${t.id}')">🖨️ طباعة</button>
                <button class="btn btn-sm btn-ghost text-primary" onclick="editAdjustment('${t.id}')">✏️ تعديل</button>
                <button class="btn btn-sm btn-ghost text-bad" onclick="deleteAdjustment('${t.id}')">🗑️ حذف</button>
              </td>
            </tr>
          `}).join("")}
      </tbody>
    </table>
  `}window.exportOpsToCSV=async()=>{showToast("جاري التصدير...","info");try{let e=[];if(g==="request"?e=await T(u.purchaseRequests()):g==="po"?e=await T(u.purchaseOrders()):g==="grpo"?e=await T(u.goodsReceiptPOs()):g==="inspect"?e=await T(u.qualityInspections()):g==="assemble"?e=await T(u.productAssemblies()):e=(await T(u.inventoryAdjustments())).filter(d=>d.opType===g||!d.opType),!e.length){showToast("لا توجد بيانات لتصديرها","warn");return}const o=Object.keys(e[0]),t=[o.join(",")];e.forEach(d=>{const n=o.map(i=>{const c=d[i];return typeof c=="object"?`"${JSON.stringify(c).replace(/"/g,'""')}"`:`"${String(c||"").replace(/"/g,'""')}"`});t.push(n.join(","))});const s=new Blob(["\uFEFF"+t.join(`
`)],{type:"text/csv;charset=utf-8;"}),a=document.createElement("a");a.href=URL.createObjectURL(s),a.download=`inventory_${g}_${P()}.csv`,a.click(),showToast("تم التصدير بنجاح","success")}catch(e){showToast(e.message,"error")}};let q=[];function ht(e,o){if(!o.length){e.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text-2);">
      <div style="font-size:40px;margin-bottom:12px;">📤</div>
      <div style="font-size:16px;font-weight:600;">لا توجد عمليات صرف مسجلة</div>
      <div style="font-size:13px;margin-top:8px;">استخدم "معاملة جديدة" لإنشاء أمر صرف</div>
    </div>`;return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>رقم الأمر</th><th>المخزن</th><th>الغرض</th><th>الأصناف</th><th>إجمالي التكلفة</th><th>الحالة</th><th></th></tr></thead>
    <tbody>${o.map(t=>`<tr>
      <td>${t.date||"—"}</td>
      <td class="mono font-bold">${t.number||t.id.slice(-6)}</td>
      <td>${t.warehouseName||"—"}</td>
      <td>${t.purpose==="internal"?"داخلي":t.purpose==="sales"?"مبيعات":t.purpose||"—"}</td>
      <td class="mono">${(t.lines||[]).length} صنف</td>
      <td class="mono">${y(t.totalCost||0)}</td>
      <td><span class="badge good" style="font-size:10px;">مُنفَّذ</span></td>
      <td></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}window.addDispatchItem=()=>{const e=document.getElementById("dsp-item-sel"),o=parseFloat(document.getElementById("dsp-item-qty").value)||1;if(!e.value){showToast("اختر صنفاً أولاً","warn");return}e.options[e.selectedIndex];const t=E.find(a=>a.id===e.value);if(!t)return;const s=q.find(a=>a.productId===e.value);s?s.qty+=o:q.push({productId:e.value,productName:t.name,sku:t.sku,qty:o,cost:t.costPrice||0}),at()};function at(){const e=document.getElementById("dsp-lines-tbody");if(!e)return;if(!q.length){e.innerHTML='<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد أصناف مضافة</td></tr>';return}let o=0;e.innerHTML=q.map((t,s)=>{const a=t.qty*t.cost;return o+=a,`<tr>
      <td>${t.productName} <span class="dim mono" style="font-size:11px;">${t.sku}</span></td>
      <td><input type="number" class="input mono" style="width:80px;" value="${t.qty}" min="1" onchange="dispatchLines[${s}].qty=parseFloat(this.value)||1; renderDspLines();" /></td>
      <td class="mono">${y(t.cost)}</td>
      <td class="mono font-bold">${y(a)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="dispatchLines.splice(${s},1); renderDspLines();">✕</button></td>
    </tr>`}).join("")+`<tr style="background:var(--bg-3);font-weight:700;"><td colspan="3">الإجمالي</td><td class="mono">${y(o)}</td><td></td></tr>`}window.saveDispatch=async()=>{const e=document.getElementById("dsp-error");e.classList.add("hidden");const o=document.getElementById("dsp-wh").value,t=document.getElementById("dsp-date").value,s=document.getElementById("dsp-purpose").value,a=document.getElementById("dsp-notes").value.trim();if(!o||!t||!q.length){e.textContent="يرجى اختيار المخزن والتاريخ وإضافة أصناف",e.classList.remove("hidden");return}const d=k.find(i=>i.id===o),n=document.getElementById("save-dsp-btn");n.disabled=!0,n.textContent="جارٍ التنفيذ…";try{const i=q.reduce((c,r)=>c+r.qty*r.cost,0);for(const c of q)await M({productId:c.productId,warehouseId:o,qty:-c.qty,cost:c.cost,type:"out",refType:"dispatch",note:`صرف: ${s}`});await N(u.inventoryAdjustments(),{opType:"dispatch",date:t,warehouseId:o,warehouseName:d?.name,purpose:s,lines:q,totalCost:i,notes:a,status:"confirmed",createdAt:new Date}),showToast(`✅ تم تنفيذ أمر الصرف بنجاح — ${q.length} صنف`,"success"),closeModal("dispatch-modal"),q=[],await switchOpsSubModule("dispatch")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="📤 تنفيذ الصرف"}};let A=[];function yt(e,o){if(!o.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🚐</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات تحميل مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>من مخزن</th><th>إلى سيارة</th><th>المندوب</th><th>الأصناف</th><th>الحالة</th></tr></thead>
    <tbody>${o.map(t=>`<tr>
      <td>${t.date||"—"}</td><td>${t.fromWarehouse||"—"}</td><td>${t.toWarehouse||"—"}</td>
      <td>${t.driver||"—"}</td><td class="mono">${(t.lines||[]).length} صنف</td>
      <td><span class="badge good" style="font-size:10px;">محمَّل</span></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}function vt(e,o){e.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔄</div><div style="font-size:16px;font-weight:600;">عمليات الاستلام من السيارة: ${o.length}</div></div>`}window.addVehicleItem=()=>{const e=document.getElementById("veh-item-sel"),o=parseFloat(document.getElementById("veh-item-qty").value)||1;if(!e.value){showToast("اختر صنفاً أولاً","warn");return}const t=E.find(d=>d.id===e.value);if(!t)return;const s=A.find(d=>d.productId===e.value);s?s.qty+=o:A.push({productId:e.value,productName:t.name,sku:t.sku,qty:o,cost:t.costPrice||0});const a=document.getElementById("veh-lines-tbody");a&&(a.innerHTML=A.map((d,n)=>`<tr>
    <td>${d.productName}</td>
    <td class="mono">${d.qty}</td>
    <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleLines.splice(${n},1); window.addVehicleItem();">✕</button></td>
  </tr>`).join(""))};window.saveVehicleLoad=async()=>{const e=document.getElementById("veh-error");e.classList.add("hidden");const o=document.getElementById("veh-src-wh").value,t=document.getElementById("veh-dst-wh").value,s=document.getElementById("veh-date").value,a=document.getElementById("veh-driver").value.trim(),d=document.getElementById("veh-notes").value.trim();if(!o||!t||!s||!A.length){e.textContent="يرجى تحديد المخازن والتاريخ والأصناف",e.classList.remove("hidden");return}const n=k.find(r=>r.id===o),i=k.find(r=>r.id===t),c=document.getElementById("save-veh-btn");c.disabled=!0;try{for(const r of A)await M({productId:r.productId,warehouseId:o,qty:-r.qty,cost:r.cost,type:"out",refType:"vehicle-load"}),await M({productId:r.productId,warehouseId:t,qty:r.qty,cost:r.cost,type:"in",refType:"vehicle-load"});await N(u.inventoryAdjustments(),{opType:"vehicle-load",date:s,fromWarehouse:n?.name,toWarehouse:i?.name,fromWarehouseId:o,toWarehouseId:t,driver:a,lines:A,notes:d,createdAt:new Date}),showToast(`✅ تم تحميل ${A.length} صنف على السيارة`,"success"),closeModal("vehicle-modal"),A=[],await switchOpsSubModule("vehicle")}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{c.disabled=!1,c.textContent="🚐 تأكيد التحميل"}};window.spotCountLines=[];function gt(e,o){if(!o.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔢</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات جرد مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الأصناف</th><th>الفروقات</th><th>الملاحظات</th><th class="no-print" style="text-align:center;">إجراءات</th></tr></thead>
    <tbody>${o.map(t=>`<tr>
      <td>${t.date||"—"}</td><td>${t.warehouseName||"—"}</td>
      <td class="mono">${(t.lines||[]).length}</td>
      <td class="mono ${(t.variances||0)>0?"text-bad":""}">${t.variances||0}</td>
      <td class="dim">${t.notes||"—"}</td>
      <td class="no-print" style="text-align:center; display:flex; gap:6px; justify-content:center;">
        <button class="btn btn-sm btn-ghost text-primary" onclick="window.showSpotCountDetail('${t.id}')">👁️ معاينة وتفاصيل</button>
        <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printSpotCountById('${t.id}')">🖨️ طباعة</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteSpotCount('${t.id}')">❌ حذف وتراجع</button>
      </td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}window.loadSpotCountItems=async()=>{const e=document.getElementById("sc-wh").value,o=document.getElementById("sc-wh2").value;if(!e){showToast("اختر المخزن الأول أولاً","warn");return}const t=document.getElementById("load-sc-btn");t.disabled=!0,t.textContent="جارٍ التحميل…";try{const[s,a]=await Promise.all([x(I(u.products(),w("name"),it(200))),x(u.stockByWarehouse())]),d={};a.forEach(p=>{d[p.id]=p.data().qty||0}),window.spotCountLines=s.docs.map(p=>{const l={id:p.id,...p.data()},m=d[`${e}_${l.id}`]||0,v=o&&d[`${o}_${l.id}`]||0;return{productId:l.id,productName:l.name,sku:l.sku||"",bookQty1:m,actualQty1:m,bookQty2:v,actualQty2:v}});const n=document.getElementById("sc-table-thead"),i=document.getElementById("sc-lines-tbody"),c=k.find(p=>p.id===e)?.name||"مخزن 1",r=o?k.find(p=>p.id===o)?.name||"مخزن 2":"";o?(n&&(n.innerHTML=`<tr>
          <th>الصنف</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">دفتر (${c})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">فعلي (${c})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">الفرق</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">دفتر (${r})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">فعلي (${r})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">الفرق</th>
        </tr>`),i&&(i.innerHTML=window.spotCountLines.map((p,l)=>`<tr>
          <td style="text-align:right;">${p.productName} <span class="mono dim" style="font-size:11px;">${p.sku}</span></td>
          <td class="mono">${$(p.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${p.actualQty1}" step="0.001"
            oninput="window.spotCountLines[${l}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${l}, this)" /></td>
          <td id="sc-diff1-${l}" class="mono">0</td>
          <td class="mono">${$(p.bookQty2)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${p.actualQty2}" step="0.001"
            oninput="window.spotCountLines[${l}].actualQty2=parseFloat(this.value)||0; window.updateSCDiff2(${l}, this)" /></td>
          <td id="sc-diff2-${l}" class="mono">0</td>
        </tr>`).join(""))):(n&&(n.innerHTML=`<tr>
          <th>الصنف</th>
          <th>الكمية الدفترية</th>
          <th>الكمية الفعلية</th>
          <th>الفرق</th>
        </tr>`),i&&(i.innerHTML=window.spotCountLines.map((p,l)=>`<tr>
          <td style="text-align:right;">${p.productName} <span class="mono dim" style="font-size:11px;">${p.sku}</span></td>
          <td class="mono">${$(p.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:90px; padding:4px;" value="${p.actualQty1}" step="0.001"
            oninput="window.spotCountLines[${l}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${l}, this)" /></td>
          <td id="sc-diff1-${l}" class="mono">0</td>
        </tr>`).join(""))),document.getElementById("save-sc-btn").disabled=!1,showToast(`تم تحميل ${window.spotCountLines.length} صنف بنجاح`,"success")}catch(s){showToast(s.message,"error")}finally{t.disabled=!1,t.textContent="📥 تحميل أصناف المخزن"}};window.updateSCDiff1=(e,o)=>{const t=window.spotCountLines[e];if(!t)return;t.actualQty1=parseFloat(o.value)||0;const s=t.actualQty1-t.bookQty1,a=document.getElementById(`sc-diff1-${e}`);a&&(a.textContent=s>=0?`+${$(s)}`:$(s),a.className=`mono ${s!==0?s<0?"text-bad":"text-good":""}`)};window.updateSCDiff2=(e,o)=>{const t=window.spotCountLines[e];if(!t)return;t.actualQty2=parseFloat(o.value)||0;const s=t.actualQty2-t.bookQty2,a=document.getElementById(`sc-diff2-${e}`);a&&(a.textContent=s>=0?`+${$(s)}`:$(s),a.className=`mono ${s!==0?s<0?"text-bad":"text-good":""}`)};window.saveSpotCount=async()=>{const e=document.getElementById("sc-error");e.classList.add("hidden");const o=document.getElementById("sc-wh").value,t=document.getElementById("sc-wh2").value,s=document.getElementById("sc-date").value,a=document.getElementById("sc-notes").value.trim();if(!o||!s||!window.spotCountLines.length){e.textContent="يرجى إكمال البيانات",e.classList.remove("hidden");return}const d=k.find(c=>c.id===o),n=t?k.find(c=>c.id===t):null,i=document.getElementById("save-sc-btn");i.disabled=!0,i.textContent="جارٍ الاعتماد…";try{let c=0;const r=window.spotCountLines.filter(l=>l.actualQty1!==l.bookQty1);for(const l of r){const m=l.actualQty1-l.bookQty1;await M(o,l.productId,m,{type:"spot-count",refType:"spot-count",note:`تسوية جرد مفاجئ - ${d?.name||"مخزن 1"}`}),c++}let p=[];if(t){p=window.spotCountLines.filter(l=>l.actualQty2!==l.bookQty2);for(const l of p){const m=l.actualQty2-l.bookQty2;await M(t,l.productId,m,{type:"spot-count",refType:"spot-count",note:`تسوية جرد مفاجئ - ${n?.name||"مخزن 2"}`}),c++}}await N(u.inventoryAdjustments(),{opType:"spot-count",date:s,warehouseId:o,warehouseName:d?.name||"",warehouseId2:t||"",warehouseName2:n?.name||"",lines:window.spotCountLines,variances:r.length+p.length,notes:a,createdAt:new Date}),showToast(`✅ تم اعتماد الجرد — تم إنشاء ${c} تسوية مخزنية`,"success"),closeModal("spot-count-modal"),window.spotCountLines=[],await switchOpsSubModule("spot-count")}catch(c){e.textContent=c.message,e.classList.remove("hidden")}finally{i.disabled=!1,i.textContent="✅ اعتماد الجرد وإنشاء تسويات"}};function ft(e,o){if(!o.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">💰</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات إعادة تقييم مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الصنف</th><th>التكلفة القديمة</th><th>التكلفة الجديدة</th><th>الفرق</th><th>السبب</th></tr></thead>
    <tbody>${o.map(t=>{const s=(t.newCost||0)-(t.oldCost||0);return`<tr>
        <td>${t.date||"—"}</td><td>${t.warehouseName||"—"}</td><td>${t.productName||"—"}</td>
        <td class="mono">${y(t.oldCost||0)}</td>
        <td class="mono">${y(t.newCost||0)}</td>
        <td class="mono ${s<0?"text-bad":"text-good"}">${s>=0?"+":""}${y(s)}</td>
        <td class="dim">${t.notes||"—"}</td>
      </tr>`}).join("")}</tbody>
  </table></div></div>`}window.saveRevalue=async()=>{const e=document.getElementById("rv-error");e.classList.add("hidden");const o=document.getElementById("rv-wh").value,t=document.getElementById("rv-product").value,s=parseFloat(document.getElementById("rv-new-cost").value),a=document.getElementById("rv-date").value,d=document.getElementById("rv-notes").value.trim();if(!o||!t||!s||!a||!d){e.textContent="يرجى إكمال جميع الحقول المطلوبة",e.classList.remove("hidden");return}const n=k.find(p=>p.id===o),i=E.find(p=>p.id===t),c=i?.costPrice||0,r=document.getElementById("save-rv-btn");r.disabled=!0;try{await F("products",t,{costPrice:s,lastRevalueDate:a,lastRevalueBy:"system"}),await N(u.inventoryAdjustments(),{opType:"revalue",date:a,warehouseId:o,warehouseName:n?.name,productId:t,productName:i?.name,oldCost:c,newCost:s,notes:d,createdAt:new Date}),showToast(`✅ تم تحديث التكلفة من ${y(c)} إلى ${y(s)}`,"success"),closeModal("revalue-modal"),await switchOpsSubModule("revalue")}catch(p){e.textContent=p.message,e.classList.remove("hidden")}finally{r.disabled=!1,r.textContent="💰 تطبيق إعادة التقييم"}};const et=window.openOpsModal;window.openOpsModal=async()=>{if(g==="dispatch")q=[],at(),openModal("dispatch-modal");else if(g==="vehicle"){A=[];const e=document.getElementById("veh-lines-tbody");e&&(e.innerHTML=""),openModal("vehicle-modal")}else if(g==="vehicle-return")showToast("استخدم تحويل بضاعة لاستلام المرتجع من السيارة","warn");else if(g==="spot-count"){window.spotCountLines=[];const e=document.getElementById("sc-table-thead");e&&(e.innerHTML="<tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr>");const o=document.getElementById("sc-lines-tbody");o&&(o.innerHTML='<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">اختر المخزن لتحميل الأصناف</td></tr>'),document.getElementById("save-sc-btn").disabled=!0;const t=document.getElementById("sc-wh2");t&&(t.value=""),openModal("spot-count-modal")}else g==="revalue"?(document.getElementById("rv-old-cost").value="",document.getElementById("rv-new-cost").value="",document.getElementById("rv-notes").value="",openModal("revalue-modal")):et&&et()};let Y=null;window.showSpotCountDetail=async e=>{try{const o=W(S,`companies/${O}/inventoryAdjustments`,e),t=await V(o);if(!t.exists()){showToast("المعاملة غير موجودة","error");return}const s=t.data();s.id=t.id,Y=s;const a=s.warehouseId2&&s.warehouseId2!=="",d=(s.lines||[]).length,n=(s.lines||[]).filter(l=>{const m=l.actualQty1!==void 0?l.actualQty1:l.actualQty??0,v=l.bookQty1!==void 0?l.bookQty1:l.bookQty??0;return m!==v}),i=n.filter(l=>{const m=l.actualQty1!==void 0?l.actualQty1:l.actualQty??0,v=l.bookQty1!==void 0?l.bookQty1:l.bookQty??0;return m<v}).length,c=n.length-i,r=`
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#16a34a;">${d}</div>
          <div style="font-size:11px;color:#166534;">إجمالي الأصناف</div>
        </div>
        <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#ea580c;">${n.length}</div>
          <div style="font-size:11px;color:#9a3412;">فروقات</div>
        </div>
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#dc2626;">${i}</div>
          <div style="font-size:11px;color:#991b1b;">عجز (ناقص)</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:10px 18px;text-align:center;min-width:100px;">
          <div style="font-size:22px;font-weight:700;color:#1d4ed8;">${c}</div>
          <div style="font-size:11px;color:#1e3a8a;">فائض (زائد)</div>
        </div>
      </div>`,p=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:8px;" class="no-print">
        <div style="font-weight:700; color:var(--brand); font-size:14px;">📄 مستند جرد مفاجئ (${s.date||""})</div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary btn-sm" onclick="window.printActiveSpotCount()">🖨️ طباعة التقرير</button>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('spot-count-detail-modal'); window.deleteSpotCount('${s.id}')">❌ حذف وتراجع</button>
        </div>
      </div>
      <div class="grid-3 gap-16 mb-16" style="border-bottom:1px solid var(--border-soft); padding-bottom:12px;">
        <div><strong>تاريخ الجرد:</strong> <span class="mono">${s.date||"—"}</span></div>
        <div><strong>المخزن الأول:</strong> <span>${s.warehouseName||"—"}</span></div>
        ${a?`<div><strong>المخزن الثاني:</strong> <span>${s.warehouseName2||"—"}</span></div>`:"<div></div>"}
      </div>
      <div class="mb-16"><strong>ملاحظات:</strong> <span>${s.notes||"—"}</span></div>
      ${r}
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            ${a?`
              <tr>
                <th>الصنف</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">دفتر (${s.warehouseName})</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">فعلي (${s.warehouseName})</th>
                <th style="background:#eff6ff;color:#1e40af;text-align:center;">الفرق</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">دفتر (${s.warehouseName2})</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">فعلي (${s.warehouseName2})</th>
                <th style="background:#fef2f2;color:#991b1b;text-align:center;">الفرق</th>
              </tr>`:`
              <tr>
                <th>الصنف</th>
                <th>الكمية الدفترية</th>
                <th>الكمية الفعلية</th>
                <th>الفرق</th>
              </tr>`}
          </thead>
          <tbody>
            ${(s.lines||[]).map(l=>{if(a){const m=(l.actualQty1??0)-(l.bookQty1??0),v=(l.actualQty2??0)-(l.bookQty2??0);return`<tr>
                  <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
                  <td class="mono">${$(l.bookQty1)}</td>
                  <td class="mono">${$(l.actualQty1)}</td>
                  <td class="mono ${m!==0?m<0?"text-bad":"text-good":""}"><strong>${m>=0?"+":""}${$(m)}</strong></td>
                  <td class="mono">${$(l.bookQty2)}</td>
                  <td class="mono">${$(l.actualQty2)}</td>
                  <td class="mono ${v!==0?v<0?"text-bad":"text-good":""}"><strong>${v>=0?"+":""}${$(v)}</strong></td>
                </tr>`}else{const m=l.actualQty1!==void 0?l.actualQty1:l.actualQty??0,v=l.bookQty1!==void 0?l.bookQty1:l.bookQty??0,b=m-v;return`<tr style="${b!==0?b<0?"background:#fff5f5;":"background:#f0fdf4;":""}">
                  <td style="text-align:right;">${l.productName} <span class="mono dim" style="font-size:11px;">${l.sku}</span></td>
                  <td class="mono">${$(v)}</td>
                  <td class="mono">${$(m)}</td>
                  <td class="mono ${b!==0?b<0?"text-bad":"text-good":""}"><strong>${b>=0?"+":""}${$(b)}</strong></td>
                </tr>`}}).join("")}
          </tbody>
        </table>
      </div>`;document.getElementById("sc-detail-body").innerHTML=p,openModal("spot-count-detail-modal")}catch(o){showToast(o.message,"error")}};window.deleteSpotCount=async e=>{if(confirm("هل أنت متأكد من حذف هذه المعاملة؟ سيتم التراجع عن جميع تسويات الكميات في المخازن وإعادة الأرصدة لوضعها السابق."))try{const o=W(S,`companies/${O}/inventoryAdjustments`,e),t=await V(o);if(!t.exists()){showToast("المعاملة غير موجودة","error");return}const s=t.data(),a=s.warehouseId2&&s.warehouseId2!=="",d=(s.lines||[]).filter(n=>{const i=n.actualQty1!==void 0?n.actualQty1:n.actualQty!==void 0?n.actualQty:0,c=n.bookQty1!==void 0?n.bookQty1:n.bookQty!==void 0?n.bookQty:0;return i!==c});for(const n of d){const i=n.actualQty1!==void 0?n.actualQty1:n.actualQty!==void 0?n.actualQty:0,c=n.bookQty1!==void 0?n.bookQty1:n.bookQty!==void 0?n.bookQty:0,r=i-c;await M(s.warehouseId,n.productId,-r,{type:"spot-count-reversal",refType:"spot-count-reversal",note:"إلغاء تسوية جرد - تراجع"})}if(a){const n=(s.lines||[]).filter(i=>i.actualQty2!==i.bookQty2);for(const i of n){const c=i.actualQty2-i.bookQty2;await M(s.warehouseId2,i.productId,-c,{type:"spot-count-reversal",refType:"spot-count-reversal",note:"إلغاء تسوية جرد - تراجع"})}}await Z("inventoryAdjustments",e),showToast("✅ تم حذف المعاملة والتراجع عن جميع تسويات المخزون بنجاح","success"),await switchOpsSubModule("spot-count")}catch(o){showToast(o.message,"error")}};function wt(e){const o=e.warehouseId2&&e.warehouseId2!=="",t=(e.lines||[]).length,s=(e.lines||[]).filter(d=>{const n=d.actualQty1!==void 0?d.actualQty1:d.actualQty??0,i=d.bookQty1!==void 0?d.bookQty1:d.bookQty??0;return n!==i}),a=s.filter(d=>{const n=d.actualQty1!==void 0?d.actualQty1:d.actualQty??0,i=d.bookQty1!==void 0?d.bookQty1:d.bookQty??0;return n<i}).length;return`<html dir="rtl" lang="ar"><head><meta charset="UTF-8">
  <title>جرد مفاجئ - ${e.date||""}</title>
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
    <div class="mi"><label>تاريخ الجرد</label><span>${e.date||"—"}</span></div>
    <div class="mi"><label>المخزن الأول</label><span>${e.warehouseName||"—"}</span></div>
    ${o?`<div class="mi"><label>المخزن الثاني</label><span>${e.warehouseName2||"—"}</span></div>`:`<div class="mi"><label>ملاحظات</label><span>${e.notes||"—"}</span></div>`}
  </div>
  <div class="stats">
    <div class="st s0"><div class="n">${t}</div><div class="l">إجمالي</div></div>
    <div class="st s1"><div class="n">${s.length}</div><div class="l">فروقات</div></div>
    <div class="st s2"><div class="n">${a}</div><div class="l">عجز</div></div>
    <div class="st s3"><div class="n">${s.length-a}</div><div class="l">فائض</div></div>
  </div>
  <table><thead><tr><th>#</th><th>الصنف</th><th>كود</th>
    ${o?`<th>دفتر (${e.warehouseName})</th><th>فعلي</th><th>فرق</th><th>دفتر (${e.warehouseName2})</th><th>فعلي</th><th>فرق</th>`:"<th>الدفتري</th><th>الفعلي</th><th>الفرق</th>"}
  </tr></thead><tbody>
    ${(e.lines||[]).map((d,n)=>{if(o){const i=(d.actualQty1??0)-(d.bookQty1??0),c=(d.actualQty2??0)-(d.bookQty2??0);return`<tr class="${i!==0||c!==0?i<0||c<0?"deficit":"surplus":""}"><td class="mono dim">${n+1}</td><td>${d.productName}</td><td class="mono dim">${d.sku||""}</td><td class="mono">${d.bookQty1??0}</td><td class="mono">${d.actualQty1??0}</td><td class="mono ${i<0?"bad":i>0?"good":""}">  ${i>=0?"+":""}${i}</td><td class="mono">${d.bookQty2??0}</td><td class="mono">${d.actualQty2??0}</td><td class="mono ${c<0?"bad":c>0?"good":""}">  ${c>=0?"+":""}${c}</td></tr>`}else{const i=d.actualQty1!==void 0?d.actualQty1:d.actualQty??0,c=d.bookQty1!==void 0?d.bookQty1:d.bookQty??0,r=i-c;return`<tr class="${r!==0?r<0?"deficit":"surplus":""}"><td class="mono dim">${n+1}</td><td>${d.productName}</td><td class="mono dim">${d.sku||""}</td><td class="mono">${c}</td><td class="mono">${i}</td><td class="mono ${r<0?"bad":r>0?"good":""}"><strong>${r>=0?"+":""}${r}</strong></td></tr>`}}).join("")}
  </tbody></table>
  <div class="footer"><span>طباعة: ${new Date().toLocaleDateString("ar-SA",{dateStyle:"full"})}</span><span>إدهام ERP</span></div>
  </body></html>`}window.printActiveSpotCount=()=>{Y&&window._doPrintSpotCount(Y)};window.printSpotCountById=async e=>{try{showToast("⏳ جارٍ تحضير التقرير…","info");const o=await V(W(S,`companies/${O}/inventoryAdjustments`,e));if(!o.exists()){showToast("الجرد غير موجود","error");return}window._doPrintSpotCount({id:o.id,...o.data()})}catch(o){showToast(o.message,"error")}};window._doPrintSpotCount=e=>{const o=document.getElementById("_sc-print-frame");o&&o.remove();const t=wt(e),s=document.createElement("iframe");s.id="_sc-print-frame",s.style.cssText="position:fixed;width:0;height:0;border:none;left:-9999px;top:-9999px;",document.body.appendChild(s);const a=s.contentDocument||s.contentWindow.document;a.open(),a.write(t),a.close(),setTimeout(()=>{try{s.contentWindow.focus(),s.contentWindow.print()}catch{const n=window.open("","_blank","width=900,height=700");n&&(n.document.open(),n.document.write(t),n.document.close(),n.focus(),n.print())}},150)};window._adjLines=[];function xt(){const e=document.getElementById("adj-product-search"),o=document.getElementById("adj-product-results");document.getElementById("adj-product"),!(!e||!o)&&(e.addEventListener("input",t=>{const s=t.target.value.trim().toLowerCase();if(!s){o.classList.add("hidden"),o.innerHTML="";return}const a=E.filter(d=>(d.name||"").toLowerCase().includes(s)||(d.sku||"").toLowerCase().includes(s)||(d.barcode||"").toLowerCase().includes(s)).slice(0,10);if(a.length===0){o.innerHTML='<div style="padding:10px; color:var(--text-dim); text-align:center;">لا توجد أصناف تطابق البحث</div>',o.classList.remove("hidden");return}o.innerHTML=a.map(d=>{const n=d.averageCost||d.costPrice||0;return`
      <div class="autocomplete-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft);" onclick="selectAdjProduct('${d.id}', '${d.name.replace(/'/g,"\\'")}', '${d.sku||""}', ${n})">
        <strong>${d.sku||""}</strong> - ${d.name} <span style="font-size:10.5px; color:var(--text-dim);">متوسط التكلفة: ${y(n)}</span>
      </div>`}).join(""),o.classList.remove("hidden")}),document.addEventListener("click",t=>{!e.contains(t.target)&&!o.contains(t.target)&&o.classList.add("hidden")}))}window.selectAdjProduct=(e,o,t,s)=>{const a=document.getElementById("adj-product-search"),d=document.getElementById("adj-product"),n=document.getElementById("adj-cost"),i=document.getElementById("adj-product-results");d&&(d.value=e),a&&(a.value=`${t?t+" - ":""}${o}`),i&&i.classList.add("hidden"),n&&(n.value=s?s.toFixed(2):"0.00")};window.addAdjLine=()=>{const e=document.getElementById("adj-product"),o=document.getElementById("adj-product-search"),t=document.getElementById("adj-qty"),s=document.getElementById("adj-cost"),a=e?.value,d=parseFloat(t?.value)||0,n=parseFloat(s?.value)||0;if(!a){showToast("يرجى اختيار صنف أولاً","warn");return}if(d<=0){showToast("يرجى إدخال كمية صحيحة أكبر من صفر","warn");return}const i=E.find(r=>r.id===a);if(!i){showToast("لم يتم العثور على الصنف المختار","error");return}const c=window._adjLines.findIndex(r=>r.productId===a);c!==-1?(window._adjLines[c].qty+=d,window._adjLines[c].totalCost=window._adjLines[c].qty*window._adjLines[c].cost):window._adjLines.push({productId:a,productName:i.name,sku:i.sku,qty:d,cost:n,totalCost:d*n}),e&&(e.value=""),o&&(o.value=""),t&&(t.value="1"),s&&(s.value=""),U()};window.removeAdjLine=e=>{window._adjLines.splice(e,1),U()};function U(){const e=document.getElementById("adj-items-tbody"),o=document.getElementById("adj-total-cost-label");if(!e)return;if(window._adjLines.length===0){e.innerHTML='<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-dim); font-size:13px;">لا توجد أصناف مضافة بعد</td></tr>',o&&(o.textContent=y(0));return}let t=0;e.innerHTML=window._adjLines.map((s,a)=>(t+=s.totalCost,`
      <tr>
        <td class="mono font-bold">${s.sku||"—"}</td>
        <td><strong>${s.productName}</strong></td>
        <td class="mono" style="text-align:center;">${s.qty}</td>
        <td class="mono" style="text-align:left;">${y(s.cost)}</td>
        <td class="mono font-bold" style="text-align:left;">${y(s.totalCost)}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="removeAdjLine(${a})" title="حذف">✕</button>
        </td>
      </tr>
    `)).join(""),o&&(o.textContent=y(t))}window.printAdjDetail=async e=>{const{getById:o}=await Q(async()=>{const{getById:i}=await import("./index-CEMoTDyX.js").then(c=>c.T);return{getById:i}},__vite__mapDeps([0,1])),t=await o("inventoryAdjustments",e);if(!t){showToast("لم يتم العثور على مستند التسوية للطباعة","error");return}const s={damage:"إعدام سلع تالفة",add:"تسوية إضافة (+)",deduct:"تسوية خصم (-)","return-damaged":"مرتجع تالف للمورد",expired:"إعدام منتهي الصلاحية",donation:"تبرعات وهبات (سلة البركة)"},a=t.lines||[{productId:t.productId,productName:t.productName||"—",sku:t.sku||"—",qty:t.qty||0,cost:t.costPrice||0,totalCost:t.totalCost||(t.costPrice||0)*(t.qty||0)}],d=t.totalCost||a.reduce((i,c)=>i+(c.totalCost||0),0),n=window.open("","_blank");n.document.write(`
    <html>
    <head>
      <title>سند تسوية مخزنية #${t.id.slice(0,8)}</title>
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
          <p>رقم السند: <strong>${t.id.slice(0,8).toUpperCase()}</strong></p>
        </div>
        <div style="text-align: left;">
          <p>التاريخ: ${t.date}</p>
          <p>المستودع: ${t.warehouseName||"المستودع الرئيسي"}</p>
        </div>
      </div>
      <div class="details">
        <div>نوع المعاملة: <strong>${s[t.type]||t.type}</strong></div>
        <div>البيان / السبب: <strong>${t.notes||"—"}</strong></div>
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
          ${a.map((i,c)=>`
            <tr>
              <td>${c+1}</td>
              <td>${i.sku||"—"}</td>
              <td>${i.productName||"—"}</td>
              <td style="text-align:center;">${i.qty}</td>
              <td style="text-align:left;">${y(i.cost||0)}</td>
              <td style="text-align:left;">${y(i.totalCost||0)}</td>
            </tr>
          `).join("")}
          <tr style="font-weight:bold; background:#f9f9f9;">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td style="text-align:left;">${y(d)}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="signature">توقيع أمين المستودع</div>
        <div class="signature">توقيع المدير المالي</div>
      </div>
      <script>window.print();<\/script>
    </body>
    </html>
  `),n.document.close()};window.editAdjustment=async e=>{try{const{getById:o}=await Q(async()=>{const{getById:a}=await import("./index-CEMoTDyX.js").then(d=>d.T);return{getById:a}},__vite__mapDeps([0,1])),t=await o("inventoryAdjustments",e);if(!t){showToast("لم يتم العثور على التسوية","error");return}window._editingAdjId=e,document.getElementById("adj-type").value=t.type||"damage",document.getElementById("adj-wh").value=t.warehouseId||"",document.getElementById("adj-date").value=t.date||P(),document.getElementById("adj-notes").value=t.notes||"",document.getElementById("adj-product").value="",document.getElementById("adj-product-search").value="",document.getElementById("adj-qty").value="1",document.getElementById("adj-cost").value="",t.lines&&Array.isArray(t.lines)?window._adjLines=t.lines.map(a=>({...a})):window._adjLines=[{productId:t.productId,productName:t.productName||"—",sku:t.sku||"—",qty:t.qty||0,cost:t.costPrice||0,totalCost:t.totalCost||(t.costPrice||0)*(t.qty||0)}],U();const s=document.getElementById("save-adj-btn");s&&(s.textContent="💾 حفظ التعديلات وتحديث القيود"),openModal("adj-modal")}catch(o){showToast("خطأ أثناء تحميل التسوية: "+o.message,"error")}};window.deleteAdjustment=async e=>{if(confirm("⚠️ هل أنت متأكد من حذف هذه التسوية نهائياً؟ سيتم استعادة الكميات في المخزن وحذف قيود اليومية المرتبطة بها."))try{const o=W(S,`companies/${O}/inventoryAdjustments`,e),t=await V(o);if(!t.exists()){alert("لم يتم العثور على التسوية في قاعدة البيانات!");return}const s={id:t.id,...t.data()},a=s.lines||[{productId:s.productId,qty:s.qty}];if(!!(await x(I(J(S,`companies/${O}/stockTransactions`),K("sourceId","==",e)))).empty)console.log(`[Delete] No stockTransactions for ${e} — skipping reversal (phantom record)`);else for(const i of a){if(!i.productId||!i.qty||!s.warehouseId)continue;const c=["damage","deduct","expired","return-damaged","donation"].includes(s.type)?+i.qty:-i.qty;try{await M(s.warehouseId,i.productId,c,{type:"adjustment_delete",sourceType:"inventoryAdjustment",sourceId:e,allowNegative:!0})}catch(r){console.warn("[Delete] Stock reversal skipped for",i.productId,r.message)}}try{const{deleteJournalEntry:i}=await Q(async()=>{const{deleteJournalEntry:r}=await import("./index-CEMoTDyX.js").then(p=>p.T);return{deleteJournalEntry:r}},__vite__mapDeps([0,1])),c=await x(I(J(S,`companies/${O}/journalEntries`),K("sourceId","==",e)));for(const r of c.docs)try{await i(r.id)}catch(p){console.warn("[Delete] JE delete failed:",p.message)}}catch(i){console.warn("[Delete] JE query failed:",i.message)}await Z("inventoryAdjustments",e),showToast("تم حذف التسوية واسترداد المخزون وإلغاء القيود بنجاح ✅","success"),switchOpsSubModule("adjust")}catch(o){console.error("[deleteAdjustment] Fatal error:",o),alert(`❌ خطأ أثناء الحذف:

`+o.message)}};export{Bt as render};
