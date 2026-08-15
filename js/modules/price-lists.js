// ============================================================
// IDHAM ERP — Price Lists Module (قوائم الأسعار والتسعير القائم على التكلفة)
// ============================================================
import { COLS, getAll, getDoc, setDoc, doc } from "../utils/db.js";
import { query, orderBy, getDocs } from "../utils/db.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let retailMargin = 10;
let wholesaleMargin = 7;
let distributorMargin = 5;
let allProducts = [];

export async function render(container, user) {
  // Load margins first
  await loadMargins();

  container.innerHTML = `
    <!-- Settings Bar for Margins -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 12px; align-items: flex-end;">
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح التجزئة (%)</label>
        <input type="number" id="pl-retail-margin" class="input mono" value="${retailMargin}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح الجملة (%)</label>
        <input type="number" id="pl-wholesale-margin" class="input mono" value="${wholesaleMargin}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح التوزيع (%)</label>
        <input type="number" id="pl-distributor-margin" class="input mono" value="${distributorMargin}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div>
        <button class="btn btn-primary" onclick="saveMargins()" id="save-margins-btn" style="height:34px;">💾 حفظ نسب الأرباح</button>
      </div>
      
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <select id="pl-print-type" class="input" style="width: 150px; height: 34px; font-size: 12px; padding: 4px 8px; border-color: var(--brand);">
          <option value="all">كل الأسعار (مقارنة)</option>
          <option value="retail">قائمة التجزئة فقط</option>
          <option value="wholesale">قائمة الجملة فقط</option>
          <option value="distributor">قائمة التوزيع فقط</option>
        </select>
        <button class="btn btn-secondary" onclick="selectAllProductsForPrint(true)">☑️ تحديد الكل</button>
        <button class="btn btn-secondary" onclick="selectAllProductsForPrint(false)">⬛ إلغاء التحديد</button>
        <button class="btn btn-lime" onclick="printSelectedPriceList()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-weight:700;">🖨️ طباعة قائمة الأسعار للأصناف المحددة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">قوائم الأسعار والتسعير القائم على التكلفة</h1>
        <p class="page-subtitle">تحديد أسعار التجزئة والجملة والتوزيع تلقائياً بناءً على آخر سعر شراء (التكلفة) بالإضافة لهامش الربح والضريبة 15%</p>
      </div>

      <div class="grid-3 gap-16 mb-24" id="pl-grid">
        <!-- Render cards showing active margins -->
        <div class="card" style="padding:20px;">
          <span class="badge neutral">RETAIL</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار التجزئة</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-retail-margin">${retailMargin}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">سعر البيع الافتراضي للقطاعي والمحلات الصغيرة</p>
        </div>
        <div class="card" style="padding:20px;">
          <span class="badge good">WHOLESALE</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار الجملة</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-wholesale-margin">${wholesaleMargin}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">سعر بيع الجملة المعتمد للكميات الكبيرة</p>
        </div>
        <div class="card" style="padding:20px;">
          <span class="badge indigo">DISTRIBUTOR</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار التوزيع</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-distributor-margin">${distributorMargin}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">أسعار التوزيع لكبار الموزعين والشركاء</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin:0;">مقارنة قوائم الأسعار عبر الأصناف</h3>
          <span class="text-2" id="pl-selected-count" style="font-size:12px;font-weight:600;color:var(--brand);">0 صنف محدد للطباعة</span>
        </div>
        <div class="table-container">
          <table class="data-dense" id="pl-matrix-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">طباعة</th>
                <th>كود الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th>سعر التكلفة (قبل الضريبة)</th>
                <th>سعر التجزئة (شامل 15%)</th>
                <th>سعر الجملة (شامل 15%)</th>
                <th>سعر التوزيع (شامل 15%)</th>
              </tr>
            </thead>
            <tbody id="pl-matrix-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await loadPriceMatrix();
}

async function loadMargins() {
  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/settings`, "priceListMargins");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.retailMargin !== undefined) retailMargin = parseFloat(data.retailMargin);
      if (data.wholesaleMargin !== undefined) wholesaleMargin = parseFloat(data.wholesaleMargin);
      if (data.distributorMargin !== undefined) distributorMargin = parseFloat(data.distributorMargin);
    }
  } catch (err) {
    console.error("Failed to load price list margins:", err);
  }
}

