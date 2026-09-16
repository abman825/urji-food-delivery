import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { TELEGRAM_TOKEN, ADMIN_CHAT_ID } from '../config/constants.js';

const agent = new https.Agent({ family: 4 });

// 1. በፎቶ/ስክሪንሾት ሲላክ (2 Inline Buttons: እየተሰራ ነው እና ደርሷል)
export const sendPhotoToTelegram = async (fileBuffer, caption, receiptId = '') => {
  const form = new FormData();
  form.append('chat_id', ADMIN_CHAT_ID);
  form.append('photo', fileBuffer, { filename: 'payment.jpg' });
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');

  const preparingData = receiptId ? `prep_${receiptId}` : 'prep_order';
  const deliveredData = receiptId ? `deliv_${receiptId}` : 'deliv_order';

  form.append('reply_markup', JSON.stringify({
    inline_keyboard: [
      [
        { text: '👨‍🍳 እየተሰራ ነው', callback_data: preparingData },
        { text: '✅ ደርሷል (ከስክሪን አጥፋ)', callback_data: deliveredData }
      ]
    ]
  }));

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, form, {
    headers: form.getHeaders(),
    httpsAgent: agent,
    timeout: 10000
  });
};

// 2. በጽሁፍ ብቻ ሲላክ (2 Inline Buttons)
export const sendMessageToTelegram = async (message, receiptId = '') => {
  const preparingData = receiptId ? `prep_${receiptId}` : 'prep_order';
  const deliveredData = receiptId ? `deliv_${receiptId}` : 'deliv_order';

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: ADMIN_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '👨‍🍳 እየተሰራ ነው', callback_data: preparingData },
          { text: '✅ ደርሷል (ከስክሪን አጥፋ)', callback_data: deliveredData }
        ]
      ]
    }
  }, {
    httpsAgent: agent,
    timeout: 40000
  });
};

// 3. Telegram ላይ አዝራሩ ሲጫን የሚሰራው Callback Handler
export const handleTelegramCallback = async (callbackQuery, io) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  const data = callbackQuery.data;

  const isPreparing = data.startsWith('prep_') || data.startsWith('confirm');
  const isDelivered = data.startsWith('deliv_');

  if (isPreparing || isDelivered) {
    const text = message.caption || message.text || '';
    
    let receiptId = data.includes('_') ? data.split('_')[1] : null;
    if (!receiptId || receiptId === 'order') {
      const receiptMatch = text.match(/REC-\d+/);
      receiptId = receiptMatch ? receiptMatch[0] : null;
    }

    const newStatus = isPreparing ? 'In Progress' : 'Delivered';
    const alertMessage = isPreparing ? 'ትዕዛዙ እየተሰራ ነው ተብሏል!' : 'ትዕዛዙ ለደንበኛው ደርሷል!';
    const userMessage = isPreparing 
      ? 'ትዕዛዝዎ ደርሶናል! በዝግጅት ላይ ነን፤ ቶሎ እናመጣለን።' 
      : 'ምግብዎ ደርሷል! መልካም ምግብ፤ እናመሰግናለን።';

    // የቴሌግራም Spinner ማቆም
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: alertMessage
    }, { httpsAgent: agent });

    // 🎯 Socket.io በመጠቀም ወደ ድህረ-ገፁ እና ለደንበኛው ማሳወቅ
    if (receiptId && io) {
      const payload = { 
        receiptId, 
        status: newStatus, 
        message: userMessage 
      };

      io.to(`order_${receiptId}`).emit('orderStatusUpdated', payload);
      io.emit('orderStatusUpdated', payload);
      io.to('adminRoom').emit('adminOrderStatusChanged', payload);
    }

    // በቴሌግራም ግሩፕ/ቻናል ላይ ማረጋገጫ መፃፍ
    const statusText = isPreparing ? '👨‍🍳 <b>በዝግጅት ላይ ነው</b>' : '✅ <b>ለደንበኛው ደርሷል (ከስክሪን ጠፍቷል)</b>';
    
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: chatId,
      reply_to_message_id: messageId,
      text: `<b>የደረሰኝ ቁጥር <code>${receiptId || ''}</code> ሁኔታ ወደ ${statusText} ተቀይሯል።</b>`,
      parse_mode: 'HTML'
    }, {
      httpsAgent: agent,
      timeout: 10000
    });
  }
};