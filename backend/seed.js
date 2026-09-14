import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './src/models/MenuItem.js';

dotenv.config();

const initialMenu = [
  // ================= 1. Nyaata / ምግብ =================
  {
    id: "tibs",
    category: "ምግብ",
    image: "tebs.png", // 👈 img የነበረው image ተደርጓል
    hasVariants: false,
    price: 400,
    name: { am: "ጥብስ", om: "Xibsii Noormaali", en: "Beef Cubes" }
  },
  {
    id: "firfir",
    category: "ምግብ",
    image: "frfr.png",
    hasVariants: true,
    price: 0,
    name: { am: "ፍርፍር", om: "Firfir", en: "Firfir" },
    variants: [
      { id: "firfir-full-meat", name: { am: "ፍርፍር በስጋ", om: "Firfirii Fooniin Guutuu", en: "Full Meat Firfir" }, price: 400 },
      { id: "firfir-half-meat", name: { am: "ግማሽ ፍርፍር በስጋ", om: "Firfirii Fooniin ½", en: "Half Meat Firfir" }, price: 230 },
      { id: "firfir-full-tibs", name: { am: "ጥብስ ፍርፍር በስጋ", om: "Firfirii Xibsii Guutuu", en: "Full Tibs Firfir" }, price: 500 },
      { id: "firfir-half-tibs", name: { am: "ግማሽ ጥብስ ፍርፍር", om: "Firfirii Xibsii ½", en: "Half Tibs Firfir" }, price: 250 },
      { id: "firfir-full-quanta", name: { am: "ቋንጣ ፍርፍር", om: "Firfirii Qanxaa Guutuu", en: "Full Quanta Firfir" }, price: 500 },
      { id: "firfir-half-quanta", name: { am: "ግማሽ ቋንጣ ፍርፍር", om: "Firfirii Qanxaa ½", en: "Half Quanta Firfir" }, price: 250 },
      { id: "firfir-butter", name: { am: "ፍርፍር በቅቤ", om: "Firfirii Dhadhaan", en: "Butter Firfir" }, price: 200 },
      { id: "firfir-half-butter", name: { am: "ግማሽ ፍርፍር በቅቤ", om: "Firfirii Dhadhaan ½", en: "Half Butter Firfir" }, price: 150 },
      { id: "firfir-full-normal", name: { am: "መደበኛ ፍርፍር", om: "Firfirii Noormaali Guutuu", en: "Full Normal Firfir" }, price: 200 },
      { id: "firfir-half-normal", name: { am: "ግማሽ መደበኛ ፍርፍር", om: "Firfirii Noormaali ½", en: "Half Normal Firfir" }, price: 130 }
    ]
  },
  {
    id: "afanyi",
    category: "ምግብ",
    image: "afagn.png",
    hasVariants: true,
    price: 0,
    name: { am: "አፋኝ", om: "Afaanyii", en: "Afanyi" },
    variants: [
      { id: "afanyi-full", name: { am: "አፋኝ ሙሉ", om: "Afaanyii Guutuu", en: "Full Afanyi" }, price: 500 },
      { id: "afanyi-half", name: { am: "አፋኝ ግማሽ", om: "Afaanyii ½", en: "Half Afanyi" }, price: 250 }
    ]
  },
  {
    id: "dulet",
    category: "ምግብ",
    image: "dult.png",
    hasVariants: false,
    price: 350,
    name: { am: "ዱለት", om: "Dulatti", en: "Dulet" }
  },
  {
    id: "shiro",
    category: "ምግብ",
    image: "shro.png",
    hasVariants: true,
    price: 0,
    name: { am: "ሽሮ", om: "Shiroo", en: "Shiro" },
    variants: [
      { id: "shiro-bozena", name: { am: "ቦዘና ሽሮ", om: "Boozanaa Shiroo", en: "Bozena Shiro" }, price: 300 },
      { id: "shiro-tegabino", name: { am: "ተጋቢኖ", om: "Tagaabiinoo", en: "Tegabino Shiro" }, price: 200 },
      { id: "shiro-butter", name: { am: "ሽሮ በቅቤ", om: "Shiroo Dhadhaadhaan", en: "Butter Shiro" }, price: 200 },
      { id: "shiro-feses", name: { am: "ሽሮ ፈሰስ", om: "Shiroo Fesesi", en: "Feses Shiro" }, price: 180 }
    ]
  },
  {
    id: "pasta",
    category: "ምግብ",
    image: "pasta.png",
    hasVariants: true,
    price: 0,
    name: { am: "ፓስታ", om: "Paastaa", en: "Pasta" },
    variants: [
      { id: "pasta-meat", name: { am: "ፓስታ በስጋ", om: "Paastaa Fooniin", en: "Pasta with Meat" }, price: 350 },
      { id: "pasta-egg", name: { am: "ፓስታ እንቁላል", om: "Paastaa Hanqaaquu", en: "Pasta with Egg" }, price: 200 },
      { id: "pasta-sandwich", name: { am: "ፓስታ በሳንድዊች", om: "Paastaa Saandouchiin", en: "Pasta Sandwich" }, price: 200 },
      { id: "pasta-veggie", name: { am: "ፓስታ በአትክልት", om: "Paastaa Ataaklitiidhaan", en: "Vegetables Pasta" }, price: 200 }
    ]
  },
  {
    id: "gomen",
    category: "ምግብ",
    image: "gomn.png",
    hasVariants: false,
    price: 180,
    name: { am: "ጎመን", om: "raafuu", en: "Cabbage" }
  },
  {
    id: "timatim-lebleb",
    category: "ምግብ",
    image: "tam.png",
    hasVariants: false,
    price: 170,
    name: { am: "ቲማቲም ለብለብ", om: "Timaatimi Labbi", en: "Tomato Special" }
  },
  {
    id: "egg",
    category: "ምግብ",
    image: "enkulal.png",
    hasVariants: true,
    price: 0,
    name: { am: "በእንቁላል", om: "Hanqaaquu", en: "Egg" },
    variants: [
      { id: "egg-rafo", name: { am: "እራፎ", om: "Raafoo", en: "Rafoo / Spinach" }, price: 170 },
      { id: "egg-biqila", name: { am: "ቢቅል", om: "Biqilaa", en: "Biqila" }, price: 170 },
      { id: "egg-injera", name: { am: "እንጀራ", om: "Bideen Walakkaa", en: "Injera Special" }, price: 80 },
      { id: "egg-fonyi", name: { am: "ፎንዪ", om: "Foonyii", en: "Fonyi" }, price: 200 }
    ]
  },
  {
    id: "injera",
    category: "ምግብ",
    image: "enjera.png",
    hasVariants: true,
    price: 0,
    name: { am: "እንጀራ", om: "Bideen", en: "Injera" },
    variants: [
      { id: "injera-full", name: { am: "እንጀራ ሙሉ", om: "Bideen Guutuu", en: "Full Injera" }, price: 50 },
      { id: "injera-half", name: { am: "እንጀራ ግማሽ", om: "Bideen ½", en: "Half Injera" }, price: 25 }
    ]
  },

  // ================= 2. Fast Food =================
  {
    id: "burger",
    category: "Fast Food",
    image: "burgr.jpg",
    hasVariants: true,
    price: 0,
    name: { am: "በርገር", om: "Burgarii", en: "Burger" },
    variants: [
      { id: "burger-normal", name: { am: "መደበኛ በርገር", om: "Noormaali Burgarii", en: "Normal Burger" }, price: 400 },
      { id: "burger-argar-special", name: { am: "አርጋር ስፔሻል", om: "Argar Ispeeshaal", en: "Argar Special Burger" }, price: 600 },
      { id: "burger-urjii", name: { am: "ኡርጂ በርገር", om: "Urjii Burgarii", en: "Urjii Burger" }, price: 600 },
      { id: "burger-cheese", name: { am: "ቺዝ በርገር", om: "Chiiz Burgarii", en: "Cheese Burger" }, price: 420 }
    ]
  },
  {
    id: "fetira",
    category: "Fast Food",
    image: "ftira.png",
    hasVariants: true,
    price: 0,
    name: { am: "ፈቲራ", om: "Fatiiraa", en: "Fetira" },
    variants: [
      { id: "fetira-urjii", name: { am: "ኡርጂ ፈቲራ", om: "Urjii Fatiiraa", en: "Urjii Special Fetira" }, price: 500 },
      { id: "fetira-special", name: { am: "ፈቲራ ስፔሻል", om: "Fatiiraa Ispeeshaal", en: "Special Fetira" }, price: 350 },
      { id: "fetira-normal", name: { am: "ፈቲራ መደበኛ", om: "Fatiiraa Noormaali", en: "Normal Fetira" }, price: 280 }
    ]
  },
  {
    id: "sandwich",
    category: "Fast Food",
    image: "sanduch.png",
    hasVariants: true,
    price: 0,
    name: { am: "ሳንድዊች", om: "Saandouchii", en: "Sandwich" },
    variants: [
      { id: "sandwich-veggie", name: { am: "አትክልት ሳንድዊች", om: "Ataakliti Saandouch", en: "Veggie Sandwich" }, price: 220 },
      { id: "sandwich-egg", name: { am: "ሳንድዊች በእንቁላል", om: "Saandouchii Hanqaaquudhaan", en: "Egg Sandwich" }, price: 250 }
    ]
  },
  {
    id: "chechebsa",
    category: "Fast Food",
    image: "chechbsa.png",
    hasVariants: true,
    price: 0,
    name: { am: "ጨጨብሳ", om: "Caccabsaa", en: "Chechebsa" },
    variants: [
      { id: "chechebsa-normal", name: { am: "ጨጨብሳ መደበኛ", om: "Caccabsaa Noormaali", en: "Normal Chechebsa" }, price: 280 },
      { id: "chechebsa-special", name: { am: "ጨጨብሳ ስፔሻል", om: "Caccabsaa Ispeeshaal", en: "Special Chechebsa" }, price: 350 }
    ]
  },
  {
    id: "chips",
    category: "Fast Food",
    image: "chibs.png",
    hasVariants: false,
    price: 170,
    name: { am: "ቺፕስ", om: "Chiipsii", en: "Chips / Fries" }
  },

  // ================= 3. ትኩስ መጠጥ / Hot Drinks =================
  {
    id: "macchiato",
    category: "ትኩስ መጠጥ",
    image: "makito.png",
    hasVariants: false,
    price: 60,
    name: { am: "ማኪያቶ", om: "Maakiyaatoo", en: "Macchiato" }
  },
  {
    id: "milk-peanut",
    category: "ትኩስ መጠጥ",
    image: "milk.png",
    hasVariants: false,
    price: 80,
    name: { am: "ወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" }
  },
  {
    id: "tea",
    category: "ትኩስ መጠጥ",
    image: "tea.png",
    hasVariants: true,
    price: 0,
    name: { am: "ሻይ", om: "Shaayi", en: "Tea" },
    variants: [
      { id: "tea-special", name: { am: "ሻይ ስፔሻል", om: "Shaayi Speeshaali", en: "Special Tea" }, price: 100 },
      { id: "tea-pineapple", name: { am: "አናናስ ሻይ", om: "Anaanaas", en: "Pineapple Tea" }, price: 70 },
      { id: "tea-peanut", name: { am: "ለውዝ ሻይ", om: "Lawuzii", en: "Peanut Tea" }, price: 70 },
      { id: "tea-spiced", name: { am: "ሻይ በቅመም", om: "Shaayi Ispiisii", en: "Spiced Tea" }, price: 50 },
      { id: "tea-orange", name: { am: "ብርቱካን ሻይ", om: "Birtukaan Shaayi", en: "Orange Tea" }, price: 70 },
      { id: "tea-mango", name: { am: "ማንጎ ሻይ", om: "Shaayi Maangoo", en: "Mango Tea" }, price: 70 },
      { id: "tea-special-pineapple", name: { am: "አናናስ ሻይ (ልዩ)", om: "Shaayi Aanaanaasii", en: "Special Pineapple Tea" }, price: 70 },
      { id: "tea-lemon", name: { am: "ሎሚ ሻይ", om: "Shaayi Loomii", en: "Lemon Tea" }, price: 50 },
      { id: "tea-milk", name: { am: "ሻይ በወተት", om: "Shaayi Aannan", en: "Milk Tea" }, price: 70 },
      { id: "tea-caramel", name: { am: "ሻይ በካራሜል", om: "Shaayi Naachiraal", en: "Caramel Tea" }, price: 50 },
      { id: "anka-milk", name: { am: "አንካ በወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" }, price: 80 }
    ]
  },
  {
    id: "coffee",
    category: "ትኩስ መጠጥ",
    image: "coffi.png",
    hasVariants: true,
    price: 0,
    name: { am: "ቡና", om: "Buna", en: "Coffee" },
    variants: [
      { id: "coffee-jebena", name: { am: "ቡና በጀበና", om: "Buna Jabanaa", en: "Traditional Jebena Coffee" }, price: 70 },
      { id: "coffee-machine", name: { am: "ቡና በማሽን", om: "Buna Maashinii", en: "Machine Coffee" }, price: 60 }
    ]
  },

  // ================= 4. ቀዝቃዛ መጠጥ / Cold Drinks =================
  {
    id: "malt",
    category: "ቀዝቃዛ መጠጥ",
    image: "malt.png",
    hasVariants: true,
    price: 0,
    name: { am: "ማልት", om: "Malt", en: "Malt" },
    variants: [
      { id: "malt-soffi", name: { am: "ሶፊ ማልት", om: "Sooffii", en: "Soffi Malt" }, price: 100 },
      { id: "malt-singi", name: { am: "ሲንግ ማልት", om: "Singii", en: "Singi Malt" }, price: 100 },
      { id: "malt-nugus", name: { am: "ኑጉስ ማልት", om: "Nugus", en: "Nugus Malt" }, price: 100 },
      { id: "malt-bakler", name: { am: "በክላር", om: "Baklaar", en: "Bakler" }, price: 100 }
    ]
  },
  {
    id: "ambo-water",
    category: "ቀዝቃዛ መጠጥ",
    image: "amboha.png",
    hasVariants: false,
    price: 60,
    name: { am: "አምቦ ውሃ", om: "Ambooxaa", en: "Ambo Mineral Water" }
  },
  {
    id: "soft-drink",
    category: "ቀዝቃዛ መጠጥ",
    image: "lslasa.png",
    hasVariants: false,
    price: 70,
    name: { am: "ልስላሴ", om: "Lallaafaa", en: "Soft Drink" }
  },
  {
    id: "water",
    category: "ቀዝቃዛ መጠጥ",
    image: "water.png",
    hasVariants: true,
    price: 0,
    name: { am: "ውሃ", om: "Bisaan", en: "Water" },
    variants: [
      { id: "water-2l", name: { am: "ውሃ 2 ሊትር", om: "Bisaan Abbaa 2 Litiraa", en: "Water 2L" }, price: 70 },
      { id: "water-1l", name: { am: "ውሃ 1 ሊትር", om: "Bisaan Abbaa 1 Litiraa", en: "Water 1L" }, price: 60 },
      { id: "water-0-5l", name: { am: "ውሃ 0.5 ሊትር", om: "Bisaan ½ Litiraa", en: "Water 0.5L" }, price: 50 }
    ]
  },

  // ================= 5. Juice =================
  {
    id: "juice",
    category: "Juice",
    image: "as.png",
    hasVariants: true,
    price: 0,
    name: { am: "ጁስ", om: "Juusiilwan", en: "Fresh Juices" },
    variants: [
      { id: "juice-avocado", name: { am: "አቮካዶ ጁስ", om: "Juusii Avokaadoo", en: "Avocado Juice" }, price: 180 },
      { id: "juice-mango", name: { am: "ማንጎ ጁስ", om: "Juusii Maangoo", en: "Mango Juice" }, price: 180 },
      { id: "juice-special", name: { am: "ስፔሻል ጁስ", om: "Juusii Ispeeshaal", en: "Special Juice" }, price: 180 },
      { id: "juice-papaya", name: { am: "ፓፓያ ጁስ", om: "Juusii Paappaayyaa", en: "Papaya Juice" }, price: 180 }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(initialMenu);
    console.log("✅ Menu Items successfully saved to MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();