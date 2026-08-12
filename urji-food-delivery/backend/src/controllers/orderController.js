import axios from 'axios';
import { CHAPA_AUTH_KEY } from '../config/constants.js';
import { sendPhotoToTelegram, sendMessageToTelegram } from '../services/telegramService.js';

export const createScreenshotOrder = async (req, res) => {
  const { name, phone, address, totalPrice, items, orderType } = req.body;
  // orderController.js ውስጥ response ሲመለስ፡
const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

// Telegram ቢሳሳትም ባይሳሳትም ለ frontend orderId መልስ፡
res.status(200).json({ 
  success: true, 
  orderId: orderId,
  message: "Order placed successfully" 
});
  
  const caption = `📸 **አዲስ ትዕዛዝ (በፎቶ)**\n\n` +
                  `🆔 ቁጥር፡ ${orderId}\n` +
                  `👤 ደንበኛ፡ ${name}\n` +
                  `📞 ስልክ፡ ${phone}\n` +
                  `📍 አድራሻ፡ ${orderType === 'Takeaway' ? address : 'እዚሁ መመገብ'}\n` +
                  `🍲 ምግቦች: ${items || 'ያልተጠቀሰ'}\n` +
                  `💰 ጠቅላላ፡ ${totalPrice} ETB`;

  try {
    await sendPhotoToTelegram(req.file.buffer, caption);
    res.json({ success: true, orderId });
  } catch (error) {
    console.error("Telegram error detail:", error.message);
    res.status(500).json({ success: false, error: "ቴሌግራም መልእክት መላክ አልቻለም" });
  }
};

export const initiateChapaPayment = async (req, res) => {
  const { amount, name, phone, items } = req.body;
  const tx_ref = `TX-${Date.now()}`;

  try {
    const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
      amount: amount.toString(),
      currency: "ETB",
      email: `${phone || 'customer'}abrhamman825@gmail.com`, 
      first_name: name || "Customer",
      phone_number: phone,
      tx_ref: tx_ref,
      return_url: `http://localhost:5173/?trx_id=${tx_ref}`, 
      "customization[title]": "ኡርጂ ምግብ ቤት",
      "customization[description]": items || "የምግብ ትዕዛዝ"
    }, { 
      headers: { 
        Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
        "Content-Type": "application/json"
      } 
    });

    res.json(response.data.data);
  } catch (error) {
    console.error("Chapa Detail Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Chapa Initialize Failed", 
      message: error.response?.data?.message || "Internal Error" 
    });
  }
};

export const handleChapaSuccess = async (req, res) => {
  const { name, phone, address, amount, items, orderType, transactionId } = req.body;
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const message = `💳 **አዲስ ትዕዛዝ (በChapa የተከፈለ)**\n\n` +
                  `🆔 ቁጥር፡ ${orderId}\n` +
                  `🧾 Trans ID: ${transactionId}\n` +
                  `👤 ደንበኛ፡ ${name}\n` +
                  `📞 ስልክ፡ ${phone}\n` +
                  `📍 አድራሻ፡ ${orderType === 'Takeaway' ? address : 'እዚሁ መመገብ'}\n` +
                  `🍲 ምግቦች: ${items}\n` +
                  `💰 የተከፈለው፡ ${amount} ETB`;

  try {
    await sendMessageToTelegram(message);
    res.json({ success: true, orderId });
  } catch (error) {
    console.error("Telegram Notification Error:", error.message);
    res.status(500).json({ success: false, error: "ቴሌግራም ማሳወቅ አልተቻለም" });
  }
};