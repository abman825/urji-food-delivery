import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, ShoppingCart, Menu, X, 
  CheckCircle, ShoppingBag, Utensils, Lock, KeyRound 
} from 'lucide-react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyOrder from "./Myorder";
import MenuManagementTab from './MenuManagementTab';

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
  const [isMyOrderOpen, setIsMyOrderOpen] = useState(false);
  
  // Admin Authentication & Options States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  
  // Change Password States (Backend Driven)
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Menu Management Modal State
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);

  const [orderNotification, setOrderNotification] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // 1. Pending ትዕዛዞችን ብዛት ከ Backend ወይም LocalStorage ማወቅ
  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`);
      const allOrders = response.data.allOrders || [];
      
      const pending = allOrders.filter(order => 
        !order.status || 
        order.status === 'Pending' || 
        order.status === 'በመጠባበቅ ላይ'
      ).length;

      setPendingCount(pending);
    } catch (err) {
      const cached = localStorage.getItem('admin_orders');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const pending = parsed.filter(o => !o.status || o.status === 'Pending').length;
          setPendingCount(pending);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    socket.on('newOrder', () => {
      setPendingCount(prev => prev + 1);
    });

    const handleOrderAccepted = (data) => {
      const userLang = data?.lang || lang;
      let msg = 'ትዕዛዞ ተቀባይቷል! በቅርብ ደቂቃዎች ውስጥ ይደርሰንታል።';

      if (userLang === 'om') {
        msg = "Ajajni keessan fudhatameera! Daqiiqawwan muraasa keessatti isin bira gaha.";
      } else if (userLang === 'en') {
        msg = "Your order has been accepted! It will arrive in a few minutes.";
      }

      setOrderNotification(msg);
      fetchPendingOrders();
      setTimeout(() => setOrderNotification(null), 7000);
    };

    socket.on('orderAcceptedNotification', handleOrderAccepted);
    socket.on('orderAccepted', handleOrderAccepted);

    socket.on('orderStatusUpdated', (data) => {
      const userLang = data?.lang || lang;
      const status = data?.status;

      if (status === 'In Progress' || status === 'በመስራት ላይ') {
        if (userLang === 'om') {
          setOrderNotification(`Nyaatni keessan #${data.receiptId || ''} hojjetamaa jira! 🧑‍🍳`);
        } else if (userLang === 'en') {
          setOrderNotification(`Your food #${data.receiptId || ''} is being prepared! 🧑‍🍳`);
        } else {
          setOrderNotification(`ምግብዎ #${data.receiptId || ''} በመስራት ላይ ይገኛል! በቅርብ ደቂቃዎች ውስጥ እንልክልዎታለን! 🧑‍🍳`);
        }
      } else if (status === 'Delivered' || status === 'Completed' || status === 'ተጠናቀዋል') {
        if (userLang === 'om') {
          setOrderNotification(`Nyaatni keessan #${data.receiptId || ''} xumurameera! 🍷`);
        } else if (userLang === 'en') {
          setOrderNotification(`Your food #${data.receiptId || ''} has been delivered! 🍷`);
        } else {
          setOrderNotification(`ምግብዎ #${data.receiptId || ''} ደርሷል! መልካም ምግብ! 🍷`);
        }
      }

      fetchPendingOrders();
      setTimeout(() => setOrderNotification(null), 7000);
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderAcceptedNotification', handleOrderAccepted);
      socket.off('orderAccepted', handleOrderAccepted);
      socket.off('orderStatusUpdated');
    };
  }, [lang]);

  const navLabels = {
    am: { home: "መነሻ", menu: "ሜኑ", about: "ስለ እኛ", title: "ኡርጂ", subTitle: "ምግብ ቤት", ordersBtn: "የእኛ ትዕዛዞች" },
    om: { home: "Ka'umsa", menu: "Meenuu", about: "Waayee Keenya", title: "Urjii", subTitle: "Mana Nyata", ordersBtn: "Ajajawwan Ko" },
    en: { home: "Home", menu: "Menu", about: "About Us", title: "Urji", subTitle: "Restaurant", ordersBtn: "My Orders" }
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

  // Admin Password Verification Handler (Backend MongoDB)
  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/verify-password`, { 
        password: passwordInput 
      });
      if (res.data.success) {
        setPasswordError(false);
        setShowAdminOptions(true);
      }
    } catch (err) {
      setPasswordError(true);
    }
  };

  // Change Password Handler (Backend MongoDB)
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/change-password`, {
        oldPassword: oldPasswordInput,
        newPassword: newPasswordInput
      });

      if (res.data.success) {
        setPasswordChangeSuccess('የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!');
        setOldPasswordInput('');
        setNewPasswordInput('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordChangeSuccess('');
        }, 1500);
      }
    } catch (err) {
      setPasswordChangeError(err.response?.data?.message || 'የይለፍ ቃል መቀየር አልተሳካም!');
    }
  };

  return (
    <>
      {/* REAL-TIME NOTIFICATION TOAST */}
      {orderNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100000] w-[90%] max-w-md bg-zinc-900 border border-green-500/50 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-green-500/20 text-green-400 rounded-xl shrink-0">
            <CheckCircle size={22} />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-green-400 text-sm mb-0.5">የእስደርደር ማስታወቂያ!</h4>
            <p className="text-zinc-200 leading-relaxed font-semibold">{orderNotification}</p>
          </div>
          <button onClick={() => setOrderNotification(null)} className="text-zinc-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
      )}

      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={handleHomeClick}>
            <div className="bg-orange-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-200">
              <UtensilsCrossed className="text-white" size={20} />
            </div>
            <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter">
              {currentNav.title} <span className="text-orange-600">{currentNav.subTitle}</span>
            </h1>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600">
            <a href="#home" onClick={handleHomeClick} className="hover:text-orange-600 transition-colors">{currentNav.home}</a>
            <a href="#menu" onClick={handleMenuClick} className="hover:text-orange-600 transition-colors">{currentNav.menu}</a>
            <a href="#footer" onClick={handleAboutClick} className="hover:text-orange-600 transition-colors">{currentNav.about}</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              
              {/* Admin Button */}
              <button 
                onClick={() => {
                  setIsAdminModalOpen(true);
                  setShowAdminOptions(false);
                  setIsChangingPassword(false);
                  setPasswordInput('');
                  setPasswordError(false);
                }}
                className="relative bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-2xl text-xs transition duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} />
                <span>Admin</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Customer Orders Modal Button */}
              <button
                onClick={() => setIsMyOrderOpen(true)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-zinc-700/60 active:scale-95 shadow-sm"
              >
                <ShoppingBag size={16} className="text-orange-400" />
                <span>{currentNav.ordersBtn}</span>
              </button>
            </div>

            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500"
            >
              <option value="am">🇪🇹 አማርኛ</option>
              <option value="om">🇪🇹 Oromoo</option>
              <option value="en">🇬🇧 English</option>
            </select>

            {/* Shopping Cart Icon */}
            <div 
              className="relative cursor-pointer hover:scale-105 active:scale-95 transition-all" 
              onClick={() => cartCount > 0 && onOpenCart()}
            >
              <div className="p-2 bg-gray-100 rounded-2xl hover:bg-orange-50 transition-colors">
                <ShoppingCart className="text-gray-700" size={18} />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="md:hidden p-2 bg-gray-100 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all border border-gray-200/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl p-4 mt-2 shadow-xl flex flex-col gap-3 font-bold text-gray-700 text-sm">
            <a href="#home" onClick={handleHomeClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.home}</a>
            <a href="#menu" onClick={handleMenuClick} className="p-2 hover:bg-orange-50 rounded-xl hover:text-orange-600 transition-colors">{currentNav.menu}</a>
            <a href="#footer" onClick={handleAboutClick} className="hover:text-orange-600 transition-colors p-2">{currentNav.about}</a>
            
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAdminModalOpen(true);
                  setShowAdminOptions(false);
                  setIsChangingPassword(false);
                  setPasswordInput('');
                  setPasswordError(false);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-center font-bold p-2.5 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={12} />
                <span>Admin Panel</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsMyOrderOpen(true); }}
                className="flex items-center justify-between p-3 bg-zinc-900 text-white rounded-xl text-xs font-bold active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-orange-400" />
                  <span>{currentNav.ordersBtn}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Customer Order Modal */}
      {isMyOrderOpen && (
        <MyOrder isOpen={isMyOrderOpen} onClose={() => setIsMyOrderOpen(false)} lang={lang} />
      )}

      {/* Admin Auth & Options Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl">
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setShowAdminOptions(false);
                setIsChangingPassword(false);
              }}
              className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {!showAdminOptions && !isChangingPassword ? (
              /* Phase 1: Password Input Form */
              <form onSubmit={handleAdminPasswordSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-600/20 text-orange-500 rounded-2xl">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">አድሚን መግቢያ (Admin Login)</h3>
                    <p className="text-xs text-zinc-400">እባክዎ የይለፍ ቃል ያስገቡ</p>
                  </div>
                </div>

                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="የይለፍ ቃል (Password)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-bold tracking-widest text-center"
                  autoFocus
                />

                {passwordError && (
                  <p className="text-red-400 text-xs text-center font-bold animate-shake">
                    የገባችሁት የይለፍ ቃል ትክክል አይደለም!
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-600/30 text-sm cursor-pointer"
                  >
                    ግባ
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(true);
                      setPasswordChangeError('');
                      setPasswordChangeSuccess('');
                    }}
                    className="text-xs text-zinc-400 hover:text-orange-400 text-center py-2 transition font-bold cursor-pointer"
                  >
                    🔑 የይለፍ ቃል መቀየር (Change Password)
                  </button>
                </div>
              </form>
            ) : isChangingPassword ? (
              /* Change Password Form */
              <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-600/20 text-orange-500 rounded-2xl">
                    <KeyRound size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">የይለፍ ቃል መቀየሪያ</h3>
                    <p className="text-xs text-zinc-400">የቀድሞውን እና አዲሱን የይለፍ ቃል ያስገቡ</p>
                  </div>
                </div>

                <input
                  type="password"
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="የቀድሞው የይለፍ ቃል (Old Password)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-bold text-center"
                  autoFocus
                />

                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="አዲሱ የይለፍ ቃል (New Password)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-bold text-center"
                />

                {passwordChangeError && (
                  <p className="text-red-400 text-xs text-center font-bold animate-shake">
                    {passwordChangeError}
                  </p>
                )}

                {passwordChangeSuccess && (
                  <p className="text-green-400 text-xs text-center font-bold">
                    {passwordChangeSuccess}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-all shadow-lg text-xs cursor-pointer"
                  >
                    ቀይር
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all text-xs cursor-pointer"
                  >
                    ተመለስ
                  </button>
                </div>
              </form>
            ) : (
              /* Phase 2: Selection Options (Report vs Menu Management) */
              <div className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-black text-white">የአስተዳዳሪ ምርጫዎች</h3>
                  <p className="text-xs text-zinc-400">ማከናወን የሚፈልጉትን ይምረጡ</p>
                </div>

                {/* 1. ሪፖርት (Report / Admin Dashboard) */}
                <Link
                  to="/admin"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-orange-600/20 border border-zinc-700 hover:border-orange-500 rounded-2xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">ሪፖርት (Admin Dashboard)</h4>
                      <p className="text-xs text-zinc-400">የትዕዛዞች እና የገቢ ሪፖርት መመልከቻ</p>
                    </div>
                  </div>
                </Link>

                {/* 2. ምናሌ ማስተካከያ (Menu Management) */}
                <button
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setIsMenuEditorOpen(true);
                  }}
                  className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-orange-600/20 border border-zinc-700 hover:border-orange-500 rounded-2xl transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">ምናሌ ማስተካከያ (Menu Management)</h4>
                      <p className="text-xs text-zinc-400">ምግቦችን መጨመር፣ ማስተካከል እና ማጥፋት</p>
                    </div>
                  </div>
                </button>

                {/* Change Password Option inside Menu */}
                <button
                  onClick={() => {
                    setIsChangingPassword(true);
                    setShowAdminOptions(false);
                    setPasswordChangeError('');
                    setPasswordChangeSuccess('');
                  }}
                  className="text-xs text-zinc-400 hover:text-orange-400 text-center py-2 transition font-bold cursor-pointer"
                >
                  🔑 የይለፍ ቃል መቀየር
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Management Modal */}
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
                    {lang === 'om' ? 'Sirreessaa Meenuu' : lang === 'en' ? 'Menu Management' : 'የምናሌ ማስተካከያ'}
                  </h2>
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