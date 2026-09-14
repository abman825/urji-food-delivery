import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: { type: String }, // 👈 ለ Frontend እንዲመች የተጨመረ
  name: { type: mongoose.Schema.Types.Mixed, required: true }, // { am: '...', om: '...', en: '...' }
  category: { type: String, required: true },
  price: { type: Number, required: false, default: 0 }, // 👈 required: false ተደረገ (Variant ላላቸው እቃዎች)
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  hasVariants: { type: Boolean, default: false },
  variants: [
    {
      id: { type: String },
      name: { type: mongoose.Schema.Types.Mixed },
      price: { type: Number }
    }
  ]
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;