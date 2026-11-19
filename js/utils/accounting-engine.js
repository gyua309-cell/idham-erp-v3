// ============================================================
// IDHAM ERP — Automated Accounting Engine v1.0
// مُحرك الأتمتة المحاسبية — Double-Entry Bookkeeping
// ============================================================
//
// كل عملية تشغيلية تُنشئ قيدها المحاسبي تلقائياً:
//  - فاتورة بيع      → قيد مبيعات + قيد تكلفة بضاعة مباعة
//  - فاتورة شراء     → قيد مشتريات
//  - مردود مبيعات    → قيد عكسي للبيع + إرجاع المخزون
//  - مردود مشتريات  → قيد عكسي للشراء
//  - تحصيل من عميل  → قيد تحصيل
//  - سداد لمورد     → قيد سداد
//
// استخدام:
//   import { AccountingEngine } from "../utils/accounting-engine.js";
//   const ae = new AccountingEngine();
//   await ae.init();
//   await ae.createSalesJE(invoice, user);
//
// ============================================================

import { COLS, createJournalEntry, getAll } from "./db.js";
import { query, where, limit, getDocs, orderBy, doc, getDoc } from "./db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// Module-level cache for Chart of Accounts to avoid re-fetching on every invoice/payment
let _sharedAccountsMap = null;
let _sharedAccountsMapTime = 0;

export function invalidateAccountingAccountsCache() {
  _sharedAccountsMap = null;
  _sharedAccountsMapTime = 0;
}

// ──────────────────────────────────────────
// الخريطة المحاسبية — Account Code Mapping
// خاصة بنشاط توزيع المواد الغذائية
// ──────────────────────────────────────────
const ACCT = {
  // الأصول
  CASH_MAIN:              "1-1-1-1-3",   // الصندوق الرئيسى (كما في شجرة الحسابات)
  CASH_POS:               "1-1-1-1-2",   // صندوق النثريات / POS
  CASH_REPS:              "1-1-1-2",     // صناديق المناديب (parent)
  BANK_DEFAULT:           "1-1-1-3-2",   // مصرف الراجحي (الافتراضي)
  RECEIVABLES_RETAIL:     "1-1-2-1-1",   // ذمم عملاء تجزئة - محلية
  RECEIVABLES_REPS:       "1-1-2-1-2",   // ذمم عملاء تجزئة — مناديب (حساب أب)
  RECEIVABLES_WHOLESALE:  "1-1-2-2-1",   // ذمم عملاء جملة - شركات
  INVENTORY_MAIN:         "1-1-4-1-01",  // مخزون المستودع الرئيسي (حساب تفصيلي)
  INVENTORY_VEHICLES:     "1-1-4-1-02",  // مخزون سيارات التوزيع (حساب معتمد)
  VAT_INPUT:              "1-1-5-2",     // ضريبة القيمة المضافة - المدخلات

  // الخصوم
  PAYABLES_LOCAL:         "2-1-1-1-1",   // ذمم موردون محليون (حساب رقابة)
  PAYABLES_IMPORT:        "2-1-1-2-1",   // ذمم موردون استيراد
  VAT_OUTPUT:             "2-1-3-1",     // ضريبة القيمة المضافة - المخرجات

  // الإيرادات — حساب واحد موحد لجميع أنواع المبيعات
  // (طريقة الدفع تحدد الطرف المدين فقط، وليس حساب الإيراد)
  SALES_ALL:              "4-1-1",       // إيرادات المبيعات الموحدة (تجزئة + جملة + مناديب + POS)
  SALES_RETURN:           "4-1-2",       // مردودات ومسموحات المبيعات (حساب موحد)

  // ── الأكواد القديمة (محفوظة كمرجع أرشيفي فقط — لا تُستخدم في القيود الجديدة) ──
  // SALES_RETAIL_CASH:   "4-1-1-1-1"
  // SALES_RETAIL_NET:    "4-1-1-1-2"
  // SALES_RETAIL_CREDIT: "4-1-1-1-3"
  // SALES_WHOLESALE:     "4-1-1-2-1"
  // SALES_POS:           "4-1-1-3"

  // المصروفات — COGS منفصل عن المشتريات
  COGS:                   "5-1-8",       // تكلفة البضاعة المباعة (حساب مستقل صحيح ضمن 5-1)
  PURCHASES_LOCAL:        "5-1-1-1",     // مشتريات محلية (تكلفة الشراء)
  PURCHASES_IMPORT:       "5-1-1-2",     // مشتريات استيراد
  PURCHASE_RETURNS:       "5-1-2",       // مردودات المشتريات
  FREIGHT_IN:             "5-1-7",       // مصروفات نقل بضاعة (للداخل) — جزء من COGS
  EARNED_DISCOUNT:        "5-1-9",       // خصومات مشتريات مكتسبة (دائن)
};

// ──────────────────────────────────────────
// الحسابات المعتمدة على طريقة الدفع
// Payment Method → Account Code
// ──────────────────────────────────────────
const PAYMENT_ACCOUNT = {
  cash:      ACCT.CASH_MAIN,
  cash_rep:  ACCT.CASH_REPS,
  network:   ACCT.BANK_DEFAULT,
  transfer:  ACCT.BANK_DEFAULT,
  bank:      ACCT.BANK_DEFAULT,
  pos:       ACCT.CASH_POS,
  credit:    null,   // سيُستخدم حساب العميل
  deferred:  null,   // سيُستخدم حساب العميل
  cheque:    ACCT.BANK_DEFAULT,
  default:   ACCT.CASH_MAIN,
};

// ──────────────────────────────────────────
// Accounting Engine Class
// ──────────────────────────────────────────
export class AccountingEngine {
  constructor() {
    this._accountsMap = null;  // { code → { id, name, type, ... } }
  }

  // ─── Initialize: load all accounts into memory map ───
  async init() {
    if (this._accountsMap) return;   // already loaded
    if (_sharedAccountsMap && (Date.now() - _sharedAccountsMapTime < 30 * 60 * 1000)) {
      this._accountsMap = _sharedAccountsMap;
      return;
    }
    try {
      const accountsList = await getAll(COLS.chartOfAccounts());
      this._accountsMap = {};
      accountsList.forEach(d => {
        this._accountsMap[d.code] = d;
      });
      _sharedAccountsMap = this._accountsMap;
      _sharedAccountsMapTime = Date.now();
    } catch(err) {
      console.warn("[AccountingEngine] Failed to load chart of accounts:", err.message);
      this._accountsMap = {};
    }
  }

  // ─── Helper: get account by code ───
  _acc(code) {
    const acc = this._accountsMap?.[code];
    if (!acc) {
      console.warn(`[AccountingEngine] Account not found for code: ${code}`);
      return { id: code, code, name: `(${code})`, type: "asset" };
    }
    return acc;
  }

  // ─── Helper: build a journal line ───
  _line(code, name, debit, credit, note = "", costCenterId = null) {
    return {
      accountCode: code,
      accountId:   this._acc(code)?.id || code,
      accountName: name || this._acc(code)?.name || code,
      debit:       Math.round((debit  || 0) * 100) / 100,
      credit:      Math.round((credit || 0) * 100) / 100,
      note,
      costCenterId: costCenterId || null,
    };
  }

