import{l as D,C as T,g as at,u as J,f as y,e as I,t as et,d as N,a as A,k as it,c as ut,r as mt,b as pt}from"./index-CF9GFeRJ.js";import{syncEntityToCoa as yt,deleteEntityInCoa as ht}from"./coa-connector-9pNG4b1x.js";import{e as vt}from"./excel-DM5XZHtQ.js";import{orderBy as xt,query as q,limit as bt,getDocs as H,doc as M,runTransaction as st,serverTimestamp as F,collection as _,getDoc as X,where as Z}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let B=[],dt=[],tt="",U=null,Q=[],V=[],rt="asc",lt="",ct="",gt=0,Y=0;function wt(t){const e=(t.name||"").toLowerCase(),n=t.type||"",a=t.accountCode||"";return n==="main"||e.includes("الرئيسي")?{gradient:"linear-gradient(135deg, #059669 0%, #064e3b 100%)",border:"1.5px solid #10b981",shadow:"0 10px 25px -5px rgba(5,150,105,0.4)",icon:"🏛️",badgeText:"خزينة رئيسية",accentBg:"rgba(255,255,255,0.2)"}:n==="owner_current"||a==="3-1-4"||e.includes("مالك")?{gradient:"linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",border:"1.5px solid #8b5cf6",shadow:"0 10px 25px -5px rgba(109,40,217,0.4)",icon:"👑",badgeText:"👤 جاري المالك",accentBg:"rgba(255,255,255,0.2)"}:e.includes("مصطفى")?{gradient:"linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",border:"1.5px solid #3b82f6",shadow:"0 10px 25px -5px rgba(29,78,216,0.4)",icon:"🚚",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:e.includes("عوض")?{gradient:"linear-gradient(135deg, #0d9488 0%, #115e59 100%)",border:"1.5px solid #14b8a6",shadow:"0 10px 25px -5px rgba(13,148,136,0.4)",icon:"📦",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:e.includes("خالد")?{gradient:"linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",border:"1.5px solid #f97316",shadow:"0 10px 25px -5px rgba(234,88,12,0.4)",icon:"🚛",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:{gradient:"linear-gradient(135deg, #334155 0%, #0f172a 100%)",border:"1.5px solid #64748b",shadow:"0 10px 25px -5px rgba(51,65,85,0.4)",icon:"💼",badgeText:t.type==="petty"?"نثريات":"صندوق فرعي",accentBg:"rgba(255,255,255,0.2)"}}async function Lt(t,e){t.innerHTML=`
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="refreshCashBoxesLive()" title="تحديث الأرصدة من قاعدة البيانات">🔄 تحديث الأرصدة</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الصناديق_والعهد')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الصناديق_والعهد')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="openQuickTransferModal('')" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);border:none;box-shadow:0 2px 6px rgba(2,132,199,0.3);font-weight:800;">⚡ تحويل نقدية بين الصناديق</button>
        <button class="btn btn-secondary btn-sm" onclick="openCashTxnModal()">+ إيداع / سحب مباشر</button>
        <button class="btn btn-success btn-sm" onclick="openCashBoxModal()">+ صندوق / عهدة جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💵 إدارة الصناديق النقدية والعهَد والتمويل الشخصي</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة عهد المناديـب، الخزائن الرئيسية والفرعية، وحسابات جاري المالك مع كشوفات الحركات النقدية والتحويل المزدوج الفوري</p>
      </div>

      <!-- Luxury Color Cards Grid -->
      <div class="grid-3 gap-16 mb-24" id="cb-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <!-- Filter Bar for Transactions -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-soft);">
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0;" id="cb-txn-table-title">📑 سجل ودعم كشف حركات الصناديق والعهد</h3>
            <p style="font-size:12px;color:var(--text-3);margin:2px 0 0 0;" id="cb-txn-table-subtitle">انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reset-box-filter" onclick="filterCashBoxTxnsByCard('')" style="display:none;">✕ عرض كافة الصناديق</button>
        </div>

        <div style="padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--border-soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="flex:1;min-width:180px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">تصفية بالصندوق</label>
            <select id="filter-cb-box" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">جميع الصناديق والعهد</option>
            </select>
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">من تاريخ</label>
            <input type="date" id="filter-cb-from" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">إلى تاريخ</label>
            <input type="date" id="filter-cb-to" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">نوع الحركة</label>
            <select id="filter-cb-type" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">كل الحركات</option>
              <option value="in">إيداعات / مقبوضات (+)</option>
              <option value="out">سحوبات / مصروفات (-)</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="filter-cb-search" class="input" placeholder="اكتب بياناً أو مرجعاً للبحث..." oninput="applyCashTxnFilters()" style="font-size:12.5px;" />
          </div>
        </div>

        <!-- Filtered Transactions KPI Summary -->
        <div id="cb-txn-kpis" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:14px 20px;background:#f8fafc;border-bottom:1px solid var(--border-soft);">
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#047857;font-weight:700;">إجمالي الوارد (+)</div>
            <div id="kpi-tx-total-in" class="mono text-ok" style="font-size:16px;font-weight:900;">0.00 ر.س</div>
          </div>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#dc2626;font-weight:700;">إجمالي الصادر (-)</div>
            <div id="kpi-tx-total-out" class="mono text-bad" style="font-size:16px;font-weight:900;">0.00 ر.س</div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#1d4ed8;font-weight:700;">صافي حركة الفترة</div>
            <div id="kpi-tx-net" class="mono" style="font-size:16px;font-weight:900;color:#1e40af;">0.00 ر.س</div>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#475569;font-weight:700;">عدد الحركات المعروضة</div>
            <div id="kpi-tx-count" class="mono" style="font-size:16px;font-weight:900;color:#0f172a;">0 حركة</div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-dense" style="width:100%;font-size:12.5px;">
            <thead>
              <tr style="background:#1e293b;color:#ffffff;">
                <th style="padding:10px 12px;width:110px;">التاريخ والوقت</th>
                <th style="padding:10px 12px;width:140px;">الصندوق / العهدة</th>
                <th style="padding:10px 12px;width:130px;">نوع الحركة</th>
                <th style="padding:10px 12px;width:95px;">المرجع</th>
                <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
                <th style="padding:10px 12px;text-align:left;width:115px;">وارد (+)</th>
                <th style="padding:10px 12px;text-align:left;width:115px;">صادر (-)</th>
                <th style="padding:10px 12px;text-align:left;width:125px;">الرصيد بعد الحركة</th>
                <th style="padding:10px 12px;width:90px;">المستخدم</th>
                <th style="padding:10px 12px;width:115px;text-align:center;">طباعة السند</th>
              </tr>
            </thead>
            <tbody id="cb-txn-tbody">
              ${Array(6).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: NEW / EDIT CASH BOX ═══ -->
    <div class="modal-overlay" id="cb-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cb-modal-title">إضافة صندوق نقدي</h3>
          <button class="modal-close" onclick="closeModal('cb-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cb-edit-id" />
          <div class="form-group mb-16">
            <label>اسم الصندوق / العهدة *</label>
            <input type="text" id="cb-name" class="input" placeholder="مثال: عهدة المندوب أحمد / الصندوق الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الصندوق</label>
              <select id="cb-type">
                <option value="main">خزينة رئيسية</option>
                <option value="rep">عهدة مندوب</option>
                <option value="owner_current">👤 جاري المالك (تمويل شخصي)</option>
                <option value="petty">مصروفات نثرية</option>
              </select>
            </div>
            <div class="form-group">
              <label>المسؤول</label>
              <input type="text" id="cb-keeper" class="input" placeholder="اسم المندوب / أمين الصندوق" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="cb-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="cb-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cb-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cb-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="cb-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashBox()" id="save-cb-btn">حفظ الصندوق</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: QUICK CASH TRANSFER (بضغطة زر) ═══ -->
    <div class="modal-overlay" id="cb-quick-transfer-modal">
      <div class="modal" style="max-width:540px;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);">
        <div class="modal-header" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#fff;padding:16px 22px;">
          <h3 class="modal-title" style="color:#fff;font-size:17px;font-weight:900;display:flex;align-items:center;gap:8px;">
            <span>⚡</span> تحويل نقدية فوري بين الصناديق والعهد
          </h3>
          <button class="modal-close" onclick="closeModal('cb-quick-transfer-modal')" style="color:#fff;opacity:0.85;">×</button>
        </div>
        <div class="modal-body" style="padding:20px;background:#f8fafc;">
          
          <!-- Source Box -->
          <div class="form-group mb-16">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;margin:0;">الصندوق المحول منه (المُسلِّم) *</label>
              <span id="qtx-source-bal-badge" style="font-size:11px;font-weight:800;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:6px;border:1px solid #bae6fd;">الرصيد المتاح: 0.00 ر.س</span>
            </div>
            <select id="qtx-source-box" class="input" onchange="onQuickTransferSourceChange()" style="font-size:13px;font-weight:700;"></select>
          </div>

          <!-- Target Box -->
          <div class="form-group mb-16">
            <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">الصندوق المستلم (المُستلِم) *</label>
            <select id="qtx-target-box" class="input" style="font-size:13px;font-weight:700;"></select>
          </div>

          <!-- Amount & Date -->
          <div class="grid-2 gap-14 mb-16">
            <div class="form-group">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">المبلغ المراد تحويله (ر.س) *</label>
              <input type="number" id="qtx-amount" class="input mono font-bold" step="0.01" min="0.01" placeholder="0.00" oninput="validateQuickTransferAmount()" style="font-size:16px;color:#0f172a;" />
            </div>
            <div class="form-group">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">تاريخ التحويل *</label>
              <input type="date" id="qtx-date" class="input" style="font-size:13px;" />
            </div>
          </div>

          <!-- Quick reason chips & Notes -->
          <div class="form-group mb-16">
            <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">البيان وسبب التحويل *</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
              <span class="chip-preset" onclick="setQuickTransferNote('تغذية عهدة سيارة')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ تغذية عهدة سيارة</span>
              <span class="chip-preset" onclick="setQuickTransferNote('توريد مبيعات يومية للخزينة')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ توريد مبيعات يومية</span>
              <span class="chip-preset" onclick="setQuickTransferNote('مناقلة سيولة نقدية')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ مناقلة سيولة</span>
              <span class="chip-preset" onclick="setQuickTransferNote('تسليم نقدية بيد المسؤول')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ تسليم نقدية</span>
            </div>
            <input type="text" id="qtx-notes" class="input" placeholder="اكتب سبباً أو اختر من المقترحات أعلاه..." style="font-size:13px;" />
          </div>

          <!-- Auto Accounting Entry Notice -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;font-size:11.5px;color:#166534;display:flex;align-items:center;gap:8px;">
            <span>⚖️</span>
            <span>سيتم إنشاء <strong>قيد محاسبي مزدوج تلقائياً</strong> (مدين: الصندوق المستلم | دائن: الصندوق المحول منه) فور الحفظ.</span>
          </div>

          <div id="qtx-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('cb-quick-transfer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="executeQuickTransfer()" id="btn-save-qtx" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);border:none;font-weight:800;padding:8px 20px;">
            ⚡ تأكيد وتحويل النقدية الآن
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: CASH TRANSACTION (MANUAL IN/OUT) ═══ -->
    <div class="modal-overlay" id="cb-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">سند حركة نقدية مباشرة</h3>
          <button class="modal-close" onclick="closeModal('cb-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الصندوق *</label>
            <select id="ctxn-box" onchange="toggleTxnTypeFields()"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="ctxn-type" onchange="toggleTxnTypeFields()">
                <option value="in">إيداع / تزويد نقدية (+)</option>
                <option value="out">سحب / مصاريف (-)</option>
                <option value="transfer">تحويل بين الصناديق 🔄</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="ctxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="form-group mb-16 hidden" id="ctxn-target-box-wrap">
            <label>الصندوق المستلم (إلى) *</label>
            <select id="ctxn-target-box"></select>
          </div>
          <div class="form-group mb-16">
            <label>البيان / السبب *</label>
            <input type="text" id="ctxn-notes" class="input" placeholder="مثال: توريد مبيعات يومية، تسليم نقدية المندوب..." />
          </div>
          <div id="ctxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashTxn()" id="save-ctxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: ADVANCED DETAILED STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="cb-statement-modal">
      <div class="modal modal-lg" style="max-width:1160px;border-radius:18px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(0,0,0,0.35);border:1px solid #cbd5e1;">
        <div class="modal-header" style="background:#ffffff;border-bottom:1.5px solid #e2e8f0;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="background:#eff6ff;color:#1d4ed8;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid #bfdbfe;">
              📄
            </div>
            <div>
              <h3 class="modal-title" id="cb-stmt-modal-title" style="color:#0f172a !important;font-size:18px;font-weight:900;margin:0;">كشف حساب تفصيلي للصندوق</h3>
              <div style="font-size:12px;color:#475569;margin-top:2px;font-weight:600;">دفتر أستاذ الحركات النقدية مع الترتيب الزمني المحاسبي والرصيد التراكمي</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal('cb-statement-modal')" style="color:#64748b;font-size:26px;background:none;border:none;cursor:pointer;line-height:1;">×</button>
        </div>
        <div class="modal-body" id="cb-stmt-body" style="padding:22px;background:#f8fafc;max-height:80vh;overflow-y:auto;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#ffffff;border-top:1.5px solid #e2e8f0;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <button class="btn btn-secondary" onclick="closeModal('cb-statement-modal')" style="font-weight:700;color:#334155;">إغلاق</button>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary" onclick="exportCashBoxStatementToExcel()" style="background:#059669;color:#ffffff;border:none;font-weight:800;padding:8px 16px;border-radius:8px;">
              📊 تصدير إكسيل ملون (XLSX)
            </button>
            <button class="btn btn-primary" onclick="printCashBoxStatementOfficial()" style="background:#1d4ed8;color:#ffffff;border:none;font-weight:800;padding:8px 18px;border-radius:8px;">
              🖨️ طباعة رسمية A4 لكشف الحساب
            </button>
          </div>
        </div>
      </div>
    </div>
  `,R(!0),ot()}function $t(t,e){if(!Array.isArray(e)||e.length===0)return null;const n=(t.name||"").trim(),a=d=>d.nodeType!=="header";if(n.includes("الرئيسى")||n.includes("الرئيسي")||t.type==="main"){const d=e.find(o=>o.code==="1-1-1-1-3"&&a(o));if(d)return d}if(n.includes("مصطفى")){const d=e.find(o=>o.code==="1-1-1-2-01"&&a(o));if(d)return d}if(n.includes("رضا")){const d=e.find(o=>o.code==="1-1-1-2-04"&&a(o));if(d)return d}if(t.accountId){const d=e.find(o=>o.id===t.accountId&&a(o));if(d)return d}if(t.accountCode){const d=e.find(o=>o.code===t.accountCode&&a(o));if(d)return d}if(n){const d=e.find(o=>o.name&&a(o)&&(o.name.trim()===n||o.name.includes(n)));if(d)return d}return null}window.refreshCashBoxesLive=async()=>{await Promise.all([R(!0),ot()]),showToast("تم تحديث أرصدة الصناديق والحركات من قاعدة البيانات","success")};async function R(t=!1){const e=document.getElementById("cb-grid"),n=document.getElementById("filter-cb-box");if(e)try{t&&await Promise.all([D(T.cashBoxes().path),D(T.chartOfAccounts().path)]);const[a,d]=await Promise.all([at(T.cashBoxes(),[xt("name")]),at(T.chartOfAccounts())]);B=a||[];const o=[];for(const s of B){const l=$t(s,d);if(!l)continue;const f=Math.round(Number(l.balance||0)*100)/100,w=Math.round(Number(s.balance||0)*100)/100,b={};let u=!1;Math.abs(w-f)>.009&&(b.balance=f,u=!0),s.balance=f,s.accountId!==l.id&&(s.accountId=l.id,b.accountId=l.id,u=!0),s.accountCode!==l.code&&(s.accountCode=l.code,s.code=l.code,b.accountCode=l.code,b.code=l.code,u=!0),u&&o.push(J("cashBoxes",s.id,b).catch(m=>console.warn("Background cashBox sync:",m)))}if(o.length>0&&Promise.all(o).then(()=>D(T.cashBoxes().path)).catch(()=>{}),n&&(n.innerHTML='<option value="">جميع الصناديق والعهد</option>'+B.map(s=>`<option value="${s.id}" ${s.id===tt?"selected":""}>${s.name}</option>`).join("")),B.length===0){e.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">💵</div><h3>لا توجد صناديق نقدية</h3><p>اضغط على "صندوق جديد" لإضافة خزينة أو عهدة مندوب</p></div>';return}e.innerHTML=B.map(s=>{const l=wt(s),f=tt===s.id;return`
        <div class="card cb-card-luxury cb-card-interactive" onclick="filterCashBoxTxnsByCard('${s.id}')" style="background:${l.gradient}; border:${l.border}; box-shadow:${l.shadow}; cursor:pointer; ${f?"outline:3.5px solid #ffffff;transform:scale(1.02);":""}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${l.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span class="cb-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
              <span>${l.icon}</span> <span>${l.badgeText}</span>
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openQuickTransferModal('${s.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.35); border-radius:8px;" title="⚡ تحويل نقدية سريع من هذا الصندوق">⚡</button>
              <button class="btn btn-icon sm" onclick="openCashBoxStatementModal('${s.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openCashBoxModal('${s.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteCashBox('${s.id}','${s.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 class="cb-box-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${s.name}</h3>
          <div class="cb-sub-text" style="margin-bottom:14px; position:relative; z-index:2;">👤 المسؤول: <strong style="color:#ffffff !important;">${s.keeper||"غير محدد"}</strong> ${s.accountCode?`| كود: <span dir="ltr" style="font-family:var(--font-mono, monospace);font-weight:800;direction:ltr;unicode-bidi:isolate;display:inline-block;color:#ffffff !important;">${s.accountCode}</span>`:""}</div>

          <div class="cb-amount-box" style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💵 الرصيد النقدي المتوفر</span>
              <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">نقد فوري</span>
            </div>
            <div class="cb-balance-value" style="direction:ltr; text-align:right;">
              ${y(s.balance||0)}
            </div>
          </div>

          <!-- Quick Actions on Card -->
          <div style="display:flex; gap:8px; margin-top:12px; position:relative; z-index:2;" onclick="event.stopPropagation();">
            <button class="btn btn-sm" onclick="openQuickTransferModal('${s.id}')" style="flex:1; background:rgba(255,255,255,0.25); color:#ffffff; font-weight:800; border:1px solid rgba(255,255,255,0.4); border-radius:10px; font-size:12px; padding:6px 10px; display:inline-flex; align-items:center; justify-content:center; gap:5px; box-shadow:0 2px 5px rgba(0,0,0,0.15);">
              ⚡ تحويل نقدية
            </button>
            <button class="btn btn-sm" onclick="openCashBoxStatementModal('${s.id}')" style="flex:1; background:rgba(0,0,0,0.25); color:#ffffff; font-weight:800; border:1px solid rgba(255,255,255,0.25); border-radius:10px; font-size:12px; padding:6px 10px; display:inline-flex; align-items:center; justify-content:center; gap:5px;">
              📄 كشف الحساب
            </button>
          </div>

          <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
            <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
              ${f?"🎯 تصفية نشطة للجدول أدناه":"🔍 انقر لتصفية جدول الحركات"}
            </span>
          </div>
        </div>`}).join("")}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}}async function ot(){const t=document.getElementById("cb-txn-tbody");if(t)try{const e=q(T.cashTransactions(),xt("createdAt","desc"),bt(200));dt=(await H(e)).docs.map(a=>({id:a.id,...a.data()})),applyCashTxnFilters()}catch(e){t.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}window.filterCashBoxTxnsByCard=t=>{tt=t;const e=document.getElementById("filter-cb-box");e&&(e.value=t);const n=document.getElementById("btn-reset-box-filter");n&&(n.style.display=t?"inline-block":"none"),R(),applyCashTxnFilters()};window.applyCashTxnFilters=()=>{const t=document.getElementById("filter-cb-box")?.value||tt||"",e=document.getElementById("filter-cb-from")?.value||"",n=document.getElementById("filter-cb-to")?.value||"",a=document.getElementById("filter-cb-type")?.value||"",d=(document.getElementById("filter-cb-search")?.value||"").trim().toLowerCase(),o=document.getElementById("cb-txn-tbody"),s=document.getElementById("cb-txn-table-title"),l=document.getElementById("cb-txn-table-subtitle");if(!o)return;let f=[...dt];if(t){f=f.filter(p=>p.cashBoxId===t);const i=B.find(p=>p.id===t);s&&(s.textContent=`📑 كشف حركات: ${i?i.name:"الصندوق المالي"}`),l&&(l.textContent=`سجل الحركات المصروفة والمقبوضة للصندوق المالي المقتطع (${f.length} حركة)`)}else s&&(s.textContent="📑 سجل ودعم كشف حركات كافة الصناديق والعهد"),l&&(l.textContent="انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل");const w=i=>i.date&&/^\d{4}-\d{2}-\d{2}$/.test(i.date)?i.date:i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:i.createdAt?.seconds?new Date(i.createdAt.seconds*1e3).toISOString().split("T")[0]:"";e&&(f=f.filter(i=>{const p=w(i);return p?p>=e:!0})),n&&(f=f.filter(i=>{const p=w(i);return p?p<=n:!0})),a&&(f=f.filter(i=>i.type===a)),d&&(f=f.filter(i=>(i.notes||"").toLowerCase().includes(d)||(i.userName||"").toLowerCase().includes(d)||(i.cashBoxId||"").toLowerCase().includes(d))),f.sort((i,p)=>{const v=w(i),$=w(p);if(v!==$)return $.localeCompare(v);const C=i.createdAt?.seconds||0;return(p.createdAt?.seconds||0)-C});const b={};B.forEach(i=>b[i.id]=i.name);const u=f.filter(i=>i.type==="in").reduce((i,p)=>i+(Number(p.amount)||0),0),m=f.filter(i=>i.type==="out").reduce((i,p)=>i+(Number(p.amount)||0),0),g=u-m,E=document.getElementById("kpi-tx-total-in"),h=document.getElementById("kpi-tx-total-out"),x=document.getElementById("kpi-tx-net"),r=document.getElementById("kpi-tx-count");if(E&&(E.textContent=`+${y(u)}`),h&&(h.textContent=`-${y(m)}`),x&&(x.textContent=`${g>=0?"+":""}${y(g)}`,x.style.color=g>=0?"#047857":"#dc2626"),r&&(r.textContent=`${f.length} حركة`),f.length===0){o.innerHTML='<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات نقدية مطابقة للتصفية المختارة</td></tr>';return}o.innerHTML=f.map(i=>{const p=i.type==="in",v=i.isTransfer||i.notes&&i.notes.includes("تحويل");let $=p?"background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;":"background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;",C=p?"إيداع / تحصيل (+)":"سحب / مصروف (-)";v&&($=p?"background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-weight:800;":"background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-weight:800;",C=p?"تحويل وارد 🔄":"تحويل صادر 🔄");const c=i.date?I(i.date):i.createdAt?I(i.createdAt):"—";let k=i.refNumber||"";return k||(i.sourceType==="receipt"?k=`RV-${(i.sourceId||i.id).substring(0,6).toUpperCase()}`:i.sourceType==="expense"?k=`PV-${(i.sourceId||i.id).substring(0,6).toUpperCase()}`:i.sourceType==="cashTransfer"||v?k=`TR-${i.id.substring(0,6).toUpperCase()}`:k=`TXN-${i.id.substring(0,6).toUpperCase()}`),`
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${c}</td>
        <td><strong style="color:var(--text-1);">${b[i.cashBoxId]||i.cashBoxId}</strong></td>
        <td><span class="badge" style="${$}padding:4px 10px;border-radius:8px;">${C}</span></td>
        <td class="mono" style="font-size:11px;"><span dir="ltr" style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-weight:800;color:#334155;">${k}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${i.notes||"—"}</span></td>
        <td class="mono font-bold text-ok" style="text-align:left;font-size:13px;">${p?"+"+y(i.amount):"—"}</td>
        <td class="mono font-bold text-bad" style="text-align:left;font-size:13px;">${p?"—":"-"+y(i.amount)}</td>
        <td class="mono font-bold" style="text-align:left;font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${y(i.balanceAfter||0)}</span></td>
        <td style="font-size:11.5px;color:var(--text-3);">${i.userName||"النظام"}</td>
        <td style="text-align:center;padding:6px 8px;">
          <button type="button" class="btn btn-sm" onclick="printCashTxnVoucher('${i.id}')"
            title="${p?"طباعة سند قبض واستلام نقدية":"طباعة سند صرف وإقرار استلام"}"
            style="font-size:11.5px;font-weight:800;padding:5px 10px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;transition:all 0.15s ease;${p?"background:#ecfdf5;color:#047857;border:1.5px solid #a7f3d0;":"background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca;"}">
            <span style="font-size:12.5px;">🖨️</span> <span>${p?"سند قبض":"سند صرف"}</span>
          </button>
        </td>
      </tr>`}).join("")};window.openQuickTransferModal=(t="")=>{if(!B||B.length<2){showToast("يجب توفر صندوقين نقديين على الأقل لإجراء التحويل","warning");return}const e=document.getElementById("qtx-source-box");document.getElementById("qtx-target-box");const n=document.getElementById("qtx-error");n&&n.classList.add("hidden");let a=t;if(!a){const o=B.find(s=>s.type==="main"||s.name&&s.name.includes("الرئيسي"));a=o?o.id:B[0].id}e.innerHTML=B.map(o=>`<option value="${o.id}" ${o.id===a?"selected":""}>${o.name} (${y(o.balance||0)})</option>`).join(""),window.onQuickTransferSourceChange(),document.getElementById("qtx-amount").value="",document.getElementById("qtx-date").value=et(),document.getElementById("qtx-notes").value="";const d=document.getElementById("btn-save-qtx");d&&(d.disabled=!1),openModal("cb-quick-transfer-modal")};window.onQuickTransferSourceChange=()=>{const t=document.getElementById("qtx-source-box"),e=document.getElementById("qtx-target-box"),n=document.getElementById("qtx-source-bal-badge");if(!t||!e)return;const a=t.value,d=B.find(l=>l.id===a),o=d&&d.balance||0;n&&(n.textContent=`الرصيد المتاح: ${y(o)}`,n.style.color=o>0?"#0369a1":"#dc2626",n.style.background=o>0?"#e0f2fe":"#fee2e2");const s=B.filter(l=>l.id!==a);e.innerHTML=s.map(l=>`<option value="${l.id}">${l.name} (الرصيد الحالي: ${y(l.balance||0)})</option>`).join(""),window.validateQuickTransferAmount()};window.validateQuickTransferAmount=()=>{const t=document.getElementById("qtx-source-box")?.value,e=parseFloat(document.getElementById("qtx-amount")?.value)||0,n=B.find(s=>s.id===t),a=n&&n.balance||0,d=document.getElementById("qtx-error"),o=document.getElementById("btn-save-qtx");if(d)return e>a?(d.textContent=`⚠️ تحذير: المبلغ المراد تحويله (${y(e)}) أكبر من الرصيد المتاح (${y(a)})!`,d.classList.remove("hidden"),o&&(o.disabled=!0),!1):(d.classList.add("hidden"),o&&(o.disabled=!1),!0)};window.setQuickTransferNote=t=>{const e=document.getElementById("qtx-notes");e&&(e.value=t,e.focus())};window.executeQuickTransfer=async()=>{const t=document.getElementById("qtx-source-box").value,e=document.getElementById("qtx-target-box").value,n=parseFloat(document.getElementById("qtx-amount").value)||0,a=document.getElementById("qtx-date").value||et(),d=(document.getElementById("qtx-notes").value||"").trim(),o=document.getElementById("qtx-error"),s=document.getElementById("btn-save-qtx");if(o.classList.add("hidden"),!t||!e){o.textContent="يرجى تحديد الصندوق المحول منه والصندوق المستلم",o.classList.remove("hidden");return}if(t===e){o.textContent="لا يمكن التحويل لنفس الصندوق",o.classList.remove("hidden");return}if(n<=0){o.textContent="يرجى إدخال مبلغ صحيح أكبر من الصفر",o.classList.remove("hidden");return}if(!d){o.textContent="يرجى كتابة سبب أو بيان التحويل",o.classList.remove("hidden");return}s.disabled=!0,s.innerHTML='<span class="spin"></span> جاري التحويل وتوليد القيد...';try{const l=M(N,`companies/${A}/cashBoxes`,t),f=M(N,`companies/${A}/cashBoxes`,e);let w=0,b=0,u="",m="",g="",E="",h="";await st(N,async x=>{const r=await x.get(l),i=await x.get(f);if(!r.exists())throw new Error("الصندوق المرسل غير موجود");if(!i.exists())throw new Error("الصندوق المستلم غير موجود");const p=r.data(),v=i.data(),$=Number(p.balance||0),C=Number(v.balance||0);if($<n)throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${$} < ${n}`);u=p.name,m=v.name,g=p.accountCode||p.code||"1-1-1-1-3",E=v.accountCode||v.code||"1-1-1-1-3",w=$-n,b=C+n,x.update(l,{balance:w,updatedAt:F()}),x.update(f,{balance:b,updatedAt:F()});const c=M(_(N,`companies/${A}/cashTransactions`));h=c.id.slice(0,6).toUpperCase(),x.set(c,{cashBoxId:t,type:"out",isTransfer:!0,sourceType:"cashTransfer",relatedBoxId:e,relatedBoxName:m,amount:n,date:a,notes:`تحويل صادر إلى ${m} — ${d}`,balanceAfter:w,refNumber:`TR-${h}`,userName:"النظام",createdAt:F()});const k=M(_(N,`companies/${A}/cashTransactions`));x.set(k,{cashBoxId:e,type:"in",isTransfer:!0,sourceType:"cashTransfer",relatedBoxId:t,relatedBoxName:u,amount:n,date:a,notes:`تحويل وارد من ${u} — ${d}`,balanceAfter:b,refNumber:`TR-${h}`,userName:"النظام",createdAt:F()})});try{await it({date:a,description:`مناقلة نقدية بين الصناديق: من ${u} إلى ${m} — إذن رقم TR-${h} — ${d}`,sourceType:"cashTransaction",sourceId:h,lines:[{accountCode:E,accountName:m,debit:n,credit:0,note:`استلام تحويل من ${u}`},{accountCode:g,accountName:u,debit:0,credit:n,note:`تسليم تحويل إلى ${m}`}],status:"posted",createdByName:"إدارة الخزينة"})}catch(x){console.warn("[QuickTransfer JE] Failed (non-fatal):",x.message)}showToast(`تم تحويل ${y(n)} من ${u} إلى ${m} بنجاح وتوليد القيد الآلي`,"success"),closeModal("cb-quick-transfer-modal"),await Promise.all([D(T.cashBoxes().path),D(T.cashTransactions().path),D(T.journalEntries().path),D(T.chartOfAccounts().path)]),await R(),await ot()}catch(l){o.textContent=l.message,o.classList.remove("hidden")}finally{s.disabled=!1,s.innerHTML="⚡ تأكيد وتحويل النقدية الآن"}};function W(t,e=et()){let n=0;t.createdAt?.toMillis?n=t.createdAt.toMillis():t.createdAt?.seconds?n=t.createdAt.seconds*1e3:t.createdAt?.toDate&&(n=t.createdAt.toDate().getTime());let a=t.date||"",d=e;if(a){if(/^\d{4}-\d{2}-\d{2}$/.test(a))d=a;else if(/^\d{2}\/\d{2}\/\d{4}$/.test(a)){const[o,s,l]=a.split("/");d=`${l}-${s}-${o}`}}else n>0&&(d=new Date(n).toISOString().split("T")[0]);if(!n){const o=new Date(d+"T12:00:00").getTime();n=isNaN(o)?Date.now():o}return{isoDate:d,timestamp:n}}function kt(t){if(!t)return null;const e=t.match(/(?:سند صرف رقم|سند قبض رقم|PV-|RV-|TXN-|TR-|إذن صرف رقم|فاتورة)\s*([A-Za-z0-9_-]+)/i);return e?e[1].toUpperCase():null}function G(t){return(t?.docs?t.docs:Array.isArray(t)?t:[]).map(n=>{if(n&&typeof n.data=="function")return{id:n.id,data:n.data()||{}};const a=n||{};return{id:a.id||"",data:a}})}function Ct(t,e,n,a,d){const o=t.accountCode||t.code||"",s=G(e),l=G(n),f=G(a),w=G(d),b=new Map;for(const{id:x,data:r}of f){const i=x.toUpperCase();b.set(i,{id:x,...r}),i.length>=6&&b.set(i.slice(0,6),{id:x,...r}),r.code&&b.set(String(r.code).toUpperCase(),{id:x,...r})}const u=new Map;for(const{id:x,data:r}of l){const i=x.toUpperCase();u.set(i,{id:x,...r}),i.length>=6&&u.set(i.slice(0,6),{id:x,...r}),r.displayCode&&u.set(String(r.displayCode).toUpperCase(),{id:x,...r}),r.code&&u.set(String(r.code).toUpperCase(),{id:x,...r})}const m=[],g=new Set,E=new Map;for(const{id:x,data:r}of s){const i=(r.sourceId||kt(r.notes)||"").toUpperCase(),p=i?`VOUCHER_${i}`:`TXN_${x}`,v=W(r),$=E.get(p);(!$||v.timestamp>=$.dt.timestamp)&&E.set(p,{id:x,data:r,dt:v,vCode:i})}for(const[,{id:x,data:r,dt:i,vCode:p}]of E.entries()){const v=r.type==="in",$=Number(r.amount||0);if($<=0)continue;p&&(g.add(p),p.length>=6&&g.add(p.slice(0,6)));const C=x.toUpperCase();g.add(C),C.length>=6&&g.add(C.slice(0,6));let c=r.notes||"حركة نقدية",k=v?"إيداع نقدي":"سحب نقدي",L=v?"good":"bad",j=v?"📥":"📤",S=`TXN-${x.slice(0,6).toUpperCase()}`;if(r.sourceType==="expense"||p&&b.has(p)){const z=b.get(p||r.sourceId?.toUpperCase());if(S=z?.code||`PV-${(z?.id||p||x).slice(0,6).toUpperCase()}`,k="سند صرف",L="bad",j="📤",z){const P=z.id.toUpperCase();g.add(P),P.length>=6&&g.add(P.slice(0,6)),z.code&&g.add(String(z.code).toUpperCase());const O=z.supplierName||z.accountName||z.category||"";c=`سند صرف: ${O?O+" — ":""}${z.notes||r.notes||""}`}}else if(r.sourceType==="receipt"||p&&u.has(p)){const z=u.get(p||r.sourceId?.toUpperCase());if(S=z?.displayCode||z?.code||`RV-${(z?.id||p||x).slice(0,6).toUpperCase()}`,k="سند قبض",L="good",j="📥",z){const P=z.id.toUpperCase();g.add(P),P.length>=6&&g.add(P.slice(0,6)),z.code&&g.add(String(z.code).toUpperCase()),z.displayCode&&g.add(String(z.displayCode).toUpperCase());const O=z.customerName||z.accountName||"";c=`سند قبض: ${O?"تحصيل من "+O+" — ":""}${z.notes||r.notes||""}`}}else(r.isTransfer||r.type==="transfer"||r.notes&&r.notes.includes("تحويل"))&&(k=v?"تحويل وارد 🔄":"تحويل صادر 🔄",j="🔄",L=v?"good":"bad",S=r.refNumber||`TR-${x.slice(0,6).toUpperCase()}`);m.push({id:x,timestamp:i.timestamp,date:i.isoDate,displayDate:I(i.isoDate),ref:S,type:r.type,badgeText:k,badgeClass:L,icon:j,notes:c,inflow:v?$:0,outflow:v?0:$,userName:r.userName||r.createdByName||"النظام",source:"cashTransactions"})}for(const{id:x,data:r}of f){const i=x.toUpperCase(),p=i.slice(0,6),v=(r.code||"").toUpperCase();if(g.has(i)||g.has(p)||v&&g.has(v))continue;g.add(i),g.add(p),v&&g.add(v);const $=W(r),C=Number(r.amount||0),c=r.supplierName||r.accountName||r.category||"جهة الصرف";m.push({id:x,timestamp:$.timestamp,date:$.isoDate,displayDate:I($.isoDate),ref:r.code||`PV-${x.slice(0,6).toUpperCase()}`,type:"out",badgeText:"سند صرف",badgeClass:"bad",icon:"📤",notes:`صرف لصالح: ${c} — ${r.notes||""}`,inflow:0,outflow:C,userName:r.createdByName||"النظام",source:"expenses"})}for(const{id:x,data:r}of l){const i=x.toUpperCase(),p=i.slice(0,6),v=(r.code||r.displayCode||"").toUpperCase();if(g.has(i)||g.has(p)||v&&g.has(v))continue;g.add(i),g.add(p),v&&g.add(v);const $=W(r),C=Number(r.amount||0),c=r.customerName||r.accountName||"عميل";m.push({id:x,timestamp:$.timestamp,date:$.isoDate,displayDate:I($.isoDate),ref:r.displayCode||r.code||`RV-${x.slice(0,6).toUpperCase()}`,type:"in",badgeText:"سند قبض",badgeClass:"good",icon:"📥",notes:`تحصيل من: ${c} — ${r.notes||""}`,inflow:C,outflow:0,userName:r.createdByName||"النظام",source:"receipts"})}if(o||t.accountId||t.name){for(const{id:x,data:r}of w)if(!(r.status==="cancelled"||r.isReversed)&&!(r.sourceType==="expense"||r.sourceType==="receipt"||r.sourceType==="cashTransaction")){if(r.sourceId){const i=String(r.sourceId).toUpperCase();if(g.has(i)||i.length>=6&&g.has(i.slice(0,6)))continue}(r.lines||[]).forEach((i,p)=>{if(o&&i.accountCode===o||t.accountId&&i.accountId===t.accountId||t.name&&i.accountName&&i.accountName.includes(t.name)){const $=`JE_DOC_${x}_L${p}`;if(g.has($))return;g.add($);const C=Number(i.debit||0),c=Number(i.credit||0),k=W(r),L=r.code||r.entryNumber||`JE-${x.slice(0,6).toUpperCase()}`;C>0?m.push({id:`${x}_${p}`,timestamp:k.timestamp,date:k.isoDate,displayDate:I(k.isoDate),ref:L,type:"in",badgeText:"قيد تسوية (+)",badgeClass:"good",icon:"⚖️",notes:`${r.description||i.note||"إيداع بقيد يومية"}`,inflow:C,outflow:0,userName:r.createdByName||"النظام",source:"journalEntries"}):c>0&&m.push({id:`${x}_${p}`,timestamp:k.timestamp,date:k.isoDate,displayDate:I(k.isoDate),ref:L,type:"out",badgeText:"قيد تسوية (-)",badgeClass:"bad",icon:"⚖️",notes:`${r.description||i.note||"سحب بقيد يومية"}`,inflow:0,outflow:c,userName:r.createdByName||"النظام",source:"journalEntries"})}})}}m.sort((x,r)=>x.date!==r.date?x.date.localeCompare(r.date):x.timestamp-r.timestamp);let h=0;for(const x of m)h+=Number(x.inflow||0)-Number(x.outflow||0);return h=Math.round(h*100)/100,{items:m,netBalance:h}}async function Tt(t){const e=B.find(l=>l.id===t);if(!e)return null;const[n,a,d,o]=await Promise.all([H(q(T.cashTransactions(),Z("cashBoxId","==",t))),H(q(T.receipts(),Z("sourceId","==",t))),H(q(T.expenses(),Z("sourceId","==",t))),at(T.journalEntries())]),{items:s}=Ct(e,n,a,d,o);return s}function ft(t){if(!t)return!1;const e=t.trim().split("-");if(e.length!==3||e[0].length!==4)return!1;const n=parseInt(e[0],10);return!(isNaN(n)||n<2e3||n>2099)}window.openCashBoxStatementModal=async t=>{const e=B.find(d=>d.id===t);if(!e)return;U=e,rt="asc",lt="",ct="";const n=document.getElementById("cb-stmt-modal-title"),a=document.getElementById("cb-stmt-body");n&&(n.textContent=`📄 كشف حساب تفصيلي شامل — ${e.name}`),a&&(a.innerHTML=`
      <!-- Top Box Info Card (Pure White High-Contrast Accounting Theme) -->
      <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:14px; padding:18px 22px; color:#0f172a; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:12px; color:#1d4ed8; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب المالي التفصيلي الموحد</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 2px 0; color:#0f172a;">${e.name}</h2>
          <div style="font-size:13px; color:#334155; font-weight:600; margin-top:4px;">
            المسؤول: <strong style="color:#0f172a;">${e.keeper||"غير محدد"}</strong>
            ${e.accountCode?` | كود الحساب: <span style="font-family:monospace;font-weight:900;color:#0369a1;background:#f0f9ff;padding:2px 8px;border-radius:6px;border:1px solid #bae6fd;">${e.accountCode}</span>`:""}
          </div>
        </div>
        <div id="cb-stmt-top-bal-container" style="text-align:left; background:#f0fdf4; padding:12px 20px; border-radius:12px; border:2px solid #86efac; box-shadow:0 2px 6px rgba(16,185,129,0.1); min-width:210px;">
          <div id="cb-stmt-top-bal-label" style="font-size:11.5px; color:#166534; font-weight:800;">الرصيد الفعلي الحالي بالخزينة</div>
          <div id="cb-stmt-top-bal-val" class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#15803d;">${y(e.balance||0)}</div>
          <div id="cb-stmt-top-bal-sub" style="font-size:11px; color:#15803d; font-weight:700; margin-top:3px; display:none;"></div>
        </div>
      </div>

      <!-- Statement Filters Bar (Static Container - Never destroyed on input change) -->
      <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:14px; padding:16px 20px; margin-bottom:18px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
          
          <!-- From Date -->
          <div style="flex:1; min-width:145px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:800; color:#0f172a; margin:0;">من تاريخ</label>
              <button type="button" onclick="clearStatementDate('from')" style="background:none; border:none; color:#64748b; font-size:11px; cursor:pointer; font-weight:800;" title="مسح">مسح ✖</button>
            </div>
            <input type="date" id="cb-stmt-from" class="input" style="font-size:13px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" oninput="onStatementFilterChange()" onchange="onStatementFilterChange()" />
          </div>

          <!-- To Date -->
          <div style="flex:1; min-width:145px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:800; color:#0f172a; margin:0;">إلى تاريخ</label>
              <button type="button" onclick="clearStatementDate('to')" style="background:none; border:none; color:#64748b; font-size:11px; cursor:pointer; font-weight:800;" title="مسح">مسح ✖</button>
            </div>
            <input type="date" id="cb-stmt-to" class="input" style="font-size:13px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" oninput="onStatementFilterChange()" onchange="onStatementFilterChange()" />
          </div>

          <!-- Movement Type -->
          <div style="flex:1; min-width:140px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">نوع الحركة</label>
            <select id="cb-stmt-type" class="input" onchange="onStatementFilterChange()" style="font-size:12.5px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;">
              <option value="">كافة الحركات</option>
              <option value="in">📥 مقبوضات واردة (+)</option>
              <option value="out">📤 مدفوعات صادرة (-)</option>
              <option value="transfer">🔄 تحويلات ومناقلات</option>
            </select>
          </div>

          <!-- Chronological Sort Order -->
          <div style="flex:1; min-width:170px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">ترتيب الحركات</label>
            <select id="cb-stmt-sort" class="input" onchange="onStatementFilterChange()" style="font-size:12.5px; font-weight:800; color:#0f172a; background:#f8fafc; border:1.5px solid #94a3b8; padding:7px 10px;">
              <option value="asc" selected>⬇️ من الأقدم للأحدث (محاسبي تراكمي)</option>
              <option value="desc">⬆️ من الأحدث للأقدم (الأحدث أولاً)</option>
            </select>
          </div>

          <!-- Search Query -->
          <div style="flex:1.5; min-width:180px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="cb-stmt-search" class="input" placeholder="رقم السند، جهة الصرف، المندوب..." oninput="onStatementFilterChange()" style="font-size:12.5px; font-weight:600; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" />
          </div>
        </div>

        <!-- Quick Period Presets -->
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#475569;">تحديد سريع للمدة:</span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('today')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #93c5fd; background:#eff6ff; color:#1d4ed8;">📅 اليوم</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('yesterday')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">أمس</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('this_month')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">هذا الشهر</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('last_month')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">الشهر السابق</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('this_year')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">هذا العام</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('all')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">كل الفترات (شامل)</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('clear_dates')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #fca5a5; background:#fff1f2; color:#be123c;">مسح التواريخ ✖</button>
        </div>
      </div>

      <!-- Dynamic Results Container (KPIs + Ledger Table rendered here only) -->
      <div id="cb-stmt-results-container">
        <div style="text-align:center; padding:50px;">
          <div class="loading-spinner" style="margin:0 auto 16px auto;"></div>
          <div style="font-weight:800; font-size:14px; color:#0f172a;">جاري تنقية وترتيب كشف الحساب المالي لـ ${e.name}…</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">يتم الفحص ومنع التكرار وحساب الأرصدة التراكمية زمنياً بدقة</div>
        </div>
      </div>
    `),openModal("cb-statement-modal");try{V=await Tt(t),K()}catch(d){console.error(d);const o=document.getElementById("cb-stmt-results-container");o&&(o.innerHTML=`<div class="alert bad">حدث خطأ في تحميل كشف الحساب: ${d.message}</div>`)}};function K(){const t=document.getElementById("cb-stmt-results-container"),e=U;if(!t||!e)return;const n=document.getElementById("cb-stmt-from")?.value||"",a=document.getElementById("cb-stmt-to")?.value||"",d=ft(n)?n:"",o=ft(a)?a:"",s=document.getElementById("cb-stmt-type")?.value||"",l=document.getElementById("cb-stmt-sort")?.value||"asc",f=(document.getElementById("cb-stmt-search")?.value||"").trim().toLowerCase();lt=d,ct=o,rt=l;const w=!!(d&&o&&d>o);let b=0,u=[];if(!w){for(const c of V||[])d&&c.date<d?b+=c.inflow-c.outflow:u.push(c);o&&(u=u.filter(c=>c.date<=o))}let m=b,g=0,E=0;u.forEach(c=>{g+=c.inflow,E+=c.outflow,m+=c.inflow-c.outflow,c.balanceAfter=m}),gt=b,Y=m;let h=[...u];s==="in"&&(h=h.filter(c=>c.inflow>0)),s==="out"&&(h=h.filter(c=>c.outflow>0)),s==="transfer"&&(h=h.filter(c=>c.notes.includes("تحويل")||c.ref.startsWith("TR-"))),f&&(h=h.filter(c=>(c.notes||"").toLowerCase().includes(f)||(c.ref||"").toLowerCase().includes(f)||(c.userName||"").toLowerCase().includes(f)));const x=h.reduce((c,k)=>c+(k.inflow||0),0),r=h.reduce((c,k)=>c+(k.outflow||0),0),i=x-r,p=!!(s||f);l==="desc"&&h.reverse(),Q=h;const v=document.getElementById("cb-stmt-top-bal-val"),$=document.getElementById("cb-stmt-top-bal-label"),C=document.getElementById("cb-stmt-top-bal-sub");v&&$&&(d||o?($.textContent="رصيد إقفال الفترة المحددة",v.textContent=y(m),C&&(C.style.display="block",C.innerHTML=`الرصيد الفعلي الحالي بالخزينة الآن: <strong dir="ltr">${y(e.balance||0)}</strong>`)):($.textContent="الرصيد الفعلي الحالي بالخزينة",v.textContent=y(typeof m=="number"?m:e.balance||0),C&&(C.style.display="none"))),t.innerHTML=`
    ${w?`
      <div class="alert warn" style="margin-bottom:14px; font-weight:800; background:#fffbeb; border:1.5px solid #fcd34d; color:#92400e; padding:10px 14px; border-radius:10px;">
        ⚠️ تنبيه: تاريخ البداية (${I(d)}) يأتي بعد تاريخ النهاية (${I(o)}). يرجى تعديل التواريخ لعرض الحركات بشكل سليم.
      </div>
    `:""}

    <!-- KPI Summary Cards Banner (High-Contrast Clean Theme) -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:18px;">
      
      <!-- 1. Opening Balance Card (Always rendered for accounting continuity) -->
      <div style="background:#ffffff; border:2px solid #94a3b8; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#334155; font-weight:800;">
          📦 الرصيد الافتتاحي ${d?`(قبل ${I(d)})`:"(بداية التعامل)"}
        </div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#0f172a;">${y(b)}</div>
        <div style="font-size:10.5px; color:#64748b; margin-top:2px;">${d?"منقول من الحركات السابقة":"رصيد الانطلاق التأسيسي"}</div>
      </div>

      <!-- 2. Inflows Card -->
      <div style="background:#f0fdf4; border:2px solid #16a34a; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#166534; font-weight:800;">📥 إجمالي المقبوضات (+)</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#15803d;">
          +${y(p?x:g)}
        </div>
        <div style="font-size:10.5px; color:#166534; margin-top:2px;">
          ${p?`المعروض: ${h.filter(c=>c.inflow>0).length} حركة`:`كافة مقبوضات الفترة (${u.filter(c=>c.inflow>0).length})`}
        </div>
      </div>

      <!-- 3. Outflows Card -->
      <div style="background:#fef2f2; border:2px solid #dc2626; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#991b1b; font-weight:800;">📤 إجمالي المدفوعات (-)</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#dc2626;">
          -${y(p?r:E)}
        </div>
        <div style="font-size:10.5px; color:#991b1b; margin-top:2px;">
          ${p?`المعروض: ${h.filter(c=>c.outflow>0).length} حركة`:`كافة مدفوعات الفترة (${u.filter(c=>c.outflow>0).length})`}
        </div>
      </div>

      <!-- 4. Net Movement Card -->
      <div style="background:#eff6ff; border:2px solid #2563eb; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#1e40af; font-weight:800;">⚖️ صافي حركة ${p?"المعروض":"الفترة"}</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:${(p?i:g-E)>=0?"#15803d":"#dc2626"};">
          ${(p?i:g-E)>=0?"+":""}${y(p?i:g-E)}
        </div>
        <div style="font-size:10.5px; color:#1e40af; margin-top:2px;">
          ${(p?i:g-E)>=0?"فائض مقبوضات واردة":"عجز / زيادة منصرف"}
        </div>
      </div>

      <!-- 5. Closing / Period End Balance Card -->
      <div style="background:#f8fafc; border:2px solid #0f172a; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#0f172a; font-weight:900;">
          💵 ${o?`رصيد إقفال (${I(o)})`:"الرصيد الختامي للصندوق"}
        </div>
        <div class="mono" style="font-size:19px; font-weight:900; margin-top:4px; color:#0f172a;">
          ${y(m)}
        </div>
        <div style="font-size:10.5px; color:#475569; margin-top:2px;">
          ${o?"الرصيد التراكمي في نهاية التاريخ":"رصيد الخزينة الحالي التراكمي"}
        </div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="table-container" style="background:#ffffff; border-radius:14px; border:1.5px solid #cbd5e1; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
      <table class="data-dense" style="width:100%; font-size:12.5px; border-collapse:collapse;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff !important;">
            <th style="padding:11px 12px; width:45px; text-align:center; color:#ffffff !important; font-weight:800;">#</th>
            <th style="padding:11px 12px; width:100px; color:#ffffff !important; font-weight:800;">التاريخ</th>
            <th style="padding:11px 12px; width:110px; color:#ffffff !important; font-weight:800;">المرجع</th>
            <th style="padding:11px 12px; width:135px; color:#ffffff !important; font-weight:800;">نوع الحركة</th>
            <th style="padding:11px 12px; color:#ffffff !important; font-weight:800;">البيان التفصيلي والجهة</th>
            <th style="padding:11px 12px; text-align:left; width:115px; color:#ffffff !important; font-weight:800;">وارد (+)</th>
            <th style="padding:11px 12px; text-align:left; width:115px; color:#ffffff !important; font-weight:800;">صادر (-)</th>
            <th style="padding:11px 12px; text-align:left; width:130px; color:#ffffff !important; font-weight:800;">الرصيد التراكمي</th>
            <th style="padding:11px 12px; width:85px; color:#ffffff !important; font-weight:800;">المسؤول</th>
            <th style="padding:11px 12px; width:105px; color:#ffffff !important; font-weight:800; text-align:center;">طباعة السند</th>
          </tr>
        </thead>
        <tbody>
          ${d&&l==="asc"?`
            <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1; font-weight:800;">
              <td style="text-align:center;color:#64748b;">•</td>
              <td class="mono" style="color:#0f172a; font-weight:800;">${I(d)}</td>
              <td class="mono" style="color:#475569;">OPENING</td>
              <td><span style="background:#e2e8f0;color:#0f172a;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;border:1px solid #cbd5e1;">📦 رصيد افتتاحي</span></td>
              <td style="color:#0f172a; font-weight:700;">الرصيد الافتتاحي المنقول قبل تاريخ ${I(d)}</td>
              <td style="text-align:left;color:#94a3b8;">—</td>
              <td style="text-align:left;color:#94a3b8;">—</td>
              <td class="mono" style="text-align:left;">
                <span dir="ltr" style="background:#ffffff; border:2px solid #0284c7; padding:3px 10px; border-radius:6px; font-weight:900; color:#0369a1; display:inline-block;">
                  ${y(b)}
                </span>
              </td>
              <td style="color:#64748b; font-weight:700;">النظام</td>
              <td></td>
            </tr>
          `:""}

          ${h.length?h.map((c,k)=>`
            <tr style="border-bottom:1px solid #e2e8f0; background:${k%2===0?"#ffffff":"#f8fafc"}; transition:background 0.15s ease;">
              <td style="text-align:center; color:#64748b; font-size:11.5px; padding:10px 8px; font-weight:700;">${k+1}</td>
              <td class="mono font-bold" style="font-size:12.5px; padding:10px; color:#0f172a;">${c.displayDate}</td>
              <td class="mono" style="font-size:11.5px; padding:10px;">
                <span dir="ltr" style="background:#f1f5f9; padding:3px 8px; border-radius:6px; font-weight:800; color:#0f172a; border:1px solid #cbd5e1;">${c.ref}</span>
              </td>
              <td style="padding:10px;">
                <span style="display:inline-flex; align-items:center; gap:5px; background:${c.inflow?"#ecfdf5":"#fef2f2"}; color:${c.inflow?"#15803d":"#991b1b"}; padding:4px 9px; border-radius:6px; font-weight:800; font-size:11px; border:1px solid ${c.inflow?"#86efac":"#fca5a5"};">
                  <span>${c.icon}</span> <span>${c.badgeText}</span>
                </span>
              </td>
              <td style="font-size:12.5px; color:#0f172a; font-weight:700; padding:10px;">${c.notes}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px; color:#15803d;">${c.inflow?"+"+y(c.inflow):"—"}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px; color:#dc2626;">${c.outflow?"-"+y(c.outflow):"—"}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px;">
                <span dir="ltr" style="display:inline-block; direction:ltr; background:#ffffff; padding:4px 10px; border-radius:6px; border:2px solid #0f172a; color:#0f172a; font-weight:900;">
                  ${y(c.balanceAfter)}
                </span>
              </td>
              <td style="font-size:11.5px; color:#475569; padding:10px; font-weight:600;">${c.userName||"النظام"}</td>
              <td style="text-align:center; padding:6px 8px;">
                <button type="button" class="btn btn-sm" onclick="printCashTxnVoucher('${c.id||c.ref}')"
                  title="${c.inflow?"طباعة سند قبض واستلام":"طباعة سند صرف وإقرار استلام"}"
                  style="font-size:11px;font-weight:800;padding:4px 8px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;${c.inflow?"background:#ecfdf5;color:#047857;border:1px solid #86efac;":"background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;"}">
                  <span>🖨️</span> <span>${c.inflow?"سند قبض":"سند صرف"}</span>
                </button>
              </td>
            </tr>
          `).join(""):'<tr><td colspan="10" style="text-align:center; padding:40px; color:#475569; font-weight:800; font-size:14px;">لا توجد حركات مطابقة للفترة والتصفية المحددة</td></tr>'}
        </tbody>
        <tfoot style="background:#f1f5f9; border-top:2.5px solid #0f172a; font-weight:900;">
          <tr>
            <td colspan="5" style="padding:14px 16px; font-size:13px; color:#0f172a; font-weight:900;">
              إجمالي الحركات المعروضة بالجدول (${h.length} حركة):
            </td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#15803d; font-weight:900;">+${y(x)}</td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#dc2626; font-weight:900;">-${y(r)}</td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#0f172a; font-weight:900;">
              <span dir="ltr">${y(m)}</span>
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `}window.renderActiveStatementView=()=>{K()};let nt=null;window.onStatementFilterChange=()=>{nt&&clearTimeout(nt),nt=setTimeout(()=>{K()},100)};window.clearStatementDate=t=>{if(t==="from"){const e=document.getElementById("cb-stmt-from");e&&(e.value="")}else if(t==="to"){const e=document.getElementById("cb-stmt-to");e&&(e.value="")}K()};window.setStatementPreset=t=>{const e=document.getElementById("cb-stmt-from"),n=document.getElementById("cb-stmt-to"),a=new Date,d=s=>{const l=s.getFullYear(),f=String(s.getMonth()+1).padStart(2,"0"),w=String(s.getDate()).padStart(2,"0");return`${l}-${f}-${w}`},o=d(a);if(t==="all"||t==="clear_dates")e&&(e.value=""),n&&(n.value="");else if(t==="today")e&&(e.value=o),n&&(n.value=o);else if(t==="yesterday"){const s=new Date(a.getFullYear(),a.getMonth(),a.getDate()-1),l=d(s);e&&(e.value=l),n&&(n.value=l)}else if(t==="this_month"){const s=a.getFullYear(),l=String(a.getMonth()+1).padStart(2,"0");e&&(e.value=`${s}-${l}-01`),n&&(n.value=o)}else if(t==="last_month"){const s=a.getFullYear(),l=new Date(s,a.getMonth()-1,1),f=l.getFullYear(),w=String(l.getMonth()+1).padStart(2,"0"),b=new Date(f,l.getMonth()+1,0).getDate();e&&(e.value=`${f}-${w}-01`),n&&(n.value=`${f}-${w}-${String(b).padStart(2,"0")}`)}else if(t==="this_year"){const s=a.getFullYear();e&&(e.value=`${s}-01-01`),n&&(n.value=o)}K()};window.exportCashBoxStatementToExcel=async()=>{if(!U||!Q){showToast("لا توجد بيانات متاحة للتصدير","warning");return}const t=U,e=Q,n=e.map((o,s)=>[s+1,o.date,o.ref,o.badgeText,o.notes,o.inflow||0,o.outflow||0,o.balanceAfter||0,o.userName||"النظام"]),a=e.reduce((o,s)=>o+(s.inflow||0),0),d=e.reduce((o,s)=>o+(s.outflow||0),0);n.push(["الإجمالي","","","",`عدد الحركات: ${e.length}`,a,d,typeof Y=="number"?Y:0,""]),await vt({title:`كشف_حساب_${t.name.replace(/\s+/g,"_")}`,headers:["م","التاريخ","رقم السند/المرجع","نوع الحركة","البيان والتفاصيل","وارد (+)","صادر (-)","الرصيد التراكمي","المسؤول"],rows:n,colWidths:[6,14,16,16,40,14,14,16,14],user:t.keeper||"نظام إدهام"}),showToast("تم تصدير كشف الحساب إلى Excel بنجاح","success")};window.printCashBoxStatementOfficial=()=>{if(!U||!Q)return;const t=window.open("","_blank","width=950,height=800"),e=U,n=Q,a=lt,d=ct,o=gt||0,s=typeof Y=="number"?Y:e.balance||0,l=n.reduce((b,u)=>b+(u.inflow||0),0),f=n.reduce((b,u)=>b+(u.outflow||0),0),w=l-f;t.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب رسمي — ${e.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; padding:25px; background:#fff; color:#0f172a; }
    .header-box { background:#f8fafc; color:#0f172a; padding:18px 22px; border-radius:12px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; border:2px solid #0f172a; }
    .kpi-row { display:flex; gap:10px; margin-bottom:18px; }
    .kpi-card { flex:1; padding:10px; border-radius:8px; border:1.5px solid #cbd5e1; text-align:center; background:#f8fafc; }
    table { width:100%; border-collapse:collapse; margin-top:10px; font-size:11.5px; }
    th { background:#f1f5f9; color:#1e293b; padding:8px 10px; font-weight:800; text-align:right; border-bottom:2px solid #cbd5e1; }
    td { padding:8px 10px; border-bottom:1px solid #e2e8f0; }
    .mono { font-family:monospace; font-weight:700; }
    @media print {
      body { padding:0; }
      .header-box { background:#f8fafc !important; color:#0f172a !important; border:2px solid #0f172a !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size:20px;font-weight:900;color:#0f172a;">مؤسسة إدهام للمواد الغذائية</h1>
      <h2 style="font-size:16px;font-weight:800;color:#1d4ed8;margin-top:3px;">كشف حساب رسمي: ${e.name}</h2>
      <div style="font-size:12px;color:#334155;margin-top:3px;font-weight:600;">
        المسؤول: <strong style="color:#0f172a;">${e.keeper||"—"}</strong>
        ${e.accountCode?`| كود الحساب: <strong>${e.accountCode}</strong>`:""} 
        | الفترة: <strong>${a?I(a):"بداية التعامل"}</strong> إلى <strong>${d?I(d):"اليوم"}</strong>
      </div>
    </div>
    <div style="text-align:left;background:#f0fdf4;padding:10px 18px;border-radius:10px;border:1.5px solid #86efac;">
      <div style="font-size:11px;color:#166534;font-weight:800;">${a||d?"رصيد إقفال الفترة المحددة":"الرصيد الفعلي الحالي بالخزينة"}</div>
      <div class="mono" style="font-size:22px;font-weight:900;direction:ltr;color:#15803d;">${y(s)}</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card" style="background:#ffffff;border-color:#94a3b8;">
      <div style="font-size:10.5px;color:#334155;font-weight:800;">الرصيد الافتتاحي ${a?`(قبل ${I(a)})`:"(البداية)"}</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#0f172a;">${y(o)}</div>
    </div>
    <div class="kpi-card" style="background:#ecfdf5;border-color:#a7f3d0;">
      <div style="font-size:10.5px;color:#047857;font-weight:800;">إجمالي المقبوضات (+)</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#047857;">+${y(l)}</div>
    </div>
    <div class="kpi-card" style="background:#fef2f2;border-color:#fecaca;">
      <div style="font-size:10.5px;color:#dc2626;font-weight:800;">إجمالي المدفوعات (-)</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#dc2626;">-${y(f)}</div>
    </div>
    <div class="kpi-card" style="background:#eff6ff;border-color:#bfdbfe;">
      <div style="font-size:10.5px;color:#1d4ed8;font-weight:800;">صافي الحركة</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:${w>=0?"#15803d":"#dc2626"};">${w>=0?"+":""}${y(w)}</div>
    </div>
    <div class="kpi-card" style="background:#f8fafc;border-color:#0f172a;">
      <div style="font-size:10.5px;color:#0f172a;font-weight:900;">${d?`رصيد إقفال (${I(d)})`:"الرصيد الختامي"}</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#0f172a;">${y(s)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th style="width:90px;">التاريخ</th>
        <th style="width:90px;">المرجع</th>
        <th style="width:110px;">نوع الحركة</th>
        <th>البيان والتفاصيل</th>
        <th style="text-align:left;width:100px;">وارد (+)</th>
        <th style="text-align:left;width:100px;">صادر (-)</th>
        <th style="text-align:left;width:115px;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${a&&rt!=="desc"?`
        <tr style="background:#f8fafc;font-weight:800;border-bottom:1.5px solid #cbd5e1;">
          <td style="text-align:center;">•</td>
          <td class="mono">${I(a)}</td>
          <td class="mono">OPENING</td>
          <td><strong>📦 رصيد افتتاحي</strong></td>
          <td>الرصيد الافتتاحي المنقول قبل تاريخ ${I(a)}</td>
          <td style="text-align:left;color:#94a3b8;">—</td>
          <td style="text-align:left;color:#94a3b8;">—</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${y(o)}</td>
        </tr>
      `:""}
      ${n.map((b,u)=>`
        <tr>
          <td>${u+1}</td>
          <td class="mono">${b.displayDate}</td>
          <td class="mono" dir="ltr">${b.ref}</td>
          <td><strong>${b.badgeText}</strong></td>
          <td>${b.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${b.inflow?"+"+y(b.inflow):"—"}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${b.outflow?"-"+y(b.outflow):"—"}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${y(b.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
    <tfoot>
      <tr style="background:#f1f5f9;font-weight:900;border-top:2px solid #0f172a;">
        <td colspan="5">الإجمالي العام (${n.length} حركة):</td>
        <td class="mono" style="text-align:left;color:#047857;">+${y(l)}</td>
        <td class="mono" style="text-align:left;color:#dc2626;">-${y(f)}</td>
        <td class="mono" style="text-align:left;" dir="ltr">${y(s)}</td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top:40px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11.5px;color:#475569;">
    <div><strong>أمين الصندوق / المسؤول:</strong> .....................................</div>
    <div><strong>المحاسب المالي:</strong> .....................................</div>
    <div><strong>اعتماد الإدارة:</strong> .....................................</div>
  </div>
</body>
</html>`),t.document.close(),setTimeout(()=>{t.focus(),t.print(),t.close()},600)};window.openCashBoxModal=(t="")=>{const e=document.getElementById("cb-opening")?.closest(".form-group"),n=document.getElementById("cb-coa-toggle-wrap");if(t){const a=B.find(d=>d.id===t);if(!a)return;document.getElementById("cb-edit-id").value=a.id,document.getElementById("cb-name").value=a.name||"",document.getElementById("cb-keeper").value=a.keeper||"",document.getElementById("cb-type").value=a.type||"main",document.getElementById("cb-opening").value=a.openingBalance||0,e&&(e.style.display="none"),n&&(n.style.display="none")}else document.getElementById("cb-edit-id").value="",document.getElementById("cb-name").value="",document.getElementById("cb-keeper").value="",document.getElementById("cb-type").value="main",document.getElementById("cb-opening").value="",e&&(e.style.display="block"),n&&(n.style.display="flex");document.getElementById("cb-error").classList.add("hidden"),openModal("cb-modal")};window.saveCashBox=async()=>{const t=document.getElementById("cb-error");t.classList.add("hidden");const e=document.getElementById("cb-edit-id").value,n=document.getElementById("cb-name").value.trim(),a=document.getElementById("cb-type").value,d=document.getElementById("cb-keeper").value.trim(),o=parseFloat(document.getElementById("cb-opening")?.value)||0,s=document.getElementById("cb-coa-toggle")?.checked??!0;if(!n){t.textContent="يرجى أدخال اسم الصندوق / العهدة",t.classList.remove("hidden");return}const l=document.getElementById("save-cb-btn");l.disabled=!0;try{if(e){const f=B.find(w=>w.id===e);await J(T.cashBoxes(),e,{name:n,type:a,keeper:d}),f?.accountId&&await J(T.chartOfAccounts(),f.accountId,{name:n}),showToast("تم تحديث بيانات الصندوق بنجاح","success")}else{let f=null,w=null;if(s){const m=await yt({entityId:"temp",entityType:"cashBox",name:n,parentCode:a==="owner_current"?"3-1-4":"1-1-1-2"});m&&(f=m.id||m.accountId,w=m.code||m.accountCode)}const b=await ut(T.cashBoxes(),{name:n,type:a,keeper:d,openingBalance:o,balance:o,accountId:f,accountCode:w});f&&b?.id&&await J(T.chartOfAccounts(),f,{sourceEntityId:b.id}),showToast("تم إضافة الصندوق النقدي بنجاح","success")}closeModal("cb-modal"),await Promise.all([D(T.cashBoxes().path),D(T.chartOfAccounts().path)]),await R()}catch(f){t.textContent=f.message,t.classList.remove("hidden")}finally{l.disabled=!1}};window.deleteCashBox=async(t,e)=>{if(await window.showConfirm?.(`هل أنت متأكد من حذف ${e}؟`,"حذف الصندوق"))try{const a=B.find(d=>d.id===t);await mt(T.cashBoxes(),t),a?.accountId&&await ht(a.accountId),showToast("تم حذف الصندوق بنجاح","success"),await Promise.all([D(T.cashBoxes().path),D(T.chartOfAccounts().path)]),await R()}catch(a){showToast("خطأ في الحذف: "+a.message,"error")}};window.toggleTxnTypeFields=()=>{const t=document.getElementById("ctxn-type").value,e=document.getElementById("ctxn-target-box-wrap"),n=document.getElementById("ctxn-target-box"),a=document.getElementById("ctxn-box").value;if(t==="transfer"){e.classList.remove("hidden");const d=B.filter(o=>o.id!==a);n.innerHTML=d.map(o=>`<option value="${o.id}">${o.name}</option>`).join("")}else e.classList.add("hidden")};window.openCashTxnModal=()=>{const t=document.getElementById("ctxn-box");if(B.length===0){showToast("قم بإضافة صندوق نقدي أولاً","warning");return}t.innerHTML=B.map(e=>`<option value="${e.id}">${e.name} (${y(e.balance||0)})</option>`).join(""),document.getElementById("ctxn-type").value="in",document.getElementById("ctxn-amount").value="",document.getElementById("ctxn-notes").value="",document.getElementById("ctxn-error").classList.add("hidden"),toggleTxnTypeFields(),openModal("cb-txn-modal")};window.saveCashTxn=async()=>{const t=document.getElementById("ctxn-error");t.classList.add("hidden");const e=document.getElementById("ctxn-box").value,n=document.getElementById("ctxn-type").value,a=parseFloat(document.getElementById("ctxn-amount").value)||0,d=document.getElementById("ctxn-notes").value.trim();if(!e){t.textContent="اختر الصندوق",t.classList.remove("hidden");return}if(a<=0){t.textContent="المبلغ غير صحيح",t.classList.remove("hidden");return}if(!d){t.textContent="أدخل البيان",t.classList.remove("hidden");return}const o=document.getElementById("save-ctxn-btn");o.disabled=!0;try{if(n==="transfer"){const s=document.getElementById("ctxn-target-box").value;if(!s)throw new Error("اختر الصندوق المستلم");if(s===e)throw new Error("لا يمكن التحويل لنفس الصندوق");const l=M(N,`companies/${A}/cashBoxes`,e),f=M(N,`companies/${A}/cashBoxes`,s);let w=0,b=0,u="",m="",g="",E="";await st(N,async h=>{const x=await h.get(l),r=await h.get(f);if(!x.exists())throw new Error("الصندوق المرسل غير موجود");if(!r.exists())throw new Error("الصندوق المستلم غير موجود");const i=x.data(),p=r.data(),v=i.balance||0,$=p.balance||0;if(u=i.name,m=p.name,g=i.accountCode||"1-1-1-1-3",E=p.accountCode||"1-1-1-1-3",v<a)throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${v} < ${a}`);w=v-a,b=$+a,h.update(l,{balance:w,updatedAt:F()}),h.update(f,{balance:b,updatedAt:F()});const C=M(_(N,`companies/${A}/cashTransactions`));h.set(C,{cashBoxId:e,type:"out",amount:a,notes:`تحويل إلى ${m} — ${d}`,balanceAfter:w,createdAt:F()});const c=M(_(N,`companies/${A}/cashTransactions`));h.set(c,{cashBoxId:s,type:"in",amount:a,notes:`تحويل من ${u} — ${d}`,balanceAfter:b,createdAt:F()})});try{await it({date:new Date().toISOString().split("T")[0],description:`تحويل نقدي من صندوق ${u} إلى ${m} — ${d}`,sourceType:"cashTransaction",lines:[{accountCode:E,accountName:m,debit:a,credit:0},{accountCode:g,accountName:u,debit:0,credit:a}],status:"posted",createdByName:"النظام"})}catch(h){console.warn("[CashTxn JE] Failed (non-fatal):",h.message)}}else{const s=M(N,`companies/${A}/cashBoxes`,e);let l=0,f="1-1-1-1-3",w="الصندوق";await st(N,async b=>{const u=await b.get(s);if(!u.exists())throw new Error("الصندوق غير موجود");const m=u.data(),g=m.balance||0,E=n==="in"?+a:-a;if(l=g+E,l<0&&n==="out")throw new Error(`رصيد الصندوق غير كافٍ: ${g} < ${a}`);f=m.accountCode||"1-1-1-1-3",w=m.name,b.update(s,{balance:l,updatedAt:F()});const h=M(_(N,`companies/${A}/cashTransactions`));b.set(h,{cashBoxId:e,type:n,amount:a,notes:d,balanceAfter:l,createdAt:F()})});try{const b=n==="in"?f:"6-9-1",u=n==="in"?w:"مصاريف متنوعة",m=n==="in"?"4-9-1":f,g=n==="in"?"إيرادات متنوعة":w;await it({date:new Date().toISOString().split("T")[0],description:`حركة نقدية — ${d} — صندوق: ${w}`,sourceType:"cashTransaction",lines:[{accountCode:b,accountName:u,debit:a,credit:0},{accountCode:m,accountName:g,debit:0,credit:a}],status:"posted",createdByName:"النظام"})}catch(b){console.warn("[CashTxn JE] Failed (non-fatal):",b.message)}}showToast("تم تسجيل الحركة النقدية بنجاح","success"),closeModal("cb-txn-modal"),await Promise.all([D(T.cashBoxes().path),D(T.cashTransactions().path),D(T.journalEntries().path),D(T.chartOfAccounts().path)]),await R(),await ot()}catch(s){t.textContent=s.message,t.classList.remove("hidden")}finally{o.disabled=!1}};function Bt(t,e){const n=t.type==="in",a=!!(t.isTransfer||t.notes&&t.notes.includes("تحويل")||t.sourceType==="cashTransfer"),d=Math.abs(Number(t.amount||0)),o=typeof pt=="function"?pt(d):`${d} ريال سعودي`;let s=t.refNumber||"";s||(t.sourceType==="receipt"?s=`RV-${(t.sourceId||t.id).substring(0,6).toUpperCase()}`:t.sourceType==="expense"?s=`PV-${(t.sourceId||t.id).substring(0,6).toUpperCase()}`:a?s=`TR-${t.id.substring(0,6).toUpperCase()}`:s=`${n?"RV":"PV"}-${t.id.substring(0,6).toUpperCase()}`);let l="";t.date&&/^\d{4}-\d{2}-\d{2}$/.test(t.date)?l=I(t.date):t.date?l=t.date:t.createdAt?.toDate?l=I(t.createdAt.toDate()):t.createdAt?.seconds?l=I(new Date(t.createdAt.seconds*1e3)):l=et();const f={};(B||[]).forEach(S=>f[S.id]=S.name);const w=f[t.cashBoxId]||t.cashBoxName||(n?"الخزينة المستلمة":"الصندوق الرئيسي");let b=t.relatedBoxName||"";if(!b&&t.notes){if(t.notes.includes("إلى ")){const S=t.notes.match(/إلى\s+([^—\-]+)/);S&&S[1]&&(b=S[1].trim())}else if(t.notes.includes("من ")){const S=t.notes.match(/من\s+([^—\-]+)/);S&&S[1]&&(b=S[1].trim())}}b||(b=n?t.customerName||t.senderName||"الجهة المودعة / المحوِّلة":t.beneficiary||t.supplierName||t.receiverName||"الجهة المستلمة / الحساب المحول إليه");const u=e.name||e.companyName||"شركة نظم الإمداد المتطورة",m=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",g=e.phone||e.mobile||"0549141648",E=e.vatNumber||e.vat||e.taxNumber||"314996148100003",h=e.crNumber||e.cr||"7054969006",x=e.logoUrl||e.logoBase64||e.logo||"";let r="سـنـد صـرف نـقـدي",i="CASH PAYMENT VOUCHER",p="linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 55%, #991b1b 100%)",v="linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #ea580c 100%)",$="linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",C="#ef4444",c="#7f1d1d",k="المبلغ المصروف نقداً",L=a?"تحويل صادر 🔄":"صرف نقدية 📤";n?(r=a?"سـنـد قـبـض وتـحـويـل نـقـدي":"سـنـد قـبـض واسـتـلام نـقـدي",i=a?"CASH RECEIPT & TRANSFER VOUCHER":"CASH RECEIPT VOUCHER",p="linear-gradient(135deg, #064e3b 0%, #0f172a 55%, #047857 100%)",v="linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #10b981 100%)",$="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",C="#10b981",c="#064e3b",k="المبلغ المقبوض نقداً",L=a?"تحويل وارد 🔄":"قبض نقدية 📥"):a&&(r="سـنـد صـرف وتـحـويـل نـقـدي",i="CASH DISBURSEMENT & TRANSFER VOUCHER",p="linear-gradient(135deg, #831843 0%, #1e1b4b 50%, #991b1b 100%)");let j="";return n?j=`تم استلام المبلغ المالي الموضح أعلاه وقدره 
      <span style="color:#047857;font-weight:900;">(${y(d)})</span> — 
      <em style="color:#065f46;">فقط ${o} لا غير</em>، وتم قيده وإيداعه رسمياً في <strong>(خزينة: ${w})</strong> وذلك عن: <strong>${t.notes||"—"}</strong>.`:j=`أقر أنا الموقع أدناه بأنني قد استلمت من <strong>(خزينة: ${w})</strong> المبلغ المالي الموضح أعلاه وقدره 
      <span style="color:#b91c1c;font-weight:900;">(${y(d)})</span> — 
      <em style="color:#92400e;">فقط ${o} لا غير</em>، نقداً بصفة نهائية وذلك عن: <strong>${t.notes||"—"}</strong>، ويُعتبر توقيعي أدناه إقراراً بالاستلام وإبراءً لذمة الشركة ومسؤول الخزينة.`,`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${r} — ${s}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { 
      size: A4 portrait; 
      margin: 5mm; 
    }
    body {
      font-family:'Cairo',Arial,sans-serif;
      direction:rtl;
      background:#f8fafc;
      color:#0f172a;
      padding:16px 12px;
      -webkit-print-color-adjust:exact !important;
      print-color-adjust:exact !important;
    }
    .no-print {
      display:flex;
      justify-content:center;
      gap:12px;
      margin-bottom:14px;
    }
    .action-btn {
      padding:8px 18px;
      border-radius:8px;
      font-size:13.5px;
      font-weight:800;
      font-family:'Cairo',sans-serif;
      cursor:pointer;
      border:none;
      transition:all 0.15s;
      box-shadow:0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-print { background:#1e293b; color:#fff; }
    .btn-print:hover { background:#0f172a; }
    .btn-close { background:#e2e8f0; color:#334155; }
    .btn-close:hover { background:#cbd5e1; }
    
    .voucher-card {
      max-width:820px;
      margin:0 auto;
      background:#ffffff;
      border-radius:14px;
      overflow:hidden;
      border:1.5px solid #cbd5e1;
      box-shadow:0 8px 24px rgba(0,0,0,0.06);
    }
    @media print {
      html, body {
        background:#ffffff !important;
        padding:0 !important;
        margin:0 !important;
        height:100% !important;
        -webkit-print-color-adjust:exact !important;
        print-color-adjust:exact !important;
      }
      .no-print { display:none !important; }
      .voucher-card {
        border:1.5px solid #cbd5e1 !important;
        box-shadow:none !important;
        border-radius:8px !important;
        width:100% !important;
        max-width:100% !important;
        page-break-inside:avoid !important;
        break-inside:avoid !important;
        page-break-after:avoid !important;
        break-after:avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Action Toolbar -->
  <div class="no-print">
    <button class="action-btn btn-print" onclick="window.print()">🖨️ طباعة السند الآن (Print)</button>
    <button class="action-btn btn-close" onclick="window.close()">❌ إغلاق النافذة</button>
  </div>

  <div class="voucher-card">

    <!-- ═══ ROYAL HEADER ═══ -->
    <div style="background:${p} !important;padding:12px 22px;color:#ffffff;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Company Identity -->
        <div style="display:flex;align-items:center;gap:14px;">
          ${x?`<img src="${x}" style="height:54px;width:54px;object-fit:contain;background:#ffffff;border-radius:10px;padding:3px;box-shadow:0 2px 8px rgba(0,0,0,0.25);" />`:'<div style="width:54px;height:54px;background:rgba(255,255,255,0.18);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏛️</div>'}
          <div>
            <div style="font-size:20px;font-weight:900;color:#ffffff !important;line-height:1.15;margin-bottom:3px;letter-spacing:0.2px;">${u}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.92) !important;margin-bottom:4px;font-weight:600;">📍 ${m}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px 8px;font-size:10px;color:rgba(255,255,255,0.95) !important;">
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${E}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل: <span dir="ltr" style="font-family:monospace;">${h}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${g}</span></span>`}
            </div>
          </div>
        </div>

        <!-- Voucher Certificate Title Badge -->
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.16) !important;backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.35) !important;border-radius:12px;padding:8px 18px;box-shadow:0 3px 10px rgba(0,0,0,0.15);-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
            <div style="font-size:20px;font-weight:900;color:#ffffff !important;letter-spacing:0.5px;line-height:1.1;">${r}</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.9) !important;letter-spacing:1.5px;font-weight:800;margin-top:3px;text-transform:uppercase;">${i}</div>
          </div>
        </div>

      </div>

      <!-- Accent Ribbon -->
      <div style="height:3px;background:${v} !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;margin-top:10px;border-radius:2px;"></div>
    </div>

    <!-- ═══ META & SERIAL BAR ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #cbd5e1;padding:8px 22px;display:grid;grid-template-columns:1.2fr 1fr 1.2fr 1fr;gap:12px;align-items:center;">
      
      <!-- Ref Number -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">رقم السند المرجعي</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:15px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;background:#ffffff;padding:2px 10px;border-radius:6px;border:1.5px solid #cbd5e1;">${s}</div>
      </div>

      <!-- Date -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">تاريخ المعاملة</div>
        <div style="font-size:14px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${l}</div>
      </div>

      <!-- Cash Box -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">${n?"الخزينة المودع بها":"الخزينة المسلّمة"}</div>
        <div style="font-size:13px;font-weight:900;color:#0f172a;">${w}</div>
      </div>

      <!-- Payment Method -->
      <div style="text-align:center;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">طريقة المعاملة</div>
        <div style="font-size:12.5px;font-weight:900;color:#0369a1;">💵 نقداً من الخزينة</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX & TAFQEET ═══ -->
    <div style="padding:10px 22px 8px;">
      <div style="background:${$};border:2px solid ${C};border-radius:12px;padding:10px 18px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        
        <div>
          <div style="font-size:10.5px;color:${c};font-weight:800;margin-bottom:2px;">${k}</div>
          <div style="font-size:28px;font-weight:900;color:${c};font-family:'Courier New',Consolas,monospace;line-height:1;">${y(d)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid ${C};border-radius:10px;padding:8px 14px;max-width:440px;box-shadow:0 1px 4px rgba(0,0,0,0.02);">
          <div style="font-size:10px;color:${c};font-weight:800;margin-bottom:2px;">المبلغ كتابةً (تفقيط معتمد):</div>
          <div style="font-size:13.5px;color:#0f172a;font-weight:900;line-height:1.4;">فقط ${o} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ BENEFICIARY & DETAILS TABLE ═══ -->
    <div style="padding:0 22px 8px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">${n?"المستلم منه (الجهة المسلِّمة)":"المدفوع له (المستلم / الحساب المستفيد)"}</th>
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:150px;">نوع المعاملة</th>
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:170px;">الرصيد بعد الحركة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;font-size:13.5px;font-weight:900;color:#0f172a;">${b}</td>
            <td style="padding:8px 12px;border-right:1.5px solid #cbd5e1;">
              <span style="background:${n?"#ecfdf5":"#fef2f2"};color:${n?"#047857":"#dc2626"};padding:3px 10px;border-radius:16px;font-size:11px;font-weight:800;border:1px solid ${n?"#a7f3d0":"#fecaca"};">${L}</span>
            </td>
            <td style="padding:8px 12px;font-size:13px;font-weight:800;color:#334155;border-right:1.5px solid #cbd5e1;" class="mono" dir="ltr">${y(t.balanceAfter||0)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement & Purpose Box -->
      <div style="margin-top:6px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:7px 14px;">
        <div style="font-size:10px;color:#475569;font-weight:800;margin-bottom:2px;">البيان والسبب التفصيلي للمعاملة:</div>
        <div style="font-size:12.5px;color:#0f172a;font-weight:800;line-height:1.45;">${t.notes||"—"}</div>
      </div>
    </div>

    <!-- ═══ ACKNOWLEDGEMENT DECLARATION ═══ -->
    <div style="padding:0 22px 8px;">
      <div style="background:#fffbeb;border:1.5px dashed #d97706;border-radius:10px;padding:7px 14px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
        <div style="font-size:10.5px;font-weight:900;color:#b45309;margin-bottom:2px;">📜 إقرار واستلام نقدية:</div>
        <div style="font-size:11px;font-weight:700;color:#1e293b;line-height:1.45;">${j}</div>
      </div>
    </div>

    <!-- ═══ OFFICIAL SIGNATURES SECTION ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:8px 22px 10px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:12px;">
        
        <!-- Recipient Signature Box (المستلم - أولوية قصوى) -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:5px;text-align:center;">
            ✍️ توقيع المستلم (المقر بالاستلام)
          </div>
          <div style="font-size:10px;color:#334155;line-height:1.75;font-weight:700;">
            <div>الاسم: ................................................................</div>
            <div>رقم الهوية: ........................................................</div>
            <div>الجوال: ............................................................</div>
            <div>التوقيع: ...........................................................</div>
            <div>التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ 2026 م</div>
          </div>
        </div>

        <!-- Cashier Signature Box -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);text-align:center;">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:5px;">
            💼 أمين الصندوق (المسلِّم)
          </div>
          <div style="font-size:10px;color:#334155;line-height:1.75;font-weight:700;text-align:right;">
            <div>الاسم: <strong>${t.userName||"أمين الصندوق"}</strong></div>
            <div>الصفة: أمين الخزينة / المسؤول</div>
            <div>التوقيع: ...........................................</div>
            <div>التاريخ: <span class="mono">${l}</span></div>
          </div>
        </div>

        <!-- Management Approval & Official Stamp Box -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);text-align:center;">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:4px;">
            👑 اعتماد الإدارة والختم
          </div>
          <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:3px;">المدير المالي / المدير العام</div>
          <div style="border-top:1px dashed #94a3b8;width:100px;margin:5px auto 3px;font-size:9px;color:#64748b;">التوقيع والاعتماد</div>
          <div style="width:46px;height:46px;border:1.5px dashed #cbd5e1;border-radius:50%;margin:2px auto 0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9px;font-weight:800;">
            الختم الرسمي
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:6px 22px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:9px;color:#64748b;font-weight:700;">
        وثيقة مالية رسمية صادرة آلياً من نظام إدارة ${u} — لا يُعتد بهذا السند بدون توقيع المستلم والختم الرسمي.
      </div>
      <div dir="ltr" style="font-size:9.5px;color:#334155;font-family:monospace;font-weight:800;">
        REF: ${s}
      </div>
    </div>

  </div>

</body>
</html>`}window.printCashTxnVoucher=async t=>{if(!t)return;let e=(dt||[]).find(o=>o.id===t||o.refNumber===t);if(!e&&typeof V<"u"&&V){const o=V.find(s=>s.id===t||s.ref===t);o&&(e={id:o.id,amount:o.inflow||o.outflow,type:o.inflow>0?"in":"out",isTransfer:!!(o.badgeText?.includes("تحويل")||o.notes?.includes("تحويل")),refNumber:o.ref,date:o.date,notes:o.notes,balanceAfter:o.balanceAfter,userName:o.userName,cashBoxId:U?.id,cashBoxName:U?.name})}if(!e)try{const o=await X(M(N,`companies/${A}/cashTransactions`,t));if(o.exists())e={id:o.id,...o.data()};else{const s=await H(q(_(N,`companies/${A}/cashTransactions`),Z("refNumber","==",t),bt(1)));s.empty||(e={id:s.docs[0].id,...s.docs[0].data()})}}catch(o){console.warn("[printCashTxnVoucher] Firestore lookup error:",o)}if(!e)try{if((await X(M(N,`companies/${A}/expenses`,t))).exists()){if(typeof window.printSingleExpenseVoucher=="function")return window.printSingleExpenseVoucher(t);if(typeof window.previewExpense=="function")return window.previewExpense(t)}}catch{}if(!e){showToast("تعذر العثور على بيانات الحركة النقدية المطلوبة للطباعة","error");return}let n={};try{const[o,s]=await Promise.all([X(M(N,`companies/${A}/settings/company`)),X(M(N,`companies/${A}/settings/logo`))]);o.exists()&&(n=o.data()),s.exists()&&(n.logoUrl=s.data().dataUrl||s.data().logoUrl||"")}catch{}const a=Bt(e,n),d=window.open("","_blank","width=920,height=800");if(!d){showToast("يرجى السماح بالنوافذ المنبثقة (Popups) في المتصفح لطباعة السند","warning");return}d.document.write(a),d.document.close(),setTimeout(()=>{try{d.focus(),d.print()}catch{}},700)};export{Lt as render};
