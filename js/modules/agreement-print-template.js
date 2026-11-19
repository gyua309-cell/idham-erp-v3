// ============================================================
// IDHAM ERP — Unified Master Legal Agreement Print Engine (A4)
// اتفاقية فتح حساب وتسهيلات ائتمانية — نموذج رسمي وقانوني A4 فائق الدقة
// منضبط 100% داخل صفحة A4 واحدة دون أي خروج عن الإطار أو تشويه بصري
// ============================================================

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00 ر.س";
  const num = Number(amount) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ر.س";
}

/**
 * تاريخ اليوم بصيغة YYYY-MM-DD
 */
function todayString() {
  return new Date().toISOString().split("T")[0];
}

/**
 * حساب التاريخ الهجري الحالي
 */
export function getHijriDate(dateObj = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    return formatter.format(dateObj).replace(/هـ/g, '').trim();
  } catch {
    return "1448";
  }
}

/**
 * دالة مساعدة لطباعة القيمة أو خط تنقيط CSS أنيق ومرن يملأ الخانة دون كسر عرض الجدول إطلاقاً
 */
function valOrLine(val) {
  if (val !== null && val !== undefined) {
    const s = String(val).trim();
    if (s.length > 0 && s !== "—" && s !== "-" && s !== "undefined" && s !== "null") {
      return `<span class="val-strong">${s}</span>`;
    }
  }
  return `<span class="fill-line"></span>`;
}

/**
 * جلب إعدادات المنشأة الافتراضية
 */
export function getDefaultCompanyInfo() {
  const co = {
    name: "شركة نظم الإمداد المتطورة",
    subNameAr: "تجارة وتوريد المواد الغذائية بالجملة",
    nameEn: "Advanced Supply Systems Co.",
    subNameEn: "Food Wholesale Supply",
    cityAr: "ينبع - المملكة العربية السعودية",
    cityEn: "Yanbu - Kingdom of Saudi Arabia",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    district: "حي غرناطة",
    logoUrl: ""
  };

  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
    if (cached.name) co.name = cached.name;
    if (cached.phone) co.phone = cached.phone;
    if (cached.email) co.email = cached.email;
    if (cached.crNumber || cached.cr) co.crNumber = cached.crNumber || cached.cr;
    if (cached.vatNumber) co.vatNumber = cached.vatNumber;
    if (cached.district) co.district = cached.district;
  } catch (_) {}

  return co;
}

/**
 * توليد كود HTML الكامل لاتفاقية فتح الحساب المصممة لتملأ صفحة A4 واحدة بنسبة 100%
 */
