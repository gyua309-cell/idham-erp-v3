// ============================================================
// IDHAM ERP — User Management Module (Admin Only)
// Manage users within the current company tenant
// ============================================================
// This module renders the User Management panel for admins.
// It reads/writes to:
//   companies/{companyId}/users/{uid}
//   userIndex/{uid}
//
// NOTE: User creation (Firebase Auth account) is done via
//       Cloud Function "createUser" to keep credentials off client.
//       On Spark plan (no Cloud Functions), admins must use
//       the Admin SDK script (functions/admin-scripts/seed-company.js).
// ============================================================

import {
  collection, doc, getDocs, updateDoc, getDoc, query,
  orderBy, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { requireRole, isAdmin } from "../utils/auth-manager.js";
import { showToast, formatDate } from "../utils/helpers.js";

// ──────────────────────────────────────────
// Render User Management Page
// ──────────────────────────────────────────
export async function renderUsersPage(container) {
  requireRole("admin");

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-users-cog"></i> إدارة المستخدمين</h2>
      <p class="page-subtitle">صلاحية: مدير النظام فقط</p>
    </div>

    <div class="users-grid" id="users-list">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" id="edit-user-modal" style="display:none">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 id="edit-modal-title">تعديل المستخدم</h3>
          <button class="modal-close" onclick="document.getElementById('edit-user-modal').style.display='none'">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="edit-user-form">
            <input type="hidden" id="edit-user-uid" />
            <div class="form-group">
              <label>الدور الوظيفي</label>
              <select id="edit-user-role" class="form-control">
                <option value="admin">مدير النظام</option>
                <option value="accountant">محاسب</option>
                <option value="rep">مندوب مبيعات</option>
              </select>
            </div>
            <div class="form-group" id="warehouse-group">
              <label>المستودع المعيّن</label>
              <select id="edit-user-warehouse" class="form-control">
                <option value="">-- لا يوجد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>الحالة</label>
              <select id="edit-user-active" class="form-control">
                <option value="true">نشط</option>
                <option value="false">معطّل</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveUserChanges()">
            <i class="fas fa-save"></i> حفظ التغييرات
          </button>
          <button class="btn btn-secondary"
            onclick="document.getElementById('edit-user-modal').style.display='none'">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  `;

  await loadUsers();
  await loadWarehousesForSelect();
}

// ──────────────────────────────────────────
// Load & Render Users
// ──────────────────────────────────────────
async function loadUsers() {
  const listEl = document.getElementById("users-list");
  try {
    const q = query(
      collection(db, `companies/${COMPANY_ID}/users`),
      orderBy("role"),
      orderBy("email")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = `<div class="empty-state">لا يوجد مستخدمون مسجلون.</div>`;
      return;
    }

    const roleLabels  = { admin: "مدير النظام", accountant: "محاسب", rep: "مندوب مبيعات" };
    const roleClasses = { admin: "badge-danger", accountant: "badge-warning", rep: "badge-info" };

    listEl.innerHTML = snap.docs.map(d => {
      const u = d.data();
      return `
        <div class="user-card ${u.isActive ? "" : "user-disabled"}">
          <div class="user-avatar">
            ${(u.displayName || u.email || "?")[0].toUpperCase()}
          </div>
          <div class="user-info">
            <strong>${u.displayName || "—"}</strong>
            <small>${u.email}</small>
            <span class="badge ${roleClasses[u.role] || "badge-secondary"}">
              ${roleLabels[u.role] || u.role}
            </span>
            ${u.assignedWarehouseId
              ? `<small class="text-muted"><i class="fas fa-warehouse"></i> ${u.assignedWarehouseId}</small>`
              : ""}
          </div>
          <div class="user-status">
            <span class="${u.isActive ? "status-active" : "status-inactive"}">
              ${u.isActive ? "نشط" : "معطّل"}
            </span>
          </div>
          <div class="user-actions">
            <button class="btn-icon btn-edit"
              onclick="openEditUserModal('${d.id}')"
              title="تعديل">
              <i class="fas fa-pencil-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading users:", err);
    listEl.innerHTML = `<div class="error-state">خطأ في تحميل المستخدمين: ${err.message}</div>`;
  }
}

// ──────────────────────────────────────────
// Load Warehouses for Select Dropdown
// ──────────────────────────────────────────
async function loadWarehousesForSelect() {
  try {
    const snap = await getDocs(
      collection(db, `companies/${COMPANY_ID}/warehouses`)
    );
    const select = document.getElementById("edit-user-warehouse");
    if (!select) return;

    snap.docs.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.data().name || d.id;
      select.appendChild(opt);
    });
  } catch (err) {
    console.warn("Could not load warehouses:", err);
  }
}

// ──────────────────────────────────────────
// Open Edit Modal
// ──────────────────────────────────────────
window.openEditUserModal = async function(uid) {
  const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/users/${uid}`));
  if (!snap.exists()) return;

  const u = snap.data();
  document.getElementById("edit-user-uid").value     = uid;
  document.getElementById("edit-user-role").value    = u.role;
  document.getElementById("edit-user-active").value  = String(u.isActive ?? true);

  const warehouseEl = document.getElementById("edit-user-warehouse");
  if (warehouseEl) warehouseEl.value = u.assignedWarehouseId || "";

  // Show warehouse selector only for reps
  const warehouseGroup = document.getElementById("warehouse-group");
  if (warehouseGroup) {
    warehouseGroup.style.display = u.role === "rep" ? "" : "none";
  }

  document.getElementById("edit-modal-title").textContent =
    `تعديل: ${u.displayName || u.email}`;
  document.getElementById("edit-user-modal").style.display = "flex";
};

// ──────────────────────────────────────────
// Save User Changes
// ──────────────────────────────────────────
window.saveUserChanges = async function() {
  requireRole("admin");

  const uid     = document.getElementById("edit-user-uid").value;
  const role    = document.getElementById("edit-user-role").value;
  const isActive = document.getElementById("edit-user-active").value === "true";
  const assignedWarehouseId = document.getElementById("edit-user-warehouse")?.value || null;

  try {
    await updateDoc(doc(db, `companies/${COMPANY_ID}/users/${uid}`), {
      role,
      isActive,
      assignedWarehouseId: role === "rep" ? assignedWarehouseId : null,
      updatedAt: serverTimestamp(),
    });

    document.getElementById("edit-user-modal").style.display = "none";
    showToast("تم تحديث بيانات المستخدم بنجاح", "success");
    await loadUsers();
  } catch (err) {
    showToast(`خطأ: ${err.message}`, "error");
  }
};

// ──────────────────────────────────────────
// Role badge colors for display (helper)
// ──────────────────────────────────────────
export function getRoleLabel(role) {
  return { admin: "مدير النظام", accountant: "محاسب", rep: "مندوب مبيعات" }[role] || role;
}
