import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // የምግቦች ዝርዝር (Array of Objects)

  // 1. ምግብ ወደ ካርቶን መጨመሪያ
  const addToCart = (name, price) => {
    setCartItems(prevItems => {
      // እቃው አስቀድሞ በካርቶኑ ውስጥ እንዳለ እንፈትሻለን
      const existingItem = prevItems.find(item => item.name === name);

      if (existingItem) {
        // ካለ ብዛቱን (quantity) ብቻ +1 እንጨምራለን
        return prevItems.map(item =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // ከሌለ አዲስ ምግብ አድርገን በ ብዛት 1 እንጨምረዋለን
        return [...prevItems, { name, price, quantity: 1 }];
      }
    });
  };

  // 2. ምግብ ከካርቶን መቀነሻ
  const removeFromCart = (name) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.name === name);

      if (!existingItem) return prevItems;

      if (existingItem.quantity === 1) {
        // ብዛቱ 1 ከሆነ ሙሉ በሙሉ ከዝርዝሩ እናስወግደዋለን
        return prevItems.filter(item => item.name !== name);
      } else {
        // ብዛቱ ከ 1 በላይ ከሆነ -1 እንቀንሳለን
        return prevItems.map(item =>
          item.name === name ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  // 3. ካርቶኑን ባዶ ማድረጊያ
  const clearCart = () => setCartItems([]);

  // 4. አጠቃላይ የላከውን የምግብ ብዛት ማሰቢያ (Total Items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 5. አጠቃላይ ዋጋ ማሰቢያ (Total Price)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, totalPrice, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);