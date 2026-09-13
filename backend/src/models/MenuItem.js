import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.Mixed, required: true }, // { am: '...', en: '...' }
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true }, // 👈 ለዛሬ አልቋል / አለ የሚለውን በቋሚነት ለመያዝ
  hasVariants: { type: Boolean, default: false },
  variants: [
    {
      name: { type: mongoose.Schema.Types.Mixed },
      price: { type: Number }
    }
  ]
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;