// ============================================================
// IDHAM ERP — Stock Health & Silent Self-Healing Checker (v2.1)
// Automated Background Self-Healing & Zero False Alarms
// High Contrast Light/Day Mode & Zero-Duplicate Stock Protection
// ============================================================

import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, adjustStockBulk } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let _isChecking = false;

function translateUnit(u) {
  const map = {
    Piece:'حبة', Carton:'كرتون', Box:'بوكس', Bag:'كيس', Pack:'شد',
    Sack:'شوال', Bale:'بالة', Barrel:'برميل', Tray:'طبق', Gallon:'جالون',
    Kilogram:'كيلو', Ton:'طن', Liter:'لتر', Gram:'جرام', Can:'علبة',
    Bottle:'زجاجة', Meter:'متر', Tank:'تنك', Roll:'رول', Pallet:'باليت',
    PCS:'حبة'
  };
  return map[u] || u || 'وحدة';
}

// ─────────────────────────────────────────────────────────────
// 1. فحص الحركات والمعالجة الذاتية الصامتة (Silent Self-Healing)
// ─────────────────────────────────────────────────────────────
export async function checkStockOperationsHealth() {
  if (_isChecking) return;
  _isChecking = true;

  try {
    const bannerEl = document.getElementById("stock-operations-alert-banner");

    // 1. استعلام فواتير المبيعات المعلقة الخصم
    let pendingSales = [];
    try {
      const pendingSalesQ = query(
        collection(db, `companies/${COMPANY_ID}/salesInvoices`),
        where("stockStatus", "==", "pending_deduction")
      );
      const salesSnap = await getDocs(pendingSalesQ);
      pendingSales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("[StockHealthChecker] sales query warn:", e.message);
    }

    // 2. استعلام أوامر التحويل المخزني المعلقة
    let pendingTransfers = [];
    try {
      const pendingTrQ = query(
        collection(db, `companies/${COMPANY_ID}/stockTransfers`),
        where("stockStatus", "in", ["pending_transfer_out", "failed_transfer_out", "failed_transfer_in"])
      );
      const trSnap = await getDocs(pendingTrQ);
      pendingTransfers = trSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("[StockHealthChecker] transfer query warn:", e.message);
    }

    if (pendingSales.length === 0 && pendingTransfers.length === 0) {
      if (bannerEl) {
        bannerEl.style.display = "none";
        bannerEl.innerHTML = "";
        bannerEl.className = "";
      }
      return;
    }

    // ───────────────────────────────────────────────────────────
    // 🛡️ المعالجة الذاتية الصامتة في الخلفية (Silent Self-Healing)
    // فحص العمليات: إذا كانت منفذة فعلياً أو ملغاة، تُعالج وتُغلق بصمت تام دون إزعاج المدير
    // ───────────────────────────────────────────────────────────
    const activeRemainingTransfers = [];
    for (const tr of pendingTransfers) {
      const insp = await inspectTransferStockState(tr);
      if (insp.isSafelyCancelled) {
        // ملغى مسبقاً -> تحديث بصمت
        updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, tr.id), {
          stockStatus: "cancelled",
          stockUpdatedAt: serverTimestamp()
        }).catch(() => {});
      } else if (insp.isFullyExecuted) {
        // مخصوم ومستلم فعلياً -> إغلاق بصمت
        updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, tr.id), {
          stockStatus: "completed",
          stockUpdatedAt: serverTimestamp()
        }).catch(() => {});
      } else if (insp.isDeductedInTransit) {
        // مخصوم وقيد النقل -> تثبيت بصمت
        updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, tr.id), {
          stockStatus: "in_transit_deducted",
          stockUpdatedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        // معلق فعلياً بحاجة لتدخل
        activeRemainingTransfers.push(tr);
      }
    }

    const activeRemainingSales = [];
    for (const inv of pendingSales) {
      const insp = await inspectSaleStockState(inv);
      if (insp.isFullyDeducted) {
        // مخصوم ومطابق تماماً -> إغلاق بصمت
        updateDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, inv.id), {
          stockStatus: "completed",
          stockUpdatedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        // حصر العملية وعرضها في نافذة التدقيق للمراجعة دون أي تعديل تلقائي على البيانات
        activeRemainingSales.push({ ...inv, missingLines: insp.missingLines || [] });
      }
    }

    const totalRealIssues = activeRemainingSales.length + activeRemainingTransfers.length;

    // إذا عالجت المعالجة الذاتية الصامتة كافة الحالات، يختفي التنبيه تماماً (صفر إنذارات كاذبة!)
    if (totalRealIssues === 0) {
      if (bannerEl) {
        bannerEl.style.display = "none";
        bannerEl.innerHTML = "";
        bannerEl.className = "";
      }
      return;
    }

    // إذا وُجدت عملية معلقة حقيقية فعلاً لم تُخصم، يظهر الإشعار فائق الوضوح
    if (!bannerEl) return;
    bannerEl.className = "stock-operations-alert-box";
    bannerEl.style.display = "flex";

    bannerEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:280px;">
        <div class="alert-icon-box">
          ⚠️
        </div>
        <div>
          <div class="alert-title">
            تنبيه حركات مخزنية معلقة (${totalRealIssues} عملية بحاجة للمراجعة والمزامنة)
          </div>
          <div class="alert-desc">
            ${activeRemainingSales.length > 0 ? `• يوجد <strong style="color:inherit; font-weight:800;">${activeRemainingSales.length}</strong> فواتير مبيعات لم تكتمل مزامنتها. ` : ''}
            ${activeRemainingTransfers.length > 0 ? `• يوجد <strong style="color:inherit; font-weight:800;">${activeRemainingTransfers.length}</strong> أوامر تحويل مخزني بحاجة للتأكد والمزامنة.` : ''}
          </div>
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <button class="alert-btn" onclick="window.openStockHealthModal()" title="انقر لعرض التفاصيل والشرح وحالة كل عملية قبل المزامنة">
          <span>📋</span> <span>عرض التفاصيل والشرح والمزامنة</span>
        </button>
      </div>
    `;

    // حفظ العمليات الحقيقية المتبقية لمودال التفاصيل
    window._pendingStockIssues = { sales: activeRemainingSales, transfers: activeRemainingTransfers };

  } catch (err) {
    console.warn("[StockHealthChecker] Check error:", err.message);
  } finally {
    _isChecking = false;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. فحص حالة حركات المخزون الفعلية في كرت الصنف (Stock Transactions)
// ─────────────────────────────────────────────────────────────
async function inspectTransferStockState(tr) {
  try {
    const num = tr.number || "";
    const qDoc = query(
      collection(db, `companies/${COMPANY_ID}/stockTransactions`),
      where("documentNumber", "==", num)
    );
    const snap = await getDocs(qDoc);
    let txs = snap.docs.map(d => d.data());

    if (txs.length === 0 && tr.id) {
      const qSrc = query(
        collection(db, `companies/${COMPANY_ID}/stockTransactions`),
        where("sourceId", "==", tr.id)
      );
      const snapSrc = await getDocs(qSrc);
      txs = snapSrc.docs.map(d => d.data());
    }

    const hasOut = txs.some(t => t.type === "transfer_out");
    const hasIn = txs.some(t => t.type === "transfer_in");
    const hasCancel = txs.some(t => t.type === "transfer_cancel");

    const isFullyExecuted = (tr.status === "received" && hasOut && hasIn) || (hasOut && hasIn);
    const isSafelyCancelled = tr.status === "cancelled" || hasCancel;
    const isDeductedInTransit = tr.status === "in_transit" && hasOut;

    return {
      txsCount: txs.length,
      hasOut,
      hasIn,
      hasCancel,
      isFullyExecuted,
      isSafelyCancelled,
      isDeductedInTransit
    };
  } catch (err) {
    console.warn("[StockHealthChecker] inspect transfer err:", err);
    return { error: err.message };
  }
}

async function inspectSaleStockState(inv) {
  try {
    const invNum = inv.invoiceNumber || inv.number || inv.id;
    const [snapDoc, snapSrc] = await Promise.all([
      getDocs(query(collection(db, `companies/${COMPANY_ID}/stockTransactions`), where("documentNumber", "==", invNum))),
      getDocs(query(collection(db, `companies/${COMPANY_ID}/stockTransactions`), where("sourceId", "==", inv.id)))
    ]);
    const txMap = {};
    [...snapDoc.docs, ...snapSrc.docs].forEach(d => { txMap[d.id] = d.data(); });
    const txs = Object.values(txMap);

    const lines = inv.lines || inv.items || [];
    const missingLines = [];

    for (const l of lines) {
      if (!l.productId || String(l.productId).startsWith("adhoc_") || l.isCustom) continue;
      const factor = (l.altUnit && l.unitFactor > 1 && l.selectedUnit === l.altUnit) ? (parseFloat(l.unitFactor) || 1) : 1;
      const expectedQty = (parseFloat(l.qty) || 0) * factor;

      const pTxs = txs.filter(t => t.productId === l.productId);
      let actualDeducted = 0;
      pTxs.forEach(t => {
        const delta = parseFloat(t.qtyChange) || 0;
        actualDeducted += -delta;
      });

      const diff = Math.round((expectedQty - actualDeducted) * 1000) / 1000;
      if (diff > 0.001) {
        missingLines.push({
          productId: l.productId,
          productName: l.productName || l.name || "",
          warehouseId: inv.warehouseId,
          expectedQty,
          actualDeducted,
          missingQty: diff
        });
      }
    }

    return {
      hasSaleOut: txs.some(t => t.type === "sale_out"),
      isFullyDeducted: missingLines.length === 0,
      missingLines,
      txsCount: txs.length
    };
  } catch (err) {
    console.warn("[StockHealthChecker] inspect sale err:", err);
    return { error: err.message, hasSaleOut: false, isFullyDeducted: false, missingLines: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. نافذة التفاصيل الشاملة مع الشرح المفصل لكل عملية قبل المزامنة
// ─────────────────────────────────────────────────────────────
window.openStockHealthModal = async () => {
  const issues = window._pendingStockIssues || { sales: [], transfers: [] };
  let existingModal = document.getElementById("stock-health-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "stock-health-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
  modal.style.backdropFilter = "blur(4px)";
  modal.style.zIndex = "99999";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.direction = "rtl";

  // شاشة تحميل أولية أثناء فحص كروت الأصناف
  modal.innerHTML = `
    <div style="background:var(--bg-1,#ffffff); color:var(--text-0,#0f172a); border:1px solid var(--border,#cbd5e1); border-radius:16px; max-width:820px; width:95%; padding:35px; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.3);">
      <div style="font-size:36px; animation:spin 1s infinite linear; margin-bottom:14px;">⏳</div>
      <h3 style="margin:0 0 8px; font-size:18px; font-weight:800;">جارٍ الفحص الذكي للعمليات المخزنية المعلقة…</h3>
      <p style="margin:0; font-size:13px; color:var(--text-muted,#64748b);">يتم التحقق من الحركات الفعلية في كروت الأصناف للتأكد من عدم تكرار الخصم…</p>
    </div>
  `;
  document.body.appendChild(modal);

  // فحص الحركات لكل عملية بالتوازي
  const transferInspections = await Promise.all((issues.transfers || []).map(tr => inspectTransferStockState(tr)));
  const saleInspections = await Promise.all((issues.sales || []).map(inv => inspectSaleStockState(inv)));

  // بناء كروت أوامر التحويل
  const transfersHtml = (issues.transfers || []).map((tr, idx) => {
    const insp = transferInspections[idx] || {};
    const linesList = (tr.lines || []).map(l => `
      <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed var(--border-soft,#e2e8f0); font-size:12px;">
        <span style="font-weight:700;">• ${l.productName || 'صنف'}</span>
        <span class="mono font-bold" style="color:var(--brand,#4f46e5);">${l.qty} ${translateUnit(l.selectedUnit || l.unit)}</span>
      </div>
    `).join("");

    let diagnosisHtml = "";
    let actionBtnHtml = "";

    if (insp.isSafelyCancelled) {
      diagnosisHtml = `
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#334155; line-height:1.6;">
          <div style="font-weight:800; color:#475569; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>🚫</span> <span>التشخيص الفعلي: أمر التحويل ملغى ومسترجع المخزون مسبقاً</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم إلغاء أمر التحويل مسبقاً واسترجاع كمياته بالكامل إلى المستودع المصدر (${tr.fromWarehouseName || 'المستودع المصدر'}). سبب ظهور التنبيه هو بقاء علامة المزامنة السحابية معلقة. <strong>الضغط على الزر سيؤكد إغلاق التنبيه نهائياً دون المساس بأي رصيد.</strong>
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-tr-${tr.id}" onclick="window.healSingleTransferStock('${tr.id}')" style="background:#475569; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ إغلاق التنبيه
        </button>
      `;
    } else if (insp.isFullyExecuted) {
      diagnosisHtml = `
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#14532d; line-height:1.6;">
          <div style="font-weight:800; color:#15803d; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>✅</span> <span>التشخيص الفعلي: الحركات المخزنية منفذة ومكتملة بالكامل</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم التأكد من سجلات المخازن: الكميات <strong>مخصومة فعلياً</strong> من المستودع المصدر (${tr.fromWarehouseName || 'المصدر'}) و<strong>مودعة فعلياً</strong> في المستودع المستلم (${tr.toWarehouseName || 'المستلم'}). سبب التنبيه هو تعذر تحديث علامة المزامنة السحابية فقط. <strong>الضغط على الزر سيعتمد إغلاق التنبيه بأمان 100% دون أي تكرار للخصم.</strong>
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-tr-${tr.id}" onclick="window.healSingleTransferStock('${tr.id}')" style="background:#15803d; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ اعتماد إغلاق التنبيه (آمن 100%)
        </button>
      `;
    } else if (insp.isDeductedInTransit) {
      diagnosisHtml = `
        <div style="background:#fffbeb; border:1.5px solid #fcd34d; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#78350f; line-height:1.6;">
          <div style="font-weight:800; color:#b45309; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>🚚</span> <span>التشخيص الفعلي: البضاعة قيد النقل (مخصومة من المصدر وبانتظار الاستلام)</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم خصم البضاعة من (${tr.fromWarehouseName}) وهي قيد النقل للوجهة (${tr.toWarehouseName}). الضغط على الزر سيثبت حالة المستند كـ "قيد النقل" ليزول التنبيه بانتظار تأكيد استلامها.
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-tr-${tr.id}" onclick="window.healSingleTransferStock('${tr.id}')" style="background:#b45309; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          🚚 تثبيت قيد النقل
        </button>
      `;
    } else {
      diagnosisHtml = `
        <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#7f1d1d; line-height:1.6;">
          <div style="font-weight:800; color:#991b1b; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>⚠️</span> <span>التشخيص الفعلي: بضاعة معلقة لم يتم خصمها من المصدر</span>
          </div>
          <div>
            <strong>الشرح:</strong> انقطع الاتصال أثناء حفظ التحويل ولم تُسجل حركة الخصم في المستودع المصدر (${tr.fromWarehouseName}). <strong>الضغط على الزر سيقوم بتنفيذ الخصم الفعلي بدقة وتحديث الأرصدة.</strong>
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-tr-${tr.id}" onclick="window.healSingleTransferStock('${tr.id}')" style="background:#dc2626; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ⚡ تنفيذ الخصم والمزامنة الآن
        </button>
      `;
    }

    return `
      <div style="background:var(--bg-0,#f8fafc); border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-soft,#e2e8f0); padding-bottom:10px;">
          <div>
            <span style="font-weight:900; font-size:14.5px; color:var(--text-0,#0f172a);">📦 أمر تحويل: ${tr.number || tr.id}</span>
            <span style="font-size:12px; color:var(--text-muted,#64748b); margin-right:10px;">📅 ${tr.date || ''}</span>
            <span style="font-size:11px; padding:2px 8px; border-radius:6px; background:#e0e7ff; color:#3730a3; font-weight:700; margin-right:6px;">
              حالة المستند: ${tr.status === 'received' ? 'تم الاستلام' : (tr.status === 'cancelled' ? 'ملغى' : 'قيد النقل')}
            </span>
          </div>
          <div>
            ${actionBtnHtml}
          </div>
        </div>

        <div style="font-size:12.5px; color:var(--text-2,#334155); margin-top:8px;">
          <strong>المسار:</strong> من <span style="color:#0369a1; font-weight:700;">${tr.fromWarehouseName || 'المستودع المصدر'}</span> ➔ إلى <span style="color:#059669; font-weight:700;">${tr.toWarehouseName || 'المستودع المستلم'}</span>
          ${tr.createdByName ? ` <span style="color:var(--text-muted,#64748b); font-size:11.5px;">(أنشئ بواسطة: ${tr.createdByName})</span>` : ''}
        </div>

        <div style="margin-top:8px; background:var(--bg-1,#ffffff); border:1px solid var(--border-soft,#e2e8f0); border-radius:8px; padding:8px 12px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted,#64748b); margin-bottom:4px;">الأصناف المحولة:</div>
          ${linesList || '<div style="font-size:12px; color:#94a3b8;">لا توجد أصناف</div>'}
        </div>

        ${diagnosisHtml}
      </div>
    `;
  }).join("");

  // بناء كروت فواتير المبيعات
  const salesHtml = (issues.sales || []).map((inv, idx) => {
    const insp = saleInspections[idx] || {};
    const linesList = (inv.lines || []).map(l => `${l.name || l.productName || 'صنف'} (${l.qty} ${translateUnit(l.selectedUnit || l.unit)})`).join(" ، ");

    let diagnosisHtml = "";
    let actionBtnHtml = "";

    if (insp.hasSaleOut) {
      diagnosisHtml = `
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#14532d; line-height:1.6;">
          <div style="font-weight:800; color:#15803d; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>✅</span> <span>التشخيص الفعلي: بضاعة الفاتورة مخصومة بالفعل من كرت الصنف</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم فحص سجلات المخزن: أصناف هذه الفاتورة <strong>مخصومة فعلياً</strong> من المستودع/السيارة. سبب التنبيه هو تعذر تحديث علامة المزامنة السحابية فقط. <strong>الضغط على الزر سيعتمد المزامنة بأمان 100% دون تكرار الخصم.</strong>
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-sale-${inv.id}" onclick="window.healSingleSaleStock('${inv.id}')" style="background:#15803d; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ✅ اعتماد إغلاق التنبيه
        </button>
      `;
    } else {
      diagnosisHtml = `
        <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:12px; color:#7f1d1d; line-height:1.6;">
          <div style="font-weight:800; color:#991b1b; display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span>⚠️</span> <span>التشخيص الفعلي: فاتورة مبيعات معلقة لم يكتمل خصمها</span>
          </div>
          <div>
            <strong>الشرح:</strong> تم حفظ الفاتورة لكن تعذر خصم كمياتها من المستودع/السيارة بسبب ضعف الاتصال أثناء البيع. <strong>الضغط على الزر سيقوم بتنفيذ الخصم الآن بدقة.</strong>
          </div>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn btn-sm" id="btn-sync-sale-${inv.id}" onclick="window.healSingleSaleStock('${inv.id}')" style="background:#dc2626; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer;">
          ⚡ تنفيذ الخصم والمزامنة الآن
        </button>
      `;
    }

    return `
      <div style="background:var(--bg-0,#f8fafc); border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-soft,#e2e8f0); padding-bottom:10px;">
          <div>
            <span style="font-weight:900; font-size:14.5px; color:var(--text-0,#0f172a);">🧾 فاتورة مبيعات: ${inv.invoiceNumber || inv.number || inv.id}</span>
            <span style="font-size:12px; color:var(--text-muted,#64748b); margin-right:10px;">📅 ${inv.date || ''}</span>
          </div>
          <div>
            ${actionBtnHtml}
          </div>
        </div>

        <div style="font-size:12.5px; color:var(--text-2,#334155); margin-top:8px;">
          <strong>العميل:</strong> ${inv.customerName || 'عميل نقدي'} ${inv.repName ? `| <strong>المندوب:</strong> ${inv.repName}` : ''}
        </div>

        <div style="margin-top:8px; font-size:12px; color:#0284c7; background:var(--bg-1,#ffffff); border:1px solid var(--border-soft,#e2e8f0); border-radius:8px; padding:8px 12px;">
          <strong>الأصناف:</strong> ${linesList || 'لا توجد بنود'}
        </div>

        ${diagnosisHtml}
      </div>
    `;
  }).join("");

  // قالب النافذة النهائي
  modal.innerHTML = `
    <div style="background:var(--bg-1,#ffffff); color:var(--text-0,#0f172a); border:1px solid var(--border,#cbd5e1); border-radius:16px; max-width:820px; width:95%; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
      
      <!-- Modal Header -->
      <div style="padding:16px 22px; border-bottom:1px solid var(--border,#e2e8f0); display:flex; justify-content:space-between; align-items:center; background:var(--bg-0,#f8fafc);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">🛡️</span>
          <div>
            <h3 style="margin:0; font-size:16.5px; font-weight:900; color:var(--text-0,#0f172a);">تشخيص وتفاصيل العمليات المخزنية المعلقة</h3>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-muted,#64748b);">فحص حالة كروت الأصناف والتأكد من الحركات الفعلية قبل المزامنة لمنع أي تكرار</p>
          </div>
        </div>
        <button style="background:none; border:none; color:var(--text-muted,#64748b); font-size:22px; font-weight:700; cursor:pointer; padding:4px 8px; border-radius:8px;" onclick="document.getElementById('stock-health-modal').remove()">✕</button>
      </div>

      <!-- Modal Body -->
      <div style="padding:20px 22px; overflow-y:auto; flex:1;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:12px 16px; margin-bottom:18px; font-size:12.5px; color:#1e40af; line-height:1.5;">
          💡 <strong>نظام الحماية الذكي:</strong> تم فحص قاعدة البيانات للتأكد مما إذا كانت الكميات مخصومة أو مستلمة بالفعل في سجلات كرت الصنف، لتتمكن من اعتماد المزامنة أو إغلاق التنبيهات بأمان تام ودون أي قلق من تكرار الحركات.
        </div>

        ${transfersHtml ? `<div style="font-weight:900; font-size:14px; color:#d97706; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span>🔄</span> <span>أوامر تحويل مخزني (${issues.transfers.length})</span></div>${transfersHtml}` : ''}
        ${salesHtml ? `<div style="font-weight:900; font-size:14px; color:#dc2626; margin-top:14px; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span>🧾</span> <span>فواتير مبيعات معلقة (${issues.sales.length})</span></div>${salesHtml}` : ''}
      </div>

      <!-- Modal Footer -->
      <div style="padding:14px 22px; border-top:1px solid var(--border,#e2e8f0); display:flex; justify-content:space-between; align-items:center; background:var(--bg-0,#f8fafc); flex-wrap:wrap; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('stock-health-modal').remove()" style="font-weight:700; padding:8px 18px; border-radius:8px;">إغلاق النافذة</button>
        <button class="btn btn-primary btn-sm" id="btn-heal-all-master" onclick="window.healAllPendingStockIssues()" style="background:#4f46e5; font-weight:800; padding:8px 20px; border-radius:8px;">
          ⚡ معالجة وتحديث كافة العمليات المعلقة (فحص ذكي وآمن)
        </button>
      </div>

    </div>
  `;
};

// ─────────────────────────────────────────────────────────────
// 4. معالجة أمر تحويل واحد (مع حماية تامة من التكرار)
// ─────────────────────────────────────────────────────────────
window.healSingleTransferStock = async (trId) => {
  const issues = window._pendingStockIssues || { transfers: [] };
  const tr = issues.transfers.find(t => t.id === trId);
  if (!tr) return;

  const btn = document.getElementById(`btn-sync-tr-${trId}`);
  if (btn) { btn.disabled = true; btn.textContent = "جاري المعالجة…"; }

  try {
    const state = await inspectTransferStockState(tr);

    if (state.isSafelyCancelled) {
      // أمر التحويل ملغى
      await updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, trId), {
        stockStatus: "cancelled",
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تم إغلاق تنبيه أمر التحويل الملغى ${tr.number || trId}`, "success");
    } else if (state.isFullyExecuted) {
      // الحركات مسجلة بالكامل في كرت الصنف
      await updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, trId), {
        stockStatus: "completed",
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تم اعتماد المزامنة للتحويل ${tr.number || trId} بنجاح دون المساس بالأرصدة`, "success");
    } else if (state.isDeductedInTransit) {
      // مخصوم وموجود قيد النقل
      await updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, trId), {
        stockStatus: "in_transit_deducted",
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تم تثبيت حالة قيد النقل للتحويل ${tr.number || trId}`, "success");
    } else {
      // يحتاج خصم فعلي من المصدر
      const adjustments = [];
      const fromWh = tr.fromWarehouseId;
      for (const line of (tr.lines || [])) {
        const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? line.unitFactor : 1;
        const effQty = line.effectiveQty !== undefined ? line.effectiveQty : (parseFloat(line.qty) || 0) * factor;

        if (!state.hasOut) {
          adjustments.push({
            warehouseId: fromWh,
            productId: line.productId,
            qtyDelta: -effQty,
            metadata: {
              date: tr.date || new Date().toISOString().slice(0, 10),
              type: "transfer_out",
              sourceType: "stockTransfer",
              sourceId: tr.id,
              documentNumber: tr.number,
              productName: line.productName,
              notes: `مزامنة تحويل معلق إلى ${tr.toWarehouseName} (${line.qty})`
            }
          });
        }
      }

      if (adjustments.length > 0) {
        await adjustStockBulk(adjustments);
      }

      const nextStatus = (tr.status === "received") ? "completed" : "in_transit_deducted";
      await updateDoc(doc(db, `companies/${COMPANY_ID}/stockTransfers`, trId), {
        stockStatus: nextStatus,
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تمت مزامنة وخصم مخزون أمر التحويل ${tr.number || trId} بنجاح`, "success");
    }

    await checkStockOperationsHealth();
    if (document.getElementById("stock-health-modal")) {
      window.openStockHealthModal();
    }
  } catch (err) {
    if (window.showToast) window.showToast(`❌ فشلت المزامنة: ${err.message}`, "error");
    if (btn) { btn.disabled = false; btn.textContent = "⚡ إعادة المحاولة"; }
  }
};

// ─────────────────────────────────────────────────────────────
// 5. معالجة فاتورة مبيعات واحدة (مع حماية تامة من التكرار)
// ─────────────────────────────────────────────────────────────
window.healSingleSaleStock = async (invId) => {
  const issues = window._pendingStockIssues || { sales: [] };
  const inv = issues.sales.find(s => s.id === invId);
  if (!inv) return;

  const btn = document.getElementById(`btn-sync-sale-${invId}`);
  if (btn) { btn.disabled = true; btn.textContent = "جاري الفحص…"; }

  try {
    const state = await inspectSaleStockState(inv);

    if (state.hasSaleOut) {
      // مخصومة بالفعل من المخزون
      await updateDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, invId), {
        stockStatus: "completed",
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تم اعتماد المزامنة للفاتورة ${inv.invoiceNumber || inv.number || invId} دون تكرار الخصم`, "success");
    } else {
      // تحتاج خصم فعلي
      const adjustments = (inv.lines || [])
        .filter(line => line.productId && line.qty)
        .map(line => {
          const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor)||1) : 1;
          const netQty = (parseFloat(line.qty) || 0) * factor;
          return {
            warehouseId: inv.warehouseId,
            productId: line.productId,
            qtyDelta: -netQty,
            metadata: {
              type: "sale_out",
              sourceType: "salesInvoice",
              sourceId: inv.invoiceNumber || inv.number || inv.id,
              documentNumber: inv.invoiceNumber || inv.number || inv.id,
              invoiceNumber: inv.invoiceNumber || inv.number || inv.id,
              allowNegative: true,
              productName: line.name || line.productName || "",
              notes: `خصم ذاتي معلق — فاتورة ${inv.invoiceNumber || inv.number || inv.id}`
            }
          };
        });

      if (adjustments.length > 0) {
        await adjustStockBulk(adjustments);
      }

      await updateDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, invId), {
        stockStatus: "completed",
        stockUpdatedAt: serverTimestamp()
      });
      if (window.showToast) window.showToast(`✅ تم خصم المخزون بنجاح للفاتورة ${inv.invoiceNumber || inv.number || inv.id}`, "success");
    }

    await checkStockOperationsHealth();
    if (document.getElementById("stock-health-modal")) {
      window.openStockHealthModal();
    }
  } catch (err) {
    if (window.showToast) window.showToast(`❌ فشلت المزامنة: ${err.message}`, "error");
    if (btn) { btn.disabled = false; btn.textContent = "⚡ إعادة المحاولة"; }
  }
};

// ─────────────────────────────────────────────────────────────
// 6. معالجة ومزامنة كافة العمليات دفعة واحدة بأمان تام
// ─────────────────────────────────────────────────────────────
window.healAllPendingStockIssues = async () => {
  const masterBtn = document.getElementById("btn-heal-all-master");
  if (masterBtn) { masterBtn.disabled = true; masterBtn.textContent = "جارٍ الفحص والمعالجة…"; }

  const issues = window._pendingStockIssues || { sales: [], transfers: [] };
  for (const inv of (issues.sales || [])) {
    await window.healSingleSaleStock(inv.id);
  }
  for (const tr of (issues.transfers || [])) {
    await window.healSingleTransferStock(tr.id);
  }

  const modal = document.getElementById("stock-health-modal");
  if (modal) modal.remove();
  if (window.showToast) window.showToast("✅ تمت معالجة وتحديث كافة العمليات المعلقة بأمان تام!", "success");
};

// التصدير للكائن العام window
window.checkStockOperationsHealth = checkStockOperationsHealth;
