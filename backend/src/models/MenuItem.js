import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    am: { type: String, required: true },
    om: { type: String },
    en: { type: String }
  },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  hasVariants: { type: Boolean, default: false },
  price: { type: Number }, // variants ካላቸው ምግቦች ጋር እንዲስማማ required: true ተወግዷል
  variants: [
    {
      name: {
        am: String,
        om: String,
        en: String
      },
      price: Number
    }
  ],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;