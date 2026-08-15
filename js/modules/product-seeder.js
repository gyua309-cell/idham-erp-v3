// ============================================================
// IDHAM ERP — Saudi Arabia Real Food Products Seeder
// Generates realistic Saudi market products with proper names
// ============================================================

import { COLS } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { writeBatch, doc, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { formatCurrency } from "../utils/formatters.js";

// ── Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { id: "dairy",          name: "ألبان ومنتجاتها",       icon: "🥛" },
  { id: "oils",           name: "زيوت وسمن",             icon: "🌻" },
  { id: "rice_grains",    name: "أرز وحبوب",             icon: "🌾" },
  { id: "dry_goods",      name: "سكر ودقيق ومعجنات",     icon: "🍞" },
  { id: "beverages",      name: "مشروبات وعصائر",        icon: "🧃" },
  { id: "water",          name: "مياه معبأة",             icon: "💧" },
  { id: "meat_poultry",   name: "لحوم ودواجن مجمدة",     icon: "🍗" },
  { id: "seafood",        name: "أسماك ومأكولات بحرية",  icon: "🐟" },
  { id: "canned",         name: "معلبات وصلصات",         icon: "🥫" },
  { id: "confectionery",  name: "حلويات وشوكولاتة",      icon: "🍫" },
  { id: "biscuits",       name: "بسكويت وكيك",           icon: "🍪" },
  { id: "spices",         name: "توابل وبهارات",         icon: "🧂" },
  { id: "coffee_tea",     name: "قهوة وشاي",             icon: "☕" },
  { id: "cleaning",       name: "منظفات ومعطرات",        icon: "🧴" },
  { id: "personal_care",  name: "عناية شخصية وورقيات",   icon: "🧻" },
  { id: "baby",           name: "أطفال وحفاضات",         icon: "👶" },
  { id: "bakery",         name: "مخبوزات وخبز",          icon: "🥖" },
  { id: "frozen",         name: "أغذية مجمدة",           icon: "🧊" },
  { id: "honey_jam",      name: "عسل ومربيات وطحينة",    icon: "🍯" },
  { id: "snacks",         name: "شيبس ومكسرات",          icon: "🥜" },
];

