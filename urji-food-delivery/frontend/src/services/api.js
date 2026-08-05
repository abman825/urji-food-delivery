const API_BASE = 'http://localhost:5000/api';

export const fetchMenuItems = async () => {
  const res = await fetch(`${API_BASE}/menu`);
  return res.json();
};

export const verifyChapaPayment = async (pendingOrder, transactionId) => {
  const res = await fetch(`${API_BASE}/chapa-success-notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...pendingOrder, transactionId })
  });
  return res.json();
};

export const initiateChapaPay = async (payload) => {
  const res = await fetch(`${API_BASE}/chapa-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const submitOrderFormData = async (formData) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    body: formData
  });
  return res.json();
};