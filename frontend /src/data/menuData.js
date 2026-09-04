
 export const getImageUrl = (imgSrc) => {
  if (!imgSrc) return 'https://via.placeholder.com/300?text=No+Image';
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) return imgSrc;
  if (imgSrc.startsWith('/uploads') || imgSrc.startsWith('uploads')) {
    return `http://localhost:5000${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
  }
  return imgSrc;
};

export const menuItems = [
  // ================= 1. Nyaata / ምግብ =================

  {
    id: "ጥብስ",
    category: "ምግብ",
    img: "tebs.png",
    hasVariants: false,
    name: { am: "ጥብስ ", om: "Xibsii Noormaali", en: "Beef Cubes" },
    price: 400
  },
  {
    id: "firfir",
    category: "ምግብ",
    img: "frfr.png",
    hasVariants: true,
    name: { am: "ፍርፍር", om: "Firfir", en: "Firfir" },
    variants: [
      { name: { am: "ፍርፍር በስጋ (Firfirii Fooniin Guutuu)", om: "Firfirii Fooniin Guutuu", en: "Full Meat Firfir" }, price: 400 },
      { name: { am: "ግማሽ ፍርፍር በስጋ", om: "Firfirii Fooniin ½", en: "Half Meat Firfir" }, price: 230 },
      { name: { am: "ጥብስ ፍርፍር በስጋ", om: "Firfirii Xibsii Guutuu", en: "Full Tibs Firfir" }, price: 500 },
      { name: { am: "ግማሽ ጥብስ ፍርፍር", om: "Firfirii Xibsii ½", en: "Half Tibs Firfir" }, price: 250 },
      { name: { am: "ቋንጣ ፍርፍር", om: "Firfirii Qanxaa Guutuu", en: "Full Quanta Firfir" }, price: 500 },
      { name: { am: "ግማሽ ቋንጣ ፍርፍር", om: "Firfirii Qanxaa ½", en: "Half Quanta Firfir" }, price: 250 },
      { name: { am: "ፍርፍር በቅቤ (Firfirii Dhadhaan)", om: "Firfirii Dhadhaan", en: "Butter Firfir" }, price: 200 },
      { name: { am: "ግማሽ ፍርፍር በቅቤ", om: "Firfirii Dhadhaan ½", en: "Half Butter Firfir" }, price: 150 },
      { name: { am: "መደበኛ ፍርፍር (Firfirii Noormaali)", om: "Firfirii Noormaali Guutuu", en: "Full Normal Firfir" }, price: 200 },
      { name: { am: "ግማሽ መደበኛ ፍርፍር", om: "Firfirii Noormaali ½", en: "Half Normal Firfir" }, price: 130 }
    ]
  },
  {
    id: "afagnyi",
    category: "ምግብ",
    img: "afagn.png",
    hasVariants: true,
    name: { am: "አፋኚ", om: "Afaanyii", en: "Afanyi" },
    variants: [
      { name: { am: "አፋኚ ሙሉ", om: "Afaanyii Guutuu", en: "Full Afanyi" }, price: 500 },
      { name: { am: "አፋኚ ግማሽ", om: "Afaanyii ½", en: "Half Afanyi" }, price: 250 }
    ]
  },
  {
    id: "dulatti",
    category: "ምግብ",
    img: "dult.png",
    hasVariants: false,
    name: { am: "ዱለት", om: "Dulatti", en: "Dulet" },
    price: 350
  },
  {
    id: "shiro",
    category: "ምግብ",
    img: "shro.png",
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
    id: "pasta",
    category: "ምግብ",
    img: "pasta.png",
    hasVariants: true,
    name: { am: "ፓስታ ", om: "Paastaa ", en: "Pasta " },
    variants: [
      { name: { am: "ፓስታ በስጋ", om: "Paastaa Fooniin", en: "Pasta with Meat" }, price: 350 },
      { name: { am: "ፓስታ እንቁለል", om: "Paastaa Hanqaaquu", en: "Pasta with Egg" }, price: 200 },
      { name: { am: "ፓስታ በሳንዶውች", om: "Paastaa Saandouchiin", en: "Pasta Sandwich" }, price: 200 },
      { name: { am: "ፓስታ በአትክልት", om: "Paastaa Ataaklitiidhaan", en: "Vegetables Pasta" }, price: 200 },
    ]
  },

{
    id: "gomn",
    category: "ምግብ",
    img: "gomn.png",
    hasVariants: false,
    name: { am: "gomn", om: "raafuu", en: " cabag" }, price:180
  },

  {
    id: "Timaatimi Labbi",
    category: "ምግብ",
    img: "tam.png",
    hasVariants: false,
    name: { am: "ቲማቲም ለብለብ", om: "Timaatimi Labbi", en: "Tomato Special" }, price: 170 
  },

{
     id: "በሃንቃቁ",
    category: "ምግብ",
    img: "/enkulal.png",
    hasVariants: false,
    name: { am: "በሃንቃቁ", om: "Hanqaaquu", en: " Egg" }, 
    variants: [
      { name: { am: "እራፎ", om: "Raafoo", en: "Rafoo / Spinach" }, price: 170 },
      { name: { am: "ቢቂል", om: "Biqilaa", en: "Biqila" }, price: 170 },
      { name: { am: "እንጀራ", om: "Bideen Walakkaa", en: "Injera Special" }, price: 80 },
      { name: { am: "ፎንዪ", om: "Foonyii", en: "Fonyi" }, price: 200 }
    ]
  },

  {
    id: "እንጀራ",
    category: "ምግብ",
    img: "enjera.png",
    hasVariants: true,
    name: { am: "እንጀራ", om: "Bideen ", en: "Injera" },
    variants: [
      { name: { am: "እንጀራ ሙሉ", om: "Bideen Guutuu", en: "Full Injera" }, price: 50 },
      { name: { am: "እንጀራ ግማሽ", om: "Bideen ½", en: "Half Injera" }, price: 25 }
    ]
  },

  // ================= 2. Fast Food / ፉድ =================
  {
    id: "burger",
    category: "Fast Food",
    img: "burgr.jpg",
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
    id: "fetira_fastfood",
    category: "Fast Food",
    img: "ftira.png",
    hasVariants: true,
    name: { am: "ፈቲራ", om: "Fatiiraa ", en: "Fetira " },
    variants: [
      { name: { am: "ኡርጂ ፈቲራ", om: "Urjii Fatiiraa", en: "Urjii Special Fetira" }, price: 500 },
      { name: { am: "ፈቲራ ስፔሻል", om: "Fatiiraa Ispeeshaal", en: "Special Fetira" }, price: 350 },
      { name: { am: "ፈቲራ መደበኛ", om: "Fatiiraa Noormaali", en: "Normal Fetira" }, price: 280 }
    ]
  },

{
    id: "Saandouchii",
    category: "Fast Food",
    img: "sanduch.png",
    hasVariants: true,
    name: { am: "ሳንዶውች", om:  "Saandouchii", en: "Sandwich" },
    variants: [
      { name: { am: "አትክልት ሳንዶውች", om: "Ataakliti Saandouch", en: "Veggie Sandwich" }, price: 220 },
      { name: { am: "ሳንዶውች በሃንቃቁ", om: "Saandouchii Hanqaaquudhaan", en: "Egg Sandwich" }, price: 250 },
      
    ]
  },

  {
    id: "caccabsaa",
    category: "Fast Food",
    img: "chechbsa.png",
    hasVariants: true,
    name: { am: "ጨጨብሳ", om: "Caccabsaa", en: "Chechebsa" },
    variants: [
      { name: { am: "ጨጨብሳ መደበኛ", om: "Caccabsaa Noormaali", en: "Normal Chechebsa" }, price: 280 },
      { name: { am: "ጨጨብሳ ስፔሻል", om: "Caccabsaa Ispeeshaal", en: "Special Chechebsa" }, price: 350 }
    ]
  },
  {
    id: "chips",
    category: "Fast Food",
    img: "chibs.png",
    hasVariants: false,
    name: { am: "ቺፕስ", om: "Chiipsii", en: "Chips / Fries" },
    price: 170
  },

  // ================= 3. Waan Ho'aa / ትኩስ መጠጥ =================
  {
    id: "Maakiyaatoo",
    category: "ትኩስ መጠጥ",
    img: "makito.png",
    hasVariants: false,
    name: { am: "ማኪያቶ", om: "Maakiyaatoo", en: "Macchiato" },
     price: 60 },

{
    id: "በወተት",
    category: "ትኩስ መጠጥ",
    img: "milk.png",
    hasVariants: false,
    name: { am: "ወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" }, price: 80 },

  {
    id: "hot_drinks",
    category: "ትኩስ መጠጥ",
    img: "tea.png",
    hasVariants: true,
    name: { am: "ሻይ ", om: "Shaayi", en: "Tea" },
    variants: [
      { name: { am: "ሻይ ስፔሻል", om: "Shaayi Speeshaali", en: "Special Tea" }, price: 100 },
      { name: { am: "አናናስ ሻይ", om: "Anaanaas", en: "Pineapple Tea" }, price: 70 },
      { name: { am: "ለዉዝ ሻይ", om: "Lawuzii", en: "Peanut Tea" }, price: 70 },

      { name: { am: "ሻይ በቅመም", om: "Shaayi Ispiisii", en: "Spiced Tea" }, price: 50 },
      { name: { am: "ብርቱካን ሻይ", om: "Birtukaan Shaayi", en: "Orange Tea" }, price: 70 },
      { name: { am: "ማንጎ ሻይ", om: "Shaayi Maangoo", en: "Mango Tea" }, price: 70 },
      { name: { am: "አናናስ ሻይ (ልዩ)", om: "Shaayi Aanaanaasii", en: "Special Pineapple Tea" }, price: 70 },
      { name: { am: "ሎሚ ሻይ", om: "Shaayi Loomii", en: "Lemon Tea" }, price: 50 },
      { name: { am: "ሻይ በወተት", om: "Shaayi Aannan", en: "Milk Tea" }, price: 70 },
      { name: { am: "ሻይ በካራሜል", om: "Shaayi Naachiraal", en: "Caramel Tea" }, price: 50 },
      { name: { am: "አንን በወተት", om: "Aannan Lawuziidhaan", en: "Milk with Peanut" }, price: 80 },
      
    ]
  },
    {id: "Coffee",
    category: "ትኩስ መጠጥ",
    img: "coffi.png",
    hasVariants: true,
    name: { am: "ቡና", om: "Buna", en: "Coffee" },
    variants: [
      { name: { am: "ቡና በጀበና", om: "Buna Jabanaa", en: "Traditional Jebena Coffee" }, price: 70 },
      { name: { am: "ቡና በማሽን", om: "Buna Maashinii", en: "Machine Coffee" }, price: 60 }
    ]
  },

  // ================= 4. Waan Qorraa / ቀዝቃዛ መጠጥ =================
  {
    id: "ማልት",
    category: "ቀዝቃዛ መጠጥ",
    img: "malt.png",
    hasVariants: true,
    name: { am: "ማልት", om: "Malt", en: "Malt" },
    variants: [
      
      { name: { am: "ሶፊ ማልት", om: "Sooffii", en: "Soffi Malt" }, price: 100 },
      { name: { am: "ሲንጊ ማልት", om: "Singii", en: "Singi Malt" }, price: 100 },
      { name: { am: "ኑጉስ ማልት", om: "Nugus", en: "Nugus Malt" }, price: 100 },
     { name: { am: "በክላር", om: "Baklaar", en: "bakler" },
    price: 100}
      
    ]
  },

  {
    id: "Ambooxaa",
    category: "ቀዝቃዛ መጠጥ",
    img: "amboha.png",
    hasVariants: false,
    name: { am: "አምቦ ውሃ", om: "Ambooxaa", en: "Ambo Mineral Water" },
    price: 60 
  },

  {
    id: "soft_drinks",
    category: "ቀዝቃዛ መጠጥ",
    img: "lslasa.png",
    hasVariants: false,
    name: { am: "ለስላሳ", om: "Lallaafaa", en: "Soft Drink" },
    price: 70 
  },

  

  {
    id: "water",
    category: "ቀዝቃዛ መጠጥ",
    img: "water.png",
    hasVariants: true,
    name: { am: "ውሃ", om: "Bisaan", en: "Water" },
    variants: [
      { name: { am: "ውሃ 2 ሊትር", om: "Bisaan Abbaa 2 Litiraa", en: "Water 2L" }, price: 70 },
      { name: { am: "ውሃ 1 ሊትር", om: "Bisaan Abbaa 1 Litiraa", en: "Water 1L" }, price: 60 },
      { name: { am: "ውሃ 0.5 ሊትር", om: "Bisaan ½ Litiraa", en: "Water 0.5L" }, price: 50 }
    ]
  },

  // ================= 5. Juusiilwan / ጁስ =================
  {
    id: "juices",
    category: "Juice",
    img: "as.png",
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

