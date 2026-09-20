import { sendPhotoToTelegram, sendMessageToTelegram } from '../services/telegramService.js';
import axios from 'axios';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CHAPA_SECRET_KEY } from '../config/constants.js';
import Order from '../models/Order.js';

// የምግብ ዝርዝር ማስተካከያ እና ፎርማተር
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

// 1. Admin Dashboard Stats Handler
export const getAdminDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let dailySales = 0;
    let weeklySales = 0;
    let monthlySales = 0;
    let yearlySales = 0;
    const itemSalesCount = {};

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const price = parseFloat(order.totalPrice) || 0;
      
      if (orderDate >= startOfToday) dailySales += price;
      if (orderDate >= startOfWeek) weeklySales += price;
      if (orderDate >= startOfMonth) monthlySales += price;
      if (orderDate >= startOfYear) yearlySales += price;

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = typeof item.name === 'object' ? (item.name.am || item.name.en) : item.name;
          const qty = item.quantity || item.qty || 1;
          if (name) {
            itemSalesCount[name] = (itemSalesCount[name] || 0) + qty;
          }
        });
      }
    });

    const topItems = Object.entries(itemSalesCount)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({
      allOrders: orders,
      stats: { dailySales, weeklySales, monthlySales, yearlySales },
      topItems
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Get All Orders Handler
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. Chapa Success Order Handler
export const handleChapaSuccess = async (req, res) => {
  try {
    const { pendingOrder, trx_id } = req.body;

    const formattedItems = formatOrderItems(pendingOrder?.items);
    const receiptId = pendingOrder?.receiptId || `REC-${Date.now().toString().slice(-6)}`;

    const currentOrderType = pendingOrder?.orderType || 'Takeaway';
    const displayTableNo = currentOrderType === 'Takeaway' ? 'Takeaway' : (pendingOrder?.tableNo || '-');

    const userNote = pendingOrder?.note || 'የለም';

    let details = '';
    if (pendingOrder?.name) details += `<b>👤 ስም:</b> ${pendingOrder.name}\n`;
    if (pendingOrder?.phone) details += `<b>📞 ስልክ:</b> <code>${pendingOrder.phone}</code>\n`;
    if (displayTableNo) details += `<b>📍 ጠረጴዛ ቁጥር:</b> <code>${displayTableNo}</code>\n`;
    if (pendingOrder?.address) details += `<b>📍 አድራሻ:</b> ${pendingOrder.address}\n`;
    if (pendingOrder?.time) details += `<b>⏰ ሰዓት:</b> ${pendingOrder.time}\n`;

    const message = `
<b>✅ የ Chapa ክፍያ ተፈጽሟል!</b>

<b>🆔 የደራሰኝ ቁጥር:</b> <code>${receiptId}</code>
<b>💳 Tx Ref:</b> <code>${trx_id || 'ልዩነቱ አልታወቀም'}</code>
${details}<b>📝 አስተያየት (Note):</b>
<code>${userNote}</code>

<b>📦 ዓይነት:</b> ${currentOrderType}
<b>💳 የመክፈያ መንገድ:</b> <b>Chapa Online Payment</b>

<b>🛒 የታዘዙ የምግብ ዓይነቶች:</b>
${formattedItems}

<b>💰 የተከፈለው ዋጋ:</b> <b>${pendingOrder?.totalPrice || '0'} ETB</b>
`;

    try {
      await sendMessageToTelegram(message, receiptId);
    } catch (telegramErr) {
      console.error('⚠️ Chapa Telegram Notification Failed:', telegramErr.message);
    }

    // Database ውስጥ ማስቀመጥ
    try {
      const parsedItems = typeof pendingOrder?.items === 'string' ? JSON.parse(pendingOrder.items) : pendingOrder?.items;
      const newOrder = new Order({
        receiptId,
        name: pendingOrder?.name || 'እንግዳ',
        phone: pendingOrder?.phone || '-',
        tableNo: displayTableNo,
        orderType: currentOrderType,
        totalPrice: pendingOrder?.totalPrice || '0',
        items: parsedItems,
        note: userNote,
        customerInfo: { ...pendingOrder, note: userNote },
        paymentMethod: 'Chapa Online Payment',
        socketId: pendingOrder?.socketId || '',
        status: 'Pending',
        createdAt: new Date()
      });
      await newOrder.save();

      const io = req.app.get('socketio') || req.io;
      if (io) {
        io.to('adminRoom').emit('newOrder', newOrder);
        io.emit('newOrder', newOrder);
      }
    } catch (dbErr) {
      console.error("MongoDB Chapa Save Error:", dbErr);
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

// 4. Chapa Payment Initialization
export const initiateChapaPayment = async (req, res) => {
  try {
    const { amount, name, phone, returnUrl } = req.body;

    let formattedPhone = phone ? phone.toString().trim() : '';
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '251' + formattedPhone.slice(1);
    }

    const tx_ref = `tx-${Date.now()}`;
    const clientHost = req.headers.origin || 'https://urji-food-delivery.vercel.app';
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
      return res.status(400).json({ success: false, message: 'የ Chapa ሊንክ መፈቀድ አልተቻለም' });
    }

  } catch (error) {
    console.error('Chapa Init Error:', error?.response?.data || error.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Chapa ክፍያ ማሰመርመም አልተቻለም' });
    }
  }
};

// 5. Main Order / Screenshot Submission Handler
export const submitOrderFormData = async (req, res) => {
  try {
    const { name, phone, address, tableNo, time, orderType, totalPrice, items, paymentMethod, note, customerInfo, socketId } = req.body;
    const file = req.file;

    let parsedCustomerInfo = {};
    if (customerInfo) {
      try {
        parsedCustomerInfo = typeof customerInfo === 'string' ? JSON.parse(customerInfo) : customerInfo;
      } catch (e) {
        console.error("CustomerInfo JSON parse error:", e);
      }
    }

    const userNote = note || parsedCustomerInfo?.note || 'የለም';
    const currentOrderType = orderType || parsedCustomerInfo?.orderType || 'Dine-In';
    const inputTableNo = tableNo || parsedCustomerInfo?.tableNo;

    // QR Code / Table Number Check Validation
    if (currentOrderType !== 'Takeaway') {
      if (!inputTableNo || String(inputTableNo).trim() === '' || inputTableNo === 'null' || inputTableNo === 'undefined') {
        if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ 
          success: false, 
          message: 'እባክዎን ማዘዝ እንዲችሉ ጠረጴዛው ላይ ያለውን QR Code ያንብቡ!' 
        });
      }
    }

    const displayTableNo = currentOrderType === 'Takeaway' ? 'Takeaway' : (inputTableNo || '-');
    const orderId = `REC-${Date.now().toString().slice(-6)}`;
    
    let payMethodText = 'በካሽ (Cash on Delivery)';
    if (paymentMethod && paymentMethod.toLowerCase().includes('chapa')) {
      payMethodText = 'Chapa Online Payment';
    } else if (file) {
      payMethodText = 'በስክሪንሾት/ ባንክ';
    }

    const hasReceipt = file ? '✅ አዎ (ስክሪንሾት ተያይዟል)' : '❌ አልተያያዘም (በካሽ የሚከፈል)';

    const customerName = name || parsedCustomerInfo?.name;
    const customerPhone = phone || parsedCustomerInfo?.phone;
    const customerAddress = address || parsedCustomerInfo?.address;
    const customerTime = time || parsedCustomerInfo?.time;

    let details = '';
    if (customerName) details += `<b>👤 ስም:</b> ${customerName}\n`;
    if (customerPhone) details += `<b>📞 ስልክ:</b> <code>${customerPhone}</code>\n`;
    if (displayTableNo) details += `<b>📍 ጠረጴዛ ቁጥር:</b> <code>${displayTableNo}</code>\n`;
    if (customerAddress) details += `<b>📍 አድራሻ:</b> ${customerAddress}\n`;
    if (customerTime) details += `<b>⏰ ሰዓት:</b> ${customerTime}\n`;

    const formattedItems = formatOrderItems(items);

    const caption = `
<b>🛒 አዲስ ትዕዛዝ ደርሷል!</b>

<b>🆔 የደራሰኝ ቁጥር:</b> <code>${orderId}</code>
${details}<b>📝 አስተያየት (Note):</b>
<code>${userNote}</code>

<b>📦 ዓይነት:</b> ${currentOrderType}
<b>💳 የመክፈያ መንገድ:</b> <b>${payMethodText}</b>
<b>🧾 የክፍያ ስክሪንሾት:</b> ${hasReceipt}

<b>🛒 የታዘዙ የምግብ ዓይነቶች:</b>
${formattedItems}

<b>💰 ጠቅላላ ዋጋ:</b> <b>${totalPrice || '0'} ETB</b>
`;

    let screenshotCloudinaryUrl = "";

    // 1. ፎቶ ከተላከ ወደ Cloudinary Upload ማድረግ እና Telegram መላክ
    if (file) {
      const filePath = file.path;
      const fileBuffer = file.buffer || (filePath ? fs.readFileSync(filePath) : null);

      if (fileBuffer) {
        try {
          await sendPhotoToTelegram(fileBuffer, caption, orderId);
        } catch (telegramErr) {
          console.error('⚠️ Telegram Photo Send Error:', telegramErr.message);
        }
      }

      try {
        if (filePath) {
          const cloudResult = await cloudinary.uploader.upload(filePath, {
            folder: 'payment_screenshots'
          });
          screenshotCloudinaryUrl = cloudResult.secure_url;
        }
      } catch (cloudErr) {
        console.error('⚠️ Cloudinary Upload Error in Order:', cloudErr.message);
      }

      if (filePath) {
        fs.unlink(filePath, () => {});
      }
    } else {
      try {
        await sendMessageToTelegram(caption, orderId);
      } catch (telegramErr) {
        console.error('⚠️ Telegram Text Send Error:', telegramErr.message);
      }
    }

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    // 2. Database ላይ አዲሱን Order ከ socketId ጋር ሴቭ ማድረግ
    let savedOrder = null;
    try {
      const finalSocketId = socketId || parsedCustomerInfo?.socketId || req.body.socketId || '';

      const newOrder = new Order({
        receiptId: orderId,
        name: customerName || 'እንግዳ',
        phone: customerPhone || '-',
        tableNo: displayTableNo,
        orderType: currentOrderType,
        totalPrice: totalPrice || '0',
        items: parsedItems,
        note: userNote,
        customerInfo: { ...parsedCustomerInfo, name: customerName, phone: customerPhone, tableNo: displayTableNo, note: userNote },
        paymentMethod: payMethodText,
        screenshotUrl: screenshotCloudinaryUrl,
        socketId: finalSocketId,
        status: 'Pending',
        createdAt: new Date()
      });
      savedOrder = await newOrder.save();
    } catch (dbError) {
      console.error("MongoDB Order Save Error:", dbError);
    }

    const orderData = savedOrder ? savedOrder.toObject() : {
      id: orderId,
      receiptId: orderId,
      name: customerName || 'እንግዳ',
      phone: customerPhone || '-',
      tableNo: displayTableNo,
      orderType: currentOrderType,
      totalPrice: totalPrice || '0',
      items: parsedItems,
      note: userNote,
      paymentMethod: payMethodText,
      screenshotUrl: screenshotCloudinaryUrl,
      socketId: socketId || '',
      status: 'Pending',
      createdAt: new Date()
    };

    const io = req.app.get('socketio') || req.io;
    if (io) {
      io.to('adminRoom').emit('newOrder', orderData);
      io.emit('newOrder', orderData);
    }

    return res.status(200).json({ 
      success: true, 
      receiptId: orderId,
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

// 6. Toggle Availability Handler
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const io = req.app.get('socketio') || req.io;
    if (io) {
      io.emit('menuItemUpdated', { id, isAvailable });
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

export const createScreenshotOrder = submitOrderFormData;