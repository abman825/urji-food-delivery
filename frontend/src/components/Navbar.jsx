import React, { useState } from 'react';
import { UtensilsCrossed, ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart, lang, setLang, videoRef }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLabels = {
    am: { home: "መነሻ", menu: "ሜኑ", about: "ስለ እኛ", title: "ኡርጂ", subTitle: "ምግብ ቤት" },
    om: { home: "Ka'umsa", menu: "Meenuu", about: "Waayee Keenya", title: "Mana Nyata", subTitle: "Urjii" },
    en: { home: "Home", menu: "Menu", about: "About Us", title: "Urji", subTitle: "Restaurant" }
  };

  const currentNav = navLabels[lang] || navLabels.am;

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (videoRef && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const menuElement = document.getElementById('menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* የሎጎ ክፍል */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={handleHomeClick}>
          <div className="bg-orange-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-200">
            <UtensilsCrossed className="text-white" size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
            {currentNav.title} <span className="text-orange-600">{currentNav.subTitle}</span>
          </h1>
        </div>
        
        {/* የDesktop ሊንኮች */}
        <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600">
          <a href="#home" onClick={handleHomeClick} className="hover:text-orange-600 transition-colors">{currentNav.home}</a>
          <a href="#menu" onClick={handleMenuClick} className="hover:text-orange-600 transition-colors">{currentNav.menu}</a>
          <a href="#footer" onClick={handleAboutClick} className="hover:text-orange-600 transition-colors">{currentNav.about}</a>
        </div>

        {/* የቀኝ አዝራሮች */}
        <div className="flex items-center gap-3 md:gap-5">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="am">🇪🇹 አማርኛ</option>
            <option value="om">🇪🇹 Afaan Oromoo</option>
            <option value="en">🇬🇧 English</option>
          </select>

          <div 
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-all" 
            onClick={() => cartCount > 0 && onOpenCart()}
          >
            <div className="p-2.5 bg-gray-100 rounded-2xl hover:bg-orange-50 transition-colors">
              <ShoppingCart className="text-gray-700" size={22} />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

          {/* 3ቱ መስመሮች (Hamburger Menu Button) */}
          <button 
            className="md:hidden p-2.5 bg-gray-100 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90 border border-gray-200/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* 3ቱ መስመሮች ሲነኩ የሚከፈተው ማራኪ ሞባይል ሜኑ */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100 mt-2 p-4 rounded-3xl shadow-2xl flex flex-col gap-2 font-extrabold text-gray-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <a 
            href="#home" 
            onClick={handleHomeClick} 
            className="p-3.5 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-between active:scale-98"
          >
            <span>{currentNav.home}</span>
            <span className="text-gray-300 text-sm">→</span>
          </a>
          <a 
            href="#menu" 
            onClick={handleMenuClick} 
            className="p-3.5 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-between active:scale-98"
          >
            <span>{currentNav.menu}</span>
            <span className="text-gray-300 text-sm">→</span>
          </a>
          <a 
            href="#footer" 
            onClick={handleAboutClick} 
            className="p-3.5 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-between active:scale-98"
          >
            <span>{currentNav.about}</span>
            <span className="text-gray-300 text-sm">→</span>
          </a>
        </div>
      )}
    </nav>
  );
}