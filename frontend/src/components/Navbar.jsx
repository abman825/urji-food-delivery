import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, ShoppingCart, Menu, X, 
  CheckCircle, Clock, ShoppingBag, Utensils, Lock 
} from 'lucide-react';
import { io } from 'socket.io-client';
import AdminDashboard from './AdminDashboard';
import MenuManagementTab from './MenuManagementTab';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

// --- Main Navbar Component ---
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
  
  // Modals visibility control
  const [isAdminDashOpen, setIsAdminDashOpen] = useState(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);

  // Real-time Notification State
  const [orderNotification, setOrderNotification] = useState(null);

  // --- Real-time Socket Listener ---
  useEffect(() => {
    // 1. ቴሌግራም ቦት ላይ "Yes" ሲባል ወይም Backend 'orderAcceptedNotification' ወይም 'orderAccepted' ሲልክ የሚቀበል
    const handleOrderAccepted = (data) => {
      const userLang = data?.lang || lang;

      let msg = 'ትዕዛዝዎ ተቀብለናል! በጥቂት ደቂቃዎች ውስጥ ይደርስዎታል።';

      if (userLang === 'om') {
        msg = "Ajajni keessan fudhatameera! Daqiiqawwan muraasa keessatti isin bira gaha.";
      } else if (userLang === 'en') {
        msg = "Your order has been accepted! It will arrive in a few minutes.";
      }

      setOrderNotification(msg);

      setTimeout(() => {
        setOrderNotification(null);
      }, 7000);
    };

    // ሁለቱንም Event ስሞች እንዲያዳምጥ ተደርጓል (ቴሌግራም ቦት የፈለገውን ቢልክ ይቀበለዋል)
    socket.on('orderAcceptedNotification', handleOrderAccepted);
    socket.on('orderAccepted', handleOrderAccepted);

    // 2. የትዕዛዝ ሁኔታ ሲቀየር የሚቀበል (In Progress, Completed)
    socket.on('orderStatusUpdated', (data) => {
      const userLang = data?.lang || lang;
      const status = data?.status;

      if (status === 'In Progress' || status === 'በመሥራት ላይ') {
        if (userLang === 'om') {
          setOrderNotification(`Nyaatni keessan #${data.receiptId || ''} hojjetamaa jira! 🧑‍🍳`);
        } else if (userLang === 'en') {
          setOrderNotification(`Your food #${data.receiptId || ''} is being prepared! 🧑‍🍳`);
        } else {
          setOrderNotification(`ምግብዎ #${data.receiptId || ''} በመሥራት ላይ ይገኛል፤ በጥቂት ደቂቃዎች ውስጥ እናደርሳለን! 🧑‍🍳`);
        }
      } else if (status === 'Completed' || status === 'ተጠናቋል') {
        if (userLang === 'om') {
          setOrderNotification(`Nyaatni keessan #${data.receiptId || ''} xumurameera! 🎉`);
        } else if (userLang === 'en') {
          setOrderNotification(`Your food #${data.receiptId || ''} is completed! 🎉`);
        } else {
          setOrderNotification(`ምግብዎ #${data.receiptId || ''} ተጠናቋል! ይድረስዎ! 🎉`);
        }
      }

      setTimeout(() => {
        setOrderNotification(null);
      }, 7000);
    });

    return () => {
      socket.off('orderAcceptedNotification', handleOrderAccepted);
      socket.off('orderAccepted', handleOrderAccepted);
      socket.off('orderStatusUpdated');
    };
  }, [lang]);

  const navLabels = {
    am: { home: "መነሻ", menu: "ሜኑ", about: "ስለ እኛ", title: "ኡርጂ", subTitle: "ምግብ ቤት", ordersBtn: "የእኔ ትዕዛዞች", menuBtn: "የሜኑ ማስተካከያ" },
    om: { home: "Ka'umsa", menu: "Meenuu", about: "Waayee Keenya", title: "Urjii", subTitle: "Mana Nyata", ordersBtn: "Ajajawwan Ko", menuBtn: "Jijjiiruf Meenuu" },
    en: { home: "Home", menu: "Menu", about: "About Us", title: "Urji", subTitle: "Restaurant", ordersBtn: "My Orders", menuBtn: "Fix Menu" }
  };

  const currentNav = navLabels[lang] || navLabels.am;

  const handleOpenMenuEditor = () => {
    setIsMenuEditorOpen(true);
  };

  const handleOpenOrders = () => {
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
            <h4 className="font-bold text-green-400 text-sm mb-0.5">
              {lang === 'om' ? "Odeeffannoo Ajaja!" : lang === 'en' ? "Order Notification!" : "የትዕዛዝ ማስታወቂያ!"}
            </h4>
            <p className="text-zinc-200 leading-relaxed font-semibold">{orderNotification}</p>
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

          {/* የቀኝ አቅጣጫዎች */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* 🛍️ 1. የእኔ ትዕዛዞች (My Orders) ቁልፍ */}
            <button
              onClick={handleOpenOrders}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-zinc-700/60 active:scale-95 shadow-sm"
              title="My Orders"
            >
              <ShoppingBag size={16} className="text-orange-400" />
              <span className="hidden sm:inline">{currentNav.ordersBtn}</span>
            </button>

            {/* 🍽️ 2. የሜኑ ማስተካከያ ቁልፍ */}
            <button
              onClick={handleOpenMenuEditor}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-zinc-700/60 active:scale-95 shadow-sm"
              title="Menu Management"
            >
              <Utensils size={16} className="text-orange-400" />
              <span className="hidden sm:inline">{currentNav.menuBtn}</span>
              <Lock size={12} className="text-zinc-400 ml-0.5" />
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
                <ShoppingCart className="text-gray-700" size={20} />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button 
              className="md:hidden p-2.5 bg-gray-100 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90 border border-gray-200/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl p-4 mt-2 shadow-xl flex flex-col gap-3 font-bold text-gray-700 text-sm">
            <a href="#home" onClick={handleHomeClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.home}</a>
            <a href="#menu" onClick={handleMenuClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.menu}</a>
            <a href="#footer" onClick={handleAboutClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.about}</a>
            
            <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleOpenOrders(); }}
                className="flex items-center gap-2 p-2 bg-zinc-800 text-white rounded-xl text-xs font-bold"
              >
                <ShoppingBag size={16} className="text-orange-400" />
                <span>{currentNav.ordersBtn}</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleOpenMenuEditor(); }}
                className="flex items-center gap-2 p-2 bg-zinc-800 text-white rounded-xl text-xs font-bold"
              >
                <Utensils size={16} className="text-orange-400" />
                <span>{currentNav.menuBtn}</span>
                <Lock size={12} className="text-zinc-400 ml-auto" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 📦 Admin Dashboard Component */}
      {isAdminDashOpen && (
        <AdminDashboard 
          isOpen={isAdminDashOpen} 
          onClose={() => setIsAdminDashOpen(false)} 
          lang={lang}
        />
      )}

      {/* 🍔 Standalone Menu Management Modal */}
      {isMenuEditorOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6 sticky top-0 bg-zinc-900 z-10 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-orange-500">
                  <Utensils size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {lang === 'om' ? 'Sirreessaa Meenuu' : lang === 'en' ? 'Menu Management' : 'የሜኑ ማስተካከያ'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {lang === 'om' ? 'Nyaata fi gatii jijjiiruuf' : lang === 'en' ? 'Manage menu items, prices, and availability' : 'ምግቦችን፣ ዋጋዎችን እና የዛሬ ዝግጁነትን ማስተካከያ'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuEditorOpen(false)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <MenuManagementTab 
              menuItems={menuItems} 
              setMenuItems={setMenuItems} 
              socket={socket} 
              lang={lang} 
            />
          </div>
        </div>
      )}
    </>
  );
}