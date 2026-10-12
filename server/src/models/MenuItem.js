import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    location: { type: String, enum: ['header', 'footer'], required: true, index: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export default mongoose.model('MenuItem', menuSchema);
