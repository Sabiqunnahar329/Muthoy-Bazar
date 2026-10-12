import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['order', 'stock', 'support', 'system'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
export default mongoose.model('Notification', notificationSchema);
