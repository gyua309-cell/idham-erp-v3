import{d as K,a as Z,f as e,e as st,I as Pt}from"./index-CF9GFeRJ.js";import{getDocs as tt,collection as et,updateDoc as Jt,doc as Xt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let Ht="general",q=[],vt={},Tt={},ht={},wt={},$t={},xt={},yt={},Ft={},H=[],Kt={},Mt={},O=null,pt={};async function de(f){const a=new Date().toISOString().split("T")[0],h=a.slice(0,8)+"01";f.innerHTML=`
    <div class="rdj-wrap">
      <!-- ═══ الترويسة الرئيسية + التبويبات العلوية ═══ -->
      <div class="rdj-header-panel no-print">
        <div class="rdj-title-row">
          <div class="rdj-icon-badge">📊</div>
          <div>
            <h2 class="rdj-main-title">لوحة متابعة المبيعات ويومية المناديب</h2>
            <p class="rdj-sub-title">تحليل متقدم لمبيعات وتحصيلات اليوم والفترة، المبيعات قبل الضريبة، مؤشرات تحقيق المستهدفات (Target)، ويوميات حركة الصناديق</p>
          </div>
        </div>

        <!-- أزرار التبديل بين التبويبين -->
        <div class="rdj-tabs-bar">
          <button id="tab-btn-general" class="rdj-tab-btn active" onclick="window.switchRdjTab('general')">
            <span class="tab-icon">📊</span>
            <span class="tab-text">التقرير العام ومؤشرات الأداء</span>
          </button>
          <button id="tab-btn-daily" class="rdj-tab-btn" onclick="window.switchRdjTab('daily')">
            <span class="tab-icon">📋</span>
            <span class="tab-text">يومية المندوب وحركة الصندوق</span>
          </button>
        </div>
      </div>

      <!-- ═══ شريط الفلاتر المشترك ═══ -->
      <div class="rdj-filters no-print">
        <div class="rdj-fg">
          <label>المندوب</label>
          <select id="rdj-rep" class="rdj-sel">
            <option value="">🌟 جميع المناديب</option>
          </select>
        </div>
        <div class="rdj-fg">
          <label>من تاريخ</label>
          <input type="date" id="rdj-from" class="rdj-inp font-bold mono" value="${h}" />
        </div>
        <div class="rdj-fg">
          <label>إلى تاريخ</label>
          <input type="date" id="rdj-to" class="rdj-inp font-bold mono" value="${a}" />
        </div>

        
        <!-- أزرار الفترات السريعة -->
        <div class="rdj-presets">
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('today')">اليوم ⚡</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('week')">هذا الأسبوع 📅</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('mtd')">الشهر الحالي MTD 🗓️</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('lastMonth')">الشهر الماضي</button>
        </div>

        <!-- أزرار العمليات -->
        <div class="rdj-actions-group">
          <button id="rdj-run" class="rdj-btn-p">🔍 عرض التقرير</button>
          
          <!-- أزرار خاصة بالتقرير العام -->
          <button id="btn-gen-target" class="rdj-btn-gold gen-only" onclick="window.openRepTargetModal()">🎯 ضبط المستهدفات</button>
          <button id="btn-gen-whatsapp" class="rdj-btn-whatsapp gen-only" onclick="window.shareRepDailyJournalWhatsApp()">📲 إرسال للمدير المالي (واتساب)</button>
          <button id="btn-gen-excel" class="rdj-btn-green gen-only" onclick="window.exportGeneralReportExcel()">📥 تصدير Excel</button>
          <button id="btn-gen-pdf" class="rdj-btn-royal gen-only" onclick="window.printGeneralReportPDF()">👑 تصدير PDF ملكي</button>

          <!-- أزرار خاصة باليومية التفصيلية -->
          <button id="btn-daily-print" class="rdj-btn-s daily-only" style="display:none;" onclick="window.printRepDailyReport()">🖨️ طباعة اليومية (A4 مستقل)</button>
          <button id="btn-daily-excel" class="rdj-btn-green daily-only" style="display:none;" onclick="window.exportRepDailyExcel()">📥 تصدير اليومية Excel</button>
        </div>
      </div>

      <!-- ═══ منطقة المحتوى المتغيرة ═══ -->
      <div id="rdj-body">
        <div class="rdj-empty">جاري تحميل المناديب والبيانات...</div>
      </div>

      <!-- ═══ نافذة منبثقة لضبط التارجت الشهري ═══ -->
      <div id="rdj-target-modal" class="rdj-modal-overlay" style="display:none;">
        <div class="rdj-modal-box">
          <div class="rdj-modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🎯</span>
              <h3 style="margin:0; font-size:1.15rem; color:#0f172a; font-weight:800;">تحديد المستهدف الشهري للمناديب (Monthly Sales Target)</h3>
            </div>
            <button class="rdj-modal-close" onclick="window.closeRepTargetModal()">×</button>
          </div>
          <div class="rdj-modal-body" id="rdj-target-modal-body"></div>
          <div class="rdj-modal-footer">
            <button class="rdj-btn-secondary" onclick="window.closeRepTargetModal()">إلغاء</button>
            <button class="rdj-btn-p" id="rdj-save-targets-btn" onclick="window.saveRepTargets()">💾 حفظ المستهدفات وتحديث التقرير</button>
          </div>
      <!-- ═══ نافذة منبثقة لفحص وتدقيق أرباح وتكاليف الفواتير ═══ -->
      <div id="rdj-profit-audit-modal" class="rdj-modal-overlay" style="display:none;">
        <div class="rdj-modal-box" style="max-width:920px; width:95%;">
          <div class="rdj-modal-header" style="background:linear-gradient(135deg, #065f46, #047857); color:#fff; border-radius:14px 14px 0 0;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🔍</span>
              <h3 id="rdj-profit-modal-title" style="margin:0; font-size:1.15rem; color:#fff; font-weight:800;">كشف تدقيق أرباح وتكاليف فواتير المندوب</h3>
            </div>
            <button class="rdj-modal-close" style="color:#fff;" onclick="window.closeRepProfitAuditModal()">×</button>
          </div>
          <div class="rdj-modal-body" id="rdj-profit-modal-body" style="padding:16px 20px; max-height:75vh; overflow-y:auto;"></div>
          <div class="rdj-modal-footer" style="padding:12px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11.5px; color:#64748b; font-weight:700;">* التكلفة مأخوذة من واقع أسعار شراء الأصناف الفعلية المسجلة في فواتير المبيعات.</div>
            <button class="rdj-btn-secondary" onclick="window.closeRepProfitAuditModal()">إغلاق</button>
          </div>
        </div>
      </div>

    </div>

    <style>
      .rdj-wrap { padding:16px 20px; font-family:'Cairo','IBM Plex Sans Arabic','Segoe UI',sans-serif; direction:rtl; color:#1e293b; }
      
      /* Header & Tabs */
      .rdj-header-panel { background:var(--card-bg,#fff); border:1px solid #e2e8f0; border-radius:14px; padding:16px 20px; margin-bottom:16px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .rdj-title-row { display:flex; align-items:center; gap:14px; margin-bottom:14px; }
      .rdj-icon-badge { background:linear-gradient(135deg, #1e3a8a, #2563eb); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; box-shadow:0 4px 12px rgba(37,99,235,0.25); }
      .rdj-main-title { margin:0; font-size:1.35rem; font-weight:900; color:#0f172a; }
      .rdj-sub-title { margin:3px 0 0; color:#64748b; font-size:.82rem; font-weight:600; }

      .rdj-tabs-bar { display:flex; gap:8px; border-top:1px solid #f1f5f9; padding-top:12px; }
      .rdj-tab-btn { display:inline-flex; align-items:center; gap:8px; padding:9px 18px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#475569; font-size:.9rem; font-weight:800; cursor:pointer; transition:all 0.2s; }
      .rdj-tab-btn:hover { background:#f1f5f9; border-color:#94a3b8; }
      .rdj-tab-btn.active { background:linear-gradient(135deg, #1e3a8a, #2563eb); border-color:#1e3a8a; color:#fff; box-shadow:0 4px 12px rgba(37,99,235,0.25); }
      .rdj-tab-btn .tab-icon { font-size:1.05rem; }

      /* Filters */
      .rdj-filters { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end; background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:14px 18px; margin-bottom:18px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .rdj-fg { display:flex; flex-direction:column; gap:5px; min-width:140px; flex:1; }
      .rdj-fg label { font-size:.78rem; font-weight:800; color:#475569; }
      .rdj-sel, .rdj-inp { padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:.85rem; background:#f8fafc; color:#1e293b; outline:none; transition:border 0.2s; }
      .rdj-sel:focus, .rdj-inp:focus { border-color:#2563eb; background:#fff; }
      
      .rdj-presets { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:2px; }
      .preset-btn { padding:7px 10px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:.75rem; font-weight:800; color:#334155; cursor:pointer; transition:all 0.15s; }
      .preset-btn:hover { background:#e2e8f0; color:#1e3a8a; border-color:#94a3b8; }

      .rdj-actions-group { display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:flex-end; }
      .rdj-btn-p { padding:9px 18px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; border:none; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:800; box-shadow:0 2px 8px rgba(37,99,235,0.3); transition:transform 0.1s; }
      .rdj-btn-p:active { transform:scale(0.98); }
      .rdj-btn-gold { padding:9px 14px; background:linear-gradient(135deg, #d97706, #b45309); color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(217,119,6,0.3); }
      .rdj-btn-green { padding:9px 14px; background:#10b981; color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(16,185,129,0.3); }
      .rdj-btn-whatsapp { padding:9px 15px; background:linear-gradient(135deg, #16a34a, #15803d); color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(22,163,74,0.35); display:inline-flex; align-items:center; gap:6px; transition:transform 0.1s; }
      .rdj-btn-whatsapp:active { transform:scale(0.97); }
      .rdj-btn-royal { padding:9px 16px; background:linear-gradient(135deg, #0f172a, #1e3a8a); color:#fef08a; border:1.5px solid #d97706; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:900; box-shadow:0 3px 10px rgba(15,23,42,0.35); }
      .rdj-btn-s { padding:9px 16px; background:#f1f5f9; color:#1e3a8a; border:1.5px solid #2563eb; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:800; }
      .rdj-btn-secondary { padding:8px 16px; background:#e2e8f0; color:#334155; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; }

      .rdj-empty { text-align:center; padding:60px; color:#94a3b8; font-size:1.05rem; font-weight:700; background:#fff; border-radius:12px; border:1px dashed #cbd5e1; }
      .rdj-loading { text-align:center; padding:50px; color:#2563eb; font-weight:800; font-size:1.1rem; }

      /* Executive General Report Styles */
      .gen-kpis-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:18px; }
      .gen-kpi-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px 16px; position:relative; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.02); }
      .gen-kpi-card::before { content:''; position:absolute; top:0; right:0; left:0; height:3.5px; }
      .gen-kpi-card.blue::before   { background:#2563eb; }
      .gen-kpi-card.green::before  { background:#10b981; }
      .gen-kpi-card.amber::before  { background:#f59e0b; }
      .gen-kpi-card.purple::before { background:#8b5cf6; }
      .gen-kpi-card.emerald::before{ background:#059669; }
      .gen-kpi-card.cyan::before   { background:#0891b2; }

      .gen-kpi-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
      .gen-kpi-title { font-size:.76rem; font-weight:800; color:#64748b; }
      .gen-kpi-icon { font-size:1.15rem; }
      .gen-kpi-val { font-size:1.3rem; font-weight:900; color:#0f172a; font-family:monospace; line-height:1.2; }
      .gen-kpi-sub { font-size:.72rem; font-weight:700; color:#94a3b8; margin-top:4px; }
      .gen-kpi-before-vat { font-size:.78rem; font-weight:800; margin-top:3px; }

      /* Charts Section */
      .gen-charts-grid { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:18px; }
      @media (max-width:900px) { .gen-charts-grid { grid-template-columns:1fr; } }
      .chart-card { background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:14px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px; }
      .chart-title { font-size:.88rem; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px; }
      .chart-canvas-wrap { position:relative; height:260px; width:100%; }

      /* Matrix Table */
      .matrix-tw { border-radius:14px; border:1px solid #cbd5e1; overflow-x:auto; background:#fff; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      table.matrix-t { width:100%; border-collapse:collapse; font-size:.84rem; white-space:nowrap; }
      table.matrix-t thead { background:linear-gradient(135deg, #0f172a, #1e3a8a); color:#fff; }
      table.matrix-t th { padding:10px 10px; font-weight:800; font-size:.78rem; border-bottom:2px solid #0f172a; text-align:center; color:#f8fafc; }
      table.matrix-t th.r-align { text-align:right; }
      table.matrix-t tbody tr { border-bottom:1px solid #e2e8f0; transition:background 0.15s; }
      table.matrix-t tbody tr:hover { background:rgba(37,99,235,0.03); }
      table.matrix-t td { padding:9px 10px; text-align:center; color:#334155; vertical-align:middle; }
      table.matrix-t td.r-align { text-align:right; font-weight:800; color:#1e3a8a; }
      table.matrix-t tfoot tr { background:#f8fafc; border-top:2.5px solid #0f172a; font-weight:900; }
      table.matrix-t tfoot td { padding:11px 10px; vertical-align:middle; }

      /* Sales Cell Sub-Values */
      .cell-main-val { font-size:.92rem; font-family:monospace; font-weight:900; line-height:1.2; }
      .cell-sub-vat { font-size:10.5px; font-family:monospace; font-weight:800; margin-top:2px; display:block; }
      .sub-vat-blue   { color:#0284c7; }
      .sub-vat-green  { color:#0891b2; }
      .sub-vat-purple { color:#7c3aed; }

      /* Progress Mini Bars */
      .target-prog-wrap { width:85px; display:inline-block; vertical-align:middle; margin-left:6px; }
      .target-prog-track { height:7px; background:#e2e8f0; border-radius:4px; overflow:hidden; }
      .target-prog-fill { height:100%; border-radius:4px; transition:width 0.4s; }

      /* Daily Detail styles */
      .rdj-tw { border-radius:14px; border:1px solid #cbd5e1; overflow:hidden; background:#fff; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      table.rdj-t { width:100%; border-collapse:collapse; font-size:.88rem; }
      .rdj-t thead { background:#0f172a; color:#fff; }
      .rdj-t th { padding:11px 12px; text-align:center; font-weight:800; font-size:.82rem; color:#fff; border-bottom:2px solid #0f172a; white-space:nowrap; }
      .rdj-t tbody tr.mr { border-bottom:1px solid #e2e8f0; cursor:pointer; transition:background 0.15s; }
      .rdj-t tbody tr.mr:hover { background:rgba(37,99,235,.04); }
      .rdj-t tbody tr.mr.open { background:rgba(37,99,235,.07); border-bottom:none; }
      .rdj-t td { padding:10px 12px; text-align:center; color:#334155; }
      td.td-date { font-weight:700; color:#1e293b; white-space:nowrap; }
      td.td-rep  { font-weight:900; color:#1e3a8a; text-align:right; font-size:.95rem; }
      td.td-sales { color:#059669; font-weight:800; }
      td.td-cash  { color:#d97706; font-weight:800; }
      td.td-bank  { color:#2563eb; font-weight:800; }
      td.td-exp   { color:#dc2626; font-weight:800; }
      td.td-box   { color:#047857; font-weight:900; font-size:.95rem; }
      .rdj-t tfoot tr { background:#f8fafc; border-top:2.5px solid #0f172a; }
      .rdj-t tfoot td { padding:12px; font-weight:900; font-size:.95rem; }

      .xbtn { background:#f1f5f9; border:1px solid #cbd5e1; cursor:pointer; font-size:.85rem; padding:3px 8px; border-radius:6px; color:#1e3a8a; font-weight:900; }
      .xbtn:hover { background:#e2e8f0; }

      tr.dr td { padding:0; border-bottom:2px solid #0284c7; }
      .di { display:none; padding:16px 20px; background:#f8fafc; }
      .di.open { display:block; }
      .rep-section-badge { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%); color:#fff; padding:10px 16px; border-radius:10px; margin-bottom:14px; }
      .sub-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.03); margin-bottom:12px; }
      .dh { font-size:.85rem; font-weight:900; padding:6px 12px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; }
      .dh.s { background:rgba(16,185,129,.12); color:#065f46; border:1px solid rgba(16,185,129,.3); }
      .dh.c { background:rgba(37,99,235,.12);  color:#1e3a8a; border:1px solid rgba(37,99,235,.3); }
      .dh.e { background:rgba(239,68,68,.12);   color:#991b1b; border:1px solid rgba(239,68,68,.3); }
      table.dt { width:100%; border-collapse:collapse; font-size:.82rem; }
      .dt th { background:#f1f5f9; padding:6px 10px; border-bottom:1.5px solid #cbd5e1; font-weight:800; color:#334155; text-align:center; white-space:nowrap; }
      .dt td { padding:6px 10px; border-bottom:1px solid #f1f5f9; text-align:center; color:#1e293b; }
      .dt td.lft { text-align:right; font-weight:700; }
      .dt tfoot td { font-weight:900; background:#f8fafc; border-top:1.5px solid #cbd5e1; }
      .dmt { text-align:center; padding:14px; color:#94a3b8; font-size:.8rem; font-weight:600; }
      .rep-box-calc-bar { background:#fff; border:1.5px solid #059669; border-radius:10px; padding:10px 16px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:.9rem; }

      .b { display:inline-block; padding:2px 8px; border-radius:6px; font-size:.72rem; font-weight:800; white-space:nowrap; }
      .b-cash { background:rgba(245,158,11,.15); color:#b45309; border:1px solid rgba(245,158,11,.3); }
      .b-bank { background:rgba(37,99,235,.15);  color:#1d4ed8; border:1px solid rgba(37,99,235,.3); }
      .b-cr   { background:rgba(239,68,68,.15);   color:#b91c1c; border:1px solid rgba(239,68,68,.3); }
      .b-adv  { background:rgba(124,58,237,.15);  color:#6d28d9; border:1px solid rgba(124,58,237,.3); }
      .b-exp  { background:rgba(220,38,38,.15);   color:#991b1b; border:1px solid rgba(220,38,38,.3); }
      .b-tr   { background:rgba(14,165,233,.15);  color:#0369a1; border:1px solid rgba(14,165,233,.3); }
      .b-cst  { background:rgba(99,102,241,.15);  color:#4338ca; border:1px solid rgba(99,102,241,.3); }
      .b-ok   { background:rgba(16,185,129,.15);  color:#047857; border:1px solid rgba(16,185,129,.3); }
      .b-warn { background:rgba(239,68,68,.15);   color:#b91c1c; border:1px solid rgba(239,68,68,.3); }
      .dh.cst { background:linear-gradient(135deg, #1e1b4b, #312e81); color:#fff; }
      .dh.adv { background:linear-gradient(135deg, #3b0764, #581c87); color:#fff; }
      .dh.clr { background:linear-gradient(135deg, #064e3b, #047857); color:#fff; }

      /* Modal */
      .rdj-modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); }
      .rdj-modal-box { background:#fff; border-radius:14px; width:95%; max-width:580px; box-shadow:0 20px 40px rgba(0,0,0,0.25); overflow:hidden; animation:modalPop 0.2s ease-out; }
      @keyframes modalPop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
      .rdj-modal-header { padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
      .rdj-modal-close { background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; }
      .rdj-modal-body { padding:16px 20px; max-height:65vh; overflow-y:auto; }
      .rdj-modal-footer { padding:12px 20px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; }
      .rep-target-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; gap:12px; }
      .rep-target-row:last-child { border-bottom:none; }
      .rep-target-info { font-weight:800; font-size:.9rem; color:#1e293b; }
      .rep-target-input { width:160px; padding:7px 10px; border:1.5px solid #cbd5e1; border-radius:8px; font-family:monospace; font-weight:bold; font-size:.92rem; text-align:left; direction:ltr; }

      /* ── Mobile Optimizations for Rep Daily Journal ── */
      @media (max-width: 768px) {
        .rdj-title-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 10px !important;
        }
        .rdj-tabs-bar {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding-bottom: 6px !important;
          width: 100% !important;
        }
        .rdj-tab-btn {
          padding: 8px 14px !important;
          font-size: 0.82rem !important;
          white-space: nowrap !important;
        }
        .rdj-filters {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          padding: 12px 14px !important;
        }
        .rdj-fg {
          min-width: 100% !important;
          width: 100% !important;
        }
        .rdj-fg input, .rdj-fg select {
          min-height: 44px !important;
          font-size: 16px !important;
        }
        .rdj-presets {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
          width: 100% !important;
        }
        .preset-btn {
          width: 100% !important;
          padding: 8px 6px !important;
          font-size: 0.78rem !important;
          text-align: center !important;
        }
        .rdj-actions-group {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        .rdj-actions-group #rdj-run {
          width: 100% !important;
          padding: 12px !important;
          font-size: 1rem !important;
          justify-content: center !important;
        }
        .rdj-actions-group #btn-gen-whatsapp {
          width: 100% !important;
          padding: 12px !important;
          font-size: 0.95rem !important;
          justify-content: center !important;
        }
        .rdj-actions-group button:not(#rdj-run):not(#btn-gen-whatsapp) {
          width: 100% !important;
          padding: 9px 12px !important;
          font-size: 0.85rem !important;
          justify-content: center !important;
        }
        .gen-kpis-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }
        .gen-kpi-card {
          padding: 10px 12px !important;
        }
        .gen-kpi-val {
          font-size: 1.15rem !important;
          white-space: nowrap !important;
        }
        .gen-charts-grid {
          grid-template-columns: 1fr !important;
        }
        /* Sticky Rep Name on Mobile Matrix & Daily Details */
        table.matrix-t th:first-child, table.matrix-t td:first-child,
        table.rdj-t th:first-child, table.rdj-t td:first-child {
          position: sticky !important;
          right: 0 !important;
          z-index: 5 !important;
          background: #ffffff !important;
          box-shadow: -2px 0 6px rgba(0,0,0,0.08) !important;
        }
        table.matrix-t thead th:first-child, table.rdj-t thead th:first-child {
          background: #0f172a !important;
          z-index: 10 !important;
        }
        table.matrix-t tfoot td:first-child, table.rdj-t tfoot td:first-child {
          background: #f8fafc !important;
          z-index: 10 !important;
        }
        /* Mobile Modals */
        .rdj-modal-box {
          width: 96vw !important;
          max-width: 96vw !important;
          max-height: 90vh !important;
          border-radius: 16px !important;
        }
        .rdj-modal-body {
          max-height: calc(90vh - 120px) !important;
          padding: 12px 14px !important;
        }
        .rep-target-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 6px !important;
        }
        .rep-target-input {
          width: 100% !important;
          min-height: 44px !important;
          font-size: 16px !important;
        }
      }

      @media (max-width: 380px) {
        .gen-kpis-grid {
          grid-template-columns: 1fr !important;
        }
      }
    </style>
  `;const[b,R,z,m]=await Promise.all([tt(et(K,`companies/${Z}/salesReps`)),tt(et(K,`companies/${Z}/cashBoxes`)),tt(et(K,`companies/${Z}/costCenters`)).catch(()=>({docs:[]})),tt(et(K,`companies/${Z}/chartOfAccounts`)).catch(()=>({docs:[]}))]);q=b.docs.map(r=>({id:r.id,...r.data()})).sort((r,w)=>(r.name||"").localeCompare(w.name||"","ar")),vt={},Tt={},ht={},$t={},xt={},yt={},Ft={};const S=R.docs.map(r=>({id:r.id,...r.data()})),D=m.docs.map(r=>({id:r.id,...r.data()}));S.forEach(r=>{let w=r.repId||r.linkedRepId||null;const _=r.name||"";if(!w){const C=q.find(j=>[j.name.trim(),...j.name.split(/\s+/).filter($=>$.length>=3)].some($=>_.includes($)));C&&(w=C.id)}w&&(vt[r.id]=w,$t[w]=_,r.accountId&&(Tt[r.accountId]=w),r.code&&(ht[r.code]=w),r.accountCode&&(ht[r.accountCode]=w))}),wt={},z.docs.forEach(r=>{const w=r.data(),_=w.repId||w.linkedRepId||null;_&&(wt[r.id]=_)}),q.forEach(r=>{const w=[r.name.trim()];r.name.split(/\s+/).forEach(c=>{c.length>=3&&w.push(c)}),r.name.includes("عوض")&&w.push("عوض","محمد عوض"),r.name.includes("مصطفى")&&w.push("مصطفى"),r.name.includes("السيد رضا")&&w.push("السيد رضا","رضا"),r.name.includes("احمد السيد")&&w.push("احمد السيد","أحمد السيد"),r.name.includes("عمرو")&&w.push("عمرو","راجح","عمرو راجح");const _=[...new Set(w)],C=S.find(c=>c.repId===r.id||c.linkedRepId===r.id||_.some(d=>c.name?.includes(d))),j=C?C.id:null,E=C?C.accountCode||C.code:null,$=C?C.accountId:null,Q=C?C.name:r.name+" - صندوق",W=new Set,n=new Set,u=new Set,i=new Set;D.forEach(c=>{const d=c.code||"",B=c.name||"";_.some(p=>B.includes(p))&&((d.startsWith("1-1-2-3")||B.includes("عهدة"))&&(W.add(d),n.add(c.id),xt[d]=r.id,xt[c.id]=r.id),(d.startsWith("1-1-5-4")||B.includes("سلف"))&&(u.add(d),i.add(c.id),yt[d]=r.id,yt[c.id]=r.id))}),Ft[r.id]={repId:r.id,name:r.name,tokens:_,boxId:j,boxAccCode:E,boxAccId:$,boxName:Q,custodyAccCodes:W,custodyAccIds:n,loanAccCodes:u,loanAccIds:i,costCenterId:r.costCenterId||(r.name.includes("مصطفى")?"cc_301":r.name.includes("عوض")?"cc_302":null)}});const G=f.querySelector("#rdj-rep");q.forEach(r=>{const w=document.createElement("option"),_=r.status==="inactive"||r.isActive===!1;w.value=r.id,w.textContent=`${_?"⚪ ":"👤 "}${r.name||r.id}${_?" (غير نشط)":""}`,G.appendChild(w)}),window.switchRdjTab=r=>{Ht=r;const w=document.getElementById("tab-btn-general"),_=document.getElementById("tab-btn-daily"),C=f.querySelectorAll(".gen-only"),j=f.querySelectorAll(".daily-only");r==="general"?(w?.classList.add("active"),_?.classList.remove("active"),C.forEach(E=>E.style.display="inline-flex"),j.forEach(E=>E.style.display="none")):(_?.classList.add("active"),w?.classList.remove("active"),C.forEach(E=>E.style.display="none"),j.forEach(E=>E.style.display="inline-flex")),ft(f)},window.setRdjPeriod=r=>{const w=new Date().toISOString().split("T")[0],_=f.querySelector("#rdj-from"),C=f.querySelector("#rdj-to");if(!_||!C)return;C.value=w;const j=new Date;if(r==="today")_.value=w;else if(r==="week"){const E=j.getDay(),$=j.getDate()-E+(E===6?0:-7),Q=new Date(j.setDate($)).toISOString().split("T")[0];_.value=Q}else if(r==="mtd")_.value=w.slice(0,8)+"01";else if(r==="lastMonth"){const E=new Date(j.getFullYear(),j.getMonth(),1),$=new Date(E-1),Q=new Date($.getFullYear(),$.getMonth(),1);_.value=Q.toISOString().split("T")[0],C.value=$.toISOString().split("T")[0]}ft(f)},f.querySelector("#rdj-run").addEventListener("click",()=>ft(f)),f.querySelector("#rdj-rep")?.addEventListener("change",()=>ft(f)),ft(f)}const gt=f=>{const a=(f||"").toLowerCase().trim();return a==="bank"||a==="transfer"||a==="تحويل"||a==="network"||a==="شبكة"||a==="شبكه"||a==="مدى"||a==="mada"||a==="card"||a==="pos"||a==="شيك"||a==="cheque"},Bt=f=>{const a=(f||"").toLowerCase().trim();return a==="cash"||a==="نقدي"||a==="نقدى"?'<span class="b b-cash">💵 نقدي</span>':a==="bank"||a==="transfer"||a==="تحويل"?'<span class="b b-bank">🏦 تحويل</span>':a==="network"||a==="شبكة"||a==="شبكه"||a==="مدى"||a==="mada"||a==="pos"||a==="card"?'<span class="b b-bank">💳 شبكة</span>':a==="credit"||a==="آجل"||a==="اجل"||a==="deferred"?'<span class="b b-cr">📑 آجل</span>':a==="cheque"||a==="شيك"?'<span class="b b-bank">📄 شيك</span>':`<span class="b b-cash">${f||"—"}</span>`};async function ft(f){Ht==="general"?await Zt(f):await te(f)}async function Zt(f){const a=f.querySelector("#rdj-rep").value,h=f.querySelector("#rdj-from").value,b=f.querySelector("#rdj-to").value;if(!h||!b){alert("يرجى تحديد الفترة من وإلى");return}const R=f.querySelector("#rdj-body");R.innerHTML='<div class="rdj-loading">⏳ جاري تدقيق فواتير المبيعات، احتساب تكلفة البضاعة المباعة (COGS)، وهوامش أرباح المناديب، والتحصيلات...</div>';try{const z=new Date().toISOString().split("T")[0],m=(b||z).slice(0,8)+"01",S=h===b?b:z>=h&&z<=b?z:b,[D,G,r,w,_]=await Promise.all([tt(et(K,`companies/${Z}/salesInvoices`)),tt(et(K,`companies/${Z}/salesReturns`)).catch(()=>({docs:[]})),tt(et(K,`companies/${Z}/receipts`)),tt(et(K,`companies/${Z}/customers`)),tt(et(K,`companies/${Z}/products`)).catch(()=>({docs:[]}))]),C={};(_.docs||[]).forEach(o=>{const p=o.data();C[o.id]=p,p.name&&(C[p.name]=p)});const j=o=>{const p=o.lines||o.items||[];if(p.length===0)return parseFloat(o.totalCost||0);let L=0;return p.forEach(v=>{const N=parseFloat(v.qty||v.quantity||1),t=C[v.productId]||C[v.productName]||C[v.name],s=parseFloat(v.costPrice!==void 0&&v.costPrice>0?v.costPrice:v.purchasePrice!==void 0&&v.purchasePrice>0?v.purchasePrice:v.unitCost!==void 0&&v.unitCost>0?v.unitCost:t?.costPrice||t?.purchasePrice||t?.avgCostPrice||t?.lastPurchasePrice||0);L+=N*s}),L},E=Object.fromEntries(w.docs.map(o=>[o.id,o.data().repId||null])),$=Object.fromEntries(w.docs.map(o=>[o.id,o.data().name||o.data().customerName||o.id])),Q=Object.fromEntries(q.map(o=>[o.id,o.name||o.id])),W=D.docs.map(o=>({id:o.id,...o.data()})).filter(o=>o.status!=="cancelled"),n=G.docs.map(o=>{const p=o.data(),L=p.repId||p.salesRepId||E[p.customerId]||null;return{id:o.id,...p,_repId:L}}).filter(o=>o.status!=="cancelled"),u=r.docs.map(o=>{const p=o.data(),L=p.repId||vt[p.sourceId]||wt[p.costCenterId]||E[p.targetId]||null;return{id:o.id,...p,_repId:L}}).filter(o=>o.entityType==="customer");let i=a?q.filter(o=>o.id===a):q;i=i.filter(o=>{if((o.id==="61pG3jXw8Ps7HCJc9ljI"||o.name&&o.name.includes("احمد السيد"))&&(h>="2026-10-10"||b>="2026-10-10")||o.resignedDate&&h>=o.resignedDate)return!1;if(o.status==="inactive"||o.isActive===!1){const L=W.some(N=>N.repId===o.id&&N.date>=h&&N.date<=b),v=u.some(N=>N._repId===o.id&&N.date>=h&&N.date<=b);if(!L&&!v)return!1}return!0});const c=i.map(o=>{const p=o.id,L=W.filter(l=>l.repId===p&&l.date===S);let v=0,N=0;L.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);v+=M,N+=P});const t=n.filter(l=>l._repId===p&&l.date===S);let s=0,y=0;t.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);s+=M,y+=P});const k=v-s,nt=N-y,rt=u.filter(l=>l._repId===p&&l.date===S);let V=0,it=0;rt.forEach(l=>{const M=parseFloat(l.amount||0);gt(l.method||l.paymentMethod)?it+=M:V+=M});const dt=V+it,T=W.filter(l=>l.repId===p&&l.date>=h&&l.date<=b);let ot=0,Y=0;T.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);ot+=M,Y+=P});const J=n.filter(l=>l._repId===p&&l.date>=h&&l.date<=b);let at=0,X=0;J.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);at+=M,X+=P});const U=ot-at,g=Y-X,x=T.length,I=J.length,F=x>0?ot/x:0,A=W.filter(l=>l.repId===p&&l.date>=m&&l.date<=b);let lt=0,ct=0;A.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);lt+=M,ct+=P});const kt=n.filter(l=>l._repId===p&&l.date>=m&&l.date<=b);let bt=0,Ct=0;kt.forEach(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal||l.subTotal||M/1.15||0);bt+=M,Ct+=P});const Dt=lt-bt,Ot=ct-Ct,St=parseFloat(o.monthlyTarget||0),Gt=St>0?Dt/St*100:0,Wt=u.filter(l=>l._repId===p&&l.date>=h&&l.date<=b);let zt=0,_t=0;Wt.forEach(l=>{const M=parseFloat(l.amount||0);gt(l.method||l.paymentMethod)?_t+=M:zt+=M});const jt=zt+_t,Lt=U>0?jt/U*100:jt>0?100:0,qt=T.map(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal!==void 0?l.subtotal:M/1.15||0),mt=j(l),ut=P-mt,It=P>0?ut/P*100:0;return{type:"invoice",id:l.id,number:l.invoiceNumber||l.number||l.id,date:l.date,customerName:l.customerName||$[l.customerId]||"عميل",gross:M,sub:P,cost:mt,profit:ut,marginPct:It}}),Ut=J.map(l=>{const M=parseFloat(l.totalWithVat||l.total||0),P=parseFloat(l.subtotal!==void 0?l.subtotal:M/1.15||0),mt=j(l),ut=P-mt,It=P>0?ut/P*100:0;return{type:"return",id:l.id,number:l.returnNumber||l.number||l.id,date:l.date,customerName:l.customerName||$[l.customerId]||"عميل",gross:-M,sub:-P,cost:-mt,profit:-ut,marginPct:It}}),Vt=[...qt,...Ut];let Rt=0;T.forEach(l=>{Rt+=j(l)});let Et=0;J.forEach(l=>{Et+=j(l)});const At=Rt-Et,Nt=g-At,Yt=g>0?Nt/g*100:0;return{id:p,name:o.name||"مندوب",code:o.code||p.slice(-4),todayGrossSales:v,todayGrossSubtotal:N,todayReturnSales:s,todayReturnSubtotal:y,todaySales:k,todaySubtotal:nt,todayCashCol:V,todayBankCol:it,todayCol:dt,periodGrossSales:ot,periodGrossSubtotal:Y,periodReturnSales:at,periodReturnSubtotal:X,periodSales:U,periodSubtotal:g,invoiceCount:x,returnCount:I,avgInvoice:F,periodGrossCogs:Rt,periodReturnCogs:Et,periodNetCogs:At,periodProfit:Nt,periodMarginPct:Yt,invoicesDetails:Vt,mtdGrossSales:lt,mtdGrossSubtotal:ct,mtdReturnSales:bt,mtdReturnSubtotal:Ct,mtdSales:Dt,mtdSubtotal:Ot,monthlyTarget:St,targetPct:Gt,cashCol:zt,bankCol:_t,totalCol:jt,collectionRate:Lt}});c.sort((o,p)=>p.periodSales-o.periodSales);const d=c.reduce((o,p)=>(o.todayGrossSales+=p.todayGrossSales,o.todayGrossSubtotal+=p.todayGrossSubtotal,o.todayReturnSales+=p.todayReturnSales,o.todayReturnSubtotal+=p.todayReturnSubtotal,o.todaySales+=p.todaySales,o.todaySubtotal+=p.todaySubtotal,o.todayCashCol+=p.todayCashCol,o.todayBankCol+=p.todayBankCol,o.todayCol+=p.todayCol,o.periodGrossSales+=p.periodGrossSales,o.periodGrossSubtotal+=p.periodGrossSubtotal,o.periodReturnSales+=p.periodReturnSales,o.periodReturnSubtotal+=p.periodReturnSubtotal,o.periodSales+=p.periodSales,o.periodSubtotal+=p.periodSubtotal,o.invoiceCount+=p.invoiceCount,o.returnCount+=p.returnCount,o.periodGrossCogs+=p.periodGrossCogs,o.periodReturnCogs+=p.periodReturnCogs,o.periodNetCogs+=p.periodNetCogs,o.periodProfit+=p.periodProfit,o.mtdGrossSales+=p.mtdGrossSales,o.mtdGrossSubtotal+=p.mtdGrossSubtotal,o.mtdReturnSales+=p.mtdReturnSales,o.mtdReturnSubtotal+=p.mtdReturnSubtotal,o.mtdSales+=p.mtdSales,o.mtdSubtotal+=p.mtdSubtotal,o.monthlyTarget+=p.monthlyTarget,o.cashCol+=p.cashCol,o.bankCol+=p.bankCol,o.totalCol+=p.totalCol,o),{todayGrossSales:0,todayGrossSubtotal:0,todayReturnSales:0,todayReturnSubtotal:0,todaySales:0,todaySubtotal:0,todayCashCol:0,todayBankCol:0,todayCol:0,periodGrossSales:0,periodGrossSubtotal:0,periodReturnSales:0,periodReturnSubtotal:0,periodSales:0,periodSubtotal:0,invoiceCount:0,returnCount:0,periodGrossCogs:0,periodReturnCogs:0,periodNetCogs:0,periodProfit:0,mtdGrossSales:0,mtdGrossSubtotal:0,mtdReturnSales:0,mtdReturnSubtotal:0,mtdSales:0,mtdSubtotal:0,monthlyTarget:0,cashCol:0,bankCol:0,totalCol:0});d.avgInvoice=d.invoiceCount>0?d.periodGrossSales/d.invoiceCount:0,d.targetPct=d.monthlyTarget>0?d.mtdSales/d.monthlyTarget*100:0,d.collectionRate=d.periodSales>0?d.totalCol/d.periodSales*100:d.totalCol>0?100:0,d.periodMarginPct=d.periodSubtotal>0?d.periodProfit/d.periodSubtotal*100:0,O={from:h,to:b,mtdStart:m,todayStr:z,reps:c,grand:d,repLabel:a?Q[a]||a:"جميع المناديب"};let B="";c.forEach((o,p)=>{const L=p===0&&o.periodSales>0,v=o.targetPct>=100?"#10b981":o.targetPct>=80?"#2563eb":o.targetPct>=50?"#f59e0b":"#ef4444",N=o.collectionRate>=90?"#10b981":o.collectionRate>=70?"#2563eb":"#f59e0b";B+=`
        <tr>
          <td style="font-weight:bold; color:#64748b;">${p+1}</td>
          <td class="r-align">
            ${L?"🏆 ":"👤 "}<strong>${o.name}</strong>
            ${L?'<span style="font-size:10px; background:#fef08a; color:#854d0e; padding:1px 6px; border-radius:4px; margin-right:4px;">المتصدر</span>':""}
          </td>
          
          <!-- مبيعات اليوم شامل وقبل الضريبة -->
          <td style="background:rgba(2,132,199,0.03);">
            <div class="cell-main-val" style="color:#0284c7;">${e(o.todaySales)}</div>
            <span class="cell-sub-vat sub-vat-blue">قبل: ${e(o.todaySubtotal)}</span>
            ${o.todayReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${e(o.todayReturnSales)})</span>`:""}
          </td>

          <!-- تحصيل اليوم بجانب مبيعات اليوم مباشرة -->
          <td style="background:rgba(245,158,11,0.04);">
            <div class="cell-main-val" style="color:#d97706;">${e(o.todayCol)}</div>
            ${o.todayCol>0?`<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${e(o.todayCashCol)} • شبكة: ${e(o.todayBankCol)}</span>`:'<span style="font-size:10px; color:#94a3b8;">—</span>'}
          </td>

          <!-- صافي مبيعات الفترة شامل وقبل الضريبة -->
          <td style="background:rgba(5,150,105,0.03);">
            <div class="cell-main-val" style="color:#059669; font-size:.98rem;">${e(o.periodSales)}</div>
            <span class="cell-sub-vat sub-vat-green">قبل: ${e(o.periodSubtotal)}</span>
            ${o.periodReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block; margin-top:2px;">(مردود: -${e(o.periodReturnSales)})</span>`:""}
          </td>

          <td class="mono font-bold">${o.invoiceCount}${o.returnCount>0?` <span style="font-size:10px; color:#dc2626;" title="${o.returnCount} إشعار دائن/مردود">(-${o.returnCount})</span>`:""}</td>
          <td class="mono" style="color:#64748b;">${e(o.avgInvoice)}</td>
          <td class="mono font-bold" style="color:#d97706;">${e(o.cashCol)}</td>
          <td class="mono font-bold" style="color:#2563eb;">${e(o.bankCol)}</td>
          <td class="mono font-bold" style="color:#1e3a8a; font-size:.94rem;">${e(o.totalCol)}</td>

          <!-- مجمل الربح وهامش الربح للفترة مع بيان التكلفة وزر التدقيق -->
          <td style="background:rgba(16,185,129,0.06); cursor:pointer;" 
              onclick="window.showRepProfitAuditModal('${o.id}')"
              title="المعادلة: المبيعات قبل الضريبة (${e(o.periodSubtotal)}) - التكلفة (${e(o.periodNetCogs)}) = مجمل الربح (${e(o.periodProfit)})&#10;انقر هنا لفحص وتدقيق الفواتير بالتفصيل">
            <div class="cell-main-val" style="color:#047857; font-size:.98rem; font-weight:900;">${e(o.periodProfit)}</div>
            <div style="font-size:10px; color:#475569; font-family:monospace; font-weight:700; margin:1px 0;">تكلفة: ${e(o.periodNetCogs)}</div>
            <div style="font-size:10.5px; color:${o.periodProfit>=0?"#059669":"#dc2626"}; font-weight:800;">
              (${o.periodMarginPct.toFixed(1)}%) <span style="font-size:9.5px; color:#2563eb; text-decoration:underline;">🔍 فحص</span>
            </div>
          </td>

          <!-- مبيعات الشهر MTD شامل وقبل الضريبة -->
          <td style="background:rgba(79,70,229,0.03);">
            <div class="cell-main-val" style="color:#4338ca;">${e(o.mtdSales)}</div>
            <span class="cell-sub-vat sub-vat-purple">قبل: ${e(o.mtdSubtotal)}</span>
            ${o.mtdReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${e(o.mtdReturnSales)})</span>`:""}
          </td>

          <td class="mono">${o.monthlyTarget>0?e(o.monthlyTarget):'<span style="color:#94a3b8">غير محدد</span>'}</td>
          <td>
            <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <div class="target-prog-wrap">
                <div class="target-prog-track">
                  <div class="target-prog-fill" style="width:${Math.min(o.targetPct,100)}%; background:${v};"></div>
                </div>
              </div>
              <span class="mono font-bold" style="color:${v}; font-size:.82rem;">${o.targetPct.toFixed(1)}%</span>
            </div>
          </td>
          <td>
            <span class="mono font-bold" style="color:${N};">${o.collectionRate.toFixed(1)}%</span>
          </td>
        </tr>
      `}),R.innerHTML=`
      <!-- ═══ 1. بطاقات المؤشرات التنفيذية للشركة ═══ -->
      <div class="gen-kpis-grid">
        <!-- كرت مبيعات اليوم مع قبل الضريبة -->
        <div class="gen-kpi-card cyan">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">${h===b?`صافي مبيعات يوم (${st(b)})`:"صافي مبيعات اليوم"}</span>
            <span class="gen-kpi-icon">⚡</span>
          </div>
          <div class="gen-kpi-val" style="color:#0891b2;">${e(d.todaySales)}</div>
          <div class="gen-kpi-before-vat" style="color:#0284c7;">قبل الضريبة: ${e(d.todaySubtotal)}</div>
          <div class="gen-kpi-sub">تاريخ: ${S}${d.todayReturnSales>0?` • مردود: -${e(d.todayReturnSales)}`:""}</div>
        </div>

        <!-- كرت تحصيل اليوم -->
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">${h===b?`تحصيل يوم (${st(b)})`:"تحصيل اليوم"}</span>
            <span class="gen-kpi-icon">💵</span>
          </div>
          <div class="gen-kpi-val" style="color:#d97706;">${e(d.todayCol)}</div>
          <div class="gen-kpi-before-vat" style="color:#b45309;">نقد: ${e(d.todayCashCol)} • شبكة: ${e(d.todayBankCol)}</div>
          <div class="gen-kpi-sub">متحصلات تاريخ: ${S}</div>
        </div>

        <!-- كرت مبيعات الفترة مع قبل الضريبة -->
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">صافي مبيعات الفترة (بعد المردود)</span>
            <span class="gen-kpi-icon">📈</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${e(d.periodSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#047857;">قبل الضريبة: ${e(d.periodSubtotal)}</div>
          <div class="gen-kpi-sub">${d.invoiceCount} فاتورة${d.periodReturnSales>0?` • مردودات: -${e(d.periodReturnSales)}`:""}</div>
        </div>

        <!-- كرت إجمالي تحصيلات ومجمل أرباح الفترة -->
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">إجمالي التحصيلات والربحية</span>
            <span class="gen-kpi-icon">💳</span>
          </div>
          <div class="gen-kpi-val" style="color:#2563eb;">${e(d.totalCol)}</div>
          <div class="gen-kpi-before-vat" style="color:#047857;">📈 مجمل أرباح الفترة: ${e(d.periodProfit)} (${d.periodMarginPct.toFixed(1)}%)</div>
          <div class="gen-kpi-sub">نقد: ${e(d.cashCol)} • شبكة: ${e(d.bankCol)}</div>
        </div>

        <!-- كرت مبيعات الشهر MTD مع قبل الضريبة -->
        <div class="gen-kpi-card purple">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">مبيعات الشهر حتى اليوم (MTD)</span>
            <span class="gen-kpi-icon">🗓️</span>
          </div>
          <div class="gen-kpi-val" style="color:#7c3aed;">${e(d.mtdSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#6366f1;">قبل الضريبة: ${e(d.mtdSubtotal)}</div>
          <div class="gen-kpi-sub">من تاريخ ${m}${d.mtdReturnSales>0?` • مردود: -${e(d.mtdReturnSales)}`:""}</div>
        </div>

        <!-- كرت تحقيق المستهدف العام -->
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">تحقيق المستهدف العام (Target)</span>
            <span class="gen-kpi-icon">🎯</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${d.targetPct.toFixed(1)}%</div>
          <div class="gen-kpi-sub">الهدف: ${e(d.monthlyTarget)} • كفاءة: ${d.collectionRate.toFixed(1)}%</div>
        </div>
      </div>

      <!-- ═══ 2. الرسوم البيانية المعبرة ═══ -->
      <div class="gen-charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📊 مقارنة مبيعات الشهر (MTD) بالمستهدف الشهري (Target)</span>
            <span style="font-size:.78rem; color:#64748b; font-weight:700;">لكل مندوب</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="rdj-gen-chart-target"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🥧 الحصة البيعية للمناديب (Market Share)</span>
            <span style="font-size:.78rem; color:#64748b; font-weight:700;">نسبة المساهمة</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="rdj-gen-chart-share"></canvas>
          </div>
        </div>
      </div>

      <!-- ═══ 3. جدول مصفوفة أداء المناديب الشامل ═══ -->
      <div class="matrix-tw">
        <table class="matrix-t">
          <thead>
            <tr>
              <th style="width:35px;">#</th>
              <th class="r-align" style="min-width:140px;">👤 المندوب</th>
              <th>⚡ ${h===b?`مبيعات (${st(b)})`:"مبيعات اليوم"}</th>
              <th>💵 ${h===b?`تحصيل (${st(b)})`:"تحصيل اليوم"}</th>
              <th>📈 صافي مبيعات الفترة</th>
              <th>🧾 الفواتير</th>
              <th>📊 متوسط الفاتورة</th>
              <th>💵 تحصيل نقدي (الفترة)</th>
              <th>🏦 تحصيل شبكة/بنك</th>
              <th>💰 إجمالي التحصيل</th>
              <th style="background:linear-gradient(135deg, #065f46, #047857); color:#fef08a;">📈 مجمل الربح (الهامش %)</th>
              <th>🗓️ مبيعات الشهر MTD</th>
              <th>🎯 الهدف الشهري</th>
              <th style="min-width:130px;">🏁 نسبة التارجت %</th>
              <th>⚖️ نسبة التحصيل %</th>
            </tr>
          </thead>
          <tbody>${B}</tbody>
          <tfoot>
            <tr>
              <td>Σ</td>
              <td class="r-align" style="font-size:.9rem; color:#1e3a8a;">الإجمالي العام للشركة</td>
              
              <!-- مبيعات اليوم إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(2,132,199,0.04);">
                <div class="cell-main-val" style="color:#0284c7;">${e(d.todaySales)}</div>
                <span class="cell-sub-vat sub-vat-blue">قبل: ${e(d.todaySubtotal)}</span>
                ${d.todayReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${e(d.todayReturnSales)})</span>`:""}
              </td>

              <!-- تحصيل اليوم إجمالي الشركة -->
              <td style="background:rgba(245,158,11,0.04);">
                <div class="cell-main-val" style="color:#d97706;">${e(d.todayCol)}</div>
                ${d.todayCol>0?`<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${e(d.todayCashCol)} • شبكة: ${e(d.todayBankCol)}</span>`:""}
              </td>

              <!-- مبيعات الفترة إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(5,150,105,0.04);">
                <div class="cell-main-val" style="color:#059669; font-size:1.02rem;">${e(d.periodSales)}</div>
                <span class="cell-sub-vat sub-vat-green">قبل: ${e(d.periodSubtotal)}</span>
                ${d.periodReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${e(d.periodReturnSales)})</span>`:""}
              </td>

              <td class="mono">${d.invoiceCount}${d.returnCount>0?` (-${d.returnCount})`:""}</td>
              <td class="mono">${e(d.avgInvoice)}</td>
              <td class="mono" style="color:#d97706;">${e(d.cashCol)}</td>
              <td class="mono" style="color:#2563eb;">${e(d.bankCol)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.98rem;">${e(d.totalCol)}</td>

              <!-- إجمالي مجمل الربح للشركة مع بيان التكلفة وزر التدقيق -->
              <td style="background:rgba(16,185,129,0.09); cursor:pointer;"
                  onclick="window.showRepProfitAuditModal('all')"
                  title="المعادلة: إجمالي المبيعات قبل الضريبة (${e(d.periodSubtotal)}) - إجمالي التكلفة (${e(d.periodNetCogs)}) = مجمل الربح (${e(d.periodProfit)})&#10;انقر هنا لفحص وتدقيق فواتير وتكاليف الشركة بالكامل">
                <div class="cell-main-val" style="color:#047857; font-size:1.05rem; font-weight:900;">${e(d.periodProfit)}</div>
                <div style="font-size:10.5px; color:#334155; font-family:monospace; font-weight:800; margin:1px 0;">تكلفة: ${e(d.periodNetCogs)}</div>
                <div style="font-size:11px; color:${d.periodProfit>=0?"#059669":"#dc2626"}; font-weight:800;">
                  (${d.periodMarginPct.toFixed(1)}%) <span style="font-size:9.5px; color:#2563eb; text-decoration:underline;">🔍 فحص الكل</span>
                </div>
              </td>

              <!-- مبيعات الشهر MTD إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(79,70,229,0.04);">
                <div class="cell-main-val" style="color:#4338ca;">${e(d.mtdSales)}</div>
                <span class="cell-sub-vat sub-vat-purple">قبل: ${e(d.mtdSubtotal)}</span>
                ${d.mtdReturnSales>0?`<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${e(d.mtdReturnSales)})</span>`:""}
              </td>

              <td class="mono">${e(d.monthlyTarget)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.95rem;">${d.targetPct.toFixed(1)}%</td>
              <td class="mono" style="color:#047857;">${d.collectionRate.toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,Qt(c)}catch(z){R.innerHTML=`<div class="rdj-empty" style="color:#ef4444">❌ خطأ في تحميل التقرير العام: ${z.message}</div>`,console.error("[GeneralExecutiveReport]",z)}}function Qt(f){if(typeof window.Chart>"u"){console.warn("Chart.js not loaded, skipping charts");return}if(pt.target)try{pt.target.destroy()}catch{}if(pt.share)try{pt.share.destroy()}catch{}const a=f.map(S=>S.name),h=f.map(S=>S.mtdSales),b=f.map(S=>S.monthlyTarget),R=f.map(S=>S.periodSales),z=document.getElementById("rdj-gen-chart-target");z&&(pt.target=new window.Chart(z,{type:"bar",data:{labels:a,datasets:[{label:"مبيعات الشهر MTD (ر.س)",data:h,backgroundColor:"rgba(37, 99, 235, 0.85)",borderColor:"#1d4ed8",borderWidth:1.5,borderRadius:6},{label:"الهدف الشهري Target (ر.س)",data:b,backgroundColor:"rgba(245, 158, 11, 0.75)",borderColor:"#d97706",borderWidth:1.5,borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",rtl:!0,labels:{font:{family:"Cairo"}}}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}},x:{grid:{display:!1}}}}}));const m=document.getElementById("rdj-gen-chart-share");if(m){const S=["#2563eb","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316"];pt.share=new window.Chart(m,{type:"doughnut",data:{labels:a,datasets:[{data:R,backgroundColor:S.slice(0,a.length),borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",rtl:!0,labels:{font:{family:"Cairo"}}}},cutout:"60%"}})}}async function te(f){const a=f.querySelector("#rdj-rep").value,h=f.querySelector("#rdj-from").value,b=f.querySelector("#rdj-to").value;if(!h||!b){alert("يرجى تحديد الفترة من وإلى");return}const R=f.querySelector("#rdj-body");R.innerHTML='<div class="rdj-loading">⏳ جاري جلب وتحليل الحركات اليومية وسندات الصرف والسلف والمردودات...</div>';try{const[z,m,S,D,G,r]=await Promise.all([tt(et(K,`companies/${Z}/salesInvoices`)),tt(et(K,`companies/${Z}/salesReturns`)).catch(()=>({docs:[]})),tt(et(K,`companies/${Z}/receipts`)),tt(et(K,`companies/${Z}/expenses`)).catch(()=>({docs:[]})),tt(et(K,`companies/${Z}/journalEntries`)).catch(()=>({docs:[]})),tt(et(K,`companies/${Z}/customers`))]),w=Object.fromEntries(r.docs.map(t=>[t.id,t.data().name||"عميل"])),_=Object.fromEntries(r.docs.map(t=>[t.id,t.data().repId||null])),C=Object.fromEntries(q.map(t=>[t.id,t.name||t.id])),j=a?new Set([a]):new Set(q.map(t=>t.id)),E=z.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"&&t.date>=h&&t.date<=b),$=m.docs.map(t=>{const s=t.data(),y=s.repId||s.salesRepId||_[s.customerId]||null;return{id:t.id,...s,_repId:y}}).filter(t=>t.status!=="cancelled"&&t.date>=h&&t.date<=b),Q=S.docs.map(t=>{const s=t.data(),y=s.repId||vt[s.sourceId]||wt[s.costCenterId]||_[s.targetId]||null;return{id:t.id,...s,_repId:y}}).filter(t=>t.date>=h&&t.date<=b&&t.entityType==="customer"),W=D.docs.map(t=>{const s=t.data();let y=s.repId||vt[s.sourceId]||wt[s.costCenterId]||null;return!y&&s.sourceName&&(s.sourceName.includes("مصطفى")?y=q.find(k=>k.name?.includes("مصطفى"))?.id||null:s.sourceName.includes("السيد رضا")?y=q.find(k=>k.name?.includes("السيد رضا"))?.id||null:s.sourceName.includes("محمد عوض")?y=q.find(k=>k.name?.includes("محمد عوض"))?.id||null:s.sourceName.includes("احمد السيد")&&(y=q.find(k=>k.name?.includes("احمد السيد"))?.id||null)),{id:t.id,...s,_repId:y,_isExpenseDoc:!0}}).filter(t=>t.date>=h&&t.date<=b),n=[],u=new Set;W.forEach(t=>{t.code&&u.add(t.code.replace("#","").toUpperCase().trim()),t.id&&(u.add(t.id.slice(0,6).toUpperCase()),u.add(t.id.slice(-6).toUpperCase()),u.add(t.id.toUpperCase()))}),G.docs.forEach(t=>{const s=t.data(),y=s.date;if(!y||y<h||y>b)return;const k=s.description||s.desc||"";if(k.startsWith("مبيعات")||k.startsWith("تكلفة بضاعة")||k.startsWith("تكلفة البضاعة")||k.startsWith("تحويل مخزني")||k.startsWith("تسوية مخزنية")||k.startsWith("سند قبض")||k.startsWith("سند صرف")||k.startsWith("مشتريات")||k.startsWith("مردود")||s.sourceType==="expense"||s.sourceType==="receipt"||s.sourceType==="customer_receipt"||s.sourceType==="invoice"||s.sourceType==="stockTransfer"||s.refType==="expense"||s.refType==="receipt"||s.refType==="invoice"||s.type==="expense"||s.type==="receipt")return;const nt=k.toUpperCase(),rt=(s.code||"").toUpperCase();for(const T of u)if(T&&(nt.includes(T)||rt.includes(T)))return;const V=s.lines||[],dt=y>="2026-10-08";V.forEach((T,ot)=>{const Y=parseFloat(T.credit||0),J=parseFloat(T.debit||0),at=T.accountId,X=String(T.accountCode||""),U=T.accountName||"";let g=Tt[at]||ht[X]||null;if(!g&&(X.startsWith("1-1-1-2")||U.includes("صندوق"))){const x=q.find(I=>[I.name.trim(),...I.name.split(/\s+/).filter(A=>A.length>=3)].some(A=>U.includes(A)));x&&(g=x.id)}if(g&&j.has(g)){if(Y>0){const x=V.find((kt,bt)=>bt!==ot&&parseFloat(kt.debit||0)>0),I=String(x?.accountCode||""),F=x?.accountName||"",A=I.startsWith("3-1-4")||I.startsWith("1-1-1-1")||I.startsWith("1-1-1-3")||k.includes("جارى")||k.includes("جاري")||k.includes("تصفية")||k.includes("توريد للخزينة")||k.includes("تحويل الى جارى"),lt=I.startsWith("1-1-5-4")||I.startsWith("2-1-5-3")||k.includes("سلفة"),ct=I.startsWith("1-1-2-3")||k.includes("عهدة");n.push({id:t.id,date:y,_repId:g,description:k||F||(A?"توريد نقدية للخزينة":"مصروف نقدي"),category:F,amount:Y,refNumber:s.code||t.id.slice(-6),isTransfer:A,isActualHandover:A,isAdvanceFromBox:lt,isCustodyOut:ct,isFieldExpense:!A&&!lt,typeBadge:A?"توريد للخزينة":lt?"سلفة من الصندوق":ct?"عهدة منصرفة":k.includes("صيانة")||k.includes("زيت")?"صيانة وتشغيل":"مصروف نقدي"})}else if(J>0&&dt){const x=V.find((F,A)=>A!==ot&&parseFloat(F.credit||0)>0),I=String(x?.accountCode||"");(I.startsWith("1-1-1-1")||I.startsWith("3-1-4")||I.startsWith("1-1-1-3")||k.includes("عهدة")||k.includes("تمويل"))&&n.push({id:t.id,date:y,_repId:g,description:k||"عهدة نقدية مستلمة لتمويل الصندوق",category:x?.accountName||"الخزينة المركزية",amount:J,refNumber:s.code||t.id.slice(-6),isCustodyIn:!0,typeBadge:"عهدة نقدية مستلمة (+)"})}}}),dt&&(V.forEach((T,ot)=>{const Y=parseFloat(T.debit||0);if(Y<=0)return;const J=T.accountId,at=String(T.accountCode||""),X=T.accountName||"";let U=yt[J]||yt[at]||null;if(!U&&(at.startsWith("1-1-5-4")||X.includes("سلف"))){const g=q.find(x=>[x.name.trim(),...x.name.split(/\s+/).filter(F=>F.length>=3)].some(F=>X.includes(F)));g&&(U=g.id)}if(U&&j.has(U)){const g=V.find((F,A)=>A!==ot&&parseFloat(F.credit||0)>0),x=String(g?.accountCode||"");ht[x]||x.startsWith("1-1-1-2")||n.push({id:t.id,date:y,_repId:U,description:k||"سلفة موظف من الخزينة المركزية (استقطاع راتب)",category:g?.accountName||"الخزينة المركزية",amount:Y,refNumber:s.code||t.id.slice(-6),isCentralAdvance:!0,typeBadge:"سلفة إدارة مركزية (استقطاع راتب)"})}}),V.forEach((T,ot)=>{const Y=parseFloat(T.debit||0),J=parseFloat(T.credit||0);if(Y<=0&&J<=0)return;const at=T.accountId,X=String(T.accountCode||""),U=T.accountName||"";let g=xt[at]||xt[X]||null;if(!g&&(X.startsWith("1-1-2-3")||U.includes("عهدة"))){const x=q.find(I=>[I.name.trim(),...I.name.split(/\s+/).filter(A=>A.length>=3)].some(A=>U.includes(A)));x&&(g=x.id)}if(g&&j.has(g)){const x=V.find((F,A)=>A!==ot),I=String(x?.accountCode||"");J>0?n.push({id:t.id,date:y,_repId:g,description:k||"تسوية عهدة مشتريات وسداد موردين",category:x?.accountName||"تسوية عهدة",amount:J,refNumber:s.code||t.id.slice(-6),isCustodySettled:!0,typeBadge:"تسوية عهدة مشتريات"}):Y>0&&!I.startsWith("1-1-1-2")&&n.push({id:t.id,date:y,_repId:g,description:k||"عهدة مشتريات مستلمة",category:x?.accountName||"الخزينة",amount:Y,refNumber:s.code||t.id.slice(-6),isCustodyReceived:!0,typeBadge:"عهدة مشتريات مستلمة"})}}))});const i={},c=(t,s)=>{const y=`${t}|${s}`;return i[y]||(i[y]={date:t,repId:s,invoices:[],returns:[],receipts:[],cashOuts:[],custodiesIn:[],fieldExpenses:[],advancesFromBox:[],centralAdvances:[],custodySettlements:[],actualHandovers:[]}),i[y]};E.forEach(t=>{const s=t.repId;!s||!j.has(s)||c(t.date||h,s).invoices.push(t)}),$.forEach(t=>{const s=t._repId;!s||!j.has(s)||c(t.date||h,s).returns.push(t)}),Q.forEach(t=>{const s=t._repId;!s||!j.has(s)||c(t.date||h,s).receipts.push(t)}),W.forEach(t=>{const s=t._repId;if(!s||!j.has(s))return;const y={id:t.id,date:t.date,_repId:s,description:t.notes||t.expenseName||t.name||"سند صرف",category:t.entityName||t.accountName||"مصروف عام",amount:parseFloat(t.amount||0),refNumber:t.code||t.id.slice(-6),isTransfer:!1,isFieldExpense:!0,typeBadge:"سند صرف"},k=c(t.date||h,s);k.cashOuts.push(y),k.fieldExpenses.push(y)}),n.forEach(t=>{const s=c(t.date,t._repId);t.isCentralAdvance?s.centralAdvances.push(t):t.isCustodySettled||t.isCustodyReceived?s.custodySettlements.push(t):t.isCustodyIn?s.custodiesIn.push(t):(t.isActualHandover||t.isTransfer?s.actualHandovers.push(t):t.isAdvanceFromBox?s.advancesFromBox.push(t):s.fieldExpenses.push(t),s.cashOuts.push(t))});const d="2026-10-08",B=Object.values(i).sort((t,s)=>t.date.localeCompare(s.date)||(C[t.repId]||"").localeCompare(C[s.repId]||""));B.forEach(t=>{t.grossSales=t.invoices.reduce((s,y)=>s+parseFloat(y.totalWithVat||y.total||0),0),t.returnSales=(t.returns||[]).reduce((s,y)=>s+parseFloat(y.totalWithVat||y.total||0),0),t.totalSales=t.grossSales-t.returnSales,t.cashCol=0,t.bankCol=0,t.receipts.forEach(s=>{const y=s.method||s.paymentMethod||"cash",k=parseFloat(s.amount||0);gt(y)?t.bankCol+=k:t.cashCol+=k}),t.totalCol=t.cashCol+t.bankCol,t.date>=d?(t.isEnhanced=!0,t.totCustodyIn=(t.custodiesIn||[]).reduce((s,y)=>s+(y.amount||0),0),t.totFieldExp=(t.fieldExpenses||[]).reduce((s,y)=>s+(y.amount||0),0),t.totAdvFromBox=(t.advancesFromBox||[]).reduce((s,y)=>s+(y.amount||0),0),t.totCentralAdv=(t.centralAdvances||[]).reduce((s,y)=>s+(y.amount||0),0),t.totActualHandover=(t.actualHandovers||[]).reduce((s,y)=>s+(y.amount||0),0),t.netBoxRequired=t.cashCol+t.totCustodyIn-(t.totFieldExp+t.totAdvFromBox),t.clearanceDiff=t.totActualHandover-t.netBoxRequired,t.clearanceStatus=Math.abs(t.clearanceDiff)<.05?"MATCHED":t.clearanceDiff<0?"REMAINING":"SURPLUS",t.pureExpenses=t.totFieldExp+t.totAdvFromBox,t.treasuryTransfers=t.totActualHandover,t.totalCashOut=t.pureExpenses+t.treasuryTransfers,t.netBoxDay=t.netBoxRequired):(t.isEnhanced=!1,t.pureExpenses=t.cashOuts.filter(s=>!s.isTransfer).reduce((s,y)=>s+(y.amount||0),0),t.treasuryTransfers=t.cashOuts.filter(s=>s.isTransfer).reduce((s,y)=>s+(y.amount||0),0),t.totalCashOut=t.pureExpenses+t.treasuryTransfers,t.netBoxDay=t.cashCol-t.pureExpenses,t.totActualHandover=t.treasuryTransfers,t.netBoxRequired=t.netBoxDay,t.clearanceDiff=0,t.clearanceStatus="LEGACY")});const o={};B.forEach(t=>{o[t.repId]||(o[t.repId]=0),o[t.repId]+=t.cashCol-t.totalCashOut,t.boxBal=o[t.repId]});const p=B.reduce((t,s)=>(t.grossSales+=s.grossSales,t.returnSales+=s.returnSales,t.totalSales+=s.totalSales,t.cashCol+=s.cashCol,t.bankCol+=s.bankCol,t.pureExpenses+=s.pureExpenses,t.treasuryTransfers+=s.treasuryTransfers,t.totalCashOut+=s.totalCashOut,t.netBoxTotal+=s.netBoxDay,t.totCentralAdv=(t.totCentralAdv||0)+(s.totCentralAdv||0),t.totActualHandover=(t.totActualHandover||0)+(s.totActualHandover||0),t),{grossSales:0,returnSales:0,totalSales:0,cashCol:0,bankCol:0,pureExpenses:0,treasuryTransfers:0,totalCashOut:0,netBoxTotal:0,totCentralAdv:0,totActualHandover:0});if(!B.length){R.innerHTML='<div class="rdj-empty">لا توجد حركات مسجلة في هذه الفترة</div>';return}const L=h===b?st(h):`${st(h)} إلى ${st(b)}`,v=a?C[a]||a:"جميع المناديب";H=B,Kt=p,Mt={dateRange:L,repLabel:v,from:h,to:b,custMap:w,repMap:C,repBoxNameMap:$t};let N="";B.forEach((t,s)=>{const y=C[t.repId]||t.repId||"مندوب",k=$t[t.repId]||"صندوق المندوب";let nt=t.invoices.length===0?'<tr><td colspan="4" class="dmt">لا توجد فواتير مبيعات مسجلة في هذا اليوم</td></tr>':"",rt=0;t.invoices.forEach(g=>{const x=parseFloat(g.totalWithVat||g.total||0);rt+=x,nt+=`<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${g.code||g.invoiceNumber||g.id.slice(-6)}</td>
          <td class="lft">${w[g.customerId]||"عميل"}</td>
          <td>${Bt(g.paymentMethod)}</td>
          <td class="mono font-bold" style="color:#059669;">${e(x)}</td>
        </tr>`}),t.invoices.length&&(nt+=`<tfoot><tr>
          <td colspan="3" style="text-align:right;">الإجمالي (${t.invoices.length} فاتورة)</td>
          <td class="mono font-bold" style="color:#059669;">${e(rt)}</td>
        </tr></tfoot>`);let V="";if(t.returns&&t.returns.length>0){let g=0;t.returns.forEach(x=>{const I=parseFloat(x.totalWithVat||x.total||0);g+=I,V+=`<tr>
            <td class="mono font-bold" style="color:#dc2626;">${x.number||x.creditNoteNumber||x.id.slice(-6)}</td>
            <td class="lft">${w[x.customerId]||x.customerName||"عميل"}</td>
            <td><span class="b b-exp">↩️ إشعار دائن</span></td>
            <td class="mono font-bold" style="color:#dc2626;">-${e(I)}</td>
          </tr>`}),V=`
          <div class="sub-card" style="border-color:rgba(239,68,68,0.3);">
            <div class="dh e" style="background:rgba(239,68,68,0.12); color:#991b1b;">
              <span>↩️ مردودات المبيعات (إشعارات دائنة)</span>
              <span class="mono">-${e(g)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم الإشعار</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">النوع</th><th style="width:120px;">المبلغ المسترد</th></tr></thead>
              <tbody>${V}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المردودات (${t.returns.length} إشعار دائن)</td><td class="mono font-bold" style="color:#dc2626;">-${e(g)}</td></tr></tfoot>
            </table>
          </div>
        `}let it=t.receipts.length===0?'<tr><td colspan="5" class="dmt">لا توجد تحصيلات مسجلة في هذا اليوم</td></tr>':"",dt=0;t.receipts.forEach(g=>{const x=parseFloat(g.amount||0);dt+=x;const I=g.method||g.paymentMethod||"cash";it+=`<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${g.code||g.id.slice(-6)}</td>
          <td class="lft">${w[g.targetId]||g.accountName||"عميل"}</td>
          <td>${Bt(I)}</td>
          <td style="font-size:.75rem; color:#64748b;">${g.sourceName||k}</td>
          <td class="mono font-bold" style="color:${gt(I)?"#2563eb":"#d97706"};">${e(x)}</td>
        </tr>`}),t.receipts.length&&(it+=`<tfoot><tr>
          <td colspan="4" style="text-align:right;">
            الإجمالي (${t.receipts.length} سند قبض) &nbsp;—&nbsp;
            <span style="color:#d97706; font-size:11.5px; font-weight:800;">💵 نقدي: ${e(t.cashCol)}</span>
            &nbsp;•&nbsp;
            <span style="color:#2563eb; font-size:11.5px; font-weight:800;">💳 شبكة/تحويل: ${e(t.bankCol)}</span>
          </td>
          <td class="mono font-bold" style="color:#1e3a8a; font-size:.95rem;">${e(dt)}</td>
        </tr></tfoot>`);let T=t.cashOuts.length===0?'<tr><td colspan="4" class="dmt">لا توجد مصروفات أو مسحوبات نقدية من الصندوق</td></tr>':"",ot=0;t.cashOuts.forEach(g=>{ot+=g.amount;const x=g.isTransfer?"b-tr":g.typeBadge.includes("سلفة")?"b-adv":"b-exp";T+=`<tr>
          <td class="mono" style="font-size:.75rem; color:#64748b;">${g.refNumber}</td>
          <td class="lft font-bold" style="color:${g.isTransfer?"#0369a1":"#991b1b"};">${g.description}</td>
          <td><span class="b ${x}">${g.typeBadge}</span></td>
          <td class="mono font-bold" style="color:${g.isTransfer?"#0369a1":"#dc2626"};">${e(g.amount)}</td>
        </tr>`}),t.cashOuts.length&&(T+=`<tfoot><tr>
          <td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف والتوريدات (${t.cashOuts.length} حركة)</td>
          <td class="mono font-bold" style="color:#dc2626;">${e(ot)}</td>
        </tr></tfoot>`);let Y="";if(t.isEnhanced&&t.centralAdvances&&t.centralAdvances.length>0){let g=t.centralAdvances.map(x=>`
          <tr>
            <td class="mono font-bold" style="color:#0284c7;">${x.refNumber||x.ref}</td>
            <td class="lft font-bold">${x.description||x.desc}</td>
            <td><span class="b b-cst">💳 استقطاع راتب</span></td>
            <td style="font-size:11px; color:#64748b;">${x.source||x.category||"الخزينة المركزية"}</td>
            <td class="mono font-bold" style="color:#0284c7;">${e(x.amount)}</td>
          </tr>
        `).join("");Y=`
          <div class="sub-card" style="border-color:#38bdf8; background:#f0f9ff; margin-bottom:12px;">
            <div class="dh" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>💳 سلف شخصية مستلمة من الإدارة / الخزينة المركزية (استقطاع من الراتب الشهري)</span>
              <span class="mono" style="font-size:1.05rem; font-weight:900;">${e(t.totCentralAdv)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم القيد</th><th style="text-align:right;">البيان</th><th style="width:110px;">النوع</th><th style="width:140px;">الجهة المصدرة</th><th style="width:120px;">المبلغ</th></tr></thead>
              <tbody>${g}</tbody>
            </table>
            <div style="padding:8px 12px; font-size:11.5px; color:#0369a1; font-weight:700; border-top:1px dashed #bae6fd; background:#e0f2fe;">
              📌 <strong>إيضاح رقابي:</strong> هذا المبلغ صُرف للموظف مباشرة من الخزينة المركزية (الصندوق الرئيسي/المالك) ويُستقطع من الراتب الشهري عند صرف الرواتب، ولا يُخصم من نقدية توريد سيارة المبيعات الميدانية لضمان دقة ومطابقة عهدة السيارة.
            </div>
          </div>
        `}let J="";if(t.isEnhanced&&t.custodySettlements&&t.custodySettlements.length>0){let g=0,x=0,I=t.custodySettlements.map(F=>{const A=F.isCustodyReceived||F.type==="received";return A?g+=F.amount:x+=F.amount,`
            <tr>
              <td class="mono font-bold">${F.refNumber||F.ref}</td>
              <td class="lft font-bold">${F.description||F.desc}</td>
              <td><span class="b ${A?"b-cst":"b-ok"}">${A?"📥 عهدة مستلمة":"📤 تسوية عهدة (سداد)"}</span></td>
              <td class="mono font-bold" style="color:${A?"#0284c7":"#059669"};">${A?"+":"-"}${e(F.amount)}</td>
            </tr>
          `}).join("");J=`
          <div class="sub-card" style="border-color:#cbd5e1; margin-bottom:12px;">
            <div class="dh" style="background:#475569; color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>📦 حركة وتسوية عهد المشتريات والعمليات</span>
              <span class="mono" style="font-size:11.5px;">مستلم: ${e(g)} | مسوى: ${e(x)} | رصيد العهدة: ${e(g-x)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">المرجع</th><th style="text-align:right;">البيان</th><th style="width:140px;">نوع الحركة</th><th style="width:120px;">المبلغ</th></tr></thead>
              <tbody>${I}</tbody>
            </table>
          </div>
        `}let at="";if(t.isEnhanced&&t.actualHandovers&&t.actualHandovers.length>0){let g=t.actualHandovers.map(x=>`
          <tr>
            <td class="mono font-bold" style="color:#0284c7;">${x.refNumber||x.ref}</td>
            <td class="lft font-bold" style="color:#0369a1;">${x.description||x.desc}</td>
            <td><span class="b b-tr">🤝 توريد رسمي للخزينة</span></td>
            <td class="mono font-bold" style="color:#0284c7;">${e(x.amount)}</td>
          </tr>
        `).join("");at=`
          <div class="sub-card" style="border-color:#0284c7; margin-bottom:12px;">
            <div class="dh" style="background:linear-gradient(135deg, #0369a1, #0284c7); color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>🤝 المبالغ الموردة فعلياً إلى جاري المالك / الخزينة الرئيسية</span>
              <span class="mono" style="font-size:1.05rem; font-weight:900;">${e(t.totActualHandover)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم القيد</th><th style="text-align:right;">البيان والحساب المستلم</th><th style="width:140px;">النوع</th><th style="width:120px;">المبلغ المورد</th></tr></thead>
              <tbody>${g}</tbody>
            </table>
          </div>
        `}let X="";if(t.isEnhanced){const g=t.clearanceStatus==="MATCHED"?"b-ok":t.clearanceStatus==="REMAINING"?"b-warn":"b-cst",x=t.clearanceStatus==="MATCHED"?"✅ مطابق ومقفل بالكامل (0.00 ر.س)":t.clearanceStatus==="REMAINING"?`⚠️ متبقي في ذمة المندوب للتوريد (${e(Math.abs(t.clearanceDiff))})`:`ℹ️ توريد فائض للخزينة (+${e(t.clearanceDiff)})`;X=`
          <div class="rep-box-calc-bar" style="background:#f8fafc; border:2px solid #0284c7; border-radius:10px; padding:12px 16px; margin-top:12px;">
            <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; width:100%;">
              <div>💵 التحصيل النقدي: <strong class="mono text-good">${e(t.cashCol)}</strong></div>
              ${t.totCustodyIn>0?`<div>➕ 📦 عهدة مستلمة: <strong class="mono" style="color:#0284c7;">+${e(t.totCustodyIn)}</strong></div>`:""}
              <div>➖ 💸 مصروفات وسلف الصندوق: <strong class="mono text-bad">-${e(t.pureExpenses)}</strong></div>
              <div>🟰 🏦 صافي النقد المفترض توريده: <strong class="mono font-bold" style="color:#0f172a; font-size:1.1rem;">${e(t.netBoxRequired)}</strong></div>
            </div>
            <div style="width:100%; height:1px; background:#cbd5e1; margin:8px 0;"></div>
            <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; width:100%;">
              <div>🤝 المورد الفعلي للجاري/الخزينة: <strong class="mono font-bold" style="color:#0284c7; font-size:1.1rem;">${e(t.totActualHandover)}</strong></div>
              <div>⮞ فارق الإقفال والتسوية: <strong class="mono font-bold" style="color:${Math.abs(t.clearanceDiff)<.05?"#059669":"#dc2626"}; font-size:1.15rem;">${e(t.clearanceDiff)}</strong></div>
              <div>الحالة: <span class="b ${g}" style="font-size:12px; padding:4px 10px;">${x}</span></div>
            </div>
          </div>
        `}else X=`
          <div class="rep-box-calc-bar">
            <div>💵 التحصيل النقدي: <strong class="mono text-good">${e(t.cashCol)}</strong></div>
            <div style="color:#64748b;">➖</div>
            <div>💸 المصروفات والسلف: <strong class="mono text-bad">${e(t.pureExpenses)}</strong></div>
            <div style="color:#64748b;">🟰</div>
            <div>🏦 صافي النقد المتاح للتوريد: <strong class="mono font-bold" style="color:#047857; font-size:1.05rem;">${e(t.netBoxDay)}</strong></div>
            ${t.treasuryTransfers>0?`<div style="font-size:11px; color:#0369a1; width:100%; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:4px;">(تم توريد ${e(t.treasuryTransfers)} إلى جاري المالك/الخزينة)</div>`:""}
          </div>
        `;const U=t.isEnhanced?`
        <div style="margin-top:3px;">
          ${t.clearanceStatus==="MATCHED"?'<span class="b b-ok" style="font-size:10px; padding:1px 6px;">✅ مقفل ومطابق</span>':t.clearanceStatus==="REMAINING"?`<span class="b b-warn" style="font-size:10px; padding:1px 6px;">⚠️ متبقي ${e(Math.abs(t.clearanceDiff))}</span>`:`<span class="b b-cst" style="font-size:10px; padding:1px 6px;">ℹ️ فائض +${e(t.clearanceDiff)}</span>`}
        </div>
      `:"";N+=`
        <tr class="mr" onclick="rdjX(${s})">
          <td><button class="xbtn" id="xb${s}">▶</button></td>
          <td class="td-date mono">${t.date}</td>
          <td class="td-rep">👤 ${y}</td>
          <td class="td-sales mono">${e(t.totalSales)}</td>
          <td class="td-cash mono">${t.cashCol>0?e(t.cashCol):"—"}</td>
          <td class="td-bank mono">${t.bankCol>0?e(t.bankCol):"—"}</td>
          <td class="td-exp mono">${t.pureExpenses>0?e(t.pureExpenses):"—"}</td>
          <td class="td-box mono ${(t.netBoxDay||t.netBoxRequired)<0?"text-bad":"text-good"}">
            🏦 ${e(t.isEnhanced?t.netBoxRequired:t.netBoxDay)}
            ${U}
          </td>
        </tr>

        <tr class="dr">
          <td colspan="8">
            <div class="di" id="di${s}">
              <div class="rep-section-badge">
                <div>
                  <h4>👤 يومية المندوب: ${y} &nbsp;|&nbsp; 📅 التاريخ: ${t.date}</h4>
                  <div style="font-size:.78rem; opacity:0.9; margin-top:2px;">📦 الصندوق المعتمد: ${k}</div>
                </div>
                <div style="text-align:left; font-size:.85rem; font-weight:800;">
                  صافي النقدية المفترض توريدها: <span style="font-size:1.1rem; color:#fef08a; font-family:monospace;">${e(t.isEnhanced?t.netBoxRequired:t.netBoxDay)}</span>
                </div>
              </div>

              <div class="sub-card">
                <div class="dh s">
                  <span>📈 1. فواتير المبيعات الصادرة</span>
                  <span class="mono">${e(t.grossSales??t.totalSales)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">طريقة الدفع</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${nt}</tbody>
                </table>
              </div>

              ${V}

              <div class="sub-card">
                <div class="dh c" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                  <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:11px; opacity:0.9; font-weight:700;">(💵 نقدي: ${e(t.cashCol)} • 💳 شبكة/بنك: ${e(t.bankCol)})</span>
                    <span class="mono" style="font-size:1rem; font-weight:900;">${e(t.totalCol)}</span>
                  </div>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:110px;">طريقة التحصيل</th><th style="width:140px;">الصندوق</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${it}</tbody>
                </table>
              </div>

              <div class="sub-card">
                <div class="dh e">
                  <span>💸 3. المصروفات والسلف التشغيلية ومسحوبات الصندوق</span>
                  <span class="mono">${e(t.totalCashOut)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم القيد / السند</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:120px;">النوع</th><th style="width:120px;">المبلغ المنصرف</th></tr></thead>
                  <tbody>${T}</tbody>
                </table>
              </div>

              ${Y}
              ${J}
              ${at}
              ${X}

            </div>
          </td>
        </tr>
      `}),R.innerHTML=`
      <div class="gen-kpis-grid no-print">
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي المبيعات</span><span>📈</span></div>
          <div class="gen-kpi-val" style="color:#059669">${e(p.totalSales)}</div>
        </div>
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي التحصيل النقدي</span><span>💵</span></div>
          <div class="gen-kpi-val" style="color:#d97706">${e(p.cashCol)}</div>
        </div>
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي تحصيل بنك / شبكة</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#2563eb">${e(p.bankCol)}</div>
        </div>
        <div class="gen-kpi-card purple" style="border-color:rgba(239,68,68,.4)">
          <div class="gen-kpi-top"><span class="gen-kpi-title">المصروفات والسلف التشغيلية</span><span>💸</span></div>
          <div class="gen-kpi-val" style="color:#dc2626">${e(p.pureExpenses)}</div>
        </div>
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top"><span class="gen-kpi-title">صافي النقد المتاح للتوريد</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#047857;">${e(p.netBoxTotal)}</div>
        </div>
      </div>

      <div class="rdj-tw">
        <table class="rdj-t">
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>📅 التاريخ</th>
              <th style="text-align:right;">👤 اسم المندوب</th>
              <th>📈 إجمالي المبيعات</th>
              <th>💵 تحصيل نقدي</th>
              <th>🏦 تحصيل بنك/شبكة</th>
              <th>💸 مصروفات وسلف (-)</th>
              <th>🏦 صافي النقد المتاح للتوريد</th>
            </tr>
          </thead>
          <tbody>${N}</tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colspan="2" style="text-align:right; font-size:.85rem; color:#475569;">الإجمالي العام (${B.length} يومية مندوب)</td>
              <td class="td-sales mono">${e(p.totalSales)}</td>
              <td class="td-cash mono">${e(p.cashCol)}</td>
              <td class="td-bank mono">${e(p.bankCol)}</td>
              <td class="td-exp mono">${e(p.pureExpenses)}</td>
              <td class="td-box mono">${e(p.netBoxTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,window.rdjX=t=>{const s=document.getElementById(`di${t}`),y=document.getElementById(`xb${t}`),k=y?.closest("tr");if(!s)return;const nt=s.classList.toggle("open");y&&(y.textContent=nt?"▼":"▶"),k&&k.classList.toggle("open",nt)}}catch(z){R.innerHTML=`<div class="rdj-empty" style="color:#ef4444">❌ خطأ في إعداد اليومية: ${z.message}</div>`,console.error("[DailyJournalReport]",z)}}window.openRepTargetModal=()=>{const f=document.getElementById("rdj-target-modal"),a=document.getElementById("rdj-target-modal-body");!f||!a||(a.innerHTML=q.map(h=>{const b=h.status==="inactive"||h.isActive===!1;return`
    <div class="rep-target-row" style="${b?"opacity:0.6; background:#f8fafc;":""}">
      <div class="rep-target-info">
        <div>${b?"⚪":"👤"} ${h.name} ${b?'<span style="color:#ef4444; font-size:11px; font-weight:bold;">(غير نشط)</span>':""}</div>
        <div style="font-size:11px; color:#64748b; font-weight:normal;">كود: ${h.code||h.id.slice(-4)}</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="number" id="target-inp-${h.id}" class="rep-target-input" value="${parseFloat(h.monthlyTarget||0)}" min="0" step="1000" />
        <span style="font-size:12px; font-weight:bold; color:#475569;">ر.س</span>
      </div>
    </div>
  `}).join(""),f.style.display="flex")};window.closeRepTargetModal=()=>{const f=document.getElementById("rdj-target-modal");f&&(f.style.display="none")};window.saveRepTargets=async()=>{const f=document.getElementById("rdj-save-targets-btn");f&&(f.disabled=!0,f.textContent="⏳ جاري الحفظ...");try{const a=[];q.forEach(b=>{const R=document.getElementById(`target-inp-${b.id}`);if(R){const z=parseFloat(R.value)||0;b.monthlyTarget=z,a.push(Jt(Xt(K,`companies/${Z}/salesReps`,b.id),{monthlyTarget:z}))}}),await Promise.all(a),typeof window.showToast=="function"&&window.showToast("تم تحديث مستهدفات المناديب بنجاح ✅","success"),window.closeRepTargetModal();const h=document.querySelector(".rdj-wrap")?.parentElement;h&&ft(h)}catch(a){alert("فشل حفظ المستهدفات: "+a.message)}finally{f&&(f.disabled=!1,f.textContent="💾 حفظ المستهدفات وتحديث التقرير")}};window.closeRepProfitAuditModal=()=>{const f=document.getElementById("rdj-profit-audit-modal");f&&(f.style.display="none")};window.showRepProfitAuditModal=f=>{if(!O||!O.reps)return;const a=document.getElementById("rdj-profit-audit-modal"),h=document.getElementById("rdj-profit-modal-body"),b=document.getElementById("rdj-profit-modal-title");if(!a||!h)return;let R="",z=[],m=0,S=0,D=0,G=0;if(f==="all")R="الإجمالي العام لكافة مناديب الشركة",O.reps.forEach(r=>{z.push(...r.invoicesDetails||[])}),m=O.grand.periodSubtotal,S=O.grand.periodNetCogs,D=O.grand.periodProfit,G=O.grand.periodMarginPct;else{const r=O.reps.find(w=>w.id===f);if(!r)return;R=r.name,z=r.invoicesDetails||[],m=r.periodSubtotal,S=r.periodNetCogs,D=r.periodProfit,G=r.periodMarginPct}z.sort((r,w)=>(w.date||"").localeCompare(r.date||"")),b&&(b.textContent=`كشف تدقيق أرباح وتكاليف المبيعات — ${R}`),h.innerHTML=`
    <!-- كروت ملخص المعادلة المحاسبية -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:16px;">
      <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#15803d;">صافي المبيعات (قبل الضريبة)</div>
        <div style="font-size:16px; font-weight:900; color:#166534; font-family:monospace;">${e(m)}</div>
      </div>
      <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#b91c1c;">تكلفة البضاعة المباعة (COGS)</div>
        <div style="font-size:16px; font-weight:900; color:#991b1b; font-family:monospace;">${e(S)}</div>
      </div>
      <div style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#1d4ed8;">صافي مجمل الربح (ر.س)</div>
        <div style="font-size:16px; font-weight:900; color:#1e40af; font-family:monospace;">${e(D)}</div>
      </div>
      <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#7e22ce;">نسبة هامش الربح %</div>
        <div style="font-size:16px; font-weight:900; color:#6b21a8; font-family:monospace;">${G.toFixed(2)}%</div>
      </div>
    </div>

    <!-- شريط توضيح المعادلة -->
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 14px; font-size:11.5px; color:#334155; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div><strong>المعادلة المحاسبية:</strong> ${e(m)} (صافي المبيعات) - ${e(S)} (التكلفة) = <strong>${e(D)} ر.س (مجمل الربح)</strong></div>
      <div style="color:#059669; font-weight:800;">نسبة الهامش = (${e(D)} ÷ ${e(m)}) × 100 = ${G.toFixed(2)}%</div>
    </div>

    <!-- جدول الفواتير التفصيلي -->
    <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:10px;">
      <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:1.5px solid #cbd5e1; color:#334155;">
            <th style="padding:7px 10px; text-align:center;">#</th>
            <th style="padding:7px 10px; text-align:center;">النوع</th>
            <th style="padding:7px 10px; text-align:center;">رقم المستند</th>
            <th style="padding:7px 10px; text-align:center;">التاريخ</th>
            <th style="padding:7px 10px; text-align:right;">العميل</th>
            <th style="padding:7px 10px; text-align:center;">القيمة قبل الضريبة</th>
            <th style="padding:7px 10px; text-align:center;">التكلفة (COGS)</th>
            <th style="padding:7px 10px; text-align:center;">الربح (ر.س)</th>
            <th style="padding:7px 10px; text-align:center;">الهامش %</th>
          </tr>
        </thead>
        <tbody>
          ${z.length===0?'<tr><td colspan="9" style="text-align:center; padding:16px; color:#94a3b8;">لا توجد فواتير لهذه الفترة</td></tr>':""}
          ${z.map((r,w)=>{const _=r.type==="return",C=r.profit>=0?"#059669":"#dc2626";return`
              <tr style="border-bottom:1px solid #f1f5f9; ${_?"background:rgba(239,68,68,0.04);":""}">
                <td style="padding:6px 10px; text-align:center; color:#64748b;">${w+1}</td>
                <td style="padding:6px 10px; text-align:center;">
                  ${_?'<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">↩️ مردود</span>':'<span style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">📄 فاتورة</span>'}
                </td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:700;">${r.number}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; color:#64748b;">${r.date||"—"}</td>
                <td style="padding:6px 10px; text-align:right; font-weight:700; color:#0f172a;">${r.customerName}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:700; ${_?"color:#dc2626;":""}">${e(r.sub)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; color:#475569;">${e(r.cost)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:800; color:${C};">${e(r.profit)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:800; color:${C};">${r.marginPct.toFixed(1)}%</td>
              </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; border-top:2px solid #0f172a; font-weight:900;">
            <td colspan="5" style="padding:8px 12px; text-align:right; color:#1e3a8a;">الإجمالي (${z.length} مستند)</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#059669;">${e(m)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#475569;">${e(S)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#047857; font-size:12px;">${e(D)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#047857; font-size:12px;">${G.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,a.style.display="flex"};window.shareRepDailyJournalWhatsApp=()=>{if(!O||!O.reps||!O.reps.length){alert("يرجى الضغط على زر عرض التقرير أولاً لتحميل البيانات قبل الإرسال للمدير المالي.");return}const{from:f,to:a,todayStr:h,reps:b,grand:R}=O,z=f===a;let m=`📊 *تقرير يومية المبيعات والتحصيلات التنفيذي — إدهام ERP*
`;m+=`📅 *التاريخ:* ${h||a}
`,z||(m+=`🗓️ *الفترة:* من ${f} إلى ${a}
`),m+=`━━━━━━━━━━━━━━━━━━━━
`,m+=`💰 *مبيعات اليوم (شامل الضريبة):* ${e(R.todaySales||0)}
`,m+=`💵 *مبيعات اليوم (قبل الضريبة):* ${e(R.todaySubtotal||0)}
`,m+=`💳 *تحصيلات اليوم:* ${e(R.todayCol||0)} (نقد: ${e(R.todayCashCol||0)} • شبكة: ${e(R.todayBankCol||0)})
`,m+=`━━━━━━━━━━━━━━━━━━━━
`,z||(m+=`📈 *إجمالي مبيعات الفترة:* ${e(R.periodSales||0)}
`,m+=`💵 *صافي الفترة (قبل الضريبة):* ${e(R.periodSubtotal||0)}
`,m+=`🎯 *نسبة تحقيق التارجت:* ${(R.targetPct||0).toFixed(1)}%
`,m+=`━━━━━━━━━━━━━━━━━━━━
`),m+=`👥 *تفصيل أداء المناديب:*
`,b.forEach(D=>{const G=D.todaySales>0?e(D.todaySales):"0.00 ر.س",r=D.todayCol>0?e(D.todayCol):"0.00 ر.س";m+=`• *${D.name}:* مبيعات: ${G} | تحصيل: ${r}
`}),m+=`━━━━━━━━━━━━━━━━━━━━
`,m+=`🔗 *رابط التقرير المباشر والمفصل:*
https://idham-b3a7e.web.app/#rep-daily-journal`;const S=`https://api.whatsapp.com/send?text=${encodeURIComponent(m)}`;window.open(S,"_blank")};window.exportGeneralReportExcel=()=>{if(!O||!O.reps||!O.reps.length){alert("يرجى عرض التقرير أولاً قبل التصدير");return}const{reps:f,grand:a,from:h,to:b}=O,R=["م","اسم المندوب","صافي مبيعات اليوم شامل الضريبة","مبيعات اليوم قبل الضريبة","مردودات اليوم","تحصيل اليوم (ر.س)","صافي مبيعات الفترة شامل الضريبة","مبيعات الفترة قبل الضريبة","مردودات الفترة","عدد الفواتير","متوسط الفاتورة","تحصيل نقدي الفترة","تحصيل شبكة الفترة","إجمالي تحصيل الفترة","مجمل الربح للفترة (ر.س)","نسبة هامش الربح %","مبيعات الشهر MTD صافي شامل","مبيعات الشهر MTD قبل","مردودات الشهر MTD","الهدف الشهري","نسبة تحقيق التارجت %","نسبة التحصيل من المبيعات %"],z=f.map((m,S)=>[S+1,m.name,m.todaySales,m.todaySubtotal,m.todayReturnSales||0,m.todayCol,m.periodSales,m.periodSubtotal,m.periodReturnSales||0,m.invoiceCount,Math.round(m.avgInvoice),m.cashCol,m.bankCol,m.totalCol,Math.round((m.periodProfit||0)*100)/100,(m.periodMarginPct||0).toFixed(2)+"%",m.mtdSales,m.mtdSubtotal,m.mtdReturnSales||0,m.monthlyTarget,m.targetPct.toFixed(1)+"%",m.collectionRate.toFixed(1)+"%"]);z.push(["Σ","الإجمالي العام للشركة",a.todaySales,a.todaySubtotal,a.todayReturnSales||0,a.todayCol,a.periodSales,a.periodSubtotal,a.periodReturnSales||0,a.invoiceCount,Math.round(a.avgInvoice),a.cashCol,a.bankCol,a.totalCol,Math.round((a.periodProfit||0)*100)/100,(a.periodMarginPct||0).toFixed(2)+"%",a.mtdSales,a.mtdSubtotal,a.mtdReturnSales||0,a.monthlyTarget,a.targetPct.toFixed(1)+"%",a.collectionRate.toFixed(1)+"%"]),Pt({filename:`تقرير_أداء_وربحية_المناديب_التنفيذي_${b}`,title:`التقرير التنفيذي لأداء ومبيعات وهوامش أرباح المناديب (من ${h} إلى ${b})`,headers:R,rows:z})};window.exportRepDailyExcel=()=>{if(!H||!H.length){alert("يرجى عرض اليومية أولاً قبل التصدير");return}const{dateRange:f,repLabel:a,from:h,to:b,repMap:R,repBoxNameMap:z}=Mt,m=["م","التاريخ","اسم المندوب","الصندوق المعتمد","إجمالي فواتير المبيعات (ر.س)","مردودات المبيعات (ر.س)","صافي المبيعات (ر.س)","التحصيل النقدي (ر.س)","تحصيل بنك / شبكة (ر.س)","إجمالي التحصيل (ر.س)","العهدة النقدية المستلمة (ر.س)","المصروفات الميدانية (ر.س)","سلف مقتطعة من الصندوق (ر.س)","سلف الخزينة المركزية - استقطاع راتب (ر.س)","صافي النقد المفترض توريده (ر.س)","المورد الفعلي لجاري المالك / الخزينة (ر.س)","فارق المطابقة والتسوية (ر.س)","حالة الإقفال والمطابقة"],S=H.map((i,c)=>{const d=R[i.repId]||i.repId||"مندوب",B=z[i.repId]||"صندوق المندوب",o=i.isEnhanced?i.clearanceStatus==="MATCHED"?"مطابق ومقفل بالكامل":i.clearanceStatus==="REMAINING"?`متبقي في ذمة المندوب (${e(Math.abs(i.clearanceDiff))})`:`فائض مورد (+${e(i.clearanceDiff)})`:"سابق (تاريخ قديم)";return[c+1,i.date,d,B,i.grossSales||i.totalSales,i.returnSales||0,i.totalSales,i.cashCol,i.bankCol,i.totalCol,i.isEnhanced&&i.totCustodyIn||0,i.isEnhanced?i.totFieldExp||0:i.pureExpenses||0,i.isEnhanced&&i.totAdvFromBox||0,i.isEnhanced&&i.totCentralAdv||0,i.isEnhanced?i.netBoxRequired:i.netBoxDay,i.isEnhanced?i.totActualHandover||0:i.treasuryTransfers||0,i.isEnhanced?i.clearanceDiff:0,o]}),D=H.reduce((i,c)=>i+(c.totalSales||0),0),G=H.reduce((i,c)=>i+(c.grossSales||c.totalSales||0),0),r=H.reduce((i,c)=>i+(c.returnSales||0),0),w=H.reduce((i,c)=>i+(c.cashCol||0),0),_=H.reduce((i,c)=>i+(c.bankCol||0),0),C=H.reduce((i,c)=>i+(c.totalCol||0),0),j=H.reduce((i,c)=>i+(c.isEnhanced&&c.totCustodyIn||0),0),E=H.reduce((i,c)=>i+(c.isEnhanced?c.totFieldExp||0:c.pureExpenses||0),0),$=H.reduce((i,c)=>i+(c.isEnhanced&&c.totAdvFromBox||0),0),Q=H.reduce((i,c)=>i+(c.isEnhanced&&c.totCentralAdv||0),0),W=H.reduce((i,c)=>i+(c.isEnhanced?c.netBoxRequired:c.netBoxDay),0),n=H.reduce((i,c)=>i+(c.isEnhanced?c.totActualHandover||0:c.treasuryTransfers||0),0),u=H.reduce((i,c)=>i+(c.isEnhanced?c.clearanceDiff:0),0);S.push(["Σ","الإجمالي العام للفترة",a,"—",G,r,D,w,_,C,j,E,$,Q,W,n,u,Math.abs(u)<.05?"مطابق ومقفل بالكامل":"يوجد فوارق تسوية"]),Pt({filename:`يومية_المناديب_وحركة_الصناديق_${b}`,title:`كشف تفريغ يوميات المناديب وحركة الصناديق والتوريدات والتسويات (${f}) — ${a}`,headers:m,rows:S})};window.printGeneralReportPDF=()=>{if(!O||!O.reps||!O.reps.length){alert("يرجى عرض التقرير أولاً قبل التصدير أو الطباعة");return}const{reps:f,grand:a,from:h,to:b,mtdStart:R,todayStr:z,repLabel:m}=O,S=window.ERP_COMPANY||{},D=S.name||"مؤسسة أدهام للمواد الغذائية",G="تجارة وتوريد المواد الغذائية بالجملة والتموين — ينبع البحر",r=S.vatNumber||"310123456700003",w=S.crNumber||"4650054321";S.phone;const _=new Date().toLocaleDateString("ar-SA"),C=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});let j="",E="";try{const u=document.getElementById("rdj-gen-chart-target");u&&(j=u.toDataURL("image/png"));const i=document.getElementById("rdj-gen-chart-share");i&&(E=i.toDataURL("image/png"))}catch(u){console.warn("Chart image extract error:",u)}const $=u=>u==null||isNaN(u)?"0.00":new Intl.NumberFormat("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}).format(u),Q=f.map((u,i)=>{const c=i===0&&u.periodSales>0,d=u.targetPct>=100?"#059669":u.targetPct>=80?"#1d4ed8":u.targetPct>=50?"#d97706":"#dc2626",B=u.collectionRate>=90?"#059669":u.collectionRate>=70?"#1d4ed8":"#d97706";return`
      <tr>
        <td style="font-weight:900; color:#475569; font-size:10px;">${i+1}</td>
        <td style="text-align:right; font-weight:900; color:#0f172a; font-size:10.5px;">
          ${c?"🏆 ":""}${u.name}
        </td>
        
        <!-- مبيعات اليوم شامل وقبل -->
        <td style="background:rgba(2,132,199,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#0284c7; font-size:10px;">${$(u.todaySales)}</div>
          <div style="font-size:8px; color:#475569; font-family:monospace; font-weight:700;">قبل: ${$(u.todaySubtotal)}</div>
        </td>

        <!-- تحصيل اليوم بجانب مبيعات اليوم -->
        <td style="background:rgba(245,158,11,0.04); font-family:monospace; font-weight:900; color:#b45309; font-size:10px;">
          ${$(u.todayCol)}
        </td>

        <!-- مبيعات الفترة شامل وقبل -->
        <td style="background:rgba(5,150,105,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#047857; font-size:10px;">${$(u.periodSales)}</div>
          <div style="font-size:8px; color:#0e7490; font-family:monospace; font-weight:700;">قبل: ${$(u.periodSubtotal)}</div>
        </td>

        <td style="font-family:monospace; font-weight:900; font-size:10px; color:#1e293b;">${u.invoiceCount}${u.returnCount>0?` (-${u.returnCount})`:""}</td>
        <td style="font-family:monospace; color:#334155; font-weight:800; font-size:9.5px;">${$(u.avgInvoice)}</td>
        <td style="font-family:monospace; font-weight:900; color:#b45309; font-size:10px;">${$(u.cashCol)}</td>
        <td style="font-family:monospace; font-weight:900; color:#1d4ed8; font-size:10px;">${$(u.bankCol)}</td>
        <td style="font-family:monospace; font-weight:900; color:#1e3a8a; font-size:10.5px;">${$(u.totalCol)}</td>

        <!-- مجمل الربح وهامش الربح للفترة -->
        <td style="font-family:monospace; font-weight:900; color:#047857; font-size:10px; background:rgba(16,185,129,0.06);">
          <div>${$(u.periodProfit||0)}</div>
          <div style="font-size:7.5px; color:#475569; font-weight:700;">تكلفة: ${$(u.periodNetCogs||0)}</div>
          <span style="font-size:8px; color:${u.periodProfit>=0?"#059669":"#dc2626"}; font-weight:800;">(${u.periodMarginPct.toFixed(1)}%)</span>
        </td>

        <!-- مبيعات الشهر MTD شامل وقبل -->
        <td style="background:rgba(79,70,229,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#4338ca; font-size:10px;">${$(u.mtdSales)}</div>
          <div style="font-size:8px; color:#6366f1; font-family:monospace; font-weight:700;">قبل: ${$(u.mtdSubtotal)}</div>
        </td>

        <td style="font-family:monospace; font-weight:800; font-size:10px; color:#334155;">${u.monthlyTarget>0?$(u.monthlyTarget):"—"}</td>
        <td style="font-family:monospace; font-weight:900; color:${d}; font-size:10.5px;">${u.targetPct.toFixed(1)}%</td>
        <td style="font-family:monospace; font-weight:900; color:${B}; font-size:10.5px;">${u.collectionRate.toFixed(1)}%</td>
      </tr>
    `}).join(""),W=window.open("","_blank");if(!W){alert("يرجى السماح بالنوافذ المنبثقة للطباعة أو تصدير الـ PDF");return}const n=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقرير العام لمبيعات ومتحصلات وعمولات المناديب والمستهدف الشهري</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4 landscape; margin: 4mm 5mm; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      font-size: 9.5px; color: #0f172a; background: #fff; direction: rtl; line-height: 1.25;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .report-wrap { width: 100%; max-width: 100%; margin: 0 auto; }
    .royal-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%);
      color: #fff; border-radius: 8px; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; border: 1.5px solid #d97706; box-shadow: 0 4px 12px rgba(15,23,42,0.15); margin-bottom: 5px;
    }
    .co-title-box { display: flex; align-items: center; gap: 10px; }
    .co-logo-circle { width: 38px; height: 38px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1e3a8a; border: 2px solid #d97706; }
    .co-name { font-size: 14px; font-weight: 900; color: #fff; }
    .co-sub  { font-size: 8px; color: #cbd5e1; font-weight: 600; margin-top: 1px; }
    .doc-badge-center { text-align: center; }
    .doc-main-title { font-size: 14px; font-weight: 900; color: #fef08a; }
    .doc-period-text { font-size: 9px; color: #e2e8f0; font-weight: 700; margin-top: 1px; }
    .meta-box-left { text-align: left; font-size: 8px; color: #cbd5e1; line-height: 1.35; }
    .meta-box-left strong { color: #fff; }

    .kpi-row { display: flex; gap: 5px; margin-bottom: 5px; }
    .kpi-item { flex: 1; background: #f8fafc; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px 5px; text-align: center; border-top: 3px solid #2563eb; }
    .kpi-item.cyan    { border-top-color: #0891b2; }
    .kpi-item.green   { border-top-color: #059669; }
    .kpi-item.purple  { border-top-color: #7c3aed; }
    .kpi-item.blue    { border-top-color: #2563eb; }
    .kpi-item.amber   { border-top-color: #d97706; }
    .kpi-item.emerald { border-top-color: #047857; }
    .kpi-label { font-size: 8px; font-weight: 800; color: #334155; margin-bottom: 1px; }
    .kpi-val   { font-size: 12.5px; font-weight: 900; font-family: monospace; }
    .kpi-before { font-size: 8px; font-weight: 800; margin-top: 1px; }
    .kpi-note  { font-size: 7.5px; color: #64748b; font-weight: 700; }

    .charts-row { display: flex; gap: 6px; margin-bottom: 5px; }
    .chart-box { flex: 1; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px; background: #fff; text-align: center; }
    .chart-box-title { font-size: 8.5px; font-weight: 900; color: #1e3a8a; margin-bottom: 2px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px; }
    .chart-img { max-height: 85px; width: auto; max-width: 100%; object-fit: contain; }

    .table-card { border: 1.5px solid #0f172a; border-radius: 6px; overflow: hidden; margin-bottom: 6px; width: 100%; }
    .tbl-banner { background: #0f172a; color: #fff; padding: 4px 10px; font-size: 9px; font-weight: 800; display: flex; justify-content: space-between; align-items: center; }
    table.rep-tbl { width: 100%; border-collapse: collapse; font-size: 9.8px; table-layout: fixed; }
    table.rep-tbl th { background: #1e293b; color: #fff; padding: 5px 2px; font-weight: 900; text-align: center; border: 1px solid #334155; white-space: normal; line-height: 1.2; word-break: keep-all; font-size: 8.8px; }
    table.rep-tbl td { padding: 4px 2px; text-align: center; border: 1px solid #cbd5e1; white-space: nowrap; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; font-size: 9.8px; }
    table.rep-tbl tbody tr:nth-child(even) { background: #f8fafc; }
    table.rep-tbl tfoot tr { background: #f1f5f9; font-weight: 900; border-top: 2.5px solid #0f172a; }
    table.rep-tbl tfoot td { padding: 5px 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; }

    .footer-signatures { display: flex; justify-content: space-between; gap: 16px; margin-top: 6px; border-top: 1.5px dashed #94a3b8; padding-top: 5px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-role  { font-size: 9px; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; }
    .sig-name  { font-size: 8px; color: #64748b; }

    @media print {
      body { zoom: 100%; }
      .report-wrap { width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="royal-header">
      <div class="co-title-box">
        <div class="co-logo-circle">🏢</div>
        <div>
          <div class="co-name">${D}</div>
          <div class="co-sub">${G}</div>
        </div>
      </div>
      <div class="doc-badge-center">
        <div class="doc-main-title">التقرير التنفيذي الشامل لأداء ومبيعات وهوامش أرباح المناديب والمستهدف الشهري</div>
        <div class="doc-period-text">📅 الفترة: من ${st(h)} إلى ${st(b)} &nbsp;|&nbsp; النطاق: ${m} &nbsp;|&nbsp; هامش الربح الإجمالي: ${a.periodMarginPct.toFixed(1)}%</div>
      </div>
      <div class="meta-box-left">
        <div><strong>الرقم الضريبي:</strong> ${r}</div>
        <div><strong>السجل التجاري:</strong> ${w}</div>
        <div><strong>تاريخ الطباعة:</strong> ${_} — ${C}</div>
      </div>
    </div>

    <!-- كروت KPI السريعة مع قبل الضريبة وتحصيل اليوم -->
    <div class="kpi-row">
      <div class="kpi-item cyan">
        <div class="kpi-label">⚡ مبيعات اليوم (صافي)</div>
        <div class="kpi-val" style="color:#0891b2;">${e(a.todaySales)}</div>
        <div class="kpi-before" style="color:#0284c7;">قبل: ${e(a.todaySubtotal)}</div>
      </div>
      <div class="kpi-item amber">
        <div class="kpi-label">💵 تحصيل اليوم</div>
        <div class="kpi-val" style="color:#d97706;">${e(a.todayCol)}</div>
        <div class="kpi-note">نقد: ${e(a.todayCashCol)} • شبكة: ${e(a.todayBankCol)}</div>
      </div>
      <div class="kpi-item green">
        <div class="kpi-label">📈 صافي مبيعات الفترة</div>
        <div class="kpi-val" style="color:#059669;">${e(a.periodSales)}</div>
        <div class="kpi-before" style="color:#047857;">قبل: ${e(a.periodSubtotal)}</div>
      </div>
      <div class="kpi-item blue">
        <div class="kpi-label">💳 إجمالي التحصيلات والربحية</div>
        <div class="kpi-val" style="color:#2563eb;">${e(a.totalCol)}</div>
        <div class="kpi-before" style="color:#047857;">📈 مجمل أرباح الفترة: ${e(a.periodProfit||0)} (${a.periodMarginPct.toFixed(1)}%)</div>
      </div>
      <div class="kpi-item purple">
        <div class="kpi-label">🗓️ مبيعات الشهر MTD</div>
        <div class="kpi-val" style="color:#7c3aed;">${e(a.mtdSales)}</div>
        <div class="kpi-before" style="color:#6366f1;">قبل: ${e(a.mtdSubtotal)}</div>
      </div>
      <div class="kpi-item emerald">
        <div class="kpi-label">🎯 تحقيق المستهدف</div>
        <div class="kpi-val" style="color:#059669;">${a.targetPct.toFixed(1)}%</div>
        <div class="kpi-note">كفاءة التحصيل: ${a.collectionRate.toFixed(1)}%</div>
      </div>
    </div>

    ${j||E?`
      <div class="charts-row">
        ${j?`
          <div class="chart-box" style="flex:2;">
            <div class="chart-box-title">📊 المبيعات التراكمية (MTD) مقابل الهدف الشهري (Target) لكل مندوب</div>
            <img src="${j}" class="chart-img" alt="Sales vs Target" />
          </div>
        `:""}
        ${E?`
          <div class="chart-box" style="flex:1;">
            <div class="chart-box-title">🥧 الحصة البيعية للمناديب (Market Share)</div>
            <img src="${E}" class="chart-img" alt="Market Share" />
          </div>
        `:""}
      </div>
    `:""}

    <div class="table-card">
      <div class="tbl-banner">
        <span>📋 جدول أداء ومبيعات وتحصيلات وهوامش أرباح المناديب والمستهدف الشهري</span>
        <span style="color:#fef08a;">(جميع المبالغ بالريال السعودي ر.س)</span>
      </div>
      <table class="rep-tbl">
        <colgroup>
          <col style="width:2.5%;">
          <col style="width:11%;">
          <col style="width:8%;">
          <col style="width:6.5%;">
          <col style="width:8%;">
          <col style="width:4.5%;">
          <col style="width:6%;">
          <col style="width:6.5%;">
          <col style="width:6.5%;">
          <col style="width:7%;">
          <col style="width:6.5%;">
          <col style="width:8.5%;">
          <col style="width:7.5%;">
          <col style="width:5%;">
          <col style="width:6%;">
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:right;">👤 المندوب</th>
            <th>⚡ ${h===b?`مبيعات (${st(b)})`:"مبيعات اليوم"}</th>
            <th>💵 ${h===b?`تحصيل (${st(b)})`:"تحصيل اليوم"}</th>
            <th>📈 صافي الفترة</th>
            <th>🧾 الفواتير</th>
            <th>📊 متوسط الفاتورة</th>
            <th>💵 تحصيل نقدي</th>
            <th>🏦 تحصيل شبكة</th>
            <th>💰 إجمالي التحصيل</th>
            <th style="background:#065f46; color:#fef08a;">📈 مجمل الربح (الهامش %)</th>
            <th>🗓️ مبيعات الشهر</th>
            <th>🎯 الهدف الشهري</th>
            <th>🏁 نسبة التارجت</th>
            <th>⚖️ نسبة التحصيل</th>
          </tr>
        </thead>
        <tbody>${Q}</tbody>
        <tfoot>
          <tr>
            <td style="font-size:11px; font-weight:900;">Σ</td>
            <td style="text-align:right; font-weight:900; color:#1e3a8a; font-size:11px;">الإجمالي العام</td>
            
            <td style="background:rgba(2,132,199,0.04);">
              <div style="font-family:monospace; color:#0284c7; font-weight:900; font-size:10.5px;">${$(a.todaySales)}</div>
              <div style="font-size:8px; color:#475569; font-family:monospace; font-weight:700;">قبل: ${$(a.todaySubtotal)}</div>
            </td>

            <td style="background:rgba(245,158,11,0.04); font-family:monospace; font-weight:900; color:#b45309; font-size:10.5px;">
              ${$(a.todayCol)}
            </td>

            <td style="background:rgba(5,150,105,0.04);">
              <div style="font-family:monospace; color:#047857; font-weight:900; font-size:10.5px;">${$(a.periodSales)}</div>
              <div style="font-size:8px; color:#0e7490; font-family:monospace; font-weight:700;">قبل: ${$(a.periodSubtotal)}</div>
            </td>

            <td style="font-family:monospace; font-weight:900; font-size:10.5px; color:#1e293b;">${a.invoiceCount}${a.returnCount>0?` (-${a.returnCount})`:""}</td>
            <td style="font-family:monospace; font-weight:800; font-size:10px; color:#334155;">${$(a.avgInvoice)}</td>
            <td style="font-family:monospace; color:#b45309; font-weight:900; font-size:10.5px;">${$(a.cashCol)}</td>
            <td style="font-family:monospace; color:#1d4ed8; font-weight:900; font-size:10.5px;">${$(a.bankCol)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-weight:900; font-size:11px;">${$(a.totalCol)}</td>

            <!-- إجمالي مجمل الربح للشركة -->
            <td style="font-family:monospace; color:#047857; font-weight:900; font-size:10.5px; background:rgba(16,185,129,0.08);">
              <div>${$(a.periodProfit||0)}</div>
              <div style="font-size:8px; color:#334155; font-weight:700;">تكلفة: ${$(a.periodNetCogs||0)}</div>
              <span style="font-size:8.5px; color:${a.periodProfit>=0?"#059669":"#dc2626"}; font-weight:800;">(${a.periodMarginPct.toFixed(1)}%)</span>
            </td>

            <td style="background:rgba(79,70,229,0.04);">
              <div style="font-family:monospace; color:#4338ca; font-weight:900; font-size:10.5px;">${$(a.mtdSales)}</div>
              <div style="font-size:8px; color:#6366f1; font-family:monospace; font-weight:700;">قبل: ${$(a.mtdSubtotal)}</div>
            </td>

            <td style="font-family:monospace; font-weight:900; font-size:10.5px; color:#334155;">${$(a.monthlyTarget)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-weight:900; font-size:11px;">${a.targetPct.toFixed(1)}%</td>
            <td style="font-family:monospace; color:#047857; font-weight:900; font-size:11px;">${a.collectionRate.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer-signatures">
      <div class="sig-block">
        <div class="sig-role">إعداد مشرف المبيعات</div>
        <div class="sig-name">الاسم والتوقيع: __________________</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">تدقيق الإدارة المالية والحسابات</div>
        <div class="sig-name">الاسم والتوقيع: __________________</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">اعتماد المدير العام / الرئيس التنفيذي</div>
        <div class="sig-name">الختم والتوقيع: __________________</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  <\/script>
</body>
</html>`;W.document.open(),W.document.write(n),W.document.close()};window.printRepDailyReport=()=>{if(!H||H.length===0){alert("يرجى عرض اليومية أولاً قبل الطباعة");return}const{dateRange:f,repLabel:a,custMap:h,repMap:b,repBoxNameMap:R}=Mt,z=window.ERP_COMPANY||{},m=z.name||"مؤسسة أدهام للمواد الغذائية",S=z.activity||"تجارة وتوريد المواد الغذائية بالجملة والتموين — ينبع البحر",D=z.vatNumber||"";z.crNumber;const G=new Date().toLocaleDateString("ar-SA"),r=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}),w=window.open("","_blank");if(!w){alert("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير");return}const _=H.filter(n=>{const u=n.invoices&&n.invoices.length>0,i=n.receipts&&n.receipts.length>0,c=n.cashOuts&&n.cashOuts.length>0,d=n.returns&&n.returns.length>0,B=Math.abs(n.totalSales||0)>.001||Math.abs(n.totalCol||0)>.001||Math.abs(n.totalCashOut||0)>.001;return u||i||c||d||B}),C=_.length>0?_:H,j=C.length>1,E=j?C.length+1:1;let $="";if(j){const n=C.reduce((i,c)=>(i.totalSales+=c.totalSales||0,i.cashCol+=c.cashCol||0,i.bankCol+=c.bankCol||0,i.totalCol+=c.totalCol||0,i.pureExpenses+=c.pureExpenses||0,i.totalCashOut+=c.totalCashOut||0,i.netBoxTotal+=c.netBoxDay||0,i.totActualHandover+=c.isEnhanced?c.totActualHandover||0:c.treasuryTransfers||0,i.clearanceDiff+=c.isEnhanced&&c.clearanceDiff||0,i.invCount+=c.invoices?.length||0,i.rcCount+=c.receipts?.length||0,i.outCount+=c.cashOuts?.length||0,i),{totalSales:0,cashCol:0,bankCol:0,totalCol:0,pureExpenses:0,totalCashOut:0,netBoxTotal:0,totActualHandover:0,clearanceDiff:0,invCount:0,rcCount:0,outCount:0}),u=C.map((i,c)=>{const d=b[i.repId]||i.repId||"مندوب",B=i.isEnhanced?i.totActualHandover||0:i.treasuryTransfers||0,o=i.isEnhanced&&i.clearanceDiff||0,p=Math.abs(o)<.05,L=p?"✅ مقفل":o<0?"⚠️ متبقي":"ℹ️ فائض",v=p?"#059669":o<0?"#dc2626":"#2563eb";return`
        <tr>
          <td style="font-weight:bold; color:#64748b; font-size:10px;">${c+1}</td>
          <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:10px;">${i.date}</td>
          <td style="text-align:right; font-weight:800; font-size:10.5px;">${d}</td>
          <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left; font-size:10px;">${e(i.totalSales)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#d97706; text-align:left; font-size:10px;">${e(i.cashCol)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left; font-size:10px;">${e(i.bankCol)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left; font-size:10px;">${e(i.pureExpenses)}</td>
          <td style="font-family:monospace; font-weight:900; color:#0f172a; text-align:left; background:rgba(15,23,42,0.04); font-size:10.5px;">${e(i.netBoxDay)}</td>
          <td style="font-family:monospace; font-weight:900; color:#0284c7; text-align:left; background:rgba(2,132,199,0.06); font-size:10.5px;">${e(B)}</td>
          <td style="font-family:monospace; font-weight:900; color:${v}; text-align:left; font-size:10.5px;">${e(o)}</td>
          <td style="font-size:10px; font-weight:900; color:${v}; text-align:center;">${L}</td>
        </tr>
      `}).join("");$=`
      <div class="print-sheet">
        <div class="print-header">
          <div style="text-align:right;">
            <div class="co-name">${m}</div>
            <div class="co-sub">${S}</div>
          </div>
          <div style="text-align:center;">
            <div class="report-title">ملخص حركة يوميات المناديب وتوريدات الخزينة والتسوية</div>
            <div class="report-period">📅 الفترة: ${f} &nbsp;|&nbsp; النطاق: ${a}</div>
          </div>
          <div class="meta-box">
            <div>${G} — ${r}</div>
            ${D?`<div>الرقم الضريبي: ${D}</div>`:""}
            <div class="page-badge">الصفحة 1 من ${E}</div>
          </div>
        </div>

        <div class="rep-card-header">
          <div>
            <div class="rep-title">📊 الملخص الإجمالي التراكمي لحركة وتصفية الفترة</div>
            <div class="rep-sub">👤 النطاق: ${a} &nbsp;|&nbsp; 🗓️ عدد الأيام النشطة: ${C.length} يوم عمل &nbsp;|&nbsp; 🤝 المورد فعلياً للجاري/الخزينة: <strong style="color:#fef08a; font-family:monospace;">${e(n.totActualHandover)}</strong></div>
          </div>
          <div style="text-align:left;">
            <div class="net-box-label">صافي النقد المفترض توريده:</div>
            <div class="net-box-val">${e(n.netBoxTotal)}</div>
          </div>
        </div>

        <div class="kpi-print-row">
          <div class="kpi-box" style="border-top:3.5px solid #059669;">
            <div class="kpi-lbl">📈 إجمالي المبيعات</div>
            <div class="kpi-val" style="color:#059669;">${e(n.totalSales)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${n.invCount} فاتورة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #d97706;">
            <div class="kpi-lbl">💵 التحصيل النقدي</div>
            <div class="kpi-val" style="color:#d97706;">${e(n.cashCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #dc2626;">
            <div class="kpi-lbl">💸 المصروفات والسلف (-)</div>
            <div class="kpi-val" style="color:#dc2626;">${e(n.pureExpenses)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${n.outCount} حركة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #0f172a; background:rgba(15,23,42,0.03);">
            <div class="kpi-lbl">🏦 صافي المفترض توريده</div>
            <div class="kpi-val" style="color:#0f172a;">${e(n.netBoxTotal)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #0284c7; background:rgba(2,132,199,0.06);">
            <div class="kpi-lbl">🤝 المورد فعلياً للجاري/الخزينة</div>
            <div class="kpi-val" style="color:#0284c7;">${e(n.totActualHandover)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid ${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; background:rgba(5,150,105,0.06);">
            <div class="kpi-lbl">⚖️ الرصيد المتبقي بالصناديق</div>
            <div class="kpi-val" style="color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"};">${e(n.clearanceDiff)}</div>
            <div style="font-size:9.5px; color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; font-weight:800; margin-top:2px;">${Math.abs(n.clearanceDiff)<.05?"✅ مطابق ومقفل 100%":"يوجد فوارق"}</div>
          </div>
        </div>

        <div class="table-card">
          <div class="tbl-head-banner s">
            <span>📋 كشف تفريغ اليوميات المجمعة والتوريدات الفعلية للأيام النشطة للفترة (${C.length} يوم)</span>
            <span style="font-family:monospace; font-size:11.5px; font-weight:900;">المورد الفعلي: ${e(n.totActualHandover)}</span>
          </div>
          <table class="data-tbl">
            <thead>
              <tr>
                <th style="width:26px;">#</th>
                <th style="width:78px;">التاريخ</th>
                <th style="text-align:right;">المندوب</th>
                <th style="width:85px; text-align:left;">المبيعات</th>
                <th style="width:80px; text-align:left;">تحصيل نقد</th>
                <th style="width:80px; text-align:left;">تحصيل بنك</th>
                <th style="width:75px; text-align:left;">المصروفات</th>
                <th style="width:88px; text-align:left; background:#1e293b;">المطلوب توريده</th>
                <th style="width:92px; text-align:left; background:#0369a1;">المورد للجاري/الخزينة</th>
                <th style="width:82px; text-align:left; background:#065f46;">المتبقي بالصندوق</th>
                <th style="width:78px; text-align:center;">حالة الإقفال</th>
              </tr>
            </thead>
            <tbody>${u}</tbody>
            <tfoot>
              <tr>
                <td>Σ</td>
                <td colspan="2" style="text-align:right;">الإجمالي العام للفترة</td>
                <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${e(n.totalSales)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#d97706; text-align:left;">${e(n.cashCol)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left;">${e(n.bankCol)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">${e(n.pureExpenses)}</td>
                <td style="font-family:monospace; font-weight:900; color:#0f172a; text-align:left; background:rgba(15,23,42,0.06); font-size:11.5px;">${e(n.netBoxTotal)}</td>
                <td style="font-family:monospace; font-weight:900; color:#0284c7; text-align:left; background:rgba(2,132,199,0.1); font-size:11.5px;">${e(n.totActualHandover)}</td>
                <td style="font-family:monospace; font-weight:900; color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; text-align:left; font-size:11.5px;">${e(n.clearanceDiff)}</td>
                <td style="font-size:10px; font-weight:900; color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; text-align:center;">${Math.abs(n.clearanceDiff)<.05?"✅ مقفل ومطابق":"يوجد فوارق"}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="formula-strip" style="background:#f8fafc; border:1.5px solid #0284c7; flex-direction:column; gap:6px; align-items:stretch; border-radius:8px; padding:8px 12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>💵 إجمالي التحصيل النقدي: <strong style="color:#059669; font-family:monospace; font-size:12.5px;">${e(n.cashCol)}</strong></div>
            <div style="color:#64748b; font-weight:bold;">➖</div>
            <div>💸 إجمالي المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace; font-size:12.5px;">-${e(n.pureExpenses)}</strong></div>
            <div style="color:#64748b; font-weight:bold;">🟰</div>
            <div>🏦 صافي النقد المفترض توريده: <strong style="color:#0f172a; font-family:monospace; font-size:13px;">${e(n.netBoxTotal)}</strong></div>
          </div>
          <div style="border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
            <div>🤝 المبالغ الموردة فعلياً للجاري / الخزينة: <strong style="color:#0284c7; font-family:monospace; font-size:13px;">${e(n.totActualHandover)}</strong></div>
            <div>فارق الإقفال والرصيد المتبقي: <strong style="color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; font-family:monospace; font-size:13px;">${e(n.clearanceDiff)}</strong></div>
            <div>حالة التصفية: <strong style="color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; font-size:11.5px;">${Math.abs(n.clearanceDiff)<.05?"✅ تم التوريد والإقفال بالكامل (مطابق 100%)":"⚠️ يوجد مبالغ متبقية بالصناديق"}</strong></div>
          </div>
        </div>

        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-title">إعداد وتوريد المندوب المسلّم</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">استلام أمين الخزينة / الصندوق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">اعتماد الإدارة المالية والتدقيق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">الختم والتوقيع: __________________</div>
        </div>
      </div>
    `}const Q=C.map((n,u)=>{const i=j?u+2:u+1,c=b[n.repId]||n.repId||"مندوب",d=R[n.repId]||"صندوق المندوب",B=n.invoices.length===0?'<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد فواتير مبيعات مسجلة في هذا اليوم</td></tr>':n.invoices.map(v=>`
          <tr>
            <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:11.5px;">${v.code||v.invoiceNumber||v.id.slice(-6)}</td>
            <td style="text-align:right; font-weight:700; font-size:11.5px;">${h[v.customerId]||"عميل"}</td>
            <td style="font-size:11px;">${v.paymentMethod==="cash"?"💵 نقدي":v.paymentMethod==="bank"?"🏦 تحويل / شبكة":"📑 آجل"}</td>
            <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left; font-size:12px;">${e(v.totalWithVat||v.total||0)}</td>
          </tr>
        `).join("");let o="";if(n.returns&&n.returns.length>0){let v=0;const N=n.returns.map(t=>{const s=parseFloat(t.totalWithVat||t.total||0);return v+=s,`
          <tr>
            <td style="font-family:monospace; font-weight:bold; color:#dc2626; font-size:11.5px;">${t.number||t.creditNoteNumber||t.id.slice(-6)}</td>
            <td style="text-align:right; font-weight:700; font-size:11.5px;">${h[t.customerId]||t.customerName||"عميل"}</td>
            <td><span style="background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3); padding:2px 8px; border-radius:4px; font-weight:bold; font-size:10.5px;">↩️ إشعار دائن</span></td>
            <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left; font-size:12px;">-${e(s)}</td>
          </tr>
        `}).join("");o=`
        <div class="table-card" style="border-color:#fca5a5;">
          <div class="tbl-head-banner r">
            <span>↩️ مردودات المبيعات (إشعارات دائنة)</span>
            <span style="font-family:monospace; font-size:12px;">-${e(v)}</span>
          </div>
          <table class="data-tbl">
            <thead><tr><th style="width:120px;">رقم الإشعار</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">النوع</th><th style="width:130px; text-align:left;">المبلغ المسترد</th></tr></thead>
            <tbody>${N}</tbody>
            <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المردودات (${n.returns.length} إشعار دائن)</td><td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">-${e(v)}</td></tr></tfoot>
          </table>
        </div>
      `}const p=n.receipts.length===0?'<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد تحصيلات أو مقبوضات مسجلة في هذا اليوم</td></tr>':n.receipts.map(v=>{const N=v.method||v.paymentMethod||"cash",t=parseFloat(v.amount||0);return`
            <tr>
              <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:11.5px;">${v.code||v.id.slice(-6)}</td>
              <td style="text-align:right; font-weight:700; font-size:11.5px;">${h[v.targetId]||v.accountName||"عميل"}</td>
              <td style="font-size:11px;">${gt(N)?"🏦 بنك / شبكة":"💵 نقدي"}</td>
              <td style="font-family:monospace; font-weight:bold; color:${gt(N)?"#2563eb":"#d97706"}; text-align:left; font-size:12px;">${e(t)}</td>
            </tr>
          `}).join(""),L=n.cashOuts.length===0?'<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد مصروفات أو مسحوبات نقدية من الصندوق في هذا اليوم</td></tr>':n.cashOuts.map(v=>{const N=v.isTransfer?"background:rgba(14,165,233,0.12); color:#0369a1; border:1px solid rgba(14,165,233,0.3);":"background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3);";return`
            <tr>
              <td style="font-family:monospace; font-size:11px; color:#64748b; font-weight:bold;">${v.refNumber}</td>
              <td style="text-align:right; font-weight:700; font-size:11.5px; color:${v.isTransfer?"#0369a1":"#991b1b"};">${v.description}</td>
              <td><span style="${N} padding:2px 8px; border-radius:4px; font-size:10.5px; font-weight:bold;">${v.typeBadge}</span></td>
              <td style="font-family:monospace; font-weight:bold; color:${v.isTransfer?"#0369a1":"#dc2626"}; text-align:left; font-size:12px;">${e(v.amount)}</td>
            </tr>
          `}).join("");return`
      <div class="print-sheet">
        <div class="print-header">
          <div style="text-align:right;">
            <div class="co-name">${m}</div>
            <div class="co-sub">${S}</div>
          </div>
          <div style="text-align:center;">
            <div class="report-title">يومية المندوب وخزينة المبيعات</div>
            <div class="report-period">📅 التاريخ: ${n.date} &nbsp;|&nbsp; المندوب: ${c}</div>
          </div>
          <div class="meta-box">
            <div>${G} — ${r}</div>
            ${D?`<div>الرقم الضريبي: ${D}</div>`:""}
            <div class="page-badge">الصفحة ${i} من ${E}</div>
          </div>
        </div>

        <div class="rep-card-header">
          <div>
            <div class="rep-title">👤 المندوب المسؤول: ${c}</div>
            <div class="rep-sub">📅 تاريخ اليومية: ${n.date} &nbsp;|&nbsp; 📦 الصندوق: ${d}</div>
          </div>
          <div style="text-align:left;">
            <div class="net-box-label">${n.isEnhanced?"صافي النقد المفترض توريده:":"صافي نقدية العهدة اليوم:"}</div>
            <div class="net-box-val">${e(n.isEnhanced?n.netBoxRequired:n.netBoxDay)}</div>
          </div>
        </div>

        <div class="kpi-print-row">
          <div class="kpi-box" style="border-top:3.5px solid #059669;">
            <div class="kpi-lbl">📈 إجمالي المبيعات</div>
            <div class="kpi-val" style="color:#059669;">${e(n.totalSales)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${n.invoices.length} فاتورة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #d97706;">
            <div class="kpi-lbl">💵 التحصيل النقدي</div>
            <div class="kpi-val" style="color:#d97706;">${e(n.cashCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #2563eb;">
            <div class="kpi-lbl">🏦 تحصيل بنك / شبكة</div>
            <div class="kpi-val" style="color:#2563eb;">${e(n.bankCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #dc2626;">
            <div class="kpi-lbl">💸 المصروفات والسلف (-)</div>
            <div class="kpi-val" style="color:#dc2626;">${e(n.pureExpenses)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${n.cashOuts.length} حركة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #047857; background:rgba(4,120,87,0.06);">
            <div class="kpi-lbl">🏦 ${n.isEnhanced?"المطلوب توريده":"صافي النقد للتوريد"}</div>
            <div class="kpi-val" style="color:#047857;">${e(n.isEnhanced?n.netBoxRequired:n.netBoxDay)}</div>
          </div>
        </div>

        ${n.isEnhanced&&n.totCentralAdv>0?`
          <div style="background:#f0f9ff; border:1.2px solid #38bdf8; border-radius:6px; padding:6px 10px; margin-bottom:8px; font-size:10px; font-weight:700; color:#0369a1; page-break-inside:avoid;">
            💳 <strong>سلف شخصية من الخزينة المركزية (استقطاع راتب شهري):</strong> ${e(n.totCentralAdv)} — (صُرفت من الخزينة المركزية، ولا تخصم من نقدية توريد سيارة المبيعات الميدانية).
          </div>
        `:""}

        <div class="tables-section">
          <!-- 1. فواتير المبيعات -->
          <div class="table-card">
            <div class="tbl-head-banner s">
              <span>📈 1. فواتير المبيعات الصادرة</span>
              <span style="font-family:monospace; font-size:12px;">${e(n.totalSales)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:105px;">الدفع</th><th style="width:125px; text-align:left;">المبلغ شامل الضريبة</th></tr></thead>
              <tbody>${B}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">الإجمالي (${n.invoices.length} فاتورة)</td><td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${e(n.totalSales)}</td></tr></tfoot>
            </table>
          </div>

          <!-- مردودات المبيعات إن وجدت -->
          ${o}

          <!-- 2. التحصيلات والمقبوضات -->
          <div class="table-card">
            <div class="tbl-head-banner c">
              <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
              <span style="font-family:monospace; font-size:12px;">${e(n.totalCol)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:105px;">طريقة التحصيل</th><th style="width:125px; text-align:left;">المبلغ المحصل</th></tr></thead>
              <tbody>${p}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي التحصيل (${n.receipts.length} سند) &nbsp;—&nbsp; <span style="color:#d97706;">💵 نقدي: ${e(n.cashCol)}</span> &nbsp;•&nbsp; <span style="color:#2563eb;">🏦 بنك: ${e(n.bankCol)}</span></td><td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left;">${e(n.totalCol)}</td></tr></tfoot>
            </table>
          </div>

          <!-- 3. المصروفات والسلف -->
          <div class="table-card">
            <div class="tbl-head-banner e">
              <span>💸 3. المصروفات والسلف ومسحوبات الصندوق</span>
              <span style="font-family:monospace; font-size:12px;">${e(n.totalCashOut)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">المرجع</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:105px;">النوع</th><th style="width:125px; text-align:left;">المبلغ المنصرف</th></tr></thead>
              <tbody>${L}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف (${n.cashOuts.length} حركة)</td><td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">${e(n.totalCashOut)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        ${n.isEnhanced?`
          <div class="formula-strip" style="background:#f8fafc; border:1.5px solid #0284c7; flex-direction:column; gap:6px; align-items:stretch;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>💵 التحصيل النقدي: <strong style="color:#059669; font-family:monospace;">${e(n.cashCol)}</strong></div>
              ${n.totCustodyIn>0?`<div>➕ عهدة: <strong style="color:#0284c7; font-family:monospace;">+${e(n.totCustodyIn)}</strong></div>`:""}
              <div>➖ المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace;">-${e(n.pureExpenses)}</strong></div>
              <div>🟰 صافي المطلوب توريده: <strong style="color:#0f172a; font-family:monospace; font-size:13.5px;">${e(n.netBoxRequired)}</strong></div>
            </div>
            <div style="border-top:1px dashed #cbd5e1; padding-top:4px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
              <div>🤝 المورد الفعلي للجاري/الخزينة: <strong style="color:#0284c7; font-family:monospace;">${e(n.totActualHandover)}</strong></div>
              <div>فارق الإقفال: <strong style="color:${Math.abs(n.clearanceDiff)<.05?"#059669":"#dc2626"}; font-family:monospace;">${e(n.clearanceDiff)}</strong></div>
              <div>حالة الإقفال: <strong>${n.clearanceStatus==="MATCHED"?"✅ مطابق ومقفل بالكامل":n.clearanceStatus==="REMAINING"?"⚠️ متبقي في ذمة المندوب":"ℹ️ توريد فائض"}</strong></div>
            </div>
          </div>
        `:`
          <div class="formula-strip">
            <div>💵 التحصيل النقدي: <strong style="color:#059669; font-family:monospace; font-size:13.5px;">${e(n.cashCol)}</strong></div>
            <div style="color:#64748b; font-weight:bold; font-size:15px;">➖</div>
            <div>💸 المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace; font-size:13.5px;">${e(n.pureExpenses)}</strong></div>
            <div style="color:#64748b; font-weight:bold; font-size:15px;">🟰</div>
            <div>🏦 صافي النقدية المتاح للتوريد: <strong style="color:#047857; font-family:monospace; font-size:14.5px;">${e(n.netBoxDay)}</strong></div>
          </div>
          ${n.treasuryTransfers>0?`<div style="font-size:11px; color:#0369a1; font-weight:bold; text-align:center; margin-bottom:8px;">(تم توريد مبلغ ${e(n.treasuryTransfers)} إلى جاري المالك/الخزينة الرئيسية)</div>`:""}
        `}

        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-title">توقيع المندوب المسلّم</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">توقيع أمين الصندوق / الخزينة</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">اعتماد الإدارة المالية والتدقيق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">الختم والتوقيع: __________________</div>
          </div>
        </div>
      </div>
    `}).join(""),W=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>يومية المندوب وخزينة المبيعات — ${a}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11px;
      color: #0f172a;
      background: #fff;
      direction: rtl;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-sheet {
      width: 100%;
      max-width: 195mm;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
      padding-bottom: 12px;
    }
    .print-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .co-name {
      font-size: 16px;
      font-weight: 900;
      color: #1e3a8a;
      line-height: 1.2;
    }
    .co-sub {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .report-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .report-period {
      font-size: 11px;
      font-weight: 800;
      color: #1e3a8a;
      margin-top: 3px;
    }
    .meta-box {
      text-align: left;
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      line-height: 1.4;
    }
    .page-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 800;
      color: #1e3a8a;
      margin-top: 3px;
    }

    .rep-card-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
      color: #fff;
      padding: 9px 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border: 1.5px solid #d97706;
      box-shadow: 0 2px 6px rgba(15,23,42,0.1);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rep-title {
      font-size: 15px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.2px;
    }
    .rep-sub {
      font-size: 11px;
      color: #e2e8f0;
      font-weight: 600;
      margin-top: 3px;
    }
    .net-box-label {
      font-size: 11px;
      color: #e2e8f0;
      font-weight: 700;
    }
    .net-box-val {
      font-size: 18px;
      font-weight: 900;
      font-family: monospace;
      color: #fef08a;
      line-height: 1.2;
    }

    .kpi-print-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .kpi-box {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 7px 6px;
      text-align: center;
      background: #f8fafc;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .kpi-lbl {
      font-size: 10.5px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 2px;
    }
    .kpi-val {
      font-size: 14.5px;
      font-weight: 900;
      font-family: monospace;
      line-height: 1.2;
    }

    .tables-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 10px;
    }
    .table-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .tbl-head-banner {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 900;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tbl-head-banner.s {
      background: #dcfce7;
      color: #166534;
      border-bottom: 1.5px solid #86efac;
    }
    .tbl-head-banner.c {
      background: #dbeafe;
      color: #1e40af;
      border-bottom: 1.5px solid #93c5fd;
    }
    .tbl-head-banner.e {
      background: #fee2e2;
      color: #991b1b;
      border-bottom: 1.5px solid #fca5a5;
    }
    .tbl-head-banner.r {
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1.5px solid #fcd34d;
    }

    .data-tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .data-tbl thead {
      display: table-header-group;
    }
    .data-tbl tfoot {
      display: table-footer-group;
    }
    .data-tbl tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .data-tbl th {
      background: #0f172a;
      color: #fff;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      border: 1px solid #1e293b;
      white-space: nowrap;
    }
    .data-tbl td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: center;
      font-weight: 600;
      color: #0f172a;
      vertical-align: middle;
    }
    .data-tbl tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .data-tbl tfoot td {
      background: #f1f5f9;
      font-weight: 900;
      font-size: 11.5px;
      border-top: 2px solid #0f172a;
      padding: 6px 8px;
    }

    .formula-strip {
      background: #f0fdf4;
      border: 1.5px solid #10b981;
      border-radius: 8px;
      padding: 9px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signatures-grid {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding-top: 10px;
      border-top: 1.5px dashed #cbd5e1;
      margin-top: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-col {
      flex: 1;
      text-align: center;
    }
    .sig-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 24px;
    }
    .sig-line {
      font-size: 11px;
      color: #94a3b8;
      border-bottom: 1px dotted #94a3b8;
      width: 80%;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  ${$}
  ${Q}
  <script>
    window.onload = function() {
      window.print();
    };
  <\/script>
</body>
</html>`;w.document.open(),w.document.write(W),w.document.close()};export{de as render};
