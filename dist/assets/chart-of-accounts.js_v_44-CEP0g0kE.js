const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{C as E,n as te,a as N,f as A,u as oe,_ as j,d as B}from"./index-HrCilPJ3.js";import{b as pe}from"./coa-connector-Bwq94sQ7.js";import{getDocs as k,query as ye,orderBy as me,doc as K,writeBatch as F,serverTimestamp as q,updateDoc as V}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const Y={asset:{label:"الأصول",code:"1",color:"#6366f1"},liability:{label:"الخصوم",code:"2",color:"#ef4444"},equity:{label:"حقوق الملكية",code:"3",color:"#10b981"},revenue:{label:"الإيرادات",code:"4",color:"#22c55e"},expense:{label:"المصروفات",code:"5",color:"#f59e0b"}},U=[{code:"1",name:"الأصول",type:"asset",parentCode:null,nodeType:"header",level:0},{code:"1-1",name:"الأصول المتداولة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-1-1",name:"النقدية وما في حكمها",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-1-1",name:"مجموعة الصندوق الرئيسي",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-1-2",name:"صندوق النثريات",type:"asset",parentCode:"1-1-1-1",nodeType:"detail",level:4},{code:"1-1-1-2",name:"صناديق المناديب",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3",name:"الحسابات البنكية",type:"asset",parentCode:"1-1-1",nodeType:"header",level:3},{code:"1-1-1-3-1",name:"البنك الأهلي السعودي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-2",name:"بنك الراجحي",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-1-3-3",name:"بنك الإنماء",type:"asset",parentCode:"1-1-1-3",nodeType:"detail",level:4},{code:"1-1-2",name:"الذمم المدينة التجارية",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-2-1",name:"ذمم عملاء تجزئة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-1-1",name:"ذمم عملاء تجزئة — محلية",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-1-2",name:"ذمم عملاء تجزئة — مناديب",type:"asset",parentCode:"1-1-2-1",nodeType:"header",level:4},{code:"1-1-2-2",name:"ذمم عملاء جملة",type:"asset",parentCode:"1-1-2",nodeType:"header",level:3},{code:"1-1-2-2-1",name:"ذمم عملاء جملة — شركات",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-2-2",name:"ذمم عملاء جملة — أفراد",type:"asset",parentCode:"1-1-2-2",nodeType:"detail",level:4},{code:"1-1-2-3",name:"مخصص الديون المشكوك فيها",type:"asset",parentCode:"1-1-2",nodeType:"detail",level:3},{code:"1-1-3",name:"أوراق القبض",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-3-1",name:"أوراق قبض — شيكات آجلة",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-3-2",name:"أوراق قبض — كمبيالات",type:"asset",parentCode:"1-1-3",nodeType:"detail",level:3},{code:"1-1-4",name:"المخزون",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-4-1",name:"مخزون المستودعات وسيارات التوزيع",type:"asset",parentCode:"1-1-4",nodeType:"header",level:3},{code:"1-1-4-1-01",name:"مخزون المستودع الرئيسي",type:"asset",parentCode:"1-1-4-1",nodeType:"detail",level:4},{code:"1-1-4-1-02",name:"مخزون سيارات التوزيع",type:"asset",parentCode:"1-1-4-1",nodeType:"header",level:4},{code:"1-1-4-3",name:"مخصص هالك وتالف المخزون",type:"asset",parentCode:"1-1-4",nodeType:"detail",level:3},{code:"1-1-5",name:"أصول متداولة أخرى",type:"asset",parentCode:"1-1",nodeType:"header",level:2},{code:"1-1-5-1",name:"مصروفات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-1-1",name:"إيجار مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-2",name:"تأمين مدفوع مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-1-3",name:"اشتراكات مدفوعة مقدماً",type:"asset",parentCode:"1-1-5-1",nodeType:"detail",level:4},{code:"1-1-5-2",name:"ضريبة القيمة المضافة — المدخلات",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-3",name:"سلف للموردين",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-1-5-4",name:"سلف للموظفين والمناديب",type:"asset",parentCode:"1-1-5",nodeType:"header",level:3},{code:"1-1-5-4-1",name:"سلف موظفين",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-4-2",name:"سلف مناديب",type:"asset",parentCode:"1-1-5-4",nodeType:"detail",level:4},{code:"1-1-5-5",name:"ذمم مدينة أخرى",type:"asset",parentCode:"1-1-5",nodeType:"detail",level:3},{code:"1-2",name:"الأصول الثابتة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-2-1",name:"السيارات والمركبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-1-1",name:"سيارات التوزيع — التكلفة",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-1-2",name:"م.خصم: إهلاك متراكم — سيارات",type:"asset",parentCode:"1-2-1",nodeType:"detail",level:3},{code:"1-2-2",name:"معدات وآلات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-2-1",name:"معدات وآلات — التكلفة",type:"asset",parentCode:"1-2-2",nodeType:"detail",level:3},{code:"1-2-2-2",name:"م.خصم: إهلاك متراكم — معدات",type:"asset",parentCode:"1-2-2",nodeType:"detail",level:3},{code:"1-2-3",name:"أثاث ومفروشات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-3-1",name:"أثاث ومفروشات — التكلفة",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-3-2",name:"م.خصم: إهلاك متراكم — أثاث",type:"asset",parentCode:"1-2-3",nodeType:"detail",level:3},{code:"1-2-4",name:"أجهزة وحاسبات",type:"asset",parentCode:"1-2",nodeType:"header",level:2},{code:"1-2-4-1",name:"أجهزة وحاسبات — التكلفة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-4-2",name:"م.خصم: إهلاك متراكم — أجهزة",type:"asset",parentCode:"1-2-4",nodeType:"detail",level:3},{code:"1-2-5",name:"تحسينات على العقارات المستأجرة",type:"asset",parentCode:"1-2",nodeType:"detail",level:2},{code:"1-3",name:"الأصول غير الملموسة",type:"asset",parentCode:"1",nodeType:"header",level:1},{code:"1-3-1",name:"برامج ورخص تشغيل",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-2",name:"تراخيص تجارية وسجلات",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"1-3-3",name:"م.خصم: استهلاك متراكم — أصول غير ملموسة",type:"asset",parentCode:"1-3",nodeType:"detail",level:2},{code:"2",name:"الخصوم",type:"liability",parentCode:null,nodeType:"header",level:0},{code:"2-1",name:"الخصوم المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-1-1",name:"الذمم الدائنة التجارية",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-1-1",name:"ذمم موردون محليون",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-1-1",name:"ذمم موردون غذائية — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"header",level:4},{code:"2-1-1-1-2",name:"ذمم موردون تغليف — محلي",type:"liability",parentCode:"2-1-1-1",nodeType:"detail",level:4},{code:"2-1-1-2",name:"ذمم موردون استيراد",type:"liability",parentCode:"2-1-1",nodeType:"header",level:3},{code:"2-1-1-2-1",name:"ذمم موردون غذائية — استيراد",type:"liability",parentCode:"2-1-1-2",nodeType:"detail",level:4},{code:"2-1-2",name:"أوراق الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-2-1",name:"أوراق دفع — شيكات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-2-2",name:"أوراق دفع — كمبيالات",type:"liability",parentCode:"2-1-2",nodeType:"detail",level:3},{code:"2-1-3",name:"الضرائب والرسوم المستحقة",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-3-1",name:"ضريبة القيمة المضافة — المخرجات",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-2",name:"ضريبة الاستقطاع المستحقة",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-3-3",name:"ضريبة القيمة المضافة الصافية (للتسوية)",type:"liability",parentCode:"2-1-3",nodeType:"detail",level:3},{code:"2-1-4",name:"المصروفات المستحقة الدفع",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-4-1",name:"رواتب مستحقة الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-2",name:"عمولات مناديب مستحقة",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-3",name:"إيجار مستحق الدفع",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-4-4",name:"مصروفات مستحقة أخرى",type:"liability",parentCode:"2-1-4",nodeType:"detail",level:3},{code:"2-1-5",name:"مستحقات الموظفين والمناديب",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-5-1",name:"التأمينات الاجتماعية (GOSI) المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-5-2",name:"مكافأة نهاية الخدمة المستحقة",type:"liability",parentCode:"2-1-5",nodeType:"detail",level:3},{code:"2-1-6",name:"دفعات مقدمة من العملاء",type:"liability",parentCode:"2-1",nodeType:"detail",level:2},{code:"2-1-7",name:"قروض بنكية قصيرة الأجل",type:"liability",parentCode:"2-1",nodeType:"header",level:2},{code:"2-1-7-1",name:"تسهيلات ائتمانية جارية",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-1-7-2",name:"الجزء المتداول من قروض طويلة",type:"liability",parentCode:"2-1-7",nodeType:"detail",level:3},{code:"2-2",name:"الخصوم غير المتداولة",type:"liability",parentCode:"2",nodeType:"header",level:1},{code:"2-2-1",name:"قروض بنكية طويلة الأجل",type:"liability",parentCode:"2-2",nodeType:"header",level:2},{code:"2-2-1-1",name:"قرض بنكي — البنك الأهلي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-1-2",name:"قرض بنكي — الراجحي",type:"liability",parentCode:"2-2-1",nodeType:"detail",level:3},{code:"2-2-2",name:"التزامات عقود الإيجار التمويلي",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"2-2-3",name:"مخصص مكافأة نهاية الخدمة",type:"liability",parentCode:"2-2",nodeType:"detail",level:2},{code:"3",name:"حقوق الملكية",type:"equity",parentCode:null,nodeType:"header",level:0},{code:"3-1",name:"رأس المال",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-1-1",name:"رأس المال المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-1-2",name:"رأس المال غير المدفوع",type:"equity",parentCode:"3-1",nodeType:"detail",level:2},{code:"3-2",name:"الاحتياطيات",type:"equity",parentCode:"3",nodeType:"header",level:1},{code:"3-2-1",name:"الاحتياطي النظامي",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-2-2",name:"الاحتياطي الاختياري",type:"equity",parentCode:"3-2",nodeType:"detail",level:2},{code:"3-3",name:"الأرباح المرحّلة",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"3-4",name:"صافي الربح / الخسارة للفترة",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"3-5",name:"مسحوبات الشريك / الملاك",type:"equity",parentCode:"3",nodeType:"detail",level:1},{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات مبيعات المواد الغذائية",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-1-1",name:"مبيعات التجزئة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-1-1",name:"مبيعات تجزئة — نقد",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-2",name:"مبيعات تجزئة — شبكة",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-1-3",name:"مبيعات تجزئة — آجل",type:"revenue",parentCode:"4-1-1-1",nodeType:"detail",level:4},{code:"4-1-1-2",name:"مبيعات الجملة",type:"revenue",parentCode:"4-1-1",nodeType:"header",level:3},{code:"4-1-1-2-1",name:"مبيعات جملة — فواتير",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-2-2",name:"مبيعات جملة — عروض أسعار مقبولة",type:"revenue",parentCode:"4-1-1-2",nodeType:"detail",level:4},{code:"4-1-1-3",name:"مبيعات نقطة البيع (POS)",type:"revenue",parentCode:"4-1-1",nodeType:"detail",level:3},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-2-1",name:"مردودات مبيعات — تجزئة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-2-2",name:"مردودات مبيعات — جملة",type:"revenue",parentCode:"4-1-2",nodeType:"detail",level:3},{code:"4-1-3",name:"خصومات المبيعات المكتسبة",type:"revenue",parentCode:"4-1",nodeType:"header",level:2},{code:"4-1-3-1",name:"خصم تجاري ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-1-3-2",name:"خصم نقدي ممنوح",type:"revenue",parentCode:"4-1-3",nodeType:"detail",level:3},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-2-1",name:"فوائد وأرباح بنكية",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-2",name:"أرباح بيع الأصول الثابتة",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-3",name:"إيرادات إيجار",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-4",name:"خصومات مكتسبة من الموردين",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"4-2-5",name:"إيرادات متنوعة أخرى",type:"revenue",parentCode:"4-2",nodeType:"detail",level:2},{code:"5",name:"المصروفات",type:"expense",parentCode:null,nodeType:"header",level:0},{code:"5-1",name:"إجمالي تكلفة المبيعات (COGS)",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-1-1",name:"مشتريات البضاعة",type:"expense",parentCode:"5-1",nodeType:"header",level:2},{code:"5-1-1-1",name:"مشتريات محلية — مواد غذائية",type:"expense",parentCode:"5-1-1",nodeType:"detail",level:3},{code:"5-1-1-2",name:"مشتريات استيراد — مواد غذائية",type:"expense",parentCode:"5-1-1",nodeType:"detail",level:3},{code:"5-1-1-3",name:"مشتريات تغليف وعبوات",type:"expense",parentCode:"5-1-1",nodeType:"detail",level:3},{code:"5-1-2",name:"مردودات المشتريات",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-3",name:"خصومات المشتريات المكتسبة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-4",name:"هالك وتالف المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-5",name:"فروق جرد المخزون",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-6",name:"رسوم استيراد وجمارك",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-1-8",name:"مصروف تكلفة البضاعة المباعة",type:"expense",parentCode:"5-1",nodeType:"detail",level:2},{code:"5-2",name:"مصروفات الموظفين والعمالة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-2-1",name:"رواتب الإدارة",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-1-1",name:"راتب المدير العام",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-2",name:"رواتب المحاسبين",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-1-3",name:"رواتب الإدارية",type:"expense",parentCode:"5-2-1",nodeType:"detail",level:3},{code:"5-2-2",name:"رواتب الموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-3",name:"رواتب المناديب وسائقي التوزيع",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-4",name:"عمولات المبيعات والمناديب",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-5",name:"بدلات (سكن، مواصلات، طعام)",type:"expense",parentCode:"5-2",nodeType:"header",level:2},{code:"5-2-5-1",name:"بدل سكن",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-2",name:"بدل مواصلات",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-5-3",name:"بدل طعام",type:"expense",parentCode:"5-2-5",nodeType:"detail",level:3},{code:"5-2-6",name:"التأمينات الاجتماعية (GOSI) — حصة صاحب العمل",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-7",name:"مكافأة نهاية الخدمة",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-8",name:"تدريب وتطوير الكوادر",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-2-9",name:"تأمين طبي للموظفين",type:"expense",parentCode:"5-2",nodeType:"detail",level:2},{code:"5-3",name:"مصروفات التوزيع واللوجستيات",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-3-1",name:"وقود سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-2",name:"صيانة وإصلاح سيارات التوزيع",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-3",name:"رسوم تسجيل ومرور السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-4",name:"تأمين السيارات",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-5",name:"شحن وتوزيع خارجي",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-3-6",name:"رسوم تخزين خارجية",type:"expense",parentCode:"5-3",nodeType:"detail",level:2},{code:"5-4",name:"المصروفات الإدارية والعمومية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-4-1",name:"الإيجارات",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-1-1",name:"إيجار المستودع الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-2",name:"إيجار المكتب الرئيسي",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-1-3",name:"إيجار مستودعات فرعية",type:"expense",parentCode:"5-4-1",nodeType:"detail",level:3},{code:"5-4-2",name:"الخدمات (كهرباء، مياه، غاز)",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-2-1",name:"فاتورة الكهرباء",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-2-2",name:"فاتورة المياه",type:"expense",parentCode:"5-4-2",nodeType:"detail",level:3},{code:"5-4-3",name:"الاتصالات والإنترنت",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-3-1",name:"فاتورة الهاتف والاتصالات",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-3-2",name:"اشتراك الإنترنت",type:"expense",parentCode:"5-4-3",nodeType:"detail",level:3},{code:"5-4-4",name:"مستلزمات مكتبية وقرطاسية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-5",name:"مستلزمات المستودع والتغليف",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-6",name:"تأمين البضائع والمستودع",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-7",name:"الرسوم القانونية والمهنية",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-7-1",name:"أتعاب محاسب قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-7-2",name:"أتعاب مستشار قانوني",type:"expense",parentCode:"5-4-7",nodeType:"detail",level:3},{code:"5-4-8",name:"رسوم حكومية وتراخيص",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-8-1",name:"رسوم تجديد السجل التجاري",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-2",name:"رسوم البلدية وأمانات المدن",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-8-3",name:"رسوم وزارة التجارة والصناعة",type:"expense",parentCode:"5-4-8",nodeType:"detail",level:3},{code:"5-4-9",name:"إعلانات وتسويق",type:"expense",parentCode:"5-4",nodeType:"header",level:2},{code:"5-4-9-1",name:"إعلانات رقمية وسوشيال ميديا",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-9-2",name:"طباعة ومواد ترويجية",type:"expense",parentCode:"5-4-9",nodeType:"detail",level:3},{code:"5-4-10",name:"صيانة المعدات والأجهزة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-11",name:"تنظيف وصحة بيئية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-12",name:"أمن وحراسة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-13",name:"ضيافة واستقبال",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-14",name:"مصروفات أخرى متنوعة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-15",name:"مصروفات صيانة وتصليح المباني",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-16",name:"رسوم تراخيص البرمجيات والاشتراكات السحابية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-17",name:"مصروفات السيارات والانتقال والرحلات",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-18",name:"الرسوم والغرامات والمخالفات الحكومية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-19",name:"مصروفات التدريب وورش العمل للموظفين",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-20",name:"الاستشارات الفنية والتقنية والمهنية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-21",name:"هدايا ومساعدات ومساهمات اجتماعية",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-22",name:"قرطاسية ومستلزمات مكتبية ومطبوعات ورق",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-4-23",name:"عمولات بوابات الدفع الإلكتروني والشبكة",type:"expense",parentCode:"5-4",nodeType:"detail",level:2},{code:"5-5",name:"المصروفات المالية",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-5-1",name:"فوائد القروض البنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-2",name:"عمولات وخدمات بنكية",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-3",name:"فوائد عقود الإيجار التمويلي",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-4",name:"خسائر فروق العملة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-5-5",name:"ديون معدومة",type:"expense",parentCode:"5-5",nodeType:"detail",level:2},{code:"5-6",name:"الإهلاك والاستهلاك",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-6-1",name:"إهلاك السيارات والمركبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-2",name:"إهلاك المعدات والآلات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-3",name:"إهلاك الأثاث والمفروشات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-4",name:"إهلاك الأجهزة والحاسبات",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-5",name:"استهلاك الأصول غير الملموسة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-6-6",name:"استهلاك التحسينات على العقارات المستأجرة",type:"expense",parentCode:"5-6",nodeType:"detail",level:2},{code:"5-7",name:"المخصصات والخسائر المحتملة",type:"expense",parentCode:"5",nodeType:"header",level:1},{code:"5-7-1",name:"مصروف ديون مشكوك فيها",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-2",name:"مخصص هالك المخزون",type:"expense",parentCode:"5-7",nodeType:"detail",level:2},{code:"5-7-3",name:"مخصصات أخرى",type:"expense",parentCode:"5-7",nodeType:"detail",level:2}];let T=[],_=new Set(["1","2","3","4","5"]),X="",G="",ae=!1;async function $e(t,e){t.innerHTML=ue(),await I()}function ue(){return`
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
        ${Object.entries(Y).map(([t,e])=>`<option value="${t}">${e.label}</option>`).join("")}
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
      <button class="coa-btn coa-btn-secondary" onclick="seedDefaultAccounts()"><i class="fas fa-bolt"></i> تحميل الحسابات</button>
      <button class="coa-btn coa-btn-secondary" onclick="fixCOAStructure()" style="border-color:#f59e0b;color:#f59e0b;" title="تصحيح هيكل الشجرة"><i class="fas fa-tools"></i> تصحيح الهيكل</button>
      <button class="coa-btn coa-btn-secondary" onclick="backfillAllEntities()" style="border-color:#10b981;color:#10b981;" title="ربط جميع البنوك والعملاء والموردين القدامى بشجرة الحسابات"><i class="fas fa-link"></i> ربط الحسابات</button>
      <button class="coa-btn coa-btn-secondary" onclick="rebuildAccountBalances()" style="border-color:#6366f1;color:#6366f1;" title="إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية"><i class="fas fa-calculator"></i> إعادة بناء الأرصدة</button>
      <button class="coa-btn coa-btn-primary" onclick="openAddAccountModal(null)"><i class="fas fa-plus"></i> حساب جديد</button>
      <button class="coa-btn coa-btn-secondary" onclick="repairCustomerJournalEntries()" style="border-color:#e11d48;color:#e11d48;" title="تصحيح القيود المحاسبية القديمة وربطها بحسابات العملاء الفردية الصحيحة"><i class="fas fa-first-aid"></i> إصلاح قيود العملاء</button>
      <button class="coa-btn coa-btn-secondary" onclick="zeroRetainedEarnings()" style="border-color:#dc2626;color:#dc2626;" title="تصفير حساب الأرباح المرحّلة 3-3 — للسنة الأولى فقط"><i class="fas fa-eraser"></i> تصفير الأرباح المرحّلة</button>
      <button class="coa-btn coa-btn-secondary" onclick="fixInventoryVATInJEs()" style="border-color:#7c3aed;color:#7c3aed;" title="تصحيح قيود المخزون التي تُدين بالإجمالي شامل الضريبة — تصحيحها لتكون بقيمة قبل الضريبة فقط"><i class="fas fa-box"></i> تصحيح ضريبة المخزون</button>
      <button class="coa-btn" onclick="fixRevenuesAndRetainedEarnings()" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;font-weight:800;box-shadow:0 2px 12px rgba(16,185,129,0.4);animation:pulse 2s infinite;" title="إصلاح شامل: إيجاد وإنشاء حسابات الإيرادات المفقودة + تصفير 3-3 + إعادة بناء الأرصدة"><i class="fas fa-magic"></i> 🔧 إصلاح الإيرادات + 3-3</button>
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
            ${Object.entries(Y).map(([t,e])=>`<option value="${t}">${e.label}</option>`).join("")}
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
  `}async function I(){try{if(T=(await k(E.chartOfAccounts())).docs.map(a=>{const n=a.data();return{id:a.id,...n,_rawBalance:n.balance||0,_rawDebit:n.totalDebit||0,_rawCredit:n.totalCredit||0}}),T.sort((a,n)=>(a.code||"").localeCompare(n.code||"",void 0,{numeric:!0})),!T.some(a=>a.code==="5-1-7")&&T.length>0)try{const a=E.chartOfAccounts();await te(a,{code:"5-1-7",name:"مصروفات نقل بضاعة (للداخل)",type:"expense",parentCode:"5-1",nodeType:"detail",level:2,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"debit"}),console.log("Auto-migrated Freight-In account (5-1-7)."),setTimeout(()=>I(),100);return}catch(a){console.error("Failed to auto-migrate Freight-In account:",a)}ve(),O()}catch(t){document.getElementById("coa-tree").innerHTML=`<div class="coa-loading" style="color:var(--bad)">خطأ: ${t.message}</div>`}}function ve(){const t=document.getElementById("coa-kpis");if(!t)return;const e=[{label:"الأصول",type:"asset",color:"#6366f1"},{label:"الخصوم",type:"liability",color:"#ef4444"},{label:"حقوق الملكية",type:"equity",color:"#10b981"},{label:"الإيرادات",type:"revenue",color:"#22c55e"},{label:"المصروفات",type:"expense",color:"#f59e0b"}];t.innerHTML=e.map(a=>{const n=T.filter(d=>d.type===a.type&&d.nodeType==="detail"&&d.isActive!==!1).reduce((d,s)=>d+(s.balance||0),0),c=Math.abs(n);return`
      <div class="coa-kpi">
        <div class="coa-kpi-label">${a.label}</div>
        <div class="coa-kpi-value" style="color:${a.color}">${A(c)}</div>
      </div>`}).join("")}function O(){const t=document.getElementById("coa-tree");if(!t)return;let e=T;if(ae||(e=e.filter(d=>d.isActive!==!1)),X&&(e=e.filter(d=>d.type===X)),G){const d=G.toLowerCase();e=e.filter(s=>(s.name||"").toLowerCase().includes(d)||(s.code||"").toLowerCase().includes(d))}if(!e.length){t.innerHTML='<div class="coa-loading">لا توجد حسابات</div>';return}const a={};e.forEach(d=>{const s=d.parentCode||"ROOT";(a[s]=a[s]||[]).push(d)}),fe(e);const n=[];(a.ROOT||a[""]||[]).sort(ne).forEach(d=>de(d,0,a,n)),t.innerHTML=n.join("")||'<div class="coa-loading">لا توجد حسابات مطابقة</div>'}function ne(t,e){return t.code.localeCompare(e.code,void 0,{numeric:!0})}function fe(t){t.forEach(e=>{e.balance=e._rawBalance!==void 0?e._rawBalance:e.balance||0,e.totalDebit=e._rawDebit!==void 0?e._rawDebit:e.totalDebit||0,e.totalCredit=e._rawCredit!==void 0?e._rawCredit:e.totalCredit||0})}function de(t,e,a,n,c){const d=(a[t.code]||[]).sort(ne),s=d.length>0,v=_.has(t.code),i=Y[t.type]||{color:"#888",label:"—"},f=t.nodeType==="header"||s,g=t.isActive===!1,r=t.balance||0,m=t.totalDebit||0,h=t.totalCredit||0,y=s?`<button class="coa-toggle-btn ${v?"open":""}"
              onclick="event.stopPropagation();coaToggle('${t.code}')"
              title="${v?"طي":"فتح"}">
         <i class="fas fa-chevron-right" style="font-size:9px;"></i>
       </button>`:'<span class="coa-toggle-placeholder"></span>';n.push(`
    <div class="coa-row ${f?"header-row":""} lv${Math.min(e,4)} ${g?"inactive":""}"
         data-code="${t.code}">

      <div class="coa-cell-code" style="padding-right:${e*14}px">
        ${y}
        <span style="color:${i.color};margin-right:4px">${t.code}</span>
      </div>

      <div class="coa-cell-name">
        <span class="coa-node-dot" style="background:${i.color};opacity:${Math.max(.3,1-e*.15)}"></span>
        <span class="coa-name-txt" title="${t.name}">${t.name}</span>
        ${g?'<span style="font-size:9px;color:var(--text-3)">(معطّل)</span>':""}
      </div>

      <div class="coa-cell-type">
        <span class="coa-badge" style="background:${i.color}22;color:${i.color}">
          ${i.label}
        </span>
      </div>

      <div class="coa-cell-amount ${m?"amt-dr":"amt-z"}">${m?A(m):"—"}</div>
      <div class="coa-cell-amount ${h?"amt-cr":"amt-z"}">${h?A(h):"—"}</div>

      <div class="coa-cell-bal ${r>0?"bal-pos":r<0?"bal-neg":"amt-z"}">
        ${r?A(Math.abs(r)):"0.00"}
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
        <button class="coa-act-btn deact"  title="${g?"تفعيل":"تعطيل"}"
                onclick="event.stopPropagation();toggleAccountActive('${t.id}','${(t.name||"").replace(/'/g,"\\'")}',${g})">
          <i class="fas fa-${g?"check-circle":"ban"}"></i>
        </button>
      </div>
    </div>
  `),s&&v&&d.forEach(o=>de(o,e+1,a,n))}window.coaToggle=t=>{_.has(t)?_.delete(t):_.add(t),O()};window.coaExpandAll=()=>{T.forEach(t=>_.add(t.code)),O()};window.coaCollapseAll=()=>{_.clear(),O()};window.coaExpandLevel=t=>{_.clear(),T.filter(e=>(e.level||0)<t).forEach(e=>_.add(e.code)),O()};window.coaSearch=t=>{G=t.trim(),G?window.coaExpandAll():O()};window.coaFilterType=t=>{X=t,O()};window.coaToggleInactive=t=>{ae=t,O()};window.openAddAccountModal=function(t){document.getElementById("coa-edit-id").value="",document.getElementById("coa-code").value="",document.getElementById("coa-name").value="",document.getElementById("coa-opening").value="",document.getElementById("coa-desc").value="",document.getElementById("coa-node-type").value="detail",document.getElementById("coa-form-error").classList.add("hidden"),document.getElementById("coa-modal-title").textContent="إضافة حساب جديد";const e=document.getElementById("coa-parent");if(e.innerHTML='<option value="">بدون أب</option>'+T.map(n=>`<option value="${n.code}" ${n.code===t?"selected":""}>${n.code} — ${n.name}</option>`).join(""),t){const n=T.find(c=>c.code===t);n&&(document.getElementById("coa-type").value=n.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(n.type)?"debit":"credit"),le(t)}else{const n=document.getElementById("coa-code-preview-chip");n&&(n.textContent="حدد الحساب الأب أولاً",n.className="coa-code-preview")}const a=document.getElementById("coa-delete-btn");a&&(a.style.display="none"),openModal("coa-modal")};function le(t){const e=T.filter(c=>c.parentCode===t);let a;if(!e.length)a=`${t}-1`;else{const c=e.map(d=>parseInt(d.code.split("-").pop())||0);a=`${t}-${Math.max(...c)+1}`}document.getElementById("coa-code").value=a;const n=document.getElementById("coa-code-preview-chip");if(n){const c=T.find(d=>d.code===a);n.textContent=`📌 ${a}`,n.className=`coa-code-preview ${c?"invalid":"valid"}`,c&&(n.textContent+=" (مستخدم!)")}}window.coaTypeChanged=()=>{const t=document.getElementById("coa-type").value;document.getElementById("coa-normal-balance").value=["asset","expense"].includes(t)?"debit":"credit"};window.coaParentChanged=()=>{const t=document.getElementById("coa-parent").value;if(t){le(t);const e=T.find(a=>a.code===t);e&&!document.getElementById("coa-edit-id").value&&(document.getElementById("coa-type").value=e.type,document.getElementById("coa-normal-balance").value=["asset","expense"].includes(e.type)?"debit":"credit")}};window.editAccount=t=>{const e=T.find(d=>d.id===t);if(!e)return;document.getElementById("coa-edit-id").value=t,document.getElementById("coa-code").value=e.code,document.getElementById("coa-name").value=e.name,document.getElementById("coa-type").value=e.type,document.getElementById("coa-opening").value=e.openingBalance||"",document.getElementById("coa-desc").value=e.description||"",document.getElementById("coa-node-type").value=e.nodeType||"detail",document.getElementById("coa-normal-balance").value=e.normalBalance||"debit",document.getElementById("coa-modal-title").textContent=`تعديل: ${e.name}`,document.getElementById("coa-form-error").classList.add("hidden");const a=document.getElementById("coa-parent");a.innerHTML='<option value="">بدون أب (مستوى رئيسي)</option>'+T.filter(d=>d.id!==t).map(d=>`<option value="${d.code}" ${d.code===e.parentCode?"selected":""}>${d.code} — ${d.name}</option>`).join("");const n=document.getElementById("coa-delete-btn");n&&(n.style.display="inline-flex");const c=document.getElementById("coa-code-preview-chip");c&&(c.textContent=`📌 ${e.code} (الكود الحالي)`,c.className="coa-code-preview valid"),openModal("coa-modal")};window.saveAccount=async()=>{const t=document.getElementById("coa-form-error");t.classList.add("hidden");const e=document.getElementById("coa-edit-id").value,a=document.getElementById("coa-code").value.trim(),n=document.getElementById("coa-name").value.trim(),c=document.getElementById("coa-type").value,d=document.getElementById("coa-parent").value||null,s=document.getElementById("coa-node-type").value,v=document.getElementById("coa-normal-balance").value,i=parseFloat(document.getElementById("coa-opening").value)||0,f=document.getElementById("coa-desc").value.trim();if(!a||!n){t.textContent="الكود والاسم مطلوبان",t.classList.remove("hidden");return}if(!e){const h=T.find(y=>y.code===a);if(h){t.textContent=`الكود ${a} موجود (${h.name})`,t.classList.remove("hidden");return}}const g=d?d.split("-").length:0,r={code:a,name:n,type:c,parentCode:d,nodeType:s,normalBalance:v,openingBalance:i,description:f,level:g,balance:i,totalDebit:0,totalCredit:0,isActive:!0,companyId:N},m=document.getElementById("coa-save-btn");m.disabled=!0,m.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';try{e?(await oe("chartOfAccounts",e,r),window.showToast?.("تم التحديث","success")):(await te(E.chartOfAccounts(),r),window.showToast?.("تمت الإضافة","success")),closeModal("coa-modal"),await I()}catch(h){t.textContent=h.message,t.classList.remove("hidden")}finally{m.disabled=!1,m.innerHTML='<i class="fas fa-save"></i> حفظ الحساب'}};window.toggleAccountActive=async(t,e,a)=>{const n=a?"تفعيل":"تعطيل";if(await window.showConfirm?.(`${n} الحساب "${e}"؟`,n)){if(!a){const c=T.find(s=>s.id===t);if(T.filter(s=>s.parentCode===c?.code&&s.isActive!==!1).length){window.showToast?.("لا يمكن تعطيل حساب له حسابات فرعية نشطة","error");return}}try{await oe("chartOfAccounts",t,{isActive:a}),window.showToast?.(`تم ${n} الحساب`,"success"),await I()}catch(c){window.showToast?.(c.message,"error")}}};window.deleteAccountConfirm=async(t,e)=>{const a=T.find(c=>c.id===t);if(!a)return;const n=T.filter(c=>c.parentCode===a.code);if(n.length){window.showToast?.(`لا يمكن حذف "${e}" لأن له ${n.length} حساب فرعي. يجب حذف الفروع أولاً.`,"error");return}if(await window.showConfirm?.(`⚠️ سيتم حذف الحساب "${a.code} — ${e}" نهائياً.

تأكد أن لا توجد قيود مرتبطة به قبل الحذف.`,"حذف الحساب نهائياً"))try{const{deleteDoc:c,doc:d}=await j(async()=>{const{deleteDoc:s,doc:v}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{deleteDoc:s,doc:v}},[]);await c(d(B,`companies/${N}/chartOfAccounts`,t)),window.showToast?.(`✅ تم حذف الحساب "${e}" نهائياً`,"success"),await I()}catch(c){window.showToast?.(c.message,"error")}};window.deleteAccount=async()=>{const t=document.getElementById("coa-edit-id").value;if(!t)return;const e=T.find(a=>a.id===t);e&&(closeModal("coa-modal"),await deleteAccountConfirm(t,e.name))};window.openLedger=async(t,e,a)=>{document.getElementById("ledger-title").textContent=`كشف حساب: ${e} — ${a}`;const n=document.getElementById("ledger-body");n.innerHTML='<div class="coa-loading"><i class="fas fa-spinner fa-spin"></i></div>',openModal("coa-ledger-modal");try{const c=ye(E.journalEntries(),me("date")),s=(await k(c)).docs.map(y=>({id:y.id,...y.data()})),v=[];s.forEach(y=>{(y.lines||[]).forEach(o=>{(o.accountCode===e||o.accountId===t)&&v.push({...y,_line:o})})});const i=T.find(y=>y.id===t);let f=i?.openingBalance||0;const g=i?.normalBalance!=="credit",r=v.reduce((y,o)=>y+(o._line.debit||0),0),m=v.reduce((y,o)=>y+(o._line.credit||0),0);let h=`<tr style="color:var(--text-2);font-style:italic">
      <td colspan="5">رصيد افتتاحي</td>
      <td class="mono" style="text-align:right;font-weight:800">${A(f)}</td></tr>`;v.forEach((y,o)=>{const l=y._line.debit||0,p=y._line.credit||0;f+=g?l-p:p-l,h+=`<tr>
        <td class="mono" style="font-size:11px;color:var(--text-2)">${o+1}</td>
        <td class="mono" style="font-size:11px">${y.date||""}</td>
        <td>${y.entryNumber||y.description||"—"}</td>
        <td class="mono" style="color:var(--bad);text-align:right">${l?A(l):"—"}</td>
        <td class="mono" style="color:var(--good);text-align:right">${p?A(p):"—"}</td>
        <td class="mono" style="text-align:right;font-weight:800;color:${f>=0?"var(--good)":"var(--bad)"}">
          ${A(Math.abs(f))} ${f>=0?"م":"د"}
        </td></tr>`}),v.length||(h='<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركة مالية</td></tr>'),n.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="coa-kpi"><div class="coa-kpi-label">إجمالي المدين</div>
          <div class="coa-kpi-value" style="color:var(--bad)">${A(r)}</div></div>
        <div class="coa-kpi"><div class="coa-kpi-label">إجمالي الدائن</div>
          <div class="coa-kpi-value" style="color:var(--good)">${A(m)}</div></div>
        <div class="coa-kpi"><div class="coa-kpi-label">الرصيد الختامي</div>
          <div class="coa-kpi-value">${A(Math.abs(f))} ${f>=0?"مدين":"دائن"}</div></div>
      </div>
      <div style="overflow-x:auto">
        <table class="ledger-table">
          <thead><tr>
            <th>#</th><th>التاريخ</th><th>البيان</th>
            <th style="text-align:right;color:var(--bad)">مدين</th>
            <th style="text-align:right;color:var(--good)">دائن</th>
            <th style="text-align:right">الرصيد الجاري</th>
          </tr></thead>
          <tbody>${h}</tbody>
        </table>
      </div>`}catch(c){n.innerHTML=`<div class="coa-loading" style="color:var(--bad)">خطأ: ${c.message}</div>`}};window.seedDefaultAccounts=async()=>{if(await window.showConfirm?.(`⚠️ سيتم حذف جميع الحسابات الحالية (${T.length} حساب) واستبدالها بشجرة الحسابات الكاملة (${U.length} حساب) وفق المعايير المحاسبية IFRS/SOCPA.

هل أنت متأكد؟`,"إعادة بناء شجرة الحسابات"))try{window.showToast?.("جارٍ حذف الحسابات القديمة...","info");const t=E.chartOfAccounts(),e=await k(t),{writeBatch:a}=await j(async()=>{const{writeBatch:i}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:i}},[]);let n=a(B),c=0;for(const i of e.docs)n.delete(i.ref),c++,c>=490&&(await n.commit(),n=a(B),c=0);c>0&&await n.commit(),window.showToast?.(`تم حذف ${e.size} حساب قديم`,"success"),window.showToast?.("جارٍ تحميل الحسابات الجديدة...","info");let d=a(B),s=0,v=0;for(const i of U){const f=K(t);d.set(f,{...i,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(i.type)?"debit":"credit"}),s++,v++,s>=400&&(await d.commit(),d=a(B),s=0)}s>0&&await d.commit(),window.showToast?.(`✅ تم تحميل ${v} حساب على 5 مستويات بنجاح`,"success"),_=new Set(["1","2","3","4","5"]),await I()}catch(t){console.error(t),window.showToast?.(t.message,"error")}};window.rebuildAccountBalances=async(t={})=>{if(!(!t.silent&&!await window.showConfirm?.(`سيتم إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية.

هذه العملية تصحح:
• الإيرادات التي تظهر صفرًا
• أي تعارض بين شجرة الحسابات وميزان المراجعة
• الأرصدة المفقودة بسبب فشل التحديث التلقائي

الأرصدة الحالية ستُستبدل بالأرصدة المحسوبة من القيود.`,"إعادة بناء أرصدة الحسابات"))){window.showToast?.("⏳ جارٍ قراءة القيود المحاسبية...","info");try{const e=await k(E.journalEntries()),a={},n={};e.docs.forEach(o=>{const l=o.data();if(l.status&&l.status!=="posted")return;const p=l.lines||[];for(const u of p){const x=u.accountCode;if(!x)continue;const b=parseFloat(u.debit||0),M=parseFloat(u.credit||0);a[x]=(a[x]||0)+b,n[x]=(n[x]||0)+M}});const c=await k(E.chartOfAccounts());if(c.empty){window.showToast?.("⚠️ لا توجد حسابات في شجرة الحسابات","warn");return}const d={},s=[];c.docs.forEach(o=>{const l=o.data(),p=l.code;if(!p)return;const u={ref:o.ref,code:p,type:l.type,nodeType:l.nodeType,parentCode:l.parentCode||null,normalBalance:l.normalBalance||(["asset","expense"].includes(l.type)?"debit":"credit"),totalDebit:Math.round((a[p]||0)*100)/100,totalCredit:Math.round((n[p]||0)*100)/100,balance:0};if(u.totalDebit>0||u.totalCredit>0){const x=u.totalDebit-u.totalCredit,b=u.normalBalance==="credit"||["liability","equity","revenue"].includes(u.type);u.balance=Math.round((b?-x:x)*100)/100}d[p]=u,s.push(u)});const v=[...s].sort((o,l)=>{const p=(o.code.match(/-/g)||[]).length;return(l.code.match(/-/g)||[]).length-p});for(const o of v)if(o.parentCode&&d[o.parentCode]){const l=d[o.parentCode];l.totalDebit=Math.round((l.totalDebit+o.totalDebit)*100)/100,l.totalCredit=Math.round((l.totalCredit+o.totalCredit)*100)/100,l.balance=Math.round((l.balance+o.balance)*100)/100}const i=400;let f=F(B),g=0,r=0,m=0;for(const o of s)f.update(o.ref,{balance:o.balance,totalDebit:o.totalDebit,totalCredit:o.totalCredit,updatedAt:q()}),o.balance!==0||o.totalDebit!==0||o.totalCredit!==0?r++:m++,g++,g>=i&&(await f.commit(),f=F(B),g=0);g>0&&await f.commit(),await I(),window.showToast?.(`✅ تمت إعادة بناء الأرصدة بنجاح! تم تحديث ${r} حساب بأرصدة | ${m} حساب برصيد صفر`,"success");const h=new Set(s.map(o=>o.code)),y=Object.keys(a).filter(o=>!h.has(o));y.length>0&&setTimeout(()=>window.showConfirm?.(`تحذير: القيود المحاسبية تشير إلى حسابات غير موجودة في شجرة الحسابات:

`+y.slice(0,20).join(`
`)+(y.length>20?`
... و${y.length-20} أخرى`:"")+`

يرجى إضافتها يدوياً لتجنب الاختلافات.`,"حسابات غير معرفة"),800)}catch(e){console.error("[rebuildAccountBalances]",e),window.showToast?.("خطأ في إعادة بناء الأرصدة: "+e.message,"error")}}};window.fixCOAStructure=async()=>{if(!await window.showConfirm?.(`سيتم فحص شجرة الحسابات وتطبيق التصحيحات التالية دون حذف أي بيانات:

1. إضافة الحسابات المفقودة من الشجرة الافتراضية
2. تحويل 1-1-2-1-1 و 2-1-1-1-1 إلى نوع رئيسي (header)
3. ترقية حساب COGS من 5-1-2-1 إلى 5-1-8 إن وُجد
4. التحقق من وجود حسابات المردودات (4-1-2-1, 4-1-2-2)`,"تصحيح هيكل شجرة الحسابات"))return;const{writeBatch:e,setDoc:a,updateDoc:n}=await j(async()=>{const{writeBatch:o,setDoc:l,updateDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{writeBatch:o,setDoc:l,updateDoc:p}},[]);window.showToast?.("جارٍ فحص شجرة الحسابات...","info");const c=E.chartOfAccounts(),d=await k(c),s={},v={};d.docs.forEach(o=>{const l=o.data();s[l.code]=!0,v[l.code]={id:o.id,ref:o.ref,data:l}});const i={added:[],updated:[],errors:[]},f=U.filter(o=>!s[o.code]);if(f.length>0){let o=e(B),l=0;for(const p of f){const u=K(c);o.set(u,{...p,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:["asset","expense"].includes(p.type)?"debit":"credit"}),i.added.push(p.code+" — "+p.name),l++,l>=480&&(await o.commit(),o=e(B),l=0)}l>0&&await o.commit()}const g=["1-1-2-1-1","2-1-1-1-1"];for(const o of g){const l=v[o];if(l&&l.data.nodeType!=="header")try{await n(l.ref,{nodeType:"header"}),i.updated.push(`${o} → nodeType: header`)}catch(p){i.errors.push(`خطأ تحديث ${o}: ${p.message}`)}}const r=v["5-1-2-1"],m=v["5-1-8"];if(r&&!m)try{await n(r.ref,{code:"5-1-8",name:"تكلفة البضاعة المباعة",parentCode:"5-1",level:2,nodeType:"detail",type:"expense",normalBalance:"debit"}),i.updated.push("COGS: 5-1-2-1 → 5-1-8 (تكلفة البضاعة المباعة) بنفس المعرّف Firestore")}catch(o){i.errors.push("خطأ ترقية COGS: "+o.message)}else r&&m?i.updated.push("حساب COGS 5-1-8 موجود بالفعل — 5-1-2-1 سيظل كمرجع تاريخي"):!r&&!m&&i.updated.push("حساب COGS 5-1-8 تم إنشاؤه ضمن الحسابات المضافة");const h=[`✅ حسابات مضافة: ${i.added.length}`,`✏️ حسابات محدّثة: ${i.updated.length}`,i.errors.length?`⚠️ أخطاء: ${i.errors.length}`:null].filter(Boolean).join(" | ");window.showToast?.(h,i.errors.length?"warning":"success"),(i.added.length||i.updated.length)&&await I();const y=[i.added.length?`مضاف:
${i.added.slice(0,10).join(`
`)}${i.added.length>10?`
...`:""}`:null,i.updated.length?`محدّث:
${i.updated.join(`
`)}`:null,i.errors.length?`أخطاء:
${i.errors.join(`
`)}`:null].filter(Boolean).join(`

`);y&&setTimeout(()=>window.showConfirm?.(`تقرير تصحيح شجرة الحسابات:

${y}`,"نتائج التصحيح"),600),(i.added.length>0||i.updated.length>0)&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).catch(o=>console.warn("[auto-rebuild]",o)),1500))};window.backfillAllEntities=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع البنوك والعملاء والموردين والصناديق وربط أي منها لم يظهر بعد في شجرة الحسابات.