// ── Real Product Templates (500+) ────────────────────────────
const REAL_PRODUCTS = [
  // ═══ ألبان ومنتجاتها ═══
  { cat: "dairy", brand: "المراعي", name: "حليب كامل الدسم طازج 1 لتر", en: "Almarai Full Fat Fresh Milk 1L", cost: 5.50, sale: 7.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "حليب كامل الدسم طازج 2 لتر", en: "Almarai Full Fat Fresh Milk 2L", cost: 9.50, sale: 12.00, unit: "حبة", ctn: 6 },
  { cat: "dairy", brand: "المراعي", name: "حليب قليل الدسم 1 لتر", en: "Almarai Low Fat Milk 1L", cost: 5.50, sale: 7.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "حليب خالي الدسم 1 لتر", en: "Almarai Skimmed Milk 1L", cost: 5.50, sale: 7.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "حليب طويل الأجل كامل الدسم 1 لتر", en: "Almarai UHT Full Fat 1L", cost: 4.80, sale: 6.25, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "لبن طازج كامل الدسم 1 لتر", en: "Almarai Fresh Laban 1L", cost: 4.50, sale: 5.75, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "لبن طازج كامل الدسم 2 لتر", en: "Almarai Fresh Laban 2L", cost: 7.50, sale: 9.50, unit: "حبة", ctn: 6 },
  { cat: "dairy", brand: "المراعي", name: "زبادي طازج كامل الدسم 2 كجم", en: "Almarai Full Fat Yogurt 2kg", cost: 10.00, sale: 13.00, unit: "حبة", ctn: 6 },
  { cat: "dairy", brand: "المراعي", name: "زبادي طازج خلطة الفواكه 6×100 جم", en: "Almarai Mixed Fruit Yogurt 6x100g", cost: 7.00, sale: 9.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "لبنة فاخرة 400 جم", en: "Almarai Premium Labneh 400g", cost: 8.50, sale: 11.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "جبنة شيدر شرائح 200 جم", en: "Almarai Cheddar Cheese Slices 200g", cost: 7.50, sale: 9.75, unit: "حبة", ctn: 24 },
  { cat: "dairy", brand: "المراعي", name: "جبنة كريمية قابلة للدهن 500 جم", en: "Almarai Cream Cheese Spread 500g", cost: 13.50, sale: 17.50, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "جبنة حلوم 225 جم", en: "Almarai Halloumi Cheese 225g", cost: 10.50, sale: 13.75, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "المراعي", name: "قشطة طازجة 100 جم", en: "Almarai Fresh Cream 100g", cost: 3.00, sale: 4.00, unit: "حبة", ctn: 48 },
  { cat: "dairy", brand: "المراعي", name: "زبدة غير مملحة 400 جم", en: "Almarai Unsalted Butter 400g", cost: 16.00, sale: 20.50, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "نادك", name: "حليب كامل الدسم طازج 1 لتر", en: "Nadec Full Fat Fresh Milk 1L", cost: 5.00, sale: 6.50, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "نادك", name: "لبن طازج 1 لتر", en: "Nadec Fresh Laban 1L", cost: 4.20, sale: 5.50, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "نادك", name: "زبادي طازج سادة 1 كجم", en: "Nadec Fresh Plain Yogurt 1kg", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 6 },
  { cat: "dairy", brand: "نادك", name: "قشطة طازجة 150 جم", en: "Nadec Fresh Cream 150g", cost: 3.50, sale: 4.50, unit: "حبة", ctn: 48 },
  { cat: "dairy", brand: "نادك", name: "جبنة فيتا بيضاء 400 جم", en: "Nadec White Feta Cheese 400g", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "الصافي", name: "حليب عضوي كامل الدسم 1 لتر", en: "Al Safi Organic Full Fat Milk 1L", cost: 8.00, sale: 10.50, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "الصافي", name: "لبن عضوي طازج 1 لتر", en: "Al Safi Organic Laban 1L", cost: 7.50, sale: 9.75, unit: "حبة", ctn: 12 },
  { cat: "dairy", brand: "كيري", name: "جبنة مثلثات 24 حبة", en: "Kiri Cheese Triangles 24s", cost: 18.00, sale: 23.00, unit: "علبة", ctn: 12 },
  { cat: "dairy", brand: "لافاشكيري", name: "جبنة كريمية 8 حبات", en: "La Vache Qui Rit 8s", cost: 7.00, sale: 9.00, unit: "علبة", ctn: 24 },
  { cat: "dairy", brand: "بوك", name: "جبنة كريمية قابلة للدهن 240 جم", en: "Puck Cream Cheese 240g", cost: 8.50, sale: 11.00, unit: "حبة", ctn: 24 },

  // ═══ زيوت وسمن ═══
  { cat: "oils", brand: "عافية", name: "زيت ذرة صافي 1.5 لتر", en: "Afia Pure Corn Oil 1.5L", cost: 18.00, sale: 23.50, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "عافية", name: "زيت ذرة صافي 2.9 لتر", en: "Afia Pure Corn Oil 2.9L", cost: 34.00, sale: 43.00, unit: "حبة", ctn: 4 },
  { cat: "oils", brand: "عافية", name: "زيت دوار الشمس 1.5 لتر", en: "Afia Sunflower Oil 1.5L", cost: 14.50, sale: 19.00, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "مازولا", name: "زيت ذرة نقي 1.8 لتر", en: "Mazola Pure Corn Oil 1.8L", cost: 22.00, sale: 28.00, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "مازولا", name: "زيت ذرة 5 لتر جالون", en: "Mazola Corn Oil 5L", cost: 55.00, sale: 69.00, unit: "جالون", ctn: 4 },
  { cat: "oils", brand: "العربي", name: "زيت نباتي للطبخ والقلي 1.5 لتر", en: "Al Arabi Vegetable Oil 1.5L", cost: 11.50, sale: 15.00, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "الوزير", name: "زيت زيتون بكر ممتاز 500 مل", en: "Al Wazir Extra Virgin Olive Oil 500ml", cost: 18.00, sale: 24.00, unit: "حبة", ctn: 12 },
  { cat: "oils", brand: "الوزير", name: "زيت زيتون بكر ممتاز 1 لتر", en: "Al Wazir Extra Virgin Olive Oil 1L", cost: 34.00, sale: 44.00, unit: "حبة", ctn: 12 },
  { cat: "oils", brand: "الطيب", name: "سمن بقري نقي 800 جم", en: "Al Tayeb Pure Cow Ghee 800g", cost: 38.00, sale: 48.00, unit: "حبة", ctn: 12 },
  { cat: "oils", brand: "سافولا", name: "سمن نباتي 2 كجم", en: "Savola Vegetable Ghee 2kg", cost: 24.00, sale: 31.00, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "شمس", name: "زيت نباتي للقلي 1.5 لتر", en: "Shams Vegetable Frying Oil 1.5L", cost: 12.00, sale: 15.50, unit: "حبة", ctn: 6 },
  { cat: "oils", brand: "كريستال", name: "زيت نباتي 1.8 لتر", en: "Crystal Vegetable Oil 1.8L", cost: 13.50, sale: 17.50, unit: "حبة", ctn: 6 },

  // ═══ أرز وحبوب ═══
  { cat: "rice_grains", brand: "أبو كاس", name: "أرز بسمتي هندي كلاسيك 5 كجم", en: "Abu Kass Classic Indian Basmati 5kg", cost: 38.00, sale: 48.00, unit: "كيس", ctn: 4 },
  { cat: "rice_grains", brand: "أبو كاس", name: "أرز بسمتي هندي كلاسيك 10 كجم", en: "Abu Kass Classic Indian Basmati 10kg", cost: 72.00, sale: 90.00, unit: "كيس", ctn: 2 },
  { cat: "rice_grains", brand: "المهيدب", name: "أرز بسمتي بنجاب ذهبي 10 كجم", en: "Al Muhaidib Punjab Gold Basmati 10kg", cost: 68.00, sale: 85.00, unit: "كيس", ctn: 2 },
  { cat: "rice_grains", brand: "بنجابي", name: "أرز بسمتي سيلا 5 كجم", en: "Punjabi Sella Basmati Rice 5kg", cost: 32.00, sale: 42.00, unit: "كيس", ctn: 4 },
  { cat: "rice_grains", brand: "بنجابي", name: "أرز بسمتي أبيض 10 كجم", en: "Punjabi White Basmati 10kg", cost: 60.00, sale: 78.00, unit: "كيس", ctn: 2 },
  { cat: "rice_grains", brand: "الشعلان", name: "أرز مزة مصري 5 كجم", en: "Al Shalan Egyptian Medium Grain 5kg", cost: 22.00, sale: 29.00, unit: "كيس", ctn: 4 },
  { cat: "rice_grains", brand: "الأمير", name: "عدس أحمر مجروش 1 كجم", en: "Al Ameer Red Lentils 1kg", cost: 6.50, sale: 9.00, unit: "حبة", ctn: 12 },
  { cat: "rice_grains", brand: "الأمير", name: "فاصوليا بيضاء مجففة 1 كجم", en: "Al Ameer Dry White Beans 1kg", cost: 7.00, sale: 10.00, unit: "حبة", ctn: 12 },
  { cat: "rice_grains", brand: "الأمير", name: "حمص مجفف 500 جم", en: "Al Ameer Dry Chickpeas 500g", cost: 4.50, sale: 6.50, unit: "حبة", ctn: 24 },
  { cat: "rice_grains", brand: "الأمير", name: "فول مجفف 1 كجم", en: "Al Ameer Dry Fava Beans 1kg", cost: 5.00, sale: 7.00, unit: "حبة", ctn: 12 },

  // ═══ سكر ودقيق ═══
  { cat: "dry_goods", brand: "الأسرة", name: "سكر أبيض ناعم 10 كجم", en: "Al Usrah Fine White Sugar 10kg", cost: 28.00, sale: 36.00, unit: "كيس", ctn: 2 },
  { cat: "dry_goods", brand: "الأسرة", name: "سكر أبيض ناعم 5 كجم", en: "Al Usrah Fine White Sugar 5kg", cost: 15.00, sale: 19.50, unit: "كيس", ctn: 4 },
  { cat: "dry_goods", brand: "الأسرة", name: "سكر أبيض ناعم 1 كجم", en: "Al Usrah Fine White Sugar 1kg", cost: 3.50, sale: 4.50, unit: "حبة", ctn: 10 },
  { cat: "dry_goods", brand: "مطاحن الأولى", name: "دقيق أبيض فاخر 2 كجم", en: "First Mills Premium White Flour 2kg", cost: 3.20, sale: 4.50, unit: "حبة", ctn: 10 },
  { cat: "dry_goods", brand: "مطاحن الأولى", name: "دقيق أبيض فاخر 10 كجم", en: "First Mills Premium White Flour 10kg", cost: 14.00, sale: 18.50, unit: "كيس", ctn: 2 },
  { cat: "dry_goods", brand: "قودي", name: "مكرونة سباغيتي 450 جم", en: "Goody Spaghetti 450g", cost: 3.50, sale: 4.75, unit: "حبة", ctn: 20 },
  { cat: "dry_goods", brand: "قودي", name: "مكرونة خواتم 400 جم", en: "Goody Macaroni Rings 400g", cost: 3.20, sale: 4.50, unit: "حبة", ctn: 20 },
  { cat: "dry_goods", brand: "قودي", name: "مكرونة بيني 400 جم", en: "Goody Penne 400g", cost: 3.20, sale: 4.50, unit: "حبة", ctn: 20 },
  { cat: "dry_goods", brand: "الطبيعة", name: "شوفان سريع التحضير 500 جم", en: "Nature Instant Oats 500g", cost: 8.00, sale: 11.00, unit: "حبة", ctn: 12 },
  { cat: "dry_goods", brand: "كويكر", name: "شوفان بالحليب والعسل 30 جم × 12", en: "Quaker Oats with Milk & Honey 12x30g", cost: 14.00, sale: 18.00, unit: "علبة", ctn: 12 },

  // ═══ مشروبات وعصائر ═══
  { cat: "beverages", brand: "بيبسي", name: "مشروب غازي علب 330 مل × 24", en: "Pepsi Cans 330ml x24", cost: 38.00, sale: 48.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "كوكاكولا", name: "مشروب غازي علب 330 مل × 24", en: "Coca-Cola Cans 330ml x24", cost: 38.00, sale: 48.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "سفن أب", name: "مشروب غازي علب 330 مل × 24", en: "7UP Cans 330ml x24", cost: 36.00, sale: 46.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "ميرندا", name: "مشروب غازي برتقال علب 330 مل × 24", en: "Miranda Orange Cans 330ml x24", cost: 36.00, sale: 46.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "المراعي", name: "عصير برتقال طازج 1.4 لتر", en: "Almarai Fresh Orange Juice 1.4L", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 6 },
  { cat: "beverages", brand: "المراعي", name: "عصير تفاح طازج 1.4 لتر", en: "Almarai Fresh Apple Juice 1.4L", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 6 },
  { cat: "beverages", brand: "المراعي", name: "عصير مانجو طازج 1.4 لتر", en: "Almarai Fresh Mango Juice 1.4L", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 6 },
  { cat: "beverages", brand: "المراعي", name: "عصير كوكتيل فواكه 1 لتر", en: "Almarai Fruit Cocktail Juice 1L", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 12 },
  { cat: "beverages", brand: "ربيع", name: "عصير مشكل طويل الأجل 200 مل × 24", en: "Rabie Mixed Juice 200ml x24", cost: 18.00, sale: 24.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "ربيع", name: "عصير برتقال 125 مل × 18", en: "Rabie Orange Juice 125ml x18", cost: 10.00, sale: 14.00, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "سن توب", name: "عصير مشكل 125 مل × 18", en: "SunTop Mixed Juice 125ml x18", cost: 10.00, sale: 13.50, unit: "كرتون", ctn: 1 },
  { cat: "beverages", brand: "فيمتو", name: "شراب مركز 710 مل", en: "Vimto Cordial 710ml", cost: 10.50, sale: 14.00, unit: "حبة", ctn: 12 },
  { cat: "beverages", brand: "تانج", name: "مسحوق عصير برتقال 2 كجم", en: "Tang Orange Powder 2kg", cost: 28.00, sale: 36.00, unit: "حبة", ctn: 6 },
  { cat: "beverages", brand: "ريد بول", name: "مشروب طاقة 250 مل × 24", en: "Red Bull Energy Drink 250ml x24", cost: 96.00, sale: 120.00, unit: "كرتون", ctn: 1 },

  // ═══ مياه ═══
  { cat: "water", brand: "نوفا", name: "مياه شرب 330 مل × 40", en: "Nova Water 330ml x40", cost: 13.00, sale: 18.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "نوفا", name: "مياه شرب 600 مل × 24", en: "Nova Water 600ml x24", cost: 11.00, sale: 15.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "نوفا", name: "مياه شرب 1.5 لتر × 12", en: "Nova Water 1.5L x12", cost: 10.00, sale: 14.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "أكوافينا", name: "مياه نقية 600 مل × 24", en: "Aquafina Water 600ml x24", cost: 12.00, sale: 16.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "حياة", name: "مياه شرب 1.5 لتر × 12", en: "Hayat Water 1.5L x12", cost: 7.50, sale: 10.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "تانيا", name: "مياه شرب 600 مل × 30", en: "Tania Water 600ml x30", cost: 10.00, sale: 13.00, unit: "كرتون", ctn: 1 },
  { cat: "water", brand: "بيرين", name: "مياه معدنية طبيعية 330 مل × 24", en: "Berain Natural Mineral Water 330ml x24", cost: 9.00, sale: 12.50, unit: "كرتون", ctn: 1 },

  // ═══ لحوم ودواجن ═══
  { cat: "meat_poultry", brand: "ساديا", name: "دجاج كامل مجمد 1100 جم", en: "Sadia Frozen Whole Chicken 1100g", cost: 13.50, sale: 17.50, unit: "حبة", ctn: 10 },
  { cat: "meat_poultry", brand: "ساديا", name: "أفخاذ دجاج مجمدة 900 جم", en: "Sadia Frozen Chicken Thighs 900g", cost: 12.80, sale: 16.50, unit: "حبة", ctn: 10 },
  { cat: "meat_poultry", brand: "ساديا", name: "صدور دجاج مجمدة 2 كجم", en: "Sadia Frozen Chicken Breast 2kg", cost: 35.00, sale: 44.00, unit: "حبة", ctn: 6 },
  { cat: "meat_poultry", brand: "دو", name: "دجاج كامل مجمد 1300 جم × 10", en: "Doux Frozen Whole Chicken 1300g x10", cost: 145.00, sale: 180.00, unit: "كرتون", ctn: 1 },
  { cat: "meat_poultry", brand: "رضوى", name: "صدور دجاج طازجة 450 جم", en: "Radwa Fresh Chicken Breast 450g", cost: 12.00, sale: 15.50, unit: "حبة", ctn: 12 },
  { cat: "meat_poultry", brand: "أمريكانا", name: "برجر لحم بقري 1344 جم 24 حبة", en: "Americana Beef Burger 24s 1344g", cost: 42.00, sale: 54.00, unit: "علبة", ctn: 6 },
  { cat: "meat_poultry", brand: "أمريكانا", name: "ناجتس دجاج 400 جم", en: "Americana Chicken Nuggets 400g", cost: 14.00, sale: 18.00, unit: "حبة", ctn: 12 },
  { cat: "meat_poultry", brand: "أمريكانا", name: "مرتديلا دجاج 500 جم", en: "Americana Chicken Mortadella 500g", cost: 9.50, sale: 12.50, unit: "حبة", ctn: 12 },
  { cat: "meat_poultry", brand: "هيرفي", name: "لحم برجر بقري 1 كجم 20 حبة", en: "Herfy Beef Burger 20s 1kg", cost: 38.00, sale: 48.00, unit: "علبة", ctn: 6 },

  // ═══ أسماك ═══
  { cat: "seafood", brand: "ساديا", name: "فيليه سمك بلطي مجمد 1 كجم", en: "Sadia Frozen Tilapia Fillet 1kg", cost: 22.00, sale: 28.00, unit: "حبة", ctn: 10 },
  { cat: "seafood", brand: "الشهيلي", name: "روبيان مجمد مقشر 500 جم", en: "Al Shahili Peeled Shrimp 500g", cost: 32.00, sale: 42.00, unit: "حبة", ctn: 10 },
  { cat: "seafood", brand: "ساديا", name: "فيليه سمك هامور مجمد 1 كجم", en: "Sadia Frozen Hamour Fillet 1kg", cost: 45.00, sale: 58.00, unit: "حبة", ctn: 10 },

  // ═══ معلبات وصلصات ═══
  { cat: "canned", brand: "العلالي", name: "تونة في زيت دوار الشمس 170 جم", en: "Al Alali Tuna in Sunflower Oil 170g", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 48 },
  { cat: "canned", brand: "العلالي", name: "تونة خفيفة في ماء 170 جم", en: "Al Alali Light Tuna in Water 170g", cost: 6.00, sale: 8.00, unit: "حبة", ctn: 48 },
  { cat: "canned", brand: "العلالي", name: "فول مدمس 400 جم", en: "Al Alali Fava Beans 400g", cost: 3.00, sale: 4.25, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "العلالي", name: "صلصة طماطم 70 جم", en: "Al Alali Tomato Paste 70g", cost: 1.20, sale: 1.75, unit: "حبة", ctn: 48 },
  { cat: "canned", brand: "العلالي", name: "كاتشب طماطم 395 جم", en: "Al Alali Tomato Ketchup 395g", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "حدائق كاليفورنيا", name: "فول مدمس سادة 450 جم", en: "California Garden Plain Fava Beans 450g", cost: 3.50, sale: 4.75, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "حدائق كاليفورنيا", name: "حمص حب بطحينة 400 جم", en: "California Garden Hummus 400g", cost: 4.00, sale: 5.50, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "قودي", name: "صلصة طماطم 500 جم", en: "Goody Tomato Paste 500g", cost: 4.50, sale: 6.00, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "قودي", name: "ذرة حلوة معلبة 340 جم", en: "Goody Sweet Corn 340g", cost: 4.00, sale: 5.50, unit: "حبة", ctn: 24 },
  { cat: "canned", brand: "قودي", name: "ورق عنب محشي 900 جم", en: "Goody Stuffed Grape Leaves 900g", cost: 15.00, sale: 19.50, unit: "حبة", ctn: 12 },
  { cat: "canned", brand: "لونا", name: "حليب مكثف محلى 395 جم", en: "Luna Sweetened Condensed Milk 395g", cost: 6.00, sale: 8.00, unit: "حبة", ctn: 48 },
  { cat: "canned", brand: "هاينز", name: "كاتشب طماطم 570 جم عبوة ضغط", en: "Heinz Tomato Ketchup 570g Squeeze", cost: 10.00, sale: 13.50, unit: "حبة", ctn: 12 },
  { cat: "canned", brand: "ماجي", name: "مرقة دجاج 24 مكعب", en: "Maggi Chicken Stock Cubes 24s", cost: 8.00, sale: 11.00, unit: "علبة", ctn: 24 },

  // ═══ حلويات وشوكولاتة ═══
  { cat: "confectionery", brand: "جالكسي", name: "شوكولاتة حليب ناعمة 56 جم", en: "Galaxy Smooth Milk Chocolate 56g", cost: 3.00, sale: 4.00, unit: "حبة", ctn: 24 },
  { cat: "confectionery", brand: "كتكات", name: "ويفر مغطى بالشوكولاتة 4 أصابع 41 جم", en: "KitKat 4 Fingers 41g", cost: 2.50, sale: 3.50, unit: "حبة", ctn: 24 },
  { cat: "confectionery", brand: "سنيكرز", name: "شوكولاتة بالفول السوداني 52 جم", en: "Snickers Peanut Bar 52g", cost: 2.50, sale: 3.50, unit: "حبة", ctn: 24 },
  { cat: "confectionery", brand: "مارس", name: "شوكولاتة بالكراميل 51 جم", en: "Mars Caramel Bar 51g", cost: 2.50, sale: 3.50, unit: "حبة", ctn: 24 },
  { cat: "confectionery", brand: "تويكس", name: "شوكولاتة بالكراميل 50 جم", en: "Twix Caramel Bar 50g", cost: 2.50, sale: 3.50, unit: "حبة", ctn: 24 },
  { cat: "confectionery", brand: "فيريرو روشيه", name: "شوكولاتة بالبندق 16 حبة 200 جم", en: "Ferrero Rocher 16s 200g", cost: 32.00, sale: 42.00, unit: "علبة", ctn: 6 },
  { cat: "confectionery", brand: "كادبوري", name: "شوكولاتة ديري ميلك 230 جم", en: "Cadbury Dairy Milk 230g", cost: 14.00, sale: 18.00, unit: "حبة", ctn: 12 },

  // ═══ بسكويت وكيك ═══
  { cat: "biscuits", brand: "أولكر", name: "بسكويت الشاي 150 جم", en: "Ulker Tea Biscuits 150g", cost: 2.50, sale: 3.50, unit: "حبة", ctn: 24 },
  { cat: "biscuits", brand: "تيفاني", name: "بسكويت دايجستف بالقمح 250 جم", en: "Tiffany Digestive Biscuits 250g", cost: 4.50, sale: 6.00, unit: "حبة", ctn: 12 },
  { cat: "biscuits", brand: "لوكر", name: "ويفر نابوليتانر 175 جم", en: "Loacker Napolitaner Wafer 175g", cost: 8.00, sale: 10.50, unit: "حبة", ctn: 12 },
  { cat: "biscuits", brand: "أوريو", name: "بسكويت بالكريمة 176 جم", en: "Oreo Original Cookies 176g", cost: 5.00, sale: 7.00, unit: "حبة", ctn: 24 },
  { cat: "biscuits", brand: "ماكفيتيز", name: "بسكويت دايجستف شوكولاتة 300 جم", en: "McVitie's Chocolate Digestive 300g", cost: 8.50, sale: 11.00, unit: "حبة", ctn: 12 },
  { cat: "biscuits", brand: "لوتس", name: "بسكوف سبيكولوز 250 جم", en: "Lotus Biscoff 250g", cost: 10.00, sale: 13.00, unit: "حبة", ctn: 10 },

  // ═══ توابل وبهارات ═══
  { cat: "spices", brand: "إسناد", name: "بهارات مشكلة 200 جم", en: "Isnad Mixed Spices 200g", cost: 7.00, sale: 9.50, unit: "حبة", ctn: 24 },
  { cat: "spices", brand: "إسناد", name: "فلفل أسود مطحون 200 جم", en: "Isnad Ground Black Pepper 200g", cost: 8.00, sale: 10.50, unit: "حبة", ctn: 24 },
  { cat: "spices", brand: "إسناد", name: "كركم ناعم 200 جم", en: "Isnad Ground Turmeric 200g", cost: 6.00, sale: 8.00, unit: "حبة", ctn: 24 },
  { cat: "spices", brand: "إسناد", name: "كمون مطحون 200 جم", en: "Isnad Ground Cumin 200g", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 24 },
  { cat: "spices", brand: "العلالي", name: "مرقة دجاج 20 جم × 24 مكعب", en: "Al Alali Chicken Bouillon 24x20g", cost: 10.00, sale: 13.00, unit: "علبة", ctn: 12 },
  { cat: "spices", brand: "ماجي", name: "خلطة شوربة الشوفان 65 جم", en: "Maggi Oat Soup Mix 65g", cost: 3.00, sale: 4.25, unit: "حبة", ctn: 48 },

  // ═══ قهوة وشاي ═══
  { cat: "coffee_tea", brand: "نسكافيه", name: "قهوة سريعة التحضير ريد مج 200 جم", en: "Nescafe Red Mug Instant Coffee 200g", cost: 22.00, sale: 29.00, unit: "حبة", ctn: 12 },
  { cat: "coffee_tea", brand: "نسكافيه", name: "قهوة سريعة التحضير جولد 100 جم", en: "Nescafe Gold Instant Coffee 100g", cost: 28.00, sale: 36.00, unit: "حبة", ctn: 12 },
  { cat: "coffee_tea", brand: "ليبتون", name: "شاي أسود 100 كيس", en: "Lipton Black Tea 100 bags", cost: 12.00, sale: 16.00, unit: "علبة", ctn: 24 },
  { cat: "coffee_tea", brand: "ليبتون", name: "شاي أخضر 100 كيس", en: "Lipton Green Tea 100 bags", cost: 14.00, sale: 18.00, unit: "علبة", ctn: 24 },
  { cat: "coffee_tea", brand: "باجه", name: "قهوة عربية بالهيل 500 جم", en: "Baja Arabic Coffee with Cardamom 500g", cost: 30.00, sale: 39.00, unit: "حبة", ctn: 12 },
  { cat: "coffee_tea", brand: "أبو جبل", name: "قهوة عربية صافية 250 جم", en: "Abu Jabal Arabic Coffee 250g", cost: 16.00, sale: 21.00, unit: "حبة", ctn: 24 },
  { cat: "coffee_tea", brand: "ربيع", name: "شاي أسود فاخر 200 جم", en: "Rabea Premium Black Tea 200g", cost: 8.00, sale: 10.50, unit: "حبة", ctn: 24 },

  // ═══ منظفات ═══
  { cat: "cleaning", brand: "فيري", name: "سائل غسيل الأطباق بالليمون 1 لتر", en: "Fairy Lemon Dish Liquid 1L", cost: 11.00, sale: 14.50, unit: "حبة", ctn: 12 },
  { cat: "cleaning", brand: "تايد", name: "مسحوق غسيل أوتوماتيك 2.5 كجم", en: "Tide Automatic Washing Powder 2.5kg", cost: 30.00, sale: 38.00, unit: "حبة", ctn: 6 },
  { cat: "cleaning", brand: "بريل", name: "سائل غسيل أطباق 600 مل", en: "Pril Dish Liquid 600ml", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 12 },
  { cat: "cleaning", brand: "داك", name: "مطهر أرضيات بالصنوبر 3 لتر", en: "DAC Pine Floor Disinfectant 3L", cost: 18.50, sale: 24.00, unit: "حبة", ctn: 6 },
  { cat: "cleaning", brand: "كلوركس", name: "مبيض ومعقم 1.89 لتر", en: "Clorox Bleach 1.89L", cost: 8.00, sale: 11.00, unit: "حبة", ctn: 8 },
  { cat: "cleaning", brand: "هاربيك", name: "منظف حمامات 750 مل", en: "Harpic Bathroom Cleaner 750ml", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 12 },
  { cat: "cleaning", brand: "فلاش", name: "منظف أرضيات متعدد 1 لتر", en: "Flash Multi-Surface Cleaner 1L", cost: 8.50, sale: 11.00, unit: "حبة", ctn: 12 },

  // ═══ عناية شخصية ═══
  { cat: "personal_care", brand: "كلينكس", name: "مناديل ورقية 200 منديل × 5", en: "Kleenex Tissues 200s x5", cost: 16.00, sale: 21.00, unit: "حبة", ctn: 6 },
  { cat: "personal_care", brand: "فاين", name: "مناديل معقمة 10 حبات × 10", en: "Fine Wet Wipes 10s x10", cost: 12.00, sale: 16.00, unit: "حبة", ctn: 12 },
  { cat: "personal_care", brand: "كولجيت", name: "معجون أسنان ثلاثي المفعول 125 مل", en: "Colgate Triple Action 125ml", cost: 6.00, sale: 8.00, unit: "حبة", ctn: 24 },
  { cat: "personal_care", brand: "صابون دتول", name: "صابون مضاد للبكتيريا 120 جم × 4", en: "Dettol Antibacterial Soap 120g x4", cost: 12.00, sale: 16.00, unit: "حبة", ctn: 12 },

  // ═══ أطفال وحفاضات ═══
  { cat: "baby", brand: "بامبرز", name: "حفاضات مقاس 4 جامبو 76 حفاضة", en: "Pampers Size 4 Jumbo 76s", cost: 72.00, sale: 92.00, unit: "علبة", ctn: 3 },
  { cat: "baby", brand: "بامبرز", name: "حفاضات مقاس 3 ميجا 104 حفاضة", en: "Pampers Size 3 Mega 104s", cost: 85.00, sale: 108.00, unit: "علبة", ctn: 3 },
  { cat: "baby", brand: "هاجيز", name: "حفاضات مقاس 4 64 حفاضة", en: "Huggies Size 4 64s", cost: 55.00, sale: 70.00, unit: "علبة", ctn: 3 },
  { cat: "baby", brand: "جونسون", name: "شامبو أطفال بدون دموع 500 مل", en: "Johnson's Baby Shampoo 500ml", cost: 18.00, sale: 24.00, unit: "حبة", ctn: 12 },

  // ═══ مخبوزات ═══
  { cat: "bakery", brand: "لوزين", name: "خبز توست أبيض فاخر", en: "Lusine Premium White Toast", cost: 3.80, sale: 5.00, unit: "حبة", ctn: 6 },
  { cat: "bakery", brand: "لوزين", name: "خبز توست بر كامل", en: "Lusine Whole Wheat Toast", cost: 4.00, sale: 5.25, unit: "حبة", ctn: 6 },
  { cat: "bakery", brand: "لوزين", name: "كرواسون شوكولاتة 6 حبات", en: "Lusine Chocolate Croissant 6s", cost: 7.00, sale: 9.00, unit: "علبة", ctn: 6 },
  { cat: "bakery", brand: "لوزين", name: "كيك مربى الفراولة", en: "Lusine Strawberry Jam Cake", cost: 3.00, sale: 4.00, unit: "حبة", ctn: 12 },
  { cat: "bakery", brand: "سويتز", name: "شرائح سمبوسة 500 جم", en: "Switz Sambosa Sheets 500g", cost: 6.50, sale: 8.50, unit: "حبة", ctn: 12 },
  { cat: "bakery", brand: "سويتز", name: "عجينة بف باستري 400 جم", en: "Switz Puff Pastry 400g", cost: 5.50, sale: 7.50, unit: "حبة", ctn: 12 },

  // ═══ أغذية مجمدة ═══
  { cat: "frozen", brand: "السنبلة", name: "بطاطس مقلية مجمدة 2.5 كجم", en: "Sunbulah Frozen French Fries 2.5kg", cost: 16.00, sale: 21.00, unit: "حبة", ctn: 6 },
  { cat: "frozen", brand: "السنبلة", name: "سمبوسة خضار 20 حبة 300 جم", en: "Sunbulah Vegetable Sambosa 20s 300g", cost: 8.00, sale: 11.00, unit: "حبة", ctn: 12 },
  { cat: "frozen", brand: "السنبلة", name: "سبرنج رول دجاج 12 حبة", en: "Sunbulah Chicken Spring Rolls 12s", cost: 12.00, sale: 16.00, unit: "حبة", ctn: 12 },
  { cat: "frozen", brand: "ماكين", name: "بطاطس ويدجز مجمدة 750 جم", en: "McCain Potato Wedges 750g", cost: 10.00, sale: 13.00, unit: "حبة", ctn: 12 },
  { cat: "frozen", brand: "العملاق", name: "بيتزا مارجريتا مجمدة 400 جم", en: "Al Emlaq Margherita Pizza 400g", cost: 9.00, sale: 12.00, unit: "حبة", ctn: 12 },

  // ═══ عسل ومربيات ═══
  { cat: "honey_jam", brand: "الشفاء", name: "عسل طبيعي سدر 500 جم", en: "Al Shifa Natural Sidr Honey 500g", cost: 42.00, sale: 55.00, unit: "حبة", ctn: 12 },
  { cat: "honey_jam", brand: "الشفاء", name: "عسل جبلي 250 جم", en: "Al Shifa Mountain Honey 250g", cost: 24.00, sale: 32.00, unit: "حبة", ctn: 24 },
  { cat: "honey_jam", brand: "هيرو", name: "مربى فراولة 340 جم", en: "Hero Strawberry Jam 340g", cost: 10.00, sale: 13.00, unit: "حبة", ctn: 12 },
  { cat: "honey_jam", brand: "هيرو", name: "مربى مشمش 340 جم", en: "Hero Apricot Jam 340g", cost: 10.00, sale: 13.00, unit: "حبة", ctn: 12 },
  { cat: "honey_jam", brand: "الشعلة", name: "طحينة سائلة فاخرة 500 جم", en: "Al Shalah Premium Tahini 500g", cost: 14.00, sale: 18.00, unit: "حبة", ctn: 12 },
  { cat: "honey_jam", brand: "الكسيح", name: "حلاوة طحينية سادة 500 جم", en: "Al Kasih Plain Halva 500g", cost: 12.00, sale: 16.00, unit: "حبة", ctn: 12 },
  { cat: "honey_jam", brand: "نوتيلا", name: "كريمة البندق بالشوكولاتة 400 جم", en: "Nutella Hazelnut Spread 400g", cost: 18.00, sale: 24.00, unit: "حبة", ctn: 12 },

  // ═══ شيبس ومكسرات ═══
  { cat: "snacks", brand: "ليز", name: "شيبس ملح 170 جم", en: "Lays Salt Chips 170g", cost: 5.50, sale: 7.50, unit: "حبة", ctn: 12 },
  { cat: "snacks", brand: "ليز", name: "شيبس بالخل والملح 170 جم", en: "Lays Salt & Vinegar 170g", cost: 5.50, sale: 7.50, unit: "حبة", ctn: 12 },
  { cat: "snacks", brand: "برينجلز", name: "شيبس أوريجينال 165 جم", en: "Pringles Original 165g", cost: 8.00, sale: 10.50, unit: "حبة", ctn: 12 },
  { cat: "snacks", brand: "شيتوس", name: "شيبس جبنة 90 جم × 20", en: "Cheetos Cheese 90g x20", cost: 28.00, sale: 36.00, unit: "كرتون", ctn: 1 },
  { cat: "snacks", brand: "حصاد", name: "فول سوداني محمص مملح 500 جم", en: "Hasad Roasted Salted Peanuts 500g", cost: 12.00, sale: 16.00, unit: "حبة", ctn: 12 },
  { cat: "snacks", brand: "الكوثر", name: "مكسرات مشكلة فاخرة 450 جم", en: "Al Kawthar Premium Mixed Nuts 450g", cost: 35.00, sale: 45.00, unit: "حبة", ctn: 12 },
  { cat: "snacks", brand: "الكوثر", name: "كاجو محمص مملح 350 جم", en: "Al Kawthar Roasted Cashews 350g", cost: 30.00, sale: 39.00, unit: "حبة", ctn: 12 },
];

