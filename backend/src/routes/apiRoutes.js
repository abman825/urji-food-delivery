import express from 'express';
import multer from 'multer';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability 
} from '../controllers/orderController.js';
import MenuItem from '../models/MenuItem.js';

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

// 2. ሜኑ ሲቀየር/ሲጨምር Database እና Socket ማደሻ (Real-time Broadcast)
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
// 'screenshot' እና 'image' ሁለቱንም እንዲቀበል ተደርጓል
router.post('/orders', upload.single('screenshot'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

export default router;