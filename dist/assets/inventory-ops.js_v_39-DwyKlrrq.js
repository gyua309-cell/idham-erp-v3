const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{t as N,g as E,C as m,n as q,u as S,f as g,_ as A,v as M,e as Q,k as b,d as V,a as z}from"./index-HrCilPJ3.js";import{orderBy as f,query as k,getDocs as x,limit as ot,doc as W,getDoc as G,deleteDoc as st}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let $=[],_=[],w=[],L=[],R=[],v="request";async function xt(e,s){e.innerHTML=`
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
          <div class="form-group"><label>تاريخ الطلب *</label><input type="date" id="pr-date" class="input" value="${N()}" /></div>
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
          <div class="form-group"><label>تاريخ الأمر *</label><input type="date" id="po-date" class="input" value="${N()}" /></div>
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
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="grpo-date" class="input" value="${N()}" /></div>
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
          <div class="form-group"><label>تاريخ الفحص *</label><input type="date" id="qi-date" class="input" value="${N()}" /></div>
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
          <div class="form-group"><label>تاريخ العملية</label><input type="date" id="asm-date" class="input" value="${N()}" /></div>
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
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title">تسوية وصرف وإهلاك مخزني</h3><button class="modal-close" onclick="closeModal('adj-modal')">×</button></div>
      <div class="modal-body">
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>نوع العملية *</label>
            <select id="adj-type" class="input">
              <option value="damage">إعدام سلع تالفة (Damage Write-off)</option>
              <option value="add">تسوية إضافة (+)</option>
              <option value="deduct">تسوية خصم (-)</option>
              <option value="return-damaged">مرتجع تالف للمورد</option>
              <option value="expired">إعدام منتهي الصلاحية</option>
            </select>
          </div>
          <div class="form-group"><label>المستودع المتأثر *</label><select id="adj-wh" class="input"></select></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>الصنف *</label><select id="adj-product" class="input"></select></div>
          <div class="form-group"><label>الكمية *</label><input type="number" id="adj-qty" class="input mono" min="1" value="1" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>التاريخ *</label><input type="date" id="adj-date" class="input" value="${N()}" /></div>
          <div class="form-group"><label>تكلفة الوحدة (ر.س)</label><input type="number" id="adj-cost" class="input mono" step="0.01" placeholder="0.00" /></div>
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
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📄 تفاصيل جرد المخزون</h3><button class="modal-close" onclick="closeModal('spot-count-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="sc-detail-body">
        <!-- Content injected dynamically -->
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('spot-count-detail-modal')">إغلاق</button>
        <button class="btn btn-primary" onclick="window.printActiveSpotCount()">🖨️ طباعة تقرير الجرد</button>
      </div></div>
    </div>
  `,await Promise.all([at(),switchOpsSubModule(v)])}async function at(){const[e,s,t,o,a]=await Promise.all([E(m.products(),[f("sku")]),E(m.categories(),[f("name")]),E(m.warehouses(),[f("name")]),E(m.chartOfAccounts(),[f("code")]),E(m.suppliers(),[f("name")])]);$=e,_=s,w=t,L=o,R=a;const d=w.map(u=>`<option value="${u.id}">${u.name}</option>`).join(""),n='<option value="">اختر...</option>'+$.map(u=>`<option value="${u.id}" data-cost="${u.costPrice||0}">${u.sku} - ${u.name}</option>`).join(""),c='<option value="">اختر المورد...</option>'+R.map(u=>`<option value="${u.id}">${u.name}</option>`).join(""),i='<option value="">كل الفئات</option>'+_.map(u=>`<option value="${u.id}">${u.name}</option>`).join(""),r=document.getElementById("pr-item-cat");r&&(r.innerHTML=i);const p=document.getElementById("po-item-cat");p&&(p.innerHTML=i),document.getElementById("pr-wh").innerHTML=d,document.getElementById("po-wh").innerHTML=d,document.getElementById("grpo-wh").innerHTML=d,document.getElementById("qi-wh").innerHTML=d,document.getElementById("asm-wh").innerHTML=d,document.getElementById("adj-wh").innerHTML=d;const l=(u,y)=>{const P=document.getElementById(u);P&&(P.innerHTML=y)};l("dsp-wh",d),l("dsp-item-sel",n),l("veh-src-wh",d),l("veh-dst-wh",w.filter(u=>u.type==="Vehicle").map(u=>`<option value="${u.id}">${u.name}</option>`).join("")||d),l("veh-item-sel",n),l("sc-wh",d),l("sc-wh2",'<option value="">-- لا يوجد --</option>'+d),l("rv-wh",d),l("rv-product",n),document.getElementById("po-supplier").innerHTML=c,document.getElementById("pr-item-sel").innerHTML=n,document.getElementById("po-item-sel").innerHTML=n,document.getElementById("qi-product").innerHTML=n,document.getElementById("asm-product").innerHTML=n,document.getElementById("asm-component-sel").innerHTML=n,document.getElementById("adj-product").innerHTML=n;const h=new Date().toISOString().slice(0,10);["dsp-date","veh-date","sc-date","rv-date"].forEach(u=>{const y=document.getElementById(u);y&&!y.value&&(y.value=h)})}window.switchOpsSubModule=async e=>{v=e;const s=document.getElementById("ops-content-area");s.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>';try{if(e==="request"){const t=k(m.purchaseRequests(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));dt(s,a)}else if(e==="po"){const t=k(m.purchaseOrders(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));nt(s,a)}else if(e==="grpo"){const t=k(m.goodsReceiptPOs(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));it(s,a)}else if(e==="inspect"){const t=k(m.qualityInspections(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));lt(s,a)}else if(e==="assemble"){const t=k(m.productAssemblies(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));ct(s,a)}else if(e==="adjust"){const t=k(m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()}));rt(s,a)}else if(e==="dispatch"){const t=k(m.stockDispatches?.()||m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="dispatch");pt(s,a)}else if(e==="vehicle"){const t=k(m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-load");ut(s,a)}else if(e==="vehicle-return"){const t=k(m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-return");mt(s,a)}else if(e==="spot-count"){const t=k(m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="spot-count");ht(s,a)}else if(e==="revalue"){const t=k(m.inventoryAdjustments(),f("createdAt","desc")),a=(await x(t)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="revalue");bt(s,a)}}catch(t){s.innerHTML=`<div class="alert bad">${t.message}</div>`}};window.openOpsModal=async()=>{if(v==="request")C=[],document.getElementById("pr-lines-tbody").innerHTML="",document.getElementById("pr-notes").value="",openModal("pr-modal");else if(v==="po")j=[],document.getElementById("po-lines-tbody").innerHTML="",document.getElementById("po-notes").value="",openModal("po-modal");else if(v==="grpo"){const e=k(m.purchaseOrders(),f("createdAt","desc")),t=(await x(e)).docs.map(a=>({id:a.id,...a.data()})).filter(a=>a.status==="ordered"),o=document.getElementById("grpo-po-select");o.innerHTML='<option value="">اختر أمر شراء للتحويل...</option>'+t.map(a=>`<option value="${a.id}">${a.poNumber||a.id} — ${a.supplierName}</option>`).join(""),document.getElementById("grpo-lines-tbody").innerHTML='<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>',document.getElementById("save-grpo-btn").disabled=!0,openModal("grpo-modal")}else v==="inspect"?(document.getElementById("qi-batch").value="",document.getElementById("qi-temp").value="",document.getElementById("qi-notes").value="",openModal("qi-modal")):v==="assemble"?(O=[],document.getElementById("asm-lines-tbody").innerHTML="",document.getElementById("asm-qty").value="1",openModal("asm-modal")):v==="adjust"&&(document.getElementById("adj-qty").value="1",document.getElementById("adj-notes").value="",openModal("adj-modal"))};let C=[];window.addPRItem=()=>{const e=document.getElementById("pr-item-sel"),s=parseInt(document.getElementById("pr-item-qty").value)||0;if(!e.value||s<=0)return;const t=$.find(o=>o.id===e.value);C.some(o=>o.productId===e.value)||(C.push({productId:e.value,name:t.name,sku:t.sku,qty:s}),U())};function U(){document.getElementById("pr-lines-tbody").innerHTML=C.map((e,s)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePRItem(${s})">×</button></td>
    </tr>
  `).join("")}window.removePRItem=e=>{C.splice(e,1),U()};window.savePurchaseRequest=async()=>{const e=document.getElementById("pr-error");if(e.classList.add("hidden"),!C.length){e.textContent="يرجى إضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const s=document.getElementById("save-pr-btn");s.disabled=!0;try{const t=document.getElementById("pr-wh").value;await q(m.purchaseRequests(),{date:document.getElementById("pr-date").value,warehouseId:t,warehouseName:w.find(o=>o.id===t)?.name,items:C,notes:document.getElementById("pr-notes").value.trim(),status:"pending_approval"}),showToast("تم تقديم طلب الشراء للاعتماد","success"),closeModal("pr-modal"),switchOpsSubModule("request")}catch(t){e.textContent=t.message,e.classList.remove("hidden")}finally{s.disabled=!1}};function dt(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📝</div><p>لا توجد طلبات شراء مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>المستودع</th><th>الأصناف المطلوبة</th><th>البيان</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${s.map(t=>`
          <tr>
            <td>${t.date}</td>
            <td><strong>${t.warehouseName}</strong></td>
            <td>${(t.items||[]).map(o=>`${o.name} (${o.qty})`).join("، ")}</td>
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
  `}window.approvePR=async(e,s)=>{if(confirm(`هل تريد تأكيد ${s==="approved"?"اعتماد":"رفض"} هذا الطلب؟`))try{await S("purchaseRequests",e,{status:s}),showToast("تم تحديث حالة طلب الشراء","success"),switchOpsSubModule("request")}catch(t){showToast(t.message,"error")}};let j=[];window.onPOSelItemChange=e=>{const s=document.getElementById("po-item-sel"),t=s.options[s.selectedIndex],o=parseFloat(t.getAttribute("data-cost"))||0;document.getElementById("po-item-cost").value=o.toFixed(2)};window.filterOpsProducts=(e,s)=>{const t=document.getElementById(e);if(!t)return;const o=s?$.filter(a=>a.category===s):$;if(t.innerHTML='<option value="">اختر...</option>'+o.map(a=>`<option value="${a.id}" data-cost="${a.costPrice||0}">${a.sku} - ${a.name}</option>`).join(""),e==="po-item-sel"){const a=document.getElementById("po-item-cost");a&&(a.value="0.00")}};window.addPOItem=()=>{const e=document.getElementById("po-item-sel"),s=parseInt(document.getElementById("po-item-qty").value)||0,t=parseFloat(document.getElementById("po-item-cost").value)||0;if(!e.value||s<=0||t<0)return;const o=$.find(a=>a.id===e.value);j.some(a=>a.productId===e.value)||(j.push({productId:e.value,name:o.name,sku:o.sku,qty:s,unitPrice:t}),K())};function K(){document.getElementById("po-lines-tbody").innerHTML=j.map((e,s)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td class="mono">${g(e.unitPrice)}</td>
      <td class="mono font-bold">${g(e.qty*e.unitPrice)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removePOItem(${s})">×</button></td>
    </tr>
  `).join("")}window.removePOItem=e=>{j.splice(e,1),K()};window.savePurchaseOrder=async()=>{const e=document.getElementById("po-error");e.classList.add("hidden");const s=document.getElementById("po-supplier").value,t=document.getElementById("po-wh").value;if(!s||!t||!j.length){e.textContent="يرجى اختيار المورد والمستودع وإضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const o=document.getElementById("save-po-btn");o.disabled=!0;try{const a=`PO-${Date.now().toString().substring(6)}`;await q(m.purchaseOrders(),{poNumber:a,date:document.getElementById("po-date").value,supplierId:s,supplierName:R.find(d=>d.id===s)?.name,warehouseId:t,warehouseName:w.find(d=>d.id===t)?.name,items:j,notes:document.getElementById("po-notes").value.trim(),status:"ordered"}),showToast("تم إصدار أمر الشراء بنجاح","success"),closeModal("po-modal"),switchOpsSubModule("po")}catch(a){e.textContent=a.message,e.classList.remove("hidden")}finally{o.disabled=!1}};function nt(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📜</div><p>لا توجد أوامر شراء مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الأمر</th><th>التاريخ</th><th>المورد</th><th>المستودع</th><th>القيمة الإجمالية</th><th>الحالة</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${s.map(t=>{const o=(t.items||[]).reduce((a,d)=>a+d.qty*d.unitPrice,0);return`
            <tr>
              <td class="mono font-bold">${t.poNumber}</td>
              <td>${t.date}</td>
              <td><strong>${t.supplierName}</strong></td>
              <td>${t.warehouseName}</td>
              <td class="mono font-bold text-indigo">${g(o)}</td>
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
  `}window.cancelPO=async e=>{if(confirm("هل تريد إلغاء أمر الشراء هذا؟"))try{await S("purchaseOrders",e,{status:"cancelled"}),showToast("تم إلغاء أمر الشراء","success"),switchOpsSubModule("po")}catch(s){showToast(s.message,"error")}};window.printPODetail=async e=>{const{getById:s}=await A(async()=>{const{getById:d}=await import("./index-HrCilPJ3.js").then(n=>n.N);return{getById:d}},__vite__mapDeps([0,1])),t=await s("purchaseOrders",e);if(!t)return;const o=(t.items||[]).reduce((d,n)=>d+n.qty*n.unitPrice,0),a=window.open("","_blank");a.document.write(`
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
              <td>${g(d.unitPrice)}</td>
              <td>${g(d.qty*d.unitPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">الإجمالي الكلي: ${g(o)}</h3>
      <script>window.print();<\/script>
    </body>
    </html>
  `),a.document.close()};let I=null;window.updateGrpoAltQty=(e,s)=>{const t=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!t)return;const o=t.querySelector(".grpo-qty-alt"),a=t.querySelector(".grpo-qty");if(o&&a){const d=parseFloat(o.value)||0;a.value=Math.round(d*s)}};window.updateGrpoBaseQty=(e,s)=>{const t=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!t)return;const o=t.querySelector(".grpo-qty-alt"),a=t.querySelector(".grpo-qty");if(o&&a){const d=parseFloat(a.value)||0;o.value=(d/s).toFixed(2).replace(/\.00$/,"")}};window.loadPOToGRPO=async e=>{const s=document.getElementById("grpo-lines-tbody"),t=document.getElementById("save-grpo-btn");if(!e){s.innerHTML='<tr><td colspan="6" class="dim" style="text-align:center;">يرجى اختيار أمر شراء لاستيراد بياناته</td></tr>',t.disabled=!0;return}s.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const{getById:o}=await A(async()=>{const{getById:d}=await import("./index-HrCilPJ3.js").then(n=>n.N);return{getById:d}},__vite__mapDeps([0,1]));if(I=await o("purchaseOrders",e),!I)throw new Error("أمر الشراء غير موجود");const a=document.getElementById("grpo-wh");a.value=I.warehouseId,s.innerHTML=(I.items||[]).map((d,n)=>{const c=$.find(u=>u.id===d.productId)||{},i=c.unit||"حبة",r=c.altUnit||"",p=parseInt(c.unitFactor)||1;let l=0,h=d.qty;return r&&p>1&&(l=(d.qty/p).toFixed(2).replace(/\.00$/,"")),`
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
              <input type="number" class="input mono grpo-qty" style="height:28px; width:90px;" value="${h}" min="1" oninput="updateGrpoBaseQty(${n}, ${p})" data-idx="${n}" />
              <span class="dim" style="font-size:11px;">${i}</span>
            </div>
          </td>
          <td><input type="number" class="input mono grpo-cost" style="height:28px; width:90px;" value="${d.unitPrice}" step="0.01" data-idx="${n}" /></td>
          <td><input type="text" class="input mono grpo-batch" style="height:28px; width:90px;" placeholder="Batch#" data-idx="${n}" /></td>
          <td><input type="date" class="input grpo-expiry" style="height:28px;" data-idx="${n}" /></td>
        </tr>
      `}).join(""),t.disabled=!1}catch(o){s.innerHTML=`<tr><td colspan="6" class="text-bad" style="text-align:center;">${o.message}</td></tr>`,t.disabled=!0}};window.saveGRPO=async()=>{const e=document.getElementById("grpo-error");if(e.classList.add("hidden"),!I)return;const s=document.querySelectorAll("#grpo-lines-tbody tr"),t=[];let o=0;for(let d=0;d<s.length;d++){const n=s[d],c=parseInt(n.getAttribute("data-idx")),i=(I.items||[])[c];if(!i)continue;const r=n.querySelector(".grpo-qty"),p=n.querySelector(".grpo-cost"),l=n.querySelector(".grpo-batch"),h=n.querySelector(".grpo-expiry"),u=n.querySelector(".grpo-qty-alt"),y=parseInt(r?.value)||0,P=parseFloat(p?.value)||0,Y=l?.value.trim()||"",Z=h?.value||"",tt=u&&parseFloat(u.value)||0;if(y<=0||P<=0){e.textContent="يرجى إدخال كميات وأسعار صحيحة لكافة السطور",e.classList.remove("hidden");return}const H=$.find(et=>et.id===i.productId)||{};t.push({productId:i.productId,sku:i.sku,name:i.name,qty:y,unitPrice:P,batchNumber:Y||null,expiryDate:Z||null,unit:H.unit||"حبة",altUnit:H.altUnit||null,unitFactor:parseInt(H.unitFactor)||1,qtyAlt:tt}),o+=y*P}const a=document.getElementById("save-grpo-btn");a.disabled=!0;try{const d=`GRPO-${Date.now().toString().substring(6)}`,n=document.getElementById("grpo-date").value,c=I.warehouseId,i=await q(m.goodsReceiptPOs(),{grpoNumber:d,date:n,purchaseOrderId:I.id,poNumber:I.poNumber,supplierId:I.supplierId,supplierName:I.supplierName,warehouseId:c,warehouseName:I.warehouseName,items:t,totalValue:o,status:"received"});for(const l of t)await M(c,l.productId,l.qty,{type:"purchase_in",sourceType:"goodsReceiptPO",sourceId:i,purchasePrice:l.unitPrice,batchNumber:l.batchNumber,expiryDate:l.expiryDate});await S("purchaseOrders",I.id,{status:"received"});const r=L.find(l=>l.code==="1-1-4-1-01")||L.find(l=>l.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"},p=L.find(l=>l.code==="2-1-1-1-1")||L.find(l=>l.code==="2-1-1-1")||{id:"AP_SUPPLIERS",code:"2-1-1-1-1",name:"ذمم موردون محليون"};await Q({date:n,description:`إذن استلام بضاعة مخزني #${d} لـ ${I.supplierName}`,sourceType:"goodsReceiptPO",sourceId:i,lines:[{accountId:r.id,accountCode:r.code,accountName:r.name,debit:o,credit:0,note:"إثبات استلام مخزون"},{accountId:p.id,accountCode:p.code,accountName:p.name,debit:0,credit:o,note:"إثبات التزام الموردين"}]}),showToast("تم إثبات استلام البضاعة مخزنياً ومحاسبياً","success"),closeModal("grpo-modal"),switchOpsSubModule("grpo")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{a.disabled=!1}};function it(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">📦</div><p>لا توجد أذونات استلام مخزنية</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>رقم الإذن</th><th>التاريخ</th><th>أمر الشراء</th><th>المورد</th><th>المستودع</th><th>قيمة الوارد المالي</th><th class="no-print">إجراءات</th></tr></thead>
      <tbody>
        ${s.map(t=>`
          <tr>
            <td class="mono font-bold">${t.grpoNumber}</td>
            <td>${t.date}</td>
            <td class="mono font-bold text-dim">${t.poNumber}</td>
            <td><strong>${t.supplierName}</strong></td>
            <td>${t.warehouseName}</td>
            <td class="mono font-bold text-good">${g(t.totalValue)}</td>
            <td class="no-print" style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-ghost" onclick="printGRPODetail('${t.id}')">🖨️ طباعة</button>
              <button class="btn btn-sm btn-primary" onclick="convertGRPOToInvoice('${t.id}')" style="background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; padding:4px 8px; font-size:11px;">📄 تحويل لفاتورة</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.printGRPODetail=async e=>{const{getById:s}=await A(async()=>{const{getById:a}=await import("./index-HrCilPJ3.js").then(d=>d.N);return{getById:a}},__vite__mapDeps([0,1])),t=await s("goodsReceiptPOs",e);if(!t)return;const o=window.open("","_blank");o.document.write(`
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
          ${(t.items||[]).map((a,d)=>{const c=a.altUnit&&a.unitFactor>1?`${a.qtyAlt||(a.qty/a.unitFactor).toFixed(2).replace(/\.00$/,"")} ${a.altUnit}`:"—",i=`${a.qty} ${a.unit||"حبة"}`;return`
              <tr>
                <td>${d+1}</td>
                <td>${a.sku} - ${a.name}</td>
                <td>${c}</td>
                <td>${i}</td>
                <td>${g(a.unitPrice)}</td>
                <td>${a.batchNumber||"—"}</td>
                <td>${a.expiryDate||"—"}</td>
                <td>${g(a.qty*a.unitPrice)}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
      <h3 style="text-align:left; margin-top:20px;">القيمة المالية التراكمية: ${g(t.totalValue)}</h3>
      <script>window.print();<\/script>
    </body>
    </html>
  `),o.document.close()};window.convertGRPOToInvoice=async e=>{try{const{getById:s}=await A(async()=>{const{getById:o}=await import("./index-HrCilPJ3.js").then(a=>a.N);return{getById:o}},__vite__mapDeps([0,1])),t=await s("goodsReceiptPOs",e);if(!t){showToast("إذن الاستلام غير موجود","error");return}sessionStorage.setItem("convert_grpo_to_invoice",JSON.stringify({grpoId:t.id,grpoNumber:t.grpoNumber,supplierId:t.supplierId||"",supplierName:t.supplierName||"",warehouseId:t.warehouseId||"",warehouseName:t.warehouseName||"",items:(t.items||[]).map(o=>({productId:o.productId,productName:o.name,sku:o.sku||"",unit:o.unit||"PCS",qty:o.qty||0,unitPrice:o.unitPrice||0,batchNumber:o.batchNumber||"",expiryDate:o.expiryDate||""})),totalValue:t.totalValue})),showToast("تم تحويل إذن الاستلام بنجاح. يتم تحويلك الآن لوحدة الفواتير المشتريات...","success"),typeof navigate=="function"&&navigate("purchase-invoices")}catch(s){showToast(s.message,"error")}};window.saveQualityInspection=async()=>{const e=document.getElementById("qi-error");e.classList.add("hidden");const s=document.getElementById("qi-batch").value.trim().toUpperCase(),t=parseFloat(document.getElementById("qi-temp").value),o=document.getElementById("qi-product").value,a=document.getElementById("qi-prod-date").value,d=document.getElementById("qi-expiry").value,n=document.getElementById("qi-wh").value,c=document.getElementById("qi-status").value;if(!s||isNaN(t)||!o||!a||!d||!n){e.textContent="يرجى تعبئة كافة الحقول المطلوبة",e.classList.remove("hidden");return}const i=document.getElementById("save-qi-btn");i.disabled=!0;try{const r=$.find(p=>p.id===o);await q(m.qualityInspections(),{date:document.getElementById("qi-date").value,batchNumber:s,temperatureRecorded:t,productId:o,productName:r.name,sku:r.sku,productionDate:a,expiryDate:d,status:c,warehouseId:n,warehouseName:w.find(p=>p.id===n)?.name,notes:document.getElementById("qi-notes").value.trim()}),showToast("تم تسجيل وحفظ فحص الجودة","success"),closeModal("qi-modal"),switchOpsSubModule("inspect")}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{i.disabled=!1}};function lt(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🌡️</div><p>لا توجد فحوصات جودة مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>الصنف</th><th>التشغيلة (Batch)</th><th>الحرارة (°م)</th><th>صلاحية الشحنة</th><th>المستودع</th><th>حالة الفحص</th></tr></thead>
      <tbody>
        ${s.map(t=>`
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
  `}let O=[];window.addAssemblyComponent=()=>{const e=document.getElementById("asm-component-sel"),s=parseInt(document.getElementById("asm-component-qty").value)||0;if(!e.value||s<=0)return;const t=$.find(o=>o.id===e.value);O.some(o=>o.productId===e.value)||(O.push({productId:e.value,name:t.name,sku:t.sku,qty:s}),J())};function J(){document.getElementById("asm-lines-tbody").innerHTML=O.map((e,s)=>`
    <tr>
      <td>${e.sku} - ${e.name}</td>
      <td class="mono font-bold">${e.qty}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="removeAsmLine(${s})">×</button></td>
    </tr>
  `).join("")}window.removeAsmLine=e=>{O.splice(e,1),J()};window.saveAssembly=async()=>{const e=document.getElementById("asm-error");e.classList.add("hidden");const s=document.getElementById("asm-type").value,t=document.getElementById("asm-product").value,o=parseInt(document.getElementById("asm-qty").value)||0,a=document.getElementById("asm-wh").value,d=document.getElementById("asm-date").value;if(!t||o<=0||!a||!O.length){e.textContent="يرجى تعبئة كافة الحقول وتحديد المكونات",e.classList.remove("hidden");return}const n=document.getElementById("save-asm-btn");n.disabled=!0;try{const c=$.find(h=>h.id===t),i=await q(m.productAssemblies(),{type:s,date:d,parentProductId:t,parentProductName:c.name,parentSku:c.sku,quantity:o,warehouseId:a,warehouseName:w.find(h=>h.id===a)?.name,components:O}),p=(c.costPrice||0)*o,l=L.find(h=>h.code==="1-1-4-1-01")||L.find(h=>h.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"};await Q({date:d,description:`عملية ${s==="assembly"?"تجميع":"تفكيك"} منتج #${c.sku}`,sourceType:"assembly",sourceId:i,lines:[{accountId:l.id,accountCode:l.code,accountName:l.name,debit:s==="assembly"?p:0,credit:s==="assembly"?0:p,note:"تأثير مخزون المنتج الرئيسي"},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:s==="assembly"?0:p,credit:s==="assembly"?p:0,note:"تأثير المخزون للمكونات"}]}),showToast("تم تنفيذ عملية التجميع وتأثير المخزون بنجاح","success"),closeModal("asm-modal"),switchOpsSubModule("assemble")}catch(c){e.textContent=c.message,e.classList.remove("hidden")}finally{n.disabled=!1}};function ct(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🛠️</div><p>لا توجد عمليات تجميع/تفكيك</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>النوع</th><th>الحزمة (المنتج الرئيسي)</th><th>الكمية</th><th>المستودع</th><th>المكونات الفرعية</th></tr></thead>
      <tbody>
        ${s.map(t=>`
          <tr>
            <td>${t.date}</td>
            <td><span class="badge ${t.type==="assembly"?"good":"warn"}">${t.type==="assembly"?"تجميع":"تفكيك"}</span></td>
            <td><strong>${t.parentSku} — ${t.parentProductName}</strong></td>
            <td class="mono font-bold">${t.quantity}</td>
            <td>${t.warehouseName}</td>
            <td class="dim">${t.components.map(o=>`${o.name} (${o.qty})`).join("، ")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.saveAdjustment=async()=>{const e=document.getElementById("adj-error");e.classList.add("hidden");const s=document.getElementById("adj-type").value,t=document.getElementById("adj-product").value,o=parseInt(document.getElementById("adj-qty").value)||0,a=document.getElementById("adj-wh").value,d=document.getElementById("adj-date").value,n=document.getElementById("adj-notes").value.trim();if(!t||o<=0||!a||!d){e.textContent="يرجى تعبئة كافة الحقول المطلوبة",e.classList.remove("hidden");return}const c=document.getElementById("save-adj-btn");c.disabled=!0;try{const i=$.find(y=>y.id===t),r=await q(m.inventoryAdjustments(),{type:s,date:d,productId:t,productName:i.name,sku:i.sku,qty:o,warehouseId:a,warehouseName:w.find(y=>y.id===a)?.name,notes:n}),l=(i.costPrice||0)*o,h=L.find(y=>y.code==="1-1-4-1-01")||L.find(y=>y.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون المستودع الرئيسي"},u=L.find(y=>y.code==="5-7")||{id:"STOCK_LOSS",code:"5-7",name:"المخصصات والخسائر المحتملة"};s==="damage"||s==="deduct"?(await M(a,t,-o,{type:"adjustment_out",sourceType:"inventoryAdjustment",sourceId:r}),await Q({date:d,description:`${s==="damage"?"إهلاك تالف":"تسوية خصم"} لصنف #${i.sku} - ${n}`,sourceType:"inventory_adjustment",sourceId:r,lines:[{accountId:u.id,accountCode:u.code,accountName:u.name,debit:l,credit:0,note:"إثبات خسارة إعدام المخزون"},{accountId:h.id,accountCode:h.code,accountName:h.name,debit:0,credit:l,note:"تخفيض قيمة المخزون"}]})):(await M(a,t,o,{type:"adjustment_in",sourceType:"inventoryAdjustment",sourceId:r}),await Q({date:d,description:`تسوية إضافة لصنف #${i.sku} - ${n}`,sourceType:"inventory_adjustment",sourceId:r,lines:[{accountId:h.id,accountCode:h.code,accountName:h.name,debit:l,credit:0,note:"زيادة قيمة المخزون"},{accountId:u.id,accountCode:u.code,accountName:u.name,debit:0,credit:l,note:"تسوية فروقات جردية (زيادة)"}]})),showToast("تم تسجيل المعاملة وإنشاء القيود المحاسبية بنجاح","success"),closeModal("adj-modal"),switchOpsSubModule("adjust")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{c.disabled=!1}};function rt(e,s){if(s.length===0){e.innerHTML='<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔧</div><p>لا توجد تسويات مسجلة</p></div>';return}e.innerHTML=`
    <table class="data-dense" style="width:100%;">
      <thead><tr><th>التاريخ</th><th>نوع المعاملة</th><th>الصنف</th><th>الكمية</th><th>المستودع</th><th>البيان / أسباب العملية</th></tr></thead>
      <tbody>
        ${s.map(t=>{let o="";return t.type==="damage"?o='<span class="badge bad text-white">إعدام تالف</span>':t.type==="deduct"?o='<span class="badge warn text-white">تسوية خصم (-)</span>':o='<span class="badge good text-white">تسوية إضافة (+)</span>',`
            <tr>
              <td>${t.date}</td>
              <td>${o}</td>
              <td><strong>${t.sku} — ${t.productName}</strong></td>
              <td class="mono font-bold">${t.qty}</td>
              <td>${t.warehouseName}</td>
              <td class="dim">${t.notes||"—"}</td>
            </tr>
          `}).join("")}
      </tbody>
    </table>
  `}window.exportOpsToCSV=async()=>{showToast("جاري التصدير...","info");try{let e=[];if(v==="request"?e=await E(m.purchaseRequests()):v==="po"?e=await E(m.purchaseOrders()):v==="grpo"?e=await E(m.goodsReceiptPOs()):v==="inspect"?e=await E(m.qualityInspections()):v==="assemble"?e=await E(m.productAssemblies()):e=(await E(m.inventoryAdjustments())).filter(d=>d.opType===v||!d.opType),!e.length){showToast("لا توجد بيانات لتصديرها","warn");return}const s=Object.keys(e[0]),t=[s.join(",")];e.forEach(d=>{const n=s.map(c=>{const i=d[c];return typeof i=="object"?`"${JSON.stringify(i).replace(/"/g,'""')}"`:`"${String(i||"").replace(/"/g,'""')}"`});t.push(n.join(","))});const o=new Blob(["\uFEFF"+t.join(`
`)],{type:"text/csv;charset=utf-8;"}),a=document.createElement("a");a.href=URL.createObjectURL(o),a.download=`inventory_${v}_${N()}.csv`,a.click(),showToast("تم التصدير بنجاح","success")}catch(e){showToast(e.message,"error")}};let B=[];function pt(e,s){if(!s.length){e.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text-2);">
      <div style="font-size:40px;margin-bottom:12px;">📤</div>
      <div style="font-size:16px;font-weight:600;">لا توجد عمليات صرف مسجلة</div>
      <div style="font-size:13px;margin-top:8px;">استخدم "معاملة جديدة" لإنشاء أمر صرف</div>
    </div>`;return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>رقم الأمر</th><th>المخزن</th><th>الغرض</th><th>الأصناف</th><th>إجمالي التكلفة</th><th>الحالة</th><th></th></tr></thead>
    <tbody>${s.map(t=>`<tr>
      <td>${t.date||"—"}</td>
      <td class="mono font-bold">${t.number||t.id.slice(-6)}</td>
      <td>${t.warehouseName||"—"}</td>
      <td>${t.purpose==="internal"?"داخلي":t.purpose==="sales"?"مبيعات":t.purpose||"—"}</td>
      <td class="mono">${(t.lines||[]).length} صنف</td>
      <td class="mono">${g(t.totalCost||0)}</td>
      <td><span class="badge good" style="font-size:10px;">مُنفَّذ</span></td>
      <td></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}window.addDispatchItem=()=>{const e=document.getElementById("dsp-item-sel"),s=parseFloat(document.getElementById("dsp-item-qty").value)||1;if(!e.value){showToast("اختر صنفاً أولاً","warn");return}e.options[e.selectedIndex];const t=$.find(a=>a.id===e.value);if(!t)return;const o=B.find(a=>a.productId===e.value);o?o.qty+=s:B.push({productId:e.value,productName:t.name,sku:t.sku,qty:s,cost:t.costPrice||0}),X()};function X(){const e=document.getElementById("dsp-lines-tbody");if(!e)return;if(!B.length){e.innerHTML='<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد أصناف مضافة</td></tr>';return}let s=0;e.innerHTML=B.map((t,o)=>{const a=t.qty*t.cost;return s+=a,`<tr>
      <td>${t.productName} <span class="dim mono" style="font-size:11px;">${t.sku}</span></td>
      <td><input type="number" class="input mono" style="width:80px;" value="${t.qty}" min="1" onchange="dispatchLines[${o}].qty=parseFloat(this.value)||1; renderDspLines();" /></td>
      <td class="mono">${g(t.cost)}</td>
      <td class="mono font-bold">${g(a)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="dispatchLines.splice(${o},1); renderDspLines();">✕</button></td>
    </tr>`}).join("")+`<tr style="background:var(--bg-3);font-weight:700;"><td colspan="3">الإجمالي</td><td class="mono">${g(s)}</td><td></td></tr>`}window.saveDispatch=async()=>{const e=document.getElementById("dsp-error");e.classList.add("hidden");const s=document.getElementById("dsp-wh").value,t=document.getElementById("dsp-date").value,o=document.getElementById("dsp-purpose").value,a=document.getElementById("dsp-notes").value.trim();if(!s||!t||!B.length){e.textContent="يرجى اختيار المخزن والتاريخ وإضافة أصناف",e.classList.remove("hidden");return}const d=w.find(c=>c.id===s),n=document.getElementById("save-dsp-btn");n.disabled=!0,n.textContent="جارٍ التنفيذ…";try{const c=B.reduce((i,r)=>i+r.qty*r.cost,0);for(const i of B)await M({productId:i.productId,warehouseId:s,qty:-i.qty,cost:i.cost,type:"out",refType:"dispatch",note:`صرف: ${o}`});await q(m.inventoryAdjustments(),{opType:"dispatch",date:t,warehouseId:s,warehouseName:d?.name,purpose:o,lines:B,totalCost:c,notes:a,status:"confirmed",createdAt:new Date}),showToast(`✅ تم تنفيذ أمر الصرف بنجاح — ${B.length} صنف`,"success"),closeModal("dispatch-modal"),B=[],await switchOpsSubModule("dispatch")}catch(c){e.textContent=c.message,e.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="📤 تنفيذ الصرف"}};let T=[];function ut(e,s){if(!s.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🚐</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات تحميل مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>من مخزن</th><th>إلى سيارة</th><th>المندوب</th><th>الأصناف</th><th>الحالة</th></tr></thead>
    <tbody>${s.map(t=>`<tr>
      <td>${t.date||"—"}</td><td>${t.fromWarehouse||"—"}</td><td>${t.toWarehouse||"—"}</td>
      <td>${t.driver||"—"}</td><td class="mono">${(t.lines||[]).length} صنف</td>
      <td><span class="badge good" style="font-size:10px;">محمَّل</span></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}function mt(e,s){e.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔄</div><div style="font-size:16px;font-weight:600;">عمليات الاستلام من السيارة: ${s.length}</div></div>`}window.addVehicleItem=()=>{const e=document.getElementById("veh-item-sel"),s=parseFloat(document.getElementById("veh-item-qty").value)||1;if(!e.value){showToast("اختر صنفاً أولاً","warn");return}const t=$.find(d=>d.id===e.value);if(!t)return;const o=T.find(d=>d.productId===e.value);o?o.qty+=s:T.push({productId:e.value,productName:t.name,sku:t.sku,qty:s,cost:t.costPrice||0});const a=document.getElementById("veh-lines-tbody");a&&(a.innerHTML=T.map((d,n)=>`<tr>
    <td>${d.productName}</td>
    <td class="mono">${d.qty}</td>
    <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleLines.splice(${n},1); window.addVehicleItem();">✕</button></td>
  </tr>`).join(""))};window.saveVehicleLoad=async()=>{const e=document.getElementById("veh-error");e.classList.add("hidden");const s=document.getElementById("veh-src-wh").value,t=document.getElementById("veh-dst-wh").value,o=document.getElementById("veh-date").value,a=document.getElementById("veh-driver").value.trim(),d=document.getElementById("veh-notes").value.trim();if(!s||!t||!o||!T.length){e.textContent="يرجى تحديد المخازن والتاريخ والأصناف",e.classList.remove("hidden");return}const n=w.find(r=>r.id===s),c=w.find(r=>r.id===t),i=document.getElementById("save-veh-btn");i.disabled=!0;try{for(const r of T)await M({productId:r.productId,warehouseId:s,qty:-r.qty,cost:r.cost,type:"out",refType:"vehicle-load"}),await M({productId:r.productId,warehouseId:t,qty:r.qty,cost:r.cost,type:"in",refType:"vehicle-load"});await q(m.inventoryAdjustments(),{opType:"vehicle-load",date:o,fromWarehouse:n?.name,toWarehouse:c?.name,fromWarehouseId:s,toWarehouseId:t,driver:a,lines:T,notes:d,createdAt:new Date}),showToast(`✅ تم تحميل ${T.length} صنف على السيارة`,"success"),closeModal("vehicle-modal"),T=[],await switchOpsSubModule("vehicle")}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{i.disabled=!1,i.textContent="🚐 تأكيد التحميل"}};window.window.spotCountLines=[];function ht(e,s){if(!s.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">🔢</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات جرد مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الأصناف</th><th>الفروقات</th><th>الملاحظات</th><th class="no-print" style="text-align:center;">إجراءات</th></tr></thead>
    <tbody>${s.map(t=>`<tr>
      <td>${t.date||"—"}</td><td>${t.warehouseName||"—"}</td>
      <td class="mono">${(t.lines||[]).length}</td>
      <td class="mono ${(t.variances||0)>0?"text-bad":""}">${t.variances||0}</td>
      <td class="dim">${t.notes||"—"}</td>
      <td class="no-print" style="text-align:center;">
        <button class="btn btn-sm btn-ghost text-primary" onclick="window.showSpotCountDetail('${t.id}')">👁️ معاينة وتفاصيل</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteSpotCount('${t.id}')">❌ حذف وتراجع</button>
      </td>
    </tr>`).join("")}</tbody>
  </table></div></div>`}window.loadSpotCountItems=async()=>{const e=document.getElementById("sc-wh").value,s=document.getElementById("sc-wh2").value;if(!e){showToast("اختر المخزن الأول أولاً","warn");return}const t=document.getElementById("load-sc-btn");t.disabled=!0,t.textContent="جارٍ التحميل…";try{const[o,a]=await Promise.all([x(k(m.products(),f("name"),ot(200))),x(m.stockByWarehouse())]),d={};a.forEach(p=>{d[p.id]=p.data().qty||0}),window.spotCountLines=o.docs.map(p=>{const l={id:p.id,...p.data()},h=d[`${e}_${l.id}`]||0,u=s&&d[`${s}_${l.id}`]||0;return{productId:l.id,productName:l.name,sku:l.sku||"",bookQty1:h,actualQty1:h,bookQty2:u,actualQty2:u}});const n=document.getElementById("sc-table-thead"),c=document.getElementById("sc-lines-tbody"),i=w.find(p=>p.id===e)?.name||"مخزن 1",r=s?w.find(p=>p.id===s)?.name||"مخزن 2":"";s?(n&&(n.innerHTML=`<tr>
          <th>الصنف</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">دفتر (${i})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">فعلي (${i})</th>
          <th style="background:#eff6ff; color:#1e40af; text-align:center;">الفرق</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">دفتر (${r})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">فعلي (${r})</th>
          <th style="background:#fef2f2; color:#991b1b; text-align:center;">الفرق</th>
        </tr>`),c&&(c.innerHTML=window.spotCountLines.map((p,l)=>`<tr>
          <td style="text-align:right;">${p.productName} <span class="mono dim" style="font-size:11px;">${p.sku}</span></td>
          <td class="mono">${b(p.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${p.actualQty1}" step="0.001"
            oninput="window.window.spotCountLines[${l}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${l}, this)" /></td>
          <td id="sc-diff1-${l}" class="mono">0</td>
          <td class="mono">${b(p.bookQty2)}</td>
          <td><input type="number" class="input mono" style="width:80px; padding:4px;" value="${p.actualQty2}" step="0.001"
            oninput="window.window.spotCountLines[${l}].actualQty2=parseFloat(this.value)||0; window.updateSCDiff2(${l}, this)" /></td>
          <td id="sc-diff2-${l}" class="mono">0</td>
        </tr>`).join(""))):(n&&(n.innerHTML=`<tr>
          <th>الصنف</th>
          <th>الكمية الدفترية</th>
          <th>الكمية الفعلية</th>
          <th>الفرق</th>
        </tr>`),c&&(c.innerHTML=window.spotCountLines.map((p,l)=>`<tr>
          <td style="text-align:right;">${p.productName} <span class="mono dim" style="font-size:11px;">${p.sku}</span></td>
          <td class="mono">${b(p.bookQty1)}</td>
          <td><input type="number" class="input mono" style="width:90px; padding:4px;" value="${p.actualQty1}" step="0.001"
            oninput="window.window.spotCountLines[${l}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${l}, this)" /></td>
          <td id="sc-diff1-${l}" class="mono">0</td>
        </tr>`).join(""))),document.getElementById("save-sc-btn").disabled=!1,showToast(`تم تحميل ${window.spotCountLines.length} صنف بنجاح`,"success")}catch(o){showToast(o.message,"error")}finally{t.disabled=!1,t.textContent="📥 تحميل أصناف المخزن"}};window.updateSCDiff1=(e,s)=>{const t=window.spotCountLines[e];if(!t)return;t.actualQty1=parseFloat(s.value)||0;const o=t.actualQty1-t.bookQty1,a=document.getElementById(`sc-diff1-${e}`);a&&(a.textContent=o>=0?`+${b(o)}`:b(o),a.className=`mono ${o!==0?o<0?"text-bad":"text-good":""}`)};window.updateSCDiff2=(e,s)=>{const t=window.spotCountLines[e];if(!t)return;t.actualQty2=parseFloat(s.value)||0;const o=t.actualQty2-t.bookQty2,a=document.getElementById(`sc-diff2-${e}`);a&&(a.textContent=o>=0?`+${b(o)}`:b(o),a.className=`mono ${o!==0?o<0?"text-bad":"text-good":""}`)};window.saveSpotCount=async()=>{const e=document.getElementById("sc-error");e.classList.add("hidden");const s=document.getElementById("sc-wh").value,t=document.getElementById("sc-wh2").value,o=document.getElementById("sc-date").value,a=document.getElementById("sc-notes").value.trim();if(!s||!o||!window.spotCountLines.length){e.textContent="يرجى إكمال البيانات",e.classList.remove("hidden");return}const d=w.find(i=>i.id===s),n=t?w.find(i=>i.id===t):null,c=document.getElementById("save-sc-btn");c.disabled=!0,c.textContent="جارٍ الاعتماد…";try{let i=0;const r=window.spotCountLines.filter(l=>l.actualQty1!==l.bookQty1);for(const l of r){const h=l.actualQty1-l.bookQty1;await M(s,l.productId,h,{refType:"spot-count",note:`تسوية جرد مفاجئ - ${d?.name||"مخزن 1"}`}),i++}let p=[];if(t){p=window.spotCountLines.filter(l=>l.actualQty2!==l.bookQty2);for(const l of p){const h=l.actualQty2-l.bookQty2;await M(t,l.productId,h,{refType:"spot-count",note:`تسوية جرد مفاجئ - ${n?.name||"مخزن 2"}`}),i++}}await q(m.inventoryAdjustments(),{opType:"spot-count",date:o,warehouseId:s,warehouseName:d?.name||"",warehouseId2:t||"",warehouseName2:n?.name||"",lines:window.spotCountLines,variances:r.length+p.length,notes:a,createdAt:new Date}),showToast(`✅ تم اعتماد الجرد — تم إنشاء ${i} تسوية مخزنية`,"success"),closeModal("spot-count-modal"),window.spotCountLines=[],await switchOpsSubModule("spot-count")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{c.disabled=!1,c.textContent="✅ اعتماد الجرد وإنشاء تسويات"}};function bt(e,s){if(!s.length){e.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">💰</div><div style="font-size:16px;font-weight:600;">لا توجد عمليات إعادة تقييم مسجلة</div></div>';return}e.innerHTML=`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr><th>التاريخ</th><th>المخزن</th><th>الصنف</th><th>التكلفة القديمة</th><th>التكلفة الجديدة</th><th>الفرق</th><th>السبب</th></tr></thead>
    <tbody>${s.map(t=>{const o=(t.newCost||0)-(t.oldCost||0);return`<tr>
        <td>${t.date||"—"}</td><td>${t.warehouseName||"—"}</td><td>${t.productName||"—"}</td>
        <td class="mono">${g(t.oldCost||0)}</td>
        <td class="mono">${g(t.newCost||0)}</td>
        <td class="mono ${o<0?"text-bad":"text-good"}">${o>=0?"+":""}${g(o)}</td>
        <td class="dim">${t.notes||"—"}</td>
      </tr>`}).join("")}</tbody>
  </table></div></div>`}window.saveRevalue=async()=>{const e=document.getElementById("rv-error");e.classList.add("hidden");const s=document.getElementById("rv-wh").value,t=document.getElementById("rv-product").value,o=parseFloat(document.getElementById("rv-new-cost").value),a=document.getElementById("rv-date").value,d=document.getElementById("rv-notes").value.trim();if(!s||!t||!o||!a||!d){e.textContent="يرجى إكمال جميع الحقول المطلوبة",e.classList.remove("hidden");return}const n=w.find(p=>p.id===s),c=$.find(p=>p.id===t),i=c?.costPrice||0,r=document.getElementById("save-rv-btn");r.disabled=!0;try{await S("products",t,{costPrice:o,lastRevalueDate:a,lastRevalueBy:"system"}),await q(m.inventoryAdjustments(),{opType:"revalue",date:a,warehouseId:s,warehouseName:n?.name,productId:t,productName:c?.name,oldCost:i,newCost:o,notes:d,createdAt:new Date}),showToast(`✅ تم تحديث التكلفة من ${g(i)} إلى ${g(o)}`,"success"),closeModal("revalue-modal"),await switchOpsSubModule("revalue")}catch(p){e.textContent=p.message,e.classList.remove("hidden")}finally{r.disabled=!1,r.textContent="💰 تطبيق إعادة التقييم"}};const F=window.openOpsModal;window.openOpsModal=async()=>{if(v==="dispatch")B=[],X(),openModal("dispatch-modal");else if(v==="vehicle"){T=[];const e=document.getElementById("veh-lines-tbody");e&&(e.innerHTML=""),openModal("vehicle-modal")}else if(v==="vehicle-return")showToast("استخدم تحويل بضاعة لاستلام المرتجع من السيارة","warn");else if(v==="spot-count"){window.spotCountLines=[];const e=document.getElementById("sc-table-thead");e&&(e.innerHTML="<tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr>");const s=document.getElementById("sc-lines-tbody");s&&(s.innerHTML='<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">اختر المخزن لتحميل الأصناف</td></tr>'),document.getElementById("save-sc-btn").disabled=!0;const t=document.getElementById("sc-wh2");t&&(t.value=""),openModal("spot-count-modal")}else v==="revalue"?(document.getElementById("rv-old-cost").value="",document.getElementById("rv-new-cost").value="",document.getElementById("rv-notes").value="",openModal("revalue-modal")):F&&F()};let D=null;window.showSpotCountDetail=async e=>{try{const s=W(V,`companies/${z}/inventoryAdjustments`,e),t=await G(s);if(!t.exists()){showToast("المعاملة غير موجودة","error");return}const o=t.data();o.id=t.id,D=o;const a=o.warehouseId2&&o.warehouseId2!=="",d=`
      <div class="grid-3 gap-16 mb-16" style="border-bottom:1px solid var(--border-soft); padding-bottom:12px;">
        <div><strong>تاريخ الجرد:</strong> <span class="mono">${o.date||"—"}</span></div>
        <div><strong>المخزن الأول:</strong> <span>${o.warehouseName||"—"}</span></div>
        ${a?`<div><strong>المخزن الثاني:</strong> <span>${o.warehouseName2||"—"}</span></div>`:"<div></div>"}
      </div>
      <div class="mb-16"><strong>ملاحظات:</strong> <span>${o.notes||"—"}</span></div>
      
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            ${a?`
              <tr>
                <th>الصنف</th>
                <th style="background:#eff6ff; color:#1e40af; text-align:center;">دفتر (${o.warehouseName})</th>
                <th style="background:#eff6ff; color:#1e40af; text-align:center;">فعلي (${o.warehouseName})</th>
                <th style="background:#eff6ff; color:#1e40af; text-align:center;">الفرق</th>
                <th style="background:#fef2f2; color:#991b1b; text-align:center;">دفتر (${o.warehouseName2})</th>
                <th style="background:#fef2f2; color:#991b1b; text-align:center;">فعلي (${o.warehouseName2})</th>
                <th style="background:#fef2f2; color:#991b1b; text-align:center;">الفرق</th>
              </tr>
            `:`
              <tr>
                <th>الصنف</th>
                <th>الكمية الدفترية</th>
                <th>الكمية الفعلية</th>
                <th>الفرق</th>
              </tr>
            `}
          </thead>
          <tbody>
            ${(o.lines||[]).map(n=>{if(a){const c=n.actualQty1-n.bookQty1,i=n.actualQty2-n.bookQty2;return`
                  <tr>
                    <td style="text-align:right;">${n.productName} <span class="mono dim" style="font-size:11px;">${n.sku}</span></td>
                    <td class="mono">${b(n.bookQty1)}</td>
                    <td class="mono">${b(n.actualQty1)}</td>
                    <td class="mono ${c!==0?c<0?"text-bad":"text-good":""}">${c>=0?"+":""}${b(c)}</td>
                    <td class="mono">${b(n.bookQty2)}</td>
                    <td class="mono">${b(n.actualQty2)}</td>
                    <td class="mono ${i!==0?i<0?"text-bad":"text-good":""}">${i>=0?"+":""}${b(i)}</td>
                  </tr>
                `}else{const c=n.actualQty1!==void 0?n.actualQty1:n.actualQty!==void 0?n.actualQty:0,i=n.bookQty1!==void 0?n.bookQty1:n.bookQty!==void 0?n.bookQty:0,r=c-i;return`
                  <tr>
                    <td style="text-align:right;">${n.productName} <span class="mono dim" style="font-size:11px;">${n.sku}</span></td>
                    <td class="mono">${b(i)}</td>
                    <td class="mono">${b(c)}</td>
                    <td class="mono ${r!==0?r<0?"text-bad":"text-good":""}">${r>=0?"+":""}${b(r)}</td>
                  </tr>
                `}}).join("")}
          </tbody>
        </table>
      </div>
    `;document.getElementById("sc-detail-body").innerHTML=d,openModal("spot-count-detail-modal")}catch(s){showToast(s.message,"error")}};window.deleteSpotCount=async e=>{if(confirm("هل أنت متأكد من حذف هذه المعاملة؟ سيتم التراجع عن جميع تسويات الكميات في المخازن وإعادة الأرصدة لوضعها السابق."))try{const s=W(V,`companies/${z}/inventoryAdjustments`,e),t=await G(s);if(!t.exists()){showToast("المعاملة غير موجودة","error");return}const o=t.data(),a=o.warehouseId2&&o.warehouseId2!=="",d=(o.lines||[]).filter(n=>{const c=n.actualQty1!==void 0?n.actualQty1:n.actualQty!==void 0?n.actualQty:0,i=n.bookQty1!==void 0?n.bookQty1:n.bookQty!==void 0?n.bookQty:0;return c!==i});for(const n of d){const c=n.actualQty1!==void 0?n.actualQty1:n.actualQty!==void 0?n.actualQty:0,i=n.bookQty1!==void 0?n.bookQty1:n.bookQty!==void 0?n.bookQty:0,r=c-i;await M(o.warehouseId,n.productId,-r,{refType:"spot-count-reversal",note:"إلغاء تسوية جرد - تراجع"})}if(a){const n=(o.lines||[]).filter(c=>c.actualQty2!==c.bookQty2);for(const c of n){const i=c.actualQty2-c.bookQty2;await M(o.warehouseId2,c.productId,-i,{refType:"spot-count-reversal",note:"إلغاء تسوية جرد - تراجع"})}}await st(s),showToast("✅ تم حذف المعاملة والتراجع عن جميع تسويات المخزون بنجاح","success"),await switchOpsSubModule("spot-count")}catch(s){showToast(s.message,"error")}};window.printActiveSpotCount=()=>{if(!D)return;const e=D,s=e.warehouseId2&&e.warehouseId2!=="",t=window.open("","_blank");t.document.write(`
    <html dir="rtl" lang="ar">
    <head>
      <title>تقرير جرد المخزون - ${e.date||""}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #5b3ec2; padding-bottom: 15px; }
        .header h1 { margin: 0; color: #5b3ec2; font-size: 24px; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; background: #f9fafb; padding: 10px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right; font-size: 13px; }
        th { background: #5b3ec2; color: white; }
        .mono { font-family: monospace; font-weight: bold; }
        .text-bad { color: #dc2626; }
        .text-good { color: #16a34a; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔢 تقرير جرد المخزون مفاجئ (Spot Count)</h1>
      </div>
      <div class="meta">
        <div><strong>تاريخ الجرد:</strong> ${e.date||"—"}</div>
        <div><strong>المخزن الأول:</strong> ${e.warehouseName||"—"}</div>
        ${s?`<div><strong>المخزن الثاني:</strong> ${e.warehouseName2||"—"}</div>`:""}
      </div>
      <div style="margin-bottom: 20px;"><strong>ملاحظات:</strong> ${e.notes||"—"}</div>
      
      <table>
        <thead>
          ${s?`
            <tr>
              <th>الصنف</th>
              <th>دفتر (${e.warehouseName})</th>
              <th>فعلي (${e.warehouseName})</th>
              <th>الفرق</th>
              <th>دفتر (${e.warehouseName2})</th>
              <th>فعلي (${e.warehouseName2})</th>
              <th>الفرق</th>
            </tr>
          `:`
            <tr>
              <th>الصنف</th>
              <th>الكمية الدفترية</th>
              <th>الكمية الفعلية</th>
              <th>الفرق</th>
            </tr>
          `}
        </thead>
        <tbody>
          ${(e.lines||[]).map(o=>{if(s){const a=o.actualQty1-o.bookQty1,d=o.actualQty2-o.bookQty2;return`
                <tr>
                  <td>${o.productName} <span style="font-size:11px; color:#6b7280;">${o.sku}</span></td>
                  <td class="mono">${b(o.bookQty1)}</td>
                  <td class="mono">${b(o.actualQty1)}</td>
                  <td class="mono ${a!==0?a<0?"text-bad":"text-good":""}">${a>=0?"+":""}${b(a)}</td>
                  <td class="mono">${b(o.bookQty2)}</td>
                  <td class="mono">${b(o.actualQty2)}</td>
                  <td class="mono ${d!==0?d<0?"text-bad":"text-good":""}">${d>=0?"+":""}${b(d)}</td>
                </tr>
              `}else{const a=o.actualQty1!==void 0?o.actualQty1:o.actualQty!==void 0?o.actualQty:0,d=o.bookQty1!==void 0?o.bookQty1:o.bookQty!==void 0?o.bookQty:0,n=a-d;return`
                <tr>
                  <td>${o.productName} <span style="font-size:11px; color:#6b7280;">${o.sku}</span></td>
                  <td class="mono">${b(d)}</td>
                  <td class="mono">${b(a)}</td>
                  <td class="mono ${n!==0?n<0?"text-bad":"text-good":""}">${n>=0?"+":""}${b(n)}</td>
                </tr>
              `}}).join("")}
        </tbody>
      </table>
      
      <script>
        window.onload = function() { window.print(); };
      <\/script>
    </body>
    </html>
  `),t.document.close()};export{xt as render};
