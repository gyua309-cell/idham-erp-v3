const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DaYejt0r.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{a as B,o as ae,C as N,f as I,u as ne,_ as O,d as _}from"./index-DaYejt0r.js";import{b as ue}from"./coa-connector-kkbirhvw.js";import{getDocs as M,query as de,orderBy as fe,doc as G,writeBatch as H,serverTimestamp as V,updateDoc as W,where as oe}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const Q={asset:{label:"الأصول",code:"1",color:"#6366f1"},liability:{label:"الخصوم",code:"2",color:"#ef4444"},equity:{label:"حقوق الملكية",code:"3",color:"#10b981"},revenue:{label:"الإيرادات",code:"4",color:"#22c55e"},expense:{label:"المصروفات",code:"5",color:"#f59e0b"}},U=[{code:"1",name:"الأصول",type:"asset",parentCode:null,nodeType:"header",level:0},{code:"1-1",name:"الأصول المتداولة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-1-1",name:"النقدية وما في حكمها",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-1-1",name:"مجموعة الصندوق الرئيسي",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-1-2",name:"صندوق النثريات",type:"asset",parentCode:"1-1-1-1",nodeType:"detail",level:4},{code:"1-1-1-2",name:"صناديق المناديب",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3",name:"الحسابات البنكية",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3-1",name:"البنك الأهلي السعودي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-2",name:"بنك الراجحي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-3",name:"بنك الإنماء",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-2",name:"الذمم المدينة التجارية",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-2-1",name:"ذمم عملاء تجزئة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-1-1",name:"ذمم عملاء تجزئة — محلية",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-1-2",name:"ذمم عملاء تجزئة — مناديب",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-2",name:"ذمم عملاء جملة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-2-1",name:"ذمم عملاء جملة — شركات",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-2-2",name:"ذمم عملاء جملة — أفراد",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-3",name:"مخصص الديون المشكوك فيها",type:"asset",parentCode:"1-1-2",nodeType:"detail",level:3},{code:"1-1-3",name:"أوراق القبض",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-3-1",name:"أوراق قبض — شيكات آجلة",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-3-2",name:"أوراق قبض — كمبيالات",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-4",name:"المخزون",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-4-1",name:"مخزون المستودعات وسيارات التوزيع",type:"asset",parentCode:"1-1-4",nodeType:"header",level:3},{code:"1-1-4-1-01",name:"مخزون المستودع الرئيسي",type:"asset",parentCode:"1-1-4-1",nodeType:"detail",level:4},{code:"1-1-4-1-02",name:"مخزون سيارات التوزيع",type:"asset",parentCode:"1-1-4-1",nodeType:"header",level:4},{code:"1-1-4-3",name:"مخصص هالك وتالف المخزون",type:"asset",parentCode:"1-1-4",nodeType:"detail",level:3},{code:"1-1-5",name:"أصول متداولة أخرى",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-5-1",name:"مصروفات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-1-1",name:"إيجار مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-2",name:"تأمين مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-3",name:"اشتراكات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-2",name:"ضريبة القيمة المضافة — المدخلات",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-3",name:"سلف للموردين",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-4",name:"سلف للموظفين والمناديب",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-4-1",name:"سلف موظفين",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-4-2",name:"سلف مناديب",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-5",name:"ذمم مدينة أخرى",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-2",name:"الأصول الثابتة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-2-1",name:"السيارات والمركبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-1-1",name:"سيارات التوزيع — التكلفة",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-1-2",name:"م.خصم: إهلاك متراكم — سيارات",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-2",name:"معدات وآلات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-2-1",name:"معدات وآلات — التكلفة",type:"asset",parentCode:"1-2-2",nodeType:"header",level:3},{code:"1-2-2-1-1",name:"معدات تبريد وتخزين — التكلفة",type:"asset",parentCode:"1-2-2-1",nodeType:"detail",level:4},{code:"1-2-2-1-2",name:"معدات إنتاج وتشغيل — التكلفة",type:"asset",parentCode:"1-2-2-1",nodeType:"detail",level:4},{code:"1-2-2-2",name:"م.خصم: إهلاك متراكم — معدات",type:"asset",parentCode:"1-2-2",nodeType:"detail",level:3},{code:"1-2-3",name:"أثاث ومفروشات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-3-1",name:"أثاث ومفروشات — التكلفة",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-3-2",name:"م.خصم: إهلاك متراكم — أثاث",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-4",name:"أجهزة وحاسبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-4-1",name:"أجهزة وحاسبات — التكلفة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-4-2",name:"م.خصم: إهلاك متراكم — أجهزة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-5",name:"تحسينات على العقارات المستأجرة",type:"asset",parentCode:"1-2",nodeType:"detail",level:2},{code:"1-3",name:"الأصول غير الملموسة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-3-1",name:"برامج ورخص تشغيل",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-2",name:"تراخيص تجارية وسجلات",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-3",name:"م.خصم: استهلاك متراكم — أصول غير ملموسة",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"2",name:"الخصوم",type:"liability",parentCode:null,nodeType:"header",level:0},{code:"2-1",name:"الخصوم المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-1-1",name:"الذمم الدائنة التجارية",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-1-1",name:"ذمم موردون محليون",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-1-1",name:"ذمم موردون غذائية — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"header",level:4},{code:"2-1-1-1-2",name:"ذمم موردون تغليف — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"detail",level:4},{code:"2-1-1-2",name:"ذمم موردون استيراد",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-2-1",name:"ذمم موردون غذائية — استيراد",type:"liability",parentCode:"2-1-1-2",nodeType:"detail",level:4},{code:"2-1-2",name:"أوراق الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-2-1",name:"أوراق دفع — شيكات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-2-2",name:"أوراق دفع — كمبيالات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-3",name:"الضرائب والرسوم المستحقة",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-3-1",name:"ضريبة القيمة المضافة — المخرجات",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-2",name:"ضريبة الاستقطاع المستحقة",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-3",name:"ضريبة القيمة المضافة الصافية (للتسوية)",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-4",name:"المصروفات المستحقة الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-4-1",name:"رواتب مستحقة الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-2",name:"عمولات مناديب مستحقة",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-3",name:"إيجار مستحق الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-4",name:"مصروفات مستحقة أخرى",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-5",name:"مستحقات الموظفين والمناديب",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-5-1",name:"التأمينات الاجتماعية (GOSI) المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-5-2",name:"مكافأة نهاية الخدمة المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-6",name:"دفعات مقدمة من العملاء",type:"liability",parentCode:"2-1",nodeType:"detail",level:2},{code:"2-1-7",name:"قروض بنكية قصيرة الأجل",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-7-1",name:"تسهيلات ائتمانية جارية",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-1-7-2",name:"الجزء المتداول من قروض طويلة",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-2",name:"الخصوم غير المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-2-1",name:"قروض بنكية طويلة الأجل",type:"liability",parentCode:"2-2",nodeType:"header",level:2},{code:"2-2-1-1",name:"قرض بنكي — البنك الأهلي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-1-2",name:"قرض بنكي — الراجحي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-2",name:"التزامات عقود الإيجار التمويلي",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"2-2-3",name:"مخصص مكافأة نهاية الخدمة",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"3",name:"حقوق الملكية",type:"equity",parentCode:null,nodeType:"header",level:0},{code:"3-1",name:"رأس المال",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-1-1",name:"رأس المال المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-1-2",name:"رأس المال غير المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-2",name:"الاحتياطيات",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-2-1",name:"الاحتياطي النظامي",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-2-2",name:"الاحتياطي الاختياري",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-4",name:"صافي الربح / الخسارة للفترة",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"3-5",name:"مسحوبات الشريك / الملاك",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات مبيعات المواد الغذائية",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-1-1",name:"مبيعات التجزئة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-1-1",name:"مبيعات تجزئة — نقد",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-2",name:"مبيعات تجزئة — شبكة",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-3",name:"مبيعات تجزئة — آجل",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-2",name:"مبيعات الجملة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-2-1",name:"مبيعات جملة — فواتير",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-2-2",name:"مبيعات جملة — عروض أسعار مقبولة",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-3",name:"مبيعات نقطة البيع (POS)",type:"revenue",parentCode:"4-1-1",nodeType:"detail",level:3},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-2-1",name:"مردودات مبيعات — تجزئة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-2-2",name:"مردودات مبيعات — جملة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-3",name:"الخصم المسموح به (خصومات المبيعات)",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-3-1",name:"خصم تجاري ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-1-3-2",name:"خصم نقدي ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-2-1",name:"فوائد وأرباح بنكية",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-2",name:"أرباح بيع الأصول الثابتة",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-3",name:"إيرادات إيجار",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-4",name:"خصومات مكتسبة من الموردين",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-5",name:"إيرادات متنوعة أخرى",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"5",name:"المصروفات",type:"expense",parentCode:null,nodeType:"header",level:0},{code:"5-1",name:"إجمالي تكلفة المبيعات (COGS)",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-1-2",name:"مردودات المشتريات",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-3",name:"خصومات المشتريات المكتسبة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-4",name:"هالك وتالف المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-5",name:"فروق جرد المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-6",name:"رسوم استيراد وجمارك",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-8",name:"مصروف تكلفة البضاعة المباعة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-2",name:"مصروفات الموظفين والعمالة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-2-1",name:"رواتب الإدارة",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-1-1",name:"راتب المدير العام",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-2",name:"رواتب المحاسبين",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-3",name:"رواتب الإدارية",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-2",name:"رواتب الموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-3",name:"رواتب المناديب وسائقي التوزيع",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-4",name:"عمولات المبيعات والمناديب",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-5",name:"بدلات (سكن، مواصلات، طعام)",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-5-1",name:"بدل سكن",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-2",name:"بدل مواصلات",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-3",name:"بدل طعام",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-6",name:"التأمينات الاجتماعية (GOSI) — حصة صاحب العمل",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-7",name:"مكافأة نهاية الخدمة",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-8",name:"تدريب وتطوير الكوادر",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-9",name:"تأمين طبي للموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-3",name:"مصروفات التوزيع واللوجستيات",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-3-1",name:"وقود سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-2",name:"صيانة وإصلاح سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-3",name:"رسوم تسجيل ومرور السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-4",name:"تأمين السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-5",name:"شحن وتوزيع خارجي",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-6",name:"رسوم تخزين خارجية",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-4",name:"المصروفات الإدارية والعمومية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-4-1",name:"الإيجارات",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-1-1",name:"إيجار المستودع الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-2",name:"إيجار المكتب الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-3",name:"إيجار مستودعات فرعية",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-2",name:"الخدمات (كهرباء، مياه، غاز)",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-2-1",name:"فاتورة الكهرباء",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-2-2",name:"فاتورة المياه",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-3",name:"الاتصالات والإنترنت",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-3-1",name:"فاتورة الهاتف والاتصالات",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-3-2",name:"اشتراك الإنترنت",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-4",name:"مستلزمات مكتبية وقرطاسية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-5",name:"مستلزمات المستودع والتغليف",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-6",name:"تأمين البضائع والمستودع",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-7",name:"الرسوم القانونية والمهنية",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-7-1",name:"أتعاب محاسب قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-7-2",name:"أتعاب مستشار قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-8",name:"رسوم حكومية وتراخيص",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-8-1",name:"رسوم تجديد السجل التجاري",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-2",name:"رسوم البلدية وأمانات المدن",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-3",name:"رسوم وزارة التجارة والصناعة",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-9",name:"إعلانات وتسويق",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-9-1",name:"إعلانات رقمية وسوشيال ميديا",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-9-2",name:"طباعة ومواد ترويجية",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-10",name:"صيانة المعدات والأجهزة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-11",name:"تنظيف وصحة بيئية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-12",name:"أمن وحراسة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-13",name:"ضيافة واستقبال",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-14",name:"مصروفات أخرى متنوعة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-15",name:"مصروفات صيانة وتصليح المباني",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-16",name:"رسوم تراخيص البرمجيات والاشتراكات السحابية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-17",name:"مصروفات السيارات والانتقال والرحلات",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-18",name:"الرسوم والغرامات والمخالفات الحكومية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-19",name:"مصروفات التدريب وورش العمل للموظفين",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-20",name:"الاستشارات الفنية والتقنية والمهنية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-21",name:"هدايا ومساعدات ومساهمات اجتماعية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-22",name:"قرطاسية ومستلزمات مكتبية ومطبوعات ورق",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-23",name:"عمولات بوابات الدفع الإلكتروني والشبكة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-5",name:"المصروفات المالية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-5-1",name:"فوائد القروض البنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-2",name:"عمولات وخدمات بنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-3",name:"فوائد عقود الإيجار التمويلي",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-4",name:"خسائر فروق العملة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-5",name:"ديون معدومة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-6",name:"الإهلاك والاستهلاك",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-6-1",name:"إهلاك السيارات والمركبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-2",name:"إهلاك المعدات والآلات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-3",name:"إهلاك الأثاث والمفروشات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-4",name:"إهلاك الأجهزة والحاسبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-5",name:"استهلاك الأصول غير الملموسة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-6",name:"استهلاك التحسينات على العقارات المستأجرة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-7",name:"المخصصات والخسائر المحتملة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-7-1",name:"مصروف ديون مشكوك فيها",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-2",name:"مخصص هالك المخزون",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-3",name:"مخصصات أخرى",type:"expense",parentCode:"5-7",nodeType:"detail",level:2}];let E=[],z=new Set(["1","2","3","4","5"]),K="",J="",ie=!1;async function ke(t,e){t.innerHTML=ve(),await S(),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).catch(a=>console.warn("[auto-sync on load]",a)),2e3)}function ve(){return`
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
        ${Object.entries(Q).map(([t,e])=>`<option value="${t}">${e.label}</option>`).join("")}
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
            ${Object.entries(Q).map(([t,e])=>`<option value="${t}">${e.label}</option>`).join("")}
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
      <button class="btn btn-primary" onclick="window.printAccountStatement()"><i class="fas fa-print"></i> طباعة كشف الحساب</button>
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
  `}async function S(){try{if(E=(await M(B.chartOfAccounts())).docs.map(a=>{const i=a.data();return{id:a.id,...i,_rawBalance:i.balance||0,_rawDebit:i.totalDebit||0,_rawCredit:i.totalCredit||0}}).filter(a=>a.code!=="1-1-4-2"&&a.id!=="1-1-4-2"&&!(a.name&&a.name.includes("1-1-4-2"))),E.sort((a,i)=>(a.code||"").localeCompare(i.code||"",void 0,{numeric:!0})),!E.some(a=>a.code==="5-1-7")&&E.length>0)try{const a=B.chartOfAccounts();await ae(a,{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"debit"}),console.log("Auto-migrated Freight-In account (5-1-7)."),setTimeout(()=>S(),100);return}catch(a){console.error("Failed to auto-migrate Freight-In account:",a)}he(),R()}catch(t){document.getElementById("coa-tree").innerHTML=`<div class="coa-loading" style="color:var(--bad)">خطأ: ${t.message}</div>`}}function he(){const t=document.getElementById("coa-kpis");if(!t)return;const e=[{label:"الأصول",type:"asset",color:"#6366f1"},{label:"الخصوم",type:"liability",color:"#ef4444"},{label:"حقوق الملكية",type:"equity",color:"#10b981"},{label:"الإيرادات",type:"revenue",color:"#22c55e"},{label:"المصروفات",type:"expense",color:"#f59e0b"}];t.innerHTML=e.map(a=>{const i=E.filter(c=>c.type===a.type&&c.nodeType==="detail"&&c.isActive!==!1).reduce((c,y)=>c+(y.balance||0),0),s=Math.abs(i);return`
      <div class="coa-kpi">
        <div class="coa-kpi-label">${a.label}</div>
        <div class="coa-kpi-value" style="color:${a.color}">${I(s)}</div>
      </div>`}).join("")}function R(){const t=document.getElementById("coa-tree");if(!t)return;let e=E;if(ie||(e=e.filter(c=>c.isActive!==!1)),K&&(e=e.filter(c=>c.type===K)),J){const c=J.toLowerCase();e=e.filter(y=>(y.name||"").toLowerCase().includes(c)||(y.code||"").toLowerCase().includes(c))}if(!e.length){t.innerHTML='<div class="coa-loading">لا توجد حسابات</div>';return}const a={};e.forEach(c=>{const y=c.parentCode||"ROOT";(a[y]=a[y]||[]).push(c)}),ge(e);const i=[];(a.ROOT||a[""]||[]).sort(le).forEach(c=>ce(c,0,a,i)),t.innerHTML=i.join("")||'<div class="coa-loading">لا توجد حسابات مطابقة</div>'}function le(t,e){return t.code.localeCompare(e.code,void 0,{numeric:!0})}function ge(t){t.forEach(e=>{e.balance=e._rawBalance!==void 0?e._rawBalance:e.balance||0,e.totalDebit=e._rawDebit!==void 0?e._rawDebit:e.totalDebit||0,e.totalCredit=e._rawCredit!==void 0?e._rawCredit:e.totalCredit||0})}function ce(t,e,a,i,s){const c=(a[t.code]||[]).sort(le),y=c.length>0,f=z.has(t.code),l=Q[t.type]||{color:"#888",label:"—"},C=t.nodeType==="header"||y,T=t.isActive===!1,r=t.balance||0,v=t.totalDebit||0,b=t.totalCredit||0,$=y?`<button class="coa-toggle-btn ${f?"open":""}"
              onclick="event.stopPropagation();coaToggle('${t.code}')"
              title="${f?"طي":"فتح"}">
         <i class="fas fa-chevron-right" style="font-size:9px;"></i>
       </button>`:'<span class="coa-toggle-placeholder"></span>';i.push(`
    <div class="coa-row ${C?"header-row":""} lv${Math.min(e,4)} ${T?"inactive":""}"
         data-code="${t.code}">

      <div class="coa-cell-code" style="padding-right:${e*14}px">
        ${$}
        <span style="color:${l.color};margin-right:4px">${t.code}</span>
      </div>

      <div class="coa-cell-name">
        <span class="coa-node-dot" style="background:${l.color};opacity:${Math.max(.3,1-e*.15)}"></span>
        <span class="coa-name-txt" title="${t.name}">${t.name}</span>
        ${T?'<span style="font-size:9px;color:var(--text-3)">(معطّل)</span>':""}
      </div>

      <div class="coa-cell-type">
        <span class="coa-badge" style="background:${l.color}22;color:${l.color}">
          ${l.label}
        </span>
      </div>

      <div class="coa-cell-amount ${v?"amt-dr":"amt-z"}">${v?I(v):"—"}</div>
      <div class="coa-cell-amount ${b?"amt-cr":"amt-z"}">${b?I(b):"—"}</div>

      <div class="coa-cell-bal ${r>0?"bal-pos":r<0?"bal-neg":"amt-z"}">
        ${r?I(Math.abs(r)):"0.00"}
      </div>

      <div class="coa-cell-actions">
        <button class="coa-act-btn add"    title="إضافة فرعي"
                onclick="event.stopPropagation();openAddAccountModal('${t.code}')">
          <i class="fas fa-plus"></i>
        </button>
        <button class="coa-act-btn ledger" title="كشف الحساب"
                onclick="event.stopPropagation();openLedger('${t.id}','${t.code}','${(t.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-list-alt"></i>
        </button>
        <button class="coa-act-btn edit"   title="تعديل"
                onclick="event.stopPropagation();editAccount('${t.id}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="coa-act-btn del"    title="حذف نهائي"
                onclick="event.stopPropagation();deleteAccountConfirm('${t.id}','${(t.name||"").replace(/'/g,"\\'")}')">
          <i class="fas fa-trash"></i>
        </button>
        <button class="coa-act-btn deact"  title="${T?"تفعيل":"تعطيل"}"
                onclick="event.stopPropagation();toggleAccountActive('${t.id}','${(t.name||"").replace(/'/g,"\\'")}',${T})">
          <i class="fas fa-${T?"check-circle":"ban"}"></i>
        </button>
      </div>
    </div>
  `),y&&f&&c.forEach(u=>ce(u,e+1,a,i))}window.coaToggle=t=>{z.has(t)?z.delete(t):z.add(t),R()};window.coaExpandAll=()=>{E.forEach(t=>z.add(t.code)),R()};window.coaCollapseAll=()=>{z.clear(),R()};window.coaExpandLevel=t=>{z.clear(),E.filter(e=>(e.level||0)<t).forEach(e=>z.add(e.code)),R()};window.coaSearch=t=>{J=t.trim(),J?window.coaExpandAll():R()};window.coaFilterType=t=>{K=t,R()};window.coaToggleInactive=t=>{ie=t,R()};window.openAddAccountModal=function(t){document.getElementById("coa-edit-id").value="",document.getElementById("coa-code").value="",document.getElementById("coa-name").value="",document.getElementById("coa-opening").value="",document.getElementById("coa-desc").value="",document.getElementById("coa-node-type").value="detail",document.getElementById("coa-form-error").classList.add("hidden"),document.getElementById("coa-modal-title").textContent="إضافة حساب جديد";const e=document.getElementById("coa-parent");if(e.innerHTML='<option value="">بدون أب</option>'+E.map(i=>`<option value="${i.code}" ${i.code===t?"selected":""}>${i.code} — ${i.name}</option>`).join(""),t){const i=E.find(s=>s.code===t);i&&(document.getElementById("coa-type").value=i.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(i.type)?"debit":"credit"),se(t)}else{const i=document.getElementById("coa-code-preview-chip");i&&(i.textContent="حدد الحساب الأب أولاً",i.className="coa-code-preview")}const a=document.getElementById("coa-delete-btn");a&&(a.style.display="none"),openModal("coa-modal")};function se(t){const e=E.filter(s=>s.parentCode===t);let a;if(!e.length)a=`${t}-1`;else{const s=e.map(c=>parseInt(c.code.split("-").pop())||0);a=`${t}-${Math.max(...s)+1}`}document.getElementById("coa-code").value=a;const i=document.getElementById("coa-code-preview-chip");if(i){const s=E.find(c=>c.code===a);i.textContent=`📌 ${a}`,i.className=`coa-code-preview ${s?"invalid":"valid"}`,s&&(i.textContent+=" (مستخدم!)")}}window.coaTypeChanged=()=>{const t=document.getElementById("coa-type").value;document.getElementById("coa-normal-balance").value=["asset","expense"].includes(t)?"debit":"credit"};window.coaParentChanged=()=>{const t=document.getElementById("coa-parent").value;if(t){se(t);const e=E.find(a=>a.code===t);e&&!document.getElementById("coa-edit-id").value&&(document.getElementById("coa-type").value=e.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(e.type)?"debit":"credit")}};window.editAccount=t=>{const e=E.find(c=>c.id===t);if(!e)return;document.getElementById("coa-edit-id").value=t,document.getElementById("coa-code").value=e.code,document.getElementById("coa-name").value=e.name,document.getElementById("coa-type").value=e.type,document.getElementById("coa-opening").value=e.openingBalance||"",document.getElementById("coa-desc").value=e.description||"",document.getElementById("coa-node-type").value=e.nodeType||"detail",document.getElementById("coa-normal-balance").value=e.normalBalance||"debit",document.getElementById("coa-modal-title").textContent=`تعديل: ${e.name}`,document.getElementById("coa-form-error").classList.add("hidden");const a=document.getElementById("coa-parent");a.innerHTML='<option value="">بدون أب (مستوى رئيسي)</option>'+E.filter(c=>c.id!==t).map(c=>`<option value="${c.code}" ${c.code===e.parentCode?"selected":""}>${c.code} — ${c.name}</option>`).join("");const i=document.getElementById("coa-delete-btn");i&&(i.style.display="inline-flex");const s=document.getElementById("coa-code-preview-chip");s&&(s.textContent=`📌 ${e.code} (الكود الحالي)`,s.className="coa-code-preview valid"),openModal("coa-modal")};window.saveAccount=async()=>{const t=document.getElementById("coa-form-error");t.classList.add("hidden");const e=document.getElementById("coa-edit-id").value,a=document.getElementById("coa-code").value.trim(),i=document.getElementById("coa-name").value.trim(),s=document.getElementById("coa-type").value,c=document.getElementById("coa-parent").value||null,y=document.getElementById("coa-node-type").value,f=document.getElementById("coa-normal-balance").value,l=parseFloat(document.getElementById("coa-opening").value)||0,C=document.getElementById("coa-desc").value.trim();if(!a||!i){t.textContent="الكود والاسم مطلوبان",t.classList.remove("hidden");return}if(!e){const b=E.find($=>$.code===a);if(b){t.textContent=`الكود ${a} موجود (${b.name})`,t.classList.remove("hidden");return}}const T=c?c.split("-").length:0,r={code:a,name:i,type:s,parentCode:c,nodeType:y,normalBalance:f,openingBalance:l,description:C,level:T,balance:l,totalDebit:0,totalCredit:0,isActive:!0,companyId:N},v=document.getElementById("coa-save-btn");v.disabled=!0,v.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';try{e?(await ne("chartOfAccounts",e,r),window.showToast?.("تم التحديث","success")):(await ae(B.chartOfAccounts(),r),window.showToast?.("تمت الإضافة","success")),closeModal("coa-modal"),await S()}catch(b){t.textContent=b.message,t.classList.remove("hidden")}finally{v.disabled=!1,v.innerHTML='<i class="fas fa-save"></i> حفظ الحساب'}};window.toggleAccountActive=async(t,e,a)=>{const i=a?"تفعيل":"تعطيل";if(await window.showConfirm?.(`${i} الحساب "${e}"؟`,i)){if(!a){const s=E.find(y=>y.id===t);if(E.filter(y=>y.parentCode===s?.code&&y.isActive!==!1).length){window.showToast?.("لا يمكن تعطيل حساب له حسابات فرعية نشطة","error");return}}try{await ne("chartOfAccounts",t,{isActive:a}),window.showToast?.(`تم ${i} الحساب`,"success"),await S()}catch(s){window.showToast?.(s.message,"error")}}};window.deleteAccountConfirm=async(t,e)=>{const a=E.find(s=>s.id===t);if(!a)return;const i=E.filter(s=>s.parentCode===a.code);if(i.length){window.showToast?.(`لا يمكن حذف "${e}" لأن له ${i.length} حساب فرعي. يجب حذف الفروع أولاً.`,"error");return}if(await window.showConfirm?.(`⚠️ سيتم حذف الحساب "${a.code} — ${e}" نهائياً.

