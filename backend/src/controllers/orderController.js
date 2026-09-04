import { sendPhotoToTelegram, sendMessageToTelegram } from '../services/telegramService.js';
import axios from 'axios';
import fs from 'fs';
import { CHAPA_SECRET_KEY } from '../config/constants.js';

// የምግቦች ዝርዝር ቅርፅ ማስተካከያ
const formatOrderItems = (items) => {
  if (!items) return '• ምንም የተመረጠ ምግብ የለም';
  
  let parsedItems = items;
  if (typeof items === 'string') {
    try {
      parsedItems = JSON.parse(items);
    } catch (e) {
      return items;
    }
  }

  if (Array.isArray(parsedItems) && parsedItems.length > 0) {
    return parsedItems
      .map(item => {
        const title = typeof item.name === 'object' 
          ? (item.name.am || item.name.en || item.name.om) 
          : (item.name || item.title || 'ምግብ');
        const qty = item.quantity || item.qty || 1;
        return `• <b>${title}</b> (x${qty}) - ${item.price || ''} ETB`;
      })
      .join('\n');
  }

  return String(items);
};

// 1. Chapa Success Order Handler
export const handleChapaSuccess = async (req, res) => {
  try {
    const { pendingOrder, trx_id } = req.body;

    const formattedItems = formatOrderItems(pendingOrder?.items);
    const receiptId = pendingOrder?.receiptId || `REC-${Date.now().toString().slice(-6)}`;

    const currentOrderType = pendingOrder?.orderType || 'Takeaway';
    const displayTableNo = currentOrderType === 'Takeaway' ? 'Takeaway' : (pendingOrder?.tableNo || '-');

    let details = '';
    if (pendingOrder?.name) details += `<b>👤 ስም:</b> ${pendingOrder.name}\n`;
    if (pendingOrder?.phone) details += `<b>📞 ስልክ:</b> <code>${pendingOrder.phone}</code>\n`;
    if (displayTableNo) details += `<b>📍 ጠረጴዛ ቁጥር:</b> <code>${displayTableNo}</code>\n`;
    if (pendingOrder?.address) details += `<b>📍 አድራሻ:</b> ${pendingOrder.address}\n`;
    if (pendingOrder?.time) details += `<b>⏰ ሰዓት:</b> ${pendingOrder.time}\n`;

    const message = `
<b>✅ የ Chapa ክፍያ ተፈፅሟል!</b>

<b>🆔 ደረሰኝ ቁጥር:</b> <code>${receiptId}</code>
<b>💳 Tx Ref:</b> <code>${trx_id || 'ያልታወቀ'}</code>
${details}<b>📦 አይነት:</b> ${currentOrderType}
<b>💳 የመክፈያ መንገድ:</b> <b>Chapa Online Payment</b>

<b>🛒 የታዘዙ የምግብ አይነቶች:</b>
${formattedItems}

<b>💰 የተከፈለው ዋጋ:</b> <b>${pendingOrder?.totalPrice || '0'} ETB</b>
`;

    try {
      await sendMessageToTelegram(message);
    } catch (telegramErr) {
      console.error('⚠️ Chapa Telegram Notification Failed:', telegramErr.message);
    }

    return res.status(200).json({ 
      success: true, 
      receiptId,
      paymentMethod: 'Chapa',
      message: 'ትዕዛዙ ወደ Telegram ተልኳል' 
    });

  } catch (error) {
    console.error('Chapa Handler Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'የ Chapa ትዕዛዝ አስተናጋጅ አልተቻለም' });
    }
  }
};

// 2. Chapa Payment Initialization
export const initiateChapaPayment = async (req, res) => {
  try {
    const { amount, name, phone, returnUrl } = req.body;

    let formattedPhone = phone ? phone.toString().trim() : '';
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '251' + formattedPhone.slice(1);
    }

    const tx_ref = `tx-${Date.now()}`;
    const clientHost = req.headers.origin || 'http://localhost:5173';
    const finalReturnUrl = returnUrl || `${clientHost}/?trx_id=${tx_ref}&status=success`;

    const chapaPayload = {
      amount: amount,
      currency: 'ETB',
      email: `${formattedPhone || 'customer'}@gmail.com`,
      first_name: name || 'Customer',
      last_name: 'Customer',
      phone_number: formattedPhone || '251900000000',
      tx_ref: tx_ref,
      callback_url: 'https://webhook.site/00000000-0000-0000-0000-000000000000',
      return_url: finalReturnUrl,
      customization: {
        title: 'Urji Cafe',
        description: 'Urji Cafe Food Order Payment'
      }
    };

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return res.status(200).json({ checkout_url: response.data.data.checkout_url });
    } else {
      return res.status(400).json({ success: false, message: 'የ Chapa ሊንክ ማፍለቅ አልተቻለም' });
    }

  } catch (error) {
    console.error('Chapa Init Error:', error?.response?.data || error.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Chapa ክፍያ ማሰመርመር አልተቻለም' });
    }
  }
};

