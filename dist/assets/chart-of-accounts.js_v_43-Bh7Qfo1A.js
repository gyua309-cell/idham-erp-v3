const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{g as be,C as z,c as le,a as N,f as k,u as se,_ as L,d as _,t as Q,b as oe,l as xe}from"./index-CF9GFeRJ.js";import{backfillCOAFromEntities as he}from"./coa-connector-9pNG4b1x.js";import{query as ce,orderBy as we,getDocs as j,doc as U,writeBatch as V,serverTimestamp as W,updateDoc as G,where as ie}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const ee={asset:{label:"الأصول",code:"1",color:"#6366f1"},liability:{label:"الخصوم",code:"2",color:"#ef4444"},equity:{label:"حقوق الملكية",code:"3",color:"#10b981"},revenue:{label:"الإيرادات",code:"4",color:"#22c55e"},expense:{label:"المصروفات",code:"5",color:"#f59e0b"}},K=[{code:"1",name:"الأصول",type:"asset",parentCode:null,nodeType:"header",level:0},{code:"1-1",name:"الأصول المتداولة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-1-1",name:"النقدية وما في حكمها",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-1-1",name:"مجموعة الصندوق الرئيسي",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-1-2",name:"صندوق النثريات",type:"asset",parentCode:"1-1-1-1",nodeType:"detail",level:4},{code:"1-1-1-2",name:"صناديق المناديب",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3",name:"الحسابات البنكية",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3-1",name:"البنك الأهلي السعودي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-2",name:"بنك الراجحي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-3",name:"بنك الإنماء",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-2",name:"الذمم المدينة التجارية",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-2-1",name:"ذمم عملاء تجزئة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-1-1",name:"ذمم عملاء تجزئة — محلية",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-1-2",name:"ذمم عملاء تجزئة — مناديب",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-2",name:"ذمم عملاء جملة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-2-1",name:"ذمم عملاء جملة — شركات",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-2-2",name:"ذمم عملاء جملة — أفراد",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-3",name:"مخصص الديون المشكوك فيها",type:"asset",parentCode:"1-1-2",nodeType:"detail",level:3},{code:"1-1-3",name:"أوراق القبض",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-3-1",name:"أوراق قبض — شيكات آجلة",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-3-2",name:"أوراق قبض — كمبيالات",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-4",name:"المخزون",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-4-1",name:"مخزون المستودعات وسيارات التوزيع",type:"asset",parentCode:"1-1-4",nodeType:"header",level:3},{code:"1-1-4-1-01",name:"مخزون المستودع الرئيسي",type:"asset",parentCode:"1-1-4-1",nodeType:"detail",level:4},{code:"1-1-4-1-02",name:"مخزون سيارات التوزيع",type:"asset",parentCode:"1-1-4-1",nodeType:"header",level:4},{code:"1-1-4-3",name:"مخصص هالك وتالف المخزون",type:"asset",parentCode:"1-1-4",nodeType:"detail",level:3},{code:"1-1-5",name:"أصول متداولة أخرى",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-5-1",name:"مصروفات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-1-1",name:"إيجار مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-2",name:"تأمين مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-3",name:"اشتراكات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-2",name:"ضريبة القيمة المضافة — المدخلات",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-3",name:"سلف للموردين",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-4",name:"سلف للموظفين والمناديب",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-4-1",name:"سلف موظفين",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-4-2",name:"سلف مناديب",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-5",name:"ذمم مدينة أخرى",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-2",name:"الأصول الثابتة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-2-1",name:"السيارات والمركبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-1-1",name:"سيارات التوزيع — التكلفة",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-1-2",name:"م.خصم: إهلاك متراكم — سيارات",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-2",name:"معدات وآلات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-2-1",name:"معدات وآلات — التكلفة",type:"asset",parentCode:"1-2-2",nodeType:"header",level:3},{code:"1-2-2-1-1",name:"معدات تبريد وتخزين — التكلفة",type:"asset",parentCode:"1-2-2-1",nodeType:"detail",level:4},{code:"1-2-2-1-2",name:"معدات إنتاج وتشغيل — التكلفة",type:"asset",parentCode:"1-2-2-1",nodeType:"detail",level:4},{code:"1-2-2-2",name:"م.خصم: إهلاك متراكم — معدات",type:"asset",parentCode:"1-2-2",nodeType:"detail",level:3},{code:"1-2-3",name:"أثاث ومفروشات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-3-1",name:"أثاث ومفروشات — التكلفة",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-3-2",name:"م.خصم: إهلاك متراكم — أثاث",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-4",name:"أجهزة وحاسبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-4-1",name:"أجهزة وحاسبات — التكلفة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-4-2",name:"م.خصم: إهلاك متراكم — أجهزة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-5",name:"تحسينات على العقارات المستأجرة",type:"asset",parentCode:"1-2",nodeType:"detail",level:2},{code:"1-3",name:"الأصول غير الملموسة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-3-1",name:"برامج ورخص تشغيل",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-2",name:"تراخيص تجارية وسجلات",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-3",name:"م.خصم: استهلاك متراكم — أصول غير ملموسة",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"2",name:"الخصوم",type:"liability",parentCode:null,nodeType:"header",level:0},{code:"2-1",name:"الخصوم المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-1-1",name:"الذمم الدائنة التجارية",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-1-1",name:"ذمم موردون محليون",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-1-1",name:"ذمم موردون غذائية — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"header",level:4},{code:"2-1-1-1-2",name:"ذمم موردون تغليف — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"detail",level:4},{code:"2-1-1-2",name:"ذمم موردون استيراد",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-2-1",name:"ذمم موردون غذائية — استيراد",type:"liability",parentCode:"2-1-1-2",nodeType:"detail",level:4},{code:"2-1-2",name:"أوراق الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-2-1",name:"أوراق دفع — شيكات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-2-2",name:"أوراق دفع — كمبيالات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-3",name:"الضرائب والرسوم المستحقة",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-3-1",name:"ضريبة القيمة المضافة — المخرجات",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-2",name:"ضريبة الاستقطاع المستحقة",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-3",name:"ضريبة القيمة المضافة الصافية (للتسوية)",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-4",name:"المصروفات المستحقة الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-4-1",name:"رواتب مستحقة الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-2",name:"عمولات مناديب مستحقة",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-3",name:"إيجار مستحق الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-4",name:"مصروفات مستحقة أخرى",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-5",name:"مستحقات الموظفين والمناديب",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-5-1",name:"التأمينات الاجتماعية (GOSI) المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-5-2",name:"مكافأة نهاية الخدمة المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-6",name:"دفعات مقدمة من العملاء",type:"liability",parentCode:"2-1",nodeType:"detail",level:2},{code:"2-1-7",name:"قروض بنكية قصيرة الأجل",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-7-1",name:"تسهيلات ائتمانية جارية",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-1-7-2",name:"الجزء المتداول من قروض طويلة",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-2",name:"الخصوم غير المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-2-1",name:"قروض بنكية طويلة الأجل",type:"liability",parentCode:"2-2",nodeType:"header",level:2},{code:"2-2-1-1",name:"قرض بنكي — البنك الأهلي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-1-2",name:"قرض بنكي — الراجحي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-2",name:"التزامات عقود الإيجار التمويلي",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"2-2-3",name:"مخصص مكافأة نهاية الخدمة",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"3",name:"حقوق الملكية",type:"equity",parentCode:null,nodeType:"header",level:0},{code:"3-1",name:"رأس المال",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-1-1",name:"رأس المال المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-1-2",name:"رأس المال غير المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-2",name:"الاحتياطيات",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-2-1",name:"الاحتياطي النظامي",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-2-2",name:"الاحتياطي الاختياري",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-4",name:"صافي الربح / الخسارة للفترة",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"3-5",name:"مسحوبات الشريك / الملاك",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات مبيعات المواد الغذائية",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-1-1",name:"مبيعات التجزئة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-1-1",name:"مبيعات تجزئة — نقد",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-2",name:"مبيعات تجزئة — شبكة",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-3",name:"مبيعات تجزئة — آجل",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-2",name:"مبيعات الجملة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-2-1",name:"مبيعات جملة — فواتير",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-2-2",name:"مبيعات جملة — عروض أسعار مقبولة",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-3",name:"مبيعات نقطة البيع (POS)",type:"revenue",parentCode:"4-1-1",nodeType:"detail",level:3},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-2-1",name:"مردودات مبيعات — تجزئة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-2-2",name:"مردودات مبيعات — جملة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-3",name:"الخصم المسموح به (خصومات المبيعات)",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-3-1",name:"خصم تجاري ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-1-3-2",name:"خصم نقدي ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-2-1",name:"فوائد وأرباح بنكية",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-2",name:"أرباح بيع الأصول الثابتة",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-3",name:"إيرادات إيجار",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-4",name:"خصومات مكتسبة من الموردين",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-5",name:"إيرادات متنوعة أخرى",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"5",name:"المصروفات",type:"expense",parentCode:null,nodeType:"header",level:0},{code:"5-1",name:"إجمالي تكلفة المبيعات (COGS)",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-1-2",name:"مردودات المشتريات",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-3",name:"خصومات المشتريات المكتسبة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-4",name:"هالك وتالف المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-5",name:"فروق جرد المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-6",name:"رسوم استيراد وجمارك",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-8",name:"مصروف تكلفة البضاعة المباعة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-2",name:"مصروفات الموظفين والعمالة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-2-1",name:"رواتب الإدارة",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-1-1",name:"راتب المدير العام",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-2",name:"رواتب المحاسبين",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-3",name:"رواتب الإدارية",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-2",name:"رواتب الموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-3",name:"رواتب المناديب وسائقي التوزيع",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-4",name:"عمولات المبيعات والمناديب",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-5",name:"بدلات (سكن، مواصلات، طعام)",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-5-1",name:"بدل سكن",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-2",name:"بدل مواصلات",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-3",name:"بدل طعام",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-6",name:"التأمينات الاجتماعية (GOSI) — حصة صاحب العمل",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-7",name:"مكافأة نهاية الخدمة",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-8",name:"تدريب وتطوير الكوادر",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-9",name:"تأمين طبي للموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-3",name:"مصروفات التوزيع واللوجستيات",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-3-1",name:"وقود سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-2",name:"صيانة وإصلاح سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-3",name:"رسوم تسجيل ومرور السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-4",name:"تأمين السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-5",name:"شحن وتوزيع خارجي",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-6",name:"رسوم تخزين خارجية",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-4",name:"المصروفات الإدارية والعمومية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-4-1",name:"الإيجارات",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-1-1",name:"إيجار المستودع الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-2",name:"إيجار المكتب الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-3",name:"إيجار مستودعات فرعية",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-2",name:"الخدمات (كهرباء، مياه، غاز)",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-2-1",name:"فاتورة الكهرباء",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-2-2",name:"فاتورة المياه",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-3",name:"الاتصالات والإنترنت",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-3-1",name:"فاتورة الهاتف والاتصالات",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-3-2",name:"اشتراك الإنترنت",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-4",name:"مستلزمات مكتبية وقرطاسية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-5",name:"مستلزمات المستودع والتغليف",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-6",name:"تأمين البضائع والمستودع",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-7",name:"الرسوم القانونية والمهنية",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-7-1",name:"أتعاب محاسب قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-7-2",name:"أتعاب مستشار قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-8",name:"رسوم حكومية وتراخيص",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-8-1",name:"رسوم تجديد السجل التجاري",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-2",name:"رسوم البلدية وأمانات المدن",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-3",name:"رسوم وزارة التجارة والصناعة",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-9",name:"إعلانات وتسويق",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-9-1",name:"إعلانات رقمية وسوشيال ميديا",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-9-2",name:"طباعة ومواد ترويجية",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-10",name:"صيانة المعدات والأجهزة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-11",name:"تنظيف وصحة بيئية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-12",name:"أمن وحراسة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-13",name:"ضيافة واستقبال",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-14",name:"مصروفات أخرى متنوعة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-15",name:"مصروفات صيانة وتصليح المباني",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-16",name:"رسوم تراخيص البرمجيات والاشتراكات السحابية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-17",name:"مصروفات السيارات والانتقال والرحلات",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-18",name:"الرسوم والغرامات والمخالفات الحكومية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-19",name:"مصروفات التدريب وورش العمل للموظفين",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-20",name:"الاستشارات الفنية والتقنية والمهنية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-21",name:"هدايا ومساعدات ومساهمات اجتماعية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-22",name:"قرطاسية ومستلزمات مكتبية ومطبوعات ورق",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-23",name:"عمولات بوابات الدفع الإلكتروني والشبكة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-5",name:"المصروفات المالية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-5-1",name:"فوائد القروض البنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-2",name:"عمولات وخدمات بنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-3",name:"فوائد عقود الإيجار التمويلي",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-4",name:"خسائر فروق العملة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-5",name:"ديون معدومة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-6",name:"الإهلاك والاستهلاك",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-6-1",name:"إهلاك السيارات والمركبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-2",name:"إهلاك المعدات والآلات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-3",name:"إهلاك الأثاث والمفروشات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-4",name:"إهلاك الأجهزة والحاسبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-5",name:"استهلاك الأصول غير الملموسة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-6",name:"استهلاك التحسينات على العقارات المستأجرة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-7",name:"المخصصات والخسائر المحتملة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-7-1",name:"مصروف ديون مشكوك فيها",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-2",name:"مخصص هالك المخزون",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-3",name:"مخصصات أخرى",type:"expense",parentCode:"5-7",nodeType:"detail",level:2}];let A=[],O=new Set(["1","2","3","4","5"]),te="",X="",re=!1;async function _e(o,e){o.innerHTML=Ce(),await M(),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).catch(t=>console.warn("[auto-sync on load]",t)),2e3)}function Ce(){return`
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
        ${Object.entries(ee).map(([o,e])=>`<option value="${o}">${e.label}</option>`).join("")}
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
            ${Object.entries(ee).map(([o,e])=>`<option value="${o}">${e.label}</option>`).join("")}
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
  `}async function M(){try{if(A=(await be(z.chartOfAccounts())).map(t=>({id:t.id,...t,_rawBalance:t.balance||0,_rawDebit:t.totalDebit||0,_rawCredit:t.totalCredit||0})).filter(t=>t.code!=="1-1-4-2"&&t.id!=="1-1-4-2"&&!(t.name&&t.name.includes("1-1-4-2"))),A.sort((t,n)=>(t.code||"").localeCompare(n.code||"",void 0,{numeric:!0})),!A.some(t=>t.code==="5-1-7")&&A.length>0)try{const t=z.chartOfAccounts();await le(t,{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"debit"}),console.log("Auto-migrated Freight-In account (5-1-7)."),setTimeout(()=>M(),100);return}catch(t){console.error("Failed to auto-migrate Freight-In account:",t)}Te(),F()}catch(o){document.getElementById("coa-tree").innerHTML=`<div class="coa-loading" style="color:var(--bad)">خطأ: ${o.message}</div>`}}function Te(){const o=document.getElementById("coa-kpis");if(!o)return;const e=[{label:"الأصول",type:"asset",color:"#6366f1"},{label:"الخصوم",type:"liability",color:"#ef4444"},{label:"حقوق الملكية",type:"equity",color:"#10b981"},{label:"الإيرادات",type:"revenue",color:"#22c55e"},{label:"المصروفات",type:"expense",color:"#f59e0b"}];o.innerHTML=e.map(t=>{const n=A.filter(d=>d.type===t.type&&d.nodeType==="detail"&&d.isActive!==!1).reduce((d,i)=>d+(i.balance||0),0),l=Math.abs(n);return`
      <div class="coa-kpi">
        <div class="coa-kpi-label">${t.label}</div>
        <div class="coa-kpi-value" style="color:${t.color}">${k(l)}</div>
      </div>`}).join("")}function F(){const o=document.getElementById("coa-tree");if(!o)return;let e=A;if(re||(e=e.filter(d=>d.isActive!==!1)),te&&(e=e.filter(d=>d.type===te)),X){const d=X.toLowerCase();e=e.filter(i=>(i.name||"").toLowerCase().includes(d)||(i.code||"").toLowerCase().includes(d))}if(!e.length){o.innerHTML='<div class="coa-loading">لا توجد حسابات</div>';return}const t={};e.forEach(d=>{const i=d.parentCode||"ROOT";(t[i]=t[i]||[]).push(d)}),$e(e);const n=[];(t.ROOT||t[""]||[]).sort(pe).forEach(d=>me(d,0,t,n)),o.innerHTML=n.join("")||'<div class="coa-loading">لا توجد حسابات مطابقة</div>'}function pe(o,e){return o.code.localeCompare(e.code,void 0,{numeric:!0})}function $e(o){o.forEach(e=>{e.totalDebit=e._rawDebit!==void 0?e._rawDebit:e.totalDebit||0,e.totalCredit=e._rawCredit!==void 0?e._rawCredit:e.totalCredit||0;const t=e.normalBalance==="credit"||["liability","equity","revenue"].includes(e.type),n=e.totalDebit-e.totalCredit;e.balance=Math.round((t?-n:n)*100)/100})}function me(o,e,t,n,l){const d=(t[o.code]||[]).sort(pe),i=d.length>0,m=O.has(o.code),s=ee[o.type]||{color:"#888",label:"—"},b=o.nodeType==="header"||i,r=o.isActive===!1,y=o.balance||0,g=o.totalDebit||0,u=o.totalCredit||0,$=i?`<button class="coa-toggle-btn ${m?"open":""}"
              onclick="event.stopPropagation();coaToggle('${o.code}')"
              title="${m?"طي":"فتح"}">
         <i class="fas fa-chevron-right" style="font-size:9px;"></i>
       </button>`:'<span class="coa-toggle-placeholder"></span>';n.push(`
    <div class="coa-row ${b?"header-row":""} lv${Math.min(e,4)} ${r?"inactive":""}"
         data-code="${o.code}">

      <div class="coa-cell-code" style="padding-right:${e*14}px">
        ${$}
        <span style="color:${s.color};margin-right:4px">${o.code}</span>
      </div>

      <div class="coa-cell-name">
        <span class="coa-node-dot" style="background:${s.color};opacity:${Math.max(.3,1-e*.15)}"></span>
        <span class="coa-name-txt" title="${o.name}">${o.name}</span>
        ${r?'<span style="font-size:9px;color:var(--text-3)">(معطّل)</span>':""}
      </div>

      <div class="coa-cell-type">
        <span class="coa-badge" style="background:${s.color}22;color:${s.color}">
          ${s.label}
        </span>
      </div>

      <div class="coa-cell-amount ${g?"amt-dr":"amt-z"}">${g?k(g):"—"}</div>
      <div class="coa-cell-amount ${u?"amt-cr":"amt-z"}">${u?k(u):"—"}</div>

      <div class="coa-cell-bal ${y>0?"bal-pos":y<0?"bal-neg":"amt-z"}">
        ${y?k(Math.abs(y)):"0.00"}
      </div>

      <div class="coa-cell-actions">
        <button class="coa-act-btn add"    title="إضافة فرعي"
                onclick="event.stopPropagation();openAddAccountModal('${o.code}')">
          <i class="fas fa-plus"></i>
        </button>
        <button class="coa-act-btn ledger" title="كشف الحساب"
                onclick="event.stopPropagation();openLedger('${o.id}','${o.code}','${(o.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-list-alt"></i>
        </button>
        <button class="coa-act-btn edit"   title="تعديل"
                onclick="event.stopPropagation();editAccount('${o.id}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="coa-act-btn del"    title="حذف نهائي"
                onclick="event.stopPropagation();deleteAccountConfirm('${o.id}','${(o.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-trash"></i>
        </button>
        <button class="coa-act-btn deact"  title="${r?"تفعيل":"تعطيل"}"
                onclick="event.stopPropagation();toggleAccountActive('${o.id}','${(o.name||"").replace(/'/g,"\\'")}',${r})">
          <i class="fas fa-${r?"check-circle":"ban"}"></i>
        </button>
      </div>
    </div>
  `),i&&m&&d.forEach(v=>me(v,e+1,t,n))}window.coaToggle=o=>{O.has(o)?O.delete(o):O.add(o),F()};window.coaExpandAll=()=>{A.forEach(o=>O.add(o.code)),F()};window.coaCollapseAll=()=>{O.clear(),F()};window.coaExpandLevel=o=>{O.clear(),A.filter(e=>(e.level||0)<o).forEach(e=>O.add(e.code)),F()};window.coaSearch=o=>{X=o.trim(),X?window.coaExpandAll():F()};window.coaFilterType=o=>{te=o,F()};window.coaToggleInactive=o=>{re=o,F()};window.openAddAccountModal=function(o){document.getElementById("coa-edit-id").value="",document.getElementById("coa-code").value="",document.getElementById("coa-name").value="",document.getElementById("coa-opening").value="",document.getElementById("coa-desc").value="",document.getElementById("coa-node-type").value="detail",document.getElementById("coa-form-error").classList.add("hidden"),document.getElementById("coa-modal-title").textContent="إضافة حساب جديد";const e=document.getElementById("coa-parent");if(e.innerHTML='<option value="">بدون أب</option>'+A.map(n=>`<option value="${n.code}" ${n.code===o?"selected":""}>${n.code} — ${n.name}</option>`).join(""),o){const n=A.find(l=>l.code===o);n&&(document.getElementById("coa-type").value=n.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(n.type)?"debit":"credit"),ye(o)}else{const n=document.getElementById("coa-code-preview-chip");n&&(n.textContent="حدد الحساب الأب أولاً",n.className="coa-code-preview")}const t=document.getElementById("coa-delete-btn");t&&(t.style.display="none"),openModal("coa-modal")};function ye(o){const e=A.filter(l=>l.parentCode===o);let t;if(!e.length)t=`${o}-1`;else{const l=e.map(d=>parseInt(d.code.split("-").pop())||0);t=`${o}-${Math.max(...l)+1}`}document.getElementById("coa-code").value=t;const n=document.getElementById("coa-code-preview-chip");if(n){const l=A.find(d=>d.code===t);n.textContent=`📌 ${t}`,n.className=`coa-code-preview ${l?"invalid":"valid"}`,l&&(n.textContent+=" (مستخدم!)")}}window.coaTypeChanged=()=>{const o=document.getElementById("coa-type").value;document.getElementById("coa-normal-balance").value=["asset","expense"].includes(o)?"debit":"credit"};window.coaParentChanged=()=>{const o=document.getElementById("coa-parent").value;if(o){ye(o);const e=A.find(t=>t.code===o);e&&!document.getElementById("coa-edit-id").value&&(document.getElementById("coa-type").value=e.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(e.type)?"debit":"credit")}};window.editAccount=o=>{const e=A.find(d=>d.id===o);if(!e)return;document.getElementById("coa-edit-id").value=o,document.getElementById("coa-code").value=e.code,document.getElementById("coa-name").value=e.name,document.getElementById("coa-type").value=e.type,document.getElementById("coa-opening").value=e.openingBalance||"",document.getElementById("coa-desc").value=e.description||"",document.getElementById("coa-node-type").value=e.nodeType||"detail",document.getElementById("coa-normal-balance").value=e.normalBalance||"debit",document.getElementById("coa-modal-title").textContent=`تعديل: ${e.name}`,document.getElementById("coa-form-error").classList.add("hidden");const t=document.getElementById("coa-parent");t.innerHTML='<option value="">بدون أب (مستوى رئيسي)</option>'+A.filter(d=>d.id!==o).map(d=>`<option value="${d.code}" ${d.code===e.parentCode?"selected":""}>${d.code} — ${d.name}</option>`).join("");const n=document.getElementById("coa-delete-btn");n&&(n.style.display="inline-flex");const l=document.getElementById("coa-code-preview-chip");l&&(l.textContent=`📌 ${e.code} (الكود الحالي)`,l.className="coa-code-preview valid"),openModal("coa-modal")};window.saveAccount=async()=>{const o=document.getElementById("coa-form-error");o.classList.add("hidden");const e=document.getElementById("coa-edit-id").value,t=document.getElementById("coa-code").value.trim(),n=document.getElementById("coa-name").value.trim(),l=document.getElementById("coa-type").value,d=document.getElementById("coa-parent").value||null,i=document.getElementById("coa-node-type").value,m=document.getElementById("coa-normal-balance").value,s=parseFloat(document.getElementById("coa-opening").value)||0,b=document.getElementById("coa-desc").value.trim();if(!t||!n){o.textContent="الكود والاسم مطلوبان",o.classList.remove("hidden");return}if(!e){const u=A.find($=>$.code===t);if(u){o.textContent=`الكود ${t} موجود (${u.name})`,o.classList.remove("hidden");return}}const r=d?d.split("-").length:0,y={code:t,name:n,type:l,parentCode:d,nodeType:i,normalBalance:m,openingBalance:s,description:b,level:r,balance:s,totalDebit:0,totalCredit:0,isActive:!0,companyId:N},g=document.getElementById("coa-save-btn");g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';try{e?(await se("chartOfAccounts",e,y),window.showToast?.("تم التحديث","success")):(await le(z.chartOfAccounts(),y),window.showToast?.("تمت الإضافة","success")),closeModal("coa-modal"),await M()}catch(u){o.textContent=u.message,o.classList.remove("hidden")}finally{g.disabled=!1,g.innerHTML='<i class="fas fa-save"></i> حفظ الحساب'}};window.toggleAccountActive=async(o,e,t)=>{const n=t?"تفعيل":"تعطيل";if(await window.showConfirm?.(`${n} الحساب "${e}"؟`,n)){if(!t){const l=A.find(i=>i.id===o);if(A.filter(i=>i.parentCode===l?.code&&i.isActive!==!1).length){window.showToast?.("لا يمكن تعطيل حساب له حسابات فرعية نشطة","error");return}}try{await se("chartOfAccounts",o,{isActive:t}),window.showToast?.(`تم ${n} الحساب`,"success"),await M()}catch(l){window.showToast?.(l.message,"error")}}};window.deleteAccountConfirm=async(o,e)=>{const t=A.find(l=>l.id===o);if(!t)return;const n=A.filter(l=>l.parentCode===t.code);if(n.length){window.showToast?.(`لا يمكن حذف "${e}" لأن له ${n.length} حساب فرعي. يجب حذف الفروع أولاً.`,"error");return}if(await window.showConfirm?.(`⚠️ سيتم حذف الحساب "${t.code} — ${e}" نهائياً.

تأكد أن لا توجد قيود مرتبطة به قبل الحذف.`,"حذف الحساب نهائياً"))try{const{deleteDoc:l,doc:d}=await L(async()=>{const{deleteDoc:i,doc:m}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{deleteDoc:i,doc:m}},[]);await l(d(_,`companies/${N}/chartOfAccounts`,o)),window.showToast?.(`✅ تم حذف الحساب "${e}" نهائياً`,"success"),await M()}catch(l){window.showToast?.(l.message,"error")}};window.deleteAccount=async()=>{const o=document.getElementById("coa-edit-id").value;if(!o)return;const e=A.find(t=>t.id===o);e&&(closeModal("coa-modal"),await deleteAccountConfirm(o,e.name))};let Y=null,J=null;window.setLedgerPeriod=o=>{const e=document.getElementById("ledger-from-date"),t=document.getElementById("ledger-to-date");if(!e||!t)return;const n=new Date,l=d=>String(d).padStart(2,"0");if(o==="thisMonth"){const d=n.getFullYear(),i=n.getMonth(),m=new Date(d,i+1,0).getDate();e.value=`${d}-${l(i+1)}-01`,t.value=`${d}-${l(i+1)}-${l(m)}`}else if(o==="lastMonth"){const d=new Date(n.getFullYear(),n.getMonth()-1,1),i=d.getFullYear(),m=d.getMonth(),s=new Date(i,m+1,0).getDate();e.value=`${i}-${l(m+1)}-01`,t.value=`${i}-${l(m+1)}-${l(s)}`}else o==="all"&&(e.value="",t.value="");window.renderLedgerTable()};window.resetLedgerPeriod=()=>{const o=document.getElementById("ledger-from-date"),e=document.getElementById("ledger-to-date");o&&(o.value=""),e&&(e.value=""),window.renderLedgerTable()};window.filterLedgerByDate=()=>{window.renderLedgerTable()};window.renderLedgerTable=()=>{if(!J)return;const{id:o,code:e,name:t,acc:n,allEntries:l}=J,d=document.getElementById("ledger-body"),i=document.getElementById("ledger-period-badge"),m=document.getElementById("ledger-footer-info"),s=document.getElementById("ledger-from-date")?.value||"",b=document.getElementById("ledger-to-date")?.value||"",r=!(n?.normalBalance==="credit"||["liability","equity","revenue"].includes(n?.type)),y=parseFloat(n?.openingBalance||0)||0;let g=y,u=[];l.forEach(C=>{const D=C.date||"",I=C._line.debit||0,T=C._line.credit||0;s&&D<s?g+=r?I-T:T-I:(!s||D>=s)&&(!b||D<=b)&&u.push(C)});const $=u.reduce((C,D)=>C+(D._line.debit||0),0),v=u.reduce((C,D)=>C+(D._line.credit||0),0),x=r?$-v:v-$,a=g+x;i&&(s&&b?(i.textContent=`الفترة: من ${s} إلى ${b}`,i.style.background="rgba(37,99,235,0.12)",i.style.color="#1d4ed8"):s?(i.textContent=`من تاريخ: ${s}`,i.style.background="rgba(37,99,235,0.12)",i.style.color="#1d4ed8"):b?(i.textContent=`حتى تاريخ: ${b}`,i.style.background="rgba(37,99,235,0.12)",i.style.color="#1d4ed8"):(i.textContent="عرض كامل الحركات (من البداية)",i.style.background="rgba(37,99,235,0.08)",i.style.color="var(--brand)")),m&&(m.textContent=`عدد حركات الفترة: ${u.length} من أصل ${l.length} حركة مسجلة`),Y={id:o,code:e,name:t,acc:n,relevant:u,allCount:l.length,fromDate:s,toDate:b,openingBalance:g,baseOpeningBalance:y,running:a,totalDr:$,totalCr:v,isDebit:r};let f=`<tr style="background:var(--bg-2); font-style:italic; font-weight:700;">
    <td colspan="3" style="padding:10px 14px;">${s?`🏁 رصيد بداية الفترة (حتى ${s})`:"🏁 رصيد افتتاحي"}</td>
    <td class="mono" style="text-align:right;">—</td>
    <td class="mono" style="text-align:right;">—</td>
    <td class="mono" style="text-align:right; font-weight:800; color:var(--text-0);">
      ${k(Math.abs(g))} 
      <span style="font-size:10px; font-weight:600; color:var(--text-2);">
        ${g>=0?r?"مدين":"دائن":r?"دائن":"مدين"}
      </span>
    </td>
  </tr>`,c=g;u.forEach((C,D)=>{const I=C._line.debit||0,T=C._line.credit||0;c+=r?I-T:T-I;const E=C._line?.note||C._line?.description||"",S=C.description||C.notes||"",B=E||S||"حركة قيود يومية",R=C.entryNumber||C.number||C.id||"—";f+=`<tr>
      <td class="mono" style="font-size:11px; color:var(--text-2); text-align:center;">${D+1}</td>
      <td class="mono" style="font-size:11px; white-space:nowrap;">${C.date||""}</td>
      <td>
        <div style="font-weight:700; color:var(--text-0); line-height:1.4;">${B}</div>
        <div style="font-size:10.5px; color:var(--brand); font-family:monospace; margin-top:2px;">#${R}</div>
      </td>
      <td class="mono" style="color:var(--bad); text-align:right; font-weight:700;">${I?k(I):"—"}</td>
      <td class="mono" style="color:var(--good); text-align:right; font-weight:700;">${T?k(T):"—"}</td>
      <td class="mono" style="text-align:right; font-weight:800; color:${c>=0?"var(--good)":"var(--bad)"}">
        ${k(Math.abs(c))} <span style="font-size:10px;">${c>=0?r?"مدين":"دائن":r?"دائن":"مدين"}</span>
      </td>
    </tr>`}),u.length||(f+='<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>');const h=s?"رصيد بداية الفترة":"الرصيد الافتتاحي",w=b?"رصيد نهاية الفترة":"الرصيد الختامي الصافي";d.innerHTML=`
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px;">
      <div class="coa-kpi">
        <div class="coa-kpi-label">${h}</div>
        <div class="coa-kpi-value" style="color:var(--text-1);">${k(Math.abs(g))} <span style="font-size:11px; font-weight:normal;">${g>=0?r?"مدين":"دائن":r?"دائن":"مدين"}</span></div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">حركات الفترة المدينة (+)</div>
        <div class="coa-kpi-value" style="color:var(--bad);">${k($)}</div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">حركات الفترة الدائنة (-)</div>
        <div class="coa-kpi-value" style="color:var(--good);">${k(v)}</div>
      </div>
      <div class="coa-kpi">
        <div class="coa-kpi-label">${w}</div>
        <div class="coa-kpi-value" style="color:var(--brand);">${k(Math.abs(a))} <span style="font-size:11px;">${a>=0?r?"مدين":"دائن":r?"دائن":"مدين"}</span></div>
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
        <tbody>${f}</tbody>
      </table>
    </div>`};window.openLedger=async(o,e,t)=>{document.getElementById("ledger-title").textContent=`كشف حساب: ${e} — ${t}`;const n=document.getElementById("ledger-body");n.innerHTML='<div class="coa-loading"><i class="fas fa-spinner fa-spin"></i> جاري استرجاع قيود اليومية وحركات الحساب...</div>';const l=document.getElementById("ledger-from-date"),d=document.getElementById("ledger-to-date");l&&(l.value=""),d&&(d.value="");const i=e.startsWith("2-1-5")||e.startsWith("1-1-5-4")||t.includes("مندوب")||t.includes("موظف")||t.includes("سلف")||t.includes("مستحقات"),m=document.getElementById("ledger-payslip-btn");m&&(m.style.display=i?"inline-flex":"none"),openModal("coa-ledger-modal");try{const s=ce(z.journalEntries(),we("date")),r=(await j(s)).docs.map(u=>({id:u.id,...u.data()})),y=[];r.forEach(u=>{(u.lines||[]).forEach($=>{($.accountCode===e||$.accountId===o)&&y.push({...u,_line:$})})}),y.sort((u,$)=>(u.date||"").localeCompare($.date||""));const g=A.find(u=>u.id===o);J={id:o,code:e,name:t,acc:g,allEntries:y},window.renderLedgerTable()}catch(s){console.error("Error opening ledger:",s),n.innerHTML=`<div class="coa-loading" style="color:var(--bad)">حدث خطأ أثناء تحميل كشف الحساب: ${s.message}</div>`}};let P=[];window.printAccountPayslip=async()=>{if(!J)return;const{name:o,code:e}=J;try{if(!P||!P.length){const{getDocs:i,collection:m}=await L(async()=>{const{getDocs:b,collection:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:b,collection:r}},[]);P=(await i(m(_,`companies/${N}/employees`))).docs.map(b=>({id:b.id,...b.data()}))}const t=i=>(i||"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase().trim(),n=t(o);let l=P.find(i=>{const m=t(i.name);return n.includes(m)||m.includes(n)||i.code&&e.includes(i.code)});if(!l){const i=n.split(/\s+/).filter(m=>m.length>=3&&!["سلف","سلفة","المندوب","الموظف","مستحقات","حساب"].includes(m));l=P.find(m=>{const s=t(m.name);return i.some(b=>s.includes(b))})}const d=l?l.id:P[0]?.id||"";window.openCoaPayslipModal(d)}catch(t){console.error("Error opening payslip from ledger:",t),window.showToast?.("حدث خطأ أثناء فتح قسيمة الموظف: "+t.message,"error")}};window.openCoaPayslipModal=o=>{const e=P.find(a=>a.id===o)||P[0]||{salary:0,allowance:0},t=Math.abs(Y?.running||0),n=Y?.fromDate?.slice(0,7)||Q().slice(0,7),l=e.salary||0,d=e.allowance||0,i=e.nationality==="saudi"?(l+d)*.0975:0,m=t,s=0,b=0,r=0,y=l+d+s+b,g=m+r+i,u=Math.max(0,y-g),$=document.getElementById("coa-payslip-overlay");$&&$.remove();const v=document.createElement("div");v.className="modal-overlay active",v.id="coa-payslip-overlay",v.style.cssText="z-index: 2100; display:flex; align-items:center; justify-content:center; background:rgba(15,23,42,0.65); backdrop-filter:blur(4px);";const x=P.map(a=>`
    <option value="${a.id}" ${a.id===e.id?"selected":""}>${a.name} (${a.job||"موظف"}) - راتب: ${k(a.salary||0)}</option>
  `).join("");v.innerHTML=`
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
              ${x}
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">📅 شهر الاستحقاق:</label>
            <input type="month" id="cp-month" value="${n}" style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:700;" onchange="window.calcCoaPayslipNet()">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">🗓️ تاريخ الصرف:</label>
            <input type="date" id="cp-date" value="${Q()}" style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:700;">
          </div>
        </div>

        <!-- Employee Info Quick Badge -->
        <div id="cp-emp-info-badge" style="background:#eff6ff; border:1px solid #bfdbfe; border-right:4px solid #2563eb; border-radius:10px; padding:10px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <div><strong>المسمى الوظيفي:</strong> <span id="cp-info-job" style="color:#1d4ed8; font-weight:700;">${e.job||"مندوب مبيعات"}</span></div>
          <div><strong>رقم الموظف:</strong> <span id="cp-info-code" class="mono" style="font-weight:700;">${e.code||e.id?.slice(-5)||"EMP"}</span></div>
          <div><strong>الهوية / الإقامة:</strong> <span id="cp-info-nid" class="mono">${e.nid||"—"}</span></div>
          <div><strong>الجنسية:</strong> <span id="cp-info-nat">${e.nationality==="saudi"?"سعودي":"مقيم"}</span></div>
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
              <input type="number" id="cp-basic" value="${l}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">البدلات الشهرية (سكن / مواصلات) (ر.س):</label>
              <input type="number" id="cp-allowance" value="${d}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">مكافآت وحوافز تشجيعية (ر.س):</label>
              <input type="number" id="cp-bonus" value="${s}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">بيان سبب المكافأة / الحافز:</label>
              <input type="text" id="cp-bonus-desc" value="حافز تارغت المبيعات" placeholder="مثال: مكافأة مبيعات شهرية" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-size:11.5px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">أجر ساعات إضافية (Overtime) (ر.س):</label>
              <input type="number" id="cp-overtime" value="${b}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #86efac; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
          </div>

          <!-- Column 2: Deductions -->
          <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:14px 16px;">
            <div style="font-size:13px; font-weight:800; color:#991b1b; margin-bottom:12px; display:flex; justify-content:space-between;">
              <span>➖ الاستقطاعات وتسوية السلف (Deductions)</span>
            </div>

            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">خصم وإقفال سلفة الموظف (ر.س):</label>
              <input type="number" id="cp-repay" value="${m}" step="0.01" style="width:100%; padding:7px 10px; border:1.5px solid #f87171; border-radius:8px; font-family:monospace; font-weight:800; color:#b91c1c; background:#fff;" oninput="window.calcCoaPayslipNet()">
              <div style="font-size:10.5px; color:#b91c1c; margin-top:3px; font-weight:600;">💡 الرصيد المفتوح الحالي للسلفة في كشف الحساب: <strong>${k(t)}</strong></div>
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">خصومات وجزاءات أخرى (ر.س):</label>
              <input type="number" id="cp-deduct" value="${r}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #fca5a5; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
            </div>
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:3px;">التأمينات الاجتماعية (GOSI) (ر.س):</label>
              <input type="number" id="cp-gosi" value="${i.toFixed(2)}" step="0.01" style="width:100%; padding:7px 10px; border:1px solid #fca5a5; border-radius:8px; font-family:monospace; font-weight:700;" oninput="window.calcCoaPayslipNet()">
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
            <span id="cp-net-disp" style="font-size:26px; font-weight:900; font-family:monospace; letter-spacing:0.5px;">${k(u)}</span>
            <span style="font-size:13px; font-weight:700; margin-right:4px;">ريال سعودي</span>
          </div>
        </div>

        <!-- Live Tafqeet Box -->
        <div id="cp-tafqeet-preview" style="background:#f0fdf4; border:1px dashed #86efac; border-radius:10px; padding:10px 16px; font-size:12px; color:#166534; font-weight:700; margin-bottom:8px;">
          ✍️ المبلغ كتابةً وتفقيطاً: <span style="font-weight:800; color:#047857;">فقط ${oe(u)} لا غير.</span>
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
  `,v.onclick=a=>{a.target===v&&v.remove()},document.body.appendChild(v),window.calcCoaPayslipNet()};window.onCoaPayslipEmpChange=()=>{const o=document.getElementById("cp-emp-select");if(!o)return;const e=P.find(g=>g.id===o.value);if(!e)return;const t=e.salary||0,n=e.allowance||0,l=e.nationality==="saudi"?(t+n)*.0975:0,d=document.getElementById("cp-basic");d&&(d.value=t);const i=document.getElementById("cp-allowance");i&&(i.value=n);const m=document.getElementById("cp-gosi");m&&(m.value=l.toFixed(2));const s=document.getElementById("cp-info-job");s&&(s.textContent=e.job||"موظف / مندوب");const b=document.getElementById("cp-info-code");b&&(b.textContent=e.code||e.id?.slice(-5)||"EMP");const r=document.getElementById("cp-info-nid");r&&(r.textContent=e.nid||"—");const y=document.getElementById("cp-info-nat");y&&(y.textContent=e.nationality==="saudi"?"سعودي":"مقيم"),window.calcCoaPayslipNet()};window.calcCoaPayslipNet=()=>{const o=parseFloat(document.getElementById("cp-basic")?.value)||0,e=parseFloat(document.getElementById("cp-allowance")?.value)||0,t=parseFloat(document.getElementById("cp-bonus")?.value)||0,n=parseFloat(document.getElementById("cp-overtime")?.value)||0,l=parseFloat(document.getElementById("cp-repay")?.value)||0,d=parseFloat(document.getElementById("cp-deduct")?.value)||0,i=parseFloat(document.getElementById("cp-gosi")?.value)||0,m=o+e+t+n,s=l+d+i,b=Math.max(0,m-s),r=document.getElementById("cp-net-disp");r&&(r.textContent=k(b));const y=document.getElementById("cp-tafqeet-preview");y&&(y.innerHTML=`✍️ <strong>المبلغ كتابةً وتفقيطاً:</strong> <span style="font-weight:800; color:#047857;">فقط ${oe(b)} لا غير.</span>`)};window.submitCoaPayslipPrint=async()=>{const o=document.getElementById("cp-emp-select"),e=P.find(c=>c.id===o.value)||{name:"الموظف المستحق",job:"مندوب"},t=document.getElementById("cp-month")?.value||Q().slice(0,7),n=document.getElementById("cp-date")?.value||Q(),l=parseFloat(document.getElementById("cp-basic")?.value)||0,d=parseFloat(document.getElementById("cp-allowance")?.value)||0,i=parseFloat(document.getElementById("cp-bonus")?.value)||0,m=(document.getElementById("cp-bonus-desc")?.value||"مكافآت وحوافز تشجيعية").trim(),s=parseFloat(document.getElementById("cp-overtime")?.value)||0,b=parseFloat(document.getElementById("cp-repay")?.value)||0,r=parseFloat(document.getElementById("cp-deduct")?.value)||0,y=parseFloat(document.getElementById("cp-gosi")?.value)||0,g=l+d+i+s,u=b+r+y,$=Math.max(0,g-u),v=oe($);let x={name:"شركة نظم الإمداد المتطورة",nameEn:"Modern Supply Systems Co.",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",logoUrl:""};try{const c=localStorage.getItem("idham_company");c&&Object.assign(x,JSON.parse(c))}catch{}const a=`SAL-${e.code||e.id?.slice(-4)||"EMP"}-${t.replace(/[^0-9]/g,"")}`,p=`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند صرف واستلام راتب — ${e.name} — ${t}</title>
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
          ${x.logoUrl?`<img src="${x.logoUrl}" alt="Logo" style="height:52px;max-width:100px;object-fit:contain;background:#fff;padding:2px;border-radius:6px;" />`:'<div style="font-size:28px;">🏢</div>'}
          <div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${x.name}</div>
            <div style="font-size:10.5px;opacity:0.85;font-weight:600;color:#fff;">${x.nameEn}</div>
            <div style="font-size:9.5px;opacity:0.8;margin-top:2px;color:#fff;">
              <span>الهاتف: <strong>${x.phone}</strong></span> |
              <span>الرقم الضريبي: <strong>${x.vatNumber}</strong></span> |
              <span>سجل تجاري: <strong>${x.crNumber}</strong></span>
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
      <div class="sal-meta-card"><div class="sal-meta-label">رقم السند</div><div class="sal-meta-val mono" style="color:#047857;">${a}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">تاريخ الصرف</div><div class="sal-meta-val mono">${n}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">شهر الاستحقاق</div><div class="sal-meta-val" style="color:#1d4ed8;">شهر ${t}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">طريقة الصرف</div><div class="sal-meta-val" style="font-size:11px;">نقدي / تحويل بنكي</div></div>
    </div>

    <div class="sal-emp-box">
      <div class="sal-emp-grid">
        <div><div class="sal-emp-item-lbl">👤 اسم الموظف المستحق</div><div class="sal-emp-item-val" style="font-size:13.5px;color:#1e3a8a;">${e.name}</div></div>
        <div><div class="sal-emp-item-lbl">💼 المسمى الوظيفي</div><div class="sal-emp-item-val">${e.job||"موظف / مندوب"}</div></div>
        <div><div class="sal-emp-item-lbl">🆔 رقم الهوية / الإقامة</div><div class="sal-emp-item-val mono">${e.nid||"—"}</div></div>
        <div><div class="sal-emp-item-lbl">💳 الآيبان / الحساب</div><div class="sal-emp-item-val mono" style="font-size:10.5px;">${e.iban||"—"}</div></div>
      </div>
    </div>

    <div class="sal-breakdown-section">
      <div class="sal-panel earnings">
        <div class="sal-panel-head"><span>➕ مفردات الاستحقاقات والمكافآت</span><span style="font-size:10px;">(Earnings)</span></div>
        <table class="sal-items-table">
          <tbody>
            <tr><td><strong>الراتب الأساسي</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${k(l)} ر.س</td></tr>
            <tr><td><strong>البدلات الشهرية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${k(d)} ر.س</td></tr>
            ${s?`<tr><td><strong>أجر ساعات إضافية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${k(s)} ر.س</td></tr>`:""}
            ${i?`<tr><td><strong>${m||"مكافآت وحوافز تشجيعية"}</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${k(i)} ر.س</td></tr>`:""}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستحقاقات:</span><span class="mono font-bold">${k(g)} ر.س</span></div>
      </div>

      <div class="sal-panel deductions">
        <div class="sal-panel-head"><span>➖ مفردات الاستقطاعات والسلف</span><span style="font-size:10px;">(Deductions)</span></div>
        <table class="sal-items-table">
          <tbody>
            ${r?`<tr><td><strong>خصومات وغياب</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${k(r)} ر.س</td></tr>`:""}
            ${y?`<tr><td><strong>تأمينات اجتماعية (GOSI)</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${k(y)} ر.س</td></tr>`:""}
            ${b?`<tr><td><strong>إقفال وتسوية سلفة الموظف</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${k(b)} ر.س</td></tr>`:""}
            ${u===0?'<tr><td style="color:#94a3b8;text-align:center;padding:12px;">لا توجد أي استقطاعات</td></tr>':""}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستقطاعات:</span><span class="mono font-bold">${k(u)} ر.س</span></div>
      </div>
    </div>

    <div class="sal-net-ribbon">
      <div><div style="font-size:11.5px;opacity:0.9;font-weight:700;">💰 صافي الراتب المنصرف للموظف</div><div style="font-size:9.5px;opacity:0.8;">Net Salary Payable</div></div>
      <div style="text-align:left;"><span class="sal-net-val">${k($)}</span> <span style="font-size:13px;font-weight:700;margin-right:4px;">ريال سعودي</span></div>
    </div>

    <div class="sal-tafqeet-box">
      <strong>✍️ المبلغ كتابةً وتفقيطاً:</strong> <span style="color:#047857;font-weight:800;">فقط ${v} لا غير.</span>
    </div>

    <div class="sal-legal-box">
      <strong>📝 إقرار واستلام الموظف وبراءة ذمة:</strong>
      <p style="margin-top:2px;">
        أقر أنا الموظف الموضحة بياناتي أعلاه بأنني استلمت كامل صافي راتبي ومستحقاتي ومكافآتي عن شهر (<strong>${t}</strong>) الموضحة في هذا السند، ولا يحق لي المطالبة بأي مبالغ أخرى أو متأخرات عن هذه الفترة لدى الشركة، ويعد توقيعي أدناه إقراراً نهائياً بالاستلام وبراءة ذمة شاملة.
      </p>
    </div>

    <div class="sal-sigs">
      <div class="sal-sig-box">
        <div class="sal-sig-title">توقيع الموظف المستلم (المقر بالاستلام)</div>
        <div class="sal-sig-line">الاسم: ${e.name}</div>
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
      <div>تمت الطباعة آلياً بتاريخ: ${n}</div>
    </div>
  </div>
</body>
</html>
  `,f=window.open("","_blank");if(!f){window.showToast?.("يرجى السماح بالنوافذ المنبثقة لطباعة قسيمة الراتب","warning");return}f.document.open(),f.document.write(p),f.document.close(),setTimeout(()=>{try{f.focus(),f.print()}catch{}},450)};window.printAccountStatement=async()=>{if(!Y){window.showToast?.("لا توجد بيانات كشف حساب للطباعة","error");return}const{code:o,name:e,acc:t,relevant:n,fromDate:l,toDate:d,openingBalance:i,totalDr:m,totalCr:s,isDebit:b}=Y;let r={name:"شركة نظم الإمداد المتطورة",nameEn:"Modern Supply Systems Co.",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",logoUrl:""};try{const{doc:p,getDoc:f}=await L(async()=>{const{doc:w,getDoc:C}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:w,getDoc:C}},[]),[c,h]=await Promise.all([f(p(_,`companies/${N}/settings/company`)),f(p(_,`companies/${N}/settings/logo`))]);if(c.exists()){const w=c.data();r.name=w.name||w.companyName||r.name,r.nameEn=w.nameEn||w.legalName||r.nameEn,r.crNumber=w.crNumber||w.cr||r.crNumber,r.vatNumber=w.vatNumber||w.vat||r.vatNumber,r.phone=w.phone||r.phone,r.email=w.email||r.email,r.address=w.address?w.city?`${w.address} — ${w.city}`:w.address:r.address}h.exists()&&(r.logoUrl=h.data().dataUrl||h.data().logoUrl||"")}catch{}const y=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"}),g=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});let u=i,$=`
    <tr style="background:#f8fafc; font-style:italic; font-weight:bold;">
      <td colspan="3" style="padding:8px 12px;">🏁 ${l?`رصيد بداية الفترة (حتى ${l})`:"رصيد افتتاحي"}</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right; font-weight:800;">${k(Math.abs(i))} ر.س <span style="font-size:10px; color:#64748b;">(${i>=0?b?"مدين":"دائن":b?"دائن":"مدين"})</span></td>
    </tr>
  `;n.forEach((p,f)=>{const c=p._line.debit||0,h=p._line.credit||0;u+=b?c-h:h-c;const w=p._line?.note||p._line?.description||"",C=p.description||p.notes||"",D=w||C||"حركة قيد يومية",I=p.entryNumber||p.number||p.id||"—";$+=`
      <tr>
        <td style="text-align:center; font-family:monospace; color:#64748b;">${f+1}</td>
        <td style="font-family:monospace; white-space:nowrap;">${p.date||"—"}</td>
        <td>
          <div style="font-weight:700; color:#0f172a;">${D}</div>
          <div style="font-size:10px; color:#4338ca; font-family:monospace; margin-top:2px;">مرجع: #${I}</div>
        </td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#dc2626;">${c?k(c)+" ر.س":"—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#16a34a;">${h?k(h)+" ر.س":"—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:800; color:${u>=0?"#16a34a":"#dc2626"};">
          ${k(Math.abs(u))} ر.س <span style="font-size:10px; color:#64748b;">(${u>=0?b?"مدين":"دائن":b?"دائن":"مدين"})</span>
        </td>
      </tr>
    `}),n.length||($+='<tr><td colspan="6" style="text-align:center; padding:24px; color:#64748b; font-weight:600;">لا توجد أي حركات مالية مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>');const v=u>=0?b?"مدين":"دائن":b?"دائن":"مدين",x=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب — ${o} — ${e}</title>
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
      <h1>${r.name||"إدهام للمواد الغذائية"}</h1>
      <div class="sub">${r.nameEn||"Idham Foodstuff Trading Co."}</div>
      <div class="company-meta">
        ${r.crNumber?`<span>📋 س.ت: <strong>${r.crNumber}</strong></span>`:""}
        ${r.vatNumber?`<span>🧾 الرقم الضريبي: <strong>${r.vatNumber}</strong></span>`:""}
        ${r.phone?`<span>📞 الهاتف: <strong>${r.phone}</strong></span>`:""}
        ${r.address?`<span>📍 ${r.address}</span>`:""}
      </div>
    </div>
    <div class="company-logo">
      ${r.logoUrl?`<img src="${r.logoUrl}" alt="Logo">`:'<div class="company-logo-fallback">🏢</div>'}
    </div>
  </div>

  <!-- Statement Details Strip -->
  <div class="report-badge-strip">
    <div class="report-title-box">
      <h2>كشف حساب تفصيلي: ${e}</h2>
      <div class="code">كود الحساب: ${o} | تصنيف الحساب: ${t?.typeAr||t?.type||"حساب مالي"}</div>
      ${l||d?`
      <div style="margin-top:6px; font-size:12px; font-weight:800; color:#1e40af; background:#e0e7ff; display:inline-block; padding:4px 12px; border-radius:6px; border:1px solid #bfdbfe;">
        📅 الفترة المالية المحددة: من <strong>${l||"بداية النشاط"}</strong> إلى <strong>${d||"تاريخ اليوم"}</strong>
      </div>`:'<div style="margin-top:4px; font-size:11px; color:#64748b;">(كامل الحركات التاريخية منذ التأسيس)</div>'}
    </div>
    <div class="report-date-box">
      <div><strong>تاريخ الإصدار:</strong> ${y}</div>
      <div><strong>الوقت:</strong> ${g}</div>
    </div>
  </div>

  <!-- KPI Summary Cards -->
  <div class="kpi-grid">
    <div class="kpi-card opening">
      <div class="lbl">${l?"رصيد بداية الفترة":"الرصيد الافتتاحي"}</div>
      <div class="val">${k(Math.abs(i))} ر.س</div>
    </div>
    <div class="kpi-card debit">
      <div class="lbl">إجمالي حركات الفترة المدينة (+)</div>
      <div class="val">${k(m)} ر.س</div>
    </div>
    <div class="kpi-card credit">
      <div class="lbl">إجمالي حركات الفترة الدائنة (-)</div>
      <div class="val">${k(s)} ر.س</div>
    </div>
    <div class="kpi-card final">
      <div class="lbl">${d?"رصيد نهاية الفترة الصافي":"الرصيد الختامي الصافي"}</div>
      <div class="val">${k(Math.abs(u))} ر.س (${v})</div>
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
      ${$}
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
  <\/script>
</body>
</html>`,a=window.open("","_blank","width=900,height=950");a.document.write(x),a.document.close()};window.seedDefaultAccounts=async()=>{if(await window.showConfirm?.(`⚠️ سيتم حذف جميع الحسابات الحالية (${A.length} حساب) واستبدالها بشجرة الحسابات الكاملة (${K.length} حساب) وفق المعايير المحاسبية IFRS/SOCPA.

هل أنت متأكد؟`,"إعادة بناء شجرة الحسابات"))try{window.showToast?.("جارٍ حذف الحسابات القديمة...","info");const o=z.chartOfAccounts(),e=await j(o),{writeBatch:t}=await L(async()=>{const{writeBatch:s}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:s}},[]);let n=t(_),l=0;for(const s of e.docs)n.delete(s.ref),l++,l>=490&&(await n.commit(),n=t(_),l=0);l>0&&await n.commit(),window.showToast?.(`تم حذف ${e.size} حساب قديم`,"success"),window.showToast?.("جارٍ تحميل الحسابات الجديدة...","info");let d=t(_),i=0,m=0;for(const s of K){const b=U(o);d.set(b,{...s,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(s.type)?"debit":"credit"}),i++,m++,i>=400&&(await d.commit(),d=t(_),i=0)}i>0&&await d.commit(),window.showToast?.(`✅ تم تحميل ${m} حساب على 5 مستويات بنجاح`,"success"),O=new Set(["1","2","3","4","5"]),await M()}catch(o){console.error(o),window.showToast?.(o.message,"error")}};window.rebuildAccountBalances=async(o={})=>{if(!(!o.silent&&!await window.showConfirm?.(`سيتم إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية.

هذه العملية تصحح:
• الإيرادات التي تظهر صفرًا
• أي تعارض بين شجرة الحسابات وميزان المراجعة
• الأرصدة المفقودة بسبب فشل التحديث التلقائي

الأرصدة الحالية ستُستبدل بالأرصدة المحسوبة من القيود.`,"إعادة بناء أرصدة الحسابات"))){window.showToast?.("⏳ جارٍ قراءة القيود المحاسبية...","info");try{let s=function(a,p=new Set){const f=d[a];return!f||!f.parentCode||!d[f.parentCode]||p.has(a)?0:(p.add(a),1+s(f.parentCode,p))};const e=await j(z.journalEntries()),t={},n={};e.docs.forEach(a=>{const p=a.data();if(p.status&&p.status!=="posted")return;const f=p.lines||[];for(const c of f){const h=c.accountCode;if(!h)continue;const w=parseFloat(c.debit||0),C=parseFloat(c.credit||0);t[h]=(t[h]||0)+w,n[h]=(n[h]||0)+C}});const l=await j(z.chartOfAccounts());if(l.empty){window.showToast?.("⚠️ لا توجد حسابات في شجرة الحسابات","warn");return}const d={},i=[],m=new Set;l.docs.forEach(a=>{const p=a.data().parentCode;p&&m.add(p)}),l.docs.forEach(a=>{const p=a.data(),f=p.code;if(!f)return;const c=m.has(f),h={ref:a.ref,code:f,type:p.type,nodeType:p.nodeType,parentCode:p.parentCode||null,normalBalance:p.normalBalance||(["asset","expense"].includes(p.type)?"debit":"credit"),totalDebit:Math.round((t[f]||0)*100)/100,totalCredit:Math.round((n[f]||0)*100)/100,balance:0};if(!c&&(h.totalDebit>0||h.totalCredit>0)){const w=h.totalDebit-h.totalCredit,C=h.normalBalance==="credit"||["liability","equity","revenue"].includes(h.type);h.balance=Math.round((C?-w:w)*100)/100}d[f]=h,i.push(h)}),i.forEach(a=>{a.treeDepth=s(a.code)});const b=[...i].sort((a,p)=>p.treeDepth-a.treeDepth);for(const a of b)if(a.parentCode){const p=a.parentCode,f=d[p];f&&(f.totalDebit=Math.round((f.totalDebit+a.totalDebit)*100)/100,f.totalCredit=Math.round((f.totalCredit+a.totalCredit)*100)/100)}i.forEach(a=>{const p=a.totalDebit-a.totalCredit,f=a.normalBalance==="credit"||["liability","equity","revenue"].includes(a.type);a.balance=Math.round((f?-p:p)*100)/100});const r=400;let y=V(_),g=0,u=0,$=0;for(const a of i)y.update(a.ref,{balance:a.balance,totalDebit:a.totalDebit,totalCredit:a.totalCredit,updatedAt:W()}),a.balance!==0||a.totalDebit!==0||a.totalCredit!==0?u++:$++,g++,g>=r&&(await y.commit(),y=V(_),g=0);g>0&&await y.commit(),await xe(z.chartOfAccounts().path),await M(),window.showToast?.(`✅ تمت إعادة بناء الأرصدة بنجاح! تم تحديث ${u} حساب بأرصدة | ${$} حساب برصيد صفر`,"success");const v=new Set(i.map(a=>a.code)),x=Object.keys(t).filter(a=>!v.has(a));if(x.length>0){console.warn("[rebuildCoaBalances] Orphan codes found:",x);const a=Object.fromEntries(K.map(c=>[c.code,c])),p=x.filter(c=>a[c]),f=x.filter(c=>!a[c]);if(p.length>0){const c=V(_);for(const h of p){const w=a[h],C=U(z.chartOfAccounts(),h.replace(/\//g,"-"));c.set(C,{code:w.code,name:w.name,type:w.type,parentCode:w.parentCode,nodeType:w.nodeType,level:w.level,balance:t[h]-(n?.[h]||0),totalDebit:t[h]||0,totalCredit:n?.[h]||0,isActive:!0,autoAdded:!0,createdAt:W()},{merge:!0})}await c.commit(),window.showToast?.(`✅ تم إضافة ${p.length} حساب مفقود تلقائياً لشجرة الحسابات`,"success"),await M()}if(f.length>0){const c=V(_);for(const h of f){const w=h.split("-"),C=w.length-1,D=w.slice(0,-1).join("-")||null,T={1:"asset",2:"liability",3:"equity",4:"revenue",5:"expense"}[w[0]]||"expense",E=U(z.chartOfAccounts(),h.replace(/\//g,"-"));c.set(E,{code:h,name:`حساب ${h}`,type:T,parentCode:D,nodeType:"detail",level:C,balance:(t[h]||0)-(n?.[h]||0),totalDebit:t[h]||0,totalCredit:n?.[h]||0,isActive:!0,autoAdded:!0,needsRename:!0,createdAt:W()},{merge:!0})}await c.commit(),window.showToast?.(`⚠️ تم إنشاء ${f.length} حساب بأسماء مؤقتة: ${f.join(", ")} — يُرجى مراجعة أسمائها`,"warning"),await M()}}}catch(e){window.showToast?.("خطأ: "+e.message,"error")}}};window.fixCOAStructure=async()=>{if(!await window.showConfirm?.(`سيتم فحص شجرة الحسابات وتطبيق التصحيحات التالية دون حذف أي بيانات:

1. إضافة الحسابات المفقودة من الشجرة الافتراضية
2. تحويل 1-1-2-1-1 و 2-1-1-1-1 إلى نوع رئيسي (header)
3. ترقية حساب COGS من 5-1-2-1 إلى 5-1-8 إن وُجد
4. التحقق من وجود حسابات المردودات (4-1-2-1, 4-1-2-2)`,"تصحيح هيكل شجرة الحسابات"))return;const{writeBatch:e,setDoc:t,updateDoc:n}=await L(async()=>{const{writeBatch:v,setDoc:x,updateDoc:a}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:v,setDoc:x,updateDoc:a}},[]);window.showToast?.("جارٍ فحص شجرة الحسابات...","info");const l=z.chartOfAccounts(),d=await j(l),i={},m={};d.docs.forEach(v=>{const x=v.data();i[x.code]=!0,m[x.code]={id:v.id,ref:v.ref,data:x}});const s={added:[],updated:[],errors:[]},b=K.filter(v=>!i[v.code]);if(b.length>0){let v=e(_),x=0;for(const a of b){const p=U(l);v.set(p,{...a,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(a.type)?"debit":"credit"}),s.added.push(a.code+" — "+a.name),x++,x>=480&&(await v.commit(),v=e(_),x=0)}x>0&&await v.commit()}const r=["1-1-2-1-1","2-1-1-1-1"];for(const v of r){const x=m[v];if(x&&x.data.nodeType!=="header")try{await n(x.ref,{nodeType:"header"}),s.updated.push(`${v} → nodeType: header`)}catch(a){s.errors.push(`خطأ تحديث ${v}: ${a.message}`)}}const y=m["5-1-2-1"],g=m["5-1-8"];if(y&&!g)try{await n(y.ref,{code:"5-1-8",name:"تكلفة البضاعة المباعة",parentCode:"5-1",level:2,nodeType:"detail",type:"expense",normalBalance:"debit"}),s.updated.push("COGS: 5-1-2-1 → 5-1-8 (تكلفة البضاعة المباعة) بنفس المعرّف Firestore")}catch(v){s.errors.push("خطأ ترقية COGS: "+v.message)}else y&&g?s.updated.push("حساب COGS 5-1-8 موجود بالفعل — 5-1-2-1 سيظل كمرجع تاريخي"):!y&&!g&&s.updated.push("حساب COGS 5-1-8 تم إنشاؤه ضمن الحسابات المضافة");const u=[`✅ حسابات مضافة: ${s.added.length}`,`✏️ حسابات محدّثة: ${s.updated.length}`,s.errors.length?`⚠️ أخطاء: ${s.errors.length}`:null].filter(Boolean).join(" | ");window.showToast?.(u,s.errors.length?"warning":"success"),(s.added.length||s.updated.length)&&await M();const $=[s.added.length?`مضاف:
${s.added.slice(0,10).join(`
`)}${s.added.length>10?`
...`:""}`:null,s.updated.length?`محدّث:
${s.updated.join(`
`)}`:null,s.errors.length?`أخطاء:
${s.errors.join(`
`)}`:null].filter(Boolean).join(`

`);$&&setTimeout(()=>window.showConfirm?.(`تقرير تصحيح شجرة الحسابات:

${$}`,"نتائج التصحيح"),600),(s.added.length>0||s.updated.length>0)&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).catch(v=>console.warn("[auto-rebuild]",v)),1500))};window.backfillAllEntities=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع البنوك والعملاء والموردين والصناديق وربط أي منها لم يظهر بعد في شجرة الحسابات.

هذه العملية آمنة تمامًا ولن تؤثر على الأرصدة أو الحركات المالية.

الحسابات المرتبطة بالفعل سيتم تخطّيها تلقائيًا.`,"ربط الحسابات بشجرة الحسابات")){window.showToast?.("⏳ جارٍ فحص وربط الحسابات...","info");try{const e=await he(),t=[`✅ تم الربط: ${e.synced.length}`,`⏭️ متخطّى (مرتبط مسبقًا أو غير نشط): ${e.skipped.length}`,e.errors.length?`⚠️ أخطاء: ${e.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(t,e.errors.length?"warning":"success"),e.synced.length>0||e.errors.length>0){const n=[e.synced.length?`تم الربط:
${e.synced.join(`
`)}`:null,e.errors.length?`أخطاء:
${e.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير ربط الحسابات:

${n}`,"نتائج الربط"),600)}e.synced.length>0&&await M()}catch(e){window.showToast?.("خطأ: "+e.message,"error")}}};window.repairCustomerJournalEntries=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع القيود المحاسبية للمبيعات الآجلة والجزئية
وإعادة توجيه أسطرها من الحسابات العامة إلى حسابات العملاء الفردية.

هذه العملية:
• تصحح القيود القديمة التي ذهبت لحساب أب عام (1-1-2-1-1 أو 1-1-2-1-2)
• تربط بحساب العميل الفردي من خلال sourceId للفاتورة
• تُعيد بناء الأرصدة تلقائياً بعد الانتهاء

لا تحذف أي قيود — فقط تُحدّث أكواد الحسابات.`,"إصلاح قيود العملاء")){window.showToast?.("⏳ جارٍ فحص القيود المحاسبية...","info");try{const{db:e,COMPANY_ID:t}=await L(async()=>{const{db:T,COMPANY_ID:E}=await import("./index-CF9GFeRJ.js").then(S=>S.S);return{db:T,COMPANY_ID:E}},__vite__mapDeps([0,1])),{collection:n,getDocs:l,query:d,where:i,writeBatch:m}=await L(async()=>{const{collection:T,getDocs:E,query:S,where:B,writeBatch:R}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:T,getDocs:E,query:S,where:B,writeBatch:R}},[]),s=await l(n(e,`companies/${t}/chartOfAccounts`)),b={},r={};s.docs.forEach(T=>{const E=T.data();b[E.code]={id:T.id,...E},r[T.id]={id:T.id,...E}});const y=await l(n(e,`companies/${t}/customers`)),g={};y.docs.forEach(T=>{const E=T.data();E.accountCode&&E.accountId&&(g[T.id]={accountId:E.accountId,accountCode:E.accountCode,name:E.name||T.id,repId:E.repId||null})}),console.log(`[Repair] عدد العملاء ذوي حسابات فردية: ${Object.keys(g).length}`);const[u,$]=await Promise.all([l(n(e,`companies/${t}/salesInvoices`)),l(n(e,`companies/${t}/repInvoices`))]),v={},x=T=>{const E=T.data(),S={customerId:E.customerId||null,paymentMethod:E.paymentMethod||"cash"};v[T.id]=S,E.invoiceNumber&&(v[E.invoiceNumber]=S)};u.docs.forEach(x),$.docs.forEach(x),console.log(`[Repair] فواتير مُحمَّلة: ${u.size+$.size}`);const a=new Set(["1-1-2-1-1","1-1-2-1-2","1-1-2-2-1"]),p=new Set(["credit","deferred","آجل","partial","جزئي"]),f=await l(d(n(e,`companies/${t}/journalEntries`),i("sourceType","in",["salesInvoice","repSale","posSale","salesInvoices"])));console.log(`[Repair] قيود مبيعات للفحص: ${f.size}`);const c={fixed:[],skipped:[],errors:[]},h=400;let w=m(e),C=0;const D=async()=>{C>0&&(await w.commit(),w=m(e),C=0)};for(const T of f.docs){const E=T.data(),S=T.ref,B=E.sourceId||"",R=v[B];if(!R){c.skipped.push(`قيد ${E.entryNumber||T.id.slice(0,8)} — لم يُعثر على الفاتورة (${B})`);continue}const{customerId:Z,paymentMethod:ae}=R;if(!p.has((ae||"").toLowerCase())){c.skipped.push(`قيد ${E.entryNumber||T.id.slice(0,8)} — نقدي (${ae})`);continue}const q=Z?g[Z]:null;if(!q){c.skipped.push(`قيد ${E.entryNumber||T.id.slice(0,8)} — العميل ${Z||"غير محدد"} بلا حساب فردي`);continue}const fe=E.lines||[];let ne=!1;const ge=fe.map(H=>{const ue=H.accountCode||"",ve=H.accountId||"",de=r[ve];return a.has(ue)||de&&a.has(de.code)?(ne=!0,{...H,accountCode:q.accountCode,accountId:q.accountId,accountName:q.name}):H});if(!ne){c.skipped.push(`قيد ${E.entryNumber||T.id.slice(0,8)} — سليم بالفعل`);continue}try{w.update(S,{lines:ge}),C++,c.fixed.push(`قيد ${E.entryNumber||T.id.slice(0,8)} → ${q.name} (${q.accountCode})`),C>=h&&await D()}catch(H){c.errors.push(`قيد ${T.id.slice(0,8)}: ${H.message}`)}}await D();const I=[`✅ قيود مُصلَحة: ${c.fixed.length}`,`⏭️ متخطّى: ${c.skipped.length}`,c.errors.length?`⚠️ أخطاء: ${c.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(I,c.errors.length?"warning":"success"),c.fixed.length>0||c.errors.length>0){const T=[c.fixed.length?`مُصلَح:
${c.fixed.slice(0,30).join(`
`)}${c.fixed.length>30?`
... و${c.fixed.length-30} أخرى`:""}`:null,c.errors.length?`أخطاء:
${c.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير إصلاح قيود العملاء:

${T}`,"نتائج الإصلاح"),600)}c.fixed.length>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود المحدَّثة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).then(()=>window.showToast?.("✅ تمت إعادة بناء الأرصدة بنجاح — دفتر الأستاذ جاهز","success")).catch(T=>console.warn("[auto-rebuild]",T)),1500))}catch(e){console.error("[repairCustomerJournalEntries]",e),window.showToast?.("خطأ: "+e.message,"error")}}};window.zeroRetainedEarnings=async()=>{if(await window.showConfirm?.(`⚠️ هذه العملية خاصة بالسنة الأولى من التشغيل فقط.

سيتم تصفير رصيد حساب الأرباح المرحّلة (3-3) وتعيينه إلى صفر.

لأن هذه هي السنة الأولى، لا يوجد رصيد مرحّل سابق.

هل أنت متأكد؟`,"تصفير الأرباح المرحّلة (السنة الأولى)"))try{const t=(await j(z.chartOfAccounts())).docs.find(n=>n.data().code==="3-3");if(!t){window.showToast?.("لم يُعثر على حساب 3-3 (الأرباح المرحّلة) في شجرة الحسابات","error");return}await G(t.ref,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:W()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3) بنجاح","success"),await M()}catch(e){console.error("[zeroRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixInventoryVATInJEs=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع قيود المشتريات للبحث عن حسابات المخزون التي تُدين بالإجمالي شامل الضريبة
وتصحيحها لتكون بقيمة المبلغ قبل الضريبة فقط.

المعيار: إذا كان المدين للمخزون = إجمالي الدائن (شامل ضريبة) وهناك سطر ضريبة مدخلات منفصل،
سيتم تصحيح المخزون ليكون = إجمالي الدائن - قيمة الضريبة.

هذه العملية آمنة ولا تحذف أي بيانات.`,"تصحيح قيود مخزون المشتريات"))try{window.showToast?.("⏳ جارٍ فحص قيود المشتريات...","info");const{db:e,COMPANY_ID:t}=await L(async()=>{const{db:v,COMPANY_ID:x}=await import("./index-CF9GFeRJ.js").then(a=>a.S);return{db:v,COMPANY_ID:x}},__vite__mapDeps([0,1])),{collection:n,getDocs:l,query:d,where:i,writeBatch:m}=await L(async()=>{const{collection:v,getDocs:x,query:a,where:p,writeBatch:f}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:v,getDocs:x,query:a,where:p,writeBatch:f}},[]),s="1-1-4",b="1-1-5-2",r=await l(d(n(e,`companies/${t}/journalEntries`),i("sourceType","==","purchaseInvoice"))),y={fixed:0,skipped:0,errors:[]};let g=m(e),u=0;for(const v of r.docs){const a=v.data().lines||[],p=a.filter(B=>(B.accountCode||"").startsWith(s)&&(B.debit||0)>0),f=a.find(B=>B.accountCode===b&&(B.debit||0)>0),c=a.find(B=>(B.credit||0)>0);if(!p.length||!f||!c){y.skipped++;continue}const h=parseFloat(f.debit||0),w=parseFloat(c.credit||0),C=Math.round((w-h)*100)/100,D=p.reduce((B,R)=>B+parseFloat(R.debit||0),0),I=Math.round(w*100)/100,T=C;if(!(Math.abs(D-I)<.05&&h>.01)){y.skipped++;continue}const S=a.map(B=>(B.accountCode||"").startsWith(s)&&(B.debit||0)>0?{...B,debit:Math.round(C*100)/100}:B);try{g.update(v.ref,{lines:S}),u++,y.fixed++,u>=400&&(await g.commit(),g=m(e),u=0)}catch(B){y.errors.push(v.id.slice(0,8)+": "+B.message)}}u>0&&await g.commit();const $=`✅ تم تصحيح ${y.fixed} قيد | تخطّي ${y.skipped} | أخطاء: ${y.errors.length}`;window.showToast?.($,y.errors.length>0?"warning":"success"),y.fixed>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1500))}catch(e){console.error("[fixInventoryVATInJEs]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixRevenuesAndRetainedEarnings=async()=>{if(await window.showConfirm?.(`هذه العملية الشاملة تُصلح مشكلة ظهور الإيرادات صفراً:

الخطوة 1: التحقق من وجود حسابات الإيرادات (4-1-1 وما تحتها)
          وإنشاء أي حساب مفقود تلقائياً

الخطوة 2: تصفير حساب الأرباح المرحّلة (3-3)
          لأن هذه هي السنة الأولى من التشغيل

الخطوة 3: إعادة بناء جميع الأرصدة من القيود المحاسبية
          بعدها ستظهر الإيرادات صحيحة في الشجرة

⚠️ لا تحذف أي بيانات — فقط تُضيف وتُصحح`,"إصلاح الإيرادات وتصفير الأرباح المرحّلة"))try{window.showToast?.("⏳ الخطوة 1: فحص حسابات الإيرادات...","info");const e=[{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات المبيعات الموحدة",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1}],t=await j(z.chartOfAccounts()),n=new Set,l={};let d=null;t.docs.forEach(y=>{const g=y.data();g.code&&(n.add(g.code),l[g.code]={ref:y.ref,data:g}),g.code==="3-3"&&(d=y.ref)});const i=e.filter(y=>!n.has(y.code));let m=0;if(i.length>0){window.showToast?.(`⚙️ إنشاء ${i.length} حساب إيرادات مفقود...`,"info");const y=z.chartOfAccounts();let g=V(_),u=0;for(const $ of i){const v=U(y);g.set(v,{...$,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"credit"}),u++,m++,u>=400&&(await g.commit(),g=V(_),u=0)}u>0&&await g.commit(),window.showToast?.(`✅ تم إنشاء ${m} حساب إيرادات`,"success")}else window.showToast?.("✅ جميع حسابات الإيرادات موجودة","success");const s=l["4-1-1"];s&&s.data.nodeType==="header"&&(await G(s.ref,{nodeType:"detail"}),window.showToast?.("✅ تم تحويل حساب 4-1-1 إلى detail","info")),window.showToast?.("⏳ الخطوة 2: تصفير الأرباح المرحّلة (3-3)...","info"),(await j(z.chartOfAccounts())).docs.forEach(y=>{y.data().code==="3-3"&&(d=y.ref)}),d?(await G(d,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:W()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3)","success")):window.showToast?.("⚠️ لم يُعثر على حساب 3-3 — سيتم تجاهل هذه الخطوة","warn"),window.showToast?.("⏳ الخطوة 3: إعادة بناء الأرصدة من القيود...","info"),await new Promise(y=>setTimeout(y,800)),await window.rebuildAccountBalances?.({silent:!0}),d&&(await G(d,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:W()}),window.showToast?.("✅ تم تصفير الأرباح المرحّلة (3-3) نهائياً","success")),await M();const r=[m>0?`✅ حسابات مُنشأة: ${m}`:null,d?"✅ تم تصفير 3-3 نهائياً":null,"✅ تمت إعادة بناء جميع الأرصدة من القيود"].filter(Boolean).join(`
`);setTimeout(()=>window.showConfirm?.(`🎉 اكتملت عملية الإصلاح بنجاح!

${r}

الإيرادات ستظهر الآن في شجرة الحسابات.
تحقق من ميزان المراجعة للتأكد من التوازن.`,"اكتمل الإصلاح"),500)}catch(e){console.error("[fixRevenuesAndRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixRepSalesCOGS=async()=>{if(await window.showConfirm?.(`هذه الأداة تبحث عن قيود تكلفة المبيعات (salesCOGS) التي:

• جاءت من فاتورة بمخزن سيارة/مندوب
• لكن قيد التكلفة دائن المستودع الرئيسي (1-1-4-1-01) بدلاً من مخزن السيارة (1-1-4-1-02)

وتصحيحها تلقائياً. هل تريد المتابعة؟`,"تصحيح قيود تكلفة مبيعات السيارات"))try{window.showToast?.("⏳ جارٍ فحص الفواتير وقيود التكلفة...","info");const t=(await j(z.salesInvoices())).docs.map(d=>({id:d.id,...d.data()})).filter(d=>{const i=(d.warehouseName||d.warehouse||"").toLowerCase();return i.includes("سيارة")||i.includes("سياره")||i.includes("مندوب")||i.includes("مصطفى")||i.includes("علي")||i.includes("ناجي")});window.showToast?.(`📋 وُجدت ${t.length} فاتورة من مخازن السيارات`,"info");let n=0,l=0;for(const d of t){const i=await j(ce(z.journalEntries(),ie("sourceType","==","salesCOGS"),ie("sourceId","==",d.id)));for(const m of i.docs){const s=m.data().lines||[];let b=!1;const r=s.map(y=>y.accountCode==="1-1-4-1-01"&&y.credit>0?(b=!0,{...y,accountCode:"1-1-4-1-02",accountName:"مخزون سيارات التوزيع"}):y);b?(await G(m.ref,{lines:r}),n++):l++}}window.showToast?.(`✅ تم تصحيح ${n} قيد تكلفة | ${l} سليم`,"success"),n>0&&setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1e3)}catch(e){console.error("[fixRepSalesCOGS]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixMissingTransferJEs=async()=>{if(await window.showConfirm?.(`هذه الأداة تبحث عن التحويلات المخزنية (تم الاستلام) ولا يوجد لها قيد محاسبي أو قيودها غير صحيحة
وتُنشئ القيود أو تصححها تلقائياً.

هل تريد المتابعة؟`,"إنشاء وتصحيح قيود التحويلات"))try{window.showToast?.("⏳ جارٍ فحص وتصحيح التحويلات...","info");const{createJournalEntry:e}=await L(async()=>{const{createJournalEntry:x}=await import("./index-CF9GFeRJ.js").then(a=>a.T);return{createJournalEntry:x}},__vite__mapDeps([0,1])),{db:t,COMPANY_ID:n}=await L(async()=>{const{db:x,COMPANY_ID:a}=await import("./index-CF9GFeRJ.js").then(p=>p.S);return{db:x,COMPANY_ID:a}},__vite__mapDeps([0,1])),{collection:l,getDocs:d,query:i,where:m,doc:s,getDoc:b,deleteDoc:r}=await L(async()=>{const{collection:x,getDocs:a,query:p,where:f,doc:c,getDoc:h,deleteDoc:w}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:x,getDocs:a,query:p,where:f,doc:c,getDoc:h,deleteDoc:w}},[]);async function y(x){try{const a=await b(s(t,`companies/${n}/products`,x));if(a.exists()){const p=a.data(),f=parseFloat(p.averageCost||p.costPrice||p.purchasePrice||0);if(f>.001)return f;const c=parseFloat(p.salePrice||p.priceRetail||0);if(c>.001)return Math.round(c*.7*100)/100}}catch(a){console.warn("[getProductCost] failed for product:",x,a.message)}return 1}async function g(x,a){const p=/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(a||""),f=p?"1-1-4-1-02":"1-1-4-1";try{const c=l(t,`companies/${n}/chartOfAccounts`);if(x){const I=i(c,m("sourceEntityId","==",x)),T=await d(I);if(!T.empty){const E=T.docs[0].data();return{code:E.code,name:E.name,id:T.docs[0].id}}}const h=i(c,m("parentCode","==",f)),C=(await d(h)).docs.map(I=>({id:I.id,...I.data()})),D=(a||"").trim().toLowerCase();for(const I of C){const T=(I.name||"").toLowerCase();if(T===D||T.includes(D)||D.includes(T))return{code:I.code,name:I.name,id:I.id}}}catch(c){console.warn("[resolveWarehouseAccount] failed:",c.message)}return{code:p?"1-1-4-1-02":"1-1-4-1-01",name:p?"مخزون سيارات التوزيع":"مخزون المستودع الرئيسي",id:p?"1-1-4-1-02":"1-1-4-1-01"}}const u=await d(i(l(t,`companies/${n}/stockTransfers`),m("status","==","received")));let $=0,v=0;for(const x of u.docs){const a={id:x.id,...x.data()},p=await d(i(l(t,`companies/${n}/journalEntries`),m("sourceType","==","stockTransfer"),m("sourceId","==",a.id)));if(!p.empty){const f=p.docs[0],c=f.data(),h=c.lines&&c.lines.some(C=>C.accountCode==="1-1-4-1-02"),w=parseFloat(c.totalDebit||0)<15&&a.number==="TR-8951305";if(h||w)await r(f.ref),console.log(`[fixMissingTransferJEs] Deleted incorrect JE ${c.entryNumber} for ${a.number}`);else{v++;continue}}try{let f=0;for(const w of a.lines||[]){const C=parseFloat(w.costPrice||w.unitCost||w.averageCost||0)||await y(w.productId);f+=C*parseFloat(w.qty||0)}f<.001&&(f=(a.lines||[]).reduce((w,C)=>w+(C.qty||1),0));const c=await g(a.toWarehouseId,a.toWarehouseName),h=await g(a.fromWarehouseId,a.fromWarehouseName);await e({date:a.date||new Date().toISOString().slice(0,10),description:`تحويل مخزني ${a.number} — من ${a.fromWarehouseName} إلى ${a.toWarehouseName}`,lines:[{accountCode:c.code,accountName:c.name,accountId:c.id,debit:Math.round(f*100)/100,credit:0,note:`استلام مخزون — تحويل ${a.number}`},{accountCode:h.code,accountName:h.name,accountId:h.id,debit:0,credit:Math.round(f*100)/100,note:`صرف مخزون — تحويل ${a.number}`}],sourceType:"stockTransfer",sourceId:a.id,status:"posted",createdByName:"النظام — إصلاح تلقائي"}),$++}catch(f){console.warn(`[fixMissingTransferJEs] Failed ${a.number}:`,f.message)}}window.showToast?.(`✅ تم إنشاء/تصحيح ${$} قيد تحويل | ${v} موجودة مسبقاً وسليمة`,"success"),$>0&&setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1500)}catch(e){console.error("[fixMissingTransferJEs]",e),window.showToast?.("خطأ: "+e.message,"error")}};export{_e as render};
