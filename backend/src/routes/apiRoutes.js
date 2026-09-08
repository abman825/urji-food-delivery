import express from 'express';
import multer from 'multer';
import { 
  submitOrderFormData, 
  handleChapaSuccess, 
  initiateChapaPayment, 
  toggleAvailability,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();
const upload = multer(); // File Upload Memory storage (ለ Screenshots)

// 1. ነባር ትዕዛዞችን በሙሉ ለማምጣት (ለ Admin Dashboard)
router.get('/orders', getAllOrders);

// 2. አዲስ ትዕዛዝ በስክሪንሾት/በካሽ መላኪያ
router.post('/orders', upload.single('screenshot'), submitOrderFormData);

// 3. Chapa ክፍያ ማስመርመሪያ እና ማሳወቂያ Routes
router.post('/chapa-pay', initiateChapaPayment);
router.post('/chapa-success-notify', handleChapaSuccess);

// 4. የምግብ Availability መቀየሪያ
router.post('/menu-toggle/:id', toggleAvailability);

export default router;