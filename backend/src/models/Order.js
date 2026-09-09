import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },
  customerName: { type: String, default: '' },
  phone: { type: String, default: '-' },
  tableNo: { type: String, default: '' },
  orderType: { type: String, default: 'Dine In' },
  paymentMethod: { type: String, default: 'Cash' },
  screenshotUrl: { type: String, default: '' },
  items: [
    {
      name: { type: mongoose.Schema.Types.Mixed, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  socketId: { type: String, default: '' }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;