import express from 'express';
import multer from 'multer';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability 
} from '../controllers/orderController.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js'; // 1. የ Order ሞዴል ተጨምሯል
import { 
  handleTelegramCallback, 
  sendDailyReportToTelegram 
} from '../services/telegramService.js'; // 2. የ Telegram Service ተጨምሯል

const router = express.Router();

// Multer Config: የፋይል መጠኑን እስከ 10MB ይፈቅዳል
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// --- 🍔 MENU ROUTES ---

// 1. ሁሉንም ሜኑ ከ Database ለመክፈት
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. ሜኑ ሲቀየር/ሲጨመር Database እና Socket ማደሻ (Real-time Broadcast)
router.post('/menu/update', async (req, res) => {
  try {
    const { items } = req.body;
    
    await MenuItem.deleteMany({});
    const updatedItems = await MenuItem.insertMany(items);

    const socketIo = req.app.get('socketio');
    if (socketIo) {
      socketIo.emit('updateMenu', updatedItems);
    }

    res.json(updatedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 📦 ORDER ROUTES ---
router.post('/orders', upload.single('screenshot'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

// --- 🤖 TELEGRAM BOT WEBHOOK ROUTE (አዲስ የተጨመረ) ---
router.post('/telegram-webhook', async (req, res) => {
  try {
    const { callback_query, message } = req.body;
    const io = req.app.get('socketio') || req.app.get('io');

    // 1. አድሚኑ በቴሌግራም አዝራር (Button) ሲጫን
    if (callback_query) {
      await handleTelegramCallback(callback_query, io);
      return res.status(200).send('OK');
    }

    // 2. አድሚኑ /today ወይም /stats ብሎ ሲፅፍ
    if (message && message.text) {
      const command = message.text.trim().toLowerCase();

      if (command === '/today' || command === '/stats') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // የዛሬዎቹን ትዕዛዞች ከ Database መፈለግ
        const todayOrders = await Order.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalOrdersCount = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

        // ሪፖርቱን ወደ ቴሌግራም መላክ
        await sendDailyReportToTelegram(totalOrdersCount, totalRevenue);
        return res.status(200).send('OK');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    res.status(500).send('Error handling Telegram Webhook');
  }
});

export default router;