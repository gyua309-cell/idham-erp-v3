// ============================================================
// IDHAM ERP — Chart of Accounts v4.0
// شجرة الحسابات الكاملة — 5 مستويات — IFRS / SOCPA
// ============================================================
// Level 0: الفصل الرئيسي          (1)
// Level 1: المجموعة الرئيسية      (1-1)
// Level 2: مجموعة الحسابات        (1-1-1)
// Level 3: الحساب الرئيسي         (1-1-1-1)
// Level 4: الحساب التحليلي         (1-1-1-1-1)
// ============================================================

import {
  COLS, create, update, getAll, clearERPCache,
  query, where, orderBy, getDocs, getDoc,
  doc, serverTimestamp, limit, writeBatch, updateDoc
} from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { formatCurrency, tafqeetArabic, todayString } from "../utils/formatters.js";
import { backfillCOAFromEntities } from "../utils/coa-connector.js";

// ──────────────────────────────────────────
// Account Types
// ──────────────────────────────────────────
const ACC_TYPES = {
  asset:     { label:"الأصول",         code:"1", color:"#6366f1" },
  liability: { label:"الخصوم",         code:"2", color:"#ef4444" },
  equity:    { label:"حقوق الملكية",   code:"3", color:"#10b981" },
  revenue:   { label:"الإيرادات",      code:"4", color:"#22c55e" },
  expense:   { label:"المصروفات",      code:"5", color:"#f59e0b" },
};

