import{u as v,f as x,t as c,F as h}from"./index-BfKDPs3D.js";const n=(...e)=>window.showToast?window.showToast(...e):console.log(...e);function y(e=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"numeric",year:"numeric"}).format(e).replace(/هـ/g,"").trim()}catch{return"1448"}}async function _(e,a=!1){let t=null;if(a)t={id:"",name:"",code:"",crNumber:"",crDate:"",crSource:"",vatNumber:"",phone:"",mobile:"",email:"",city:"ينبع",district:"",street:"",postalCode:"",legalForm:"مؤسسة فردية",activityType:"تجارة وتوريد مواد غذائية",branchCount:"1",fax:"",poBox:"",ownerName:"",ownerId:"",ownerIdDate:"",ownerIdSource:"",ownerPhone:"",ownerAddress:"",ownerEmail:"",managerName:"",managerId:"",managerIdDate:"",managerIdSource:"",managerPhone:"",managerEmail:"",creditLimit:0,creditDays:30,repName:"",requestType:"open"};else if(typeof e=="object"&&e!==null)t=e;else if(typeof e=="string")try{t=await h("customers",e)}catch(r){console.warn("Failed to fetch customer by ID:",r)}if(!t&&!a){n("تعذر العثور على بيانات العميل","error");return}const i=document.getElementById("cust-agreement-modal-overlay");i&&i.remove();const d=c(),o=document.createElement("div");o.className="modal-overlay active",o.id="cust-agreement-modal-overlay",o.style.zIndex="9999",o.innerHTML=`
    <div class="modal" style="max-width:940px; width:95%; max-height:92vh; display:flex; flex-direction:column; border-radius:18px; overflow:hidden; background:var(--bg-1); box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <!-- Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #004d80 0%, #006699 60%, #0284c7 100%); color:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="background:rgba(255,255,255,0.18); width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; backdrop-filter:blur(4px);">
            📑
          </div>
          <div>
            <h3 style="margin:0; font-size:17px; font-weight:900; color:#fff; letter-spacing:-0.3px;">اتفاقية فتح / تحديث حساب عميل</h3>
            <p style="margin:2px 0 0; font-size:12px; color:rgba(255,255,255,0.85);">
              ${a?"طباعة النموذج الرسمي المعتمد فارغاً للتعبئة الورقية":`النموذج الرسمي المعتمد للعميل: <strong style="color:#fef08a;">${t.name||"—"}</strong>`}
            </p>
          </div>
        </div>
        <button class="modal-close" style="color:#fff; font-size:24px; opacity:0.9;" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">×</button>
      </div>

      <!-- Body -->
      <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px 24px; background:var(--bg-2);">
        <input type="hidden" id="ag-cust-id" value="${t.id||""}" />

        <!-- خيارات ونوع المعاملة والتاريخ -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1.5px solid rgba(2,132,199,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div style="display:flex; align-items:center; gap:18px;">
              <span style="font-weight:900; font-size:13px; color:#004d80;">نوع الطلب:</span>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-open" value="open" ${t.requestType!=="update"?"checked":""} style="width:16px;height:16px;" />
                <span>طلب فتح حساب جديد</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-update" value="update" ${t.requestType==="update"?"checked":""} style="width:16px;height:16px;" />
                <span>طلب تحديث حساب قائم</span>
              </label>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <div class="form-group" style="margin:0;">
                <label style="font-size:11px; font-weight:800; color:#004d80;">تاريخ الطلب (ميلادي)</label>
                <input type="date" id="ag-date-greg" class="input mono font-bold" value="${d}" style="padding:5px 10px; height:34px; border-radius:8px;" />
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
              <input type="text" id="ag-name" class="input font-bold" value="${t.name||""}" placeholder="اسم المحل / المؤسسة" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم السجل التجاري</label>
              <input type="text" id="ag-cr" class="input mono font-bold" value="${t.crNumber||t.nationalId||""}" placeholder="1010XXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">تاريخ السجل</label>
              <input type="text" id="ag-cr-date" class="input mono" value="${t.crDate||""}" placeholder="1445/01/01" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">مصدر السجل</label>
              <input type="text" id="ag-cr-source" class="input" value="${t.crSource||t.city||"ينبع"}" placeholder="ينبع / الرياض" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">المدينة</label>
              <input type="text" id="ag-city" class="input" value="${t.city||"ينبع"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الحي</label>
              <input type="text" id="ag-district" class="input" value="${t.district||""}" placeholder="اسم الحي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشارع</label>
              <input type="text" id="ag-street" class="input" value="${t.street||""}" placeholder="اسم الشارع الرئيسي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرمز البريدي</label>
              <input type="text" id="ag-postal" class="input mono" value="${t.postalCode||""}" placeholder="12345" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشكل القانوني</label>
              <select id="ag-legal-form" class="input">
                <option value="مؤسسة فردية" ${t.legalForm==="مؤسسة فردية"?"selected":""}>مؤسسة فردية</option>
                <option value="شركة ذات مسؤولية محدودة" ${t.legalForm==="شركة ذات مسؤولية محدودة"?"selected":""}>شركة ذات مسؤولية محدودة</option>
                <option value="شركة مساهمة مبسطة" ${t.legalForm==="شركة مساهمة مبسطة"?"selected":""}>شركة مساهمة مبسطة</option>
                <option value="شركة تضامنية" ${t.legalForm==="شركة تضامنية"?"selected":""}>شركة تضامنية</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">نوع النشاط</label>
              <input type="text" id="ag-activity" class="input" value="${t.activityType||"تجارة المواد الغذائية والتموينات"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">هاتف المنشأة</label>
              <input type="tel" id="ag-phone" class="input mono" value="${t.phone||""}" placeholder="014XXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم الجوال *</label>
              <input type="tel" id="ag-mobile" class="input mono font-bold" value="${t.mobile||t.phone||""}" placeholder="05XXXXXXXX" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمنشأة</label>
              <input type="email" id="ag-email" class="input mono" value="${t.email||""}" placeholder="store@example.com" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرقم الضريبي (VAT)</label>
              <input type="text" id="ag-vat" class="input mono font-bold" value="${t.vatNumber||""}" placeholder="300XXXXXXXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عدد الفروع</label>
              <input type="number" id="ag-branches" class="input mono" value="${t.branchCount||"1"}" min="1" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">صندوق البريد</label>
              <input type="text" id="ag-pobox" class="input mono" value="${t.poBox||""}" placeholder="ص.ب 1234" />
            </div>
          </div>
        </div>

        <!-- ثانياً: بيانات مالك المنشأة والمسؤول المفوض -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
          <!-- مالك المنشأة -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٢</span>
              <span>بيانات مالك المنشأة</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المالك رباعياً *</label>
              <input type="text" id="ag-owner-name" class="input font-bold" value="${t.ownerName||""}" placeholder="الاسم الكامل كما في الهوية" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية</label>
                <input type="text" id="ag-owner-id" class="input mono font-bold" value="${t.ownerId||""}" placeholder="10XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">تاريخها ومصدرها</label>
                <input type="text" id="ag-owner-id-source" class="input" value="${t.ownerIdSource||"ينبع"}" placeholder="أحوال ينبع" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم جوال المالك</label>
                <input type="tel" id="ag-owner-phone" class="input mono font-bold" value="${t.ownerPhone||t.phone||""}" placeholder="05XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">البريد الإلكتروني</label>
                <input type="email" id="ag-owner-email" class="input mono" value="${t.ownerEmail||""}" placeholder="owner@..." />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عنوان المالك</label>
              <input type="text" id="ag-owner-address" class="input" value="${t.ownerAddress||t.address||""}" placeholder="المدينة، الحي" />
            </div>
          </div>

          <!-- المدير المسؤول -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٣</span>
              <span>بيانات المسؤول (إذا كان غير المالك)</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المسؤول رباعياً</label>
              <input type="text" id="ag-mgr-name" class="input" value="${t.managerName||""}" placeholder="اسم المدير / المشرف المفوض" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية</label>
                <input type="text" id="ag-mgr-id" class="input mono" value="${t.managerId||""}" placeholder="2XXXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الجوال</label>
                <input type="tel" id="ag-mgr-phone" class="input mono" value="${t.managerPhone||""}" placeholder="05XXXXXXXX" />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمسؤول</label>
              <input type="email" id="ag-mgr-email" class="input mono" value="${t.managerEmail||""}" placeholder="manager@..." />
            </div>
            <div style="margin-top:14px; padding:8px 10px; background:rgba(2,132,199,0.06); border-radius:8px; font-size:11px; color:#004d80;">
              ℹ️ يلزم إرفاق صورة الوكالة الشرعية أو التفويض الرسمي في حال كان المسؤول غير المالك.
            </div>
          </div>
        </div>

        <!-- رابعاً: شروط الائتمان والاعتماد الرسمي -->
        <div class="card" style="padding:16px 18px; border-radius:14px; background:linear-gradient(135deg, rgba(0,77,128,0.06), rgba(2,132,199,0.04)); border:1.5px solid rgba(2,132,199,0.3);">
          <div style="font-size:13.5px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span style="background:#004d80; color:#fff; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">٤</span>
            <span>شروط التسهيل الائتماني والاعتمادات الرسمية</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr; gap:14px;">
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">مبلغ الائتمان المعتمد (ريال سعودي) *</label>
              <input type="number" id="ag-credit-limit" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${t.creditLimit||0}" step="500" min="0" />
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">فترة الائتمان المسموح بها (بالأيام) *</label>
              <input type="number" id="ag-credit-days" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${t.creditDays||30}" min="0" />
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1);">المندوب المسؤول / المشرف</label>
              <input type="text" id="ag-rep-name" class="input font-bold" value="${t.repName||""}" placeholder="اسم مندوب المنطقة" />
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">إغلاق</button>
        
        <div style="display:flex; gap:10px; align-items:center;">
          ${t.id?`
            <button class="btn btn-secondary" onclick="window.saveAgreementDataOnly()" title="حفظ البيانات المدخلة في ملف العميل مباشرة">
              💾 حفظ في ملف العميل
            </button>
            <button class="btn btn-secondary" style="background:rgba(124,58,237,0.1); color:#7C3AED; border-color:rgba(124,58,237,0.3);" onclick="window.issuePromissoryNoteFromAgreement('${t.id}', '${(t.name||"").replace(/'/g,"\\'")}')" title="الانتقال لإصدار سند لأمر نافذ">
              📜 إصدار سند لأمر
            </button>
          `:""}
          <button class="btn btn-primary" onclick="window.generateAndPrintCustomerAgreement()" style="padding:10px 26px; font-weight:900; font-size:13.5px; background:linear-gradient(135deg, #004d80, #006699, #0284c7); box-shadow:0 4px 16px rgba(2,132,199,0.35);">
            🖨️ طباعة الاتفاقية الرسمية (مطابقة للأصل)
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(o)}function g(){const e=document.getElementById("ag-type-update")?.checked;return{id:document.getElementById("ag-cust-id")?.value||"",requestType:e?"update":"open",requestTypeLabel:e?"طلب تحديث حساب":"طلب فتح حساب",dateGreg:document.getElementById("ag-date-greg")?.value||c(),dateHijri:y(),name:document.getElementById("ag-name")?.value.trim()||"",crNumber:document.getElementById("ag-cr")?.value.trim()||"",crDate:document.getElementById("ag-cr-date")?.value.trim()||"",crSource:document.getElementById("ag-cr-source")?.value.trim()||"",city:document.getElementById("ag-city")?.value.trim()||"",district:document.getElementById("ag-district")?.value.trim()||"",street:document.getElementById("ag-street")?.value.trim()||"",postalCode:document.getElementById("ag-postal")?.value.trim()||"",legalForm:document.getElementById("ag-legal-form")?.value||"مؤسسة فردية",activityType:document.getElementById("ag-activity")?.value.trim()||"",phone:document.getElementById("ag-phone")?.value.trim()||"",mobile:document.getElementById("ag-mobile")?.value.trim()||"",email:document.getElementById("ag-email")?.value.trim()||"",vatNumber:document.getElementById("ag-vat")?.value.trim()||"",branchCount:document.getElementById("ag-branches")?.value||"1",poBox:document.getElementById("ag-pobox")?.value.trim()||"",ownerName:document.getElementById("ag-owner-name")?.value.trim()||"",ownerId:document.getElementById("ag-owner-id")?.value.trim()||"",ownerIdDate:document.getElementById("ag-owner-id-date")?.value.trim()||"",ownerIdSource:document.getElementById("ag-owner-id-source")?.value.trim()||"",ownerPhone:document.getElementById("ag-owner-phone")?.value.trim()||"",ownerAddress:document.getElementById("ag-owner-address")?.value.trim()||"",ownerEmail:document.getElementById("ag-owner-email")?.value.trim()||"",managerName:document.getElementById("ag-mgr-name")?.value.trim()||"",managerId:document.getElementById("ag-mgr-id")?.value.trim()||"",managerPhone:document.getElementById("ag-mgr-phone")?.value.trim()||"",managerEmail:document.getElementById("ag-mgr-email")?.value.trim()||"",creditLimit:parseFloat(document.getElementById("ag-credit-limit")?.value)||0,creditDays:parseInt(document.getElementById("ag-credit-days")?.value)||0,repName:document.getElementById("ag-rep-name")?.value.trim()||""}}window.saveAgreementDataOnly=async()=>{const e=g();if(!e.id){n("لا يمكن الحفظ بدون كود عميل مسجل","warning");return}try{await v("customers",e.id,{name:e.name,crNumber:e.crNumber,nationalId:e.crNumber,vatNumber:e.vatNumber,city:e.city,district:e.district,street:e.street,postalCode:e.postalCode,phone:e.phone,mobile:e.mobile,email:e.email,creditLimit:e.creditLimit,creditDays:e.creditDays,ownerName:e.ownerName,ownerId:e.ownerId,ownerPhone:e.ownerPhone,ownerAddress:e.ownerAddress,ownerEmail:e.ownerEmail,managerName:e.managerName,managerId:e.managerId,managerPhone:e.managerPhone,managerEmail:e.managerEmail,legalForm:e.legalForm,activityType:e.activityType,updatedAt:new Date().toISOString()}),n("✅ تم حفظ وتحديث بيانات الاتفاقية في ملف العميل بنجاح","success")}catch(a){n("خطأ في حفظ البيانات: "+a.message,"error")}};window.issuePromissoryNoteFromAgreement=(e,a)=>{const t=document.getElementById("cust-agreement-modal-overlay");t&&t.remove(),typeof window.issuePromissoryNote=="function"&&window.issuePromissoryNote(e,a)};window.generateAndPrintCustomerAgreement=()=>{const e=g(),a="شركة نظم الإمداد المتطورة",t="تجارة وتوريد المواد الغذائية بالجملة",i="ينبع - المملكة العربية السعودية",d="Advanced Supply Systems Company",o="Food Wholesale Supply",r="Yanbu - Kingdom of Saudi Arabia",m="+966 55 682 8248",b="info@supplysa.com",u="www.supplysa.com",s=e.requestType==="open"?"checked":"",p=e.requestType==="update"?"checked":"",l=window.open("","_blank");if(!l){n("يرجى السماح بالنوافذ المنبثقة للطباعة","error");return}const f=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>اتفاقية فتح / تحديث حساب عميل — ${e.name||"نموذج رسمي"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: A4 portrait;
      margin: 4mm 6mm 4mm 6mm;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      font-size: 9.5px;
      color: #0f172a;
      background: #fff;
      direction: rtl;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-sheet {
      width: 100%;
      max-width: 200mm;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 288mm;
      justify-content: space-between;
      position: relative;
    }

    /* ── الهيدر واللوجو والشريط العلوي ── */
    .top-brand-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px 6px;
      position: relative;
    }
    .brand-col-ar { text-align: right; flex: 1.2; }
    .brand-title-ar { font-size: 14.5px; font-weight: 900; color: #004d80; line-height: 1.2; }
    .brand-sub-ar   { font-size: 9.5px; font-weight: 800; color: #0f172a; margin-top: 1px; }
    .brand-city-ar  { font-size: 9px; font-weight: 700; color: #475569; }

    .brand-col-logo { text-align: center; flex: 0.9; }
    .logo-badge {
      display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .logo-badge svg { width: 46px; height: 46px; }
    .logo-badge-title { font-size: 8px; font-weight: 900; color: #004d80; margin-top: 2px; }
    .logo-badge-en    { font-size: 5.5px; font-weight: 800; color: #64748b; letter-spacing: 0.3px; }

    .brand-col-en { text-align: left; direction: ltr; flex: 1.2; }
    .brand-title-en { font-size: 12px; font-weight: 900; color: #004d80; line-height: 1.2; }
    .brand-sub-en   { font-size: 8.5px; font-weight: 800; color: #0f172a; margin-top: 1px; }
    .brand-city-en  { font-size: 8px; font-weight: 600; color: #475569; }

    /* ── الخط الأزرق المتعرج / الفاصل ── */
    .hdr-divider {
      height: 3px;
      background: linear-gradient(90deg, #004d80 0%, #0284c7 50%, #004d80 100%);
      border-radius: 2px;
      margin-bottom: 5px;
    }

    /* ── شريط عنوان الوثيقة ── */
    .title-banner-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
      padding: 0 4px;
    }
    .date-block { font-size: 9px; font-weight: 800; color: #0f172a; }
    .doc-main-heading-wrap { text-align: center; }
    .doc-main-heading { font-size: 15px; font-weight: 900; color: #004d80; line-height: 1.1; }
    .doc-main-heading-en { font-size: 9px; font-weight: 700; color: #004d80; direction: ltr; margin-top: 1px; }
    .types-select-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      margin: 3px 0 6px;
      font-size: 10px;
      font-weight: 900;
      color: #0f172a;
    }
    .box-check {
      display: inline-block; width: 14px; height: 14px; border: 1.8px solid #004d80;
      border-radius: 3px; vertical-align: middle; margin-left: 5px; position: relative;
    }
    .box-check.checked::after {
      content: "✔"; position: absolute; top: -3px; left: 1.5px; font-size: 11px; color: #004d80; font-weight: 900;
    }

    /* ── خطاب التقديم ── */
    .salutation-block {
      font-size: 9.5px;
      line-height: 1.45;
      margin-bottom: 6px;
      padding: 3px 6px;
    }
    .salutation-block .firm-name {
      font-size: 11px; font-weight: 900; color: #004d80; text-decoration: underline;
    }

    /* ── الصندوقين المتجاورين (المستندات المطلوبة + تعهدات العميل) ── */
    .dual-box-row {
      display: flex;
      gap: 8px;
      margin-bottom: 7px;
    }
    .box-card {
      flex: 1;
      border: 1.5px solid #0284c7;
      border-radius: 12px;
      padding: 14px 10px 8px;
      position: relative;
      background: #fff;
    }
    .pill-title {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #004d80;
      color: #fff;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 18px;
      border-radius: 20px;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    .bullet-list {
      list-style: none;
      font-size: 8px;
      line-height: 1.35;
      color: #0f172a;
    }
    .bullet-list li {
      position: relative;
      padding-right: 14px;
      margin-bottom: 2px;
    }
    .bullet-list li:last-child { margin-bottom: 0; }
    .bullet-list li::before {
      content: attr(data-num) ".";
      position: absolute;
      right: 0;
      font-weight: 900;
      color: #004d80;
    }

    /* ── شريط عنوان قسم بيانات العميل ── */
    .section-pill-hdr {
      text-align: center;
      margin-bottom: 4px;
    }
    .section-pill-hdr span {
      background: #004d80;
      color: #fff;
      font-size: 10.5px;
      font-weight: 900;
      padding: 3px 28px;
      border-radius: 20px;
      display: inline-block;
    }

    /* ── تبويبات الأقسام الفرعية ── */
    .sub-pill-right {
      background: #004d80;
      color: #fff;
      font-size: 9px;
      font-weight: 900;
      padding: 2.5px 14px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 3px;
    }

    /* ── الجداول الزرقاء المتناسقة ── */
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
      font-size: 8.5px;
    }
    .custom-table th, .custom-table td {
      border: 1.2px solid #0284c7;
      padding: 2.5px 6px;
      text-align: right;
      height: 18px;
      vertical-align: middle;
    }
    .custom-table th {
      background: #e0f2fe;
      font-weight: 900;
      color: #004d80;
      white-space: nowrap;
    }
    .custom-table td {
      background: #fff;
      font-weight: 700;
      color: #0f172a;
    }
    .custom-table .val-strong { font-size: 9.5px; font-weight: 900; color: #004d80; }
    .custom-table .mono { font-family: monospace; font-size: 9.5px; }

    /* ── القسم السفلي: للاستخدام الرسمي ── */
    .official-approval-box {
      border: 1.5px solid #0284c7;
      border-radius: 12px;
      padding: 12px 10px 6px;
      position: relative;
      background: #fff;
      margin-top: 8px;
      margin-bottom: 4px;
    }
    .official-terms-line {
      font-size: 8.5px;
      font-weight: 900;
      color: #004d80;
      margin-bottom: 4px;
      line-height: 1.35;
    }
    .approval-grid-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      margin-bottom: 4px;
    }
    .approval-grid-table th, .approval-grid-table td {
      border: 1.2px solid #0284c7;
      padding: 2px 6px;
      text-align: center;
      height: 16px;
    }
    .approval-grid-table th {
      background: #e0f2fe;
      font-weight: 900;
      color: #004d80;
    }
    .approval-grid-table td { font-weight: 700; }

    .bottom-sig-seal-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
      font-size: 8.5px;
      font-weight: 900;
    }

    /* ── الفوتر السفلي الكحلي ── */
    .bottom-blue-footer {
      background: #004d80;
      color: #fff;
      border-radius: 6px;
      padding: 4px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5px;
      font-weight: 700;
      margin-top: 3px;
    }
    .ftr-slogan { font-weight: 900; font-size: 9px; color: #facc15; }
  </style>
</head>
<body>

<div class="page-sheet">
  <div>
    <!-- الهيدر العلوي المتطابق -->
    <div class="top-brand-hdr">
      <div class="brand-col-en">
        <div class="brand-title-en">${d}</div>
        <div class="brand-sub-en">${o}</div>
        <div class="brand-city-en">${r}</div>
      </div>

      <div class="brand-col-logo">
        <div class="logo-badge">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="#004d80" stroke-width="4" fill="#e0f2fe"/>
            <path d="M24 64V44L50 28L76 44V64H24Z" fill="#004d80"/>
            <rect x="34" y="48" width="12" height="16" fill="#fff"/>
            <rect x="54" y="48" width="12" height="16" fill="#fff"/>
            <path d="M20 68H80V72H20V68Z" fill="#0284c7"/>
          </svg>
          <div class="logo-badge-title">${a}</div>
          <div class="logo-badge-en">ADVANCED SUPPLY SYSTEMS COMPANY</div>
        </div>
      </div>

      <div class="brand-col-ar">
        <div class="brand-title-ar">${a}</div>
        <div class="brand-sub-ar">${t}</div>
        <div class="brand-city-ar">${i}</div>
      </div>
    </div>

    <!-- خط فاصل -->
    <div class="hdr-divider"></div>

    <!-- التاريخ والعنوان الرئيسي -->
    <div class="title-banner-row">
      <div class="date-block">
        الموافق: &nbsp; ${e.dateHijri} / &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; هـ
      </div>
      <div class="doc-main-heading-wrap">
        <div class="doc-main-heading">اتفاقية فتح / تحديث حساب عميل</div>
        <div class="doc-main-heading-en">Customer Account Opening / Update Agreement</div>
      </div>
      <div class="date-block" style="text-align:left; direction:ltr;">
        التاريخ: &nbsp; ${e.dateGreg} م
      </div>
    </div>

    <!-- خيارات نوع الطلب بالمنتصف -->
    <div class="types-select-row">
      <div><span class="box-check ${p}"></span> طلب تحديث حساب</div>
      <div><span class="box-check ${s}"></span> طلب فتح حساب</div>
    </div>

    <!-- خطاب التقديم والتعهد -->
    <div class="salutation-block">
      <strong>السادة / ${a}</strong> &nbsp; المحترمين ،،<br />
      تحية طيبة وبعد ،،<br />
      رغبة منا في التعامل مع شركتكم، نرجو التكرم باعتماد طلب &nbsp; 
      <span class="box-check ${s}"></span> فتح حساب &nbsp;&nbsp; 
      <span class="box-check ${p}"></span> تحديث حساب &nbsp; 
      للمنشأة (الاسم التجاري): <span class="firm-name">${e.name||"________________________________________________________"}</span> &nbsp; وعليه نلتزم بالتالي:
    </div>

    <!-- الصندوقين المتجاورين (المستندات المطلوبة + تعهدات العميل) -->
    <div class="dual-box-row">
      <!-- تعهدات العميل (على اليمين في الصورة) -->
      <div class="box-card">
        <div class="pill-title">تعهدات العميل</div>
        <ol class="bullet-list">
          <li data-num="1">سداد الفواتير المستحقة لكم خلال فترة التسهيل المتفق عليها.</li>
          <li data-num="2">في حال عدم السداد في الوقت المحدد والمتفق عليه، فإن ذلك يسقط أي حق لنا في المطالبة بالعروض والخصومات المقدمة منكم، سواء كانت شهرية أو سنوية، دون الإخلال بحقكم في المطالبة بالسداد.</li>
          <li data-num="3">نتعهد بأن نكون مسؤولين عن جميع الشيكات الصادرة من قبلنا لكم دون تأخير.</li>
          <li data-num="4">بعد استلامنا للبضاعة من شركتكم، تكون مسؤولية تصريفها في حالة فسادها أو انتهاء صلاحيتها لدينا، ولا يحق لنا الرجوع عليكم بشيء، ولا يوجد استرداد لها كونها مواد سريعة التلف بطبيعتها.</li>
          <li data-num="5">نلتزم بسداد كامل رصيد حسابنا فوراً في حال بيع المنشأة أو تصفيتها أو الدخول في الشراكة أو تغيير الإدارة، وتكون الجهة المسؤولة أمامكم عن سداد كامل المديونية في جميع الأحوال.</li>
        </ol>
      </div>

      <!-- المستندات المطلوبة (على اليسار في الصورة) -->
      <div class="box-card">
        <div class="pill-title">المستندات المطلوبة</div>
        <ol class="bullet-list">
          <li data-num="1">صورة من السجل التجاري ساري المفعول.</li>
          <li data-num="2">صورة من السجل الضريبي.</li>
          <li data-num="3">صورة من رخصة المحل سارية المفعول.</li>
          <li data-num="4">صورة من هوية صاحب المحل / المؤسسة / الشركة أو الشخص المفوض بموجب صك أو بموجب السجل التجاري، سارية المفعول وموقعة من حاملها.</li>
          <li data-num="5">سند لأمر إلكتروني مصدق عن طريق منصة نافذ.</li>
          <li data-num="6">إرفاق أصل فاتورة العميل.</li>
          <li data-num="7">صورة للمحل من الداخل والخارج.</li>
          <li data-num="8">صورة من العنوان الوطني للمالك والمنشأة.</li>
        </ol>
      </div>
    </div>

    <!-- عنوان القسم الأوسط: بيانات العميل -->
    <div class="section-pill-hdr">
      <span>بيانات العميل</span>
    </div>

    <!-- أولاً: بيانات المنشأة -->
    <div class="sub-pill-right">أولاً: بيانات المنشأة</div>
    <table class="custom-table">
      <tr>
        <th style="width:14%;">الاسم التجاري</th>
        <td colspan="5" class="val-strong">${e.name||""}</td>
      </tr>
      <tr>
        <th>رقم السجل التجاري</th>
        <td class="mono val-strong" style="width:22%;">${e.crNumber||""}</td>
        <th style="width:10%;">تاريخه :</th>
        <td class="mono" style="width:20%;">${e.crDate||"/ &nbsp;&nbsp;&nbsp; /"}</td>
        <th style="width:10%;">مصدره :</th>
        <td style="width:24%;">${e.crSource||""}</td>
      </tr>
      <tr>
        <th>عنوان المنشأة</th>
        <td colspan="5">
          المدينة : <strong class="val-strong">${e.city||""}</strong> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
          الحي : <strong class="val-strong">${e.district||""}</strong> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
          الشارع : <strong class="val-strong">${e.street||""}</strong>
        </td>
      </tr>
      <tr>
        <th>الشكل القانوني للمنشأة</th>
        <td>${e.legalForm}</td>
        <th colspan="2">عدد الفروع التابعة للمنشأة</th>
        <td colspan="2" class="mono">${e.branchCount}</td>
      </tr>
      <tr>
        <th>نوع النشاط</th>
        <td>${e.activityType||""}</td>
        <th colspan="2">رقم الفاكس</th>
        <td colspan="2" class="mono">${e.fax||"—"}</td>
      </tr>
      <tr>
        <th>رقم هاتف المنشأة</th>
        <td class="mono">${e.phone||""}</td>
        <th colspan="2">رقم الجوال</th>
        <td colspan="2" class="mono val-strong">${e.mobile||e.phone||""}</td>
      </tr>
      <tr>
        <th>صندوق البريد</th>
        <td class="mono">${e.poBox||"—"}</td>
        <th colspan="2">الرمز البريدي</th>
        <td colspan="2" class="mono">${e.postalCode||""}</td>
      </tr>
      <tr>
        <th>البريد الإلكتروني للمنشأة</th>
        <td colspan="5" class="mono">${e.email||""}</td>
      </tr>
    </table>

    <!-- ثانياً وثالثاً: بيانات المالك والمسؤول (عمودين متجاورين متطابقين مع الصورة) -->
    <div style="display:flex; gap:8px;">
      <!-- ثانياً: بيانات مالك المنشأة (يمين) -->
      <div style="flex:1;">
        <div class="sub-pill-right">ثانياً: بيانات مالك المنشأة</div>
        <table class="custom-table">
          <tr>
            <th style="width:25%;">اسم المالك رباعياً</th>
            <td colspan="3" class="val-strong">${e.ownerName||""}</td>
          </tr>
          <tr>
            <th>رقم الهوية</th>
            <td class="mono val-strong">${e.ownerId||""}</td>
            <th style="width:12%;">تاريخها:</th>
            <td class="mono">${e.ownerIdDate||"/ &nbsp; /"}</td>
          </tr>
          <tr>
            <th>مصدرها:</th>
            <td colspan="3">${e.ownerIdSource||""}</td>
          </tr>
          <tr>
            <th>رقم جوال المالك</th>
            <td colspan="3" class="mono val-strong">${e.ownerPhone||""}</td>
          </tr>
          <tr>
            <th>عنوان المالك</th>
            <td colspan="3">${e.ownerAddress||""}</td>
          </tr>
          <tr>
            <th>البريد الإلكتروني للمالك</th>
            <td colspan="3" class="mono">${e.ownerEmail||""}</td>
          </tr>
          <tr>
            <th>نموذج التوقيع</th>
            <td colspan="3" style="height:24px; text-align:center; color:#94a3b8;"></td>
          </tr>
        </table>
      </div>

      <!-- ثالثاً: بيانات المسؤول عن المنشأة (يسار) -->
      <div style="flex:1;">
        <div class="sub-pill-right">ثالثاً: بيانات المسؤول عن المنشأة <span style="font-size:7.5px; font-weight:600;">(تعبأ إذا كان المسؤول غير المالك - يلزم إرفاق الوكالة)</span></div>
        <table class="custom-table">
          <tr>
            <th style="width:25%;">اسم المسؤول رباعياً</th>
            <td colspan="3" class="val-strong">${e.managerName||""}</td>
          </tr>
          <tr>
            <th>رقم الهوية</th>
            <td class="mono val-strong">${e.managerId||""}</td>
            <th style="width:12%;">تاريخها:</th>
            <td class="mono">${e.managerIdDate||"/ &nbsp; /"}</td>
          </tr>
          <tr>
            <th>مصدرها:</th>
            <td colspan="3">${e.managerIdSource||""}</td>
          </tr>
          <tr>
            <th>رقم جوال المسؤول</th>
            <td colspan="3" class="mono val-strong">${e.managerPhone||""}</td>
          </tr>
          <tr>
            <th>البريد الإلكتروني</th>
            <td colspan="3" class="mono">${e.managerEmail||""}</td>
          </tr>
          <tr>
            <th>نموذج التوقيع</th>
            <td colspan="3" style="height:48px; text-align:center; color:#94a3b8;"></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- للاستخدام الرسمي -->
    <div class="official-approval-box">
      <div class="pill-title">للاستخدام الرسمي</div>
      <div class="official-terms-line">
        يوافق على فتح حساب للمنشأة بالأجل، وفقاً للشروط والأحكام المعتمدة في حدود :<br />
        مبلغ الائتمان المعتمد : <strong style="color:#004d80; font-size:11px; font-family:monospace;">${x(e.creditLimit)}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        وفترة الائتمان المسموح بها : <strong style="color:#004d80; font-size:11px; font-family:monospace;">${e.creditDays}</strong> &nbsp; يوم.
      </div>

      <table class="approval-grid-table">
        <thead>
          <tr>
            <th style="width:22%;">معتمد من</th>
            <th style="width:39%;">الاسم والتوقيع</th>
            <th style="width:39%;">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>محاسب المنطقة</td><td></td><td></td></tr>
          <tr><td>المدير الإقليمي / مدير الفرع</td><td></td><td></td></tr>
          <tr><td>مدير عام المبيعات</td><td></td><td></td></tr>
          <tr><td>الإدارة المالية</td><td></td><td></td></tr>
          <tr><td>قسم المراجعة</td><td></td><td></td></tr>
        </tbody>
      </table>

      <div class="bottom-sig-seal-row">
        <div>اسم مالك المنشأة : &nbsp; <strong>${e.ownerName||e.name||"_________________________________"}</strong></div>
        <div>التوقيع : &nbsp; _______________________</div>
        <div>تصديق الغرفة التجارية : &nbsp; [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</div>
      </div>
    </div>
  </div>

  <!-- الفوتر السفلي المتطابق باللون الكحلي -->
  <div class="bottom-blue-footer">
    <div>📞 ${m}</div>
    <div>✉️ ${b}</div>
    <div>🌐 ${u}</div>
    <div>📍 ${i}</div>
    <div class="ftr-slogan">معاً .. نحو إمداد أفضل</div>
  </div>
</div>

<script>
  window.onload = function() {
    window.print();
  };
<\/script>

</body>
</html>`;l.document.open(),l.document.write(f),l.document.close()};export{_ as o};