window.saveMargins = async () => {
  const btn = document.getElementById("save-margins-btn");
  if (btn) btn.disabled = true;
  
  const retail = parseFloat(document.getElementById("pl-retail-margin").value) || 0;
  const wholesale = parseFloat(document.getElementById("pl-wholesale-margin").value) || 0;
  const distributor = parseFloat(document.getElementById("pl-distributor-margin").value) || 0;

  try {
    const docRef = doc(db, `companies/${COMPANY_ID}/settings`, "priceListMargins");
    await setDoc(docRef, {
      retailMargin: retail,
      wholesaleMargin: wholesale,
      distributorMargin: distributor,
      updatedAt: new Date()
    });

    retailMargin = retail;
    wholesaleMargin = wholesale;
    distributorMargin = distributor;

    // Recalculate and update all products in Firestore
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const updatePromises = allProducts.map(p => {
      const cost = p.purchasePrice || p.costPrice || p.averageCost || 0;
      if (cost <= 0) return Promise.resolve();

      // Calculate selling prices inclusive of 15% VAT, but we store selling prices before tax!
      // Wait, in our POS & Quotations, the prices stored are before tax, or inclusive?
      // Inclusive of tax! In POS: "p.salePrice || p.priceRetail" are inclusive of tax!
      // In product catalog, salePrice is inclusive.
      const newRetail = Math.round(cost * (1 + retail / 100) * 1.15 * 100) / 100;
      const newWholesale = Math.round(cost * (1 + wholesale / 100) * 1.15 * 100) / 100;
      const newDistributor = Math.round(cost * (1 + distributor / 100) * 1.15 * 100) / 100;

      const pRef = doc(db, `companies/${COMPANY_ID}/products`, p.id);
      return updateDoc(pRef, {
        salePrice: newRetail,
        priceRetail: newRetail,
        priceWholesale: newWholesale,
        priceDistributor: newDistributor,
        price: newRetail
      });
    });
    await Promise.all(updatePromises);

    // Update UI elements
    const rt = document.getElementById("card-retail-margin"); if (rt) rt.textContent = retail;
    const ws = document.getElementById("card-wholesale-margin"); if (ws) ws.textContent = wholesale;
    const ds = document.getElementById("card-distributor-margin"); if (ds) ds.textContent = distributor;

    showToast("تم حفظ نسب الأرباح وتحديث كافة أسعار المنتجات بقاعدة البيانات بنجاح", "success");
    await loadPriceMatrix();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    if (btn) btn.disabled = false;
  }
};

