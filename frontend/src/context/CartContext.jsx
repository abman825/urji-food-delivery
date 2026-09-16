import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  // 🎯 ተደራራቢ ትዕዛዝን ሙሉ በሙሉ የሚቆልፍ State
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 3. ካርቶኑን ባዶ ማድረግ
  const clearCart = () => setCartItems([]);

  // 4. አጠቃላይ የላከውን የምግብ ብዛት ማሰቢያ
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 5. አጠቃላይ ዋጋ ማሰቢያ
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 🎯 6. ትዕዛዝ መላኪያ (ሙሉ በሙሉ Locked የሚሆንበት አሰራር)
  const submitOrder = async (customerDetails = {}) => {
    // 1. አንድ ጊዜ ከተነካ ወይም ካርቱ ባዶ ከሆነ በፍጹም አይሰራም!
    if (isSubmitting || cartItems.length === 0) return { success: false };

    // 🔒 2. በተኑን እዚህ ጋር ቆለፍነው (Locked & Spinning ይሆናል)
    setIsSubmitting(true); 

    try {
      const orderPayload = {
        items: cartItems,
        totalPrice,
        ...customerDetails
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderPayload);

      if (response.status === 200 || response.status === 201) {
        clearCart(); // ትዕዛዙ ከተሳካ ካርቱን ማጽዳት
        
        // 🎯 ትዕዛዙ ስለተሳካ UIው Modal ከተዘጋ በኋላ ብቻ እንዲከፈት ለአፍታ ቆይተን false እናደርጋለን
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("ትዕዛዝ ሲላክ ስህተት ተፈጠረ:", error);
      alert("ትዕዛዝ መላክ አልተቻለም። እባክዎን የኔትወርክ ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።");
      
      // ❌ ስህተት ከተፈጠረ ብቻ እንደገና መጫን እንዲችል በተኑን እንከፍተዋለን
      setIsSubmitting(false); 
      return { success: false, error };
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        totalPrice, 
        isSubmitting, 
        setIsSubmitting,
        addToCart, 
        removeFromCart, 
        clearCart,
        submitOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);