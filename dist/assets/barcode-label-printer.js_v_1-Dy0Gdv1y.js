import{g as c,f as b}from"./index-_yt5fKo2.js";import{orderBy as g}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let l=[],d=[],s=null;async function h(o,e){const t=o||document.getElementById("main-content");t&&(t.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #3B82F6, #1D4ED8); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(59,130,246,0.25);">
            🏷️
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">مركز طباعة وتصميم ملصقات الباركود والرفوف</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">ملصقات الأسعار الحرارية • باركود الكراتين والوحدات • ملصقات رفوف وممرات المستودع</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.printGeneratedLabels()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:9px 18px; border-radius:10px; background:linear-gradient(135deg,#3B82F6,#1D4ED8);">
            <span>🖨️</span> <span>طباعة الملصقات فوراً</span>
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1.3fr; gap:20px;">
        
        <!-- Left: Configuration Box -->
        <div class="card" style="padding:20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <h3 style="margin:0 0 16px; font-size:14px; font-weight:800; color:var(--text-0); border-bottom:1px solid var(--border-soft); padding-bottom:8px;">
            ⚙️ إعدادات وتخصيص الملصق
          </h3>

          <div class="form-group mb-14">
            <label style="font-size:11.5px; font-weight:700;">نوع الطباعة</label>
            <select id="lbl-type" class="form-control font-bold" onchange="window.toggleLabelType(this.value)">
              <option value="product">🏷️ باركود صنف وسعر (Product Label)</option>
              <option value="shelf">🏬 ملصق رف / موقع تخزين (Shelf & Bin Tag)</option>
            </select>
          </div>

          <div id="lbl-product-selector-box" class="form-group mb-14">
            <label style="font-size:11.5px; font-weight:700;">اختر الصنف المطلوب *</label>
            <select id="lbl-product-select" class="form-control font-bold" onchange="window.selectProductForLabel(this.value)">
              <option value="">اختر من قائمة الأصناف…</option>
            </select>
          </div>

          <div id="lbl-shelf-selector-box" class="form-group mb-14 hidden">
            <label style="font-size:11.5px; font-weight:700;">اختر الرف أو موقع التخزين *</label>
            <select id="lbl-shelf-select" class="form-control font-bold" onchange="window.selectShelfForLabel(this.value)">
              <option value="">اختر موقع التخزين…</option>
            </select>
          </div>

          <div class="grid-2 gap-12 mb-14">
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:700;">مقاس الملصق الحراري</label>
              <select id="lbl-size" class="form-control font-bold" onchange="window.updateLabelPreview()">
                <option value="50x25">50 × 25 مم (ملصق صغير)</option>
                <option value="40x30">40 × 30 مم (ملصق ميزان/سعر)</option>
                <option value="80x50">80 × 50 مم (ملصق كرتون كبير)</option>
                <option value="a4">صفحة A4 (ورق ملصقات متعدد)</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:700;">عدد نسخ الطباعة</label>
              <input type="number" id="lbl-qty" class="form-control mono font-bold" value="12" min="1" max="500" oninput="window.updateLabelPreview()" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-14">
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:700;">رقم اللوت (اختياري)</label>
              <input type="text" id="lbl-lot" class="form-control mono" placeholder="LOT-2026-A" oninput="window.updateLabelPreview()" />
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:700;">تاريخ الانتهاء (اختياري)</label>
              <input type="date" id="lbl-expiry" class="form-control mono" oninput="window.updateLabelPreview()" />
            </div>
          </div>

          <div style="background:var(--bg-2); padding:12px; border-radius:10px; margin-top:14px;">
            <div style="font-size:11.5px; font-weight:700; color:var(--text-1); margin-bottom:8px;">العناصر المعروضة على الملصق:</div>
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; margin-bottom:6px;">
              <input type="checkbox" id="lbl-show-name" checked onchange="window.updateLabelPreview()" /> اسم الصنف بالعربي
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; margin-bottom:6px;">
              <input type="checkbox" id="lbl-show-price" checked onchange="window.updateLabelPreview()" /> السعر شامل ضريبة 15% VAT
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; margin-bottom:6px;">
              <input type="checkbox" id="lbl-show-company" checked onchange="window.updateLabelPreview()" /> شعار واسم "شركة إدهام"
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
              <input type="checkbox" id="lbl-show-qr" onchange="window.updateLabelPreview()" /> تضمين رمز الاستجابة السريع (QR Code)
            </label>
          </div>

        </div>

        <!-- Right: Live Preview Box -->
        <div class="card" style="padding:20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-soft); padding-bottom:8px;">
            <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-0);">
              👁️ معاينة شكل الملصق المطبوع
            </h3>
            <span class="badge" style="background:rgba(59,130,246,0.1); color:var(--brand);">Live Preview</span>
          </div>

          <div style="flex:1; display:flex; align-items:center; justify-content:center; background:var(--bg-2); border-radius:12px; padding:24px; min-height:280px; overflow:hidden;">
            <div id="label-live-canvas" style="background:#fff; color:#000; padding:12px; border-radius:6px; box-shadow:0 6px 20px rgba(0,0,0,0.15); width:240px; text-align:center; font-family:'Cairo', sans-serif;"></div>
          </div>

          <div style="margin-top:14px; font-size:11.5px; color:var(--text-2); text-align:center;">
            💡 يمكنك توصيل طابعات الباركود الحرارية (Zebra / Xprinter / Bixolon) مباشرة والطباعة بأعلى دقة.
          </div>
        </div>

      </div>

    </div>
  `,await m())}async function m(){try{const[o,e]=await Promise.all([c("products",[g("name")]).catch(()=>[]),c("inventoryLocations").catch(()=>[])]);l=o,d=e;const t=document.getElementById("lbl-product-select");t&&(t.innerHTML='<option value="">اختر من قائمة الأصناف…</option>'+l.map(i=>`<option value="${i.id}">${i.name} (${i.sku||i.barcode||"—"})</option>`).join(""));const a=document.getElementById("lbl-shelf-select");a&&(a.innerHTML='<option value="">اختر موقع التخزين…</option>'+d.map(i=>`<option value="${i.id}">${i.rack||i.name||i.code||i.id} (${i.warehouseName||"المستودع"})</option>`).join("")),l.length>0&&(t.value=l[0].id,window.selectProductForLabel(l[0].id))}catch(o){console.error("loadLabelData error:",o)}}window.toggleLabelType=o=>{const e=document.getElementById("lbl-product-selector-box"),t=document.getElementById("lbl-shelf-selector-box");o==="shelf"?(e.classList.add("hidden"),t.classList.remove("hidden")):(e.classList.remove("hidden"),t.classList.add("hidden")),window.updateLabelPreview()};window.selectProductForLabel=o=>{s=l.find(e=>e.id===o)||null,window.updateLabelPreview()};window.selectShelfForLabel=o=>{const e=d.find(t=>t.id===o)||null;e&&(s={name:`موقع: ${e.rack||e.name||"رف تخزين"}`,barcode:e.code||e.id,sku:e.code||e.id,sellingPrice:0,isShelf:!0}),window.updateLabelPreview()};window.updateLabelPreview=()=>{const o=document.getElementById("label-live-canvas");if(!o)return;const e=document.getElementById("lbl-show-name")?.checked,t=document.getElementById("lbl-show-price")?.checked,a=document.getElementById("lbl-show-company")?.checked,i=document.getElementById("lbl-lot")?.value||"",r=document.getElementById("lbl-expiry")?.value||"",n=s||{name:"صنف تجريبي (أرز بسمتي 40 كجم)",barcode:"6281002938475",sku:"PRD-00123",sellingPrice:165},p=n.barcode||n.sku||"628000000000";o.innerHTML=`
    ${a?'<div style="font-size:10px; font-weight:800; color:#555; margin-bottom:4px; text-transform:uppercase;">شركة إدهام للمواد الغذائية</div>':""}
    ${e?`<div style="font-size:13px; font-weight:900; line-height:1.2; margin-bottom:6px; color:#111;">${n.name}</div>`:""}
    
    <div style="background:#fff; padding:6px 0; border:1px solid #ddd; border-radius:4px; margin-bottom:6px;">
      <div style="font-family:'Libre Barcode 128', 'Courier New', monospace; font-size:32px; letter-spacing:3px; line-height:1; font-weight:normal;">
        *${p}*
      </div>
      <div style="font-family:monospace; font-size:11px; font-weight:bold; letter-spacing:2px;">${p}</div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; border-top:1px dashed #ccc; padding-top:4px;">
      ${i?`<div>لوت: <b>${i}</b></div>`:""}
      ${r?`<div>انتهاء: <b>${r}</b></div>`:""}
    </div>

    ${t&&!n.isShelf?`
      <div style="margin-top:6px; padding:4px; background:#f0f9ff; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:10px; color:#0369a1; font-weight:bold;">شامل 15% VAT</span>
        <span style="font-size:15px; font-weight:900; color:#0369a1;" class="mono">${b(n.sellingPrice)}</span>
      </div>
    `:""}
  `};window.printGeneratedLabels=()=>{const o=parseInt(document.getElementById("lbl-qty")?.value)||1,e=document.getElementById("label-live-canvas")?.innerHTML||"",t=window.open("","_blank");t.document.write(`
    <html dir="rtl">
      <head>
        <title>طباعة ملصقات الباركود</title>
        <style>
          @page { size: auto; margin: 4mm; }
          body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
          .labels-grid { display: flex; flex-wrap: wrap; gap: 6mm; justify-content: flex-start; }
          .label-box { width: 48mm; padding: 3mm; border: 1px dashed #ccc; text-align: center; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="labels-grid">
          ${Array.from({length:o}).map(()=>`
            <div class="label-box">
              ${e}
            </div>
          `).join("")}
        </div>
      </body>
    </html>
  `),t.document.close(),setTimeout(()=>t.print(),300)};export{h as render};
