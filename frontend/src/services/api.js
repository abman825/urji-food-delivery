import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

export const registerCafe = async (cafeData) => {
  try {
    const res = await axios.post(`${API_BASE}/cafes/register`, cafeData);
    return res.data;
  } catch (err) {
    console.error("የካፌ ምዝገባ ስህተት:", err);
    throw err.response?.data || { message: "ምዝገባው አልተሳካም" };
  }
};

export const loginCafe = async (credentials) => {
  try {
    const res = await axios.post(`${API_BASE}/cafes/login`, credentials);
    return res.data;
  } catch (err) {
    console.error("Erro no login do café:", err);
    throw err.response?.data || { message: "Falha ao realizar login" };
  }
};

export const fetchMenuItems = async (cafeId = '') => {
  try {
    const url = cafeId ? `${API_BASE}/menu?cafeId=${cafeId}` : `${API_BASE}/menu`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("ምግቦችን ከሰርቨር ማምጣት አልተቻለም:", err);
    return [];
  }
};

export const initiateChapaPay = async (paymentData) => {
  try {
    const res = await axios.post(`${API_BASE}/chapa-pay`, paymentData);
    return res.data;
  } catch (err) {
    console.error("የ Chapa ክፍያ ማዘጋጀት ስህተት:", err);
    throw err;
  }
};

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


export const submitOrderFormData = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/orders`, formData);
    return res.data;
  } catch (err) {
    console.error("ትዕዛዝ መላክ አልተቻለም:", err);
    throw err;
  }
};
