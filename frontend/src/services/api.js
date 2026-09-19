import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const API_BASE = `${BACKEND_URL}/api`;

// 1. የሜኑ ዕቃዎችን መፈለጊያ (ከ /menu-items ወደ /menu የተቀየረው)
export const fetchMenuItems = async () => {
  try {
    const res = await axios.get(`${API_BASE}/menu`);
    return res.data;
  } catch (err) {
    console.error("ሜኑዎችን ከሰርቨር ማምጣት አልተቻለም:", err);
    return [];
  }
};

// 2. በ Chapa ለመክፈል ማስጀመሪያ
export const initiateChapaPay = async (paymentData) => {
  try {
    const res = await axios.post(`${API_BASE}/chapa-pay`, paymentData);
    return res.data;
  } catch (err) {
    console.error("የ Chapa ክፍያ ማስጀመር ስህተት:", err);
    throw err;
  }
};

// 3. የ Chapa ክፍያ ከተፈጸመ በኋላ ማረጋገጫ
export const verifyChapaPayment = async (pendingOrder, trx_id) => {
  try {
    const res = await axios.post(`${API_BASE}/chapa-success-notify`, {
      pendingOrder,
      trx_id
    });
    return res.data;
  } catch (err) {
    console.error("የ Chapa ማረጋገጫ ስህተት:", err);
    throw err;
  }
};

// 4. መደበኛ ትዕዛዝ በፎቶ/ስክሪንሾት ወይም ያለ ፎቶ መላኪያ (FormData)
export const submitOrderFormData = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/orders`, formData);
    return res.data;
  } catch (err) {
    console.error("ትዕዛዝ መላክ አልተቻለም:", err);
    throw err;
  }
};