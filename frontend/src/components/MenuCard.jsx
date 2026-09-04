import React from 'react';

export default function FoodCard({ item, onAddToCart, lang = 'am' }) {
  // 1. የስም እና የደስክሪፕሽን ቋንቋ መለያ Helper Function
  const getTextByLang = (data) => {
    if (!data) return '';

    if (typeof data === 'object') {
      return data[lang] || data.am || data.en || '';
    }

    if (typeof data === 'string') {
      if (lang === 'am' && data.includes('(')) {
        return data.split('(')[0].trim();
      }
      if (lang === 'om' && data.includes('(')) {
        const match = data.match(/\(([^)]+)\)/);
        return match ? match[1].trim() : data;
      }
      return data;
    }

    return String(data);
  };

  const foodName = getTextByLang(item.name);
  const foodDesc = getTextByLang(item.description);

  // ምግቡ አለ ወይም አልቋል የሚለውን ማረጋገጫ (default = true)
  const isAvailable = item.isAvailable !== false;

  const badgeText = {
    am: "✓ ፅሩይ እና የተመረጠ",
    om: "✓ Qulqulluu fi Filatamaa",
    en: "✓ Fresh & Selected"
  };

  const buttonText = {
    am: isAvailable ? "+ ወደ ቅርጫት ጨምር" : "❌ ለጊዜው አልቋል",
    om: isAvailable ? "+ Gara Gaariitti Dabali" : "❌ Dhumateera",
    en: isAvailable ? "+ Add to Cart" : "❌ Out of Stock"
  };

  return (
    <div className={`bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col justify-between h-auto w-full transition-all ${!isAvailable ? 'opacity-75 bg-gray-50' : ''}`}>
      
      {/* የምግብ ምስል እና ዋጋ */}
      <div className="relative mb-3">
        <img 
          src={item.image || item.img} 
          alt={foodName} 
          className={`w-full h-44 sm:h-48 object-cover rounded-2xl transition-all ${!isAvailable ? 'grayscale opacity-60' : ''}`} 
        />
        
        {/* ዋጋ Tag */}
        <span className="absolute top-3 right-3 bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md">
          {item.price} ETB
        </span>

        {/* አልቋል የሚል Badge (ምግቡ ከሌለ) */}
        {!isAvailable && (
          <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-lg">
            ❌ አልቋል
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between mb-3">
        <div>
          {/* የምግብ ስም */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug break-words">
            {foodName}
          </h3>

          {/* የምግብ መግለጫ */}
          {foodDesc && (
            <p className="text-xs text-gray-500 font-medium mb-2 leading-relaxed break-words">
              {foodDesc}
            </p>
          )}
        </div>

        {/* Quality Badge */}
        {isAvailable && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
            {badgeText[lang] || badgeText.am}
          </p>
        )}
      </div>

      {/* የትእዛዝ ማዘዣ ባተን */}
      <button 
        onClick={() => isAvailable && onAddToCart && onAddToCart(item)}
        disabled={!isAvailable}
        className={`w-full py-3 rounded-2xl font-bold transition-all text-sm shadow-md ${
          isAvailable 
            ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95 cursor-pointer' 
            : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
        }`}
      >
        {buttonText[lang] || buttonText.am}
      </button>

    </div>
  );
}