// ── Templates for generating additional realistic names ──────
const NAME_TEMPLATES = {
  dairy: { brands: ["المراعي","نادك","الصافي","بوك","كيري","راحة","السعودية"], items: ["جبنة موزاريلا مبشورة","جبنة ريكوتا","زبادي يوناني","حليب بالفانيلا","حليب بالشوكولاتة","آيس كريم فانيلا","لبن عيران","جبنة شيدر مكعبات","قشطة بلدي","حليب بالفراولة","زبادي بالعسل","جبنة جودة شرائح","جبنة بارميزان","زبدة مملحة"], sizes: ["200 جم","400 جم","500 جم","1 كجم","250 مل","1 لتر"] },
  oils: { brands: ["عافية","مازولا","العربي","سافولا","شمس","كريستال","الوزير"], items: ["زيت ذرة","زيت دوار الشمس","زيت نباتي للقلي","زيت زيتون","زيت كانولا","سمن نباتي","سمن بقري","زيت جوز الهند","زيت سمسم"], sizes: ["500 مل","750 مل","1 لتر","1.5 لتر","1.8 لتر","2 لتر","4 لتر","5 لتر"] },
  rice_grains: { brands: ["أبو كاس","المهيدب","بنجابي","الشعلان","الأمير","بدر","الوليمة"], items: ["أرز بسمتي أبيض","أرز بسمتي ذهبي","أرز سيلا بسمتي","أرز مصري","أرز كالروز","فريكة خشنة","برغل ناعم","برغل خشن","فاصوليا حمراء","عدس بني","ماش أخضر"], sizes: ["1 كجم","2 كجم","5 كجم","10 كجم","20 كجم","40 كجم"] },
  dry_goods: { brands: ["قودي","الأسرة","مطاحن الأولى","كويكر","الطبيعة","بيتي"], items: ["مكرونة فوتشيني","مكرونة لازانيا","شعيرية رفيعة","كسكس فاخر","نشا ذرة","بيكنج بودر","خميرة فورية","دقيق ذرة","فتات الخبز","كورن فليكس"], sizes: ["200 جم","400 جم","500 جم","1 كجم","2 كجم"] },
  beverages: { brands: ["بيبسي","كوكاكولا","سفن أب","ميرندا","فانتا","ماونتن ديو","ربيع","سن توب","فيمتو","المراعي"], items: ["مشروب غازي","عصير أناناس","عصير جوافة","عصير ليمون","عصير كوكتيل","مشروب طاقة","مشروب رياضي","نكتار فراولة","شراب توت","عصير عنب"], sizes: ["200 مل","250 مل","330 مل","500 مل","1 لتر","1.4 لتر","2.25 لتر"] },
  water: { brands: ["نوفا","أكوافينا","حياة","تانيا","بيرين","هنا","صحة","الهدا"], items: ["مياه شرب نقية","مياه معدنية طبيعية","مياه قلوية","مياه فوارة"], sizes: ["200 مل","330 مل","500 مل","600 مل","1 لتر","1.5 لتر","5 جالون","10 لتر"] },
  meat_poultry: { brands: ["ساديا","دو","رضوى","أمريكانا","هيرفي","كوردون بلو","التنمية"], items: ["دجاج كامل مجمد","أجنحة دجاج","كبدة دجاج","لحم بقري مفروم","ستيك بقري","سجق دجاج","هوت دوج بقري","شاورما دجاج مجمدة"], sizes: ["400 جم","500 جم","900 جم","1 كجم","2 كجم"] },
  seafood: { brands: ["ساديا","الشهيلي","بحر الجنوب","سي ماستر"], items: ["فيليه سمك بلطي","روبيان مجمد","فيليه سمك سلمون","كالاماري حلقات","كفتة سمك","فيليه هامور","سمك باسا مجمد"], sizes: ["400 جم","500 جم","1 كجم","2 كجم"] },
  canned: { brands: ["العلالي","قودي","حدائق كاليفورنيا","لونا","هاينز","ديل مونتي","ليبيز"], items: ["طماطم مقشرة كاملة","بازلاء خضراء","فاصوليا حمراء","زيتون أخضر محشو","زيتون أسود شرائح","فطر مشروم","أناناس شرائح","خوخ نصفين","مايونيز","صلصة باستا","صلصة بيتزا","خردل فرنسي"], sizes: ["70 جم","200 جم","340 جم","400 جم","500 جم","800 جم","2.2 كجم"] },
  confectionery: { brands: ["جالكسي","كتكات","سنيكرز","مارس","كادبوري","نستله","فيريرو","ليندت","توبليرون"], items: ["شوكولاتة داكنة","شوكولاتة بيضاء","شوكولاتة باللوز","ملبس بالشوكولاتة","بونبون كراميل","حلقوم تركي","حلوى جيلي"], sizes: ["36 جم","50 جم","75 جم","100 جم","200 جم","300 جم"] },
  biscuits: { brands: ["أولكر","تيفاني","ماكفيتيز","أوريو","لوكر","لوتس","بارلي"], items: ["بسكويت سادة","بسكويت بالزبدة","ويفر بالشوكولاتة","ويفر بالبندق","كيك شوكولاتة","مافن بالتوت","رولو كيك"], sizes: ["75 جم","150 جم","200 جم","250 جم","300 جم","400 جم"] },
  spices: { brands: ["إسناد","ماجي","كنور","العطار","فرشلي"], items: ["بابريكا حلوة","زنجبيل مطحون","قرفة مطحونة","هيل حب","زعفران أصلي","فلفل أحمر حار","أوريغانو مجفف","ريحان مجفف","ملح بحري خشن","ملح ثوم"], sizes: ["50 جم","100 جم","200 جم","500 جم"] },
  coffee_tea: { brands: ["نسكافيه","ليبتون","باجه","أبو جبل","ربيع","تويننجز","ستاربكس"], items: ["قهوة تركية","كابتشينو فوري","لاتيه فوري","شاي أخضر بالنعناع","شاي بالأعشاب","قهوة فرنسية","إسبريسو حبوب كاملة","شاي إيرل جراي"], sizes: ["100 جم","200 جم","250 جم","500 جم","25 كيس","100 كيس"] },
  cleaning: { brands: ["فيري","تايد","بريل","داك","كلوركس","هاربيك","فلاش","أريال","داوني"], items: ["منعم أقمشة","مزيل بقع","منظف زجاج","سائل جلي","معطر جو","أكياس قمامة كبيرة","فوط مبللة للأرضيات","صابون يدين سائل"], sizes: ["500 مل","750 مل","1 لتر","2 لتر","3 لتر","4 لتر"] },
  personal_care: { brands: ["كلينكس","فاين","كولجيت","دتول","جونسون","نيفيا","هيد آند شولدرز","بانتين"], items: ["ورق تواليت 12 رول","شامبو ضد القشرة","بلسم شعر","غسول وجه","كريم مرطب","مزيل عرق","جل استحمام","فرشاة أسنان"], sizes: ["100 مل","200 مل","400 مل","500 مل","750 مل"] },
  baby: { brands: ["بامبرز","هاجيز","بيبي جوي","جونسون","سيميلاك"], items: ["حفاضات مقاس 2","حفاضات مقاس 5","حفاضات مقاس 6","مناديل مبللة 72 منديل","حليب أطفال رقم 1","حليب أطفال رقم 2","شامبو أطفال","لوشن أطفال","كريم حفاضات","زيت أطفال"], sizes: ["200 مل","400 جم","900 جم","24 حفاضة","48 حفاضة","64 حفاضة"] },
  bakery: { brands: ["لوزين","سويتز","المطاحن","بيمبو","سارة لي"], items: ["خبز صامولي","خبز برجر","تورتيلا قمح","بان كيك جاهز","خبز شوفان","رقائق فطيرة","عجينة كنافة"], sizes: ["6 حبات","8 حبات","10 حبات","500 جم","1 كجم"] },
  frozen: { brands: ["السنبلة","ماكين","أمريكانا","العملاق","سويتز"], items: ["خضار مشكلة مجمدة","بامية مجمدة","ملوخية مجمدة","فراولة مجمدة","بطاطس كتف مجمدة","كروكيت بطاطس","فلافل جاهزة","كبة مجمدة"], sizes: ["400 جم","500 جم","900 جم","1 كجم","2.5 كجم"] },
  honey_jam: { brands: ["الشفاء","هيرو","لاند أو ليكس","نوتيلا","الكسيح","الشعلة"], items: ["عسل زهور طبيعي","مربى برتقال","مربى تين","مربى توت","دبس رمان","دبس تمر","زبدة فول سوداني","كريمة لوتس","طحينة خام"], sizes: ["250 جم","340 جم","500 جم","1 كجم"] },
  snacks: { brands: ["ليز","برينجلز","شيتوس","دوريتوس","حصاد","الكوثر","المنيع"], items: ["شيبس بالشطة","شيبس بالباربكيو","ناتشوز جبنة","بسكويت مملح","فشار بالزبدة","بذور دوار الشمس","لوز محمص","فستق حلبي","تمر سكري فاخر","تمر عجوة المدينة"], sizes: ["50 جم","100 جم","165 جم","250 جم","500 جم","1 كجم"] },
};