هذه العملية آمنة تمامًا ولن تؤثر على الأرصدة أو الحركات المالية.

الحسابات المرتبطة بالفعل سيتم تخطّيها تلقائيًا.`,"ربط الحسابات بشجرة الحسابات")){window.showToast?.("⏳ جارٍ فحص وربط الحسابات...","info");try{const e=await pe(),a=[`✅ تم الربط: ${e.synced.length}`,`⏭️ متخطّى (مرتبط مسبقًا أو غير نشط): ${e.skipped.length}`,e.errors.length?`⚠️ أخطاء: ${e.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(a,e.errors.length?"warning":"success"),e.synced.length>0||e.errors.length>0){const n=[e.synced.length?`تم الربط:
${e.synced.join(`
`)}`:null,e.errors.length?`أخطاء:
${e.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير ربط الحسابات:

${n}`,"نتائج الربط"),600)}e.synced.length>0&&await I()}catch(e){window.showToast?.("خطأ: "+e.message,"error")}}};window.rebuildAccountBalances=async(t={})=>{if(!(!t.silent&&!await window.showConfirm?.(`سيتم إعادة حساب أرصدة جميع الحسابات من القيود المحاسبية الفعلية.

هذه العملية تصحح:
• الإيرادات التي تظهر صفرًا
• أي تعارض بين شجرة الحسابات وميزان المراجعة
• الأرصدة المفقودة بسبب فشل التحديث التلقائي

الأرصدة الحالية ستُستبدل بالأرصدة المحسوبة من القيود.`,"إعادة بناء أرصدة الحسابات"))){window.showToast?.("⏳ جارٍ قراءة القيود المحاسبية...","info");try{const e=await k(E.journalEntries()),a={},n={};e.docs.forEach(o=>{const l=o.data();if(l.status&&l.status!=="posted")return;const p=l.lines||[];for(const u of p){const x=u.accountCode;if(!x)continue;const b=parseFloat(u.debit||0),M=parseFloat(u.credit||0);a[x]=(a[x]||0)+b,n[x]=(n[x]||0)+M}});const c=await k(E.chartOfAccounts());if(c.empty){window.showToast?.("⚠️ لا توجد حسابات في شجرة الحسابات","warn");return}const d={},s=[];c.docs.forEach(o=>{const l=o.data(),p=l.code;if(!p)return;const u={ref:o.ref,code:p,type:l.type,nodeType:l.nodeType,parentCode:l.parentCode||null,normalBalance:l.normalBalance||(["asset","expense"].includes(l.type)?"debit":"credit"),totalDebit:Math.round((a[p]||0)*100)/100,totalCredit:Math.round((n[p]||0)*100)/100,balance:0};if(u.totalDebit>0||u.totalCredit>0){const x=u.totalDebit-u.totalCredit,b=u.normalBalance==="credit"||["liability","equity","revenue"].includes(u.type);u.balance=Math.round((b?-x:x)*100)/100}d[p]=u,s.push(u)});const v=[...s].sort((o,l)=>{const p=(o.code.match(/-/g)||[]).length;return(l.code.match(/-/g)||[]).length-p});for(const o of v)if(o.parentCode&&d[o.parentCode]){const l=d[o.parentCode];l.totalDebit=Math.round((l.totalDebit+o.totalDebit)*100)/100,l.totalCredit=Math.round((l.totalCredit+o.totalCredit)*100)/100,l.balance=Math.round((l.balance+o.balance)*100)/100}const i=400;let f=F(B),g=0,r=0,m=0;for(const o of s)f.update(o.ref,{balance:o.balance,totalDebit:o.totalDebit,totalCredit:o.totalCredit,updatedAt:q()}),o.balance!==0||o.totalDebit!==0||o.totalCredit!==0?r++:m++,g++,g>=i&&(await f.commit(),f=F(B),g=0);g>0&&await f.commit(),await I(),window.showToast?.(`✅ تمت إعادة بناء الأرصدة بنجاح! تم تحديث ${r} حساب بأرصدة | ${m} حساب برصيد صفر`,"success");const h=new Set(s.map(o=>o.code)),y=Object.keys(a).filter(o=>!h.has(o));y.length>0&&setTimeout(()=>window.showConfirm?.(`تحذير: القيود المحاسبية تشير إلى حسابات غير موجودة في شجرة الحسابات:

`+y.slice(0,20).join(`
`)+(y.length>20?`
... و${y.length-20} أخرى`:"")+`

يرجى إضافتها يدوياً لتجنب الاختلافات.`,"حسابات غير معرفة"),800)}catch(e){console.error("[rebuildAccountBalances]",e),window.showToast?.("خطأ في إعادة بناء الأرصدة: "+e.message,"error")}}};window.repairCustomerJournalEntries=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع القيود المحاسبية للمبيعات الآجلة والجزئية
وإعادة توجيه أسطرها من الحسابات العامة إلى حسابات العملاء الفردية.

