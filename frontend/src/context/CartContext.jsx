import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // 1. ምግብ ወደ ካርቶን መጨመሪያ
  const addToCart = (name, price) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.name === name);

      if (existingItem) {
        return prevItems.map(item =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
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
        return prevItems.filter(item => item.name !== name);
      } else {
        return prevItems.map(item =>
          item.name === name ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  // 3. ካርቶኑን ባዶ ማድረጊያ
  const clearCart = () => setCartItems([]);

  // 4. አዲሱን Receipt ID መዝጋቢ እና በ LocalStorage ውስጥ ማስቀመጫ
  const saveActiveReceiptId = (receiptId) => {
    if (receiptId) {
      localStorage.setItem('activeReceiptId', String(receiptId).trim());
    }
  };

  // 5. አጠቃላይ የላከውን የምግብ ብዛት እና ዋጋ ማሰቢያ
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      totalPrice, 
      addToCart, 
      removeFromCart, 
      clearCart,
      saveActiveReceiptId 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);