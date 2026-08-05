import React from 'react';

export default function FoodCard({ item, onAddToCart, lang }) {
  // lang ('am', 'om', 'en') መሠረት አድርጎ ስሙን መምረጥ
  const foodName = typeof item.name === 'object' ? (item.name[lang] || item.name.am) : item.name;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col justify-between">
      <div className="relative mb-4">
        <img src={item.image} alt="food" className="w-full h-48 object-cover rounded-2xl" />
        <span className="absolute top-3 right-3 bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md">
          {item.price} ETB
        </span>
      </div>

      <div>
        {/* እዚህ ላይ ነው ኤረሩ የነበረው: item.name ብቻ ሳይሆን foodName መጠቀም አለብን */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{foodName}</h3>
        <p className="text-xs text-green-600 font-medium mb-4 flex items-center gap-1">
          ✓ Qulqulluu fi Filatamaa
        </p>
      </div>

      <button 
        onClick={() => onAddToCart(item)}
        className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold hover:bg-orange-700 transition-colors"
      >
        + Gara Gaariitti Dabali
      </button>
    </div>
  );
}