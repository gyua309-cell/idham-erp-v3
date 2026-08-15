// ============================================================
// IDHAM ERP — Data Reset Module (تصفير البيانات)
// يحذف كل البيانات التشغيلية مع الإبقاء على التعريفات
// ============================================================
import { db, COMPANY_ID } from "../firebase-config.js";
import {
  collection, getDocs, query, writeBatch, doc, updateDoc, limit
} from "../utils/db.js";

// ── المجموعات التي تُحذف (بيانات تشغيلية + الأصناف) ──────────────────
const TRANSACTIONAL_COLLECTIONS = [
  "journalEntries",       // القيود المحاسبية
  "salesInvoices",        // فواتير المبيعات
  "purchaseInvoices",     // فواتير المشتريات
  "salesReturns",         // مردودات المبيعات
  "purchaseReturns",      // مردودات المشتريات
  "stockByWarehouse",     // أرصدة المخزون بالمخازن
  "stockTransactions",    // حركات المخزون
  "cashTransactions",     // حركات الصناديق النقدية
  "bankTransactions",     // حركات البنوك
  "expenses",             // المصروفات
  "quotations",           // عروض الأسعار
  "cheques",              // الشيكات
  "purchaseRequests",     // طلبات الشراء
  "products",             // الأصناف فقط
];

// ── المجموعات التي تُبقى (تعريفات) ──────────────────────────
// categories, warehouses, units, customers, suppliers,
// salesReps, priceLists, chartOfAccounts, cashBoxes (balance→0),
// bankAccounts (balance→0), employees, settings, users

async function deleteCollection(colName) {
  const colRef = collection(db, `companies/${COMPANY_ID}/${colName}`);
  let totalDeleted = 0;

  while (true) {
    const snap = await getDocs(query(colRef, limit(400)));
    if (snap.empty) break;

    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += snap.docs.length;
  }
  return totalDeleted;
}

async function resetBalancesToZero(colName, balanceField = "balance") {
  const colRef = collection(db, `companies/${COMPANY_ID}/${colName}`);
  const snap = await getDocs(colRef);
  if (snap.empty) return 0;

  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { [balanceField]: 0 }));
  await batch.commit();
  return snap.docs.length;
}

export async function render(container) {
  container.innerHTML = buildPage();
  attachEvents();
}

