import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: mongoose.Schema.Types.Mixed, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'placeholder.png' },
  img: { type: String, default: 'placeholder.png' },
  isAvailable: { type: Boolean, default: true },
  hasVariants: { type: Boolean, default: false },
  variants: [
    {
      id: String,
      name: { type: mongoose.Schema.Types.Mixed },
      price: { type: Number }
    }
  ]
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;