هذه العملية:
• تصحح القيود القديمة التي ذهبت لحساب أب عام (1-1-2-1-1 أو 1-1-2-1-2)
• تربط بحساب العميل الفردي من خلال sourceId للفاتورة
• تُعيد بناء الأرصدة تلقائياً بعد الانتهاء

لا تحذف أي قيود — فقط تُحدّث أكواد الحسابات.`,"إصلاح قيود العملاء")){window.showToast?.("⏳ جارٍ فحص القيود المحاسبية...","info");try{const{db:e,COMPANY_ID:a}=await j(async()=>{const{db:w,COMPANY_ID:C}=await import("./index-HrCilPJ3.js").then(D=>D.M);return{db:w,COMPANY_ID:C}},__vite__mapDeps([0,1])),{collection:n,getDocs:c,query:d,where:s,writeBatch:v}=await j(async()=>{const{collection:w,getDocs:C,query:D,where:$,writeBatch:z}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:w,getDocs:C,query:D,where:$,writeBatch:z}},[]),i=await c(n(e,`companies/${a}/chartOfAccounts`)),f={},g={};i.docs.forEach(w=>{const C=w.data();f[C.code]={id:w.id,...C},g[w.id]={id:w.id,...C}});const r=await c(n(e,`companies/${a}/customers`)),m={};r.docs.forEach(w=>{const C=w.data();C.accountCode&&C.accountId&&(m[w.id]={accountId:C.accountId,accountCode:C.accountCode,name:C.name||w.id,repId:C.repId||null})}),console.log(`[Repair] عدد العملاء ذوي حسابات فردية: ${Object.keys(m).length}`);const[h,y]=await Promise.all([c(n(e,`companies/${a}/salesInvoices`)),c(n(e,`companies/${a}/repInvoices`))]),o={},l=w=>{const C=w.data(),D={customerId:C.customerId||null,paymentMethod:C.paymentMethod||"cash"};o[w.id]=D,C.invoiceNumber&&(o[C.invoiceNumber]=D)};h.docs.forEach(l),y.docs.forEach(l),console.log(`[Repair] فواتير مُحمَّلة: ${h.size+y.size}`);const p=new Set(["1-1-2-1-1","1-1-2-1-2","1-1-2-2-1"]),u=new Set(["credit","deferred","آجل","partial","جزئي"]),x=await c(d(n(e,`companies/${a}/journalEntries`),s("sourceType","in",["salesInvoice","repSale","posSale","salesInvoices"])));console.log(`[Repair] قيود مبيعات للفحص: ${x.size}`);const b={fixed:[],skipped:[],errors:[]},M=400;let S=v(e),L=0;const H=async()=>{L>0&&(await S.commit(),S=v(e),L=0)};for(const w of x.docs){const C=w.data(),D=w.ref,$=C.sourceId||"",z=o[$];if(!z){b.skipped.push(`قيد ${C.entryNumber||w.id.slice(0,8)} — لم يُعثر على الفاتورة (${$})`);continue}const{customerId:W,paymentMethod:Q}=z;if(!u.has((Q||"").toLowerCase())){b.skipped.push(`قيد ${C.entryNumber||w.id.slice(0,8)} — نقدي (${Q})`);continue}const R=W?m[W]:null;if(!R){b.skipped.push(`قيد ${C.entryNumber||w.id.slice(0,8)} — العميل ${W||"غير محدد"} بلا حساب فردي`);continue}const ce=C.lines||[];let Z=!1;const ie=ce.map(P=>{const se=P.accountCode||"",re=P.accountId||"",ee=g[re];return p.has(se)||ee&&p.has(ee.code)?(Z=!0,{...P,accountCode:R.accountCode,accountId:R.accountId,accountName:R.name}):P});if(!Z){b.skipped.push(`قيد ${C.entryNumber||w.id.slice(0,8)} — سليم بالفعل`);continue}try{S.update(D,{lines:ie}),L++,b.fixed.push(`قيد ${C.entryNumber||w.id.slice(0,8)} → ${R.name} (${R.accountCode})`),L>=M&&await H()}catch(P){b.errors.push(`قيد ${w.id.slice(0,8)}: ${P.message}`)}}await H();const J=[`✅ قيود مُصلَحة: ${b.fixed.length}`,`⏭️ متخطّى: ${b.skipped.length}`,b.errors.length?`⚠️ أخطاء: ${b.errors.length}`:null].filter(Boolean).join(" | ");if(window.showToast?.(J,b.errors.length?"warning":"success"),b.fixed.length>0||b.errors.length>0){const w=[b.fixed.length?`مُصلَح:
${b.fixed.slice(0,30).join(`
`)}${b.fixed.length>30?`
... و${b.fixed.length-30} أخرى`:""}`:null,b.errors.length?`أخطاء:
${b.errors.join(`
`)}`:null].filter(Boolean).join(`

