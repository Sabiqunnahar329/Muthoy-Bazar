import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, enum: ['contact', 'support'], default: 'contact' },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread', index: true },
    reply: { type: String, default: '' },
    repliedAt: Date,
  },
  { timestamps: true }
);
export default mongoose.model('Message', messageSchema);
