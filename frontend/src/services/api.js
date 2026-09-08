import axios from 'axios';

// Local ላይም ሆነ Vercel ላይ በራሱ Environment Variable ይመርጣል
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

export const fetchMenuItems = async () => {
  try {
    const res = await axios.get(`${API_BASE}/menu-items`);
    return res.data;
  } catch (err) {
    console.error("Error fetching menu:", err);
    return [];
  }
};

export const initiateChapaPay = async (paymentData) => {
  const res = await axios.post(`${API_BASE}/chapa-pay`, paymentData);
  return res.data;
};

export const verifyChapaPayment = async (pendingOrder, trx_id) => {
  const res = await axios.post(`${API_BASE}/chapa-success-notify`, {
    pendingOrder,
    trx_id
  });
  return res.data;
};

export const submitOrderFormData = async (formData) => {
  const res = await axios.post(`${API_BASE}/orders`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};