import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, X, Clock, Clock3, Receipt } from 'lucide-react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import MenuItemCard from '../components/MenuItemCard';
import HeroSection from '../components/HeroSection';
import { menuItems as localMenuItems } from '../data/menuData';
import { fetchMenuItems, initiateChapaPay, submitOrderFormData, verifyChapaPayment } from '../services/api';
import { translations } from '../data/translations';
import { useVideoScroll } from '../hooks/useVideoScroll';
import { useCart } from '../context/CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function Home() {
  const [lang, setLang] = useState('am');
  const t = translations?.[lang] || translations?.am || {};

  const { cartCount, totalPrice, cartItems, clearCart, addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Screenshot');

  const [myActiveOrder, setMyActiveOrder] = useState(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    time: '', 
    tableNo: '', 
    orderType: 'Dine-in' 
  });

  const [selectedFile, setSelectedFile] = useState(null); 
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const isVerifying = useRef(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollProgress, activeCardIndex } = useVideoScroll(containerRef, videoRef);

  const categories = lang === 'om' 
    ? ['Hunda', 'Nyaata', 'Fast Food', 'Juice', 'Dhugaatii Qabbanaawaa', "Dhugaatii Ho'aa"]
    : lang === 'en'
    ? ['All', 'Food', 'Fast Food', 'Juice', 'Cold Drinks', 'Hot Drinks']
    : ['ሁሉም', 'ምግብ', 'Fast Food', 'Juice', 'ቀዝቃዛ መጠጥ', 'ትኩስ መጠጥ'];

  // -------------------------------------------------------------
  // 🔄 REAL-TIME MENU SYNC (Socket.io + LocalStorage Event Listener)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Socket Listener for Real-time Menu Update
    socket.on('updateMenu', (updatedMenu) => {
      if (Array.isArray(updatedMenu)) {
        setMenuItems(updatedMenu);
        localStorage.setItem('customMenuItems', JSON.stringify(updatedMenu));
      }
    });

    socket.on('menuItemUpdated', (updatedItem) => {
      setMenuItems((prevItems) => {
        const updated = prevItems.map((item) => 
          (item.id === updatedItem.id || item._id === updatedItem._id) ? { ...item, ...updatedItem } : item
        );
        localStorage.setItem('customMenuItems', JSON.stringify(updated));
        return updated;
      });
    });

    // 2. Storage / Custom Event Listener
    const handleSync = () => {
      const saved = localStorage.getItem('customMenuItems');
      if (saved) {
        try {
          setMenuItems(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse synced menu:", e);
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('menuUpdated', handleSync);

    return () => {
      socket.off('updateMenu');
      socket.off('menuItemUpdated');
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('menuUpdated', handleSync);
    };
  }, []);

  useEffect(() => {
    const savedOrder = localStorage.getItem('myPersonalOrder');
    if (savedOrder) {
      try {
        setMyActiveOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to parse personal order:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (data) => {
      if (!myActiveOrder) return;

      const currentReceiptId = String(myActiveOrder.receiptId || myActiveOrder.id || '').trim();
      const incomingReceiptId = String(data.receiptId || data.id || '').trim();

      if (currentReceiptId && incomingReceiptId && currentReceiptId === incomingReceiptId) {
        if (data.status === 'Completed' || data.status === 'ተጠናቋል') {
          setMyActiveOrder(null);
          setIsOrderTrackerOpen(false);
          localStorage.removeItem('myPersonalOrder');
        } else {
          const updatedOrder = { ...myActiveOrder, status: data.status };
          setMyActiveOrder(updatedOrder);
          localStorage.setItem('myPersonalOrder', JSON.stringify(updatedOrder));
        }
      }
    };

    socket.on('orderStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('orderStatusUpdated', handleStatusUpdate);
    };
  }, [myActiveOrder]);

  useEffect(() => {
    const savedItems = localStorage.getItem('customMenuItems');

    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuItems(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse local menu items:", e);
      }
    }

    setMenuItems(localMenuItems || []);
    setLoading(false);

    fetchMenuItems()
      .then(data => {
        if (data?.length) {
          setMenuItems(prev => {
            const merged = [...localMenuItems, ...data];
            localStorage.setItem('customMenuItems', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const trx_id = queryParams.get('trx_id') || queryParams.get('tx_ref') || queryParams.get('reference');

    if (trx_id && !isVerifying.current) {
      isVerifying.current = true;

      const savedData = localStorage.getItem('pendingChapaOrder');
      let pendingOrder = null;

      if (savedData) {
        try {
          pendingOrder = JSON.parse(savedData);
        } catch (e) {
          console.error("JSON Parse Error:", e);
        }
      }

      verifyChapaPayment(pendingOrder, trx_id)
        .then(res => {
          if (res && res.success) {
            const receiptId = pendingOrder?.receiptId || `REC-${Date.now().toString().slice(-6)}`;
            
            const newOrderObj = {
              receiptId,
              status: 'Pending',
              paymentMethod: 'Chapa',
              totalPrice: pendingOrder?.totalPrice || 0,
              items: pendingOrder?.items || [],
              orderType: pendingOrder?.orderType || 'Dine-in',
              tableNo: pendingOrder?.tableNo || '-',
              phone: pendingOrder?.phone || '-',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMyActiveOrder(newOrderObj);
            localStorage.setItem('myPersonalOrder', JSON.stringify(newOrderObj));

            const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            localStorage.setItem('adminOrders', JSON.stringify([newOrderObj, ...existingOrders]));

            const alertMsg = lang === 'om' 
              ? `🧾 Nagahee Kaffaltii\n------------------------------\n🆔 Lakkoofsa Nagahee: ${receiptId}\n💳 Tx Ref: ${trx_id}\n------------------------------\n✅ Kaffaltiin Chapa'n Milkaa'era!`
              : lang === 'en'
              ? `🧾 Payment Receipt\n------------------------------\n🆔 Receipt ID: ${receiptId}\n💳 Tx Ref: ${trx_id}\n------------------------------\n✅ Chapa Payment Successful!`
              : `🧾 የክፍያ ደረሰኝ\n------------------------------\n🆔 የደረሰኝ ቁጥር: ${receiptId}\n💳 Tx Ref: ${trx_id}\n------------------------------\n✅ ክፍያው በ Chapa ተሳክቷል!`;

            alert(alertMsg);
            clearCart();
            localStorage.removeItem('pendingChapaOrder');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => console.error("Chapa Verification Error:", err))
        .finally(() => { isVerifying.current = false; });
    }
  }, [clearCart, lang]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // -------------------------------------------------------------
  // 🚫 IN-STOCK CHECKER FOR ADD TO CART
  // -------------------------------------------------------------
  const handleAddToCartChecked = (item, selectedVariant = null) => {
    if (item.isAvailable === false) {
      alert(
        lang === 'om' ? "Dhiifama! Nyaatni/Dhugaatiin kun dhumateera." :
        lang === 'en' ? "Sorry, this item is currently out of stock!" :
        "ይቅርታ! ይህ ምግብ/መጠጥ ለዛሬ አልቋል፤ እባክዎን ሌላ ይምረጡ።"
      );
      return;
    }

    if (addToCart) {
      addToCart(item, selectedVariant);
    }
  };

  const handleOrder = async () => {
    if (paymentMethod === 'Chapa') {
      if (customerInfo.orderType === 'Dine-in') {
        if (!customerInfo.tableNo) {
          return alert(
            lang === 'om' ? "Maaloo lakkoofsa barcumaa galchaa!" : 
            lang === 'en' ? "Please enter table number!" : 
            "እባክዎን የወንበር/ጠረጴዛ ቁጥር ያስገቡ!"
          );
        }
      } else {
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.time) {
          return alert(
            lang === 'om' ? "Maaloo maqaa, bilbilaa fi sa'aatii galchaa!" : 
            lang === 'en' ? "Please fill name, phone, and time!" : 
            "እባክዎን ስም፣ ስልክ እና ሰዓት ያስገቡ!"
          );
        }
        if (customerInfo.address !== 'መጥቼ እወስዳለሁ' && !customerInfo.address) {
          return alert(
            lang === 'om' ? "Maaloo teessoo galchaa ykn 'Ofii Koof Dhufeen Fadha' filadhaa!" : 
            lang === 'en' ? "Please enter address or check self pick-up!" : 
            "እባክዎን አድራሻ ያስገቡ ወይም 'መጥቼ እወስዳለሁ' የሚለውን ይምረጡ!"
          );
        }
      }

      try {
        const generatedReceiptId = `REC-${Date.now().toString().slice(-6)}`;
        const orderPayload = {
          receiptId: generatedReceiptId,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          time: customerInfo.time,
          tableNo: customerInfo.tableNo,
          paymentMethod: 'Chapa',
          totalPrice: totalPrice,
          items: cartItems,
          orderType: customerInfo.orderType
        };

        localStorage.setItem('pendingChapaOrder', JSON.stringify(orderPayload));

        const data = await initiateChapaPay({ 
          amount: totalPrice, 
          name: customerInfo.name || 'Customer', 
          phone: customerInfo.phone
        });

        if (data && data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert(lang === 'om' ? "Liinkii kaffaltii argachuun al-danda'ame!" : lang === 'en' ? "Unable to get payment URL!" : "የክፍያ ሊንክ ማግኘት አልተቻለም!");
        }
      } catch (err) {
        alert(lang === 'om' ? "Chapa waliin wal-qunnamuun al-danda'ame!" : lang === 'en' ? "Failed to connect to Chapa!" : "ከ Chapa ጋር መገናኘት አልተቻለም!");
      }
    } else {
      if (!customerInfo.tableNo) {
        return alert(
          lang === 'om' ? "Maaloo lakkoofsa barcumaa galchaa!" : 
          lang === 'en' ? "Please enter table number!" : 
          "እባክዎን የወንበር/ጠረጴዛ ቁጥር ያስገቡ!"
        );
      }

      const formData = new FormData();
      formData.append('tableNo', customerInfo.tableNo);
      if (customerInfo.phone) formData.append('phone', customerInfo.phone);
      formData.append('orderType', 'Dine-in');
      formData.append('paymentMethod', paymentMethod);
      formData.append('totalPrice', totalPrice);
      formData.append('items', JSON.stringify(cartItems));

      let imagePreviewUrl = null;
      if (selectedFile) {
        formData.append('image', selectedFile);
        try {
          imagePreviewUrl = await fileToBase64(selectedFile);
        } catch (e) {
          console.error("Error converting file:", e);
        }
      }

      try {
        const result = await submitOrderFormData(formData);
        const receiptId = result?.receiptId || result?.orderId || `REC-${Date.now().toString().slice(-6)}`;
        const backendImageUrl = result?.imageUrl || result?.paymentProof || imagePreviewUrl;

        const newOrderObj = {
          receiptId,
          status: 'Pending',
          paymentMethod: paymentMethod,
          paymentProof: backendImageUrl,
          imageUrl: backendImageUrl,
          totalPrice,
          items: cartItems,
          orderType: 'Dine-in',
          tableNo: customerInfo.tableNo,
          phone: customerInfo.phone || '-',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMyActiveOrder(newOrderObj);
        localStorage.setItem('myPersonalOrder', JSON.stringify(newOrderObj));

        const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        localStorage.setItem('adminOrders', JSON.stringify([newOrderObj, ...existingOrders]));

        const successText = lang === 'om' ? "Ajajni keessan ergameera! Lakkoofsa nagahee:" : lang === 'en' ? "Order submitted! Receipt ID:" : "ትዕዛዝዎ ተልኳል! ደረሰኝ ቁጥር:";
        alert(`✅ ${successText} ${receiptId}`);
        setIsModalOpen(false); 
        clearCart();
        setSelectedFile(null);
      } catch (err) { 
        alert(lang === 'om' ? "Ajaja ergachuun al-danda'ame!" : lang === 'en' ? "Failed to send order!" : "ትዕዛዙን መላክ አልተቻለም!"); 
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const itemName = typeof item.name === 'object' 
      ? (item.name[lang] || item.name.am || item.name.en || '').toLowerCase() 
      : (item.name || '').toLowerCase();

    const matchesSearch = itemName.includes(searchQuery.toLowerCase());
    const cat = (item.category || '').toString().trim().toLowerCase();

    let matchesCategory = true;

    if (activeTabIndex === 0) {
      matchesCategory = true;
    } else if (activeTabIndex === 1) {
      matchesCategory = cat === 'ምግብ' || cat === 'food' || cat === 'nyaata';
    } else if (activeTabIndex === 2) {
      matchesCategory = cat === 'fast food' || cat === 'fast_food';
    } else if (activeTabIndex === 3) {
      matchesCategory = cat === 'juice' || cat === 'ጁስ';
    } else if (activeTabIndex === 4) {
      matchesCategory = 
        cat.includes('ቀዝቃዛ') || 
        cat.includes('cold') || 
        cat.includes('qabbanaawaa') ||
        cat === 'ቀዝቃዛ መጠጥ' || 
        cat === 'cold drinks';
    } else if (activeTabIndex === 5) {
      matchesCategory = 
        cat.includes('ትኩስ') || 
        cat.includes('hot') || 
        cat.includes("ho'aa") ||
        cat === 'ትኩስ መጠጥ' || 
        cat === 'hot drinks';
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="min-h-screen bg-black font-sans flex flex-col justify-between text-left relative">
        <Navbar 
          cartCount={cartCount} 
          onOpenCart={() => setIsModalOpen(true)} 
          lang={lang} 
          setLang={setLang} 
          menuItems={menuItems}
          setMenuItems={(newItems) => {
            const updated = typeof newItems === 'function' ? newItems(menuItems) : newItems;
            setMenuItems(updated);
            localStorage.setItem('customMenuItems', JSON.stringify(updated));
            window.dispatchEvent(new Event('menuUpdated'));
          }}
        />

        <HeroSection containerRef={containerRef} videoRef={videoRef} scrollProgress={scrollProgress} activeCardIndex={activeCardIndex} t={t} />

        <main id="menu" className="relative w-full flex-1 py-16 px-6 pb-40 z-10">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
            <source src="/ass.MOV" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-10" />

          <div className="relative z-20 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
              <div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  {t?.popularTitle || (lang === 'om' ? "Nyaataa fi Dhugaatii Beekamoo" : lang === 'en' ? "Popular Foods & Drinks" : "ታዋቂ የምግቦች እና መጠጦች")}
                </h3>
                <div className="h-1.5 w-24 bg-orange-600 rounded-full shadow-lg shadow-orange-600/50"></div>
              </div>

              <div className="flex flex-wrap gap-2.5 bg-black/40 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                {categories.map((tab, idx) => (
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

            <div className="relative max-w-md mx-auto mb-10">
              <input
                type="text"
                placeholder={lang === 'om' ? "Nyaata ykn dhugaatii barbaadaa..." : lang === 'en' ? "Search food or drinks..." : "ምግብ ወይም መጠጥ ይፈልጉ..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 text-white pl-11 pr-10 py-3.5 rounded-2xl focus:outline-none focus:border-orange-500 transition-colors text-sm shadow-xl backdrop-blur-md"
              />
              <Search className="absolute left-3.5 top-4 text-zinc-400 w-5 h-5" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center py-20 font-bold text-white text-lg animate-pulse">{t?.loading || "Loading..."}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <MenuItemCard 
                      key={item._id || item.id || index} 
                      item={item} 
                      lang={lang} 
                      t={t} 
                      onAddToCart={handleAddToCartChecked}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-zinc-400 font-bold flex flex-col items-center justify-center gap-3">
                    <p>{lang === 'om' ? "Wanti barbaaddan hin argamne" : lang === 'en' ? "No items found" : "የፈለጉት ምግብ አልተገኘም"}</p>
                    <button onClick={() => setSearchQuery('')} className="bg-zinc-800 text-orange-500 text-xs px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer">
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer lang={lang} />
      </div>

      {isModalOpen && (
        <CheckoutModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleOrder={handleOrder}
          totalPrice={totalPrice}
          cartItems={cartItems}
          lang={lang}
        />
      )}

      {myActiveOrder && (
        <div className="fixed bottom-6 left-6 z-[9998]">
          <button 
            onClick={() => setIsOrderTrackerOpen(true)}
            className="flex items-center gap-3 bg-zinc-900/90 border border-orange-500/50 hover:border-orange-500 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-lg animate-pulse transition-all cursor-pointer"
          >
            <div className="bg-orange-600/20 p-2 rounded-xl text-orange-500">
              <Clock3 className="w-5 h-5 animate-spin" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {lang === 'om' ? "Haala Ajaja" : lang === 'en' ? "Order Status" : "የትዕዛዝዎ ሁኔታ"}
              </p>
              <p className="text-xs font-black text-orange-400">
                #{myActiveOrder.receiptId} ({myActiveOrder.status || 'Pending'})
              </p>
            </div>
          </button>
        </div>
      )}

      {isOrderTrackerOpen && myActiveOrder && (
        <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsOrderTrackerOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-600/20 p-3 rounded-2xl text-orange-500">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">{lang === 'om' ? "Hordoffii Ajajaa" : lang === 'en' ? "Order Tracker" : "የትዕዛዝዎ መቆጣጠሪያ"}</h3>
                <p className="text-xs text-zinc-400">ID: {myActiveOrder.receiptId}</p>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-400">{lang === 'om' ? "Haala:" : lang === 'en' ? "Status:" : "ሁኔታው፦"}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  myActiveOrder.status === 'Completed' || myActiveOrder.status === 'ተጠናቋል' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : myActiveOrder.status === 'In Progress' || myActiveOrder.status === 'በመሥራት ላይ'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> {myActiveOrder.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300 mb-2">
                <span>{lang === 'om' ? "Gosa Ajaja:" : lang === 'en' ? "Order Type:" : "የትዕዛዝ ዓይነት፦"}</span>
                <span className="font-bold text-white">{myActiveOrder.orderType}</span>
              </div>
              {myActiveOrder.tableNo && (
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>{lang === 'om' ? "Lak. Barcumaa:" : lang === 'en' ? "Table No:" : "የወንበር ቁጥር፦"}</span>
                  <span className="font-bold text-orange-400">{myActiveOrder.tableNo}</span>
                </div>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto mb-6 pr-1 space-y-2">
              <p className="text-xs font-bold text-zinc-400 mb-2">{lang === 'om' ? "Tarree Nyaataa:" : lang === 'en' ? "Items:" : "የታዘዙ ምግቦች፦"}</p>
              {myActiveOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-800/30 p-2.5 rounded-xl text-xs">
                  <span className="text-zinc-200 font-medium">
                    {typeof item.name === 'object' ? item.name[lang] || item.name.am : item.name} x{item.quantity || item.qty || 1}
                  </span>
                  <span className="font-bold text-white">{(item.price * (item.quantity || item.qty || 1))} ETB</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-400">{lang === 'om' ? "Ida'ama:" : lang === 'en' ? "Total:" : "ጠቅላላ ዋጋ፦"}</span>
              <span className="text-xl font-black text-orange-500">{myActiveOrder.totalPrice} ETB</span>
            </div>
          </div>
        </div>
      )}

      {cartCount > 0 && !isModalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-gray-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex justify-between items-center z-[9999] border border-white/10">
          <button onClick={() => clearCart()} className="absolute -top-2.5 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer border-2 border-black z-[10000]">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-3 sm:p-4 rounded-[1.5rem] text-white shadow-lg shadow-orange-600/40">
              <ShoppingBag size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{t?.totalPrice || "Total"}</p>
              <p className="text-white text-xl sm:text-2xl font-black">{totalPrice} <span className="text-sm text-orange-500">ETB</span></p>
            </div>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl font-black text-white hover:bg-orange-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg shadow-orange-600/30 cursor-pointer">
            {t?.orderNow || "Order Now"}
          </button>
        </div>
      )}
    </>
  );
}