// ══════════════════════════════════════════════════════════════════
// BARCODE & SHELF TAG DESIGNER / PRINTER MODULE
// ══════════════════════════════════════════════════════════════════

import { getAll, orderBy } from "../utils/db.js";
import { formatCurrency } from "../utils/helpers.js";

let allProducts = [];
let allLocations = [];
let selectedProduct = null;

export async function render(container, user) {
  const root = container || document.getElementById("main-content");
  if (!root) return;

  root.innerHTML = `
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
  `;

  await loadLabelData();
}

async function loadLabelData() {
  try {
    const [pList, locList] = await Promise.all([
      getAll("products", [orderBy("name")]).catch(() => []),
      getAll("inventoryLocations").catch(() => [])
    ]);

    allProducts = pList;
    allLocations = locList;

    const pSel = document.getElementById("lbl-product-select");
    if (pSel) {
      pSel.innerHTML = '<option value="">اختر من قائمة الأصناف…</option>' +
        allProducts.map(p => `<option value="${p.id}">${p.name} (${p.sku||p.barcode||'—'})</option>`).join("");
    }

    const sSel = document.getElementById("lbl-shelf-select");
    if (sSel) {
      sSel.innerHTML = '<option value="">اختر موقع التخزين…</option>' +
        allLocations.map(l => `<option value="${l.id}">${l.rack || l.name || l.code || l.id} (${l.warehouseName||'المستودع'})</option>`).join("");
    }

    if (allProducts.length > 0) {
      pSel.value = allProducts[0].id;
      window.selectProductForLabel(allProducts[0].id);
    }
  } catch (e) {
    console.error("loadLabelData error:", e);
  }
}

window.toggleLabelType = (val) => {
  const pBox = document.getElementById("lbl-product-selector-box");
  const sBox = document.getElementById("lbl-shelf-selector-box");
  if (val === "shelf") {
    pBox.classList.add("hidden");
    sBox.classList.remove("hidden");
  } else {
    pBox.classList.remove("hidden");
    sBox.classList.add("hidden");
  }
  window.updateLabelPreview();
};

window.selectProductForLabel = (id) => {
  selectedProduct = allProducts.find(x => x.id === id) || null;
  window.updateLabelPreview();
};

window.selectShelfForLabel = (id) => {
  const shelf = allLocations.find(x => x.id === id) || null;
  if (shelf) {
    selectedProduct = {
      name: `موقع: ${shelf.rack || shelf.name || 'رف تخزين'}`,
      barcode: shelf.code || shelf.id,
      sku: shelf.code || shelf.id,
      sellingPrice: 0,
      isShelf: true
    };
  }
  window.updateLabelPreview();
};

window.updateLabelPreview = () => {
  const canvas = document.getElementById("label-live-canvas");
  if (!canvas) return;

  const showName = document.getElementById("lbl-show-name")?.checked;
  const showPrice = document.getElementById("lbl-show-price")?.checked;
  const showComp = document.getElementById("lbl-show-company")?.checked;
  const lot = document.getElementById("lbl-lot")?.value || "";
  const expiry = document.getElementById("lbl-expiry")?.value || "";

  const p = selectedProduct || {
    name: "صنف تجريبي (أرز بسمتي 40 كجم)",
    barcode: "6281002938475",
    sku: "PRD-00123",
    sellingPrice: 165
  };

  const barcodeVal = p.barcode || p.sku || "628000000000";

  canvas.innerHTML = `
    ${showComp ? `<div style="font-size:10px; font-weight:800; color:#555; margin-bottom:4px; text-transform:uppercase;">شركة إدهام للمواد الغذائية</div>` : ''}
    ${showName ? `<div style="font-size:13px; font-weight:900; line-height:1.2; margin-bottom:6px; color:#111;">${p.name}</div>` : ''}
    
    <div style="background:#fff; padding:6px 0; border:1px solid #ddd; border-radius:4px; margin-bottom:6px;">
      <div style="font-family:'Libre Barcode 128', 'Courier New', monospace; font-size:32px; letter-spacing:3px; line-height:1; font-weight:normal;">
        *${barcodeVal}*
      </div>
      <div style="font-family:monospace; font-size:11px; font-weight:bold; letter-spacing:2px;">${barcodeVal}</div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; border-top:1px dashed #ccc; padding-top:4px;">
      ${lot ? `<div>لوت: <b>${lot}</b></div>` : ''}
      ${expiry ? `<div>انتهاء: <b>${expiry}</b></div>` : ''}
    </div>

    ${showPrice && !p.isShelf ? `
      <div style="margin-top:6px; padding:4px; background:#f0f9ff; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:10px; color:#0369a1; font-weight:bold;">شامل 15% VAT</span>
        <span style="font-size:15px; font-weight:900; color:#0369a1;" class="mono">${formatCurrency(p.sellingPrice)}</span>
      </div>
    ` : ''}
  `;
};

window.printGeneratedLabels = () => {
  const qty = parseInt(document.getElementById("lbl-qty")?.value) || 1;
  const canvasContent = document.getElementById("label-live-canvas")?.innerHTML || "";

  const w = window.open("", "_blank");
  w.document.write(`
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
          ${Array.from({ length: qty }).map(() => `
            <div class="label-box">
              ${canvasContent}
            </div>
          `).join("")}
        </div>
      </body>
    </html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 300);
};
