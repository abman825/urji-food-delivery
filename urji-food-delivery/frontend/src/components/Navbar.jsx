import React from 'react';
import { UtensilsCrossed, ShoppingCart } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart, lang, setLang }) {
  // በቋንቋው መሠረት የሊንክ ስሞች እንዲቀየሩ
  const navLabels = {
    am: { home: "መነሻ", menu: "ሜኑ", about: "ስለ እኛ", title: "ኡርጂ", subTitle: "ምግብ ቤት" },
    om: { home: "Ka'umsa", menu: "Meenuu", about: "Waayee Keenya", title: "Mana Nyata", subTitle: "Urjii" },
    en: { home: "Home", menu: "Menu", about: "About Us", title: "Urji", subTitle: "Restaurant" }
  };

  const currentNav = navLabels[lang] || navLabels.am;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* የሎጎ እና የብራንድ ስም ክፍል */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-orange-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-200">
            <UtensilsCrossed className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            {currentNav.title} <span className="text-orange-600">{currentNav.subTitle}</span>
          </h1>
        </div>
        
        {/* የሊንኮች፣ የቋንቋ መምረጫ እና የCart ክፍል */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-500">
            <a href="#home" className="hover:text-orange-600 transition-colors">{currentNav.home}</a>
            <a href="#menu" className="hover:text-orange-600 transition-colors">{currentNav.menu}</a>
            <a href="#about" className="hover:text-orange-600 transition-colors">{currentNav.about}</a>
          </div>

          {/* የቋንቋ መምረጫ (Language Switcher Dropdown) */}
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="am">🇪🇹 አማርኛ</option>
            <option value="om">🇪🇹 Afaan Oromoo</option>
            <option value="en">🇬🇧 English</option>
          </select>

          {/* የካርቶን (ShoppingCart) icon */}
          <div 
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-all" 
            onClick={() => cartCount > 0 && onOpenCart()}
          >
            <div className="p-3 bg-gray-100 rounded-2xl hover:bg-orange-50 transition-colors">
              <ShoppingCart className="text-gray-700" size={24} />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}