function buildPage() {
  return `
  <div class="page-content" style="max-width:700px;margin:0 auto;">
    <div class="page-header" style="margin-bottom:24px;">
      <h1 class="page-title" style="color:var(--danger);">🗑️ تصفير البيانات وقاعدة البيانات</h1>
      <p class="page-subtitle">
        يحذف هذا الأمر جميع الفواتير، القيود، والأصناف بالكامل،
        مع <strong>الإبقاء الكامل</strong> على الفئات والمستودعات والعملاء والموردين وشجرة الحسابات والتهيئة.
      </p>
    </div>

    <div class="card" style="border:2px solid var(--danger);border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:var(--danger);margin-bottom:16px;">⚠️ البيانات التي ستُحذف:</h3>
      <ul style="line-height:2;color:var(--text-1);padding-right:20px;">
        <li>📋 فواتير المبيعات وفواتير الشراء ومردوداتها</li>
        <li>📒 القيود المحاسبية اليومية بالكامل</li>
        <li>🏷️ كتالوج الأصناف (المنتجات) بالكامل</li>
        <li>📦 أرصدة المخازن وحركات المخزون</li>
        <li>💰 حركات الصناديق النقدية والبنوك</li>
        <li>🧾 المصروفات وعروض الأسعار والشيكات</li>
      </ul>
    </div>

    <div class="card" style="border:2px solid var(--success-text,#16a34a);border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:var(--success-text,#16a34a);margin-bottom:16px;">✅ البيانات التي ستُبقى:</h3>
      <ul style="line-height:2;color:var(--text-1);padding-right:20px;">
        <li>🏷️ فئات الأصناف والمستودعات والمخازن</li>
        <li>🤝 الشركاء (العملاء + الموردين)</li>
        <li>📊 شجرة الحسابات وقوائم الأسعار</li>
        <li>👥 مندوبي المبيعات والموظفين</li>
        <li>🏦 الصناديق والبنوك (يُعاد رصيدها لصفر)</li>
        <li>⚙️ إعدادات الشركة والمستخدمين</li>
      </ul>
    </div>

    <div style="background:var(--bg-2);border-radius:8px;padding:16px;margin-bottom:24px;">
      <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-weight:600;">
        <input type="checkbox" id="reset-confirm-check" style="width:18px;height:18px;accent-color:var(--danger);">
        أفهم أن هذا الإجراء <strong style="color:var(--danger);">لا يمكن التراجع عنه</strong> وأريد المتابعة
      </label>
    </div>

    <div style="text-align:center;">
      <button id="reset-btn" class="btn" disabled
        style="background:var(--danger);color:#fff;padding:14px 40px;font-size:16px;font-weight:700;border-radius:8px;opacity:0.5;cursor:not-allowed;">
        🗑️ تصفير البيانات الآن
      </button>
    </div>

    <div id="reset-progress" class="hidden" style="margin-top:24px;">
      <div style="background:var(--bg-2);border-radius:8px;padding:20px;">
        <div id="reset-progress-text" style="font-size:14px;color:var(--text-2);margin-bottom:12px;">جارٍ التصفير...</div>
        <div style="background:var(--bg-3);border-radius:4px;height:8px;overflow:hidden;">
          <div id="reset-progress-bar" style="background:var(--danger);height:100%;width:0%;transition:width 0.3s;"></div>
        </div>
        <div id="reset-log" style="margin-top:12px;max-height:200px;overflow-y:auto;font-family:monospace;font-size:12px;color:var(--text-2);"></div>
      </div>
    </div>

    <div id="reset-done" class="hidden" style="margin-top:24px;text-align:center;padding:24px;background:var(--bg-2);border-radius:12px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h3 style="color:var(--success-text,#16a34a);">تم التصفير بنجاح!</h3>
      <p style="color:var(--text-2);">البرنامج الآن جاهز للعمل من جديد</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:16px;">🔄 تحديث الصفحة</button>
    </div>
  </div>`;
}

function attachEvents() {
  const check = document.getElementById("reset-confirm-check");
  const btn   = document.getElementById("reset-btn");
  console.log("[DataReset] attachEvents initialized:", { check, btn });

  if (!check || !btn) {
    console.error("[DataReset] Checkbox or Button elements not found!");
    return;
  }

  // Use both 'change' and 'click' event listeners to ensure mobile/desktop compatibility
  const updateState = () => {
    const isChecked = check.checked;
    console.log("[DataReset] Confirm checkbox state:", isChecked);
    btn.disabled = !isChecked;
    btn.style.opacity = isChecked ? "1" : "0.5";
    btn.style.cursor  = isChecked ? "pointer" : "not-allowed";
  };

  check.addEventListener("change", updateState);
  check.addEventListener("click", updateState);

  btn.addEventListener("click", (e) => {
    console.log("[DataReset] Reset button clicked!");
    e.preventDefault();
    performReset().catch(err => {
      console.error("[DataReset] performReset uncaught error:", err);
    });
  });
}

