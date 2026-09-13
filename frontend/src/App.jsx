import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import OrderTrackerModal from './components/OrderTrackerModal';
import { menuItems as initialMenuItems } from './data/menuData.js';

export default function App() {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [lang, setLang] = useState('am'); // lang state እዚህ ጋር ተጨምሯል

  // 1. ገጹ Refresh ሲደረግ Scroll Position ወደ ላይኛው ጫፍ (Top) እንዲመለስ ማድረግ
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // 2. ትዕዛዝ ሲላክ (Checkout ሲደረግ) Tracker Modal የሚከፍት Function
  const handlePlaceOrder = (newOrderData) => {
    setActiveOrder(newOrderData);
    setIsTrackerOpen(true);
  };

  return (
    <CartProvider>
      <div className="relative min-h-screen bg-black text-white">
        {/* የዋናው ገጽ Home Component */}
        <Home onPlaceOrder={handlePlaceOrder} />

        {/* Real-time Order Tracker Modal */}
        <OrderTrackerModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          currentOrder={activeOrder}
          setCurrentOrder={setActiveOrder}
          lang={lang}
        />
      </div>
    </CartProvider>
  );
}