`);setTimeout(()=>window.showConfirm?.(`تقرير إصلاح قيود العملاء:

${w}`,"نتائج الإصلاح"),600)}b.fixed.length>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة من القيود المحدَّثة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}).then(()=>window.showToast?.("✅ تمت إعادة بناء الأرصدة بنجاح — دفتر الأستاذ جاهز","success")).catch(w=>console.warn("[auto-rebuild]",w)),1500))}catch(e){console.error("[repairCustomerJournalEntries]",e),window.showToast?.("خطأ: "+e.message,"error")}}};window.zeroRetainedEarnings=async()=>{if(await window.showConfirm?.(`⚠️ هذه العملية خاصة بالسنة الأولى من التشغيل فقط.

سيتم تصفير رصيد حساب الأرباح المرحّلة (3-3) وتعيينه إلى صفر.

لأن هذه هي السنة الأولى، لا يوجد رصيد مرحّل سابق.

هل أنت متأكد؟`,"تصفير الأرباح المرحّلة (السنة الأولى)"))try{const a=(await k(E.chartOfAccounts())).docs.find(n=>n.data().code==="3-3");if(!a){window.showToast?.("لم يُعثر على حساب 3-3 (الأرباح المرحّلة) في شجرة الحسابات","error");return}await V(a.ref,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:q()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3) بنجاح","success"),await I()}catch(e){console.error("[zeroRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixInventoryVATInJEs=async()=>{if(await window.showConfirm?.(`سيتم فحص جميع قيود المشتريات للبحث عن حسابات المخزون التي تُدين بالإجمالي شامل الضريبة
وتصحيحها لتكون بقيمة المبلغ قبل الضريبة فقط.

