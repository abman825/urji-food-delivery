import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { TELEGRAM_TOKEN, ADMIN_CHAT_ID } from '../config/constants.js';

const agent = new https.Agent({ family: 4 });

// 1. በፎቶ/ስክሪንሾት ሲላክ (ከ Dynamic Receipt ID inline Button ጋር)
export const sendPhotoToTelegram = async (fileBuffer, caption, receiptId = '') => {
  const form = new FormData();
  form.append('chat_id', ADMIN_CHAT_ID);
  form.append('photo', fileBuffer, { filename: 'payment.jpg' });
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');

  const callbackData = receiptId ? `confirm_${receiptId}` : 'confirm_order';

  form.append('reply_markup', JSON.stringify({
    inline_keyboard: [
      [
        { text: 'Yes / አዎ (ተቀበል)', callback_data: callbackData }
      ]
    ]
  }));

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, form, {
    headers: form.getHeaders(),
    httpsAgent: agent,
    timeout: 10000
  });
};

// 2. በጽሁፍ ብቻ ሲላክ (ከ Dynamic Receipt ID inline Button ጋር)
export const sendMessageToTelegram = async (message, receiptId = '') => {
  const callbackData = receiptId ? `confirm_${receiptId}` : 'confirm_order';

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: ADMIN_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Yes / አዎ (ተቀበል)', callback_data: callbackData }
        ]
      ]
    }
  }, {
    httpsAgent: agent,
    timeout: 40000
  });
};

// 3. Telegram ላይ አዝራሩ ሲጫን የሚሰራው Callback
export const handleTelegramCallback = async (callbackQuery, io) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  const data = callbackQuery.data;

  // confirm_ በሚለው ከጀመረ (ለምሳሌ: confirm_REC-051289 ወይም confirm_order)
  if (data.startsWith('confirm')) {
    const text = message.caption || message.text || '';
    
    // Receipt ID ከ callback_data ወይም ከፅሁፉ ውስጥ መፈለግ
    let receiptId = data.includes('_') ? data.split('_')[1] : null;
    if (!receiptId || receiptId === 'order') {
      const receiptMatch = text.match(/REC-\d+/);
      receiptId = receiptMatch ? receiptMatch[0] : null;
    }

    // የቴሌግራም አዝራር Spinner ማቆም
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'ትዕዛዙ ተረጋግጧል!'
    }, { httpsAgent: agent });

    // 🎯 ደንበኛው ድረ-ገጽ ላይ ላለው Modal በ Socket.io 'In Progress' ብሎ መላክ
    if (receiptId && io) {
      const payload = { 
        receiptId, 
        status: 'In Progress', 
        message: 'ትዕዛዝዎ ደርሶናል! በዝግጅት ላይ ነው፤ ቶሎ እናመጣለን።' 
      };

      io.to(`order_${receiptId}`).emit('orderStatusUpdated', payload);
      io.emit('orderStatusUpdated', payload);
      io.to('adminRoom').emit('adminOrderStatusChanged', payload);
    }

    // በቴሌግራም ቻናል ላይ ማረጋገጫ መጻፍ
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: chatId,
      reply_to_message_id: messageId,
      text: `<b>✅ የደረሰኝ ቁጥር <code>${receiptId || ''}</code> ትዕዛዝ ተቀብለናል! ለደንበኛው በዌብሳይት መልእክት ተልኳል።</b>`,
      parse_mode: 'HTML'
    }, {
      httpsAgent: agent,
      timeout: 10000
    });
  }
};