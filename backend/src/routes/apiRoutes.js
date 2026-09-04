import express from 'express';
import multer from 'multer';
import { 
  createScreenshotOrder, 
  initiateChapaPayment, 
  handleChapaSuccess,
  toggleAvailability 
} from '../controllers/orderController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. የትዕዛዝ እና የክፍያ Routes
router.post('/orders', upload.single('image'), createScreenshotOrder);
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);

// 2. የምግብ availability (አለ/አልቋል) መቆጣጠሪያ Route
router.patch('/menu/:id/toggle', toggleAvailability);

export default router;