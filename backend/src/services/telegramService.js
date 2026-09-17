import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { TELEGRAM_TOKEN, ADMIN_CHAT_ID } from '../config/constants.js';

// Node.js HTTPS Agent config (IPv4 ን ለመጠቀም)
const agent = new https.Agent({ family: 4 });

/**
 * 1. በፎቶ/ስክሪንሾት የሚላክ የትዕዛዝ ማሳወቂያ (2 Inline Buttons አብረውት ይላካሉ)
 */
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

/**
 * 2. በጽሁፍ ብቻ የሚላክ የትዕዛዝ ማሳወቂያ (2 Inline Buttons አብረውት ይላካሉ)
 */
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

/**
 * 3. Telegram ላይ አዝራሩ (Button) ሲጫን የሚሰራው Callback Handler
 */
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

    // የቴሌግራም አዝራር ነካኪ Spinner ማቆሚያ (Popup Alert)
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: alertMessage
    }, { httpsAgent: agent });

    // Socket.io በመጠቀም ወደ ድህረ-ገፅ እና ለደንበኛው ማሳወቅ
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

    // በቴሌግራም መልእክቱ ስር የደረሰኝ ሁኔታ ማረጋገጫ መላክ
    const statusText = isPreparing ? '👨‍🍳 <b>በዝግጅት ላይ ነው</b>' : '✅ <b>ለደንበኛው ደርሷል</b>';
    
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

/**
 * 4. የዕለት ሽያጭ ማጠቃለያ ሪፖርት ለቴሌግራም አድሚን መላኪያ (/today Command)
 */
export const sendDailyReportToTelegram = async (totalOrdersCount, totalRevenue) => {
  const summaryMessage = `
📊 <b>የዛሬው የሽያጭ ማጠቃለያ (Daily Sales Report)</b>
━━━━━━━━━━━━━━━━━━━━━
📦 <b>ጠቅላላ የትዕዛዝ ብዛት:</b> ${totalOrdersCount} ትዕዛዞች
💰 <b>ጠቅላላ የገባ ገቢ:</b> ${totalRevenue} ETB
━━━━━━━━━━━━━━━━━━━━━
🕒 <b>ሰዓት:</b> ${new Date().toLocaleTimeString()}
<i>Urji Food Delivery System</i>
  `;

  return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: ADMIN_CHAT_ID,
    text: summaryMessage,
    parse_mode: 'HTML'
  }, {
    httpsAgent: agent,
    timeout: 10000
  });
};