تأكد أن لا توجد قيود مرتبطة به قبل الحذف.`,"حذف الحساب نهائياً"))try{const{deleteDoc:s,doc:c}=await O(async()=>{const{deleteDoc:y,doc:f}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{deleteDoc:y,doc:f}},[]);await s(c(_,`companies/${N}/chartOfAccounts`,t)),window.showToast?.(`✅ تم حذف الحساب "${e}" نهائياً`,"success"),await S()}catch(s){window.showToast?.(s.message,"error")}};window.deleteAccount=async()=>{const t=document.getElementById("coa-edit-id").value;if(!t)return;const e=E.find(a=>a.id===t);e&&(closeModal("coa-modal"),await deleteAccountConfirm(t,e.name))};let X=null;window.openLedger=async(t,e,a)=>{document.getElementById("ledger-title").textContent=`كشف حساب: ${e} — ${a}`;const i=document.getElementById("ledger-body");i.innerHTML='<div class="coa-loading"><i class="fas fa-spinner fa-spin"></i></div>',openModal("coa-ledger-modal");try{const s=de(B.journalEntries(),fe("date")),y=(await M(s)).docs.map(o=>({id:o.id,...o.data()})),f=[];y.forEach(o=>{(o.lines||[]).forEach(d=>{(d.accountCode===e||d.accountId===t)&&f.push({...o,_line:d})})});const l=E.find(o=>o.id===t),C=l?.openingBalance||0;let T=C;const r=l?.normalBalance!=="credit",v=f.reduce((o,d)=>o+(d._line.debit||0),0),b=f.reduce((o,d)=>o+(d._line.credit||0),0);X={id:t,code:e,name:a,acc:l,relevant:f,openingBalance:C,running:r?C+v-b:C+b-v,totalDr:v,totalCr:b,isDebit:r};let $=`<tr style="background:var(--bg-2); font-style:italic; font-weight:700;">
      <td colspan="3" style="padding:10px 14px;">🏁 رصيد افتتاحي</td>
      <td class="mono" style="text-align:right;">—</td>
      <td class="mono" style="text-align:right;">—</td>
      <td class="mono" style="text-align:right; font-weight:800; color:var(--text-0);">${I(C)}</td>
    </tr>`,u=C;f.forEach((o,d)=>{const p=o._line.debit||0,m=o._line.credit||0;u+=r?p-m:m-p;const n=o._line?.note||o._line?.description||"",g=o.description||o.notes||"",w=n||g||"حركة قيود يومية",k=o.entryNumber||o.number||o.id||"—";$+=`<tr>
        <td class="mono" style="font-size:11px; color:var(--text-2); text-align:center;">${d+1}</td>
        <td class="mono" style="font-size:11px; white-space:nowrap;">${o.date||""}</td>
        <td>
          <div style="font-weight:700; color:var(--text-0); line-height:1.4;">${w}</div>
          <div style="font-size:10.5px; color:var(--brand); font-family:monospace; margin-top:2px;">#${k}</div>
        </td>
        <td class="mono" style="color:var(--bad); text-align:right; font-weight:700;">${p?I(p):"—"}</td>
        <td class="mono" style="color:var(--good); text-align:right; font-weight:700;">${m?I(m):"—"}</td>
        <td class="mono" style="text-align:right; font-weight:800; color:${u>=0?"var(--good)":"var(--bad)"}">
          ${I(Math.abs(u))} <span style="font-size:10px;">${u>=0?r?"مدين":"دائن":r?"دائن":"مدين"}</span>
        </td>
      </tr>`}),f.length||($='<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة لهذا الحساب</td></tr>'),i.innerHTML=`
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px;">
        <div class="coa-kpi">
          <div class="coa-kpi-label">الرصيد الافتتاحي</div>
          <div class="coa-kpi-value" style="color:var(--text-1);">${I(C)}</div>
        </div>
        <div class="coa-kpi">
          <div class="coa-kpi-label">إجمالي المدين (+)</div>
          <div class="coa-kpi-value" style="color:var(--bad);">${I(v)}</div>
        </div>
        <div class="coa-kpi">
          <div class="coa-kpi-label">إجمالي الدائن (-)</div>
          <div class="coa-kpi-value" style="color:var(--good);">${I(b)}</div>
        </div>
        <div class="coa-kpi">
          <div class="coa-kpi-label">الرصيد الختامي الصافي</div>
          <div class="coa-kpi-value" style="color:var(--brand);">${I(Math.abs(u))} <span style="font-size:11px;">${u>=0?r?"مدين":"دائن":r?"دائن":"مدين"}</span></div>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table class="ledger-table" style="width:100%;">
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">#</th>
              <th style="width:95px;">التاريخ</th>
              <th>البيان والتفاصيل</th>
              <th style="width:110px; text-align:right; color:var(--bad);">مدين (+)</th>
              <th style="width:110px; text-align:right; color:var(--good);">دائن (-)</th>
              <th style="width:130px; text-align:right;">الرصيد الجاري</th>
            </tr>
          </thead>
          <tbody>${$}</tbody>
        </table>
      </div>`}catch(s){i.innerHTML=`<div class="coa-loading" style="color:var(--bad)">خطأ: ${s.message}</div>`}};window.printAccountStatement=async()=>{if(!X){window.showToast?.("لا توجد بيانات كشف حساب للطباعة","error");return}const{code:t,name:e,acc:a,relevant:i,openingBalance:s,totalDr:c,totalCr:y,isDebit:f}=X;let l={name:"شركة نظم الإمداد الحديثة",nameEn:"Modern Supply Systems Co.",crNumber:"4700123180",vatNumber:"312448150500003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 — الشارع: عامر الشعبي — ينبع — 13315",logoUrl:""};try{const{doc:o,getDoc:d}=await O(async()=>{const{doc:n,getDoc:g}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:n,getDoc:g}},[]),[p,m]=await Promise.all([d(o(_,`companies/${N}/settings/company`)),d(o(_,`companies/${N}/settings/logo`))]);if(p.exists()){const n=p.data();l.name=n.name||n.companyName||l.name,l.nameEn=n.nameEn||n.legalName||l.nameEn,l.crNumber=n.crNumber||n.cr||l.crNumber,l.vatNumber=n.vatNumber||n.vat||l.vatNumber,l.phone=n.phone||l.phone,l.email=n.email||l.email,l.address=n.address?n.city?`${n.address} — ${n.city}`:n.address:l.address}m.exists()&&(l.logoUrl=m.data().dataUrl||m.data().logoUrl||"")}catch{}const C=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"}),T=new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});let r=s,v=`
    <tr style="background:#f8fafc; font-style:italic; font-weight:bold;">
      <td colspan="3" style="padding:8px 12px;">🏁 رصيد افتتاحي</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right;">—</td>
      <td style="text-align:right; font-weight:800;">${I(s)} ر.س</td>
    </tr>
  `;i.forEach((o,d)=>{const p=o._line.debit||0,m=o._line.credit||0;r+=f?p-m:m-p;const n=o._line?.note||o._line?.description||"",g=o.description||o.notes||"",w=n||g||"حركة قيد يومية",k=o.entryNumber||o.number||o.id||"—";v+=`
      <tr>
        <td style="text-align:center; font-family:monospace; color:#64748b;">${d+1}</td>
        <td style="font-family:monospace; white-space:nowrap;">${o.date||"—"}</td>
        <td>
          <div style="font-weight:700; color:#0f172a;">${w}</div>
          <div style="font-size:10px; color:#4338ca; font-family:monospace; margin-top:2px;">مرجع: #${k}</div>
        </td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#dc2626;">${p?I(p)+" ر.س":"—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:700; color:#16a34a;">${m?I(m)+" ر.س":"—"}</td>
        <td style="text-align:right; font-family:monospace; font-weight:800; color:${r>=0?"#16a34a":"#dc2626"};">
          ${I(Math.abs(r))} ر.س <span style="font-size:10px; color:#64748b;">(${r>=0?f?"مدين":"دائن":f?"دائن":"مدين"})</span>
        </td>
      </tr>
    `});const b=r>=0?f?"مدين":"دائن":f?"دائن":"مدين",$=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب — ${t} — ${e}</title>
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
      <h1>${l.name||"إدهام للمواد الغذائية"}</h1>
      <div class="sub">${l.nameEn||"Idham Foodstuff Trading Co."}</div>
      <div class="company-meta">
        ${l.crNumber?`<span>📋 س.ت: <strong>${l.crNumber}</strong></span>`:""}
        ${l.vatNumber?`<span>🧾 الرقم الضريبي: <strong>${l.vatNumber}</strong></span>`:""}
        ${l.phone?`<span>📞 الهاتف: <strong>${l.phone}</strong></span>`:""}
        ${l.address?`<span>📍 ${l.address}</span>`:""}
      </div>
    </div>
    <div class="company-logo">
      ${l.logoUrl?`<img src="${l.logoUrl}" alt="Logo">`:'<div class="company-logo-fallback">🏢</div>'}
    </div>
  </div>

  <!-- Statement Details Strip -->
  <div class="report-badge-strip">
    <div class="report-title-box">
      <h2>كشف حساب تفصيلي: ${e}</h2>
      <div class="code">كود الحساب: ${t} | تصنيف الحساب: ${a?.typeAr||a?.type||"حساب مالي"}</div>
    </div>
    <div class="report-date-box">
      <div><strong>تاريخ الإصدار:</strong> ${C}</div>
      <div><strong>الوقت:</strong> ${T}</div>
    </div>
  </div>

  <!-- KPI Summary Cards -->
  <div class="kpi-grid">
    <div class="kpi-card opening">
      <div class="lbl">الرصيد الافتتاحي</div>
      <div class="val">${I(s)} ر.س</div>
    </div>
    <div class="kpi-card debit">
      <div class="lbl">إجمالي الحركات المدينة (+)</div>
      <div class="val">${I(c)} ر.س</div>
    </div>
    <div class="kpi-card credit">
      <div class="lbl">إجمالي الحركات الدائنة (-)</div>
      <div class="val">${I(y)} ر.س</div>
    </div>
    <div class="kpi-card final">
      <div class="lbl">الرصيد النهائي الصافي</div>
      <div class="val">${I(Math.abs(r))} ر.س (${b})</div>
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
      ${v}
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
</html>`,u=window.open("","_blank","width=900,height=950");u.document.write($),u.document.close()};window.seedDefaultAccounts=async()=>{if(await window.showConfirm?.(`⚠️ سيتم حذف جميع الحسابات الحالية (${E.length} حساب) واستبدالها بشجرة الحسابات الكاملة (${U.length} حساب) وفق المعايير المحاسبية IFRS/SOCPA.

هل أنت متأكد؟`,"إعادة بناء شجرة الحسابات"))try{window.showToast?.("جارٍ حذف الحسابات القديمة...","info");const t=B.chartOfAccounts(),e=await M(t),{writeBatch:a}=await O(async()=>{const{writeBatch:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:l}},[]);let i=a(_),s=0;for(const l of e.docs)i.delete(l.ref),s++,s>=490&&(await i.commit(),i=a(_),s=0);s>0&&await i.commit(),window.showToast?.(`تم حذف ${e.size} حساب قديم`,"success"),window.showToast?.("جارٍ تحميل الحسابات الجديدة...","info");let c=a(_),y=0,f=0;for(const l of U){const C=G(t);c.set(C,{...l,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(l.type)?"debit":"credit"}),y++,f++,y>=400&&(await c.commit(),c=a(_),y=0)}y>0&&await c.commit(),window.showToast?.(`✅ تم تحميل ${f} حساب على 5 مستويات بنجاح`,"success"),z=new Set(["1","2","3","4","5"]),await S()}catch(t){console.error(t),window.showToast?.(t.message,"error")}};window.rebuildAccountBalances=async(t={})=>{if(!(!t.silent&&!await window.showConfirm?.(`سيتم إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية.

هذه العملية تصحح:
• الإيرادات التي تظهر صفرًا
• أي تعارض بين شجرة الحسابات وميزان المراجعة
• الأرصدة المفقودة بسبب فشل التحديث التلقائي

الأرصدة الحالية ستُستبدل بالأرصدة المحسوبة من القيود.`,"إعادة بناء أرصدة الحسابات"))){window.showToast?.("⏳ جارٍ قراءة القيود المحاسبية...","info");try{const e=await M(B.journalEntries()),a={},i={};e.docs.forEach(o=>{const d=o.data();if(d.status&&d.status!=="posted")return;const p=d.lines||[];for(const m of p){const n=m.accountCode;if(!n)continue;const g=parseFloat(m.debit||0),w=parseFloat(m.credit||0);a[n]=(a[n]||0)+g,i[n]=(i[n]||0)+w}});const s=await M(B.chartOfAccounts());if(s.empty){window.showToast?.("⚠️ لا توجد حسابات في شجرة الحسابات","warn");return}const c={},y=[],f=new Set;s.docs.forEach(o=>{const d=o.data().parentCode;d&&f.add(d)}),s.docs.forEach(o=>{const d=o.data(),p=d.code;if(!p)return;const m=f.has(p),n={ref:o.ref,code:p,type:d.type,nodeType:d.nodeType,parentCode:d.parentCode||null,normalBalance:d.normalBalance||(["asset","expense"].includes(d.type)?"debit":"credit"),totalDebit:Math.round((a[p]||0)*100)/100,totalCredit:Math.round((i[p]||0)*100)/100,balance:0};if(!m&&(n.totalDebit>0||n.totalCredit>0)){const g=n.totalDebit-n.totalCredit,w=n.normalBalance==="credit"||["liability","equity","revenue"].includes(n.type);n.balance=Math.round((w?-g:g)*100)/100}c[p]=n,y.push(n)});const l=[...y].sort((o,d)=>{const p=(o.code.match(/-/g)||[]).length;return(d.code.match(/-/g)||[]).length-p});for(const o of l)if(o.parentCode){const d=o.parentCode,p=c[d];p&&(p.totalDebit=Math.round((p.totalDebit+o.totalDebit)*100)/100,p.totalCredit=Math.round((p.totalCredit+o.totalCredit)*100)/100)}y.forEach(o=>{const d=o.totalDebit-o.totalCredit,p=o.normalBalance==="credit"||["liability","equity","revenue"].includes(o.type);o.balance=Math.round((p?-d:d)*100)/100});const C=400;let T=H(_),r=0,v=0,b=0;for(const o of y)T.update(o.ref,{balance:o.balance,totalDebit:o.totalDebit,totalCredit:o.totalCredit,updatedAt:V()}),o.balance!==0||o.totalDebit!==0||o.totalCredit!==0?v++:b++,r++,r>=C&&(await T.commit(),T=H(_),r=0);r>0&&await T.commit(),await S(),window.showToast?.(`✅ تمت إعادة بناء الأرصدة بنجاح! تم تحديث ${v} حساب بأرصدة | ${b} حساب برصيد صفر`,"success");const $=new Set(y.map(o=>o.code)),u=Object.keys(a).filter(o=>!$.has(o));if(u.length>0){console.warn("[rebuildCoaBalances] Orphan codes found:",u);const o=Object.fromEntries(U.map(m=>[m.code,m])),d=u.filter(m=>o[m]),p=u.filter(m=>!o[m]);if(d.length>0){const m=H(_);for(const n of d){const g=o[n],w=G(B.chartOfAccounts(),n.replace(/\//g,"-"));m.set(w,{code:g.code,name:g.name,type:g.type,parentCode:g.parentCode,nodeType:g.nodeType,level:g.level,balance:a[n]-(i?.[n]||0),totalDebit:a[n]||0,totalCredit:i?.[n]||0,isActive:!0,autoAdded:!0,createdAt:V()},{merge:!0})}await m.commit(),window.showToast?.(`✅ تم إضافة ${d.length} حساب مفقود تلقائياً لشجرة الحسابات`,"success"),await S()}if(p.length>0){const m=H(_);for(const n of p){const g=n.split("-"),w=g.length-1,k=g.slice(0,-1).join("-")||null,D={1:"asset",2:"liability",3:"equity",4:"revenue",5:"expense"}[g[0]]||"expense",h=G(B.chartOfAccounts(),n.replace(/\//g,"-"));m.set(h,{code:n,name:`حساب ${n}`,type:D,parentCode:k,nodeType:"detail",level:w,balance:(a[n]||0)-(i?.[n]||0),totalDebit:a[n]||0,totalCredit:i?.[n]||0,isActive:!0,autoAdded:!0,needsRename:!0,createdAt:V()},{merge:!0})}await m.commit(),window.showToast?.(`⚠️ تم إنشاء ${p.length} حساب بأسماء مؤقتة: ${p.join(", ")} — يُرجى مراجعة أسمائها`,"warning"),await S()}}}catch(e){window.showToast?.("خطأ: "+e.message,"error")}}};window.fixCOAStructure=async()=>{if(!await window.showConfirm?.(`سيتم فحص شجرة الحسابات وتطبيق التصحيحات التالية دون حذف أي بيانات:

1. إضافة الحسابات المفقودة من الشجرة الافتراضية
2. تحويل 1-1-2-1-1 و 2-1-1-1-1 إلى نوع رئيسي (header)
3. ترقية حساب COGS من 5-1-2-1 إلى 5-1-8 إن وُجد
4. التحقق من وجود حسابات المردودات (4-1-2-1, 4-1-2-2)`,"تصحيح هيكل شجرة الحسابات"))return;const{writeBatch:e,setDoc:a,updateDoc:i}=await O(async()=>{const{writeBatch:u,setDoc:o,updateDoc:d}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:u,setDoc:o,updateDoc:d}},[]);window.showToast?.("جارٍ فحص شجرة الحسابات...","info");const s=B.chartOfAccounts(),c=await M(s),y={},f={};c.docs.forEach(u=>{const o=u.data();y[o.code]=!0,f[o.code]={id:u.id,ref:u.ref,data:o}});const l={added:[],updated:[],errors:[]},C=U.filter(u=>!y[u.code]);if(C.length>0){let u=e(_),o=0;for(const d of C){const p=G(s);u.set(p,{...d,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(d.type)?"debit":"credit"}),l.added.push(d.code+" — "+d.name),o++,o>=480&&(await u.commit(),u=e(_),o=0)}o>0&&await u.commit()}const T=["1-1-2-1-1","2-1-1-1-1"];for(const u of T){const o=f[u];if(o&&o.data.nodeType!=="header")try{await i(o.ref,{nodeType:"header"}),l.updated.push(`${u} → nodeType: header`)}catch(d){l.errors.push(`خطأ تحديث ${u}: ${d.message}`)}}const r=f["5-1-2-1"],v=f["5-1-8"];if(r&&!v)try{await i(r.ref,{code:"5-1-8",name:"تكلفة البضاعة المباعة",parentCode:"5-1",level:2,nodeType:"detail",type:"expense",normalBalance:"debit"}),l.updated.push("COGS: 5-1-2-1 → 5-1-8 (تكلفة البضاعة المباعة) بنفس المعرّف Firestore")}catch(u){l.errors.push("خطأ ترقية COGS: "+u.message)}else r&&v?l.updated.push("حساب COGS 5-1-8 موجود بالفعل — 5-1-2-1 سيظل كمرجع تاريخي"):!r&&!v&&l.updated.push("حساب COGS 5-1-8 تم إنشاؤه ضمن الحسابات المضافة");const b=[`✅ حسابات مضافة: ${l.added.length}`,`✏️ حسابات محدّثة: ${l.updated.length}`,l.errors.length?`⚠️ أخطاء: ${l.errors.length}`:null].filter(Boolean).join(" | ");window.showToast?.(b,l.errors.length?"warning":"success"),(l.added.length||l.updated.length)&&await S();const $=[l.added.length?`مضاف:
${l.added.slice(0,10).join(`
`)}${l.added.length>10?`
...`:""}`:null,l.updated.length?`محدّث:
${l.updated.join(`
`)}`:null,l.errors.length?`أخطاء:
${l.errors.join(`
`)}`:null].filter(Boolean).join(`

`);$&&setTimeout(()=>window.showConfirm?.(`تقرير تصحيح شجرة الحسابات:

${$}`,"نتائج التصحيح"),600),(l.added.length>0||l.updated.length>0)&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).catch(u=>console.warn("[auto-rebuild]",u)),1500))};window.backfillAllEntities=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع البنوك والعملاء والموردين والصناديق وربط أي منها لم يظهر بعد في شجرة الحسابات.

هذه العملية آمنة تمامًا ولن تؤثر على الأرصدة أو الحركات المالية.

الحسابات المرتبطة بالفعل سيتم تخطّيها تلقائيًا.`,"ربط الحسابات بشجرة الحسابات")){window.showToast?.("⏳ جارٍ فحص وربط الحسابات...","info");try{const e=await ue(),a=[`✅ تم الربط: ${e.synced.length}`,`⏭️ متخطّى (مرتبط مسبقًا أو غير نشط): ${e.skipped.length}`,e.errors.length?`⚠️ أخطاء: ${e.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(a,e.errors.length?"warning":"success"),e.synced.length>0||e.errors.length>0){const i=[e.synced.length?`تم الربط:
${e.synced.join(`
`)}`:null,e.errors.length?`أخطاء:
${e.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير ربط الحسابات:

${i}`,"نتائج الربط"),600)}e.synced.length>0&&await S()}catch(e){window.showToast?.("خطأ: "+e.message,"error")}}};window.repairCustomerJournalEntries=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع القيود المحاسبية للمبيعات الآجلة والجزئية
وإعادة توجيه أسطرها من الحسابات العامة إلى حسابات العملاء الفردية.

هذه العملية:
• تصحح القيود القديمة التي ذهبت لحساب أب عام (1-1-2-1-1 أو 1-1-2-1-2)
• تربط بحساب العميل الفردي من خلال sourceId للفاتورة
• تُعيد بناء الأرصدة تلقائياً بعد الانتهاء

لا تحذف أي قيود — فقط تُحدّث أكواد الحسابات.`,"إصلاح قيود العملاء")){window.showToast?.("⏳ جارٍ فحص القيود المحاسبية...","info");try{const{db:e,COMPANY_ID:a}=await O(async()=>{const{db:h,COMPANY_ID:x}=await import("./index-DaYejt0r.js").then(L=>L.S);return{db:h,COMPANY_ID:x}},__vite__mapDeps([0,1])),{collection:i,getDocs:s,query:c,where:y,writeBatch:f}=await O(async()=>{const{collection:h,getDocs:x,query:L,where:A,writeBatch:P}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:h,getDocs:x,query:L,where:A,writeBatch:P}},[]),l=await s(i(e,`companies/${a}/chartOfAccounts`)),C={},T={};l.docs.forEach(h=>{const x=h.data();C[x.code]={id:h.id,...x},T[h.id]={id:h.id,...x}});const r=await s(i(e,`companies/${a}/customers`)),v={};r.docs.forEach(h=>{const x=h.data();x.accountCode&&x.accountId&&(v[h.id]={accountId:x.accountId,accountCode:x.accountCode,name:x.name||h.id,repId:x.repId||null})}),console.log(`[Repair] عدد العملاء ذوي حسابات فردية: ${Object.keys(v).length}`);const[b,$]=await Promise.all([s(i(e,`companies/${a}/salesInvoices`)),s(i(e,`companies/${a}/repInvoices`))]),u={},o=h=>{const x=h.data(),L={customerId:x.customerId||null,paymentMethod:x.paymentMethod||"cash"};u[h.id]=L,x.invoiceNumber&&(u[x.invoiceNumber]=L)};b.docs.forEach(o),$.docs.forEach(o),console.log(`[Repair] فواتير مُحمَّلة: ${b.size+$.size}`);const d=new Set(["1-1-2-1-1","1-1-2-1-2","1-1-2-2-1"]),p=new Set(["credit","deferred","آجل","partial","جزئي"]),m=await s(c(i(e,`companies/${a}/journalEntries`),y("sourceType","in",["salesInvoice","repSale","posSale","salesInvoices"])));console.log(`[Repair] قيود مبيعات للفحص: ${m.size}`);const n={fixed:[],skipped:[],errors:[]},g=400;let w=f(e),k=0;const j=async()=>{k>0&&(await w.commit(),w=f(e),k=0)};for(const h of m.docs){const x=h.data(),L=h.ref,A=x.sourceId||"",P=u[A];if(!P){n.skipped.push(`قيد ${x.entryNumber||h.id.slice(0,8)} — لم يُعثر على الفاتورة (${A})`);continue}const{customerId:Y,paymentMethod:Z}=P;if(!p.has((Z||"").toLowerCase())){n.skipped.push(`قيد ${x.entryNumber||h.id.slice(0,8)} — نقدي (${Z})`);continue}const F=Y?v[Y]:null;if(!F){n.skipped.push(`قيد ${x.entryNumber||h.id.slice(0,8)} — العميل ${Y||"غير محدد"} بلا حساب فردي`);continue}const re=x.lines||[];let ee=!1;const pe=re.map(q=>{const ye=q.accountCode||"",me=q.accountId||"",te=T[me];return d.has(ye)||te&&d.has(te.code)?(ee=!0,{...q,accountCode:F.accountCode,accountId:F.accountId,accountName:F.name}):q});if(!ee){n.skipped.push(`قيد ${x.entryNumber||h.id.slice(0,8)} — سليم بالفعل`);continue}try{w.update(L,{lines:pe}),k++,n.fixed.push(`قيد ${x.entryNumber||h.id.slice(0,8)} → ${F.name} (${F.accountCode})`),k>=g&&await j()}catch(q){n.errors.push(`قيد ${h.id.slice(0,8)}: ${q.message}`)}}await j();const D=[`✅ قيود مُصلَحة: ${n.fixed.length}`,`⏭️ متخطّى: ${n.skipped.length}`,n.errors.length?`⚠️ أخطاء: ${n.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(D,n.errors.length?"warning":"success"),n.fixed.length>0||n.errors.length>0){const h=[n.fixed.length?`مُصلَح:
${n.fixed.slice(0,30).join(`
`)}${n.fixed.length>30?`
... و${n.fixed.length-30} أخرى`:""}`:null,n.errors.length?`أخطاء:
${n.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير إصلاح قيود العملاء:

${h}`,"نتائج الإصلاح"),600)}n.fixed.length>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود المحدَّثة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).then(()=>window.showToast?.("✅ تمت إعادة بناء الأرصدة بنجاح — دفتر الأستاذ جاهز","success")).catch(h=>console.warn("[auto-rebuild]",h)),1500))}catch(e){console.error("[repairCustomerJournalEntries]",e),window.showToast?.("خطأ: "+e.message,"error")}}};window.zeroRetainedEarnings=async()=>{if(await window.showConfirm?.(`⚠️ هذه العملية خاصة بالسنة الأولى من التشغيل فقط.

سيتم تصفير رصيد حساب الأرباح المرحّلة (3-3) وتعيينه إلى صفر.

لأن هذه هي السنة الأولى، لا يوجد رصيد مرحّل سابق.

هل أنت متأكد؟`,"تصفير الأرباح المرحّلة (السنة الأولى)"))try{const a=(await M(B.chartOfAccounts())).docs.find(i=>i.data().code==="3-3");if(!a){window.showToast?.("لم يُعثر على حساب 3-3 (الأرباح المرحّلة) في شجرة الحسابات","error");return}await W(a.ref,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:V()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3) بنجاح","success"),await S()}catch(e){console.error("[zeroRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixInventoryVATInJEs=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع قيود المشتريات للبحث عن حسابات المخزون التي تُدين بالإجمالي شامل الضريبة
وتصحيحها لتكون بقيمة المبلغ قبل الضريبة فقط.

المعيار: إذا كان المدين للمخزون = إجمالي الدائن (شامل ضريبة) وهناك سطر ضريبة مدخلات منفصل،
سيتم تصحيح المخزون ليكون = إجمالي الدائن - قيمة الضريبة.

هذه العملية آمنة ولا تحذف أي بيانات.`,"تصحيح قيود مخزون المشتريات"))try{window.showToast?.("⏳ جارٍ فحص قيود المشتريات...","info");const{db:e,COMPANY_ID:a}=await O(async()=>{const{db:u,COMPANY_ID:o}=await import("./index-DaYejt0r.js").then(d=>d.S);return{db:u,COMPANY_ID:o}},__vite__mapDeps([0,1])),{collection:i,getDocs:s,query:c,where:y,writeBatch:f}=await O(async()=>{const{collection:u,getDocs:o,query:d,where:p,writeBatch:m}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:u,getDocs:o,query:d,where:p,writeBatch:m}},[]),l="1-1-4",C="1-1-5-2",T=await s(c(i(e,`companies/${a}/journalEntries`),y("sourceType","==","purchaseInvoice"))),r={fixed:0,skipped:0,errors:[]};let v=f(e),b=0;for(const u of T.docs){const d=u.data().lines||[],p=d.filter(A=>(A.accountCode||"").startsWith(l)&&(A.debit||0)>0),m=d.find(A=>A.accountCode===C&&(A.debit||0)>0),n=d.find(A=>(A.credit||0)>0);if(!p.length||!m||!n){r.skipped++;continue}const g=parseFloat(m.debit||0),w=parseFloat(n.credit||0),k=Math.round((w-g)*100)/100,j=p.reduce((A,P)=>A+parseFloat(P.debit||0),0),D=Math.round(w*100)/100,h=k;if(!(Math.abs(j-D)<.05&&g>.01)){r.skipped++;continue}const L=d.map(A=>(A.accountCode||"").startsWith(l)&&(A.debit||0)>0?{...A,debit:Math.round(k*100)/100}:A);try{v.update(u.ref,{lines:L}),b++,r.fixed++,b>=400&&(await v.commit(),v=f(e),b=0)}catch(A){r.errors.push(u.id.slice(0,8)+": "+A.message)}}b>0&&await v.commit();const $=`✅ تم تصحيح ${r.fixed} قيد | تخطّي ${r.skipped} | أخطاء: ${r.errors.length}`;window.showToast?.($,r.errors.length>0?"warning":"success"),r.fixed>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1500))}catch(e){console.error("[fixInventoryVATInJEs]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixRevenuesAndRetainedEarnings=async()=>{if(await window.showConfirm?.(`هذه العملية الشاملة تُصلح مشكلة ظهور الإيرادات صفراً:

الخطوة 1: التحقق من وجود حسابات الإيرادات (4-1-1 وما تحتها)
          وإنشاء أي حساب مفقود تلقائياً

الخطوة 2: تصفير حساب الأرباح المرحّلة (3-3)
          لأن هذه هي السنة الأولى من التشغيل

الخطوة 3: إعادة بناء جميع الأرصدة من القيود المحاسبية
          بعدها ستظهر الإيرادات صحيحة في الشجرة

⚠️ لا تحذف أي بيانات — فقط تُضيف وتُصحح`,"إصلاح الإيرادات وتصفير الأرباح المرحّلة"))try{window.showToast?.("⏳ الخطوة 1: فحص حسابات الإيرادات...","info");const e=[{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات المبيعات الموحدة",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1}],a=await M(B.chartOfAccounts()),i=new Set,s={};let c=null;a.docs.forEach(r=>{const v=r.data();v.code&&(i.add(v.code),s[v.code]={ref:r.ref,data:v}),v.code==="3-3"&&(c=r.ref)});const y=e.filter(r=>!i.has(r.code));let f=0;if(y.length>0){window.showToast?.(`⚙️ إنشاء ${y.length} حساب إيرادات مفقود...`,"info");const r=B.chartOfAccounts();let v=H(_),b=0;for(const $ of y){const u=G(r);v.set(u,{...$,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"credit"}),b++,f++,b>=400&&(await v.commit(),v=H(_),b=0)}b>0&&await v.commit(),window.showToast?.(`✅ تم إنشاء ${f} حساب إيرادات`,"success")}else window.showToast?.("✅ جميع حسابات الإيرادات موجودة","success");const l=s["4-1-1"];l&&l.data.nodeType==="header"&&(await W(l.ref,{nodeType:"detail"}),window.showToast?.("✅ تم تحويل حساب 4-1-1 إلى detail","info")),window.showToast?.("⏳ الخطوة 2: تصفير الأرباح المرحّلة (3-3)...","info"),(await M(B.chartOfAccounts())).docs.forEach(r=>{r.data().code==="3-3"&&(c=r.ref)}),c?(await W(c,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:V()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3)","success")):window.showToast?.("⚠️ لم يُعثر على حساب 3-3 — سيتم تجاهل هذه الخطوة","warn"),window.showToast?.("⏳ الخطوة 3: إعادة بناء الأرصدة من القيود...","info"),await new Promise(r=>setTimeout(r,800)),await window.rebuildAccountBalances?.({silent:!0}),c&&(await W(c,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:V()}),window.showToast?.("✅ تم تصفير الأرباح المرحّلة (3-3) نهائياً","success")),await S();const T=[f>0?`✅ حسابات مُنشأة: ${f}`:null,c?"✅ تم تصفير 3-3 نهائياً":null,"✅ تمت إعادة بناء جميع الأرصدة من القيود"].filter(Boolean).join(`
`);setTimeout(()=>window.showConfirm?.(`🎉 اكتملت عملية الإصلاح بنجاح!

${T}

الإيرادات ستظهر الآن في شجرة الحسابات.
تحقق من ميزان المراجعة للتأكد من التوازن.`,"اكتمل الإصلاح"),500)}catch(e){console.error("[fixRevenuesAndRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixRepSalesCOGS=async()=>{if(await window.showConfirm?.(`هذه الأداة تبحث عن قيود تكلفة المبيعات (salesCOGS) التي:

• جاءت من فاتورة بمخزن سيارة/مندوب
• لكن قيد التكلفة دائن المستودع الرئيسي (1-1-4-1-01) بدلاً من مخزن السيارة (1-1-4-1-02)

وتصحيحها تلقائياً. هل تريد المتابعة؟`,"تصحيح قيود تكلفة مبيعات السيارات"))try{window.showToast?.("⏳ جارٍ فحص الفواتير وقيود التكلفة...","info");const a=(await M(B.salesInvoices())).docs.map(c=>({id:c.id,...c.data()})).filter(c=>{const y=(c.warehouseName||c.warehouse||"").toLowerCase();return y.includes("سيارة")||y.includes("سياره")||y.includes("مندوب")||y.includes("مصطفى")||y.includes("علي")||y.includes("ناجي")});window.showToast?.(`📋 وُجدت ${a.length} فاتورة من مخازن السيارات`,"info");let i=0,s=0;for(const c of a){const y=await M(de(B.journalEntries(),oe("sourceType","==","salesCOGS"),oe("sourceId","==",c.id)));for(const f of y.docs){const l=f.data().lines||[];let C=!1;const T=l.map(r=>r.accountCode==="1-1-4-1-01"&&r.credit>0?(C=!0,{...r,accountCode:"1-1-4-1-02",accountName:"مخزون سيارات التوزيع"}):r);C?(await W(f.ref,{lines:T}),i++):s++}}window.showToast?.(`✅ تم تصحيح ${i} قيد تكلفة | ${s} سليم`,"success"),i>0&&setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1e3)}catch(e){console.error("[fixRepSalesCOGS]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixMissingTransferJEs=async()=>{if(await window.showConfirm?.(`هذه الأداة تبحث عن التحويلات المخزنية (تم الاستلام) ولا يوجد لها قيد محاسبي أو قيودها غير صحيحة
وتُنشئ القيود أو تصححها تلقائياً.

هل تريد المتابعة؟`,"إنشاء وتصحيح قيود التحويلات"))try{window.showToast?.("⏳ جارٍ فحص وتصحيح التحويلات...","info");const{createJournalEntry:e}=await O(async()=>{const{createJournalEntry:o}=await import("./index-DaYejt0r.js").then(d=>d.T);return{createJournalEntry:o}},__vite__mapDeps([0,1])),{db:a,COMPANY_ID:i}=await O(async()=>{const{db:o,COMPANY_ID:d}=await import("./index-DaYejt0r.js").then(p=>p.S);return{db:o,COMPANY_ID:d}},__vite__mapDeps([0,1])),{collection:s,getDocs:c,query:y,where:f,doc:l,getDoc:C,deleteDoc:T}=await O(async()=>{const{collection:o,getDocs:d,query:p,where:m,doc:n,getDoc:g,deleteDoc:w}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:o,getDocs:d,query:p,where:m,doc:n,getDoc:g,deleteDoc:w}},[]);async function r(o){try{const d=await C(l(a,`companies/${i}/products`,o));if(d.exists()){const p=d.data(),m=parseFloat(p.averageCost||p.costPrice||p.purchasePrice||0);if(m>.001)return m;const n=parseFloat(p.salePrice||p.priceRetail||0);if(n>.001)return Math.round(n*.7*100)/100}}catch(d){console.warn("[getProductCost] failed for product:",o,d.message)}return 1}async function v(o,d){const p=/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(d||""),m=p?"1-1-4-1-02":"1-1-4-1";try{const n=s(a,`companies/${i}/chartOfAccounts`);if(o){const D=y(n,f("sourceEntityId","==",o)),h=await c(D);if(!h.empty){const x=h.docs[0].data();return{code:x.code,name:x.name,id:h.docs[0].id}}}const g=y(n,f("parentCode","==",m)),k=(await c(g)).docs.map(D=>({id:D.id,...D.data()})),j=(d||"").trim().toLowerCase();for(const D of k){const h=(D.name||"").toLowerCase();if(h===j||h.includes(j)||j.includes(h))return{code:D.code,name:D.name,id:D.id}}}catch(n){console.warn("[resolveWarehouseAccount] failed:",n.message)}return{code:p?"1-1-4-1-02":"1-1-4-1-01",name:p?"مخزون سيارات التوزيع":"مخزون المستودع الرئيسي",id:p?"1-1-4-1-02":"1-1-4-1-01"}}const b=await c(y(s(a,`companies/${i}/stockTransfers`),f("status","==","received")));let $=0,u=0;for(const o of b.docs){const d={id:o.id,...o.data()},p=await c(y(s(a,`companies/${i}/journalEntries`),f("sourceType","==","stockTransfer"),f("sourceId","==",d.id)));if(!p.empty){const m=p.docs[0],n=m.data(),g=n.lines&&n.lines.some(k=>k.accountCode==="1-1-4-1-02"),w=parseFloat(n.totalDebit||0)<15&&d.number==="TR-8951305";if(g||w)await T(m.ref),console.log(`[fixMissingTransferJEs] Deleted incorrect JE ${n.entryNumber} for ${d.number}`);else{u++;continue}}try{let m=0;for(const w of d.lines||[]){const k=parseFloat(w.costPrice||w.unitCost||w.averageCost||0)||await r(w.productId);m+=k*parseFloat(w.qty||0)}m<.001&&(m=(d.lines||[]).reduce((w,k)=>w+(k.qty||1),0));const n=await v(d.toWarehouseId,d.toWarehouseName),g=await v(d.fromWarehouseId,d.fromWarehouseName);await e({date:d.date||new Date().toISOString().slice(0,10),description:`تحويل مخزني ${d.number} — من ${d.fromWarehouseName} إلى ${d.toWarehouseName}`,lines:[{accountCode:n.code,accountName:n.name,accountId:n.id,debit:Math.round(m*100)/100,credit:0,note:`استلام مخزون — تحويل ${d.number}`},{accountCode:g.code,accountName:g.name,accountId:g.id,debit:0,credit:Math.round(m*100)/100,note:`صرف مخزون — تحويل ${d.number}`}],sourceType:"stockTransfer",sourceId:d.id,status:"posted",createdByName:"النظام — إصلاح تلقائي"}),$++}catch(m){console.warn(`[fixMissingTransferJEs] Failed ${d.number}:`,m.message)}}window.showToast?.(`✅ تم إنشاء/تصحيح ${$} قيد تحويل | ${u} موجودة مسبقاً وسليمة`,"success"),$>0&&setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1500)}catch(e){console.error("[fixMissingTransferJEs]",e),window.showToast?.("خطأ: "+e.message,"error")}};export{ke as render};
