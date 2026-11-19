const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{f as y,u as N,t as w,_ as v,g as E,h as A}from"./index-CF9GFeRJ.js";function B(e){return e==null||isNaN(e)?"0.00 ر.س":(Number(e)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س"}function S(){return new Date().toISOString().split("T")[0]}function C(e=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"numeric",year:"numeric"}).format(e).replace(/هـ/g,"").trim()}catch{return"1448"}}function m(e){if(e!=null){const t=String(e).trim();if(t.length>0&&t!=="—"&&t!=="-"&&t!=="undefined"&&t!=="null")return`<span class="val-strong">${t}</span>`}return'<span class="fill-line"></span>'}function X(){const e={name:"شركة نظم الإمداد المتطورة",subNameAr:"تجارة وتوريد المواد الغذائية بالجملة",nameEn:"Advanced Supply Systems Co.",subNameEn:"Food Wholesale Supply",cityAr:"ينبع - المملكة العربية السعودية",cityEn:"Yanbu - Kingdom of Saudi Arabia",phone:"0549141648",email:"Nuzmalamdad@gmail.com",crNumber:"7054969006",vatNumber:"314996148100003",district:"حي غرناطة",logoUrl:""};try{const t=JSON.parse(localStorage.getItem("idham_company")||"{}");t.logoBase64&&(e.logoUrl=t.logoBase64),t.name&&(e.name=t.name),t.phone&&(e.phone=t.phone),t.email&&(e.email=t.email),(t.crNumber||t.cr)&&(e.crNumber=t.crNumber||t.cr),t.vatNumber&&(e.vatNumber=t.vatNumber),t.district&&(e.district=t.district)}catch{}return e}function $(e,t=null,n=""){const a=t||X(),s=n||a.stampUrl||"/icons/company-stamp.png",o=e.dateGreg||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:S()),i=e.dateHijri||C(),l=a.logoUrl?`
    <img src="${a.logoUrl}" alt="${a.name}" style="max-height:42px; max-width:120px; object-fit:contain;" />
  `:`
    <div style="border:1.5px solid #004d80; padding:2px 8px; border-radius:6px; text-align:center;">
      <div style="font-size:15px; line-height:1;">🏢</div>
      <div style="font-size:7.5pt; font-weight:900; color:#004d80;">${a.name}</div>
    </div>
  `,r=e.ownerName?String(e.ownerName).trim():"",d=e.ownerId?String(e.ownerId).trim():"",g=e.ownerPhone?String(e.ownerPhone).trim():"",c=!!(e.managerName&&String(e.managerName).trim()),p=c?String(e.managerName).trim():e.signatoryName&&String(e.signatoryName).trim()!==r?String(e.signatoryName).trim():"";c&&e.managerRole;const f=c?String(e.managerId||"").trim():e.signatoryId&&e.signatoryId!==d?String(e.signatoryId).trim():"",u=c?String(e.managerPhone||"").trim():e.signatoryPhone&&e.signatoryPhone!==g?String(e.signatoryPhone).trim():"",x=e.purchaserName?`${e.purchaserName} ${e.purchaserPhone?`(${e.purchaserPhone})`:""}`:"",h=e.receiverName?`${e.receiverName} ${e.receiverPhone?`(${e.receiverPhone})`:""}`:"";return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
  <title>اتفاقية فتح حساب وتسهيلات ائتمانية — ${e.name||"نموذج معتمد"}</title>
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
      <div class="hdr-company-name">${a.name}</div>
      <div class="hdr-company-sub">${a.subNameAr}</div>
      <div class="hdr-company-reg">س.ت: ${a.crNumber} &nbsp;|&nbsp; ر.ض: ${a.vatNumber}</div>
    </div>

    <div class="hdr-col-center">
      <div class="title-banner">
        <h1>اتفاقية فتح حساب وتسهيلات ائتمانية</h1>
        <div class="title-en">Customer Account Opening & Credit Facilities Agreement</div>
      </div>
    </div>

    <div class="hdr-col-left">
      <div>${l}</div>
      <div class="hdr-date-box">
        <div>التاريخ: ${o} م</div>
        <div>الموافق: ${i} هـ</div>
      </div>
    </div>
  </div>

  <!-- 2. خطاب التقديم والطلب -->
  <div class="intro-block">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div><strong>السادة / ${a.name}</strong> &nbsp; المحترمين ،،</div>
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
      <td colspan="3">${m(e.name)}</td>
      <th>كود العميل:</th>
      <td class="mono">${m(e.code)}</td>
    </tr>
    <tr>
      <th>السجل التجاري:</th>
      <td class="mono">${m(e.crNumber)}</td>
      <th>تاريخه / مصدره:</th>
      <td>${e.crDate||e.crSource?`${e.crDate||""} / ${e.crSource||e.city||"ينبع"}`:'<span class="fill-line"></span>'}</td>
      <th>الرقم الضريبي:</th>
      <td class="mono">${m(e.vatNumber)}</td>
    </tr>
    <tr>
      <th>الشكل والنشاط:</th>
      <td>${e.legalForm||"مؤسسة فردية"} - ${e.activityType||"تجارة مواد غذائية"}</td>
      <th>هاتف / جوال المنشأة:</th>
      <td class="mono">${m(e.phone||e.mobile)}</td>
      <th>العنوان والحي:</th>
      <td>${e.city||"ينبع"} ${e.district?" - "+e.district:""}</td>
    </tr>
    <!-- صف مالك المنشأة (الكفيل الغارم) منفصل ومستقل تماماً -->
    <tr class="owner-row">
      <th>مالك المنشأة (الكفيل الغارم):</th>
      <td>${m(r)}</td>
      <th>رقم الهوية الوطنية:</th>
      <td class="mono">${m(d)}</td>
      <th>رقم جوال المالك:</th>
      <td class="mono">${m(g)}</td>
    </tr>
    <!-- صف المسؤول المفوض بالتوقيع (اسم المفوض، رقم هويته، رقم جواله — يترك فارغاً بخطوط تنقيط إذا لم يُدخل ليملأه المحل يدوياً) -->
    <tr class="signatory-row">
      <th>اسم المسؤول المفوض:</th>
      <td>${m(p)}</td>
      <th>رقم الهوية / الإقامة:</th>
      <td class="mono">${m(f)}</td>
      <th>رقم جوال المفوض:</th>
      <td class="mono">${m(u)}</td>
    </tr>
    <!-- صف فصل الصلاحيات التشغيلية (الطلب والاستلام) -->
    <tr>
      <th>المفوض بطلب البضاعة:</th>
      <td colspan="2">${x?`<span class="val-strong">${x}</span>`:'<span class="fill-line"></span>'}</td>
      <th>المفوض بالاستلام:</th>
      <td colspan="2">${h?`<span class="val-strong">${h}</span>`:'<span class="fill-line"></span>'}</td>
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
      <div>الحد الائتماني المعتمد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${B(e.creditLimit||0)}</span></div>
      <div>فترة السماح والسداد: <span class="mono" style="font-size:9.5pt; color:#004d80;">${e.creditDays||30}</span> يوماً</div>
      <div>مدير المبيعات المسؤول: <span>${e.repName||"إدارة المبيعات"}</span></div>
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
        <div>اسم المفوض: <strong>${p||"........................................"}</strong></div>
        <div>رقم الهوية: <strong>${f||"........................................"}</strong></div>
        <div>رقم الجوال: <strong>${u||"........................................"}</strong></div>
      </div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${o} م</div>
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
      <div style="font-size:6.8pt; color:#004d80; margin-bottom:1px;">مدير المبيعات: <strong>${e.repName||"إدارة المبيعات"}</strong></div>
      <div class="sig-box-inner" style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:3px;">
        <div style="width:92%; font-size:7pt; color:#004d80; font-weight:800; text-align:right; margin-bottom:2px;">التوقيع: ............................................</div>
      </div>
      <div style="font-size:6.5pt; color:#475569; margin-top:1px;">التاريخ: ${o} م</div>
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
    <div>📞 ${a.phone}</div>
    <div>✉️ ${a.email}</div>
    <div>📍 ${a.cityAr}</div>
    <div>س.ت: ${a.crNumber} &nbsp;|&nbsp; ر.ض: ${a.vatNumber}</div>
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
</html>`}function I(e,t=null){const n=window.open("","_blank");if(!n){window.showToast?window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","error"):alert("يرجى السماح بالنوافذ المنبثقة للطباعة");return}fetch("/icons/company-stamp.png?t="+Date.now()).then(a=>a.blob()).then(a=>new Promise(s=>{const o=new FileReader;o.onload=()=>s(o.result),o.onerror=()=>s("/icons/company-stamp.png"),o.readAsDataURL(a)})).catch(()=>"/icons/company-stamp.png").then(a=>{const s=$(e,t,a);n.document.open(),n.document.write(s),n.document.close()})}typeof window<"u"&&(window.generateMasterAgreementHtml=$,window.printMasterCustomerAgreement=I);const b=(...e)=>window.showToast?window.showToast(...e):console.log(...e);function D(e=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"numeric",year:"numeric"}).format(e).replace(/هـ/g,"").trim()}catch{return"1448"}}async function k(){const e={name:"شركة نظم الإمداد المتطورة",subNameAr:"تجارة وتوريد المواد الغذائية بالجملة",nameEn:"Advanced Supply Systems Co.",subNameEn:"Food Wholesale Supply",cityAr:"ينبع - المملكة العربية السعودية",cityEn:"Yanbu - Kingdom of Saudi Arabia",phone:"0549141648",email:"Nuzmalamdad@gmail.com",web:"www.supplysa.com",crNumber:"7054969006",vatNumber:"314996148100003",district:"حي غرناطة",logoUrl:""};try{const t=JSON.parse(localStorage.getItem("idham_company")||"{}");t.logoBase64&&(e.logoUrl=t.logoBase64),t.name&&(e.name=t.name),t.nameEn&&(e.nameEn=t.nameEn),t.phone&&(e.phone=t.phone),t.email&&(e.email=t.email),(t.crNumber||t.cr)&&(e.crNumber=t.crNumber||t.cr),t.vatNumber&&(e.vatNumber=t.vatNumber),t.district&&(e.district=t.district)}catch{}if(!e.logoUrl)try{const{doc:t,getDoc:n}=await v(async()=>{const{doc:l,getDoc:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:l,getDoc:r}},[]),{db:a,COMPANY_ID:s}=await v(async()=>{const{db:l,COMPANY_ID:r}=await import("./index-CF9GFeRJ.js").then(d=>d.S);return{db:l,COMPANY_ID:r}},__vite__mapDeps([0,1])),[o,i]=await Promise.all([n(t(a,`companies/${s}/settings`,"logo")),n(t(a,`companies/${s}/settings`,"company"))]);if(o.exists()&&o.data().dataUrl){e.logoUrl=o.data().dataUrl;try{const l=JSON.parse(localStorage.getItem("idham_company")||"{}");l.logoBase64=e.logoUrl,localStorage.setItem("idham_company",JSON.stringify(l))}catch{}}if(i.exists()){const l=i.data();l.name&&(e.name=l.name),l.nameEn&&(e.nameEn=l.nameEn),l.phone&&(e.phone=l.phone),l.email&&(e.email=l.email),(l.crNumber||l.cr)&&(e.crNumber=l.crNumber||l.cr),l.vatNumber&&(e.vatNumber=l.vatNumber),l.district&&(e.district=l.district)}}catch(t){console.warn("Could not fetch company logo from settings:",t)}return window._agreementCompanyInfo=e,e}async function _(e,t=!1){let n=null;k().catch(()=>{});let a=[];try{a=await E("customers"),a.sort((r,d)=>(r.name||"").localeCompare(d.name||"","ar"))}catch(r){console.warn("Could not preload customers list:",r)}if(window._agreementCustomersList=a,t)n={id:"",name:"",code:"",crNumber:"",crDate:"",crSource:"",vatNumber:"",phone:"",mobile:"",email:"",city:"ينبع",district:"",street:"",postalCode:"",legalForm:"مؤسسة فردية",activityType:"تجارة وتوريد مواد غذائية",branchCount:"1",fax:"",poBox:"",ownerName:"",ownerId:"",ownerIdDate:"",ownerIdSource:"",ownerPhone:"",ownerAddress:"",ownerEmail:"",managerName:"",managerId:"",managerIdDate:"",managerIdSource:"",managerPhone:"",managerEmail:"",creditLimit:0,creditDays:30,repName:"",requestType:"open"};else if(typeof e=="object"&&e!==null)n=e;else if(typeof e=="string")try{n=await A("customers",e)}catch(r){console.warn("Failed to fetch customer by ID:",r)}n||(n={id:"",name:"",code:"",crNumber:"",crDate:"",crSource:"",vatNumber:"",phone:"",mobile:"",email:"",city:"ينبع",district:"",street:"",postalCode:"",legalForm:"مؤسسة فردية",activityType:"تجارة وتوريد مواد غذائية",branchCount:"1",fax:"",poBox:"",ownerName:"",ownerId:"",ownerIdDate:"",ownerIdSource:"",ownerPhone:"",ownerAddress:"",ownerEmail:"",managerName:"",managerId:"",managerIdDate:"",managerIdSource:"",managerPhone:"",managerEmail:"",creditLimit:0,creditDays:30,repName:"",requestType:"open"});const s=document.getElementById("cust-agreement-modal-overlay");s&&s.remove(),window._currentAgreementSignatureUrl=n.signatureDataUrl||"",window._currentAgreementAttachments=Array.isArray(n.attachments)?n.attachments:[];const o=w(),i=document.createElement("div");i.className="modal-overlay active",i.id="cust-agreement-modal-overlay",i.style.zIndex="9999";const l=a.map(r=>{const d=n.id&&n.id===r.id?"selected":"",g=r.code?`[كود: ${r.code}]`:"",c=r.crNumber||r.nationalId?`[س.ت: ${r.crNumber||r.nationalId}]`:"",p=r.mobile||r.phone?`[📱 ${r.mobile||r.phone}]`:"";return`<option value="${r.id}" ${d} data-name="${(r.name||"").toLowerCase()}" data-code="${(r.code||"").toLowerCase()}" data-cr="${r.crNumber||r.nationalId||""}" data-phone="${r.mobile||r.phone||""}">
      ${r.name} ${g} ${p} ${c}
    </option>`}).join("");i.innerHTML=`
    <div class="modal" style="max-width:960px; width:95%; max-height:94vh; display:flex; flex-direction:column; border-radius:18px; overflow:hidden; background:var(--bg-1); box-shadow:0 20px 60px rgba(0,0,0,0.35);">
      <!-- Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #004d80 0%, #006699 60%, #0284c7 100%); color:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="background:rgba(255,255,255,0.18); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.25);">
            📑
          </div>
          <div>
            <h3 style="margin:0; font-size:17.5px; font-weight:900; color:#fff; letter-spacing:-0.3px;">اتفاقية فتح / تحديث حساب عميل</h3>
            <p id="ag-modal-subtitle" style="margin:2px 0 0; font-size:12px; color:rgba(255,255,255,0.88);">
              ${n.id?`النموذج الرسمي المعتمد للعميل: <strong style="color:#fef08a;">${n.name||"—"}</strong>`:"طباعة النموذج الرسمي المعتمد فارغاً أو اختيار عميل مسجل"}
            </p>
          </div>
        </div>
        <button class="modal-close" style="color:#fff; font-size:24px; opacity:0.9;" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">×</button>
      </div>

      <!-- Body -->
      <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px 24px; background:var(--bg-2);">
        <input type="hidden" id="ag-cust-id" value="${n.id||""}" />

        <!-- بطاقة اختيار وربط عميل مسجل (ميزة التعبئة التلقائية الفورية) -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:linear-gradient(135deg, rgba(0,77,128,0.06), rgba(2,132,199,0.08)); border:1.8px solid #0284c7; box-shadow:0 3px 12px rgba(2,132,199,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:19px;">🤝</span>
              <span style="font-weight:900; font-size:13.5px; color:#004d80;">ربط الاتفاقية بعميل مسجل وتعبئة البيانات تلقائياً:</span>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-secondary sm" onclick="window.clearAgreementCustomerSelection()" title="تفريغ الحقول لطلب فتح حساب جديد أو تعبئة يدوية" style="font-size:11.5px; font-weight:800; padding:5px 12px; background:#fff; border-color:#cbd5e1; color:#475569;">
                🔄 تفريغ النموذج (حساب جديد)
              </button>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1.3fr 2fr; gap:10px; align-items:center;">
            <div>
              <input type="text" id="ag-search-customer-input" class="input font-bold" placeholder="🔍 فلترة سريعة بالاسم، الكود، الجوال، أو السجل..." style="font-size:12px; height:38px; background:#fff; border-color:#0284c7; border-radius:9px;" oninput="window.filterAgreementCustomerOptions(this.value)" />
            </div>
            <div>
              <select id="ag-customer-selector" class="input font-bold" style="font-size:12.5px; height:38px; background:#fff; border-color:#0284c7; border-radius:9px; color:#004d80;" onchange="window.onAgreementCustomerSelected(this.value)">
                <option value="">-- اختر عميلاً للتعبئة التلقائية (${a.length} عميل مسجل) --</option>
                ${l}
              </select>
            </div>
          </div>

          <!-- شريط معلومات العميل المختار -->
          <div id="ag-customer-info-badge" style="display:${n.id?"flex":"none"}; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:12px; padding:8px 14px; background:#fff; border-radius:10px; border:1px solid rgba(2,132,199,0.35); font-size:11.5px; color:#004d80;">
            <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
              <span>🏢 <strong>${n.name||"—"}</strong></span>
              <span>🏷️ الكود: <strong>${n.code||"—"}</strong></span>
              <span>💳 الرصيد الحالي: <strong style="color:${(n.balance||0)>0?"#dc2626":"#16a34a"};">${y(n.balance||0)}</strong></span>
              <span>🛡️ حد الائتمان: <strong>${y(n.creditLimit||0)}</strong></span>
              <span>⏱️ الأيام: <strong>${n.creditDays||30} يوم</strong></span>
            </div>
            <div style="font-size:11px; color:#0284c7; font-weight:800;">
              ✓ تم جلب البيانات تلقائياً
            </div>
          </div>

          <!-- زر ومعلومات المرفقات القانونية (KYC) -->
          <div id="ag-attachments-badge" style="display:${n.attachments&&n.attachments.length>0?"flex":"none"}; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:10px; padding:8px 14px; background:#eff6ff; border-radius:10px; border:1px solid #bae6fd; font-size:12px; color:#0369a1;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">📂</span>
              <span>يتوفر لهذا العميل عدد <strong id="ag-attachments-count" style="color:#0284c7;">${(n.attachments||[]).length}</strong> مستندات رسمية مرفوعة (KYC)</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="window.openCustomerAttachmentsModal(document.getElementById('ag-cust-id').value)" style="background:#0284c7; font-weight:800; font-size:11.5px; padding:4px 12px; border-radius:6px; cursor:pointer;">
              📁 عرض وفحص المستندات الرسمية
            </button>
          </div>
        </div>

        <!-- خيارات ونوع المعاملة والتاريخ -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1.5px solid rgba(2,132,199,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div style="display:flex; align-items:center; gap:18px;">
              <span style="font-weight:900; font-size:13px; color:#004d80;">نوع الطلب:</span>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-open" value="open" ${n.id?"":"checked"} style="width:16px;height:16px;" />
                <span>طلب فتح حساب جديد</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-update" value="update" ${n.id?"checked":""} style="width:16px;height:16px;" />
                <span>طلب تحديث حساب قائم</span>
              </label>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <div class="form-group" style="margin:0;">
                <label style="font-size:11px; font-weight:800; color:#004d80;">تاريخ الطلب (ميلادي)</label>
                <input type="date" id="ag-date-greg" class="input mono font-bold" value="${o}" style="padding:5px 10px; height:34px; border-radius:8px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- أولاً: بيانات المنشأة -->
        <div class="card" style="padding:16px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:13.5px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span style="background:#004d80; color:#fff; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">١</span>
            <span>بيانات المنشأة التجارية</span>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1.2fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الاسم التجاري للمنشأة *</label>
              <input type="text" id="ag-name" class="input font-bold" value="${n.name||""}" placeholder="اسم المحل / المؤسسة" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم السجل التجاري</label>
              <input type="text" id="ag-cr" class="input mono font-bold" value="${n.crNumber||n.nationalId||""}" placeholder="1010XXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">تاريخ السجل</label>
              <input type="text" id="ag-cr-date" class="input mono" value="${n.crDate||""}" placeholder="1445/01/01" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">مصدر السجل</label>
              <input type="text" id="ag-cr-source" class="input" value="${n.crSource||n.city||"ينبع"}" placeholder="ينبع / الرياض" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">المدينة</label>
              <input type="text" id="ag-city" class="input" value="${n.city||"ينبع"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الحي</label>
              <input type="text" id="ag-district" class="input" value="${n.district||""}" placeholder="اسم الحي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشارع</label>
              <input type="text" id="ag-street" class="input" value="${n.street||""}" placeholder="اسم الشارع الرئيسي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرمز البريدي</label>
              <input type="text" id="ag-postal" class="input mono" value="${n.postalCode||""}" placeholder="12345" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشكل القانوني</label>
              <select id="ag-legal-form" class="input">
                <option value="مؤسسة فردية" ${n.legalForm==="مؤسسة فردية"?"selected":""}>مؤسسة فردية</option>
                <option value="شركة ذات مسؤولية محدودة" ${n.legalForm==="شركة ذات مسؤولية محدودة"?"selected":""}>شركة ذات مسؤولية محدودة</option>
                <option value="شركة مساهمة مبسطة" ${n.legalForm==="شركة مساهمة مبسطة"?"selected":""}>شركة مساهمة مبسطة</option>
                <option value="شركة تضامنية" ${n.legalForm==="شركة تضامنية"?"selected":""}>شركة تضامنية</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">نوع النشاط</label>
              <input type="text" id="ag-activity" class="input" value="${n.activityType||"تجارة المواد الغذائية والتموينات"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">هاتف المنشأة</label>
              <input type="tel" id="ag-phone" class="input mono" value="${n.phone||""}" placeholder="014XXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم الجوال *</label>
              <input type="tel" id="ag-mobile" class="input mono font-bold" value="${n.mobile||n.phone||""}" placeholder="05XXXXXXXX" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمنشأة</label>
              <input type="email" id="ag-email" class="input mono" value="${n.email||""}" placeholder="store@example.com" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرقم الضريبي (VAT)</label>
              <input type="text" id="ag-vat" class="input mono font-bold" value="${n.vatNumber||""}" placeholder="300XXXXXXXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عدد الفروع</label>
              <input type="number" id="ag-branches" class="input mono" value="${n.branchCount||"1"}" min="1" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">صندوق البريد</label>
              <input type="text" id="ag-pobox" class="input mono" value="${n.poBox||""}" placeholder="ص.ب 1234" />
            </div>
          </div>
        </div>

        <!-- ثانياً: بيانات مالك المنشأة والمسؤول المفوض -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
          <!-- مالك المنشأة -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٢</span>
              <span>بيانات مالك المنشأة (الكفيل الغارم)</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المالك رباعياً *</label>
              <input type="text" id="ag-owner-name" class="input font-bold" value="${n.ownerName||n.name||""}" placeholder="الاسم الكامل كما في الهوية" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية الوطنية</label>
                <input type="text" id="ag-owner-id" class="input mono font-bold" value="${n.ownerId||n.nationalId||""}" placeholder="10XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">تاريخها ومصدرها</label>
                <input type="text" id="ag-owner-id-source" class="input" value="${n.ownerIdSource||"ينبع"}" placeholder="أحوال ينبع" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم جوال المالك</label>
                <input type="tel" id="ag-owner-phone" class="input mono font-bold" value="${n.ownerPhone||""}" placeholder="05XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">البريد الإلكتروني</label>
                <input type="email" id="ag-owner-email" class="input mono" value="${n.ownerEmail||""}" placeholder="owner@..." />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عنوان المالك (العنوان الوطني)</label>
              <input type="text" id="ag-owner-address" class="input" value="${n.ownerAddress||n.address||(n.city?n.city+(n.district?" - "+n.district:""):"")}" placeholder="المدينة، الحي، رقم المبنى" />
            </div>
          </div>

          <!-- المدير المسؤول -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٣</span>
              <span>بيانات المسؤول المفوض (إذا كان غير المالك)</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المسؤول رباعياً</label>
              <input type="text" id="ag-mgr-name" class="input" value="${n.managerName||""}" placeholder="اسم المدير / المشرف المفوض" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية / الإقامة</label>
                <input type="text" id="ag-mgr-id" class="input mono" value="${n.managerId||""}" placeholder="2XXXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الجوال</label>
                <input type="tel" id="ag-mgr-phone" class="input mono" value="${n.managerPhone||""}" placeholder="05XXXXXXXX" />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمسؤول</label>
              <input type="email" id="ag-mgr-email" class="input mono" value="${n.managerEmail||""}" placeholder="manager@..." />
            </div>
            <div style="margin-top:14px; padding:8px 10px; background:rgba(2,132,199,0.06); border-radius:8px; font-size:11px; color:#004d80;">
              ℹ️ يلزم إرفاق صورة الوكالة الشرعية أو التفويض الرسمي وتصديق الغرفة التجارية في حال كان المسؤول غير المالك.
            </div>
          </div>
        </div>

        <!-- رابعاً: شروط الائتمان والاعتماد الرسمي -->
        <div class="card" style="padding:16px 18px; margin-bottom:14px; border-radius:14px; background:linear-gradient(135deg, rgba(0,77,128,0.06), rgba(2,132,199,0.04)); border:1.5px solid rgba(2,132,199,0.3);">
          <div style="font-size:13.5px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span style="background:#004d80; color:#fff; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">٤</span>
            <span>شروط التسهيل الائتماني والاعتمادات الرسمية</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr; gap:14px;">
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">مبلغ الائتمان المعتمد (ريال سعودي) *</label>
              <input type="number" id="ag-credit-limit" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${n.creditLimit||0}" step="500" min="0" />
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">فترة الائتمان المسموح بها (بالأيام) *</label>
              <input type="number" id="ag-credit-days" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${n.creditDays||30}" min="0" />
              <div style="display:flex; gap:4px; margin-top:5px; flex-wrap:wrap;">
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=7" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">7 أيام</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=15" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">15 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=20" style="padding:2px 7px; font-size:11px; background:#e0f2fe; color:#0369a1; font-weight:800; border:1px solid #7dd3fc;">20 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=30" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">30 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=45" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">45 يوماً</button>
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1);">مدير المبيعات</label>
              <input type="text" id="ag-rep-name" class="input font-bold" value="${n.repName||""}" placeholder="اسم مدير المبيعات" />
            </div>
          </div>
        </div>

        <!-- خامساً: الشروط والالتزامات القانونية المعتمدة (معاينة بنود الحماية والتحصيل) -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1.5px solid #0284c7;">
          <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.toggleAgreementLegalClauses()">
            <div style="font-size:13px; font-weight:900; color:#004d80; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">⚖️</span>
              <span>البنود والالتزامات القانونية المعتمدة (8 بنود نظامية لحماية الشركة والتحصيل)</span>
            </div>
            <span id="ag-legal-toggle-icon" style="font-size:13px; color:#0284c7; font-weight:900;">▼ عرض البنود القانونية</span>
          </div>
          
          <div id="ag-legal-clauses-content" style="display:none; margin-top:14px; border-top:1px solid rgba(2,132,199,0.2); padding-top:12px; font-size:12px; line-height:1.6; color:var(--text-0);">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">١. صحة الأهلية وسريان السجل:</strong> إقرار بكامل الأهلية وصحة وسريان السجل التجاري والتراخيص، والتعهد بإخطار الشركة كتابياً بأي تعديل خلال 3 أيام عمل.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٢. سداد الفواتير وحجية القيود:</strong> التزام بالسداد بالأجل المحدد، وتعتبر كشوف الحساب والفواتير الإلكترونية الصادرة بينة قاطعة ومثبتة للمديونية وفق نظام الإثبات.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٣. حجية الفواتير وسندات التسليم:</strong> الفواتير الإلكترونية (ZATCA) وسندات التسليم الموقعة من العميل أو عماله بالموقع حجة باتة على الاستلام وسلامة البضائع.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٤. سقوط الآجال وحلول المديونية:</strong> تسقط جميع الآجال وتستحق كامل المديونية فوراً عند تأخر أي فاتورة، أو بيع المنشأة أو إشهار الإفلاس أو الحجز.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٥. فحص البضائع ومسؤولية التخزين:</strong> فحص البضائع فوراً وسقوط حق الاعتراض بعد 24 ساعة، وتحمل مسؤولية التخزين دون رجوع على الشركة لكون المواد سريعة التلف.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٦. إسقاط الخصومات عند التأخير:</strong> التأخر في السداد يسقط تلقائياً كافة الخصومات والتسهيلات والعروض الممنوحة، وتستحق الفواتير بقيمتها الأصلية دون خصم.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٧. الضمان التنفيذي والكفالة الغارمة:</strong> إصدار سند لأمر عبر منصة نافذ، واعتبار الموقع كفيلاً غارماً متضامناً بصفته الشخصية مع إسقاط الدفع بالتجريد.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٨. الموطن المختار والاختصاص القضائي:</strong> العناوين الموضحة موطن رسمي للتبليغات، وينعقد الاختصاص لمحاكم ينبع التجارية مع تحمل أتعاب المحاماة والتحصيل.
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">إغلاق</button>
        
        <div style="display:flex; gap:10px; align-items:center;">
          <button id="ag-save-cust-btn" class="btn btn-secondary font-bold" onclick="window.saveAgreementDataOnly()" title="حفظ البيانات المدخلة في ملف العميل مباشرة" style="display:${n.id?"inline-flex":"none"};">
            💾 حفظ في ملف العميل
          </button>
          <button id="ag-issue-note-btn" class="btn btn-secondary font-bold" style="display:${n.id?"inline-flex":"none"}; background:rgba(124,58,237,0.1); color:#7C3AED; border-color:rgba(124,58,237,0.3);" onclick="window.issuePromissoryNoteFromAgreement('${n.id||""}', '${(n.name||"").replace(/'/g,"\\'")}')" title="الانتقال لإصدار سند لأمر نافذ">
            📜 إصدار سند لأمر
          </button>
          <button class="btn btn-primary" onclick="window.generateAndPrintCustomerAgreement()" style="padding:10px 26px; font-weight:900; font-size:13.5px; background:linear-gradient(135deg, #004d80, #006699, #0284c7); box-shadow:0 4px 16px rgba(2,132,199,0.35);">
            🖨️ طباعة الاتفاقية الرسمية (صفحة واحدة)
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(i)}window.toggleAgreementLegalClauses=()=>{const e=document.getElementById("ag-legal-clauses-content"),t=document.getElementById("ag-legal-toggle-icon");if(!e)return;const n=e.style.display==="none";e.style.display=n?"block":"none",t&&(t.textContent=n?"▲ إخفاء البنود القانونية":"▼ عرض البنود القانونية")};window.filterAgreementCustomerOptions=e=>{const t=(e||"").trim().toLowerCase(),n=document.getElementById("ag-customer-selector");if(!n)return;const a=Array.from(n.options);let s=0;for(let o=1;o<a.length;o++){const i=a[o],l=i.getAttribute("data-name")||"",r=i.getAttribute("data-code")||"",d=i.getAttribute("data-cr")||"",g=i.getAttribute("data-phone")||"",c=!t||l.includes(t)||r.includes(t)||d.includes(t)||g.includes(t);i.style.display=c?"":"none",c&&s++}if(s===1&&t.length>=3){const o=a.find((i,l)=>l>0&&i.style.display!=="none");o&&n.value!==o.value&&(n.value=o.value,window.onAgreementCustomerSelected(o.value))}};window.onAgreementCustomerSelected=e=>{if(!e){window.clearAgreementCustomerSelection();return}const t=(window._agreementCustomersList||[]).find(p=>p.id===e);if(!t)return;const n=document.getElementById("ag-cust-id");n&&(n.value=t.id);const a=document.getElementById("ag-type-update");a&&(a.checked=!0);const s=document.getElementById("ag-modal-subtitle");s&&(s.innerHTML=`النموذج الرسمي المعتمد للعميل: <strong style="color:#fef08a;">${t.name||"—"}</strong> (كود: ${t.code||"—"})`);const o=(p,f)=>{const u=document.getElementById(p);u&&(u.value=f??"")};o("ag-name",t.name||""),o("ag-cr",t.crNumber||t.nationalId||""),o("ag-cr-date",t.crDate||""),o("ag-cr-source",t.crSource||t.city||"ينبع"),o("ag-city",t.city||"ينبع"),o("ag-district",t.district||""),o("ag-street",t.street||""),o("ag-postal",t.postalCode||t.zip||""),o("ag-legal-form",t.legalForm||"مؤسسة فردية"),o("ag-activity",t.activityType||"تجارة المواد الغذائية والتموينات"),o("ag-phone",t.phone||""),o("ag-mobile",t.mobile||t.phone||""),o("ag-email",t.email||""),o("ag-vat",t.vatNumber||t.vat||""),o("ag-branches",t.branchCount||"1"),o("ag-pobox",t.poBox||""),o("ag-owner-name",t.ownerName||t.name||""),o("ag-owner-id",t.ownerId||t.nationalId||""),o("ag-owner-id-source",t.ownerIdSource||"ينبع"),o("ag-owner-phone",t.ownerPhone||""),o("ag-owner-email",t.ownerEmail||"");const i=t.ownerAddress||t.address||(t.city?t.city+(t.district?" - "+t.district:""):"");o("ag-owner-address",i),o("ag-mgr-name",t.managerName||""),o("ag-mgr-id",t.managerId||""),o("ag-mgr-phone",t.managerPhone||""),o("ag-mgr-email",t.managerEmail||""),o("ag-credit-limit",t.creditLimit||0),o("ag-credit-days",t.creditDays||30),o("ag-rep-name",t.repName||""),window._currentAgreementSignatureUrl=t.signatureDataUrl||"",window._currentAgreementAttachments=Array.isArray(t.attachments)?t.attachments:[];const l=document.getElementById("ag-attachments-badge"),r=document.getElementById("ag-attachments-count");l&&r&&(window._currentAgreementAttachments.length>0?(r.textContent=window._currentAgreementAttachments.length,l.style.display="flex"):l.style.display="none");const d=document.getElementById("ag-customer-info-badge");d&&(d.style.display="flex",d.innerHTML=`
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <span>🏢 <strong>${t.name||"—"}</strong></span>
        <span>🏷️ الكود: <strong>${t.code||"—"}</strong></span>
        <span>💳 الرصيد الحالي: <strong style="color:${(t.balance||0)>0?"#dc2626":"#16a34a"};">${y(t.balance||0)}</strong></span>
        <span>🛡️ حد الائتمان: <strong>${y(t.creditLimit||0)}</strong></span>
        <span>⏱️ الأيام: <strong>${t.creditDays||30} يوم</strong></span>
      </div>
      <div style="font-size:11px; color:#0284c7; font-weight:800;">
        ✓ تم جلب البيانات تلقائياً
      </div>
    `);const g=document.getElementById("ag-save-cust-btn");g&&(g.style.display="inline-flex");const c=document.getElementById("ag-issue-note-btn");c&&(c.style.display="inline-flex",c.onclick=()=>window.issuePromissoryNoteFromAgreement(t.id,t.name)),b(`✅ تم جلب وتعبئة بيانات العميل (${t.name}) بنجاح`,"success")};window.clearAgreementCustomerSelection=()=>{window._currentAgreementSignatureUrl="",window._currentAgreementAttachments=[];const e=document.getElementById("ag-attachments-badge");e&&(e.style.display="none");const t=document.getElementById("ag-cust-id");t&&(t.value="");const n=document.getElementById("ag-customer-selector");n&&(n.value="");const a=document.getElementById("ag-search-customer-input");a&&(a.value=""),window.filterAgreementCustomerOptions("");const s=document.getElementById("ag-modal-subtitle");s&&(s.textContent="طباعة النموذج الرسمي المعتمد فارغاً للتعبئة الورقية");const o=document.getElementById("ag-type-open");o&&(o.checked=!0);const i=(g,c)=>{const p=document.getElementById(g);p&&(p.value=c??"")};i("ag-name",""),i("ag-cr",""),i("ag-cr-date",""),i("ag-cr-source","ينبع"),i("ag-city","ينبع"),i("ag-district",""),i("ag-street",""),i("ag-postal",""),i("ag-legal-form","مؤسسة فردية"),i("ag-activity","تجارة وتوريد مواد غذائية"),i("ag-phone",""),i("ag-mobile",""),i("ag-email",""),i("ag-vat",""),i("ag-branches","1"),i("ag-pobox",""),i("ag-owner-name",""),i("ag-owner-id",""),i("ag-owner-id-source","ينبع"),i("ag-owner-phone",""),i("ag-owner-email",""),i("ag-owner-address",""),i("ag-mgr-name",""),i("ag-mgr-id",""),i("ag-mgr-phone",""),i("ag-mgr-email",""),i("ag-credit-limit",0),i("ag-credit-days",30),i("ag-rep-name","");const l=document.getElementById("ag-customer-info-badge");l&&(l.style.display="none");const r=document.getElementById("ag-save-cust-btn");r&&(r.style.display="none");const d=document.getElementById("ag-issue-note-btn");d&&(d.style.display="none"),b("تم تفريغ الحقول لإعداد نموذج فارغ","info")};function z(){const e=document.getElementById("ag-type-update")?.checked;return{id:document.getElementById("ag-cust-id")?.value||"",requestType:e?"update":"open",requestTypeLabel:e?"طلب تحديث حساب":"طلب فتح حساب",dateGreg:document.getElementById("ag-date-greg")?.value||w(),dateHijri:D(),name:document.getElementById("ag-name")?.value.trim()||"",crNumber:document.getElementById("ag-cr")?.value.trim()||"",crDate:document.getElementById("ag-cr-date")?.value.trim()||"",crSource:document.getElementById("ag-cr-source")?.value.trim()||"",city:document.getElementById("ag-city")?.value.trim()||"",district:document.getElementById("ag-district")?.value.trim()||"",street:document.getElementById("ag-street")?.value.trim()||"",postalCode:document.getElementById("ag-postal")?.value.trim()||"",legalForm:document.getElementById("ag-legal-form")?.value||"مؤسسة فردية",activityType:document.getElementById("ag-activity")?.value.trim()||"",phone:document.getElementById("ag-phone")?.value.trim()||"",mobile:document.getElementById("ag-mobile")?.value.trim()||"",email:document.getElementById("ag-email")?.value.trim()||"",vatNumber:document.getElementById("ag-vat")?.value.trim()||"",branchCount:document.getElementById("ag-branches")?.value||"1",poBox:document.getElementById("ag-pobox")?.value.trim()||"",ownerName:document.getElementById("ag-owner-name")?.value.trim()||"",ownerId:document.getElementById("ag-owner-id")?.value.trim()||"",ownerIdDate:document.getElementById("ag-owner-id-date")?.value.trim()||"",ownerIdSource:document.getElementById("ag-owner-id-source")?.value.trim()||"",ownerPhone:document.getElementById("ag-owner-phone")?.value.trim()||"",ownerAddress:document.getElementById("ag-owner-address")?.value.trim()||"",ownerEmail:document.getElementById("ag-owner-email")?.value.trim()||"",managerName:document.getElementById("ag-mgr-name")?.value.trim()||"",managerId:document.getElementById("ag-mgr-id")?.value.trim()||"",managerPhone:document.getElementById("ag-mgr-phone")?.value.trim()||"",managerEmail:document.getElementById("ag-mgr-email")?.value.trim()||"",creditLimit:parseFloat(document.getElementById("ag-credit-limit")?.value)||0,creditDays:parseInt(document.getElementById("ag-credit-days")?.value)||0,repName:document.getElementById("ag-rep-name")?.value.trim()||""}}window.saveAgreementDataOnly=async()=>{const e=z();if(!e.id){b("يرجى اختيار عميل مسجل لحفظ البيانات في ملفه","warning");return}try{await N("customers",e.id,{name:e.name,crNumber:e.crNumber,nationalId:e.crNumber,crDate:e.crDate,crSource:e.crSource,vatNumber:e.vatNumber,city:e.city,district:e.district,street:e.street,postalCode:e.postalCode,phone:e.phone,mobile:e.mobile,email:e.email,creditLimit:e.creditLimit,creditDays:e.creditDays,ownerName:e.ownerName,ownerId:e.ownerId,ownerPhone:e.ownerPhone,ownerAddress:e.ownerAddress,ownerEmail:e.ownerEmail,managerName:e.managerName,managerId:e.managerId,managerPhone:e.managerPhone,managerEmail:e.managerEmail,legalForm:e.legalForm,activityType:e.activityType,branchCount:e.branchCount,repName:e.repName,updatedAt:new Date().toISOString()}),b("✅ تم حفظ وتحديث بيانات الاتفاقية في ملف العميل بنجاح","success")}catch(t){b("خطأ في حفظ البيانات: "+t.message,"error")}};window.issuePromissoryNoteFromAgreement=(e,t)=>{const n=document.getElementById("cust-agreement-modal-overlay");n&&n.remove(),typeof window.issuePromissoryNote=="function"&&window.issuePromissoryNote(e,t)};window.generateAndPrintCustomerAgreement=async()=>{const e=z();e.signatureDataUrl=window._currentAgreementSignatureUrl||"",e.attachments=window._currentAgreementAttachments||[];let t=window._agreementCompanyInfo;(!t||!t.logoUrl)&&(t=await k()),I(e,t)};export{_ as o};
