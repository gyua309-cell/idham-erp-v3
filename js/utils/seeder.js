// ============================================================
// IDHAM ERP — Sample Data Seeder
// Populates demo categories, warehouses, sales reps, products,
// customers, and suppliers for instant testing
// ============================================================

import { COLS, create, batchCreate } from "./db.js";
import { generateSearchTokens } from "./formatters.js";

export async function seedDemoData() {
  console.log("🌱 Starting IDHAM ERP Demo Seeding...");

  // 1. Categories
  const categories = [
    { name: "أرز وحبوب", code: "RICE" },
    { name: "زيوت وسمن", code: "OILS" },
    { name: "معلبات وأغذية محفوظة", code: "CANNED" },
    { name: "عصائر ومشروبات", code: "BEVERAGES" },
    { name: "حلويات وبسكويت", code: "SWEETS" },
    { name: "منظفات ومستلزمات", code: "CLEANING" },
  ];

  for (const cat of categories) {
    await create(COLS.categories(), cat);
  }

  // 2. Warehouses
  const warehouses = [
    { name: "المستودع الرئيسي — الرياض", location: "الرياض — حي السلي", manager: "عبدالله العتيبي", notes: "المستودع المركزي لجميع الأصناف" },
    { name: "مستودع فرع جدة", location: "جدة — الخمرة", manager: "سعيد الغامدي", notes: "تغذية المنطقة الغربية" },
    { name: "مستودع فرع الدمام", location: "الدمام — المدينة الصناعية الأولى", manager: "فهد الدوسري", notes: "تغذية المنطقة الشرقية" },
  ];

  for (const wh of warehouses) {
    await create(COLS.warehouses(), wh);
  }

  // 3. Sales Reps
  const reps = [
    { name: "أحمد العتيبي", phone: "0501112233", zone: "الرياض — شمال", monthlyTarget: 150000, salary: 5000, commissionRate: 2 },
    { name: "محمد الشمري", phone: "0552223344", zone: "الرياض — جنوب", monthlyTarget: 120000, salary: 4500, commissionRate: 2 },
    { name: "خالد الدوسري", phone: "0563334455", zone: "جدة ومكة", monthlyTarget: 180000, salary: 5500, commissionRate: 2.5 },
    { name: "سلطان القحطاني", phone: "0544445566", zone: "الدمام والخبر", monthlyTarget: 140000, salary: 4800, commissionRate: 2 },
  ];

  for (const rep of reps) {
    await create(COLS.salesReps(), rep);
  }

  // 4. Sample Products
  const sampleProducts = [
    { sku: "RICE-001", name: "أرز بشاور هندي درجة أولى 10 كجم", categoryName: "أرز وحبوب", unit: "BAG", costPrice: 65, salePrice: 85, taxCategory: "S", barcode: "6281001001", reorderLevel: 20 },
    { sku: "RICE-002", name: "أرز مزة سيلا بنجابي 5 كجم", categoryName: "أرز وحبوب", unit: "BAG", costPrice: 32, salePrice: 42, taxCategory: "S", barcode: "6281001002", reorderLevel: 30 },
    { sku: "OIL-001",  name: "زيت صويا للطبخ 1.5 لتر (شد 12)", categoryName: "زيوت وسمن", unit: "CTN", costPrice: 110, salePrice: 135, taxCategory: "S", barcode: "6281002001", reorderLevel: 15 },
    { sku: "OIL-002",  name: "زيت زيتون بكر ممتاز 500 مل", categoryName: "زيوت وسمن", unit: "PCS", costPrice: 18, salePrice: 24, taxCategory: "S", barcode: "6281002002", reorderLevel: 25 },
    { sku: "CAN-001",  name: "معجون طماطم 135جم (شد 48)", categoryName: "معلبات وأغذية محفوظة", unit: "CTN", costPrice: 48, salePrice: 62, taxCategory: "S", barcode: "6281003001", reorderLevel: 40 },
    { sku: "CAN-002",  name: "تونة خفيفة في زيت دوار الشمس 185جم (شد 24)", categoryName: "معلبات وأغذية محفوظة", unit: "CTN", costPrice: 82, salePrice: 105, taxCategory: "S", barcode: "6281003002", reorderLevel: 20 },
    { sku: "BEV-001",  name: "عصير برتقال طبيعي 1 لتر (شد 12)", categoryName: "عصائر ومشروبات", unit: "CTN", costPrice: 38, salePrice: 50, taxCategory: "S", barcode: "6281004001", reorderLevel: 50 },
    { sku: "SWEET-01", name: "بسكويت بالتمر فاخر 400جم (شد 16)", categoryName: "حلويات وبسكويت", unit: "CTN", costPrice: 55, salePrice: 72, taxCategory: "S", barcode: "6281005001", reorderLevel: 15 },
  ];

  for (const prod of sampleProducts) {
    await create(COLS.products(), {
      ...prod,
      searchTokens: generateSearchTokens(prod.name + " " + prod.sku),
    });
  }

  // 5. Customers
  const customers = [
    { name: "أسواق التميمي — فرع العليا", code: "CUST-001", phone: "0112223344", zone: "الرياض — شمال", creditLimit: 100000, creditDays: 30, balance: 24500, priceList: "wholesale" },
    { name: "أسواق المزرعة — فرع النزهة", code: "CUST-002", phone: "0113334455", zone: "الرياض — شمال", creditLimit: 80000, creditDays: 30, balance: 12000, priceList: "wholesale" },
    { name: "سوبرماركت البركة", code: "CUST-003", phone: "0114445566", zone: "الرياض — جنوب", creditLimit: 25000, creditDays: 15, balance: 26500, priceList: "retail" }, // Exceeded credit limit
    { name: "مؤسسة الوفاء لتجارة المواد الغذائية", code: "CUST-004", phone: "0125556677", zone: "جدة ومكة", creditLimit: 150000, creditDays: 45, balance: 48000, priceList: "wholesale" },
  ];

  for (const cust of customers) {
    await create(COLS.customers(), cust);
  }

  // 6. Suppliers
  const suppliers = [
    { name: "شركة الأرز الوطنية المحدودة", phone: "0119998877", vatNumber: "300123456700003", address: "الرياض — الصناعية الثانية", balance: 65000 },
    { name: "مصنع زيوت الخليج", phone: "0128887766", vatNumber: "300234567800003", address: "جدة — المدينة الصناعية", balance: 32000 },
    { name: "شركة الأغذية المتحدة", phone: "0137776655", vatNumber: "300345678900003", address: "الدمام — حي النورس", balance: 18500 },
  ];

  for (const sup of suppliers) {
    await create(COLS.suppliers(), sup);
  }

  console.log("✅ Demo Seeding Completed Successfully!");
}
