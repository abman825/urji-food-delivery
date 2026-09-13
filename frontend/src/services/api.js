import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

// 1. የሜኑ እቃዎችን መፈለጊያ
export const fetchMenuItems = async () => {
  try {
    const res = await axios.get(`${API_BASE}/menu-items`);
    return res.data;
  } catch (err) {
    console.error("Error fetching menu:", err);
    return [];
  }
};

// 2. በ Chapa ለመክፈል ማስጀመሪያ (receiptId እና lang መጨመራቸውን ማረጋገጥ)
export const initiateChapaPay = async (paymentData) => {
  try {
    const res = await axios.post(`${API_BASE}/chapa-pay`, paymentData);
    return res.data;
  } catch (err) {
    console.error("Chapa payment initiation error:", err);
    throw err;
  }
};

// 3. የ Chapa ክፍያ ከተፈጸመ በኋላ ማረጋገጫና ለቴሌግራም/Socket መላኪያ
export const verifyChapaPayment = async (pendingOrder, trx_id) => {
  try {
    const res = await axios.post(`${API_BASE}/chapa-success-notify`, {
      pendingOrder,
      trx_id
    });
    return res.data;
  } catch (err) {
    console.error("Chapa verification error:", err);
    throw err;
  }
};

// 4. መደበኛ ትዕዛዝ በፎቶ/ስክሪንሾት ወይም ያለ ፎቶ መላኪያ (FormData)
export const submitOrderFormData = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/orders`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (err) {
    console.error("Submit order error:", err);
    throw err;
  }
};