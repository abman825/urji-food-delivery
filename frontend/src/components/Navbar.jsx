import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, ShoppingCart, Menu, X, ShieldCheck, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import AdminAuthModal from './AdminAuthModal';
import AdminDashboard from './AdminDashboard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  lang, 
  setLang, 
  videoRef, 
  menuItems, 
  setMenuItems 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashOpen, setIsAdminDashOpen] = useState(false);

  // Real-time Notification State
  const [orderNotification, setOrderNotification] = useState(null);

  // --- Real-time Socket Listener ---
  useEffect(() => {
    // 1. ትዕዛዝ ተቀባይነት ሲያገኝ
    socket.on('orderAcceptedNotification', (data) => {
      setOrderNotification(data.message || 'ትዕዛዝዎ ተቀብለናል! በፍጥነት እናዘጋጃለን።');

      setTimeout(() => {
        setOrderNotification(null);
      }, 6000);
    });

    // 2. Status ሲቀየርም ማሳወቂያ እንዲመጣ
    socket.on('orderStatusUpdated', (data) => {
      if (data.status === 'In Progress' || data.status === 'በመስራት ላይ') {
        setOrderNotification(`ምግብዎ #${data.receiptId} በመሰራት ላይ ይገኛል! 🍳`);
      } else if (data.status === 'Completed' || data.status === 'ተጠናቋል') {
        setOrderNotification(`ምግብዎ #${data.receiptId} ተጠናቋል፣ ይድረስዎ! 🎉`);
      }

      setTimeout(() => {
        setOrderNotification(null);
      }, 6000);
    });

    return () => {
      socket.off('orderAcceptedNotification');
      socket.off('orderStatusUpdated');
    };
  }, []);

  const navLabels = {
    am: { home: "መነሻ", menu: "ሜኑ", about: "ስለ እኛ", title: "ኡርጂ", subTitle: "ምግብ ቤት" },
    om: { home: "Ka'umsa", menu: "Meenuu", about: "Waayee Keenya", title: "Urjii", subTitle: "Mana Nyata" },
    en: { home: "Home", menu: "Menu", about: "About Us", title: "Urji", subTitle: "Restaurant" }
  };

  const currentNav = navLabels[lang] || navLabels.am;

  const handleAdminSuccess = () => {
    setIsAdminAuthOpen(false);
    setIsAdminDashOpen(true);
  };

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
    <>
      {/* 🔔 REAL-TIME ORDER ACCEPTED NOTIFICATION TOAST */}
      {orderNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100000] w-[90%] max-w-md bg-zinc-900 border border-green-500/50 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-green-500/20 text-green-400 rounded-xl shrink-0">
            <CheckCircle size={22} />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-green-400 text-sm mb-0.5">የትዕዛዝ ማሳወቂያ!</h4>
            <p className="text-zinc-200 leading-relaxed">{orderNotification}</p>
          </div>
          <button 
            onClick={() => setOrderNotification(null)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

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

          {/* የቀኝ አቅጣጫዎች (Admin, Language, Cart, Mobile Menu) */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* 🛡️ Admin Icon */}
            <button
              onClick={() => setIsAdminAuthOpen(true)}
              className="p-2.5 bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold border border-gray-200/60"
              title="Admin Dashboard"
            >
              <ShieldCheck size={20} className="text-orange-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="am">🇪🇹 አማርኛ</option>
              <option value="om">🇪🇹 Afaan Oromoo</option>
              <option value="en">🇬🇧 English</option>
            </select>

            {/* Cart Icon */}
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

            {/* Hamburger Menu Button (Mobile) */}
            <button 
              className="md:hidden p-2.5 bg-gray-100 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90 border border-gray-200/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl p-4 mt-2 shadow-xl flex flex-col gap-3 font-bold text-gray-700 text-sm">
            <a href="#home" onClick={handleHomeClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.home}</a>
            <a href="#menu" onClick={handleMenuClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.menu}</a>
            <a href="#footer" onClick={handleAboutClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.about}</a>
          </div>
        )}
      </nav>

      {/* Admin Login Modal */}
      {isAdminAuthOpen && (
        <AdminAuthModal 
          isOpen={isAdminAuthOpen} 
          onClose={() => setIsAdminAuthOpen(false)} 
          onSuccess={handleAdminSuccess} 
        />
      )}

      {/* Admin Dashboard Component */}
      {isAdminDashOpen && (
        <AdminDashboard 
          isOpen={isAdminDashOpen} 
          onClose={() => setIsAdminDashOpen(false)} 
          menuItems={menuItems} 
          setMenuItems={setMenuItems} 
        />
      )}
    </>
  );
}