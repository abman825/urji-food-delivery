import axios from 'axios';
import https from 'https';
import { TELEGRAM_TOKEN } from '../config/constants.js';
import Order from '../models/Order.js';

const agent = new https.Agent({ family: 4 });

export const handleTelegramCallback = async (callbackQuery, io) => {
  try {
    const message = callbackQuery.message;
    const chatId = message.chat.id; // የ Admin Chat ID
    const messageId = message.message_id;
    const data = callbackQuery.data;

    // 1. ከአዝራሩ የመጣውን ዳታ መለየት (Prep / Confirm / Deliv)
    const isPreparing = data.startsWith('prep_') || data.startsWith('confirm');
    const isDelivered = data.startsWith('deliv_');

    if (isPreparing || isDelivered) {
      const text = message.caption || message.text || '';
      
      // Receipt ID ከ Data ወይም ከጽሁፉ ውስጥ ፈልጎ ማውጣት
      let receiptId = data.includes('_') ? data.split('_')[1] : null;
      if (!receiptId || receiptId === 'order') {
        const receiptMatch = text.match(/REC-\d+/);
        receiptId = receiptMatch ? receiptMatch[0] : null;
      }

      const newStatus = isPreparing ? 'In Progress' : 'Delivered';
      const alertMessage = isPreparing ? 'ትዕዛዙ እየተሰራ ነው ተብሏል!' : 'ትዕዛዙ ለደንበኛው ደርሷል!';
      
      // ለዌብሳይት ደንበኛው በ ስክሪን ላይ የሚታይ መልእክት
      const userMessage = isPreparing 
        ? 'ትዕዛዝዎ ደርሶናል! በዝግጅት ላይ ነን፣ ቶሎ እናመጣለን።' 
        : 'ምግብዎ ደርሷል! መልካም ምግብ፣ እናመሰግናለን።';

      // ሀ) ለአድሚኑ በቴሌግራም ላይ Pop-up ማሳየት (የአዝራሩ Spinner እንዲቆም)
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        callback_query_id: callbackQuery.id,
        text: alertMessage
      }, { httpsAgent: agent });

      // ሁ) Database ላይ Status Update ማድረግ
      let order = null;
      if (receiptId) {
        order = await Order.findOneAndUpdate(
          { receiptId: receiptId.trim() },
          { status: newStatus },
          { new: true }
        );
      }

      // ሒ) Socket.io - ለዌብሳይቱ ደንበኛ በ Real-time መላክ (ይህ ደንበኛው ጋር መልእክት እንዲደርስ ያደርጋል!)
      if (receiptId && io) {
        const payload = { 
          receiptId: receiptId.trim(), 
          status: newStatus, 
          message: userMessage,
          updatedOrder: order
        };

        // ለተወሰነው ደንበኛ Room
        io.to(`order_${receiptId.trim()}`).emit('orderStatusUpdated', payload);
        // ለጠቅላላው የዌብሳይት Socket
        io.emit('orderStatusUpdated', payload);
        // ለአድሚን ዳሽቦርድ
        io.to('adminRoom').emit('adminOrderStatusChanged', payload);
      }

      // መ) ለአድሚኑ የቴሌግራም ቻናል/ግሩፕ መልስ መላክ
      const statusText = isPreparing ? '👨‍🍳 <b>በዝግጅት ላይ ነው</b>' : '✅ <b>ለደንበኛው ደርሷል</b>';
      
      return await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `🔔 <b>የደራሰኝ ቁጥር <code>${receiptId || ''}</code> ሁኔታ ወደ ${statusText} ተቀይሯል።</b>`,
        parse_mode: 'HTML'
      }, {
        httpsAgent: agent,
        timeout: 10000
      });
    }
  } catch (error) {
    console.error('Telegram callback error:', error?.response?.data || error.message);
  }
};