export function generateMasterAgreementHtml(d, co = null, stampSrc = "") {
  const company = co || getDefaultCompanyInfo();
  const companyStampSrc = stampSrc || company.stampUrl || "/icons/company-stamp.png";

  const dateGreg = d.dateGreg || (d.createdAt?.toDate ? d.createdAt.toDate().toISOString().split("T")[0] : todayString());
  const dateHijri = d.dateHijri || getHijriDate();

  const logoHtml = company.logoUrl ? `
    <img src="${company.logoUrl}" alt="${company.name}" style="max-height:42px; max-width:120px; object-fit:contain;" />
  ` : `
    <div style="border:1.5px solid #004d80; padding:2px 8px; border-radius:6px; text-align:center;">
      <div style="font-size:15px; line-height:1;">🏢</div>
      <div style="font-size:7.5pt; font-weight:900; color:#004d80;">${company.name}</div>
    </div>
  `;

  // تجهيز بيانات مالك المنشأة (الكفيل الغارم)
  const ownerName = d.ownerName ? String(d.ownerName).trim() : "";
  const ownerId = d.ownerId ? String(d.ownerId).trim() : "";
  const ownerPhone = d.ownerPhone ? String(d.ownerPhone).trim() : "";

  // تجهيز بيانات المسؤول المفوض بالتوقيع بدقة واستقلالية تامة عن مالك المنشأة:
  // إذا أدخل المستخدم اسم المسؤول المفوض في البطاقة 3، يُطبع اسمه وصفته وبياناته.
  // وإذا تُرِك حقله فارغاً في النظام (كما هو الحال لملئه يدوياً وتوقيعه من قبل المحل)، يظل فارغاً تماماً
  // مع أسطر تنقيط واضحة لملئه وتوقيعه يدوياً، ولا يُفترض إطلاقاً أن المالك هو المفوض.
  // بيانات المسؤول المفوض (تبقى فارغة تماماً إذا لم تُدخل ليتم ملؤها وتوقيعها يدوياً من قِبل المحل)
  const hasManager = Boolean(d.managerName && String(d.managerName).trim());
  const signatoryName = hasManager ? String(d.managerName).trim() : (d.signatoryName && String(d.signatoryName).trim() !== ownerName ? String(d.signatoryName).trim() : "");
  const signatoryRole = hasManager ? (d.managerRole || "المدير المفوض") : "";
  const signatoryId = hasManager ? String(d.managerId || "").trim() : (d.signatoryId && d.signatoryId !== ownerId ? String(d.signatoryId).trim() : "");
  const signatoryPhone = hasManager ? String(d.managerPhone || "").trim() : (d.signatoryPhone && d.signatoryPhone !== ownerPhone ? String(d.signatoryPhone).trim() : "");

  const purchaserDisplay = d.purchaserName ? `${d.purchaserName} ${d.purchaserPhone ? `(${d.purchaserPhone})` : ""}` : "";
  const receiverDisplay = d.receiverName ? `${d.receiverName} ${d.receiverPhone ? `(${d.receiverPhone})` : ""}` : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
  <title>اتفاقية فتح حساب وتسهيلات ائتمانية — ${d.name || "نموذج معتمد"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    @page {
      size: A4 portrait;
      margin: 3mm 4mm 3mm 4mm;
    }
    html, body {
      font-family: 'Cairo', 'Traditional Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 7pt;
      line-height: 1.18;
      color: #000000;
      background: #fff;
      direction: rtl;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    /* ── واجهة الشاشة (معاينة الموبايل والكمبيوتر) ── */
    @media screen {
      body {
        background: #cbd5e1;
        padding: 8px 6px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .screen-print-bar {
        position: sticky;
        top: 0;
        z-index: 9999;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(10px);
        padding: 7px 16px;
        border-radius: 30px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      }
      .btn-print-screen {
        background: linear-gradient(135deg, #0284c7, #004d80);
        color: #fff;
        border: none;
        padding: 7px 18px;
        border-radius: 20px;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(2,132,199,0.5);
      }
      .btn-close-screen {
        background: #475569;
        color: #fff;
        border: none;
        padding: 7px 14px;
        border-radius: 20px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
    }

    /* ── الإطار الأساسي الموحد للصفحة (مضبوط بدقة متناهية لصفحة A4 واحدة دون أي تجاوز) ── */
    .agreement-page {
      width: 200mm;
      max-width: 100%;
      height: 278mm;
      max-height: 280mm;
      margin: 0 auto;
      background: #fff;
      border: 2px solid #004d80;
      outline: 1.2px solid #004d80;
      outline-offset: -3px;
      border-radius: 4px;
      padding: 2.2mm 3.8mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
    }

    /* ── 1. الهيدر والشعار (منسق بدقة متناهية لمنع انكسار الكلمات نهائياً) ── */
    .hdr-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.8px solid #004d80;
      padding-bottom: 2px;
      margin-bottom: 2px;
      gap: 4px;
    }
    .hdr-col-right {
      text-align: right;
      flex: 1.0;
      min-width: 0;
      white-space: nowrap;
    }
    .hdr-company-name { font-size: 11.5pt; font-weight: 900; color: #004d80; line-height: 1.15; white-space: nowrap; }
    .hdr-company-sub  { font-size: 8pt; font-weight: 800; color: #000; margin-top: 1px; white-space: nowrap; }
    .hdr-company-reg  { font-size: 7.2pt; font-weight: 800; color: #1e293b; font-family: monospace; white-space: nowrap; }

    .hdr-col-center {
      text-align: center;
      flex: 2.35;
      min-width: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .title-banner {
      background: linear-gradient(135deg, #004d80 0%, #0284c7 100%);
      color: #fff;
      padding: 3.5px 12px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,77,128,0.22);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      box-sizing: border-box;
      white-space: nowrap;
    }
    .title-banner h1 {
      font-size: 10.8pt;
      font-weight: 900;
      letter-spacing: -0.1px;
      margin: 0;
      line-height: 1.2;
      white-space: nowrap;
      text-overflow: clip;
    }
    .title-banner .title-en {
      font-size: 6.3pt;
      font-weight: 700;
      opacity: 0.95;
      direction: ltr;
      letter-spacing: 0.1px;
      white-space: nowrap;
      line-height: 1.2;
      margin-top: 1px;
    }

    .hdr-col-left {
      text-align: left;
      direction: ltr;
      flex: 0.95;
      min-width: 0;
      white-space: nowrap;
    }
    .hdr-date-box { font-size: 7.2pt; font-weight: 800; color: #004d80; line-height: 1.25; margin-top: 1.5px; white-space: nowrap; }

    /* ── 2. خطاب التقديم ── */
    .intro-block {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-right: 3.5px solid #004d80;
      border-radius: 4px;
      padding: 2.5px 7px;
      font-size: 7.5pt;
      line-height: 1.25;
      margin-bottom: 2px;
      color: #000000;
      font-weight: 700;
    }
    .intro-block strong { color: #004d80; font-weight: 900; }
    .cust-highlight-name {
      font-size: 8.8pt;
      font-weight: 900;
      color: #004d80;
      text-decoration: underline;
    }

    /* ── 3. جدول بيانات العميل والمنشأة والمفوضين (منضبط 100% بعرض الصفحة) ── */
    .client-data-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 7.2pt;
      line-height: 1.22;
      margin-bottom: 2px;
    }
    .client-data-table th, .client-data-table td {
      border: 1px solid #0284c7;
      padding: 2.2px 5px;
      vertical-align: middle;
      text-align: right;
      overflow: hidden;
      word-break: break-word;
    }
    .client-data-table th {
      background: #e0f2fe;
      color: #004d80;
      font-weight: 800;
      font-size: 7.2pt;
    }
    .client-data-table td {
      color: #000000;
      font-weight: 700;
      background: #fff;
    }
    .val-strong {
      color: #004d80;
      font-weight: 900;
      font-size: 7.8pt;
    }
    .mono { font-family: monospace; font-size: 7.8pt; font-weight: 800; }
    .fill-line {
      display: inline-block;
      width: 95%;
      min-width: 30px;
      border-bottom: 1.2px dotted #94a3b8;
      height: 9px;
      vertical-align: middle;
    }

    /* صف المفوض بالتوقيع والالتزام المالي */
    .signatory-row th {
      background: #bae6fd !important;
      color: #003366 !important;
      font-weight: 900 !important;
    }
    .signatory-row td {
      background: #f0f9ff !important;
    }
    .owner-row th {
      background: #f1f5f9 !important;
      color: #0f172a !important;
      font-weight: 900 !important;
    }
    .owner-row td {
      background: #ffffff !important;
    }

    /* ── 4. الصندوقين المتجاورين (التعهدات القانونية + المستندات) ── */
    .dual-boxes-row {
      display: flex;
      gap: 5px;
      margin-bottom: 2px;
    }
    .box-card {
      border: 1.2px solid #004d80;
      border-radius: 5px;
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .box-card-header {
      background: #004d80;
      color: #ffffff;
      font-size: 7.8pt;
      font-weight: 900;
      padding: 2.5px 8px;
      text-align: center;
      letter-spacing: 0.1px;
      line-height: 1.25;
      border-bottom: 1.2px solid #004d80;
    }
    .box-card-body {
      padding: 3.5px 6px 3px;
      flex: 1;
    }

    .legal-clauses-list {
      list-style: none;
      font-size: 6.9pt;
      line-height: 1.22;
      text-align: justify;
      color: #000000;
      font-weight: 700;
    }
    .legal-clauses-list li {
      position: relative;
      padding-right: 14px;
      margin-bottom: 1.4px;
    }
    .legal-clauses-list li:last-child { margin-bottom: 0; }
    .legal-clauses-list li::before {
      content: attr(data-num) ".";
      position: absolute;
      right: 0;
      font-weight: 900;
      color: #004d80;
      font-size: 7.2pt;
    }
    .legal-clauses-list strong {
      color: #002244;
      font-weight: 900;
    }

    .kyc-checklist {
      list-style: none;
      font-size: 6.9pt;
      line-height: 1.32;
      color: #000000;
      font-weight: 700;
    }
    .kyc-checklist li {
      margin-bottom: 1.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .check-icon {
      color: #059669;
      font-weight: 900;
      font-size: 8.8pt;
    }

    /* ── 5. قسم التسهيلات والكفالة الغارمة ── */
    .credit-guarantee-box {
      border: 1.2px solid #004d80;
      background: #f8fafc;
      border-radius: 5px;
      padding: 3px 5px;
      margin-bottom: 2px;
    }
    .credit-terms-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      border-radius: 4px;
      padding: 2.5px 8px;
      font-size: 8pt;
      font-weight: 900;
      color: #004d80;
      margin-bottom: 2.5px;
    }
    .guarantee-text {
      background: #fff;
      border: 1px dashed #0284c7;
      border-radius: 4px;
      padding: 2.5px 5px;
      font-size: 6.8pt;
      line-height: 1.22;
      text-align: justify;
      color: #000000;
      font-weight: 700;
    }
    .guarantee-text strong { color: #002244; font-weight: 900; }

    /* ── 6. خانات التوقيعات والاعتمادات والأختام (4 أعمدة متكاملة ومنضبطة) ── */
    .signatures-grid {
      display: flex;
      gap: 4px;
      border: 1.2px solid #004d80;
      border-radius: 5px;
      padding: 3px 5px;
      background: #fff;
      margin-bottom: 2px;
    }
    .sig-col {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 7.2pt;
      font-weight: 700;
      overflow: hidden;
    }
    .sig-col-hdr {
      font-weight: 900;
      color: #004d80;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1px;
      margin-bottom: 2px;
      font-size: 7.5pt;
      white-space: nowrap;
    }
    .sig-details-block {
      text-align: right;
      font-size: 7pt;
      line-height: 1.2;
      margin-bottom: 1.5px;
      padding: 0 2px;
    }
    .sig-box-inner {
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stamp-box-frame {
      width: 82px;
      height: 34px;
      border: 1.1px dashed #94a3b8;
      border-radius: 4px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 7pt;
      font-weight: 800;
      line-height: 1.12;
    }

    /* ── 7. الشريط السفلي الكحلي ── */
    .bottom-royal-footer {
      background: #004d80;
      color: #fff;
      padding: 3px 8px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.2pt;
      font-weight: 800;
    }
    .bottom-royal-footer span { opacity: 0.95; }
    .bottom-slogan { color: #facc15; font-weight: 900; font-size: 7.8pt; }

    /* ── محددات الطباعة الرسمية A4 (حتمية الصفحة الواحدة 100%) ── */
    @media print {
      .no-print { display: none !important; }
      @page {
        size: A4 portrait;
        margin: 3mm 4mm 3mm 4mm;
      }
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        overflow: hidden !important;
      }
      .agreement-page {
        width: 200mm !important;
        height: 278mm !important;
        max-height: 280mm !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        border: 2px solid #004d80 !important;
        outline: 1.2px solid #004d80 !important;
        outline-offset: -3px !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: hidden !important;
      }
    }
  </style>
</head>
<body>

<!-- شريط الطباعة السريع على الشاشة / الموبايل -->
<div class="screen-print-bar no-print">
  <button onclick="window.print()" class="btn-print-screen">🖨️ طباعة الاتفاقية الآن (A4) / حفظ PDF</button>
  <button onclick="window.close()" class="btn-close-screen">✕ إغلاق النافذة</button>
</div>

<div class="agreement-page">

  <!-- 1. الهيدر والشعار -->
  <div class="hdr-row">
    <div class="hdr-col-right">
      <div class="hdr-company-name">${company.name}</div>
      <div class="hdr-company-sub">${company.subNameAr}</div>
      <div class="hdr-company-reg">س.ت: ${company.crNumber} &nbsp;|&nbsp; ر.ض: ${company.vatNumber}</div>
    </div>

    <div class="hdr-col-center">
      <div class="title-banner">
        <h1>اتفاقية فتح حساب وتسهيلات ائتمانية</h1>
        <div class="title-en">Customer Account Opening & Credit Facilities Agreement</div>
      </div>
    </div>

    <div class="hdr-col-left">
      <div>${logoHtml}</div>
      <div class="hdr-date-box">
        <div>التاريخ: ${dateGreg} م</div>
        <div>الموافق: ${dateHijri} هـ</div>
      </div>
    </div>
  </div>

  <!-- 2. خطاب التقديم والطلب -->
  <div class="intro-block">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div><strong>السادة / ${company.name}</strong> &nbsp; المحترمين ،،</div>
      <div style="font-size:7.2pt; font-weight:800; color:#475569;">ينبع — المملكة العربية السعودية</div>
    </div>
    <div style="margin-top:1px;">
      رغبة منا في التعامل التجاري والائتماني المعتمد مع شركتكم الموقرة، نرجو التكرم باعتماد طلب فتح / تحديث حساب المنشأة الموضحة أدناه، 
      ونقر ونلتزم بكافة الشروط والبنود والتعهدات القانونية الصارمة الآتية:
    </div>
  </div>

  <!-- 3. جدول بيانات العميل والمنشأة والمفوضين (محكم 100% بعرض الصفحة وبلا أي انزياح) -->
  <table class="client-data-table">
    <colgroup>
      <col style="width: 15%;">
      <col style="width: 20%;">
      <col style="width: 13%;">
      <col style="width: 19%;">
      <col style="width: 15%;">
      <col style="width: 18%;">
    </colgroup>
    <tr>
      <th>الاسم التجاري الرسمي:</th>
      <td colspan="3">${valOrLine(d.name)}</td>
      <th>كود العميل:</th>
      <td class="mono">${valOrLine(d.code)}</td>
    </tr>
    <tr>
      <th>السجل التجاري:</th>
      <td class="mono">${valOrLine(d.crNumber)}</td>
      <th>تاريخه / مصدره:</th>
      <td>${d.crDate || d.crSource ? `${d.crDate || ''} / ${d.crSource || d.city || 'ينبع'}` : '<span class="fill-line"></span>'}</td>
      <th>الرقم الضريبي:</th>
      <td class="mono">${valOrLine(d.vatNumber)}</td>
    </tr>
    <tr>
      <th>الشكل والنشاط:</th>
      <td>${(d.legalForm || "مؤسسة فردية")} - ${(d.activityType || "تجارة مواد غذائية")}</td>
      <th>هاتف / جوال المنشأة:</th>
      <td class="mono">${valOrLine(d.phone || d.mobile)}</td>
      <th>العنوان والحي:</th>
      <td>${d.city || 'ينبع'} ${d.district ? ' - ' + d.district : ''}</td>
    </tr>
    <!-- صف مالك المنشأة (الكفيل الغارم) منفصل ومستقل تماماً -->
    <tr class="owner-row">
      <th>مالك المنشأة (الكفيل الغارم):</th>
      <td>${valOrLine(ownerName)}</td>
      <th>رقم الهوية الوطنية:</th>
      <td class="mono">${valOrLine(ownerId)}</td>
      <th>رقم جوال المالك:</th>
      <td class="mono">${valOrLine(ownerPhone)}</td>
    </tr>
    <!-- صف المسؤول المفوض بالتوقيع (اسم المفوض، رقم هويته، رقم جواله — يترك فارغاً بخطوط تنقيط إذا لم يُدخل ليملأه المحل يدوياً) -->
    <tr class="signatory-row">
      <th>اسم المسؤول المفوض:</th>
      <td>${valOrLine(signatoryName)}</td>
      <th>رقم الهوية / الإقامة:</th>
      <td class="mono">${valOrLine(signatoryId)}</td>
      <th>رقم جوال المفوض:</th>
      <td class="mono">${valOrLine(signatoryPhone)}</td>
    </tr>
    <!-- صف فصل الصلاحيات التشغيلية (الطلب والاستلام) -->
    <tr>
      <th>المفوض بطلب البضاعة:</th>
      <td colspan="2">${purchaserDisplay ? `<span class="val-strong">${purchaserDisplay}</span>` : '<span class="fill-line"></span>'}</td>
      <th>المفوض بالاستلام:</th>
      <td colspan="2">${receiverDisplay ? `<span class="val-strong">${receiverDisplay}</span>` : '<span class="fill-line"></span>'}</td>
    </tr>
  </table>

  <!-- 4. الصندوقين المتجاورين (التعهدات القانونية الـ 8 + المستندات النظامية) -->
  <div class="dual-boxes-row">
    
    <!-- التعهدات القانونية الصارمة (63%) -->
    <div class="box-card" style="flex: 1.72;">
      <div class="box-card-header">تعهدات والتزامات العميل القانونية الصارمة (حقوق المنشأة)</div>
      <div class="box-card-body">
        <ol class="legal-clauses-list">
          <li data-num="1"><strong>الكيان القانوني الموحد والفروع:</strong> تسري هذه الاتفاقية على الكيان القانوني للمنشأة وكافة فروعها، وتستهلك مسحوبات كافة الفروع (ينبع، جدة، وغيرها) من ذات الحد الائتماني المعتمد إجمالاً، والمنشأة مسؤولة تضامنياً.</li>
          <li data-num="2"><strong>حجية الفواتير وإثبات استلام البضائع:</strong> يعتبر توقيع أو ختم المنشأة أو تابعيها على سند الاستلام أو الفاتورة الإلكترونية حجة قاطعة بالاستلام ومطابقة البضائع، وتفويض الاستلام لا يخول توقيع تسهيلات أو سندات لأمر.</li>
          <li data-num="3"><strong>قنوات الطلب والمصادقة الدورية:</strong> الطلبات عبر الجوال/الواتساب المعتمد ملزمة، وتعد كشوف الحساب المرسلة حجة قطعية ومصادقاً عليها ضمناً في حال عدم الاعتراض كتابياً خلال (5) أيام عمل وفق نظام الإثبات والمحاكم التجارية.</li>
          <li data-num="4"><strong>سقوط الآجال وحلول كامل الدين:</strong> تحسب مدة الأجل من تاريخ الاستلام الفعلي، وتسقط الآجال ويحل كامل الدين فوراً وبلا إنذار عند تأخر أي دفعة، أو بيع المنشأة، أو الحجز، أو الإعسار، أو الشطب، أو تغيير الشركاء.</li>
          <li data-num="5"><strong>إسقاط الخصومات عند التأخير:</strong> التأخر في سداد أي فاتورة في موعد استحقاقها يسقط فوراً وتلقائياً كافة الخصومات والتسهيلات الممنوحة، وتستحق الفواتير بقيمتها الاسمية الكاملة دون أي خصم.</li>
          <li data-num="6"><strong>فحص البضائع ومسؤولية التخزين:</strong> يفحص المشتري البضائع فور وصولها ويسقط حقه بالاعتراض بعد مضي (24) ساعة، وتتحمل المنشأة وحدها كامل مسؤولية سلامة التخزين المبرد والجاف للمواد الغذائية.</li>
          <li data-num="7"><strong>الضمان التنفيذي والكفالة الغارمة المتضامنة:</strong> يلتزم العميل بإصدار سند لأمر رسمي عبر منصة (نافذ) لوزارة العدل، ويعتبر الموقع أدناه كفيلاً غارماً متضامناً شخصياً في كافة أمواله الخاصة مع إسقاط صريح لحق الدفع بالتجريد أو التقسيم.</li>
          <li data-num="8"><strong>الموطن المختار والاختصاص القضائي:</strong> العناوين المذكورة موطن رسمي للإبلاغ، وينعقد الاختصاص المكاني لمحاكم ينبع التجارية مع تحمل المنشأة أتعاب المحاماة ومصاريف التحصيل بنسبة (15%) من المطالبة.</li>
        </ol>
      </div>
    </div>

    <!-- المستندات النظامية المطلوبة (37%) -->
    <div class="box-card" style="flex: 1.05;">
      <div class="box-card-header">المستندات النظامية (KYC)</div>
      <div class="box-card-body">
        <ul class="kyc-checklist">
          <li><span class="check-icon">✔</span> صورة السجل التجاري ساري ومحدث.</li>
          <li><span class="check-icon">✔</span> شهادة التسجيل في ضريبة القيمة المضافة (ZATCA).</li>
          <li><span class="check-icon">✔</span> صورة رخصة البلدية / النشاط سارية.</li>
          <li><span class="check-icon">✔</span> الهوية الوطنية لمالك المنشأة (الكفيل).</li>
          <li><span class="check-icon">✔</span> هوية / إقامة المفوض بالتوقيع (الكفيل الغارم).</li>
          <li><span class="check-icon">✔</span> العنوان الوطني المعتمد / صك أو عقد الإيجار.</li>
          <li><span class="check-icon">✔</span> شهادة الآيبان البنكي الصادرة باسم المنشأة.</li>
          <li><span class="check-icon">✔</span> تفويض موقع للمشتريات واستلام البضائع.</li>
          <li><span class="check-icon">✔</span> سند لأمر إلكتروني معتمد عبر منصة "نافذ".</li>
        </ul>
      </div>
    </div>

  </div>

  <!-- 5. حدود التسهيلات الائتمانية المقرة وإقرار الكفالة الغارمة -->
  <div class="credit-guarantee-box">
    <div class="credit-terms-bar">
      <div>الحد الائتماني المعتمد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${formatCurrency(d.creditLimit || 0)}</span></div>
      <div>فترة السماح والسداد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${d.creditDays || 30}</span> يوماً</div>
      <div>مدير المبيعات المسؤول: <span>${d.repName || "إدارة المبيعات"}</span></div>
      <div>طريقة السداد: <span>آجل معتمد</span></div>
    </div>

    <!-- إقرار الكفالة الغارمة المتضامنة المانع للدفع بالتجريد -->
    <div class="guarantee-text">
      <strong>إقرار وتعهد وتضامن العميل (الكفالة الغارمة المانعة للدفع بالتجريد والتقسيم):</strong>
      أقر أنا الموقع أدناه بصفتي المالك / المدير المفوض للمنشأة المذكورة، بصحة ودقة كافة البيانات والوثائق المقدمة، وبأنني اطلعت على كافة الشروط والأحكام والتعهدات الـ 8 المذكورة أعلاه ووافقت عليها دون تحفظ، كما أقر بمسؤوليتي الشخصية والتضامنية (كفيلاً غارماً متضامناً في كافة أموالي الخاصة) عن سداد كامل المديونيات والمستحقات المترتبة على المنشأة وفروعها لصالح شركة نظم الإمداد المتطورة، وأسقط بموجب هذا صراحة حقي في الدفع بالتجريد أو التقسيم أو الرجوع أولاً على المدين الأصلي وفق الأنظمة واللوائح السعودية.
    </div>
  </div>

  <!-- 6. خانات التوقيعات والاعتمادات الرسمية والأختام (منسقة بدقة للتوقيع والختم الحي) -->
  <div class="signatures-grid">
    <!-- 1. المفوض بالتوقيع والكفيل الغارم (يترك فارغاً تماماً للتوقيع والملء اليدوي) -->
    <div class="sig-col" style="flex: 1.35;">
      <div class="sig-col-hdr">المفوض بالتوقيع (الكفيل الغارم)</div>
      <div class="sig-details-block">
        <div>اسم المفوض: <strong>${signatoryName ? signatoryName : "........................................"}</strong></div>
        <div>رقم الهوية: <strong>${signatoryId ? signatoryId : "........................................"}</strong></div>
        <div>رقم الجوال: <strong>${signatoryPhone ? signatoryPhone : "........................................"}</strong></div>
      </div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${dateGreg} م</div>
    </div>

    <!-- 2. الختم الرسمي للمنشأة -->
    <div class="sig-col" style="flex: 1.0;">
      <div class="sig-col-hdr">الختم الرسمي للمنشأة</div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; align-items:center; justify-content:center;">
        <div class="stamp-box-frame" style="width:88px; height:46px; border:1.2px dashed #94a3b8; border-radius:4px;"></div>
      </div>
      <div style="font-size:6.2pt; color:#64748b; margin-top:1px;">(موضع ختم العميل الحي)</div>
    </div>

    <!-- 3. إدارة المبيعات والائتمان الميداني -->
    <div class="sig-col" style="flex: 1.05;">
      <div class="sig-col-hdr">إدارة المبيعات والائتمان</div>
      <div style="font-size:6.8pt; color:#004d80; margin-bottom:1px;">مدير المبيعات: <strong>${d.repName || "إدارة المبيعات"}</strong></div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${dateGreg} م</div>
    </div>

    <!-- 4. الاعتماد المالي والإداري النهائي (ختم المنشأة واضح ومكبر) -->
    <div class="sig-col" style="flex: 1.35;">
      <div class="sig-col-hdr">الاعتماد المالي النهائي</div>
      <div style="font-size:6.8pt; color:#004d80; font-weight:800; margin-bottom:1px;">شركة نظم الإمداد المتطورة</div>
      <div class="sig-box-inner" style="min-height:56px; display:flex; align-items:center; justify-content:center;">
        <img src="${companyStampSrc}" alt="ختم شركة نظم الإمداد المتطورة" style="width:95px; height:95px; max-width:98px; max-height:98px; object-fit:contain; filter:drop-shadow(0 1px 2px rgba(0,77,128,0.22));" />
      </div>
      <div style="font-size:6.2pt; color:#004d80; font-weight:800; margin-top:1px;">معتمد وموثق رسمياً</div>
    </div>
  </div>

  <!-- 7. الشريط السفلي الكحلي للشركة -->
  <div class="bottom-royal-footer">
    <div>📞 ${company.phone}</div>
    <div>✉️ ${company.email}</div>
    <div>📍 ${company.cityAr}</div>
    <div>س.ت: ${company.crNumber} &nbsp;|&nbsp; ر.ض: ${company.vatNumber}</div>
    <div class="bottom-slogan">معاً .. نحو إمداد أفضل</div>
  </div>

</div>

<script>
  window.onload = function() {
    // تشغيل نافذة الطباعة بعد تحميل الخطوط
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        setTimeout(function() { window.print(); }, 200);
      });
    } else {
      setTimeout(function() { window.print(); }, 350);
    }
  };
</script>

</body>
</html>`;
}

/**
 * فتح نافذة الطباعة وتشغيلها فوراً للاتفاقية المعتمدة
 */
export function printMasterCustomerAgreement(d, co = null) {
  const printWin = window.open("", "_blank");
  if (!printWin) {
    if (window.showToast) window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "error");
    else alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }

  // جلب ختم الشركة وتحويله لـ Base64 لضمان ظهوره الفوري في المعاينة والطباعة
  fetch("/icons/company-stamp.png?t=" + Date.now())
    .then(r => r.blob())
    .then(blob => new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = () => res("/icons/company-stamp.png");
      reader.readAsDataURL(blob);
    }))
    .catch(() => "/icons/company-stamp.png")
    .then(stampSrc => {
      const html = generateMasterAgreementHtml(d, co, stampSrc);
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
    });
}

// إتاحتها عالمياً لكافة النوافذ والموديولات
if (typeof window !== "undefined") {
  window.generateMasterAgreementHtml = generateMasterAgreementHtml;
  window.printMasterCustomerAgreement = printMasterCustomerAgreement;
}
