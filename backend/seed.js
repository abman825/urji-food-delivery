import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './src/models/MenuItem.js';

dotenv.config();

const initialMenu = [
  // ================= 1. Nyaata / ምግብ =================
  {
    category: "ምግብ",
    image: "tebs.png",
    hasVariants: false,
    name: { am: "ጥብስ", om: "Xibsii Noormaali", en: "Beef Cubes" },
    price: 400
  },
  {
    category: "ምግብ",
    image: "frfr.png",
    hasVariants: true,
    name: { am: "ፍርፍር", om: "Firfir", en: "Firfir" },
    variants: [
      { name: { am: "ፍርፍር በስጋ", om: "Firfirii Fooniin Guutuu", en: "Full Meat Firfir" }, price: 400 },
      { name: { am: "ግማሽ ፍርፍር በስጋ", om: "Firfirii Fooniin ½", en: "Half Meat Firfir" }, price: 230 },
      { name: { am: "ጥብስ ፍርፍር በስጋ", om: "Firfirii Xibsii Guutuu", en: "Full Tibs Firfir" }, price: 500 },
      { name: { am: "ግማሽ ጥብስ ፍርፍር", om: "Firfirii Xibsii ½", en: "Half Tibs Firfir" }, price: 250 },
      { name: { am: "ቋንጣ ፍርፍር", om: "Firfirii Qanxaa Guutuu", en: "Full Quanta Firfir" }, price: 500 },
      { name: { am: "ግማሽ ቋንጣ ፍርፍር", om: "Firfirii Qanxaa ½", en: "Half Quanta Firfir" }, price: 250 },
      { name: { am: "ፍርፍር በቅቤ", om: "Firfirii Dhadhaan", en: "Butter Firfir" }, price: 200 },
      { name: { am: "ግማሽ ፍርፍር በቅቤ", om: "Firfirii Dhadhaan ½", en: "Half Butter Firfir" }, price: 150 },
      { name: { am: "መደበኛ ፍርፍር", om: "Firfirii Noormaali Guutuu", en: "Full Normal Firfir" }, price: 200 },
      { name: { am: "ግማሽ መደበኛ ፍርፍር", om: "Firfirii Noormaali ½", en: "Half Normal Firfir" }, price: 130 }
    ]
  },
  {
    category: "ምግብ",
    image: "afagn.png",
    hasVariants: true,
    name: { am: "አፋኝ", om: "Afaanyii", en: "Afanyi" },
    variants: [
      { name: { am: "አፋኝ ሙሉ", om: "Afaanyii Guutuu", en: "Full Afanyi" }, price: 500 },
      { name: { am: "አፋኝ ግማሽ", om: "Afaanyii ½", en: "Half Afanyi" }, price: 250 }
    ]
  },
  {
    category: "ምግብ",
    image: "dult.png",
    hasVariants: false,
    name: { am: "ዱለት", om: "Dulatti", en: "Dulet" },
    price: 350
  },
  {
    category: "ምግብ",
    image: "shro.png",
    hasVariants: true,
    name: { am: "ሽሮ", om: "Shiroo", en: "Shiro" },
    variants: [
      { name: { am: "ቦዘና ሽሮ", om: "Boozanaa Shiroo", en: "Bozena Shiro" }, price: 300 },
      { name: { am: "ተጋቢኖ", om: "Tagaabiinoo", en: "Tegabino Shiro" }, price: 200 },
      { name: { am: "ሽሮ በቅቤ", om: "Shiroo Dhadhaadhaan", en: "Butter Shiro" }, price: 200 },
      { name: { am: "ሽሮ ፈሰስ", om: "Shiroo Fesesi", en: "Feses Shiro" }, price: 180 }
    ]
  },
  {
    category: "ምግብ",
    image: "pasta.png",
    hasVariants: true,
    name: { am: "ፓስታ", om: "Paastaa", en: "Pasta" },
    variants: [
      { name: { am: "ፓስታ በስጋ", om: "Paastaa Fooniin", en: "Pasta with Meat" }, price: 350 },
      { name: { am: "ፓስታ እንቁላል", om: "Paastaa Hanqaaquu", en: "Pasta with Egg" }, price: 200 },
      { name: { am: "ፓስታ በሳንድዊች", om: "Paastaa Saandouchiin", en: "Pasta Sandwich" }, price: 200 },
      { name: { am: "ፓስታ በአትክልት", om: "Paastaa Ataaklitiidhaan", en: "Vegetables Pasta" }, price: 200 }
    ]
  },
  {
    category: "ምግብ",
    image: "gomn.png",
    hasVariants: false,
    name: { am: "ጎመን", om: "raafuu", en: "Cabbage" },
    price: 180
  },
  {
    category: "ምግብ",
    image: "tam.png",
    hasVariants: false,
    name: { am: "ቲማቲም ለብለብ", om: "Timaatimi Labbi", en: "Tomato Special" },
    price: 170
  },
  {
    category: "ምግብ",
    image: "enkulal.png",
    hasVariants: true,
    name: { am: "በእንቁላል", om: "Hanqaaquu", en: "Egg" },
    variants: [
      { name: { am: "እራፎ", om: "Raafoo", en: "Rafoo / Spinach" }, price: 170 },
      { name: { am: "ቢቅል", om: "Biqilaa", en: "Biqila" }, price: 170 },
      { name: { am: "እንጀራ", om: "Bideen Walakkaa", en: "Injera Special" }, price: 80 },
      { name: { am: "ፎንዪ", om: "Foonyii", en: "Fonyi" }, price: 200 }
    ]
  },
  {
    category: "ምግብ",
    image: "enjera.png",
    hasVariants: true,
    name: { am: "እንጀራ", om: "Bideen", en: "Injera" },
    variants: [
      { name: { am: "እንጀራ ሙሉ", om: "Bideen Guutuu", en: "Full Injera" }, price: 50 },
      { name: { am: "እንጀራ ግማሽ", om: "Bideen ½", en: "Half Injera" }, price: 25 }
    ]
  },

  // ================= 2. Fast Food =================
  {
    category: "Fast Food",
    image: "burgr.jpg",
    hasVariants: true,
    name: { am: "በርገር", om: "Burgarii", en: "Burger" },
    variants: [
      { name: { am: "መደበኛ በርገር", om: "Noormaali Burgarii", en: "Normal Burger" }, price: 400 },
      { name: { am: "አርጋር ስፔሻል", om: "Argar Ispeeshaal", en: "Argar Special Burger" }, price: 600 },
      { name: { am: "ኡርጂ በርገር", om: "Urjii Burgarii", en: "Urjii Burger" }, price: 600 },
      { name: { am: "ቺዝ በርገር", om: "Chiiz Burgarii", en: "Cheese Burger" }, price: 420 }
    ]
  },
  {
    category: "Fast Food",
    image: "ftira.png",
    hasVariants: true,
    name: { am: "ፈቲራ", om: "Fatiiraa", en: "Fetira" },
    variants: [
      { name: { am: "ኡርጂ ፈቲራ", om: "Urjii Fatiiraa", en: "Urjii Special Fetira" }, price: 500 },
      { name: { am: "ፈቲራ ስፔሻል", om: "Fatiiraa Ispeeshaal", en: "Special Fetira" }, price: 350 },
      { name: { am: "ፈቲራ መደበኛ", om: "Fatiiraa Noormaali", en: "Normal Fetira" }, price: 280 }
    ]
  },
  {
    category: "Fast Food",
    image: "sanduch.png",
    hasVariants: true,
    name: { am: "ሳንድዊች", om: "Saandouchii", en: "Sandwich" },
    variants: [
      { name: { am: "አትክልት ሳንድዊች", om: "Ataakliti Saandouch", en: "Veggie Sandwich" }, price: 220 },
      { name: { am: "ሳንድዊች በእንቁላል", om: "Saandouchii Hanqaaquudhaan", en: "Egg Sandwich" }, price: 250 }
    ]
  },
  {
    category: "Fast Food",
    image: "chechbsa.png",
    hasVariants: true,
    name: { am: "ጨጨብሳ", om: "Caccabsaa", en: "Chechebsa" },
    variants: [
      { name: { am: "ጨጨብሳ መደበኛ", om: "Caccabsaa Noormaali", en: "Normal Chechebsa" }, price: 280 },
      { name: { am: "ጨጨብሳ ስፔሻል", om: "Caccabsaa Ispeeshaal", en: "Special Chechebsa" }, price: 350 }
    ]
  },
  {
    category: "Fast Food",
    image: "chibs.png",
    hasVariants: false,
    name: { am: "ቺፕስ", om: "Chiipsii", en: "Chips / Fries" },
    price: 170
  },

  // ================= 3. ትኩስ መጠጥ / Hot Drinks =================
  {
    category: "ትኩስ መጠጥ",
    image: "makito.png",
    hasVariants: false,
    name: { am: "ማኪያቶ", om: "Maakiyaatoo", en: "Macchiato" },
    price: 60
  },
  {
    category: "ትኩስ መጠጥ",
    image: "milk.png",
    hasVariants: false,
    name: { am: "ወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" },
    price: 80
  },
  {
    category: "ትኩስ መጠጥ",
    image: "tea.png",
    hasVariants: true,
    name: { am: "ሻይ", om: "Shaayi", en: "Tea" },
    variants: [
      { name: { am: "ሻይ ስፔሻል", om: "Shaayi Speeshaali", en: "Special Tea" }, price: 100 },
      { name: { am: "አናናስ ሻይ", om: "Anaanaas", en: "Pineapple Tea" }, price: 70 },
      { name: { am: "ለውዝ ሻይ", om: "Lawuzii", en: "Peanut Tea" }, price: 70 },
      { name: { am: "ሻይ በቅመም", om: "Shaayi Ispiisii", en: "Spiced Tea" }, price: 50 },
      { name: { am: "ብርቱካን ሻይ", om: "Birtukaan Shaayi", en: "Orange Tea" }, price: 70 },
      { name: { am: "ማንጎ ሻይ", om: "Shaayi Maangoo", en: "Mango Tea" }, price: 70 },
      { name: { am: "አናናስ ሻይ (ልዩ)", om: "Shaayi Aanaanaasii", en: "Special Pineapple Tea" }, price: 70 },
      { name: { am: "ሎሚ ሻይ", om: "Shaayi Loomii", en: "Lemon Tea" }, price: 50 },
      { name: { am: "ሻይ በወተት", om: "Shaayi Aannan", en: "Milk Tea" }, price: 70 },
      { name: { am: "ሻይ በካራሜል", om: "Shaayi Naachiraal", en: "Caramel Tea" }, price: 50 },
      { name: { am: "አንካ በወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" }, price: 80 }
    ]
  },
  {
    category: "ትኩስ መጠጥ",
    image: "coffi.png",
    hasVariants: true,
    name: { am: "ቡና", om: "Buna", en: "Coffee" },
    variants: [
      { name: { am: "ቡና በጀበና", om: "Buna Jabanaa", en: "Traditional Jebena Coffee" }, price: 70 },
      { name: { am: "ቡና በማሽን", om: "Buna Maashinii", en: "Machine Coffee" }, price: 60 }
    ]
  },

  // ================= 4. ቀዝቃዛ መጠጥ / Cold Drinks =================
  {
    category: "ቀዝቃዛ መጠጥ",
    image: "malt.png",
    hasVariants: true,
    name: { am: "ማልት", om: "Malt", en: "Malt" },
    variants: [
      { name: { am: "ሶፊ ማልት", om: "Sooffii", en: "Soffi Malt" }, price: 100 },
      { name: { am: "ሲንግ ማልት", om: "Singii", en: "Singi Malt" }, price: 100 },
      { name: { am: "ኑጉስ ማልት", om: "Nugus", en: "Nugus Malt" }, price: 100 },
      { name: { am: "በክላር", om: "Baklaar", en: "Bakler" }, price: 100 }
    ]
  },
  {
    category: "ቀዝቃዛ መጠጥ",
    image: "amboha.png",
    hasVariants: false,
    name: { am: "አምቦ ውሃ", om: "Ambooxaa", en: "Ambo Mineral Water" },
    price: 60
  },
  {
    category: "ቀዝቃዛ መጠጥ",
    image: "lslasa.png",
    hasVariants: false,
    name: { am: "ለስላሳ", om: "Lallaafaa", en: "Soft Drink" },
    price: 70
  },
  {
    category: "ቀዝቃዛ መጠጥ",
    image: "water.png",
    hasVariants: true,
    name: { am: "ውሃ", om: "Bisaan", en: "Water" },
    variants: [
      { name: { am: "ውሃ 2 ሊትር", om: "Bisaan Abbaa 2 Litiraa", en: "Water 2L" }, price: 70 },
      { name: { am: "ውሃ 1 ሊትር", om: "Bisaan Abbaa 1 Litiraa", en: "Water 1L" }, price: 60 },
      { name: { am: "ውሃ 0.5 ሊትር", om: "Bisaan ½ Litiraa", en: "Water 0.5L" }, price: 50 }
    ]
  },

  // ================= 5. Juice =================
  {
    category: "Juice",
    image: "as.png",
    hasVariants: true,
    name: { am: "ጁስ", om: "Juusiilwan", en: "Fresh Juices" },
    variants: [
      { name: { am: "አቮካዶ ጁስ", om: "Juusii Avokaadoo", en: "Avocado Juice" }, price: 180 },
      { name: { am: "ማንጎ ጁስ", om: "Juusii Maangoo", en: "Mango Juice" }, price: 180 },
      { name: { am: "ስፔሻል ጁስ", om: "Juusii Ispeeshaal", en: "Special Juice" }, price: 180 },
      { name: { am: "ፓፓያ ጁስ", om: "Juusii Paappaayyaa", en: "Papaya Juice" }, price: 180 }
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