import React, { useState, useEffect } from 'react';
import { Plus, Minus, Star, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CheckoutModal from './components/CheckoutModal';
import { menuItems as localMenuItems, getImageUrl } from './data/menuData';
import { fetchMenuItems, initiateChapaPay, submitOrderFormData } from './services/api';
import { translations } from './data/translations';

function App() {
  // የቋንቋ State (Default = 'am')
  const [lang, setLang] = useState('am');
  
  // የቋንቋ ዳታ ማረጋገጫ (Fallback ጋር)
  const t = translations?.[lang] || translations?.am || {};

  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Chapa'); 
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', phone: '', address: '', time: '', orderType: 'Takeaway' 
  });
  const [cartItems, setCartItems] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // የ Categories ዝርዝር ከ Translation ወይም Default
  const defaultCategories = ['ሁሉም', 'ቁርስ', 'ምሳ', 'እራት', 'ትኩስ መጠጥ', 'ቀዝቃዛ መጠጥ'];
  const categories = t?.categories || defaultCategories;

  // የ Category ማጣሪያ በ Index ለማድረግ (የቋንቋ መደራረብን ለመከላከል)
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // ቋንቋ ሲቀየር የነበረው Active Tab ወደ የመጀመሪያው (Index 0) እንዲመለስ
  useEffect(() => {
    setActiveTabIndex(0);
  }, [lang]);

  useEffect(() => {
    // 1.ጀመሪያ public / local ዳታ ይጫናል
    setMenuItems(localMenuItems || []);
    setLoading(false);

    // 2. ከ Backend ጋር ማቀላቀል
    fetchMenuItems()
      .then(data => {
        if (data && data.length > 0) {
          setMenuItems([...(localMenuItems || []), ...data]);
        }
      })
      .catch((err) => console.log("Backend offline, using local data only"));
  }, []);

  // የምግብ ስም በቋንቋ መምረጫ Helper Function
  const getItemName = (item) => {
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name[lang] || item.name.am || item.name.en || '';
    }
    return item.name || '';
  };

  const addToCart = (item) => {
    const itemName = getItemName(item);
    setCartCount(prev => prev + 1);
    setTotalPrice(prev => prev + item.price);
    setCartItems(prev => [...prev, itemName]); 
  };

  const removeFromCart = (item) => {
    const itemName = getItemName(item);
    const index = cartItems.lastIndexOf(itemName);
    if (index > -1) {
      const newItems = [...cartItems];
      newItems.splice(index, 1);
      setCartItems(newItems);
      setCartCount(prev => (prev > 0 ? prev - 1 : 0));
      setTotalPrice(prev => (prev >= item.price ? prev - item.price : 0));
    }
  };

  const handleOrder = async () => {
    if(!customerInfo.name || !customerInfo.phone) {
      return alert(t?.fillInfo || "እባክዎ ስም እና ስልክ ያስገቡ!");
    }

    const currentTime = customerInfo.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (paymentMethod === 'Chapa') {
      localStorage.setItem('pendingOrder', JSON.stringify({
        ...customerInfo,
        time: currentTime,
        items: cartItems.join(", "),
        amount: totalPrice
      }));

      try {
        const data = await initiateChapaPay({
          amount: totalPrice,
          name: customerInfo.name,
          phone: customerInfo.phone,
          items: cartItems.join(", "),
        });
        if (data.checkout_url) window.location.href = data.checkout_url;
      } catch (err) { 
        alert(t?.chapaConnError || "ከChapa ጋር መገናኘት አልተቻለም!"); 
      }
    } else {
      if(!selectedFile) {
        return alert(t?.attachReceipt || "እባክዎ የክፍያ ፎቶ ያያይዙ!");
      }
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', customerInfo.name);
      formData.append('phone', customerInfo.phone);
      formData.append('address', customerInfo.address);
      formData.append('time', currentTime);
      formData.append('orderType', customerInfo.orderType); 
      formData.append('totalPrice', totalPrice);
      formData.append('items', cartItems.join(", "));

      try {
        const result = await submitOrderFormData(formData);
        alert(`✅ ${t?.orderSuccess || "ትዕዛዝዎ ተልኳል! ቁጥር:"} ${result.orderId}`);
        setIsModalOpen(false); setCartCount(0); setTotalPrice(0); setCartItems([]); setSelectedFile(null);
      } catch (error) { 
        alert(t?.orderError || "ትዕዛዙን መላክ አልተቻለም!"); 
      }
    }
  };

  // የ Category ማጣሪያ Logic (በ Index የተመሰረተ)
  const filteredItems = menuItems.filter(item => {
    if (activeTabIndex === 0) return true; // ሁሉም / Hunda / All
    if (activeTabIndex === 1) return item.subcategory === 'ቁርስ' || item.category === 'breakfast';
    if (activeTabIndex === 2) return item.subcategory === 'ምሳ' || item.category === 'lunch';
    if (activeTabIndex === 3) return item.subcategory === 'እራት' || item.category === 'dinner';
    if (activeTabIndex === 4) return item.subcategory === 'ትኩስ' || item.category === 'hot_drinks';
    if (activeTabIndex === 5) return item.subcategory === 'ቀዝቃዛ' || item.category === 'cold_drinks';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-left selection:bg-orange-100 selection:text-orange-900">
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsModalOpen(true)} 
        lang={lang} 
        setLang={setLang} 
      />

      <header 
        id="home" 
        className="relative py-28 px-6 overflow-hidden bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: `url('/bb.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-600/90 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
            <Star size={14} fill="currentColor" /> {t?.heroBadge || "አዲስ ተጨምሯል"}
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
            {t?.heroTitle1 || "ምን ዛሬ መመገብ"} <br/><span className="text-orange-500">{t?.heroTitle2 || "ይፈልጋሉ?"}</span>
          </h2>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            {t?.heroDesc || "ትኩስ እና ጣፋጭ የሀገራችን ምግቦች በደቂቃዎች ውስጥ ከኡርጂ ቤት!"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#menu" className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-orange-700 hover:-translate-y-1 transition-all flex items-center gap-2">
              {t?.orderNow || "አሁን እዘዝ"} <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </header>

      <main id="menu" className="max-w-7xl mx-auto p-6 pb-40 w-full flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">{t?.popularTitle || "ታዋቂ ምግቦች እና መጠጦች"}</h3>
            <div className="h-1.5 w-20 bg-orange-600 rounded-full"></div>
          </div>

          {/* በቋንቋው የተተረጎሙ ካቴጎሪዎች */}
          <div className="flex flex-wrap gap-2">
            {categories?.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTabIndex(idx)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  activeTabIndex === idx
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <p className="font-bold text-gray-400">{t?.loading || "ሜኑ በመጫን ላይ..."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item, index) => {
              const displayName = getItemName(item);
              const countInCart = cartItems.filter(name => name === displayName).length;

              return (
                <div key={item._id || item.id || index} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full">
                  <div className="relative h-72 overflow-hidden flex-shrink-0">
                    <img 
                      src={getImageUrl ? getImageUrl(item.img) : item.img} 
                      alt={displayName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Image+Error'; }}
                    />
                    <div className="absolute bottom-6 right-6 bg-orange-600 px-5 py-2 rounded-2xl shadow-xl font-black text-white text-lg">
                      {item.price} ETB
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow justify-between">
                    <div>
                      {/* የምግብ ስም Object ቢሆንም እንኳ በቋንቋው በጥሩ ሁኔታ ይታያል */}
                      <h3 className="text-2xl font-black text-gray-800 mb-2">{displayName}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-8 font-medium">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>{t?.freshAndSelected || "ትኩስ እና የተመረጠ"}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-auto">
                      {countInCart > 0 && (
                        <button onClick={() => removeFromCart(item)} className="bg-gray-100 text-gray-600 p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                          <Minus size={24} />
                        </button>
                      )}
                      <button onClick={() => addToCart(item)} className="flex-grow bg-orange-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-700 transition-all">
                        <Plus size={24} /> {countInCart > 0 ? `${countInCart} ${t?.added || "ተጨምሯል"}` : (t?.addToCart || "ካርቶን ጨምር")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* lang prop ለ CheckoutModal አስተላልፈናል */}
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

      {cartCount > 0 && !isModalOpen && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[94%] max-w-lg bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl flex justify-between items-center z-40 border border-orange-100">
          <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-4 rounded-[1.5rem] text-white">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase">{t?.totalPrice || "ጠቅላላ ዋጋ"}</p>
              <p className="text-gray-900 text-2xl font-black">{totalPrice} <span className="text-sm text-orange-600">ETB</span></p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 px-10 py-4 rounded-3xl font-black text-white hover:bg-orange-700 transition-all text-lg">{t?.orderNow || "አሁን እዘዝ"}</button>
        </div>
      )}

      <div id="about">
        {/* የቋንቋ መረጃ ለ Footer አስተላልፈናል */}
        <Footer lang={lang} />
      </div>
    </div>
  );
}

export default App;