// ── Core Seeder Logic ────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = `
    <div class="page-content animate-fade-in">
      <div class="page-header" style="border-bottom: 1px solid var(--border-soft); padding-bottom:14px; margin-bottom: 20px;">
        <h1 class="page-title">مضيف الأصناف — منتجات سعودية حقيقية</h1>
        <p class="page-subtitle">توليد وإدخال بيانات حقيقية للأصناف والمواد الغذائية الموجودة في السوق السعودي</p>
      </div>

      <div class="grid-3 gap-16 mb-20">
        <div class="card" style="padding:20px; background:linear-gradient(135deg,#1c212d,#252e3d); height:160px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">إجمالي الأصناف الحالية</div>
            <div style="font-size:28px; font-weight:800; color:var(--brand); font-family:monospace;" id="seeder-current-count">جلب البيانات…</div>
          </div>
          <p class="dim" style="font-size:11px;">الأصناف المخزنة في Firestore حالياً</p>
        </div>
        <div class="card" style="padding:20px; background:linear-gradient(135deg,#1c212d,#1f3833); height:160px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">المنتجات الحقيقية المتاحة</div>
            <div style="font-size:28px; font-weight:800; color:#10B981; font-family:monospace;">${REAL_PRODUCTS.length}+ منتج</div>
          </div>
          <p class="dim" style="font-size:11px;">منتجات بأسماء وماركات سعودية حقيقية (المراعي، نادك، قودي...)</p>
        </div>
        <div class="card" style="padding:20px; background:linear-gradient(135deg,#1c212d,#35231c); height:160px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">حالة المعالجة</div>
            <div style="font-size:24px; font-weight:800; color:var(--orange); font-family:var(--font-heading);" id="seeder-status">جاهز للبث</div>
          </div>
          <p class="dim" style="font-size:11px;">20 فئة × أسماء واقعية × أحجام وأوزان متنوعة</p>
        </div>
      </div>

      <div class="grid-2 gap-16 mb-20">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="card" style="padding:20px;">
            <h3 style="font-size:15px; font-weight:700; margin-bottom:14px; border-bottom:1px solid var(--border-soft); padding-bottom:8px; color:var(--brand);">لوحة التحكم</h3>
            <div class="form-group mb-16">
              <label>كمية التوليد</label>
              <select id="seeder-target-qty" class="input">
                <option value="200">200 منتج حقيقي (أساسي)</option>
                <option value="500">500 منتج (متوسط)</option>
                <option value="1000" selected>1,000 منتج (موصى به)</option>
                <option value="2000">2,000 منتج (شامل)</option>
                <option value="5000">5,000 منتج (ERP كامل)</option>
              </select>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
              <button class="btn btn-primary" style="flex:1;" onclick="startSeeding()" id="seeder-start-btn">بدء توليد المنتجات</button>
              <button class="btn btn-secondary" onclick="clearAllProducts()" id="seeder-clear-btn" style="color:var(--bad); border-color:var(--bad);">تفريغ الكل 🗑️</button>
            </div>
            <div style="margin-top:24px;" id="seeder-progress-container" class="hidden">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                <span id="seeder-progress-label">جارٍ التوليد…</span>
                <span class="mono" id="seeder-progress-pct">0%</span>
              </div>
              <div style="background:var(--bg-3); height:8px; border-radius:4px; overflow:hidden;">
                <div style="background:var(--brand); width:0%; height:100%; transition:width 0.2s;" id="seeder-progress-bar"></div>
              </div>
            </div>
          </div>

          <div class="card" style="padding:20px; border:1px dashed var(--brand);">
            <h3 style="font-size:15px; font-weight:700; margin-bottom:8px; color:var(--brand);">📥 استيراد وحقن شيت تقرير الطلبيات الموحد</h3>
            <p class="dim" style="font-size:11px; line-height:1.4; margin-bottom:14px;">اختر ملف Excel (تقرير_الطلبيات_الموحد.xlsx) لتوليد وحقن الأصناف والتصنيفات تلقائياً بدون تكرار.</p>
            <div class="form-group mb-12">
              <input type="file" id="xlsx-file-input" accept=".xlsx, .xls" class="input" style="padding:6px; font-size:12px;" />
            </div>
            <button class="btn btn-secondary" style="width:100%; border-color:var(--brand); color:var(--brand); font-weight:bold; font-size:12px;" onclick="importExcelProducts()" id="xlsx-import-btn">
              ⚡ بدء الحقن من ملف Excel
            </button>
          </div>
        </div>

        <div class="card" style="padding:20px;">
          <h3 style="font-size:15px; font-weight:700; margin-bottom:14px; border-bottom:1px solid var(--border-soft); padding-bottom:8px; color:var(--brand);">الفئات (${CATEGORIES.length} فئة)</h3>
          <div style="max-height:220px; overflow-y:auto;">
            <table class="data-dense" style="width:100%; font-size:12px;">
              <thead><tr><th>الأيقونة</th><th>الفئة</th><th>الكود</th></tr></thead>
              <tbody>
                ${CATEGORIES.map(c => `<tr><td>${c.icon}</td><td><strong>${c.name}</strong></td><td class="mono dim">${c.id}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card" style="padding:20px;">
        <h3 style="font-size:15px; font-weight:700; margin-bottom:12px; color:var(--brand);">سجل العمليات</h3>
        <div id="seeder-logs" style="background:#0c0f16; border:1px solid var(--border-soft); border-radius:8px; padding:12px; font-family:monospace; font-size:12px; color:#22c55e; height:200px; overflow-y:auto; line-height:1.6;">
          [Ready] اضغط على "بدء توليد المنتجات" للبدء...
        </div>
      </div>
    </div>
  `;

  await updateCurrentCount();
  window.startSeeding = startSeeding;
  window.clearAllProducts = clearAllProducts;
  window.importExcelProducts = importExcelProducts;
}

async function updateCurrentCount() {
  const lbl = document.getElementById("seeder-current-count");
  if (!lbl) return;
  try {
    const allDocs = await getDocs(COLS.products());
    lbl.textContent = `${allDocs.size} صنف`;
  } catch (e) { lbl.textContent = "خطأ في الاتصال"; }
}

function addLog(msg, type = "success") {
  const box = document.getElementById("seeder-logs");
  if (!box) return;
  const colors = { success: "#22c55e", info: "#3b82f6", warn: "#f59e0b", error: "#ef4444" };
  box.innerHTML += `<div style="color:${colors[type] || colors.success}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  box.scrollTop = box.scrollHeight;
}

// Generate a realistic product name for a category
function generateProductName(catId, index) {
  const tpl = NAME_TEMPLATES[catId];
  if (!tpl) return null;
  const brand = tpl.brands[index % tpl.brands.length];
  const item  = tpl.items[index % tpl.items.length];
  const size  = tpl.sizes[index % tpl.sizes.length];
  // Vary combination
  const brandIdx = Math.floor(index / tpl.items.length) % tpl.brands.length;
  const itemIdx  = index % tpl.items.length;
  const sizeIdx  = Math.floor(index / (tpl.items.length * 2)) % tpl.sizes.length;
  const b = tpl.brands[brandIdx];
  const i = tpl.items[itemIdx];
  const s = tpl.sizes[sizeIdx];
  return { brand: b, nameAr: `${i} ${s}`, nameEn: `${b} ${i} ${s}` };
}

// ── Clear Collection Helper ──────────────────────────────────
async function clearCollection(colRef, name) {
  addLog(`بدء حذف محتويات ${name}...`, "warn");
  const snap = await getDocs(colRef);
  let batch = writeBatch(db);
  let count = 0;
  for (const d of snap.docs) {
    batch.delete(d.ref);
    count++;
    if (count % 500 === 0) {
      await batch.commit();
      addLog(`تم حذف ${count} من ${name}...`, "info");
      batch = writeBatch(db);
    }
  }
  if (count % 500 !== 0) {
    await batch.commit();
  }
  addLog(`✅ تم إفراغ ${name} بالكامل (${count} سجل)`, "success");
}

// ── Clear All ────────────────────────────────────────────────
async function clearAllProducts() {
  if (!confirm("⚠️ هل أنت متأكد من حذف جميع المنتجات والمستودعات والتصنيفات والأرصدة؟ لا يمكن التراجع!")) return;
  const startBtn = document.getElementById("seeder-start-btn");
  const clearBtn = document.getElementById("seeder-clear-btn");
  const statusEl = document.getElementById("seeder-status");
  startBtn.disabled = true; clearBtn.disabled = true;
  statusEl.textContent = "جاري الحذف…";
  
  try {
    await clearCollection(COLS.products(), "كتالوج المنتجات");
    await clearCollection(COLS.stockByWarehouse(), "أرصدة المخازن");
    await clearCollection(COLS.stockTransactions(), "حركات ودفعات المخزون");
    await clearCollection(COLS.warehouses(), "المستودعات");
    await clearCollection(COLS.categories(), "تصنيفات الفئات");
    addLog(`✅ تم تصفية قاعدة بيانات المخزون بالكامل بنجاح!`, "success");
    await updateCurrentCount();
  } catch (e) {
    addLog(`❌ خطأ: ${e.message}`, "error");
  } finally {
    startBtn.disabled = false;
    clearBtn.disabled = false;
    statusEl.textContent = "جاهز للبث";
  }
}

// ── Seed Categories ──────────────────────────────────────────
async function seedCategories() {
  addLog("تأكيد وجود تصنيفات الفئات في قاعدة البيانات...", "info");
  const snap = await getDocs(COLS.categories());
  if (snap.size === 0) {
    addLog("لم يتم العثور على فئات. جاري إنشاء 20 فئة افتراضية...", "info");
    let batch = writeBatch(db);
    CATEGORIES.forEach(c => {
      const docRef = doc(COLS.categories(), c.id);
      batch.set(docRef, {
        name: c.name,
        code: c.id,
        icon: c.icon || "📦",
        description: `أصناف تابعة لقسم ${c.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    await batch.commit();
    addLog("✅ تم إنشاء الفئات بنجاح في قاعدة البيانات", "success");
  } else {
    addLog("✅ الفئات موجودة بالفعل في قاعدة البيانات", "success");
  }
}

// ── Seed Stock & Warehouses ──────────────────────────────────
async function seedStockAndWarehouses() {
  addLog("بدء أتمتة المخازن والأرصدة الافتتاحية...", "info");
  
  // 1. Seed Warehouses
  const warehousesData = [
    { id: "wh_main", name: "المستودع الرئيسي للمواد الجافة", prefix: "WH-MAIN", type: "Main", storageTemperature: "ambient", active: true },
    { id: "wh_jed", name: "مستودع جدة الإقليمي", prefix: "WH-JED", type: "Branch", storageTemperature: "ambient", active: true },
    { id: "wh_dam", name: "مستودع الدمام المبرد", prefix: "WH-DAM", type: "Chilled", storageTemperature: "chilled", active: true }
  ];

  let whBatch = writeBatch(db);
  warehousesData.forEach(w => {
    const docRef = doc(COLS.warehouses(), w.id);
    whBatch.set(docRef, {
      name: w.name,
      prefix: w.prefix,
      type: w.type,
      storageTemperature: w.storageTemperature,
      active: w.active,
      manager: "علي فياض",
      phone: "0501234567",
      location: "المنطقة الصناعية",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  await whBatch.commit();
  addLog("✅ تم إنشاء المستودعات الافتراضية", "success");

  // 2. Fetch all products to seed stock for
  const prodSnap = await getDocs(COLS.products());
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  // We only seed stock balances for the first 300 products to prevent client-side freezing and Firestore write capacity timeout!
  const targetProductsForStock = products.slice(0, 300);
  addLog(`جاري إنشاء أرصدة وحركات لـ ${targetProductsForStock.length} صنف من أصل ${products.length}...`, "info");

  let stockBatch = writeBatch(db);
  let count = 0;
  let idx = 0;

  for (const p of targetProductsForStock) {
    // Generate opening stocks for main and jeddah
    const stocks = [
      { whId: "wh_main", qty: Math.floor(120 + Math.random() * 300) },
      { whId: "wh_jed", qty: Math.floor(40 + Math.random() * 150) }
    ];

    stocks.forEach(st => {
      const docId = `${st.whId}_${p.id}`;
      const stockRef = doc(COLS.stockByWarehouse(), docId);
      stockBatch.set(stockRef, {
        warehouseId: st.whId,
        productId: p.id,
        qty: st.qty,
        stockStatus: "ok",
        reorderLevel: p.reorderLevel || 30,
        updatedAt: new Date()
      });

      const txRef = doc(COLS.stockTransactions());
      stockBatch.set(txRef, {
        warehouseId: st.whId,
        productId: p.id,
        qtyBefore: 0,
        qtyChange: st.qty,
        qtyAfter: st.qty,
        type: "adjustment",
        documentNumber: "OB-2026",
        notes: "رصيد افتتاحي تلقائي",
        createdAt: new Date()
      });

      count += 2;
    });

    idx++;
    if (idx % 50 === 0) {
      addLog(`تم إنشاء الأرصدة لـ ${idx} صنف...`, "info");
    }

    if (count >= 400) {
      await stockBatch.commit();
      // Yield back to browser to allow UI rendering
      await new Promise(resolve => setTimeout(resolve, 50));
      stockBatch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await stockBatch.commit();
  }
  addLog("✅ تم توليد الأرصدة الافتتاحية بنجاح وتوزيعها على المخازن!", "success");
}

// ── Core Seeding ─────────────────────────────────────────────
async function startSeeding() {
  const startBtn = document.getElementById("seeder-start-btn");
  const clearBtn = document.getElementById("seeder-clear-btn");
  const statusEl = document.getElementById("seeder-status");
  const progContainer = document.getElementById("seeder-progress-container");
  const progBar = document.getElementById("seeder-progress-bar");
  const progPct = document.getElementById("seeder-progress-pct");
  const progLabel = document.getElementById("seeder-progress-label");
  const totalToSeed = parseInt(document.getElementById("seeder-target-qty").value) || 200;

  startBtn.disabled = true; clearBtn.disabled = true;
  statusEl.textContent = "جاري البث…";
  progContainer.classList.remove("hidden");
  addLog(`بدء توليد ${totalToSeed} منتج سعودي حقيقي...`, "info");

  try {
    // Check/seed categories first
    await seedCategories();

    // Check existing
    const existingSnap = await getDocs(COLS.products());
    const existingSKUs = new Set(existingSnap.docs.map(d => d.data().sku));
    addLog(`${existingSKUs.size} منتج موجود مسبقاً. سيتم تجاوز المكررات.`, "info");

    const catMap = {};
    CATEGORIES.forEach(c => catMap[c.id] = c.name);

    let itemsCreated = 0;
    let batch = writeBatch(db);
    const catCounters = {};

    for (let i = 0; i < totalToSeed; i++) {
      let productData;

      if (i < REAL_PRODUCTS.length) {
        // ── Use real hand-picked product ──
        const p = REAL_PRODUCTS[i];
        const catNum = String(CATEGORIES.findIndex(c => c.id === p.cat) + 1).padStart(2, "0");
        catCounters[p.cat] = (catCounters[p.cat] || 0) + 1;
        const itemNum = String(catCounters[p.cat]).padStart(3, "0");
        const sku = `${catNum}${itemNum}`;

        if (existingSKUs.has(sku)) continue;

        const barcode = `628200${String(i + 1).padStart(7, "0")}`;

        productData = {
          sku,
          name: `${p.name} - ${p.brand}`,
          nameAr: `${p.name} - ${p.brand}`,
          nameEn: p.en,
          barcode,
          category: p.cat,
          categoryName: catMap[p.cat] || p.cat,
          unit: p.unit || "حبة",
          altUnit: "كرتون",
          unitFactor: p.ctn || 12,
          costPrice: p.cost,
          salePrice: p.sale,
          purchasePrice: p.cost,
          priceRetail: p.sale,
          priceWholesale: +(p.sale * 0.9).toFixed(2),
          priceDistributor: +(p.sale * 0.82).toFixed(2),
          minimumQuantity: 10,
          maximumQuantity: 1000,
          reorderLevel: 30,
          safetyStock: 15,
          economicOrderQuantity: 100,
          leadTime: 7,
          taxCategory: "S",
          tracking: "batch",
          shelfLife: 365,
          storageTemperature: "dry",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        // ── Generate realistic synthetic product ──
        const cat = CATEGORIES[i % CATEGORIES.length];
        const catNum = String(CATEGORIES.indexOf(cat) + 1).padStart(2, "0");
        catCounters[cat.id] = (catCounters[cat.id] || 0) + 1;
        const itemNum = String(catCounters[cat.id]).padStart(3, "0");
        const sku = `${catNum}${itemNum}`;

        if (existingSKUs.has(sku)) continue;

        const barcode = `628200${String(i + 1).padStart(7, "0")}`;
        const genIdx = Math.floor(i / CATEGORIES.length);
        const gen = generateProductName(cat.id, genIdx);

        if (!gen) continue;

        const baseCost = 5 + (genIdx % 60) + Math.random() * 10;
        const margin = 1.2 + Math.random() * 0.15;

        productData = {
          sku,
          name: `${gen.nameAr} - ${gen.brand}`,
          nameAr: `${gen.nameAr} - ${gen.brand}`,
          nameEn: `${gen.brand} ${gen.nameAr}`,
          barcode,
          category: cat.id,
          categoryName: cat.name,
          unit: "حبة",
          altUnit: "كرتون",
          unitFactor: 12,
          costPrice: +baseCost.toFixed(2),
          salePrice: +(baseCost * margin).toFixed(2),
          purchasePrice: +baseCost.toFixed(2),
          priceRetail: +(baseCost * margin).toFixed(2),
          priceWholesale: +(baseCost * margin * 0.9).toFixed(2),
          priceDistributor: +(baseCost * margin * 0.82).toFixed(2),
          minimumQuantity: 20,
          maximumQuantity: 2000,
          reorderLevel: 50,
          safetyStock: 25,
          economicOrderQuantity: 200,
          leadTime: 10,
          taxCategory: "S",
          tracking: "batch",
          shelfLife: 180,
          storageTemperature: "dry",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      const docRef = doc(COLS.products(), productData.sku);
      batch.set(docRef, productData);
      itemsCreated++;

      if (itemsCreated % 200 === 0 || i === totalToSeed - 1) {
        await batch.commit();
        batch = writeBatch(db);
        const pct = Math.round(((i + 1) / totalToSeed) * 100);
        progBar.style.width = `${pct}%`;
        progPct.textContent = `${pct}%`;
        progLabel.textContent = `تم بذر ${i + 1} / ${totalToSeed} منتج...`;
        addLog(`✅ تم حفظ ${i + 1} منتج في Firestore`, "info");
      }
    }

    // Commit remaining
    if (itemsCreated % 200 !== 0) await batch.commit();

    // Generate initial stock and warehouses automatically
    await seedStockAndWarehouses();

    addLog(`🎉 اكتملت العملية! تم توليد ${itemsCreated} منتج سعودي حقيقي.`, "success");
    statusEl.textContent = "اكتمل البث ✅";
    progBar.style.width = "100%";
    progPct.textContent = "100%";
    await updateCurrentCount();
    
    // Invalidate products and inventory pages cache
    if (window.invalidatePageCache) {
      window.invalidatePageCache("products");
      window.invalidatePageCache("inventory-dashboard");
      window.invalidatePageCache("inventory-reports");
      window.invalidatePageCache("warehouses");
    }

    // Visual notifications for user
    if (typeof window.showToast === "function") {
      window.showToast("🎉 تم اكتمال توليد المنتجات وتوزيع الأرصدة الافتتاحية بنجاح!", "success");
    }
    window.alert("🎉 اكتمل البث والتهيئة بنجاح!\nتم إنشاء المنتجات وتوزيع الأرصدة الافتتاحية على المستودعات بنجاح.");
  } catch (e) {
    addLog(`❌ خطأ: ${e.message}`, "error");
    statusEl.textContent = "خطأ ❌";
  } finally {
    startBtn.disabled = false;
    clearBtn.disabled = false;
  }
}

// ── Import Products from Excel Sheet ─────────────────────────
async function importExcelProducts() {
  const fileInput = document.getElementById("xlsx-file-input");
  const importBtn = document.getElementById("xlsx-import-btn");
  const statusEl = document.getElementById("seeder-status");
  
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("يرجى اختيار ملف Excel أولاً!");
    return;
  }
  
  const file = fileInput.files[0];
  importBtn.disabled = true;
  statusEl.textContent = "جاري استيراد Excel…";
  addLog(`بدء معالجة ملف Excel: ${file.name}`, "info");

  try {
    // 1. Dynamically load SheetJS if not already loaded
    if (typeof XLSX === "undefined") {
      addLog("جاري تحميل مكتبة SheetJS...", "info");
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      addLog("✅ تم تحميل مكتبة SheetJS بنجاح", "success");
    }

    // 2. Read File
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = "التقرير المجمع";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`شيت '${sheetName}' غير موجود في الملف!`);
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    addLog(`تم قراءة ${rows.length} سطر من ملف Excel`, "info");

    // Headers are at row index 3
    const headers = rows[3];
    if (!headers || !headers.includes("الصنف") || !headers.includes("الوحدة")) {
      throw new Error("تنسيق الشيت غير مطابق! يجب أن يحتوي على عمود 'الصنف' وعمود 'الوحدة' في السطر الرابع.");
    }

    const colIdx = {
      name: headers.indexOf("الصنف"),
      unit: headers.indexOf("الوحدة")
    };

    // Filter valid rows (starting from row index 4)
    const validRows = rows.slice(4).filter(r => r[colIdx.name] && String(r[colIdx.name]).trim() !== "" && String(r[colIdx.name]).trim() !== "—");
    addLog(`تم العثور على ${validRows.length} صنف مرشح للحقن`, "info");

    // Fetch existing products and categories
    const [existingProdSnap, existingCatSnap] = await Promise.all([
      getDocs(COLS.products()),
      getDocs(COLS.categories())
    ]);

    const existingNames = new Set(existingProdSnap.docs.map(d => d.data().name.trim().toLowerCase()));
    const existingCats = new Map(existingCatSnap.docs.map(d => [d.id, d.data().name]));

    const defaultCatsDef = {
      dairy: { name: "ألبان ومنتجاتها", icon: "🥛" },
      oils: { name: "زيوت وسمن", icon: "🌻" },
      rice_grains: { name: "أرز وحبوب", icon: "🌾" },
      dry_goods: { name: "سكر ودقيق ومعجنات", icon: "🍞" },
      beverages: { name: "مشروبات وعصائر", icon: "🧃" },
      water: { name: "مياه معبأة", icon: "💧" },
      meat_poultry: { name: "لحوم ودواجن مجمدة", icon: "🍗" },
      seafood: { name: "أسماك ومأكولات بحرية", icon: "🐟" },
      canned: { name: "معلبات وصلصات", icon: "🥫" },
      confectionery: { name: "حلويات وشوكولاتة", icon: "🍫" },
      biscuits: { name: "بسكويت وكيك", icon: "🍪" },
      spices: { name: "توابل وبهارات", icon: "🧂" },
      coffee_tea: { name: "قهوة وشاي", icon: "☕" },
      cleaning: { name: "منظفات ومعطرات", icon: "🧴" },
      personal_care: { name: "عناية شخصية وورقيات", icon: "🧻" },
      baby: { name: "أطفال وحفاضات", icon: "👶" },
      bakery: { name: "مخبوزات وخبز", icon: "🥖" },
      frozen: { name: "أغذية مجمدة", icon: "🧊" },
      honey_jam: { name: "عسل ومربيات وطحينة", icon: "🍯" },
      snacks: { name: "شيبس ومكسرات", icon: "🥜" },
      
      // New custom categories requested
      packaging: { name: "مواد التعبئة والتغليف", icon: "🛍️" },
      charcoal_wood: { name: "فحم وحطب", icon: "🔥" },
      produce: { name: "خضروات وفواكه طازجة", icon: "🍅" }
    };

    let itemsCreated = 0;
    let categoriesCreated = 0;
    const { writeBatch, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    let batch = writeBatch(db);

    for (let r of validRows) {
      const name = String(r[colIdx.name]).trim();
      const unit = String(r[colIdx.unit] || "حبة").trim();

      if (existingNames.has(name.toLowerCase())) {
        continue; // Skip duplicates
      }

      // Classify category based on keywords
      let catId = "dry_goods"; // default
      const lowerName = name.toLowerCase();

      if (lowerName.includes("فحم") || lowerName.includes("حطب") || lowerName.includes("شعل")) {
        catId = "charcoal_wood";
      } else if (
        lowerName.includes("علب") || lowerName.includes("علبة") || lowerName.includes("بلاستيك") || 
        lowerName.includes("سفري") || lowerName.includes("ورق") || lowerName.includes("أكياس") || 
        lowerName.includes("رول") || lowerName.includes("تغليف") || lowerName.includes("صحن") || 
        lowerName.includes("قصدير") || lowerName.includes("غطاء") || lowerName.includes("كوب") || 
        lowerName.includes("أكواب") || lowerName.includes("مصاص") || lowerName.includes("شوك") || 
        lowerName.includes("ملاعق") || lowerName.includes("سكاكين") || lowerName.includes("جونتي") || 
        lowerName.includes("قفاز") || lowerName.includes("كاسات") || lowerName.includes("حافظة") || 
        lowerName.includes("سفره") || lowerName.includes("سفرة") || lowerName.includes("نايلون") || 
        lowerName.includes("صحون") || lowerName.includes("دفتر") || lowerName.includes("دفاتر") || 
        lowerName.includes("كرتون")
      ) {
        catId = "packaging";
      } else if (
        lowerName.includes("منظف") || lowerName.includes("صابون") || lowerName.includes("مطهر") || 
        lowerName.includes("كلور") || lowerName.includes("ديتول") || lowerName.includes("سلك") || 
        lowerName.includes("اسفنج") || lowerName.includes("موج") || lowerName.includes("بريل") || 
        lowerName.includes("فيري") || lowerName.includes("مطهرات") || lowerName.includes("فلاش") || 
        lowerName.includes("ممسحة") || lowerName.includes("مكنسة") || lowerName.includes("رول جلي") || 
        lowerName.includes("عملاق")
      ) {
        catId = "cleaning";
      } else if (
        lowerName.includes("طماطم") || lowerName.includes("بصل") || lowerName.includes("برتقال") || 
        lowerName.includes("ليمون") || lowerName.includes("رمان") || lowerName.includes("بقدونس") || 
        lowerName.includes("خيار") || lowerName.includes("نعناع") || lowerName.includes("ثوم") || 
        lowerName.includes("فلفل") || lowerName.includes("خضار") || lowerName.includes("فواكه") || 
        lowerName.includes("تفاح") || lowerName.includes("موز") || lowerName.includes("خس") || 
        lowerName.includes("كزبرة") || lowerName.includes("جرجير") || lowerName.includes("زنجبيل") || 
        lowerName.includes("بطاطس")
      ) {
        catId = "produce";
      } else if (
        lowerName.includes("بيض") || lowerName.includes("حليب") || lowerName.includes("لبن") || 
        lowerName.includes("جبن") || lowerName.includes("قشطة") || lowerName.includes("زبادي") || 
        lowerName.includes("كريمة") || lowerName.includes("زبدة")
      ) {
        catId = "dairy";
      } else if (
        lowerName.includes("سكر") || lowerName.includes("طحين") || lowerName.includes("دقيق") || 
        lowerName.includes("مكرونة") || lowerName.includes("نشا") || lowerName.includes("شوفان") || 
        lowerName.includes("ملح")
      ) {
        catId = "dry_goods";
      } else if (
        lowerName.includes("أرز") || lowerName.includes("عدس") || lowerName.includes("حمص") || 
        lowerName.includes("فول") || lowerName.includes("فاصوليا") || lowerName.includes("حبوب")
      ) {
        catId = "rice_grains";
      } else if (lowerName.includes("زيت") || lowerName.includes("سمن") || lowerName.includes("زبده")) {
        catId = "oils";
      } else if (
        lowerName.includes("شاي") || lowerName.includes("قهوة") || lowerName.includes("نسكافيه") || 
        lowerName.includes("بن") || lowerName.includes("هيل") || lowerName.includes("مسمار") || 
        lowerName.includes("قرنفل")
      ) {
        catId = "coffee_tea";
      } else if (
        lowerName.includes("دجاج") || lowerName.includes("لحم") || lowerName.includes("شاورما") || 
        lowerName.includes("كفتة") || lowerName.includes("برجر") || lowerName.includes("مرتديلا")
      ) {
        catId = "meat_poultry";
      } else if (
        lowerName.includes("عصير") || lowerName.includes("بيبسي") || lowerName.includes("سفن") || 
        lowerName.includes("كولا") || lowerName.includes("مشروب") || lowerName.includes("ماء") || 
        lowerName.includes("مياه")
      ) {
        catId = "beverages";
      } else if (
        lowerName.includes("بهارات") || lowerName.includes("كمون") || lowerName.includes("فلفل اسود") || 
        lowerName.includes("كركم") || lowerName.includes("كزبرة مطحونة") || lowerName.includes("توابل")
      ) {
        catId = "spices";
      } else if (
        lowerName.includes("تونة") || lowerName.includes("معلبات") || lowerName.includes("صلصة") || 
        lowerName.includes("كاتشب") || lowerName.includes("مايونيز") || lowerName.includes("خردل")
      ) {
        catId = "canned";
      }

      // Check if category exists, if not seed it in the batch
      if (!existingCats.has(catId)) {
        const catDef = defaultCatsDef[catId] || { name: catId, icon: "📦" };
        const catRef = doc(COLS.categories(), catId);
        batch.set(catRef, {
          name: catDef.name,
          code: catId,
          icon: catDef.icon,
          description: `أصناف مستوردة تابعة لقسم ${catDef.name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        existingCats.set(catId, catDef.name);
        categoriesCreated++;
        addLog(`🆕 تم تعريف تصنيف جديد: ${catDef.name}`, "info");
      }

      // Create product
      const catName = existingCats.get(catId);
      const sku = `IMP-${catId.toUpperCase().slice(0, 4)}-${String(itemsCreated + 1).padStart(4, "0")}`;
      const barcode = `628900${String(itemsCreated + 1).padStart(7, "0")}`;

      const baseCost = 10 + Math.random() * 40;
      const salePrice = baseCost * 1.25;

      const productRef = doc(COLS.products(), sku);
      batch.set(productRef, {
        sku,
        name,
        nameAr: name,
        nameEn: name,
        barcode,
        category: catId,
        categoryName: catName,
        unit,
        altUnit: "كرتون",
        unitFactor: 12,
        costPrice: +baseCost.toFixed(2),
        salePrice: +salePrice.toFixed(2),
        minimumQuantity: 10,
        maximumQuantity: 1000,
        reorderLevel: 20,
        taxCategory: "S",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      existingNames.add(name.toLowerCase());
      itemsCreated++;

      if (itemsCreated % 200 === 0) {
        await batch.commit();
        batch = writeBatch(db);
        addLog(`تم حقن ${itemsCreated} صنف في قاعدة البيانات...`, "info");
      }
    }

    if (itemsCreated > 0 && itemsCreated % 200 !== 0) {
      await batch.commit();
    } else if (categoriesCreated > 0 && itemsCreated === 0) {
      await batch.commit();
    }

    addLog(`🎉 اكتمل الحقن بنجاح! تم إنشاء ${itemsCreated} صنف جديد و ${categoriesCreated} تصنيف جديد بدون تكرار!`, "success");
    statusEl.textContent = "اكتمل الحقن ✅";
    
    // Invalidate caches
    if (window.invalidatePageCache) {
      window.invalidatePageCache("products");
      window.invalidatePageCache("inventory-dashboard");
      window.invalidatePageCache("inventory-reports");
      window.invalidatePageCache("warehouses");
      window.invalidatePageCache("categories");
    }

    await updateCurrentCount();
    alert(`🎉 تم حقن المنتجات بنجاح!\nالمنتجات الجديدة المضافة: ${itemsCreated}\nالتصنيفات الجديدة المضافة: ${categoriesCreated}`);

  } catch (e) {
    addLog(`❌ خطأ أثناء الحقن: ${e.message}`, "error");
    statusEl.textContent = "خطأ ❌";
    alert(`حدث خطأ أثناء الحقن: ${e.message}`);
  } finally {
    importBtn.disabled = false;
    fileInput.value = "";
  }
}