// ──────────────────────────────────────────
// FULL 5-LEVEL CHART OF ACCOUNTS
// Food Distribution Company — IFRS / SOCPA
// ──────────────────────────────────────────
const DEFAULT_COA = [

  // ═══════════════════════════════════════
  // 1. ASSETS — الأصول
  // ═══════════════════════════════════════
  { code:"1",           name:"الأصول",                                  type:"asset",     parentCode:null,      nodeType:"header", level:0 },

  // ── 1-1 الأصول المتداولة ──
  { code:"1-1",         name:"الأصول المتداولة",                        type:"asset",     parentCode:"1",       nodeType:"header", level:1 },

  // 1-1-1 النقدية وما في حكمها
  { code:"1-1-1",       name:"النقدية وما في حكمها",                   type:"asset",     parentCode:"1-1",     nodeType:"header", level:2 },
  { code:"1-1-1-1",     name:"مجموعة الصندوق الرئيسي",                 type:"asset",     parentCode:"1-1-1",   nodeType:"header", level:3 },
  { code:"1-1-1-1-2",   name:"صندوق النثريات",                         type:"asset",     parentCode:"1-1-1-1", nodeType:"detail", level:4 },
  { code:"1-1-1-2",     name:"صناديق المناديب",                        type:"asset",     parentCode:"1-1-1",   nodeType:"header", level:3 },
  { code:"1-1-1-3",     name:"الحسابات البنكية",                       type:"asset",     parentCode:"1-1-1",   nodeType:"header", level:3 },
  { code:"1-1-1-3-1",   name:"البنك الأهلي السعودي",                   type:"asset",     parentCode:"1-1-1-3", nodeType:"detail", level:4 },
  { code:"1-1-1-3-2",   name:"بنك الراجحي",                            type:"asset",     parentCode:"1-1-1-3", nodeType:"detail", level:4 },
  { code:"1-1-1-3-3",   name:"بنك الإنماء",                            type:"asset",     parentCode:"1-1-1-3", nodeType:"detail", level:4 },

  // 1-1-2 الذمم المدينة التجارية
  { code:"1-1-2",       name:"الذمم المدينة التجارية",                 type:"asset",     parentCode:"1-1",     nodeType:"header", level:2 },
  { code:"1-1-2-1",     name:"ذمم عملاء تجزئة",                       type:"asset",     parentCode:"1-1-2",   nodeType:"header", level:3 },
  { code:"1-1-2-1-1",   name:"ذمم عملاء تجزئة — محلية",               type:"asset",     parentCode:"1-1-2-1", nodeType:"header", level:4 },
  { code:"1-1-2-1-2",   name:"ذمم عملاء تجزئة — مناديب",              type:"asset",     parentCode:"1-1-2-1", nodeType:"header", level:4 },
  { code:"1-1-2-2",     name:"ذمم عملاء جملة",                        type:"asset",     parentCode:"1-1-2",   nodeType:"header", level:3 },
  { code:"1-1-2-2-1",   name:"ذمم عملاء جملة — شركات",                type:"asset",     parentCode:"1-1-2-2", nodeType:"detail", level:4 },
  { code:"1-1-2-2-2",   name:"ذمم عملاء جملة — أفراد",                type:"asset",     parentCode:"1-1-2-2", nodeType:"detail", level:4 },
  { code:"1-1-2-3",     name:"مخصص الديون المشكوك فيها",               type:"asset",     parentCode:"1-1-2",   nodeType:"detail", level:3 },
  { code:"1-1-3",       name:"أوراق القبض",                            type:"asset",     parentCode:"1-1",     nodeType:"header", level:2 },
  { code:"1-1-3-1",     name:"أوراق قبض — شيكات آجلة",                type:"asset",     parentCode:"1-1-3",   nodeType:"detail", level:3 },
  { code:"1-1-3-2",     name:"أوراق قبض — كمبيالات",                   type:"asset",     parentCode:"1-1-3",   nodeType:"detail", level:3 },

  // 1-1-4 المخزون
  { code:"1-1-4",       name:"المخزون",                                 type:"asset",     parentCode:"1-1",     nodeType:"header", level:2 },
  { code:"1-1-4-1",     name:"مخزون المستودعات وسيارات التوزيع",          type:"asset",     parentCode:"1-1-4",   nodeType:"header", level:3 },
  { code:"1-1-4-1-01",  name:"مخزون المستودع الرئيسي",                  type:"asset",     parentCode:"1-1-4-1", nodeType:"detail", level:4 },
  { code:"1-1-4-1-02",  name:"مخزون سيارات التوزيع",                    type:"asset",     parentCode:"1-1-4-1", nodeType:"header", level:4 },
  { code:"1-1-4-3",     name:"مخصص هالك وتالف المخزون",                type:"asset",     parentCode:"1-1-4",   nodeType:"detail", level:3 },

  // 1-1-5 أصول متداولة أخرى
  { code:"1-1-5",       name:"أصول متداولة أخرى",                      type:"asset",     parentCode:"1-1",     nodeType:"header", level:2 },
  { code:"1-1-5-1",     name:"مصروفات مدفوعة مقدماً",                  type:"asset",     parentCode:"1-1-5",   nodeType:"header", level:3 },
  { code:"1-1-5-1-1",   name:"إيجار مدفوع مقدماً",                     type:"asset",     parentCode:"1-1-5-1", nodeType:"detail", level:4 },
  { code:"1-1-5-1-2",   name:"تأمين مدفوع مقدماً",                     type:"asset",     parentCode:"1-1-5-1", nodeType:"detail", level:4 },
  { code:"1-1-5-1-3",   name:"اشتراكات مدفوعة مقدماً",                 type:"asset",     parentCode:"1-1-5-1", nodeType:"detail", level:4 },
  { code:"1-1-5-2",     name:"ضريبة القيمة المضافة — المدخلات",        type:"asset",     parentCode:"1-1-5",   nodeType:"detail", level:3 },
  { code:"1-1-5-3",     name:"سلف للموردين",                           type:"asset",     parentCode:"1-1-5",   nodeType:"detail", level:3 },
  { code:"1-1-5-4",     name:"سلف للموظفين والمناديب",                 type:"asset",     parentCode:"1-1-5",   nodeType:"header", level:3 },
  { code:"1-1-5-4-1",   name:"سلف موظفين",                             type:"asset",     parentCode:"1-1-5-4", nodeType:"detail", level:4 },
  { code:"1-1-5-4-2",   name:"سلف مناديب",                             type:"asset",     parentCode:"1-1-5-4", nodeType:"detail", level:4 },
  { code:"1-1-5-5",     name:"ذمم مدينة أخرى",                         type:"asset",     parentCode:"1-1-5",   nodeType:"detail", level:3 },

  // ── 1-2 الأصول الثابتة ──
  { code:"1-2",         name:"الأصول الثابتة",                         type:"asset",     parentCode:"1",       nodeType:"header", level:1 },
  { code:"1-2-1",       name:"السيارات والمركبات",                      type:"asset",     parentCode:"1-2",     nodeType:"header", level:2 },
  { code:"1-2-1-1",     name:"سيارات التوزيع — التكلفة",               type:"asset",     parentCode:"1-2-1",   nodeType:"detail", level:3 },
  { code:"1-2-1-2",     name:"م.خصم: إهلاك متراكم — سيارات",           type:"asset",     parentCode:"1-2-1",   nodeType:"detail", level:3 },
  { code:"1-2-2",       name:"معدات وآلات",                             type:"asset",     parentCode:"1-2",     nodeType:"header", level:2 },
  { code:"1-2-2-1",     name:"معدات وآلات — التكلفة",                  type:"asset",     parentCode:"1-2-2",   nodeType:"header", level:3 },
  { code:"1-2-2-1-1",   name:"معدات تبريد وتخزين — التكلفة",          type:"asset",     parentCode:"1-2-2-1", nodeType:"detail", level:4 },
  { code:"1-2-2-1-2",   name:"معدات إنتاج وتشغيل — التكلفة",         type:"asset",     parentCode:"1-2-2-1", nodeType:"detail", level:4 },
  { code:"1-2-2-2",     name:"م.خصم: إهلاك متراكم — معدات",            type:"asset",     parentCode:"1-2-2",   nodeType:"detail", level:3 },
  { code:"1-2-3",       name:"أثاث ومفروشات",                           type:"asset",     parentCode:"1-2",     nodeType:"header", level:2 },
  { code:"1-2-3-1",     name:"أثاث ومفروشات — التكلفة",                type:"asset",     parentCode:"1-2-3",   nodeType:"detail", level:3 },
  { code:"1-2-3-2",     name:"م.خصم: إهلاك متراكم — أثاث",             type:"asset",     parentCode:"1-2-3",   nodeType:"detail", level:3 },
  { code:"1-2-4",       name:"أجهزة وحاسبات",                          type:"asset",     parentCode:"1-2",     nodeType:"header", level:2 },
  { code:"1-2-4-1",     name:"أجهزة وحاسبات — التكلفة",                type:"asset",     parentCode:"1-2-4",   nodeType:"detail", level:3 },
  { code:"1-2-4-2",     name:"م.خصم: إهلاك متراكم — أجهزة",            type:"asset",     parentCode:"1-2-4",   nodeType:"detail", level:3 },
  { code:"1-2-5",       name:"تحسينات على العقارات المستأجرة",          type:"asset",     parentCode:"1-2",     nodeType:"detail", level:2 },

  // ── 1-3 الأصول غير الملموسة ──
  { code:"1-3",         name:"الأصول غير الملموسة",                    type:"asset",     parentCode:"1",       nodeType:"header", level:1 },
  { code:"1-3-1",       name:"برامج ورخص تشغيل",                       type:"asset",     parentCode:"1-3",     nodeType:"detail", level:2 },
  { code:"1-3-2",       name:"تراخيص تجارية وسجلات",                   type:"asset",     parentCode:"1-3",     nodeType:"detail", level:2 },
  { code:"1-3-3",       name:"م.خصم: استهلاك متراكم — أصول غير ملموسة",type:"asset",     parentCode:"1-3",     nodeType:"detail", level:2 },

  // ═══════════════════════════════════════
  // 2. LIABILITIES — الخصوم
  // ═══════════════════════════════════════
  { code:"2",           name:"الخصوم",                                  type:"liability", parentCode:null,      nodeType:"header", level:0 },

  // ── 2-1 الخصوم المتداولة ──
  { code:"2-1",         name:"الخصوم المتداولة",                        type:"liability", parentCode:"2",       nodeType:"header", level:1 },
  { code:"2-1-1",       name:"الذمم الدائنة التجارية",                  type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-1-1",     name:"ذمم موردون محليون",                       type:"liability", parentCode:"2-1-1",   nodeType:"header", level:3 },
  { code:"2-1-1-1-1",   name:"ذمم موردون غذائية — محلي",               type:"liability", parentCode:"2-1-1-1", nodeType:"header", level:4 },
  { code:"2-1-1-1-2",   name:"ذمم موردون تغليف — محلي",                type:"liability", parentCode:"2-1-1-1", nodeType:"detail", level:4 },
  { code:"2-1-1-2",     name:"ذمم موردون استيراد",                      type:"liability", parentCode:"2-1-1",   nodeType:"header", level:3 },
  { code:"2-1-1-2-1",   name:"ذمم موردون غذائية — استيراد",             type:"liability", parentCode:"2-1-1-2", nodeType:"detail", level:4 },
  { code:"2-1-2",       name:"أوراق الدفع",                             type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-2-1",     name:"أوراق دفع — شيكات",                      type:"liability", parentCode:"2-1-2",   nodeType:"detail", level:3 },
  { code:"2-1-2-2",     name:"أوراق دفع — كمبيالات",                    type:"liability", parentCode:"2-1-2",   nodeType:"detail", level:3 },
  { code:"2-1-3",       name:"الضرائب والرسوم المستحقة",                type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-3-1",     name:"ضريبة القيمة المضافة — المخرجات",         type:"liability", parentCode:"2-1-3",   nodeType:"detail", level:3 },
  { code:"2-1-3-2",     name:"ضريبة الاستقطاع المستحقة",                type:"liability", parentCode:"2-1-3",   nodeType:"detail", level:3 },
  { code:"2-1-3-3",     name:"ضريبة القيمة المضافة الصافية (للتسوية)", type:"liability", parentCode:"2-1-3",   nodeType:"detail", level:3 },
  { code:"2-1-4",       name:"المصروفات المستحقة الدفع",                type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-4-1",     name:"رواتب مستحقة الدفع",                     type:"liability", parentCode:"2-1-4",   nodeType:"detail", level:3 },
  { code:"2-1-4-2",     name:"عمولات مناديب مستحقة",                   type:"liability", parentCode:"2-1-4",   nodeType:"detail", level:3 },
  { code:"2-1-4-3",     name:"إيجار مستحق الدفع",                      type:"liability", parentCode:"2-1-4",   nodeType:"detail", level:3 },
  { code:"2-1-4-4",     name:"مصروفات مستحقة أخرى",                    type:"liability", parentCode:"2-1-4",   nodeType:"detail", level:3 },
  { code:"2-1-5",       name:"مستحقات الموظفين والمناديب",              type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-5-1",     name:"التأمينات الاجتماعية (GOSI) المستحقة",   type:"liability", parentCode:"2-1-5",   nodeType:"detail", level:3 },
  { code:"2-1-5-2",     name:"مكافأة نهاية الخدمة المستحقة",            type:"liability", parentCode:"2-1-5",   nodeType:"detail", level:3 },
  { code:"2-1-6",       name:"دفعات مقدمة من العملاء",                  type:"liability", parentCode:"2-1",     nodeType:"detail", level:2 },
  { code:"2-1-7",       name:"قروض بنكية قصيرة الأجل",                 type:"liability", parentCode:"2-1",     nodeType:"header", level:2 },
  { code:"2-1-7-1",     name:"تسهيلات ائتمانية جارية",                 type:"liability", parentCode:"2-1-7",   nodeType:"detail", level:3 },
  { code:"2-1-7-2",     name:"الجزء المتداول من قروض طويلة",            type:"liability", parentCode:"2-1-7",   nodeType:"detail", level:3 },

  // ── 2-2 الخصوم غير المتداولة ──
  { code:"2-2",         name:"الخصوم غير المتداولة",                    type:"liability", parentCode:"2",       nodeType:"header", level:1 },
  { code:"2-2-1",       name:"قروض بنكية طويلة الأجل",                 type:"liability", parentCode:"2-2",     nodeType:"header", level:2 },
  { code:"2-2-1-1",     name:"قرض بنكي — البنك الأهلي",                type:"liability", parentCode:"2-2-1",   nodeType:"detail", level:3 },
  { code:"2-2-1-2",     name:"قرض بنكي — الراجحي",                     type:"liability", parentCode:"2-2-1",   nodeType:"detail", level:3 },
  { code:"2-2-2",       name:"التزامات عقود الإيجار التمويلي",          type:"liability", parentCode:"2-2",     nodeType:"detail", level:2 },
  { code:"2-2-3",       name:"مخصص مكافأة نهاية الخدمة",               type:"liability", parentCode:"2-2",     nodeType:"detail", level:2 },

  // ═══════════════════════════════════════
  // 3. EQUITY — حقوق الملكية
  // ═══════════════════════════════════════
  { code:"3",           name:"حقوق الملكية",                            type:"equity",    parentCode:null,      nodeType:"header", level:0 },
  { code:"3-1",         name:"رأس المال",                               type:"equity",    parentCode:"3",       nodeType:"header", level:1 },
  { code:"3-1-1",       name:"رأس المال المدفوع",                       type:"equity",    parentCode:"3-1",     nodeType:"detail", level:2 },
  { code:"3-1-2",       name:"رأس المال غير المدفوع",                   type:"equity",    parentCode:"3-1",     nodeType:"detail", level:2 },
  { code:"3-2",         name:"الاحتياطيات",                             type:"equity",    parentCode:"3",       nodeType:"header", level:1 },
  { code:"3-2-1",       name:"الاحتياطي النظامي",                       type:"equity",    parentCode:"3-2",     nodeType:"detail", level:2 },
  { code:"3-2-2",       name:"الاحتياطي الاختياري",                     type:"equity",    parentCode:"3-2",     nodeType:"detail", level:2 },
  { code:"3-4",         name:"صافي الربح / الخسارة للفترة",             type:"equity",    parentCode:"3",       nodeType:"detail", level:1 },
  { code:"3-5",         name:"مسحوبات الشريك / الملاك",                 type:"equity",    parentCode:"3",       nodeType:"detail", level:1 },

  // ═══════════════════════════════════════
  // 4. REVENUE — الإيرادات
  // ═══════════════════════════════════════
  { code:"4",           name:"الإيرادات",                               type:"revenue",   parentCode:null,      nodeType:"header", level:0 },

  // ── 4-1 الإيرادات التشغيلية ──
  { code:"4-1",         name:"الإيرادات التشغيلية",                     type:"revenue",   parentCode:"4",       nodeType:"header", level:1 },
  { code:"4-1-1",       name:"إيرادات مبيعات المواد الغذائية",          type:"revenue",   parentCode:"4-1",     nodeType:"header", level:2 },
  { code:"4-1-1-1",     name:"مبيعات التجزئة",                          type:"revenue",   parentCode:"4-1-1",   nodeType:"header", level:3 },
  { code:"4-1-1-1-1",   name:"مبيعات تجزئة — نقد",                     type:"revenue",   parentCode:"4-1-1-1", nodeType:"detail", level:4 },
  { code:"4-1-1-1-2",   name:"مبيعات تجزئة — شبكة",                    type:"revenue",   parentCode:"4-1-1-1", nodeType:"detail", level:4 },
  { code:"4-1-1-1-3",   name:"مبيعات تجزئة — آجل",                     type:"revenue",   parentCode:"4-1-1-1", nodeType:"detail", level:4 },
  { code:"4-1-1-2",     name:"مبيعات الجملة",                           type:"revenue",   parentCode:"4-1-1",   nodeType:"header", level:3 },
  { code:"4-1-1-2-1",   name:"مبيعات جملة — فواتير",                   type:"revenue",   parentCode:"4-1-1-2", nodeType:"detail", level:4 },
  { code:"4-1-1-2-2",   name:"مبيعات جملة — عروض أسعار مقبولة",        type:"revenue",   parentCode:"4-1-1-2", nodeType:"detail", level:4 },
  { code:"4-1-1-3",     name:"مبيعات نقطة البيع (POS)",                 type:"revenue",   parentCode:"4-1-1",   nodeType:"detail", level:3 },
  { code:"4-1-2",       name:"مردودات ومسموحات المبيعات",               type:"revenue",   parentCode:"4-1",     nodeType:"header", level:2 },
  { code:"4-1-2-1",     name:"مردودات مبيعات — تجزئة",                 type:"revenue",   parentCode:"4-1-2",   nodeType:"detail", level:3 },
  { code:"4-1-2-2",     name:"مردودات مبيعات — جملة",                  type:"revenue",   parentCode:"4-1-2",   nodeType:"detail", level:3 },
  { code:"4-1-3",       name:"الخصم المسموح به (خصومات المبيعات)",      type:"revenue",   parentCode:"4-1",     nodeType:"header", level:2 },
  { code:"4-1-3-1",     name:"خصم تجاري ممنوح",                        type:"revenue",   parentCode:"4-1-3",   nodeType:"detail", level:3 },
  { code:"4-1-3-2",     name:"خصم نقدي ممنوح",                         type:"revenue",   parentCode:"4-1-3",   nodeType:"detail", level:3 },

  // ── 4-2 الإيرادات الأخرى ──
  { code:"4-2",         name:"الإيرادات الأخرى",                        type:"revenue",   parentCode:"4",       nodeType:"header", level:1 },
  { code:"4-2-1",       name:"فوائد وأرباح بنكية",                      type:"revenue",   parentCode:"4-2",     nodeType:"detail", level:2 },
  { code:"4-2-2",       name:"أرباح بيع الأصول الثابتة",               type:"revenue",   parentCode:"4-2",     nodeType:"detail", level:2 },
  { code:"4-2-3",       name:"إيرادات إيجار",                           type:"revenue",   parentCode:"4-2",     nodeType:"detail", level:2 },
  { code:"4-2-4",       name:"خصومات مكتسبة من الموردين",              type:"revenue",   parentCode:"4-2",     nodeType:"detail", level:2 },
  { code:"4-2-5",       name:"إيرادات متنوعة أخرى",                    type:"revenue",   parentCode:"4-2",     nodeType:"detail", level:2 },

  // ═══════════════════════════════════════
  // 5. EXPENSES — المصروفات
  // ═══════════════════════════════════════
  { code:"5",           name:"المصروفات",                               type:"expense",   parentCode:null,      nodeType:"header", level:0 },

  // ── 5-1 تكلفة البضاعة المباعة (COGS) ──
  { code:"5-1",         name:"إجمالي تكلفة المبيعات (COGS)",            type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-1-2",       name:"مردودات المشتريات",                       type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-3",       name:"خصومات المشتريات المكتسبة",               type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-4",       name:"هالك وتالف المخزون",                      type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-5",       name:"فروق جرد المخزون",                        type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-6",       name:"رسوم استيراد وجمارك",                     type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-7",       name:"مصروفات نقل بضاعة (للداخل)",               type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },
  { code:"5-1-8",       name:"مصروف تكلفة البضاعة المباعة",                type:"expense",   parentCode:"5-1",     nodeType:"detail", level:2 },

  // ── 5-2 مصروفات الموظفين والعمالة ──
  { code:"5-2",         name:"مصروفات الموظفين والعمالة",               type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-2-1",       name:"رواتب الإدارة",                           type:"expense",   parentCode:"5-2",     nodeType:"header", level:2 },
  { code:"5-2-1-1",     name:"راتب المدير العام",                       type:"expense",   parentCode:"5-2-1",   nodeType:"detail", level:3 },
  { code:"5-2-1-2",     name:"رواتب المحاسبين",                         type:"expense",   parentCode:"5-2-1",   nodeType:"detail", level:3 },
  { code:"5-2-1-3",     name:"رواتب الإدارية",                          type:"expense",   parentCode:"5-2-1",   nodeType:"detail", level:3 },
  { code:"5-2-2",       name:"رواتب الموظفين",                          type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },
  { code:"5-2-3",       name:"رواتب المناديب وسائقي التوزيع",           type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },
  { code:"5-2-4",       name:"عمولات المبيعات والمناديب",               type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },
  { code:"5-2-5",       name:"بدلات (سكن، مواصلات، طعام)",              type:"expense",   parentCode:"5-2",     nodeType:"header", level:2 },
  { code:"5-2-5-1",     name:"بدل سكن",                                 type:"expense",   parentCode:"5-2-5",   nodeType:"detail", level:3 },
  { code:"5-2-5-2",     name:"بدل مواصلات",                             type:"expense",   parentCode:"5-2-5",   nodeType:"detail", level:3 },
  { code:"5-2-5-3",     name:"بدل طعام",                                type:"expense",   parentCode:"5-2-5",   nodeType:"detail", level:3 },
  { code:"5-2-6",       name:"التأمينات الاجتماعية (GOSI) — حصة صاحب العمل", type:"expense", parentCode:"5-2", nodeType:"detail", level:2 },
  { code:"5-2-7",       name:"مكافأة نهاية الخدمة",                    type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },
  { code:"5-2-8",       name:"تدريب وتطوير الكوادر",                   type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },
  { code:"5-2-9",       name:"تأمين طبي للموظفين",                      type:"expense",   parentCode:"5-2",     nodeType:"detail", level:2 },

  // ── 5-3 مصروفات التوزيع واللوجستيات ──
  { code:"5-3",         name:"مصروفات التوزيع واللوجستيات",             type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-3-1",       name:"وقود سيارات التوزيع",                    type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },
  { code:"5-3-2",       name:"صيانة وإصلاح سيارات التوزيع",            type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },
  { code:"5-3-3",       name:"رسوم تسجيل ومرور السيارات",              type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },
  { code:"5-3-4",       name:"تأمين السيارات",                          type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },
  { code:"5-3-5",       name:"شحن وتوزيع خارجي",                       type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },
  { code:"5-3-6",       name:"رسوم تخزين خارجية",                      type:"expense",   parentCode:"5-3",     nodeType:"detail", level:2 },

  // ── 5-4 المصروفات الإدارية والعمومية ──
  { code:"5-4",         name:"المصروفات الإدارية والعمومية",            type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-4-1",       name:"الإيجارات",                               type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-1-1",     name:"إيجار المستودع الرئيسي",                 type:"expense",   parentCode:"5-4-1",   nodeType:"detail", level:3 },
  { code:"5-4-1-2",     name:"إيجار المكتب الرئيسي",                   type:"expense",   parentCode:"5-4-1",   nodeType:"detail", level:3 },
  { code:"5-4-1-3",     name:"إيجار مستودعات فرعية",                   type:"expense",   parentCode:"5-4-1",   nodeType:"detail", level:3 },
  { code:"5-4-2",       name:"الخدمات (كهرباء، مياه، غاز)",            type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-2-1",     name:"فاتورة الكهرباء",                         type:"expense",   parentCode:"5-4-2",   nodeType:"detail", level:3 },
  { code:"5-4-2-2",     name:"فاتورة المياه",                           type:"expense",   parentCode:"5-4-2",   nodeType:"detail", level:3 },
  { code:"5-4-3",       name:"الاتصالات والإنترنت",                     type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-3-1",     name:"فاتورة الهاتف والاتصالات",               type:"expense",   parentCode:"5-4-3",   nodeType:"detail", level:3 },
  { code:"5-4-3-2",     name:"اشتراك الإنترنت",                         type:"expense",   parentCode:"5-4-3",   nodeType:"detail", level:3 },
  { code:"5-4-4",       name:"مستلزمات مكتبية وقرطاسية",               type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-5",       name:"مستلزمات المستودع والتغليف",              type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-6",       name:"تأمين البضائع والمستودع",                 type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-7",       name:"الرسوم القانونية والمهنية",               type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-7-1",     name:"أتعاب محاسب قانوني",                     type:"expense",   parentCode:"5-4-7",   nodeType:"detail", level:3 },
  { code:"5-4-7-2",     name:"أتعاب مستشار قانوني",                    type:"expense",   parentCode:"5-4-7",   nodeType:"detail", level:3 },
  { code:"5-4-8",       name:"رسوم حكومية وتراخيص",                    type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-8-1",     name:"رسوم تجديد السجل التجاري",               type:"expense",   parentCode:"5-4-8",   nodeType:"detail", level:3 },
  { code:"5-4-8-2",     name:"رسوم البلدية وأمانات المدن",              type:"expense",   parentCode:"5-4-8",   nodeType:"detail", level:3 },
  { code:"5-4-8-3",     name:"رسوم وزارة التجارة والصناعة",             type:"expense",   parentCode:"5-4-8",   nodeType:"detail", level:3 },
  { code:"5-4-9",       name:"إعلانات وتسويق",                          type:"expense",   parentCode:"5-4",     nodeType:"header", level:2 },
  { code:"5-4-9-1",     name:"إعلانات رقمية وسوشيال ميديا",            type:"expense",   parentCode:"5-4-9",   nodeType:"detail", level:3 },
  { code:"5-4-9-2",     name:"طباعة ومواد ترويجية",                    type:"expense",   parentCode:"5-4-9",   nodeType:"detail", level:3 },
  { code:"5-4-10",      name:"صيانة المعدات والأجهزة",                  type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-11",      name:"تنظيف وصحة بيئية",                       type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-12",      name:"أمن وحراسة",                             type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-13",      name:"ضيافة واستقبال",                          type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-14",      name:"مصروفات أخرى متنوعة",                    type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-15",      name:"مصروفات صيانة وتصليح المباني",           type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-16",      name:"رسوم تراخيص البرمجيات والاشتراكات السحابية", type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-17",      name:"مصروفات السيارات والانتقال والرحلات",   type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-18",      name:"الرسوم والغرامات والمخالفات الحكومية",    type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-19",      name:"مصروفات التدريب وورش العمل للموظفين",     type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-20",      name:"الاستشارات الفنية والتقنية والمهنية",    type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-21",      name:"هدايا ومساعدات ومساهمات اجتماعية",       type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-22",      name:"قرطاسية ومستلزمات مكتبية ومطبوعات ورق",  type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },
  { code:"5-4-23",      name:"عمولات بوابات الدفع الإلكتروني والشبكة", type:"expense",   parentCode:"5-4",     nodeType:"detail", level:2 },

  // ── 5-5 المصروفات المالية ──
  { code:"5-5",         name:"المصروفات المالية",                       type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-5-1",       name:"فوائد القروض البنكية",                   type:"expense",   parentCode:"5-5",     nodeType:"detail", level:2 },
  { code:"5-5-2",       name:"عمولات وخدمات بنكية",                    type:"expense",   parentCode:"5-5",     nodeType:"detail", level:2 },
  { code:"5-5-3",       name:"فوائد عقود الإيجار التمويلي",            type:"expense",   parentCode:"5-5",     nodeType:"detail", level:2 },
  { code:"5-5-4",       name:"خسائر فروق العملة",                      type:"expense",   parentCode:"5-5",     nodeType:"detail", level:2 },
  { code:"5-5-5",       name:"ديون معدومة",                            type:"expense",   parentCode:"5-5",     nodeType:"detail", level:2 },

  // ── 5-6 الإهلاك والاستهلاك ──
  { code:"5-6",         name:"الإهلاك والاستهلاك",                      type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-6-1",       name:"إهلاك السيارات والمركبات",               type:"expense",   parentCode:"5-6",     nodeType:"detail", level:2 },
  { code:"5-6-2",       name:"إهلاك المعدات والآلات",                  type:"expense",   parentCode:"5-6",     nodeType:"detail", level:2 },
  { code:"5-6-3",       name:"إهلاك الأثاث والمفروشات",                type:"expense",   parentCode:"5-6",     nodeType:"detail", level:2 },
  { code:"5-6-4",       name:"إهلاك الأجهزة والحاسبات",               type:"expense",   parentCode:"5-6",     nodeType:"detail", level:2 },
  { code:"5-6-5",       name:"استهلاك الأصول غير الملموسة",            type:"expense",   parentCode:"5-6",     nodeType:"detail", level:2 },
  { code:"5-6-6",       name:"استهلاك التحسينات على العقارات المستأجرة",type:"expense",  parentCode:"5-6",     nodeType:"detail", level:2 },

  // ── 5-7 المخصصات ──
  { code:"5-7",         name:"المخصصات والخسائر المحتملة",              type:"expense",   parentCode:"5",       nodeType:"header", level:1 },
  { code:"5-7-1",       name:"مصروف ديون مشكوك فيها",               type:"expense",   parentCode:"5-7",     nodeType:"detail", level:2 },
  { code:"5-7-2",       name:"مخصص هالك المخزون",                      type:"expense",   parentCode:"5-7",     nodeType:"detail", level:2 },
  { code:"5-7-3",       name:"مخصصات أخرى",                            type:"expense",   parentCode:"5-7",     nodeType:"detail", level:2 },
];

// ──────────────────────────────────────────
// Module State
// ──────────────────────────────────────────
let _accounts    = [];
let _expanded    = new Set(["1","2","3","4","5"]);
let _filterType  = "";
let _filterText  = "";
let _showInactive = false;

// ──────────────────────────────────────────
// Entry Point
// ──────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = buildLayout();
  await loadAccounts();
  // ✅ مزامنة تلقائية صامتة عند فتح الصفحة — تُصحح أي قيود فاتها التحديث الفوري
  setTimeout(() => window.rebuildAccountBalances?.({ silent: true })
    .catch(e => console.warn("[auto-sync on load]", e)), 2000);
}

// ──────────────────────────────────────────
// Layout
// ──────────────────────────────────────────
function buildLayout() {
  return `
<div class="coa-root">

  <!-- Toolbar -->
  <div class="coa-toolbar">
    <div class="coa-toolbar-left">
      <div class="coa-search-wrap">
        <i class="fas fa-search"></i>
        <input type="text" id="coa-search" class="coa-search-input"
               placeholder="بحث بالاسم أو الكود..." oninput="coaSearch(this.value)" />
      </div>
      <select id="coa-type-filter" class="coa-select" onchange="coaFilterType(this.value)">
        <option value="">جميع الأنواع</option>
        ${Object.entries(ACC_TYPES).map(([k,v]) =>
          `<option value="${k}">${v.label}</option>`).join("")}
      </select>
      <label class="coa-toggle-label">
        <input type="checkbox" id="coa-show-inactive" onchange="coaToggleInactive(this.checked)" />
        <span>إظهار المعطّلة</span>
      </label>
    </div>
    <div class="coa-toolbar-right">
      <button class="coa-btn coa-btn-ghost" onclick="coaCollapseAll()" title="طي الكل"><i class="fas fa-compress-alt"></i></button>
      <button class="coa-btn coa-btn-ghost" onclick="coaExpandAll()"   title="فتح الكل"><i class="fas fa-expand-alt"></i></button>
      <button class="coa-btn coa-btn-ghost" onclick="coaExpandLevel(1)" title="مستوى 1"><span style="font-size:11px;font-weight:900;">L1</span></button>
      <button class="coa-btn coa-btn-ghost" onclick="coaExpandLevel(2)" title="مستوى 2"><span style="font-size:11px;font-weight:900;">L2</span></button>
      <button class="coa-btn coa-btn-ghost" onclick="coaExpandLevel(3)" title="مستوى 3"><span style="font-size:11px;font-weight:900;">L3</span></button>
      <button class="coa-btn coa-btn-secondary" onclick="exportCoAPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
      <button class="coa-btn coa-btn-secondary" onclick="exportCoAExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      <button class="coa-btn coa-btn-primary" onclick="openAddAccountModal(null)"><i class="fas fa-plus"></i> حساب جديد</button>
    </div>
  </div>

  <!-- KPIs -->
  <div class="coa-kpis" id="coa-kpis"></div>

  <!-- Tree Header -->
  <div class="coa-tree-container">
    <div class="coa-tree-header">
      <span class="coa-th" style="width:180px">الكود</span>
      <span class="coa-th" style="flex:1">اسم الحساب</span>
      <span class="coa-th" style="width:80px">النوع</span>
      <span class="coa-th" style="width:100px;text-align:right">مدين</span>
      <span class="coa-th" style="width:100px;text-align:right">دائن</span>
      <span class="coa-th" style="width:110px;text-align:right">الرصيد</span>
      <span class="coa-th" style="width:130px"></span>
    </div>
    <div id="coa-tree" class="coa-tree">
      <div class="coa-loading"><i class="fas fa-spinner fa-spin"></i> جارٍ تحميل شجرة الحسابات...</div>
    </div>
  </div>

</div>

<!-- ═══ ADD / EDIT MODAL ═══ -->
<div class="modal-overlay" id="coa-modal">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 class="modal-title" id="coa-modal-title">إضافة حساب جديد</h3>
      <button class="modal-close" onclick="closeModal('coa-modal')">×</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="coa-edit-id" />
      <div class="grid-2 gap-16 mb-16">
        <div class="form-group">
          <label>كود الحساب <span class="text-bad">*</span></label>
          <input type="text" id="coa-code" class="input mono" placeholder="مثال: 1-1-1-1-1" />
        </div>
        <div class="form-group">
          <label>نوع الحساب <span class="text-bad">*</span></label>
          <select id="coa-type" class="input" onchange="coaTypeChanged()">
            ${Object.entries(ACC_TYPES).map(([k,v]) =>
              `<option value="${k}">${v.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-group mb-16">
        <label>اسم الحساب <span class="text-bad">*</span></label>
        <input type="text" id="coa-name" class="input" placeholder="اسم الحساب بالعربي" />
      </div>
      <div class="grid-2 gap-16 mb-16">
        <div class="form-group">
          <label>الحساب الرئيسي (الأب)</label>
          <select id="coa-parent" class="input" onchange="coaParentChanged()">
            <option value="">بدون أب (مستوى رئيسي)</option>
          </select>
        </div>
        <div class="form-group">
          <label>نوع العقدة</label>
          <select id="coa-node-type" class="input">
            <option value="header">رئيسي (Header) — لا يُسجَّل عليه</option>
            <option value="detail">تفصيلي (Detail) — يقبل القيود</option>
          </select>
        </div>
      </div>

      <!-- Auto Code Preview -->
      <div class="form-group mb-16">
        <label>الكود التلقائي المقترح</label>
        <div id="coa-code-preview-wrap" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div class="coa-code-preview" id="coa-code-preview-chip">—</div>
          <span style="font-size:11px;color:var(--text-3)">يُحدَّث تلقائياً عند تغيير الحساب الأب</span>
        </div>
      </div>
      <div class="grid-2 gap-16 mb-16">
        <div class="form-group">
          <label>الرصيد الافتتاحي (ر.س)</label>
          <input type="number" id="coa-opening" class="input mono" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>الطبيعة الطبيعية للرصيد</label>
          <select id="coa-normal-balance" class="input">
            <option value="debit">مدين (Debit)</option>
            <option value="credit">دائن (Credit)</option>
          </select>
        </div>
      </div>
      <div class="form-group mb-16">
        <label>وصف / ملاحظات</label>
        <textarea id="coa-desc" class="input" rows="2" placeholder="وصف اختياري..."></textarea>
      </div>
      <div id="coa-form-error" class="alert bad hidden"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-danger" id="coa-delete-btn" style="display:none" onclick="deleteAccount()">
        <i class="fas fa-trash"></i> حذف الحساب
      </button>
      <div style="flex:1"></div>
      <button class="btn btn-secondary" onclick="closeModal('coa-modal')">إلغاء</button>
      <button class="btn btn-primary" id="coa-save-btn" onclick="saveAccount()">
        <i class="fas fa-save"></i> حفظ الحساب
      </button>
    </div>
  </div>
</div>

<!-- ═══ LEDGER MODAL ═══ -->
<div class="modal-overlay" id="coa-ledger-modal">
  <div class="modal modal-xl" style="max-width:1150px; width:95%;">
    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">📜</span>
        <h3 class="modal-title" id="ledger-title" style="margin:0;">كشف حساب</h3>
      </div>
      <button class="modal-close" onclick="closeModal('coa-ledger-modal')">×</button>
    </div>

    <!-- Date Range & Period Filter Bar -->
    <div style="background:var(--bg-2, #f8fafc); border-bottom:1px solid var(--border-soft, #e2e8f0); padding:10px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:700; color:var(--text-1);"><i class="fas fa-calendar-alt" style="color:var(--brand);"></i> تحديد الفترة:</span>
        <div style="display:inline-flex; align-items:center; gap:5px;">
          <label for="ledger-from-date" style="font-size:11px; color:var(--text-2); font-weight:600;">من:</label>
          <input type="date" id="ledger-from-date" class="input" style="height:32px; padding:2px 8px; font-size:12px; width:135px;" onchange="window.filterLedgerByDate()" />
        </div>
        <div style="display:inline-flex; align-items:center; gap:5px;">
          <label for="ledger-to-date" style="font-size:11px; color:var(--text-2); font-weight:600;">إلى:</label>
          <input type="date" id="ledger-to-date" class="input" style="height:32px; padding:2px 8px; font-size:12px; width:135px;" onchange="window.filterLedgerByDate()" />
        </div>
        <div style="display:inline-flex; gap:4px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.setLedgerPeriod('thisMonth')">هذا الشهر</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.setLedgerPeriod('lastMonth')">الشهر السابق</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.setLedgerPeriod('all')">كامل الحركات</button>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span id="ledger-period-badge" class="badge" style="font-size:11px; padding:4px 10px; background:rgba(37,99,235,0.08); color:var(--brand); border:1px solid rgba(37,99,235,0.2);">عرض كامل الحركات</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.resetLedgerPeriod()" title="إعادة ضبط"><i class="fas fa-undo"></i> إعادة تعيين</button>
      </div>
    </div>

    <div class="modal-body" id="ledger-body" style="max-height: calc(85vh - 200px); overflow-y:auto; padding:16px;"></div>
    <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
      <div id="ledger-footer-info" style="font-size:11px; color:var(--text-2); font-family:monospace;"></div>
      <div style="display:flex; gap:8px;">
        <button id="ledger-payslip-btn" type="button" class="btn btn-secondary" style="display:none;" onclick="window.printAccountPayslip()"><i class="fas fa-file-invoice-dollar" style="color:var(--brand);"></i> 🖨️ قسيمة استلام راتب</button>
        <button class="btn btn-secondary" onclick="closeModal('coa-ledger-modal')">إغلاق</button>
        <button class="btn btn-primary" onclick="window.printAccountStatement()"><i class="fas fa-print"></i> طباعة كشف الحساب (عن الفترة المحددة)</button>
      </div>
    </div>
  </div>
</div>

<style>
.coa-root { display:flex; flex-direction:column; height:100%; }
.coa-toolbar {
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; padding:10px 14px; background:var(--bg-1);
  border-bottom:1px solid var(--border-soft); flex-wrap:wrap; flex-shrink:0;
}
.coa-toolbar-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.coa-toolbar-right { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.coa-search-wrap {
  display:flex; align-items:center; gap:7px;
  background:var(--bg-2); border:1px solid var(--border-soft);
  border-radius:8px; padding:6px 12px; width:220px;
}
.coa-search-wrap:focus-within { border-color:var(--brand); }
.coa-search-input { border:none; background:transparent; color:var(--text-0); font-size:13px; outline:none; width:100%; font-family:inherit; }
.coa-select { padding:6px 9px; border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-2); color:var(--text-0); font-size:12px; cursor:pointer; font-family:inherit; }
.coa-toggle-label { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text-2); cursor:pointer; }
.coa-btn { padding:6px 11px; border-radius:7px; border:none; cursor:pointer; font-size:12px; font-weight:700; font-family:inherit; display:flex; align-items:center; gap:5px; transition:all .15s; white-space:nowrap; }
.coa-btn-primary  { background:var(--brand); color:#fff; }
.coa-btn-primary:hover  { opacity:.88; }
.coa-btn-secondary { background:var(--bg-2); color:var(--text-1); border:1px solid var(--border-soft); }
.coa-btn-secondary:hover { border-color:var(--brand); color:var(--brand); }
.coa-btn-ghost { background:transparent; color:var(--text-2); padding:6px 8px; }
.coa-btn-ghost:hover { background:var(--bg-2); color:var(--brand); }

.coa-kpis { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; padding:10px 14px; background:var(--bg-0); border-bottom:1px solid var(--border-soft); flex-shrink:0; }
.coa-kpi { background:var(--bg-1); border-radius:9px; padding:10px 12px; border:1px solid var(--border-soft); text-align:center; }
.coa-kpi-label { font-size:10px; color:var(--text-2); margin-bottom:3px; }
.coa-kpi-value { font-size:14px; font-weight:900; font-variant-numeric:tabular-nums; }

.coa-tree-container { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.coa-tree-header { display:flex; padding:7px 14px; background:var(--bg-2); border-bottom:2px solid var(--border-soft); font-size:11px; font-weight:800; color:var(--text-2); flex-shrink:0; align-items:center; gap:0; }
.coa-th { display:flex; align-items:center; }
.coa-tree { flex:1; overflow-y:auto; }
.coa-loading { display:flex; align-items:center; justify-content:center; gap:10px; padding:40px; color:var(--text-2); font-size:14px; }

/* Tree Row */
.coa-row {
  display:flex; align-items:center; padding:4px 14px;
  border-bottom:1px solid rgba(255,255,255,0.025);
  transition:background .1s; cursor:default; gap:0;
  min-height:34px;
}
.coa-row:hover { background:var(--bg-1); }
.coa-row.header-row { background:rgba(255,255,255,0.02); }
.coa-row.header-row:hover { background:var(--bg-2); }
.coa-row.lv0 { border-bottom:2px solid var(--border-soft); min-height:40px; }
.coa-row.lv0 .coa-name-txt { font-size:15px !important; font-weight:900 !important; }
.coa-row.lv1 .coa-name-txt { font-size:14px !important; font-weight:800 !important; }
.coa-row.lv2 .coa-name-txt { font-size:13px !important; font-weight:700 !important; }
.coa-row.lv3 .coa-name-txt { font-size:13px !important; font-weight:600 !important; }
.coa-row.lv4 .coa-name-txt { font-size:12px !important; font-weight:500 !important; color:var(--text-1) !important; }
.coa-row.inactive { opacity:.4; }

/* Code cell */
.coa-cell-code {
  width:180px; flex-shrink:0;
  display:flex; align-items:center; gap:2px;
  font-family:monospace; font-size:12px; font-weight:800;
}
.coa-toggle-btn {
  background:none; border:none; cursor:pointer; color:var(--text-2);
  font-size:9px; padding:2px 3px; border-radius:3px;
  transition:transform .2s, background .15s; line-height:1; flex-shrink:0;
}
.coa-toggle-btn:hover { background:var(--bg-2); color:var(--brand); }
.coa-toggle-btn.open { transform:rotate(90deg); }
.coa-toggle-placeholder { width:16px; flex-shrink:0; }

/* Name cell */
.coa-cell-name { flex:1; display:flex; align-items:center; gap:6px; min-width:0; overflow:hidden; }
.coa-node-dot  { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.coa-name-txt  { white-space:nr; padding:4px 5px; border-radius:5px; color:var(--text-2); font-size:11px; transition:all .15s; }
.coa-act-btn.add:hover    { background:rgba(99,102,241,.15); color:var(--brand); }
.coa-act-btn.edit:hover   { background:rgba(245,158,11,.15);  color:#f59e0b; }
.coa-act-btn.ledger:hover { background:rgba(16,185,129,.15);  color:#10b981; }
.coa-act-btn.deact:hover  { background:rgba(239,68,68,.15);   color:#ef4444; }

/* Amount cells */
.coa-cell-type   { width:80px; flex-shrink:0; }
.coa-cell-amount { width:100px; flex-shrink:0; text-align:right; font-size:11px; font-family:monospace; font-variant-numeric:tabular-nums; }
.coa-cell-bal    { width:110px; flex-shrink:0; text-align:right; font-size:12px; font-weight:800; font-family:monospace; }
.amt-dr { color:var(--bad,#ef4444); }
.amt-cr { color:var(--good,#10b981); }
.amt-z  { color:var(--text-3); }
.bal-pos { color:var(--good,#10b981); }
.bal-neg { color:var(--bad,#ef4444); }

/* Actions */
.coa-cell-actions { width:130px; flex-shrink:0; display:flex; align-items:center; justify-content:flex-end; gap:3px; opacity:0.6; transition:opacity .15s; }
.coa-row:hover .coa-cell-actions { opacity:1; }
.coa-act-btn { background:none; border:none; cursor:pointer; padding:4px 5px; border-radius:5px; color:var(--text-2); font-size:11px; transition:all .15s; }

/* Type badge */
.coa-badge { display:inline-flex; align-items:center; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:800; white-space:nowrap; }

/* ── Enhanced action buttons ── */
.coa-act-btn.del:hover   { background:rgba(239,68,68,.2);   color:#ef4444; }
.coa-act-btn.del         { font-size:12px; }

/* ── Code preview chip ── */
.coa-code-preview {
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);
  border-radius:8px;padding:5px 10px;font-family:monospace;font-size:13px;
  color:#818cf8;font-weight:800;margin-top:6px;
  transition:all .2s;
}
.coa-code-preview.valid   { background:rgba(16,185,129,.1); border-color:rgba(16,185,129,.3); color:#10b981; }
.coa-code-preview.invalid { background:rgba(239,68,68,.1);  border-color:rgba(239,68,68,.3);  color:#ef4444; }

/* ── Inline edit ── */
.coa-name-txt.editing {
  background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.4);
  border-radius:4px;padding:1px 6px;outline:none;color:var(--text-0);
}

/* ── Level badge ── */
.coa-lvl-badge {
  font-size:8px;font-weight:900;padding:1px 5px;border-radius:4px;
  background:rgba(255,255,255,.06);color:var(--text-3);flex-shrink:0;
}

/* ── Smooth collapse animation ── */
.coa-children-wrap {
  overflow:hidden;
  transition:max-height .25s cubic-bezier(.4,0,.2,1), opacity .2s;
  max-height:9999px;
  opacity:1;
}
.coa-children-wrap.collapsed {
  max-height:0;
  opacity:0;
}
</style>
  `;
}

// ──────────────────────────────────────────
// Load & Build Tree
// ──────────────────────────────────────────
async function loadAccounts() {
  try {
    const docs = await getAll(COLS.chartOfAccounts());
    _accounts  = docs.map(data => ({
      id: data.id,
      ...data,
      _rawBalance: data.balance || 0,
      _rawDebit: data.totalDebit || 0,
      _rawCredit: data.totalCredit || 0
    })).filter(a => a.code !== "1-1-4-2" && a.id !== "1-1-4-2" && !(a.name && a.name.includes("1-1-4-2")));
    // Sort client-side by code
    _accounts.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true }));

    // Auto-migrate: If the chart of accounts has items but is missing account 5-1-7 (Freight-In), create it.
    const hasFreightIn = _accounts.some(a => a.code === "5-1-7");
    if (!hasFreightIn && _accounts.length > 0) {
      try {
        const colRef = COLS.chartOfAccounts();
        await create(colRef, {
          code: "5-1-7",
          name: "مصروفات نقل بضاعة (للداخل)",
          type: "expense",
          parentCode: "5-1",
          nodeType: "detail",
          level: 2,
          balance       : 0,
          totalDebit    : 0,
          totalCredit   : 0,
          openingBalance: 0,
          isActive      : true,
          companyId     : COMPANY_ID,
          normalBalance : "debit"
        });
        console.log("Auto-migrated Freight-In account (5-1-7).");
        // Reload accounts to fetch the newly created account
        setTimeout(() => loadAccounts(), 100);
        return;
      } catch (err) {
        console.error("Failed to auto-migrate Freight-In account:", err);
      }
    }

    renderKPIs();
    renderTree();
  } catch (err) {
    document.getElementById("coa-tree").innerHTML =
      `<div class="coa-loading" style="color:var(--bad)">خطأ: ${err.message}</div>`;
  }
}

// ──────────────────────────────────────────
// KPIs
// ──────────────────────────────────────────
function renderKPIs() {
  const el = document.getElementById("coa-kpis");
  if (!el) return;
  const kpis = [
    { label:"الأصول",       type:"asset",     color:"#6366f1" },
    { label:"الخصوم",       type:"liability", color:"#ef4444" },
    { label:"حقوق الملكية", type:"equity",    color:"#10b981" },
    { label:"الإيرادات",    type:"revenue",   color:"#22c55e" },
    { label:"المصروفات",    type:"expense",   color:"#f59e0b" },
  ];
  el.innerHTML = kpis.map(k => {
    const rawSum = _accounts
      .filter(a => a.type === k.type && a.nodeType === "detail" && a.isActive !== false)
      .reduce((s, a) => s + (a.balance || 0), 0);
    const total = Math.abs(rawSum);
    return `
      <div class="coa-kpi">
        <div class="coa-kpi-label">${k.label}</div>
        <div class="coa-kpi-value" style="color:${k.color}">${formatCurrency(total)}</div>
      </div>`;
  }).join("");
}

// ──────────────────────────────────────────
// Tree Rendering
// ──────────────────────────────────────────
function renderTree() {
  const el = document.getElementById("coa-tree");
  if (!el) return;

  let accounts = _accounts;
  if (!_showInactive) accounts = accounts.filter(a => a.isActive !== false);
  if (_filterType)    accounts = accounts.filter(a => a.type === _filterType);
  if (_filterText) {
    const q = _filterText.toLowerCase();
    accounts = accounts.filter(a =>
      (a.name||"").toLowerCase().includes(q) ||
      (a.code||"").toLowerCase().includes(q)
    );
  }

  if (!accounts.length) {
    el.innerHTML = `<div class="coa-loading">لا توجد حسابات</div>`;
    return;
  }

  // Build children map
  const childrenOf = {};
  accounts.forEach(a => {
    const pk = a.parentCode || "ROOT";
    (childrenOf[pk] = childrenOf[pk] || []).push(a);
  });

  // Bottom-up balance aggregation
  computeTotals(accounts);

  // Render from roots
  const html = [];
  const roots = (childrenOf["ROOT"] || childrenOf[""] || []).sort(byCode);
  roots.forEach(r => renderNode(r, 0, childrenOf, html, []));

  el.innerHTML = html.join("") || `<div class="coa-loading">لا توجد حسابات مطابقة</div>`;
}

function byCode(a,b) {
  return a.code.localeCompare(b.code, undefined, { numeric:true });
}

function computeTotals(accounts) {
  accounts.forEach(a => {
    a.totalDebit  = a._rawDebit    !== undefined ? a._rawDebit    : (a.totalDebit  || 0);
    a.totalCredit = a._rawCredit   !== undefined ? a._rawCredit   : (a.totalCredit || 0);
    const isCredit = a.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(a.type);
    const delta = a.totalDebit - a.totalCredit;
    a.balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
  });

  // We do NOT do bottom-up aggregation here because the values loaded from Firestore
  // are already fully aggregated and rolled up by rebuildAccountBalances() in the database!
  // Doing it again here causes double-counting since parent accounts already hold the rolled-up sums.
}

function renderNode(acc, depth, childrenOf, html, parentLines) {
  const children   = (childrenOf[acc.code] || []).sort(byCode);
  const hasChildren = children.length > 0;
  const isOpen      = _expanded.has(acc.code);
  const typeInfo    = ACC_TYPES[acc.type] || { color:"#888", label:"—" };
  const isHeader    = acc.nodeType === "header" || hasChildren;
  const inactive    = acc.isActive === false;
  const bal         = acc.balance || 0;
  const dr          = acc.totalDebit  || 0;
  const cr          = acc.totalCredit || 0;

  // Build indent with connector lines
  let indentHTML = "";
  for (let i = 0; i < depth; i++) {
    const isLast = (i === depth - 1);
    indentHTML += `<span class="coa-line-v" style="opacity:${isLast ? .15 : .07}"></span>`;
  }

  const toggleBtn = hasChildren
    ? `<button class="coa-toggle-btn ${isOpen ? "open" : ""}"
              onclick="event.stopPropagation();coaToggle('${acc.code}')"
              title="${isOpen ? "طي" : "فتح"}">
         <i class="fas fa-chevron-right" style="font-size:9px;"></i>
       </button>`
    : `<span class="coa-toggle-placeholder"></span>`;

  html.push(`
    <div class="coa-row ${isHeader ? "header-row" : ""} lv${Math.min(depth,4)} ${inactive ? "inactive" : ""}"
         data-code="${acc.code}">

      <div class="coa-cell-code" style="padding-right:${depth * 14}px">
        ${toggleBtn}
        <span style="color:${typeInfo.color};margin-right:4px">${acc.code}</span>
      </div>

      <div class="coa-cell-name">
        <span class="coa-node-dot" style="background:${typeInfo.color};opacity:${Math.max(.3, 1 - depth * .15)}"></span>
        <span class="coa-name-txt" title="${acc.name}">${acc.name}</span>
        ${inactive ? `<span style="font-size:9px;color:var(--text-3)">(معطّل)</span>` : ""}
      </div>

      <div class="coa-cell-type">
        <span class="coa-badge" style="background:${typeInfo.color}22;color:${typeInfo.color}">
          ${typeInfo.label}
        </span>
      </div>

      <div class="coa-cell-amount ${dr ? "amt-dr" : "amt-z"}">${dr ? formatCurrency(dr) : "—"}</div>
      <div class="coa-cell-amount ${cr ? "amt-cr" : "amt-z"}">${cr ? formatCurrency(cr) : "—"}</div>

      <div class="coa-cell-bal ${bal > 0 ? "bal-pos" : bal < 0 ? "bal-neg" : "amt-z"}">
        ${bal ? formatCurrency(Math.abs(bal)) : "0.00"}
      </div>

      <div class="coa-cell-actions">
        <button class="coa-act-btn add"    title="إضافة فرعي"
                onclick="event.stopPropagation();openAddAccountModal('${acc.code}')">
          <i class="fas fa-plus"></i>
        </button>
        <button class="coa-act-btn ledger" title="كشف الحساب"
                onclick="event.stopPropagation();openLedger('${acc.id}','${acc.code}','${(acc.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-list-alt"></i>
        </button>
        <button class="coa-act-btn edit"   title="تعديل"
                onclick="event.stopPropagation();editAccount('${acc.id}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="coa-act-btn del"    title="حذف نهائي"
                onclick="event.stopPropagation();deleteAccountConfirm('${acc.id}','${(acc.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-trash"></i>
        </button>
        <button class="coa-act-btn deact"  title="${inactive ? "تفعيل" : "تعطيل"}"
                onclick="event.stopPropagation();toggleAccountActive('${acc.id}','${(acc.name||"").replace(/'/g,"\\'")}',${inactive})">
          <i class="fas fa-${inactive ? "check-circle" : "ban"}"></i>
        </button>
      </div>
    </div>
  `);

  if (hasChildren && isOpen) {
    children.forEach(c => renderNode(c, depth + 1, childrenOf, html, []));
  }
}

// ──────────────────────────────────────────
// Tree Controls
// ──────────────────────────────────────────
window.coaToggle = code => {
  _expanded.has(code) ? _expanded.delete(code) : _expanded.add(code);
  renderTree();
};

window.coaExpandAll = () => {
  _accounts.forEach(a => _expanded.add(a.code));
  renderTree();
};

window.coaCollapseAll = () => { _expanded.clear(); renderTree(); };

window.coaExpandLevel = (maxLevel) => {
  _expanded.clear();
  _accounts.filter(a => (a.level || 0) < maxLevel).forEach(a => _expanded.add(a.code));
  renderTree();
};

window.coaSearch = val => {
  _filterText = val.trim();
  if (_filterText) window.coaExpandAll();
  else renderTree();
};

window.coaFilterType     = val => { _filterType = val; renderTree(); };
window.coaToggleInactive = val => { _showInactive = val; renderTree(); };

// ──────────────────────────────────────────
// Add / Edit Account Modal
// ──────────────────────────────────────────
window.openAddAccountModal = function(parentCode) {
  document.getElementById("coa-edit-id").value   = "";
  document.getElementById("coa-code").value      = "";
  document.getElementById("coa-name").value      = "";
  document.getElementById("coa-opening").value   = "";
  document.getElementById("coa-desc").value      = "";
  document.getElementById("coa-node-type").value = "detail";
  document.getElementById("coa-form-error").classList.add("hidden");
  document.getElementById("coa-modal-title").textContent = "إضافة حساب جديد";

  const parentSel = document.getElementById("coa-parent");
  parentSel.innerHTML = `<option value="">بدون أب</option>` +
    _accounts.map(a => `<option value="${a.code}" ${a.code === parentCode ? "selected" : ""}>${a.code} — ${a.name}</option>`).join("");

  if (parentCode) {
    const parent = _accounts.find(a => a.code === parentCode);
    if (parent) {
      document.getElementById("coa-type").value = parent.type;
      document.getElementById("coa-normal-balance").value = ["asset","expense"].includes(parent.type) ? "debit" : "credit";
    }
    suggestNextCode(parentCode);
  } else {
    // Reset preview chip
    const chip = document.getElementById("coa-code-preview-chip");
    if (chip) { chip.textContent = "حدد الحساب الأب أولاً"; chip.className = "coa-code-preview"; }
  }
  // Show delete btn only on edit
  const delBtn = document.getElementById("coa-delete-btn");
  if (delBtn) delBtn.style.display = "none";
  openModal("coa-modal");
};

function suggestNextCode(parentCode) {
  const children = _accounts.filter(a => a.parentCode === parentCode);
  let suggested;
  if (!children.length) {
    suggested = `${parentCode}-1`;
  } else {
    const nums = children.map(c => parseInt(c.code.split("-").pop()) || 0);
    suggested = `${parentCode}-${Math.max(...nums) + 1}`;
  }
  document.getElementById("coa-code").value = suggested;

  // Live preview chip
  const chip = document.getElementById("coa-code-preview-chip");
  if (chip) {
    const exists = _accounts.find(a => a.code === suggested);
    chip.textContent = `📌 ${suggested}`;
    chip.className   = `coa-code-preview ${exists ? "invalid" : "valid"}`;
    if (exists) chip.textContent += " (مستخدم!)";
  }
}

window.coaTypeChanged   = () => {
  const t = document.getElementById("coa-type").value;
  document.getElementById("coa-normal-balance").value = ["asset","expense"].includes(t) ? "debit" : "credit";
};
window.coaParentChanged = () => {
  const p = document.getElementById("coa-parent").value;
  if (p) {
    suggestNextCode(p);
    // Auto-inherit type from parent
    const parent = _accounts.find(a => a.code === p);
    if (parent && !document.getElementById("coa-edit-id").value) {
      document.getElementById("coa-type").value = parent.type;
      document.getElementById("coa-normal-balance").value =
        ["asset","expense"].includes(parent.type) ? "debit" : "credit";
    }
  }
};

window.editAccount = id => {
  const acc = _accounts.find(a => a.id === id); if (!acc) return;
  document.getElementById("coa-edit-id").value   = id;
  document.getElementById("coa-code").value      = acc.code;
  document.getElementById("coa-name").value      = acc.name;
  document.getElementById("coa-type").value      = acc.type;
  document.getElementById("coa-opening").value   = acc.openingBalance || "";
  document.getElementById("coa-desc").value      = acc.description || "";
  document.getElementById("coa-node-type").value = acc.nodeType || "detail";
  document.getElementById("coa-normal-balance").value = acc.normalBalance || "debit";
  document.getElementById("coa-modal-title").textContent = `تعديل: ${acc.name}`;
  document.getElementById("coa-form-error").classList.add("hidden");

  const parentSel = document.getElementById("coa-parent");
  parentSel.innerHTML = `<option value="">بدون أب (مستوى رئيسي)</option>` +
    _accounts.filter(a => a.id !== id).map(a =>
      `<option value="${a.code}" ${a.code === acc.parentCode ? "selected" : ""}>${a.code} — ${a.name}</option>`).join("");

  // Show delete button (only available in edit mode)
  const delBtn = document.getElementById("coa-delete-btn");
  if (delBtn) delBtn.style.display = "inline-flex";

  // Show current code in preview chip
  const chip = document.getElementById("coa-code-preview-chip");
  if (chip) { chip.textContent = `📌 ${acc.code} (الكود الحالي)`; chip.className = "coa-code-preview valid"; }

  openModal("coa-modal");
};

window.saveAccount = async () => {
  const errEl = document.getElementById("coa-form-error");
  errEl.classList.add("hidden");
  const id      = document.getElementById("coa-edit-id").value;
  const code    = document.getElementById("coa-code").value.trim();
  const name    = document.getElementById("coa-name").value.trim();
  const type    = document.getElementById("coa-type").value;
  const parentCode = document.getElementById("coa-parent").value || null;
  const nodeType   = document.getElementById("coa-node-type").value;
  const normalBalance  = document.getElementById("coa-normal-balance").value;
  const openingBalance = parseFloat(document.getElementById("coa-opening").value) || 0;
  const description    = document.getElementById("coa-desc").value.trim();

  if (!code || !name) { errEl.textContent = "الكود والاسم مطلوبان"; errEl.classList.remove("hidden"); return; }
  if (!id) {
    const exists = _accounts.find(a => a.code === code);
    if (exists) { errEl.textContent = `الكود ${code} موجود (${exists.name})`; errEl.classList.remove("hidden"); return; }
  }

  const level = parentCode ? (parentCode.split("-").length) : 0;
  const data  = { code, name, type, parentCode, nodeType, normalBalance, openingBalance, description,
                  level, balance: openingBalance, totalDebit: 0, totalCredit: 0,
                  isActive: true, companyId: COMPANY_ID };

  const btn = document.getElementById("coa-save-btn");
  btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...`;
  try {
    if (id) { await update("chartOfAccounts", id, data); window.showToast?.("تم التحديث", "success"); }
    else    { await create(COLS.chartOfAccounts(), data); window.showToast?.("تمت الإضافة", "success"); }
    closeModal("coa-modal");
    await loadAccounts();
  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false; btn.innerHTML = `<i class="fas fa-save"></i> حفظ الحساب`;
  }
};

// ──────────────────────────────────────────
// Deactivate
// ──────────────────────────────────────────
window.toggleAccountActive = async (id, name, isInactive) => {
  const action = isInactive ? "تفعيل" : "تعطيل";
  if (!await window.showConfirm?.(`${action} الحساب "${name}"؟`, action)) return;
  if (!isInactive) {
    const acc      = _accounts.find(a => a.id === id);
    const children = _accounts.filter(a => a.parentCode === acc?.code && a.isActive !== false);
    if (children.length) { window.showToast?.("لا يمكن تعطيل حساب له حسابات فرعية نشطة","error"); return; }
  }
  try {
    await update("chartOfAccounts", id, { isActive: isInactive });
    window.showToast?.(`تم ${action} الحساب`, "success");
    await loadAccounts();
  } catch(err) { window.showToast?.(err.message,"error"); }
};

// ──────────────────────────────────────────
// Delete Account
// ──────────────────────────────────────────
window.deleteAccountConfirm = async (id, name) => {
  const acc      = _accounts.find(a => a.id === id); if (!acc) return;
  const children = _accounts.filter(a => a.parentCode === acc.code);
  if (children.length) {
    window.showToast?.(`لا يمكن حذف "${name}" لأن له ${children.length} حساب فرعي. يجب حذف الفروع أولاً.`, "error"); return;
  }
  if (!await window.showConfirm?.(
    `⚠️ سيتم حذف الحساب "${acc.code} — ${name}" نهائياً.\n\nتأكد أن لا توجد قيود مرتبطة به قبل الحذف.`,
    "حذف الحساب نهائياً"
  )) return;
  try {
    const { deleteDoc, doc: firestoreDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    await deleteDoc(firestoreDoc(db, `companies/${COMPANY_ID}/chartOfAccounts`, id));
    window.showToast?.(`✅ تم حذف الحساب "${name}" نهائياً`, "success");
    await loadAccounts();
  } catch(err) { window.showToast?.(err.message, "error"); }
};

// Called from modal footer delete button
window.deleteAccount = async () => {
  const id = document.getElementById("coa-edit-id").value;
  if (!id) return;
  const acc = _accounts.find(a => a.id === id); if (!acc) return;
  closeModal("coa-modal");
  await deleteAccountConfirm(id, acc.name);
};

// ──────────────────────────────────────────
// Ledger (كشف الحساب) — مع تصفية الفترات والطباعة المتقدمة
// ──────────────────────────────────────────
let _activeLedgerData = null;
let _activeLedgerContext = null;

window.setLedgerPeriod = (period) => {
  const fromEl = document.getElementById("ledger-from-date");
  const toEl = document.getElementById("ledger-to-date");
  if (!fromEl || !toEl) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  if (period === "thisMonth") {
    const y = now.getFullYear();
    const m = now.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    fromEl.value = `${y}-${pad(m + 1)}-01`;
    toEl.value = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
  } else if (period === "lastMonth") {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const y = prev.getFullYear();
    const m = prev.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    fromEl.value = `${y}-${pad(m + 1)}-01`;
    toEl.value = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
  } else if (period === "all") {
    fromEl.value = "";
    toEl.value = "";
  }
  window.renderLedgerTable();
};

window.resetLedgerPeriod = () => {
  const fromEl = document.getElementById("ledger-from-date");
  const toEl = document.getElementById("ledger-to-date");
  if (fromEl) fromEl.value = "";
  if (toEl) toEl.value = "";
  window.renderLedgerTable();
};

window.filterLedgerByDate = () => {
  window.renderLedgerTable();
};

window.renderLedgerTable = () => {
  if (!_activeLedgerContext) return;
  const { id, code, name, acc, allEntries } = _activeLedgerContext;
  const bodyEl = document.getElementById("ledger-body");
  const badgeEl = document.getElementById("ledger-period-badge");
  const footerInfoEl = document.getElementById("ledger-footer-info");

  const fromDate = document.getElementById("ledger-from-date")?.value || "";
  const toDate = document.getElementById("ledger-to-date")?.value || "";

  // Determine normal balance
  const isDebit = !(acc?.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(acc?.type));
  const baseOpeningBalance = parseFloat(acc?.openingBalance || 0) || 0;

  // 1. Separate entries prior to fromDate to compute Period Opening Balance
  let periodOpeningBalance = baseOpeningBalance;
  let periodEntries = [];

  allEntries.forEach(entry => {
    const entryDate = entry.date || "";
    const dr = entry._line.debit || 0;
    const cr = entry._line.credit || 0;

    if (fromDate && entryDate < fromDate) {
      // Prior to period -> accumulates into opening balance
      periodOpeningBalance += isDebit ? (dr - cr) : (cr - dr);
    } else if ((!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate)) {
      // Inside selected period
      periodEntries.push(entry);
    }
  });

  // Calculate period sums
  const totalDr = periodEntries.reduce((s, e) => s + (e._line.debit || 0), 0);
  const totalCr = periodEntries.reduce((s, e) => s + (e._line.credit || 0), 0);
  const periodNetDelta = isDebit ? (totalDr - totalCr) : (totalCr - totalDr);
  const finalBalance = periodOpeningBalance + periodNetDelta;

  // Update period badge
  if (badgeEl) {
    if (fromDate && toDate) {
      badgeEl.textContent = `الفترة: من ${fromDate} إلى ${toDate}`;
      badgeEl.style.background = "rgba(37,99,235,0.12)";
      badgeEl.style.color = "#1d4ed8";
    } else if (fromDate) {
      badgeEl.textContent = `من تاريخ: ${fromDate}`;
      badgeEl.style.background = "rgba(37,99,235,0.12)";
      badgeEl.style.color = "#1d4ed8";
    } else if (toDate) {
      badgeEl.textContent = `حتى تاريخ: ${toDate}`;
      badgeEl.style.background = "rgba(37,99,235,0.12)";
      badgeEl.style.color = "#1d4ed8";
    } else {
      badgeEl.textContent = `عرض كامل الحركات (من البداية)`;
      badgeEl.style.background = "rgba(37,99,235,0.08)";
      badgeEl.style.color = "var(--brand)";
    }
  }

  if (footerInfoEl) {
    footerInfoEl.textContent = `عدد حركات الفترة: ${periodEntries.length} من أصل ${allEntries.length} حركة مسجلة`;
  }

  // Save for print
  _activeLedgerData = {
    id, code, name, acc,
    relevant: periodEntries,
    allCount: allEntries.length,
    fromDate, toDate,
    openingBalance: periodOpeningBalance,
    baseOpeningBalance,
    running: finalBalance,
    totalDr, totalCr, isDebit
  };

  // Build rows
  const openingLabel = fromDate ? `🏁 رصيد بداية الفترة (حتى ${fromDate})` : `🏁 رصيد افتتاحي`;
  let rows = `<tr style="background:var(--bg-2); font-style:italic; font-weight:700;">
    <td colspan="3" style="padding:10px 14px;">${openingLabel}</td>
    <td class="mono" style="text-align:right;">—</td>
    <td class="mono" style="text-align:right;">—</td>
    <td class="mono" style="text-align:right; font-weight:800; color:var(--text-0);">
      ${formatCurrency(Math.abs(periodOpeningBalance))} 
      <span style="font-size:10px; font-weight:600; color:var(--text-2);">
        ${periodOpeningBalance >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")}
      </span>
    </td>
  </tr>`;

  let currentRun = periodOpeningBalance;
  periodEntries.forEach((e, i) => {
    const dr = e._line.debit || 0;
    const cr = e._line.credit || 0;
    currentRun += isDebit ? dr - cr : cr - dr;

    const lineNote = e._line?.note || e._line?.description || "";
    const headerDesc = e.description || e.notes || "";
    const displayNote = lineNote || headerDesc || "حركة قيود يومية";
    const entryNum = e.entryNumber || e.number || e.id || "—";

    rows += `<tr>
      <td class="mono" style="font-size:11px; color:var(--text-2); text-align:center;">${i + 1}</td>
      <td class="mono" style="font-size:11px; white-space:nowrap;">${e.date || ""}</td>
      <td>
        <div style="font-weight:700; color:var(--text-0); line-height:1.4;">${displayNote}</div>
        <div style="font-size:10.5px; color:var(--brand); font-family:monospace; margin-top:2px;">#${entryNum}</div>
      </td>
      <td class="mono" style="color:var(--bad); text-align:right; font-weight:700;">${dr ? formatCurrency(dr) : "—"}</td>
      <td class="mono" style="color:var(--good); text-align:right; font-weight:700;">${cr ? formatCurrency(cr) : "—"}</td>
      <td class="mono" style="text-align:right; font-weight:800; color:${currentRun >= 0 ? "var(--good)" : "var(--bad)"}">
        ${formatCurrency(Math.abs(currentRun))} <span style="font-size:10px;">${currentRun >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")}</span>
      </td>
    </tr>`;
  });

  if (!periodEntries.length) {
    rows += `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>`;
  }

  const kpiOpeningTitle = fromDate ? "رصيد بداية الفترة" : "الرصيد الافتتاحي";
  const kpiClosingTitle = toDate ? "رصيد نهاية الفترة" : "الرصيد الختامي الصافي";

  bodyEl.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px;">
      <div class="coa-kpi">
        <div class="coa-kpi-label">${kpiOpeningTitle}</div>
        <div class="coa-kpi-value" style="color:var(--text-1);">${formatCurrency(Math.abs(periodOpeningBalance))} <span style="font-size:11px; font-weight:normal;">${periodOpeningBalance >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")}</span></div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">حركات الفترة المدينة (+)</div>
        <div class="coa-kpi-value" style="color:var(--bad);">${formatCurrency(totalDr)}</div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">حركات الفترة الدائنة (-)</div>
        <div class="coa-kpi-value" style="color:var(--good);">${formatCurrency(totalCr)}</div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">${kpiClosingTitle}</div>
        <div class="coa-kpi-value" style="color:var(--brand);">${formatCurrency(Math.abs(finalBalance))} <span style="font-size:11px;">${finalBalance >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")}</span></div>
      </div>
    </div>
    <div style="overflow-x:auto;">
      <table class="ledger-table" style="width:100%;">
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th style="width:95px;">التاريخ</th>
            <th>البيان والتفاصيل المحاسبية</th>
            <th style="width:110px; text-align:right; color:var(--bad);">مدين (+)</th>
            <th style="width:110px; text-align:right; color:var(--good);">دائن (-)</th>
            <th style="width:130px; text-align:right;">الرصيد الجاري</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
};

window.openLedger = async (id, code, name) => {
  document.getElementById("ledger-title").textContent = `كشف حساب: ${code} — ${name}`;
  const bodyEl = document.getElementById("ledger-body");
  bodyEl.innerHTML = `<div class="coa-loading"><i class="fas fa-spinner fa-spin"></i> جاري استرجاع قيود اليومية وحركات الحساب...</div>`;
  
  // Clear period filters by default on fresh open
  const fromEl = document.getElementById("ledger-from-date");
  const toEl = document.getElementById("ledger-to-date");
  if (fromEl) fromEl.value = "";
  if (toEl) toEl.value = "";

  const isEmployeeAccount = code.startsWith("2-1-5") || code.startsWith("1-1-5-4") || name.includes("مندوب") || name.includes("موظف") || name.includes("سلف") || name.includes("مستحقات");
  const payslipBtn = document.getElementById("ledger-payslip-btn");
  if (payslipBtn) {
    payslipBtn.style.display = isEmployeeAccount ? "inline-flex" : "none";
  }

  openModal("coa-ledger-modal");

  try {
    const q = query(COLS.journalEntries(), orderBy("date"));
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const relevant = [];
    entries.forEach(entry => {
      (entry.lines || []).forEach(line => {
        if (line.accountCode === code || line.accountId === id)
          relevant.push({ ...entry, _line: line });
      });
    });

    // Ensure strict chronological order
    relevant.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const acc = _accounts.find(a => a.id === id);
    _activeLedgerContext = { id, code, name, acc, allEntries: relevant };

    window.renderLedgerTable();
  } catch (err) {
    console.error("Error opening ledger:", err);
    bodyEl.innerHTML = `<div class="coa-loading" style="color:var(--bad)">حدث خطأ أثناء تحميل كشف الحساب: ${err.message}</div>`;
  }
};

let _coaEmployees = [];

window.printAccountPayslip = async () => {
  if (!_activeLedgerContext) return;
  const { name, code } = _activeLedgerContext;
  try {
    if (!_coaEmployees || !_coaEmployees.length) {
      const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const empSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/employees`));
      _coaEmployees = empSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    const norm = (str) => (str || "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase().trim();
    const cleanAccName = norm(name);

    let matched = _coaEmployees.find(e => {
      const eName = norm(e.name);
      return cleanAccName.includes(eName) || eName.includes(cleanAccName) || (e.code && code.includes(e.code));
    });

    if (!matched) {
      const tokens = cleanAccName.split(/\s+/).filter(t => t.length >= 3 && !["سلف", "سلفة", "المندوب", "الموظف", "مستحقات", "حساب"].includes(t));
      matched = _coaEmployees.find(e => {
        const eName = norm(e.name);
        return tokens.some(t => eName.includes(t));
      });
    }

    const empIdToUse = matched ? matched.id : (_coaEmployees[0]?.id || "");
    window.openCoaPayslipModal(empIdToUse);
  } catch (err) {
    console.error("Error opening payslip from ledger:", err);
    window.showToast?.("حدث خطأ أثناء فتح قسيمة الموظف: " + err.message, "error");
  }
};

window.openCoaPayslipModal = (empId) => {
  const emp = _coaEmployees.find(e => e.id === empId) || _coaEmployees[0] || { name: "موظف", salary: 0, allowance: 0 };
  const advanceBalance = Math.abs(_activeLedgerData?.running || 0);
  const curMonth = _activeLedgerData?.fromDate?.slice(0, 7) || todayString().slice(0, 7);
  const basic = emp.salary || 0;
  const allowance = emp.allowance || 0;
  const empGosi = emp.nationality === "saudi" ? ((basic + allowance) * 0.0975) : 0;
  const repay = advanceBalance;
  const bonus = 0;
  const overtime = 0;
  const deduct = 0;
  const gross = basic + allowance + bonus + overtime;
  const totalDeduct = repay + deduct + empGosi;
  const net = Math.max(0, gross - totalDeduct);

  const oldOverlay = document.getElementById("coa-payslip-overlay");
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "coa-payslip-overlay";
  overlay.style.cssText = "z-index: 2100; display:flex; align-items:center; justify-content:center; background:rgba(15,23,42,0.65); backdrop-filter:blur(4px);";

  const empOptions = _coaEmployees.map(e => `
    <option value="${e.id}" ${e.id === emp.id ? "selected" : ""}>${e.name} (${e.job || "موظف"}) - راتب: ${formatCurrency(e.salary || 0)}</option>
  `).join("");

  overlay.innerHTML = `
    <div class="modal" style="max-width:760px; width:95%; background:#ffffff; border-radius:18px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); overflow:hidden; display:flex; flex-direction:column; max-height:92vh;">
      <div style="background:linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color:#ffffff; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #f59e0b;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:24px; background:rgba(255,255,255,0.15); width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center;">📑</div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#ffffff;">إعداد وقسيمة استلام راتب وتصفية السلف</h3>
            <p style="margin:2px 0 0; font-size:11.5px; color:#bfdbfe;">تسوية مستحقات الموظف وإقفال رصيد السلف وإصدار سند رسمي بالتوقيع</p>
          </div>
        </div>
        <button style="background:none; border:none; color:#ffffff; font-size:24px; cursor:pointer; padding:4px 8px; line-height:1;" onclick="document.getElementById('coa-payslip-overlay').remove()">×</button>
      </div>

      <div style="padding:20px 24px; overflow-y:auto; flex:1;">
        <!-- Employee & Period Selector Header -->
        <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:14px; padding:14px 18px; margin-bottom:16px; display:grid; grid-template-columns: 1.6fr 1fr 1fr; gap:12px; align-items:center;">
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">👤 اختيار الموظف المستحق:</label>
            <select id="cp-emp-select" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:700; color:#0f172a;" onchange="window.onCoaPayslipEmpChange()">
              ${empOptions}
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">📅 شهر الاستحقاق:</label>
            <input type="month" id="cp-month" value="${curMonth}" style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:700;" onchange="window.calcCoaPayslipNet()">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">🗓️ تاريخ الصرف:</label>
            <input type="date" id="cp-date" value="${todayString()}" style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:700;">
          </div>
        </div>

        <!-- Employee Info Quick Badge -->
        <div id="cp-emp-info-badge" style="background:#eff6ff; border:1px solid #bfdbfe; border-right:4px solid #2563eb; border-radius:10px; padding:10px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <div><strong>المسمى الوظيفي:</strong> <span id="cp-info-job" style="color:#1d4ed8; font-weight:700;">${emp.job || "مندوب مبيعات"}</span></div>
          <div><strong>رقم الموظف:</strong> <span id="cp-info-code" class="mono" style="font-weight:700;">${emp.code || emp.id?.slice(-5) || "EMP"}</span></div>
          <div><strong>الهوية / الإقامة:</strong> <span id="cp-info-nid" class="mono">${emp.nid || "—"}</span></div>
          <div><strong>الجنسية:</strong> <span id="cp-info-nat">${emp.nationality === "saudi" ? "سعودي" : "مقيم"}</span></div>
        </div>

        <!-- 2 Columns: Earnings & Deductions -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
          <!-- Column 1: Earnings -->
          <div style="background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:12px; padding:14px 16px;">
            <div style="font-size:13px; font-weight:800; color:#166534; margin-bottom:12px; display:flex; justify-content:space-between;">
              <span>➕ الاستحقاقات والمكافآت (Earnings)</span>
            </div>
            
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">الراتب الأساسي (ر.س):</label>
              <input type="number" id="cp-basic" value="${basic}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">البدلات الشهرية (سكن / مواصلات) (ر.س):</label>
              <input type="number" id="cp-allowance" value="${allowance}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">مكافآت وحوافز تشجيعية (ر.س):</label>
              <input type="number" id="cp-bonus" value="${bonus}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">بيان سبب المكافأة / الحافز:</label>
              <input type="text" id="cp-bonus-desc" value="حافز تارغت المبيعات" placeholder="مثال: مكافأة مبيعات شهرية" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-size:11.5px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">أجر ساعات إضافية (Overtime) (ر.س):</label>
              <input type="number" id="cp-overtime" value="${overtime}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
          </div>

          <!-- Column 2: Deductions -->
          <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:14px 16px;">
            <div style="font-size:13px; font-weight:800; color:#991b1b; margin-bottom:12px; display:flex; justify-content:space-between;">
              <span>➖ الاستقطاعات وتسوية السلف (Deductions)</span>
            </div>

            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">خصم وإقفال سلفة الموظف (ر.س):</label>
              <input type="number" id="cp-repay" value="${repay}" step="0.01" style="width:100%; padding:7px 10px; border:1.5px solid #f87171; border-radius:8px; font-family:monospace; font-weight:800; color:#b91c1c; background:#fff;" oninput="window.calcCoaPayslipNet()">
              <div style="font-size:10.5px; color:#b91c1c; margin-top:3px; font-weight:600;">💡 الرصيد المفتوح الحالي للسلفة في كشف الحساب: <strong>${formatCurrency(advanceBalance)}</strong></div>
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">خصومات وجزاءات أخرى (ر.س):</label>
              <input type="number" id="cp-deduct" value="${deduct}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #fca5a5; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">التأمينات الاجتماعية (GOSI) (ر.س):</label>
              <input type="number" id="cp-gosi" value="${empGosi.toFixed(2)}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #fca5a5; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
          </div>
        </div>

        <!-- Net Payable & Live Calculation Ribbon -->
        <div style="background:linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%); border-radius:14px; padding:16px 20px; color:#ffffff; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; box-shadow:0 4px 14px rgba(4,120,87,0.25);">
          <div>
            <div style="font-size:14px; font-weight:800;">💰 صافي الراتب المستحق للصرف والتوقيع:</div>
            <div style="font-size:11px; opacity:0.85;">المبلغ الفعلي الصافي بعد تسوية كافة الاستحقاقات والسلف القائمة</div>
          </div>
          <div style="text-align:left;">
            <span id="cp-net-disp" style="font-size:26px; font-weight:900; font-family:monospace; letter-spacing:0.5px;">${formatCurrency(net)}</span>
            <span style="font-size:13px; font-weight:700; margin-right:4px;">ريال سعودي</span>
          </div>
        </div>

        <!-- Live Tafqeet Box -->
        <div id="cp-tafqeet-preview" style="background:#f0fdf4; border:1px dashed #86efac; border-radius:10px; padding:10px 16px; font-size:12px; color:#166534; font-weight:700; margin-bottom:8px;">
          ✍️ المبلغ كتابةً وتفقيطاً: <span style="font-weight:800; color:#047857;">فقط ${tafqeetArabic(net)} لا غير.</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:14px 24px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('coa-payslip-overlay').remove()">إلغاء وإغلاق</button>
        <button class="btn btn-primary" style="background:#2563eb; padding:10px 24px; font-size:13px; font-weight:800; border-radius:10px; display:flex; align-items:center; gap:8px;" onclick="window.submitCoaPayslipPrint()">
          <i class="fas fa-print"></i> 🖨️ طباعة قسيمة الراتب وسند الصرف الرسمي
        </button>
      </div>
    </div>
  `;

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  window.calcCoaPayslipNet();
};

window.onCoaPayslipEmpChange = () => {
  const sel = document.getElementById("cp-emp-select");
  if (!sel) return;
  const emp = _coaEmployees.find(e => e.id === sel.value);
  if (!emp) return;

  const basic = emp.salary || 0;
  const allowance = emp.allowance || 0;
  const gosi = emp.nationality === "saudi" ? ((basic + allowance) * 0.0975) : 0;

  const basicEl = document.getElementById("cp-basic");
  if (basicEl) basicEl.value = basic;
  const allowEl = document.getElementById("cp-allowance");
  if (allowEl) allowEl.value = allowance;
  const gosiEl = document.getElementById("cp-gosi");
  if (gosiEl) gosiEl.value = gosi.toFixed(2);

  const jobEl = document.getElementById("cp-info-job");
  if (jobEl) jobEl.textContent = emp.job || "موظف / مندوب";
  const codeEl = document.getElementById("cp-info-code");
  if (codeEl) codeEl.textContent = emp.code || emp.id?.slice(-5) || "EMP";
  const nidEl = document.getElementById("cp-info-nid");
  if (nidEl) nidEl.textContent = emp.nid || "—";
  const natEl = document.getElementById("cp-info-nat");
  if (natEl) natEl.textContent = emp.nationality === "saudi" ? "سعودي" : "مقيم";

  window.calcCoaPayslipNet();
};

window.calcCoaPayslipNet = () => {
  const basic = parseFloat(document.getElementById("cp-basic")?.value) || 0;
  const allowance = parseFloat(document.getElementById("cp-allowance")?.value) || 0;
  const bonus = parseFloat(document.getElementById("cp-bonus")?.value) || 0;
  const overtime = parseFloat(document.getElementById("cp-overtime")?.value) || 0;
  const repay = parseFloat(document.getElementById("cp-repay")?.value) || 0;
  const deduct = parseFloat(document.getElementById("cp-deduct")?.value) || 0;
  const gosi = parseFloat(document.getElementById("cp-gosi")?.value) || 0;

  const gross = basic + allowance + bonus + overtime;
  const totalDeduct = repay + deduct + gosi;
  const net = Math.max(0, gross - totalDeduct);

  const netEl = document.getElementById("cp-net-disp");
  if (netEl) netEl.textContent = formatCurrency(net);

  const tafqeetEl = document.getElementById("cp-tafqeet-preview");
  if (tafqeetEl) {
    tafqeetEl.innerHTML = `✍️ <strong>المبلغ كتابةً وتفقيطاً:</strong> <span style="font-weight:800; color:#047857;">فقط ${tafqeetArabic(net)} لا غير.</span>`;
  }
};

window.submitCoaPayslipPrint = async () => {
  const sel = document.getElementById("cp-emp-select");
  const emp = _coaEmployees.find(e => e.id === sel.value) || { name: "الموظف المستحق", job: "مندوب" };

  const month = document.getElementById("cp-month")?.value || todayString().slice(0, 7);
  const payDate = document.getElementById("cp-date")?.value || todayString();
  const basic = parseFloat(document.getElementById("cp-basic")?.value) || 0;
  const allowance = parseFloat(document.getElementById("cp-allowance")?.value) || 0;
  const bonus = parseFloat(document.getElementById("cp-bonus")?.value) || 0;
  const bonusDesc = (document.getElementById("cp-bonus-desc")?.value || "مكافآت وحوافز تشجيعية").trim();
  const overtime = parseFloat(document.getElementById("cp-overtime")?.value) || 0;
  const repay = parseFloat(document.getElementById("cp-repay")?.value) || 0;
  const deduct = parseFloat(document.getElementById("cp-deduct")?.value) || 0;
  const gosi = parseFloat(document.getElementById("cp-gosi")?.value) || 0;

  const totalGross = basic + allowance + bonus + overtime;
  const totalDeduct = repay + deduct + gosi;
  const finalNet = Math.max(0, totalGross - totalDeduct);
  const amountWords = tafqeetArabic(finalNet);

  let company = {
    name: "شركة نظم الإمداد المتطورة",
    nameEn: "Modern Supply Systems Co.",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    phone: "0549141648",
    logoUrl: ""
  };
  try {
    const cached = localStorage.getItem("idham_company");
    if (cached) Object.assign(company, JSON.parse(cached));
  } catch(e) {}

  const voucherNumber = `SAL-${emp.code || emp.id?.slice(-4) || 'EMP'}-${month.replace(/[^0-9]/g,'')}`;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند صرف واستلام راتب — ${emp.name} — ${month}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 6mm 8mm; }
      .no-print { display: none !important; }
    }
    .sal-container {
      max-width: 860px;
      margin: 0 auto;
      border: 1.5px solid #cbd5e1;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .sal-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%) !important;
      padding: 16px 22px;
      color: #fff !important;
    }
    .sal-header-gold {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b) !important;
    }
    .sal-badge-box {
      background: rgba(255,255,255,0.18) !important;
      border: 1px solid rgba(255,255,255,0.35) !important;
      border-radius: 12px;
      padding: 8px 18px;
      text-align: center;
    }
    .sal-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 18px;
    }
    .sal-meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      text-align: center;
    }
    .sal-meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .sal-meta-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }
    .sal-emp-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-right: 5px solid #2563eb;
      border-radius: 10px;
      margin: 12px 18px;
      padding: 10px 16px;
    }
    .sal-emp-grid {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr;
      gap: 10px;
    }
    .sal-emp-item-lbl { font-size: 10px; color: #1e40af; font-weight: 700; margin-bottom: 2px; }
    .sal-emp-item-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }
    .sal-breakdown-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 0 18px 12px 18px;
    }
    .sal-panel {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .sal-panel.earnings { border-color: #a7f3d0; background: #fff; }
    .sal-panel.deductions { border-color: #fecaca; background: #fff; }
    .sal-panel-head {
      padding: 6px 12px;
      font-weight: 800;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sal-panel.earnings .sal-panel-head { background: #d1fae5; color: #065f46; }
    .sal-panel.deductions .sal-panel-head { background: #fee2e2; color: #991b1b; }
    .sal-items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .sal-items-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .sal-items-table tr:last-child td { border-bottom: none; }
    .sal-panel-foot {
      padding: 6px 12px;
      font-weight: 800;
      font-size: 11.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
    }
    .sal-panel.earnings .sal-panel-foot { background: #ecfdf5; color: #047857; }
    .sal-panel.deductions .sal-panel-foot { background: #fef2f2; color: #b91c1c; }
    .sal-net-ribbon {
      margin: 0 18px 10px 18px;
      background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
      border-radius: 10px;
      padding: 12px 18px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(4,120,87,0.2);
    }
    .sal-net-val {
      font-size: 22px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .sal-tafqeet-box {
      margin: 0 18px 10px 18px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 11px;
    }
    .sal-legal-box {
      margin: 0 18px 12px 18px;
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-right: 5px solid #f59e0b;
      border-radius: 8px;
      padding: 9px 14px;
      font-size: 10.5px;
      line-height: 1.5;
      color: #92400e;
    }
    .sal-sigs {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 10px;
      margin: 0 18px 14px 18px;
    }
    .sal-sig-box {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .sal-sig-title { font-size: 10.5px; font-weight: 800; color: #334155; margin-bottom: 26px; }
    .sal-sig-line { border-top: 1px dashed #94a3b8; padding-top: 5px; font-size: 9.5px; color: #64748b; }
    .sal-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 6px 18px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="sal-container">
    <div class="sal-header">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${company.logoUrl ? `<img src="${company.logoUrl}" alt="Logo" style="height:52px;max-width:100px;object-fit:contain;background:#fff;padding:2px;border-radius:6px;" />` : `<div style="font-size:28px;">🏢</div>`}
          <div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${company.name}</div>
            <div style="font-size:10.5px;opacity:0.85;font-weight:600;color:#fff;">${company.nameEn}</div>
            <div style="font-size:9.5px;opacity:0.8;margin-top:2px;color:#fff;">
              <span>الهاتف: <strong>${company.phone}</strong></span> |
              <span>الرقم الضريبي: <strong>${company.vatNumber}</strong></span> |
              <span>سجل تجاري: <strong>${company.crNumber}</strong></span>
            </div>
          </div>
        </div>
        <div class="sal-badge-box">
          <div style="font-size:16px;font-weight:900;color:#fff !important;">سند صرف واستلام راتب</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">SALARY PAYMENT & PAYSLIP VOUCHER</div>
        </div>
      </div>
    </div>
    <div class="sal-header-gold"></div>

    <div class="sal-meta-grid">
      <div class="sal-meta-card"><div class="sal-meta-label">رقم السند</div><div class="sal-meta-val mono" style="color:#047857;">${voucherNumber}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">تاريخ الصرف</div><div class="sal-meta-val mono">${payDate}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">شهر الاستحقاق</div><div class="sal-meta-val" style="color:#1d4ed8;">شهر ${month}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">طريقة الصرف</div><div class="sal-meta-val" style="font-size:11px;">نقدي / تحويل بنكي</div></div>
    </div>

    <div class="sal-emp-box">
      <div class="sal-emp-grid">
        <div><div class="sal-emp-item-lbl">👤 اسم الموظف المستحق</div><div class="sal-emp-item-val" style="font-size:13.5px;color:#1e3a8a;">${emp.name}</div></div>
        <div><div class="sal-emp-item-lbl">💼 المسمى الوظيفي</div><div class="sal-emp-item-val">${emp.job || "موظف / مندوب"}</div></div>
        <div><div class="sal-emp-item-lbl">🆔 رقم الهوية / الإقامة</div><div class="sal-emp-item-val mono">${emp.nid || "—"}</div></div>
        <div><div class="sal-emp-item-lbl">💳 الآيبان / الحساب</div><div class="sal-emp-item-val mono" style="font-size:10.5px;">${emp.iban || "—"}</div></div>
      </div>
    </div>

    <div class="sal-breakdown-section">
      <div class="sal-panel earnings">
        <div class="sal-panel-head"><span>➕ مفردات الاستحقاقات والمكافآت</span><span style="font-size:10px;">(Earnings)</span></div>
        <table class="sal-items-table">
          <tbody>
            <tr><td><strong>الراتب الأساسي</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(basic)} ر.س</td></tr>
            <tr><td><strong>البدلات الشهرية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(allowance)} ر.س</td></tr>
            ${overtime ? `<tr><td><strong>أجر ساعات إضافية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(overtime)} ر.س</td></tr>` : ''}
            ${bonus ? `<tr><td><strong>${bonusDesc || "مكافآت وحوافز تشجيعية"}</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(bonus)} ر.س</td></tr>` : ''}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستحقاقات:</span><span class="mono font-bold">${formatCurrency(totalGross)} ر.س</span></div>
      </div>

      <div class="sal-panel deductions">
        <div class="sal-panel-head"><span>➖ مفردات الاستقطاعات والسلف</span><span style="font-size:10px;">(Deductions)</span></div>
        <table class="sal-items-table">
          <tbody>
            ${deduct ? `<tr><td><strong>خصومات وغياب</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(deduct)} ر.س</td></tr>` : ''}
            ${gosi ? `<tr><td><strong>تأمينات اجتماعية (GOSI)</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(gosi)} ر.س</td></tr>` : ''}
            ${repay ? `<tr><td><strong>إقفال وتسوية سلفة الموظف</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(repay)} ر.س</td></tr>` : ''}
            ${totalDeduct === 0 ? `<tr><td style="color:#94a3b8;text-align:center;padding:12px;">لا توجد أي استقطاعات</td></tr>` : ''}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستقطاعات:</span><span class="mono font-bold">${formatCurrency(totalDeduct)} ر.س</span></div>
      </div>
    </div>

    <div class="sal-net-ribbon">
      <div><div style="font-size:11.5px;opacity:0.9;font-weight:700;">💰 صافي الراتب المنصرف للموظف</div><div style="font-size:9.5px;opacity:0.8;">Net Salary Payable</div></div>
      <div style="text-align:left;"><span class="sal-net-val">${formatCurrency(finalNet)}</span> <span style="font-size:13px;font-weight:700;margin-right:4px;">ريال سعودي</span></div>
    </div>

    <div class="sal-tafqeet-box">
      <strong>✍️ المبلغ كتابةً وتفقيطاً:</strong> <span style="color:#047857;font-weight:800;">فقط ${amountWords} لا غير.</span>
    </div>

    <div class="sal-legal-box">
      <strong>📝 إقرار واستلام الموظف وبراءة ذمة:</strong>
      <p style="margin-top:2px;">
        أقر أنا الموظف الموضحة بياناتي أعلاه بأنني استلمت كامل صافي راتبي ومستحقاتي ومكافآتي عن شهر (<strong>${month}</strong>) الموضحة في هذا السند، ولا يحق لي المطالبة بأي مبالغ أخرى أو متأخرات عن هذه الفترة لدى الشركة، ويعد توقيعي أدناه إقراراً نهائياً بالاستلام وبراءة ذمة شاملة.
      </p>
    </div>

    <div class="sal-sigs">
      <div class="sal-sig-box">
        <div class="sal-sig-title">توقيع الموظف المستلم (المقر بالاستلام)</div>
        <div class="sal-sig-line">الاسم: ${emp.name}</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">إعداد ومراجعة قسم المحاسبة والرواتب</div>
        <div class="sal-sig-line">المحاسب المالي</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">اعتماد الإدارة والمدير العام</div>
        <div class="sal-sig-line">المدير العام / المفوض</div>
      </div>
    </div>

    <div class="sal-footer">
      <div>نظام إدهام المتكامل لإدارة الموارد — IDHAM ERP v4.0</div>
      <div>تمت الطباعة آلياً بتاريخ: ${payDate}</div>
    </div>
  </div>
</body>
</html>
  `;

  const w = window.open("", "_blank");
  if (!w) {
    window.showToast?.("يرجى السماح بالنوافذ المنبثقة لطباعة قسيمة الراتب", "warning");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch(e) {}
  }, 450);
};

window.printAccountStatement = async () => {
  if (!_activeLedgerData) {
    window.showToast?.("لا توجد بيانات كشف حساب للطباعة", "error");
    return;
  }

  const { code, name, acc, relevant, fromDate, toDate, openingBalance, totalDr, totalCr, isDebit } = _activeLedgerData;

  // Load company and logo settings
  let company = {
    name: "شركة نظم الإمداد المتطورة",
    nameEn: "Modern Supply Systems Co.",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
    logoUrl: ""
  };

  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/company`)),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/logo`))
    ]);
    if (coSnap.exists()) {
      const cd = coSnap.data();
      company.name = cd.name || cd.companyName || company.name;
      company.nameEn = cd.nameEn || cd.legalName || company.nameEn;
      company.crNumber = cd.crNumber || cd.cr || company.crNumber;
      company.vatNumber = cd.vatNumber || cd.vat || company.vatNumber;
      company.phone = cd.phone || company.phone;
      company.email = cd.email || company.email;
      company.address = cd.address ? (cd.city ? `${cd.address} — ${cd.city}` : cd.address) : company.address;
    }
    if (logoSnap.exists()) company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
  } catch (_) {}

  const printTime = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const printClock = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  let running = openingBalance;
  let rowsHtml = `
    <tr style="background:#f8fafc; font-style:italic; font-weight:bold;">
      <td colspan="3" style="padding:8px 12px;">🏁 ${fromDate ? `رصيد بداية الفترة (حتى ${fromDate})` : "رصيد افتتاحي"}</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right; font-weight:800;">${formatCurrency(Math.abs(openingBalance))} ر.س <span style="font-size:10px; color:#64748b;">(${openingBalance >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")})</span></td>
    </tr>
  `;

  relevant.forEach((e, i) => {
    const dr = e._line.debit || 0;
    const cr = e._line.credit || 0;
    running += isDebit ? dr - cr : cr - dr;

    const lineNote = e._line?.note || e._line?.description || "";
    const headerDesc = e.description || e.notes || "";
    const displayNote = lineNote || headerDesc || "حركة قيد يومية";
    const entryNum = e.entryNumber || e.number || e.id || "—";

    rowsHtml += `
      <tr>
        <td style="text-align:center; font-family:monospace; color:#64748b;">${i + 1}</td>
        <td style="font-family:monospace; white-space:nowrap;">${e.date || "—"}</td>
        <td>
          <div style="font-weight:700; color:#0f172a;">${displayNote}</div>
          <div style="font-size:10px; color:#4338ca; font-family:monospace; margin-top:2px;">مرجع: #${entryNum}</div>
        </td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#dc2626;">${dr ? formatCurrency(dr) + " ر.س" : "—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#16a34a;">${cr ? formatCurrency(cr) + " ر.س" : "—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:800; color:${running >= 0 ? "#16a34a" : "#dc2626"};">
          ${formatCurrency(Math.abs(running))} ر.س <span style="font-size:10px; color:#64748b;">(${running >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين")})</span>
        </td>
      </tr>
    `;
  });

  if (!relevant.length) {
    rowsHtml += `<tr><td colspan="6" style="text-align:center; padding:24px; color:#64748b; font-weight:600;">لا توجد أي حركات مالية مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>`;
  }

  const finalBalanceLabel = running >= 0 ? (isDebit ? "مدين" : "دائن") : (isDebit ? "دائن" : "مدين");

  const printableHTML = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب — ${code} — ${name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#0f172a; background:#fff; padding:24px; font-size:12px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    
    /* ══ HEADER BANNER ══ */
    .company-header {
      display:flex; justify-content:space-between; align-items:center;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
      color:#fff; padding:20px 24px; border-radius:12px; margin-bottom:20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .company-info h1 { font-size:22px; font-weight:900; margin-bottom:4px; letter-spacing:-0.5px; }
    .company-info .sub { font-size:12px; opacity:0.9; margin-bottom:8px; }
    .company-meta { font-size:11px; opacity:0.95; display:flex; flex-wrap:wrap; gap:16px; margin-top:6px; }
    .company-meta span { display:inline-flex; align-items:center; gap:4px; }
    .company-logo {
      width:80px; height:80px; background:#fff; border-radius:10px; padding:4px;
      display:flex; align-items:center; justify-content:center; overflow:hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .company-logo img { max-width:100%; max-height:100%; object-fit:contain; }
    .company-logo-fallback { font-size:32px; }

    /* ══ REPORT TITLE & METADATA ══ */
    .report-badge-strip {
      display:flex; justify-content:space-between; align-items:center;
      background:#f1f5f9; border:1px solid #cbd5e1; border-radius:10px;
      padding:12px 18px; margin-bottom:16px;
    }
    .report-title-box h2 { font-size:16px; font-weight:800; color:#1e3a8a; }
    .report-title-box .code { font-family:monospace; font-size:13px; color:#475569; font-weight:700; }
    .report-date-box { font-size:11px; color:#64748b; text-align:left; line-height:1.6; }

    /* ══ KPI CARDS ══ */
    .kpi-grid {
      display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px;
    }
    .kpi-card {
      background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px;
      text-align:center;
    }
    .kpi-card.opening { border-top:3px solid #64748b; }
    .kpi-card.debit { border-top:3px solid #dc2626; }
    .kpi-card.credit { border-top:3px solid #16a34a; }
    .kpi-card.final { border-top:3px solid #2563eb; background:#eff6ff; }
    .kpi-card .lbl { font-size:10.5px; color:#64748b; font-weight:600; margin-bottom:4px; }
    .kpi-card .val { font-size:15px; font-weight:900; font-family:monospace; }
    .kpi-card.debit .val { color:#dc2626; }
    .kpi-card.credit .val { color:#16a34a; }
    .kpi-card.final .val { color:#1e40af; }

    /* ══ TABLE ══ */
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    th {
      background:#1e3a8a; color:#fff; padding:9px 10px; font-size:11.5px;
      font-weight:700; text-align:right; border:1px solid #1e3a8a;
    }
    td {
      padding:8px 10px; border:1px solid #e2e8f0; font-size:11.5px;
      vertical-align:middle;
    }
    tr:nth-child(even) td { background:#f8fafc; }

    /* ══ SIGNATURES & FOOTER ══ */
    .signatures-block {
      display:grid; grid-template-columns:repeat(3,1fr); gap:20px;
      margin-top:36px; padding-top:16px; border-top:2px solid #e2e8f0;
      page-break-inside:avoid;
    }
    .sig-box {
      text-align:center; padding:12px; border:1px dashed #cbd5e1; border-radius:8px;
      background:#fafafa;
    }
    .sig-title { font-size:11px; font-weight:700; color:#475569; margin-bottom:40px; }
    .sig-line { border-bottom:1px solid #94a3b8; width:70%; margin:0 auto; }

    .print-footer {
      margin-top:24px; text-align:center; font-size:10px; color:#94a3b8;
      border-top:1px solid #f1f5f9; padding-top:8px;
    }

    @media print {
      body { padding:10px; }
      .company-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      th { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background:#1e3a8a !important; color:#fff !important; }
      tr:nth-child(even) td { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background:#f8fafc !important; }
      .kpi-card { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="company-header">
    <div class="company-info">
      <h1>${company.name || "إدهام للمواد الغذائية"}</h1>
      <div class="sub">${company.nameEn || "Idham Foodstuff Trading Co."}</div>
      <div class="company-meta">
        ${company.crNumber ? `<span>📋 س.ت: <strong>${company.crNumber}</strong></span>` : ""}
        ${company.vatNumber ? `<span>🧾 الرقم الضريبي: <strong>${company.vatNumber}</strong></span>` : ""}
        ${company.phone ? `<span>📞 الهاتف: <strong>${company.phone}</strong></span>` : ""}
        ${company.address ? `<span>📍 ${company.address}</span>` : ""}
      </div>
    </div>
    <div class="company-logo">
      ${company.logoUrl ? `<img src="${company.logoUrl}" alt="Logo">` : `<div class="company-logo-fallback">🏢</div>`}
    </div>
  </div>

  <!-- Statement Details Strip -->
  <div class="report-badge-strip">
    <div class="report-title-box">
      <h2>كشف حساب تفصيلي: ${name}</h2>
      <div class="code">كود الحساب: ${code} | تصنيف الحساب: ${acc?.typeAr || acc?.type || "حساب مالي"}</div>
      ${(fromDate || toDate) ? `
      <div style="margin-top:6px; font-size:12px; font-weight:800; color:#1e40af; background:#e0e7ff; display:inline-block; padding:4px 12px; border-radius:6px; border:1px solid #bfdbfe;">
        📅 الفترة المالية المحددة: من <strong>${fromDate || "بداية النشاط"}</strong> إلى <strong>${toDate || "تاريخ اليوم"}</strong>
      </div>` : `<div style="margin-top:4px; font-size:11px; color:#64748b;">(كامل الحركات التاريخية منذ التأسيس)</div>`}
    </div>
    <div class="report-date-box">
      <div><strong>تاريخ الإصدار:</strong> ${printTime}</div>
      <div><strong>الوقت:</strong> ${printClock}</div>
    </div>
  </div>

  <!-- KPI Summary Cards -->
  <div class="kpi-grid">
    <div class="kpi-card opening">
      <div class="lbl">${fromDate ? "رصيد بداية الفترة" : "الرصيد الافتتاحي"}</div>
      <div class="val">${formatCurrency(Math.abs(openingBalance))} ر.س</div>
    </div>
    <div class="kpi-card debit">
      <div class="lbl">إجمالي حركات الفترة المدينة (+)</div>
      <div class="val">${formatCurrency(totalDr)} ر.س</div>
    </div>
    <div class="kpi-card credit">
      <div class="lbl">إجمالي حركات الفترة الدائنة (-)</div>
      <div class="val">${formatCurrency(totalCr)} ر.س</div>
    </div>
    <div class="kpi-card final">
      <div class="lbl">${toDate ? "رصيد نهاية الفترة الصافي" : "الرصيد الختامي الصافي"}</div>
      <div class="val">${formatCurrency(Math.abs(running))} ر.س (${finalBalanceLabel})</div>
    </div>
  </div>

  <!-- Transactions Table -->
  <table>
    <thead>
      <tr>
        <th style="width:35px; text-align:center;">#</th>
        <th style="width:90px; text-align:center;">التاريخ</th>
        <th>البيان والتفاصيل المحاسبية</th>
        <th style="width:115px; text-align:center;">مدين (+)</th>
        <th style="width:115px; text-align:center;">دائن (-)</th>
        <th style="width:140px; text-align:center;">الرصيد الجاري</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <!-- Signatures Block -->
  <div class="signatures-block">
    <div class="sig-box">
      <div class="sig-title">إعداد المحاسب المسؤول</div>
      <div class="sig-line"></div>
    </div>
    <div class="sig-box">
      <div class="sig-title">المراجعة والتدقيق المالي</div>
      <div class="sig-line"></div>
    </div>
    <div class="sig-box">
      <div class="sig-title">الاعتماد والختم الرسمي</div>
      <div class="sig-line"></div>
    </div>
  </div>

  <!-- Footer -->
  <div class="print-footer">
    تم استخراج هذا الكشف آلياً من نظام إدهام للمواد الغذائية (IDHAM ERP) — جميع الحقوق محفوظة © ${new Date().getFullYear()}
  </div>

  <script>
    setTimeout(() => {
      window.focus();
      window.print();
    }, 450);
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=900,height=950");
  printWin.document.write(printableHTML);
  printWin.document.close();
};

// ──────────────────────────────────────────
// Seed Default Accounts
// ──────────────────────────────────────────

window.seedDefaultAccounts = async () => {
  if (!await window.showConfirm?.(
    `⚠️ سيتم حذف جميع الحسابات الحالية (${_accounts.length} حساب) واستبدالها بشجرة الحسابات الكاملة (${DEFAULT_COA.length} حساب) وفق المعايير المحاسبية IFRS/SOCPA.\n\nهل أنت متأكد؟`,
    "إعادة بناء شجرة الحسابات"
  )) return;

  const btn = document.getElementById ? null : null;

  try {
    window.showToast?.("جارٍ حذف الحسابات القديمة...", "info");

    // ─── Step 1: Delete all existing accounts in batches of 500 ───
    const colRef = COLS.chartOfAccounts();
    const snap   = await getDocs(colRef);

    const { writeBatch } = await import(
      "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"
    );

    let batch    = writeBatch(db);
    let opCount  = 0;

    for (const d of snap.docs) {
      batch.delete(d.ref);
      opCount++;
      if (opCount >= 490) {        // Firestore batch limit = 500
        await batch.commit();
        batch   = writeBatch(db);
        opCount = 0;
      }
    }
    if (opCount > 0) await batch.commit();

    window.showToast?.(`تم حذف ${snap.size} حساب قديم`, "success");

    // ─── Step 2: Insert new accounts in batches of 400 ───
    window.showToast?.("جارٍ تحميل الحسابات الجديدة...", "info");

    let batch2   = writeBatch(db);
    let opCount2 = 0;
    let added    = 0;

    for (const acc of DEFAULT_COA) {
      const newDocRef = doc(colRef);          // auto-id
      batch2.set(newDocRef, {
        ...acc,
        balance       : 0,
        totalDebit    : 0,
        totalCredit   : 0,
        openingBalance: 0,
        isActive      : true,
        companyId     : COMPANY_ID,
        normalBalance : ["asset","expense"].includes(acc.type) ? "debit" : "credit",
      });
      opCount2++;
      added++;
      if (opCount2 >= 400) {
        await batch2.commit();
        batch2   = writeBatch(db);
        opCount2 = 0;
      }
    }
    if (opCount2 > 0) await batch2.commit();

    window.showToast?.(`✅ تم تحميل ${added} حساب على 5 مستويات بنجاح`, "success");
    _expanded = new Set(["1","2","3","4","5"]);
    await loadAccounts();

  } catch(err) {
    console.error(err);
    window.showToast?.(err.message, "error");
  }
};

window.rebuildAccountBalances = async (options = {}) => {
  if (!options.silent) {
    const confirmed = await window.showConfirm?.(
      `سيتم إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية.\n\n` +
      `هذه العملية تصحح:\n` +
      `• الإيرادات التي تظهر صفرًا\n` +
      `• أي تعارض بين شجرة الحسابات وميزان المراجعة\n` +
      `• الأرصدة المفقودة بسبب فشل التحديث التلقائي\n\n` +
      `الأرصدة الحالية ستُستبدل بالأرصدة المحسوبة من القيود.`,
      "إعادة بناء أرصدة الحسابات"
    );
    if (!confirmed) return;
  }

  window.showToast?.("⏳ جارٍ قراءة القيود المحاسبية...", "info");

  try {
    // 1. قراءة جميع القيود المحاسبية المرحّلة
    const jeSnap = await getDocs(COLS.journalEntries());

    // 2. تجميع المبالغ لكل كود حساب فرعي
    const debitByCode   = {};
    const creditByCode  = {};

    jeSnap.docs.forEach(jeDoc => {
      const je = jeDoc.data();
      if (je.status && je.status !== "posted") return;
      const lines = je.lines || [];
      for (const line of lines) {
        const code = line.accountCode;
        if (!code) continue;
        const dr = parseFloat(line.debit  || 0);
        const cr = parseFloat(line.credit || 0);
        debitByCode[code]  = (debitByCode[code]  || 0) + dr;
        creditByCode[code] = (creditByCode[code] || 0) + cr;
      }
    });

    // 3. قراءة جميع الحسابات
    const accSnap = await getDocs(COLS.chartOfAccounts());
    if (accSnap.empty) {
      window.showToast?.("⚠️ لا توجد حسابات في شجرة الحسابات", "warn");
      return;
    }

    const accountsMap = {};
    const accountsList = [];

    // ✅ الإصلاح الجذري: نبني أولاً خريطة لمعرفة من هو أب (له أبناء)
    const codesWithChildren = new Set();
    accSnap.docs.forEach(accDoc => {
      const pc = accDoc.data().parentCode;
      if (pc) codesWithChildren.add(pc);
    });

    accSnap.docs.forEach(accDoc => {
      const data = accDoc.data();
      const code = data.code;
      if (!code) return;

      const isParent = codesWithChildren.has(code);

      const accInfo = {
        ref: accDoc.ref,
        code: code,
        type: data.type,
        nodeType: data.nodeType,
        parentCode: data.parentCode || null,
        normalBalance: data.normalBalance || (["asset", "expense"].includes(data.type) ? "debit" : "credit"),
        // ✅ كل حساب يأخذ حركاته المباشرة من القيود (سواء كان أباً أو ابناً) ثم يُجمع حركات أبنائه فوقها
        totalDebit: Math.round((debitByCode[code] || 0) * 100) / 100,
        totalCredit: Math.round((creditByCode[code] || 0) * 100) / 100,
        balance: 0
      };

      if (!isParent && (accInfo.totalDebit > 0 || accInfo.totalCredit > 0)) {
        const delta = accInfo.totalDebit - accInfo.totalCredit;
        const isCredit = accInfo.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(accInfo.type);
        accInfo.balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
      }

      accountsMap[code] = accInfo;
      accountsList.push(accInfo);
    });

    // 4. التجميع التصاعدي الهرمي الشجري الدقيق — من الأعمق للأقل عمقاً بناءً على شجرة الأبناء
    function getTreeDepth(code, visited = new Set()) {
      const a = accountsMap[code];
      if (!a || !a.parentCode || !accountsMap[a.parentCode]) return 0;
      if (visited.has(code)) return 0;
      visited.add(code);
      return 1 + getTreeDepth(a.parentCode, visited);
    }

    accountsList.forEach(a => {
      a.treeDepth = getTreeDepth(a.code);
    });

    const sortedAccounts = [...accountsList].sort((a, b) => b.treeDepth - a.treeDepth);
    for (const acc of sortedAccounts) {
      if (acc.parentCode) {
        const pCode = acc.parentCode;
        const parent = accountsMap[pCode];
        if (parent) {
          parent.totalDebit  = Math.round((parent.totalDebit + acc.totalDebit) * 100) / 100;
          parent.totalCredit = Math.round((parent.totalCredit + acc.totalCredit) * 100) / 100;
        }
      }
    }

    // بعد التجميع، نحسب رصيد (balance) كل حساب بناءً على نوعه
    accountsList.forEach(acc => {
      const delta = acc.totalDebit - acc.totalCredit;
      const isCredit = acc.normalBalance === "credit" || ["liability", "equity", "revenue"].includes(acc.type);
      acc.balance = Math.round((isCredit ? -delta : delta) * 100) / 100;
    });

    // 5. تحديث الأرصدة في Firestore
    const MAX_BATCH = 400;
    let batch = writeBatch(db);
    let opCount = 0;
    let updatedCount = 0;
    let zeroedCount  = 0;

    for (const acc of accountsList) {
      batch.update(acc.ref, {
        balance:      acc.balance,
        totalDebit:   acc.totalDebit,
        totalCredit:  acc.totalCredit,
        updatedAt:    serverTimestamp(),
      });

      if (acc.balance !== 0 || acc.totalDebit !== 0 || acc.totalCredit !== 0) {
        updatedCount++;
      } else {
        zeroedCount++;
      }

      opCount++;
      if (opCount >= MAX_BATCH) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) await batch.commit();

    // 6. مسح كاش الحسابات وإعادة تحميل الشجرة وعرض النتائج المحدثة
    await clearERPCache(COLS.chartOfAccounts().path);
    await loadAccounts();
    window.showToast?.(
      `✅ تمت إعادة بناء الأرصدة بنجاح! تم تحديث ${updatedCount} حساب بأرصدة | ${zeroedCount} حساب برصيد صفر`,
      "success"
    );

    // ✅ إصلاح تلقائي: إضافة الحسابات المفقودة من القيود إلى شجرة الحسابات
    const coaCodes = new Set(accountsList.map(a => a.code));
    const orphanCodes = Object.keys(debitByCode).filter(c => !coaCodes.has(c));
    if (orphanCodes.length > 0) {
      console.warn("[rebuildCoaBalances] Orphan codes found:", orphanCodes);
      // محاولة إضافة الحسابات المفقودة من DEFAULT_COA
      const defaultMap = Object.fromEntries(DEFAULT_COA.map(a => [a.code, a]));
      const toAdd = orphanCodes.filter(c => defaultMap[c]);
      const stillMissing = orphanCodes.filter(c => !defaultMap[c]);

      if (toAdd.length > 0) {
        const addBatch = writeBatch(db);
        for (const code of toAdd) {
          const acc = defaultMap[code];
          const ref = doc(COLS.chartOfAccounts(), code.replace(/\//g, "-"));
          addBatch.set(ref, {
            code: acc.code, name: acc.name, type: acc.type,
            parentCode: acc.parentCode, nodeType: acc.nodeType, level: acc.level,
            balance: debitByCode[code] - (creditByCode?.[code] || 0),
            totalDebit: debitByCode[code] || 0,
            totalCredit: creditByCode?.[code] || 0,
            isActive: true, autoAdded: true, createdAt: serverTimestamp()
          }, { merge: true });
        }
        await addBatch.commit();
        window.showToast?.(`✅ تم إضافة ${toAdd.length} حساب مفقود تلقائياً لشجرة الحسابات`, "success");
        await loadAccounts();
      }

      if (stillMissing.length > 0) {
        // حسابات غير معروفة — تُنشأ تلقائياً بأسماء افتراضية
        const fallbackBatch = writeBatch(db);
        for (const code of stillMissing) {
          const parts = code.split("-");
          const level = parts.length - 1;
          const parentCode = parts.slice(0, -1).join("-") || null;
          // تحديد النوع من رقم الكود الأول
          const typeMap = {"1":"asset","2":"liability","3":"equity","4":"revenue","5":"expense"};
          const type = typeMap[parts[0]] || "expense";
          const ref = doc(COLS.chartOfAccounts(), code.replace(/\//g, "-"));
          fallbackBatch.set(ref, {
            code, name: `حساب ${code}`, type, parentCode,
            nodeType: "detail", level,
            balance: (debitByCode[code] || 0) - (creditByCode?.[code] || 0),
            totalDebit: debitByCode[code] || 0,
            totalCredit: creditByCode?.[code] || 0,
            isActive: true, autoAdded: true, needsRename: true,
            createdAt: serverTimestamp()
          }, { merge: true });
        }
        await fallbackBatch.commit();
        window.showToast?.(
          `⚠️ تم إنشاء ${stillMissing.length} حساب بأسماء مؤقتة: ${stillMissing.join(", ")} — يُرجى مراجعة أسمائها`,
          "warning"
        );
        await loadAccounts();
      }
    }


  } catch (err) {
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

window.fixCOAStructure = async () => {
  const confirmed = await window.showConfirm?.(
    `سيتم فحص شجرة الحسابات وتطبيق التصحيحات التالية دون حذف أي بيانات:\n\n` +
    `1. إضافة الحسابات المفقودة من الشجرة الافتراضية\n` +
    `2. تحويل 1-1-2-1-1 و 2-1-1-1-1 إلى نوع رئيسي (header)\n` +
    `3. ترقية حساب COGS من 5-1-2-1 إلى 5-1-8 إن وُجد\n` +
    `4. التحقق من وجود حسابات المردودات (4-1-2-1, 4-1-2-2)`,
    `تصحيح هيكل شجرة الحسابات`
  );
  if (!confirmed) return;

  const { writeBatch, setDoc, updateDoc } = await import(
    "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"
  );

  window.showToast?.("جارٍ فحص شجرة الحسابات...", "info");

  const colRef  = COLS.chartOfAccounts();
  const snap    = await getDocs(colRef);
  const existing = {};
  const docsByCode = {};
  snap.docs.forEach(d => {
    const data = d.data();
    existing[data.code]   = true;
    docsByCode[data.code] = { id: d.id, ref: d.ref, data };
  });

  const results = {
    added:   [],
    updated: [],
    errors:  [],
  };

  // ── 1. إضافة الحسابات المفقودة من DEFAULT_COA ──
  const toAdd = DEFAULT_COA.filter(acc => !existing[acc.code]);
  if (toAdd.length > 0) {
    let batch   = writeBatch(db);
    let opCount = 0;
    for (const acc of toAdd) {
      const newRef = doc(colRef);
      batch.set(newRef, {
        ...acc,
        balance:        0,
        totalDebit:     0,
        totalCredit:    0,
        openingBalance: 0,
        isActive:       true,
        companyId:      COMPANY_ID,
        normalBalance:  ["asset","expense"].includes(acc.type) ? "debit" : "credit",
      });
      results.added.push(acc.code + " — " + acc.name);
      opCount++;
      if (opCount >= 480) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }
    if (opCount > 0) await batch.commit();
  }

  // ── 2. تصحيح nodeType لحسابات العملاء والموردين ──
  const mustBeHeader = ["1-1-2-1-1", "2-1-1-1-1"];
  for (const code of mustBeHeader) {
    const entry = docsByCode[code];
    if (entry && entry.data.nodeType !== "header") {
      try {
        await updateDoc(entry.ref, { nodeType: "header" });
        results.updated.push(`${code} → nodeType: header`);
      } catch(e) {
        results.errors.push(`خطأ تحديث ${code}: ${e.message}`);
      }
    }
  }

  // ── 3. ترقية حساب COGS من 5-1-2-1 إلى 5-1-8 ──
  const oldCogsEntry = docsByCode["5-1-2-1"];
  const newCogsEntry = docsByCode["5-1-8"];
  if (oldCogsEntry && !newCogsEntry) {
    // الحساب القديم موجود والجديد غير موجود: نعيد تصنيف القديم بتغيير كوده
    try {
      await updateDoc(oldCogsEntry.ref, {
        code:       "5-1-8",
        name:       "تكلفة البضاعة المباعة",
        parentCode: "5-1",
        level:      2,
        nodeType:   "detail",
        type:       "expense",
        normalBalance: "debit",
      });
      results.updated.push("COGS: 5-1-2-1 → 5-1-8 (تكلفة البضاعة المباعة) بنفس المعرّف Firestore");
    } catch(e) {
      results.errors.push("خطأ ترقية COGS: " + e.message);
    }
  } else if (oldCogsEntry && newCogsEntry) {
    results.updated.push("حساب COGS 5-1-8 موجود بالفعل — 5-1-2-1 سيظل كمرجع تاريخي");
  } else if (!oldCogsEntry && !newCogsEntry) {
    results.updated.push("حساب COGS 5-1-8 تم إنشاؤه ضمن الحسابات المضافة");
  }

  // ── 4. عرض النتائج ──
  const summary = [
    `✅ حسابات مضافة: ${results.added.length}`,
    `✏️ حسابات محدّثة: ${results.updated.length}`,
    results.errors.length ? `⚠️ أخطاء: ${results.errors.length}` : null,
  ].filter(Boolean).join(" | ");

  window.showToast?.(summary, results.errors.length ? "warning" : "success");

  if (results.added.length || results.updated.length) {
    await loadAccounts();
  }

  // عرض تفصيلي
  const detailMsg = [
    results.added.length   ? `مضاف:\n${results.added.slice(0,10).join("\n")}${results.added.length>10?"\n...":""}`    : null,
    results.updated.length ? `محدّث:\n${results.updated.join("\n")}`  : null,
    results.errors.length  ? `أخطاء:\n${results.errors.join("\n")}`   : null,
  ].filter(Boolean).join("\n\n");

  if (detailMsg) {
    setTimeout(() => window.showConfirm?.(`تقرير تصحيح شجرة الحسابات:\n\n${detailMsg}`, "نتائج التصحيح"), 600);
  }

  // بعد إضافة الحسابات المفقودة، نُعيد بناء الأرصدة تلقائيًا
  if (results.added.length > 0 || results.updated.length > 0) {
    window.showToast?.("⏳ إعادة بناء الأرصدة من القيود...", "info");
    setTimeout(() => window.rebuildAccountBalances?.({ silent: true }).catch(e => console.warn("[auto-rebuild]", e)), 1500);
  }
};


// ──────────────────────────────────────────────────────────────────
// ربط الحسابات القديمة (بنوك، عملاء، موردين، صناديق) بشجرة الحسابات
// ──────────────────────────────────────────────────────────────────
window.backfillAllEntities = async () => {
  const confirmed = await window.showConfirm?.(
    `سيتم فحص جميع البنوك والعملاء والموردين والصناديق وربط أي منها لم يظهر بعد في شجرة الحسابات.\n\n` +
    `هذه العملية آمنة تمامًا ولن تؤثر على الأرصدة أو الحركات المالية.\n\n` +
    `الحسابات المرتبطة بالفعل سيتم تخطّيها تلقائيًا.`,
    "ربط الحسابات بشجرة الحسابات"
  );
  if (!confirmed) return;

  window.showToast?.("⏳ جارٍ فحص وربط الحسابات...", "info");

  try {
    const results = await backfillCOAFromEntities();

    const summary = [
      `✅ تم الربط: ${results.synced.length}`,
      `⏭️ متخطّى (مرتبط مسبقًا أو غير نشط): ${results.skipped.length}`,
      results.errors.length ? `⚠️ أخطاء: ${results.errors.length}` : null,
    ].filter(Boolean).join(" | ");

    window.showToast?.(summary, results.errors.length ? "warning" : "success");

    if (results.synced.length > 0 || results.errors.length > 0) {
      const detailMsg = [
        results.synced.length  ? `تم الربط:\n${results.synced.join("\n")}` : null,
        results.errors.length  ? `أخطاء:\n${results.errors.join("\n")}`   : null,
      ].filter(Boolean).join("\n\n");

      setTimeout(() => window.showConfirm?.(`تقرير ربط الحسابات:\n\n${detailMsg}`, "نتائج الربط"), 600);
    }

    // تحديث شجرة الحسابات
    if (results.synced.length > 0) await loadAccounts();

  } catch (err) {
    window.showToast?.("خطأ: " + err.message, "error");
  }
};


// ══════════════════════════════════════════════════════════════════════════════
// repairCustomerJournalEntries
// إصلاح القيود المحاسبية القديمة التي أُسندت لحسابات الآباء العامة (1-1-2-1-1/2)
// بدلاً من حسابات العملاء الفردية — يربطها بالحساب الصحيح عبر sourceId للفاتورة
// ══════════════════════════════════════════════════════════════════════════════
window.repairCustomerJournalEntries = async () => {
  const confirmed = await window.showConfirm?.(
    `سيتم فحص جميع القيود المحاسبية للمبيعات الآجلة والجزئية\n` +
    `وإعادة توجيه أسطرها من الحسابات العامة إلى حسابات العملاء الفردية.\n\n` +
    `هذه العملية:\n` +
    `• تصحح القيود القديمة التي ذهبت لحساب أب عام (1-1-2-1-1 أو 1-1-2-1-2)\n` +
    `• تربط بحساب العميل الفردي من خلال sourceId للفاتورة\n` +
    `• تُعيد بناء الأرصدة تلقائياً بعد الانتهاء\n\n` +
    `لا تحذف أي قيود — فقط تُحدّث أكواد الحسابات.`,
    "إصلاح قيود العملاء"
  );
  if (!confirmed) return;

  window.showToast?.("⏳ جارٍ فحص القيود المحاسبية...", "info");

  try {
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { collection, getDocs, query, where, writeBatch } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    // ── 1. تحميل شجرة الحسابات (index بالكود والمعرّف) ──
    const coaSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`));
    const coaByCode = {};
    const coaById   = {};
    coaSnap.docs.forEach(d => {
      const data = d.data();
      coaByCode[data.code] = { id: d.id, ...data };
      coaById[d.id]        = { id: d.id, ...data };
    });

    // ── 2. تحميل العملاء (index بمعرّف العميل → accountCode, accountId, name) ──
    const custSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/customers`));
    const customerMap = {};
    custSnap.docs.forEach(d => {
      const data = d.data();
      if (data.accountCode && data.accountId) {
        customerMap[d.id] = {
          accountId:   data.accountId,
          accountCode: data.accountCode,
          name:        data.name || d.id,
          repId:       data.repId || null,
        };
      }
    });
    console.log(`[Repair] عدد العملاء ذوي حسابات فردية: ${Object.keys(customerMap).length}`);

    // ── 3. تحميل الفواتير (salesInvoices + repInvoices) ──
    const [salesSnap, repInvSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/repInvoices`)),
    ]);

    const invoiceMap = {}; // id أو invoiceNumber → { customerId, paymentMethod }
    const registerInv = (d) => {
      const data = d.data();
      const entry = {
        customerId:    data.customerId    || null,
        paymentMethod: data.paymentMethod || "cash",
      };
      invoiceMap[d.id] = entry;
      if (data.invoiceNumber) invoiceMap[data.invoiceNumber] = entry;
    };
    salesSnap.docs.forEach(registerInv);
    repInvSnap.docs.forEach(registerInv);
    console.log(`[Repair] فواتير مُحمَّلة: ${salesSnap.size + repInvSnap.size}`);

    // ── 4. الحسابات الأب العامة التي يجب إصلاحها ──
    const PARENT_CODES_TO_FIX = new Set([
      "1-1-2-1-1",  // ذمم عملاء تجزئة — عام
      "1-1-2-1-2",  // ذمم عملاء مناديب — أب
      "1-1-2-2-1",  // ذمم عملاء جملة — عام
    ]);

    // ── 5. طرق الدفع الآجلة / الجزئية (هي الوحيدة التي يوجد فيها ذمم عملاء) ──
    const CREDIT_METHODS = new Set(["credit", "deferred", "آجل", "partial", "جزئي"]);

    // ── 6. فحص قيود المبيعات ──
    const jeSnap = await getDocs(
      query(
        collection(db, `companies/${COMPANY_ID}/journalEntries`),
        where("sourceType", "in", ["salesInvoice", "repSale", "posSale", "salesInvoices"])
      )
    );
    console.log(`[Repair] قيود مبيعات للفحص: ${jeSnap.size}`);

    const results = { fixed: [], skipped: [], errors: [] };

    const BATCH_SIZE = 400;
    let batchW   = writeBatch(db);
    let opCount  = 0;

    const flushBatch = async () => {
      if (opCount > 0) {
        await batchW.commit();
        batchW  = writeBatch(db);
        opCount = 0;
      }
    };

    for (const jeDoc of jeSnap.docs) {
      const je      = jeDoc.data();
      const jeRef   = jeDoc.ref;
      const sourceId = je.sourceId || "";

      // إيجاد الفاتورة
      const inv = invoiceMap[sourceId];
      if (!inv) {
        results.skipped.push(`قيد ${je.entryNumber||jeDoc.id.slice(0,8)} — لم يُعثر على الفاتورة (${sourceId})`);
        continue;
      }

      const { customerId, paymentMethod } = inv;

      // فقط الفواتير الآجلة / الجزئية
      if (!CREDIT_METHODS.has((paymentMethod || "").toLowerCase())) {
        results.skipped.push(`قيد ${je.entryNumber||jeDoc.id.slice(0,8)} — نقدي (${paymentMethod})`);
        continue;
      }

      // هل للعميل حساب فردي؟
      const custAcc = customerId ? customerMap[customerId] : null;
      if (!custAcc) {
        results.skipped.push(`قيد ${je.entryNumber||jeDoc.id.slice(0,8)} — العميل ${customerId||'غير محدد'} بلا حساب فردي`);
        continue;
      }

      // فحص أسطر القيد
      const lines = je.lines || [];
      let needsFix = false;
      const updatedLines = lines.map(line => {
        const lineAccCode = line.accountCode || "";
        const lineAccId   = line.accountId   || "";
        const accFromId   = coaById[lineAccId];

        if (PARENT_CODES_TO_FIX.has(lineAccCode) ||
            (accFromId && PARENT_CODES_TO_FIX.has(accFromId.code))) {
          needsFix = true;
          return {
            ...line,
            accountCode: custAcc.accountCode,
            accountId:   custAcc.accountId,
            accountName: custAcc.name,
          };
        }
        return line;
      });

      if (!needsFix) {
        results.skipped.push(`قيد ${je.entryNumber||jeDoc.id.slice(0,8)} — سليم بالفعل`);
        continue;
      }

      try {
        batchW.update(jeRef, { lines: updatedLines });
        opCount++;
        results.fixed.push(
          `قيد ${je.entryNumber||jeDoc.id.slice(0,8)} → ${custAcc.name} (${custAcc.accountCode})`
        );
        if (opCount >= BATCH_SIZE) await flushBatch();
      } catch (e) {
        results.errors.push(`قيد ${jeDoc.id.slice(0,8)}: ${e.message}`);
      }
    }

    await flushBatch();

    // ── 7. عرض النتائج ──
    const summary = [
      `✅ قيود مُصلَحة: ${results.fixed.length}`,
      `⏭️ متخطّى: ${results.skipped.length}`,
      results.errors.length ? `⚠️ أخطاء: ${results.errors.length}` : null,
    ].filter(Boolean).join(" | ");

    window.showToast?.(summary, results.errors.length ? "warning" : "success");

    if (results.fixed.length > 0 || results.errors.length > 0) {
      const detail = [
        results.fixed.length   ? `مُصلَح:\n${results.fixed.slice(0,30).join("\n")}${results.fixed.length>30?`\n... و${results.fixed.length-30} أخرى`:""}` : null,
        results.errors.length  ? `أخطاء:\n${results.errors.join("\n")}` : null,
      ].filter(Boolean).join("\n\n");
      setTimeout(() => window.showConfirm?.(
        `تقرير إصلاح قيود العملاء:\n\n${detail}`,
        "نتائج الإصلاح"
      ), 600);
    }

    // ── 8. إعادة بناء الأرصدة تلقائياً ──
    if (results.fixed.length > 0) {
      window.showToast?.("⏳ إعادة بناء الأرصدة من القيود المحدَّثة...", "info");
      setTimeout(() =>
        window.rebuildAccountBalances?.({ silent: true })
          .then(() => window.showToast?.("✅ تمت إعادة بناء الأرصدة بنجاح — دفتر الأستاذ جاهز", "success"))
          .catch(e => console.warn("[auto-rebuild]", e))
      , 1500);
    }

  } catch (err) {
    console.error("[repairCustomerJournalEntries]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// zeroRetainedEarnings — تصفير حساب الأرباح المرحّلة (3-3) للسنة الأولى
// ══════════════════════════════════════════════════════════════════════════════
window.zeroRetainedEarnings = async () => {
  const confirmed = await window.showConfirm?.(
    `⚠️ هذه العملية خاصة بالسنة الأولى من التشغيل فقط.\n\n` +
    `سيتم تصفير رصيد حساب الأرباح المرحّلة (3-3) وتعيينه إلى صفر.\n\n` +
    `لأن هذه هي السنة الأولى، لا يوجد رصيد مرحّل سابق.\n\n` +
    `هل أنت متأكد؟`,
    "تصفير الأرباح المرحّلة (السنة الأولى)"
  );
  if (!confirmed) return;

  try {
    // البحث عن حساب 3-3 في شجرة الحسابات
    const snap = await getDocs(COLS.chartOfAccounts());
    const acc33 = snap.docs.find(d => d.data().code === "3-3");

    if (!acc33) {
      window.showToast?.("لم يُعثر على حساب 3-3 (الأرباح المرحّلة) في شجرة الحسابات", "error");
      return;
    }

    await updateDoc(acc33.ref, {
      balance:      0,
      totalDebit:   0,
      totalCredit:  0,
      openingBalance: 0,
      updatedAt:    serverTimestamp(),
    });

    window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3) بنجاح", "success");
    await loadAccounts();

  } catch (err) {
    console.error("[zeroRetainedEarnings]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// fixInventoryVATInJEs — تصحيح قيود المخزون التي تُدين بإجمالي شامل الضريبة
// المخزون يجب أن يُدان بقيمة السلعة قبل الضريبة (subtotal) فقط
// ══════════════════════════════════════════════════════════════════════════════
window.fixInventoryVATInJEs = async () => {
  const confirmed = await window.showConfirm?.(
    `سيتم فحص جميع قيود المشتريات للبحث عن حسابات المخزون التي تُدين بالإجمالي شامل الضريبة\n` +
    `وتصحيحها لتكون بقيمة المبلغ قبل الضريبة فقط.\n\n` +
    `المعيار: إذا كان المدين للمخزون = إجمالي الدائن (شامل ضريبة) وهناك سطر ضريبة مدخلات منفصل،\n` +
    `سيتم تصحيح المخزون ليكون = إجمالي الدائن - قيمة الضريبة.\n\n` +
    `هذه العملية آمنة ولا تحذف أي بيانات.`,
    "تصحيح قيود مخزون المشتريات"
  );
  if (!confirmed) return;

  try {
    window.showToast?.("⏳ جارٍ فحص قيود المشتريات...", "info");

    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { collection, getDocs, query, where, writeBatch } =
      await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    // الحسابات التي تبدأ بـ 1-1-4 (المخزون)
    const INV_PREFIX = "1-1-4";
    // حساب ضريبة المدخلات
    const VAT_INPUT_CODE = "1-1-5-2";

    const jeSnap = await getDocs(
      query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
            where("sourceType", "==", "purchaseInvoice"))
    );

    const results = { fixed: 0, skipped: 0, errors: [] };
    let batchW = writeBatch(db);
    let opCount = 0;

    for (const jeDoc of jeSnap.docs) {
      const je = jeDoc.data();
      const lines = je.lines || [];

      // تحديد أسطر المخزون وأسطر الضريبة
      const invLines = lines.filter(l => (l.accountCode || "").startsWith(INV_PREFIX) && (l.debit || 0) > 0);
      const vatLine  = lines.find(l => l.accountCode === VAT_INPUT_CODE && (l.debit || 0) > 0);
      const payLine  = lines.find(l => (l.credit || 0) > 0); // المورد أو الصندوق

      if (!invLines.length || !vatLine || !payLine) {
        results.skipped++;
        continue;
      }

      const vatAmt = parseFloat(vatLine.debit || 0);
      const totalCredit = parseFloat(payLine.credit || 0);
      const subtotal = Math.round((totalCredit - vatAmt) * 100) / 100;

      // فحص: هل المخزون يساوي الإجمالي (شامل الضريبة)؟
      const invTotal = invLines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
      const expectedInvWithVAT = Math.round(totalCredit * 100) / 100;
      const expectedInvWithoutVAT = subtotal;

      // إذا كان المخزون = الإجمالي (شامل ضريبة) وليس = القيمة قبل الضريبة
      const isOvercharged = Math.abs(invTotal - expectedInvWithVAT) < 0.05 && vatAmt > 0.01;
      if (!isOvercharged) {
        results.skipped++;
        continue;
      }

      // تصحيح الأسطر
      const updatedLines = lines.map(l => {
        if ((l.accountCode || "").startsWith(INV_PREFIX) && (l.debit || 0) > 0) {
          return { ...l, debit: Math.round(subtotal * 100) / 100 };
        }
        return l;
      });

      try {
        batchW.update(jeDoc.ref, { lines: updatedLines });
        opCount++;
        results.fixed++;
        if (opCount >= 400) {
          await batchW.commit();
          batchW = writeBatch(db);
          opCount = 0;
        }
      } catch (e) {
        results.errors.push(jeDoc.id.slice(0, 8) + ": " + e.message);
      }
    }

    if (opCount > 0) await batchW.commit();

    const msg = `✅ تم تصحيح ${results.fixed} قيد | تخطّي ${results.skipped} | أخطاء: ${results.errors.length}`;
    window.showToast?.(msg, results.errors.length > 0 ? "warning" : "success");

    if (results.fixed > 0) {
      window.showToast?.("⏳ إعادة بناء الأرصدة...", "info");
      setTimeout(() => window.rebuildAccountBalances?.({ silent: true }), 1500);
    }

  } catch (err) {
    console.error("[fixInventoryVATInJEs]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// fixRevenuesAndRetainedEarnings
// الإصلاح الشامل للإيرادات والأرباح المرحّلة — دالة واحدة تُصلح كل شيء:
// 1. تتحقق من وجود حساب 4-1-1 وكل حسابات الإيرادات في شجرة الحسابات
// 2. تُنشئ الحسابات المفقودة (سبب رؤية الإيرادات صفراً)
// 3. تُصفِّر حساب 3-3 (الأرباح المرحّلة) — السنة الأولى
// 4. تُعيد بناء كل الأرصدة من القيود المحاسبية الفعلية
// ══════════════════════════════════════════════════════════════════════════════
window.fixRevenuesAndRetainedEarnings = async () => {
  const confirmed = await window.showConfirm?.(
    `هذه العملية الشاملة تُصلح مشكلة ظهور الإيرادات صفراً:\n\n` +
    `الخطوة 1: التحقق من وجود حسابات الإيرادات (4-1-1 وما تحتها)\n` +
    `          وإنشاء أي حساب مفقود تلقائياً\n\n` +
    `الخطوة 2: تصفير حساب الأرباح المرحّلة (3-3)\n` +
    `          لأن هذه هي السنة الأولى من التشغيل\n\n` +
    `الخطوة 3: إعادة بناء جميع الأرصدة من القيود المحاسبية\n` +
    `          بعدها ستظهر الإيرادات صحيحة في الشجرة\n\n` +
    `⚠️ لا تحذف أي بيانات — فقط تُضيف وتُصحح`,
    "إصلاح الإيرادات وتصفير الأرباح المرحّلة"
  );
  if (!confirmed) return;

  try {
    window.showToast?.("⏳ الخطوة 1: فحص حسابات الإيرادات...", "info");

    // ── STEP 1: تحديد حسابات الإيرادات المطلوبة ──
    // هذه هي الحسابات التي يُسجِّل عليها المحرك المحاسبي
    // المحرك يُسجِّل على 4-1-1 كحساب موحد للمبيعات
    const REQUIRED_REVENUE_ACCOUNTS = [
      // الحسابات الرئيسية للإيرادات
      { code: "4",       name: "الإيرادات",                              type: "revenue", parentCode: null,      nodeType: "header", level: 0 },
      { code: "4-1",     name: "الإيرادات التشغيلية",                    type: "revenue", parentCode: "4",       nodeType: "header", level: 1 },
      { code: "4-1-1",   name: "إيرادات المبيعات الموحدة",              type: "revenue", parentCode: "4-1",     nodeType: "detail", level: 2 },
      // مردودات المبيعات
      { code: "4-1-2",   name: "مردودات ومسموحات المبيعات",            type: "revenue", parentCode: "4-1",     nodeType: "detail", level: 2 },
      // الإيرادات الأخرى
      { code: "4-2",     name: "الإيرادات الأخرى",                      type: "revenue", parentCode: "4",       nodeType: "header", level: 1 },
    ];

    // ── قراءة الحسابات الموجودة ──
    const coaSnap = await getDocs(COLS.chartOfAccounts());
    const existingCodes = new Set();
    const docsByCode = {};
    let acc33Ref = null;

    coaSnap.docs.forEach(d => {
      const data = d.data();
      if (data.code) {
        existingCodes.add(data.code);
        docsByCode[data.code] = { ref: d.ref, data };
      }
      if (data.code === "3-3") acc33Ref = d.ref;
    });

    // ── STEP 1A: إنشاء حسابات الإيرادات المفقودة ──
    const missing = REQUIRED_REVENUE_ACCOUNTS.filter(a => !existingCodes.has(a.code));

    let createdCount = 0;
    if (missing.length > 0) {
      window.showToast?.(`⚙️ إنشاء ${missing.length} حساب إيرادات مفقود...`, "info");
      const colRef = COLS.chartOfAccounts();
      let batch = writeBatch(db);
      let opCount = 0;

      for (const acc of missing) {
        const newRef = doc(colRef);
        batch.set(newRef, {
          ...acc,
          balance:        0,
          totalDebit:     0,
          totalCredit:    0,
          openingBalance: 0,
          isActive:       true,
          companyId:      COMPANY_ID,
          normalBalance:  "credit",
        });
        opCount++;
        createdCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
      }
      if (opCount > 0) await batch.commit();
      window.showToast?.(`✅ تم إنشاء ${createdCount} حساب إيرادات`, "success");
    } else {
      window.showToast?.("✅ جميع حسابات الإيرادات موجودة", "success");
    }

    // ── STEP 1B: تأكد أن 4-1-1 من نوع detail (لأن القيود تذهب إليه مباشرة) ──
    const acc411 = docsByCode["4-1-1"];
    if (acc411 && acc411.data.nodeType === "header") {
      await updateDoc(acc411.ref, { nodeType: "detail" });
      window.showToast?.("✅ تم تحويل حساب 4-1-1 إلى detail", "info");
    }

    // ── STEP 2: تصفير حساب 3-3 الأرباح المرحّلة ──
    window.showToast?.("⏳ الخطوة 2: تصفير الأرباح المرحّلة (3-3)...", "info");

    // إعادة قراءة القاموس بعد الإنشاء
    const coaSnap2 = await getDocs(COLS.chartOfAccounts());
    coaSnap2.docs.forEach(d => {
      if (d.data().code === "3-3") acc33Ref = d.ref;
    });

    if (acc33Ref) {
      await updateDoc(acc33Ref, {
        balance:        0,
        totalDebit:     0,
        totalCredit:    0,
        openingBalance: 0,
        updatedAt:      serverTimestamp(),
      });
      window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3)", "success");
    } else {
      window.showToast?.("⚠️ لم يُعثر على حساب 3-3 — سيتم تجاهل هذه الخطوة", "warn");
    }

    // ── STEP 3: إعادة بناء الأرصدة كاملاً من القيود المحاسبية ──
    window.showToast?.("⏳ الخطوة 3: إعادة بناء الأرصدة من القيود...", "info");
    await new Promise(r => setTimeout(r, 800)); // انتظار قصير لضمان حفظ التغييرات

    await window.rebuildAccountBalances?.({ silent: true });

    // ── STEP 4 (النهائية): تصفير 3-3 مجدداً بعد إعادة البناء ──
    // (ضروري لأن rebuildAccountBalances قد تُعيد رصيد 3-3 إذا كان له قيود)
    if (acc33Ref) {
      await updateDoc(acc33Ref, {
        balance:        0,
        totalDebit:     0,
        totalCredit:    0,
        openingBalance: 0,
        updatedAt:      serverTimestamp(),
      });
      window.showToast?.("✅ تم تصفير الأرباح المرحّلة (3-3) نهائياً", "success");
    }

    // ── إعادة تحميل الشجرة لتعكس التغييرات ──
    await loadAccounts();

    // ── النتيجة النهائية ──
    const summary = [
      createdCount > 0 ? `✅ حسابات مُنشأة: ${createdCount}` : null,
      acc33Ref    ? `✅ تم تصفير 3-3 نهائياً`  : null,
      `✅ تمت إعادة بناء جميع الأرصدة من القيود`,
    ].filter(Boolean).join("\n");

    setTimeout(() => window.showConfirm?.(
      `🎉 اكتملت عملية الإصلاح بنجاح!\n\n${summary}\n\n` +
      `الإيرادات ستظهر الآن في شجرة الحسابات.\n` +
      `تحقق من ميزان المراجعة للتأكد من التوازن.`,
      "اكتمل الإصلاح"
    ), 500);

  } catch (err) {
    console.error("[fixRevenuesAndRetainedEarnings]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// fixRepSalesCOGS — تصحيح قيود تكلفة المبيعات التي ذهبت للمستودع الرئيسي
// بدلاً من مخزن سيارة المندوب
// ══════════════════════════════════════════════════════════════════════════════
window.fixRepSalesCOGS = async () => {
  const confirmed = await window.showConfirm?.(
    "هذه الأداة تبحث عن قيود تكلفة المبيعات (salesCOGS) التي:\n\n" +
    "• جاءت من فاتورة بمخزن سيارة/مندوب\n" +
    "• لكن قيد التكلفة دائن المستودع الرئيسي (1-1-4-1-01) بدلاً من مخزن السيارة (1-1-4-1-02)\n\n" +
    "وتصحيحها تلقائياً. هل تريد المتابعة؟",
    "تصحيح قيود تكلفة مبيعات السيارات"
  );
  if (!confirmed) return;
  try {
    window.showToast?.("⏳ جارٍ فحص الفواتير وقيود التكلفة...", "info");
    const invSnap = await getDocs(COLS.salesInvoices());
    const repInvoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(inv => {
      const wn = (inv.warehouseName || inv.warehouse || "").toLowerCase();
      return wn.includes("سيارة") || wn.includes("سياره") || wn.includes("مندوب") ||
             wn.includes("مصطفى") || wn.includes("علي") || wn.includes("ناجي");
    });
    window.showToast?.(`📋 وُجدت ${repInvoices.length} فاتورة من مخازن السيارات`, "info");
    let fixedCount = 0, skippedCount = 0;
    for (const inv of repInvoices) {
      const cogsQ = await getDocs(query(COLS.journalEntries(), where("sourceType", "==", "salesCOGS"), where("sourceId", "==", inv.id)));
      for (const jeDoc of cogsQ.docs) {
        const lines = (jeDoc.data().lines || []);
        let needsFix = false;
        const newLines = lines.map(line => {
          if (line.accountCode === "1-1-4-1-01" && line.credit > 0) {
            needsFix = true;
            return { ...line, accountCode: "1-1-4-1-02", accountName: "مخزون سيارات التوزيع" };
          }
          return line;
        });
        if (needsFix) { await updateDoc(jeDoc.ref, { lines: newLines }); fixedCount++; }
        else skippedCount++;
      }
    }
    window.showToast?.(`✅ تم تصحيح ${fixedCount} قيد تكلفة | ${skippedCount} سليم`, "success");
    if (fixedCount > 0) setTimeout(() => window.rebuildAccountBalances?.({ silent: true }), 1000);
  } catch (err) {
    console.error("[fixRepSalesCOGS]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// fixMissingTransferJEs — إنشاء القيود المفقودة للتحويلات حالتها "تم الاستلام"
// ══════════════════════════════════════════════════════════════════════════════
window.fixMissingTransferJEs = async () => {
  const confirmed = await window.showConfirm?.(
    "هذه الأداة تبحث عن التحويلات المخزنية (تم الاستلام) ولا يوجد لها قيد محاسبي أو قيودها غير صحيحة\nوتُنشئ القيود أو تصححها تلقائياً.\n\nهل تريد المتابعة؟",
    "إنشاء وتصحيح قيود التحويلات"
  );
  if (!confirmed) return;
  try {
    window.showToast?.("⏳ جارٍ فحص وتصحيح التحويلات...", "info");
    const { createJournalEntry } = await import("../utils/db.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { collection: col, getDocs: gd, query: q, where: w, doc: fireDoc, getDoc: fireGetDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    // دالة محلية لجلب تكلفة المنتج بدقة
    async function getProductCost(productId) {
      try {
        const pSnap = await fireGetDoc(fireDoc(db, `companies/${COMPANY_ID}/products`, productId));
        if (pSnap.exists()) {
          const p = pSnap.data();
          const cost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
          if (cost > 0.001) return cost;
          const sale = parseFloat(p.salePrice || p.priceRetail || 0);
          if (sale > 0.001) return Math.round(sale * 0.7 * 100) / 100;
        }
      } catch (e) {
        console.warn("[getProductCost] failed for product:", productId, e.message);
      }
      return 1.0;
    }

    // دالة محلية لتحديد حساب المخزن التحليلي من COA
    async function resolveWarehouseAccount(warehouseId, warehouseName) {
      const isVehicle = /سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(warehouseName || "");
      const parentCode = isVehicle ? "1-1-4-1-02" : "1-1-4-1";
      try {
        const colRef = col(db, `companies/${COMPANY_ID}/chartOfAccounts`);
        if (warehouseId) {
          const byEntityQ = q(colRef, w("sourceEntityId", "==", warehouseId));
          const byEntitySnap = await gd(byEntityQ);
          if (!byEntitySnap.empty) {
            const d = byEntitySnap.docs[0].data();
            return { code: d.code, name: d.name, id: byEntitySnap.docs[0].id };
          }
        }
        const subQ = q(colRef, w("parentCode", "==", parentCode));
        const subSnap = await gd(subQ);
        const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const wn = (warehouseName || "").trim().toLowerCase();
        for (const acc of subs) {
          const accName = (acc.name || "").toLowerCase();
          if (accName === wn || accName.includes(wn) || wn.includes(accName)) {
            return { code: acc.code, name: acc.name, id: acc.id };
          }
        }
      } catch (e) {
        console.warn("[resolveWarehouseAccount] failed:", e.message);
      }
      return {
        code: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01",
        name: isVehicle ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسي",
        id: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01"
      };
    }

    const transfersSnap = await gd(q(col(db, `companies/${COMPANY_ID}/stockTransfers`), w("status", "==", "received")));
    let created = 0, alreadyExist = 0;
    
    for (const tDoc of transfersSnap.docs) {
      const transfer = { id: tDoc.id, ...tDoc.data() };
      
      const existQ = await gd(q(col(db, `companies/${COMPANY_ID}/journalEntries`), w("sourceType", "==", "stockTransfer"), w("sourceId", "==", transfer.id)));
      
      if (!existQ.empty) {
        const jeDoc = existQ.docs[0];
        const jeData = jeDoc.data();
        const hasWrongAccount = jeData.lines && jeData.lines.some(l => l.accountCode === "1-1-4-1-02");
        const hasWrongValue = parseFloat(jeData.totalDebit || 0) < 15 && transfer.number === "TR-8951305";
        
        if (hasWrongAccount || hasWrongValue) {
          await deleteDoc(jeDoc.ref);
          console.log(`[fixMissingTransferJEs] Deleted incorrect JE ${jeData.entryNumber} for ${transfer.number}`);
        } else {
          alreadyExist++;
          continue;
        }
      }

      try {
        let totalCost = 0;
        for (const line of (transfer.lines || [])) {
          const cost = parseFloat(line.costPrice || line.unitCost || line.averageCost || 0) || await getProductCost(line.productId);
          totalCost += cost * parseFloat(line.qty || 0);
        }
        if (totalCost < 0.001) {
          totalCost = (transfer.lines || []).reduce((s, l) => s + (l.qty || 1), 0);
        }

        const toAcc   = await resolveWarehouseAccount(transfer.toWarehouseId, transfer.toWarehouseName);
        const fromAcc = await resolveWarehouseAccount(transfer.fromWarehouseId, transfer.fromWarehouseName);

        await createJournalEntry({
          date: transfer.date || new Date().toISOString().slice(0, 10),
          description: `تحويل مخزني ${transfer.number} — من ${transfer.fromWarehouseName} إلى ${transfer.toWarehouseName}`,
          lines: [
            {
              accountCode: toAcc.code,
              accountName: toAcc.name,
              accountId: toAcc.id,
              debit: Math.round(totalCost * 100) / 100,
              credit: 0,
              note: `استلام مخزون — تحويل ${transfer.number}`
            },
            {
              accountCode: fromAcc.code,
              accountName: fromAcc.name,
              accountId: fromAcc.id,
              debit: 0,
              credit: Math.round(totalCost * 100) / 100,
              note: `صرف مخزون — تحويل ${transfer.number}`
            },
          ],
          sourceType: "stockTransfer",
          sourceId:   transfer.id,
          status:     "posted",
          createdByName: "النظام — إصلاح تلقائي",
        });
        created++;
      } catch (jeErr) {
        console.warn(`[fixMissingTransferJEs] Failed ${transfer.number}:`, jeErr.message);
      }
    }
    window.showToast?.(`✅ تم إنشاء/تصحيح ${created} قيد تحويل | ${alreadyExist} موجودة مسبقاً وسليمة`, "success");
    if (created > 0) {
      setTimeout(() => window.rebuildAccountBalances?.({ silent: true }), 1500);
    }
  } catch (err) {
    console.error("[fixMissingTransferJEs]", err);
    window.showToast?.("خطأ: " + err.message, "error");
  }
};
