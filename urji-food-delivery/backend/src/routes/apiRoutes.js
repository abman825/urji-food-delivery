import express from 'express';
import multer from 'multer';
import { menuItems } from '../data/menu.js';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess 
} from '../controllers/orderController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/menu', (req, res) => res.json(menuItems));
router.post('/orders', upload.single('image'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);

export default router;