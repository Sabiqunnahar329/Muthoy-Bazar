import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    accessTokenHash: { type: String, index: true, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, enum: ['contact', 'support'], default: 'contact' },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread', index: true },
    reply: { type: String, default: '' },
    repliedAt: Date,
    replyReadAt: Date,
  },
  { timestamps: true }
);
export default mongoose.model('Message', messageSchema);
