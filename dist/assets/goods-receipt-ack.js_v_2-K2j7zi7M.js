import{t as ke,d as L,a as W,g as O,C as j,h as ae,b as M,e as R,f as F,c as oe}from"./index-CF9GFeRJ.js";import{getDoc as Y,doc as J,getDocs as Be,collection as Ee}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const k=(...a)=>window.showToast?window.showToast(...a):console.log(...a);function Q(a){if(!a)return 0;if(a.grandTotal!==void 0&&!isNaN(parseFloat(a.grandTotal))&&parseFloat(a.grandTotal)>0)return Math.round(parseFloat(a.grandTotal)*100)/100;if(a.totalWithVat!==void 0&&!isNaN(parseFloat(a.totalWithVat))&&parseFloat(a.totalWithVat)>0)return Math.round(parseFloat(a.totalWithVat)*100)/100;if(a.lineTotalWithVat!==void 0&&!isNaN(parseFloat(a.lineTotalWithVat))&&parseFloat(a.lineTotalWithVat)>0)return Math.round(parseFloat(a.lineTotalWithVat)*100)/100;if(a.unitPrice===void 0&&a.price===void 0&&a.salePrice===void 0&&a.total!==void 0&&!isNaN(parseFloat(a.total)))return Math.round(parseFloat(a.total)*100)/100;const f=parseFloat(a.qty!==void 0?a.qty:a.quantity||1)||0,x=parseFloat(a.unitPrice!==void 0?a.unitPrice:a.price!==void 0?a.price:a.salePrice!==void 0?a.salePrice:0)||0;let m=0;if(a.discount!==void 0&&a.discount!==null&&!isNaN(parseFloat(a.discount))){const d=parseFloat(a.discount);d>0&&d<=100?m=f*x*d/100:d>100&&(m=d)}let u=Math.max(0,f*x-m);if(u===0&&a.total&&!isNaN(parseFloat(a.total))&&(u=parseFloat(a.total)),a.vat!==void 0&&!isNaN(parseFloat(a.vat))&&parseFloat(a.vat)>0)return Math.round((u+parseFloat(a.vat))*100)/100;let n=.15;a.taxCategory==="E"||a.taxCategory==="Z"||a.taxRate===0?n=0:a.taxRate!==void 0&&a.taxRate!==null&&!isNaN(parseFloat(a.taxRate))&&(n=parseFloat(a.taxRate)/100);const r=u*(1+n);return Math.round(r*100)/100}function Ne(a=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).format(a).replace(/هـ/g,"").trim()+" هـ"}catch{return""}}async function ze(){const a=new Date().getFullYear();let f=1;try{const m=(await O(j.goodsReceiptAcks())).filter(u=>(u.docNumber||"").startsWith(`GRA-${a}`));if(m.length>0){const u=m.map(n=>{const r=(n.docNumber||"").split("-");return parseInt(r[r.length-1]||"0",10)}).filter(n=>!isNaN(n));u.length>0&&(f=Math.max(...u)+1)}}catch{f=Math.floor(1e3+Math.random()*9e3)}return`GRA-${a}-${String(f).padStart(4,"0")}`}async function Me(a={}){const f=document.getElementById("gra-modal-overlay");f&&f.remove();const x=ke();let m={name:"شركة نظم الإمداد المتطورة",crNumber:"7054969006",vatNumber:"314996148100003",city:"ينبع",phone:"0549141648",address:"مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414"};try{const e=window.ERP_COMPANY||JSON.parse(localStorage.getItem("idham_company")||"{}");e.name&&Object.assign(m,e),e.logoBase64&&(m.logoUrl=e.logoBase64),e.logoUrl&&(m.logoUrl=e.logoUrl);const[o,l]=await Promise.all([Y(J(L,`companies/${W}/settings`,"company")),Y(J(L,`companies/${W}/settings`,"logo"))]);if(o.exists()&&Object.assign(m,o.data()),l.exists()){const s=l.data();m.logoUrl=s.dataUrl||s.logoBase64||s.url||s.logoUrl||""}}catch{}let u=[],n=null,r=a.invoiceObj||null,d=a.quoteObj||null;try{u=await O(j.customers()),a.customerId?n=u.find(e=>e.id===a.customerId)||null:a.customerObj&&(n=a.customerObj),!r&&a.invoiceId&&(r=await ae("salesInvoices",a.invoiceId)),!d&&a.quoteId&&(d=await ae("quotations",a.quoteId))}catch(e){console.warn("[GoodsReceiptAck] Preload error:",e)}r&&!n?n=u.find(e=>e.id===r.customerId||e.name===r.customerName)||{id:r.customerId,name:r.customerName,phone:r.customerPhone,crNumber:r.customerTaxNumber||r.customerCr}:d&&!n&&(n=u.find(e=>e.id===d.customerId||e.name===d.customerName)||{id:d.customerId,name:d.customerName,phone:d.customerPhone,crNumber:d.customerCr||d.customerTaxNumber});let S=[];const P=r?r.items||r.lines||[]:d?d.items||[]:[];P.length>0?S=P.map((e,o)=>({index:o+1,name:e.productName||e.name||e.description||"",unit:e.unit||e.unitName||"كرتون",qty:parseFloat(e.qty!==void 0?e.qty:e.quantity||1)||1,total:Q(e)})):S=[{index:1,name:"",unit:"كرتون",qty:"",total:""},{index:2,name:"",unit:"كرتون",qty:"",total:""},{index:3,name:"",unit:"كرتون",qty:"",total:""}];const B=await ze(),v=S.reduce((e,o)=>e+(parseFloat(o.total)||0),0);let y=0,G=0;r?(y=parseFloat(r.total||r.totalWithVat||r.netTotal||0)||v,G=parseFloat(r.paidAmount||(r.paymentMethod==="cash"?y:0))):d?(y=parseFloat(d.grandTotal||d.total||0)||v,G=0):y=v;const I=Math.max(0,y-G),w=document.createElement("div");w.className="modal-overlay active",w.id="gra-modal-overlay",w.style.zIndex="9999",w.innerHTML=`
    <style>
      #gra-modal-container {
        max-width: 990px;
        width: 96%;
        max-height: 94vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1);
        background: var(--bg-card, #111827);
        border: 1px solid var(--border, #374151);
        font-family: var(--font-body, 'IBM Plex Sans Arabic', -apple-system, sans-serif);
      }
      .gra-header {
        background: linear-gradient(135deg, #09122c 0%, #0369a1 50%, #0284c7 100%);
        color: #fff;
        padding: 18px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #38bdf8;
        flex-shrink: 0;
      }
      .gra-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #f0f9ff;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 700;
      }
      .gra-section-box {
        background: var(--bg-2, rgba(30, 41, 59, 0.45));
        border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .gra-section-title {
        font-size: 13.5px;
        font-weight: 900;
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        padding-bottom: 8px;
        margin-bottom: 2px;
      }
      .gra-input {
        background: var(--bg-1, #0f172a);
        border: 1px solid var(--border, #334155);
        color: var(--text-0, #f8fafc);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 13px;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
        font-family: inherit;
      }
      .gra-input:focus {
        outline: none;
        border-color: #38bdf8;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
        background: var(--bg-card, #1e293b);
      }
      .gra-items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .gra-items-table th {
        background: rgba(15, 23, 42, 0.7);
        color: #94a3b8;
        font-weight: 800;
        padding: 8px 10px;
        border: 1px solid #334155;
        text-align: right;
      }
      .gra-items-table td {
        padding: 5px;
        border: 1px solid #334155;
      }
      .gra-items-table input {
        background: transparent;
        border: 1px solid transparent;
        color: #fff;
        padding: 6px 8px;
        width: 100%;
        box-sizing: border-box;
        border-radius: 6px;
        font-size: 13px;
      }
      .gra-items-table input:focus {
        background: #0f172a;
        border-color: #38bdf8;
        outline: none;
      }
      .gra-legal-preview {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid #334155;
        border-right: 4px solid #38bdf8;
        border-radius: 10px;
        padding: 14px 18px;
        font-size: 12px;
        line-height: 1.7;
        color: #cbd5e1;
      }
      .gra-legal-clause {
        margin-bottom: 8px;
      }
      .gra-legal-clause strong {
        color: #38bdf8;
      }
    </style>

    <div id="gra-modal-container">
      
      <!-- Executive Header -->
      <div class="gra-header">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">📜</div>
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3 style="margin:0; font-size:17.5px; font-weight:900; letter-spacing:0.3px; color:#fff;">إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها مرتبط بسند لأمر</h3>
              <span class="gra-badge">⚖️ نظام الإثبات ونظام الأوراق التجارية</span>
            </div>
            <div style="font-size:11.5px; color:#e0f2fe; margin-top:3px; opacity:0.95;">
              وثيقة إثبات استلام عيني ملزمة تفصل بين المنشأة والمستلم المفوض لمنع دعاوى الصورية ومنازعات التنفيذ
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary sm" onclick="window.switchToTrustReceiptModal()" style="font-size:12px; background:rgba(255,255,255,0.12); color:#fff; border:1px solid rgba(255,255,255,0.25);">
            🛡️ التبديل لسند الأمانة النقدي
          </button>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-modal-overlay').remove()" style="color:#fff; font-size:22px; border:none; background:transparent; cursor:pointer;" title="إغلاق">✕</button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="modal-body" style="padding:22px 26px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:18px;">
        
        <!-- Document Meta Ribbon -->
        <div style="display:grid; grid-template-columns:1.2fr 1.2fr 1.6fr; gap:12px; background:rgba(15, 23, 42, 0.45); padding:12px 16px; border-radius:12px; border:1px solid rgba(148, 163, 184, 0.15);">
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">رقم المستند *</label>
            <input type="text" id="gra-doc-number" class="gra-input mono" style="font-weight:800; color:#38bdf8;" value="${B}" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">تاريخ التحرير *</label>
            <input type="date" id="gra-doc-date" class="gra-input" style="font-weight:700;" value="${x}" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">مكان التحرير *</label>
            <input type="text" id="gra-doc-place" class="gra-input" value="ينبع الصناعية — المملكة العربية السعودية" />
          </div>
        </div>

        <!-- Section 1 & 2: Parties Data Grid -->
        <div style="display:grid; grid-template-columns:1fr 1.35fr; gap:16px;">
          
          <!-- First: Seller (Creditor) -->
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>🏢 أولاً: بيانات البائع «الدائن»</span>
              <span style="font-size:11px; color:#94a3b8;">(الطرف الأول)</span>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">الاسم / اسم المنشأة</label>
              <input type="text" id="gra-seller-name" class="gra-input font-bold" value="${m.name}" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">السجل التجاري</label>
                <input type="text" id="gra-seller-cr" class="gra-input mono" value="${m.crNumber}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">الرقم الضريبي</label>
                <input type="text" id="gra-seller-vat" class="gra-input mono" value="${m.vatNumber}" />
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">العنوان الرسمي</label>
              <input type="text" id="gra-seller-address" class="gra-input" value="${m.address}" />
            </div>
          </div>

          <!-- Second: Buyer (Debtor) & Authorized Representative -->
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>👤 ثانياً: بيانات المشتري «المدين» والمستلم المفوض</span>
              <span style="font-size:11px; color:#38bdf8;">(الفاتورة + المفوض الفعلي)</span>
            </div>

            <!-- Customer Quick Selector (Establishment) -->
            <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم المنشأة / المشتري (الفاتورة باسمه) *</label>
                <input type="text" id="gra-buyer-name" class="gra-input font-bold" value="${n?n.name:""}" placeholder="اسم المنشأة أو العميل..." list="gra-cust-datalist" onchange="window.handleGraCustomerSelect(this.value)" />
                <datalist id="gra-cust-datalist">
                  ${u.map(e=>`<option value="${e.name}">${e.name} — س.ت/هوية: ${e.crNumber||e.idNumber||""}</option>`).join("")}
                </datalist>
                <input type="hidden" id="gra-buyer-id" value="${n?n.id:""}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">سجل تجاري / رقم هوية المنشأة</label>
                <input type="text" id="gra-buyer-idnum" class="gra-input mono" value="${n&&(n.crNumber||n.idNumber||n.nationalId)||""}" placeholder="70xxxxxxxx أو 10xxxxxxxx" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">هاتف / جوال المنشأة</label>
                <input type="text" id="gra-buyer-phone" class="gra-input mono" value="${n&&(n.phone||n.mobile)||""}" placeholder="05xxxxxxxx" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">العنوان الوطني للمنشأة</label>
                <input type="text" id="gra-buyer-address" class="gra-input" value="${n&&([n.address,n.city].filter(Boolean).join(" — ")||n.city)||"ينبع — المملكة العربية السعودية"}" />
              </div>
            </div>

            <!-- Receiver / Authorized Person Explicit Block -->
            <div style="background:rgba(15, 23, 42, 0.6); border:1px solid #3b82f6; border-radius:10px; padding:10px 12px; margin-top:4px;">
              <div style="font-size:11.5px; font-weight:800; color:#60a5fa; margin-bottom:8px; display:flex; justify-content:space-between;">
                <span>✍️ بيانات الشخص الطبيعي المستلم الفعلي (المفوض بالاستلام والتوقيع):</span>
                <span style="font-size:10px; color:#94a3b8;">(اتركه فارغاً ليكتب باليد عند التسليم)</span>
              </div>
              
              <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:6px;">
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">اسم المستلم / المفوض الرباعي</label>
                  <input type="text" id="gra-rep-name" class="gra-input" value="${n&&(n.contactPerson||n.managerName)||""}" placeholder="اكتب اسم المستلم أو اتركه فارغاً..." />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">الصفة وسند التفويض</label>
                  <input type="text" id="gra-rep-title" class="gra-input" value="${n?.contactPerson?"مفوض بالاستلام":""}" placeholder="مدير فرع / أمين مستودع / مفوض..." />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">رقم هوية / إقامة المستلم</label>
                  <input type="text" id="gra-rep-id" class="gra-input mono" placeholder="10xxxxxxxx أو 20xxxxxxxx" />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">جنسية المستلم</label>
                  <input type="text" id="gra-rep-nationality" class="gra-input" placeholder="سعودي / مصري / يمني..." />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">رقم جوال المستلم</label>
                  <input type="text" id="gra-rep-phone" class="gra-input mono" placeholder="05xxxxxxxx" />
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Section 3: Goods Delivered (Table & Details) -->
        <div class="gra-section-box">
          <div class="gra-section-title">
            <span>📦 ثالثاً: بيانات البضاعة المستلمة</span>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary sm" onclick="window.promptImportInvoiceToGra()" style="font-size:11px; background:#0284c7; color:#fff; border:none; display:inline-flex; align-items:center; gap:5px;">
                📥 استيراد من فاتورة مبيعات
              </button>
              <button type="button" class="btn btn-secondary sm" onclick="window.promptImportQuoteToGra()" style="font-size:11px; background:#059669; color:#fff; border:none; display:inline-flex; align-items:center; gap:5px;">
                📑 استيراد من عرض سعر
              </button>
              <button type="button" class="btn btn-ghost sm" onclick="window.addGraItemRow()" style="font-size:11px; border:1px solid #475569;">
                ➕ إضافة صنف
              </button>
              <button type="button" class="btn btn-ghost sm" onclick="window.addGra5EmptyRows()" style="font-size:11px; border:1px solid #475569;">
                ➕ إضافة 5 أسطر
              </button>
            </div>
          </div>

          <!-- Items Table Container -->
          <div style="max-height:280px; overflow-y:auto; border:1px solid #334155; border-radius:10px;">
            <table class="gra-items-table" id="gra-table-items">
              <thead>
                <tr>
                  <th style="width:40px; text-align:center;">م</th>
                  <th>الصنف ووصفه</th>
                  <th style="width:110px;">الوحدة</th>
                  <th style="width:90px;">الكمية</th>
                  <th style="width:140px;">إجمالي القيمة بالريال</th>
                  <th style="width:40px; text-align:center;">إجراء</th>
                </tr>
              </thead>
              <tbody id="gra-items-tbody">
                ${S.map((e,o)=>`
                  <tr data-row-idx="${o+1}">
                    <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#94a3b8;">${o+1}</td>
                    <td><input type="text" class="gra-it-name" value="${e.name||""}" placeholder="اسم الصنف والوصف..." /></td>
                    <td><input type="text" class="gra-it-unit" value="${e.unit||"كرتون"}" placeholder="كرتون / حبة..." /></td>
                    <td><input type="number" step="any" class="gra-it-qty mono" value="${e.qty||""}" placeholder="0" oninput="window.calcGraTotals()" /></td>
                    <td><input type="number" step="0.01" class="gra-it-total mono font-bold" value="${e.total||""}" placeholder="0.00" oninput="window.calcGraTotals()" /></td>
                    <td style="text-align:center;">
                      <button type="button" class="btn btn-icon sm btn-ghost" onclick="this.closest('tr').remove(); window.reindexGraRows(); window.calcGraTotals();" style="color:#ef4444;" title="حذف">✕</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- Totals & Tafqeet Vault -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; background:rgba(15, 23, 42, 0.6); padding:14px 18px; border-radius:12px; border:1px solid #334155; align-items:center;">
            <div>
              <label style="font-size:11.5px; font-weight:800; color:#38bdf8; display:block; margin-bottom:4px;">
                إجمالي قيمة البضاعة شامل الضريبة (إن انطبقت) بالريال *
              </label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="number" id="gra-total-goods" class="gra-input mono font-bold" style="font-size:20px; color:#10b981; height:46px;" value="${y>0?y:""}" oninput="window.calcGraTotalsManually()" placeholder="0.00" />
                <span style="font-size:12px; font-weight:800; color:#10b981; background:rgba(16, 185, 129, 0.15); padding:8px 12px; border-radius:8px;">ر.س SAR</span>
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">المبلغ كتابة وتفقيطاً:</label>
              <div id="gra-tafqeet-goods" style="font-size:13px; font-weight:800; color:#fde047; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); padding:10px 14px; border-radius:10px;">
                ${y>0?M(y)+" فقط لا غير":"يتم التفقيط آلياً..."}
              </div>
              <input type="hidden" id="gra-tafqeet-words" value="${y>0?M(y)+" فقط لا غير":""}" />
            </div>
          </div>

          <!-- Goods Logistics Meta Grid -->
          <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">أرقام الفواتير وتواريخها</label>
              <input type="text" id="gra-invoices-ref" class="gra-input" value="${r?(r.invoiceNumber||r.id)+" بتاريخ "+R(r.date):d?"عرض سعر رقم "+(d.quoteNumber||d.id)+(d.date?" بتاريخ "+R(d.date):""):""}" placeholder="فاتورة رقم … أو عرض سعر رقم …" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">رقم إذن الصرف وتاريخه</label>
              <input type="text" id="gra-dispatch-ref" class="gra-input" value="${r?"إذن صرف "+(r.invoiceNumber||r.id):d?"إذن صرف بضاعة لعرض سعر "+(d.quoteNumber||d.id):""}" placeholder="إذن صرف رقم …" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">المخزن المسلم منه</label>
              <input type="text" id="gra-warehouse-name" class="gra-input" value="${r&&(r.warehouseName||r.warehouse)||"المستودع الرئيسي"}" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ الاستلام الفعلي *</label>
              <input type="date" id="gra-actual-date" class="gra-input" value="${x}" />
            </div>
          </div>

        </div>

        <!-- Section 4: Acknowledgment & Promissory Note Linking -->
        <div class="gra-section-box">
          <div class="gra-section-title">
            <span>⚖️ رابعاً: الإقرار بالاستلام والمديونية وارتباط السند لأمر</span>
            <span style="font-size:11.5px; color:#38bdf8;">(حماية تنفيذية وقضائية كاملة)</span>
          </div>

          <!-- Amounts Breakdown Ribbon -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1.3fr; gap:12px; background:rgba(30, 58, 138, 0.2); border:1px solid rgba(59, 130, 246, 0.3); border-radius:12px; padding:12px 16px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">قيمة البضاعة المستلمة:</label>
              <input type="number" id="gra-val-received" class="gra-input mono font-bold" value="${y>0?y:""}" oninput="window.calcGraBalance()" placeholder="0.00" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">سُدد من ثمنها:</label>
              <input type="number" id="gra-val-paid" class="gra-input mono" value="${G>0?G:"0.00"}" oninput="window.calcGraBalance()" placeholder="0.00" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:800; color:#ef4444; display:block; margin-bottom:3px;">بقي في ذمة المشتري (المتبقي الآجل) *:</label>
              <input type="number" id="gra-val-remaining" class="gra-input mono font-bold" style="color:#ef4444; font-size:16px;" value="${I>0?I:""}" placeholder="0.00" />
            </div>
            <div style="grid-column:1/-1;">
              <div style="font-size:11.5px; color:#e2e8f0;">
                المبلغ المتبقي كتابةً: <strong id="gra-tafqeet-remaining" style="color:#fde047;">${I>0?M(I)+" ريال سعودي فقط لا غير":"..."}</strong>
              </div>
            </div>
          </div>

          <!-- Promissory Note Linked Data (البند 3) -->
          <div style="background:rgba(15, 23, 42, 0.7); border:1.5px solid #38bdf8; border-radius:12px; padding:14px 18px;">
            <div style="font-size:12.5px; font-weight:900; color:#38bdf8; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
              <span>🔗</span> <span>بيانات السند لأمر المرتبط بذات الدين والمستلم مقابله البضاعة:</span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم محرر السند (المفوض أو المشتري)</label>
                <input type="text" id="gra-pn-issuer" class="gra-input font-bold" value="" placeholder="اتركه فارغاً ليكتب باليد بالقلم أو اكتب الاسم..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">لصالح المستفيد (الدائن/البائع) *</label>
                <input type="text" id="gra-pn-beneficiary" class="gra-input font-bold" value="${m.name}" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:11px; font-weight:800; color:#fde047; display:block; margin-bottom:3px;">رقم السند لأمر / رقمه الإلكتروني (نافذ)</label>
                <input type="text" id="gra-pn-number" class="gra-input mono font-bold" value="" placeholder="اتركه فارغاً للتعبئة باليد أو اكتب الرقم..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ إنشائه</label>
                <input type="date" id="gra-pn-date" class="gra-input" value="${x}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ استحقاقه</label>
                <input type="date" id="gra-pn-due-date" class="gra-input" value="" placeholder="تاريخ الاستحقاق..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:800; color:#10b981; display:block; margin-bottom:3px;">قيمته بالريال *</label>
                <input type="number" id="gra-pn-amount" class="gra-input mono font-bold" style="color:#10b981;" value="${I>0?I:""}" placeholder="0.00" />
              </div>
            </div>

          </div>

          <!-- Full Legal Clauses Display -->
          <div class="gra-legal-preview">
            <div style="font-weight:900; color:#f8fafc; margin-bottom:8px; font-size:13px;">
              📜 نصوص الإقرار القانونية الستة (المدونة بالكامل في الوثيقة المطبوعة دون اختصار):
            </div>
            <div class="gra-legal-clause">
              <strong>1. الاستلام الفعلي:</strong> استلمت فعليًا من البائع البضاعة المبينة بهذا المستند والفواتير وإذن الصرف المشار إليها، وذلك على سبيل الشراء بالأجل، وتسلمتها بالكميات والأوصاف المثبتة، بعد فحصها ظاهرًا، مع إثبات أي نقص أو تحفظ في خانة الملاحظات أدناه، ودون إخلال بالحقوق المتعلقة بالعيوب الخفية وفقًا للنظام.
            </div>
            <div class="gra-legal-clause">
              <strong>2. إثبات المديونية:</strong> بلغت قيمة البضاعة المستلمة مبلغًا قدره الموضح أعلاه، وسُدد منه المبلغ الموضح، وبقي في ذمة المشتري لصالح البائع المبلغ المتبقي المثبت تفقيطاً.
            </div>
            <div class="gra-legal-clause">
              <strong>3. الربط بالسند لأمر:</strong> أقر بأن المبلغ المتبقي المذكور أعلاه يمثل ثمن بضاعة تم استلامها فعلًا، وأنه الدين ذاته المثبت بالسند لأمر المحرر أعلاه برقم وتاريخ واستحقاق محددين.
            </div>
            <div class="gra-legal-clause">
              <strong>4. نفي استلام النقد (سبب الدين عيني):</strong> أقر بأن سبب تحرير السند لأمر المشار إليه هو المديونية الناشئة عن شراء واستلام البضاعة المبينة أعلاه، وأن هذا الإقرار يثبت استلام البضاعة التي نشأت عنها المديونية، ولا يتضمن إقرارًا باستلام مبلغ نقدي.
            </div>
            <div class="gra-legal-clause">
              <strong>5. عدم ازدواجية المطالبة:</strong> لا يُعد توقيع هذا المستند سدادًا للسند لأمر أو إبراءً من الدين، كما لا ينشئ دينًا إضافيًا مستقلًا عن الدين المثبت بالسند. ويُخصم من الرصيد المستحق كل سداد فعلي أو تسوية ثابتة بين الطرفين، ولا يجوز استيفاء الدين ذاته أكثر من مرة.
            </div>
            <div class="gra-legal-clause">
              <strong>6. حجية المرفقات:</strong> تعد الفواتير وإذن الصرف وكشف الأصناف المرفقة، المحددة أرقامها أعلاه والموقعة من المستلم، مكملة لهذا الإقرار.
            </div>
          </div>

        </div>

        <!-- Section 5: Notes & Signatures -->
        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:14px;">
          
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>📝 الملاحظات والتحفظات</span>
            </div>
            <textarea id="gra-notes" class="gra-input" rows="3" placeholder="اكتب أي ملاحظات أو تحفظات على حالة البضاعة أو التسليم إن وجدت..."></textarea>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">المرفقات (عدد المستندات)</label>
                <input type="text" id="gra-attachments-count" class="gra-input" value="1 (فاتورة وكشف أصناف وإذن صرف)" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">إجمالي الصفحات</label>
                <input type="text" id="gra-total-pages" class="gra-input" value="2" />
              </div>
            </div>
          </div>

          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>✍️ أسماء الموقعين والمعتمدين</span>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم المستلم / المفوض بالتوقيع</label>
              <input type="text" id="gra-sig-buyer" class="gra-input font-bold" value="" placeholder="اتركه فارغاً ليكتب باليد بالقلم..." />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم مسؤول التسليم من المخزن</label>
              <input type="text" id="gra-sig-warehouse" class="gra-input" value="${window._salesUser?.displayName||window._salesUser?.name||"أمين المستودع"}" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اعتماد البائع (الاسم والصفة)</label>
              <input type="text" id="gra-sig-seller" class="gra-input" value="المدير العام / المفوض بالتوقيع" />
            </div>
          </div>

        </div>

      </div>

      <!-- Executive Footer Actions -->
      <div style="background:var(--bg-2, #1f2937); padding:16px 24px; border-top:1px solid var(--border, #374151); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <div style="font-size:12px; color:#94a3b8;">
          💡 يدعم المستند أكثر من 20 صنفاً مع التقسيم التلقائي للصفحات وتوقيع كشف الأصناف وختم المنشأة.
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('gra-modal-overlay').remove()">
            إلغاء
          </button>
          <button type="button" class="btn btn-primary" id="btn-save-print-gra" onclick="window.submitGoodsReceiptAck(true)" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border:none; padding:10px 22px; font-weight:900; font-size:14px; box-shadow:0 4px 14px rgba(2, 132, 199, 0.4);">
            🖨️ حفظ وطباعة الوثيقة الرسمية
          </button>
          <button type="button" class="btn btn-ghost" onclick="window.submitGoodsReceiptAck(false)" style="border:1px solid #475569; color:#cbd5e1;">
            معاينة وطباعة دون حفظ
          </button>
        </div>
      </div>

    </div>
  `,document.body.appendChild(w),window.reindexGraRows=()=>{document.querySelectorAll("#gra-items-tbody tr").forEach((e,o)=>{e.setAttribute("data-row-idx",o+1);const l=e.querySelector("td");l&&(l.textContent=o+1)})},window.addGraItemRow=(e="",o="كرتون",l="",s="")=>{const p=document.getElementById("gra-items-tbody");if(!p)return;const i=p.querySelectorAll("tr").length+1,t=document.createElement("tr");t.setAttribute("data-row-idx",i),t.innerHTML=`
      <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#94a3b8;">${i}</td>
      <td><input type="text" class="gra-it-name" value="${e}" placeholder="اسم الصنف والوصف..." /></td>
      <td><input type="text" class="gra-it-unit" value="${o}" placeholder="كرتون / حبة..." /></td>
      <td><input type="number" step="any" class="gra-it-qty mono" value="${l}" placeholder="0" oninput="window.calcGraTotals()" /></td>
      <td><input type="number" step="0.01" class="gra-it-total mono font-bold" value="${s}" placeholder="0.00" oninput="window.calcGraTotals()" /></td>
      <td style="text-align:center;">
        <button type="button" class="btn btn-icon sm btn-ghost" onclick="this.closest('tr').remove(); window.reindexGraRows(); window.calcGraTotals();" style="color:#ef4444;" title="حذف">✕</button>
      </td>
    `,p.appendChild(t)},window.addGra5EmptyRows=()=>{for(let e=0;e<5;e++)window.addGraItemRow()},window.calcGraTotals=()=>{let e=0;document.querySelectorAll(".gra-it-total").forEach(t=>{const c=parseFloat(t.value||0);isNaN(c)||(e+=c)});const o=document.getElementById("gra-total-goods");o&&(o.value=e>0?e.toFixed(2):"");const l=document.getElementById("gra-tafqeet-goods"),s=document.getElementById("gra-tafqeet-words"),p=e>0?M(e)+" فقط لا غير":"يتم التفقيط آلياً...";l&&(l.textContent=p),s&&(s.value=p);const i=document.getElementById("gra-val-received");i&&(i.value=e>0?e.toFixed(2):""),window.calcGraBalance()},window.calcGraTotalsManually=()=>{const e=parseFloat(document.getElementById("gra-total-goods")?.value||0),o=document.getElementById("gra-tafqeet-goods"),l=document.getElementById("gra-tafqeet-words"),s=e>0?M(e)+" فقط لا غير":"يتم التفقيط آلياً...";o&&(o.textContent=s),l&&(l.value=s);const p=document.getElementById("gra-val-received");p&&(p.value=e>0?e.toFixed(2):""),window.calcGraBalance()},window.calcGraBalance=()=>{const e=parseFloat(document.getElementById("gra-val-received")?.value||0),o=parseFloat(document.getElementById("gra-val-paid")?.value||0),l=Math.max(0,e-o),s=document.getElementById("gra-val-remaining");s&&(s.value=l>0?l.toFixed(2):"0.00");const p=document.getElementById("gra-tafqeet-remaining");p&&(p.textContent=l>0?M(l)+" ريال سعودي فقط لا غير":"صفر ريال سعودي");const i=document.getElementById("gra-pn-amount");i&&(!i.value||parseFloat(i.value)===0)&&(i.value=l>0?l.toFixed(2):"")},window.handleGraCustomerSelect=e=>{const o=u.find(l=>l.name===e);o&&(document.getElementById("gra-buyer-id").value=o.id,document.getElementById("gra-buyer-idnum").value=o.crNumber||o.idNumber||o.nationalId||"",document.getElementById("gra-buyer-phone").value=o.phone||o.mobile||"",document.getElementById("gra-buyer-address").value=[o.address,o.city].filter(Boolean).join(" — ")||"ينبع — المملكة العربية السعودية",o.contactPerson&&(document.getElementById("gra-rep-name").value=o.contactPerson,document.getElementById("gra-rep-title").value=o.managerName||"مفوض بالاستلام"))},window.switchToTrustReceiptModal=()=>{document.getElementById("gra-modal-overlay")?.remove(),typeof window.openTrustReceiptModal=="function"&&window.openTrustReceiptModal(n)},window.promptImportInvoiceToGra=async()=>{const e=document.getElementById("gra-buyer-id")?.value,o=document.getElementById("gra-buyer-name")?.value;let l=[],s=[];try{k("جاري البحث عن فواتير العميل...","info"),s=await O(j.salesInvoices()),(e||o)&&(l=s.filter(t=>e&&t.customerId===e||o&&t.customerName&&t.customerName.trim().toLowerCase()===o.trim().toLowerCase()).sort((t,c)=>(c.date||"").localeCompare(t.date||"")).slice(0,20))}catch(t){console.warn("Could not load invoices:",t)}const p=()=>{const t=prompt("أدخل رقم الفاتورة للبحث المباشر عنها في النظام (مثال: INV-042050):");if(!t)return;const c=t.trim().toLowerCase(),g=s.find(h=>(h.invoiceNumber||"").toLowerCase().includes(c)||(h.id||"").toLowerCase().includes(c));g?window.applyInvoiceToGra(g):k("لم يتم العثور على الفاتورة المطلوبة: "+t,"error")};if(!l.length){p();return}const i=document.createElement("div");i.className="modal-overlay active",i.id="gra-pick-inv-overlay",i.style.zIndex="10005",i.innerHTML=`
      <div class="modal-box" style="max-width:560px; background:var(--bg-card, #111827); border-radius:14px; padding:20px; border:1px solid var(--border, #374151); box-shadow:0 20px 50px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; color:#38bdf8; font-size:15px; font-weight:800; display:flex; align-items:center; gap:6px;">
            <span>📥</span> <span>اختر فاتورة المبيعات لاستيراد أصنافها وبياناتها:</span>
          </h4>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-pick-inv-overlay').remove()" style="color:#94a3b8; font-size:18px;">✕</button>
        </div>
        <div style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
          فواتير المبيعات المسجلة باسم <strong>${o||"العميل المحدد"}</strong> (${l.length} فاتورة):
        </div>
        <div style="max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${l.map(t=>`
            <div style="padding:11px 14px; background:var(--bg-1, #0f172a); border:1px solid var(--border, #334155); border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;" 
                 onmouseover="this.style.borderColor='#38bdf8'; this.style.background='rgba(2, 132, 199, 0.1)';"
                 onmouseout="this.style.borderColor='var(--border, #334155)'; this.style.background='var(--bg-1, #0f172a)';"
                 onclick="window.applyInvoiceToGraById('${t.id}')">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="color:#fff; font-size:13.5px; font-family:'IBM Plex Mono',monospace;">${t.invoiceNumber||t.id}</strong>
                  <span style="font-size:10px; padding:2px 7px; border-radius:6px; background:rgba(56, 189, 248, 0.15); color:#38bdf8; font-weight:700;">${t.status==="paid"?"مدفوعة":t.status==="posted"?"مرحلة":t.status||"معتمدة"}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-top:3px;">
                  تاريخ: ${R(t.date)} — ${(t.items||t.lines||[]).length} صنف — ${t.customerName||""}
                </div>
              </div>
              <div class="mono font-bold" style="color:#10b981; font-size:14px; text-align:left; direction:ltr;">
                ${F(t.total||t.totalWithVat||t.netTotal||0)}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-secondary sm" onclick="document.getElementById('gra-pick-inv-overlay').remove()">إلغاء</button>
          <button class="btn btn-ghost sm" id="gra-inv-manual-btn" style="color:#38bdf8; font-size:11.5px; border:1px solid #334155;">
            🔍 أو البحث برقم فاتورة أخرى...
          </button>
        </div>
      </div>
    `,document.body.appendChild(i),document.getElementById("gra-inv-manual-btn")?.addEventListener("click",()=>{document.getElementById("gra-pick-inv-overlay")?.remove(),p()}),window.applyInvoiceToGraById=t=>{document.getElementById("gra-pick-inv-overlay")?.remove();const c=s.find(g=>g.id===t)||l.find(g=>g.id===t);c&&window.applyInvoiceToGra(c)}},window.applyInvoiceToGra=e=>{if(!e)return;const o=document.getElementById("gra-items-tbody");if(!o)return;o.innerHTML="";const l=e.items||e.lines||[];l.length>0?l.forEach((t,c)=>{const g=Q(t);window.addGraItemRow(t.productName||t.name||t.description||"",t.unit||t.unitName||"كرتون",t.qty!==void 0?t.qty:t.quantity||1,g.toFixed(2))}):window.addGraItemRow("بضائع ومواد غذائية متنوعة","شحنة",1,parseFloat(e.total||e.totalWithVat||0).toFixed(2)),document.getElementById("gra-invoices-ref").value=(e.invoiceNumber||e.id)+" بتاريخ "+R(e.date),document.getElementById("gra-dispatch-ref").value="إذن صرف "+(e.invoiceNumber||e.id),document.getElementById("gra-warehouse-name").value=e.warehouseName||e.warehouse||"المستودع الرئيسي",e.customerName&&(!document.getElementById("gra-buyer-name")?.value||document.getElementById("gra-buyer-name")?.value==="عميل نقدي")&&(document.getElementById("gra-buyer-name").value=e.customerName,typeof window.handleGraCustomerSelect=="function"&&window.handleGraCustomerSelect(e.customerName));let s=parseFloat(e.total||e.totalWithVat||e.netTotal||0);if(s<=0){let t=0;document.querySelectorAll(".gra-it-total").forEach(c=>{const g=parseFloat(c.value||0);isNaN(g)||(t+=g)}),s=t}const p=parseFloat(e.paidAmount||(e.paymentMethod==="cash"?s:0)),i=Math.max(0,s-p);document.getElementById("gra-total-goods").value=s.toFixed(2),document.getElementById("gra-val-received").value=s.toFixed(2),document.getElementById("gra-val-paid").value=p.toFixed(2),document.getElementById("gra-val-remaining").value=i.toFixed(2),document.getElementById("gra-pn-amount").value=i.toFixed(2),window.calcGraTotals(),k(`تم استيراد أصناف وبيانات الفاتورة ${e.invoiceNumber||e.id} بنجاح`,"success")},window.promptImportQuoteToGra=async()=>{const e=document.getElementById("gra-buyer-id")?.value,o=document.getElementById("gra-buyer-name")?.value;let l=[],s=[];try{k("جاري البحث في عروض الأسعار...","info"),s=await O(j.quotations()),(e||o)&&(l=s.filter(t=>e&&t.customerId===e||o&&t.customerName&&t.customerName.trim().toLowerCase()===o.trim().toLowerCase()).sort((t,c)=>(c.date||"").localeCompare(t.date||"")).slice(0,20))}catch(t){console.warn("Could not load quotations:",t);try{s=(await Be(Ee(L,`companies/${W}/quotations`))).docs.map(g=>({id:g.id,...g.data()})),(e||o)&&(l=s.filter(g=>e&&g.customerId===e||o&&g.customerName&&g.customerName.trim().toLowerCase()===o.trim().toLowerCase()).sort((g,h)=>(h.date||"").localeCompare(g.date||"")).slice(0,20))}catch{}}const p=()=>{const t=prompt("أدخل رقم عرض السعر للبحث المباشر عنه في النظام (مثال: QT-005101):");if(!t)return;const c=t.trim().toLowerCase(),g=s.find(h=>(h.quoteNumber||"").toLowerCase().includes(c)||(h.id||"").toLowerCase().includes(c)||(h.customerName||"").toLowerCase().includes(c));g?window.applyQuoteToGra(g):k("لم يتم العثور على عرض السعر المطلوب: "+t,"error")};if(!l.length){p();return}const i=document.createElement("div");i.className="modal-overlay active",i.id="gra-pick-quote-overlay",i.style.zIndex="10005",i.innerHTML=`
      <div class="modal-box" style="max-width:560px; background:var(--bg-card, #111827); border-radius:14px; padding:20px; border:1px solid var(--border, #374151); box-shadow:0 20px 50px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; color:#34d399; font-size:15px; font-weight:800; display:flex; align-items:center; gap:6px;">
            <span>📑</span> <span>اختر عرض السعر لاستيراد أصنافه وبياناته:</span>
          </h4>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-pick-quote-overlay').remove()" style="color:#94a3b8; font-size:18px;">✕</button>
        </div>
        <div style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
          عروض الأسعار المسجلة باسم <strong>${o||"العميل المحدد"}</strong> (${l.length} عرض):
        </div>
        <div style="max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${l.map(t=>`
            <div style="padding:11px 14px; background:var(--bg-1, #0f172a); border:1px solid var(--border, #334155); border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;" 
                 onmouseover="this.style.borderColor='#34d399'; this.style.background='rgba(5, 150, 105, 0.1)';"
                 onmouseout="this.style.borderColor='var(--border, #334155)'; this.style.background='var(--bg-1, #0f172a)';"
                 onclick="window.applyQuoteToGraById('${t.id}')">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="color:#fff; font-size:13.5px; font-family:'IBM Plex Mono',monospace;">${t.quoteNumber||t.id}</strong>
                  <span style="font-size:10px; padding:2px 7px; border-radius:6px; background:rgba(52, 211, 153, 0.15); color:#34d399; font-weight:700;">${t.status||"معتمد"}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-top:3px;">
                  تاريخ: ${R(t.date)} — ${(t.items||[]).length} صنف — ${t.customerName||""}
                </div>
              </div>
              <div class="mono font-bold" style="color:#34d399; font-size:14px; text-align:left; direction:ltr;">
                ${F(t.grandTotal||t.total||0)}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-secondary sm" onclick="document.getElementById('gra-pick-quote-overlay').remove()">إلغاء</button>
          <button class="btn btn-ghost sm" id="gra-quote-manual-btn" style="color:#38bdf8; font-size:11.5px; border:1px solid #334155;">
            🔍 أو البحث برقم عرض سعر آخر...
          </button>
        </div>
      </div>
    `,document.body.appendChild(i),document.getElementById("gra-quote-manual-btn")?.addEventListener("click",()=>{document.getElementById("gra-pick-quote-overlay")?.remove(),p()}),window.applyQuoteToGraById=t=>{document.getElementById("gra-pick-quote-overlay")?.remove();const c=s.find(g=>g.id===t)||l.find(g=>g.id===t);c&&window.applyQuoteToGra(c)}},window.applyQuoteToGra=e=>{if(!e)return;const o=document.getElementById("gra-items-tbody");if(!o)return;o.innerHTML="";const l=e.items||[];l.length>0?l.forEach((i,t)=>{const c=Q(i);window.addGraItemRow(i.productName||i.name||i.description||"",i.unit||i.unitName||"كرتون",i.qty!==void 0?i.qty:i.quantity||1,c.toFixed(2))}):window.addGraItemRow("بضائع ومواد غذائية (حسب عرض السعر)","شحنة",1,parseFloat(e.grandTotal||e.total||0).toFixed(2));const s=e.quoteNumber||e.id;document.getElementById("gra-invoices-ref").value="عرض سعر رقم "+s+(e.date?" بتاريخ "+R(e.date):""),document.getElementById("gra-dispatch-ref").value="إذن صرف بضاعة لعرض سعر "+s,document.getElementById("gra-warehouse-name").value="المستودع الرئيسي",e.customerName&&(!document.getElementById("gra-buyer-name")?.value||document.getElementById("gra-buyer-name")?.value==="عميل نقدي")&&(document.getElementById("gra-buyer-name").value=e.customerName,typeof window.handleGraCustomerSelect=="function"&&window.handleGraCustomerSelect(e.customerName));let p=parseFloat(e.grandTotal||e.total||0);if(p<=0){let i=0;document.querySelectorAll(".gra-it-total").forEach(t=>{const c=parseFloat(t.value||0);isNaN(c)||(i+=c)}),p=i}document.getElementById("gra-total-goods").value=p.toFixed(2),document.getElementById("gra-val-received").value=p.toFixed(2),document.getElementById("gra-val-paid").value="0.00",document.getElementById("gra-val-remaining").value=p.toFixed(2),document.getElementById("gra-pn-amount").value=p.toFixed(2),window.calcGraTotals(),k(`تم استيراد أصناف وبيانات عرض السعر ${s} بنجاح`,"success")},window.submitGoodsReceiptAck=async(e=!0)=>{const o=document.getElementById("gra-doc-number")?.value.trim()||B,l=document.getElementById("gra-doc-date")?.value||x,s=document.getElementById("gra-doc-place")?.value.trim()||"ينبع الصناعية",p=document.getElementById("gra-seller-name")?.value.trim()||m.name,i=document.getElementById("gra-seller-cr")?.value.trim()||m.crNumber,t=document.getElementById("gra-seller-vat")?.value.trim()||m.vatNumber,c=document.getElementById("gra-seller-address")?.value.trim()||m.address,g=document.getElementById("gra-buyer-name")?.value.trim()||"";if(!g){k("يرجى كتابة أو اختيار اسم المنشأة / المشتري","warning"),document.getElementById("gra-buyer-name")?.focus();return}const h=document.getElementById("gra-buyer-idnum")?.value.trim()||"",E=document.getElementById("gra-buyer-phone")?.value.trim()||"",N=document.getElementById("gra-buyer-address")?.value.trim()||"",q=document.getElementById("gra-buyer-id")?.value.trim()||"",D=document.getElementById("gra-rep-name")?.value.trim()||"",b=document.getElementById("gra-rep-title")?.value.trim()||"",$=document.getElementById("gra-rep-id")?.value.trim()||"",z=document.getElementById("gra-rep-nationality")?.value.trim()||"",C=document.getElementById("gra-rep-phone")?.value.trim()||"",T=[];document.querySelectorAll("#gra-items-tbody tr").forEach((A,_)=>{const X=A.querySelector(".gra-it-name")?.value.trim(),$e=A.querySelector(".gra-it-unit")?.value.trim()||"كرتون",ee=parseFloat(A.querySelector(".gra-it-qty")?.value||0),te=parseFloat(A.querySelector(".gra-it-total")?.value||0);(X||ee>0||te>0)&&T.push({index:_+1,name:X||"صنف بدون وصف",unit:$e,qty:ee,total:te})});const U=parseFloat(document.getElementById("gra-total-goods")?.value||0),ie=document.getElementById("gra-tafqeet-words")?.value||M(U)+" فقط لا غير",le=document.getElementById("gra-invoices-ref")?.value.trim()||"",se=document.getElementById("gra-dispatch-ref")?.value.trim()||"",re=document.getElementById("gra-warehouse-name")?.value.trim()||"المستودع الرئيسي",de=document.getElementById("gra-actual-date")?.value||l,Z=parseFloat(document.getElementById("gra-val-received")?.value||U),K=parseFloat(document.getElementById("gra-val-paid")?.value||0),V=parseFloat(document.getElementById("gra-val-remaining")?.value||Math.max(0,Z-K)),ce=document.getElementById("gra-tafqeet-remaining")?.textContent||M(V)+" ريال سعودي فقط لا غير",pe=document.getElementById("gra-pn-issuer")?.value.trim()||"",ge=document.getElementById("gra-pn-beneficiary")?.value.trim()||p,me=document.getElementById("gra-pn-number")?.value.trim()||"",ue=document.getElementById("gra-pn-date")?.value||l,be=document.getElementById("gra-pn-due-date")?.value||"",fe=parseFloat(document.getElementById("gra-pn-amount")?.value||V),xe=document.getElementById("gra-notes")?.value.trim()||"",ye=document.getElementById("gra-attachments-count")?.value.trim()||"1",ve=document.getElementById("gra-total-pages")?.value.trim()||"2",he=document.getElementById("gra-sig-buyer")?.value.trim()||D||"",we=document.getElementById("gra-sig-warehouse")?.value.trim()||"أمين المستودع",Ie=document.getElementById("gra-sig-seller")?.value.trim()||"المفوض بالتوقيع",H={docNumber:o,docDate:l,docPlace:s,seller:{name:p,crNumber:i,vatNumber:t,address:c,phone:m.phone},buyer:{id:q,name:g,idNumber:h,phone:E,address:N,repName:D,representative:b,repId:$,repNationality:z,repPhone:C},items:T,totalGoods:U,totalWords:ie,logistics:{invoicesRef:le,dispatchRef:se,warehouseName:re,actualDate:de},debt:{valReceived:Z,valPaid:K,valRemaining:V,wordsRemaining:ce},promissoryNote:{issuer:pe,beneficiary:ge,number:me,date:ue,dueDate:be,amount:fe},notes:xe,attachmentsCount:ye,totalPages:ve,signatures:{buyer:he,warehouse:we,seller:Ie},co:m,type:"goods_receipt_ack",status:"active",createdAt:new Date().toISOString()};if(e)try{await oe(j.goodsReceiptAcks(),H),k("تم حفظ إقرار استلام البضاعة برقم: "+o,"success")}catch(A){console.warn("Could not save to goodsReceiptAcks, trying trustReceipts:",A);try{await oe(j.trustReceipts(),H),k("تم حفظ الإقرار في سجل المستندات","success")}catch(_){console.error("Save failed:",_)}}document.getElementById("gra-modal-overlay")?.remove(),await ne(H)}}async function ne(a){const{docNumber:f,docDate:x,docPlace:m,seller:u,buyer:n,items:r,totalGoods:d,totalWords:S,logistics:P,debt:B,promissoryNote:v,notes:y,attachmentsCount:G,signatures:I,co:w}=a,e=u?.name||w?.name||"شركة نظم الإمداد المتطورة",o=u?.crNumber||w?.crNumber||"7054969006",l=u?.vatNumber||w?.vatNumber||"314996148100003",s=u?.address||w?.address||"مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",p=u?.phone||w?.phone||"0549141648";let i=w?.logoUrl||"";if(!i)try{const b=JSON.parse(localStorage.getItem("idham_company")||"{}");i=b.logoUrl||b.logoBase64||b.dataUrl||""}catch{}if(!i)try{const b=await Y(J(L,`companies/${W}/settings`,"logo"));if(b.exists()){const $=b.data();i=$.dataUrl||$.logoBase64||$.url||$.logoUrl||""}}catch(b){console.warn("Could not fetch company logo:",b)}let t="";try{const $=await(await fetch("/icons/company-stamp.png?t="+Date.now())).blob();t=await new Promise(z=>{const C=new FileReader;C.onload=()=>z(C.result),C.readAsDataURL($)})}catch{}const c=Ne(new Date(x)),g=(r||[]).length,h=15,E=[];if(g===0)E.push([]);else for(let b=0;b<g;b+=h)E.push(r.slice(b,b+h));const N=E.length+1,q=window.open("","_blank","width=960,height=1000");if(!q){k("يرجى السماح بالنوافذ المنبثقة للطباعة","error");return}const D=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إقرار استلام بضاعة عينية مرتبط بسند لأمر — ${n?.name||""}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #0f172a;
      background: #f8fafc;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-page {
      width: 100%;
      max-width: 194mm;
      min-height: 275mm;
      margin: 0 auto 15mm auto;
      background: #fff;
      border: 2px solid #0f172a;
      outline: 1.5px solid #0284c7;
      outline-offset: -5px;
      padding: 14px 18px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      box-sizing: border-box;
    }
    .print-page:last-child {
      page-break-after: auto;
      margin-bottom: 0;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 44px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 3px;
      z-index: 1;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
      position: relative;
      z-index: 2;
    }
    .co-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #0f172a;
      white-space: nowrap;
    }
    .co-meta {
      font-size: 9px;
      color: #334155;
      font-weight: 600;
      margin-top: 1px;
    }
    .doc-center-badge {
      text-align: center;
      background: #ffffff !important;
      color: #0f172a !important;
      padding: 5px 12px;
      border-radius: 8px;
      border: 2px solid #0f172a;
    }
    .doc-royal-title {
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #0f172a !important;
      white-space: nowrap;
    }
    .doc-sub-badge {
      font-size: 8.5px;
      font-weight: 800;
      color: #0369a1;
      margin-top: 2px;
    }
    .serial-box {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      font-weight: 900;
      color: #000000 !important;
      margin-top: 3px;
      padding: 2px 8px;
      background: #f8fafc;
      border: 1px solid #0f172a;
      border-radius: 4px;
      display: inline-block;
    }

    /* Meta Bar */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 9.5px;
      font-weight: 700;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }

    /* Section Header */
    .sec-header {
      font-size: 10.5px;
      font-weight: 900;
      color: #0f172a;
      background: #e2e8f0;
      padding: 4px 8px;
      border-right: 4px solid #0284c7;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Data Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .data-table th, .data-table td {
      border: 1px solid #94a3b8;
      padding: 4px 8px;
      font-size: 9.5px;
    }
    .data-table th {
      background: #f8fafc;
      font-weight: 800;
      color: #1e293b;
      width: 22%;
    }

    /* Items Table */
    .items-print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .items-print-table th {
      background: #0f172a;
      color: #fff;
      font-size: 9.5px;
      font-weight: 800;
      padding: 5px 6px;
      border: 1px solid #0f172a;
      text-align: center;
    }
    .items-print-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      font-size: 9px;
      color: #0f172a;
    }
    .items-print-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Amount Highlight Box */
    .amount-highlight {
      background: #f8fafc;
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .amount-digits {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      white-space: nowrap;
    }

    /* Legal Clauses Box */
    .clauses-container {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .clause-row {
      margin-bottom: 6px;
      font-size: 9.2px;
      line-height: 1.55;
      color: #1e293b;
      text-align: justify;
    }
    .clause-row strong {
      color: #0f172a;
    }

    /* Promissory Note Box */
    .pn-linked-box {
      border: 2px solid #0284c7;
      background: #f0f9ff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .pn-title {
      font-size: 10px;
      font-weight: 900;
      color: #0369a1;
      margin-bottom: 6px;
      border-bottom: 1px dashed #7dd3fc;
      padding-bottom: 3px;
    }

    /* Dotted line for handwriting */
    .write-dot-line {
      border-bottom: 1px dotted #475569;
      display: inline-block;
      min-width: 140px;
      height: 12px;
      vertical-align: middle;
    }

    /* Signatures Section */
    .sig-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr 1fr;
      gap: 8px;
      margin-top: 4px;
      z-index: 2;
      position: relative;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 6px 8px;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 155px;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-bottom: 5px;
      text-align: center;
      background: #f8fafc;
      border-radius: 4px 4px 0 0;
    }
    .sig-lines {
      font-size: 9px;
      line-height: 2.1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .sig-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .sig-row .lbl {
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
      min-width: 65px;
    }
    .sig-row .val {
      font-weight: 800;
      color: #0f172a;
    }
    .sig-row .dots {
      flex: 1;
      border-bottom: 1px dotted #64748b;
      height: 13px;
      display: inline-block;
    }
    .stamp-box-dashed {
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      height: 44px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      background: #f8fafc;
      text-align: center;
    }
    .stamp-cell {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 95px;
    }
    .stamp-cell img {
      max-height: 90px;
      max-width: 145px;
      object-fit: contain;
      mix-blend-mode: multiply;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
    }

    /* Page Footer */
    .page-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      font-size: 8px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      z-index: 2;
      position: relative;
    }

    /* Page-break signature ribbon */
    .page-intermediate-ack {
      border: 1.5px dashed #0284c7;
      background: #f0f9ff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      z-index: 2;
      position: relative;
    }
  </style>
</head>
<body onload="window.print()">

  <!-- ═════════════════════════════════════════════════════════ -->
  <!-- ITEM PAGES (PAGES 1 to N-1) -->
  <!-- ═════════════════════════════════════════════════════════ -->
  ${E.map((b,$)=>{const z=$+1,C=z===1;return`
    <div class="print-page">
      <div class="watermark">إقرار استلام بضاعة وسند لأمر</div>

      <div>
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td style="width:28%; vertical-align:middle; text-align:right;">
              ${i?`
                <img src="${i}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>
              `:`
                <div style="width:65px; height:65px; border-radius:10px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:16px;">نظم الإمداد</div>
              `}
            </td>
            <td style="width:42%; text-align:center; vertical-align:middle;">
              <div class="doc-center-badge">
                <div class="doc-royal-title">إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها</div>
                <div class="doc-sub-badge">مرتبط بسند لأمر تنفيذي — حماية معتمدة لمبيعات الأجل</div>
                <div class="serial-box">رقم المستند: ${f}</div>
              </div>
            </td>
            <td style="width:30%; text-align:left; vertical-align:middle; direction:rtl;">
              <div class="co-title">${e}</div>
              <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${o}</strong></div>
              <div class="co-meta">الرقم الضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${l}</strong></div>
              <div class="co-meta">هاتف: ${p}</div>
              <div class="co-meta">التاريخ: ${x} م (${c})</div>
            </td>
          </tr>
        </table>

        <!-- Meta Bar -->
        <div class="meta-bar">
          <span><strong>رقم المستند:</strong> <span style="font-family:'IBM Plex Mono',monospace;">${f}</span></span>
          <span><strong>تاريخ التحرير:</strong> ${x} م (${c})</span>
          <span><strong>مكان التحرير:</strong> ${m||"ينبع الصناعية"}</span>
          <span><strong>صفحة:</strong> ${z} من ${N}</span>
        </div>

        ${C?`
        <!-- Section 1: Seller & Section 2: Buyer & Receiver -->
        <div style="margin-bottom:8px;">
          
          <!-- Parties Comprehensive Table -->
          <table class="data-table" style="margin-bottom:6px;">
            <tr>
              <th colspan="4" style="background:#0f172a; color:#fff; text-align:right; font-size:10px;">
                🏢 أولاً: بيانات البائع «الدائن»:
              </th>
            </tr>
            <tr>
              <th>الاسم / اسم المنشأة:</th>
              <td><strong>${e}</strong></td>
              <th>السجل التجاري والضريبي:</th>
              <td>س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${o}</strong> — ضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${l}</strong></td>
            </tr>
            <tr>
              <th>العنوان الرسمي:</th>
              <td colspan="3">${s} — هاتف: ${p}</td>
            </tr>

            <tr>
              <th colspan="4" style="background:#0284c7; color:#fff; text-align:right; font-size:10px;">
                👤 ثانياً: بيانات المشتري «المدين» والمستلم المفوض (المقر بالاستلام):
              </th>
            </tr>
            <tr>
              <th>اسم المنشأة / المشتري:</th>
              <td><strong style="font-size:11px; color:#0f172a;">${n?.name||"—"}</strong></td>
              <th>السجل التجاري / الهوية:</th>
              <td><span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${n?.idNumber||"—"}</span></td>
            </tr>
            <tr>
              <th>العنوان الوطني المعتمد:</th>
              <td>${n?.address||"ينبع — المملكة العربية السعودية"}</td>
              <th>هاتف / جوال المنشأة:</th>
              <td><span style="font-family:'IBM Plex Mono',monospace;">${n?.phone||"—"}</span></td>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="color:#0369a1;">اسم المستلم / المفوض الفعلي:</th>
              <td>${n?.repName?`<strong>${n.repName}</strong>`:'<span class="write-dot-line" style="width:100%;"></span>'}</td>
              <th style="color:#0369a1;">الصفة وسند التفويض:</th>
              <td>${n?.representative?`<strong>${n.representative}</strong>`:'<span class="write-dot-line" style="width:100%;"></span>'}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="color:#0369a1;">رقم هوية / إقامة المستلم:</th>
              <td>${n?.repId?`<strong style="font-family:'IBM Plex Mono',monospace;">${n.repId}</strong>`:'<span class="write-dot-line" style="width:100%;"></span>'}</td>
              <th style="color:#0369a1;">جنسية المستلم ورقم جواله:</th>
              <td>
                جنسية: ${n?.repNationality?`<strong>${n.repNationality}</strong>`:'<span class="write-dot-line" style="min-width:60px;"></span>'}
                — جوال: ${n?.repPhone?`<strong style="font-family:'IBM Plex Mono',monospace;">${n.repPhone}</strong>`:'<span class="write-dot-line" style="min-width:80px;"></span>'}
              </td>
            </tr>
          </table>

        </div>
        `:""}

        <!-- Section 3: Goods Delivered Table -->
        <div class="sec-header">
          <span>📦 ثالثاً: كشف بيانات البضاعة المستلمة ${E.length>1?`(جزء ${z} من ${E.length})`:""}</span>
          <span style="font-size:9px; font-weight:700;">إجمالي الأصناف بالكشف: ${g} صنف</span>
        </div>

        <table class="items-print-table">
          <thead>
            <tr>
              <th style="width:32px;">م</th>
              <th>الصنف ووصفه</th>
              <th style="width:75px;">الوحدة</th>
              <th style="width:65px;">الكمية</th>
              <th style="width:115px;">إجمالي القيمة بالريال</th>
            </tr>
          </thead>
          <tbody>
            ${b.map(T=>`
              <tr>
                <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700;">${T.index}</td>
                <td><strong style="font-size:9.5px;">${T.name||""}</strong></td>
                <td style="text-align:center;">${T.unit||"كرتون"}</td>
                <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700;">${T.qty||0}</td>
                <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:800; direction:ltr; padding-left:8px;">${F(T.total||0)}</td>
              </tr>
            `).join("")}
            ${b.length===0?`
              <tr>
                <td colspan="5" style="text-align:center; padding:15px; color:#64748b;">
                  بضائع ومواد غذائية متنوعة وفقاً لكشف الفواتير وإذن الصرف المرفق والموقع عليه.
                </td>
              </tr>
            `:""}
          </tbody>
        </table>

        <!-- Totals & Logistics on last item page -->
        ${z===E.length?`
        <div class="amount-highlight">
          <div>
            <div style="font-size:9.5px; font-weight:800; color:#0f172a;">إجمالي قيمة البضاعة شامل ضريبة القيمة المضافة (إن انطبقت):</div>
            <div style="font-size:10px; font-weight:800; color:#0369a1; margin-top:2px;">المبلغ كتابةً: [ ${S} ]</div>
          </div>
          <div class="amount-digits">${F(d)}</div>
        </div>

        <table class="data-table" style="margin-bottom:6px;">
          <tr>
            <th>أرقام الفواتير وتواريخها:</th>
            <td><strong>${P?.invoicesRef||"—"}</strong></td>
            <th>رقم إذن الصرف وتاريخه:</th>
            <td><strong>${P?.dispatchRef||"—"}</strong></td>
          </tr>
          <tr>
            <th>المخزن الذي تم التسليم منه:</th>
            <td>${P?.warehouseName||"المستودع الرئيسي"}</td>
            <th>تاريخ الاستلام الفعلي:</th>
            <td><strong style="color:#0f172a;">${P?.actualDate||x}</strong></td>
          </tr>
        </table>
        `:""}

      </div>

      <!-- Intermediate Acknowledgment Line on items pages -->
      <div class="page-intermediate-ack">
        <div>
          ✍️ <strong>إقرار وتوقيع المستلم المفوض على صحة كشف البضاعة أعلاه:</strong> ..............................................................
        </div>
        <div>
          الصفة / الختم: ..............................................................
        </div>
      </div>

      <!-- Page Footer -->
      <div class="page-footer">
        <span>مستند إقرار استلام بضاعة وسند لأمر رقم: <strong style="font-family:'IBM Plex Mono',monospace;">${f}</strong></span>
        <span>صفحة ${z} من ${N}</span>
        <span>تعد هذه الصفحة كشفاً مكملاً وجزءاً لا يتجزأ من الإقرار القانوني الرسمي</span>
      </div>

    </div>
    `}).join("")}

  <!-- ═════════════════════════════════════════════════════════ -->
  <!-- FINAL PAGE: LEGAL CLAUSES, PROMISSORY NOTE, SIGNATURES -->
  <!-- ═════════════════════════════════════════════════════════ -->
  <div class="print-page">
    <div class="watermark">إقرار استلام بضاعة وسند لأمر</div>

    <div>
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td style="width:28%; vertical-align:middle; text-align:right;">
            ${i?`
              <img src="${i}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>
            `:`
              <div style="width:65px; height:65px; border-radius:10px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:16px;">نظم الإمداد</div>
            `}
          </td>
          <td style="width:42%; text-align:center; vertical-align:middle;">
            <div class="doc-center-badge">
              <div class="doc-royal-title">رابعاً: الإقرار بالاستلام والمديونية والارتباط بالسند لأمر</div>
              <div class="doc-sub-badge">إقرار قضائي بات وملزم — نافٍ للجهالة ومثبت لسبب الدين العيني</div>
              <div class="serial-box">تابع للمستند: ${f}</div>
            </div>
          </td>
          <td style="width:30%; text-align:left; vertical-align:middle; direction:rtl;">
            <div class="co-title">${e}</div>
            <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${o}</strong></div>
            <div class="co-meta">المنشأة: <strong style="color:#0f172a;">${n?.name||""}</strong></div>
            <div class="co-meta">تاريخ التحرير: ${x} م</div>
          </td>
        </tr>
      </table>

      <!-- Meta Bar -->
      <div class="meta-bar">
        <span><strong>رقم المستند:</strong> <span style="font-family:'IBM Plex Mono',monospace;">${f}</span></span>
        <span><strong>مكان وتاريخ التحرير:</strong> ${m||"ينبع الصناعية"} في ${x} م (${c})</span>
        <span><strong>صفحة:</strong> ${N} من ${N} (صفحة الإقرار والاعتمادات)</span>
      </div>

      <!-- Pre-amble -->
      <div style="font-size:9.5px; font-weight:800; color:#0f172a; margin-bottom:6px; line-height:1.5; background:#f1f5f9; padding:5px 8px; border-radius:4px; border-right:3px solid #0f172a;">
        أقر أنا المشتري الموضحة بياناتي أعلاه، أصالةً عن نفسي / بصفتي ممثلًا مفوضًا عن المشتري المذكور، بكامل الأهلية المعتبرة شرعًا ونظامًا، بما يأتي:
      </div>

      <!-- Legal Clauses 1 to 6 (Full Exact Text) -->
      <div class="clauses-container">
        
        <div class="clause-row">
          <strong>1.</strong> استلمت فعليًا من البائع البضاعة المبينة بهذا المستند والفواتير وإذن الصرف المشار إليها، وذلك على سبيل الشراء بالأجل، وتسلمتها بالكميات والأوصاف المثبتة، بعد فحصها ظاهرًا، مع إثبات أي نقص أو تحفظ في خانة الملاحظات أدناه، ودون إخلال بالحقوق المتعلقة بالعيوب الخفية وفقًا للنظام.
        </div>

        <div class="clause-row" style="background:#f8fafc; padding:4px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          <strong>2.</strong> بلغت قيمة البضاعة المستلمة مبلغًا قدره (<strong style="font-family:'IBM Plex Mono',monospace;">${F(B?.valReceived||d)}</strong>) ريال سعودي، وسُدد من ثمنها مبلغ قدره (<strong style="font-family:'IBM Plex Mono',monospace;">${F(B?.valPaid||0)}</strong>) ريال سعودي، وبقي في ذمة المشتري لصالح البائع مبلغ قدره (<strong style="font-family:'IBM Plex Mono',monospace; color:#b91c1c;">${F(B?.valRemaining||d)}</strong>) ريال سعودي، كتابةً: [ <strong style="color:#0369a1;">${B?.wordsRemaining||M(B?.valRemaining||d)+" ريال سعودي فقط لا غير"}</strong> ].
        </div>

        <div class="clause-row">
          <strong>3.</strong> أقر بأن المبلغ المتبقي المذكور أعلاه يمثل ثمن بضاعة تم استلامها فعلًا، وأنه الدين ذاته المثبت بالسند لأمر المحرر من:
        </div>

        <!-- Promissory Note Details Table (Never fills establishment name, leaves blank line for handwriting) -->
        <div class="pn-linked-box">
          <div class="pn-title">🔗 السند لأمر التنفيذي المحرر وفاءً لثمن هذه البضاعة المستلمة:</div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
            <tr>
              <td style="padding:3px 6px; width:50%;">
                <strong>اسم محرر السند:</strong> 
                ${v?.issuer?`<strong>${v.issuer}</strong>`:'<span class="write-dot-line" style="min-width:180px;"></span>'}
              </td>
              <td style="padding:3px 6px; width:50%;">
                <strong>لصالح المستفيد:</strong> <strong>${v?.beneficiary||e}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 6px;">
                <strong>رقم السند لأمر / رقمه الإلكتروني (نافذ):</strong> 
                ${v?.number?`<strong style="font-family:'IBM Plex Mono',monospace; color:#0369a1; font-size:11px;">${v.number}</strong>`:'<span class="write-dot-line" style="min-width:160px;"></span>'}
              </td>
              <td style="padding:3px 6px;">
                <strong>قيمته بالريال:</strong> <strong style="font-family:'IBM Plex Mono',monospace; color:#b91c1c; font-size:11px;">${F(v?.amount||B?.valRemaining||d)}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 6px;">
                <strong>تاريخ إنشائه:</strong> ${v?.date||x} م
              </td>
              <td style="padding:3px 6px;">
                <strong>تاريخ استحقاقه:</strong> <strong style="color:#b91c1c;">${v?.dueDate?R(v.dueDate):"فور الطلب / عند الاطلاع"}</strong>
              </td>
            </tr>
          </table>
        </div>

        <div class="clause-row">
          <strong>4.</strong> أقر بأن سبب تحرير السند لأمر المشار إليه هو المديونية الناشئة عن شراء واستلام البضاعة المبينة أعلاه، وأن هذا الإقرار يثبت استلام البضاعة التي نشأت عنها المديونية، ولا يتضمن إقرارًا باستلام مبلغ نقدي.
        </div>

        <div class="clause-row">
          <strong>5.</strong> لا يُعد توقيع هذا المستند سدادًا للسند لأمر أو إبراءً من الدين، كما لا ينشئ دينًا إضافيًا مستقلًا عن الدين المثبت بالسند. ويُخصم من الرصيد المستحق كل سداد فعلي أو تسوية ثابتة بين الطرفين، ولا يجوز استيفاء الدين ذاته أكثر من مرة.
        </div>

        <div class="clause-row">
          <strong>6.</strong> تعد الفواتير وإذن الصرف وكشف الأصناف المرفقة، المحددة أرقامها أعلاه والموقعة من المستلم، مكملة لهذا الإقرار.
        </div>

        <div style="font-size:9.5px; font-weight:800; color:#0f172a; margin-top:4px;">
          وقد وقعت هذا الإقرار بعد الاطلاع على بياناته ومرفقاته والتحقق من مطابقتها لواقعة الاستلام الفعلية.
        </div>

      </div>

      <!-- Notes & Reservations -->
      <table class="data-table" style="margin-bottom:6px;">
        <tr>
          <th style="width:18%;">الملاحظات والتحفظات:</th>
          <td>${y||"لا توجد ملاحظات أو تحفظات — البضاعة مستلمة بحالة ممتازة ومطابقة للمواصفات."}</td>
        </tr>
      </table>

      <!-- Signatures Grid (Completely clean and un-crossed) -->
      <div class="sig-grid">
        
        <!-- Buyer / Receiver Signature Card -->
        <div class="sig-box">
          <div class="sig-title">المشتري / المستلم المفوض</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl">اسم المستلم:</span>
              ${I?.buyer?`<span class="val">${I.buyer}</span>`:'<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">الصفة:</span>
              ${n?.representative?`<span class="val">${n.representative}</span>`:'<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">الهوية/الإقامة:</span>
              ${n?.repId?`<span class="val" style="font-family:'IBM Plex Mono',monospace;">${n.repId}</span>`:'<span class="dots"></span>'}
              <span style="font-weight:800; color:#0f172a; margin-right:4px;">الجنسية:</span>
              ${n?.repNationality?`<span class="val">${n.repNationality}</span>`:'<span class="dots" style="max-width:45px;"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">رقم الجوال:</span>
              ${n?.repPhone?`<span class="val" style="font-family:'IBM Plex Mono',monospace;">${n.repPhone}</span>`:'<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">التوقيع:</span>
              <span class="dots"></span>
            </div>
          </div>
          <div class="stamp-box-dashed">
            محل ختم المنشأة (المشتري)
          </div>
        </div>

        <!-- Warehouse Officer -->
        <div class="sig-box">
          <div class="sig-title">مسؤول التسليم من المخزن</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl">الاسم:</span>
              <span class="val">${I?.warehouse||"أمين المستودع"}</span>
            </div>
            <div class="sig-row">
              <span class="lbl">المخزن:</span>
              <span class="val">${P?.warehouseName||"المستودع الرئيسي"}</span>
            </div>
            <div class="sig-row" style="margin-top:8px;">
              <span class="lbl">التوقيع:</span>
              <span class="dots"></span>
            </div>
          </div>
          <div style="height:44px; margin-top:4px;"></div>
        </div>

        <!-- Creditor / Seller Stamp -->
        <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
          <div class="sig-title" style="color:#0369a1;">اعتماد البائع</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl" style="min-width:75px;">الاسم والصفة:</span>
              <span class="val">${I?.seller||"المفوض بالتوقيع"}</span>
            </div>
          </div>
          <div class="stamp-cell">
            ${t?`<img src="${t}" alt="ختم البائع"/>`:'<div style="font-size:9px; color:#0369a1; font-weight:800;">التوقيع والختم المعتمد</div>'}
          </div>
        </div>

      </div>

    </div>

    <!-- Page Footer & Attachments -->
    <div>
      <div style="font-size:8.5px; font-weight:700; color:#334155; margin-bottom:4px; background:#f1f5f9; padding:4px 8px; border-radius:4px; display:flex; justify-content:space-between;">
        <span><strong>المرفقات:</strong> ${G||"1"} مستندات، بإجمالي (${N}) صفحات.</span>
        <span>وثيقة ملزمة نظامياً وفقاً لنظام الإثبات ونظام المعاملات المدنية بالمملكة العربية السعودية</span>
      </div>
      <div class="page-footer">
        <span>مستند إقرار استلام بضاعة وسند لأمر رقم: <strong style="font-family:'IBM Plex Mono',monospace;">${f}</strong></span>
        <span>صفحة ${N} من ${N}</span>
        <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م</span>
      </div>
    </div>

  </div>

</body>
</html>`;q.document.write(D),q.document.close()}typeof window<"u"&&(window.openGoodsReceiptAckModal=Me,window.generateAndPrintGoodsReceiptAck=ne);export{Q as calculateItemLineTotal,ne as generateAndPrintGoodsReceiptAck,ze as generateGoodsReceiptAckNumber,Me as openGoodsReceiptAckModal};
