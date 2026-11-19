import{h as H,t as z,d as q,a as G,b as N,g as _,C as U,f as V}from"./index-CF9GFeRJ.js";import{getDoc as O,doc as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const P=(...d)=>window.showToast?window.showToast(...d):console.log(...d);function M(d=new Date){try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"numeric",year:"numeric"}).format(d).replace(/هـ/g,"").trim()}catch{return""}}async function j(d,l={}){let e=null;if(typeof d=="object"&&d!==null)e=d;else if(typeof d=="string"&&d)try{e=await H("customers",d)}catch(o){console.warn("Failed to fetch customer by ID for debt acknowledgment:",o)}const w=document.getElementById("debt-ack-modal-overlay");w&&w.remove();const I=z(),g=l.amount!==void 0?parseFloat(l.amount):e?parseFloat(e.balance||0):0,b=l.asOfDate||I;let p=l.dueDate;if(!p){const o=new Date;o.setDate(o.getDate()+15),p=o.toISOString().slice(0,10)}let $={name:"شركة نظم الإمداد المتطورة",crNumber:"7054969006",vatNumber:"314996148100003",city:"ينبع",phone:"0549141648",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414"};try{const o=window.ERP_COMPANY||JSON.parse(localStorage.getItem("idham_company")||"{}");o.name&&Object.assign($,o);const a=await O(Y(q,`companies/${G}/settings`,"company"));a.exists()&&Object.assign($,a.data())}catch{}const m=document.createElement("div");m.className="modal-overlay active",m.id="debt-ack-modal-overlay",m.style.zIndex="9999",m.innerHTML=`
    <div class="modal-box" style="max-width:760px; width:95%; max-height:92vh; display:flex; flex-direction:column; border-radius:16px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35); background:var(--bg-card); border:1px solid var(--border);">
      
      <!-- Modal Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); color:#fff; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; font-size:20px;">⚖️</div>
          <div>
            <h3 style="margin:0; font-size:16.5px; font-weight:900; letter-spacing:0.3px;">إقرار مديونية وتعهد بالتزام السداد</h3>
            <div style="font-size:11.5px; color:#e0f2fe; margin-top:2px;">سند إقرار مالي رسمي وقضائي ملزم لحفظ وتأمين حقوق الشركة</div>
          </div>
        </div>
        <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('debt-ack-modal-overlay').remove()" style="color:#fff; font-size:20px; line-height:1; border:none; background:transparent; cursor:pointer;">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px;">
        
        <!-- Customer Selection / Data Header -->
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 18px;">
          <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:6px; display:block;">العميل (المدين المقر) *</label>
          <div style="position:relative;">
            <input type="text" id="da-cust-search" class="input font-bold" 
                   value="${e?e.name:""}" 
                   placeholder="🔍 ابحث عن العميل بالاسم أو رقم الهاتف..." 
                   autocomplete="off" 
                   onfocus="window.searchDaCustomer(this.value)"
                   oninput="window.searchDaCustomer(this.value)"
                   style="height:42px; font-size:14px;" />
            <div id="da-cust-dropdown" style="position:absolute; top:calc(100% + 4px); right:0; left:0; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; z-index:500; max-height:220px; overflow-y:auto; display:none; box-shadow:0 12px 30px rgba(0,0,0,0.25);"></div>
          </div>
          <input type="hidden" id="da-cust-id" value="${e?e.id:""}" />
        </div>

        <!-- Financial Terms Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          
          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">المبلغ المقر به (ريال سعودي) *</label>
            <input type="number" id="da-amount" class="input mono font-bold" 
                   value="${g>0?g:""}" 
                   placeholder="0.00" step="0.01" min="0.01" required
                   style="font-size:18px; color:#b91c1c; height:44px;" 
                   oninput="window.updateDaTafqeet(this.value)" />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">المطابقة حتى تاريخ *</label>
            <input type="date" id="da-as-of-date" class="input" value="${b}" style="height:44px;" />
          </div>

          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:11.5px; font-weight:800; color:var(--text-2); margin-bottom:4px; display:block;">المبلغ تفقيطاً بالكلمات (تلقائي)</label>
            <input type="text" id="da-amount-words" class="input" readonly 
                   value="${g>0?N(g):"—"}"
                   style="background:var(--bg-2); font-weight:700; color:var(--text-1); font-size:12.5px;" />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:#0369a1; margin-bottom:4px; display:block;">تاريخ الاستحقاق المتعهد به (موعد السداد الأقصى) *</label>
            <input type="date" id="da-due-date" class="input" value="${p}" style="height:42px; border-color:#0284c7;" required />
          </div>

          <div class="form-group">
            <label style="font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:4px; display:block;">طريقة السداد المتعهد بها</label>
            <select id="da-pay-method" class="input" style="height:42px;">
              <option value="حوالة بنكية معتمدة على الحساب الرسمي">حوالة بنكية معتمدة على الحساب الرسمي</option>
              <option value="نقداً بموجب سند قبض رسمي">نقداً بموجب سند قبض رسمي</option>
              <option value="شيك مصرفي واجب الصرف">شيك مصرفي واجب الصرف</option>
            </select>
          </div>

        </div>

        <!-- Customer Identity Details (Auto-filled & Editable) -->
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 18px;">
          <div style="font-size:12px; font-weight:900; color:var(--brand); margin-bottom:10px;">📋 البيانات الرسمية الموثقة للمدين (المختار للتبليغ القضائي)</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم السجل التجاري / الهوية الوطنية</label>
              <input type="text" id="da-cust-id-num" class="input mono font-bold" value="${e&&(e.crNumber||e.idNumber||e.nationalId)||""}" placeholder="1234567890" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم الهاتف / الجوال المعتمد</label>
              <input type="text" id="da-cust-phone" class="input mono font-bold" value="${e&&(e.phone||e.mobile)||""}" placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">الرقم الضريبي (VAT)</label>
              <input type="text" id="da-cust-vat" class="input mono" value="${e&&e.vatNumber||""}" placeholder="300000000000003" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">العنوان الوطني المعتمد (المدينة، الحي)</label>
              <input type="text" id="da-cust-address" class="input" value="${e?[e.address,e.street,e.district,e.city,e.postalCode].filter(Boolean).join(" — ")||e.city||"":"ينبع — المملكة العربية السعودية"}" placeholder="ينبع — شارع … — حي …" />
            </div>
          </div>

          <!-- Dedicated Authorized Signatory Card -->
          <div style="margin-top:12px; padding:10px 14px; background:rgba(2,132,199,0.06); border:1px solid rgba(2,132,199,0.25); border-radius:10px;">
            <div style="font-size:11.5px; font-weight:800; color:#0284c7; margin-bottom:8px;">✍️ بيانات المفوض بالتوقيع والالتزام القانوني (المسؤول النظامي)</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">اسم المفوض بالتوقيع</label>
                <input type="text" id="da-cust-resp" class="input" value="${e&&(e.ownerName||e.contactPerson||e.managerName||e.responsiblePerson||e.name)||""}" placeholder="اسم المدير / المسؤول المفوض" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم هوية المفوض</label>
                <input type="text" id="da-cust-resp-id" class="input mono font-bold" value="${e&&(e.responsiblePersonId||e.ownerId)||""}" placeholder="10xxxxxxxx" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">صفة المفوض</label>
                <input type="text" id="da-cust-resp-role" class="input" value="${e&&e.responsiblePersonRole||"المدير العام المفوض"}" placeholder="المدير العام / الوكيل الشرعي" />
              </div>
              <div>
                <label style="font-size:10.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">جوال المفوض</label>
                <input type="text" id="da-cust-resp-phone" class="input mono font-bold" value="${e&&(e.responsiblePersonPhone||e.phone)||""}" placeholder="05xxxxxxxx" />
              </div>
            </div>
          </div>
        </div>

        <!-- Guarantor Details (Optional) -->
        <div style="background:rgba(79,70,229,0.04); border:1px solid rgba(79,70,229,0.2); border-radius:12px; padding:12px 18px;">
          <div style="font-size:12px; font-weight:800; color:#4f46e5; margin-bottom:8px;">🤝 بيانات الكفيل الغارم المتضامن (اختياري لتعزيز التحصيل والضمان)</div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:10px;">
            <input type="text" id="da-guar-name" class="input" value="${e&&(e.guarantor||e.guarantorName)||""}" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12px;" />
            <input type="text" id="da-guar-id" class="input mono" value="${e&&e.guarantorId||""}" placeholder="رقم هوية الكفيل" style="font-size:12px;" />
            <input type="text" id="da-guar-phone" class="input mono" value="${e&&e.guarantorPhone||""}" placeholder="جوال الكفيل" style="font-size:12px;" />
          </div>
        </div>

        <!-- Notes / Ref -->
        <div>
          <label style="font-size:11.5px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">ملاحظات / أرقام الفواتير وسندات التسليم المسحوبة</label>
          <textarea id="da-notes" class="input" rows="2" style="resize:vertical;" placeholder="بموجب فواتير المبيعات المسحوبة وسندات التسليم المؤرخة...">${l.notes||""}</textarea>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('debt-ack-modal-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" onclick="window.submitAndPrintDebtAcknowledgment()" style="padding:10px 24px; font-weight:800; font-size:13.5px; background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); border:none; box-shadow:0 4px 14px rgba(2,132,199,0.35); display:inline-flex; align-items:center; gap:8px;">
          <span>🖨️</span> <span>طباعة وتوليد الإقرار الرسمي الموثق</span>
        </button>
      </div>

    </div>
  `,document.body.appendChild(m),window.updateDaTafqeet=o=>{const a=parseFloat(o),i=document.getElementById("da-amount-words");i&&(i.value=a&&!isNaN(a)&&a>0?N(a):"—")},window.searchDaCustomer=async o=>{const a=document.getElementById("da-cust-dropdown");if(!a)return;const i=(o||"").trim().toLowerCase();try{const f=(await _(U.customers())).filter(t=>!i||(t.name||"").toLowerCase().includes(i)||(t.phone||"").includes(i)||(t.idNumber||"").includes(i)||(t.crNumber||"").includes(i)).slice(0,10);if(!f.length){a.innerHTML='<div style="padding:10px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد عميل مطابق</div>',a.style.display="block";return}a.innerHTML=f.map(t=>{const y=(t.name||"").replace(/'/g,"\\'"),x=[t.address,t.street,t.district,t.city].filter(Boolean).join(" — ").replace(/'/g,"\\'"),c=t.idNumber||t.crNumber||"",n=t.phone||t.mobile||"",r=t.vatNumber||"",s=(t.ownerName||t.contactPerson||t.managerName||t.responsiblePerson||t.name||"").replace(/'/g,"\\'"),v=(t.guarantor||t.guarantorName||"").replace(/'/g,"\\'"),k=(t.guarantorId||"").replace(/'/g,"\\'"),B=(t.guarantorPhone||"").replace(/'/g,"\\'");return`
          <div class="autocomplete-item" 
               onclick="window.selectDaCustomer('${t.id}', '${y}', '${c}', '${n}', '${r}', '${s}', '${x}', ${t.balance||0}, '${v}', '${k}', '${B}')"
               style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--text-1); font-size:13px;">${t.name}</strong>
              <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${c?"سجل/هوية: "+c:""} ${n?" | هاتف: "+n:""}</div>
            </div>
            <div class="mono font-bold" style="font-size:12px; color:${(t.balance||0)>0?"#b91c1c":"#059669"};">
              ${V(t.balance||0)}
            </div>
          </div>
        `}).join(""),a.style.display="block"}catch{}},window.selectDaCustomer=(o,a,i,u,f,t,y,x,c,n,r)=>{document.getElementById("da-cust-search").value=a,document.getElementById("da-cust-id").value=o,document.getElementById("da-cust-id-num")&&(document.getElementById("da-cust-id-num").value=i),document.getElementById("da-cust-phone")&&(document.getElementById("da-cust-phone").value=u),document.getElementById("da-cust-vat")&&(document.getElementById("da-cust-vat").value=f),document.getElementById("da-cust-resp")&&(document.getElementById("da-cust-resp").value=t),document.getElementById("da-cust-address")&&(document.getElementById("da-cust-address").value=y),document.getElementById("da-guar-name")&&(document.getElementById("da-guar-name").value=c||""),document.getElementById("da-guar-id")&&(document.getElementById("da-guar-id").value=n||""),document.getElementById("da-guar-phone")&&(document.getElementById("da-guar-phone").value=r||"");const s=document.getElementById("da-amount");s&&(!s.value||parseFloat(s.value)<=0)&&x>0&&(s.value=x,window.updateDaTafqeet(x));const v=document.getElementById("da-cust-dropdown");v&&(v.style.display="none")},document.addEventListener("click",o=>{if(!o.target.closest("#da-cust-search")&&!o.target.closest("#da-cust-dropdown")){const a=document.getElementById("da-cust-dropdown");a&&(a.style.display="none")}}),window.submitAndPrintDebtAcknowledgment=()=>{const o=document.getElementById("da-cust-search")?.value.trim();if(!o){P("يرجى اختيار العميل أولاً","warn");return}const a=parseFloat(document.getElementById("da-amount")?.value||0);if(!a||isNaN(a)||a<=0){P("يرجى إدخال مبلغ صحيح للإقرار","warn");return}const i={custName:o,custIdNum:document.getElementById("da-cust-id-num")?.value.trim()||"—",custPhone:document.getElementById("da-cust-phone")?.value.trim()||"—",custVat:document.getElementById("da-cust-vat")?.value.trim()||"—",custResp:document.getElementById("da-cust-resp")?.value.trim()||o,custRespId:document.getElementById("da-cust-resp-id")?.value.trim()||"",custRespRole:document.getElementById("da-cust-resp-role")?.value.trim()||"المدير العام المفوض",custRespPhone:document.getElementById("da-cust-resp-phone")?.value.trim()||"",custAddress:document.getElementById("da-cust-address")?.value.trim()||"المملكة العربية السعودية",amount:a,amountWords:document.getElementById("da-amount-words")?.value||N(a),asOfDate:document.getElementById("da-as-of-date")?.value||z(),dueDate:document.getElementById("da-due-date")?.value||z(),payMethod:document.getElementById("da-pay-method")?.value||"حوالة بنكية معتمدة على الحساب الرسمي",guarName:document.getElementById("da-guar-name")?.value.trim()||"",guarId:document.getElementById("da-guar-id")?.value.trim()||"",guarPhone:document.getElementById("da-guar-phone")?.value.trim()||"",notes:document.getElementById("da-notes")?.value.trim()||"",co:$};W(i)}}async function W(d){const{custName:l,custIdNum:e,custPhone:w,custVat:I,custResp:g,custRespId:b,custRespRole:p,custRespPhone:$,custAddress:m,amount:o,amountWords:a,asOfDate:i,dueDate:u,payMethod:f,guarName:t,guarId:y,guarPhone:x,notes:c,co:n}=d,r=n?.name||"شركة نظم الإمداد المتطورة",s=n?.crNumber||n?.cr||"7054969006",v=n?.vatNumber||"314996148100003",k=n?.phone||"0549141648",B=n?.address||"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414";let h="";try{const L=await(await fetch("/icons/company-stamp.png?t="+Date.now())).blob();h=await new Promise(F=>{const D=new FileReader;D.onload=()=>F(D.result),D.readAsDataURL(L)})}catch{}const A=`ACK-${z().replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,S=M(new Date(i)),C=M(new Date(u)),E=window.open("","_blank","width=850,height=950");if(!E){P("يرجى السماح بالنوافذ المنبثقة للطباعة","error");return}const T=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إقرار مديونية وتعهد سداد — ${l}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Cairo', 'Arial', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      direction: rtl;
      padding: 24px;
      font-size: 12.5px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border: 3px double #004d80;
      border-radius: 12px;
      padding: 26px 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      position: relative;
    }

    /* Top Action (Print helper) */
    .no-print {
      margin-bottom: 14px;
      text-align: center;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn-print {
      background: #004d80;
      color: #fff;
      font-weight: 800;
      border: none;
      padding: 9px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #004d80;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .hdr-col { flex: 1; }
    .hdr-center { text-align: center; flex: 1.5; }
    .hdr-left { text-align: left; direction: ltr; }

    .doc-title {
      font-size: 24px;
      font-weight: 900;
      color: #004d80;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .doc-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .doc-badge {
      display: inline-block;
      margin-top: 6px;
      background: #f0f9ff;
      border: 1px solid #0284c7;
      color: #0369a1;
      padding: 3px 12px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 12px;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* Amount Banner */
    .amount-banner {
      background: linear-gradient(135deg, #004d80 0%, #0369a1 100%);
      color: #fff;
      border-radius: 8px;
      padding: 12px 18px;
      margin: 14px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-val {
      font-size: 22px;
      font-weight: 900;
      font-family: 'IBM Plex Mono', monospace;
    }
    .amount-words {
      font-size: 13px;
      font-weight: 700;
      color: #e0f2fe;
      margin-top: 2px;
    }

    /* Parties Grid */
    .grid-party {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .party-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
    }
    .party-card.creditor {
      border-color: #0284c7;
      background: #f0f9ff;
    }
    .party-card.debtor {
      border-color: #64748b;
      background: #fff;
    }
    .party-title {
      font-size: 12.5px;
      font-weight: 900;
      color: #004d80;
      margin-bottom: 8px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }

    .field {
      display: flex;
      gap: 6px;
      align-items: baseline;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .field-label {
      color: #475569;
      white-space: nowrap;
      min-width: 110px;
      font-weight: 600;
    }
    .field-val {
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }
    .mono { font-family: 'IBM Plex Mono', monospace; }

    /* Statement Terms Grid */
    .grid-terms {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }

    /* Legal Undertaking Box */
    .pledge-box {
      border: 2px dashed #004d80;
      border-radius: 8px;
      padding: 14px 18px;
      background: #faf5ff;
      margin: 14px 0;
      font-size: 12px;
      line-height: 1.8;
      color: #1e1b4b;
    }
    .pledge-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #4338ca;
      margin-bottom: 6px;
    }
    .legal-clause {
      margin-top: 6px;
      padding-right: 14px;
      font-size: 11.5px;
      color: #334155;
      line-height: 1.7;
    }
    .legal-clause strong {
      color: #0f172a;
    }

    /* Signatures Area */
    .sig-area {
      display: grid;
      grid-template-columns: ${t?"1.2fr 1.2fr 1fr":"1.3fr 1fr"};
      gap: 14px;
      margin-top: 16px;
    }
    .sig-box {
      border: 1.5px solid #94a3b8;
      border-radius: 8px;
      padding: 10px 12px;
      background: #fff;
      text-align: center;
      position: relative;
    }
    .sig-box-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .sig-meta {
      font-size: 11px;
      text-align: right;
      color: #475569;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .sig-meta strong { color: #0f172a; }
    .thumb-box {
      width: 65px;
      height: 60px;
      border: 1.5px dashed #94a3b8;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 9.5px;
      margin: 0 auto;
      background: #f8fafc;
    }
    .sig-line {
      border-top: 1px solid #475569;
      margin-top: 8px;
      padding-top: 4px;
      font-size: 10.5px;
      color: #475569;
      font-weight: 700;
    }

    .stamp-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    .footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      margin-top: 16px;
      padding-top: 8px;
      line-height: 1.4;
    }

    @media print {
      body { padding: 0; background: #fff; }
      .doc { box-shadow: none; border-width: 2px; max-width: 100%; border-radius: 0; padding: 14px 18px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

<div class="doc">

  <!-- Top Action Button -->
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨️ طباعة إقرار المديونية الرسمي</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="hdr-col" style="text-align:right; display:flex; align-items:center; gap:10px;">
      ${h?`<img src="${h}" style="max-height:70px; max-width:140px; object-fit:contain; border-radius:8px;" alt="شعار الشركة"/>`:`
        <div style="width:65px; height:65px; border-radius:10px; background:linear-gradient(135deg, #004d80, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:22px;">MSS</div>
      `}
    </div>
    <div class="hdr-center">
      <div class="doc-title">إقرار مديونية والتزام بالسداد</div>
      <div class="doc-subtitle">وثيقة إقرار مالي وتعهد قضائي ملزم ونافذ شرعاً ونظاماً</div>
      <div class="doc-badge">رقم الإقرار: ${A}</div>
    </div>
    <div class="hdr-col hdr-left">
      <div style="font-size:14px; font-weight:900; color:#004d80; text-align:left;">${r}</div>
      <div style="font-size:11px; color:#475569; font-weight:700; text-align:left;">س.ت: <span class="mono">${s}</span></div>
      <div style="font-size:11px; color:#475569; font-weight:700; text-align:left;">الرقم الضريبي: <span class="mono">${v}</span></div>
      <div style="font-size:10px; color:#64748b; margin-top:2px; text-align:left;">ينبع الصناعية — هاتف: ${k}</div>
    </div>
  </div>

  <!-- Statement Terms Grid -->
  <div class="grid-terms">
    <div class="field"><span class="field-label">تاريخ تحرير الإقرار :</span><span class="field-val">${S?S+" هـ — ":""}${i} م</span></div>
    <div class="field"><span class="field-label">مدينة التحرير :</span><span class="field-val">ينبع، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">تاريخ الاستحقاق الملزم :</span><span class="field-val" style="color:#b91c1c; font-size:13px;">${C?C+" هـ — ":""}${u} م</span></div>
    <div class="field"><span class="field-label">طريقة السداد المتعهد بها :</span><span class="field-val">${f}</span></div>
  </div>

  <!-- Amount Banner -->
  <div class="amount-banner">
    <div>
      <div style="font-size:11px; opacity:0.9; font-weight:700;">مبلغ المديونية المقر به دون قيد أو شرط :</div>
      <div class="amount-val">${o.toLocaleString("ar-SA")} ريال سعودي</div>
    </div>
    <div style="text-align:left; max-width:55%;">
      <div style="font-size:11px; opacity:0.9; font-weight:700;">المبلغ تفقيطاً بالكلمات :</div>
      <div class="amount-words">${a}</div>
    </div>
  </div>

  <!-- Parties Grid: Creditor & Debtor -->
  <div class="grid-party">
    
    <!-- Creditor -->
    <div class="party-card creditor">
      <div class="party-title">🏢 بيانات الدائن (المقر له / صاحب الحق)</div>
      <div class="field"><span class="field-label">اسم المنشأة :</span><span class="field-val">${r}</span></div>
      <div class="field"><span class="field-label">السجل التجاري :</span><span class="field-val mono">${s}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${v}</span></div>
      <div class="field"><span class="field-label">العنوان المعتمد :</span><span class="field-val">${B}</span></div>
      <div class="field"><span class="field-label">رقم الهاتف :</span><span class="field-val mono">${k}</span></div>
    </div>

    <!-- Debtor -->
    <div class="party-card debtor">
      <div class="party-title">👤 بيانات المدين المقر (الملتزم بالسداد)</div>
      <div class="field"><span class="field-label">اسم المنشأة / العميل :</span><span class="field-val">${l}</span></div>
      <div class="field"><span class="field-label">السجل / الهوية :</span><span class="field-val mono">${e}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${I}</span></div>
      <div class="field"><span class="field-label">العنوان الوطني :</span><span class="field-val">${m}</span></div>
      <div class="field"><span class="field-label">رقم الجوال :</span><span class="field-val mono">${w}</span></div>
      <div class="field"><span class="field-label">المفوض بالتوقيع :</span><span class="field-val">${g} ${p?`(${p})`:""}</span></div>
      ${b?`<div class="field"><span class="field-label">هوية المفوض :</span><span class="field-val mono">${b}</span></div>`:""}
    </div>

  </div>

  <!-- Legal Undertaking / Pledge Box -->
  <div class="pledge-box">
    <div class="pledge-title">📜 صيغة الإقرار الشرعي والنظامي والالتزام القضائي بالسداد:</div>
    <p>
      أقر أنا الموقع أدناه (<strong>المدين المقر</strong>) بصفتي أصيلاً / مفوضاً نظامياً عن المنشأة الموضحة بياناتها أعلاه، وبكامل الأهلية المعتبرة شرعاً ونظاماً، وبما لا رجعة فيه ولا بداء، بالآتي:
    </p>
    <div class="legal-clause">
      1. <strong>ثبوت وصحة المديونية:</strong> أقر بصحة مطابقة الحساب التجاري حتى تاريخ <strong>${i}</strong>، وبأن في ذمتي وذمة منشأتي ديناً ثابتاً ومستحق الأداء بصفة قطعية غير معلقة على شرط لصالح الدائن: <strong>${r}</strong> (س.ت: <span class="mono">${s}</span>)، بمبلغ وقدره <strong>(${o.toLocaleString("ar-SA")} ريال سعودي)</strong>، وذلك لقاء بضائع ومواد غذائية مستلمة بالكامل ومطابقة للمواصفات دون أي اعتراض أو تحفظ.
    </div>
    <div class="legal-clause">
      2. <strong>التعهد بالسداد التام:</strong> أتعهد وألتزم بالوفاء بكامل المبلغ المذكور أعلاه دون مماطلة في موعد أقصاه تاريخ <strong>${u}</strong>، وذلك بـ (<strong>${f}</strong>).
    </div>
    <div class="legal-clause">
      3. <strong>الحجية القضائية وإسقاط الدفوع:</strong> يُعد هذا الإقرار حجة قاطعة ودليلاً كتابياً ملزماً وغير قابل للرجوع فيه استناداً للمادة (14) والمادة (29) وما بعدهما من <strong>نظام الإثبات السعودي</strong> الصادر بالمرسوم الملكي رقم (م/43)، وأسقط بموجبه نهائياً أي حق في الدفع بالإنكار أو الطعن في الحسابات أو استلام البضاعة.
    </div>
    <div class="legal-clause">
      4. <strong>المسؤولية وأتعاب التقاضي:</strong> في حال التخلف عن السداد، يحق للدائن اتخاذ كافة الإجراءات القضائية، مع تحمّل المدين المقر (وكفيله الغارم) لكافة أتعاب المحاماة ومصاريف التقاضي والأضرار الناتجة عن التأخير.
    </div>
    ${c?`<div style="margin-top:8px; padding:6px 10px; background:#fff; border-right:3px solid #004d80; font-size:11.5px; color:#1e293b;"><strong>ملاحظات / مرجع الفواتير:</strong> ${c}</div>`:""}
  </div>

  <!-- Signatures -->
  <div class="sig-area">

    <!-- Debtor Signature & Stamp (No thumbprint) -->
    <div class="sig-box">
      <div class="sig-box-title">✍️ توقيع وختم المدين المقر</div>
      <div class="sig-meta">
        <div>المنشأة: <strong>${l}</strong></div>
        <div>المفوض بالتوقيع: <strong>${g} ${p?`(${p})`:""}</strong></div>
        <div>الهوية/السجل: <strong class="mono">${b||e}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">التوقيع والختم الرسمي للمدين المقر</div>
      </div>
    </div>

    <!-- Guarantor (if provided) (No thumbprint) -->
    ${t?`
    <div class="sig-box">
      <div class="sig-box-title">🤝 توقيع الكفيل الغارم المتضامن</div>
      <div class="sig-meta">
        <div>الاسم: <strong>${t}</strong></div>
        <div>الهوية: <strong class="mono">${y||"—"}</strong></div>
        <div>الجوال: <strong class="mono">${x||"—"}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">توقيع الكفيل الغارم</div>
      </div>
    </div>
    `:""}

    <!-- Creditor Stamp & Signature -->
    <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
      <div class="sig-box-title" style="color:#004d80;">🏢 اعتماد وخاتم الدائن (المقر له)</div>
      <div class="sig-meta">
        <div>المنشأة: <strong>${r}</strong></div>
        <div>السجل التجاري: <strong class="mono">${s}</strong></div>
      </div>
      <div style="text-align:center; margin-top:4px; min-height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        ${h?`<img src="${h}" class="stamp-img" alt="ختم الشركة"/>`:'<div style="height:70px;"></div>'}
        <div class="sig-line" style="width:100%; margin-top:2px;">توقيع وخاتم الدائن المعتمد</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م — وثيقة إقرار مالي وتعهد قضائي ملزم رقم: <strong class="mono">${A}</strong>
    <br/>
    ${r} للتجارة — ينبع — المملكة العربية السعودية — وثيقة رسمية حجة في الإثبات القضائي
  </div>

</div>

</body>
</html>`;E.document.write(T),E.document.close()}typeof window<"u"&&(window.openDebtAcknowledgmentModal=j,window.openDebtAcknowledgment=j);export{W as generateAndPrintDebtAcknowledgment,j as openDebtAcknowledgmentModal};
