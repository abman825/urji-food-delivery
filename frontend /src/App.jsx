import React, { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';

export default function App() {
  useEffect(() => {
    // 1. Browser-ኡ የቀደመውን Scroll Position እንዳያስታውስ ያደርጋል
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. ገጹ ሲከፈት/Refresh ሲደረግ ቀጥታ ወደ መነሻ (ላይኛው ጫፍ) ይወስደዋል
    window.scrollTo(0, 0);
  }, []);

  return (
    <CartProvider>
      <Home />
    </CartProvider>
  );
}