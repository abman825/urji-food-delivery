import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import { TELEGRAM_TOKEN, ADMIN_CHAT_ID } from '../config/constants.js';
import Order from '../models/Order.js'; 


const agent = new https.Agent({ family: 4 });

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

export const handleTelegramCallback = async (callbackQuery, io) => {
  try {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const messageId = message.message_id;
    const data = callbackQuery.data;

    // 1. ቴሌግራም ላይ አዝራሩ (Button) Loading እንዲያቆም ወዲያውኑ ምላሽ መስጠት
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: "እየተሰራ ነው..."
    }, { httpsAgent: agent });

    const isPreparing = data.startsWith('prep_');
    const isDelivered = data.startsWith('deliv_');

    if (isPreparing || isDelivered) {
      const text = message.caption || message.text || '';
      
      let receiptId = data.includes('_') ? data.split('_')[1] : null;
      if (!receiptId || receiptId === 'order') {
        const receiptMatch = text.match(/REC-\d+/);
        receiptId = receiptMatch ? receiptMatch[0] : null;
      }

      const newStatus = isPreparing ? 'In Progress' : 'Delivered';
      const userMessage = isPreparing 
        ? 'ትዕዛዝዎ እየተዘጋጀ ነው!' 
        : 'ትዕዛዝዎ ደርሷል!';

      // 2. በ MongoDB ውስጥ የትዕዛዙን Status ማስተካከል
      if (receiptId) {
        await Order.findOneAndUpdate(
          { receiptId: receiptId },
          { status: newStatus }
        );
      }

      // 3. በ Socket.io አማካኝነት ሪል-ታይም አፕዴት መላክ
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

      // 4. በቴሌግራም የሚመጣውን መልእክት ማስተካከል
      const statusText = isPreparing ? '👨‍🍳 <b>በዝግጅት ላይ ነው</b>' : '✅ <b>ለደንበኛው ደርሷል</b>';
      
      return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: chatId,
        reply_to_message_id: messageId,
        text: `<b>የተዕዛዝ ቁጥር <code>${receiptId || ''}</code> ሁኔታ ወደ ${statusText} ተቀይሯል!</b>`,
        parse_mode: 'HTML'
      }, {
        httpsAgent: agent,
        timeout: 10000
      });
    }
  } catch (error) {
    console.error('Telegram callback ሲሰራ ስህተት አጋጥሟል:', error);
  }
};


export const sendDailyReportToTelegram = async (totalOrdersCount, totalRevenue) => {
  const summaryMessage = `
📊 <b>የዛሬው የሽያጭ ማጠቃለያ (Daily Sales Report)</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>ጠቅላላ የትዕዛዝ ብዛት:</b> ${totalOrdersCount} ትዕዛዞች
💰 <b>ጠቅላላ የገባ ገቢ:</b> ${totalRevenue} ETB
━━━━━━━━━━━━━━━━━━━━
⏰ <b>ሰዓት:</b> ${new Date().toLocaleTimeString()}
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