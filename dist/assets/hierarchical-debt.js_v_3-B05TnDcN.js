import{t as te,s as Te,I as Re,g as T,C as R,d as Ie,a as Ae,f as y}from"./index-CF9GFeRJ.js";import{collection as Ne}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function Ee(t){return t==null||isNaN(t)?"0.00 ر.س":(Number(t)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س"}function He(){return new Date().toISOString().split("T")[0]}function ue(t=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"numeric",year:"numeric"}).format(t).replace(/هـ/g,"").trim()}catch{return"1448"}}function M(t){if(t!=null){const e=String(t).trim();if(e.length>0&&e!=="—"&&e!=="-"&&e!=="undefined"&&e!=="null")return`<span class="val-strong">${e}</span>`}return'<span class="fill-line"></span>'}function xe(){const t={name:"شركة نظم الإمداد المتطورة",subNameAr:"تجارة وتوريد المواد الغذائية بالجملة",nameEn:"Advanced Supply Systems Co.",subNameEn:"Food Wholesale Supply",cityAr:"ينبع - المملكة العربية السعودية",cityEn:"Yanbu - Kingdom of Saudi Arabia",phone:"0549141648",email:"Nuzmalamdad@gmail.com",crNumber:"7054969006",vatNumber:"314996148100003",district:"حي غرناطة",logoUrl:""};try{const e=JSON.parse(localStorage.getItem("idham_company")||"{}");e.logoBase64&&(t.logoUrl=e.logoBase64),e.name&&(t.name=e.name),e.phone&&(t.phone=e.phone),e.email&&(t.email=e.email),(e.crNumber||e.cr)&&(t.crNumber=e.crNumber||e.cr),e.vatNumber&&(t.vatNumber=e.vatNumber),e.district&&(t.district=e.district)}catch{}return t}function ve(t,e=null,n=""){const o=e||xe(),s=n||o.stampUrl||"/icons/company-stamp.png",a=t.dateGreg||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:He()),l=t.dateHijri||ue(),c=o.logoUrl?`
    <img src="${o.logoUrl}" alt="${o.name}" style="max-height:42px; max-width:120px; object-fit:contain;" />
  `:`
    <div style="border:1.5px solid #004d80; padding:2px 8px; border-radius:6px; text-align:center;">
      <div style="font-size:15px; line-height:1;">🏢</div>
      <div style="font-size:7.5pt; font-weight:900; color:#004d80;">${o.name}</div>
    </div>
  `,p=t.ownerName?String(t.ownerName).trim():"",d=t.ownerId?String(t.ownerId).trim():"",b=t.ownerPhone?String(t.ownerPhone).trim():"",g=!!(t.managerName&&String(t.managerName).trim()),f=g?String(t.managerName).trim():t.signatoryName&&String(t.signatoryName).trim()!==p?String(t.signatoryName).trim():"";g&&t.managerRole;const x=g?String(t.managerId||"").trim():t.signatoryId&&t.signatoryId!==d?String(t.signatoryId).trim():"",v=g?String(t.managerPhone||"").trim():t.signatoryPhone&&t.signatoryPhone!==b?String(t.signatoryPhone).trim():"",m=t.purchaserName?`${t.purchaserName} ${t.purchaserPhone?`(${t.purchaserPhone})`:""}`:"",$=t.receiverName?`${t.receiverName} ${t.receiverPhone?`(${t.receiverPhone})`:""}`:"";return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
  <title>اتفاقية فتح حساب وتسهيلات ائتمانية — ${t.name||"نموذج معتمد"}</title>
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

    /* ── 1. الهيدر والشعار (محمي 100% من أي تداخل أو انكسار في الكلمات) ── */
    .hdr-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.8px solid #004d80;
      padding-bottom: 2.5px;
      margin-bottom: 2.5px;
      width: 100%;
      box-sizing: border-box;
    }
    .hdr-col-right {
      text-align: right;
      width: 33%;
      min-width: 60mm;
      max-width: 35%;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .hdr-company-name {
      font-size: 11pt;
      font-weight: 900;
      color: #004d80;
      line-height: 1.2;
      white-space: nowrap;
    }
    .hdr-company-sub {
      font-size: 7.8pt;
      font-weight: 800;
      color: #000;
      margin-top: 1px;
      white-space: nowrap;
    }
    .hdr-company-reg {
      font-size: 7pt;
      font-weight: 800;
      color: #1e293b;
      font-family: monospace;
      white-space: nowrap;
    }

    .hdr-col-center {
      text-align: center;
      flex: 1;
      padding: 0 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 0;
      box-sizing: border-box;
    }
    .title-banner {
      background: linear-gradient(135deg, #004d80 0%, #0284c7 100%);
      color: #fff;
      padding: 3px 8px;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,77,128,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: auto;
      max-width: 100%;
      box-sizing: border-box;
      white-space: nowrap;
    }
    .title-banner h1 {
      font-size: 9.8pt;
      font-weight: 900;
      letter-spacing: -0.2px;
      margin: 0;
      line-height: 1.2;
      white-space: nowrap;
    }
    .title-banner .title-en {
      font-size: 5.6pt;
      font-weight: 700;
      opacity: 0.95;
      direction: ltr;
      letter-spacing: 0.1px;
      white-space: nowrap;
      line-height: 1.15;
      margin-top: 1px;
    }

    .hdr-col-left {
      text-align: left;
      direction: ltr;
      width: 25%;
      min-width: 44mm;
      max-width: 28%;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .hdr-date-box {
      font-size: 7.2pt;
      font-weight: 800;
      color: #004d80;
      line-height: 1.25;
      margin-top: 1.5px;
      white-space: nowrap;
    }

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
      <div class="hdr-company-name">${o.name}</div>
      <div class="hdr-company-sub">${o.subNameAr}</div>
      <div class="hdr-company-reg">س.ت: ${o.crNumber} &nbsp;|&nbsp; ر.ض: ${o.vatNumber}</div>
    </div>

    <div class="hdr-col-center">
      <div class="title-banner">
        <h1>اتفاقية فتح حساب وتسهيلات ائتمانية</h1>
        <div class="title-en">Customer Account Opening & Credit Facilities Agreement</div>
      </div>
    </div>

    <div class="hdr-col-left">
      <div>${c}</div>
      <div class="hdr-date-box">
        <div>التاريخ: ${a} م</div>
        <div>الموافق: ${l} هـ</div>
      </div>
    </div>
  </div>

  <!-- 2. خطاب التقديم والطلب -->
  <div class="intro-block">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div><strong>السادة / ${o.name}</strong> &nbsp; المحترمين ،،</div>
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
      <td colspan="3">${M(t.name)}</td>
      <th>كود العميل:</th>
      <td class="mono">${M(t.code)}</td>
    </tr>
    <tr>
      <th>السجل التجاري:</th>
      <td class="mono">${M(t.crNumber)}</td>
      <th>تاريخه / مصدره:</th>
      <td>${t.crDate||t.crSource?`${t.crDate||""} / ${t.crSource||t.city||"ينبع"}`:'<span class="fill-line"></span>'}</td>
      <th>الرقم الضريبي:</th>
      <td class="mono">${M(t.vatNumber)}</td>
    </tr>
    <tr>
      <th>الشكل والنشاط:</th>
      <td>${t.legalForm||"مؤسسة فردية"} - ${t.activityType||"تجارة مواد غذائية"}</td>
      <th>هاتف / جوال المنشأة:</th>
      <td class="mono">${M(t.phone||t.mobile)}</td>
      <th>العنوان والحي:</th>
      <td>${t.city||"ينبع"} ${t.district?" - "+t.district:""}</td>
    </tr>
    <!-- صف مالك المنشأة (الكفيل الغارم) منفصل ومستقل تماماً -->
    <tr class="owner-row">
      <th>مالك المنشأة (الكفيل الغارم):</th>
      <td>${M(p)}</td>
      <th>رقم الهوية الوطنية:</th>
      <td class="mono">${M(d)}</td>
      <th>رقم جوال المالك:</th>
      <td class="mono">${M(b)}</td>
    </tr>
    <!-- صف المسؤول المفوض بالتوقيع (اسم المفوض، رقم هويته، رقم جواله — يترك فارغاً بخطوط تنقيط إذا لم يُدخل ليملأه المحل يدوياً) -->
    <tr class="signatory-row">
      <th>اسم المسؤول المفوض:</th>
      <td>${M(f)}</td>
      <th>رقم الهوية / الإقامة:</th>
      <td class="mono">${M(x)}</td>
      <th>رقم جوال المفوض:</th>
      <td class="mono">${M(v)}</td>
    </tr>
    <!-- صف فصل الصلاحيات التشغيلية (الطلب والاستلام) -->
    <tr>
      <th>المفوض بطلب البضاعة:</th>
      <td colspan="2">${m?`<span class="val-strong">${m}</span>`:'<span class="fill-line"></span>'}</td>
      <th>المفوض بالاستلام:</th>
      <td colspan="2">${$?`<span class="val-strong">${$}</span>`:'<span class="fill-line"></span>'}</td>
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
      <div>الحد الائتماني المعتمد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${Ee(t.creditLimit||0)}</span></div>
      <div>فترة السماح والسداد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${t.creditDays||30}</span> يوماً</div>
      <div>مدير المبيعات المسؤول: <span>${t.repName||"إدارة المبيعات"}</span></div>
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
        <div>اسم المفوض: <strong>${f||"........................................"}</strong></div>
        <div>رقم الهوية: <strong>${x||"........................................"}</strong></div>
        <div>رقم الجوال: <strong>${v||"........................................"}</strong></div>
      </div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${a} م</div>
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
      <div style="font-size:6.8pt; color:#004d80; margin-bottom:1px;">مدير المبيعات: <strong>${t.repName||"إدارة المبيعات"}</strong></div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${a} م</div>
    </div>

    <!-- 4. الاعتماد المالي والإداري النهائي (ختم المنشأة واضح ومكبر) -->
    <div class="sig-col" style="flex: 1.35;">
      <div class="sig-col-hdr">الاعتماد المالي النهائي</div>
      <div style="font-size:6.8pt; color:#004d80; font-weight:800; margin-bottom:1px;">شركة نظم الإمداد المتطورة</div>
      <div class="sig-box-inner" style="min-height:56px; display:flex; align-items:center; justify-content:center;">
        <img src="${s}" alt="ختم شركة نظم الإمداد المتطورة" style="width:95px; height:95px; max-width:98px; max-height:98px; object-fit:contain; filter:drop-shadow(0 1px 2px rgba(0,77,128,0.22));" />
      </div>
      <div style="font-size:6.2pt; color:#004d80; font-weight:800; margin-top:1px;">معتمد وموثق رسمياً</div>
    </div>
  </div>

  <!-- 7. الشريط السفلي الكحلي للشركة -->
  <div class="bottom-royal-footer">
    <div>📞 ${o.phone}</div>
    <div>✉️ ${o.email}</div>
    <div>📍 ${o.cityAr}</div>
    <div>س.ت: ${o.crNumber} &nbsp;|&nbsp; ر.ض: ${o.vatNumber}</div>
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
<\/script>

</body>
</html>`}function Fe(t,e=null){const n=window.open("","_blank");if(!n){window.showToast?window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","error"):alert("يرجى السماح بالنوافذ المنبثقة للطباعة");return}fetch("/icons/company-stamp.png?t="+Date.now()).then(o=>o.blob()).then(o=>new Promise(s=>{const a=new FileReader;a.onload=()=>s(a.result),a.onerror=()=>s("/icons/company-stamp.png"),a.readAsDataURL(o)})).catch(()=>"/icons/company-stamp.png").then(o=>{const s=ve(t,e,o);n.document.open(),n.document.write(s),n.document.close()})}typeof window<"u"&&(window.generateMasterAgreementHtml=ve,window.printMasterCustomerAgreement=Fe);let Q=[],Y=[],X=[],we=[],ye=[],ke=[],Z=[],be=[],F={};const $e="idham_hdebt_export_cfg_v3",A=[{id:"col_code",enabled:!0,locked:!1,weight:8,label:"كود العميل",short:"الكود",desc:"الرمز التعريفي للعميل"},{id:"col_last_payment",enabled:!1,locked:!1,weight:12,label:"آخر تحصيل (مبلغ وتاريخ)",short:"آخر تحصيل",desc:"أحدث دفعة مسددة للعميل وتاريخها وعدد الأيام"},{id:"_name",enabled:!0,locked:!0,weight:20,label:"اسم العميل (أساسي)",short:"اسم العميل",desc:"اسم العميل (عمود أساسي يظهر دائماً)"},{id:"col_contact",enabled:!0,locked:!1,weight:13,label:"معلومات العميل (هاتف/منطقة)",short:"معلومات العميل",desc:"رقم الهاتف والمنطقة المختصرة"},{id:"col_profit",enabled:!1,locked:!1,weight:11,label:"هامش الربح (المبلغ والنسبة)",short:"هامش الربح",desc:"صافي الربح (قبل الضريبة - التكلفة) ونسبة الهامش %"},{id:"col_opening",enabled:!0,locked:!1,weight:10,label:"رصيد أول المدة",short:"رصيد سابق",desc:"الرصيد التراكمي قبل بداية الفترة"},{id:"col_sales",enabled:!0,locked:!1,weight:10,label:"مبيعات الفترة (+)",short:"مبيعات (+)",desc:"فواتير المبيعات وأذون التسليم الآجلة"},{id:"col_receipts",enabled:!0,locked:!1,weight:10,label:"سدادات الفترة (-)",short:"سدادات (-)",desc:"سندات القبض والتحصيل خلال الفترة"},{id:"col_returns",enabled:!0,locked:!1,weight:8.5,label:"مردودات الفترة (-)",short:"مرتجعات (-)",desc:"إشعارات مرتجعات المبيعات"},{id:"col_closing",enabled:!0,locked:!1,weight:11,label:"صافي المديونية",short:"صافي المديونية",desc:"الرصيد النهائي المستحق حالياً"},{id:"col_coll_rate",enabled:!0,locked:!1,weight:6.5,label:"نسبة التحصيل %",short:"التحصيل",desc:"نسبة المحصل من إجمالي المستحق"},{id:"col_status",enabled:!0,locked:!1,weight:6.5,label:"حالة المديونية",short:"الحالة",desc:"مدين / مسدد / دائن"},{id:"col_notes",enabled:!1,locked:!1,weight:13,label:"ملاحظات / توقيع المتابعة",short:"ملاحظات التحصيل",desc:"خانة فارغة للتوقيع والملاحظات الميدانية"}],G={standard:"🏛️ القالب القياسي",profit_collection:"💎 الربحية وآخر تحصيل",field_followup:"📋 متابعة المندوب الميدانية",comprehensive:"📊 الشامل الكامل (أفقي)",custom:"⚙️ مخصص يدوياً"};function O(){return{preset:"standard",orientation:"portrait",profitScope:"period",showRepMatrix:!0,showKpis:!0,showSignatures:!0,hideNegligible:!1,columns:A.map(t=>({...t}))}}function I(){try{const t=localStorage.getItem($e);if(!t)return O();const e=JSON.parse(t),n=O(),o=new Set(A.map(l=>l.id)),s=[],a=new Set;return Array.isArray(e.columns)&&e.columns.forEach(l=>{if(o.has(l.id)&&!a.has(l.id)){const c=A.find(p=>p.id===l.id);s.push({...c,enabled:c.locked?!0:!!l.enabled}),a.add(l.id)}}),A.forEach(l=>{a.has(l.id)||s.push({...l})}),{preset:e.preset||n.preset,orientation:e.orientation==="landscape"?"landscape":"portrait",profitScope:e.profitScope==="allTime"?"allTime":"period",showRepMatrix:e.showRepMatrix!==void 0?!!e.showRepMatrix:!0,showKpis:e.showKpis!==void 0?!!e.showKpis:!0,showSignatures:e.showSignatures!==void 0?!!e.showSignatures:!0,hideNegligible:!!e.hideNegligible,columns:s}}catch{return O()}}function q(t){try{localStorage.setItem($e,JSON.stringify(t))}catch{}_e(t)}function _e(t){const e=document.getElementById("hdebt-custom-preset-pill");if(!e)return;const n=(t.columns||[]).filter(s=>s.enabled||s.locked).length,o=G[t.preset]||G.custom;e.textContent=`${o} (${n})`}function fe(t){const e=O();if(e.preset=t,t==="profit_collection"){const n=["col_last_payment","_name","col_profit","col_opening","col_sales","col_receipts","col_returns","col_closing","col_coll_rate","col_status","col_code","col_contact","col_notes"],o=new Set(["col_last_payment","_name","col_profit","col_opening","col_sales","col_receipts","col_returns","col_closing","col_coll_rate","col_status"]);e.columns=n.map(s=>({...A.find(l=>l.id===s),enabled:o.has(s)})),e.orientation="portrait"}else if(t==="field_followup"){const n=["_name","col_contact","col_last_payment","col_closing","col_coll_rate","col_notes","col_opening","col_sales","col_receipts","col_returns","col_profit","col_code","col_status"],o=new Set(["_name","col_contact","col_last_payment","col_closing","col_coll_rate","col_notes"]);e.columns=n.map(s=>({...A.find(l=>l.id===s),enabled:o.has(s)})),e.orientation="portrait"}else if(t==="comprehensive"){const n=new Set(["col_code","col_last_payment","_name","col_contact","col_profit","col_opening","col_sales","col_receipts","col_returns","col_closing","col_coll_rate","col_status"]);e.columns=A.map(o=>({...o,enabled:n.has(o.id)})),e.orientation="landscape"}else return O();return e}let oe=[],D={totalDebt:0,netReceivables:0,periodSales:0,periodReceipts:0,periodReturns:0,debtorCount:0,totalCustomers:0,collectionRate:0},E=new Set,H=new Set;async function nt(t,e){const n=te(),o=Te();t.innerHTML=`
    <div class="hdebt-root">
      
      <!-- ═══ HEADER PANEL ═══ -->
      <div class="hdebt-header-card no-print">
        <div class="hdebt-header-main">
          <div class="hdebt-icon-box">📊</div>
          <div>
            <h1 class="hdebt-title">تقرير المديونيات الهرمي الشجري</h1>
            <p class="hdebt-sub">تحليل هرمي شامل لمديونيات العملاء ومتابعة تحصيلات المناديب — معتمد 100% على فواتير المبيعات وسندات القبض والمرتجعات الفعلية</p>
          </div>
        </div>
        <div class="hdebt-header-actions">
          <button class="hdebt-btn hdebt-btn-ghost" onclick="window.expandAllHierarchicalDebt(true)">
            <span>➕</span> فتح الكل
          </button>
          <button class="hdebt-btn hdebt-btn-ghost" onclick="window.expandAllHierarchicalDebt(false)">
            <span>➖</span> طي الكل
          </button>
          <button class="hdebt-btn hdebt-btn-custom" onclick="window.openHierarchicalDebtCustomizer()" title="تخصيص واستبدال أعمدة الطباعة والتصدير (مثل استبدال الكود بآخر تحصيل والمعلومات بهامش الربح)">
            <span>⚙️</span> تخصيص الأعمدة
            <span id="hdebt-custom-preset-pill" class="hdebt-preset-pill">🏛️ القياسي</span>
          </button>
          <button class="hdebt-btn hdebt-btn-excel" onclick="window.exportHierarchicalDebtExcel()" title="تصدير الجدول بالأعمدة المختارة إلى Excel">
            <span>📊</span> تصدير Excel
          </button>
          <button class="hdebt-btn hdebt-btn-print" onclick="window.exportHierarchicalDebtPDF('summary')" title="تصدير كشف ملخص تنفيذي (موجز) بصيغة PDF / A4">
            <span>📄</span> PDF مختصر
          </button>
          <button class="hdebt-btn hdebt-btn-detailed" style="background:#4338ca; border-color:#3730a3; color:#fff;" onclick="window.exportHierarchicalDebtPDF('detailed')" title="تصدير كشف تفصيلي بحركات كل عميل بصيغة PDF / A4">
            <span>📑</span> PDF موسع
          </button>
          <button class="hdebt-btn hdebt-btn-primary" onclick="window.loadHierarchicalDebtData(true)">
            <span>🔄</span> تحديث
          </button>
        </div>
      </div>

      <!-- ═══ FILTER BAR ═══ -->
      <div class="hdebt-filterbar no-print">
        
        <!-- Rep Selector -->
        <div class="hdebt-fg" style="min-width:180px;">
          <label>المندوب</label>
          <select id="hdebt-rep-filter" class="hdebt-select" onchange="window.applyHierarchicalDebtFilters()">
            <option value="">🌟 جميع المناديب</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="hdebt-fg" style="min-width:135px;">
          <label>من تاريخ</label>
          <input type="date" id="hdebt-from" class="hdebt-input font-bold mono" value="${o}" onchange="window.loadHierarchicalDebtData()" />
        </div>
        <div class="hdebt-fg" style="min-width:135px;">
          <label>إلى تاريخ</label>
          <input type="date" id="hdebt-to" class="hdebt-input font-bold mono" value="${n}" onchange="window.loadHierarchicalDebtData()" />
        </div>

        <!-- Debt Status Filter -->
        <div class="hdebt-fg" style="min-width:160px;">
          <label>حالة المديونية</label>
          <select id="hdebt-status-filter" class="hdebt-select" onchange="window.applyHierarchicalDebtFilters()">
            <option value="all">الكل (مدين / مسدد / دائن)</option>
            <option value="debtors" selected>🔴 المدينون فقط (رصيد > 0)</option>
            <option value="settled">🟢 المسددون بالكامل (0.00)</option>
            <option value="creditors">🔵 أرصدة دائنة (رصيد < 0)</option>
          </select>
        </div>

        <!-- Quick Presets -->
        <div class="hdebt-presets">
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('today')">اليوم ⚡</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('week')">هذا الأسبوع 📅</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('mtd')">الشهر الحالي MTD 🗓️</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('lastMonth')">الشهر الماضي</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('all')">الكل (من البداية) ♾️</button>
        </div>

        <!-- Search Box -->
        <div class="hdebt-search-wrap">
          <label>🔍 بحث فوري</label>
          <input type="text" id="hdebt-search" class="hdebt-input" placeholder="ابحث باسم العميل أو الكود أو المندوب..." oninput="window.applyHierarchicalDebtFilters()" />
        </div>

      </div>

      <!-- ═══ KPI CARDS ═══ -->
      <div class="hdebt-kpis-grid" id="hdebt-kpis-container">
        
        <!-- Card 1: Total Debt -->
        <div class="hdebt-kpi-card kpi-red">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">💳</span>
            <span class="hdebt-kpi-label">إجمالي المديونيات المستحقة</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-total-debt">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-debtors-count">0 عميل مدين قائم</div>
        </div>

        <!-- Card 2: Period Sales -->
        <div class="hdebt-kpi-card kpi-blue">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">📈</span>
            <span class="hdebt-kpi-label">مبيعات الفترة (فواتير)</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-sales">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-sales-inv-count">إجمالي الفواتير الصادرة</div>
        </div>

        <!-- Card 3: Period Collections -->
        <div class="hdebt-kpi-card kpi-green">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">💰</span>
            <span class="hdebt-kpi-label">تحصيلات وسدادات الفترة</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-receipts">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-receipts-count">سندات قبض وتحصيل</div>
        </div>

        <!-- Card 4: Period Returns -->
        <div class="hdebt-kpi-card kpi-amber">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">🔄</span>
            <span class="hdebt-kpi-label">مردودات الفترة (مرتجعات)</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-returns">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-returns-count">خصم مرتجع مبيعات</div>
        </div>

        <!-- Card 5: Collection Rate -->
        <div class="hdebt-kpi-card kpi-indigo">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">🎯</span>
            <span class="hdebt-kpi-label">نسبة التحصيل الإجمالية</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-collection-rate">0.0%</div>
          <div class="hdebt-kpi-sub" id="kpi-net-receivables">صافي الذمم: 0.00 ر.س</div>
        </div>

      </div>

      <!-- ═══ PRINT TITLE (PRINT ONLY) ═══ -->
      <div class="hdebt-print-banner print-only" style="display:none;">
        <div style="text-align:center; margin-bottom:12px;">
          <h2 style="margin:0; font-size:18px; color:#1e3a8a;">تقرير المديونيات الهرمي الشجري لمتابعة العملاء والمناديب</h2>
          <div style="font-size:12px; color:#475569; margin-top:4px;" id="hdebt-print-period-label">الفترة: --</div>
        </div>
      </div>

      <!-- ═══ HIERARCHICAL TREE CONTAINER ═══ -->
      <div id="hdebt-tree-content" class="hdebt-tree-wrap">
        <div class="hdebt-loading">
          <div class="hdebt-spinner"></div>
          <div>جارٍ استخراج وتدقيق المديونيات من فواتير المبيعات وسندات القبض...</div>
        </div>
      </div>

    </div>

    <!-- ═══ COLUMN CUSTOMIZATION MODAL ═══ -->
    <div id="hdebt-col-modal" class="hdebt-modal-backdrop no-print" style="display:none;" onclick="if(event.target===this) window.closeHierarchicalDebtCustomizer()">
      <div class="hdebt-modal" role="dialog" aria-modal="true">
        <div class="hdebt-modal-head">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">⚙️</span>
            <div>
              <h2 style="margin:0; font-size:15.5px; font-weight:900; color:#fff;">تخصيص واستبدال أعمدة الطباعة والتصدير (PDF و Excel)</h2>
              <div style="font-size:11px; color:rgba(255,255,255,0.85);">اختر الأعمدة الظاهرة أو استبدلها ورتبها كما يناسب الإدارة أو المندوبين</div>
            </div>
          </div>
          <button class="hdebt-modal-close" onclick="window.closeHierarchicalDebtCustomizer()">✕</button>
        </div>

        <div class="hdebt-modal-body" id="hdebt-col-modal-body">
          <!-- Dynamically populated -->
        </div>

        <div class="hdebt-modal-foot">
          <button class="hdebt-btn hdebt-btn-excel" onclick="window.saveAndRunHierarchicalExport('excel')">
            <span>📊</span> حفظ وتصدير Excel
          </button>
          <button class="hdebt-btn hdebt-btn-print" onclick="window.saveAndRunHierarchicalExport('summary')">
            <span>📄</span> حفظ ومعاينة PDF مختصر
          </button>
          <button class="hdebt-btn hdebt-btn-detailed" onclick="window.saveAndRunHierarchicalExport('detailed')">
            <span>📑</span> حفظ ومعاينة PDF موسع
          </button>
          <button class="hdebt-btn" style="background:#e2e8f0; color:#0f172a; margin-right:auto;" onclick="window.saveAndCloseHierarchicalCustomizer()">
            💾 حفظ فقط
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ STYLES ═══ -->
    <style>
      .hdebt-root { padding: 18px 22px; direction: rtl; font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif; color: var(--text-0, #0f172a); }
      
      /* Header Panel */
      .hdebt-header-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
        border-radius: 16px; padding: 20px 24px; color: #fff;
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
        box-shadow: 0 6px 20px rgba(30, 64, 175, 0.25); margin-bottom: 18px;
      }
      .hdebt-header-main { display: flex; align-items: center; gap: 14px; }
      .hdebt-icon-box {
        width: 50px; height: 50px; border-radius: 14px; background: rgba(255,255,255,0.18);
        display: flex; align-items: center; justify-content: center; font-size: 24px;
        backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25);
      }
      .hdebt-title { margin: 0; font-size: 1.45rem; font-weight: 900; letter-spacing: -0.3px; color: #fff; }
      .hdebt-sub { margin: 4px 0 0; font-size: 0.84rem; color: rgba(255,255,255,0.85); font-weight: 500; }
      .hdebt-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

      .hdebt-btn {
        display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px;
        font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit;
      }
      .hdebt-btn-ghost { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
      .hdebt-btn-ghost:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
      .hdebt-btn-excel { background: #10b981; color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
      .hdebt-btn-excel:hover { background: #059669; transform: translateY(-1px); }
      .hdebt-btn-print { background: #3b82f6; color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
      .hdebt-btn-print:hover { background: #2563eb; transform: translateY(-1px); }
      .hdebt-btn-detailed { background: #4338ca; color: #fff; box-shadow: 0 2px 8px rgba(67, 56, 202, 0.3); }
      .hdebt-btn-detailed:hover { background: #3730a3; transform: translateY(-1px); }
      .hdebt-btn-custom { background: #0f172a; color: #fff; border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 2px 8px rgba(15,23,42,0.25); }
      .hdebt-btn-custom:hover { background: #1e293b; transform: translateY(-1px); }
      .hdebt-preset-pill { background: rgba(250,204,21,0.18); color: #fde047; border: 1px solid rgba(250,204,21,0.35); padding: 1px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 800; }

      .hdebt-modal-backdrop {
        position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
        z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;
      }
      .hdebt-modal {
        background: #fff; border-radius: 16px; width: 100%; max-width: 780px; max-height: 92vh;
        display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        direction: rtl; font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif;
      }
      .hdebt-modal-head {
        background: linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%); padding: 14px 20px;
        display: flex; justify-content: space-between; align-items: center; color: #fff;
      }
      .hdebt-modal-close {
        background: rgba(255,255,255,0.18); border: none; color: #fff; width: 32px; height: 32px;
        border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 800;
      }
      .hdebt-modal-close:hover { background: #dc2626; }
      .hdebt-modal-body { padding: 16px 20px; overflow-y: auto; flex: 1; background: #f8fafc; }
      .hdebt-modal-foot {
        padding: 12px 20px; background: #fff; border-top: 1px solid #e2e8f0;
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }
      .hdebt-presets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 8px; margin-bottom: 14px; }
      .hdebt-preset-card {
        background: #fff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 9px 11px;
        cursor: pointer; text-align: right; transition: all 0.15s; font-family: inherit;
      }
      .hdebt-preset-card:hover { border-color: #2563eb; background: #eff6ff; }
      .hdebt-preset-card.is-active { border-color: #1e40af; background: #eff6ff; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
      .hdebt-swap-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
      .hdebt-swap-btn {
        background: #fff; border: 1.5px dashed #2563eb; color: #1e40af; padding: 6px 12px; border-radius: 8px;
        font-size: 11.5px; font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.15s;
      }
      .hdebt-swap-btn:hover { background: #1e40af; color: #fff; border-style: solid; }
      .hdebt-col-list { display: flex; flex-direction: column; gap: 5px; }
      .hdebt-col-item {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 12px;
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
      }
      .hdebt-col-item.is-enabled { border-color: #93c5fd; background: #fcfdff; }
      .hdebt-col-item.is-locked { border-color: #cbd5e1; background: #f1f5f9; }
      .hdebt-order-btn {
        background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; width: 26px; height: 24px;
        border-radius: 5px; cursor: pointer; font-size: 10px; font-weight: 800;
      }
      .hdebt-order-btn:hover:not(:disabled) { background: #1e40af; color: #fff; border-color: #1e40af; }
      .hdebt-order-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .hdebt-preview-ribbon {
        background: #0f2e5a; color: #fff; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;
        font-size: 11px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      }
      .hdebt-preview-chip { background: rgba(255,255,255,0.16); padding: 2px 8px; border-radius: 4px; font-weight: 700; }
      .hdebt-opt-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;
        background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 12px;
      }
      .hdebt-btn-primary { background: #f59e0b; color: #000; font-weight: 800; box-shadow: 0 2px 8px rgba(245,158,11,0.3); }
      .hdebt-btn-primary:hover { background: #d97706; color: #fff; transform: translateY(-1px); }

      /* Filter Bar */
      .hdebt-filterbar {
        background: var(--bg-1, #ffffff); border: 1.5px solid var(--border-soft, #e2e8f0);
        border-radius: 14px; padding: 14px 18px; margin-bottom: 18px;
        display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      }
      .hdebt-fg { display: flex; flex-direction: column; gap: 4px; }
      .hdebt-fg label, .hdebt-search-wrap label { font-size: 11px; font-weight: 800; color: var(--text-2, #64748b); }
      .hdebt-select, .hdebt-input {
        padding: 7px 11px; border: 1.5px solid var(--border-soft, #cbd5e1); border-radius: 8px;
        background: var(--bg-0, #f8fafc); color: var(--text-0, #0f172a); font-size: 12.5px;
        outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
      }
      .hdebt-select:focus, .hdebt-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); background: #fff; }
      
      .hdebt-presets { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; margin-bottom: 1px; }
      .hdebt-preset-btn {
        padding: 6px 10px; border-radius: 6px; background: var(--bg-2, #f1f5f9);
        border: 1px solid var(--border-soft, #cbd5e1); font-size: 11px; font-weight: 700;
        color: var(--text-1, #334155); cursor: pointer; transition: all 0.15s; font-family: inherit;
      }
      .hdebt-preset-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; }

      .hdebt-search-wrap { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 4px; }
      .hdebt-search-wrap input { width: 100%; box-sizing: border-box; }

      /* KPIs Grid */
      .hdebt-kpis-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 22px;
      }
      .hdebt-kpi-card {
        border-radius: 14px; padding: 14px 16px; position: relative; overflow: hidden;
        border: 1.5px solid transparent; transition: transform 0.2s, box-shadow 0.2s;
      }
      .hdebt-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
      .hdebt-kpi-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .hdebt-kpi-icon { font-size: 18px; }
      .hdebt-kpi-label { font-size: 11px; font-weight: 800; opacity: 0.85; }
      .hdebt-kpi-value { font-size: 21px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; margin-bottom: 2px; }
      .hdebt-kpi-sub { font-size: 11px; font-weight: 600; opacity: 0.75; }

      .kpi-red    { background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04)); border-color: rgba(239,68,68,0.25); color: #dc2626; }
      .kpi-blue   { background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); border-color: rgba(37,99,235,0.25); color: #1d4ed8; }
      .kpi-green  { background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04)); border-color: rgba(16,185,129,0.25); color: #059669; }
      .kpi-amber  { background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04)); border-color: rgba(245,158,11,0.25); color: #d97706; }
      .kpi-indigo { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04)); border-color: rgba(99,102,241,0.25); color: #4f46e5; }

      /* Loading State */
      .hdebt-loading {
        background: var(--bg-1, #fff); border-radius: 14px; padding: 50px 20px; text-align: center;
        border: 1px solid var(--border-soft, #e2e8f0); color: var(--text-2, #64748b); font-size: 14px; font-weight: 700;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
      }
      .hdebt-spinner {
        width: 36px; height: 36px; border: 3.5px solid var(--border-soft, #e2e8f0); border-top-color: #2563eb;
        border-radius: 50%; animation: hdebt-spin 0.8s linear infinite;
      }
      @keyframes hdebt-spin { to { transform: rotate(360deg); } }

      /* Tree Accordion Level 1: Rep Card */
      .hdebt-rep-card {
        background: var(--bg-1, #fff); border: 1.5px solid var(--border-soft, #e2e8f0); border-radius: 14px;
        margin-bottom: 14px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .hdebt-rep-card.is-open { border-color: #3b82f6; box-shadow: 0 4px 16px rgba(59,130,246,0.1); }
      
      .hdebt-rep-header {
        padding: 14px 18px; background: var(--bg-0, #f8fafc); cursor: pointer;
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
        user-select: none; border-bottom: 1px solid transparent; transition: background 0.15s;
      }
      .hdebt-rep-card.is-open .hdebt-rep-header { border-bottom-color: var(--border-soft, #e2e8f0); background: #f0f7ff; }
      .hdebt-rep-header:hover { background: #e8f2ff; }

      .hdebt-rep-title-group { display: flex; align-items: center; gap: 12px; }
      .hdebt-rep-avatar {
        width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #1e3a8a, #3b82f6);
        color: #fff; font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(37,99,235,0.25);
      }
      .hdebt-rep-name { font-size: 14.5px; font-weight: 900; color: var(--text-0, #0f172a); }
      .hdebt-rep-meta { font-size: 11px; color: var(--text-2, #64748b); margin-top: 2px; }

      .hdebt-rep-metrics-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
      .hdebt-rep-metric { text-align: left; }
      .hdebt-rep-metric-lbl { font-size: 10px; font-weight: 800; color: var(--text-2, #64748b); text-transform: uppercase; }
      .hdebt-rep-metric-val { font-size: 13.5px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }

      .hdebt-rep-coll-bar {
        width: 90px; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 3px;
      }
      .hdebt-rep-coll-fill { height: 100%; background: #10b981; border-radius: 4px; }

      .hdebt-rep-chevron {
        width: 28px; height: 28px; border-radius: 7px; background: rgba(0,0,0,0.04);
        display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-2, #64748b);
        transition: transform 0.2s;
      }
      .hdebt-rep-card.is-open .hdebt-rep-chevron { transform: rotate(180deg); background: #2563eb; color: #fff; }

      /* Tree Accordion Level 2: Customer List */
      .hdebt-cust-list { padding: 8px 14px 14px 14px; background: #fafcff; }
      
      .hdebt-cust-card {
        background: #fff; border: 1px solid var(--border-soft, #e2e8f0); border-radius: 10px;
        margin-top: 8px; overflow: hidden; transition: all 0.15s;
      }
      .hdebt-cust-card.is-open { border-color: #6366f1; box-shadow: 0 2px 10px rgba(99,102,241,0.08); }

      .hdebt-cust-header {
        padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 10px; user-select: none; transition: background 0.15s;
      }
      .hdebt-cust-card.is-open .hdebt-cust-header { background: #f5f3ff; border-bottom: 1px solid #ede9fe; }
      .hdebt-cust-header:hover { background: #f8fafc; }

      .hdebt-cust-info { display: flex; align-items: center; gap: 10px; }
      .hdebt-cust-code {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800; padding: 2px 6px;
        border-radius: 5px; background: var(--bg-2, #e2e8f0); color: var(--text-1, #334155);
      }
      .hdebt-cust-name { font-size: 13px; font-weight: 800; color: var(--text-0, #0f172a); }
      .hdebt-cust-phone { font-size: 11px; color: var(--text-2, #64748b); font-family: monospace; }

      .hdebt-cust-cols { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      .hdebt-col-cell { text-align: left; min-width: 80px; }
      .hdebt-col-lbl { font-size: 9.5px; font-weight: 700; color: var(--text-2, #64748b); }
      .hdebt-col-val { font-size: 12px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }

      .hdebt-badge {
        font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;
      }
      .hdebt-badge-debtor   { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
      .hdebt-badge-settled  { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
      .hdebt-badge-creditor { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }

      .hdebt-stmt-btn {
        background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px;
        font-size: 11px; font-weight: 700; color: #1e3a8a; cursor: pointer; transition: all 0.15s;
      }
      .hdebt-stmt-btn:hover { background: #1e3a8a; color: #fff; border-color: #1e3a8a; }

      /* Tree Accordion Level 3: Transaction Timeline Table */
      .hdebt-txns-wrap { padding: 12px 14px; background: #ffffff; }
      .hdebt-txns-table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .hdebt-txns-table th {
        background: var(--bg-1, #f8fafc); color: var(--text-2, #475569); padding: 7px 10px;
        font-size: 10.5px; font-weight: 800; text-align: right; border-bottom: 2px solid var(--border-soft, #e2e8f0);
      }
      .hdebt-txns-table td {
        padding: 7px 10px; border-bottom: 1px solid var(--border-soft, #f1f5f9); vertical-align: middle;
      }
      .hdebt-txns-table tr:hover td { background: #f8fafc; }
      
      .hdebt-txns-table tfoot td {
        background: #f8fafc; font-weight: 900; border-top: 2px solid var(--border-soft, #cbd5e1); padding: 9px 10px;
      }

      .tx-badge {
        font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block;
      }
      .tx-inv  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .tx-dn   { background: #fdf4ff; color: #86198f; border: 1px solid #f0abfc; }
      .tx-rcpt { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
      .tx-ret  { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
      .tx-ob   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

      /* Print Optimizations */
      @media print {
        .no-print, .hdebt-header-card, .hdebt-filterbar, .hdebt-header-actions, .hdebt-stmt-btn, .hdebt-rep-chevron { display: none !important; }
        .print-only, .hdebt-print-banner { display: block !important; }
        .hdebt-root { padding: 0 !important; color: #000 !important; }
        .hdebt-rep-card, .hdebt-cust-card { border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; margin-bottom: 8px !important; }
        .hdebt-cust-list, .hdebt-txns-wrap { display: block !important; }
        .hdebt-kpis-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 6px !important; }
        .hdebt-kpi-card { border: 1px solid #ccc !important; padding: 6px 8px !important; }
        .hdebt-kpi-value { font-size: 14px !important; }
      }
    </style>
  `,Xe(),_e(I()),await ie()}async function ie(t=!1){const e=document.getElementById("hdebt-tree-content");e&&(e.innerHTML=`
      <div class="hdebt-loading">
        <div class="hdebt-spinner"></div>
        <div>جارٍ جلب وتدقيق الحركات من فواتير المبيعات وسندات القبض والمرتجعات...</div>
      </div>
    `);try{const[n,o,s,a,l,c,p,d]=await Promise.all([T(R.customers()),T(R.salesReps()),T(R.salesInvoices()),T(R.receipts()),T(Ne(Ie,`companies/${Ae}/collections`)),T(R.salesReturns()),T(R.deliveryNotes()).catch(()=>[]),T(R.products()).catch(()=>[])]);Q=n,Y=o,X=s.filter(b=>b.status!=="cancelled"&&b.status!=="void"),we=a.filter(b=>b.status!=="cancelled"&&b.status!=="void"),ye=l.filter(b=>b.status!=="cancelled"&&b.status!=="void"),ke=c.filter(b=>b.status!=="cancelled"&&b.status!=="void"),Z=(p||[]).filter(b=>b.status!=="cancelled"&&b.status!=="void"&&b.status!=="converted_to_invoice"),be=d||[],F={},be.forEach(b=>{b.id&&(F[b.id]=b),b.name&&(F[b.name]=b)}),Le(),Oe(),Ue(),j()}catch(n){console.error("[HierarchicalDebt] Error loading operational data:",n),e&&(e.innerHTML=`<div class="alert bad" style="margin:20px;">حدث خطأ أثناء تحميل البيانات: ${n.message}</div>`)}}window.loadHierarchicalDebtData=ie;function Le(){const t=document.getElementById("hdebt-rep-filter");if(!t)return;const e=t.value;let n=`<option value="">🌟 جميع المناديب (${Y.length})</option>`;Y.forEach(o=>{n+=`<option value="${o.id}" ${o.id===e?"selected":""}>👤 ${o.name||"مندوب"}</option>`}),n+=`<option value="__unassigned__" ${e==="__unassigned__"?"selected":""}>🏢 مبيعات مباشرة / بدون مندوب</option>`,t.innerHTML=n}function J(t){if(!t)return 0;if(typeof t.totalCost=="number"&&t.totalCost>0)return t.totalCost;const e=t.lines||t.items||[];if(e.length===0)return parseFloat(t.totalCost||0)||0;let n=0;return e.forEach(o=>{const s=parseFloat(o.qty||o.quantity||0);if(!s)return;const a=F[o.productId]||F[o.productName]||F[o.name],l=parseFloat(o.averageCost&&o.averageCost>0?o.averageCost:o.costPrice&&o.costPrice>0?o.costPrice:o.purchasePrice&&o.purchasePrice>0?o.purchasePrice:o.unitCost&&o.unitCost>0?o.unitCost:a?.averageCost||a?.costPrice||a?.lastPurchasePrice||a?.avgCostPrice||a?.purchasePrice||0);n+=s*l}),n}function je(t){const e=(t.zone||t.city||"").trim();if(e&&e.length<=28)return e;const n=(t.zone||t.address||"").trim();if(!n)return"";const o=n.match(/المدينة\s*:\s*([^—\-|\n]+)/),s=n.match(/الحي\s*:\s*([^—\-|\n]+)/);if(s&&o){const a=s[1].replace(/^حي\s+/,"").trim(),l=o[1].trim();return`${a} - ${l}`.slice(0,30)}return o?o[1].trim().slice(0,28):s?s[1].trim().slice(0,28):n.length>26?n.slice(0,24)+"…":n}function Oe(){const t=document.getElementById("hdebt-from")?.value||"",e=document.getElementById("hdebt-to")?.value||"9999-12-31",n=e!=="9999-12-31"?e:te(),o={};Y.forEach(i=>{o[i.id]={id:i.id,name:i.name||"مندوب",code:i.code||"",phone:i.phone||"",zone:i.zone||"",customers:[],totals:{openingBalance:0,sales:0,receipts:0,returns:0,closingBalance:0,debtorCount:0,totalCustomers:0,lastPaymentTotal:0,periodSalesSub:0,periodCogs:0,periodProfit:0,allTimeSalesSub:0,allTimeCogs:0,allTimeProfit:0}}});const s={id:"__unassigned__",name:"مبيعات مباشرة / إدارة (بدون مندوب)",code:"DIRECT",phone:"",zone:"المركز الرئيسي",customers:[],totals:{openingBalance:0,sales:0,receipts:0,returns:0,closingBalance:0,debtorCount:0,totalCustomers:0,lastPaymentTotal:0,periodSalesSub:0,periodCogs:0,periodProfit:0,allTimeSalesSub:0,allTimeCogs:0,allTimeProfit:0}},a={},l=(i=0)=>({openingBal:i,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[],periodSalesSub:0,periodGrossCogs:0,periodRetSub:0,periodRetCogs:0,allTimeSalesSub:0,allTimeGrossCogs:0,allTimeRetSub:0,allTimeRetCogs:0,allPayments:[]});Q.forEach(i=>{a[i.id]=l(parseFloat(i.openingBalance)||0)}),X.forEach(i=>{const r=i.customerId;if(!r)return;a[r]||(a[r]=l(0));const h=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:""),w=parseFloat(i.totalWithVat!==void 0?i.totalWithVat:i.netTotal!==void 0?i.netTotal:i.total||0)||0,_=parseFloat(i.subtotal!==void 0?i.subtotal:w/1.15)||0,C=J(i);h<=e&&(a[r].allTimeSalesSub+=_,a[r].allTimeGrossCogs+=C),t&&h<t?a[r].priorInvoices+=w:h<=e&&(a[r].periodSalesSub+=_,a[r].periodGrossCogs+=C,a[r].periodInvoices.push({type:"invoice",date:h,docNum:i.number||i.invoiceNumber||i.id?.slice(0,8),notes:`فاتورة مبيعات (${(i.lines||[]).length} صنف) — ${i.paymentMethod==="cash"?"نقدي":"آجل"}`,paymentMethod:i.paymentMethod||"credit",debit:w,credit:0}))}),Z.forEach(i=>{const r=i.customerId;if(!r)return;a[r]||(a[r]=l(0));const h=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:""),w=parseFloat(i.totalAmount!==void 0?i.totalAmount:i.grandTotal!==void 0?i.grandTotal:i.total||0)||0;if((i.paymentMethod||"credit").toLowerCase()==="cash")return;const C=parseFloat(i.subtotal!==void 0?i.subtotal:w)||0,P=J(i);h<=e&&(a[r].allTimeSalesSub+=C,a[r].allTimeGrossCogs+=P),t&&h<t?a[r].priorInvoices+=w:h<=e&&(a[r].periodSalesSub+=C,a[r].periodGrossCogs+=P,a[r].periodInvoices.push({type:"delivery_note",date:h,docNum:i.number||i.dnNumber||`DN-${i.id?.slice(0,6)}`,notes:`سند تسليم بضاعة (${(i.lines||[]).length} صنف) — آجل ${i.notes?"— "+i.notes:""}`,paymentMethod:"credit",debit:w,credit:0}))}),we.forEach(i=>{const r=i.targetId||i.customerId;if(!r)return;a[r]||(a[r]=l(0));const h=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:""),w=parseFloat(i.amount||0)||0,_=i.createdAt?.seconds?i.createdAt.seconds:0;w>0&&h<=e&&a[r].allPayments.push({amount:w,date:h,method:i.method||"cash",docNum:i.number||"",ts:_}),t&&h<t?a[r].priorReceipts+=w:h<=e&&a[r].periodReceipts.push({type:"receipt",date:h,docNum:i.number||`RC-${i.id?.slice(0,6).toUpperCase()}`,notes:`سند قبض — طريقة السداد: ${i.method==="cash"?"نقدي":i.method==="transfer"?"تحويل بنكي":i.method||"سداد"} ${i.notes?"— "+i.notes:""}`,paymentMethod:i.method||"cash",debit:0,credit:w})}),ye.forEach(i=>{const r=i.customerId;if(!r)return;a[r]||(a[r]=l(0));const h=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:""),w=parseFloat(i.amount||0)||0,_=i.createdAt?.seconds?i.createdAt.seconds:0;w>0&&h<=e&&a[r].allPayments.push({amount:w,date:h,method:i.method||"cash",docNum:i.number||"",ts:_}),t&&h<t?a[r].priorReceipts+=w:h<=e&&a[r].periodReceipts.push({type:"receipt",date:h,docNum:i.number||`COL-${i.id?.slice(0,5)}`,notes:`تحصيل مبيعات — ${i.method||"نقدي"} ${i.notes?"— "+i.notes:""}`,paymentMethod:i.method||"cash",debit:0,credit:w})}),ke.forEach(i=>{const r=i.customerId;if(!r)return;a[r]||(a[r]=l(0));const h=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:""),w=parseFloat(i.totalWithVat!==void 0?i.totalWithVat:i.total!==void 0?i.total:i.subtotal||0)||0,_=parseFloat(i.subtotal!==void 0?i.subtotal:w/1.15)||0,C=J(i);h<=e&&(a[r].allTimeRetSub+=_,a[r].allTimeRetCogs+=C),t&&h<t?a[r].priorReturns+=w:h<=e&&(a[r].periodRetSub+=_,a[r].periodRetCogs+=C,a[r].periodReturns.push({type:"return",date:h,docNum:i.number||i.creditNoteNumber||`CR-${i.id?.slice(0,6)}`,notes:`إشعار مردود مبيعات ${i.refInvoice?"للفاتورة "+i.refInvoice:""} ${i.reason?"— "+i.reason:""}`,debit:0,credit:w}))});const c=[];Q.forEach(i=>{const r=a[i.id]||l(0),h=r.openingBal+r.priorInvoices-r.priorReceipts-r.priorReturns,w=r.periodInvoices.reduce((S,B)=>S+B.debit,0),_=r.periodReceipts.reduce((S,B)=>S+B.credit,0),C=r.periodReturns.reduce((S,B)=>S+B.credit,0),P=Math.round((h+w-_-C)*100)/100;r.allPayments.sort((S,B)=>{const pe=(B.date||"").localeCompare(S.date||"");return pe!==0?pe:(B.ts||0)-(S.ts||0)});const L=r.allPayments[0]||null,Pe=L?Math.round(L.amount*100)/100:0,W=L&&L.date||"";let ne=null;if(W){const S=new Date(n).getTime()-new Date(W).getTime();isNaN(S)||(ne=Math.max(0,Math.floor(S/864e5)))}const U=Math.round((r.periodSalesSub-r.periodRetSub)*100)/100,se=Math.round((r.periodGrossCogs-r.periodRetCogs)*100)/100,re=Math.round((U-se)*100)/100,ze=U>0?re/U*100:0,K=Math.round((r.allTimeSalesSub-r.allTimeRetSub)*100)/100,le=Math.round((r.allTimeGrossCogs-r.allTimeRetCogs)*100)/100,de=Math.round((K-le)*100)/100,Me=K>0?de/K*100:0,ce=[...r.periodInvoices,...r.periodReceipts,...r.periodReturns];ce.sort((S,B)=>(S.date||"").localeCompare(B.date||""));let V=h;const Be=ce.map(S=>(V=Math.round((V+(S.debit||0)-(S.credit||0))*100)/100,{...S,runningBalance:V})),De={id:i.id,name:i.name||"عميل غير مسمى",code:i.code||"",phone:i.phone||"",zone:i.zone||i.address||"",shortLocation:je(i),repId:i.repId||i.assignedRepId||null,repName:i.repName||"",openingBalance:Math.round(h*100)/100,periodSales:Math.round(w*100)/100,periodReceipts:Math.round(_*100)/100,periodReturns:Math.round(C*100)/100,closingBalance:P,lastPaymentAmount:Pe,lastPaymentDate:W,daysSinceLastPayment:ne,lastPaymentMethod:L?.method||"",periodSalesSub:U,periodCogs:se,periodProfit:re,periodMarginPct:Math.round(ze*10)/10,allTimeSalesSub:K,allTimeCogs:le,allTimeProfit:de,allTimeMarginPct:Math.round(Me*10)/10,transactions:Be,status:P>.01?"debtor":P<-.01?"creditor":"settled",hasActivity:Math.abs(h)>.001||w>0||_>0||C>0};c.push(De)}),c.forEach(i=>{let r=o[i.repId];if(!r&&i.repName&&(r=Object.values(o).find(w=>(w.name||"").trim().toLowerCase()===(i.repName||"").trim().toLowerCase())),!r){const w=X.find(P=>P.customerId===i.id&&(P.repId||P.salesRepId)),_=Z.find(P=>P.customerId===i.id&&(P.repId||P.salesRepId)),C=w?.repId||w?.salesRepId||_?.repId||_?.salesRepId;C&&o[C]&&(r=o[C])}const h=r||s;h.customers.push(i),h.totals.openingBalance+=i.openingBalance,h.totals.sales+=i.periodSales,h.totals.receipts+=i.periodReceipts,h.totals.returns+=i.periodReturns,h.totals.closingBalance+=i.closingBalance,h.totals.lastPaymentTotal+=i.lastPaymentAmount,h.totals.periodSalesSub+=i.periodSalesSub,h.totals.periodCogs+=i.periodCogs,h.totals.periodProfit+=i.periodProfit,h.totals.allTimeSalesSub+=i.allTimeSalesSub,h.totals.allTimeCogs+=i.allTimeCogs,h.totals.allTimeProfit+=i.allTimeProfit,h.totals.totalCustomers++,i.closingBalance>.01&&h.totals.debtorCount++});const p=Object.values(o);s.customers.length>0&&p.push(s),p.forEach(i=>{i.customers.sort((r,h)=>h.closingBalance-r.closingBalance)}),p.sort((i,r)=>r.totals.closingBalance-i.totals.closingBalance),oe=p;let d=0,b=0,g=0,f=0,x=0,v=0,m=0;c.forEach(i=>{i.closingBalance>.01?(d+=i.closingBalance,m++):i.closingBalance<-.01&&(b+=Math.abs(i.closingBalance)),g+=i.closingBalance,f+=i.periodSales,x+=i.periodReceipts,v+=i.periodReturns});const $=Math.max(0,f+c.reduce((i,r)=>i+Math.max(0,r.openingBalance),0)),z=$>0?x/$*100:0;D={totalDebt:Math.round(d*100)/100,totalCreditBal:Math.round(b*100)/100,netReceivables:Math.round(g*100)/100,periodSales:Math.round(f*100)/100,periodReceipts:Math.round(x*100)/100,periodReturns:Math.round(v*100)/100,debtorCount:m,totalCustomers:c.length,collectionRate:Math.min(100,Math.round(z*10)/10)}}function Ue(){document.getElementById("kpi-total-debt").textContent=y(D.totalDebt),document.getElementById("kpi-debtors-count").textContent=`${D.debtorCount} عميل مدين (من أصل ${D.totalCustomers})`,document.getElementById("kpi-period-sales").textContent=y(D.periodSales),document.getElementById("kpi-period-receipts").textContent=y(D.periodReceipts),document.getElementById("kpi-period-returns").textContent=y(D.periodReturns),document.getElementById("kpi-collection-rate").textContent=`${D.collectionRate.toFixed(1)}%`,document.getElementById("kpi-net-receivables").textContent=`صافي الذمم: ${y(D.netReceivables)}`;const t=document.getElementById("hdebt-from")?.value||"البداية",e=document.getElementById("hdebt-to")?.value||"الآن",n=document.getElementById("hdebt-print-period-label");n&&(n.textContent=`الفترة من: ${t}  إلى: ${e} | إجمالي المديونيات القائمة: ${y(D.totalDebt)}`)}function ee(t=!1,e=null){const n=document.getElementById("hdebt-rep-filter")?.value||"",o=document.getElementById("hdebt-status-filter")?.value||"all",s=(document.getElementById("hdebt-search")?.value||"").trim().toLowerCase(),a=t?e||I():null;let l=0,c=0,p=(oe||[]).map(d=>{let b=d.customers||[];return o==="debtors"?b=b.filter(g=>g.closingBalance>.01):o==="settled"?b=b.filter(g=>Math.abs(g.closingBalance)<=.01&&g.hasActivity):o==="creditors"&&(b=b.filter(g=>g.closingBalance<-.01)),s&&(b=b.filter(g=>(g.name||"").toLowerCase().includes(s)||(g.code||"").toLowerCase().includes(s)||(g.phone||"").includes(s)||(d.name||"").toLowerCase().includes(s))),t&&a&&a.hideNegligible&&(b=b.filter(g=>Math.abs(g.closingBalance)<1&&g.periodSales===0&&g.periodReceipts===0&&g.periodReturns===0?(l++,c+=g.closingBalance,!1):!0)),{...d,visibleCustomers:b}});return n&&(p=p.filter(d=>d.id===n)),p=p.filter(d=>d.visibleCustomers.length>0),p._hiddenNegligibleCount=l,p._hiddenNegligibleSum=Math.round(c*100)/100,p}function j(){const t=document.getElementById("hdebt-tree-content");if(!t)return;const e=ee(!1);if(e.length===0){t.innerHTML=`
      <div style="background:var(--bg-1,#fff); border-radius:14px; padding:40px 20px; text-align:center; border:1px solid var(--border-soft,#e2e8f0); color:var(--text-2,#64748b);">
        <div style="font-size:32px; margin-bottom:8px;">🔍</div>
        <div style="font-weight:800; font-size:15px; color:var(--text-0,#0f172a);">لا توجد مديونيات أو حركات مطابقة للفلاتر المحددة</div>
        <div style="font-size:12px; margin-top:4px;">جرّب تغيير حالة المديونية أو توسيع نطاق الفترة الزمنية</div>
      </div>
    `;return}let n="";e.forEach(o=>{const s=E.has(o.id),a=Math.max(0,o.totals.sales+Math.max(0,o.totals.openingBalance)),l=a>0?Math.min(100,Math.round(o.totals.receipts/a*100)):0;n+=`
      <div class="hdebt-rep-card ${s?"is-open":""}" id="rep-card-${o.id}">
        <div class="hdebt-rep-header" onclick="window.toggleHierarchicalRep('${o.id}')">
          <div class="hdebt-rep-title-group">
            <div class="hdebt-rep-avatar">
              ${o.id==="__unassigned__"?"🏢":o.name?o.name.charAt(0):"👤"}
            </div>
            <div>
              <div class="hdebt-rep-name">${o.name} ${o.code?`<span style="font-size:11px; font-weight:normal; opacity:0.75;">(${o.code})</span>`:""}</div>
              <div class="hdebt-rep-meta">
                <span>👥 ${o.visibleCustomers.length} عميل</span>
                <span style="margin: 0 4px;">•</span>
                <span style="color:#dc2626; font-weight:700;">🔴 ${o.totals.debtorCount} مدين</span>
                ${o.phone?`<span style="margin: 0 4px;">•</span> <span>📞 ${o.phone}</span>`:""}
              </div>
            </div>
          </div>

          <div class="hdebt-rep-metrics-row">
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">رصيد أول المدة</div>
              <div class="hdebt-rep-metric-val" style="color:#475569;">${y(o.totals.openingBalance)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مبيعات (+)</div>
              <div class="hdebt-rep-metric-val" style="color:#1d4ed8;">${y(o.totals.sales)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">سدادات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#059669;">${y(o.totals.receipts)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مردودات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#d97706;">${y(o.totals.returns)}</div>
            </div>
            <div class="hdebt-rep-metric" style="background:rgba(239,68,68,0.06); padding:4px 10px; border-radius:8px; border:1px solid rgba(239,68,68,0.15);">
              <div class="hdebt-rep-metric-lbl" style="color:#dc2626;">صافي المديونية</div>
              <div class="hdebt-rep-metric-val" style="color:#dc2626; font-size:14.5px;">${y(o.totals.closingBalance)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div title="نسبة التحصيل: ${l}%">
                <div style="font-size:10px; font-weight:800; color:#10b981; text-align:left;">${l}%</div>
                <div class="hdebt-rep-coll-bar"><div class="hdebt-rep-coll-fill" style="width:${l}%;"></div></div>
              </div>
              <div class="hdebt-rep-chevron">▼</div>
            </div>
          </div>
        </div>

        <div class="hdebt-cust-list" style="display:${s?"block":"none"};" id="rep-custs-${o.id}">
          ${o.visibleCustomers.map(c=>Ke(c)).join("")}
        </div>
      </div>
    `}),t.innerHTML=n}function Ke(t,e){const n=H.has(t.id),o=t.status==="debtor"?"hdebt-badge-debtor":t.status==="creditor"?"hdebt-badge-creditor":"hdebt-badge-settled",s=t.status==="debtor"?"🔴 مدين":t.status==="creditor"?"🔵 دائن":"🟢 مسدد";return`
    <div class="hdebt-cust-card ${n?"is-open":""}" id="cust-card-${t.id}">
      <div class="hdebt-cust-header" onclick="window.toggleHierarchicalCust('${t.id}')">
        <div class="hdebt-cust-info">
          <span class="hdebt-cust-code">${t.code||"CUST"}</span>
          <div>
            <div class="hdebt-cust-name">${t.name}</div>
            <div class="hdebt-cust-phone" style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:2px;">
              ${t.phone?`<span>📞 ${t.phone}</span>`:""}
              ${t.shortLocation?`<span title="${(t.zone||"").replace(/"/g,"&quot;")}">• 📍 ${t.shortLocation}</span>`:""}
              ${t.lastPaymentAmount>0?`<span style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:0px 5px; border-radius:4px; font-size:10px; font-weight:700;">💳 آخر سداد: ${y(t.lastPaymentAmount)} (${t.lastPaymentDate})</span>`:""}
              ${Math.abs(t.periodSalesSub)>.01?`<span style="background:${t.periodProfit>=0?"#eff6ff":"#fef2f2"}; color:${t.periodProfit>=0?"#1d4ed8":"#dc2626"}; border:1px solid #bfdbfe; padding:0px 5px; border-radius:4px; font-size:10px; font-weight:700;">📈 هامش الفترة: ${t.periodMarginPct.toFixed(1)}%</span>`:""}
            </div>
          </div>
        </div>

        <div class="hdebt-cust-cols">
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">رصيد أول المدة</div>
            <div class="hdebt-col-val" style="color:#64748b;">${y(t.openingBalance)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مبيعات (+)</div>
            <div class="hdebt-col-val" style="color:#1d4ed8;">${y(t.periodSales)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">سدادات (-)</div>
            <div class="hdebt-col-val" style="color:#059669;">${y(t.periodReceipts)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مردودات (-)</div>
            <div class="hdebt-col-val" style="color:#d97706;">${y(t.periodReturns)}</div>
          </div>
          <div class="hdebt-col-cell" style="min-width:100px;">
            <div class="hdebt-col-lbl" style="color:${t.closingBalance>0?"#dc2626":"#059669"}; font-weight:800;">الرصيد النهائي</div>
            <div class="hdebt-col-val" style="font-size:13.5px; color:${t.closingBalance>0?"#dc2626":t.closingBalance<0?"#1d4ed8":"#059669"};">
              ${y(t.closingBalance)}
            </div>
          </div>
          <div class="hdebt-badge ${o}">${s}</div>
          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation()">
            <button class="hdebt-stmt-btn" title="فتح كشف حساب رسمي للعميل" onclick="window.openCustomerUnifiedStatement('${t.id}')">
              📄 كشف حساب
            </button>
            <div class="hdebt-rep-chevron" style="width:24px; height:24px; font-size:9px; cursor:pointer;" onclick="window.toggleHierarchicalCust('${t.id}')">▼</div>
          </div>
        </div>
      </div>

      <div class="hdebt-txns-wrap" style="display:${n?"block":"none"};" id="cust-txns-${t.id}">
        ${Ye(t)}
      </div>
    </div>
  `}function Ye(t){return!t.transactions||t.transactions.length===0?`
      <div style="padding:14px; text-align:center; color:var(--text-2,#64748b); font-size:12px; background:#f8fafc; border-radius:8px;">
        ℹ️ لا توجد حركات بيع أو تحصيل أو مرتجع مسجلة لهذا العميل خلال الفترة المحددة. (رصيد أول المدة: ${y(t.openingBalance)})
      </div>
    `:`
    <table class="hdebt-txns-table">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>نوع المستند</th>
          <th>رقم المستند / المرجع</th>
          <th>البيان والتفاصيل</th>
          <th style="color:#1d4ed8; text-align:left;">مدين (+)</th>
          <th style="color:#059669; text-align:left;">دائن (-)</th>
          <th style="color:#dc2626; text-align:left;">الرصيد المترتب</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f8fafc; font-weight:700;">
          <td style="color:#64748b;">—</td>
          <td><span class="tx-badge tx-ob">رصيد سابق</span></td>
          <td style="font-family:monospace; color:#64748b;">OPENING</td>
          <td style="color:#64748b;">رصيد أول المدة ما قبل تاريخ بداية التقرير</td>
          <td style="text-align:left; font-family:monospace;">${t.openingBalance>0?y(t.openingBalance):"—"}</td>
          <td style="text-align:left; font-family:monospace;">${t.openingBalance<0?y(Math.abs(t.openingBalance)):"—"}</td>
          <td style="text-align:left; font-family:monospace; font-weight:900;">${y(t.openingBalance)}</td>
        </tr>
        ${t.transactions.map(e=>{const n=e.type==="invoice"?"tx-inv":e.type==="receipt"?"tx-rcpt":e.type==="delivery_note"?"tx-dn":"tx-ret",o=e.type==="invoice"?"فاتورة مبيعات":e.type==="receipt"?"سند قبض":e.type==="delivery_note"?"سند تسليم (DN)":"مرتجع مبيعات";return`
            <tr>
              <td style="font-family:monospace; color:#475569; white-space:nowrap;">${e.date||"—"}</td>
              <td><span class="tx-badge ${n}">${o}</span></td>
              <td style="font-family:monospace; font-weight:800; color:#1e40af;">${e.docNum||"—"}</td>
              <td style="color:#334155;">${e.notes||"—"}</td>
              <td style="text-align:left; font-family:monospace; font-weight:${e.debit?"800":"normal"}; color:${e.debit?"#1d4ed8":"#94a3b8"};">
                ${e.debit?y(e.debit):"—"}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:${e.credit?"800":"normal"}; color:${e.credit?"#059669":"#94a3b8"};">
                ${e.credit?y(e.credit):"—"}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:900; color:${e.runningBalance>0?"#dc2626":e.runningBalance<0?"#1d4ed8":"#059669"};">
                ${y(e.runningBalance)}
              </td>
            </tr>
          `}).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">إجمالي حركات الفترة وصافي المديونية الختامية للعميل</td>
          <td style="text-align:left; color:#1d4ed8;">${y(t.periodSales)}</td>
          <td style="text-align:left; color:#059669;">${y(t.periodReceipts+t.periodReturns)}</td>
          <td style="text-align:left; color:${t.closingBalance>0?"#dc2626":"#059669"};">${y(t.closingBalance)}</td>
        </tr>
      </tfoot>
    </table>
  `}function u(t){return t==null||isNaN(t)?"0.00":Number(t).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function ae(t){let e=0,n=0,o=0,s=0,a=0,l=0,c=0,p=0,d=0,b=0,g=0,f=0,x=0,v=0;t.forEach(r=>{e+=r.openingBalance||0,n+=r.periodSales||0,o+=r.periodReceipts||0,s+=r.periodReturns||0,a+=r.closingBalance||0,r.closingBalance>.01&&l++,r.lastPaymentAmount>0&&(c+=r.lastPaymentAmount,p++),d+=r.periodSalesSub||0,b+=r.periodCogs||0,g+=r.periodProfit||0,f+=r.allTimeSalesSub||0,x+=r.allTimeCogs||0,v+=r.allTimeProfit||0});const m=Math.max(0,n+Math.max(0,e)),$=m>0?Math.min(100,Math.round(o/m*100)):a<=.01?100:0,z=d>0?g/d*100:0,i=f>0?v/f*100:0;return{openingBalance:Math.round(e*100)/100,sales:Math.round(n*100)/100,receipts:Math.round(o*100)/100,returns:Math.round(s*100)/100,closingBalance:Math.round(a*100)/100,debtorCount:l,totalCustomers:t.length,collectionRate:$,lastPaymentTotal:Math.round(c*100)/100,paidCustomersCount:p,periodSalesSub:Math.round(d*100)/100,periodProfit:Math.round(g*100)/100,periodMarginPct:Math.round(z*10)/10,allTimeSalesSub:Math.round(f*100)/100,allTimeProfit:Math.round(v*100)/100,allTimeMarginPct:Math.round(i*10)/10}}function ge(t){let e=0,n=0,o=0,s=0,a=0,l=0,c=0,p=0,d=0,b=0,g=0,f=0,x=0,v=0,m=0;t.forEach(i=>{i.visibleCustomers.forEach(r=>{d++,c+=r.openingBalance||0,s+=r.periodSales||0,a+=r.periodReceipts||0,l+=r.periodReturns||0,o+=r.closingBalance||0,r.closingBalance>.01?(e+=r.closingBalance,p++):r.closingBalance<-.01&&(n+=Math.abs(r.closingBalance)),r.lastPaymentAmount>0&&(b+=r.lastPaymentAmount,g++),f+=r.periodSalesSub||0,x+=r.periodProfit||0,v+=r.allTimeSalesSub||0,m+=r.allTimeProfit||0})});const $=Math.max(0,s+t.reduce((i,r)=>i+r.visibleCustomers.reduce((h,w)=>h+Math.max(0,w.openingBalance),0),0)),z=$>0?a/$*100:0;return{openingBalance:Math.round(c*100)/100,sales:Math.round(s*100)/100,receipts:Math.round(a*100)/100,returns:Math.round(l*100)/100,totalDebt:Math.round(e*100)/100,totalCredit:Math.round(n*100)/100,netReceivables:Math.round(o*100)/100,closingBalance:Math.round(o*100)/100,debtorCount:p,totalCustomers:d,collectionRate:Math.min(100,Math.round(z*10)/10),lastPaymentTotal:Math.round(b*100)/100,paidCustomersCount:g,periodSalesSub:Math.round(f*100)/100,periodProfit:Math.round(x*100)/100,periodMarginPct:f>0?Math.round(x/f*1e3)/10:0,allTimeSalesSub:Math.round(v*100)/100,allTimeProfit:Math.round(m*100)/100,allTimeMarginPct:v>0?Math.round(m/v*1e3)/10:0}}async function Ge(){try{const t=await fetch("/icons/company-stamp.png?t="+Date.now());if(!t.ok)return"/icons/company-stamp.png";const e=await t.blob();return await new Promise(n=>{const o=new FileReader;o.onload=()=>n(o.result),o.onerror=()=>n("/icons/company-stamp.png"),o.readAsDataURL(e)})}catch{return"/icons/company-stamp.png"}}function Se(t){const e=(t.columns||[]).filter(s=>s.enabled||s.locked),n=[{id:"_idx",label:"#",short:"#",weight:3.2},...e],o=n.reduce((s,a)=>s+(a.weight||10),0)||100;return n.map(s=>({...s,pctWidth:((s.weight||10)/o*100).toFixed(2)+"%"}))}function We(t){switch(t){case"_idx":case"col_code":case"col_last_payment":case"col_coll_rate":case"col_status":case"col_notes":return"center";case"_name":case"col_contact":return"right";default:return"left"}}function Ve(t,e){const n=e.profitScope==="allTime",o='<span class="th-unit">(ر.س)</span>';switch(t.id){case"_idx":return"#";case"_name":return"اسم العميل";case"col_code":return"كود العميل";case"col_last_payment":return`آخر تحصيل ${o}`;case"col_contact":return"معلومات العميل";case"col_profit":return`هامش الربح ${n?'<span class="th-unit">(تراكمي)</span>':o}`;case"col_opening":return`رصيد سابق ${o}`;case"col_sales":return`مبيعات (+) ${o}`;case"col_receipts":return`سدادات (-) ${o}`;case"col_returns":return`مرتجعات (-) ${o}`;case"col_closing":return`صافي المديونية ${o}`;case"col_coll_rate":return"التحصيل";case"col_status":return"الحالة";case"col_notes":return"ملاحظات / توقيع";default:return t.short}}function qe(t,e,n,o){const s=o.profitScope==="allTime";switch(t.id){case"_idx":return`<td style="text-align:center; color:#64748b;" class="mono">${n+1}</td>`;case"_name":return`<td style="font-weight:700; color:#0f172a; line-height:1.25;">${e.name}</td>`;case"col_code":return`<td style="text-align:center; font-weight:700; font-size:7.8px; word-break:break-word; color:#334155;" class="mono">${e.code||"—"}</td>`;case"col_last_payment":if(e.lastPaymentAmount>0){const a=e.daysSinceLastPayment>30?"#dc2626":e.daysSinceLastPayment>15?"#d97706":"#64748b";return`
          <td style="text-align:center; line-height:1.2;">
            <div class="mono" style="font-weight:800; color:#059669; white-space:nowrap;">${u(e.lastPaymentAmount)}</div>
            <div class="mono" style="font-size:7px; color:${a}; white-space:nowrap;">${e.lastPaymentDate||""}${e.daysSinceLastPayment!==null?` • ${e.daysSinceLastPayment}ي`:""}</div>
          </td>
        `}return'<td style="text-align:center; color:#94a3b8; font-size:7.8px;">لم يسدد</td>';case"col_contact":return`
        <td style="color:#475569; font-size:7.8px; line-height:1.25; overflow-wrap:anywhere;">
          ${e.phone?`<div class="mono" style="white-space:nowrap;">📞 ${e.phone}</div>`:""}
          ${e.shortLocation?`<div>📍 ${e.shortLocation}</div>`:""}
          ${!e.phone&&!e.shortLocation?"—":""}
        </td>
      `;case"col_profit":{const a=s?e.allTimeProfit:e.periodProfit,l=s?e.allTimeSalesSub:e.periodSalesSub,c=s?e.allTimeMarginPct:e.periodMarginPct;if(Math.abs(l)>.01||Math.abs(a)>.01){const p=a>=0?"#059669":"#dc2626",d=c>=15?"#047857":c>=5?"#0369a1":"#b45309";return`
          <td style="text-align:left; line-height:1.2;">
            <div class="mono" style="font-weight:800; color:${p}; white-space:nowrap;">${a>=0?"+":""}${u(a)}</div>
            <div class="mono" style="font-size:7.2px; font-weight:800; color:${d}; white-space:nowrap;">هامش ${c.toFixed(1)}%</div>
          </td>
        `}return'<td style="text-align:left; color:#94a3b8;" class="mono">—</td>'}case"col_opening":return`<td style="text-align:left; white-space:nowrap; color:#334155;" class="mono">${u(e.openingBalance)}</td>`;case"col_sales":return`<td style="text-align:left; white-space:nowrap; color:#1d4ed8;" class="mono">${e.periodSales?u(e.periodSales):"—"}</td>`;case"col_receipts":return`<td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${e.periodReceipts?u(e.periodReceipts):"—"}</td>`;case"col_returns":return`<td style="text-align:left; white-space:nowrap; color:#d97706;" class="mono">${e.periodReturns?u(e.periodReturns):"—"}</td>`;case"col_closing":return`
        <td style="text-align:left; white-space:nowrap; font-weight:900; color:${e.closingBalance>0?"#dc2626":e.closingBalance<0?"#1d4ed8":"#059669"}; background:${e.closingBalance>0?"rgba(254,226,226,0.35)":"transparent"};" class="mono">
          ${u(e.closingBalance)}
        </td>
      `;case"col_coll_rate":{const a=Math.max(0,(e.periodSales||0)+Math.max(0,e.openingBalance||0));return`<td style="text-align:center; white-space:nowrap;" class="mono">${a>0?Math.min(100,Math.round((e.periodReceipts||0)/a*100)):e.closingBalance<=.01?100:0}%</td>`}case"col_status":{const a=e.status==="debtor"?"badge-red":e.status==="creditor"?"badge-blue":"badge-green",l=e.status==="debtor"?"مدين":e.status==="creditor"?"دائن":"مسدد";return`<td style="text-align:center;"><span class="badge ${a}">${l}</span></td>`}case"col_notes":return'<td style="border-bottom:1px dashed #cbd5e1;"></td>';default:return"<td></td>"}}function he(t,e,n,o,s=!1){const a=o.profitScope==="allTime";switch(t.id){case"_idx":return'<td style="text-align:center; font-weight:900;">Σ</td>';case"_name":return`<td style="text-align:right; font-weight:900; line-height:1.25;">${n}</td>`;case"col_code":case"col_contact":case"col_notes":return'<td style="text-align:center; opacity:0.65;">—</td>';case"col_last_payment":return`
        <td style="text-align:center; line-height:1.2;">
          <div class="mono" style="font-weight:900; color:${s?"#6ee7b7":"#059669"}; white-space:nowrap;">${u(e.lastPaymentTotal)}</div>
          <div style="font-size:6.8px; opacity:0.85;">${e.paidCustomersCount} مسدد</div>
        </td>
      `;case"col_profit":{const l=a?e.allTimeProfit:e.periodProfit,c=a?e.allTimeMarginPct:e.periodMarginPct;return`
        <td style="text-align:left; line-height:1.2;">
          <div class="mono" style="font-weight:900; color:${s?l>=0?"#6ee7b7":"#fca5a5":l>=0?"#059669":"#dc2626"}; white-space:nowrap;">${l>=0?"+":""}${u(l)}</div>
          <div class="mono" style="font-size:7px; opacity:0.9;">${c.toFixed(1)}%</div>
        </td>
      `}case"col_opening":return`<td style="text-align:left; white-space:nowrap;" class="mono">${u(e.openingBalance)}</td>`;case"col_sales":return`<td style="text-align:left; white-space:nowrap; color:${s?"#93c5fd":"#1d4ed8"};" class="mono">${u(e.sales)}</td>`;case"col_receipts":return`<td style="text-align:left; white-space:nowrap; color:${s?"#6ee7b7":"#059669"};" class="mono">${u(e.receipts)}</td>`;case"col_returns":return`<td style="text-align:left; white-space:nowrap; color:${s?"#fde68a":"#d97706"};" class="mono">${u(e.returns)}</td>`;case"col_closing":return`<td style="text-align:left; white-space:nowrap; font-weight:900; color:${s?"#fca5a5":e.closingBalance>0?"#dc2626":"#059669"};" class="mono">${u(s?e.totalDebt:e.closingBalance)}</td>`;case"col_coll_rate":return`<td style="text-align:center; white-space:nowrap;" class="mono">${e.collectionRate}%</td>`;case"col_status":return`<td style="text-align:center; white-space:nowrap;">${e.debtorCount} مدين</td>`;default:return"<td></td>"}}function Ce(t,e,n){if(!n.showRepMatrix||t.length<=1)return"";const o=n.profitScope==="allTime";let s=t.map((c,p)=>{const d=ae(c.visibleCustomers),b=o?d.allTimeProfit:d.periodProfit,g=o?d.allTimeMarginPct:d.periodMarginPct;return`
      <tr>
        <td style="text-align:center; color:#64748b;" class="mono">${p+1}</td>
        <td style="font-weight:800; color:#0f2e5a;">${c.name}</td>
        <td style="text-align:center;" class="mono">${d.totalCustomers} <span style="color:#dc2626;">(${d.debtorCount})</span></td>
        <td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${u(d.lastPaymentTotal)}</td>
        <td style="text-align:left; white-space:nowrap; color:${b>=0?"#059669":"#dc2626"};" class="mono">${b>=0?"+":""}${u(b)} <span style="font-size:7px;">(${g.toFixed(1)}%)</span></td>
        <td style="text-align:left; white-space:nowrap;" class="mono">${u(d.openingBalance)}</td>
        <td style="text-align:left; white-space:nowrap; color:#1d4ed8;" class="mono">${u(d.sales)}</td>
        <td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${u(d.receipts)}</td>
        <td style="text-align:left; white-space:nowrap; color:#d97706;" class="mono">${u(d.returns)}</td>
        <td style="text-align:left; white-space:nowrap; font-weight:900; color:#dc2626;" class="mono">${u(d.closingBalance)}</td>
        <td style="text-align:center; font-weight:800;" class="mono">${d.collectionRate}%</td>
      </tr>
    `}).join("");const a=o?e.allTimeProfit:e.periodProfit,l=o?e.allTimeMarginPct:e.periodMarginPct;return`
    <div class="rep-matrix-box avoid-break">
      <div class="rep-matrix-title">📊 الملخص التنفيذي المقارن للمناديب (${t.length} مناديب)</div>
      <table class="summary-table" style="margin-bottom:2px; table-layout:auto;">
        <thead>
          <tr>
            <th style="width:22px; text-align:center;">#</th>
            <th style="text-align:right;">اسم المندوب</th>
            <th style="text-align:center;">العملاء</th>
            <th style="text-align:left;">آخر دفعات</th>
            <th style="text-align:left;">هامش الربح</th>
            <th style="text-align:left;">رصيد سابق</th>
            <th style="text-align:left;">مبيعات (+)</th>
            <th style="text-align:left;">سدادات (-)</th>
            <th style="text-align:left;">مرتجع (-)</th>
            <th style="text-align:left;">المديونية</th>
            <th style="text-align:center;">التحصيل</th>
          </tr>
        </thead>
        <tbody>${s}</tbody>
        <tfoot>
          <tr class="subtotal-row">
            <td colspan="2" style="text-align:right;">الإجمالي العام</td>
            <td style="text-align:center;" class="mono">${e.totalCustomers} (${e.debtorCount})</td>
            <td style="text-align:left; color:#059669;" class="mono">${u(e.lastPaymentTotal)}</td>
            <td style="text-align:left; color:${a>=0?"#059669":"#dc2626"};" class="mono">${a>=0?"+":""}${u(a)} (${l.toFixed(1)}%)</td>
            <td style="text-align:left;" class="mono">${u(e.openingBalance)}</td>
            <td style="text-align:left; color:#1d4ed8;" class="mono">${u(e.sales)}</td>
            <td style="text-align:left; color:#059669;" class="mono">${u(e.receipts)}</td>
            <td style="text-align:left; color:#d97706;" class="mono">${u(e.returns)}</td>
            <td style="text-align:left; color:#dc2626; font-weight:900;" class="mono">${u(e.closingBalance)}</td>
            <td style="text-align:center;" class="mono">${e.collectionRate}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `}function Je(t,e,n){const o=Se(n),s=`<colgroup>${o.map(c=>`<col style="width:${c.pctWidth};">`).join("")}</colgroup>`,a=`<thead><tr>${o.map(c=>`<th style="text-align:${We(c.id)};">${Ve(c,n)}</th>`).join("")}</tr></thead>`;let l=Ce(t,e,n);return t.forEach(c=>{const p=ae(c.visibleCustomers);l+=`
      <div class="rep-banner">
        <div class="rep-title">
          <span>${c.id==="__unassigned__"?"🏢":"👤"}</span>
          <span>المندوب: <b>${c.name}</b> ${c.code?"("+c.code+")":""}</span>
          ${c.phone?`<span style="font-size:9px; opacity:0.85; margin-right:6px;">📞 ${c.phone}</span>`:""}
          ${c.zone?`<span style="font-size:9px; opacity:0.85; margin-right:6px;">📍 ${c.zone}</span>`:""}
        </div>
        <div class="rep-meta">
          <span class="rep-meta-chip">👥 ${p.totalCustomers} عميل</span>
          <span class="rep-meta-chip" style="background:rgba(239,68,68,0.28); color:#fecaca;">🔴 ${p.debtorCount} مدين</span>
          <span class="rep-meta-chip">🎯 تحصيل: ${p.collectionRate}%</span>
        </div>
      </div>

      <table class="summary-table fixed-table">
        ${s}
        ${a}
        <tbody>
          ${c.visibleCustomers.map((d,b)=>`<tr>${o.map(g=>qe(g,d,b,n)).join("")}</tr>`).join("")}
        </tbody>
        <tfoot>
          <tr class="subtotal-row">
            ${o.map(d=>he(d,p,`مجموع: ${c.name} (${p.totalCustomers})`,n,!1)).join("")}
          </tr>
        </tfoot>
      </table>
    `}),l+=`
    <table class="summary-table fixed-table" style="margin-top:10px;">
      ${s}
      <tbody>
        <tr class="grandtotal-row">
          ${o.map(c=>he(c,e,`الإجمالي العام (${e.totalCustomers} عميل)`,n,!0)).join("")}
        </tr>
      </tbody>
    </table>
  `,l}function Qe(t,e,n){const o=n.profitScope==="allTime",s=(n.columns||[]).some(c=>c.id==="col_last_payment"&&c.enabled),a=(n.columns||[]).some(c=>c.id==="col_profit"&&c.enabled);let l=Ce(t,e,n);return t.forEach(c=>{const p=ae(c.visibleCustomers);l+=`
      <div class="rep-banner avoid-break">
        <div class="rep-title">
          <span>${c.id==="__unassigned__"?"🏢":"👤"}</span>
          <span>المندوب: <b>${c.name}</b> ${c.code?"("+c.code+")":""}</span>
          ${c.phone?`<span style="font-size:9px; opacity:0.85; margin-right:6px;">📞 ${c.phone}</span>`:""}
          ${c.zone?`<span style="font-size:9px; opacity:0.85; margin-right:6px;">📍 ${c.zone}</span>`:""}
        </div>
        <div class="rep-meta">
          <span class="rep-meta-chip">👥 ${p.totalCustomers} عميل</span>
          <span class="rep-meta-chip" style="background:rgba(239,68,68,0.28); color:#fecaca;">🔴 ${p.debtorCount} مدين</span>
          <span class="rep-meta-chip">💰 صافي المديونية: ${u(p.closingBalance)} ر.س</span>
        </div>
      </div>
    `,c.visibleCustomers.forEach(d=>{const b=d.status==="debtor"?"badge-red":d.status==="creditor"?"badge-blue":"badge-green",g=d.status==="debtor"?"مدين":d.status==="creditor"?"دائن":"مسدد",f=d.transactions&&d.transactions.length>0,x=o?d.allTimeProfit:d.periodProfit,v=o?d.allTimeMarginPct:d.periodMarginPct;l+=`
        <div class="cust-card avoid-break">
          <div class="cust-card-header">
            <div class="cust-header-info">
              ${s?d.lastPaymentAmount>0?`<span class="cust-code-pill mono" style="background:#059669;">💳 آخر سداد: ${u(d.lastPaymentAmount)} (${d.lastPaymentDate})</span>`:'<span class="cust-code-pill" style="background:#64748b;">لم يسدد</span>':`<span class="cust-code-pill mono">${d.code||"CUST"}</span>`}
              <span class="cust-title-text">${d.name}</span>
              <span class="cust-phone-zone">
                ${d.phone?`<span>📞 ${d.phone}</span>`:""}
                ${d.shortLocation?`<span style="margin-right:4px;">📍 ${d.shortLocation}</span>`:""}
              </span>
              ${a&&Math.abs(x)>.01?`<span class="badge badge-blue">📈 ربح: ${u(x)} (${v.toFixed(1)}%)</span>`:""}
              <span class="badge ${b}">${g}</span>
            </div>
            <div class="cust-card-kpis">
              <div class="cust-card-kpi-item"><span class="lbl">أول المدة:</span> <span class="val mono">${u(d.openingBalance)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">مبيعات:</span> <span class="val mono" style="color:#1d4ed8;">${u(d.periodSales)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">سدادات:</span> <span class="val mono" style="color:#059669;">${u(d.periodReceipts)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">مرتجع:</span> <span class="val mono" style="color:#d97706;">${u(d.periodReturns)}</span></div>
              <div class="cust-card-kpi-item" style="background:#fee2e2; padding:1px 6px; border-radius:4px;">
                <span class="lbl" style="color:#991b1b;">الرصيد:</span> 
                <span class="val mono" style="color:${d.closingBalance>0?"#dc2626":d.closingBalance<0?"#1d4ed8":"#059669"}; font-weight:900;">
                  ${u(d.closingBalance)}
                </span>
              </div>
            </div>
          </div>
      `,f?l+=`
          <table class="txns-table">
            <thead>
              <tr>
                <th style="width:72px;">التاريخ</th>
                <th style="width:82px;">نوع المستند</th>
                <th style="width:90px;">رقم المرجع</th>
                <th>البيان والتفاصيل</th>
                <th style="width:72px; text-align:left;">مدين (+) <span class="th-unit">(ر.س)</span></th>
                <th style="width:72px; text-align:left;">دائن (-) <span class="th-unit">(ر.س)</span></th>
                <th style="width:82px; text-align:left;">الرصيد المترتب</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f8fafc; font-weight:700;">
                <td style="color:#64748b;">—</td>
                <td><span class="badge badge-blue">رصيد سابق</span></td>
                <td class="mono" style="color:#64748b;">OPENING</td>
                <td style="color:#64748b;">رصيد أول المدة ما قبل تاريخ بداية التقرير</td>
                <td style="text-align:left;" class="mono">${d.openingBalance>0?u(d.openingBalance):"—"}</td>
                <td style="text-align:left;" class="mono">${d.openingBalance<0?u(Math.abs(d.openingBalance)):"—"}</td>
                <td style="text-align:left; font-weight:900;" class="mono">${u(d.openingBalance)}</td>
              </tr>
              ${d.transactions.map(m=>{const $=m.type==="invoice"?"فاتورة مبيعات":m.type==="receipt"?"سند قبض":m.type==="delivery_note"?"سند تسليم (DN)":"مرتجع مبيعات",z=m.type==="invoice"?"badge-blue":m.type==="receipt"?"badge-green":m.type==="return"?"badge-amber":"badge-gray";return`
                  <tr>
                    <td class="mono" style="white-space:nowrap; color:#475569;">${m.date||"—"}</td>
                    <td><span class="badge ${z}">${$}</span></td>
                    <td class="mono" style="font-weight:800; color:#1e40af;">${m.docNum||"—"}</td>
                    <td style="color:#334155;">${m.notes||"—"}</td>
                    <td style="text-align:left; white-space:nowrap; font-weight:${m.debit?"800":"normal"}; color:${m.debit?"#1d4ed8":"#94a3b8"};" class="mono">
                      ${m.debit?u(m.debit):"—"}
                    </td>
                    <td style="text-align:left; white-space:nowrap; font-weight:${m.credit?"800":"normal"}; color:${m.credit?"#059669":"#94a3b8"};" class="mono">
                      ${m.credit?u(m.credit):"—"}
                    </td>
                    <td style="text-align:left; white-space:nowrap; font-weight:900; color:${m.runningBalance>0?"#dc2626":m.runningBalance<0?"#1d4ed8":"#059669"};" class="mono">
                      ${u(m.runningBalance)}
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align:right;">مجموع حركات الفترة وصافي رصيد العميل الختامي (ر.س)</td>
                <td style="text-align:left; color:#1d4ed8;" class="mono">${u(d.periodSales)}</td>
                <td style="text-align:left; color:#059669;" class="mono">${u(d.periodReceipts+d.periodReturns)}</td>
                <td style="text-align:left; font-weight:900; color:${d.closingBalance>0?"#dc2626":"#059669"};" class="mono">${u(d.closingBalance)}</td>
              </tr>
            </tfoot>
          </table>
        `:l+=`
          <div class="empty-txns-line">
            <span>ℹ️ لا توجد حركات بيع أو سداد أو مرتجع مسجلة خلال الفترة المحددة</span>
            <span>رصيد أول المدة: <b class="mono">${u(d.openingBalance)}</b> &nbsp;|&nbsp; صافي المديونية القائمة: <b class="mono" style="color:${d.closingBalance>0?"#dc2626":"#059669"};">${u(d.closingBalance)} ر.س</b></span>
          </div>
        `,l+="</div>"})}),l}function me(t,e,n=!0){const{company:o,filteredReps:s,totals:a,fromDate:l,toDate:c,repFilterName:p,statusFilterName:d,stampSrc:b,cfg:g}=e,f=t==="summary",x=g.orientation==="landscape",v=s._hiddenNegligibleCount||0,m=s._hiddenNegligibleSum||0,$=f?"تقرير المديونيات الهرمي الشجري ومتابعة التحصيل (ملخص تنفيذي)":"تقرير المديونيات الهرمي الشجري وكشوف الحركات (تفصيلي موسع)",z=ue(),i=te(),r=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}),h=o.logoUrl?`
    <img src="${o.logoUrl}" alt="${o.name}" class="header-logo" />
  `:`
    <div style="border:2px solid #0f2e5a; padding:4px 10px; border-radius:6px; text-align:center; background:#f8fafc;">
      <div style="font-size:16px; line-height:1.1;">🏢</div>
      <div style="font-size:8pt; font-weight:900; color:#0f2e5a;">${o.name}</div>
    </div>
  `,w=f?Je(s,a,g):Qe(s,a,g);return`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${$}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f2e5a;
      --primary-light: #1e40af;
      --accent: #b45309;
      --success: #059669;
      --danger: #dc2626;
      --border: #cbd5e1;
      --text: #0f172a;
      --text-muted: #475569;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      color: var(--text);
      background: #e2e8f0;
      font-size: 10.5px;
      line-height: 1.35;
      direction: rtl;
    }
    .mono {
      font-family: 'IBM Plex Mono', monospace, sans-serif;
      font-variant-numeric: tabular-nums;
    }

    /* Sticky Preview Control Bar */
    .screen-control-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f2e5a;
      color: #fff;
      padding: 9px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .screen-control-bar .btn-group {
      display: flex;
      gap: 7px;
      align-items: center;
      flex-wrap: wrap;
    }
    .screen-btn, .screen-select {
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: 700;
      font-family: inherit;
      font-size: 11.5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .screen-select { background: #1e3a8a; color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .screen-btn-primary { background: #f59e0b; color: #0f172a; font-weight: 900; }
    .screen-btn-primary:hover { background: #d97706; color: #fff; }
    .screen-btn-secondary { background: rgba(255,255,255,0.16); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .screen-btn-secondary:hover { background: rgba(255,255,255,0.28); }
    .screen-btn-close { background: #dc2626; color: #fff; }
    .screen-btn-close:hover { background: #b91c1c; }

    /* Print Paper Container */
    .print-sheet {
      width: ${x?"297mm":"210mm"};
      min-height: ${x?"210mm":"297mm"};
      margin: 14px auto;
      background: #fff;
      padding: 8mm 8mm;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      border-radius: 4px;
    }

    /* Official Header */
    .official-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-top: 3.5px solid var(--primary);
      border-bottom: 2px solid var(--primary);
      padding: 8px 6px;
      margin-bottom: 10px;
      gap: 12px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }
    .company-col { flex: 1.25; text-align: right; }
    .company-name { font-size: 14px; font-weight: 900; color: var(--primary); margin-bottom: 2px; }
    .company-sub { font-size: 9px; color: var(--text-muted); font-weight: 600; margin-bottom: 3px; }
    .company-meta-item { font-size: 8.5px; color: #334155; font-weight: 600; margin-top: 2px; }
    .center-col { flex: 1.55; text-align: center; }
    .report-title-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0f2e5a 0%, #1e3a8a 100%);
      color: #fff;
      padding: 4px 14px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 900;
    }
    .report-mode-tag {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      border-radius: 4px;
      font-weight: 800;
      font-size: 9px;
    }
    .report-period-text { margin-top: 4px; font-size: 9px; color: #475569; font-weight: 700; }
    .logo-col { flex: 1; text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .header-logo { max-height: 46px; max-width: 115px; object-fit: contain; }
    .meta-tag { font-size: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px; color: #475569; font-weight: 600; }

    /* KPI Summary Strip */
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1.2px solid var(--border); border-radius: 6px; padding: 5px 6px; background: #fff; text-align: center; }
    .kpi-box.debt { border-color: #fca5a5; background: #fef2f2; }
    .kpi-box.sales { border-color: #bfdbfe; background: #eff6ff; }
    .kpi-box.receipts { border-color: #a7f3d0; background: #ecfdf5; }
    .kpi-box.returns { border-color: #fde68a; background: #fffbeb; }
    .kpi-box.rate { border-color: #ddd6fe; background: #f5f3ff; }
    .kpi-box-lbl { font-size: 8px; font-weight: 700; color: #475569; margin-bottom: 1px; }
    .kpi-box-val { font-size: 11px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; }
    .kpi-box.debt .kpi-box-val { color: #dc2626; }
    .kpi-box.sales .kpi-box-val { color: #1d4ed8; }
    .kpi-box.receipts .kpi-box-val { color: #059669; }
    .kpi-box.returns .kpi-box-val { color: #d97706; }
    .kpi-box.rate .kpi-box-val { color: #7c3aed; }
    .kpi-box-sub { font-size: 7.5px; font-weight: 600; color: #64748b; }

    /* Filter Context Banner */
    .filter-context-banner {
      background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 5px;
      padding: 4px 8px; margin-bottom: 9px; display: flex; justify-content: space-between;
      align-items: center; font-size: 8.5px; color: #334155; flex-wrap: wrap; gap: 4px;
    }

    /* Rep Matrix Summary */
    .rep-matrix-box { margin-bottom: 10px; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 6px; background: #f8fafc; }
    .rep-matrix-title { font-size: 10px; font-weight: 900; color: #0f2e5a; margin-bottom: 5px; }

    /* Rep Banner */
    .rep-banner {
      background: #0f2e5a; color: #fff; padding: 4px 8px; border-radius: 4px;
      margin-top: 9px; margin-bottom: 4px; display: flex; justify-content: space-between;
      align-items: center; page-break-after: avoid; break-after: avoid;
    }
    .rep-title { font-size: 10.5px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
    .rep-meta { font-size: 8.5px; font-weight: 600; display: flex; gap: 6px; align-items: center; }
    .rep-meta-chip { background: rgba(255,255,255,0.16); padding: 1.5px 6px; border-radius: 4px; }

    /* Summary Table */
    table.summary-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8.6px; }
    table.summary-table.fixed-table { table-layout: fixed; }
    table.summary-table th {
      background: #1e3a8a; color: #fff; padding: 4px 3px; font-weight: 800;
      border: 1px solid #1e3a8a; font-size: 8.2px; line-height: 1.15;
    }
    .th-unit { display: block; font-size: 6.8px; font-weight: 500; opacity: 0.85; }
    table.summary-table td {
      padding: 3.5px 3.5px; border: 1px solid #cbd5e1; vertical-align: middle; font-size: 8.6px; overflow: hidden;
    }
    table.summary-table tbody tr:nth-child(even) { background: #f8fafc; }
    table.summary-table tr.subtotal-row {
      background: #e2e8f0 !important; font-weight: 900;
      border-top: 2px solid #0f2e5a; border-bottom: 2px solid #0f2e5a;
    }
    table.summary-table tr.grandtotal-row {
      background: #0f2e5a !important; color: #fff !important; font-weight: 900; font-size: 9px;
    }
    table.summary-table tr.grandtotal-row td { border-color: #0f2e5a; color: #fff; padding: 5px 3.5px; }

    /* Badges */
    .badge { display: inline-block; padding: 1.5px 5px; border-radius: 4px; font-size: 7.4px; font-weight: 800; text-align: center; white-space: nowrap; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* Detailed Cards */
    .cust-card {
      border: 1.2px solid var(--border); border-radius: 5px; margin-bottom: 6px;
      background: #fff; overflow: hidden; page-break-inside: avoid; break-inside: avoid;
    }
    .cust-card-header {
      background: #f8fafc; padding: 4px 8px; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;
    }
    .cust-header-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .cust-code-pill { background: #0f2e5a; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 8px; font-weight: 800; }
    .cust-title-text { font-size: 10px; font-weight: 800; color: #0f172a; }
    .cust-phone-zone { font-size: 8px; color: #64748b; }
    .cust-card-kpis { display: flex; gap: 7px; align-items: center; font-size: 8.5px; }
    .cust-card-kpi-item { display: flex; gap: 3px; }
    .cust-card-kpi-item span.lbl { color: #64748b; font-weight: 700; }
    .cust-card-kpi-item span.val { font-weight: 800; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; }

    table.txns-table { width: 100%; border-collapse: collapse; font-size: 8.2px; }
    table.txns-table th { background: #334155; color: #fff; padding: 3px 5px; font-size: 7.8px; font-weight: 700; text-align: right; border: 1px solid #334155; }
    table.txns-table td { padding: 2.5px 5px; border: 1px solid #e2e8f0; vertical-align: middle; font-size: 8.2px; }
    table.txns-table tbody tr:nth-child(even) { background: #fafafa; }
    table.txns-table tfoot tr { background: #f1f5f9; font-weight: 800; border-top: 1.2px solid #94a3b8; }
    .empty-txns-line {
      padding: 3px 8px; background: #f8fafc; font-size: 8.2px; color: #475569;
      border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center;
    }

    /* Signatures */
    .signatures-block {
      margin-top: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
      page-break-inside: avoid; break-inside: avoid; border-top: 1.5px solid #cbd5e1; padding-top: 8px;
    }
    .signature-box {
      border: 1px dashed #94a3b8; border-radius: 5px; padding: 5px 8px; text-align: center;
      background: #fff; min-height: 66px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .sig-title { font-size: 8.5px; font-weight: 800; color: var(--primary); }
    .sig-line { border-bottom: 1px solid #cbd5e1; margin-top: 22px; margin-bottom: 2px; }
    .sig-sub { font-size: 7.2px; color: #94a3b8; }
    .report-footer {
      margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 4px;
      display: flex; justify-content: space-between; align-items: center; font-size: 7.8px; color: #64748b;
      page-break-inside: avoid; break-inside: avoid;
    }

    @media print {
      body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .print-sheet {
        width: 100% !important; min-height: auto !important;
        margin: 0 !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important;
      }
      @page {
        size: A4 ${g.orientation};
        margin: 6mm 6mm 8mm 6mm;
      }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>

  <!-- Interactive Sticky Preview Bar -->
  <div class="screen-control-bar no-print">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:12.5px; font-weight:800;">📊 ${f?"معاينة PDF (مختصر)":"معاينة PDF (موسع)"}</span>
      <select class="screen-select" onchange="window._hdebtSwitchPreset(this.value)" title="تبديل قالب الأعمدة فوراً">
        <option value="standard" ${g.preset==="standard"?"selected":""}>🏛️ القالب القياسي</option>
        <option value="profit_collection" ${g.preset==="profit_collection"?"selected":""}>💎 قالب الربحية وآخر تحصيل</option>
        <option value="field_followup" ${g.preset==="field_followup"?"selected":""}>📋 متابعة المندوب الميدانية</option>
        <option value="comprehensive" ${g.preset==="comprehensive"?"selected":""}>📊 القالب الشامل (أفقي)</option>
        ${g.preset==="custom"?'<option value="custom" selected>⚙️ مخصص يدوياً</option>':""}
      </select>
    </div>
    <div class="btn-group">
      <button class="screen-btn screen-btn-secondary" onclick="window._hdebtSwitchOrientation()">
        ${x?"↕️ تبديل إلى عمودي":"↔️ تبديل إلى أفقي"}
      </button>
      <button class="screen-btn screen-btn-secondary" onclick="window._hdebtSwitchMode('${f?"detailed":"summary"}')">
        🔄 ${f?"التبديل إلى الموسع":"التبديل إلى المختصر"}
      </button>
      <button class="screen-btn screen-btn-primary" onclick="window.print()">🖨️ طباعة الآن (A4) / حفظ PDF</button>
      <button class="screen-btn screen-btn-close" onclick="window.close()">✕ إغلاق</button>
    </div>
  </div>

  <!-- A4 Printable Sheet -->
  <div class="print-sheet">
    <!-- 1. Official Header -->
    <div class="official-header">
      <div class="company-col">
        <div class="company-name">${o.name||"شركة نظم الإمداد المتطورة"}</div>
        <div class="company-sub">${o.subNameAr||"تجارة وتوريد المواد الغذائية بالجملة"}</div>
        <div class="company-meta-item"><span>س.ت:</span> <b>${o.crNumber||"7054969006"}</b> &nbsp;|&nbsp; <span>الرقم الضريبي:</span> <b class="mono">${o.vatNumber||"314996148100003"}</b></div>
        <div class="company-meta-item"><span>هاتف:</span> <b>${o.phone||"0549141648"}</b> &nbsp;|&nbsp; <span>المدينة:</span> <b>${o.cityAr||"ينبع - المملكة العربية السعودية"}</b></div>
      </div>

      <div class="center-col">
        <div class="report-title-badge">${$}</div>
        <div><span class="report-mode-tag">${G[g.preset]||"نموذج معتمد"} — ${x?"أفقي":"عمودي"}</span></div>
        <div class="report-period-text">الفترة من: <b class="mono">${l||"بداية التعامل"}</b> إلى: <b class="mono">${c||"تاريخ اليوم"}</b></div>
      </div>

      <div class="logo-col">
        ${h}
        <div class="meta-tag">تاريخ الاستخراج: ${i}</div>
        <div class="meta-tag">الوقت: ${r}</div>
      </div>
    </div>

    ${g.showKpis?`
    <!-- 2. KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box debt">
        <div class="kpi-box-lbl">إجمالي المديونيات القائمة</div>
        <div class="kpi-box-val">${y(a.totalDebt)}</div>
        <div class="kpi-box-sub">${a.debtorCount} عميل مدين (من ${a.totalCustomers})</div>
      </div>
      <div class="kpi-box sales">
        <div class="kpi-box-lbl">إجمالي مبيعات الفترة</div>
        <div class="kpi-box-val">${y(a.sales)}</div>
        <div class="kpi-box-sub">ربح الفترة: ${y(a.periodProfit)} (${a.periodMarginPct}%)</div>
      </div>
      <div class="kpi-box receipts">
        <div class="kpi-box-lbl">إجمالي التحصيلات (سدادات)</div>
        <div class="kpi-box-val">${y(a.receipts)}</div>
        <div class="kpi-box-sub">آخر سدادات: ${y(a.lastPaymentTotal)}</div>
      </div>
      <div class="kpi-box returns">
        <div class="kpi-box-lbl">إجمالي المردودات</div>
        <div class="kpi-box-val">${y(a.returns)}</div>
        <div class="kpi-box-sub">إشعارات دائنة ومرتجع</div>
      </div>
      <div class="kpi-box rate">
        <div class="kpi-box-lbl">نسبة التحصيل الكلية</div>
        <div class="kpi-box-val">${a.collectionRate}%</div>
        <div class="kpi-box-sub">صافي الذمم: ${y(a.netReceivables)}</div>
      </div>
    </div>`:""}

    <!-- 3. Filter Context Banner -->
    <div class="filter-context-banner">
      <div>
        <span>📅 <b>الفترة:</b> ${l||"البداية"} ➔ ${c||"اليوم"}</span>
        <span style="margin:0 5px;">|</span>
        <span>👤 <b>المندوب:</b> ${p}</span>
        <span style="margin:0 5px;">|</span>
        <span>⚖️ <b>الحالة:</b> ${d}</span>
        ${v>0?`<span style="margin:0 5px;">|</span><span style="color:#b45309;">🧹 مستثنى ${v} عميل (&lt; 1 ر.س) بإجمالي ${u(m)} ر.س</span>`:""}
      </div>
      <div style="font-weight:700;">
        <span>المناديب: <b>${s.length}</b> &nbsp;|&nbsp; العملاء: <b>${a.totalCustomers}</b></span>
      </div>
    </div>

    <!-- 4. Body -->
    ${w}

    ${g.showSignatures?`
    <!-- 5. Signatures -->
    <div class="signatures-block">
      <div class="signature-box">
        <div class="sig-title">إعداد / محاسب المبيعات والعملاء</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">مراجعة / مشرف التحصيل</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">اعتماد / المدير المالي</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box" style="position:relative; display:flex; align-items:center; justify-content:center;">
        <div class="sig-title" style="position:absolute; top:5px; right:6px;">الختم الرسمي للمنشأة</div>
        ${b?`<img src="${b}" style="max-height:52px; max-width:78px; object-fit:contain; opacity:0.85; margin-top:10px;" />`:'<div style="font-size:9px; color:#94a3b8; margin-top:16px;">[ ختم الشركة المعتمد ]</div>'}
      </div>
    </div>`:""}

    <!-- 6. Footer -->
    <div class="report-footer">
      <div>نظام إدهام ERP — تقرير المديونيات الهرمي الشجري | رقم الوثيقة: HDEBT-${i.replace(/-/g,"")}</div>
      <div>صفحة رسمية معتمدة محاسبياً 100% مستخرجة بتاريخ ${i}م (${z}هـ)</div>
    </div>
  </div>

  <script>
    window._hdebtSwitchMode = function(newMode) {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: newMode });
      }
    };
    window._hdebtSwitchOrientation = function() {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: '${t}', toggleOrientation: true });
      }
    };
    window._hdebtSwitchPreset = function(presetKey) {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: '${t}', preset: presetKey });
      }
    };
    ${n?`
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 420);
    });
    `:""}
  <\/script>
</body>
</html>`}let k=null;function N(){const t=document.getElementById("hdebt-col-modal-body");if(!t||!k)return;const e=k,n=Se(e);t.innerHTML=`
    <!-- Live Preview Column Order Ribbon -->
    <div style="font-size:11px; font-weight:800; color:#475569; margin-bottom:5px;">👁️ ترتيب الأعمدة الفعلي في التقرير المطبوع (من اليمين لليسار):</div>
    <div class="hdebt-preview-ribbon">
      ${n.map(o=>`<span class="hdebt-preview-chip">${o.short}</span>`).join('<span style="opacity:0.5;">➔</span>')}
    </div>

    <!-- Presets -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">⚡ 1. قوالب جاهزة بضغطة زر:</div>
    <div class="hdebt-presets-grid">
      <button type="button" class="hdebt-preset-card ${e.preset==="profit_collection"?"is-active":""}" onclick="window.applyHierarchicalPreset('profit_collection')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">💎 الربحية وآخر تحصيل</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">يستبدل الكود بـ <b>آخر تحصيل</b> والمعلومات بـ <b>هامش الربح</b></div>
      </button>
      <button type="button" class="hdebt-preset-card ${e.preset==="standard"?"is-active":""}" onclick="window.applyHierarchicalPreset('standard')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">🏛️ القالب القياسي</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">كود العميل + معلومات التواصل + الحركات المالية</div>
      </button>
      <button type="button" class="hdebt-preset-card ${e.preset==="field_followup"?"is-active":""}" onclick="window.applyHierarchicalPreset('field_followup')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">📋 متابعة المندوب الميدانية</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">العميل + التواصل + آخر تحصيل + المديونية + توقيع</div>
      </button>
      <button type="button" class="hdebt-preset-card ${e.preset==="comprehensive"?"is-active":""}" onclick="window.applyHierarchicalPreset('comprehensive')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">📊 الشامل الكامل (أفقي)</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">يعرض كافة الأعمدة معاً في ورقة A4 أفقية</div>
      </button>
    </div>

    <!-- Quick Swaps -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">🔄 2. أزرار استبدال الأعمدة الفورية (استبدال المكان والمحتوى):</div>
    <div class="hdebt-swap-bar">
      <button type="button" class="hdebt-swap-btn" onclick="window.swapHierarchicalColumns('col_code', 'col_last_payment')">
        🔄 استبدال [كود العميل] ⇄ [آخر تحصيل (مبلغ وتاريخ)]
      </button>
      <button type="button" class="hdebt-swap-btn" onclick="window.swapHierarchicalColumns('col_contact', 'col_profit')">
        🔄 استبدال [معلومات العميل] ⇄ [هامش الربح والمجمل %]
      </button>
    </div>

    <!-- Column List with Reorder -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">🎛️ 3. التحكم الدقيق في الأعمدة والترتيب:</div>
    <div class="hdebt-col-list">
      ${e.columns.map((o,s)=>`
        <div class="hdebt-col-item ${o.locked?"is-locked":o.enabled?"is-enabled":""}">
          <label style="display:flex; align-items:center; gap:10px; cursor:${o.locked?"default":"pointer"}; flex:1;">
            <input type="checkbox" ${o.enabled||o.locked?"checked":""} ${o.locked?"disabled":""} onchange="window.toggleHierarchicalCol(${s}, this.checked)" style="width:16px; height:16px; accent-color:#1e40af;" />
            <div>
              <div style="font-weight:800; font-size:12px; color:#0f172a;">${o.label} ${o.locked?'<span style="font-size:10px; color:#1e40af;">(ثابت)</span>':""}</div>
              <div style="font-size:10px; color:#64748b;">${o.desc}</div>
            </div>
          </label>
          <div style="display:flex; gap:4px; align-items:center;">
            <button type="button" class="hdebt-order-btn" onclick="window.moveHierarchicalCol(${s}, -1)" ${s===0?"disabled":""} title="تحريك لليمين / للأعلى">▲</button>
            <button type="button" class="hdebt-order-btn" onclick="window.moveHierarchicalCol(${s}, 1)" ${s===e.columns.length-1?"disabled":""} title="تحريك لليسار / للأسفل">▼</button>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Layout & Metric Options -->
    <div class="hdebt-opt-grid">
      <div>
        <label style="display:block; font-size:11px; font-weight:800; color:#334155; margin-bottom:4px;">📐 اتجاه ورقة الطباعة (PDF)</label>
        <select class="hdebt-select" style="width:100%;" onchange="window.updateHierarchicalOption('orientation', this.value)">
          <option value="portrait" ${e.orientation==="portrait"?"selected":""}>📄 عمودي (A4 Portrait)</option>
          <option value="landscape" ${e.orientation==="landscape"?"selected":""}>↔️ أفقي (A4 Landscape — مثالي للأعمدة الكثيرة)</option>
        </select>
      </div>
      <div>
        <label style="display:block; font-size:11px; font-weight:800; color:#334155; margin-bottom:4px;">📈 نطاق احتساب هامش الربح</label>
        <select class="hdebt-select" style="width:100%;" onchange="window.updateHierarchicalOption('profitScope', this.value)">
          <option value="period" ${e.profitScope==="period"?"selected":""}>📅 مبيعات الفترة المحددة فقط (افتراضي)</option>
          <option value="allTime" ${e.profitScope==="allTime"?"selected":""}>♾️ التراكمي الكامل لتاريخ العميل</option>
        </select>
      </div>
      <div style="grid-column: 1 / -1; display:flex; flex-wrap:wrap; gap:14px; padding-top:4px;">
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${e.showRepMatrix?"checked":""} onchange="window.updateHierarchicalOption('showRepMatrix', this.checked)" />
          📊 إظهار جدول مقارنة المناديب بأعلى التقرير
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${e.showKpis?"checked":""} onchange="window.updateHierarchicalOption('showKpis', this.checked)" />
          📌 إظهار بطاقات المؤشرات (KPIs)
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${e.showSignatures?"checked":""} onchange="window.updateHierarchicalOption('showSignatures', this.checked)" />
          ✍️ إظهار التوقيعات والختم الرسمي
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:#b45309; cursor:pointer;">
          <input type="checkbox" ${e.hideNegligible?"checked":""} onchange="window.updateHierarchicalOption('hideNegligible', this.checked)" />
          🧹 استبعاد الأرصدة الهامشية (&lt; 1 ر.س بدون حركة)
        </label>
      </div>
    </div>
  `}function Xe(){window.toggleHierarchicalRep=e=>{E.has(e)?E.delete(e):E.add(e),j()},window.toggleHierarchicalCust=e=>{H.has(e)?H.delete(e):H.add(e),j()},window.expandAllHierarchicalDebt=(e=!0)=>{e?oe.forEach(n=>{E.add(n.id),n.customers.forEach(o=>H.add(o.id))}):(E.clear(),H.clear()),j()},window.applyHierarchicalDebtFilters=()=>j(),window.setHierarchicalDebtPeriod=e=>{const n=new Date,o=document.getElementById("hdebt-to"),s=document.getElementById("hdebt-from");if(!(!o||!s)){if(o.value=n.toISOString().split("T")[0],e==="today")s.value=n.toISOString().split("T")[0];else if(e==="week"){const a=new Date(n);a.setDate(a.getDate()-7),s.value=a.toISOString().split("T")[0]}else if(e==="mtd")s.value=n.toISOString().split("T")[0].slice(0,8)+"01";else if(e==="lastMonth"){const a=new Date(n.getFullYear(),n.getMonth()-1,1),l=new Date(n.getFullYear(),n.getMonth(),0);s.value=a.toISOString().split("T")[0],o.value=l.toISOString().split("T")[0]}else e==="all"&&(s.value="2024-01-01");ie()}},window.openCustomerUnifiedStatement=e=>{typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:e},window.navigate("report-customer-statement"))},window.openHierarchicalDebtCustomizer=()=>{k=I(),N();const e=document.getElementById("hdebt-col-modal");e&&(e.style.display="flex")},window.closeHierarchicalDebtCustomizer=()=>{const e=document.getElementById("hdebt-col-modal");e&&(e.style.display="none")},window.applyHierarchicalPreset=e=>{const n=k||I(),o=fe(e);o.profitScope=n.profitScope,o.showRepMatrix=n.showRepMatrix,o.showKpis=n.showKpis,o.showSignatures=n.showSignatures,o.hideNegligible=n.hideNegligible,k=o,N()},window.swapHierarchicalColumns=(e,n)=>{if(!k)return;const o=k.columns,s=o.findIndex(p=>p.id===e),a=o.findIndex(p=>p.id===n);if(s===-1||a===-1)return;const l=o[s],c=o[a];l.enabled===c.enabled?(l.enabled=!1,c.enabled=!0):(l.enabled=!l.enabled,c.enabled=!c.enabled),o[s]=c,o[a]=l,k.preset="custom",N()},window.toggleHierarchicalCol=(e,n)=>{!k||!k.columns[e]||k.columns[e].locked||(k.columns[e].enabled=n,k.preset="custom",N())},window.moveHierarchicalCol=(e,n)=>{if(!k)return;const o=k.columns,s=e+n;if(s<0||s>=o.length)return;const[a]=o.splice(e,1);o.splice(s,0,a),k.preset="custom",N()},window.updateHierarchicalOption=(e,n)=>{k&&(k[e]=n,N())},window.saveAndCloseHierarchicalCustomizer=()=>{k&&q(k),window.closeHierarchicalDebtCustomizer(),window.showToast?.("✅ تم حفظ إعدادات أعمدة الطباعة والتصدير بنجاح","success")},window.saveAndRunHierarchicalExport=e=>{k&&q(k),window.closeHierarchicalDebtCustomizer(),e==="excel"?window.exportHierarchicalDebtExcel():window.exportHierarchicalDebtPDF(e)};async function t(e){const n=ee(!0,e);if(!n||n.length===0)return null;const o=document.getElementById("hdebt-from")?.value||"",s=document.getElementById("hdebt-to")?.value||"",a=document.getElementById("hdebt-rep-filter"),l=a&&a.selectedIndex>=0?a.options[a.selectedIndex].text:"جميع المناديب",c=document.getElementById("hdebt-status-filter"),p=c&&c.selectedIndex>=0?c.options[c.selectedIndex].text:"كافة الحالات",d=ge(n),b=xe(),g=await Ge();return{company:b,filteredReps:n,totals:d,fromDate:o,toDate:s,repFilterName:l,statusFilterName:p,stampSrc:g,cfg:e}}window._reopenHierarchicalDebtPreview=async(e,n={})=>{try{let o=I();if(n.preset&&n.preset!=="custom"){const l=fe(n.preset);l.profitScope=o.profitScope,l.showRepMatrix=o.showRepMatrix,l.showKpis=o.showKpis,l.showSignatures=o.showSignatures,l.hideNegligible=o.hideNegligible,o=l}n.toggleOrientation&&(o.orientation=o.orientation==="landscape"?"portrait":"landscape"),q(o);const s=await t(o);if(!s)return;const a=me(n.mode||"summary",s,!1);e.document.open(),e.document.write(a),e.document.close()}catch(o){console.error("[HierarchicalDebt] Preview Update Error:",o)}},window.exportHierarchicalDebtPDF=async(e="summary")=>{try{const n=I(),o=await t(n);if(!o){window.showToast?window.showToast("لا توجد بيانات مطابقة للفلاتر لتصديرها","warning"):alert("لا توجد بيانات مطابقة للفلاتر لتصديرها");return}const s=window.open("","_blank");if(!s){window.showToast?window.showToast("يرجى السماح بالنوافذ المنبثقة لفتح تقرير الطباعة","error"):alert("يرجى السماح بالنوافذ المنبثقة لفتح تقرير الطباعة");return}const a=me(e,o,!0);s.document.open(),s.document.write(a),s.document.close(),window.showToast?.(`✅ تم فتح معاينة تقرير المديونيات (${e==="summary"?"ملخص موجز":"تفصيلي موسع"}) بنجاح`,"success")}catch(n){console.error("[HierarchicalDebt] PDF Export Error:",n),window.showToast?window.showToast("حدث خطأ أثناء إعداد تقرير الطباعة: "+n.message,"error"):alert("حدث خطأ أثناء إعداد تقرير الطباعة: "+n.message)}},window.printHierarchicalDebt=(e="summary")=>{window.exportHierarchicalDebtPDF(e)},window.exportHierarchicalDebtExcel=async()=>{try{const e=I(),n=ee(!0,e);if(!n||n.length===0){window.showToast?.("لا توجد بيانات مطابقة للفلاتر للتصدير","warning");return}const o=e.profitScope==="allTime",s=(e.columns||[]).filter(f=>f.enabled||f.locked),a=ge(n),l=["المندوب"];s.forEach(f=>{f.id==="_name"?l.push("اسم العميل"):f.id==="col_code"?l.push("كود العميل"):f.id==="col_last_payment"?l.push("مبلغ آخر تحصيل","تاريخ آخر تحصيل"):f.id==="col_contact"?l.push("الهاتف","المنطقة"):f.id==="col_profit"?l.push(o?"صافي الربح التراكمي":"صافي ربح الفترة","هامش الربح %"):f.id==="col_opening"?l.push("رصيد أول المدة"):f.id==="col_sales"?l.push("مبيعات الفترة"):f.id==="col_receipts"?l.push("سدادات الفترة"):f.id==="col_returns"?l.push("مردودات الفترة"):f.id==="col_closing"?l.push("صافي المديونية"):f.id==="col_coll_rate"?l.push("نسبة التحصيل %"):f.id==="col_status"?l.push("حالة المديونية"):f.id==="col_notes"&&l.push("ملاحظات المتابعة")});const c=[];n.forEach(f=>{f.visibleCustomers.forEach(x=>{const v=[f.name];s.forEach(m=>{if(m.id==="_name")v.push(x.name);else if(m.id==="col_code")v.push(x.code||"—");else if(m.id==="col_last_payment")v.push(x.lastPaymentAmount||0,x.lastPaymentDate||"—");else if(m.id==="col_contact")v.push(x.phone||"—",x.shortLocation||x.zone||"—");else if(m.id==="col_profit"){const $=o?x.allTimeProfit:x.periodProfit,z=o?x.allTimeMarginPct:x.periodMarginPct;v.push($,`${z.toFixed(1)}%`)}else if(m.id==="col_opening")v.push(x.openingBalance);else if(m.id==="col_sales")v.push(x.periodSales);else if(m.id==="col_receipts")v.push(x.periodReceipts);else if(m.id==="col_returns")v.push(x.periodReturns);else if(m.id==="col_closing")v.push(x.closingBalance);else if(m.id==="col_coll_rate"){const $=Math.max(0,(x.periodSales||0)+Math.max(0,x.openingBalance||0)),z=$>0?Math.min(100,Math.round((x.periodReceipts||0)/$*100)):x.closingBalance<=.01?100:0;v.push(`${z}%`)}else m.id==="col_status"?v.push(x.status==="debtor"?"مدين":x.status==="creditor"?"دائن":"مسدد"):m.id==="col_notes"&&v.push("")}),c.push(v)})});const p=["الإجمالي العام"];s.forEach(f=>{if(f.id==="_name")p.push(`${a.totalCustomers} عميل`);else if(f.id==="col_code")p.push("");else if(f.id==="col_last_payment")p.push(a.lastPaymentTotal,`${a.paidCustomersCount} مسدد`);else if(f.id==="col_contact")p.push("","");else if(f.id==="col_profit"){const x=o?a.allTimeProfit:a.periodProfit,v=o?a.allTimeMarginPct:a.periodMarginPct;p.push(x,`${v.toFixed(1)}%`)}else f.id==="col_opening"?p.push(a.openingBalance):f.id==="col_sales"?p.push(a.sales):f.id==="col_receipts"?p.push(a.receipts):f.id==="col_returns"?p.push(a.returns):f.id==="col_closing"?p.push(a.totalDebt):f.id==="col_coll_rate"?p.push(`${a.collectionRate}%`):f.id==="col_status"?p.push(`${a.debtorCount} مدين`):f.id==="col_notes"&&p.push("")});const d=document.getElementById("hdebt-from")?.value||"الكل",b=document.getElementById("hdebt-to")?.value||"الكل",g=`تقرير_المديونيات_الهرمي_${d}_إلى_${b}`;await Re({filename:g,sheetName:"المديونيات",title:`تقرير المديونيات الهرمي الشجري (${G[e.preset]||"مخصص"})`,headers:l,rows:c,summaryRows:[p]}),window.showToast?.("✅ تم تصدير التقرير إلى Excel بالأعمدة المختارة بنجاح","success")}catch(e){console.error("Excel Export Error:",e),window.showToast?.("❌ فشل تصدير Excel: "+e.message,"error")}}}export{nt as render};
