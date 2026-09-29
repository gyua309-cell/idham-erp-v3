import{d as m,C as v}from"./index-CEMoTDyX.js";import{getDocs as u,query as h,collection as b,orderBy as g,deleteDoc as x,doc as y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let l=[],i=null;const r={sales_invoices:{name:"فواتير المبيعات",icon:"🧾",desc:"أرشيف فواتير البيع الإلكترونية للعملاء"},purchase_invoices:{name:"فواتير المشتريات",icon:"📦",desc:"أرشيف فواتير الشراء والتوريد من الموردين"},bank_transfers:{name:"التحويلات البنكية",icon:"🏦",desc:"أرشيف إيصالات التحويل البنكي الصادرة والواردة"},expenses:{name:"المصروفات وسندات الصرف",icon:"💸",desc:"فواتير المصاريف العمومية والإدارية وسندات الصرف"},quotations:{name:"عروض الأسعار",icon:"📄",desc:"عروض الأسعار الصادرة للعملاء والمؤسسات"},employee_docs:{name:"وثائق وهويات الموظفين",icon:"👤",desc:"أرشيف الإقامات، هويات الموظفين، وجوازات السفر"},company_docs:{name:"مستندات الشركة الرسمية",icon:"🏢",desc:"السجل التجاري، الشهادة الضريبية، رخصة البلدية"}};async function L(e,t){e.innerHTML=`
    <style>
      .archive-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 10px;
      }
      .folder-card {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: var(--shadow-sm);
        position: relative;
        overflow: hidden;
      }
      .folder-card:hover {
        transform: translateY(-4px);
        border-color: var(--brand);
        box-shadow: var(--shadow-md);
        background: var(--bg-hover);
      }
      .folder-icon {
        font-size: 32px;
        background: var(--brand-alpha, rgba(91, 127, 255, 0.1));
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      .folder-card:hover .folder-icon {
        transform: scale(1.08);
      }
      .folder-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .folder-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-1);
      }
      .folder-desc {
        font-size: 11px;
        color: var(--text-3);
        line-height: 1.4;
      }
      .folder-count {
        font-size: 11px;
        background: var(--border-soft);
        color: var(--text-2);
        padding: 2px 8px;
        border-radius: 20px;
        font-weight: bold;
        position: absolute;
        top: 12px;
        left: 12px;
      }
      .file-preview-card {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: var(--shadow-sm);
      }
      .file-preview-icon {
        font-size: 24px;
        width: 44px;
        height: 44px;
        background: var(--border-soft);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .file-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }
      .file-name {
        font-size: 12px;
        font-weight: bold;
        color: var(--text-1);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .file-meta {
        font-size: 10px;
        color: var(--text-3);
      }
      .doc-viewer-modal .modal-body {
        max-height: 80vh;
        overflow-y: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f172a;
        padding: 20px;
        border-radius: 8px;
      }
      .doc-viewer-img {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }
      .doc-viewer-pdf {
        width: 100%;
        height: 70vh;
        border: none;
      }
    </style>

    <div class="filterbar no-print" id="archive-filterbar">
      <!-- Loaded dynamically -->
    </div>
    
    <div class="page-content" id="archive-main-content">
      <!-- Loaded dynamically -->
    </div>

    <!-- Upload Manual Document Modal -->
    <div class="modal-overlay" id="archive-upload-modal">
      <div class="modal"><div class="modal-header"><h3 class="modal-title">رفع مستند جديد للأرشيف</h3><button class="modal-close" onclick="closeModal('archive-upload-modal')">×</button></div>
      <div class="modal-body">
        <input type="hidden" id="upload-category" />
        <div class="form-group mb-16">
          <label>المجلد المستهدف</label>
          <input type="text" id="upload-category-display" class="input" readonly style="background:var(--bg-2);" />
        </div>
        <div class="form-group mb-16">
          <label>تحديد الملف (صورة أو PDF) *</label>
          <input type="file" id="upload-file-input" class="input" accept="image/*,application/pdf" />
        </div>
        <div class="form-group mb-16">
          <label>ملاحظات / بيان المستند</label>
          <input type="text" id="upload-notes" class="input" placeholder="مثال: فاتورة سداد، تجديد السجل..." />
        </div>
        <div id="upload-error" class="alert bad hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('archive-upload-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveUploadedFile()" id="save-upload-btn">💾 رفع وحفظ في الأرشيف</button>
      </div></div>
    </div>

    <!-- Document Viewer Modal -->
    <div class="modal-overlay" id="archive-view-modal">
      <div class="modal modal-lg doc-viewer-modal" style="background:#0f172a; max-width:85vw;"><div class="modal-header" style="border-bottom:1px solid #1e293b; padding:12px 16px;"><h3 class="modal-title" id="view-title" style="color:#fff;">عرض المستند</h3><button class="modal-close" onclick="closeModal('archive-view-modal')" style="color:#fff;">×</button></div>
      <div class="modal-body" id="archive-view-body">
        <!-- Rendered dynamically -->
      </div>
      <div class="modal-footer" style="border-top:1px solid #1e293b; padding:10px 16px;">
        <button class="btn btn-secondary" onclick="closeModal('archive-view-modal')">إغلاق المعاينة</button>
        <a id="archive-download-link" href="#" class="btn btn-primary" download>⬇️ تحميل الملف</a>
      </div></div>
    </div>
  `,i=null,await p(),s()}async function p(){l=(await u(h(b(m,`companies/${v}/archivedFiles`),g("uploadedAt","desc")))).docs.map(t=>({id:t.id,...t.data()}))}function s(){const e=document.getElementById("archive-filterbar"),t=document.getElementById("archive-main-content");if(!(!t||!e))if(i===null){e.innerHTML=`
      <div class="topbar-search" style="width:300px; height:36px;">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="بحث في جميع المستندات..." id="archive-search" oninput="searchArchivedFiles()" />
      </div>
      <div style="margin-right:auto;">
        <span style="font-size:12px; color:var(--text-3); font-weight:bold;">📍 إجمالي الملفات المؤرشفة: ${l.length} مستند</span>
      </div>
    `;const a=o=>l.filter(n=>n.category===o).length;t.innerHTML=`
      <div class="archive-grid">
        ${Object.keys(r).map(o=>{const n=r[o],d=a(o);return`
            <div class="folder-card" onclick="openFolder('${o}')">
              <span class="folder-count">${d} ملف</span>
              <div class="folder-icon">${n.icon}</div>
              <div class="folder-info">
                <span class="folder-name">${n.name}</span>
                <span class="folder-desc">${n.desc}</span>
              </div>
            </div>
          `}).join("")}
      </div>
    `}else{const a=r[i],o=l.filter(d=>d.category===i);e.innerHTML=`
      <button class="btn btn-secondary btn-sm" onclick="goBackToFolders()" style="margin:0; height:36px; padding:4px 14px;">⬅️ العودة للمجلدات</button>
      <div style="margin-right:auto;">
        <button class="btn btn-primary" onclick="openUploadModal('${i}')" style="margin:0; height:36px;">+ رفع مستند يدوي</button>
      </div>
    `;let n="";o.length===0?n=`
        <div style="text-align:center; padding:60px; color:var(--text-3);">
          <div style="font-size:40px; margin-bottom:12px;">📂</div>
          <div style="font-weight:700; font-size:14px; color:var(--text-1); margin-bottom:4px;">هذا المجلد فارغ حالياً</div>
          <div>ارفع ملف يدوي أو قم بإرفاق المستندات أثناء عمليات المبيعات، المشتريات، والمصروفات لتظهر هنا تلقائياً!</div>
        </div>
      `:n=`
        <div class="table-container">
          <table class="data-dense" style="font-size:12px;">
            <thead>
              <tr>
                <th>اسم المستند</th>
                <th>الملاحظات / البيان</th>
                <th>حجم الملف</th>
                <th>تاريخ الرفع</th>
                <th>بواسطة</th>
                <th style="width:180px; text-align:center;">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${o.map(d=>{const c=(d.size/1024).toFixed(1);return`
                  <tr>
                    <td><strong>${d.name}</strong></td>
                    <td><small style="color:var(--text-2);">${d.notes||"—"}</small></td>
                    <td class="mono">${c} KB</td>
                    <td class="mono">${d.uploadedAt}</td>
                    <td>${d.uploadedBy||"—"}</td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary sm" style="padding:2px 8px; margin:0;" onclick="viewDocument('${d.id}')">👁️ معاينة</button>
                      <button class="btn btn-icon sm btn-ghost text-bad" style="margin:0 4px;" onclick="deleteDocument('${d.id}')" title="حذف">🗑️</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      `,t.innerHTML=`
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title">${a.icon} مجلد: ${a.name}</h1>
        <p class="page-subtitle">${a.desc}</p>
      </div>

      <div class="card">
        ${n}
      </div>
    `}}window.openFolder=e=>{i=e,s()};window.goBackToFolders=()=>{i=null,s()};window.searchArchivedFiles=()=>{const e=document.getElementById("archive-search").value.trim().toLowerCase(),t=document.getElementById("archive-main-content");if(!t)return;if(!e){s();return}const a=l.filter(o=>o.name.toLowerCase().includes(e)||o.notes&&o.notes.toLowerCase().includes(e)||o.uploadedAt.includes(e));if(a.length===0){t.innerHTML=`
      <div style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:32px; margin-bottom:12px;">🔍</div>
        <div style="font-weight:700; font-size:14px; color:var(--text-1);">لا توجد نتائج مطابقة لبحثك</div>
        <div>يرجى تجربة كلمات بحث أخرى.</div>
      </div>
    `;return}t.innerHTML=`
    <div class="page-header" style="margin-bottom:16px;">
      <h1 class="page-title">🔍 نتائج البحث عن: "${e}"</h1>
      <p class="page-subtitle">تم العثور على ${a.length} مستند مطابق</p>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense" style="font-size:12px;">
          <thead>
            <tr>
              <th>المجلد</th>
              <th>اسم المستند</th>
              <th>الملاحظات / البيان</th>
              <th>تاريخ الرفع</th>
              <th>بواسطة</th>
              <th style="width:180px; text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${a.map(o=>`
                <tr>
                  <td><span class="badge" style="background:var(--brand-alpha); color:var(--brand);">${r[o.category]?.name||"عام"}</span></td>
                  <td><strong>${o.name}</strong></td>
                  <td><small style="color:var(--text-2);">${o.notes||"—"}</small></td>
                  <td class="mono">${o.uploadedAt}</td>
                  <td>${o.uploadedBy||"—"}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary sm" style="padding:2px 8px; margin:0;" onclick="viewDocument('${o.id}')">👁️ معاينة</button>
                    <button class="btn btn-icon sm btn-ghost text-bad" style="margin:0 4px;" onclick="deleteDocument('${o.id}')" title="حذف">🗑️</button>
                  </td>
                </tr>
              `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `};window.openUploadModal=e=>{document.getElementById("upload-category").value=e,document.getElementById("upload-category-display").value=r[e].name,document.getElementById("upload-file-input").value="",document.getElementById("upload-notes").value="",document.getElementById("upload-error").classList.add("hidden"),openModal("archive-upload-modal")};window.saveUploadedFile=async()=>{const e=document.getElementById("upload-error");e.classList.add("hidden");const t=document.getElementById("upload-category").value,a=document.getElementById("upload-file-input"),o=document.getElementById("upload-notes").value.trim();if(!a.files.length){e.textContent="الرجاء اختيار ملف لرفعه",e.classList.remove("hidden");return}const n=a.files[0],d=document.getElementById("save-upload-btn");d.disabled=!0,d.textContent="جاري رفع وحفظ الملف…";try{await window.uploadFileToArchive(n,t,"",o),showToast("✅ تم رفع وحفظ الملف بنجاح في الأرشيف","success"),closeModal("archive-upload-modal"),await p(),s()}catch(c){e.textContent=c.message,e.classList.remove("hidden")}finally{d.disabled=!1,d.textContent="💾 رفع وحفظ في الأرشيف"}};window.viewDocument=e=>{const t=l.find(n=>n.id===e);if(!t)return;document.getElementById("view-title").textContent=`معاينة مستند: ${t.name}`;const a=document.getElementById("archive-view-body"),o=document.getElementById("archive-download-link");o.href=t.content,o.download=t.name,t.type.startsWith("image/")?a.innerHTML=`<img src="${t.content}" class="doc-viewer-img" alt="${t.name}" />`:t.type==="application/pdf"?a.innerHTML=`
      <object data="${t.content}" type="application/pdf" class="doc-viewer-pdf">
        <embed src="${t.content}" type="application/pdf" />
      </object>
    `:a.innerHTML=`
      <div style="text-align:center; color:#fff; padding:40px;">
        <div style="font-size:48px;">📄</div>
        <div style="margin-top:12px; font-weight:bold;">لا تتوفر معاينة مباشرة لهذا النوع من الملفات</div>
        <div style="font-size:12px; color:#94a3b8; margin-top:4px;">يمكنك تحميل الملف مباشرة باستخدام الزر أدناه.</div>
      </div>
    `,openModal("archive-view-modal")};window.deleteDocument=async e=>{if(confirm("⚠️ هل تريد حذف هذا المستند نهائياً من الأرشيف؟"))try{await x(y(m,`companies/${v}/archivedFiles`,e)),showToast("تم حذف المستند بنجاح من الأرشيف","success"),await p(),s()}catch(t){showToast(t.message,"error")}};export{L as render};
