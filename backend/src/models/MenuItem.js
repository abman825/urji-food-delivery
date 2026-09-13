import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: String,
  name: mongoose.Schema.Types.Mixed, // Object ወይም String ሊሆን ስለሚችል
  price: Number,
  category: String,
  img: String,
  hasVariants: Boolean,
  variants: Array,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);