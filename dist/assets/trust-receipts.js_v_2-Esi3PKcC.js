const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/goods-receipt-ack.js_v_1-CJv8-FcM.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{g as R,C as T,t as F,d as A,a as L,b as N,f as z,c as H,_ as G,e as j,u as O}from"./index-CF9GFeRJ.js";import{getDoc as _,doc as U,getDocs as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const $=(...g)=>window.showToast?window.showToast(...g):console.log(...g);function V(g=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).format(g).replace(/هـ/g,"").trim()+" هـ"}catch{return""}}async function W(){const g=new Date().getFullYear();let x=1;try{const r=(await R(T.trustReceipts())).filter(l=>(l.receiptNumber||"").startsWith(`TR-${g}`));if(r.length>0){const l=r.map(s=>{const c=(s.receiptNumber||"").split("-");return parseInt(c[c.length-1]||"0",10)}).filter(s=>!isNaN(s));l.length>0&&(x=Math.max(...l)+1)}}catch{x=Math.floor(1e3+Math.random()*9e3)}return`TR-${g}-${String(x).padStart(4,"0")}`}async function Q(g=null,x={}){let e=null;if(typeof g=="object"&&g!==null)e=g;else if(typeof g=="string"&&g)try{e=(await R(T.customers())).find(t=>t.id===g)||null}catch(n){console.warn("Failed to fetch customer for trust receipt:",n)}const r=document.getElementById("tr-modal-overlay");r&&r.remove();const l=F(),s=x.amount!==void 0?parseFloat(x.amount):e?parseFloat(e.balance||0):0,c=x.dueDate||"";let p={name:"شركة نظم الإمداد المتطورة",crNumber:"7054969006",vatNumber:"314996148100003",city:"ينبع",phone:"0549141648",address:"مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414"};try{const n=window.ERP_COMPANY||JSON.parse(localStorage.getItem("idham_company")||"{}");n.name&&Object.assign(p,n),n.logoBase64&&(p.logoUrl=n.logoBase64),n.logoUrl&&(p.logoUrl=n.logoUrl);const[t,a]=await Promise.all([_(U(A,`companies/${L}/settings`,"company")),_(U(A,`companies/${L}/settings`,"logo"))]);if(t.exists()&&Object.assign(p,t.data()),a.exists()){const i=a.data();p.logoUrl=i.dataUrl||i.logoBase64||i.url||i.logoUrl||""}}catch{}const u=document.createElement("div");u.className="modal-overlay active",u.id="tr-modal-overlay",u.style.zIndex="9999",u.innerHTML=`
    <style>
      #tr-modal-container {
        max-width: 890px;
        width: 95%;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
        background: var(--bg-card, #111827);
        border: 1px solid var(--border, #374151);
        font-family: var(--font-body, 'IBM Plex Sans Arabic', -apple-system, sans-serif);
      }
      .tr-header-gradient {
        background: linear-gradient(135deg, #09122c 0%, #172554 45%, #1e3a8a 100%);
        color: #fff;
        padding: 20px 26px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid rgba(212, 175, 55, 0.4);
        position: relative;
      }
      .tr-header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(212, 175, 55, 0.15);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #fde047;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
      }
      .tr-segmented-control {
        display: flex;
        background: var(--bg-2, #1f2937);
        padding: 4px;
        border-radius: 12px;
        gap: 6px;
        border: 1px solid var(--border-soft, #374151);
      }
      .tr-seg-btn {
        flex: 1;
        padding: 9px 16px;
        border-radius: 9px;
        border: none;
        background: transparent;
        color: var(--text-2, #9ca3af);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      .tr-seg-btn.active {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #fff;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      }
      .tr-card {
        background: var(--bg-2, rgba(30, 41, 59, 0.5));
        border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 16px 20px;
        transition: border-color 0.2s ease;
      }
      .tr-card:hover {
        border-color: rgba(99, 102, 241, 0.35);
      }
      .tr-card-title {
        font-size: 13px;
        font-weight: 900;
        color: var(--text-0, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .tr-input-box {
        background: var(--bg-1, #0f172a);
        border: 1px solid var(--border, #334155);
        color: var(--text-0, #f8fafc);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13.5px;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
        font-family: inherit;
      }
      .tr-input-box:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        background: var(--bg-card, #1e293b);
      }
      .tr-amount-vault {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.45) 100%);
        border: 1.5px solid rgba(59, 130, 246, 0.35);
        border-radius: 14px;
        padding: 18px 20px;
        position: relative;
        overflow: hidden;
      }
      .tr-amount-vault::before {
        content: "";
        position: absolute;
        top: 0; right: 0; width: 90px; height: 90px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        pointer-events: none;
      }
      .tr-tafqeet-ribbon {
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 10px;
        padding: 9px 14px;
        color: #fde047;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
      }
      .tr-tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 600;
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-soft, #334155);
        color: var(--text-1, #cbd5e1);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tr-tag-pill:hover, .tr-tag-pill.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: #3b82f6;
        color: #93c5fd;
      }
    </style>

    <div id="tr-modal-container">
      
      <!-- Executive Modal Header -->
      <div class="tr-header-gradient">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05)); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">🛡️</div>
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3 style="margin:0; font-size:18px; font-weight:900; letter-spacing:0.3px; color:#fff;">سند استلام على سبيل الأمانة والعهدة المالية</h3>
              <span class="tr-header-badge">⚖️ نظام مكافحة الاحتيال المالي (م/79)</span>
            </div>
            <div style="font-size:12px; color:#bae6fd; margin-top:3px; opacity:0.9;">
              سند رسمي ملزم لحفظ الحقوق والتوريدات — كتابة حرة لعميل جديد أو اختيار عميل مسجل
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="btn btn-secondary sm" onclick="window.switchToGoodsReceiptAckModal()" style="font-size:12px; background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.3); font-weight:700;">
            📜 إقرار استلام بضاعة وسند لأمر
          </button>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('tr-modal-overlay').remove()" style="color:#fff; font-size:24px; line-height:1; border:none; background:transparent; cursor:pointer;" title="إغلاق">✕</button>
        </div>
      </div>

      <!-- Modal Body (Scrollable & Responsive) -->
      <div class="modal-body" style="padding:22px 26px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:18px;">
        
        <!-- Section 1: Citizen / Trustee Identity Card (Direct & Uncoupled) -->
        <div class="tr-card" id="tr-customer-card">
          <div class="tr-card-title">
            <span>👤</span> <span>بيانات المواطن / المستلم الأمين (المقر بالاستلام)</span>
          </div>

          <!-- Citizen Full Name -->
          <div style="margin-bottom:12px;">
            <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
              اسم المواطن / المستلم الرباعي *
            </label>
            <input type="text" id="tr-cust-name" class="tr-input-box" 
                   value="${e?e.name:""}" 
                   placeholder="اكتب اسم المواطن أو المستلم الرباعي..." 
                   autocomplete="off" 
                   style="height:44px; font-size:14.5px; font-weight:800; padding-right:14px;" required />
          </div>
          <input type="hidden" id="tr-cust-id" value="${e?e.id:""}" />

          <!-- Identity Grid -->
          <div style="display:grid; grid-template-columns:1.2fr 1.2fr 1fr; gap:12px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                🪪 رقم الهوية الوطنية / الإقامة *
              </label>
              <input type="text" id="tr-cust-id-num" class="tr-input-box" style="font-family:'IBM Plex Mono', monospace; font-weight:700;" value="${e&&(e.idNumber||e.nationalId||e.crNumber)||""}" placeholder="10xxxxxxxx أو 20xxxxxxxx" required />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                📱 رقم الجوال المعتمد *
              </label>
              <input type="text" id="tr-cust-phone" class="tr-input-box" style="font-family:'IBM Plex Mono', monospace; font-weight:700;" value="${e&&(e.phone||e.mobile)||""}" placeholder="05xxxxxxxx" required />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                💼 اسم المفوض بالاستلام (إن وجد)
              </label>
              <input type="text" id="tr-cust-resp" class="tr-input-box" value="${e&&(e.ownerName||e.contactPerson||e.managerName||e.responsiblePerson)||""}" placeholder="اختياري — في حال وجود مفوض..." />
            </div>
            <div style="grid-column:1/-1;">
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                📍 العنوان الوطني / المدينة المعتمدة للتبليغ القضائي
              </label>
              <input type="text" id="tr-cust-address" class="tr-input-box" value="${e?[e.address,e.street,e.district,e.city,e.postalCode].filter(Boolean).join(" — ")||e.city||"":"ينبع — المملكة العربية السعودية"}" placeholder="ينبع — شارع … — حي …" />
            </div>
          </div>
        </div>

        <!-- Section 2: Financial Vault & Amount Details -->
        <div class="tr-amount-vault">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:14px; font-weight:900; color:#38bdf8; display:flex; align-items:center; gap:8px;">
              <span>💰</span> <span>القيمة المالية ومبلغ الأمانة والعهدة</span>
            </div>
            <span style="font-size:11px; color:#93c5fd; background:rgba(59, 130, 246, 0.15); padding:2px 10px; border-radius:12px; border:1px solid rgba(59, 130, 246, 0.3);">
              واجب الرد والسداد
            </span>
          </div>

          <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:14px; align-items:start;">
            
            <!-- Amount Input with Currency Badge -->
            <div>
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
                مبلغ الأمانة والعهدة بالريال السعودي *
              </label>
              <div style="position:relative; display:flex; align-items:center;">
                <input type="number" id="tr-amount" class="tr-input-box" 
                       value="${s>0?s:""}" 
                       placeholder="0.00" step="0.01" min="0.01" required
                       style="font-size:22px; font-weight:900; color:#10b981; font-family:'IBM Plex Mono', monospace; height:50px; padding-left:70px;" 
                       oninput="window.updateTrTafqeet(this.value)" />
                <span style="position:absolute; left:12px; font-size:13px; font-weight:900; color:#10b981; background:rgba(16, 185, 129, 0.12); padding:4px 10px; border-radius:8px; pointer-events:none;">
                  ر.س SAR
                </span>
              </div>
            </div>

            <!-- Receipt Date -->
            <div>
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
                تاريخ الاستلام والتحرير *
              </label>
              <input type="date" id="tr-receipt-date" class="tr-input-box" value="${l}" style="height:50px; font-weight:700;" />
            </div>

          </div>

          <!-- Live Tafqeet Ribbon -->
          <div class="tr-tafqeet-ribbon">
            <span style="font-size:15px;">✍️</span>
            <span>المبلغ كتابة وتفقيطاً:</span>
            <strong id="tr-tafqeet-text" style="color:#fff; letter-spacing:0.3px;">
              ${s>0?N(s):"اكتب المبلغ لتفقيطه تلقائياً بالريال والهللات"}
            </strong>
          </div>
          <input type="hidden" id="tr-amount-words" value="${s>0?N(s):""}" />

          <!-- Trust Nature & Quick Selectors -->
          <div style="margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1);">
                طبيعة وموضوع الأمانة المسلمة تحت يد المستلم *
              </label>
              <span style="font-size:11px; color:var(--text-2, #94a3b8);">(انقر للتعبئة السريعة)</span>
            </div>

            <!-- Quick Nature Pills -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
              <span class="tr-tag-pill active" onclick="window.setTrNature(this, 'مبلغ مالي نقدي مستلم على سبيل الأمانة والعهدة التامة لتوريد مواد غذائية')">💵 نقد عهدة للتوريد</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'بضائع ومواد غذائية مستلمة برسم البيع والأمانة موضوعة تحت يدي كأمانة تامة')">📦 بضاعة برسم البيع</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'شيك مصرفي مودع ومسلّم على سبيل الأمانة والضمان المالي')">💳 شيك أمانة وضمان</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'قيمة بضاعة مسلمة تحت الحساب والأمانة لحين إجراء المحاسبة والمطابقة')">⚖️ عهدة تحت الحساب</span>
            </div>

            <textarea id="tr-nature" class="tr-input-box" rows="2" style="font-weight:700; font-size:12.5px; resize:vertical;">مبلغ مالي نقدي مستلم على سبيل الأمانة والعهدة التامة لتوريد مواد غذائية</textarea>
          </div>

          <!-- Due Date / Term Toggle -->
          <div style="margin-top:14px; background:rgba(15, 23, 42, 0.4); padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <label style="font-size:12px; font-weight:800; color:#38bdf8; margin-bottom:8px; display:block;">
              موعد رد وتسليم الأمانة إلى شركة نظم الإمداد المتطورة *
            </label>
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; font-size:12.5px; color:var(--text-0, #fff);">
                <input type="radio" name="tr-due-type" value="on_demand" checked onchange="window.toggleTrDueDate(false)" style="width:16px; height:16px;" />
                <span>⚡ فور طلب الشركة الدائنة في أي وقت دون قيد أو شرط (الخيار القانوني الأقوى)</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; font-size:12.5px; color:var(--text-1, #cbd5e1);">
                <input type="radio" name="tr-due-type" value="specific_date" onchange="window.toggleTrDueDate(true)" style="width:16px; height:16px;" />
                <span>📅 في تاريخ محدد أقصاه:</span>
              </label>
              <input type="date" id="tr-due-date" class="tr-input-box" value="${c}" style="max-width:180px; height:36px; display:none; padding:4px 10px;" />
            </div>
          </div>

        </div>

        <!-- Section 3: Guarantor Card (Optional) -->
        <div class="tr-card" style="background:rgba(99, 102, 241, 0.04); border-color:rgba(99, 102, 241, 0.25);">
          <div class="tr-card-title" style="color:#818cf8;">
            <span>🤝</span> <span>بيانات الكفيل الغارم المتضامن (اختياري لتعزيز التحصيل والضمان الشخصي)</span>
          </div>
          <div style="display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:10px;">
            <input type="text" id="tr-guar-name" class="tr-input-box" value="${e&&(e.guarantor||e.guarantorName)||""}" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12.5px;" />
            <input type="text" id="tr-guar-id" class="tr-input-box mono font-bold" value="${e&&e.guarantorId||""}" placeholder="رقم هوية الكفيل" style="font-size:12.5px;" />
            <input type="text" id="tr-guar-phone" class="tr-input-box mono font-bold" value="${e&&e.guarantorPhone||""}" placeholder="جوال الكفيل" style="font-size:12.5px;" />
          </div>
        </div>

        <!-- Section 4: Notes & Document references -->
        <div>
          <label style="font-size:11.5px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
            📝 بيانات إضافية / أرقام فواتير / رقم شاحنة أو سندات تسليم
          </label>
          <input type="text" id="tr-notes" class="tr-input-box" value="${x.notes||""}" placeholder="سند تسليم رقم... فاتورة مبيعات... أو تفاصيل إضافية" />
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:16px 26px; background:var(--bg-card, #111827); border-top:1px solid var(--border-soft, #374151); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('tr-modal-overlay').remove()" style="padding:10px 20px; font-weight:700;">
          ✕ إلغاء
        </button>
        
        <div style="display:flex; gap:12px;">
          <button type="button" class="btn btn-secondary" onclick="window.submitTrustReceipt(false)" style="border-color:#0284c7; color:#38bdf8; font-weight:800; padding:10px 20px; display:inline-flex; align-items:center; gap:8px;">
            <span>🖨️</span> <span>طباعة السند فوراً (بدون حفظ)</span>
          </button>
          
          <button type="button" class="btn btn-primary" onclick="window.submitTrustReceipt(true)" style="padding:10px 26px; font-weight:900; font-size:14px; background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border:none; box-shadow:0 6px 18px rgba(37, 99, 235, 0.45); display:inline-flex; align-items:center; gap:8px;">
            <span>💾</span> <span>حفظ في السجلات والطباعة الرسمية</span>
          </button>
        </div>
      </div>

    </div>
  `,document.body.appendChild(u),window.setTrCustomerMode=n=>{const t=document.getElementById("tr-btn-mode-new"),a=document.getElementById("tr-btn-mode-reg"),i=document.getElementById("tr-cust-name-label"),d=document.getElementById("tr-cust-name"),o=document.getElementById("tr-save-new-cust");n==="new"?(t&&t.classList.add("active"),a&&a.classList.remove("active"),i&&(i.textContent="الاسم التجاري الكامل للعميل / المنشأة الجديدة *"),d&&(d.placeholder="اكتب اسم العميل أو المؤسسة يدوياً...",d.value=""),document.getElementById("tr-cust-id").value="",document.getElementById("tr-cust-id-num").value="",document.getElementById("tr-cust-phone").value="",document.getElementById("tr-cust-resp").value="",document.getElementById("tr-cust-address").value="",o&&(o.checked=!0)):(a&&a.classList.add("active"),t&&t.classList.remove("active"),i&&(i.textContent="ابحث واختر العميل المسجل من القائمة *"),d&&(d.placeholder="🔍 اكتب اسم العميل المسجل للبحث...",d.focus()),o&&(o.checked=!1))},window.setTrNature=(n,t)=>{document.querySelectorAll(".tr-tag-pill").forEach(i=>i.classList.remove("active")),n&&n.classList.add("active");const a=document.getElementById("tr-nature");a&&(a.value=t)},window.updateTrTafqeet=n=>{const t=parseFloat(n),a=t&&!isNaN(t)&&t>0?N(t):"",i=document.getElementById("tr-amount-words"),d=document.getElementById("tr-tafqeet-text");i&&(i.value=a),d&&(d.textContent=a?`فقط [ ${a} ]`:"اكتب المبلغ لتفقيطه تلقائياً بالريال والهللات")},window.toggleTrDueDate=n=>{const t=document.getElementById("tr-due-date");if(t&&(t.style.display=n?"inline-block":"none",n&&!t.value)){const a=new Date;a.setDate(a.getDate()+15),t.value=a.toISOString().slice(0,10)}},window.searchTrCustomer=async n=>{const t=document.getElementById("tr-cust-dropdown");if(!t)return;const a=(n||"").trim().toLowerCase();try{const d=(await R(T.customers())).filter(o=>!a||(o.name||"").toLowerCase().includes(a)||(o.phone||"").includes(a)||(o.idNumber||"").includes(a)||(o.crNumber||"").includes(a)).slice(0,8);if(!d.length){t.innerHTML='<div style="padding:12px; text-align:center; color:var(--text-2, #94a3b8); font-size:12px;">عميل غير مسجل — يمكنك متابعة كتابة بياناته يدوياً بكل حرية</div>',t.style.display="block";return}t.innerHTML=d.map(o=>{const h=(o.name||"").replace(/'/g,"\\'"),f=[o.address,o.street,o.district,o.city].filter(Boolean).join(" — ").replace(/'/g,"\\'"),b=o.idNumber||o.crNumber||"",y=o.phone||o.mobile||"",v=(o.ownerName||o.contactPerson||o.managerName||o.responsiblePerson||o.name||"").replace(/'/g,"\\'"),B=(o.guarantor||o.guarantorName||"").replace(/'/g,"\\'"),w=(o.guarantorId||"").replace(/'/g,"\\'"),I=(o.guarantorPhone||"").replace(/'/g,"\\'");return`
          <div class="autocomplete-item" 
               onclick="window.selectTrCustomer('${o.id}', '${h}', '${b}', '${y}', '${v}', '${f}', ${o.balance||0}, '${B}', '${w}', '${I}')"
               style="padding:11px 16px; cursor:pointer; border-bottom:1px solid var(--border-soft, #334155); display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;">
            <div>
              <strong style="color:var(--text-0, #fff); font-size:13.5px;">${o.name}</strong>
              <div style="font-size:11px; color:var(--text-2, #94a3b8); margin-top:2px;">${b?"سجل/هوية: "+b:""} ${y?" | هاتف: "+y:""}</div>
            </div>
            <div class="mono font-bold" style="font-size:12.5px; color:${(o.balance||0)>0?"#ef4444":"#10b981"};">
              ${z(o.balance||0)}
            </div>
          </div>
        `}).join(""),t.style.display="block"}catch{}},window.selectTrCustomer=(n,t,a,i,d,o,h,f,b,y)=>{document.getElementById("tr-cust-name").value=t,document.getElementById("tr-cust-id").value=n,document.getElementById("tr-cust-id-num")&&(document.getElementById("tr-cust-id-num").value=a),document.getElementById("tr-cust-phone")&&(document.getElementById("tr-cust-phone").value=i),document.getElementById("tr-cust-resp")&&(document.getElementById("tr-cust-resp").value=d),document.getElementById("tr-cust-address")&&(document.getElementById("tr-cust-address").value=o),document.getElementById("tr-guar-name")&&(document.getElementById("tr-guar-name").value=f||""),document.getElementById("tr-guar-id")&&(document.getElementById("tr-guar-id").value=b||""),document.getElementById("tr-guar-phone")&&(document.getElementById("tr-guar-phone").value=y||"");const v=document.getElementById("tr-amount");v&&(!v.value||parseFloat(v.value)<=0)&&h>0&&(v.value=h,window.updateTrTafqeet(h));const B=document.getElementById("tr-cust-dropdown");B&&(B.style.display="none")},document.addEventListener("click",n=>{if(!n.target.closest("#tr-cust-name")&&!n.target.closest("#tr-cust-dropdown")){const t=document.getElementById("tr-cust-dropdown");t&&(t.style.display="none")}}),window.submitTrustReceipt=async(n=!0)=>{if(window._trSavingInProgress)return;const t=document.getElementById("tr-cust-name")?.value.trim();if(!t){$("يرجى كتابة اسم المواطن / المستلم الرباعي","warning"),document.getElementById("tr-cust-name")?.focus();return}const a=parseFloat(document.getElementById("tr-amount")?.value||0);if(!a||isNaN(a)||a<=0){$("يرجى إدخال مبلغ صحيح للأمانة","warning"),document.getElementById("tr-amount")?.focus();return}window._trSavingInProgress=!0;const i=document.querySelector("#tr-modal-overlay button.btn-primary"),d=i?i.innerHTML:"";i&&(i.disabled=!0,i.innerHTML="<span>⏳</span> <span>جارٍ الحفظ والطباعة...</span>");try{const o=document.getElementById("tr-cust-id-num")?.value.trim()||"",h=document.getElementById("tr-cust-phone")?.value.trim()||"",f=document.getElementById("tr-cust-resp")?.value.trim()||"",b=document.getElementById("tr-cust-address")?.value.trim()||"ينبع — المملكة العربية السعودية",y=document.getElementById("tr-receipt-date")?.value||F(),v=document.querySelector("input[name='tr-due-type']:checked")?.value||"on_demand",B=v==="specific_date"?document.getElementById("tr-due-date")?.value||y:"فور الطلب من الشركة",w=document.getElementById("tr-nature")?.value||"مبلغ مالي مستلم على سبيل الأمانة والعهدة",I=document.getElementById("tr-guar-name")?.value.trim()||"",M=document.getElementById("tr-guar-id")?.value.trim()||"",D=document.getElementById("tr-guar-phone")?.value.trim()||"",E=document.getElementById("tr-notes")?.value.trim()||"";let P=document.getElementById("tr-cust-id")?.value||"";const m=await W(),k={receiptNumber:m,custName:t,custId:P,custIdNum:o,custPhone:h,custResp:f,custAddress:b,amount:a,amountWords:document.getElementById("tr-amount-words")?.value||N(a),receiptDate:y,dueDate:B,dueType:v,nature:w,guarName:I,guarId:M,guarPhone:D,notes:E,co:p,status:"active",createdAt:new Date().toISOString()};if(n)try{await H(T.trustReceipts(),k),$("تم حفظ سند الأمانة برقم: "+m,"success"),typeof window.loadTrustReceipts=="function"&&await window.loadTrustReceipts()}catch(S){console.error("Failed to save trust receipt to DB:",S),$("تعذر الحفظ في قاعدة البيانات ولكن سيتم المتابعة للطباعة","warning")}document.getElementById("tr-modal-overlay")?.remove(),await q(k)}catch(o){console.error("[submitTrustReceipt] Error:",o),$("حدث خطأ: "+o.message,"error")}finally{window._trSavingInProgress=!1,i&&(i.disabled=!1,i.innerHTML=d)}},window.switchToGoodsReceiptAckModal=async()=>{const n=document.getElementById("tr-cust-name")?.value,t=document.getElementById("tr-cust-id")?.value,a=document.getElementById("tr-cust-id-num")?.value,i=document.getElementById("tr-cust-phone")?.value,d=document.getElementById("tr-cust-address")?.value,o=document.getElementById("tr-cust-resp")?.value;document.getElementById("tr-modal-overlay")?.remove(),typeof window.openGoodsReceiptAckModal=="function"?window.openGoodsReceiptAckModal({customerId:t,customerObj:{id:t,name:n,idNumber:a,phone:i,address:d,contactPerson:o}}):(await G(()=>import("./goods-receipt-ack.js_v_1-CJv8-FcM.js"),__vite__mapDeps([0,1,2]))).openGoodsReceiptAckModal({customerId:t,customerObj:{id:t,name:n,idNumber:a,phone:i,address:d,contactPerson:o}})}}async function q(g){const{receiptNumber:x,custName:e,custIdNum:r,custPhone:l,custResp:s,custAddress:c,amount:p,amountWords:u,receiptDate:n,dueDate:t,nature:a,guarName:i,guarId:d,guarPhone:o,notes:h,co:f}=g,b=f?.name||"شركة نظم الإمداد المتطورة",y=f?.crNumber||f?.cr||"7054969006",v=f?.vatNumber||"314996148100003",B=f?.phone||"0549141648";f?.address;let w=f?.logoUrl||"";if(!w)try{const m=JSON.parse(localStorage.getItem("idham_company")||"{}");w=m.logoUrl||m.logoBase64||m.dataUrl||""}catch{}if(!w)try{const m=await _(U(A,`companies/${L}/settings`,"logo"));if(m.exists()){const k=m.data();w=k.dataUrl||k.logoBase64||k.url||k.logoUrl||""}}catch(m){console.warn("Could not fetch company logo:",m)}let I="";try{const k=await(await fetch("/icons/company-stamp.png?t="+Date.now())).blob();I=await new Promise(S=>{const C=new FileReader;C.onload=()=>S(C.result),C.readAsDataURL(k)})}catch{}const M=V(new Date(n)),D=t==="فور الطلب من الشركة"?"فور طلب شركة نظم الإمداد المتطورة في أي وقت دون قيد أو شرط":`في موعد أقصاه تاريخ: ${j(t)}`,E=window.open("","_blank","width=920,height=990");if(!E){$("يرجى السماح بالنوافذ المنبثقة للطباعة","error");return}const P=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>سند أمانة وعهدة مالية — ${e}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 8mm 10mm; }
    body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
      font-size: 11px;
      line-height: 1.55;
      color: #0f172a;
      background: #f8fafc;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      width: 100%;
      max-width: 194mm;
      margin: 0 auto;
      background: #fff;
      border: 3px double #0f172a;
      outline: 1.5px solid #d97706;
      outline-offset: -6px;
      padding: 16px 20px;
      position: relative;
    }
    /* Corner Ornaments */
    .corner-decor {
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid #d97706;
    }
    .c-tl { top: 9px; right: 9px; border-bottom: none; border-left: none; }
    .c-tr { top: 9px; left: 9px; border-bottom: none; border-right: none; }
    .c-bl { bottom: 9px; right: 9px; border-top: none; border-left: none; }
    .c-br { bottom: 9px; left: 9px; border-top: none; border-right: none; }

    /* Security Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 52px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 4px;
      z-index: 1;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .co-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .co-meta {
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
      margin-top: 1px;
    }
    .doc-center-badge {
      text-align: center;
      background: #ffffff !important;
      color: #0f172a !important;
      padding: 6px 14px;
      border-radius: 8px;
      border: 2px solid #0f172a;
    }
    .doc-royal-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f172a !important;
    }
    .doc-en-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #475569 !important;
      margin-top: 1px;
    }
    .serial-box {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      font-weight: 900;
      color: #000000 !important;
      margin-top: 4px;
      padding: 3px 10px;
      background: #f8fafc;
      border: 1.5px solid #0f172a;
      border-radius: 4px;
      display: inline-block;
      letter-spacing: 0.5px;
    }

    /* Legal Banner */
    .legal-cite-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-right: 4px solid #b45309;
      padding: 6px 12px;
      font-size: 9.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
      line-height: 1.5;
      text-align: justify;
      position: relative;
      z-index: 2;
    }

    /* Parties Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .data-table th, .data-table td {
      border: 1px solid #94a3b8;
      padding: 6px 10px;
      font-size: 11px;
      vertical-align: middle;
    }
    .data-table th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 800;
      text-align: right;
      width: 25%;
      white-space: nowrap;
    }
    .data-table td {
      background: #fff;
      color: #0f172a;
      width: 75%;
    }

    /* Amount Vault Highlight */
    .amount-highlight {
      background: linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%) !important;
      border: 2px solid #b45309 !important;
      padding: 8px 14px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .amount-digits {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 18px;
      font-weight: 900;
      color: #b91c1c;
      direction: ltr;
    }
    .amount-words {
      font-size: 11.5px;
      font-weight: 800;
      color: #1e293b;
      margin-top: 2px;
    }

    /* Clauses */
    .clauses-box {
      border: 1px solid #cbd5e1;
      background: #fafafa;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .clauses-title {
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 5px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 3px;
    }
    .clause-item {
      font-size: 9.5px;
      line-height: 1.5;
      color: #1e293b;
      margin-bottom: 4px;
      text-align: justify;
    }
    .clause-item strong {
      color: #b91c1c;
    }

    /* Security Signatures Grid */
    .sig-section {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 10px;
      margin-top: 6px;
      page-break-inside: avoid;
      position: relative;
      z-index: 2;
    }
    .sig-card {
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 8px 10px;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 165px;
    }
    .sig-card-title {
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 5px;
      text-align: center;
    }
    .sig-fields {
      font-size: 9.5px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .thumb-and-sign {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 6px;
      gap: 8px;
    }
    .thumb-box {
      width: 78px;
      height: 78px;
      border: 1.5px dashed #0f172a;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #475569;
      background: #f8fafc;
      flex-shrink: 0;
      text-align: center;
    }
    .stamp-container {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 125px;
      margin: 4px auto 0;
    }
    .stamp-img {
      max-height: 120px;
      max-width: 160px;
      width: 120px;
      height: 120px;
      object-fit: contain;
      mix-blend-mode: multiply;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.14));
    }
    .footer-bar {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      font-size: 8.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
  </style>
</head>
<body onload="window.print()">

<div class="page-container">
  <div class="corner-decor c-tl"></div>
  <div class="corner-decor c-tr"></div>
  <div class="corner-decor c-bl"></div>
  <div class="corner-decor c-br"></div>
  <div class="watermark">نظم الإمداد المتطورة — عهدة وأمانة</div>

  <!-- Header -->
  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width:28%; vertical-align:middle; text-align:right;">
        ${w?`
          <img src="${w}" style="max-height:80px; max-width:165px; object-fit:contain;" alt="شعار الشركة"/>
        `:`
          <div style="width:68px; height:68px; border-radius:10px; background:linear-gradient(135deg, #09122c, #1e3a8a); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:18px;">نظم الإمداد</div>
        `}
      </td>
      <td style="width:38%; text-align:center; vertical-align:middle;">
        <div class="doc-center-badge">
          <div class="doc-royal-title" style="white-space:nowrap;">سـنـد اسـتـلام عـلـى سـبـيـل الأمـانـة والـعـهـدة</div>
          <div class="doc-en-title">FIDUCIARY TRUST & CUSTODY BOND</div>
          <div class="serial-box">رقم السند: ${x}</div>
        </div>
      </td>
      <td style="width:34%; text-align:left; vertical-align:middle; direction:rtl;">
        <div class="co-title" style="white-space:nowrap;">${b}</div>
        <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${y}</strong></div>
        <div class="co-meta">الرقم الضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${v}</strong></div>
        <div class="co-meta">ينبع الصناعية — هاتف: ${B}</div>
        <div class="co-meta">التاريخ: ${n} م (${M})</div>
      </td>
    </tr>
  </table>

  <!-- Legal Citation Banner -->
  <div class="legal-cite-banner">
    ⚖️ <strong>السند النظامي والجزائي:</strong> يحرر هذا السند كوثيقة استلام على سبيل الأمانة والعهدة التامة الخالصة، ويخضع لأحكام <strong>نظام مكافحة الاحتيال المالي وخيانة الأمانة</strong> الصادر بالمرسوم الملكي رقم (م/79) وتاريخ 10/09/1442هـ وأحكام عقد الوديعة بنظام المعاملات المدنية، ويعد أي امتناع أو تأخير أو تصرف في هذه الأمانة جريمة خيانة أمانة موجبة للمساءلة الجنائية والمنع من السفر والعقوبات المقررة نظاماً.
  </div>

  <!-- Parties Data Table (كل بيان على سطر واحد مستقل بعمودين متناسقين) -->
  <table class="data-table">
    <tr>
      <th>المستلم الأمين:</th>
      <td><strong style="font-size:12px; color:#0f172a;">${e}</strong></td>
    </tr>
    <tr>
      <th>رقم الهوية الوطنية / الإقامة:</th>
      <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${r||"—"}</td>
    </tr>
    <tr>
      <th>رقم الجوال:</th>
      <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${l||"—"}</td>
    </tr>
    ${s&&s.trim()&&s.trim()!==e&&s.trim()!=="الأمين المستلم"?`
    <tr>
      <th>المفوض بالاستلام:</th>
      <td><strong>${s}</strong></td>
    </tr>
    `:""}
    <tr>
      <th>العنوان الوطني للتبليغ:</th>
      <td>${c||"ينبع — المملكة العربية السعودية"}</td>
    </tr>
    <tr>
      <th>الجهة المودعة (صاحب الأمانة):</th>
      <td><strong>${b}</strong> — سجل تجاري: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${y}</span> — الرقم الضريبي: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${v}</span></td>
    </tr>
    <tr>
      <th>طبيعة وموضوع الأمانة:</th>
      <td><strong>${a}</strong></td>
    </tr>
    <tr>
      <th>موعد رد الأمانة / الاستحقاق:</th>
      <td><strong style="color:#b91c1c;">${D}</strong></td>
    </tr>
    ${h?`<tr><th>ملاحظات المستند:</th><td>${h}</td></tr>`:""}
  </table>

  <!-- Amount Highlight Vault -->
  <div class="amount-highlight">
    <div>
      <div style="font-size:10px; font-weight:800; color:#991b1b;">مبلغ وقيمة الأمانة والعهدة المقر باستلامها:</div>
      <div class="amount-words">فقط وقدره: [ ${u} ]</div>
    </div>
    <div class="amount-digits">${z(p)}</div>
  </div>

  <!-- Legal Undertakings & Clauses -->
  <div class="clauses-box">
    <div class="clauses-title">📜 إقرار وتعهدات المستلم الأمين القانونية المشددة:</div>
    <div class="clause-item">
      <strong>1. الإقرار بالقبض والصفة:</strong> أقر وأعترف بكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد استلمت من شركة نظم الإمداد المتطورة المبلغ/الأعيان الموضحة أعلاه على سبيل <strong>الأمانة والعهدة التامة والوديعة الشرعية</strong>، وليست ملكاً لي ولا جزءاً من ذمتي المالية الخاصة.
    </div>
    <div class="clause-item">
      <strong>2. الالتزام بالحفظ والرد الفوري:</strong> أتعهد وألتزم بالمحافظة على هذه الأمانة ورعايتها وردها وتسليمها بالكامل نقداً أو بحساب الشركة البنكي <strong>فور طلب الشركة الدائنة في أي وقت</strong> أو في موعد أقصاه التاريخ المحدد أعلاه دون أدنى تأخير أو مماطلة أو قيد أو شرط.
    </div>
    <div class="clause-item">
      <strong>3. المسؤولية الجنائية الصارمة:</strong> أقر بعلمي التام بأن التصرف في هذا المبلغ أو استهلاكه أو إنكاره أو التأخر في تسليمه فور الطلب يشكل <strong>جريمة خيانة أمانة مكتملة الأركان</strong> بموجب المادة الثانية من نظام مكافحة الاحتيال المالي وخيانة الأمانة (المرسوم الملكي م/79) وتعاقب بالسجن والغرامة والمنع من السفر، مع تحملي لكافة التعويضات وأتعاب المحاماة.
    </div>
    <div class="clause-item">
      <strong>4. الإخطار والاختصاص:</strong> أقر بصحة العنوان الوطني ورقم الجوال المدونين أعلاه، وأعتبرهما موطناً صالحاً لإبلاغي بكافة الإخطارات القضائية، وتختص محاكم المملكة بنظر أي نزاع.
    </div>
  </div>

  <!-- Signatures Grid -->
  <div class="sig-section">
    
    <!-- Trustee Signature (فقط اسم المستلم ورقم الهوية ورقم الجوال والتوقيع لكتابتها يدوي) -->
    <div class="sig-card">
      <div class="sig-card-title">إقرار وتوقيع</div>
      <div class="sig-fields" style="font-size:11.5px; line-height:2.4; margin-top:6px;">
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">اسم المستلم:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الهوية:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الجوال:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px; margin-top:10px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">التوقيع:</span>
          <span style="flex:1; border-bottom:1.5px solid #0f172a; height:18px;"></span>
        </div>
      </div>
    </div>

    <!-- Solidary Guarantor OR Creditor Stamp -->
    ${i?`
    <div class="sig-card">
      <div class="sig-card-title">الكفيل الغارم المتضامن</div>
      <div class="sig-fields" style="font-size:11.5px; line-height:2.4; margin-top:6px;">
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">اسم الكفيل:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الهوية:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الجوال:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px; margin-top:10px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">التوقيع:</span>
          <span style="flex:1; border-bottom:1.5px solid #0f172a; height:18px;"></span>
        </div>
      </div>
    </div>
    `:`
    <div class="sig-card" style="border-color:#0284c7; background:#f8fafc;">
      <div class="sig-card-title" style="color:#0369a1;">اعتماد وخاتم المودع (${b})</div>
      <div class="sig-fields" style="font-size:11px; line-height:1.9;">
        <div>المنشأة: <strong>${b}</strong></div>
        <div>السجل التجاري: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${y}</span></div>
      </div>
      <div class="stamp-container" style="margin-top:4px;">
        ${I?`<img src="${I}" class="stamp-img" alt="ختم الشركة"/>`:'<div style="height:60px;"></div>'}
      </div>
    </div>
    `}

  </div>

  ${i?`
  <!-- If guarantor exists, add company stamp below full width -->
  <div style="margin-top:8px; border:1px solid #cbd5e1; border-radius:6px; padding:6px 14px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; z-index:2; position:relative;">
    <div>
      <div style="font-size:10.5px; font-weight:800; color:#0f172a;">اعتماد المودع: ${b} (سجل: ${y})</div>
      <div style="font-size:8.5px; color:#64748b;">تاريخ التحرير: ${n} م — وثيقة أمانة وعهدة رسمية معتمدة</div>
    </div>
    <div>
      ${I?`<img src="${I}" style="max-height:75px; max-width:140px; object-fit:contain; mix-blend-mode:multiply; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.12));" alt="ختم الشركة"/>`:""}
    </div>
  </div>
  `:""}

  <!-- Footer -->
  <div class="footer-bar">
    <span>سند أمانة وعهدة مالية رقم: <strong style="font-family:'IBM Plex Mono',monospace; color:#0f172a;">${x}</strong></span>
    <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م</span>
    <span>وثيقة رسمية يعتد بها في الإثبات القضائي والملاحقة الجزائية بالمملكة العربية السعودية</span>
  </div>

</div>

</body>
</html>`;E.document.write(P),E.document.close()}async function ot(g,x){g.innerHTML=`
    <div class="filterbar" style="flex-wrap:wrap; gap:8px;">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="tr-filter-search" class="input" placeholder="🔍  بحث بالعميل أو رقم السند أو الهوية…" oninput="window.filterTrustReceipts()"/>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="tr-filter-status" onchange="window.filterTrustReceipts()">
          <option value="">الكل</option>
          <option value="active">قائم (تحت يد المستلم)</option>
          <option value="returned">تم رد الأمانة (مغلق)</option>
          <option value="breached">متأخر / مطالب به قضائياً</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة القائمة</button>
        <button class="btn btn-secondary" onclick="window.openGoodsReceiptAckModal ? window.openGoodsReceiptAckModal() : import('./goods-receipt-ack.js?v=1.0').then(m => m.openGoodsReceiptAckModal())" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color:#fff; border:none; box-shadow:0 4px 12px rgba(2,132,199,0.35); font-weight:800;">
          📜 + إقرار استلام بضاعة وسند لأمر
        </button>
        <button class="btn btn-primary" onclick="window.openTrustReceiptModal()" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border:none; box-shadow:0 4px 12px rgba(30,58,138,0.35);">
          🛡️ + إصدار سند أمانة جديد
        </button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <div class="page-header-left">
          <h1 class="page-title" style="display:flex; align-items:center; gap:8px;">
            <span>🛡️</span> <span>سندات الأمانة والعهدة المالية</span>
          </h1>
          <p class="page-subtitle" id="tr-count">جاري التحميل…</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid" id="tr-kpis" style="margin-bottom:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;"></div>

      <!-- Table Card -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="tr-table">
            <thead>
              <tr>
                <th>رقم السند</th>
                <th>العميل المستلم (الأمين)</th>
                <th>رقم الهوية / السجل</th>
                <th>رقم الجوال</th>
                <th>المبلغ</th>
                <th>تاريخ الاستلام</th>
                <th>موعد الرد</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody id="tr-tbody">
              <tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-2);">جاري تحميل السجلات…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;let e=[];return window.renderTrustReceiptsList=r=>{const l=document.getElementById("tr-tbody"),s=document.getElementById("tr-count"),c=document.getElementById("tr-kpis");s&&(s.textContent=`إجمالي السندات: ${r.length} سند`);let p=0,u=0,n=0;if(r.forEach(t=>{const a=parseFloat(t.amount||0);p+=a,t.status==="returned"?n+=a:t.status!=="cancelled"&&(u+=a)}),c&&(c.innerHTML=`
        <div class="kpi-card" style="border-right:4px solid #3b82f6;">
          <div class="kpi-label">إجمالي مبالغ الأمانات</div>
          <div class="kpi-value mono">${z(p)}</div>
          <div class="kpi-sub">${r.length} سند مسجل</div>
        </div>
        <div class="kpi-card" style="border-right:4px solid #ef4444;">
          <div class="kpi-label">أمانات قائمة تحت يد المستلمين</div>
          <div class="kpi-value mono" style="color:#ef4444;">${z(u)}</div>
          <div class="kpi-sub">${r.filter(t=>t.status==="active"||!t.status).length} سند قائم</div>
        </div>
        <div class="kpi-card" style="border-right:4px solid #10b981;">
          <div class="kpi-label">أمانات تم استردادها وتسويتها</div>
          <div class="kpi-value mono" style="color:#10b981;">${z(n)}</div>
          <div class="kpi-sub">${r.filter(t=>t.status==="returned").length} سند مسدد ومبرأ</div>
        </div>
      `),!!l){if(!r.length){l.innerHTML='<tr><td colspan="9" style="text-align:center; padding:35px; color:var(--text-2);">لا توجد سندات أمانة مسجلة بعد. اضغط على "+ إصدار سند أمانة جديد" لإصدار أول سند.</td></tr>';return}l.innerHTML=r.map(t=>{const a=t.status==="returned",i=t.status==="cancelled",d=a?"✅ تم الاسترداد":i?"⛔ ملغي":"🟢 قائم تحت اليد",o=a?"good":i?"neutral":"bad";return`
        <tr>
          <td class="mono font-bold" style="color:var(--brand);">${t.receiptNumber||"—"}</td>
          <td><strong>${t.custName}</strong></td>
          <td class="mono">${t.custIdNum||"—"}</td>
          <td class="mono">${t.custPhone||"—"}</td>
          <td class="mono font-bold" style="color:#b91c1c;">${z(t.amount||0)}</td>
          <td>${j(t.receiptDate)}</td>
          <td style="font-size:11px;">${t.dueDate==="فور الطلب من الشركة"?'<span class="badge badge-warning">فور الطلب</span>':j(t.dueDate)}</td>
          <td><span class="badge badge-${o}">${d}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-icon sm" onclick="window.reprintTrustReceipt('${t.id}')" title="طباعة السند">🖨️</button>
              ${!a&&!i?`
                <button class="btn btn-icon sm" style="color:#10b981;" onclick="window.markTrustReceiptReturned('${t.id}')" title="إثبات استرداد الأمانة وإبراء الذمة">✅</button>
              `:""}
            </div>
          </td>
        </tr>
      `}).join("")}},window.loadTrustReceipts=async()=>{try{const r=new Promise((c,p)=>setTimeout(()=>p(new Error("Timeout")),2500)),l=R(T.trustReceipts()),s=await Promise.race([l,r]).catch(async c=>{console.warn("[TrustReceipts] Fast fetch timeout or error, checking local db:",c.message);try{return(await Y(T.trustReceipts())).docs.map(u=>({id:u.id,...u.data()}))}catch{return[]}});e=Array.isArray(s)?s:[],e.sort((c,p)=>new Date(p.createdAt||p.receiptDate||0)-new Date(c.createdAt||c.receiptDate||0)),window.renderTrustReceiptsList(e)}catch(r){console.error("Error loading trust receipts:",r),e=[],window.renderTrustReceiptsList([])}},window.filterTrustReceipts=()=>{const r=(document.getElementById("tr-filter-search")?.value||"").trim().toLowerCase(),l=document.getElementById("tr-filter-status")?.value||"",s=e.filter(c=>{const p=!r||(c.custName||"").toLowerCase().includes(r)||(c.receiptNumber||"").toLowerCase().includes(r)||(c.custIdNum||"").includes(r)||(c.custPhone||"").includes(r),u=!l||c.status===l;return p&&u});window.renderTrustReceiptsList(s)},window.reprintTrustReceipt=r=>{const l=e.find(s=>s.id===r);l&&q(l)},window.markTrustReceiptReturned=async r=>{if(confirm("هل أنت متأكد من إثبات استرداد هذه الأمانة بالكامل وإبراء ذمة المستلم؟"))try{await O(T.trustReceipts(),r,{status:"returned",returnedAt:new Date().toISOString()}),$("تم تحديث حالة السند إلى (تم الاسترداد)","success"),await window.loadTrustReceipts()}catch{$("حدث خطأ أثناء التحديث","error")}},window.renderTrustReceiptsList([]),window.loadTrustReceipts().catch(console.warn),()=>{}}typeof window<"u"&&(window.openTrustReceiptModal=Q,window.generateAndPrintTrustReceipt=q);export{q as generateAndPrintTrustReceipt,Q as openTrustReceiptModal,ot as render};