// 3. Main Order / Screenshot Submission Handler
export const submitOrderFormData = async (req, res) => {
  try {
    const { name, phone, address, tableNo, time, orderType, totalPrice, items, paymentMethod } = req.body;
    const file = req.file;

    // 1. Order Type ማረጋገጫ
    const currentOrderType = orderType || 'Dine-In';

    // 2. Dine-In ከሆነ ብቻ ነው የወንበር ቁጥር መኖሩን ቼክ የሚያደርገው
    if (currentOrderType === 'Dine-In' && (!tableNo || !tableNo.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'እባክዎ የወንበር ቁጥር ያስገቡ!' 
      });
    }

    // 3. Takeaway ከሆነ የወንበር ቁጥር 'Takeaway' ይሆናል
    const displayTableNo = currentOrderType === 'Takeaway' ? 'Takeaway' : (tableNo || '-');

    const formattedItems = formatOrderItems(items);
    const orderId = `REC-${Date.now().toString().slice(-6)}`;
    
    let payMethodText = 'በካሽ (Cash on Delivery)';
    if (paymentMethod && paymentMethod.toLowerCase().includes('chapa')) {
      payMethodText = 'Chapa Online Payment';
    } else if (file) {
      payMethodText = 'በስክሪንሾት / ባንክ';
    }

    const hasReceipt = file ? '✅ አዎ (ከስር ተያይዟል)' : '❌ አልተያያዘም (በካሽ የሚከፈል)';

    let details = '';
    if (name) details += `<b>👤 ስም:</b> ${name}\n`;
    if (phone) details += `<b>📞 ስልክ:</b> <code>${phone}</code>\n`;
    if (displayTableNo) details += `<b>📍 ጠረጴዛ ቁጥር:</b> <code>${displayTableNo}</code>\n`;
    if (address) details += `<b>📍 አድራሻ:</b> ${address}\n`;
    if (time) details += `<b>⏰ ሰዓት:</b> ${time}\n`;

    const caption = `
<b>🛒 አዲስ ትዕዛዝ ደርሷል!</b>

<b>🆔 ደረሰኝ ቁጥር:</b> <code>${orderId}</code>
${details}<b>📦 አይነት:</b> ${currentOrderType}
<b>💳 የመክፈያ መንገድ:</b> <b>${payMethodText}</b>
<b>🧾 የክፍያ ስክሪንሾት:</b> ${hasReceipt}

<b>🛒 የታዘዙ የምግብ አይነቶች:</b>
${formattedItems}

<b>💰 ጠቅላላ ዋጋ:</b> <b>${totalPrice || '0'} ETB</b>
`;

    let screenshotBase64 = null;

    // Telegram መልእክት እና ምስል መላኪያ
    if (file) {
      const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);

      if (fileBuffer) {
        const mimeType = file.mimetype || 'image/png';
        screenshotBase64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        try {
          await sendPhotoToTelegram(fileBuffer, caption);
        } catch (telegramErr) {
          console.error('⚠️ Telegram Photo Send Error:', telegramErr.message);
        }
      } else {
        try {
          await sendMessageToTelegram(caption);
        } catch (telegramErr) {
          console.error('⚠️ Telegram Text Send Error:', telegramErr.message);
        }
      }

      if (file.path) {
        fs.unlink(file.path, () => {});
      }
    } else {
      try {
        await sendMessageToTelegram(caption);
      } catch (telegramErr) {
        console.error('⚠️ Telegram Text Send Error:', telegramErr.message);
      }
    }

    // 4. ወደ Admin Dashboard በ Socket.io የሚላክ Realtime መረጃ
    const orderData = {
      id: orderId,
      name: name || 'እንግዳ',
      phone: phone || '-',
      tableNo: displayTableNo,
      orderType: currentOrderType,
      totalPrice: totalPrice || '0',
      items: typeof items === 'string' ? JSON.parse(items) : items,
      paymentMethod: payMethodText,
      screenshot: screenshotBase64,
      createdAt: new Date()
    };

    if (req.io) {
      req.io.emit('newOrder', orderData);
    }

    return res.status(200).json({ 
      success: true, 
      orderId, 
      order: orderData,
      message: 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!' 
    });

  } catch (error) {
    console.error('SERVER ERROR IN submitOrderFormData:', error);
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'ትዕዛዙን መላክ አልተቻለም', error: error.message });
    }
  }
};

// 4. Toggle Availability Handler
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (req.io) {
      req.io.emit('menuItemUpdated', { id, isAvailable });
    }

    return res.status(200).json({ 
      success: true, 
      message: "ሁኔታው በተሳካ ሁኔታ ተቀይሯል",
      id,
      isAvailable 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 5. Alias Export
export const createScreenshotOrder = submitOrderFormData;