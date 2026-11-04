import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability,
  getAdminDashboardStats,
  getAllOrders
} from '../controllers/orderController.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { 
  handleTelegramCallback, 
  sendDailyReportToTelegram 
} from '../services/telegramService.js';
import Admin from '../models/Admin.js';
import fs from 'fs';

const router = express.Router();

// 1. Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Multer Storage Config
const storage = multer.diskStorage({});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Admin Password Verification Route
router.post('/admin/verify-password', async (req, res) => {
  try {
    const { password } = req.body;
    let admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      admin = await Admin.create({ username: 'admin', password: '4321' });
    }

    if (admin.password === password) {
      return res.json({ success: true, message: "የእለቱ ፓስወርድ ትክክል ነው" });
    } else {
      return res.json({ success: false, message: "የገባው የእለቱ ፓስወርድ ስህተት ነው" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Password Change Route
router.post('/admin/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let admin = await Admin.findOne({ username: 'admin' });

    if (!admin) {
      admin = await Admin.create({ username: 'admin', password: '123' });
    }

    if (admin.password !== oldPassword) {
      return res.status(400).json({ success: false, message: "የቀድሞው የእለቱ ፓስወርድ ስህተት ነው!" });
    }

    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ success: false, message: "አዲሱ የእለቱ ፓስወርድ ቢያንስ 3 ፊደላት መሆን አለበት!" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "የእለቱ ፓስወርድ በሳካ ሁኔታ ተቀይሯል!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛠️ Image Upload Route (upload.any() በመጠቀም 'image' እና 'screenshot' ሁለቱንም እንዲቀበል ተደርጓል)
router.post('/upload-image', upload.any(), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'payment_screenshots'
    });

    if (file.path) {
      fs.unlink(file.path, () => {});
    }

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Menu Routes
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// Order & Payment Routes (upload.any() በመጠቀም የትኛውንም ፋይል fieldname መቀበል እንዲችል)
router.post('/orders', upload.any(), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

// --- ADMIN DASHBOARD ROUTES ---
router.get('/admin/dashboard-stats', getAdminDashboardStats);
router.get('/admin/orders', getAllOrders);

// Telegram Webhook Route
router.post('/telegram-webhook', async (req, res) => {
  try {
    const { callback_query, message } = req.body;
    const io = req.app.get('socketio');

    if (callback_query) {
      await handleTelegramCallback(callback_query, io);
      return res.status(200).send('OK');
    }

    if (message && message.text) {
      const command = message.text.trim().toLowerCase();

      if (command === '/today' || command === '/stats') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayOrders = await Order.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalOrdersCount = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

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