  // ─── Determine payment account code ───
  _paymentCode(paymentMethod, invoiceType = "sales", customerType = "retail") {
    const method = (paymentMethod || "cash").toLowerCase();
    // If credit/deferred → use receivable or payable account
    if (method === "credit" || method === "deferred" || method === "آجل") {
      if (invoiceType === "sales") {
        return customerType === "wholesale"
          ? ACCT.RECEIVABLES_WHOLESALE
          : ACCT.RECEIVABLES_RETAIL;
      } else {
        return ACCT.PAYABLES_LOCAL;
      }
    }
    
    // Resolve cash and bank accounts dynamically from the loaded accounts map
    if (method === "cash" || method === "pos" || method === "نقدي" || method === "نقد") {
      return this._getMainCashCode();
    }
    if (method === "bank" || method === "transfer" || method === "network" || method === "cheque" || method === "بنك" || method === "شبكة" || method === "تحويل") {
      return this._getDefaultBankCode();
    }
    
    return PAYMENT_ACCOUNT[method] || this._getMainCashCode();
  }

  async _getRepCashBoxCode(repId) {
    if (!repId) return this._getMainCashCode();
    try {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/cashBoxes`, `cashBox_${repId}`));
      if (snap.exists()) {
        return snap.data().accountCode || this._getMainCashCode();
      }
    } catch (e) {
      console.warn("[AccountingEngine] Failed to resolve rep cashBox code:", e.message);
    }
    return this._getMainCashCode();
  }

  _getMainCashCode() {
    if (!this._accountsMap) return ACCT.CASH_MAIN;
    // أولاً: البحث عن 1-1-1-1-3 (الصندوق الرئيسى) مباشرة
    if (this._accountsMap["1-1-1-1-3"]) return "1-1-1-1-3";
    // ثانياً: البحث تحت الأب 1-1-1-1
    for (const code in this._accountsMap) {
      const acc = this._accountsMap[code];
      if (acc.parentCode === "1-1-1-1" &&
          (acc.name.includes("الرئيسي") || acc.name.includes("الرئيسى") || acc.name.toLowerCase().includes("main"))) {
        return code;
      }
    }
    return ACCT.CASH_MAIN;
  }

  _getDefaultBankCode() {
    if (!this._accountsMap) return ACCT.BANK_DEFAULT;
    // أولاً: محاولة الحصول على الحساب الفعلي المحدد في إعدادات البنك
    // ثانياً: البحث بالترتيب: الراجحي → الأهلي → أي بنك
    for (const code in this._accountsMap) {
      const acc = this._accountsMap[code];
      if (acc.parentCode === "1-1-1-3" &&
          (acc.name.includes("الراجحي") || acc.name.includes("الراجحى"))) {
        return code;
      }
    }
    for (const code in this._accountsMap) {
      const acc = this._accountsMap[code];
      if (acc.parentCode === "1-1-1-3" &&
          (acc.name.includes("الأهلي") || acc.name.includes("أهلي"))) {
        return code;
      }
    }
    for (const code in this._accountsMap) {
      const acc = this._accountsMap[code];
      if (acc.parentCode === "1-1-1-3") return code;
    }
    return ACCT.BANK_DEFAULT;
  }

  // ─── Determine inventory account ───
  // الأولوية:
  //  1. warehouse.inventoryAccountCode (مُربوط من نظام المخازن)
  //  2. sourceEntityId في شجرة الحسابات
  //  3. تطابق اسم المخزن مع حسابات المخزون
  //  4. حساب سيارات التوزيع / فلبك
  _inventoryCode(warehouseId, warehouses = [], warehouseName = "") {
    const wh = warehouses.find(w => w.id === warehouseId);
    const name = ((wh?.name || warehouseName || "") + "").trim().toLowerCase();

    // الأولوية 1: الحساب المربوط مباشرة بالمخزن
    if (wh?.accountCode && this._accountsMap?.[wh.accountCode]) {
      return wh.accountCode;
    }
    if (wh?.inventoryAccountCode && this._accountsMap?.[wh.inventoryAccountCode]) {
      return wh.inventoryAccountCode;
    }

    // الأولوية 2: البحث بـ sourceEntityId في شجرة الحسابات
    if (warehouseId && this._accountsMap) {
      const byEntity = this._getEntityAccountCode(warehouseId, null);
      if (byEntity) return byEntity;
    }

    // الأولوية 3: البحث باسم المخزن في حسابات 1-1-4 (المخزون)
    if (name && this._accountsMap) {
      for (const code in this._accountsMap) {
        const acc = this._accountsMap[code];
        if (code.startsWith("1-1-4") && acc.name) {
          const accName = acc.name.toLowerCase();
          if (accName === name || accName.includes(name) || name.includes(accName)) {
            return code;
          }
        }
      }
    }

    // الأولوية 4: فلبك — الحساب الأب حسب نوع المخزن
    if (name.includes("سيارة") || name.includes("سياره") || name.includes("مندوب") || name.includes("vehicle") || name.includes("rep") || name.includes("مصطفى") || name.includes("علي") || name.includes("ناجي"))
      return ACCT.INVENTORY_VEHICLES;
    return ACCT.INVENTORY_MAIN;
  }

  // ─── Resolve Customer/Supplier dynamic sub-account code ───
  _getEntityAccountCode(entityId, defaultParentCode, entityName = "") {
    if (!this._accountsMap) return defaultParentCode;
    
    // 1. Search by sourceEntityId
    if (entityId) {
      for (const code in this._accountsMap) {
        const acc = this._accountsMap[code];
        if (acc.sourceEntityId === entityId || acc.id === entityId) {
          return code;
        }
      }
    }

    // 2. Search by matching name under same parent/category
    const cleanName = (entityName || "").trim().toLowerCase();
    if (cleanName) {
      for (const code in this._accountsMap) {
        const acc = this._accountsMap[code];
        if (defaultParentCode && !code.startsWith(defaultParentCode) && acc.parentCode !== defaultParentCode) continue;
        const accName = (acc.name || "").trim().toLowerCase();
        if (accName === cleanName || accName.includes(cleanName) || cleanName.includes(accName)) {
          return code;
        }
      }
      // General name search if not found under defaultParentCode
      for (const code in this._accountsMap) {
        const acc = this._accountsMap[code];
        const accName = (acc.name || "").trim().toLowerCase();
        if (accName === cleanName || accName.includes(cleanName) || cleanName.includes(accName)) {
          return code;
        }
      }
    }

    return defaultParentCode;
  }

  // ─── Resolve Sales Rep analytical sub-account ───
  // Returns the rep's specific account under 1-1-2-1-2 if it exists,
  // otherwise falls back to the parent RECEIVABLES_REPS account.
  _getRepAccountCode(repId) {
    if (!repId || !this._accountsMap) return ACCT.RECEIVABLES_REPS;
    for (const code in this._accountsMap) {
      const acc = this._accountsMap[code];
      if ((acc.sourceEntityId === repId || acc.linkedRepId === repId) &&
          acc.parentCode === ACCT.RECEIVABLES_REPS) {
        return code;
      }
    }
    // Fallback: use parent rep receivables account
    return ACCT.RECEIVABLES_REPS;
  }

  // ─── Resolve individual Customer COA account ───
  // الأولوية:
  //  1. حساب العميل الفردي (sourceEntityId === customerId)
  //  2. حساب المندوب (repId محدد) تحت 1-1-2-1-2
  //  3. defaultCode (عادةً RECEIVABLES_RETAIL أو RECEIVABLES_REPS)
  _getCustomerCoaCode(customerId, repId, defaultCode) {
    if (!this._accountsMap) return defaultCode;

    // 1. البحث عن حساب العميل بالمعرّف الفردي
    if (customerId) {
      for (const code in this._accountsMap) {
        const acc = this._accountsMap[code];
        if (acc.sourceEntityId === customerId && acc.sourceModule === "customers") {
          return code;
        }
      }
    }

    // 2. فالباك: حساب المندوب
    if (repId) {
      const repCode = this._getRepAccountCode(repId);
      if (repCode !== ACCT.RECEIVABLES_REPS) return repCode;
    }

    // 3. فالباك نهائي
    return defaultCode;
  }

  // ──────────────────────────────────────────
  // 1. SALES INVOICE — فاتورة بيع
  // ──────────────────────────────────────────
  // القيد المحاسبي:
  //   مدين: حساب العميل / الصندوق / البنك (بإجمالي الفاتورة شامل الضريبة)
  //   دائن: حساب المبيعات (قبل الضريبة)
  //   دائن: ضريبة القيمة المضافة المستحقة (بقيمة الضريبة)
  // + قيد تكلفة البضاعة المباعة:
  //   مدين: تكلفة البضاعة المباعة (COGS)
  //   دائن: حساب المخزون (المستودع المصدر)
  // ──────────────────────────────────────────
  async createSalesJE(invoice, user = {}, warehouses = []) {
    await this.init();

    const date         = invoice.date || new Date().toISOString().slice(0, 10);
    const invNum       = invoice.invoiceNumber || invoice.id?.slice(0,8) || "—";
    const subtotal     = parseFloat(invoice.subtotal     || invoice.totalBeforeTax || 0);
    const vatAmount    = parseFloat(invoice.taxAmount     || invoice.vatAmount      || 0);
    const totalWithVat = parseFloat(invoice.total         || invoice.grandTotal      || (subtotal + vatAmount));
    const cogs         = parseFloat(invoice.totalCost    || invoice.cogsAmount      || 0);
    const payMethod    = (invoice.paymentMethod || "cash").toLowerCase();
    const custType     = invoice.customerType === "wholesale" ? "wholesale" : "retail";
    const sourceType   = invoice.sourceType || "salesInvoice";

    // Determine accounts
    let payCode    = this._paymentCode(payMethod, "sales", custType);
    const repId    = invoice.repId || invoice.salesRepId || null;
    const customerId = invoice.customerId || null;  // ✅ FIX: was undefined before

    // إذا تم تحديد عميل، نقوم بتوجيه القيد عبر حساب العميل الفردي أولاً
    // لضمان ظهور الفاتورة في كشف حسابه ومطابقتها مع سند القبض التلقائي المنشأ
    if (customerId) {
      const defaultCreditCode = this._paymentCode("credit", "sales", custType);
      payCode = this._getCustomerCoaCode(customerId, repId, defaultCreditCode);
    } else {
      // عميل نقدي عام (غير محدد) -> يوجه مباشرة للصندوق أو البنك
      if (payMethod === "credit" || payMethod === "deferred" || payMethod === "آجل") {
        payCode = this._getCustomerCoaCode(customerId, repId, payCode);
      } else if (payMethod === "cash" || payMethod === "pos" || payMethod === "نقدي" || payMethod === "نقد") {
        if (repId) {
          payCode = await this._getRepCashBoxCode(repId);
        }
      }
    }

    const payName    = this._acc(payCode)?.name || "الصندوق/العميل";
    // ✅ حساب الإيراد موحد دائماً بغض النظر عن طريقة الدفع أو نوع العميل
    // (الطرف المدين هو الذي يتغير بحسب طريقة الدفع — وليس الإيراد)
    const salesCode  = ACCT.SALES_ALL;   // 4-1-1 — إيرادات المبيعات الموحدة
    const salesName  = this._acc(salesCode)?.name || "إيرادات المبيعات";
    const invCode    = this._inventoryCode(invoice.warehouseId, warehouses, invoice.warehouseName || invoice.warehouse);
    const invName    = this._acc(invCode)?.name   || "المخزون";

    let costCenterId = invoice.costCenterId || null;
    if (!costCenterId && invoice.warehouseId && warehouses.length > 0) {
      const wh = warehouses.find(w => w.id === invoice.warehouseId);
      if (wh && (wh.costCenterId || wh.costCenter)) {
        costCenterId = wh.costCenterId || wh.costCenter;
      }
    }

    const paidAmount = invoice.paidAmount !== undefined ? parseFloat(invoice.paidAmount) : totalWithVat;
    const remainingAmount = invoice.remainingAmount !== undefined ? parseFloat(invoice.remainingAmount) : 0;

    const lines = [];

    // Line 1: الطرف المدين (عميل أو صندوق)
    if (payMethod === "partial" && remainingAmount > 0) {
      let cashCode = "1-1-1-1-3";
      if (repId) {
        cashCode = await this._getRepCashBoxCode(repId);
      } else {
        cashCode = this._paymentCode("cash", "sales", custType);
      }
      const cashName = this._acc(cashCode)?.name || "الصندوق";
      
      // القسط الآجل → حساب العميل الفردي أولاً ثم حساب المندوب ثم عام
      const defaultCreditCode = this._paymentCode("credit", "sales", custType);
      const creditCode = this._getCustomerCoaCode(customerId, repId, defaultCreditCode); // ✅ customerId معرَّف الآن
      const creditName = this._acc(creditCode)?.name || invoice.customerName || "العميل";


      if (paidAmount > 0) {
        lines.push(this._line(cashCode, cashName, paidAmount, 0, `دفعة نقدية - فاتورة ${invNum} — ${invoice.customerName || "عميل"}`, costCenterId));
      }
      lines.push(this._line(creditCode, creditName, remainingAmount, 0, `متبقي آجل - فاتورة ${invNum} — ${invoice.customerName || "عميل"}`, costCenterId));
    } else {
      lines.push(this._line(payCode, payName, totalWithVat, 0,
        `فاتورة ${invNum} — ${invoice.customerName || "عميل"}`, costCenterId));
    }

    // Line 2: المبيعات والخصم المسموح به
    const discountTotal = parseFloat(invoice.discountTotal || invoice.globalDiscountAmount || 0);
    const grossSubtotal = parseFloat(invoice.grossSubtotal || (subtotal + discountTotal));

    if (discountTotal > 0.01) {
      lines.push(this._line("4-1-3-1", this._acc("4-1-3-1")?.name || "الخصم المسموح به (خصم تجاري)", discountTotal, 0, `خصم مبيعات فاتورة ${invNum}`, costCenterId));
      lines.push(this._line(salesCode, salesName, 0, grossSubtotal, `إيراد مبيعات فاتورة ${invNum}`, costCenterId));
    } else if (subtotal > 0) {
      lines.push(this._line(salesCode, salesName, 0, subtotal, `مبيعات فاتورة ${invNum}`, costCenterId));
    }

    // Line 3: ضريبة القيمة المضافة (دائن)
    if (vatAmount > 0.01)
      lines.push(this._line(ACCT.VAT_OUTPUT, this._acc(ACCT.VAT_OUTPUT)?.name || "ض.ق.م - مخرجات",
        0, vatAmount, `ضريبة فاتورة ${invNum} 15%`, costCenterId));

    // Safety: balance adjustment (rounding)
    const totalDr = lines.reduce((s,l) => s + l.debit, 0);
    const totalCr = lines.reduce((s,l) => s + l.credit, 0);
    const diff    = Math.round((totalDr - totalCr) * 100) / 100;
    if (Math.abs(diff) > 0.001 && Math.abs(diff) < 1) {
      // apply rounding to sales credit line
      const salesLine = lines.find(l => l.accountCode === salesCode && l.credit > 0) || lines.find(l => l.credit > 0);
      if (salesLine) {
        salesLine.credit = Math.round((salesLine.credit + diff) * 100) / 100;
      }
    }

    try {
      // ✅ ROOTFIX: استخدام invoice.id دائماً كـ sourceId الثابت لضمان عدم ضياع أي قيد
      // حتى لو كان invoiceNumber غير موجود، الـ Firestore doc ID دائماً متاح
      const sourceKey = invoice.id;  // Primary key = Firestore doc ID (ثابت ومضمون)
      const isDonation = invoice.customerId === "005" || (invoice.customerName || "").includes("سلة البركة");

      // ─── منع تكرار القيد الرئيسي — البحث بالـ id فقط ───
      let existingSnap = await getDocs(
        query(COLS.journalEntries(), where("sourceType", "==", sourceType), where("sourceId", "==", sourceKey), limit(1))
      );
      // فالباك للتوافق مع القيود القديمة المحفوظة برقم الفاتورة
      if (existingSnap.empty && invoice.invoiceNumber && invoice.invoiceNumber !== sourceKey) {
        existingSnap = await getDocs(
          query(COLS.journalEntries(), where("sourceType", "==", sourceType), where("sourceId", "==", invoice.invoiceNumber), limit(1))
        );
      }

      let je1Id = null;
      if (!isDonation) {
        if (!existingSnap.empty) {
          console.warn(`[AccountingEngine] Sales JE already exists for ${sourceKey} — skipping duplicate`);
          je1Id = existingSnap.docs[0].id;
          // لا نرجع مبكراً — نستمر للتحقق من قيد COGS
        } else {
          const je1 = await createJournalEntry({
            date, description: `مبيعات — فاتورة ${invNum} — ${invoice.customerName || ""}`,
            lines, sourceType, sourceId: sourceKey,  // ✅ ROOTFIX: دائماً invoice.id
            costCenterId: costCenterId || null,
            entryNumber: undefined,
            status: "posted",
            createdByName: user.displayName || user.name || "النظام",
          });
          console.log(`[AccountingEngine] Sales JE created: ${je1}`);
          je1Id = je1;
        }
      }

      // COGS Journal Entry (if cost is available)
      let cogsJeId = null;
      if (cogs > 0.01) {
        // ✅ ROOTFIX: نفس المنطق — البحث بـ invoice.id أولاً
        let existingCOGS = await getDocs(
          query(COLS.journalEntries(), where("sourceType", "==", "salesCOGS"), where("sourceId", "==", sourceKey), limit(1))
        );
        // فالباك للقيود القديمة المحفوظة برقم الفاتورة
        if (existingCOGS.empty && invoice.invoiceNumber && invoice.invoiceNumber !== sourceKey) {
          existingCOGS = await getDocs(
            query(COLS.journalEntries(), where("sourceType", "==", "salesCOGS"), where("sourceId", "==", invoice.invoiceNumber), limit(1))
          );
        }
        if (existingCOGS.empty) {
          // ✅ FIX: إذا warehouses فارغة حاول تحميل كود المخزن من invoice مباشرة أو تحديده يدوياً
          let finalInvCode = invCode;
          if (!finalInvCode || finalInvCode === ACCT.INVENTORY_MAIN) {
            // تحقق من اسم المخزن في الفاتورة — إذا سيارة فاستخدم 1-1-4-2
          // تحقق من اسم المخزن في الفاتورة — إذا سيارة/مندوب فاستخدم مخزون سيارات التوزيع
          const whName = (invoice.warehouseName || invoice.warehouse || "").toLowerCase();
          if (whName && (
            whName.includes("سيارة") || whName.includes("سياره") ||
            whName.includes("مندوب") || whName.includes("vehicle") ||
            whName.includes("rep")   || whName.includes("مصطفى") ||
            whName.includes("علي")   || whName.includes("ناجي")
          )) {
            finalInvCode = ACCT.INVENTORY_VEHICLES;
          }
          // أيضاً: إذا warehouseId موجود حاول البحث عن حساب COA مرتبط به
          if (!finalInvCode || finalInvCode === ACCT.INVENTORY_MAIN) {
            if (invoice.warehouseId && this._accountsMap) {
              const byEntity = this._getEntityAccountCode(invoice.warehouseId, null);
              if (byEntity) finalInvCode = byEntity;
            }
          }
          }
          const finalInvName = this._acc(finalInvCode)?.name || invName || "المخزون";
          
          const debitCode = isDonation ? "5-4-21" : ACCT.COGS;
          const debitName = isDonation ? "مصروف هدايا ومساعدات ومساهمات اجتماعية" : (this._acc(ACCT.COGS)?.name || "تكلفة البضاعة المباعة");
          const desc = isDonation ? `تبرع بالبضاعة — فاتورة ${invNum}` : `تكلفة بضاعة مباعة — فاتورة ${invNum}`;

          cogsJeId = await createJournalEntry({
            date, description: desc,
            lines: [
              this._line(debitCode, debitName, cogs, 0, desc, costCenterId),
              this._line(finalInvCode, finalInvName, 0, cogs, desc, costCenterId),
            ],
            sourceType: "salesCOGS", sourceId: sourceKey,  // ✅ مفتاح موحد
            costCenterId: costCenterId || null,
            status: "posted",
            createdByName: user.displayName || user.name || "النظام",
          });
          console.log(`[AccountingEngine] COGS JE created for ${invNum}`);
        } else {
          cogsJeId = existingCOGS.docs[0].id;
          console.log(`[AccountingEngine] COGS JE already exists for ${invNum}`);
        }
      }

      return isDonation ? cogsJeId : je1Id;
    } catch(err) {
      console.error("[AccountingEngine] Sales JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 2. PURCHASE INVOICE — فاتورة شراء
  // ──────────────────────────────────────────
  // القيد المحاسبي:
  //   مدين: حساب المخزون (المستودع المحدد)
  //   مدين: ضريبة القيمة المضافة القابلة للخصم
  //   دائن: حساب المورد أو الصندوق/البنك (بإجمالي الفاتورة)
  // ──────────────────────────────────────────
  async createPurchaseJE(invoice, user = {}, warehouses = []) {
    await this.init();

    const date      = invoice.date || new Date().toISOString().slice(0,10);
    const invNum    = invoice.invoiceNumber || invoice.id?.slice(0,8) || "—";
    const subtotal  = parseFloat(invoice.subtotal   || invoice.totalBeforeTax || 0);
    const vatAmt    = parseFloat(invoice.taxAmount   || invoice.vatAmount      || 0);
    const total     = parseFloat(invoice.total       || invoice.grandTotal      || (subtotal + vatAmt));
    const payMethod = (invoice.paymentMethod || "credit").toLowerCase();
    const isImport  = invoice.isImport || false;

    const invCode   = this._inventoryCode(invoice.warehouseId, warehouses);
    const invName   = this._acc(invCode)?.name || "المخزون";
    let payCode   = this._paymentCode(payMethod, "purchase");
    if (payMethod === "credit" || payMethod === "deferred" || payMethod === "آجل") {
      payCode = this._getEntityAccountCode(invoice.supplierId, payCode, invoice.supplierName);
    }
    const payName   = this._acc(payCode)?.name || "المورد";
    const purchCode = isImport ? ACCT.PURCHASES_IMPORT : ACCT.PURCHASES_LOCAL;

    const lines = [];
    const discountTotal = parseFloat(invoice.discountTotal || invoice.totalDiscount || (parseFloat(invoice.lineDiscountTotal || 0) + parseFloat(invoice.globalDiscountAmount || 0)) || 0);
    const grossSubtotal = parseFloat(invoice.grossSubtotal || (subtotal + discountTotal));
    const earnedDiscCode = ACCT.EARNED_DISCOUNT || "5-1-9";
    const earnedDiscName = this._acc(earnedDiscCode)?.name || "خصومات مشتريات مكتسبة";

    // الطرف المدين 1: المخزون (بالإجمالي قبل الخصم ليعكس قيمة البضاعة كاملة، أو بالصافي إذا لم يوجد خصم)
    if (discountTotal > 0.009) {
      lines.push(this._line(invCode, invName, grossSubtotal, 0,
        `مشتريات فاتورة ${invNum} — ${invoice.supplierName || "مورد"}`));
      // الطرف الدائن: الخصم المكتسب من المورد (إيراد/تخفيض تكلفة COGS)
      lines.push(this._line(earnedDiscCode, earnedDiscName, 0, discountTotal,
        `خصم مكتسب فاتورة شراء ${invNum} — ${invoice.supplierName || "مورد"}`));
    } else {
      lines.push(this._line(invCode, invName, subtotal, 0,
        `مشتريات فاتورة ${invNum} — ${invoice.supplierName || "مورد"}`));
    }

    // الطرف المدين 2: ضريبة القيمة المضافة - مدخلات (على الأساس الخاضع الصافي بعد الخصم)
    if (vatAmt > 0.009)
      lines.push(this._line(ACCT.VAT_INPUT, this._acc(ACCT.VAT_INPUT)?.name || "ض.ق.م - مدخلات",
        vatAmt, 0, `ضريبة مشتريات فاتورة ${invNum}`));

    // الطرف المدين 3: مصاريف شحن/نقل البضاعة للداخل (إن وجدت)
    const freightAmt = parseFloat(invoice.freightCharge || invoice.freight || 0);
    if (freightAmt > 0.009)
      lines.push(this._line(ACCT.FREIGHT_IN, this._acc(ACCT.FREIGHT_IN)?.name || "مصروفات نقل بضاعة (للداخل)",
        freightAmt, 0, `مصاريف شحن فاتورة شراء ${invNum}`));

    // الطرف الدائن: المورد أو الصندوق/البنك (بصافي المستحق الإجمالي)
    const totalDr = lines.reduce((s,l) => s + l.debit, 0);
    const totalCr = lines.reduce((s,l) => s + l.credit, 0);
    const netCreditNeeded = Math.round((totalDr - totalCr) * 100) / 100;
    lines.push(this._line(payCode, payName, 0, netCreditNeeded,
      `سداد/التزام فاتورة شراء ${invNum}`));

    try {
      // ─── منع تكرار قيد الشراء أو تحديث القيد إذا كان موجوداً ───
      let existingSnap = await getDocs(
        query(COLS.journalEntries(), where("sourceType", "==", "purchaseInvoice"), where("sourceId", "==", invoice.id), limit(1))
      );
      if (existingSnap.empty && invoice.invoiceNumber && invoice.invoiceNumber !== invoice.id) {
        existingSnap = await getDocs(
          query(COLS.journalEntries(), where("sourceType", "==", "purchaseInvoice"), where("sourceId", "==", invoice.invoiceNumber), limit(1))
        );
      }

      if (!existingSnap.empty) {
        const existingDoc = existingSnap.docs[0];
        const { updateJournalEntry } = await import("./db.js");
        await updateJournalEntry(existingDoc.id, {
          date,
          description: `مشتريات — فاتورة ${invNum} — ${invoice.supplierName || ""}`,
          lines,
          status: "posted"
        });
        console.log(`[AccountingEngine] Purchase JE updated: ${existingDoc.id}`);
        return existingDoc.id;
      }

      const je = await createJournalEntry({
        date, description: `مشتريات — فاتورة ${invNum} — ${invoice.supplierName || ""}`,
        lines, sourceType: "purchaseInvoice", sourceId: invoice.id,
        status: "posted",
        createdByName: user.displayName || user.name || "النظام",
      });
      const jeId = typeof je === "object" && je ? (je.id || String(je)) : String(je);
      console.log(`[AccountingEngine] Purchase JE created: ${jeId}`);
      return jeId;
    } catch(err) {
      console.error("[AccountingEngine] Purchase JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 3. SALES RETURN — مردود مبيعات
  // ──────────────────────────────────────────
  // القيد المحاسبي (عكسي لقيد البيع):
  //   مدين: مردودات المبيعات (بالقيمة قبل الضريبة)
  //   مدين: ضريبة القيمة المضافة المستحقة (تُرجع)
  //   دائن: حساب العميل / الصندوق (بالإجمالي)
  // + عكس قيد التكلفة:
  //   مدين: المخزون (يُرجع)
  //   دائن: تكلفة البضاعة المباعة
  // ──────────────────────────────────────────
  async createSalesReturnJE(ret, user = {}, warehouses = []) {
    await this.init();

    const date      = ret.date || new Date().toISOString().slice(0,10);
    const retNum    = ret.returnNumber || ret.id?.slice(0,8) || "—";
    const subtotal  = parseFloat(ret.subtotal   || ret.totalBeforeTax || 0);
    const vatAmt    = parseFloat(ret.taxAmount   || ret.vatAmount      || ret.totalVat || 0);
    const total     = parseFloat(ret.total       || ret.grandTotal      || ret.totalWithVat || (subtotal + vatAmt));
    const cogs      = parseFloat(ret.totalCost  || ret.cogsAmount      || 0);
    const payMethod = (ret.paymentMethod || "credit").toLowerCase();
    const custType  = ret.customerType === "wholesale" ? "wholesale" : "retail";

    const defaultPayCode = this._paymentCode(payMethod, "sales", custType);
    let payCode = defaultPayCode;
    if (payMethod === "credit") {
      payCode = this._getCustomerCoaCode(ret.customerId, ret.repId, defaultPayCode);
    }
    const payName     = this._acc(payCode)?.name || "العميل";
    // ✅ حساب المردودات موحد (لا تفريق بين تجزئة وجملة)
    const returnCode  = ACCT.SALES_RETURN;   // 4-1-2 — مردودات ومسموحات المبيعات
    const returnName  = this._acc(returnCode)?.name || "مردودات المبيعات";
    const invCode     = this._inventoryCode(ret.warehouseId, warehouses);
    const invName     = this._acc(invCode)?.name || "المخزون";

    const lines = [];

    // مردودات (مدين)
    if (subtotal > 0)
      lines.push(this._line(returnCode, returnName, subtotal, 0,
        `مردود ${retNum} — ${ret.customerName || "عميل"}`));

    // ضريبة تُرد (مدين)
    if (vatAmt > 0.01)
      lines.push(this._line(ACCT.VAT_OUTPUT, this._acc(ACCT.VAT_OUTPUT)?.name || "ض.ق.م - مخرجات",
        vatAmt, 0, `رد ضريبة مردود ${retNum}`));

    // العميل / الصندوق (دائن)
    const totalDr = lines.reduce((s,l) => s + l.debit, 0);
    lines.push(this._line(payCode, payName, 0, totalDr,
      `استرداد فاتورة مردود ${retNum}`));

    try {
      await createJournalEntry({
        date, description: `مردود مبيعات — ${retNum} — ${ret.customerName || ""}`,
        lines, sourceType: "salesReturn", sourceId: ret.id,
        status: "posted",
        createdByName: user.displayName || user.name || "النظام",
      });

      // COGS Reversal (إرجاع المخزون)
      if (cogs > 0.01) {
        await createJournalEntry({
          date, description: `إرجاع مخزون — مردود ${retNum}`,
          lines: [
            this._line(invCode, invName, cogs, 0, `إرجاع مخزون مردود ${retNum}`),
            this._line(ACCT.COGS, this._acc(ACCT.COGS)?.name || "ت.ب.م", 0, cogs, `عكس تكلفة مردود ${retNum}`),
          ],
          sourceType: "salesReturnCOGS", sourceId: ret.id,
          status: "posted",
          createdByName: user.displayName || user.name || "النظام",
        });
      }
    } catch(err) {
      console.error("[AccountingEngine] Sales Return JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 4. PURCHASE RETURN — مردود مشتريات
  // ──────────────────────────────────────────
  // القيد المحاسبي (عكسي لقيد الشراء):
  //   مدين: حساب المورد (يُخفَّض التزامه)
  //   دائن: المخزون (يُرجع)
  //   دائن: ضريبة القيمة المضافة (تُرد لو كانت ضريبة مدخلات)
  // ──────────────────────────────────────────
  async createPurchaseReturnJE(ret, user = {}, warehouses = []) {
    await this.init();

    const date      = ret.date || new Date().toISOString().slice(0,10);
    const retNum    = ret.returnNumber || ret.id?.slice(0,8) || "—";
    const subtotal  = parseFloat(ret.subtotal   || ret.totalBeforeTax || 0);
    const vatAmt    = parseFloat(ret.taxAmount   || ret.vatAmount      || 0);
    const total     = parseFloat(ret.total       || ret.grandTotal      || (subtotal + vatAmt));
    const payMethod = (ret.paymentMethod || "credit").toLowerCase();

    const invCode   = this._inventoryCode(ret.warehouseId, warehouses);
    const invName   = this._acc(invCode)?.name || "المخزون";
    let payCode   = this._paymentCode(payMethod, "purchase");
    if (payMethod === "credit" || payMethod === "deferred" || payMethod === "آجل") {
      payCode = this._getEntityAccountCode(ret.supplierId, payCode, ret.supplierName);
    }
    const payName   = this._acc(payCode)?.name || "المورد";

    const lines = [];

    // الطرف المدين: حساب المورد (أو الصندوق/البنك) لتخفيض الالتزام أو استرداد النقدية
    lines.push(this._line(payCode, payName, total, 0,
      `مردود شراء ${retNum} — ${ret.supplierName || "مورد"}`));

    // الطرف الدائن: المخزون (تخفيض قيمة بضاعة المخزن)
    if (subtotal > 0)
      lines.push(this._line(invCode, invName, 0, subtotal,
        `إرجاع مخزون مردود ${retNum}`));

    // الطرف الدائن: ضريبة القيمة المضافة - مدخلات (رد الضريبة)
    if (vatAmt > 0.01)
      lines.push(this._line(ACCT.VAT_INPUT, this._acc(ACCT.VAT_INPUT)?.name || "ض.ق.م - مدخلات",
        0, vatAmt, `رد ضريبة مردود شراء ${retNum}`));

    try {
      const existingSnap = await getDocs(
        query(COLS.journalEntries(), where("sourceType", "==", "purchaseReturn"), where("sourceId", "==", ret.id), limit(1))
      );
      if (!existingSnap.empty) {
        console.warn(`[AccountingEngine] Purchase Return JE already exists for ${ret.id} — skipping duplicate`);
        return existingSnap.docs[0].id;
      }
      const je = await createJournalEntry({
        date, description: `مردود مشتريات — ${retNum} — ${ret.supplierName || ""}`,
        lines, sourceType: "purchaseReturn", sourceId: ret.id,
        status: "posted",
        createdByName: user.displayName || user.name || "النظام",
      });
      console.log(`[AccountingEngine] Purchase Return JE created: ${je}`);
      return je;
    } catch(err) {
      console.error("[AccountingEngine] Purchase Return JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 5. CUSTOMER PAYMENT — تحصيل من عميل
  // ──────────────────────────────────────────
  //   مدين: الصندوق / البنك
  //   دائن: حساب العميل (الذمم المدينة)
  // ──────────────────────────────────────────
  async createCustomerPaymentJE(payment, user = {}) {
    await this.init();

    const date      = payment.date  || new Date().toISOString().slice(0,10);
    const amount    = parseFloat(payment.amount || 0);
    const payMethod = (payment.paymentMethod || payment.method || "cash").toLowerCase();
    const custType  = payment.customerType === "wholesale" ? "wholesale" : "retail";
    const ref       = payment.reference || payment.invoiceNumber || payment.sourceInvoiceId || payment.id?.slice(0,8) || "—";

    if (amount <= 0) throw new Error("مبلغ التحصيل يجب أن يكون أكبر من صفر");

    let cashCode = payment.cashAccountCode || payment.accountCode || null;
    if (!cashCode) {
      if (payment.repId) {
        cashCode = await this._getRepCashBoxCode(payment.repId);
      } else if (payment.cashBoxId || (payment.sourceId && payment.sourceId.startsWith("cashBox_"))) {
        const cbId = payment.cashBoxId || payment.sourceId.replace("cashBox_", "");
        cashCode = await this._getRepCashBoxCode(cbId);
      }
    }
    if (!cashCode) {
      cashCode = PAYMENT_ACCOUNT[payMethod] || ACCT.CASH_MAIN;
    }
    const cashName  = this._acc(cashCode)?.name || "الصندوق";

    const customerId = payment.customerId || payment.targetId || null;
    const repId = payment.repId || (payment.sourceId && payment.sourceId.startsWith("cashBox_") ? payment.sourceId.replace("cashBox_", "") : null);
    const defaultCustCode = custType === "wholesale" ? ACCT.RECEIVABLES_WHOLESALE : ACCT.RECEIVABLES_RETAIL;
    const custCode  = this._getCustomerCoaCode(customerId, repId, defaultCustCode);
    const custName  = this._acc(custCode)?.name || payment.customerName || payment.accountName || "ذمم العملاء";

    const costCenterId = payment.costCenterId || null;
    const costCenterName = payment.costCenterName || null;

    try {
      return await createJournalEntry({
        date,
        description: `تحصيل من ${payment.customerName || payment.accountName || "عميل"} — ${ref}`,
        lines: [
          this._line(cashCode, cashName, amount, 0, `تحصيل ${payment.customerName || payment.accountName || ""}`, costCenterId),
          this._line(custCode, custName, 0, amount, `تخفيض ذمة ${payment.customerName || payment.accountName || ""}`, costCenterId),
        ],
        sourceType: "receipt",
        sourceId: payment.id,
        status: "posted",
        costCenterId,
        costCenterName,
        createdByName: user.displayName || user.name || "النظام",
      });
    } catch(err) {
      console.error("[AccountingEngine] Customer Payment JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 6. SUPPLIER PAYMENT — سداد لمورد
  // ──────────────────────────────────────────
  //   مدين: حساب المورد (يُخفَّض الالتزام)
  //   دائن: الصندوق / البنك
  // ──────────────────────────────────────────
  //   payment.supplierId أو payment.sourceEntityId
  async createSupplierPaymentJE(payment, user = {}) {
    await this.init();

    const date      = payment.date  || new Date().toISOString().slice(0,10);
    const amount    = parseFloat(payment.amount || 0);
    const payMethod = (payment.paymentMethod || "bank").toLowerCase();
    const ref       = payment.reference || payment.id?.slice(0,8) || "—";

    if (amount <= 0) throw new Error("مبلغ السداد يجب أن يكون أكبر من صفر");

    const cashCode  = PAYMENT_ACCOUNT[payMethod] || ACCT.BANK_DEFAULT;
    const cashName  = this._acc(cashCode)?.name || "البنك";
    const suppCode  = this._getEntityAccountCode(payment.supplierId || payment.sourceEntityId, ACCT.PAYABLES_LOCAL, payment.supplierName || payment.name || "");
    const suppName  = this._acc(suppCode)?.name || "ذمم الموردين";

    try {
      return await createJournalEntry({
        date, description: `سداد لـ ${payment.supplierName || "مورد"} — ${ref}`,
        lines: [
          this._line(suppCode, suppName, amount, 0, `تخفيض التزام ${payment.supplierName || ""}`),
          this._line(cashCode, cashName, 0, amount, `صرف ${payment.supplierName || ""}`),
        ],
        sourceType: "supplierPayment", sourceId: payment.id,
        status: "posted",
        createdByName: user.displayName || user.name || "النظام",
      });
    } catch(err) {
      console.error("[AccountingEngine] Supplier Payment JE error:", err.message);
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // 7. POS SALE — مبيعات نقطة البيع
  // ──────────────────────────────────────────
  async createPOSJE(sale, user = {}) {
    await this.init();

    const date      = sale.date || new Date().toISOString().slice(0,10);
    const saleNum   = sale.receiptNumber || sale.id?.slice(0,8) || "—";
    const subtotal  = parseFloat(sale.subtotal  || sale.totalBeforeTax || 0);
    const vatAmt    = parseFloat(sale.taxAmount  || sale.vatAmount      || 0);
    const total     = parseFloat(sale.total      || sale.grandTotal      || (subtotal + vatAmt));
    const cogs      = parseFloat(sale.totalCost || sale.cogsAmount      || 0);
    const payMethod = (sale.paymentMethod || "cash").toLowerCase();

    const cashCode  = PAYMENT_ACCOUNT[payMethod] || ACCT.CASH_POS;
    const cashName  = this._acc(cashCode)?.name || "الصندوق";

    const lines = [
      this._line(cashCode, cashName, total, 0, `POS وصل ${saleNum}`),
    ];

    if (subtotal > 0)
      lines.push(this._line(ACCT.SALES_ALL, this._acc(ACCT.SALES_ALL)?.name || "إيرادات المبيعات",
        0, subtotal, `مبيعات POS ${saleNum}`));

    if (vatAmt > 0.01)
      lines.push(this._line(ACCT.VAT_OUTPUT, this._acc(ACCT.VAT_OUTPUT)?.name || "ض.ق.م - مخرجات",
        0, vatAmt, `ضريبة POS ${saleNum}`));

    // Balance check
    const tDr = lines.reduce((s,l) => s+l.debit, 0);
    const tCr = lines.reduce((s,l) => s+l.credit, 0);
    if (lines[1] && Math.abs(tDr-tCr) < 1) lines[1].credit = Math.round((lines[1].credit + (tDr-tCr)) * 100) / 100;

    try {
      await createJournalEntry({
        date, description: `POS — وصل ${saleNum}`,
        lines, sourceType: "pos", sourceId: sale.id,
        status: "posted",
        createdByName: user.displayName || user.name || "النظام",
      });

      if (cogs > 0.01) {
        await createJournalEntry({
          date, description: `تكلفة POS — وصل ${saleNum}`,
          lines: [
            this._line(ACCT.COGS, this._acc(ACCT.COGS)?.name || "ت.ب.م", cogs, 0, `تكلفة POS ${saleNum}`),
            this._line(ACCT.INVENTORY_MAIN, this._acc(ACCT.INVENTORY_MAIN)?.name || "المخزون", 0, cogs, `صرف مخزون POS ${saleNum}`),
          ],
          sourceType: "posCOGS", sourceId: sale.id,
          status: "posted",
          createdByName: user.displayName || user.name || "النظام",
        });
      }
    } catch(err) {
      console.error("[AccountingEngine] POS JE error:", err.message);
      // Don't throw — POS should succeed even if accounting fails
    }
  }

  // ──────────────────────────────────────────
  // 7. DELIVERY NOTE — سند تسليم بضاعة (غير ضريبي)
  // ──────────────────────────────────────────
  // القيد المحاسبي:
  //   مدين: حساب العميل الفردي أو الصندوق (بإجمالي سند التسليم)
  //   دائن: إيرادات مبيعات المواد الغذائية (4-1-1)
  // + قيد تكلفة البضاعة المباعة (COGS) إن توفرت التكلفة:
  //   مدين: تكلفة البضاعة المباعة (5-1-8)
  //   دائن: حساب المخزون (المستودع المصدر)
  // ──────────────────────────────────────────
  async createDeliveryNoteJE(dn, user = {}, warehouses = []) {
    await this.init();

    const date         = dn.date || new Date().toISOString().slice(0, 10);
    const dnNum        = dn.number || dn.dnNumber || dn.id?.slice(0, 8) || "—";
    const totalAmount  = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
    const payMethod    = (dn.paymentMethod || "credit").toLowerCase();
    const customerId   = dn.customerId || null;
    const repId        = dn.repId || dn.salesRepId || null;
    const sourceKey    = dn.id;

    if (totalAmount <= 0) return null;

    try {
      // 1. Check if JE already exists
      let existingSnap = await getDocs(
        query(COLS.journalEntries(), where("sourceType", "==", "deliveryNote"), where("sourceId", "==", sourceKey), limit(1))
      );
      if (existingSnap.empty && dn.number && dn.number !== sourceKey) {
        existingSnap = await getDocs(
          query(COLS.journalEntries(), where("sourceType", "==", "deliveryNote"), where("refNumber", "==", dn.number), limit(1))
        );
      }

      let je1Id = null;
      if (!existingSnap.empty) {
        console.warn(`[AccountingEngine] DeliveryNote JE already exists for ${dnNum} — skipping`);
        je1Id = existingSnap.docs[0].id;
      } else {
        let payCode = this._paymentCode(payMethod, "sales", "retail");
        if (customerId) {
          const defaultCreditCode = this._paymentCode("credit", "sales", "retail");
          payCode = this._getCustomerCoaCode(customerId, repId, defaultCreditCode);
        } else if (payMethod === "cash" && repId) {
          payCode = await this._getRepCashBoxCode(repId);
        }

        const payName   = this._acc(payCode)?.name || dn.customerName || "العميل";
        const salesCode = ACCT.SALES_ALL;
        const salesName = this._acc(salesCode)?.name || "إيرادات المبيعات";

        const lines = [
          this._line(payCode, payName, totalAmount, 0, `سند تسليم بضاعة ${dnNum} — ${dn.customerName || "عميل"}`),
          this._line(salesCode, salesName, 0, totalAmount, `إيراد تسليم بضاعة سند ${dnNum}`)
        ];

        je1Id = await createJournalEntry({
          date,
          refNumber: dnNum,
          description: `سند تسليم بضاعة مبيعات رقم ${dnNum} — ${dn.customerName || ""}`,
          sourceType: "deliveryNote",
          sourceId: sourceKey,
          lines,
          status: "posted",
          createdByName: user.displayName || user.name || "النظام"
        });
        console.log(`[AccountingEngine] DeliveryNote JE created: ${je1Id}`);
      }

      // 2. COGS Journal Entry if cost is available
      let cogs = parseFloat(dn.totalCost || 0);
      if (!cogs && Array.isArray(dn.lines)) {
        cogs = dn.lines.reduce((s, l) => s + (parseFloat(l.qty || 0) * parseFloat(l.costPrice || l.cost || 0)), 0);
      }

      if (cogs > 0.01) {
        let existingCOGS = await getDocs(
          query(COLS.journalEntries(), where("sourceType", "==", "deliveryNote_cogs"), where("sourceId", "==", sourceKey), limit(1))
        );
        if (existingCOGS.empty && dn.number && dn.number !== sourceKey) {
          existingCOGS = await getDocs(
            query(COLS.journalEntries(), where("sourceType", "==", "deliveryNote_cogs"), where("refNumber", "==", dn.number), limit(1))
          );
        }

        if (existingCOGS.empty) {
          const invCode = this._inventoryCode(dn.warehouseId, warehouses, dn.warehouseName);
          const invName = this._acc(invCode)?.name || "المخزون";
          const cogsCode = ACCT.COGS;
          const cogsName = this._acc(cogsCode)?.name || "تكلفة البضاعة المباعة";

          const cogsLines = [
            this._line(cogsCode, cogsName, cogs, 0, `تكلفة بضاعة مسلّمة سند ${dnNum}`),
            this._line(invCode, invName, 0, cogs, `صرف مخزون تسليم بضاعة سند ${dnNum}`)
          ];

          await createJournalEntry({
            date,
            refNumber: dnNum,
            description: `تكلفة بضاعة مباعة — سند تسليم ${dnNum}`,
            sourceType: "deliveryNote_cogs",
            sourceId: sourceKey,
            lines: cogsLines,
            status: "posted",
            createdByName: user.displayName || user.name || "النظام"
          });
          console.log(`[AccountingEngine] DeliveryNote COGS JE created for ${dnNum}`);
        }
      }

      return je1Id;
    } catch (err) {
      console.error("[AccountingEngine] DeliveryNote JE error:", err.message);
      throw err;
    }
  }
}

// ──────────────────────────────────────────
// Singleton Instance
// ──────────────────────────────────────────
let _engineInstance = null;

export function getAccountingEngine() {
  if (!_engineInstance) _engineInstance = new AccountingEngine();
  return _engineInstance;
}

// Reset engine so next call reloads the COA from Firestore (call after seeding accounts)
export function resetAccountingEngine() {
  _engineInstance = null;
}

// ──────────────────────────────────────────
// Convenience functions (module-level)
// Each call creates a FRESH engine instance to guarantee latest COA is used.
// ──────────────────────────────────────────
export async function autoSalesJE(invoice, user, warehouses) {
  const eng = new AccountingEngine();
  return eng.createSalesJE(invoice, user, warehouses);
}
export async function autoPurchaseJE(invoice, user, warehouses) {
  const eng = new AccountingEngine();
  return eng.createPurchaseJE(invoice, user, warehouses);
}
export async function autoSalesReturnJE(ret, user, warehouses) {
  const eng = new AccountingEngine();
  return eng.createSalesReturnJE(ret, user, warehouses);
}
export async function autoPurchaseReturnJE(ret, user, warehouses) {
  const eng = new AccountingEngine();
  return eng.createPurchaseReturnJE(ret, user, warehouses);
}
export async function autoCustomerPaymentJE(payment, user) {
  const eng = new AccountingEngine();
  return eng.createCustomerPaymentJE(payment, user);
}
export async function autoSupplierPaymentJE(payment, user) {
  const eng = new AccountingEngine();
  return eng.createSupplierPaymentJE(payment, user);
}
export async function autoPOSJE(sale, user) {
  const eng = new AccountingEngine();
  return eng.createPOSJE(sale, user);
}
export async function autoDeliveryNoteJE(dn, user, warehouses) {
  const eng = new AccountingEngine();
  return eng.createDeliveryNoteJE(dn, user, warehouses);
}

// ──────────────────────────────────────────
// Account Map Exports (for UI display)
// ──────────────────────────────────────────
export const ACCOUNT_CODES = ACCT;