async function performReset() {
  console.log("[DataReset] performReset execution started...");
  const btn      = document.getElementById("reset-btn");
  const progress = document.getElementById("reset-progress");
  const bar      = document.getElementById("reset-progress-bar");
  const text     = document.getElementById("reset-progress-text");
  const log      = document.getElementById("reset-log");
  const done     = document.getElementById("reset-done");

  if (!btn || !progress || !bar || !text || !log || !done) {
    console.error("[DataReset] One or more progress/log elements not found!");
    alert("حدث خطأ في تحميل عناصر الصفحة");
    return;
  }

  btn.disabled = true;
  progress.classList.remove("hidden");
  done.classList.add("hidden");
  log.innerHTML = "";

  const addLog = (msg) => {
    console.log(`[DataReset Log] ${msg}`);
    log.innerHTML += `<div style="margin-bottom:4px;">${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  };

  const setProgress = (pct, label) => {
    bar.style.width  = pct + "%";
    text.textContent = label;
  };

  // Dynamically import company ID selector to guarantee we have the live, active company ID
  let activeCompanyId = COMPANY_ID;
  try {
    const { COMPANY_ID: liveId } = await import("../firebase-config.js");
    if (liveId) activeCompanyId = liveId;
  } catch (e) {
    console.warn("[DataReset] Failed to load live COMPANY_ID, falling back:", e);
  }

  console.log("[DataReset] Resetting data for company ID:", activeCompanyId);
  addLog(`🚀 بدء عملية التصفير للشركة: ${activeCompanyId}...`);

  try {
    const total = TRANSACTIONAL_COLLECTIONS.length + 3; // +3 for cash, bank, and COA reset
    let done_count = 0;

    for (const colName of TRANSACTIONAL_COLLECTIONS) {
      setProgress(Math.round((done_count / total) * 100), `جارٍ حذف: ${colName}...`);
      addLog(`⌛ جارٍ مسح مجموعة: ${colName}...`);
      
      const colRef = collection(db, `companies/${activeCompanyId}/${colName}`);
      let totalDeleted = 0;

      while (true) {
        const snap = await getDocs(query(colRef, limit(400)));
        if (snap.empty) break;

        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        totalDeleted += snap.docs.length;
      }

      addLog(`✅ ${colName}: تم حذف ${totalDeleted} سجل`);
      done_count++;
    }

    // Reset cash box balances to 0
    setProgress(Math.round((done_count / total) * 100), "إعادة رصيد الصناديق لصفر...");
    addLog("⌛ جارٍ تصفير أرصدة الصناديق...");
    const cbRef = collection(db, `companies/${activeCompanyId}/cashBoxes`);
    const cbSnap = await getDocs(cbRef);
    if (!cbSnap.empty) {
      const batch = writeBatch(db);
      cbSnap.docs.forEach(d => batch.update(d.ref, { balance: 0 }));
      await batch.commit();
      addLog(`✅ تم تصفير أرصدة ${cbSnap.docs.length} صندوق نقدي`);
    } else {
      addLog("ℹ️ لا توجد صناديق نقدية لتصفيرها");
    }
    done_count++;

    // Reset bank account balances to 0
    setProgress(Math.round((done_count / total) * 100), "إعادة رصيد البنوك لصفر...");
    addLog("⌛ جارٍ تصفير أرصدة الحسابات البنكية...");
    const baRef = collection(db, `companies/${activeCompanyId}/bankAccounts`);
    const baSnap = await getDocs(baRef);
    if (!baSnap.empty) {
      const batch = writeBatch(db);
      baSnap.docs.forEach(d => batch.update(d.ref, { balance: 0 }));
      await batch.commit();
      addLog(`✅ تم تصفير أرصدة ${baSnap.docs.length} حساب بنكي`);
    } else {
      addLog("ℹ️ لا توجد حسابات بنكية لتصفيرها");
    }
    done_count++;

    // Reset Chart of Accounts balances to 0
    setProgress(Math.round((done_count / total) * 100), "إعادة رصيد شجرة الحسابات لصفر...");
    addLog("⌛ جارٍ تصفير أرصدة شجرة الحسابات...");
    const coaRef = collection(db, `companies/${activeCompanyId}/chartOfAccounts`);
    const coaSnap = await getDocs(coaRef);
    if (!coaSnap.empty) {
      const batch = writeBatch(db);
      coaSnap.docs.forEach(d => batch.update(d.ref, {
        balance: 0,
        totalDebit: 0,
        totalCredit: 0
      }));
      await batch.commit();
      addLog(`✅ تم تصفير أرصدة ${coaSnap.docs.length} حساب في شجرة الحسابات`);
    } else {
      addLog("ℹ️ لا توجد حسابات في شجرة الحسابات لتصفيرها");
    }
    done_count++;

    setProgress(100, "اكتمل التصفير!");
    addLog("🎉 تم تصفير كل البيانات التشغيلية وقاعدة البيانات بنجاح");
    done.classList.remove("hidden");
    btn.style.display = "none"; // Hide button once done successfully


  } catch (err) {
    addLog(`❌ خطأ: ${err.message}`);
    text.textContent = "حدث خطأ أثناء التصفير";
    text.style.color = "var(--danger)";
    btn.disabled = false;
  }
}
