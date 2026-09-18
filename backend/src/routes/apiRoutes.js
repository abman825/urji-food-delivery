import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability,
  getAdminDashboardStats,
  submitOrderFormData
} from '../controllers/orderController.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { 
  handleTelegramCallback, 
  sendDailyReportToTelegram 
} from '../services/telegramService.js';

const router = express.Router();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Multer Storage Config (ከ Memory/Disk ፋይል ለመቀበል)
const storage = multer.diskStorage({});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- 📸 CLOUDINARY FILE UPLOAD ROUTE ---
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ፎቶውን ወደ Cloudinary መላክ
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'menu_images'
    });

    // Cloudinary የሰጠንን Secure URL መመለስ
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
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

// --- 📦 ORDER & ADMIN ROUTES ---
router.post('/orders', upload.single('screenshot'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

// የአድሚን ዳሽቦርድ ዳታ መቀበያ route
router.get('/admin/dashboard-stats', getAdminDashboardStats);

// --- 🤖 TELEGRAM BOT WEBHOOK ROUTE ---
router.post('/telegram-webhook', async (req, res) => {
  try {
    const { callback_query, message } = req.body;
    const io = req.app.get('socketio') || req.app.get('io');

    // 1. አድሚኑ በቴሌግራም አዝራር (Button) ሲጫን
    if (callback_query) {
      await handleTelegramCallback(callback_query, io);
      return res.status(200).send('OK');
    }

    // 2. አድሚኑ /today ወይም /stats ብሎ ሲጽፍ
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