المعيار: إذا كان المدين للمخزون = إجمالي الدائن (شامل ضريبة) وهناك سطر ضريبة مدخلات منفصل،
سيتم تصحيح المخزون ليكون = إجمالي الدائن - قيمة الضريبة.

هذه العملية آمنة ولا تحذف أي بيانات.`,"تصحيح قيود مخزون المشتريات"))try{window.showToast?.("⏳ جارٍ فحص قيود المشتريات...","info");const{db:e,COMPANY_ID:a}=await j(async()=>{const{db:o,COMPANY_ID:l}=await import("./index-HrCilPJ3.js").then(p=>p.M);return{db:o,COMPANY_ID:l}},__vite__mapDeps([0,1])),{collection:n,getDocs:c,query:d,where:s,writeBatch:v}=await j(async()=>{const{collection:o,getDocs:l,query:p,where:u,writeBatch:x}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:o,getDocs:l,query:p,where:u,writeBatch:x}},[]),i="1-1-4",f="1-1-5-2",g=await c(d(n(e,`companies/${a}/journalEntries`),s("sourceType","==","purchaseInvoice"))),r={fixed:0,skipped:0,errors:[]};let m=v(e),h=0;for(const o of g.docs){const p=o.data().lines||[],u=p.filter($=>($.accountCode||"").startsWith(i)&&($.debit||0)>0),x=p.find($=>$.accountCode===f&&($.debit||0)>0),b=p.find($=>($.credit||0)>0);if(!u.length||!x||!b){r.skipped++;continue}const M=parseFloat(x.debit||0),S=parseFloat(b.credit||0),L=Math.round((S-M)*100)/100,H=u.reduce(($,z)=>$+parseFloat(z.debit||0),0),J=Math.round(S*100)/100,w=L;if(!(Math.abs(H-J)<.05&&M>.01)){r.skipped++;continue}const D=p.map($=>($.accountCode||"").startsWith(i)&&($.debit||0)>0?{...$,debit:Math.round(L*100)/100}:$);try{m.update(o.ref,{lines:D}),h++,r.fixed++,h>=400&&(await m.commit(),m=v(e),h=0)}catch($){r.errors.push(o.id.slice(0,8)+": "+$.message)}}h>0&&await m.commit();const y=`✅ تم تصحيح ${r.fixed} قيد | تخطّي ${r.skipped} | أخطاء: ${r.errors.length}`;window.showToast?.(y,r.errors.length>0?"warning":"success"),r.fixed>0&&(window.showToast?.("⏳ إعادة بناء الأرصدة...","info"),setTimeout(()=>window.rebuildAccountBalances?.({silent:!0}),1500))}catch(e){console.error("[fixInventoryVATInJEs]",e),window.showToast?.("خطأ: "+e.message,"error")}};window.fixRevenuesAndRetainedEarnings=async()=>{if(await window.showConfirm?.(`هذه العملية الشاملة تُصلح مشكلة ظهور الإيرادات صفراً:

