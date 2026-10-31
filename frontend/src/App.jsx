import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import OrderTrackerModal from './components/OrderTrackerModal';
import AdminDashboard from './components/AdminDashboard';
import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL, { autoConnect: true });

export default function App() {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [lang, setLang] = useState('am');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/menu`);
        if (res.data && res.data.length > 0) {
          setMenuItems(res.data);
        }
      } catch (err) {
        console.error("Menu fetch error:", err);
      }
    };

    fetchMenu();

    socket.on('menuUpdated', (updatedMenu) => {
      setMenuItems(updatedMenu);
    });

    return () => {
      socket.off('menuUpdated');
    };
  }, []);

  const handlePlaceOrder = (newOrderData) => {
    setActiveOrder(newOrderData);
    setIsTrackerOpen(true);
  };

  return (
    <CartProvider>
      <Router>
        <div className="relative min-h-screen bg-black text-white">
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={
                <Home 
                  onPlaceOrder={handlePlaceOrder} 
                  menuItems={menuItems} 
                  setMenuItems={setMenuItems} 
                  lang={lang}
                  setLang={setLang}
                />
              } 
            />

            {/* Admin Dashboard Route with lang prop */}
            <Route 
              path="/admin" 
              element={<AdminDashboard lang={lang} />} 
            />
          </Routes>

          {/* Order Tracker Modal */}
          <OrderTrackerModal
            isOpen={isTrackerOpen}
            onClose={() => setIsTrackerOpen(false)}
            currentOrder={activeOrder}
            setCurrentOrder={setActiveOrder}
            lang={lang}
          />
        </div>
      </Router>
    </CartProvider>
  );
}