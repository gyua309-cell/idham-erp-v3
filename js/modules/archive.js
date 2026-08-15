// ============================================================
// IDHAM ERP — Cloud Archiving & Document Management Module (الأرشيف الرقمي)
// ============================================================
import { db, COMPANY_ID } from "../firebase-config.js";
import { formatCurrency, todayString } from "../utils/formatters.js";
import { 
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, 
  query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let archivedFiles = [];
let activeFolder = null; // null = grid of folders, string = category

const FOLDERS = {
  "sales_invoices": { name: "فواتير المبيعات", icon: "🧾", desc: "أرشيف فواتير البيع الإلكترونية للعملاء" },
  "purchase_invoices": { name: "فواتير المشتريات", icon: "📦", desc: "أرشيف فواتير الشراء والتوريد من الموردين" },
  "bank_transfers": { name: "التحويلات البنكية", icon: "🏦", desc: "أرشيف إيصالات التحويل البنكي الصادرة والواردة" },
  "expenses": { name: "المصروفات وسندات الصرف", icon: "💸", desc: "فواتير المصاريف العمومية والإدارية وسندات الصرف" },
  "quotations": { name: "عروض الأسعار", icon: "📄", desc: "عروض الأسعار الصادرة للعملاء والمؤسسات" },
  "employee_docs": { name: "وثائق وهويات الموظفين", icon: "👤", desc: "أرشيف الإقامات، هويات الموظفين، وجوازات السفر" },
  "company_docs": { name: "مستندات الشركة الرسمية", icon: "🏢", desc: "السجل التجاري، الشهادة الضريبية، رخصة البلدية" }
};

export async function render(container, user) {
  container.innerHTML = `
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
  `;

  activeFolder = null;
  await loadArchivedFiles();
  renderArchiveView();
}

async function loadArchivedFiles() {
  const qSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/archivedFiles`), orderBy("uploadedAt", "desc")));
  archivedFiles = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function renderArchiveView() {
  const filterbar = document.getElementById("archive-filterbar");
  const mainContent = document.getElementById("archive-main-content");
  if (!mainContent || !filterbar) return;

  if (activeFolder === null) {
    // ── Grid View ──
    filterbar.innerHTML = `
      <div class="topbar-search" style="width:300px; height:36px;">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="بحث في جميع المستندات..." id="archive-search" oninput="searchArchivedFiles()" />
      </div>
      <div style="margin-right:auto;">
        <span style="font-size:12px; color:var(--text-3); font-weight:bold;">📍 إجمالي الملفات المؤرشفة: ${archivedFiles.length} مستند</span>
      </div>
    `;

    // Folder counts
    const getFolderCount = (cat) => archivedFiles.filter(f => f.category === cat).length;

    mainContent.innerHTML = `
      <div class="archive-grid">
        ${Object.keys(FOLDERS).map(cat => {
          const folder = FOLDERS[cat];
          const count = getFolderCount(cat);
          return `
            <div class="folder-card" onclick="openFolder('${cat}')">
              <span class="folder-count">${count} ملف</span>
              <div class="folder-icon">${folder.icon}</div>
              <div class="folder-info">
                <span class="folder-name">${folder.name}</span>
                <span class="folder-desc">${folder.desc}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } else {
    // ── Folder View ──
    const folder = FOLDERS[activeFolder];
    const files = archivedFiles.filter(f => f.category === activeFolder);

    filterbar.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="goBackToFolders()" style="margin:0; height:36px; padding:4px 14px;">⬅️ العودة للمجلدات</button>
      <div style="margin-right:auto;">
        <button class="btn btn-primary" onclick="openUploadModal('${activeFolder}')" style="margin:0; height:36px;">+ رفع مستند يدوي</button>
      </div>
    `;

    let filesHtml = "";
    if (files.length === 0) {
      filesHtml = `
        <div style="text-align:center; padding:60px; color:var(--text-3);">
          <div style="font-size:40px; margin-bottom:12px;">📂</div>
          <div style="font-weight:700; font-size:14px; color:var(--text-1); margin-bottom:4px;">هذا المجلد فارغ حالياً</div>
          <div>ارفع ملف يدوي أو قم بإرفاق المستندات أثناء عمليات المبيعات، المشتريات، والمصروفات لتظهر هنا تلقائياً!</div>
        </div>
      `;
    } else {
      filesHtml = `
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
              ${files.map(f => {
                const kb = (f.size / 1024).toFixed(1);
                return `
                  <tr>
                    <td><strong>${f.name}</strong></td>
                    <td><small style="color:var(--text-2);">${f.notes || "—"}</small></td>
                    <td class="mono">${kb} KB</td>
                    <td class="mono">${f.uploadedAt}</td>
                    <td>${f.uploadedBy || "—"}</td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary sm" style="padding:2px 8px; margin:0;" onclick="viewDocument('${f.id}')">👁️ معاينة</button>
                      <button class="btn btn-icon sm btn-ghost text-bad" style="margin:0 4px;" onclick="deleteDocument('${f.id}')" title="حذف">🗑️</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    mainContent.innerHTML = `
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title">${folder.icon} مجلد: ${folder.name}</h1>
        <p class="page-subtitle">${folder.desc}</p>
      </div>

      <div class="card">
        ${filesHtml}
      </div>
    `;
  }
}

window.openFolder = (cat) => {
  activeFolder = cat;
  renderArchiveView();
};

window.goBackToFolders = () => {
  activeFolder = null;
  renderArchiveView();
};

// ── Search across all files ──
window.searchArchivedFiles = () => {
  const queryText = document.getElementById("archive-search").value.trim().toLowerCase();
  const mainContent = document.getElementById("archive-main-content");
  if (!mainContent) return;

  if (!queryText) {
    renderArchiveView();
    return;
  }

  const matches = archivedFiles.filter(f => 
    f.name.toLowerCase().includes(queryText) || 
    (f.notes && f.notes.toLowerCase().includes(queryText)) ||
    f.uploadedAt.includes(queryText)
  );

  if (matches.length === 0) {
    mainContent.innerHTML = `
      <div style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:32px; margin-bottom:12px;">🔍</div>
        <div style="font-weight:700; font-size:14px; color:var(--text-1);">لا توجد نتائج مطابقة لبحثك</div>
        <div>يرجى تجربة كلمات بحث أخرى.</div>
      </div>
    `;
    return;
  }

  mainContent.innerHTML = `
    <div class="page-header" style="margin-bottom:16px;">
      <h1 class="page-title">🔍 نتائج البحث عن: "${queryText}"</h1>
      <p class="page-subtitle">تم العثور على ${matches.length} مستند مطابق</p>
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
            ${matches.map(f => {
              const folderName = FOLDERS[f.category]?.name || "عام";
              return `
                <tr>
                  <td><span class="badge" style="background:var(--brand-alpha); color:var(--brand);">${folderName}</span></td>
                  <td><strong>${f.name}</strong></td>
                  <td><small style="color:var(--text-2);">${f.notes || "—"}</small></td>
                  <td class="mono">${f.uploadedAt}</td>
                  <td>${f.uploadedBy || "—"}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary sm" style="padding:2px 8px; margin:0;" onclick="viewDocument('${f.id}')">👁️ معاينة</button>
                    <button class="btn btn-icon sm btn-ghost text-bad" style="margin:0 4px;" onclick="deleteDocument('${f.id}')" title="حذف">🗑️</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

// ── Manual File Upload Actions ──
window.openUploadModal = (cat) => {
  document.getElementById("upload-category").value = cat;
  document.getElementById("upload-category-display").value = FOLDERS[cat].name;
  document.getElementById("upload-file-input").value = "";
  document.getElementById("upload-notes").value = "";
  document.getElementById("upload-error").classList.add("hidden");
  openModal("archive-upload-modal");
};

window.saveUploadedFile = async () => {
  const errEl = document.getElementById("upload-error"); errEl.classList.add("hidden");
  const cat = document.getElementById("upload-category").value;
  const fileInput = document.getElementById("upload-file-input");
  const notes = document.getElementById("upload-notes").value.trim();

  if (!fileInput.files.length) {
    errEl.textContent = "الرجاء اختيار ملف لرفعه"; errEl.classList.remove("hidden"); return;
  }

  const file = fileInput.files[0];
  const btn = document.getElementById("save-upload-btn"); btn.disabled = true;
  btn.textContent = "جاري رفع وحفظ الملف…";

  try {
    // Use the global archive utility
    await window.uploadFileToArchive(file, cat, "", notes);
    
    showToast("✅ تم رفع وحفظ الملف بنجاح في الأرشيف", "success");
    closeModal("archive-upload-modal");
    await loadArchivedFiles();
    renderArchiveView();
  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 رفع وحفظ في الأرشيف";
  }
};

// ── Document View and Download Actions ──
window.viewDocument = (fileId) => {
  const f = archivedFiles.find(x => x.id === fileId);
  if (!f) return;

  document.getElementById("view-title").textContent = `معاينة مستند: ${f.name}`;
  const body = document.getElementById("archive-view-body");
  const downloadLink = document.getElementById("archive-download-link");

  downloadLink.href = f.content;
  downloadLink.download = f.name;

  if (f.type.startsWith("image/")) {
    body.innerHTML = `<img src="${f.content}" class="doc-viewer-img" alt="${f.name}" />`;
  } else if (f.type === "application/pdf") {
    body.innerHTML = `
      <object data="${f.content}" type="application/pdf" class="doc-viewer-pdf">
        <embed src="${f.content}" type="application/pdf" />
      </object>
    `;
  } else {
    body.innerHTML = `
      <div style="text-align:center; color:#fff; padding:40px;">
        <div style="font-size:48px;">📄</div>
        <div style="margin-top:12px; font-weight:bold;">لا تتوفر معاينة مباشرة لهذا النوع من الملفات</div>
        <div style="font-size:12px; color:#94a3b8; margin-top:4px;">يمكنك تحميل الملف مباشرة باستخدام الزر أدناه.</div>
      </div>
    `;
  }

  openModal("archive-view-modal");
};

// ── Delete Document ──
window.deleteDocument = async (fileId) => {
  if (confirm("⚠️ هل تريد حذف هذا المستند نهائياً من الأرشيف؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/archivedFiles`, fileId));
      showToast("تم حذف المستند بنجاح من الأرشيف", "success");
      await loadArchivedFiles();
      renderArchiveView();
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};