async function loadPriceMatrix() {
  const tbody = document.getElementById("pl-matrix-tbody");
  if (!tbody) return;
  try {
    allProducts = await getAll(COLS.products(), [orderBy("name")]);

    if (allProducts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مسجلة بالنظام</td></tr>`;
      return;
    }

    tbody.innerHTML = allProducts.map(p => {
      // Cost price: purchasePrice or costPrice or averageCost
      const cost = p.purchasePrice || p.costPrice || p.averageCost || 0;
      
      // Calculate selling prices inclusive of 15% VAT
      const retailPrice = cost * (1 + retailMargin / 100) * 1.15;
      const wholesalePrice = cost * (1 + wholesaleMargin / 100) * 1.15;
      const distributorPrice = cost * (1 + distributorMargin / 100) * 1.15;

      return `
        <tr>
          <td style="text-align:center;">
            <input type="checkbox" class="pl-print-check" data-id="${p.id}" checked onchange="updateSelectedCount()" />
          </td>
          <td class="mono text-indigo" style="font-size:11px;">${p.sku || "—"}</td>
          <td class="font-heading font-semibold">${p.name}</td>
          <td class="mono font-bold">${formatCurrency(cost)}</td>
          <td class="mono text-indigo font-bold">${formatCurrency(retailPrice)}</td>
          <td class="mono text-good font-bold">${formatCurrency(wholesalePrice)}</td>
          <td class="mono text-lime font-bold">${formatCurrency(distributorPrice)}</td>
        </tr>`;
    }).join("");

    updateSelectedCount();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="alert bad">${err.message}</div></td></tr>`;
  }
}

window.updateSelectedCount = () => {
  const checks = document.querySelectorAll(".pl-print-check:checked");
  const el = document.getElementById("pl-selected-count");
  if (el) el.textContent = `${checks.length} صنف محدد للطباعة`;
};

window.selectAllProductsForPrint = (checked) => {
  document.querySelectorAll(".pl-print-check").forEach(c => c.checked = checked);
  updateSelectedCount();
};

window.printSelectedPriceList = async () => {
  const checkedBoxes = document.querySelectorAll(".pl-print-check:checked");
  let selectedIds = Array.from(checkedBoxes).map(c => c.dataset.id);
  
  // Fallback to all if none selected
  if (selectedIds.length === 0) {
    selectedIds = allProducts.map(p => p.id);
  }

  const printItems = allProducts.filter(p => selectedIds.includes(p.id));
  
  if (printItems.length === 0) {
    showToast("لا توجد أصناف لطباعتها", "warn");
    return;
  }

  const printType = document.getElementById("pl-print-type")?.value || "all";

  // Fetch company details and logo
  let co = {
    name: "شركة نظم الإمداد الحديثة",
    vatNumber: "312448150500003",
    address: "المملكة العربية السعودية",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com"
  };
  let companyLogo = "";

  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (coSnap.exists()) {
      const data = coSnap.data();
      if (data.name) co.name = data.name;
      if (data.vatNumber) co.vatNumber = data.vatNumber;
      if (data.phone) co.phone = data.phone;
      if (data.email) co.email = data.email;
      
      const city = data.city || "";
      const country = data.country || "";
      co.address = [city, country].filter(Boolean).join(" — ");
    }
    if (logoSnap.exists()) {
      companyLogo = logoSnap.data().dataUrl || "";
    }
  } catch (e) {
    console.warn("Failed to load company details for price list print:", e);
  }

  const pw = window.open("", "_blank");
  if (!pw) { showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn"); return; }

  // Generate table rows dynamically based on the selected print type
  const rows = printItems.map((p, idx) => {
    const cost = p.purchasePrice || p.costPrice || p.averageCost || 0;
    const retailPrice = cost * (1 + retailMargin / 100) * 1.15;
    const wholesalePrice = cost * (1 + wholesaleMargin / 100) * 1.15;
    const distributorPrice = cost * (1 + distributorMargin / 100) * 1.15;

    let priceCells = "";
    if (printType === "retail") {
      priceCells = `<td class="mono font-bold" style="text-align:left; width:145px; color:#2563eb; font-size:13.5px;">${formatCurrency(retailPrice)}</td>`;
    } else if (printType === "wholesale") {
      priceCells = `<td class="mono font-bold" style="text-align:left; width:145px; color:#059669; font-size:13.5px;">${formatCurrency(wholesalePrice)}</td>`;
    } else if (printType === "distributor") {
      priceCells = `<td class="mono font-bold" style="text-align:left; width:145px; color:#7c3aed; font-size:13.5px;">${formatCurrency(distributorPrice)}</td>`;
    } else {
      priceCells = `
        <td class="mono font-bold" style="text-align:left; width:125px; color:#2563eb;">${formatCurrency(retailPrice)}</td>
        <td class="mono font-bold" style="text-align:left; width:125px; color:#059669;">${formatCurrency(wholesalePrice)}</td>
        <td class="mono font-bold" style="text-align:left; width:125px; color:#7c3aed;">${formatCurrency(distributorPrice)}</td>
      `;
    }

    return `
      <tr>
        <td style="text-align:center; width:45px;">${idx + 1}</td>
        <td class="mono" style="width:105px;">${p.sku || "—"}</td>
        <td style="text-align:right; font-weight:600; white-space:normal; word-break:break-word; min-width:320px; font-size:13.5px; color:#1e293b;">${p.name}</td>
        <td style="text-align:center; width:90px;">${p.unit || "كارتون"}</td>
        ${priceCells}
      </tr>`;
  }).join("");

  // Determine Table Headers and Badges dynamically
  let tableHeaders = "";
  let badgeText = "قائمة الأسعار الرسمية";
  
  if (printType === "retail") {
    tableHeaders = `
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر التجزئة</th>
      </tr>`;
    badgeText = "قائمة أسعار التجزئة";
  } else if (printType === "wholesale") {
    tableHeaders = `
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر الجملة</th>
      </tr>`;
    badgeText = "قائمة أسعار الجملة";
  } else if (printType === "distributor") {
    tableHeaders = `
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر التوزيع</th>
      </tr>`;
    badgeText = "قائمة أسعار التوزيع";
  } else {
    tableHeaders = `
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:125px; text-align:left;">سعر التجزئة</th>
        <th style="width:125px; text-align:left;">سعر الجملة</th>
        <th style="width:125px; text-align:left;">سعر التوزيع</th>
      </tr>`;
  }

  pw.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>قائمة الأسعار والتسعير</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;color:#334155;background:#fff;font-size:13px;line-height:1.5;padding:15px;}
    .no-print{display:flex;gap:10px;justify-content:center;padding:12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px;}
    .btn{padding:8px 18px;border-radius:6px;cursor:pointer;border:none;font-family:inherit;font-size:13px;font-weight:600;transition:all 0.15s;}
    .btn-blue{background:#2563eb;color:#fff;}
    .btn-gray{background:#64748b;color:#fff;}
    .page{width:210mm;margin:0 auto;padding:10mm;position:relative;background:#fff;}
    
    /* Elegant Accent frame */
    .page::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #1e3a8a, #10b981, #7c3aed);
    }

    .header{display:grid;grid-template-columns:1fr auto;gap:20px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e3a8a;margin-top:10px;}
    .co-logo { max-height: 65px; max-width: 140px; object-fit: contain; margin-bottom: 8px; }
    .co-name{font-size:20px;font-weight:800;color:#1e3a8a;margin-bottom:6px;letter-spacing:-0.5px;}
    .co-sub{font-size:12px;color:#64748b;margin-bottom:3px;}
    
    .doc-badge{background:#1e3a8a;color:#fff;padding:6px 18px;border-radius:6px;font-size:15px;font-weight:700;text-align:center;margin-bottom:8px;display:inline-block;}
    .doc-num{font-size:12px;color:#475569;text-align:right;margin-bottom:2px;}
    
    table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px;table-layout:auto;}
    th,td{padding:10px 12px;border:1px solid #cbd5e1;vertical-align:middle;}
    th{background:#1e293b;color:#ffffff;font-weight:700;font-size:12px;}
    td{color:#334155;}
    tr:nth-child(even) td{background:#f8fafc;}
    
    .mono{font-family:monospace;font-size:12px;}
    .font-bold{font-weight:700;}
    .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:10px;}
    
    @media print{
      .no-print{display:none!important;}
      .page{width:100%;padding:0;margin:0;}
      /* Force colors when printing */
      *{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة الآن</button>
    <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        ${companyLogo ? `<img class="co-logo" src="${companyLogo}" alt="الشعار">` : ""}
        <div class="co-name">${co.name}</div>
        <div class="co-sub">الرقم الضريبي: ${co.vatNumber}</div>
        <div class="co-sub">${co.address}</div>
        <div class="co-sub">هاتف: ${co.phone} | ${co.email}</div>
      </div>
      <div style="text-align:left; display:flex; flex-direction:column; justify-content:flex-end;">
        <div><span class="doc-badge">${badgeText}</span></div>
        <div class="doc-num">تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div class="doc-num">عدد الأصناف: <strong>${printItems.length} صنف</strong></div>
        <div class="doc-num" style="font-size:10px;color:#888;">(الأسعار شاملة ضريبة القيمة المضافة 15%)</div>
      </div>
    </div>

    <table>
      <thead>
        ${tableHeaders}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="footer">
      تخضع هذه الأسعار للتحديثات المستمرة ووفقاً للسياسة الائتمانية والتعاقدية المعتمدة للمؤسسة.
    </div>
  </div>
</body>
</html>`);
  pw.document.close();
};
