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
const upload = multer({ storage: multer.memoryStorage() });

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

// 2. ሜኑ ሲቀየር/ሲጨመር Database እና Socket ማደሻ
router.post('/menu/update', async (req, res) => {
  try {
    const { items } = req.body;
    
    await MenuItem.deleteMany({});
    const updatedItems = await MenuItem.insertMany(items);

    const socketIo = req.app.get('socketio');
    if (socketIo) {
      socketIo.emit('menuUpdated', updatedItems);
    }

    res.json(updatedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 📦 ORDER ROUTES ---
router.post('/orders', upload.single('image'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);
router.patch('/menu/:id/toggle', toggleAvailability);

export default router;