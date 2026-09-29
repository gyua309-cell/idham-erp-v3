import{d as P,C as O,f as e,b as et,H as ft}from"./index-CnctmNGr.js";import{getDocs as L,collection as W,updateDoc as gt,doc as mt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let rt="general",$=[],ot={},lt={},st={},at={},it={},Q=[],ht={},ct={},G=null,X={};async function _t(l){const a=new Date().toISOString().split("T")[0],b=a.slice(0,8)+"01";l.innerHTML=`
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
          <input type="date" id="rdj-from" class="rdj-inp font-bold mono" value="${b}" />
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
          <button id="btn-gen-excel" class="rdj-btn-green gen-only" onclick="window.exportGeneralReportExcel()">📥 تصدير Excel</button>
          <button id="btn-gen-pdf" class="rdj-btn-royal gen-only" onclick="window.printGeneralReportPDF()">👑 تصدير PDF ملكي</button>

          <!-- أزرار خاصة باليومية التفصيلية -->
          <button id="btn-daily-print" class="rdj-btn-s daily-only" style="display:none;" onclick="window.printRepDailyReport()">🖨️ طباعة اليومية (A4 مستقل)</button>
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
    </style>
  `;const[m,C,v]=await Promise.all([L(W(P,`companies/${O}/salesReps`)),L(W(P,`companies/${O}/cashBoxes`)),L(W(P,`companies/${O}/costCenters`)).catch(()=>({docs:[]}))]);$=m.docs.map(r=>({id:r.id,...r.data()})).sort((r,h)=>(r.name||"").localeCompare(h.name||"","ar")),ot={},lt={},st={},it={},C.docs.forEach(r=>{const h=r.data();let g=h.repId||null;const w=h.name||"";g||(w.includes("مصطفى")?g=$.find(y=>y.name?.includes("مصطفى"))?.id||null:w.includes("السيد رضا")?g=$.find(y=>y.name?.includes("السيد رضا"))?.id||null:w.includes("محمد عوض")?g=$.find(y=>y.name?.includes("محمد عوض"))?.id||null:w.includes("احمد السيد")&&(g=$.find(y=>y.name?.includes("احمد السيد"))?.id||null)),g&&(ot[r.id]=g,it[g]=w,h.accountId&&(lt[h.accountId]=g),h.code&&(st[h.code]=g),h.accountCode&&(st[h.accountCode]=g))}),at={},v.docs.forEach(r=>{const h=r.data(),g=h.repId||h.linkedRepId||null;g&&(at[r.id]=g)});const u=l.querySelector("#rdj-rep");$.forEach(r=>{const h=document.createElement("option");h.value=r.id,h.textContent=`👤 ${r.name||r.id}`,u.appendChild(h)}),window.switchRdjTab=r=>{rt=r;const h=document.getElementById("tab-btn-general"),g=document.getElementById("tab-btn-daily"),w=l.querySelectorAll(".gen-only"),y=l.querySelectorAll(".daily-only");r==="general"?(h?.classList.add("active"),g?.classList.remove("active"),w.forEach(n=>n.style.display="inline-flex"),y.forEach(n=>n.style.display="none")):(g?.classList.add("active"),h?.classList.remove("active"),w.forEach(n=>n.style.display="none"),y.forEach(n=>n.style.display="inline-flex")),tt(l)},window.setRdjPeriod=r=>{const h=new Date().toISOString().split("T")[0],g=l.querySelector("#rdj-from"),w=l.querySelector("#rdj-to");if(!g||!w)return;w.value=h;const y=new Date;if(r==="today")g.value=h;else if(r==="week"){const n=y.getDay(),S=y.getDate()-n+(n===6?0:-7),T=new Date(y.setDate(S)).toISOString().split("T")[0];g.value=T}else if(r==="mtd")g.value=h.slice(0,8)+"01";else if(r==="lastMonth"){const n=new Date(y.getFullYear(),y.getMonth(),1),S=new Date(n-1),T=new Date(S.getFullYear(),S.getMonth(),1);g.value=T.toISOString().split("T")[0],w.value=S.toISOString().split("T")[0]}tt(l)},l.querySelector("#rdj-run").addEventListener("click",()=>tt(l)),tt(l)}const J=l=>{const a=(l||"").toLowerCase();return a==="bank"||a==="transfer"||a==="تحويل"||a==="network"||a==="شبكة"},nt=l=>{const a=(l||"").toLowerCase();return a==="cash"||a==="نقدي"||a==="نقدى"?'<span class="b b-cash">💵 نقدي</span>':a==="bank"||a==="transfer"||a==="تحويل"?'<span class="b b-bank">🏦 تحويل</span>':a==="network"||a==="شبكة"?'<span class="b b-bank">💳 شبكة</span>':a==="credit"||a==="آجل"||a==="deferred"?'<span class="b b-cr">📑 آجل</span>':`<span class="b b-cash">${l||"—"}</span>`};async function tt(l){rt==="general"?await ut(l):await vt(l)}async function ut(l){const a=l.querySelector("#rdj-rep").value,b=l.querySelector("#rdj-from").value,m=l.querySelector("#rdj-to").value;if(!b||!m){alert("يرجى تحديد الفترة من وإلى");return}const C=l.querySelector("#rdj-body");C.innerHTML='<div class="rdj-loading">⏳ جاري حساب مبيعات وتحصيلات اليوم والفترة (قبل وبعد الضريبة) ونسب التارجت...</div>';try{const v=new Date().toISOString().split("T")[0],u=(m||v).slice(0,8)+"01",[r,h,g]=await Promise.all([L(W(P,`companies/${O}/salesInvoices`)),L(W(P,`companies/${O}/receipts`)),L(W(P,`companies/${O}/customers`))]),w=Object.fromEntries(g.docs.map(s=>[s.id,s.data().repId||null])),y=Object.fromEntries($.map(s=>[s.id,s.name||s.id])),n=a?$.filter(s=>s.id===a):$,S=r.docs.map(s=>({id:s.id,...s.data()})).filter(s=>s.status!=="cancelled"),T=h.docs.map(s=>{const o=s.data(),k=o.repId||ot[o.sourceId]||at[o.costCenterId]||w[o.targetId]||null;return{id:s.id,...o,_repId:k}}).filter(s=>s.entityType==="customer"),I=n.map(s=>{const o=s.id,k=S.filter(c=>c.repId===o&&(c.date===v||b===m&&c.date===m));let _=0,N=0;k.forEach(c=>{const j=parseFloat(c.totalWithVat||c.total||0),U=parseFloat(c.subtotal||c.subTotal||j/1.15||0);_+=j,N+=U});const z=T.filter(c=>c._repId===o&&(c.date===v||b===m&&c.date===m));let K=0,Z=0;z.forEach(c=>{const j=parseFloat(c.amount||0);J(c.method||c.paymentMethod)?Z+=j:K+=j});const dt=K+Z,t=S.filter(c=>c.repId===o&&c.date>=b&&c.date<=m);let d=0,f=0;t.forEach(c=>{const j=parseFloat(c.totalWithVat||c.total||0),U=parseFloat(c.subtotal||c.subTotal||j/1.15||0);d+=j,f+=U});const p=t.length,A=p>0?d/p:0,Y=S.filter(c=>c.repId===o&&c.date>=u&&c.date<=m);let H=0,E=0;Y.forEach(c=>{const j=parseFloat(c.totalWithVat||c.total||0),U=parseFloat(c.subtotal||c.subTotal||j/1.15||0);H+=j,E+=U});const q=parseFloat(s.monthlyTarget||0),V=q>0?H/q*100:0,x=T.filter(c=>c._repId===o&&c.date>=b&&c.date<=m);let R=0,D=0;x.forEach(c=>{const j=parseFloat(c.amount||0);J(c.method||c.paymentMethod)?D+=j:R+=j});const B=R+D,F=d>0?B/d*100:B>0?100:0;return{id:o,name:s.name||"مندوب",code:s.code||o.slice(-4),todaySales:_,todaySubtotal:N,todayCashCol:K,todayBankCol:Z,todayCol:dt,periodSales:d,periodSubtotal:f,invoiceCount:p,avgInvoice:A,mtdSales:H,mtdSubtotal:E,monthlyTarget:q,targetPct:V,cashCol:R,bankCol:D,totalCol:B,collectionRate:F}});I.sort((s,o)=>o.periodSales-s.periodSales);const i=I.reduce((s,o)=>(s.todaySales+=o.todaySales,s.todaySubtotal+=o.todaySubtotal,s.todayCashCol+=o.todayCashCol,s.todayBankCol+=o.todayBankCol,s.todayCol+=o.todayCol,s.periodSales+=o.periodSales,s.periodSubtotal+=o.periodSubtotal,s.invoiceCount+=o.invoiceCount,s.mtdSales+=o.mtdSales,s.mtdSubtotal+=o.mtdSubtotal,s.monthlyTarget+=o.monthlyTarget,s.cashCol+=o.cashCol,s.bankCol+=o.bankCol,s.totalCol+=o.totalCol,s),{todaySales:0,todaySubtotal:0,todayCashCol:0,todayBankCol:0,todayCol:0,periodSales:0,periodSubtotal:0,invoiceCount:0,mtdSales:0,mtdSubtotal:0,monthlyTarget:0,cashCol:0,bankCol:0,totalCol:0});i.avgInvoice=i.invoiceCount>0?i.periodSales/i.invoiceCount:0,i.targetPct=i.monthlyTarget>0?i.mtdSales/i.monthlyTarget*100:0,i.collectionRate=i.periodSales>0?i.totalCol/i.periodSales*100:i.totalCol>0?100:0,G={from:b,to:m,mtdStart:u,todayStr:v,reps:I,grand:i,repLabel:a?y[a]||a:"جميع المناديب"};let M="";I.forEach((s,o)=>{const k=o===0&&s.periodSales>0,_=s.targetPct>=100?"#10b981":s.targetPct>=80?"#2563eb":s.targetPct>=50?"#f59e0b":"#ef4444",N=s.collectionRate>=90?"#10b981":s.collectionRate>=70?"#2563eb":"#f59e0b";M+=`
        <tr>
          <td style="font-weight:bold; color:#64748b;">${o+1}</td>
          <td class="r-align">
            ${k?"🏆 ":"👤 "}<strong>${s.name}</strong>
            ${k?'<span style="font-size:10px; background:#fef08a; color:#854d0e; padding:1px 6px; border-radius:4px; margin-right:4px;">المتصدر</span>':""}
          </td>
          
          <!-- مبيعات اليوم شامل وقبل الضريبة -->
          <td style="background:rgba(2,132,199,0.03);">
            <div class="cell-main-val" style="color:#0284c7;">${e(s.todaySales)}</div>
            <span class="cell-sub-vat sub-vat-blue">قبل: ${e(s.todaySubtotal)}</span>
          </td>

          <!-- تحصيل اليوم بجانب مبيعات اليوم مباشرة -->
          <td style="background:rgba(245,158,11,0.04);">
            <div class="cell-main-val" style="color:#d97706;">${e(s.todayCol)}</div>
            ${s.todayCol>0?`<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${e(s.todayCashCol)} • شبكة: ${e(s.todayBankCol)}</span>`:'<span style="font-size:10px; color:#94a3b8;">—</span>'}
          </td>

          <!-- مبيعات الفترة شامل وقبل الضريبة -->
          <td style="background:rgba(5,150,105,0.03);">
            <div class="cell-main-val" style="color:#059669; font-size:.98rem;">${e(s.periodSales)}</div>
            <span class="cell-sub-vat sub-vat-green">قبل: ${e(s.periodSubtotal)}</span>
          </td>

          <td class="mono font-bold">${s.invoiceCount}</td>
          <td class="mono" style="color:#64748b;">${e(s.avgInvoice)}</td>
          <td class="mono font-bold" style="color:#d97706;">${e(s.cashCol)}</td>
          <td class="mono font-bold" style="color:#2563eb;">${e(s.bankCol)}</td>
          <td class="mono font-bold" style="color:#1e3a8a; font-size:.92rem;">${e(s.totalCol)}</td>

          <!-- مبيعات الشهر MTD شامل وقبل الضريبة -->
          <td style="background:rgba(79,70,229,0.03);">
            <div class="cell-main-val" style="color:#4338ca;">${e(s.mtdSales)}</div>
            <span class="cell-sub-vat sub-vat-purple">قبل: ${e(s.mtdSubtotal)}</span>
          </td>

          <td class="mono">${s.monthlyTarget>0?e(s.monthlyTarget):'<span style="color:#94a3b8">غير محدد</span>'}</td>
          <td>
            <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <div class="target-prog-wrap">
                <div class="target-prog-track">
                  <div class="target-prog-fill" style="width:${Math.min(s.targetPct,100)}%; background:${_};"></div>
                </div>
              </div>
              <span class="mono font-bold" style="color:${_}; font-size:.82rem;">${s.targetPct.toFixed(1)}%</span>
            </div>
          </td>
          <td>
            <span class="mono font-bold" style="color:${N};">${s.collectionRate.toFixed(1)}%</span>
          </td>
        </tr>
      `}),C.innerHTML=`
      <!-- ═══ 1. بطاقات المؤشرات التنفيذية للشركة ═══ -->
      <div class="gen-kpis-grid">
        <!-- كرت مبيعات اليوم مع قبل الضريبة -->
        <div class="gen-kpi-card cyan">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">مبيعات اليوم (اليوم الحالي)</span>
            <span class="gen-kpi-icon">⚡</span>
          </div>
          <div class="gen-kpi-val" style="color:#0891b2;">${e(i.todaySales)}</div>
          <div class="gen-kpi-before-vat" style="color:#0284c7;">قبل الضريبة: ${e(i.todaySubtotal)}</div>
          <div class="gen-kpi-sub">تاريخ: ${v}</div>
        </div>

        <!-- كرت تحصيل اليوم -->
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">تحصيل اليوم (اليوم الحالي)</span>
            <span class="gen-kpi-icon">💵</span>
          </div>
          <div class="gen-kpi-val" style="color:#d97706;">${e(i.todayCol)}</div>
          <div class="gen-kpi-before-vat" style="color:#b45309;">نقد: ${e(i.todayCashCol)} • شبكة: ${e(i.todayBankCol)}</div>
          <div class="gen-kpi-sub">متحصلات اليوم الفعلي</div>
        </div>

        <!-- كرت مبيعات الفترة مع قبل الضريبة -->
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">إجمالي مبيعات الفترة</span>
            <span class="gen-kpi-icon">📈</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${e(i.periodSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#047857;">قبل الضريبة: ${e(i.periodSubtotal)}</div>
          <div class="gen-kpi-sub">${i.invoiceCount} فاتورة • ضريبة: ${e(i.periodSales-i.periodSubtotal)}</div>
        </div>

        <!-- كرت إجمالي تحصيلات الفترة -->
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">إجمالي تحصيلات الفترة</span>
            <span class="gen-kpi-icon">💳</span>
          </div>
          <div class="gen-kpi-val" style="color:#2563eb;">${e(i.totalCol)}</div>
          <div class="gen-kpi-sub">نقد: ${e(i.cashCol)} • شبكة: ${e(i.bankCol)}</div>
        </div>

        <!-- كرت مبيعات الشهر MTD مع قبل الضريبة -->
        <div class="gen-kpi-card purple">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">مبيعات الشهر حتى اليوم (MTD)</span>
            <span class="gen-kpi-icon">🗓️</span>
          </div>
          <div class="gen-kpi-val" style="color:#7c3aed;">${e(i.mtdSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#6366f1;">قبل الضريبة: ${e(i.mtdSubtotal)}</div>
          <div class="gen-kpi-sub">من تاريخ ${u}</div>
        </div>

        <!-- كرت تحقيق المستهدف العام -->
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">تحقيق المستهدف العام (Target)</span>
            <span class="gen-kpi-icon">🎯</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${i.targetPct.toFixed(1)}%</div>
          <div class="gen-kpi-sub">الهدف: ${e(i.monthlyTarget)} • كفاءة: ${i.collectionRate.toFixed(1)}%</div>
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
              <th>⚡ مبيعات اليوم</th>
              <th>💵 تحصيل اليوم</th>
              <th>📈 مبيعات الفترة</th>
              <th>🧾 الفواتير</th>
              <th>📊 متوسط الفاتورة</th>
              <th>💵 تحصيل نقدي (الفترة)</th>
              <th>🏦 تحصيل شبكة/بنك</th>
              <th>💰 إجمالي التحصيل</th>
              <th>🗓️ مبيعات الشهر MTD</th>
              <th>🎯 الهدف الشهري</th>
              <th style="min-width:130px;">🏁 نسبة التارجت %</th>
              <th>⚖️ نسبة التحصيل %</th>
            </tr>
          </thead>
          <tbody>${M}</tbody>
          <tfoot>
            <tr>
              <td>Σ</td>
              <td class="r-align" style="font-size:.9rem; color:#1e3a8a;">الإجمالي العام للشركة</td>
              
              <!-- مبيعات اليوم إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(2,132,199,0.04);">
                <div class="cell-main-val" style="color:#0284c7;">${e(i.todaySales)}</div>
                <span class="cell-sub-vat sub-vat-blue">قبل: ${e(i.todaySubtotal)}</span>
              </td>

              <!-- تحصيل اليوم إجمالي الشركة -->
              <td style="background:rgba(245,158,11,0.04);">
                <div class="cell-main-val" style="color:#d97706;">${e(i.todayCol)}</div>
                ${i.todayCol>0?`<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${e(i.todayCashCol)} • شبكة: ${e(i.todayBankCol)}</span>`:""}
              </td>

              <!-- مبيعات الفترة إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(5,150,105,0.04);">
                <div class="cell-main-val" style="color:#059669; font-size:1.02rem;">${e(i.periodSales)}</div>
                <span class="cell-sub-vat sub-vat-green">قبل: ${e(i.periodSubtotal)}</span>
              </td>

              <td class="mono">${i.invoiceCount}</td>
              <td class="mono">${e(i.avgInvoice)}</td>
              <td class="mono" style="color:#d97706;">${e(i.cashCol)}</td>
              <td class="mono" style="color:#2563eb;">${e(i.bankCol)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.98rem;">${e(i.totalCol)}</td>

              <!-- مبيعات الشهر MTD إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(79,70,229,0.04);">
                <div class="cell-main-val" style="color:#4338ca;">${e(i.mtdSales)}</div>
                <span class="cell-sub-vat sub-vat-purple">قبل: ${e(i.mtdSubtotal)}</span>
              </td>

              <td class="mono">${e(i.monthlyTarget)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.95rem;">${i.targetPct.toFixed(1)}%</td>
              <td class="mono" style="color:#047857;">${i.collectionRate.toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,xt(I)}catch(v){C.innerHTML=`<div class="rdj-empty" style="color:#ef4444">❌ خطأ في تحميل التقرير العام: ${v.message}</div>`,console.error("[GeneralExecutiveReport]",v)}}function xt(l){if(typeof window.Chart>"u"){console.warn("Chart.js not loaded, skipping charts");return}if(X.target)try{X.target.destroy()}catch{}if(X.share)try{X.share.destroy()}catch{}const a=l.map(r=>r.name),b=l.map(r=>r.mtdSales),m=l.map(r=>r.monthlyTarget),C=l.map(r=>r.periodSales),v=document.getElementById("rdj-gen-chart-target");v&&(X.target=new window.Chart(v,{type:"bar",data:{labels:a,datasets:[{label:"مبيعات الشهر MTD (ر.س)",data:b,backgroundColor:"rgba(37, 99, 235, 0.85)",borderColor:"#1d4ed8",borderWidth:1.5,borderRadius:6},{label:"الهدف الشهري Target (ر.س)",data:m,backgroundColor:"rgba(245, 158, 11, 0.75)",borderColor:"#d97706",borderWidth:1.5,borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",rtl:!0,labels:{font:{family:"Cairo"}}}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}},x:{grid:{display:!1}}}}}));const u=document.getElementById("rdj-gen-chart-share");if(u){const r=["#2563eb","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316"];X.share=new window.Chart(u,{type:"doughnut",data:{labels:a,datasets:[{data:C,backgroundColor:r.slice(0,a.length),borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",rtl:!0,labels:{font:{family:"Cairo"}}}},cutout:"60%"}})}}async function vt(l){const a=l.querySelector("#rdj-rep").value,b=l.querySelector("#rdj-from").value,m=l.querySelector("#rdj-to").value;if(!b||!m){alert("يرجى تحديد الفترة من وإلى");return}const C=l.querySelector("#rdj-body");C.innerHTML='<div class="rdj-loading">⏳ جاري جلب وتحليل الحركات اليومية وسندات الصرف والسلف...</div>';try{const[v,u,r,h,g]=await Promise.all([L(W(P,`companies/${O}/salesInvoices`)),L(W(P,`companies/${O}/receipts`)),L(W(P,`companies/${O}/expenses`)).catch(()=>({docs:[]})),L(W(P,`companies/${O}/journalEntries`)).catch(()=>({docs:[]})),L(W(P,`companies/${O}/customers`))]),w=Object.fromEntries(g.docs.map(t=>[t.id,t.data().name||"عميل"])),y=Object.fromEntries(g.docs.map(t=>[t.id,t.data().repId||null])),n=Object.fromEntries($.map(t=>[t.id,t.name||t.id])),S=a?new Set([a]):new Set($.map(t=>t.id)),T=v.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"&&t.date>=b&&t.date<=m),I=u.docs.map(t=>{const d=t.data(),f=d.repId||ot[d.sourceId]||at[d.costCenterId]||y[d.targetId]||null;return{id:t.id,...d,_repId:f}}).filter(t=>t.date>=b&&t.date<=m&&t.entityType==="customer"),i=r.docs.map(t=>{const d=t.data();let f=d.repId||ot[d.sourceId]||at[d.costCenterId]||null;return!f&&d.sourceName&&(d.sourceName.includes("مصطفى")?f=$.find(p=>p.name?.includes("مصطفى"))?.id||null:d.sourceName.includes("السيد رضا")?f=$.find(p=>p.name?.includes("السيد رضا"))?.id||null:d.sourceName.includes("محمد عوض")?f=$.find(p=>p.name?.includes("محمد عوض"))?.id||null:d.sourceName.includes("احمد السيد")&&(f=$.find(p=>p.name?.includes("احمد السيد"))?.id||null)),{id:t.id,...d,_repId:f,_isExpenseDoc:!0}}).filter(t=>t.date>=b&&t.date<=m),M=[],s=new Set;i.forEach(t=>{t.code&&s.add(t.code.replace("#","").toUpperCase().trim()),t.id&&(s.add(t.id.slice(0,6).toUpperCase()),s.add(t.id.slice(-6).toUpperCase()),s.add(t.id.toUpperCase()))}),h.docs.forEach(t=>{const d=t.data(),f=d.date;if(!f||f<b||f>m)return;const p=d.description||d.desc||"";if(p.startsWith("مبيعات")||p.startsWith("تكلفة بضاعة")||p.startsWith("تكلفة البضاعة")||p.startsWith("تحويل مخزني")||p.startsWith("تسوية مخزنية")||p.startsWith("سند قبض")||p.startsWith("سند صرف")||p.startsWith("مشتريات")||p.startsWith("مردود")||d.sourceType==="expense"||d.sourceType==="receipt"||d.sourceType==="customer_receipt"||d.sourceType==="invoice"||d.sourceType==="stockTransfer"||d.refType==="expense"||d.refType==="receipt"||d.refType==="invoice"||d.type==="expense"||d.type==="receipt")return;const A=p.toUpperCase(),Y=(d.code||"").toUpperCase();for(const E of s)if(E&&(A.includes(E)||Y.includes(E)))return;const H=d.lines||[];H.forEach((E,q)=>{const V=parseFloat(E.credit||0);if(V<=0)return;const x=E.accountId,R=String(E.accountCode||""),D=E.accountName||"";let B=lt[x]||st[R]||null;if(!B&&(R.startsWith("1-1-1-2")||D.includes("صندوق"))&&(D.includes("مصطفى")?B=$.find(F=>F.name?.includes("مصطفى"))?.id:D.includes("السيد رضا")?B=$.find(F=>F.name?.includes("السيد رضا"))?.id:D.includes("محمد عوض")?B=$.find(F=>F.name?.includes("محمد عوض"))?.id:D.includes("احمد السيد")&&(B=$.find(F=>F.name?.includes("احمد السيد"))?.id)),B&&S.has(B)){const F=H.find((pt,bt)=>bt!==q&&parseFloat(pt.debit||0)>0),c=String(F?.accountCode||""),j=F?.accountName||"",U=c.startsWith("3-1-4")||c.startsWith("1-1-1-1")||c.startsWith("1-1-1-3")||p.includes("جارى")||p.includes("جاري")||p.includes("تصفية")||p.includes("توريد للخزينة")||p.includes("تحويل الى جارى");M.push({id:t.id,date:f,_repId:B,description:p||j||(U?"توريد نقدية للخزينة":"مصروف نقدي"),category:j,amount:V,refNumber:d.code||t.id.slice(-6),isTransfer:U,typeBadge:U?"توريد للخزينة":p.includes("سلفة")?"سلفة مندوب":p.includes("صيانة")||p.includes("زيت")?"صيانة وتشغيل":"مصروف نقدي"})}})});const o={},k=(t,d)=>{const f=`${t}|${d}`;return o[f]||(o[f]={date:t,repId:d,invoices:[],receipts:[],cashOuts:[]}),o[f]};T.forEach(t=>{const d=t.repId;!d||!S.has(d)||k(t.date||b,d).invoices.push(t)}),I.forEach(t=>{const d=t._repId;!d||!S.has(d)||k(t.date||b,d).receipts.push(t)}),i.forEach(t=>{const d=t._repId;!d||!S.has(d)||k(t.date||b,d).cashOuts.push({id:t.id,date:t.date,_repId:d,description:t.notes||t.expenseName||t.name||"سند صرف",category:t.entityName||t.accountName||"مصروف عام",amount:parseFloat(t.amount||0),refNumber:t.code||t.id.slice(-6),isTransfer:!1,typeBadge:"سند صرف"})}),M.forEach(t=>{k(t.date,t._repId).cashOuts.push(t)});const _=Object.values(o).sort((t,d)=>t.date.localeCompare(d.date)||(n[t.repId]||"").localeCompare(n[d.repId]||""));_.forEach(t=>{t.totalSales=t.invoices.reduce((d,f)=>d+parseFloat(f.totalWithVat||f.total||0),0),t.cashCol=0,t.bankCol=0,t.receipts.forEach(d=>{const f=d.method||d.paymentMethod||"cash",p=parseFloat(d.amount||0);J(f)?t.bankCol+=p:t.cashCol+=p}),t.totalCol=t.cashCol+t.bankCol,t.pureExpenses=t.cashOuts.filter(d=>!d.isTransfer).reduce((d,f)=>d+(f.amount||0),0),t.treasuryTransfers=t.cashOuts.filter(d=>d.isTransfer).reduce((d,f)=>d+(f.amount||0),0),t.totalCashOut=t.pureExpenses+t.treasuryTransfers,t.netBoxDay=t.cashCol-t.pureExpenses});const N={};_.forEach(t=>{N[t.repId]||(N[t.repId]=0),N[t.repId]+=t.cashCol-t.totalCashOut,t.boxBal=N[t.repId]});const z=_.reduce((t,d)=>(t.totalSales+=d.totalSales,t.cashCol+=d.cashCol,t.bankCol+=d.bankCol,t.pureExpenses+=d.pureExpenses,t.treasuryTransfers+=d.treasuryTransfers,t.totalCashOut+=d.totalCashOut,t.netBoxTotal+=d.netBoxDay,t),{totalSales:0,cashCol:0,bankCol:0,pureExpenses:0,treasuryTransfers:0,totalCashOut:0,netBoxTotal:0});if(!_.length){C.innerHTML='<div class="rdj-empty">لا توجد حركات مسجلة في هذه الفترة</div>';return}const K=b===m?et(b):`${et(b)} إلى ${et(m)}`,Z=a?n[a]||a:"جميع المناديب";Q=_,ht=z,ct={dateRange:K,repLabel:Z,from:b,to:m,custMap:w,repMap:n,repBoxNameMap:it};let dt="";_.forEach((t,d)=>{const f=n[t.repId]||t.repId||"مندوب",p=it[t.repId]||"صندوق المندوب";let A=t.invoices.length===0?'<tr><td colspan="4" class="dmt">لا توجد فواتير مبيعات مسجلة في هذا اليوم</td></tr>':"",Y=0;t.invoices.forEach(x=>{const R=parseFloat(x.totalWithVat||x.total||0);Y+=R,A+=`<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${x.code||x.invoiceNumber||x.id.slice(-6)}</td>
          <td class="lft">${w[x.customerId]||"عميل"}</td>
          <td>${nt(x.paymentMethod)}</td>
          <td class="mono font-bold" style="color:#059669;">${e(R)}</td>
        </tr>`}),t.invoices.length&&(A+=`<tfoot><tr>
          <td colspan="3" style="text-align:right;">الإجمالي (${t.invoices.length} فاتورة)</td>
          <td class="mono font-bold" style="color:#059669;">${e(Y)}</td>
        </tr></tfoot>`);let H=t.receipts.length===0?'<tr><td colspan="5" class="dmt">لا توجد تحصيلات مسجلة في هذا اليوم</td></tr>':"",E=0;t.receipts.forEach(x=>{const R=parseFloat(x.amount||0);E+=R;const D=x.method||x.paymentMethod||"cash";H+=`<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${x.code||x.id.slice(-6)}</td>
          <td class="lft">${w[x.targetId]||x.accountName||"عميل"}</td>
          <td>${nt(D)}</td>
          <td style="font-size:.75rem; color:#64748b;">${x.sourceName||p}</td>
          <td class="mono font-bold" style="color:${J(D)?"#2563eb":"#d97706"};">${e(R)}</td>
        </tr>`}),t.receipts.length&&(H+=`<tfoot><tr>
          <td colspan="4" style="text-align:right;">الإجمالي (${t.receipts.length} سند قبض)</td>
          <td class="mono font-bold" style="color:#2563eb;">${e(E)}</td>
        </tr></tfoot>`);let q=t.cashOuts.length===0?'<tr><td colspan="4" class="dmt">لا توجد مصروفات أو مسحوبات نقدية من الصندوق</td></tr>':"",V=0;t.cashOuts.forEach(x=>{V+=x.amount;const R=x.isTransfer?"b-tr":x.typeBadge.includes("سلفة")?"b-adv":"b-exp";q+=`<tr>
          <td class="mono" style="font-size:.75rem; color:#64748b;">${x.refNumber}</td>
          <td class="lft font-bold" style="color:${x.isTransfer?"#0369a1":"#991b1b"};">${x.description}</td>
          <td><span class="b ${R}">${x.typeBadge}</span></td>
          <td class="mono font-bold" style="color:${x.isTransfer?"#0369a1":"#dc2626"};">${e(x.amount)}</td>
        </tr>`}),t.cashOuts.length&&(q+=`<tfoot><tr>
          <td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف والتوريدات (${t.cashOuts.length} حركة)</td>
          <td class="mono font-bold" style="color:#dc2626;">${e(V)}</td>
        </tr></tfoot>`),dt+=`
        <tr class="mr" onclick="rdjX(${d})">
          <td><button class="xbtn" id="xb${d}">▶</button></td>
          <td class="td-date mono">${t.date}</td>
          <td class="td-rep">👤 ${f}</td>
          <td class="td-sales mono">${e(t.totalSales)}</td>
          <td class="td-cash mono">${t.cashCol>0?e(t.cashCol):"—"}</td>
          <td class="td-bank mono">${t.bankCol>0?e(t.bankCol):"—"}</td>
          <td class="td-exp mono">${t.pureExpenses>0?e(t.pureExpenses):"—"}</td>
          <td class="td-box mono ${t.netBoxDay<0?"text-bad":"text-good"}">🏦 ${e(t.netBoxDay)}</td>
        </tr>

        <tr class="dr">
          <td colspan="8">
            <div class="di" id="di${d}">
              <div class="rep-section-badge">
                <div>
                  <h4>👤 يومية المندوب: ${f} &nbsp;|&nbsp; 📅 التاريخ: ${t.date}</h4>
                  <div style="font-size:.78rem; opacity:0.9; margin-top:2px;">📦 الصندوق المعتمد: ${p}</div>
                </div>
                <div style="text-align:left; font-size:.85rem; font-weight:800;">
                  صافي النقدية المتاحة للتوريد: <span style="font-size:1.1rem; color:#fef08a; font-family:monospace;">${e(t.netBoxDay)}</span>
                </div>
              </div>

              <div class="sub-card">
                <div class="dh s">
                  <span>📈 1. فواتير المبيعات</span>
                  <span class="mono">${e(t.totalSales)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">طريقة الدفع</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${A}</tbody>
                </table>
              </div>

              <div class="sub-card">
                <div class="dh c">
                  <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
                  <span class="mono">${e(t.totalCol)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:110px;">طريقة التحصيل</th><th style="width:140px;">الصندوق</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${H}</tbody>
                </table>
              </div>

              <div class="sub-card">
                <div class="dh e">
                  <span>💸 3. المصروفات والسلف ومسحوبات الصندوق</span>
                  <span class="mono">${e(t.totalCashOut)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم القيد / السند</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:120px;">النوع</th><th style="width:120px;">المبلغ المنصرف</th></tr></thead>
                  <tbody>${q}</tbody>
                </table>
              </div>

              <div class="rep-box-calc-bar">
                <div>💵 التحصيل النقدي: <strong class="mono text-good">${e(t.cashCol)}</strong></div>
                <div style="color:#64748b;">➖</div>
                <div>💸 المصروفات والسلف: <strong class="mono text-bad">${e(t.pureExpenses)}</strong></div>
                <div style="color:#64748b;">🟰</div>
                <div>🏦 صافي النقد المتاح للتوريد: <strong class="mono font-bold" style="color:#047857; font-size:1.05rem;">${e(t.netBoxDay)}</strong></div>
                ${t.treasuryTransfers>0?`<div style="font-size:11px; color:#0369a1; width:100%; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:4px;">(تم توريد ${e(t.treasuryTransfers)} إلى جاري المالك/الخزينة)</div>`:""}
              </div>

            </div>
          </td>
        </tr>
      `}),C.innerHTML=`
      <div class="gen-kpis-grid no-print">
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي المبيعات</span><span>📈</span></div>
          <div class="gen-kpi-val" style="color:#059669">${e(z.totalSales)}</div>
        </div>
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي التحصيل النقدي</span><span>💵</span></div>
          <div class="gen-kpi-val" style="color:#d97706">${e(z.cashCol)}</div>
        </div>
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي تحصيل بنك / شبكة</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#2563eb">${e(z.bankCol)}</div>
        </div>
        <div class="gen-kpi-card purple" style="border-color:rgba(239,68,68,.4)">
          <div class="gen-kpi-top"><span class="gen-kpi-title">المصروفات والسلف التشغيلية</span><span>💸</span></div>
          <div class="gen-kpi-val" style="color:#dc2626">${e(z.pureExpenses)}</div>
        </div>
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top"><span class="gen-kpi-title">صافي النقد المتاح للتوريد</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#047857;">${e(z.netBoxTotal)}</div>
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
          <tbody>${dt}</tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colspan="2" style="text-align:right; font-size:.85rem; color:#475569;">الإجمالي العام (${_.length} يومية مندوب)</td>
              <td class="td-sales mono">${e(z.totalSales)}</td>
              <td class="td-cash mono">${e(z.cashCol)}</td>
              <td class="td-bank mono">${e(z.bankCol)}</td>
              <td class="td-exp mono">${e(z.pureExpenses)}</td>
              <td class="td-box mono">${e(z.netBoxTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,window.rdjX=t=>{const d=document.getElementById(`di${t}`),f=document.getElementById(`xb${t}`),p=f?.closest("tr");if(!d)return;const A=d.classList.toggle("open");f&&(f.textContent=A?"▼":"▶"),p&&p.classList.toggle("open",A)}}catch(v){C.innerHTML=`<div class="rdj-empty" style="color:#ef4444">❌ خطأ في إعداد اليومية: ${v.message}</div>`,console.error("[DailyJournalReport]",v)}}window.openRepTargetModal=()=>{const l=document.getElementById("rdj-target-modal"),a=document.getElementById("rdj-target-modal-body");!l||!a||(a.innerHTML=$.map(b=>`
    <div class="rep-target-row">
      <div class="rep-target-info">
        <div>👤 ${b.name}</div>
        <div style="font-size:11px; color:#64748b; font-weight:normal;">كود: ${b.code||b.id.slice(-4)}</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="number" id="target-inp-${b.id}" class="rep-target-input" value="${parseFloat(b.monthlyTarget||0)}" min="0" step="1000" />
        <span style="font-size:12px; font-weight:bold; color:#475569;">ر.س</span>
      </div>
    </div>
  `).join(""),l.style.display="flex")};window.closeRepTargetModal=()=>{const l=document.getElementById("rdj-target-modal");l&&(l.style.display="none")};window.saveRepTargets=async()=>{const l=document.getElementById("rdj-save-targets-btn");l&&(l.disabled=!0,l.textContent="⏳ جاري الحفظ...");try{const a=[];$.forEach(m=>{const C=document.getElementById(`target-inp-${m.id}`);if(C){const v=parseFloat(C.value)||0;m.monthlyTarget=v,a.push(gt(mt(P,`companies/${O}/salesReps`,m.id),{monthlyTarget:v}))}}),await Promise.all(a),typeof window.showToast=="function"&&window.showToast("تم تحديث مستهدفات المناديب بنجاح ✅","success"),window.closeRepTargetModal();const b=document.querySelector(".rdj-wrap")?.parentElement;b&&tt(b)}catch(a){alert("فشل حفظ المستهدفات: "+a.message)}finally{l&&(l.disabled=!1,l.textContent="💾 حفظ المستهدفات وتحديث التقرير")}};window.exportGeneralReportExcel=()=>{if(!G||!G.reps||!G.reps.length){alert("يرجى عرض التقرير أولاً قبل التصدير");return}const{reps:l,grand:a,from:b,to:m}=G,C=["م","اسم المندوب","مبيعات اليوم شامل الضريبة","مبيعات اليوم قبل الضريبة","تحصيل اليوم (ر.س)","مبيعات الفترة شامل الضريبة","مبيعات الفترة قبل الضريبة","عدد الفواتير","متوسط الفاتورة","تحصيل نقدي الفترة","تحصيل شبكة الفترة","إجمالي تحصيل الفترة","مبيعات الشهر MTD شامل","مبيعات الشهر MTD قبل","الهدف الشهري","نسبة تحقيق التارجت %","نسبة التحصيل من المبيعات %"],v=l.map((u,r)=>[r+1,u.name,u.todaySales,u.todaySubtotal,u.todayCol,u.periodSales,u.periodSubtotal,u.invoiceCount,Math.round(u.avgInvoice),u.cashCol,u.bankCol,u.totalCol,u.mtdSales,u.mtdSubtotal,u.monthlyTarget,u.targetPct.toFixed(1)+"%",u.collectionRate.toFixed(1)+"%"]);v.push(["Σ","الإجمالي العام للشركة",a.todaySales,a.todaySubtotal,a.todayCol,a.periodSales,a.periodSubtotal,a.invoiceCount,Math.round(a.avgInvoice),a.cashCol,a.bankCol,a.totalCol,a.mtdSales,a.mtdSubtotal,a.monthlyTarget,a.targetPct.toFixed(1)+"%",a.collectionRate.toFixed(1)+"%"]),ft({filename:`التقرير_العام_لمبيعات_المناديب_${m}`,title:`التقرير العام لأداء ومبيعات وتحصيلات المناديب (من ${b} إلى ${m})`,headers:C,rows:v})};window.printGeneralReportPDF=()=>{if(!G||!G.reps||!G.reps.length){alert("يرجى عرض التقرير أولاً قبل التصدير أو الطباعة");return}const{reps:l,grand:a,from:b,to:m,mtdStart:C,todayStr:v,repLabel:u}=G,r=window.ERP_COMPANY||{},h=r.name||"مؤسسة أدهام للمواد الغذائية",g="تجارة وتوريد المواد الغذائية بالجملة والتموين — ينبع البحر",w=r.vatNumber||"310123456700003",y=r.crNumber||"4650054321";r.phone;const n=new Date().toLocaleDateString("ar-SA"),S=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});let T="",I="";try{const o=document.getElementById("rdj-gen-chart-target");o&&(T=o.toDataURL("image/png"));const k=document.getElementById("rdj-gen-chart-share");k&&(I=k.toDataURL("image/png"))}catch(o){console.warn("Chart image extract error:",o)}const i=l.map((o,k)=>{const _=k===0&&o.periodSales>0,N=o.targetPct>=100?"#059669":o.targetPct>=80?"#1d4ed8":o.targetPct>=50?"#d97706":"#dc2626",z=o.collectionRate>=90?"#059669":o.collectionRate>=70?"#1d4ed8":"#d97706";return`
      <tr>
        <td style="font-weight:bold; color:#64748b;">${k+1}</td>
        <td style="text-align:right; font-weight:800; color:#0f172a;">
          ${_?"🏆 ":""}${o.name}
        </td>
        
        <!-- مبيعات اليوم شامل وقبل -->
        <td style="background:rgba(2,132,199,0.02);">
          <div style="font-family:monospace; font-weight:bold; color:#0284c7;">${e(o.todaySales)}</div>
          <div style="font-size:7px; color:#64748b; font-family:monospace;">قبل: ${e(o.todaySubtotal)}</div>
        </td>

        <!-- تحصيل اليوم بجانب مبيعات اليوم -->
        <td style="background:rgba(245,158,11,0.03); font-family:monospace; font-weight:bold; color:#d97706;">
          ${e(o.todayCol)}
        </td>

        <!-- مبيعات الفترة شامل وقبل -->
        <td style="background:rgba(5,150,105,0.02);">
          <div style="font-family:monospace; font-weight:bold; color:#059669;">${e(o.periodSales)}</div>
          <div style="font-size:7px; color:#0891b2; font-family:monospace; font-weight:bold;">قبل: ${e(o.periodSubtotal)}</div>
        </td>

        <td style="font-family:monospace; font-weight:bold;">${o.invoiceCount}</td>
        <td style="font-family:monospace; color:#64748b;">${e(o.avgInvoice)}</td>
        <td style="font-family:monospace; font-weight:bold; color:#d97706;">${e(o.cashCol)}</td>
        <td style="font-family:monospace; font-weight:bold; color:#2563eb;">${e(o.bankCol)}</td>
        <td style="font-family:monospace; font-weight:bold; color:#1e3a8a;">${e(o.totalCol)}</td>

        <!-- مبيعات الشهر MTD شامل وقبل -->
        <td style="background:rgba(79,70,229,0.02);">
          <div style="font-family:monospace; font-weight:bold; color:#4338ca;">${e(o.mtdSales)}</div>
          <div style="font-size:7px; color:#6366f1; font-family:monospace;">قبل: ${e(o.mtdSubtotal)}</div>
        </td>

        <td style="font-family:monospace;">${o.monthlyTarget>0?e(o.monthlyTarget):"—"}</td>
        <td style="font-family:monospace; font-weight:900; color:${N};">${o.targetPct.toFixed(1)}%</td>
        <td style="font-family:monospace; font-weight:900; color:${z};">${o.collectionRate.toFixed(1)}%</td>
      </tr>
    `}).join(""),M=window.open("","_blank");if(!M){alert("يرجى السماح بالنوافذ المنبثقة للطباعة أو تصدير الـ PDF");return}const s=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقرير العام لمبيعات ومتحصلات المناديب والمستهدف الشهري</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4 landscape; margin: 7mm 8mm; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      font-size: 8.2px; color: #0f172a; background: #fff; direction: rtl; line-height: 1.35;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .report-wrap { width: 100%; max-width: 280mm; margin: 0 auto; }
    .royal-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%);
      color: #fff; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border: 1.5px solid #d97706; box-shadow: 0 4px 12px rgba(15,23,42,0.15); margin-bottom: 8px;
    }
    .co-title-box { display: flex; align-items: center; gap: 12px; }
    .co-logo-circle { width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #1e3a8a; border: 2px solid #d97706; }
    .co-name { font-size: 14px; font-weight: 900; color: #fff; }
    .co-sub  { font-size: 8px; color: #cbd5e1; font-weight: 600; margin-top: 1px; }
    .doc-badge-center { text-align: center; }
    .doc-main-title { font-size: 14px; font-weight: 900; color: #fef08a; }
    .doc-period-text { font-size: 8.5px; color: #e2e8f0; font-weight: 700; margin-top: 2px; }
    .meta-box-left { text-align: left; font-size: 8px; color: #cbd5e1; line-height: 1.4; }
    .meta-box-left strong { color: #fff; }

    .kpi-row { display: flex; gap: 6px; margin-bottom: 8px; }
    .kpi-item { flex: 1; background: #f8fafc; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px 6px; text-align: center; border-top: 2.5px solid #2563eb; }
    .kpi-item.cyan    { border-top-color: #0891b2; }
    .kpi-item.green   { border-top-color: #059669; }
    .kpi-item.purple  { border-top-color: #7c3aed; }
    .kpi-item.blue    { border-top-color: #2563eb; }
    .kpi-item.amber   { border-top-color: #d97706; }
    .kpi-item.emerald { border-top-color: #047857; }
    .kpi-label { font-size: 7.5px; font-weight: 800; color: #475569; margin-bottom: 1px; }
    .kpi-val   { font-size: 11px; font-weight: 900; font-family: monospace; }
    .kpi-before { font-size: 7.5px; font-weight: 800; margin-top: 1px; }
    .kpi-note  { font-size: 6.8px; color: #94a3b8; }

    .charts-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .chart-box { flex: 1; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #fff; text-align: center; }
    .chart-box-title { font-size: 8.5px; font-weight: 900; color: #1e3a8a; margin-bottom: 4px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px; }
    .chart-img { max-height: 120px; width: auto; max-width: 100%; object-fit: contain; }

    .table-card { border: 1.5px solid #0f172a; border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
    table.rep-tbl { width: 100%; border-collapse: collapse; font-size: 7.6px; }
    table.rep-tbl th { background: #0f172a; color: #fff; padding: 5px 4px; font-weight: 800; text-align: center; border: 1px solid #1e293b; white-space: nowrap; }
    table.rep-tbl td { padding: 4px 4px; text-align: center; border: 1px solid #e2e8f0; white-space: nowrap; vertical-align: middle; }
    table.rep-tbl tbody tr:nth-child(even) { background: #f8fafc; }
    table.rep-tbl tfoot tr { background: #f1f5f9; font-weight: 900; border-top: 2px solid #0f172a; }
    table.rep-tbl tfoot td { padding: 5px 4px; vertical-align: middle; }

    .footer-signatures { display: flex; justify-content: space-between; gap: 16px; margin-top: 8px; border-top: 1.5px dashed #94a3b8; padding-top: 6px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-role  { font-size: 8.5px; font-weight: 800; color: #1e3a8a; margin-bottom: 18px; }
    .sig-name  { font-size: 7.5px; color: #64748b; }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="royal-header">
      <div class="co-title-box">
        <div class="co-logo-circle">🏢</div>
        <div>
          <div class="co-name">${h}</div>
          <div class="co-sub">${g}</div>
        </div>
      </div>
      <div class="doc-badge-center">
        <div class="doc-main-title">التقرير العام لمبيعات ومتحصلات المناديب والمستهدف الشهري</div>
        <div class="doc-period-text">📅 الفترة: من ${et(b)} إلى ${et(m)} &nbsp;|&nbsp; النطاق: ${u}</div>
      </div>
      <div class="meta-box-left">
        <div><strong>الرقم الضريبي:</strong> ${w}</div>
        <div><strong>السجل التجاري:</strong> ${y}</div>
        <div><strong>تاريخ الطباعة:</strong> ${n} — ${S}</div>
      </div>
    </div>

    <!-- كروت KPI السريعة مع قبل الضريبة وتحصيل اليوم -->
    <div class="kpi-row">
      <div class="kpi-item cyan">
        <div class="kpi-label">⚡ مبيعات اليوم</div>
        <div class="kpi-val" style="color:#0891b2;">${e(a.todaySales)}</div>
        <div class="kpi-before" style="color:#0284c7;">قبل الضريبة: ${e(a.todaySubtotal)}</div>
      </div>
      <div class="kpi-item amber">
        <div class="kpi-label">💵 تحصيل اليوم</div>
        <div class="kpi-val" style="color:#d97706;">${e(a.todayCol)}</div>
        <div class="kpi-note">نقد: ${e(a.todayCashCol)} • شبكة: ${e(a.todayBankCol)}</div>
      </div>
      <div class="kpi-item green">
        <div class="kpi-label">📈 مبيعات الفترة</div>
        <div class="kpi-val" style="color:#059669;">${e(a.periodSales)}</div>
        <div class="kpi-before" style="color:#047857;">قبل الضريبة: ${e(a.periodSubtotal)}</div>
      </div>
      <div class="kpi-item blue">
        <div class="kpi-label">💳 تحصيلات الفترة</div>
        <div class="kpi-val" style="color:#2563eb;">${e(a.totalCol)}</div>
        <div class="kpi-note">نقد: ${e(a.cashCol)}</div>
      </div>
      <div class="kpi-item purple">
        <div class="kpi-label">🗓️ مبيعات الشهر MTD</div>
        <div class="kpi-val" style="color:#7c3aed;">${e(a.mtdSales)}</div>
        <div class="kpi-before" style="color:#6366f1;">قبل الضريبة: ${e(a.mtdSubtotal)}</div>
      </div>
      <div class="kpi-item emerald">
        <div class="kpi-label">🎯 تحقيق المستهدف</div>
        <div class="kpi-val" style="color:#059669;">${a.targetPct.toFixed(1)}%</div>
        <div class="kpi-note">كفاءة التحصيل: ${a.collectionRate.toFixed(1)}%</div>
      </div>
    </div>

    ${T||I?`
      <div class="charts-row">
        ${T?`
          <div class="chart-box" style="flex:2;">
            <div class="chart-box-title">📊 المبيعات التراكمية (MTD) مقابل الهدف الشهري (Target) لكل مندوب</div>
            <img src="${T}" class="chart-img" alt="Sales vs Target" />
          </div>
        `:""}
        ${I?`
          <div class="chart-box" style="flex:1;">
            <div class="chart-box-title">🥧 الحصة البيعية للمناديب (Market Share)</div>
            <img src="${I}" class="chart-img" alt="Market Share" />
          </div>
        `:""}
      </div>
    `:""}

    <div class="table-card">
      <table class="rep-tbl">
        <thead>
          <tr>
            <th style="width:25px;">#</th>
            <th style="text-align:right; min-width:110px;">👤 المندوب</th>
            <th>⚡ مبيعات اليوم</th>
            <th>💵 تحصيل اليوم</th>
            <th>📈 مبيعات الفترة</th>
            <th>🧾 الفواتير</th>
            <th>📊 متوسط الفاتورة</th>
            <th>💵 تحصيل نقدي (فترة)</th>
            <th>🏦 تحصيل شبكة</th>
            <th>💰 إجمالي التحصيل</th>
            <th>🗓️ مبيعات الشهر MTD</th>
            <th>🎯 الهدف الشهري</th>
            <th>🏁 نسبة التارجت %</th>
            <th>⚖️ نسبة التحصيل %</th>
          </tr>
        </thead>
        <tbody>${i}</tbody>
        <tfoot>
          <tr>
            <td>Σ</td>
            <td style="text-align:right; font-weight:900; color:#1e3a8a;">الإجمالي العام للشركة</td>
            
            <td style="background:rgba(2,132,199,0.03);">
              <div style="font-family:monospace; color:#0284c7; font-weight:bold;">${e(a.todaySales)}</div>
              <div style="font-size:7px; color:#64748b; font-family:monospace;">قبل: ${e(a.todaySubtotal)}</div>
            </td>

            <td style="background:rgba(245,158,11,0.03); font-family:monospace; font-weight:bold; color:#d97706;">
              ${e(a.todayCol)}
            </td>

            <td style="background:rgba(5,150,105,0.03);">
              <div style="font-family:monospace; color:#059669; font-size:9px; font-weight:bold;">${e(a.periodSales)}</div>
              <div style="font-size:7px; color:#0891b2; font-family:monospace; font-weight:bold;">قبل: ${e(a.periodSubtotal)}</div>
            </td>

            <td style="font-family:monospace;">${a.invoiceCount}</td>
            <td style="font-family:monospace;">${e(a.avgInvoice)}</td>
            <td style="font-family:monospace; color:#d97706;">${e(a.cashCol)}</td>
            <td style="font-family:monospace; color:#2563eb;">${e(a.bankCol)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-size:9px;">${e(a.totalCol)}</td>

            <td style="background:rgba(79,70,229,0.03);">
              <div style="font-family:monospace; color:#4338ca; font-weight:bold;">${e(a.mtdSales)}</div>
              <div style="font-size:7px; color:#6366f1; font-family:monospace;">قبل: ${e(a.mtdSubtotal)}</div>
            </td>

            <td style="font-family:monospace;">${e(a.monthlyTarget)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-size:9px;">${a.targetPct.toFixed(1)}%</td>
            <td style="font-family:monospace; color:#047857;">${a.collectionRate.toFixed(1)}%</td>
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
</html>`;M.document.open(),M.document.write(s),M.document.close()};window.printRepDailyReport=()=>{if(!Q||Q.length===0){alert("يرجى عرض اليومية أولاً قبل الطباعة");return}const{dateRange:l,repLabel:a,custMap:b,repMap:m,repBoxNameMap:C}=ct,u=(window.ERP_COMPANY||{}).name||"مؤسسة أدهام للمواد الغذائية",r="تجارة وتوريد المواد الغذائية بالجملة — ينبع",h=new Date().toLocaleDateString("ar-SA"),g=window.open("","_blank");if(!g){alert("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير");return}const w=Q.map((n,S)=>{const T=m[n.repId]||n.repId||"مندوب",I=C[n.repId]||"صندوق المندوب",i=n.invoices.length===0?'<tr><td colspan="4" style="text-align:center; padding:8px; color:#94a3b8;">لا توجد مبيعات</td></tr>':n.invoices.map(o=>`
          <tr>
            <td style="font-family:monospace; font-weight:bold; color:#1e3a8a;">${o.code||o.invoiceNumber||o.id.slice(-6)}</td>
            <td style="text-align:right; font-weight:700;">${b[o.customerId]||"عميل"}</td>
            <td>${o.paymentMethod==="cash"?"💵 نقدي":o.paymentMethod==="bank"?"🏦 تحويل":"📑 آجل"}</td>
            <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${e(o.totalWithVat||o.total||0)}</td>
          </tr>
        `).join(""),M=n.receipts.length===0?'<tr><td colspan="4" style="text-align:center; padding:8px; color:#94a3b8;">لا توجد تحصيلات</td></tr>':n.receipts.map(o=>{const k=o.method||o.paymentMethod||"cash",_=parseFloat(o.amount||0);return`
            <tr>
              <td style="font-family:monospace; font-weight:bold; color:#1e3a8a;">${o.code||o.id.slice(-6)}</td>
              <td style="text-align:right; font-weight:700;">${b[o.targetId]||o.accountName||"عميل"}</td>
              <td>${J(k)?"🏦 بنك / شبكة":"💵 نقدي"}</td>
              <td style="font-family:monospace; font-weight:bold; color:${J(k)?"#2563eb":"#d97706"}; text-align:left;">${e(_)}</td>
            </tr>
          `}).join(""),s=n.cashOuts.length===0?'<tr><td colspan="4" style="text-align:center; padding:8px; color:#94a3b8;">لا توجد مصروفات أو سلف</td></tr>':n.cashOuts.map(o=>{const k=o.isTransfer?"background:rgba(14,165,233,0.1); color:#0369a1;":"background:rgba(239,68,68,0.1); color:#dc2626;";return`
            <tr>
              <td style="font-family:monospace; font-size:8px; color:#64748b;">${o.refNumber}</td>
              <td style="text-align:right; font-weight:700; color:${o.isTransfer?"#0369a1":"#991b1b"};">${o.description}</td>
              <td><span style="${k} padding:1px 6px; border-radius:4px; font-size:8px; font-weight:bold;">${o.typeBadge}</span></td>
              <td style="font-family:monospace; font-weight:bold; color:${o.isTransfer?"#0369a1":"#dc2626"}; text-align:left;">${e(o.amount)}</td>
            </tr>
          `}).join("");return`
      <div class="print-sheet">
        <div class="print-header">
          <div style="text-align:right;">
            <div class="co-name">${u}</div>
            <div class="co-sub">${r}</div>
          </div>
          <div style="text-align:center;">
            <div class="report-title">يومية المندوب وخزينة المبيعات</div>
            <div class="report-period">الفترة: ${l}</div>
          </div>
          <div style="text-align:left; font-size:8.5px; color:#64748b;">
            <div>تاريخ الطباعة: ${h}</div>
            <div>الصفحة ${S+1} من ${Q.length}</div>
          </div>
        </div>

        <div class="rep-card-header">
          <div>
            <div class="rep-title">👤 المندوب المسؤول: ${T}</div>
            <div class="rep-sub">📅 تاريخ اليومية: ${n.date} &nbsp;|&nbsp; 📦 الصندوق: ${I}</div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:9px; opacity:0.9;">صافي نقدية العهدة اليوم:</div>
            <div style="font-size:15px; font-weight:900; font-family:monospace; color:#fef08a;">${e(n.netBoxDay)}</div>
          </div>
        </div>

        <div class="kpi-print-row">
          <div class="kpi-box" style="border-color:#10b981;">
            <div class="kpi-lbl">📈 إجمالي المبيعات</div>
            <div class="kpi-val" style="color:#059669;">${e(n.totalSales)}</div>
          </div>
          <div class="kpi-box" style="border-color:#f59e0b;">
            <div class="kpi-lbl">💵 التحصيل النقدي</div>
            <div class="kpi-val" style="color:#d97706;">${e(n.cashCol)}</div>
          </div>
          <div class="kpi-box" style="border-color:#2563eb;">
            <div class="kpi-lbl">🏦 تحصيل بنك / شبكة</div>
            <div class="kpi-val" style="color:#2563eb;">${e(n.bankCol)}</div>
          </div>
          <div class="kpi-box" style="border-color:#ef4444;">
            <div class="kpi-lbl">💸 المصروفات والسلف (-)</div>
            <div class="kpi-val" style="color:#dc2626;">${e(n.pureExpenses)}</div>
          </div>
          <div class="kpi-box" style="border-color:#047857; background:rgba(4,120,87,0.06);">
            <div class="kpi-lbl">🏦 صافي النقد المتاح للتوريد</div>
            <div class="kpi-val" style="color:#047857;">${e(n.netBoxDay)}</div>
          </div>
        </div>

        <div class="tables-section">
          <div class="table-card">
            <div class="tbl-head-banner s">
              <span>📈 1. فواتير المبيعات الصادرة</span>
              <span style="font-family:monospace;">${e(n.totalSales)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:110px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:90px;">الدفع</th><th style="width:110px; text-align:left;">المبلغ</th></tr></thead>
              <tbody>${i}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">الإجمالي (${n.invoices.length} فاتورة)</td><td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${e(n.totalSales)}</td></tr></tfoot>
            </table>
          </div>

          <div class="table-card">
            <div class="tbl-head-banner c">
              <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
              <span style="font-family:monospace;">${e(n.totalCol)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:110px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:100px;">طريقة التحصيل</th><th style="width:110px; text-align:left;">المبلغ</th></tr></thead>
              <tbody>${M}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي التحصيل (${n.receipts.length} سند)</td><td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left;">${e(n.totalCol)}</td></tr></tfoot>
            </table>
          </div>

          <div class="table-card">
            <div class="tbl-head-banner e">
              <span>💸 3. المصروفات والسلف والمسحوبات النقدية من الصندوق</span>
              <span style="font-family:monospace;">${e(n.totalCashOut)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:110px;">المرجع</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:100px;">النوع</th><th style="width:110px; text-align:left;">المبلغ المنصرف</th></tr></thead>
              <tbody>${s}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف (${n.cashOuts.length} حركة)</td><td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">${e(n.totalCashOut)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        <div class="formula-strip">
          <div>💵 التحصيل النقدي: <strong style="color:#059669; font-family:monospace;">${e(n.cashCol)}</strong></div>
          <div style="color:#64748b; font-weight:bold;">➖</div>
          <div>💸 المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace;">${e(n.pureExpenses)}</strong></div>
          <div style="color:#64748b; font-weight:bold;">🟰</div>
          <div>🏦 صافي النقدية المتاح للتوريد: <strong style="color:#047857; font-family:monospace; font-size:12px;">${e(n.netBoxDay)}</strong></div>
        </div>

        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-title">توقيع المندوب المسلّم</div>
            <div class="sig-line">___________________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">توقيع أمين الصندوق / الخزينة</div>
            <div class="sig-line">___________________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">اعتماد الإدارة المالية</div>
            <div class="sig-line">___________________________</div>
          </div>
        </div>
      </div>
    `}).join(""),y=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>يومية المندوب وخزينة المبيعات — ${a}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4 portrait; margin: 6mm 8mm; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      font-size: 9px; color: #0f172a; background: #fff; direction: rtl; line-height: 1.35;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .print-sheet {
      width: 100%; max-width: 195mm; margin: 0 auto; min-height: 275mm;
      display: flex; flex-direction: column; justify-content: space-between;
      page-break-after: always; break-after: page; padding-bottom: 8px;
    }
    .print-sheet:last-child { page-break-after: auto; break-after: auto; }
    .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-bottom: 6px; }
    .co-name { font-size: 13px; font-weight: 900; color: #1e3a8a; }
    .co-sub  { font-size: 8px; font-weight: 700; color: #475569; }
    .report-title { font-size: 14px; font-weight: 900; color: #0f172a; }
    .report-period { font-size: 8.5px; font-weight: 700; color: #1e3a8a; }
    .rep-card-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%);
      color: #fff; padding: 7px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
    }
    .rep-title { font-size: 12px; font-weight: 900; }
    .rep-sub   { font-size: 8px; opacity: 0.9; }
    .kpi-print-row { display: flex; gap: 6px; margin-bottom: 6px; }
    .kpi-box { flex: 1; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 5px 6px; text-align: center; background: #f8fafc; }
    .kpi-lbl { font-size: 7.5px; font-weight: 800; color: #475569; margin-bottom: 1px; }
    .kpi-val { font-size: 11px; font-weight: 900; font-family: monospace; }
    .tables-section { display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px; }
    .table-card { border: 1.2px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #fff; }
    .tbl-head-banner { padding: 3px 8px; font-size: 8.5px; font-weight: 900; display: flex; justify-content: space-between; align-items: center; }
    .tbl-head-banner.s { background: #dcfce7; color: #166534; border-bottom: 1px solid #86efac; }
    .tbl-head-banner.c { background: #dbeafe; color: #1e40af; border-bottom: 1px solid #93c5fd; }
    .tbl-head-banner.e { background: #fee2e2; color: #991b1b; border-bottom: 1px solid #fca5a5; }
    .data-tbl { width: 100%; border-collapse: collapse; font-size: 8px; }
    .data-tbl th, .data-tbl td { border: 1px solid #e2e8f0; padding: 3px 6px; text-align: center; }
    .data-tbl th { background: #f8fafc; font-weight: 800; color: #334155; }
    .data-tbl td { font-weight: 600; color: #0f172a; }
    .data-tbl tfoot td { background: #f1f5f9; font-weight: 900; border-top: 1.5px solid #cbd5e1; }
    .formula-strip {
      background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 5px 12px;
      display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; font-weight: 800; margin-bottom: 8px;
    }
    .signatures-grid { display: flex; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1.5px dashed #cbd5e1; }
    .sig-col { flex: 1; text-align: center; }
    .sig-title { font-size: 8.5px; font-weight: 800; color: #1e3a8a; margin-bottom: 14px; }
    .sig-line  { font-size: 8px; color: #94a3b8; }
  </style>
</head>
<body>
  ${w}
  <script>
    window.onload = function() {
      window.print();
    };
  <\/script>
</body>
</html>`;g.document.open(),g.document.write(y),g.document.close()};export{_t as render};
