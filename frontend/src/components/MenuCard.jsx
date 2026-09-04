import React from 'react';

export default function FoodCard({ item, onAddToCart, lang }) {
  // lang ('am', 'om', 'en') መሠረት አድርጎ ስሙን መምረጥ
  const foodName = typeof item.name === 'object' ? (item.name[lang] || item.name.am) : item.name;

  // Description ካለ የመምረጥ logic
  const foodDesc = typeof item.description === 'object' 
    ? (item.description[lang] || item.description?.am || item.description) 
    : item.description;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col justify-between h-auto w-full">
      
      {/* የምግብ ምስል እና ዋጋ */}
      <div className="relative mb-3">
        <img src={item.image} alt={foodName} className="w-full h-44 sm:h-48 object-cover rounded-2xl" />
        <span className="absolute top-3 right-3 bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md">
          {item.price} ETB
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between mb-3">
        <div>
          {/* 1. የምግብ ስም - ረጅም ቢሆንም ሳይቆራረጥ ወደ ታች ይወርዳል */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug break-words">
            {foodName}
          </h3>

          {/* 2. የምግብ መግለጫ (Description) ካለ ሙሉውን ያሳያል */}
          {foodDesc && (
            <p className="text-xs text-gray-500 font-medium mb-2 leading-relaxed break-words">
              {foodDesc}
            </p>
          )}
        </div>

        <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
          ✓ Qulqulluu fi Filatamaa
        </p>
      </div>

      {/* የትዕዛዝ ማዘዣ ባተን */}
      <button 
        onClick={() => onAddToCart(item)}
        className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold hover:bg-orange-700 transition-colors text-sm shadow-md active:scale-95"
      >
        + Gara Gaariitti Dabali
      </button>

    </div>
  );
}