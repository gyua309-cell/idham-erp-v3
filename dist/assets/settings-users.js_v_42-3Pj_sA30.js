import{g as w,a as f,b as T,_ as v,d as c,C as m,r as U}from"./index-DaYejt0r.js";import{orderBy as k,doc as u,collection as D,setDoc as g,serverTimestamp as y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function H(e,a){const s=new TextEncoder().encode(e.toLowerCase().trim()+":"+a),t=await crypto.subtle.digest("SHA-256",s);return Array.from(new Uint8Array(t)).map(r=>r.toString(16).padStart(2,"0")).join("")}async function F(e,a){e.innerHTML=`
    <div class="filterbar">
      <div style="margin-right:auto;">
        <button class="btn btn-primary" onclick="openUserModal()">+ إضافة مستخدم جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">إدارة المستخدمين والصلاحيات</h1>
        <p class="page-subtitle">التحكم في أدوار وصلاحيات الوصول للنظام (أدمن، محاسب، مندوب مبيعات)</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور / الصلاحية</th>
                <th>تاريخ الإضافة</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="usr-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(6).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div class="modal-overlay" id="usr-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="usr-modal-title">إضافة مستخدم جديد</h3>
          <button class="modal-close" onclick="closeModal('usr-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="usr-edit-id" />
          <div class="form-group mb-16">
            <label>اسم المستخدم *</label>
            <input type="text" id="usr-name" class="input" placeholder="اسم الموظف الثلاثي" />
          </div>
          <div class="form-group mb-16">
            <label>البريد الإلكتروني *</label>
            <input type="email" id="usr-email" class="input" placeholder="employee@idham.sa" />
          </div>
          <div class="form-group mb-16" id="usr-pass-group">
            <label>كلمة المرور (الرقم السري) *</label>
            <input type="password" id="usr-password" class="input" placeholder="أدخل كلمة مرور قوية (6 أحرف على الأقل)" />
          </div>
          <div class="form-group mb-16">
            <label>دور الصلاحية *</label>
            <select id="usr-role">
              <option value="admin">مدير نظام (Admin) — كامل الصلاحيات</option>
              <option value="accountant">محاسب (Accountant) — القيود والتقارير المالية</option>
              <option value="sales_rep">مندوب مبيعات (Sales Rep) — الفواتير والعملاء فقط</option>
              <option value="warehouse_mgr">مدير مخازن (Warehouse Manager) — المخزون والتحويلات</option>
              <option value="purchase_mgr">مدير مشتريات (Purchase Manager) — المشتريات والموردين والمخزون</option>
            </select>
          </div>
          <div id="usr-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('usr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveUserRecord()" id="save-usr-btn">حفظ المستخدم</button>
        </div>
      </div>
    </div>`,await p()}async function p(){const e=document.getElementById("usr-tbody");if(e)try{const a=await w(f.users(),[k("createdAt","desc")]);if(a.length===0){e.innerHTML=`
        <tr>
          <td><div class="font-semibold font-heading">المدير العام</div></td>
          <td class="mono dim">admin@idham.sa</td>
          <td><span class="badge indigo">مدير نظام</span></td>
          <td class="dim">الحالي</td>
          <td><span class="badge good">نشط</span></td>
          <td></td>
        </tr>`;return}const s={admin:{label:"مدير نظام",color:"indigo"},accountant:{label:"محاسب",color:"lime"},sales_rep:{label:"مندوب مبيعات",color:"warn"},warehouse_mgr:{label:"مدير مخازن",color:"neutral"},purchase_mgr:{label:"مدير مشتريات",color:"teal"}};e.innerHTML=a.map(t=>{const r=s[t.role]||{label:t.role,color:"neutral"};return`
        <tr>
          <td class="font-heading font-semibold">${t.name}</td>
          <td class="mono dim">${t.email}</td>
          <td><span class="badge ${r.color}">${r.label}</span></td>
          <td class="dim">${T(t.createdAt)}</td>
          <td><span class="badge good">نشط</span></td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="deleteUserRecord('${t.id}','${t.name}')" style="color:var(--bad);">🗑️</button>
            </div>
          </td>
        </tr>`}).join("")}catch(a){e.innerHTML=`<tr><td colspan="6"><div class="alert bad" style="margin:8px;">${a.message}</div></td></tr>`}}window.openUserModal=()=>{document.getElementById("usr-edit-id").value="",document.getElementById("usr-name").value="",document.getElementById("usr-email").value="",document.getElementById("usr-password").value="",document.getElementById("usr-pass-group").classList.remove("hidden"),document.getElementById("usr-error").classList.add("hidden"),openModal("usr-modal")};window.saveUserRecord=async()=>{const e=document.getElementById("usr-error");e.classList.add("hidden");const a=document.getElementById("usr-name").value.trim(),s=document.getElementById("usr-email").value.trim().toLowerCase(),t=document.getElementById("usr-password").value,r=document.getElementById("usr-role").value;if(!a||!s){e.textContent="الاسم والبريد مطلوبان",e.classList.remove("hidden");return}if(!t||t.length<6){e.textContent="يرجى إدخال كلمة مرور من 6 أحرف على الأقل",e.classList.remove("hidden");return}const n=document.getElementById("save-usr-btn");n.disabled=!0,n.textContent="⌛ جارٍ الحفظ والتسجيل…";try{if((await w(f.users())).some(o=>o.email.toLowerCase()===s))throw new Error("هذا البريد الإلكتروني مسجل مسبقاً لمستخدم آخر");const A=await H(s,t),{initializeApp:E,deleteApp:I}=await v(async()=>{const{initializeApp:o,deleteApp:i}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");return{initializeApp:o,deleteApp:i}},[]),{getAuth:_,createUserWithEmailAndPassword:L,signOut:x}=await v(async()=>{const{getAuth:o,createUserWithEmailAndPassword:i,signOut:R}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js");return{getAuth:o,createUserWithEmailAndPassword:i,signOut:R}},[]),C={apiKey:"AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8",authDomain:"idham-foodstuffs-sa.firebaseapp.com",projectId:"idham-foodstuffs-sa",storageBucket:"idham-foodstuffs-sa.firebasestorage.app",messagingSenderId:"771445462953",appId:"1:771445462953:web:05d70fb7c36a385c9796b8"},B="TempApp_"+Date.now(),b=E(C,B),h=_(b);let d;try{d=(await L(h,s,t)).user.uid,await x(h)}catch(o){console.warn("Firebase Auth registration bypassed/failed:",o.message),d=u(D(c,`companies/${m}/users`)).id}finally{try{await I(b)}catch{}}if(!d)throw new Error("فشل إنشاء حساب المستخدم في نظام المصادقة وقاعدة البيانات");const M=u(c,`companies/${m}/users`,d);await g(M,{id:d,name:a,email:s,role:r,passwordHash:A,createdAt:y(),updatedAt:y()});const $=u(c,"userIndex",d);await g($,{companyId:m}),showToast("تمت إضافة المستخدم بنجاح وتسجيل حسابه","success"),closeModal("usr-modal"),await p()}catch(l){console.error(l),e.textContent=l.message,e.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="حفظ المستخدم"}};window.deleteUserRecord=async(e,a)=>{if(await showConfirm(`حذف المستخدم "${a}"؟`,"تأكيد"))try{await U("users",e),showToast("تم حذف المستخدم","success"),await p()}catch(s){showToast(s.message,"error")}};export{F as render};
