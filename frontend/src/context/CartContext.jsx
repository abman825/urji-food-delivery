import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); 

  
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

  
  const clearCart = () => setCartItems([]);

 
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

 
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, totalPrice, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);