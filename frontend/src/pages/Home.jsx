import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import MenuItemCard from '../components/MenuItemCard';
import HeroSection from '../components/HeroSection';
import { menuItems as localMenuItems } from '../data/menuData';
import { fetchMenuItems, initiateChapaPay, submitOrderFormData } from '../services/api';
import { translations } from '../data/translations';
import { useVideoScroll } from '../hooks/useVideoScroll';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [lang, setLang] = useState('am');
  const t = translations?.[lang] || translations?.am || {};

  const { cartCount, totalPrice, cartItems, clearCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Chapa'); 
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', time: '', orderType: 'Takeaway' });
  const [selectedFile, setSelectedFile] = useState(null); 
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollProgress, activeCardIndex } = useVideoScroll(containerRef, videoRef);

  const categories = t?.categories || ['ሁሉም', 'ምግብ', 'Fast Food', 'Juice', 'ቀዝቃዛ መጠጥ', 'ትኩስ መጠጥ'];
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    setMenuItems(localMenuItems || []);
    setLoading(false);
    fetchMenuItems().then(data => data?.length && setMenuItems([...localMenuItems, ...data])).catch(() => {});
  }, []);

  const handleOrder = async () => {
    if(!customerInfo.name || !customerInfo.phone) return alert(t?.fillInfo || "እባክዎን ስም እና ስልክ ያስገቡ!");

    if (paymentMethod === 'Chapa') {
      try {
        const data = await initiateChapaPay({ amount: totalPrice, name: customerInfo.name, phone: customerInfo.phone, items: cartItems.join(", ") });
        if (data.checkout_url) window.location.href = data.checkout_url;
      } catch { alert(t?.chapaConnError || "ከChapa ጋር መገናኘት አልተቻለም!"); }
    } else {
      if(!selectedFile) return alert(t?.attachReceipt || "እባክዎን የክፍያ ፎቶ ያያይዙ!");
      const formData = new FormData();
      Object.keys(customerInfo).forEach(k => formData.append(k, customerInfo[k]));
      formData.append('image', selectedFile);
      formData.append('totalPrice', totalPrice);
      formData.append('items', cartItems.join(", "));

      try {
        const result = await submitOrderFormData(formData);
        alert(`✅ ${t?.orderSuccess || "ትዕዛዝዎ ተልኳል! ቁጥር:"} ${result.orderId}`);
        setIsModalOpen(false); clearCart();
      } catch { alert(t?.orderError || "ትዕዛዙን መላክ አልተቻለም!"); }
    }
  };

  // Search + Category Filter Logic
  const filteredItems = menuItems.filter(item => {
    const itemName = typeof item.name === 'object' 
      ? (item.name[lang] || item.name.am || '').toLowerCase() 
      : (item.name || '').toLowerCase();

    const matchesSearch = itemName.includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (activeTabIndex === 1) matchesCategory = item.category === 'ምግብ' || item.category === 'Food' || item.category === 'Nyaata';
    else if (activeTabIndex === 2) matchesCategory = item.category === 'Fast Food' || item.category === 'fast_food';
    else if (activeTabIndex === 3) matchesCategory = item.category === 'Juice' || item.category === 'juice';
    else if (activeTabIndex === 4) matchesCategory = item.category === 'ቀዝቃዛ መጠጥ' || item.category === 'Cold Drinks';
    else if (activeTabIndex === 5) matchesCategory = item.category === 'ትኩስ መጠጥ' || item.category === 'Hot Drinks';

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col justify-between text-left relative">
      <Navbar cartCount={cartCount} onOpenCart={() => setIsModalOpen(true)} lang={lang} setLang={setLang} />

      <HeroSection containerRef={containerRef} videoRef={videoRef} scrollProgress={scrollProgress} activeCardIndex={activeCardIndex} t={t} />

      {/* የሜኑ ክፍል */}
      <main id="menu" className="relative w-full flex-1 py-16 px-6 pb-40 z-10">
        
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/ass.MOV" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
            <div>
              <h3 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
                {t?.popularTitle || "ታዋቂ ምግቦች እና መጠጦች"}
              </h3>
              <div className="h-1.5 w-24 bg-orange-600 rounded-full shadow-lg shadow-orange-600/50"></div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2.5 bg-black/40 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              {categories?.map((tab, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveTabIndex(idx)} 
                  className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 ${
                    activeTabIndex === idx 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 scale-105' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar Input (ፅሁፍ ማጽጃ 'X' ያለው) */}
          <div className="relative max-w-md mx-auto mb-10">
            <input
              type="text"
              placeholder={
                lang === 'am' ? "ምግብ ወይም መጠጥ ይፈልጉ..." : 
                lang === 'om' ? "Barbaadi..." : "Search food or drinks..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 text-white pl-11 pr-10 py-3.5 rounded-2xl focus:outline-none focus:border-orange-500 transition-colors text-sm shadow-xl backdrop-blur-md"
            />
            <Search className="absolute left-3.5 top-4 text-zinc-400 w-5 h-5" />
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <p className="text-center py-20 font-bold text-white text-lg animate-pulse">
              {t?.loading || "መጫን ላይ..."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <MenuItemCard key={item._id || item.id || index} item={item} lang={lang} t={t} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-zinc-400 font-bold flex flex-col items-center justify-center gap-3">
                  <p>{lang === 'am' ? "የፈለጉት ምግብ አልተገኘም" : "No items found"}</p>
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="bg-zinc-800 text-orange-500 text-xs px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer"
                  >
                    {lang === 'am' ? "ፍለጋውን አፅዳ (Clear)" : "Clear Search"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customerInfo={customerInfo} 
        setCustomerInfo={setCustomerInfo} 
        paymentMethod={paymentMethod} 
        setPaymentMethod={setPaymentMethod} 
        selectedFile={selectedFile} 
        setSelectedFile={setSelectedFile} 
        totalPrice={totalPrice} 
        handleOrder={handleOrder} 
        lang={lang} 
      />

      {/* 📌 በየትኛውም ቦታ ስክሪኑ ላይ ጸንቶ የሚቆይ Floating Order Bar (fixed bottom-6 z-50) */}
      {cartCount > 0 && !isModalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-gray-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex justify-between items-center z-[9999] border border-white/10">
          
          {/* X ን ስትነካ ያዘዝከውን ሰርዞ ባሩን ያጠፋዋል */}
          <button 
            onClick={() => clearCart()}
            title="ትዕዛዝ ሰርዝ"
            className="absolute -top-2.5 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer border-2 border-black z-[10000]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-3 sm:p-4 rounded-[1.5rem] text-white shadow-lg shadow-orange-600/40">
              <ShoppingBag size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{t?.totalPrice || "ጠቅላላ ዋጋ"}</p>
              <p className="text-white text-xl sm:text-2xl font-black">{totalPrice} <span className="text-sm text-orange-500">ETB</span></p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-orange-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl font-black text-white hover:bg-orange-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            {t?.orderNow || "አሁን እዘዝ"}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-0 w-full bg-zinc-950">
        <Footer lang={lang} />
      </footer>
    </div>
  );
}