الخطوة 1: التحقق من وجود حسابات الإيرادات (4-1-1 وما تحتها)
          وإنشاء أي حساب مفقود تلقائياً

الخطوة 2: تصفير حساب الأرباح المرحّلة (3-3)
          لأن هذه هي السنة الأولى من التشغيل

الخطوة 3: إعادة بناء جميع الأرصدة من القيود المحاسبية
          بعدها ستظهر الإيرادات صحيحة في الشجرة

⚠️ لا تحذف أي بيانات — فقط تُضيف وتُصحح`,"إصلاح الإيرادات وتصفير الأرباح المرحّلة"))try{window.showToast?.("⏳ الخطوة 1: فحص حسابات الإيرادات...","info");const e=[{code:"4",name:"الإيرادات",type:"revenue",parentCode:null,nodeType:"header",level:0},{code:"4-1",name:"الإيرادات التشغيلية",type:"revenue",parentCode:"4",nodeType:"header",level:1},{code:"4-1-1",name:"إيرادات المبيعات الموحدة",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-1-2",name:"مردودات ومسموحات المبيعات",type:"revenue",parentCode:"4-1",nodeType:"detail",level:2},{code:"4-2",name:"الإيرادات الأخرى",type:"revenue",parentCode:"4",nodeType:"header",level:1}],a=await k(E.chartOfAccounts()),n=new Set,c={};let d=null;a.docs.forEach(r=>{const m=r.data();m.code&&(n.add(m.code),c[m.code]={ref:r.ref,data:m}),m.code==="3-3"&&(d=r.ref)});const s=e.filter(r=>!n.has(r.code));let v=0;if(s.length>0){window.showToast?.(`⚙️ إنشاء ${s.length} حساب إيرادات مفقود...`,"info");const r=E.chartOfAccounts();let m=F(B),h=0;for(const y of s){const o=K(r);m.set(o,{...y,balance:0,totalDebit:0,totalCredit:0,openingBalance:0,isActive:!0,companyId:N,normalBalance:"credit"}),h++,v++,h>=400&&(await m.commit(),m=F(B),h=0)}h>0&&await m.commit(),window.showToast?.(`✅ تم إنشاء ${v} حساب إيرادات`,"success")}else window.showToast?.("✅ جميع حسابات الإيرادات موجودة","success");const i=c["4-1-1"];i&&i.data.nodeType==="header"&&(await V(i.ref,{nodeType:"detail"}),window.showToast?.("✅ تم تحويل حساب 4-1-1 إلى detail","info")),window.showToast?.("⏳ الخطوة 2: تصفير الأرباح المرحّلة (3-3)...","info"),(await k(E.chartOfAccounts())).docs.forEach(r=>{r.data().code==="3-3"&&(d=r.ref)}),d?(await V(d,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:q()}),window.showToast?.("✅ تم تصفير حساب الأرباح المرحّلة (3-3)","success")):window.showToast?.("⚠️ لم يُعثر على حساب 3-3 — سيتم تجاهل هذه الخطوة","warn"),window.showToast?.("⏳ الخطوة 3: إعادة بناء الأرصدة من القيود...","info"),await new Promise(r=>setTimeout(r,800)),await window.rebuildAccountBalances?.({silent:!0}),d&&(await V(d,{balance:0,totalDebit:0,totalCredit:0,openingBalance:0,updatedAt:q()}),window.showToast?.("✅ تم تصفير الأرباح المرحّلة (3-3) نهائياً","success")),await I();const g=[v>0?`✅ حسابات مُنشأة: ${v}`:null,d?"✅ تم تصفير 3-3 نهائياً":null,"✅ تمت إعادة بناء جميع الأرصدة من القيود"].filter(Boolean).join(`
`);setTimeout(()=>window.showConfirm?.(`🎉 اكتملت عملية الإصلاح بنجاح!

${g}

الإيرادات ستظهر الآن في شجرة الحسابات.
تحقق من ميزان المراجعة للتأكد من التوازن.`,"اكتمل الإصلاح"),500)}catch(e){console.error("[fixRevenuesAndRetainedEarnings]",e),window.showToast?.("خطأ: "+e.message,"error")}};export{$e as render};
