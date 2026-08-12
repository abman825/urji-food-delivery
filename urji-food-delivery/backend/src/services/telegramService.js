import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { TELEGRAM_TOKEN, ADMIN_CHAT_ID } from '../config/constants.js';

// IPv6 ችግር ካለ ወደ IPv4 ብቻ እንዲያተኩር ማድረግ
const agent = new https.Agent({ family: 4 });

export const sendPhotoToTelegram = async (fileBuffer, caption) => {
  const form = new FormData();
  form.append('chat_id', ADMIN_CHAT_ID);
  form.append('photo', fileBuffer, { filename: 'payment.jpg' });
  form.append('caption', caption);
  form.append('parse_mode', 'Markdown');

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, form, {
    headers: form.getHeaders(),
    httpsAgent: agent,
    timeout: 10000 // 10 ሰከንድ ይቆያል
  });
};

export const sendMessageToTelegram = async (message) => {
  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: ADMIN_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  }, {
    httpsAgent: agent,
    timeout: 10000
  });
};