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
  COLS, create, update, getAll,
  query, where, orderBy, getDocs, getDoc,
  doc, serverTimestamp, limit, writeBatch, updateDoc
} from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { formatCurrency } from "../utils/formatters.js";
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
  { code:"4-1-3",       name:"خصومات المبيعات المكتسبة",                type:"revenue",   parentCode:"4-1",     nodeType:"header", level:2 },
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
  { code:"5-1-1",       name:"مشتريات البضاعة",                         type:"expense",   parentCode:"5-1",     nodeType:"header", level:2 },
  { code:"5-1-1-1",     name:"مشتريات محلية — مواد غذائية",            type:"expense",   parentCode:"5-1-1",   nodeType:"detail", level:3 },
  { code:"5-1-1-2",     name:"مشتريات استيراد — مواد غذائية",          type:"expense",   parentCode:"5-1-1",   nodeType:"header", level:3 },
  { code:"5-1-1-2-1",   name:"مشتريات استيراد — غذائية صنف A",       type:"expense",   parentCode:"5-1-1-2", nodeType:"detail", level:4 },
  { code:"5-1-1-2-2",   name:"مشتريات استيراد — غذائية صنف B",       type:"expense",   parentCode:"5-1-1-2", nodeType:"detail", level:4 },
  { code:"5-1-1-3",     name:"مشتريات تغليف وعبوات",                    type:"expense",   parentCode:"5-1-1",   nodeType:"detail", level:3 },
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
  <div class="modal modal-xl">
    <div class="modal-header">
      <h3 class="modal-title" id="ledger-title">كشف حساب</h3>
      <button class="modal-close" onclick="closeModal('coa-ledger-modal')">×</button>
    </div>
    <div class="modal-body" id="ledger-body"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('coa-ledger-modal')">إغلاق</button>
      <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> طباعة</button>
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
    const snap = await getDocs(COLS.chartOfAccounts());
    _accounts  = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        _rawBalance: data.balance || 0,
        _rawDebit: data.totalDebit || 0,
        _rawCredit: data.totalCredit || 0
      };
    }).filter(a => a.code !== "1-1-4-2" && a.id !== "1-1-4-2" && !(a.name && a.name.includes("1-1-4-2")));
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
    a.balance     = a._rawBalance  !== undefined ? a._rawBalance  : (a.balance     || 0);
    a.totalDebit  = a._rawDebit    !== undefined ? a._rawDebit    : (a.totalDebit  || 0);
    a.totalCredit = a._rawCredit   !== undefined ? a._rawCredit   : (a.totalCredit || 0);
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
// Ledger (كشف الحساب)
// ──────────────────────────────────────────
window.openLedger = async (id, code, name) => {
  document.getElementById("ledger-title").textContent = `كشف حساب: ${code} — ${name}`;
  const bodyEl = document.getElementById("ledger-body");
  bodyEl.innerHTML = `<div class="coa-loading"><i class="fas fa-spinner fa-spin"></i></div>`;
  openModal("coa-ledger-modal");

  try {
    const q    = query(COLS.journalEntries(), orderBy("date"));
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const relevant = [];
    entries.forEach(entry => {

      (entry.lines || []).forEach(line => {
        if (line.accountCode === code || line.accountId === id)
          relevant.push({ ...entry, _line: line });
      });
    });

    const acc     = _accounts.find(a => a.id === id);
    let running   = acc?.openingBalance || 0;
    const isDebit = acc?.normalBalance !== "credit";
    const totalDr = relevant.reduce((s,e) => s + (e._line.debit  || 0), 0);
    const totalCr = relevant.reduce((s,e) => s + (e._line.credit || 0), 0);

    let rows = `<tr style="color:var(--text-2);font-style:italic">
      <td colspan="5">رصيد افتتاحي</td>
      <td class="mono" style="text-align:right;font-weight:800">${formatCurrency(running)}</td></tr>`;

    relevant.forEach((e, i) => {
      const dr = e._line.debit || 0, cr = e._line.credit || 0;
      running += isDebit ? dr - cr : cr - dr;
      rows += `<tr>
        <td class="mono" style="font-size:11px;color:var(--text-2)">${i+1}</td>
        <td class="mono" style="font-size:11px">${e.date || ""}</td>
        <td>${e.entryNumber || e.description || "—"}</td>
        <td class="mono" style="color:var(--bad);text-align:right">${dr ? formatCurrency(dr) : "—"}</td>
        <td class="mono" style="color:var(--good);text-align:right">${cr ? formatCurrency(cr) : "—"}</td>
        <td class="mono" style="text-align:right;font-weight:800;color:${running>=0?"var(--good)":"var(--bad)"}">
          ${formatCurrency(Math.abs(running))} ${running>=0?"م":"د"}
        </td></tr>`;
    });

    if (!relevant.length) rows = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركة مالية</td></tr>`;

    bodyEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="coa-kpi"><div class="coa-kpi-label">إجمالي المدين</div>
          <div class="coa-kpi-value" style="color:var(--bad)">${formatCurrency(totalDr)}</div></div>
        <div class="coa-kpi"><div class="coa-kpi-label">إجمالي الدائن</div>
          <div class="coa-kpi-value" style="color:var(--good)">${formatCurrency(totalCr)}</div></div>
        <div class="coa-kpi"><div class="coa-kpi-label">الرصيد الختامي</div>
          <div class="coa-kpi-value">${formatCurrency(Math.abs(running))} ${running>=0?"مدين":"دائن"}</div></div>
      </div>
      <div style="overflow-x:auto">
        <table class="ledger-table">
          <thead><tr>
            <th>#</th><th>التاريخ</th><th>البيان</th>
            <th style="text-align:right;color:var(--bad)">مدين</th>
            <th style="text-align:right;color:var(--good)">دائن</th>
            <th style="text-align:right">الرصيد الجاري</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch(err) {
    bodyEl.innerHTML = `<div class="coa-loading" style="color:var(--bad)">خطأ: ${err.message}</div>`;
  }
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

    // 4. التجميع التصاعدي الهرمي — من الأعمق للأقل عمقاً
    const sortedAccounts = [...accountsList].sort((a, b) => {
      const depthA = (a.code.match(/-/g) || []).length;
      const depthB = (b.code.match(/-/g) || []).length;
      return depthB - depthA;
    });
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

    // 6. إعادة تحميل الشجرة وعرض النتائج
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
