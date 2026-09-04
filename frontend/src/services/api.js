import axios from 'axios';

// Backend የሚሰራበት Base URL
const API_BASE = 'https://urji-food-delivery-1.onrender.com/api';

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