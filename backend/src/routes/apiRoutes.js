import express from 'express';
import multer from 'multer';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability 
} from '../controllers/orderController.js';
import MenuItem from '../models/MenuItem.js';
import { handleTelegramCallback } from '../services/telegramService.js';

const router = express.Router();

// Multer Config (Memory Storage for Buffer Uploads)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- 🍔 MENU ROUTES ---

// 1. ሁሉንም ሜኑ ከ Database ለማምጣት
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
      // Home.jsx ላይ 'updateMenu' ተብሎ የተከፈተውን socket ለማሳወቅ
      socketIo.emit('updateMenu', updatedItems);
    }

    res.json(updatedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 📦 ORDER & TELEGRAM ROUTES ---

// 3. Telegram Webhook Endpoint (ከ Telegram Bot Callback እንዲቀበል)
router.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    const socketIo = req.app.get('socketio');

    if (update && update.callback_query) {
      await handleTelegramCallback(update.callback_query, socketIo);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram Webhook Error in Route:", err);
    res.sendStatus(500);
  }
});

// 4. Order Submission Routes
router.post('/orders', upload.single('image'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

export default router;