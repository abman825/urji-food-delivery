import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },
  
  // የደስታኛ መረጃዎች (Customer Info Fields)
  customerName: { type: String, default: '' },
  phone: { type: String, default: '-' },
  tableNo: { type: String, default: '-' },
  address: { type: String, default: '' },
  time: { type: String, default: '' },
  note: { type: String, default: '' },
  lang: { type: String, default: 'am' },

  orderType: { type: String, default: 'Dine-in' }, 
  paymentMethod: { type: String, default: 'Cash' }, 
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Paid', 'Pending Verification'], 
    default: 'Unpaid' 
  },
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
    enum: ['Pending', 'In Progress', 'Preparing', 'Completed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },

  socketId: { type: String, default: '' }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;