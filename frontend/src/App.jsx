import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import OrderTrackerModal from './components/OrderTrackerModal';
import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function App() {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [lang, setLang] = useState('am');
  const [menuItems, setMenuItems] = useState([]);

  // 1. Refresh ሲደረግ Scroll ወደ ላይ እንዲመለስ
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // 2. ከ Database ሜኑውን መጫን እና በ Socket real-time ማዳመጥ
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/menu`);
        if (res.data && res.data.length > 0) {
          setMenuItems(res.data);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      }
    };

    fetchMenu();

    // Menu updates
    socket.on('menuUpdated', (updatedMenu) => {
      setMenuItems(updatedMenu);
    });

    socket.on('updateMenu', (updatedMenu) => {
      setMenuItems(updatedMenu);
    });

    return () => {
      socket.off('menuUpdated');
      socket.off('updateMenu');
    };
  }, []);

  // 3. 👈 ከተሌግራም ቦት የሚመጣውን Real-time Order Status Update ማዳመጫ (የተጨመረ)
  useEffect(() => {
    socket.on('orderStatusUpdated', (data) => {
      const { receiptId, status } = data;

      setActiveOrder((prevOrder) => {
        if (!prevOrder) return prevOrder;

        // የደረሰኝ ቁጥሩ ከያዝነው ትዕዛዝ ጋር ከተመሳሰለ ሁኔታውን ይቀይራል
        if (
          prevOrder.receiptId === receiptId || 
          prevOrder.id === receiptId || 
          prevOrder.orderId === receiptId
        ) {
          return {
            ...prevOrder,
            status: status
          };
        }
        return prevOrder;
      });
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, []);

  // 4. ትዕዛዝ ሲላክ Tracker መክፈት እና Socket Room መቀላቀል
  const handlePlaceOrder = (newOrderData) => {
    setActiveOrder(newOrderData);
    setIsTrackerOpen(true);

    // 👈 ደንበኛውን የትዕዛዙ ቁጥር ባለው Socket Room ውስጥ እንዲገባ ማድረግ
    const receiptId = newOrderData?.receiptId || newOrderData?.id || newOrderData?.orderId;
    if (receiptId) {
      socket.emit('joinOrderRoom', receiptId);
    }
  };

  return (
    <CartProvider>
      <div className="relative min-h-screen bg-black text-white">
        <Home 
          onPlaceOrder={handlePlaceOrder} 
          menuItems={menuItems} 
          setMenuItems={setMenuItems} 
        />

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