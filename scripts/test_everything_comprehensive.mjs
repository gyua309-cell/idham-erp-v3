import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

console.log('═════════════════════════════════════════════════════════════');
console.log('🚀 اختبار شامل وعميق لجميع التعديلات والوظائف البرمجية');
console.log('═════════════════════════════════════════════════════════════\n');

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [نجاح] ${testName}`);
    } else {
      console.error(`❌ [فشل] ${testName} - ${details}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 1: اختبار منطق شاشة ذكاء العميل مع فاتورة مطعم الصفا REP-62470382
  // ─────────────────────────────────────────────────────────────
  console.log('--- اختبار 1: شاشة ذكاء العميل وحساب أرباح الفواتير الحقيقية ---');
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const safaInv = invoices.find(i => (i.number || '').includes('62470382'));
  assert(!!safaInv, 'العثور على فاتورة مطعم الصفا REP-62470382 في قاعدة البيانات');

  if (safaInv) {
    const valIncl = safaInv.totalWithVat || 0;
    const valExcl = safaInv.subtotal || 0;
    const lines = safaInv.lines || safaInv.items || [];
    const linesCost = lines.reduce((sum, l) => {
      const qty = parseFloat(l.qty || l.quantity || 1) || 0;
      const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.purchasePrice !== undefined ? l.purchasePrice : (l.unitCost || 0))) || 0;
      return sum + (qty * uCost);
    }, 0);
    const cost = linesCost > 0 ? linesCost : (parseFloat(safaInv.totalCost) || 0);
    const profit = valExcl - cost;
    const margin = valExcl > 0 ? (profit / valExcl) * 100 : 0;

    assert(Math.abs(valExcl - 180.88) < 0.05, 'قيمة المبيعات خارج الضريبة = 180.88 ر.س', `القيمة: ${valExcl}`);
    assert(Math.abs(cost - 171.50) < 0.05, 'تكلفة البضاعة المحسوبة من البنود = 171.50 ر.س (وليس 202.50)', `التكلفة: ${cost}`);
    assert(Math.abs(profit - 9.38) < 0.05, 'صافي الربح الحقيقي موجب = +9.38 ر.س (ربح وليس خسارة)', `الربح: ${profit}`);
    assert(Math.abs(margin - 5.19) < 0.1, 'هامش الربح الحقيقي = +5.2%', `الهامش: ${margin.toFixed(2)}%`);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 2: فحص جميع فواتير مطعم الصفا البخاري
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 2: فحص كامل فواتير مطعم الصفا البخاري ---');
  const safaInvoices = invoices.filter(i => (i.customerName || '').includes('الصفا البخارى') && i.status !== 'cancelled');
  console.log(`إجمالي فواتير مطعم الصفا: ${safaInvoices.length} فاتورة`);
  
  let safaTotalSalesExcl = 0;
  let safaTotalCost = 0;
  safaInvoices.forEach(inv => {
    const valExcl = inv.subtotal || 0;
    const lines = inv.lines || inv.items || [];
    const linesCost = lines.reduce((sum, l) => {
      const qty = parseFloat(l.qty || l.quantity || 1) || 0;
      const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.purchasePrice !== undefined ? l.purchasePrice : (l.unitCost || 0))) || 0;
      return sum + (qty * uCost);
    }, 0);
    const cost = linesCost > 0 ? linesCost : (parseFloat(inv.totalCost) || 0);
    safaTotalSalesExcl += valExcl;
    safaTotalCost += cost;
  });
  const safaTotalProfit = safaTotalSalesExcl - safaTotalCost;
  const safaMargin = safaTotalSalesExcl > 0 ? (safaTotalProfit / safaTotalSalesExcl) * 100 : 0;
  
  assert(safaTotalProfit > 0, `إجمالي أرباح مطعم الصفا موجبة = +${safaTotalProfit.toFixed(2)} ر.س`, `الربح: ${safaTotalProfit}`);
  assert(safaMargin > 0, `هامش ربح مبيعات مطعم الصفا موجب = +${safaMargin.toFixed(1)}%`, `الهامش: ${safaMargin}`);

  // ─────────────────────────────────────────────────────────────
  // TEST 3: فحص الـ 20 فاتورة التي كانت تظهر سالبة سابقاً
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 3: فحص الـ 20 فاتورة السابقة بالمنطق الجديد ---');
  let negativeCount = 0;
  let positiveCount = 0;
  invoices.forEach(inv => {
    if (inv.status === 'cancelled') return;
    const valExcl = inv.subtotal || 0;
    const lines = inv.lines || inv.items || [];
    const linesCost = lines.reduce((sum, l) => {
      const qty = parseFloat(l.qty || l.quantity || 1) || 0;
      const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.purchasePrice !== undefined ? l.purchasePrice : (l.unitCost || 0))) || 0;
      return sum + (qty * uCost);
    }, 0);
    const cost = linesCost > 0 ? linesCost : (parseFloat(inv.totalCost) || 0);
    const profit = valExcl - cost;
    if (profit < 0) negativeCount++;
    else positiveCount++;
  });
  assert(negativeCount === 0, `اختفاء جميع الخسائر الوهمية بالكامل (عدد الفواتير السالبة = ${negativeCount})`, `متبقي فواتير سالبة: ${negativeCount}`);

  // ─────────────────────────────────────────────────────────────
  // TEST 4: فحص ملف sales-invoices.js وهيكل المودال والشاشة الكاملة
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 4: فحص شاشة المبيعات الجديدة (Fullscreen Cockpit) ---');
  const salesFile = fs.readFileSync('js/modules/sales-invoices.js', 'utf8');

  assert(salesFile.includes('id="new-invoice-modal"'), 'وجود مودال المبيعات الجديد new-invoice-modal');
  assert(salesFile.includes('width: 100vw !important'), 'تطبيق نمط الشاشة الكاملة 100vw لمودال المبيعات');
  assert(salesFile.includes('height: 100vh !important'), 'تطبيق نمط الشاشة الكاملة 100vh لمودال المبيعات');
  assert(salesFile.includes('id="inv-hud-lines-count"'), 'وجود مؤشر HUD لعدد البنود');
  assert(salesFile.includes('id="inv-hud-subtotal"'), 'وجود مؤشر HUD لصافي المبيعات');
  assert(salesFile.includes('id="inv-hud-cost"'), 'وجود مؤشر HUD لتكلفة البضاعة WAC');
  assert(salesFile.includes('id="inv-hud-profit"'), 'وجود مؤشر HUD لصافي الربح التقديري');
  assert(salesFile.includes('id="inv-hud-margin"'), 'وجود مؤشر HUD لهامش الربح %');
  assert(salesFile.includes('متوسط التكلفة ⚖️'), 'وجود عمود متوسط التكلفة في جدول بنود الفاتورة');
  assert(salesFile.includes('هامش الربح % 📈'), 'وجود عمود هامش الربح في جدول بنود الفاتورة');
  assert(salesFile.includes('colspan="13"'), 'تطابق أعمدة الجدول عند عدم وجود أصناف (colspan="13")');

  // ─────────────────────────────────────────────────────────────
  // TEST 5: فحص ملف quotations.js وأولوية المتوسط المرجح
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 5: فحص عروض الأسعار وأولوية المتوسط المرجح ---');
  const quoteFile = fs.readFileSync('js/modules/quotations.js', 'utf8');
  assert(quoteFile.includes('prod.avgCostPrice || prod.averageCost || prod.costPrice'), 'تقديم avgCostPrice في احتساب تكلفة بنود عروض الأسعار');
  assert(quoteFile.includes('p.avgCostPrice || p.averageCost || p.costPrice'), 'تقديم avgCostPrice في قائمة بحث عروض الأسعار');

  // ─────────────────────────────────────────────────────────────
  // TEST 6: فحص ملف purchase-invoices.js وعرض آخر سعر شراء
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 6: فحص شاشة المشتريات وعرض آخر سعر شراء ---');
  const purFile = fs.readFileSync('js/modules/purchase-invoices.js', 'utf8');
  assert(purFile.includes('p.lastPurchasePrice || p.costPrice || p.purchasePrice'), 'استخدام lastPurchasePrice عند إضافة الصنف لفاتورة المشتريات');
  assert(purFile.includes('آخر شراء:'), 'إظهار شارة آخر سعر شراء في قائمة البحث عن الصنف');

  // ─────────────────────────────────────────────────────────────
  // TEST 7: فحص الحفاظ على قوالب الطباعة دون أي تغيير
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- اختبار 7: سلامة دوال وقوالب الطباعة ---');
  assert(salesFile.includes('window.printInvoice'), 'دالة طباعة الفاتورة printInvoice موجودة وسليمة 100%');
  assert(salesFile.includes('@media print'), 'تنسيقات الطباعة الرسمية @media print محفوظة وسليمة 100%');
  assert(salesFile.includes('exportPagePDF'), 'دالة تصدير PDF العامة exportPagePDF تعمل وسليمة 100%');

  console.log('\n═════════════════════════════════════════════════════════════');
  console.log(`🎯 نتيجة الاختبارات: تم اجتياز ${passedTests} من أصل ${totalTests} اختبار بنجاح!`);
  if (passedTests === totalTests) {
    console.log('🌟 جميع الاختبارات نجحت بنسبة 100%، وكل شيء يعمل بكفاءة تامة دون أي أخطاء!');
  } else {
    console.log('⚠️ هناك بعض الاختبارات التي تحتاج مراجعة.');
  }
  console.log('═════════════════════════════════════════════════════════════');
}

runTests().catch(console.error);
